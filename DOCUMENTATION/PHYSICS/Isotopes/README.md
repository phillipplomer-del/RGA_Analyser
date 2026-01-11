# Isotope Analysis - Physics Documentation

Physics documentation for isotopic ratio analysis in RGA spectra.

---

## Detectors (1)

### [IsotopeRatios.md](./IsotopeRatios.md)
**Natural Isotope Ratio Verification**

Verifies that measured isotope ratios match natural abundances, validating data quality and identifying anomalies.

**Key Isotope Pairs:**
- **¹²C/¹³C** (m/z 12/13) - Natural ratio: 98.93% / 1.07%
- **¹⁴N/¹⁵N** (m/z 14/15) - Natural ratio: 99.636% / 0.364%
- **¹⁶O/¹⁸O** (m/z 16/18) - Natural ratio: 99.757% / 0.205%
- **³⁶Ar/³⁸Ar/⁴⁰Ar** (m/z 36/38/40) - ⁴⁰Ar dominates (99.6%)

**Code:** `src/modules/rga/lib/detectors/isotopes/verifyIsotopeRatios.ts`
**Cross-Validation:** ⚠️ Conditional (1 CRITICAL fix required: O₂ ratio)

---

## Overview

Isotope ratio verification is a powerful quality control tool for RGA measurements. Natural isotope abundances are precisely known from CIAAW (Commission on Isotopic Abundances and Atomic Weights), allowing validation of:

1. **Data Quality** - Deviations indicate measurement problems
2. **Calibration** - Verify mass scale calibration
3. **Contamination** - Anomalous ratios may indicate contaminants
4. **Enrichment** - Detect isotopically enriched materials

---

## Physical Principles

### Natural Isotope Abundances

Isotope abundances are remarkably constant across terrestrial materials (±0.1% for most elements), established by CIAAW as international standards.

**Example: Carbon**
- ¹²C: 98.93%
- ¹³C: 1.07%
- Ratio: ¹²C/¹³C ≈ 92.4

### RGA Detection

RGAs can measure isotope ratios when:
1. **Mass resolution sufficient** - Δm = 1 amu easily resolved
2. **No mass overlap** - e.g., m/z 13 is ¹³C⁺, not CH⁺ (requires verification)
3. **Good signal-to-noise** - Minor isotopes need adequate signal

---

## Detection Criteria

Isotope ratios are considered "verified" when measured ratios fall within:
- **±15%** of natural abundance (typical RGA measurement uncertainty)
- **±5%** for high-precision measurements (calibrated systems)

**Anomaly Detection:**
- Ratios outside ±20% trigger warnings
- May indicate:
  - Mass calibration errors
  - Fragment ion interference
  - Isotopically enriched materials
  - Data quality issues

---

## Applications

### 1. Data Quality Validation
If multiple isotope pairs (C, N, O, Ar) all verify, data quality is high.

### 2. Mass Calibration Check
Consistent deviations across all ratios indicate mass scale miscalibration.

### 3. Contamination Fingerprinting
- **Natural ratios:** System is clean
- **Anomalous C ratio:** Possible ¹³C-labeled compound
- **Anomalous N ratio:** Possible ¹⁵N-labeled compound

### 4. Leak Detection Enhancement
Ar isotope ratios (³⁶Ar:⁴⁰Ar) can distinguish air leaks from argon purge gas.

---

## Limitations

1. **Fragment Overlap:**
   - m/z 13: ¹³C⁺ vs. CH⁺ (from CH₄)
   - m/z 15: ¹⁵N⁺ vs. CH₃⁺ (from hydrocarbons)

2. **Low Abundance Isotopes:**
   - ¹⁸O (0.205%) requires good S/N ratio
   - ³⁸Ar (0.063%) often below detection limit

3. **Molecular Isotopes:**
   - m/z 29: ¹⁴N¹⁵N vs. ¹³CO vs. C₂H₅⁺
   - Requires careful interpretation

---

## Scientific References

All detectors reference the master scientific collection:
**[../../SCIENTIFIC/REFERENCES.md](../../SCIENTIFIC/REFERENCES.md)**

Key authoritative sources:
- **CIAAW (Commission on Isotopic Abundances and Atomic Weights)** - International standard isotope data
- **NIST (National Institute of Standards and Technology)** - Mass spectrometry reference data
- **IUPAC** - Isotopic composition standards

---

**Category:** Isotopes
**Total Detectors:** 1
**Validated:** 1 (100% - conditional)
**Critical Fix Needed:** O₂ ratio (487 → 244) - atomic vs molecular error
