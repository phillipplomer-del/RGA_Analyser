# Uncertainty Analysis Spezifikation

## Übersicht

Dieses Dokument definiert die mathematischen Grundlagen und Implementierung der Unsicherheitsrechnung für die RGA Analyser App. Ohne Fehlerangaben sind Messwerte wissenschaftlich wertlos.

---

## 1. Grundlagen

### 1.1 Warum Unsicherheiten?

Eine Messung `Q = 3.4×10⁻⁸ mbar·L/s` ist bedeutungslos ohne Kontext:
- Ist das `3.4 ± 0.1` oder `3.4 ± 2.0`?
- Liegt der Grenzwert (z.B. `1×10⁻⁸`) innerhalb oder außerhalb des Fehlerintervalls?
- Ist die Aussage "Grenzwert überschritten" statistisch signifikant?

### 1.2 Fehlerquellen in der RGA-Analyse

| Quelle | Typ | Typische Größe |
|--------|-----|----------------|
| Sensor-Rauschen | Statistisch | ±1-5% |
| Sensor-Kalibrierung | Systematisch | ±10-30% |
| Temperatureinfluss | Systematisch | ±1%/°C |
| Digitalisierung | Quantisierung | ±0.5 LSB |
| Volumen-Schätzung | User-Input | ±5-50% |
| Fit-Unsicherheit | Statistisch | Variabel |

### 1.3 Notation

| Symbol | Bedeutung |
|--------|-----------|
| x̄ | Mittelwert |
| σ | Standardabweichung |
| σ² | Varianz |
| δx | Absolute Unsicherheit von x |
| δx/x | Relative Unsicherheit |
| CI₉₅ | 95% Konfidenzintervall |

---

## 2. Datenmodell

### 2.1 TypeScript Interfaces

```typescript
// Basis-Unsicherheit
interface UncertainValue {
  value: number;                    // Zentralwert
  uncertainty: number;              // Absolute Unsicherheit (1σ)
  uncertaintyType: 'absolute' | 'relative';
  coverageFactor?: number;          // k-Faktor (default: 1 für 1σ)
}

// Erweiterte Unsicherheit mit Konfidenz
interface MeasurementResult {
  value: number;
  uncertainty: number;              // 1σ (68% CI)
  confidence95: [number, number];   // 95% CI [lower, upper]
  confidence99?: [number, number];  // 99% CI (optional)
  unit: string;
  isSignificant: boolean;           // Signifikant verschieden von 0?
}

// Fit-Ergebnis mit Statistik
interface FitResult {
  // Parameter
  slope: UncertainValue;            // dp/dt oder Steigung
  intercept: UncertainValue;        // Achsenabschnitt
  
  // Güte
  rSquared: number;                 // R² (0-1)
  adjustedRSquared: number;         // Angepasstes R²
  rmse: number;                     // Root Mean Square Error
  chi2: number;                     // Chi-Quadrat
  reducedChi2: number;              // χ²/dof
  
  // Residuen
  residuals: number[];
  standardizedResiduals: number[];
  
  // Freiheitsgrade
  degreesOfFreedom: number;
  
  // P-Wert für Signifikanz
  pValue: number;
}

// Leckraten-Ergebnis
interface LeakRateResult {
  // Druckanstieg
  dpdt: MeasurementResult;
  
  // Leckrate (wenn Volumen bekannt)
  Q?: MeasurementResult;
  
  // Eingabe-Unsicherheiten
  volumeUncertainty?: number;       // Relative Unsicherheit des Volumens
  
  // Klassifikation
  classification: {
    type: string;
    confidence: number;
  };
  
  // Grenzwert-Vergleich
  limitCheck?: {
    limit: number;
    passed: boolean;
    margin: number;                 // Abstand zum Grenzwert in σ
    probability: number;            // P(Q < limit)
  };
}
```

### 2.2 Unsicherheits-Propagation Interface

```typescript
interface UncertaintyPropagation {
  // Eingaben
  inputs: {
    name: string;
    value: number;
    uncertainty: number;
    type: 'measured' | 'estimated' | 'tabulated';
  }[];
  
  // Formel (symbolisch)
  formula: string;                  // z.B. "V * dpdt"
  
  // Partielle Ableitungen (automatisch oder manuell)
  partials: Record<string, number>;
  
  // Ergebnis
  result: MeasurementResult;
  
  // Beiträge zur Gesamtunsicherheit
  contributions: {
    name: string;
    absolute: number;               // Beitrag in absoluten Einheiten
    relative: number;               // Anteil an Gesamtvarianz (%)
  }[];
}
```

---

## 3. Mathematische Methoden

### 3.1 Lineare Regression mit Unsicherheiten

#### Standard Ordinary Least Squares (OLS)

Für `y = a + b·x`:

```typescript
function linearRegression(
  x: number[], 
  y: number[], 
  weights?: number[]
): FitResult {
  const n = x.length;
  
  // Gewichte (default: alle gleich)
  const w = weights ?? Array(n).fill(1);
  const sumW = w.reduce((a, b) => a + b, 0);
  
  // Gewichtete Mittelwerte
  const xMean = w.reduce((sum, wi, i) => sum + wi * x[i], 0) / sumW;
  const yMean = w.reduce((sum, wi, i) => sum + wi * y[i], 0) / sumW;
  
  // Gewichtete Summen
  let Sxx = 0, Syy = 0, Sxy = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - xMean;
    const dy = y[i] - yMean;
    Sxx += w[i] * dx * dx;
    Syy += w[i] * dy * dy;
    Sxy += w[i] * dx * dy;
  }
  
  // Steigung und Achsenabschnitt
  const slope = Sxy / Sxx;
  const intercept = yMean - slope * xMean;
  
  // Residuen
  const residuals = y.map((yi, i) => yi - (intercept + slope * x[i]));
  
  // Residuenvarianz (unbiased)
  const dof = n - 2;  // Freiheitsgrade
  const sse = residuals.reduce((sum, r, i) => sum + w[i] * r * r, 0);
  const mse = sse / dof;
  const rmse = Math.sqrt(mse);
  
  // Standardfehler der Parameter
  const slopeStdErr = Math.sqrt(mse / Sxx);
  const interceptStdErr = Math.sqrt(mse * (1/sumW + xMean*xMean/Sxx));
  
  // R²
  const sst = Syy;
  const rSquared = 1 - sse / sst;
  const adjustedRSquared = 1 - (1 - rSquared) * (n - 1) / dof;
  
  // t-Wert und p-Wert für Steigung
  const tValue = slope / slopeStdErr;
  const pValue = 2 * (1 - tCDF(Math.abs(tValue), dof));
  
  // Chi² (wenn Gewichte = 1/σ²)
  const chi2 = sse;
  const reducedChi2 = chi2 / dof;
  
  // Standardisierte Residuen
  const standardizedResiduals = residuals.map(r => r / rmse);
  
  return {
    slope: {
      value: slope,
      uncertainty: slopeStdErr,
      uncertaintyType: 'absolute'
    },
    intercept: {
      value: intercept,
      uncertainty: interceptStdErr,
      uncertaintyType: 'absolute'
    },
    rSquared,
    adjustedRSquared,
    rmse,
    chi2,
    reducedChi2,
    residuals,
    standardizedResiduals,
    degreesOfFreedom: dof,
    pValue
  };
}
```

#### Konfidenzintervalle

```typescript
function confidenceInterval(
  value: number, 
  stdErr: number, 
  dof: number, 
  confidence: number = 0.95
): [number, number] {
  // t-Quantil für gegebene Konfidenz
  const alpha = 1 - confidence;
  const tCrit = tQuantile(1 - alpha/2, dof);
  
  const margin = tCrit * stdErr;
  return [value - margin, value + margin];
}

// t-Quantil Approximation (für Implementation ohne Bibliothek)
function tQuantile(p: number, dof: number): number {
  // Für große dof: t ≈ z (Normalverteilung)
  if (dof > 100) {
    return normalQuantile(p);
  }
  
  // Approximation nach Abramowitz & Stegun
  const a = 1 / (dof - 0.5);
  const b = 48 / (a * a);
  const c = ((20700 * a / b - 98) * a - 16) * a + 96.36;
  const d = ((94.5 / (b + c) - 3) / b + 1) * Math.sqrt(a * Math.PI / 2) * dof;
  
  const x = normalQuantile(p);
  const y = x * x;
  
  if (dof < 5) {
    c = c + 0.3 * (dof - 4.5) * (x + 0.6);
  }
  
  const z = x * (1 + (((0.05 * d * x - 5) * x - 7) * x - 2) / d +
            ((((0.4 * y + 6.3) * y + 36) * y + 94.5) / c - y - 3) / b);
  
  return z;
}
```

### 3.2 Fehlerfortpflanzung

#### Allgemeine Formel (Gaußsche Fehlerfortpflanzung)

Für `f(x₁, x₂, ..., xₙ)`:

```
δf² = Σᵢ (∂f/∂xᵢ)² · δxᵢ²  +  2·Σᵢ<ⱼ (∂f/∂xᵢ)(∂f/∂xⱼ)·cov(xᵢ,xⱼ)
```

Bei unkorrelierten Variablen (vereinfacht):

```
δf² = Σᵢ (∂f/∂xᵢ)² · δxᵢ²
```

#### Implementation

```typescript
interface PropagationInput {
  value: number;
  uncertainty: number;
  partial: number;  // ∂f/∂xᵢ ausgewertet am Zentralwert
}

function propagateUncertainty(inputs: PropagationInput[]): UncertainValue {
  // Zentralwert (muss separat berechnet werden)
  // Hier nur Unsicherheit
  
  const variance = inputs.reduce((sum, input) => {
    const contribution = input.partial * input.partial * input.uncertainty * input.uncertainty;
    return sum + contribution;
  }, 0);
  
  return {
    value: NaN,  // Muss extern gesetzt werden
    uncertainty: Math.sqrt(variance),
    uncertaintyType: 'absolute'
  };
}

// Beiträge zur Gesamtunsicherheit
function uncertaintyContributions(inputs: PropagationInput[]): {
  name: string;
  contribution: number;
  percentage: number;
}[] {
  const totalVariance = inputs.reduce((sum, input) => {
    return sum + Math.pow(input.partial * input.uncertainty, 2);
  }, 0);
  
  return inputs.map((input, i) => {
    const thisVariance = Math.pow(input.partial * input.uncertainty, 2);
    return {
      name: `x${i}`,
      contribution: Math.sqrt(thisVariance),
      percentage: (thisVariance / totalVariance) * 100
    };
  });
}
```

### 3.3 Spezifische Formeln für RGA Analyser

#### Leckrate Q = V · dp/dt

```typescript
function calculateLeakRateWithUncertainty(
  volume: UncertainValue,
  dpdt: FitResult,
  confidence: number = 0.95
): LeakRateResult {
  const V = volume.value;
  const dV = volume.uncertainty;
  
  const dpdt_val = dpdt.slope.value;
  const dpdt_err = dpdt.slope.uncertainty;
  
  // Q = V · dp/dt
  const Q = V * dpdt_val;
  
  // Partielle Ableitungen
  // ∂Q/∂V = dp/dt
  // ∂Q/∂(dp/dt) = V
  
  // Unsicherheit (unkorreliert angenommen)
  // δQ² = (dp/dt)² · δV² + V² · δ(dp/dt)²
  const dQ_squared = 
    dpdt_val * dpdt_val * dV * dV +
    V * V * dpdt_err * dpdt_err;
  const dQ = Math.sqrt(dQ_squared);
  
  // Relative Beiträge
  const volumeContribution = (dpdt_val * dV) ** 2 / dQ_squared * 100;
  const dpdtContribution = (V * dpdt_err) ** 2 / dQ_squared * 100;
  
  // Konfidenzintervall
  // Kombiniere Unsicherheiten: Welch-Satterthwaite für effektive Freiheitsgrade
  const dof_eff = effectiveDegreesOfFreedom(
    [dV, dpdt_err],
    [dpdt.degreesOfFreedom, dpdt.degreesOfFreedom],  // V hat ∞ dof (Schätzung)
    [dpdt_val, V]
  );
  
  const ci95 = confidenceInterval(Q, dQ, dof_eff, 0.95);
  
  return {
    dpdt: {
      value: dpdt_val,
      uncertainty: dpdt_err,
      confidence95: confidenceInterval(dpdt_val, dpdt_err, dpdt.degreesOfFreedom, 0.95),
      unit: 'mbar/s',
      isSignificant: dpdt.pValue < 0.05
    },
    Q: {
      value: Q,
      uncertainty: dQ,
      confidence95: ci95,
      unit: 'mbar·L/s',
      isSignificant: true  // Q ist definitionsgemäß > 0
    },
    volumeUncertainty: dV / V,
    classification: classifyLeakRate(Q, dQ),
    limitCheck: undefined  // Separat setzen
  };
}

// Welch-Satterthwaite Approximation für effektive Freiheitsgrade
function effectiveDegreesOfFreedom(
  uncertainties: number[],
  dofs: number[],
  sensitivities: number[]
): number {
  // Formel: ν_eff = (Σ cᵢ²uᵢ²)² / Σ (cᵢ²uᵢ²)² / νᵢ
  
  const contributions = uncertainties.map((u, i) => {
    return Math.pow(sensitivities[i] * u, 2);
  });
  
  const totalVariance = contributions.reduce((a, b) => a + b, 0);
  
  const denominator = contributions.reduce((sum, c, i) => {
    return sum + Math.pow(c, 2) / dofs[i];
  }, 0);
  
  return Math.pow(totalVariance, 2) / denominator;
}
```

#### Normierte Intensität

Für RGA: `I_norm = I_peak / I_ref`

```typescript
function normalizedIntensityUncertainty(
  peakIntensity: number,
  peakNoise: number,        // Rauschen/Unsicherheit des Peaks
  refIntensity: number,
  refNoise: number
): UncertainValue {
  // I_norm = I_peak / I_ref
  const ratio = peakIntensity / refIntensity;
  
  // Relative Unsicherheit bei Division:
  // (δf/f)² = (δa/a)² + (δb/b)²
  const relUncertainty = Math.sqrt(
    Math.pow(peakNoise / peakIntensity, 2) +
    Math.pow(refNoise / refIntensity, 2)
  );
  
  return {
    value: ratio,
    uncertainty: ratio * relUncertainty,
    uncertaintyType: 'absolute'
  };
}
```

---

## 4. Robuste Regression

### 4.1 Warum robust?

Standard OLS ist empfindlich gegen Ausreißer. Ein einzelner falscher Datenpunkt kann das Ergebnis stark verfälschen.

### 4.2 Huber-Regression

```typescript
interface HuberRegressionOptions {
  delta: number;        // Huber-Parameter (default: 1.345 für 95% Effizienz)
  maxIterations: number;
  tolerance: number;
}

function huberRegression(
  x: number[],
  y: number[],
  options: HuberRegressionOptions = { delta: 1.345, maxIterations: 50, tolerance: 1e-6 }
): FitResult {
  const n = x.length;
  const { delta, maxIterations, tolerance } = options;
  
  // Initial: OLS
  let result = linearRegression(x, y);
  let prevSlope = result.slope.value;
  
  for (let iter = 0; iter < maxIterations; iter++) {
    // Residuen
    const residuals = y.map((yi, i) => 
      yi - (result.intercept.value + result.slope.value * x[i])
    );
    
    // MAD (Median Absolute Deviation) für Skalierung
    const mad = medianAbsoluteDeviation(residuals);
    const scale = mad / 0.6745;  // Konsistenzfaktor für Normalverteilung
    
    // Huber-Gewichte
    const weights = residuals.map(r => {
      const u = Math.abs(r / scale);
      return u <= delta ? 1 : delta / u;
    });
    
    // Gewichtete Regression
    result = linearRegression(x, y, weights);
    
    // Konvergenz prüfen
    if (Math.abs(result.slope.value - prevSlope) < tolerance) {
      break;
    }
    prevSlope = result.slope.value;
  }
  
  return result;
}

function medianAbsoluteDeviation(values: number[]): number {
  const med = median(values);
  const deviations = values.map(v => Math.abs(v - med));
  return median(deviations);
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}
```

### 4.3 RANSAC (Random Sample Consensus)

```typescript
interface RANSACOptions {
  minSamples: number;       // Mindestpunkte für Fit (2 für linear)
  residualThreshold: number; // Schwelle für Inlier
  maxTrials: number;
  minInliers: number;       // Mindestanzahl Inliers
}

function ransacRegression(
  x: number[],
  y: number[],
  options: RANSACOptions
): { fit: FitResult; inlierMask: boolean[] } {
  const n = x.length;
  const { minSamples, residualThreshold, maxTrials, minInliers } = options;
  
  let bestFit: FitResult | null = null;
  let bestInlierMask: boolean[] = [];
  let bestInlierCount = 0;
  
  for (let trial = 0; trial < maxTrials; trial++) {
    // Zufällige Stichprobe
    const sampleIndices = randomSample(n, minSamples);
    const xSample = sampleIndices.map(i => x[i]);
    const ySample = sampleIndices.map(i => y[i]);
    
    // Fit auf Stichprobe
    const fit = linearRegression(xSample, ySample);
    
    // Alle Residuen berechnen
    const residuals = y.map((yi, i) => 
      Math.abs(yi - (fit.intercept.value + fit.slope.value * x[i]))
    );
    
    // Inliers bestimmen
    const inlierMask = residuals.map(r => r < residualThreshold);
    const inlierCount = inlierMask.filter(Boolean).length;
    
    // Besseres Modell gefunden?
    if (inlierCount > bestInlierCount && inlierCount >= minInliers) {
      bestInlierCount = inlierCount;
      bestInlierMask = inlierMask;
      
      // Refit auf allen Inliers
      const xInliers = x.filter((_, i) => inlierMask[i]);
      const yInliers = y.filter((_, i) => inlierMask[i]);
      bestFit = linearRegression(xInliers, yInliers);
    }
  }
  
  if (!bestFit) {
    throw new Error('RANSAC konnte kein Modell finden');
  }
  
  return { fit: bestFit, inlierMask: bestInlierMask };
}
```

---

## 5. Ausreißer-Erkennung

### 5.1 Z-Score Methode

```typescript
function detectOutliersZScore(
  residuals: number[],
  threshold: number = 3.0
): boolean[] {
  const mean = residuals.reduce((a, b) => a + b, 0) / residuals.length;
  const std = Math.sqrt(
    residuals.reduce((sum, r) => sum + (r - mean) ** 2, 0) / (residuals.length - 1)
  );
  
  return residuals.map(r => Math.abs((r - mean) / std) > threshold);
}
```

### 5.2 IQR-Methode (Robuster)

```typescript
function detectOutliersIQR(
  residuals: number[],
  k: number = 1.5  // Standard: 1.5, Streng: 3.0
): boolean[] {
  const sorted = [...residuals].sort((a, b) => a - b);
  const n = sorted.length;
  
  const q1 = sorted[Math.floor(n * 0.25)];
  const q3 = sorted[Math.floor(n * 0.75)];
  const iqr = q3 - q1;
  
  const lowerBound = q1 - k * iqr;
  const upperBound = q3 + k * iqr;
  
  return residuals.map(r => r < lowerBound || r > upperBound);
}
```

### 5.3 Cook's Distance

```typescript
function detectOutliersCooksDistance(
  x: number[],
  y: number[],
  fit: FitResult,
  threshold?: number  // Default: 4/n
): boolean[] {
  const n = x.length;
  const p = 2;  // Anzahl Parameter (Steigung + Achsenabschnitt)
  const thresh = threshold ?? 4 / n;
  
  // Leverage (Hebelwirkung)
  const xMean = x.reduce((a, b) => a + b, 0) / n;
  const Sxx = x.reduce((sum, xi) => sum + (xi - xMean) ** 2, 0);
  const leverage = x.map(xi => 1/n + (xi - xMean) ** 2 / Sxx);
  
  // Standardisierte Residuen
  const mse = fit.rmse ** 2;
  const stdResiduals = fit.residuals.map((r, i) => 
    r / Math.sqrt(mse * (1 - leverage[i]))
  );
  
  // Cook's Distance
  const cooksD = stdResiduals.map((sr, i) => 
    (sr ** 2 / p) * (leverage[i] / (1 - leverage[i]))
  );
  
  return cooksD.map(d => d > thresh);
}
```

---

## 6. Grenzwert-Vergleich

### 6.1 Ist Grenzwert überschritten?

```typescript
interface LimitComparisonResult {
  value: number;
  limit: number;
  passed: boolean;
  margin: number;           // Abstand in σ
  probability: number;      // P(value < limit)
  conclusion: 'clearly_below' | 'probably_below' | 'uncertain' | 'probably_above' | 'clearly_above';
}

function compareTo Limit(
  measurement: MeasurementResult,
  limit: number
): LimitComparisonResult {
  const { value, uncertainty } = measurement;
  
  // Z-Score: wie viele σ unter/über dem Grenzwert?
  const margin = (limit - value) / uncertainty;
  
  // Wahrscheinlichkeit P(true value < limit)
  // Annahme: Normalverteilung
  const probability = normalCDF(margin);
  
  // Entscheidung
  let conclusion: LimitComparisonResult['conclusion'];
  let passed: boolean;
  
  if (margin > 3) {
    conclusion = 'clearly_below';
    passed = true;
  } else if (margin > 2) {
    conclusion = 'probably_below';
    passed = true;
  } else if (margin > -2) {
    conclusion = 'uncertain';
    passed = margin > 0;  // Zentralwert entscheidet
  } else if (margin > -3) {
    conclusion = 'probably_above';
    passed = false;
  } else {
    conclusion = 'clearly_above';
    passed = false;
  }
  
  return {
    value,
    limit,
    passed,
    margin,
    probability,
    conclusion
  };
}

// Normalverteilungs-CDF Approximation
function normalCDF(x: number): number {
  // Zelen & Severo Approximation
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}
```

### 6.2 Signifikanz-Schwellen

```typescript
const SIGNIFICANCE_THRESHOLDS = {
  // Margin (in σ) für verschiedene Aussagen
  clearlyBelow: 3,      // 99.87% sicher unter Grenzwert
  probablyBelow: 2,     // 97.72% sicher
  uncertain: 0,         // Grenzfall
  probablyAbove: -2,    // 97.72% sicher darüber
  clearlyAbove: -3      // 99.87% sicher
};
```

---

## 7. UI-Integration

### 7.1 Anzeige von Unsicherheiten

```typescript
// Formatierung
function formatWithUncertainty(result: MeasurementResult): string {
  const { value, uncertainty, unit } = result;
  
  // Signifikante Stellen der Unsicherheit bestimmen
  const uncertMagnitude = Math.floor(Math.log10(Math.abs(uncertainty)));
  const valueMagnitude = Math.floor(Math.log10(Math.abs(value)));
  
  // Wissenschaftliche Notation wenn nötig
  if (valueMagnitude < -3 || valueMagnitude > 4) {
    const exponent = valueMagnitude;
    const mantissa = value / Math.pow(10, exponent);
    const uncertMantissa = uncertainty / Math.pow(10, exponent);
    
    // Unsicherheit auf 1-2 signifikante Stellen
    const uncertRounded = Number(uncertMantissa.toPrecision(2));
    const decimals = Math.max(0, -Math.floor(Math.log10(uncertRounded)));
    
    return `(${mantissa.toFixed(decimals)} ± ${uncertRounded.toFixed(decimals)}) × 10^${exponent} ${unit}`;
  }
  
  // Normale Notation
  const decimals = Math.max(0, -uncertMagnitude + 1);
  return `${value.toFixed(decimals)} ± ${uncertainty.toFixed(decimals)} ${unit}`;
}

// Beispiel: formatWithUncertainty({ value: 3.45e-8, uncertainty: 0.12e-8, unit: 'mbar·L/s' })
// → "(3.45 ± 0.12) × 10^-8 mbar·L/s"
```

### 7.2 Konfidenzintervall-Visualisierung

```tsx
// React-Komponente für Fehlerbalken
function ErrorBar({ 
  value, 
  lowerBound, 
  upperBound, 
  limit,
  scale 
}: {
  value: number;
  lowerBound: number;
  upperBound: number;
  limit?: number;
  scale: d3.ScaleLinear<number, number>;
}) {
  const y = scale(value);
  const yLower = scale(lowerBound);
  const yUpper = scale(upperBound);
  const yLimit = limit ? scale(limit) : null;
  
  // Farbe basierend auf Grenzwert
  let color = tokens.colors.primary;
  if (yLimit !== null) {
    if (yUpper < yLimit) {
      color = tokens.colors.success;  // Klar unter Grenzwert
    } else if (yLower > yLimit) {
      color = tokens.colors.danger;   // Klar über Grenzwert
    } else {
      color = tokens.colors.warning;  // Unsicher
    }
  }
  
  return (
    <g className="error-bar">
      {/* Vertikaler Strich */}
      <line 
        x1={0} y1={yLower} 
        x2={0} y2={yUpper} 
        stroke={color} 
        strokeWidth={2}
      />
      {/* Endkappen */}
      <line x1={-4} y1={yLower} x2={4} y2={yLower} stroke={color} strokeWidth={2} />
      <line x1={-4} y1={yUpper} x2={4} y2={yUpper} stroke={color} strokeWidth={2} />
      {/* Zentralwert */}
      <circle cx={0} cy={y} r={4} fill={color} />
    </g>
  );
}
```

### 7.3 Unsicherheits-Eingabe

```tsx
function VolumeInput({ 
  value, 
  onChange 
}: {
  value: { nominal: number; uncertainty: number } | null;
  onChange: (value: { nominal: number; uncertainty: number } | null) => void;
}) {
  return (
    <div className="volume-input">
      <NumberInput
        label="Kammervolumen"
        value={value?.nominal ?? null}
        onChange={(nominal) => onChange(nominal ? { nominal, uncertainty: value?.uncertainty ?? 0 } : null)}
        unit="L"
        format="decimal"
      />
      
      <NumberInput
        label="Unsicherheit"
        value={value?.uncertainty ?? null}
        onChange={(uncertainty) => onChange(value ? { ...value, uncertainty: uncertainty ?? 0 } : null)}
        unit="%"
        format="decimal"
        min={0}
        max={100}
        placeholder="z.B. 10"
      />
      
      <p className="volume-input__help">
        Typisch: ±5% bei bekannter Geometrie, ±20% bei Schätzung
      </p>
    </div>
  );
}
```

---

## 8. Report-Integration

### 8.1 Unsicherheits-Bericht

```typescript
interface UncertaintyReport {
  // Hauptergebnis
  result: MeasurementResult;
  
  // Aufschlüsselung
  contributions: {
    source: string;
    value: number;
    uncertainty: number;
    relativeContribution: number;  // %
  }[];
  
  // Grenzwert-Vergleich
  limitComparison?: LimitComparisonResult;
  
  // Fit-Statistik
  fitStatistics?: {
    rSquared: number;
    rmse: number;
    degreesOfFreedom: number;
    pValue: number;
  };
}

function generateUncertaintyReport(analysis: LeakRateResult): UncertaintyReport {
  // ... Implementation
}
```

### 8.2 PDF-Export mit Unsicherheiten

```typescript
function addUncertaintySection(doc: jsPDF, report: UncertaintyReport) {
  doc.setFontSize(12);
  doc.text('Unsicherheitsanalyse', 20, doc.lastY + 10);
  
  // Hauptergebnis
  doc.setFontSize(11);
  const resultText = formatWithUncertainty(report.result);
  doc.text(`Ergebnis: ${resultText}`, 20, doc.lastY + 8);
  
  // 95% Konfidenzintervall
  const ci = report.result.confidence95;
  doc.text(`95% CI: [${ci[0].toExponential(2)}, ${ci[1].toExponential(2)}]`, 20, doc.lastY + 6);
  
  // Beiträge
  doc.text('Beiträge zur Unsicherheit:', 20, doc.lastY + 10);
  report.contributions.forEach((c, i) => {
    doc.text(
      `  ${c.source}: ±${c.uncertainty.toExponential(2)} (${c.relativeContribution.toFixed(1)}%)`,
      20, doc.lastY + 5
    );
  });
  
  // Grenzwert-Vergleich
  if (report.limitComparison) {
    const lc = report.limitComparison;
    doc.text(`Grenzwert: ${lc.limit.toExponential(2)}`, 20, doc.lastY + 10);
    doc.text(`Status: ${lc.conclusion} (${(lc.probability * 100).toFixed(1)}% Konfidenz)`, 20, doc.lastY + 5);
  }
}
```

---

## 9. Implementierungs-Checkliste

### Phase 1: Basis-Statistik
- [ ] Lineare Regression mit Standardfehlern
- [ ] Konfidenzintervalle
- [ ] t-Verteilung Implementation

### Phase 2: Fehlerfortpflanzung
- [ ] Gaußsche Fehlerfortpflanzung
- [ ] Leckraten-Unsicherheit (Q = V · dp/dt)
- [ ] Normierungs-Unsicherheit

### Phase 3: Robuste Methoden
- [ ] Huber-Regression
- [ ] RANSAC
- [ ] Ausreißer-Erkennung (Z-Score, IQR, Cook's)

### Phase 4: Grenzwert-Vergleich
- [ ] Signifikanz-Berechnung
- [ ] Wahrscheinlichkeits-Aussagen
- [ ] Farbcodierung

### Phase 5: UI & Export
- [ ] Formatierung mit Unsicherheiten
- [ ] Fehlerbalken im Chart
- [ ] Eingabefelder für User-Unsicherheiten
- [ ] PDF-Report mit Unsicherheits-Sektion

---

*Spezifikation erstellt: Januar 2026*
*Für: RGA Analyser App*
