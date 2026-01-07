# Druckanstiegstest (Rate-of-Rise) Feature Spezifikation

## Übersicht

### Motivation
Der Druckanstiegstest (Rate-of-Rise, RoR) ist eine fundamentale Methode zur Leckratenbestimmung in Vakuumsystemen. Die Methode ist einfach aber aussagekräftig:

1. System auf Basisdruck evakuieren
2. Pumpe absperren (Ventil schließen)
3. Druckanstieg über Zeit messen
4. Aus dp/dt die Leckrate berechnen: **Q = V × dp/dt**

### Anwendungsfälle
- **Leckratenbestimmung** ohne He-Lecksuchgerät
- **Unterscheidung** reales Leck vs. virtuelles Leck vs. Ausgasung
- **Akzeptanztest** für Vakuumkammern und -komponenten
- **Dokumentation** für Qualitätssicherung

### Scope
- **Phase 1 (MVP)**: Parser + Chart + dp/dt Berechnung + Leckrate
- **Phase 2**: Automatische Klassifikation + Fit-Modelle
- **Phase 3**: Multi-Sensor + Vergleich + erweiterte Reports

---

## 1. Datenformat-Analyse

### 1.1 Pfeiffer TPG362 CSV Format

```csv
sep=;
Hersteller:;Pfeiffer-Vacuum
Gerät:;TPG362
Artikelnummer:;PT G28 290
Seriennummer:;44992684
Firmware Version:;010500
Dateiname:;OIPT LA_20250319_061831.csv
Datum / Zeit:;2025-03-19  06:18
Messintervall:;10s
Sensor 1:;PKR
Sensor 2:;KEIN SENSOR


Datum;Zeit;Sensor 1 [mBar];Sensor 2 [mBar];
2025-03-19;06:18:35;4,0333e-08;0,0000e+00;
2025-03-19;06:18:45;4,0351e-08;0,0000e+00;
...
```

### 1.2 Format-Spezifikation

| Feld | Zeile | Format | Beispiel |
|------|-------|--------|----------|
| Separator | 1 | `sep=;` | - |
| Hersteller | 2 | String | `Pfeiffer-Vacuum` |
| Gerät | 3 | String | `TPG362` |
| Artikelnummer | 4 | String | `PT G28 290` |
| Seriennummer | 5 | Integer | `44992684` |
| Firmware | 6 | String | `010500` |
| Dateiname | 7 | String | `OIPT LA_20250319_061831.csv` |
| Datum/Zeit | 8 | `YYYY-MM-DD  HH:MM` | `2025-03-19  06:18` |
| Messintervall | 9 | `Ns` | `10s` |
| Sensor 1 | 10 | String | `PKR`, `IKR`, `CMR`, etc. |
| Sensor 2 | 11 | String | `PKR`, `KEIN SENSOR`, etc. |
| Header | 14 | CSV Header | `Datum;Zeit;Sensor 1 [mBar];...` |
| Daten | 15+ | CSV | `2025-03-19;06:18:35;4,0333e-08;...` |

### 1.3 Sensortypen (TPG362)

| Kürzel | Typ | Bereich |
|--------|-----|---------|
| PKR | Pirani/Kaltkathode Kombi | 5×10⁻⁹ ... 1000 mbar |
| IKR | Kaltkathode (Inverted Magnetron) | 2×10⁻⁹ ... 10⁻² mbar |
| CMR | Kapazitiv (Baratron) | 10⁻⁴ ... 1100 mbar |
| TPR | Pirani | 5×10⁻⁴ ... 1000 mbar |
| PPT | Piezo/Pirani | 5×10⁻⁴ ... 1000 mbar |

### 1.4 Beispiel-Messung Analyse

Datei: `Rohdaten_Druckanstieg_OIPT_LA_20250319_061831.csv`

| Parameter | Wert |
|-----------|------|
| Datenpunkte | 1051 |
| Dauer | 2h 55min (10510s) |
| Intervall | 10s |
| Basisdruck (p₀) | 4.03×10⁻⁸ mbar |
| Enddruck (p_end) | 3.62×10⁻⁵ mbar |
| Δp | 3.58×10⁻⁵ mbar |
| Ventil geschlossen | Zeile 35 (06:21:55) |
| **dp/dt (linear)** | **~3.4×10⁻⁹ mbar/s** |

---

## 2. Datenmodell (TypeScript)

### 2.1 Interfaces

```typescript
// Geräte-Metadaten
interface TPGMetadata {
  manufacturer: string;           // "Pfeiffer-Vacuum"
  device: string;                 // "TPG362"
  articleNumber: string;          // "PT G28 290"
  serialNumber: string;           // "44992684"
  firmwareVersion: string;        // "010500"
  filename: string;               // Original-Dateiname
  recordingStart: Date;           // Aufnahmestart
  measurementInterval: number;    // Sekunden (z.B. 10)
  sensor1Type: SensorType;        // PKR, IKR, CMR, etc.
  sensor2Type: SensorType | null; // Optional
}

type SensorType = 'PKR' | 'IKR' | 'CMR' | 'TPR' | 'PPT' | 'APR' | 'MPT' | 'RPT' | 'UNKNOWN';

// Einzelner Datenpunkt
interface PressureDataPoint {
  index: number;
  timestamp: Date;
  relativeTimeS: number;          // Sekunden seit Start
  pressure1: number;              // mbar (Sensor 1)
  pressure2: number | null;       // mbar (Sensor 2, optional)
}

// Rate-of-Rise Datensatz
interface RateOfRiseData {
  metadata: TPGMetadata;
  dataPoints: PressureDataPoint[];
  
  // Abgeleitete Werte
  duration: number;               // Sekunden
  minPressure: number;            // mbar
  maxPressure: number;            // mbar
  pointCount: number;
}

// Analyse-Ergebnis
interface RateOfRiseAnalysis {
  // Automatisch erkannte Phasen
  baselinePhase: {
    startIndex: number;
    endIndex: number;
    meanPressure: number;         // p₀
    stdDev: number;
    duration: number;             // Sekunden
  };
  
  risePhase: {
    startIndex: number;
    endIndex: number;
    startPressure: number;
    endPressure: number;
    duration: number;             // Sekunden
  };
  
  // Berechnete Werte
  dpdt: number;                   // mbar/s (Hauptergebnis)
  dpdtUnit: string;               // "mbar/s" oder "mbar·l/s"
  
  // Linearer Fit: p(t) = p₀ + dpdt × t
  linearFit: {
    slope: number;                // dp/dt
    intercept: number;            // p₀
    r2: number;                   // Bestimmtheitsmaß
    residualStdDev: number;       // Standardabweichung der Residuen
  };
  
  // Leckrate (wenn Volumen angegeben)
  leakRate?: {
    volume: number;               // Liter
    Q: number;                    // mbar·l/s
    QFormatted: string;           // z.B. "3.4×10⁻⁸ mbar·l/s"
    equivalentHeLeak?: number;    // Umrechnung auf He (Faktor ~2.7)
  };
  
  // Klassifikation
  classification: RoRClassification;
  
  // Grenzwert-Prüfung
  limitCheck?: {
    limit: number;                // mbar·l/s
    limitSource: string;          // z.B. "GSI UHV", "User defined"
    passed: boolean;
    margin: number;               // Faktor (Q/limit)
  };
}

// Klassifikation des Druckanstiegs
type RoRClassification = {
  type: 'real_leak' | 'virtual_leak' | 'outgassing' | 'mixed' | 'unknown';
  confidence: number;             // 0-1
  description: string;
  evidence: string[];
  recommendations: string[];
};

// Verschiedene Fit-Modelle
interface FitModels {
  // Linear: p(t) = p₀ + a×t
  linear: {
    p0: number;
    a: number;                    // dp/dt
    r2: number;
  };
  
  // Logarithmisch (virtuelles Leck): p(t) = p₀ + a×ln(1 + t/τ)
  logarithmic?: {
    p0: number;
    a: number;
    tau: number;                  // Zeitkonstante
    r2: number;
  };
  
  // Exponentiell (Ausgasung): p(t) = p_inf - (p_inf - p₀)×exp(-t/τ)
  exponential?: {
    p0: number;
    pInf: number;                 // Asymptote
    tau: number;
    r2: number;
  };
  
  // Bester Fit
  bestModel: 'linear' | 'logarithmic' | 'exponential';
}
```

### 2.2 Store (Zustand)

```typescript
interface RateOfRiseState {
  // Daten
  data: RateOfRiseData | null;
  isLoading: boolean;
  error: string | null;
  
  // Analyse
  analysis: RateOfRiseAnalysis | null;
  fitModels: FitModels | null;
  
  // User Inputs
  chamberVolume: number | null;   // Liter
  leakRateLimit: number | null;   // mbar·l/s
  limitSource: string;            // "GSI UHV", "CERN", "Custom"
  
  // UI State
  selectedRange: {
    start: number;                // Index
    end: number;
  } | null;
  showFitLine: boolean;
  showBaselinePhase: boolean;
  showRisePhase: boolean;
  chartScale: 'linear' | 'log';
  
  // Actions
  loadFile: (file: File) => Promise<void>;
  setVolume: (volume: number) => void;
  setLimit: (limit: number, source: string) => void;
  setSelectedRange: (start: number, end: number) => void;
  recalculate: () => void;
  exportPDF: () => Promise<Blob>;
  exportCSV: () => string;
}
```

---

## 3. Parser

### 3.1 TPG362 CSV Parser

```typescript
// utils/parsers/tpg362Parser.ts

interface ParseResult {
  success: boolean;
  data?: RateOfRiseData;
  error?: string;
}

function parseTPG362CSV(content: string): ParseResult {
  try {
    const lines = content.split(/\r?\n/);
    
    // Mindestens Header + 1 Datenpunkt
    if (lines.length < 16) {
      return { success: false, error: 'Datei zu kurz' };
    }
    
    // Separator prüfen
    if (!lines[0].includes('sep=;')) {
      return { success: false, error: 'Ungültiges Format: sep=; erwartet' };
    }
    
    // Metadaten parsen
    const metadata = parseMetadata(lines);
    
    // Daten-Header finden (Zeile mit "Datum;Zeit;")
    const headerIndex = lines.findIndex(line => 
      line.startsWith('Datum;Zeit;')
    );
    
    if (headerIndex === -1) {
      return { success: false, error: 'Daten-Header nicht gefunden' };
    }
    
    // Datenpunkte parsen
    const dataPoints: PressureDataPoint[] = [];
    let firstTimestamp: Date | null = null;
    
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith(';')) continue;
      
      const point = parseDataLine(line, i - headerIndex - 1);
      if (point) {
        if (!firstTimestamp) {
          firstTimestamp = point.timestamp;
        }
        point.relativeTimeS = (point.timestamp.getTime() - firstTimestamp.getTime()) / 1000;
        dataPoints.push(point);
      }
    }
    
    if (dataPoints.length < 10) {
      return { success: false, error: 'Zu wenige Datenpunkte' };
    }
    
    // Abgeleitete Werte
    const pressures = dataPoints.map(p => p.pressure1).filter(p => p > 0);
    
    const data: RateOfRiseData = {
      metadata,
      dataPoints,
      duration: dataPoints[dataPoints.length - 1].relativeTimeS,
      minPressure: Math.min(...pressures),
      maxPressure: Math.max(...pressures),
      pointCount: dataPoints.length
    };
    
    return { success: true, data };
    
  } catch (e) {
    return { 
      success: false, 
      error: `Parser-Fehler: ${e instanceof Error ? e.message : 'Unbekannt'}` 
    };
  }
}

function parseMetadata(lines: string[]): TPGMetadata {
  const getValue = (line: string): string => {
    const parts = line.split(';');
    return parts[1]?.trim() || '';
  };
  
  const getLineValue = (prefix: string): string => {
    const line = lines.find(l => l.startsWith(prefix));
    return line ? getValue(line) : '';
  };
  
  // Messintervall parsen (z.B. "10s" -> 10)
  const intervalStr = getLineValue('Messintervall:');
  const interval = parseInt(intervalStr.replace(/[^\d]/g, '')) || 10;
  
  // Datum parsen
  const dateStr = getLineValue('Datum / Zeit:');
  const recordingStart = parseDateTimeString(dateStr);
  
  // Sensor-Typ parsen
  const sensor1Str = getLineValue('Sensor 1:');
  const sensor2Str = getLineValue('Sensor 2:');
  
  return {
    manufacturer: getLineValue('Hersteller:'),
    device: getLineValue('Gerät:') || getLineValue('Geraet:'),
    articleNumber: getLineValue('Artikelnummer:'),
    serialNumber: getLineValue('Seriennummer:'),
    firmwareVersion: getLineValue('Firmware Version:'),
    filename: getLineValue('Dateiname:'),
    recordingStart,
    measurementInterval: interval,
    sensor1Type: parseSensorType(sensor1Str),
    sensor2Type: sensor2Str && !sensor2Str.includes('KEIN') 
      ? parseSensorType(sensor2Str) 
      : null
  };
}

function parseDataLine(line: string, index: number): PressureDataPoint | null {
  // Format: 2025-03-19;06:18:35;4,0333e-08;0,0000e+00;
  const parts = line.split(';');
  
  if (parts.length < 3) return null;
  
  const dateStr = parts[0].trim();      // 2025-03-19
  const timeStr = parts[1].trim();      // 06:18:35
  const pressure1Str = parts[2].trim(); // 4,0333e-08
  const pressure2Str = parts[3]?.trim(); // 0,0000e+00
  
  // Timestamp parsen
  const timestamp = parseDateTime(dateStr, timeStr);
  if (!timestamp) return null;
  
  // Druck parsen (deutsches Format: Komma als Dezimaltrenner)
  const pressure1 = parseGermanFloat(pressure1Str);
  const pressure2 = pressure2Str ? parseGermanFloat(pressure2Str) : null;
  
  if (isNaN(pressure1)) return null;
  
  return {
    index,
    timestamp,
    relativeTimeS: 0, // Wird später berechnet
    pressure1,
    pressure2: pressure2 && pressure2 > 0 ? pressure2 : null
  };
}

function parseGermanFloat(str: string): number {
  // "4,0333e-08" -> 4.0333e-08
  return parseFloat(str.replace(',', '.'));
}

function parseDateTime(dateStr: string, timeStr: string): Date | null {
  // dateStr: "2025-03-19"
  // timeStr: "06:18:35"
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute, second] = timeStr.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute, second);
  } catch {
    return null;
  }
}

function parseDateTimeString(str: string): Date {
  // "2025-03-19  06:18" -> Date
  const match = str.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
  if (!match) return new Date();
  
  const [, year, month, day, hour, minute] = match;
  return new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hour),
    parseInt(minute)
  );
}

function parseSensorType(str: string): SensorType {
  const upper = str.toUpperCase();
  if (upper.includes('PKR')) return 'PKR';
  if (upper.includes('IKR')) return 'IKR';
  if (upper.includes('CMR')) return 'CMR';
  if (upper.includes('TPR')) return 'TPR';
  if (upper.includes('PPT')) return 'PPT';
  if (upper.includes('APR')) return 'APR';
  if (upper.includes('MPT')) return 'MPT';
  if (upper.includes('RPT')) return 'RPT';
  return 'UNKNOWN';
}
```

---

## 4. Analyse-Algorithmen

### 4.1 Automatische Phasenerkennung

```typescript
// utils/analysis/phaseDetection.ts

interface PhaseDetectionResult {
  baselinePhase: { start: number; end: number };
  risePhase: { start: number; end: number };
  transitionIndex: number;
}

/**
 * Erkennt automatisch Baseline und Anstiegsphase
 * 
 * Algorithmus:
 * 1. Sliding Window für lokale Standardabweichung
 * 2. Baseline = Phase mit niedriger Varianz
 * 3. Transition = Punkt wo Steigung > Threshold
 */
function detectPhases(data: PressureDataPoint[]): PhaseDetectionResult {
  const pressures = data.map(p => p.pressure1);
  const n = pressures.length;
  
  // Parameter
  const windowSize = Math.min(20, Math.floor(n / 10));
  const slopeThreshold = 1e-10; // mbar/s - abhängig von Druckbereich
  
  // 1. Berechne lokale Statistiken
  const localStats: { mean: number; std: number; slope: number }[] = [];
  
  for (let i = 0; i < n - windowSize; i++) {
    const window = pressures.slice(i, i + windowSize);
    const mean = window.reduce((a, b) => a + b, 0) / windowSize;
    const variance = window.reduce((a, b) => a + (b - mean) ** 2, 0) / windowSize;
    const std = Math.sqrt(variance);
    
    // Lokale Steigung (lineare Regression im Fenster)
    const times = data.slice(i, i + windowSize).map(p => p.relativeTimeS);
    const slope = linearRegressionSlope(times, window);
    
    localStats.push({ mean, std, slope });
  }
  
  // 2. Finde Transition (erster Punkt mit signifikanter Steigung)
  let transitionIndex = 0;
  const baselineStd = localStats.slice(0, windowSize).reduce((a, b) => a + b.std, 0) / windowSize;
  
  for (let i = windowSize; i < localStats.length; i++) {
    const stat = localStats[i];
    
    // Kriterium: Steigung > Threshold UND Druck steigt deutlich über Baseline
    if (stat.slope > slopeThreshold && stat.mean > localStats[0].mean * 1.5) {
      transitionIndex = i;
      break;
    }
  }
  
  // Falls keine Transition gefunden, nehme ersten 10% als Baseline
  if (transitionIndex === 0) {
    transitionIndex = Math.floor(n * 0.1);
  }
  
  // 3. Verfeinere Baseline-Ende (letzter stabiler Punkt vor Transition)
  let baselineEnd = transitionIndex;
  for (let i = transitionIndex; i > windowSize; i--) {
    if (localStats[i].std < baselineStd * 2) {
      baselineEnd = i;
      break;
    }
  }
  
  return {
    baselinePhase: { start: 0, end: baselineEnd },
    risePhase: { start: transitionIndex, end: n - 1 },
    transitionIndex
  };
}

function linearRegressionSlope(x: number[], y: number[]): number {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
}
```

### 4.2 dp/dt Berechnung (Lineare Regression)

```typescript
// utils/analysis/linearFit.ts

interface LinearFitResult {
  slope: number;        // dp/dt in mbar/s
  intercept: number;    // p₀ in mbar
  r2: number;           // R² (0-1)
  residualStdDev: number;
  dataPoints: number;
}

/**
 * Lineare Regression: p(t) = p₀ + (dp/dt) × t
 */
function fitLinear(data: PressureDataPoint[], startIndex: number, endIndex: number): LinearFitResult {
  const subset = data.slice(startIndex, endIndex + 1);
  const n = subset.length;
  
  if (n < 3) {
    throw new Error('Mindestens 3 Datenpunkte für linearen Fit erforderlich');
  }
  
  const x = subset.map(p => p.relativeTimeS);
  const y = subset.map(p => p.pressure1);
  
  // Summen
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
  
  const meanX = sumX / n;
  const meanY = sumY / n;
  
  // Steigung und Achsenabschnitt
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = meanY - slope * meanX;
  
  // R² (Bestimmtheitsmaß)
  const ssRes = y.reduce((sum, yi, i) => {
    const predicted = intercept + slope * x[i];
    return sum + (yi - predicted) ** 2;
  }, 0);
  
  const ssTot = y.reduce((sum, yi) => sum + (yi - meanY) ** 2, 0);
  const r2 = 1 - ssRes / ssTot;
  
  // Residuen-Standardabweichung
  const residualStdDev = Math.sqrt(ssRes / (n - 2));
  
  return {
    slope,
    intercept,
    r2,
    residualStdDev,
    dataPoints: n
  };
}
```

### 4.3 Leckraten-Berechnung

```typescript
// utils/analysis/leakRate.ts

interface LeakRateResult {
  dpdt: number;           // mbar/s
  volume: number;         // L
  Q: number;              // mbar·L/s
  QFormatted: string;     // z.B. "3.4×10⁻⁸ mbar·L/s"
  Q_Pa: number;           // Pa·m³/s (SI)
  Q_PaFormatted: string;
  equivalentHeLeak: number;  // mbar·L/s (He-äquivalent)
}

/**
 * Berechnet Leckrate aus dp/dt und Volumen
 * 
 * Q = V × dp/dt
 * 
 * Einheiten:
 * - V in Liter
 * - dp/dt in mbar/s
 * - Q in mbar·L/s
 */
function calculateLeakRate(dpdt: number, volumeLiters: number): LeakRateResult {
  const Q = volumeLiters * dpdt;
  
  // Umrechnung in SI (Pa·m³/s)
  // 1 mbar·L = 0.1 Pa·m³
  const Q_Pa = Q * 0.1;
  
  // Äquivalente He-Leckrate
  // He diffundiert ca. 2.7× schneller als Luft (√(M_air/M_He) ≈ √(29/4) ≈ 2.7)
  const equivalentHeLeak = Q * 2.7;
  
  return {
    dpdt,
    volume: volumeLiters,
    Q,
    QFormatted: formatScientific(Q, 'mbar·L/s'),
    Q_Pa,
    Q_PaFormatted: formatScientific(Q_Pa, 'Pa·m³/s'),
    equivalentHeLeak
  };
}

function formatScientific(value: number, unit: string): string {
  if (value === 0) return `0 ${unit}`;
  
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = value / Math.pow(10, exponent);
  
  // Unicode Superscript-Zeichen
  const superscript = (n: number): string => {
    const chars = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    return Math.abs(n).toString().split('').map(d => chars[parseInt(d)]).join('');
  };
  
  const sign = exponent < 0 ? '⁻' : '';
  return `${mantissa.toFixed(2)}×10${sign}${superscript(exponent)} ${unit}`;
}
```

### 4.4 Klassifikation

```typescript
// utils/analysis/classification.ts

/**
 * Klassifiziert den Druckanstieg
 * 
 * Reales Leck:
 * - Linearer Anstieg (R² > 0.99)
 * - dp/dt konstant über Zeit
 * 
 * Virtuelles Leck:
 * - Logarithmischer Anstieg (flacht ab)
 * - Oft: eingeschlossenes Volumen, O-Ring-Spalte
 * 
 * Ausgasung:
 * - Exponentieller Anstieg → Sättigung
 * - Nach Bakeout oder neuen Komponenten
 * 
 * Mixed:
 * - Überlagerung von Leck + Ausgasung
 */
function classifyRiseType(
  data: PressureDataPoint[],
  linearFit: LinearFitResult,
  risePhase: { start: number; end: number }
): RoRClassification {
  const evidence: string[] = [];
  const recommendations: string[] = [];
  
  // Fit verschiedene Modelle
  const subset = data.slice(risePhase.start, risePhase.end + 1);
  
  // Test 1: Linearität (R²)
  const r2 = linearFit.r2;
  evidence.push(`Linearer Fit R² = ${(r2 * 100).toFixed(1)}%`);
  
  // Test 2: Steigungsänderung über Zeit
  const firstHalf = subset.slice(0, Math.floor(subset.length / 2));
  const secondHalf = subset.slice(Math.floor(subset.length / 2));
  
  const slope1 = calculateLocalSlope(firstHalf);
  const slope2 = calculateLocalSlope(secondHalf);
  const slopeRatio = slope2 / slope1;
  
  evidence.push(`Steigungsverhältnis (2. Hälfte / 1. Hälfte) = ${slopeRatio.toFixed(2)}`);
  
  // Test 3: Residuen-Analyse (systematische Abweichung?)
  const residualTrend = analyzeResidualTrend(subset, linearFit);
  
  // Entscheidungslogik
  let type: RoRClassification['type'];
  let confidence: number;
  let description: string;
  
  if (r2 > 0.995 && slopeRatio > 0.9 && slopeRatio < 1.1) {
    // Sehr linear → Reales Leck
    type = 'real_leak';
    confidence = Math.min(r2, 0.95);
    description = 'Konstanter linearer Druckanstieg deutet auf reales Leck hin';
    recommendations.push('Lecksuche mit He-Lecksuchgerät durchführen');
    recommendations.push('Alle Flansche, Ventile und Durchführungen prüfen');
    
  } else if (slopeRatio < 0.7) {
    // Steigung nimmt ab → Virtuelles Leck oder Ausgasung
    if (residualTrend === 'convex') {
      type = 'virtual_leak';
      confidence = 0.7;
      description = 'Abflachender Druckanstieg deutet auf virtuelles Leck hin';
      recommendations.push('Prüfen auf eingeschlossene Volumina (Blindbohrungen, O-Ring-Nuten)');
      recommendations.push('He-Lecktest sollte negativ sein');
    } else {
      type = 'outgassing';
      confidence = 0.6;
      description = 'Sättigender Druckanstieg deutet auf Ausgasung hin';
      recommendations.push('System ausheizen');
      recommendations.push('Neue Komponenten identifizieren (O-Ringe, Kabel, etc.)');
    }
    
  } else if (r2 < 0.95 && slopeRatio > 0.8) {
    // Mäßig linear mit Rauschen → Mixed oder unbekannt
    type = 'mixed';
    confidence = 0.5;
    description = 'Mischung aus Leck und Ausgasung möglich';
    recommendations.push('Längere Messzeit für bessere Klassifikation');
    recommendations.push('Nach Bakeout erneut messen');
    
  } else {
    type = 'unknown';
    confidence = 0.3;
    description = 'Keine eindeutige Klassifikation möglich';
    recommendations.push('Messung mit längerer Dauer wiederholen');
    recommendations.push('Sensordrift ausschließen');
  }
  
  return {
    type,
    confidence,
    description,
    evidence,
    recommendations
  };
}

function calculateLocalSlope(points: PressureDataPoint[]): number {
  const x = points.map(p => p.relativeTimeS);
  const y = points.map(p => p.pressure1);
  return linearRegressionSlope(x, y);
}

function analyzeResidualTrend(
  points: PressureDataPoint[], 
  fit: LinearFitResult
): 'convex' | 'concave' | 'random' {
  // Berechne Residuen
  const residuals = points.map(p => {
    const predicted = fit.intercept + fit.slope * p.relativeTimeS;
    return p.pressure1 - predicted;
  });
  
  // Prüfe Trend in Residuen
  const n = residuals.length;
  const mid = Math.floor(n / 2);
  
  const firstHalfMean = residuals.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
  const secondHalfMean = residuals.slice(mid).reduce((a, b) => a + b, 0) / (n - mid);
  const middleMean = residuals.slice(Math.floor(n * 0.25), Math.floor(n * 0.75))
    .reduce((a, b) => a + b, 0) / Math.floor(n * 0.5);
  
  // Konvex: Mitte unter Gerade (Residuen negativ in der Mitte)
  if (middleMean < firstHalfMean && middleMean < secondHalfMean) {
    return 'convex';
  }
  
  // Konkav: Mitte über Gerade
  if (middleMean > firstHalfMean && middleMean > secondHalfMean) {
    return 'concave';
  }
  
  return 'random';
}
```

### 4.5 Grenzwert-Prüfung

```typescript
// utils/analysis/limitCheck.ts

interface LeakRateLimit {
  name: string;
  value: number;          // mbar·L/s
  application: string;
  source: string;
}

const STANDARD_LIMITS: LeakRateLimit[] = [
  {
    name: 'GSI UHV (streng)',
    value: 1e-10,
    application: 'Beschleuniger-Strahlrohre',
    source: 'GSI Technical Guideline 7.23e'
  },
  {
    name: 'GSI UHV (standard)',
    value: 1e-9,
    application: 'Standard UHV-Komponenten',
    source: 'GSI Technical Guideline 7.19e'
  },
  {
    name: 'CERN LHC',
    value: 1e-10,
    application: 'LHC Vakuumkammern',
    source: 'CERN Vacuum Acceptance Criteria'
  },
  {
    name: 'HV Standard',
    value: 1e-8,
    application: 'Hochvakuum-Systeme',
    source: 'DIN 28400'
  },
  {
    name: 'Industriell',
    value: 1e-6,
    application: 'Industrielle Vakuumanlagen',
    source: 'Allgemein'
  }
];

function checkLimit(
  Q: number, 
  limitValue: number, 
  limitSource: string
): RateOfRiseAnalysis['limitCheck'] {
  const passed = Q <= limitValue;
  const margin = Q / limitValue;
  
  return {
    limit: limitValue,
    limitSource,
    passed,
    margin
  };
}

function suggestLimit(Q: number): LeakRateLimit {
  // Wähle den nächsten sinnvollen Grenzwert
  for (const limit of STANDARD_LIMITS) {
    if (Q < limit.value * 10) {
      return limit;
    }
  }
  return STANDARD_LIMITS[STANDARD_LIMITS.length - 1];
}
```

---

## 5. UI-Komponenten

### 5.1 Hauptansicht

```tsx
// components/rateofrise/RateOfRiseView.tsx

interface Props {
  onClose?: () => void;
}

function RateOfRiseView({ onClose }: Props) {
  const {
    data,
    analysis,
    chamberVolume,
    leakRateLimit,
    limitSource,
    isLoading,
    error,
    loadFile,
    setVolume,
    setLimit,
    recalculate
  } = useRateOfRiseStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col h-full bg-surface-page">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-surface-card border-b border-border-subtle">
        <div className="flex items-center gap-4">
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-surface-card-muted rounded-lg">
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-lg font-semibold">Druckanstiegstest</h1>
            <p className="text-sm text-text-secondary">Rate-of-Rise Analyse</p>
          </div>
        </div>
        
        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-accent-cyan text-white rounded-lg hover:bg-accent-cyan/90"
        >
          <UploadIcon className="w-5 h-5" />
          <span>CSV laden</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
          className="hidden"
        />
      </header>

      {/* Content */}
      {!data ? (
        <UploadPrompt onUpload={loadFile} />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Main Chart Area */}
          <div className="flex-1 flex flex-col p-4">
            <RoRChart data={data} analysis={analysis} />
            
            {/* Zeitbereich-Selektor */}
            <RangeSelector data={data} />
          </div>
          
          {/* Sidebar */}
          <aside className="w-96 border-l border-border-subtle overflow-y-auto">
            {/* Metadaten */}
            <MetadataCard metadata={data.metadata} />
            
            {/* Eingaben */}
            <InputsCard
              volume={chamberVolume}
              limit={leakRateLimit}
              limitSource={limitSource}
              onVolumeChange={setVolume}
              onLimitChange={setLimit}
            />
            
            {/* Ergebnisse */}
            {analysis && (
              <>
                <ResultsCard analysis={analysis} />
                <ClassificationCard classification={analysis.classification} />
                {analysis.limitCheck && (
                  <LimitCheckCard check={analysis.limitCheck} />
                )}
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
```

### 5.2 Chart-Komponente

```tsx
// components/rateofrise/RoRChart.tsx

interface Props {
  data: RateOfRiseData;
  analysis: RateOfRiseAnalysis | null;
}

function RoRChart({ data, analysis }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [scale, setScale] = useState<'linear' | 'log'>('log');
  const [showFit, setShowFit] = useState(true);
  const [showPhases, setShowPhases] = useState(true);

  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width, height } = svgRef.current.getBoundingClientRect();
    const margin = { top: 20, right: 30, bottom: 50, left: 80 };
    
    svg.selectAll('*').remove();
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, data.duration])
      .range([0, innerWidth]);
    
    const yScale = scale === 'log'
      ? d3.scaleLog()
          .domain([data.minPressure * 0.5, data.maxPressure * 2])
          .range([innerHeight, 0])
      : d3.scaleLinear()
          .domain([0, data.maxPressure * 1.1])
          .range([innerHeight, 0]);
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Phasen-Hintergrund
    if (showPhases && analysis) {
      // Baseline Phase (grün)
      const baselineEnd = data.dataPoints[analysis.baselinePhase.endIndex].relativeTimeS;
      g.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', xScale(baselineEnd))
        .attr('height', innerHeight)
        .attr('fill', 'rgba(0, 224, 151, 0.1)');
      
      // Rise Phase (orange)
      const riseStart = data.dataPoints[analysis.risePhase.startIndex].relativeTimeS;
      g.append('rect')
        .attr('x', xScale(riseStart))
        .attr('y', 0)
        .attr('width', innerWidth - xScale(riseStart))
        .attr('height', innerHeight)
        .attr('fill', 'rgba(224, 80, 0, 0.1)');
    }
    
    // Grid
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat(() => '')
      );
    
    // Datenlinie
    const line = d3.line<PressureDataPoint>()
      .x(d => xScale(d.relativeTimeS))
      .y(d => yScale(d.pressure1));
    
    g.append('path')
      .datum(data.dataPoints)
      .attr('fill', 'none')
      .attr('stroke', '#0097E0')
      .attr('stroke-width', 1.5)
      .attr('d', line);
    
    // Fit-Linie
    if (showFit && analysis) {
      const fit = analysis.linearFit;
      const riseStart = data.dataPoints[analysis.risePhase.startIndex].relativeTimeS;
      const riseEnd = data.dataPoints[analysis.risePhase.endIndex].relativeTimeS;
      
      g.append('line')
        .attr('x1', xScale(riseStart))
        .attr('y1', yScale(fit.intercept + fit.slope * riseStart))
        .attr('x2', xScale(riseEnd))
        .attr('y2', yScale(fit.intercept + fit.slope * riseEnd))
        .attr('stroke', '#E05000')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '6,3');
    }
    
    // Achsen
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => formatTime(d as number));
    
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);
    
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--text-secondary)')
      .text('Zeit');
    
    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => (d as number).toExponential(0));
    
    g.append('g').call(yAxis);
    
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -60)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--text-secondary)')
      .text('Druck [mbar]');
      
  }, [data, analysis, scale, showFit, showPhases]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex bg-surface-card-muted rounded-lg p-1">
          <button
            onClick={() => setScale('linear')}
            className={`px-3 py-1 text-sm rounded ${
              scale === 'linear' ? 'bg-surface-card shadow' : ''
            }`}
          >
            Linear
          </button>
          <button
            onClick={() => setScale('log')}
            className={`px-3 py-1 text-sm rounded ${
              scale === 'log' ? 'bg-surface-card shadow' : ''
            }`}
          >
            Log
          </button>
        </div>
        
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showFit}
            onChange={(e) => setShowFit(e.target.checked)}
          />
          Fit-Linie
        </label>
        
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showPhases}
            onChange={(e) => setShowPhases(e.target.checked)}
          />
          Phasen anzeigen
        </label>
      </div>
      
      {/* Chart */}
      <div className="flex-1 bg-surface-card rounded-xl p-4">
        <svg ref={svgRef} className="w-full h-full" />
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(0)}s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(0)}min`;
  return `${(seconds / 3600).toFixed(1)}h`;
}
```

### 5.3 Ergebnis-Karte

```tsx
// components/rateofrise/ResultsCard.tsx

interface Props {
  analysis: RateOfRiseAnalysis;
}

function ResultsCard({ analysis }: Props) {
  const { linearFit, dpdt, leakRate, baselinePhase, risePhase } = analysis;

  return (
    <div className="p-4 border-b border-border-subtle">
      <h3 className="text-sm font-semibold text-text-secondary mb-4">ERGEBNISSE</h3>
      
      {/* Hauptergebnis: dp/dt */}
      <div className="bg-accent-cyan/10 rounded-xl p-4 mb-4">
        <div className="text-sm text-accent-cyan mb-1">Druckanstiegsrate</div>
        <div className="text-2xl font-bold text-accent-cyan">
          {formatScientific(dpdt, 'mbar/s')}
        </div>
      </div>
      
      {/* Leckrate (wenn Volumen angegeben) */}
      {leakRate && (
        <div className="bg-state-warning/10 rounded-xl p-4 mb-4">
          <div className="text-sm text-state-warning mb-1">
            Leckrate (V = {leakRate.volume} L)
          </div>
          <div className="text-2xl font-bold text-state-warning">
            {leakRate.QFormatted}
          </div>
          <div className="text-xs text-text-muted mt-1">
            ≈ {formatScientific(leakRate.equivalentHeLeak, 'mbar·L/s')} He-äquiv.
          </div>
        </div>
      )}
      
      {/* Fit-Statistik */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-text-secondary">Fit R²</span>
          <span className={linearFit.r2 > 0.99 ? 'text-state-success' : 'text-state-warning'}>
            {(linearFit.r2 * 100).toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Baseline (p₀)</span>
          <span>{baselinePhase.meanPressure.toExponential(2)} mbar</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Baseline-Dauer</span>
          <span>{formatTime(baselinePhase.duration)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Anstiegs-Dauer</span>
          <span>{formatTime(risePhase.duration)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Datenpunkte (Fit)</span>
          <span>{linearFit.dataPoints}</span>
        </div>
      </div>
    </div>
  );
}
```

### 5.4 Klassifikations-Karte

```tsx
// components/rateofrise/ClassificationCard.tsx

interface Props {
  classification: RoRClassification;
}

function ClassificationCard({ classification }: Props) {
  const typeConfig = {
    real_leak: {
      icon: '🕳️',
      label: 'Reales Leck',
      color: 'text-state-danger',
      bgColor: 'bg-state-danger/10'
    },
    virtual_leak: {
      icon: '📦',
      label: 'Virtuelles Leck',
      color: 'text-state-warning',
      bgColor: 'bg-state-warning/10'
    },
    outgassing: {
      icon: '💨',
      label: 'Ausgasung',
      color: 'text-accent-cyan',
      bgColor: 'bg-accent-cyan/10'
    },
    mixed: {
      icon: '🔀',
      label: 'Mischform',
      color: 'text-text-secondary',
      bgColor: 'bg-surface-card-muted'
    },
    unknown: {
      icon: '❓',
      label: 'Unklar',
      color: 'text-text-muted',
      bgColor: 'bg-surface-card-muted'
    }
  };

  const config = typeConfig[classification.type];

  return (
    <div className="p-4 border-b border-border-subtle">
      <h3 className="text-sm font-semibold text-text-secondary mb-4">KLASSIFIKATION</h3>
      
      {/* Typ-Badge */}
      <div className={`${config.bgColor} rounded-xl p-4 mb-4`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <div className={`text-lg font-semibold ${config.color}`}>
              {config.label}
            </div>
            <div className="text-sm text-text-secondary">
              Konfidenz: {(classification.confidence * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
      
      {/* Beschreibung */}
      <p className="text-sm text-text-secondary mb-4">
        {classification.description}
      </p>
      
      {/* Evidenz */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-text-muted mb-2">EVIDENZ</div>
        <ul className="text-xs text-text-secondary space-y-1">
          {classification.evidence.map((e, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-accent-cyan">•</span>
              {e}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Empfehlungen */}
      <div>
        <div className="text-xs font-semibold text-text-muted mb-2">EMPFEHLUNGEN</div>
        <ul className="text-xs text-text-secondary space-y-1">
          {classification.recommendations.map((r, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-state-success">→</span>
              {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

---

## 6. Export

### 6.1 PDF-Report

```typescript
// utils/export/rorPdfExport.ts

async function exportRoRPDF(
  data: RateOfRiseData,
  analysis: RateOfRiseAnalysis,
  chartImage: string  // Base64 PNG
): Promise<Blob> {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('Druckanstiegstest-Protokoll', 20, 20);
  
  // Metadaten
  doc.setFontSize(10);
  doc.text(`Gerät: ${data.metadata.device} (S/N: ${data.metadata.serialNumber})`, 20, 35);
  doc.text(`Datum: ${data.metadata.recordingStart.toLocaleString('de-DE')}`, 20, 42);
  doc.text(`Sensor: ${data.metadata.sensor1Type}`, 20, 49);
  doc.text(`Datei: ${data.metadata.filename}`, 20, 56);
  
  // Chart
  doc.addImage(chartImage, 'PNG', 20, 65, 170, 80);
  
  // Ergebnisse
  doc.setFontSize(14);
  doc.text('Ergebnisse', 20, 155);
  
  doc.setFontSize(10);
  const results = [
    ['Basisdruck (p₀)', `${analysis.baselinePhase.meanPressure.toExponential(2)} mbar`],
    ['Druckanstiegsrate (dp/dt)', formatScientific(analysis.dpdt, 'mbar/s')],
    ['Linearer Fit R²', `${(analysis.linearFit.r2 * 100).toFixed(2)}%`],
    ['Messdauer', formatTime(data.duration)],
    ['Datenpunkte', data.pointCount.toString()]
  ];
  
  if (analysis.leakRate) {
    results.push(
      ['Kammervolumen', `${analysis.leakRate.volume} L`],
      ['Leckrate (Q)', analysis.leakRate.QFormatted]
    );
  }
  
  let y = 165;
  for (const [label, value] of results) {
    doc.text(`${label}:`, 25, y);
    doc.text(value, 100, y);
    y += 7;
  }
  
  // Klassifikation
  y += 10;
  doc.setFontSize(14);
  doc.text('Klassifikation', 20, y);
  
  y += 10;
  doc.setFontSize(10);
  const classLabel = {
    real_leak: 'Reales Leck',
    virtual_leak: 'Virtuelles Leck',
    outgassing: 'Ausgasung',
    mixed: 'Mischform',
    unknown: 'Unklar'
  }[analysis.classification.type];
  
  doc.text(`Typ: ${classLabel}`, 25, y);
  y += 7;
  doc.text(`Konfidenz: ${(analysis.classification.confidence * 100).toFixed(0)}%`, 25, y);
  y += 7;
  doc.text(`Bewertung: ${analysis.classification.description}`, 25, y, { maxWidth: 160 });
  
  // Grenzwert-Prüfung
  if (analysis.limitCheck) {
    y += 20;
    doc.setFontSize(14);
    doc.text('Grenzwert-Prüfung', 20, y);
    
    y += 10;
    doc.setFontSize(12);
    const status = analysis.limitCheck.passed ? 'BESTANDEN ✓' : 'NICHT BESTANDEN ✗';
    doc.setTextColor(analysis.limitCheck.passed ? 0 : 255, analysis.limitCheck.passed ? 150 : 0, 0);
    doc.text(status, 25, y);
    doc.setTextColor(0, 0, 0);
    
    y += 7;
    doc.setFontSize(10);
    doc.text(`Grenzwert: ${analysis.limitCheck.limit.toExponential(0)} mbar·L/s (${analysis.limitCheck.limitSource})`, 25, y);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Erstellt: ${new Date().toLocaleString('de-DE')} | RGA Analyser`,
    20,
    285
  );
  
  return doc.output('blob');
}
```

---

## 7. Internationalisierung

### Neue i18n Keys

```json
{
  "rateOfRise": {
    "title": "Druckanstiegstest",
    "subtitle": "Rate-of-Rise Analyse",
    "upload": {
      "title": "TPG362 CSV laden",
      "hint": "Pfeiffer Vacuum Drucklogger-Daten"
    },
    "params": {
      "title": "Parameter",
      "volume": "Kammervolumen",
      "volumeUnit": "Liter",
      "volumeHint": "Für Leckraten-Berechnung Q = V × dp/dt",
      "limit": "Leckraten-Grenzwert",
      "limitSelect": "Grenzwert wählen...",
      "limitCustom": "Benutzerdefiniert..."
    },
    "results": {
      "title": "Ergebnisse",
      "dpdt": "Druckanstiegsrate",
      "leakRate": "Leckrate",
      "heEquivalent": "He-äquivalent",
      "fitR2": "Fit R²",
      "baseline": "Basisdruck (p₀)",
      "baselineDuration": "Baseline-Dauer",
      "riseDuration": "Anstiegs-Dauer",
      "dataPoints": "Datenpunkte"
    },
    "classification": {
      "title": "Klassifikation",
      "confidence": "Konfidenz",
      "evidence": "Evidenz",
      "recommendations": "Empfehlungen",
      "types": {
        "real_leak": "Reales Leck",
        "virtual_leak": "Virtuelles Leck",
        "outgassing": "Ausgasung",
        "mixed": "Mischform",
        "unknown": "Unklar"
      }
    },
    "limitCheck": {
      "title": "Grenzwert-Prüfung",
      "passed": "Bestanden",
      "failed": "Nicht bestanden",
      "limit": "Grenzwert",
      "factor": "Faktor",
      "belowLimit": "unter Limit",
      "aboveLimit": "über Limit"
    },
    "chart": {
      "linear": "Linear",
      "log": "Logarithmisch",
      "showFit": "Fit-Linie",
      "showPhases": "Phasen anzeigen",
      "pressure": "Druck",
      "time": "Zeit"
    },
    "export": {
      "pdf": "PDF-Protokoll",
      "csv": "CSV-Daten"
    }
  }
}
```

---

## 8. Implementierungs-Plan

### Phase 1: MVP (~20h)

| # | Task | Aufwand |
|---|------|---------|
| 1.1 | TPG362 CSV Parser | 3h |
| 1.2 | Datenmodell & Store | 2h |
| 1.3 | Phasenerkennung | 3h |
| 1.4 | Lineare Regression | 2h |
| 1.5 | Leckraten-Berechnung | 1h |
| 1.6 | RoRChart (D3.js) | 4h |
| 1.7 | InputsCard + ResultsCard | 2h |
| 1.8 | RateOfRiseView (Hauptansicht) | 3h |

### Phase 2: Klassifikation (~12h)

| # | Task | Aufwand |
|---|------|---------|
| 2.1 | Klassifikations-Algorithmus | 4h |
| 2.2 | ClassificationCard | 2h |
| 2.3 | Grenzwert-Prüfung | 2h |
| 2.4 | LimitCheckCard | 2h |
| 2.5 | i18n Integration | 2h |

### Phase 3: Export & Integration (~10h)

| # | Task | Aufwand |
|---|------|---------|
| 3.1 | PDF-Export | 4h |
| 3.2 | CSV-Export | 2h |
| 3.3 | Navigation/Routing | 2h |
| 3.4 | Tests | 2h |

**Gesamt: ~42h**

---

## 9. Referenzen

- Pfeiffer TPG362 Bedienungsanleitung
- GSI Technical Guideline 7.19e (Vacuum Testing)
- GSI Technical Guideline 7.23e (He Leak Testing)
- CERN Vacuum Acceptance Criteria
- Jousten: Handbuch Vakuumtechnik, Kapitel "Lecksuche"

---

*Spezifikation erstellt: Januar 2026*
*Für: RGA Analyser App*
*Autor: Claude*
