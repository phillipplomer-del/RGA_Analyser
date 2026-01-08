# Feature Backlog - RGA Analyser

> Zentrale Übersicht aller geplanten Features. Priorisiert nach Bedarf und Umsetzbarkeit.

**Letzte Aktualisierung:** 2026-01-08

---

## Status-Legende

| Symbol | Bedeutung |
|--------|-----------|
| ⬜ | Geplant |
| 🔄 | In Arbeit |
| ✅ | Abgeschlossen |
| ⏸️ | Pausiert |
| ❌ | Verworfen |

---

## Priorisierte Feature-Liste

### Priorität 0: Datenqualität & Korrekturen (KRITISCH) ✅ ABGESCHLOSSEN

| # | Feature | Status | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|------------|---------|---------|
| 0.1 | **RSF-Korrekturen** | ✅ | [IMPLEMENTATION_SPEC.md](./IMPLEMENTATION_SPEC.md) | 30min | H₂S, SO₂, C₂H₆, SiH₄, PH₃ - korrigiert! |
| 0.2 | Neue Gase (Halbleiter) | ✅ | [IMPLEMENTATION_SPEC.md](./IMPLEMENTATION_SPEC.md) | 1h | NF₃, WF₆, C₂F₆, GeH₄ |
| 0.3 | Neue Massen-Einträge | ✅ | [IMPLEMENTATION_SPEC.md](./IMPLEMENTATION_SPEC.md) | 30min | m/z 52, 119, 127, 149 (Phthalat!) |
| 0.4 | Neue Diagnose-Detektoren | ✅ | [IMPLEMENTATION_SPEC.md](./IMPLEMENTATION_SPEC.md) | 2-3h | Polymer, Weichmacher, Prozessgas, Kühlwasser |
| 0.5 | Neue Limit-Profile | ✅ | [IMPLEMENTATION_SPEC.md](./IMPLEMENTATION_SPEC.md) | 30min | LIGO UHV, Semiconductor CVD |

### Priorität 1: Fundament & Quick Wins

| # | Feature | Status | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|------------|---------|---------|
| 1.1 | Error Handling Grundgerüst | ⬜ | [ERROR_HANDLING_SPEC.md](./ERROR_HANDLING_SPEC.md) | 1-2 Tage | Toast, Error-Boundary, Error-Store |
| 1.2 | Firebase Auth Migration | ⬜ | [FIREBASE_AUTH_MIGRATION.md](./FIREBASE_AUTH_MIGRATION.md) | 2-4h | E-Mail + Passwort, Passwort-Reset |

### Priorität 2: Kernfunktionen

| # | Feature | Status | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|------------|---------|---------|
| 2.1 | Zeitreihen MVP (Parser) | ⬜ | [TIMESERIES_FEATURE_SPEC.md](./TIMESERIES_FEATURE_SPEC.md) | 4-6h | Multi-Scan Parser, Datenmodell |
| 2.2 | Zeitreihen MVP (UI) | ⬜ | [TIMESERIES_FEATURE_SPEC.md](./TIMESERIES_FEATURE_SPEC.md) | 8-12h | Trend-Chart, Spektrum-Slider |
| 2.3 | Zeitreihen Analyse | ⬜ | [TIMESERIES_FEATURE_SPEC.md](./TIMESERIES_FEATURE_SPEC.md) | 6-8h | Trend-Berechnung, Exp. Fit |

### Priorität 3: Wissenschaftliche Qualität

| # | Feature | Status | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|------------|---------|---------|
| 3.1 | Unsicherheiten Basis | ⬜ | [UNCERTAINTY_ANALYSIS.md](./UNCERTAINTY_ANALYSIS.md) | 4-6h | Lineare Regression mit Fehlern |
| 3.2 | Fehlerfortpflanzung | ⬜ | [UNCERTAINTY_ANALYSIS.md](./UNCERTAINTY_ANALYSIS.md) | 4h | Q = V · dp/dt mit Unsicherheiten |
| 3.3 | Robuste Regression | ⬜ | [UNCERTAINTY_ANALYSIS.md](./UNCERTAINTY_ANALYSIS.md) | 6h | Huber, RANSAC |
| 3.4 | Grenzwert-Signifikanz | ⬜ | [UNCERTAINTY_ANALYSIS.md](./UNCERTAINTY_ANALYSIS.md) | 2h | P(Q < Limit) Berechnung |

### Priorität 4: Code-Qualität

| # | Feature | Status | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|------------|---------|---------|
| 4.1 | **Icon-Vereinheitlichung** | ⬜ | - | 2-3h | Emojis → SVG Heroicons: KnowledgePanel (15+ diagnoses), DiagnosisPanel (via Datentyp), QualityChecks |
| 4.2 | Design Tokens | ⬜ | [SHARED_COMPONENTS_SPEC.md](./SHARED_COMPONENTS_SPEC.md) | 2h | Farben, Abstände, Schatten |
| 4.3 | Shared Chart Components | ⬜ | [SHARED_COMPONENTS_SPEC.md](./SHARED_COMPONENTS_SPEC.md) | 8h | BaseChart, ChartControls |
| 4.4 | Shared Data Components | ⬜ | [SHARED_COMPONENTS_SPEC.md](./SHARED_COMPONENTS_SPEC.md) | 4h | DataTable, MetadataCard |
| 4.5 | Shared Input Components | ⬜ | [SHARED_COMPONENTS_SPEC.md](./SHARED_COMPONENTS_SPEC.md) | 4h | NumberInput, RangeSlider |

### Priorität 5: UX Polish

| # | Feature | Status | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|------------|---------|---------|
| 5.1 | Keyboard Shortcuts | ⬜ | [UX_INTERACTIONS.md](./UX_INTERACTIONS.md) | 2h | Globale + Chart Shortcuts |
| 5.2 | Chart Zoom/Pan | ⬜ | [UX_INTERACTIONS.md](./UX_INTERACTIONS.md) | 4h | Scroll, Drag, Rechteck-Zoom |
| 5.3 | Undo/Redo System | ⬜ | [UX_INTERACTIONS.md](./UX_INTERACTIONS.md) | 4h | Zustand-History |
| 5.4 | Touch-Gesten | ⬜ | [UX_INTERACTIONS.md](./UX_INTERACTIONS.md) | 4h | Pinch-to-Zoom, Swipe |

### Priorität 6: Performance (bei Bedarf)

| # | Feature | Status | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|------------|---------|---------|
| 6.1 | Web Worker Setup | ⬜ | [PERFORMANCE_GUIDE.md](./PERFORMANCE_GUIDE.md) | 4h | Parser Worker |
| 6.2 | LTTB Downsampling | ⬜ | [PERFORMANCE_GUIDE.md](./PERFORMANCE_GUIDE.md) | 2h | Chart-Optimierung |
| 6.3 | Virtualisierte Tabellen | ⬜ | [PERFORMANCE_GUIDE.md](./PERFORMANCE_GUIDE.md) | 4h | react-window |
| 6.4 | Lazy Loading | ⬜ | [PERFORMANCE_GUIDE.md](./PERFORMANCE_GUIDE.md) | 2h | Code Splitting |

---

## Abgeschlossene Features

| Feature | Abgeschlossen | Spec-Datei | Notizen |
|---------|---------------|------------|---------|
| RGA Analyser Basis | 2025-12 | [done/RGA_ANALYSER_PLAN.md](./done/RGA_ANALYSER_PLAN.md) | Grundfunktionalität |
| Web Research Integration | 2025-12 | [done/RGA_WEB_RESEARCH_ADDENDUM.md](./done/RGA_WEB_RESEARCH_ADDENDUM.md) | Pfeiffer Know-How |
| Rate-of-Rise Feature | 2026-01 | [done/RATE_OF_RISE_FEATURE_SPEC.md](./done/RATE_OF_RISE_FEATURE_SPEC.md) | Leckraten-Analyse |
| Knowledge Section | 2026-01 | - | Intro-Texte, RoR Tab |
| **Datenqualität (Prio 0)** | 2026-01-08 | [IMPLEMENTATION_SPEC.md](./IMPLEMENTATION_SPEC.md) | RSF, 4 Gase, 4 Massen, 4 Detektoren, 2 Profile |

---

## Feature-Bewertungsmatrix

Für neue Features verwenden:

| Kriterium | ⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
|-----------|-----|------|--------|----------|------------|
| **Umsetzbarkeit** | Sehr schwer | Schwer | Mittel | Leicht | Sehr leicht |
| **Komplexität** | Sehr hoch | Hoch | Mittel | Niedrig | Sehr niedrig |
| **Bedarf** | Nice-to-have | Wünschenswert | Wichtig | Dringend | Kritisch |

**Prioritäts-Formel:** `Priorität = Bedarf × Umsetzbarkeit / Komplexität`

---

## Aktuelle Feature-Bewertungen

### IMPLEMENTATION_SPEC.md (Datenqualität)
- **Umsetzbarkeit:** ⭐⭐⭐⭐⭐ (Copy-Paste aus Spec)
- **Komplexität:** ⭐⭐ (Einfache Datenkorrekturen)
- **Bedarf:** ⭐⭐⭐⭐⭐ (RSF-Fehler = falsche Messwerte!)
- **Fazit:** **Sofort umsetzen!** RSF-Korrekturen sind kritisch für wissenschaftliche Genauigkeit

### ERROR_HANDLING_SPEC.md
- **Umsetzbarkeit:** ⭐⭐⭐⭐ (Klare Struktur, schrittweise)
- **Komplexität:** ⭐⭐⭐ (5 Phasen)
- **Bedarf:** ⭐⭐⭐⭐⭐ (Fundament für Robustheit)
- **Fazit:** Sollte früh implementiert werden

### FIREBASE_AUTH_MIGRATION.md
- **Umsetzbarkeit:** ⭐⭐⭐⭐⭐ (Firebase SDK gut dokumentiert)
- **Komplexität:** ⭐⭐ (2-4h)
- **Bedarf:** ⭐⭐⭐⭐ (Passwort-Reset, SSO benötigt)
- **Fazit:** Schneller Win, Breaking Change für User

### TIMESERIES_FEATURE_SPEC.md
- **Umsetzbarkeit:** ⭐⭐⭐ (Parser-Erweiterung + neue UI)
- **Komplexität:** ⭐⭐⭐⭐⭐ (3 Phasen, ~60h)
- **Bedarf:** ⭐⭐⭐⭐⭐ (Multi-Scan-Daten werden verworfen!)
- **Fazit:** Wichtigstes Feature für wissenschaftlichen Nutzen

### UNCERTAINTY_ANALYSIS.md
- **Umsetzbarkeit:** ⭐⭐ (Mathematisch anspruchsvoll)
- **Komplexität:** ⭐⭐⭐⭐⭐ (Robuste Regression, Fehlerfortpflanzung)
- **Bedarf:** ⭐⭐⭐⭐ (Wissenschaftlich essentiell)
- **Fazit:** Wichtig, kann aber später nachgerüstet werden

### SHARED_COMPONENTS_SPEC.md
- **Umsetzbarkeit:** ⭐⭐⭐ (Standard-Patterns)
- **Komplexität:** ⭐⭐⭐⭐ (Umfassendes Design-System)
- **Bedarf:** ⭐⭐⭐ (Hilft bei Konsistenz)
- **Fazit:** Gut für Wartbarkeit, kein unmittelbarer User-Nutzen

### UX_INTERACTIONS.md
- **Umsetzbarkeit:** ⭐⭐⭐⭐ (Inkrementell umsetzbar)
- **Komplexität:** ⭐⭐⭐⭐ (Viele Patterns)
- **Bedarf:** ⭐⭐⭐ (Nice-to-have)
- **Fazit:** Poliert die UX

### PERFORMANCE_GUIDE.md
- **Umsetzbarkeit:** ⭐⭐⭐ (Web Worker komplex)
- **Komplexität:** ⭐⭐⭐⭐ (5 Phasen)
- **Bedarf:** ⭐⭐ (Nur bei großen Dateien)
- **Fazit:** Erst bei echten Performance-Problemen

---

## Changelog

| Datum | Änderung |
|-------|----------|
| 2026-01-07 | Initiales Backlog erstellt |
| 2026-01-07 | 7 Features bewertet und priorisiert |
| 2026-01-07 | Icon-Vereinheitlichung hinzugefügt (4.1) |
| 2026-01-07 | **Priorität 0 hinzugefügt:** Datenqualität aus IMPLEMENTATION_SPEC.md |
| 2026-01-08 | ✅ **Priorität 0 komplett abgeschlossen:** RSF, Gase, Massen, Detektoren, Profile |

---

## Nächste Schritte

1. [x] ~~**RSF-Korrekturen sofort umsetzen**~~ ✅ Erledigt 2026-01-08
2. [x] ~~Neue Gase + Massen + Detektoren hinzufügen~~ ✅ Erledigt 2026-01-08
3. [ ] Error Handling Grundgerüst starten
4. [ ] Firebase Auth Migration planen (Breaking Change kommunizieren)
5. [ ] Zeitreihen Parser als erstes größeres Feature

---

*Dieses Dokument wird kontinuierlich aktualisiert.*
