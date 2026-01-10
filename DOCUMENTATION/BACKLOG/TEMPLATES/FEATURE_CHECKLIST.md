# Feature Checklist: [FEATURE_NAME]

**Feature-ID:** [z.B. 1.5.7]
**Erstellt:** [Datum]
**Status:** ⬜ Geplant / 🔄 In Arbeit / ✅ Abgeschlossen

---

## Phase 1: Konzept & Planung

- [ ] Feature-Eintrag in FEATURE_BACKLOG.md erstellt (Status: ⬜)
- [ ] Planungsdatei erstellt: `NextFeatures/FEATURE_[ID]_[NAME]_PLAN.md`
- [ ] Wissenschaftliche Recherche durchgeführt (≥2 Quellen)
- [ ] Validierungs-Status festgelegt (FULLY/PARTIALLY/NOT_VALIDATED)

**Planungsdatei muss enthalten:**
- [ ] Ausgangslage / Problem-Beschreibung
- [ ] Wissenschaftliche Grundlage
- [ ] Geplante Implementierung
- [ ] Dateien zu ändern
- [ ] Geschätzter Aufwand
- [ ] Verifikations-Kriterien

---

## Phase 2: Wissenschaftliche Validierung

- [ ] Quellen recherchiert und bewertet (Peer-reviewed > Standards > Hersteller)
- [ ] Sektion in SCIENTIFIC_REFERENCES.md erstellt mit:
  - [ ] Status-Badge (✅ VALIDIERT / ⚠️ TEILVALIDIERT / ❓ NICHT VALIDIERT)
  - [ ] Mindestens 2 Quellen dokumentiert (URL + Beschreibung)
  - [ ] Implementierungs-Details (Schwellenwerte, Algorithmen)
  - [ ] Bekannte Limitationen dokumentiert
- [ ] Planungsdatei mit Validierungs-Ergebnissen aktualisiert

**Mindest-Anforderungen für "Vollständig validiert":**
- [ ] ≥2 Peer-reviewed Quellen ODER
- [ ] ≥1 Peer-reviewed + ≥2 Standards/Hersteller ODER
- [ ] ≥3 Standards/Hersteller Quellen

---

## Phase 3: Implementation

- [ ] FEATURE_BACKLOG.md Status aktualisiert (⬜ → 🔄)
- [ ] Code implementiert (Datei: __________________)
- [ ] ValidationMetadata in `src/lib/diagnosis/validation.ts` hinzugefügt:
  - [ ] `validated: true/false`
  - [ ] `confidence: 'high'/'medium'/'low'`
  - [ ] `sources: [...]` (3-5 wichtigste URLs)
  - [ ] `lastValidated: 'YYYY-MM-DD'`
  - [ ] `notes: '...'` (Deutsch, Kernaussage + Limitationen)
- [ ] Tests geschrieben (falls Test-Suite existiert)

---

## Phase 4: Dokumentation & UI-Integration

- [ ] SCIENTIFIC_REFERENCES.md finalisiert (alle Quellen dokumentiert)
- [ ] KnowledgePanel automatisch aktualisiert (über validation.ts)
  - [ ] ValidationBadge zeigt korrekten Status
  - [ ] Quellen sind klickbar
  - [ ] Notizen sind sichtbar
- [ ] User-facing Beschreibung bilingual (Deutsch/English)

---

## Phase 5: Finalisierung

- [ ] FEATURE_BACKLOG.md Status aktualisiert (🔄 → ✅)
- [ ] Changelog-Eintrag in FEATURE_BACKLOG.md hinzugefügt:
  ```
  | YYYY-MM-DD | ✅ **[Feature-Name] abgeschlossen:** [Zusammenfassung].
  Wissenschaftlich validiert gegen [Quellen]. |
  ```
- [ ] Planungsdatei nach `DOCUMENTATION/ARCHIVED/` verschoben
- [ ] Test-Datei erstellt (optional): `TEST_CASES_[ID].md`
- [ ] Git-Commit mit aussagekräftiger Message

---

## Phase 6: Verification (Post-Implementation Check)

- [ ] Feature in FEATURE_BACKLOG.md auffindbar (Status: ✅)
- [ ] Planungsdatei in `DOCUMENTATION/ARCHIVED/` auffindbar
- [ ] Quellen in SCIENTIFIC_REFERENCES.md auffindbar
- [ ] ValidationBadge in KnowledgePanel sichtbar
- [ ] Alle Links funktionieren (keine 404s)
- [ ] README-CLAUDE.md aktualisiert (falls neue Patterns entstanden)

---

## Verification Failures → Actions

**Falls Dokumentation unvollständig:**
- [ ] Fehlende Schritte nachholen BEFORE merging/deployment
- [ ] Checklist aktualisieren

**Falls wissenschaftliche Validierung fehlschlägt:**
- [ ] Feature degradieren zu "Teilvalidiert" (⚠️)
- [ ] Limitationen explizit dokumentieren
- [ ] ODER: Feature verwerfen und in `DOCUMENTATION/ARCHIVED/[NAME]_VERWORFEN.md` dokumentieren

---

## Erfolgs-Kriterium

✅ **Feature ist vollständig dokumentiert, wenn:**

1. Alle 6 Phasen abgehakt sind
2. Feature in FEATURE_BACKLOG.md (Status: ✅)
3. Planungsdatei in `DOCUMENTATION/ARCHIVED/`
4. Quellen in SCIENTIFIC_REFERENCES.md
5. ValidationBadge in App sichtbar
6. Keine Regressions-Tests gebrochen

---

**Template-Version:** 1.0
**Letzte Aktualisierung:** 2026-01-10
