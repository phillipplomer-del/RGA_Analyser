/**
 * Solvent Residue Detector
 *
 * Detects common solvent residues after cleaning:
 * - Acetone: m43/m58 ratio ≈ 3-4
 * - Isopropanol: m/z 45 (base peak)
 * - Ethanol: m/z 31 (base peak) + m/z 46 (parent)
 * - Methanol: m/z 31 (base peak) + m/z 32 (parent)
 *
 * Cross-Validation Status: ⬜ PENDING VALIDATION
 * - Not yet validated by Gemini/Grok
 * - TODO: Submit for cross-validation
 *
 * References:
 * - NIST WebBook (Acetone, IPA, Ethanol, Methanol spectra)
 * - PNNL (Mass spectra patterns for solvents)
 *
 * @see NextFeatures/REVERSE_SPEC_detectSolventResidue.md
 */

import { DiagnosisType, type DiagnosticResult, type DiagnosisInput, type EvidenceItem, DEFAULT_THRESHOLDS } from '../../shared/types'
import { getPeak, createEvidence } from '../../shared/helpers'

export function detectSolventResidue(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input
  const evidence: EvidenceItem[] = []
  let confidence = 0
  let solventType = ''
  const affectedMasses: number[] = []

  // Aceton (CH₃COCH₃, M=58)
  const m43 = getPeak(peaks, 43)
  const m58 = getPeak(peaks, 58)
  if (m43 > DEFAULT_THRESHOLDS.minPeakHeight && m58 > 0) {
    const ratio = m43 / m58
    if (ratio >= 2 && ratio <= 5) {
      evidence.push(createEvidence(
        'pattern',
        `Aceton-Pattern: m43/m58 = ${ratio.toFixed(1)} (erwartet: 3-4)`,
        `Acetone pattern: m43/m58 = ${ratio.toFixed(1)} (expected: 3-4)`,
        true,
        ratio,
        { min: 2, max: 5 }
      ))
      confidence += 0.4
      solventType = 'Aceton'
      affectedMasses.push(43, 58, 15)
    }
  }

  // Isopropanol (IPA, M=60)
  const m45 = getPeak(peaks, 45)
  if (m45 > DEFAULT_THRESHOLDS.minPeakHeight && m45 > m43 * 0.5) {
    evidence.push(createEvidence(
      'presence',
      `Isopropanol-Marker: m/z 45 (Base Peak) = ${(m45 * 100).toFixed(2)}%`,
      `Isopropanol marker: m/z 45 (base peak) = ${(m45 * 100).toFixed(2)}%`,
      true,
      m45 * 100
    ))
    confidence += 0.3
    if (!solventType) solventType = 'Isopropanol'
    else solventType += '/Isopropanol'
    affectedMasses.push(45, 43, 27)
  }

  // Ethanol/Methanol (Alkohole, m31 Base Peak)
  const m31 = getPeak(peaks, 31)
  const m46 = getPeak(peaks, 46)
  if (m31 > DEFAULT_THRESHOLDS.minPeakHeight) {
    if (m46 > 0) {
      evidence.push(createEvidence(
        'pattern',
        `Ethanol-Pattern: m31 (Base) + m46 (Parent)`,
        `Ethanol pattern: m31 (base) + m46 (parent)`,
        true
      ))
      confidence += 0.3
      if (!solventType) solventType = 'Ethanol'
      else solventType += '/Ethanol'
      affectedMasses.push(31, 45, 46)
    } else {
      const m32 = getPeak(peaks, 32)
      if (m32 > m31 * 0.5) {
        evidence.push(createEvidence(
          'pattern',
          `Methanol-Pattern: m31 (Base) + m32 (Parent)`,
          `Methanol pattern: m31 (base) + m32 (parent)`,
          true
        ))
        confidence += 0.25
        if (!solventType) solventType = 'Methanol'
        else solventType += '/Methanol'
        affectedMasses.push(31, 32, 29)
      }
    }
  }

  if (confidence < DEFAULT_THRESHOLDS.minConfidence || !solventType) return null

  return {
    type: DiagnosisType.SOLVENT_RESIDUE,
    name: `Lösemittel-Rückstand (${solventType})`,
    nameEn: `Solvent Residue (${solventType})`,
    description: `${solventType}-Signatur detektiert. Typisch nach Reinigung.`,
    descriptionEn: `${solventType} signature detected. Typical after cleaning.`,
    confidence: Math.min(confidence, 1.0),
    severity: 'warning',
    evidence,
    recommendation: 'Lösemittel diffundieren in Elastomere. Länger pumpen oder ausheizen (>100°C). O-Ringe ggf. austauschen.',
    recommendationEn: 'Solvents diffuse into elastomers. Pump longer or bake out (>100°C). Consider replacing O-rings.',
    affectedMasses: [...new Set(affectedMasses)]
  }
}
