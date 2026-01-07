# Zeitreihen-Analyse Feature Spezifikation

## Übersicht

### Motivation
Die aktuelle App analysiert nur den **ersten Scan** aus .asc-Dateien, obwohl Quadera-Exporte oft **mehrere Scans mit Zeitstempeln** enthalten. Diese Daten werden aktuell verworfen.

Das Zeitreihen-Feature ermöglicht:
- Pumpdown-Kurven visualisieren
- Bakeout-Monitoring über Stunden/Tage
- Trend-Analyse für einzelne Massen
- Prognosen für Vakuumqualität

### Scope
- **Phase 1 (MVP)**: Parser + Trend-Chart + Spektrum-Slider
- **Phase 2**: Automatische Analyse + Fits
- **Phase 3**: Prognose + Anomalie-Erkennung + Performance

---

## 1. Datenformat-Analyse

### Aktuelle .asc Struktur (Quadera Export)

```
Sourcefile    20241203 073456 Analog Scan SEM 100.qmp
Exporttime    12.3.2024 01:14:14.489 

Start Time    12.3.2024 12:54:00.782 
End Time      12.3.2024 01:08:03.658 

Task Name     Scan
First Mass    0,00
Scan Width    100,00

Start Time    12.3.2024 12:54:00.782    ← Scan 1 Timestamp

Mass [amu]    Ion Current [A]
0,00          2,442094e-010
0,03          1,105800e-010
...
99,97         9,334029e-012

Task Name     Scan                       ← Scan 2 beginnt
First Mass    0,00
Scan Width    100,00

Start Time    12.3.2024 12:57:30.485    ← Scan 2 Timestamp

Mass [amu]    Ion Current [A]
0,00          2,401234e-010
...
```

### Erkennungslogik für neue Scans

Ein neuer Scan beginnt wenn:
1. Zeile enthält `Task Name` UND nächste relevante Zeile enthält `Scan Width`
2. ODER: Zeile enthält `Start Time` nach einem Datenblock
3. ODER: Zeile enthält `Mass [amu]` Header erneut

### Beispiel-Datei Analyse

Datei: `PA050234_Vakuumkammer_1_24_h_pump_after_bakeout_1250_V_20C_6_4e-8mbar.asc`

| Scan | Zeile | Start Time | Δt zu Scan 1 |
|------|-------|------------|--------------|
| 1 | 12 | 12.3.2024 12:54:00.782 | 0 min |
| 2 | 3220 | 12.3.2024 12:57:30.485 | 3.5 min |
| 3 | 6428 | 12.3.2024 13:01:00.082 | 7 min |
| 4 | 9636 | 12.3.2024 13:04:29.167 | 10.5 min |
| 5 | 12844 | 12.3.2024 13:07:58.658 | 14 min |

~3200 Datenpunkte pro Scan (0-100 AMU bei 0.03 Auflösung)

---

## 2. Datenmodell (TypeScript)

### Neue Interfaces

```typescript
// Einzelner Scan (erweitert bestehendes Spektrum-Interface)
interface RGAScan {
  index: number;                    // 0-basierter Index
  timestamp: Date;                  // Parsed aus "Start Time"
  relativeTimeMs: number;           // Millisekunden seit erstem Scan
  data: Map<number, number>;        // mass -> ionCurrent
  metadata: {
    firstMass: number;
    scanWidth: number;
    taskName: string;
  };
}

// Zeitreihen-Container
interface RGATimeSeries {
  // Datei-Metadaten
  filename: string;
  sourcefile: string;
  exportTime: Date;
  globalStartTime: Date;
  globalEndTime: Date;
  
  // Scans
  scans: RGAScan[];
  scanCount: number;
  totalDurationMs: number;
  
  // Abgeleitete Daten (lazy computed)
  massRange: { min: number; max: number };
  availableMasses: number[];        // Alle detektierten Peak-Massen
  
  // Hilfsmethoden
  getScanAtTime(timeMs: number): RGAScan | null;
  getTimeSeriesForMass(mass: number): TimeSeriesPoint[];
  getInterpolatedValueAtTime(mass: number, timeMs: number): number;
}

// Zeitreihen-Datenpunkt für eine Masse
interface TimeSeriesPoint {
  timestamp: Date;
  relativeTimeMs: number;
  scanIndex: number;
  value: number;                    // Ion Current in A
  normalizedValue: number;          // Relativ zu H₂ (wenn verfügbar)
}

// Trend-Analyse Ergebnis
interface TrendAnalysis {
  mass: number;
  gasName: string;
  
  // Statistische Werte
  startValue: number;
  endValue: number;
  minValue: number;
  maxValue: number;
  meanValue: number;
  
  // Trend
  changePercent: number;            // (end - start) / start * 100
  trend: 'rising' | 'falling' | 'stable' | 'fluctuating';
  
  // Exponentieller Fit (optional)
  exponentialFit?: {
    tau: number;                    // Zeitkonstante in ms
    tauFormatted: string;           // z.B. "2.3 h"
    r2: number;                     // Güte des Fits
    asymptote: number;              // Grenzwert
  };
  
  // Prognose (optional)
  forecast?: {
    targetValue: number;
    estimatedTimeMs: number;
    estimatedTimeFormatted: string;
    confidence: number;
  };
}

// Anomalie
interface TimeSeriesAnomaly {
  scanIndex: number;
  timestamp: Date;
  mass: number;
  type: 'sudden_rise' | 'sudden_drop' | 'spike' | 'plateau_break';
  severity: 'info' | 'warning' | 'critical';
  description: string;
  previousValue: number;
  currentValue: number;
  changePercent: number;
}
```

### State Management (Zustand Store Erweiterung)

```typescript
interface TimeSeriesState {
  // Daten
  timeSeries: RGATimeSeries | null;
  isTimeSeriesMode: boolean;        // true wenn >1 Scan
  
  // UI State
  currentScanIndex: number;
  selectedMasses: number[];         // Für Trend-Chart
  isPlaying: boolean;
  playbackSpeed: number;            // 0.5, 1, 2, 4
  
  // Analyse
  trendAnalyses: Map<number, TrendAnalysis>;
  anomalies: TimeSeriesAnomaly[];
  
  // Actions
  loadTimeSeries: (file: File) => Promise<void>;
  setCurrentScan: (index: number) => void;
  toggleMassSelection: (mass: number) => void;
  playTimeSeries: () => void;
  pauseTimeSeries: () => void;
  setPlaybackSpeed: (speed: number) => void;
  runTrendAnalysis: (mass: number) => TrendAnalysis;
  detectAnomalies: () => TimeSeriesAnomaly[];
}
```

---

## 3. Parser-Erweiterung

### Aktueller Parser (vereinfacht)

```typescript
// AKTUELL: Nur erster Scan
function parseASCFile(content: string): Spectrum {
  // ... parsed nur bis zum ersten "Task Name" nach Daten
}
```

### Neuer Parser

```typescript
/**
 * Erweiterter Parser für Multi-Scan .asc Dateien
 * Rückwärtskompatibel: Gibt auch einzelnes Spektrum zurück
 */
function parseASCFileMultiScan(content: string): {
  spectrum: Spectrum;               // Erster Scan (Kompatibilität)
  timeSeries: RGATimeSeries | null; // Null wenn nur 1 Scan
} {
  const lines = content.split(/\r?\n/);
  const scans: RGAScan[] = [];
  
  let globalMetadata = parseGlobalMetadata(lines);
  let currentScanStart = -1;
  let currentScanMeta: Partial<RGAScan['metadata']> = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Neuer Scan-Block erkannt
    if (line.startsWith('Task Name') && line.includes('Scan')) {
      if (currentScanStart > -1) {
        // Vorherigen Scan abschließen
        scans.push(parseScanBlock(lines, currentScanStart, i - 1, currentScanMeta));
      }
      currentScanStart = i;
      currentScanMeta = { taskName: 'Scan' };
    }
    
    // Scan-Metadaten
    if (line.startsWith('First Mass')) {
      currentScanMeta.firstMass = parseGermanFloat(line.split('\t')[1]);
    }
    if (line.startsWith('Scan Width')) {
      currentScanMeta.scanWidth = parseGermanFloat(line.split('\t')[1]);
    }
    if (line.startsWith('Start Time') && currentScanStart > -1) {
      currentScanMeta.timestamp = parseQuaderaTimestamp(line.split('\t')[1]);
    }
  }
  
  // Letzten Scan abschließen
  if (currentScanStart > -1) {
    scans.push(parseScanBlock(lines, currentScanStart, lines.length - 1, currentScanMeta));
  }
  
  // Relative Zeiten berechnen
  if (scans.length > 0) {
    const firstTimestamp = scans[0].timestamp.getTime();
    scans.forEach((scan, idx) => {
      scan.index = idx;
      scan.relativeTimeMs = scan.timestamp.getTime() - firstTimestamp;
    });
  }
  
  // Rückgabe
  const timeSeries: RGATimeSeries | null = scans.length > 1 ? {
    filename: globalMetadata.filename,
    sourcefile: globalMetadata.sourcefile,
    exportTime: globalMetadata.exportTime,
    globalStartTime: scans[0].timestamp,
    globalEndTime: scans[scans.length - 1].timestamp,
    scans,
    scanCount: scans.length,
    totalDurationMs: scans[scans.length - 1].relativeTimeMs,
    massRange: calculateMassRange(scans),
    availableMasses: detectPeakMasses(scans[0]),
    // Methoden...
  } : null;
  
  return {
    spectrum: convertScanToSpectrum(scans[0], globalMetadata),
    timeSeries
  };
}

/**
 * Quadera Timestamp Parser
 * Format: "12.3.2024 12:54:00.782" (Tag.Monat.Jahr Stunde:Minute:Sekunde.Millisekunde)
 */
function parseQuaderaTimestamp(str: string): Date {
  const trimmed = str.trim();
  // Regex für "DD.M.YYYY HH:MM:SS.mmm" oder "DD.MM.YYYY HH:MM:SS.mmm"
  const match = trimmed.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
  
  if (!match) {
    console.warn('Could not parse timestamp:', str);
    return new Date();
  }
  
  const [, day, month, year, hour, minute, second, ms] = match;
  return new Date(
    parseInt(year),
    parseInt(month) - 1,  // JS Monate sind 0-basiert
    parseInt(day),
    parseInt(hour),
    parseInt(minute),
    parseInt(second),
    parseInt(ms)
  );
}

/**
 * Deutsches Zahlenformat (Komma als Dezimaltrenner)
 */
function parseGermanFloat(str: string): number {
  return parseFloat(str.trim().replace(',', '.'));
}
```

---

## 4. UI-Komponenten

### 4.1 Zeitreihen-Indikator (Header)

Wenn eine Datei mit mehreren Scans geladen wird, zeige Indikator:

```tsx
// components/TimeSeriesIndicator.tsx

interface Props {
  scanCount: number;
  totalDuration: string;  // formatiert, z.B. "14 min" oder "24.5 h"
  onOpenTimeSeries: () => void;
}

function TimeSeriesIndicator({ scanCount, totalDuration, onOpenTimeSeries }: Props) {
  return (
    <button 
      onClick={onOpenTimeSeries}
      className="flex items-center gap-2 px-3 py-1.5 bg-accent-cyan/10 
                 text-accent-cyan rounded-lg hover:bg-accent-cyan/20 transition"
    >
      <ClockIcon className="w-4 h-4" />
      <span className="text-sm font-medium">
        {scanCount} Scans · {totalDuration}
      </span>
      <ChevronRightIcon className="w-4 h-4" />
    </button>
  );
}
```

**Platzierung**: Neben dem Dateinamen im Header, nur sichtbar wenn `scanCount > 1`

---

### 4.2 Trend-Chart Komponente

```tsx
// components/timeseries/TrendChart.tsx

interface Props {
  timeSeries: RGATimeSeries;
  selectedMasses: number[];
  onMassToggle: (mass: number) => void;
  currentScanIndex: number;
  onScanSelect: (index: number) => void;
}

function TrendChart({ 
  timeSeries, 
  selectedMasses, 
  onMassToggle,
  currentScanIndex,
  onScanSelect 
}: Props) {
  const chartRef = useRef<SVGSVGElement>(null);
  
  // Verfügbare Massen für Selection (Top 10 Peaks)
  const availableMasses = useMemo(() => {
    return getTopPeakMasses(timeSeries.scans[0], 10);
  }, [timeSeries]);
  
  // Zeitreihen-Daten für ausgewählte Massen
  const seriesData = useMemo(() => {
    return selectedMasses.map(mass => ({
      mass,
      gasName: getGasNameForMass(mass),
      color: getMassColor(mass),
      points: timeSeries.getTimeSeriesForMass(mass)
    }));
  }, [timeSeries, selectedMasses]);

  // D3 Chart Rendering
  useEffect(() => {
    if (!chartRef.current || seriesData.length === 0) return;
    
    const svg = d3.select(chartRef.current);
    const { width, height } = chartRef.current.getBoundingClientRect();
    const margin = { top: 20, right: 80, bottom: 50, left: 70 };
    
    // Clear previous
    svg.selectAll('*').remove();
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, timeSeries.totalDurationMs])
      .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleLog()
      .domain([
        d3.min(seriesData, s => d3.min(s.points, p => p.value)) * 0.5,
        d3.max(seriesData, s => d3.max(s.points, p => p.value)) * 2
      ])
      .range([height - margin.bottom, margin.top]);
    
    // X-Axis (Zeit)
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => formatDuration(d as number));
    
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis);
    
    // Y-Axis (Druck/Strom)
    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => d.toExponential(0));
    
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis);
    
    // Linien für jede Masse
    const line = d3.line<TimeSeriesPoint>()
      .x(d => xScale(d.relativeTimeMs))
      .y(d => yScale(d.value));
    
    seriesData.forEach(series => {
      // Linie
      svg.append('path')
        .datum(series.points)
        .attr('fill', 'none')
        .attr('stroke', series.color)
        .attr('stroke-width', 2)
        .attr('d', line);
      
      // Punkte
      svg.selectAll(`.dot-${series.mass}`)
        .data(series.points)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.relativeTimeMs))
        .attr('cy', d => yScale(d.value))
        .attr('r', 4)
        .attr('fill', series.color)
        .attr('class', `dot-${series.mass} cursor-pointer`)
        .on('click', (event, d) => onScanSelect(d.scanIndex));
      
      // Legende
      svg.append('text')
        .attr('x', width - margin.right + 10)
        .attr('y', yScale(series.points[series.points.length - 1].value))
        .attr('fill', series.color)
        .attr('font-size', '12px')
        .attr('alignment-baseline', 'middle')
        .text(`${series.gasName} (m${series.mass})`);
    });
    
    // Cursor-Linie für aktuellen Scan
    const currentTime = timeSeries.scans[currentScanIndex].relativeTimeMs;
    svg.append('line')
      .attr('x1', xScale(currentTime))
      .attr('x2', xScale(currentTime))
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,4');
      
  }, [seriesData, currentScanIndex, timeSeries]);

  return (
    <div className="flex flex-col h-full">
      {/* Massen-Auswahl */}
      <div className="flex flex-wrap gap-2 p-4 border-b border-border-subtle">
        <span className="text-sm text-text-secondary mr-2">Massen:</span>
        {availableMasses.map(mass => (
          <button
            key={mass}
            onClick={() => onMassToggle(mass)}
            className={`px-2 py-1 text-xs rounded-full transition ${
              selectedMasses.includes(mass)
                ? 'bg-accent-cyan text-white'
                : 'bg-surface-card-muted text-text-secondary hover:bg-surface-card'
            }`}
          >
            {getGasNameForMass(mass)} ({mass})
          </button>
        ))}
      </div>
      
      {/* Chart */}
      <div className="flex-1 p-4">
        <svg ref={chartRef} className="w-full h-full" />
      </div>
    </div>
  );
}

// Farben für Massen (konsistent)
function getMassColor(mass: number): string {
  const colors: Record<number, string> = {
    2: '#00E097',   // H₂ - Mint
    4: '#E0BD00',   // He - Gelb
    18: '#0097E0',  // H₂O - Cyan
    28: '#E05000',  // N₂/CO - Orange
    32: '#E00050',  // O₂ - Pink
    40: '#9000E0',  // Ar - Lila
    44: '#00E0E0',  // CO₂ - Türkis
  };
  return colors[mass] || '#888888';
}

// Zeitformatierung
function formatDuration(ms: number): string {
  const seconds = ms / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  
  if (hours >= 1) {
    return `${hours.toFixed(1)}h`;
  } else if (minutes >= 1) {
    return `${minutes.toFixed(0)}min`;
  } else {
    return `${seconds.toFixed(0)}s`;
  }
}
```

---

### 4.3 Spektrum-Slider Komponente

```tsx
// components/timeseries/SpectrumSlider.tsx

interface Props {
  timeSeries: RGATimeSeries;
  currentIndex: number;
  onChange: (index: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
}

function SpectrumSlider({
  timeSeries,
  currentIndex,
  onChange,
  isPlaying,
  onPlayPause,
  playbackSpeed,
  onSpeedChange
}: Props) {
  const currentScan = timeSeries.scans[currentIndex];
  
  // Playback Loop
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      onChange((currentIndex + 1) % timeSeries.scanCount);
    }, 1000 / playbackSpeed);
    
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, playbackSpeed, timeSeries.scanCount]);

  return (
    <div className="bg-surface-card rounded-xl p-4 shadow-card">
      {/* Scan Info */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm">
          <span className="text-text-secondary">Scan </span>
          <span className="text-text-primary font-semibold">
            {currentIndex + 1} / {timeSeries.scanCount}
          </span>
        </div>
        <div className="text-sm text-text-secondary">
          {currentScan.timestamp.toLocaleString('de-DE')}
        </div>
        <div className="text-sm">
          <span className="text-text-secondary">Δt: </span>
          <span className="text-text-primary">
            {formatDuration(currentScan.relativeTimeMs)}
          </span>
        </div>
      </div>
      
      {/* Slider */}
      <input
        type="range"
        min={0}
        max={timeSeries.scanCount - 1}
        value={currentIndex}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-surface-card-muted rounded-lg appearance-none 
                   cursor-pointer accent-accent-cyan"
      />
      
      {/* Controls */}
      <div className="flex items-center justify-between mt-4">
        {/* Play/Pause */}
        <button
          onClick={onPlayPause}
          className="flex items-center gap-2 px-4 py-2 bg-accent-cyan/10 
                     text-accent-cyan rounded-lg hover:bg-accent-cyan/20 transition"
        >
          {isPlaying ? (
            <>
              <PauseIcon className="w-5 h-5" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <PlayIcon className="w-5 h-5" />
              <span>Abspielen</span>
            </>
          )}
        </button>
        
        {/* Vor/Zurück */}
        <div className="flex gap-2">
          <button
            onClick={() => onChange(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="p-2 rounded-lg hover:bg-surface-card-muted disabled:opacity-30"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => onChange(Math.min(timeSeries.scanCount - 1, currentIndex + 1))}
            disabled={currentIndex === timeSeries.scanCount - 1}
            className="p-2 rounded-lg hover:bg-surface-card-muted disabled:opacity-30"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
        
        {/* Speed */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">Tempo:</span>
          <select
            value={playbackSpeed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="bg-surface-card-muted text-text-primary px-2 py-1 
                       rounded-lg text-sm border-none"
          >
            <option value={0.5}>0.5×</option>
            <option value={1}>1×</option>
            <option value={2}>2×</option>
            <option value={4}>4×</option>
            <option value={10}>10×</option>
          </select>
        </div>
      </div>
    </div>
  );
}
```

---

### 4.4 Zeitreihen-Modal/View

```tsx
// components/timeseries/TimeSeriesView.tsx

interface Props {
  timeSeries: RGATimeSeries;
  onClose: () => void;
}

function TimeSeriesView({ timeSeries, onClose }: Props) {
  const [currentScanIndex, setCurrentScanIndex] = useState(0);
  const [selectedMasses, setSelectedMasses] = useState<number[]>([2, 18, 28]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [viewMode, setViewMode] = useState<'trend' | 'spectrum'>('trend');
  const [trendAnalyses, setTrendAnalyses] = useState<TrendAnalysis[]>([]);

  // Trend-Analyse ausführen
  useEffect(() => {
    const analyses = selectedMasses.map(mass => 
      analyzeTrend(timeSeries, mass)
    );
    setTrendAnalyses(analyses);
  }, [selectedMasses, timeSeries]);

  const toggleMass = (mass: number) => {
    setSelectedMasses(prev => 
      prev.includes(mass) 
        ? prev.filter(m => m !== mass)
        : [...prev, mass]
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-surface-page flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border-subtle">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-surface-card-muted rounded-lg">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">Zeitreihen-Analyse</h1>
            <p className="text-sm text-text-secondary">
              {timeSeries.scanCount} Scans · {formatDuration(timeSeries.totalDurationMs)}
            </p>
          </div>
        </div>
        
        {/* View Toggle */}
        <div className="flex bg-surface-card-muted rounded-lg p-1">
          <button
            onClick={() => setViewMode('trend')}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              viewMode === 'trend' 
                ? 'bg-surface-card text-text-primary shadow' 
                : 'text-text-secondary'
            }`}
          >
            Trend-Chart
          </button>
          <button
            onClick={() => setViewMode('spectrum')}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              viewMode === 'spectrum' 
                ? 'bg-surface-card text-text-primary shadow' 
                : 'text-text-secondary'
            }`}
          >
            Spektrum-Ansicht
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chart Area */}
        <div className="flex-1 flex flex-col">
          {viewMode === 'trend' ? (
            <TrendChart
              timeSeries={timeSeries}
              selectedMasses={selectedMasses}
              onMassToggle={toggleMass}
              currentScanIndex={currentScanIndex}
              onScanSelect={setCurrentScanIndex}
            />
          ) : (
            <SpectrumChart
              scan={timeSeries.scans[currentScanIndex]}
              // ... normale Spektrum-Props
            />
          )}
          
          {/* Slider (immer sichtbar) */}
          <div className="p-4 border-t border-border-subtle">
            <SpectrumSlider
              timeSeries={timeSeries}
              currentIndex={currentScanIndex}
              onChange={setCurrentScanIndex}
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              playbackSpeed={playbackSpeed}
              onSpeedChange={setPlaybackSpeed}
            />
          </div>
        </div>
        
        {/* Sidebar: Trend-Analyse */}
        <aside className="w-80 border-l border-border-subtle overflow-y-auto p-4">
          <h2 className="text-sm font-semibold text-text-secondary mb-4">
            TREND-ANALYSE
          </h2>
          
          {trendAnalyses.map(analysis => (
            <TrendAnalysisCard key={analysis.mass} analysis={analysis} />
          ))}
        </aside>
      </div>
    </div>
  );
}
```

---

### 4.5 Trend-Analyse Card

```tsx
// components/timeseries/TrendAnalysisCard.tsx

interface Props {
  analysis: TrendAnalysis;
}

function TrendAnalysisCard({ analysis }: Props) {
  const trendIcon = {
    rising: '↑',
    falling: '↓',
    stable: '→',
    fluctuating: '↔'
  }[analysis.trend];
  
  const trendColor = {
    rising: 'text-state-danger',
    falling: 'text-state-success',
    stable: 'text-accent-cyan',
    fluctuating: 'text-state-warning'
  }[analysis.trend];

  return (
    <div className="bg-surface-card-muted rounded-xl p-4 mb-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: getMassColor(analysis.mass) }}
          />
          <span className="font-medium">{analysis.gasName}</span>
          <span className="text-text-muted text-sm">(m{analysis.mass})</span>
        </div>
        <span className={`text-lg font-bold ${trendColor}`}>
          {trendIcon} {analysis.changePercent > 0 ? '+' : ''}{analysis.changePercent.toFixed(1)}%
        </span>
      </div>
      
      {/* Werte */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-text-muted">Start:</span>
          <span className="ml-2">{analysis.startValue.toExponential(2)}</span>
        </div>
        <div>
          <span className="text-text-muted">Ende:</span>
          <span className="ml-2">{analysis.endValue.toExponential(2)}</span>
        </div>
        <div>
          <span className="text-text-muted">Min:</span>
          <span className="ml-2">{analysis.minValue.toExponential(2)}</span>
        </div>
        <div>
          <span className="text-text-muted">Max:</span>
          <span className="ml-2">{analysis.maxValue.toExponential(2)}</span>
        </div>
      </div>
      
      {/* Exponentieller Fit (wenn verfügbar) */}
      {analysis.exponentialFit && (
        <div className="mt-3 pt-3 border-t border-border-subtle">
          <div className="text-sm">
            <span className="text-text-muted">Zeitkonstante τ:</span>
            <span className="ml-2 font-medium">{analysis.exponentialFit.tauFormatted}</span>
          </div>
          <div className="text-sm">
            <span className="text-text-muted">Fit-Güte R²:</span>
            <span className="ml-2">{(analysis.exponentialFit.r2 * 100).toFixed(1)}%</span>
          </div>
        </div>
      )}
      
      {/* Prognose (wenn verfügbar) */}
      {analysis.forecast && (
        <div className="mt-3 pt-3 border-t border-border-subtle bg-accent-cyan/5 
                        rounded-lg p-2 -mx-2">
          <div className="text-sm text-accent-cyan">
            <span className="font-medium">Prognose:</span>
            <span className="ml-2">
              {analysis.forecast.targetValue.toExponential(0)} erreicht in{' '}
              {analysis.forecast.estimatedTimeFormatted}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 5. Analyse-Algorithmen

### 5.1 Trend-Berechnung

```typescript
// utils/timeseries/trendAnalysis.ts

function analyzeTrend(timeSeries: RGATimeSeries, mass: number): TrendAnalysis {
  const points = timeSeries.getTimeSeriesForMass(mass);
  
  if (points.length < 2) {
    throw new Error(`Insufficient data for mass ${mass}`);
  }
  
  const values = points.map(p => p.value);
  
  const startValue = values[0];
  const endValue = values[values.length - 1];
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const meanValue = values.reduce((a, b) => a + b, 0) / values.length;
  
  const changePercent = ((endValue - startValue) / startValue) * 100;
  
  // Trend-Klassifikation
  let trend: TrendAnalysis['trend'];
  const volatility = (maxValue - minValue) / meanValue;
  
  if (volatility > 0.5) {
    trend = 'fluctuating';
  } else if (Math.abs(changePercent) < 10) {
    trend = 'stable';
  } else if (changePercent > 0) {
    trend = 'rising';
  } else {
    trend = 'falling';
  }
  
  // Exponentieller Fit für fallende Trends
  let exponentialFit: TrendAnalysis['exponentialFit'] | undefined;
  if (trend === 'falling' && points.length >= 5) {
    exponentialFit = fitExponentialDecay(points);
  }
  
  return {
    mass,
    gasName: getGasNameForMass(mass),
    startValue,
    endValue,
    minValue,
    maxValue,
    meanValue,
    changePercent,
    trend,
    exponentialFit
  };
}
```

### 5.2 Exponentieller Fit

```typescript
// utils/timeseries/exponentialFit.ts

interface ExponentialFitResult {
  tau: number;          // Zeitkonstante in ms
  tauFormatted: string;
  r2: number;           // R² Güte
  asymptote: number;    // y₀ (Grenzwert)
  amplitude: number;    // A
  // Modell: y(t) = y₀ + A * exp(-t/τ)
}

/**
 * Least-Squares Fit für exponentiellen Zerfall
 * y(t) = y₀ + A * exp(-t/τ)
 * 
 * Linearisierung: ln(y - y₀) = ln(A) - t/τ
 */
function fitExponentialDecay(points: TimeSeriesPoint[]): ExponentialFitResult | undefined {
  if (points.length < 5) return undefined;
  
  const times = points.map(p => p.relativeTimeMs);
  const values = points.map(p => p.value);
  
  // Schätze Asymptote als Mittel der letzten 20% der Werte
  const lastValues = values.slice(-Math.ceil(values.length * 0.2));
  const y0_estimate = lastValues.reduce((a, b) => a + b, 0) / lastValues.length;
  
  // Linearisierung: ln(y - y₀) vs t
  const validPoints: { t: number; lnY: number }[] = [];
  for (let i = 0; i < points.length; i++) {
    const diff = values[i] - y0_estimate * 0.9; // Leicht unter Asymptote
    if (diff > 0) {
      validPoints.push({ t: times[i], lnY: Math.log(diff) });
    }
  }
  
  if (validPoints.length < 3) return undefined;
  
  // Lineare Regression: lnY = a + b*t, wobei b = -1/τ
  const n = validPoints.length;
  const sumT = validPoints.reduce((s, p) => s + p.t, 0);
  const sumLnY = validPoints.reduce((s, p) => s + p.lnY, 0);
  const sumTLnY = validPoints.reduce((s, p) => s + p.t * p.lnY, 0);
  const sumT2 = validPoints.reduce((s, p) => s + p.t * p.t, 0);
  
  const b = (n * sumTLnY - sumT * sumLnY) / (n * sumT2 - sumT * sumT);
  const a = (sumLnY - b * sumT) / n;
  
  if (b >= 0) return undefined; // Kein Zerfall
  
  const tau = -1 / b;
  const A = Math.exp(a);
  
  // R² berechnen
  const meanLnY = sumLnY / n;
  const ssTot = validPoints.reduce((s, p) => s + (p.lnY - meanLnY) ** 2, 0);
  const ssRes = validPoints.reduce((s, p) => {
    const predicted = a + b * p.t;
    return s + (p.lnY - predicted) ** 2;
  }, 0);
  const r2 = 1 - ssRes / ssTot;
  
  return {
    tau,
    tauFormatted: formatDuration(tau),
    r2,
    asymptote: y0_estimate,
    amplitude: A
  };
}
```

### 5.3 Prognose

```typescript
// utils/timeseries/forecast.ts

interface ForecastRequest {
  timeSeries: RGATimeSeries;
  mass: number;
  targetValue: number;  // z.B. 1e-10 mbar
}

function forecastTimeToTarget(req: ForecastRequest): TrendAnalysis['forecast'] | undefined {
  const analysis = analyzeTrend(req.timeSeries, req.mass);
  
  if (!analysis.exponentialFit || analysis.trend !== 'falling') {
    return undefined;
  }
  
  const { tau, asymptote, amplitude } = analysis.exponentialFit;
  
  // Prüfe ob Zielwert erreichbar ist
  if (req.targetValue <= asymptote) {
    // Zielwert ist unter dem Grenzwert - nicht erreichbar
    return undefined;
  }
  
  // y(t) = y₀ + A * exp(-t/τ) = target
  // t = -τ * ln((target - y₀) / A)
  const diff = req.targetValue - asymptote;
  if (diff <= 0 || diff >= amplitude) {
    return undefined;
  }
  
  const estimatedTimeMs = -tau * Math.log(diff / amplitude);
  const lastTime = req.timeSeries.totalDurationMs;
  const remainingTimeMs = estimatedTimeMs - lastTime;
  
  if (remainingTimeMs < 0) {
    // Bereits erreicht
    return {
      targetValue: req.targetValue,
      estimatedTimeMs: 0,
      estimatedTimeFormatted: 'bereits erreicht',
      confidence: 0.9
    };
  }
  
  // Konfidenz basierend auf R² und Extrapolationsdistanz
  const extrapolationFactor = estimatedTimeMs / lastTime;
  let confidence = analysis.exponentialFit.r2;
  if (extrapolationFactor > 2) confidence *= 0.8;
  if (extrapolationFactor > 5) confidence *= 0.6;
  if (extrapolationFactor > 10) confidence *= 0.4;
  
  return {
    targetValue: req.targetValue,
    estimatedTimeMs: remainingTimeMs,
    estimatedTimeFormatted: formatDuration(remainingTimeMs),
    confidence
  };
}
```

### 5.4 Anomalie-Erkennung

```typescript
// utils/timeseries/anomalyDetection.ts

function detectAnomalies(timeSeries: RGATimeSeries, masses: number[]): TimeSeriesAnomaly[] {
  const anomalies: TimeSeriesAnomaly[] = [];
  
  for (const mass of masses) {
    const points = timeSeries.getTimeSeriesForMass(mass);
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1].value;
      const curr = points[i].value;
      const change = (curr - prev) / prev;
      
      // Plötzlicher Anstieg (>50% in einem Scan)
      if (change > 0.5) {
        anomalies.push({
          scanIndex: points[i].scanIndex,
          timestamp: points[i].timestamp,
          mass,
          type: 'sudden_rise',
          severity: change > 2 ? 'critical' : 'warning',
          description: `${getGasNameForMass(mass)} stieg plötzlich um ${(change * 100).toFixed(0)}%`,
          previousValue: prev,
          currentValue: curr,
          changePercent: change * 100
        });
      }
      
      // Plötzlicher Abfall (>50%)
      if (change < -0.5) {
        anomalies.push({
          scanIndex: points[i].scanIndex,
          timestamp: points[i].timestamp,
          mass,
          type: 'sudden_drop',
          severity: 'warning',
          description: `${getGasNameForMass(mass)} fiel plötzlich um ${(Math.abs(change) * 100).toFixed(0)}%`,
          previousValue: prev,
          currentValue: curr,
          changePercent: change * 100
        });
      }
    }
  }
  
  // Sortiere nach Zeitpunkt
  anomalies.sort((a, b) => a.scanIndex - b.scanIndex);
  
  return anomalies;
}
```

---

## 6. Export-Erweiterungen

### 6.1 CSV Export mit allen Scans

```typescript
// utils/export/timeSeriesCSV.ts

function exportTimeSeriesCSV(timeSeries: RGATimeSeries, selectedMasses: number[]): string {
  const rows: string[] = [];
  
  // Header
  const header = [
    'Scan',
    'Timestamp',
    'Relative_Time_s',
    ...selectedMasses.map(m => `m${m}_${getGasNameForMass(m)}_A`)
  ];
  rows.push(header.join(';'));
  
  // Daten
  for (const scan of timeSeries.scans) {
    const row = [
      scan.index + 1,
      scan.timestamp.toISOString(),
      (scan.relativeTimeMs / 1000).toFixed(1),
      ...selectedMasses.map(m => {
        const value = scan.data.get(m) ?? 0;
        return value.toExponential(4);
      })
    ];
    rows.push(row.join(';'));
  }
  
  return rows.join('\n');
}
```

### 6.2 PDF mit Trend-Chart

Erweiterung des bestehenden PDF-Exports:

```typescript
// Zusätzliche Seite für Zeitreihen-Analyse
function addTimeSeriesPageToPDF(
  doc: jsPDF, 
  timeSeries: RGATimeSeries,
  trendAnalyses: TrendAnalysis[]
) {
  doc.addPage();
  
  // Titel
  doc.setFontSize(16);
  doc.text('Zeitreihen-Analyse', 20, 20);
  
  // Metadaten
  doc.setFontSize(10);
  doc.text(`Scans: ${timeSeries.scanCount}`, 20, 35);
  doc.text(`Dauer: ${formatDuration(timeSeries.totalDurationMs)}`, 80, 35);
  doc.text(`Zeitraum: ${timeSeries.globalStartTime.toLocaleString()} - ${timeSeries.globalEndTime.toLocaleString()}`, 20, 42);
  
  // Trend-Chart als Bild (aus Canvas/SVG gerendert)
  const chartImage = renderTrendChartToImage(timeSeries);
  doc.addImage(chartImage, 'PNG', 20, 50, 170, 80);
  
  // Trend-Analysen Tabelle
  let yPos = 140;
  doc.setFontSize(12);
  doc.text('Trend-Zusammenfassung', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(9);
  
  for (const analysis of trendAnalyses) {
    const trendSymbol = {
      rising: '↑',
      falling: '↓',
      stable: '→',
      fluctuating: '↔'
    }[analysis.trend];
    
    doc.text(
      `${analysis.gasName} (m${analysis.mass}): ${trendSymbol} ${analysis.changePercent.toFixed(1)}%` +
      (analysis.exponentialFit ? ` | τ = ${analysis.exponentialFit.tauFormatted}` : ''),
      20,
      yPos
    );
    yPos += 6;
  }
}
```

---

## 7. Performance-Optimierung

### 7.1 Lazy Loading für große Dateien

```typescript
// Für Dateien mit >100 Scans: Nur Metadaten + ausgewählte Massen laden

interface LazyTimeSeriesLoader {
  // Schnelles Laden: Nur Metadaten und Zeitstempel
  loadMetadata(file: File): Promise<{
    scanCount: number;
    timestamps: Date[];
    totalDurationMs: number;
  }>;
  
  // On-Demand: Bestimmte Scans laden
  loadScans(file: File, scanIndices: number[]): Promise<RGAScan[]>;
  
  // On-Demand: Zeitreihe für eine Masse
  loadMassTimeSeries(file: File, mass: number): Promise<TimeSeriesPoint[]>;
}
```

### 7.2 Downsampling für Visualisierung

```typescript
// Für >500 Punkte: Downsampling für flüssige Charts

function downsampleTimeSeries(
  points: TimeSeriesPoint[], 
  maxPoints: number = 500
): TimeSeriesPoint[] {
  if (points.length <= maxPoints) return points;
  
  // Largest-Triangle-Three-Buckets (LTTB) Algorithmus
  // Erhält visuelle Form besser als einfaches Sampling
  return lttbDownsample(points, maxPoints);
}

// LTTB Implementation
function lttbDownsample(data: TimeSeriesPoint[], threshold: number): TimeSeriesPoint[] {
  // ... LTTB Algorithmus
  // https://github.com/sveinn-steinarsson/flot-downsample
}
```

### 7.3 Web Worker für Parsing

```typescript
// Für Dateien >5MB: Parsing in Web Worker

// worker/parseWorker.ts
self.onmessage = async (e: MessageEvent<{ content: string }>) => {
  const result = parseASCFileMultiScan(e.data.content);
  self.postMessage(result);
};

// Nutzung
async function parseInWorker(file: File): Promise<ParseResult> {
  const content = await file.text();
  
  if (content.length > 5_000_000) {
    // Web Worker für große Dateien
    return new Promise((resolve) => {
      const worker = new Worker('/worker/parseWorker.js');
      worker.onmessage = (e) => {
        resolve(e.data);
        worker.terminate();
      };
      worker.postMessage({ content });
    });
  }
  
  // Direkt parsen für kleine Dateien
  return parseASCFileMultiScan(content);
}
```

---

## 8. Internationalisierung

### Neue i18n Keys

```json
// de.json
{
  "timeseries": {
    "title": "Zeitreihen-Analyse",
    "scans": "Scans",
    "duration": "Dauer",
    "trendChart": "Trend-Chart",
    "spectrumView": "Spektrum-Ansicht",
    "play": "Abspielen",
    "pause": "Pause",
    "speed": "Tempo",
    "scan": "Scan",
    "of": "von",
    "masses": "Massen",
    "trend": {
      "rising": "steigend",
      "falling": "fallend",
      "stable": "stabil",
      "fluctuating": "schwankend"
    },
    "analysis": {
      "title": "Trend-Analyse",
      "start": "Start",
      "end": "Ende",
      "min": "Min",
      "max": "Max",
      "change": "Änderung",
      "timeConstant": "Zeitkonstante τ",
      "fitQuality": "Fit-Güte R²",
      "forecast": "Prognose",
      "reachedIn": "erreicht in"
    },
    "anomaly": {
      "suddenRise": "Plötzlicher Anstieg",
      "suddenDrop": "Plötzlicher Abfall",
      "detected": "Anomalie erkannt"
    }
  }
}

// en.json  
{
  "timeseries": {
    "title": "Time Series Analysis",
    "scans": "Scans",
    "duration": "Duration",
    "trendChart": "Trend Chart",
    "spectrumView": "Spectrum View",
    "play": "Play",
    "pause": "Pause",
    "speed": "Speed",
    "scan": "Scan",
    "of": "of",
    "masses": "Masses",
    "trend": {
      "rising": "rising",
      "falling": "falling",
      "stable": "stable",
      "fluctuating": "fluctuating"
    },
    "analysis": {
      "title": "Trend Analysis",
      "start": "Start",
      "end": "End",
      "min": "Min",
      "max": "Max",
      "change": "Change",
      "timeConstant": "Time constant τ",
      "fitQuality": "Fit quality R²",
      "forecast": "Forecast",
      "reachedIn": "reached in"
    },
    "anomaly": {
      "suddenRise": "Sudden rise",
      "suddenDrop": "Sudden drop",
      "detected": "Anomaly detected"
    }
  }
}
```

---

## 9. Implementierungs-Reihenfolge

### Phase 1: MVP (Kern-Funktionalität)

| # | Task | Aufwand | Abhängigkeiten |
|---|------|---------|----------------|
| 1.1 | Parser erweitern: Alle Scans extrahieren | 4h | - |
| 1.2 | Datenmodell: RGATimeSeries Interface | 2h | 1.1 |
| 1.3 | Store erweitern: TimeSeriesState | 2h | 1.2 |
| 1.4 | TimeSeriesIndicator Komponente | 1h | 1.3 |
| 1.5 | TrendChart Komponente (D3.js) | 6h | 1.3 |
| 1.6 | SpectrumSlider Komponente | 3h | 1.3 |
| 1.7 | TimeSeriesView (Modal/Page) | 4h | 1.5, 1.6 |
| 1.8 | Integration in Haupt-App | 2h | 1.7 |

**Geschätzt: ~24h**

### Phase 2: Analyse

| # | Task | Aufwand | Abhängigkeiten |
|---|------|---------|----------------|
| 2.1 | Trend-Berechnung (Δ%, min/max) | 2h | Phase 1 |
| 2.2 | Exponentieller Fit | 4h | 2.1 |
| 2.3 | TrendAnalysisCard Komponente | 2h | 2.2 |
| 2.4 | Prognose-Funktion | 3h | 2.2 |
| 2.5 | Anomalie-Erkennung | 3h | 2.1 |
| 2.6 | i18n Integration | 2h | 2.3 |

**Geschätzt: ~16h**

### Phase 3: Export & Performance

| # | Task | Aufwand | Abhängigkeiten |
|---|------|---------|----------------|
| 3.1 | CSV Export mit allen Scans | 2h | Phase 1 |
| 3.2 | PDF Erweiterung (Trend-Seite) | 4h | Phase 2 |
| 3.3 | Animierter HTML Export Erweiterung | 4h | Phase 2 |
| 3.4 | Downsampling (LTTB) | 3h | Phase 1 |
| 3.5 | Web Worker für große Dateien | 4h | Phase 1 |
| 3.6 | Lazy Loading | 4h | 3.5 |

**Geschätzt: ~21h**

---

## 10. Test-Szenarien

### Unit Tests

```typescript
// tests/timeseries/parser.test.ts
describe('Multi-Scan Parser', () => {
  it('should extract all scans from .asc file', async () => {
    const content = await readFile('test-data/5-scans.asc');
    const { timeSeries } = parseASCFileMultiScan(content);
    
    expect(timeSeries).not.toBeNull();
    expect(timeSeries!.scanCount).toBe(5);
  });
  
  it('should parse timestamps correctly', () => {
    const ts = parseQuaderaTimestamp('12.3.2024 12:54:00.782');
    expect(ts.getFullYear()).toBe(2024);
    expect(ts.getMonth()).toBe(2); // März = 2
    expect(ts.getDate()).toBe(12);
    expect(ts.getHours()).toBe(12);
    expect(ts.getMinutes()).toBe(54);
    expect(ts.getSeconds()).toBe(0);
    expect(ts.getMilliseconds()).toBe(782);
  });
  
  it('should calculate relative times correctly', () => {
    const { timeSeries } = parseASCFileMultiScan(content);
    
    expect(timeSeries!.scans[0].relativeTimeMs).toBe(0);
    expect(timeSeries!.scans[1].relativeTimeMs).toBeCloseTo(3.5 * 60 * 1000, -2);
  });
});

// tests/timeseries/trendAnalysis.test.ts
describe('Trend Analysis', () => {
  it('should detect falling trend', () => {
    const analysis = analyzeTrend(mockTimeSeries, 18); // H₂O
    expect(analysis.trend).toBe('falling');
    expect(analysis.changePercent).toBeLessThan(0);
  });
  
  it('should fit exponential decay', () => {
    const analysis = analyzeTrend(mockTimeSeriesDecay, 18);
    expect(analysis.exponentialFit).toBeDefined();
    expect(analysis.exponentialFit!.r2).toBeGreaterThan(0.9);
  });
});
```

### E2E Tests

```typescript
// tests/e2e/timeseries.spec.ts
describe('Time Series Feature', () => {
  it('should show indicator for multi-scan files', async () => {
    await uploadFile('5-scans.asc');
    await expect(page.locator('[data-testid="timeseries-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="timeseries-indicator"]')).toContainText('5 Scans');
  });
  
  it('should open timeseries view on indicator click', async () => {
    await uploadFile('5-scans.asc');
    await page.click('[data-testid="timeseries-indicator"]');
    await expect(page.locator('[data-testid="timeseries-view"]')).toBeVisible();
  });
  
  it('should play through scans', async () => {
    await uploadFile('5-scans.asc');
    await page.click('[data-testid="timeseries-indicator"]');
    await page.click('[data-testid="play-button"]');
    
    // Warte auf Scan-Wechsel
    await page.waitForTimeout(2000);
    const scanText = await page.locator('[data-testid="current-scan"]').textContent();
    expect(scanText).not.toBe('Scan 1 / 5');
  });
});
```

---

## 11. Offene Fragen / Entscheidungen

| # | Frage | Optionen | Empfehlung |
|---|-------|----------|------------|
| 1 | Wo Zeitreihen-View platzieren? | Modal / Separate Route / Tab | **Modal** - einfacher, kein Router-Umbau |
| 2 | Standard-Massen für Trend-Chart? | H₂, H₂O, N₂ / Top 5 Peaks / User wählt | **H₂, H₂O, N₂** als Default, User kann ändern |
| 3 | Automatisch Zeitreihen-Modus? | Immer fragen / Auto wenn >1 Scan / Toggle | **Auto mit Indikator** - User klickt wenn gewünscht |
| 4 | Prognose-Zielwert? | Fix 10⁻¹⁰ / User Input / Aus Limit-Profil | **User Input** mit Vorschlag aus Profil |

---

## 12. Referenzen

- Beispiel-Datei: `PA050234_Vakuumkammer_1_24_h_pump_after_bakeout_1250_V_20C_6_4e-8mbar.asc` (5 Scans, 14 min)
- D3.js Line Chart: https://d3-graph-gallery.com/graph/line_basic.html
- LTTB Downsampling: https://github.com/sveinn-steinarsson/flot-downsample
- Exponential Fit: https://mathworld.wolfram.com/LeastSquaresFittingExponential.html

---

*Spezifikation erstellt: Januar 2026*
*Für: RGA Analyser App*
*Autor: Claude*
