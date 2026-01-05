import type { SpecificationType, NormalizedData, LimitCheck } from '@/types/rga'

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
