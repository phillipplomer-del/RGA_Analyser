/**
 * RGA Detectors - Public API
 *
 * This module provides access to all RGA diagnostic detectors.
 * Detectors are organized by category for better maintainability.
 *
 * Migration Status: 22/22 detectors migrated (100%) ✅ COMPLETE!
 *
 * Leaks (4):
 * - ✅ detectAirLeak
 * - ✅ detectHeliumLeak
 * - ✅ detectVirtualLeak
 * - ✅ detectCoolingWaterLeak
 *
 * Contamination (9):
 * - ✅ detectOilBackstreaming (oils)
 * - ✅ detectFomblinContamination (fluorinated)
 * - ✅ detectPolymerOutgassing (polymers)
 * - ✅ detectPlasticizerContamination (polymers)
 * - ✅ detectSiliconeContamination (polymers)
 * - ✅ detectSolventResidue (solvents)
 * - ✅ detectChlorinatedSolvent (solvents)
 * - ✅ detectAromatic (aromatics)
 *
 * Outgassing (2):
 * - ✅ detectWaterOutgassing
 * - ✅ detectHydrogenDominant
 *
 * Artifacts (1):
 * - ✅ detectESDartifacts
 *
 * Gases (5):
 * - ✅ detectAmmonia
 * - ✅ detectMethane
 * - ✅ detectSulfur
 * - ✅ detectProcessGasResidue
 * - ✅ distinguishN2fromCO
 *
 * Isotopes (1):
 * - ✅ verifyIsotopeRatios
 *
 * Quality (1):
 * - ✅ detectCleanUHV
 *
 * Target Structure:
 * - leaks/ (4 detectors)
 * - contamination/ (8 detectors)
 * - outgassing/ (2 detectors)
 * - artifacts/ (1 detector)
 * - gases/ (5 detectors)
 * - isotopes/ (1 detector)
 * - quality/ (1 detector)
 */

import type { DiagnosisInput, DiagnosticResult } from './shared/types'

// Leaks
import { detectAirLeak } from './leaks/detectAirLeak'
import { detectHeliumLeak } from './leaks/detectHeliumLeak'
import { detectVirtualLeak } from './leaks/detectVirtualLeak'
import { detectCoolingWaterLeak } from './leaks/detectCoolingWaterLeak'

// Contamination - Oils
import { detectOilBackstreaming } from './contamination/oils/detectOilBackstreaming'

// Contamination - Fluorinated
import { detectFomblinContamination } from './contamination/fluorinated/detectFomblinContamination'

// Contamination - Polymers
import { detectPolymerOutgassing } from './contamination/polymers/detectPolymerOutgassing'
import { detectPlasticizerContamination } from './contamination/polymers/detectPlasticizerContamination'
import { detectSiliconeContamination } from './contamination/polymers/detectSiliconeContamination'

// Contamination - Solvents
import { detectSolventResidue } from './contamination/solvents/detectSolventResidue'
import { detectChlorinatedSolvent } from './contamination/solvents/detectChlorinatedSolvent'

// Contamination - Aromatics
import { detectAromatic } from './contamination/aromatics/detectAromatic'

// Outgassing
import { detectWaterOutgassing } from './outgassing/detectWaterOutgassing'
import { detectHydrogenDominant } from './outgassing/detectHydrogenDominant'

// Artifacts
import { detectESDartifacts } from './artifacts/detectESDartifacts'

// Gases
import { detectAmmonia } from './gases/detectAmmonia'
import { detectMethane } from './gases/detectMethane'
import { detectSulfur } from './gases/detectSulfur'
import { detectProcessGasResidue } from './gases/detectProcessGasResidue'
import { distinguishN2fromCO } from './gases/distinguishN2fromCO'

// Isotopes
import { verifyIsotopeRatios } from './isotopes/verifyIsotopeRatios'

// Quality
import { detectCleanUHV } from './quality/detectCleanUHV'

// ============================================
// LEAKS
// ============================================
export { detectAirLeak }
export { detectHeliumLeak }
export { detectVirtualLeak }
export { detectCoolingWaterLeak }

// ============================================
// CONTAMINATION
// ============================================
export { detectOilBackstreaming }
export { detectFomblinContamination }
export { detectPolymerOutgassing }
export { detectPlasticizerContamination }
export { detectSiliconeContamination }
export { detectSolventResidue }
export { detectChlorinatedSolvent }
export { detectAromatic }

// ============================================
// OUTGASSING
// ============================================
export { detectWaterOutgassing }
export { detectHydrogenDominant }

// ============================================
// ARTIFACTS
// ============================================
export { detectESDartifacts }

// ============================================
// GASES
// ============================================
export { detectAmmonia }
export { detectMethane }
export { detectSulfur }
export { detectProcessGasResidue }
export { distinguishN2fromCO }

// ============================================
// ISOTOPES
// ============================================
export { verifyIsotopeRatios }

// ============================================
// QUALITY
// ============================================
export { detectCleanUHV }

// ============================================
// All 22 detectors have been successfully migrated! 🎉
// ============================================

/**
 * Run all 22 detectors on the given input
 * Returns array of all positive diagnoses
 */
export function runAllDetectors(input: DiagnosisInput): DiagnosticResult[] {
  const results = [
    // Leaks (4)
    detectAirLeak(input),
    detectHeliumLeak(input),
    detectVirtualLeak(input),
    detectCoolingWaterLeak(input),

    // Contamination (8)
    detectOilBackstreaming(input),
    detectFomblinContamination(input),
    detectPolymerOutgassing(input),
    detectPlasticizerContamination(input),
    detectSiliconeContamination(input),
    detectSolventResidue(input),
    detectChlorinatedSolvent(input),
    detectAromatic(input),

    // Outgassing (2)
    detectWaterOutgassing(input),
    detectHydrogenDominant(input),

    // Artifacts (1)
    detectESDartifacts(input),

    // Gases (5)
    detectAmmonia(input),
    detectMethane(input),
    detectSulfur(input),
    detectProcessGasResidue(input),
    distinguishN2fromCO(input),

    // Isotopes (1)
    verifyIsotopeRatios(input),

    // Quality (1)
    detectCleanUHV(input),
  ].filter((r): r is DiagnosticResult => r !== null)

  return results
}

/**
 * Get detector count
 */
export const DETECTOR_COUNT = {
  total: 22,
  migrated: 22,
  pending: 0
}
