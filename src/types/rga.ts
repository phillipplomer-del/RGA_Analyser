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
