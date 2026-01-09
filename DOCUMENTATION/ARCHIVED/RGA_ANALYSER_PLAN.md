# RGA Analyser App - Implementierungsplan

## Inhaltsverzeichnis

1. [Projektübersicht](#1-projektübersicht)
2. [Technischer Hintergrund: Restgasanalyse (RGA)](#2-technischer-hintergrund-restgasanalyse-rga)
3. [Analyse der Quelldaten](#3-analyse-der-quelldaten)
4. [Excel-Auswertungsmethodik](#4-excel-auswertungsmethodik)
5. [App-Architektur](#5-app-architektur)
6. [Implementierungsdetails](#6-implementierungsdetails)
7. [UI/UX Design](#7-uiux-design)
8. [AI-Integration](#8-ai-integration)
9. [Quellen und Referenzen](#9-quellen-und-referenzen)

---

## 1. Projektübersicht

### Ziel
Entwicklung einer Web-App, die Excel bei der Auswertung von Restgasanalyse-Messungen (RGA) aus Pfeiffer Vacuum Prisma Plus/Pro Geräten ersetzt.

### Funktionsumfang
- Upload und Parsing von `.asc` Textdateien
- Automatische Datenanalyse (Background Subtraction, Normalisierung, Peak-Integration)
- Graphische Darstellung des RGA-Spektrums mit D3.js
- Prüfung gegen GSI- und CERN-Spezifikationen
- KI-gestützte Interpretation der Ergebnisse (Claude & Gemini)

### Technologie-Stack
| Komponente | Technologie |
|------------|-------------|
| Build Tool | Vite |
| Sprache | TypeScript |
| Styling | Tailwind CSS 4 |
| Charts | D3.js |
| AI APIs | Claude API, Gemini API |

---

## 2. Technischer Hintergrund: Restgasanalyse (RGA)

### 2.1 Funktionsprinzip

Restgasanalysesysteme (RGA) nutzen Quadrupol-Massenspektrometrie zur Analyse der Gaszusammensetzung in Vakuumumgebungen. Das Prinzip:

1. **Ionisation**: Neutrale Gasteilchen werden durch 70 eV Elektronen ionisiert
2. **Massenfilterung**: Ionen werden im Quadrupol nach Masse-zu-Ladungs-Verhältnis (m/z) separiert
3. **Detektion**: Ionenstrom wird mit Faraday-Cup oder Sekundärelektronenvervielfacher (SEM) gemessen

Der gemessene Ionenstrom ist proportional zum Partialdruck der jeweiligen Gaskomponente.

### 2.2 Typische Gase und ihre Massen (AMU)

| AMU | Gas/Ion | Ursprung | Relative Intensität |
|-----|---------|----------|---------------------|
| 1 | H⁺ | H₂-Fragment | ~2% von H₂ |
| 2 | H₂⁺ | Wasserstoff | 100% (Hauptpeak) |
| 4 | He⁺ | Helium | 100% |
| 12 | C⁺ | CO/CO₂-Fragment | ~6% von CO |
| 14 | N⁺ | N₂-Fragment | ~14% von N₂ |
| 16 | O⁺ | O₂/H₂O/CO₂-Fragment | ~11% von O₂, ~2% von H₂O |
| 17 | OH⁺ | H₂O-Fragment | ~23% von H₂O |
| 18 | H₂O⁺ | Wasser | 100% (Hauptpeak) |
| 20 | Ar²⁺ / Ne⁺ | Argon (doppelt ionisiert) / Neon | ~11% von Ar |
| 28 | N₂⁺ / CO⁺ | Stickstoff / Kohlenmonoxid | 100% |
| 32 | O₂⁺ | Sauerstoff | 100% |
| 40 | Ar⁺ | Argon | 100% |
| 44 | CO₂⁺ | Kohlendioxid | 100% |

### 2.3 Fragmentierungsmuster

Bei der Ionisation fragmentieren Moleküle. Wichtige Muster:

**Wasser (H₂O)**:
- 18 AMU: H₂O⁺ (100%)
- 17 AMU: OH⁺ (23%)
- 16 AMU: O⁺ (2%)

**Stickstoff (N₂)**:
- 28 AMU: N₂⁺ (100%)
- 14 AMU: N⁺ (14%)

**Sauerstoff (O₂)**:
- 32 AMU: O₂⁺ (100%)
- 16 AMU: O⁺ (11%)

**Kohlendioxid (CO₂)**:
- 44 AMU: CO₂⁺ (100%)
- 28 AMU: CO⁺ (11%)
- 16 AMU: O⁺ (8%)
- 12 AMU: C⁺ (6%)

**Kohlenwasserstoffe** (Öl-Kontamination):
- Typisches "Unzipping"-Muster: Peaks bei 14 AMU Abständen
- Charakteristische Paare: 41/43, 55/57, 69/71

### 2.4 Unterscheidung N₂ vs. CO bei 28 AMU

Da beide Gase bei 28 AMU erscheinen, nutzt man das Fragment-Verhältnis:

- **Wenn hauptsächlich N₂**: Großer Peak bei 14 AMU (N⁺-Fragment)
- **Wenn hauptsächlich CO**: Kleiner Peak bei 14, aber Peak bei 44 (CO₂ als Begleitgas)

Verhältnis 14/28:
- N₂: ~14%
- CO: ~1%

### 2.5 Sensitivitätsfaktoren

RGAs messen Ionenströme, nicht direkt Partialdrücke. Umrechnung mit Sensitivitätsfaktoren (relativ zu N₂ = 1.0):

| Gas | Faktor |
|-----|--------|
| H₂ | 0.44 |
| He | 0.14 |
| H₂O | 0.9 |
| N₂ | 1.0 (Referenz) |
| O₂ | 0.86 |
| Ar | 1.2 |
| CO | 1.05 |
| CO₂ | 1.4 |

**Formel**: `Partialdruck = Ionenstrom / (Sensitivität × Sensitivitätsfaktor)`

---

## 3. Analyse der Quelldaten

### 3.1 .asc Dateiformat (Pfeiffer Prisma)

Die `.asc` Dateien sind Tab-separierte Textdateien mit folgendem Aufbau:

```
Sourcefile    20251216 061505 Analog Scan SEM 100.qmp
Exporttime    12.16.2025 12:58:16.824

Start Time    12.16.2025 12:53:59.429
End Time      12.16.2025 12:54:04.429


Task Name     Scan
First Mass    0,00
Scan Width    100,00

Start Time    12.16.2025 12:53:59.429

Mass [amu]    Ion Current [A]
0,00          3,628039e-013
0,03          1,663464e-013
0,06          5,560417e-014
...
```

#### Header-Felder:
| Feld | Beschreibung |
|------|--------------|
| Sourcefile | Original .qmp Quelldatei |
| Exporttime | Zeitpunkt des ASCII-Exports |
| Start Time | Messbeginn |
| End Time | Messende |
| Task Name | Art der Messung (z.B. "Scan") |
| First Mass | Startmasse (typisch 0 AMU) |
| Scan Width | Messbereich (typisch 100 AMU) |

#### Datenformat:
- **Spalte 1**: Mass [amu] - Dezimalzahlen mit Komma (deutsches Format)
- **Spalte 2**: Ion Current [A] - Wissenschaftliche Notation (z.B. `3,628039e-013`)
- **Auflösung**: ~0.03 AMU Schrittweite
- **Datenpunkte**: ~3200 Punkte für 0-100 AMU

### 3.2 Identifizierte Peaks in der Beispieldatei

Dateiname: `2_Kammer1_nach Ausheizen_Test8_1000v_48h_20C_2,1e-9mbar.asc`

| AMU | Ion Current [A] | Gas | Bemerkung |
|-----|-----------------|-----|-----------|
| 2.22 | 1.27e-9 | H₂ | Hauptpeak (Wasserstoff) |
| 14.0 | 1.41e-13 | N⁺ | Fragment von N₂ |
| 16.0 | 6.80e-13 | O⁺ | Fragment (H₂O, O₂, CO₂) |
| 17.0 | 1.06e-12 | OH⁺ | Fragment von H₂O |
| 18.0 | 3.73e-12 | H₂O⁺ | Wasser |
| 28.0 | 2.22e-12 | N₂⁺/CO⁺ | Stickstoff/Kohlenmonoxid |
| 32.0 | ~5.2e-14 | O₂⁺ | Sauerstoff (sehr gering) |
| 40.0 | ~5.9e-14 | Ar⁺ | Argon (sehr gering) |
| 44.0 | 1.01e-12 | CO₂⁺ | Kohlendioxid |

**Interpretation der Beispieldaten**:
- Dominanter H₂-Peak → typisch nach Ausheizen
- Signifikanter H₂O-Peak → Restfeuchte
- N₂/CO bei 28 AMU → vermutlich CO (wegen CO₂ bei 44)
- Sehr niedriger O₂-Peak bei 32 → kein Luftleck
- CO₂-Peak deutet auf Ausgasung organischer Materialien hin

---

## 4. Excel-Auswertungsmethodik

### 4.1 Spaltenstruktur

| Spalte | Inhalt | Formel |
|--------|--------|--------|
| A | Mass [amu] | Rohdaten |
| B | Ion Current [A] | Rohdaten |
| C | Background subtracted | `=B - MIN(B)` |
| D | Scaled to H₂ | `=C / MAX(C)` |
| E | GSI Limit | Siehe 4.2 |
| F | Prüfung (GSI) | `=E - D` |
| H | CERN Limit | Siehe 4.3 |

### 4.2 GSI Spezifikation 7.3e (2019)

Grenzwerte (normalisiert auf H₂ = 1):

```javascript
function getGSILimit(mass) {
  if (mass <= 12) return 1.0;
  if (mass > 12 && mass < 19.5) return 0.1;
  if (mass > 27.5 && mass < 28.5) return 0.1;  // N₂/CO erlaubt
  if (mass > 43.5 && mass < 44.75) return 0.1; // CO₂ erlaubt
  if (mass > 45) return 0.001;
  return 0.02;  // Default für andere Massen
}
```

### 4.3 CERN Spezifikation 3076004 (2024)

Strengere Grenzwerte:

```javascript
function getCERNLimit(mass) {
  if (mass <= 3) return 1.0;                    // H₂ Region
  if (mass > 3 && mass < 20.5) return 0.1;      // H₂O Region
  if (mass > 20.4 && mass < 27.5) return 0.01;  // Zwischen H₂O und N₂
  if (mass > 27.4 && mass < 28.5) return 0.1;   // N₂/CO erlaubt
  if (mass > 28.45 && mass < 32.5) return 0.01; // Zwischen N₂ und O₂
  if (mass > 32.4 && mass < 43.5) return 0.002; // Kohlenwasserstoff-Region
  if (mass > 43.4 && mass < 45.1) return 0.05;  // CO₂ erlaubt
  if (mass > 45) return 0.0001;                 // Schwere Kohlenwasserstoffe
  return 1.0;
}
```

### 4.4 Peak-Integration

Die Summe der Ionenströme wird über einen Bereich von ±0.5 AMU um den nominalen Peak integriert:

```javascript
function integratePeak(data, targetMass) {
  const startMass = targetMass - 0.5;
  const endMass = targetMass + 0.5;

  // Filtere Datenpunkte im Bereich
  const pointsInRange = data.filter(p =>
    p.mass >= startMass && p.mass <= endMass
  );

  // Summe dividiert durch Anzahl der Punkte (normalisiert)
  const sum = pointsInRange.reduce((acc, p) => acc + p.current, 0);
  return sum / pointsInRange.length;
}
```

Bei ~32 Datenpunkten pro AMU entspricht dies der Formel `=SUM(range)/32`.

### 4.5 Qualitätskriterien

Die Excel-Datei prüft folgende Bedingungen:

| Kriterium | Formel | Bedeutung |
|-----------|--------|-----------|
| H₂ > 5 × H₂O | `Peak(2) > 5 * Peak(18)` | Ausreichend ausgeheizt, wenig Restfeuchte |
| N₂/CO > 4 × O₂ | `Peak(28) > 4 * Peak(32)` | Kein Luftleck (bei Leck wäre O₂ höher) |
| N < O | `Peak(14) < Peak(16)` | Konsistenzprüfung Fragmentierung |
| KW-39-45 < 0.1% | `(Peak(39)+Peak(41-43)+Peak(45)) < 0.001 * Gesamt` | Wenig leichte Kohlenwasserstoffe |
| KW-69-77 < 0.05% | `(Peak(69)+Peak(77)) < 0.0005 * Gesamt` | Wenig schwere Kohlenwasserstoffe (Öl) |

### 4.6 Zusätzliche berechnete Massen

| Beschreibung | Massen |
|--------------|--------|
| Gesamtdruck | Summe 0-100 AMU |
| Leichte KW | 39, 41, 42, 43, 45 |
| Schwere KW | 69, 77 |
| Fluorverbindungen | 19, 31, 50, 69 |
| Chlorverbindungen | 35, 36 |

---

## 5. App-Architektur

### 5.1 Projektstruktur

```
rga-analyser/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
│
├── public/
│   └── favicon.svg
│
├── src/
│   ├── main.ts                      # Entry Point
│   ├── App.tsx                      # Haupt-App-Komponente
│   ├── vite-env.d.ts
│   │
│   ├── components/
│   │   ├── FileUpload.tsx           # Drag & Drop Upload
│   │   ├── MetadataPanel.tsx        # Header-Informationen
│   │   ├── SpectrumChart.tsx        # D3.js Hauptchart
│   │   ├── PeakTable.tsx            # Peak-Übersicht
│   │   ├── LimitsChart.tsx          # Chart mit Limit-Linien
│   │   ├── QualityChecks.tsx        # Pass/Fail Kriterien
│   │   ├── AIPanel.tsx              # KI-Interpretation
│   │   └── ExportButton.tsx         # PDF/PNG Export
│   │
│   ├── lib/
│   │   ├── parser.ts                # .asc Datei Parser
│   │   ├── analysis.ts              # Berechnungen
│   │   ├── peaks.ts                 # Peak-Detektion
│   │   ├── limits.ts                # GSI/CERN Limits
│   │   ├── quality.ts               # Qualitätsprüfungen
│   │   └── ai-client.ts             # Claude/Gemini Integration
│   │
│   ├── charts/
│   │   ├── spectrum.ts              # D3 Spektrum-Chart
│   │   ├── comparison.ts            # D3 Vergleichs-Chart
│   │   └── utils.ts                 # Chart-Hilfsfunktionen
│   │
│   ├── types/
│   │   ├── rga.ts                   # RGA Datentypen
│   │   ├── analysis.ts              # Analyse-Ergebnisse
│   │   └── ai.ts                    # AI Response Types
│   │
│   └── styles/
│       └── main.css                 # Tailwind + Custom CSS
│
└── tests/
    ├── parser.test.ts
    ├── analysis.test.ts
    └── limits.test.ts
```

### 5.2 Datenfluss

```
┌─────────────────┐
│  .asc Upload    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Parser         │ → RawData { mass[], current[], metadata }
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Analysis       │ → AnalysisResult { normalized[], peaks[], quality }
└────────┬────────┘
         │
         ├──────────────────┬──────────────────┐
         ▼                  ▼                  ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  D3.js Charts   │ │  Results Table  │ │  AI Client      │
└─────────────────┘ └─────────────────┘ └────────┬────────┘
                                                 │
                                                 ▼
                                        ┌─────────────────┐
                                        │  Interpretation │
                                        └─────────────────┘
```

---

## 6. Implementierungsdetails

### 6.1 TypeScript Interfaces

```typescript
// types/rga.ts

export interface RGAMetadata {
  sourceFile: string;
  exportTime: Date;
  startTime: Date;
  endTime: Date;
  taskName: string;
  firstMass: number;
  scanWidth: number;
  chamberName?: string;
  pressure?: string;
}

export interface DataPoint {
  mass: number;        // AMU
  current: number;     // Ampere
}

export interface RawData {
  metadata: RGAMetadata;
  points: DataPoint[];
}

export interface NormalizedData {
  mass: number;
  current: number;           // Original
  backgroundSubtracted: number;
  normalizedToH2: number;    // 0-1 Skala
}

export interface Peak {
  mass: number;              // Nominale Masse (ganzzahlig)
  integratedCurrent: number; // Integrierter Ionenstrom
  normalizedValue: number;   // Relativ zu H₂
  gasIdentification: string; // z.B. "H₂O", "N₂/CO"
  fragments?: string[];      // Mögliche Fragmentquellen
}

export interface LimitCheck {
  mass: number;
  measuredValue: number;
  gsiLimit: number;
  cernLimit: number;
  gsiPassed: boolean;
  cernPassed: boolean;
}

export interface QualityCheck {
  name: string;
  description: string;
  formula: string;
  passed: boolean;
  measuredValue: number;
  threshold: number;
}

export interface AnalysisResult {
  metadata: RGAMetadata;
  normalizedData: NormalizedData[];
  peaks: Peak[];
  limitChecks: LimitCheck[];
  qualityChecks: QualityCheck[];
  totalPressure: number;
  dominantGases: { gas: string; percentage: number }[];
}
```

### 6.2 Parser Implementation

```typescript
// lib/parser.ts

export function parseASCFile(content: string): RawData {
  const lines = content.split('\n');
  const metadata: Partial<RGAMetadata> = {};
  const points: DataPoint[] = [];

  let dataStarted = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Header parsing
    if (!dataStarted) {
      if (trimmed.startsWith('Sourcefile')) {
        metadata.sourceFile = trimmed.split('\t')[1]?.trim();
      } else if (trimmed.startsWith('Exporttime')) {
        metadata.exportTime = parseGermanDate(trimmed.split('\t')[1]?.trim());
      } else if (trimmed.startsWith('Start Time') && !metadata.startTime) {
        metadata.startTime = parseGermanDate(trimmed.split('\t')[1]?.trim());
      } else if (trimmed.startsWith('End Time')) {
        metadata.endTime = parseGermanDate(trimmed.split('\t')[1]?.trim());
      } else if (trimmed.startsWith('Task Name')) {
        metadata.taskName = trimmed.split('\t')[1]?.trim();
      } else if (trimmed.startsWith('First Mass')) {
        metadata.firstMass = parseGermanNumber(trimmed.split('\t')[1]?.trim());
      } else if (trimmed.startsWith('Scan Width')) {
        metadata.scanWidth = parseGermanNumber(trimmed.split('\t')[1]?.trim());
      } else if (trimmed.startsWith('Mass [amu]')) {
        dataStarted = true;
      }
    } else {
      // Data parsing
      const parts = trimmed.split('\t');
      if (parts.length >= 2) {
        const mass = parseGermanNumber(parts[0]);
        const current = parseScientificNotation(parts[1]);
        if (!isNaN(mass) && !isNaN(current)) {
          points.push({ mass, current });
        }
      }
    }
  }

  // Extract chamber name from filename if available
  metadata.chamberName = extractChamberName(metadata.sourceFile);

  return {
    metadata: metadata as RGAMetadata,
    points
  };
}

function parseGermanNumber(str: string): number {
  // Konvertiert "1,234" zu 1.234
  return parseFloat(str?.replace(',', '.') || '0');
}

function parseScientificNotation(str: string): number {
  // Konvertiert "3,628039e-013" zu 3.628039e-13
  return parseFloat(str?.replace(',', '.') || '0');
}

function parseGermanDate(str: string): Date {
  // Format: "12.16.2025 12:58:16.824"
  // Achtung: Monat.Tag.Jahr Format!
  const match = str?.match(/(\d+)\.(\d+)\.(\d+)\s+(\d+):(\d+):(\d+)/);
  if (match) {
    const [, month, day, year, hour, min, sec] = match;
    return new Date(+year, +month - 1, +day, +hour, +min, +sec);
  }
  return new Date();
}
```

### 6.3 Analyse-Funktionen

```typescript
// lib/analysis.ts

export function analyzeSpectrum(raw: RawData): AnalysisResult {
  // 1. Background Subtraction
  const minCurrent = Math.min(...raw.points.map(p => p.current));

  // 2. Find H₂ peak for normalization
  const h2Peak = findPeakValue(raw.points, 2);
  const maxCurrent = h2Peak > 0 ? h2Peak : Math.max(...raw.points.map(p => p.current));

  // 3. Normalize data
  const normalizedData: NormalizedData[] = raw.points.map(p => ({
    mass: p.mass,
    current: p.current,
    backgroundSubtracted: p.current - minCurrent,
    normalizedToH2: (p.current - minCurrent) / (maxCurrent - minCurrent)
  }));

  // 4. Detect and integrate peaks
  const peaks = detectPeaks(raw.points, normalizedData);

  // 5. Check limits
  const limitChecks = checkLimits(normalizedData);

  // 6. Quality checks
  const qualityChecks = performQualityChecks(peaks);

  // 7. Calculate totals
  const totalPressure = calculateTotalPressure(raw.points);
  const dominantGases = identifyDominantGases(peaks, totalPressure);

  return {
    metadata: raw.metadata,
    normalizedData,
    peaks,
    limitChecks,
    qualityChecks,
    totalPressure,
    dominantGases
  };
}

function findPeakValue(points: DataPoint[], targetMass: number): number {
  const tolerance = 0.5;
  const peakPoints = points.filter(p =>
    Math.abs(p.mass - targetMass) <= tolerance
  );
  return Math.max(...peakPoints.map(p => p.current), 0);
}

function integratePeak(points: DataPoint[], targetMass: number): number {
  const tolerance = 0.5;
  const peakPoints = points.filter(p =>
    Math.abs(p.mass - targetMass) <= tolerance
  );
  if (peakPoints.length === 0) return 0;

  const sum = peakPoints.reduce((acc, p) => acc + p.current, 0);
  return sum / peakPoints.length;
}

const KNOWN_MASSES: { mass: number; gas: string; fragments?: string[] }[] = [
  { mass: 1, gas: 'H⁺', fragments: ['H₂'] },
  { mass: 2, gas: 'H₂', fragments: [] },
  { mass: 4, gas: 'He', fragments: [] },
  { mass: 12, gas: 'C⁺', fragments: ['CO', 'CO₂', 'Kohlenwasserstoffe'] },
  { mass: 14, gas: 'N⁺', fragments: ['N₂'] },
  { mass: 16, gas: 'O⁺', fragments: ['O₂', 'H₂O', 'CO₂'] },
  { mass: 17, gas: 'OH⁺', fragments: ['H₂O'] },
  { mass: 18, gas: 'H₂O', fragments: [] },
  { mass: 19, gas: 'F⁺/H₃O⁺', fragments: ['Fluorverbindungen', 'H₂O'] },
  { mass: 20, gas: 'Ar²⁺/Ne/HF', fragments: ['Ar', 'Ne', 'HF'] },
  { mass: 28, gas: 'N₂/CO', fragments: [] },
  { mass: 29, gas: 'N₂-Isotop/CHO⁺', fragments: ['N₂', 'Kohlenwasserstoffe'] },
  { mass: 31, gas: 'CF⁺', fragments: ['Fluorverbindungen'] },
  { mass: 32, gas: 'O₂', fragments: [] },
  { mass: 35, gas: '³⁵Cl⁺', fragments: ['Chlorverbindungen'] },
  { mass: 36, gas: 'HCl/³⁶Ar', fragments: ['HCl', 'Ar-Isotop'] },
  { mass: 40, gas: 'Ar', fragments: [] },
  { mass: 44, gas: 'CO₂', fragments: [] },
  { mass: 45, gas: '¹³CO₂/CHO₂⁺', fragments: ['CO₂-Isotop', 'Kohlenwasserstoffe'] },
  { mass: 50, gas: 'CF₂⁺', fragments: ['Fluorverbindungen'] },
  { mass: 69, gas: 'CF₃⁺', fragments: ['Fluorverbindungen', 'Kohlenwasserstoffe'] },
  { mass: 77, gas: 'C₆H₅⁺', fragments: ['Aromaten', 'Kohlenwasserstoffe'] },
];

function detectPeaks(
  rawPoints: DataPoint[],
  normalizedData: NormalizedData[]
): Peak[] {
  const peaks: Peak[] = [];

  for (const known of KNOWN_MASSES) {
    const integrated = integratePeak(rawPoints, known.mass);
    if (integrated > 0) {
      const normalizedPoint = normalizedData.find(p =>
        Math.abs(p.mass - known.mass) < 0.1
      );

      peaks.push({
        mass: known.mass,
        integratedCurrent: integrated,
        normalizedValue: normalizedPoint?.normalizedToH2 || 0,
        gasIdentification: known.gas,
        fragments: known.fragments
      });
    }
  }

  return peaks.sort((a, b) => b.integratedCurrent - a.integratedCurrent);
}
```

### 6.4 Limit-Prüfung

```typescript
// lib/limits.ts

export type SpecificationType = 'GSI' | 'CERN';

export function getGSILimit(mass: number): number {
  if (mass <= 12) return 1.0;
  if (mass > 12 && mass < 19.5) return 0.1;
  if (mass > 27.5 && mass < 28.5) return 0.1;
  if (mass > 43.5 && mass < 44.75) return 0.1;
  if (mass > 45) return 0.001;
  return 0.02;
}

export function getCERNLimit(mass: number): number {
  if (mass <= 3) return 1.0;
  if (mass > 3 && mass < 20.5) return 0.1;
  if (mass > 20.4 && mass < 27.5) return 0.01;
  if (mass > 27.4 && mass < 28.5) return 0.1;
  if (mass > 28.45 && mass < 32.5) return 0.01;
  if (mass > 32.4 && mass < 43.5) return 0.002;
  if (mass > 43.4 && mass < 45.1) return 0.05;
  if (mass > 45) return 0.0001;
  return 1.0;
}

export function checkLimits(normalizedData: NormalizedData[]): LimitCheck[] {
  const checks: LimitCheck[] = [];

  // Check at every 0.5 AMU or at integer masses
  for (let mass = 0; mass <= 100; mass += 0.5) {
    const point = normalizedData.find(p => Math.abs(p.mass - mass) < 0.1);
    if (!point) continue;

    const gsiLimit = getGSILimit(mass);
    const cernLimit = getCERNLimit(mass);

    checks.push({
      mass,
      measuredValue: point.normalizedToH2,
      gsiLimit,
      cernLimit,
      gsiPassed: point.normalizedToH2 <= gsiLimit,
      cernPassed: point.normalizedToH2 <= cernLimit
    });
  }

  return checks;
}

export function generateLimitCurve(
  spec: SpecificationType,
  massRange: [number, number] = [0, 100]
): { mass: number; limit: number }[] {
  const curve: { mass: number; limit: number }[] = [];
  const getLimitFn = spec === 'GSI' ? getGSILimit : getCERNLimit;

  for (let mass = massRange[0]; mass <= massRange[1]; mass += 0.1) {
    curve.push({ mass, limit: getLimitFn(mass) });
  }

  return curve;
}
```

### 6.5 Qualitätsprüfungen

```typescript
// lib/quality.ts

export function performQualityChecks(peaks: Peak[]): QualityCheck[] {
  const getPeak = (mass: number) =>
    peaks.find(p => p.mass === mass)?.integratedCurrent || 0;

  const h2 = getPeak(2);
  const h2o = getPeak(18);
  const n2_co = getPeak(28);
  const o2 = getPeak(32);
  const n_frag = getPeak(14);
  const o_frag = getPeak(16);

  // Kohlenwasserstoffe
  const kw_light = getPeak(39) + getPeak(41) + getPeak(43) + getPeak(45);
  const kw_heavy = getPeak(69) + getPeak(77);
  const total = peaks.reduce((sum, p) => sum + p.integratedCurrent, 0);

  return [
    {
      name: 'H₂/H₂O Verhältnis',
      description: 'Wasserstoff muss mindestens 5× größer als Wasser sein',
      formula: 'H₂ > 5 × H₂O',
      passed: h2 > 5 * h2o,
      measuredValue: h2o > 0 ? h2 / h2o : Infinity,
      threshold: 5
    },
    {
      name: 'N₂/O₂ Verhältnis (Luftleck)',
      description: 'N₂/CO muss mindestens 4× größer als O₂ sein (sonst Luftleck)',
      formula: 'N₂/CO > 4 × O₂',
      passed: n2_co > 4 * o2,
      measuredValue: o2 > 0 ? n2_co / o2 : Infinity,
      threshold: 4
    },
    {
      name: 'Fragment-Konsistenz',
      description: 'N-Fragment sollte kleiner als O-Fragment sein',
      formula: 'Peak(14) < Peak(16)',
      passed: n_frag < o_frag,
      measuredValue: n_frag,
      threshold: o_frag
    },
    {
      name: 'Leichte Kohlenwasserstoffe',
      description: 'Summe der Massen 39, 41-43, 45 unter 0.1% des Gesamtdrucks',
      formula: 'Σ(39,41,43,45) < 0.001 × Gesamt',
      passed: total > 0 ? (kw_light / total) < 0.001 : true,
      measuredValue: total > 0 ? (kw_light / total) * 100 : 0,
      threshold: 0.1  // Prozent
    },
    {
      name: 'Schwere Kohlenwasserstoffe (Öl)',
      description: 'Summe der Massen 69, 77 unter 0.05% des Gesamtdrucks',
      formula: 'Σ(69,77) < 0.0005 × Gesamt',
      passed: total > 0 ? (kw_heavy / total) < 0.0005 : true,
      measuredValue: total > 0 ? (kw_heavy / total) * 100 : 0,
      threshold: 0.05  // Prozent
    }
  ];
}
```

### 6.6 D3.js Spektrum-Chart

```typescript
// charts/spectrum.ts

import * as d3 from 'd3';
import type { NormalizedData, LimitCheck } from '../types/rga';

interface ChartOptions {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  showGSILimit: boolean;
  showCERNLimit: boolean;
  logScale: boolean;
}

export function createSpectrumChart(
  container: HTMLElement,
  data: NormalizedData[],
  limitChecks: LimitCheck[],
  options: ChartOptions
) {
  const { width, height, margin } = options;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Clear previous chart
  d3.select(container).selectAll('*').remove();

  // Create SVG
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Scales
  const xScale = d3.scaleLinear()
    .domain([0, 100])
    .range([0, innerWidth]);

  const yScale = options.logScale
    ? d3.scaleLog()
        .domain([1e-6, 1])
        .range([innerHeight, 0])
        .clamp(true)
    : d3.scaleLinear()
        .domain([0, 1])
        .range([innerHeight, 0]);

  // Grid lines
  g.append('g')
    .attr('class', 'grid')
    .attr('opacity', 0.1)
    .call(d3.axisLeft(yScale)
      .tickSize(-innerWidth)
      .tickFormat(() => '')
    );

  // Axes
  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale).tickValues(d3.range(0, 101, 10)));

  g.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(yScale).ticks(5, '.0e'));

  // Axis labels
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', height - 5)
    .attr('text-anchor', 'middle')
    .attr('class', 'text-sm fill-gray-600')
    .text('Mass [AMU]');

  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', 15)
    .attr('text-anchor', 'middle')
    .attr('class', 'text-sm fill-gray-600')
    .text('Relative Intensity');

  // Limit lines
  if (options.showGSILimit) {
    const gsiLine = d3.line<LimitCheck>()
      .x(d => xScale(d.mass))
      .y(d => yScale(Math.max(d.gsiLimit, 1e-6)))
      .curve(d3.curveStepAfter);

    g.append('path')
      .datum(limitChecks)
      .attr('fill', 'none')
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('d', gsiLine);
  }

  if (options.showCERNLimit) {
    const cernLine = d3.line<LimitCheck>()
      .x(d => xScale(d.mass))
      .y(d => yScale(Math.max(d.cernLimit, 1e-6)))
      .curve(d3.curveStepAfter);

    g.append('path')
      .datum(limitChecks)
      .attr('fill', 'none')
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '2,2')
      .attr('d', cernLine);
  }

  // Spectrum line
  const line = d3.line<NormalizedData>()
    .x(d => xScale(d.mass))
    .y(d => yScale(Math.max(d.normalizedToH2, 1e-6)));

  g.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', '#3b82f6')
    .attr('stroke-width', 1.5)
    .attr('d', line);

  // Peak annotations
  const significantMasses = [2, 14, 16, 17, 18, 28, 32, 40, 44];

  significantMasses.forEach(mass => {
    const point = data.find(d => Math.abs(d.mass - mass) < 0.1);
    if (point && point.normalizedToH2 > 0.01) {
      g.append('text')
        .attr('x', xScale(mass))
        .attr('y', yScale(point.normalizedToH2) - 10)
        .attr('text-anchor', 'middle')
        .attr('class', 'text-xs fill-gray-700 font-medium')
        .text(mass.toString());
    }
  });

  // Legend
  const legend = svg.append('g')
    .attr('transform', `translate(${width - margin.right - 150}, ${margin.top})`);

  const legendItems = [
    { color: '#3b82f6', label: 'Messung', dash: '' },
    { color: '#f59e0b', label: 'GSI Limit', dash: '5,5' },
    { color: '#ef4444', label: 'CERN Limit', dash: '2,2' }
  ];

  legendItems.forEach((item, i) => {
    const y = i * 20;
    legend.append('line')
      .attr('x1', 0)
      .attr('x2', 30)
      .attr('y1', y + 10)
      .attr('y2', y + 10)
      .attr('stroke', item.color)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', item.dash);

    legend.append('text')
      .attr('x', 40)
      .attr('y', y + 14)
      .attr('class', 'text-xs fill-gray-600')
      .text(item.label);
  });

  return svg.node();
}
```

---

## 7. UI/UX Design

### 7.1 Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  RGA Analyser                                        [Theme Toggle] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │                    Drag & Drop .asc File                    │   │
│  │                    or click to browse                       │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌── Metadata ─────────────────────────────────────────────────┐   │
│  │ File: xxx.asc  |  Date: 16.12.2025  |  Pressure: 2.1e-9 mbar│   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Spectrum Chart ───────────────────────────────────────────┐   │
│  │                                                             │   │
│  │    [Log Scale ▼]  [GSI Limit ☑]  [CERN Limit ☑]            │   │
│  │                                                             │   │
│  │         ▲                                                   │   │
│  │     1   │    █                                              │   │
│  │         │    █                                              │   │
│  │   0.1   │----█-------┬---------- GSI Limit                  │   │
│  │         │    █       │                                      │   │
│  │   0.01  │----█-------│----┬----- CERN Limit                 │   │
│  │         │    █  ▄    ▄   ▄│ ▄                               │   │
│  │  0.001  │    █  █    █   █│ █                               │   │
│  │         └────┴──┴────┴───┴┴─┴───────────────────────────►   │   │
│  │             2  14   18  28 32 44              AMU            │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── Peak Table ─────────────┐  ┌── Quality Checks ────────────┐   │
│  │ Mass │ Gas    │ Rel.Int. │  │ ✓ H₂ > 5× H₂O              │   │
│  │──────┼────────┼──────────│  │ ✓ N₂/CO > 4× O₂ (kein Leck)│   │
│  │  2   │ H₂     │ 100%     │  │ ✓ N < O Fragment           │   │
│  │ 18   │ H₂O    │ 0.29%    │  │ ✓ Leichte KW < 0.1%        │   │
│  │ 28   │ N₂/CO  │ 0.17%    │  │ ✓ Schwere KW < 0.05%       │   │
│  │ 44   │ CO₂    │ 0.08%    │  │                            │   │
│  │ ...  │ ...    │ ...      │  │ GSI: ✓ PASSED              │   │
│  └──────┴────────┴──────────┘  │ CERN: ✗ 3 Violations       │   │
│                                └────────────────────────────┘   │
│                                                                     │
│  ┌── AI Interpretation ────────────────────────────────────────┐   │
│  │                                                             │   │
│  │  [Claude ▼]  [Analyze]                                     │   │
│  │                                                             │   │
│  │  Die RGA-Messung zeigt ein typisches Spektrum für eine     │   │
│  │  gut ausgeheizte UHV-Kammer. Der dominante H₂-Peak         │   │
│  │  (100%) zusammen mit dem niedrigen H₂O-Anteil (0.29%)      │   │
│  │  bestätigt erfolgreichen Ausheizprozess...                 │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  [Export PDF]  [Export PNG]  [Export CSV]                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.2 Farbschema

```css
/* Tailwind CSS Custom Theme */
:root {
  /* Primary Colors */
  --color-primary: #3b82f6;     /* Blue - Messdaten */
  --color-secondary: #10b981;   /* Green - Passed */
  --color-warning: #f59e0b;     /* Amber - GSI Limit */
  --color-danger: #ef4444;      /* Red - CERN Limit / Failed */

  /* Background */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f3f4f6;
  --color-bg-chart: #fafafa;

  /* Text */
  --color-text-primary: #1f2937;
  --color-text-secondary: #6b7280;

  /* Gas Colors for Chart */
  --color-h2: #3b82f6;          /* Blue */
  --color-h2o: #06b6d4;         /* Cyan */
  --color-n2: #8b5cf6;          /* Violet */
  --color-o2: #10b981;          /* Green */
  --color-co2: #f59e0b;         /* Amber */
  --color-ar: #ec4899;          /* Pink */
  --color-hydrocarbons: #ef4444; /* Red */
}
```

### 7.3 Responsive Breakpoints

```typescript
// Tailwind breakpoints
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
};

// Chart dimensions by breakpoint
const chartDimensions = {
  sm: { width: 320, height: 240 },
  md: { width: 600, height: 400 },
  lg: { width: 800, height: 450 },
  xl: { width: 1000, height: 500 }
};
```

---

## 8. AI-Integration

### 8.1 API Client

```typescript
// lib/ai-client.ts

import type { AnalysisResult, Peak, QualityCheck } from '../types/rga';

export type AIProvider = 'claude' | 'gemini';

interface AIResponse {
  interpretation: string;
  recommendations: string[];
  riskAssessment: 'low' | 'medium' | 'high';
}

export async function getAIInterpretation(
  provider: AIProvider,
  analysis: AnalysisResult,
  apiKey: string
): Promise<AIResponse> {
  const prompt = buildPrompt(analysis);

  if (provider === 'claude') {
    return callClaudeAPI(prompt, apiKey);
  } else {
    return callGeminiAPI(prompt, apiKey);
  }
}

function buildPrompt(analysis: AnalysisResult): string {
  const peakSummary = analysis.peaks
    .slice(0, 10)
    .map(p => `- ${p.mass} AMU (${p.gasIdentification}): ${(p.normalizedValue * 100).toFixed(3)}%`)
    .join('\n');

  const qualitySummary = analysis.qualityChecks
    .map(q => `- ${q.name}: ${q.passed ? 'PASS' : 'FAIL'} (${q.measuredValue.toFixed(3)} vs. ${q.threshold})`)
    .join('\n');

  const gsiViolations = analysis.limitChecks.filter(l => !l.gsiPassed).length;
  const cernViolations = analysis.limitChecks.filter(l => !l.cernPassed).length;

  return `
Du bist ein Experte für Vakuumtechnik und Restgasanalyse (RGA). Analysiere die folgenden RGA-Messergebnisse und gib eine fachliche Interpretation.

## Messparameter
- Datei: ${analysis.metadata.sourceFile}
- Messzeitpunkt: ${analysis.metadata.startTime?.toLocaleString('de-DE')}
- Messbereich: ${analysis.metadata.firstMass} - ${analysis.metadata.firstMass + analysis.metadata.scanWidth} AMU

## Detektierte Peaks (Top 10, normalisiert auf H₂)
${peakSummary}

## Qualitätsprüfungen
${qualitySummary}

## Spezifikations-Compliance
- GSI Spec 7.3e: ${gsiViolations === 0 ? 'BESTANDEN' : `${gsiViolations} Verletzungen`}
- CERN Spec 3076004: ${cernViolations === 0 ? 'BESTANDEN' : `${cernViolations} Verletzungen`}

## Dominante Gase
${analysis.dominantGases.map(g => `- ${g.gas}: ${g.percentage.toFixed(2)}%`).join('\n')}

Bitte gib:
1. Eine Zusammenfassung des Vakuumzustands (2-3 Sätze)
2. Interpretation der Hauptkontaminanten und ihrer Quellen
3. Bewertung ob die Kammer für UHV-Anwendungen geeignet ist
4. Konkrete Empfehlungen zur Verbesserung (falls nötig)
5. Risikobewertung (niedrig/mittel/hoch)

Antworte auf Deutsch und verwende Fachterminologie.
`.trim();
}

async function callClaudeAPI(prompt: string, apiKey: string): Promise<AIResponse> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
  });

  const data = await response.json();
  return parseAIResponse(data.content[0].text);
}

async function callGeminiAPI(prompt: string, apiKey: string): Promise<AIResponse> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    }
  );

  const data = await response.json();
  return parseAIResponse(data.candidates[0].content.parts[0].text);
}

function parseAIResponse(text: string): AIResponse {
  // Simple parsing - in production, use structured output
  const lines = text.split('\n');

  // Extract risk assessment
  let riskAssessment: 'low' | 'medium' | 'high' = 'medium';
  if (text.toLowerCase().includes('niedrig') || text.toLowerCase().includes('low')) {
    riskAssessment = 'low';
  } else if (text.toLowerCase().includes('hoch') || text.toLowerCase().includes('high')) {
    riskAssessment = 'high';
  }

  // Extract recommendations (lines starting with - or •)
  const recommendations = lines
    .filter(l => l.trim().startsWith('-') || l.trim().startsWith('•'))
    .slice(-5)
    .map(l => l.replace(/^[-•]\s*/, '').trim());

  return {
    interpretation: text,
    recommendations,
    riskAssessment
  };
}
```

### 8.2 Beispiel-Prompts für verschiedene Szenarien

**Szenario 1: Gutes Vakuum nach Ausheizen**
```
Die RGA-Messung zeigt ein typisches Spektrum für eine erfolgreich ausgeheizte
UHV-Kammer. Der dominante H₂-Peak (100%) zusammen mit dem niedrigen H₂O-Anteil
(0.29%) bestätigt einen erfolgreichen Ausheizprozess. Das Verhältnis H₂/H₂O > 5
ist erfüllt.

Die N₂/CO-Komponente bei 28 AMU ist wahrscheinlich hauptsächlich CO (Ausgasung
von Edelstahl), da der begleitende CO₂-Peak bei 44 AMU dies unterstützt. Das
Fehlen eines signifikanten O₂-Peaks bei 32 AMU schließt ein Luftleck aus.

Empfehlungen:
- System erfüllt UHV-Anforderungen
- Weiteres Ausheizen könnte H₂O weiter reduzieren
- Regelmäßige Überwachung der Kohlenwasserstoff-Peaks empfohlen

Risiko: Niedrig
```

**Szenario 2: Luftleck detektiert**
```
WARNUNG: Die Messung deutet auf ein Luftleck hin!

Indizien:
- Verhältnis N₂/O₂ ≈ 4:1 entspricht atmosphärischer Luft
- Peak bei 32 AMU (O₂) ungewöhnlich hoch
- Qualitätskriterium "N₂/CO > 4× O₂" NICHT erfüllt

Sofortmaßnahmen erforderlich:
1. Lecksuche mit He-Lecksuchgerät durchführen
2. Alle Flanschverbindungen prüfen
3. Ventile und Durchführungen kontrollieren

Risiko: Hoch
```

---

## 9. Quellen und Referenzen

### 9.1 Pfeiffer Vacuum Dokumentation
- [Massenspektrometer und Restgasanalyse - Grundlagen](https://www.pfeiffer-vacuum.com/de/know-how/massenspektrometer-und-restgasanalyse/einleitung-funktionsprinzip/)
- [Restgasanalysesysteme (RGA)](https://www.pfeiffer-vacuum.com/de/de/products/analytical-instrumentation/residual-gas-analysis-systems/)

### 9.2 Technische Referenzen
- [Kurt J. Lesker - RGA Spektren Interpretation](https://www.lesker.com/newweb/technical_info/vacuumtech/rga_03_simpleinterpret.cfm)
- [CERN RGA Tutorial - Interpretation](https://indico.cern.ch/event/565314/contributions/2285748/)
- [Stanford Research Systems - RGA Basics](https://www.thinksrs.com/downloads/pdfs/applicationnotes/Residual%20Gas%20Analysis%20Basics.pdf)
- [Hiden Analytical - Cracking Patterns](https://www.hidenanalytical.com/tech-data/cracking-patterns/)

### 9.3 Spezifikationen
- GSI Spec 7.3e (2019) - Vakuumqualität für Beschleunigeranlagen
- CERN Spec 3076004 (2024) - UHV-Anforderungen

### 9.4 Software/Tools
- [D3.js Documentation](https://d3js.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Claude API](https://docs.anthropic.com/)
- [Gemini API](https://ai.google.dev/docs)

---

## Appendix A: Vollständige Limit-Tabellen

### GSI Spec 7.3e (2019)

| Massenbereich [AMU] | Limit (rel. zu H₂) | Bedeutung |
|---------------------|-------------------|-----------|
| 0 - 12 | 1.0 | H₂, He, C erlaubt |
| 12 - 19.5 | 0.1 | H₂O-Region |
| 19.5 - 27.5 | 0.02 | Zwischen H₂O und N₂ |
| 27.5 - 28.5 | 0.1 | N₂/CO erlaubt |
| 28.5 - 43.5 | 0.02 | Kohlenwasserstoff-Region |
| 43.5 - 44.75 | 0.1 | CO₂ erlaubt |
| > 45 | 0.001 | Schwere Kontaminanten |

### CERN Spec 3076004 (2024)

| Massenbereich [AMU] | Limit (rel. zu H₂) | Bedeutung |
|---------------------|-------------------|-----------|
| 0 - 3 | 1.0 | H₂ Region |
| 3 - 20.5 | 0.1 | H₂O erlaubt |
| 20.5 - 27.5 | 0.01 | Strenge Kontrolle |
| 27.5 - 28.5 | 0.1 | N₂/CO erlaubt |
| 28.5 - 32.5 | 0.01 | Strenge Kontrolle |
| 32.5 - 43.5 | 0.002 | Kohlenwasserstoffe minimal |
| 43.5 - 45.1 | 0.05 | CO₂ begrenzt erlaubt |
| > 45 | 0.0001 | Sehr streng |

---

## Appendix B: Gas-Identifikationstabelle

| AMU | Primäres Gas | Sekundäre Zuordnung | Fragmentquelle |
|-----|--------------|---------------------|----------------|
| 1 | H⁺ | - | H₂ |
| 2 | H₂ | D | - |
| 3 | HD | - | - |
| 4 | He | D₂ | - |
| 12 | C⁺ | - | CO, CO₂, CH₄ |
| 13 | CH⁺ | - | CH₄ |
| 14 | N⁺, CH₂⁺ | - | N₂, CH₄ |
| 15 | CH₃⁺ | - | CH₄ |
| 16 | O⁺, CH₄ | - | O₂, H₂O, CO₂ |
| 17 | OH⁺ | - | H₂O |
| 18 | H₂O | - | - |
| 19 | H₃O⁺, F⁺ | - | H₂O, Fluorverb. |
| 20 | Ar²⁺, Ne, HF | - | Ar, Ne |
| 22 | Ne, CO₂²⁺ | - | Ne, CO₂ |
| 28 | N₂, CO | C₂H₄ | - |
| 29 | ¹⁵N¹⁴N, CHO⁺ | - | N₂, Aldehyde |
| 30 | NO | - | - |
| 31 | CF⁺ | - | Fluorverb. |
| 32 | O₂ | S | - |
| 34 | H₂S | - | - |
| 35 | ³⁵Cl | - | Chlorverb. |
| 36 | HCl, ³⁶Ar | - | HCl, Ar |
| 38 | ³⁸Ar | - | Ar |
| 40 | Ar | - | - |
| 44 | CO₂ | C₃H₈ | - |
| 45 | ¹³CO₂ | - | CO₂ |
| 46 | NO₂ | - | - |
| 50 | CF₂⁺ | - | Fluorverb. |
| 69 | CF₃⁺ | - | PTFE, Fluorverb. |
| 77 | C₆H₅⁺ | - | Aromaten |

---

*Erstellt: Januar 2025*
*Version: 1.0*
