# Polymer Contamination - Physics Documentation

Physics documentation for polymer-related contamination detection in RGA spectra.

---

## Detectors (3)

### [PolymerOutgassing.md](./PolymerOutgassing.md)
**Generic Polymer Outgassing Detection**

Detects water-dominated outgassing typical of polymer materials (O-rings, seals, cable insulation).

**Key Masses:** 18 (H₂O⁺), 44 (CO₂⁺), hydrocarbons
**Code:** `src/modules/rga/lib/detectors/contamination/polymers/detectPolymerOutgassing.ts`
**Cross-Validation:** ⚠️ Conditional (1 CRITICAL fix needed)

---

### [PlasticizerContamination.md](./PlasticizerContamination.md)
**Phthalate Plasticizer Detection**

Detects phthalate plasticizers (DEHP, DBP) from cables, seals, and PVC materials.

**Key Masses:** 149 (C₈H₅O₃⁺ phthalate marker), 167 (C₈H₇O₄⁺)
**Code:** `src/modules/rga/lib/detectors/contamination/polymers/detectPlasticizerContamination.ts`
**Cross-Validation:** ⚠️ Conditional (2 fixes: 1 HIGH, 1 MEDIUM)

---

### [SiliconeContamination.md](./SiliconeContamination.md)
**Silicone Contamination Detection**

Detects silicone contamination from seals, greases, and outgassing materials.

**Key Masses:** 73, 147, 207, 221 (cyclic siloxane fragments)
**Code:** `src/modules/rga/lib/detectors/contamination/polymers/detectSiliconeContamination.ts`
**Cross-Validation:** ⬜ Pending validation

---

## Overview

Polymers are ubiquitous in vacuum systems but are significant outgassing sources:
- **Elastomers (O-rings, seals):** Viton, Buna-N, EPDM
- **Plastics (insulators):** PEEK, PTFE, Kapton
- **Cables:** PVC insulation with phthalate plasticizers
- **Greases/sealants:** Silicone-based lubricants

---

## Common Polymer Outgassing Products

### Water (Most Common)
Polymers absorb atmospheric moisture, which outgasses in vacuum.

### Plasticizers (Phthalates)
Added to PVC to improve flexibility, highly volatile in vacuum.

### Monomers & Oligomers
Unreacted monomers and low-molecular-weight oligomers from polymerization.

### Siloxanes
Cyclic siloxanes (D3, D4, D5) from silicone materials.

---

## Scientific References

See [../../../SCIENTIFIC/REFERENCES.md](../../../SCIENTIFIC/REFERENCES.md)

---

**Subcategory:** Polymers
**Total Detectors:** 3
