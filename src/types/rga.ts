export interface RGAMetadata {
  sourceFile: string
  exportTime: Date | null
  startTime: Date | null
  endTime: Date | null
  taskName: string
  firstMass: number
  scanWidth: number
  chamberName?: string
  pressure?: string
}

export interface DataPoint {
  mass: number
  current: number
}

export interface RawData {
  metadata: RGAMetadata
  points: DataPoint[]
}

export interface NormalizedData {
  mass: number
  current: number
  backgroundSubtracted: number
  normalizedToH2: number
}

export interface Peak {
  mass: number
  integratedCurrent: number
  normalizedValue: number
  gasIdentification: string
  fragments?: string[]
}

export interface LimitCheck {
  mass: number
  measuredValue: number
  gsiLimit: number
  cernLimit: number
  gsiPassed: boolean
  cernPassed: boolean
}

export interface QualityCheck {
  name: string
  description: string
  formula: string
  passed: boolean
  measuredValue: number
  threshold: number
}

export interface AnalysisResult {
  metadata: RGAMetadata
  normalizedData: NormalizedData[]
  peaks: Peak[]
  limitChecks: LimitCheck[]
  qualityChecks: QualityCheck[]
  totalPressure: number
  dominantGases: { gas: string; percentage: number }[]
}

export type SpecificationType = 'GSI' | 'CERN'

// ============================================
// Multi-File Types
// ============================================

export interface MeasurementFile {
  id: string
  order: number  // 0, 1, 2 - chronological order by measurement date
  filename: string
  rawData: RawData
  analysisResult: AnalysisResult
  uploadedAt: Date
}

export interface PeakComparison {
  mass: number
  gasIdentification: string
  beforeValue: number
  afterValue: number
  percentageChange: number  // Negative = improvement
  status: 'improved' | 'worsened' | 'unchanged' | 'new' | 'removed'
}

export interface LimitImprovement {
  mass: number
  beforeGSIPassed: boolean
  afterGSIPassed: boolean
  beforeCERNPassed: boolean
  afterCERNPassed: boolean
  status: 'newly_passing' | 'newly_failing' | 'unchanged'
}

export interface ComparisonSummary {
  totalPeaksCompared: number
  improvedPeaks: number
  worsenedPeaks: number
  unchangedPeaks: number
  newViolations: number
  resolvedViolations: number
  overallGrade: 'excellent' | 'good' | 'mixed' | 'poor'
}

export interface ComparisonResult {
  beforeFile: MeasurementFile
  afterFile: MeasurementFile
  peakComparisons: PeakComparison[]
  limitImprovements: LimitImprovement[]
  overallImprovement: number  // Percentage
  summary: ComparisonSummary
}

// ============================================
// Custom Limit Profiles
// ============================================

export interface LimitRange {
  massMin: number
  massMax: number
  limit: number
  notes?: string
}

export interface LimitProfile {
  id: string
  name: string
  description?: string
  color: string              // Hex color for chart
  isPreset: boolean          // true for GSI/CERN
  ranges: LimitRange[]
  createdAt: string
  updatedAt: string
}

export interface ProfileLimitCheck {
  mass: number
  measuredValue: number
  limit: number
  passed: boolean
  profileId: string
}

// KI Extraction Result
export interface LimitExtractionResult {
  success: boolean
  profile?: {
    name: string
    description?: string
    color: string
    ranges: LimitRange[]
  }
  confidence?: number
  warnings?: string[]
  interpretation?: string
  error?: string
  suggestions?: string[]
}
