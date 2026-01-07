/**
 * Konstanten für die Druckkalibrierung
 * Basierend auf PRESSURE_CALIBRATION_SPEC_V2.md
 */

import { SystemState } from '@/types/calibration'

// Referenztemperatur für Korrekturen (23°C in Kelvin)
export const T_REFERENCE_K = 296

// Dominantes Gas nach Systemzustand
export const DOMINANT_GAS_BY_STATE: Record<SystemState, string> = {
  [SystemState.UNBAKED]: 'H2O',
  [SystemState.BAKED]: 'H2',
  [SystemState.UNKNOWN]: 'N2'
}

// Manometer-Korrekturfaktoren (1/RSF für dominantes Gas)
// Das Ionisationsmanometer (Bayard-Alpert) ist auf N₂ kalibriert
export const MANOMETER_CORRECTION: Record<string, number> = {
  'H2O': 1 / 0.9,    // 1.11
  'H2':  1 / 0.44,   // 2.27
  'N2':  1.0,
  'Ar':  1 / 1.2,    // 0.83
  'He':  1 / 0.14,   // 7.14
}

// Masse zu primärem Gas Mapping (für Druck-Umrechnung)
export const MASS_TO_GAS: Record<number, string> = {
  1:  'H2',      // H⁺ Fragment
  2:  'H2',
  4:  'He',
  12: 'CO',      // C⁺ Fragment (nicht CH₄!)
  14: 'N2',      // N⁺ Fragment
  15: 'CH4',     // CH₃⁺ Fragment
  16: 'CH4',     // oder O⁺ - wird in Dekonvolution behandelt
  17: 'H2O',     // OH⁺ Fragment
  18: 'H2O',
  20: 'Ne',      // oder Ar²⁺ - wird geprüft
  22: 'CO2',     // CO₂²⁺
  28: 'N2',      // oder CO - wird in Dekonvolution behandelt
  29: 'C2H6',    // oder ¹³CO
  32: 'O2',
  36: 'Ar',      // ³⁶Ar Isotop
  40: 'Ar',
  44: 'CO2',
  // Öl-Marker
  41: 'Oil',
  43: 'Oil',
  55: 'Oil',
  57: 'Oil',
  69: 'Oil',     // oder CF₃⁺ (Fomblin)
  71: 'Oil',
  83: 'Oil',
  85: 'Oil',
}

// Cracking Patterns (Hauptpeak = 100)
// Für die einfache Dekonvolution
export const CRACKING_PATTERNS: Record<string, Record<number, number>> = {
  'H2': {
    2: 100,
    1: 5
  },
  'H2O': {
    18: 100,
    17: 23,
    16: 1.5,
    1: 0.5
  },
  'N2': {
    28: 100,
    14: 7.2,
    29: 0.7
  },
  'O2': {
    32: 100,
    16: 11,
    34: 0.4
  },
  'Ar': {
    40: 100,
    20: 14.6,
    36: 0.34
  },
  'CO': {
    28: 100,
    12: 4.5,
    16: 1.7,
    14: 1.0
  },
  'CO2': {
    44: 100,
    28: 10,
    16: 10,
    12: 8.7,
    22: 1.9
  },
  'CH4': {
    16: 100,
    15: 85,
    14: 16,
    13: 8,
    12: 3.8
  },
  'NH3': {
    17: 100,
    16: 80,
    15: 8,
    14: 2
  },
  // Öl (Mineralöl/Vorpumpenöl)
  'Oil': {
    43: 100,
    41: 91,
    57: 73,
    55: 64,
    71: 20,
    39: 50,
    69: 30,
    83: 15,
    85: 12
  },
  // Fomblin/PFPE
  'Fomblin': {
    69: 100,
    20: 28,
    16: 16,
    47: 15,
    50: 12,
    31: 9
  },
  // Aceton
  'Acetone': {
    43: 100,
    15: 42,
    58: 27
  },
  // Isopropanol
  'IPA': {
    45: 100,
    43: 17,
    27: 16
  }
}

// Systemzustand-Erkennungsmuster (EN + DE)
export interface SystemStatePattern {
  pattern: RegExp
  state: SystemState
}

export const SYSTEM_STATE_PATTERNS: SystemStatePattern[] = [
  // Englisch
  { pattern: /before\s*bake\s*out/i, state: SystemState.UNBAKED },
  { pattern: /pre[_\-\s]*bake/i, state: SystemState.UNBAKED },
  { pattern: /unbaked/i, state: SystemState.UNBAKED },
  { pattern: /after\s*bake\s*out/i, state: SystemState.BAKED },
  { pattern: /post[_\-\s]*bake/i, state: SystemState.BAKED },
  { pattern: /baked/i, state: SystemState.BAKED },

  // Deutsch
  { pattern: /vor\s*aus\s*heizen/i, state: SystemState.UNBAKED },
  { pattern: /vor\s*bakeout/i, state: SystemState.UNBAKED },
  { pattern: /nach\s*aus\s*heizen/i, state: SystemState.BAKED },
  { pattern: /nach\s*bakeout/i, state: SystemState.BAKED },
  { pattern: /ausgeheizt/i, state: SystemState.BAKED },
  { pattern: /nicht\s*ausgeheizt/i, state: SystemState.UNBAKED },
]

// Default-Empfindlichkeit für Faraday-Detektor [A/mbar]
export const DEFAULT_FARADAY_SENSITIVITY = 1e-4

// Relative Sensitivitäten (Backup - primär aus GAS_LIBRARY verwenden)
export const RELATIVE_SENSITIVITY: Record<string, number> = {
  // Leichte Gase
  'He':   0.14,
  'Ne':   0.23,
  'H2':   0.44,

  // Hauptgase UHV
  'O2':   0.86,
  'H2O':  0.9,
  'N2':   1.0,
  'CO':   1.05,
  'Ar':   1.2,
  'NH3':  1.3,
  'CO2':  1.4,

  // Kohlenwasserstoffe leicht
  'CH4':  1.6,
  'Kr':   1.7,
  'C2H2': 1.8,
  'C2H4': 1.9,
  'C2H6': 2.1,
  'C3H8': 2.4,

  // Schwere Gase
  'Xe':   3.0,
  'Acetone': 3.6,
  'Oil':  4.0,
  'PDMS': 4.0,
  'Benzene': 5.9,
  'Toluene': 6.2
}
