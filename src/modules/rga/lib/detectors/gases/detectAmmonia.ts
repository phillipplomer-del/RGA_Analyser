/**
 * Ammonia (NH₃) Contamination Detector
 *
 * Detects ammonia by analyzing overlapping peaks with H₂O at m/z 17:
 * - Primary criterion: m17/m18 ratio > 0.30 (normal H₂O: ~0.23)
 * - Secondary: m16/m17 ratio ≈ 0.80 (NH₂⁺/NH₃⁺)
 * - Tertiary: m15/m17 ratio ≈ 0.075 (NH⁺ fragment)
 *
 * NOTE: NH₃ and H₂O both contribute to m/z 17, making distinction challenging!
 *
 * Cross-Validation Status: ⬜ PENDING VALIDATION
 * - Not yet validated by Gemini/Grok
 * - TODO: Submit for cross-validation
 *
 * References:
 * - NIST WebBook (NH₃ mass spectrum at 70 eV EI)
 * - PNNL (Ammonia detection in vacuum systems)
 *
 * @see NextFeatures/REVERSE_SPEC_detectAmmonia.md
 */

import { DiagnosisType, type DiagnosticResult, type DiagnosisInput, DEFAULT_THRESHOLDS } from '../shared/types'
import { getPeak, createEvidence } from '../shared/helpers'

export function detectAmmonia(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  const m17 = getPeak(peaks, 17)  // NH₃⁺
  const m18 = getPeak(peaks, 18)  // H₂O⁺
  const m16 = getPeak(peaks, 16)  // NH₂⁺ oder O⁺
  const m15 = getPeak(peaks, 15)  // NH⁺ oder CH₃⁺

  const evidence = []
  let confidence = 0

  // Primärkriterium: OH/H₂O Verhältnis anomal hoch
  // H₂O normal: 17/18 ≈ 0.23, bei NH₃ vorhanden: > 0.30
  if (m18 > DEFAULT_THRESHOLDS.minPeakHeight) {
    const ratio_17_18 = m17 / m18

    if (ratio_17_18 > 0.30) {
      evidence.push(createEvidence(
        'ratio',
        `m17/m18 = ${ratio_17_18.toFixed(2)} (H₂O normal: ~0.23, >0.30 deutet auf NH₃)`,
        `m17/m18 = ${ratio_17_18.toFixed(2)} (H₂O normal: ~0.23, >0.30 indicates NH₃)`,
        true,
        ratio_17_18,
        { min: 0.30 }
      ))
      confidence += 0.4

      if (ratio_17_18 > 0.40) {
        evidence.push(createEvidence(
          'ratio',
          `Starker NH₃-Überschuss (m17/m18 > 0.40)`,
          `Strong NH₃ excess (m17/m18 > 0.40)`,
          true,
          ratio_17_18
        ))
        confidence += 0.2
      }
    }
  }

  // Sekundärkriterium: NH₂⁺ Fragment bei m/z 16
  // NH₃: 16/17 ≈ 0.80
  if (m17 > DEFAULT_THRESHOLDS.minPeakHeight) {
    const ratio_16_17 = m16 / m17
    if (ratio_16_17 >= 0.6 && ratio_16_17 <= 1.0) {
      evidence.push(createEvidence(
        'ratio',
        `NH₂/NH₃ (m16/m17) = ${ratio_16_17.toFixed(2)} (NH₃ typisch: ~0.80)`,
        `NH₂/NH₃ (m16/m17) = ${ratio_16_17.toFixed(2)} (NH₃ typical: ~0.80)`,
        true,
        ratio_16_17,
        { min: 0.6, max: 1.0 }
      ))
      confidence += 0.2
    }
  }

  // Tertiär: NH⁺ bei m/z 15 (schwach, ~7.5%)
  if (m15 > DEFAULT_THRESHOLDS.minPeakHeight && m17 > 0) {
    const ratio_15_17 = m15 / m17
    if (ratio_15_17 >= 0.05 && ratio_15_17 <= 0.15) {
      evidence.push(createEvidence(
        'ratio',
        `NH⁺ Fragment (m15/m17) = ${ratio_15_17.toFixed(2)} (NH₃ typisch: ~0.075)`,
        `NH⁺ fragment (m15/m17) = ${ratio_15_17.toFixed(2)} (NH₃ typical: ~0.075)`,
        true,
        ratio_15_17,
        { min: 0.05, max: 0.15 }
      ))
      confidence += 0.1
    }
  }

  if (confidence < DEFAULT_THRESHOLDS.minConfidence) return null

  return {
    type: DiagnosisType.AMMONIA_CONTAMINATION,
    name: 'Ammoniak-Kontamination',
    nameEn: 'Ammonia Contamination',
    description: 'NH₃-Signatur detektiert. Überlagerung mit H₂O bei m/z 17.',
    descriptionEn: 'NH₃ signature detected. Overlaps with H₂O at m/z 17.',
    confidence: Math.min(confidence, 1.0),
    severity: confidence > 0.5 ? 'warning' : 'info',
    evidence,
    recommendation: 'NH₃-Quelle identifizieren: Prozessgas, Reinigungsmittel, Pumpenöl-Zersetzung, biologische Kontamination.',
    recommendationEn: 'Identify NH₃ source: Process gas, cleaning agents, pump oil decomposition, biological contamination.',
    affectedMasses: [14, 15, 16, 17]
  }
}
