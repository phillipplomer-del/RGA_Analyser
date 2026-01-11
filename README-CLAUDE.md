# Claude Code - Quick Reference for RGA Analyser

> **For AI Assistant:** This file provides quick reference for working with the RGA Analyser codebase.

---

## 🎯 Before You Start

**ALWAYS read these first:**

1. **[.claude/project-context.md](.claude/project-context.md)** - Full project context
2. **[RGA_Knowledge/SCIENTIFIC_REFERENCES.md](RGA_Knowledge/SCIENTIFIC_REFERENCES.md)** ⭐ PRIMARY REFERENCE for scientific validation
3. **[DOCUMENTATION/BACKLOG/FEATURE_BACKLOG.md](DOCUMENTATION/BACKLOG/FEATURE_BACKLOG.md)** - Current priorities

---

## 📋 Quick Checklists

### ✅ Validating Scientific Data

```
□ Check SCIENTIFIC_REFERENCES.md first
□ Compare against NIST/CIAAW values
□ Verify tolerance (±5-10% for RGA is OK)
□ Document source in code comments
□ Update KnowledgePanel if user-facing
```

### ✅ Adding New Gas

```
□ Check NIST WebBook for cracking pattern
□ Verify RSF (Relative Sensitivity Factor)
□ Add to src/lib/knowledge/gasLibrary.ts
□ Update src/lib/knowledge/massReference.ts
□ Add to SCIENTIFIC_REFERENCES.md if novel
```

### ✅ Modifying Isotope Ratios

```
□ Read SCIENTIFIC_REFERENCES.md validation section
□ Confirm NIST/CIAAW match
□ Update src/lib/knowledge/isotopePatterns.ts
□ Update KnowledgePanel/index.tsx (ReferencesTab)
□ Document source + precision
```

### ✅ Working with Detectors (Modular Architecture)

```
□ Detectors are in src/modules/rga/lib/detectors/
□ Organized by category: leaks/, contamination/, outgassing/, etc.
□ Each detector is ~100-150 lines in own file
□ Import from: import { detectAirLeak } from '@/modules/rga/lib/detectors'
□ Add new detector: Create file in appropriate category
□ Export in src/modules/rga/lib/detectors/index.ts
□ See README.md in detectors/ directory for details
□ Migration: 21/21 detectors complete (2026-01-11)
```

### ✅ Adding New Scientific Feature (MANDATORY WORKFLOW)

**IMPORTANT:** ALL scientific features MUST follow this workflow to prevent information loss.

**⚠️ CRITICAL:** After EVERY file creation, verify the file exists before updating documentation!

```
□ Phase 1: Konzept
  □ Create entry in FEATURE_BACKLOG.md (Status: ⬜, 🔬 Validiert?: leer)
  □ Copy TEMPLATES/FEATURE_PLAN_TEMPLATE.md → NextFeatures/FEATURE_[ID]_[NAME]_PLAN.md
  □ Copy TEMPLATES/FEATURE_CHECKLIST.md → NextFeatures/FEATURE_[ID]_CHECKLIST.md
  ⚠️ VERIFY: Run `ls NextFeatures/FEATURE_[ID]*` to confirm files exist!

□ Phase 2: Wissenschaftliche Validierung
  □ Research scientific sources (≥2 peer-reviewed OR ≥3 standards/manufacturer)
  □ Add section to SCIENTIFIC_REFERENCES.md with sources + limitations
  □ Update planning file with validation results
  □ Update FEATURE_BACKLOG.md: 🔬 Validiert? = ✅ (fully validated) or ⚠️ (partially validated)
  ⚠️ VERIFY: Grep SCIENTIFIC_REFERENCES.md for the new section!

□ Phase 3: Implementation
  □ Update FEATURE_BACKLOG.md (⬜ → 🔄)
  □ Implement code
  □ Add ValidationMetadata to src/lib/diagnosis/validation.ts
  ⚠️ VERIFY: Run build/type check to confirm code compiles!

□ Phase 4: Finalization
  □ Update FEATURE_BACKLOG.md (🔄 → ✅)
  □ Add changelog entry to FEATURE_BACKLOG.md
  □ Move planning file to DOCUMENTATION/ARCHIVED/
  □ Verify ValidationBadge visible in KnowledgePanel
  □ Run `npm run check:features` to verify completeness

□ Phase 5: Verification (MANDATORY - DO NOT SKIP!)
  □ Run through FEATURE_CHECKLIST.md
  □ All links in FEATURE_BACKLOG.md working (click to verify!)
  □ Feature discoverable in all locations
  □ CLI check passes without errors
  □ Run: `ls -la` on all files referenced in FEATURE_BACKLOG.md
```

**🚨 Anti-Ghost-File Rule:** NEVER update FEATURE_BACKLOG.md to claim a file was created
   without first verifying the file exists on disk. Use `ls`, `cat`, or Read tool to confirm!

**File Locations Quick Reference:**
- Planning (Single Feature): `NextFeatures/FEATURE_[ID]_[NAME]_PLAN.md`
- Planning (Multi-Feature System): `NextFeatures/[SYSTEM_NAME]_SPEC.md` (z.B. LeaksearchPlanner_MasterV7_COMPLETE.md)
- Checklist: `NextFeatures/FEATURE_[ID]_CHECKLIST.md`
- Sources: `RGA_Knowledge/SCIENTIFIC_REFERENCES.md`
- Validation: `src/lib/diagnosis/validation.ts`
- Backlog: `DOCUMENTATION/BACKLOG/FEATURE_BACKLOG.md`
- Templates: `DOCUMENTATION/BACKLOG/TEMPLATES/`
- Archived: `DOCUMENTATION/ARCHIVED/` (abgeschlossene Features)

### 🔬 Validation Status System

**FEATURE_BACKLOG.md** has a "🔬 Validiert?" column with 4 levels:

| Status | Bedeutung | Verwendung |
|--------|-----------|------------|
| ✅ | **Vollständig validiert** | Wissenschaftliche Features mit dokumentierten Quellen in SCIENTIFIC_REFERENCES.md |
| ⚠️ | **Teilvalidiert** | Grundquellen vorhanden, weitere Recherche empfohlen |
| - | **Nicht wissenschaftlich** | UI/UX/Infrastruktur-Features ohne wissenschaftliche Komponente |
| (leer) | **Ausstehend** | Noch nicht validiert (geplante Features) |

**CLI Validation Check:**
```bash
npm run check:features
```
Prüft automatisch:
- Wissenschaftliche Features (✅) haben Einträge in SCIENTIFIC_REFERENCES.md
- Abgeschlossene wissenschaftliche Features haben Validierungs-Status
- Infrastructure-Features sind mit "-" markiert
- Planning-Files existieren
- ValidationMetadata in validation.ts vorhanden (für Detektoren)

**Regel:** Features mit Status ✅ und 🔬 Validiert? = ✅ sind **Implementation-Ready**.

---

### 🤖 Multi-AI Cross-Validation Workflow (RETROACTIVE VALIDATION)

**Purpose:** Validate **already-implemented** detectors retroactively to ensure scientific correctness before Feature 5.5 deployment.

**Status:** ACTIVE (2026-01-11)

**Priority Order:**
1. ✅ detectAirLeak - VALIDATED (Unanimous Approval)
2. ⚠️ detectOilBackstreaming - VALIDATED (Conditional, fixes needed)
3. ⏳ verifyIsotopeRatios - IN PROGRESS
4. ⬜ detectESDArtefacts
5. ⬜ detectHeliumLeak
6. ⬜ detectFomblinContamination
7. ⬜ detectPolymerOutgassing
8. ⬜ detectPlasticizerContamination

**Workflow (6 Steps per Detector):**

```
□ Step 1: Generate Reverse-Spec (Claude)
  □ Read detector from src/modules/rga/lib/detectors/ (use Read tool)
  □ Create REVERSE_SPEC_[FUNCTION_NAME].md in NextFeatures/
  □ Extract: Logic, Ratios, Thresholds, Confidence Calculation
  □ Template: DOCUMENTATION/BACKLOG/TEMPLATES/REVERSE_SPEC_TEMPLATE.md
  □ Token-efficient format (tables, bullet points, <1200 tokens)
  ⚠️ VERIFY: ls NextFeatures/REVERSE_SPEC_*.md

□ Step 2: User submits to Gemini + Grok
  □ User copies "VALIDATION PROMPT" section from Reverse-Spec
  □ User pastes into Gemini → waits for response
  □ User pastes Gemini response into "🤖 Gemini Review" section
  □ User pastes same prompt into Grok → waits for response
  □ User pastes Grok response into "🤖 Grok Review" section
  □ User notifies Claude: "beide reviews sind drin"

□ Step 3: Claude merges reviews
  □ Compare Gemini vs Grok findings
  □ Identify consensus (both agree)
  □ Identify conflicts (both disagree)
  □ Resolution: Prefer stricter validation, cite sources
  □ Approval: ✅ (unanimous), ⚠️ (conditional), ❌ (rejected)
  □ Write to "✅ Merged Validation" section in same file
  ⚠️ VERIFY: Grep for "Cross-Validation Complete"

□ Step 4: Create Physics Documentation (Claude)
  □ Create DOCUMENTATION/PHYSICS/[FUNCTION_NAME].md
  □ Bilingual (DE + EN in same file)
  □ Sections: Summary, Physical Model, Assumptions/Limitations, Validation, References
  □ User-facing (for RGA practitioners, not physicists)
  ⚠️ VERIFY: ls DOCUMENTATION/PHYSICS/*.md

□ Step 5: Update Changelogs (Claude)
  □ FEATURE_BACKLOG.md → Add changelog entry with date, function, status
  □ SCIENTIFIC_REFERENCES.md → Add changelog entry with sources
  ⚠️ VERIFY: Grep changelogs for function name

□ Step 6: Collect Fixes (defer implementation)
  □ Track all "MUST FIX" items from conditional approvals
  □ Implement AFTER Feature 5.5 (Progressive Disclosure)
  □ Batch all fixes together
```

**Approval Criteria:**
- **✅ APPROVED:** Both AIs validate physics + math, no critical issues
- **⚠️ CONDITIONAL:** Valid physics but needs fixes (e.g., labeling, ranges)
- **❌ REJECTED:** Fundamental physics errors (rare)

**File Naming Convention:**
```
NextFeatures/REVERSE_SPEC_[functionName].md  # Single file with all sections
DOCUMENTATION/PHYSICS/[functionName].md      # User-facing bilingual doc
```

**Token Budget:**
- Reverse-Spec: ~1200 tokens (650 spec + 400 prompt + 150 overhead)
- Physics Doc: ~2000 tokens (bilingual)
- Total per detector: ~3200 tokens

**Current Status (2026-01-11):**
- detectAirLeak: ✅ Complete (unanimous, gap identified: Feature 1.8.4)
- detectOilBackstreaming: ⚠️ Complete (conditional, 3 fixes needed)
- verifyIsotopeRatios: Reverse-Spec ready, awaiting user submission

**Next Action:** User submits verifyIsotopeRatios to Gemini/Grok

**Related Files:**
- Template: [REVERSE_SPEC_TEMPLATE.md](DOCUMENTATION/BACKLOG/TEMPLATES/REVERSE_SPEC_TEMPLATE.md)
- Backlog: [FEATURE_BACKLOG.md](DOCUMENTATION/BACKLOG/FEATURE_BACKLOG.md) (Changelog section)
- References: [SCIENTIFIC_REFERENCES.md](RGA_Knowledge/SCIENTIFIC_REFERENCES.md) (Changelog section)

---

## ⚡ Quick Commands (User Shortcuts)

When the user says these keywords, perform the corresponding action:

### "prime" or "start"
**Session Initialization** - Load full project context:
1. Read README-CLAUDE.md (this file)
2. Read FEATURE_BACKLOG.md (first 100 lines for structure)
3. Read SCIENTIFIC_REFERENCES.md (skim structure)
4. Summarize project status in 3-5 bullet points
5. Ask user what they want to work on next

### "ready"
**Implementation Readiness Report** - Action-oriented feature overview:

**IMPORTANT:** This command automatically runs "prime" first to load project context, then generates the readiness report.

1. Read entire FEATURE_BACKLOG.md
2. Parse all features from markdown tables
3. Check file existence (Spec files, Plan files in NextFeatures/)
4. Generate compact table:

**Table columns:**
- Feature (ID + Name)
- ✅ Implementiert (in App = Status ✅)
- **If NOT implemented:**
  - 🎯 Ready? (Implementation-Ready = alle Voraussetzungen erfüllt)
  - 📄 Spec (Spec-Datei vorhanden?)
  - 🔬 Validiert (nur bei wissenschaftlichen Features)
  - 📋 Plan (Plan-Datei in NextFeatures/ vorhanden?)

**Implementation-Ready criteria:**
- Scientific features: Spec ✅ + 🔬 Validiert ✅ + Plan ✅
- Non-scientific features: Spec ✅ + 🔬 Validiert - + Plan ✅

**Focus:** Show what's missing to make features implementation-ready.

*Note: Detailed instructions are in `.claude/skills/` but work via these keyword triggers.*

---

## 🔍 Where to Find Things

| Need | Location |
|------|----------|
| **Scientific sources** | RGA_Knowledge/SCIENTIFIC_REFERENCES.md |
| **Gas properties** | src/lib/knowledge/gasLibrary.ts |
| **Isotope ratios** | src/lib/knowledge/isotopePatterns.ts |
| **Diagnostic algorithms** | src/modules/rga/lib/detectors/ (21 modular detectors) |
| **Detector index** | src/modules/rga/lib/detectors/index.ts |
| **Feature planning** | DOCUMENTATION/BACKLOG/FEATURE_BACKLOG.md |
| **Feature templates** | DOCUMENTATION/BACKLOG/TEMPLATES/ |
| **UI components** | src/components/ |

---

## 🚀 Current Priorities (2026-01-10)

1. ✅ Knowledge Management System implemented (DONE)
2. ✅ Scientific validation documented (DONE)
3. ✅ Validation tracking system in FEATURE_BACKLOG.md (DONE)
4. ⏭️ Next: Ready for parallel feature implementation with agents

**Implementation-Ready Features:**
- All features with Status ✅ and 🔬 Validiert? ✅ can be implemented
- Use `npm run check:features` to verify completeness
- See [FEATURE_BACKLOG.md](DOCUMENTATION/BACKLOG/FEATURE_BACKLOG.md) for details

---

## 🤝 Working with Users

- Users are **scientists/engineers** working with vacuum systems
- Precision matters: Always cite sources (NIST, CIAAW, etc.)
- Bilingual: German + English in all user-facing text
- When unsure: Check SCIENTIFIC_REFERENCES.md → Web search → Ask user

---

**Last Updated:** 2026-01-10 (Validation tracking system added)
