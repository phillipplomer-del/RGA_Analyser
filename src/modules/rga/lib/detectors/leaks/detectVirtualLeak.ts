/**
 * Virtual Leak Detector
 *
 * Detects virtual leaks (trapped volumes) by analyzing air-like patterns with anomalies:
 * - Air-like N₂/O₂ ratio (3.0-4.5) BUT with:
 *   - High H₂O content (H₂O > 2×O₂)
 *   - Missing or very low Ar (< 1.5% of O₂)
 *   - Elevated N₂/O₂ ratio (> 4.5) due to O₂ adsorption
 *
 * Virtual leak sources: Blind holes, O-ring channels, screwed feedthroughs
 *
 * Cross-Validation Status: ⬜ PENDING VALIDATION
 * - Not yet validated by Gemini/Grok
 * - TODO: Submit for cross-validation
 *
 * References:
 * - O'Hanlon 2003 (User's Guide to Vacuum Technology) - Virtual leaks
 * - Wutz Handbuch Vakuumtechnik (Virtual leak identification)
 * - ISO 3530 (Leak detection)
 *
 * @see NextFeatures/REVERSE_SPEC_detectVirtualLeak.md
 */

import { DiagnosisType, type DiagnosticResult, type DiagnosisInput, type EvidenceItem, DEFAULT_THRESHOLDS } from '../shared/types'
import { getPeak, createEvidence } from '../shared/helpers'

export function detectVirtualLeak(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  const m28 = getPeak(peaks, 28) // N₂/CO
  const m32 = getPeak(peaks, 32) // O₂
  const m40 = getPeak(peaks, 40) // Ar
  const m18 = getPeak(peaks, 18) // H₂O

  const evidence: EvidenceItem[] = []
  let confidence = 0

  // Virtuelles Leck: Luft-ähnliche Zusammensetzung ABER mit Besonderheiten
  if (m32 > DEFAULT_THRESHOLDS.minPeakHeight) {
    const ratio_28_32 = m28 / m32
    const airLike = ratio_28_32 >= 3.0 && ratio_28_32 <= 4.5

    if (airLike) {
      // Virtuelles Leck: Typischerweise hoher H₂O-Anteil
      const highWater = m18 > m32 * 2

      if (highWater) {
        evidence.push(createEvidence(
          'ratio',
          `Luft-Pattern mit erhöhtem H₂O: H₂O/O₂ = ${(m18 / m32).toFixed(1)}`,
          `Air pattern with elevated H₂O: H₂O/O₂ = ${(m18 / m32).toFixed(1)}`,
          true,
          m18 / m32,
          { min: 2 }
        ))
        confidence += 0.3
      }

      // Virtuelles Leck: Oft OHNE oder mit wenig Ar
      if (m40 < m32 * 0.015) {
        evidence.push(createEvidence(
          'absence',
          `Ar fehlt oder sehr niedrig (${(m40 * 100).toFixed(3)}%) - typisch für virtuelles Leck`,
          `Ar missing or very low (${(m40 * 100).toFixed(3)}%) - typical for virtual leak`,
          true,
          m40 * 100
        ))
        confidence += 0.3
      }

      // N₂/O₂ leicht abweichend (O₂ adsorbiert schneller)
      if (ratio_28_32 > 4.5) {
        evidence.push(createEvidence(
          'ratio',
          `N₂/O₂ erhöht: ${ratio_28_32.toFixed(2)} - O₂ adsorbiert schneller an Wänden`,
          `N₂/O₂ elevated: ${ratio_28_32.toFixed(2)} - O₂ adsorbs faster on walls`,
          true,
          ratio_28_32
        ))
        confidence += 0.2
      }
    }
  }

  evidence.push(createEvidence(
    'pattern',
    'Hinweis: He-Lecktest durchführen - bei virtuellem Leck negativ',
    'Note: Perform He leak test - negative for virtual leak',
    true
  ))

  if (confidence < DEFAULT_THRESHOLDS.minConfidence) return null

  return {
    type: DiagnosisType.VIRTUAL_LEAK,
    name: 'Virtuelles Leck vermutet',
    nameEn: 'Virtual Leak Suspected',
    description: 'Luft-Zusammensetzung mit Anzeichen für eingefangenes Volumen.',
    descriptionEn: 'Air composition with signs of trapped volume.',
    confidence: Math.min(confidence, 1.0),
    severity: 'warning',
    evidence,
    recommendation: 'He-Lecktest durchführen (sollte negativ sein). Quellen: Sackbohrungen, O-Ring-Kanäle, verschraubte Durchführungen.',
    recommendationEn: 'Perform He leak test (should be negative). Sources: Blind holes, O-ring channels, screwed feedthroughs.',
    affectedMasses: [14, 28, 32, 40]
  }
}
