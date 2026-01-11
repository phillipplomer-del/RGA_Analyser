# Outgassing Analysis - Physics Documentation

Physics documentation for outgassing analysis algorithms in RGA spectra analysis.

---

## Detectors (2)

### [WaterOutgassing.md](./WaterOutgassing.md)
**Water Vapor Outgassing Analysis**

Detects and characterizes water vapor outgassing from system surfaces.

**Key Masses:** 18 (H₂O⁺), 17 (OH⁺), 16 (O⁺)
**Code:** `src/modules/rga/lib/detectors/outgassing/detectWaterOutgassing.ts`
**Cross-Validation:** ⬜ Pending validation

---

### [HydrogenDominant.md](./HydrogenDominant.md)
**Hydrogen-Dominated Spectra Analysis**

Identifies hydrogen-dominated spectra typical of outgassed systems.

**Key Masses:** 2 (H₂⁺), 1 (H⁺)
**Code:** `src/modules/rga/lib/detectors/outgassing/detectHydrogenDominant.ts`
**Cross-Validation:** ⬜ Pending validation

---

## Overview

Outgassing is the dominant gas load in vacuum systems, especially during initial pumpdown and after venting. These detectors characterize the two primary outgassing species:

1. **Water (H₂O)** - Surface-adsorbed water, typically 50-90% of initial gas load
2. **Hydrogen (H₂)** - Bulk diffusion from metals, increases with bakeout

---

## Detection Principles

### Water Outgassing
- **Fragmentation pattern:** H₂O⁺ (100%), OH⁺ (20-25%), O⁺ (1-2%)
- **Temperature dependence:** Decreases exponentially with pumpdown time
- **Bakeout effect:** Dramatically reduced after 150-200°C bakeout

### Hydrogen Dominance
- **Thermal activation:** H₂ diffusion from bulk metal increases with temperature
- **Bakeout signature:** H₂ becomes dominant during and after bakeout
- **Permeation:** Continuous H₂ source in some systems (stainless steel at elevated temp)

---

## Typical Outgassing Profiles

**Initial Pumpdown:**
- H₂O: 60-90%
- H₂: 10-20%
- N₂, CO, CO₂: 5-15%

**After Bakeout (150-200°C):**
- H₂: 80-95%
- CO: 5-15%
- H₂O: <5%

---

## Scientific References

All detectors reference the master scientific collection:
**[../../SCIENTIFIC/REFERENCES.md](../../SCIENTIFIC/REFERENCES.md)**

---

**Category:** Outgassing
**Total Detectors:** 2
**Validated:** 0 (0%)
**Pending:** 2 (100%)
