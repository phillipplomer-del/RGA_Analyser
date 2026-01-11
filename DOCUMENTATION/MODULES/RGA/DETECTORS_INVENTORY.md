# RGA Detektoren - Inventory & Status

**Purpose:** Complete overview of all RGA diagnostic detectors

**Last Updated:** 2026-01-11

**Total Detektoren:** 21

---

## Status Overview

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Cross-Validated & Fixed | 8 | 38% |
| ⚠️ Pending Validation | 13 | 62% |

---

## Detektoren Kategorien

### 1. Leaks (4 Detektoren)

| # | Detektor | Lines | Status | Validation | Notes |
|---|----------|-------|--------|------------|-------|
| 1 | detectAirLeak | 43-130 | ✅ | Unanimous | No fixes needed |
| 2 | detectHeliumLeak | 845-927 | ✅ | Conditional | Fixes applied |
| 3 | detectVirtualLeak | TBD | ⚠️ | Pending | Not validated |
| 4 | detectCoolingWaterLeak | TBD | ⚠️ | Pending | Not validated |

### 2. Contamination (9 Detektoren)

#### 2.1 Oils
| # | Detektor | Lines | Status | Validation | Notes |
|---|----------|-------|--------|------------|-------|
| 5 | detectOilBackstreaming | 135-214 | ✅ | Conditional | Fixes applied |

#### 2.2 Polymers & Plastics
| # | Detektor | Lines | Status | Validation | Notes |
|---|----------|-------|--------|------------|-------|
| 6 | detectPolymerOutgassing | TBD | ✅ | Conditional | Fixes applied |
| 7 | detectPlasticizerContamination | TBD | ✅ | Conditional | Fixes applied |
| 8 | detectSiliconeContamination | TBD | ⚠️ | Pending | Not validated |

#### 2.3 Fluorinated Compounds
| # | Detektor | Lines | Status | Validation | Notes |
|---|----------|-------|--------|------------|-------|
| 9 | detectFomblinContamination | 219-286 | ✅ | Conditional | Fixes applied |

#### 2.4 Solvents
| # | Detektor | Lines | Status | Validation | Notes |
|---|----------|-------|--------|------------|-------|
| 10 | detectSolventResidue | TBD | ⚠️ | Pending | Not validated |
| 11 | detectChlorinatedSolvent | TBD | ⚠️ | Pending | Not validated |

#### 2.5 Aromatics
| # | Detektor | Lines | Status | Validation | Notes |
|---|----------|-------|--------|------------|-------|
| 12 | detectAromatic | TBD | ⚠️ | Pending | Not validated |

### 3. Outgassing (2 Detektoren)

| # | Detektor | Lines | Status | Validation | Notes |
|---|----------|-------|--------|------------|-------|
| 13 | detectWaterOutgassing | TBD | ⚠️ | Pending | Not validated |
| 14 | detectHydrogenDominant | TBD | ⚠️ | Pending | Not validated |

### 4. Artifacts (1 Detektor)

| # | Detektor | Lines | Status | Validation | Notes |
|---|----------|-------|--------|------------|-------|
| 15 | detectESDartifacts | 644-830 | ✅ | Conditional | Fixes applied |

### 5. Specific Gases (4 Detektoren)

| # | Detektor | Lines | Status | Validation | Notes |
|---|----------|-------|--------|------------|-------|
| 16 | detectAmmonia | TBD | ⚠️ | Pending | Not validated |
| 17 | detectMethane | TBD | ⚠️ | Pending | Not validated |
| 18 | detectSulfur | TBD | ⚠️ | Pending | Not validated |
| 19 | detectProcessGasResidue | TBD | ⚠️ | Pending | Not validated |

### 6. Isotopes (1 Detektor)

| # | Detektor | Lines | Status | Validation | Notes |
|---|----------|-------|--------|------------|-------|
| 20 | verifyIsotopeRatios | 1950-2149 | ✅ | Conditional | Fixes applied |

### 7. Quality/State (1 Detektor)

| # | Detektor | Lines | Status | Validation | Notes |
|---|----------|-------|--------|------------|-------|
| 21 | detectCleanUHV | TBD | ⚠️ | Pending | Not validated |

---

## Cross-Validation Status

**Full Details:** See [CROSS_VALIDATION_STATUS.md](../../../BACKLOG/CROSS_VALIDATION_STATUS.md)

### ✅ Validated & Fixed (8/8 = 100%)

All 8 cross-validated detectors have had their fixes implemented:

1. ✅ detectAirLeak - Unanimous approval, no fixes needed
2. ✅ detectOilBackstreaming - 3 fixes applied
3. ✅ detectFomblinContamination - 1 CRITICAL fix applied (m/z 50)
4. ✅ detectESDartifacts - 2 CRITICAL fixes applied
5. ✅ detectHeliumLeak - 2 CRITICAL fixes applied (RSF correction)
6. ✅ detectPolymerOutgassing - 1 CRITICAL fix applied
7. ✅ detectPlasticizerContamination - 2 fixes applied (m/z 167)
8. ✅ verifyIsotopeRatios - 1 CRITICAL fix applied (O₂ ratio)

### ⚠️ Pending Validation (13)

These detectors need cross-validation workflow:

- detectVirtualLeak
- detectCoolingWaterLeak
- detectSiliconeContamination
- detectSolventResidue
- detectChlorinatedSolvent
- detectAromatic
- detectWaterOutgassing
- detectHydrogenDominant
- detectAmmonia
- detectMethane
- detectSulfur
- detectProcessGasResidue
- detectCleanUHV

---

## Current Location

**File:** [src/lib/diagnosis/detectors.ts](../../../src/lib/diagnosis/detectors.ts)
**Size:** 2,228 lines (all 21 detectors in one file)

---

## Migration Plan

**Target Structure:** `src/modules/rga/lib/detectors/`

```
detectors/
├── leaks/
│   ├── detectAirLeak.ts
│   ├── detectHeliumLeak.ts
│   ├── detectVirtualLeak.ts
│   └── detectCoolingWaterLeak.ts
├── contamination/
│   ├── oils/detectOilBackstreaming.ts
│   ├── polymers/
│   │   ├── detectPolymerOutgassing.ts
│   │   ├── detectPlasticizerContamination.ts
│   │   └── detectSiliconeContamination.ts
│   ├── fluorinated/detectFomblinContamination.ts
│   ├── solvents/
│   │   ├── detectSolventResidue.ts
│   │   └── detectChlorinatedSolvent.ts
│   └── aromatics/detectAromatic.ts
├── outgassing/
│   ├── detectWaterOutgassing.ts
│   └── detectHydrogenDominant.ts
├── artifacts/
│   └── detectESDartifacts.ts
├── gases/
│   ├── detectAmmonia.ts
│   ├── detectMethane.ts
│   ├── detectSulfur.ts
│   └── detectProcessGasResidue.ts
├── isotopes/
│   └── verifyIsotopeRatios.ts
├── quality/
│   └── detectCleanUHV.ts
├── shared/
│   ├── types.ts
│   ├── helpers.ts
│   └── constants.ts
└── index.ts (public API)
```

**Estimated Effort:** 1 day (7-9 hours)
- Setup: 1h
- 8 validated detectors: 2-3h
- 13 pending detectors: 2-3h
- Public API + testing: 1-2h

---

## Next Actions

1. ✅ **Cross-Validation Complete** (8/8 detectors, all fixes applied)
2. ⏭️ **Split detectors.ts** (21 files, modular structure)
3. ⏭️ **Validate remaining 13** (cross-validation workflow)

---

*Last Updated: 2026-01-11*
