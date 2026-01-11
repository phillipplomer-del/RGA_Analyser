/**
 * Silicone (PDMS) Contamination Detector
 *
 * Detects polydimethylsiloxane (PDMS) and silicone grease contamination:
 * - Primary marker: m/z 73 ((CH₃)₃Si⁺ - trimethylsilyl)
 * - Secondary marker: m/z 59 (C₃H₇Si⁺ - critical PDMS marker)
 * - PDMS dimer marker: m/z 147 (higher molecular weight confirmation)
 *
 * Cross-Validation Status: ⬜ PENDING VALIDATION
 * - Not yet validated by Gemini/Grok
 * - TODO: Submit for cross-validation
 *
 * References:
 * - NIST WebBook (PDMS spectrum)
 * - Springer (SIMS analysis of PDMS)
 * - Hiden Analytical (Silicone contamination patterns)
 *
 * @see NextFeatures/REVERSE_SPEC_detectSiliconeContamination.md
 */

import { DiagnosisType, type DiagnosticResult, type DiagnosisInput, DEFAULT_THRESHOLDS } from '../../shared/types'
import { getPeak, createEvidence } from '../../shared/helpers'

export function detectSiliconeContamination(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  const m73 = getPeak(peaks, 73)   // (CH₃)₃Si⁺ - Trimethylsilyl
  const m59 = getPeak(peaks, 59)   // C₃H₇Si⁺
  const m147 = getPeak(peaks, 147) // PDMS dimer fragment

  if (m73 < DEFAULT_THRESHOLDS.minPeakHeight * 5) return null

  const evidence = []
  let confidence = 0

  evidence.push(createEvidence(
    'presence',
    `Trimethylsilyl-Fragment (m/z 73) detektiert: ${(m73 * 100).toFixed(3)}%`,
    `Trimethylsilyl fragment (m/z 73) detected: ${(m73 * 100).toFixed(3)}%`,
    true,
    m73 * 100
  ))
  confidence += 0.5

  // m/z 59: Critical PDMS marker (C₃H₇Si⁺) - Springer, Hiden SIMS
  if (m59 > DEFAULT_THRESHOLDS.minPeakHeight) {
    evidence.push(createEvidence(
      'presence',
      `C₃H₇Si⁺-Fragment (m/z 59) detektiert: ${(m59 * 100).toFixed(3)}%`,
      `C₃H₇Si⁺ fragment (m/z 59) detected: ${(m59 * 100).toFixed(3)}%`,
      true
    ))
    confidence += 0.2
  }

  // m/z 147: PDMS dimer marker for higher molecular weight confirmation
  if (m147 > DEFAULT_THRESHOLDS.minPeakHeight) {
    evidence.push(createEvidence(
      'presence',
      `PDMS-Dimer-Fragment (m/z 147) detektiert: ${(m147 * 100).toFixed(3)}%`,
      `PDMS dimer fragment (m/z 147) detected: ${(m147 * 100).toFixed(3)}%`,
      true
    ))
    confidence += 0.2
  }

  return {
    type: DiagnosisType.SILICONE_CONTAMINATION,
    name: 'Silikon-Kontamination',
    nameEn: 'Silicone Contamination',
    description: 'PDMS/Silikonfett-Signatur detektiert.',
    descriptionEn: 'PDMS/silicone grease signature detected.',
    confidence: Math.min(confidence, 1.0),
    severity: 'warning',
    evidence,
    recommendation: 'Quelle: Silikonfett, Dichtungen, Schläuche. Silikon ist sehr hartnäckig. Betroffene Teile reinigen oder ersetzen.',
    recommendationEn: 'Source: Silicone grease, seals, tubing. Silicone is very persistent. Clean or replace affected parts.',
    affectedMasses: [45, 59, 73, 147]
  }
}
