---
name: status
description: Show project status with all features and their current state
---

# RGA Analyser Project Status

You need to provide a comprehensive overview of the project's feature status.

## Instructions

1. **Read FEATURE_BACKLOG.md** (entire file)
2. **Parse all features** from the markdown tables
3. **Generate status report** with the following structure:

## Report Format

```
# 📊 RGA Analyser Project Status

## Overview
- Total Features: X
- ⬜ Planned: X
- 🔄 In Progress: X
- ✅ Completed: X
- ⏸️ Paused: X
- ❌ Rejected: X

## 🔬 Validation Status (Scientific Features)
- ✅ Fully validated: X
- ⚠️ Partially validated: X
- (empty) Pending validation: X
- (Non-scientific features not counted)

## Feature List by Status

### ✅ Completed (X)
| ID | Feature | 🔬 Validated? | Spec |
|----|---------|---------------|------|
| 0.1 | RSF-Korrekturen | ✅ | IMPLEMENTATION_SPEC.md |
| ... | ... | ... | ... |

### 🔄 In Progress (X)
| ID | Feature | 🔬 Validated? | Spec |
|----|---------|---------------|------|
| ... | ... | ... | ... |

### ⬜ Planned (X)
| ID | Feature | 🔬 Validated? | Spec |
|----|---------|---------------|------|
| ... | ... | ... | ... |

### ⏸️ Paused (X)
| ID | Feature | 🔬 Validated? | Spec |
|----|---------|---------------|------|
| ... | ... | ... | ... |

### ❌ Rejected (X)
| ID | Feature | 🔬 Validated? | Spec |
|----|---------|---------------|------|
| ... | ... | ... | ... |

## 🎯 Implementation-Ready Features
Features with Status ✅ AND 🔬 Validated? ✅:

- [ID] Feature Name
- [ID] Feature Name
...

Total: X features ready for implementation

## 📋 Next Steps
Run `npm run check:features` to verify documentation completeness.
```

## Important Notes

- **Group features by status** (✅, 🔄, ⬜, ⏸️, ❌)
- **Show all features** in each group
- For **completed features**, highlight which are **Implementation-Ready** (Status ✅ + 🔬 ✅)
- Use **tables** for better readability
- Include **feature IDs** for easy reference
- Show **validation status** (🔬 column) for all features
- Keep it **concise but complete** - user should see everything at a glance

## After generating the report

End with: "Use `/prime` to load full context or ask me what you'd like to work on next!"
