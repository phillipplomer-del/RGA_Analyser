# Claude Code - Quick Reference for RGA Analyser

> **For AI Assistant:** This file provides quick reference for working with the RGA Analyser codebase.

---

## 🎯 Before You Start

**ALWAYS read these first:**

1. **[.claude/project-context.md](.claude/project-context.md)** - Full project context
2. **[RGA_Knowledge/SCIENTIFIC_REFERENCES.md](RGA_Knowledge/SCIENTIFIC_REFERENCES.md)** ⭐ PRIMARY REFERENCE for scientific validation
3. **[DOCUMENTATION/BACKLOG/FEATURE_BACKLOG.md](DOCUMENTATION/BACKLOG/FEATURE_BACKLOG.md)** - Current priorities

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

### ✅ Adding New Scientific Feature (MANDATORY WORKFLOW)

**IMPORTANT:** ALL scientific features MUST follow this workflow to prevent information loss.

```
□ Phase 1: Konzept
  □ Create entry in FEATURE_BACKLOG.md (Status: ⬜, 🔬 Validiert?: leer)
  □ Copy TEMPLATES/FEATURE_PLAN_TEMPLATE.md → NextFeatures/FEATURE_[ID]_[NAME]_PLAN.md
  □ Copy TEMPLATES/FEATURE_CHECKLIST.md → NextFeatures/FEATURE_[ID]_CHECKLIST.md

□ Phase 2: Wissenschaftliche Validierung
  □ Research scientific sources (≥2 peer-reviewed OR ≥3 standards/manufacturer)
  □ Add section to SCIENTIFIC_REFERENCES.md with sources + limitations
  □ Update planning file with validation results
  □ Update FEATURE_BACKLOG.md: 🔬 Validiert? = ✅ (fully validated) or ⚠️ (partially validated)

□ Phase 3: Implementation
  □ Update FEATURE_BACKLOG.md (⬜ → 🔄)
  □ Implement code
  □ Add ValidationMetadata to src/lib/diagnosis/validation.ts

□ Phase 4: Finalization
  □ Update FEATURE_BACKLOG.md (🔄 → ✅)
  □ Add changelog entry to FEATURE_BACKLOG.md
  □ Move planning file to DOCUMENTATION/ARCHIVED/
  □ Verify ValidationBadge visible in KnowledgePanel
  □ Run `npm run check:features` to verify completeness

□ Phase 5: Verification
  □ Run through FEATURE_CHECKLIST.md
  □ All links working
  □ Feature discoverable in all locations
  □ CLI check passes without errors
```

**File Locations Quick Reference:**
- Planning (Single Feature): `NextFeatures/FEATURE_[ID]_[NAME]_PLAN.md`
- Planning (Multi-Feature System): `NextFeatures/[SYSTEM_NAME]_SPEC.md` (z.B. LeaksearchPlanner_MasterV7_COMPLETE.md)
- Checklist: `NextFeatures/FEATURE_[ID]_CHECKLIST.md`
- Sources: `RGA_Knowledge/SCIENTIFIC_REFERENCES.md`
- Validation: `src/lib/diagnosis/validation.ts`
- Backlog: `DOCUMENTATION/BACKLOG/FEATURE_BACKLOG.md`
- Templates: `DOCUMENTATION/BACKLOG/TEMPLATES/`
- Archived: `DOCUMENTATION/ARCHIVED/` (abgeschlossene Features)

### 🔬 Validation Status System

**FEATURE_BACKLOG.md** has a "🔬 Validiert?" column with 4 levels:

| Status | Bedeutung | Verwendung |
|--------|-----------|------------|
| ✅ | **Vollständig validiert** | Wissenschaftliche Features mit dokumentierten Quellen in SCIENTIFIC_REFERENCES.md |
| ⚠️ | **Teilvalidiert** | Grundquellen vorhanden, weitere Recherche empfohlen |
| - | **Nicht wissenschaftlich** | UI/UX/Infrastruktur-Features ohne wissenschaftliche Komponente |
| (leer) | **Ausstehend** | Noch nicht validiert (geplante Features) |

**CLI Validation Check:**
```bash
npm run check:features
```
Prüft automatisch:
- Wissenschaftliche Features (✅) haben Einträge in SCIENTIFIC_REFERENCES.md
- Abgeschlossene wissenschaftliche Features haben Validierungs-Status
- Infrastructure-Features sind mit "-" markiert
- Planning-Files existieren
- ValidationMetadata in validation.ts vorhanden (für Detektoren)

**Regel:** Features mit Status ✅ und 🔬 Validiert? = ✅ sind **Implementation-Ready**.

---

## 🔍 Where to Find Things

| Need | Location |
|------|----------|
| **Scientific sources** | RGA_Knowledge/SCIENTIFIC_REFERENCES.md |
| **Gas properties** | src/lib/knowledge/gasLibrary.ts |
| **Isotope ratios** | src/lib/knowledge/isotopePatterns.ts |
| **Diagnostic algorithms** | src/lib/diagnosis/detectors.ts |
| **Feature planning** | DOCUMENTATION/BACKLOG/FEATURE_BACKLOG.md |
| **Feature templates** | DOCUMENTATION/BACKLOG/TEMPLATES/ |
| **UI components** | src/components/ |

---

## 🚀 Current Priorities (2026-01-10)

1. ✅ Knowledge Management System implemented (DONE)
2. ✅ Scientific validation documented (DONE)
3. ✅ Validation tracking system in FEATURE_BACKLOG.md (DONE)
4. ⏭️ Next: Ready for parallel feature implementation with agents

**Implementation-Ready Features:**
- All features with Status ✅ and 🔬 Validiert? ✅ can be implemented
- Use `npm run check:features` to verify completeness
- See [FEATURE_BACKLOG.md](DOCUMENTATION/BACKLOG/FEATURE_BACKLOG.md) for details

---

## 🤝 Working with Users

- Users are **scientists/engineers** working with vacuum systems
- Precision matters: Always cite sources (NIST, CIAAW, etc.)
- Bilingual: German + English in all user-facing text
- When unsure: Check SCIENTIFIC_REFERENCES.md → Web search → Ask user

---

**Last Updated:** 2026-01-10 (Validation tracking system added)
