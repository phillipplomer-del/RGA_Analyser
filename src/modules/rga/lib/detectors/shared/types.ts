/**
 * Re-export types from diagnosis module
 * This allows detectors to import from shared location
 */

export {
  DiagnosisType,
  type DiagnosticResult,
  type DiagnosisInput,
  type EvidenceItem,
  DEFAULT_THRESHOLDS
} from '@/lib/diagnosis/types'
