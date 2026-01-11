# REVERSE_SPEC: detectPolymerOutgassing()

**Status:** ⏳ Zur Cross-Validation
**Detector:** detectPolymerOutgassing
**File:** [src/lib/diagnosis/detectors.ts:1694-1758](../src/lib/diagnosis/detectors.ts#L1694-L1758)
**Purpose:** Detect polymer outgassing (PEEK/Kapton/Viton) characterized by dominant H₂O release
**Severity:** Info
**Created:** 2026-01-11

---

## Implementation Logic

**Detection Strategy:** Identify dominant H₂O signal without air leak signature (distinguishes polymer outgassing from atmospheric water vapor).

| Parameter | Code Value | Formula/Logic | Purpose |
|-----------|-----------|---------------|---------|
| **Water dominant** | m18 > 2× m28 | H₂O/N₂ ratio | H₂O signal exceeds nitrogen by factor 2+ |
| **No air leak** | m28/m32 >5 OR m40 <0.5% | N₂/O₂ anomalous OR Ar very low | Excludes atmospheric air |
| **Normal H₂O ratio** | 3.5 < m18/m17 < 5.0 | H₂O⁺/OH⁺ ratio | Typical fragmentation (expected ~4.3) |
| **Affected masses** | 16, 17, 18 | O, OH, H₂O | Water fragmentation pattern |

**Confidence Calculation:**
```
IF m18 > 2×m28 AND no air leak: +0.4
IF no air leak detected: +0.2
IF normal H₂O/OH ratio (3.5-5.0): +0.2
Total: 0.4-0.8
Threshold: minConfidence (0.5)
```

**Severity:** `info` (normal behavior for polymer materials, not a contamination alarm)

**Recommendation:**
- Solution: Extended pumping, bakeout at max. allowed polymer temperature (150-200°C)
- Common sources: PEEK/Kapton/Viton seals and components

---

## VALIDATION PROMPT (Copy & Paste to Gemini/Grok)

```markdown
# VALIDATION REQUEST: detectPolymerOutgassing()

**Task:** Validate physical model, water fragmentation pattern correctness, and implementation logic for detecting polymer outgassing (PEEK/Kapton/Viton) in RGA systems.

---

## IMPLEMENTATION ([detectors.ts:1694-1758](../src/lib/diagnosis/detectors.ts#L1694-L1758))

**Purpose:** Detect polymer outgassing characterized by dominant H₂O release from high-performance polymers (PEEK, Kapton, Viton) used in vacuum systems. Distinguishes from atmospheric water by checking for absent/anomalous air signature.

**Detection Logic:**

| Parameter | Code Value | Formula | Purpose |
|-----------|-----------|---------|---------|
| Water dominant | m18 > 2×m28 | H₂O/N₂ ratio | H₂O exceeds nitrogen |
| No air leak (check 1) | m28/m32 >5 | N₂/O₂ anomalous | Normal air is ~4:1 |
| No air leak (check 2) | m40 <0.5% | Ar very low | Ar indicator of air |
| Normal H₂O/OH ratio | 3.5 < m18/m17 < 5.0 | Fragmentation pattern | Expected ~4.3 |
| Affected masses | 16, 17, 18 | O, OH, H₂O | Water fragments |

**Confidence Calculation:**
```
IF m18 > 2×m28 AND no air: +0.4
IF no air leak: +0.2
IF normal H₂O/OH: +0.2
Total: 0.4-0.8
Threshold: 0.5 (minConfidence)
```

**Severity:** `info` (not alarming, normal polymer behavior)

---

## VALIDATION QUESTIONS

### Critical

1. **H₂O/N₂ ratio (2×):** Is m18 > 2×m28 a valid threshold for "water dominant"? What is typical background in UHV/HV systems?
2. **N₂/O₂ anomaly (>5):** Air has N₂/O₂ ≈ 4:1 (m28/m32 ≈ 3.7 accounting for fragmentation). Is >5 correct for "no air"?
3. **H₂O/OH ratio (3.5-5.0):** Is the expected range correct for 70 eV EI? NIST shows what value?
4. **Ar threshold (<0.5%):** Atmospheric Ar is ~1% - is <0.5% appropriate for "no air leak"?

### Non-Critical

5. **Polymer specificity:** Do PEEK, Kapton, Viton have distinguishable outgassing patterns, or is H₂O always dominant?
6. **Missing fragments:** Should check m16 (O⁺) or m44 (CO₂) from polymer decomposition?
7. **Temperature dependence:** Does outgassing pattern change with bakeout temperature (150°C vs 200°C)?
8. **False positives:** Could cryopump regeneration, leak checks, or other H₂O sources trigger false positives?

---

## RESPONSE FORMAT (REQUIRED)

**⚠️ IMPORTANT: Use TABLES ONLY. No prose. Keep under 500 tokens. ⚠️**

### Validation Table

| Parameter | Code Value | Correct? | Should Be | Source |
|-----------|-----------|----------|-----------|--------|
| H₂O/N₂ threshold | >2× (m18/m28) | ✅/❌/⚠️ | [value] | [UHV water background] |
| N₂/O₂ air check | >5 (m28/m32) | ✅/❌/⚠️ | [value] | [Air fragmentation at 70 eV] |
| H₂O/OH ratio | 3.5-5.0 | ✅/❌/⚠️ | [value] | [NIST water fragmentation] |
| Ar threshold | <0.5% (m40) | ✅/❌/⚠️ | [value] | [Atmospheric Ar concentration] |

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

**Summary (1 sentence):** [Overall assessment of polymer outgassing detection logic and water fragmentation pattern correctness]

---

## CONTEXT: RGA Application

**Target Audience:**
- **RGA practitioners** (vacuum technicians, process engineers) - NOT polymer chemists
- **Offline desktop tool** for quick spectrum analysis (no cloud, no lab instruments)
- **Goal:** Distinguish polymer outgassing (normal) from air leaks or contamination (problematic)

**Technical Environment:**
- **Instrument:** Quadrupole RGA, 70 eV electron impact ionization
- **Typical pressure:** UHV to HV (10⁻⁶ to 10⁻⁹ mbar)
- **Common polymer sources:** PEEK fittings, Kapton insulation, Viton O-rings
- **Standards:** NIST fragmentation patterns, vacuum industry best practices

**Validation Scope:**
- Focus on **practical differentiation** between polymer H₂O and atmospheric H₂O
- **Critical:** Avoid false positives from air leaks (different diagnosis and solution)
- Severity "info" justified - polymer outgassing is expected, not alarming
- False negatives acceptable (conservative approach - don't flag unless confident)

**Polymer Outgassing:**
- **Mechanism:** Absorbed water (bulk and surface) desorbs under vacuum
- **Typical amount:** 0.1-1% by weight for Viton, less for PEEK/Kapton
- **Temperature dependence:** Accelerated by bakeout (150-200°C max for most polymers)
- **Time dependence:** Decreases exponentially with pump-down time
- **Reversible:** Polymers can re-absorb water from atmosphere

---

**Expected Response Length:** <500 tokens
```

---

## Next Steps

1. **User:** Copy prompt above, submit to Gemini + Grok
2. **User:** Paste both reviews here when ready
3. **Claude:** Merge reviews, identify critical issues
4. **Claude:** Update 4 mandatory files (REVERSE_SPEC, CROSS_VALIDATION_STATUS, FEATURE_BACKLOG, ready.md)

---

**Template Version:** 1.0 (Token-Efficient)
**Total Tokens:** ~1100 (Spec ~650 + Prompt ~450)

---

## 🤖 Gemini Review

**Status:** ✅ Complete

### Validation Table

| Parameter | Code Value | Correct? | Should Be | Source |
| --- | --- | --- | --- | --- |
| **H₂O/N₂ threshold** | `m18 > 2*m28` | ✅ | `>5` or `>10` (Better specificity) | [Leybold Vacuum Fundamentals] |
| **N₂/O₂ air check** | `m28/m32 > 5` | ✅ | `>5` (Rules out air ~4.0) | [O'Hanlon, User's Guide to Vacuum] |
| **H₂O/OH ratio** | `3.5 - 5.0` | ✅ | `4.0 - 4.8` (Ideal center ~4.3) | [NIST Mass Spec Data Center] |
| **Ar threshold** | `<0.5%` (m40) | ✅ | `<0.5%` (Air Ar/N₂ ≈ 1.2%) | [Standard Atmosphere Composition] |

### Critical Issues

* **Issue 1:** **Source Ambiguity** → The logic detects **Water**, not specifically **Polymers**. Unbaked stainless steel also outgasses primarily H₂O (>90%).
* *Fix:* Rename to "Water Outgassing (Polymer/Surface)" or reduce confidence if system is All-Metal.


* **Issue 2:** **Sensitivity** → `m18 > 2*m28` is a low bar. In a clean, polymer-heavy system, H₂O is often 10x-50x higher than N₂.
* *Fix:* Increase threshold to `m18 > 5*m28` to distinguish strong outgassing from "dirty" vacuum.



### Recommended Changes

1. **[Refine Ratio]:** Tighten H₂O/OH ratio to `3.8 - 4.8` ([NIST]). Values <3.5 imply overlap with NH₃ (m17); values >5.0 imply electronics noise or filament issues.
2. **[Add m16 Check]:** Verify `m16 ≈ 1-2% of m18` ([NIST]). Confirms O⁺ fragment from water, distinguishing from CO/N₂ residuals if m18 is saturated.
3. **[Viton Specifics]:** If "Viton" is a known context, check for `m19 (F)` or `m20 (HF)` trace peaks (usually absent, but specific to fluoroelastomers) ([NASA Outgassing Data]).

### Missing Checks

* **[CO₂ Check (m44)]:** Polymer outgassing often includes CO₂ (m44) alongside H₂O, unlike pure steel desorption. Ratio `m44/m18 ~ 0.05-0.1`. ([CERN Vacuum Group])
* **[Hydrocarbon Check]:** Check `m41, m43, m55, m57` (fragments). Polymers may release organics; pure water outgassing does not.

### Approval Status

**⚠️ CONDITIONAL**

**Summary:** The logic correctly identifies a water-dominated system without air leaks (valid physics), but cannot scientifically distinguish "Polymer" outgassing from standard unbaked stainless steel desorption without additional hydrocarbon/CO₂ signatures.

---

## 🤖 Grok Review

**Status:** ✅ Complete

### Validation Table

| Parameter | Code Value | Correct? | Should Be | Source |
|-----------|-----------|----------|-----------|--------|
| H₂O/N₂ threshold | >2× (m18/m28) | ✅ | >2× | Vacuum RGA practices  |
| N₂/O₂ air check | >5 (m28/m32) | ⚠️ | >4.5 | Air ratio ≈3.7  |
| H₂O/OH ratio | 3.5-5.0 | ✅ | 3.5-5.5 | NIST ≈4.7  |
| Ar threshold | <0.5% (m40) | ✅ | <0.5% | Atmospheric ≈1%  |

### Critical Issues

- **Issue 1:** N₂/O₂ threshold slightly high vs actual air ratio → Adjust to >4.5
- **Issue 2:** H₂O/OH range low end tight → Widen to 3.5-5.5

### Recommended Changes

1. **[Tighten N₂/O₂ check]:** Better precision for air anomaly (>4.5) ()
2. **[Add m16 check]:** Include O⁺ for full water pattern ()

### Missing Checks

- **[m16 (O⁺) fragment]:** Confirms water presence ([NIST])
- **[CO₂ (m44) check]:** Detects polymer decomposition ()

### Approval Status

**✅ APPROVED**

**Summary (1 sentence):** The polymer outgassing detection logic is sound with minor adjustments needed for air check precision and water pattern completeness in RGA systems.

---

## ✅ Merged Validation (Claude)

**Status:** ✅ Complete (2026-01-11)
**Approval:** ⚠️ **CONDITIONAL** (Gemini Conditional + Grok Approved = Overall Conditional)

---

### Consensus (Both AIs Agree)

| Issue | Severity | Finding | Recommendation |
|-------|----------|---------|----------------|
| **Add m16 (O⁺) check** | MEDIUM | Both AIs recommend adding O⁺ fragment verification | ✅ Add m16 check (~1-2% of m18) |
| **Add CO₂ (m44) check** | MEDIUM | Polymer outgassing includes CO₂, unlike pure steel desorption | ✅ Add m44 check (m44/m18 ~ 0.05-0.1) |
| **H₂O/N₂ threshold concept** | ✅ | >2× is physically valid for water-dominant detection | Keep as-is (optional: increase for specificity) |
| **Ar threshold** | ✅ | <0.5% correct for "no air" detection | Keep as-is |
| **Overall detection logic** | ✅ | Correctly identifies water-dominated system without air | Physics sound |

---

### Divergent Findings (Differences)

| Parameter | Gemini | Grok | Resolution |
|-----------|--------|------|------------|
| **Approval Status** | ⚠️ Conditional (cannot distinguish polymer from steel) | ✅ Approved (minor adjustments) | ⚠️ Use **CONDITIONAL** (polymer specificity issue) |
| **H₂O/N₂ threshold** | Increase to >5× or >10× for better specificity | >2× OK | ⚠️ Keep **>2×** (current), consider increase (not critical) |
| **N₂/O₂ threshold** | >5 OK (rules out air ~4.0) | Should be >4.5 (air ratio ≈3.7) | ✅ Use **>4.5** (more accurate) |
| **H₂O/OH ratio range** | Tighten to 3.8-4.8 (ideal ~4.3) | Widen to 3.5-5.5 (NIST ≈4.7) | ⚠️ Keep **3.5-5.0** (current is reasonable) |
| **Polymer specificity** | CRITICAL issue (detects water, not polymers) | Minor issue (just add m16/m44) | ❌ **CRITICAL:** Rename function or add polymer markers |
| **Hydrocarbon check** | Should check m41, m43, m55, m57 | Not mentioned | ✅ Good idea for polymer vs steel distinction |
| **Viton-specific checks** | Check m19 (F), m20 (HF) for fluoroelastomers | Not mentioned | ⚠️ Optional (future enhancement) |

---

### Critical Issues (Implementation Impact)

**❌ MUST FIX (before deployment):**

1. **Polymer vs Steel Ambiguity (CRITICAL)**
   - **Problem:** Function is named "detectPolymerOutgassing" but detects generic water outgassing
   - **Reality:** Unbaked stainless steel also outgasses >90% H₂O - indistinguishable from polymers
   - **Impact:** Misleading diagnosis - users may think polymers are present when it's just steel desorption
   - **Fix:** Either:
     - **Option A:** Rename to `detectWaterOutgassing()` with note "Common sources: polymers, unbaked steel"
     - **Option B:** Add polymer-specific markers (CO₂, hydrocarbons) to increase confidence
     ```typescript
     // Add polymer-specific checks
     const m16 = getPeak(peaks, 16)   // O⁺ from H₂O fragmentation
     const m44 = getPeak(peaks, 44)   // CO₂ (polymer decomposition)
     const m41 = getPeak(peaks, 41)   // Hydrocarbon fragments
     const m43 = getPeak(peaks, 43)

     // Check for polymer signatures (not just water)
     const hasPolymerMarkers = (m44 > 0 && m44/m18 > 0.02) || (m41 > 0 || m43 > 0)

     if (hasPolymerMarkers) {
       // Likely polymer outgassing
       solution: "Polymer outgassing - extended pumping or bakeout"
     } else {
       // Generic water (could be steel, could be polymer)
       solution: "Water outgassing (polymer or unbaked steel) - extended pumping"
     }
     ```
   - **Source:** Gemini (Critical Issue #1)

**⚠️ SHOULD FIX (improves accuracy):**

2. **N₂/O₂ Threshold Slightly High (MEDIUM)**
   - **Problem:** Code uses >5 but actual air N₂/O₂ ≈ 3.7 (accounting for fragmentation)
   - **Fix:** Adjust threshold to >4.5
   - **Impact:** MEDIUM (current threshold still works, just less precise)
   - **Source:** Grok (Critical Issue #1)

3. **Add m16 (O⁺) Check (MEDIUM)**
   - **Problem:** Missing O⁺ fragment verification for complete water pattern
   - **Fix:** Add m16 check (~1-2% of m18)
   ```typescript
   const m16 = getPeak(peaks, 16)  // O⁺

   if (m16 > 0 && m18 > 0 && m16/m18 > 0.01 && m16/m18 < 0.03) {
     evidence.push(createEvidence(
       'presence',
       'O⁺ (m/z 16) Fragment detektiert - bestätigt H₂O',
       'O⁺ (m/z 16) fragment detected - confirms H₂O',
       true
     ))
     confidence += 0.1
   }
   ```
   - **Source:** Both AIs (Recommended Changes)

4. **Add CO₂ (m44) Check (MEDIUM)**
   - **Problem:** Polymer outgassing includes CO₂ (m44/m18 ~ 0.05-0.1), steel does not
   - **Fix:** Add m44 check to distinguish polymer from steel
   ```typescript
   const m44 = getPeak(peaks, 44)  // CO₂

   if (m44 > 0 && m18 > 0 && m44/m18 > 0.02 && m44/m18 < 0.15) {
     evidence.push(createEvidence(
       'presence',
       'CO₂ detektiert - typisch für Polymer-Dekomposition',
       'CO₂ detected - typical for polymer decomposition',
       true
     ))
     confidence += 0.2  // Stronger evidence of polymer (not just steel)
     affectedMasses.push(44)
   }
   ```
   - **Source:** Both AIs (Missing Checks)

**📋 NICE TO HAVE (future improvements):**

5. **H₂O/N₂ Threshold Increase** → Increase to >5× or >10× for better specificity (Gemini suggestion)
6. **H₂O/OH Range Refinement** → Tighten to 3.8-4.8 (Gemini) OR widen to 3.5-5.5 (Grok) - current OK
7. **Hydrocarbon Check** → Add m41, m43, m55, m57 for polymer vs steel distinction (Gemini)
8. **Viton-Specific Checks** → Add m19 (F), m20 (HF) for fluoroelastomers (Gemini)
9. **System Context** → Reduce confidence if system is all-metal (no polymers) (Gemini)

---

### Final Recommendation

**Approval Status:** ⚠️ **CONDITIONAL APPROVAL**

**Before use in production:**

1. ❌ **Fix function naming/specificity (CRITICAL):**
   ```typescript
   // File: src/lib/diagnosis/detectors.ts
   // Line ~1694-1758 (detectPolymerOutgassing)

   // OPTION A: Rename function
   export function detectWaterOutgassing(input: DiagnosisInput): DiagnosticResult | null {
     // Update messages
     title: {
       de: 'Wasser-Ausgasung (Polymer/Stahl)',
       en: 'Water Outgassing (Polymer/Steel)'
     }
   }

   // OPTION B: Add polymer-specific markers (RECOMMENDED)
   // Keep function name, but add CO₂ + hydrocarbon checks to confirm polymer
   const m44 = getPeak(peaks, 44)  // CO₂
   const m41 = getPeak(peaks, 41)  // Hydrocarbons
   const m43 = getPeak(peaks, 43)

   const hasPolymerMarkers = (m44/m18 > 0.02) || (m41 > minPeakHeight || m43 > minPeakHeight)

   // Adjust confidence/messaging based on polymer markers
   ```

2. ⚠️ **Adjust N₂/O₂ threshold:**
   ```typescript
   // Line ~1715
   // BEFORE:
   const noAirLeak = (m28 / Math.max(m32, 0.001)) > 5 || m40 < 0.005

   // AFTER:
   const noAirLeak = (m28 / Math.max(m32, 0.001)) > 4.5 || m40 < 0.005
   ```

3. ✅ **Add m16 (O⁺) check:**
   ```typescript
   // Add after m17 definition
   const m16 = getPeak(peaks, 16)  // O⁺

   // Check for O⁺ fragment (1-2% of m18)
   if (m16 > 0 && m18 > 0 && m16/m18 > 0.01 && m16/m18 < 0.03) {
     confidence += 0.1
     // Add to affectedMasses: [16, 17, 18]
   }
   ```

4. ✅ **Add m44 (CO₂) check:**
   ```typescript
   const m44 = getPeak(peaks, 44)  // CO₂

   // Check for CO₂ (polymer decomposition marker)
   if (m44 > 0 && m18 > 0 && m44/m18 > 0.02 && m44/m18 < 0.15) {
     confidence += 0.2  // Stronger polymer evidence
     // Add to affectedMasses: [16, 17, 18, 44]
   }
   ```

**Optional enhancements:**
- Increase H₂O/N₂ threshold to >5× for better specificity
- Add hydrocarbon checks (m41, m43, m55, m57)
- Add Viton-specific F/HF checks (m19, m20)

---

### Physics Validated ✅

**Core detection logic:** SOUND (for water detection)
- H₂O-dominant signature: Valid concept ✅
- Air leak exclusion: Correct approach ✅
- H₂O/OH fragmentation: Correct ratio ✅
- Severity "info": Appropriate ✅

**Critical flaw:** Function name implies polymer specificity but detects generic water outgassing (cannot distinguish polymer from unbaked steel without additional markers)

---

**Cross-Validation Complete:** Gemini ⚠️ + Grok ✅ = **Overall Conditional Approval**

**Implementation Impact:** 🟡 MEDIUM - Function works for water detection but lacks polymer specificity (misleading diagnosis)