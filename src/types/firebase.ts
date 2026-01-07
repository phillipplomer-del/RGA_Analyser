import type { Timestamp } from 'firebase/firestore'
import type { DiagnosisSummary, LimitRange, DiagnosticResultSummary, NormalizedData, Peak, LimitCheck, QualityCheck } from './rga'

// User document in Firestore
export interface FirestoreUser {
  firstName: string
  lastName: string
  pinHash: string // SHA-256 hash of pin
  createdAt: Timestamp
  settings: {
    theme: 'light' | 'dark'
    language: 'de' | 'en'
    chartOptions: {
      logScale: boolean
      normalizationMass: number
    }
  }
}

// Spectrum metadata (main document - smaller for list queries)
export interface FirestoreSpectrum {
  filename: string
  uploadedAt: Timestamp
  measurementDate: Timestamp | null
  metadata: {
    sourceFile: string
    taskName: string
    chamberName?: string
    pressure?: string
    firstMass: number
    scanWidth: number
  }
  analysisSnapshot: {
    totalPressure: number
    dominantGases: Array<{ gas: string; percentage: number }>
    peakCount: number
    qualityChecksPassed: boolean
    diagnosisSummary: DiagnosisSummary
  }
  tags: string[]
  notes: string
  isArchived: boolean
}

// Full spectrum data (subcollection document - larger data)
export interface FirestoreSpectrumFullData {
  normalizedData: NormalizedData[]
  peaks: Peak[]
  limitChecks: LimitCheck[]
  qualityChecks: QualityCheck[]
  diagnostics: DiagnosticResultSummary[]
}

// Limit profile in Firestore
export interface FirestoreLimitProfile {
  name: string
  description?: string
  color: string
  isPreset: boolean
  ranges: LimitRange[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

// AI Report in Firestore
export interface FirestoreAIReport {
  spectrumId: string
  spectrumIds?: string[] // For comparison reports
  interpretation: string
  prompt: string
  model: string
  isComparison: boolean
  createdAt: Timestamp
}

// Local user type (what we store in app state)
export interface AppUser {
  id: string
  firstName: string
  lastName: string
}

// Cloud spectrum metadata for archive list
export interface CloudSpectrumMeta {
  id: string
  filename: string
  uploadedAt: Date
  measurementDate: Date | null
  tags: string[]
  notes: string
  isArchived: boolean
  analysisSnapshot: {
    totalPressure: number
    dominantGases: Array<{ gas: string; percentage: number }>
    peakCount: number
    qualityChecksPassed: boolean
    overallStatus: 'clean' | 'warning' | 'critical'
  }
}
