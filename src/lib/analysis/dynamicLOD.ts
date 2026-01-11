/**
 * Dynamic Limit of Detection (LOD) Calculation
 *
 * Implements IUPAC 3σ method for scan-specific detection limits.
 * Uses validated "safe mass" approach to avoid contamination by doubly-charged ions.
 *
 * Scientific Validation:
 * - IUPAC Standard: LOD = μ + 3σ (99.7% confidence)
 * - ThinkSRS Application Note: m/z 21 as "noise floor channel"
 * - Extorr RGA Physics: m/z 7 contaminated by N²⁺, m/z 8 by O²⁺
 *
 * @see NextFeatures/FEATURE_1.9.2_DYNAMIC_LOD_PLAN_gemini.md
 */

/**
 * Result of dynamic LOD calculation
 */
export interface LODResult {
  /** Limit of Detection in mbar (μ + 3σ) */
  lod: number

  /** Mean noise level in mbar */
  mu: number

  /** Standard deviation of noise in mbar */
  sigma: number

  /** Calculation method used */
  method: 'm21_standard' | 'low_mass_fallback' | 'percentile_fallback'

  /** Confidence level in method */
  confidence: 'high' | 'medium' | 'low'

  /** Mass(es) used for noise estimation */
  usedMasses: number[]
}

/**
 * Calculate mean of an array
 */
function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

/**
 * Calculate standard deviation of an array
 */
function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0
  const mu = mean(values)
  const squaredDiffs = values.map(v => (v - mu) ** 2)
  const variance = mean(squaredDiffs)
  return Math.sqrt(variance)
}

/**
 * Calculate dynamic LOD using robust "safe mass" approach
 *
 * Priority Strategy:
 * 1. m/z 21 (Gold Standard - ThinkSRS validated)
 * 2. m/z 5, 9 (Backup - physically empty)
 * 3. Bottom 10% percentile (Fallback for dirty systems)
 *
 * @param peaks - Mass spectrum (mass -> partial pressure in mbar)
 * @returns LOD calculation result
 *
 * @example
 * const peaks = { 2: 1e-9, 18: 5e-8, 21: 2e-11, 28: 3e-8, ... }
 * const lod = calculateDynamicLOD(peaks)
 * // lod.lod = 2e-11 + 3 * σ (calculated from m/z 21)
 * // lod.method = 'm21_standard'
 */
export function calculateDynamicLOD(
  peaks: Record<number, number>
): LODResult {
  // Safe masses according to validated sources
  const primarySafeMass = 21  // Gold Standard (ThinkSRS)
  const secondarySafeMasses = [5, 9]  // Backup (no stable isotopes)

  let noiseValues: number[] = []
  let usedMethod: LODResult['method'] = 'm21_standard'
  let confidence: LODResult['confidence'] = 'high'
  let usedMasses: number[] = []

  // Strategy A: Gold Standard (m/z 21)
  if (peaks[primarySafeMass] !== undefined && peaks[primarySafeMass] > 0) {
    noiseValues = [peaks[primarySafeMass]]
    usedMethod = 'm21_standard'
    confidence = 'high'
    usedMasses = [primarySafeMass]
  }
  // Strategy B: Low Mass Backup (m/z 5, 9)
  else {
    const backupValues = secondarySafeMasses
      .filter(m => peaks[m] !== undefined && peaks[m] > 0)
      .map(m => ({ mass: m, value: peaks[m] }))

    if (backupValues.length > 0) {
      noiseValues = backupValues.map(v => v.value)
      usedMethod = 'low_mass_fallback'
      confidence = 'medium'
      usedMasses = backupValues.map(v => v.mass)
    }
  }

  // Strategy C: Histogram/Percentile Fallback
  if (noiseValues.length === 0) {
    const allEntries = Object.entries(peaks)
      .filter(([_, value]) => value > 0)
      .map(([mass, value]) => ({ mass: Number(mass), value }))
      .sort((a, b) => a.value - b.value)

    if (allEntries.length > 0) {
      const bottom10PercentCount = Math.max(1, Math.ceil(allEntries.length * 0.1))
      const bottom10Percent = allEntries.slice(0, bottom10PercentCount)
      noiseValues = bottom10Percent.map(e => e.value)
      usedMethod = 'percentile_fallback'
      confidence = 'low'
      usedMasses = bottom10Percent.map(e => e.mass)
    }
  }

  // Fallback: no data available
  if (noiseValues.length === 0) {
    return {
      lod: 1e-10,  // Conservative default
      mu: 0,
      sigma: 0,
      method: 'percentile_fallback',
      confidence: 'low',
      usedMasses: []
    }
  }

  // Calculate statistics
  const mu = mean(noiseValues)

  // For single value (m/z 21), estimate sigma conservatively
  // as 10% of the value (typical electronic noise)
  const sigma = noiseValues.length > 1
    ? standardDeviation(noiseValues)
    : mu * 0.1

  // IUPAC 3σ method
  const lod = mu + 3 * sigma

  return {
    lod,
    mu,
    sigma,
    method: usedMethod,
    confidence,
    usedMasses
  }
}

/**
 * Check if a peak is significant (above LOD)
 *
 * @param peakHeight - Peak partial pressure in mbar
 * @param lodResult - LOD calculation result
 * @returns Significance information
 */
export interface SignificanceResult {
  /** Is peak above LOD? */
  isSignificant: boolean

  /** Factor above LOD (e.g., 3.5 means 3.5× LOD) */
  factor: number

  /** Confidence level */
  confidence: 'very_high' | 'high' | 'medium' | 'low' | 'noise'

  /** Human-readable label */
  label: string
}

export function checkPeakSignificance(
  peakHeight: number,
  lodResult: LODResult
): SignificanceResult {
  const factor = peakHeight / lodResult.lod

  let confidence: SignificanceResult['confidence']
  let label: string

  if (factor >= 5) {
    confidence = 'very_high'
    label = 'Highly Significant'
  } else if (factor >= 3) {
    confidence = 'high'
    label = 'Significant'
  } else if (factor >= 1.5) {
    confidence = 'medium'
    label = 'Borderline'
  } else if (factor >= 1) {
    confidence = 'low'
    label = 'Weak Signal'
  } else {
    confidence = 'noise'
    label = 'Below LOD'
  }

  return {
    isSignificant: factor >= 1,
    factor,
    confidence,
    label
  }
}

/**
 * Format LOD value for display
 */
export function formatLOD(lod: number): string {
  return lod.toExponential(2)
}

/**
 * Get color coding for significance level
 */
export function getSignificanceColor(significance: SignificanceResult): string {
  switch (significance.confidence) {
    case 'very_high':
    case 'high':
      return 'success'
    case 'medium':
      return 'warning'
    case 'low':
    case 'noise':
      return 'danger'
  }
}
