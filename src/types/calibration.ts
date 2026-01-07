/**
 * Typdefinitionen für die Druckkalibrierung
 * Basierend auf PRESSURE_CALIBRATION_SPEC_V2.md
 */

// Genauigkeitsstufen
export type CalibrationLevel = 'BASIC' | 'STANDARD' | 'ADVANCED' | 'PRECISION'

// Systemzustand (baked/unbaked)
export enum SystemState {
  UNBAKED = 'unbaked',   // Wasser-dominiert
  BAKED = 'baked',       // Wasserstoff-dominiert
  UNKNOWN = 'unknown'
}

// Metadaten aus Dateinamen extrahiert
export interface MeasurementMetadata {
  filename: string
  totalPressure?: number           // [mbar]
  semVoltage?: number              // [V]
  temperature?: number             // [°C]
  duration?: string                // "1h", "30min"
  systemState: SystemState
  description?: string
}

// Dekonvolutions-Ergebnis
export interface DeconvolutionResult {
  correctedSpectrum: Map<number, number>      // mass -> korrigierter Strom
  gasContributions: Map<string, number>       // Gas -> Intensität am Hauptpeak
  residuals: Map<number, number>              // Nicht erklärte Signale
}

// Vollständiges Kalibrierungs-Ergebnis
export interface CalibrationResult {
  sensitivity: number                         // [A/mbar]
  confidence: 'high' | 'medium' | 'low'
  method: 'auto' | 'manual' | 'default'
  level: CalibrationLevel
  corrections: {
    manometerCorrection: number               // Korrekturfaktor für dominantes Gas
    temperatureCorrection: number             // Korrekturfaktor für Temperatur
  }
  deconvolution: DeconvolutionResult
  metadata: MeasurementMetadata
}

// Druck-Datenpunkt (nach Umrechnung)
export interface PressureDataPoint {
  mass: number
  current: number              // [A] Rohdaten
  pressure: number             // [mbar] nach Umrechnung
  gasAssignment?: string       // Zugeordnetes Gas
  isFragment?: boolean         // True wenn Fragment eines anderen Gases
}

// Partialdruck pro Gas
export interface GasPartialPressure {
  gas: string                  // Gas-Key (H2, N2, etc.)
  pressure: number             // [mbar]
  percentage: number           // Anteil am Totaldruck
  mainMass: number             // Hauptmasse des Gases
}

// Geräte-Kalibrierung (für ADVANCED/PRECISION)
export interface DeviceCalibration {
  deviceId: string                            // Geräte-Identifier
  timestamp: Date
  baseSensitivity: number                     // [A/mbar]
  detectorType: 'faraday' | 'sem'
  customRSF?: Record<string, number>          // Gerätespezifische RSF
  semVoltageAtCalibration?: number            // [V]
  measurements: DeviceCalibrationMeasurement[]
}

export interface DeviceCalibrationMeasurement {
  gas: string                                 // Gas-Key
  referencePressure: number                   // [mbar] vom externen Manometer
  measuredCurrent: number                     // [A] vom RGA
  mass: number                                // Hauptmasse des Gases
}

// SEM-Verlaufs-Eintrag
export interface SEMHistoryEntry {
  timestamp: Date
  filename: string
  voltage: number                             // [V]
}

// SEM-Alterungs-Warnung
export interface SEMAgingWarning {
  warning: string
  severity: 'info' | 'warning' | 'critical'
}

// Druck-Einheiten
export type PressureUnit = 'mbar' | 'pa' | 'torr'

// Konvertierungs-Optionen
export interface ConversionOptions {
  applyRSF: boolean
  applyDeconvolution: boolean
  unit: PressureUnit
}
