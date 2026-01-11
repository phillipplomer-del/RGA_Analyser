# Feature Backlog - RGA Analyser (MASTER INDEX)

**Purpose:** Central overview and module navigation

**Last Updated:** 2026-01-11

---

## 📊 Module Overview

| Module | Status | Features | Implementation-Ready | Priority |
|--------|--------|----------|---------------------|----------|
| [🔬 RGA](#-rga-module) | 🔥 **ACTIVE** | 25 | 12 | **PRIMARY FOCUS** |
| [🔍 Leak Search](#-leak-search-planner) | ⏸️ On Hold | 7 | 3 | Low (until RGA complete) |
| [📈 Rate-of-Rise](#-rate-of-rise) | ✅ Stable | - | - | Maintenance only |
| [🌡️ Outgassing](#-outgassing-simulator) | ✅ Stable | - | - | Maintenance only |
| [🏗️ Infrastructure](#-app-infrastructure) | ⬜ Planned | 15 | 1 | Low |

---

## 🔬 RGA Module

**📂 Full Backlog:** [MODULES/RGA/FEATURE_BACKLOG_RGA.md](../MODULES/RGA/FEATURE_BACKLOG_RGA.md)

**📋 Detector Inventory:** [MODULES/RGA/DETECTORS_INVENTORY.md](../MODULES/RGA/DETECTORS_INVENTORY.md)

### Status Summary

- ✅ **Implemented:** 13 features
- 🎯 **Implementation-Ready:** 10 features (Spec ✅ + Validation ✅ + Plan ✅)
- ⬜ **Planned:** 2 features
- 🔧 **Detectors:** 21 total (8 validated, 13 pending)

### Quick Wins (Ready to implement now)

1. **3.4** Grenzwert-Signifikanz (2h) - Statistical significance testing
3. **1.9.2** Dynamic LOD (2-3h) - IUPAC standard LOD calculation
4. **1.9.4** Background Subtraction (3-4h) - ASCII file subtraction
5. **1.9.5** Permeation Lag (4-5h) - Elastomer check

### Major Features (Scientific Foundation)

6. **3.1** Unsicherheiten Basis (8-9h) - ISO GUM compliance (17 sources)
7. **3.2** Fehlerfortpflanzung (6-8h) - Gaussian error propagation
8. **3.3** Robuste Regression (8-9h) - Huber + RANSAC outlier resistance
9. **1.9.1** Kinetic Fingerprinting (4-6h) - Desorption kinetics
10. **1.9.3** Statistical Uncertainty (3-4h) - Confidence intervals

### UX Features

11. **1.10.1** CSV Reference Loader (4-6h) - Golden Run shadow plot
12. **1.10.2** Deviation Highlighting (3-4h) - Color-coded differences

### Current Focus

🔧 **Detectors Split** - Breaking `detectors.ts` (2,228 lines) into 21 modular files

**Why now?**
- 8 detectors just had fixes applied (cross-validation)
- 17 new features coming → file would grow to 3500+ lines
- Enables parallel development

**Target:** `src/modules/rga/lib/detectors/` (modular structure)

---

## 🔍 Leak Search Planner

**📂 Spec:** [LeaksearchPlanner_MasterV7_COMPLETE.md](LeaksearchPlanner_MasterV7_COMPLETE.md)

### Status: ⏸️ **ON HOLD** (RGA-Fokus)

- **Demo:** ✅ LeakSearchDemo.tsx exists (~10% functionality)
- **Full MVP:** ⬜ Planned (16-21h for 1.6.1-1.6.3)
- **Spec Quality:** 10/10 (Best in project)

### Features

| # | Feature | Status | Aufwand |
|---|---------|--------|---------|
| 1.6.1 | Core Engine & Types | ⬜ | 6-8h |
| 1.6.2 | UI Wizard (Quick Mode) | ⬜ | 8-10h |
| 1.6.3 | Report & Export | ⬜ | 2-3h |

**Decision:** Wait until RGA module is excellent before expanding Leak Search

---

## 📈 Rate-of-Rise

**Status:** ✅ **STABLE** - No changes planned

### Implemented Features

- ✅ Leckraten-Berechnung
- ✅ Virtual Leak vs. Real Leak Classification
- ✅ Curve Fitting (Exponential, Logarithmic)
- ✅ Temperature Correction (Fixed 2026-01-10)
- ✅ Outgassing-Vergleich Integration
- ✅ Archive & Cloud Storage

**Maintenance only:** Bug fixes if needed, no new features until RGA complete

---

## 🌡️ Outgassing Simulator

**Status:** ✅ **STABLE** - No changes planned

### Implemented Features

- ✅ 17 Materials
- ✅ Multi-Material Berechnung
- ✅ Integration in RoR (Vergleichskarte)
- ✅ Integration in RGA-Diagnose (Kontext-Panel)

**Maintenance only:** Bug fixes if needed, no new features until RGA complete

---

## 🏗️ App-Infrastruktur

**Status:** ⬜ **LOW PRIORITY** (until RGA excellent)

### Key Features

| # | Feature | Status | Aufwand | Priority |
|---|---------|--------|---------|----------|
| 1.1 | Error Handling | ⬜ | 1-2 days | Medium |
| 5.5 | Progressive Disclosure | ⬜ | 12h | Medium |
| 4.1 | Icon-Vereinheitlichung | ⬜ | 2-3h | Low |
| 6.x | Performance (Worker, LTTB) | ⬜ | 12h | Low |

**Decision:** Focus on RGA science first, infrastructure later

---

## 📚 Knowledge Base & Validation

**Reference:** [RGA_Knowledge/SCIENTIFIC_REFERENCES.md](../../RGA_Knowledge/SCIENTIFIC_REFERENCES.md)

### Statistics

- **Total Sources:** 103+ URLs
- **Standards:** ISO GUM, NIST, CIAAW, IUPAC, JCGM, ASTM
- **Coverage:** Isotopes, RGA applications, vacuum kinetics, uncertainty, regression
- **Detectors Validated:** 8/21 (38%)

### Cross-Validation Status

**Full Details:** [CROSS_VALIDATION_STATUS.md](CROSS_VALIDATION_STATUS.md)

- ✅ **Complete:** 8 detectors (all fixes applied)
- ⚠️ **Pending:** 13 detectors

---

## 🎯 Overall Strategy

### Current Phase: **RGA Excellence**

1. ✅ Cross-validate core detectors (8/8 complete)
2. 🔧 **IN PROGRESS:** Split monolithic code → modular architecture
3. ⏭️ Implement 12 ready features (Quick Wins → Statistical → Advanced)
4. ⏭️ Cross-validate remaining 13 detectors
5. ⏭️ Scientific foundation (ISO GUM compliance)

### Future Phases

- **Phase 2:** Leak Search Planner full implementation
- **Phase 3:** Time series analysis (Priorität 2.x)
- **Phase 4:** Infrastructure & UX polish

---

## 📊 Progress Metrics

| Metric | Value |
|--------|-------|
| **Total Features Planned** | 46+ |
| **Implemented** | 11 |
| **Implementation-Ready** | 17 |
| **Scientific Sources** | 103+ |
| **Detectors Cross-Validated** | 8/21 (38%) |
| **RGA Module Completion** | ~45% |

---

## 🚀 Next Actions

### This Week

1. ✅ Complete documentation split (this PR)
2. 🔧 Split `detectors.ts` → 21 modular files
3. ⚡ Implement Quick Wins (1.9.2)

### This Month

4. Implement statistical features (3.1-3.3)
5. Implement advanced analysis (1.9.1, 1.9.3-1.9.5)
6. Cross-validate remaining 13 detectors

---

## 📂 Navigation

### Module-Specific Backlogs

- [🔬 RGA Module](../MODULES/RGA/FEATURE_BACKLOG_RGA.md)
- [🔍 Leak Search Planner](LeaksearchPlanner_MasterV7_COMPLETE.md)
- [🏗️ Infrastructure Features](TODO)

### Reference Documents

- [Scientific References](../../RGA_Knowledge/SCIENTIFIC_REFERENCES.md)
- [Cross-Validation Status](CROSS_VALIDATION_STATUS.md)
- [Detector Inventory](../MODULES/RGA/DETECTORS_INVENTORY.md)

---

*This is a living document. Module backlogs contain detailed feature specifications.*

**Last Updated:** 2026-01-11
