# Plan: Kinetic Fingerprinting (1.9.1) - Gemini Refined

## Ausgangslage

**Aktueller Stand:** Die RGA-App kann statische Spektren analysieren, aber NICHT die zeitliche Entwicklung von Peaks während Pumpdown oder Bakeout.

**Problem:** User können nicht unterscheiden, ob eine Kontamination von der Oberfläche (schnelle Desorption, n≈1) oder aus dem Bulk-Material (langsame Diffusion, n≈0.5) stammt.

**Erweiterte Problemstellung (Gemini Analysis):**
Reale Pumpkurven folgen nicht dem idealen $P \propto t^{-n}$ Gesetz ab Sekunde 0.
1. **Zeit-Versatz:** Die Aufzeichnung startet oft erst *nach* dem Pumpenstart ($t_{rec} \neq t_{process}$).
2. **Basisdruck:** Der Druck nähert sich asymptotisch einem Limit ($P_{base}$), wodurch die logarithmische Steigung künstlich abflacht (fälschlicherweise n→0).

---

## Was ist Kinetic Fingerprinting? (Refined)

Kinetic Fingerprinting analysiert den **Desorptions-Exponenten n** in der **korrigierten** Beziehung:

$$P(t) = A \cdot (t + t_{offset})^{-n} + P_{base}$$

Durch Fitting dieses 3-Parameter-Modells (oder User-Input für $t_{offset}$/$P_{base}$) wird die Gas-Quelle robust identifiziert:

| Exponent (n) | Mechanismus | Physikalische Bedeutung | Beispiel |
|--------------|-------------|-------------------------|----------|
| **n ≈ 1.0 - 1.2** | Surface Desorption | Erste Ordnung Kinetik | H₂O von Metallwänden |
| **n ≈ 0.4 - 0.6** | Bulk Diffusion | Fick'sches Gesetz (limitiert) | H₂ aus Edelstahllegierung |
| **n ≈ 0.5 → 1.5** | Diffusion → Depletion | Endliche Quelle (Folien/Dichtungen) | Polymer-Ausgasung (langzeit) |
| **n ≈ 0** | Konstante Quelle | Leck / Virtuelles Leck | Flansch-Leck, Permeation |

**Anwendungsfall:**
- Unterscheide "Schmutz auf Oberfläche" (n≈1, Reinigen hilft) vs. "Materialproblem" (n≈0.5, Ausheizen nötig).
- **Vermeidung von False-Positives:** Ein asymptotischer Basisdruck darf nicht als "Leck" (n=0) missinterpretiert werden.

---

## Wissenschaftliche & Mathematische Validierung

**Status:** ✅ TEILVALIDIERT (Physik) / ⚠️ KORRIGIERT (Mathematik)

**Recherchiert am:** 2026-01-10 (Gemini-3-Pro Deep Dive)

### Quellen & Erkenntnisse

| Source | Kategorie | Key Finding |
|--------|-----------|-------------|
| Redhead (1997) | Physik | n=1 (Desorption), n=0.5 (Diffusion) bestätigt. |
| Edwards (1979) | Mathematik | "Time Zero" Fehler führen zu massiven Abweichungen im Exponenten. |
| Lewin (1985) | Praxis | Reale Vakuumsysteme haben *immer* einen Basisdruck $P_{base}$. Log-Log Plots krümmen sich am Ende. |

**Kritische mathematische Fallstricke:**
1. **Der $t_0$-Fehler:** Wenn `log(t)` auf RGA-Zeitstempel angewendet wird (Start bei t=0, in Realität t=30min), wird die Kurve im Log-Log Plot "krumm".
   * *Lösung:* User muss "Pump Startzeit" eingeben oder Offset fitten.
2. **Der $P_{base}$-Effekt:** Wenn $P(t) \approx P_{base}$, wird die Kurve flach ($n \to 0$).
   * *Lösung:* Fit auf $P(t) - P_{base}$ oder Beschränkung des Fit-Bereichs auf den "fallenden" Ast (Region of Interest).

---

## Geplante Implementierung

### Dateien zu ändern

| Datei | Änderung | Details |
|-------|----------|---------|
| `src/lib/timeseriesAnalysis/kineticFingerprinting.ts` | Neue Datei | Robust Fitting Engine (Levenberg-Marquardt oder Iterativ) |
| `src/types/timeseries.ts` | Types Update | `KineticParams` mit `offset`, `basePressure` |
| `src/components/TimeseriesView/KineticAnalysisTab.tsx` | UI Update | Add "Analysis Settings" (Startzeit, Basisdruck) |

### Implementierungs-Schritte

#### Schritt 1: Robuste Fitting-Engine

**Beschreibung:** Implementiere einen Solver, der entweder rein mathematisch oder mit User-Hilfe die Parameter findet.

**Strategie:** Hybrider Ansatz.
1. **Auto-Guess:** Schätze $P_{base}$ als `min(pressure)` und $t_{offset}$ als 0.
2. **User-Refinement:** Erlaube User, diese Grenzen im UI zu schieben (Interaktiver Fit).

**Code-Beispiel (Improved):**
```typescript
interface KineticFitResult {
  n: number
  A: number
  t_offset: number
  P_base: number
  rSquared: number
  mechanism: 'surface' | 'bulk' | 'leak' | 'mixed'
}

/**
 * Fits P(t) = A * (t + t_offset)^(-n) + P_base
 * Prioritizes robustness over perfect automation.
 */
export function fitRobustKinetics(
  timePoints: number[], // Seconds since recording start
  pressurePoints: number[],
  fixedParams?: { basePressure?: number; timeOffset?: number } // User overrides
): KineticFitResult {
  
  // 1. Estimate Base Pressure (if not provided)
  // Default to 90% of minimum value to avoid log(0) issues later
  const pBase = fixedParams?.basePressure ?? (Math.min(...pressurePoints) * 0.95);
  
  // 2. Prepare Data for Linear Fit: Y' = log(P - P_base), X' = log(t + t_offset)
  // We iterate t_offset to maximize R² if not provided
  let bestFit = { r2: -1, n: 0, a: 0, offset: 0 };
  
  const testOffsets = fixedParams?.timeOffset 
    ? [fixedParams.timeOffset] 
    : [0, 60, 300, 600, 1800, 3600]; // Try typical start delays: 0, 1min, 5min, ...
    
  for (const offset of testOffsets) {
    const validPoints = timePoints.map((t, i) => ({
      x: Math.log(t + offset),
      y: Math.log(Math.max(1e-13, pressurePoints[i] - pBase)) // Safety clip
    })).filter(p => !isNaN(p.y) && isFinite(p.y));
    
    if (validPoints.length < 10) continue;
    
    const { slope, intercept, rSquared } = linearRegression(validPoints);
    
    if (rSquared > bestFit.r2) {
      bestFit = { r2: rSquared, n: -slope, a: Math.exp(intercept), offset };
    }
  }

  return classifyMechanism(bestFit.n, bestFit.r2, pBase);
}
```

#### Schritt 2: UI Integration (Interactive)

**Beschreibung:** Tab in TimeseriesView mit Echtzeit-Kontrolle über die Fit-Parameter.

```typescript
<KineticAnalysisSettings>
  <NumberInput 
    label="Pump Start Offset (min)" 
    value={offsetMin} 
    onChange={recalculateFit} 
    tooltip="Zeit zwischen Einschalten der Pumpe und Start der Messung"
  />
  <NumberInput 
    label="Assumed Base Pressure (mbar)" 
    value={basePressure} 
    onChange={recalculateFit} 
    tooltip="Enddruck des Systems (wird abgezogen für n-Berechnung)"
  />
</KineticAnalysisSettings>

<LogLogPlot>
  <DataSeries data={data} label="Raw" />
  <DataSeries data={fitCurve} label={`Fit (n=${n.toFixed(2)})`} />
  <ThresholdLine y={basePressure} label="P_base" />
</LogLogPlot>
```

---

## Verifikation (Gemini Enhanced)

**Test-Szenarien:**

1. **Test 1: Surface Desorption mit Zeit-Versatz**
   - **Scenario:** User startet RGA 10 min nach Pumpenstart.
   - **Input:** $P(t) = 10^{-5} \cdot (t + 600)^{-1}$
   - **Naive Fit (Original Plan):** Würde $n \ll 1$ berechnen (falsch).
   - **Expected (Robust Fit):** Erkennt $t_{offset} \approx 600s$, liefert $n \approx 1.0$.

2. **Test 2: Bulk Diffusion nahe Basisdruck**
   - **Scenario:** System nahe Enddruck ($5 \cdot 10^{-8}$ mbar).
   - **Input:** $P(t) = 10^{-6} \cdot t^{-0.5} + 5 \cdot 10^{-8}$
   - **Naive Fit (Original Plan):** Steigung wird flach, erkennt fälschlich "Leck".
   - **Expected (Robust Fit):** Zieht $P_{base}$ ab, fittet Restkurve, liefert $n \approx 0.5$.

3. **Test 3: Echtes virtuelles Leck**
   - **Input:** $P(t) = 10^{-7}$ (konstant)
   - **Expected:** Auch mit $P_{base}$-Korrektur kein guter Fit für $n > 0.2$, klassifiziert als "Leck".

---

## Geschätzter Aufwand

- **Planung:** 1h (Done)
- **Implementation:** 6-8h (+2h für UI-Slider/Interaktivität und robusten Math-Helper)
- **Testing:** 2h (Erweiterte Synthetik-Tests nötig)
- **Gesamt:** 8-10h

---

**Template-Version:** 1.0 (Gemini Modified)
**Erstellt:** 2026-01-10
**Autor:** Gemini Agent (Critique & Refinement)
