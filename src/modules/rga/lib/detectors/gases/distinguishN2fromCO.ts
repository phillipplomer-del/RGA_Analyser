/**
 * N₂/CO Differentiation Analyzer
 *
 * Distinguishes nitrogen (N₂) from carbon monoxide (CO) at m/z 28:
 * - N₂: m28/m14 ≈ 14 (N⁺ fragment)
 * - CO: m28/m12 ≈ 20 (C⁺ fragment)
 * - N⁺/C⁺ discrimination ratio: N₂ > 2, CO < 0.5
 * - ¹⁴N¹⁵N isotope check: m29/m28 ≈ 0.73% for N₂
 * - ¹³CO isotope check: m29/m28 ≈ 1.1-1.2% for CO
 *
 * This is a special analysis function (not a typical detector).
 *
 * Cross-Validation Status: ⬜ PENDING VALIDATION
 * - Not yet validated by Gemini/Grok
 * - TODO: Submit for cross-validation
 *
 * References:
 * - NIST WebBook (N₂, CO mass spectra at 70 eV EI)
 * - CIAAW (¹⁵N natural abundance: 0.368%)
 * - CIAAW (¹³C natural abundance: 1.07%)
 *
 * @see NextFeatures/REVERSE_SPEC_distinguishN2fromCO.md
 */

import { DiagnosisType, type DiagnosticResult, type DiagnosisInput, DEFAULT_THRESHOLDS } from '../shared/types'
import { getPeak, createEvidence } from '../shared/helpers'

export function distinguishN2fromCO(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  const m28 = getPeak(peaks, 28)  // N₂⁺ oder CO⁺
  const m14 = getPeak(peaks, 14)  // N⁺ (Fragment von N₂)
  const m12 = getPeak(peaks, 12)  // C⁺ (Fragment von CO)
  const m29 = getPeak(peaks, 29)  // ¹³CO⁺ oder N₂H⁺

  if (m28 < DEFAULT_THRESHOLDS.minPeakHeight * 10) return null

  const evidence = []
  let confidence = 0
  let probablyCO = false
  let coFraction = 0

  // N₂: m28/m14 ≈ 14, CO: m28/m12 ≈ 20
  const ratio_28_14 = m14 > 0 ? m28 / m14 : 999
  const ratio_28_12 = m12 > 0 ? m28 / m12 : 999

  evidence.push(createEvidence(
    'ratio',
    `m28/m14 (N₂-Fragment): ${ratio_28_14.toFixed(1)} (reines N₂ ≈ 14)`,
    `m28/m14 (N₂ fragment): ${ratio_28_14.toFixed(1)} (pure N₂ ≈ 14)`,
    ratio_28_14 >= 10 && ratio_28_14 <= 20,
    ratio_28_14,
    { min: 10, max: 20 }
  ))

  evidence.push(createEvidence(
    'ratio',
    `m28/m12 (CO-Fragment): ${ratio_28_12.toFixed(1)} (reines CO ≈ 20)`,
    `m28/m12 (CO fragment): ${ratio_28_12.toFixed(1)} (pure CO ≈ 20)`,
    ratio_28_12 >= 15 && ratio_28_12 <= 25,
    ratio_28_12,
    { min: 15, max: 25 }
  ))

  // N⁺/C⁺ Diskriminierungsverhältnis (neu)
  const ratio_14_12 = (m14 > 0 && m12 > 0) ? m14 / m12 : 999

  if (m14 > DEFAULT_THRESHOLDS.minPeakHeight && m12 > DEFAULT_THRESHOLDS.minPeakHeight) {
    evidence.push(createEvidence(
      'ratio',
      `N⁺/C⁺ Verhältnis (m14/m12): ${ratio_14_12.toFixed(2)} (N₂: >2, CO: <0.5)`,
      `N⁺/C⁺ ratio (m14/m12): ${ratio_14_12.toFixed(2)} (N₂: >2, CO: <0.5)`,
      ratio_14_12 > 0.5 && ratio_14_12 < 2.0,
      ratio_14_12
    ))

    if (ratio_14_12 > 2.0) {
      confidence += 0.2  // Starker N₂-Hinweis
      probablyCO = false
    } else if (ratio_14_12 < 0.5) {
      confidence += 0.2  // Starker CO-Hinweis
      probablyCO = true
      coFraction = Math.max(coFraction, 0.7)
    }
  }

  // Entscheidungslogik
  if (m12 < DEFAULT_THRESHOLDS.minPeakHeight && m14 > DEFAULT_THRESHOLDS.minPeakHeight) {
    // Kein C⁺ → hauptsächlich N₂ → keine Warnung nötig
    return null
  } else if (m12 > DEFAULT_THRESHOLDS.minPeakHeight && m14 < DEFAULT_THRESHOLDS.minPeakHeight) {
    // C⁺ ohne N⁺ → hauptsächlich CO
    probablyCO = true
    confidence += 0.5
    coFraction = 1.0
    evidence.push(createEvidence(
      'presence',
      `C⁺ (m12) ohne N⁺ (m14) → hauptsächlich CO`,
      `C⁺ (m12) without N⁺ (m14) → mainly CO`,
      true
    ))
  } else if (m12 > 0 && m14 > 0) {
    // Beide vorhanden → Mischung
    coFraction = Math.min((m12 / m28) / 0.05, 1.0)
    if (coFraction > 0.2) {
      evidence.push(createEvidence(
        'ratio',
        `Geschätzter CO-Anteil: ${(coFraction * 100).toFixed(0)}%`,
        `Estimated CO fraction: ${(coFraction * 100).toFixed(0)}%`,
        true,
        coFraction * 100
      ))
      confidence += 0.3
    } else {
      return null // Zu wenig CO, nicht relevant
    }
  }

  // ¹⁴N¹⁵N Check für N₂ Bestätigung (neu)
  // Natürliche Häufigkeit: ¹⁵N = 0,368%, also ¹⁴N¹⁵N ≈ 0,73% von N₂
  if (m29 > 0 && m28 > 0) {
    const m29_28_ratio = m29 / m28

    if (m29_28_ratio >= 0.006 && m29_28_ratio <= 0.009) {
      // Konsistent mit N₂-Isotopenverhältnis
      evidence.push(createEvidence(
        'ratio',
        `m29/m28 = ${(m29_28_ratio * 100).toFixed(2)}% konsistent mit ¹⁴N¹⁵N (N₂: ~0,73%)`,
        `m29/m28 = ${(m29_28_ratio * 100).toFixed(2)}% consistent with ¹⁴N¹⁵N (N₂: ~0.73%)`,
        true,
        m29_28_ratio * 100,
        { min: 0.6, max: 0.9 }
      ))
      if (!probablyCO) {
        confidence += 0.15  // Boost N₂ confidence
      }
    } else if (m29_28_ratio < 0.006) {
      // Zu niedrig für natürliches N₂ - könnte reine N₂ mit schwacher m29 sein
      evidence.push(createEvidence(
        'ratio',
        `Niedriges m29/m28 (${(m29_28_ratio * 100).toFixed(2)}%) - mögliche Nachweisgrenze`,
        `Low m29/m28 (${(m29_28_ratio * 100).toFixed(2)}%) - possible detection limit`,
        false,
        m29_28_ratio * 100
      ))
    }
  }

  // ¹³CO Check (verbessert mit wissenschaftlich validiertem Schwellenwert)
  if (m29 > 0 && m28 > 0 && m29 / m28 > 0.012) {
    // Schwellenwert auf 1.2% reduziert (von 1.5%)
    // Wissenschaftliche Grundlage: ¹³C natürliche Häufigkeit = 1,07%, typisches ¹³CO/CO = 1,1-1,2%
    evidence.push(createEvidence(
      'ratio',
      `m29/m28 = ${((m29 / m28) * 100).toFixed(2)}% deutet auf ¹³CO (erwartet: 1,1-1,2%)`,
      `m29/m28 = ${((m29 / m28) * 100).toFixed(2)}% indicates ¹³CO (expected: 1.1-1.2%)`,
      true,
      (m29 / m28) * 100,
      { min: 1.1, max: 1.3 }
    ))
    probablyCO = true
    confidence += 0.25  // Increased from 0.2
  }

  if (confidence < DEFAULT_THRESHOLDS.minConfidence) return null

  const type = probablyCO && coFraction > 0.8 ? DiagnosisType.CO_DOMINANT : DiagnosisType.N2_CO_MIXTURE

  return {
    type,
    name: type === DiagnosisType.CO_DOMINANT
      ? 'CO-dominiert bei m/z 28'
      : `N₂/CO-Mischung (≈${(coFraction * 100).toFixed(0)}% CO)`,
    nameEn: type === DiagnosisType.CO_DOMINANT
      ? 'CO-Dominated at m/z 28'
      : `N₂/CO Mixture (≈${(coFraction * 100).toFixed(0)}% CO)`,
    description: type === DiagnosisType.CO_DOMINANT
      ? 'Peak bei m/z 28 ist hauptsächlich CO. Quelle: Ausgasung, Oxidation.'
      : `Peak bei m/z 28 enthält ca. ${(coFraction * 100).toFixed(0)}% CO.`,
    descriptionEn: type === DiagnosisType.CO_DOMINANT
      ? 'Peak at m/z 28 is mainly CO. Source: Outgassing, oxidation.'
      : `Peak at m/z 28 contains approx. ${(coFraction * 100).toFixed(0)}% CO.`,
    confidence: Math.min(confidence, 1.0),
    severity: 'info',
    evidence,
    recommendation: 'CO-Quelle: Ausgasung von Edelstahl, oxidierte Oberflächen. Ausheizen reduziert CO.',
    recommendationEn: 'CO source: Stainless steel outgassing, oxidized surfaces. Bakeout reduces CO.',
    affectedMasses: [12, 14, 28, 29]
  }
}
