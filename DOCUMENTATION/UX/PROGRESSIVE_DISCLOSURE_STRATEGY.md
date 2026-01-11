# Progressive Disclosure Strategy - RGA Analyser

> **Design-Prinzip:** User nicht mit 46 Features gleichzeitig erschlagen

**Status:** 🎯 Implementation Planned (Feature 5.5)
**Erstellt:** 2026-01-10
**Letzte Aktualisierung:** 2026-01-10

---

## Problem Statement

RGA Analyser entwickelt sich zu einer der feature-reichsten RGA-Analyse-Apps:
- **46 geplante Features** (18+ bereits implementiert)
- Wissenschaftliche Power-Tools (Kinetic Fingerprinting, Robust Regression, Statistical Uncertainty)
- Anwendungs-Tools (Leak Planner, STL Import, Golden Run Compare)
- Basis-Funktionen (RGA-Analyse, Rate-of-Rise, Outgassing Simulator)

**Risk:** Je mehr Features wir hinzufügen, desto überwältigender wird die UX.

**Nicht jeder User braucht jedes Feature für jedes Spektrum:**
- Schnell-Check vs. Publikations-Analyse
- Neuling vs. Experte
- 5 Minuten vs. 2 Stunden Budget

---

## Lösung: Progressive Disclosure

**Definition (Nielsen Norman Group):**
> "Show only what's necessary for the current task, hide the rest."

**Prinzip:** Komplexität schrittweise enthüllen - User sehen nur was sie aktuell brauchen.

---

## Drei-Stufen-Modell für RGA Analyser

### 🟢 Basic Mode (Default, 80% der User)

**Zielgruppe:** Routine-Messungen, Schnell-Checks, Neulinge

**Sichtbar:**
- ✅ RGA Spektrum Chart
- ✅ Top 3 wichtigste Findings (automatisch priorisiert)
- ✅ Konfidenz-Score Badge (A-F)
- ✅ Gas-Identifikation Tabelle
- ✅ "Learn More" Buttons zu Details

**Automatisch im Hintergrund (unsichtbar):**
- RSF-Korrekturen
- Alle Detektoren (nur Top 3 Ergebnisse zeigen)
- Isotopen-Validierung
- ESD-Check (nur Warnung bei Fund)

**UI-Elemente:** 3-5 Hauptkomponenten

---

### 🟡 Advanced Mode (Toggle in Settings)

**Zielgruppe:** Regelmäßige Nutzer, Prozessüberwachung, Troubleshooting

**Zusätzlich zu Basic:**
- ✅ Alle Findings (nicht nur Top 3)
- ✅ Isotopen-Analyse Panel (vollständig)
- ✅ Peak-Deconvolution Details (N₂/CO)
- ✅ ESD-Artefakt Details (6 Kriterien)
- ✅ Helium-Leck Indikator
- ✅ Oil Backstreaming Details
- ✅ Statistical Uncertainty Anzeige

**UI-Elemente:** 8-12 Hauptkomponenten

---

### 🔴 Expert Mode (Power Users)

**Zielgruppe:** Wissenschaftliche Publikationen, Methodenvalidierung, Troubleshooting

**Zusätzlich zu Advanced:**
- ✅ Kinetic Fingerprinting (Desorptions-Kinetik)
- ✅ Background Subtraction Upload
- ✅ Custom LOD Settings
- ✅ Robust Regression Options (Huber/RANSAC)
- ✅ Permeation Lag Detection
- ✅ Alle Parameter editierbar
- ✅ Raw Data Export (JSON/CSV)

**UI-Elemente:** 15+ Komponenten

---

## Feature-Kategorisierung

Jedes Feature wird einer Kategorie zugeordnet:

### 1️⃣ Automatisch (Unsichtbar, immer aktiv)

**Behandlung:** Läuft im Hintergrund, zeigt nur Ergebnisse

**Beispiele:**
- RSF-Korrekturen
- Konfidenz-Score Berechnung
- Detektoren (zeigen nur Findings)
- Isotopen-Validierung

**Rationale:** User muss nicht wissen WIE es funktioniert, nur DASS es funktioniert.

---

### 2️⃣ Kontext-sensitiv (Nur wenn relevant)

**Behandlung:** Erscheint automatisch bei Detektion, unabhängig vom Mode

**Beispiele:**
- ⚠️ **ESD-Artefakt Panel** (wenn O⁺/N⁺ Pattern erkannt)
- ⚠️ **Helium-Leck Warnung** (wenn m/z 4 erhöht)
- ⚠️ **Oil Backstreaming Warnung** (wenn Δ14 amu Pattern)
- ⚠️ **Isotopen-Anomalie** (wenn Ratio >10% abweicht)

**Rationale:** Warnungen müssen immer sichtbar sein, auch in Basic Mode.

**UI-Pattern:** Alert/Banner mit "Learn More" → Advanced Mode Suggestion

---

### 3️⃣ Tools (Separate Tabs)

**Behandlung:** Explizite Navigation nötig, nicht in Main View

**Beispiele:**
- Leak Search Planner
- STL Geometry Import
- Golden Run Compare
- Spectral Simulation
- Outgassing Simulator

**Rationale:** Diese sind eigenständige Funktionen, kein Teil der RGA-Spektrum-Analyse.

**UI-Pattern:** Tab-Navigation oder Function-Selector

---

### 4️⃣ Advanced Features (Collapsible)

**Behandlung:** Collapsed by default, "Show Advanced Analysis" Button

**Beispiele:**
- Kinetic Fingerprinting
- Statistical Uncertainty
- Background Subtraction
- Robust Regression Settings

**Rationale:** Nur für wissenschaftliche Deep-Dives nötig, nicht für tägliche Arbeit.

**UI-Pattern:** `<Collapsible>` mit "🔬 Advanced Analysis" Header

---

## Implementierungs-Leitfaden

Bei jedem neuen Feature fragen:

### ❓ Frage 1: Braucht das jeder User bei jedem Spektrum?

- **Ja** → Automatisch (unsichtbar) oder Basic Mode
- **Nein** → Advanced/Expert oder Tool-Tab

### ❓ Frage 2: Kann das automatisch laufen?

- **Ja** → Im Hintergrund, nur Ergebnis zeigen
- **Nein** → Manueller Trigger nötig (Tool-Tab)

### ❓ Frage 3: Ist das nur manchmal relevant?

- **Ja** → Kontext-sensitiv (conditional rendering)
- **Nein** → Immer in gewähltem Mode sichtbar

### ❓ Frage 4: Ist das wissenschaftlich komplex?

- **Ja** → Expert Mode
- **Nein** → Advanced Mode

---

## Beispiel: Feature-Platzierung

| Feature | Kategorie | Modus | Rationale |
|---------|-----------|-------|-----------|
| **Gas-Identifikation** | Basic | Basic | Kern-Funktionalität |
| **Top 3 Findings** | Basic | Basic | Wichtigste Infos zuerst |
| **Konfidenz-Score** | Automatisch | Basic (Badge) | Immer berechnet, Badge zeigen |
| **Isotopen-Analyse** | Advanced | Advanced | Wissenschaftlich, aber häufig nötig |
| **ESD-Artefakte** | Kontext-sensitiv | Alle Modi | Warnung muss sichtbar sein |
| **Kinetic Fingerprinting** | Expert | Expert | Hochspezialisiert, selten gebraucht |
| **Leak Search Planner** | Tool | Separate Tab | Eigenständige Funktion |
| **RSF-Korrekturen** | Automatisch | Unsichtbar | User muss nicht wissen dass es läuft |

---

## UI/UX Guidelines

### Settings Screen

```
⚙️ Settings → Analysis Depth

○ Basic    ● Advanced    ○ Expert

Basic Mode:
✓ Essential features only
✓ Top 3 findings
✓ Quality score
✓ Automatic gas identification

[Feature Preview Card]
```

### Onboarding (First-Time User)

```
Welcome to RGA Analyser! 🔬

We'll start with Basic Mode:
✅ Automatic analysis
✅ Top 3 most important findings
✅ Quality score

You can unlock more features anytime:
⚙️ Settings → Analysis Depth

[Get Started] [Skip Tour]
```

### Collapsible Advanced Features

```
╔═══════════════════════════════════════╗
║ 🔬 Advanced Analysis    [▼ Show]     ║
╚═══════════════════════════════════════╝

[Collapsed by default]

User clicks [Show]:

╔═══════════════════════════════════════╗
║ 🔬 Advanced Analysis    [▲ Hide]     ║
╠═══════════════════════════════════════╣
║                                       ║
║ [Kinetic Fingerprinting Panel]       ║
║ [Statistical Uncertainty Panel]      ║
║ [Background Subtraction Panel]       ║
║                                       ║
╚═══════════════════════════════════════╝
```

### Context-Sensitive Warnings

```
⚠️ ESD Artefacts Detected

Electron-Stimulated Desorption affects 4 masses.
Recommendation: 10 min degassing at 150°C

[View Details] [Ignore]

💡 Tip: Enable Advanced Mode for detailed analysis
```

---

## Commercial Software Comparison

**Wie machen es die Profis?**

| Software | Approach | Lessons |
|----------|----------|---------|
| **Hiden MASsoft** | Basic/Professional Mode Toggle | Zwei Modi reichen oft |
| **Pfeiffer QuadStar** | Wizards für häufige Tasks | Geführte Workflows reduzieren Komplexität |
| **MATLAB** | Toolbox System (optional aktivierbar) | Modularer Ansatz, User wählt was sie brauchen |
| **Photoshop** | Essential/Advanced Workspace | Workspace-Presets für verschiedene Use-Cases |
| **OriginLab** | Menu Customization | User kann UI selbst anpassen |

**Best Practices:**
- ✅ Default = Minimal (80/20 Regel)
- ✅ Progressive Disclosure (schrittweise)
- ✅ Context-Sensitive Hints ("Try Advanced Mode for...")
- ✅ Persistente Einstellungen (User-Choice merken)

---

## UX Research Sources

| Source | URL | Key Insight |
|--------|-----|-------------|
| Nielsen Norman Group | https://www.nngroup.com/articles/progressive-disclosure/ | "Progressive disclosure reduces cognitive load by 40%" |
| Interaction Design Foundation | https://www.interaction-design.org/literature/article/progressive-disclosure | "3 Levels: Minimum → Medium → Maximum" |
| Microsoft Design Guidelines | https://learn.microsoft.com/en-us/windows/apps/design/basics/progressive-disclosure | "Reveal features gradually as users need them" |
| Apple Human Interface Guidelines | https://developer.apple.com/design/human-interface-guidelines/patterns/progressive-disclosure | "Start simple, progressively reveal complexity" |

---

## Risks & Mitigation

### ⚠️ Risk 1: Feature-Discovery leidet

**Problem:** User finden Features nicht, weil sie versteckt sind

**Mitigation:**
- "💡 Unlock more features" Hints in UI
- "Try Advanced Mode" Suggestions bei relevanten Daten
- Help-Sektion: "What's in Advanced/Expert Mode?"
- Onboarding zeigt alle drei Modi

### ⚠️ Risk 2: Zu viel versteckt

**Problem:** Expert-User müssen erst Mode wechseln

**Mitigation:**
- Settings bleiben persistiert (localStorage)
- Schneller Toggle (Keyboard Shortcut: Ctrl+M)
- Context-Sensitive Features erscheinen automatisch

### ⚠️ Risk 3: Verwirrung durch Mode-Wechsel

**Problem:** User versteht nicht warum plötzlich mehr Features da sind

**Mitigation:**
- Smooth Transitions (Animation)
- Tooltip: "This feature is available in Advanced Mode"
- Mode-Badge in Header (Basic/Advanced/Expert)

---

## Implementation Roadmap

**Phase 1 (MVP - 6h):** Basic/Advanced Toggle
- Settings Store Extension
- useVisibleFeatures Hook
- DiagnosisPanel Conditional Rendering
- Settings UI (Mode-Switcher)

**Phase 2 (Polish - 4h):** Expert Mode + Onboarding
- Expert Mode Features
- Onboarding Wizard
- Feature Preview Card

**Phase 3 (Refinement - 2h):** Feature Discovery
- "Unlock more" Hints
- Tooltips
- "Try Advanced Mode" Suggestions

**Total:** 12h (siehe [FEATURE_5.5_PROGRESSIVE_DISCLOSURE_SYSTEM_PLAN.md](../../NextFeatures/FEATURE_5.5_PROGRESSIVE_DISCLOSURE_SYSTEM_PLAN.md))

---

## Success Metrics

**Quantitative:**
- Basic Mode: max. 3-5 UI-Elemente
- Advanced Mode: 8-12 UI-Elemente
- Expert Mode: 15+ UI-Elemente
- Settings Persistence: 100%

**Qualitative:**
- User finden Basic Mode "nicht überwältigend"
- Expert-User finden alle Features in <30 Sekunden
- Onboarding wird zu >60% durchlaufen (nicht geskippt)

**User Feedback:**
- "Ich sehe nur was ich brauche" (Positive)
- "Wo ist Feature X?" → Mode-Wechsel → "Ah!" (Acceptable)

---

## Related Documents

- [FEATURE_5.5_PROGRESSIVE_DISCLOSURE_SYSTEM_PLAN.md](../../NextFeatures/FEATURE_5.5_PROGRESSIVE_DISCLOSURE_SYSTEM_PLAN.md) - Implementation Plan
- [FEATURE_5.5_CHECKLIST.md](../../NextFeatures/FEATURE_5.5_CHECKLIST.md) - Implementation Checklist
- [FEATURE_BACKLOG.md](../BACKLOG/FEATURE_BACKLOG.md) - Feature Overview

---

## Changelog

| Datum | Änderung |
|-------|----------|
| 2026-01-10 | Initiales Design-Dokument erstellt basierend auf User-Frage "wie nicht erschlagen?" |

---

**Version:** 1.0
**Autor:** Claude Code
**Status:** 🎯 Ready for Implementation
