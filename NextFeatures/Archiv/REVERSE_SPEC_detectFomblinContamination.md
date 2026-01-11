# REVERSE_SPEC: detectFomblinContamination()

**Status:** ⏳ Zur Cross-Validation
**Detector:** detectFomblinContamination
**File:** [src/lib/diagnosis/detectors.ts:219-286](../src/lib/diagnosis/detectors.ts#L219-L286)
**Purpose:** Detect perfluoropolyether (PFPE) vacuum oil contamination (Fomblin, Krytox, etc.)
**Severity:** Critical
**Created:** 2026-01-11

---

## Implementation Logic

**Detection Strategy:** Identify perfluorinated fragments (CF₃⁺, CF⁺, CFO⁺) while excluding hydrocarbon patterns typical of mineral oils.

| Parameter | Code Value | Formula/Logic | Purpose |
|-----------|-----------|---------------|---------|
| **Primary marker** | m/z 69 (CF₃⁺) | Must be >10× minPeakHeight (0.01) → >0.1 (10%) | Strongest PFPE fragment |
| **Secondary markers** | m/z 31 (CF⁺), m/z 47 (CFO⁺) | Presence above minPeakHeight (0.001) | Additional PFPE fragments |
| **Anti-pattern** | m/z 41, 43, 57 (alkyl) | Must be <30-50% of m69 | Distinguish from mineral oil |
| **Affected masses** | 20, 31, 47, 50, 69 | Listed but not all actively checked | PFPE cracking pattern |

**Confidence Calculation:**
```
IF m69 > 10%: +0.4
IF alkyl peaks low (m41<30%, m43<50%, m57<50% of m69): +0.3
IF m31 OR m47 > 0.1%: +0.2
Total: 0.4-0.9
Threshold: minConfidence (0.5)
```

**Severity:** `critical` (PFPE is extremely persistent, difficult to remove)

**Recommendation:**
- Source: Diffusion pump oil, vacuum-compatible grease
- Action: Intensive cleaning required, PFPE highly persistent

---

## VALIDATION PROMPT (Copy & Paste to Gemini/Grok)

```markdown
# VALIDATION REQUEST: detectFomblinContamination()

**Task:** Validate physical model, PFPE fragmentation pattern correctness, and implementation logic for detecting Fomblin/PFPE vacuum oil contamination in RGA systems.

---

## IMPLEMENTATION ([detectors.ts:219-286](../src/lib/diagnosis/detectors.ts#L219-L286))

**Purpose:** Detect perfluoropolyether (PFPE) vacuum oils (Fomblin, Krytox, Demnum) by characteristic fluorocarbon fragments. PFPE oils are commonly used in diffusion pumps and vacuum-compatible lubricants.

**Detection Logic:**

| Parameter | Code Value | Formula | Purpose |
|-----------|-----------|---------|---------|
| Primary marker | m/z 69 (CF₃⁺) | Must be >10% | Strongest PFPE fragment |
| Secondary markers | m/z 31 (CF⁺), m/z 47 (CFO⁺) | >0.1% each | Additional PFPE evidence |
| Anti-pattern check | m/z 41, 43, 57 | <30-50% of m69 | Exclude mineral oil |
| Affected masses | 20, 31, 47, 50, 69 | Listed | PFPE cracking pattern |

**Confidence Calculation:**
```
IF m69 > 10%: +0.4
IF alkyl peaks suppressed: +0.3
IF m31 OR m47 present: +0.2
Total: 0.4-0.9
Threshold: 0.5 (minConfidence)
```

**Severity:** `critical` (PFPE extremely persistent)

---

## VALIDATION QUESTIONS

### Critical

1. **CF₃⁺ at m/z 69:** Is this the correct primary marker for PFPE oils? What is the typical fragmentation pattern under 70 eV EI?
2. **Threshold (10%):** Is requiring m69 >10% appropriate? What are typical PFPE signals in contaminated vacuum systems?
3. **Alkyl anti-pattern:** Are m/z 41, 43, 57 thresholds (30-50% of m69) correct for distinguishing PFPE from hydrocarbon oils?
4. **m/z 20 (HF⁺):** Listed in affectedMasses but NOT checked. Should HF⁺ be part of detection logic? What is HF⁺/CF₃⁺ ratio in PFPE?
5. **m/z 50 (CF₂⁺):** Listed but NOT checked. Should CF₂⁺ be actively validated? What is CF₂⁺/CF₃⁺ ratio?

### Non-Critical

6. **CFO⁺ at m/z 47:** Is this fragment characteristic of oxidized PFPE or always present?
7. **False positives:** Could refrigerants (HFCs/HFOs) trigger this detector? How to distinguish?
8. **PFPE variants:** Do Fomblin, Krytox, Demnum have identical patterns, or should detector be specific?
9. **Quantification:** Should severity scale with m69 intensity (low/medium/high contamination levels)?

---

## RESPONSE FORMAT (REQUIRED)

**⚠️ IMPORTANT: Use TABLES ONLY. No prose. Keep under 500 tokens. ⚠️**

### Validation Table

| Parameter | Code Value | Correct? | Should Be | Source |
|-----------|-----------|----------|-----------|--------|
| m/z 69 (CF₃⁺) | Primary, >10% | ✅/❌/⚠️ | [value] | [PFPE mass spec data] |
| m/z 31 (CF⁺) | Secondary, >0.1% | ✅/❌/⚠️ | [value] | [Fragmentation pattern] |
| m/z 47 (CFO⁺) | Secondary, >0.1% | ✅/❌/⚠️ | [value] | [PFPE oxidation] |
| m/z 20 (HF⁺) | Not checked | ✅/❌/⚠️ | [should check?] | [HF production in EI] |
| m/z 50 (CF₂⁺) | Not checked | ✅/❌/⚠️ | [should check?] | [PFPE pattern] |
| Alkyl anti-pattern | m41/43/57 <30-50% | ✅/❌/⚠️ | [thresholds] | [Mineral oil vs PFPE] |

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

**Summary (1 sentence):** [Overall assessment of PFPE detection logic and fragmentation pattern correctness]

---

## CONTEXT: RGA Application

**Target Audience:**
- **RGA practitioners** (vacuum technicians, process engineers) - NOT theoretical chemists
- **Offline desktop tool** for quick spectrum analysis (no cloud, no lab instruments)
- **Goal:** Practical diagnostics for vacuum system contamination, identify cleaning urgency

**Technical Environment:**
- **Instrument:** Quadrupole RGA, 70 eV electron impact ionization
- **Typical pressure:** UHV to HV (10⁻⁶ to 10⁻⁹ mbar)
- **Common PFPE sources:** Diffusion pump oil backstreaming, vacuum grease migration
- **Standards:** NIST fragmentation patterns, PFPE manufacturer data (Solvay Fomblin, DuPont Krytox)

**Validation Scope:**
- Focus on **practical detection** in field conditions (not lab-grade quantification)
- Distinguish PFPE from mineral oils (different cleaning approaches)
- **Critical:** PFPE is EXTREMELY persistent (very difficult to remove) → severity=critical justified
- False positives acceptable if flagging potential PFPE (conservative approach)
- Should NOT confuse with refrigerant leaks (HFCs) if possible

**PFPE Chemistry:**
- **Structure:** -(CF₂-CF₂-O)n- or -(CF₂-O)n- backbone
- **Molecular weight:** 2000-10000 Da (polymeric)
- **Thermal stability:** Very high (used specifically for high-vacuum applications)
- **Persistence:** Does NOT pump away easily, requires solvent cleaning

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
**Total Tokens:** ~1200 (Spec ~750 + Prompt ~450)

---

## 🤖 Gemini Review

**Status:** ✅ Complete

### Validation Table

| Parameter | Code Value | Correct? | Should Be | Source |
|-----------|-----------|----------|-----------|--------|
| m/z 69 (CF₃⁺) | Primary, >10% | ✅ | Base Peak (100%) | NIST: Fomblin Y |
| m/z 31 (CF⁺) | Secondary, >0.1% | ⚠️ | >1-5% | Solvay Fomblin Data |
| m/z 47 (CFO⁺) | Secondary, >0.1% | ⚠️ | >1-3% | Fomblin Fragmentation |
| m/z 20 (HF⁺) | Not checked | ✅ | Do not check | HF is extrinsic |
| m/z 50 (CF₂⁺) | Not checked | ❌ | Check (>5-10%) | NIST: Major Peak |
| Alkyl anti-pattern | m41/43/57 <30-50% | ⚠️ | <20% of m69 | NIST: Hydrocarbons |

### Critical Issues

- **Issue 1:** Missing m/z 50 (CF₂⁺) check - 2nd/3rd strongest peak in PFPE → Add m/z 50 check (>5% relative to m69) + NIST WebBook
- **Issue 2:** Low secondary thresholds (>0.1%) - noise could trigger → Raise to >1.0% relative to m69 + Instrument Detection Limits

### Recommended Changes

1. **Add m/z 50 (CF₂⁺) Check:** Major fragment (CF₂ chain unit) (Standard Cracking Patterns)
2. **Add m/z 119 (C₂F₅⁺):** Distinguish from lighter refrigerants (Kurt J. Lesker RGA Data)
3. **Refine Alkyl Threshold:** Lower to <20% - PFPE systems usually no mineral oil (Practical Vacuum Experience)

### Missing Checks

- **m/z 100 (C₂F₄⁺):** Common stable fragment in polymer chains (NIST)
- **Refrigerant Discrimination:** Check m/z 51 or 85 to distinguish Freons (RGA Library)

### Approval Status

**⚠️ CONDITIONAL**

**Summary:** Logic sound for basic detection (m69 + anti-alkyl), but omission of m/z 50 and very low secondary thresholds (0.1%) risk false positives/negatives in noisy spectra.

---

## 🤖 Grok Review

**Status:** ✅ Complete

### Validation Table

| Parameter | Code Value | Correct? | Should Be | Source |
|-----------|-----------|----------|-----------|--------|
| m/z 69 (CF₃⁺) | Primary, >10% | ✅ | Primary, >10% | Hiden Analytical cracking patterns |
| m/z 31 (CF⁺) | Secondary, >0.1% | ✅ | Secondary, >0.1% | Fluorocarbon fragmentation inference |
| m/z 47 (CFO⁺) | Secondary, >0.1% | ✅ | Secondary, >0.1% | PFPE oxidation patterns |
| m/z 20 (HF⁺) | Not checked | ⚠️ | Optional check >1% | Hiden Fomblin data |
| m/z 50 (CF₂⁺) | Not checked | ❌ | Check >0.1%, ratio ~0.12 | CF4/PFPE patterns |
| Alkyl anti-pattern | m41/43/57 <30-50% | ✅ | <30-50% of m69 | RGA hydrocarbon vs PFPE distinction |

### Critical Issues

- **Issue 1:** m/z 50 not in logic → Add secondary check m50 >0.1% and m50/m69 ~0.1-0.2 + Hiden Analytical
- **Issue 2:** m/z 20 listed but ignored → Add optional m20/m69 ~0.28 for confirmation + Hiden Fomblin spectrum

### Recommended Changes

1. **Add m50 to markers:** Enhances PFPE specificity (Hiden cracking patterns)
2. **Scale severity by m69:** Low <5%, med 5-20%, high >20% (Vacuum RGA practice)
3. **Add refrigerant check:** If m51 >0.1%, flag possible HFC (RGA false positive avoidance)

### Missing Checks

- **m/z 119 (C₂F₅⁺):** Confirms polymeric PFPE (PFPE literature)
- **m/z 51 (CHF₂⁺):** Distinguishes from HFCs/refrigerants (Vacuum diagnostics)

### Approval Status

**⚠️ CONDITIONAL**

**Summary (1 sentence):** The PFPE detection logic is fundamentally sound with correct primary marker and anti-patterns but requires additional secondary fragment checks for improved accuracy and reduced false positives.

---

## ✅ Merged Validation (Claude)

**Status:** ✅ Complete (2026-01-11)
**Approval:** ⚠️ **CONDITIONAL** (Unanimous from Gemini + Grok)

---

### Consensus (Both AIs Agree)

| Issue | Severity | Finding | Recommendation |
|-------|----------|---------|----------------|
| **m/z 50 (CF₂⁺) MISSING** | **CRITICAL** | 2nd/3rd strongest peak in PFPE spectra, not checked | ✅ Add m/z 50 check (see divergent findings for threshold) |
| **m/z 69 (CF₃⁺) primary** | ✅ | >10% threshold correct | Keep as-is |
| **Alkyl anti-pattern concept** | ✅ | Correct approach to distinguish PFPE from mineral oil | Keep concept (threshold adjustment optional) |
| **m/z 20 (HF⁺) ambiguous** | ⚠️ | Listed in affectedMasses but not checked | See divergent findings |
| **Add m/z 119 (C₂F₅⁺)** | MEDIUM | Distinguishes PFPE from refrigerants | ✅ Add as tertiary marker |
| **Refrigerant check** | MEDIUM | HFCs/HFOs could trigger false positives | ✅ Add m/z 51 (CHF₂⁺) check |

---

### Divergent Findings (Differences)

| Parameter | Gemini | Grok | Resolution |
|-----------|--------|------|------------|
| **m/z 50 (CF₂⁺) threshold** | >5-10% (major peak) | >0.1%, ratio 0.1-0.2 | ✅ Use **>5%** (more conservative, avoids noise) |
| **m/z 31/47 thresholds** | >1% (not 0.1% - noise risk) | >0.1% OK | ⚠️ Use **>1%** (safer against false positives) |
| **m/z 20 (HF⁺)** | Do NOT check (extrinsic) | Optional check >1% | ✅ Do NOT check (Gemini correct - HF from atmosphere) |
| **Alkyl threshold** | <20% of m69 | <30-50% OK | ⚠️ Keep **<30%** (current code, practical compromise) |
| **Severity scaling** | Not mentioned | Scale by m69 intensity | ✅ Good idea (future enhancement) |

---

### Critical Issues (Implementation Impact)

**❌ MUST FIX (before deployment):**

1. **m/z 50 (CF₂⁺) Missing (CRITICAL)**
   - **Problem:** Code checks m69 (CF₃⁺) but NOT m50 (CF₂⁺)
   - **Reality:** m/z 50 is the **2nd or 3rd strongest peak** in PFPE spectra (NIST)
   - **Impact:** Missing critical fragment weakens PFPE vs fluorinated gas differentiation
   - **Fix:** Add m/z 50 check with threshold >5% (absolute) or m50/m69 >0.15
     ```typescript
     const m50 = getPeak(peaks, 50)  // CF₂⁺

     // Check if m50 is present and significant
     if (m50 > DEFAULT_THRESHOLDS.minPeakHeight * 50 || (m69 > 0 && m50/m69 > 0.15)) {
       evidence.push(createEvidence(
         'presence',
         'CF₂⁺ (m/z 50) detektiert - typisch für PFPE',
         'CF₂⁺ (m/z 50) detected - typical for PFPE',
         true
       ))
       confidence += 0.2
     }

     // Update affectedMasses list
     affectedMasses: [20, 31, 47, 50, 69]
     ```
   - **Source:** Both AIs (Gemini: "Major Peak", Grok: "ratio ~0.12")

**⚠️ SHOULD FIX (improves accuracy):**

2. **Secondary Thresholds Too Low (MEDIUM)**
   - **Problem:** m/z 31, 47 use minPeakHeight (0.001 = 0.1%)
   - **Reality:** Noise could trigger 0.1% - these are significant fragments, not traces
   - **Fix:** Raise to >1% (10× minPeakHeight)
     ```typescript
     // Line ~261
     if (m31 > DEFAULT_THRESHOLDS.minPeakHeight * 10 ||
         m47 > DEFAULT_THRESHOLDS.minPeakHeight * 10) {
       // existing logic
     }
     ```
   - **Source:** Gemini (Instrument Detection Limits)
   - **Impact:** Reduces false positives from noisy spectra

3. **Alkyl Threshold Too Loose (LOW)**
   - **Problem:** Allows m41/43/57 up to 30-50% of m69
   - **Fix:** Consider tightening to <20% (PFPE systems rarely have mineral oil)
   - **Source:** Gemini (Practical Vacuum Experience)
   - **Impact:** LOW (current thresholds are acceptable compromise)

**📋 NICE TO HAVE (future improvements):**

4. **Add m/z 119 (C₂F₅⁺)** → Tertiary marker for polymeric PFPE
5. **Add refrigerant check (m/z 51)** → Distinguish HFCs from PFPE
6. **Scale severity by m69 intensity** → Low <5%, medium 5-20%, high >20%
7. **Add m/z 100 (C₂F₄⁺)** → Common stable fragment in PFPE polymers

---

### Final Recommendation

**Approval Status:** ⚠️ **CONDITIONAL APPROVAL**

**Before use in production:**

1. ❌ **ADD m/z 50 (CF₂⁺) check (CRITICAL):**
   ```typescript
   // File: src/lib/diagnosis/detectors.ts
   // Line ~219-286 (detectFomblinContamination)

   const m69 = getPeak(peaks, 69)  // CF₃⁺ - Hauptmarker
   const m31 = getPeak(peaks, 31)  // CF⁺
   const m47 = getPeak(peaks, 47)  // CFO⁺
   const m50 = getPeak(peaks, 50)  // CF₂⁺ ← ADD THIS

   // Check m50 as secondary marker
   if (m50 > DEFAULT_THRESHOLDS.minPeakHeight * 50) {
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

2. ⚠️ **Raise secondary thresholds (MEDIUM):**
   ```typescript
   // Line ~261
   // BEFORE:
   if (m31 > DEFAULT_THRESHOLDS.minPeakHeight || m47 > DEFAULT_THRESHOLDS.minPeakHeight)

   // AFTER:
   if (m31 > DEFAULT_THRESHOLDS.minPeakHeight * 10 ||
       m47 > DEFAULT_THRESHOLDS.minPeakHeight * 10)
   ```

3. ✅ **Update affectedMasses:**
   ```typescript
   // Line ~284
   // BEFORE:
   affectedMasses: [20, 31, 47, 50, 69]

   // AFTER:
   affectedMasses: [31, 47, 50, 69]  // Remove m20 (HF⁺ is extrinsic)
   ```

**Optional enhancements:**
- Add m/z 119 (C₂F₅⁺) as tertiary marker
- Add m/z 51 (CHF₂⁺) refrigerant check
- Scale severity by m69 intensity
- Tighten alkyl threshold to <20%

---

### Physics Validated ✅

**Core detection logic:** SOUND (with m/z 50 addition)
- CF₃⁺ at m/z 69: Correct primary marker ✅
- Alkyl anti-pattern: Valid approach ✅
- Severity "critical": Appropriate (PFPE extremely persistent) ✅

**Critical flaw:** Missing m/z 50 (CF₂⁺) - second strongest PFPE fragment

---

**Cross-Validation Complete:** Gemini ⚠️ + Grok ⚠️ = **Unanimous Conditional Approval**

**Implementation Impact:** 🟡 MEDIUM - Missing m/z 50 weakens PFPE specificity, but m69 + alkyl anti-pattern is functional