# Reverse-Spec: [FUNCTION_NAME]

**Source:** [file.ts:X-Y](../src/path/to/file.ts#LX-LY)
**Status:** ⏳ Awaiting Validation
**Created:** YYYY-MM-DD

---

## Summary (for User)

[1-2 Sätze: Was macht die Funktion? Welches Problem löst sie?]

---

## Logic Extract

### Detection Criteria

| Criterion | Implementation | Threshold | Weight |
|-----------|----------------|-----------|--------|
| [Name] | [Formula/Logic] | [Value/Range] | [0.0-1.0] |

### Key Ratios/Patterns

| Parameter | Formula | Expected | Range | Source |
|-----------|---------|----------|-------|--------|
| [Ratio name] | [m_x/m_y] | [Value] | [Min-Max] | [To check] |

### Code Logic

```typescript
// Kritische Berechnungen hier
if (condition) {
  confidence += weight
}
```

**Confidence Calculation:**
```
confidence = weight1 + weight2 + ...
threshold = X.X
severity = confidence > Y ? 'critical' : 'warning'
```

---

## Validation Questions

**Critical:**
1. [Physik-Frage zu Hauptlogik]
2. [Quellen-Frage zu Konstanten]

**Non-Critical:**
3. [Edge-Case-Frage]
4. [Improvement-Frage]

---

## Sources to Check

- [ ] NIST: [Was prüfen?]
- [ ] Standard/Handbook: [Was prüfen?]
- [ ] Literature: [Was prüfen?]

---

## Known Gaps

- [Feature X.Y.Z wird dies lösen]
- [Noch zu implementieren]

---

## VALIDATION PROMPT (Copy & Paste to Gemini/Grok)

```markdown
# VALIDATION REQUEST: [FUNCTION_NAME]

**Task:** Validate physical model, mathematical correctness, and implementation logic.

---

## IMPLEMENTATION ([file.ts:X-Y])

**Purpose:** [1 sentence]

**Detection Logic:**

| Parameter | Code Value | Formula | Purpose |
|-----------|-----------|---------|---------|
| [Param 1] | [Value] | [Formula if any] | [Why?] |
| [Param 2] | [Value] | [Formula] | [Why?] |

**Confidence Calculation:**
```
IF [condition 1]: +XX%
IF [condition 2]: +YY%
Total: ZZ%
Threshold: AA%
```

**Severity:** `confidence > 0.X ? 'critical' : 'warning'`

---

## VALIDATION QUESTIONS

### Critical

1. **[Physics Question]:** Is [parameter/ratio/pattern] physically correct for [application]?
2. **[Source Question]:** What is the authoritative source for [value]?
3. **[Logic Question]:** Is [threshold/range] appropriate?

### Non-Critical

4. **[Edge Case]:** Missing check for [scenario]?
5. **[Improvement]:** Should add [feature]?

---

## RESPONSE FORMAT (REQUIRED)

**⚠️ IMPORTANT: Use TABLES ONLY. No prose. Keep under 500 tokens. ⚠️**

### Validation Table

| Parameter | Code Value | Correct? | Should Be | Source |
|-----------|-----------|----------|-----------|--------|
| [Param 1] | [value] | ✅/❌/⚠️ | [correction if needed] | [citation] |
| [Param 2] | [value] | ✅/❌/⚠️ | [correction] | [citation] |

### Critical Issues

- **Issue 1:** [Description] → [Fix + Source]
- **Issue 2:** [Description] → [Fix + Source]

### Recommended Changes

1. **[Change 1]:** [Reason] ([Authoritative Source])
2. **[Change 2]:** [Reason] ([Source])

### Missing Checks

- **[Missing feature]:** [Why it matters] ([Source])

### Approval Status

**✅ APPROVED** / **❌ REJECTED** / **⚠️ CONDITIONAL**

**Summary (1 sentence):** [Overall assessment of physical validity and implementation correctness]

---

## CONTEXT: RGA Application

**Target Audience:**
- **RGA practitioners** (vacuum technicians, process engineers) - NOT theoretical physicists
- **Offline desktop tool** for quick spectrum analysis (no cloud, no lab instruments)
- **Goal:** Practical diagnostics for vacuum systems, not academic research

**Technical Environment:**
- **Instrument:** Quadrupole RGA, 70 eV electron impact ionization
- **Standards:** NIST fragmentation patterns, vacuum industry best practices

**Validation Scope:**
- Focus on **practical accuracy** for field use (not ultra-high precision research)
- Thresholds should be **robust** (tolerate instrument-to-instrument variation)
- False positives worse than false negatives (avoid alarm fatigue for users)

---

**Expected Response Length:** <500 tokens
```

---

**Template Version:** 1.0 (Token-Efficient)
**Target Token Count:** ~1000 (Spec ~650 + Prompt ~400)

---

## 🤖 Gemini Review

**Status:** ⏳ Awaiting Response

*Paste Gemini's response here (including all tables)*

---

## 🤖 Grok Review

**Status:** ⏳ Awaiting Response

*Paste Grok's response here (including all tables)*

---

## ✅ Merged Validation (Claude)

**Status:** ⏳ Pending (after both reviews complete)

*Claude will merge both reviews here*
