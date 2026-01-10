# Feature Backlog - RGA Analyser

> Zentrale Übersicht aller geplanten Features. Strukturiert nach **Wissenschaft**, **Anwendungs-Tools** und **App-Infrastruktur**.

**Letzte Aktualisierung:** 2026-01-10

---

## Status-Legende

| Symbol | Bedeutung |
|--------|-----------|
| ⬜ | Geplant |
| 🔄 | In Arbeit |
| ✅ | Abgeschlossen |
| ⏸️ | Pausiert |
| ❌ | Verworfen |

## 🔬 Wissenschaftliche Validierung

| Status | Bedeutung |
|--------|-----------|
| ✅ | **Vollständig validiert** - Quellen in [SCIENTIFIC_REFERENCES.md](../RGA_Knowledge/SCIENTIFIC_REFERENCES.md) dokumentiert |
| ⚠️ | **Teilvalidiert** - Grundquellen vorhanden, weitere Recherche empfohlen |
| - | **Nicht wissenschaftlich** - Feature benötigt keine wissenschaftliche Validierung (z.B. UI/UX) |
| (leer) | **Ausstehend** - Validierung steht noch aus |

---

## 📊 Wissenschaftliche Features & Detektoren

> Features die wissenschaftliche Analyse, Datenqualität und Diagnose-Algorithmen betreffen

### Datenqualität & Korrekturen (Priorität 0) ✅ ABGESCHLOSSEN

| # | Feature | Status | 🔬 Validiert? | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|---------------|------------|---------|---------|
| 0.1 | **RSF-Korrekturen** | ✅ | ✅ | [IMPLEMENTATION_SPEC.md](../ARCHIVED/IMPLEMENTATION_SPEC.md) | 30min | H₂S, SO₂, C₂H₆, SiH₄, PH₃ - korrigiert! |
| 0.2 | Neue Gase (Halbleiter) | ✅ | ✅ | [IMPLEMENTATION_SPEC.md](../ARCHIVED/IMPLEMENTATION_SPEC.md) | 1h | NF₃, WF₆, C₂F₆, GeH₄ |
| 0.3 | Neue Massen-Einträge | ✅ | ✅ | [IMPLEMENTATION_SPEC.md](../ARCHIVED/IMPLEMENTATION_SPEC.md) | 30min | m/z 52, 119, 127, 149 (Phthalat!) |
| 0.4 | Neue Diagnose-Detektoren | ✅ | ✅ | [IMPLEMENTATION_SPEC.md](../ARCHIVED/IMPLEMENTATION_SPEC.md) | 2-3h | Polymer, Weichmacher, Prozessgas, Kühlwasser |
| 0.5 | Neue Limit-Profile | ✅ | - | [IMPLEMENTATION_SPEC.md](../ARCHIVED/IMPLEMENTATION_SPEC.md) | 30min | LIGO UHV, Semiconductor CVD |

### Wissenschaftliche Analysewerkzeuge (Priorität 1.5)

> Aus [RGA_APP_VERBESSERUNGEN.md](./RGA_APP_VERBESSERUNGEN.md) - Vakuum-Experten-Empfehlungen

| # | Feature | Status | 🔬 Validiert? | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|---------------|------------|---------|---------|
| 1.5.1 | **Ausgasungs-Simulator** | ✅ | ✅ | [RGA_APP_VERBESSERUNGEN.md](./RGA_APP_VERBESSERUNGEN.md#1-ausgasungs-simulator) | ~4h | Multi-Material, integriert in RoR + RGA Diagnose |
| 1.5.2 | **Isotopen-Analyse** | ✅ | ✅ | [RGA_APP_VERBESSERUNGEN.md](./RGA_APP_VERBESSERUNGEN.md#2-erweiterte-isotopen-analyse) | 4-6h | isotopePatterns.ts + verifyIsotopeRatios Detektor |
| 1.5.3 | **Konfidenz-Score System** | ✅ | ✅ | [RGA_APP_VERBESSERUNGEN.md](./RGA_APP_VERBESSERUNGEN.md#8-konfidenz-score-system) | 4-6h | 6 aktive Faktoren, Temp aus Dateinamen. **TODO:** Kalibrieralter aus Geräteprofil/Cloud |
| 1.5.4 | **ESD-Artefakt-Erkennung** | ✅ | ✅ | [RGA_APP_VERBESSERUNGEN.md](./RGA_APP_VERBESSERUNGEN.md#3-esd-artefakt-erkennung) | 2-4h | 6 Kriterien (O⁺, N⁺, C⁺, H⁺, F⁺, Cl), dynamische Severity (info/warning), spezifische Degassing-Empfehlungen |
| 1.5.5 | **Helium-Leck-Indikator** | ✅ | ⚠️ | [RGA_APP_VERBESSERUNGEN.md](./RGA_APP_VERBESSERUNGEN.md#4-helium-lecktest-integration) | 2h | Qualitative m/z=4 Detektion (NICHT quantitative Leckrate!). Warnung mit Empfehlung für dedizierten He-Leckdetektor |
| 1.5.6 | ~~Erweiterte Öl-Diagnose~~ | ❌ | ✅ | [RGA_APP_VERBESSERUNGEN.md](./RGA_APP_VERBESSERUNGEN.md#5-erweiterte-öl-diagnose) | VERWORFEN | **Wissenschaftlich nicht valide:** Öl-Typ-Unterscheidung nicht zuverlässig, FOMBLIN-Fehler. Existierender `detectOilBackstreaming()` ist korrekt. Plan: [done/OEL_DIAGNOSE_VERWORFEN_NICHT_VALIDE.md](./done/OEL_DIAGNOSE_VERWORFEN_NICHT_VALIDE.md) |
| 1.5.7 | **Peak-Deconvolution** | ✅ | ✅ | [RGA_APP_VERBESSERUNGEN.md](./RGA_APP_VERBESSERUNGEN.md#6-massenauflösung-und-peak-überlappung) | 3h | ✅ **2026-01-10:** N₂/CO Diskriminierung mit ¹³CO (1.2%), ¹⁴N¹⁵N (0.6-0.9%), N⁺/C⁺ Ratio. Wissenschaftlich validiert gegen NIST/Hofmann. |
| 1.5.8 | Pfeiffer-Kalibrierung | ⬜ | | [RGA_APP_VERBESSERUNGEN.md](./RGA_APP_VERBESSERUNGEN.md#7-pfeiffer-spezifische-erweiterungen) | 2h | Gerätespezifische Kalibrierungsfaktoren |
| **1.5.9** | **Wissenschaftliche Validierung & Referenz-System** | ✅ | ✅ | [SCIENTIFIC_REFERENCES.md](../RGA_Knowledge/SCIENTIFIC_REFERENCES.md) | ~6h | **67 Quellen dokumentiert**, alle Isotope validiert (NIST/CIAAW), Knowledge Panel erweitert, Claude Code Training. **Status-Übersicht:** [WISSENSCHAFTLICHE_VALIDIERUNG_STATUS.md](./WISSENSCHAFTLICHE_VALIDIERUNG_STATUS.md) |

### Erweiterungen aus wissenschaftlicher Validierung (Priorität 1.8) 🔬

> **Identifiziert durch systematische Literatur-Recherche (2026-01-09)**

| # | Feature | Status | 🔬 Validiert? | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|---------------|------------|---------|------------|
| 1.8.1 | D₂/HD Gase (Deuterium) | ✅ | ✅ | [SCIENTIFIC_REFERENCES.md](../RGA_Knowledge/SCIENTIFIC_REFERENCES.md#deuterium-d₂-and-hd) | 2-3h | m/z 3, 4. Fusionsforschung (JET, ASDEX). **Quelle:** Hiden Analytical, DOE SRNL. gasLibrary.ts + massReference.ts aktualisiert |
| 1.8.2 | N₂O Gas (Lachgas) | ✅ | ✅ | [SCIENTIFIC_REFERENCES.md](../RGA_Knowledge/SCIENTIFIC_REFERENCES.md#n₂o-nitrous-oxide) | 2h | m/z 44/45/46, 30/31. Biogeochemie, ¹⁵N-Analyse. **Quelle:** UC Davis, PubMed. Bereits in gasLibrary.ts implementiert |
| 1.8.3 | PDMS m/z 59 Enhancement | ✅ | ✅ | [SCIENTIFIC_REFERENCES.md](../RGA_Knowledge/SCIENTIFIC_REFERENCES.md#silicon-isotopes--pdms-contamination) | 30min | Zusätzlicher kritischer PDMS-Marker (C₃H₇Si⁺). **Quelle:** Springer, Hiden SIMS. Erweitert um m/z 147 Check |
| 1.8.4 | Argon Ratio Update (Optional) | ⬜ | | [SCIENTIFIC_REFERENCES.md](../RGA_Knowledge/SCIENTIFIC_REFERENCES.md#argon---air-leak-detection) | 15min | Update auf Lee 2006 Wert (298.6 statt 295.5). 1% Abweichung, niedrige Priorität |

### Offline-Analyse Features (Priorität 1.9) 🧪

> **Identifiziert durch Gemini-3-Pro Cross-Validation (2026-01-10)**
> Wissenschaftliche Features für fortgeschrittene Offline-Analyse von RGA/RoR-Daten

| # | Feature | Status | 🔬 Validiert? | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|---------------|------------|---------|---------|
| 1.9.1 | Kinetic Fingerprinting | ⬜ | | [RGA_SCIENTIFIC_ANALYSIS_LOG.md](../RGA_Knowledge/RGA_SCIENTIFIC_ANALYSIS_LOG.md) | 4-6h | Desorptions-Kinetik: Exponent n identifiziert Gas-Quelle (n≈1: Surface, n≈0.5: Bulk Diffusion). P ∝ t⁻ⁿ Analyse |
| 1.9.2 | Dynamic LOD (Limit of Detection) | ⬜ | | [RGA_SCIENTIFIC_ANALYSIS_LOG.md](../RGA_Knowledge/RGA_SCIENTIFIC_ANALYSIS_LOG.md) | 2-3h | LOD = μ_noise + 3σ_noise (IUPAC Standard). Ersetzt arbitrary "1e-10" Cutoffs mit statistisch robuster Berechnung pro Scan |
| 1.9.3 | Statistical Uncertainty Calculation | ⬜ | | [RGA_SCIENTIFIC_ANALYSIS_LOG.md](../RGA_Knowledge/RGA_SCIENTIFIC_ANALYSIS_LOG.md) | 3-4h | Confidence Intervals für Leckraten: Q ± 2·SE_slope (95% CI). Linear Regression Analysis mit Standard Error of Slope |
| 1.9.4 | Intelligent Background Subtraction | ⬜ | | [RGA_SCIENTIFIC_ANALYSIS_LOG.md](../RGA_Knowledge/RGA_SCIENTIFIC_ANALYSIS_LOG.md) | 3-4h | ASCII Background-File Subtraktion mit Negative Clamping und Normalization Drift Handling |
| 1.9.5 | Permeation Lag Detection | ⬜ | | [RGA_SCIENTIFIC_ANALYSIS_LOG.md](../RGA_Knowledge/RGA_SCIENTIFIC_ANALYSIS_LOG.md) | 4-5h | Elastomer Check: Time Lag t_lag = L²/6D Detection. Unterscheidet "Real Leak" (immediate) vs. "Permeation" (delayed S-Curve) |

**Kritische Bug-Fixes aus Cross-Validation:**
- ✅ **Rate-of-Rise Curve Fitting Models:** GEFIXT (2026-01-10) - Virtual Leak: Exponential (1-e^(-t/τ)), Outgassing: Logarithmic (ln(t))
- ✅ **Temperature Correction Formula:** GEFIXT (2026-01-10) - P_corr = P_meas × (T_curr/T_ref), war inverted

### Wissenschaftliche Qualität (Priorität 3)

| # | Feature | Status | 🔬 Validiert? | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|---------------|------------|---------|---------|
| 3.1 | Unsicherheiten Basis | ⬜ | | [UNCERTAINTY_ANALYSIS.md](./UNCERTAINTY_ANALYSIS.md) | 4-6h | Lineare Regression mit Fehlern |
| 3.2 | Fehlerfortpflanzung | ⬜ | | [UNCERTAINTY_ANALYSIS.md](./UNCERTAINTY_ANALYSIS.md) | 4h | Q = V · dp/dt mit Unsicherheiten |
| 3.3 | Robuste Regression | ⬜ | | [UNCERTAINTY_ANALYSIS.md](./UNCERTAINTY_ANALYSIS.md) | 6h | Huber, RANSAC |
| 3.4 | Grenzwert-Signifikanz | ⬜ | | [UNCERTAINTY_ANALYSIS.md](./UNCERTAINTY_ANALYSIS.md) | 2h | P(Q < Limit) Berechnung |

---

## 🛠️ Anwendungs-Features & Tools

> Features für Workflow-Unterstützung, Engineering-Tools und spezielle Anwendungsfälle

### Lecksuche-Planer (Priorität 1.6) 🔥 IMPLEMENTATION-READY

> **Intelligenter Assistent für Lecksuchmethoden-Auswahl nach DIN EN 1779**
> **Spec-Qualität: 10/10** - Vollständigste Spec im Projekt! Alle TypeScript Types, Equipment DB, Physik-Engine, UI Screens, Test Cases fertig spezifiziert.

| # | Feature | Status | 🔬 Validiert? | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|---------------|------------|---------|---------|
| **1.6.0** | **Demo Implementation** | ✅ | - | [src/components/LeakSearchDemo.tsx](../src/components/LeakSearchDemo.tsx) | ~3h | Funktionierende Demo: Input-System, B2/B5/B6 Logic, 9 Warnsystem, Timing-Calc. ~10% der vollständigen Version. |
| **1.6.1** | **Core Engine & Types** | ⬜ | - | [LeaksearchPlanner_MasterV7_COMPLETE.md](./LeaksearchPlanner_MasterV7_COMPLETE.md) | **6-8h** | Physik (Leitwert, τ, MDL), Decision Tree, Virtual Leak Risk, Equipment DB, Standards |
| **1.6.2** | **UI Wizard (Quick Mode)** | ⬜ | - | [LeaksearchPlanner_MasterV7_COMPLETE.md](./LeaksearchPlanner_MasterV7_COMPLETE.md) | **8-10h** | 4 Screens, Live-Feedback, 3-Karten-Result, Checkliste |
| **1.6.3** | **Report & Export** | ⬜ | - | [LeaksearchPlanner_MasterV7_COMPLETE.md](./LeaksearchPlanner_MasterV7_COMPLETE.md) | **2-3h** | Markdown-Generator, Audit-Block, PDF später |
| 1.6.4 | Expert Mode (Phase 2) | ⬜ | - | [LeaksearchPlanner_MasterV7_COMPLETE.md](./LeaksearchPlanner_MasterV7_COMPLETE.md) | 4-6h | Leitungslängen, Ventiltypen, detaillierte Pumpen-Parameter |
| 1.6.5 | B4 Sniffer Methode | ⬜ | - | [LeaksearchPlanner_MasterV7_COMPLETE.md](./LeaksearchPlanner_MasterV7_COMPLETE.md) | 2h | Überdruck-Prüfung |
| 1.6.6 | RGA-Integration | ⬜ | - | [LeaksearchPlanner_MasterV7_COMPLETE.md](./LeaksearchPlanner_MasterV7_COMPLETE.md) | 2h | Deep-Links, Virtual Leak Detection Workflow |
| 1.6.7 | Shared Geometrie-Komponente | ⬜ | - | [LeaksearchPlanner_MasterV7_COMPLETE.md](./LeaksearchPlanner_MasterV7_COMPLETE.md) | 2h | `<ChamberGeometryInput />` aus Outgassing extrahieren |

**MVP-Scope (1.6.1-1.6.3):** 16-21h → 3 Methoden (B2, B5, B6), Quick Mode, 8 Standards, Virtual Leak Risk, Warnungen, Markdown-Export

### STL Geometry Import (Priorität 1.7) 🎨

> **CAD-Modell-Import für automatische Volumen- und Oberflächenberechnung**
> Ingenieure laden STL-Dateien hoch → automatische Berechnung → Übernahme in Ausgasungs-Rechner und Lecksuche-Planer

| # | Feature | Status | 🔬 Validiert? | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|---------------|------------|---------|---------|
| 1.7.1 | Core Library (Parser + Analyzer) | ⬜ | - | [STL_GEOMETRY_IMPORT_SPEC.md](./STL_GEOMETRY_IMPORT_SPEC.md) | 4-6h | Three.js STLLoader, Volumen/Oberflächen-Berechnung, Wandkorrektur |
| 1.7.2 | UI Components | ⬜ | - | [STL_GEOMETRY_IMPORT_SPEC.md](./STL_GEOMETRY_IMPORT_SPEC.md) | 3-4h | Drag&Drop Upload, 3D-Preview, Results Display, Wall-Thickness Control |
| 1.7.3 | Ausgasungs-Integration | ⬜ | - | [STL_GEOMETRY_IMPORT_SPEC.md](./STL_GEOMETRY_IMPORT_SPEC.md) | 1-2h | Tab "STL Import" in Outgassing Calculator |
| 1.7.4 | Leak Planner Integration + Polish | ⬜ | - | [STL_GEOMETRY_IMPORT_SPEC.md](./STL_GEOMETRY_IMPORT_SPEC.md) | 2-3h | Wiederverwendung, Screenshot-Export, Material-Switcher |

**MVP-Scope (1.7.1-1.7.3):** 8-12h → STL-Upload, 3D-Vorschau, automatische Geometrie-Berechnung, Wandstärken-Korrektur

### Golden Run Vergleich (Priorität 1.10) 🎯 QUICK WIN

> **"Schatten-Plot" einer Referenzmessung zur Abweichungs-Erkennung**
> Lade "Golden Run" CSV und lege es als Schatten unter aktuelles Spektrum → sofort sichtbar: "Wo weicht meine Messung vom Soll ab?"

| # | Feature | Status | 🔬 Validiert? | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|---------------|------------|---------|---------|
| 1.10.1 | CSV Reference Loader | ⬜ | - | TBD | 4-6h | Load 2nd CSV, synchronize x-axis (time), overlay as shadow |
| 1.10.2 | Deviation Highlighting | ⬜ | - | TBD | 2-3h | Colorize areas where |delta| > threshold |

**MVP-Scope:** 6-9h → Shadow-Plot, Deviation Highlighting, X-Axis Sync
**Commercial Validation:** MKS + Inficon nutzen das für Halbleiter-QA

### Spektralsimulation (Priorität 1.11) 🧪 ADVANCED

> **Theoretisches Spektrum als Overlay für Kalibrierungs-Check**
> "Zeig mir wie N₂ bei diesem Druck aussehen würde" → plotte theoretische Kurve über echte Daten

| # | Feature | Status | 🔬 Validiert? | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|---------------|------------|---------|---------|
| 1.11.1 | Cracking Pattern Database | ⬜ | - | TBD | 6-8h | 10 wichtigste Gase: H₂, He, N₂, O₂, Ar, H₂O, CO, CO₂, CH₄, NH₃ (aus NIST/Hiden) |
| 1.11.2 | Simulation Engine | ⬜ | - | TBD | 4-6h | Berechne theoretisches Spektrum aus Gas + Druck |
| 1.11.3 | Overlay UI | ⬜ | - | TBD | 2-3h | Dropdown Gas-Auswahl, opacity-control |

**MVP-Scope:** 12-17h → 10 Gase, Simulation Engine, Overlay
**Commercial Validation:** Hiden Genetic Algorithms, Pfeiffer Matrix-Inversion
**Limitation:** Nur 10 wichtigste Gase (volle NIST-Lizenz später)

### Zeitreihen-Analyse (Priorität 2)

> Multi-Scan-Analyse für zeitaufgelöste RGA-Messungen (Prozessüberwachung, Pumpdown-Analyse)

| # | Feature | Status | 🔬 Validiert? | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|---------------|------------|---------|---------|
| 2.1 | Zeitreihen MVP (Parser) | ⬜ | - | [TIMESERIES_FEATURE_SPEC.md](./TIMESERIES_FEATURE_SPEC.md) | 4-6h | Multi-Scan Parser, Datenmodell |
| 2.2 | Zeitreihen MVP (UI) | ⬜ | - | [TIMESERIES_FEATURE_SPEC.md](./TIMESERIES_FEATURE_SPEC.md) | 8-12h | Trend-Chart, Spektrum-Slider |
| 2.3 | Zeitreihen Analyse | ⬜ | - | [TIMESERIES_FEATURE_SPEC.md](./TIMESERIES_FEATURE_SPEC.md) | 6-8h | Trend-Berechnung, Exp. Fit |
| 2.4 | Heatmap Visualisierung | ⬜ | - | TBD | 6-8h | 3D Trend-Masse-Intensität Karte (Hiden-Feature): Masse (X) × Zeit (Y) → Intensität als Farbe. "Wetterkarte fürs Vakuum" |

**MVP-Scope (2.1-2.4):** 24-34h → Parser, UI, Trend Analysis, Heatmaps
**Commercial Validation:** Hiden nutzt 3D-Heatmaps als Hauptfeature für transiente Events

---

## 🏗️ App-Infrastruktur & Qualität

> Fundament für Robustheit, Code-Qualität, Performance und User Experience

### Fundament (Priorität 1)

| # | Feature | Status | 🔬 Validiert? | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|---------------|------------|---------|---------|
| 1.1 | Error Handling Grundgerüst | ⬜ | - | [FEATURE_3.1_ERROR_HANDLING_PLAN.md](./FEATURE_3.1_ERROR_HANDLING_PLAN.md) | 1-2 Tage | Toast, Error-Boundary, Error-Store - **NÄCHSTE PRIORITÄT** (parallel zu 1.6 Leak Planner) |
| 1.2 | Firebase Auth Migration | ⏸️ | - | [FEATURE_3.2_FIREBASE_AUTH_PLAN.md](./FEATURE_3.2_FIREBASE_AUTH_PLAN.md) | 2-4h | E-Mail + Passwort, Passwort-Reset - **SPÄTER** (nur 3 Nutzer aktuell) |

### Code-Qualität (Priorität 4)

| # | Feature | Status | 🔬 Validiert? | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|---------------|------------|---------|---------|
| 4.1 | **Icon-Vereinheitlichung** | ⬜ | - | - | 2-3h | Emojis → SVG Heroicons: KnowledgePanel (15+ diagnoses), DiagnosisPanel (via Datentyp), QualityChecks |
| 4.2 | Design Tokens | ⬜ | - | [SHARED_COMPONENTS_SPEC.md](./SHARED_COMPONENTS_SPEC.md) | 2h | Farben, Abstände, Schatten |
| 4.3 | Shared Chart Components | ⬜ | - | [SHARED_COMPONENTS_SPEC.md](./SHARED_COMPONENTS_SPEC.md) | 8h | BaseChart, ChartControls |
| 4.4 | Shared Data Components | ⬜ | - | [SHARED_COMPONENTS_SPEC.md](./SHARED_COMPONENTS_SPEC.md) | 4h | DataTable, MetadataCard |
| 4.5 | Shared Input Components | ⬜ | - | [SHARED_COMPONENTS_SPEC.md](./SHARED_COMPONENTS_SPEC.md) | 4h | NumberInput, RangeSlider |

### UX Polish (Priorität 5)

| # | Feature | Status | 🔬 Validiert? | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|---------------|------------|---------|---------|
| 5.1 | Keyboard Shortcuts | ⬜ | - | [UX_INTERACTIONS.md](./UX_INTERACTIONS.md) | 2h | Globale + Chart Shortcuts |
| 5.2 | Chart Zoom/Pan | ⬜ | - | [UX_INTERACTIONS.md](./UX_INTERACTIONS.md) | 4h | Scroll, Drag, Rechteck-Zoom |
| 5.3 | Undo/Redo System | ⬜ | - | [UX_INTERACTIONS.md](./UX_INTERACTIONS.md) | 4h | Zustand-History |
| 5.4 | Touch-Gesten | ⬜ | - | [UX_INTERACTIONS.md](./UX_INTERACTIONS.md) | 4h | Pinch-to-Zoom, Swipe |

### Performance (Priorität 6)

| # | Feature | Status | 🔬 Validiert? | Spec-Datei | Aufwand | Notizen |
|---|---------|--------|---------------|------------|---------|---------|
| 6.1 | Web Worker Setup | ⬜ | - | [PERFORMANCE_GUIDE.md](./PERFORMANCE_GUIDE.md) | 4h | Parser Worker |
| 6.2 | LTTB Downsampling | ⬜ | - | [PERFORMANCE_GUIDE.md](./PERFORMANCE_GUIDE.md) | 2h | Chart-Optimierung |
| 6.3 | Virtualisierte Tabellen | ⬜ | - | [PERFORMANCE_GUIDE.md](./PERFORMANCE_GUIDE.md) | 4h | react-window |
| 6.4 | Lazy Loading | ⬜ | - | [PERFORMANCE_GUIDE.md](./PERFORMANCE_GUIDE.md) | 2h | Code Splitting |

---

## Abgeschlossene Features

| Feature | Abgeschlossen | Spec-Datei | Notizen |
|---------|---------------|------------|---------|
| RGA Analyser Basis | 2025-12 | [done/RGA_ANALYSER_PLAN.md](./done/RGA_ANALYSER_PLAN.md) | Grundfunktionalität |
| Web Research Integration | 2025-12 | [done/RGA_WEB_RESEARCH_ADDENDUM.md](./done/RGA_WEB_RESEARCH_ADDENDUM.md) | Pfeiffer Know-How |
| Rate-of-Rise Feature | 2026-01 | [done/RATE_OF_RISE_FEATURE_SPEC.md](./done/RATE_OF_RISE_FEATURE_SPEC.md) | Leckraten-Analyse |
| Knowledge Section | 2026-01 | - | Intro-Texte, RoR Tab |
| **Datenqualität (Prio 0)** | 2026-01-08 | [IMPLEMENTATION_SPEC.md](../ARCHIVED/IMPLEMENTATION_SPEC.md) | RSF, 4 Gase, 4 Massen, 4 Detektoren, 2 Profile |
| **Ausgasungs-Simulator** | 2026-01-08 | [RGA_APP_VERBESSERUNGEN.md](./RGA_APP_VERBESSERUNGEN.md) | Multi-Material, Leck-vs-Ausgasung, RoR+RGA Integration |
| **Isotopen-Analyse** | 2026-01-08 | [RGA_APP_VERBESSERUNGEN.md](./RGA_APP_VERBESSERUNGEN.md) | 10 Elemente, Fragment-Muster, verifyIsotopeRatios Detektor |
| **Konfidenz-Score System** | 2026-01-08 | [RGA_APP_VERBESSERUNGEN.md](./RGA_APP_VERBESSERUNGEN.md) | 6 aktive Faktoren (SNR, Peaks, Dynamik, Temp, Massenbereich, H₂), Grade A-F. Kalibrieralter vorbereitet (weight=0) |
| **ESD-Artefakt-Erkennung** | 2026-01-09 | [RGA_APP_VERBESSERUNGEN.md](./RGA_APP_VERBESSERUNGEN.md) | 6 Kriterien (O⁺/O₂, N⁺/N₂, C⁺/CO, H⁺/H₂, F⁺, Cl), dynamische Severity, spezifische Degassing-Empfehlungen. Knowledge-Datenbank aktualisiert (Gase-Tab, Massen-Tab, AI-Prompts). Plan: [done/ESD_ARTEFAKT_ERKENNUNG_PLAN.md](./done/ESD_ARTEFAKT_ERKENNUNG_PLAN.md) |
| **Helium-Leck-Indikator** | 2026-01-09 | [RGA_APP_VERBESSERUNGEN.md](./RGA_APP_VERBESSERUNGEN.md#4-helium-lecktest-integration) | Qualitative m/z=4 Detektion (He/D₂). NICHT quantitative Leckrate! Warnung bei m/z 4 > 0.01 und He/H₂ > 0.1 mit Empfehlung für dedizierten He-Leckdetektor (Sensitivität ~5×10⁻¹² mbar·l/s). Knowledge-Panel-Eintrag hinzugefügt. |
| ~~**Erweiterte Öl-Diagnose**~~ | 2026-01-09 | ❌ VERWORFEN | Web-Recherche ergab: (1) FOMBLIN-Kategorisierungsfehler (ist PFPE, kein Kohlenwasserstoff), (2) Öl-Typ-Unterscheidung wissenschaftlich nicht belegt, (3) Existierender `detectOilBackstreaming()` ist korrekt und ausreichend. Dokumentation: [done/OEL_DIAGNOSE_VERWORFEN_NICHT_VALIDE.md](./done/OEL_DIAGNOSE_VERWORFEN_NICHT_VALIDE.md) |
| **Leak Search Planner Demo** | 2026-01 | [src/components/LeakSearchDemo.tsx](../src/components/LeakSearchDemo.tsx) | B2/B5/B6 Decision Logic, Input-System, Warnsystem, Timing-Kalk. (10% volle Version) |

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

### FEATURE_3.1_ERROR_HANDLING_PLAN.md
- **Umsetzbarkeit:** ⭐⭐⭐⭐ (Klare Struktur, schrittweise)
- **Komplexität:** ⭐⭐⭐ (5 Phasen)
- **Bedarf:** ⭐⭐⭐⭐⭐ (Fundament für Robustheit)
- **Fazit:** Sollte früh implementiert werden

### FEATURE_3.2_FIREBASE_AUTH_PLAN.md
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

### STL_GEOMETRY_IMPORT_SPEC.md (NEU) 🎨
- **Umsetzbarkeit:** ⭐⭐⭐⭐ (Three.js gut dokumentiert, klare Algorithmen)
  - STL-Parser: Three.js STLLoader (battle-tested)
  - Geometrie-Berechnung: Standard-Algorithmen (Signed Volume, Triangle Area)
  - 3D-Vorschau: OrbitControls (out-of-the-box)
  - Vollständige Spec mit TypeScript Code-Examples
- **Komplexität:** ⭐⭐⭐ (Mittel)
  - 4 Phasen, 10-15h für MVP
  - Mathematik überschaubar (Vektorrechnung)
  - Bundle-Impact: ~620 KB (Three.js)
  - **Challenge:** Innenflächen-Problem (gelöst via Wall-Correction)
- **Bedarf:** ⭐⭐⭐⭐ (Dringend)
  - **Zeitersparnis:** 10 Minuten → 30 Sekunden
  - **Fehlerreduktion:** CAD-Werte genauer als manuelle Eingabe
  - **Workflow-Fit:** Ingenieure haben CAD-Modelle bereits
  - **Wow-Faktor:** 3D-Vorschau erhöht wahrgenommene Professionalität
  - **Wiederverwendbar:** Ausgassung + Lecksuche-Planer profitieren
- **Spec-Qualität:** **9/10** (Sehr gut)
  - Vollständige TypeScript API definiert
  - UI/UX-Workflow spezifiziert
  - Test-Cases + Fixtures
  - Performance-Benchmarks
  - Edge-Case Handling
  - User-Dokumentation
- **Prioritäts-Score:** `4 × 4 / 3 = 5.3` → **Hoch**
- **Fazit:** **Großer UX-Win** - Professional Feature, das echte User-Probleme löst. Realistischer Aufwand, wiederverwendbar.

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
| 2026-01-09 | ✅ **Leak Search Planner Demo (1.6.0) existiert:** Funktionsfähige Demo als LeakSearchDemo.tsx - Decision Logic (B2/B5/B6), Input-System, 9-Typen Warnsystem, Volumen-Kalkulator. In FunctionSelector integriert (~10% der vollständigen Version). Nächste Phase: Vollversion mit Wizard + Equipment DB. |
| 2026-01-09 | **Priorität 1.7 hinzugefügt:** STL Geometry Import - CAD-Modell Upload für automatische Volumen/Oberflächen-Berechnung. 3D-Vorschau mit Three.js, Wandstärken-Korrektur, Integration in Ausgasungs-Rechner + Lecksuche-Planer. MVP: 8-12h. Spec-Qualität: 9/10 |
| 2026-01-09 | ✅ **ESD-Artefakt-Erkennung (1.5.4) erweitert:** 6 Kriterien statt 3 - neue Ratio-Tests für N⁺/N₂⁺ (m14/m28), C⁺/CO⁺ (m12/m28), H⁺/H₂⁺ (m1/m2). Dynamische Severity (info→warning ab 4 Kriterien). Spezifische Empfehlungen (leicht: 10min Degasen, schwer: 30min + Filament-Tausch). Affected Masses dynamisch generiert. |
| 2026-01-09 | ✅ **Knowledge-Datenbank aktualisiert:** ESD-Diagnose erweitert (6 Kriterien dokumentiert), Neue Gase hervorgehoben (NF₃, WF₆, C₂F₆, GeH₄), Neue Massen hervorgehoben (52, 119, 127, 149 - Phthalat!), AI-Prompts aktualisiert. |
| 2026-01-09 | ✅ **Helium-Leck-Indikator (1.5.5) wissenschaftlich validiert:** Web-Recherche bestätigte qualitative vs. quantitative Unterscheidung. RGAs sind 1-2 Größenordnungen weniger empfindlich als dedizierte He-Leckdetektoren (~5×10⁻¹² mbar·l/s). Quantitative Leckraten-Berechnung aus RGA-Signal NICHT wissenschaftlich belegt. Implementierter Ansatz validiert: m/z 4 > 0.01 + He/H₂ > 0.1 für qualitative Erkennung. 20+ Quellen dokumentiert (Hiden, Kurt Lesker, MKS, SRS) in [SCIENTIFIC_REFERENCES.md](../RGA_Knowledge/SCIENTIFIC_REFERENCES.md). |
| 2026-01-09 | ❌ **Erweiterte Öl-Diagnose (1.5.6) nach Validierung verworfen:** Web-Recherche identifizierte kritische Probleme: (1) FOMBLIN-Kategorisierungs-Fehler - Spec ordnete FOMBLIN als Kohlenwasserstoff-Öl ein, aber FOMBLIN ist Perfluoropolyether (PFPE) mit CF₃⁺ bei m/z 69, (2) Öl-Typ-Unterscheidung wissenschaftlich nicht belegt - Kurt Lesker: "does not provide information distinguishing between different oil types", (3) Existierender `detectOilBackstreaming()` bereits korrekt (Δ14 amu Pattern). Feature als pseudowissenschaftlich eingestuft und verworfen. 15+ Quellen dokumentiert. Rejection-Dokumentation: [OEL_DIAGNOSE_VERWORFEN_NICHT_VALIDE.md](./done/OEL_DIAGNOSE_VERWORFEN_NICHT_VALIDE.md). |
| 2026-01-09 | 📊 **Validierungs-Status-Übersicht erstellt:** Systematische Analyse aller 30 wissenschaftlichen Features und Detektoren. Ergebnis: 8 vollständig validiert (27%), 13 teilvalidiert (43%), 8 nicht validiert (27%), 1 verworfen (3%). Prioritäten für zukünftige Validierung definiert. Dokument: [WISSENSCHAFTLICHE_VALIDIERUNG_STATUS.md](./WISSENSCHAFTLICHE_VALIDIERUNG_STATUS.md) |
| 2026-01-10 | 🔄 **FEATURE_BACKLOG.md Struktur überarbeitet:** Umorganisierung von Prioritäts-Nummern zu kategorialen Sektionen. Neue Struktur: (1) 📊 Wissenschaftliche Features & Detektoren, (2) 🛠️ Anwendungs-Features & Tools, (3) 🏗️ App-Infrastruktur & Qualität. Viel übersichtlicher und klar getrennt nach Feature-Typ. Alle Prioritäts-IDs bleiben unverändert (0, 1, 1.5, 1.6, 1.7, 1.8, 2, 3, 4, 5, 6). |
| 2026-01-10 | 🧪 **Priorität 1.9 hinzugefügt (Gemini-3-Pro Cross-Validation):** 5 neue Offline-Analyse Features identifiziert: (1) Kinetic Fingerprinting (Desorptions-Kinetik n-Exponent), (2) Dynamic LOD (3σ IUPAC), (3) Statistical Uncertainty (Confidence Intervals), (4) Intelligent Background Subtraction, (5) Permeation Lag Detection (Elastomer Check). Außerdem 2 kritische Bugs gefunden: Rate-of-Rise Curve Fitting Models vertauscht + Temperature Correction Formula inverted! |
| 2026-01-10 | 🐛 **Kritische Bug-Fixes implementiert:** (1) Temperature Correction Formula korrigiert (T_curr/T_ref statt T_ref/T_curr) - hot gauges measure lower density, Korrektur muss nach oben! (2) Rate-of-Rise Curve Fitting Model-Beschreibungen korrigiert - Virtual Leak: Exponential (1-e^(-t/τ)), Outgassing: Logarithmic (ln(t)). Implementierungs-Logik war korrekt, nur Dokumentation/Beschreibungen gefixt. Wissenschaftlicher Impact: HOCH. |

---

## Nächste Schritte

**Abgeschlossen (2026-01-08):**
1. [x] ~~**RSF-Korrekturen sofort umsetzen**~~ ✅ Erledigt
2. [x] ~~Neue Gase + Massen + Detektoren hinzufügen~~ ✅ Erledigt
3. [x] ~~**Ausgasungs-Simulator** (Priorität 1.5.1)~~ ✅ Erledigt
4. [x] ~~**Isotopen-Analyse** (Priorität 1.5.2)~~ ✅ Erledigt
5. [x] ~~**Konfidenz-Score System** (Priorität 1.5.3)~~ ✅ Erledigt
6. [x] ~~**ESD-Artefakt-Erkennung** (Priorität 1.5.4)~~ ✅ Erledigt (2026-01-09)
7. [x] ~~**Helium-Leck-Indikator** (Priorität 1.5.5)~~ ✅ Erledigt (2026-01-09)
8. [x] ~~**Erweiterte Öl-Diagnose** (Priorität 1.5.6)~~ ❌ Verworfen (2026-01-09) - Wissenschaftlich nicht valide

**Aktuelle Top-Prioritäten (Team-Aufteilung):**

**Kollegin:**
7. [ ] 🔥 **Lecksuche-Planer MVP** (Priorität 1.6.1-1.6.3) - **16-21h**
   - Phase 1: Core Engine & Types (6-8h)
   - Phase 2: UI Wizard Quick Mode (8-10h)
   - Phase 3: Report & Markdown Export (2-3h)
   - **Begründung:** Spec-Qualität 10/10, Alleinstellungsmerkmal, Marktlücke ($15.8B Market)

**Du (parallel):**
8. [ ] **Error Handling Grundgerüst** (Priorität 1.1) - **1-2 Tage**
   - Toast System, Error-Boundary, Error-Store
   - 20+ Fehler-Codes (Parser, Metadaten, Daten, Zeitstempel)
   - Recovery-Strategien

**Später (deprioritized):**
9. ⏸️ Firebase Auth Migration (Priorität 1.2) - nur 3 Nutzer aktuell
10. [ ] 1.5er Features weitermachen (Helium, Öl, Deconvolution)
11. [ ] Zeitreihen Parser (Priorität 2.1-2.3)

---

*Dieses Dokument wird kontinuierlich aktualisiert.*
