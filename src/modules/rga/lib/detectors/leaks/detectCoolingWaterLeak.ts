/**
 * Cooling Water Leak Detector
 *
 * Detects catastrophic cooling water leaks by identifying H₂O saturation pressure:
 * - Pressure stabilized at 15-30 mbar (H₂O saturation at RT: ~23 mbar)
 * - H₂O fraction > 90% of total intensity
 *
 * CRITICAL: This indicates immediate danger to vacuum system!
 *
 * Cross-Validation Status: ⬜ PENDING VALIDATION
 * - Not yet validated by Gemini/Grok
 * - TODO: Submit for cross-validation
 *
 * References:
 * - CRC Handbook (Water vapor pressure at room temperature)
 * - O'Hanlon 2003 (Emergency procedures for water leaks)
 * - Wutz Handbuch Vakuumtechnik (Leak detection)
 *
 * @see NextFeatures/REVERSE_SPEC_detectCoolingWaterLeak.md
 */

import { DiagnosisType, type DiagnosticResult, type DiagnosisInput } from '../shared/types'
import { getPeak, createEvidence } from '../shared/helpers'

export function detectCoolingWaterLeak(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks, totalPressure } = input

  const m18 = getPeak(peaks, 18)  // H₂O

  const evidence = []
  let confidence = 0

  // Prüfe ob Druck bei ~20-25 mbar stabilisiert (Sättigungsdampfdruck H₂O bei RT)
  if (totalPressure && totalPressure > 15 && totalPressure < 30) {
    evidence.push(createEvidence(
      'presence',
      `Druck stabilisiert bei ${totalPressure.toFixed(1)} mbar (H₂O Sättigung bei RT: ~23 mbar)`,
      `Pressure stabilized at ${totalPressure.toFixed(1)} mbar (H₂O saturation at RT: ~23 mbar)`,
      true,
      totalPressure,
      { min: 15, max: 30 }
    ))
    confidence += 0.4

    // H₂O muss absolut dominant sein
    const allPeaks = Object.values(peaks).filter(v => v > 0)
    const totalIntensity = allPeaks.reduce((a, b) => a + b, 0)
    const waterFraction = totalIntensity > 0 ? m18 / totalIntensity : 0

    if (waterFraction > 0.9) {
      evidence.push(createEvidence(
        'ratio',
        `H₂O-Anteil: ${(waterFraction * 100).toFixed(1)}% (>90% = Kühlwasser-Leck)`,
        `H₂O fraction: ${(waterFraction * 100).toFixed(1)}% (>90% = cooling water leak)`,
        true,
        waterFraction * 100,
        { min: 90 }
      ))
      confidence += 0.5
    }
  }

  if (confidence < 0.5) return null

  return {
    type: DiagnosisType.COOLING_WATER_LEAK,
    name: 'Kühlwasser-Leck',
    nameEn: 'Cooling Water Leak',
    description: 'Kühlwasser-Leck! Druck stabilisiert bei H₂O-Sättigungsdampfdruck.',
    descriptionEn: 'Cooling water leak! Pressure stabilized at H₂O saturation pressure.',
    confidence: Math.min(confidence, 1.0),
    severity: 'critical',
    evidence,
    recommendation: 'SOFORT System belüften! Wärmetauscher und Kühlkreislauf prüfen!',
    recommendationEn: 'IMMEDIATELY vent system! Check heat exchanger and cooling circuit!',
    affectedMasses: [16, 17, 18]
  }
}
