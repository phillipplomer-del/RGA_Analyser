# Reverse-Spec: detectOilBackstreaming()

**Source:** [detectors.ts:135-214](../src/lib/diagnosis/detectors.ts#L135-L214)
**Status:** ⏳ Awaiting Validation
**Created:** 2026-01-11

---

## Summary

Erkennt Rückströmung von Mineralöl (Vorpumpen/Turbopumpen) durch charakteristisches Δ14 amu Kohlenwasserstoff-Muster. Unterscheidet zwischen Vorpumpenöl, Turbopumpenöl und PFPE (Fomblin).

---

## Logic Extract

### Detection Criteria

| Criterion | Implementation | Threshold | Weight |
|-----------|----------------|-----------|--------|
| Oil masses | `[41,43,55,57,69,71,83,85]` | Δ14 amu pattern | - |
| Min peaks | `detected.length` | ≥3 | - |
| Confidence | `detected.length / 8` | ≥0.3 | Variable |

### Key Ratios

| Ratio | Formula | Expected | Range | Purpose |
|-------|---------|----------|-------|---------|
| C₄H₉⁺/C₃H₇⁺ | `m57 / m43` | 0.7-0.9 | 0.5-1.2 | Oil signature |
| Turbopump marker | `m71 / m43` | >0.4 | - | Pump type detection |
| Fomblin check | `m69 / m43` | - | m69>m43 → PFPE | Anti-pattern |

### Code Logic

```typescript
// Pattern detection
const oilMasses = [41, 43, 55, 57, 69, 71, 83, 85]
const detected = oilMasses.filter(m => getPeak(peaks, m) > threshold)

if (detected.length < 3) return null

// Oil signature
const ratio_57_43 = m57 / m43
const ratioValid = ratio_57_43 >= 0.5 && ratio_57_43 <= 1.2

// Fomblin exclusion (PFPE has m69 dominant, low alkyl)
if (m69 > m43 && m41 < threshold) return null

// Pump type
let oilType = 'Vorpumpe'
if (m71/m43 > 0.4) oilType = 'Turbopumpe'

confidence = detected.length / 8
severity = confidence > 0.6 ? 'critical' : 'warning'
```

**Confidence Calculation:**
```
confidence = detected_peaks / 8
range: 0.375 (3/8) to 1.0 (8/8)
threshold: 0.3 (min to trigger detection)
```

---

## Validation Questions

**Critical:**
1. **Δ14 amu pattern:** Physically correct for mineral oil hydrocarbons (CₙH₂ₙ₊₁⁺ series)?
2. **m57/m43 = 0.7-0.9:** Source? Typical for which specific oil types (PAO, mineral oil, ester-based)?
3. **m71/m43 > 0.4:** Validated threshold for turbopump vs forepump oil differentiation?
4. **Masses [41,43,55,57,69,71,83,85]:** Complete? Should include m/z 99, 113 for heavier hydrocarbons?

**Non-Critical:**
5. **PDMS interference:** Missing check for silicone oil (m/z 73, 147, 207, 221)?
6. **Confidence scaling:** Linear (count/8) appropriate, or should weight main peaks (43, 57) higher?
7. **Edge case:** What if pure C₃ or C₄ alkanes (not oil) present?

---

## Sources to Check

- [ ] NIST Chemistry WebBook: Hydrocarbon EI fragmentation (70 eV) - alkane series
- [ ] Pfeiffer Vacuum: Application Note "Oil Contamination in Vacuum Systems"
- [ ] Hiden Analytical: "Identifying Pump Oil Backstreaming"
- [ ] Leybold Fundamentals: Turbopump oil vs rotary vane oil spectra
- [ ] Literature: PDMS fragmentation pattern, silicone oil interference

---

## Known Gaps

- **Argon-corrected ratios:** Not implemented (atmospheric air dilution could distort ratios)
- **PDMS check:** Feature 1.8.3 added m/z 59 (PDMS marker), but not integrated into oil detector
- **Quantification:** No leak rate calculation, only qualitative detection

---

## Anti-Patterns Implemented

| Scenario | Check | Action |
|----------|-------|--------|
| PFPE (Fomblin) | `m69 > m43 && m41 < threshold` | Return null (separate detector) |
| Atmospheric air | Not checked | Could dilute oil signature |
| Silicone oil (PDMS) | Not checked | Could cause false positive |

---

## VALIDATION PROMPT (Copy & Paste to Gemini/Grok)

```markdown
# VALIDATION REQUEST: detectOilBackstreaming()

**Task:** Validate physical model, mathematical correctness, and implementation logic for mineral oil backstreaming detection in RGA systems.

---

## IMPLEMENTATION ([detectors.ts:135-214](../src/lib/diagnosis/detectors.ts#L135-L214))

**Purpose:** Detect mineral oil contamination from forepumps/turbopumps using characteristic hydrocarbon fragmentation pattern.

**Detection Logic:**

| Parameter | Code Value | Formula | Purpose |
|-----------|-----------|---------|---------|
| Oil masses | `[41,43,55,57,69,71,83,85]` | Δ14 amu | CₙH₂ₙ₊₁⁺ alkyl series |
| Min peaks | 3 | `detected.length ≥ 3` | Confidence threshold |
| m57/m43 ratio | 0.7-0.9 | Range: 0.5-1.2 | C₄H₉⁺/C₃H₇⁺ signature |
| Turbopump marker | >0.4 | `m71/m43` | Differentiates pump type |
| Fomblin exclusion | - | `m69>m43 && m41<threshold` | Avoid PFPE false positive |

**Confidence Calculation:**
```
confidence = detected_peaks / 8
IF m57/m43 in [0.5, 1.2]: add evidence
IF m71/m43 > 0.4: oilType = 'Turbopumpe' (else 'Vorpumpe')
Threshold: 0.3 (≥3 peaks)
```

**Severity:** `confidence > 0.6 ? 'critical' : 'warning'`

---

## VALIDATION QUESTIONS

### Critical

1. **Δ14 amu pattern:** Is `[41,43,55,57,69,71,83,85]` physically correct for mineral oil hydrocarbons at 70 eV electron impact?
2. **m57/m43 ratio:** What is the authoritative source for expected range 0.7-0.9? Does it vary by oil type (PAO, mineral, ester)?
3. **m71/m43 > 0.4:** Is this threshold validated for turbopump vs forepump oil differentiation? Source?
4. **Missing masses:** Should heavier alkanes (m/z 99, 113, 127) be included for better specificity?

### Non-Critical

5. **PDMS interference:** Should check for silicone oil (m/z 73, 147, 207, 221) to avoid false positives?
6. **Confidence weighting:** Linear scaling (count/8) vs weighted by main peaks (43, 57)?
7. **Atmospheric dilution:** Should correct ratios for air contamination (N₂, O₂ dilution)?

---

## RESPONSE FORMAT (REQUIRED)

**⚠️ IMPORTANT: Use TABLES ONLY. No prose. Keep under 500 tokens. ⚠️**

### Validation Table

| Parameter | Code Value | Correct? | Should Be | Source |
|-----------|-----------|----------|-----------|--------|
| Δ14 amu masses | [41,43,55,57,69,71,83,85] | ✅/❌/⚠️ | [add/remove masses?] | [NIST/Pfeiffer/etc] |
| m57/m43 range | 0.7-0.9 (valid: 0.5-1.2) | ✅/❌/⚠️ | [correction] | [citation] |
| m71/m43 threshold | >0.4 | ✅/❌/⚠️ | [value] | [source] |
| Fomblin check | m69>m43 && m41<thr | ✅/❌/⚠️ | [logic] | [source] |

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
- **Vacuum systems:** Turbomolecular pumps (PAO oil, PFPE oil) + Rotary vane forepumps (mineral oil)
- **Interference:** PFPE (Fomblin), PDMS (silicone), atmospheric air
- **Standards:** NIST fragmentation patterns, vacuum industry best practices (Pfeiffer, Leybold, Hiden)

**Validation Scope:**
- Focus on **practical accuracy** for field use (not ultra-high precision research)
- Thresholds should be **robust** (tolerate instrument-to-instrument variation)
- False positives worse than false negatives (avoid alarm fatigue for users)

---

**Expected Response Length:** <500 tokens
```

---

**Template Version:** 1.0 (Token-Efficient)
**Total Tokens:** ~1050 (Spec ~650 + Prompt ~400)

---

## 🤖 Gemini Review

**Status:** ⏳ Awaiting Response

### Validation Table

| Parameter | Code Value | Correct? | Should Be | Source |
| --- | --- | --- | --- | --- |
| Δ14 amu masses | `[41,43,55,57,69,71,83,85]` | ✅ | Keep current | [O'Hanlon/NIST Alkanes] |
| m57/m43 range | 0.7-0.9 (code allows 0.5-1.2) | ✅ | 0.6 - 1.0 (Typical) | [NIST Mass Spec Lib] |
| m71/m43 threshold | >0.4 (Turbo vs Fore) | ⚠️ | Heuristic only | [Empirical/Pfeiffer] |
| Fomblin check | `m69>m43 && m41<thr` | ✅ | `m69 > m43 * 2` | [Leybold Fundamentals] |

### Critical Issues

* **Issue 1:** **Ambiguous Source ID** → Ratio `m71/m43` indicates chain length/weight, not pump type definitively. PAO (Turbo) and Mineral (Forepump) spectra overlap significantly.
* **Issue 2:** **Solvent Interference** → Short-chain solvents (Heptane/Hexane) match the Δ14 pattern. Without checking masses >90, "Oil" is indistinguishable from solvent residue.

### Recommended Changes

1. **[Change 1]:** **Rename `oilType**` → Change 'Turbopumpe' to 'Heavy Hydrocarbons' (C>10). Distinction is physically unreliable via simple ratios. ([NIST])
2. **[Change 2]:** **Add High Mass Check** → Require presence of m/z 95, 97, 99 to confirm "Oil" vs lighter cleaning solvents. ([Hiden Analytical])

### Missing Checks

* **[Silicone/PDMS]:** Check **m/z 73, 147, 207**. Silicone is a common contaminant that mimics m/z 43/57 if resolution is poor or fragmentation complex. ([ASTM E2105])
* **[Background Subtraction]:** High water/air background can scatter ions. Normalize against m/z 28 (N₂) or background baseline.

### Approval Status

**⚠️ CONDITIONAL**

**Summary:** The physical model for general hydrocarbon detection is valid (Alkyl series), but the logic distinguishing Turbopump vs. Forepump oil is speculative and lacks specificity without higher mass fragments (m/z > 100).

---

## 🤖 Grok Review

**Status:** ⏳ Awaiting Response

| Parameter | Code Value | Correct? | Should Be | Source |
|-----------|-----------|----------|-----------|--------|
| Δ14 amu masses | [41,43,55,57,69,71,83,85] | ✅ | - | NIST/Hiden Analytical |
| m57/m43 range | 0.7-0.9 (valid: 0.5-1.2) | ⚠️ | 0.5-1.4 | Hiden Analytical |
| m71/m43 threshold | >0.4 | ⚠️ | >0.3? | Unvalidated |
| Fomblin check | m69>m43 && m41<thr | ✅ | - | Hiden Analytical |

### Critical Issues

- **Issue 1:** m57/m43 range lacks authoritative source, Hiden shows ~1.36 → Adjust to 0.5-1.4 + Hiden Analytical
- **Issue 2:** m71/m43 threshold unvalidated for pump differentiation → Empirical testing needed + No source
- **Issue 3:** Heavier masses (99,113) missing for specificity → Add optional checks + NIH PMC9677422
- **Issue 4:** Δ14 pattern correct but add 39 for completeness → Include m39 + SRS App Note

### Recommended Changes

1. **Weight confidence by peak intensity**: Linear count insufficient, weight main (43,57) higher ([SRS])
2. **Add atmospheric correction**: Normalize for air dilution ([SRS])

### Missing Checks

- **PDMS interference**: Check m73,147 to rule out silicone ([Hiden])
- **Oil type variation**: Account for PAO/mineral/ester differences ([NIH PMC9677422])

### Approval Status

**⚠️ CONDITIONAL**

**Summary (1 sentence):** The model captures standard hydrocarbon patterns correctly but requires ratio adjustments and additional validations for accuracy in RGA oil detection.

---

## ✅ Merged Validation (Claude)

**Status:** ✅ Complete (2026-01-11)
**Approval:** ⚠️ **CONDITIONAL** (Unanimous from Gemini + Grok)

---

### Consensus (Both AIs Agree)

| Issue | Severity | Finding | Recommendation |
|-------|----------|---------|----------------|
| **m71/m43 Turbopump marker** | HIGH | Not scientifically validated - PAO/mineral oil spectra overlap | ❌ Remove pump type differentiation OR relabel as "heavier hydrocarbons" |
| **Heavier masses missing** | HIGH | Cannot distinguish oil from solvents (heptane/hexane) | ✅ Add m/z 95, 97, 99 (optional check) |
| **PDMS interference** | MEDIUM | Silicone oil has overlapping fragments at m43/57 | ✅ Add m/z 73, 147, 207 anti-pattern |
| **Δ14 amu pattern** | ✅ | Physically correct for CₙH₂ₙ₊₁⁺ alkyl series | Keep as-is |
| **Fomblin exclusion** | ✅ | Logic correct (m69>m43 && m41<thr) | Keep as-is |

---

### Divergent Findings (Differences)

| Parameter | Gemini | Grok | Resolution |
|-----------|--------|------|------------|
| **m57/m43 range** | 0.6-1.0 (typical) | 0.5-1.4 (Hiden shows 1.36) | ✅ Use **0.5-1.4** (wider = more robust) |
| **Fomblin check strength** | Should be `m69 > m43*2` | OK as-is | ⚠️ Keep current (avoid over-tuning) |
| **Additional masses** | Add m95, 97, 99 | Add m39, 99, 113 | ✅ Add **m39** to list, **m99** optional |
| **Confidence weighting** | Not mentioned | Weight by intensity, not count | ✅ Valid improvement (future enhancement) |

---

### Critical Issues (Implementation Impact)

**❌ MUST FIX (before deployment):**
1. **Pump Type Mislabeling**
   - **Problem:** "Turbopumpe" vs "Vorpumpe" is **not scientifically reliable** via m71/m43
   - **Fix:** Rename to "Heavy Hydrocarbons (C>5)" or remove pump type entirely
   - **Source:** Both AIs (Gemini: "speculative", Grok: "unvalidated")

**⚠️ SHOULD FIX (reduces false positives):**
2. **Solvent Confusion**
   - **Problem:** Cleaning solvents (heptane C₇, hexane C₆) match Δ14 pattern
   - **Fix:** Add optional check for m/z 99, 113 (true oils have these)
   - **Source:** Gemini (Hiden Analytical), Grok (NIH PMC9677422)

3. **m57/m43 Range Too Narrow**
   - **Problem:** Current 0.7-0.9 expectation, but code allows 0.5-1.2 (correct!)
   - **Fix:** Adjust comment/documentation to reflect 0.5-1.4 (Hiden data)
   - **Source:** Grok (Hiden Analytical)

**📋 NICE TO HAVE (future improvements):**
4. **PDMS Check** → Add m/z 73, 147, 207 (silicone oil)
5. **Weighted Confidence** → Weight m43/m57 higher than m85 (main peaks)
6. **Atmospheric Correction** → Normalize if air dilution detected
7. **Add m/z 39** → Complete Δ14 pattern (C₃H₃⁺)

---

### Final Recommendation

**Approval Status:** ⚠️ **CONDITIONAL APPROVAL**

**Before use in production:**
1. ❌ **Change "oilType" labels:**
   - Remove: `'Turbopumpe'` / `'Vorpumpe'`
   - Replace: `'Heavy Hydrocarbons'` / `'Oil-like Pattern'`
   - **Reason:** Scientifically unreliable distinction

2. ✅ **Adjust m57/m43 expected range:**
   - Update documentation: `0.5-1.4` (not `0.7-0.9`)
   - Code already allows `0.5-1.2` → extend to `1.4`

3. ✅ **Add m/z 39 to pattern:**
   - Update: `const oilMasses = [39, 41, 43, 55, 57, 69, 71, 83, 85]`

**Optional enhancements:**
- Add heavier mass check (m99, m113) for oil vs solvent
- Add PDMS anti-pattern (m73, m147, m207)

---

### Physics Validated ✅

**Core detection logic:** SOUND
- Δ14 amu hydrocarbon pattern: Correct
- CₙH₂ₙ₊₁⁺ alkyl series: Valid at 70 eV EI
- Confidence scaling: Mathematically OK

**Main issue:** Over-specific labeling (pump type) not supported by physics

---

**Cross-Validation Complete:** Gemini ⚠️ + Grok ⚠️ = **Unanimous Conditional Approval**
