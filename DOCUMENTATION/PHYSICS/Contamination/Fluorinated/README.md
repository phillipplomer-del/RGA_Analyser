# Fluorinated Contamination - Physics Documentation

Physics documentation for fluorinated compound contamination detection in RGA spectra.

---

## Detectors (1)

### [FomblinContamination.md](./FomblinContamination.md)
**PFPE (Perfluoropolyether) Contamination Detection**

Detects Fomblin, Krytox, and other PFPE lubricants used in high-performance vacuum applications.

**Key Masses:** 69 (CF₃⁺), 31 (CF⁺), 47 (CFO⁺), 50 (CF₂⁺)
**Code:** `src/modules/rga/lib/detectors/contamination/fluorinated/detectFomblinContamination.ts`
**Cross-Validation:** ⚠️ Conditional (1 CRITICAL fix needed: add m/z 50 check)

---

## Overview

Perfluoropolyethers (PFPE) are high-performance fluorinated lubricants used in:
- **Turbomolecular pumps:** Bearings and seals (Fomblin, Krytox)
- **Mechanical feedthroughs:** Rotary/linear motion in vacuum
- **High-temperature applications:** Stable to 200-300°C

Despite excellent properties, PFPE can contaminate vacuum systems through:
- **Vapor migration:** Low vapor pressure but not zero
- **Mechanical wear:** Bearing degradation releases particles
- **Chemical breakdown:** Reacts with Lewis acids (AlCl₃) or strong oxidizers

---

## Detection Principle

PFPE produces characteristic fluorocarbon fragments at 70 eV EI:
- **m/z 69:** CF₃⁺ (trifluoromethyl cation) - strongest peak
- **m/z 31:** CF⁺ (monofluorocarbon)
- **m/z 47:** CFO⁺ (contains oxygen from PFPE backbone)
- **m/z 50:** CF₂⁺ (difluorocarbon) - 2nd/3rd strongest peak

**Signature:** CF₃⁺ (69) dominant, with supporting CF⁺ (31), CFO⁺ (47), CF₂⁺ (50)

---

## Health & Safety Concerns

PFPE decomposition products can be hazardous:
- **HF (hydrofluoric acid):** Forms from PFPE + water vapor
- **Toxic fluorocarbons:** COF₂, CF₄ at high temperatures
- **Corrosion:** HF attacks glass, stainless steel, aluminum

**Mitigation:** Use PFPE-compatible materials, avoid reactive metals (aluminum, magnesium).

---

## Scientific References

See [../../../SCIENTIFIC/REFERENCES.md](../../../SCIENTIFIC/REFERENCES.md)

---

**Subcategory:** Fluorinated
**Total Detectors:** 1
