# Oil-Based Contamination - Physics Documentation

Physics documentation for oil contamination detection in RGA spectra.

---

## Detectors (1)

### [OilBackstreaming.md](./OilBackstreaming.md)
**Pump Oil Backstreaming Detection**

Detects backstreaming of pump oil from rotary vane or diffusion pumps into the vacuum chamber.

**Key Masses:** 43, 57, 71, 85 (heavy hydrocarbon series, CₙH₂ₙ₊₁⁺)
**Code:** `src/modules/rga/lib/detectors/contamination/oils/detectOilBackstreaming.ts`
**Cross-Validation:** ⚠️ Conditional (3 fixes needed)

---

## Overview

Pump oil backstreaming is a common contamination source in vacuum systems using:
- **Rotary vane pumps** - Use mineral oil or synthetic oil
- **Diffusion pumps** - Use silicone oil or polyphenyl ether

Oil vapor migrates from the pump toward the chamber, leaving residues on surfaces and interfering with processes.

---

## Detection Principle

Mineral oils (petroleum-based) produce characteristic heavy hydrocarbon fragments at 70 eV EI:
- **m/z 43:** C₃H₇⁺ (propyl cation)
- **m/z 57:** C₄H₉⁺ (butyl cation)
- **m/z 71:** C₅H₁₁⁺ (pentyl cation)
- **m/z 85:** C₆H₁₃⁺ (hexyl cation)

**Signature Pattern:** Peak intensity typically decreases with mass (43 > 57 > 71 > 85)

---

## Scientific References

See [../../../SCIENTIFIC/REFERENCES.md](../../../SCIENTIFIC/REFERENCES.md)

---

**Subcategory:** Oils
**Total Detectors:** 1
