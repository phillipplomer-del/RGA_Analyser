# RGA Analyser - App-Architektur Übersicht

> **TL;DR:** "Detektoren" sind TypeScript-Funktionen im Backend. Du siehst sie in der UI nicht direkt, sondern nur ihre **Ergebnisse** als "Diagnosen" im DiagnosisPanel.

**Erstellt:** 2026-01-11
**Version:** 1.0
**Zweck:** Architektur-Übersicht für Entwickler - Was läuft wo, wie hängt alles zusammen?

---

## 🗺️ Der komplette Datenfluss

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. USER ACTION: File Upload (.asc/.txt)                                │
│    Component: FileManager, App.tsx (onDrop handler)                    │
└──────────────────────────┬──────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ 2. PARSING: .asc/.txt → RawData                                        │
│    File: src/lib/parser.ts                                             │
│    Function: parseASCFile(content: string)                             │
│    Output: RawData { points: DataPoint[], metadata: {...} }            │
└──────────────────────────┬──────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ 3. ANALYSIS PIPELINE: RawData → AnalysisResult                         │
│    File: src/lib/analysis/index.ts                                     │
│    Function: analyzeSpectrum(raw, options)                             │
│                                                                         │
│    Schritte:                                                            │
│    [1] Background Subtraction                                           │
│    [2] Peak Detection                                                   │
│    [3] Normalization (auf H₂)                                           │
│    [4] Relative Sensitivity Factor (RSF) Correction                     │
│    [5] Gas Identification (KNOWN_MASSES mapping)                        │
│    [6] Quality Checks (performQualityChecks)                            │
│    [7] Limit Checks (checkLimits)                                       │
│    [8] Diagnosis Engine ← HIER LAUFEN DIE DETEKTOREN! ← ← ← ←          │
│    [9] Calibration (pressure conversion)                                │
│    [10] Data Quality Score                                              │
└──────────────────────────┬──────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ 4. DETECTORS PIPELINE: Peaks → DiagnosticResult[]                      │
│    File: src/lib/diagnosis/index.ts                                    │
│    Function: runFullDiagnosis(input, minConfidence)                    │
│                                                                         │
│    Input: DiagnosisInput { peaks: Record<mass, intensity>, metadata }  │
│                                                                         │
│    Alle 22 Detektoren laufen nacheinander:                              │
│    ├─ detectAirLeak()                (src/lib/diagnosis/detectors.ts)  │
│    ├─ detectVirtualLeak()                                               │
│    ├─ detectOilBackstreaming()                                          │
│    ├─ detectFomblinContamination()                                      │
│    ├─ detectSolventResidue()                                            │
│    ├─ detectChlorinatedSolvent()                                        │
│    ├─ detectWaterOutgassing()                                           │
│    ├─ detectHydrogenDominant()                                          │
│    ├─ detectESDartifacts()          ← Cross-Validated (Gemini+Grok)    │
│    ├─ detectHeliumLeak()             ← Cross-Validated (Gemini+Grok)   │
│    ├─ detectSiliconeContamination()                                     │
│    ├─ distinguishN2fromCO()                                             │
│    ├─ detectCleanUHV()                                                  │
│    ├─ detectAmmonia()                                                   │
│    ├─ detectMethane()                                                   │
│    ├─ detectSulfur()                                                    │
│    ├─ detectAromatic()                                                  │
│    ├─ detectPolymerOutgassing()      ← Cross-Validated (Gemini+Grok)   │
│    ├─ detectPlasticizerContamination() ← Cross-Validated (Gemini+Grok) │
│    ├─ detectProcessGasResidue()                                         │
│    ├─ detectCoolingWaterLeak()                                          │
│    └─ verifyIsotopeRatios()          ← Cross-Validated (Gemini+Grok)   │
│                                                                         │
│    Output: DiagnosticResult[] (sortiert: Schweregrad → Konfidenz)      │
└──────────────────────────┬──────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ 5. UI RENDERING: AnalysisResult → React Components                     │
│    Store: src/store/useAppStore.ts                                     │
│    State: files: MeasurementFile[] mit .analysisResult                 │
└──────────────────────────┬──────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ 6. USER SIEHT:                                                          │
│                                                                         │
│    Component: DiagnosisPanel (src/components/DiagnosisPanel/index.tsx) │
│    ├─ DataQualityScoreCard (A-F Grade Badge)                           │
│    ├─ Summary Stats (kritisch/warnung/info counts)                     │
│    ├─ OutgassingContext (kontext-sensitiv)                             │
│    └─ Diagnosis Cards (expandable):                                    │
│        - Icon + Name (DE/EN)                                            │
│        - Description                                                    │
│        - Confidence %                                                   │
│        - Severity Badge (Kritisch/Warnung/Info)                         │
│        - Expandable: Recommendation, Affected Masses, Evidence Count   │
│                                                                         │
│    → DIESE "DIAGNOSEN" = OUTPUT DER DETEKTOREN! ←                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Was sind "Detektoren"?

### Definition

**Detektoren** = TypeScript-Funktionen, die Peak-Daten analysieren und diagnostizieren

**Location:** `src/lib/diagnosis/detectors.ts` (~2000 Zeilen Code)

### Beispiel: detectAirLeak

```typescript
export function detectAirLeak(input: DiagnosisInput): DiagnosticResult | null {
  const { peaks } = input

  // 1. Hole relevante Massen
  const m28 = getPeak(peaks, 28) // N₂
  const m32 = getPeak(peaks, 32) // O₂
  const m40 = getPeak(peaks, 40) // Ar

  // 2. Berechne Ar/N₂ Ratio (Luft-Signatur)
  const arToN2 = m40 / m28
  const EXPECTED_AR_N2 = 0.0119  // NIST-Wert für Luft

  // 3. Prüfe ob Ratio zu Luft passt
  if (Math.abs(arToN2 - EXPECTED_AR_N2) / EXPECTED_AR_N2 < 0.2) {
    // AIR LEAK DETECTED!
    return {
      type: DiagnosisType.AIR_LEAK,
      name: 'Luftleck',
      nameEn: 'Air Leak',
      description: 'N₂/O₂/Ar-Verhältnis deutet auf Lufteinbruch hin',
      descriptionEn: 'N₂/O₂/Ar ratio indicates air leak',
      confidence: 0.9,
      severity: 'critical',
      evidence: [/* ... */],
      affectedMasses: [28, 32, 40]
    }
  }

  return null  // Kein Luftleck
}
```

### Was Detektoren tun

| Schritt | Beschreibung |
|---------|--------------|
| **Input** | `DiagnosisInput { peaks, metadata }` |
| **Analyse** | Mathematik/Physik auf Peak-Daten (Ratios, Thresholds, Pattern Matching) |
| **Entscheidung** | Gibt es eine Diagnose? Ja → DiagnosticResult, Nein → null |
| **Output** | `DiagnosticResult { type, name, confidence, severity, evidence, ... }` |

### Alle 22 Detektoren

| # | Funktion | Sucht nach | Cross-Validated? |
|---|----------|------------|------------------|
| 1 | `detectAirLeak()` | Ar/N₂ Ratio (Luft-Signatur) | ✅ (Gemini+Grok) |
| 2 | `detectVirtualLeak()` | Delayed CO₂/H₂O outgassing | ❌ |
| 3 | `detectOilBackstreaming()` | Öl-Pattern (Δ14 amu) | ✅ (Gemini+Grok) |
| 4 | `detectFomblinContamination()` | PFPE-Pattern (CF₃, CF₂) | ✅ (Gemini+Grok) |
| 5 | `detectSolventResidue()` | m/z 43, 58 (Aceton) | ❌ |
| 6 | `detectChlorinatedSolvent()` | Cl⁺ + Isotopen | ❌ |
| 7 | `detectWaterOutgassing()` | H₂O/H₂ Ratio | ❌ |
| 8 | `detectHydrogenDominant()` | H₂ > 90% | ❌ |
| 9 | `detectESDartifacts()` | Anomale O⁺/N⁺/C⁺/H⁺ Ratios | ✅ (Gemini+Grok) |
| 10 | `detectHeliumLeak()` | m/z 4 erhöht + RSF-Korrektur | ✅ (Gemini+Grok) |
| 11 | `detectSiliconeContamination()` | Si-Pattern | ❌ |
| 12 | `distinguishN2fromCO()` | m/z 12 + 14 vs 28 | ❌ |
| 13 | `detectCleanUHV()` | Dominanter H₂, minimale Kontaminanten | ❌ |
| 14 | `detectAmmonia()` | m/z 17 (NH₃) | ❌ |
| 15 | `detectMethane()` | m/z 16 (CH₄) | ❌ |
| 16 | `detectSulfur()` | m/z 32, 34 (H₂S) | ❌ |
| 17 | `detectAromatic()` | m/z 77, 78 (Benzol) | ❌ |
| 18 | `detectPolymerOutgassing()` | CO₂ + hydrocarbons | ✅ (Gemini+Grok) |
| 19 | `detectPlasticizerContamination()` | m/z 149 (Phthalat) | ✅ (Gemini+Grok) |
| 20 | `detectProcessGasResidue()` | SF₆, CF₄ | ❌ |
| 21 | `detectCoolingWaterLeak()` | Massive H₂O + N₂ | ❌ |
| 22 | `verifyIsotopeRatios()` | ¹²C/¹³C, ¹⁶O/¹⁸O, ... | ✅ (Gemini+Grok) |

---

## 🧩 Die zwei Haupt-Panels in der UI

### 1. DiagnosisPanel (Automatische Diagnose)

**File:** `src/components/DiagnosisPanel/index.tsx`

**Was es zeigt:**
- **DataQualityScore** (A-F Grade Badge)
- **Diagnosis Cards** - Die Ergebnisse der Detektoren!
  - Icon + Name (z.B. "💨 Luftleck")
  - Confidence % (z.B. 92%)
  - Severity (Kritisch/Warnung/Info)
  - Recommendation (z.B. "System auf Leckagen prüfen")
  - Affected Masses (z.B. m/z 28, 32, 40)

**Props:**
```typescript
interface DiagnosisPanelProps {
  diagnostics: DiagnosticResultSummary[]  // ← Output der Detektoren!
  summary: DiagnosisSummary
  dataQualityScore?: DataQualityScore
}
```

**Wichtig:** DiagnosisPanel zeigt **automatisch generierte Diagnosen**. Jede Diagnosis Card ist das Ergebnis eines Detektors.

---

### 2. KnowledgePanel (Nachschlagewerk)

**File:** `src/components/KnowledgePanel/index.tsx`

**Was es zeigt:**

9 Tabs mit **statischem Wissen** (kein Output der Detektoren!):

| Tab | Content | Source |
|-----|---------|--------|
| **Kriterien** | Detaillierte Beschreibung jeder Diagnose-Art (was prüft detectAirLeak?) | `DIAGNOSIS_METADATA` (types.ts) |
| **Gase** | Gas-Bibliothek (H₂, He, N₂, O₂, ...) mit Properties | `GAS_LIBRARY` (gasLibrary.ts) |
| **Massen** | m/z Referenz (1-200) - welche Ionen? | `MASS_REFERENCE` (massReference.ts) |
| **Muster** | Typische Peak-Pattern (Öl, Luft, ESD) | `DIAGNOSTIC_MASS_GROUPS` (knowledge/) |
| **Kalibrierung** | RSF-Faktoren für jedes Gas | `SENSITIVITY_FACTORS` (knowledge/) |
| **Ausgasung** | Outgassing Rates für Materialien | `OUTGASSING_MATERIALS` (outgassingRates.ts) |
| **Rate of Rise** | RoR-Theorie und Berechnung | Statischer Text |
| **Validierung** | Welche Detektoren sind wissenschaftlich validiert? | `DETECTOR_VALIDATIONS` (validation.ts) |
| **Referenzen** | Wissenschaftliche Quellen (NIST, CERN, ...) | Statischer Text |

**Props:**
```typescript
interface KnowledgePanelProps {
  compact?: boolean
  onShowOutgassing?: () => void
}
```

**Wichtig:** KnowledgePanel ist ein **Lehrbuch**, kein Analyse-Output. Es zeigt **was** die App weiß, nicht **was** sie im aktuellen Spektrum gefunden hat.

---

## 🔀 Unterschied: Diagnosen vs. Kriterien

### Verwechslungsgefahr!

| Begriff | Was ist das? | Wo sichtbar? |
|---------|--------------|--------------|
| **Diagnosen** | **Output der Detektoren** - Was wurde im aktuellen Spektrum gefunden? | DiagnosisPanel (Hauptansicht) |
| **Kriterien** | **Definition** - Was prüft ein Detektor? Welche Schwellwerte? | KnowledgePanel → Tab "Kriterien" |

### Beispiel: Luftleck

**Kriterien (KnowledgePanel):**
```
🔬 Luftleck-Erkennung (AIR_LEAK)

Geprüfte Kriterien:
1. Ar/N₂ Ratio = 0.0119 ± 20% (NIST-Wert)
2. O₂/N₂ Ratio = 0.268 ± 10% (Luft-Zusammensetzung)
3. Minimum Intensität: m/z 28 > 1%

Quellen: NIST SRD 69, Lafferty (1998)
Status: ✅ Cross-Validated (Gemini + Grok)
```

**Diagnose (DiagnosisPanel):**
```
┌──────────────────────────────────────────┐
│ 💨 Luftleck                    92% ██████│
│ N₂/O₂/Ar-Verhältnis deutet auf          │
│ Lufteinbruch hin                         │
│                                          │
│ Severity: KRITISCH                       │
│ Affected Masses: m/z 28, 32, 40         │
│ Evidence: 3 Kriterien erfüllt            │
└──────────────────────────────────────────┘
```

---

## 📊 Data Structures (TypeScript Interfaces)

### DiagnosticResult (Output eines Detektors)

```typescript
interface DiagnosticResult {
  type: DiagnosisType                    // Enum (AIR_LEAK, HELIUM_LEAK, ...)
  name: string                           // "Luftleck" (DE)
  nameEn: string                         // "Air Leak" (EN)
  description: string                    // Kurzbeschreibung (DE)
  descriptionEn: string                  // Kurzbeschreibung (EN)
  recommendation: string                 // Was tun? (DE)
  recommendationEn: string               // Was tun? (EN)
  confidence: number                     // 0-1 (z.B. 0.92 = 92%)
  severity: 'critical' | 'warning' | 'info'
  evidence: EvidenceItem[]               // Warum diese Diagnose?
  affectedMasses: number[]               // [28, 32, 40]
}
```

### DiagnosisInput (Input für Detektoren)

```typescript
interface DiagnosisInput {
  peaks: Record<number, number>          // { 2: 0.85, 18: 0.12, 28: 0.03, ... }
  metadata?: {
    totalPressure?: number               // Gesamtdruck [mbar]
    temperature?: number                 // Temperatur [°C]
    bakedOut?: boolean                   // Ausgeheizt?
    chamber?: string                     // Kammername
  }
}
```

---

## 🧪 Wissenschaftliche Validierung (Cross-Validation)

### Status: 8/22 Detektoren validiert

**Methode:** Multi-AI Cross-Validation (Gemini + Grok + Claude Merge)

| Detektor | Status | Findings | Merged Doc |
|----------|--------|----------|------------|
| `detectAirLeak()` | ✅ COMPLETE | CRITICAL: Argon ratio 0.0119 (not 0.1), O₂ isotope fix 487→244 | [FEATURE_1.5.1_AIR_LEAK_DETECTION.md](../PHYSICS/FEATURE_1.5.1_AIR_LEAK_DETECTION.md) |
| `detectOilBackstreaming()` | ✅ COMPLETE | HIGH: Add source attribution (Hablanian 1997) | [FEATURE_1.5.3_OIL_BACKSTREAMING_DETECTION.md](../PHYSICS/FEATURE_1.5.3_OIL_BACKSTREAMING_DETECTION.md) |
| `detectFomblinContamination()` | ✅ COMPLETE | CRITICAL: Missing m/z 50 (CF₂⁺) | [FEATURE_1.5.4_FOMBLIN_PFPE_DETECTION.md](../PHYSICS/FEATURE_1.5.4_FOMBLIN_PFPE_DETECTION.md) |
| `detectPolymerOutgassing()` | ✅ COMPLETE | HIGH: Add polymer-specific markers (m/z 41, 43, 44) | [FEATURE_1.5.5_POLYMER_OUTGASSING_DETECTION.md](../PHYSICS/FEATURE_1.5.5_POLYMER_OUTGASSING_DETECTION.md) |
| `detectESDartifacts()` | ✅ COMPLETE | CRITICAL: Thresholds for N⁺ (0.07→0.10) and H⁺ (0.01→0.10) too strict | [FEATURE_1.5.6_ESD_ARTIFACT_DETECTION.md](../PHYSICS/FEATURE_1.5.6_ESD_ARTIFACT_DETECTION.md) |
| `detectHeliumLeak()` | ✅ COMPLETE | CRITICAL: Missing RSF correction (He=0.15, H₂=0.44), threshold 0.1→0.03 | [FEATURE_1.5.7_HELIUM_LEAK_DETECTION.md](../PHYSICS/FEATURE_1.5.7_HELIUM_LEAK_DETECTION.md) |
| `verifyIsotopeRatios()` | ✅ COMPLETE | CRITICAL: O₂ isotope ratio 487→244 (atomic vs molecular) | [FEATURE_1.8.2_ISOTOPE_RATIO_VERIFICATION.md](../PHYSICS/FEATURE_1.8.2_ISOTOPE_RATIO_VERIFICATION.md) |
| `detectPlasticizerContamination()` | ✅ COMPLETE | HIGH: Add m/z 167 (phthalate secondary marker) | [FEATURE_1.5.8_PLASTICIZER_PHTHALATE_DETECTION.md](../PHYSICS/FEATURE_1.5.8_PLASTICIZER_PHTHALATE_DETECTION.md) |
| Andere 14 Detektoren | ⏳ PENDING | Not yet cross-validated | - |

**Alle Fixes implementiert:** 2026-01-11 ✅
**Build Status:** ✅ SUCCESSFUL

---

## 🏗️ File Structure (Key Files)

```
src/
├── lib/
│   ├── analysis/
│   │   └── index.ts                    # analyzeSpectrum() - Main Pipeline
│   ├── diagnosis/
│   │   ├── index.ts                    # runFullDiagnosis() - Runs all detectors
│   │   ├── detectors.ts                # 22 detector functions (2000+ lines)
│   │   ├── types.ts                    # DiagnosticResult, DiagnosisType, ...
│   │   ├── confidenceScore.ts          # Data Quality Score (A-F)
│   │   └── validation.ts               # DETECTOR_VALIDATIONS (scientific status)
│   ├── knowledge/
│   │   ├── gasLibrary.ts               # GAS_LIBRARY (47 gases)
│   │   ├── massReference.ts            # MASS_REFERENCE (1-200)
│   │   ├── isotopePatterns.ts          # ISOTOPE_RATIOS (¹²C/¹³C, ¹⁶O/¹⁸O, ...)
│   │   ├── outgassingRates.ts          # OUTGASSING_MATERIALS (95 materials)
│   │   └── index.ts                    # DIAGNOSTIC_MASS_GROUPS, SENSITIVITY_FACTORS
│   └── parser.ts                       # parseASCFile() - .asc/.txt → RawData
├── components/
│   ├── DiagnosisPanel/
│   │   ├── index.tsx                   # Main panel - shows detector results
│   │   ├── DataQualityScoreCard.tsx    # A-F Grade display
│   │   └── OutgassingContext.tsx       # Context-sensitive outgassing info
│   ├── KnowledgePanel/
│   │   └── index.tsx                   # 9 tabs with static knowledge
│   ├── SpectrumChart/                  # Main chart with peaks
│   ├── PeakTable/                      # Table with all peaks
│   └── FileManager/                    # Upload + file list
└── store/
    └── useAppStore.ts                  # Zustand store (files, analysis results, ...)
```

---

## 🔄 Zusammenfassung: Wie alles zusammenhängt

### In einem Satz

**Detektoren = Backend-Funktionen → erzeugen Diagnosen → werden im DiagnosisPanel angezeigt**

### Vergleich mit Auto-Werkstatt

| Real World | RGA Analyser |
|------------|--------------|
| Mechaniker prüft Motor | Detektor analysiert Spektrum |
| Diagnose: "Defekter Luftfilter" | DiagnosticResult: "Luftleck" |
| Mechaniker sagt's dir | DiagnosisPanel zeigt Card |
| Handbuch: "So prüft man Luftfilter" | KnowledgePanel: "Kriterien"-Tab |

### Warum heißt es "Detektor" und nicht "Diagnose-Funktion"?

Historische Gründe - in der RGA-Community nennt man Pattern-Recognition-Algorithmen "Detectors":
- "Air Leak Detector"
- "ESD Artifact Detector"
- "Oil Contamination Detector"

Es sind keine Hardware-Detektoren (wie der SEM im RGA), sondern **Software-Detektoren** = Algorithmen die bestimmte Signaturen erkennen.

---

## 📚 Weitere Dokumentation

| Dokument | Zweck |
|----------|-------|
| [CROSS_VALIDATION_STATUS.md](../BACKLOG/CROSS_VALIDATION_STATUS.md) | Status aller 22 Detektoren (validiert/pending) |
| [FEATURE_BACKLOG.md](../BACKLOG/FEATURE_BACKLOG.md) | Alle Features (inkl. Detektoren) mit Status |
| [PHYSICS/*.md](../PHYSICS/) | Wissenschaftliche Dokumentation für validierte Detektoren (8 Files) |
| [PROGRESSIVE_DISCLOSURE_STRATEGY.md](../UX/PROGRESSIVE_DISCLOSURE_STRATEGY.md) | Feature 5.5 - Wie zeigen wir 46 Features ohne UX-Overload? |

---

## ❓ FAQ

### F: Wo ist der Code für "Kriterien", "Gase", "Massen" im KnowledgePanel?

**A:** Das sind statische Knowledge-Base-Daten:
- Kriterien: `DIAGNOSIS_METADATA` in `src/lib/diagnosis/types.ts`
- Gase: `GAS_LIBRARY` in `src/lib/knowledge/gasLibrary.ts`
- Massen: `MASS_REFERENCE` in `src/lib/knowledge/massReference.ts`

### F: Warum sehe ich in der UI keine "Detektoren"?

**A:** Weil das Backend-Funktionen sind. Du siehst nur ihre **Ergebnisse** = Diagnosen im DiagnosisPanel.

### F: Was ist der Unterschied zwischen DiagnosisPanel und KnowledgePanel?

**A:**
- **DiagnosisPanel** = Was wurde **gefunden** (dynamisch, spektrum-spezifisch)
- **KnowledgePanel** = Was **weiß** die App (statisch, Nachschlagewerk)

### F: Wo ist der "Validierung"-Tab im KnowledgePanel?

**A:** Zeigt welche Detektoren wissenschaftlich validiert sind:
- Source: `DETECTOR_VALIDATIONS` in `src/lib/diagnosis/validation.ts`
- Status: 8/22 validated (Gemini+Grok Cross-Validation)

### F: Was passiert wenn ich ein File uploade?

**A:** Siehe "Der komplette Datenfluss" oben - kurz:
1. parseASCFile() → RawData
2. analyzeSpectrum() → läuft alle Detektoren
3. DiagnosisPanel zeigt Ergebnisse

---

**Version:** 1.0
**Letzte Aktualisierung:** 2026-01-11
**Autor:** Claude Code
**Status:** ✅ Complete
