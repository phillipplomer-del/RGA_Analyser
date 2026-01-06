import type { AnalysisResult, ComparisonResult } from '@/types/rga'

// Simplified AI input structure
export interface AIInputData {
  metadata: {
    fileName: string
    date: string
    pressure: string
    chamber: string
    massRange: string
  }
  peaks: Array<{
    mass: number
    gas: string
    intensity: string
    gsiOk: boolean
    cernOk: boolean
  }>
  qualityChecks: Array<{
    name: string
    passed: boolean
    value: string
    threshold: string
  }>
  violations: string[]
  overallStatus: {
    gsi: 'passed' | 'failed'
    cern: 'passed' | 'failed'
  }
}

// Convert analysis result to AI input format
export function formatAnalysisForAI(result: AnalysisResult): AIInputData {
  // Get top 15 peaks by intensity
  const topPeaks = [...result.peaks]
    .sort((a, b) => b.normalizedValue - a.normalizedValue)
    .slice(0, 15)

  // Format peaks with limit status
  const peaks = topPeaks.map(peak => {
    const limitCheck = result.limitChecks.find(l => l.mass === peak.mass)
    return {
      mass: peak.mass,
      gas: peak.gasIdentification,
      intensity: `${(peak.normalizedValue * 100).toFixed(2)}%`,
      gsiOk: limitCheck?.gsiPassed ?? true,
      cernOk: limitCheck?.cernPassed ?? true
    }
  })

  // Format quality checks from array
  const qualityChecks = result.qualityChecks.map(check => ({
    name: check.name,
    passed: check.passed,
    value: formatValue(check.measuredValue),
    threshold: formatValue(check.threshold)
  }))

  // Collect violations
  const violations: string[] = []

  // Check limit violations
  result.limitChecks.forEach(check => {
    if (!check.gsiPassed) {
      const peak = result.peaks.find(p => p.mass === check.mass)
      const gasName = peak?.gasIdentification || `Mass ${check.mass}`
      violations.push(`${gasName}: ${(check.measuredValue * 100).toFixed(2)}% exceeds GSI limit of ${(check.gsiLimit * 100).toFixed(2)}%`)
    }
  })

  result.limitChecks.forEach(check => {
    if (!check.cernPassed && check.gsiPassed) { // Only add CERN if not already GSI violation
      const peak = result.peaks.find(p => p.mass === check.mass)
      const gasName = peak?.gasIdentification || `Mass ${check.mass}`
      violations.push(`${gasName}: ${(check.measuredValue * 100).toFixed(2)}% exceeds CERN limit of ${(check.cernLimit * 100).toFixed(2)}%`)
    }
  })

  // Check quality violations
  result.qualityChecks.forEach(check => {
    if (!check.passed) {
      violations.push(`${check.name}: ${check.description}`)
    }
  })

  // Calculate overall status
  const gsiPassed = result.limitChecks.every(c => c.gsiPassed) &&
    result.qualityChecks.every(c => c.passed)
  const cernPassed = result.limitChecks.every(c => c.cernPassed) &&
    result.qualityChecks.every(c => c.passed)

  return {
    metadata: {
      fileName: result.metadata.sourceFile,
      date: result.metadata.startTime?.toLocaleDateString() || 'Unknown',
      pressure: result.metadata.pressure || 'Unknown',
      chamber: result.metadata.chamberName || 'Unknown',
      massRange: `${result.metadata.firstMass || 0} - ${(result.metadata.firstMass || 0) + (result.metadata.scanWidth || 100)} AMU`
    },
    peaks,
    qualityChecks,
    violations,
    overallStatus: {
      gsi: gsiPassed ? 'passed' : 'failed',
      cern: cernPassed ? 'passed' : 'failed'
    }
  }
}

function formatValue(value: number): string {
  if (!isFinite(value)) return '∞'
  if (value < 0.01) return value.toExponential(2)
  return value.toFixed(2)
}

// Build the prompt for Gemini (token-optimized)
export function buildAnalysisPrompt(
  data: AIInputData,
  language: 'de' | 'en'
): string {
  const langInstructions = language === 'de'
    ? 'Antworte auf Deutsch.'
    : 'Answer in English.'

  const systemContext = `You are a UHV/RGA expert analyzing a Pfeiffer Vacuum Prisma mass spectrum.
${langInstructions}

Use Unicode for formulas (H₂O, CO₂, N₂). Use **bold** and bullets for structure.

Analyze: 1) Overall assessment 2) Gas composition 3) Contamination sources 4) Quality issues 5) Recommendations

Context: H₂ (mass 2) = 100% baseline. GSI/CERN are accelerator limits. Good UHV = H₂ dominant, minimal H₂O/hydrocarbons. Air leak = N₂/O₂ ratio ~4:1.`

  // CSV format for peaks (most token-efficient)
  const peaksCSV = `mass,gas,intensity,gsi_ok,cern_ok
${data.peaks.map(p => `${p.mass},${p.gas},${p.intensity},${p.gsiOk ? 1 : 0},${p.cernOk ? 1 : 0}`).join('\n')}`

  // CSV format for quality checks
  const qualityCSV = `check,passed,value,threshold
${data.qualityChecks.map(q => `${q.name},${q.passed ? 1 : 0},${q.value},${q.threshold}`).join('\n')}`

  const dataSection = `
DATA:
file:${data.metadata.fileName}|date:${data.metadata.date}|pressure:${data.metadata.pressure}|chamber:${data.metadata.chamber}|range:${data.metadata.massRange}
GSI:${data.overallStatus.gsi.toUpperCase()}|CERN:${data.overallStatus.cern.toUpperCase()}

PEAKS (top 15):
${peaksCSV}

QUALITY:
${qualityCSV}

EXCEEDANCES:
${data.violations.length > 0 ? data.violations.join('\n') : 'none'}`

  return `${systemContext}\n${dataSection}\n\nAnalysis:`
}

// Comparison AI input structure
export interface AIComparisonData {
  before: AIInputData
  after: AIInputData
  comparison: {
    overallImprovement: number
    improvedPeaks: number
    worsenedPeaks: number
    totalPeaksCompared: number
    resolvedViolations: number
    newViolations: number
    overallGrade: string
  }
  peakChanges: Array<{
    mass: number
    gas: string
    beforeValue: string
    afterValue: string
    changePercent: number
    improved: boolean
  }>
}

// Convert comparison result to AI input format
export function formatComparisonForAI(
  beforeResult: AnalysisResult,
  afterResult: AnalysisResult,
  comparisonResult: ComparisonResult
): AIComparisonData {
  const before = formatAnalysisForAI(beforeResult)
  const after = formatAnalysisForAI(afterResult)

  // Get significant peak changes (> 5% change)
  const peakChanges = comparisonResult.peakComparisons
    .filter(p => Math.abs(p.percentageChange) > 5)
    .sort((a, b) => Math.abs(b.percentageChange) - Math.abs(a.percentageChange))
    .slice(0, 15)
    .map(p => ({
      mass: p.mass,
      gas: p.gasIdentification,
      beforeValue: `${(p.beforeValue * 100).toFixed(2)}%`,
      afterValue: `${(p.afterValue * 100).toFixed(2)}%`,
      changePercent: p.percentageChange,
      improved: p.percentageChange < 0 // Negative change = improvement (less contamination)
    }))

  return {
    before,
    after,
    comparison: {
      overallImprovement: comparisonResult.overallImprovement,
      improvedPeaks: comparisonResult.summary.improvedPeaks,
      worsenedPeaks: comparisonResult.summary.worsenedPeaks,
      totalPeaksCompared: comparisonResult.summary.totalPeaksCompared,
      resolvedViolations: comparisonResult.summary.resolvedViolations,
      newViolations: comparisonResult.summary.newViolations,
      overallGrade: comparisonResult.summary.overallGrade
    },
    peakChanges
  }
}

// Build the comparison prompt for Gemini (token-optimized)
export function buildComparisonPrompt(
  data: AIComparisonData,
  language: 'de' | 'en'
): string {
  const langInstructions = language === 'de'
    ? 'Antworte auf Deutsch.'
    : 'Answer in English.'

  const systemContext = `You are a UHV/RGA expert comparing BEFORE/AFTER spectra from a bakeout or cleaning.
${langInstructions}

Use Unicode for formulas (H₂O, CO₂, N₂). Use **bold** and bullets for structure.

Analyze: 1) Overall assessment 2) Key changes 3) Bakeout effectiveness 4) Remaining issues 5) Recommendations

Context: H₂ (mass 2) = 100% baseline. Negative change = improvement (less contamination). Successful bakeout reduces H₂O, CO₂, hydrocarbons.`

  // CSV format for peak changes
  const changesCSV = data.peakChanges.length > 0
    ? `mass,gas,before,after,change%,improved
${data.peakChanges.map(p => `${p.mass},${p.gas},${p.beforeValue},${p.afterValue},${p.changePercent.toFixed(1)},${p.improved ? 1 : 0}`).join('\n')}`
    : 'no significant changes'

  // CSV for before peaks (top 10)
  const beforePeaksCSV = `mass,gas,intensity
${data.before.peaks.slice(0, 10).map(p => `${p.mass},${p.gas},${p.intensity}`).join('\n')}`

  // CSV for after peaks (top 10)
  const afterPeaksCSV = `mass,gas,intensity
${data.after.peaks.slice(0, 10).map(p => `${p.mass},${p.gas},${p.intensity}`).join('\n')}`

  const dataSection = `
BEFORE:
file:${data.before.metadata.fileName}|date:${data.before.metadata.date}|pressure:${data.before.metadata.pressure}
GSI:${data.before.overallStatus.gsi.toUpperCase()}|CERN:${data.before.overallStatus.cern.toUpperCase()}

AFTER:
file:${data.after.metadata.fileName}|date:${data.after.metadata.date}|pressure:${data.after.metadata.pressure}
GSI:${data.after.overallStatus.gsi.toUpperCase()}|CERN:${data.after.overallStatus.cern.toUpperCase()}

SUMMARY:
improvement:${data.comparison.overallImprovement.toFixed(1)}%|grade:${data.comparison.overallGrade}|improved_peaks:${data.comparison.improvedPeaks}/${data.comparison.totalPeaksCompared}|worsened_peaks:${data.comparison.worsenedPeaks}/${data.comparison.totalPeaksCompared}|resolved:${data.comparison.resolvedViolations}|new:${data.comparison.newViolations}

CHANGES (|delta|>5%):
${changesCSV}

BEFORE_PEAKS (top 10):
${beforePeaksCSV}

AFTER_PEAKS (top 10):
${afterPeaksCSV}

BEFORE_EXCEEDANCES:
${data.before.violations.length > 0 ? data.before.violations.join('\n') : 'none'}

AFTER_EXCEEDANCES:
${data.after.violations.length > 0 ? data.after.violations.join('\n') : 'none'}`

  return `${systemContext}\n${dataSection}\n\nAnalysis:`
}
