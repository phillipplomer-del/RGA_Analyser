import type {
  MeasurementFile,
  ComparisonResult,
  PeakComparison,
  LimitImprovement,
  ComparisonSummary,
  Peak,
  LimitCheck,
} from '@/types/rga'

// Threshold for considering a change significant (5%)
const CHANGE_THRESHOLD = 0.05

/**
 * Compare two RGA spectra (before/after bakeout)
 */
export function compareSpectra(
  before: MeasurementFile,
  after: MeasurementFile
): ComparisonResult {
  const peakComparisons = comparePeaks(
    before.analysisResult.peaks,
    after.analysisResult.peaks
  )

  const limitImprovements = compareLimits(
    before.analysisResult.limitChecks,
    after.analysisResult.limitChecks
  )

  const overallImprovement = calculateOverallImprovement(peakComparisons)
  const summary = generateSummary(peakComparisons, limitImprovements)

  return {
    beforeFile: before,
    afterFile: after,
    peakComparisons,
    limitImprovements,
    overallImprovement,
    summary,
  }
}

/**
 * Compare peaks between two measurements
 */
function comparePeaks(beforePeaks: Peak[], afterPeaks: Peak[]): PeakComparison[] {
  const comparisons: PeakComparison[] = []
  const processedMasses = new Set<number>()

  // Compare peaks that exist in "before"
  for (const beforePeak of beforePeaks) {
    const afterPeak = afterPeaks.find((p) => Math.abs(p.mass - beforePeak.mass) < 0.5)
    processedMasses.add(beforePeak.mass)

    if (afterPeak) {
      const beforeValue = beforePeak.normalizedValue
      const afterValue = afterPeak.normalizedValue
      const percentageChange = beforeValue > 0
        ? ((afterValue - beforeValue) / beforeValue) * 100
        : afterValue > 0 ? 100 : 0

      comparisons.push({
        mass: beforePeak.mass,
        gasIdentification: beforePeak.gasIdentification,
        beforeValue,
        afterValue,
        percentageChange,
        status: getChangeStatus(percentageChange),
      })
    } else {
      // Peak was removed (improved - peak disappeared)
      comparisons.push({
        mass: beforePeak.mass,
        gasIdentification: beforePeak.gasIdentification,
        beforeValue: beforePeak.normalizedValue,
        afterValue: 0,
        percentageChange: -100,
        status: 'removed',
      })
    }
  }

  // Find new peaks in "after" that weren't in "before"
  for (const afterPeak of afterPeaks) {
    const alreadyProcessed = [...processedMasses].some(
      (m) => Math.abs(m - afterPeak.mass) < 0.5
    )
    if (!alreadyProcessed) {
      comparisons.push({
        mass: afterPeak.mass,
        gasIdentification: afterPeak.gasIdentification,
        beforeValue: 0,
        afterValue: afterPeak.normalizedValue,
        percentageChange: 100,
        status: 'new',
      })
    }
  }

  // Sort by mass
  return comparisons.sort((a, b) => a.mass - b.mass)
}

/**
 * Determine the status based on percentage change
 */
function getChangeStatus(percentageChange: number): PeakComparison['status'] {
  if (percentageChange < -CHANGE_THRESHOLD * 100) {
    return 'improved'
  } else if (percentageChange > CHANGE_THRESHOLD * 100) {
    return 'worsened'
  }
  return 'unchanged'
}

/**
 * Compare limit compliance between two measurements
 */
function compareLimits(
  beforeLimits: LimitCheck[],
  afterLimits: LimitCheck[]
): LimitImprovement[] {
  const improvements: LimitImprovement[] = []

  for (const beforeLimit of beforeLimits) {
    const afterLimit = afterLimits.find((l) => l.mass === beforeLimit.mass)
    if (!afterLimit) continue

    // Determine if there was a change in compliance
    const gsiChanged = beforeLimit.gsiPassed !== afterLimit.gsiPassed
    const cernChanged = beforeLimit.cernPassed !== afterLimit.cernPassed

    if (gsiChanged || cernChanged) {
      let status: LimitImprovement['status'] = 'unchanged'

      // Newly passing = was failing, now passing
      if ((!beforeLimit.gsiPassed && afterLimit.gsiPassed) ||
          (!beforeLimit.cernPassed && afterLimit.cernPassed)) {
        status = 'newly_passing'
      }
      // Newly failing = was passing, now failing
      if ((beforeLimit.gsiPassed && !afterLimit.gsiPassed) ||
          (beforeLimit.cernPassed && !afterLimit.cernPassed)) {
        status = 'newly_failing'
      }

      improvements.push({
        mass: beforeLimit.mass,
        beforeGSIPassed: beforeLimit.gsiPassed,
        afterGSIPassed: afterLimit.gsiPassed,
        beforeCERNPassed: beforeLimit.cernPassed,
        afterCERNPassed: afterLimit.cernPassed,
        status,
      })
    }
  }

  return improvements
}

/**
 * Calculate overall improvement percentage
 * Based on weighted sum of peak changes (heavier masses have more impact)
 */
function calculateOverallImprovement(comparisons: PeakComparison[]): number {
  if (comparisons.length === 0) return 0

  let totalWeight = 0
  let weightedImprovement = 0

  for (const comp of comparisons) {
    // Weight by the larger of the two values (more significant peaks matter more)
    const weight = Math.max(comp.beforeValue, comp.afterValue)
    totalWeight += weight

    // Improvement is negative change (reduction)
    const improvement = -comp.percentageChange
    weightedImprovement += improvement * weight
  }

  return totalWeight > 0 ? weightedImprovement / totalWeight : 0
}

/**
 * Generate comparison summary
 */
function generateSummary(
  comparisons: PeakComparison[],
  limitImprovements: LimitImprovement[]
): ComparisonSummary {
  const improvedPeaks = comparisons.filter(
    (c) => c.status === 'improved' || c.status === 'removed'
  ).length
  const worsenedPeaks = comparisons.filter(
    (c) => c.status === 'worsened' || c.status === 'new'
  ).length
  const unchangedPeaks = comparisons.filter((c) => c.status === 'unchanged').length

  const resolvedViolations = limitImprovements.filter(
    (l) => l.status === 'newly_passing'
  ).length
  const newViolations = limitImprovements.filter(
    (l) => l.status === 'newly_failing'
  ).length

  // Determine overall grade
  let overallGrade: ComparisonSummary['overallGrade']
  const improvementRatio = improvedPeaks / Math.max(comparisons.length, 1)
  const worsenedRatio = worsenedPeaks / Math.max(comparisons.length, 1)

  if (worsenedRatio > 0.3 || newViolations > 2) {
    overallGrade = 'poor'
  } else if (worsenedRatio > 0.1 || newViolations > 0) {
    overallGrade = 'mixed'
  } else if (improvementRatio > 0.5 && resolvedViolations > 0) {
    overallGrade = 'excellent'
  } else {
    overallGrade = 'good'
  }

  return {
    totalPeaksCompared: comparisons.length,
    improvedPeaks,
    worsenedPeaks,
    unchangedPeaks,
    resolvedViolations,
    newViolations,
    overallGrade,
  }
}

/**
 * Format improvement percentage for display
 */
export function formatImprovement(percentage: number): string {
  const sign = percentage > 0 ? '+' : ''
  return `${sign}${percentage.toFixed(1)}%`
}

/**
 * Get color class based on change status
 */
export function getStatusColor(status: PeakComparison['status']): string {
  switch (status) {
    case 'improved':
    case 'removed':
      return 'text-state-success'
    case 'worsened':
    case 'new':
      return 'text-state-danger'
    default:
      return 'text-text-secondary'
  }
}

/**
 * Get grade color class
 */
export function getGradeColor(grade: ComparisonSummary['overallGrade']): string {
  switch (grade) {
    case 'excellent':
      return 'text-state-success'
    case 'good':
      return 'text-aqua-500'
    case 'mixed':
      return 'text-state-warning'
    case 'poor':
      return 'text-state-danger'
  }
}
