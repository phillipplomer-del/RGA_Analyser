/**
 * Diagnose-Engine Type Definitions
 *
 * Typen für automatische RGA-Spektren-Diagnose
 */

import type { LODResult } from '../analysis/dynamicLOD'

/**
 * Alle möglichen Diagnose-Typen
 */
export enum DiagnosisType {
  AIR_LEAK = 'AIR_LEAK',
  VIRTUAL_LEAK = 'VIRTUAL_LEAK',
  WATER_OUTGASSING = 'WATER_OUTGASSING',
  HYDROGEN_DOMINANT = 'HYDROGEN_DOMINANT',
  OIL_BACKSTREAMING = 'OIL_BACKSTREAMING',
  FOMBLIN_CONTAMINATION = 'FOMBLIN_CONTAMINATION',
  SOLVENT_RESIDUE = 'SOLVENT_RESIDUE',
  SILICONE_CONTAMINATION = 'SILICONE_CONTAMINATION',
  ESD_ARTIFACT = 'ESD_ARTIFACT',
  CHLORINATED_SOLVENT = 'CHLORINATED_SOLVENT',
  CLEAN_UHV = 'CLEAN_UHV',
  NEEDS_BAKEOUT = 'NEEDS_BAKEOUT',
  N2_CO_MIXTURE = 'N2_CO_MIXTURE',
  CO_DOMINANT = 'CO_DOMINANT',
  // Neue Diagnose-Typen
  AMMONIA_CONTAMINATION = 'AMMONIA_CONTAMINATION',
  METHANE_CONTAMINATION = 'METHANE_CONTAMINATION',
  SULFUR_CONTAMINATION = 'SULFUR_CONTAMINATION',
  AROMATIC_CONTAMINATION = 'AROMATIC_CONTAMINATION',
  // Halbleiter-spezifische Diagnosen
  POLYMER_OUTGASSING = 'POLYMER_OUTGASSING',
  PLASTICIZER_CONTAMINATION = 'PLASTICIZER_CONTAMINATION',
  PROCESS_GAS_RESIDUE = 'PROCESS_GAS_RESIDUE',
  COOLING_WATER_LEAK = 'COOLING_WATER_LEAK',
  // Isotopen-Analyse
  ISOTOPE_VERIFICATION = 'ISOTOPE_VERIFICATION',
  // Helium-Leck-Indikator
  HELIUM_LEAK_INDICATOR = 'HELIUM_LEAK_INDICATOR'
}

/**
 * Schweregrad einer Diagnose
 */
export type DiagnosisSeverity = 'info' | 'warning' | 'critical'

/**
 * Ergebnis einer einzelnen Diagnose
 */
export interface DiagnosticResult {
  type: DiagnosisType
  name: string                    // Kurzer Name (de)
  nameEn: string                  // Kurzer Name (en)
  description: string             // Beschreibung (de)
  descriptionEn: string           // Beschreibung (en)
  confidence: number              // 0-1, Konfidenz der Diagnose
  severity: DiagnosisSeverity
  evidence: EvidenceItem[]        // Liste der Beweise
  recommendation: string          // Empfehlung (de)
  recommendationEn: string        // Empfehlung (en)
  affectedMasses: number[]        // Betroffene Massen
  validation?: ValidationMetadata // Wissenschaftliche Validierungsmetadaten
}

/**
 * Einzelner Beweis für eine Diagnose
 */
export interface EvidenceItem {
  type: 'ratio' | 'peak' | 'pattern' | 'absence' | 'presence'
  description: string
  descriptionEn: string
  value?: number
  expected?: { min?: number; max?: number; exact?: number }
  passed: boolean
  /** Mass number for LOD significance calculation (Feature 1.9.2) */
  mass?: number
}

/**
 * Wissenschaftliche Validierungsmetadaten für einen Detektor
 */
export interface ValidationMetadata {
  /** Ob der Detektor wissenschaftlich validiert wurde */
  validated: boolean
  /** Wissenschaftliche Konfidenz: high (>80%), medium (50-80%), low (<50%) */
  confidence: 'high' | 'medium' | 'low'
  /** Array von Quellen-URLs (NIST, CERN, etc.) */
  sources: string[]
  /** ISO-Datum der letzten Validierung (YYYY-MM-DD) */
  lastValidated: string
  /** Optionale Anmerkungen zu Limitationen oder Besonderheiten */
  notes?: string
  /** Cross-Validation Status (Multi-AI Review) */
  crossValidation?: {
    /** Unanimous approval von allen AIs */
    unanimous: boolean
    /** Gemini AI Validierung */
    gemini: boolean
    /** Grok AI Validierung */
    grok: boolean
    /** Grok Physics Score (0-100) */
    grokScore?: number
  }
  /** Link zu Physics Documentation (DOCUMENTATION/PHYSICS/) */
  physicsDoc?: string
  /** Fix Status für Conditional Approvals */
  fixes?: {
    /** Anzahl der Fixes */
    count: number
    /** Wurden Fixes implementiert? */
    applied: boolean
    /** Schweregrad der Fixes */
    severity: 'critical' | 'high' | 'medium' | 'low'
  }
}

/**
 * Eingabe-Daten für die Diagnose-Engine
 */
export interface DiagnosisInput {
  /** Normalisierte Peak-Intensitäten (Masse -> normalisierter Wert 0-1) */
  peaks: Record<number, number>
  /** Gesamtdruck (wenn verfügbar) */
  totalPressure?: number
  /** Dynamic Limit of Detection (Feature 1.9.2) */
  lodResult?: LODResult
  /** Metadaten */
  metadata?: {
    /** Wurde das System ausgeheizt? */
    bakedOut?: boolean
    /** Messzeitpunkt */
    timestamp?: Date
    /** Kammer-Name */
    chamber?: string
  }
}

/**
 * Konfiguration für Diagnose-Schwellenwerte
 */
export interface DiagnosisThresholds {
  /** Minimale Peak-Höhe für Detektion (relativ zu H₂) */
  minPeakHeight: number
  /** N₂/O₂ Ratio Bereich für Luftleck */
  airLeakN2O2Range: { min: number; max: number }
  /** Minimale Konfidenz für Berichterstattung */
  minConfidence: number
  /** Öl-Pattern Minimale Peaks */
  oilPatternMinPeaks: number
}

/**
 * Standard-Schwellenwerte
 */
export const DEFAULT_THRESHOLDS: DiagnosisThresholds = {
  minPeakHeight: 0.001,
  airLeakN2O2Range: { min: 3.0, max: 4.5 },
  minConfidence: 0.3,
  oilPatternMinPeaks: 3
}

/**
 * Diagnose-Metadaten für UI
 */
export const DIAGNOSIS_METADATA: Record<DiagnosisType, {
  icon: string
  color: string
  priority: number
}> = {
  [DiagnosisType.AIR_LEAK]: {
    icon: '🌬️',
    color: '#EF4444',
    priority: 1
  },
  [DiagnosisType.VIRTUAL_LEAK]: {
    icon: '🔄',
    color: '#F97316',
    priority: 2
  },
  [DiagnosisType.OIL_BACKSTREAMING]: {
    icon: '🛢️',
    color: '#EF4444',
    priority: 3
  },
  [DiagnosisType.FOMBLIN_CONTAMINATION]: {
    icon: '⚗️',
    color: '#DC2626',
    priority: 4
  },
  [DiagnosisType.SOLVENT_RESIDUE]: {
    icon: '🧪',
    color: '#F59E0B',
    priority: 5
  },
  [DiagnosisType.CHLORINATED_SOLVENT]: {
    icon: '☢️',
    color: '#DC2626',
    priority: 6
  },
  [DiagnosisType.SILICONE_CONTAMINATION]: {
    icon: '🔬',
    color: '#F59E0B',
    priority: 7
  },
  [DiagnosisType.ESD_ARTIFACT]: {
    icon: '⚡',
    color: '#8B5CF6',
    priority: 8
  },
  [DiagnosisType.WATER_OUTGASSING]: {
    icon: '💧',
    color: '#3B82F6',
    priority: 9
  },
  [DiagnosisType.NEEDS_BAKEOUT]: {
    icon: '🔥',
    color: '#F59E0B',
    priority: 10
  },
  [DiagnosisType.HYDROGEN_DOMINANT]: {
    icon: '✅',
    color: '#10B981',
    priority: 11
  },
  [DiagnosisType.CLEAN_UHV]: {
    icon: '✨',
    color: '#10B981',
    priority: 12
  },
  [DiagnosisType.N2_CO_MIXTURE]: {
    icon: '⚠️',
    color: '#F59E0B',
    priority: 13
  },
  [DiagnosisType.CO_DOMINANT]: {
    icon: '💨',
    color: '#6366F1',
    priority: 14
  },
  // Neue Diagnose-Typen
  [DiagnosisType.AMMONIA_CONTAMINATION]: {
    icon: '🧪',
    color: '#F59E0B',
    priority: 15
  },
  [DiagnosisType.METHANE_CONTAMINATION]: {
    icon: '🔥',
    color: '#F97316',
    priority: 16
  },
  [DiagnosisType.SULFUR_CONTAMINATION]: {
    icon: '⚠️',
    color: '#EAB308',
    priority: 17
  },
  [DiagnosisType.AROMATIC_CONTAMINATION]: {
    icon: '⬡',
    color: '#EC4899',
    priority: 18
  },
  // Halbleiter-spezifische Diagnosen
  [DiagnosisType.POLYMER_OUTGASSING]: {
    icon: '🧱',
    color: '#6B7280',
    priority: 19
  },
  [DiagnosisType.PLASTICIZER_CONTAMINATION]: {
    icon: '⚠️',
    color: '#F59E0B',
    priority: 20
  },
  [DiagnosisType.PROCESS_GAS_RESIDUE]: {
    icon: '🏭',
    color: '#8B5CF6',
    priority: 21
  },
  [DiagnosisType.COOLING_WATER_LEAK]: {
    icon: '🚰',
    color: '#EF4444',
    priority: 22
  },
  // Isotopen-Analyse
  [DiagnosisType.ISOTOPE_VERIFICATION]: {
    icon: '🔬',
    color: '#6366F1',
    priority: 23
  },
  // Helium-Leck-Indikator
  [DiagnosisType.HELIUM_LEAK_INDICATOR]: {
    icon: '🎈',
    color: '#3B82F6',
    priority: 24
  }
}
