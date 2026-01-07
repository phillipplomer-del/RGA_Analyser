/**
 * Diagnose-Detektoren
 *
 * Implementiert alle Diagnose-Algorithmen basierend auf dem konsolidierten
 * RGA-Expertenwissen aus CERN, Pfeiffer, MKS, NIST
 */

import {
  DiagnosisType,
  type DiagnosticResult,
  type DiagnosisInput,
  type EvidenceItem,
  DEFAULT_THRESHOLDS
} from './types'

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
      ratio >= 0.5 && ratio <= 1.2,
      ratio
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
    oilType = 'Turbopumpe'
    evidence.push(createEvidence(
      'ratio',
      `Hoher m71-Anteil deutet auf Turbopumpenöl`,
      `High m71 content indicates turbopump oil`,
      true,
      m71 / m43
    ))
  }

  return {
    type: DiagnosisType.OIL_BACKSTREAMING,
    name: `Öl-Rückströmung (${oilType})`,
    nameEn: `Oil Backstreaming (${oilType === 'Vorpumpe' ? 'Forepump' : 'Turbopump'})`,
    description: `Kohlenwasserstoff-Muster deutet auf ${oilType}nöl-Kontamination.`,
    descriptionEn: `Hydrocarbon pattern indicates ${oilType === 'Vorpumpe' ? 'forepump' : 'turbopump'} oil contamination.`,
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

  // Weitere PFPE-Marker
  if (m31 > DEFAULT_THRESHOLDS.minPeakHeight || m47 > DEFAULT_THRESHOLDS.minPeakHeight) {
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
    affectedMasses: [20, 31, 47, 50, 69]
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
export function detectESDartifacts(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  const m16 = getPeak(peaks, 16)  // O⁺
  const m19 = getPeak(peaks, 19)  // F⁺
  const m35 = getPeak(peaks, 35)  // Cl⁺
  const m32 = getPeak(peaks, 32)  // O₂
  const m69 = getPeak(peaks, 69)  // CF₃⁺

  const evidence: EvidenceItem[] = []
  let confidence = 0

  // Anomal hoher O⁺ Peak ohne O₂
  if (m16 > 0 && m32 > 0) {
    const ratio_16_32 = m16 / m32
    if (ratio_16_32 > 0.5) {  // Normal: ~0.11-0.22
      evidence.push(createEvidence(
        'ratio',
        `Anomal hoher O⁺: m16/m32 = ${ratio_16_32.toFixed(2)} (normal: ~0.15)`,
        `Anomalously high O⁺: m16/m32 = ${ratio_16_32.toFixed(2)} (normal: ~0.15)`,
        false,
        ratio_16_32,
        { max: 0.3 }
      ))
      confidence += 0.3
    }
  }

  // F⁺ ohne Fluorquelle
  if (m19 > DEFAULT_THRESHOLDS.minPeakHeight && m69 < m19 * 0.5) {
    evidence.push(createEvidence(
      'presence',
      `F⁺ (m19) ohne CF₃⁺ (m69) - ESD von adsorbierten Fluoriden`,
      `F⁺ (m19) without CF₃⁺ (m69) - ESD from adsorbed fluorides`,
      false,
      m19 * 100
    ))
    confidence += 0.3
  }

  // Cl⁺ prüfen
  const m37 = getPeak(peaks, 37)
  if (m35 > DEFAULT_THRESHOLDS.minPeakHeight) {
    const clRatio = m35 / (m37 || 0.001)
    if (clRatio < 2 || clRatio > 5) {
      evidence.push(createEvidence(
        'ratio',
        `Cl-Isotopenverhältnis anomal: ${clRatio.toFixed(2)} (erwartet: 3.1) - mögl. ESD`,
        `Cl isotope ratio anomalous: ${clRatio.toFixed(2)} (expected: 3.1) - possible ESD`,
        false,
        clRatio
      ))
      confidence += 0.2
    }
  }

  if (confidence < DEFAULT_THRESHOLDS.minConfidence) return null

  return {
    type: DiagnosisType.ESD_ARTIFACT,
    name: 'ESD-Artefakt vermutet',
    nameEn: 'ESD Artifact Suspected',
    description: 'Electron Stimulated Desorption erzeugt Ionen von adsorbierten Molekülen am Ionisatorgitter.',
    descriptionEn: 'Electron Stimulated Desorption generates ions from molecules adsorbed on ionizer grid.',
    confidence: Math.min(confidence, 1.0),
    severity: 'info',
    evidence,
    recommendation: 'Ionisator degasen (20mA/500eV). Elektronenenergie variieren zum Test. Hintergrundmessung durchführen.',
    recommendationEn: 'Degas ionizer (20mA/500eV). Vary electron energy for testing. Perform background measurement.',
    affectedMasses: [16, 19, 35]
  }
}

// ============================================
// 9. SILIKON-KONTAMINATION
// ============================================
export function detectSiliconeContamination(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  const m73 = getPeak(peaks, 73)   // (CH₃)₃Si⁺ - Trimethylsilyl
  const m59 = getPeak(peaks, 59)

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

  if (m59 > DEFAULT_THRESHOLDS.minPeakHeight) {
    evidence.push(createEvidence(
      'presence',
      `Weitere Silikon-Fragmente (m/z 59) vorhanden`,
      `Additional silicone fragments (m/z 59) present`,
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
    affectedMasses: [45, 59, 73]
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

  // ¹³CO Check
  if (m29 > 0 && m28 > 0 && m29 / m28 > 0.015) {
    evidence.push(createEvidence(
      'ratio',
      `Erhöhtes m29/m28 deutet auf CO (¹³CO)`,
      `Elevated m29/m28 indicates CO (¹³CO)`,
      true,
      (m29 / m28) * 100
    ))
    probablyCO = true
    confidence += 0.2
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
