# Reverse-Spec: verifyIsotopeRatios()

**Source:** [detectors.ts:1950-2149](../src/lib/diagnosis/detectors.ts#L1950-L2149)
**Status:** ⏳ Awaiting Validation
**Created:** 2026-01-11

---

## Summary (for User)

Verifiziert Isotopenverhältnisse bekannter Elemente (Ar, Cl, Br, C, S, O₂) im Spektrum, um Diagnose-Sicherheit zu erhöhen. Nicht-kritisch (info), aber wichtig zur Reduktion von Fehlalarmen.

---

## Logic Extract

### Detection Criteria

| Element | Isotope Ratio | Expected Value | Tolerance | Confidence Weight | Min Threshold |
|---------|---------------|----------------|-----------|-------------------|---------------|
| **Argon** | ⁴⁰Ar/³⁶Ar | 295.5 | ±15% | +30% | m40 > 10× min |
| **Chlor** | ³⁵Cl/³⁷Cl | 3.13 | ±15% | +25% | m35 > 5× min |
| **Brom** | ⁷⁹Br/⁸¹Br | 1.028 | ±15% | +25% | m79 > 3× min |
| **CO₂** | m44/m45 (¹²C/¹³C) | 83.6 | ±15% | +20% | m44 > 10× min |
| **Schwefel** | ³²S/³⁴S | 22.35 | ±15% | +25% | m32 > 10× min |
| **Sauerstoff** | ³²O₂/³⁴O₂ | 487 | ±15% | +15% | m32 > 10× min |

**Additional Pattern Checks:**
- Air Leak Isotope (from isotopePatterns.ts): +20%
- Oil Isotope (from isotopePatterns.ts): +15%

### Key Ratios/Patterns

| Parameter | Formula | Expected | Range | Source |
|-----------|---------|----------|-------|--------|
| Ar (atmosphärisch) | ⁴⁰Ar/³⁶Ar | 295.5 | 251-340 | CIAAW 2007 |
| Cl (natürlich) | ³⁵Cl/³⁷Cl | 3.13 | 2.66-3.60 | IUPAC |
| Br (natürlich) | ⁷⁹Br/⁸¹Br | 1.028 | 0.87-1.18 | IUPAC |
| CO₂ (¹²C/¹³C) | m44/m45 | 83.6 | 71-96 | VPDB Standard |
| S vs O₂ (m32/m34) | ³²S/³⁴S | 22.35 | 19-26 | To check |
| O₂ (m32/m34) | ³²O₂/³⁴O₂ | 487 | 414-560 | To check |

### Code Logic

```typescript
// detectors.ts:1950-2149
export function verifyIsotopeRatios(input: DiagnosisInput): DiagnosticResult | null {
  let confidence = 0
  const verifiedElements: string[] = []

  // 1. Argon: ⁴⁰Ar/³⁶Ar ≈ 295.5
  if (m40 > DEFAULT_THRESHOLDS.minPeakHeight * 10 && m36 > 0) {
    const arRatio = m40 / m36
    const arCheck = checkIsotopeRatio(arRatio, 'Ar', '40/36')  // tolerance ±15%
    if (arCheck.matches) {
      confidence += 0.3
      verifiedElements.push('Ar')
    }
  }

  // 2. Chlor: ³⁵Cl/³⁷Cl ≈ 3.13
  if (m35 > DEFAULT_THRESHOLDS.minPeakHeight * 5 && m37 > 0) {
    const clRatio = m35 / m37
    if (checkIsotopeRatio(clRatio, 'Cl', '35/37').matches) {
      confidence += 0.25
    }
  }

  // 3. Brom: ⁷⁹Br/⁸¹Br ≈ 1.028
  if (m79 > minPeakHeight * 3 && m81 > 0) {
    const brRatio = m79 / m81
    if (checkIsotopeRatio(brRatio, 'Br', '79/81').matches) {
      confidence += 0.25
    }
  }

  // 4. CO₂ (Carbon-13): m44/m45 ≈ 83.6
  if (m44 > minPeakHeight * 10 && m45 > 0) {
    const co2Ratio = m44 / m45
    if (checkIsotopeRatio(co2Ratio, 'C', '44/45').matches) {
      confidence += 0.2
    }
  }

  // 5. Schwefel vs Sauerstoff: ³²S/³⁴S ≈ 22.35 vs O₂ ≈ 487
  if (m32 > minPeakHeight * 10 && m34 > 0) {
    const ratio = m32 / m34
    const sDeviation = |ratio - 22.35| / 22.35
    const o2Deviation = |ratio - 487| / 487

    if (sDeviation < 0.15) {
      confidence += 0.25  // Schwefel bestätigt
    } else if (o2Deviation < 0.15) {
      confidence += 0.15  // Sauerstoff bestätigt
    }
  }

  // 6. Additional pattern detection
  const airLeakResult = detectAirLeakIsotope(peaksMap)
  if (airLeakResult.confidence > 0.5) confidence += 0.2

  const oilResult = detectOilIsotope(peaksMap)
  if (oilResult.confidence > 0.3) confidence += 0.15

  if (confidence < DEFAULT_THRESHOLDS.minConfidence) return null

  return {
    type: DiagnosisType.ISOTOPE_VERIFICATION,
    severity: 'info',  // ← Informativ, nicht kritisch!
    confidence: min(confidence, 1.0)
  }
}
```

**Confidence Calculation:**
```
Total = 0.0

IF Ar ⁴⁰/³⁶ matches (±15%):       +30%
IF Cl ³⁵/³⁷ matches (±15%):       +25%
IF Br ⁷⁹/⁸¹ matches (±15%):       +25%
IF CO₂ m44/m45 matches (±15%):    +20%
IF S ³²/³⁴ matches (±15%):        +25%
IF O₂ m32/m34 matches (±15%):     +15%
IF Air Leak Isotope detected:     +20%
IF Oil Isotope detected:          +15%

Max Confidence = 100%
Threshold = DEFAULT_THRESHOLDS.minConfidence (usually 0.3)
```

**Severity:** Always `info` (increases diagnosis confidence, not critical)

---

## Validation Questions

**Critical:**
1. **Argon Ratio:** Is ⁴⁰Ar/³⁶Ar = 295.5 correct for atmospheric argon? What is authoritative source?
2. **Chlor/Brom Ratios:** Are ³⁵Cl/³⁷Cl = 3.13 and ⁷⁹Br/⁸¹Br = 1.028 correct natural abundances?
3. **CO₂ Carbon-13:** Is m44/m45 = 83.6 correct for atmospheric CO₂? Is VPDB standard applicable?
4. **S vs O₂ Discrimination:** Is ³²S/³⁴S = 22.35 vs ³²O₂/³⁴O₂ = 487 correct? Both use m/z 32, 34!
5. **Tolerance:** Is ±15% tolerance appropriate for RGA measurements?

**Non-Critical:**
6. **Min Thresholds:** Are different multipliers (10×, 5×, 3×) justified? Why different for each element?
7. **Confidence Weights:** Why Ar = 30% but CO₂ only 20%? Is this based on measurement precision?
8. **Missing Elements:** Should add Ne (²⁰Ne/²²Ne), Kr, Xe for completeness?

---

## Sources to Check

- [ ] **CIAAW:** Argon isotope ratio (⁴⁰Ar/³⁶Ar = 295.5 or 298.56?)
- [ ] **IUPAC:** Chlor and Brom natural abundances
- [ ] **VPDB Standard:** Carbon-13 ratio in CO₂
- [ ] **IAEA:** Sulfur isotope standards (³²S/³⁴S)
- [ ] **NIST:** Oxygen isotope ratios (¹⁶O/¹⁸O, affects m32/m34)
- [ ] **RGA Textbooks:** Typical tolerances for quadrupole mass spectrometers

---

## Known Gaps

- **Overlap Problem:** m/z 32 can be both O₂⁺ and S⁺ → isotope check helps but not definitive
- **Isotope Patterns:** Uses helper functions (detectAirLeakIsotope, detectOilIsotope) from isotopePatterns.ts → need cross-validation
- **Missing Isotopes:** Neon, Krypton, Xenon not checked (rare but useful for leak detection)
- **No Temperature/Pressure Correction:** Isotope ratios can vary slightly with fractionation

---

## VALIDATION PROMPT (Copy & Paste to Gemini/Grok)

```markdown
# VALIDATION REQUEST: verifyIsotopeRatios()

**Task:** Validate isotope ratios, natural abundances, and measurement tolerances.

---

## IMPLEMENTATION ([detectors.ts:1950-2149](../src/lib/diagnosis/detectors.ts#L1950-L2149))

**Purpose:** Verify isotope ratios of elements (Ar, Cl, Br, C, S, O₂) to increase diagnosis confidence. Severity: info (not critical).

**Detection Logic:**

| Element | Ratio | Code Value | Formula | Tolerance | Confidence | Min Threshold |
|---------|-------|-----------|---------|-----------|------------|---------------|
| Argon | ⁴⁰Ar/³⁶Ar | 295.5 | m40/m36 | ±15% | +30% | m40 > 10× min |
| Chlor | ³⁵Cl/³⁷Cl | 3.13 | m35/m37 | ±15% | +25% | m35 > 5× min |
| Brom | ⁷⁹Br/⁸¹Br | 1.028 | m79/m81 | ±15% | +25% | m79 > 3× min |
| CO₂ | ¹²C/¹³C | 83.6 | m44/m45 | ±15% | +20% | m44 > 10× min |
| Schwefel | ³²S/³⁴S | 22.35 | m32/m34 | ±15% | +25% | m32 > 10× min |
| Sauerstoff | ³²O₂/³⁴O₂ | 487 | m32/m34 | ±15% | +15% | m32 > 10× min |

**Confidence Calculation:**
```
IF Ar ratio matches: +30%
IF Cl ratio matches: +25%
IF Br ratio matches: +25%
IF CO₂ ratio matches: +20%
IF S ratio matches: +25%
IF O₂ ratio matches: +15%
IF Air Leak Isotope: +20%
IF Oil Isotope: +15%

Max = 100%
Threshold = DEFAULT_THRESHOLDS.minConfidence (~0.3)
```

**Severity:** Always `info` (informative, not critical)

---

## VALIDATION QUESTIONS

### Critical

1. **Argon Ratio:** Is ⁴⁰Ar/³⁶Ar = 295.5 correct? (CIAAW 2007 says 298.56!) Which is correct for RGA?
2. **S vs O₂ Discrimination:** Can m32/m34 ratio distinguish S from O₂? Both use same masses! Is this logic sound?
3. **Chlor/Brom:** Are natural abundances correct (³⁵Cl/³⁷Cl = 3.13, ⁷⁹Br/⁸¹Br = 1.028)?
4. **CO₂ Carbon-13:** Is m44/m45 = 83.6 correct for atmospheric CO₂? VPDB standard applicable?
5. **Tolerance:** Is ±15% appropriate for quadrupole RGA at 70 eV EI?

### Non-Critical

6. **Min Thresholds:** Why different multipliers (10×, 5×, 3×) for different elements?
7. **Confidence Weights:** Why Ar = 30% but CO₂ only 20%? Based on measurement precision?
8. **Missing Isotopes:** Should add Ne (²⁰Ne/²²Ne = 9.8), Kr, Xe for completeness?

---

## RESPONSE FORMAT (REQUIRED)

**⚠️ IMPORTANT: Use TABLES ONLY. No prose. Keep under 500 tokens. ⚠️**

### Validation Table

| Element | Ratio | Code Value | Correct? | Should Be | Source |
|---------|-------|-----------|----------|-----------|--------|
| Ar | ⁴⁰/³⁶ | 295.5 | ✅/❌/⚠️ | [correction] | [citation] |
| Cl | ³⁵/³⁷ | 3.13 | ✅/❌/⚠️ | [correction] | [citation] |
| Br | ⁷⁹/⁸¹ | 1.028 | ✅/❌/⚠️ | [correction] | [citation] |
| CO₂ | m44/m45 | 83.6 | ✅/❌/⚠️ | [correction] | [citation] |
| S | ³²/³⁴ | 22.35 | ✅/❌/⚠️ | [correction] | [citation] |
| O₂ | m32/m34 | 487 | ✅/❌/⚠️ | [correction] | [citation] |
| Tolerance | ±15% | ±15% | ✅/❌/⚠️ | [correction] | [RGA precision] |

### Critical Issues

- **Issue 1:** [Description] → [Fix + Source]
- **Issue 2:** [Description] → [Fix + Source]

### Recommended Changes

1. **[Change 1]:** [Reason] ([Authoritative Source])
2. **[Change 2]:** [Reason] ([Source])

### Missing Checks

- **[Missing isotope/feature]:** [Why it matters] ([Source])

### Approval Status

**✅ APPROVED** / **❌ REJECTED** / **⚠️ CONDITIONAL**

**Summary (1 sentence):** [Overall assessment]

---

## CONTEXT: RGA Application

**Target Audience:**
- **RGA practitioners** (vacuum technicians, process engineers) - NOT theoretical physicists
- **Offline desktop tool** for quick spectrum analysis (no cloud, no lab instruments)
- **Goal:** Practical diagnostics for vacuum systems, not academic research

**Technical Environment:**
- **Instrument:** Quadrupole RGA, 70 eV electron impact ionization
- **Standards:** NIST fragmentation patterns, IUPAC isotope data

**Validation Scope:**
- Focus on **practical accuracy** for field use (not ultra-high precision research)
- Tolerances should be **robust** (tolerate instrument-to-instrument variation)
- False positives worse than false negatives (avoid alarm fatigue for users)
- This is **informative** feature (severity: info), not critical alarm

---

**Expected Response Length:** <500 tokens
```

---

**Template Version:** 1.0 (Token-Efficient)
**Target Token Count:** ~1200 (Spec ~800 + Prompt ~500)

---

## 🤖 Gemini Review

**Status:** ⏳ Awaiting Response

### Validation Table

| Element | Ratio | Code Value | Correct? | Should Be | Source |
| --- | --- | --- | --- | --- | --- |
| **Ar** | ⁴⁰Ar/³⁶Ar | 295.5 | ⚠️ | 298.56 | [CIAAW 2006] |
| **Cl** | ³⁵Cl/³⁷Cl | 3.13 | ✅ | 3.13 | [IUPAC] |
| **Br** | ⁷⁹Br/⁸¹Br | 1.028 | ✅ | 1.028 | [IUPAC] |
| **CO₂** | m44/m45 | 83.6 | ✅ | ~85 | [NIST/Calc] |
| **S** | ³²S/³⁴S | 22.35 | ✅ | 22.2–22.6 | [IUPAC] |
| **O₂** | m32/m34 | **487** | ❌ | **~250** | [NIST/Calc] |
| **Tol** | Range | ±15% | ✅ | ±15–20% | [Std RGA] |

### Critical Issues

| Issue | Description | Fix + Source |
| --- | --- | --- |
| **O₂ Ratio Error** | Code uses **atomic** abundance ratio (~487) instead of **molecular** probability. O₂ has 2 atoms; probability of ¹⁶O¹⁸O is . | **Change to ~250.**<br>

<br>Calculation: . NIST shows ~250. |
| **S vs O₂ Ambiguity** | Both use m32/m34. O₂ (Air) is ubiquitous in vacuum. O₂ ratio (~250) vs S ratio (~22). High O₂ background makes S detection at m32 unreliable. | **Add Secondary Check.**<br>

<br>Require m64 (SO₂) presence or tighten S threshold. |

### Recommended Changes

| Change | Reason | Source |
| --- | --- | --- |
| **Update Ar Ratio** | Update 295.5 to **298.6**. While 295.5 is within tolerance, it relies on outdated Nier (1950) data. | [Lee et al., 2006] |
| **Adjust O₂ Confidence** | Decrease O₂ weight. m32/m34 is easily distorted by background/saturation. | [Practical RGA] |
| **Add ¹⁵N Check** | Add N₂ check (m28/m29 ratio ~135) to distinguish Air (N₂) from CO (m28). | [NIST] |

### Missing Checks

| Feature | Why it matters |
| --- | --- |
| **Water (H₂O)** | m18/m17 ratio (~4.5). Confirming H₂O signature helps rule out air leaks vs outgassing. |
| **Neon (Ne)** | ²⁰Ne/²²Ne (~10). Distinguishes real air leaks from trapped volumes or virtual leaks. |

### Approval Status

**⚠️ CONDITIONAL**

**Summary:** Logic is sound except for a **critical calculation error in Oxygen isotopes** (factor of 2) which will cause false negatives for O₂ verification; Argon value is slightly outdated but acceptable.

---

## 🤖 Grok Review

**Status:** ⏳ Awaiting Response

### Validation Table

| Element | Ratio | Code Value | Correct? | Should Be | Source |
|---------|-------|-----------|----------|-----------|--------|
| Ar | ⁴⁰/³⁶ | 295.5 | ⚠️ | 298.56 | CIAAW |
| Cl | ³⁵/³⁷ | 3.13 | ✅ | 3.13 | IUPAC |
| Br | ⁷⁹/⁸¹ | 1.028 | ✅ | 1.028 | IUPAC |
| CO₂ | m44/m45 | 83.6 | ✅ | 84 | VPDB calc |
| S | ³²/³⁴ | 22.35 | ⚠️ | 21.7 | IUPAC |
| O₂ | m32/m34 | 487 | ❌ | 244 | IUPAC |
| Tolerance | ±15% | ±15% | ✅ | ±15% | RGA prac |

### Critical Issues

- **Issue 1:** Ar ratio outdated (295.5 old Nier value) → Update to 298.56 [CIAAW/web:53]
- **Issue 2:** O₂ m32/m34 uses atomic ¹⁶O/¹⁸O instead of molecular → Correct to 244 + calc [IUPAC/web:35]
- **Issue 3:** S vs O₂ discrimination sound but O₂ value wrong risks mismatch → Fix O₂ + tolerance adj [RGA/web:58]

### Recommended Changes

1. **[Update Ar/Cl/Br/S ratios to latest IUPAC]:** Align with modern abundances for field accuracy ([IUPAC/web:0,6,21])
2. **[Adjust O₂ to molecular ratio]:** Prevent false negatives in air leak detection ([IUPAC/web:35])
3. **[Tune min thresholds by element rarity]:** Br lower due to signal (3×), Ar/S higher (10×) ([RGA prac/web:58])
4. **[Weight confidence by distinctiveness]:** Ar high (air marker), O₂ low (overlap risk) ([RGA/web:61])

### Missing Checks

- **[Ne ²⁰/²²=9.25]:** Confirms air/noble gases ([IUPAC])
- **[Kr ⁸⁴/⁸⁶=3.08, Xe]:** Rare air components for completeness ([IUPAC])

### Approval Status

**⚠️ CONDITIONAL**

**Summary (1 sentence):** Mostly practical for RGA but needs Ar/O₂ corrections to avoid diagnostic errors.

---

## ✅ Merged Validation (Claude)

**Status:** ✅ Complete (2026-01-11)
**Approval:** ⚠️ **CONDITIONAL** (Unanimous from Gemini + Grok)

---

### Consensus (Both AIs Agree)

| Issue | Severity | Finding | Recommendation |
|-------|----------|---------|----------------|
| **Ar ratio outdated** | MEDIUM | 295.5 is Nier (1950), modern value is 298.56 (Lee 2006) | ✅ Update to 298.56 (already planned in Feature 1.8.4) |
| **O₂ ratio WRONG** | **CRITICAL** | Uses atomic ¹⁶O/¹⁸O ≈ 487 instead of molecular ³²O₂/³⁴O₂ | ❌ **MUST FIX:** Change to ~244-250 |
| **Cl ratio** | ✅ | 3.13 is correct (IUPAC) | Keep as-is |
| **Br ratio** | ✅ | 1.028 is correct (IUPAC) | Keep as-is |
| **CO₂ ratio** | ✅ | 83.6 is close to 84-85 (VPDB standard) | Keep as-is (within tolerance) |
| **S ratio** | ✅/⚠️ | 22.35 is approximately correct (IUPAC: 21.7-22.6) | Keep as-is |
| **Tolerance ±15%** | ✅ | Appropriate for quadrupole RGA | Keep as-is |

---

### Divergent Findings (Differences)

| Parameter | Gemini | Grok | Resolution |
|-----------|--------|------|------------|
| **O₂ correct value** | ~250 (probability calc) | 244 (IUPAC) | ✅ Use **244-250** range (both close) |
| **S correct value** | 22.2-22.6 | 21.7 | ⚠️ Keep **22.35** (middle of range) |
| **CO₂ precision** | ~85 | 84 | ✅ Keep **83.6** (acceptable) |
| **Min threshold logic** | Not mentioned | Should tune by rarity | ✅ Valid point (future improvement) |

---

### Critical Issues (Implementation Impact)

**❌ MUST FIX (before deployment):**

1. **Oxygen Ratio Calculation ERROR (CRITICAL)**
   - **Problem:** Code uses **487** (atomic ¹⁶O/¹⁸O abundance ratio)
   - **Reality:** Molecular O₂ has **2 oxygen atoms** → probability of ¹⁶O¹⁸O is different
   - **Calculation:**
     ```
     P(¹⁶O) = 0.99757
     P(¹⁸O) = 0.00205

     P(³²O₂) = P(¹⁶O¹⁶O) = 0.99757² = 0.9951
     P(³⁴O₂) = P(¹⁶O¹⁸O) × 2 = 2 × 0.99757 × 0.00205 = 0.00409

     Ratio = 0.9951 / 0.00409 ≈ 243-244
     ```
   - **Fix:** Change `expectedO2 = 487` to `expectedO2 = 244`
   - **Impact:** Current code will **FAIL to detect O₂** (ratio off by 2×)
   - **Source:** Both AIs (Gemini: "factor of 2", Grok: "244")

**⚠️ SHOULD FIX (improves accuracy):**

2. **Argon Ratio Outdated (MEDIUM)**
   - **Problem:** 295.5 is Nier (1950) data
   - **Fix:** Update to 298.56 (Lee 2006, CIAAW 2007)
   - **Impact:** LOW (1% deviation, within ±15% tolerance)
   - **Status:** Already planned in Feature 1.8.4

3. **S vs O₂ Ambiguity (MEDIUM)**
   - **Problem:** Both use m/z 32, 34 - O₂ is ubiquitous in vacuum
   - **Fix:** Add secondary check (require m/z 64 SO₂ presence, or tighten threshold)
   - **Source:** Gemini (high O₂ background makes S detection unreliable)

**📋 NICE TO HAVE (future improvements):**

4. **Add Ne, Kr, Xe checks** → Complete noble gas suite
5. **Add H₂O check** (m18/m17 ≈ 4.5) → Distinguish outgassing from air leaks
6. **Add ¹⁵N check** (N₂ m28/m29 ≈ 135) → Distinguish N₂ from CO
7. **Weight confidence by distinctiveness** → Ar high (air marker), O₂ low (overlap risk)
8. **Tune min thresholds by element rarity** → Br lower (3×), Ar/S higher (10×)

---

### Final Recommendation

**Approval Status:** ⚠️ **CONDITIONAL APPROVAL**

**Before use in production:**

1. ❌ **FIX O₂ ratio calculation (CRITICAL):**
   ```typescript
   // File: src/lib/knowledge/isotopePatterns.ts
   // BEFORE:
   const expectedO2 = 487  // ❌ WRONG (atomic ratio)

   // AFTER:
   const expectedO2 = 244  // ✅ CORRECT (molecular ratio)
   ```
   **Line:** detectors.ts ~2066

2. ⚠️ **Consider S detection reliability:**
   - O₂ is ubiquitous → m32/m34 heavily biased toward O₂
   - Recommendation: Increase S detection threshold or add m64 (SO₂) check
   - **Not blocking**, but improves practical accuracy

3. ✅ **Ar ratio update:**
   - Already planned in Feature 1.8.4
   - Update 295.5 → 298.56

**Optional enhancements:**
- Add Ne, H₂O, ¹⁵N checks for completeness
- Weight confidence by element distinctiveness
- Tune min thresholds by signal strength

---

### Physics Validated ✅

**Core detection logic:** SOUND (with O₂ fix)
- Isotope ratio verification: Valid concept
- Multi-element cross-validation: Good approach
- Confidence scaling: Mathematically OK

**Critical flaw:** O₂ calculation uses atomic instead of molecular ratio (factor 2× error)

---

**Cross-Validation Complete:** Gemini ⚠️ + Grok ⚠️ = **Unanimous Conditional Approval**

**Implementation Impact:** 🔴 HIGH - O₂ ratio error will cause false negatives in air leak detection
