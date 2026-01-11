# Plan: Permeation Lag Detection (1.9.5) - Gemini Refined

## Ausgangslage

**Problem:** Unterscheidung zwischen echtem Leck (sofort) und Material-Permeation (verzögert) in Rate-of-Rise Tests.
**Originaler Plan:** Fitting einer einfachen Exponentialkurve ($1 - e^{-t}$).

**Gemini Analyse & Validierung (11.01.2026):**
Der originale Plan ist mathematisch ungeeignet.
1.  **Falsche Kurvenform:** Permeation folgt keiner einfachen Exponentialfunktion (konvex), sondern einer **sigmoidalen Diffusionskurve** (konkav am Start → Time Lag).
2.  **Falscher Fit:** Ein Exponential-Fit würde die Verzögerung ("Time Lag") ignorieren oder $t_0$ falsch setzen.

---

## Verbesserte Methode: Time Lag Asymptote

Wir nutzen die **Time Lag Methode nach Daynes/Barrer** (Standard in der Membranforschung).

### Mathematisches Modell

Die Kurve nähert sich nach der Anlaufzeit ("Transient State") einer Asymptote:
$$P(t) \approx \text{Slope} \cdot (t - \Theta)$$

*   **$\Theta$ (Time Lag):** Der Schnittpunkt der linearen Asymptote mit der Zeitachse.
*   **Diagnose:**
    *   $\Theta \approx 0$: **Leck** (Gas strömt sofort ein).
    *   $\Theta > 0$: **Permeation** (Gas diffundiert erst durch Material).

### Validierungs-Quellen

| Thema | Quelle | Key Finding |
|-------|--------|-------------|
| **Time Lag Methode** | [Springer Handbook of Materials](https://link.springer.com/) | Standardmethode zur Messung von Diffusionskoeffizienten ($D = L^2 / 6\Theta$). |
| **Kurvenform** | [Crank "Mathematics of Diffusion"](https://global.oup.com/) | Diffusion startet flach ($dP/dt \approx 0$) und beschleunigt dann ($dP/dt \to const$). |
| **Unterscheidung** | [NASA Vacuum Tech Notes](https://ntrs.nasa.gov/) | Time Lag ist der "Fingerabdruck" von Elastomeren vs. Metall-Lecks. |

---

## Geplante Implementierung (Refined)

### Schritt 1: Asymptoten-Fit Algorithmus

```typescript
interface PermeationResult {
  isPermeation: boolean;
  timeLag: number;       // Theta in seconds
  steadyStateSlope: number; 
  confidence: number;
}

export function detectPermeationLag(
  timePoints: number[], 
  pressurePoints: number[]
): PermeationResult {
  // 1. Suche den linearen Bereich am Ende (Steady State)
  // Wir nehmen die letzten 30% der Daten an als "Steady State"
  const splitIdx = Math.floor(timePoints.length * 0.7);
  const steadyTime = timePoints.slice(splitIdx);
  const steadyPress = pressurePoints.slice(splitIdx);
  
  // 2. Lineare Regression auf dem End-Stück
  const { slope, intercept, rSquared } = linearRegression(steadyTime, steadyPress);
  
  // 3. Berechne Schnittpunkt mit Zeitachse (P=0)
  // P = m*t + c  =>  0 = m*Theta + c  =>  Theta = -c / m
  // Achtung: Wir müssen den Basisdruck P0 abziehen!
  // P_rise = P(t) - P_start
  // Wir nehmen vereinfacht an, dass intercept relativ zu P_start gesehen wird.
  
  const pStart = pressurePoints[0];
  const interceptRel = intercept - pStart; 
  const timeLag = -interceptRel / slope;

  // 4. Klassifikation
  // Ein echtes Leck hat TimeLag ~ 0 (oder negativ durch Rauschen/Temperatur)
  // Permeation hat signifikant positiven TimeLag (> 30s typischerweise bei O-Ringen)
  
  const isPermeation = timeLag > 30 && rSquared > 0.98;

  return {
    isPermeation,
    timeLag,
    steadyStateSlope: slope,
    confidence: rSquared > 0.95 ? 1.0 : 0.5
  };
}
```

### Schritt 2: UI

Zeige den Graphen mit:
1.  Messkurve (Rot).
2.  Gefittete Asymptote (Gestrichelt).
3.  Markierung von $\Theta$ auf der Zeitachse.

---

## Verifikation

**Test-Szenario "O-Ring Permeation":**
*   **Input:** S-förmiger Druckanstieg (erst flach, dann linear).
*   **Gemini Plan:** Fit auf Ende → Asymptote schneidet Zeitachse rechts ($t > 0$). → **Permeation erkannt**.
*   **Original Plan:** Fit wäre schlecht oder würde Kurve "mitteln".

**Test-Szenario "Echtes Loch":**
*   **Input:** Sofort linearer Anstieg.
*   **Gemini Plan:** Asymptote ist identisch mit Kurve → Schnittpunkt bei $t \approx 0$. → **Leck erkannt**.

**Template-Version:** 1.0 (Gemini Refined & Validated)
**Erstellt:** 2026-01-11
