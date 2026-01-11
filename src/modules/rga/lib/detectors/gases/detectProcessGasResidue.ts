/**
 * Process Gas Residue Detector (NF₃, SF₆, WF₆)
 *
 * Detects semiconductor/industrial process gas residues:
 * - NF₃ (nitrogen trifluoride): m/z 52 (main fragment), m52/m71 > 1.5
 * - SF₆ (sulfur hexafluoride): m/z 127 (SF₅⁺), m127/m89 > 3
 * - WF₆ (tungsten hexafluoride): m/z 279
 *
 * These indicate incomplete chamber cleaning cycle!
 *
 * Cross-Validation Status: ⬜ PENDING VALIDATION
 * - Not yet validated by Gemini/Grok
 * - TODO: Submit for cross-validation
 *
 * References:
 * - NIST WebBook (NF₃, SF₆, WF₆ mass spectra)
 * - SEMI Standards (Process gas detection)
 *
 * @see NextFeatures/REVERSE_SPEC_detectProcessGasResidue.md
 */

import { DiagnosisType, type DiagnosticResult, type DiagnosisInput, DEFAULT_THRESHOLDS } from '../shared/types'
import { getPeak, createEvidence } from '../shared/helpers'

export function detectProcessGasResidue(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  const m52 = getPeak(peaks, 52)    // NF₃
  const m71 = getPeak(peaks, 71)    // NF₃ parent
  const m127 = getPeak(peaks, 127)  // SF₆
  const m89 = getPeak(peaks, 89)    // SF₆ fragment
  const m279 = getPeak(peaks, 279)  // WF₆

  const evidence = []
  let confidence = 0
  const detectedGases: string[] = []
  const affectedMasses: number[] = []

  // NF₃ Check
  if (m52 > 0.01 && m52 / Math.max(m71, 0.001) > 1.5) {
    evidence.push(createEvidence(
      'presence',
      `NF₃ detektiert: m/z 52 = ${(m52 * 100).toFixed(3)}%`,
      `NF₃ detected: m/z 52 = ${(m52 * 100).toFixed(3)}%`,
      true,
      m52 * 100
    ))
    detectedGases.push('NF₃')
    affectedMasses.push(52, 71)
    confidence += 0.3
  }

  // SF₆ Check
  if (m127 > 0.01 && m127 / Math.max(m89, 0.001) > 3) {
    evidence.push(createEvidence(
      'presence',
      `SF₆ detektiert: m/z 127 = ${(m127 * 100).toFixed(3)}%`,
      `SF₆ detected: m/z 127 = ${(m127 * 100).toFixed(3)}%`,
      true,
      m127 * 100
    ))
    detectedGases.push('SF₆')
    affectedMasses.push(127, 89)
    confidence += 0.3
  }

  // WF₆ Check
  if (m279 > 0.005) {
    evidence.push(createEvidence(
      'presence',
      `WF₆ detektiert: m/z 279 = ${(m279 * 100).toFixed(4)}%`,
      `WF₆ detected: m/z 279 = ${(m279 * 100).toFixed(4)}%`,
      true,
      m279 * 100
    ))
    detectedGases.push('WF₆')
    affectedMasses.push(279)
    confidence += 0.3
  }

  if (detectedGases.length === 0 || confidence < DEFAULT_THRESHOLDS.minConfidence) return null

  return {
    type: DiagnosisType.PROCESS_GAS_RESIDUE,
    name: `Prozessgas-Rückstand (${detectedGases.join(', ')})`,
    nameEn: `Process Gas Residue (${detectedGases.join(', ')})`,
    description: `Prozessgas-Rückstand detektiert: ${detectedGases.join(', ')}.`,
    descriptionEn: `Process gas residue detected: ${detectedGases.join(', ')}.`,
    confidence: Math.min(confidence, 1.0),
    severity: 'warning',
    evidence,
    recommendation: 'Kammer-Reinigungszyklus unvollständig. Baseline nicht erreicht.',
    recommendationEn: 'Chamber cleaning cycle incomplete. Baseline not reached.',
    affectedMasses
  }
}
