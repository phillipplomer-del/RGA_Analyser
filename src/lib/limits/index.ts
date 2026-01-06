import type { SpecificationType, NormalizedData, LimitCheck, LimitProfile, ProfileLimitCheck } from '@/types/rga'

/**
 * GSI Spezifikation 7.3e (2019)
 * Grenzwerte normalisiert auf H₂ = 1
 */
export function getGSILimit(mass: number): number {
  if (mass <= 12) return 1.0
  if (mass > 12 && mass < 19.5) return 0.1
  if (mass > 27.5 && mass < 28.5) return 0.1 // N₂/CO erlaubt
  if (mass > 43.5 && mass < 44.75) return 0.1 // CO₂ erlaubt
  if (mass > 45) return 0.001
  return 0.02
}

/**
 * CERN Spezifikation 3076004 (2024)
 * Strengere Grenzwerte
 */
export function getCERNLimit(mass: number): number {
  if (mass <= 3) return 1.0 // H₂ Region
  if (mass > 3 && mass < 20.5) return 0.1 // H₂O Region
  if (mass > 20.4 && mass < 27.5) return 0.01 // Zwischen H₂O und N₂
  if (mass > 27.4 && mass < 28.5) return 0.1 // N₂/CO erlaubt
  if (mass > 28.45 && mass < 32.5) return 0.01 // Zwischen N₂ und O₂
  if (mass > 32.4 && mass < 43.5) return 0.002 // Kohlenwasserstoff-Region
  if (mass > 43.4 && mass < 45.1) return 0.05 // CO₂ erlaubt
  if (mass > 45) return 0.0001 // Schwere Kohlenwasserstoffe
  return 1.0
}

export function getLimit(spec: SpecificationType, mass: number): number {
  return spec === 'GSI' ? getGSILimit(mass) : getCERNLimit(mass)
}

export function checkLimits(normalizedData: NormalizedData[]): LimitCheck[] {
  const checks: LimitCheck[] = []

  // Check at integer masses (0-100)
  for (let mass = 0; mass <= 100; mass++) {
    const point = normalizedData.find((p) => Math.abs(p.mass - mass) < 0.1)
    if (!point) continue

    const gsiLimit = getGSILimit(mass)
    const cernLimit = getCERNLimit(mass)

    checks.push({
      mass,
      measuredValue: point.normalizedToH2,
      gsiLimit,
      cernLimit,
      gsiPassed: point.normalizedToH2 <= gsiLimit,
      cernPassed: point.normalizedToH2 <= cernLimit,
    })
  }

  return checks
}

export function generateLimitCurve(
  spec: SpecificationType,
  massRange: [number, number] = [0, 100]
): { mass: number; limit: number }[] {
  const curve: { mass: number; limit: number }[] = []
  const getLimitFn = spec === 'GSI' ? getGSILimit : getCERNLimit

  for (let mass = massRange[0]; mass <= massRange[1]; mass += 0.1) {
    curve.push({ mass, limit: getLimitFn(mass) })
  }

  return curve
}

// ============================================
// Profile-based Limit Functions
// ============================================

/**
 * Get limit value from a LimitProfile at a specific mass
 */
export function getLimitFromProfile(profile: LimitProfile, mass: number): number {
  for (const range of profile.ranges) {
    if (mass >= range.massMin && mass < range.massMax) {
      return range.limit
    }
  }
  // Check if mass equals the last massMax (edge case)
  const lastRange = profile.ranges[profile.ranges.length - 1]
  if (lastRange && mass === lastRange.massMax) {
    return lastRange.limit
  }
  return Infinity // No limit defined = always passes
}

/**
 * Generate limit curve data for chart visualization from a profile
 */
export function generateProfileLimitCurve(
  profile: LimitProfile,
  massRange: [number, number] = [0, 100],
  step: number = 0.1
): Array<{ mass: number; limit: number }> {
  const curve: Array<{ mass: number; limit: number }> = []

  for (let mass = massRange[0]; mass <= massRange[1]; mass += step) {
    const limit = getLimitFromProfile(profile, mass)
    if (limit !== Infinity) {
      curve.push({ mass, limit })
    }
  }

  return curve
}

/**
 * Check normalized data against a specific limit profile
 */
export function checkLimitsAgainstProfile(
  normalizedData: NormalizedData[],
  profile: LimitProfile
): ProfileLimitCheck[] {
  const checks: ProfileLimitCheck[] = []

  // Check at integer masses (0-100)
  for (let mass = 0; mass <= 100; mass++) {
    const point = normalizedData.find((p) => Math.abs(p.mass - mass) < 0.1)
    if (!point) continue

    const limit = getLimitFromProfile(profile, mass)

    checks.push({
      mass,
      measuredValue: point.normalizedToH2,
      limit,
      passed: limit === Infinity || point.normalizedToH2 <= limit,
      profileId: profile.id,
    })
  }

  return checks
}

/**
 * Check if all limits pass for a given profile
 */
export function checkProfilePasses(
  normalizedData: NormalizedData[],
  profile: LimitProfile
): boolean {
  const checks = checkLimitsAgainstProfile(normalizedData, profile)
  return checks.every((check) => check.passed)
}

/**
 * Get all violations for a profile
 */
export function getProfileViolations(
  normalizedData: NormalizedData[],
  profile: LimitProfile
): ProfileLimitCheck[] {
  const checks = checkLimitsAgainstProfile(normalizedData, profile)
  return checks.filter((check) => !check.passed)
}
