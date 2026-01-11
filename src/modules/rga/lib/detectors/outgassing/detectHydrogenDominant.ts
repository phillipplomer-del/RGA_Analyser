/**
 * Hydrogen-Dominant System Detector
 *
 * Detects H₂-dominated UHV systems (indicating successful bakeout):
 * - H₂ is dominant peak (>80% of max peak)
 * - H₂ >> H₂O (factor > 5) - bakeout successful
 * - CO/CO₂ significantly lower than H₂
 * - Confidence boost if system is marked as "baked" in metadata
 *
 * This is a positive indicator of good UHV system condition!
 *
 * Cross-Validation Status: ⬜ PENDING VALIDATION
 * - Not yet validated by Gemini/Grok
 * - TODO: Submit for cross-validation
 *
 * References:
 * - Redhead 1997 (Vacuum 47, 491) - Thermal desorption
 * - Wutz Handbuch Vakuumtechnik (H₂ outgassing from stainless steel)
 * - O'Hanlon 2003 (Bakeout procedures and results)
 *
 * @see NextFeatures/REVERSE_SPEC_detectHydrogenDominant.md
 */

import { DiagnosisType, type DiagnosticResult, type DiagnosisInput, type EvidenceItem } from '../shared/types'
import { getPeak, createEvidence } from '../shared/helpers'

export function detectHydrogenDominant(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks, metadata } = input

  // Wenn System bekannterweise ausgeheizt ist, Diagnose verstärken
  const isKnownBaked = metadata?.bakedOut === true

  const m2 = getPeak(peaks, 2)    // H₂
  const m18 = getPeak(peaks, 18)  // H₂O
  const m28 = getPeak(peaks, 28)  // N₂/CO
  const m44 = getPeak(peaks, 44)  // CO₂

  const evidence: EvidenceItem[] = []
  let confidence = 0

  // H₂ ist dominanter Peak
  const allPeaks = Object.values(peaks).filter(v => v > 0)
  const maxPeak = Math.max(...allPeaks, 0)

  if (m2 >= maxPeak * 0.8) {
    evidence.push(createEvidence(
      'presence',
      `H₂ (m/z 2) ist dominanter Peak: ${(m2 * 100).toFixed(1)}%`,
      `H₂ (m/z 2) is dominant peak: ${(m2 * 100).toFixed(1)}%`,
      true,
      m2 * 100
    ))
    confidence += 0.4
  }

  // H₂ > H₂O
  if (m2 > m18 * 5) {
    evidence.push(createEvidence(
      'ratio',
      `H₂ >> H₂O (Faktor ${(m2 / (m18 || 0.001)).toFixed(1)}) - Bakeout erfolgreich`,
      `H₂ >> H₂O (factor ${(m2 / (m18 || 0.001)).toFixed(1)}) - Bakeout successful`,
      true,
      m2 / (m18 || 0.001),
      { min: 5 }
    ))
    confidence += 0.3
  }

  // CO/CO₂ niedrig
  if (m28 < m2 * 0.2 && m44 < m2 * 0.1) {
    evidence.push(createEvidence(
      'ratio',
      `CO/CO₂ deutlich niedriger als H₂ - typisch für Edelstahl nach Bakeout`,
      `CO/CO₂ significantly lower than H₂ - typical for stainless steel after bakeout`,
      true
    ))
    confidence += 0.2
  }

  // Wenn System ausgeheizt ist: Konfidenz-Boost und Hinweis hinzufügen
  if (isKnownBaked) {
    evidence.push(createEvidence(
      'presence',
      `✅ System ist als "ausgeheizt" markiert (Dateiname) - erwartetes Verhalten`,
      `✅ System marked as "baked" (filename) - expected behavior`,
      true
    ))
    // Konfidenz-Boost bei ausgeheiztem System
    confidence = Math.min(confidence * 1.3, 1.0)
  }

  if (confidence < 0.5) return null

  return {
    type: DiagnosisType.HYDROGEN_DOMINANT,
    name: 'H₂-dominiertes System',
    nameEn: 'H₂-Dominated System',
    description: 'Wasserstoff ist dominantes Restgas. Typisch für gut ausgeheizte UHV-Systeme.',
    descriptionEn: 'Hydrogen is dominant residual gas. Typical for well-baked UHV systems.',
    confidence: Math.min(confidence, 1.0),
    severity: 'info',
    evidence,
    recommendation: 'System in gutem Zustand. H₂-Ausgasung durch Diffusion aus Edelstahl-Bulk ist normal.',
    recommendationEn: 'System in good condition. H₂ outgassing from stainless steel bulk is normal.',
    affectedMasses: [2]
  }
}
