# Plan: Statistical Uncertainty Calculation (1.9.3) - Gemini Refined

## Ausgangslage

**Problem:** Die bisherige Leckraten-Berechnung suggeriert eine falsche Präzision, da sie Messunsicherheiten ignoriert.
**Originaler Plan:** Berechnung von Standard Error (SE) nur aus dem Linearen Fit ($SE_{slope}$).

**Gemini Analyse & Validierung (10.01.2026):**
Der originale Plan ist unvollständig.
1.  **Fehlender Fehler-Term:** Leckrate $Q = V \cdot slope$. Die Unsicherheit des Volumens $V$ (oft 5-10%) dominiert oft den Fehler, wird aber ignoriert.
    *   *Formel:* $(\frac{\Delta Q}{Q})^2 = (\frac{\Delta V}{V})^2 + (\frac{SE_{slope}}{slope})^2$
2.  **UI Fehler:** Die Berechnung der Balken-Breite im UI-Entwurf war relativ statt absolut und falsch positioniert.

---

## Verbesserte Methode: Total Uncertainty

Wir berechnen die **Gesamtunsicherheit** nach Gauß'scher Fehlerfortpflanzung (ISO 20485 / GUM).

### Mathematisches Modell

$$u_c(Q) = Q \cdot \sqrt{ \left( \frac{u(V)}{V} \right)^2 + \left( \frac{u(slope)}{slope} \right)^2 }$$

Dabei:
*   $u(slope) = 2 \cdot SE_{slope}$ (95% Vertrauensbereich aus Regression)
*   $u(V)$: Unsicherheit des Volumens (User Input oder Default 5%)

### Validierungs-Quellen

| Thema | Quelle | Key Finding |
|-------|--------|-------------|
| **Total Uncertainty** | [ISO 20485:2017](https://www.iso.org/standard/60655.html) | Leckraten-Tests müssen ALLE Fehlerquellen (Druck, Zeit, **Volumen**) berücksichtigen. |
| **Volume Error** | [NASA Leak Testing Guide](https://ntrs.nasa.gov/citations/19700029328) | Volumen-Schätzung ist oft die größte Fehlerquelle bei RoR-Tests. |
| **Outgassing** | Lesker / Pfeiffer Tech Notes | Ausgasung ist systematische Fehlerquelle (Bias), nicht nur statistisch. |

---

## Geplante Implementierung (Refined)

### Schritt 1: Propagierung mit Volumen-Fehler

```typescript
export function calculateLeakRateTotalUncertainty(
  slope: number,             // dP/dt
  slopeSE: number,           // Standard Error of Slope
  volume: number,            // Chamber Volume
  volumeRelError = 0.05      // Default 5% Uncertainty for Volume
): number {
  
  // 1. Relative Unsicherheiten (Squared)
  // Wir nutzen 2*SE für 95% Confidence beim Slope
  const relSlopeErrorSq = Math.pow((2 * slopeSE) / slope, 2);
  const relVolumeErrorSq = Math.pow(volumeRelError, 2);

  // 2. Kombinierter relativer Fehler (Geometric Sum)
  const totalRelError = Math.sqrt(relSlopeErrorSq + relVolumeErrorSq);

  // 3. Absolute Unsicherheit
  const leakRate = slope * volume;
  return Math.abs(leakRate * totalRelError);
}
```

### Schritt 2: Korrigierte UI Visualisierung

Wir müssen den Balken relativ zu einem festen Maßstab zeichnen, z.B. $0$ bis $Max(Q + \Delta Q)$.

```typescript
// Helper zur Berechnung der Balken-Positionen
const maxVal = leakRate + leakRateUncertainty;
const minDisplay = 0; // Leckrate ist immer > 0
const maxDisplay = maxVal * 1.2; // 20% Headroom

// Positionen in % (0-100)
const posQ = (leakRate / maxDisplay) * 100;
const posMin = ((leakRate - leakRateUncertainty) / maxDisplay) * 100;
const posMax = ((leakRate + leakRateUncertainty) / maxDisplay) * 100;

return (
  <div className="relative w-full h-8 bg-gray-100 rounded mt-2">
    {/* Uncertainty Range (Light Blue) */}
    <div 
      className="absolute h-full bg-blue-200 opacity-50"
      style={{ left: `${posMin}%`, width: `${posMax - posMin}%` }}
    />
    
    {/* Main Value Marker (Dark Line) */}
    <div 
      className="absolute h-full w-1 bg-blue-600"
      style={{ left: `${posQ}%` }}
    />
    
    {/* Labels (optional) */}
    <span className="absolute text-xs" style={{ left: `${posMin}%`, top: '100%' }}>
      -{(leakRateUncertainty).toExponential(1)}
    </span>
  </div>
);
```

---

## Verifikation

**Test-Szenario "Perfect Fit, Uncertain Volume":**
*   **Input:** Perfekte Gerade (SE=0), Volumen 10L ± 10%.
*   **Original Plan:** Unsicherheit = 0 (Falsch! Volumen ist unsicher).
*   **Gemini Plan:** Unsicherheit = 10% (Korrekt).

**Test-Szenario "Noisy Fit":**
*   **Input:** Rauschende Daten (SE=10%), Volumen exakt (0%).
*   **Result:** Unsicherheit = 10% (vom Fit dominiert).

**Template-Version:** 1.0 (Gemini Refined & Validated)
**Erstellt:** 2026-01-10
