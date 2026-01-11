/**
 * ⚠️ DEPRECATED - This file is being phased out
 *
 * 📌 NEW LOCATION: src/modules/rga/lib/detectors/
 *
 * All 21 detectors have been migrated to a modular architecture:
 * - Leaks: detectAirLeak, detectHeliumLeak, detectVirtualLeak, detectCoolingWaterLeak
 * - Contamination: detectOilBackstreaming, detectFomblinContamination, detectPolymer*, detectSilicone*, detectSolvent*, detectAromatic
 * - Outgassing: detectWaterOutgassing, detectHydrogenDominant
 * - Artifacts: detectESDartifacts
 * - Gases: detectAmmonia, detectMethane, detectSulfur, detectProcessGasResidue
 * - Isotopes: verifyIsotopeRatios
 * - Quality: detectCleanUHV
 *
 * Import from: import { detectAirLeak } from '@/modules/rga/lib/detectors'
 *
 * This file now only contains:
 * - distinguishN2fromCO (pending migration)
 *
 * Migration completed: 2026-01-11
 * See: src/modules/rga/lib/detectors/README.md
 *
 * @deprecated Use @/modules/rga/lib/detectors instead
 */

import {
  DiagnosisType,
  type DiagnosticResult,
  type DiagnosisInput,
  type EvidenceItem,
  DEFAULT_THRESHOLDS
} from './types'

import {
  detectAirLeak as detectAirLeakIsotope,
  detectOilContamination as detectOilIsotope,
  checkIsotopeRatio,
  getIsotopeRatio
} from '../knowledge/isotopePatterns'

// Helper: Peak-Wert holen mit Fallback
function getPeak(peaks: Record<number, number>, mass: number): number {
  return peaks[mass] || 0
}

// Helper: Evidence erstellen
function createEvidence(
  type: EvidenceItem['type'],
  description: string,
  descriptionEn: string,
  passed: boolean,
  value?: number,
  expected?: { min?: number; max?: number; exact?: number }
): EvidenceItem {
  return { type, description, descriptionEn, passed, value, expected }
}

// ============================================
// 1. LUFTLECK-ERKENNUNG
// ============================================
export function detectAirLeak(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input
  const m28 = getPeak(peaks, 28) // N₂/CO
  const m32 = getPeak(peaks, 32) // O₂
  const m40 = getPeak(peaks, 40) // Ar
  const m14 = getPeak(peaks, 14) // N⁺

  const evidence: EvidenceItem[] = []
  let confidence = 0

  // Primärkriterium: N₂/O₂ Verhältnis ≈ 3.7 (Luft)
  if (m32 > DEFAULT_THRESHOLDS.minPeakHeight) {
    const ratio_28_32 = m28 / m32
    const ratioOk = ratio_28_32 >= 3.0 && ratio_28_32 <= 4.5

    evidence.push(createEvidence(
      'ratio',
      `N₂/O₂-Verhältnis: ${ratio_28_32.toFixed(2)} (Luft: 3.7)`,
      `N₂/O₂ ratio: ${ratio_28_32.toFixed(2)} (air: 3.7)`,
      ratioOk,
      ratio_28_32,
      { min: 3.0, max: 4.5 }
    ))

    if (ratioOk) confidence += 0.4
  }

  // Sekundärkriterium: Argon bei m/z 40
  if (m40 > DEFAULT_THRESHOLDS.minPeakHeight) {
    evidence.push(createEvidence(
      'presence',
      `Argon (m/z 40) detektiert: ${(m40 * 100).toFixed(2)}%`,
      `Argon (m/z 40) detected: ${(m40 * 100).toFixed(2)}%`,
      true,
      m40 * 100
    ))
    confidence += 0.3

    // Ar²⁺ Check bei m/z 20
    const m20 = getPeak(peaks, 20)
    if (m20 > 0) {
      const ar_doubly = m20 / m40
      const arOk = ar_doubly >= 0.05 && ar_doubly <= 0.2
      evidence.push(createEvidence(
        'ratio',
        `Ar²⁺/Ar⁺ (m20/m40): ${ar_doubly.toFixed(3)} (erwartet: 0.1-0.15)`,
        `Ar²⁺/Ar⁺ (m20/m40): ${ar_doubly.toFixed(3)} (expected: 0.1-0.15)`,
        arOk,
        ar_doubly,
        { min: 0.05, max: 0.2 }
      ))
      if (arOk) confidence += 0.1
    }
  }

  // Bestätigung durch N⁺ Fragment
  if (m28 > 0 && m14 > 0) {
    const ratio_28_14 = m28 / m14
    const n2FragmentOk = ratio_28_14 >= 6 && ratio_28_14 <= 20

    evidence.push(createEvidence(
      'ratio',
      `N₂⁺/N⁺ (m28/m14): ${ratio_28_14.toFixed(1)} (N₂ typisch: 14)`,
      `N₂⁺/N⁺ (m28/m14): ${ratio_28_14.toFixed(1)} (N₂ typical: 14)`,
      n2FragmentOk,
      ratio_28_14,
      { min: 6, max: 20 }
    ))

    if (n2FragmentOk) confidence += 0.2
  }

  if (confidence < DEFAULT_THRESHOLDS.minConfidence) return null

  return {
    type: DiagnosisType.AIR_LEAK,
    name: 'Luftleck',
    nameEn: 'Air Leak',
    description: 'Atmosphärische Gase (N₂, O₂, Ar) im typischen Luftverhältnis detektiert.',
    descriptionEn: 'Atmospheric gases (N₂, O₂, Ar) detected in typical air ratio.',
    confidence: Math.min(confidence, 1.0),
    severity: confidence > 0.7 ? 'critical' : 'warning',
    evidence,
    recommendation: 'Dichtigkeitsprüfung mit Helium durchführen. Alle Flansche, Ventile und Durchführungen prüfen.',
    recommendationEn: 'Perform helium leak test. Check all flanges, valves, and feedthroughs.',
    affectedMasses: [14, 28, 32, 40]
  }
}

// ============================================
// 2. ÖL-RÜCKSTRÖMUNG
// ============================================
export function detectOilBackstreaming(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  // Öl-Signatur: Δ14 amu Muster
  const oilMasses = [41, 43, 55, 57, 69, 71, 83, 85]
  const detected: number[] = []
  const evidence: EvidenceItem[] = []

  for (const mass of oilMasses) {
    const value = getPeak(peaks, mass)
    if (value > DEFAULT_THRESHOLDS.minPeakHeight) {
      detected.push(mass)
    }
  }

  if (detected.length < DEFAULT_THRESHOLDS.oilPatternMinPeaks) return null

  // Hauptpeaks prüfen
  const m43 = getPeak(peaks, 43)
  const m57 = getPeak(peaks, 57)
  const m41 = getPeak(peaks, 41)
  const m39 = getPeak(peaks, 39)

  evidence.push(createEvidence(
    'pattern',
    `Öl-Pattern (Δ14 amu): ${detected.length} von 8 Peaks detektiert`,
    `Oil pattern (Δ14 amu): ${detected.length} of 8 peaks detected`,
    detected.length >= 3,
    detected.length,
    { min: 3 }
  ))

  // Charakteristische Paare prüfen
  if (m43 > 0 && m57 > 0) {
    const ratio = m57 / m43
    evidence.push(createEvidence(
      'ratio',
      `C₄H₉⁺/C₃H₇⁺ (m57/m43): ${ratio.toFixed(2)} (Öl typisch: 0.7-0.9)`,
      `C₄H₉⁺/C₃H₇⁺ (m57/m43): ${ratio.toFixed(2)} (oil typical: 0.7-0.9)`,
      ratio >= 0.5 && ratio <= 1.4,
      ratio
    ))
  }

  // Check for m/z 39 aromatic marker
  if (m39 > DEFAULT_THRESHOLDS.minPeakHeight) {
    evidence.push(createEvidence(
      'presence',
      `C₃H₃⁺ (m/z 39) detektiert - aromatischer Marker`,
      `C₃H₃⁺ (m/z 39) detected - aromatic marker`,
      true,
      m39 * 100
    ))
  }

  // Prüfe ob es NICHT Fomblin ist (kein 41/43/57 bei Fomblin, nur 69)
  const m69 = getPeak(peaks, 69)
  if (m69 > m43 && m41 < DEFAULT_THRESHOLDS.minPeakHeight) {
    // Wahrscheinlich Fomblin, nicht Mineralöl
    return null
  }

  let confidence = detected.length / oilMasses.length

  // Turbopumpenöl vs Vorpumpenöl unterscheiden
  const m71 = getPeak(peaks, 71)
  let oilType = 'Vorpumpe'
  if (m71 > 0 && m43 > 0 && m71 / m43 > 0.4) {
    oilType = 'Heavy Hydrocarbons'
    evidence.push(createEvidence(
      'ratio',
      `Hoher m71-Anteil deutet auf schwere Kohlenwasserstoffe`,
      `High m71 content indicates heavy hydrocarbons`,
      true,
      m71 / m43
    ))
  }

  return {
    type: DiagnosisType.OIL_BACKSTREAMING,
    name: `Öl-Rückströmung (${oilType})`,
    nameEn: `Oil Backstreaming (${oilType === 'Vorpumpe' ? 'Forepump' : 'Heavy Hydrocarbons'})`,
    description: `Kohlenwasserstoff-Muster deutet auf ${oilType}nöl-Kontamination.`,
    descriptionEn: `Hydrocarbon pattern indicates ${oilType === 'Vorpumpe' ? 'forepump' : 'heavy hydrocarbon'} oil contamination.`,
    confidence: Math.min(confidence, 1.0),
    severity: confidence > 0.6 ? 'critical' : 'warning',
    evidence,
    recommendation: 'Prüfen: Ventilsequenz bei Schleusenbetrieb, Ölfallen-Sättigung, Vorvakuumleitungen. Ggf. LN₂-Falle einsetzen.',
    recommendationEn: 'Check: Valve sequence during loadlock operation, oil trap saturation, foreline. Consider LN₂ trap.',
    affectedMasses: detected
  }
}

// ============================================
// 3. FOMBLIN/PFPE-KONTAMINATION
// ============================================
export function detectFomblinContamination(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  const m69 = getPeak(peaks, 69)  // CF₃⁺ - Hauptmarker
  const m31 = getPeak(peaks, 31)  // CF⁺
  const m47 = getPeak(peaks, 47)  // CFO⁺
  const m50 = getPeak(peaks, 50)  // CF₂⁺

  // Fomblin braucht m69 als starken Peak
  if (m69 < DEFAULT_THRESHOLDS.minPeakHeight * 10) return null

  const evidence: EvidenceItem[] = []
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

  // Anti-Pattern: KEINE Alkyl-Peaks
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

  // Weitere PFPE-Marker - FIXED: Raised threshold from 0.1% to 1% to reduce noise
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

// ============================================
// 4. LÖSEMITTEL-RÜCKSTÄNDE
// ============================================
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

// ============================================
// 5. CHLORIERTE LÖSEMITTEL
// ============================================
export function detectChlorinatedSolvent(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  const m35 = getPeak(peaks, 35)  // ³⁵Cl⁺
  const m37 = getPeak(peaks, 37)  // ³⁷Cl⁺

  // Chlor-Isotopen Verhältnis: 35/37 ≈ 3:1
  if (m35 < DEFAULT_THRESHOLDS.minPeakHeight * 5) return null

  const evidence: EvidenceItem[] = []
  let confidence = 0

  const clRatio = m35 / (m37 || 0.001)
  const clRatioOk = clRatio >= 2.5 && clRatio <= 4.0

  evidence.push(createEvidence(
    'ratio',
    `Cl-Isotopenverhältnis ³⁵Cl/³⁷Cl: ${clRatio.toFixed(2)} (erwartet: 3.1)`,
    `Cl isotope ratio ³⁵Cl/³⁷Cl: ${clRatio.toFixed(2)} (expected: 3.1)`,
    clRatioOk,
    clRatio,
    { exact: 3.1 }
  ))

  if (clRatioOk) confidence += 0.5

  // TCE Check (Trichlorethylen, m95)
  const m95 = getPeak(peaks, 95)
  if (m95 > DEFAULT_THRESHOLDS.minPeakHeight) {
    evidence.push(createEvidence(
      'presence',
      `TCE-Hauptpeak m/z 95: ${(m95 * 100).toFixed(3)}%`,
      `TCE main peak m/z 95: ${(m95 * 100).toFixed(3)}%`,
      true,
      m95 * 100
    ))
    confidence += 0.3
  }

  if (confidence < DEFAULT_THRESHOLDS.minConfidence) return null

  return {
    type: DiagnosisType.CHLORINATED_SOLVENT,
    name: 'Chloriertes Lösemittel',
    nameEn: 'Chlorinated Solvent',
    description: 'Chlorverbindung detektiert (TCE, Dichlormethan o.ä.).',
    descriptionEn: 'Chlorine compound detected (TCE, dichloromethane, etc.).',
    confidence: Math.min(confidence, 1.0),
    severity: 'critical',
    evidence,
    recommendation: 'WARNUNG: Chlorierte Lösemittel korrodieren Aluminium! Intensiv ausheizen. Kontaminierte Teile ggf. ersetzen.',
    recommendationEn: 'WARNING: Chlorinated solvents corrode aluminum! Bake out intensively. Replace contaminated parts if needed.',
    affectedMasses: [35, 37, 95, 97]
  }
}

// ============================================
// 6. WASSER-AUSGASUNG
// ============================================
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

// ============================================
// 7. WASSERSTOFF-DOMINANT (GUTER ZUSTAND)
// ============================================
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

// ============================================
// 8. ESD-ARTEFAKTE
// ============================================

// ESD-spezifische Schwellenwerte
const ESD_THRESHOLDS = {
  o_ratio: { normal: 0.15, anomaly: 0.50 },      // m16/m32
  n_ratio: { normal: 0.10, anomaly: 0.25 },      // m14/m28 - FIXED: was 0.07/0.15 - caused false positives
  c_ratio: { normal: 0.05, anomaly: 0.12 },      // m12/m28
  h_ratio: { normal: 0.10, anomaly: 0.20 },      // m1/m2 - FIXED: was 0.01/0.05 - unrealistic for 70 eV EI
  minCriteriaForWarning: 4                        // Ab 4 Kriterien → warning
}

export function detectESDartifacts(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  // Alle relevanten Massen auslesen
  const m1 = getPeak(peaks, 1)    // H⁺
  const m2 = getPeak(peaks, 2)    // H₂⁺
  const m12 = getPeak(peaks, 12)  // C⁺
  const m14 = getPeak(peaks, 14)  // N⁺ (oder CO⁺⁺)
  const m16 = getPeak(peaks, 16)  // O⁺
  const m19 = getPeak(peaks, 19)  // F⁺
  const m28 = getPeak(peaks, 28)  // N₂⁺ / CO⁺
  const m32 = getPeak(peaks, 32)  // O₂⁺
  const m35 = getPeak(peaks, 35)  // Cl⁺
  const m37 = getPeak(peaks, 37)  // ³⁷Cl⁺
  const m69 = getPeak(peaks, 69)  // CF₃⁺

  const evidence: EvidenceItem[] = []
  const affectedMasses: number[] = []
  let confidence = 0

  // Kriterium 1: Anomal hoher O⁺ Peak ohne O₂
  if (m16 > 0 && m32 > 0) {
    const ratio_16_32 = m16 / m32
    if (ratio_16_32 > ESD_THRESHOLDS.o_ratio.anomaly) {
      evidence.push(createEvidence(
        'ratio',
        `Anomal hoher O⁺: m16/m32 = ${ratio_16_32.toFixed(2)} (normal: ~${ESD_THRESHOLDS.o_ratio.normal})`,
        `Anomalously high O⁺: m16/m32 = ${ratio_16_32.toFixed(2)} (normal: ~${ESD_THRESHOLDS.o_ratio.normal})`,
        false,
        ratio_16_32,
        { max: ESD_THRESHOLDS.o_ratio.anomaly }
      ))
      confidence += 0.30
      affectedMasses.push(16, 32)
    }
  }

  // Kriterium 2: N⁺/N₂⁺ Ratio (ESD erzeugt mehr atomare N⁺ Ionen)
  if (m14 > 0 && m28 > DEFAULT_THRESHOLDS.minPeakHeight) {
    const n_ratio = m14 / m28
    if (n_ratio > ESD_THRESHOLDS.n_ratio.anomaly) {
      evidence.push(createEvidence(
        'ratio',
        `Überhöhtes N⁺/N₂⁺ Verhältnis: m14/m28 = ${n_ratio.toFixed(3)} (normal: ~${ESD_THRESHOLDS.n_ratio.normal}) - ESD von N₂`,
        `Elevated N⁺/N₂⁺ ratio: m14/m28 = ${n_ratio.toFixed(3)} (normal: ~${ESD_THRESHOLDS.n_ratio.normal}) - ESD from N₂`,
        false,
        n_ratio,
        { max: ESD_THRESHOLDS.n_ratio.anomaly }
      ))
      confidence += 0.25
      affectedMasses.push(14, 28)
    }
  }

  // Kriterium 3: C⁺/CO⁺ Ratio (ESD erzeugt mehr atomare C⁺ Ionen)
  if (m12 > DEFAULT_THRESHOLDS.minPeakHeight && m28 > 0) {
    const c_ratio = m12 / m28
    if (c_ratio > ESD_THRESHOLDS.c_ratio.anomaly) {
      evidence.push(createEvidence(
        'ratio',
        `Überhöhtes C⁺/CO⁺ Verhältnis: m12/m28 = ${c_ratio.toFixed(3)} (normal: ~${ESD_THRESHOLDS.c_ratio.normal}) - ESD von CO`,
        `Elevated C⁺/CO⁺ ratio: m12/m28 = ${c_ratio.toFixed(3)} (normal: ~${ESD_THRESHOLDS.c_ratio.normal}) - ESD from CO`,
        false,
        c_ratio,
        { max: ESD_THRESHOLDS.c_ratio.anomaly }
      ))
      confidence += 0.25
      affectedMasses.push(12, 28)
    }
  }

  // Kriterium 4: H⁺/H₂⁺ Ratio (ESD erzeugt mehr H⁺ durch Fragmentierung)
  if (m1 > 0 && m2 > DEFAULT_THRESHOLDS.minPeakHeight) {
    const h_ratio = m1 / m2
    if (h_ratio > ESD_THRESHOLDS.h_ratio.anomaly) {
      evidence.push(createEvidence(
        'ratio',
        `Überhöhtes H⁺/H₂⁺ Verhältnis: m1/m2 = ${h_ratio.toFixed(3)} (normal: ~${ESD_THRESHOLDS.h_ratio.normal}) - ESD von H₂O`,
        `Elevated H⁺/H₂⁺ ratio: m1/m2 = ${h_ratio.toFixed(3)} (normal: ~${ESD_THRESHOLDS.h_ratio.normal}) - ESD from H₂O`,
        false,
        h_ratio,
        { max: ESD_THRESHOLDS.h_ratio.anomaly }
      ))
      confidence += 0.20
      affectedMasses.push(1, 2)
    }
  }

  // Kriterium 5: F⁺ ohne Fluorquelle (CF₃⁺)
  if (m19 > DEFAULT_THRESHOLDS.minPeakHeight && m69 < m19 * 0.5) {
    evidence.push(createEvidence(
      'presence',
      `F⁺ (m19) ohne CF₃⁺ (m69) - ESD von adsorbierten Fluoriden`,
      `F⁺ (m19) without CF₃⁺ (m69) - ESD from adsorbed fluorides`,
      false,
      m19 * 100
    ))
    confidence += 0.30
    affectedMasses.push(19)
  }

  // Kriterium 6: Cl-Isotopenverhältnis anomal
  if (m35 > DEFAULT_THRESHOLDS.minPeakHeight) {
    const clRatio = m35 / (m37 || 0.001)
    if (clRatio < 2 || clRatio > 5) {
      evidence.push(createEvidence(
        'ratio',
        `Cl-Isotopenverhältnis anomal: ³⁵Cl/³⁷Cl = ${clRatio.toFixed(2)} (erwartet: 3.1) - mögl. ESD`,
        `Cl isotope ratio anomalous: ³⁵Cl/³⁷Cl = ${clRatio.toFixed(2)} (expected: 3.1) - possible ESD`,
        false,
        clRatio,
        { min: 2, max: 5 }
      ))
      confidence += 0.20
      affectedMasses.push(35, 37)
    }
  }

  // Mindestens 2 Kriterien müssen erfüllt sein
  if (confidence < DEFAULT_THRESHOLDS.minConfidence || evidence.length < 2) return null

  // Severity basierend auf Anzahl erfüllter Kriterien
  const criteriaCount = evidence.length
  const severity = criteriaCount >= ESD_THRESHOLDS.minCriteriaForWarning ? 'warning' : 'info'

  // Betroffene Gase/Quellen dynamisch sammeln
  const affectedSources: string[] = []
  const affectedSourcesEn: string[] = []

  if (evidence.some(e => e.description.includes('O⁺'))) {
    affectedSources.push('H₂O/O₂ (überhöhtes O⁺)')
    affectedSourcesEn.push('H₂O/O₂ (elevated O⁺)')
  }
  if (evidence.some(e => e.description.includes('N⁺/N₂⁺'))) {
    affectedSources.push('N₂ (überhöhtes N⁺)')
    affectedSourcesEn.push('N₂ (elevated N⁺)')
  }
  if (evidence.some(e => e.description.includes('C⁺/CO⁺'))) {
    affectedSources.push('CO (überhöhtes C⁺)')
    affectedSourcesEn.push('CO (elevated C⁺)')
  }
  if (evidence.some(e => e.description.includes('H⁺/H₂⁺'))) {
    affectedSources.push('H₂ (überhöhtes H⁺)')
    affectedSourcesEn.push('H₂ (elevated H⁺)')
  }
  if (evidence.some(e => e.description.includes('F⁺'))) {
    affectedSources.push('Fluoride (F⁺)')
    affectedSourcesEn.push('Fluorides (F⁺)')
  }
  if (evidence.some(e => e.description.includes('Cl'))) {
    affectedSources.push('Chloride (Cl⁺)')
    affectedSourcesEn.push('Chlorides (Cl⁺)')
  }

  // Dynamische Description mit betroffenen Gasen
  const gasListDE = affectedSources.join(', ')
  const gasListEN = affectedSourcesEn.join(', ')

  const description = `ESD-Artefakte detektiert: ${gasListDE}. Electron Stimulated Desorption (ESD) erzeugt atomare Ionen von adsorbierten Molekülen am Ionisatorgitter.`
  const descriptionEn = `ESD artifacts detected: ${gasListEN}. Electron Stimulated Desorption (ESD) generates atomic ions from molecules adsorbed on ionizer grid.`

  // Empfehlung basierend auf Schweregrad
  const recommendation = criteriaCount >= ESD_THRESHOLDS.minCriteriaForWarning
    ? 'Starke ESD-Kontamination! Ionisator intensiv degasen (20mA/500eV, 30min). Ggf. Filament austauschen. Elektronenenergie variieren zum Test. Hintergrundmessung nach Degasen durchführen.'
    : 'Leichte ESD-Artefakte. Ionisator degasen (20mA/500eV, 10min). Elektronenenergie variieren zum Test. Hintergrundmessung durchführen.'

  const recommendationEn = criteriaCount >= ESD_THRESHOLDS.minCriteriaForWarning
    ? 'Heavy ESD contamination! Degas ionizer intensively (20mA/500eV, 30min). Consider filament replacement. Vary electron energy for testing. Perform background measurement after degassing.'
    : 'Light ESD artifacts. Degas ionizer (20mA/500eV, 10min). Vary electron energy for testing. Perform background measurement.'

  // Duplikate aus affectedMasses entfernen und sortieren
  const uniqueAffectedMasses = Array.from(new Set(affectedMasses)).sort((a, b) => a - b)

  return {
    type: DiagnosisType.ESD_ARTIFACT,
    name: criteriaCount >= ESD_THRESHOLDS.minCriteriaForWarning ? 'ESD-Artefakt (stark)' : 'ESD-Artefakt vermutet',
    nameEn: criteriaCount >= ESD_THRESHOLDS.minCriteriaForWarning ? 'ESD Artifact (strong)' : 'ESD Artifact Suspected',
    description,
    descriptionEn,
    confidence: Math.min(confidence, 1.0),
    severity,
    evidence,
    recommendation,
    recommendationEn,
    affectedMasses: uniqueAffectedMasses.length > 0 ? uniqueAffectedMasses : [16, 19, 35]
  }
}

// ============================================
// 8a. HELIUM-LECK-INDIKATOR
// ============================================

/**
 * Qualitative Helium-Detektion (m/z=4)
 *
 * WICHTIG: Dies ist KEIN quantitativer Leckraten-Test!
 * RGAs sind 1-3 Größenordnungen weniger sensitiv als dedizierte He-Lecktester (~5×10⁻¹² mbar·l/s).
 *
 * Zweck: Einfacher Hinweis auf ungewöhnlich hohe Helium-Konzentration.
 * → Empfehlung: Bei Verdacht He-Leckdetektor einsetzen.
 */
export function detectHeliumLeak(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  const m4 = getPeak(peaks, 4)    // He⁺ (oder D₂⁺)
  const m2 = getPeak(peaks, 2)    // H₂⁺ (Referenz)
  const m3 = getPeak(peaks, 3)    // HD⁺

  // Minimale Nachweisgrenze für He
  if (m4 < DEFAULT_THRESHOLDS.minPeakHeight) return null

  const evidence: EvidenceItem[] = []
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

// ============================================
// 9. SILIKON-KONTAMINATION
// ============================================
export function detectSiliconeContamination(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  const m73 = getPeak(peaks, 73)   // (CH₃)₃Si⁺ - Trimethylsilyl
  const m59 = getPeak(peaks, 59)   // C₃H₇Si⁺
  const m147 = getPeak(peaks, 147) // PDMS dimer fragment

  if (m73 < DEFAULT_THRESHOLDS.minPeakHeight * 5) return null

  const evidence: EvidenceItem[] = []
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

// ============================================
// 10. VIRTUELLES LECK
// ============================================
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

// ============================================
// 11. N₂/CO UNTERSCHEIDUNG
// ============================================
export function distinguishN2fromCO(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  const m28 = getPeak(peaks, 28)  // N₂⁺ oder CO⁺
  const m14 = getPeak(peaks, 14)  // N⁺ (Fragment von N₂)
  const m12 = getPeak(peaks, 12)  // C⁺ (Fragment von CO)
  const m29 = getPeak(peaks, 29)  // ¹³CO⁺ oder N₂H⁺

  if (m28 < DEFAULT_THRESHOLDS.minPeakHeight * 10) return null

  const evidence: EvidenceItem[] = []
  let confidence = 0
  let probablyCO = false
  let coFraction = 0

  // N₂: m28/m14 ≈ 14, CO: m28/m12 ≈ 20
  const ratio_28_14 = m14 > 0 ? m28 / m14 : 999
  const ratio_28_12 = m12 > 0 ? m28 / m12 : 999

  evidence.push(createEvidence(
    'ratio',
    `m28/m14 (N₂-Fragment): ${ratio_28_14.toFixed(1)} (reines N₂ ≈ 14)`,
    `m28/m14 (N₂ fragment): ${ratio_28_14.toFixed(1)} (pure N₂ ≈ 14)`,
    ratio_28_14 >= 10 && ratio_28_14 <= 20,
    ratio_28_14,
    { min: 10, max: 20 }
  ))

  evidence.push(createEvidence(
    'ratio',
    `m28/m12 (CO-Fragment): ${ratio_28_12.toFixed(1)} (reines CO ≈ 20)`,
    `m28/m12 (CO fragment): ${ratio_28_12.toFixed(1)} (pure CO ≈ 20)`,
    ratio_28_12 >= 15 && ratio_28_12 <= 25,
    ratio_28_12,
    { min: 15, max: 25 }
  ))

  // N⁺/C⁺ Diskriminierungsverhältnis (neu)
  const ratio_14_12 = (m14 > 0 && m12 > 0) ? m14 / m12 : 999

  if (m14 > DEFAULT_THRESHOLDS.minPeakHeight && m12 > DEFAULT_THRESHOLDS.minPeakHeight) {
    evidence.push(createEvidence(
      'ratio',
      `N⁺/C⁺ Verhältnis (m14/m12): ${ratio_14_12.toFixed(2)} (N₂: >2, CO: <0.5)`,
      `N⁺/C⁺ ratio (m14/m12): ${ratio_14_12.toFixed(2)} (N₂: >2, CO: <0.5)`,
      ratio_14_12 > 0.5 && ratio_14_12 < 2.0,
      ratio_14_12
    ))

    if (ratio_14_12 > 2.0) {
      confidence += 0.2  // Starker N₂-Hinweis
      probablyCO = false
    } else if (ratio_14_12 < 0.5) {
      confidence += 0.2  // Starker CO-Hinweis
      probablyCO = true
      coFraction = Math.max(coFraction, 0.7)
    }
  }

  // Entscheidungslogik
  if (m12 < DEFAULT_THRESHOLDS.minPeakHeight && m14 > DEFAULT_THRESHOLDS.minPeakHeight) {
    // Kein C⁺ → hauptsächlich N₂ → keine Warnung nötig
    return null
  } else if (m12 > DEFAULT_THRESHOLDS.minPeakHeight && m14 < DEFAULT_THRESHOLDS.minPeakHeight) {
    // C⁺ ohne N⁺ → hauptsächlich CO
    probablyCO = true
    confidence += 0.5
    coFraction = 1.0
    evidence.push(createEvidence(
      'presence',
      `C⁺ (m12) ohne N⁺ (m14) → hauptsächlich CO`,
      `C⁺ (m12) without N⁺ (m14) → mainly CO`,
      true
    ))
  } else if (m12 > 0 && m14 > 0) {
    // Beide vorhanden → Mischung
    coFraction = Math.min((m12 / m28) / 0.05, 1.0)
    if (coFraction > 0.2) {
      evidence.push(createEvidence(
        'ratio',
        `Geschätzter CO-Anteil: ${(coFraction * 100).toFixed(0)}%`,
        `Estimated CO fraction: ${(coFraction * 100).toFixed(0)}%`,
        true,
        coFraction * 100
      ))
      confidence += 0.3
    } else {
      return null // Zu wenig CO, nicht relevant
    }
  }

  // ¹⁴N¹⁵N Check für N₂ Bestätigung (neu)
  // Natürliche Häufigkeit: ¹⁵N = 0,368%, also ¹⁴N¹⁵N ≈ 0,73% von N₂
  if (m29 > 0 && m28 > 0) {
    const m29_28_ratio = m29 / m28

    if (m29_28_ratio >= 0.006 && m29_28_ratio <= 0.009) {
      // Konsistent mit N₂-Isotopenverhältnis
      evidence.push(createEvidence(
        'ratio',
        `m29/m28 = ${(m29_28_ratio * 100).toFixed(2)}% konsistent mit ¹⁴N¹⁵N (N₂: ~0,73%)`,
        `m29/m28 = ${(m29_28_ratio * 100).toFixed(2)}% consistent with ¹⁴N¹⁵N (N₂: ~0.73%)`,
        true,
        m29_28_ratio * 100,
        { min: 0.6, max: 0.9 }
      ))
      if (!probablyCO) {
        confidence += 0.15  // Boost N₂ confidence
      }
    } else if (m29_28_ratio < 0.006) {
      // Zu niedrig für natürliches N₂ - könnte reine N₂ mit schwacher m29 sein
      evidence.push(createEvidence(
        'ratio',
        `Niedriges m29/m28 (${(m29_28_ratio * 100).toFixed(2)}%) - mögliche Nachweisgrenze`,
        `Low m29/m28 (${(m29_28_ratio * 100).toFixed(2)}%) - possible detection limit`,
        false,
        m29_28_ratio * 100
      ))
    }
  }

  // ¹³CO Check (verbessert mit wissenschaftlich validiertem Schwellenwert)
  if (m29 > 0 && m28 > 0 && m29 / m28 > 0.012) {
    // Schwellenwert auf 1.2% reduziert (von 1.5%)
    // Wissenschaftliche Grundlage: ¹³C natürliche Häufigkeit = 1,07%, typisches ¹³CO/CO = 1,1-1,2%
    evidence.push(createEvidence(
      'ratio',
      `m29/m28 = ${((m29 / m28) * 100).toFixed(2)}% deutet auf ¹³CO (erwartet: 1,1-1,2%)`,
      `m29/m28 = ${((m29 / m28) * 100).toFixed(2)}% indicates ¹³CO (expected: 1.1-1.2%)`,
      true,
      (m29 / m28) * 100,
      { min: 1.1, max: 1.3 }
    ))
    probablyCO = true
    confidence += 0.25  // Increased from 0.2
  }

  if (confidence < DEFAULT_THRESHOLDS.minConfidence) return null

  const type = probablyCO && coFraction > 0.8 ? DiagnosisType.CO_DOMINANT : DiagnosisType.N2_CO_MIXTURE

  return {
    type,
    name: type === DiagnosisType.CO_DOMINANT
      ? 'CO-dominiert bei m/z 28'
      : `N₂/CO-Mischung (≈${(coFraction * 100).toFixed(0)}% CO)`,
    nameEn: type === DiagnosisType.CO_DOMINANT
      ? 'CO-Dominated at m/z 28'
      : `N₂/CO Mixture (≈${(coFraction * 100).toFixed(0)}% CO)`,
    description: type === DiagnosisType.CO_DOMINANT
      ? 'Peak bei m/z 28 ist hauptsächlich CO. Quelle: Ausgasung, Oxidation.'
      : `Peak bei m/z 28 enthält ca. ${(coFraction * 100).toFixed(0)}% CO.`,
    descriptionEn: type === DiagnosisType.CO_DOMINANT
      ? 'Peak at m/z 28 is mainly CO. Source: Outgassing, oxidation.'
      : `Peak at m/z 28 contains approx. ${(coFraction * 100).toFixed(0)}% CO.`,
    confidence: Math.min(confidence, 1.0),
    severity: 'info',
    evidence,
    recommendation: 'CO-Quelle: Ausgasung von Edelstahl, oxidierte Oberflächen. Ausheizen reduziert CO.',
    recommendationEn: 'CO source: Stainless steel outgassing, oxidized surfaces. Bakeout reduces CO.',
    affectedMasses: [12, 14, 28, 29]
  }
}

// ============================================
// 12. SAUBERES UHV-SYSTEM
// ============================================
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

  const evidence: EvidenceItem[] = []
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

// ============================================
// 13. AMMONIAK-KONTAMINATION (NEU)
// ============================================
export function detectAmmonia(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  const m17 = getPeak(peaks, 17)  // NH₃⁺
  const m18 = getPeak(peaks, 18)  // H₂O⁺
  const m16 = getPeak(peaks, 16)  // NH₂⁺ oder O⁺
  const m15 = getPeak(peaks, 15)  // NH⁺ oder CH₃⁺

  const evidence: EvidenceItem[] = []
  let confidence = 0

  // Primärkriterium: OH/H₂O Verhältnis anomal hoch
  // H₂O normal: 17/18 ≈ 0.23, bei NH₃ vorhanden: > 0.30
  if (m18 > DEFAULT_THRESHOLDS.minPeakHeight) {
    const ratio_17_18 = m17 / m18

    if (ratio_17_18 > 0.30) {
      evidence.push(createEvidence(
        'ratio',
        `m17/m18 = ${ratio_17_18.toFixed(2)} (H₂O normal: ~0.23, >0.30 deutet auf NH₃)`,
        `m17/m18 = ${ratio_17_18.toFixed(2)} (H₂O normal: ~0.23, >0.30 indicates NH₃)`,
        true,
        ratio_17_18,
        { min: 0.30 }
      ))
      confidence += 0.4

      if (ratio_17_18 > 0.40) {
        evidence.push(createEvidence(
          'ratio',
          `Starker NH₃-Überschuss (m17/m18 > 0.40)`,
          `Strong NH₃ excess (m17/m18 > 0.40)`,
          true,
          ratio_17_18
        ))
        confidence += 0.2
      }
    }
  }

  // Sekundärkriterium: NH₂⁺ Fragment bei m/z 16
  // NH₃: 16/17 ≈ 0.80
  if (m17 > DEFAULT_THRESHOLDS.minPeakHeight) {
    const ratio_16_17 = m16 / m17
    if (ratio_16_17 >= 0.6 && ratio_16_17 <= 1.0) {
      evidence.push(createEvidence(
        'ratio',
        `NH₂/NH₃ (m16/m17) = ${ratio_16_17.toFixed(2)} (NH₃ typisch: ~0.80)`,
        `NH₂/NH₃ (m16/m17) = ${ratio_16_17.toFixed(2)} (NH₃ typical: ~0.80)`,
        true,
        ratio_16_17,
        { min: 0.6, max: 1.0 }
      ))
      confidence += 0.2
    }
  }

  // Tertiär: NH⁺ bei m/z 15 (schwach, ~7.5%)
  if (m15 > DEFAULT_THRESHOLDS.minPeakHeight && m17 > 0) {
    const ratio_15_17 = m15 / m17
    if (ratio_15_17 >= 0.05 && ratio_15_17 <= 0.15) {
      evidence.push(createEvidence(
        'ratio',
        `NH⁺ Fragment (m15/m17) = ${ratio_15_17.toFixed(2)} (NH₃ typisch: ~0.075)`,
        `NH⁺ fragment (m15/m17) = ${ratio_15_17.toFixed(2)} (NH₃ typical: ~0.075)`,
        true,
        ratio_15_17,
        { min: 0.05, max: 0.15 }
      ))
      confidence += 0.1
    }
  }

  if (confidence < DEFAULT_THRESHOLDS.minConfidence) return null

  return {
    type: DiagnosisType.AMMONIA_CONTAMINATION,
    name: 'Ammoniak-Kontamination',
    nameEn: 'Ammonia Contamination',
    description: 'NH₃-Signatur detektiert. Überlagerung mit H₂O bei m/z 17.',
    descriptionEn: 'NH₃ signature detected. Overlaps with H₂O at m/z 17.',
    confidence: Math.min(confidence, 1.0),
    severity: confidence > 0.5 ? 'warning' : 'info',
    evidence,
    recommendation: 'NH₃-Quelle identifizieren: Prozessgas, Reinigungsmittel, Pumpenöl-Zersetzung, biologische Kontamination.',
    recommendationEn: 'Identify NH₃ source: Process gas, cleaning agents, pump oil decomposition, biological contamination.',
    affectedMasses: [14, 15, 16, 17]
  }
}

// ============================================
// 14. METHAN-KONTAMINATION (NEU)
// ============================================
export function detectMethane(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  const m16 = getPeak(peaks, 16)  // CH₄⁺ oder O⁺
  const m15 = getPeak(peaks, 15)  // CH₃⁺ - SAUBERER INDIKATOR!
  const m14 = getPeak(peaks, 14)  // CH₂⁺ oder N⁺
  // const m13 = getPeak(peaks, 13)  // CH⁺ (für zukünftige Erweiterung)
  const m32 = getPeak(peaks, 32)  // O₂ (zur Korrektur)

  const evidence: EvidenceItem[] = []
  let confidence = 0

  // Hauptkriterium: m/z 15 (CH₃⁺) als sauberer Indikator
  // m/z 15 kommt praktisch NUR von CH₄ und höheren HC
  if (m15 > DEFAULT_THRESHOLDS.minPeakHeight * 5) {
    evidence.push(createEvidence(
      'presence',
      `CH₃⁺ (m/z 15) signifikant: ${(m15 * 100).toFixed(2)}%`,
      `CH₃⁺ (m/z 15) significant: ${(m15 * 100).toFixed(2)}%`,
      true,
      m15 * 100
    ))
    confidence += 0.4

    // CH₄-Pattern prüfen: 15/16 ≈ 0.85
    if (m16 > 0) {
      const ratio_15_16 = m15 / m16
      if (ratio_15_16 >= 0.7 && ratio_15_16 <= 1.0) {
        evidence.push(createEvidence(
          'ratio',
          `CH₃/CH₄ (m15/m16) = ${ratio_15_16.toFixed(2)} (CH₄ typisch: ~0.85)`,
          `CH₃/CH₄ (m15/m16) = ${ratio_15_16.toFixed(2)} (CH₄ typical: ~0.85)`,
          true,
          ratio_15_16,
          { min: 0.7, max: 1.0 }
        ))
        confidence += 0.3
      }
    }
  }

  // Sekundär: CH₂⁺ bei m/z 14
  if (m14 > 0 && m15 > 0) {
    const ratio_14_15 = m14 / m15
    if (ratio_14_15 >= 0.15 && ratio_14_15 <= 0.25) {
      evidence.push(createEvidence(
        'ratio',
        `CH₂⁺ Fragment bestätigt (m14/m15) = ${ratio_14_15.toFixed(2)}`,
        `CH₂⁺ fragment confirmed (m14/m15) = ${ratio_14_15.toFixed(2)}`,
        true,
        ratio_14_15,
        { min: 0.15, max: 0.25 }
      ))
      confidence += 0.2
    }
  }

  // Warnung: Hoher O₂-Anteil kann m/z 16 verfälschen
  if (m32 > m16 * 5) {
    confidence *= 0.7
    evidence.push(createEvidence(
      'presence',
      `Warnung: Hoher O₂-Anteil, m/z 16 könnte teilweise O⁺ sein`,
      `Warning: High O₂ content, m/z 16 could be partially O⁺`,
      false,
      m32 * 100
    ))
  }

  if (confidence < DEFAULT_THRESHOLDS.minConfidence) return null

  return {
    type: DiagnosisType.METHANE_CONTAMINATION,
    name: 'Methan-Kontamination',
    nameEn: 'Methane Contamination',
    description: 'CH₄-Signatur detektiert. m/z 15 ist sauberer Indikator.',
    descriptionEn: 'CH₄ signature detected. m/z 15 is a clean indicator.',
    confidence: Math.min(confidence, 1.0),
    severity: confidence > 0.5 ? 'warning' : 'info',
    evidence,
    recommendation: 'Methan-Quelle: Organische Zersetzung, Prozessgas, RGA-Filament-Reaktion mit Kohlenstoff.',
    recommendationEn: 'Methane source: Organic decomposition, process gas, RGA filament reaction with carbon.',
    affectedMasses: [12, 13, 14, 15, 16]
  }
}

// ============================================
// 15. SCHWEFELVERBINDUNGEN (NEU)
// ============================================
export function detectSulfur(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  const m34 = getPeak(peaks, 34)  // H₂S⁺
  const m33 = getPeak(peaks, 33)  // HS⁺
  // const m32 = getPeak(peaks, 32)  // S⁺ oder O₂⁺ (ambivalent, für zukünftige Erweiterung)
  const m64 = getPeak(peaks, 64)  // SO₂⁺
  const m48 = getPeak(peaks, 48)  // SO⁺

  const evidence: EvidenceItem[] = []
  let confidence = 0
  let sulfurType = ''

  // H₂S Detektion
  if (m34 > DEFAULT_THRESHOLDS.minPeakHeight * 3) {
    evidence.push(createEvidence(
      'presence',
      `H₂S-Hauptpeak (m/z 34) detektiert: ${(m34 * 100).toFixed(3)}%`,
      `H₂S main peak (m/z 34) detected: ${(m34 * 100).toFixed(3)}%`,
      true,
      m34 * 100
    ))
    confidence += 0.4
    sulfurType = 'H₂S'

    // HS⁺ Fragment prüfen: 33/34 ≈ 0.42
    if (m33 > 0) {
      const ratio_33_34 = m33 / m34
      if (ratio_33_34 >= 0.3 && ratio_33_34 <= 0.5) {
        evidence.push(createEvidence(
          'ratio',
          `HS⁺ Fragment bestätigt (m33/m34) = ${ratio_33_34.toFixed(2)} (H₂S: ~0.42)`,
          `HS⁺ fragment confirmed (m33/m34) = ${ratio_33_34.toFixed(2)} (H₂S: ~0.42)`,
          true,
          ratio_33_34,
          { min: 0.3, max: 0.5 }
        ))
        confidence += 0.2
      }
    }
  }

  // SO₂ Detektion
  if (m64 > DEFAULT_THRESHOLDS.minPeakHeight * 3) {
    evidence.push(createEvidence(
      'presence',
      `SO₂-Hauptpeak (m/z 64) detektiert: ${(m64 * 100).toFixed(3)}%`,
      `SO₂ main peak (m/z 64) detected: ${(m64 * 100).toFixed(3)}%`,
      true,
      m64 * 100
    ))
    confidence += 0.4
    sulfurType = sulfurType ? `${sulfurType} + SO₂` : 'SO₂'

    // SO⁺ Fragment bei m/z 48: 48/64 ≈ 0.49
    if (m48 > 0) {
      const ratio_48_64 = m48 / m64
      if (ratio_48_64 >= 0.4 && ratio_48_64 <= 0.6) {
        evidence.push(createEvidence(
          'ratio',
          `SO⁺ Fragment bestätigt (m48/m64) = ${ratio_48_64.toFixed(2)} (SO₂: ~0.49)`,
          `SO⁺ fragment confirmed (m48/m64) = ${ratio_48_64.toFixed(2)} (SO₂: ~0.49)`,
          true,
          ratio_48_64,
          { min: 0.4, max: 0.6 }
        ))
        confidence += 0.2
      }
    }
  }

  if (confidence < DEFAULT_THRESHOLDS.minConfidence || !sulfurType) return null

  return {
    type: DiagnosisType.SULFUR_CONTAMINATION,
    name: `Schwefel-Kontamination (${sulfurType})`,
    nameEn: `Sulfur Contamination (${sulfurType})`,
    description: `${sulfurType}-Signatur detektiert.`,
    descriptionEn: `${sulfurType} signature detected.`,
    confidence: Math.min(confidence, 1.0),
    severity: 'warning',
    evidence,
    recommendation: `${sulfurType}-Quelle: Vorpumpenöl-Zersetzung, Prozessgas, biologische Kontamination.`,
    recommendationEn: `${sulfurType} source: Forepump oil decomposition, process gas, biological contamination.`,
    affectedMasses: [32, 33, 34, 48, 64, 66]
  }
}

// ============================================
// 16. AROMATEN-KONTAMINATION (NEU)
// ============================================
export function detectAromatic(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  const m78 = getPeak(peaks, 78)  // Benzol C₆H₆⁺
  const m77 = getPeak(peaks, 77)  // C₆H₅⁺
  const m91 = getPeak(peaks, 91)  // Toluol Tropylium C₇H₇⁺
  const m92 = getPeak(peaks, 92)  // Toluol Parent C₇H₈⁺
  const m51 = getPeak(peaks, 51)  // C₄H₃⁺
  // const m52 = getPeak(peaks, 52)  // C₄H₄⁺ (für zukünftige Erweiterung)
  const m39 = getPeak(peaks, 39)  // C₃H₃⁺

  const evidence: EvidenceItem[] = []
  let confidence = 0
  let aromaticType = ''

  // Benzol Detektion
  if (m78 > DEFAULT_THRESHOLDS.minPeakHeight * 3) {
    evidence.push(createEvidence(
      'presence',
      `Benzol-Peak (m/z 78) detektiert: ${(m78 * 100).toFixed(3)}%`,
      `Benzene peak (m/z 78) detected: ${(m78 * 100).toFixed(3)}%`,
      true,
      m78 * 100
    ))
    confidence += 0.4
    aromaticType = 'Benzol'

    // Benzol-Fragment: 77/78 ≈ 0.22
    if (m77 > 0) {
      const ratio_77_78 = m77 / m78
      if (ratio_77_78 >= 0.15 && ratio_77_78 <= 0.30) {
        evidence.push(createEvidence(
          'ratio',
          `Phenyl-Fragment bestätigt (m77/m78) = ${ratio_77_78.toFixed(2)} (Benzol: ~0.22)`,
          `Phenyl fragment confirmed (m77/m78) = ${ratio_77_78.toFixed(2)} (Benzene: ~0.22)`,
          true,
          ratio_77_78,
          { min: 0.15, max: 0.30 }
        ))
        confidence += 0.2
      }
    }
  }

  // Toluol Detektion
  if (m91 > DEFAULT_THRESHOLDS.minPeakHeight * 3) {
    evidence.push(createEvidence(
      'presence',
      `Toluol/Tropylium-Peak (m/z 91) detektiert: ${(m91 * 100).toFixed(3)}%`,
      `Toluene/Tropylium peak (m/z 91) detected: ${(m91 * 100).toFixed(3)}%`,
      true,
      m91 * 100
    ))
    confidence += 0.4
    aromaticType = aromaticType ? `${aromaticType} + Toluol` : 'Toluol'

    // Toluol-Pattern: 92/91 ≈ 0.69
    if (m92 > 0) {
      const ratio_92_91 = m92 / m91
      if (ratio_92_91 >= 0.5 && ratio_92_91 <= 0.9) {
        evidence.push(createEvidence(
          'ratio',
          `Toluol-Pattern bestätigt (m92/m91) = ${ratio_92_91.toFixed(2)} (Toluol: ~0.69)`,
          `Toluene pattern confirmed (m92/m91) = ${ratio_92_91.toFixed(2)} (Toluene: ~0.69)`,
          true,
          ratio_92_91,
          { min: 0.5, max: 0.9 }
        ))
        confidence += 0.2
      }
    }
  }

  // Allgemeine Aromaten-Fragmente
  if ((m39 > DEFAULT_THRESHOLDS.minPeakHeight * 5 && m51 > DEFAULT_THRESHOLDS.minPeakHeight * 3) && !aromaticType) {
    evidence.push(createEvidence(
      'pattern',
      `Aromaten-Fragmente (m39, m51) vorhanden`,
      `Aromatic fragments (m39, m51) present`,
      true
    ))
    confidence += 0.2
    aromaticType = 'Aromaten'
  }

  if (confidence < DEFAULT_THRESHOLDS.minConfidence || !aromaticType) return null

  return {
    type: DiagnosisType.AROMATIC_CONTAMINATION,
    name: `Aromaten-Kontamination (${aromaticType})`,
    nameEn: `Aromatic Contamination (${aromaticType})`,
    description: `${aromaticType}-Signatur detektiert. Hohe Empfindlichkeit!`,
    descriptionEn: `${aromaticType} signature detected. High sensitivity!`,
    confidence: Math.min(confidence, 1.0),
    severity: 'warning',
    evidence,
    recommendation: `${aromaticType}-Quelle: Lösemittel, Diffusionspumpenöl, Kunststoffe, Reinigungsmittel.`,
    recommendationEn: `${aromaticType} source: Solvents, diffusion pump oil, plastics, cleaning agents.`,
    affectedMasses: [39, 50, 51, 52, 65, 77, 78, 91, 92]
  }
}

// ============================================
// 17. POLYMER-AUSGASUNG (NEU)
// ============================================
export function detectPolymerOutgassing(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  const m16 = getPeak(peaks, 16)  // O⁺
  const m17 = getPeak(peaks, 17)  // OH⁺
  const m18 = getPeak(peaks, 18)  // H₂O⁺
  const m28 = getPeak(peaks, 28)  // N₂⁺/CO⁺
  const m32 = getPeak(peaks, 32)  // O₂⁺
  const m40 = getPeak(peaks, 40)  // Ar⁺
  const m41 = getPeak(peaks, 41)  // C₃H₅⁺
  const m43 = getPeak(peaks, 43)  // C₃H₇⁺/C₂H₃O⁺
  const m44 = getPeak(peaks, 44)  // CO₂⁺

  const evidence: EvidenceItem[] = []
  let confidence = 0

  // H₂O dominant ohne Luftleck-Signatur
  const waterDominant = m18 > m28 * 2
  const noAirLeak = (m28 / Math.max(m32, 0.001)) > 4.5 || m40 < 0.005  // FIXED: threshold changed from >5 to >4.5
  const normalWaterRatio = m17 > 0 && m18 / m17 > 3.5 && m18 / m17 < 5.0

  // Check for polymer-specific markers (m41/m43)
  const hasPolymerMarkers = m41 > 0.005 || m43 > 0.005

  if (waterDominant && noAirLeak) {
    evidence.push(createEvidence(
      'ratio',
      `H₂O dominant (m18 > 2×m28): ${(m18 / Math.max(m28, 0.001)).toFixed(1)}×`,
      `H₂O dominant (m18 > 2×m28): ${(m18 / Math.max(m28, 0.001)).toFixed(1)}×`,
      true,
      m18 / Math.max(m28, 0.001),
      { min: 2 }
    ))
    confidence += 0.4

    evidence.push(createEvidence(
      'absence',
      `Kein Luftleck (Ar niedrig, N₂/O₂ anomal)`,
      `No air leak (Ar low, N₂/O₂ anomalous)`,
      true
    ))
    confidence += 0.2
  }

  if (normalWaterRatio) {
    evidence.push(createEvidence(
      'ratio',
      `Normales H₂O/OH Verhältnis: ${(m18 / m17).toFixed(2)} (typisch: 4.3)`,
      `Normal H₂O/OH ratio: ${(m18 / m17).toFixed(2)} (typical: 4.3)`,
      true,
      m18 / m17,
      { min: 3.5, max: 5.0 }
    ))
    confidence += 0.2
  }

  // Add m16 (O⁺) evidence
  if (m16 > 0.01) {
    evidence.push(createEvidence(
      'presence',
      `O⁺ (m/z 16) detektiert: ${(m16 * 100).toFixed(2)}% - Fragment von H₂O/O₂`,
      `O⁺ (m/z 16) detected: ${(m16 * 100).toFixed(2)}% - fragment from H₂O/O₂`,
      true,
      m16 * 100
    ))
  }

  // Add m44 (CO₂) evidence if present
  if (m44 > 0.01) {
    evidence.push(createEvidence(
      'presence',
      `CO₂ (m/z 44) detektiert: ${(m44 * 100).toFixed(2)}% - typisch für Polymer-Ausgasung`,
      `CO₂ (m/z 44) detected: ${(m44 * 100).toFixed(2)}% - typical for polymer outgassing`,
      true,
      m44 * 100
    ))
  }

  // Check if we should return early
  if (!hasPolymerMarkers && confidence < DEFAULT_THRESHOLDS.minConfidence) return null

  // Build affected masses list
  const affectedMasses: number[] = [16, 17, 18]
  if (m44 > 0.01) affectedMasses.push(44)

  return {
    type: DiagnosisType.POLYMER_OUTGASSING,
    name: hasPolymerMarkers ? 'Polymer-Ausgasung' : 'Restgas-Ausgasung',
    nameEn: hasPolymerMarkers ? 'Polymer Outgassing' : 'Residual Gas Outgassing',
    description: hasPolymerMarkers
      ? 'Polymer-Ausgasung (PEEK/Kapton/Viton) - hauptsächlich H₂O.'
      : 'Restgas-Ausgasung - hauptsächlich H₂O und CO₂.',
    descriptionEn: hasPolymerMarkers
      ? 'Polymer outgassing (PEEK/Kapton/Viton) - mainly H₂O.'
      : 'Residual gas outgassing - mainly H₂O and CO₂.',
    confidence: Math.min(confidence, 1.0),
    severity: 'info',
    evidence,
    recommendation: 'Längeres Abpumpen, Bakeout bei max. zulässiger Polymer-Temperatur (150-200°C).',
    recommendationEn: 'Extended pumping, bakeout at max. allowed polymer temperature (150-200°C).',
    affectedMasses
  }
}

// ============================================
// 18. WEICHMACHER-KONTAMINATION (NEU)
// ============================================
export function detectPlasticizerContamination(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  const m149 = getPeak(peaks, 149)  // C₈H₅O₃⁺ (protonated phthalic anhydride)
  const m167 = getPeak(peaks, 167)  // Phthalate secondary marker
  const m57 = getPeak(peaks, 57)    // Alkyl-Fragment
  const m71 = getPeak(peaks, 71)    // Alkyl-Fragment
  const m43 = getPeak(peaks, 43)    // Alkyl-Fragment

  const evidence: EvidenceItem[] = []
  let confidence = 0

  // Phthalat-Marker vorhanden
  if (m149 > DEFAULT_THRESHOLDS.minPeakHeight) {
    evidence.push(createEvidence(
      'presence',
      `Phthalat-Marker (m/z 149) detektiert: ${(m149 * 100).toFixed(4)}%`,
      `Phthalate marker (m/z 149) detected: ${(m149 * 100).toFixed(4)}%`,
      true,
      m149 * 100
    ))
    confidence += 0.5

    // HIGH FIX: Add m167 confirmation (2nd strongest phthalate peak, 15-45%)
    if (m167 > m149 * 0.15) {
      evidence.push(createEvidence(
        'pattern',
        `Phthalat-Sekundär-Marker (m/z 167) detektiert: ${(m167 * 100).toFixed(4)}%`,
        `Phthalate secondary marker (m/z 167) detected: ${(m167 * 100).toFixed(4)}%`,
        true,
        m167 * 100
      ))
      confidence += 0.25  // Stronger phthalate confirmation
    }

    const hasAlkylFragments = m57 > 0.01 || m71 > 0.01 || m43 > 0.01
    if (hasAlkylFragments) {
      evidence.push(createEvidence(
        'pattern',
        `Alkyl-Fragmente (m43/m57/m71) unterstützen Weichmacher-Diagnose`,
        `Alkyl fragments (m43/m57/m71) support plasticizer diagnosis`,
        true
      ))
      confidence += 0.25
    }
  }

  if (confidence < DEFAULT_THRESHOLDS.minConfidence) return null

  return {
    type: DiagnosisType.PLASTICIZER_CONTAMINATION,
    name: 'Weichmacher-Kontamination',
    nameEn: 'Plasticizer Contamination',
    description: 'Weichmacher-Kontamination (Phthalate) aus O-Ringen oder Kunststoffen.',
    descriptionEn: 'Plasticizer contamination (phthalates) from O-rings or plastics.',
    confidence: Math.min(confidence, 1.0),
    severity: 'warning',
    evidence,
    recommendation: 'O-Ringe in Hexan auskochen (über Nacht), Kunststoffteile entfernen.',
    recommendationEn: 'Reflux O-rings in hexane overnight, remove plastic components.',
    affectedMasses: [43, 57, 71, 149, 167]
  }
}

// ============================================
// 19. PROZESSGAS-RÜCKSTAND (NEU)
// ============================================
export function detectProcessGasResidue(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  const m52 = getPeak(peaks, 52)    // NF₃
  const m71 = getPeak(peaks, 71)    // NF₃ parent
  const m127 = getPeak(peaks, 127)  // SF₆
  const m89 = getPeak(peaks, 89)    // SF₆ fragment
  const m279 = getPeak(peaks, 279)  // WF₆

  const evidence: EvidenceItem[] = []
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

// ============================================
// 20. KÜHLWASSER-LECK (NEU)
// ============================================
export function detectCoolingWaterLeak(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks, totalPressure } = input

  const m18 = getPeak(peaks, 18)  // H₂O

  const evidence: EvidenceItem[] = []
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

// ============================================
// 21. ISOTOPEN-VERIFIZIERUNG (NEU)
// ============================================
export function verifyIsotopeRatios(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input
  const evidence: EvidenceItem[] = []
  let confidence = 0
  const verifiedElements: string[] = []
  const affectedMasses: number[] = []

  // Convert peaks to Map for isotope functions
  const peaksMap = new Map<number, number>()
  for (const [mass, value] of Object.entries(peaks)) {
    peaksMap.set(Number(mass), value)
  }

  // 1. Argon Isotope Verification (⁴⁰Ar/³⁶Ar ≈ 298.6, Lee 2006/CIAAW 2007)
  const m40 = getPeak(peaks, 40)
  const m36 = getPeak(peaks, 36)
  if (m40 > DEFAULT_THRESHOLDS.minPeakHeight * 10 && m36 > 0) {
    const arRatio = m40 / m36
    const arCheck = checkIsotopeRatio(arRatio, 'Ar', '40/36')
    if (arCheck) {
      evidence.push(createEvidence(
        'ratio',
        `Ar-Isotopenverhältnis: ⁴⁰Ar/³⁶Ar = ${arRatio.toFixed(1)} (erwartet: ${arCheck.expectedRatio.toFixed(1)})`,
        `Ar isotope ratio: ⁴⁰Ar/³⁶Ar = ${arRatio.toFixed(1)} (expected: ${arCheck.expectedRatio.toFixed(1)})`,
        arCheck.matches,
        arRatio,
        { exact: arCheck.expectedRatio }
      ))
      if (arCheck.matches) {
        verifiedElements.push('Ar')
        confidence += 0.3
        affectedMasses.push(36, 40)
      }
    }
  }

  // 2. Chlorine Isotope Verification (³⁵Cl/³⁷Cl ≈ 3.13)
  const m35 = getPeak(peaks, 35)
  const m37 = getPeak(peaks, 37)
  if (m35 > DEFAULT_THRESHOLDS.minPeakHeight * 5 && m37 > 0) {
    const clRatio = m35 / m37
    const clCheck = checkIsotopeRatio(clRatio, 'Cl', '35/37')
    if (clCheck) {
      evidence.push(createEvidence(
        'ratio',
        `Cl-Isotopenverhältnis: ³⁵Cl/³⁷Cl = ${clRatio.toFixed(2)} (erwartet: ${clCheck.expectedRatio.toFixed(2)})`,
        `Cl isotope ratio: ³⁵Cl/³⁷Cl = ${clRatio.toFixed(2)} (expected: ${clCheck.expectedRatio.toFixed(2)})`,
        clCheck.matches,
        clRatio,
        { exact: clCheck.expectedRatio }
      ))
      if (clCheck.matches) {
        verifiedElements.push('Cl')
        confidence += 0.25
        affectedMasses.push(35, 37)
      }
    }
  }

  // 3. Bromine Isotope Verification (⁷⁹Br/⁸¹Br ≈ 1.028)
  const m79 = getPeak(peaks, 79)
  const m81 = getPeak(peaks, 81)
  if (m79 > DEFAULT_THRESHOLDS.minPeakHeight * 3 && m81 > 0) {
    const brRatio = m79 / m81
    const brCheck = checkIsotopeRatio(brRatio, 'Br', '79/81')
    if (brCheck) {
      evidence.push(createEvidence(
        'ratio',
        `Br-Isotopenverhältnis: ⁷⁹Br/⁸¹Br = ${brRatio.toFixed(3)} (erwartet: ~1.0)`,
        `Br isotope ratio: ⁷⁹Br/⁸¹Br = ${brRatio.toFixed(3)} (expected: ~1.0)`,
        brCheck.matches,
        brRatio,
        { exact: brCheck.expectedRatio }
      ))
      if (brCheck.matches) {
        verifiedElements.push('Br')
        confidence += 0.25
        affectedMasses.push(79, 81)
      }
    }
  }

  // 4. Carbon-13 Verification for CO₂ (m44/m45 ≈ 83.6)
  const m44 = getPeak(peaks, 44)
  const m45 = getPeak(peaks, 45)
  if (m44 > DEFAULT_THRESHOLDS.minPeakHeight * 10 && m45 > 0) {
    const co2Ratio = m44 / m45
    const co2Check = checkIsotopeRatio(co2Ratio, 'C', '44/45')
    if (co2Check) {
      evidence.push(createEvidence(
        'ratio',
        `CO₂-Isotopenverhältnis: m44/m45 = ${co2Ratio.toFixed(1)} (erwartet: ${co2Check.expectedRatio.toFixed(1)})`,
        `CO₂ isotope ratio: m44/m45 = ${co2Ratio.toFixed(1)} (expected: ${co2Check.expectedRatio.toFixed(1)})`,
        co2Check.matches,
        co2Ratio,
        { exact: co2Check.expectedRatio }
      ))
      if (co2Check.matches) {
        verifiedElements.push('CO₂')
        confidence += 0.2
        affectedMasses.push(44, 45)
      }
    }
  }

  // 5. Sulfur Isotope Check (³²S/³⁴S ≈ 22.35) - distinguishes from O₂
  const m32 = getPeak(peaks, 32)
  const m34 = getPeak(peaks, 34)
  if (m32 > DEFAULT_THRESHOLDS.minPeakHeight * 10 && m34 > 0) {
    const sRatio = m32 / m34
    // Check if this is sulfur (ratio ~22) or oxygen (ratio ~487)
    const sulfurData = getIsotopeRatio('S')
    const oxygenData = getIsotopeRatio('O')

    if (sulfurData && oxygenData) {
      const expectedS = 22.35
      const expectedO2 = 487

      const sDeviation = Math.abs(sRatio - expectedS) / expectedS
      const o2Deviation = Math.abs(sRatio - expectedO2) / expectedO2

      if (sDeviation < 0.15) {
        evidence.push(createEvidence(
          'ratio',
          `S-Isotopenverhältnis: ³²S/³⁴S = ${sRatio.toFixed(1)} bestätigt Schwefel (nicht O₂!)`,
          `S isotope ratio: ³²S/³⁴S = ${sRatio.toFixed(1)} confirms sulfur (not O₂!)`,
          true,
          sRatio,
          { exact: expectedS }
        ))
        verifiedElements.push('S')
        confidence += 0.25
        affectedMasses.push(32, 34)
      } else if (o2Deviation < 0.15) {
        evidence.push(createEvidence(
          'ratio',
          `O₂-Isotopenverhältnis: m32/m34 = ${sRatio.toFixed(0)} bestätigt Sauerstoff`,
          `O₂ isotope ratio: m32/m34 = ${sRatio.toFixed(0)} confirms oxygen`,
          true,
          sRatio,
          { exact: expectedO2 }
        ))
        verifiedElements.push('O₂')
        confidence += 0.15
        affectedMasses.push(32, 34)
      }
    }
  }

  // Use isotope pattern detection from isotopePatterns.ts
  const airLeakResult = detectAirLeakIsotope(peaksMap)
  if (airLeakResult.isAirLeak && airLeakResult.confidence > 0.5) {
    for (const ev of airLeakResult.evidence) {
      evidence.push(createEvidence(
        'pattern',
        ev,
        ev,
        true
      ))
    }
    if (!verifiedElements.includes('Luft')) {
      verifiedElements.push('Luft')
    }
    confidence += 0.2
  }

  const oilResult = detectOilIsotope(peaksMap)
  if (oilResult.isOilContaminated && oilResult.confidence > 0.3) {
    for (const ev of oilResult.evidence) {
      evidence.push(createEvidence(
        'pattern',
        ev,
        ev,
        true
      ))
    }
    if (oilResult.oilType && !verifiedElements.includes(oilResult.oilType)) {
      verifiedElements.push(oilResult.oilType + '-Öl')
    }
    confidence += 0.15
  }

  if (verifiedElements.length === 0 || confidence < DEFAULT_THRESHOLDS.minConfidence) {
    return null
  }

  return {
    type: DiagnosisType.ISOTOPE_VERIFICATION,
    name: `Isotopen-Verifizierung (${verifiedElements.join(', ')})`,
    nameEn: `Isotope Verification (${verifiedElements.join(', ')})`,
    description: `Isotopenverhältnisse bestätigen: ${verifiedElements.join(', ')}. Erhöht Diagnose-Sicherheit.`,
    descriptionEn: `Isotope ratios confirm: ${verifiedElements.join(', ')}. Increases diagnosis confidence.`,
    confidence: Math.min(confidence, 1.0),
    severity: 'info',
    evidence,
    recommendation: 'Isotopenmuster stimmen mit erwarteten Werten überein.',
    recommendationEn: 'Isotope patterns match expected values.',
    affectedMasses: [...new Set(affectedMasses)]
  }
}
