# Aromatic Contamination - Physics Documentation

Physics documentation for aromatic compound contamination detection in RGA spectra.

---

## Detectors (1)

### [AromaticContamination.md](./AromaticContamination.md)
**Aromatic Compound Detection**

Detects benzene and aromatic derivatives from adhesives, coatings, and organic outgassing.

**Key Masses:** 78 (C₆H₆⁺ benzene), 77 (C₆H₅⁺ phenyl), 91 (C₇H₇⁺ tropylium), 92 (C₇H₈⁺ toluene)
**Code:** `src/modules/rga/lib/detectors/contamination/aromatics/detectAromatic.ts`
**Cross-Validation:** ⬜ Pending validation

---

## Overview

Aromatic compounds (benzene ring-containing molecules) can contaminate vacuum systems from:

### Common Sources
- **Adhesives & Epoxies:** Contain aromatic resins and hardeners
- **Coatings & Paints:** Aromatic solvents and binders
- **Plastics:** Polystyrene, polycarbonate (aromatic polymers)
- **Cable insulation:** Some wire coatings contain aromatics
- **Cleaning solvents:** Toluene, xylene

---

## Detection Principle

Aromatic compounds produce characteristic stable aromatic cations at 70 eV EI:

### Benzene (C₆H₆)
- **m/z 78:** C₆H₆⁺ (molecular ion, very stable)
- **m/z 77:** C₆H₅⁺ (phenyl cation, loss of H)

### Toluene (C₇H₈)
- **m/z 92:** C₇H₈⁺ (molecular ion)
- **m/z 91:** C₇H₇⁺ (tropylium cation, very stable)
- **m/z 65:** C₅H₅⁺ (cyclopentadienyl cation)

### Xylene (C₈H₁₀)
- **m/z 106:** C₈H₁₀⁺ (molecular ion)
- **m/z 91:** C₇H₇⁺ (tropylium)

**Signature:** Strong peaks at m/z 77-78 (benzene) or 91-92 (toluene/xylene)

---

## Aromatic Stability

Aromatic ions are exceptionally stable in mass spectrometry due to:
- **Resonance stabilization:** Delocalized π electrons in benzene ring
- **Low fragmentation:** Benzene ring tends to stay intact
- **High intensity:** M⁺ and [M-H]⁺ peaks are prominent

This makes aromatic detection relatively straightforward compared to aliphatic hydrocarbons.

---

## Health & Safety Concerns

### Benzene
- **Carcinogenic:** IARC Group 1 carcinogen (known human carcinogen)
- **Bone marrow toxin:** Causes leukemia
- **Banned/Restricted:** Use prohibited in many applications

### Toluene & Xylene
- **Neurotoxic:** Affects central nervous system
- **Reproductive toxin:** Toluene at high concentrations
- **Flammable:** All aromatics are flammable

**Recommendation:** Avoid aromatic-containing materials in vacuum systems where possible.

---

## Distinguishing Aromatics from Aliphatics

| Feature | Aromatics | Aliphatics |
|---------|-----------|------------|
| Base peak | m/z 77-78, 91-92 | m/z 43, 57, 71 |
| Molecular ion | Strong | Weak/absent |
| Fragmentation | Minimal | Extensive |
| Stability | High (resonance) | Low |

---

## Scientific References

See [../../../SCIENTIFIC/REFERENCES.md](../../../SCIENTIFIC/REFERENCES.md)

---

**Subcategory:** Aromatics
**Total Detectors:** 1
