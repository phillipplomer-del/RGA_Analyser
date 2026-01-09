/**
 * Konsolidierte Gas-Bibliothek für RGA-Spektrenanalyse
 * Basierend auf: CERN CAS Tutorial, NIST WebBook, Pfeiffer Vacuum,
 * Hiden Analytical, SRS Application Notes, MKS Instruments
 */

export interface GasSpecies {
  key: string                              // Eindeutiger Schlüssel: 'H2O', 'N2', 'CO'
  name: string                             // Deutscher Name
  nameEn: string                           // Englischer Name
  formula: string                          // Unicode Formel: 'H₂O'
  mainMass: number                         // Hauptpeak (Base Peak)
  crackingPattern: Record<number, number>  // m/z: relative Intensität (Base Peak = 100)
  relativeSensitivity: number              // Relativ zu N₂ = 1.0
  category: GasCategory
  notes?: string[]                         // Zusätzliche Hinweise
}

export type GasCategory =
  | 'permanent'      // Permanentgase (H₂, N₂, O₂, Ar, etc.)
  | 'noble'          // Edelgase (He, Ne, Ar, Kr, Xe)
  | 'water'          // Wasser und Hydroxyl
  | 'carbon_oxide'   // CO, CO₂
  | 'hydrocarbon'    // Kohlenwasserstoffe
  | 'solvent'        // Lösemittel
  | 'oil'            // Pumpenöle
  | 'halogen'        // Halogenverbindungen
  | 'sulfur'         // Schwefelverbindungen
  | 'nitrogen_compound' // Stickstoffverbindungen (NH₃, etc.)
  | 'silicone'       // Silikon/PDMS

/**
 * Umfassende Gas-Bibliothek mit ~45 Spezies
 * Cracking Patterns bei 70 eV Elektronenstoßionisation
 */
export const GAS_LIBRARY: GasSpecies[] = [
  // ============================================
  // PERMANENTGASE UND EDELGASE
  // ============================================
  {
    key: 'H2',
    name: 'Wasserstoff',
    nameEn: 'Hydrogen',
    formula: 'H₂',
    mainMass: 2,
    crackingPattern: { 2: 100, 1: 5 },
    relativeSensitivity: 0.44,
    category: 'permanent',
    notes: ['Dominantes Restgas in ausgeheizten UHV-Systemen', 'Diffundiert durch Edelstahl']
  },
  {
    key: 'D2',
    name: 'Deuterium',
    nameEn: 'Deuterium',
    formula: 'D₂',
    mainMass: 4,
    crackingPattern: { 4: 100, 3: 15, 2: 5 },
    relativeSensitivity: 0.42,
    category: 'permanent',
    notes: ['⚠️ m/z 4 überlappt mit He', 'HD (m/z 3) als Marker für D/H-Gemische', 'Fusionsforschung (JET, ASDEX)', 'Präzision: ±1-2% mit Quadrupol-RGA']
  },
  {
    key: 'HD',
    name: 'Wasserstoff-Deuterium',
    nameEn: 'Hydrogen-Deuterium',
    formula: 'HD',
    mainMass: 3,
    crackingPattern: { 3: 100, 2: 30, 1: 8, 4: 2 },
    relativeSensitivity: 0.43,
    category: 'permanent',
    notes: ['Gebildet durch H/D-Austauschreaktionen', 'Wichtig für D/H-Verhältnis-Bestimmung', 'Unterscheidet D₂ von He bei m/z 4']
  },
  {
    key: 'He',
    name: 'Helium',
    nameEn: 'Helium',
    formula: 'He',
    mainMass: 4,
    crackingPattern: { 4: 100 },
    relativeSensitivity: 0.14,
    category: 'noble',
    notes: ['Lecktest-Tracergas', 'Permeiert durch Glas und Elastomere']
  },
  {
    key: 'Ne',
    name: 'Neon',
    nameEn: 'Neon',
    formula: 'Ne',
    mainMass: 20,
    crackingPattern: { 20: 100, 22: 9.9, 21: 0.3 },
    relativeSensitivity: 0.23,
    category: 'noble',
    notes: ['Isotope: ²⁰Ne (90.5%), ²²Ne (9.9%)', 'Verwechslung mit Ar²⁺ möglich']
  },
  {
    key: 'N2',
    name: 'Stickstoff',
    nameEn: 'Nitrogen',
    formula: 'N₂',
    mainMass: 28,
    crackingPattern: { 28: 100, 14: 7.2, 29: 0.7 },
    relativeSensitivity: 1.0,
    category: 'permanent',
    notes: ['Referenzgas für Sensitivität', '28/14 Ratio ~14 für reines N₂', 'Hauptkomponente der Luft (78%)']
  },
  {
    key: 'O2',
    name: 'Sauerstoff',
    nameEn: 'Oxygen',
    formula: 'O₂',
    mainMass: 32,
    crackingPattern: { 32: 100, 16: 11, 34: 0.4 },
    relativeSensitivity: 0.86,
    category: 'permanent',
    notes: ['Luftleck-Indikator', 'Kann an Oberflächen adsorbiert werden', '21% der Luft']
  },
  {
    key: 'Ar',
    name: 'Argon',
    nameEn: 'Argon',
    formula: 'Ar',
    mainMass: 40,
    crackingPattern: { 40: 100, 20: 14.6, 36: 0.34, 38: 0.06 },
    relativeSensitivity: 1.2,
    category: 'noble',
    notes: ['Ar²⁺ bei m/z 20 (10-15%)', 'Bester Luftleck-Beweis (chemisch inert)', '0.93% der Luft']
  },
  {
    key: 'Kr',
    name: 'Krypton',
    nameEn: 'Krypton',
    formula: 'Kr',
    mainMass: 84,
    crackingPattern: { 84: 100, 86: 30.5, 82: 20.3, 83: 11.5, 80: 2.3 },
    relativeSensitivity: 1.7,
    category: 'noble',
    notes: ['Isotopencluster 80-86']
  },
  {
    key: 'Xe',
    name: 'Xenon',
    nameEn: 'Xenon',
    formula: 'Xe',
    mainMass: 132,
    crackingPattern: { 132: 100, 129: 98, 131: 79, 134: 39, 136: 33, 130: 15 },
    relativeSensitivity: 3.0,
    category: 'noble',
    notes: ['Breites Isotopenmuster']
  },

  // ============================================
  // WASSER UND AUSGASUNG
  // ============================================
  {
    key: 'H2O',
    name: 'Wasser',
    nameEn: 'Water',
    formula: 'H₂O',
    mainMass: 18,
    crackingPattern: { 18: 100, 17: 23, 16: 1.5, 1: 0.5, 2: 0.3, 19: 0.06, 20: 0.2 },
    relativeSensitivity: 0.9,
    category: 'water',
    notes: ['Dominant in ungeheizten Systemen', '18/17 Ratio ~4.3', 'Desorbiert langsam von Wänden']
  },

  // ============================================
  // KOHLENSTOFFOXIDE
  // ============================================
  {
    key: 'CO',
    name: 'Kohlenmonoxid',
    nameEn: 'Carbon Monoxide',
    formula: 'CO',
    mainMass: 28,
    crackingPattern: { 28: 100, 12: 4.5, 16: 1.7, 14: 1.0, 29: 1.2 },
    relativeSensitivity: 1.05,
    category: 'carbon_oxide',
    notes: ['Nicht direkt von N₂ unterscheidbar!', 'Prüfe m/z 12 (C⁺)', 'Ausgasungsprodukt']
  },
  {
    key: 'CO2',
    name: 'Kohlendioxid',
    nameEn: 'Carbon Dioxide',
    formula: 'CO₂',
    mainMass: 44,
    crackingPattern: { 44: 100, 28: 10, 16: 10, 12: 8.7, 22: 1.9, 45: 1.1, 46: 0.4 },
    relativeSensitivity: 1.4,
    category: 'carbon_oxide',
    notes: ['CO₂²⁺ bei m/z 22', '28/44 Ratio variiert (5-15%)', 'Trägt zu m/z 28 bei']
  },

  // ============================================
  // KOHLENWASSERSTOFFE (LEICHT)
  // ============================================
  {
    key: 'CH4',
    name: 'Methan',
    nameEn: 'Methane',
    formula: 'CH₄',
    mainMass: 16,
    crackingPattern: { 16: 100, 15: 85, 14: 16, 13: 8, 12: 3.8, 1: 4, 17: 1.1 },
    relativeSensitivity: 1.6,
    category: 'hydrocarbon',
    notes: ['m/z 15 ist "sauberer" Marker (keine O⁺ Überlagerung)', 'Typische HC-Quelle']
  },
  {
    key: 'C2H2',
    name: 'Acetylen',
    nameEn: 'Acetylene',
    formula: 'C₂H₂',
    mainMass: 26,
    crackingPattern: { 26: 100, 25: 20, 13: 5, 27: 3, 54: 5 },
    relativeSensitivity: 1.8,
    category: 'hydrocarbon',
    notes: ['Schweißgas, HC-Fragment', 'Dimer C₄H₄⁺ bei m/z 54']
  },
  {
    key: 'C2H4',
    name: 'Ethen',
    nameEn: 'Ethylene',
    formula: 'C₂H₄',
    mainMass: 28,
    crackingPattern: { 28: 100, 27: 62, 26: 61, 25: 12, 14: 8 },
    relativeSensitivity: 1.9,
    category: 'hydrocarbon',
    notes: ['Kann m/z 28 verfälschen']
  },
  {
    key: 'C2H6',
    name: 'Ethan',
    nameEn: 'Ethane',
    formula: 'C₂H₆',
    mainMass: 28,
    crackingPattern: { 28: 100, 27: 33, 30: 26, 29: 22, 26: 23, 25: 3.5, 15: 4.4 },
    relativeSensitivity: 2.6,
    category: 'hydrocarbon',
    notes: ['Kann m/z 28 verfälschen', 'Fragment bei m/z 30']
  },
  {
    key: 'C3H8',
    name: 'Propan',
    nameEn: 'Propane',
    formula: 'C₃H₈',
    mainMass: 29,
    crackingPattern: { 29: 100, 28: 59, 27: 42, 44: 28, 43: 23, 41: 13, 39: 19, 15: 7 },
    relativeSensitivity: 2.4,
    category: 'hydrocarbon',
    notes: ['Peak bei m/z 44 wie CO₂!']
  },
  {
    key: 'C3H6',
    name: 'Propen',
    nameEn: 'Propylene',
    formula: 'C₃H₆',
    mainMass: 41,
    crackingPattern: { 41: 100, 39: 73, 42: 69, 27: 38, 40: 29 },
    relativeSensitivity: 2.2,
    category: 'hydrocarbon',
    notes: ['HC-Fragment, Öl-Zersetzung']
  },
  {
    key: 'Butane',
    name: 'Butan',
    nameEn: 'Butane',
    formula: 'C₄H₁₀',
    mainMass: 43,
    crackingPattern: { 43: 100, 29: 44, 27: 37, 28: 32, 41: 27, 58: 13, 42: 11, 39: 8 },
    relativeSensitivity: 2.6,
    category: 'hydrocarbon',
    notes: ['Kohlenwasserstoff', 'Parent bei m/z 58']
  },
  {
    key: 'Isobutane',
    name: 'Isobutan',
    nameEn: 'Isobutane',
    formula: 'i-C₄H₁₀',
    mainMass: 43,
    crackingPattern: { 43: 100, 41: 30, 42: 28, 27: 25, 29: 21, 39: 17, 58: 2 },
    relativeSensitivity: 2.6,
    category: 'hydrocarbon',
    notes: ['Verzweigter Kohlenwasserstoff']
  },

  // ============================================
  // LÖSEMITTEL
  // ============================================
  {
    key: 'Acetone',
    name: 'Aceton',
    nameEn: 'Acetone',
    formula: 'C₃H₆O',
    mainMass: 43,
    crackingPattern: { 43: 100, 58: 27, 15: 42, 27: 8 },
    relativeSensitivity: 3.6,
    category: 'solvent',
    notes: ['Reinigungsmittel', 'Base Peak 43 + Parent 58 unterscheidet von Öl']
  },
  {
    key: 'MEK',
    name: 'Methylethylketon',
    nameEn: 'Methyl Ethyl Ketone',
    formula: 'C₄H₈O',
    mainMass: 43,
    crackingPattern: { 43: 100, 72: 16, 29: 25, 27: 16, 57: 6 },
    relativeSensitivity: 3.8,
    category: 'solvent',
    notes: ['Lösemittel, Parent bei 72']
  },
  {
    key: 'Methanol',
    name: 'Methanol',
    nameEn: 'Methanol',
    formula: 'CH₃OH',
    mainMass: 31,
    crackingPattern: { 31: 100, 32: 67, 29: 65, 28: 3.4, 15: 14 },
    relativeSensitivity: 1.8,
    category: 'solvent',
    notes: ['Alkohol-Marker bei m/z 31']
  },
  {
    key: 'Ethanol',
    name: 'Ethanol',
    nameEn: 'Ethanol',
    formula: 'C₂H₅OH',
    mainMass: 31,
    crackingPattern: { 31: 100, 45: 52, 46: 22, 29: 30, 27: 22, 43: 10 },
    relativeSensitivity: 3.6,
    category: 'solvent',
    notes: ['Reinigungsmittel', 'Parent bei m/z 46']
  },
  {
    key: 'IPA',
    name: 'Isopropanol',
    nameEn: 'Isopropanol',
    formula: 'C₃H₇OH',
    mainMass: 45,
    crackingPattern: { 45: 100, 43: 17, 27: 16, 29: 10, 41: 7 },
    relativeSensitivity: 2.5,
    category: 'solvent',
    notes: ['IPA - häufiges Reinigungsmittel', 'Base Peak bei 45']
  },
  {
    key: 'Benzene',
    name: 'Benzol',
    nameEn: 'Benzene',
    formula: 'C₆H₆',
    mainMass: 78,
    crackingPattern: { 78: 100, 77: 22, 52: 19, 51: 19, 50: 17, 39: 12 },
    relativeSensitivity: 5.9,
    category: 'solvent',
    notes: ['Aromaten-Marker', 'Phenyl-Fragment bei 77']
  },
  {
    key: 'Toluene',
    name: 'Toluol',
    nameEn: 'Toluene',
    formula: 'C₇H₈',
    mainMass: 91,
    crackingPattern: { 91: 100, 92: 69, 65: 16, 51: 10, 39: 14 },
    relativeSensitivity: 6.2,
    category: 'solvent',
    notes: ['Tropylium-Kation (C₇H₇⁺) bei m/z 91', 'Aromaten-Marker', 'Base Peak bei 91, nicht Parent']
  },
  {
    key: 'TCE',
    name: 'Trichlorethylen',
    nameEn: 'Trichloroethylene',
    formula: 'C₂HCl₃',
    mainMass: 95,
    crackingPattern: { 95: 100, 97: 64, 60: 65, 35: 40, 47: 26, 130: 30, 132: 29 },
    relativeSensitivity: 3.0,
    category: 'solvent',
    notes: ['Chloriertes Lösemittel', 'Cl-Isotopenmuster (35/37 = 3:1)', 'WARNUNG: Korrodiert Aluminium!']
  },
  {
    key: 'DCM',
    name: 'Dichlormethan',
    nameEn: 'Dichloromethane',
    formula: 'CH₂Cl₂',
    mainMass: 49,
    crackingPattern: { 49: 100, 84: 65, 86: 42, 51: 33, 47: 15, 88: 7, 35: 12 },
    relativeSensitivity: 2.5,
    category: 'solvent',
    notes: ['Methylenchlorid', 'Cl-Isotopenmuster', 'Parent bei m/z 84/86/88']
  },
  {
    key: '111TCA',
    name: '1,1,1-Trichlorethan',
    nameEn: '1,1,1-Trichloroethane',
    formula: 'C₂H₃Cl₃',
    mainMass: 97,
    crackingPattern: { 97: 100, 99: 96, 61: 55, 63: 35, 26: 25, 27: 20 },
    relativeSensitivity: 2.8,
    category: 'solvent',
    notes: ['Chloriertes Lösemittel', 'CCl₃⁺ bei 117/119/121']
  },
  {
    key: 'Freon12',
    name: 'Freon 12',
    nameEn: 'Freon 12 (R-12)',
    formula: 'CCl₂F₂',
    mainMass: 85,
    crackingPattern: { 85: 100, 87: 32, 50: 16, 101: 10, 103: 3, 35: 8 },
    relativeSensitivity: 2.8,
    category: 'halogen',
    notes: ['Kältemittel', 'CClF₂⁺ bei 85/87', 'CF₂⁺ bei 50']
  },

  // ============================================
  // PUMPENÖLE
  // ============================================
  {
    key: 'MineralOil',
    name: 'Mineralöl (Vorpumpe)',
    nameEn: 'Mineral Oil (Forepump)',
    formula: 'CₓHᵧ',
    mainMass: 43,
    crackingPattern: { 43: 100, 41: 91, 57: 73, 55: 64, 71: 20, 29: 44, 27: 37, 39: 50 },
    relativeSensitivity: 4.0,
    category: 'oil',
    notes: ['Vorpumpenöl-Rückströmung', 'Δ14 amu Muster (41/55/69/83)', '"Lattenzaun"-Pattern']
  },
  {
    key: 'TurbopumpOil',
    name: 'Turbo-Pumpenöl',
    nameEn: 'Turbopump Oil',
    formula: 'CₓHᵧ',
    mainMass: 43,
    crackingPattern: { 43: 100, 57: 88, 41: 76, 55: 73, 71: 52, 69: 35, 85: 25 },
    relativeSensitivity: 4.0,
    category: 'oil',
    notes: ['Turbo-Öl Backstreaming', 'm/z 71 deutlich höher (~52%) als bei Vorpumpenöl (~20%)', 'Unterscheidungsmerkmal zu Vorpumpenöl']
  },
  {
    key: 'Fomblin',
    name: 'Fomblin/PFPE',
    nameEn: 'Fomblin/PFPE',
    formula: 'CF₃O(CF₂O)ₙ(CF₂CF₂O)ₘCF₃',
    mainMass: 69,
    crackingPattern: { 69: 100, 20: 28, 16: 16, 31: 9, 47: 15, 50: 12, 97: 8, 119: 5 },
    relativeSensitivity: 3.5,
    category: 'oil',
    notes: ['Perfluorpolyether (PFPE)', 'CF₃⁺ bei 69 ist Hauptmarker', 'KEINE Alkyl-Peaks (41/43/57)!']
  },
  {
    key: 'DC705',
    name: 'Diffusionspumpenöl DC705',
    nameEn: 'Diffusion Pump Oil DC705',
    formula: 'C₂₄H₅₀O₄Si₅',
    mainMass: 78,
    crackingPattern: { 78: 100, 76: 83, 39: 73, 43: 59, 91: 32, 73: 25 },
    relativeSensitivity: 4.0,
    category: 'oil',
    notes: ['Pentaphenyl-Trimethyltrisiloxan', 'm/z 73 (Trimethylsilyl) ist SILIKON-MARKER', 'Phenyl-Fragment bei m/z 78']
  },

  // ============================================
  // HALOGENVERBINDUNGEN
  // ============================================
  {
    key: 'HCl',
    name: 'Salzsäure',
    nameEn: 'Hydrochloric Acid',
    formula: 'HCl',
    mainMass: 36,
    crackingPattern: { 36: 100, 38: 32, 35: 17 },
    relativeSensitivity: 1.5,
    category: 'halogen',
    notes: ['Cl-Isotope: ³⁵Cl/³⁷Cl = 3:1', 'Prozesschemie']
  },
  {
    key: 'HF',
    name: 'Flusssäure',
    nameEn: 'Hydrofluoric Acid',
    formula: 'HF',
    mainMass: 20,
    crackingPattern: { 20: 100, 19: 90 },
    relativeSensitivity: 1.0,
    category: 'halogen',
    notes: ['Fluorchemie', 'Kann mit Ne/Ar²⁺ überlappen']
  },
  {
    key: 'CF4',
    name: 'Tetrafluormethan',
    nameEn: 'Carbon Tetrafluoride',
    formula: 'CF₄',
    mainMass: 69,
    crackingPattern: { 69: 100, 50: 12, 31: 7 },
    relativeSensitivity: 2.0,
    category: 'halogen',
    notes: ['Ätzgas', 'CF₃⁺ bei 69']
  },
  {
    key: 'SF6',
    name: 'Schwefelhexafluorid',
    nameEn: 'Sulfur Hexafluoride',
    formula: 'SF₆',
    mainMass: 127,
    crackingPattern: { 127: 100, 89: 25, 70: 15, 51: 10, 32: 8 },
    relativeSensitivity: 2.5,
    category: 'halogen',
    notes: ['Isoliergas', 'SF₅⁺ bei 127']
  },
  {
    key: 'HBr',
    name: 'Bromwasserstoff',
    nameEn: 'Hydrogen Bromide',
    formula: 'HBr',
    mainMass: 80,
    crackingPattern: { 80: 100, 82: 98, 79: 50, 81: 49 },
    relativeSensitivity: 1.8,
    category: 'halogen',
    notes: ['Br-Isotope: ⁷⁹Br/⁸¹Br ≈ 1:1', 'Prozesschemie']
  },
  {
    key: 'Cl2',
    name: 'Chlor',
    nameEn: 'Chlorine',
    formula: 'Cl₂',
    mainMass: 70,
    crackingPattern: { 70: 100, 72: 65, 35: 75, 37: 24, 74: 10 },
    relativeSensitivity: 1.5,
    category: 'halogen',
    notes: ['Cl-Isotope: ³⁵Cl/³⁷Cl = 3:1', 'Ätzgas']
  },
  {
    key: 'BCl3',
    name: 'Bortrichlorid',
    nameEn: 'Boron Trichloride',
    formula: 'BCl₃',
    mainMass: 117,
    crackingPattern: { 117: 100, 115: 33, 119: 32, 82: 40, 80: 13, 47: 20 },
    relativeSensitivity: 2.2,
    category: 'halogen',
    notes: ['Ätzgas', 'B-Isotope: ¹⁰B/¹¹B', 'Cl-Isotopenmuster']
  },
  {
    key: 'B2H6',
    name: 'Diboran',
    nameEn: 'Diborane',
    formula: 'B₂H₆',
    mainMass: 26,
    crackingPattern: { 26: 100, 27: 85, 24: 40, 25: 35, 11: 20, 10: 7 },
    relativeSensitivity: 2.0,
    category: 'halogen',
    notes: ['Halbleiter-Dotiergas', 'B-Isotope']
  },
  {
    key: 'PH3',
    name: 'Phosphin',
    nameEn: 'Phosphine',
    formula: 'PH₃',
    mainMass: 34,
    crackingPattern: { 34: 100, 31: 35, 33: 32, 32: 5, 1: 3 },
    relativeSensitivity: 2.6,
    category: 'halogen',
    notes: ['Halbleiter-Dotiergas', 'WARNUNG: Hochgiftig!']
  },
  {
    key: 'AsH3',
    name: 'Arsin',
    nameEn: 'Arsine',
    formula: 'AsH₃',
    mainMass: 76,
    crackingPattern: { 76: 100, 75: 50, 77: 25, 78: 8 },
    relativeSensitivity: 2.5,
    category: 'halogen',
    notes: ['Halbleiter-Dotiergas', 'WARNUNG: Hochgiftig!']
  },

  // ============================================
  // SCHWEFELVERBINDUNGEN
  // ============================================
  {
    key: 'H2S',
    name: 'Schwefelwasserstoff',
    nameEn: 'Hydrogen Sulfide',
    formula: 'H₂S',
    mainMass: 34,
    crackingPattern: { 34: 100, 33: 42, 32: 44, 36: 4.5 },
    relativeSensitivity: 2.2,
    category: 'sulfur',
    notes: ['Schwefelkontamination', '³⁴S-Isotop bei m/z 36', 'm/z 32 überlagert mit O₂']
  },
  {
    key: 'SO2',
    name: 'Schwefeldioxid',
    nameEn: 'Sulfur Dioxide',
    formula: 'SO₂',
    mainMass: 64,
    crackingPattern: { 64: 100, 48: 49, 32: 10, 16: 5, 66: 5 },
    relativeSensitivity: 2.1,
    category: 'sulfur',
    notes: ['Schwefelindikator', 'm/z 48 (SO⁺) ist charakteristisch', '³⁴S-Isotop bei m/z 66']
  },

  // ============================================
  // STICKSTOFFVERBINDUNGEN
  // ============================================
  {
    key: 'NH3',
    name: 'Ammoniak',
    nameEn: 'Ammonia',
    formula: 'NH₃',
    mainMass: 17,
    crackingPattern: { 17: 100, 16: 80, 15: 8, 14: 2 },
    relativeSensitivity: 1.3,
    category: 'nitrogen_compound',
    notes: ['Base Peak bei 17 wie OH⁺ von H₂O!', '17/18 Ratio zur Unterscheidung']
  },
  {
    key: 'NO',
    name: 'Stickstoffmonoxid',
    nameEn: 'Nitric Oxide',
    formula: 'NO',
    mainMass: 30,
    crackingPattern: { 30: 100, 14: 7, 15: 2 },
    relativeSensitivity: 1.1,
    category: 'nitrogen_compound',
    notes: ['Prozessgas', 'Entsteht an heißen Filamenten']
  },
  {
    key: 'N2O',
    name: 'Distickstoffmonoxid',
    nameEn: 'Nitrous Oxide',
    formula: 'N₂O',
    mainMass: 44,
    crackingPattern: { 44: 100, 30: 31, 28: 11, 14: 13, 16: 5 },
    relativeSensitivity: 1.5,
    category: 'nitrogen_compound',
    notes: ['Lachgas', 'Base Peak wie CO₂!', 'NO⁺ bei 30 unterscheidet']
  },

  // ============================================
  // SILIKON / PDMS
  // ============================================
  {
    key: 'PDMS',
    name: 'Polydimethylsiloxan',
    nameEn: 'Polydimethylsiloxane',
    formula: '(CH₃)₃SiO-',
    mainMass: 73,
    crackingPattern: { 73: 100, 147: 50, 45: 30, 59: 20, 28: 10 },
    relativeSensitivity: 4.0,
    category: 'silicone',
    notes: ['Silikonfett/-öl', 'Trimethylsilyl-Fragment bei 73', 'Cluster bei 147, 221, 295']
  },

  // ============================================
  // SONSTIGE
  // ============================================
  {
    key: 'SiH4',
    name: 'Silan',
    nameEn: 'Silane',
    formula: 'SiH₄',
    mainMass: 30,
    crackingPattern: { 30: 100, 31: 78, 29: 29, 28: 4 },
    relativeSensitivity: 1.0,
    category: 'hydrocarbon',
    notes: ['Halbleiter-Prozessgas', 'Si-Isotope']
  },

  // ============================================
  // HALBLEITER-PROZESSGASE (NEU)
  // ============================================
  {
    key: 'NF3',
    name: 'Stickstofftrifluorid',
    nameEn: 'Nitrogen Trifluoride',
    formula: 'NF₃',
    mainMass: 52,
    crackingPattern: {
      52: 100,  // NF₂⁺ (Base Peak)
      71: 45,   // NF₃⁺ (Parent)
      33: 35,   // NF⁺
      14: 15,   // N⁺
      19: 25    // F⁺
    },
    relativeSensitivity: 1.5,
    category: 'halogen',
    notes: ['CVD/ALD Kammer-Reinigung', 'Hohe GWP (17,200)', 'm/z 52 charakteristisch']
  },
  {
    key: 'WF6',
    name: 'Wolframhexafluorid',
    nameEn: 'Tungsten Hexafluoride',
    formula: 'WF₆',
    mainMass: 279,
    crackingPattern: {
      279: 100, // WF₅⁺ (Base Peak, W-Isotopenmuster)
      260: 40,  // WF₄⁺
      241: 15,  // WF₃⁺
      184: 20,  // W⁺
      19: 30    // F⁺
    },
    relativeSensitivity: 2.0,
    category: 'halogen',
    notes: ['Wolfram-CVD/ALD', 'Korrosiv - HF-Bildung!', 'W-Isotope bei m/z 182-186']
  },
  {
    key: 'C2F6',
    name: 'Hexafluorethan',
    nameEn: 'Hexafluoroethane',
    formula: 'C₂F₆',
    mainMass: 69,
    crackingPattern: {
      69: 100,  // CF₃⁺ (Base Peak)
      119: 30,  // C₂F₅⁺
      50: 20,   // CF₂⁺
      31: 15    // CF⁺
    },
    relativeSensitivity: 1.2,
    category: 'halogen',
    notes: ['Plasma-Ätzen', 'Hohe GWP (12,200)', 'm/z 119 unterscheidet von CF₄']
  },
  {
    key: 'GeH4',
    name: 'German',
    nameEn: 'Germane',
    formula: 'GeH₄',
    mainMass: 74,
    crackingPattern: {
      74: 100,  // ⁷⁴Ge⁺ (Hauptisotop)
      72: 55,   // ⁷²Ge⁺
      70: 42,   // ⁷⁰Ge⁺
      73: 16,   // ⁷³Ge⁺
      76: 15    // ⁷⁶Ge⁺
    },
    relativeSensitivity: 2.5,
    category: 'halogen',
    notes: ['SiGe-Abscheidung', 'PYROPHOR!', 'Ge-Isotopenmuster charakteristisch']
  }
]

/**
 * Schneller Lookup nach Gas-Key
 */
export const GAS_BY_KEY: Record<string, GasSpecies> = Object.fromEntries(
  GAS_LIBRARY.map(gas => [gas.key, gas])
)

/**
 * Lookup nach Hauptmasse
 * Achtung: Mehrere Gase können denselben Hauptpeak haben!
 */
export const GASES_BY_MAIN_MASS: Record<number, GasSpecies[]> = GAS_LIBRARY.reduce(
  (acc, gas) => {
    if (!acc[gas.mainMass]) {
      acc[gas.mainMass] = []
    }
    acc[gas.mainMass].push(gas)
    return acc
  },
  {} as Record<number, GasSpecies[]>
)

/**
 * Findet alle Gase, die bei einer bestimmten Masse einen Peak haben
 */
export function findGasesWithPeakAtMass(mass: number): Array<{ gas: GasSpecies; intensity: number }> {
  return GAS_LIBRARY
    .filter(gas => gas.crackingPattern[mass] !== undefined)
    .map(gas => ({
      gas,
      intensity: gas.crackingPattern[mass]
    }))
    .sort((a, b) => b.intensity - a.intensity)
}

/**
 * Gibt das Cracking Pattern für ein Gas zurück, normiert auf einen Skalierungsfaktor
 */
export function getScaledPattern(gasKey: string, scaleFactor: number): Record<number, number> {
  const gas = GAS_BY_KEY[gasKey]
  if (!gas) return {}

  const scaled: Record<number, number> = {}
  for (const [mass, intensity] of Object.entries(gas.crackingPattern)) {
    scaled[Number(mass)] = (intensity / 100) * scaleFactor
  }
  return scaled
}
