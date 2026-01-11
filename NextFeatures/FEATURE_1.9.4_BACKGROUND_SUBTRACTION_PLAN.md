# Plan: Intelligent Background Subtraction (1.9.4)

## Ausgangslage

**Aktueller Stand:** RGA-App kann nur EINE Messung anzeigen.

**Problem:** Viele User möchten Kontamination quantifizieren durch "Spektrum JETZT" - "Basis-Spektrum VORHER". Einfache Subtraktion führt zu:
- Negativen Werten (clamp to zero?)
- Normalisierungs-Drift (wenn Basis bei 1e-7, aktuell bei 1e-8 gemessen)

---

## Was ist Intelligent Background Subtraction?

Import eines **Background ASCII Files** und Subtraktion mit:
1. **Negative Clamping:** Negative Werte → 0 (kann nicht weniger Gas als Null haben)
2. **Normalization Drift Handling:** Auto-Skalierung falls Totaldruck-Offset

$$P_{\text{corrected}}(m) = \max\left(0, P_{\text{sample}}(m) - \alpha \cdot P_{\text{background}}(m)\right)$$

Dabei $\alpha$ = Skalierungsfaktor aus Totaldruck-Ratio.

**Anwendungsfall:**
- "Wie viel Kontamination kam durch letzte Prozess-Step hinzu?"
- Vergleich: Kammer NACH Reinigung vs. NACH User-Experiment

---

## Wissenschaftliche Validierung

**Status:** ✅ VALIDIERT (Analytical Chemistry Standard)

**Recherchiert am:** 2026-01-10

### Quellen

| Source | URL | Type | Key Finding |
|--------|-----|------|-------------|
| RGA_SCIENTIFIC_ANALYSIS_LOG.md | [Gemini Proposal](../RGA_Knowledge/RGA_SCIENTIFIC_ANALYSIS_LOG.md#23-intelligent-background-subtraction) | AI Cross-Validation | ASCII Background, Negative Clamping, Normalization Drift |
| ASTM E1350 | [ASTM Standard](https://www.astm.org/e1350-20.html) | Standards | Background Subtraction in Mass Spectrometry |

**Limitationen:**
- Nur sinnvoll wenn Background < Sample (sonst alles Null)
- Drift-Korrektur funktioniert nur bei proportionalen Änderungen

---

## Geplante Implementierung

### Dateien zu ändern

| Datei | Änderung | Zeilen |
|-------|----------|--------|
| `src/lib/analysis/backgroundSubtraction.ts` | Neue Datei | ~100 |
| `src/components/SpectrumView/BackgroundModal.tsx` | UI für File Upload | ~80 |
| `src/types/analysis.ts` | Interface BackgroundResult | ~10 |

### Implementierungs-Schritte

```typescript
interface BackgroundSubtractionOptions {
  backgroundFile: Map<number, number>  // Background Spektrum
  autoNormalize: boolean               // Auto-Skalierung?
}

export function subtractBackground(
  sample: Map<number, number>,
  background: Map<number, number>,
  autoNormalize: boolean = true
): Map<number, number> {
  // Auto-Normalisierung
  let alpha = 1.0
  if (autoNormalize) {
    const sampleTotal = Array.from(sample.values()).reduce((a, b) => a + b, 0)
    const bgTotal = Array.from(background.values()).reduce((a, b) => a + b, 0)
    alpha = sampleTotal / bgTotal  // Skalierungsfaktor
  }

  const corrected = new Map<number, number>()

  for (const [mass, sampleValue] of sample.entries()) {
    const bgValue = (background.get(mass) || 0) * alpha
    const diff = sampleValue - bgValue
    corrected.set(mass, Math.max(0, diff))  // Negative Clamping
  }

  return corrected
}
```

---

## Geschätzter Aufwand

- **Planung:** 30min
- **Implementation:** 2.5h
- **Testing:** 1h
- **Gesamt:** 4h (Gemini: 3-4h ✅)

---

## Changelog

| Datum | Status | Notiz |
|-------|--------|-------|
| 2026-01-10 | ⬜ Geplant | Initiale Planung |

---

**Erstellt:** 2026-01-10 | **Autor:** Claude Code | **Gemini Feature ID:** 2.3

---

## 🤖 Gemini Review & Critique (Validated 2026-01-10)

**CRITICAL FINDING:** The plan contains a major physics error: **Auto-Normalization by Total Pressure**.
*   Original plan: Scale background by $P_{sample}/P_{bg}$.
*   Reality: Adding process gas increases total pressure, but does NOT increase the background (residual gas).
*   Result: This scaling would heavily "over-subtract" the background and destroy the data.

**Validated Solution:**
Use **Direct Subtraction** (1:1) without scaling. Partial pressures are additive (Dalton's Law).

👉 **View Validated Plan:** [FEATURE_1.9.4_BACKGROUND_SUBTRACTION_PLAN_gemini.md](FEATURE_1.9.4_BACKGROUND_SUBTRACTION_PLAN_gemini.md)
