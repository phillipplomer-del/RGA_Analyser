# Reverse-Spec: detectHeliumLeak()

**File:** [detectors.ts:845-927](../src/lib/diagnosis/detectors.ts#L845-L927)
**Purpose:** Qualitative helium screening (NOT quantitative leak testing)
**Created:** 2026-01-11
**Status:** ⏳ Awaiting Cross-Validation

---

## Summary

**Function:** `detectHeliumLeak()`
**Goal:** Screen for unusually high helium concentration as indicator to use dedicated He leak detector
**Limitation:** RGA is 1-2 orders of magnitude less sensitive than dedicated He leak detectors (~5×10⁻¹² mbar·l/s)
**Critical Ambiguity:** m/z 4 = He⁺ OR D₂⁺ (both 4 Da)

**Detection Strategy:**
1. Check m/z 4 signal (He⁺ or D₂⁺)
2. Calculate He/H₂ ratio > 10% = notable
3. Check m/z 3 (HD) for deuterium disambiguation

**Severity:** `info` (qualitative screening tool)

---

## Implementation Logic

### Detection Criteria

| Criterion | Value | Purpose | Confidence Weight |
|-----------|-------|---------|-------------------|
| m/z 4 signal | > minPeakHeight | He⁺ or D₂⁺ detection | +0.3 |
| m/z 4 absolute | > 1% | Minimum reportable signal | Required |
| He/H₂ ratio | > 10% | Notable helium presence | +0.4 |
| He/H₂ ratio | ≤ 10% | Background/low helium | +0.2 |
| m/z 3 (HD) present | > minPeakHeight | Deuterium indicator | -0.1 (uncertainty) |

**Minimum Confidence:** DEFAULT_THRESHOLDS.minConfidence
**Maximum Confidence:** 1.0 (capped)

### Constants & Thresholds

| Parameter | Value | Source | Validated? |
|-----------|-------|--------|------------|
| He/H₂ "notable" | >0.1 (10%) | Code hardcoded | ❓ |
| Absolute minimum | 0.01 (1%) | Code hardcoded | ❓ |
| m/z 3 presence | minPeakHeight | DEFAULT_THRESHOLDS | ❓ |

---

## Edge Cases

| Scenario | Current Behavior | Correct? |
|----------|------------------|----------|
| D₂ laboratory exposure | May misidentify as He | ❓ m/z 3 check partial |
| He tracer gas test | Correctly identifies He | ✅ |
| Low He background (~ppm) | No detection (<1% threshold) | ✅ Designed for "notable" amounts |
| He²⁺ at m/z 2 | Ignored | ❓ Should validate if significant |

---

## Known Gaps

- He²⁺ double ionization at m/z 2 not checked
- RSF correction not applied to He signal
- No pressure-dependent threshold adjustment
- D₂/He disambiguation relies only on m/z 3 check

---

## VALIDATION PROMPT (Copy & Paste to Gemini/Grok)

```markdown
# VALIDATION REQUEST: detectHeliumLeak()

**Task:** Validate physical model, mathematical correctness, and implementation logic for qualitative helium detection in RGA systems.

---

## IMPLEMENTATION ([detectors.ts:845-927](../src/lib/diagnosis/detectors.ts#L845-L927))

**Purpose:** Qualitative helium screening tool (NOT quantitative leak rate measurement). RGA is 1-2 orders of magnitude less sensitive than dedicated He leak detectors.

**Detection Logic:**

| Parameter | Code Value | Formula | Purpose |
|-----------|-----------|---------|---------|
| Primary mass | m/z 4 | He⁺ OR D₂⁺ | Helium or deuterium |
| Absolute minimum | 0.01 (1%) | Hardcoded | Minimum reportable signal |
| He/H₂ ratio | >0.1 (10%) | m4/m2 | "Notable" helium presence |
| D₂ check | m/z 3 (HD) | Presence/absence | Deuterium disambiguation |
| Confidence loss | -0.1 | If m3 present | Uncertainty due to D₂ overlap |

**Confidence Calculation:**
```
IF m4 present: +0.3
IF m4/m2 > 0.1: +0.4 (else +0.2)
IF m3 > threshold: -0.1
Total: 0.3-0.7
Threshold: minConfidence
```

**Severity:** `info` (screening, not alarm)

---

## VALIDATION QUESTIONS

### Critical

1. **He/H₂ ratio (10%):** Is this threshold physically justified? What is the normal atmospheric He/H₂ ratio in vacuum systems?
2. **Absolute minimum (1%):** Realistic for typical RGA sensitivity to helium? Should be RSF-corrected?
3. **He²⁺ at m/z 2:** Can 70 eV electron impact produce significant He²⁺? What is the He²⁺/He⁺ ratio?
4. **D₂ disambiguation:** Is m/z 3 (HD) check sufficient to distinguish D₂ from He? Should there be additional criteria?

### Non-Critical

5. **RSF correction:** Should He signal be corrected for ionization efficiency before ratio calculation?
6. **Pressure dependence:** Should thresholds vary with base pressure?
7. **Severity level:** "info" appropriate, or should be "warning" for higher concentrations?
8. **Quantitative disclaimer:** Is "1-2 orders of magnitude less sensitive" accurate?

---

## RESPONSE FORMAT (REQUIRED)

**⚠️ IMPORTANT: Use TABLES ONLY. No prose. Keep under 500 tokens. ⚠️**

### Validation Table

| Parameter | Code Value | Correct? | Should Be | Source |
|-----------|-----------|----------|-----------|--------|
| He/H₂ threshold | >0.1 (10%) | ✅/❌/⚠️ | [value] | [NIST/Hiden/etc] |
| Absolute min | 0.01 (1%) | ✅/❌/⚠️ | [value] | [RGA sensitivity data] |
| m/z 3 (HD) check | presence/absence | ✅/❌/⚠️ | [logic] | [D₂ cracking pattern] |
| He²⁺ at m/z 2 | Not checked | ✅/❌/⚠️ | [ratio if needed] | [NIST EI data] |

### Critical Issues

- **Issue 1:** [Description] → [Fix + Source]
- **Issue 2:** [Description] → [Fix + Source]

### Recommended Changes

1. **[Change 1]:** [Reason] ([Authoritative Source])
2. **[Change 2]:** [Reason] ([Source])

### Missing Checks

- **[Missing feature]:** [Why it matters] ([Source])

### Approval Status

**✅ APPROVED** / **❌ REJECTED** / **⚠️ CONDITIONAL**

**Summary (1 sentence):** [Overall assessment of physical validity and implementation correctness]

---

## CONTEXT: RGA Application

**Target Audience:**
- **RGA practitioners** (vacuum technicians, process engineers) - NOT theoretical physicists
- **Offline desktop tool** for quick spectrum analysis (no cloud, no lab instruments)
- **Goal:** Practical diagnostics for vacuum systems, not academic research

**Technical Environment:**
- **Instrument:** Quadrupole RGA, 70 eV electron impact ionization
- **Typical pressure:** UHV to HV (10⁻⁶ to 10⁻⁹ mbar)
- **Use case:** Screening tool → recommend dedicated He leak detector if positive
- **Standards:** NIST fragmentation patterns, vacuum industry best practices (SRS, Hiden, Pfeiffer)

**Validation Scope:**
- Focus on **practical accuracy** for field use (not ultra-high precision research)
- Thresholds should be **robust** (tolerate instrument-to-instrument variation)
- False positives worse than false negatives (avoid alarm fatigue for users)
- **Critical:** Distinguish He from D₂ (both m/z 4)

---

**Expected Response Length:** <500 tokens
```

---

**Template Version:** 1.0 (Token-Efficient)
**Total Tokens:** ~1100 (Spec ~700 + Prompt ~400)

---

## 🤖 Gemini Review

**Status:** ⏳ Awaiting Response

### Validierungstabelle

| Parameter | Code-Wert | Status | Sollte sein | Quelle |
| --- | --- | --- | --- | --- |
| He/H₂ Schwelle | >0.1 (10%) | ⚠️ | >0.01 (1%) | [Pfeiffer/Leybold RGA Handbücher] |
| Absolut Min | 0.01 (1%) | ⚠️ | 1E-4 (100ppm) | [Typische RGA Dyn. Range] |
| m/z 3 (HD) Check | Vorhanden | ✅ | Beibehalten | [Wasserstoff-Isotopenaustausch] |
| He²⁺ bei m/z 2 | Nicht geprüft | ✅ | Ignorieren | [NIST Cross-Sections @ 70eV] |

### Kritische Probleme

* **Problem 1:** Schwellenwert 10% (He/H₂) ist für UHV zu hoch.
* **Fix:** Reduzierung auf 1-2% (0.01-0.02). He hat geringere Ionisierungswahrscheinlichkeit als H₂; das Signal ist bereits physikalisch unterdrückt.


* **Problem 2:** Fehlende Empfindlichkeitskorrektur (RSF).
* **Fix:** Rohes Ionenstrom-Verhältnis ist irreführend. H₂ (RSF ~0.44) ist empfindlicher als He (RSF ~0.15). Ohne Korrektur wird He systematisch unterschätzt.



### Empfohlene Änderungen

1. **[RSF-Korrektur]:** Implementieren vor Verhältnisberechnung. `(I_He / 0.15) / (I_H2 / 0.44)`. ([ISO 20181 / NIST])
2. **[Massen-Check m/z 8, 12, 16]:** Prüfen auf CH₄-Fragmente bei m/z 4? Nein, CH₄ fragmentiert kaum auf m/z 4, aber C⁴⁺ ist möglich (selten). Hauptgefahr ist D₂. ([Basierend auf m/z 3 Check ok])
3. **[Logik-Anpassung]:** "Confidence" sollte bei Anwesenheit von m/z 3 stärker sinken (-0.3 statt -0.1), da D₂ bei m/z 4 nicht von He unterscheidbar ist (Quadrupol-Auflösung).

### Fehlende Checks

* **[Luft-Indikator]:** Prüfen von N₂/Ar Verhältnis (m/z 28 / 40).
* **Grund:** Wenn He zum "Sprühen" (Leak Check) genutzt wird, sollte N₂ konstant bleiben. Steigt N₂ mit He, ist es ein virtuelles Leck oder Lufteinbruch, kein reines He-Leck.



### Genehmigungsstatus

**⚠️ CONDITIONAL** (Bedingt genehmigt)

**Zusammenfassung:** Die Logik ist physikalisch solide für Groblecks, aber für typische Vakuumanwendungen (UHV) viel zu unempfindlich (Schwellenwerte um Faktor 10-100 zu hoch).

---

## 🤖 Grok Review

**Status:** ⏳ Awaiting Response

### Validation Table

| Parameter | Code Value | Correct? | Should Be | Source |
|-----------|-----------|----------|-----------|--------|
| He/H₂ threshold | >0.1 (10%) | ⚠️ | >0.04 (RSF-adjusted) | Pfeiffer Vacuum Fundamentals , SRS RGA Notes  |
| Absolute min | 0.01 (1%) | ✅ | 0.01 | INFICON RGA Guidelines , Hiden RGA Brochure  |
| m/z 3 (HD) check | presence/absence | ⚠️ | presence + m2 cracking ratio | D₂ Cracking Patterns ,  |
| He²⁺ at m/z 2 | Not checked | ✅ | <0.01 ratio | Electron Impact Ionization Data ,  |

### Critical Issues

- **Issue 1:** He/H₂ threshold lacks physical justification without RSF; normal vacuum He/H₂ <<0.01 → Adjust to >0.04 with RSF_He/RSF_H₂ ≈0.4 + Pfeiffer/SRS data , 
- **Issue 2:** Absolute min ignores RSF; RGA He sensitivity 0.15-0.3 rel. N₂ → Apply RSF correction + INFICON/Hiden , 
- **Issue 3:** He²⁺ negligible at 70eV (<1%) → No change needed + Ionization Cross-Sections , 
- **Issue 4:** m/z3 insufficient for pure D₂ (no HD if no H) → Add m2 D⁺ check + Cracking Patterns , 

### Recommended Changes

1. **RSF correction for He/H₂:** Improves ratio accuracy (ionization eff. He 0.18, H₂ 0.44) (Hiden RSF App Note )
2. **Pressure-dependent thresholds:** Adjusts for UHV/HV variation (base P 10⁻⁶-10⁻⁹ mbar) (Pfeiffer Fundamentals )
3. **Severity to warning if >50%:** Avoids under-alarming high He (SRS RGA Interpretation )
4. **Disclaimer update:** 1-3 orders less sensitive (Leybold RGA vs LD )

### Missing Checks

- **RSF application:** Matters for true partial pressure ratios (Hiden/SRS RSF , )
- **Instrument resolution for m4:** Distinguishes He⁺ (4.0026) vs D₂⁺ (4.0282) (Quadrupole Limits )
- **Background H₂ calibration:** Affects D₂ disambiguation in mixed gases (Cracking Patterns )

### Approval Status

**⚠️ CONDITIONAL**

**Summary (1 sentence):** Implementation is practically sound for field screening but requires RSF corrections and enhanced D₂ checks for full physical accuracy.

---

## ✅ Merged Validation (Claude)

**Status:** ✅ Complete (2026-01-11)
**Approval:** ⚠️ **CONDITIONAL** (Unanimous from Gemini + Grok)

---

### Consensus (Both AIs Agree)

| Issue | Severity | Finding | Recommendation |
|-------|----------|---------|----------------|
| **RSF correction missing** | **CRITICAL** | He (RSF ~0.15-0.18) vs H₂ (RSF ~0.44) → raw ratios systematically underestimate He | ✅ Apply RSF correction: `(I_He / 0.15) / (I_H2 / 0.44)` |
| **He/H₂ threshold too high** | HIGH | 10% threshold unrealistic for UHV/HV applications (normal vacuum He/H₂ <<0.01) | ✅ Reduce to 1-4% (see divergent findings) |
| **He²⁺ at m/z 2** | ✅ | Negligible at 70 eV EI (<1%) | No check needed |
| **m/z 3 (HD) check** | ✅ | Valid approach for D₂ disambiguation | Keep as-is (with optional improvement) |
| **Qualitative screening** | ✅ | Appropriate for RGA limitations vs dedicated He leak detectors | Keep severity as "info" |

---

### Divergent Findings (Differences)

| Parameter | Gemini | Grok | Resolution |
|-----------|--------|------|------------|
| **He/H₂ corrected threshold** | >0.01 (1%) | >0.04 (4%) | ✅ Use **>0.02-0.04** (2-4%, RSF-corrected) |
| **Absolute minimum** | 1E-4 (100 ppm) too low | 0.01 (1%) OK | ⚠️ Keep **0.01** (1%) - practical for field use |
| **m/z 3 check sufficiency** | ✅ Sufficient | ⚠️ Insufficient (needs m2 D⁺) | ⚠️ Current OK, add m2 check as future improvement |
| **Confidence reduction** | Should be -0.3 (not -0.1) | Not mentioned | ✅ Use **-0.3** (stronger penalty for D₂ ambiguity) |
| **Severity upgrade** | Not mentioned | Should be "warning" if >50% | ⚠️ Keep "info" (screening tool, not alarm) |
| **Sensitivity disclaimer** | "1-2 orders" OK | Should be "1-3 orders" | ✅ Update to **"1-3 orders of magnitude"** |

---

### Critical Issues (Implementation Impact)

**❌ MUST FIX (before deployment):**

1. **RSF Correction Missing (CRITICAL)**
   - **Problem:** Code uses raw ion current ratios (m4/m2) without RSF correction
   - **Reality:** He has RSF ~0.15-0.18, H₂ has RSF ~0.44 → Factor 2-3× difference
   - **Impact:** Current code systematically **underestimates helium presence** by factor 2-3×
   - **Fix:** Apply RSF correction before ratio calculation:
     ```typescript
     const RSF_He = 0.15   // Helium relative sensitivity (NIST, Hiden)
     const RSF_H2 = 0.44   // Hydrogen relative sensitivity
     const ratio_4_2_corrected = (m4 / RSF_He) / (m2 / RSF_H2)
     // Then compare to threshold
     ```
   - **Source:** Both AIs (Gemini: ISO 20181/NIST, Grok: Pfeiffer/Hiden/SRS)

2. **He/H₂ Threshold Too High (HIGH)**
   - **Problem:** Code uses **>0.1 (10%)** as "notable" threshold
   - **Reality:** Normal vacuum He/H₂ << 0.01 in UHV/HV systems
   - **Impact:** Will **miss typical helium leaks** in vacuum applications
   - **Fix:** Reduce to **>0.02-0.04 (2-4%)** after RSF correction
   - **Source:** Both AIs (Gemini: Pfeiffer/Leybold RGA Handbooks, Grok: SRS RGA Notes)
   - **Rationale:** With RSF correction, threshold needs adjustment for UHV sensitivity

**⚠️ SHOULD FIX (improves accuracy):**

3. **Confidence Penalty for m/z 3 Too Low (MEDIUM)**
   - **Problem:** Code reduces confidence by -0.1 when m/z 3 (HD) detected
   - **Fix:** Increase penalty to **-0.3** (stronger uncertainty)
   - **Source:** Gemini (D₂ is indistinguishable from He at quadrupole resolution)

4. **Disclaimer Underestimates Sensitivity Gap (LOW)**
   - **Problem:** Code says "1-2 orders of magnitude less sensitive"
   - **Fix:** Update to **"1-3 orders of magnitude"** (more accurate)
   - **Source:** Grok (Leybold RGA vs dedicated leak detector comparison)

**📋 NICE TO HAVE (future improvements):**

5. **Add m/z 2 D⁺ check** → Distinguish pure D₂ (no HD if no H) from He
6. **Add N₂/Ar air indicator** → Detect virtual leaks vs true He leaks (Gemini)
7. **Pressure-dependent thresholds** → Adjust for UHV vs HV base pressure (Grok)
8. **Upgrade severity to "warning"** → If He/H₂ ratio >0.5 (50%) after RSF correction (Grok)

---

### Final Recommendation

**Approval Status:** ⚠️ **CONDITIONAL APPROVAL**

**Before use in production:**

1. ❌ **Add RSF correction (CRITICAL):**
   ```typescript
   // File: src/lib/diagnosis/detectors.ts
   // Line ~869-892 (He/H₂ ratio calculation)

   // BEFORE:
   const ratio_4_2 = m4 / m2
   if (ratio_4_2 > 0.1) {  // ❌ No RSF, threshold too high

   // AFTER:
   const RSF_He = 0.15   // NIST/Hiden Analytical RSF for He
   const RSF_H2 = 0.44   // NIST/Hiden Analytical RSF for H₂
   const ratio_4_2 = (m4 / RSF_He) / (m2 / RSF_H2)
   if (ratio_4_2 > 0.03) {  // ✅ RSF-corrected, UHV-appropriate threshold (3%)
   ```

2. ❌ **Adjust confidence penalty for m/z 3 (HIGH):**
   ```typescript
   // Line ~905

   // BEFORE:
   confidence -= 0.1  // ❌ Too weak penalty

   // AFTER:
   confidence -= 0.3  // ✅ Stronger uncertainty for D₂/He ambiguity
   ```

3. ✅ **Update disclaimer:**
   ```typescript
   // Line ~918-919

   // BEFORE:
   "RGA ist NICHT sensitiv genug für quantitative Leckratenbestimmung!"
   "RGA is NOT sensitive enough for quantitative leak rate determination!"

   // AFTER:
   "RGA ist 1-3 Größenordnungen weniger sensitiv als dedizierte He-Leckdetektoren (~5×10⁻¹² mbar·l/s)."
   "RGA is 1-3 orders of magnitude less sensitive than dedicated He leak detectors (~5×10⁻¹² mbar·l/s)."
   ```

**Optional enhancements:**
- Add m/z 2 D⁺ check for pure D₂ disambiguation
- Add N₂/Ar air indicator for virtual leak detection
- Implement pressure-dependent thresholds for UHV vs HV

---

### Physics Validated ✅

**Core detection logic:** SOUND (with RSF correction)
- Qualitative He screening: Valid concept ✅
- m/z 3 (HD) disambiguation: Good approach ✅
- Severity "info" appropriate: Correct for screening tool ✅

**Critical flaws:**
1. Missing RSF correction → Factor 2-3× systematic underestimation of He
2. Threshold too high for UHV applications (10× too insensitive)

---

**Cross-Validation Complete:** Gemini ⚠️ + Grok ⚠️ = **Unanimous Conditional Approval**

**Implementation Impact:** 🔴 HIGH - Without RSF correction, code will systematically underestimate helium and miss typical vacuum leaks
