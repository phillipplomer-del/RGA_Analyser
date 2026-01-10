# RGA Analyser - Scripts Directory

This directory contains automation scripts for the RGA Analyser project.

## Available Scripts

### Feature Documentation Validation

#### `check-feature-completeness.ts`

Validates that all scientific features are properly documented across the codebase.

**Usage:**
```bash
npm run check:features
```

**What it checks:**
- ✅ Planning files exist for all features
- ✅ Completed features are documented in `SCIENTIFIC_REFERENCES.md`
- ✅ Scientific features have `ValidationMetadata` in `validation.ts`
- ✅ All documentation is discoverable

**Output:**
- ✅ Success: All features properly documented
- ⚠️ Warnings: Missing optional documentation (non-critical)
- ❌ Errors: Critical documentation missing (blocks commits if git hook enabled)

**Watch Mode:**
```bash
npm run check:features:watch
```
Automatically re-runs checks when documentation files change.

---

### Git Hooks Setup

#### `setup-git-hooks.sh`

Installs optional git hooks that enforce documentation completeness.

**Usage:**
```bash
./scripts/setup-git-hooks.sh
```

**What it does:**
- Installs pre-commit hook that runs `npm run check:features`
- Blocks commits if feature documentation is incomplete
- Can be bypassed with `git commit --no-verify` (emergency only)

**To remove:**
```bash
rm .git/hooks/pre-commit
```

---

## Development Workflow

### Adding a New Feature

When implementing a new scientific feature, the validation script ensures you follow the complete workflow:

1. **Phase 1: Planning**
   - Add entry to `FEATURE_BACKLOG.md` (Status: ⬜)
   - Create planning file: `NextFeatures/FEATURE_[ID]_[NAME]_PLAN.md`
   - Create checklist: `NextFeatures/FEATURE_[ID]_CHECKLIST.md`

2. **Phase 2: Validation**
   - Research scientific sources
   - Document in `SCIENTIFIC_REFERENCES.md`

3. **Phase 3: Implementation**
   - Update `FEATURE_BACKLOG.md` (Status: 🔄)
   - Write code
   - Add `ValidationMetadata` to `validation.ts`

4. **Phase 4: Finalization**
   - Update `FEATURE_BACKLOG.md` (Status: ✅)
   - Move planning file to `DOCUMENTATION/ARCHIVED/`
   - Verify `ValidationBadge` appears in UI

5. **Phase 5: Verification**
   - Run `npm run check:features` → Should pass ✅

---

## CI/CD Integration

The validation script can be integrated into CI/CD pipelines:

**Example (GitHub Actions):**
```yaml
- name: Check Feature Documentation
  run: npm run check:features
```

**Example (GitLab CI):**
```yaml
documentation-check:
  script:
    - npm run check:features
```

---

## Troubleshooting

### "Planning file missing" error
- **Cause:** Feature in `FEATURE_BACKLOG.md` but no planning file exists
- **Fix:** Create planning file using template from `DOCUMENTATION/BACKLOG/TEMPLATES/`

### "Feature not found in SCIENTIFIC_REFERENCES.md" warning
- **Cause:** Completed scientific feature lacks source documentation
- **Fix:** Add feature section to `RGA_Knowledge/SCIENTIFIC_REFERENCES.md`

### "ValidationMetadata missing" warning
- **Cause:** Scientific feature may be missing validation metadata
- **Fix:** Add entry to `src/lib/diagnosis/validation.ts` (if it's a detector)
- **Note:** Not all scientific features need `ValidationMetadata` (only detectors)

---

**Last Updated:** 2026-01-10
