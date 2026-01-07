/**
 * Erweiteter Dateinamen-Parser für Kalibrierungsparameter
 * Extrahiert: Totaldruck, SEM-Spannung, Temperatur, Dauer, Systemzustand
 */

import { MeasurementMetadata, SystemState } from '@/types/calibration'
import { SYSTEM_STATE_PATTERNS } from './constants'

/**
 * Erkennt den Systemzustand (baked/unbaked) aus dem Dateinamen
 */
function detectSystemState(filename: string): SystemState {
  for (const { pattern, state } of SYSTEM_STATE_PATTERNS) {
    if (pattern.test(filename)) {
      return state
    }
  }
  return SystemState.UNKNOWN
}

/**
 * Extrahiert alle Kalibrierungsparameter aus dem Dateinamen
 *
 * Beispiele:
 * - pa055357 oipt large before bakeout_1h_1250v_23c_2,7e-6mbar.asc
 * - cavity xyz after bakeout_24h_1400v_150c_3,2e-9mbar.asc
 * - Kammer_A_vor_Ausheizen_2h_1100v_25c_1,5e-7mbar.asc
 */
export function parseFilenameExtended(filename: string): MeasurementMetadata {
  const result: MeasurementMetadata = {
    filename,
    systemState: SystemState.UNKNOWN
  }

  // Totaldruck: 2,7e-6mbar | 2.7e-6mbar | 2,7E-6mbar | 2.7 e -6 mbar
  // Erlaubt optionale Leerzeichen zwischen den Komponenten
  const pressureMatch = filename.match(
    /(\d+[,.]?\d*)\s*[eE]\s*(-?\d+)\s*mbar/i
  )
  if (pressureMatch) {
    const mantissa = parseFloat(pressureMatch[1].replace(',', '.'))
    const exponent = parseInt(pressureMatch[2])
    result.totalPressure = mantissa * Math.pow(10, exponent)
  }

  // SEM-Spannung: 1250v, 1400V, 1250 V
  // 3-4 stellige Zahl gefolgt von V/v
  const voltageMatch = filename.match(/(\d{3,4})\s*[vV](?![a-zA-Z])/)
  if (voltageMatch) {
    result.semVoltage = parseInt(voltageMatch[1])
  }

  // Temperatur: 23c, 150C, 23 c
  // 2-3 stellige Zahl gefolgt von C/c (nicht gefolgt von anderen Buchstaben)
  // Vermeidet false positives wie ".asc"
  const tempMatch = filename.match(/(\d{2,3})\s*[cC](?![a-zA-Z])/)
  if (tempMatch) {
    result.temperature = parseInt(tempMatch[1])
  }

  // Dauer: 1h, 24h, 30min, 1 h
  const durationMatch = filename.match(/(\d+)\s*(h|min)/i)
  if (durationMatch) {
    result.duration = durationMatch[0].replace(/\s+/g, '')
  }

  // Systemzustand aus Keywords
  result.systemState = detectSystemState(filename)

  // Beschreibung: alles vor den Parametern
  // Versucht den beschreibenden Teil zu extrahieren
  const descMatch = filename.match(/^(.+?)_\d+[hm]/i)
  if (descMatch) {
    result.description = descMatch[1].trim()
  } else {
    // Alternative: alles vor dem ersten Unterstrich mit Zahlen
    const altDescMatch = filename.match(/^([^_]+(?:_[^_\d]+)*)/)
    if (altDescMatch) {
      result.description = altDescMatch[1].trim()
    }
  }

  return result
}

/**
 * Formatiert den Systemzustand für die Anzeige
 */
export function formatSystemState(state: SystemState, language: 'de' | 'en'): string {
  const labels: Record<SystemState, { de: string; en: string }> = {
    [SystemState.UNBAKED]: { de: 'Nicht ausgeheizt', en: 'Unbaked' },
    [SystemState.BAKED]: { de: 'Ausgeheizt', en: 'Baked' },
    [SystemState.UNKNOWN]: { de: 'Unbekannt', en: 'Unknown' }
  }
  return labels[state][language]
}

/**
 * Formatiert den Druck für die Anzeige
 */
export function formatPressure(pressure: number, unit: 'mbar' | 'pa' | 'torr' = 'mbar'): string {
  let value = pressure
  let unitLabel = 'mbar'

  if (unit === 'pa') {
    value = pressure * 100
    unitLabel = 'Pa'
  } else if (unit === 'torr') {
    value = pressure / 1.33322
    unitLabel = 'Torr'
  }

  // Wissenschaftliche Notation für kleine Werte
  if (value < 1e-3 || value > 1e3) {
    return `${value.toExponential(2)} ${unitLabel}`
  }
  return `${value.toPrecision(3)} ${unitLabel}`
}
