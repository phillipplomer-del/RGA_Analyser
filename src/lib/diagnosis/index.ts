/**
 * RGA Diagnosis Engine
 *
 * Automatische Diagnose von RGA-Spektren basierend auf
 * konsolidiertem Expertenwissen aus CERN, Pfeiffer, MKS, NIST
 */

// Re-export types
export {
  DiagnosisType,
  type DiagnosticResult,
  type DiagnosisInput,
  type DiagnosisSeverity,
  type EvidenceItem,
  type DiagnosisThresholds,
  DEFAULT_THRESHOLDS,
  DIAGNOSIS_METADATA
} from './types'

// Re-export confidence score system
export {
  calculateDataQualityScore,
  formatScorePercent,
  getStatusColor,
  getGradeColor,
  type DataQualityScore,
  type QualityFactor,
  type QualityAssessmentInput,
  type MeasurementContext
} from './confidenceScore'

// Import detectors from new modular structure
import {
  // Leaks (4)
  detectAirLeak,
  detectHeliumLeak,
  detectVirtualLeak,
  detectCoolingWaterLeak,
  // Contamination (8)
  detectOilBackstreaming,
  detectFomblinContamination,
  detectPolymerOutgassing,
  detectPlasticizerContamination,
  detectSiliconeContamination,
  detectSolventResidue,
  detectChlorinatedSolvent,
  detectAromatic,
  // Outgassing (2)
  detectWaterOutgassing,
  detectHydrogenDominant,
  // Artifacts (1)
  detectESDartifacts,
  // Gases (4)
  detectAmmonia,
  detectMethane,
  detectSulfur,
  detectProcessGasResidue,
  // Isotopes (1)
  verifyIsotopeRatios,
  // Quality (1)
  detectCleanUHV
} from '@/modules/rga/lib/detectors'

// TODO: Migrate distinguishN2fromCO to modular structure
// This is a special analysis function, not a typical detector
import { distinguishN2fromCO } from './detectors'

import type { DiagnosticResult, DiagnosisInput } from './types'
import { DIAGNOSIS_METADATA } from './types'

// Export individual detectors for direct use
export {
  detectAirLeak,
  detectOilBackstreaming,
  detectFomblinContamination,
  detectSolventResidue,
  detectChlorinatedSolvent,
  detectWaterOutgassing,
  detectHydrogenDominant,
  detectESDartifacts,
  detectHeliumLeak,
  detectSiliconeContamination,
  detectCleanUHV,
  detectVirtualLeak,
  distinguishN2fromCO,
  // Neue Detektoren
  detectAmmonia,
  detectMethane,
  detectSulfur,
  detectAromatic,
  // Halbleiter-spezifische Detektoren
  detectPolymerOutgassing,
  detectPlasticizerContamination,
  detectProcessGasResidue,
  detectCoolingWaterLeak,
  // Isotopen-Analyse
  verifyIsotopeRatios
}

/**
 * Alle verfügbaren Diagnose-Funktionen
 */
const ALL_DETECTORS = [
  detectAirLeak,
  detectVirtualLeak,
  detectOilBackstreaming,
  detectFomblinContamination,
  detectSolventResidue,
  detectChlorinatedSolvent,
  detectWaterOutgassing,
  detectHydrogenDominant,
  detectESDartifacts,
  detectHeliumLeak,
  detectSiliconeContamination,
  distinguishN2fromCO,
  detectCleanUHV,
  // Neue Detektoren
  detectAmmonia,
  detectMethane,
  detectSulfur,
  detectAromatic,
  // Halbleiter-spezifische Detektoren
  detectPolymerOutgassing,
  detectPlasticizerContamination,
  detectProcessGasResidue,
  detectCoolingWaterLeak,
  // Isotopen-Analyse
  verifyIsotopeRatios
]

/**
 * Führt alle Diagnosen durch und gibt sortierte Ergebnisse zurück
 *
 * @param input - Normalisierte Peak-Daten
 * @param minConfidence - Minimale Konfidenz für Berichterstattung (default: 0.3)
 * @returns Sortierte Liste von Diagnosen (höchste Konfidenz zuerst)
 */
export function runFullDiagnosis(
  input: DiagnosisInput,
  minConfidence: number = 0.3
): DiagnosticResult[] {
  const results: DiagnosticResult[] = []

  // Alle Detektoren ausführen
  for (const detector of ALL_DETECTORS) {
    try {
      const result = detector(input)
      if (result && result.confidence >= minConfidence) {
        results.push(result)
      }
    } catch (error) {
      console.warn(`Detector ${detector.name} failed:`, error)
    }
  }

  // Sortieren: Erst nach Schweregrad, dann nach Konfidenz
  results.sort((a, b) => {
    // Severity priority: critical > warning > info
    const severityOrder = { critical: 0, warning: 1, info: 2 }
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity]
    if (severityDiff !== 0) return severityDiff

    // Then by confidence (descending)
    return b.confidence - a.confidence
  })

  return results
}

/**
 * Führt schnelle Diagnose durch (nur kritische Checks)
 */
export function runQuickDiagnosis(input: DiagnosisInput): DiagnosticResult[] {
  const criticalDetectors = [
    detectAirLeak,
    detectOilBackstreaming,
    detectFomblinContamination,
    detectChlorinatedSolvent
  ]

  const results: DiagnosticResult[] = []

  for (const detector of criticalDetectors) {
    try {
      const result = detector(input)
      if (result && result.confidence >= 0.5) {
        results.push(result)
      }
    } catch (error) {
      console.warn(`Quick detector ${detector.name} failed:`, error)
    }
  }

  return results.sort((a, b) => b.confidence - a.confidence)
}

/**
 * Erstellt DiagnosisInput aus normalisierten Peak-Daten
 */
export function createDiagnosisInput(
  normalizedPeaks: Array<{ mass: number; normalizedToH2: number }>,
  metadata?: DiagnosisInput['metadata']
): DiagnosisInput {
  const peaks: Record<number, number> = {}

  for (const peak of normalizedPeaks) {
    const mass = Math.round(peak.mass)
    // Nimm den höchsten Wert wenn mehrere Punkte für eine Masse existieren
    if (!peaks[mass] || peak.normalizedToH2 > peaks[mass]) {
      peaks[mass] = peak.normalizedToH2
    }
  }

  return { peaks, metadata }
}

/**
 * Gibt eine Zusammenfassung der Diagnosen zurück
 */
export function getDiagnosisSummary(results: DiagnosticResult[]): {
  criticalCount: number
  warningCount: number
  infoCount: number
  topDiagnosis: DiagnosticResult | null
  overallStatus: 'clean' | 'warning' | 'critical'
} {
  const critical = results.filter(r => r.severity === 'critical')
  const warning = results.filter(r => r.severity === 'warning')
  const info = results.filter(r => r.severity === 'info')

  return {
    criticalCount: critical.length,
    warningCount: warning.length,
    infoCount: info.length,
    topDiagnosis: results[0] || null,
    overallStatus: critical.length > 0 ? 'critical' : warning.length > 0 ? 'warning' : 'clean'
  }
}

/**
 * Formatiert Diagnose-Ergebnisse für AI-Prompt
 */
export function formatDiagnosisForAI(
  results: DiagnosticResult[],
  language: 'de' | 'en' = 'de'
): string {
  if (results.length === 0) {
    return language === 'de'
      ? 'Keine signifikanten Diagnosen.'
      : 'No significant diagnoses.'
  }

  const lines: string[] = []

  for (const result of results.slice(0, 5)) {
    const name = language === 'de' ? result.name : result.nameEn
    const meta = DIAGNOSIS_METADATA[result.type]
    const confidence = (result.confidence * 100).toFixed(0)

    lines.push(`${meta.icon} ${name} (${confidence}% ${language === 'de' ? 'Konfidenz' : 'confidence'}) [${result.severity.toUpperCase()}]`)

    // Top 2 evidence items
    const evidence = result.evidence.slice(0, 2)
    for (const e of evidence) {
      const desc = language === 'de' ? e.description : e.descriptionEn
      lines.push(`  - ${desc}`)
    }
  }

  return lines.join('\n')
}

/**
 * Prüft ob das System bestimmte Kriterien erfüllt
 */
export function checkSystemCriteria(input: DiagnosisInput): {
  isHydrogenDominant: boolean
  isWaterDominant: boolean
  hasOilContamination: boolean
  hasAirLeak: boolean
  isClean: boolean
} {
  const results = runFullDiagnosis(input, 0.4)

  const hasType = (type: string) => results.some(r => r.type === type && r.confidence >= 0.5)

  return {
    isHydrogenDominant: hasType('HYDROGEN_DOMINANT'),
    isWaterDominant: hasType('WATER_OUTGASSING'),
    hasOilContamination: hasType('OIL_BACKSTREAMING') || hasType('FOMBLIN_CONTAMINATION'),
    hasAirLeak: hasType('AIR_LEAK'),
    isClean: hasType('CLEAN_UHV')
  }
}
