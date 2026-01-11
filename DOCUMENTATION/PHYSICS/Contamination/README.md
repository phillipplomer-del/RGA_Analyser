# Contamination Detection - Physics Documentation

Physics documentation for contamination detection algorithms in RGA spectra analysis.

---

## Subcategories (5)

### [Oils/](./Oils/) - Oil-Based Contamination (1 detector)
- Pump oil backstreaming detection

### [Polymers/](./Polymers/) - Polymer Outgassing (3 detectors)
- Generic polymer outgassing
- Phthalate plasticizers
- Silicone contamination

### [Fluorinated/](./Fluorinated/) - PFPE/Fomblin (1 detector)
- Perfluoropolyether (Fomblin, Krytox) contamination

### [Solvents/](./Solvents/) - Organic Solvents (2 detectors)
- Generic solvent residues
- Chlorinated solvents

### [Aromatics/](./Aromatics/) - Aromatic Compounds (1 detector)
- Benzene and aromatic derivatives

---

## Overview

Contamination detection is the largest detector category with 8 specialized detectors organized into 5 subcategories. These detectors identify specific contaminant sources in vacuum systems, critical for maintaining UHV conditions and preventing process contamination.

---

## Common Contamination Sources

1. **Pump Oils** - Backstreaming from rotary vane and diffusion pumps
2. **Polymers** - O-rings, seals, gaskets, cable insulation
3. **PFPE** - High-performance lubricants (Fomblin, Krytox)
4. **Solvents** - Cleaning agent residues
5. **Aromatics** - Adhesives, coatings, outgassing materials

---

## Detection Principles

Most contamination detectors use characteristic fragmentation patterns:

- **Heavy hydrocarbon series** (m/z 43, 57, 71, 85...) - Oil backstreaming
- **Fluorocarbon fragments** (m/z 31, 47, 50, 69) - PFPE contamination
- **Aromatic ions** (m/z 77, 78, 91, 92) - Benzene derivatives
- **Phthalate markers** (m/z 149, 167) - Plasticizers

---

## Scientific References

All detectors reference the master scientific collection:
**[../../SCIENTIFIC/REFERENCES.md](../../SCIENTIFIC/REFERENCES.md)**

---

**Category:** Contamination
**Total Detectors:** 8
**Validated:** 4 (50%)
**Pending:** 4 (50%)
