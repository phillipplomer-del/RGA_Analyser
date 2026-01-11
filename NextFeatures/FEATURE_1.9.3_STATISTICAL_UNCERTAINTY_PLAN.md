# Plan: Statistical Uncertainty Calculation (1.9.3)

## Ausgangslage

**Aktueller Stand:** Die Rate-of-Rise Analyse berechnet Leckraten als **Einzel-Werte** (z.B. "3.4×10⁻⁹ mbar·l/s"), ohne statistische Unsicherheiten anzugeben.

**Problem:** Diese Präzision ist **irreführend**. Eine gemessene Leckrate von 3.4×10⁻⁹ impliziert, dass der Wert auf ±1×10⁻¹⁰ genau ist - aber Real-World-Messungen haben oft ±20-50% Unsicherheit durch:
- Rauschen in Druckmessung
- Temperatur-Drift
- Manometer-Nichtlinearität
- Kurz-Zeitige Ausgasungs-Bursts

---

## Was ist Statistical Uncertainty?

Statistical Uncertainty quantifiziert die **Vertrauensbereich** der Leckraten-Messung durch:

$$Q \pm 2 \cdot SE_{\text{slope}} \quad \text{(95% Konfidenz-Interval)}$$

Dabei:
- $Q$: Leckrate aus $Q = V \cdot \frac{dP}{dt}$
- $SE_{\text{slope}}$: Standard Error of Slope aus linearer Regression
- **95% CI**: 2×SE entspricht 95% Konfidenz-Interval (statistischer Standard)

**Anwendungsfall:**
- User sieht "Q = (3.4 ± 0.7)×10⁻⁹ mbar·l/s" statt "3.4×10⁻⁹"
- Entscheidungen basieren auf **Vertrauensbereich**, nicht Punkt-Wert
- Vergleich mit Grenzwerten berücksichtigt Unsicherheit: Ist Q+2SE < Limit?

---

## Wissenschaftliche Validierung

**Status:** ✅ VALIDIERT

**Recherchiert am:** 2026-01-10 (Gemini-3-Pro Cross-Validation)

### Quellen

| Source | URL | Type | Key Finding |
|--------|-----|------|-------------|
| ISO Guide to Expression of Uncertainty | [ISO/IEC Guide 98-3](https://www.iso.org/standard/50461.html) | International Standard | 95% CI = mean ± 2×SE ist globaler Standard |
| RGA_SCIENTIFIC_ANALYSIS_LOG.md | [Gemini Proposal](../RGA_Knowledge/RGA_SCIENTIFIC_ANALYSIS_LOG.md#12-statistical-uncertainty-calculation-confidence-intervals) | AI Cross-Validation | Metrology standard für Flow Measurement |
| NIST Engineering Statistics Handbook | [NIST Handbook](https://www.itl.nist.gov/div898/handbook/) | Peer-reviewed | Linear Regression SE-Berechnung |

**Validierungs-Zusammenfassung:**
- ✅ Standard Error of Slope ist etablierte Methode für Regression-Unsicherheit
- ✅ 95% Konfidenz-Interval (2×SE) ist **ISO/IEC Standard** für Metrologie
- ✅ Anwendung auf Leckraten ist wissenschaftlich korrekt

**Limitationen:**
- Benötigt **≥5 Datenpunkte** für robuste SE-Berechnung
- Aussage nur gültig wenn Residuen normalverteilt (bei starken Outliers: RANSAC statt Least Squares)
- Unsicherheit nur für **linearen Teil** der RoR-Kurve (nicht für Exponential-Fits)

---

## Geplante Implementierung

### Dateien zu ändern

| Datei | Änderung | Zeilen |
|-------|----------|--------|
| `src/lib/rateOfRise/regression.ts` | Erweitern um SE-Berechnung | ~50 |
| `src/lib/rateOfRise/analysis.ts` | Update Result-Interface + Uncertainty Propagation | ~30 |
| `src/types/rateOfRise.ts` | Add `uncertaintyMbarLS?: number` zu LeakRateResult | ~5 |
| `src/components/RateOfRiseView/ResultsCard.tsx` | Display Q ± SE in UI | ~20 |

### Implementierungs-Schritte

#### Schritt 1: Standard Error Berechnung

**Beschreibung:** Erweitere Linear Regression um SE-of-Slope

**Code-Beispiel:**
```typescript
interface RegressionResult {
  slope: number                // dp/dt in mbar/s
  intercept: number            // P₀
  rSquared: number             // Fit-Qualität
  standardErrorSlope: number   // SE (NEW!)
  standardErrorIntercept: number
  residuals: number[]          // Abweichungen
}

export function linearRegressionWithUncertainty(
  x: number[],  // Zeit in Sekunden
  y: number[]   // Druck in mbar
): RegressionResult {
  const n = x.length

  // Standard Least Squares
  const meanX = mean(x)
  const meanY = mean(y)

  let sumXY = 0, sumX2 = 0
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX
    const dy = y[i] - meanY
    sumXY += dx * dy
    sumX2 += dx * dx
  }

  const slope = sumXY / sumX2
  const intercept = meanY - slope * meanX

  // Residuals
  const residuals = y.map((yi, i) => yi - (slope * x[i] + intercept))
  const residualSS = residuals.reduce((sum, r) => sum + r * r, 0)

  // Standard Error of Slope (NIST formula)
  const standardErrorSlope = Math.sqrt(residualSS / (n - 2)) / Math.sqrt(sumX2)

  // Standard Error of Intercept
  const standardErrorIntercept = standardErrorSlope * Math.sqrt(sumX2 / n + meanX * meanX)

  // R²
  const totalSS = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0)
  const rSquared = 1 - (residualSS / totalSS)

  return {
    slope,
    intercept,
    rSquared,
    standardErrorSlope,
    standardErrorIntercept,
    residuals
  }
}
```

#### Schritt 2: Uncertainty Propagation

**Beschreibung:** Q = V × (dP/dt) → SE(Q) = V × SE(dP/dt)

```typescript
interface LeakRateResult {
  leakRate: number                   // Q in mbar·l/s
  leakRateUncertainty?: number       // ±ΔQ (95% CI) (NEW!)
  slope: number                       // dP/dt
  slopeUncertainty?: number          // ±Δ(dP/dt) (NEW!)
  rSquared: number
  // ... existing fields
}

export function calculateLeakRate(
  regression: RegressionResult,
  volume: number  // in liters
): LeakRateResult {
  const slope = regression.slope  // mbar/s
  const leakRate = volume * slope // mbar·l/s

  // Propagate uncertainty: Q = V × slope
  const slopeUncertainty = 2 * regression.standardErrorSlope  // 95% CI
  const leakRateUncertainty = volume * slopeUncertainty

  return {
    leakRate,
    leakRateUncertainty,
    slope,
    slopeUncertainty,
    rSquared: regression.rSquared
  }
}
```

#### Schritt 3: UI Display

**Beschreibung:** Zeige Q ± ΔQ mit Unsicherheits-Balken

```typescript
<ResultCard title="Leckrate">
  <div className="text-2xl font-bold">
    {formatLeakRate(leakRate)}
    {leakRateUncertainty && (
      <span className="text-lg text-gray-600">
        {' '}± {formatLeakRate(leakRateUncertainty)}
      </span>
    )}
  </div>
  <div className="text-sm text-gray-500">
    95% Konfidenz-Interval (2σ)
  </div>

  {/* Visual Uncertainty Bar */}
  <div className="mt-2 relative h-2 bg-gray-200 rounded">
    <div
      className="absolute h-full bg-blue-500 rounded"
      style={{
        left: `${((leakRate - leakRateUncertainty) / leakRate) * 50}%`,
        width: `${(2 * leakRateUncertainty / leakRate) * 100}%`
      }}
    />
  </div>
</ResultCard>
```

---

## Geschätzter Aufwand

- **Planung:** 30min (diese Datei)
- **Implementation:** 2.5h (SE Calc + Propagation + UI)
- **Testing:** 1h (Synthetische Daten mit bekannter SE)
- **Dokumentation:** 30min (Update SCIENTIFIC_REFERENCES.md)
- **Gesamt:** 4.5h (Gemini Estimate: 3-4h ✅)

---

## Verifikation

**Test-Szenarien:**

1. **Test 1: Perfekte Linear Data (kein Rauschen)**
   - Input: P(t) = 1×10⁻⁶ + 1×10⁻⁸·t (exakt)
   - Expected: SE_slope ≈ 0, leakRateUncertainty ≈ 0
   - Actual: [Nach Implementation]

2. **Test 2: Noisy Linear Data**
   - Input: P(t) mit Gauss-Rauschen σ=5×10⁻⁹
   - Expected: SE_slope > 0, Uncertainty ~10-20% von Q
   - Actual: [Nach Implementation]

3. **Test 3: Few Data Points (n=3)**
   - Input: Nur 3 Punkte
   - Expected: Höhere SE (weniger Daten → mehr Unsicherheit)
   - Actual: [Nach Implementation]

**Erfolgs-Kriterien:**
- [ ] SE_slope wird korrekt aus Residuals berechnet
- [ ] Uncertainty propagiert zu Q = V × slope
- [ ] UI zeigt Q ± ΔQ mit 95% CI Label
- [ ] Uncertainty steigt bei mehr Rauschen
- [ ] Keine Regressions in RoR-Tests

---

## Changelog

| Datum | Status | Notiz |
|-------|--------|-------|
| 2026-01-10 | ⬜ Geplant | Initiale Planung basierend auf ISO/IEC Standards |

---

**Template-Version:** 1.0
**Erstellt:** 2026-01-10
**Autor:** Claude Code
**Gemini Feature ID:** 1.2 (Statistical Uncertainty)

---

## 🤖 Gemini Review & Critique (Validated 2026-01-10)

**CRITICAL FINDING:** The plan ignores a dominant error source: **Volume Uncertainty**.
*   Formula $Q = V \cdot slope$.
*   Original plan only considers uncertainty in $slope$ (from fit).
*   ISO 20485 requires including uncertainty of Volume $V$ (often 5-10%).

**Also:** The UI visualization logic (width calculation) was mathematically incorrect relative to the background.

**Validated Solution:**
Use the **Total Uncertainty** formula including Volume Error, and a corrected UI visualization logic.

👉 **View Validated Plan:** [FEATURE_1.9.3_STATISTICAL_UNCERTAINTY_PLAN_gemini.md](FEATURE_1.9.3_STATISTICAL_UNCERTAINTY_PLAN_gemini.md)
