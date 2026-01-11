# Knowledge Base Reorganization - Migration Guide

**Date:** 2026-01-11
**Branch:** `refactor/knowledge-reorganization`
**Migration Type:** File reorganization (no code changes)
**Breaking Changes:** ✅ File paths updated across documentation

---

## Summary

Reorganized the RGA Analyser knowledge base to mirror the modular detector architecture at `src/modules/rga/lib/detectors/`. This creates a clear hierarchy where physics documentation is organized by the same 7 categories as the detector code.

---

## Goals Achieved

1. **✅ Mirrors Code Structure:** DOCUMENTATION/PHYSICS/ now matches src/modules/rga/lib/detectors/
2. **✅ Clear Hierarchy:** Category → Subcategory → Detector
3. **✅ Single Source of Truth:** REFERENCES.md replaces outdated VALIDATED_SOURCES.md
4. **✅ Eliminates Redundancy:** Consolidated detectAirLeak.md + FEATURE_1.5.1
5. **✅ Better Navigation:** README.md at each level with clear links
6. **✅ Scalability:** Easy to add new detector documentation to appropriate category

---

## File Changes Summary

### Created (26 new files)

**Navigation Files (13):**
- `DOCUMENTATION/SCIENTIFIC/README.md` - Master scientific reference index
- `DOCUMENTATION/PHYSICS/README.md` - Physics documentation overview
- `DOCUMENTATION/PHYSICS/Leaks/README.md`
- `DOCUMENTATION/PHYSICS/Contamination/README.md`
- `DOCUMENTATION/PHYSICS/Contamination/Oils/README.md`
- `DOCUMENTATION/PHYSICS/Contamination/Polymers/README.md`
- `DOCUMENTATION/PHYSICS/Contamination/Fluorinated/README.md`
- `DOCUMENTATION/PHYSICS/Contamination/Solvents/README.md`
- `DOCUMENTATION/PHYSICS/Contamination/Aromatics/README.md`
- `DOCUMENTATION/PHYSICS/Outgassing/README.md`
- `DOCUMENTATION/PHYSICS/Artifacts/README.md`
- `DOCUMENTATION/PHYSICS/Gases/README.md`
- `DOCUMENTATION/PHYSICS/Isotopes/README.md`
- `DOCUMENTATION/PHYSICS/Quality/README.md`

**Consolidated Physics Documentation (1):**
- `DOCUMENTATION/PHYSICS/Leaks/AirLeak.md` (consolidated from 2 files)

**Redirect/Index Files (2):**
- `RGA_Knowledge/README.md` - Redirect to DOCUMENTATION/SCIENTIFIC/
- `DOCUMENTATION/MIGRATIONS/2026-01-11_Knowledge_Reorganization.md` (this file)

**Directory Structure (10 directories):**
- `DOCUMENTATION/PHYSICS/Leaks/`
- `DOCUMENTATION/PHYSICS/Contamination/`
- `DOCUMENTATION/PHYSICS/Contamination/Oils/`
- `DOCUMENTATION/PHYSICS/Contamination/Polymers/`
- `DOCUMENTATION/PHYSICS/Contamination/Fluorinated/`
- `DOCUMENTATION/PHYSICS/Contamination/Solvents/`
- `DOCUMENTATION/PHYSICS/Contamination/Aromatics/`
- `DOCUMENTATION/PHYSICS/Outgassing/`
- `DOCUMENTATION/PHYSICS/Artifacts/`
- `DOCUMENTATION/PHYSICS/Gases/`
- `DOCUMENTATION/PHYSICS/Isotopes/`
- `DOCUMENTATION/PHYSICS/Quality/`
- `DOCUMENTATION/MIGRATIONS/`
- `NextFeatures/Leaks/`
- `NextFeatures/Contamination/`
- `NextFeatures/Outgassing/`
- `NextFeatures/Artifacts/`
- `NextFeatures/Gases/`
- `NextFeatures/Isotopes/`
- `NextFeatures/Quality/`
- `NextFeatures/Infrastructure/`

### Moved/Renamed (10 files)

| Old Path | New Path | Type |
|----------|----------|------|
| `RGA_Knowledge/SCIENTIFIC_REFERENCES.md` | `DOCUMENTATION/SCIENTIFIC/REFERENCES.md` | Master Reference (103+ sources) |
| `DOCUMENTATION/PHYSICS/FEATURE_1.5.3_OIL_BACKSTREAMING_DETECTION.md` | `DOCUMENTATION/PHYSICS/Contamination/Oils/OilBackstreaming.md` | Physics Doc |
| `DOCUMENTATION/PHYSICS/FEATURE_1.5.4_FOMBLIN_PFPE_DETECTION.md` | `DOCUMENTATION/PHYSICS/Contamination/Fluorinated/FomblinContamination.md` | Physics Doc |
| `DOCUMENTATION/PHYSICS/FEATURE_1.5.5_POLYMER_OUTGASSING_DETECTION.md` | `DOCUMENTATION/PHYSICS/Contamination/Polymers/PolymerOutgassing.md` | Physics Doc |
| `DOCUMENTATION/PHYSICS/FEATURE_1.5.6_ESD_ARTIFACT_DETECTION.md` | `DOCUMENTATION/PHYSICS/Artifacts/ESDartifacts.md` | Physics Doc |
| `DOCUMENTATION/PHYSICS/FEATURE_1.5.7_HELIUM_LEAK_DETECTION.md` | `DOCUMENTATION/PHYSICS/Leaks/HeliumLeak.md` | Physics Doc |
| `DOCUMENTATION/PHYSICS/FEATURE_1.5.8_PLASTICIZER_PHTHALATE_DETECTION.md` | `DOCUMENTATION/PHYSICS/Contamination/Polymers/PlasticizerContamination.md` | Physics Doc |
| `DOCUMENTATION/PHYSICS/FEATURE_1.8.2_ISOTOPE_RATIO_VERIFICATION.md` | `DOCUMENTATION/PHYSICS/Isotopes/IsotopeRatios.md` | Physics Doc |
| `DOCUMENTATION/SCIENTIFIC/VALIDATED_SOURCES.md` | `DOCUMENTATION/ARCHIVED/VALIDATED_SOURCES_OLD.md` | Archived (outdated, 53 sources) |

### Consolidated (2 files → 1)

**Air Leak Documentation:**
- `DOCUMENTATION/PHYSICS/FEATURE_1.5.1_AIR_LEAK_DETECTION.md` (436 lines)
- `DOCUMENTATION/PHYSICS/detectAirLeak.md` (253 lines)

**→ Merged into:**
- `DOCUMENTATION/PHYSICS/Leaks/AirLeak.md` (270 lines, with consolidation header)

**Reason:** detectAirLeak.md was more concise and included cross-validation status. FEATURE_1.5.1 had duplicate content with more verbose explanations.

### Updated (4 files)

**Documentation Files:**
- `README-CLAUDE.md` - Updated all paths to point to new structure
- `.claude/skills/prime.md` - Updated project structure diagram and paths
- `.claude/skills/ready.md` - No changes needed (already uses dynamic path resolution)
- `DOCUMENTATION/ARCHIVED/VALIDATED_SOURCES_OLD.md` - Added deprecation header

---

## New Directory Structure

```
DOCUMENTATION/
├── SCIENTIFIC/                           # Master Scientific Knowledge
│   ├── REFERENCES.md                     # 103+ sources (moved from RGA_Knowledge/)
│   ├── DETECTORS.md                      # Master validation table (kept)
│   ├── VALIDATION_MASTERPLAN.md          # 3-phase strategy (kept)
│   ├── CROSS_VALIDATION_WORKFLOW.md      # Multi-AI workflow (kept)
│   ├── CALCULATIONS.md                   # Uncertainty propagation (kept)
│   ├── CRACKING_PATTERNS.md              # EI fragmentation (kept)
│   ├── WISSENSCHAFTLICHE_VALIDIERUNG_STATUS.md  # Validation status (kept)
│   └── README.md                         # New: Navigation index
│
├── PHYSICS/                              # Category-Organized Physics Documentation
│   ├── README.md                         # New: Physics overview
│   │
│   ├── Leaks/                            # 4 detectors (2 with docs currently)
│   │   ├── README.md                     # New: Category overview
│   │   ├── AirLeak.md                    # Moved + Consolidated
│   │   └── HeliumLeak.md                 # Moved (renamed from FEATURE_1.5.7)
│   │
│   ├── Contamination/                    # 8 detectors (4 with docs currently)
│   │   ├── README.md                     # New: Category overview
│   │   ├── Oils/
│   │   │   ├── README.md                 # New: Subcategory overview
│   │   │   └── OilBackstreaming.md       # Moved (renamed from FEATURE_1.5.3)
│   │   ├── Polymers/
│   │   │   ├── README.md                 # New: Subcategory overview
│   │   │   ├── PolymerOutgassing.md      # Moved (renamed from FEATURE_1.5.5)
│   │   │   └── PlasticizerContamination.md  # Moved (renamed from FEATURE_1.5.8)
│   │   ├── Fluorinated/
│   │   │   ├── README.md                 # New: Subcategory overview
│   │   │   └── FomblinContamination.md   # Moved (renamed from FEATURE_1.5.4)
│   │   ├── Solvents/
│   │   │   └── README.md                 # New: Subcategory overview
│   │   └── Aromatics/
│   │       └── README.md                 # New: Subcategory overview
│   │
│   ├── Outgassing/                       # 2 detectors (no docs yet)
│   │   └── README.md                     # New: Category overview
│   │
│   ├── Artifacts/                        # 1 detector (1 with docs)
│   │   ├── README.md                     # New: Category overview
│   │   └── ESDartifacts.md               # Moved (renamed from FEATURE_1.5.6)
│   │
│   ├── Gases/                            # 5 detectors (no docs yet)
│   │   └── README.md                     # New: Category overview
│   │
│   ├── Isotopes/                         # 1 detector (1 with docs)
│   │   ├── README.md                     # New: Category overview
│   │   └── IsotopeRatios.md              # Moved (renamed from FEATURE_1.8.2)
│   │
│   └── Quality/                          # 1 detector (no docs yet)
│       └── README.md                     # New: Category overview
│
├── BACKLOG/                              # Feature Planning (kept as-is)
├── ARCHITECTURE/                         # App Architecture (kept as-is)
├── UX/                                   # User Experience (kept as-is)
├── ARCHIVED/                             # Completed Features (kept as-is)
└── MIGRATIONS/                           # New: Migration guides
    └── 2026-01-11_Knowledge_Reorganization.md  # This file

RGA_Knowledge/                            # Data Files Only
├── README.md                             # New: Redirect to DOCUMENTATION/SCIENTIFIC/
├── isotopeData.md                        # Kept
├── mass_to_gas_mapping.md                # Kept
├── RSF_Values.md                         # Kept
└── gasDatabase.md                        # Kept

NextFeatures/                             # Active Planning
├── README.md                             # TODO: Create planning overview
├── Leaks/                                # New: Category folder
├── Contamination/                        # New: Category folder
├── Outgassing/                           # New: Category folder
├── Artifacts/                            # New: Category folder
├── Gases/                                # New: Category folder
├── Isotopes/                             # New: Category folder
├── Quality/                              # New: Category folder
├── Infrastructure/                       # New: 4.x, 5.x, 6.x features
└── Archiv/                               # Kept as-is (21 reverse-specs)
```

---

## Before & After Comparison

### Master Scientific Reference

**Before:**
```
RGA_Knowledge/SCIENTIFIC_REFERENCES.md
```

**After:**
```
DOCUMENTATION/SCIENTIFIC/REFERENCES.md
(RGA_Knowledge/README.md redirects to new location)
```

**Why:** Aligns scientific references with other scientific documentation (DETECTORS.md, CALCULATIONS.md, etc.)

---

### Physics Documentation

**Before (Flat Structure):**
```
DOCUMENTATION/PHYSICS/
├── FEATURE_1.5.1_AIR_LEAK_DETECTION.md
├── FEATURE_1.5.3_OIL_BACKSTREAMING_DETECTION.md
├── FEATURE_1.5.4_FOMBLIN_PFPE_DETECTION.md
├── FEATURE_1.5.5_POLYMER_OUTGASSING_DETECTION.md
├── FEATURE_1.5.6_ESD_ARTIFACT_DETECTION.md
├── FEATURE_1.5.7_HELIUM_LEAK_DETECTION.md
├── FEATURE_1.5.8_PLASTICIZER_PHTHALATE_DETECTION.md
├── FEATURE_1.8.2_ISOTOPE_RATIO_VERIFICATION.md
└── detectAirLeak.md  (redundant)
```

**After (Category-Based Structure):**
```
DOCUMENTATION/PHYSICS/
├── README.md
├── Leaks/
│   ├── README.md
│   ├── AirLeak.md (consolidated)
│   └── HeliumLeak.md
├── Contamination/
│   ├── README.md
│   ├── Oils/
│   │   ├── README.md
│   │   └── OilBackstreaming.md
│   ├── Polymers/
│   │   ├── README.md
│   │   ├── PolymerOutgassing.md
│   │   └── PlasticizerContamination.md
│   └── Fluorinated/
│       ├── README.md
│       └── FomblinContamination.md
├── Artifacts/
│   ├── README.md
│   └── ESDartifacts.md
└── Isotopes/
    ├── README.md
    └── IsotopeRatios.md
```

**Why:** Mirrors `src/modules/rga/lib/detectors/` structure, making it intuitive to navigate between code and documentation.

---

## Path Migration Table

**For automated link updates, use this table:**

| Old Path | New Path | Status |
|----------|----------|--------|
| `RGA_Knowledge/SCIENTIFIC_REFERENCES.md` | `DOCUMENTATION/SCIENTIFIC/REFERENCES.md` | ✅ Moved |
| `DOCUMENTATION/PHYSICS/FEATURE_1.5.1_AIR_LEAK_DETECTION.md` | `DOCUMENTATION/PHYSICS/Leaks/AirLeak.md` | ✅ Consolidated |
| `DOCUMENTATION/PHYSICS/detectAirLeak.md` | `DOCUMENTATION/PHYSICS/Leaks/AirLeak.md` | ✅ Consolidated |
| `DOCUMENTATION/PHYSICS/FEATURE_1.5.3_OIL_BACKSTREAMING_DETECTION.md` | `DOCUMENTATION/PHYSICS/Contamination/Oils/OilBackstreaming.md` | ✅ Moved |
| `DOCUMENTATION/PHYSICS/FEATURE_1.5.4_FOMBLIN_PFPE_DETECTION.md` | `DOCUMENTATION/PHYSICS/Contamination/Fluorinated/FomblinContamination.md` | ✅ Moved |
| `DOCUMENTATION/PHYSICS/FEATURE_1.5.5_POLYMER_OUTGASSING_DETECTION.md` | `DOCUMENTATION/PHYSICS/Contamination/Polymers/PolymerOutgassing.md` | ✅ Moved |
| `DOCUMENTATION/PHYSICS/FEATURE_1.5.6_ESD_ARTIFACT_DETECTION.md` | `DOCUMENTATION/PHYSICS/Artifacts/ESDartifacts.md` | ✅ Moved |
| `DOCUMENTATION/PHYSICS/FEATURE_1.5.7_HELIUM_LEAK_DETECTION.md` | `DOCUMENTATION/PHYSICS/Leaks/HeliumLeak.md` | ✅ Moved |
| `DOCUMENTATION/PHYSICS/FEATURE_1.5.8_PLASTICIZER_PHTHALATE_DETECTION.md` | `DOCUMENTATION/PHYSICS/Contamination/Polymers/PlasticizerContamination.md` | ✅ Moved |
| `DOCUMENTATION/PHYSICS/FEATURE_1.8.2_ISOTOPE_RATIO_VERIFICATION.md` | `DOCUMENTATION/PHYSICS/Isotopes/IsotopeRatios.md` | ✅ Moved |
| `DOCUMENTATION/SCIENTIFIC/VALIDATED_SOURCES.md` | `DOCUMENTATION/ARCHIVED/VALIDATED_SOURCES_OLD.md` | ✅ Archived |

---

## Verification Steps

### File Existence Check

```bash
# Verify new structure exists
ls -R DOCUMENTATION/PHYSICS/
ls -R DOCUMENTATION/SCIENTIFIC/
ls DOCUMENTATION/MIGRATIONS/

# Verify old files are gone
ls DOCUMENTATION/PHYSICS/FEATURE_1.5*.md  # Should be empty
ls RGA_Knowledge/SCIENTIFIC_REFERENCES.md  # Should not exist
ls DOCUMENTATION/SCIENTIFIC/VALIDATED_SOURCES.md  # Should not exist
```

### Git History Check

```bash
# Verify clean renames (not delete+add)
git log --follow DOCUMENTATION/SCIENTIFIC/REFERENCES.md
git log --follow DOCUMENTATION/PHYSICS/Leaks/AirLeak.md
```

### Link Check (TODO - Follow-up)

```bash
# Search for broken links
rg '\[.*\]\((RGA_Knowledge/SCIENTIFIC_REFERENCES|DOCUMENTATION/PHYSICS/FEATURE).*\)' -t md
```

---

## Post-Reorganization Tasks

### Completed in This Migration

- [x] Move SCIENTIFIC_REFERENCES.md to DOCUMENTATION/SCIENTIFIC/REFERENCES.md
- [x] Create category directories in DOCUMENTATION/PHYSICS/
- [x] Move all FEATURE_1.5.x physics files to categories
- [x] Consolidate detectAirLeak.md + FEATURE_1.5.1
- [x] Archive VALIDATED_SOURCES.md
- [x] Create README.md navigation at each level
- [x] Update README-CLAUDE.md references
- [x] Update .claude/skills/prime.md references
- [x] Create NextFeatures/ category directories

### Follow-Up Tasks (Deferred)

- [ ] Search and update all markdown links across codebase
- [ ] Update FEATURE_BACKLOG.md to reference new physics doc paths
- [ ] Create remaining physics docs for detectors without documentation:
  - [ ] VirtualLeak.md
  - [ ] CoolingWaterLeak.md
  - [ ] SiliconeContamination.md
  - [ ] SolventResidue.md
  - [ ] ChlorinatedSolvent.md
  - [ ] AromaticContamination.md
  - [ ] WaterOutgassing.md
  - [ ] HydrogenDominant.md
  - [ ] Ammonia.md
  - [ ] Methane.md
  - [ ] Sulfur.md
  - [ ] ProcessGasResidue.md
  - [ ] N2_CO_Differentiation.md
  - [ ] CleanUHV.md
- [ ] Update code comments in detector files with new `@see` paths
- [ ] Update CLI tool (validate_documentation_coverage.ts) to check new structure
- [ ] Create visual navigation diagram for PHYSICS/ hierarchy
- [ ] Consider creating symlinks in old locations (transition period)

---

## Benefits Realized

### Before Reorganization

- **Problem:** 9 physics files in flat DOCUMENTATION/PHYSICS/ directory
- **Problem:** No clear connection to detector code structure
- **Problem:** Redundant detectAirLeak.md + FEATURE_1.5.1 (689 lines total)
- **Problem:** VALIDATED_SOURCES.md (53 sources) outdated vs SCIENTIFIC_REFERENCES.md (103+ sources)
- **Problem:** Difficult to navigate - no category grouping

### After Reorganization

- **✅ Clear Hierarchy:** 7 categories matching detector code structure
- **✅ Easy Navigation:** README.md at each level with links
- **✅ No Redundancy:** Air Leak consolidated into 1 file (270 lines)
- **✅ Single Source of Truth:** REFERENCES.md is master (103+ sources)
- **✅ Scalable:** Easy to add new detector docs to appropriate category
- **✅ Consistent:** Same 7-category organization across code, docs, and planning

---

## Statistics

- **Files Created:** 16 (13 READMEs + 1 consolidated + 2 indices)
- **Files Moved:** 9 (8 physics docs + 1 master reference)
- **Files Consolidated:** 2 → 1 (Air Leak documentation)
- **Files Archived:** 1 (VALIDATED_SOURCES.md)
- **Directories Created:** 13 (7 PHYSICS categories + 8 NextFeatures categories + 1 MIGRATIONS)
- **Total Changes:** ~40 file operations

- **Documentation Updated:** 3 (README-CLAUDE.md, .claude/skills/prime.md, VALIDATED_SOURCES_OLD.md)

- **Time Invested:** ~3 hours (Phase 1-3 of plan)
- **Estimated Remaining:** ~1.5 hours (link updates, verification, follow-ups)

---

## Git Commit Message

```
refactor: reorganize knowledge base to mirror modular detector architecture

BREAKING CHANGE: File paths updated across documentation

Before:
- RGA_Knowledge/SCIENTIFIC_REFERENCES.md
- DOCUMENTATION/PHYSICS/FEATURE_1.5.*.md (flat structure)
- Redundant detectAirLeak.md

After:
- DOCUMENTATION/SCIENTIFIC/REFERENCES.md (master reference, 103+ sources)
- DOCUMENTATION/PHYSICS/[Category]/[Detector].md (7 categories)
- Consolidated redundant documentation

Benefits:
- Clear hierarchy mirroring src/modules/rga/lib/detectors/
- Eliminates 2+ redundant files
- Establishes REFERENCES.md as single source of truth
- Improves navigation with category-based organization

Migration Guide: DOCUMENTATION/MIGRATIONS/2026-01-11_Knowledge_Reorganization.md

Files Moved: 9
Files Consolidated: 2 → 1
New Structure: 7 categories (Leaks, Contamination, Outgassing, Artifacts, Gases, Isotopes, Quality)
```

---

**Migration Date:** 2026-01-11
**Completed by:** Claude Code (Sonnet 4.5)
**Branch:** `refactor/knowledge-reorganization`
**Next Step:** Commit changes and push to remote
