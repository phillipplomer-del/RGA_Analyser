# Lecksuche-Planer – Master V7 COMPLETE
## Vollständiges Implementierungs-Spec (Merged aus V1-V6)

**Datum:** 2026-01-08  
**Version:** 7.0 (IMPLEMENTATION READY)  
**Zweck:** Vollständige Spezifikation für Claude Code Implementierung

---

## CHANGE LOG V6 → V7

**Hinzugefügt:**
- ✅ Vollständige TypeScript Type Definitions (alle Interfaces)
- ✅ Equipment Database Schema mit Beispiel-Geräten
- ✅ Vollständige Preset-Listen (CERN, GSI, Industrial Standards)
- ✅ Virtual Leak Risk Scoring System (0-100 Punkte, konkrete Schwellwerte)
- ✅ Methodenauswahl Decision Tree (vollständig spezifiziert)
- ✅ UI Screen Specifications (alle Felder, Validierungen, Defaults)
- ✅ Report/Export Template Specification
- ✅ RGA-Integration Workflow Details

**Beibehalten aus V6:**
- ✅ Engine-Physik (Leitwert, Zeitkonstanten, Teilstrom, etc.)
- ✅ Warnlogik mit Maßnahmen
- ✅ Testkatalog
- ✅ Quick/Expert-Modi

---

# TEIL 1: OVERVIEW & SCOPE

## 1.1 Ziel & Scope

### Ziel
Die App erzeugt aus wenigen Eingaben einen **ausführbaren Prüfplan**:
- Welche Methode ist sinnvoll (B5/B6/B2; B4 nur als Vorcheck)?
- Wie baue ich auf (in Worten und später als Skizze)?
- Wie lange muss ich realistisch warten/messen?
- Welche typischen Fehlerquellen liegen vor?
- Wie dokumentiere ich das auditfähig?

### Fokus HV/UHV (V1)
- **Prüflinge:** Vakuumkammern, UHV-Module, Flansche, Feedthroughs, Ventile, Pumpenanschlüsse
- **Methoden:**
  - **B5 Helium-Spray (Vakuummethode, lokal)** – Standard
  - **B6 Helium integral (Haube/Kammer)** – Standard für Serien-/Endabnahme
  - **B2 Rate-of-Rise / Druckanstieg** – Diagnose & Vorabtest
  - **B4 Sniffer** – nur für Groblecks / Produktions-Vorcheck
- **Nicht Kern von V1:** "Sealed Device / Bombing" (Advanced, separat)

### Prinzip: "Anwender zuerst"
Die UI zeigt **keine Formeln**. Die App liefert:
- klare Entscheidung + Begründung in Alltagssprache
- konkrete Handlungsanweisungen
- Warnungen immer mit "Was tun?"

Formeln bleiben im Engine-Teil (optional in "Details anzeigen"-Panel).

---

## 1.2 Nutzerbild & UX-Regeln

### Zielnutzer
Anwender, die Lecksuche durchführen, aber nicht jede Leitwertgleichung auswendig kennen.

### UX-Regeln (verbindlich)
1. **"Ich weiß es nicht" muss überall möglich sein.**  
   → Dann arbeitet die App mit konservativen Defaults: "Wir nehmen X an, damit du weiterkommst."

2. **2 Modi:**
   - **Quick (Default):** wenige Felder, robuste Annahmen
   - **Expert (optional):** Leitungslängen/Durchmesser, Ventiltypen, detaillierte Geräteparameter

3. **Ergebnis immer als 3 Karten:**
   - **Methode**
   - **Aufbau**
   - **Zeit & Grenzen**

4. **Warnungen sind Aufgaben:**  
   Jede Warnung enthält: *Problem* → *Auswirkung* → *konkrete Maßnahme*

---

# TEIL 2: TYPESCRIPT TYPE DEFINITIONS

## 2.1 Core Types

```typescript
// ============================================================================
// PRÜFLING (TEST OBJECT)
// ============================================================================

interface TestObject {
  // Grunddaten
  id: string;
  name: string;
  type: TestObjectType;
  
  // Geometrie (wiederverwendet aus Ausgasungs-Modul)
  geometry: ChamberGeometry;  // liefert: volume_L, surfaceArea_cm2
  
  // Dichtungen
  sealCount: number;
  sealTypes: SealType[];
  weldLength_cm?: number;
  feedthroughCount?: number;
  
  // Eigenschaften
  canBeEvacuated: boolean;
  canBePressurized: boolean;
  maxPressure_bar?: number;
  
  // Zugänglichkeit
  accessOutside: 'full' | 'partial' | 'limited';
  
  // Virtual Leak Risikofaktoren
  hasBlindHoles: boolean;
  hasThreadedFasteners: boolean;
  hasTrappedVolumes: boolean;
}

type TestObjectType = 
  | 'vacuum_chamber'
  | 'cryostat'
  | 'beamline'
  | 'piping'
  | 'valve'
  | 'flange'
  | 'feedthrough'
  | 'weld_seam'
  | 'component'
  | 'custom';

type SealType = 
  | 'cf_metal'      // ConFlat Metalldichtung
  | 'kf_oring'      // KF/ISO-KF O-Ring
  | 'viton'         // Viton O-Ring
  | 'fkm'           // FKM Elastomer
  | 'ptfe'          // PTFE
  | 'copper'        // Kupferdichtung
  | 'welded'        // Verschweißt
  | 'threaded';     // Gewinde (RISIKO!)

// Geometrie aus bestehendem Modul
interface ChamberGeometry {
  shape: 'rectangular' | 'cylindrical' | 'spherical' | 'tube';
  dimensions: {
    length_cm?: number;
    width_cm?: number;
    height_cm?: number;
    diameter_cm?: number;
    innerDiameter_cm?: number;
    outerDiameter_cm?: number;
  };
  volume_L: number;          // berechnet
  surfaceArea_cm2: number;   // berechnet
}

// ============================================================================
// MATERIAL & OBERFLÄCHE
// ============================================================================

interface MaterialProperties {
  materialId: string;  // Referenz auf gasLibrary
  surfaceFinish: SurfaceFinish;
  isBakedOut: boolean;
  bakeoutTemp_C?: number;
}

type SurfaceFinish = 
  | 'electropolished'   // Ra < 0.4 µm - BESTE Wahl
  | 'polished'          // Ra < 0.8 µm
  | 'machined'          // Ra 0.8-3.2 µm
  | 'as_welded'         // Schweißnaht unbearbeitet
  | 'bead_blasted'      // Gestrahlt
  | 'rough';            // Rau

// ============================================================================
// ANFORDERUNGEN (REQUIREMENTS)
// ============================================================================

interface TestRequirements {
  // Leckrate
  targetLeakRate_mbar_l_s: number;
  leakRateSource?: LeakRatePreset;  // Preset ID
  
  // Prüfart
  localizationRequired: boolean;
  quantificationRequired: boolean;
  
  // Rahmenbedingungen
  timeLimit_s?: number;
  
  // Dokumentation
  reportLevel: 'simple' | 'audit';
  
  // Verfügbares Equipment
  heliumAvailable: boolean;
  hasRGA: boolean;
}

type LeakRatePreset = 
  | 'cern-lhc'          // 1×10⁻¹⁰ mbar·l/s
  | 'gsi-cryo'          // 1×10⁻¹⁰ mbar·l/s
  | 'gsi-beamline'      // 1×10⁻⁹ mbar·l/s
  | 'semiconductor'     // 1×10⁻⁹ mbar·l/s
  | 'coating'           // 1×10⁻⁸ mbar·l/s
  | 'vacuum_furnace'    // 1×10⁻⁶ mbar·l/s
  | 'cf_flange'         // 1×10⁻¹¹ mbar·l/s
  | 'uhv_weld'          // 1×10⁻¹⁰ mbar·l/s per cm
  | 'custom';

// ============================================================================
// EQUIPMENT
// ============================================================================

interface Equipment {
  leakDetector: LeakDetector;
  systemPumping?: SystemPumping;
  connections: Connection[];
  hoodAvailable: boolean;
}

interface LeakDetector {
  model: string;           // z.B. "Pfeiffer ASM 340"
  selectedMode: string;    // z.B. "FINE"
  modes: LeakDetectorMode[];
}

interface LeakDetectorMode {
  name: string;            // "FINE", "GROSS", "ULTRA"
  mdl_mbar_l_s: number;    // Minimum Detectable Leak Rate
  inlet_p_mbar_min: number;
  inlet_p_mbar_max: number;
  response_time_s: number;
  cleanup_time_s: number;
  seff_l_s?: number;       // effektives Saugvermögen im Mode
}

interface SystemPumping {
  activeDuringTest: boolean;
  pumpSpeed_l_s: number;   // Geschätzt oder bekannt
  pumpType?: 'rotary_vane' | 'scroll' | 'turbo' | 'cryo';
}

interface Connection {
  kind: 'tube' | 'valve' | 'adapter' | 'bellows';
  dn?: string;             // z.B. "KF40", "DN100"
  length_cm?: number;
  innerDiameter_cm?: number;
  bends?: number;
  valveType?: 'gate' | 'angle' | 'ball' | 'butterfly';
  valveState?: 'open' | 'closed' | 'partial';
  notes?: string;
}

// ============================================================================
// ENGINE INPUT (Complete)
// ============================================================================

interface LeakSearchInput {
  testObject: TestObject;
  materials: MaterialProperties;
  requirements: TestRequirements;
  equipment: Equipment;
  mode: 'quick' | 'expert';
}

// ============================================================================
// ENGINE OUTPUT (Complete Plan)
// ============================================================================

interface LeakSearchPlan {
  // Methodenempfehlung
  recommendedMethod: LeakTestMethod;
  methodCode: 'B2' | 'B4' | 'B5' | 'B6';
  methodName: string;
  methodNameEn: string;
  reasoning: string[];
  reasoningEn: string[];
  
  // Alternativen
  alternatives: AlternativeMethod[];
  
  // Setup
  setup: SetupInstructions;
  
  // Zeiten & Grenzen
  timing: TimingEstimates;
  
  // Nachweisgrenze
  sensitivity: SensitivityAnalysis;
  
  // Warnungen
  warnings: Warning[];
  
  // Virtual Leak Risk
  virtualLeakRisk: VirtualLeakRiskAssessment;
  
  // Checkliste
  checklist: ChecklistItem[];
  
  // RGA Integration
  rgaRecommendations?: RGARecommendations;
  
  // Audit
  audit: AuditBlock;
  
  // Meta
  planVersion: string;
  engineVersion: string;
  createdAt: string;
}

type LeakTestMethod = 
  | 'rate_of_rise'           // B2
  | 'helium_sniffer'         // B4
  | 'helium_spray_vacuum'    // B5
  | 'helium_vacuum_integral' // B6
  | 'not_possible';

interface AlternativeMethod {
  method: LeakTestMethod;
  code: string;
  reason: string;
  reasonEn: string;
}

interface SetupInstructions {
  connectionType: 'series' | 'split_flow' | 'direct';
  steps: string[];
  stepsEn: string[];
  valveStates: ValveState[];
  schematicHint?: string;  // z.B. "Detektor direkt an Prüfling, Pumpe isoliert"
}

interface ValveState {
  name: string;
  state: 'open' | 'closed' | 'throttled';
  reason: string;
}

interface TimingEstimates {
  pumpdown_s: number;
  stabilization_s: number;
  waitPerSpot_s: number;
  totalMeasurement_s: number;
  cleanup_s: number;
  
  // Begründung
  tau_s: number;            // Zeitkonstante
  kTauFactor: number;       // Multiplikator (2-5)
}

interface SensitivityAnalysis {
  mdl_device_mbar_l_s: number;      // Geräte-MDL
  mdl_effective_mbar_l_s: number;   // Effektiv im Setup
  seff_l_s: number;                 // Effektives Saugvermögen
  splitFlowFactor?: number;         // Falls Teilstrom
  backgroundHe_mbar?: number;       // He-Background
  limitingFactor: 'device' | 'conductance' | 'background' | 'permeation';
}

interface Warning {
  code: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'conductance' | 'split_flow' | 'background' | 'permeation' | 'virtual_leak' | 'time';
  problem: string;
  problemEn: string;
  impact: string;
  impactEn: string;
  action: string;
  actionEn: string;
}

interface VirtualLeakRiskAssessment {
  level: 'low' | 'medium' | 'high' | 'critical';
  score: number;                    // 0-100
  factors: RiskFactor[];
  recommendations: string[];
  recommendationsEn: string[];
}

interface RiskFactor {
  factor: string;
  factorEn: string;
  weight: number;
  present: boolean;
}

interface ChecklistItem {
  phase: 'preparation' | 'execution' | 'evaluation';
  item: string;
  itemEn: string;
  mandatory: boolean;
}

interface RGARecommendations {
  useful: boolean;
  reason: string;
  reasonEn: string;
  whatToLookFor: string[];
  whatToLookForEn: string[];
  linkToRGA: boolean;
}

interface AuditBlock {
  standard: string;              // "ISO 20485"
  calibration: CalibrationInfo;
  decisionRule: string;
  assumptions: string[];
  assumptionsEn: string[];
}

interface CalibrationInfo {
  refLeak_mbar_l_s?: number;
  lastCalibration?: string;
  nextCalibration?: string;
  status: 'unknown' | 'valid' | 'expired';
}
```

---

# TEIL 3: EQUIPMENT DATABASE

## 3.1 Leak Detector Datenbank

```typescript
// src/lib/leakSearch/equipmentDatabase.ts

export interface LeakDetectorSpec {
  id: string;
  manufacturer: string;
  model: string;
  type: 'sniffer' | 'vacuum' | 'portable';
  modes: LeakDetectorMode[];
  notes?: string;
}

export const LEAK_DETECTORS: LeakDetectorSpec[] = [
  // Pfeiffer Vacuum
  {
    id: 'pfeiffer-asm340',
    manufacturer: 'Pfeiffer Vacuum',
    model: 'ASM 340',
    type: 'vacuum',
    modes: [
      {
        name: 'FINE',
        mdl_mbar_l_s: 5e-13,
        inlet_p_mbar_min: 1e-5,
        inlet_p_mbar_max: 5,
        response_time_s: 1.0,
        cleanup_time_s: 30,
        seff_l_s: 1.2
      },
      {
        name: 'GROSS',
        mdl_mbar_l_s: 1e-7,
        inlet_p_mbar_min: 1e-2,
        inlet_p_mbar_max: 50,
        response_time_s: 0.5,
        cleanup_time_s: 10,
        seff_l_s: 0.5
      }
    ],
    notes: 'Standard UHV leak detector, Turbo + Vorvakuum integriert'
  },
  {
    id: 'pfeiffer-asm142',
    manufacturer: 'Pfeiffer Vacuum',
    model: 'ASM 142',
    type: 'sniffer',
    modes: [
      {
        name: 'SNIFFER',
        mdl_mbar_l_s: 1e-6,
        inlet_p_mbar_min: 1000,
        inlet_p_mbar_max: 1013,
        response_time_s: 0.3,
        cleanup_time_s: 5
      }
    ],
    notes: 'Schnüffel-Modus, für B4 (Überdruck-Prüfung)'
  },
  
  // Leybold
  {
    id: 'leybold-phoenix-l300',
    manufacturer: 'Leybold',
    model: 'PHOENIX L300',
    type: 'vacuum',
    modes: [
      {
        name: 'ULTRA',
        mdl_mbar_l_s: 1e-12,
        inlet_p_mbar_min: 1e-4,
        inlet_p_mbar_max: 10,
        response_time_s: 1.5,
        cleanup_time_s: 40,
        seff_l_s: 1.5
      },
      {
        name: 'STANDARD',
        mdl_mbar_l_s: 1e-10,
        inlet_p_mbar_min: 1e-3,
        inlet_p_mbar_max: 20,
        response_time_s: 1.0,
        cleanup_time_s: 20,
        seff_l_s: 1.0
      }
    ],
    notes: 'High-end UHV detector'
  },
  
  // Agilent
  {
    id: 'agilent-vs-ld',
    manufacturer: 'Agilent',
    model: 'VS LD',
    type: 'vacuum',
    modes: [
      {
        name: 'PRECISION',
        mdl_mbar_l_s: 1e-11,
        inlet_p_mbar_min: 1e-4,
        inlet_p_mbar_max: 5,
        response_time_s: 1.2,
        cleanup_time_s: 25,
        seff_l_s: 1.0
      }
    ],
    notes: 'Compact design, good for portable setups'
  },
  
  // INFICON
  {
    id: 'inficon-uhv3000',
    manufacturer: 'INFICON',
    model: 'UL3000',
    type: 'vacuum',
    modes: [
      {
        name: 'UHV',
        mdl_mbar_l_s: 2e-13,
        inlet_p_mbar_min: 1e-5,
        inlet_p_mbar_max: 3,
        response_time_s: 0.8,
        cleanup_time_s: 35,
        seff_l_s: 1.3
      },
      {
        name: 'HV',
        mdl_mbar_l_s: 1e-9,
        inlet_p_mbar_min: 1e-3,
        inlet_p_mbar_max: 20,
        response_time_s: 0.5,
        cleanup_time_s: 15,
        seff_l_s: 0.8
      }
    ],
    notes: 'Research-grade, sehr stabil'
  },
  
  // Generic/Unknown
  {
    id: 'generic-uhv',
    manufacturer: 'Generic',
    model: 'UHV Leak Detector',
    type: 'vacuum',
    modes: [
      {
        name: 'FINE',
        mdl_mbar_l_s: 1e-12,
        inlet_p_mbar_min: 1e-4,
        inlet_p_mbar_max: 5,
        response_time_s: 1.5,
        cleanup_time_s: 30,
        seff_l_s: 1.0
      },
      {
        name: 'GROSS',
        mdl_mbar_l_s: 1e-8,
        inlet_p_mbar_min: 1e-2,
        inlet_p_mbar_max: 50,
        response_time_s: 0.8,
        cleanup_time_s: 15,
        seff_l_s: 0.5
      }
    ],
    notes: 'Konservative Annahmen für unbekanntes Gerät'
  }
];

// Helper function
export function getLeakDetector(id: string): LeakDetectorSpec | undefined {
  return LEAK_DETECTORS.find(ld => ld.id === id);
}
```

## 3.2 Connection Conductance Presets

```typescript
// Presets für Quick-Mode wenn User Details nicht kennt

export interface ConductancePreset {
  id: string;
  description: string;
  descriptionEn: string;
  conductance_l_s: number;
  notes: string;
}

export const CONDUCTANCE_PRESETS: ConductancePreset[] = [
  {
    id: 'direct',
    description: 'Direktanschluss (< 10 cm)',
    descriptionEn: 'Direct connection (< 10 cm)',
    conductance_l_s: 1000,
    notes: 'Praktisch kein Leitwert-Verlust'
  },
  {
    id: 'short-kf40',
    description: 'Kurzer Schlauch KF40 (50 cm)',
    descriptionEn: 'Short hose KF40 (50 cm)',
    conductance_l_s: 30,
    notes: 'Typischer Laboraufbau'
  },
  {
    id: 'long-kf40',
    description: 'Langer Schlauch KF40 (2 m)',
    descriptionEn: 'Long hose KF40 (2 m)',
    conductance_l_s: 10,
    notes: 'Flexibler Aufbau, deutlicher Verlust'
  },
  {
    id: 'narrow-tube',
    description: 'Enge Leitung DN16 (1 m)',
    descriptionEn: 'Narrow tube DN16 (1 m)',
    conductance_l_s: 2,
    notes: 'Stark limitiert, nur für kleine Volumina'
  },
  {
    id: 'valve-partial',
    description: 'Ventil teilweise offen',
    descriptionEn: 'Valve partially open',
    conductance_l_s: 5,
    notes: 'WARNUNG: effektiver Leitwert bricht ein'
  }
];
```

---

# TEIL 4: STANDARDS & PRESETS

## 4.1 Leckraten-Standards (vollständig)

```typescript
// src/lib/leakSearch/leakRateStandards.ts

export interface LeakRateStandard {
  id: string;
  name: string;
  nameEn: string;
  rate_mbar_l_s: number;
  source: string;
  description: string;
  descriptionEn: string;
  recommendedMethod: 'B2' | 'B5' | 'B6';
  category: 'uhv' | 'hv' | 'standard' | 'component';
}

export const LEAK_RATE_STANDARDS: LeakRateStandard[] = [
  // UHV / Beschleuniger
  {
    id: 'cern-lhc',
    name: 'CERN LHC Komponenten',
    nameEn: 'CERN LHC Components',
    rate_mbar_l_s: 1e-10,
    source: 'CERN VSC Vacuum Acceptance Criteria',
    description: 'Beschleunigerkomponenten (Strahlrohre, Kammern)',
    descriptionEn: 'Accelerator components (beampipes, chambers)',
    recommendedMethod: 'B5',
    category: 'uhv'
  },
  {
    id: 'gsi-cryo',
    name: 'GSI Kryostat',
    nameEn: 'GSI Cryostat',
    rate_mbar_l_s: 1e-10,
    source: 'GSI Technical Guideline 7.23e',
    description: 'Kryogene Vakuumsysteme',
    descriptionEn: 'Cryogenic vacuum systems',
    recommendedMethod: 'B5',
    category: 'uhv'
  },
  {
    id: 'gsi-beamline',
    name: 'GSI Strahlrohr',
    nameEn: 'GSI Beamline',
    rate_mbar_l_s: 1e-9,
    source: 'GSI Technical Guideline 7.19e',
    description: 'Standard-Strahlrohre',
    descriptionEn: 'Standard beamlines',
    recommendedMethod: 'B5',
    category: 'uhv'
  },
  
  // Halbleiter / Beschichtung
  {
    id: 'semiconductor',
    name: 'Halbleiter-Equipment',
    nameEn: 'Semiconductor Equipment',
    rate_mbar_l_s: 1e-9,
    source: 'SEMI Standards',
    description: 'Wafer-Prozessierung, Sputteranlagen',
    descriptionEn: 'Wafer processing, sputtering systems',
    recommendedMethod: 'B5',
    category: 'hv'
  },
  {
    id: 'coating',
    name: 'Beschichtungsanlagen',
    nameEn: 'Coating Systems',
    rate_mbar_l_s: 1e-8,
    source: 'Industrial Practice',
    description: 'PVD/CVD Anlagen',
    descriptionEn: 'PVD/CVD systems',
    recommendedMethod: 'B6',
    category: 'hv'
  },
  
  // Industrie
  {
    id: 'vacuum-furnace',
    name: 'Vakuumöfen',
    nameEn: 'Vacuum Furnaces',
    rate_mbar_l_s: 1e-6,
    source: 'DIN EN 1779',
    description: 'Wärmebehandlung, Sintern',
    descriptionEn: 'Heat treatment, sintering',
    recommendedMethod: 'B2',
    category: 'standard'
  },
  {
    id: 'automotive',
    name: 'Automotive (Klimaanlagen)',
    nameEn: 'Automotive (AC Systems)',
    rate_mbar_l_s: 1e-5,
    source: 'SAE J2791',
    description: 'Kältemittelkreisläufe',
    descriptionEn: 'Refrigerant circuits',
    recommendedMethod: 'B2',
    category: 'standard'
  },
  
  // Komponenten
  {
    id: 'cf-flange',
    name: 'CF-Flansch einzeln',
    nameEn: 'CF Flange (single)',
    rate_mbar_l_s: 1e-11,
    source: 'Pfeiffer Know-How Book',
    description: 'ConFlat-Metalldichtung',
    descriptionEn: 'ConFlat metal seal',
    recommendedMethod: 'B5',
    category: 'component'
  },
  {
    id: 'uhv-weld',
    name: 'UHV-Schweißnaht',
    nameEn: 'UHV Weld Seam',
    rate_mbar_l_s: 1e-10,  // pro cm
    source: 'CERN Engineering Specification',
    description: 'Pro cm Schweißnahtlänge',
    descriptionEn: 'Per cm weld length',
    recommendedMethod: 'B5',
    category: 'component'
  },
  {
    id: 'kf-flange',
    name: 'KF-Flansch (O-Ring)',
    nameEn: 'KF Flange (O-ring)',
    rate_mbar_l_s: 1e-9,
    source: 'ISO 2861',
    description: 'Elastomer-Dichtung',
    descriptionEn: 'Elastomer seal',
    recommendedMethod: 'B5',
    category: 'component'
  }
];
```

---

# TEIL 5: UI WIZARD SCREENS (DETAILLIERT)

## 5.1 Screen 1: Prüfling definieren

**Ziel:** Grunddaten erfassen

### Felder (Quick-Mode)

```typescript
interface Screen1Data {
  // Pflichtfelder
  objectType: TestObjectType;      // Dropdown mit Icons
  volume_L: number | 'unknown';    // Input oder "Ich weiß nicht"
  sealType: SealType[];            // Multi-Select (häufigste: CF, KF, Viton)
  accessOutside: 'full' | 'partial' | 'limited';
  
  // Optional (aber empfohlen)
  name: string;                    // z.B. "Kammer A", "Strahlrohr-Modul 3"
  geometry?: ChamberGeometry;      // Falls Volumen berechnet werden muss
}
```

### Validierung
- **Wenn `volume_L == 'unknown'`:**  
  → Geometrie-Rechner einblenden (wiederverwendet aus Ausgasung)
  → Oder konservativer Default: 100 L mit Hinweis

- **Wenn `sealType` leer:**  
  → Warnung: "Ohne Dichtungsinfo können wir Virtual-Leak-Risiko nicht bewerten"

### Tooltips (DE/EN)
- **objectType:** "Welcher Bauteiltyp wird geprüft? Beeinflusst die Methodenwahl."
- **volume_L:** "Inneres Volumen in Litern. Wichtig für Zeitberechnung. Wenn unbekannt, nutze den Geometrie-Rechner."
- **sealType:** "Welche Dichtungsarten sind verbaut? Mehrfachauswahl möglich."
- **accessOutside:** "Kann die Außenseite für Helium-Spray erreicht werden?"

### UI-Hinweis
```
💡 Tipp: Im Expert-Modus kannst du später Leitungslängen und 
   Ventiltypen genau angeben. Für den Anfang reichen diese Daten.
```

---

## 5.2 Screen 2: Material & Risikofaktoren

**Ziel:** Material + Virtual-Leak Faktoren erfassen

### Felder (Quick-Mode)

```typescript
interface Screen2Data {
  // Material
  materialId: string;              // Dropdown aus gasLibrary
  surfaceFinish: SurfaceFinish;
  isBakedOut: boolean;
  
  // Virtual-Leak Risiko
  hasBlindHoles: boolean;
  hasThreadedFasteners: boolean;
  hasTrappedVolumes: boolean;
}
```

### Validierung
- **Wenn `materialId` nicht gewählt:**  
  → Default: "Stainless Steel 304" mit Hinweis

- **Live Virtual-Leak Risk Score:**  
  → Ampel-Anzeige aktualisiert sich bei jedem Klick
  → Bei "Rot": Sofort Hinweis "⚠️ Hoher Virtual-Leak Risk. Empfehlung: Rate-of-Rise Test VOR Helium!"

### Tooltips
- **hasBlindHoles:** "Sackbohrungen = eingeschlossenes Gasvolumen. **HOHES RISIKO!**"
- **hasThreadedFasteners:** "Gewindegänge können Gas einschließen."
- **hasTrappedVolumes:** "Z.B. Doppel-O-Ring ohne Entlüftungsbohrung."

### Live-Feedback Box
```
┌─────────────────────────────────────────┐
│ Virtual Leak Risk: 🟠 HOCH (Score: 65)  │
│ Faktoren:                               │
│ • Sackbohrungen vorhanden (+40)         │
│ • Nicht ausgeheizt (+20)                │
│ • Raue Oberfläche (+5)                  │
│                                         │
│ → Rate-of-Rise Test vor He-Spray!       │
└─────────────────────────────────────────┘
```

---

## 5.3 Screen 3: Anforderungen & Equipment

**Ziel:** Ziel-Leckrate und vorhandenes Equipment

### Felder (Quick-Mode)

```typescript
interface Screen3Data {
  // Anforderungen
  targetLeakRate_mbar_l_s: number;
  leakRatePreset?: string;         // Falls aus Preset gewählt
  localizationRequired: boolean;
  reportLevel: 'simple' | 'audit';
  
  // Equipment
  leakDetectorModel?: string;      // Dropdown aus Database oder "unbekannt"
  systemPumping: {
    active: boolean;
    speed_l_s?: number;
  };
  connectionType?: 'direct' | 'short_tube' | 'long_tube' | 'unknown';
  heliumAvailable: boolean;
  hasRGA: boolean;
}
```

### Preset-Auswahl (prominent)
```
🎯 Häufige Standards (anklickbar):
[CERN LHC: 1×10⁻¹⁰]  [GSI Kryostat: 1×10⁻¹⁰]  [Halbleiter: 1×10⁻⁹]
[CF-Flansch: 1×10⁻¹¹]  [Vakuumofen: 1×10⁻⁶]   [🔧 Eigene Eingabe]
```

### Validierung
- **Wenn `leakDetectorModel == 'unbekannt'`:**  
  → Konservativer Generic-Detektor wird angenommen
  → Hinweis: "Wir rechnen mit typischen Werten. Für präzisere Planung, wähle dein Modell."

- **Wenn `systemPumping.active == true` und `speed_l_s` fehlt:**  
  → Default: 200 l/s (typische Turbo) mit Warnung
  → "⚠️ Geschätzter Wert. Kann zu Teilstrom-Verdünnung führen!"

### Expert-Mode-Trigger
```
🔬 Mehr Kontrolle?
→ Wechsel zu Expert-Mode für:
   • Genaue Leitungsdaten (DN, Länge, Bögen)
   • Ventiltypen und -zustände
   • Detaillierte Pumpen-Parameter
```

---

## 5.4 Screen 4: Ergebnis & Plan

**Ziel:** Empfehlung + Begründung anzeigen

### Layout (3 Karten)

#### Karte 1: Methode
```
╔═══════════════════════════════════════════════╗
║ 🎯 EMPFOHLENE METHODE                         ║
╠═══════════════════════════════════════════════╣
║                                               ║
║   B5 – Helium-Spray (Vakuummethode)          ║
║   Lokal: Leck kann gefunden werden           ║
║                                               ║
║ WARUM:                                        ║
║ • Grenzwert sehr niedrig (1×10⁻¹⁰ mbar·l/s)  ║
║ • Außenflächen voll zugänglich               ║
║ • Lokalisierung erforderlich                 ║
║                                               ║
║ ALTERNATIVE:                                  ║
║ B6 Integral-Test (wenn keine Lokalisierung)  ║
║                                               ║
╚═══════════════════════════════════════════════╝
```

#### Karte 2: Aufbau
```
╔═══════════════════════════════════════════════╗
║ 🔧 AUFBAU & ANSCHLUSS                         ║
╠═══════════════════════════════════════════════╣
║                                               ║
║ ANSCHLUSS: Seriell (Main Flow)               ║
║ ┌──────┐    ┌──────┐    ┌─────────┐         ║
║ │LD    │────│ Prüf-│────│ Pumpe   │         ║
║ │ASM340│    │ ling │    │ (aus)   │         ║
║ └──────┘    └──────┘    └─────────┘         ║
║                                               ║
║ VENTILE:                                      ║
║ • V1 (Isolation Systempumpe): ZU             ║
║ • V2 (Lecksucher): OFFEN                     ║
║                                               ║
║ ⚠️ WICHTIG:                                   ║
║ Systempumpe während Messung ISOLIEREN!       ║
║ Sonst: Teilstrom-Verdünnung 95%              ║
║                                               ║
╚═══════════════════════════════════════════════╝
```

#### Karte 3: Zeit & Grenzen
```
╔═══════════════════════════════════════════════╗
║ ⏱️  ZEIT & SENSITIVITÄT                       ║
╠═══════════════════════════════════════════════╣
║                                               ║
║ WARTEZEIT PRO SPRÜHSTOSS:                    ║
║ 90 Sekunden                                   ║
║ (3× Zeitkonstante τ = 30 s)                  ║
║                                               ║
║ GESAMTDAUER (geschätzt):                     ║
║ • Pumpdown: 10 min                           ║
║ • Stabilisierung: 10 min                     ║
║ • Messung (10 Spots): 15 min                 ║
║ Total: ~35 min                                ║
║                                               ║
║ NACHWEISGRENZE (effektiv):                   ║
║ 5×10⁻¹³ mbar·l/s                             ║
║ ✅ Besser als Ziel (1×10⁻¹⁰)                 ║
║                                               ║
║ LIMITIERENDER FAKTOR:                        ║
║ Leitwert (kurze Leitung = gut)               ║
║                                               ║
╚═══════════════════════════════════════════════╝
```

### Warnungen (wenn vorhanden)
```
⚠️ WARNUNGEN

┌─────────────────────────────────────────────┐
│ 🔴 KRITISCH: Teilstrom-Verdünnung zu hoch   │
│                                             │
│ Problem:                                    │
│ Systempumpe (200 l/s) ist viel stärker     │
│ als Lecksucher (1.2 l/s).                  │
│                                             │
│ Auswirkung:                                 │
│ Nur 0.6% des Heliums erreicht Detektor.    │
│ Leck wird nicht sichtbar!                  │
│                                             │
│ Maßnahme:                                   │
│ → Detektor SERIELL anschließen             │
│ → Systempumpe während Test ISOLIEREN       │
│                                             │
└─────────────────────────────────────────────┘
```

### Virtual Leak Risk (prominent wenn hoch)
```
🟠 VIRTUAL LEAK RISIKO: HOCH

Risikofaktoren:
• Sackbohrungen vorhanden (hohes Risiko)
• Nicht ausgeheizt (mittleres Risiko)

Empfehlung:
1. Rate-of-Rise Test VOR Helium-Spray durchführen
2. Wenn He-Test negativ aber Druck steigt: 
   → Virtual Leak bestätigt
3. Optional: RGA-Analyse (N₂/O₂ vs H₂O)

[🔗 Zum Rate-of-Rise Modul]  [🔗 Zur RGA-Analyse]
```

### Checkliste
```
✓ CHECKLISTE

Vorbereitung:
□ Lecksucher kalibriert? (Ref-Leak vorhanden?)
□ Helium verfügbar und vorbereitet?
□ Prüfling gereinigt und entfettet?
□ Alle Flansche angezogen (Drehmoment geprüft)?

Durchführung:
□ Pumpdown auf < 1×10⁻⁵ mbar abgewartet?
□ He-Background gemessen (< 1×10⁻¹¹ mbar)?
□ Sprühen von OBEN nach UNTEN?
□ Pro Spot mindestens 90 s warten?
□ Lecks markiert?

Auswertung:
□ Leckrate quantifiziert?
□ Dokumentation erstellt?
□ Kalibrierstatus notiert?
```

### Export-Buttons
```
[📄 Plan als PDF exportieren]
[📋 Checkliste drucken]
[💾 Setup speichern]
```

---

# TEIL 6: DECISION ENGINE (KOMPLETT)

## 6.1 Methodenauswahl-Logik (Full Decision Tree)

```typescript
// src/lib/leakSearch/methodSelection.ts

export function selectTestMethod(
  input: LeakSearchInput
): MethodRecommendation {
  
  const { requirements, testObject, equipment } = input;
  const targetRate = requirements.targetLeakRate_mbar_l_s;
  const canVacuum = testObject.canBeEvacuated;
  const canPressure = testObject.canBePressurized;
  const needsLocal = requirements.localizationRequired;
  const hasHe = requirements.heliumAvailable;
  
  // ========================================================================
  // HARD GATES (Ausschlussregeln)
  // ========================================================================
  
  // Kann nicht evakuiert werden?
  if (!canVacuum && targetRate < 1e-6) {
    if (canPressure && hasHe) {
      return {
        method: 'helium_sniffer',
        code: 'B4',
        reasoning: [
          'Prüfling kann nicht evakuiert werden',
          'Überdruck-Prüfung möglich',
          'Lokalisierung mit Schnüffelsonde'
        ],
        warning: 'Sensitivität limitiert auf ~1×10⁻⁶ mbar·l/s (Helium-Untergrund in Luft)'
      };
    }
    return {
      method: 'not_possible',
      reasoning: [
        'Prüfling kann weder evakuiert noch unter Druck gesetzt werden',
        'Keine Helium-basierte Prüfung möglich'
      ]
    };
  }
  
  // Kein Helium verfügbar?
  if (!hasHe && targetRate < 1e-6) {
    return {
      method: 'rate_of_rise',
      code: 'B2',
      reasoning: [
        'Kein Helium verfügbar',
        'Rate-of-Rise als Diagnose-Methode'
      ],
      warning: 'Sensitivität limitiert auf ~1×10⁻⁶ mbar·l/s ohne Helium',
      linkToModule: '/rate-of-rise'
    };
  }
  
  // ========================================================================
  // SCORING-BASED SELECTION (nach Sensitivität)
  // ========================================================================
  
  // Level 1: Grob (> 1×10⁻⁶ mbar·l/s)
  if (targetRate >= 1e-6) {
    return {
      method: 'rate_of_rise',
      code: 'B2',
      reasoning: [
        'Grenzwert im Grobbereich',
        'Rate-of-Rise ausreichend sensitiv',
        'Kein Helium erforderlich',
        'Kostengünstig und schnell'
      ],
      alternatives: [
        { method: 'helium_sniffer', code: 'B4', reason: 'Wenn Lokalisierung benötigt' }
      ],
      linkToModule: '/rate-of-rise'
    };
  }
  
  // Level 2: Mittel (1×10⁻⁶ bis 1×10⁻⁸)
  if (targetRate >= 1e-8) {
    if (needsLocal) {
      if (canPressure) {
        return {
          method: 'helium_sniffer',
          code: 'B4',
          reasoning: [
            'Lokalisierung erforderlich',
            'Überdruck-Prüfung möglich',
            'Schnüffelsonde flexibel einsetzbar'
          ],
          requirements: [
            'Helium-Füllung des Prüflings',
            'Überdrucksicherheit prüfen',
            'Von unten nach oben abfahren (He steigt auf)'
          ]
        };
      }
      return {
        method: 'helium_spray_vacuum',
        code: 'B5',
        reasoning: [
          'Lokalisierung erforderlich',
          'Vakuum-Methode notwendig',
          'Höhere Sensitivität als Sniffer'
        ]
      };
    }
    
    // Integral
    return {
      method: 'helium_vacuum_integral',
      code: 'B6',
      reasoning: [
        'Keine Lokalisierung erforderlich',
        'Integral-Test schneller als Spray',
        'Für Serien-/Endabnahme geeignet'
      ]
    };
  }
  
  // Level 3: Fein (1×10⁻⁸ bis 1×10⁻¹⁰)
  if (targetRate >= 1e-10) {
    if (needsLocal) {
      return {
        method: 'helium_spray_vacuum',
        code: 'B5',
        reasoning: [
          'Hohe Sensitivität erforderlich',
          'Lokalisierung erforderlich',
          'Vakuum + Helium zwingend'
        ],
        requirements: [
          'Turbomolekularpumpe erforderlich',
          'Evakuieren auf < 1×10⁻⁵ mbar',
          'He-Spray von OBEN nach UNTEN',
          'Wartezeit pro Spot beachten'
        ]
      };
    }
    return {
      method: 'helium_vacuum_integral',
      code: 'B6',
      reasoning: [
        'Keine Lokalisierung erforderlich',
        'Integral-Test ausreichend sensitiv'
      ],
      warning: 'Permeation durch Elastomere möglich bei langen Messzeiten'
    };
  }
  
  // Level 4: UHV (< 1×10⁻¹⁰)
  return {
    method: 'helium_spray_vacuum',
    code: 'B5',
    reasoning: [
      'UHV-Anforderung (z.B. CERN, GSI)',
      'Höchste Sensitivität notwendig',
      'Nur B5 erreicht diese Nachweisgrenze'
    ],
    requirements: [
      'UHV-Lecksucher mit Turbo',
      'Prüfling auf < 1×10⁻⁶ mbar evakuierbar',
      'Ausheizen VOR Test empfohlen',
      'He-Background < 1×10⁻¹¹ mbar erforderlich',
      'CF-Dichtungen bevorzugen (keine Elastomere)'
    ],
    alternatives: [
      { method: 'rate_of_rise', code: 'B2', reason: 'Als Vortest für Virtual-Leak Diagnose' }
    ]
  };
}
```

## 6.2 Warnungen generieren

```typescript
// src/lib/leakSearch/warnings.ts

export function generateWarnings(
  input: LeakSearchInput,
  calculations: EngineCalculations
): Warning[] {
  
  const warnings: Warning[] = [];
  
  // ========================================================================
  // LEITWERT zu niedrig
  // ========================================================================
  if (calculations.conductance.effective_l_s < 10 && input.testObject.volume_L > 50) {
    warnings.push({
      code: 'LOW_CONDUCTANCE',
      severity: 'high',
      category: 'conductance',
      problem: 'Leitwert zur Pumpe sehr niedrig',
      problemEn: 'Conductance to pump very low',
      impact: `Zeitkonstante τ = ${calculations.timing.tau_s.toFixed(0)} s. Response sehr langsam!`,
      impactEn: `Time constant τ = ${calculations.timing.tau_s.toFixed(0)} s. Response very slow!`,
      action: '→ Leitung kürzen, größeren DN wählen, oder Detektor näher am Prüfling platzieren',
      actionEn: '→ Shorten tube, use larger DN, or place detector closer to test object'
    });
  }
  
  // ========================================================================
  // TEILSTROM-VERDÜNNUNG
  // ========================================================================
  if (calculations.splitFlow && calculations.splitFlow.fraction < 0.1) {
    warnings.push({
      code: 'SPLIT_FLOW_DILUTION',
      severity: 'critical',
      category: 'split_flow',
      problem: 'Systempumpe zu stark',
      problemEn: 'System pump too strong',
      impact: `Nur ${(calculations.splitFlow.fraction * 100).toFixed(1)}% des Heliums erreicht Detektor. Leck wird nicht sichtbar!`,
      impactEn: `Only ${(calculations.splitFlow.fraction * 100).toFixed(1)}% of helium reaches detector. Leak will not be visible!`,
      action: '→ Detektor SERIELL anschließen oder Systempumpe während Test ISOLIEREN',
      actionEn: '→ Connect detector in SERIES or ISOLATE system pump during test'
    });
  }
  
  // ========================================================================
  // BACKGROUND zu hoch
  // ========================================================================
  if (calculations.sensitivity.backgroundHe_mbar && 
      calculations.sensitivity.backgroundHe_mbar > 1e-10) {
    warnings.push({
      code: 'HIGH_BACKGROUND',
      severity: 'medium',
      category: 'background',
      problem: 'He-Background erhöht',
      problemEn: 'Elevated He background',
      impact: 'Nachweisgrenze wird verschlechtert',
      impactEn: 'Detection limit will be degraded',
      action: '→ Raum lüften, He-Quellen entfernen, Cleanup-Zeit abwarten',
      actionEn: '→ Ventilate room, remove He sources, wait for cleanup'
    });
  }
  
  // ========================================================================
  // PERMEATION Risiko
  // ========================================================================
  if (input.testObject.sealTypes.includes('viton') || 
      input.testObject.sealTypes.includes('fkm')) {
    if (input.requirements.targetLeakRate_mbar_l_s < 1e-9) {
      warnings.push({
        code: 'PERMEATION_RISK',
        severity: 'medium',
        category: 'permeation',
        problem: 'Elastomer-Dichtungen vorhanden',
        problemEn: 'Elastomer seals present',
        impact: 'He-Permeation durch O-Ringe nach ~20 min möglich',
        impactEn: 'He permeation through O-rings possible after ~20 min',
        action: '→ Messfenster begrenzen (<15 min), Vergleichsmessung ohne He-Spray durchführen',
        actionEn: '→ Limit measurement window (<15 min), perform comparison measurement without He spray'
      });
    }
  }
  
  // ========================================================================
  // VIRTUAL LEAK Risiko (wenn hoch)
  // ========================================================================
  if (calculations.virtualLeakRisk.level === 'high' || 
      calculations.virtualLeakRisk.level === 'critical') {
    warnings.push({
      code: 'VIRTUAL_LEAK_RISK',
      severity: calculations.virtualLeakRisk.level === 'critical' ? 'critical' : 'high',
      category: 'virtual_leak',
      problem: 'Hohes Virtual-Leak-Risiko',
      problemEn: 'High virtual leak risk',
      impact: 'Druckanstieg kann fälschlicherweise als Leck interpretiert werden',
      impactEn: 'Pressure rise may be falsely interpreted as leak',
      action: '→ Rate-of-Rise Test VOR Helium-Spray durchführen. Bei He-negativ aber Druck steigt: Virtual Leak',
      actionEn: '→ Perform Rate-of-Rise test BEFORE helium spray. If He-negative but pressure rises: Virtual leak'
    });
  }
  
  // ========================================================================
  // ZEIT zu lang
  // ========================================================================
  if (calculations.timing.waitPerSpot_s > 120) {
    warnings.push({
      code: 'LONG_WAIT_TIME',
      severity: 'medium',
      category: 'time',
      problem: 'Sehr lange Wartezeit pro Spot',
      problemEn: 'Very long wait time per spot',
      impact: `${calculations.timing.waitPerSpot_s} Sekunden Wartezeit macht Lecksuche extrem zeitaufwändig`,
      impactEn: `${calculations.timing.waitPerSpot_s} seconds wait time makes leak search extremely time-consuming`,
      action: '→ Turbo-Booster einsetzen oder Leitwert verbessern',
      actionEn: '→ Use turbo booster or improve conductance'
    });
  }
  
  return warnings;
}
```

---

# TEIL 7: VIRTUAL LEAK RISK (KONKRET)

## 7.1 Scoring System (0-100 Punkte)

```typescript
// src/lib/leakSearch/virtualLeakRisk.ts

export interface VirtualLeakRiskFactors {
  hasBlindHoles: boolean;
  hasThreadedFasteners: boolean;
  hasTrappedVolumes: boolean;
  surfaceFinish: SurfaceFinish;
  isBakedOut: boolean;
  surfaceArea_cm2: number;
  materialType: string;  // aus gasLibrary
}

export function assessVirtualLeakRisk(
  factors: VirtualLeakRiskFactors
): VirtualLeakRiskAssessment {
  
  const riskFactors: RiskFactor[] = [];
  let totalScore = 0;
  
  // ========================================================================
  // FAKTOR 1: Sackbohrungen (KRITISCH)
  // ========================================================================
  if (factors.hasBlindHoles) {
    const weight = 40;
    totalScore += weight;
    riskFactors.push({
      factor: 'Sackbohrungen vorhanden',
      factorEn: 'Blind holes present',
      weight,
      present: true
    });
  }
  
  // ========================================================================
  // FAKTOR 2: Gewindeverbindungen
  // ========================================================================
  if (factors.hasThreadedFasteners) {
    const weight = 30;
    totalScore += weight;
    riskFactors.push({
      factor: 'Gewindeverbindungen innen (Gasreservoire in Gängen)',
      factorEn: 'Internal threaded fasteners (gas reservoirs in threads)',
      weight,
      present: true
    });
  }
  
  // ========================================================================
  // FAKTOR 3: Eingeschlossene Volumina
  // ========================================================================
  if (factors.hasTrappedVolumes) {
    const weight = 25;
    totalScore += weight;
    riskFactors.push({
      factor: 'Eingeschlossene Volumina (z.B. Doppel-O-Ring ohne Entlüftung)',
      factorEn: 'Trapped volumes (e.g. double O-ring without venting)',
      weight,
      present: true
    });
  }
  
  // ========================================================================
  // FAKTOR 4: Gussmaterial
  // ========================================================================
  if (factors.materialType.includes('cast') || factors.materialType.includes('Guss')) {
    const weight = 25;
    totalScore += weight;
    riskFactors.push({
      factor: 'Gussmaterial (Porosität, eingeschlossene Gasblasen)',
      factorEn: 'Cast material (porosity, trapped gas bubbles)',
      weight,
      present: true
    });
  }
  
  // ========================================================================
  // FAKTOR 5: Große Oberfläche ohne Bakeout
  // ========================================================================
  if (!factors.isBakedOut && factors.surfaceArea_cm2 > 10000) {
    const weight = 20;
    totalScore += weight;
    riskFactors.push({
      factor: 'Große Oberfläche ohne Ausheizen (hohe H₂O-Desorption)',
      factorEn: 'Large surface area without bakeout (high H₂O desorption)',
      weight,
      present: true
    });
  }
  
  // ========================================================================
  // FAKTOR 6: Raue Oberfläche
  // ========================================================================
  if (factors.surfaceFinish === 'rough' || 
      factors.surfaceFinish === 'as_welded' || 
      factors.surfaceFinish === 'bead_blasted') {
    const weight = 10;
    totalScore += weight;
    riskFactors.push({
      factor: 'Raue Oberfläche (erhöhte Gasadsorption)',
      factorEn: 'Rough surface (increased gas adsorption)',
      weight,
      present: true
    });
  }
  
  // ========================================================================
  // LEVEL bestimmen (Schwellwerte)
  // ========================================================================
  let level: 'low' | 'medium' | 'high' | 'critical';
  if (totalScore < 20) {
    level = 'low';
  } else if (totalScore < 40) {
    level = 'medium';
  } else if (totalScore < 60) {
    level = 'high';
  } else {
    level = 'critical';
  }
  
  // ========================================================================
  // EMPFEHLUNGEN generieren
  // ========================================================================
  const recommendations: string[] = [];
  const recommendationsEn: string[] = [];
  
  if (level !== 'low') {
    recommendations.push('Rate-of-Rise Test VOR Helium-Lecksuche durchführen');
    recommendationsEn.push('Perform Rate-of-Rise test BEFORE helium leak search');
    
    recommendations.push('Wenn He-Test negativ aber Druck steigt: Virtuelles Leck wahrscheinlich');
    recommendationsEn.push('If He-test negative but pressure rises: Virtual leak probable');
  }
  
  if (factors.hasBlindHoles) {
    recommendations.push('Sackbohrungen mit Entlüftungsnuten versehen oder durchbohren');
    recommendationsEn.push('Provide blind holes with venting grooves or drill through');
  }
  
  if (factors.hasTrappedVolumes) {
    recommendations.push('Entlüftungsbohrungen bei Doppel-O-Ringen prüfen');
    recommendationsEn.push('Check venting holes for double O-rings');
  }
  
  if (!factors.isBakedOut && level !== 'low') {
    recommendations.push('Ausheizen bei mindestens 150°C für 24h empfohlen');
    recommendationsEn.push('Bakeout at minimum 150°C for 24h recommended');
  }
  
  if (level === 'critical') {
    recommendations.push('KONSTRUKTIVE ÄNDERUNG zwingend erforderlich!');
    recommendationsEn.push('DESIGN CHANGE mandatory!');
  }
  
  return {
    level,
    score: totalScore,
    factors: riskFactors,
    recommendations,
    recommendationsEn
  };
}
```

---

# TEIL 8: PHYSICS ENGINE (aus V6, komplett)

## 8.1 Einheiten & Konverter

```typescript
// src/lib/leakSearch/units.ts

export const UNITS = {
  // Leckrate
  MBAR_L_S_TO_PA_M3_S: 0.1,
  PA_M3_S_TO_MBAR_L_S: 10.0,
  
  // Volumen
  L_TO_M3: 1e-3,
  M3_TO_L: 1000,
  
  // Druck
  MBAR_TO_PA: 100,
  PA_TO_MBAR: 0.01,
  
  // Gas-spezifisch
  M_AIR: 28.97,      // g/mol
  M_HE: 4.003,       // g/mol
  M_N2: 28.014,
  M_H2O: 18.015
};

export function convertLeakRate(
  value: number,
  from: 'mbar_l_s' | 'Pa_m3_s',
  to: 'mbar_l_s' | 'Pa_m3_s'
): number {
  if (from === to) return value;
  if (from === 'mbar_l_s' && to === 'Pa_m3_s') {
    return value * UNITS.MBAR_L_S_TO_PA_M3_S;
  }
  return value * UNITS.PA_M3_S_TO_MBAR_L_S;
}
```

## 8.2 Effektives Saugvermögen (S_eff)

```typescript
// src/lib/leakSearch/conductance.ts

/**
 * Berechnet effektives Saugvermögen am Prüfling
 * 
 * 1/S_eff = 1/S_pump + 1/C_total
 */
export function calculateEffectivePumpingSpeed(
  pumpSpeed_l_s: number,
  conductance_l_s: number
): number {
  return 1 / (1 / pumpSpeed_l_s + 1 / conductance_l_s);
}

/**
 * Leitwert für molekulare Strömung (HV/UHV)
 * 
 * C_mol ≈ 12.1 * d³/l  [l/s]  (d, l in cm)
 */
export function calculateMolecularConductance(
  diameter_cm: number,
  length_cm: number,
  gas: 'air' | 'helium' = 'air'
): number {
  const C_air = 12.1 * Math.pow(diameter_cm, 3) / length_cm;
  
  // Gas-Korrektur für Helium
  if (gas === 'helium') {
    const massRatio = Math.sqrt(UNITS.M_AIR / UNITS.M_HE);
    return C_air * massRatio;  // He: ~2.7x höher
  }
  
  return C_air;
}

/**
 * Leitwert für kurze Rohre/Blenden (Clausing-Faktor)
 */
export function applyClausing factor(
  conductance: number,
  lengthToDiameterRatio: number
): number {
  // Vereinfachte Clausing-Korrektur
  if (lengthToDiameterRatio < 0.1) {
    // Sehr kurz = Blende
    return conductance * 0.8;
  }
  return conductance;
}

/**
 * Gesamtleitwert aus Serie von Elementen
 * 
 * 1/C_total = 1/C1 + 1/C2 + ...
 */
export function calculateSeriesConductance(
  conductances: number[]
): number {
  const sum = conductances.reduce((acc, c) => acc + 1/c, 0);
  return 1 / sum;
}
```

## 8.3 Zeitmodelle (τ, Wartezeiten)

```typescript
// src/lib/leakSearch/timing.ts

/**
 * Zeitkonstante (1. Ordnung)
 * 
 * τ = V / S_eff
 */
export function calculateTimeConstant(
  volume_L: number,
  seff_l_s: number
): number {
  return volume_L / seff_l_s;  // in Sekunden
}

/**
 * Wartezeit für Signal-Stabilisierung
 * 
 * t_wait = k_tau * τ
 * k_tau = 3 (95% Signal)
 * k_tau = 5 (99% Signal)
 */
export function calculateWaitTime(
  tau_s: number,
  mode: 'service' | 'lab' = 'service'
): number {
  const k_tau = mode === 'service' ? 3 : 5;
  return k_tau * tau_s;
}

/**
 * Pumpdown-Zeit (grobe Schätzung)
 * 
 * t = (V / S_eff) * ln(p_start / p_end)
 */
export function estimatePumpdownTime(
  volume_L: number,
  seff_l_s: number,
  p_start_mbar: number = 1013,
  p_end_mbar: number = 1e-5
): number {
  const tau = volume_L / seff_l_s;
  return tau * Math.log(p_start_mbar / p_end_mbar);
}
```

## 8.4 Teilstrom/Split-Flow

```typescript
// src/lib/leakSearch/splitFlow.ts

/**
 * Berechnet Teilstrom-Fraktion
 * 
 * F_split = S_LD / (S_system + S_LD)
 */
export interface SplitFlowResult {
  fraction: number;           // 0-1
  seenLeakRate_mbar_l_s: number;
  dilutionFactor: number;
  isAcceptable: boolean;
}

export function calculateSplitFlow(
  trueLeakRate_mbar_l_s: number,
  sLD_l_s: number,
  sSystem_l_s: number,
  mdl_device_mbar_l_s: number
): SplitFlowResult {
  const fraction = sLD_l_s / (sSystem_l_s + sLD_l_s);
  const seenLeakRate = trueLeakRate_mbar_l_s * fraction;
  const dilutionFactor = 1 / fraction;
  
  // Akzeptabel wenn seen > 3× MDL
  const isAcceptable = seenLeakRate > (3 * mdl_device_mbar_l_s);
  
  return {
    fraction,
    seenLeakRate_mbar_l_s: seenLeakRate,
    dilutionFactor,
    isAcceptable
  };
}
```

## 8.5 Nachweisgrenze (MDL effektiv)

```typescript
// src/lib/leakSearch/sensitivity.ts

/**
 * Effektive Nachweisgrenze im Setup
 * 
 * MDL_eff = max(MDL_device, k_bg * BG)
 */
export function calculateEffectiveMDL(
  mdl_device_mbar_l_s: number,
  background_mbar?: number,
  k_bg: number = 3
): number {
  if (!background_mbar) {
    return mdl_device_mbar_l_s;
  }
  
  // Background als äquivalente Leckrate
  const bgEquivalent = background_mbar * 1e3;  // grobe Näherung
  
  return Math.max(mdl_device_mbar_l_s, k_bg * bgEquivalent);
}
```

---

# TEIL 9: OUTPUT/REPORT SPECIFICATION

## 9.1 PDF-Export Template

```typescript
// src/lib/leakSearch/reportTemplate.ts

export interface ReportData {
  plan: LeakSearchPlan;
  input: LeakSearchInput;
  timestamp: string;
  operator?: string;
}

export function generateReportMarkdown(data: ReportData): string {
  return `
# LECKSUCHE-PRÜFPLAN

**Erstellt:** ${data.timestamp}  
**Operator:** ${data.operator || 'N/A'}

---

## PRÜFLING

- **Bezeichnung:** ${data.input.testObject.name}
- **Typ:** ${data.input.testObject.type}
- **Volumen:** ${data.input.testObject.geometry.volume_L} L
- **Dichtungen:** ${data.input.testObject.sealTypes.join(', ')}
- **Zugänglichkeit:** ${data.input.testObject.accessOutside}

---

## ANFORDERUNGEN

- **Grenzwert Leckrate:** ${data.input.requirements.targetLeakRate_mbar_l_s} mbar·l/s
- **Lokalisierung erforderlich:** ${data.input.requirements.localizationRequired ? 'Ja' : 'Nein'}
- **Dokumentationslevel:** ${data.input.requirements.reportLevel}

---

## EMPFOHLENE METHODE

### ${data.plan.methodName} (${data.plan.methodCode})

**Begründung:**
${data.plan.reasoning.map(r => `- ${r}`).join('\n')}

${data.plan.alternatives.length > 0 ? `
**Alternative Methoden:**
${data.plan.alternatives.map(a => `- ${a.code}: ${a.reason}`).join('\n')}
` : ''}

---

## AUFBAU

**Anschlussart:** ${data.plan.setup.connectionType}

**Schritte:**
${data.plan.setup.steps.map((s, i) => `${i+1}. ${s}`).join('\n')}

**Ventilzustände:**
${data.plan.setup.valveStates.map(v => `- ${v.name}: ${v.state} (${v.reason})`).join('\n')}

---

## ZEIT & SENSITIVITÄT

- **Pumpdown:** ${Math.round(data.plan.timing.pumpdown_s / 60)} min
- **Stabilisierung:** ${Math.round(data.plan.timing.stabilization_s / 60)} min
- **Wartezeit pro Spot:** ${data.plan.timing.waitPerSpot_s} s
- **Gesamtdauer (geschätzt):** ${Math.round((data.plan.timing.pumpdown_s + data.plan.timing.stabilization_s + data.plan.timing.totalMeasurement_s) / 60)} min

**Nachweisgrenze (effektiv):** ${data.plan.sensitivity.mdl_effective_mbar_l_s} mbar·l/s  
**Limitierender Faktor:** ${data.plan.sensitivity.limitingFactor}

---

## WARNUNGEN

${data.plan.warnings.length > 0 ? data.plan.warnings.map(w => `
### ⚠️ ${w.severity.toUpperCase()}: ${w.problem}

**Auswirkung:** ${w.impact}

**Maßnahme:** ${w.action}
`).join('\n') : '*Keine Warnungen*'}

---

## VIRTUAL LEAK RISIKO

**Level:** ${data.plan.virtualLeakRisk.level.toUpperCase()} (Score: ${data.plan.virtualLeakRisk.score}/100)

**Risikofaktoren:**
${data.plan.virtualLeakRisk.factors.filter(f => f.present).map(f => `- ${f.factor} (+${f.weight})`).join('\n')}

**Empfehlungen:**
${data.plan.virtualLeakRisk.recommendations.map(r => `- ${r}`).join('\n')}

---

## CHECKLISTE

${data.plan.checklist.map(item => `- [ ] ${item.item} ${item.mandatory ? '**[PFLICHT]**' : ''}`).join('\n')}

---

## AUDIT-BLOCK

**Standard:** ${data.plan.audit.standard}

**Kalibrierung:**
- Status: ${data.plan.audit.calibration.status}
${data.plan.audit.calibration.refLeak_mbar_l_s ? `- Ref-Leak: ${data.plan.audit.calibration.refLeak_mbar_l_s} mbar·l/s` : ''}
${data.plan.audit.calibration.lastCalibration ? `- Letzte Kalibrierung: ${data.plan.audit.calibration.lastCalibration}` : ''}

**Entscheidungsregel:** ${data.plan.audit.decisionRule}

**Annahmen:**
${data.plan.audit.assumptions.map(a => `- ${a}`).join('\n')}

---

**Engine Version:** ${data.plan.engineVersion}  
**Plan Version:** ${data.plan.planVersion}

---

## UNTERSCHRIFTEN

**Durchführung:**

Name: _______________________  
Datum: ______________________  
Unterschrift: ________________

**Prüfung:**

Name: _______________________  
Datum: ______________________  
Unterschrift: ________________
`;
}
```

---

# TEIL 10: TEST CASES (aus V6)

## 10.1 Testkatalog (Pflicht für V1)

```typescript
// src/lib/leakSearch/__tests__/testCases.ts

export const TEST_CASES = [
  {
    id: 'TC1',
    name: 'Kleinvolumen direkt am LD',
    input: {
      testObject: {
        volume_L: 5,
        canBeEvacuated: true,
        accessOutside: 'full'
      },
      equipment: {
        leakDetector: { model: 'pfeiffer-asm340', selectedMode: 'FINE' },
        connections: [{ kind: 'tube', length_cm: 10, dn: 'KF25' }]
      },
      requirements: {
        targetLeakRate_mbar_l_s: 1e-10,
        localizationRequired: true
      }
    },
    expectedResult: {
      method: 'helium_spray_vacuum',
      noWarnings: ['LOW_CONDUCTANCE'],
      timing: { waitPerSpot_s: { max: 30 } }
    }
  },
  
  {
    id: 'TC2',
    name: 'Großvolumen + lange enge Leitung',
    input: {
      testObject: {
        volume_L: 200,
        canBeEvacuated: true,
        accessOutside: 'full'
      },
      equipment: {
        leakDetector: { model: 'pfeiffer-asm340', selectedMode: 'FINE' },
        connections: [
          { kind: 'tube', length_cm: 300, innerDiameter_cm: 2, bends: 3 }
        ]
      },
      requirements: {
        targetLeakRate_mbar_l_s: 1e-10,
        localizationRequired: true
      }
    },
    expectedResult: {
      method: 'helium_spray_vacuum',
      warnings: ['LOW_CONDUCTANCE'],
      timing: { waitPerSpot_s: { min: 90 } }
    }
  },
  
  {
    id: 'TC3',
    name: 'Teilstrom mit dominanter Systempumpe',
    input: {
      testObject: {
        volume_L: 100,
        canBeEvacuated: true,
        accessOutside: 'full'
      },
      equipment: {
        leakDetector: { model: 'pfeiffer-asm340', selectedMode: 'FINE' },
        systemPumping: {
          activeDuringTest: true,
          pumpSpeed_l_s: 500  // SEHR stark
        }
      },
      requirements: {
        targetLeakRate_mbar_l_s: 1e-10,
        localizationRequired: true
      }
    },
    expectedResult: {
      method: 'helium_spray_vacuum',
      warnings: ['SPLIT_FLOW_DILUTION'],
      setup: { connectionType: 'series' }  // Empfehlung: seriell
    }
  },
  
  {
    id: 'TC4',
    name: 'Viele O-Ringe + niedriger Grenzwert',
    input: {
      testObject: {
        volume_L: 50,
        canBeEvacuated: true,
        sealTypes: ['viton', 'viton', 'fkm'],
        sealCount: 12,
        accessOutside: 'full'
      },
      requirements: {
        targetLeakRate_mbar_l_s: 1e-10,
        localizationRequired: true
      }
    },
    expectedResult: {
      method: 'helium_spray_vacuum',
      warnings: ['PERMEATION_RISK']
    }
  },
  
  {
    id: 'TC5',
    name: 'Virtual-Leak-Indizien',
    input: {
      testObject: {
        volume_L: 80,
        canBeEvacuated: true,
        hasBlindHoles: true,
        hasThreadedFasteners: true,
        accessOutside: 'full'
      },
      materials: {
        isBakedOut: false,
        surfaceFinish: 'as_welded'
      },
      requirements: {
        targetLeakRate_mbar_l_s: 1e-9,
        localizationRequired: true
      }
    },
    expectedResult: {
      virtualLeakRisk: { level: 'high' },
      warnings: ['VIRTUAL_LEAK_RISK'],
      alternatives: [{ method: 'rate_of_rise', code: 'B2' }]
    }
  },
  
  {
    id: 'TC6',
    name: 'Background hoch (He-Umgebung)',
    input: {
      testObject: {
        volume_L: 50,
        canBeEvacuated: true,
        accessOutside: 'full'
      },
      equipment: {
        leakDetector: { model: 'pfeiffer-asm340', selectedMode: 'FINE' }
      },
      requirements: {
        targetLeakRate_mbar_l_s: 1e-11
      },
      // Simuliere hohen Background
      environment: {
        backgroundHe_mbar: 1e-9
      }
    },
    expectedResult: {
      warnings: ['HIGH_BACKGROUND'],
      sensitivity: { mdl_effective_mbar_l_s: { min: 3e-9 } }
    }
  },
  
  {
    id: 'TC7',
    name: 'Ventil halb zu (simuliert)',
    input: {
      testObject: {
        volume_L: 100,
        canBeEvacuated: true,
        accessOutside: 'full'
      },
      equipment: {
        leakDetector: { model: 'pfeiffer-asm340', selectedMode: 'FINE' },
        connections: [
          { kind: 'valve', valveState: 'partial' }
        ]
      },
      requirements: {
        targetLeakRate_mbar_l_s: 1e-10
      }
    },
    expectedResult: {
      warnings: ['LOW_CONDUCTANCE'],
      timing: { waitPerSpot_s: { min: 120 } }
    }
  },
  
  {
    id: 'TC8',
    name: 'Pumpdown-Phase (optional)',
    input: {
      testObject: {
        volume_L: 500,  // GROß
        canBeEvacuated: true,
        accessOutside: 'full'
      },
      equipment: {
        leakDetector: { model: 'pfeiffer-asm340', selectedMode: 'FINE' },
        systemPumping: {
          activeDuringTest: false,
          pumpSpeed_l_s: 50  // Klein
        }
      },
      requirements: {
        targetLeakRate_mbar_l_s: 1e-10
      }
    },
    expectedResult: {
      timing: { pumpdown_s: { min: 3600 } },  // > 1 Stunde
      warnings: ['LONG_WAIT_TIME']
    }
  }
];
```

---

# TEIL 11: IMPLEMENTATION PHASES

## 11.1 Phase 1: Core Engine (6-8h)

**Dateien:**
```
src/lib/leakSearch/
├── units.ts                  [1h]  - Einheiten & Konverter
├── conductance.ts            [2h]  - Leitwert-Berechnungen
├── timing.ts                 [1h]  - Zeitkonstanten
├── splitFlow.ts              [1h]  - Teilstrom
├── sensitivity.ts            [1h]  - MDL-Berechnung
└── __tests__/
    └── engine.test.ts        [2h]  - Unit Tests
```

## 11.2 Phase 2: Decision Logic (4-6h)

**Dateien:**
```
src/lib/leakSearch/
├── methodSelection.ts        [2h]  - Methodenauswahl
├── virtualLeakRisk.ts        [2h]  - Risk Assessment
├── warnings.ts               [2h]  - Warnungen generieren
└── __tests__/
    └── decision.test.ts      [2h]  - Test Cases TC1-TC8
```

## 11.3 Phase 3: Data & Equipment (2-3h)

**Dateien:**
```
src/lib/leakSearch/
├── equipmentDatabase.ts      [1h]  - Leak Detector DB
├── leakRateStandards.ts      [1h]  - Standards/Presets
└── conductancePresets.ts     [1h]  - Quick-Mode Presets
```

## 11.4 Phase 4: UI Wizard (8-10h)

**Dateien:**
```
src/components/LeakSearchPlanner/
├── index.tsx                 [1h]  - Container + Router
├── WizardStepper.tsx         [1h]  - Stepper UI
├── screens/
│   ├── Screen1_TestObject.tsx       [2h]
│   ├── Screen2_Materials.tsx        [2h]
│   ├── Screen3_Requirements.tsx     [2h]
│   └── Screen4_Result.tsx           [3h]
└── components/
    ├── VirtualLeakRiskCard.tsx      [1h]
    ├── WarningCard.tsx              [1h]
    └── ChecklistCard.tsx            [1h]
```

## 11.5 Phase 5: Report & Export (2-3h)

**Dateien:**
```
src/lib/leakSearch/
├── reportTemplate.ts         [1h]  - Markdown Generator
└── pdfExport.ts              [2h]  - PDF Generation
```

## 11.6 Phase 6: Integration (2-3h)

**Dateien:**
```
src/
├── App.tsx                   [1h]  - Routing
├── components/
│   ├── FunctionSelector.tsx  [1h]  - Neue Karte
│   └── ActionsSidebar.tsx    [1h]  - Icon
└── i18n/
    ├── de.json               [1h]  - Übersetzungen
    └── en.json               [1h]
```

---

## **TOTAL GESCHÄTZT: 24-33 Stunden**

---

# ANHANG: Quick Reference

## Wichtigste Konstanten

```typescript
// Zeitkonstanten-Faktoren
const K_TAU_SERVICE = 3;  // 95% Signal
const K_TAU_LAB = 5;      // 99% Signal

// Virtual Leak Risk Schwellwerte
const RISK_LOW = 20;
const RISK_MEDIUM = 40;
const RISK_HIGH = 60;
const RISK_CRITICAL = 60;  // > 60

// Teilstrom Akzeptanz
const MIN_SPLIT_FRACTION = 0.1;  // 10%

// Leitwert-Warnung
const MIN_CONDUCTANCE_FOR_LARGE_VOLUME = 10;  // l/s
```

## Wichtigste Formeln

```
S_eff = 1 / (1/S_pump + 1/C_total)
τ = V / S_eff
t_wait = k_tau × τ
C_mol = 12.1 × d³ / l  (d, l in cm)
F_split = S_LD / (S_system + S_LD)
MDL_eff = max(MDL_device, k_bg × BG)
```

---

**ENDE Master V7 COMPLETE**
