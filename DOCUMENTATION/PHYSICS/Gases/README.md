# Specific Gas Detection - Physics Documentation

Physics documentation for specific gas detection algorithms in RGA spectra analysis.

---

## Detectors (5)

### [Ammonia.md](./Ammonia.md)
**Ammonia (NH₃) Detection**

Detects ammonia from cleaning processes or biological sources.

**Key Masses:** 17 (NH₃⁺), 16 (NH₂⁺), 15 (NH⁺)
**Code:** `src/modules/rga/lib/detectors/gases/detectAmmonia.ts`
**Cross-Validation:** ⬜ Pending validation

---

### [Methane.md](./Methane.md)
**Methane and Light Hydrocarbons**

Detects methane (CH₄) and light hydrocarbon gases.

**Key Masses:** 16 (CH₄⁺), 15 (CH₃⁺), 14 (CH₂⁺)
**Code:** `src/modules/rga/lib/detectors/gases/detectMethane.ts`
**Cross-Validation:** ⬜ Pending validation

---

### [Sulfur.md](./Sulfur.md)
**Sulfur-Containing Compounds**

Detects sulfur-containing gases (H₂S, SO₂, COS, etc.).

**Key Masses:** 34 (H₂S⁺), 64 (SO₂⁺), 32 (S⁺), 48 (SO⁺)
**Code:** `src/modules/rga/lib/detectors/gases/detectSulfur.ts`
**Cross-Validation:** ⬜ Pending validation

---

### [ProcessGasResidue.md](./ProcessGasResidue.md)
**Process Gas Residues**

Detects residual process gases from semiconductor/thin-film processing.

**Typical Gases:** CF₄, SF₆, CHF₃, C₂F₆, NF₃
**Code:** `src/modules/rga/lib/detectors/gases/detectProcessGasResidue.ts`
**Cross-Validation:** ⬜ Pending validation

---

### [N2_CO_Differentiation.md](./N2_CO_Differentiation.md)
**N₂/CO Discrimination at m/z 28**

Distinguishes nitrogen (N₂) from carbon monoxide (CO) using fragment ion ratios.

**Key Masses:** 28 (N₂⁺/CO⁺), 14 (N⁺), 12 (C⁺), 29 (¹⁴N¹⁵N/¹³CO)
**Code:** `src/modules/rga/lib/detectors/gases/distinguishN2fromCO.ts`
**Cross-Validation:** ⬜ Pending validation

**Detection Principle:**
- **N₂:** m28/m14 ≈ 14 (N⁺ fragment from N₂)
- **CO:** m28/m12 ≈ 20 (C⁺ fragment from CO)
- **N⁺/C⁺ ratio:** N₂ > 2, CO < 0.5
- **Isotope check:** ¹⁴N¹⁵N (0.73%) vs. ¹³CO (1.1-1.2%)

---

## Overview

These detectors identify specific gases that may be present in vacuum systems due to:

1. **Process residues** - Semiconductor manufacturing gases (CF₄, SF₆, NF₃)
2. **Contamination** - Ammonia, sulfur compounds from biological/chemical sources
3. **Natural sources** - Methane from organic outgassing
4. **Ambiguous peaks** - N₂ vs. CO discrimination at m/z 28

---

## Detection Challenges

### Mass Overlap
- **m/z 28:** N₂⁺, CO⁺, C₂H₄⁺
- **m/z 16:** O⁺, CH₄⁺, NH₂⁺
- **m/z 17:** OH⁺, NH₃⁺

**Solution:** Use fragment ion patterns and isotope ratios to differentiate.

### Low Concentrations
Process gas residues may be present at <1% levels, requiring sensitive detection algorithms.

**Solution:** Use characteristic fragment ions with good signal-to-noise ratios.

---

## Scientific References

All detectors reference the master scientific collection:
**[../../SCIENTIFIC/REFERENCES.md](../../SCIENTIFIC/REFERENCES.md)**

Key sources:
- NIST WebBook (70 eV EI mass spectra)
- CIAAW (isotope abundances)
- Semiconductor industry standards (SEMI)
- Pfeiffer/MKS application notes

---

**Category:** Gases
**Total Detectors:** 5
**Validated:** 0 (0%)
**Pending:** 5 (100%)
