/**
 * Water Outgassing Detector
 *
 * Detects water as dominant residual gas (typical for unbaked systems):
 * - H₂O is dominant peak (>80% of max peak)
 * - Normal H₂O/OH ratio: 3.5-5.0 (typical: 4.3)
 * - H₂O > H₂ indicates need for bakeout
 * - Reduced confidence if system is marked as "baked out" in metadata
 *
 * Cross-Validation Status: ⬜ PENDING VALIDATION
 * - Not yet validated by Gemini/Grok
 * - TODO: Submit for cross-validation
 *
 * References:
 * - NIST WebBook (H₂O mass spectrum at 70 eV EI)
 * - Redhead 1997 (Vacuum 47, 491) - Thermal desorption
 * - O'Hanlon 2003 (Bakeout procedures)
 * - Wutz Handbuch Vakuumtechnik (Outgassing rates)
 *
 * @see NextFeatures/REVERSE_SPEC_detectWaterOutgassing.md
 */

import { DiagnosisType, type DiagnosticResult, type DiagnosisInput, type EvidenceItem, DEFAULT_THRESHOLDS } from '../shared/types'
import { getPeak, createEvidence } from '../shared/helpers'

export function detectWaterOutgassing(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks, metadata } = input

  // Wenn System bekannterweise ausgeheizt ist, Diagnose stark abschwächen
  const isKnownBaked = metadata?.bakedOut === true

  const m18 = getPeak(peaks, 18)  // H₂O⁺
  const m17 = getPeak(peaks, 17)  // OH⁺
  const m2 = getPeak(peaks, 2)    // H₂

  const evidence: EvidenceItem[] = []
  let confidence = 0

  // H₂O ist dominanter Peak
  const allPeaks = Object.values(peaks).filter(v => v > 0)
  const maxPeak = Math.max(...allPeaks, 0)

  if (m18 >= maxPeak * 0.8) {
    evidence.push(createEvidence(
      'presence',
      `H₂O (m/z 18) ist dominanter Peak: ${(m18 * 100).toFixed(1)}%`,
      `H₂O (m/z 18) is dominant peak: ${(m18 * 100).toFixed(1)}%`,
      true,
      m18 * 100
    ))
    confidence += 0.4
  }

  // H₂O/OH Verhältnis prüfen
  if (m17 > 0) {
    const ratio_18_17 = m18 / m17
    const waterRatioOk = ratio_18_17 >= 3.5 && ratio_18_17 <= 5.0

    evidence.push(createEvidence(
      'ratio',
      `H₂O/OH (m18/m17): ${ratio_18_17.toFixed(2)} (H₂O typisch: 4.3)`,
      `H₂O/OH (m18/m17): ${ratio_18_17.toFixed(2)} (H₂O typical: 4.3)`,
      waterRatioOk,
      ratio_18_17,
      { min: 3.5, max: 5.0 }
    ))

    if (waterRatioOk) confidence += 0.3
  }

  // H₂O vs H₂
  if (m2 > 0 && m18 > m2) {
    evidence.push(createEvidence(
      'ratio',
      `H₂O > H₂: System benötigt Ausheizen`,
      `H₂O > H₂: System needs bakeout`,
      true,
      m18 / m2
    ))
    confidence += 0.2
  }

  // Wenn System ausgeheizt ist: Konfidenz stark reduzieren und Hinweis hinzufügen
  if (isKnownBaked) {
    evidence.push(createEvidence(
      'presence',
      `⚠️ System ist als "ausgeheizt" markiert (Dateiname) - Diagnose unwahrscheinlich`,
      `⚠️ System marked as "baked" (filename) - diagnosis unlikely`,
      false  // Negatives Indiz
    ))
    // Konfidenz auf max 15% begrenzen bei ausgeheiztem System
    confidence = Math.min(confidence * 0.3, 0.15)
  }

  if (confidence < DEFAULT_THRESHOLDS.minConfidence) return null

  // Angepasste Beschreibung wenn System ausgeheizt ist
  const description = isKnownBaked
    ? 'Wasser präsent, aber System ist ausgeheizt. Möglicherweise Messung kurz nach Belüftung oder Restwasser.'
    : 'Wasser ist dominantes Restgas. Typisch für nicht ausgeheizte Systeme.'
  const descriptionEn = isKnownBaked
    ? 'Water present but system is baked. Possibly measurement shortly after venting or residual water.'
    : 'Water is dominant residual gas. Typical for unbaked systems.'

  const recommendation = isKnownBaked
    ? 'Prüfen Sie ob die Messung direkt nach einer Belüftung erfolgte. Bei anhaltend hohen Wasserwerten: erneutes Ausheizen.'
    : 'System ausheizen (>120°C, min. 12-24h). Alternative: Längeres Pumpen (Wochen-Monate).'
  const recommendationEn = isKnownBaked
    ? 'Check if measurement was taken right after venting. For persistent high water: rebake.'
    : 'Bake out system (>120°C, min. 12-24h). Alternative: Extended pumping (weeks-months).'

  return {
    type: DiagnosisType.WATER_OUTGASSING,
    name: 'Wasser-Ausgasung',
    nameEn: 'Water Outgassing',
    description,
    descriptionEn,
    confidence: Math.min(confidence, 1.0),
    severity: isKnownBaked ? 'info' : 'info',
    evidence,
    recommendation,
    recommendationEn,
    affectedMasses: [16, 17, 18]
  }
}
