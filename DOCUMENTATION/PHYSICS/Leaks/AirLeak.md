# Air Leak Detection - Scientific Basis / Wissenschaftliche Grundlagen

> **Consolidated Documentation**
> This document consolidates:
> - `FEATURE_1.5.1_AIR_LEAK_DETECTION.md` (436 lines)
> - `detectAirLeak.md` (253 lines)
>
> Consolidation date: 2026-01-11
> Part of knowledge base reorganization to mirror modular detector architecture.

---

**Detector Function:** `detectAirLeak()`
**Code Location:** `src/modules/rga/lib/detectors/leaks/detectAirLeak.ts`
**Validation Status:** ✅ Cross-Validated (Gemini + Grok, 2026-01-11)
**Sources:** NIST, CRC Handbook, NOAA

---

## 🇬🇧 English Version

### Summary

The air leak detector identifies atmospheric air leaks by analyzing characteristic ratios of nitrogen (N₂), oxygen (O₂), and argon (Ar) in the RGA spectrum. The detection is based on the unique composition of Earth's atmosphere.

### Physical Model

#### Atmospheric Composition (Dry Air at Sea Level)

| Gas | Volume % | Main Peak (m/z) |
|-----|----------|-----------------|
| N₂ | 78.084% | 28 |
| O₂ | 20.946% | 32 |
| Ar | 0.934% | 40 |
| CO₂ | 0.041% | 44 |

**Source:** CRC Handbook of Chemistry and Physics, NOAA

#### Characteristic Ratios

The detector uses three independent criteria to identify air leaks:

**1. N₂/O₂ Ratio (Primary Criterion)**
- **Expected Value:** 78.084 / 20.946 = **3.73**
- **Implemented Range:** 3.0 - 4.5
- **Confidence Weight:** 40%

This is the most reliable indicator. The ratio is remarkably constant in Earth's atmosphere and differs significantly from other gas sources (e.g., pure oxygen for welding, nitrogen purge gas).

**2. Argon Presence (Secondary Criterion)**
- **Detection:** m/z 40 signal above threshold
- **Confidence Weight:** 30%
- **Additional Check:** Ar²⁺/Ar⁺ ratio at m/z 20/40 (doubly charged argon)
  - **Expected:** 10-15% (at 70 eV electron impact)
  - **Range:** 5-20%
  - **Extra Weight:** +10%

Argon is unique to atmospheric air. Most industrial gases (N₂, O₂, He) contain no argon.

**3. N₂ Fragmentation Pattern (Confirmation)**
- **Ratio:** N₂⁺/N⁺ (m/z 28 / m/z 14)
- **Expected:** ~14 (NIST: 28=100%, 14=7.2%)
- **Range:** 6 - 20
- **Confidence Weight:** 20%

The nitrogen fragmentation pattern helps distinguish N₂ from CO (carbon monoxide), which also appears at m/z 28 but produces C⁺ at m/z 12 instead of N⁺ at m/z 14.

### Confidence Calculation

The detector combines multiple independent criteria to reduce false positives:

```
Total Confidence = 0.0

IF N₂/O₂ ratio is 3.0-4.5:     +40%
IF Argon detected (m/z 40):     +30%
  IF Ar²⁺/Ar⁺ is 0.05-0.2:      +10%
IF N⁺/N₂⁺ ratio is 6-20:        +20%

Maximum Confidence = 100%
Threshold for Detection = 30%
```

**Severity Classification:**
- **Confidence > 70%:** Critical (major leak)
- **Confidence 30-70%:** Warning (minor leak)

### Assumptions & Limitations

#### Assumptions
1. **Dry Air:** No humidity correction applied
2. **Standard Atmosphere:** No altitude correction
3. **No CO Correction:** m/z 28 treated as pure N₂
4. **Standard EI:** Fragmentation patterns based on 70 eV electron impact

#### Limitations
1. **CO Interference:** High CO levels (combustion processes) can distort the N₂/O₂ ratio
2. **Small Leaks:** Very small leaks may be masked by residual gas (H₂O, H₂)
3. **No Quantification:** Leak rate is not calculated, only qualitative detection
4. **Isotope Check Implemented:** ⁴⁰Ar/³⁶Ar ratio now checked (implemented Feature 1.8.4, 2026-01-11)

### Known Edge Cases

| Scenario | Effect | Mitigation |
|----------|--------|------------|
| **CO contamination** | False positive (high m/z 28) | Check m/z 12 (C⁺) manually |
| **Welding gas (pure Ar)** | Reduced false positive | ✅ Feature 1.8.4 implemented ³⁶Ar check |
| **Humid air** | Slightly lower O₂ ratio | Tolerance range compensates |
| **Very small leak** | False negative | Reduce threshold in settings |

### Validation

**Cross-Validated by:** Gemini-3-Pro + Grok (January 2026)

**Result:** ✅ Scientifically Valid
- N₂/O₂ ratio: Confirmed (NIST, CRC Handbook)
- Fragmentation patterns: Validated at 70 eV EI
- Tolerance ranges: Appropriate for RGA sensitivity

**Identified Gap:** Argon isotope ratio (⁴⁰Ar/³⁶Ar ≈ 298.6) not implemented
- **Importance:** Distinguishes atmospheric air from pure argon (welding gas)
- **Solution:** ✅ Feature 1.8.4 (Argon Ratio Update) implemented 2026-01-11

### References

**Primary Standards:**
- CRC Handbook of Chemistry and Physics - Atmospheric composition
- [NIST Chemistry WebBook](https://webbook.nist.gov/chemistry/) - EI fragmentation (70 eV)
- [NOAA Global Monitoring Lab](https://gml.noaa.gov/) - Atmospheric gases

**Isotope Standards:**
- Lee et al. (2006) - *Geochimica et Cosmochimica Acta* - ⁴⁰Ar/³⁶Ar = 298.56
- [CIAAW](https://ciaaw.org/argon.htm) (2007) - Argon isotopic composition

**RGA Applications:**
- [Pfeiffer Vacuum](https://www.pfeiffer-vacuum.com/) - Application Notes
- [Hiden Analytical](https://www.hidenanalytical.com/) - RGA Series Documentation

---

## 🇩🇪 Deutsche Version

### Zusammenfassung

Der Luftleck-Detektor identifiziert atmosphärische Luftlecks durch Analyse charakteristischer Verhältnisse von Stickstoff (N₂), Sauerstoff (O₂) und Argon (Ar) im RGA-Spektrum. Die Erkennung basiert auf der einzigartigen Zusammensetzung der Erdatmosphäre.

### Physikalisches Modell

#### Atmosphärische Zusammensetzung (Trockene Luft auf Meereshöhe)

| Gas | Volumen-% | Hauptpeak (m/z) |
|-----|-----------|-----------------|
| N₂ | 78.084% | 28 |
| O₂ | 20.946% | 32 |
| Ar | 0.934% | 40 |
| CO₂ | 0.041% | 44 |

**Quelle:** CRC Handbook of Chemistry and Physics, NOAA

#### Charakteristische Verhältnisse

Der Detektor verwendet drei unabhängige Kriterien zur Identifikation von Luftlecks:

**1. N₂/O₂-Verhältnis (Primärkriterium)**
- **Erwarteter Wert:** 78.084 / 20.946 = **3.73**
- **Implementierter Bereich:** 3.0 - 4.5
- **Konfidenz-Gewichtung:** 40%

Dies ist der zuverlässigste Indikator. Das Verhältnis ist in der Erdatmosphäre bemerkenswert konstant und unterscheidet sich deutlich von anderen Gasquellen (z.B. reiner Sauerstoff zum Schweißen, Stickstoff-Spülgas).

**2. Argon-Präsenz (Sekundärkriterium)**
- **Nachweis:** m/z 40 Signal über Schwellwert
- **Konfidenz-Gewichtung:** 30%
- **Zusätzliche Prüfung:** Ar²⁺/Ar⁺-Verhältnis bei m/z 20/40 (doppelt geladenes Argon)
  - **Erwartet:** 10-15% (bei 70 eV Elektronenstoß)
  - **Bereich:** 5-20%
  - **Extra-Gewichtung:** +10%

Argon ist einzigartig für atmosphärische Luft. Die meisten Industriegase (N₂, O₂, He) enthalten kein Argon.

**3. N₂-Fragmentierungsmuster (Bestätigung)**
- **Verhältnis:** N₂⁺/N⁺ (m/z 28 / m/z 14)
- **Erwartet:** ~14 (NIST: 28=100%, 14=7.2%)
- **Bereich:** 6 - 20
- **Konfidenz-Gewichtung:** 20%

Das Stickstoff-Fragmentierungsmuster hilft N₂ von CO (Kohlenmonoxid) zu unterscheiden, das ebenfalls bei m/z 28 erscheint, aber C⁺ bei m/z 12 statt N⁺ bei m/z 14 produziert.

### Konfidenz-Berechnung

Der Detektor kombiniert mehrere unabhängige Kriterien, um Fehlalarme zu reduzieren:

```
Gesamt-Konfidenz = 0.0

WENN N₂/O₂-Verhältnis 3.0-4.5:  +40%
WENN Argon detektiert (m/z 40): +30%
  WENN Ar²⁺/Ar⁺ ist 0.05-0.2:    +10%
WENN N⁺/N₂⁺-Verhältnis 6-20:    +20%

Maximale Konfidenz = 100%
Schwellwert für Erkennung = 30%
```

**Schweregrad-Klassifikation:**
- **Konfidenz > 70%:** Kritisch (großes Leck)
- **Konfidenz 30-70%:** Warnung (kleines Leck)

### Annahmen & Limitationen

#### Annahmen
1. **Trockene Luft:** Keine Feuchtigkeitskorrektur
2. **Standard-Atmosphäre:** Keine Höhenkorrektur
3. **Keine CO-Korrektur:** m/z 28 wird als reines N₂ behandelt
4. **Standard-EI:** Fragmentierungsmuster basieren auf 70 eV Elektronenstoß

#### Limitationen
1. **CO-Interferenz:** Hohe CO-Werte (Verbrennungsprozesse) können das N₂/O₂-Verhältnis verfälschen
2. **Kleine Lecks:** Sehr kleine Lecks können durch Restgas (H₂O, H₂) maskiert werden
3. **Keine Quantifizierung:** Leckrate wird nicht berechnet, nur qualitative Erkennung
4. **Isotopen-Prüfung implementiert:** ⁴⁰Ar/³⁶Ar-Verhältnis jetzt geprüft (Feature 1.8.4 implementiert, 2026-01-11)

### Bekannte Grenzfälle

| Szenario | Effekt | Gegenmaßnahme |
|----------|--------|---------------|
| **CO-Kontamination** | Falsch-positiv (hohes m/z 28) | m/z 12 (C⁺) manuell prüfen |
| **Schweißgas (reines Ar)** | Reduzierte Falsch-positiv | ✅ Feature 1.8.4 hat ³⁶Ar-Prüfung hinzugefügt |
| **Feuchte Luft** | Leicht niedrigeres O₂-Verhältnis | Toleranzbereich kompensiert |
| **Sehr kleines Leck** | Falsch-negativ | Schwellwert in Einstellungen reduzieren |

### Validierung

**Cross-Validiert durch:** Gemini-3-Pro + Grok (Januar 2026)

**Ergebnis:** ✅ Wissenschaftlich valide
- N₂/O₂-Verhältnis: Bestätigt (NIST, CRC Handbook)
- Fragmentierungsmuster: Validiert bei 70 eV EI
- Toleranzbereiche: Angemessen für RGA-Empfindlichkeit

**Identifizierte Lücke:** Argon-Isotopenverhältnis (⁴⁰Ar/³⁶Ar ≈ 298.6) nicht implementiert
- **Wichtigkeit:** Unterscheidet atmosphärische Luft von reinem Argon (Schweißgas)
- **Lösung:** ✅ Feature 1.8.4 (Argon Ratio Update) implementiert 2026-01-11

### Referenzen

**Primäre Standards:**
- CRC Handbook of Chemistry and Physics - Atmosphärische Zusammensetzung
- [NIST Chemistry WebBook](https://webbook.nist.gov/chemistry/) - EI-Fragmentierung (70 eV)
- [NOAA Global Monitoring Lab](https://gml.noaa.gov/) - Atmosphärische Gase

**Isotopen-Standards:**
- Lee et al. (2006) - *Geochimica et Cosmochimica Acta* - ⁴⁰Ar/³⁶Ar = 298.56
- [CIAAW](https://ciaaw.org/argon.htm) (2007) - Argon-Isotopenzusammensetzung

**RGA-Anwendungen:**
- [Pfeiffer Vacuum](https://www.pfeiffer-vacuum.com/) - Anwendungshinweise
- [Hiden Analytical](https://www.hidenanalytical.com/) - RGA-Serie Dokumentation

---

**Document Version:** 2.0 (Consolidated)
**Last Updated:** 2026-01-11
**Validation:** ✅ Cross-Validated (Gemini + Grok)
**Reorganization:** Part of knowledge base restructuring (Phase 3)
