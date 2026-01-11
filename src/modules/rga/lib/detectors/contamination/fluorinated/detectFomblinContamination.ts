/**
 * Fomblin/PFPE Contamination Detector
 *
 * Detects perfluoropolyether (PFPE) oil contamination (Fomblin, Krytox):
 * - Primary marker: m/z 69 (CF₃⁺) - strongest peak
 * - Secondary marker: m/z 50 (CF₂⁺) - 2nd/3rd strongest PFPE peak (5-10%)
 * - Additional: m/z 31 (CF⁺), m/z 47 (CFO⁺)
 * - Anti-pattern: No alkyl peaks (m41, m43, m57) typical for PFPE
 *
 * Cross-Validation Status: ⚠️ CONDITIONAL (Fixes Applied)
 * - Gemini: ⚠️ Conditional - m/z 50 (CF₂⁺) MISSING (critical)
 * - Grok: ⚠️ Conditional - m/z 50 not in logic
 * - Fixes Applied:
 *   1. ✅ Added m/z 50 (CF₂⁺) check - 2nd/3rd strongest PFPE peak
 *   2. ✅ Raised secondary thresholds from 0.1% to 1% (reduce noise)
 *   3. ✅ Removed m/z 20 (HF⁺) from affectedMasses (extrinsic)
 *
 * References:
 * - NIST WebBook (Fomblin Y spectrum)
 * - Solvay Fomblin Product Data
 * - Hiden Analytical (PFPE contamination patterns)
 * - Kurt J. Lesker (RGA Data - PFPE oils)
 *
 * @see NextFeatures/REVERSE_SPEC_detectFomblinContamination.md
 */

import { DiagnosisType, type DiagnosticResult, type DiagnosisInput, DEFAULT_THRESHOLDS } from '../../shared/types'
import { getPeak, createEvidence } from '../../shared/helpers'

export function detectFomblinContamination(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  const m69 = getPeak(peaks, 69)  // CF₃⁺ - main marker
  const m31 = getPeak(peaks, 31)  // CF⁺
  const m47 = getPeak(peaks, 47)  // CFO⁺
  const m50 = getPeak(peaks, 50)  // CF₂⁺ - CRITICAL FIX

  // Fomblin needs m69 as strong peak
  if (m69 < DEFAULT_THRESHOLDS.minPeakHeight * 10) return null

  const evidence = []
  let confidence = 0

  evidence.push(createEvidence(
    'presence',
    `CF₃⁺ (m/z 69) detektiert: ${(m69 * 100).toFixed(2)}%`,
    `CF₃⁺ (m/z 69) detected: ${(m69 * 100).toFixed(2)}%`,
    true,
    m69 * 100
  ))
  confidence += 0.4

  // CRITICAL FIX: Check m/z 50 (CF₂⁺) - 2nd/3rd strongest PFPE peak (5-10%)
  if (m50 > DEFAULT_THRESHOLDS.minPeakHeight * 50) {
    evidence.push(createEvidence(
      'presence',
      `CF₂⁺ (m/z 50) detektiert: ${(m50 * 100).toFixed(2)}%`,
      `CF₂⁺ (m/z 50) detected: ${(m50 * 100).toFixed(2)}%`,
      true,
      m50 * 100
    ))
    confidence += 0.2
  }

  // Anti-pattern: NO alkyl peaks
  const m41 = getPeak(peaks, 41)
  const m43 = getPeak(peaks, 43)
  const m57 = getPeak(peaks, 57)

  const noAlkyl = m41 < m69 * 0.3 && m43 < m69 * 0.5 && m57 < m69 * 0.5
  evidence.push(createEvidence(
    'absence',
    noAlkyl
      ? 'Keine signifikanten Alkyl-Peaks (m41/43/57) - typisch für PFPE'
      : 'Alkyl-Peaks vorhanden - möglicherweise Mischung mit Mineralöl',
    noAlkyl
      ? 'No significant alkyl peaks (m41/43/57) - typical for PFPE'
      : 'Alkyl peaks present - possibly mixed with mineral oil',
    noAlkyl
  ))

  if (noAlkyl) confidence += 0.3

  // Additional PFPE markers - FIXED: Raised threshold from 0.1% to 1% to reduce noise
  if (m31 > DEFAULT_THRESHOLDS.minPeakHeight * 10 || m47 > DEFAULT_THRESHOLDS.minPeakHeight * 10) {
    evidence.push(createEvidence(
      'presence',
      `Weitere PFPE-Fragmente: CF⁺ (m31), CFO⁺ (m47)`,
      `Additional PFPE fragments: CF⁺ (m31), CFO⁺ (m47)`,
      true
    ))
    confidence += 0.2
  }

  if (confidence < DEFAULT_THRESHOLDS.minConfidence) return null

  return {
    type: DiagnosisType.FOMBLIN_CONTAMINATION,
    name: 'Fomblin/PFPE-Kontamination',
    nameEn: 'Fomblin/PFPE Contamination',
    description: 'Perfluorpolyether (PFPE) Öl-Signatur detektiert.',
    descriptionEn: 'Perfluorpolyether (PFPE) oil signature detected.',
    confidence: Math.min(confidence, 1.0),
    severity: 'critical',
    evidence,
    recommendation: 'Quelle: Diffusionspumpenöl, vakuumkompatibles Fett. Intensive Reinigung erforderlich. PFPE ist hartnäckig!',
    recommendationEn: 'Source: Diffusion pump oil, vacuum-compatible grease. Intensive cleaning required. PFPE is persistent!',
    affectedMasses: [31, 47, 50, 69]  // FIXED: Removed m20 (HF⁺ is extrinsic)
  }
}
