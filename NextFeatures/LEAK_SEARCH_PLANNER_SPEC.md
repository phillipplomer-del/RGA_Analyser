# LECKSUCHE-PLANER - Feature Spezifikation

## 1. Übersicht & Zielsetzung

Der **Lecksuche-Planer** ist ein intelligenter Assistent, der Vakuumtechnikern hilft, die optimale Lecksuchstrategie für ihr spezifisches Bauteil oder System zu entwickeln. 

**Kernfrage, die beantwortet wird:**
> "Ich habe Bauteil X mit Eigenschaften Y und brauche Leckrate Z - was brauche ich dafür?"

**Output:**
- Empfohlene Prüfmethode(n) mit Begründung
- Benötigte Pumpen/Saugleistung
- Equipment-Anforderungen
- Zeitschätzung
- Normkonformität (DIN EN 1779, etc.)
- Checkliste für die Durchführung

**Integration mit bestehenden Modulen:**
- **Geometrie-Rechner** → Volumen/Oberfläche aus dem Ausgasungs-Modul wiederverwenden
- **Material-Datenbank** → Ausgasraten aus gasLibrary.ts
- **Rate-of-Rise** → Direkte Verlinkung zur RoR-Analyse
- **RGA-Diagnose** → Virtual-Leak/Air-Leak Erkennung zur Nachbereitung

---

## 2. Eingabeparameter (User Interface)

### 2.1 Prüfling-Definition

```typescript
interface TestObject {
  // Grunddaten
  name: string;
  type: TestObjectType;
  
  // Geometrie - WIEDERVERWENDUNG aus Ausgasungs-Modul
  geometry: ChamberGeometry;  // Bestehender Typ aus Ausgasungssimulation
  // → Liefert automatisch: volume (L), surfaceArea (cm²)
  
  // Komplexität
  sealCount: number;        // Anzahl Dichtungen/Flansche
  sealTypes: SealType[];
  weldLength?: number;      // cm Schweißnaht
  feedthroughs?: number;    // Durchführungen
  
  // Druckfähigkeit
  canBeEvacuated: boolean;
  canBePressurized: boolean;
  maxPressure?: number;     // bar (für Überdruckprüfung)
}

type TestObjectType = 
  | 'vacuum_chamber'        // Vakuumkammer
  | 'cryostat'             // Kryostat
  | 'beamline'             // Strahlrohr
  | 'piping'               // Rohrleitungen
  | 'component'            // Einzelkomponente (Ventil, Flansch)
  | 'weld_seam'            // Schweißnaht
  | 'feedthrough'          // Durchführung
  | 'custom';

// Geometrie-Typen aus bestehendem Modul:
// - Zylinder (Durchmesser × Länge)
// - Quader (L × B × H)  
// - Kugel (Durchmesser)
// - Rohr (ID × OD × Länge)
// → Volumen und Oberfläche werden automatisch berechnet

type SealType = 
  | 'cf_metal'             // ConFlat Metalldichtung
  | 'kf_oring'             // KF/ISO-KF O-Ring
  | 'viton'                // Viton O-Ring
  | 'fkm'                  // FKM Elastomer
  | 'ptfe'                 // PTFE
  | 'copper'               // Kupferdichtung
  | 'welded'               // Verschweißt
  | 'brazed'               // Gelötet
  | 'glued'                // Geklebt
  | 'threaded';            // Gewinde (problematisch!)
```

### 2.2 Material & Oberfläche

**→ WIEDERVERWENDUNG aus gasLibrary.ts (Ausgasraten-Datenbank)**

```typescript
interface MaterialProperties {
  // Material aus bestehender Datenbank wählen
  // → Liefert automatisch: outgassingRate, bakingTemp, etc.
  materialId: string;       // Referenz auf gasLibrary Material
  
  // Oberflächenzustand
  surfaceFinish: SurfaceFinish;
  isBakedOut: boolean;
  bakeoutTemp?: number;     // °C (falls bekannt)
  
  // Virtual-Leak Risikofaktoren (NEU)
  hasBlindHoles: boolean;   // Sackbohrungen = HOHES Risiko!
  hasTrappedVolumes: boolean; // Doppel-O-Ring ohne Entlüftung
  hasThreadedFasteners: boolean; // Innengewinde
}

type SurfaceFinish = 
  | 'electropolished'      // Ra < 0.4 µm - BESTE Wahl
  | 'polished'             // Ra < 0.8 µm
  | 'machined'             // Ra 0.8-3.2 µm
  | 'as_welded'            // Schweißnaht unbearbeitet
  | 'bead_blasted';        // Gestrahlt

// Verfügbare Materialien aus gasLibrary:
// - Edelstahl 304/316L (verschiedene Vorbehandlungen)
// - Aluminium 6061
// - OFE Kupfer
// - Titan
// - PEEK, Viton, etc.
```

### 2.3 Anforderungen

```typescript
interface LeakTestRequirements {
  // Leckraten-Anforderung
  targetLeakRate: number;            // mbar·l/s
  leakRateSource?: LeakRateSource;   // Woher kommt die Anforderung?
  
  // Prüfart
  testPurpose: TestPurpose;
  needsLocalization: boolean;        // Muss Leck gefunden werden?
  needsQuantification: boolean;      // Muss Leckrate gemessen werden?
  
  // Rahmenbedingungen
  isProductionTest: boolean;         // Serie oder Einzelstück?
  cycleTimeLimit?: number;           // Sekunden (für Serienprüfung)
  budgetConstraint?: 'low' | 'medium' | 'high';
  
  // Umgebung
  testEnvironment: TestEnvironment;
  ambientTemp?: number;              // °C
  heliumAvailable: boolean;
  
  // RGA vorhanden?
  hasRGA: boolean;
  rgaAccessible: boolean;            // Kann RGA angeschlossen werden?
}

type LeakRateSource = 
  | 'cern_uhv'             // CERN UHV Acceptance: 1×10⁻¹⁰ mbar·l/s
  | 'gsi_cryo'             // GSI Kryostat: 1×10⁻⁹ mbar·l/s
  | 'industrial_hv'        // Industrie HV: 1×10⁻⁸ mbar·l/s
  | 'automotive'           // Automotive: 1×10⁻⁶ mbar·l/s
  | 'refrigeration'        // Kältetechnik: 1×10⁻⁵ mbar·l/s
  | 'ip67'                 // IP67 Dichtigkeit: ~2×10⁻³ mbar·l/s
  | 'custom';

type TestPurpose = 
  | 'acceptance'           // Abnahmeprüfung
  | 'troubleshooting'      // Fehlersuche
  | 'production_qc'        // Serienprüfung
  | 'maintenance'          // Wartungsprüfung
  | 'development';         // Entwicklung/Prototyp

type TestEnvironment = 
  | 'cleanroom'
  | 'laboratory'
  | 'production_floor'
  | 'field';               // Vor Ort (eingeschränkte Möglichkeiten)
```

---

## 3. Entscheidungslogik

### 3.1 Relevante Methoden nach DIN EN 1779

**Fokus auf Vakuum- und Helium-Methoden** (für UHV/HV-Anwendungen relevant):

| Code | Methode | Detektionslimit | Lokal/Integral | Prinzip |
|------|---------|-----------------|----------------|---------|
| **B2** | Druckanstieg (RoR) | 10⁻⁶ mbar·l/s | Integral | Vakuum + Zeit |
| **B3** | He-Akkumulation | 10⁻⁵ mbar·l/s | Integral | He + Vakuumglocke |
| **B4** | He-Schnüffeln | 10⁻⁶ mbar·l/s | **Lokal** | He-Druck + Sniffer |
| **B5** | He-Spray (Vakuum) | **10⁻¹² mbar·l/s** | **Lokal** | Vakuum + He-Spray |
| **B6** | He-Vakuum integral | 10⁻⁸ mbar·l/s | Integral | Vakuumglocke |

> **Hinweis:** Blasentests (A1/A2) und Druckabfall (B1) sind für HV/UHV-Anwendungen nicht sensitiv genug und daher nicht in dieser App enthalten.

### 3.2 Empfehlungs-Matrix

```
Ziel-Leckrate          Methode              RGA sinnvoll?
─────────────────────────────────────────────────────────
> 10⁻⁵ mbar·l/s       B2 (Rate-of-Rise)    Nein
10⁻⁵ - 10⁻⁶           B4 (He-Schnüffeln)   Optional
10⁻⁶ - 10⁻⁸           B5/B6 (He-Vakuum)    Empfohlen
< 10⁻⁸                B5 (He-Spray)        Pflicht
```

### 3.3 Entscheidungsbaum

```typescript
function selectTestMethod(
  requirements: LeakTestRequirements,
  testObject: TestObject
): LeakTestRecommendation {
  
  const targetRate = requirements.targetLeakRate;
  const canVacuum = testObject.canBeEvacuated;
  const canPressure = testObject.canBePressurized;
  const needsLocal = requirements.needsLocalization;
  const hasHelium = requirements.heliumAvailable;
  
  // ════════════════════════════════════════════════════════════════
  // STUFE 1: Grob-Check (> 10⁻⁵ mbar·l/s)
  // → Rate-of-Rise reicht aus
  // ════════════════════════════════════════════════════════════════
  if (targetRate >= 1e-5) {
    if (!canVacuum) {
      return { 
        method: 'not_possible', 
        reason: 'Prüfling muss evakuierbar sein für diese Empfindlichkeit' 
      };
    }
    return { 
      method: 'rate_of_rise', 
      code: 'B2',
      link: '/rate-of-rise',  // → Direkt zum bestehenden RoR-Modul
      note: 'Kein Helium nötig, kostengünstig'
    };
  }
  
  // ════════════════════════════════════════════════════════════════
  // STUFE 2: Mittel-Sensitivität (10⁻⁵ bis 10⁻⁷)
  // → Helium-Methoden erforderlich
  // ════════════════════════════════════════════════════════════════
  if (targetRate >= 1e-7) {
    if (!hasHelium) {
      return { 
        method: 'rate_of_rise', 
        code: 'B2', 
        warning: 'Empfindlichkeit grenzwertig! Helium empfohlen für zuverlässiges Ergebnis' 
      };
    }
    
    if (needsLocal) {
      if (canPressure) {
        return { method: 'helium_sniffer', code: 'B4' };
      }
      // Vakuum-Spray wenn kein Überdruck möglich
      return { method: 'helium_spray_vacuum', code: 'B5' };
    }
    
    // Integral-Test
    return { method: 'helium_vacuum_integral', code: 'B6' };
  }
  
  // ════════════════════════════════════════════════════════════════
  // STUFE 3: Hoch-Sensitivität (10⁻⁷ bis 10⁻¹⁰)
  // → Vakuum + Helium zwingend
  // ════════════════════════════════════════════════════════════════
  if (targetRate >= 1e-10) {
    if (!hasHelium) {
      return { method: 'impossible', reason: 'Helium ZWINGEND für diese Empfindlichkeit' };
    }
    if (!canVacuum) {
      return { method: 'impossible', reason: 'Prüfling muss evakuierbar sein' };
    }
    
    if (needsLocal) {
      return { 
        method: 'helium_spray_vacuum', 
        code: 'B5',
        requirements: [
          'Turbomolekularpumpe erforderlich',
          'Evakuieren auf < 10⁻⁵ mbar vor Test',
          'He von OBEN nach UNTEN aufsprühen'
        ]
      };
    }
    return { method: 'helium_vacuum_integral', code: 'B6' };
  }
  
  // ════════════════════════════════════════════════════════════════
  // STUFE 4: UHV-Niveau (< 10⁻¹⁰)
  // → Nur B5 mit optimalen Bedingungen
  // ════════════════════════════════════════════════════════════════
  return { 
    method: 'helium_spray_vacuum', 
    code: 'B5',
    requirements: [
      'UHV-Lecksucher mit Turbo erforderlich',
      'Prüfling muss auf < 10⁻⁶ mbar evakuierbar sein',
      'Ausheizen VOR Lecksuche für optimale Empfindlichkeit',
      'He-Hintergrund < 10⁻¹¹ mbar erforderlich'
    ]
  };
}
```

### 3.3 Virtuelle Leck Risiko-Bewertung

```typescript
interface VirtualLeakRisk {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  recommendations: string[];
}

function assessVirtualLeakRisk(
  testObject: TestObject,
  materials: MaterialProperties
): VirtualLeakRisk {
  
  const factors: string[] = [];
  let score = 0;
  
  // Sackbohrungen = Hauptrisiko
  if (materials.hasBlindHoles) {
    factors.push('Sackbohrungen vorhanden - HOHES Risiko für eingefangene Gasvolumen');
    score += 40;
  }
  
  // Gewindeverbindungen innen
  if (testObject.sealTypes.includes('threaded')) {
    factors.push('Gewindeverbindungen - Gas kann in Gewindegängen eingeschlossen sein');
    score += 30;
  }
  
  // Gussmaterial
  if (materials.material === 'cast_iron') {
    factors.push('Gussmaterial - mögliche Porösität und eingeschlossene Gasblasen');
    score += 25;
  }
  
  // Nicht ausgeheizt
  if (!materials.isBakedOut && materials.surfaceArea && materials.surfaceArea > 1000) {
    factors.push('Große Oberfläche ohne Bakeout - hohe H₂O Desorption erwartet');
    score += 20;
  }
  
  // Doppel-O-Ring ohne Entlüftung
  if (materials.hasTrappedVolumes) {
    factors.push('Eingeschlossene Volumina - prüfen ob Entlüftungsbohrungen vorhanden');
    score += 25;
  }
  
  // Raue Oberfläche
  if (materials.surfaceFinish === 'rough' || materials.surfaceFinish === 'as_welded') {
    factors.push('Raue Oberfläche - erhöhte Gasadsorption');
    score += 10;
  }
  
  const riskLevel = score < 20 ? 'low' 
    : score < 40 ? 'medium'
    : score < 60 ? 'high' 
    : 'critical';
    
  const recommendations: string[] = [];
  
  if (riskLevel !== 'low') {
    recommendations.push('Rate-of-Rise Test vor He-Lecksuche durchführen');
    recommendations.push('Bei He-Test negativ aber Druck steigt: Virtuelles Leck wahrscheinlich');
    
    if (materials.hasBlindHoles) {
      recommendations.push('Sackbohrungen mit Entlüftungsnuten versehen oder durchbohren');
    }
    
    if (!materials.isBakedOut) {
      recommendations.push('Ausheizen bei mindestens 150°C für 24h empfohlen');
    }
  }
  
  return { riskLevel, riskFactors: factors, recommendations };
}
```

---

## 4. Pumpen- und Equipment-Empfehlung

### 4.1 Pumpen-Auswahl

```typescript
interface PumpRecommendation {
  roughingPump: PumpSpec;
  turboPump?: PumpSpec;
  leakDetector: LeakDetectorSpec;
  additionalEquipment: string[];
}

interface PumpSpec {
  type: string;
  minPumpingSpeed: number;  // l/s
  pressureRange: { min: number; max: number };
  reasoning: string;
}

function calculatePumpRequirements(
  testObject: TestObject,
  requirements: LeakTestRequirements
): PumpRecommendation {
  
  const volume = testObject.volume;
  const targetPressure = requirements.targetLeakRate < 1e-7 ? 1e-5 : 1e-3; // mbar
  const desiredPumpdownTime = 300; // 5 Minuten als Standard
  
  // Grundformel: S = V/t × ln(p_atm/p_target)
  const minSpeed = (volume / desiredPumpdownTime) * Math.log(1013 / targetPressure);
  
  // Sicherheitsfaktor 1.5 für Leitwert-Verluste
  const recommendedSpeed = minSpeed * 1.5;
  
  // Leckrate kompensieren: S_zusatz = Q_leak / p_target
  const leakCompensation = requirements.targetLeakRate / targetPressure;
  const totalSpeed = recommendedSpeed + leakCompensation;
  
  const roughingPump: PumpSpec = {
    type: totalSpeed > 50 ? 'Roots + Drehschieber' : 'Drehschieber/Scroll',
    minPumpingSpeed: Math.ceil(totalSpeed),
    pressureRange: { min: 1e-3, max: 1013 },
    reasoning: `Basierend auf V=${volume}L, Ziel-Abpumpzeit ${desiredPumpdownTime}s`
  };
  
  // Turbo nur wenn UHV-nah
  let turboPump: PumpSpec | undefined;
  if (requirements.targetLeakRate < 1e-7) {
    turboPump = {
      type: 'Turbomolekularpumpe',
      minPumpingSpeed: Math.max(50, volume * 0.5), // Mindestens 0.5 × Volumen
      pressureRange: { min: 1e-10, max: 1e-3 },
      reasoning: 'Erforderlich für Leckraten < 10⁻⁷ mbar·l/s'
    };
  }
  
  // Leckdetektor-Empfehlung
  const leakDetector = selectLeakDetector(requirements.targetLeakRate);
  
  return {
    roughingPump,
    turboPump,
    leakDetector,
    additionalEquipment: getAdditionalEquipment(requirements, testObject)
  };
}

function selectLeakDetector(targetRate: number): LeakDetectorSpec {
  if (targetRate >= 1e-4) {
    return {
      type: 'Druckabfall-Prüfgerät',
      sensitivity: '10⁻⁴ mbar·l/s',
      cost: 'niedrig',
      examples: ['Standard Differenzdruckmessgerät']
    };
  }
  
  if (targetRate >= 1e-6) {
    return {
      type: 'Helium-Lecksucher (Schnüffler-fähig)',
      sensitivity: '10⁻⁷ mbar·l/s',
      cost: 'mittel',
      examples: ['Pfeiffer ASM 340', 'Leybold Phoenix Vario']
    };
  }
  
  return {
    type: 'Helium-Lecksucher (Vakuum-Methode)',
    sensitivity: '10⁻¹² mbar·l/s',
    cost: 'hoch',
    examples: ['Pfeiffer ASM 392', 'Leybold Phoenix L500i']
  };
}
```

### 4.2 Standard-Leckraten nach Anwendung

```typescript
const LEAK_RATE_STANDARDS: Record<string, LeakRateStandard> = {
  
  // ════════════════════════════════════════════════════════════════
  // UHV / Beschleuniger
  // ════════════════════════════════════════════════════════════════
  'cern_lhc': {
    rate: 1e-10,
    unit: 'mbar·l/s',
    source: 'CERN VSC Vacuum Acceptance',
    description: 'LHC Beschleunigerkomponenten',
    testMethod: 'B5',
    category: 'uhv'
  },
  'gsi_cryo': {
    rate: 1e-10,
    unit: 'mbar·l/s',
    source: 'GSI Technical Guideline 7.23e',
    description: 'Kryogene Vakuumsysteme, SIS18/ESR',
    testMethod: 'B5',
    category: 'uhv'
  },
  'gsi_strahlrohr': {
    rate: 1e-9,
    unit: 'mbar·l/s',
    source: 'GSI Technical Guideline 7.19e',
    description: 'Standard-Strahlrohre (nicht-kryo)',
    testMethod: 'B5/B6',
    category: 'uhv'
  },
  
  // ════════════════════════════════════════════════════════════════
  // Industrie HV
  // ════════════════════════════════════════════════════════════════
  'semiconductor': {
    rate: 1e-9,
    unit: 'mbar·l/s',
    source: 'SEMI Standards',
    description: 'Halbleiter-Prozessequipment',
    testMethod: 'B5',
    category: 'hv'
  },
  'coating_system': {
    rate: 1e-8,
    unit: 'mbar·l/s',
    source: 'Industrie-Standard',
    description: 'PVD/CVD Beschichtungsanlagen',
    testMethod: 'B6',
    category: 'hv'
  },
  'analytical_ms': {
    rate: 5e-9,
    unit: 'mbar·l/s',
    source: 'Pfeiffer Vacuum',
    description: 'Massenspektrometer-Analysekammern',
    testMethod: 'B5',
    category: 'hv'
  },
  'mbe_system': {
    rate: 1e-11,
    unit: 'mbar·l/s',
    source: 'MBE Best Practice',
    description: 'Molekularstrahlepitaxie',
    testMethod: 'B5',
    category: 'uhv'
  },
  
  // ════════════════════════════════════════════════════════════════
  // Standard-Vakuum / Forschung
  // ════════════════════════════════════════════════════════════════
  'vakuumofen': {
    rate: 1e-6,
    unit: 'mbar·l/s',
    source: 'Industrie-Standard',
    description: 'Vakuumöfen (Wärmebehandlung)',
    testMethod: 'B2/B4',
    category: 'standard'
  },
  'laborkammer': {
    rate: 1e-7,
    unit: 'mbar·l/s',
    source: 'Laborpraxis',
    description: 'Standard-Laborkammern',
    testMethod: 'B6',
    category: 'standard'
  },
  
  // ════════════════════════════════════════════════════════════════
  // Sonderfälle
  // ════════════════════════════════════════════════════════════════
  'cf_flansch': {
    rate: 1e-11,
    unit: 'mbar·l/s',
    source: 'Hersteller-Spezifikation',
    description: 'ConFlat-Flanschverbindung (einzeln)',
    testMethod: 'B5',
    category: 'component'
  },
  'schweissnaht': {
    rate: 1e-10,
    unit: 'mbar·l/s (pro cm)',
    source: 'CERN Welding Spec',
    description: 'UHV-Schweißnaht',
    testMethod: 'B5',
    category: 'component'
  },
  'durchfuehrung': {
    rate: 1e-10,
    unit: 'mbar·l/s',
    source: 'Hersteller-Spezifikation',
    description: 'Elektrische/optische Durchführung',
    testMethod: 'B5',
    category: 'component'
  }
};

// Kategorien für UI-Gruppierung
type LeakRateCategory = 'uhv' | 'hv' | 'standard' | 'component';
```

---

## 5. Ergebnis-Generierung

### 5.1 Vollständiger Report

```typescript
interface LeakSearchReport {
  // Meta
  generatedAt: Date;
  testObjectSummary: string;
  
  // Hauptempfehlung
  primaryMethod: {
    name: string;
    code: string;
    procedure: string[];
    estimatedDuration: number; // Minuten
  };
  
  // Alternative
  alternativeMethod?: {
    name: string;
    code: string;
    when: string; // Wann verwenden
  };
  
  // Equipment
  equipment: {
    pumps: PumpRecommendation;
    consumables: string[];
    estimatedCost: 'niedrig' | 'mittel' | 'hoch';
  };
  
  // Risiken
  risks: {
    virtualLeakRisk: VirtualLeakRisk;
    otherRisks: string[];
  };
  
  // Normkonformität
  compliance: {
    applicableStandards: string[];
    documentationRequired: string[];
  };
  
  // Checkliste
  checklist: ChecklistItem[];
  
  // RGA-Integration
  rgaRecommendation?: {
    useful: boolean;
    reason: string;
    whatToLookFor: string[];
  };
}

interface ChecklistItem {
  step: number;
  category: 'preparation' | 'execution' | 'evaluation';
  action: string;
  critical: boolean;
  note?: string;
}
```

### 5.2 Beispiel-Checkliste He-Vakuum-Lecksuche

```typescript
const HELIUM_VACUUM_CHECKLIST: ChecklistItem[] = [
  // Vorbereitung
  { step: 1, category: 'preparation', action: 'Prüfling reinigen und trocknen', critical: true },
  { step: 2, category: 'preparation', action: 'Alle Flansche und Dichtungen prüfen', critical: true },
  { step: 3, category: 'preparation', action: 'Lecksucher kalibrieren mit Testleck', critical: true },
  { step: 4, category: 'preparation', action: 'Evakuieren bis < 10⁻⁴ mbar', critical: true },
  { step: 5, category: 'preparation', action: 'Stabilisierung abwarten (5-10 min)', critical: false },
  
  // Durchführung
  { step: 6, category: 'execution', action: 'Nullpunkt am Lecksucher notieren', critical: true },
  { step: 7, category: 'execution', action: 'He-Besprühung beginnen: OBEN anfangen', critical: true, 
    note: 'Helium steigt nach oben - von oben nach unten arbeiten!' },
  { step: 8, category: 'execution', action: 'Sprühgeschwindigkeit: max. 1 cm/s', critical: true },
  { step: 9, category: 'execution', action: 'Jeden Flansch, Schweißnaht, Durchführung abfahren', critical: true },
  { step: 10, category: 'execution', action: 'Bei Ausschlag: Position markieren', critical: true },
  { step: 11, category: 'execution', action: 'Warten bis He-Hintergrund sinkt', critical: false },
  { step: 12, category: 'execution', action: 'Leckstelle erneut besprühen zur Bestätigung', critical: true },
  
  // Auswertung
  { step: 13, category: 'evaluation', action: 'Leckrate quantifizieren', critical: true },
  { step: 14, category: 'evaluation', action: 'Mit Grenzwert vergleichen', critical: true },
  { step: 15, category: 'evaluation', action: 'Protokoll erstellen mit Kalibrierdaten', critical: true }
];
```

---

## 6. UI-Konzept

### 6.1 Wizard-Flow (4 Schritte)

**Schritt 1: Prüfling** 
- Dropdown: Typ auswählen (Kammer, Rohr, Komponente...)
- Volumen eingeben
- Kann evakuiert werden? [Ja/Nein]
- Kann unter Druck gesetzt werden? [Ja/Nein]

**Schritt 2: Material & Oberfläche**
- Material-Auswahl
- Dichtungstypen (Mehrfachauswahl)
- Oberflächen-Zustand
- Kritische Warnung bei Sackbohrungen/Gewinden

**Schritt 3: Anforderungen**
- Leckrate eingeben ODER aus Preset wählen (Dropdown mit Standards)
- Ziel: Nur Dichtigkeit prüfen? Leck lokalisieren?
- Zeitrahmen / Budget
- Helium verfügbar?

**Schritt 4: Ergebnis**
- Hauptempfehlung mit Begründung
- Equipment-Liste mit Pumpen
- Virtual-Leak Risikowarnung (wenn relevant)
- Checkliste zum Ausdrucken/Exportieren
- RGA-Hinweise (wenn vorhanden)

### 6.2 Visualisierungen

1. **Sensitivitäts-Skala**: Balkendiagramm zeigt wo die gewählte Leckrate liegt
2. **Methoden-Vergleich**: Tabelle mit Vor-/Nachteilen
3. **Risiko-Ampel**: Virtuelles Leck Wahrscheinlichkeit
4. **Flowchart**: Zeigt den Entscheidungspfad

---

## 7. RGA-Integration

### 7.1 Wann RGA sinnvoll

```typescript
function isRGAUseful(
  requirements: LeakTestRequirements,
  testObject: TestObject
): RGARecommendation {
  
  const reasons: string[] = [];
  let useful = false;
  
  // Echtes vs. virtuelles Leck unterscheiden
  if (testObject.canBeEvacuated) {
    reasons.push('Unterscheidung echtes Leck vs. virtuelles Leck durch Gasanalyse');
    useful = true;
  }
  
  // Bei UHV-Anforderungen
  if (requirements.targetLeakRate < 1e-8) {
    reasons.push('Überwachung des Restgasspektrums für UHV-Qualifikation');
    useful = true;
  }
  
  // Kontaminationssuche
  if (requirements.testPurpose === 'troubleshooting') {
    reasons.push('Identifikation von Kontaminationsquellen (Öl, Lösemittel, etc.)');
    useful = true;
  }
  
  const whatToLookFor: string[] = [];
  
  if (useful) {
    whatToLookFor.push('N₂/O₂ Verhältnis 3.7:1 → Echtes Luftleck');
    whatToLookFor.push('Ar bei m/z 40 → Bestätigung Luftleck');
    whatToLookFor.push('H₂O dominant ohne O₂ → Virtuelles Leck wahrscheinlich');
    whatToLookFor.push('Kohlenwasserstoffe → Öl/Fett Kontamination');
  }
  
  return {
    useful,
    reason: reasons.join('. '),
    whatToLookFor
  };
}
```

### 7.2 RGA-Diagnose nach Lecksuche

Die App kann vorhandene RGA-Daten nutzen um:
- Nach He-Lecksuche: Prüfen ob Resthelium sichtbar
- Bei negativer He-Suche: Analysieren ob virtuelles Leck vorliegt
- Outgassing-Rate abschätzen aus H₂O/H₂ Peaks

---

## 8. Implementierungs-Phasen

### Phase 1: MVP (1-2 Wochen)
- [ ] Basis-Wizard mit 3 Schritten (Geometrie bereits vorhanden)
- [ ] Methodenauswahl-Algorithmus (B2-B6)
- [ ] Standard-Leckraten Presets (Dropdown)
- [ ] Virtual-Leak Risiko-Ampel
- [ ] Link zu bestehendem RoR-Modul

### Phase 2: Pumpen & Equipment (1 Woche)
- [ ] Pumpen-Empfehlung mit Berechnungsformel
- [ ] Equipment-Checkliste
- [ ] PDF-Export der Empfehlung

### Phase 3: RGA-Brücke (1 Woche)
- [ ] "Nach der Lecksuche" → RGA-Analyse empfehlen
- [ ] Virtual-Leak Detektor nutzen zur Validierung
- [ ] Luftleck-Detektor für Bestätigung

### Wiederverwendbare Komponenten

| Komponente | Quelle | Verwendung |
|------------|--------|------------|
| `ChamberGeometry` | Ausgasungs-Modul | Volumen/Oberfläche Rechner |
| `gasLibrary.ts` | Bestehend | Material + Ausgasraten |
| `RateOfRisePage` | Bestehend | Direkt-Link für B2-Tests |
| `detectAirLeak()` | detectors.ts | Nach-Prüfung |
| `detectVirtualLeak()` | detectors.ts | Nach-Prüfung |
| `LeakRateLimits` | RoR-Types | Standard-Grenzwerte |

---

## 9. UI-Flow (Vereinfacht)

```
┌─────────────────────────────────────────────────────────────────┐
│  LECKSUCHE-PLANER                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SCHRITT 1: Prüfling                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Typ: [Vakuumkammer ▼]                                  │   │
│  │                                                         │   │
│  │  Geometrie: [Zylinder ▼]                               │   │
│  │  ┌──────────────┐  ┌──────────────┐                    │   │
│  │  │ Ø 300 mm     │  │ L 500 mm     │                    │   │
│  │  └──────────────┘  └──────────────┘                    │   │
│  │                                                         │   │
│  │  → Volumen: 35.3 L | Oberfläche: 6126 cm²             │   │
│  │                                                         │   │
│  │  ☑ Kann evakuiert werden                               │   │
│  │  ☑ Kann unter Druck gesetzt werden                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  SCHRITT 2: Material & Risiken                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Material: [Edelstahl 316L (unbehandelt) ▼]            │   │
│  │  Oberfläche: [Elektropoliert ▼]                        │   │
│  │  ☐ Ausgeheizt                                          │   │
│  │                                                         │   │
│  │  ⚠️ VIRTUAL-LEAK RISIKO:                               │   │
│  │  ☐ Sackbohrungen vorhanden                             │   │
│  │  ☐ Gewinde innen ohne Entlüftung                       │   │
│  │  ☐ Doppel-O-Ring ohne Entlüftung                       │   │
│  │                                                         │   │
│  │  🟢 Risiko: NIEDRIG                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  SCHRITT 3: Anforderung                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Ziel-Leckrate:                                        │   │
│  │  ○ Standard wählen: [GSI Strahlrohr (1×10⁻⁹) ▼]       │   │
│  │  ○ Manuell: [________] mbar·l/s                        │   │
│  │                                                         │   │
│  │  ☑ Leck muss lokalisiert werden                        │   │
│  │  ☑ Helium verfügbar                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [EMPFEHLUNG BERECHNEN]                                        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ERGEBNIS                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ✓ EMPFOHLENE METHODE: B5 - Helium-Spray (Vakuum)     │   │
│  │                                                         │   │
│  │  Begründung:                                           │   │
│  │  • Ziel-Leckrate 10⁻⁹ erfordert Vakuum-Methode        │   │
│  │  • Lokalisierung gewünscht → Spray-Methode             │   │
│  │  • Prüfling evakuierbar ✓                              │   │
│  │                                                         │   │
│  │  ────────────────────────────────────────────────────  │   │
│  │                                                         │   │
│  │  PUMPEN-EMPFEHLUNG:                                    │   │
│  │  • Vorvakuum: Scroll/Drehschieber ≥ 8 m³/h            │   │
│  │  • Hochvakuum: Turbo ≥ 70 l/s                         │   │
│  │  • Ziel vor Test: < 10⁻⁵ mbar                         │   │
│  │                                                         │   │
│  │  ────────────────────────────────────────────────────  │   │
│  │                                                         │   │
│  │  NÄCHSTE SCHRITTE:                                     │   │
│  │  [📋 Checkliste anzeigen]  [📄 PDF Export]            │   │
│  │  [🔬 → RoR-Test starten]  [📊 → RGA-Analyse]          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Referenzen

- **DIN EN 1779**: Zerstörungsfreie Prüfung - Dichtheitsprüfung - Kriterien zur Auswahl von Prüfverfahren und -techniken
- **DIN EN 1330-8**: Terminologie Dichtheitsprüfung
- **DIN EN ISO 20485**: Tracergas-Dichtheitsprüfung
- **CERN VSC Criteria**: Vacuum Acceptance Test Specification
- **GSI Technical Guidelines**: 7.19e, 7.23e (Kryostat Testing)
- **Leybold Vacuum Fundamentals**: Leak Detection Know-How
- **Pfeiffer Vacuum Know-How**: Leak Detection Methods
