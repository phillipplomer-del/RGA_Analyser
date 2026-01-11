# Physics Documentation - RGA Detectors

This directory contains detailed physics documentation for all 22 RGA detectors, organized by category to mirror the modular code architecture at `src/modules/rga/lib/detectors/`.

---

## Directory Structure

```
PHYSICS/
├── Leaks/                # Leak Detection (4 detectors)
├── Contamination/        # Contamination Detection (8 detectors)
│   ├── Oils/            # Oil-based contamination
│   ├── Polymers/        # Polymer outgassing
│   ├── Fluorinated/     # PFPE/Fomblin
│   ├── Solvents/        # Organic solvents
│   └── Aromatics/       # Aromatic compounds
├── Outgassing/          # Outgassing Analysis (2 detectors)
├── Artifacts/           # Measurement Artifacts (1 detector)
├── Gases/               # Specific Gas Detection (5 detectors)
├── Isotopes/            # Isotope Analysis (1 detector)
└── Quality/             # System Quality (1 detector)
```

---

## Detector Categories

### [Leaks/](./Leaks/) - Leak Detection (4 detectors)

Detection and characterization of vacuum leaks:

- [AirLeak.md](./Leaks/AirLeak.md) - Air leak detection using N₂/O₂ ratio
- [HeliumLeak.md](./Leaks/HeliumLeak.md) - Helium tracer leak detection
- [VirtualLeak.md](./Leaks/VirtualLeak.md) - Virtual leak identification
- [CoolingWaterLeak.md](./Leaks/CoolingWaterLeak.md) - Cooling water leak detection

---

### [Contamination/](./Contamination/) - Contamination Detection (8 detectors)

Detection of various contaminant types:

#### [Oils/](./Contamination/Oils/)
- [OilBackstreaming.md](./Contamination/Oils/OilBackstreaming.md) - Pump oil backstreaming

#### [Polymers/](./Contamination/Polymers/)
- [PolymerOutgassing.md](./Contamination/Polymers/PolymerOutgassing.md) - Generic polymer outgassing
- [PlasticizerContamination.md](./Contamination/Polymers/PlasticizerContamination.md) - Phthalate plasticizers
- [SiliconeContamination.md](./Contamination/Polymers/SiliconeContamination.md) - Silicone contamination

#### [Fluorinated/](./Contamination/Fluorinated/)
- [FomblinContamination.md](./Contamination/Fluorinated/FomblinContamination.md) - PFPE (Fomblin, Krytox)

#### [Solvents/](./Contamination/Solvents/)
- [SolventResidue.md](./Contamination/Solvents/SolventResidue.md) - Organic solvent residues
- [ChlorinatedSolvent.md](./Contamination/Solvents/ChlorinatedSolvent.md) - Chlorinated solvents

#### [Aromatics/](./Contamination/Aromatics/)
- [AromaticContamination.md](./Contamination/Aromatics/AromaticContamination.md) - Aromatic compounds

---

### [Outgassing/](./Outgassing/) - Outgassing Analysis (2 detectors)

Analysis of outgassing phenomena:

- [WaterOutgassing.md](./Outgassing/WaterOutgassing.md) - Water vapor outgassing
- [HydrogenDominant.md](./Outgassing/HydrogenDominant.md) - Hydrogen-dominated spectra

---

### [Artifacts/](./Artifacts/) - Measurement Artifacts (1 detector)

Detection of measurement artifacts:

- [ESDartifacts.md](./Artifacts/ESDartifacts.md) - Electron-stimulated desorption artifacts

---

### [Gases/](./Gases/) - Specific Gas Detection (5 detectors)

Detection of specific gases:

- [Ammonia.md](./Gases/Ammonia.md) - Ammonia detection
- [Methane.md](./Gases/Methane.md) - Methane and light hydrocarbons
- [Sulfur.md](./Gases/Sulfur.md) - Sulfur-containing compounds
- [ProcessGasResidue.md](./Gases/ProcessGasResidue.md) - Process gas residues
- [N2_CO_Differentiation.md](./Gases/N2_CO_Differentiation.md) - N₂/CO discrimination at m/z 28

---

### [Isotopes/](./Isotopes/) - Isotope Analysis (1 detector)

Isotopic ratio verification:

- [IsotopeRatios.md](./Isotopes/IsotopeRatios.md) - Natural isotope ratio verification

---

### [Quality/](./Quality/) - System Quality (1 detector)

Vacuum system quality assessment:

- [CleanUHV.md](./Quality/CleanUHV.md) - Clean UHV system verification

---

## Documentation Structure

Each detector physics document follows this structure:

1. **Physics Overview** - Scientific principles and detection mechanisms
2. **Mass Spectrometry** - Key masses and fragmentation patterns
3. **Thresholds & Criteria** - Detection thresholds with scientific justification
4. **Confidence Scoring** - How confidence scores are calculated
5. **Evidence Generation** - How evidence items are constructed
6. **Sources & Validation** - Scientific references from [../SCIENTIFIC/REFERENCES.md](../SCIENTIFIC/REFERENCES.md)
7. **Cross-Validation Status** - Gemini + Grok validation status

---

## Scientific References

All physics documentation references the master scientific collection:
**[../SCIENTIFIC/REFERENCES.md](../SCIENTIFIC/REFERENCES.md)** - 103+ validated sources

---

## Code Mapping

Physics documentation directly corresponds to detector code:

| Physics Doc | Code Location |
|-------------|--------------|
| PHYSICS/Leaks/AirLeak.md | `src/modules/rga/lib/detectors/leaks/detectAirLeak.ts` |
| PHYSICS/Contamination/Oils/OilBackstreaming.md | `src/modules/rga/lib/detectors/contamination/oils/detectOilBackstreaming.ts` |
| PHYSICS/Outgassing/WaterOutgassing.md | `src/modules/rga/lib/detectors/outgassing/detectWaterOutgassing.ts` |
| ... | ... |

---

## Cross-Validation Status

**Total Detectors:** 22
**Validated:** 8 (36%)
**Pending Validation:** 14 (64%)

For detailed validation status, see:
- [../SCIENTIFIC/DETECTORS.md](../SCIENTIFIC/DETECTORS.md)
- [../BACKLOG/CROSS_VALIDATION_STATUS.md](../BACKLOG/CROSS_VALIDATION_STATUS.md)

---

## Contributing

When adding new detector physics documentation:

1. **Create file** in appropriate category folder
2. **Follow template** structure (overview, masses, thresholds, sources, validation)
3. **Add sources** to [../SCIENTIFIC/REFERENCES.md](../SCIENTIFIC/REFERENCES.md) first
4. **Update** [../SCIENTIFIC/DETECTORS.md](../SCIENTIFIC/DETECTORS.md) validation table
5. **Add cross-reference** in detector code file (`@see` comment)
6. **Run validation**: `npm run check:features`

---

## Validation Requirements

- **≥2 peer-reviewed sources** OR **≥3 standards/manufacturer sources**
- **ISO GUM** for uncertainty calculations
- **NIST/CIAAW** for isotope data
- **Manufacturer specs** (Pfeiffer, MKS, Inficon) for RGA-specific values
- **Tolerance:** ±5-10% acceptable for RGA measurements

---

**Last Updated:** 2026-01-11
**Migration:** Consolidated from flat FEATURE_1.5.x structure to category-based organization
**Structure:** Mirrors `src/modules/rga/lib/detectors/` code architecture
