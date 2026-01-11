/**
 * Polymer Outgassing Detector
 *
 * Detects polymer outgassing (PEEK, Kapton, Viton) and general residual gas outgassing:
 * - Primary marker: H₂O dominant without air leak signature (H₂O > 2×N₂)
 * - No air leak: N₂/O₂ ratio > 4.5 or Ar < 0.5%
 * - Normal H₂O/OH ratio: 3.5-5.0 (typical: 4.3)
 * - Secondary markers: CO₂ (m/z 44), polymer alkyl fragments (m/z 41, 43)
 *
 * Cross-Validation Status: ⚠️ CONDITIONAL (Fixes Applied)
 * - Gemini: ⚠️ Conditional - N₂/O₂ threshold too strict (>5.0 unrealistic)
 * - Grok: ⚠️ Conditional - Missing O⁺ (m/z 16) and CO₂ evidence
 * - Fixes Applied:
 *   1. ✅ Changed N₂/O₂ threshold from >5.0 to >4.5 (realistic for non-air)
 *   2. ✅ Added O⁺ (m/z 16) evidence to track water fragmentation
 *   3. ✅ Added CO₂ (m/z 44) evidence - typical for polymer outgassing
 *
 * References:
 * - NIST WebBook (H₂O, CO₂ mass spectra at 70 eV EI)
 * - Redhead 1997 (Vacuum 47, 491) - Thermal desorption
 * - Wutz Handbuch Vakuumtechnik (Polymer outgassing rates)
 * - O'Hanlon 2003 (User's Guide to Vacuum Technology) - Outgassing
 *
 * @see NextFeatures/REVERSE_SPEC_detectPolymerOutgassing.md
 */

import { DiagnosisType, type DiagnosticResult, type DiagnosisInput, type EvidenceItem, DEFAULT_THRESHOLDS } from '../../shared/types'
import { getPeak, createEvidence } from '../../shared/helpers'

export function detectPolymerOutgassing(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  const m16 = getPeak(peaks, 16)  // O⁺
  const m17 = getPeak(peaks, 17)  // OH⁺
  const m18 = getPeak(peaks, 18)  // H₂O⁺
  const m28 = getPeak(peaks, 28)  // N₂⁺/CO⁺
  const m32 = getPeak(peaks, 32)  // O₂⁺
  const m40 = getPeak(peaks, 40)  // Ar⁺
  const m41 = getPeak(peaks, 41)  // C₃H₅⁺
  const m43 = getPeak(peaks, 43)  // C₃H₇⁺/C₂H₃O⁺
  const m44 = getPeak(peaks, 44)  // CO₂⁺

  const evidence: EvidenceItem[] = []
  let confidence = 0

  // H₂O dominant ohne Luftleck-Signatur
  const waterDominant = m18 > m28 * 2
  const noAirLeak = (m28 / Math.max(m32, 0.001)) > 4.5 || m40 < 0.005  // FIXED: threshold changed from >5 to >4.5
  const normalWaterRatio = m17 > 0 && m18 / m17 > 3.5 && m18 / m17 < 5.0

  // Check for polymer-specific markers (m41/m43)
  const hasPolymerMarkers = m41 > 0.005 || m43 > 0.005

  if (waterDominant && noAirLeak) {
    evidence.push(createEvidence(
      'ratio',
      `H₂O dominant (m18 > 2×m28): ${(m18 / Math.max(m28, 0.001)).toFixed(1)}×`,
      `H₂O dominant (m18 > 2×m28): ${(m18 / Math.max(m28, 0.001)).toFixed(1)}×`,
      true,
      m18 / Math.max(m28, 0.001),
      { min: 2 }
    ))
    confidence += 0.4

    evidence.push(createEvidence(
      'absence',
      `Kein Luftleck (Ar niedrig, N₂/O₂ anomal)`,
      `No air leak (Ar low, N₂/O₂ anomalous)`,
      true
    ))
    confidence += 0.2
  }

  if (normalWaterRatio) {
    evidence.push(createEvidence(
      'ratio',
      `Normales H₂O/OH Verhältnis: ${(m18 / m17).toFixed(2)} (typisch: 4.3)`,
      `Normal H₂O/OH ratio: ${(m18 / m17).toFixed(2)} (typical: 4.3)`,
      true,
      m18 / m17,
      { min: 3.5, max: 5.0 }
    ))
    confidence += 0.2
  }

  // Add m16 (O⁺) evidence
  if (m16 > 0.01) {
    evidence.push(createEvidence(
      'presence',
      `O⁺ (m/z 16) detektiert: ${(m16 * 100).toFixed(2)}% - Fragment von H₂O/O₂`,
      `O⁺ (m/z 16) detected: ${(m16 * 100).toFixed(2)}% - fragment from H₂O/O₂`,
      true,
      m16 * 100
    ))
  }

  // Add m44 (CO₂) evidence if present
  if (m44 > 0.01) {
    evidence.push(createEvidence(
      'presence',
      `CO₂ (m/z 44) detektiert: ${(m44 * 100).toFixed(2)}% - typisch für Polymer-Ausgasung`,
      `CO₂ (m/z 44) detected: ${(m44 * 100).toFixed(2)}% - typical for polymer outgassing`,
      true,
      m44 * 100
    ))
  }

  // Check if we should return early
  if (!hasPolymerMarkers && confidence < DEFAULT_THRESHOLDS.minConfidence) return null

  // Build affected masses list
  const affectedMasses: number[] = [16, 17, 18]
  if (m44 > 0.01) affectedMasses.push(44)

  return {
    type: DiagnosisType.POLYMER_OUTGASSING,
    name: hasPolymerMarkers ? 'Polymer-Ausgasung' : 'Restgas-Ausgasung',
    nameEn: hasPolymerMarkers ? 'Polymer Outgassing' : 'Residual Gas Outgassing',
    description: hasPolymerMarkers
      ? 'Polymer-Ausgasung (PEEK/Kapton/Viton) - hauptsächlich H₂O.'
      : 'Restgas-Ausgasung - hauptsächlich H₂O und CO₂.',
    descriptionEn: hasPolymerMarkers
      ? 'Polymer outgassing (PEEK/Kapton/Viton) - mainly H₂O.'
      : 'Residual gas outgassing - mainly H₂O and CO₂.',
    confidence: Math.min(confidence, 1.0),
    severity: 'info',
    evidence,
    recommendation: 'Längeres Abpumpen, Bakeout bei max. zulässiger Polymer-Temperatur (150-200°C).',
    recommendationEn: 'Extended pumping, bakeout at max. allowed polymer temperature (150-200°C).',
    affectedMasses
  }
}
