# RGA Analyser - Claude Code Project Context

> **Purpose:** This file provides Claude Code with project-specific context, references, and guidelines for working with the RGA Analyser codebase.

---

## 🎯 Project Overview

**RGA Analyser** is a scientific web application for analyzing Residual Gas Analyzer (RGA) mass spectrometry data from vacuum systems. Used in:
- UHV research facilities (CERN, GSI, DESY)
- Semiconductor manufacturing
- Fusion research (tokamaks)
- Thin-film deposition systems

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS

---

## 📚 Primary Documentation References

### When Validating Scientific Data

**ALWAYS check these sources first:**

1. **[RGA_Knowledge/SCIENTIFIC_REFERENCES.md](../RGA_Knowledge/SCIENTIFIC_REFERENCES.md)** ⭐ PRIMARY REFERENCE
   - All isotope ratios validated against NIST/CIAAW
   - Peer-reviewed RGA applications (fusion, medical, environmental)
   - Direct URLs to scientific sources
   - Method validation & limitations

2. **[RGA_Knowledge/KNOWLEDGE_DATABASE_OVERVIEW.md](../RGA_Knowledge/KNOWLEDGE_DATABASE_OVERVIEW.md)**
   - Codebase structure overview
   - Gas library (~50 species)
   - Mass reference (m/z 1-100)
   - Diagnosis algorithms (20 types)

3. **Implementation Specs:**
   - [NextFeatures/IMPLEMENTATION_SPEC.md](../NextFeatures/IMPLEMENTATION_SPEC.md) - RSF corrections, new gases
   - [NextFeatures/RGA_APP_VERBESSERUNGEN.md](../NextFeatures/RGA_APP_VERBESSERUNGEN.md) - Scientific features

---

## 🔬 Scientific Standards

### Isotope Ratio Validation Protocol

Before implementing or modifying isotope ratios:

1. **Check:** [SCIENTIFIC_REFERENCES.md](../RGA_Knowledge/SCIENTIFIC_REFERENCES.md) - Section "Validated Isotope Ratios"
2. **Verify:** Values match NIST/CIAAW (tolerance ±5-10% for quadrupole RGA)
3. **Document:** Source + precision in code comments
4. **Update:** Knowledge Panel (src/components/KnowledgePanel/index.tsx - ReferencesTab)

**Example - Validated Isotopes:**
- Ar: ⁴⁰Ar/³⁶Ar = 295.5 (Nier 1950) or 298.6 (Lee 2006) ✓
- Cl: ³⁵Cl/³⁷Cl = 3.13 (SMOC Standard) ✓
- N: ¹⁴N (99.632%), ¹⁵N (0.368%) ✓

---

## 🏗️ Code Organization

### Key Directories

```
src/lib/
├── knowledge/           # Gas library, isotope patterns, mass reference
│   ├── gasLibrary.ts    # ~50 validated gas species
│   ├── massReference.ts # m/z 1-100 assignments
│   ├── isotopePatterns.ts # Isotope ratios + fragment patterns
│   └── outgassingRates.ts # 17 materials
├── diagnosis/           # 20 diagnostic algorithms
│   ├── detectors.ts     # Implementation
│   ├── types.ts         # TypeScript types
│   └── confidenceScore.ts # Data quality scoring
└── utils/               # Helpers

RGA_Knowledge/           # Documentation + AI knowledge bases
├── SCIENTIFIC_REFERENCES.md ⭐ PRIMARY REFERENCE
├── KNOWLEDGE_DATABASE_OVERVIEW.md
├── RGA_ChatGPT.md      # Gas library research
├── RGA_CLAUDE.md       # Diagnostic algorithms
├── RGA_GEMINI.md       # Limit specifications
└── RGA_Grok.md         # Troubleshooting

NextFeatures/            # Feature specs + backlog
├── FEATURE_BACKLOG.md  # Master planning document
└── *.md                # Individual feature specs
```

---

## 🚫 Common Pitfalls to Avoid

### DO NOT

1. ❌ **Add isotope ratios without NIST/CIAAW validation**
   - Check SCIENTIFIC_REFERENCES.md first
   - Document source in code comments

2. ❌ **Modify RSF (Relative Sensitivity Factors) without references**
   - RSF values are from Pfeiffer/NIST calibrations
   - See gasLibrary.ts - each gas has `relativeSensitivity` field

3. ❌ **Create new diagnoses without evidence**
   - All 20 diagnoses are based on CERN/Pfeiffer/MKS guidelines
   - See src/lib/diagnosis/detectors.ts for patterns

4. ❌ **Assume CO₂ when seeing m/z 44**
   - Could be N₂O (requires NO⁺ fragment check at m/z 30)
   - See SCIENTIFIC_REFERENCES.md - "N₂O Overlaps"

---

## 🔍 Research Workflow

### When User Asks to Validate Scientific Data

**Step 1:** Check local knowledge base
```
1. SCIENTIFIC_REFERENCES.md (isotopes, peer-reviewed sources)
2. isotopePatterns.ts (implementation)
3. gasLibrary.ts (gas properties)
```

**Step 2:** If not found, web search
```
- Search: "NIST [element] isotope abundance"
- Search: "[compound] mass spectrum NIST webbook"
- Search: "RGA [application] peer reviewed"
```

**Step 3:** Document findings
```
- Add to SCIENTIFIC_REFERENCES.md
- Update KnowledgePanel/index.tsx (ReferencesTab)
- Cite source in code comments
```

---

## 🎨 UI Conventions

### Icons
- Use **Heroicons** for UI elements (not emojis) - except in Knowledge Panel where emojis are acceptable
- Diagnoses use emoji for visual distinction (🌬️ Air Leak, 🛢️ Oil, etc.)

### Colors (Tailwind)
- `aqua-500` - Primary brand color
- `red-500` - Critical issues (leaks)
- `yellow-500` - Warnings (contamination)
- `green-500` - Good state (validated data)
- `blue-500` - Info

### Bilingual Support
- All user-facing text: German + English
- Use `isGerman` flag from i18n
- Knowledge Panel: fully bilingual

---

## 📊 Feature Status (from FEATURE_BACKLOG.md)

### ✅ Completed (2026-01)
- Isotope analysis (10 elements)
- Outgassing simulator (17 materials)
- Confidence score system (6 factors)
- ESD artifact detection (6 criteria)
- Leak search planner demo

### 🔄 In Progress
- Error handling framework
- Knowledge Panel scientific validation (DONE 2026-01-09)

### ⏭️ Next
- D₂/HD/N₂O gas implementation
- PDMS detection enhancement (m/z 59)
- Leak search planner full version

---

## 🤖 AI Collaboration Notes

### When to Use Task Tool
- Complex multi-file searches
- Open-ended research ("How does X work?")
- Planning multi-step implementations

### When to Use Direct Tools
- Specific file reads (Read tool)
- Targeted searches (Grep for "class Foo")
- File modifications (Edit/Write)

---

## 📝 Git Commit Guidelines

**Format:**
```
type: Short description

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code restructuring
- `test:` Tests
- `chore:` Maintenance

---

## 🔗 External Resources

- **NIST WebBook:** https://webbook.nist.gov (mass spectra)
- **CIAAW:** https://ciaaw.org (atomic weights)
- **Pfeiffer Vacuum:** RGA Know-How Book
- **CERN Vacuum Group:** Technical notes

---

**Last Updated:** 2026-01-09
