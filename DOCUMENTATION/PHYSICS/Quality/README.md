# System Quality Assessment - Physics Documentation

Physics documentation for vacuum system quality assessment in RGA spectra.

---

## Detectors (1)

### [CleanUHV.md](./CleanUHV.md)
**Clean UHV System Verification**

Verifies that a vacuum system has achieved "clean UHV" conditions (pressure <10⁻⁸ mbar, low contamination).

**Key Criteria:**
- **Low total pressure:** <10⁻⁸ mbar
- **Hydrogen dominant:** H₂ typically 80-95% of spectrum
- **Low water:** H₂O <5% (indicates good bakeout)
- **Low hydrocarbons:** Minimal oil/contamination peaks
- **Natural isotope ratios:** Validates data quality

**Code:** `src/modules/rga/lib/detectors/quality/detectCleanUHV.ts`
**Cross-Validation:** ⬜ Pending validation

---

## Overview

Ultra-high vacuum (UHV) systems require pressures <10⁻⁸ mbar and minimal contamination for applications like:
- Surface science research
- Particle accelerators
- Semiconductor manufacturing
- Space simulation chambers

Achieving "clean UHV" requires proper procedures:
1. **Thorough cleaning** - Remove contaminants before assembly
2. **Bakeout** (150-200°C) - Drive off adsorbed water and gases
3. **Pumping** - Turbomolecular or ion pumps for UHV range
4. **Time** - Outgassing rates decrease exponentially

---

## Clean UHV Characteristics

### Typical Clean UHV Spectrum
```
H₂  (m/z 2):   80-95%    (dominant after bakeout)
CO  (m/z 28):  5-10%     (stainless steel outgassing)
CH₄ (m/z 16):  1-3%      (residual hydrocarbons)
H₂O (m/z 18):  <5%       (well-baked system)
CO₂ (m/z 44):  <1%       (trace)
N₂  (m/z 28):  <1%       (included in m/z 28)
```

### Why Hydrogen Dominates
- **Bulk diffusion:** H₂ diffuses through stainless steel walls
- **Thermal activation:** Increases with bakeout temperature
- **Low sticking:** H₂ doesn't stick to surfaces like H₂O does
- **Continuous source:** H₂ permeation is a persistent gas load in UHV

---

## Detection Criteria

A system is considered "clean UHV" when:

1. **✅ Hydrogen Dominant:** H₂ > 70% of total gas load
2. **✅ Low Water:** H₂O < 5-10% (indicates good bakeout)
3. **✅ Low Pressure:** Total pressure <10⁻⁸ mbar
4. **✅ Minimal Contamination:**
   - Oil peaks (m/z 43, 57, 71) << 1%
   - PFPE (m/z 69) << 1%
   - Solvents << 1%
5. **✅ No Air Leak:** N₂/O₂ ratio not consistent with air
6. **✅ Natural Isotopes:** Isotope ratios verify data quality

---

## Comparison: Before vs. After Bakeout

| Gas | Before Bakeout | After Bakeout (UHV) |
|-----|----------------|---------------------|
| H₂O | 60-90% | <5% |
| H₂  | 10-20% | 80-95% |
| CO  | 2-5%   | 5-10% |
| N₂  | 5-10%  | <1% |
| CO₂ | 1-3%   | <1% |

---

## Applications

### 1. System Commissioning
Verify new system has reached clean UHV before experiments begin.

### 2. Maintenance Scheduling
Detect degradation (rising H₂O, hydrocarbons) indicating need for maintenance.

### 3. Contamination Prevention
Identify contamination sources before they affect experiments.

### 4. Bakeout Effectiveness
Quantify bakeout success by tracking H₂O reduction and H₂ rise.

---

## Non-UHV Systems

This detector is specific to UHV systems. For other vacuum ranges:

- **High Vacuum (HV, 10⁻³-10⁻⁸ mbar):**
  - H₂O may remain dominant (10-50%)
  - Higher hydrocarbon levels acceptable
  - Air leaks more common

- **Rough Vacuum (<10⁻³ mbar):**
  - N₂ typically dominant
  - H₂O still significant
  - Not characterized as "clean"

---

## Scientific References

All detectors reference the master scientific collection:
**[../../SCIENTIFIC/REFERENCES.md](../../SCIENTIFIC/REFERENCES.md)**

Key sources:
- Redhead, Hobson, Kornelsen: "The Physical Basis of Ultrahigh Vacuum"
- Pfeiffer Vacuum: "The Vacuum Technology Book"
- CERN vacuum group guidelines
- JVST (Journal of Vacuum Science & Technology) publications

---

**Category:** Quality
**Total Detectors:** 1
**Validated:** 0 (0%)
**Pending:** 1 (100%)
