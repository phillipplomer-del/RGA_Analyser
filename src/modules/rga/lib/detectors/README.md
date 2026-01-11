# RGA Detectors - Modular Architecture

**Status:** 🚧 Migration in Progress (1/21 detectors migrated)

**Old Location:** `src/lib/diagnosis/detectors.ts` (2,228 lines, all 21 detectors)

**New Location:** `src/modules/rga/lib/detectors/` (modular structure)

---

## Directory Structure

```
detectors/
├── leaks/                          # Leak Detection (4)
│   ├── detectAirLeak.ts           ✅ Migrated
│   ├── detectHeliumLeak.ts        ⬜ TODO
│   ├── detectVirtualLeak.ts       ⬜ TODO
│   └── detectCoolingWaterLeak.ts  ⬜ TODO
│
├── contamination/                  # Contamination (9)
│   ├── oils/
│   │   └── detectOilBackstreaming.ts  ⬜ TODO
│   ├── polymers/
│   │   ├── detectPolymerOutgassing.ts         ⬜ TODO
│   │   ├── detectPlasticizerContamination.ts  ⬜ TODO
│   │   └── detectSiliconeContamination.ts     ⬜ TODO
│   ├── fluorinated/
│   │   └── detectFomblinContamination.ts  ⬜ TODO
│   ├── solvents/
│   │   ├── detectSolventResidue.ts        ⬜ TODO
│   │   └── detectChlorinatedSolvent.ts    ⬜ TODO
│   └── aromatics/
│       └── detectAromatic.ts  ⬜ TODO
│
├── outgassing/                     # Outgassing (2)
│   ├── detectWaterOutgassing.ts   ⬜ TODO
│   └── detectHydrogenDominant.ts  ⬜ TODO
│
├── artifacts/                      # Artifacts (1)
│   └── detectESDartifacts.ts      ⬜ TODO
│
├── gases/                          # Specific Gases (4)
│   ├── detectAmmonia.ts           ⬜ TODO
│   ├── detectMethane.ts           ⬜ TODO
│   ├── detectSulfur.ts            ⬜ TODO
│   └── detectProcessGasResidue.ts ⬜ TODO
│
├── isotopes/                       # Isotope Analysis (1)
│   └── verifyIsotopeRatios.ts     ⬜ TODO
│
├── quality/                        # System State (1)
│   └── detectCleanUHV.ts          ⬜ TODO
│
├── shared/                         # Shared utilities
│   ├── types.ts                   ✅ Created (re-exports)
│   ├── helpers.ts                 ✅ Created (getPeak, createEvidence)
│   └── constants.ts               ⬜ TODO (if needed)
│
├── index.ts                        ✅ Public API
└── README.md                       ✅ This file
```

---

## Migration Progress

| Category | Migrated | Total | Progress |
|----------|----------|-------|----------|
| Leaks | 1 | 4 | 25% |
| Contamination | 0 | 9 | 0% |
| Outgassing | 0 | 2 | 0% |
| Artifacts | 0 | 1 | 0% |
| Gases | 0 | 4 | 0% |
| Isotopes | 0 | 1 | 0% |
| Quality | 0 | 1 | 0% |
| **TOTAL** | **1** | **21** | **5%** |

---

## Usage

### Importing Detectors

```typescript
// Import individual detector
import { detectAirLeak } from '@/modules/rga/lib/detectors'

// Import multiple detectors
import {
  detectAirLeak,
  detectHeliumLeak  // TODO: Not yet migrated
} from '@/modules/rga/lib/detectors'

// Run all detectors
import { runAllDetectors } from '@/modules/rga/lib/detectors'
const results = runAllDetectors(input)
```

### During Migration

Old code still works:
```typescript
// Old import (still works during migration)
import { detectAirLeak } from '@/lib/diagnosis/detectors'
```

New code uses modular structure:
```typescript
// New import (after migration)
import { detectAirLeak } from '@/modules/rga/lib/detectors'
```

---

## Migration Steps (Per Detector)

1. **Copy detector function** from `detectors.ts`
2. **Place in appropriate category folder**
3. **Update imports** to use shared helpers/types
4. **Add documentation header** with:
   - Description
   - Cross-validation status
   - References
5. **Export from `index.ts`**
6. **Test** (optional but recommended)

**Estimated Time:** 10-15 minutes per detector

**Total Migration Time:** 3-5 hours for all 21 detectors

---

## Benefits After Migration

✅ **Better Organization**
- Each detector in own file (~100-200 lines)
- Clear categorization

✅ **Parallel Development**
- No merge conflicts when working on different detectors
- Team can work simultaneously

✅ **Easier Testing**
- Test individual detectors in isolation
- Focused test files

✅ **Better Navigation**
- IDE can jump to specific detector quickly
- Clear file structure

✅ **Scalability**
- Easy to add new detectors
- No fear of 3000+ line files

---

## Next Steps

1. ✅ Migrate `detectAirLeak` (pilot) - DONE
2. ⏭️ Migrate remaining 7 cross-validated detectors
3. ⏭️ Migrate 13 pending detectors
4. ⏭️ Delete old `src/lib/diagnosis/detectors.ts`
5. ⏭️ Update all imports across codebase

---

**Branch:** `refactor/modular-architecture`

**Last Updated:** 2026-01-11
