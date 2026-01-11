/**
 * Methane (CH₄) Contamination Detector
 *
 * Detects methane using clean indicators that minimize ambiguity:
 * - Primary: m/z 15 (CH₃⁺) as clean indicator (comes almost exclusively from CH₄)
 * - CH₃/CH₄ ratio: m15/m16 ≈ 0.85
 * - CH₂⁺ fragment: m14/m15 ≈ 0.15-0.25
 * - Warning: High O₂ can interfere with m/z 16 (O⁺ vs CH₄⁺)
 *
 * Cross-Validation Status: ⬜ PENDING VALIDATION
 * - Not yet validated by Gemini/Grok
 * - TODO: Submit for cross-validation
 *
 * References:
 * - NIST WebBook (CH₄ mass spectrum at 70 eV EI)
 * - PNNL (Methane detection in vacuum systems)
 *
 * @see NextFeatures/REVERSE_SPEC_detectMethane.md
 */

import { DiagnosisType, type DiagnosticResult, type DiagnosisInput, DEFAULT_THRESHOLDS } from '../shared/types'
import { getPeak, createEvidence } from '../shared/helpers'

export function detectMethane(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  const m16 = getPeak(peaks, 16)  // CH₄⁺ oder O⁺
  const m15 = getPeak(peaks, 15)  // CH₃⁺ - SAUBERER INDIKATOR!
  const m14 = getPeak(peaks, 14)  // CH₂⁺ oder N⁺
  // const m13 = getPeak(peaks, 13)  // CH⁺ (für zukünftige Erweiterung)
  const m32 = getPeak(peaks, 32)  // O₂ (zur Korrektur)

  const evidence = []
  let confidence = 0

  // Hauptkriterium: m/z 15 (CH₃⁺) als sauberer Indikator
  // m/z 15 kommt praktisch NUR von CH₄ und höheren HC
  if (m15 > DEFAULT_THRESHOLDS.minPeakHeight * 5) {
    evidence.push(createEvidence(
      'presence',
      `CH₃⁺ (m/z 15) signifikant: ${(m15 * 100).toFixed(2)}%`,
      `CH₃⁺ (m/z 15) significant: ${(m15 * 100).toFixed(2)}%`,
      true,
      m15 * 100
    ))
    confidence += 0.4

    // CH₄-Pattern prüfen: 15/16 ≈ 0.85
    if (m16 > 0) {
      const ratio_15_16 = m15 / m16
      if (ratio_15_16 >= 0.7 && ratio_15_16 <= 1.0) {
        evidence.push(createEvidence(
          'ratio',
          `CH₃/CH₄ (m15/m16) = ${ratio_15_16.toFixed(2)} (CH₄ typisch: ~0.85)`,
          `CH₃/CH₄ (m15/m16) = ${ratio_15_16.toFixed(2)} (CH₄ typical: ~0.85)`,
          true,
          ratio_15_16,
          { min: 0.7, max: 1.0 }
        ))
        confidence += 0.3
      }
    }
  }

  // Sekundär: CH₂⁺ bei m/z 14
  if (m14 > 0 && m15 > 0) {
    const ratio_14_15 = m14 / m15
    if (ratio_14_15 >= 0.15 && ratio_14_15 <= 0.25) {
      evidence.push(createEvidence(
        'ratio',
        `CH₂⁺ Fragment bestätigt (m14/m15) = ${ratio_14_15.toFixed(2)}`,
        `CH₂⁺ fragment confirmed (m14/m15) = ${ratio_14_15.toFixed(2)}`,
        true,
        ratio_14_15,
        { min: 0.15, max: 0.25 }
      ))
      confidence += 0.2
    }
  }

  // Warnung: Hoher O₂-Anteil kann m/z 16 verfälschen
  if (m32 > m16 * 5) {
    confidence *= 0.7
    evidence.push(createEvidence(
      'presence',
      `Warnung: Hoher O₂-Anteil, m/z 16 könnte teilweise O⁺ sein`,
      `Warning: High O₂ content, m/z 16 could be partially O⁺`,
      false,
      m32 * 100
    ))
  }

  if (confidence < DEFAULT_THRESHOLDS.minConfidence) return null

  return {
    type: DiagnosisType.METHANE_CONTAMINATION,
    name: 'Methan-Kontamination',
    nameEn: 'Methane Contamination',
    description: 'CH₄-Signatur detektiert. m/z 15 ist sauberer Indikator.',
    descriptionEn: 'CH₄ signature detected. m/z 15 is a clean indicator.',
    confidence: Math.min(confidence, 1.0),
    severity: confidence > 0.5 ? 'warning' : 'info',
    evidence,
    recommendation: 'Methan-Quelle: Organische Zersetzung, Prozessgas, RGA-Filament-Reaktion mit Kohlenstoff.',
    recommendationEn: 'Methane source: Organic decomposition, process gas, RGA filament reaction with carbon.',
    affectedMasses: [12, 13, 14, 15, 16]
  }
}
