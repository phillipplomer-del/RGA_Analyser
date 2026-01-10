/**
 * Haupt-Kalibrierungsservice
 *
 * Orchestriert den vollständigen Kalibrierungsprozess:
 * 1. Metadaten aus Dateinamen parsen
 * 2. Cracking Pattern Dekonvolution
 * 3. Manometer-Korrektur für dominantes Gas
 * 4. Temperaturkorrektur
 * 5. Empfindlichkeit (Sensitivity) berechnen
 */

import {
  CalibrationLevel,
  CalibrationResult,
  DeviceCalibration,
  SystemState,
  DeconvolutionResult
} from '@/types/calibration'
import { parseFilenameExtended } from './filenameParser'
import { deconvoluteSimple } from './deconvolution'
import {
  T_REFERENCE_K,
  DOMINANT_GAS_BY_STATE,
  MANOMETER_CORRECTION,
  MASS_TO_GAS,
  DEFAULT_FARADAY_SENSITIVITY,
  RELATIVE_SENSITIVITY
} from './constants'
import { GAS_LIBRARY } from '@/lib/knowledge/gasLibrary'

// Gas-Library als Key-Map für schnellen Zugriff
const GAS_BY_KEY = Object.fromEntries(GAS_LIBRARY.map(g => [g.key, g]))

/**
 * Führt die vollständige Kalibrierung durch
 *
 * @param filename - Dateiname (enthält Metadaten)
 * @param rawSpectrum - Rohdaten als Map (mass -> current in A)
 * @param options - Kalibrierungsoptionen
 * @returns Vollständiges Kalibrierungsergebnis
 */
export function calibrate(
  filename: string,
  rawSpectrum: Map<number, number>,
  options: {
    level?: CalibrationLevel
    deviceCalibration?: DeviceCalibration
  } = {}
): CalibrationResult {

  const level = options.level || 'STANDARD'

  // 1. Metadaten aus Dateinamen extrahieren
  const metadata = parseFilenameExtended(filename)

  // 2. Dekonvolution (nur bei STANDARD und höher)
  let deconvolution: DeconvolutionResult
  if (level === 'BASIC') {
    // BASIC: Keine Dekonvolution, nur Rohdaten
    deconvolution = {
      correctedSpectrum: new Map(rawSpectrum),
      gasContributions: new Map(),
      residuals: new Map()
    }
  } else {
    // STANDARD+: Cracking Pattern Dekonvolution
    deconvolution = deconvoluteSimple(rawSpectrum)
  }

  // 3. Totaldruck korrigieren
  let totalPressure = metadata.totalPressure
  let manometerCorrection = 1.0
  let temperatureCorr = 1.0

  if (totalPressure) {
    // Manometer-Korrektur für dominantes Gas (STANDARD+)
    if (level !== 'BASIC' && metadata.systemState !== SystemState.UNKNOWN) {
      manometerCorrection = getManometerCorrection(metadata.systemState)
      totalPressure *= manometerCorrection
    }

    // Temperaturkorrektur (STANDARD+)
    // P_korrigiert = P_gemessen × (T_aktuell / T_ref)
    // Hot gauges measure lower density → higher T requires upward correction
    if (level !== 'BASIC' && metadata.temperature !== undefined) {
      const T_actual_K = metadata.temperature + 273.15
      temperatureCorr = T_actual_K / T_REFERENCE_K  // Fixed: was inverted (Gemini-3-Pro Bug Report 2026-01-10)
      totalPressure *= temperatureCorr
    }
  }

  // 4. Empfindlichkeit berechnen
  let sensitivity: number
  let confidence: 'high' | 'medium' | 'low'
  let method: 'auto' | 'manual' | 'default'

  if (options.deviceCalibration && (level === 'ADVANCED' || level === 'PRECISION')) {
    // ADVANCED/PRECISION mit Gerätekalibrierung
    sensitivity = options.deviceCalibration.baseSensitivity
    confidence = 'high'
    method = 'manual'
  } else if (totalPressure && totalPressure > 0) {
    // Auto-Kalibrierung aus korrigiertem Totaldruck
    sensitivity = calculateSensitivityFromTotal(
      deconvolution.correctedSpectrum,
      totalPressure
    )
    confidence = level === 'BASIC' ? 'low' : 'medium'
    method = 'auto'
  } else {
    // Fallback: Default-Empfindlichkeit basierend auf SEM-Spannung
    sensitivity = getDefaultSensitivity(metadata.semVoltage)
    confidence = 'low'
    method = 'default'
  }

  return {
    sensitivity,
    confidence,
    method,
    level,
    corrections: {
      manometerCorrection,
      temperatureCorrection: temperatureCorr
    },
    deconvolution,
    metadata
  }
}

/**
 * Berechnet den Manometer-Korrekturfaktor für den Systemzustand
 *
 * Das Ionisationsmanometer (Bayard-Alpert) ist auf N₂ kalibriert.
 * Bei anderen dominanten Gasen muss korrigiert werden.
 */
function getManometerCorrection(state: SystemState): number {
  const gas = DOMINANT_GAS_BY_STATE[state]
  return MANOMETER_CORRECTION[gas] || 1.0
}

/**
 * Berechnet die Empfindlichkeit aus dem korrigierten Totaldruck
 *
 * Formel: S = ΣI / (P_total × RSF_weighted)
 *
 * Dabei wird jeder Ionenstrom durch die relative Sensitivität
 * des zugeordneten Gases gewichtet.
 */
function calculateSensitivityFromTotal(
  spectrum: Map<number, number>,
  totalPressure: number
): number {
  let weightedSum = 0

  for (const [mass, current] of spectrum) {
    if (current <= 0) continue

    // Gas für diese Masse bestimmen
    const gasKey = MASS_TO_GAS[mass] || 'N2'

    // RSF aus GAS_LIBRARY oder Fallback
    const gas = GAS_BY_KEY[gasKey]
    const rsf = gas?.relativeSensitivity || RELATIVE_SENSITIVITY[gasKey] || 1.0

    // Gewichtete Summe: I / RSF
    weightedSum += current / rsf
  }

  if (weightedSum === 0) {
    return DEFAULT_FARADAY_SENSITIVITY
  }

  return weightedSum / totalPressure
}

/**
 * Schätzt die Default-Empfindlichkeit basierend auf Detektor-Typ
 *
 * SEM-Spannung > 800V → wahrscheinlich SEM-Detektor
 * Gain ≈ 10^(V/350)
 */
function getDefaultSensitivity(semVoltage?: number): number {
  if (semVoltage && semVoltage > 800) {
    // SEM-Detektor: Gain aus Spannung schätzen
    const estimatedGain = Math.pow(10, semVoltage / 350)
    return DEFAULT_FARADAY_SENSITIVITY * estimatedGain
  }
  // Faraday-Detektor
  return DEFAULT_FARADAY_SENSITIVITY
}

/**
 * Erstellt eine Gerätekalibrierung aus Referenzmessungen
 *
 * Mindestens eine N₂-Messung erforderlich.
 * Weitere Gase (Ar, He) verbessern die Genauigkeit.
 */
export function createDeviceCalibration(
  measurements: DeviceCalibration['measurements'],
  detectorType: 'faraday' | 'sem',
  semVoltage?: number
): DeviceCalibration {

  // N₂-Messung finden (oder erste verfügbare)
  const n2Measurement = measurements.find(m => m.gas === 'N2') || measurements[0]

  if (!n2Measurement) {
    throw new Error('Mindestens eine Referenzmessung erforderlich')
  }

  // Basis-Empfindlichkeit aus N₂
  const baseSensitivity = n2Measurement.measuredCurrent / n2Measurement.referencePressure

  // Gerätespezifische RSF aus weiteren Messungen
  const customRSF: Record<string, number> = {}

  for (const m of measurements) {
    if (m.gas === 'N2') continue

    const measuredSensitivity = m.measuredCurrent / m.referencePressure
    customRSF[m.gas] = measuredSensitivity / baseSensitivity
  }

  return {
    deviceId: `RGA_${Date.now()}`,
    timestamp: new Date(),
    baseSensitivity,
    detectorType,
    customRSF: Object.keys(customRSF).length > 0 ? customRSF : undefined,
    semVoltageAtCalibration: semVoltage,
    measurements
  }
}
