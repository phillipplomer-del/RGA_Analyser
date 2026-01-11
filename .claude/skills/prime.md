---
name: prime
description: Load RGA Analyser project context, workflows, and essential information for the session
---

# RGA Analyser Session Primer

You are working on the **RGA Analyser** project - a web-based tool for analyzing Residual Gas Analyzer (RGA) mass spectra in vacuum systems.

## Essential Context to Load

**ALWAYS read these files at the start:**

1. **README-CLAUDE.md** - Complete quick reference with workflows, checklists, and validation system
2. **DOCUMENTATION/BACKLOG/FEATURE_BACKLOG.md** - Feature overview (read first 100 lines for structure)
3. **DOCUMENTATION/SCIENTIFIC/REFERENCES.md** - Scientific validation sources (103+ sources)

## Key Information Summary

### Project Structure
```
├── src/
│   ├── modules/rga/lib/detectors/      # ⭐ NEW: Modular detector architecture (21 detectors)
│   │   ├── leaks/                      # Air, Helium, Virtual, CoolingWater (4)
│   │   ├── contamination/              # Oils, Polymers, Solvents, etc. (8)
│   │   ├── outgassing/                 # Water, Hydrogen (2)
│   │   ├── artifacts/                  # ESD (1)
│   │   ├── gases/                      # Ammonia, Methane, Sulfur, ProcessGas (4)
│   │   ├── isotopes/                   # IsotopeRatios (1)
│   │   ├── quality/                    # CleanUHV (1)
│   │   ├── shared/                     # types, helpers, constants
│   │   └── index.ts                    # Public API, runAllDetectors()
│   ├── lib/
│   │   ├── knowledge/
│   │   │   ├── gasLibrary.ts           # Gas properties & RSF
│   │   │   ├── massReference.ts        # Mass-to-gas mappings
│   │   │   └── isotopePatterns.ts      # Isotope ratios (NIST/CIAAW)
│   │   └── diagnosis/
│   │       └── validation.ts           # ValidationMetadata for detectors
│   └── components/                     # React UI components
├── DOCUMENTATION/
│   ├── SCIENTIFIC/                     # Master Scientific Knowledge
│   │   ├── REFERENCES.md               # 103+ scientific sources ⭐
│   │   ├── DETECTORS.md                # Master validation table (22 detectors)
│   │   ├── VALIDATION_MASTERPLAN.md    # 3-phase validation strategy
│   │   └── README.md                   # Scientific knowledge index
│   ├── PHYSICS/                        # Category-Organized Physics Documentation
│   │   ├── Leaks/                      # Air, Helium, Virtual, CoolingWater
│   │   ├── Contamination/              # Oils, Polymers, Fluorinated, Solvents, Aromatics
│   │   ├── Outgassing/                 # Water, Hydrogen
│   │   ├── Artifacts/                  # ESD artifacts
│   │   ├── Gases/                      # Ammonia, Methane, Sulfur, ProcessGas, N2/CO
│   │   ├── Isotopes/                   # IsotopeRatios
│   │   ├── Quality/                    # CleanUHV
│   │   └── README.md                   # Physics overview
│   ├── BACKLOG/
│   │   ├── FEATURE_BACKLOG.md          # 46 features, validation tracking
│   │   └── TEMPLATES/                  # Feature templates
│   └── ARCHIVED/                       # Completed feature docs
├── RGA_Knowledge/                      # Data Files Only
│   ├── README.md                       # Index (points to DOCUMENTATION/SCIENTIFIC/)
│   ├── isotopeData.md                  # Raw isotope data (CIAAW)
│   ├── RSF_Values.md                   # Sensitivity factors
│   └── gasDatabase.md                  # Gas properties
├── NextFeatures/                       # Active feature planning files
├── scripts/
│   └── check-feature-completeness.ts   # Validation CLI tool
└── README-CLAUDE.md                    # Your primary reference
```

### Validation Status System

FEATURE_BACKLOG.md has a **🔬 Validiert?** column with 4 levels:

| Status | Meaning | Usage |
|--------|---------|-------|
| ✅ | Fully validated | Scientific features with sources in DOCUMENTATION/SCIENTIFIC/REFERENCES.md |
| ⚠️ | Partially validated | Basic sources present, more research recommended |
| - | Not scientific | UI/UX/Infrastructure features (no scientific validation needed) |
| (empty) | Pending | Not yet validated (planned features) |

**Implementation-Ready Rule:** Features with Status ✅ AND 🔬 Validiert? ✅ are ready to implement.

### CLI Tools

```bash
# Check feature completeness and validation status
npm run check:features

# Validates:
# - Scientific features have entries in DOCUMENTATION/SCIENTIFIC/REFERENCES.md
# - Completed features have validation status
# - Infrastructure features marked with "-"
# - Planning files exist
# - ValidationMetadata present (for detectors)
```

### Scientific Feature Workflow

**Phase 1: Konzept**
- Create FEATURE_BACKLOG.md entry (Status: ⬜, 🔬: empty)
- Copy templates to NextFeatures/FEATURE_[ID]_[NAME]_PLAN.md

**Phase 2: Wissenschaftliche Validierung**
- Research ≥2 peer-reviewed OR ≥3 standards/manufacturer sources
- Add to DOCUMENTATION/SCIENTIFIC/REFERENCES.md
- Update 🔬 Validiert? = ✅ or ⚠️

**Phase 3: Implementation**
- Status: ⬜ → 🔄
- Implement code
- Add ValidationMetadata (if detector)

**Phase 4: Finalization**
- Status: 🔄 → ✅
- Move planning file to ARCHIVED/
- Run `npm run check:features`

**Phase 5: Verification**
- CLI check passes without errors

### Important Conventions

- **Feature IDs:**
  - 0.x = Data quality fixes
  - 1.5.x = Scientific analysis tools
  - 1.6.x = Application tools
  - 1.8.x = Scientific validation extensions
  - 1.9.x = Offline analysis features
  - 3.x = Scientific quality features
  - 4-6.x = Infrastructure/UX/Performance

- **File Naming:**
  - Single features: `FEATURE_[ID]_[NAME]_PLAN.md`
  - Multi-feature systems: `[SYSTEM_NAME]_SPEC.md`
  - Archived: Move to `DOCUMENTATION/ARCHIVED/` when complete

- **Scientific Standards:**
  - Always cite sources (NIST, CIAAW, peer-reviewed papers)
  - Tolerance: ±5-10% for RGA is acceptable
  - Bilingual: German + English in user-facing text

## Current State (2026-01-11)

✅ **Completed:**
- Knowledge Management System
- Scientific validation (103+ sources documented)
- Validation tracking system in FEATURE_BACKLOG.md
- **Modular detector architecture migration (22/22 detectors)** ⭐ NEW!
- **Knowledge base reorganization** ⭐ NEW!
  - DOCUMENTATION/SCIENTIFIC/ (master references)
  - DOCUMENTATION/PHYSICS/ (organized by 7 detector categories)

⏭️ **Ready for:** Parallel feature implementation with agents

### Recent Changes (2026-01-11)
- ✅ All 22 detectors migrated from monolithic file to modular structure
- ✅ New structure: `src/modules/rga/lib/detectors/` with 7 categories
- ✅ Each detector now ~100-150 lines in own file
- ✅ Knowledge base reorganized to mirror detector architecture
- ✅ SCIENTIFIC_REFERENCES.md → DOCUMENTATION/SCIENTIFIC/REFERENCES.md (103+ sources)
- ✅ Physics docs organized by category: Leaks, Contamination, Outgassing, Artifacts, Gases, Isotopes, Quality

## Your Task

After loading this context:

1. **Read the three essential files** listed above
2. **Summarize** what you've learned in 3-5 bullet points
3. **Ask the user** what they want to work on next

This ensures you have full context and can work efficiently from the start of the session.

## 🚨 Anti-Ghost-File Protocol

**CRITICAL:** When creating or claiming to create files:
1. ALWAYS use Write tool to actually create the file
2. ALWAYS verify with `ls` or Read that the file exists
3. NEVER update FEATURE_BACKLOG.md to claim a file exists without verification
4. If updating documentation about file creation, include the verification step in your response

**Example verification:**
```
✅ Created: NextFeatures/FEATURE_1.8.1_PLAN.md
   Verified: ls NextFeatures/FEATURE_1.8* shows file exists
```
