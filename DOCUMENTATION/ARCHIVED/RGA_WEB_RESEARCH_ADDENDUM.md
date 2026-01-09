# RGA Analyser - Ergänzende Implementierung (Web-Recherche)

## Übersicht

Dieses Dokument ergänzt den `RGA_IMPLEMENTATION_GUIDE.md` mit Erkenntnissen aus umfangreicher Web-Recherche bei:
- **Herstellern:** Pfeiffer Vacuum, SRS, Hiden Analytical, INFICON, MKS Instruments
- **Forschungseinrichtungen:** CERN, DESY, NIST
- **Technischen Publikationen:** Application Notes, Tutorials, Datenbanken

---

## 1. CERN Vakuum-Akzeptanzkriterien (Vollständig)

### 1.1 Unbaked Systems (Normierung auf m/z 18 = H₂O)

**Quelle:** CERN VSC Criteria, EDMS 1347196

```typescript
const CERN_UNBAKED_LIMITS: LimitProfile = {
  name: "CERN Unbaked (24h Pumpdown)",
  description: "Für unbeheizte Systeme, H₂O dominant",
  normalizationMass: 18,
  normalizationDescription: "Alle Werte relativ zu H₂O (m/z 18)",
  
  limits: [
    // H₂O Region erlaubt
    { massRange: [17, 19], limit: 1.0, note: "H₂O + Fragmente" },
    
    // Zwischen H₂O und schweren Massen
    { massRange: [18, 44], limit: 0.01, note: "Außer 28 und 44" },
    { massRange: [27.5, 28.5], limit: 0.1, note: "N₂/CO erlaubt" },
    { massRange: [43.5, 44.5], limit: 0.1, note: "CO₂ erlaubt" },
    
    // KRITISCH: Schwere Massen (Kohlenwasserstoffe)
    { massRange: [44.5, 100], limit: 0.001, note: "PR/1000 - HC-frei" }
  ],
  
  additionalCriteria: {
    dominantGas: "H₂O",
    expectedState: "Water dominant nach 24h Pumpen",
    passCondition: "Alle Peaks > 44 amu < 0.1% des H₂O-Peaks"
  }
};
```

### 1.2 Baked Systems (Normierung auf m/z 2 = H₂)

**Quelle:** CERN VSC Criteria, ACC-V-ES-0001

```typescript
const CERN_BAKED_LIMITS: LimitProfile = {
  name: "CERN Baked (Nach Bakeout)",
  description: "Für ausgeheizte UHV-Systeme, H₂ dominant",
  normalizationMass: 2,
  normalizationDescription: "Alle Werte relativ zu H₂ (m/z 2)",
  
  limits: [
    // H₂ Region
    { massRange: [1, 3], limit: 1.0, note: "H₂ + H+" },
    
    // Leichte Gase
    { massRange: [3, 20], limit: 0.1, note: "10% von H₂ max" },
    
    // N₂/CO explizit erlaubt
    { massRange: [27.5, 28.5], limit: 0.1, note: "N₂/CO erlaubt bei 10%" },
    
    // Mittlere Massen strenger
    { massRange: [20.5, 27.5], limit: 0.01, note: "1% max" },
    { massRange: [28.5, 32.5], limit: 0.01, note: "O₂ Region" },
    { massRange: [32.5, 43.5], limit: 0.002, note: "0.2% max" },
    
    // CO₂ erlaubt bei 5%
    { massRange: [43.5, 44.5], limit: 0.05, note: "CO₂ bei 5%" },
    
    // KRITISCH: Schwere Massen
    { massRange: [44.5, 100], limit: 0.0001, note: "0.01% - HC streng" }
  ],
  
  additionalCriteria: {
    dominantGas: "H₂",
    expectedState: "Wasserstoff dominant nach Bakeout >120°C für 12h+",
    passCondition: "H₂ > H₂O, alle schweren Massen < 0.01%"
  }
};
```

### 1.3 CERN Ausgasungs- und Leckraten

```typescript
interface CERNOutgassingLimits {
  // Standard Ausgasraten nach Bakeout
  standardOutgassing: {
    h2_rate: 1e-10,           // mbar·l·s⁻¹·cm⁻² für H₂
    h2o_rate: 1e-11,          // mbar·l·s⁻¹·cm⁻² für H₂O
    description: "Nach 200°C/24h Bakeout auf Edelstahl"
  },
  
  // RGA-spezifische Ausgasung
  rgaOutgassing: {
    maxH2: 1e-8,              // mbar·l·s⁻¹ von Ion Source
    measureAfter: 2,          // Stunden nach Einschalten
    note: "Standard RGA ~10⁻⁸, CERN spec <1×10⁻⁸"
  },
  
  // Virtuelle Leckraten
  virtualLeakLimits: {
    lhc: 5e-9,                // mbar·l·s⁻¹ für LHC + Injection
    ps_sps: 0.2,              // 20% des Endrucks als Luftbeitrag
    description: "<1m NEG-Rohr pro Jahr gesättigt"
  },
  
  // He-Lecktest
  heLeakLimits: {
    single: 1e-11,            // mbar·l·s⁻¹ pro Einzelleck
    integral: 1e-10,          // mbar·l·s⁻¹ Gesamtsystem
    description: "Nach CERN Akzeptanztest"
  }
}

// Berechnung der Ausgasungsrate aus RGA-Daten
function calculateOutgassingRate(
  partialPressure: number,    // mbar
  pumpingSpeed: number,       // l/s
  surfaceArea: number         // cm²
): number {
  // Q = P × S / A
  return (partialPressure * pumpingSpeed) / surfaceArea;
}
```

---

## 2. DESY HC-Free Kriterium (Erweitert)

**Quelle:** DESY UHV Guidelines, ScienceDirect Paper

```typescript
const DESY_HC_FREE_CRITERION = {
  name: "DESY Kohlenwasserstoff-frei",
  
  definition: {
    totalPressureRequired: 1e-7,  // < 10⁻⁷ mbar
    hcFraction: 0.001,            // < 0.1% des Totaldrucks
    massRange: [45, 100],         // Summe aller Massen 45-100
    description: "Summe PartialdrÃ¼cke m/z 45-100 < 10⁻³ × Totaldruck"
  },
  
  srBeamlineRequirement: {
    hcPressure: 1e-3,             // relativ zum Totaldruck
    reason: "SR-gecrackter Kohlenstoff auf Spiegeln vermeiden",
    note: "Kritisch für FEL und 3. Gen. SR-Quellen"
  },
  
  cleaningStandard: {
    cleanRoom: "Class 100",       // ISO 5
    waterQuality: "Ultra-pure",
    drying: "110°C filtered air"
  }
};

function checkDESYHCFree(spectrum: RGASpectrum): boolean {
  const totalPressure = spectrum.getTotalPressure();
  
  // Summe aller Massen 45-100
  let hcSum = 0;
  for (let m = 45; m <= 100; m++) {
    hcSum += spectrum.getPartialPressure(m);
  }
  
  // Prüfe HC-Anteil
  const hcFraction = hcSum / totalPressure;
  
  return hcFraction < 0.001 && totalPressure < 1e-7;
}
```

---

## 3. SRS Dual-Detektor-System

**Quelle:** SRS Application Note #7, #9

```typescript
interface DualDetectorConfig {
  faradayCup: {
    noiseFloor: 1e-10,        // mbar
    maxPressure: 1e-4,        // mbar
    dynamicRange: 6,          // Dekaden
    advantages: [
      "Absolute Langzeitstabilität",
      "Keine Alterung",
      "Lineare Antwort"
    ],
    disadvantages: [
      "Begrenzte Empfindlichkeit",
      "Langsamer bei kleinen Strömen"
    ]
  },
  
  channelElectronMultiplier: {
    noiseFloor: 1e-14,        // mbar
    maxPressure: 1e-8,        // mbar (schonend für CEM)
    dynamicRange: 6,          // Dekaden
    gain: 1e5,                // bis 1e7
    advantages: [
      "Extrem empfindlich",
      "Einzelionen nachweisbar"
    ],
    disadvantages: [
      "Altert mit Zeit",
      "Gain variiert",
      "Max. Druck begrenzt"
    ]
  },
  
  combined: {
    dynamicRange: 8,          // Dekaden durch Umschalten
    detectionLimit: "10 ppb"  // 10 parts per billion
  }
};

// Automatische Detektor-Auswahl
function selectDetector(
  mass: number,
  expectedIntensity: number,
  pressure: number
): "FC" | "CEM" {
  // Hohe Intensität oder hoher Druck → Faraday
  if (expectedIntensity > 1e-10 || pressure > 1e-6) {
    return "FC";
  }
  
  // Spurengase → CEM
  return "CEM";
}

// SRS Table-Mode für gemischte Messung
interface TableModeMeasurement {
  masses: Array<{
    mass: number;
    detector: "FC" | "CEM";
    expectedGas: string;
  }>;
}

const EXAMPLE_TABLE_MODE: TableModeMeasurement = {
  masses: [
    { mass: 2, detector: "FC", expectedGas: "H₂" },
    { mass: 4, detector: "CEM", expectedGas: "He (Tracer)" },
    { mass: 18, detector: "FC", expectedGas: "H₂O" },
    { mass: 28, detector: "FC", expectedGas: "N₂/CO" },
    { mass: 32, detector: "FC", expectedGas: "O₂" },
    { mass: 40, detector: "CEM", expectedGas: "Ar (Spur)" },
    { mass: 44, detector: "FC", expectedGas: "CO₂" },
    { mass: 69, detector: "CEM", expectedGas: "CF₃+ (Fomblin)" }
  ]
};
```

---

## 4. Hiden Soft Ionization (Einzigartig)

**Quelle:** Hiden Analytical HPR-20 R&D Dokumentation

```typescript
interface SoftIonizationCapability {
  electronEnergyRange: {
    min: 4,      // eV
    max: 150,    // eV
    step: 0.1,   // eV Schrittweite
    standard: 70 // eV (Standard für Bibliotheksvergleich)
  },
  
  applications: [
    "Selektive Ionisierung bei Überlagerungen",
    "Unterscheidung CO/N₂ durch Ionisationsschwelle",
    "Reduzierte Fragmentierung für Molekülion-Identifikation",
    "Unterdrückung von Mehrfachionisation"
  ],
  
  // Ionisationsenergien wichtiger Gase
  ionizationEnergies: {
    H2: 15.4,
    He: 24.6,
    N2: 15.6,
    O2: 12.1,
    CO: 14.0,
    CO2: 13.8,
    H2O: 12.6,
    Ar: 15.8,
    CH4: 12.6
  }
};

// Algorithmus zur CO/N₂ Unterscheidung mit variabler Elektronenenergie
function distinguishCO_N2_byIonization(
  spectrum70eV: RGASpectrum,
  spectrum14_5eV?: RGASpectrum
): { ratio_CO: number; ratio_N2: number; confidence: number } {
  
  // Methode 1: Fragment-Verhältnisse bei 70 eV
  const m28 = spectrum70eV.getPeakIntensity(28);
  const m12 = spectrum70eV.getPeakIntensity(12);  // C+ nur von CO
  const m14 = spectrum70eV.getPeakIntensity(14);  // N+ hauptsächlich von N₂
  
  // N₂: m28/m14 ≈ 14
  // CO: m28/m12 ≈ 20
  
  const n2_indicator = m14 / m28 * 14;  // ~1 wenn reines N₂
  const co_indicator = m12 / m28 * 20;  // ~1 wenn reines CO
  
  const total = n2_indicator + co_indicator;
  
  if (total === 0) {
    return { ratio_CO: 0, ratio_N2: 0, confidence: 0 };
  }
  
  let ratio_N2 = n2_indicator / total;
  let ratio_CO = co_indicator / total;
  let confidence = 0.6;
  
  // Methode 2: Soft Ionization bei 14.5 eV (nur CO ionisiert, N₂ noch nicht)
  if (spectrum14_5eV) {
    const m28_soft = spectrum14_5eV.getPeakIntensity(28);
    
    // Bei 14.5 eV: CO (IE=14.0) ionisiert, N₂ (IE=15.6) nicht
    if (m28_soft > 0) {
      // Signal bei 14.5 eV stammt von CO
      ratio_CO = Math.min(m28_soft / m28, 1);
      ratio_N2 = 1 - ratio_CO;
      confidence = 0.9;
    }
  }
  
  return { ratio_CO, ratio_N2, confidence };
}
```

---

## 5. Virtual Leak Time-Series Analysis

**Quelle:** SRS Application Notes, CERN Tutorial

```typescript
interface VirtualLeakTimeSeriesAnalysis {
  // Charakteristika eines virtuellen Lecks
  characteristics: {
    pressureRise: "langsam",      // Minuten bis Stunden
    heLeakTest: "negativ",        // Keine externe He-Reaktion
    composition: "luftähnlich",   // Aber oft mehr H₂O
    behavior: "exponentiell",     // P(t) = P₀ + ΔP(1 - e^(-t/τ))
    temperatureCorrelation: true  // Steigt mit T
  },
  
  // Unterscheidung von echtem Leck
  differentiation: {
    realLeak: {
      heResponse: true,
      timeConstant: "sofort",
      n2o2Ratio: 3.7,
      arPresent: true
    },
    virtualLeak: {
      heResponse: false,
      timeConstant: "> 10 min",
      n2o2Ratio: "variabel",
      arPresent: "oft niedrig oder fehlend"
    },
    permeation: {
      heResponse: "langsam",
      species: ["He", "O₂", "H₂O"],  // Je nach Elastomer
      timeConstant: "Stunden bis Tage"
    }
  }
};

// Zeitkonstanten-Extraktion aus Druckverlauf
function extractTimeConstant(
  pressureData: Array<{ time: number; pressure: number }>
): { tau: number; confidence: number; isVirtualLeak: boolean } {
  
  if (pressureData.length < 10) {
    return { tau: 0, confidence: 0, isVirtualLeak: false };
  }
  
  // Sortiere nach Zeit
  const sorted = [...pressureData].sort((a, b) => a.time - b.time);
  
  // Finde Gleichgewichtsdruck (letzte 10% der Daten)
  const last10Percent = sorted.slice(-Math.ceil(sorted.length * 0.1));
  const pEquilibrium = last10Percent.reduce((sum, d) => sum + d.pressure, 0) / last10Percent.length;
  
  // Anfangsdruck
  const p0 = sorted[0].pressure;
  const deltaP = pEquilibrium - p0;
  
  if (deltaP <= 0) {
    // Druck fällt oder konstant → kein virtuelles Leck
    return { tau: 0, confidence: 0.8, isVirtualLeak: false };
  }
  
  // Finde τ: Zeit bei der P = P₀ + 0.632 × ΔP
  const targetP = p0 + 0.632 * deltaP;
  
  let tau = 0;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].pressure >= targetP) {
      // Lineare Interpolation
      const t1 = sorted[i - 1].time;
      const t2 = sorted[i].time;
      const p1 = sorted[i - 1].pressure;
      const p2 = sorted[i].pressure;
      
      tau = t1 + (t2 - t1) * (targetP - p1) / (p2 - p1);
      break;
    }
  }
  
  // Virtuelles Leck typisch: τ > 600s (10 min)
  const isVirtualLeak = tau > 600;
  const confidence = tau > 0 ? Math.min(0.5 + tau / 3600, 0.95) : 0;
  
  return { tau, confidence, isVirtualLeak };
}

// TCE Permeation Beispiel (aus SRS App Note)
const TCE_PERMEATION_EXAMPLE = {
  solvent: "Trichlorethylen",
  source: "O-Ring Quellung",
  outgassingDuration: "> 2 Wochen",
  characteristicMasses: [95, 97, 60, 35, 37],
  recommendation: "O-Ringe ausbauen und separat ausheizen"
};
```

---

## 6. MKS Prozessüberwachungs-Features

**Quelle:** MKS Vision 2000, Process Eye Professional

```typescript
interface ProcessMonitoringMode {
  // Scan-Modi
  scanModes: {
    barChart: "Alle Massen einmal scannen",
    analog: "Kontinuierlicher Scan",
    peakJump: "Nur ausgewählte Massen, schneller"
  },
  
  // Alarmschwellen
  alarmThresholds: {
    airLeak: {
      masses: [28, 32, 40],
      condition: "N₂/O₂ ratio = 3.7 ± 0.5",
      action: "Prozess stoppen, Lecksuche"
    },
    oilBackstreaming: {
      masses: [41, 43, 55, 57],
      condition: "Summe > Baseline × 10",
      action: "Pumpe prüfen, Trap regenerieren"
    },
    waterContamination: {
      masses: [18, 17],
      condition: "H₂O > Prozesslimit",
      action: "Länger pumpen oder Bakeout"
    },
    processEndpoint: {
      customMasses: true,  // Benutzerdefinist
      condition: "Ratio oder Absolutwert",
      action: "Prozessschritt beenden"
    }
  },
  
  // Echtzeit-Trends
  trendDisplay: {
    maxPoints: 10000,
    updateRate: "ms bis s",
    scales: ["linear", "log"],
    export: ["CSV", "Binary"]
  }
};

// Implementierung eines Alarmsystems
interface AlarmConfig {
  name: string;
  masses: number[];
  condition: "ratio" | "absolute" | "sum" | "delta";
  threshold: number;
  comparison: ">" | "<" | "=" | "!=";
  action: string;
  enabled: boolean;
}

function evaluateAlarm(
  spectrum: RGASpectrum,
  config: AlarmConfig
): { triggered: boolean; value: number; message: string } {
  
  let value = 0;
  
  switch (config.condition) {
    case "sum":
      value = config.masses.reduce((sum, m) => 
        sum + spectrum.getPeakIntensity(m), 0);
      break;
      
    case "ratio":
      if (config.masses.length >= 2) {
        const num = spectrum.getPeakIntensity(config.masses[0]);
        const den = spectrum.getPeakIntensity(config.masses[1]);
        value = den > 0 ? num / den : Infinity;
      }
      break;
      
    case "absolute":
      value = spectrum.getPeakIntensity(config.masses[0]);
      break;
      
    case "delta":
      // Benötigt vorherigen Wert (extern speichern)
      value = 0;  // Placeholder
      break;
  }
  
  let triggered = false;
  switch (config.comparison) {
    case ">": triggered = value > config.threshold; break;
    case "<": triggered = value < config.threshold; break;
    case "=": triggered = Math.abs(value - config.threshold) < 0.01; break;
    case "!=": triggered = Math.abs(value - config.threshold) >= 0.01; break;
  }
  
  return {
    triggered,
    value,
    message: triggered 
      ? `ALARM: ${config.name} - ${config.action}` 
      : `OK: ${config.name}`
  };
}
```

---

## 7. Kalibrierung und Sensitivitätsfaktoren

**Quelle:** SRS App Notes, CERN CAS Tutorial

```typescript
interface CalibrationFramework {
  // Relative Sensitivitäten (N₂ = 1.0)
  relativeSensitivities: {
    H2: 0.44,
    He: 0.14,
    Ne: 0.23,
    N2: 1.00,    // Referenz
    O2: 0.86,
    Ar: 1.20,
    CO: 1.05,
    CO2: 1.40,
    H2O: 0.90,
    CH4: 1.60,
    Kr: 1.70,
    Xe: 3.00
  },
  
  // Faktoren, die Sensitivität beeinflussen
  instrumentFactors: [
    "Elektronenenergie (Standard: 70 eV)",
    "Emissionsstrom",
    "Ionenquellen-Geometrie",
    "Quadrupol-Einstellungen",
    "Detektor-Typ (FC vs CEM)",
    "Multiplier-Gain",
    "Transmission"
  ],
  
  // Kalibrierungsmethoden
  calibrationMethods: {
    singleGas: {
      procedure: "Bekanntes Gas einlassen, Peak messen",
      accuracy: "±5%",
      frequency: "Initial + nach Filamentwechsel"
    },
    multiGas: {
      procedure: "Gasmischung mit bekannter Zusammensetzung",
      accuracy: "±2%",
      frequency: "Monatlich bei kritischen Anwendungen"
    },
    inSitu: {
      procedure: "Gaseinlass in laufendes System",
      accuracy: "±10%",
      frequency: "Bei Verdacht auf Drift"
    }
  }
};

// Partialdruck-Berechnung mit Sensitivitätskorrektur
function calculatePartialPressure(
  ionCurrent: number,          // A
  sensitivity: number,         // A/mbar (kalibriert für N₂)
  relativeSensitivity: number  // Gas relativ zu N₂
): number {
  return ionCurrent / (sensitivity * relativeSensitivity);
}

// Kalibrierfaktoren speichern
interface CalibrationData {
  gas: string;
  mass: number;
  sensitivityFactor: number;   // A/mbar
  calibrationDate: Date;
  temperature: number;         // °C
  emissionCurrent: number;     // mA
  electronEnergy: number;      // eV
  notes: string;
}
```

---

## 8. NIST Bibliotheks-Integration (Optional)

**Quelle:** NIST Mass Spectrometry Data Center

```typescript
interface NISTLibraryIntegration {
  // NIST 23 Datenbank
  database: {
    version: "NIST 23 (2023)",
    spectra: 394054,
    compounds: 347100,
    format: "Standard EI @ 70eV"
  },
  
  // Verfügbare Tools
  tools: {
    msSearch: "Spektrenvergleich",
    amdis: "GC/MS Dekonvolution",
    msInterpreter: "Fragmentierungs-Vorhersage"
  },
  
  // API/DLL für Integration
  api: {
    available: true,
    format: "DLL",
    license: "Kommerziell ($1000+)",
    documentation: "https://chemdata.nist.gov/"
  }
};

// Einfacher Spektrenvergleich (ohne NIST API)
function compareSpectrum(
  measured: RGASpectrum,
  library: CrackingPattern
): { matchScore: number; explanation: string } {
  
  let numerator = 0;
  let denominator1 = 0;
  let denominator2 = 0;
  
  // Cosinus-Ähnlichkeit
  for (const fragment of library.fragments) {
    const measuredInt = measured.getPeakIntensity(fragment.mass);
    const libraryInt = fragment.relativeIntensity / 100;
    
    numerator += measuredInt * libraryInt;
    denominator1 += measuredInt * measuredInt;
    denominator2 += libraryInt * libraryInt;
  }
  
  const matchScore = numerator / (Math.sqrt(denominator1) * Math.sqrt(denominator2));
  
  return {
    matchScore: isNaN(matchScore) ? 0 : matchScore,
    explanation: matchScore > 0.9 
      ? "Sehr gute Übereinstimmung" 
      : matchScore > 0.7 
        ? "Gute Übereinstimmung" 
        : "Schwache Übereinstimmung"
  };
}
```

---

## 9. Erweiterte Implementierungsprioritäten

### Phase 1A (Kritisch - zu Phase 1 hinzufügen)

| Feature | Beschreibung | Aufwand |
|---------|--------------|---------|
| CERN Unbaked Limits | Normierung auf m/z 18 | Niedrig |
| Ausgasungsraten-Berechnung | Q = P×S/A | Niedrig |
| Virtual Leak Zeitkonstante | τ aus P(t) extrahieren | Mittel |

### Phase 2A (Hoch - zu Phase 2 hinzufügen)

| Feature | Beschreibung | Aufwand |
|---------|--------------|---------|
| CO/N₂ Soft Ionization | Ionisationsschwellen-Methode | Mittel |
| Leck-Typ Klassifikation | Real/Virtual/Permeation | Mittel |
| Dual-Gas Leck-Bestätigung | He + Ar für Sicherheit | Niedrig |

### Phase 3A (Mittel)

| Feature | Beschreibung | Aufwand |
|---------|--------------|---------|
| Kalibrier-Framework | Sensitivitätsfaktoren speichern | Mittel |
| Dual-Detektor Logik | FC/CEM automatisch wählen | Mittel |
| Elastomer-Permeation Warnung | O-Ring Ausgasung erkennen | Niedrig |

### Phase 4A (Nice-to-have)

| Feature | Beschreibung | Aufwand |
|---------|--------------|---------|
| NIST API Integration | Spektrenvergleich | Hoch |
| Prozessüberwachung | Alarme, Trends | Hoch |
| Zeitreihen-Analyse | ESD, Pump-down Kurven | Mittel |

---

## 10. Wichtige Erkenntnisse aus der Recherche

### 10.1 Fehlende öffentliche Datenbanken

- **Kein Hersteller** bietet umfassende öffentliche Cracking-Pattern-Datenbanken
- NIST ist kommerziell (nicht frei verfügbar)
- Beste öffentliche Quelle: CERN RGA Tutorials

### 10.2 Soft Ionization ist einzigartig

- **Nur Hiden** bietet variable Elektronenenergie (4-150 eV)
- Ermöglicht CO/N₂ Unterscheidung ohne Fragment-Analyse
- Standard-RGAs haben fest 70 eV

### 10.3 CERN hat strengste Kriterien

- Detaillierteste öffentliche Dokumentation
- Unterscheidung Baked/Unbaked essentiell
- HC-Grenze bei 0.01% für schwere Massen

### 10.4 TCE-Permeation ist hartnäckig

- SRS dokumentiert 2+ Wochen Ausgasung aus O-Ringen
- O-Ringe müssen separat ausgeheizt werden
- Chlorierte Lösemittel vermeiden!

### 10.5 Argon-Permeation als Fehlerquelle

- Ar kann durch Elastomere permeieren
- Kann falsch-positive Leckdetektion verursachen
- Dual-Gas Test (He + Ar) empfohlen

---

## 11. Quellen und Referenzen

1. **SRS Application Note #7:** Vacuum Diagnosis with an RGA
   - https://www.thinksrs.com/downloads/pdfs/applicationnotes/Vac_diag_RGA.pdf

2. **SRS Application Note #9:** Choosing a Quadrupole Gas Analyzer

3. **CERN VSC Criteria:** Vacuum Acceptance Tests
   - https://indico.cern.ch/event/765714/contributions/3178599/

4. **CERN CAS Tutorial:** RGA Interpretation
   - Paolo Chiggiato, Outgassing Properties of Vacuum Materials

5. **Hiden Analytical:** HPR-20 R&D System Documentation

6. **MKS Instruments:** Vision 2000, Process Eye Professional

7. **INFICON:** Transpector Series Documentation

8. **NIST Mass Spectrometry Data Center:**
   - https://chemdata.nist.gov/

9. **Kurt J. Lesker:** Simple RGA Spectra Interpretation
   - https://www.lesker.com/newweb/technical_info/vacuumtech/rga_03_simpleinterpret.cfm

10. **DESY UHV Guidelines:**
    - Hydrocarbon-free specification

11. **EGO Outgassing Database:**
    - https://apps.et-gw.eu/outgassing/

---

*Erstellt: Januar 2026*
*Basierend auf Web-Recherche bei Vakuumherstellern und Forschungseinrichtungen*
