/**
 * Isotope Patterns and Fragment Database for RGA Analysis
 *
 * Provides isotope ratio data, fragment patterns, and identification functions
 * for accurate peak assignment in residual gas analysis.
 *
 * Sources:
 * - NIST Chemistry WebBook (webbook.nist.gov)
 * - ISO 6954:2000 Residual Gas Analysis
 * - Pfeiffer Vacuum RGA Handbook
 * - CERN Vacuum Group Technical Notes
 */

// =============================================================================
// INTERFACES
// =============================================================================

export interface IsotopeFragment {
  mz: number
  formula: string
  name: string
  nameEn: string
  abundance: number  // Relative to base peak (0-1)
  isotopeShift?: number  // Mass difference from main isotope
  parentMolecule?: string
  ionizationType: 'M+' | 'M+2' | 'fragment' | 'doubly_charged'
  typicalSources: string[]
  source: string
}

export interface IsotopeRatio {
  element: string
  symbol: string
  isotopes: {
    massNumber: number
    exactMass: number
    abundance: number  // Natural abundance in %
  }[]
  diagnosticRatios: {
    ratio: string  // e.g., "40/36" for Ar
    value: number  // Expected ratio
    tolerance: number  // Acceptable deviation in %
    significance: string  // What this ratio tells us
  }[]
}

export interface FragmentPattern {
  molecule: string
  formula: string
  molecularWeight: number
  basePeak: number  // m/z of base peak (100% intensity)
  fragments: {
    mz: number
    formula: string
    relativeIntensity: number  // 0-100%
    assignment: string
  }[]
  source: string
}

// =============================================================================
// ISOTOPE RATIOS - Natural abundances for key elements
// =============================================================================

export const ISOTOPE_RATIOS: IsotopeRatio[] = [
  // --- ARGON (Critical for air leak detection) ---
  {
    element: 'Argon',
    symbol: 'Ar',
    isotopes: [
      { massNumber: 36, exactMass: 35.968, abundance: 0.337 },
      { massNumber: 38, exactMass: 37.963, abundance: 0.063 },
      { massNumber: 40, exactMass: 39.962, abundance: 99.600 }
    ],
    diagnosticRatios: [
      {
        ratio: '40/36',
        value: 295.5,
        tolerance: 5,
        significance: 'Confirms atmospheric argon vs. other m/z 40 sources'
      },
      {
        ratio: '40/38',
        value: 1581,
        tolerance: 10,
        significance: 'Secondary confirmation of Ar'
      }
    ]
  },

  // --- CHLORINE (Halogen contamination) ---
  {
    element: 'Chlorine',
    symbol: 'Cl',
    isotopes: [
      { massNumber: 35, exactMass: 34.969, abundance: 75.77 },
      { massNumber: 37, exactMass: 36.966, abundance: 24.23 }
    ],
    diagnosticRatios: [
      {
        ratio: '35/37',
        value: 3.13,
        tolerance: 5,
        significance: 'Characteristic chlorine pattern - confirms Cl-compounds (HCl, TCE, DCM)'
      }
    ]
  },

  // --- BROMINE (Halogen contamination) ---
  {
    element: 'Bromine',
    symbol: 'Br',
    isotopes: [
      { massNumber: 79, exactMass: 78.918, abundance: 50.69 },
      { massNumber: 81, exactMass: 80.916, abundance: 49.31 }
    ],
    diagnosticRatios: [
      {
        ratio: '79/81',
        value: 1.028,
        tolerance: 3,
        significance: 'Near 1:1 ratio is unique - unmistakable Br signature'
      }
    ]
  },

  // --- SULFUR (Process gas / contamination) ---
  {
    element: 'Sulfur',
    symbol: 'S',
    isotopes: [
      { massNumber: 32, exactMass: 31.972, abundance: 94.99 },
      { massNumber: 33, exactMass: 32.971, abundance: 0.75 },
      { massNumber: 34, exactMass: 33.968, abundance: 4.25 },
      { massNumber: 36, exactMass: 35.967, abundance: 0.01 }
    ],
    diagnosticRatios: [
      {
        ratio: '32/34',
        value: 22.35,
        tolerance: 5,
        significance: 'Distinguishes S from O₂ at m/z 32'
      },
      {
        ratio: '33/32',
        value: 0.0079,
        tolerance: 10,
        significance: 'H₂S confirmation via m/z 33 HS+ fragment'
      }
    ]
  },

  // --- CARBON (Universal organic marker) ---
  {
    element: 'Carbon',
    symbol: 'C',
    isotopes: [
      { massNumber: 12, exactMass: 12.000, abundance: 98.93 },
      { massNumber: 13, exactMass: 13.003, abundance: 1.07 }
    ],
    diagnosticRatios: [
      {
        ratio: '12/13',
        value: 92.5,
        tolerance: 5,
        significance: 'Standard ¹³C abundance - deviation indicates isotope labeling'
      },
      {
        ratio: '44/45',
        value: 83.6,
        tolerance: 5,
        significance: 'CO₂ isotope ratio - ¹³CO₂ at m/z 45'
      },
      {
        ratio: '28/29',
        value: 142.9,
        tolerance: 10,
        significance: 'N₂/CO isotope ratio - higher 29 suggests hydrocarbon contamination'
      }
    ]
  },

  // --- NITROGEN (Air leak indicator) ---
  {
    element: 'Nitrogen',
    symbol: 'N',
    isotopes: [
      { massNumber: 14, exactMass: 14.003, abundance: 99.632 },
      { massNumber: 15, exactMass: 15.000, abundance: 0.368 }
    ],
    diagnosticRatios: [
      {
        ratio: '28/29',
        value: 142.9,
        tolerance: 10,
        significance: 'Pure N₂ ratio - excess m/z 29 indicates ¹³CO or hydrocarbons'
      },
      {
        ratio: '14/28',
        value: 0.072,
        tolerance: 15,
        significance: 'N+ fragment ratio - higher indicates more energetic ionization'
      }
    ]
  },

  // --- OXYGEN (Air leak / moisture) ---
  {
    element: 'Oxygen',
    symbol: 'O',
    isotopes: [
      { massNumber: 16, exactMass: 15.995, abundance: 99.757 },
      { massNumber: 17, exactMass: 16.999, abundance: 0.038 },
      { massNumber: 18, exactMass: 17.999, abundance: 0.205 }
    ],
    diagnosticRatios: [
      {
        ratio: '32/34',
        value: 487,
        tolerance: 10,
        significance: 'Pure O₂ ratio (¹⁸O¹⁶O at m/z 34)'
      },
      {
        ratio: '18/17',
        value: 5.4,
        tolerance: 10,
        significance: 'H₂O vs. ¹⁷O ratio - H₂O dominates in typical systems'
      }
    ]
  },

  // --- SILICON (Silicone/DC705 contamination) ---
  {
    element: 'Silicon',
    symbol: 'Si',
    isotopes: [
      { massNumber: 28, exactMass: 27.977, abundance: 92.22 },
      { massNumber: 29, exactMass: 28.976, abundance: 4.69 },
      { massNumber: 30, exactMass: 29.974, abundance: 3.09 }
    ],
    diagnosticRatios: [
      {
        ratio: '28/29',
        value: 19.7,
        tolerance: 10,
        significance: 'Si isotope pattern - distinguishes Si from N₂/CO at m/z 28'
      },
      {
        ratio: '28/30',
        value: 29.8,
        tolerance: 10,
        significance: 'Secondary Si confirmation'
      }
    ]
  },

  // --- KRYPTON (Trace atmospheric) ---
  {
    element: 'Krypton',
    symbol: 'Kr',
    isotopes: [
      { massNumber: 78, exactMass: 77.920, abundance: 0.35 },
      { massNumber: 80, exactMass: 79.916, abundance: 2.28 },
      { massNumber: 82, exactMass: 81.913, abundance: 11.58 },
      { massNumber: 83, exactMass: 82.914, abundance: 11.49 },
      { massNumber: 84, exactMass: 83.912, abundance: 57.00 },
      { massNumber: 86, exactMass: 85.911, abundance: 17.30 }
    ],
    diagnosticRatios: [
      {
        ratio: '84/86',
        value: 3.29,
        tolerance: 5,
        significance: 'Unique Kr isotope pattern'
      }
    ]
  },

  // --- XENON (Trace atmospheric / ion gauges) ---
  {
    element: 'Xenon',
    symbol: 'Xe',
    isotopes: [
      { massNumber: 129, exactMass: 128.905, abundance: 26.44 },
      { massNumber: 131, exactMass: 130.905, abundance: 21.18 },
      { massNumber: 132, exactMass: 131.904, abundance: 26.89 },
      { massNumber: 134, exactMass: 133.905, abundance: 10.44 },
      { massNumber: 136, exactMass: 135.907, abundance: 8.87 }
    ],
    diagnosticRatios: [
      {
        ratio: '132/129',
        value: 1.017,
        tolerance: 5,
        significance: 'Xe confirmation - rare in vacuum systems'
      }
    ]
  }
]

// =============================================================================
// COMMON RGA PEAKS - Fragment patterns for identification
// =============================================================================

export const COMMON_RGA_PEAKS: IsotopeFragment[] = [
  // === WATER H₂O (m/z 16, 17, 18) ===
  {
    mz: 18,
    formula: 'H₂O⁺',
    name: 'Wasserdampf (Molekularion)',
    nameEn: 'Water vapor (molecular ion)',
    abundance: 1.0,
    parentMolecule: 'H₂O',
    ionizationType: 'M+',
    typicalSources: ['Adsorbiertes Wasser', 'Ausgasung', 'Luftfeuchtigkeit'],
    source: 'NIST'
  },
  {
    mz: 17,
    formula: 'OH⁺',
    name: 'Hydroxyl (Fragment)',
    nameEn: 'Hydroxyl (fragment)',
    abundance: 0.23,  // Typical H₂O fragmentation pattern
    parentMolecule: 'H₂O',
    ionizationType: 'fragment',
    typicalSources: ['H₂O Fragmentierung'],
    source: 'NIST'
  },
  {
    mz: 16,
    formula: 'O⁺',
    name: 'Sauerstoff-Atom',
    nameEn: 'Oxygen atom',
    abundance: 0.01,
    parentMolecule: 'H₂O',
    ionizationType: 'fragment',
    typicalSources: ['H₂O Fragmentierung', 'O₂ Fragmentierung'],
    source: 'NIST'
  },
  {
    mz: 19,
    formula: 'H₃O⁺',
    name: 'Hydronium (Sekundärreaktion)',
    nameEn: 'Hydronium (secondary reaction)',
    abundance: 0.01,
    parentMolecule: 'H₂O',
    ionizationType: 'fragment',
    typicalSources: ['Ionen-Molekül-Reaktion bei hohem Druck'],
    source: 'NIST'
  },

  // === HYDROGEN H₂ (m/z 1, 2) ===
  {
    mz: 2,
    formula: 'H₂⁺',
    name: 'Wasserstoff',
    nameEn: 'Hydrogen',
    abundance: 1.0,
    ionizationType: 'M+',
    typicalSources: ['Ausgasung', 'Permeation durch Metall', 'Baked System'],
    source: 'NIST'
  },
  {
    mz: 1,
    formula: 'H⁺',
    name: 'Wasserstoff-Ion',
    nameEn: 'Hydrogen ion',
    abundance: 0.03,
    parentMolecule: 'H₂',
    ionizationType: 'fragment',
    typicalSources: ['H₂ Fragmentierung'],
    source: 'NIST'
  },

  // === CARBON DIOXIDE CO₂ (m/z 12, 16, 22, 28, 44, 45, 46) ===
  {
    mz: 44,
    formula: 'CO₂⁺',
    name: 'Kohlendioxid',
    nameEn: 'Carbon dioxide',
    abundance: 1.0,
    parentMolecule: 'CO₂',
    ionizationType: 'M+',
    typicalSources: ['Luft', 'Ausgasung', 'Verbrennung'],
    source: 'NIST'
  },
  {
    mz: 45,
    formula: '¹³CO₂⁺',
    name: 'CO₂ mit ¹³C-Isotop',
    nameEn: 'CO₂ with ¹³C isotope',
    abundance: 0.012,
    isotopeShift: 1,
    parentMolecule: 'CO₂',
    ionizationType: 'M+',
    typicalSources: ['Natürliches ¹³C'],
    source: 'NIST'
  },
  {
    mz: 28,
    formula: 'CO⁺',
    name: 'Kohlenmonoxid (CO₂-Fragment)',
    nameEn: 'Carbon monoxide (CO₂ fragment)',
    abundance: 0.11,
    parentMolecule: 'CO₂',
    ionizationType: 'fragment',
    typicalSources: ['CO₂ Dissoziation'],
    source: 'NIST'
  },
  {
    mz: 22,
    formula: 'CO₂²⁺',
    name: 'CO₂ doppelt ionisiert',
    nameEn: 'CO₂ doubly charged',
    abundance: 0.02,
    parentMolecule: 'CO₂',
    ionizationType: 'doubly_charged',
    typicalSources: ['Hohe Elektronenenergie'],
    source: 'NIST'
  },

  // === NITROGEN N₂ / AIR LEAK (m/z 14, 28, 29) ===
  {
    mz: 28,
    formula: 'N₂⁺',
    name: 'Stickstoff',
    nameEn: 'Nitrogen',
    abundance: 1.0,
    ionizationType: 'M+',
    typicalSources: ['Luftleck', 'N₂-Spülung'],
    source: 'NIST'
  },
  {
    mz: 14,
    formula: 'N⁺',
    name: 'Stickstoff-Atom',
    nameEn: 'Nitrogen atom',
    abundance: 0.072,
    parentMolecule: 'N₂',
    ionizationType: 'fragment',
    typicalSources: ['N₂ Fragmentierung'],
    source: 'NIST'
  },
  {
    mz: 29,
    formula: '¹⁴N¹⁵N⁺',
    name: 'N₂ mit ¹⁵N-Isotop',
    nameEn: 'N₂ with ¹⁵N isotope',
    abundance: 0.0073,
    isotopeShift: 1,
    parentMolecule: 'N₂',
    ionizationType: 'M+',
    typicalSources: ['Natürliches ¹⁵N'],
    source: 'NIST'
  },

  // === OXYGEN O₂ (m/z 16, 32, 34) ===
  {
    mz: 32,
    formula: 'O₂⁺',
    name: 'Sauerstoff',
    nameEn: 'Oxygen',
    abundance: 1.0,
    ionizationType: 'M+',
    typicalSources: ['Luftleck'],
    source: 'NIST'
  },
  {
    mz: 16,
    formula: 'O⁺',
    name: 'Sauerstoff-Atom',
    nameEn: 'Oxygen atom',
    abundance: 0.037,
    parentMolecule: 'O₂',
    ionizationType: 'fragment',
    typicalSources: ['O₂ Fragmentierung'],
    source: 'NIST'
  },
  {
    mz: 34,
    formula: '¹⁶O¹⁸O⁺',
    name: 'O₂ mit ¹⁸O-Isotop',
    nameEn: 'O₂ with ¹⁸O isotope',
    abundance: 0.004,
    isotopeShift: 2,
    parentMolecule: 'O₂',
    ionizationType: 'M+',
    typicalSources: ['Natürliches ¹⁸O'],
    source: 'NIST'
  },

  // === ARGON Ar (m/z 20, 36, 38, 40) ===
  {
    mz: 40,
    formula: 'Ar⁺',
    name: 'Argon',
    nameEn: 'Argon',
    abundance: 1.0,
    ionizationType: 'M+',
    typicalSources: ['Luftleck'],
    source: 'NIST'
  },
  {
    mz: 20,
    formula: 'Ar²⁺',
    name: 'Argon doppelt ionisiert',
    nameEn: 'Argon doubly charged',
    abundance: 0.12,
    parentMolecule: 'Ar',
    ionizationType: 'doubly_charged',
    typicalSources: ['Hohe Elektronenenergie'],
    source: 'NIST'
  },
  {
    mz: 36,
    formula: '³⁶Ar⁺',
    name: 'Argon-36 Isotop',
    nameEn: 'Argon-36 isotope',
    abundance: 0.00337,
    isotopeShift: -4,
    parentMolecule: 'Ar',
    ionizationType: 'M+',
    typicalSources: ['Natürliches ³⁶Ar'],
    source: 'NIST'
  },

  // === METHANE CH₄ (m/z 12-16) ===
  {
    mz: 16,
    formula: 'CH₄⁺',
    name: 'Methan',
    nameEn: 'Methane',
    abundance: 1.0,
    parentMolecule: 'CH₄',
    ionizationType: 'M+',
    typicalSources: ['Pumpenöl-Zersetzung', 'Organische Kontamination'],
    source: 'NIST'
  },
  {
    mz: 15,
    formula: 'CH₃⁺',
    name: 'Methyl-Radikal',
    nameEn: 'Methyl radical',
    abundance: 0.85,
    parentMolecule: 'CH₄',
    ionizationType: 'fragment',
    typicalSources: ['CH₄ Fragmentierung'],
    source: 'NIST'
  },
  {
    mz: 14,
    formula: 'CH₂⁺',
    name: 'Methylen',
    nameEn: 'Methylene',
    abundance: 0.09,
    parentMolecule: 'CH₄',
    ionizationType: 'fragment',
    typicalSources: ['CH₄ Fragmentierung'],
    source: 'NIST'
  },
  {
    mz: 13,
    formula: 'CH⁺',
    name: 'Methylidin',
    nameEn: 'Methylidyne',
    abundance: 0.04,
    parentMolecule: 'CH₄',
    ionizationType: 'fragment',
    typicalSources: ['CH₄ Fragmentierung'],
    source: 'NIST'
  },

  // === OIL CONTAMINATION (Δ14 series) ===
  {
    mz: 41,
    formula: 'C₃H₅⁺',
    name: 'Allyl (Öl-Marker)',
    nameEn: 'Allyl (oil marker)',
    abundance: 0.7,
    ionizationType: 'fragment',
    typicalSources: ['Pumpenöl', 'Kohlenwasserstoffe'],
    source: 'Common RGA signature'
  },
  {
    mz: 43,
    formula: 'C₃H₇⁺',
    name: 'Propyl (Öl/Aceton)',
    nameEn: 'Propyl (oil/acetone)',
    abundance: 0.9,
    ionizationType: 'fragment',
    typicalSources: ['Pumpenöl', 'Aceton'],
    source: 'Common RGA signature'
  },
  {
    mz: 55,
    formula: 'C₄H₇⁺',
    name: 'Butenyl (Öl-Marker)',
    nameEn: 'Butenyl (oil marker)',
    abundance: 0.85,
    ionizationType: 'fragment',
    typicalSources: ['Pumpenöl'],
    source: 'Common RGA signature'
  },
  {
    mz: 57,
    formula: 'C₄H₉⁺',
    name: 'Butyl (Öl-Hauptmarker)',
    nameEn: 'Butyl (oil main marker)',
    abundance: 1.0,
    ionizationType: 'fragment',
    typicalSources: ['Pumpenöl', 'Mineralöl'],
    source: 'Common RGA signature'
  },
  {
    mz: 69,
    formula: 'C₅H₉⁺',
    name: 'Pentenyl (Öl)',
    nameEn: 'Pentenyl (oil)',
    abundance: 0.6,
    ionizationType: 'fragment',
    typicalSources: ['Pumpenöl'],
    source: 'Common RGA signature'
  },
  {
    mz: 71,
    formula: 'C₅H₁₁⁺',
    name: 'Pentyl (Turbo-Öl)',
    nameEn: 'Pentyl (turbo oil)',
    abundance: 0.8,
    ionizationType: 'fragment',
    typicalSources: ['Turbopumpenöl'],
    source: 'Common RGA signature'
  },
  {
    mz: 83,
    formula: 'C₆H₁₁⁺',
    name: 'Hexenyl (Öl)',
    nameEn: 'Hexenyl (oil)',
    abundance: 0.4,
    ionizationType: 'fragment',
    typicalSources: ['Schweres Öl'],
    source: 'Common RGA signature'
  },
  {
    mz: 85,
    formula: 'C₆H₁₃⁺',
    name: 'Hexyl (Öl)',
    nameEn: 'Hexyl (oil)',
    abundance: 0.35,
    ionizationType: 'fragment',
    typicalSources: ['Schweres Öl'],
    source: 'Common RGA signature'
  },

  // === SILICONE / DC705 ===
  {
    mz: 73,
    formula: '(CH₃)₃Si⁺',
    name: 'Trimethylsilyl (Silikon)',
    nameEn: 'Trimethylsilyl (silicone)',
    abundance: 1.0,
    ionizationType: 'fragment',
    typicalSources: ['Silikonfett', 'DC705', 'PDMS'],
    source: 'Common RGA signature'
  },
  {
    mz: 147,
    formula: '(CH₃)₅Si₂O⁺',
    name: 'Pentamethyldisiloxanyl',
    nameEn: 'Pentamethyldisiloxanyl',
    abundance: 0.4,
    ionizationType: 'fragment',
    typicalSources: ['PDMS', 'Silikonöl'],
    source: 'Common RGA signature'
  },

  // === SOLVENTS ===
  {
    mz: 31,
    formula: 'CH₃O⁺',
    name: 'Methanol-Fragment',
    nameEn: 'Methanol fragment',
    abundance: 1.0,
    parentMolecule: 'CH₃OH',
    ionizationType: 'fragment',
    typicalSources: ['Methanol', 'Ethanol'],
    source: 'NIST'
  },
  {
    mz: 45,
    formula: 'C₂H₅O⁺',
    name: 'Ethoxy-Fragment (IPA)',
    nameEn: 'Ethoxy fragment (IPA)',
    abundance: 1.0,
    parentMolecule: 'C₃H₈O',
    ionizationType: 'fragment',
    typicalSources: ['Isopropanol'],
    source: 'NIST'
  },
  {
    mz: 58,
    formula: 'C₃H₆O⁺',
    name: 'Aceton',
    nameEn: 'Acetone',
    abundance: 0.3,
    parentMolecule: 'C₃H₆O',
    ionizationType: 'M+',
    typicalSources: ['Aceton'],
    source: 'NIST'
  },

  // === CHLORINATED COMPOUNDS ===
  {
    mz: 35,
    formula: '³⁵Cl⁺',
    name: 'Chlor-35',
    nameEn: 'Chlorine-35',
    abundance: 1.0,
    ionizationType: 'fragment',
    typicalSources: ['HCl', 'TCE', 'DCM'],
    source: 'NIST'
  },
  {
    mz: 37,
    formula: '³⁷Cl⁺',
    name: 'Chlor-37 Isotop',
    nameEn: 'Chlorine-37 isotope',
    abundance: 0.32,
    isotopeShift: 2,
    ionizationType: 'fragment',
    typicalSources: ['HCl', 'TCE', 'DCM'],
    source: 'NIST'
  },
  {
    mz: 49,
    formula: 'CH₂³⁵Cl⁺',
    name: 'Dichlormethan-Fragment',
    nameEn: 'Dichloromethane fragment',
    abundance: 1.0,
    parentMolecule: 'CH₂Cl₂',
    ionizationType: 'fragment',
    typicalSources: ['Dichlormethan'],
    source: 'NIST'
  },
  {
    mz: 51,
    formula: 'CH₂³⁷Cl⁺',
    name: 'DCM-Fragment (³⁷Cl)',
    nameEn: 'DCM fragment (³⁷Cl)',
    abundance: 0.32,
    isotopeShift: 2,
    parentMolecule: 'CH₂Cl₂',
    ionizationType: 'fragment',
    typicalSources: ['Dichlormethan'],
    source: 'NIST'
  },

  // === FLUORINATED COMPOUNDS ===
  {
    mz: 69,
    formula: 'CF₃⁺',
    name: 'Trifluormethyl (Fomblin)',
    nameEn: 'Trifluoromethyl (Fomblin)',
    abundance: 1.0,
    ionizationType: 'fragment',
    typicalSources: ['Fomblin', 'CF₄', 'PFPE-Öle'],
    source: 'NIST'
  },
  {
    mz: 119,
    formula: 'C₂F₅⁺',
    name: 'Pentafluorethyl',
    nameEn: 'Pentafluoroethyl',
    abundance: 0.8,
    parentMolecule: 'C₂F₆',
    ionizationType: 'fragment',
    typicalSources: ['C₂F₆', 'Halbleiter-Prozess'],
    source: 'NIST'
  },

  // === SULFUR COMPOUNDS ===
  {
    mz: 34,
    formula: 'H₂S⁺',
    name: 'Schwefelwasserstoff',
    nameEn: 'Hydrogen sulfide',
    abundance: 1.0,
    parentMolecule: 'H₂S',
    ionizationType: 'M+',
    typicalSources: ['H₂S', 'Schwefelhaltiges Wasser'],
    source: 'NIST'
  },
  {
    mz: 33,
    formula: 'HS⁺',
    name: 'Thiolyl',
    nameEn: 'Thiolyl',
    abundance: 0.42,
    parentMolecule: 'H₂S',
    ionizationType: 'fragment',
    typicalSources: ['H₂S'],
    source: 'NIST'
  },
  {
    mz: 64,
    formula: 'SO₂⁺',
    name: 'Schwefeldioxid',
    nameEn: 'Sulfur dioxide',
    abundance: 1.0,
    parentMolecule: 'SO₂',
    ionizationType: 'M+',
    typicalSources: ['SO₂', 'Schwefelverbrennung'],
    source: 'NIST'
  },
  {
    mz: 48,
    formula: 'SO⁺',
    name: 'Schwefelmonoxid',
    nameEn: 'Sulfur monoxide',
    abundance: 0.49,
    parentMolecule: 'SO₂',
    ionizationType: 'fragment',
    typicalSources: ['SO₂'],
    source: 'NIST'
  }
]

// =============================================================================
// FRAGMENT PATTERNS - Complete fragmentation patterns for common molecules
// =============================================================================

export const FRAGMENT_PATTERNS: FragmentPattern[] = [
  {
    molecule: 'Water',
    formula: 'H₂O',
    molecularWeight: 18,
    basePeak: 18,
    fragments: [
      { mz: 18, formula: 'H₂O⁺', relativeIntensity: 100, assignment: 'Molekularion' },
      { mz: 17, formula: 'OH⁺', relativeIntensity: 23, assignment: 'Fragment' },
      { mz: 16, formula: 'O⁺', relativeIntensity: 1, assignment: 'Fragment' }
    ],
    source: 'NIST'
  },
  {
    molecule: 'Nitrogen',
    formula: 'N₂',
    molecularWeight: 28,
    basePeak: 28,
    fragments: [
      { mz: 28, formula: 'N₂⁺', relativeIntensity: 100, assignment: 'Molekularion' },
      { mz: 14, formula: 'N⁺', relativeIntensity: 7.2, assignment: 'Fragment' },
      { mz: 29, formula: '¹⁴N¹⁵N⁺', relativeIntensity: 0.73, assignment: 'Isotop' }
    ],
    source: 'NIST'
  },
  {
    molecule: 'Carbon Dioxide',
    formula: 'CO₂',
    molecularWeight: 44,
    basePeak: 44,
    fragments: [
      { mz: 44, formula: 'CO₂⁺', relativeIntensity: 100, assignment: 'Molekularion' },
      { mz: 28, formula: 'CO⁺', relativeIntensity: 11, assignment: 'Fragment' },
      { mz: 16, formula: 'O⁺', relativeIntensity: 8, assignment: 'Fragment' },
      { mz: 12, formula: 'C⁺', relativeIntensity: 6, assignment: 'Fragment' },
      { mz: 45, formula: '¹³CO₂⁺', relativeIntensity: 1.2, assignment: 'Isotop' },
      { mz: 22, formula: 'CO₂²⁺', relativeIntensity: 2, assignment: 'Doppelt ionisiert' }
    ],
    source: 'NIST'
  },
  {
    molecule: 'Argon',
    formula: 'Ar',
    molecularWeight: 40,
    basePeak: 40,
    fragments: [
      { mz: 40, formula: '⁴⁰Ar⁺', relativeIntensity: 100, assignment: 'Hauptisotop' },
      { mz: 20, formula: 'Ar²⁺', relativeIntensity: 12, assignment: 'Doppelt ionisiert' },
      { mz: 36, formula: '³⁶Ar⁺', relativeIntensity: 0.34, assignment: 'Isotop' },
      { mz: 38, formula: '³⁸Ar⁺', relativeIntensity: 0.06, assignment: 'Isotop' }
    ],
    source: 'NIST'
  },
  {
    molecule: 'Methane',
    formula: 'CH₄',
    molecularWeight: 16,
    basePeak: 16,
    fragments: [
      { mz: 16, formula: 'CH₄⁺', relativeIntensity: 100, assignment: 'Molekularion' },
      { mz: 15, formula: 'CH₃⁺', relativeIntensity: 85, assignment: 'Fragment' },
      { mz: 14, formula: 'CH₂⁺', relativeIntensity: 9, assignment: 'Fragment' },
      { mz: 13, formula: 'CH⁺', relativeIntensity: 4, assignment: 'Fragment' },
      { mz: 12, formula: 'C⁺', relativeIntensity: 1, assignment: 'Fragment' }
    ],
    source: 'NIST'
  },
  {
    molecule: 'Carbon Monoxide',
    formula: 'CO',
    molecularWeight: 28,
    basePeak: 28,
    fragments: [
      { mz: 28, formula: 'CO⁺', relativeIntensity: 100, assignment: 'Molekularion' },
      { mz: 12, formula: 'C⁺', relativeIntensity: 4.5, assignment: 'Fragment' },
      { mz: 16, formula: 'O⁺', relativeIntensity: 2, assignment: 'Fragment' },
      { mz: 29, formula: '¹³CO⁺', relativeIntensity: 1.1, assignment: 'Isotop' }
    ],
    source: 'NIST'
  },
  {
    molecule: 'Oxygen',
    formula: 'O₂',
    molecularWeight: 32,
    basePeak: 32,
    fragments: [
      { mz: 32, formula: 'O₂⁺', relativeIntensity: 100, assignment: 'Molekularion' },
      { mz: 16, formula: 'O⁺', relativeIntensity: 3.7, assignment: 'Fragment' },
      { mz: 34, formula: '¹⁶O¹⁸O⁺', relativeIntensity: 0.4, assignment: 'Isotop' }
    ],
    source: 'NIST'
  },
  {
    molecule: 'Hydrogen Sulfide',
    formula: 'H₂S',
    molecularWeight: 34,
    basePeak: 34,
    fragments: [
      { mz: 34, formula: 'H₂S⁺', relativeIntensity: 100, assignment: 'Molekularion' },
      { mz: 33, formula: 'HS⁺', relativeIntensity: 42, assignment: 'Fragment' },
      { mz: 32, formula: 'S⁺', relativeIntensity: 22, assignment: 'Fragment' },
      { mz: 36, formula: 'H₂³⁴S⁺', relativeIntensity: 4.5, assignment: 'Isotop' }
    ],
    source: 'NIST'
  },
  {
    molecule: 'Acetone',
    formula: 'C₃H₆O',
    molecularWeight: 58,
    basePeak: 43,
    fragments: [
      { mz: 43, formula: 'CH₃CO⁺', relativeIntensity: 100, assignment: 'Base Peak' },
      { mz: 58, formula: 'C₃H₆O⁺', relativeIntensity: 30, assignment: 'Molekularion' },
      { mz: 15, formula: 'CH₃⁺', relativeIntensity: 25, assignment: 'Fragment' },
      { mz: 42, formula: 'C₂H₂O⁺', relativeIntensity: 8, assignment: 'Fragment' }
    ],
    source: 'NIST'
  }
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get isotope ratio data for an element
 */
export function getIsotopeRatio(symbol: string): IsotopeRatio | undefined {
  return ISOTOPE_RATIOS.find(r => r.symbol === symbol)
}

/**
 * Get all fragments for a given m/z value
 */
export function getFragmentsAtMass(mz: number): IsotopeFragment[] {
  return COMMON_RGA_PEAKS.filter(f => f.mz === mz)
}

/**
 * Get fragment pattern for a molecule
 */
export function getFragmentPattern(molecule: string): FragmentPattern | undefined {
  return FRAGMENT_PATTERNS.find(p =>
    p.molecule.toLowerCase() === molecule.toLowerCase() ||
    p.formula === molecule
  )
}

/**
 * Calculate expected isotope peak intensity based on natural abundance
 * @param basePeakIntensity - Intensity of the main isotope peak
 * @param element - Element symbol (e.g., 'Ar', 'Cl')
 * @param mainMass - Mass number of main isotope
 * @param targetMass - Mass number of target isotope
 * @returns Expected intensity of target isotope peak
 */
export function calculateIsotopePeakIntensity(
  basePeakIntensity: number,
  element: string,
  mainMass: number,
  targetMass: number
): number | null {
  const ratio = getIsotopeRatio(element)
  if (!ratio) return null

  const mainIsotope = ratio.isotopes.find(i => i.massNumber === mainMass)
  const targetIsotope = ratio.isotopes.find(i => i.massNumber === targetMass)

  if (!mainIsotope || !targetIsotope) return null

  return basePeakIntensity * (targetIsotope.abundance / mainIsotope.abundance)
}

/**
 * Check if observed ratio matches expected isotope ratio
 * @param observedRatio - Measured peak ratio
 * @param element - Element symbol
 * @param ratioString - Ratio definition (e.g., '35/37' for Cl)
 * @returns Match result with confidence
 */
export function checkIsotopeRatio(
  observedRatio: number,
  element: string,
  ratioString: string
): { matches: boolean; deviation: number; expectedRatio: number; significance: string } | null {
  const isotopeData = getIsotopeRatio(element)
  if (!isotopeData) return null

  const diagnosticRatio = isotopeData.diagnosticRatios.find(r => r.ratio === ratioString)
  if (!diagnosticRatio) return null

  const deviation = Math.abs((observedRatio - diagnosticRatio.value) / diagnosticRatio.value) * 100
  const matches = deviation <= diagnosticRatio.tolerance

  return {
    matches,
    deviation,
    expectedRatio: diagnosticRatio.value,
    significance: diagnosticRatio.significance
  }
}

/**
 * Identify possible compounds at a given m/z with confidence scores
 * @param mz - Mass to charge ratio
 * @param intensity - Optional intensity for context
 * @returns Array of possible assignments with confidence
 */
export function identifyPeak(mz: number, _intensity?: number): {
  assignment: IsotopeFragment
  confidence: number
  reason: string
}[] {
  const fragments = getFragmentsAtMass(mz)

  return fragments.map(fragment => {
    let confidence = 0.5  // Base confidence
    let reason = 'Masse stimmt überein'

    // Higher confidence for molecular ions
    if (fragment.ionizationType === 'M+') {
      confidence += 0.2
      reason = 'Molekularion'
    }

    // Higher confidence for common sources
    if (fragment.typicalSources.some(s =>
      s.toLowerCase().includes('luft') ||
      s.toLowerCase().includes('wasser') ||
      s.toLowerCase().includes('ausgasung')
    )) {
      confidence += 0.1
      reason += ', häufige Quelle'
    }

    return {
      assignment: fragment,
      confidence: Math.min(confidence, 1.0),
      reason
    }
  }).sort((a, b) => b.confidence - a.confidence)
}

/**
 * Detect air leak signature by checking N₂/O₂/Ar ratios
 * @param peaks - Map of m/z to intensity
 * @returns Air leak detection result
 */
export function detectAirLeak(peaks: Map<number, number>): {
  isAirLeak: boolean
  confidence: number
  evidence: string[]
} {
  const evidence: string[] = []
  let score = 0

  const n2 = peaks.get(28) || 0
  const o2 = peaks.get(32) || 0
  const ar = peaks.get(40) || 0

  // Check N₂/O₂ ratio (should be ~3.7 for air)
  if (n2 > 0 && o2 > 0) {
    const n2o2Ratio = n2 / o2
    if (n2o2Ratio >= 3.2 && n2o2Ratio <= 4.2) {
      score += 0.4
      evidence.push(`N₂/O₂ = ${n2o2Ratio.toFixed(2)} (erwartet: 3.7)`)
    }
  }

  // Check Ar presence relative to N₂
  if (ar > 0 && n2 > 0) {
    const arN2Ratio = ar / n2
    if (arN2Ratio >= 0.008 && arN2Ratio <= 0.015) {
      score += 0.3
      evidence.push(`Ar/N₂ = ${(arN2Ratio * 100).toFixed(2)}% (erwartet: ~1%)`)
    }
  }

  // Check for ⁴⁰Ar/³⁶Ar ratio
  const ar36 = peaks.get(36) || 0
  if (ar > 0 && ar36 > 0) {
    const arRatio = ar / ar36
    const arCheck = checkIsotopeRatio(arRatio, 'Ar', '40/36')
    if (arCheck?.matches) {
      score += 0.3
      evidence.push(`⁴⁰Ar/³⁶Ar = ${arRatio.toFixed(1)} bestätigt atmosphärisches Ar`)
    }
  }

  return {
    isAirLeak: score >= 0.5,
    confidence: Math.min(score, 1.0),
    evidence
  }
}

/**
 * Detect oil contamination by checking hydrocarbon pattern
 * @param peaks - Map of m/z to intensity
 * @returns Oil contamination detection result
 */
export function detectOilContamination(peaks: Map<number, number>): {
  isOilContaminated: boolean
  oilType: 'mineral' | 'turbo' | 'silicone' | 'fluorinated' | 'unknown' | null
  confidence: number
  evidence: string[]
} {
  const evidence: string[] = []
  let score = 0
  let oilType: 'mineral' | 'turbo' | 'silicone' | 'fluorinated' | 'unknown' | null = null

  // Δ14 hydrocarbon series (mineral oil)
  const m41 = peaks.get(41) || 0
  const m43 = peaks.get(43) || 0
  const m55 = peaks.get(55) || 0
  const m57 = peaks.get(57) || 0
  const m69 = peaks.get(69) || 0
  const m71 = peaks.get(71) || 0

  // Check for mineral oil pattern
  if (m57 > 0 && m43 > 0 && m41 > 0) {
    const ratio43_57 = m43 / m57
    const ratio41_57 = m41 / m57
    if (ratio43_57 > 0.5 && ratio41_57 > 0.4) {
      score += 0.4
      oilType = 'mineral'
      const peaksFound = [41, 43, m55 > 0 ? 55 : null, 57].filter(Boolean).join(', ')
      evidence.push(`Δ14 KW-Serie (m/z ${peaksFound}) vorhanden`)
    }
  }

  // Check for turbo pump oil (higher masses)
  if (m71 > 0 && m57 > 0) {
    const ratio71_57 = m71 / m57
    if (ratio71_57 > 0.3) {
      score += 0.2
      oilType = 'turbo'
      evidence.push('Turbo-Öl-Signatur (m/z 71) erkannt')
    }
  }

  // Check for silicone (m/z 73, 147)
  const m73 = peaks.get(73) || 0
  const m147 = peaks.get(147) || 0
  if (m73 > 0) {
    score += 0.3
    oilType = 'silicone'
    evidence.push('Silikon-Marker (m/z 73) vorhanden')
    if (m147 > 0) {
      evidence.push('PDMS bestätigt durch m/z 147')
    }
  }

  // Check for fluorinated oil (Fomblin) - m/z 69 without hydrocarbon pattern
  if (m69 > 0 && m43 === 0 && m57 === 0) {
    score += 0.3
    oilType = 'fluorinated'
    evidence.push('PFPE/Fomblin-Signatur (m/z 69 ohne KW)')
  }

  return {
    isOilContaminated: score >= 0.3,
    oilType,
    confidence: Math.min(score, 1.0),
    evidence
  }
}
