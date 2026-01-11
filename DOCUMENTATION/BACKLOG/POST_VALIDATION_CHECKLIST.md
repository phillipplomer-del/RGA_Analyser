# Post-Validation Checklist (After EVERY Detector)

**Purpose:** Systematic verification that all documentation is updated after each detector cross-validation.

**When to use:** Immediately after merging Gemini + Grok reviews for any detector.

---

## 🚨 PRE-FLIGHT CHECK (BEFORE Creating New REVERSE_SPEC)

**KRITISCH:** BEVOR du ein neues REVERSE_SPEC erstellst, MUSST du das Format des letzten validierten Files prüfen!

### Format-Konsistenz Check

1. **Lies das letzte validierte REVERSE_SPEC:**
   ```bash
   # Beispiel: detectOilBackstreaming.md oder detectESDartifacts.md
   Read NextFeatures/REVERSE_SPEC_detectOilBackstreaming.md (Zeilen 108-220)
   ```

2. **Prüfe die Struktur:**
   - [ ] **EINE** "VALIDATION PROMPT (Copy & Paste to Gemini/Grok)" Section (NICHT zwei separate Prompts!)
   - [ ] Prompt ist in markdown code block (```markdown ... ```)
   - [ ] Format: VALIDATION REQUEST → IMPLEMENTATION → VALIDATION QUESTIONS → RESPONSE FORMAT → CONTEXT
   - [ ] Nach Prompt: ## 🤖 Gemini Review, ## 🤖 Grok Review, ## ✅ Merged Validation

3. **Kopiere die Struktur:**
   - Verwende das GLEICHE Format für das neue REVERSE_SPEC
   - Passe nur den Inhalt an (Detector-spezifisch)
   - Token-Ziel: ~1000-1200 (Spec ~700 + Prompt ~400)

**❌ HÄUFIGER FEHLER:**
- Zwei separate Prompts erstellen (eine für Gemini, eine für Grok)
- Format weicht von den anderen 3 Files ab
- User muss zwei verschiedene Prompts kopieren (nervt!)

**✅ RICHTIG:**
- EINE einheitliche Prompt, die für beide AIs funktioniert
- Identisches Format wie detectOilBackstreaming, verifyIsotopeRatios, detectESDartifacts

---

## ✅ Mandatory Steps (EVERY Detector)

### 1. REVERSE_SPEC File
- [ ] Created NextFeatures/REVERSE_SPEC_[detectorName].md
- [ ] Token-efficient format (~1200 tokens)
- [ ] Gemini review section added
- [ ] Grok review section added
- [ ] Merged findings section completed
- [ ] Approval status documented (✅ Unanimous / ⚠️ Conditional / ❌ Rejected)

### 2. CROSS_VALIDATION_STATUS.md
- [ ] Detector status table updated (⬜ → ✅ Complete)
- [ ] Overview counts updated (Completed, Remaining, Approval Status)
- [ ] Detailed section added for detector with:
  - File path and line numbers
  - Reverse-Spec link
  - Physics Doc status
  - Validation results (Gemini, Grok, Approval)
  - Physics Validated items
  - Critical Issues (if Conditional)
  - Sources
  - Status summary
- [ ] "Collected Fixes" section updated (if issues found)
- [ ] Progress Tracking section updated (Week of 2026-01-XX)

### 3. FEATURE_BACKLOG.md
- [ ] Changelog entry added (line ~404+) with format:
  ```
  | YYYY-MM-DD | 🔬 **Cross-Validation Workflow: [detectorName]() VALIDIERT ([STATUS]):**
  [Summary of findings]. **[N] KRITISCHE Fixes:** [List]. Progress: X/8 validiert (Y%) |
  ```
- [ ] Proper status: UNANIMOUS / CONDITIONAL / REJECTED

### 4. .claude/skills/ready.md
- [ ] Cross-Validation Status table row updated:
  - Reverse-Spec: ✅
  - Gemini: ✅
  - Grok: ✅
  - Merged: ✅
  - Physics Doc: ✅ or ⬜
  - Approval: ✅ Unanimous / ⚠️ Conditional / ❌ Rejected
  - Critical Fixes: Count or "None"
- [ ] "Critical Fixes Required" section updated (if Conditional approval)
- [ ] Progress count updated: "X/8 validated (Y%)"

### 5. Physics Documentation (Deferred to Batch at End)
- [ ] NOT created during validation (per user decision 2026-01-11)
- [ ] Will batch-create at end: DOCUMENTATION/PHYSICS/[detectorName].md
- [ ] Format: Zusammenfassung, Modell, Annahmen, Validierung, Referenzen (DE + EN)

---

## 🚨 Before Proceeding to Next Detector

**Verification Question:** "Are all 4 documentation files updated?"

1. ✅ REVERSE_SPEC complete with merged findings?
2. ✅ CROSS_VALIDATION_STATUS.md updated (table + detailed section + fixes)?
3. ✅ FEATURE_BACKLOG.md changelog entry added?
4. ✅ ready.md table and fixes section updated?

**Only proceed if ALL 4 are YES.**

---

## 📋 TodoWrite Template for Each Detector

After receiving Gemini + Grok reviews, create todos:

```typescript
TodoWrite({
  todos: [
    { content: "Merge Gemini + Grok reviews into REVERSE_SPEC", status: "in_progress" },
    { content: "Update CROSS_VALIDATION_STATUS.md (table + section + fixes)", status: "pending" },
    { content: "Add FEATURE_BACKLOG.md changelog entry", status: "pending" },
    { content: "Update ready.md table and fixes section", status: "pending" },
    { content: "Verify all 4 files updated before next detector", status: "pending" }
  ]
})
```

**Mark each as completed immediately after finishing.**

---

## 🔍 Common Mistakes to Avoid

| Mistake | Impact | Prevention |
|---------|--------|------------|
| Forgetting FEATURE_BACKLOG.md | User loses changelog visibility | Use TodoWrite checklist |
| Forgetting ready.md update | Inconsistent status across files | Explicit verification step |
| Incomplete CROSS_VALIDATION_STATUS.md | Missing critical fixes documentation | Check all subsections |
| Skipping verification step | Accumulating oversights | Ask "All 4 files updated?" |

---

## 📊 Progress Tracking

**After each detector validation:**
- Current: X/8 completed (Y%)
- Approval breakdown: N Unanimous, M Conditional, 0 Rejected
- Total CRITICAL fixes: Count across all detectors

**Remaining detectors:**
- detectHeliumLeak
- detectFomblinContamination
- detectPolymerOutgassing
- detectPlasticizerContamination

---

**Template Version:** 1.0
**Last Updated:** 2026-01-11
**User Feedback:** "ich musste die jetzt nach zwei sachen fragen, die wir eigentlich nach jedem schritt machen" → Created this checklist to prevent oversights.
