/**
 * Aromatic Hydrocarbon (Benzene, Toluene) Detector
 *
 * Detects aromatic contamination from solvents, oils, and plastics:
 * - Benzene (C₆H₆): m/z 78 (parent), m/z 77 (C₆H₅⁺), ratio m77/m78 ≈ 0.22
 * - Toluene (C₇H₈): m/z 91 (tropylium C₇H₇⁺), m/z 92 (parent), ratio m92/m91 ≈ 0.69
 * - General aromatic fragments: m/z 39 (C₃H₃⁺), m/z 51 (C₄H₃⁺)
 *
 * WARNING: Aromatics are highly volatile and sensitive indicators!
 *
 * Cross-Validation Status: ⬜ PENDING VALIDATION
 * - Not yet validated by Gemini/Grok
 * - TODO: Submit for cross-validation
 *
 * References:
 * - NIST WebBook (Benzene, Toluene mass spectra)
 * - PNNL (Aromatic hydrocarbon detection)
 *
 * @see NextFeatures/REVERSE_SPEC_detectAromatic.md
 */

import { DiagnosisType, type DiagnosticResult, type DiagnosisInput, DEFAULT_THRESHOLDS } from '../../shared/types'
import { getPeak, createEvidence } from '../../shared/helpers'

export function detectAromatic(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  const m78 = getPeak(peaks, 78)  // Benzol C₆H₆⁺
  const m77 = getPeak(peaks, 77)  // C₆H₅⁺
  const m91 = getPeak(peaks, 91)  // Toluol Tropylium C₇H₇⁺
  const m92 = getPeak(peaks, 92)  // Toluol Parent C₇H₈⁺
  const m51 = getPeak(peaks, 51)  // C₄H₃⁺
  // const m52 = getPeak(peaks, 52)  // C₄H₄⁺ (für zukünftige Erweiterung)
  const m39 = getPeak(peaks, 39)  // C₃H₃⁺

  const evidence = []
  let confidence = 0
  let aromaticType = ''

  // Benzol Detektion
  if (m78 > DEFAULT_THRESHOLDS.minPeakHeight * 3) {
    evidence.push(createEvidence(
      'presence',
      `Benzol-Peak (m/z 78) detektiert: ${(m78 * 100).toFixed(3)}%`,
      `Benzene peak (m/z 78) detected: ${(m78 * 100).toFixed(3)}%`,
      true,
      m78 * 100
    ))
    confidence += 0.4
    aromaticType = 'Benzol'

    // Benzol-Fragment: 77/78 ≈ 0.22
    if (m77 > 0) {
      const ratio_77_78 = m77 / m78
      if (ratio_77_78 >= 0.15 && ratio_77_78 <= 0.30) {
        evidence.push(createEvidence(
          'ratio',
          `Phenyl-Fragment bestätigt (m77/m78) = ${ratio_77_78.toFixed(2)} (Benzol: ~0.22)`,
          `Phenyl fragment confirmed (m77/m78) = ${ratio_77_78.toFixed(2)} (Benzene: ~0.22)`,
          true,
          ratio_77_78,
          { min: 0.15, max: 0.30 }
        ))
        confidence += 0.2
      }
    }
  }

  // Toluol Detektion
  if (m91 > DEFAULT_THRESHOLDS.minPeakHeight * 3) {
    evidence.push(createEvidence(
      'presence',
      `Toluol/Tropylium-Peak (m/z 91) detektiert: ${(m91 * 100).toFixed(3)}%`,
      `Toluene/Tropylium peak (m/z 91) detected: ${(m91 * 100).toFixed(3)}%`,
      true,
      m91 * 100
    ))
    confidence += 0.4
    aromaticType = aromaticType ? `${aromaticType} + Toluol` : 'Toluol'

    // Toluol-Pattern: 92/91 ≈ 0.69
    if (m92 > 0) {
      const ratio_92_91 = m92 / m91
      if (ratio_92_91 >= 0.5 && ratio_92_91 <= 0.9) {
        evidence.push(createEvidence(
          'ratio',
          `Toluol-Pattern bestätigt (m92/m91) = ${ratio_92_91.toFixed(2)} (Toluol: ~0.69)`,
          `Toluene pattern confirmed (m92/m91) = ${ratio_92_91.toFixed(2)} (Toluene: ~0.69)`,
          true,
          ratio_92_91,
          { min: 0.5, max: 0.9 }
        ))
        confidence += 0.2
      }
    }
  }

  // Allgemeine Aromaten-Fragmente
  if ((m39 > DEFAULT_THRESHOLDS.minPeakHeight * 5 && m51 > DEFAULT_THRESHOLDS.minPeakHeight * 3) && !aromaticType) {
    evidence.push(createEvidence(
      'pattern',
      `Aromaten-Fragmente (m39, m51) vorhanden`,
      `Aromatic fragments (m39, m51) present`,
      true
    ))
    confidence += 0.2
    aromaticType = 'Aromaten'
  }

  if (confidence < DEFAULT_THRESHOLDS.minConfidence || !aromaticType) return null

  return {
    type: DiagnosisType.AROMATIC_CONTAMINATION,
    name: `Aromaten-Kontamination (${aromaticType})`,
    nameEn: `Aromatic Contamination (${aromaticType})`,
    description: `${aromaticType}-Signatur detektiert. Hohe Empfindlichkeit!`,
    descriptionEn: `${aromaticType} signature detected. High sensitivity!`,
    confidence: Math.min(confidence, 1.0),
    severity: 'warning',
    evidence,
    recommendation: `${aromaticType}-Quelle: Lösemittel, Diffusionspumpenöl, Kunststoffe, Reinigungsmittel.`,
    recommendationEn: `${aromaticType} source: Solvents, diffusion pump oil, plastics, cleaning agents.`,
    affectedMasses: [39, 50, 51, 52, 65, 77, 78, 91, 92]
  }
}
