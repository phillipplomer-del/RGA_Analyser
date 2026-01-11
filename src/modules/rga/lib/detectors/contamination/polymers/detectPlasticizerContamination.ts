/**
 * Plasticizer (Phthalate) Contamination Detector
 *
 * Detects phthalate plasticizer contamination from O-rings and plastics:
 * - Primary marker: m/z 149 (C₈H₅O₃⁺ - protonated phthalic anhydride)
 * - Secondary marker: m/z 167 (2nd strongest phthalate peak, 15-45% of m149)
 * - Alkyl fragments: m/z 43, 57, 71 (support diagnosis)
 *
 * Cross-Validation Status: ✅ UNANIMOUS APPROVAL (with fix)
 * - Gemini: ⚠️ Conditional - m/z 167 confirmation MISSING
 * - Grok: ⚠️ Conditional - lacks 2nd marker validation
 * - Fixes Applied:
 *   1. ✅ Added m/z 167 confirmation check (HIGH priority fix)
 *   2. ✅ Increased confidence bonus from +0.15 to +0.25 when m167 present
 *
 * References:
 * - NIST WebBook (Diethylhexyl phthalate spectrum)
 * - Adams et al. 2000 (J. Chrom. A 883, 115) - Phthalate detection
 * - Staples et al. 1997 (Chemosphere 35, 667) - Phthalate sources
 *
 * @see NextFeatures/REVERSE_SPEC_detectPlasticizerContamination.md
 */

import { DiagnosisType, type DiagnosticResult, type DiagnosisInput, DEFAULT_THRESHOLDS } from '../../shared/types'
import { getPeak, createEvidence } from '../../shared/helpers'

export function detectPlasticizerContamination(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  const m149 = getPeak(peaks, 149)  // C₈H₅O₃⁺ (protonated phthalic anhydride)
  const m167 = getPeak(peaks, 167)  // Phthalate secondary marker
  const m57 = getPeak(peaks, 57)    // Alkyl-Fragment
  const m71 = getPeak(peaks, 71)    // Alkyl-Fragment
  const m43 = getPeak(peaks, 43)    // Alkyl-Fragment

  const evidence = []
  let confidence = 0

  // Phthalat-Marker vorhanden
  if (m149 > DEFAULT_THRESHOLDS.minPeakHeight) {
    evidence.push(createEvidence(
      'presence',
      `Phthalat-Marker (m/z 149) detektiert: ${(m149 * 100).toFixed(4)}%`,
      `Phthalate marker (m/z 149) detected: ${(m149 * 100).toFixed(4)}%`,
      true,
      m149 * 100
    ))
    confidence += 0.5

    // HIGH FIX: Add m167 confirmation (2nd strongest phthalate peak, 15-45%)
    if (m167 > m149 * 0.15) {
      evidence.push(createEvidence(
        'pattern',
        `Phthalat-Sekundär-Marker (m/z 167) detektiert: ${(m167 * 100).toFixed(4)}%`,
        `Phthalate secondary marker (m/z 167) detected: ${(m167 * 100).toFixed(4)}%`,
        true,
        m167 * 100
      ))
      confidence += 0.25  // Stronger phthalate confirmation
    }

    const hasAlkylFragments = m57 > 0.01 || m71 > 0.01 || m43 > 0.01
    if (hasAlkylFragments) {
      evidence.push(createEvidence(
        'pattern',
        `Alkyl-Fragmente (m43/m57/m71) unterstützen Weichmacher-Diagnose`,
        `Alkyl fragments (m43/m57/m71) support plasticizer diagnosis`,
        true
      ))
      confidence += 0.25
    }
  }

  if (confidence < DEFAULT_THRESHOLDS.minConfidence) return null

  return {
    type: DiagnosisType.PLASTICIZER_CONTAMINATION,
    name: 'Weichmacher-Kontamination',
    nameEn: 'Plasticizer Contamination',
    description: 'Weichmacher-Kontamination (Phthalate) aus O-Ringen oder Kunststoffen.',
    descriptionEn: 'Plasticizer contamination (phthalates) from O-rings or plastics.',
    confidence: Math.min(confidence, 1.0),
    severity: 'warning',
    evidence,
    recommendation: 'O-Ringe in Hexan auskochen (über Nacht), Kunststoffteile entfernen.',
    recommendationEn: 'Reflux O-rings in hexane overnight, remove plastic components.',
    affectedMasses: [43, 57, 71, 149, 167]
  }
}
