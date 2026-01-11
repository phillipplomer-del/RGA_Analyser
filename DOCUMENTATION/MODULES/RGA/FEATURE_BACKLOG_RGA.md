# Feature Backlog - RGA Module

**Purpose:** RGA-specific features and priorities

**Last Updated:** 2026-01-11

**Status:** 🔥 **ACTIVE DEVELOPMENT** (Primary focus)

---

## Status Overview

| Status | Count | Notes |
|--------|-------|-------|
| ✅ Implemented | 11 | Core features complete |
| 🎯 Implementation-Ready | 12 | All prerequisites met |
| ⬜ Planned | 2 | Missing validation or plan |

---

## 📊 Wissenschaftliche Features & Detektoren

### Datenqualität & Korrekturen (Priorität 0) ✅ ABGESCHLOSSEN

| # | Feature | Status | 🔬 Validiert? | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|---------------|------------|---------|---------|
| 0.1 | **RSF-Korrekturen** | ✅ | ✅ | [IMPLEMENTATION_SPEC.md](../../../ARCHIVED/IMPLEMENTATION_SPEC.md) | 30min | H₂S, SO₂, C₂H₆, SiH₄, PH₃ - korrigiert! |
| 0.2 | Neue Gase (Halbleiter) | ✅ | ✅ | [IMPLEMENTATION_SPEC.md](../../../ARCHIVED/IMPLEMENTATION_SPEC.md) | 1h | NF₃, WF₆, C₂F₆, GeH₄ |
| 0.3 | Neue Massen-Einträge | ✅ | ✅ | [IMPLEMENTATION_SPEC.md](../../../ARCHIVED/IMPLEMENTATION_SPEC.md) | 30min | m/z 52, 119, 127, 149 (Phthalat!) |
| 0.4 | Neue Diagnose-Detektoren | ✅ | ✅ | [IMPLEMENTATION_SPEC.md](../../../ARCHIVED/IMPLEMENTATION_SPEC.md) | 2-3h | Polymer, Weichmacher, Prozessgas, Kühlwasser |
| 0.5 | Neue Limit-Profile | ✅ | - | [IMPLEMENTATION_SPEC.md](../../../ARCHIVED/IMPLEMENTATION_SPEC.md) | 30min | LIGO UHV, Semiconductor CVD |

---

### Wissenschaftliche Analysewerkzeuge (Priorität 1.5)

| # | Feature | Status | 🔬 Validiert? | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|---------------|------------|---------|---------|
| 1.5.1 | **Ausgasungs-Simulator** | ✅ | ✅ | [RGA_APP_VERBESSERUNGEN.md](../../../BACKLOG/RGA_APP_VERBESSERUNGEN.md#1-ausgasungs-simulator) | ~4h | Multi-Material, integriert in RoR + RGA Diagnose |
| 1.5.2 | **Isotopen-Analyse** | ✅ | ✅ | [RGA_APP_VERBESSERUNGEN.md](../../../BACKLOG/RGA_APP_VERBESSERUNGEN.md#2-erweiterte-isotopen-analyse) | 4-6h | isotopePatterns.ts + verifyIsotopeRatios Detektor |
| 1.5.3 | **Konfidenz-Score System** | ✅ | ✅ | [RGA_APP_VERBESSERUNGEN.md](../../../BACKLOG/RGA_APP_VERBESSERUNGEN.md#8-konfidenz-score-system) | 4-6h | 6 aktive Faktoren, Temp aus Dateinamen |
| 1.5.4 | **ESD-Artefakt-Erkennung** | ✅ | ✅ | [RGA_APP_VERBESSERUNGEN.md](../../../BACKLOG/RGA_APP_VERBESSERUNGEN.md#3-esd-artefakt-erkennung) | 2-4h | 6 Kriterien, dynamische Severity |
| 1.5.5 | **Helium-Leck-Indikator** | ✅ | ⚠️ | [RGA_APP_VERBESSERUNGEN.md](../../../BACKLOG/RGA_APP_VERBESSERUNGEN.md#4-helium-lecktest-integration) | 2h | Qualitative m/z=4 Detektion |
| 1.5.7 | **Peak-Deconvolution** | ✅ | ✅ | [RGA_APP_VERBESSERUNGEN.md](../../../BACKLOG/RGA_APP_VERBESSERUNGEN.md#6-massenauflösung-und-peak-überlappung) | 3h | N₂/CO Diskriminierung |
| 1.5.8 | Pfeiffer-Kalibrierung | ⬜ | ❌ | [RGA_APP_VERBESSERUNGEN.md](../../../BACKLOG/RGA_APP_VERBESSERUNGEN.md#7-pfeiffer-spezifische-erweiterungen) | 2h | Gerätespezifische Kalibrierungsfaktoren |
| 1.5.9 | **Wissenschaftliche Validierung** | ✅ | ✅ | [SCIENTIFIC_REFERENCES.md](../../../RGA_Knowledge/SCIENTIFIC_REFERENCES.md) | ~6h | 103+ Quellen dokumentiert |

---

### Erweiterungen aus wissenschaftlicher Validierung (Priorität 1.8) 🔬

| # | Feature | Status | 🔬 Validiert? | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|---------------|------------|---------|------------|
| 1.8.1 | D₂/HD Gase (Deuterium) | ✅ | ✅ | [SCIENTIFIC_REFERENCES.md](../../../RGA_Knowledge/SCIENTIFIC_REFERENCES.md) | 2-3h | ✅ Implementiert. m/z 3, 4. Fusionsforschung |
| 1.8.2 | N₂O Gas (Lachgas) | ✅ | ✅ | [SCIENTIFIC_REFERENCES.md](../../../RGA_Knowledge/SCIENTIFIC_REFERENCES.md) | 2h | ✅ Implementiert. m/z 44/45/46, 30/31 |
| 1.8.3 | PDMS m/z 59 Enhancement | ✅ | ✅ | [SCIENTIFIC_REFERENCES.md](../../../RGA_Knowledge/SCIENTIFIC_REFERENCES.md) | 30min | ✅ Implementiert. C₃H₇Si⁺ Marker |
| 1.8.4 | Argon Ratio Update | ⬜ | ✅ | [FEATURE_1.8.4_ARGON_RATIO_UPDATE_PLAN.md](../../../NextFeatures/FEATURE_1.8.4_ARGON_RATIO_UPDATE_PLAN.md) | 15min | 🎯 **Ready!** Lee 2006: 298.56 vs 295.5 |

---

### Offline-Analyse Features (Priorität 1.9) 🧪

> **Identifiziert durch Gemini-3-Pro Cross-Validation**

| # | Feature | Status | 🔬 Validiert? | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|---------------|------------|---------|---------|
| 1.9.1 | Kinetic Fingerprinting | ⬜ | ⚠️ | [FEATURE_1.9.1_KINETIC_FINGERPRINTING_PLAN.md](../../../NextFeatures/FEATURE_1.9.1_KINETIC_FINGERPRINTING_PLAN.md) | 4-6h | 🎯 **Ready!** P ∝ t⁻ⁿ Analyse |
| 1.9.2 | Dynamic LOD | ⬜ | ✅ | [FEATURE_1.9.2_DYNAMIC_LOD_PLAN.md](../../../NextFeatures/FEATURE_1.9.2_DYNAMIC_LOD_PLAN.md) | 2-3h | 🎯 **Ready!** LOD = μ + 3σ (IUPAC) |
| 1.9.3 | Statistical Uncertainty | ⬜ | ✅ | [FEATURE_1.9.3_STATISTICAL_UNCERTAINTY_PLAN.md](../../../NextFeatures/FEATURE_1.9.3_STATISTICAL_UNCERTAINTY_PLAN.md) | 3-4h | 🎯 **Ready!** Q ± 2·SE_slope (95% CI) |
| 1.9.4 | Background Subtraction | ⬜ | ✅ | [FEATURE_1.9.4_BACKGROUND_SUBTRACTION_PLAN.md](../../../NextFeatures/FEATURE_1.9.4_BACKGROUND_SUBTRACTION_PLAN.md) | 3-4h | 🎯 **Ready!** ASCII background file |
| 1.9.5 | Permeation Lag Detection | ⬜ | ✅ | [FEATURE_1.9.5_PERMEATION_LAG_PLAN.md](../../../NextFeatures/FEATURE_1.9.5_PERMEATION_LAG_PLAN.md) | 4-5h | 🎯 **Ready!** t_lag = L²/6D |

---

### Wissenschaftliche Qualität (Priorität 3)

| # | Feature | Status | 🔬 Validiert? | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|---------------|------------|---------|---------|
| 3.1 | Unsicherheiten Basis | ⬜ | ✅ | [FEATURE_3.1_UNCERTAINTY_BASIS_PLAN.md](../../../NextFeatures/FEATURE_3.1_UNCERTAINTY_BASIS_PLAN.md) | 8-9h | 🎯 **Ready!** ISO GUM (17 Quellen) |
| 3.2 | Fehlerfortpflanzung | ⬜ | ✅ | [FEATURE_3.2_ERROR_PROPAGATION_PLAN.md](../../../NextFeatures/FEATURE_3.2_ERROR_PROPAGATION_PLAN.md) | 6-8h | 🎯 **Ready!** Gaussian propagation |
| 3.3 | Robuste Regression | ⬜ | ✅ | [FEATURE_3.3_ROBUST_REGRESSION_PLAN.md](../../../NextFeatures/FEATURE_3.3_ROBUST_REGRESSION_PLAN.md) | 8-9h | 🎯 **Ready!** Huber + RANSAC |
| 3.4 | Grenzwert-Signifikanz | ⬜ | ✅ | [FEATURE_3.4_LIMIT_SIGNIFICANCE_PLAN.md](../../../NextFeatures/FEATURE_3.4_LIMIT_SIGNIFICANCE_PLAN.md) | 2h | 🎯 **Ready!** JCGM 106:2012 |

---

### Golden Run Vergleich (Priorität 1.10) 🎯 QUICK WIN

> **"Schatten-Plot" einer Referenzmessung zur Abweichungs-Erkennung**

| # | Feature | Status | 🔬 Validiert? | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|---------------|------------|---------|---------|
| 1.10.1 | CSV Reference Loader | ⬜ | - | [FEATURE_1.10.1_CSV_REFERENCE_LOADER_PLAN.md](../../../NextFeatures/FEATURE_1.10.1_CSV_REFERENCE_LOADER_PLAN.md) | 4-6h | 🎯 **Ready!** Shadow plot overlay |
| 1.10.2 | Deviation Highlighting | ⬜ | - | [FEATURE_1.10.2_DEVIATION_HIGHLIGHTING_PLAN.md](../../../NextFeatures/FEATURE_1.10.2_DEVIATION_HIGHLIGHTING_PLAN.md) | 3-4h | 🎯 **Ready!** Color-coded δ |

**Commercial Validation:** MKS + Inficon nutzen das für Halbleiter-QA

---

## 🎯 Implementation Priority (Recommended Order)

### **Phase 1: Quick Wins** (1-2 days)

1. **1.8.4 Argon Ratio Update** (15 min) ⚡
2. **3.4 Grenzwert-Signifikanz** (2h)
3. **1.9.2 Dynamic LOD** (2-3h)

### **Phase 2: Statistical Features** (3-5 days)

4. **1.9.4 Background Subtraction** (3-4h)
5. **1.9.5 Permeation Lag** (4-5h)
6. **1.9.3 Statistical Uncertainty** (3-4h)
7. **3.1 Unsicherheiten Basis** (8-9h) - **Foundation**

### **Phase 3: Advanced Analysis** (1 week)

8. **3.2 Fehlerfortpflanzung** (6-8h)
9. **3.3 Robuste Regression** (8-9h)
10. **1.9.1 Kinetic Fingerprinting** (4-6h)

### **Phase 4: UX Features** (3-4 days)

11. **1.10.1 CSV Reference Loader** (4-6h)
12. **1.10.2 Deviation Highlighting** (3-4h)

---

## 📋 Detector Status

**Full Details:** See [DETECTORS_INVENTORY.md](DETECTORS_INVENTORY.md)

- **Total:** 21 detektoren
- **✅ Validated:** 8 (all fixes applied)
- **⚠️ Pending:** 13 (need cross-validation)

**Current Location:** `src/lib/diagnosis/detectors.ts` (2,228 lines)

**Migration Plan:** Split into modular structure → `src/modules/rga/lib/detectors/`

---

## 🔬 Scientific Validation

**Reference:** [SCIENTIFIC_REFERENCES.md](../../../RGA_Knowledge/SCIENTIFIC_REFERENCES.md)

- **Total Sources:** 103+ URLs
- **Coverage:** Isotopes, RGA applications, vacuum kinetics, uncertainty, regression
- **Standards:** ISO GUM, NIST, CIAAW, IUPAC, JCGM

---

## Next Steps

1. ✅ **Detektoren Split** - Monolithic file → 21 modular files
2. ⏭️ **Quick Wins** - Feature 1.8.4, 3.4, 1.9.2 (1-2 days)
3. ⏭️ **Statistical Foundation** - Features 3.1-3.3 (ISO GUM compliance)
4. ⏭️ **Cross-Validate** - Remaining 13 detectors

---

*Last Updated: 2026-01-11*
