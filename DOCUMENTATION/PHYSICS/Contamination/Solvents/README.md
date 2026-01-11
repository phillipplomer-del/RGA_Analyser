# Solvent Contamination - Physics Documentation

Physics documentation for solvent residue detection in RGA spectra.

---

## Detectors (2)

### [SolventResidue.md](./SolventResidue.md)
**Generic Solvent Residue Detection**

Detects organic solvent residues from cleaning processes (acetone, ethanol, isopropanol, methanol).

**Key Masses:** 31 (CH₃OH⁺), 43 (C₃H₇O⁺), 45 (C₂H₅OH⁺), 58 (C₃H₆O⁺)
**Code:** `src/modules/rga/lib/detectors/contamination/solvents/detectSolventResidue.ts`
**Cross-Validation:** ⬜ Pending validation

---

### [ChlorinatedSolvent.md](./ChlorinatedSolvent.md)
**Chlorinated Solvent Detection**

Detects chlorinated solvents (trichloroethylene, perchloroethylene, methylene chloride) with characteristic Cl isotope pattern.

**Key Masses:** 35/37 (³⁵Cl/³⁷Cl, 3:1 ratio), chlorocarbon fragments
**Code:** `src/modules/rga/lib/detectors/contamination/solvents/detectChlorinatedSolvent.ts`
**Cross-Validation:** ⬜ Pending validation

---

## Overview

Solvents are used for cleaning vacuum components before assembly but can leave residues if not properly removed:

### Common Cleaning Solvents
- **Alcohols:** Methanol, ethanol, isopropanol (IPA)
- **Ketones:** Acetone, methyl ethyl ketone (MEK)
- **Chlorinated:** Trichloroethylene (TCE), perchloroethylene (PCE)
- **Hydrocarbons:** Hexane, heptane

### Why Residues Persist
- **Incomplete drying:** Solvent trapped in crevices, blind holes
- **Surface adsorption:** Polar solvents adsorb on metal oxides
- **Poor ventilation:** Insufficient time for evaporation

---

## Detection Principles

### Alcohol Residues
Alcohols fragment to characteristic ions:
- **Methanol (CH₃OH):** m/z 31 (CH₃OH⁺), 29 (CHO⁺)
- **Ethanol (C₂H₅OH):** m/z 31 (CH₂OH⁺), 45 (C₂H₅O⁺)
- **Isopropanol (IPA):** m/z 45 (C₂H₅O⁺), 43 (C₃H₇⁺)

### Ketone Residues
- **Acetone (C₃H₆O):** m/z 43 (C₃H₇⁺), 58 (C₃H₆O⁺)

### Chlorinated Solvents
Chlorine has two stable isotopes (³⁵Cl:³⁷Cl = 3:1), creating characteristic doublet patterns:
- **TCE (C₂HCl₃):** m/z 95/97/99 (doublet/triplet)
- **PCE (C₂Cl₄):** m/z 166/168/170
- **Methylene chloride (CH₂Cl₂):** m/z 84/86

---

## Health & Environmental Concerns

### Chlorinated Solvents
- **Carcinogenic:** TCE, PCE are suspected carcinogens
- **Ozone depletion:** Many chlorinated solvents banned/restricted
- **Toxic decomposition:** Form phosgene (COCl₂) at high temperatures

**Recommendation:** Avoid chlorinated solvents; use alcohols or aqueous cleaning.

### Alcohols & Ketones
- **Flammable:** Acetone, ethanol are highly flammable
- **Relatively safe:** Lower toxicity than chlorinated solvents

---

## Cleaning Best Practices

1. **Use volatile solvents:** IPA, acetone evaporate quickly
2. **Ultrasonic cleaning:** Removes solvent from crevices
3. **Drying:** Blow with dry N₂ or heat in oven (80-120°C)
4. **Verification:** RGA scan after cleaning to verify no residues

---

## Scientific References

See [../../../SCIENTIFIC/REFERENCES.md](../../../SCIENTIFIC/REFERENCES.md)

---

**Subcategory:** Solvents
**Total Detectors:** 2
