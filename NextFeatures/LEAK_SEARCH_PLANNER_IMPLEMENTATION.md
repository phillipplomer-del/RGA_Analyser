# Lecksuche-Planer - Implementierungsplan

**Erstellt:** 2026-01-08
**Status:** Geplant
**Priorität:** 1.6 (nach Konfidenz-Score 1.5.3)
**Geschätzter Aufwand:** 12-16h

---

## Zusammenfassung

Ein Wizard-basiertes Tool zur Auswahl der optimalen Lecksuchmethode nach DIN EN 1779, mit Pumpenberechnung, Virtual-Leak Risikobewertung und RGA-Integration.

**Alleinstellungsmerkmal:** Keine vergleichbare Software am Markt. Integration mit RGA-Diagnose ermöglicht Validierung nach Lecksuche.

---

## Wiederverwendbare Komponenten

| Komponente | Quelle | Anpassung nötig? |
|------------|--------|------------------|
| Geometrie-Rechner | `OutgassingPage.tsx:70-105` | Extrahieren als `<ChamberGeometryInput />` |
| Material-Datenbank | `outgassingRates.ts` | Nein, direkt nutzbar |
| Leckraten-Grenzwerte | `types/rateOfRise.ts` | Erweitern um Standards |
| Luftleck-Detektor | `detectors.ts` | Nein, Verlinkung |
| Virtual-Leak-Detektor | `detectors.ts` | Nein, Verlinkung |

---

## Phase 1: Basis-Wizard (8h)

### 1.1 Shared Component: ChamberGeometryInput (2h)

**Datei:** `src/components/shared/ChamberGeometryInput.tsx`

```typescript
interface ChamberGeometryInputProps {
  onGeometryChange: (geometry: ChamberGeometry) => void
  initialShape?: 'rectangular' | 'cylindrical'
  showResults?: boolean
  colorScheme?: 'violet' | 'amber' | 'aqua'
}

interface ChamberGeometry {
  shape: 'rectangular' | 'cylindrical'
  dimensions: {
    length: number      // cm
    width?: number      // cm (nur rechteckig)
    height?: number     // cm (nur rechteckig)
    diameter?: number   // cm (nur zylindrisch)
  }
  volume_L: number      // Berechnet
  surfaceArea_cm2: number // Berechnet
}
```

**Extraktion aus:** `OutgassingPage.tsx` Zeilen 70-105, 243-358

### 1.2 Daten: Leckraten-Standards (1h)

**Datei:** `src/lib/leakSearch/leakRateStandards.ts`

```typescript
export interface LeakRateStandard {
  id: string
  name: string
  nameEn: string
  rate: number              // mbar·l/s
  source: string
  description: string
  descriptionEn: string
  testMethod: 'B2' | 'B4' | 'B5' | 'B6'
  category: 'uhv' | 'hv' | 'standard' | 'component'
}

export const LEAK_RATE_STANDARDS: LeakRateStandard[] = [
  // UHV / Beschleuniger
  {
    id: 'cern-lhc',
    name: 'CERN LHC Komponenten',
    nameEn: 'CERN LHC Components',
    rate: 1e-10,
    source: 'CERN VSC Vacuum Acceptance',
    description: 'Beschleunigerkomponenten',
    descriptionEn: 'Accelerator components',
    testMethod: 'B5',
    category: 'uhv'
  },
  {
    id: 'gsi-cryo',
    name: 'GSI Kryostat',
    nameEn: 'GSI Cryostat',
    rate: 1e-10,
    source: 'GSI Technical Guideline 7.23e',
    description: 'Kryogene Vakuumsysteme',
    descriptionEn: 'Cryogenic vacuum systems',
    testMethod: 'B5',
    category: 'uhv'
  },
  {
    id: 'gsi-beamline',
    name: 'GSI Strahlrohr',
    nameEn: 'GSI Beamline',
    rate: 1e-9,
    source: 'GSI Technical Guideline 7.19e',
    description: 'Standard-Strahlrohre',
    descriptionEn: 'Standard beamlines',
    testMethod: 'B5',
    category: 'uhv'
  },
  // ... weitere Standards aus LEAK_SEARCH_PLANNER_SPEC.md Zeilen 476-593
]
```

### 1.3 Logik: Methodenauswahl (2h)

**Datei:** `src/lib/leakSearch/methodSelection.ts`

```typescript
export interface TestRequirements {
  targetLeakRate: number
  canBeEvacuated: boolean
  canBePressurized: boolean
  needsLocalization: boolean
  heliumAvailable: boolean
}

export interface MethodRecommendation {
  method: LeakTestMethod
  code: 'B2' | 'B4' | 'B5' | 'B6'
  name: string
  nameEn: string
  reasoning: string[]
  reasoningEn: string[]
  requirements: string[]
  requirementsEn: string[]
  warning?: string
  warningEn?: string
  linkToModule?: '/rate-of-rise' | '/rga'
}

export type LeakTestMethod =
  | 'rate_of_rise'           // B2
  | 'helium_sniffer'         // B4
  | 'helium_spray_vacuum'    // B5
  | 'helium_vacuum_integral' // B6
  | 'not_possible'

export function selectTestMethod(req: TestRequirements): MethodRecommendation {
  // Implementierung aus LEAK_SEARCH_PLANNER_SPEC.md Zeilen 200-296
}
```

### 1.4 Logik: Virtual-Leak Risikobewertung (1h)

**Datei:** `src/lib/leakSearch/virtualLeakRisk.ts`

```typescript
export interface VirtualLeakRiskFactors {
  hasBlindHoles: boolean
  hasThreadedFasteners: boolean
  hasTrappedVolumes: boolean
  surfaceFinish: 'electropolished' | 'polished' | 'machined' | 'as_welded' | 'rough'
  isBakedOut: boolean
  surfaceArea_cm2: number
}

export interface VirtualLeakRisk {
  level: 'low' | 'medium' | 'high' | 'critical'
  score: number
  factors: string[]
  factorsEn: string[]
  recommendations: string[]
  recommendationsEn: string[]
}

export function assessVirtualLeakRisk(factors: VirtualLeakRiskFactors): VirtualLeakRisk {
  // Implementierung aus LEAK_SEARCH_PLANNER_SPEC.md Zeilen 301-373
}
```

### 1.5 UI: Wizard-Container + Steps (2h)

**Datei:** `src/components/LeakSearchPlanner/index.tsx`

```typescript
export function LeakSearchPlanner({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1)
  const [testObject, setTestObject] = useState<TestObject | null>(null)
  const [materials, setMaterials] = useState<MaterialProperties | null>(null)
  const [requirements, setRequirements] = useState<TestRequirements | null>(null)

  return (
    <div className="min-h-screen bg-surface-page">
      {/* Header mit Stepper */}
      <WizardStepper currentStep={step} totalSteps={4} />

      {/* Step Content */}
      {step === 1 && <TestObjectStep onNext={...} />}
      {step === 2 && <MaterialStep onNext={...} />}
      {step === 3 && <RequirementsStep onNext={...} />}
      {step === 4 && <ResultStep recommendation={...} />}
    </div>
  )
}
```

**Dateien:**
- `src/components/LeakSearchPlanner/steps/TestObjectStep.tsx`
- `src/components/LeakSearchPlanner/steps/MaterialStep.tsx`
- `src/components/LeakSearchPlanner/steps/RequirementsStep.tsx`
- `src/components/LeakSearchPlanner/steps/ResultStep.tsx`
- `src/components/LeakSearchPlanner/WizardStepper.tsx`

---

## Phase 2: Pumpen & Equipment (4h)

### 2.1 Logik: Pumpenberechnung (2h)

**Datei:** `src/lib/leakSearch/pumpCalculation.ts`

```typescript
export interface PumpRequirements {
  roughingPump: {
    type: string
    minSpeed_m3h: number
    reasoning: string
  }
  turboPump?: {
    type: string
    minSpeed_Lps: number
    reasoning: string
  }
  targetPressure_mbar: number
  estimatedPumpdownTime_min: number
  heliumDecayTime_s: number  // τ = V/S für Wartezeit
}

export function calculatePumpRequirements(
  volume_L: number,
  targetLeakRate: number,
  desiredPumpdownTime_s: number = 300
): PumpRequirements {
  // Grundformel: S = V/t × ln(p_atm/p_target)
  // He-Abklingzeit: τ = V/S_eff
}
```

### 2.2 Logik: Leitwertberechnung (1h)

**Datei:** `src/lib/leakSearch/conductance.ts`

```typescript
export interface VacuumLine {
  diameter_mm: number
  length_mm: number
  type: 'tube' | 'elbow' | 'valve'
}

export function calculateConductance(
  line: VacuumLine,
  pressure_mbar: number,
  gasType: 'He' | 'N2' | 'air' = 'He'
): number {
  // Molekulare Strömung: C = 12.1 × D³/L [l/s] für Luft
  // He-Korrektur: ×1.08
}

export function calculateResponseTime(
  volume_L: number,
  conductance_Lps: number,
  pumpSpeed_Lps: number
): number {
  // τ = V / (S_eff) wobei 1/S_eff = 1/S + 1/C
}
```

### 2.3 UI: Equipment-Anzeige + Checkliste (1h)

Erweitern von `ResultStep.tsx`:
- Pumpen-Empfehlung mit Begründung
- Equipment-Checkliste (collapsible)
- Link zu RoR-Modul wenn B2 empfohlen

---

## Phase 3: RGA-Integration (2h)

### 3.1 UI: Nach-Lecksuche Empfehlungen (1h)

In `ResultStep.tsx`:
```typescript
{recommendation.method !== 'rate_of_rise' && (
  <RGARecommendationCard
    useful={isRGAUseful(requirements)}
    whatToLookFor={[
      'N₂/O₂ Verhältnis 3.7:1 → Echtes Luftleck',
      'Ar bei m/z 40 → Bestätigung Luftleck',
      'H₂O dominant ohne O₂ → Virtuelles Leck',
    ]}
    onNavigateToRGA={() => navigate('/rga')}
  />
)}
```

### 3.2 Deep-Link: Von RGA-Diagnose zurück (1h)

In `DiagnosisPanel` bei Luftleck/Virtual-Leak Diagnose:
```typescript
{diagnosis.type === 'AIR_LEAK' && (
  <Button onClick={() => navigate('/leak-search-planner')}>
    Lecksuche planen
  </Button>
)}
```

---

## Phase 4: Integration (2h)

### 4.1 FunctionSelector: 5. Karte (30min)

**Datei:** `src/components/FunctionSelector/index.tsx`

```typescript
{/* Leak Search Planner Card */}
<button
  onClick={onSelectLeakSearch}
  className="group p-8 rounded-card bg-surface-card border border-subtle
    hover:border-coral-500/50 hover:shadow-lg transition-all text-left"
>
  <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-coral-500 to-amber-500
    flex items-center justify-center group-hover:scale-110 transition-transform">
    <svg><!-- Lupe + Leck Icon --></svg>
  </div>
  <h3>{t('selector.leakSearch.title', 'Lecksuche-Planer')}</h3>
  <p>{t('selector.leakSearch.description', 'Optimale Lecksuchmethode nach DIN EN 1779')}</p>
  <div className="flex flex-wrap gap-2">
    <span>DIN EN 1779</span>
    <span>Helium</span>
    <span>Pumpenberechnung</span>
  </div>
</button>
```

### 4.2 ActionsSidebar: Icon (30min)

Neues Icon für Lecksuche-Planer in der Seitenleiste.

### 4.3 App.tsx: Routing (30min)

State und Routing für neue Page.

### 4.4 i18n: Übersetzungen (30min)

Alle Texte in `de.json` und `en.json`.

---

## Dateistruktur

```
src/
├── components/
│   ├── LeakSearchPlanner/
│   │   ├── index.tsx                    # Hauptkomponente
│   │   ├── WizardStepper.tsx            # Fortschrittsanzeige
│   │   └── steps/
│   │       ├── TestObjectStep.tsx       # Schritt 1: Prüfling
│   │       ├── MaterialStep.tsx         # Schritt 2: Material
│   │       ├── RequirementsStep.tsx     # Schritt 3: Anforderungen
│   │       └── ResultStep.tsx           # Schritt 4: Ergebnis
│   └── shared/
│       └── ChamberGeometryInput.tsx     # Extrahiert aus Outgassing
│
├── lib/
│   └── leakSearch/
│       ├── index.ts                     # Re-exports
│       ├── leakRateStandards.ts         # CERN, GSI, etc.
│       ├── methodSelection.ts           # selectTestMethod()
│       ├── virtualLeakRisk.ts           # assessVirtualLeakRisk()
│       ├── pumpCalculation.ts           # Pumpen-Empfehlung
│       └── conductance.ts               # Leitwert + Ansprechzeit
```

---

## Testfälle

| Test | Eingabe | Erwartetes Ergebnis |
|------|---------|---------------------|
| Grob-Check | Rate ≥ 10⁻⁵, evakuierbar | B2 (Rate-of-Rise) |
| UHV lokal | Rate 10⁻⁹, Lokalisierung, He | B5 (He-Spray Vakuum) |
| UHV integral | Rate 10⁻⁹, kein Lokalisierung | B6 (He-Vakuum integral) |
| Kein Vakuum | Rate 10⁻⁷, nicht evakuierbar | B4 (He-Schnüffeln) |
| Virtual-Leak Risiko | Sackbohrungen + Gewinde | Risiko: HIGH |

---

## Abhängigkeiten

- [ ] **1.5.3 Konfidenz-Score** - Optional, aber verbessert RGA-Validierung
- [x] Ausgasungs-Simulator - Geometrie-Rechner
- [x] RoR-Modul - Verlinkung für B2
- [x] RGA-Diagnose - Validierung nach Lecksuche

---

## Changelog

| Datum | Änderung |
|-------|----------|
| 2026-01-08 | Initiale Planung erstellt |
