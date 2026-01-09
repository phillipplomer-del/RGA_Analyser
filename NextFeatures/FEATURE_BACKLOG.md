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

### Priorität 1.5: Wissenschaftliche Analysewerkzeuge (NEU)

> Aus [RGA_APP_VERBESSERUNGEN.md](./RGA_APP_VERBESSERUNGEN.md) - Vakuum-Experten-Empfehlungen

| # | Feature | Status | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|------------|---------|---------|
| 1.5.1 | **Ausgasungs-Simulator** | ✅ | [RGA_APP_VERBESSERUNGEN.md](./RGA_APP_VERBESSERUNGEN.md#1-ausgasungs-simulator) | ~4h | Multi-Material, integriert in RoR + RGA Diagnose |
| 1.5.2 | **Isotopen-Analyse** | ✅ | [RGA_APP_VERBESSERUNGEN.md](./RGA_APP_VERBESSERUNGEN.md#2-erweiterte-isotopen-analyse) | 4-6h | isotopePatterns.ts + verifyIsotopeRatios Detektor |
| 1.5.3 | **Konfidenz-Score System** | ✅ | [RGA_APP_VERBESSERUNGEN.md](./RGA_APP_VERBESSERUNGEN.md#8-konfidenz-score-system) | 4-6h | 6 aktive Faktoren, Temp aus Dateinamen. **TODO:** Kalibrieralter aus Geräteprofil/Cloud |
| 1.5.4 | ESD-Artefakt-Erkennung | ⬜ | [RGA_APP_VERBESSERUNGEN.md](./RGA_APP_VERBESSERUNGEN.md#3-esd-artefakt-erkennung) | 2-4h | Falsch-Peaks durch elektrostatische Entladungen |
| 1.5.5 | Helium-Lecktest Integration | ⬜ | [RGA_APP_VERBESSERUNGEN.md](./RGA_APP_VERBESSERUNGEN.md#4-helium-lecktest-integration) | 2-4h | m/z=4 Signal → Leckrate Umrechnung |
| 1.5.6 | Erweiterte Öl-Diagnose | ⬜ | [RGA_APP_VERBESSERUNGEN.md](./RGA_APP_VERBESSERUNGEN.md#5-erweiterte-öl-diagnose) | 2-4h | Öl-Signaturen nach Typ erkennen |
| 1.5.7 | Peak-Deconvolution | ⬜ | [RGA_APP_VERBESSERUNGEN.md](./RGA_APP_VERBESSERUNGEN.md#6-massenauflösung-und-peak-überlappung) | 4-8h | Überlappende Peaks trennen (m/z=28: N₂ vs CO) |
| 1.5.8 | Pfeiffer-Kalibrierung | ⬜ | [RGA_APP_VERBESSERUNGEN.md](./RGA_APP_VERBESSERUNGEN.md#7-pfeiffer-spezifische-erweiterungen) | 2h | Gerätespezifische Kalibrierungsfaktoren |

### Priorität 1.6: Lecksuche-Planer (NEU) 🔥 IMPLEMENTATION-READY

> **Intelligenter Assistent für Lecksuchmethoden-Auswahl nach DIN EN 1779**
> **Spec-Qualität: 10/10** - Vollständigste Spec im Projekt! Alle TypeScript Types, Equipment DB, Physik-Engine, UI Screens, Test Cases fertig spezifiziert.

| # | Feature | Status | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|------------|---------|---------|
| **1.6.1** | **Core Engine & Types** | ⬜ | [LeaksearchPlanner_MasterV7_COMPLETE.md](./LeaksearchPlanner_MasterV7_COMPLETE.md) | **6-8h** | Physik (Leitwert, τ, MDL), Decision Tree, Virtual Leak Risk, Equipment DB, Standards |
| **1.6.2** | **UI Wizard (Quick Mode)** | ⬜ | [LeaksearchPlanner_MasterV7_COMPLETE.md](./LeaksearchPlanner_MasterV7_COMPLETE.md) | **8-10h** | 4 Screens, Live-Feedback, 3-Karten-Result, Checkliste |
| **1.6.3** | **Report & Export** | ⬜ | [LeaksearchPlanner_MasterV7_COMPLETE.md](./LeaksearchPlanner_MasterV7_COMPLETE.md) | **2-3h** | Markdown-Generator, Audit-Block, PDF später |
| 1.6.4 | Expert Mode (Phase 2) | ⬜ | [LeaksearchPlanner_MasterV7_COMPLETE.md](./LeaksearchPlanner_MasterV7_COMPLETE.md) | 4-6h | Leitungslängen, Ventiltypen, detaillierte Pumpen-Parameter |
| 1.6.5 | B4 Sniffer Methode | ⬜ | [LeaksearchPlanner_MasterV7_COMPLETE.md](./LeaksearchPlanner_MasterV7_COMPLETE.md) | 2h | Überdruck-Prüfung |
| 1.6.6 | RGA-Integration | ⬜ | [LeaksearchPlanner_MasterV7_COMPLETE.md](./LeaksearchPlanner_MasterV7_COMPLETE.md) | 2h | Deep-Links, Virtual Leak Detection Workflow |
| 1.6.7 | Shared Geometrie-Komponente | ⬜ | [LeaksearchPlanner_MasterV7_COMPLETE.md](./LeaksearchPlanner_MasterV7_COMPLETE.md) | 2h | `<ChamberGeometryInput />` aus Outgassing extrahieren |

**MVP-Scope (1.6.1-1.6.3):** 16-21h → 3 Methoden (B2, B5, B6), Quick Mode, 8 Standards, Virtual Leak Risk, Warnungen, Markdown-Export

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
| **Ausgasungs-Simulator** | 2026-01-08 | [RGA_APP_VERBESSERUNGEN.md](./RGA_APP_VERBESSERUNGEN.md) | Multi-Material, Leck-vs-Ausgasung, RoR+RGA Integration |
| **Isotopen-Analyse** | 2026-01-08 | [RGA_APP_VERBESSERUNGEN.md](./RGA_APP_VERBESSERUNGEN.md) | 10 Elemente, Fragment-Muster, verifyIsotopeRatios Detektor |
| **Konfidenz-Score System** | 2026-01-08 | [RGA_APP_VERBESSERUNGEN.md](./RGA_APP_VERBESSERUNGEN.md) | 6 aktive Faktoren (SNR, Peaks, Dynamik, Temp, Massenbereich, H₂), Grade A-F. Kalibrieralter vorbereitet (weight=0) |

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

### RGA_APP_VERBESSERUNGEN.md (NEU)
- **Umsetzbarkeit:** ⭐⭐⭐⭐ (TypeScript-Code bereits vorhanden)
- **Komplexität:** ⭐⭐⭐⭐ (8 Features, verschiedene Schwierigkeitsgrade)
- **Bedarf:** ⭐⭐⭐⭐⭐ (Unterscheidung Leck vs. Ausgasung ist kritisch!)
- **Fazit:** **Ausgasungs-Simulator zuerst** - löst häufigstes Anwenderproblem

### LeaksearchPlanner_MasterV7_COMPLETE.md (NEU) 🔥
- **Umsetzbarkeit:** ⭐⭐⭐⭐⭐ (50% Code bereits in Spec vorhanden!)
  - Alle TypeScript Interfaces fertig definiert (20+ Types)
  - Equipment Database copy-paste ready (5 Lecksucher, 12 Standards)
  - Physik-Engine vollständig spezifiziert (Leitwert, Zeitkonstanten, MDL)
  - 8 Test Cases (TC1-TC8) für TDD
  - Wiederverwendung: ChamberGeometry aus Outgassing
- **Komplexität:** ⭐⭐⭐ (Mittel)
  - 6 Phasen, 24-33h laut Spec (MVP: 16-21h)
  - Mathematik nicht hochkomplex (molekulare Strömung, τ = V/S)
  - Kein Backend, alles Frontend
  - **Aber:** 4 UI Screens, 2 Modi, viele Inputs
- **Bedarf:** ⭐⭐⭐⭐⭐ (Kritisch)
  - **Marktlücke:** Kein herstellerunabhängiges Planungstool nach DIN EN 1779
  - **Problem:** "Welche Lecksuchmethode wählen?" ist reales Anwenderproblem
  - **Zielgruppe:** HV/UHV-Nutzer (CERN, GSI, Semiconductor, Vakuum-Equipment-Hersteller)
  - **Leak Test Equipment Market:** $15.8B bis 2035, 8.26% CAGR
  - **Wettbewerb:** Nur gerätespezifische Software (Pfeiffer, Leybold, INFICON)
- **Spec-Qualität:** **10/10** (Beste Spec im gesamten Projekt!)
  - Vollständige Implementierungs-Anleitung
  - Code-First (TypeScript Interfaces → TDD)
  - Zweisprachig (DE + EN)
  - Audit-Ready (Kalibrierung, Entscheidungsregel, Annahmen)
  - Integration spezifiziert (RGA Deep-Links, Virtual Leak Detection)
- **Prioritäts-Score:** `5 × 5 / 3 = 8.3` → **Sehr hoch!**
- **Fazit:** **Alleinstellungsmerkmal** - 5. Hauptfunktion neben RGA, RoR, Outgassing, Wissen. Ready für sofortige Implementierung!

---

## Changelog

| Datum | Änderung |
|-------|----------|
| 2026-01-07 | Initiales Backlog erstellt |
| 2026-01-07 | 7 Features bewertet und priorisiert |
| 2026-01-07 | Icon-Vereinheitlichung hinzugefügt (4.1) |
| 2026-01-07 | **Priorität 0 hinzugefügt:** Datenqualität aus IMPLEMENTATION_SPEC.md |
| 2026-01-08 | ✅ **Priorität 0 komplett abgeschlossen:** RSF, Gase, Massen, Detektoren, Profile |
| 2026-01-08 | **Priorität 1.5 hinzugefügt:** 8 wissenschaftliche Analysewerkzeuge aus RGA_APP_VERBESSERUNGEN.md |
| 2026-01-08 | ✅ **Ausgasungs-Simulator (1.5.1) implementiert:** 17 Materialien, Multi-Material-Berechnung, Integration in Rate-of-Rise (Vergleichskarte) und RGA-Diagnose (Kontext-Panel) |
| 2026-01-08 | ✅ **Isotopen-Analyse (1.5.2) implementiert:** 10 Elemente, Fragment-Muster, verifyIsotopeRatios Detektor |
| 2026-01-08 | **Priorität 1.6 hinzugefügt:** Lecksuche-Planer nach DIN EN 1779 (Marktlücke identifiziert!) |
| 2026-01-08 | ✅ **Konfidenz-Score System (1.5.3) implementiert:** 6 Faktoren aktiv (SNR, Peaks, Dynamik, Temp, Massenbereich, H₂), Kalibrieralter vorbereitet |
| 2026-01-08 | 🔥 **LeaksearchPlanner_MasterV7_COMPLETE.md:** Vollständigste Spec im Projekt! TypeScript Types, Equipment DB, Physik-Engine, UI Screens, Test Cases - alles fertig. MVP-Scope 16-21h. Spec-Qualität: 10/10 |

---

## Nächste Schritte

**Abgeschlossen (2026-01-08):**
1. [x] ~~**RSF-Korrekturen sofort umsetzen**~~ ✅ Erledigt
2. [x] ~~Neue Gase + Massen + Detektoren hinzufügen~~ ✅ Erledigt
3. [x] ~~**Ausgasungs-Simulator** (Priorität 1.5.1)~~ ✅ Erledigt
4. [x] ~~**Isotopen-Analyse** (Priorität 1.5.2)~~ ✅ Erledigt
5. [x] ~~**Konfidenz-Score System** (Priorität 1.5.3)~~ ✅ Erledigt

**Aktuelle Top-Prioritäten:**

6. [ ] 🔥 **Lecksuche-Planer MVP** (Priorität 1.6.1-1.6.3) - **16-21h**
   - Phase 1: Core Engine & Types (6-8h)
   - Phase 2: UI Wizard Quick Mode (8-10h)
   - Phase 3: Report & Markdown Export (2-3h)
   - **Begründung:** Spec-Qualität 10/10, Alleinstellungsmerkmal, Marktlücke ($15.8B Market)

7. [ ] Error Handling Grundgerüst starten (Priorität 1.1)
8. [ ] Firebase Auth Migration planen (Priorität 1.2) - Breaking Change kommunizieren
9. [ ] Zeitreihen Parser als größeres Feature (Priorität 2.1-2.3)

---

*Dieses Dokument wird kontinuierlich aktualisiert.*
