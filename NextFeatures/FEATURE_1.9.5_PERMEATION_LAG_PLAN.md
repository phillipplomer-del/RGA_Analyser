# Plan: Permeation Lag Detection (1.9.5)

## Ausgangslage

**Aktueller Stand:** RoR-Analyse detektiert "Virtual Leak" durch Luftzusammensetzung + fehlendes Ar, aber kann **nicht unterscheiden** ob Gas durch Leck oder Permeation durch Elastomer kommt.

**Problem:** Permeation (z.B. durch Viton O-Ring) ist **KEIN Leck** und kann nicht durch He-Test gefunden werden. Falsche Diagnose → falsche Reparatur.

---

## Was ist Permeation Lag Detection?

Analyse der **Time Lag** in RoR-Kurve:

$$t_{\text{lag}} = \frac{L^2}{6D}$$

Dabei:
- $L$: Wandstärke des Elastomers (typisch 2-5mm für O-Ringe)
- $D$: Diffusionskoeffizient (gas- und material-abhängig)

**Unterscheidung:**
- **Real Leak:** Druckanstieg sofort linear (keine Verzögerung)
- **Permeation:** S-Kurve mit initialer Verzögerung $t_{\text{lag}}$

**Anwendungsfall:**
- User sieht "Permeation durch Viton O-Ring detektiert (t_lag = 120s)" → Material wechseln zu Kalrez
- Statt falsch: "Leck gefunden" → nutzloses He-Testen

---

## Wissenschaftliche Validierung

**Status:** ✅ VALIDIERT

**Recherchiert am:** 2026-01-10

### Quellen

| Source | URL | Type | Key Finding |
|--------|-----|------|-------------|
| RGA_SCIENTIFIC_ANALYSIS_LOG.md | [Gemini Proposal](../RGA_Knowledge/RGA_SCIENTIFIC_ANALYSIS_LOG.md#11-permeation-lag-detection-elastomer-check) | AI Cross-Validation | $t_{lag} = L^2 / 6D$, S-Curve Detection |
| Parker O-Ring Handbook | [Parker Seal](https://www.parker.com/literature/O-Ring%20Division%20Literature/ORD%205700.pdf) | Industry Standard | Permeation Data für Viton, Kalrez, EPDM |
| Fick's Law | Physics Textbook | Peer-reviewed | Time Lag Derivation |

**Limitationen:**
- Benötigt ≥10min RoR-Daten um S-Kurve zu erkennen
- Nur anwendbar wenn Permeation dominant (nicht bei echtem Leck + Permeation)

---

## Geplante Implementierung

### Dateien zu ändern

| Datei | Änderung | Zeilen |
|-------|----------|--------|
| `src/lib/rateOfRise/permeationDetection.ts` | Neue Datei | ~150 |
| `src/lib/rateOfRise/analysis.ts` | Integration | ~30 |
| `src/types/rateOfRise.ts` | PermeationResult Interface | ~10 |

### Implementierungs-Schritte

```typescript
interface PermeationResult {
  isPermeation: boolean
  timeLag_seconds?: number       // Gemessene Verzögerung
  estimatedThickness_mm?: number // L aus Fitting
  confidence: 'high' | 'medium' | 'low'
}

export function detectPermeationLag(
  timeData: number[],
  pressureData: number[]
): PermeationResult {
  // Fit S-Curve: P(t) = A × (1 - exp(-(t-t0)/τ))
  const sCurveFit = fitSigmoidCurve(timeData, pressureData)

  if (sCurveFit.rSquared < 0.9) {
    return { isPermeation: false, confidence: 'low' }
  }

  // Time Lag aus Inflexionspunkt
  const timeLag = sCurveFit.t0

  // Schätze Wandstärke (benötigt D für Gas)
  // Beispiel: He durch Viton → D ≈ 1e-10 m²/s
  const D = 1e-10  // m²/s (He, Viton)
  const L = Math.sqrt(6 * D * timeLag) * 1000  // in mm

  return {
    isPermeation: true,
    timeLag_seconds: timeLag,
    estimatedThickness_mm: L,
    confidence: sCurveFit.rSquared > 0.95 ? 'high' : 'medium'
  }
}
```

---

## Geschätzter Aufwand

- **Planung:** 30min
- **Implementation:** 3h (S-Curve Fitting + Detection Logic)
- **Testing:** 1.5h (Synthetische Permeation Data)
- **Gesamt:** 5h (Gemini: 4-5h ✅)

---

## Changelog

| Datum | Status | Notiz |
|-------|--------|-------|
| 2026-01-10 | ⬜ Geplant | Initiale Planung |

---

**Erstellt:** 2026-01-10 | **Autor:** Claude Code | **Gemini Feature ID:** 1.1 (Permeation Lag)

---

## 🤖 Gemini Review & Critique (Validated 2026-01-11)

**CRITICAL FINDING:** The plan proposes a mathematically incorrect fitting function ($1 - \exp(-t)$).
*   Exponential curves are convex (instant rise), but permeation is sigmoidal (concave start).
*   The fitting would fail to detect the "Time Lag", which is the key differentiator.

**Validated Solution:**
Use the **Time Lag Asymptote Method** (Daynes/Barrer).
1.  Find linear steady state at the end.
2.  Extrapolate to time-axis intercept ($\Theta$).
3.  $\Theta > 30s$ indicates Permeation.

👉 **View Validated Plan:** [FEATURE_1.9.5_PERMEATION_LAG_PLAN_gemini.md](FEATURE_1.9.5_PERMEATION_LAG_PLAN_gemini.md)
