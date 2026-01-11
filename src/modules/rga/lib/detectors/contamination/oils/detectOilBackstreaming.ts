/**
 * Oil Backstreaming Detector
 *
 * Detects oil contamination from vacuum pumps via Δ14 amu hydrocarbon pattern:
 * - Characteristic masses: 39, 41, 43, 55, 57, 69, 71, 83, 85
 * - m57/m43 ratio: 0.5-1.4 (expanded from 0.5-1.2 after cross-validation)
 * - Heavy hydrocarbon indicator: m71/m43 > 0.4
 *
 * Cross-Validation Status: ⚠️ CONDITIONAL (Fixes Applied)
 * - Gemini: ⚠️ Conditional - Pump type labeling unreliable
 * - Grok: ⚠️ Conditional - m57/m43 range too narrow, m71/m43 unvalidated
 * - Fixes Applied:
 *   1. ✅ Renamed "Turbopumpe" → "Heavy Hydrocarbons"
 *   2. ✅ Adjusted m57/m43 range to 0.5-1.4 (was 0.5-1.2)
 *   3. ✅ Added m/z 39 aromatic marker check
 *
 * References:
 * - NIST WebBook (Alkane spectra)
 * - Hiden Analytical (Oil contamination patterns)
 * - Pfeiffer Vacuum (Pump oil analysis)
 * - Kurt J. Lesker (RGA troubleshooting)
 * - SRS RGA Application Notes
 *
 * @see NextFeatures/REVERSE_SPEC_detectOilBackstreaming.md
 * @see DOCUMENTATION/PHYSICS/detectOilBackstreaming.md
 */

import { DiagnosisType, type DiagnosticResult, type DiagnosisInput, DEFAULT_THRESHOLDS } from '../../shared/types'
import { getPeak, createEvidence } from '../../shared/helpers'

export function detectOilBackstreaming(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  // Oil signature: Δ14 amu pattern
  const oilMasses = [41, 43, 55, 57, 69, 71, 83, 85]
  const detected: number[] = []
  const evidence = []

  for (const mass of oilMasses) {
    const value = getPeak(peaks, mass)
    if (value > DEFAULT_THRESHOLDS.minPeakHeight) {
      detected.push(mass)
    }
  }

  if (detected.length < DEFAULT_THRESHOLDS.oilPatternMinPeaks) return null

  // Check main peaks
  const m43 = getPeak(peaks, 43)
  const m57 = getPeak(peaks, 57)
  const m41 = getPeak(peaks, 41)
  const m39 = getPeak(peaks, 39)

  evidence.push(createEvidence(
    'pattern',
    `Öl-Pattern (Δ14 amu): ${detected.length} von 8 Peaks detektiert`,
    `Oil pattern (Δ14 amu): ${detected.length} of 8 peaks detected`,
    detected.length >= 3,
    detected.length,
    { min: 3 }
  ))

  // Check characteristic pairs
  if (m43 > 0 && m57 > 0) {
    const ratio = m57 / m43
    evidence.push(createEvidence(
      'ratio',
      `C₄H₉⁺/C₃H₇⁺ (m57/m43): ${ratio.toFixed(2)} (Öl typisch: 0.7-0.9)`,
      `C₄H₉⁺/C₃H₇⁺ (m57/m43): ${ratio.toFixed(2)} (oil typical: 0.7-0.9)`,
      ratio >= 0.5 && ratio <= 1.4, // FIXED: Was 0.5-1.2, now 0.5-1.4
      ratio
    ))
  }

  // FIXED: Check for m/z 39 aromatic marker
  if (m39 > DEFAULT_THRESHOLDS.minPeakHeight) {
    evidence.push(createEvidence(
      'presence',
      `C₃H₃⁺ (m/z 39) detektiert - aromatischer Marker`,
      `C₃H₃⁺ (m/z 39) detected - aromatic marker`,
      true,
      m39 * 100
    ))
  }

  // Check if it's NOT Fomblin (no 41/43/57 with Fomblin, only 69)
  const m69 = getPeak(peaks, 69)
  if (m69 > m43 && m41 < DEFAULT_THRESHOLDS.minPeakHeight) {
    // Likely Fomblin, not mineral oil
    return null
  }

  let confidence = detected.length / oilMasses.length

  // FIXED: Distinguish heavy hydrocarbons (was "Turbopumpe" vs "Vorpumpe")
  const m71 = getPeak(peaks, 71)
  let oilType = 'Vorpumpe'
  if (m71 > 0 && m43 > 0 && m71 / m43 > 0.4) {
    oilType = 'Heavy Hydrocarbons' // FIXED: Was "Turbopumpe"
    evidence.push(createEvidence(
      'ratio',
      `Hoher m71-Anteil deutet auf schwere Kohlenwasserstoffe`,
      `High m71 content indicates heavy hydrocarbons`,
      true,
      m71 / m43
    ))
  }

  return {
    type: DiagnosisType.OIL_BACKSTREAMING,
    name: `Öl-Rückströmung (${oilType})`,
    nameEn: `Oil Backstreaming (${oilType === 'Vorpumpe' ? 'Forepump' : 'Heavy Hydrocarbons'})`,
    description: `Kohlenwasserstoff-Muster deutet auf ${oilType}nöl-Kontamination.`,
    descriptionEn: `Hydrocarbon pattern indicates ${oilType === 'Vorpumpe' ? 'forepump' : 'heavy hydrocarbon'} oil contamination.`,
    confidence: Math.min(confidence, 1.0),
    severity: confidence > 0.6 ? 'critical' : 'warning',
    evidence,
    recommendation: 'Prüfen: Ventilsequenz bei Schleusenbetrieb, Ölfallen-Sättigung, Vorvakuumleitungen. Ggf. LN₂-Falle einsetzen.',
    recommendationEn: 'Check: Valve sequence during load-lock operation, oil trap saturation, forevacuum lines. Consider LN₂ cold trap.',
    affectedMasses: [39, 41, 43, 55, 57, 69, 71, 83, 85]
  }
}
