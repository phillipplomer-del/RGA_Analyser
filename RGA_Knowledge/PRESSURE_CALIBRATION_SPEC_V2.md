# RGA Pressure Calibration Specification v2

## Übersicht

Diese Spezifikation beschreibt die automatische Kalibrierung von RGA-Rohdaten (Ionenströme) zu Partialdrücken mit mehreren Genauigkeitsstufen.

**Neuerungen in v2:**
- Systemzustand-Erkennung aus Dateinamen (baked/unbaked)
- Cracking Pattern Dekonvolution
- Temperaturkorrektur
- Optionale Gerätekalibrierung für Präzisionsmessungen
- SEM-Gain-Tracking

---

## 1. Genauigkeitsstufen

| Level | Beschreibung | User-Input | Genauigkeit |
|-------|--------------|------------|-------------|
| `BASIC` | Nur Totaldruck aus Dateiname | Keiner | ±50% |
| `STANDARD` | + Systemzustand + Dekonvolution + Temp | Keiner | ±20-25% |
| `ADVANCED` | + Gerätekalibrierung (einmalig) | 1-3 Messungen | ±10-15% |
| `PRECISION` | + SEM-Gain-Abgleich | 2 Messungen | ±5-10% |

**Default: `STANDARD`** – vollautomatisch, keine User-Interaktion nötig.

---

## 2. Dateinamen-Parser (erweitert)

### Beispiele

```
pa055357 oipt large before bakeout_1h_1250v_23c_2,7e-6mbar.asc
cavity xyz after bakeout_24h_1400v_150c_3,2e-9mbar.asc
Kammer_A_vor_Ausheizen_2h_1100v_25c_1,5e-7mbar.asc
test nach ausheizen_48h_1300v_200c_8e-10mbar.asc
```

### Erkannte Parameter

| Parameter | Pattern | Beispiele | Einheit |
|-----------|---------|-----------|---------|
| Totaldruck | `(\d+[,.]?\d*)\s*[eE]\s*(-?\d+)\s*mbar` | `2,7e-6mbar` | mbar |
| SEM-Spannung | `(\d{3,4})\s*[vV]` | `1250v` | V |
| Temperatur | `(\d{2,3})\s*[cC](?![a-zA-Z])` | `23c`, `150c` | °C |
| Messzeit | `(\d+)\s*(h\|min)` | `1h`, `24h` | h/min |
| Systemzustand | siehe unten | `before bakeout` | enum |

### Systemzustand-Erkennung

```typescript
enum SystemState {
  UNBAKED = 'unbaked',     // Wasser-dominiert
  BAKED = 'baked',         // Wasserstoff-dominiert
  UNKNOWN = 'unknown'
}

interface SystemStatePattern {
  pattern: RegExp;
  state: SystemState;
}

const SYSTEM_STATE_PATTERNS: SystemStatePattern[] = [
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
];

function detectSystemState(filename: string): SystemState {
  for (const { pattern, state } of SYSTEM_STATE_PATTERNS) {
    if (pattern.test(filename)) {
      return state;
    }
  }
  return SystemState.UNKNOWN;
}
```

### Vollständiger Parser

```typescript
interface MeasurementMetadata {
  filename: string;
  totalPressure?: number;           // [mbar]
  semVoltage?: number;              // [V]
  temperature?: number;             // [°C]
  duration?: string;                // "1h", "30min"
  systemState: SystemState;         // UNBAKED, BAKED, UNKNOWN
  description?: string;
}

function parseFilename(filename: string): MeasurementMetadata {
  const result: MeasurementMetadata = { 
    filename,
    systemState: SystemState.UNKNOWN
  };
  
  // Totaldruck: 2,7e-6mbar | 2.7e-6mbar | 2,7E-6mbar
  const pressureMatch = filename.match(
    /(\d+[,.]?\d*)\s*[eE]\s*(-?\d+)\s*mbar/i
  );
  if (pressureMatch) {
    const mantissa = parseFloat(pressureMatch[1].replace(',', '.'));
    const exponent = parseInt(pressureMatch[2]);
    result.totalPressure = mantissa * Math.pow(10, exponent);
  }
  
  // SEM-Spannung: 1250v, 1400V
  const voltageMatch = filename.match(/(\d{3,4})\s*[vV]/);
  if (voltageMatch) {
    result.semVoltage = parseInt(voltageMatch[1]);
  }
  
  // Temperatur: 23c, 150C
  const tempMatch = filename.match(/(\d{2,3})\s*[cC](?![a-zA-Z])/);
  if (tempMatch) {
    result.temperature = parseInt(tempMatch[1]);
  }
  
  // Dauer: 1h, 24h, 30min
  const durationMatch = filename.match(/(\d+)\s*(h|min)/i);
  if (durationMatch) {
    result.duration = durationMatch[0];
  }
  
  // Systemzustand
  result.systemState = detectSystemState(filename);
  
  // Beschreibung: alles vor den Parametern
  const descMatch = filename.match(/^(.+?)_\d+[hm]/i);
  if (descMatch) {
    result.description = descMatch[1].trim();
  }
  
  return result;
}
```

---

## 3. Dominantes Gas aus Systemzustand

Das Ionisationsmanometer (Bayard-Alpert) ist auf N₂ kalibriert. Bei anderen dominanten Gasen muss der Totaldruck korrigiert werden.

### Mapping

| Systemzustand | Dominantes Gas | Manometer-Korrekturfaktor |
|---------------|----------------|---------------------------|
| `UNBAKED` | H₂O | 1.11 (= 1/0.9) |
| `BAKED` | H₂ | 2.27 (= 1/0.44) |
| `UNKNOWN` | N₂ (Annahme) | 1.00 |

### Implementierung

```typescript
const DOMINANT_GAS_BY_STATE: Record<SystemState, string> = {
  [SystemState.UNBAKED]: 'H2O',
  [SystemState.BAKED]: 'H2',
  [SystemState.UNKNOWN]: 'N2'
};

const MANOMETER_CORRECTION: Record<string, number> = {
  'H2O': 1 / 0.9,    // 1.11
  'H2':  1 / 0.44,   // 2.27
  'N2':  1.0,
  'Ar':  1 / 1.2,    // 0.83
  'He':  1 / 0.14,   // 7.14
};

function correctTotalPressure(
  measuredPressure: number,
  systemState: SystemState
): number {
  const dominantGas = DOMINANT_GAS_BY_STATE[systemState];
  const correction = MANOMETER_CORRECTION[dominantGas] || 1.0;
  return measuredPressure * correction;
}
```

### Warum ist das wichtig?

Beispiel: System nach Bakeout, H₂ dominiert.
- Manometer zeigt: `1×10⁻⁹ mbar`
- Tatsächlicher Druck: `1×10⁻⁹ × 2.27 = 2.3×10⁻⁹ mbar`

Ohne Korrektur wäre der berechnete Partialdruck um Faktor 2.3 zu niedrig!

---

## 4. Relative Sensitivitäten (RSF)

Bezogen auf N₂ = 1.0 (aus APP_CRITERIA.md):

```typescript
const RELATIVE_SENSITIVITY: Record<string, number> = {
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
};
```

### Masse zu Gas Mapping

```typescript
const MASS_TO_GAS: Record<number, string> = {
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
};
```

---

## 5. Cracking Pattern Dekonvolution

### Problem

Jedes Gas erzeugt Peaks bei mehreren Massen. Ohne Korrektur werden Fragmente doppelt gezählt.

Beispiel CO₂:
- Hauptpeak m/z 44: 100%
- Fragment m/z 28: 10%
- Fragment m/z 16: 10%
- Fragment m/z 12: 8.7%

Das Signal bei m/z 28 enthält also ~10% CO₂, wird aber als N₂/CO interpretiert.

### Cracking Patterns (aus APP_CRITERIA.md)

```typescript
// Pattern: mass → relative intensity (Hauptpeak = 100)
const CRACKING_PATTERNS: Record<string, Record<number, number>> = {
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
};
```

### Dekonvolutions-Algorithmus

#### Stufe 1: Einfache Subtraktion (schnell, gut genug für Standard)

```typescript
interface DeconvolutionResult {
  correctedSpectrum: Map<number, number>;
  gasContributions: Map<string, number>;  // Gas → Partialdruck
  residuals: Map<number, number>;         // Nicht erklärte Signale
}

function deconvoluteSimple(
  spectrum: Map<number, number>
): DeconvolutionResult {
  
  const corrected = new Map(spectrum);
  const contributions = new Map<string, number>();
  
  // 1. CO₂ identifizieren (m/z 44 eindeutig)
  const m44 = spectrum.get(44) || 0;
  if (m44 > 0) {
    contributions.set('CO2', m44);
    // Fragmente abziehen
    subtractFragment(corrected, 28, m44 * 0.10);
    subtractFragment(corrected, 16, m44 * 0.10);
    subtractFragment(corrected, 12, m44 * 0.087);
    subtractFragment(corrected, 22, m44 * 0.019);
  }
  
  // 2. H₂O identifizieren (m/z 18)
  const m18 = spectrum.get(18) || 0;
  if (m18 > 0) {
    contributions.set('H2O', m18);
    subtractFragment(corrected, 17, m18 * 0.23);
    subtractFragment(corrected, 16, m18 * 0.015);
  }
  
  // 3. Ar identifizieren (m/z 40)
  const m40 = spectrum.get(40) || 0;
  if (m40 > 0) {
    contributions.set('Ar', m40);
    subtractFragment(corrected, 20, m40 * 0.146);
    subtractFragment(corrected, 36, m40 * 0.0034);
  }
  
  // 4. O₂ identifizieren (m/z 32, nach Ar-Korrektur)
  const m32 = corrected.get(32) || 0;
  if (m32 > 0) {
    contributions.set('O2', m32);
    subtractFragment(corrected, 16, m32 * 0.11);
  }
  
  // 5. N₂ vs CO unterscheiden (m/z 28)
  //    N₂: Fragment bei 14 (~7%)
  //    CO: Fragment bei 12 (~5%)
  const m28 = corrected.get(28) || 0;
  const m14 = corrected.get(14) || 0;
  const m12 = corrected.get(12) || 0;
  
  if (m28 > 0) {
    // Verhältnis prüfen
    const n2Contribution = Math.min(m28, m14 / 0.072);  // m14 = 7.2% von N₂
    const coContribution = Math.min(m28 - n2Contribution, m12 / 0.045);
    
    if (n2Contribution > 0) {
      contributions.set('N2', n2Contribution);
      subtractFragment(corrected, 14, n2Contribution * 0.072);
    }
    if (coContribution > 0) {
      contributions.set('CO', coContribution);
      subtractFragment(corrected, 12, coContribution * 0.045);
      subtractFragment(corrected, 16, coContribution * 0.017);
    }
  }
  
  // 6. H₂ (m/z 2, meist sauber)
  const m2 = corrected.get(2) || 0;
  if (m2 > 0) {
    contributions.set('H2', m2);
  }
  
  // 7. CH₄ (m/z 16 nach Abzug von O⁺-Fragmenten)
  const m16remaining = corrected.get(16) || 0;
  const m15 = spectrum.get(15) || 0;
  if (m15 > 0 && m16remaining > 0) {
    // CH₄ hat m15/m16 ≈ 0.85
    const ch4FromM15 = m15 / 0.85;
    const ch4Contribution = Math.min(m16remaining, ch4FromM15);
    if (ch4Contribution > 0) {
      contributions.set('CH4', ch4Contribution);
    }
  }
  
  // Residuen = nicht erklärte Signale
  const residuals = new Map<number, number>();
  for (const [mass, intensity] of corrected) {
    if (intensity > 0) {
      residuals.set(mass, intensity);
    }
  }
  
  return {
    correctedSpectrum: corrected,
    gasContributions: contributions,
    residuals
  };
}

function subtractFragment(
  spectrum: Map<number, number>,
  mass: number,
  amount: number
): void {
  const current = spectrum.get(mass) || 0;
  spectrum.set(mass, Math.max(0, current - amount));
}
```

#### Stufe 2: NNLS (Non-Negative Least Squares) für Präzision

```typescript
/**
 * Vollständige Dekonvolution mittels NNLS
 * 
 * Löst: y = A × k  mit k ≥ 0
 * 
 * y = gemessenes Spektrum (Vektor der Intensitäten)
 * A = Matrix der Cracking Patterns (normiert)
 * k = Konzentrationen der Gase (gesucht)
 */
function deconvoluteNNLS(
  spectrum: Map<number, number>,
  candidateGases: string[] = ['H2', 'H2O', 'N2', 'CO', 'O2', 'Ar', 'CO2', 'CH4']
): Map<string, number> {
  
  // Relevante Massen sammeln
  const allMasses = new Set<number>();
  for (const gas of candidateGases) {
    const pattern = CRACKING_PATTERNS[gas];
    if (pattern) {
      Object.keys(pattern).forEach(m => allMasses.add(parseInt(m)));
    }
  }
  const masses = Array.from(allMasses).sort((a, b) => a - b);
  
  // Messwerte-Vektor y
  const y = masses.map(m => spectrum.get(m) || 0);
  
  // Pattern-Matrix A aufbauen (normiert auf Hauptpeak = 1)
  const A: number[][] = masses.map(mass => 
    candidateGases.map(gas => {
      const pattern = CRACKING_PATTERNS[gas];
      if (!pattern) return 0;
      const maxIntensity = Math.max(...Object.values(pattern));
      return (pattern[mass] || 0) / maxIntensity;
    })
  );
  
  // NNLS lösen
  const k = solveNNLS(A, y);
  
  // Ergebnis als Map (skaliert auf tatsächliche Intensitäten)
  const result = new Map<string, number>();
  candidateGases.forEach((gas, i) => {
    if (k[i] > 0) {
      const pattern = CRACKING_PATTERNS[gas];
      const maxIntensity = Math.max(...Object.values(pattern || {}));
      result.set(gas, k[i] * maxIntensity);
    }
  });
  
  return result;
}

/**
 * Vereinfachter NNLS-Solver (Gradient Descent mit Projektion)
 * Für Produktion: math.js oder spezialisierte Bibliothek verwenden
 */
function solveNNLS(A: number[][], y: number[]): number[] {
  const nGases = A[0]?.length || 0;
  const nMasses = A.length;
  const k = new Array(nGases).fill(0.1);  // Startwerte
  
  const learningRate = 0.001;
  const iterations = 2000;
  const tolerance = 1e-10;
  
  for (let iter = 0; iter < iterations; iter++) {
    let maxChange = 0;
    
    // Residuum: r = y - A×k
    const residual = y.map((yi, i) => 
      yi - A[i].reduce((sum, aij, j) => sum + aij * k[j], 0)
    );
    
    // Gradient für jedes Gas
    for (let j = 0; j < nGases; j++) {
      let gradient = 0;
      for (let i = 0; i < nMasses; i++) {
        gradient -= 2 * A[i][j] * residual[i];
      }
      
      const newK = Math.max(0, k[j] - learningRate * gradient);
      maxChange = Math.max(maxChange, Math.abs(newK - k[j]));
      k[j] = newK;
    }
    
    if (maxChange < tolerance) break;
  }
  
  return k;
}
```

---

## 6. Temperaturkorrektur

Die Gastemperatur beeinflusst die Teilchendichte und damit das Signal.

### Formel

```
P_korrigiert = P_gemessen × (T_ref / T_aktuell)
```

Mit T_ref = 296 K (23°C, Standardbedingung)

### Implementierung

```typescript
const T_REFERENCE_K = 296;  // 23°C

function temperatureCorrection(
  pressure: number,
  temperatureC?: number
): number {
  if (temperatureC === undefined) {
    return pressure;  // Keine Korrektur möglich
  }
  
  const T_actual_K = temperatureC + 273.15;
  return pressure * (T_REFERENCE_K / T_actual_K);
}
```

### Auswirkung

| Messtemperatur | Korrekturfaktor | Kommentar |
|----------------|-----------------|-----------|
| 23°C | 1.00 | Referenz |
| 150°C | 0.70 | Während Bakeout |
| 200°C | 0.63 | Während Bakeout |
| -196°C (LN₂) | 3.84 | Kryopumpe |

---

## 7. Kalibrierungs-Pipeline

### Vollständiger Ablauf

```typescript
interface CalibrationResult {
  sensitivity: number;                    // [A/mbar]
  confidence: 'high' | 'medium' | 'low';
  method: 'auto' | 'manual' | 'default';
  corrections: {
    manometerCorrection: number;          // Für dominantes Gas
    temperatureCorrection: number;        // Für Messtemperatur
  };
  deconvolution: DeconvolutionResult;
  metadata: MeasurementMetadata;
}

function calibrate(
  filename: string,
  rawSpectrum: Map<number, number>,
  options: {
    level?: 'BASIC' | 'STANDARD' | 'ADVANCED' | 'PRECISION';
    deviceCalibration?: DeviceCalibration;
  } = {}
): CalibrationResult {
  
  const level = options.level || 'STANDARD';
  
  // 1. Metadaten aus Dateinamen
  const metadata = parseFilename(filename);
  
  // 2. Dekonvolution (ab STANDARD)
  let deconvolution: DeconvolutionResult;
  if (level === 'BASIC') {
    deconvolution = {
      correctedSpectrum: rawSpectrum,
      gasContributions: new Map(),
      residuals: new Map()
    };
  } else {
    deconvolution = deconvoluteSimple(rawSpectrum);
  }
  
  // 3. Totaldruck korrigieren
  let totalPressure = metadata.totalPressure;
  let manometerCorrection = 1.0;
  let temperatureCorr = 1.0;
  
  if (totalPressure) {
    // Manometer-Korrektur für dominantes Gas (ab STANDARD)
    if (level !== 'BASIC' && metadata.systemState !== SystemState.UNKNOWN) {
      manometerCorrection = getManometerCorrection(metadata.systemState);
      totalPressure *= manometerCorrection;
    }
    
    // Temperaturkorrektur (ab STANDARD)
    if (level !== 'BASIC' && metadata.temperature !== undefined) {
      temperatureCorr = T_REFERENCE_K / (metadata.temperature + 273.15);
      totalPressure *= temperatureCorr;
    }
  }
  
  // 4. Empfindlichkeit berechnen
  let sensitivity: number;
  let confidence: 'high' | 'medium' | 'low';
  let method: 'auto' | 'manual' | 'default';
  
  if (options.deviceCalibration && (level === 'ADVANCED' || level === 'PRECISION')) {
    // Gerätespezifische Kalibrierung verwenden
    sensitivity = options.deviceCalibration.baseSensitivity;
    confidence = 'high';
    method = 'manual';
  } else if (totalPressure) {
    // Auto-Kalibrierung aus korrigiertem Totaldruck
    sensitivity = calculateSensitivityFromTotal(
      deconvolution.correctedSpectrum,
      totalPressure
    );
    confidence = level === 'BASIC' ? 'low' : 'medium';
    method = 'auto';
  } else {
    // Fallback: Default
    sensitivity = getDefaultSensitivity(metadata.semVoltage);
    confidence = 'low';
    method = 'default';
  }
  
  return {
    sensitivity,
    confidence,
    method,
    corrections: {
      manometerCorrection,
      temperatureCorrection: temperatureCorr
    },
    deconvolution,
    metadata
  };
}

function getManometerCorrection(state: SystemState): number {
  const gas = DOMINANT_GAS_BY_STATE[state];
  return MANOMETER_CORRECTION[gas] || 1.0;
}

function calculateSensitivityFromTotal(
  spectrum: Map<number, number>,
  totalPressure: number
): number {
  let weightedSum = 0;
  
  for (const [mass, current] of spectrum) {
    if (current <= 0) continue;
    const gas = MASS_TO_GAS[mass] || 'N2';
    const rsf = RELATIVE_SENSITIVITY[gas] || 1.0;
    weightedSum += current / rsf;
  }
  
  return weightedSum / totalPressure;
}

function getDefaultSensitivity(semVoltage?: number): number {
  // Wenn SEM-Spannung > 800V → wahrscheinlich SEM
  if (semVoltage && semVoltage > 800) {
    const estimatedGain = Math.pow(10, semVoltage / 350);
    return 1e-4 * estimatedGain;
  }
  return 1e-4;  // Typischer Faraday-Wert
}
```

---

## 8. Druck-Umrechnungs-Service

```typescript
interface SpectrumDataPoint {
  mass: number;
  current: number;          // [A] Rohdaten
  pressure?: number;        // [mbar] nach Umrechnung
  gasAssignment?: string;
  isFragment?: boolean;     // True wenn Fragment eines anderen Gases
}

interface ConversionOptions {
  applyRSF: boolean;
  applyDeconvolution: boolean;
  unit: 'mbar' | 'pa' | 'torr';
}

class PressureConversionService {
  private calibration: CalibrationResult | null = null;
  
  setCalibration(cal: CalibrationResult): void {
    this.calibration = cal;
  }
  
  convertSpectrum(
    rawSpectrum: SpectrumDataPoint[],
    options: ConversionOptions = { 
      applyRSF: true, 
      applyDeconvolution: true, 
      unit: 'mbar' 
    }
  ): SpectrumDataPoint[] {
    
    if (!this.calibration) {
      throw new Error('Keine Kalibrierung gesetzt');
    }
    
    const S = this.calibration.sensitivity;
    const deconv = this.calibration.deconvolution;
    
    return rawSpectrum.map(point => {
      const gas = point.gasAssignment || MASS_TO_GAS[point.mass] || 'N2';
      const rsf = options.applyRSF ? (RELATIVE_SENSITIVITY[gas] || 1.0) : 1.0;
      
      // Korrigierten Strom verwenden wenn Dekonvolution aktiv
      const current = options.applyDeconvolution
        ? (deconv.correctedSpectrum.get(point.mass) || point.current)
        : point.current;
      
      let pressure = current / (S * rsf);
      pressure = this.convertUnit(pressure, 'mbar', options.unit);
      
      // Prüfen ob dieser Peak ein Fragment ist
      const isFragment = options.applyDeconvolution && 
        current < point.current * 0.5;  // >50% abgezogen
      
      return {
        ...point,
        pressure,
        gasAssignment: gas,
        isFragment
      };
    });
  }
  
  // Partialdrücke der identifizierten Gase
  getGasPartialPressures(
    unit: 'mbar' | 'pa' | 'torr' = 'mbar'
  ): Map<string, number> {
    
    if (!this.calibration) {
      throw new Error('Keine Kalibrierung gesetzt');
    }
    
    const S = this.calibration.sensitivity;
    const result = new Map<string, number>();
    
    for (const [gas, intensity] of this.calibration.deconvolution.gasContributions) {
      const rsf = RELATIVE_SENSITIVITY[gas] || 1.0;
      let pressure = intensity / (S * rsf);
      pressure = this.convertUnit(pressure, 'mbar', unit);
      result.set(gas, pressure);
    }
    
    return result;
  }
  
  getTotalPressure(unit: 'mbar' | 'pa' | 'torr' = 'mbar'): number {
    const partials = this.getGasPartialPressures(unit);
    let total = 0;
    for (const p of partials.values()) {
      total += p;
    }
    return total;
  }
  
  private convertUnit(
    pressure: number,
    from: 'mbar' | 'pa' | 'torr',
    to: 'mbar' | 'pa' | 'torr'
  ): number {
    let mbar = pressure;
    if (from === 'pa') mbar = pressure / 100;
    if (from === 'torr') mbar = pressure * 1.33322;
    
    if (to === 'mbar') return mbar;
    if (to === 'pa') return mbar * 100;
    if (to === 'torr') return mbar / 1.33322;
    
    return mbar;
  }
}
```

---

## 9. Optionale Gerätekalibrierung (für ADVANCED/PRECISION)

### Datenstruktur

```typescript
interface DeviceCalibration {
  deviceId: string;                       // Geräte-Identifier
  timestamp: Date;
  
  // Basis-Empfindlichkeit aus N₂-Kalibrierung
  baseSensitivity: number;                // [A/mbar]
  detectorType: 'faraday' | 'sem';
  
  // Optionale gerätespezifische RSF
  customRSF?: Record<string, number>;
  
  // SEM-spezifisch
  semVoltageAtCalibration?: number;
  semGainAtCalibration?: number;
  
  // Referenzmessungen
  measurements: {
    gas: string;
    referencePressure: number;            // [mbar] vom externen Manometer
    measuredCurrent: number;              // [A] vom RGA
    mass: number;                         // Hauptmasse des Gases
  }[];
}

function createDeviceCalibration(
  measurements: DeviceCalibration['measurements'],
  detectorType: 'faraday' | 'sem',
  semVoltage?: number
): DeviceCalibration {
  
  // N₂-Messung finden (oder erste verfügbare)
  const n2Measurement = measurements.find(m => m.gas === 'N2') || measurements[0];
  
  if (!n2Measurement) {
    throw new Error('Mindestens eine Referenzmessung erforderlich');
  }
  
  const baseSensitivity = n2Measurement.measuredCurrent / n2Measurement.referencePressure;
  
  // Gerätespezifische RSF aus mehreren Messungen berechnen
  const customRSF: Record<string, number> = {};
  
  for (const m of measurements) {
    if (m.gas === 'N2') continue;
    
    const measuredSensitivity = m.measuredCurrent / m.referencePressure;
    customRSF[m.gas] = measuredSensitivity / baseSensitivity;
  }
  
  return {
    deviceId: `RGA_${Date.now()}`,
    timestamp: new Date(),
    baseSensitivity,
    detectorType,
    customRSF: Object.keys(customRSF).length > 0 ? customRSF : undefined,
    semVoltageAtCalibration: semVoltage,
    measurements
  };
}
```

### UI-Flow für Gerätekalibrierung

```
┌─────────────────────────────────────────────────────────────┐
│ GERÄTE-KALIBRIERUNG                                         │
│                                                             │
│ Diese Kalibrierung wird einmalig durchgeführt und für      │
│ alle zukünftigen Messungen verwendet.                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Schritt 1: N₂-Referenzmessung (Pflicht)                    │
│                                                             │
│   1. Kammer mit reinem N₂ auf stabilen Druck bringen       │
│   2. Referenzdruck ablesen (externes Manometer)             │
│                                                             │
│   Referenzdruck: [__________] mbar                          │
│   RGA-Strom bei m/z 28: 2.3×10⁻⁹ A  [Aktualisieren]        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Schritt 2: Weitere Gase (Optional, erhöht Genauigkeit)     │
│                                                             │
│   [ ] Ar-Kalibrierung                                       │
│       Referenzdruck: [__________] mbar                      │
│       RGA-Strom bei m/z 40: [automatisch]                   │
│                                                             │
│   [ ] He-Kalibrierung                                       │
│       Referenzdruck: [__________] mbar                      │
│       RGA-Strom bei m/z 4: [automatisch]                    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Detektor: ○ Faraday  ● SEM (1250V)                         │
│                                                             │
│ [Kalibrierung speichern]              [Abbrechen]          │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. SEM-Alterungs-Tracking

### Tracking-Logik

```typescript
interface SEMHistoryEntry {
  timestamp: Date;
  filename: string;
  voltage: number;
  calculatedGain?: number;
}

class SEMTracker {
  private history: SEMHistoryEntry[] = [];
  
  addEntry(metadata: MeasurementMetadata): void {
    if (!metadata.semVoltage) return;
    
    this.history.push({
      timestamp: new Date(),
      filename: metadata.filename,
      voltage: metadata.semVoltage
    });
    
    // Nur letzte 100 Einträge behalten
    if (this.history.length > 100) {
      this.history.shift();
    }
    
    this.saveHistory();
  }
  
  checkAging(): { warning: string; severity: 'info' | 'warning' | 'critical' } | null {
    if (this.history.length < 5) return null;
    
    const recent = this.history.slice(-10);
    const oldest = recent[0];
    const newest = recent[recent.length - 1];
    
    const voltageIncrease = newest.voltage - oldest.voltage;
    const daysBetween = (newest.timestamp.getTime() - oldest.timestamp.getTime()) 
      / (1000 * 60 * 60 * 24);
    
    if (voltageIncrease > 300) {
      return {
        warning: `SEM-Spannung um ${voltageIncrease}V gestiegen in ${daysBetween.toFixed(0)} Tagen. ` +
                 `Detektor stark gealtert – Neukalibrierung dringend empfohlen!`,
        severity: 'critical'
      };
    }
    
    if (voltageIncrease > 150) {
      return {
        warning: `SEM-Spannung um ${voltageIncrease}V gestiegen. ` +
                 `Neukalibrierung empfohlen.`,
        severity: 'warning'
      };
    }
    
    if (voltageIncrease > 50) {
      return {
        warning: `SEM-Spannung um ${voltageIncrease}V gestiegen seit ${oldest.timestamp.toLocaleDateString()}.`,
        severity: 'info'
      };
    }
    
    return null;
  }
  
  private saveHistory(): void {
    localStorage.setItem('sem_history', JSON.stringify(this.history));
  }
  
  loadHistory(): void {
    const stored = localStorage.getItem('sem_history');
    if (stored) {
      this.history = JSON.parse(stored);
    }
  }
}
```

---

## 11. Integration: Vollständiger Lade-Workflow

```typescript
interface LoadedSpectrum {
  raw: SpectrumDataPoint[];
  converted: SpectrumDataPoint[];
  gasPartialPressures: Map<string, number>;
  totalPressure: number;
  metadata: MeasurementMetadata;
  calibration: CalibrationResult;
  warnings: string[];
}

async function loadAndProcessSpectrum(
  file: File,
  options: {
    level?: 'BASIC' | 'STANDARD' | 'ADVANCED' | 'PRECISION';
    deviceCalibration?: DeviceCalibration;
    unit?: 'mbar' | 'pa' | 'torr';
  } = {}
): Promise<LoadedSpectrum> {
  
  const warnings: string[] = [];
  const unit = options.unit || 'mbar';
  
  // 1. Datei parsen
  const raw = await parseASCFile(file);
  const rawMap = new Map(raw.map(p => [p.mass, p.current]));
  
  // 2. Metadaten extrahieren
  const metadata = parseFilename(file.name);
  
  // Warnungen für fehlende Daten
  if (!metadata.totalPressure) {
    warnings.push('Kein Totaldruck im Dateinamen gefunden – verwende Schätzwert');
  }
  if (metadata.systemState === SystemState.UNKNOWN) {
    warnings.push('Systemzustand (baked/unbaked) nicht erkannt – keine Manometer-Korrektur');
  }
  
  // 3. SEM-Tracking
  const semTracker = new SEMTracker();
  semTracker.loadHistory();
  semTracker.addEntry(metadata);
  const semWarning = semTracker.checkAging();
  if (semWarning) {
    warnings.push(semWarning.warning);
  }
  
  // 4. Kalibrierung
  const calibration = calibrate(file.name, rawMap, {
    level: options.level,
    deviceCalibration: options.deviceCalibration
  });
  
  // 5. Konvertierung
  const conversionService = new PressureConversionService();
  conversionService.setCalibration(calibration);
  
  const converted = conversionService.convertSpectrum(raw, {
    applyRSF: true,
    applyDeconvolution: options.level !== 'BASIC',
    unit
  });
  
  const gasPartialPressures = conversionService.getGasPartialPressures(unit);
  const totalPressure = conversionService.getTotalPressure(unit);
  
  return {
    raw,
    converted,
    gasPartialPressures,
    totalPressure,
    metadata,
    calibration,
    warnings
  };
}
```

---

## 12. UI-Anzeige

### Nach dem Laden

```
┌─────────────────────────────────────────────────────────────┐
│ 📂 pa055357 oipt large before bakeout_1h_1250v_23c_2,7e-6mbar.asc
├─────────────────────────────────────────────────────────────┤
│ Erkannte Parameter:                                         │
│   Beschreibung:   pa055357 oipt large                       │
│   Systemzustand:  UNBAKED (vor Ausheizen) → H₂O dominant   │
│   Totaldruck:     2.7×10⁻⁶ mbar (roh)                      │
│                   3.0×10⁻⁶ mbar (korrigiert)               │
│   Temperatur:     23°C                                      │
│   SEM-Spannung:   1250 V                                    │
│   Messzeit:       1 h                                       │
├─────────────────────────────────────────────────────────────┤
│ Kalibrierung:     STANDARD (automatisch)                    │
│ Korrekturen:                                                │
│   • Manometer (H₂O): ×1.11                                 │
│   • Temperatur (23°C): ×1.00                               │
│   • Dekonvolution: aktiv                                    │
│ Konfidenz:        Medium (±20-25%)                          │
├─────────────────────────────────────────────────────────────┤
│ Partialdrücke (dekonvoliert):                              │
│   H₂O:   2.1×10⁻⁶ mbar  (70%)  ████████████████░░░░        │
│   N₂:    4.5×10⁻⁷ mbar  (15%)  ████░░░░░░░░░░░░░░░░        │
│   CO:    2.1×10⁻⁷ mbar  (7%)   ██░░░░░░░░░░░░░░░░░░        │
│   H₂:    1.5×10⁻⁷ mbar  (5%)   █░░░░░░░░░░░░░░░░░░░        │
│   CO₂:   9.0×10⁻⁸ mbar  (3%)   █░░░░░░░░░░░░░░░░░░░        │
├─────────────────────────────────────────────────────────────┤
│ [Präzisionsmodus aktivieren...]  [Geräte-Kalibrierung...]  │
└─────────────────────────────────────────────────────────────┘
```

### Warnungen

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Warnungen                                                │
│                                                             │
│ • SEM-Spannung um 180V gestiegen seit 15.12.2025.          │
│   Neukalibrierung empfohlen.                                │
│                                                             │
│ [Später erinnern]  [Jetzt kalibrieren]                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 13. Zusammenfassung

### User-Input nach Level

| Level | Automatisch aus Dateiname | User-Input | Genauigkeit |
|-------|--------------------------|------------|-------------|
| BASIC | Totaldruck | Keiner | ±50% |
| STANDARD | + Systemzustand + Temperatur | Keiner | ±20-25% |
| ADVANCED | wie STANDARD | Einmalig: N₂-Kalibrierung | ±10-15% |
| PRECISION | wie STANDARD | + weitere Gase + SEM-Abgleich | ±5-10% |

### Typischer Workflow

1. **90% der Fälle**: Datei laden → STANDARD → fertig (kein Input)
2. **Kritische Messungen**: Einmalig ADVANCED kalibrieren → dann automatisch
3. **Vergleichsmessungen**: PRECISION für maximale Konsistenz

### Systemzustand-Keywords

| Keyword (EN) | Keyword (DE) | Erkannter Zustand |
|--------------|--------------|-------------------|
| before bakeout | vor ausheizen | UNBAKED |
| pre-bake | vor bakeout | UNBAKED |
| unbaked | nicht ausgeheizt | UNBAKED |
| after bakeout | nach ausheizen | BAKED |
| post-bake | nach bakeout | BAKED |
| baked | ausgeheizt | BAKED |
