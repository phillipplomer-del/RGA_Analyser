---
name: ready
description: Show implementation readiness for all features (automatically loads project context first)
---

# RGA Analyser Implementation Readiness Report

You need to provide an action-oriented overview showing what's missing to implement each feature.

## Instructions

**IMPORTANT:** This command automatically runs "prime" first to load project context.

### Step 1: Execute "prime" command
1. Read README-CLAUDE.md (full)
2. Read FEATURE_BACKLOG.md (first 100 lines for structure)
3. Read SCIENTIFIC_REFERENCES.md (skim structure)
4. Summarize project status in 3-5 bullet points
5. (Skip asking user what to work on - continue directly to Step 2)

### Step 2: Generate readiness report
1. **Read FEATURE_BACKLOG.md** (entire file - read again if needed)
2. **Parse all features** from markdown tables (extract: ID, name, status, validationStatus, specFile)
3. **Check file existence:**
   - Spec files: NextFeatures/, DOCUMENTATION/ARCHIVED/, or paths in FEATURE_BACKLOG.md
   - Plan files: NextFeatures/FEATURE_[ID]_*_PLAN.md
4. **Group features by category** (use the section headers from FEATURE_BACKLOG.md):
   - 📊 Wissenschaftliche Features & Detektoren (0.x, 1.5.x, 1.8.x, 1.9.x, 3.x)
   - 🛠️ Anwendungs-Features & Tools (1.1, 1.2, 1.6.x, 1.7.x, 1.10.x, 1.11.x, 2.x)
   - 🏗️ App-Infrastruktur & Qualität (4.x, 5.x, 6.x)
5. **Generate separate table for each category** with the following structure:

## Report Format

```
# 🎯 RGA Analyser - Implementation Readiness Report

## Summary
- Total Features: X
- ✅ Implemented (in App): X
- 🎯 Implementation-Ready: X
- ⚠️ Needs Work: X

## 📊 Wissenschaftliche Features & Detektoren

Features: 0.x, 1.5.x, 1.8.x, 1.9.x, 3.x

| Feature | ✅ Impl | 🎯 Ready | 📄 Spec | 🔬 Valid | 📋 Plan | Notes |
|---------|---------|----------|---------|----------|---------|-------|
| 0.1 RSF-Korrektionen | ✅ | - | ✅ | ✅ | ✅ | Implemented ✓ |
| 1.5.8 Pfeiffer-Kalibrierung | ❌ | ❌ | ✅ | ❌ | ❌ | Missing: Validation, Plan |
| 1.8.4 Argon Ratio Update | ❌ | ✅ | ✅ | ✅ | ✅ | Ready to implement! |

## 🛠️ Anwendungs-Features & Tools

Features: 1.6.x, 1.7.x, 2.x

| Feature | ✅ Impl | 🎯 Ready | 📄 Spec | 🔬 Valid | 📋 Plan | Notes |
|---------|---------|----------|---------|----------|---------|-------|
| 1.6.1 Core Engine | ❌ | ✅ | ✅ | - | ✅ | Ready to implement! |
| 1.7.2 Advanced Import | ❌ | ❌ | ✅ | - | ❌ | Missing: Plan |

## 🏗️ App-Infrastruktur & Qualität

Features: 4.x, 5.x, 6.x

| Feature | ✅ Impl | 🎯 Ready | 📄 Spec | 🔬 Valid | 📋 Plan | Notes |
|---------|---------|----------|---------|----------|---------|-------|
| 3.1 Error Handling | ❌ | ❌ | ✅ | - | ❌ | Missing: Plan |
| 4.2 Performance Monitor | ⬜ | ❌ | ❌ | - | ❌ | Missing: Spec, Plan |

**Legend:**
- **Impl** = Implemented (Status ✅ in FEATURE_BACKLOG.md)
- **Ready** = Implementation-Ready (all prerequisites met)
- **Spec** = Spec file exists
- **Valid** = Scientific validation (🔬 column: ✅ fully, ⚠️ partial, - not needed, ❌ missing)
- **Plan** = Planning file exists in NextFeatures/

## 🎯 Ready to Implement (Priority)

These features have all prerequisites and can be implemented now:

1. **[ID] Feature Name** - [estimated effort]
2. **[ID] Feature Name** - [estimated effort]
...

Total: X features ready

---

## 🔬 Cross-Validation Status (Detector Migration)

**Purpose:** Retroactive validation of already-implemented detectors before Feature 5.5 deployment

**Migration Progress:** 21/21 detectors migrated to modular architecture (100%) ✅
**Cross-Validation Progress:** 8/21 detectors validated by Gemini + Grok (38%)
**Pending Validation:** 13/21 detectors (62%)

| # | Detector | Reverse-Spec | Gemini | Grok | Merged | Physics Doc | Approval | Critical Fixes |
|---|----------|--------------|--------|------|--------|-------------|----------|----------------|
| 1 | detectAirLeak | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Unanimous | None |
| 2 | detectOilBackstreaming | ✅ | ✅ | ✅ | ✅ | ⬜ | ⚠️ Conditional | 3 fixes needed |
| 3 | verifyIsotopeRatios | ✅ | ✅ | ✅ | ✅ | ⬜ | ⚠️ Conditional | 1 CRITICAL fix |
| 4 | detectESDArtefacts | ✅ | ✅ | ✅ | ✅ | ⬜ | ⚠️ Conditional | 2 CRITICAL fixes |
| 5 | detectHeliumLeak | ✅ | ✅ | ✅ | ✅ | ⬜ | ⚠️ Conditional | 2 CRITICAL fixes |
| 6 | detectFomblinContamination | ✅ | ✅ | ✅ | ✅ | ⬜ | ⚠️ Conditional | 1 CRITICAL fix |
| 7 | detectPolymerOutgassing | ✅ | ✅ | ✅ | ✅ | ⬜ | ⚠️ Conditional | 1 CRITICAL fix |
| 8 | detectPlasticizerContamination | ✅ | ✅ | ✅ | ✅ | ⬜ | ⚠️ Conditional | 2 fixes: 1 HIGH, 1 MEDIUM |

**How to read this table:**
- Read CROSS_VALIDATION_STATUS.md for file paths
- Check NextFeatures/REVERSE_SPEC_*.md for each detector
- Conditional approvals need fixes before Feature 5.5

**Critical Fixes Required (before Feature 5.5):**

From **detectOilBackstreaming** (⚠️ Conditional):
1. ❌ Rename pump type labels ("Turbopumpe"→"Heavy Hydrocarbons")
2. ⚠️ Adjust m57/m43 range (0.5-1.2 → 0.5-1.4)
3. ⚠️ Add m/z 39 to pattern

From **verifyIsotopeRatios** (⚠️ Conditional):
1. ❌ **CRITICAL:** Fix O₂ ratio (487 → 244) - atomic vs molecular error!

From **detectESDartifacts** (⚠️ Conditional):
1. ❌ **CRITICAL:** Fix N⁺/N₂ anomaly threshold (0.15 → 0.25) - false positives on every N₂ scan!
2. ❌ **HIGH:** Fix H⁺/H₂ baseline (0.01 → 0.10, anomaly 0.05 → 0.20)

From **detectHeliumLeak** (⚠️ Conditional):
1. ❌ **CRITICAL:** Add RSF correction - current code underestimates He by factor 2-3×
2. ❌ **HIGH:** Reduce He/H₂ threshold (0.1 → 0.02-0.04) - will miss typical UHV leaks

From **detectFomblinContamination** (⚠️ Conditional):
1. ❌ **CRITICAL:** Add m/z 50 (CF₂⁺) check - 2nd/3rd strongest PFPE peak missing, weakens gas differentiation
2. ⚠️ **MEDIUM:** Raise secondary thresholds (m31/m47: 0.1% → 1%) - reduce noise false positives
3. ⚠️ **LOW:** Remove m/z 20 (HF⁺) from affectedMasses - extrinsic

From **detectPolymerOutgassing** (⚠️ Conditional):
1. ❌ **CRITICAL:** Rename function or add polymer-specific markers - detects generic water, not specifically polymers
   - Problem: Unbaked steel also outgasses >90% H₂O - indistinguishable from polymers
   - Fix: Add CO₂ (m44) + hydrocarbon checks (m41, m43) for polymer vs steel distinction
2. ⚠️ **MEDIUM:** Adjust N₂/O₂ threshold (>5 → >4.5) - more accurate air ratio
3. ⚠️ **MEDIUM:** Add m16 (O⁺) check (~1-2% of m18) - complete water pattern
4. ⚠️ **MEDIUM:** Add m44 (CO₂) check (m44/m18 ~ 0.05-0.1) - distinguish polymer from steel

From **detectPlasticizerContamination** (⚠️ Conditional):
1. ❌ **HIGH:** Add m/z 167 check - 2nd strongest phthalate peak (15-45%) missing
   - Problem: m/z 149 alone cannot distinguish phthalates from other contaminants (adipates use m/z 129)
   - Fix: Add m/z 167 check with relative threshold (m167 > 0.15 × m149) for DEHP confirmation
2. ⚠️ **MEDIUM:** Correct ion formula documentation (C₈H₅O₄⁺ → C₈H₅O₃⁺) - misleading
3. ⚠️ **LOW:** Add m/z 43 to alkyl fragment check - listed but not checked
4. ⚠️ **LOW:** Update affectedMasses to include m/z 167

### 🔬 Validated Detectors (8/21) - ⚠️ Conditional Approvals

Above table shows detectors with Gemini + Grok cross-validation complete.
**Full Details:** See [CROSS_VALIDATION_STATUS.md](DOCUMENTATION/BACKLOG/CROSS_VALIDATION_STATUS.md)

---

### ⏳ Pending Validation (13/21) - Migrated but Not Yet Cross-Validated

**Migration Status:** ✅ All migrated to modular architecture
**Location:** `src/modules/rga/lib/detectors/`
**Next Step:** Submit for Gemini + Grok cross-validation

| # | Detector | Category | Location | Status |
|---|----------|----------|----------|--------|
| 9 | detectVirtualLeak | Leaks | leaks/ | ⬜ Pending validation |
| 10 | detectCoolingWaterLeak | Leaks | leaks/ | ⬜ Pending validation |
| 11 | detectSiliconeContamination | Contamination | contamination/polymers/ | ⬜ Pending validation |
| 12 | detectSolventResidue | Contamination | contamination/solvents/ | ⬜ Pending validation |
| 13 | detectChlorinatedSolvent | Contamination | contamination/solvents/ | ⬜ Pending validation |
| 14 | detectAromatic | Contamination | contamination/aromatics/ | ⬜ Pending validation |
| 15 | detectWaterOutgassing | Outgassing | outgassing/ | ⬜ Pending validation |
| 16 | detectHydrogenDominant | Outgassing | outgassing/ | ⬜ Pending validation |
| 17 | detectAmmonia | Gases | gases/ | ⬜ Pending validation |
| 18 | detectMethane | Gases | gases/ | ⬜ Pending validation |
| 19 | detectSulfur | Gases | gases/ | ⬜ Pending validation |
| 20 | detectProcessGasResidue | Gases | gases/ | ⬜ Pending validation |
| 21 | detectCleanUHV | Quality | quality/ | ⬜ Pending validation |

**Total Migration:** ✅ 21/21 detectors migrated from monolithic file (2,228 lines) to modular structure (~100-150 lines each)

---

## ⚠️ Needs Attention

Features missing prerequisites (grouped by what's missing):

### Missing Validation (Scientific Features)
- [ID] Feature Name - has Spec ✅, needs Validation
- ...

### Missing Plan File
- [ID] Feature Name - has Spec ✅, Validation ✅, needs Plan
- ...

### Missing Both
- [ID] Feature Name - needs Validation + Plan
- ...

## Next Steps
Run `npm run check:features` to verify documentation completeness.
```

## Important Logic

### Determining "Implementation-Ready" (🎯 Ready column)

**For Scientific Features (0.x, 1.5.x, 1.8.x, 1.9.x, 3.x):**
```
✅ Ready = Spec exists ✅ + 🔬 Validated ✅ + Plan exists ✅
❌ Not Ready = Missing any of the above
```

**For Non-Scientific Features (1.6.x, 1.7.x, 2.x, 4.x, 5.x, 6.x):**
```
✅ Ready = Spec exists ✅ + 🔬 Validated - (marked as not scientific) + Plan exists ✅
❌ Not Ready = Missing any of the above
```

**For Implemented Features (Status ✅):**
```
🎯 Ready = "-" (already implemented, not relevant)
```

### File Existence Checks

**Spec File:**
- Check path from FEATURE_BACKLOG.md [spec.md](path/to/spec.md)
- Try: NextFeatures/, DOCUMENTATION/ARCHIVED/, direct paths

**Plan File:**
- Pattern: NextFeatures/FEATURE_[ID]_*_PLAN.md
- Example: FEATURE_1.5.8_PFEIFFER_KALIBRIERUNG_PLAN.md
- Use Glob to find matching files

### 🚨 Consistency Check (CRITICAL!)

**ALWAYS verify that files actually exist before trusting FEATURE_BACKLOG.md claims!**

When a feature claims to have a Plan file (e.g., `[FEATURE_X_PLAN.md](path/to/file)`):
1. Use Glob to check if file exists: `NextFeatures/FEATURE_[ID]*`
2. If file NOT found but FEATURE_BACKLOG.md claims it exists → **FLAG AS GHOST FILE**

**Ghost File Warning Format:**
```
## 🚨 Consistency Warnings

The following files are referenced in FEATURE_BACKLOG.md but DO NOT EXIST:

| Feature | Claimed File | Actual Status |
|---------|--------------|---------------|
| 1.8.1 | FEATURE_1.8.1_DEUTERIUM_PLAN.md | ❌ NOT FOUND |

⚠️ Previous session may have updated documentation without creating files!
   Run verification before trusting "Implementation-Ready" claims.
```

**If ghost files found:** Alert user BEFORE showing the readiness report!

### Notes Column Content

**Examples:**
- "Implemented ✓" - if Status ✅
- "Ready to implement!" - if 🎯 Ready ✅
- "Missing: Validation" - if only validation missing
- "Missing: Plan" - if only plan missing
- "Missing: Validation, Plan" - if both missing
- "Missing: Spec" - if spec file not found
- "" - leave empty for basic planned features (⬜)

## Output Guidelines

- **Focus on action:** What's blocking implementation?
- **Be concise:** One table, clear notes
- **Prioritize:** Show ready-to-implement features first
- **Skip rejected features** (❌ status) unless user asks
- **Group "Needs Attention"** by what's missing for easy planning

### 🚨 NEVER Group Features Together!

**WRONG:**
```
| 1.6.4-1.6.7 | ❌ | ❌ | ✅ | - | ❌ | Missing: Plan |
| 0.1-0.5 | ✅ | - | ✅ | ✅ | - | Implemented ✓ (5 features) |
```

**CORRECT:**
```
| 1.6.4 Expert Mode | ❌ | ❌ | ✅ | - | ❌ | Missing: Plan |
| 1.6.5 B4 Sniffer | ❌ | ❌ | ✅ | - | ❌ | Missing: Plan |
| 1.6.6 RGA-Integration | ❌ | ❌ | ✅ | - | ❌ | Missing: Plan |
| 1.6.7 Shared Geometrie | ❌ | ❌ | ✅ | - | ❌ | Missing: Plan |
```

**Rule:** ALWAYS list each feature individually with its ID AND name.
This makes it clear what each feature does and allows users to prioritize.

## After generating the report

End with: "What would you like to work on next?"

Note: Don't mention 'prime' - it was already executed automatically in Step 1.
