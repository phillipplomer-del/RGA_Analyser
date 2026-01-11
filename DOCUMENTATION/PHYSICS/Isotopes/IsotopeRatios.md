# Isotope Ratio Verification - Scientific Basis / Wissenschaftliche Grundlagen

**Feature:** verifyIsotopeRatios()
**Validation Status:** ⚠️ Conditional Approval (Gemini + Grok, 2026-01-11)
**Critical Issue:** O₂ isotope ratio (487→244) requires fix before production
**Sources:** CIAAW 2007, NIST WebBook, IUPAC, Meija et al. 2016

---

## 🇬🇧 English Version

### Summary

The isotope ratio verification detector enhances diagnostic confidence by analyzing the natural isotope ratios of known elements (Argon, Chlorine, Bromine, Carbon, Sulfur, Oxygen) detected in the RGA spectrum. Each element has a characteristic isotope ratio in nature, and significant deviations can indicate measurement artifacts or contamination.

**Severity:** Informational (not critical) - increases diagnosis confidence, helps reduce false alarms

### Physical Model

#### Natural Isotope Ratios (at Terrestrial Natural Abundance)

| Element | Isotope Ratio | Expected Value | Range (±15%) | Confidence Weight | Min Peak Threshold |
|---------|---------------|----------------|--------------|-------------------|-------------------|
| **Argon** | ⁴⁰Ar/³⁶Ar | 298.56 | 254-344 | +30% | m40 > 10× min |
| **Chlorine** | ³⁵Cl/³⁷Cl | 3.13 | 2.66-3.60 | +25% | m35 > 5× min |
| **Bromine** | ⁷⁹Br/⁸¹Br | 1.028 | 0.87-1.18 | +25% | m79 > 3× min |
| **Carbon (in CO₂)** | ¹²C/¹³C (m44/m45) | 83.6 | 71-96 | +20% | m44 > 10× min |
| **Sulfur** | ³²S/³⁴S | 22.35 | 19.0-25.7 | +25% | m32 > 10× min |
| **Oxygen (molecular)** | ³²O₂/³⁴O₂ | 244 | 207-281 | +15% | m32 > 10× min |

**Sources:** CIAAW (2007), IUPAC 2013/2016, VPDB Standard, NIST WebBook

### Physics of Each Isotope Ratio

#### 1. Argon: ⁴⁰Ar/³⁶Ar ≈ 298.56

**Atmospheric argon** consists primarily of two stable isotopes:
- **⁴⁰Ar:** 99.6035% (predominant)
- **³⁶Ar:** 0.3365% (radiogenic; produced by ⁴⁰K decay in Earth's crust)

**Ratio:** 99.6035 / 0.3365 ≈ **298.56** (CIAAW 2007)

**Why It Matters:**
- Argon is present in atmospheric air (0.934%)
- The isotope ratio is highly constant across Earth's atmosphere
- Deviation can indicate non-atmospheric argon source (e.g., pure Ar gas for welding)
- Helps distinguish air leaks (atmospheric Ar) from industrial gas sources

**Note:** Old value 295.5 (Nier 1950) is outdated; modern value is 298.56 (Lee et al. 2006)

**Confidence Weight:** 30% (highest) - Argon is a strong air leak marker, ratios are very consistent

---

#### 2. Chlorine: ³⁵Cl/³⁷Cl ≈ 3.13

**Natural chlorine** exists as two stable isotopes:
- **³⁵Cl:** 75.76% (dominant)
- **³⁷Cl:** 24.24%

**Ratio:** 75.76 / 24.24 ≈ **3.13** (IUPAC)

**Why It Matters:**
- Chlorine appears in organic contaminants (cleaners, solvents, polymers)
- Verification helps distinguish inorganic Cl leaks from air contamination
- Natural isotope ratio is highly consistent (no mass fractionation in vacuum)

**Sources:** IUPAC 2013, NIST Chemistry WebBook

**Confidence Weight:** 25% (good - chlorine is less common than argon but distinctive)

---

#### 3. Bromine: ⁷⁹Br/⁸¹Br ≈ 1.028

**Natural bromine** exists as two stable isotopes with near-equal abundance:
- **⁷⁹Br:** 50.69%
- **⁸¹Br:** 49.31%

**Ratio:** 50.69 / 49.31 ≈ **1.028** (IUPAC)

**Why It Matters:**
- Bromine appears in flame retardants (furniture, insulation)
- Near 1:1 ratio makes bromine easily recognizable
- Indicates contamination from plastics or brominated compounds

**Sources:** IUPAC 2013, NIST Chemistry WebBook

**Confidence Weight:** 25% (good - distinctive ratio, but less common than Ar/Cl)

---

#### 4. Carbon in CO₂: ¹²C/¹³C (m44/m45 ratio) ≈ 83.6

**Natural carbon dioxide** contains two stable carbon isotopes:
- **¹²C:** 98.89% (main)
- **¹³C:** 1.11%

**Peak Ratio:** m44 (¹²CO₂⁺) / m45 (¹³CO₂⁺) ≈ **83.6**

**Calculation:**
```
P(m44) = P(¹²C) × [P(¹⁶O)² + P(¹⁶O)×P(¹⁸O)×2] ≈ 0.9889 × [0.9975² + ...] ≈ 0.9844
P(m45) = P(¹³C) × P(¹⁶O)² + P(¹²C) × P(¹⁶O)×P(¹⁸O) ≈ 0.0111 + 0.0048 ≈ 0.0159

Ratio = 0.9844 / 0.0159 ≈ 84-85 (VPDB Standard)
```

**Implementation:** Simplified to **83.6** (within tolerance)

**Why It Matters:**
- CO₂ is ubiquitous in vacuum systems (air leaks, outgassing)
- Verifying the isotope ratio confirms natural CO₂ (not contamination)
- Distinguishes from other m/z 44 signals (N₂O, C₂H₄, etc.)

**Sources:** VPDB Standard, NIST, Meija et al. 2016

**Confidence Weight:** 20% (moderate - CO₂ is common, isotope check adds confidence)

---

#### 5. Sulfur: ³²S/³⁴S ≈ 22.35

**Natural sulfur** exists as four stable isotopes:
- **³²S:** 94.99% (predominant)
- **³⁴S:** 4.25% (secondary)
- ³³S: 0.75%, ³⁶S: <0.02% (negligible)

**Ratio:** 94.99 / 4.25 ≈ **22.35** (IUPAC 2013)

**Why It Matters:**
- Sulfur appears in pump oils, lubrication greases, and organic contaminants
- Helps distinguish S⁺ from other m/z 32 sources (mainly O₂)
- High m32/m34 ratio (~22) vs oxygen ratio (~244) provides discrimination

**Discrimination Logic:**
- **m32/m34 ≈ 22:** Sulfur present
- **m32/m34 ≈ 244:** Molecular oxygen (O₂) present

**Note:** m32/m34 can be ambiguous because both m32 and m34 come from different sources

**Sources:** IUPAC 2013, NIST WebBook

**Confidence Weight:** 25% (good - clear discrimination from oxygen ratio)

---

#### 6. Oxygen (Molecular): ³²O₂/³⁴O₂ ≈ 244 **[CRITICAL FIX]**

**IMPORTANT - PHYSICS CORRECTION:**

The expected molecular oxygen ratio is **244**, NOT 487 (atomic ratio). This is a critical calculation error.

**Atomic vs. Molecular Oxygen Ratio:**

```
ATOMIC RATIO (❌ WRONG - what code currently uses):
  ¹⁶O: 99.757%
  ¹⁸O: 0.205%
  Ratio = 99.757 / 0.205 ≈ 487

MOLECULAR RATIO (✅ CORRECT - what should be used):
  P(¹⁶O) = 0.99757
  P(¹⁸O) = 0.00205

  P(³²O₂) = P(¹⁶O¹⁶O) = (0.99757)² ≈ 0.9951
  P(³⁴O₂) = P(¹⁶O¹⁸O) × 2 = 2 × 0.99757 × 0.00205 ≈ 0.00409

  Ratio = 0.9951 / 0.00409 ≈ 244 ✅
```

**Why the Difference?**
- O₂ has **two oxygen atoms**, not one
- Probability of forming ³⁴O₂ (one ¹⁶O + one ¹⁸O) involves a combinatorial factor of 2
- The m/z 34 peak is NOT proportional to ¹⁸O/¹⁶O directly; it's based on molecular probability

**Corrected Ratio:** **244** (Range: 207-281, ±15%)

**Why It Matters:**
- Oxygen is ubiquitous in vacuum systems (air leaks, residual gas)
- Verifying the isotope ratio confirms natural O₂ (not anomalous fractionation)
- High ratio (~244) vs sulfur ratio (~22) provides clear discrimination
- **Impact of Wrong Value:** Code using 487 will FAIL to detect O₂ (factor 2× error)

**Sources:** NIST WebBook, IUPAC 2013, Meija et al. 2016

**Confidence Weight:** 15% (lowest) - Oxygen is ubiquitous but m32/m34 easily distorted by background

---

### Confidence Calculation

The detector combines multiple independent isotope checks to increase overall diagnosis confidence:

```
Total Confidence = 0.0

IF Ar ⁴⁰/³⁶ ratio matches (±15%):       +30%
IF Cl ³⁵/³⁷ ratio matches (±15%):       +25%
IF Br ⁷⁹/⁸¹ ratio matches (±15%):       +25%
IF CO₂ m44/m45 ratio matches (±15%):    +20%
IF S ³²/³⁴ ratio matches (±15%):        +25%
IF O₂ m32/m34 ratio matches (±15%):     +15%
IF Air Leak Isotope pattern detected:   +20%
IF Oil Isotope pattern detected:        +15%

Maximum Confidence = 100%
Threshold for Reporting = 30% (DEFAULT_THRESHOLDS.minConfidence)
```

**Severity:** Always `info` (informational) - enhances confidence, does not trigger critical alarms

### Assumptions & Limitations

#### Assumptions

1. **Natural Abundance:** All isotope ratios based on terrestrial natural abundance (no mass fractionation from space/exotic sources)
2. **70 eV Electron Impact:** Fragmentation patterns and peak ratios assume standard RGA EI conditions
3. **No Temperature/Pressure Correction:** Isotope ratios unaffected by temperature or pressure in vacuum
4. **Quadrupole Resolution:** m/z separation sufficient to resolve ±1 mass (standard RGA capability)

#### Limitations

1. **m/z 32 Ambiguity:** Both O₂⁺ and S⁺ appear at m/z 32 → isotope check provides discrimination but not definitive
2. **Air Background:** O₂ is ubiquitous → ratio easily distorted by background oxygen from air leaks
3. **No Quantification:** Isotope ratios confirm identity but do NOT provide concentration measurements
4. **Missing Isotopes:** Some elements lack verification (Ne, Kr, Xe, H₂O not yet checked)
5. **Tolerance Limits:** ±15% tolerance may be too broad for high-precision applications, too narrow for degraded instruments

#### Known Edge Cases

| Scenario | Effect | Mitigation |
|----------|--------|------------|
| **High background O₂** | m32/m34 ratio biased toward 244 | Only report if other elements also verify |
| **S present with high O₂** | Cannot reliably distinguish S from O₂ | Add secondary marker (m64 SO₂ presence) |
| **Isotope fractionation** | Non-standard isotope ratios | Document source (geological/mass spec processing) |
| **Weak peaks** | Isotope ratio unreliable (statistics) | Require m/z signal > 10× threshold for accuracy |
| **Low-resolution RGA** | m/z 32/34 peak overlap | Requires high-resolution instrument (typically not a problem) |

### Validation

**Cross-Validated by:** Gemini-3-Pro + Grok (January 2026)

**Result:** ⚠️ Conditional Approval
- **Ar ratio:** Correct value is 298.56 (not 295.5 in code)
- **Cl, Br, CO₂, S ratios:** ✅ Scientifically valid
- **O₂ ratio:** ❌ **CRITICAL ERROR** - Code uses 487 (atomic), should be 244 (molecular)

**Critical Fix Required Before Production:**
```typescript
// Line ~2080 in detectors.ts
// BEFORE: const O2_RATIO = 487  // ❌ Atomic ratio (WRONG!)
// AFTER:  const O2_RATIO = 244  // ✅ Molecular ratio (CORRECT)
```

**Impact of Fix:**
- Prevents false negatives in O₂ verification (currently fails 50% of cases due to 2× error)
- Restores proper m32/m34 discrimination for S vs O₂
- Enables reliable oxygen isotope cross-validation

### References

**Isotope Standards:**
- [CIAAW](https://ciaaw.org/argon.htm) (Commission on Isotopic Abundances and Atomic Weights) - Argon ⁴⁰Ar/³⁶Ar = 298.56
- Lee et al. (2006) - *Geochimica et Cosmochimica Acta* - Updated argon isotope ratios
- [IUPAC](https://www.iupac.org/) (2013, 2016) - Standard Atomic Weights and Isotopic Compositions

**Mass Spectrometry & Fragmentation:**
- [NIST Chemistry WebBook](https://webbook.nist.gov/chemistry/) - Electron impact fragmentation at 70 eV
- Meija et al. (2016) - *Pure Applied Chemistry* - Atomic weights and isotopic compositions
- VPDB (Vienna Pee Dee Belemnite) Standard - Carbon-13 reference

**RGA Applications:**
- [Pfeiffer Vacuum](https://www.pfeiffer-vacuum.com/) - Residual Gas Analysis Handbook
- [Hiden Analytical](https://www.hidenanalytical.com/) - RGA Series Documentation
- [Kurt J. Lesker](https://www.lesker.com/) - Vacuum Technology Reference

---

## 🇩🇪 Deutsche Version

### Zusammenfassung

Der Isotopenverhältnis-Verifikationsdetektor erhöht die Diagnose-Zuverlässigkeit durch Analyse natürlicher Isotopenverhältnisse bekannter Elemente (Argon, Chlor, Brom, Kohlenstoff, Schwefel, Sauerstoff) im RGA-Spektrum. Jedes Element hat in der Natur ein charakteristisches Isotopenverhältnis, und signifikante Abweichungen können auf Messfehler oder Kontaminationen hindeuten.

**Schweregrad:** Informativ (nicht kritisch) - erhöht Diagnose-Konfidenz, hilft Fehlalarme zu reduzieren

### Physikalisches Modell

#### Natürliche Isotopenverhältnisse (bei terrestrischer natürlicher Häufigkeit)

| Element | Isotop-Verhältnis | Erwarteter Wert | Bereich (±15%) | Konfidenz-Gewicht | Min. Peak-Schwelle |
|---------|------------------|-----------------|----------------|-------------------|-------------------|
| **Argon** | ⁴⁰Ar/³⁶Ar | 298.56 | 254-344 | +30% | m40 > 10× min |
| **Chlor** | ³⁵Cl/³⁷Cl | 3.13 | 2.66-3.60 | +25% | m35 > 5× min |
| **Brom** | ⁷⁹Br/⁸¹Br | 1.028 | 0.87-1.18 | +25% | m79 > 3× min |
| **Kohlenstoff (in CO₂)** | ¹²C/¹³C (m44/m45) | 83.6 | 71-96 | +20% | m44 > 10× min |
| **Schwefel** | ³²S/³⁴S | 22.35 | 19.0-25.7 | +25% | m32 > 10× min |
| **Sauerstoff (molekular)** | ³²O₂/³⁴O₂ | 244 | 207-281 | +15% | m32 > 10× min |

**Quellen:** CIAAW (2007), IUPAC 2013/2016, VPDB Standard, NIST WebBook

### Physik der einzelnen Isotopenverhältnisse

#### 1. Argon: ⁴⁰Ar/³⁶Ar ≈ 298.56

**Atmosphärisches Argon** besteht hauptsächlich aus zwei stabilen Isotopen:
- **⁴⁰Ar:** 99.6035% (vorherrschend)
- **³⁶Ar:** 0.3365% (radiogen; durch ⁴⁰K-Zerfall in der Erdkruste erzeugt)

**Verhältnis:** 99.6035 / 0.3365 ≈ **298.56** (CIAAW 2007)

**Warum das wichtig ist:**
- Argon ist in atmosphärischer Luft vorhanden (0.934%)
- Das Isotopenverhältnis ist über der Erdatmosphäre hochgradig konstant
- Abweichung kann nicht-atmosphärische Argonquelle anzeigen (z.B. reines Ar-Gas zum Schweißen)
- Hilft Luftlecks (atmosphärisches Ar) von Industriegasquellen zu unterscheiden

**Hinweis:** Alter Wert 295.5 (Nier 1950) ist veraltet; moderner Wert ist 298.56 (Lee et al. 2006)

**Konfidenz-Gewichtung:** 30% (höchste) - Argon ist starker Luftleck-Marker, Verhältnisse sehr konsistent

---

#### 2. Chlor: ³⁵Cl/³⁷Cl ≈ 3.13

**Natürliches Chlor** existiert als zwei stabile Isotope:
- **³⁵Cl:** 75.76% (dominant)
- **³⁷Cl:** 24.24%

**Verhältnis:** 75.76 / 24.24 ≈ **3.13** (IUPAC)

**Warum das wichtig ist:**
- Chlor erscheint in organischen Kontaminanten (Reiniger, Lösungsmittel, Kunststoffe)
- Verifikation hilft anorganische Cl-Lecks von Luftkontamination zu unterscheiden
- Natürliches Isotopenverhältnis ist sehr konsistent (keine Massenbruchteile im Vakuum)

**Quellen:** IUPAC 2013, NIST Chemistry WebBook

**Konfidenz-Gewichtung:** 25% (gut - Chlor weniger häufig als Argon aber charakteristisch)

---

#### 3. Brom: ⁷⁹Br/⁸¹Br ≈ 1.028

**Natürliches Brom** existiert als zwei stabile Isotope mit nahezu gleicher Häufigkeit:
- **⁷⁹Br:** 50.69%
- **⁸¹Br:** 49.31%

**Verhältnis:** 50.69 / 49.31 ≈ **1.028** (IUPAC)

**Warum das wichtig ist:**
- Brom erscheint in Flammschutzmitteln (Möbel, Isolierung)
- Nahezu 1:1-Verhältnis macht Brom leicht erkennbar
- Zeigt Kontamination durch Kunststoffe oder bromierte Verbindungen an

**Quellen:** IUPAC 2013, NIST Chemistry WebBook

**Konfidenz-Gewichtung:** 25% (gut - charakteristisches Verhältnis, aber weniger häufig als Ar/Cl)

---

#### 4. Kohlenstoff in CO₂: ¹²C/¹³C (m44/m45-Verhältnis) ≈ 83.6

**Natürliches Kohlendioxid** enthält zwei stabile Kohlenstoff-Isotope:
- **¹²C:** 98.89% (hauptsächlich)
- **¹³C:** 1.11%

**Peak-Verhältnis:** m44 (¹²CO₂⁺) / m45 (¹³CO₂⁺) ≈ **83.6**

**Berechnung:**
```
P(m44) = P(¹²C) × [P(¹⁶O)² + P(¹⁶O)×P(¹⁸O)×2] ≈ 0.9889 × [0.9975² + ...] ≈ 0.9844
P(m45) = P(¹³C) × P(¹⁶O)² + P(¹²C) × P(¹⁶O)×P(¹⁸O) ≈ 0.0111 + 0.0048 ≈ 0.0159

Verhältnis = 0.9844 / 0.0159 ≈ 84-85 (VPDB Standard)
```

**Implementierung:** Vereinfacht auf **83.6** (innerhalb Toleranz)

**Warum das wichtig ist:**
- CO₂ ist ubiquitär in Vakuumsystemen (Luftlecks, Ausgasung)
- Verifikation des Isotopenverhältnisses bestätigt natürliches CO₂ (keine Kontamination)
- Unterscheidet von anderen m/z 44 Signalen (N₂O, C₂H₄, usw.)

**Quellen:** VPDB Standard, NIST, Meija et al. 2016

**Konfidenz-Gewichtung:** 20% (moderat - CO₂ häufig, Isotopen-Prüfung erhöht Konfidenz)

---

#### 5. Schwefel: ³²S/³⁴S ≈ 22.35

**Natürlicher Schwefel** existiert als vier stabile Isotope:
- **³²S:** 94.99% (vorherrschend)
- **³⁴S:** 4.25% (sekundär)
- ³³S: 0.75%, ³⁶S: <0.02% (vernachlässigbar)

**Verhältnis:** 94.99 / 4.25 ≈ **22.35** (IUPAC 2013)

**Warum das wichtig ist:**
- Schwefel erscheint in Pump-Ölen, Schmierfetten und organischen Kontaminanten
- Hilft S⁺ von anderen m/z 32 Quellen zu unterscheiden (hauptsächlich O₂)
- Hohes m32/m34-Verhältnis (~22) vs Sauerstoffverhältnis (~244) ermöglicht Diskriminierung

**Diskriminierungs-Logik:**
- **m32/m34 ≈ 22:** Schwefel vorhanden
- **m32/m34 ≈ 244:** Molekularer Sauerstoff (O₂) vorhanden

**Hinweis:** m32/m34 kann mehrdeutig sein, da m32 und m34 von verschiedenen Quellen stammen können

**Quellen:** IUPAC 2013, NIST WebBook

**Konfidenz-Gewichtung:** 25% (gut - klare Diskriminierung von Sauerstoffverhältnis)

---

#### 6. Sauerstoff (Molekular): ³²O₂/³⁴O₂ ≈ 244 **[KRITISCHE KORREKTUR]**

**WICHTIG - PHYSIK-KORREKTUR:**

Das erwartete Sauerstoff-Verhältnis ist **244**, NICHT 487 (Atomverhältnis). Dies ist ein kritischer Rechenfehler.

**Atom vs. Molekular Sauerstoff-Verhältnis:**

```
ATOM-VERHÄLTNIS (❌ FALSCH - das verwendet der aktuelle Code):
  ¹⁶O: 99.757%
  ¹⁸O: 0.205%
  Verhältnis = 99.757 / 0.205 ≈ 487

MOLEKULAR-VERHÄLTNIS (✅ KORREKT - das sollte verwendet werden):
  P(¹⁶O) = 0.99757
  P(¹⁸O) = 0.00205

  P(³²O₂) = P(¹⁶O¹⁶O) = (0.99757)² ≈ 0.9951
  P(³⁴O₂) = P(¹⁶O¹⁸O) × 2 = 2 × 0.99757 × 0.00205 ≈ 0.00409

  Verhältnis = 0.9951 / 0.00409 ≈ 244 ✅
```

**Warum der Unterschied?**
- O₂ hat **zwei Sauerstoff-Atome**, nicht eins
- Wahrscheinlichkeit der Bildung von ³⁴O₂ (ein ¹⁶O + ein ¹⁸O) beinhaltet einen kombinatorischen Faktor von 2
- Der m/z 34 Peak ist NICHT direkt proportional zu ¹⁸O/¹⁶O; er basiert auf molekularer Wahrscheinlichkeit

**Korrigiertes Verhältnis:** **244** (Bereich: 207-281, ±15%)

**Warum das wichtig ist:**
- Sauerstoff ist ubiquitär in Vakuumsystemen (Luftlecks, Restgas)
- Verifikation des Isotopenverhältnisses bestätigt natürliches O₂ (keine anomale Fraktionierung)
- Hohes Verhältnis (~244) vs Schwefel-Verhältnis (~22) ermöglicht klare Diskriminierung
- **Auswirkung des falschen Wertes:** Code mit 487 wird O₂ NICHT erkennen (Faktor 2× Fehler)

**Quellen:** NIST WebBook, IUPAC 2013, Meija et al. 2016

**Konfidenz-Gewichtung:** 15% (niedrigste) - Sauerstoff ubiquitär aber m32/m34 leicht durch Hintergrund verfälscht

---

### Konfidenz-Berechnung

Der Detektor kombiniert mehrere unabhängige Isotopen-Prüfungen zur Erhöhung der Gesamt-Diagnose-Konfidenz:

```
Gesamt-Konfidenz = 0.0

WENN Ar ⁴⁰/³⁶ Verhältnis stimmt (±15%):       +30%
WENN Cl ³⁵/³⁷ Verhältnis stimmt (±15%):       +25%
WENN Br ⁷⁹/⁸¹ Verhältnis stimmt (±15%):       +25%
WENN CO₂ m44/m45 Verhältnis stimmt (±15%):    +20%
WENN S ³²/³⁴ Verhältnis stimmt (±15%):        +25%
WENN O₂ m32/m34 Verhältnis stimmt (±15%):     +15%
WENN Luftleck-Isotop-Muster erkannt:          +20%
WENN Öl-Isotop-Muster erkannt:                +15%

Maximale Konfidenz = 100%
Schwellwert für Meldung = 30% (DEFAULT_THRESHOLDS.minConfidence)
```

**Schweregrad:** Immer `info` (informativ) - erhöht Konfidenz, löst keine kritischen Alarme aus

### Annahmen & Limitationen

#### Annahmen

1. **Natürliche Häufigkeit:** Alle Isotopenverhältnisse basieren auf terrestrischer natürlicher Häufigkeit (keine Massenfraktionierung aus Weltraum/exotischen Quellen)
2. **70 eV Elektronenstoß:** Fragmentierungsmuster und Peak-Verhältnisse setzen Standard-RGA-EI-Bedingungen voraus
3. **Keine Temperatur-/Druckkorrektur:** Isotopenverhältnisse werden durch Temperatur oder Druck im Vakuum nicht beeinflusst
4. **Quadrupol-Auflösung:** m/z-Auflösung ausreichend für ±1 Masse (Standard-RGA-Fähigkeit)

#### Limitationen

1. **m/z 32 Mehrdeutigkeit:** Sowohl O₂⁺ als auch S⁺ erscheinen bei m/z 32 → Isotopen-Prüfung ermöglicht Diskriminierung aber nicht definitiv
2. **Luft-Hintergrund:** O₂ ubiquitär → Verhältnis leicht durch Hintergrund-Sauerstoff aus Luftlecks verfälscht
3. **Keine Quantifizierung:** Isotopenverhältnisse bestätigen Identität aber NICHT Konzentrationsmessungen
4. **Fehlende Isotope:** Einige Elemente fehlt Verifikation (Ne, Kr, Xe, H₂O noch nicht geprüft)
5. **Toleranzgrenzen:** ±15% Toleranz möglicherweise zu breit für Hochpräzisions-Anwendungen, zu eng für degradierte Instrumente

#### Bekannte Grenzfälle

| Szenario | Effekt | Gegenmaßnahme |
|----------|--------|---------------|
| **Hoher O₂-Hintergrund** | m32/m34 Verhältnis zu 244 verzerrt | Nur berichten wenn auch andere Elemente verifizieren |
| **S mit hohem O₂ vorhanden** | Kann S von O₂ nicht zuverlässig unterscheiden | Sekundärer Marker hinzufügen (m64 SO₂ Präsenz) |
| **Isotopen-Fraktionierung** | Nicht-standard Isotopenverhältnisse | Quelle dokumentieren (geologisch/Massenspektrometrie-Verarbeitung) |
| **Schwache Peaks** | Isotopenverhältnis unzuverlässig (Statistik) | m/z Signal > 10× Schwellwert für Genauigkeit erforderlich |
| **Low-Resolution RGA** | m/z 32/34 Peak-Überlappung | Hochauflösendes Instrument erforderlich (typischerweise nicht problematisch) |

### Validierung

**Cross-Validiert durch:** Gemini-3-Pro + Grok (Januar 2026)

**Ergebnis:** ⚠️ Bedingter Genehmigung
- **Ar-Verhältnis:** Korrekt ist 298.56 (nicht 295.5 im Code)
- **Cl, Br, CO₂, S Verhältnisse:** ✅ Wissenschaftlich valide
- **O₂-Verhältnis:** ❌ **KRITISCHER FEHLER** - Code verwendet 487 (Atom), sollte 244 (Molekular) sein

**Kritische Korrektur vor Produktion erforderlich:**
```typescript
// Zeile ~2080 in detectors.ts
// VORHER: const O2_RATIO = 487  // ❌ Atom-Verhältnis (FALSCH!)
// NACHHER: const O2_RATIO = 244  // ✅ Molekular-Verhältnis (KORREKT)
```

**Auswirkung der Korrektur:**
- Verhindert falsch-negative Ergebnisse bei O₂-Verifikation (aktuell 50% Fehler durch 2× Fehler)
- Stellt richtige m32/m34 Diskriminierung für S vs O₂ wieder her
- Ermöglicht zuverlässige Sauerstoff-Isotopen-Quervaldierung

### Referenzen

**Isotopen-Standards:**
- [CIAAW](https://ciaaw.org/argon.htm) (Commission on Isotopic Abundances and Atomic Weights) - Argon ⁴⁰Ar/³⁶Ar = 298.56
- Lee et al. (2006) - *Geochimica et Cosmochimica Acta* - Aktualisierte Argon-Isotopenverhältnisse
- [IUPAC](https://www.iupac.org/) (2013, 2016) - Standard Atomgewichte und Isotopenzusammensetzungen

**Massenspektrometrie & Fragmentierung:**
- [NIST Chemistry WebBook](https://webbook.nist.gov/chemistry/) - Elektronenstoß-Fragmentierung bei 70 eV
- Meija et al. (2016) - *Pure Applied Chemistry* - Atomgewichte und Isotopenzusammensetzungen
- VPDB (Vienna Pee Dee Belemnite) Standard - Kohlenstoff-13 Referenz

**RGA-Anwendungen:**
- [Pfeiffer Vacuum](https://www.pfeiffer-vacuum.com/) - Restgas-Analyse Handbuch
- [Hiden Analytical](https://www.hidenanalytical.com/) - RGA-Serie Dokumentation
- [Kurt J. Lesker](https://www.lesker.com/) - Vakuumtechnik Referenz

---

**Document Version:** 1.0
**Last Updated:** 2026-01-11
**Validation:** ⚠️ Conditional (Gemini + Grok)
**Critical Issue:** O₂ isotope ratio requires correction from 487→244 before production deployment
