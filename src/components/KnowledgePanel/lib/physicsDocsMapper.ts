/**
 * PHYSICS Documentation Mapper for KnowledgePanel
 *
 * Maps detector types to their corresponding PHYSICS documentation files
 * based on the reorganized DOCUMENTATION/PHYSICS/ structure.
 *
 * This enables the KnowledgePanel to link each diagnosis to its
 * detailed scientific documentation with one click.
 */

import { DiagnosisType } from '@/lib/diagnosis/types'

/**
 * Maps detector types to PHYSICS documentation paths
 * Based on DOCUMENTATION/PHYSICS/[Category]/[Detector].md structure
 */
export const PHYSICS_DOCS_MAP: Partial<Record<DiagnosisType, string>> = {
  // === LEAKS (4 detectors) ===
  [DiagnosisType.AIR_LEAK]: 'DOCUMENTATION/PHYSICS/Leaks/AirLeak.md',
  [DiagnosisType.HELIUM_LEAK_INDICATOR]: 'DOCUMENTATION/PHYSICS/Leaks/HeliumLeak.md',
  [DiagnosisType.VIRTUAL_LEAK]: 'DOCUMENTATION/PHYSICS/Leaks/VirtualLeak.md',
  [DiagnosisType.COOLING_WATER_LEAK]: 'DOCUMENTATION/PHYSICS/Leaks/CoolingWaterLeak.md',

  // === CONTAMINATION - OILS ===
  [DiagnosisType.OIL_BACKSTREAMING]: 'DOCUMENTATION/PHYSICS/Contamination/Oils/OilBackstreaming.md',

  // === CONTAMINATION - FLUORINATED ===
  [DiagnosisType.FOMBLIN_CONTAMINATION]: 'DOCUMENTATION/PHYSICS/Contamination/Fluorinated/FomblinContamination.md',

  // === CONTAMINATION - POLYMERS ===
  [DiagnosisType.POLYMER_OUTGASSING]: 'DOCUMENTATION/PHYSICS/Contamination/Polymers/PolymerOutgassing.md',
  [DiagnosisType.PLASTICIZER_CONTAMINATION]: 'DOCUMENTATION/PHYSICS/Contamination/Polymers/PlasticizerContamination.md',
  [DiagnosisType.SILICONE_CONTAMINATION]: 'DOCUMENTATION/PHYSICS/Contamination/Polymers/SiliconeContamination.md',

  // === CONTAMINATION - SOLVENTS ===
  [DiagnosisType.SOLVENT_RESIDUE]: 'DOCUMENTATION/PHYSICS/Contamination/Solvents/SolventResidue.md',
  [DiagnosisType.CHLORINATED_SOLVENT]: 'DOCUMENTATION/PHYSICS/Contamination/Solvents/ChlorinatedSolvent.md',

  // === CONTAMINATION - AROMATICS ===
  [DiagnosisType.AROMATIC_CONTAMINATION]: 'DOCUMENTATION/PHYSICS/Contamination/Aromatics/AromaticContamination.md',

  // === OUTGASSING (2 detectors) ===
  [DiagnosisType.WATER_OUTGASSING]: 'DOCUMENTATION/PHYSICS/Outgassing/WaterOutgassing.md',
  [DiagnosisType.HYDROGEN_DOMINANT]: 'DOCUMENTATION/PHYSICS/Outgassing/HydrogenDominant.md',

  // === ARTIFACTS (1 detector) ===
  [DiagnosisType.ESD_ARTIFACT]: 'DOCUMENTATION/PHYSICS/Artifacts/ESDartifacts.md',

  // === GASES (5 detectors) ===
  [DiagnosisType.AMMONIA_CONTAMINATION]: 'DOCUMENTATION/PHYSICS/Gases/Ammonia.md',
  [DiagnosisType.METHANE_CONTAMINATION]: 'DOCUMENTATION/PHYSICS/Gases/Methane.md',
  [DiagnosisType.SULFUR_CONTAMINATION]: 'DOCUMENTATION/PHYSICS/Gases/Sulfur.md',
  [DiagnosisType.PROCESS_GAS_RESIDUE]: 'DOCUMENTATION/PHYSICS/Gases/ProcessGas.md',
  [DiagnosisType.N2_CO_MIXTURE]: 'DOCUMENTATION/PHYSICS/Gases/N2_vs_CO.md',

  // === ISOTOPES (1 detector) ===
  [DiagnosisType.ISOTOPE_VERIFICATION]: 'DOCUMENTATION/PHYSICS/Isotopes/IsotopeVerification.md',

  // === QUALITY (1 detector) ===
  [DiagnosisType.CLEAN_UHV]: 'DOCUMENTATION/PHYSICS/Quality/CleanUHV.md',
}

/**
 * Returns the PHYSICS documentation link for a given diagnosis type
 */
export function getPhysicsDocLink(
  type: DiagnosisType
): { path: string; display: string; filename: string } | null {
  const relativePath = PHYSICS_DOCS_MAP[type]
  if (!relativePath) return null

  const filename = relativePath.split('/').pop()?.replace('.md', '') || ''
  // Use hardcoded project root for VSCode links (browser doesn't have process.cwd())
  const projectRoot = '/Users/phillipplomer/Code/RGA Analyser'
  const absolutePath = `${projectRoot}/${relativePath}`
  const vscodeLink = `vscode://file/${absolutePath}`

  return {
    path: vscodeLink,
    display: `📖 ${filename} (DE/EN)`,
    filename,
  }
}

/**
 * Returns all mapped diagnosis types
 */
export function getAllMappedTypes(): DiagnosisType[] {
  return Object.keys(PHYSICS_DOCS_MAP) as DiagnosisType[]
}

/**
 * Checks if a diagnosis type has PHYSICS documentation
 */
export function hasPhysicsDoc(type: DiagnosisType): boolean {
  return type in PHYSICS_DOCS_MAP
}
