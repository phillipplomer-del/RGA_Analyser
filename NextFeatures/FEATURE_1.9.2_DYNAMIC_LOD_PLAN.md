# Plan: Dynamic Limit of Detection (1.9.2)

## Ausgangslage

**Aktueller Stand:** Die RGA-App nutzt hardcoded Schwellenwerte wie `1e-10 mbar` oder `DEFAULT_THRESHOLDS.minPeakHeight` zum Filtern von Peaks.

**Problem:** Diese arbitrary Cutoffs sind **nicht scan-spezifisch**. Ein RGA mit hohem Elektronik-Rauschen wird fälschlicherweise "saubere" Peaks anzeigen, während ein rauscharmes System echte schwache Signale ignoriert.

---

## Was ist Dynamic LOD?

Dynamic Limit of Detection berechnet die **statistische Nachweisgrenze** für JEDEN Scan individuell:

$$\text{LOD} = \mu_{\text{noise}} + 3\sigma_{\text{noise}}$$

Dabei:
- $\mu_{\text{noise}}$: Mittlerer Signal-Level in rauschfreier Region (z.B. m/z 5-10, wo keine echten Peaks sein sollten)
- $\sigma_{\text{noise}}$: Standardabweichung dieser Region
- **3σ**: 99.7% Konfidenz (IUPAC Standard)

**Anwendungsfall:**
- RGA mit schlechter Elektronik → höhere LOD (filtert Rauschen korrekt)
- Hochqualitativer RGA → niedrigere LOD (detektiert schwache Kontaminationen)
- Unterscheidung zwischen "echtem Signal" und "Rauschen" wird objektiv

---

## Wissenschaftliche Validierung

**Status:** ✅ VALIDIERT

**Recherchiert am:** 2026-01-10 (Gemini-3-Pro Cross-Validation)

### Quellen

| Source | URL | Type | Key Finding |
|--------|-----|------|-------------|
| IUPAC | [Analytical Chemistry LOD Definition](https://iupac.org/) | Standards | $3\sigma$ ist globaler Standard für LOD |
| SCIENTIFIC_REFERENCES.md | [Section 2: Dynamic LOD](../RGA_Knowledge/SCIENTIFIC_REFERENCES.md#2-dynamic-limit-of-detection-3sigma-method) | Validated | Bestätigt IUPAC Methodik |
| RGA_SCIENTIFIC_ANALYSIS_LOG.md | [Gemini Proposal](../RGA_Knowledge/RGA_SCIENTIFIC_ANALYSIS_LOG.md#22-dynamic-limit-of-detection-lod-3sigma) | AI Cross-Validation | Ersetzt "1e-10" Cutoffs |

**Validierungs-Zusammenfassung:**
- ✅ $3\sigma$ Methode ist **IUPAC-Standard** für instrumentelle Analytik
- ✅ Scan-spezifische Berechnung ist wissenschaftlich robuster als global Cutoffs
- ✅ Statistisch fundiert (99.7% Konfidenz-Interval)

**Limitationen:**
- Benötigt "rauschfreie Region" (m/z 5-10) ohne echte Peaks
- Bei extrem kontaminierten Systemen (jede Masse hat Signal) nicht anwendbar
- Funktioniert NUR für Partial Pressure Data, nicht für Total Pressure

---

## Geplante Implementierung

### Dateien zu ändern

| Datei | Änderung | Zeilen |
|-------|----------|--------|
| `src/lib/analysis/dynamicLOD.ts` | Neue Datei: LOD-Berechnung | ~80-100 |
| `src/lib/diagnosis/detectors.ts` | Replace `DEFAULT_THRESHOLDS.minPeakHeight` mit `dynamicLOD` | ~20 Locations |
| `src/components/SpectrumView/index.tsx` | UI Indicator für LOD-Line | ~30 |
| `src/types/analysis.ts` | Interface für LODResult | ~10 |

### Implementierungs-Schritte

#### Schritt 1: LOD-Berechnung

**Beschreibung:** Berechne $\mu + 3\sigma$ aus Noise-Region

**Code-Beispiel:**
```typescript
interface LODResult {
  lod: number              // Limit of Detection in mbar
  mu_noise: number         // Mean noise level
  sigma_noise: number      // Noise std deviation
  confidence: number       // Always 0.997 (3σ)
  noiseRegion: [number, number]  // m/z range used (e.g. [5, 10])
}

export function calculateDynamicLOD(
  peaks: Record<number, number>,  // mass -> partial pressure
  noiseRegion: [number, number] = [5, 10]
): LODResult {
  // Extract noise-region data
  const noiseMasses = Object.keys(peaks)
    .map(Number)
    .filter(m => m >= noiseRegion[0] && m <= noiseRegion[1])

  if (noiseMasses.length < 3) {
    // Fallback: not enough data points
    return {
      lod: 1e-10,  // Default fallback
      mu_noise: 0,
      sigma_noise: 0,
      confidence: 0,
      noiseRegion
    }
  }

  const noiseValues = noiseMasses.map(m => peaks[m])

  // Calculate statistics
  const mu_noise = mean(noiseValues)
  const sigma_noise = standardDeviation(noiseValues)

  const lod = mu_noise + 3 * sigma_noise

  return { lod, mu_noise, sigma_noise, confidence: 0.997, noiseRegion }
}
```

#### Schritt 2: Integration in Detectors

**Beschreibung:** Replace hardcoded `minPeakHeight` mit dynamischem LOD

```typescript
// BEFORE (static threshold):
if (m18 > DEFAULT_THRESHOLDS.minPeakHeight) {
  // Detect water
}

// AFTER (dynamic LOD):
const lodResult = calculateDynamicLOD(peaks)
if (m18 > lodResult.lod) {
  // Detect water (robuster!)
}
```

#### Schritt 3: UI Visualisierung

**Beschreibung:** Zeige LOD als horizontale Linie im Spektrum

```typescript
<SpectrumChart>
  <BarChart data={peaks} />
  <HorizontalLine
    y={lodResult.lod}
    label={`LOD (3σ): ${lodResult.lod.toExponential(2)}`}
    color="orange"
    dashed
  />
  <Tooltip>
    Noise: μ={mu_noise.toExponential(2)} ± 3σ={sigma_noise.toExponential(2)}
  </Tooltip>
</SpectrumChart>
```

---

## Geschätzter Aufwand

- **Planung:** 30min (diese Datei)
- **Implementation:** 2h (LOD Calc + Integration in ~20 Detectors)
- **Testing:** 30min (Synthetische Noise-Tests)
- **Dokumentation:** 30min (Update SCIENTIFIC_REFERENCES.md)
- **Gesamt:** 3.5h (Gemini Estimate: 2-3h ✅)

---

## Verifikation

**Test-Szenarien:**

1. **Test 1: Clean Noise (μ=1e-11, σ=5e-12)**
   - Input: Noise region m/z 5-10 mit Gauss-Rauschen
   - Expected: LOD ≈ 1e-11 + 3×5e-12 = 2.5e-11 mbar
   - Actual: [Nach Implementation]

2. **Test 2: High Noise (μ=1e-9, σ=2e-10)**
   - Input: Schlechter RGA mit hohem Baseline
   - Expected: LOD ≈ 1e-9 + 6e-10 = 1.6e-9 mbar
   - Actual: [Nach Implementation]

3. **Test 3: No Noise Region (alle Massen kontaminiert)**
   - Input: Extrem dreckiges System
   - Expected: Fallback zu 1e-10 (default)
   - Actual: [Nach Implementation]

**Erfolgs-Kriterien:**
- [ ] LOD wird korrekt aus m/z 5-10 berechnet
- [ ] Detektoren nutzen dynamicLOD statt minPeakHeight
- [ ] UI zeigt LOD-Linie im Spektrum
- [ ] Fallback funktioniert bei fehlenden Noise-Daten
- [ ] Keine Regressions in Detector-Tests

---

## Changelog

| Datum | Status | Notiz |
|-------|--------|-------|
| 2026-01-10 | ⬜ Geplant | Initiale Planung basierend auf Gemini-3-Pro + IUPAC Standard |

---

**Template-Version:** 1.0
**Erstellt:** 2026-01-10
**Autor:** Claude Code
**Gemini Feature ID:** 2.2 (Dynamic LOD)
