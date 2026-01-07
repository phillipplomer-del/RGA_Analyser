# Performance Guide

## Übersicht

Dieses Dokument definiert Performance-Strategien für die RGA Analyser App bei großen Datenmengen: Web Worker, Downsampling, Virtualisierung und Lazy Loading.

---

## 1. Performance-Anforderungen

### 1.1 Zielmetriken

| Metrik | Ziel | Akzeptabel | Kritisch |
|--------|------|------------|----------|
| **Time to Interactive** | < 2s | < 5s | > 10s |
| **Datei-Parse** | < 1s/MB | < 3s/MB | > 5s/MB |
| **Chart-Render** | < 100ms | < 500ms | > 1s |
| **UI-Responsiveness** | 60 fps | 30 fps | < 15 fps |
| **Memory Usage** | < 200 MB | < 500 MB | > 1 GB |

### 1.2 Datenmengen-Szenarien

| Szenario | Datenpunkte | Erwartete Performance |
|----------|-------------|----------------------|
| **Klein** | < 1.000 | Sofort, keine Optimierung nötig |
| **Mittel** | 1.000 - 10.000 | Schnell, minimale Optimierung |
| **Groß** | 10.000 - 100.000 | Worker + Downsampling nötig |
| **Sehr groß** | > 100.000 | Alle Strategien erforderlich |

### 1.3 Typische Dateigrößen

| Quelle | Punkte | Dateigröße |
|--------|--------|------------|
| RGA Spektrum | ~200 (Massen) | ~5-20 KB |
| Rate-of-Rise (1h, 1s) | 3.600 | ~100-200 KB |
| Rate-of-Rise (24h, 1s) | 86.400 | ~2-3 MB |
| Zeitreihe (50 Massen, 1000 Scans) | 50.000 | ~2-5 MB |
| Langzeit-Monitoring (1 Woche) | ~600.000 | ~20-50 MB |

---

## 2. Web Worker

### 2.1 Wann Worker verwenden?

| Task | Ohne Worker | Mit Worker |
|------|-------------|------------|
| Datei parsen (< 1 MB) | ✓ OK | Optional |
| Datei parsen (> 1 MB) | ✗ Blockiert UI | ✓ Erforderlich |
| Lineare Regression | ✓ OK | Optional |
| Robuste Regression (RANSAC) | ✗ Blockiert UI | ✓ Erforderlich |
| Peak-Erkennung (< 10k) | ✓ OK | Optional |
| Peak-Erkennung (> 10k) | ✗ Blockiert UI | ✓ Erforderlich |

### 2.2 Worker-Architektur

```
┌─────────────────┐     ┌──────────────────┐
│   Main Thread   │────▶│   Worker Pool    │
│   (React UI)    │◀────│                  │
└─────────────────┘     │  ┌────────────┐  │
                        │  │ Parser     │  │
                        │  │ Worker     │  │
                        │  └────────────┘  │
                        │  ┌────────────┐  │
                        │  │ Analysis   │  │
                        │  │ Worker     │  │
                        │  └────────────┘  │
                        └──────────────────┘
```

### 2.3 Worker Implementation

#### Parser Worker

```typescript
// src/workers/parser.worker.ts
import { ParseResult, ParserOptions } from '../types';

// Worker Context
const ctx: Worker = self as unknown as Worker;

// Message Handler
ctx.onmessage = async (event: MessageEvent) => {
  const { type, payload, id } = event.data;
  
  try {
    switch (type) {
      case 'PARSE_CSV':
        const result = await parseCSV(payload.content, payload.options);
        ctx.postMessage({ type: 'PARSE_COMPLETE', payload: result, id });
        break;
        
      case 'PARSE_ASC':
        const ascResult = await parseASC(payload.content, payload.options);
        ctx.postMessage({ type: 'PARSE_COMPLETE', payload: ascResult, id });
        break;
        
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    ctx.postMessage({ 
      type: 'ERROR', 
      payload: { message: error.message, stack: error.stack },
      id 
    });
  }
};

// Parser mit Progress-Callback
async function parseCSV(
  content: string, 
  options: ParserOptions
): Promise<ParseResult> {
  const lines = content.split('\n');
  const total = lines.length;
  const data: DataPoint[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    // Progress alle 1000 Zeilen
    if (i % 1000 === 0) {
      ctx.postMessage({ 
        type: 'PROGRESS', 
        payload: { current: i, total, percent: (i / total) * 100 }
      });
      
      // Yield to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    const parsed = parseLine(lines[i], options);
    if (parsed) data.push(parsed);
  }
  
  return { success: true, data, stats: { totalLines: total, parsedLines: data.length } };
}
```

#### Worker Hook

```typescript
// src/hooks/useWorker.ts
import { useCallback, useEffect, useRef, useState } from 'react';

interface WorkerState<T> {
  result: T | null;
  error: Error | null;
  isLoading: boolean;
  progress: number;
}

export function useWorker<T>(
  workerFactory: () => Worker
): {
  state: WorkerState<T>;
  execute: (type: string, payload: unknown) => Promise<T>;
  cancel: () => void;
} {
  const workerRef = useRef<Worker | null>(null);
  const [state, setState] = useState<WorkerState<T>>({
    result: null,
    error: null,
    isLoading: false,
    progress: 0
  });
  
  // Worker initialisieren
  useEffect(() => {
    workerRef.current = workerFactory();
    
    return () => {
      workerRef.current?.terminate();
    };
  }, [workerFactory]);
  
  // Execute
  const execute = useCallback((type: string, payload: unknown): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not initialized'));
        return;
      }
      
      setState(s => ({ ...s, isLoading: true, progress: 0, error: null }));
      
      const id = Date.now().toString();
      
      const handleMessage = (event: MessageEvent) => {
        if (event.data.id !== id && event.data.type !== 'PROGRESS') return;
        
        switch (event.data.type) {
          case 'PROGRESS':
            setState(s => ({ ...s, progress: event.data.payload.percent }));
            break;
            
          case 'PARSE_COMPLETE':
          case 'ANALYSIS_COMPLETE':
            setState(s => ({ ...s, result: event.data.payload, isLoading: false, progress: 100 }));
            workerRef.current?.removeEventListener('message', handleMessage);
            resolve(event.data.payload);
            break;
            
          case 'ERROR':
            const error = new Error(event.data.payload.message);
            setState(s => ({ ...s, error, isLoading: false }));
            workerRef.current?.removeEventListener('message', handleMessage);
            reject(error);
            break;
        }
      };
      
      workerRef.current.addEventListener('message', handleMessage);
      workerRef.current.postMessage({ type, payload, id });
    });
  }, []);
  
  // Cancel
  const cancel = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = workerFactory();
    setState(s => ({ ...s, isLoading: false }));
  }, [workerFactory]);
  
  return { state, execute, cancel };
}
```

#### Worker Pool

```typescript
// src/workers/workerPool.ts
export class WorkerPool {
  private workers: Worker[] = [];
  private queue: Task[] = [];
  private activeCount = 0;
  
  constructor(
    private workerFactory: () => Worker,
    private maxWorkers: number = navigator.hardwareConcurrency || 4
  ) {
    // Pre-create workers
    for (let i = 0; i < this.maxWorkers; i++) {
      this.workers.push(this.workerFactory());
    }
  }
  
  async execute<T>(type: string, payload: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ type, payload, resolve, reject });
      this.processQueue();
    });
  }
  
  private processQueue() {
    while (this.queue.length > 0 && this.activeCount < this.maxWorkers) {
      const task = this.queue.shift()!;
      const worker = this.workers[this.activeCount];
      this.activeCount++;
      
      const handleMessage = (event: MessageEvent) => {
        this.activeCount--;
        worker.removeEventListener('message', handleMessage);
        
        if (event.data.type === 'ERROR') {
          task.reject(new Error(event.data.payload.message));
        } else {
          task.resolve(event.data.payload);
        }
        
        this.processQueue();
      };
      
      worker.addEventListener('message', handleMessage);
      worker.postMessage({ type: task.type, payload: task.payload });
    }
  }
  
  terminate() {
    this.workers.forEach(w => w.terminate());
    this.workers = [];
  }
}
```

---

## 3. Downsampling

### 3.1 Wann Downsampling verwenden?

| Datenpunkte | Chart-Punkte | Algorithmus |
|-------------|--------------|-------------|
| < 1.000 | Alle | Keiner |
| 1.000 - 5.000 | Alle | Keiner |
| 5.000 - 20.000 | ~2.000 | LTTB |
| > 20.000 | ~2.000 | LTTB |

### 3.2 LTTB (Largest Triangle Three Buckets)

Der beste Algorithmus für Zeitreihen - erhält visuelle Form.

```typescript
// src/utils/downsampling.ts

interface Point {
  x: number;
  y: number;
}

/**
 * LTTB Downsampling
 * Reduziert Datenpunkte unter Erhaltung der visuellen Form
 * 
 * @param data Original-Daten
 * @param threshold Ziel-Anzahl Punkte
 * @returns Reduzierte Daten
 */
export function downsampleLTTB<T extends Point>(data: T[], threshold: number): T[] {
  if (threshold >= data.length || threshold <= 2) {
    return data;
  }
  
  const sampled: T[] = [];
  
  // Erster Punkt immer behalten
  sampled.push(data[0]);
  
  // Bucket-Größe
  const bucketSize = (data.length - 2) / (threshold - 2);
  
  let prevIndex = 0;
  
  for (let i = 0; i < threshold - 2; i++) {
    // Bucket-Grenzen
    const bucketStart = Math.floor((i + 1) * bucketSize) + 1;
    const bucketEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, data.length - 1);
    
    // Durchschnitt des nächsten Buckets (für Dreieck-Berechnung)
    const nextBucketStart = Math.floor((i + 2) * bucketSize) + 1;
    const nextBucketEnd = Math.min(Math.floor((i + 3) * bucketSize) + 1, data.length);
    
    let avgX = 0, avgY = 0;
    for (let j = nextBucketStart; j < nextBucketEnd; j++) {
      avgX += data[j].x;
      avgY += data[j].y;
    }
    avgX /= (nextBucketEnd - nextBucketStart) || 1;
    avgY /= (nextBucketEnd - nextBucketStart) || 1;
    
    // Punkt mit größtem Dreieck finden
    let maxArea = -1;
    let maxIndex = bucketStart;
    
    const prevPoint = data[prevIndex];
    
    for (let j = bucketStart; j < bucketEnd; j++) {
      // Dreiecksfläche (vereinfacht)
      const area = Math.abs(
        (prevPoint.x - avgX) * (data[j].y - prevPoint.y) -
        (prevPoint.x - data[j].x) * (avgY - prevPoint.y)
      );
      
      if (area > maxArea) {
        maxArea = area;
        maxIndex = j;
      }
    }
    
    sampled.push(data[maxIndex]);
    prevIndex = maxIndex;
  }
  
  // Letzter Punkt immer behalten
  sampled.push(data[data.length - 1]);
  
  return sampled;
}
```

### 3.3 Min-Max Downsampling

Schneller, aber weniger genau - gut für Preview.

```typescript
/**
 * Min-Max Downsampling
 * Für jedes Bucket: Min und Max behalten
 */
export function downsampleMinMax<T extends Point>(data: T[], threshold: number): T[] {
  if (threshold >= data.length) return data;
  
  const bucketSize = Math.ceil(data.length / (threshold / 2));
  const sampled: T[] = [];
  
  for (let i = 0; i < data.length; i += bucketSize) {
    const bucket = data.slice(i, i + bucketSize);
    
    let min = bucket[0];
    let max = bucket[0];
    
    for (const point of bucket) {
      if (point.y < min.y) min = point;
      if (point.y > max.y) max = point;
    }
    
    // Min vor Max (nach X sortiert)
    if (min.x <= max.x) {
      sampled.push(min, max);
    } else {
      sampled.push(max, min);
    }
  }
  
  return sampled;
}
```

### 3.4 Adaptives Downsampling

Je nach Zoom-Level unterschiedliche Auflösung.

```typescript
interface AdaptiveDownsamplingOptions {
  minPoints: number;      // Minimum bei voller Ansicht
  maxPoints: number;      // Maximum bei vollem Zoom
  zoomLevel: number;      // 0 = voll, 1 = voller Zoom
}

export function adaptiveDownsample<T extends Point>(
  data: T[],
  options: AdaptiveDownsamplingOptions
): T[] {
  const { minPoints, maxPoints, zoomLevel } = options;
  
  // Lineare Interpolation zwischen min und max
  const targetPoints = Math.round(
    minPoints + (maxPoints - minPoints) * zoomLevel
  );
  
  return downsampleLTTB(data, Math.min(targetPoints, data.length));
}
```

### 3.5 Chart mit automatischem Downsampling

```typescript
// src/components/OptimizedChart.tsx
function OptimizedChart({ data, width }: { data: Point[]; width: number }) {
  // Maximal sinnvolle Punkte = Pixelbreite
  const maxVisiblePoints = Math.min(width * 2, 2000);
  
  const downsampledData = useMemo(() => {
    if (data.length <= maxVisiblePoints) {
      return data;
    }
    return downsampleLTTB(data, maxVisiblePoints);
  }, [data, maxVisiblePoints]);
  
  // Original-Punkte-Count für Info
  const compressionRatio = data.length / downsampledData.length;
  
  return (
    <>
      <LineChart data={downsampledData} />
      {compressionRatio > 1 && (
        <div className="chart-info">
          {data.length.toLocaleString()} Punkte → {downsampledData.length.toLocaleString()} 
          ({(compressionRatio).toFixed(1)}× komprimiert)
        </div>
      )}
    </>
  );
}
```

---

## 4. Virtualisierung

### 4.1 Wann Virtualisierung verwenden?

| Element | Threshold | Strategie |
|---------|-----------|-----------|
| Tabellen-Zeilen | > 100 | react-window |
| Listen-Items | > 50 | react-window |
| Chart-Punkte | > 5.000 | Canvas statt SVG |
| DOM-Elemente gesamt | > 1.000 | Lazy Rendering |

### 4.2 Virtualisierte Tabelle

```typescript
// src/components/VirtualizedTable.tsx
import { FixedSizeList } from 'react-window';

interface VirtualizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowHeight: number;
  height: number;
}

export function VirtualizedTable<T>({ 
  data, 
  columns, 
  rowHeight, 
  height 
}: VirtualizedTableProps<T>) {
  // Row Renderer
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const row = data[index];
    
    return (
      <div style={style} className="virtual-table-row">
        {columns.map(col => (
          <div 
            key={String(col.key)} 
            className="virtual-table-cell"
            style={{ width: col.width }}
          >
            {col.render ? col.render(row[col.key], row, index) : String(row[col.key])}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="virtual-table">
      {/* Header (nicht virtualisiert) */}
      <div className="virtual-table-header">
        {columns.map(col => (
          <div 
            key={String(col.key)} 
            className="virtual-table-header-cell"
            style={{ width: col.width }}
          >
            {col.header}
          </div>
        ))}
      </div>
      
      {/* Body (virtualisiert) */}
      <FixedSizeList
        height={height}
        width="100%"
        itemCount={data.length}
        itemSize={rowHeight}
      >
        {Row}
      </FixedSizeList>
    </div>
  );
}
```

### 4.3 Canvas-Chart statt SVG

SVG wird bei vielen Elementen langsam. Canvas ist schneller.

```typescript
// src/components/CanvasChart.tsx
import { useEffect, useRef } from 'react';

interface CanvasChartProps {
  data: Point[];
  width: number;
  height: number;
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
}

export function CanvasChart({ data, width, height, xScale, yScale }: CanvasChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // High DPI Support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    // Clear
    ctx.clearRect(0, 0, width, height);
    
    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = '#0097E0';
    ctx.lineWidth = 1.5;
    
    for (let i = 0; i < data.length; i++) {
      const x = xScale(data[i].x);
      const y = yScale(data[i].y);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    
  }, [data, width, height, xScale, yScale]);
  
  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className="canvas-chart"
    />
  );
}
```

### 4.4 Hybrides Rendering

SVG für Interaktion, Canvas für Daten.

```typescript
// src/components/HybridChart.tsx
export function HybridChart({ data, width, height }) {
  return (
    <div className="hybrid-chart" style={{ position: 'relative', width, height }}>
      {/* Canvas Layer: Daten (schnell) */}
      <CanvasChart 
        data={data}
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
      
      {/* SVG Layer: Achsen & Interaktion */}
      <svg 
        width={width} 
        height={height}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      >
        <Axes />
        <Tooltip />
      </svg>
      
      {/* Interaktions-Layer (transparent) */}
      <div 
        className="interaction-layer"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      />
    </div>
  );
}
```

---

## 5. Lazy Loading

### 5.1 Code Splitting

```typescript
// src/App.tsx
import { lazy, Suspense } from 'react';

// Lazy Load Feature-Komponenten
const SpectrumView = lazy(() => import('./views/SpectrumView'));
const TimeSeriesView = lazy(() => import('./views/TimeSeriesView'));
const RateOfRiseView = lazy(() => import('./views/RateOfRiseView'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/spectrum" element={<SpectrumView />} />
        <Route path="/timeseries" element={<TimeSeriesView />} />
        <Route path="/rateofrise" element={<RateOfRiseView />} />
      </Routes>
    </Suspense>
  );
}
```

### 5.2 Daten Lazy Loading

```typescript
// Daten erst laden wenn Tab sichtbar
function LazyDataSection({ loadData, children }) {
  const [data, setData] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !data) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, [data]);
  
  // Daten laden wenn sichtbar
  useEffect(() => {
    if (isVisible && !data) {
      loadData().then(setData);
    }
  }, [isVisible, data, loadData]);
  
  return (
    <div ref={ref}>
      {data ? children(data) : <Skeleton />}
    </div>
  );
}
```

### 5.3 Progressive Loading

Erst grobe Daten, dann Details.

```typescript
function ProgressiveChart({ file }) {
  const [resolution, setResolution] = useState<'preview' | 'full'>('preview');
  const [previewData, setPreviewData] = useState(null);
  const [fullData, setFullData] = useState(null);
  
  useEffect(() => {
    // Schritt 1: Schnelle Preview (jede 100. Zeile)
    parsePreview(file).then(data => {
      setPreviewData(data);
    });
    
    // Schritt 2: Volle Daten im Hintergrund
    parseFull(file).then(data => {
      setFullData(data);
      setResolution('full');
    });
  }, [file]);
  
  const data = resolution === 'full' ? fullData : previewData;
  
  return (
    <>
      {data ? <Chart data={data} /> : <Skeleton />}
      {resolution === 'preview' && fullData === null && (
        <div className="loading-indicator">Lade vollständige Daten...</div>
      )}
    </>
  );
}
```

---

## 6. Memory Management

### 6.1 Speicher-Budgets

| Komponente | Max Speicher | Strategie |
|------------|--------------|-----------|
| Geladene Dateien | 100 MB | LRU Cache |
| Chart-Daten | 50 MB | Downsampling |
| Undo-History | 20 MB | Begrenzte Tiefe |
| Worker | 100 MB pro Worker | Terminieren nach Task |

### 6.2 LRU Cache für Dateien

```typescript
// src/utils/lruCache.ts
export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;
  private currentSize = 0;
  private sizeCalculator: (value: V) => number;
  
  constructor(
    maxSize: number,
    sizeCalculator: (value: V) => number = () => 1
  ) {
    this.maxSize = maxSize;
    this.sizeCalculator = sizeCalculator;
  }
  
  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }
  
  set(key: K, value: V): void {
    const size = this.sizeCalculator(value);
    
    // Entferne alte Einträge wenn nötig
    while (this.currentSize + size > this.maxSize && this.cache.size > 0) {
      const [oldestKey] = this.cache.keys();
      const oldValue = this.cache.get(oldestKey)!;
      this.currentSize -= this.sizeCalculator(oldValue);
      this.cache.delete(oldestKey);
    }
    
    // Lösche wenn Key existiert
    if (this.cache.has(key)) {
      this.currentSize -= this.sizeCalculator(this.cache.get(key)!);
      this.cache.delete(key);
    }
    
    this.cache.set(key, value);
    this.currentSize += size;
  }
  
  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }
  
  get size(): number {
    return this.currentSize;
  }
}

// Verwendung
const fileCache = new LRUCache<string, ParsedFile>(
  100 * 1024 * 1024,  // 100 MB
  (file) => JSON.stringify(file).length  // Grobe Größenschätzung
);
```

### 6.3 Memory Cleanup

```typescript
// Cleanup bei Komponenten-Unmount
function useCleanup(cleanupFn: () => void) {
  useEffect(() => {
    return () => {
      cleanupFn();
    };
  }, [cleanupFn]);
}

// Beispiel: Worker terminieren
function AnalysisComponent() {
  const workerRef = useRef<Worker | null>(null);
  
  useCleanup(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
  });
  
  // ...
}
```

### 6.4 Memory Monitoring (Dev)

```typescript
// src/utils/memoryMonitor.ts (nur Development)
export function logMemoryUsage(label: string) {
  if (process.env.NODE_ENV !== 'development') return;
  
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log(`[Memory: ${label}]`, {
      usedJSHeapSize: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      totalJSHeapSize: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      jsHeapSizeLimit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
    });
  }
}

// Verwendung
logMemoryUsage('After file load');
logMemoryUsage('After analysis');
```

---

## 7. Profiling & Optimierung

### 7.1 Performance Marks

```typescript
// src/utils/performance.ts
export function measureAsync<T>(
  name: string, 
  fn: () => Promise<T>
): Promise<T> {
  const startMark = `${name}-start`;
  const endMark = `${name}-end`;
  
  performance.mark(startMark);
  
  return fn().then(result => {
    performance.mark(endMark);
    performance.measure(name, startMark, endMark);
    
    const measure = performance.getEntriesByName(name)[0];
    console.log(`[Perf] ${name}: ${measure.duration.toFixed(2)}ms`);
    
    return result;
  });
}

// Verwendung
const data = await measureAsync('parseFile', () => parseCSV(content));
```

### 7.2 React Profiling

```tsx
// Profiler Wrapper
import { Profiler } from 'react';

function onRenderCallback(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) {
  console.log(`[React Profiler: ${id}]`, {
    phase,
    actualDuration: `${actualDuration.toFixed(2)}ms`,
    baseDuration: `${baseDuration.toFixed(2)}ms`
  });
}

function ProfiledChart({ data }) {
  return (
    <Profiler id="Chart" onRender={onRenderCallback}>
      <Chart data={data} />
    </Profiler>
  );
}
```

### 7.3 Rendering-Optimierung

```tsx
// Memoization
const MemoizedChart = memo(Chart, (prevProps, nextProps) => {
  // Nur re-rendern wenn Daten sich ändern
  return prevProps.data === nextProps.data;
});

// useMemo für teure Berechnungen
const processedData = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// useCallback für Event Handlers
const handleClick = useCallback((point: Point) => {
  selectPoint(point);
}, [selectPoint]);
```

---

## 8. Bundle-Optimierung

### 8.1 Chunk Splitting

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor Chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-d3': ['d3'],
          'vendor-pdf': ['jspdf'],
          
          // Feature Chunks
          'feature-spectrum': ['./src/views/SpectrumView.tsx'],
          'feature-timeseries': ['./src/views/TimeSeriesView.tsx'],
          'feature-rateofrise': ['./src/views/RateOfRiseView.tsx'],
        }
      }
    }
  }
});
```

### 8.2 Tree Shaking

```typescript
// ❌ Importiert gesamte Bibliothek
import * as d3 from 'd3';

// ✅ Importiert nur benötigte Module
import { scaleLinear, scaleLog } from 'd3-scale';
import { line } from 'd3-shape';
import { select } from 'd3-selection';
```

### 8.3 Bundle-Analyse

```bash
# Vite Bundle Analyzer
npx vite-bundle-visualizer
```

---

## 9. Implementierungs-Checkliste

### Phase 1: Worker-Setup
- [ ] Parser Worker erstellen
- [ ] Analysis Worker erstellen
- [ ] Worker Hook implementieren
- [ ] Worker Pool (optional)

### Phase 2: Downsampling
- [ ] LTTB implementieren
- [ ] Adaptives Downsampling
- [ ] In Chart integrieren

### Phase 3: Virtualisierung
- [ ] react-window einrichten
- [ ] VirtualizedTable
- [ ] Canvas-Chart (optional)

### Phase 4: Lazy Loading
- [ ] Code Splitting
- [ ] Lazy Feature-Loading
- [ ] Progressive Loading

### Phase 5: Optimierung
- [ ] Memory Management
- [ ] Bundle-Optimierung
- [ ] Performance Monitoring

---

## 10. Performance-Checkliste (Runtime)

Vor jedem Release prüfen:

- [ ] Datei-Parse < 3s für 10 MB
- [ ] Chart-Render < 500ms für 10k Punkte
- [ ] UI bleibt responsiv während Berechnung
- [ ] Memory steigt nicht unbegrenzt
- [ ] Keine Memory Leaks bei Navigation
- [ ] Bundle < 500 KB (gzipped)
- [ ] TTI < 3s auf durchschnittlicher Hardware

---

*Spezifikation erstellt: Januar 2026*
*Für: RGA Analyser App*
