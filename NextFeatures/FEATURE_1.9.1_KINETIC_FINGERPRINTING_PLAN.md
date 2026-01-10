# Plan: Kinetic Fingerprinting (1.9.1)

## Ausgangslage

**Aktueller Stand:** Die RGA-App kann statische Spektren analysieren, aber NICHT die zeitliche Entwicklung von Peaks während Pumpdown oder Bakeout.

**Problem:** User können nicht unterscheiden, ob eine Kontamination von der Oberfl

äche (schnelle Desorption, n≈1) oder aus dem Bulk-Material (langsame Diffusion, n≈0.5) stammt. Diese Information ist kritisch für die Wahl der Reinigungsstrategie.

---

## Was ist Kinetic Fingerprinting?

Kinetic Fingerprinting analysiert den **Desorptions-Exponenten n** in der Beziehung:

$$P(t) \propto t^{-n}$$

Durch Fitting eines Druckverlaufs über die Zeit kann die Gas-Quelle identifiziert werden:

| Exponent (n) | Mechanismus | Physikalische Bedeutung | Beispiel |
|--------------|-------------|-------------------------|----------|
| **n ≈ 1** | Surface Desorption | Erste Ordnung Kinetik | H₂O in nicht-ausgeheiztem System |
| **n ≈ 0.5** | Bulk Diffusion | Fick'sches Gesetz | H₂ aus Edelstahl, Polymer-Ausgasung |
| **n → 0** | Konstante Quelle | Leck oder virtuelle Leck | Reales/virtuelles Leck |

**Anwendungsfall:**
- Identifiziere ob Ausgasung von Oberflächenkontamination (→ kurzes Pumpen hilft) oder Bulk-Diffusion (→ Materialwechsel nötig) stammt
- Unterscheide echte Lecks (n→0) von Desorption (n>0.5)
- Optimiere Bakeout-Strategien basierend auf Desorptions-Kinetik

---

## Wissenschaftliche Validierung

**Status:** ✅ TEILVALIDIERT

**Recherchiert am:** 2026-01-10 (Gemini-3-Pro Cross-Validation)

### Quellen

| Source | URL | Type | Key Finding |
|--------|-----|------|-------------|
| SCIENTIFIC_REFERENCES.md | [Section 1: Desorption Kinetics](../RGA_Knowledge/SCIENTIFIC_REFERENCES.md#1-desorption-kinetics-t-1-vs-t-05) | Peer-reviewed (Redhead 1997, Degiovanni) | n=1 für First-Order Desorption, n=0.5 für Diffusion |
| RGA_SCIENTIFIC_ANALYSIS_LOG.md | [Gemini Validation](../RGA_Knowledge/RGA_SCIENTIFIC_ANALYSIS_LOG.md#21-kinetic-fingerprinting-desorptions-kinetik) | AI Cross-Validation | Vorschlag für Offline-Analyse Feature |

**Validierungs-Zusammenfassung:**
- ✅ $P \propto t^{-1}$ für Surface Desorption ist wissenschaftlich etabliert (Redhead 1997)
- ✅ $P \propto t^{-0.5}$ für Bulk Diffusion folgt aus Fick's Law
- ⚠️ Real-world Systeme zeigen oft **Mixed Kinetics** (mehrere gleichzeitige Quellen)
- ⚠️ Fitting benötigt **≥3 Datenpunkte** über **≥1 Größenordnung** Druckabfall

**Limitationen:**
- Nicht anwendbar für Systeme mit aktiver Pumpen-Drehzahländerung
- Erfordert zeitaufgelöste Daten (nicht aus Single-Scan RGA-Files)
- Fitting kann mehrdeutig sein bei Mixed Sources

---

## Geplante Implementierung

### Dateien zu ändern

| Datei | Änderung | Zeilen |
|-------|----------|--------|
| `src/lib/timeseriesAnalysis/kineticFingerprinting.ts` | Neue Datei: Fitting-Engine | ~150-200 |
| `src/types/timeseries.ts` | Interface für Kinetic Result | ~20 |
| `src/components/TimeseriesView/KineticAnalysisTab.tsx` | UI für n-Exponent Visualisierung | ~100-150 |

### Implementierungs-Schritte

#### Schritt 1: Fitting-Engine

**Beschreibung:** Implementiere Power-Law Fitting für $\log(P) = \log(A) - n \cdot \log(t)$

**Code-Beispiel:**
```typescript
interface KineticFit {
  exponent_n: number           // Desorptions-Exponent
  amplitude_A: number          // Amplitude
  r_squared: number            // Fit-Qualität
  mechanism: 'surface' | 'bulk' | 'leak' | 'mixed'
  confidence: 'high' | 'medium' | 'low'
}

export function fitDesorptionKinetics(
  timeData: number[],  // in seconds
  pressureData: number[] // in mbar oder Partial Pressure
): KineticFit {
  // Linear Regression in Log-Space
  const logT = timeData.map(t => Math.log(t))
  const logP = pressureData.map(p => Math.log(p))

  // Least Squares Fit: log(P) = log(A) - n*log(t)
  const { slope, intercept, rSquared } = linearRegression(logT, logP)

  const n = -slope  // Negativ weil P ∝ t^(-n)
  const A = Math.exp(intercept)

  // Classify mechanism based on n
  let mechanism: KineticFit['mechanism']
  if (n > 0.8) mechanism = 'surface'
  else if (n > 0.3 && n <= 0.8) mechanism = 'bulk'
  else if (n > 0.1) mechanism = 'mixed'
  else mechanism = 'leak'

  return { exponent_n: n, amplitude_A: A, r_squared: rSquared, mechanism, confidence }
}
```

#### Schritt 2: UI Integration

**Beschreibung:** Tab in TimeseriesView zeigt Log-Log Plot mit Fit-Line

```typescript
<KineticAnalysisTab>
  <LogLogPlot data={pressureVsTime} fitLine={kineticFit} />
  <ResultCard>
    <div>Exponent n: {n.toFixed(2)}</div>
    <div>Mechanismus: {mechanism}</div>
    <div>R²: {rSquared.toFixed(3)}</div>
    <Recommendation mechanism={mechanism} />
  </ResultCard>
</KineticAnalysisTab>
```

#### Schritt 3: Multi-Gas Support

**Beschreibung:** Analysiere H₂O, CO, H₂ separat (unterschiedliche n-Exponenten)

```typescript
const gasesToAnalyze = [2, 18, 28, 44]  // H₂, H₂O, N₂/CO, CO₂

for (const mass of gasesToAnalyze) {
  const partialPressure = extractPartialPressure(timeseriesData, mass)
  const fit = fitDesorptionKinetics(timeData, partialPressure)
  results[mass] = fit
}
```

---

## Geschätzter Aufwand

- **Planung:** 1h (diese Datei)
- **Implementation:** 4-5h (Fitting + UI + Tests)
- **Testing:** 1h (Synthetische Daten mit n=0.5, 1.0, 0.0)
- **Dokumentation:** 30min (SCIENTIFIC_REFERENCES.md Update)
- **Gesamt:** 6-7h (Gemini Estimate: 4-6h ✅)

---

## Verifikation

**Test-Szenarien:**

1. **Test 1: Surface Desorption (n=1)**
   - Input: Synthetische Daten $P(t) = 10^{-6} \cdot t^{-1}$
   - Expected: n ≈ 1.0 ± 0.1, mechanism='surface', R² > 0.95
   - Actual: [Nach Implementation]

2. **Test 2: Bulk Diffusion (n=0.5)**
   - Input: Synthetische Daten $P(t) = 10^{-5} \cdot t^{-0.5}$
   - Expected: n ≈ 0.5 ± 0.1, mechanism='bulk', R² > 0.95
   - Actual: [Nach Implementation]

3. **Test 3: Konstante Leckrate (n→0)**
   - Input: Synthetische Daten $P(t) = 10^{-7}$ (konstant)
   - Expected: n < 0.1, mechanism='leak', R² low
   - Actual: [Nach Implementation]

**Erfolgs-Kriterien:**
- [ ] Korrekte Klassifikation für n=1, 0.5, 0 in Synthetik-Tests
- [ ] UI zeigt Log-Log Plot + Fit-Linie
- [ ] R²-Wert wird berechnet und angezeigt
- [ ] Empfehlungen basieren auf detektiertem Mechanismus
- [ ] Keine Regressions in anderen Features

---

## Changelog

| Datum | Status | Notiz |
|-------|--------|-------|
| 2026-01-10 | ⬜ Geplant | Initiale Planung basierend auf Gemini-3-Pro Cross-Validation |

---

**Template-Version:** 1.0
**Erstellt:** 2026-01-10
**Autor:** Claude Code
**Gemini Feature ID:** 2.1 (Kinetic Fingerprinting)
