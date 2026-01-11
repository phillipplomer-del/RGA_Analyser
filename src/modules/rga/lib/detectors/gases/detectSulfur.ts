/**
 * Sulfur Compound (H₂S, SO₂) Detector
 *
 * Detects sulfur-containing gases:
 * - H₂S: m/z 34 (H₂S⁺), m/z 33 (HS⁺), ratio m33/m34 ≈ 0.42
 * - SO₂: m/z 64 (SO₂⁺), m/z 48 (SO⁺), ratio m48/m64 ≈ 0.49
 *
 * Sources: Forepump oil decomposition, process gas, biological contamination
 *
 * Cross-Validation Status: ⬜ PENDING VALIDATION
 * - Not yet validated by Gemini/Grok
 * - TODO: Submit for cross-validation
 *
 * References:
 * - NIST WebBook (H₂S, SO₂ mass spectra at 70 eV EI)
 * - PNNL (Sulfur compound detection)
 *
 * @see NextFeatures/REVERSE_SPEC_detectSulfur.md
 */

import { DiagnosisType, type DiagnosticResult, type DiagnosisInput, DEFAULT_THRESHOLDS } from '../shared/types'
import { getPeak, createEvidence } from '../shared/helpers'

export function detectSulfur(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  const m34 = getPeak(peaks, 34)  // H₂S⁺
  const m33 = getPeak(peaks, 33)  // HS⁺
  // const m32 = getPeak(peaks, 32)  // S⁺ oder O₂⁺ (ambivalent, für zukünftige Erweiterung)
  const m64 = getPeak(peaks, 64)  // SO₂⁺
  const m48 = getPeak(peaks, 48)  // SO⁺

  const evidence = []
  let confidence = 0
  let sulfurType = ''

  // H₂S Detektion
  if (m34 > DEFAULT_THRESHOLDS.minPeakHeight * 3) {
    evidence.push(createEvidence(
      'presence',
      `H₂S-Hauptpeak (m/z 34) detektiert: ${(m34 * 100).toFixed(3)}%`,
      `H₂S main peak (m/z 34) detected: ${(m34 * 100).toFixed(3)}%`,
      true,
      m34 * 100
    ))
    confidence += 0.4
    sulfurType = 'H₂S'

    // HS⁺ Fragment prüfen: 33/34 ≈ 0.42
    if (m33 > 0) {
      const ratio_33_34 = m33 / m34
      if (ratio_33_34 >= 0.3 && ratio_33_34 <= 0.5) {
        evidence.push(createEvidence(
          'ratio',
          `HS⁺ Fragment bestätigt (m33/m34) = ${ratio_33_34.toFixed(2)} (H₂S: ~0.42)`,
          `HS⁺ fragment confirmed (m33/m34) = ${ratio_33_34.toFixed(2)} (H₂S: ~0.42)`,
          true,
          ratio_33_34,
          { min: 0.3, max: 0.5 }
        ))
        confidence += 0.2
      }
    }
  }

  // SO₂ Detektion
  if (m64 > DEFAULT_THRESHOLDS.minPeakHeight * 3) {
    evidence.push(createEvidence(
      'presence',
      `SO₂-Hauptpeak (m/z 64) detektiert: ${(m64 * 100).toFixed(3)}%`,
      `SO₂ main peak (m/z 64) detected: ${(m64 * 100).toFixed(3)}%`,
      true,
      m64 * 100
    ))
    confidence += 0.4
    sulfurType = sulfurType ? `${sulfurType} + SO₂` : 'SO₂'

    // SO⁺ Fragment bei m/z 48: 48/64 ≈ 0.49
    if (m48 > 0) {
      const ratio_48_64 = m48 / m64
      if (ratio_48_64 >= 0.4 && ratio_48_64 <= 0.6) {
        evidence.push(createEvidence(
          'ratio',
          `SO⁺ Fragment bestätigt (m48/m64) = ${ratio_48_64.toFixed(2)} (SO₂: ~0.49)`,
          `SO⁺ fragment confirmed (m48/m64) = ${ratio_48_64.toFixed(2)} (SO₂: ~0.49)`,
          true,
          ratio_48_64,
          { min: 0.4, max: 0.6 }
        ))
        confidence += 0.2
      }
    }
  }

  if (confidence < DEFAULT_THRESHOLDS.minConfidence || !sulfurType) return null

  return {
    type: DiagnosisType.SULFUR_CONTAMINATION,
    name: `Schwefel-Kontamination (${sulfurType})`,
    nameEn: `Sulfur Contamination (${sulfurType})`,
    description: `${sulfurType}-Signatur detektiert.`,
    descriptionEn: `${sulfurType} signature detected.`,
    confidence: Math.min(confidence, 1.0),
    severity: 'warning',
    evidence,
    recommendation: `${sulfurType}-Quelle: Vorpumpenöl-Zersetzung, Prozessgas, biologische Kontamination.`,
    recommendationEn: `${sulfurType} source: Forepump oil decomposition, process gas, biological contamination.`,
    affectedMasses: [32, 33, 34, 48, 64, 66]
  }
}
