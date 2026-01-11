/**
 * RGA Detectors - Public API
 *
 * This module provides access to all RGA diagnostic detectors.
 * Detectors are organized by category for better maintainability.
 *
 * Migration Status: 1/21 detectors migrated (5%)
 * - ✅ detectAirLeak (leaks/)
 * - ⬜ 20 remaining detectors (pending migration)
 *
 * Target Structure:
 * - leaks/ (4 detectors)
 * - contamination/ (9 detectors)
 * - outgassing/ (2 detectors)
 * - artifacts/ (1 detector)
 * - gases/ (4 detectors)
 * - isotopes/ (1 detector)
 * - quality/ (1 detector)
 */

import type { DiagnosisInput, DiagnosticResult } from './shared/types'
import { detectAirLeak } from './leaks/detectAirLeak'

// ============================================
// LEAKS
// ============================================
export { detectAirLeak }

// TODO: Migrate remaining 20 detectors
// - detectHeliumLeak
// - detectVirtualLeak
// - detectCoolingWaterLeak
// - detectOilBackstreaming
// - detectFomblinContamination
// - detectSiliconeContamination
// - detectPolymerOutgassing
// - detectPlasticizerContamination
// - detectSolventResidue
// - detectChlorinatedSolvent
// - detectAromatic
// - detectWaterOutgassing
// - detectHydrogenDominant
// - detectESDartifacts
// - detectAmmonia
// - detectMethane
// - detectSulfur
// - detectProcessGasResidue
// - verifyIsotopeRatios
// - detectCleanUHV

/**
 * Run all detectors on the given input
 * Currently only runs migrated detectors
 */
export function runAllDetectors(input: DiagnosisInput): DiagnosticResult[] {
  const results = [
    detectAirLeak(input),
    // TODO: Add remaining 20 detectors as they are migrated
  ].filter((r): r is DiagnosticResult => r !== null)

  return results
}

/**
 * Get detector count
 */
export const DETECTOR_COUNT = {
  total: 21,
  migrated: 1,
  pending: 20
}
