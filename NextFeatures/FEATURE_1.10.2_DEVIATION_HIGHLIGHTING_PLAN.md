# Plan: Deviation Highlighting (1.10.2)

## Feature-Ubersicht / Feature Overview

**DE:** Farbliche Hervorhebung von Abweichungen zwischen aktueller Messung und Golden Run Referenz.

**EN:** Color-coded highlighting of deviations between current measurement and Golden Run reference.

---

## Ausgangslage / Current State

**DE:**
- Feature 1.10.1 (CSV Reference Loader) ladt Referenz-Daten
- Rate-of-Rise Charts nutzen D3.js mit Phasen-Highlighting (Baseline: grun, Anstieg: orange)
- `src/lib/comparison/index.ts` hat bereits Vergleichs-Logik (Peaks: improved/worsened/unchanged)
- Keine visuelle Abweichungs-Hervorhebung im Zeitreihen-Chart

**EN:**
- Feature 1.10.1 (CSV Reference Loader) loads reference data
- Rate-of-Rise charts use D3.js with phase highlighting (baseline: green, rise: orange)
- `src/lib/comparison/index.ts` already has comparison logic (peaks: improved/worsened/unchanged)
- No visual deviation highlighting in time-series chart

---

## Wissenschaftliche Validierung / Scientific Validation

**Status:** - (Nicht wissenschaftlich / Not scientific)

Dieses Feature ist ein UI/UX Feature und benotigt keine wissenschaftliche Validierung.

**Commercial Validation:**
- MKS Instruments und Inficon nutzen ahnliche Deviation Highlighting fur Halbleiter-QA
- Standardpraxis in Prozessuberwachung und SPC (Statistical Process Control)

---

## Technischer Ansatz / Technical Approach

### 1. Delta-Berechnung / Delta Calculation

Die Abweichung zwischen aktueller Messung und Referenz wird pro Zeitpunkt berechnet:

```typescript
interface DeviationPoint {
  time: number              // Relative time in seconds
  currentValue: number      // Current measurement pressure
  referenceValue: number    // Reference (Golden Run) pressure
  delta: number             // currentValue - referenceValue
  deltaPercent: number      // (delta / referenceValue) * 100
  deviationClass: DeviationClass
}

type DeviationClass = 'within_tolerance' | 'slight_deviation' | 'significant_deviation'
```

**Logik:**
```typescript
function classifyDeviation(
  deltaPercent: number,
  thresholds: DeviationThresholds
): DeviationClass {
  const absDelta = Math.abs(deltaPercent)

  if (absDelta <= thresholds.tolerance) {
    return 'within_tolerance'      // Grun / Green
  } else if (absDelta <= thresholds.warning) {
    return 'slight_deviation'      // Gelb / Yellow
  } else {
    return 'significant_deviation' // Rot / Red
  }
}
```

### 2. Threshold-Konfiguration / Threshold Configuration

Benutzer konnen Schwellenwerte anpassen:

```typescript
interface DeviationThresholds {
  tolerance: number   // Default: 5%  - Innerhalb Toleranz (grun)
  warning: number     // Default: 15% - Leichte Abweichung (gelb)
  // > warning = Signifikante Abweichung (rot)
}

const DEFAULT_THRESHOLDS: DeviationThresholds = {
  tolerance: 5,   // ±5% = OK
  warning: 15     // ±15% = Warning, >15% = Critical
}
```

**UI fur Threshold-Anpassung:**
- Slider oder Eingabefelder fur Tolerance (1-20%) und Warning (5-50%)
- Preset-Buttons: "Streng" (3%/10%), "Standard" (5%/15%), "Locker" (10%/25%)

### 3. Farbschema / Color Scheme

| Status | Tailwind Class | CSS Variable | Beschreibung |
|--------|----------------|--------------|--------------|
| Within Tolerance | `text-state-success` | `--color-state-success` | Grun - alles OK |
| Slight Deviation | `text-state-warning` | `--color-state-warning` | Gelb/Orange - Aufmerksamkeit |
| Significant Deviation | `text-state-danger` | `--color-state-danger` | Rot - Aktion erforderlich |

**Farbwerte (aus existing codebase):**
- Success: `rgba(0, 224, 151, ...)` (Cyan-Grun)
- Warning: `rgba(224, 80, 0, ...)` (Orange)
- Danger: `rgba(224, 0, 0, ...)` (Rot)

### 4. Visualisierungs-Optionen / Visualization Options

#### Option A: Area Fill (Empfohlen / Recommended)

Flache zwischen Current und Reference wird eingefurbt:

```typescript
// D3.js Area zwischen zwei Linien
const deviationArea = d3.area<DeviationPoint>()
  .x(d => xScale(d.time))
  .y0(d => yScale(d.referenceValue))
  .y1(d => yScale(d.currentValue))
  .curve(d3.curveMonotoneX)

// Farbe basierend auf Deviation Class
g.selectAll('.deviation-segment')
  .data(deviationSegments)
  .enter()
  .append('path')
  .attr('d', d => deviationArea(d.points))
  .attr('fill', d => getDeviationColor(d.deviationClass))
  .attr('opacity', 0.3)
```

#### Option B: Background Bands

Horizontale Bander fur Toleranzzonen:

```typescript
// Tolerance band around reference
const toleranceBandY0 = (d: DeviationPoint) =>
  yScale(d.referenceValue * (1 - thresholds.tolerance / 100))
const toleranceBandY1 = (d: DeviationPoint) =>
  yScale(d.referenceValue * (1 + thresholds.tolerance / 100))
```

#### Option C: Point Markers

Punkte auf der aktuellen Linie einfurben:

```typescript
g.selectAll('.data-point')
  .data(deviationPoints)
  .enter()
  .append('circle')
  .attr('fill', d => getDeviationColor(d.deviationClass))
  .attr('r', d => d.deviationClass === 'significant_deviation' ? 5 : 3)
```

**Empfehlung:** Option A (Area Fill) mit optionalen Tolerance Bands (Option B)

---

## Dateien zu andern / Files to Modify

| Datei | Anderung | Zeilen |
|-------|----------|--------|
| `src/lib/comparison/deviationHighlight.ts` | **NEU:** Deviation-Berechnung und Klassifikation | ~100 |
| `src/types/comparison.ts` | **NEU:** TypeScript Interfaces fur Deviation | ~30 |
| `src/components/RateOfRise/RoRChart.tsx` | Integration des Deviation Highlighting | ~80 |
| `src/components/RateOfRise/DeviationControls.tsx` | **NEU:** UI fur Threshold-Slider | ~60 |
| `src/store/useGoldenRunStore.ts` | Store fur Reference Data + Thresholds (aus 1.10.1) | ~20 |

---

## Implementierungs-Schritte / Implementation Steps

### Schritt 1: Types definieren (30min)

**Datei:** `src/types/comparison.ts`

```typescript
// ============================================
// Deviation Highlighting Types
// ============================================

export type DeviationClass =
  | 'within_tolerance'      // |delta| <= tolerance
  | 'slight_deviation'      // tolerance < |delta| <= warning
  | 'significant_deviation' // |delta| > warning

export interface DeviationThresholds {
  /** Tolerance threshold in % (default: 5) */
  tolerance: number
  /** Warning threshold in % (default: 15) */
  warning: number
}

export interface DeviationPoint {
  /** Relative time in seconds */
  time: number
  /** Current measurement value (pressure) */
  currentValue: number
  /** Reference (Golden Run) value */
  referenceValue: number
  /** Absolute delta: current - reference */
  delta: number
  /** Percentage delta: (delta / reference) * 100 */
  deltaPercent: number
  /** Classification based on thresholds */
  deviationClass: DeviationClass
}

export interface DeviationSegment {
  /** Start time of this segment */
  startTime: number
  /** End time of this segment */
  endTime: number
  /** All points in this segment (same class) */
  points: DeviationPoint[]
  /** Deviation class for this segment */
  deviationClass: DeviationClass
}

export interface DeviationAnalysis {
  /** All calculated deviation points */
  points: DeviationPoint[]
  /** Grouped segments by deviation class */
  segments: DeviationSegment[]
  /** Summary statistics */
  summary: DeviationSummary
  /** Applied thresholds */
  thresholds: DeviationThresholds
}

export interface DeviationSummary {
  /** Number of points within tolerance */
  withinToleranceCount: number
  /** Number of points with slight deviation */
  slightDeviationCount: number
  /** Number of points with significant deviation */
  significantDeviationCount: number
  /** Percentage within tolerance */
  withinTolerancePercent: number
  /** Maximum deviation observed (%) */
  maxDeviation: number
  /** Average deviation (%) */
  avgDeviation: number
  /** Overall status based on significant deviations */
  overallStatus: 'ok' | 'warning' | 'critical'
}

export const DEFAULT_DEVIATION_THRESHOLDS: DeviationThresholds = {
  tolerance: 5,
  warning: 15
}

export const THRESHOLD_PRESETS: Record<string, DeviationThresholds> = {
  strict: { tolerance: 3, warning: 10 },
  standard: { tolerance: 5, warning: 15 },
  relaxed: { tolerance: 10, warning: 25 }
}
```

### Schritt 2: Deviation-Berechnung (45min)

**Datei:** `src/lib/comparison/deviationHighlight.ts`

```typescript
import type {
  DeviationPoint,
  DeviationClass,
  DeviationThresholds,
  DeviationSegment,
  DeviationAnalysis,
  DeviationSummary,
  DEFAULT_DEVIATION_THRESHOLDS
} from '@/types/comparison'
import type { PressureDataPoint } from '@/types/rateOfRise'

/**
 * Klassifiziert eine prozentuale Abweichung
 * Classifies a percentage deviation
 */
export function classifyDeviation(
  deltaPercent: number,
  thresholds: DeviationThresholds = DEFAULT_DEVIATION_THRESHOLDS
): DeviationClass {
  const absDelta = Math.abs(deltaPercent)

  if (absDelta <= thresholds.tolerance) {
    return 'within_tolerance'
  } else if (absDelta <= thresholds.warning) {
    return 'slight_deviation'
  } else {
    return 'significant_deviation'
  }
}

/**
 * Berechnet Abweichungen zwischen aktuellen und Referenz-Daten
 * Calculates deviations between current and reference data
 */
export function calculateDeviations(
  currentData: PressureDataPoint[],
  referenceData: PressureDataPoint[],
  thresholds: DeviationThresholds = DEFAULT_DEVIATION_THRESHOLDS
): DeviationPoint[] {
  const deviationPoints: DeviationPoint[] = []

  // Interpolation Map fur Reference Data
  const refMap = new Map<number, number>()
  for (const point of referenceData) {
    refMap.set(Math.round(point.relativeTimeS), point.pressure1)
  }

  for (const current of currentData) {
    const time = Math.round(current.relativeTimeS)
    const referenceValue = refMap.get(time)

    if (referenceValue === undefined || referenceValue <= 0) {
      continue // Keine Referenz fur diesen Zeitpunkt
    }

    const delta = current.pressure1 - referenceValue
    const deltaPercent = (delta / referenceValue) * 100

    deviationPoints.push({
      time: current.relativeTimeS,
      currentValue: current.pressure1,
      referenceValue,
      delta,
      deltaPercent,
      deviationClass: classifyDeviation(deltaPercent, thresholds)
    })
  }

  return deviationPoints
}

/**
 * Gruppiert Deviation Points in zusammenhangende Segmente gleicher Klasse
 * Groups deviation points into contiguous segments of same class
 */
export function segmentDeviations(
  points: DeviationPoint[]
): DeviationSegment[] {
  if (points.length === 0) return []

  const segments: DeviationSegment[] = []
  let currentSegment: DeviationSegment = {
    startTime: points[0].time,
    endTime: points[0].time,
    points: [points[0]],
    deviationClass: points[0].deviationClass
  }

  for (let i = 1; i < points.length; i++) {
    const point = points[i]

    if (point.deviationClass === currentSegment.deviationClass) {
      // Extend current segment
      currentSegment.points.push(point)
      currentSegment.endTime = point.time
    } else {
      // Finish current segment, start new one
      segments.push(currentSegment)
      currentSegment = {
        startTime: point.time,
        endTime: point.time,
        points: [point],
        deviationClass: point.deviationClass
      }
    }
  }

  // Don't forget last segment
  segments.push(currentSegment)

  return segments
}

/**
 * Berechnet Zusammenfassung der Abweichungen
 * Calculates deviation summary statistics
 */
export function summarizeDeviations(
  points: DeviationPoint[]
): DeviationSummary {
  if (points.length === 0) {
    return {
      withinToleranceCount: 0,
      slightDeviationCount: 0,
      significantDeviationCount: 0,
      withinTolerancePercent: 100,
      maxDeviation: 0,
      avgDeviation: 0,
      overallStatus: 'ok'
    }
  }

  const withinToleranceCount = points.filter(
    p => p.deviationClass === 'within_tolerance'
  ).length

  const slightDeviationCount = points.filter(
    p => p.deviationClass === 'slight_deviation'
  ).length

  const significantDeviationCount = points.filter(
    p => p.deviationClass === 'significant_deviation'
  ).length

  const withinTolerancePercent = (withinToleranceCount / points.length) * 100

  const maxDeviation = Math.max(...points.map(p => Math.abs(p.deltaPercent)))

  const avgDeviation = points.reduce(
    (sum, p) => sum + Math.abs(p.deltaPercent), 0
  ) / points.length

  // Overall status determination
  let overallStatus: DeviationSummary['overallStatus'] = 'ok'
  if (significantDeviationCount > points.length * 0.1) {
    overallStatus = 'critical'  // >10% of points significantly deviate
  } else if (significantDeviationCount > 0 || slightDeviationCount > points.length * 0.2) {
    overallStatus = 'warning'   // Any significant or >20% slight
  }

  return {
    withinToleranceCount,
    slightDeviationCount,
    significantDeviationCount,
    withinTolerancePercent,
    maxDeviation,
    avgDeviation,
    overallStatus
  }
}

/**
 * Vollstandige Abweichungs-Analyse
 * Complete deviation analysis
 */
export function analyzeDeviations(
  currentData: PressureDataPoint[],
  referenceData: PressureDataPoint[],
  thresholds: DeviationThresholds = DEFAULT_DEVIATION_THRESHOLDS
): DeviationAnalysis {
  const points = calculateDeviations(currentData, referenceData, thresholds)
  const segments = segmentDeviations(points)
  const summary = summarizeDeviations(points)

  return {
    points,
    segments,
    summary,
    thresholds
  }
}

/**
 * Liefert CSS-Variable fur Deviation Class
 * Returns CSS variable for deviation class
 */
export function getDeviationColor(deviationClass: DeviationClass): string {
  switch (deviationClass) {
    case 'within_tolerance':
      return 'var(--color-state-success)'   // Grun
    case 'slight_deviation':
      return 'var(--color-state-warning)'   // Gelb/Orange
    case 'significant_deviation':
      return 'var(--color-state-danger)'    // Rot
  }
}

/**
 * Liefert Opacity fur Deviation Class (fur Area Fill)
 * Returns opacity for deviation class (for area fill)
 */
export function getDeviationOpacity(deviationClass: DeviationClass): number {
  switch (deviationClass) {
    case 'within_tolerance':
      return 0.15
    case 'slight_deviation':
      return 0.25
    case 'significant_deviation':
      return 0.35
  }
}
```

### Schritt 3: Chart-Integration (60min)

**Datei:** `src/components/RateOfRise/RoRChart.tsx` (Erweiterung)

Neue Props und Rendering-Logik:

```typescript
interface RoRChartProps {
  data: RateOfRiseData
  analysis: RateOfRiseAnalysis | null
  scale: 'linear' | 'log'
  showFitLine: boolean
  showPhases: boolean
  // NEW: Golden Run Comparison
  referenceData?: RateOfRiseData | null
  showDeviations?: boolean
  deviationThresholds?: DeviationThresholds
}

// Inside useEffect, after drawing main data line:

// === DEVIATION HIGHLIGHTING ===
if (showDeviations && referenceData && referenceData.dataPoints.length > 0) {
  const deviationAnalysis = analyzeDeviations(
    data.dataPoints,
    referenceData.dataPoints,
    deviationThresholds
  )

  // Draw reference line (dashed, gray)
  const refLine = d3.line<PressureDataPoint>()
    .x(d => xScale(d.relativeTimeS))
    .y(d => yScale(d.pressure1))
    .defined(d => d.pressure1 > 0 && isFinite(yScale(d.pressure1)))

  g.append('path')
    .datum(referenceData.dataPoints)
    .attr('fill', 'none')
    .attr('stroke', 'var(--color-text-muted)')
    .attr('stroke-width', 1.5)
    .attr('stroke-dasharray', '6,4')
    .attr('opacity', 0.6)
    .attr('d', refLine)

  // Draw deviation areas (color-coded segments)
  for (const segment of deviationAnalysis.segments) {
    const areaGen = d3.area<DeviationPoint>()
      .x(d => xScale(d.time))
      .y0(d => yScale(d.referenceValue))
      .y1(d => yScale(d.currentValue))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(segment.points)
      .attr('fill', getDeviationColor(segment.deviationClass))
      .attr('opacity', getDeviationOpacity(segment.deviationClass))
      .attr('d', areaGen)
  }

  // Legend for reference line
  g.append('text')
    .attr('x', innerWidth - 10)
    .attr('y', 30)
    .attr('text-anchor', 'end')
    .attr('fill', 'var(--color-text-muted)')
    .attr('font-size', '10px')
    .text('--- Golden Run')
}
```

### Schritt 4: Controls UI (45min)

**Datei:** `src/components/RateOfRise/DeviationControls.tsx`

```typescript
import { useState } from 'react'
import type { DeviationThresholds, DeviationSummary } from '@/types/comparison'
import { THRESHOLD_PRESETS, DEFAULT_DEVIATION_THRESHOLDS } from '@/types/comparison'

interface DeviationControlsProps {
  thresholds: DeviationThresholds
  onThresholdsChange: (thresholds: DeviationThresholds) => void
  summary: DeviationSummary | null
  onClear: () => void
}

export function DeviationControls({
  thresholds,
  onThresholdsChange,
  summary,
  onClear
}: DeviationControlsProps) {
  return (
    <div className="bg-surface-card rounded-lg p-4 border border-border-subtle">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-text-primary">
          Abweichungs-Schwellenwerte
        </h4>
        <button
          onClick={onClear}
          className="text-xs text-text-muted hover:text-state-danger"
        >
          Referenz entfernen
        </button>
      </div>

      {/* Preset Buttons */}
      <div className="flex gap-2 mb-4">
        {Object.entries(THRESHOLD_PRESETS).map(([name, preset]) => (
          <button
            key={name}
            onClick={() => onThresholdsChange(preset)}
            className={`px-2 py-1 text-xs rounded ${
              thresholds.tolerance === preset.tolerance
                ? 'bg-accent-cyan text-white'
                : 'bg-surface-hover text-text-secondary'
            }`}
          >
            {name === 'strict' ? 'Streng' : name === 'standard' ? 'Standard' : 'Locker'}
          </button>
        ))}
      </div>

      {/* Tolerance Slider */}
      <div className="mb-3">
        <label className="text-xs text-text-muted block mb-1">
          Toleranz (grun): ±{thresholds.tolerance}%
        </label>
        <input
          type="range"
          min={1}
          max={20}
          value={thresholds.tolerance}
          onChange={(e) => onThresholdsChange({
            ...thresholds,
            tolerance: Number(e.target.value)
          })}
          className="w-full accent-state-success"
        />
      </div>

      {/* Warning Slider */}
      <div className="mb-4">
        <label className="text-xs text-text-muted block mb-1">
          Warnung (gelb): ±{thresholds.warning}%
        </label>
        <input
          type="range"
          min={thresholds.tolerance + 1}
          max={50}
          value={thresholds.warning}
          onChange={(e) => onThresholdsChange({
            ...thresholds,
            warning: Number(e.target.value)
          })}
          className="w-full accent-state-warning"
        />
      </div>

      {/* Summary Display */}
      {summary && (
        <div className="border-t border-border-subtle pt-3">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-state-success font-medium">
                {summary.withinTolerancePercent.toFixed(0)}%
              </div>
              <div className="text-text-muted">OK</div>
            </div>
            <div className="text-center">
              <div className="text-state-warning font-medium">
                {summary.slightDeviationCount}
              </div>
              <div className="text-text-muted">Warnung</div>
            </div>
            <div className="text-center">
              <div className="text-state-danger font-medium">
                {summary.significantDeviationCount}
              </div>
              <div className="text-text-muted">Kritisch</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-text-muted text-center">
            Max. Abweichung: {summary.maxDeviation.toFixed(1)}%
          </div>
        </div>
      )}
    </div>
  )
}
```

### Schritt 5: Store-Integration (30min)

**Datei:** `src/store/useGoldenRunStore.ts` (erweitern aus 1.10.1)

```typescript
// Neue State-Properties und Actions fur Deviation Highlighting:

interface GoldenRunStore {
  // From 1.10.1:
  referenceData: RateOfRiseData | null
  loadReference: (data: RateOfRiseData) => void
  clearReference: () => void

  // NEW for 1.10.2:
  deviationThresholds: DeviationThresholds
  setDeviationThresholds: (thresholds: DeviationThresholds) => void
  showDeviations: boolean
  setShowDeviations: (show: boolean) => void
  deviationAnalysis: DeviationAnalysis | null
  updateDeviationAnalysis: (currentData: PressureDataPoint[]) => void
}

// Implementation in create():
deviationThresholds: DEFAULT_DEVIATION_THRESHOLDS,
setDeviationThresholds: (thresholds) => set({ deviationThresholds: thresholds }),
showDeviations: true,
setShowDeviations: (show) => set({ showDeviations: show }),
deviationAnalysis: null,
updateDeviationAnalysis: (currentData) => {
  const state = get()
  if (!state.referenceData) {
    set({ deviationAnalysis: null })
    return
  }
  const analysis = analyzeDeviations(
    currentData,
    state.referenceData.dataPoints,
    state.deviationThresholds
  )
  set({ deviationAnalysis: analysis })
}
```

---

## Integration mit Feature 1.10.1

**Abhangigkeit:** Feature 1.10.2 benotigt Feature 1.10.1 (CSV Reference Loader).

**Workflow:**
1. User ladt aktuelle Messung (normale RoR-Funktion)
2. User klickt "Referenz laden" (1.10.1)
3. User sieht Referenz als gestrichelte Linie
4. Deviation Highlighting aktiviert sich automatisch (1.10.2)
5. User kann Schwellenwerte anpassen
6. User sieht farbige Flachen wo Abweichungen sind

---

## UI/UX Considerations

### Wo erscheint das Feature?

1. **Chart-Bereich:** Deviation Areas + Reference Line im RoRChart
2. **Controls-Bereich:** DeviationControls Komponente rechts neben Chart
3. **Summary-Card:** Zusammenfassung (% OK, Warnungen, Kritisch)

### Interaktionen

- Hover uber Deviation Area zeigt Tooltip mit Details
- Click auf Preset setzt beide Thresholds gleichzeitig
- Toggle "Abweichungen anzeigen" ein/ausschalten
- "Referenz entfernen" Button setzt alles zuruck

### Barrierefreiheit

- Farben sind kontrastreich (WCAG AA)
- Pattern-Overlay als Alternative zu reiner Farbe (zukunftig)
- Textuelle Zusammenfassung der Abweichungen

---

## Test-Szenarien

### Test 1: Perfekte Ubereinstimmung
- **Input:** Current = Reference (identische Daten)
- **Expected:** 100% within_tolerance, alle grun
- **Actual:** [Nach Implementation]

### Test 2: Konstante Abweichung +10%
- **Input:** Current = Reference * 1.1
- **Expected:** 100% slight_deviation (bei Standard-Thresholds)
- **Actual:** [Nach Implementation]

### Test 3: Grosse Abweichung +50%
- **Input:** Current = Reference * 1.5
- **Expected:** 100% significant_deviation
- **Actual:** [Nach Implementation]

### Test 4: Gemischte Abweichungen
- **Input:** Erste Halfte +3%, zweite Halfte +20%
- **Expected:** 50% within_tolerance, 50% significant_deviation
- **Actual:** [Nach Implementation]

### Test 5: Keine Referenz
- **Input:** referenceData = null
- **Expected:** Keine Deviation Areas, normaler Chart
- **Actual:** [Nach Implementation]

### Test 6: Threshold-Anderung
- **Input:** User andert Tolerance von 5% auf 15%
- **Expected:** Mehr Punkte werden "within_tolerance"
- **Actual:** [Nach Implementation]

---

## Geschatzter Aufwand / Estimated Effort

| Schritt | Aufwand |
|---------|---------|
| Types definieren | 30min |
| Deviation-Berechnung | 45min |
| Chart-Integration | 60min |
| Controls UI | 45min |
| Store-Integration | 30min |
| Testing | 30min |
| **Gesamt** | **4h** |

**Backlog-Schatzung:** 2-3h (optimistisch)
**Realistisch:** 3-4h

---

## Erfolgs-Kriterien / Success Criteria

- [ ] Deviation zwischen Current und Reference wird korrekt berechnet
- [ ] Farbige Flachen erscheinen im Chart
- [ ] Threshold-Slider funktionieren
- [ ] Preset-Buttons setzen korrekte Werte
- [ ] Summary zeigt korrekte Statistiken
- [ ] Keine visuellen Glitches bei Log-Skala
- [ ] Performance OK bei 1000+ Datenpunkten
- [ ] Reference Line erscheint gestrichelt

---

## Changelog

| Datum | Status | Notiz |
|-------|--------|-------|
| 2026-01-10 | ⬜ Geplant | Initiale Planung fur Implementation-Ready Status |

---

**Template-Version:** 1.0
**Erstellt:** 2026-01-10
**Autor:** Claude Code
**Feature ID:** 1.10.2
**Abhangigkeit:** 1.10.1 (CSV Reference Loader)
