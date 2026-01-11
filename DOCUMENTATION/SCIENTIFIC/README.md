# Scientific Knowledge Base - RGA Analyser

This directory contains the master scientific knowledge base for the RGA Analyser project, including validation sources, detector documentation, and scientific methodologies.

---

## Core Scientific References

### [REFERENCES.md](./REFERENCES.md)
**Master Scientific Reference Collection** (103+ validated sources)

Contains all scientific validation sources used throughout the project:
- Isotope standards (NIST, CIAAW)
- RGA applications and methodologies
- Uncertainty propagation (ISO GUM)
- Robust regression techniques
- Statistical methods
- Manufacturer specifications (Pfeiffer, MKS, Inficon)
- Peer-reviewed publications

**This is the single source of truth for all scientific citations.**

---

## Detector Validation

### [DETECTORS.md](./DETECTORS.md)
Master validation table for all 22 detectors with cross-validation status (Gemini + Grok).

### [VALIDATION_MASTERPLAN.md](./VALIDIERUNG_MASTERPLAN.md)
3-phase validation strategy for detector development:
1. Reverse specification from existing code
2. Multi-AI cross-validation
3. Physics documentation

### [CROSS_VALIDATION_WORKFLOW.md](CROSS_VALIDATION_WORKFLOW.md)
Multi-AI validation workflow using Gemini and Grok for detector physics verification.

---

## Scientific Methodologies

### [CALCULATIONS.md](./CALCULATIONS.md)
Uncertainty propagation and statistical calculations:
- Measurement uncertainty (ISO GUM framework)
- Error propagation formulas
- Confidence intervals
- Statistical significance testing

### [CRACKING_PATTERNS.md](./CRACKING_PATTERNS.md)
Electron impact (EI) fragmentation patterns at 70 eV:
- Common fragmentation pathways
- Fragment ion intensities
- Isotope patterns
- Mass spectrometry fundamentals

---

## Related Documentation

### Physics Documentation
For detailed physics documentation on each detector, see:
- **[../PHYSICS/](../PHYSICS/)** - Category-organized detector physics

### Feature Planning
For feature specifications and planning:
- **[../BACKLOG/FEATURE_BACKLOG.md](../BACKLOG/FEATURE_BACKLOG.md)** - Master feature tracker
- **[../BACKLOG/CROSS_VALIDATION_STATUS.md](../BACKLOG/CROSS_VALIDATION_STATUS.md)** - Detector validation progress

### Data Files
For raw data files (isotope data, RSF values, gas properties):
- **[../../RGA_Knowledge/](../../RGA_Knowledge/)** - Data files and mappings

---

## Validation Status System

All scientific features use a validation status system:

| Status | Meaning | Requirements |
|--------|---------|-------------|
| ✅ | Fully validated | ≥2 peer-reviewed OR ≥3 standards/manufacturer sources |
| ⚠️ | Partially validated | Basic sources present, more research recommended |
| - | Not scientific | UI/UX/Infrastructure features (no validation needed) |
| (empty) | Pending | Not yet validated (planned features) |

---

## Citation Standards

When adding new scientific content:

1. **Always cite sources** - Add to REFERENCES.md first
2. **Prefer authoritative sources**:
   - NIST (National Institute of Standards and Technology)
   - CIAAW (Commission on Isotopic Abundances and Atomic Weights)
   - ISO standards
   - Peer-reviewed journals (Vacuum, JVST, etc.)
3. **Manufacturer data** - Pfeiffer, MKS, Inficon manuals and application notes
4. **Tolerance** - ±5-10% is acceptable for RGA measurements
5. **Bilingual** - German and English for all user-facing documentation

---

## Contributing

Before implementing scientific features:

1. Research ≥2 peer-reviewed OR ≥3 standards/manufacturer sources
2. Add sources to [REFERENCES.md](./REFERENCES.md)
3. Update validation status in [FEATURE_BACKLOG.md](../BACKLOG/FEATURE_BACKLOG.md)
4. Create physics documentation in appropriate category under [../PHYSICS/](../PHYSICS/)
5. Run validation CLI: `npm run check:features`

---

**Last Updated:** 2026-01-11
**Total Sources:** 103+ validated scientific references
**Validation Coverage:** All 22 detectors documented with cross-validation status
