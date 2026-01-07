/**
 * Rate-of-Rise (Druckanstiegstest) Type Definitions
 * For analyzing Pfeiffer TPG362 pressure logger data
 */

// ============================================================================
// Sensor Types
// ============================================================================

export type SensorType =
  | 'PKR'     // Pirani/Kaltkathode Kombi (5×10⁻⁹ ... 1000 mbar)
  | 'IKR'     // Kaltkathode (Inverted Magnetron)
  | 'CMR'     // Kapazitiv (Baratron)
  | 'TPR'     // Pirani
  | 'PPT'     // Piezo/Pirani
  | 'APR'     // Active Pirani
  | 'MPT'     // Micro Pirani
  | 'RPT'     // Reference Pirani
  | 'UNKNOWN'

// ============================================================================
// Device Metadata
// ============================================================================

export interface TPGMetadata {
  manufacturer: string           // "Pfeiffer-Vacuum"
  device: string                 // "TPG362"
  articleNumber: string          // "PT G28 290"
  serialNumber: string           // "44992684"
  firmwareVersion: string        // "010500"
  filename: string               // Original filename
  recordingStart: Date           // Recording start time
  measurementInterval: number    // Seconds (e.g., 10)
  sensor1Type: SensorType
  sensor2Type: SensorType | null
}

// ============================================================================
// Data Points
// ============================================================================

export interface PressureDataPoint {
  index: number
  timestamp: Date
  relativeTimeS: number          // Seconds since start
  pressure1: number              // mbar (Sensor 1)
  pressure2: number | null       // mbar (Sensor 2, optional)
}

// ============================================================================
// Rate-of-Rise Dataset
// ============================================================================

export interface RateOfRiseData {
  metadata: TPGMetadata
  dataPoints: PressureDataPoint[]

  // Derived values
  duration: number               // Total duration in seconds
  minPressure: number            // mbar
  maxPressure: number            // mbar
  pointCount: number
}

// ============================================================================
// Phase Detection
// ============================================================================

export interface PhaseInfo {
  startIndex: number
  endIndex: number
  startPressure: number
  endPressure: number
  duration: number               // Seconds
}

export interface BaselinePhase extends PhaseInfo {
  meanPressure: number           // p₀
  stdDev: number
}

export interface RisePhase extends PhaseInfo {
  // Additional rise-specific properties if needed
}

// ============================================================================
// Linear Fit Result
// ============================================================================

export interface LinearFitResult {
  slope: number                  // dp/dt in mbar/s
  intercept: number              // p₀ in mbar
  r2: number                     // R² (0-1)
  residualStdDev: number
  dataPoints: number
}

// ============================================================================
// Leak Rate Calculation
// ============================================================================

export interface LeakRateResult {
  volume: number                 // Liters
  Q: number                      // mbar·L/s
  QFormatted: string             // e.g., "3.4×10⁻⁸ mbar·L/s"
  Q_Pa: number                   // Pa·m³/s (SI)
  Q_PaFormatted: string
  equivalentHeLeak: number       // mbar·L/s (He-equivalent)
}

// ============================================================================
// Classification
// ============================================================================

export type RoRClassificationType =
  | 'real_leak'      // Constant linear rise → actual leak
  | 'virtual_leak'   // Logarithmic rise → trapped volume
  | 'outgassing'     // Exponential saturation → material desorption
  | 'mixed'          // Combination of leak + outgassing
  | 'unknown'        // Unclear pattern

export interface RoRClassification {
  type: RoRClassificationType
  confidence: number             // 0-1
  description: string
  descriptionEn: string
  evidence: string[]
  evidenceEn: string[]
  recommendations: string[]
  recommendationsEn: string[]
}

// ============================================================================
// Limit Check
// ============================================================================

export interface LeakRateLimit {
  name: string
  nameEn: string
  value: number                  // mbar·L/s
  application: string
  applicationEn: string
  source: string
}

export interface LimitCheckResult {
  limit: number                  // mbar·L/s
  limitSource: string
  passed: boolean
  margin: number                 // Factor (Q/limit)
}

// ============================================================================
// Complete Analysis Result
// ============================================================================

export interface RateOfRiseAnalysis {
  // Detected phases
  baselinePhase: BaselinePhase
  risePhase: RisePhase
  transitionIndex: number

  // Main results
  dpdt: number                   // mbar/s
  dpdtFormatted: string

  // Linear fit
  linearFit: LinearFitResult

  // Leak rate (if volume provided)
  leakRate?: LeakRateResult

  // Classification
  classification: RoRClassification

  // Limit check (if limit provided)
  limitCheck?: LimitCheckResult
}

// ============================================================================
// Standard Limits
// ============================================================================

export const STANDARD_LEAK_RATE_LIMITS: LeakRateLimit[] = [
  {
    name: 'GSI UHV (streng)',
    nameEn: 'GSI UHV (strict)',
    value: 1e-10,
    application: 'Beschleuniger-Strahlrohre',
    applicationEn: 'Accelerator beam pipes',
    source: 'GSI Technical Guideline 7.23e',
  },
  {
    name: 'GSI UHV (standard)',
    nameEn: 'GSI UHV (standard)',
    value: 1e-9,
    application: 'Standard UHV-Komponenten',
    applicationEn: 'Standard UHV components',
    source: 'GSI Technical Guideline 7.19e',
  },
  {
    name: 'CERN LHC',
    nameEn: 'CERN LHC',
    value: 1e-10,
    application: 'LHC Vakuumkammern',
    applicationEn: 'LHC vacuum chambers',
    source: 'CERN Vacuum Acceptance Criteria',
  },
  {
    name: 'HV Standard',
    nameEn: 'HV Standard',
    value: 1e-8,
    application: 'Hochvakuum-Systeme',
    applicationEn: 'High vacuum systems',
    source: 'DIN 28400',
  },
  {
    name: 'Industriell',
    nameEn: 'Industrial',
    value: 1e-6,
    application: 'Industrielle Vakuumanlagen',
    applicationEn: 'Industrial vacuum systems',
    source: 'General',
  },
]

// ============================================================================
// Firebase/Cloud Storage Types
// ============================================================================

export interface RoRTestSummary {
  id: string
  filename: string
  uploadedAt: Date
  measurementDate: Date
  device: string
  serialNumber: string
  duration: number
  dpdt: number
  leakRate?: number
  classification: RoRClassificationType
  passed?: boolean
  tags: string[]
  notes?: string
}

export interface SavedRoRTest {
  data: RateOfRiseData
  analysis: RateOfRiseAnalysis
  tags: string[]
  notes?: string
  savedAt: Date
}

// ============================================================================
// Parser Result
// ============================================================================

export interface ParseResult {
  success: boolean
  data?: RateOfRiseData
  error?: string
}
