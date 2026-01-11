# FEATURE 1.5.7: Helium Leak Detection (detectHeliumLeak)

**Status:** ⚠️ Conditional Approval (CRITICAL fixes required)
**File:** [detectors.ts:845-927](../../src/lib/diagnosis/detectors.ts#L845-L927)
**Created:** 2026-01-11
**Last Updated:** 2026-01-11

---

## Deutsch

### 1. Physikalisches Modell

#### 1.1 Messprinzip

**Qualitative Helium-Screening für Vakuumsysteme:**
- Zielgruppe: RGA-Anwender (Vakuumtechniker, Prozessingenieure)
- Anwendung: Screeningtool zur Empfehlung eines dedizierten He-Leckdetektors
- **LIMITATION:** RGA ist 1-3 Größenordnungen weniger sensitiv als dedizierte He-Leckdetektoren (~5×10⁻¹² mbar·l/s)
- **NICHT für quantitative Leckratenmessungen geeignet**

#### 1.2 Kritische Mehrdeutigkeit: m/z 4

**Problem:** m/z 4 kann zwei verschiedene Ionen sein:
- **He⁺** (Helium, gewünscht)
- **D₂⁺** (Deuterium-Molekülion, Störquelle)

**Quadrupol-Auflösung:** Standard-Quadrupole können nicht zwischen He⁺ (4.0026) und D₂⁺ (4.0282) unterscheiden (Massenunterschied = 0.0256 amu, Auflösung <<1000 erforderlich).

**Lösungsansatz:** m/z 3 (HD) als Deuterium-Indikator:
- HD: Ein- und ausgasung von Deuterium
- Wenn m/z 3 vorhanden → erhöhte Wahrscheinlichkeit für D₂ statt He
- **Confidence-Strafe:** -0.3 (m/z 3 erkannt)

#### 1.3 Relative Sensitivitätsfaktoren (RSF) - KRITISCH

**Rohsignale korrigieren, da Ionisationseffizienz unterschiedlich:**

| Gas | RSF (NIST/Hiden) | Bedeutung |
|-----|------------------|----------|
| He⁺ | 0.15-0.18 | Niedrige Ionisierungswahrscheinlichkeit (70 eV EI) |
| H₂⁺ | 0.44 | Höhere Ionisierungswahrscheinlichkeit |
| **Faktor** | **0.34-0.41** | **H₂ ist 2-3× empfindlicher** |

**KONSEQUENZ:** Rohe Ionenstrom-Verhältnisse systematisch unterschätzen Helium um Faktor 2-3×!

**RSF-Korrektur (ERFORDERLICH):**
```
Korrigiertes Verhältnis = (m₄ / RSF_He) / (m₂ / RSF_H₂)
                        = (m₄ / 0.15) / (m₂ / 0.44)
```

**Beispiel:**
- Ohne RSF: m4/m2 = 0.06 (6%) → "Low He"
- Mit RSF: (0.06 / 0.15) × (0.44 / 1.0) = 0.176 (17.6%) → "Significant He"
- **Unterschied:** Faktor 3×!

#### 1.4 Schwellenwert-Justage (Nach RSF-Korrektur)

**Code-Wert:** >0.1 (10%) ❌ **ZU HOCH für UHV/HV-Systeme**

**Physikalischer Grund:**
- Normales Vakuum: He/H₂ << 0.01 in UHV (10⁻⁶-10⁻⁹ mbar)
- Code-Schwelle 10% → würde fast alle normalen Spektren als "bemerkenswert" kennzeichnen
- Resultat: **Qualitativ falsch, zu unempfindlich**

**NEUER SCHWELLENWERT (nach RSF-Korrektur):**
```
Bemerkenswert: > 0.02-0.04 (2-4%, nicht 10%)
```

**Begründung:** Mit RSF-Korrektur liefert 2-4% realistische Nachweisempfindlichkeit für typische Lecks in Vakuumsystemen.

#### 1.5 Helium-Isotope und He²⁺

**He²⁺ (doppelt ionisiert, m/z 2):**
- Häufigkeit bei 70 eV Elektronenstoß-Ionisation: <1%
- **Nicht prüfen erforderlich** ✅ (zu schwach)

**He-Isotope:**
- ⁴He (99.86%): m/z 4 ← Standard
- ³He (0.14%): m/z 3 ← Spur, ignorierbar

**Aber:** m/z 3 primär HD (siehe Ambiguität oben)

---

### 2. Mathematische Modelle

#### 2.1 RSF-Korrigierte Ratio

```
r_He/H₂_korrigiert = (P_He / RSF_He) / (P_H₂ / RSF_H₂)
                   = (P_He / 0.15) / (P_H₂ / 0.44)
                   = (P_He × 0.44) / (P_H₂ × 0.15)
                   = 2.933 × (P_He / P_H₂)
```

Wobei:
- P_He, P_H₂: Partialdruck (oder Ionenstrom m₄/m₂)
- Faktor 2.933: Korrektur-Multiplikator

#### 2.2 Confidence-Modell

```
confidence = 0
IF m₄ > minPeakHeight:
    confidence += 0.3  ("He⁺ oder D₂⁺ erkannt")

IF m₄_absolut > 0.01 (1%):
    (Minimum-Nachweisbarkeit erfüllt)

IF r_He/H₂_korrigiert > 0.03:
    confidence += 0.4   ("Bemerkenswert")
ELSE IF r_He/H₂_korrigiert > 0.01:
    confidence += 0.2   ("Niedrig, aber möglich")

IF m₃ > minPeakHeight:
    confidence -= 0.3   ("D₂-Ambiguität!")

FINAL confidence = CLAMP(confidence, 0, 1)
REPORT IF confidence > DEFAULT_THRESHOLDS.minConfidence
```

**Typische Szenarien:**

| Szenario | m₄ | m₃ | r_He/H₂ | Confidence | Aktion |
|----------|----|----|---------|------------|--------|
| Reines He-Leck | ✅ | ❌ | 0.05 | 0.7 | **Report** |
| D₂-Labor | ❌ | ✅ | 0.02 | -0.1 | Skip |
| He + Spurren D₂ | ✅ | ✅ | 0.05 | 0.4 | **Report** (mit Vorbehalt) |
| Luft-Hintergrund | ❌ | ❌ | <<0.01 | 0 | Skip |

---

### 3. Implementierungs-Anforderungen

#### 3.1 KRITISCHE FEHLER (Vor Deployment zu beheben)

**❌ FEHLER 1: RSF-Korrektur FEHLT**
- **Problem:** Code nutzt rohe Verhältnisse (m₄/m₂) ohne Ionisierungseffizienz-Korrektur
- **Auswirkung:** Helium wird systematisch um Faktor 2-3× unterschätzt
- **Fix (Code):**
  ```typescript
  const RSF_He = 0.15   // NIST/Hiden RSF
  const RSF_H2 = 0.44
  const ratio_4_2_corrected = (m4 / RSF_He) / (m2 / RSF_H2)
  ```

**❌ FEHLER 2: Schwellenwert zu hoch (10% → 0.03)**
- **Problem:** Code-Schwelle >0.1 ist für UHV viel zu unempfindlich
- **Resultat:** Typische He-Lecks werden **nicht erkannt**
- **Fix:** Neuer Schwellenwert >0.03 (3%, nach RSF-Korrektur)

**⚠️ FEHLER 3: Confidence-Strafe für m/z 3 zu niedrig**
- **Problem:** -0.1 Penalty ist schwach für D₂/He-Ambiguität
- **Fix:** Erhöhen auf -0.3

#### 3.2 Konstanten & Kalibrierung

```typescript
const HELIUM_DETECTION = {
  // Relative Sensitivitätsfaktoren (NIST/Hiden)
  RSF_He: 0.15,      // Helium
  RSF_H2: 0.44,      // Wasserstoff

  // Schwellenwerte (nach RSF-Korrektur)
  ratio_threshold: 0.03,      // 3% (RSF-korrigiert)
  ratio_low_threshold: 0.01,  // 1% (niedrig, aber möglich)
  absolute_min: 0.01,         // 1% (Minimum-Nachweisbarkeit)

  // Confidence-Gewichte
  confidence_m4_presence: 0.3,
  confidence_he_notable: 0.4,
  confidence_he_low: 0.2,
  confidence_d2_penalty: 0.3   // Deuterium-Ambiguität
}
```

#### 3.3 Ambiguitäts-Auflösung: m/z 3 (HD) Check

**Logik:**
1. **IF m/z 3 abwesend:** Nur m₄ = He⁺ → rein He-Signal
2. **IF m/z 3 vorhanden:** Deuterium-Exposition → m₄ könnte teilweise D₂⁺ sein
3. **Confidence reduzieren:** -0.3 (Unsicherheit)
4. **Keine Aktivkohle-Filterung erforderlich** (nur Confidence-Strafe)

**Zusätzliche Checks (Optional, Zukunft):**
- m/z 2 (D⁺) Prüfung: Unterschiede reines D₂ (keine HD ohne H₂)
- N₂/Ar Luft-Indikator: Virtuelle Lecks vs echte He-Lecks

---

### 4. Experimentelle Validierung

#### 4.1 Szenarien & Expected Findings

| Szenario | m₄ Signal | m₃ Signal | He/H₂-Ratio | Expected Behavior |
|----------|-----------|-----------|-------------|-------------------|
| **He tracer gas test** | Hoch | Abwesend | 0.05-0.20 | ✅ Detektiert (He-Leck) |
| **D₂ Laborumgebung** | Moderate | Hoch | 0.02-0.05 | ⚠️ Bericht mit Vorbehalt |
| **Background He** | Spur | Abwesend | <<0.001 | ✅ Kein Report (<1% Schwelle) |
| **Luft-Eindrang** | Abwesend | Abwesend | - | ✅ Kein Report |
| **Kontaminierter He** | Hoch | Moderate | 0.10-0.30 | ⚠️ Report (erhöhte Unsicherheit) |

#### 4.2 Quantitative Grenzen (RGA vs Dedicated)

| Eigenschaft | RGA (70 eV EI) | Dedicated He Leak Detector | Verhältnis |
|-------------|----------------|---------------------------|-----------|
| Nachweisgrenze | ~0.1 ppm (1000 ppm×0.01) | ~1 ppb (0.001 ppm) | **100-1000×** |
| Dynamikbereich | 10⁶:1 (typ.) | 10⁷:1 | ~10× besser |
| Quantitativ? | **Nein** | Ja | - |
| Anwendung | Screening | Präzisions-Messtechnik | - |

**Conclusion:** RGA hat 1-3 Größenordnungen geringere Empfindlichkeit → nur qualitativ als "Screening" nutzbar.

---

### 5. Häufige Fehler & Missverständnisse

**❌ FEHLER: "m₄/m₂ = 10% = deutlicher He-Befund"**
- **Wirklichkeit:** Ohne RSF-Korrektur ist dies tatsächlich ~30% nach Korrektur
- **Behebung:** RSF-Faktor 2-3× anwenden

**❌ FEHLER: "m/z 2 muss geprüft werden"**
- **Wirklichkeit:** He²⁺ <1% bei 70 eV → ignorierbar
- **Quelle:** NIST Elektronenstoß-Daten

**❌ FEHLER: "m/z 3 vollständig ausschließen wenn vorhanden"**
- **Wirklichkeit:** m/z 3 = HD (Wasserstoff-Isotopenaustausch), nicht reines D₂
- **Richtig:** Confidence-Strafe -0.3, aber nicht automat. Ablehnung

**❌ FEHLER: "RGA kann Leckrate messen"**
- **Wirklichkeit:** RGA kann NUR Konzentration relativ anzeigen
- **Richtig:** Für absolute Leckrate = dedizierter He-Detektor erforderlich

---

## English

### 1. Physical Model

#### 1.1 Measurement Principle

**Qualitative Helium Screening for Vacuum Systems:**
- Target audience: RGA practitioners (vacuum technicians, process engineers)
- Application: Screening tool to recommend dedicated He leak detector
- **LIMITATION:** RGA is 1-3 orders of magnitude less sensitive than dedicated He leak detectors (~5×10⁻¹² mbar·l/s)
- **NOT suitable for quantitative leak rate determination**

#### 1.2 Critical Ambiguity: m/z 4

**Problem:** m/z 4 can be two different ions:
- **He⁺** (Helium, desired)
- **D₂⁺** (Deuterium molecular ion, interference)

**Quadrupole Resolution:** Standard quadrupoles cannot distinguish between He⁺ (4.0026) and D₂⁺ (4.0282) (mass difference = 0.0256 amu, resolution <<1000 required).

**Solution:** m/z 3 (HD) as deuterium indicator:
- HD: One- and outgassing of deuterium
- If m/z 3 present → increased probability of D₂ instead of He
- **Confidence penalty:** -0.3 (m/z 3 detected)

#### 1.3 Relative Sensitivity Factors (RSF) - CRITICAL

**Correct raw signals because ionization efficiency differs:**

| Gas | RSF (NIST/Hiden) | Meaning |
|-----|------------------|---------|
| He⁺ | 0.15-0.18 | Low ionization probability (70 eV EI) |
| H₂⁺ | 0.44 | Higher ionization probability |
| **Factor** | **0.34-0.41** | **H₂ is 2-3× more sensitive** |

**CONSEQUENCE:** Raw ion current ratios systematically underestimate helium by factor 2-3×!

**RSF Correction (REQUIRED):**
```
Corrected Ratio = (m₄ / RSF_He) / (m₂ / RSF_H₂)
                = (m₄ / 0.15) / (m₂ / 0.44)
```

**Example:**
- Without RSF: m4/m2 = 0.06 (6%) → "Low He"
- With RSF: (0.06 / 0.15) × (0.44 / 1.0) = 0.176 (17.6%) → "Significant He"
- **Difference:** Factor 3×!

#### 1.4 Threshold Adjustment (After RSF Correction)

**Code Value:** >0.1 (10%) ❌ **TOO HIGH for UHV/HV systems**

**Physical Reason:**
- Normal vacuum: He/H₂ << 0.01 in UHV (10⁻⁶-10⁻⁹ mbar)
- Code threshold 10% → would flag almost all normal spectra as "notable"
- Result: **Qualitatively wrong, too insensitive**

**NEW THRESHOLD (after RSF correction):**
```
Notable: > 0.02-0.04 (2-4%, not 10%)
```

**Rationale:** With RSF correction, 2-4% provides realistic detection sensitivity for typical leaks in vacuum systems.

#### 1.5 Helium Isotopes and He²⁺

**He²⁺ (doubly ionized, m/z 2):**
- Frequency at 70 eV electron impact ionization: <1%
- **Check not required** ✅ (too weak)

**He Isotopes:**
- ⁴He (99.86%): m/z 4 ← Standard
- ³He (0.14%): m/z 3 ← Trace, negligible

**But:** m/z 3 primarily HD (see ambiguity above)

---

### 2. Mathematical Models

#### 2.1 RSF-Corrected Ratio

```
r_He/H₂_corrected = (P_He / RSF_He) / (P_H₂ / RSF_H₂)
                  = (P_He / 0.15) / (P_H₂ / 0.44)
                  = (P_He × 0.44) / (P_H₂ × 0.15)
                  = 2.933 × (P_He / P_H₂)
```

Where:
- P_He, P_H₂: Partial pressure (or ion current m₄/m₂)
- Factor 2.933: Correction multiplier

#### 2.2 Confidence Model

```
confidence = 0
IF m₄ > minPeakHeight:
    confidence += 0.3  ("He⁺ or D₂⁺ detected")

IF m₄_absolute > 0.01 (1%):
    (Minimum detectability satisfied)

IF r_He/H₂_corrected > 0.03:
    confidence += 0.4   ("Notable")
ELSE IF r_He/H₂_corrected > 0.01:
    confidence += 0.2   ("Low, but possible")

IF m₃ > minPeakHeight:
    confidence -= 0.3   ("D₂ ambiguity!")

FINAL confidence = CLAMP(confidence, 0, 1)
REPORT IF confidence > DEFAULT_THRESHOLDS.minConfidence
```

**Typical Scenarios:**

| Scenario | m₄ | m₃ | r_He/H₂ | Confidence | Action |
|----------|----|----|---------|------------|--------|
| Pure He leak | ✅ | ❌ | 0.05 | 0.7 | **Report** |
| D₂ laboratory | ❌ | ✅ | 0.02 | -0.1 | Skip |
| He + trace D₂ | ✅ | ✅ | 0.05 | 0.4 | **Report** (qualified) |
| Air background | ❌ | ❌ | <<0.01 | 0 | Skip |

---

### 3. Implementation Requirements

#### 3.1 CRITICAL ERRORS (To fix before deployment)

**❌ ERROR 1: RSF Correction MISSING**
- **Problem:** Code uses raw ratios (m₄/m₂) without ionization efficiency correction
- **Impact:** Helium systematically underestimated by factor 2-3×
- **Fix (Code):**
  ```typescript
  const RSF_He = 0.15   // NIST/Hiden RSF
  const RSF_H2 = 0.44
  const ratio_4_2_corrected = (m4 / RSF_He) / (m2 / RSF_H2)
  ```

**❌ ERROR 2: Threshold too high (10% → 0.03)**
- **Problem:** Code threshold >0.1 is far too insensitive for UHV
- **Result:** Typical He leaks will **NOT be detected**
- **Fix:** New threshold >0.03 (3%, after RSF correction)

**⚠️ ERROR 3: Confidence penalty for m/z 3 too low**
- **Problem:** -0.1 penalty is weak for D₂/He ambiguity
- **Fix:** Increase to -0.3

#### 3.2 Constants & Calibration

```typescript
const HELIUM_DETECTION = {
  // Relative Sensitivity Factors (NIST/Hiden)
  RSF_He: 0.15,      // Helium
  RSF_H2: 0.44,      // Hydrogen

  // Thresholds (after RSF correction)
  ratio_threshold: 0.03,      // 3% (RSF-corrected)
  ratio_low_threshold: 0.01,  // 1% (low, but possible)
  absolute_min: 0.01,         // 1% (minimum detectability)

  // Confidence weights
  confidence_m4_presence: 0.3,
  confidence_he_notable: 0.4,
  confidence_he_low: 0.2,
  confidence_d2_penalty: 0.3   // Deuterium ambiguity
}
```

#### 3.3 Ambiguity Resolution: m/z 3 (HD) Check

**Logic:**
1. **IF m/z 3 absent:** Only m₄ = He⁺ → pure He signal
2. **IF m/z 3 present:** Deuterium exposure → m₄ could be partially D₂⁺
3. **Reduce confidence:** -0.3 (uncertainty)
4. **No active carbon filtering required** (confidence penalty only)

**Additional Checks (Optional, Future):**
- m/z 2 (D⁺) check: Distinguish pure D₂ (no HD without H₂)
- N₂/Ar air indicator: Virtual leaks vs true He leaks

---

### 4. Experimental Validation

#### 4.1 Scenarios & Expected Findings

| Scenario | m₄ Signal | m₃ Signal | He/H₂ Ratio | Expected Behavior |
|----------|-----------|-----------|-------------|-------------------|
| **He tracer gas test** | High | Absent | 0.05-0.20 | ✅ Detected (He leak) |
| **D₂ Laboratory environment** | Moderate | High | 0.02-0.05 | ⚠️ Report with qualification |
| **Background He** | Trace | Absent | <<0.001 | ✅ No report (<1% threshold) |
| **Air intrusion** | Absent | Absent | - | ✅ No report |
| **Contaminated He** | High | Moderate | 0.10-0.30 | ⚠️ Report (increased uncertainty) |

#### 4.2 Quantitative Limits (RGA vs Dedicated)

| Property | RGA (70 eV EI) | Dedicated He Leak Detector | Ratio |
|----------|----------------|---------------------------|-------|
| Detection limit | ~0.1 ppm (1000 ppm×0.01) | ~1 ppb (0.001 ppm) | **100-1000×** |
| Dynamic range | 10⁶:1 (typ.) | 10⁷:1 | ~10× better |
| Quantitative? | **No** | Yes | - |
| Application | Screening | Precision measurement | - |

**Conclusion:** RGA has 1-3 orders of magnitude lower sensitivity → only useful qualitatively as "screening tool."

---

### 5. Common Mistakes & Misconceptions

**❌ ERROR: "m₄/m₂ = 10% = clear He finding"**
- **Reality:** Without RSF correction, this is actually ~30% after correction
- **Fix:** Apply RSF factor 2-3×

**❌ ERROR: "m/z 2 must be checked"**
- **Reality:** He²⁺ <1% at 70 eV → negligible
- **Source:** NIST electron impact data

**❌ ERROR: "Completely exclude if m/z 3 present"**
- **Reality:** m/z 3 = HD (hydrogen-deuterium exchange), not pure D₂
- **Correct:** Confidence penalty -0.3, but not automatic rejection

**❌ ERROR: "RGA can measure leak rate"**
- **Reality:** RGA can ONLY show concentration relatively
- **Correct:** For absolute leak rate = dedicated He detector required

---

## 6. Cross-Validation Summary

**Validation Source:** Gemini + Grok (Multi-AI Cross-Validation)
**Approval Status:** ⚠️ **CONDITIONAL**
**Physics Validity:** ✅ SOUND (with RSF correction)

### Consensus Findings

| Issue | Severity | Status | Resolution |
|-------|----------|--------|------------|
| m/z 4 ambiguity (He/D₂) | - | ✅ Valid | m/z 3 (HD) check sufficient |
| RSF correction missing | **CRITICAL** | ❌ BROKEN | Apply (m₄/0.15)/(m₂/0.44) |
| Threshold too high (10%) | **HIGH** | ❌ BROKEN | Reduce to 0.02-0.04 (2-4%) |
| He²⁺ at m/z 2 | - | ✅ OK | <1% at 70 eV, no check needed |
| Confidence penalty (m/z 3) | MEDIUM | ⚠️ WEAK | Increase -0.1 to -0.3 |
| Qualitative screening concept | - | ✅ CORRECT | Appropriate for RGA limitations |

### Implementation Impact

**Without fixes:** Code will systematically **underestimate helium by factor 2-3×** and **miss typical vacuum leaks** due to 10% threshold being too high.

**With fixes:** Code becomes physically accurate for UHV/HV helium screening applications.

---

## 7. References & Sources

### Primary Physics

- **NIST Chemistry WebBook:** Electron Impact Ionization Data (He⁺, H₂⁺, RSF factors)
- **ISO 20181:2017:** Vacuum technology - mass spectrometer - residual gas analysers with quadrupole analysers
- **Pfeiffer Vacuum Fundamentals:** RGA sensitivity factors, quadrupole resolution limits
- **SRS (Stanford Research Systems) RGA Notes:** Helium detection, fragmentation patterns

### RGA Application

- **Hiden Analytical:** Relative Sensitivity Factors (RSF) for common gases
- **Leybold Vacuum Handbook:** RGA interpretation, leak detection limits
- **Kurt J. Lesker Company:** Quadrupole MS fragmentation data
- **CERN Vacuum Group:** Mass spectrometry in particle accelerators

### Deuterium Disambiguation

- **NIST Electron Impact Data:** D₂⁺ cracking pattern, HD formation
- **CRC Handbook:** Molecular masses (He: 4.0026, D₂: 4.0282)

---

**Documentation Version:** 1.0
**Validation Complete:** 2026-01-11
**Reviewed By:** Gemini + Grok (AI Cross-Validation)
