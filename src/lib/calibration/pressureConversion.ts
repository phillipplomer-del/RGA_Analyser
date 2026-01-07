/**
 * Druck-Umrechnungs-Service
 *
 * Konvertiert RGA-Ionenströme zu Partialdrücken
 * unter Verwendung der Kalibrierungsergebnisse.
 */

import {
  CalibrationResult,
  PressureDataPoint,
  GasPartialPressure,
  PressureUnit,
  ConversionOptions
} from '@/types/calibration'
import type { DataPoint } from '@/types/rga'
import { MASS_TO_GAS, RELATIVE_SENSITIVITY } from './constants'
import { GAS_LIBRARY } from '@/lib/knowledge/gasLibrary'

// Gas-Library als Key-Map für schnellen Zugriff
const GAS_BY_KEY = Object.fromEntries(GAS_LIBRARY.map(g => [g.key, g]))

/**
 * Service für Druck-Umrechnungen
 */
export class PressureConversionService {
  private calibration: CalibrationResult | null = null

  /**
   * Setzt die aktive Kalibrierung
   */
  setCalibration(cal: CalibrationResult): void {
    this.calibration = cal
  }

  /**
   * Prüft ob eine Kalibrierung gesetzt ist
   */
  hasCalibration(): boolean {
    return this.calibration !== null
  }

  /**
   * Gibt die aktuelle Kalibrierung zurück
   */
  getCalibration(): CalibrationResult | null {
    return this.calibration
  }

  /**
   * Konvertiert ein komplettes Spektrum zu Druckwerten
   *
   * @param rawSpectrum - Rohdaten als DataPoint[]
   * @param options - Konvertierungsoptionen
   * @returns Array von PressureDataPoint
   */
  convertSpectrum(
    rawSpectrum: DataPoint[],
    options: ConversionOptions = {
      applyRSF: true,
      applyDeconvolution: true,
      unit: 'mbar'
    }
  ): PressureDataPoint[] {

    if (!this.calibration) {
      throw new Error('Keine Kalibrierung gesetzt')
    }

    const S = this.calibration.sensitivity
    const deconv = this.calibration.deconvolution

    return rawSpectrum.map(point => {
      // Gas für diese Masse bestimmen
      const gasKey = point.mass ? (MASS_TO_GAS[Math.round(point.mass)] || 'N2') : 'N2'

      // RSF anwenden wenn gewünscht
      const gas = GAS_BY_KEY[gasKey]
      const rsf = options.applyRSF
        ? (gas?.relativeSensitivity || RELATIVE_SENSITIVITY[gasKey] || 1.0)
        : 1.0

      // Korrigierten Strom verwenden wenn Dekonvolution aktiv
      const current = options.applyDeconvolution
        ? (deconv.correctedSpectrum.get(Math.round(point.mass)) ?? point.current)
        : point.current

      // Druck berechnen: P = I / (S × RSF)
      let pressure = current / (S * rsf)

      // Einheit konvertieren
      pressure = this.convertUnit(pressure, 'mbar', options.unit)

      // Prüfen ob dieser Peak ein Fragment ist (>50% abgezogen)
      const isFragment = options.applyDeconvolution &&
        current < point.current * 0.5

      return {
        mass: point.mass,
        current: point.current,
        pressure,
        gasAssignment: gasKey,
        isFragment
      }
    })
  }

  /**
   * Berechnet die Partialdrücke der identifizierten Gase
   *
   * Basiert auf der Dekonvolution - nur Gase mit positivem
   * Beitrag werden zurückgegeben.
   *
   * @param unit - Gewünschte Druckeinheit
   * @returns Array von GasPartialPressure, sortiert nach Druck (absteigend)
   */
  getGasPartialPressures(unit: PressureUnit = 'mbar'): GasPartialPressure[] {

    if (!this.calibration) {
      return []
    }

    const S = this.calibration.sensitivity
    const result: GasPartialPressure[] = []
    let total = 0

    // Partialdrücke aus Dekonvolutions-Ergebnis
    for (const [gasKey, intensity] of this.calibration.deconvolution.gasContributions) {
      // RSF für dieses Gas
      const gas = GAS_BY_KEY[gasKey]
      const rsf = gas?.relativeSensitivity || RELATIVE_SENSITIVITY[gasKey] || 1.0
      const mainMass = gas?.mainMass || 0

      // Druck berechnen
      const pressureMbar = intensity / (S * rsf)
      total += pressureMbar

      result.push({
        gas: gasKey,
        pressure: this.convertUnit(pressureMbar, 'mbar', unit),
        percentage: 0, // wird unten berechnet
        mainMass
      })
    }

    // Prozentsätze berechnen
    const totalConverted = this.convertUnit(total, 'mbar', unit)
    for (const item of result) {
      item.percentage = totalConverted > 0
        ? (item.pressure / totalConverted) * 100
        : 0
    }

    // Nach Druck sortieren (höchster zuerst)
    return result.sort((a, b) => b.pressure - a.pressure)
  }

  /**
   * Berechnet den Totaldruck aus den Partialdrücken
   *
   * @param unit - Gewünschte Druckeinheit
   * @returns Totaldruck
   */
  getTotalPressure(unit: PressureUnit = 'mbar'): number {
    const partials = this.getGasPartialPressures(unit)
    return partials.reduce((sum, p) => sum + p.pressure, 0)
  }

  /**
   * Konvertiert einen Druckwert zwischen Einheiten
   *
   * 1 mbar = 100 Pa = 0.750062 Torr
   */
  convertUnit(
    pressure: number,
    from: PressureUnit,
    to: PressureUnit
  ): number {
    if (from === to) return pressure

    // Erst zu mbar konvertieren
    let mbar = pressure
    if (from === 'pa') mbar = pressure / 100
    if (from === 'torr') mbar = pressure * 1.33322

    // Dann zur Zieleinheit
    if (to === 'mbar') return mbar
    if (to === 'pa') return mbar * 100
    if (to === 'torr') return mbar / 1.33322

    return mbar
  }
}

/**
 * Formatiert einen Druckwert für die Anzeige
 *
 * @param pressure - Druckwert
 * @param unit - Einheit
 * @param precision - Anzahl signifikanter Stellen (default: 2)
 * @returns Formatierter String mit Einheit
 */
export function formatPressureValue(
  pressure: number,
  unit: PressureUnit = 'mbar',
  precision: number = 2
): string {
  const unitLabels: Record<PressureUnit, string> = {
    mbar: 'mbar',
    pa: 'Pa',
    torr: 'Torr'
  }

  // Wissenschaftliche Notation für sehr kleine/große Werte
  if (Math.abs(pressure) < 1e-3 || Math.abs(pressure) > 1e3) {
    return `${pressure.toExponential(precision)} ${unitLabels[unit]}`
  }

  return `${pressure.toPrecision(precision + 1)} ${unitLabels[unit]}`
}
