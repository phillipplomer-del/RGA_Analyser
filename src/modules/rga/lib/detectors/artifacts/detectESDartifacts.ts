/**
 * ESD (Electron Stimulated Desorption) Artifacts Detector
 *
 * Detects ESD artifacts from ionizer grid contamination:
 * - Criterion 1: Anomalously high O⁺/O₂ ratio (> 0.5)
 * - Criterion 2: Elevated N⁺/N₂ ratio (> 0.25)
 * - Criterion 3: Elevated C⁺/CO ratio (> 0.12)
 * - Criterion 4: Elevated H⁺/H₂ ratio (> 0.20)
 * - Criterion 5: F⁺ without CF₃⁺ source
 * - Criterion 6: Anomalous Cl isotope ratio
 *
 * Cross-Validation Status: ⚠️ CONDITIONAL (Fixes Applied)
 * - Gemini: ⚠️ Conditional - thresholds too strict
 * - Grok: ⚠️ Conditional - H⁺/H₂ threshold unrealistic
 * - Fixes Applied:
 *   1. ✅ Raised N⁺/N₂ threshold from 0.15 to 0.25 (reduce false positives)
 *   2. ✅ Raised H⁺/H₂ threshold from 0.05 to 0.20 (realistic for 70 eV EI)
 *   3. ✅ Dynamic severity based on criteria count (≥4 → warning)
 *
 * References:
 * - Madey et al. 1984 (Surface Science 164, 602) - ESD mechanisms
 * - Menzel & Gomer 1964 (J. Chem. Phys. 41, 3311) - ESD theory
 * - NIST WebBook (70 eV EI fragment ratios)
 * - Redhead 1964 (Vacuum 13, 253) - Grid contamination effects
 *
 * @see NextFeatures/REVERSE_SPEC_detectESDartifacts.md
 */

import { DiagnosisType, type DiagnosticResult, type DiagnosisInput, type EvidenceItem, DEFAULT_THRESHOLDS } from '../shared/types'
import { getPeak, createEvidence } from '../shared/helpers'
import { ESD_THRESHOLDS } from '../shared/constants'

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
