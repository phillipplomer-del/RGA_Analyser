# Feature Checklist: Progressive Disclosure System

**Feature-ID:** 5.5
**Erstellt:** 2026-01-10
**Status:** ⬜ Geplant

---

## Phase 1: Konzept & Planung

- [x] Feature-Eintrag in FEATURE_BACKLOG.md erstellt (Status: ⬜)
- [x] Planungsdatei erstellt: `NextFeatures/FEATURE_5.5_PROGRESSIVE_DISCLOSURE_SYSTEM_PLAN.md`
- [x] UX-Recherche durchgeführt (3 Quellen: Nielsen Norman Group, IxDF, Microsoft)
- [x] Validierungs-Status festgelegt: - (NICHT WISSENSCHAFTLICH - ist UI/UX)

**Planungsdatei muss enthalten:**
- [x] Ausgangslage / Problem-Beschreibung
- [x] UX-Prinzipien (Drei-Stufen-Modell)
- [x] Geplante Implementierung (5 Schritte)
- [x] Dateien zu ändern (5 Files)
- [x] Geschätzter Aufwand (12h)
- [x] Verifikations-Kriterien (4 Test-Szenarien)

---

## Phase 2: Design-Validierung

- [ ] UX-Patterns recherchiert und validiert
- [ ] Vergleich mit kommerzieller Software:
  - [ ] Hiden MASsoft (Basic/Professional Mode)
  - [ ] MATLAB (Toolbox System)
  - [ ] Photoshop (Essential/Advanced Workspace)
- [ ] Design-Dokument erstellt: `DOCUMENTATION/UX/PROGRESSIVE_DISCLOSURE_STRATEGY.md`
- [ ] Feature-Kategorisierung abgeschlossen (automatic/basic/advanced/expert/contextual)

**Mindest-Anforderungen für "UX-validiert":**
- [ ] ≥3 UX-Authority Quellen (Nielsen Norman, IxDF, etc.)
- [ ] ≥2 Commercial Software Comparisons
- [ ] User Feedback eingeholt (optional, wenn möglich)

---

## Phase 3: Implementation

- [ ] FEATURE_BACKLOG.md Status aktualisiert (⬜ → 🔄)
- [ ] **Phase 1 (MVP - 6h):** Basic/Advanced Toggle
  - [ ] Settings Store erweitert (`analysisMode`)
  - [ ] `useVisibleFeatures` Hook implementiert
  - [ ] DiagnosisPanel conditional rendering
  - [ ] Settings UI (Mode-Switcher)
- [ ] **Phase 2 (Polish - 4h):** Expert Mode
  - [ ] Expert Mode Features kategorisiert
  - [ ] Onboarding Wizard implementiert
  - [ ] Feature Preview Card in Settings
- [ ] **Phase 3 (Optional - 2h):** Feature Discovery
  - [ ] "Unlock more features" Hints
  - [ ] Tooltips für advanced features
  - [ ] "Try Advanced Mode" Suggestions

---

## Phase 4: Testing & Integration

- [ ] Test 1: Basic Mode User (new user sieht nur 3-5 UI-Elemente)
- [ ] Test 2: Mode Switching (Basic → Advanced → Expert)
- [ ] Test 3: Context-Sensitive Features (ESD erscheint automatisch)
- [ ] Test 4: Settings Persistence (Mode bleibt nach Reload)
- [ ] Regression Testing:
  - [ ] Alle bestehenden Features funktionieren in allen Modi
  - [ ] Keine Performance-Einbußen
  - [ ] Keine UI-Breaks

---

## Phase 5: Dokumentation

- [ ] README-CLAUDE.md aktualisiert (Progressive Disclosure Pattern dokumentiert)
- [ ] DOCUMENTATION/UX/PROGRESSIVE_DISCLOSURE_STRATEGY.md finalisiert
- [ ] KnowledgePanel / Help-Sektion ergänzt:
  - [ ] "What's the difference between modes?"
  - [ ] "How to unlock features?"
- [ ] User-facing Beschreibung bilingual (Deutsch/English)

---

## Phase 6: Finalisierung

- [ ] FEATURE_BACKLOG.md Status aktualisiert (🔄 → ✅)
- [ ] Changelog-Eintrag in FEATURE_BACKLOG.md:
  ```
  | 2026-01-XX | ✅ **Progressive Disclosure System (5.5) implementiert:**
  Drei-Stufen-Modell (Basic/Advanced/Expert) reduziert kognitive Belastung.
  User sehen nur relevante Features. |
  ```
- [ ] Planungsdatei nach `DOCUMENTATION/ARCHIVED/` verschoben
- [ ] Design-Dokument in `DOCUMENTATION/UX/` finalisiert
- [ ] Git-Commit mit Message: `feat: add progressive disclosure system (5.5)`

---

## Phase 7: Verification (Post-Implementation Check)

- [ ] Feature in FEATURE_BACKLOG.md auffindbar (Status: ✅)
- [ ] Planungsdatei in `DOCUMENTATION/ARCHIVED/` auffindbar
- [ ] Design-Dokument in `DOCUMENTATION/UX/` auffindbar
- [ ] Settings-UI zeigt Mode-Switcher
- [ ] Onboarding erscheint für neue User
- [ ] Alle Links funktionieren (keine 404s)

---

## Erfolgs-Kriterium

✅ **Feature ist vollständig, wenn:**

1. Alle 7 Phasen abgehakt sind
2. Basic Mode zeigt max. 3-5 UI-Elemente
3. Advanced Mode zeigt 8-12 UI-Elemente
4. Expert Mode zeigt alle 15+ Features
5. Settings persistieren (localStorage)
6. Onboarding-Wizard funktioniert
7. Keine Regressions in Tests

---

**Template-Version:** 1.0
**Letzte Aktualisierung:** 2026-01-10
