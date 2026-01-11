/**
 * Helium Leak Indicator Detector
 *
 * Detects helium signal at m/z 4 (He⁺ or D₂⁺):
 * - Primary marker: m/z 4 signal above threshold
 * - RSF-corrected He/H₂ ratio (accounts for ionization efficiency)
 * - D₂/He distinction via m/z 3 (HD)
 *
 * IMPORTANT: RGA is NOT sensitive enough for quantitative leak rate determination!
 * Use dedicated helium leak detector for leak localization (sensitivity: ~5×10⁻¹² mbar·l/s).
 *
 * Cross-Validation Status: ⚠️ CONDITIONAL (Fixes Applied)
 * - Gemini: ⚠️ Conditional - RSF correction missing, threshold too strict
 * - Grok: ⚠️ Conditional - D₂/He overlap penalty too weak
 * - Fixes Applied:
 *   1. ✅ Added RSF correction for He/H₂ ratio (RSF_He=0.15, RSF_H2=0.44)
 *   2. ✅ Adjusted threshold to 3% (was 1%) after RSF correction
 *   3. ✅ Increased D₂ uncertainty penalty from -0.1 to -0.3
 *
 * References:
 * - NIST WebBook (He mass spectrum, 70 eV EI)
 * - Hiden Analytical (RSF values for He, H₂, D₂)
 * - ISO 3530 (Leak detection with helium)
 * - AVS Standards (He leak testing procedures)
 *
 * @see NextFeatures/REVERSE_SPEC_detectHeliumLeak.md
 */

import { DiagnosisType, type DiagnosticResult, type DiagnosisInput, DEFAULT_THRESHOLDS } from '../shared/types'
import { getPeak, createEvidence } from '../shared/helpers'

export function detectHeliumLeak(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  const m4 = getPeak(peaks, 4)    // He⁺ (oder D₂⁺)
  const m2 = getPeak(peaks, 2)    // H₂⁺ (Referenz)
  const m3 = getPeak(peaks, 3)    // HD⁺

  // Minimale Nachweisgrenze für He
  if (m4 < DEFAULT_THRESHOLDS.minPeakHeight) return null

  const evidence = []
  let confidence = 0

  // Primärkriterium: m/z=4 Signal vorhanden
  evidence.push(createEvidence(
    'peak',
    `m/z 4 (He/D₂) Signal: ${(m4 * 100).toFixed(3)}%`,
    `m/z 4 (He/D₂) signal: ${(m4 * 100).toFixed(3)}%`,
    true,
    m4 * 100
  ))
  confidence += 0.3

  // Sekundärkriterium: Verhältnis zu H₂ (RSF-korrigiert)
  if (m2 > 0) {
    const RSF_He = 0.15   // Helium relative sensitivity (NIST/Hiden Analytical)
    const RSF_H2 = 0.44   // Hydrogen relative sensitivity
    const ratio_4_2 = (m4 / RSF_He) / (m2 / RSF_H2)

    // Wenn RSF-korrigiertes He/H₂ > 0.03 (3%), dann auffällig
    if (ratio_4_2 > 0.03) {
      evidence.push(createEvidence(
        'ratio',
        `He/H₂-Verhältnis (RSF-korrigiert) auffällig: ${ratio_4_2.toFixed(3)} (${(ratio_4_2 * 100).toFixed(1)}%)`,
        `He/H₂ ratio (RSF-corrected) notable: ${ratio_4_2.toFixed(3)} (${(ratio_4_2 * 100).toFixed(1)}%)`,
        true,
        ratio_4_2,
        { min: 0.03 }
      ))
      confidence += 0.4
    } else {
      evidence.push(createEvidence(
        'ratio',
        `He/H₂-Verhältnis: ${ratio_4_2.toFixed(3)} (${(ratio_4_2 * 100).toFixed(1)}%)`,
        `He/H₂ ratio: ${ratio_4_2.toFixed(3)} (${(ratio_4_2 * 100).toFixed(1)}%)`,
        true,
        ratio_4_2
      ))
      confidence += 0.2
    }
  }

  // Zusatzinfo: D₂ vs. He Unterscheidung schwierig
  // m/z 3 (HD) deutet auf Deuterium hin
  if (m3 > DEFAULT_THRESHOLDS.minPeakHeight) {
    evidence.push(createEvidence(
      'presence',
      `m/z 3 (HD) detektiert: Signal könnte teilweise von D₂ stammen`,
      `m/z 3 (HD) detected: signal could partially be from D₂`,
      true,
      m3 * 100
    ))
    confidence -= 0.3 // FIXED: Stronger uncertainty penalty (was -0.1) - D₂/He overlap
  }

  // Absoluter Wert wichtig: nur bei relevantem Signal melden
  if (m4 < 0.01) return null // Zu schwaches Signal

  // Mindestens 0.3 Konfidenz erforderlich
  if (confidence < DEFAULT_THRESHOLDS.minConfidence) return null

  return {
    type: DiagnosisType.HELIUM_LEAK_INDICATOR,
    name: 'Helium-Signal auffällig',
    nameEn: 'Helium Signal Detected',
    description: `Helium (m/z 4) bei ${(m4 * 100).toFixed(2)}% detektiert. Mögliche Quellen: He-Leck, He-Tracergas, D₂ (Deuterium). HINWEIS: RGA ist NICHT sensitiv genug für quantitative Leckratenbestimmung!`,
    descriptionEn: `Helium (m/z 4) detected at ${(m4 * 100).toFixed(2)}%. Possible sources: He leak, He tracer gas, D₂ (deuterium). NOTE: RGA is NOT sensitive enough for quantitative leak rate determination!`,
    confidence: Math.min(confidence, 1.0),
    severity: 'info',
    evidence,
    recommendation: 'Helium-Signal detektiert. Empfohlenes Vorgehen: (1) Bei Verdacht auf Leck → Dedizierten He-Leckdetektor einsetzen (Sensitivität: ~5×10⁻¹² mbar·l/s). (2) Bei He-Tracergas-Test → Signal bestätigt He-Anwesenheit. (3) Bei D₂-Nutzung → m/z 3 (HD) prüfen zur Unterscheidung.',
    recommendationEn: 'Helium signal detected. Recommended procedure: (1) If leak suspected → Use dedicated He leak detector (sensitivity: ~5×10⁻¹² mbar·l/s). (2) If He tracer gas test → Signal confirms He presence. (3) If D₂ in use → Check m/z 3 (HD) to distinguish.',
    affectedMasses: [4, 3]
  }
}
