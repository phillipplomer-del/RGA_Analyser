import type { RawData, AnalysisResult, NormalizedData, Peak, DataPoint, DiagnosticResultSummary, DiagnosisSummary } from '@/types/rga'
import type { CalibrationLevel, DeviceCalibration } from '@/types/calibration'
import { SystemState } from '@/types/calibration'
import { checkLimits } from '@/lib/limits'
import { performQualityChecks } from '@/lib/quality'
import { runFullDiagnosis, createDiagnosisInput, getDiagnosisSummary, DIAGNOSIS_METADATA, calculateDataQualityScore, type DiagnosticResult } from '@/lib/diagnosis'
import { calibrate, PressureConversionService, getSEMTracker, parseFilenameExtended } from '@/lib/calibration'

// Known masses and their gas identifications
export const KNOWN_MASSES: { mass: number; gas: string; fragments?: string[] }[] = [
  { mass: 1, gas: 'H⁺', fragments: ['H₂'] },
  { mass: 2, gas: 'H₂', fragments: [] },
  { mass: 4, gas: 'He', fragments: [] },
  { mass: 12, gas: 'C⁺', fragments: ['CO', 'CO₂', 'Kohlenwasserstoffe'] },
  { mass: 14, gas: 'N⁺', fragments: ['N₂'] },
  { mass: 16, gas: 'O⁺', fragments: ['O₂', 'H₂O', 'CO₂'] },
  { mass: 17, gas: 'OH⁺', fragments: ['H₂O'] },
  { mass: 18, gas: 'H₂O', fragments: [] },
  { mass: 19, gas: 'F⁺/H₃O⁺', fragments: ['Fluorverbindungen', 'H₂O'] },
  { mass: 20, gas: 'Ar²⁺/Ne/HF', fragments: ['Ar', 'Ne', 'HF'] },
  { mass: 28, gas: 'N₂/CO', fragments: [] },
  { mass: 29, gas: 'N₂-Isotop/CHO⁺', fragments: ['N₂', 'Kohlenwasserstoffe'] },
  { mass: 31, gas: 'CF⁺', fragments: ['Fluorverbindungen'] },
  { mass: 32, gas: 'O₂', fragments: [] },
  { mass: 35, gas: '³⁵Cl⁺', fragments: ['Chlorverbindungen'] },
  { mass: 36, gas: 'HCl/³⁶Ar', fragments: ['HCl', 'Ar-Isotop'] },
  { mass: 40, gas: 'Ar', fragments: [] },
  { mass: 44, gas: 'CO₂', fragments: [] },
  { mass: 45, gas: '¹³CO₂/CHO₂⁺', fragments: ['CO₂-Isotop', 'Kohlenwasserstoffe'] },
  { mass: 50, gas: 'CF₂⁺', fragments: ['Fluorverbindungen'] },
  { mass: 69, gas: 'CF₃⁺', fragments: ['Fluorverbindungen', 'Kohlenwasserstoffe'] },
  { mass: 77, gas: 'C₆H₅⁺', fragments: ['Aromaten', 'Kohlenwasserstoffe'] },
]

export class AnalysisError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: string
  ) {
    super(message)
    this.name = 'AnalysisError'
  }
}

export interface AnalysisOptions {
  calibrationLevel?: CalibrationLevel
  deviceCalibration?: DeviceCalibration
}

export function analyzeSpectrum(raw: RawData, options: AnalysisOptions = {}): AnalysisResult {
  // Validate input data
  if (!raw.points || raw.points.length === 0) {
    throw new AnalysisError(
      'Keine Datenpunkte gefunden',
      'NO_DATA',
      'Die ASC-Datei enthält keine gültigen Messdaten. Bitte überprüfen Sie das Dateiformat.'
    )
  }

  if (raw.points.length < 100) {
    throw new AnalysisError(
      'Zu wenige Datenpunkte',
      'INSUFFICIENT_DATA',
      `Nur ${raw.points.length} Datenpunkte gefunden. Eine valide RGA-Messung sollte mindestens 100 Punkte enthalten.`
    )
  }

  // 1. Background Subtraction
  const currents = raw.points.map((p) => p.current).filter(c => isFinite(c) && c > 0)

  if (currents.length === 0) {
    throw new AnalysisError(
      'Keine gültigen Stromwerte',
      'INVALID_CURRENTS',
      'Alle Ionenstrom-Werte sind ungültig (0, NaN oder Infinity). Die Datei könnte beschädigt sein.'
    )
  }

  const minCurrent = Math.min(...currents)

  // 2. Find H₂ peak for normalization
  const h2Peak = findPeakValue(raw.points, 2)

  if (h2Peak <= 0) {
    console.warn('H₂ Peak (Masse 2) nicht gefunden oder zu niedrig. Verwende Maximum als Referenz.')
  }

  const maxCurrent = h2Peak > 0 ? h2Peak : Math.max(...currents)

  if (maxCurrent <= minCurrent) {
    throw new AnalysisError(
      'Kein Signal erkannt',
      'NO_SIGNAL',
      'Der maximale Stromwert ist nicht größer als das Hintergrundrauschen. Das Vakuum könnte zu gut sein oder es liegt ein Messfehler vor.'
    )
  }

  // 3. Normalize data
  const normalizedData: NormalizedData[] = raw.points.map((p) => ({
    mass: p.mass,
    current: p.current,
    backgroundSubtracted: p.current - minCurrent,
    normalizedToH2: maxCurrent > minCurrent ? (p.current - minCurrent) / (maxCurrent - minCurrent) : 0,
  }))

  // 4. Detect and integrate peaks
  const peaks = detectPeaks(raw.points, normalizedData)

  // 5. Check limits
  const limitChecks = checkLimits(normalizedData)

  // 6. Quality checks
  const qualityChecks = performQualityChecks(peaks)

  // 7. Calculate totals
  const totalPressure = raw.points.reduce((sum, p) => sum + p.current, 0)
  const dominantGases = identifyDominantGases(peaks, totalPressure)

  // 8. Parse filename metadata first (needed for diagnosis AND calibration)
  const filename = raw.metadata.sourceFile || ''
  const filenameMetadata = parseFilenameExtended(filename)
  const isBaked = filenameMetadata.systemState === SystemState.BAKED

  // 9. Run automatic diagnosis WITH metadata from filename
  const diagnosisInput = createDiagnosisInput(normalizedData, {
    bakedOut: isBaked,
    chamber: raw.metadata.chamberName
  })
  const diagnosticResults = runFullDiagnosis(diagnosisInput, 0.3)
  const diagnostics = convertDiagnosticsForUI(diagnosticResults)
  const diagnosisSummary = createDiagnosisSummary(diagnosticResults, normalizedData)

  // 10. Pressure Calibration (reuses filename metadata)
  const spectrumMap = new Map(raw.points.map(p => [Math.round(p.mass), p.current]))

  const calibrationResult = calibrate(filename, spectrumMap, {
    level: options.calibrationLevel || 'STANDARD',
    deviceCalibration: options.deviceCalibration
  })

  // 11. Convert to pressure values
  const conversionService = new PressureConversionService()
  conversionService.setCalibration(calibrationResult)

  const pressureData = conversionService.convertSpectrum(raw.points, {
    applyRSF: true,
    applyDeconvolution: true,
    unit: 'mbar'
  })

  const gasPartialPressures = conversionService.getGasPartialPressures('mbar')

  // 12. SEM Aging Tracking
  const semTracker = getSEMTracker()
  semTracker.addEntry(calibrationResult.metadata)
  const semWarning = semTracker.checkAging()

  // 13. Data Quality Score (Konfidenz-Score System 1.5.3)
  // KONTEXTABHÄNGIG: Berücksichtigt Systemzustand (baked/unbaked) und Druck
  const analysisResultForQuality = {
    metadata: raw.metadata,
    normalizedData,
    peaks,
    limitChecks,
    qualityChecks,
    totalPressure,
    dominantGases
  } as AnalysisResult

  const dataQualityScore = calculateDataQualityScore({
    analysis: analysisResultForQuality,
    // Temperatur aus Dateinamen (z.B. "23c" → 23)
    temperature: filenameMetadata.temperature,
    // Kontext für kontextabhängige Bewertung
    context: {
      systemState: filenameMetadata.systemState,
      totalPressure: filenameMetadata.totalPressure,
      temperature: filenameMetadata.temperature
    }
    // TODO: lastCalibration aus Geräteprofil oder Cloud-Daten
  })

  return {
    metadata: raw.metadata,
    normalizedData,
    peaks,
    limitChecks,
    qualityChecks,
    totalPressure,
    dominantGases,
    diagnostics,
    diagnosisSummary,
    dataQualityScore,
    // Calibration data
    calibration: calibrationResult,
    pressureData,
    gasPartialPressures,
    semWarning,
  }
}

function findPeakValue(points: DataPoint[], targetMass: number): number {
  const tolerance = 0.5
  const peakPoints = points.filter((p) => Math.abs(p.mass - targetMass) <= tolerance)
  if (peakPoints.length === 0) return 0
  return Math.max(...peakPoints.map((p) => p.current))
}

/**
 * Re-normalisiert Daten auf einen anderen Peak (on-the-fly Berechnung)
 * @param normalizedData Originale normalisierte Daten (auf H₂)
 * @param targetMass Masse, auf die normalisiert werden soll
 * @returns Neu normalisierte Werte (nur die normalizedToH2 Werte werden ersetzt)
 */
export function renormalizeData(
  normalizedData: NormalizedData[],
  targetMass: number
): NormalizedData[] {
  // Finde den Peak-Wert für die Ziel-Masse
  const tolerance = 0.5
  const targetPoints = normalizedData.filter(
    (p) => Math.abs(p.mass - targetMass) <= tolerance
  )

  if (targetPoints.length === 0) {
    // Ziel-Peak nicht gefunden, verwende Maximum
    const maxValue = Math.max(...normalizedData.map((p) => p.backgroundSubtracted))
    if (maxValue <= 0) return normalizedData

    return normalizedData.map((p) => ({
      ...p,
      normalizedToH2: p.backgroundSubtracted / maxValue,
    }))
  }

  const targetPeakValue = Math.max(...targetPoints.map((p) => p.backgroundSubtracted))

  if (targetPeakValue <= 0) {
    // Ziel-Peak hat keinen gültigen Wert, verwende Maximum
    const maxValue = Math.max(...normalizedData.map((p) => p.backgroundSubtracted))
    if (maxValue <= 0) return normalizedData

    return normalizedData.map((p) => ({
      ...p,
      normalizedToH2: p.backgroundSubtracted / maxValue,
    }))
  }

  // Normalisiere auf den Ziel-Peak
  return normalizedData.map((p) => ({
    ...p,
    normalizedToH2: p.backgroundSubtracted / targetPeakValue,
  }))
}

export function integratePeak(points: DataPoint[], targetMass: number): number {
  const tolerance = 0.5
  const peakPoints = points.filter((p) => Math.abs(p.mass - targetMass) <= tolerance)
  if (peakPoints.length === 0) return 0

  const sum = peakPoints.reduce((acc, p) => acc + p.current, 0)
  return sum / peakPoints.length
}

function detectPeaks(rawPoints: DataPoint[], normalizedData: NormalizedData[]): Peak[] {
  const peaks: Peak[] = []

  for (const known of KNOWN_MASSES) {
    const integrated = integratePeak(rawPoints, known.mass)
    if (integrated > 0) {
      const normalizedPoint = normalizedData.find((p) => Math.abs(p.mass - known.mass) < 0.1)

      peaks.push({
        mass: known.mass,
        integratedCurrent: integrated,
        normalizedValue: normalizedPoint?.normalizedToH2 || 0,
        gasIdentification: known.gas,
        fragments: known.fragments,
      })
    }
  }

  return peaks.sort((a, b) => b.integratedCurrent - a.integratedCurrent)
}

function identifyDominantGases(peaks: Peak[], totalPressure: number): { gas: string; percentage: number }[] {
  if (totalPressure === 0) return []

  return peaks
    .filter((p) => p.integratedCurrent > 0)
    .map((p) => ({
      gas: p.gasIdentification,
      percentage: (p.integratedCurrent / totalPressure) * 100,
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5)
}

/**
 * Konvertiert Diagnose-Ergebnisse für die UI
 */
function convertDiagnosticsForUI(results: DiagnosticResult[]): DiagnosticResultSummary[] {
  return results.map(result => {
    const meta = DIAGNOSIS_METADATA[result.type]
    return {
      type: result.type,
      name: result.name,
      nameEn: result.nameEn,
      description: result.description,
      descriptionEn: result.descriptionEn,
      confidence: result.confidence,
      severity: result.severity,
      recommendation: result.recommendation,
      recommendationEn: result.recommendationEn,
      affectedMasses: result.affectedMasses,
      evidenceCount: result.evidence.length,
      icon: meta?.icon || '?',
      color: meta?.color || '#6B7280'
    }
  })
}

/**
 * Erstellt Diagnose-Zusammenfassung
 */
function createDiagnosisSummary(
  results: DiagnosticResult[],
  normalizedData: NormalizedData[]
): DiagnosisSummary {
  const summary = getDiagnosisSummary(results)

  // System-Zustand ermitteln
  let systemState: DiagnosisSummary['systemState'] = 'unknown'

  // Peak-Werte für Zustandsermittlung
  const getPeakValue = (mass: number) => {
    const point = normalizedData.find(p => Math.abs(p.mass - mass) < 0.5)
    return point?.normalizedToH2 || 0
  }

  const h2 = getPeakValue(2)
  const h2o = getPeakValue(18)
  // Für zukünftige Erweiterung: Luftleck-Erkennung über Ratios
  const _n2 = getPeakValue(28)
  const _o2 = getPeakValue(32)
  void _n2; void _o2; // Suppress unused warnings

  // Luftleck prüfen
  if (results.some(r => r.type === 'AIR_LEAK' && r.confidence > 0.5)) {
    systemState = 'air_leak'
  }
  // Kontamination prüfen
  else if (results.some(r =>
    (r.type === 'OIL_BACKSTREAMING' || r.type === 'FOMBLIN_CONTAMINATION' || r.type === 'SOLVENT_RESIDUE') &&
    r.confidence > 0.5
  )) {
    systemState = 'contaminated'
  }
  // Baked vs Unbaked
  else if (h2 > h2o * 3) {
    systemState = 'baked'
  }
  else if (h2o > h2) {
    systemState = 'unbaked'
  }

  return {
    criticalCount: summary.criticalCount,
    warningCount: summary.warningCount,
    infoCount: summary.infoCount,
    overallStatus: summary.overallStatus,
    systemState
  }
}
