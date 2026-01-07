/**
 * Druckkalibrierungs-Modul
 *
 * Exportiert alle Komponenten für die Kalibrierung von
 * RGA-Ionenströmen zu Partialdrücken.
 */

// Konstanten
export {
  T_REFERENCE_K,
  DOMINANT_GAS_BY_STATE,
  MANOMETER_CORRECTION,
  MASS_TO_GAS,
  CRACKING_PATTERNS,
  SYSTEM_STATE_PATTERNS,
  DEFAULT_FARADAY_SENSITIVITY,
  RELATIVE_SENSITIVITY
} from './constants'

// Dateinamen-Parser
export {
  parseFilenameExtended,
  formatSystemState,
  formatPressure
} from './filenameParser'

// Dekonvolution
export {
  deconvoluteSimple,
  calculateDeconvolutionQuality
} from './deconvolution'

// Kalibrierungs-Service
export {
  calibrate,
  createDeviceCalibration
} from './calibrationService'

// Druck-Umrechnung
export {
  PressureConversionService,
  formatPressureValue
} from './pressureConversion'

// SEM-Tracking
export {
  SEMTracker,
  getSEMTracker
} from './semTracker'

// Types re-export für Convenience
export type {
  CalibrationLevel,
  SystemState,
  MeasurementMetadata,
  DeconvolutionResult,
  CalibrationResult,
  PressureDataPoint,
  GasPartialPressure,
  DeviceCalibration,
  DeviceCalibrationMeasurement,
  SEMHistoryEntry,
  SEMAgingWarning,
  PressureUnit,
  ConversionOptions
} from '@/types/calibration'
