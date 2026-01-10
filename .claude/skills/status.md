---
name: status
description: Show implementation readiness for all features
---

# RGA Analyser Implementation Readiness Report

You need to provide an action-oriented overview showing what's missing to implement each feature.

## Instructions

1. **Read FEATURE_BACKLOG.md** (entire file)
2. **Parse all features** from markdown tables (extract: ID, name, status, validationStatus, specFile)
3. **Check file existence:**
   - Spec files: NextFeatures/, DOCUMENTATION/ARCHIVED/, or paths in FEATURE_BACKLOG.md
   - Plan files: NextFeatures/FEATURE_[ID]_*_PLAN.md
4. **Generate compact readiness table** with the following structure:

## Report Format

```
# 🎯 RGA Analyser - Implementation Readiness Report

## Summary
- Total Features: X
- ✅ Implemented (in App): X
- 🎯 Implementation-Ready: X
- ⚠️ Needs Work: X

## Implementation Readiness Table

| Feature | ✅ Impl | 🎯 Ready | 📄 Spec | 🔬 Valid | 📋 Plan | Notes |
|---------|---------|----------|---------|----------|---------|-------|
| 0.1 RSF-Korrekturen | ✅ | - | ✅ | ✅ | ✅ | Implemented ✓ |
| 1.5.8 Pfeiffer-Kalibrierung | ❌ | ❌ | ✅ | ❌ | ❌ | Missing: Validation, Plan |
| 1.6.1 Core Engine | ❌ | ✅ | ✅ | - | ✅ | Ready to implement! |
| 1.9.1 Kinetic Fingerprinting | ❌ | ❌ | ✅ | ❌ | ❌ | Missing: Validation, Plan |
| ... | ... | ... | ... | ... | ... | ... |

**Legend:**
- **Impl** = Implemented (Status ✅ in FEATURE_BACKLOG.md)
- **Ready** = Implementation-Ready (all prerequisites met)
- **Spec** = Spec file exists
- **Valid** = Scientific validation (🔬 column: ✅ fully, ⚠️ partial, - not needed, ❌ missing)
- **Plan** = Planning file exists in NextFeatures/

## 🎯 Ready to Implement (Priority)

These features have all prerequisites and can be implemented now:

1. **[ID] Feature Name** - [estimated effort]
2. **[ID] Feature Name** - [estimated effort]
...

Total: X features ready

## ⚠️ Needs Attention

Features missing prerequisites (grouped by what's missing):

### Missing Validation (Scientific Features)
- [ID] Feature Name - has Spec ✅, needs Validation
- ...

### Missing Plan File
- [ID] Feature Name - has Spec ✅, Validation ✅, needs Plan
- ...

### Missing Both
- [ID] Feature Name - needs Validation + Plan
- ...

## Next Steps
Run `npm run check:features` to verify documentation completeness.
```

## Important Logic

### Determining "Implementation-Ready" (🎯 Ready column)

**For Scientific Features (0.x, 1.5.x, 1.8.x, 1.9.x, 3.x):**
```
✅ Ready = Spec exists ✅ + 🔬 Validated ✅ + Plan exists ✅
❌ Not Ready = Missing any of the above
```

**For Non-Scientific Features (1.6.x, 1.7.x, 2.x, 4.x, 5.x, 6.x):**
```
✅ Ready = Spec exists ✅ + 🔬 Validated - (marked as not scientific) + Plan exists ✅
❌ Not Ready = Missing any of the above
```

**For Implemented Features (Status ✅):**
```
🎯 Ready = "-" (already implemented, not relevant)
```

### File Existence Checks

**Spec File:**
- Check path from FEATURE_BACKLOG.md [spec.md](path/to/spec.md)
- Try: NextFeatures/, DOCUMENTATION/ARCHIVED/, direct paths

**Plan File:**
- Pattern: NextFeatures/FEATURE_[ID]_*_PLAN.md
- Example: FEATURE_1.5.8_PFEIFFER_KALIBRIERUNG_PLAN.md
- Use Glob to find matching files

### Notes Column Content

**Examples:**
- "Implemented ✓" - if Status ✅
- "Ready to implement!" - if 🎯 Ready ✅
- "Missing: Validation" - if only validation missing
- "Missing: Plan" - if only plan missing
- "Missing: Validation, Plan" - if both missing
- "Missing: Spec" - if spec file not found
- "" - leave empty for basic planned features (⬜)

## Output Guidelines

- **Focus on action:** What's blocking implementation?
- **Be concise:** One table, clear notes
- **Prioritize:** Show ready-to-implement features first
- **Skip rejected features** (❌ status) unless user asks
- **Group "Needs Attention"** by what's missing for easy planning

## After generating the report

End with: "What would you like to work on next? Use 'prime' for full context."
