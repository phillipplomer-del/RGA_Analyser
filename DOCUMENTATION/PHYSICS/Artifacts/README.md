# Measurement Artifacts - Physics Documentation

Physics documentation for measurement artifact detection in RGA spectra.

---

## Detectors (1)

### [ESDartifacts.md](./ESDartifacts.md)
**Electron-Stimulated Desorption (ESD) Artifacts**

Detects artifacts caused by electron-stimulated desorption in the RGA ionizer.

**Key Mechanism:** High-energy electrons (70 eV) bombarding filament, grids, and surfaces can desorb adsorbed gases, creating artificial peaks that don't represent the true vacuum composition.

**Affected Masses:** Typically H₂ (m/z 2), H₂O (m/z 18), CO (m/z 28), CO₂ (m/z 44)

**Code:** `src/modules/rga/lib/detectors/artifacts/detectESDartifacts.ts`
**Cross-Validation:** ⚠️ Conditional (2 CRITICAL fixes required)

---

## Overview

Electron-stimulated desorption (ESD) is a well-known artifact in RGA measurements where the electron beam itself causes gas molecules to desorb from surfaces within the ionizer. This creates artificially elevated peaks that do not accurately represent the vacuum system composition.

---

## Physical Mechanism

1. **Electron Impact:** 70 eV electrons strike ionizer surfaces (filament, grids, envelope)
2. **Energy Transfer:** Electrons transfer energy to adsorbed molecules (H₂O, CO, hydrocarbons)
3. **Desorption:** Molecules gain enough energy to overcome binding and desorb
4. **Ionization:** Desorbed molecules are immediately ionized and detected
5. **Artifact:** Measured partial pressure > true partial pressure

---

## Detection Criteria

ESD artifacts typically exhibit:

1. **Elevated fragment ratios:**
   - H⁺/H₂ ratio > baseline (>0.05 vs. ~0.01 natural)
   - CO⁺/CO ratio > expected from EI fragmentation
   - N⁺/N₂ ratio > 0.15 (vs. ~0.07 typical)

2. **Time-dependent behavior:**
   - Peaks decrease slowly as surface coverage depletes
   - May increase after venting (surface re-adsorption)

3. **Filament emission dependence:**
   - Signal increases non-linearly with emission current
   - Should be linear for true gas pressure

---

## Mitigation Strategies

1. **Ionizer Bakeout:** Reduce surface coverage before measurement
2. **Lower Emission Current:** Reduce electron flux if possible (trade-off with sensitivity)
3. **Multiple Scans:** Average several scans as ESD depletes surface
4. **Cross-Calibration:** Compare with calibrated ion gauges

---

## Scientific References

All detectors reference the master scientific collection:
**[../../SCIENTIFIC/REFERENCES.md](../../SCIENTIFIC/REFERENCES.md)**

Key sources:
- Redhead et al., "The Physical Basis of Ultrahigh Vacuum"
- NIST Technical Notes on RGA measurements
- Manufacturer application notes (Pfeiffer, MKS, Inficon)

---

**Category:** Artifacts
**Total Detectors:** 1
**Validated:** 1 (100% - conditional)
**Critical Fixes Needed:** 2 (N⁺/N₂ threshold, H⁺/H₂ baseline)
