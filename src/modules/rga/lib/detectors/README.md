# RGA Detectors - Modular Architecture

**Status:** ✅ Migration Complete (21/21 detectors migrated)

**Old Location:** `src/lib/diagnosis/detectors.ts` (2,228 lines, all 21 detectors) - TO BE DEPRECATED

**New Location:** `src/modules/rga/lib/detectors/` (modular structure)

---

## Directory Structure

```
detectors/
├── leaks/                          # Leak Detection (4)
│   ├── detectAirLeak.ts           ✅ Migrated
│   ├── detectHeliumLeak.ts        ✅ Migrated
│   ├── detectVirtualLeak.ts       ✅ Migrated
│   └── detectCoolingWaterLeak.ts  ✅ Migrated
│
├── contamination/                  # Contamination (8)
│   ├── oils/
│   │   └── detectOilBackstreaming.ts  ✅ Migrated
│   ├── polymers/
│   │   ├── detectPolymerOutgassing.ts         ✅ Migrated
│   │   ├── detectPlasticizerContamination.ts  ✅ Migrated
│   │   └── detectSiliconeContamination.ts     ✅ Migrated
│   ├── fluorinated/
│   │   └── detectFomblinContamination.ts  ✅ Migrated
│   ├── solvents/
│   │   ├── detectSolventResidue.ts        ✅ Migrated
│   │   └── detectChlorinatedSolvent.ts    ✅ Migrated
│   └── aromatics/
│       └── detectAromatic.ts  ✅ Migrated
│
├── outgassing/                     # Outgassing (2)
│   ├── detectWaterOutgassing.ts   ✅ Migrated
│   └── detectHydrogenDominant.ts  ✅ Migrated
│
├── artifacts/                      # Artifacts (1)
│   └── detectESDartifacts.ts      ✅ Migrated
│
├── gases/                          # Specific Gases (4)
│   ├── detectAmmonia.ts           ✅ Migrated
│   ├── detectMethane.ts           ✅ Migrated
│   ├── detectSulfur.ts            ✅ Migrated
│   └── detectProcessGasResidue.ts ✅ Migrated
│
├── isotopes/                       # Isotope Analysis (1)
│   └── verifyIsotopeRatios.ts     ✅ Migrated
│
├── quality/                        # System State (1)
│   └── detectCleanUHV.ts          ✅ Migrated
│
├── shared/                         # Shared utilities
│   ├── types.ts                   ✅ Created (re-exports)
│   ├── helpers.ts                 ✅ Created (getPeak, createEvidence)
│   └── constants.ts               ✅ Created (ESD_THRESHOLDS)
│
├── index.ts                        ✅ Public API
└── README.md                       ✅ This file
```

---

## Migration Progress

| Category | Migrated | Total | Progress |
|----------|----------|-------|----------|
| Leaks | 4 | 4 | ✅ 100% |
| Contamination | 8 | 8 | ✅ 100% |
| Outgassing | 2 | 2 | ✅ 100% |
| Artifacts | 1 | 1 | ✅ 100% |
| Gases | 4 | 4 | ✅ 100% |
| Isotopes | 1 | 1 | ✅ 100% |
| Quality | 1 | 1 | ✅ 100% |
| **TOTAL** | **21** | **21** | **✅ 100%** |

---

## Usage

### Importing Detectors

```typescript
// Import individual detector
import { detectAirLeak } from '@/modules/rga/lib/detectors'

// Import multiple detectors
import {
  detectAirLeak,
  detectHeliumLeak,
  detectOilBackstreaming
} from '@/modules/rga/lib/detectors'

// Run all detectors
import { runAllDetectors } from '@/modules/rga/lib/detectors'
const results = runAllDetectors(input)
```

### Transitioning from Old Code

Old code still works (during transition period):
```typescript
// Old import (deprecated but still functional)
import { detectAirLeak } from '@/lib/diagnosis/detectors'
```

New code uses modular structure:
```typescript
// New import (recommended)
import { detectAirLeak } from '@/modules/rga/lib/detectors'
```

---

## Migration Summary

### What Was Accomplished

✅ All 21 detectors migrated from monolithic 2,228-line file to individual ~100-150 line files
✅ Clear categorization into 7 categories (Leaks, Contamination, Outgassing, Artifacts, Gases, Isotopes, Quality)
✅ Shared utilities extracted (helpers.ts, types.ts, constants.ts)
✅ Scientific documentation headers added with cross-validation status
✅ TypeScript compilation verified with no errors
✅ 8 cross-validated detectors have fixes applied, 13 pending validation

### Files Created

- 21 detector files (one per detector)
- 3 shared utility files
- 1 public API file (index.ts)
- **Total: 25 files** replacing 1 monolithic file

---

## Benefits Realized

✅ **Better Organization**
- Each detector in own file (~100-150 lines)
- Clear categorization by type
- Easy to locate and understand specific detectors

✅ **Parallel Development**
- No merge conflicts when working on different detectors
- Team can work simultaneously on multiple detectors
- Clean git history per detector

✅ **Easier Testing**
- Test individual detectors in isolation
- Focused test files possible
- Reduced test complexity

✅ **Better Navigation**
- IDE can jump to specific detector instantly
- Clear file structure visible in file tree
- Reduced cognitive load

✅ **Scalability**
- Easy to add new detectors (just create new file in appropriate category)
- No fear of file size growing out of control
- Maintainable long-term

---

## Next Steps

1. ✅ All 21 detectors migrated to modular structure
2. ✅ Cross-validation status documented in each file
3. ⏭️ **Next:** Update imports across codebase to use new structure (`@/modules/rga/lib/detectors`)
4. ⏭️ **Next:** Deprecate old `src/lib/diagnosis/detectors.ts` (mark as deprecated, add warning comments)
5. ⏭️ **Future:** Add unit tests for individual detectors
6. ⏭️ **Future:** Remove old file completely after transition period

---

**Branch:** `refactor/modular-architecture`

**Migration Completed:** 2026-01-11

**Migration Time:** ~2.5 hours (automated with Claude Code)

**Files Changed:** 25 files created, 1 file to be deprecated
