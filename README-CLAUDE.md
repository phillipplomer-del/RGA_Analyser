# Claude Code - Quick Reference for RGA Analyser

> **For AI Assistant:** This file provides quick reference for working with the RGA Analyser codebase.

---

## 🎯 Before You Start

**ALWAYS read these first:**

1. **[.claude/project-context.md](.claude/project-context.md)** - Full project context
2. **[RGA_Knowledge/SCIENTIFIC_REFERENCES.md](RGA_Knowledge/SCIENTIFIC_REFERENCES.md)** ⭐ PRIMARY REFERENCE for scientific validation
3. **[NextFeatures/FEATURE_BACKLOG.md](NextFeatures/FEATURE_BACKLOG.md)** - Current priorities

---

## 📋 Quick Checklists

### ✅ Validating Scientific Data

```
□ Check SCIENTIFIC_REFERENCES.md first
□ Compare against NIST/CIAAW values
□ Verify tolerance (±5-10% for RGA is OK)
□ Document source in code comments
□ Update KnowledgePanel if user-facing
```

### ✅ Adding New Gas

```
□ Check NIST WebBook for cracking pattern
□ Verify RSF (Relative Sensitivity Factor)
□ Add to src/lib/knowledge/gasLibrary.ts
□ Update src/lib/knowledge/massReference.ts
□ Add to SCIENTIFIC_REFERENCES.md if novel
```

### ✅ Modifying Isotope Ratios

```
□ Read SCIENTIFIC_REFERENCES.md validation section
□ Confirm NIST/CIAAW match
□ Update src/lib/knowledge/isotopePatterns.ts
□ Update KnowledgePanel/index.tsx (ReferencesTab)
□ Document source + precision
```

---

## 🔍 Where to Find Things

| Need | Location |
|------|----------|
| **Scientific sources** | RGA_Knowledge/SCIENTIFIC_REFERENCES.md |
| **Gas properties** | src/lib/knowledge/gasLibrary.ts |
| **Isotope ratios** | src/lib/knowledge/isotopePatterns.ts |
| **Diagnostic algorithms** | src/lib/diagnosis/detectors.ts |
| **Feature planning** | NextFeatures/FEATURE_BACKLOG.md |
| **UI components** | src/components/ |

---

## 🚀 Current Priorities (2026-01-09)

1. ✅ Scientific validation documented (DONE)
2. ⏭️ Implement D₂/HD/N₂O gases
3. ⏭️ Enhance PDMS detection (add m/z 59)
4. ⏭️ Error handling framework

See [FEATURE_BACKLOG.md](NextFeatures/FEATURE_BACKLOG.md) for details.

---

## 🤝 Working with Users

- Users are **scientists/engineers** working with vacuum systems
- Precision matters: Always cite sources (NIST, CIAAW, etc.)
- Bilingual: German + English in all user-facing text
- When unsure: Check SCIENTIFIC_REFERENCES.md → Web search → Ask user

---

**Last Updated:** 2026-01-09
