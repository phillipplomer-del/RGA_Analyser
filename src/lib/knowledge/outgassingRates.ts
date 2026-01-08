/**
 * Outgassing Rates Database and Calculation Functions
 *
 * Sources:
 * - VACOM White Paper WP00002
 * - Chiggiato CERN-ACC-2014-0270
 * - de Csernatony, Vacuum 16/17 (1966/1967)
 * - Edwards Application Notes
 * - Meyer Tool & Allectra datasheets
 */

export interface OutgassingMaterial {
  id: string
  name: string
  nameEn: string
  category: 'metal' | 'elastomer' | 'ceramic' | 'polymer'

  // Outgassing rate after 1h pumping at RT [mbar·l/(s·cm²)]
  q1h_unbaked: number
  q1h_baked?: number // After bakeout
  bakeoutTemp?: number // °C

  // Outgassing rate after 10h [mbar·l/(s·cm²)]
  q10h_unbaked: number
  q10h_baked?: number

  // Time exponent n for q(t) = q₁ × (t₁/t)^n
  timeExponent: number

  // Activation energy for temperature dependence [eV]
  activationEnergy?: number

  // Dominant outgassing species
  dominantSpecies: ('H2O' | 'H2' | 'CO' | 'CO2' | 'CH4' | 'other')[]

  notes?: string[]
  source: string
}

export const OUTGASSING_MATERIALS: OutgassingMaterial[] = [
  // === METALS ===
  {
    id: 'ss304-cleaned',
    name: 'Edelstahl 304/304L (gereinigt)',
    nameEn: 'Stainless Steel 304/304L (cleaned)',
    category: 'metal',
    q1h_unbaked: 2e-7,
    q10h_unbaked: 2e-8,
    q1h_baked: 1e-10, // After 250°C, 24h
    q10h_baked: 1e-11,
    bakeoutTemp: 250,
    timeExponent: 1.0,
    activationEnergy: 0.8,
    dominantSpecies: ['H2O', 'H2'],
    notes: [
      'H₂O dominiert unbaked',
      'H₂ dominiert nach Bakeout',
      'Vakuumglühen bei 950°C reduziert H₂ um Faktor 100'
    ],
    source: 'VACOM White Paper WP00002; Chiggiato CERN-ACC-2014-0270'
  },
  {
    id: 'ss316ln-electropolished',
    name: 'Edelstahl 316LN (elektropoliert)',
    nameEn: 'Stainless Steel 316LN (electropolished)',
    category: 'metal',
    q1h_unbaked: 7e-8,
    q10h_unbaked: 7e-9,
    q1h_baked: 7e-11,
    q10h_baked: 7e-12,
    bakeoutTemp: 200,
    timeExponent: 1.0,
    activationEnergy: 0.8,
    dominantSpecies: ['H2O', 'H2'],
    notes: ['Elektropolieren reduziert Ausgasung um Faktor 30'],
    source: 'Edwards Application Note; PMC5226402'
  },
  {
    id: 'aluminum-6061',
    name: 'Aluminium 6061 (oxidiert)',
    nameEn: 'Aluminum 6061 (oxidized)',
    category: 'metal',
    q1h_unbaked: 5e-8,
    q10h_unbaked: 5e-9,
    q1h_baked: 1.2e-13, // After 120°C, 24h
    q10h_baked: 5e-14,
    bakeoutTemp: 120,
    timeExponent: 0.9,
    activationEnergy: 0.7,
    dominantSpecies: ['H2O'],
    notes: [
      'Erreicht niedrigere Raten als SS ohne Vakuumglühen',
      'Bakeout bei nur 120°C ausreichend',
      'Ideale Wärmeleitfähigkeit für schnelles Bakeout'
    ],
    source: 'VACOM White Paper WP00002'
  },
  {
    id: 'ofhc-copper',
    name: 'OFHC Kupfer',
    nameEn: 'OFHC Copper',
    category: 'metal',
    q1h_unbaked: 1e-8,
    q10h_unbaked: 1e-9,
    q1h_baked: 5e-12,
    q10h_baked: 5e-13,
    bakeoutTemp: 200,
    timeExponent: 0.9,
    activationEnergy: 0.4,
    dominantSpecies: ['H2O', 'H2'],
    notes: ['Sehr niedrige H₂-Löslichkeit'],
    source: 'Chiggiato CERN CAS Lecture'
  },
  {
    id: 'titanium',
    name: 'Titan (gereinigt)',
    nameEn: 'Titanium (cleaned)',
    category: 'metal',
    q1h_unbaked: 3e-8,
    q10h_unbaked: 3e-9,
    q1h_baked: 1e-11,
    q10h_baked: 1e-12,
    bakeoutTemp: 250,
    timeExponent: 0.95,
    activationEnergy: 0.6,
    dominantSpecies: ['H2O', 'H2'],
    notes: ['Getter-Eigenschaften bei erhöhter Temperatur'],
    source: 'VACOM White Paper'
  },

  // === ELASTOMERS ===
  {
    id: 'viton-a',
    name: 'Viton A (FKM)',
    nameEn: 'Viton A (FKM)',
    category: 'elastomer',
    q1h_unbaked: 1e-6,
    q10h_unbaked: 2e-7,
    q1h_baked: 4e-8, // After 100°C, 16h
    q10h_baked: 1e-8,
    bakeoutTemp: 100,
    timeExponent: 0.5,
    dominantSpecies: ['H2O', 'CO2'],
    notes: [
      'Standard-O-Ring-Material',
      'Permeation beachten bei atmosphärischen Dichtungen',
      'Max. 200°C Dauertemperatur'
    ],
    source: 'de Csernatony, Vacuum 16 (1966); Meyer Tool'
  },
  {
    id: 'viton-e60c',
    name: 'Viton E60C (UHV-Grade)',
    nameEn: 'Viton E60C (UHV-Grade)',
    category: 'elastomer',
    q1h_unbaked: 5e-7,
    q10h_unbaked: 1e-7,
    q1h_baked: 1e-8,
    q10h_baked: 5e-9,
    bakeoutTemp: 150,
    timeExponent: 0.6,
    dominantSpecies: ['H2O'],
    notes: ['Verbesserte UHV-Eigenschaften', 'Geringere Weichmacher-Emission'],
    source: 'ScienceDirect Viton A Part V'
  },
  {
    id: 'kalrez-ffkm',
    name: 'Kalrez (FFKM)',
    nameEn: 'Kalrez (FFKM)',
    category: 'elastomer',
    q1h_unbaked: 1e-8,
    q10h_unbaked: 5e-9,
    q1h_baked: 1e-10,
    q10h_baked: 5e-11,
    bakeoutTemp: 200,
    timeExponent: 0.7,
    activationEnergy: 0.9,
    dominantSpecies: ['H2O'],
    notes: [
      'Beste UHV-Eigenschaften unter Elastomeren',
      'Bakeable bis 300°C',
      'Sehr teuer (ca. 100x Viton)'
    ],
    source: 'de Csernatony, Vacuum 17 (1967)'
  },
  {
    id: 'epdm',
    name: 'EPDM',
    nameEn: 'EPDM',
    category: 'elastomer',
    q1h_unbaked: 1e-5,
    q10h_unbaked: 5e-6,
    timeExponent: 0.4,
    dominantSpecies: ['H2O', 'other'],
    notes: [
      'Hohe Ausgasung - nur für Grobvakuum',
      'Nicht UHV-kompatibel',
      'Gute UV/Ozon-Beständigkeit'
    ],
    source: 'Meyer Tool; Allectra'
  },
  {
    id: 'buna-n',
    name: 'Buna-N (NBR/Nitril)',
    nameEn: 'Buna-N (NBR/Nitrile)',
    category: 'elastomer',
    q1h_unbaked: 5e-6,
    q10h_unbaked: 1e-6,
    timeExponent: 0.5,
    dominantSpecies: ['H2O', 'other'],
    notes: [
      'Hohe Ausgasung',
      'Niedrige Permeabilität',
      'Öl-/Kraftstoffbeständig'
    ],
    source: 'Meyer Tool'
  },
  {
    id: 'silicone',
    name: 'Silikon (VMQ)',
    nameEn: 'Silicone (VMQ)',
    category: 'elastomer',
    q1h_unbaked: 2e-5,
    q10h_unbaked: 5e-6,
    timeExponent: 0.4,
    dominantSpecies: ['H2O', 'other'],
    notes: [
      'Sehr hohe Ausgasung und Permeation',
      'Nur für Grobvakuum',
      'Hohe Temperaturbeständigkeit'
    ],
    source: 'Meyer Tool'
  },

  // === CERAMICS ===
  {
    id: 'alumina',
    name: 'Aluminiumoxid (Al₂O₃)',
    nameEn: 'Alumina (Al₂O₃)',
    category: 'ceramic',
    q1h_unbaked: 3e-9,
    q10h_unbaked: 1e-9,
    q1h_baked: 1e-11,
    q10h_baked: 5e-12,
    bakeoutTemp: 300,
    timeExponent: 0.8,
    dominantSpecies: ['H2O'],
    notes: ['Exzellente UHV-Eigenschaften', 'Elektrischer Isolator'],
    source: 'Allectra'
  },
  {
    id: 'macor',
    name: 'MACOR (Glaskeramik)',
    nameEn: 'MACOR (Glass Ceramic)',
    category: 'ceramic',
    q1h_unbaked: 1e-8,
    q10h_unbaked: 3e-9,
    q1h_baked: 5e-11,
    q10h_baked: 1e-11,
    bakeoutTemp: 250,
    timeExponent: 0.75,
    dominantSpecies: ['H2O'],
    notes: ['Bearbeitbar', 'Gut für elektrische Durchführungen'],
    source: 'Corning MACOR Datasheet'
  },

  // === POLYMERS ===
  {
    id: 'peek',
    name: 'PEEK',
    nameEn: 'PEEK',
    category: 'polymer',
    q1h_unbaked: 5e-7,
    q10h_unbaked: 1e-7,
    q1h_baked: 1e-8,
    q10h_baked: 5e-9,
    bakeoutTemp: 150,
    timeExponent: 0.6,
    dominantSpecies: ['H2O'],
    notes: [
      'Bester Thermoplast für Vakuum',
      'Bakeable bis 250°C',
      'Gute mechanische Eigenschaften'
    ],
    source: 'VACOM; Victrex PEEK datasheet'
  },
  {
    id: 'ptfe',
    name: 'PTFE (Teflon)',
    nameEn: 'PTFE (Teflon)',
    category: 'polymer',
    q1h_unbaked: 1e-6,
    q10h_unbaked: 3e-7,
    timeExponent: 0.5,
    dominantSpecies: ['H2O', 'other'],
    notes: [
      'Hohe Permeation für He und H₂',
      'Kriecht unter Last',
      'Gute chemische Beständigkeit'
    ],
    source: 'Meyer Tool'
  },
  {
    id: 'vespel',
    name: 'Vespel (Polyimid)',
    nameEn: 'Vespel (Polyimide)',
    category: 'polymer',
    q1h_unbaked: 2e-7,
    q10h_unbaked: 5e-8,
    q1h_baked: 5e-9,
    q10h_baked: 1e-9,
    bakeoutTemp: 200,
    timeExponent: 0.65,
    dominantSpecies: ['H2O', 'CO'],
    notes: [
      'Hervorragende Hochtemperaturbeständigkeit',
      'Gut für Lager und Dichtungen',
      'Teuer'
    ],
    source: 'DuPont Vespel datasheet'
  },
  {
    id: 'kapton',
    name: 'Kapton (Polyimid-Folie)',
    nameEn: 'Kapton (Polyimide Film)',
    category: 'polymer',
    q1h_unbaked: 3e-7,
    q10h_unbaked: 8e-8,
    q1h_baked: 1e-8,
    q10h_baked: 3e-9,
    bakeoutTemp: 200,
    timeExponent: 0.6,
    dominantSpecies: ['H2O', 'CO'],
    notes: [
      'Standard für UHV-Isolierung',
      'Bakeable bis 400°C',
      'Niedrige Ausgasung für Polymer'
    ],
    source: 'DuPont Kapton datasheet; NASA outgassing database'
  }
]

/**
 * Calculate outgassing rate at any time using: q(t) = q₁ × (t₁/t)^n
 */
export function calculateOutgassingRate(
  material: OutgassingMaterial,
  pumpingTimeHours: number,
  isBaked: boolean = false
): number {
  // Prevent division by zero
  if (pumpingTimeHours <= 0) {
    pumpingTimeHours = 0.1
  }

  const q1h = isBaked && material.q1h_baked
    ? material.q1h_baked
    : material.q1h_unbaked

  // q(t) = q₁ × (1/t)^n for t in hours
  return q1h * Math.pow(1 / pumpingTimeHours, material.timeExponent)
}

/**
 * Calculate expected pressure rise from outgassing
 */
export function calculateOutgassingPressureRise(
  material: OutgassingMaterial,
  surfaceArea_cm2: number,
  chamberVolume_liters: number,
  pumpingTimeHours: number,
  isBaked: boolean = false
): {
  gasLoad_mbarLperS: number
  pressureRise_mbarPerHour: number
  equilibriumPressure_mbar: number
} {
  const q = calculateOutgassingRate(material, pumpingTimeHours, isBaked)
  const gasLoad = q * surfaceArea_cm2
  const pressureRise = (gasLoad * 3600) / chamberVolume_liters

  // Equilibrium pressure assuming 100 l/s pump speed
  const equilibriumPressure = gasLoad / 100

  return {
    gasLoad_mbarLperS: gasLoad,
    pressureRise_mbarPerHour: pressureRise,
    equilibriumPressure_mbar: equilibriumPressure
  }
}

export interface MaterialEntry {
  materialId: string
  surfaceArea_cm2: number
  isBaked: boolean
  bakeoutTemp_C?: number
  label?: string
}

export interface ChamberPreset {
  name: string
  nameEn: string
  volume_liters: number
  pumpingSpeed_Lpers: number
  materials: MaterialEntry[]
}

export const CHAMBER_PRESETS: Record<string, ChamberPreset> = {
  'DN100-CF-basic': {
    name: 'DN100 CF Analysekammer (Standard)',
    nameEn: 'DN100 CF Analysis Chamber (Standard)',
    volume_liters: 10,
    pumpingSpeed_Lpers: 100,
    materials: [
      { materialId: 'ss316ln-electropolished', surfaceArea_cm2: 2000, isBaked: false, label: 'Wände' },
      { materialId: 'viton-a', surfaceArea_cm2: 15, isBaked: false, label: 'O-Ringe' },
      { materialId: 'alumina', surfaceArea_cm2: 50, isBaked: false, label: 'Durchführungen' }
    ]
  },
  'DN100-CF-uhv': {
    name: 'DN100 CF UHV-System (Optimiert)',
    nameEn: 'DN100 CF UHV System (Optimized)',
    volume_liters: 10,
    pumpingSpeed_Lpers: 100,
    materials: [
      { materialId: 'ss316ln-electropolished', surfaceArea_cm2: 2000, isBaked: true, bakeoutTemp_C: 250, label: 'Wände' },
      { materialId: 'kalrez-ffkm', surfaceArea_cm2: 15, isBaked: true, bakeoutTemp_C: 200, label: 'O-Ringe' },
      { materialId: 'alumina', surfaceArea_cm2: 50, isBaked: true, bakeoutTemp_C: 300, label: 'Durchführungen' }
    ]
  },
  'DN160-CF-sputtering': {
    name: 'DN160 CF Sputterkammer',
    nameEn: 'DN160 CF Sputtering Chamber',
    volume_liters: 30,
    pumpingSpeed_Lpers: 300,
    materials: [
      { materialId: 'ss304-cleaned', surfaceArea_cm2: 5000, isBaked: false, label: 'Wände' },
      { materialId: 'viton-a', surfaceArea_cm2: 40, isBaked: false, label: 'O-Ringe' },
      { materialId: 'alumina', surfaceArea_cm2: 100, isBaked: false, label: 'Durchführungen' }
    ]
  },
  'small-load-lock': {
    name: 'Kleine Ladeschleuse',
    nameEn: 'Small Load Lock',
    volume_liters: 2,
    pumpingSpeed_Lpers: 50,
    materials: [
      { materialId: 'ss304-cleaned', surfaceArea_cm2: 800, isBaked: false, label: 'Wände' },
      { materialId: 'viton-a', surfaceArea_cm2: 10, isBaked: false, label: 'O-Ringe' }
    ]
  }
}

export interface OutgassingResult {
  materialId: string
  materialName: string
  surfaceArea_cm2: number
  isBaked: boolean
  gasLoad_mbarLperS: number
  percentage: number
}

export interface TotalOutgassingResult {
  materials: OutgassingResult[]
  totalGasLoad_mbarLperS: number
  equilibriumPressure_mbar: number
  pressureRise_mbarPerHour: number
  recommendations: string[]
  recommendationsEn: string[]
}

/**
 * Calculate total outgassing for a multi-material chamber
 */
export function calculateTotalOutgassing(
  materials: MaterialEntry[],
  chamberVolume_liters: number,
  pumpingSpeed_Lpers: number,
  pumpingTimeHours: number
): TotalOutgassingResult {
  const results: OutgassingResult[] = []
  let totalGasLoad = 0

  // Calculate individual contributions
  for (const entry of materials) {
    const material = OUTGASSING_MATERIALS.find(m => m.id === entry.materialId)
    if (!material) continue

    const q = calculateOutgassingRate(material, pumpingTimeHours, entry.isBaked)
    const gasLoad = q * entry.surfaceArea_cm2
    totalGasLoad += gasLoad

    results.push({
      materialId: entry.materialId,
      materialName: material.name,
      surfaceArea_cm2: entry.surfaceArea_cm2,
      isBaked: entry.isBaked,
      gasLoad_mbarLperS: gasLoad,
      percentage: 0 // Will be calculated after total
    })
  }

  // Calculate percentages
  for (const result of results) {
    result.percentage = totalGasLoad > 0 ? (result.gasLoad_mbarLperS / totalGasLoad) * 100 : 0
  }

  // Sort by gas load (highest first)
  results.sort((a, b) => b.gasLoad_mbarLperS - a.gasLoad_mbarLperS)

  const equilibriumPressure = totalGasLoad / pumpingSpeed_Lpers
  const pressureRise = (totalGasLoad * 3600) / chamberVolume_liters

  // Generate recommendations
  const recommendations: string[] = []
  const recommendationsEn: string[] = []

  // Check for dominant elastomer contribution
  const elastomerContribution = results
    .filter(r => {
      const mat = OUTGASSING_MATERIALS.find(m => m.id === r.materialId)
      return mat?.category === 'elastomer'
    })
    .reduce((sum, r) => sum + r.percentage, 0)

  if (elastomerContribution > 20) {
    recommendations.push(`Elastomere tragen ${elastomerContribution.toFixed(0)}% zur Gaslast bei. Bakeout oder Kalrez erwägen.`)
    recommendationsEn.push(`Elastomers contribute ${elastomerContribution.toFixed(0)}% of gas load. Consider bakeout or Kalrez.`)
  }

  // Check for unbaked materials limiting UHV
  const unbakedMaterials = results.filter(r => !r.isBaked && r.percentage > 10)
  if (unbakedMaterials.length > 0 && equilibriumPressure > 1e-9) {
    recommendations.push('Unbaked Materialien begrenzen UHV-Tauglichkeit.')
    recommendationsEn.push('Unbaked materials limit UHV capability.')
  }

  // Check achievable pressure range
  if (equilibriumPressure > 1e-6) {
    recommendations.push('Nur HV erreichbar (>10⁻⁶ mbar). Oberflächen oder Pumpgeschwindigkeit optimieren.')
    recommendationsEn.push('Only HV achievable (>10⁻⁶ mbar). Optimize surfaces or pump speed.')
  } else if (equilibriumPressure > 1e-9) {
    recommendations.push('UHV möglich nach längerem Pumpen oder Bakeout.')
    recommendationsEn.push('UHV possible after extended pumping or bakeout.')
  } else {
    recommendations.push('XHV-Bereich erreichbar. System ist gut optimiert.')
    recommendationsEn.push('XHV range achievable. System is well optimized.')
  }

  return {
    materials: results,
    totalGasLoad_mbarLperS: totalGasLoad,
    equilibriumPressure_mbar: equilibriumPressure,
    pressureRise_mbarPerHour: pressureRise,
    recommendations,
    recommendationsEn
  }
}

/**
 * Get material by ID
 */
export function getMaterialById(id: string): OutgassingMaterial | undefined {
  return OUTGASSING_MATERIALS.find(m => m.id === id)
}

/**
 * Get materials by category
 */
export function getMaterialsByCategory(category: OutgassingMaterial['category']): OutgassingMaterial[] {
  return OUTGASSING_MATERIALS.filter(m => m.category === category)
}

/**
 * Format number in scientific notation for display
 */
export function formatScientific(value: number, precision: number = 1): string {
  if (value === 0) return '0'
  const exponent = Math.floor(Math.log10(Math.abs(value)))
  const mantissa = value / Math.pow(10, exponent)
  return `${mantissa.toFixed(precision)}×10${exponent < 0 ? '⁻' : ''}${Math.abs(exponent).toString().split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[parseInt(d)]).join('')}`
}
