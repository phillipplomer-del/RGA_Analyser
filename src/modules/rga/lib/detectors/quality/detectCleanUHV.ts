/**
 * Clean UHV System Detector
 *
 * Verifies system meets UHV criteria with no significant contamination:
 * - H₂ dominant (H₂ > H₂O, H₂ > N₂)
 * - Heavy masses (> m/z 45) < 0.1% of total pressure (DESY criterion)
 * - CO₂ very low (< 5% of H₂)
 *
 * This is a quality check detector indicating the system is ready for UHV operation!
 *
 * Cross-Validation Status: ⬜ PENDING VALIDATION
 * - Not yet validated by Gemini/Grok
 * - TODO: Submit for cross-validation
 *
 * References:
 * - DESY (Deutsches Elektronen-Synchrotron) - UHV quality criteria
 * - O'Hanlon 2003 (UHV requirements)
 * - Wutz Handbuch Vakuumtechnik (Cleanliness standards)
 *
 * @see NextFeatures/REVERSE_SPEC_detectCleanUHV.md
 */

import { DiagnosisType, type DiagnosticResult, type DiagnosisInput } from '../shared/types'
import { getPeak, createEvidence } from '../shared/helpers'

export function detectCleanUHV(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  const m2 = getPeak(peaks, 2)
  const m18 = getPeak(peaks, 18)
  const m28 = getPeak(peaks, 28)
  const m44 = getPeak(peaks, 44)

  // Schwere Massen prüfen (Kontaminationsindikator)
  let heavySum = 0
  for (let mass = 45; mass <= 100; mass++) {
    heavySum += getPeak(peaks, mass)
  }

  const evidence = []
  let confidence = 0

  // H₂ dominant
  if (m2 > m18 && m2 > m28) {
    confidence += 0.3
  }

  // Wenig schwere Massen (DESY-Kriterium)
  const totalSum = Object.values(peaks).reduce((a, b) => a + b, 0)
  const heavyRatio = totalSum > 0 ? heavySum / totalSum : 0

  if (heavyRatio < 0.001) {
    evidence.push(createEvidence(
      'ratio',
      `Schwere Massen (>45) < 0.1% des Totaldrucks - HC-frei nach DESY`,
      `Heavy masses (>45) < 0.1% of total pressure - HC-free per DESY`,
      true,
      heavyRatio * 100,
      { max: 0.1 }
    ))
    confidence += 0.4
  }

  // CO₂ niedrig
  if (m44 < m2 * 0.05) {
    evidence.push(createEvidence(
      'ratio',
      `CO₂ sehr niedrig (< 5% von H₂)`,
      `CO₂ very low (< 5% of H₂)`,
      true,
      (m44 / (m2 || 0.001)) * 100,
      { max: 5 }
    ))
    confidence += 0.2
  }

  if (confidence < 0.5) return null

  return {
    type: DiagnosisType.CLEAN_UHV,
    name: 'Sauberes UHV-System',
    nameEn: 'Clean UHV System',
    description: 'System erfüllt UHV-Kriterien. Keine signifikanten Kontaminationen.',
    descriptionEn: 'System meets UHV criteria. No significant contamination.',
    confidence: Math.min(confidence, 1.0),
    severity: 'info',
    evidence,
    recommendation: 'System in gutem Zustand für UHV-Betrieb.',
    recommendationEn: 'System in good condition for UHV operation.',
    affectedMasses: [2]
  }
}
