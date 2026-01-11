# Plan: CSV Reference Loader (1.10.1)

## Feature-Zusammenfassung / Feature Overview

**Deutsch:**
Lädt eine zweite CSV-Datei als "Golden Run" Referenz und überlagert sie als Schatten unter dem aktuellen Spektrum. Ermöglicht sofortigen Vergleich: "Wo weicht meine Messung vom Soll ab?"

**English:**
Loads a second CSV file as a "Golden Run" reference and overlays it as a shadow under the current spectrum. Enables instant comparison: "Where does my measurement deviate from the reference?"

---

## Kontext / Context

**Aktueller Stand / Current State:**
- RGA-App kann nur EINE Messung anzeigen
- Rate-of-Rise (RoR) Modul kann ebenfalls nur EINE Messung laden
- Kein Mechanismus zum Vergleich mit Referenzdaten

**Problem / Problem:**
- Ingenieure haben oft "bekannt-gute" Messungen (Golden Runs)
- Manuelle Vergleiche erfordern Excel/externes Tool
- Abweichungen sind visuell schwer zu erkennen ohne Overlay

**Anwendungsfaelle / Use Cases:**
1. **Halbleiter-QA (Semiconductor QA):**
   - Vergleich aktueller Kammermessung mit Post-Reinigung Baseline
   - MKS + Inficon verwenden dies standardmaessig

2. **UHV-Beschleuniger (UHV Accelerators):**
   - Vergleich mit "frisch gebackener" Kammer (post-bakeout)
   - Erkennung von Kontamination nach Wartungsarbeiten

3. **Prozess-Monitoring:**
   - Vergleich von Schicht-zu-Schicht Messungen
   - Erkennung von Drift oder Degradation

---

## Technischer Ansatz / Technical Approach

### 1. Datenstruktur / Data Structure

```typescript
// src/types/reference.ts (NEU / NEW)

/**
 * Reference spectrum data for overlay comparison
 */
export interface ReferenceSpectrum {
  /** Original filename */
  filename: string

  /** Load timestamp */
  loadedAt: Date

  /** Synchronized data points (aligned to current spectrum's x-axis) */
  points: Map<number, number>  // mass -> current

  /** Original raw points (for re-synchronization) */
  rawPoints: Array<{ mass: number; current: number }>

  /** Metadata from source file */
  metadata: {
    sourceFile?: string
    startTime?: Date | null
    totalPressure?: number  // Sum of all currents
  }

  /** User-defined label */
  label?: string
}

/**
 * Reference spectrum for RoR time-series overlay
 */
export interface ReferenceTimeSeries {
  /** Original filename */
  filename: string

  /** Load timestamp */
  loadedAt: Date

  /** Synchronized data points (aligned to current spectrum's time axis) */
  points: Array<{ relativeTimeS: number; pressure1: number }>

  /** Original raw points (for re-synchronization) */
  rawPoints: Array<{ relativeTimeS: number; pressure1: number }>

  /** Metadata from source file */
  metadata: {
    device?: string
    recordingStart?: Date
    duration: number
  }

  /** User-defined label */
  label?: string
}
```

### 2. X-Achsen-Synchronisation / X-Axis Synchronization

**RGA Spektrum (Masse-basiert):**
```typescript
// src/lib/reference/synchronize.ts

/**
 * Synchronize reference spectrum to current spectrum's mass range
 * Uses linear interpolation for mass points not in reference
 */
export function synchronizeSpectrum(
  reference: Array<{ mass: number; current: number }>,
  targetMasses: number[]
): Map<number, number> {
  const result = new Map<number, number>()

  // Sort reference by mass
  const sorted = [...reference].sort((a, b) => a.mass - b.mass)

  for (const targetMass of targetMasses) {
    // Find bracketing points in reference
    const lower = sorted.filter(p => p.mass <= targetMass).pop()
    const upper = sorted.find(p => p.mass > targetMass)

    if (!lower && !upper) {
      // No reference data available
      result.set(targetMass, 0)
    } else if (!lower) {
      // Extrapolate from first point (use first value)
      result.set(targetMass, upper!.current)
    } else if (!upper) {
      // Extrapolate from last point (use last value)
      result.set(targetMass, lower.current)
    } else if (lower.mass === targetMass) {
      // Exact match
      result.set(targetMass, lower.current)
    } else {
      // Linear interpolation
      const t = (targetMass - lower.mass) / (upper.mass - lower.mass)
      const interpolated = lower.current + t * (upper.current - lower.current)
      result.set(targetMass, interpolated)
    }
  }

  return result
}
```

**RoR Zeitreihe (Zeit-basiert):**
```typescript
/**
 * Synchronize reference time series to current time axis
 * Uses linear interpolation for time points not in reference
 */
export function synchronizeTimeSeries(
  reference: Array<{ relativeTimeS: number; pressure1: number }>,
  targetTimes: number[]
): Array<{ relativeTimeS: number; pressure1: number }> {
  const result: Array<{ relativeTimeS: number; pressure1: number }> = []

  // Sort reference by time
  const sorted = [...reference].sort((a, b) => a.relativeTimeS - b.relativeTimeS)

  for (const targetTime of targetTimes) {
    // Binary search for bracketing points
    const lowerIdx = findLowerBound(sorted, targetTime)
    const lower = sorted[lowerIdx]
    const upper = sorted[lowerIdx + 1]

    if (!lower) {
      result.push({ relativeTimeS: targetTime, pressure1: sorted[0]?.pressure1 || 0 })
    } else if (!upper) {
      result.push({ relativeTimeS: targetTime, pressure1: lower.pressure1 })
    } else {
      // Linear interpolation
      const t = (targetTime - lower.relativeTimeS) / (upper.relativeTimeS - lower.relativeTimeS)
      const interpolated = lower.pressure1 + t * (upper.pressure1 - lower.pressure1)
      result.push({ relativeTimeS: targetTime, pressure1: interpolated })
    }
  }

  return result
}

function findLowerBound(
  arr: Array<{ relativeTimeS: number }>,
  target: number
): number {
  let low = 0
  let high = arr.length - 1

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    if (arr[mid].relativeTimeS <= target) {
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  return high
}
```

### 3. Store-Erweiterung / Store Extension

```typescript
// Erweiterung von useAppStore.ts

interface ReferenceState {
  // RGA Spectrum Reference
  referenceSpectrum: ReferenceSpectrum | null

  // Reference visibility
  showReference: boolean
  referenceOpacity: number  // 0.0 - 1.0

  // Actions
  loadReferenceSpectrum: (file: File) => Promise<void>
  clearReferenceSpectrum: () => void
  setShowReference: (show: boolean) => void
  setReferenceOpacity: (opacity: number) => void
}

// Erweiterung von useRateOfRiseStore.ts

interface RoRReferenceState {
  // RoR Time-Series Reference
  referenceTimeSeries: ReferenceTimeSeries | null

  // Reference visibility
  showReference: boolean
  referenceOpacity: number  // 0.0 - 1.0

  // Actions
  loadReferenceTimeSeries: (file: File) => Promise<void>
  clearReferenceTimeSeries: () => void
  setShowReference: (show: boolean) => void
  setReferenceOpacity: (opacity: number) => void
}
```

### 4. Shadow-Plot Rendering

**RGA Spektrum Chart (SpectrumChart/index.tsx):**
```typescript
// Innerhalb der Recharts-Konfiguration:

{referenceSpectrum && showReference && (
  <Area
    type="monotone"
    dataKey="referenceValue"
    name="Reference"
    fill="var(--color-text-muted)"
    fillOpacity={referenceOpacity * 0.3}
    stroke="var(--color-text-muted)"
    strokeOpacity={referenceOpacity * 0.6}
    strokeDasharray="4 2"
    isAnimationActive={false}
  />
)}
```

**RoR Chart (D3.js basiert):**
```typescript
// Nach der Hauptdatenlinie:

if (referenceTimeSeries && showReference) {
  const referenceLine = d3
    .line<{ relativeTimeS: number; pressure1: number }>()
    .x((d) => xScale(d.relativeTimeS))
    .y((d) => yScale(d.pressure1))
    .defined((d) => d.pressure1 > 0 && isFinite(yScale(d.pressure1)))

  // Shadow area under reference
  const referenceArea = d3
    .area<{ relativeTimeS: number; pressure1: number }>()
    .x((d) => xScale(d.relativeTimeS))
    .y0(innerHeight)
    .y1((d) => yScale(d.pressure1))
    .defined((d) => d.pressure1 > 0 && isFinite(yScale(d.pressure1)))

  g.append('path')
    .datum(referenceTimeSeries.points)
    .attr('fill', 'var(--color-text-muted)')
    .attr('fill-opacity', referenceOpacity * 0.15)
    .attr('d', referenceArea)

  g.append('path')
    .datum(referenceTimeSeries.points)
    .attr('fill', 'none')
    .attr('stroke', 'var(--color-text-muted)')
    .attr('stroke-width', 1.5)
    .attr('stroke-dasharray', '6,3')
    .attr('stroke-opacity', referenceOpacity * 0.7)
    .attr('d', referenceLine)
}
```

---

## Implementierungs-Schritte / Implementation Steps

### Phase 1: Core Library (2h)

| # | Aufgabe / Task | Datei / File | Zeilen / Lines |
|---|----------------|--------------|----------------|
| 1.1 | Reference Types definieren | `src/types/reference.ts` | ~50 |
| 1.2 | Synchronization-Funktionen | `src/lib/reference/synchronize.ts` | ~100 |
| 1.3 | Reference-Parser (reuse existing parsers) | `src/lib/reference/parser.ts` | ~40 |
| 1.4 | Unit Tests | `src/lib/reference/__tests__/synchronize.test.ts` | ~80 |

### Phase 2: Store Extension (1h)

| # | Aufgabe / Task | Datei / File | Zeilen / Lines |
|---|----------------|--------------|----------------|
| 2.1 | useAppStore Reference-State | `src/store/useAppStore.ts` | +30 |
| 2.2 | useRateOfRiseStore Reference-State | `src/store/useRateOfRiseStore.ts` | +30 |

### Phase 3: UI Components (2-3h)

| # | Aufgabe / Task | Datei / File | Zeilen / Lines |
|---|----------------|--------------|----------------|
| 3.1 | ReferenceUploadButton | `src/components/Reference/ReferenceUploadButton.tsx` | ~80 |
| 3.2 | ReferenceControls (Opacity Slider) | `src/components/Reference/ReferenceControls.tsx` | ~60 |
| 3.3 | ReferenceInfoCard | `src/components/Reference/ReferenceInfoCard.tsx` | ~50 |
| 3.4 | SpectrumChart Reference-Overlay | `src/components/SpectrumChart/index.tsx` | +40 |
| 3.5 | RoRChart Reference-Overlay | `src/components/RateOfRise/RoRChart.tsx` | +50 |

### Phase 4: Integration (1h)

| # | Aufgabe / Task | Datei / File |
|---|----------------|--------------|
| 4.1 | ActionsSidebar: Reference-Button | `src/components/ActionsSidebar/index.tsx` |
| 4.2 | RoR Panel: Reference-Controls | `src/components/RateOfRise/index.tsx` |
| 4.3 | Keyboard Shortcut (Cmd+Shift+O) | `src/App.tsx` |

---

## Integration Points / Integrationspunkte

### Wiederverwendung / Reuse

| Komponente | Quelle | Wiederverwendung |
|------------|--------|------------------|
| CSV Parser | `src/lib/parser/index.ts` | parseASCFile() direkt |
| RoR Parser | `src/lib/rateOfRise/parser.ts` | parseTPG362CSV() direkt |
| File Upload | `src/components/FileManager/index.tsx` | Pattern uebernehmen |
| D3 Chart | `src/components/RateOfRise/RoRChart.tsx` | Erweiterung |

### Keine Aenderungen noetig an / No changes needed to:

- Bestehende Parser-Logik
- Export-Funktionen
- Firebase/Cloud-Speicherung (Referenzen werden nicht gespeichert)
- AI-Analyse (Referenzen werden ignoriert)

---

## Test-Szenarien / Test Scenarios

### TC1: RGA Spektrum Referenz

```typescript
describe('RGA Spectrum Reference', () => {
  it('loads reference CSV and synchronizes to current spectrum', async () => {
    // 1. Load main spectrum (m/z 1-100)
    // 2. Load reference spectrum (m/z 1-50, different resolution)
    // 3. Verify synchronization interpolates missing masses
    // 4. Verify overlay renders with correct opacity
  })

  it('handles reference with different mass range', async () => {
    // Reference: m/z 10-80, Current: m/z 1-100
    // Verify: masses outside reference range show 0 or extrapolated
  })
})
```

### TC2: RoR Zeitreihen Referenz

```typescript
describe('RoR Time-Series Reference', () => {
  it('loads reference CSV and synchronizes to current time axis', async () => {
    // 1. Load main measurement (600s, 10s interval)
    // 2. Load reference (300s, 5s interval)
    // 3. Verify time synchronization
  })

  it('handles reference with different duration', async () => {
    // Reference: 300s, Current: 600s
    // Verify: times beyond reference show last value
  })
})
```

### TC3: UI Interaktion

```typescript
describe('Reference UI', () => {
  it('opacity slider updates shadow intensity', () => {
    // Move slider from 0.3 to 0.8
    // Verify stroke-opacity and fill-opacity update
  })

  it('clear button removes reference', () => {
    // Click clear
    // Verify referenceSpectrum === null
    // Verify shadow disappears from chart
  })
})
```

---

## UI/UX Design

### Reference Upload Button

```
┌─────────────────────────────────────────┐
│  📥 Reference / Referenz                │
│  ─────────────────────────────────────  │
│  [📁 Golden Run laden...]               │
│                                         │
│  ℹ️ Laedt eine bekannt-gute Messung     │
│     als Vergleichs-Schatten             │
└─────────────────────────────────────────┘
```

### Reference Controls (nach dem Laden)

```
┌─────────────────────────────────────────┐
│  📊 Referenz: chamber_clean.asc         │
│  ─────────────────────────────────────  │
│                                         │
│  Sichtbarkeit: [====●=====] 50%         │
│                                         │
│  [👁 Anzeigen]  [❌ Entfernen]           │
└─────────────────────────────────────────┘
```

### Chart Legend (erweitert)

```
━━━━ Aktuelle Messung
╌╌╌╌ Referenz (Golden Run)
```

---

## Geschaetzter Aufwand / Estimated Effort

| Phase | Aufwand | Kumulativ |
|-------|---------|-----------|
| Phase 1: Core Library | 2h | 2h |
| Phase 2: Store Extension | 1h | 3h |
| Phase 3: UI Components | 2-3h | 5-6h |
| Phase 4: Integration | 1h | 6-7h |
| Testing & Polish | 1h | 7-8h |

**Gesamt / Total:** 4-6h (FEATURE_BACKLOG: 4-6h)

---

## Abgrenzung / Scope Boundaries

### IN Scope (1.10.1):

- CSV-Datei laden
- X-Achsen-Synchronisation
- Shadow-Plot Rendering
- Opacity-Control
- RGA + RoR Support

### OUT of Scope (Feature 1.10.2):

- Deviation Highlighting (Farb-Markierung bei |delta| > threshold)
- Automatische Threshold-Berechnung
- Export der Differenz-Werte

---

## Wissenschaftliche Validierung / Scientific Validation

**Status:** - (Nicht erforderlich / Not required)

Dieses Feature ist eine reine Visualisierungs-Funktionalitaet ohne wissenschaftliche Formeln oder Berechnungen. Die Synchronisation verwendet Standard-Interpolation.

**Kommerzielle Validierung / Commercial Validation:**
- MKS Instruments: Reference comparison in Process Sense software
- Inficon: "Golden Recipe" comparison in semiconductor tools
- Pfeiffer: Trend comparison in PV MassSpec software

---

## Risiken / Risks

| Risiko | Wahrscheinlichkeit | Mitigation |
|--------|-------------------|------------|
| Grosse Dateien langsam | Niedrig | Web Worker bei >10k Punkten |
| Interpolations-Artefakte | Niedrig | Warnung bei >10% Interpolation |
| Verwirrende UX bei unterschiedlichen Einheiten | Mittel | Einheiten-Check beim Laden |

---

## Changelog

| Datum | Status | Notiz |
|-------|--------|-------|
| 2026-01-10 | 🎯 Implementation-Ready | Initiale Planung erstellt |

---

**Erstellt / Created:** 2026-01-10 | **Autor / Author:** Claude Code | **Feature-ID:** 1.10.1
