/**
 * Data Quality Confidence Score System
 *
 * Bewertet die Qualität der RGA-Analyse basierend auf:
 * - Kalibrieralter (calibration age)
 * - Signal-to-Noise Ratio (SNR)
 * - Spektrum-Qualität (spectrum quality)
 * - Messparameter (measurement parameters)
 */

import type { AnalysisResult, Peak, NormalizedData } from '@/types/rga'
import { SystemState } from '@/types/calibration'

/**
 * Einzelner Qualitätsfaktor
 */
export interface QualityFactor {
  id: string
  name: string
  nameEn: string
  score: number           // 0-1
  weight: number          // Gewichtung für Gesamtscore
  status: 'excellent' | 'good' | 'acceptable' | 'poor' | 'critical'
  description: string
  descriptionEn: string
  recommendation?: string
  recommendationEn?: string
}

/**
 * Gesamtergebnis der Datenqualitätsbewertung
 */
export interface DataQualityScore {
  /** Gesamtscore 0-1 */
  overallScore: number
  /** Qualitätsstufe */
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  /** Beschreibung der Qualitätsstufe */
  gradeDescription: string
  gradeDescriptionEn: string
  /** Einzelne Qualitätsfaktoren */
  factors: QualityFactor[]
  /** Anzahl kritischer Probleme */
  criticalIssues: number
  /** Empfehlungen zur Verbesserung */
  improvements: string[]
  improvementsEn: string[]
  /** Beeinflusst Diagnose-Zuverlässigkeit */
  diagnosisReliability: 'high' | 'medium' | 'low' | 'very_low'
}

/**
 * Kontext für kontextabhängige Bewertung
 */
export interface MeasurementContext {
  /** Systemzustand (baked/unbaked) - beeinflusst Erwartungen */
  systemState: SystemState
  /** Totaldruck in mbar - beeinflusst erwartete Signalstärke */
  totalPressure?: number
  /** Messtemperatur in °C */
  temperature?: number
}

/**
 * Eingabeparameter für die Qualitätsbewertung
 */
export interface QualityAssessmentInput {
  /** Analyseergebnis */
  analysis: AnalysisResult
  /** Letzte Kalibrierung (wenn bekannt) - für spätere Verwendung vorbereitet */
  lastCalibration?: Date
  /** Messtemperatur in °C (aus Dateinamen geparst, z.B. "23c") */
  temperature?: number
  /** Kontext für kontextabhängige Bewertung */
  context?: MeasurementContext
}

/**
 * Erkennt den Systemzustand aus dem Spektrum selbst
 * Wenn Dateiname keinen Hinweis gibt, analysieren wir die Peaks:
 * - H₂ > H₂O (oder H₂O sehr niedrig) → wahrscheinlich ausgeheizt/UHV
 *
 * SYNCHRONISIERT mit createDiagnosisSummary in analysis/index.ts!
 */
function enrichContextFromSpectrum(
  context: MeasurementContext | undefined,
  peaks: Peak[]
): MeasurementContext | undefined {
  // Wenn Kontext schon BAKED ist, nicht überschreiben
  if (context?.systemState === SystemState.BAKED) {
    return context
  }

  // Spektrum-Analyse für automatische Erkennung
  const h2Peak = peaks.find(p => p.mass === 2)
  const h2oPeak = peaks.find(p => p.mass === 18)
  const significantPeaks = peaks.filter(p => p.normalizedValue >= 0.01).length

  // H₂ und H₂O Verhältnis prüfen
  const h2Value = h2Peak?.normalizedValue || 0
  const h2oValue = h2oPeak?.normalizedValue || 0

  // Baked-System Indikatoren (GLEICHE Logik wie createDiagnosisSummary):
  // 1. H₂ > H₂O * 3 (H₂ deutlich höher) - wie in diagnosis summary
  // ODER
  // 2. H₂ > H₂O UND wenige Peaks (sauberes Spektrum)
  // ODER
  // 3. Sehr wenige signifikante Peaks (≤3) UND H₂ vorhanden (UHV)
  const h2DominatesWater = h2Value > h2oValue * 3
  const h2HigherThanWater = h2Value > h2oValue
  const fewPeaks = significantPeaks <= 7
  const veryFewPeaks = significantPeaks <= 3
  const h2Present = h2Value > 0.1

  // Als BAKED behandeln wenn:
  // - H₂ deutlich dominiert (3x H₂O) - klassisches baked-Spektrum
  // - ODER H₂ > H₂O mit wenig Peaks - sauberes System
  // - ODER sehr wenige Peaks mit H₂ vorhanden - UHV
  if (h2DominatesWater || (h2HigherThanWater && fewPeaks) || (veryFewPeaks && h2Present)) {
    return {
      systemState: SystemState.BAKED,
      totalPressure: context?.totalPressure,
      temperature: context?.temperature
    }
  }

  // Sonst: Original-Kontext zurückgeben
  return context
}

/**
 * Berechnet den Gesamtqualitätsscore
 */
export function calculateDataQualityScore(input: QualityAssessmentInput): DataQualityScore {
  const factors: QualityFactor[] = []

  // Kontext erweitern: Auch aus Spektrum-Charakteristik ableiten
  const enrichedContext = enrichContextFromSpectrum(input.context, input.analysis.peaks)

  // 1. Spektrum-Qualität (SNR, Rauschen)
  factors.push(assessSpectrumQuality(input.analysis, enrichedContext))

  // 2. Peak-Erkennung (kontextabhängig: baked = weniger Peaks erwartet)
  factors.push(assessPeakDetection(input.analysis.peaks, enrichedContext))

  // 3. Dynamikbereich (kontextabhängig: niedriger Druck = weniger Dynamik)
  factors.push(assessDynamicRange(input.analysis.normalizedData, enrichedContext))

  // 4. Temperatur (aus Dateinamen, wenn verfügbar)
  if (input.temperature !== undefined) {
    factors.push(assessTemperature(input.temperature))
  }

  // 5. Massenbereich-Abdeckung
  factors.push(assessMassRangeCoverage(input.analysis))

  // 6. H2-Referenzpeak (kontextabhängig: baked = H₂ muss nicht dominant sein)
  factors.push(assessH2Reference(input.analysis.peaks, enrichedContext))

  // NOTE: Kalibrieralter ist vorbereitet in assessCalibrationAge() (exportiert)
  // Wird aktiviert sobald lastCalibration aus Geräteprofil/Cloud verfügbar ist
  // if (input.lastCalibration) {
  //   factors.push(assessCalibrationAge(input.lastCalibration))
  // }

  // Gewichteten Gesamtscore berechnen
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0)
  const weightedSum = factors.reduce((sum, f) => sum + f.score * f.weight, 0)
  const overallScore = totalWeight > 0 ? weightedSum / totalWeight : 0

  // Grade bestimmen
  const { grade, gradeDescription, gradeDescriptionEn } = determineGrade(overallScore)

  // Kritische Probleme zählen
  const criticalIssues = factors.filter(f => f.status === 'critical' || f.status === 'poor').length

  // Verbesserungsempfehlungen sammeln
  const improvements: string[] = []
  const improvementsEn: string[] = []

  factors
    .filter(f => f.recommendation)
    .sort((a, b) => a.score - b.score) // Schlechteste zuerst
    .slice(0, 3) // Top 3 Empfehlungen
    .forEach(f => {
      if (f.recommendation) improvements.push(f.recommendation)
      if (f.recommendationEn) improvementsEn.push(f.recommendationEn)
    })

  // Diagnose-Zuverlässigkeit bestimmen
  const diagnosisReliability = determineDiagnosisReliability(overallScore, criticalIssues)

  return {
    overallScore,
    grade,
    gradeDescription,
    gradeDescriptionEn,
    factors,
    criticalIssues,
    improvements,
    improvementsEn,
    diagnosisReliability
  }
}

/**
 * Bewertet die Spektrum-Qualität (SNR)
 * Kontextabhängig: Bei niedrigem Druck (UHV) ist geringeres SNR akzeptabel
 */
function assessSpectrumQuality(analysis: AnalysisResult, context?: MeasurementContext): QualityFactor {
  const data = analysis.normalizedData

  // Rauschen schätzen: Median der niedrigsten 20% der Werte
  const sortedCurrents = [...data.map(d => Math.abs(d.current))].sort((a, b) => a - b)
  const noiseFloorSamples = sortedCurrents.slice(0, Math.ceil(sortedCurrents.length * 0.2))
  const noiseFloor = noiseFloorSamples.reduce((a, b) => a + b, 0) / noiseFloorSamples.length

  // Signal: Maximum
  const maxSignal = Math.max(...data.map(d => Math.abs(d.current)))

  // SNR berechnen (logarithmisch)
  const snr = noiseFloor > 0 ? maxSignal / noiseFloor : 1000
  const snrDB = 10 * Math.log10(snr)

  // Kontext-Anpassung: Bei UHV (<1e-9 mbar) sind niedrigere SNR-Werte normal
  const isUHV = context?.totalPressure && context.totalPressure < 1e-9
  const isBaked = context?.systemState === SystemState.BAKED

  // Schwellenwerte anpassen für UHV/baked
  const snrThresholds = isUHV || isBaked
    ? { excellent: 45, good: 30, acceptable: 18, poor: 10 }
    : { excellent: 60, good: 40, acceptable: 25, poor: 15 }

  let score: number
  let status: QualityFactor['status']
  let description: string
  let descriptionEn: string
  let recommendation: string | undefined
  let recommendationEn: string | undefined

  const contextNote = isUHV ? ' (UHV-Bereich)' : (isBaked ? ' (nach Ausheizen)' : '')
  const contextNoteEn = isUHV ? ' (UHV range)' : (isBaked ? ' (after bakeout)' : '')

  if (snrDB >= snrThresholds.excellent) {
    score = 1.0
    status = 'excellent'
    description = `Exzellentes SNR (${snrDB.toFixed(0)} dB)${contextNote}`
    descriptionEn = `Excellent SNR (${snrDB.toFixed(0)} dB)${contextNoteEn}`
  } else if (snrDB >= snrThresholds.good) {
    score = 0.85
    status = 'good'
    description = `Gutes SNR (${snrDB.toFixed(0)} dB)${contextNote}`
    descriptionEn = `Good SNR (${snrDB.toFixed(0)} dB)${contextNoteEn}`
  } else if (snrDB >= snrThresholds.acceptable) {
    score = 0.6
    status = 'acceptable'
    description = `Akzeptables SNR (${snrDB.toFixed(0)} dB)${contextNote}`
    descriptionEn = `Acceptable SNR (${snrDB.toFixed(0)} dB)${contextNoteEn}`
    if (!isUHV && !isBaked) {
      recommendation = 'Längere Messzeit oder höhere Empfindlichkeit empfohlen'
      recommendationEn = 'Longer measurement time or higher sensitivity recommended'
    }
  } else if (snrDB >= snrThresholds.poor) {
    score = 0.35
    status = 'poor'
    description = `Niedriges SNR (${snrDB.toFixed(0)} dB)${contextNote}`
    descriptionEn = `Low SNR (${snrDB.toFixed(0)} dB)${contextNoteEn}`
    recommendation = isUHV || isBaked
      ? 'Niedrig, aber für UHV/ausgeheizte Systeme akzeptabel'
      : 'SEM-Spannung oder Messzeit erhöhen'
    recommendationEn = isUHV || isBaked
      ? 'Low, but acceptable for UHV/baked systems'
      : 'Increase SEM voltage or measurement time'
  } else {
    score = 0.15
    status = 'critical'
    description = `Kritisch niedriges SNR (${snrDB.toFixed(0)} dB)`
    descriptionEn = `Critically low SNR (${snrDB.toFixed(0)} dB)`
    recommendation = 'Detektor prüfen, ggf. SEM-Kalibrierung durchführen'
    recommendationEn = 'Check detector, consider SEM calibration'
  }

  return {
    id: 'snr',
    name: 'Signal-Rausch-Verhältnis',
    nameEn: 'Signal-to-Noise Ratio',
    score,
    weight: 1.5, // Höhere Gewichtung
    status,
    description,
    descriptionEn,
    recommendation,
    recommendationEn
  }
}

/**
 * Bewertet das Kalibrieralter
 * NOTE: Vorbereitet für spätere Verwendung wenn Kalibrierungsdatum verfügbar
 * Exportiert für zukünftige Integration mit Geräteprofil/Cloud
 */
export function assessCalibrationAge(lastCalibration?: Date): QualityFactor {
  if (!lastCalibration) {
    return {
      id: 'calibration',
      name: 'Kalibrieralter',
      nameEn: 'Calibration Age',
      score: 0.5,
      weight: 1.0,
      status: 'acceptable',
      description: 'Kalibrierungsdatum unbekannt',
      descriptionEn: 'Calibration date unknown',
      recommendation: 'Kalibrierungsdatum erfassen für bessere Bewertung',
      recommendationEn: 'Record calibration date for better assessment'
    }
  }

  const now = new Date()
  const daysSinceCalibration = Math.floor((now.getTime() - lastCalibration.getTime()) / (1000 * 60 * 60 * 24))

  let score: number
  let status: QualityFactor['status']
  let description: string
  let descriptionEn: string
  let recommendation: string | undefined
  let recommendationEn: string | undefined

  if (daysSinceCalibration <= 30) {
    score = 1.0
    status = 'excellent'
    description = `Kalibriert vor ${daysSinceCalibration} Tagen`
    descriptionEn = `Calibrated ${daysSinceCalibration} days ago`
  } else if (daysSinceCalibration <= 90) {
    score = 0.85
    status = 'good'
    description = `Kalibriert vor ${daysSinceCalibration} Tagen`
    descriptionEn = `Calibrated ${daysSinceCalibration} days ago`
  } else if (daysSinceCalibration <= 180) {
    score = 0.6
    status = 'acceptable'
    description = `Kalibriert vor ${Math.floor(daysSinceCalibration / 30)} Monaten`
    descriptionEn = `Calibrated ${Math.floor(daysSinceCalibration / 30)} months ago`
    recommendation = 'Rekalibrierung in den nächsten Wochen empfohlen'
    recommendationEn = 'Recalibration recommended in the next few weeks'
  } else if (daysSinceCalibration <= 365) {
    score = 0.35
    status = 'poor'
    description = `Kalibriert vor ${Math.floor(daysSinceCalibration / 30)} Monaten - überfällig`
    descriptionEn = `Calibrated ${Math.floor(daysSinceCalibration / 30)} months ago - overdue`
    recommendation = 'Rekalibrierung dringend empfohlen'
    recommendationEn = 'Recalibration urgently recommended'
  } else {
    score = 0.1
    status = 'critical'
    description = `Kalibriert vor über einem Jahr`
    descriptionEn = `Calibrated over a year ago`
    recommendation = 'Rekalibrierung erforderlich vor weiteren Messungen'
    recommendationEn = 'Recalibration required before further measurements'
  }

  return {
    id: 'calibration',
    name: 'Kalibrieralter',
    nameEn: 'Calibration Age',
    score,
    weight: 1.0,
    status,
    description,
    descriptionEn,
    recommendation,
    recommendationEn
  }
}

/**
 * Bewertet die Peak-Erkennung
 * KONTEXTABHÄNGIG:
 * - Baked/UHV: Wenige Peaks = GUT (sauberes System!)
 * - Unbaked: Mehr Peaks erwartet (Wasser, Luft, etc.)
 */
function assessPeakDetection(peaks: Peak[], context?: MeasurementContext): QualityFactor {
  const peakCount = peaks.length

  // Signifikanz-Schwelle dynamisch: Bei baked/UHV sind auch kleine Peaks relevant
  // weil H₂ so dominant ist (andere Peaks erscheinen relativ klein)
  const isBaked = context?.systemState === SystemState.BAKED
  const isUHV = context?.totalPressure && context.totalPressure < 1e-9

  // Niedrigere Schwelle für baked/UHV: 0.1% statt 1%
  // Normal: 1% (0.01), Baked: 0.1% (0.001)
  const significanceThreshold = (isBaked || isUHV) ? 0.001 : 0.01
  const significantPeaks = peaks.filter(p => p.normalizedValue >= significanceThreshold).length

  let score: number
  let status: QualityFactor['status']
  let description: string
  let descriptionEn: string
  let recommendation: string | undefined
  let recommendationEn: string | undefined

  // Bei baked/UHV System: Weniger Peaks ist GUT (sauberes Vakuum)
  if (isBaked || isUHV) {
    if (significantPeaks <= 3) {
      score = 1.0
      status = 'excellent'
      description = `Nur ${significantPeaks} Peaks - sauberes UHV-System`
      descriptionEn = `Only ${significantPeaks} peaks - clean UHV system`
    } else if (significantPeaks <= 5) {
      score = 0.85
      status = 'good'
      description = `${significantPeaks} Peaks - gutes Vakuum nach Ausheizen`
      descriptionEn = `${significantPeaks} peaks - good vacuum after bakeout`
    } else if (significantPeaks <= 8) {
      score = 0.6
      status = 'acceptable'
      description = `${significantPeaks} Peaks - noch Restgas vorhanden`
      descriptionEn = `${significantPeaks} peaks - some residual gas present`
      recommendation = 'System weiter auspumpen oder erneut ausheizen'
      recommendationEn = 'Continue pumping or bake out again'
    } else {
      score = 0.4
      status = 'poor'
      description = `${significantPeaks} Peaks trotz Ausheizen - mögliches Leck oder Kontamination`
      descriptionEn = `${significantPeaks} peaks despite bakeout - possible leak or contamination`
      recommendation = 'Lecksuche durchführen oder Kontaminationsquelle identifizieren'
      recommendationEn = 'Perform leak test or identify contamination source'
    }
  } else {
    // Unbaked System: Normale Bewertung
    if (significantPeaks >= 5 && peakCount >= 10) {
      score = 1.0
      status = 'excellent'
      description = `${significantPeaks} signifikante Peaks erkannt`
      descriptionEn = `${significantPeaks} significant peaks detected`
    } else if (significantPeaks >= 3 && peakCount >= 5) {
      score = 0.8
      status = 'good'
      description = `${significantPeaks} signifikante Peaks erkannt`
      descriptionEn = `${significantPeaks} significant peaks detected`
    } else if (significantPeaks >= 2) {
      score = 0.55
      status = 'acceptable'
      description = `Nur ${significantPeaks} signifikante Peaks - möglicherweise UHV`
      descriptionEn = `Only ${significantPeaks} significant peaks - possibly UHV`
      recommendation = 'Systemzustand im Dateinamen angeben (z.B. "after bakeout")'
      recommendationEn = 'Specify system state in filename (e.g., "after bakeout")'
    } else if (significantPeaks >= 1) {
      score = 0.3
      status = 'poor'
      description = `Sehr wenige Peaks - UHV oder Detektorproblem?`
      descriptionEn = `Very few peaks - UHV or detector issue?`
      recommendation = 'Bei UHV normal. Sonst: Detektor prüfen'
      recommendationEn = 'Normal for UHV. Otherwise: check detector'
    } else {
      score = 0.1
      status = 'critical'
      description = 'Keine signifikanten Peaks erkannt'
      descriptionEn = 'No significant peaks detected'
      recommendation = 'RGA-Funktion überprüfen'
      recommendationEn = 'Check RGA functionality'
    }
  }

  return {
    id: 'peaks',
    name: 'Peak-Erkennung',
    nameEn: 'Peak Detection',
    score,
    weight: 1.2,
    status,
    description,
    descriptionEn,
    recommendation,
    recommendationEn
  }
}

/**
 * Bewertet den Dynamikbereich
 * KONTEXTABHÄNGIG: Bei UHV ist geringerer Dynamikbereich normal
 */
function assessDynamicRange(data: NormalizedData[], context?: MeasurementContext): QualityFactor {
  const currents = data.map(d => Math.abs(d.current)).filter(c => c > 0)
  if (currents.length === 0) {
    return {
      id: 'dynamic_range',
      name: 'Dynamikbereich',
      nameEn: 'Dynamic Range',
      score: 0.1,
      weight: 0.8,
      status: 'critical',
      description: 'Keine Messwerte',
      descriptionEn: 'No measurement values'
    }
  }

  const maxCurrent = Math.max(...currents)
  const minCurrent = Math.min(...currents)
  const dynamicRange = maxCurrent / minCurrent
  const rangeDecades = Math.log10(dynamicRange)

  const isBaked = context?.systemState === SystemState.BAKED
  const isUHV = context?.totalPressure && context.totalPressure < 1e-9

  // Bei UHV/baked sind niedrigere Schwellenwerte akzeptabel
  const thresholds = isUHV || isBaked
    ? { excellent: 4, good: 3, acceptable: 2 }
    : { excellent: 5, good: 4, acceptable: 3 }

  const contextNote = isUHV ? ' (UHV)' : (isBaked ? ' (ausgeheizt)' : '')
  const contextNoteEn = isUHV ? ' (UHV)' : (isBaked ? ' (baked)' : '')

  let score: number
  let status: QualityFactor['status']
  let description: string
  let descriptionEn: string

  if (rangeDecades >= thresholds.excellent) {
    score = 1.0
    status = 'excellent'
    description = `${rangeDecades.toFixed(1)} Dekaden Dynamikbereich${contextNote}`
    descriptionEn = `${rangeDecades.toFixed(1)} decades dynamic range${contextNoteEn}`
  } else if (rangeDecades >= thresholds.good) {
    score = 0.85
    status = 'good'
    description = `${rangeDecades.toFixed(1)} Dekaden Dynamikbereich${contextNote}`
    descriptionEn = `${rangeDecades.toFixed(1)} decades dynamic range${contextNoteEn}`
  } else if (rangeDecades >= thresholds.acceptable) {
    score = 0.6
    status = 'acceptable'
    description = `${rangeDecades.toFixed(1)} Dekaden${contextNote} - ausreichend für Diagnose`
    descriptionEn = `${rangeDecades.toFixed(1)} decades${contextNoteEn} - sufficient for diagnosis`
  } else {
    score = isUHV || isBaked ? 0.5 : 0.35
    status = isUHV || isBaked ? 'acceptable' : 'poor'
    description = isUHV || isBaked
      ? `${rangeDecades.toFixed(1)} Dekaden - für UHV/ausgeheizt normal`
      : `Nur ${rangeDecades.toFixed(1)} Dekaden Dynamikbereich`
    descriptionEn = isUHV || isBaked
      ? `${rangeDecades.toFixed(1)} decades - normal for UHV/baked`
      : `Only ${rangeDecades.toFixed(1)} decades dynamic range`
  }

  return {
    id: 'dynamic_range',
    name: 'Dynamikbereich',
    nameEn: 'Dynamic Range',
    score,
    weight: 0.8,
    status,
    description,
    descriptionEn
  }
}

/**
 * Bewertet die Temperatur-Stabilität
 */
function assessTemperature(temperature: number): QualityFactor {
  // Ideale RGA-Betriebstemperatur: 20-25°C
  const idealMin = 20
  const idealMax = 25

  let score: number
  let status: QualityFactor['status']
  let description: string
  let descriptionEn: string
  let recommendation: string | undefined
  let recommendationEn: string | undefined

  if (temperature >= idealMin && temperature <= idealMax) {
    score = 1.0
    status = 'excellent'
    description = `Optimale Temperatur (${temperature}°C)`
    descriptionEn = `Optimal temperature (${temperature}°C)`
  } else if (temperature >= 15 && temperature <= 30) {
    score = 0.8
    status = 'good'
    description = `Akzeptable Temperatur (${temperature}°C)`
    descriptionEn = `Acceptable temperature (${temperature}°C)`
  } else if (temperature >= 10 && temperature <= 35) {
    score = 0.5
    status = 'acceptable'
    description = `Temperatur außerhalb Idealbereich (${temperature}°C)`
    descriptionEn = `Temperature outside ideal range (${temperature}°C)`
    recommendation = 'Raumtemperatur stabilisieren'
    recommendationEn = 'Stabilize room temperature'
  } else {
    score = 0.25
    status = 'poor'
    description = `Extreme Temperatur (${temperature}°C)`
    descriptionEn = `Extreme temperature (${temperature}°C)`
    recommendation = 'Messung bei stabilerer Temperatur wiederholen'
    recommendationEn = 'Repeat measurement at more stable temperature'
  }

  return {
    id: 'temperature',
    name: 'Temperatur',
    nameEn: 'Temperature',
    score,
    weight: 0.6,
    status,
    description,
    descriptionEn,
    recommendation,
    recommendationEn
  }
}

/**
 * Bewertet die Massenbereich-Abdeckung
 */
function assessMassRangeCoverage(analysis: AnalysisResult): QualityFactor {
  const { firstMass, scanWidth } = analysis.metadata
  const lastMass = firstMass + scanWidth - 1

  // Wichtige Massen für vollständige Diagnose
  const criticalMasses = [2, 14, 16, 17, 18, 28, 32, 40, 44]
  const coveredCritical = criticalMasses.filter(m => m >= firstMass && m <= lastMass).length
  const coverageRatio = coveredCritical / criticalMasses.length

  let score: number
  let status: QualityFactor['status']
  let description: string
  let descriptionEn: string
  let recommendation: string | undefined
  let recommendationEn: string | undefined

  if (coverageRatio >= 1.0 && lastMass >= 100) {
    score = 1.0
    status = 'excellent'
    description = `Vollständige Abdeckung (m/z ${firstMass}-${lastMass})`
    descriptionEn = `Complete coverage (m/z ${firstMass}-${lastMass})`
  } else if (coverageRatio >= 0.9) {
    score = 0.85
    status = 'good'
    description = `Gute Abdeckung (${(coverageRatio * 100).toFixed(0)}% kritischer Massen)`
    descriptionEn = `Good coverage (${(coverageRatio * 100).toFixed(0)}% of critical masses)`
  } else if (coverageRatio >= 0.7) {
    score = 0.6
    status = 'acceptable'
    description = `Teilweise Abdeckung - einige Diagnosen limitiert`
    descriptionEn = `Partial coverage - some diagnoses limited`
    recommendation = 'Erweiterten Massenbereich scannen (m/z 1-100+)'
    recommendationEn = 'Scan extended mass range (m/z 1-100+)'
  } else {
    score = 0.3
    status = 'poor'
    description = `Eingeschränkter Massenbereich (m/z ${firstMass}-${lastMass})`
    descriptionEn = `Limited mass range (m/z ${firstMass}-${lastMass})`
    recommendation = 'Vollständiger Massenbereich empfohlen für zuverlässige Diagnose'
    recommendationEn = 'Full mass range recommended for reliable diagnosis'
  }

  return {
    id: 'mass_range',
    name: 'Massenbereich',
    nameEn: 'Mass Range',
    score,
    weight: 0.9,
    status,
    description,
    descriptionEn,
    recommendation,
    recommendationEn
  }
}

/**
 * Bewertet den H2-Referenzpeak
 * KONTEXTABHÄNGIG:
 * - Baked: H₂ muss nicht dominant sein (ist normal bei sauberem UHV)
 * - Unbaked: H₂ dominant = typisch für Edelstahl
 */
function assessH2Reference(peaks: Peak[], context?: MeasurementContext): QualityFactor {
  const h2Peak = peaks.find(p => p.mass === 2)
  const h2oPeak = peaks.find(p => p.mass === 18)

  const isBaked = context?.systemState === SystemState.BAKED
  const isUHV = context?.totalPressure && context.totalPressure < 1e-9

  if (!h2Peak) {
    // Bei UHV/baked kann fehlendes H₂ akzeptabel sein
    if (isBaked || isUHV) {
      return {
        id: 'h2_reference',
        name: 'H₂-Referenz',
        nameEn: 'H₂ Reference',
        score: 0.7,
        weight: 0.7,
        status: 'good',
        description: 'Kein H₂-Peak - bei UHV/ausgeheizt möglich',
        descriptionEn: 'No H₂ peak - possible for UHV/baked systems'
      }
    }
    return {
      id: 'h2_reference',
      name: 'H₂-Referenz',
      nameEn: 'H₂ Reference',
      score: 0.4,
      weight: 0.7,
      status: 'poor',
      description: 'Kein H₂-Peak bei m/z 2 gefunden',
      descriptionEn: 'No H₂ peak found at m/z 2',
      recommendation: 'Massenbereich 1-4 prüfen',
      recommendationEn: 'Check mass range 1-4'
    }
  }

  const isStrongest = h2Peak.normalizedValue >= 0.8
  const isSignificant = h2Peak.normalizedValue >= 0.1
  const h2oValue = h2oPeak?.normalizedValue || 0

  let score: number
  let status: QualityFactor['status']
  let description: string
  let descriptionEn: string

  // Bei baked/UHV: Andere Bewertungslogik
  if (isBaked || isUHV) {
    // Bei ausgeheiztem System: H₂ > H₂O ist das Wichtige
    if (h2Peak.normalizedValue > h2oValue) {
      score = 1.0
      status = 'excellent'
      description = 'H₂ > H₂O - erfolgreich ausgeheizt'
      descriptionEn = 'H₂ > H₂O - successfully baked out'
    } else if (h2oValue > h2Peak.normalizedValue * 3) {
      score = 0.5
      status = 'acceptable'
      description = 'H₂O noch dominant - Ausheizen evtl. nicht vollständig'
      descriptionEn = 'H₂O still dominant - bakeout may be incomplete'
    } else {
      score = 0.75
      status = 'good'
      description = 'H₂ und H₂O ähnlich - typisch kurz nach Ausheizen'
      descriptionEn = 'H₂ and H₂O similar - typical shortly after bakeout'
    }
  } else {
    // Unbaked System: Normale Bewertung
    if (isStrongest) {
      score = 1.0
      status = 'excellent'
      description = 'H₂ ist dominanter Peak - typisch für Edelstahl-Vakuumkammer'
      descriptionEn = 'H₂ is dominant peak - typical for stainless steel vacuum chamber'
    } else if (isSignificant) {
      score = 0.75
      status = 'good'
      description = 'H₂ signifikant, aber nicht dominant'
      descriptionEn = 'H₂ significant but not dominant'
    } else {
      score = 0.5
      status = 'acceptable'
      description = 'Schwacher H₂-Peak - möglicherweise Kontamination oder frisch geöffnet'
      descriptionEn = 'Weak H₂ peak - possible contamination or recently vented'
    }
  }

  return {
    id: 'h2_reference',
    name: 'H₂-Referenz',
    nameEn: 'H₂ Reference',
    score,
    weight: 0.7,
    status,
    description,
    descriptionEn
  }
}

/**
 * Bestimmt die Qualitätsstufe basierend auf dem Score
 */
function determineGrade(score: number): {
  grade: DataQualityScore['grade']
  gradeDescription: string
  gradeDescriptionEn: string
} {
  if (score >= 0.9) {
    return {
      grade: 'A',
      gradeDescription: 'Exzellente Datenqualität - Diagnosen hochzuverlässig',
      gradeDescriptionEn: 'Excellent data quality - diagnoses highly reliable'
    }
  } else if (score >= 0.75) {
    return {
      grade: 'B',
      gradeDescription: 'Gute Datenqualität - Diagnosen zuverlässig',
      gradeDescriptionEn: 'Good data quality - diagnoses reliable'
    }
  } else if (score >= 0.55) {
    return {
      grade: 'C',
      gradeDescription: 'Akzeptable Datenqualität - Diagnosen mit Vorbehalt',
      gradeDescriptionEn: 'Acceptable data quality - diagnoses with reservations'
    }
  } else if (score >= 0.35) {
    return {
      grade: 'D',
      gradeDescription: 'Eingeschränkte Datenqualität - Diagnosen unsicher',
      gradeDescriptionEn: 'Limited data quality - diagnoses uncertain'
    }
  } else {
    return {
      grade: 'F',
      gradeDescription: 'Unzureichende Datenqualität - Diagnosen nicht zuverlässig',
      gradeDescriptionEn: 'Insufficient data quality - diagnoses unreliable'
    }
  }
}

/**
 * Bestimmt die Diagnose-Zuverlässigkeit
 */
function determineDiagnosisReliability(
  score: number,
  criticalIssues: number
): DataQualityScore['diagnosisReliability'] {
  if (criticalIssues >= 2) return 'very_low'
  if (criticalIssues >= 1 || score < 0.4) return 'low'
  if (score < 0.6) return 'medium'
  return 'high'
}

/**
 * Formatiert den Score als Prozent-String
 */
export function formatScorePercent(score: number): string {
  return `${(score * 100).toFixed(0)}%`
}

/**
 * Gibt die Farbe für einen Status zurück
 */
export function getStatusColor(status: QualityFactor['status']): string {
  switch (status) {
    case 'excellent': return '#10B981' // green
    case 'good': return '#3B82F6'      // blue
    case 'acceptable': return '#F59E0B' // amber
    case 'poor': return '#F97316'       // orange
    case 'critical': return '#EF4444'   // red
  }
}

/**
 * Gibt die Farbe für eine Grade zurück
 */
export function getGradeColor(grade: DataQualityScore['grade']): string {
  switch (grade) {
    case 'A': return '#10B981'
    case 'B': return '#3B82F6'
    case 'C': return '#F59E0B'
    case 'D': return '#F97316'
    case 'F': return '#EF4444'
  }
}
