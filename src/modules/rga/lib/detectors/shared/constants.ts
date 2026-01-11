/**
 * Shared constants for all detectors
 */

/**
 * ESD (Electron Stimulated Desorption) Detection Thresholds
 * Used by detectESDartifacts to identify ionizer contamination
 */
export const ESD_THRESHOLDS = {
  o_ratio: { normal: 0.15, anomaly: 0.50 },      // m16/m32
  n_ratio: { normal: 0.10, anomaly: 0.25 },      // m14/m28 - FIXED: was 0.07/0.15 - caused false positives
  c_ratio: { normal: 0.05, anomaly: 0.12 },      // m12/m28
  h_ratio: { normal: 0.10, anomaly: 0.20 },      // m1/m2 - FIXED: was 0.01/0.05 - unrealistic for 70 eV EI
  minCriteriaForWarning: 4                        // Ab 4 Kriterien → warning
}
