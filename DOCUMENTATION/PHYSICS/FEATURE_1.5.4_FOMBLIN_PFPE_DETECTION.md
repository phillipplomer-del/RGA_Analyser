# FEATURE 1.5.4: Fomblin PFPE Contamination Detection

**Status:** ⚠️ Conditional Approval (Gemini + Grok - 2026-01-11)
**Physics Validated:** ✅ YES
**Implementation File:** [detectors.ts:219-286](../../src/lib/diagnosis/detectors.ts#L219-L286)
**Critical Issue:** 1 (m/z 50 missing - MUST FIX before production)

---

## Deutsch

### Physikalisches Modell

#### Molekül: Perfluoropolyether (PFPE)

**Struktur:**
- IUPAC-Name: Perfluoropolyether
- Handelsnamen: Fomblin (Solvay), Krytox (DuPont), Demnum (Daikin)
- Backbone: -(CF₂-CF₂-O)ₙ- oder -(CF₂-O)ₙ- (polymere Struktur)
- Molekulargewicht: 2000-10000 Da (hochpolymerer Stoff)
- Thermische Stabilität: Sehr hoch (speziell für Hochvakuum-Anwendungen entwickelt)

**Physikalische Eigenschaften:**
- **Verwendung:** Diffusionspumpenöl, Hochvakuum-Schmierfett
- **Verdampfung:** Sehr niedrige Verdampfungsrate (hochstabil)
- **Persistenz:** EXTREM hartnäckig - löst sich nicht leicht ab, erfordert Lösungsmittelreinigung
- **Kritikalität:** PFPE ist eine der schwierigsten Kontaminationen zur Entfernung
- **Quellen:** Backstreaming aus Diffusionspumpen, Migration aus Hochvakuum-Fetten

---

#### Fragmentierungsmuster (70 eV Elektronenstoß-Ionisation)

**Primärer Marker:**

| m/z | Fragment | Formel | Häufigkeit | Rolle |
|-----|----------|--------|-----------|-------|
| **69** | **Trifluoromethan-Kation** | **CF₃⁺** | **100% (Basispeak)** | **Hauptmarker für PFPE** |

**Sekundäre Marker:**

| m/z | Fragment | Formel | Häufigkeit | Rolle |
|-----|----------|--------|-----------|-------|
| 50 | Difluoromethan-Kation | CF₂⁺ | 5-10% (2./3. stärkster Peak) | **KRITISCH: Fehlt in Code!** |
| 31 | Fluormethan-Kation | CF⁺ | 1-5% | Bestätigung PFPE-Fragmentierung |
| 47 | Fluorformyl-Kation | CFO⁺ | 1-3% | Optional (bei oxidiertem PFPE) |
| 20 | Fluorwasserstoff-Kation | HF⁺ | ~0% in Kontrolle | **NICHT prüfen** (extrinsisch aus Luftfeuchte) |

**Anti-Muster (zur Unterscheidung von Mineralöl):**

| m/z | Fragment | Formel | In PFPE | In Mineralöl |
|-----|----------|--------|---------|--------------|
| 41 | Propyl-Radikal-Kation | C₃H₅⁺ | <10% v. m69 | >20% v. m69 |
| 43 | Propyl-Kation | C₃H₇⁺ | <30% v. m69 | >30% v. m69 |
| 57 | Butyl-Kation | C₄H₉⁺ | <30% v. m69 | >40% v. m69 |

**Erkenntnis:** PFPE zeigt Suppression von Alkyl-Fragmenten wegen fehlender C-H Bindungen (rein fluoriert). Mineralöl zeigt starke Alkyl-Peaks. Dies ist der wichtigste Unterscheidungsmechanismus.

---

#### Detektions-Logik

**Schritt 1: Primärer Marker Check**
```
IF m69 > 0.1 (10% der Basislinie):
  → Starke PFPE-Evidenz
  → Confidence +0.4
  → Kalibrierung: m69 = 100% (Basispeak)
```

**Schritt 2: Sekundäre Marker Validation**
```
IF m50 > 0.05 (5%) OR m50/m69 > 0.15:
  → CF₂⁺ detektiert (charakteristisch für PFPE polymere Kettenfragmentierung)
  → Confidence +0.2
  → KRITISCH: Diese Prüfung fehlt derzeit im Code!

IF m31 > 0.01 (1%) OR m47 > 0.01 (1%):
  → CF⁺ oder CFO⁺ detektiert (bestätigt fluorierte Moleküle)
  → Confidence +0.2
```

**Schritt 3: Anti-Muster Check (Mineralöl-Ausschluss)**
```
IF m41 < 0.3×m69 AND m43 < 0.3×m69 AND m57 < 0.3×m69:
  → Alkyl-Suppression bestätigt (charakteristisch für PFPE)
  → Keine Mineralöl-Verunreinigung erkannt
  → Confidence +0.3
ELSE:
  → Alkyl-Peaks zu hoch (möglicherweise Mineralöl-Kontamination)
  → Confidence -0.2
```

**Gesamtvertrauen:**
```
Confidence = 0.4 (m69 > 10%)
           + 0.2 (m50 detektiert)     ← MUSS HINZUGEFÜGT WERDEN!
           + 0.2 (m31 oder m47 > 1%)
           + 0.3 (Alkyl-Suppression)
           = 0.4-0.9 (typisch 0.7-0.8 bei echter PFPE)

Schwellwert: minConfidence (0.5)
```

---

#### Schweregrad: Kritisch

**Begründung:**
- PFPE ist extrem hartnäckig und schwer zu entfernen
- Erfordert intensive Lösungsmittelreinigung (nicht einfach abpumpen)
- Kontaminiert Oberflächen über längere Zeit
- Kann Vakuumkomponenten beschädigen bei längerer Exposition
- Dekontamination ist zeit- und kostenaufwändig

**Empfehlung:**
- **Sofortmaßnahme:** Intensive Reinigung erforderlich
- **Reinigungsmittel:** Hexan oder spezialisierte Fluorocarbon-Lösungsmittel
- **Prävention:** Diffusionspumpen-Öl-Backstreaming minimieren, Ventile prüfen
- **Klassifizierung:** KRITISCHE Kontamination (höchste Priorität)

---

### Validierungsergebnisse

**Gemini Review (✅ Conditional):**
- m/z 69 (CF₃⁺) als Primärmarker: ✅ KORREKT (Basispeak 100%)
- m/z 31 (CF⁺) als Sekundär: ⚠️ Schwellwert >0.1% zu niedrig → Auf >1% erhöhen
- m/z 47 (CFO⁺) als Sekundär: ⚠️ Schwellwert >0.1% zu niedrig → Auf >1% erhöhen
- **m/z 50 (CF₂⁺) MISSING: ❌ KRITISCH** - 2./3. stärkster Peak nicht geprüft!
- m/z 20 (HF⁺) nicht geprüft: ✅ KORREKT (extrinsisch aus Luft)
- Alkyl-Anti-Muster: ✅ KORREKT (30-50% Toleranz angemessen)

**Grok Review (✅ Conditional):**
- m/z 69 (CF₃⁺): ✅ KORREKT
- m/z 31 (CF⁺): ✅ KORREKT
- m/z 47 (CFO⁺): ✅ KORREKT
- **m/z 50 (CF₂⁺) MISSING: ❌ KRITISCH** - Verhältnis ~0.1-0.2 zu m69
- m/z 20 (HF⁺): ⚠️ Optional Check >1% (Gemini: nicht geprüft = korrekt)
- Alkyl-Anti-Muster: ✅ KORREKT

**Konsens beider KI:**
- **Zustimmung:** Core-Logik (m69 + Alkyl-Ausschluss) ist physikalisch korrekt
- **Kritisches Defizit:** m/z 50 (CF₂⁺) nicht geprüft - MUSS VOR PRODUKTION BEHOBEN WERDEN
- **Empfehlung:** Schwellwert-Erhöhung für m31/m47 (0.1% → 1%) zur Rausch-Reduktion

---

#### Quellen

**Fragmentierungsmuster:**
- NIST Mass Spectrometry Data Center: Fomblin Y Fragmentation Pattern
- Solvay Fomblin Technical Data: "PFPE Fragmentation under 70 eV EI"
- Hiden Analytical: "RGA Library for Fluorocarbons"

**Anwendungsdaten:**
- Kurt J. Lesker: RGA-Datenbank für Vakuum-Kontaminationen
- Leybold Vacuum Fundamentals: PFPE als kritische Kontamination
- Pfeiffer Vacuum: Diffusionspumpen-Backstreaming-Charakterisierung

**Validierung:**
- Gemini Validation (2026-01-11): ⚠️ Conditional
- Grok Validation (2026-01-11): ⚠️ Conditional
- Consensus: Unanimous Conditional Approval

---

## English

### Physical Model

#### Molecule: Perfluoropolyether (PFPE)

**Structure:**
- IUPAC Name: Perfluoropolyether
- Trade Names: Fomblin (Solvay), Krytox (DuPont), Demnum (Daikin)
- Backbone: -(CF₂-CF₂-O)ₙ- or -(CF₂-O)ₙ- (polymeric structure)
- Molecular Weight: 2000-10000 Da (high polymer)
- Thermal Stability: Very high (specifically developed for high-vacuum applications)

**Physical Properties:**
- **Application:** Diffusion pump oil, high-vacuum lubricating grease
- **Evaporation:** Extremely low evaporation rate (highly stable)
- **Persistence:** EXTREMELY persistent - does not easily desorb, requires solvent cleaning
- **Criticality:** PFPE is one of the most difficult contaminations to remove
- **Sources:** Backstreaming from diffusion pumps, migration from high-vacuum greases

---

#### Fragmentation Pattern (70 eV Electron Impact Ionization)

**Primary Marker:**

| m/z | Fragment | Formula | Abundance | Role |
|-----|----------|---------|-----------|------|
| **69** | **Trifluoromethane Cation** | **CF₃⁺** | **100% (Base Peak)** | **Primary PFPE Marker** |

**Secondary Markers:**

| m/z | Fragment | Formula | Abundance | Role |
|-----|----------|---------|-----------|------|
| 50 | Difluoromethane Cation | CF₂⁺ | 5-10% (2nd/3rd strongest) | **CRITICAL: Missing in Code!** |
| 31 | Fluoromethane Cation | CF⁺ | 1-5% | Confirms PFPE fragmentation |
| 47 | Fluorformyl Cation | CFO⁺ | 1-3% | Optional (oxidized PFPE) |
| 20 | Hydrogen Fluoride Cation | HF⁺ | ~0% in control | **DO NOT CHECK** (extrinsic from air moisture) |

**Anti-Pattern (to distinguish from mineral oil):**

| m/z | Fragment | Formula | In PFPE | In Mineral Oil |
|-----|----------|---------|---------|----------------|
| 41 | Propyl Radical Cation | C₃H₅⁺ | <10% of m69 | >20% of m69 |
| 43 | Propyl Cation | C₃H₇⁺ | <30% of m69 | >30% of m69 |
| 57 | Butyl Cation | C₄H₉⁺ | <30% of m69 | >40% of m69 |

**Insight:** PFPE shows suppressed alkyl fragments due to lack of C-H bonds (purely fluorinated). Mineral oil shows strong alkyl peaks. This is the primary differentiation mechanism.

---

#### Detection Logic

**Step 1: Primary Marker Check**
```
IF m69 > 0.1 (10% of baseline):
  → Strong PFPE evidence
  → Confidence +0.4
  → Calibration: m69 = 100% (base peak)
```

**Step 2: Secondary Marker Validation**
```
IF m50 > 0.05 (5%) OR m50/m69 > 0.15:
  → CF₂⁺ detected (characteristic of PFPE polymeric chain fragmentation)
  → Confidence +0.2
  → CRITICAL: This check is currently missing from code!

IF m31 > 0.01 (1%) OR m47 > 0.01 (1%):
  → CF⁺ or CFO⁺ detected (confirms fluorinated molecules)
  → Confidence +0.2
```

**Step 3: Anti-Pattern Check (Mineral Oil Exclusion)**
```
IF m41 < 0.3×m69 AND m43 < 0.3×m69 AND m57 < 0.3×m69:
  → Alkyl suppression confirmed (characteristic of PFPE)
  → No mineral oil contamination detected
  → Confidence +0.3
ELSE:
  → Alkyl peaks too high (possible mineral oil contamination)
  → Confidence -0.2
```

**Overall Confidence:**
```
Confidence = 0.4 (m69 > 10%)
           + 0.2 (m50 detected)     ← MUST BE ADDED!
           + 0.2 (m31 or m47 > 1%)
           + 0.3 (alkyl suppression)
           = 0.4-0.9 (typically 0.7-0.8 for genuine PFPE)

Threshold: minConfidence (0.5)
```

---

#### Severity: Critical

**Justification:**
- PFPE is extremely persistent and difficult to remove
- Requires intensive solvent cleaning (cannot simply be pumped away)
- Contaminates surfaces for extended periods
- Can damage vacuum components under prolonged exposure
- Decontamination is time-consuming and costly

**Recommendations:**
- **Immediate Action:** Intensive cleaning required
- **Cleaning Agent:** Hexane or specialized fluorocarbon solvents
- **Prevention:** Minimize diffusion pump oil backstreaming, check valves
- **Classification:** CRITICAL contamination (highest priority)

---

### Validation Results

**Gemini Review (✅ Conditional):**
- m/z 69 (CF₃⁺) as primary marker: ✅ CORRECT (base peak 100%)
- m/z 31 (CF⁺) as secondary: ⚠️ Threshold >0.1% too low → Raise to >1%
- m/z 47 (CFO⁺) as secondary: ⚠️ Threshold >0.1% too low → Raise to >1%
- **m/z 50 (CF₂⁺) MISSING: ❌ CRITICAL** - 2nd/3rd strongest peak not checked!
- m/z 20 (HF⁺) not checked: ✅ CORRECT (extrinsic from air)
- Alkyl anti-pattern: ✅ CORRECT (30-50% tolerance appropriate)

**Grok Review (✅ Conditional):**
- m/z 69 (CF₃⁺): ✅ CORRECT
- m/z 31 (CF⁺): ✅ CORRECT
- m/z 47 (CFO⁺): ✅ CORRECT
- **m/z 50 (CF₂⁺) MISSING: ❌ CRITICAL** - Ratio ~0.1-0.2 to m69
- m/z 20 (HF⁺): ⚠️ Optional check >1% (Gemini: not checked = correct)
- Alkyl anti-pattern: ✅ CORRECT

**Consensus of Both AIs:**
- **Agreement:** Core logic (m69 + alkyl exclusion) is physically correct
- **Critical Deficit:** m/z 50 (CF₂⁺) not checked - MUST BE FIXED BEFORE PRODUCTION
- **Recommendation:** Raise thresholds for m31/m47 (0.1% → 1%) to reduce noise false positives

---

#### Sources

**Fragmentation Patterns:**
- NIST Mass Spectrometry Data Center: Fomblin Y Fragmentation Pattern
- Solvay Fomblin Technical Data: "PFPE Fragmentation under 70 eV EI"
- Hiden Analytical: "RGA Library for Fluorocarbons"

**Application Data:**
- Kurt J. Lesker: RGA Database for Vacuum Contaminations
- Leybold Vacuum Fundamentals: PFPE as critical contamination
- Pfeiffer Vacuum: Diffusion Pump Backstreaming Characterization

**Validation:**
- Gemini Validation (2026-01-11): ⚠️ Conditional
- Grok Validation (2026-01-11): ⚠️ Conditional
- Consensus: Unanimous Conditional Approval

---

## Critical Implementation Issue

**⚠️ BEFORE PRODUCTION:**

The detector implementation is **missing the CF₂⁺ (m/z 50) check**, which is the 2nd or 3rd strongest peak in PFPE mass spectra. This must be added:

```typescript
const m50 = getPeak(peaks, 50)  // CF₂⁺

// After m69 check
if (m50 > DEFAULT_THRESHOLDS.minPeakHeight * 50 || (m69 > 0 && m50/m69 > 0.15)) {
  evidence.push(createEvidence(
    'presence',
    `CF₂⁺ (m/z 50) detektiert: ${(m50 * 100).toFixed(2)}%`,
    `CF₂⁺ (m/z 50) detected: ${(m50 * 100).toFixed(2)}%`,
    true,
    m50 * 100
  ))
  confidence += 0.2
}
```

**Optional enhancements:**
- Raise m31/m47 thresholds from 0.1% to 1%
- Add m/z 119 (C₂F₅⁺) as tertiary marker (distinguish from refrigerants)
- Add m/z 51 (CHF₂⁺) refrigerant check

---

**Document Version:** 1.0
**Last Updated:** 2026-01-11
**Validation Status:** ⚠️ Conditional Approval (Gemini + Grok)
