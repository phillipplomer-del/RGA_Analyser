# Reverse-Spec: detectAirLeak()

**Status:** ⏳ Zur Prüfung (Awaiting Gemini/Grok Review)
**Source File:** [detectors.ts:43-130](src/lib/diagnosis/detectors.ts#L43-L130)
**Created:** 2026-01-11
**Author:** Claude Code (Reverse Engineering)

---

## 1. Zusammenfassung / Summary

**DE:** Erkennt atmosphärische Luft-Lecks anhand charakteristischer Verhältnisse von N₂, O₂ und Ar.

**EN:** Detects atmospheric air leaks using characteristic ratios of N₂, O₂, and Ar.

---

## 2. Physikalisches Modell / Physical Model

### 2.1 Luft-Zusammensetzung (Trockene Luft auf Meereshöhe)

| Gas | Volumen-% | m/z (Hauptpeak) |
|-----|-----------|-----------------|
| N₂ | 78.084% | 28 |
| O₂ | 20.946% | 32 |
| Ar | 0.934% | 40 |
| CO₂ | 0.041% | 44 |

**Quelle:** CRC Handbook of Chemistry and Physics, NOAA

### 2.2 Charakteristische Verhältnisse

| Verhältnis | Formel | Erwarteter Wert | Implementierter Bereich |
|------------|--------|-----------------|------------------------|
| **N₂/O₂** | m28/m32 | 78.084/20.946 = **3.73** | 3.0 - 4.5 |
| **Ar²⁺/Ar⁺** | m20/m40 | ~0.10-0.15 (EI-typisch) | 0.05 - 0.2 |
| **N₂⁺/N⁺** | m28/m14 | ~7-14 (EI @ 70eV) | 6 - 20 |

---

## 3. Implementierte Logik / Implementation Logic

### 3.1 Konfidenz-Berechnung

```typescript
confidence = 0.0

// Kriterium 1: N₂/O₂ Verhältnis (Gewicht: 0.4)
if (m32 > minPeakHeight) {
  ratio_28_32 = m28 / m32
  if (ratio_28_32 >= 3.0 && ratio_28_32 <= 4.5) {
    confidence += 0.4
  }
}

// Kriterium 2: Argon-Präsenz (Gewicht: 0.3)
if (m40 > minPeakHeight) {
  confidence += 0.3

  // Kriterium 2b: Ar²⁺/Ar⁺ Check (Gewicht: 0.1)
  ar_doubly = m20 / m40
  if (ar_doubly >= 0.05 && ar_doubly <= 0.2) {
    confidence += 0.1
  }
}

// Kriterium 3: N₂ Fragmentierung (Gewicht: 0.2)
if (m28 > 0 && m14 > 0) {
  ratio_28_14 = m28 / m14
  if (ratio_28_14 >= 6 && ratio_28_14 <= 20) {
    confidence += 0.2
  }
}

// Schwellwert: confidence >= 0.3
```

### 3.2 Severity-Berechnung

```typescript
severity = confidence > 0.7 ? 'critical' : 'warning'
```

---

## 4. Wissenschaftliche Validierung / Scientific Validation

### 4.1 N₂/O₂ Verhältnis

**Frage:** Ist 3.73 korrekt? Ist der Bereich 3.0-4.5 sinnvoll?

**Analyse:**
- Theoretischer Wert: 78.084/20.946 = 3.728
- Implementiert: 3.73 ± ~20% Toleranz (3.0-4.5)

**Potenzielle Probleme:**
1. Bei hoher Feuchtigkeit kann O₂ leicht erhöht erscheinen (H₂O-Fragmentierung bei m/z 32 minimal, aber möglich)
2. CO bei m/z 28 kann N₂-Signal erhöhen → falsches Verhältnis
3. CO₂-Fragmentierung erzeugt CO bei m/z 28

**Quellen zu prüfen:**
- [ ] Pfeiffer/Hiden Application Notes für typische Luft-Spektren
- [ ] NIST WebBook für N₂, O₂ Fragmentierungsmuster

### 4.2 Ar²⁺/Ar⁺ Verhältnis (m20/m40)

**Frage:** Warum 0.1-0.15 erwartet?

**Analyse:**
- Doppelt geladenes Ar²⁺ erscheint bei m/z 20 (40/2)
- Verhältnis hängt stark von Ionisierungsenergie ab
- Bei 70 eV EI typischerweise 10-15% des Ar⁺ Signals

**Potenzielle Probleme:**
1. Ne bei m/z 20 könnte Ar²⁺ vortäuschen (aber Ne selten in Labor-Vakuum)
2. Doppelt geladenes Ca²⁺ bei m/z 20 (bei Kalkstein-Proben)

**Quellen zu prüfen:**
- [ ] NIST Ar Fragmentierungsmuster bei 70 eV
- [ ] Hiden/Pfeiffer Dokumentation zu doppelt geladenen Ionen

### 4.3 N₂⁺/N⁺ Verhältnis (m28/m14)

**Frage:** Ist der Wert ~14 und Bereich 6-20 korrekt?

**Analyse:**
- N⁺ (m/z 14) entsteht durch Fragmentierung von N₂
- NIST gibt N₂: m/z 28 = 100%, m/z 14 = 7.2% → Verhältnis = 13.9
- Implementiert: "typisch 14" mit Bereich 6-20

**Potenzielle Probleme:**
1. N⁺ kann auch von NH₃ (m17→m14) oder Aminen stammen
2. CO-Fragmentierung erzeugt KEIN N⁺, aber C⁺ bei m12
3. Bei ESD-Artefakten ist N⁺/N₂⁺ erhöht (bereits in detectESDArtefacts abgedeckt)

**Quellen zu prüfen:**
- [ ] NIST WebBook N₂ EI-MS bei 70 eV
- [ ] Validierung gegen reale Luft-Leck-Spektren

### 4.4 Argon-Isotopen-Verhältnis (NICHT implementiert)

**Beobachtung:** Der Detektor verwendet NICHT das ⁴⁰Ar/³⁶Ar Verhältnis (295.5 oder 298.56).

**Frage:** Sollte ³⁶Ar bei m/z 36 geprüft werden?

**Analyse:**
- ⁴⁰Ar: 99.6%, ³⁶Ar: 0.337% → Verhältnis ~296
- Bei typischen RGA-Empfindlichkeiten könnte ³⁶Ar zu schwach sein
- Aber: Könnte zusätzliche Konfidenz geben bei starkem Ar-Signal

**Empfehlung:** Optionale Prüfung wenn m40 > 1% hinzufügen?

---

## 5. Annahmen & Limitationen / Assumptions & Limitations

### 5.1 Annahmen

1. **Trockene Luft:** Feuchtigkeit nicht berücksichtigt
2. **Standard-Atmosphäre:** Keine Höhenkorrektur
3. **Keine CO-Korrektur:** m/z 28 wird als reines N₂ behandelt
4. **EI bei ~70 eV:** Fragmentierungsmuster basieren auf Standard-Ionisierung

### 5.2 Limitationen

1. **CO-Überlagerung:** Bei hohem CO-Anteil (Verbrennungsprozesse) kann Verhältnis verfälscht sein
2. **Kleine Lecks:** Bei sehr kleinen Lecks dominiert Restgas (H₂O, H₂)
3. **Keine Quantifizierung:** Leckrate wird nicht berechnet
4. **Keine N₂-Isotopen:** ¹⁵N¹⁴N bei m/z 29 nicht geprüft

---

## 6. Implementierte Konstanten / Constants Used

| Konstante | Wert | Quelle | Validiert? |
|-----------|------|--------|------------|
| N₂/O₂ Verhältnis (Luft) | 3.73 | CRC Handbook | ⏳ |
| N₂/O₂ Toleranz | ±20% (3.0-4.5) | Empirisch | ⏳ |
| Ar²⁺/Ar⁺ Verhältnis | 0.1-0.15 | RGA-Erfahrung | ⏳ |
| N₂⁺/N⁺ Verhältnis | ~14 (6-20) | NIST | ⏳ |
| minPeakHeight | DEFAULT_THRESHOLDS | types.ts | - |
| minConfidence | DEFAULT_THRESHOLDS | types.ts | - |

---

## 7. Offene Fragen für Gemini/Grok Review

### 7.1 Kritische Fragen

1. **N₂/O₂ = 3.73:** Ist dieser Wert korrekt? Sollte Feuchtigkeit berücksichtigt werden?

2. **Toleranzbereich 3.0-4.5:** Ist ±20% zu weit? Sollte er enger sein (z.B. 3.5-4.0)?

3. **Ar²⁺/Ar⁺ = 0.1-0.15:** Ist dies bei 70 eV EI korrekt? Quellen?

4. **N₂⁺/N⁺ = 14:** NIST gibt 13.9 an. Passt der Bereich 6-20?

5. **Fehlende ³⁶Ar-Prüfung:** Sollte ⁴⁰Ar/³⁶Ar ≈ 296 geprüft werden?

6. **CO-Interferenz:** Sollte der Detektor prüfen ob m/z 12 (C⁺) erhöht ist?

### 7.2 Nicht-kritische Fragen

7. **Severity-Grenze 0.7:** Ist dies ein sinnvoller Wert für critical vs. warning?

8. **Gewichtung der Kriterien:** Ist 0.4/0.3/0.1/0.2 optimal?

---

## 8. Referenzen / References

### Bereits dokumentiert in SCIENTIFIC_REFERENCES.md:
- [Argon - Air Leak Detection](RGA_Knowledge/SCIENTIFIC_REFERENCES.md#argon---air-leak-detection)
- Lee et al. (2006) - ⁴⁰Ar/³⁶Ar = 298.56

### Zu prüfen:
- [ ] NIST WebBook: N₂ EI-MS (70 eV)
- [ ] NIST WebBook: O₂ EI-MS (70 eV)
- [ ] NIST WebBook: Ar EI-MS (70 eV)
- [ ] Pfeiffer: "How to Read an RGA Spectrum"
- [ ] Hiden: "Air Leak Detection Application Note"
- [ ] AVS: "Practical Residual Gas Analysis"

---

## 9. Review-Anweisungen für Gemini/Grok

Bitte prüfen Sie:

1. **Physikalische Korrektheit:** Sind die Verhältnisse und Bereiche wissenschaftlich korrekt?
2. **Quellen:** Können Sie die Werte mit peer-reviewed Quellen belegen?
3. **Fehlende Checks:** Gibt es wichtige Kriterien die fehlen?
4. **Edge Cases:** Wann könnte der Detektor falsch-positiv/negativ sein?
5. **Verbesserungen:** Konkrete Vorschläge mit Begründung

**Antwort-Format:**
```markdown
## Gemini/Grok Review: detectAirLeak

### Kritische Fehler gefunden
| Issue | Severity | Original | Korrektur | Quelle |
|-------|----------|----------|-----------|--------|

### Empfohlene Änderungen
1. ...

### Neue Quellen
- ...

### Approval Status
- [ ] Mathematisch korrekt
- [ ] Physikalisch korrekt
- [ ] Quellen autoritär
- [ ] Ready für RGA-Experten
```

---

**Template Version:** 1.0
**Nächster Schritt:** Manuelle Prüfung durch Gemini und Grok

---

## 🤖 Gemini Review & Critique (Validated 2026-01-11)

**RESULT:** ✅ SCIENTIFICALLY VALID

*   **Ratios Confirmed:** N2/O2 (3.73) and Fragment Ratios (N+/N2+ ~15%) are correct for standard 70eV Quadrupoles.
*   **Gap Identified:** The spec correctly notes the missing Argon Isotope Check. This is being addressed by **Feature 1.8.4**.

👉 **View Full Validation:** [REVERSE_SPEC_detectAirLeak_gemini.md](REVERSE_SPEC_detectAirLeak_gemini.md)
