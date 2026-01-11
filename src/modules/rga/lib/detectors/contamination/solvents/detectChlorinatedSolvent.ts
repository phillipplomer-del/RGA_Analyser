/**
 * Chlorinated Solvent Detector
 *
 * Detects chlorinated solvents (TCE, dichloromethane, etc.):
 * - Chlorine isotope ratio: ³⁵Cl/³⁷Cl ≈ 3.13
 * - TCE marker: m/z 95 (main peak)
 *
 * WARNING: Chlorinated solvents are extremely corrosive to aluminum vacuum chambers!
 *
 * Cross-Validation Status: ⬜ PENDING VALIDATION
 * - Not yet validated by Gemini/Grok
 * - TODO: Submit for cross-validation
 *
 * References:
 * - NIST WebBook (TCE, dichloromethane spectra)
 * - CIAAW (Chlorine isotope abundances)
 *
 * @see NextFeatures/REVERSE_SPEC_detectChlorinatedSolvent.md
 */

import { DiagnosisType, type DiagnosticResult, type DiagnosisInput, DEFAULT_THRESHOLDS } from '../../shared/types'
import { getPeak, createEvidence } from '../../shared/helpers'

export function detectChlorinatedSolvent(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  const m35 = getPeak(peaks, 35)  // ³⁵Cl⁺
  const m37 = getPeak(peaks, 37)  // ³⁷Cl⁺

  // Chlor-Isotopen Verhältnis: 35/37 ≈ 3:1
  if (m35 < DEFAULT_THRESHOLDS.minPeakHeight * 5) return null

  const evidence = []
  let confidence = 0

  const clRatio = m35 / (m37 || 0.001)
  const clRatioOk = clRatio >= 2.5 && clRatio <= 4.0

  evidence.push(createEvidence(
    'ratio',
    `Cl-Isotopenverhältnis ³⁵Cl/³⁷Cl: ${clRatio.toFixed(2)} (erwartet: 3.1)`,
    `Cl isotope ratio ³⁵Cl/³⁷Cl: ${clRatio.toFixed(2)} (expected: 3.1)`,
    clRatioOk,
    clRatio,
    { exact: 3.1 }
  ))

  if (clRatioOk) confidence += 0.5

  // TCE Check (Trichlorethylen, m95)
  const m95 = getPeak(peaks, 95)
  if (m95 > DEFAULT_THRESHOLDS.minPeakHeight) {
    evidence.push(createEvidence(
      'presence',
      `TCE-Hauptpeak m/z 95: ${(m95 * 100).toFixed(3)}%`,
      `TCE main peak m/z 95: ${(m95 * 100).toFixed(3)}%`,
      true,
      m95 * 100
    ))
    confidence += 0.3
  }

  if (confidence < DEFAULT_THRESHOLDS.minConfidence) return null

  return {
    type: DiagnosisType.CHLORINATED_SOLVENT,
    name: 'Chloriertes Lösemittel',
    nameEn: 'Chlorinated Solvent',
    description: 'Chlorverbindung detektiert (TCE, Dichlormethan o.ä.).',
    descriptionEn: 'Chlorine compound detected (TCE, dichloromethane, etc.).',
    confidence: Math.min(confidence, 1.0),
    severity: 'critical',
    evidence,
    recommendation: 'WARNUNG: Chlorierte Lösemittel korrodieren Aluminium! Intensiv ausheizen. Kontaminierte Teile ggf. ersetzen.',
    recommendationEn: 'WARNING: Chlorinated solvents corrode aluminum! Bake out intensively. Replace contaminated parts if needed.',
    affectedMasses: [35, 37, 95, 97]
  }
}
