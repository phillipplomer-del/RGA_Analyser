/**
 * Rate-of-Rise Analysis Functions
 * Phase detection, linear regression, leak rate calculation, classification
 */

import type {
  RateOfRiseData,
  RateOfRiseAnalysis,
  PressureDataPoint,
  BaselinePhase,
  RisePhase,
  LinearFitResult,
  LeakRateResult,
  RoRClassification,
  RoRClassificationType,
  LimitCheckResult,
} from '@/types/rateOfRise'
import { formatScientific } from './parser'

// ============================================================================
// Main Analysis Function
// ============================================================================

/**
 * Perform complete Rate-of-Rise analysis
 */
export function analyzeRateOfRise(
  data: RateOfRiseData,
  volume?: number | null,
  limit?: number | null,
  limitSource?: string
): RateOfRiseAnalysis {
  // 1. Detect phases (baseline and rise)
  const { baselinePhase, risePhase, transitionIndex } = detectPhases(
    data.dataPoints
  )

  // 2. Perform linear fit on rise phase
  const linearFit = fitLinear(
    data.dataPoints,
    risePhase.startIndex,
    risePhase.endIndex
  )

  const dpdt = linearFit.slope
  const dpdtFormatted = formatScientific(dpdt, 'mbar/s')

  // 3. Calculate leak rate if volume provided
  let leakRate: LeakRateResult | undefined
  if (volume && volume > 0) {
    leakRate = calculateLeakRate(dpdt, volume)
  }

  // 4. Classify the rise type
  const classification = classifyRiseType(
    data.dataPoints,
    linearFit,
    risePhase
  )

  // 5. Check against limit if provided
  let limitCheck: LimitCheckResult | undefined
  if (limit && limit > 0 && leakRate) {
    limitCheck = checkLimit(leakRate.Q, limit, limitSource || 'Custom')
  }

  return {
    baselinePhase,
    risePhase,
    transitionIndex,
    dpdt,
    dpdtFormatted,
    linearFit,
    leakRate,
    classification,
    limitCheck,
  }
}

// ============================================================================
// Phase Detection
// ============================================================================

interface PhaseDetectionResult {
  baselinePhase: BaselinePhase
  risePhase: RisePhase
  transitionIndex: number
}

/**
 * Automatically detect baseline and rise phases
 *
 * Algorithm:
 * 1. Sliding window for local statistics
 * 2. Baseline = phase with low variance
 * 3. Transition = point where slope > threshold
 */
export function detectPhases(
  dataPoints: PressureDataPoint[]
): PhaseDetectionResult {
  const pressures = dataPoints.map((p) => p.pressure1)
  const n = pressures.length

  // Parameters
  const windowSize = Math.min(20, Math.floor(n / 10))

  // 1. Calculate local statistics
  const localStats: { mean: number; std: number; slope: number }[] = []

  for (let i = 0; i < n - windowSize; i++) {
    const window = pressures.slice(i, i + windowSize)
    const times = dataPoints
      .slice(i, i + windowSize)
      .map((p) => p.relativeTimeS)

    const mean = window.reduce((a, b) => a + b, 0) / windowSize
    const variance =
      window.reduce((a, b) => a + (b - mean) ** 2, 0) / windowSize
    const std = Math.sqrt(variance)
    const slope = linearRegressionSlope(times, window)

    localStats.push({ mean, std, slope })
  }

  // 2. Calculate baseline statistics (first 10% of data)
  const baselineWindowSize = Math.max(5, Math.floor(n * 0.1))
  const baselineValues = pressures.slice(0, baselineWindowSize)
  const baselineMean =
    baselineValues.reduce((a, b) => a + b, 0) / baselineWindowSize
  const baselineStd = Math.sqrt(
    baselineValues.reduce((a, b) => a + (b - baselineMean) ** 2, 0) /
      baselineWindowSize
  )

  // 3. Find transition point
  // Criteria: pressure rises significantly above baseline
  let transitionIndex = Math.floor(n * 0.1) // Default: 10%

  // Calculate threshold based on baseline noise
  const significantRise = baselineMean * 1.5 // 50% above baseline
  const minSlopeThreshold = baselineMean * 1e-4 // Relative slope threshold

  for (let i = baselineWindowSize; i < localStats.length; i++) {
    const stat = localStats[i]

    // Check if we've risen significantly above baseline
    if (stat.mean > significantRise || stat.slope > minSlopeThreshold) {
      transitionIndex = i
      break
    }
  }

  // 4. Refine baseline end (last stable point before transition)
  let baselineEnd = Math.max(0, transitionIndex - windowSize)
  for (let i = transitionIndex - 1; i > windowSize; i--) {
    if (
      localStats[i] &&
      localStats[i].std < baselineStd * 3 &&
      pressures[i] < baselineMean * 1.2
    ) {
      baselineEnd = i
      break
    }
  }

  // 5. Build phase info
  const baselinePhase: BaselinePhase = {
    startIndex: 0,
    endIndex: baselineEnd,
    startPressure: pressures[0],
    endPressure: pressures[baselineEnd],
    duration: dataPoints[baselineEnd].relativeTimeS,
    meanPressure: calculateMean(pressures.slice(0, baselineEnd + 1)),
    stdDev: calculateStdDev(pressures.slice(0, baselineEnd + 1)),
  }

  const risePhase: RisePhase = {
    startIndex: transitionIndex,
    endIndex: n - 1,
    startPressure: pressures[transitionIndex],
    endPressure: pressures[n - 1],
    duration:
      dataPoints[n - 1].relativeTimeS -
      dataPoints[transitionIndex].relativeTimeS,
  }

  return { baselinePhase, risePhase, transitionIndex }
}

// ============================================================================
// Linear Regression
// ============================================================================

/**
 * Linear regression: p(t) = p₀ + (dp/dt) × t
 */
export function fitLinear(
  dataPoints: PressureDataPoint[],
  startIndex: number,
  endIndex: number
): LinearFitResult {
  const subset = dataPoints.slice(startIndex, endIndex + 1)
  const n = subset.length

  if (n < 3) {
    throw new Error(
      'Mindestens 3 Datenpunkte für linearen Fit erforderlich'
    )
  }

  const x = subset.map((p) => p.relativeTimeS)
  const y = subset.map((p) => p.pressure1)

  // Calculate sums
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)

  const meanX = sumX / n
  const meanY = sumY / n

  // Slope and intercept
  const denominator = n * sumX2 - sumX * sumX
  if (Math.abs(denominator) < 1e-20) {
    // Avoid division by zero
    return {
      slope: 0,
      intercept: meanY,
      r2: 0,
      residualStdDev: 0,
      dataPoints: n,
    }
  }

  const slope = (n * sumXY - sumX * sumY) / denominator
  const intercept = meanY - slope * meanX

  // R² (coefficient of determination)
  const ssRes = y.reduce((sum, yi, i) => {
    const predicted = intercept + slope * x[i]
    return sum + (yi - predicted) ** 2
  }, 0)

  const ssTot = y.reduce((sum, yi) => sum + (yi - meanY) ** 2, 0)
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0

  // Residual standard deviation
  const residualStdDev = n > 2 ? Math.sqrt(ssRes / (n - 2)) : 0

  return {
    slope,
    intercept,
    r2: Math.max(0, Math.min(1, r2)), // Clamp to [0, 1]
    residualStdDev,
    dataPoints: n,
  }
}

/**
 * Simple linear regression slope only
 */
function linearRegressionSlope(x: number[], y: number[]): number {
  const n = x.length
  if (n < 2) return 0

  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)

  const denominator = n * sumX2 - sumX * sumX
  if (Math.abs(denominator) < 1e-20) return 0

  return (n * sumXY - sumX * sumY) / denominator
}

// ============================================================================
// Leak Rate Calculation
// ============================================================================

/**
 * Calculate leak rate from dp/dt and volume
 * Q = V × dp/dt
 */
export function calculateLeakRate(
  dpdt: number,
  volumeLiters: number
): LeakRateResult {
  const Q = volumeLiters * dpdt

  // Convert to SI (Pa·m³/s)
  // 1 mbar·L = 0.1 Pa·m³
  const Q_Pa = Q * 0.1

  // Equivalent He leak rate
  // He diffuses ~2.7× faster than air (√(M_air/M_He) ≈ √(29/4) ≈ 2.7)
  const equivalentHeLeak = Q * 2.7

  return {
    volume: volumeLiters,
    Q,
    QFormatted: formatScientific(Q, 'mbar·L/s'),
    Q_Pa,
    Q_PaFormatted: formatScientific(Q_Pa, 'Pa·m³/s'),
    equivalentHeLeak,
  }
}

// ============================================================================
// Classification
// ============================================================================

/**
 * Classify the rise type based on pattern analysis
 *
 * Real leak: Linear rise (R² > 0.99), constant dp/dt
 * Virtual leak: Exponential approach (1-e^(-t/τ)), trapped volume equilibration
 *   - Strong negative curvature (convex residuals)
 * Outgassing: Logarithmic rise (ln(t)) from power-law source (Q ∝ t^(-n))
 *   - Weak negative curvature, material desorption
 * Mixed: Combination of leak + outgassing
 *
 * Fixed: Models were swapped (Gemini-3-Pro Bug Report 2026-01-10)
 */
export function classifyRiseType(
  dataPoints: PressureDataPoint[],
  linearFit: LinearFitResult,
  risePhase: RisePhase
): RoRClassification {
  const evidence: string[] = []
  const evidenceEn: string[] = []
  const recommendations: string[] = []
  const recommendationsEn: string[] = []

  const subset = dataPoints.slice(risePhase.startIndex, risePhase.endIndex + 1)
  const r2 = linearFit.r2

  evidence.push(`Linearer Fit R² = ${(r2 * 100).toFixed(1)}%`)
  evidenceEn.push(`Linear fit R² = ${(r2 * 100).toFixed(1)}%`)

  // Test: Slope change over time (compare first and second half)
  const midPoint = Math.floor(subset.length / 2)
  const firstHalf = subset.slice(0, midPoint)
  const secondHalf = subset.slice(midPoint)

  const slope1 = linearRegressionSlope(
    firstHalf.map((p) => p.relativeTimeS),
    firstHalf.map((p) => p.pressure1)
  )
  const slope2 = linearRegressionSlope(
    secondHalf.map((p) => p.relativeTimeS),
    secondHalf.map((p) => p.pressure1)
  )

  const slopeRatio = slope1 !== 0 ? slope2 / slope1 : 1

  evidence.push(
    `Steigungsverhältnis (2. Hälfte / 1. Hälfte) = ${slopeRatio.toFixed(2)}`
  )
  evidenceEn.push(`Slope ratio (2nd half / 1st half) = ${slopeRatio.toFixed(2)}`)

  // Classification logic
  let type: RoRClassificationType
  let confidence: number
  let description: string
  let descriptionEn: string

  if (r2 > 0.995 && slopeRatio > 0.9 && slopeRatio < 1.1) {
    // Very linear → Real leak
    type = 'real_leak'
    confidence = Math.min(r2, 0.95)
    description = 'Konstanter linearer Druckanstieg deutet auf reales Leck hin'
    descriptionEn = 'Constant linear pressure rise indicates real leak'
    recommendations.push('Lecksuche mit He-Lecksuchgerät durchführen')
    recommendations.push('Alle Flansche, Ventile und Durchführungen prüfen')
    recommendationsEn.push('Perform leak search with He leak detector')
    recommendationsEn.push('Check all flanges, valves and feedthroughs')
  } else if (slopeRatio < 0.7) {
    // Slope decreasing → Virtual leak or outgassing
    const residualTrend = analyzeResidualTrend(subset, linearFit)

    if (residualTrend === 'convex') {
      type = 'virtual_leak'
      confidence = 0.7
      description =
        'Exponentieller Druckanstieg (schnelle Sättigung) deutet auf virtuelles Leck hin'
      descriptionEn =
        'Exponential pressure rise (fast saturation) indicates virtual leak'
      recommendations.push(
        'Prüfen auf eingeschlossene Volumina (Blindbohrungen, O-Ring-Nuten)'
      )
      recommendations.push('He-Lecktest sollte negativ sein')
      recommendationsEn.push(
        'Check for trapped volumes (blind holes, O-ring grooves)'
      )
      recommendationsEn.push('He leak test should be negative')
    } else {
      type = 'outgassing'
      confidence = 0.6
      description = 'Logarithmischer Druckanstieg (langsame Sättigung) deutet auf Ausgasung hin'
      descriptionEn = 'Logarithmic pressure rise (slow saturation) indicates outgassing'
      recommendations.push('System ausheizen')
      recommendations.push(
        'Neue Komponenten identifizieren (O-Ringe, Kabel, etc.)'
      )
      recommendationsEn.push('Bake out the system')
      recommendationsEn.push(
        'Identify new components (O-rings, cables, etc.)'
      )
    }
  } else if (r2 < 0.95 && slopeRatio > 0.8) {
    // Moderately linear with noise → Mixed or unknown
    type = 'mixed'
    confidence = 0.5
    description = 'Mischung aus Leck und Ausgasung möglich'
    descriptionEn = 'Mixture of leak and outgassing possible'
    recommendations.push('Längere Messzeit für bessere Klassifikation')
    recommendations.push('Nach Bakeout erneut messen')
    recommendationsEn.push('Longer measurement time for better classification')
    recommendationsEn.push('Measure again after bakeout')
  } else {
    type = 'unknown'
    confidence = 0.3
    description = 'Keine eindeutige Klassifikation möglich'
    descriptionEn = 'No clear classification possible'
    recommendations.push('Messung mit längerer Dauer wiederholen')
    recommendations.push('Sensordrift ausschließen')
    recommendationsEn.push('Repeat measurement with longer duration')
    recommendationsEn.push('Rule out sensor drift')
  }

  return {
    type,
    confidence,
    description,
    descriptionEn,
    evidence,
    evidenceEn,
    recommendations,
    recommendationsEn,
  }
}

/**
 * Analyze residual trend for classification
 */
function analyzeResidualTrend(
  points: PressureDataPoint[],
  fit: LinearFitResult
): 'convex' | 'concave' | 'random' {
  // Calculate residuals
  const residuals = points.map((p) => {
    const predicted = fit.intercept + fit.slope * p.relativeTimeS
    return p.pressure1 - predicted
  })

  const n = residuals.length
  const mid = Math.floor(n / 2)

  const firstHalfMean =
    residuals.slice(0, mid).reduce((a, b) => a + b, 0) / mid
  const secondHalfMean =
    residuals.slice(mid).reduce((a, b) => a + b, 0) / (n - mid)
  const middleStart = Math.floor(n * 0.25)
  const middleEnd = Math.floor(n * 0.75)
  const middleMean =
    residuals.slice(middleStart, middleEnd).reduce((a, b) => a + b, 0) /
    (middleEnd - middleStart)

  // Convex: middle below line (negative residuals in middle)
  if (middleMean < firstHalfMean && middleMean < secondHalfMean) {
    return 'convex'
  }

  // Concave: middle above line
  if (middleMean > firstHalfMean && middleMean > secondHalfMean) {
    return 'concave'
  }

  return 'random'
}

// ============================================================================
// Limit Check
// ============================================================================

/**
 * Check leak rate against a limit
 */
export function checkLimit(
  Q: number,
  limitValue: number,
  limitSource: string
): LimitCheckResult {
  const passed = Q <= limitValue
  const margin = limitValue > 0 ? Q / limitValue : Infinity

  return {
    limit: limitValue,
    limitSource,
    passed,
    margin,
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function calculateMean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

function calculateStdDev(values: number[]): number {
  if (values.length < 2) return 0
  const mean = calculateMean(values)
  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}
