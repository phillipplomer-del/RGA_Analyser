/**
 * RGA Knowledge Module
 *
 * Konsolidierte Wissensdatenbank für RGA-Spektrenanalyse
 * Basierend auf: CERN, Pfeiffer, MKS, NIST, Hiden Analytical
 */

// Re-export all types and data
export {
  type GasSpecies,
  type GasCategory,
  GAS_LIBRARY,
  GAS_BY_KEY,
  GASES_BY_MAIN_MASS,
  findGasesWithPeakAtMass,
  getScaledPattern
} from './gasLibrary'

export {
  type MassAssignment,
  type IsotopeInfo,
  type DiagnosticValue,
  MASS_REFERENCE,
  MASS_BY_NUMBER,
  getMassAssignment,
  getCriticalMasses,
  getMassesForGas
} from './massReference'

import { GAS_LIBRARY, type GasSpecies } from './gasLibrary'
import { MASS_REFERENCE, type MassAssignment } from './massReference'

// ============================================
// Sensitivitätsfaktoren
// ============================================

/**
 * Relative Sensitivitätsfaktoren (RSF) bezogen auf N₂ = 1.0
 * Für quantitative Partialdruck-Berechnung
 */
export const SENSITIVITY_FACTORS: Record<string, number> = {
  H2: 0.44,
  He: 0.14,
  Ne: 0.23,
  N2: 1.0,
  O2: 0.86,
  Ar: 1.2,
  CO: 1.05,
  CO2: 1.4,
  H2O: 0.9,
  CH4: 1.6,
  Kr: 1.7,
  Xe: 3.0
}

// ============================================
// Isotopen-Verhältnisse
// ============================================

/**
 * Natürliche Isotopenverhältnisse für diagnostische Zwecke
 */
export const ISOTOPE_RATIOS = {
  // Argon: 40/36 sollte ~300 sein
  argon: {
    primary: 40,
    isotope: 36,
    expectedRatio: 293, // 99.6% / 0.34%
    tolerance: 50
  },
  // Chlor: 35/37 sollte ~3 sein
  chlorine: {
    primary: 35,
    isotope: 37,
    expectedRatio: 3.1, // 75.8% / 24.2%
    tolerance: 0.3
  },
  // Kohlenstoff: M/(M+1) für organische Moleküle
  carbon13: {
    abundancePercent: 1.1
  }
}

// ============================================
// Diagnose-relevante Massen-Gruppen
// ============================================

/**
 * Diagnostische Massengruppen für Pattern-Matching
 */
export const DIAGNOSTIC_MASS_GROUPS = {
  // Luftleck-Signatur
  airLeak: {
    masses: [28, 32, 40],
    description: 'N₂, O₂, Ar - Atmosphärische Gase',
    expectedRatios: {
      n2_o2: { min: 3.0, max: 4.5 },  // N₂/O₂ ≈ 3.7 in Luft
      n2_ar: { min: 60, max: 100 }    // N₂/Ar ≈ 84 in Luft
    }
  },

  // Öl-Rückströmung (Mineralöl)
  oilBackstreaming: {
    masses: [41, 43, 55, 57, 69, 71, 83, 85],
    description: 'Periodisches Δ14 amu Muster - Alkyl-Kationen',
    pattern: 'Δ14 amu'
  },

  // Fomblin/PFPE (fluoriertes Öl)
  fomblin: {
    masses: [69, 20, 31, 47, 50],
    description: 'CF₃⁺ dominant ohne Alkyl-Peaks',
    antiPattern: [41, 43, 57] // Diese sollten NICHT vorhanden sein
  },

  // Wasser-Signatur
  water: {
    masses: [18, 17, 16],
    description: 'H₂O⁺, OH⁺, O⁺',
    expectedRatios: {
      h2o_oh: { min: 3.5, max: 5.0 }  // 18/17 ≈ 4.3
    }
  },

  // Lösemittel
  solvents: {
    acetone: { masses: [43, 58], description: 'Aceton: Base 43, Parent 58' },
    ipa: { masses: [45, 43, 27], description: 'Isopropanol: Base 45' },
    ethanol: { masses: [31, 45, 46], description: 'Ethanol: Base 31, Parent 46' },
    methanol: { masses: [31, 32, 29], description: 'Methanol: Base 31, Parent 32' }
  },

  // N₂ vs CO Unterscheidung
  n2VsCO: {
    n2_fragment: 14,  // N⁺ bei N₂ ≈ 7%
    co_fragment: 12,  // C⁺ bei CO ≈ 5%
    description: 'N₂ hat m/z 14 Fragment, CO hat m/z 12 Fragment'
  },

  // ESD-Artefakte
  esdArtifacts: {
    masses: [16, 19, 35],
    description: 'O⁺, F⁺, Cl⁺ ohne entsprechende Quellen'
  },

  // Silikon/PDMS
  silicone: {
    masses: [73, 147, 45, 59],
    description: 'Trimethylsilyl-Fragmente'
  }
}

// ============================================
// Hilfsfunktionen
// ============================================

/**
 * Berechnet den korrigierten Partialdruck unter Berücksichtigung der Sensitivität
 */
export function calculatePartialPressure(
  ionCurrent: number,
  gasKey: string,
  referenceGas: string = 'N2',
  referencePressure: number = 1
): number {
  const gasSensitivity = SENSITIVITY_FACTORS[gasKey] || 1.0
  const refSensitivity = SENSITIVITY_FACTORS[referenceGas] || 1.0
  return (ionCurrent * refSensitivity) / gasSensitivity * referencePressure
}

/**
 * Identifiziert mögliche Gase für einen Peak bei einer bestimmten Masse
 */
export function identifyPeakSources(mass: number): {
  gases: Array<{ gas: GasSpecies; isMainPeak: boolean; intensity: number }>
  assignment: MassAssignment | undefined
} {
  const assignment = MASS_REFERENCE.find(m => m.mass === Math.round(mass))

  const gases = GAS_LIBRARY
    .filter(gas => gas.crackingPattern[Math.round(mass)] !== undefined)
    .map(gas => ({
      gas,
      isMainPeak: gas.mainMass === Math.round(mass),
      intensity: gas.crackingPattern[Math.round(mass)]
    }))
    .sort((a, b) => {
      // Hauptpeaks zuerst, dann nach Intensität
      if (a.isMainPeak !== b.isMainPeak) return a.isMainPeak ? -1 : 1
      return b.intensity - a.intensity
    })

  return { gases, assignment }
}

/**
 * Prüft ob ein Δ14 amu Muster (Öl-Signatur) vorhanden ist
 */
export function checkOilPattern(
  peakIntensities: Record<number, number>,
  threshold: number = 0.01
): { detected: boolean; masses: number[]; confidence: number } {
  const oilMasses = [41, 55, 69, 83] // Δ14 Serie
  const detected = oilMasses.filter(m => (peakIntensities[m] || 0) > threshold)

  return {
    detected: detected.length >= 3,
    masses: detected,
    confidence: detected.length / oilMasses.length
  }
}

/**
 * Unterscheidet N₂ von CO basierend auf Fragmenten
 */
export function distinguishN2vsCO(
  peak28: number,
  peak14: number,
  peak12: number
): { dominant: 'N2' | 'CO' | 'mixed'; n2Fraction: number; coFraction: number } {
  if (peak28 === 0) return { dominant: 'mixed', n2Fraction: 0, coFraction: 0 }

  const ratio14 = peak14 / peak28 // N₂ erwartet ~0.07
  const ratio12 = peak12 / peak28 // CO erwartet ~0.045

  // Einfache Heuristik
  const n2Signal = ratio14 / 0.072  // Normiert auf N₂-typisches Verhältnis
  const coSignal = ratio12 / 0.045  // Normiert auf CO-typisches Verhältnis

  const total = n2Signal + coSignal
  if (total === 0) return { dominant: 'mixed', n2Fraction: 0.5, coFraction: 0.5 }

  const n2Fraction = n2Signal / total
  const coFraction = coSignal / total

  return {
    dominant: n2Fraction > 0.7 ? 'N2' : coFraction > 0.7 ? 'CO' : 'mixed',
    n2Fraction,
    coFraction
  }
}

/**
 * Prüft Luftleck-Signatur
 */
export function checkAirLeakSignature(
  peak28: number,
  peak32: number,
  peak40: number
): { isAirLeak: boolean; confidence: number; ratios: { n2_o2: number; n2_ar: number } } {
  if (peak32 === 0 || peak28 === 0) {
    return { isAirLeak: false, confidence: 0, ratios: { n2_o2: 0, n2_ar: 0 } }
  }

  const n2_o2 = peak28 / peak32
  const n2_ar = peak40 > 0 ? peak28 / peak40 : 0

  // Luft: N₂/O₂ ≈ 3.7, N₂/Ar ≈ 84
  const n2o2_ok = n2_o2 >= 3.0 && n2_o2 <= 4.5
  const n2ar_ok = n2_ar >= 60 && n2_ar <= 100

  let confidence = 0
  if (n2o2_ok) confidence += 0.5
  if (n2ar_ok && peak40 > 0) confidence += 0.4
  if (peak40 > 0) confidence += 0.1 // Ar vorhanden

  return {
    isAirLeak: confidence >= 0.5,
    confidence,
    ratios: { n2_o2, n2_ar }
  }
}

/**
 * Klassifiziert den Systemzustand basierend auf dominanten Peaks
 */
export function classifySystemState(
  peak2: number,   // H₂
  peak18: number,  // H₂O
  peak28: number   // N₂/CO
): 'unbaked' | 'baked' | 'contaminated' | 'air_leak' {
  const total = peak2 + peak18 + peak28

  if (total === 0) return 'unbaked'

  const h2Fraction = peak2 / total
  const h2oFraction = peak18 / total
  const n2coFraction = peak28 / total

  // Baked: H₂ dominant (>50%), wenig H₂O
  if (h2Fraction > 0.5 && h2oFraction < 0.2) {
    return 'baked'
  }

  // Unbaked: H₂O dominant
  if (h2oFraction > 0.4) {
    return 'unbaked'
  }

  // Air leak: N₂/CO sehr hoch
  if (n2coFraction > 0.5) {
    return 'air_leak'
  }

  return 'contaminated'
}
