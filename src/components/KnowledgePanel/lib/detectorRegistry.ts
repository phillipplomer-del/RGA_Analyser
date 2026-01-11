/**
 * Detector Registry for KnowledgePanel
 *
 * This registry combines detector functions with their metadata from multiple sources:
 * - Detector functions from modules/rga/lib/detectors
 * - Validation data from lib/diagnosis/validation
 * - UI metadata from lib/diagnosis/types
 *
 * This creates a single source of truth for the KnowledgePanel to display
 * all detector information dynamically without hardcoding.
 */

import { DiagnosisType } from '@/lib/diagnosis/types'
import type { DiagnosisInput, DiagnosticResult, ValidationMetadata } from '@/lib/diagnosis/types'
import { DETECTOR_VALIDATIONS } from '@/lib/diagnosis/validation'
import { DIAGNOSIS_METADATA } from '@/lib/diagnosis/types'

// Import all 22 detector functions
import {
  detectAirLeak,
  detectHeliumLeak,
  detectVirtualLeak,
  detectCoolingWaterLeak,
} from '@/modules/rga/lib/detectors/leaks'

import {
  detectOilBackstreaming,
} from '@/modules/rga/lib/detectors/contamination/oils'

import {
  detectFomblinContamination,
} from '@/modules/rga/lib/detectors/contamination/fluorinated'

import {
  detectPolymerOutgassing,
  detectPlasticizerContamination,
  detectSiliconeContamination,
} from '@/modules/rga/lib/detectors/contamination/polymers'

import {
  detectSolventResidue,
  detectChlorinatedSolvent,
} from '@/modules/rga/lib/detectors/contamination/solvents'

import {
  detectAromatic,
} from '@/modules/rga/lib/detectors/contamination/aromatics'

import {
  detectWaterOutgassing,
  detectHydrogenDominant,
} from '@/modules/rga/lib/detectors/outgassing'

import {
  detectESDartifacts,
} from '@/modules/rga/lib/detectors/artifacts'

import {
  detectAmmonia,
  detectMethane,
  detectSulfur,
  detectProcessGasResidue,
  distinguishN2fromCO,
} from '@/modules/rga/lib/detectors/gases'

import {
  verifyIsotopeRatios,
} from '@/modules/rga/lib/detectors/isotopes'

import {
  detectCleanUHV,
} from '@/modules/rga/lib/detectors/quality'

/**
 * Combined detector entry with all metadata
 */
export interface DetectorEntry {
  type: DiagnosisType
  name: string
  nameEn: string
  detector: (input: DiagnosisInput) => DiagnosticResult | null
  validation: ValidationMetadata
  uiMetadata: {
    icon: string
    color: string
    priority: number
  }
  category: string
}

/**
 * Master detector registry - Single source of truth
 * Maps all 22 detectors with their complete metadata
 */
export const DETECTOR_REGISTRY: DetectorEntry[] = [
  // === LEAKS (4 detectors) ===
  {
    type: DiagnosisType.AIR_LEAK,
    name: 'Luftleck',
    nameEn: 'Air Leak',
    detector: detectAirLeak,
    validation: DETECTOR_VALIDATIONS[DiagnosisType.AIR_LEAK],
    uiMetadata: DIAGNOSIS_METADATA[DiagnosisType.AIR_LEAK],
    category: 'leaks',
  },
  {
    type: DiagnosisType.HELIUM_LEAK_INDICATOR,
    name: 'Helium-Leck-Indikator',
    nameEn: 'Helium Leak Indicator',
    detector: detectHeliumLeak,
    validation: DETECTOR_VALIDATIONS[DiagnosisType.HELIUM_LEAK_INDICATOR],
    uiMetadata: DIAGNOSIS_METADATA[DiagnosisType.HELIUM_LEAK_INDICATOR],
    category: 'leaks',
  },
  {
    type: DiagnosisType.VIRTUAL_LEAK,
    name: 'Virtuelles Leck',
    nameEn: 'Virtual Leak',
    detector: detectVirtualLeak,
    validation: DETECTOR_VALIDATIONS[DiagnosisType.VIRTUAL_LEAK],
    uiMetadata: DIAGNOSIS_METADATA[DiagnosisType.VIRTUAL_LEAK],
    category: 'leaks',
  },
  {
    type: DiagnosisType.COOLING_WATER_LEAK,
    name: 'Kühlwasser-Leck',
    nameEn: 'Cooling Water Leak',
    detector: detectCoolingWaterLeak,
    validation: DETECTOR_VALIDATIONS[DiagnosisType.COOLING_WATER_LEAK],
    uiMetadata: DIAGNOSIS_METADATA[DiagnosisType.COOLING_WATER_LEAK],
    category: 'leaks',
  },

  // === CONTAMINATION - OILS (1 detector) ===
  {
    type: DiagnosisType.OIL_BACKSTREAMING,
    name: 'Öl-Rückströmung',
    nameEn: 'Oil Backstreaming',
    detector: detectOilBackstreaming,
    validation: DETECTOR_VALIDATIONS[DiagnosisType.OIL_BACKSTREAMING],
    uiMetadata: DIAGNOSIS_METADATA[DiagnosisType.OIL_BACKSTREAMING],
    category: 'contamination_oils',
  },

  // === CONTAMINATION - FLUORINATED (1 detector) ===
  {
    type: DiagnosisType.FOMBLIN_CONTAMINATION,
    name: 'FOMBLIN-Kontamination',
    nameEn: 'FOMBLIN Contamination',
    detector: detectFomblinContamination,
    validation: DETECTOR_VALIDATIONS[DiagnosisType.FOMBLIN_CONTAMINATION],
    uiMetadata: DIAGNOSIS_METADATA[DiagnosisType.FOMBLIN_CONTAMINATION],
    category: 'contamination_fluorinated',
  },

  // === CONTAMINATION - POLYMERS (3 detectors) ===
  {
    type: DiagnosisType.POLYMER_OUTGASSING,
    name: 'Polymer-Ausgasung',
    nameEn: 'Polymer Outgassing',
    detector: detectPolymerOutgassing,
    validation: DETECTOR_VALIDATIONS[DiagnosisType.POLYMER_OUTGASSING],
    uiMetadata: DIAGNOSIS_METADATA[DiagnosisType.POLYMER_OUTGASSING],
    category: 'contamination_polymers',
  },
  {
    type: DiagnosisType.PLASTICIZER_CONTAMINATION,
    name: 'Weichmacher-Kontamination',
    nameEn: 'Plasticizer Contamination',
    detector: detectPlasticizerContamination,
    validation: DETECTOR_VALIDATIONS[DiagnosisType.PLASTICIZER_CONTAMINATION],
    uiMetadata: DIAGNOSIS_METADATA[DiagnosisType.PLASTICIZER_CONTAMINATION],
    category: 'contamination_polymers',
  },
  {
    type: DiagnosisType.SILICONE_CONTAMINATION,
    name: 'Silikon-Kontamination',
    nameEn: 'Silicone Contamination',
    detector: detectSiliconeContamination,
    validation: DETECTOR_VALIDATIONS[DiagnosisType.SILICONE_CONTAMINATION],
    uiMetadata: DIAGNOSIS_METADATA[DiagnosisType.SILICONE_CONTAMINATION],
    category: 'contamination_polymers',
  },

  // === CONTAMINATION - SOLVENTS (2 detectors) ===
  {
    type: DiagnosisType.SOLVENT_RESIDUE,
    name: 'Lösemittelrückstände',
    nameEn: 'Solvent Residue',
    detector: detectSolventResidue,
    validation: DETECTOR_VALIDATIONS[DiagnosisType.SOLVENT_RESIDUE],
    uiMetadata: DIAGNOSIS_METADATA[DiagnosisType.SOLVENT_RESIDUE],
    category: 'contamination_solvents',
  },
  {
    type: DiagnosisType.CHLORINATED_SOLVENT,
    name: 'Chlorierte Lösemittel',
    nameEn: 'Chlorinated Solvent',
    detector: detectChlorinatedSolvent,
    validation: DETECTOR_VALIDATIONS[DiagnosisType.CHLORINATED_SOLVENT],
    uiMetadata: DIAGNOSIS_METADATA[DiagnosisType.CHLORINATED_SOLVENT],
    category: 'contamination_solvents',
  },

  // === CONTAMINATION - AROMATICS (1 detector) ===
  {
    type: DiagnosisType.AROMATIC_CONTAMINATION,
    name: 'Aromatische Kohlenwasserstoffe',
    nameEn: 'Aromatic Hydrocarbons',
    detector: detectAromatic,
    validation: DETECTOR_VALIDATIONS[DiagnosisType.AROMATIC_CONTAMINATION],
    uiMetadata: DIAGNOSIS_METADATA[DiagnosisType.AROMATIC_CONTAMINATION],
    category: 'contamination_aromatics',
  },

  // === OUTGASSING (2 detectors) ===
  {
    type: DiagnosisType.WATER_OUTGASSING,
    name: 'Wasser-Ausgasung',
    nameEn: 'Water Outgassing',
    detector: detectWaterOutgassing,
    validation: DETECTOR_VALIDATIONS[DiagnosisType.WATER_OUTGASSING],
    uiMetadata: DIAGNOSIS_METADATA[DiagnosisType.WATER_OUTGASSING],
    category: 'outgassing',
  },
  {
    type: DiagnosisType.HYDROGEN_DOMINANT,
    name: 'Wasserstoff-dominant',
    nameEn: 'Hydrogen Dominant',
    detector: detectHydrogenDominant,
    validation: DETECTOR_VALIDATIONS[DiagnosisType.HYDROGEN_DOMINANT],
    uiMetadata: DIAGNOSIS_METADATA[DiagnosisType.HYDROGEN_DOMINANT],
    category: 'outgassing',
  },

  // === ARTIFACTS (1 detector) ===
  {
    type: DiagnosisType.ESD_ARTIFACT,
    name: 'ESD-Artefakte',
    nameEn: 'ESD Artifacts',
    detector: detectESDartifacts,
    validation: DETECTOR_VALIDATIONS[DiagnosisType.ESD_ARTIFACT],
    uiMetadata: DIAGNOSIS_METADATA[DiagnosisType.ESD_ARTIFACT],
    category: 'artifacts',
  },

  // === GASES (5 detectors) ===
  {
    type: DiagnosisType.AMMONIA_CONTAMINATION,
    name: 'Ammoniak-Kontamination',
    nameEn: 'Ammonia Contamination',
    detector: detectAmmonia,
    validation: DETECTOR_VALIDATIONS[DiagnosisType.AMMONIA_CONTAMINATION],
    uiMetadata: DIAGNOSIS_METADATA[DiagnosisType.AMMONIA_CONTAMINATION],
    category: 'gases',
  },
  {
    type: DiagnosisType.METHANE_CONTAMINATION,
    name: 'Methan-Kontamination',
    nameEn: 'Methane Contamination',
    detector: detectMethane,
    validation: DETECTOR_VALIDATIONS[DiagnosisType.METHANE_CONTAMINATION],
    uiMetadata: DIAGNOSIS_METADATA[DiagnosisType.METHANE_CONTAMINATION],
    category: 'gases',
  },
  {
    type: DiagnosisType.SULFUR_CONTAMINATION,
    name: 'Schwefelverbindungen',
    nameEn: 'Sulfur Contamination',
    detector: detectSulfur,
    validation: DETECTOR_VALIDATIONS[DiagnosisType.SULFUR_CONTAMINATION],
    uiMetadata: DIAGNOSIS_METADATA[DiagnosisType.SULFUR_CONTAMINATION],
    category: 'gases',
  },
  {
    type: DiagnosisType.PROCESS_GAS_RESIDUE,
    name: 'Prozessgas-Rückstände',
    nameEn: 'Process Gas Residue',
    detector: detectProcessGasResidue,
    validation: DETECTOR_VALIDATIONS[DiagnosisType.PROCESS_GAS_RESIDUE],
    uiMetadata: DIAGNOSIS_METADATA[DiagnosisType.PROCESS_GAS_RESIDUE],
    category: 'gases',
  },
  {
    type: DiagnosisType.N2_CO_MIXTURE,
    name: 'N₂/CO-Mischung',
    nameEn: 'N₂/CO Mixture',
    detector: distinguishN2fromCO,
    validation: DETECTOR_VALIDATIONS[DiagnosisType.N2_CO_MIXTURE],
    uiMetadata: DIAGNOSIS_METADATA[DiagnosisType.N2_CO_MIXTURE],
    category: 'gases',
  },

  // === ISOTOPES (1 detector) ===
  {
    type: DiagnosisType.ISOTOPE_VERIFICATION,
    name: 'Isotopen-Verifizierung',
    nameEn: 'Isotope Verification',
    detector: verifyIsotopeRatios,
    validation: DETECTOR_VALIDATIONS[DiagnosisType.ISOTOPE_VERIFICATION],
    uiMetadata: DIAGNOSIS_METADATA[DiagnosisType.ISOTOPE_VERIFICATION],
    category: 'isotopes',
  },

  // === QUALITY (1 detector) ===
  {
    type: DiagnosisType.CLEAN_UHV,
    name: 'Sauberes UHV',
    nameEn: 'Clean UHV',
    detector: detectCleanUHV,
    validation: DETECTOR_VALIDATIONS[DiagnosisType.CLEAN_UHV],
    uiMetadata: DIAGNOSIS_METADATA[DiagnosisType.CLEAN_UHV],
    category: 'quality',
  },
]

/**
 * Helper: Get detector entry by type
 */
export function getDetectorByType(type: DiagnosisType): DetectorEntry | undefined {
  return DETECTOR_REGISTRY.find((entry) => entry.type === type)
}

/**
 * Helper: Get all detectors grouped by category
 */
export function getAllDetectorsByCategory(): Record<string, DetectorEntry[]> {
  return DETECTOR_REGISTRY.reduce((acc, entry) => {
    if (!acc[entry.category]) {
      acc[entry.category] = []
    }
    acc[entry.category].push(entry)
    return acc
  }, {} as Record<string, DetectorEntry[]>)
}

/**
 * Helper: Get detector metadata (validation + UI info)
 */
export function getDetectorMetadata(type: DiagnosisType): Pick<DetectorEntry, 'validation' | 'uiMetadata'> | null {
  const entry = getDetectorByType(type)
  if (!entry) return null
  return {
    validation: entry.validation,
    uiMetadata: entry.uiMetadata,
  }
}

/**
 * Total count of registered detectors
 */
export const DETECTOR_COUNT = DETECTOR_REGISTRY.length
