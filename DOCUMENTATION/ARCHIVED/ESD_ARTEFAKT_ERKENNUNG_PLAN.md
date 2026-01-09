# Plan: ESD-Artefakt-Erkennung erweitern (1.5.4)

## Ausgangslage

**Aktueller Stand:** Es gibt bereits eine `detectESDartifacts()` Funktion in [detectors.ts:634-705](src/lib/diagnosis/detectors.ts#L634-L705) mit 3 Kriterien:
1. O⁺/O₂ Verhältnis (m16/m32 > 0.5)
2. F⁺ ohne CF₃⁺ (m19 ohne m69)
3. Cl-Isotopenverhältnis anomal (m35/m37 ≠ 3.1)

**Problem:** Die Erkennung ist zu simpel. ESD (Electron Stimulated Desorption) erzeugt charakteristische Muster die nicht erkannt werden.

## Was ist ESD?

Elektronen im Ionisator desorbieren Moleküle von Gitter-Oberflächen und ionisieren sie. Dies erzeugt:
- **Anomal hohe atomare Ionen** (N⁺, O⁺, C⁺) relativ zu molekularen Ionen
- **Unerwartete Halogen-Peaks** (F⁺, Cl⁺) von adsorbierten Verunreinigungen
- **Überhöhte Fragment-Verhältnisse** gegenüber NIST-Standards

## Geplante Erweiterungen

### 1. Neue ESD-Marker (4 zusätzliche Kriterien)

| Kriterium | Massen | Normal | ESD-Anomalie | Konfidenz |
|-----------|--------|--------|--------------|-----------|
| N⁺/N₂⁺ Ratio | m14/m28 | ~0.07 | >0.15 | +0.25 |
| C⁺/CO⁺ Ratio | m12/m28 | ~0.05 | >0.12 | +0.25 |
| CO⁺⁺ Doppelt-Ion | m14 ohne N₂ | <0.01 | >0.05 | +0.20 |
| H⁺/H₂⁺ Ratio | m1/m2 | ~0.01 | >0.05 | +0.20 |

### 2. Pattern-Scoring verbessern

- **Multi-Kriterien:** Mindestens 2 von 7 Kriterien müssen erfüllt sein
- **Severity-Upgrade:** Bei ≥4 Kriterien → `warning` statt `info`
- **Affected Masses:** Dynamisch basierend auf gefundenen Anomalien

### 3. Bessere Empfehlungen

- Spezifische Degassing-Parameter (Strom, Spannung, Dauer)
- Unterscheidung: leichte vs. schwere ESD-Kontamination
- Hinweis auf mögliche Ursachen (neue Filamente, Kontamination)

## Dateien zu ändern

| Datei | Änderung |
|-------|----------|
| [src/lib/diagnosis/detectors.ts](src/lib/diagnosis/detectors.ts) | `detectESDartifacts()` erweitern (Zeile 634-705) |

**Keine weiteren Dateien nötig** - Types und UI-Integration existieren bereits.

## Implementierung

### Schritt 1: Neue Konstanten definieren

```typescript
// ESD-spezifische Schwellenwerte
const ESD_THRESHOLDS = {
  n_ratio: { normal: 0.07, anomaly: 0.15 },      // m14/m28
  c_ratio: { normal: 0.05, anomaly: 0.12 },      // m12/m28
  h_ratio: { normal: 0.01, anomaly: 0.05 },      // m1/m2
  o_ratio: { normal: 0.15, anomaly: 0.50 },      // m16/m32 (existiert)
  minCriteriaForWarning: 4                        // Severity upgrade
}
```

### Schritt 2: `detectESDartifacts()` erweitern

Neue Kriterien hinzufügen:

```typescript
// NEU: N⁺/N₂⁺ Ratio (ESD erzeugt mehr N⁺)
const m14 = getPeak(peaks, 14)  // N⁺
const m28 = getPeak(peaks, 28)  // N₂⁺ oder CO⁺
if (m14 > 0 && m28 > DEFAULT_THRESHOLDS.minPeakHeight) {
  const n_ratio = m14 / m28
  if (n_ratio > ESD_THRESHOLDS.n_ratio.anomaly) {
    evidence.push(...)
    confidence += 0.25
  }
}

// NEU: C⁺/CO Ratio
const m12 = getPeak(peaks, 12)  // C⁺
// ... analog

// NEU: H⁺/H₂ Ratio
const m1 = getPeak(peaks, 1)   // H⁺
const m2 = getPeak(peaks, 2)   // H₂⁺
// ... analog
```

### Schritt 3: Severity-Logic anpassen

```typescript
// Anzahl erfüllter Kriterien zählen
const criteriaCount = evidence.filter(e => !e.passed).length

// Severity basierend auf Anzahl
const severity = criteriaCount >= ESD_THRESHOLDS.minCriteriaForWarning
  ? 'warning'
  : 'info'
```

### Schritt 4: Affected Masses dynamisch

```typescript
// Nur tatsächlich betroffene Massen listen
const affectedMasses = [
  m16 > 0 && ratio_16_32 > 0.5 ? 16 : null,
  m14 > 0 && n_ratio > 0.15 ? 14 : null,
  // ... etc
].filter(Boolean) as number[]
```

## Geschätzter Aufwand

- **Implementation:** ~1-2h
- **Testen:** ~30min
- **Gesamt:** 2-3h (innerhalb der Spec-Schätzung von 2-4h)

## Verifikation

1. **Test mit bekanntem ESD-Spektrum:** Sollte erkannt werden
2. **Test mit normalem Spektrum:** Sollte NICHT fälschlich triggern
3. **Test mit Luft-Leck:** Sollte als AIR_LEAK erkannt werden, nicht ESD
4. **UI-Check:** DiagnosisPanel zeigt ⚡ Icon und expandierbare Details
