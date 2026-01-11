# Plan: Intelligent Background Subtraction (1.9.4) - Gemini Refined

## Ausgangslage

**Problem:** User möchte *Änderungen* im Spektrum sehen (z.B. "Was kam durch das neue Gas hinzu?"), indem er das Basis-Vakuum abzieht.
**Originaler Plan:** Auto-Skalierung mit Totaldruck.

**Gemini Analyse & Validierung (10.01.2026):**
Der originale Plan enthielt einen **kritischen Fehler**:
*   Skalierung mit Totaldruck-Ratio ($P_{sample}/P_{bg}$) ist physikalisch falsch.
*   Beim Gaseinlass steigt der Totaldruck, aber das Restgas (Hintergrund) bleibt konstant. Eine Skalierung würde den Hintergrund fälschlicherweise vervielfachen und das Ergebnisspektrum zerstören.

---

## Verbesserte Methode: Direct Subtraction

Wir implementieren eine **1:1 Subtraktion** (Standard in der Spektroskopie) mit optionalen Features für Experte.

### Mathematisches Modell

$$P_{\text{corrected}}(m) = P_{\text{sample}}(m) - P_{\text{background}}(m)$$

*   **Kein Auto-Scaling:** Wir nehmen an, dass der Hintergrund (Ausgasung der Kammer) unabhängig vom Prozessgas konstant ist.
*   **Negative Handling:**
    *   *Calculation:* Behalte negative Werte intern (wichtig für Statistik).
    *   *Display:* Zeige negative Werte als 0 (Clamping) oder in anderer Farbe (für Diagnose).

### Validierungs-Quellen

| Thema | Quelle | Key Finding |
|-------|--------|-------------|
| **Background Subtraction** | [NIST Mass Spec Data Center](https://chemdata.nist.gov/) | Standardpraxis zur Isolierung von Komponenten. Background Scaling wird nur bei *Verdünnungsreihen* genutzt, nicht bei Gaseinlass. |
| **Gas Inlet Physics** | [Pfeiffer Vacuum Know-How](https://www.pfeiffer-vacuum.com/en/know-how/) | Partialdrücke sind additiv (Dalton's Law). Restgas verschwindet nicht durch Gaseinlass. |
| **Negative Signals** | Analytical Chemistry Best Practices | "Zeroing" kann Bias erzeugen. Negative Werte deuten oft auf Suppression-Effekte oder Signal-Drift hin. |

---

## Geplante Implementierung (Refined)

### Schritt 1: Subtraktions-Logik

```typescript
export interface SubtractionResult {
  mass: number;
  value: number;       // Adjusted Value (kann negativ sein für Analyse)
  displayValue: number // Clamped Value (>= 0) für Charts
  isNegative: boolean; // Flag für UI
}

export function subtractBackground(
  sample: Map<number, number>,
  background: Map<number, number>
): Map<number, SubtractionResult> {
  const result = new Map<number, SubtractionResult>();

  // Iteriere über Sample (und Background, falls dort Peaks sind die im Sample fehlen)
  const allMasses = new Set([...sample.keys(), ...background.keys()]);

  for (const mass of allMasses) {
    const valSample = sample.get(mass) || 0;
    const valBg = background.get(mass) || 0;
    
    // Einfache Subtraktion ohne Skalierung
    const diff = valSample - valBg;

    result.set(mass, {
      mass,
      value: diff,
      displayValue: Math.max(0, diff),
      isNegative: diff < 0
    });
  }

  return result;
}
```

### Schritt 2: UI Visualisierung

Zeige das korrigierte Spektrum.
*   **Positiver Teil:** Normaler Balken (z.B. Blau).
*   **Negativer Teil:** Optionale Anzeige (z.B. leichtes transparentes Rot nach unten), um "Over-Subtraction" zu erkennen (Diagnose-Tool: "Ist mein Hintergrund wirklich sauberer als mein Sample?").

---

## Verifikation

**Test-Szenario "Argon Einlass":**
*   **Hintergrund:** $10^{-8}$ mbar $H_2O$ (Restgas).
*   **Sample:** $10^{-5}$ mbar $Ar$ + $10^{-8}$ mbar $H_2O$.
*   **Gemini Plan:**
    *   $Ar$: $10^{-5} - 0 \approx 10^{-5}$ (Sichtbar).
    *   $H_2O$: $10^{-8} - 10^{-8} \approx 0$ (Korrekt entfernt).
*   **Original Plan (Fehler):**
    *   Scaling Factor = $10^{-5}/10^{-8} = 1000$.
    *   $H_2O_{corr} = 10^{-8} - (1000 \cdot 10^{-8}) = -10^{-5}$ (Massiv negativ! Falsch).

**Template-Version:** 1.0 (Gemini Refined & Validated)
**Erstellt:** 2026-01-10
