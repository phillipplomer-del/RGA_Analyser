# RGA Spectrum Analyser

Web-App zur Auswertung von Restgasanalyse-Messungen (RGA) aus Pfeiffer Vacuum Prisma Plus/Pro Geräten.

## Features

### Datenimport & Parsing
- Upload von `.asc` Textdateien (Pfeiffer Vacuum Format)
- Automatische Metadaten-Extraktion (Datum, Druck, Kammer, etc.)
- Unterstützung für Mehrfach-Uploads und Dateivergleich

### Spektrum-Analyse
- **Background Subtraction**: Automatische Untergrundkorrektur
- **H₂-Normalisierung**: Alle Peaks relativ zum H₂-Peak (Masse 2 = 100%)
- **Peak-Detektion**: Automatische Erkennung signifikanter Peaks
- **Gas-Identifikation**: Zuordnung von Massen zu Gasen (H₂, H₂O, N₂, O₂, CO, CO₂, Ar, etc.)

### Grenzwert-Prüfung
- **GSI Standard**: Grenzwerte für Beschleuniger-Vakuumsysteme
- **CERN Standard**: Strengere Grenzwerte für Teilchenbeschleuniger
- **Benutzerdefinierte Profile**: Eigene Grenzwertprofile erstellen und speichern

### Automatische Diagnose
- **Systemzustand-Erkennung**: Unbaked, Baked, Contaminated, Air Leak
- **Kontaminationsanalyse**:
  - Öl/Kohlenwasserstoffe (charakteristische Patterns)
  - Luftlecks (O₂/N₂-Verhältnis)
  - Wasserprobleme
  - Filament-Degradation
- **Empfehlungen**: Konkrete Handlungsvorschläge basierend auf Diagnose

### KI-Interpretation
- **Claude API**: Detaillierte Spektrum-Interpretation
- **Gemini API**: Alternative KI-Analyse
- Kontextbezogene Bewertung mit Grenzwertprofil
- Mehrsprachige Unterstützung (DE/EN)

### Visualisierung
- **Interaktives D3.js Chart**:
  - Logarithmische/lineare Skala umschaltbar
  - GSI/CERN Grenzwertlinien ein-/ausblendbar
  - Zoom & Pan
  - Peak-Labels mit Gas-Identifikation
- **Peak-Tabelle**: Sortierte Liste aller detektierten Peaks
- **Qualitätschecks**: Visuelle Übersicht der Limit-Prüfungen

### Export-Funktionen
- **PDF Export**: Vollständiger Report mit Chart, Peaks, Diagnose
- **HTML Export**:
  - Interaktive Standalone-Datei
  - **Animierte Präsentation**: Automatische Tour durch das Spektrum
    - Zoom auf wichtige Massenbereiche
    - Highlight-Kreis markiert aktuelle Peaks
    - Erklärende Annotationen
  - Play/Pause/Restart Steuerung
  - Geschwindigkeitsregler
- **CSV Export**: Rohdaten für weitere Analyse

### Vergleichsfunktion
- Mehrere Spektren überlagern
- Peak-Differenzen berechnen
- Zeitlicher Verlauf analysieren

### Wissensdatenbank
- Integrierte RGA-Referenz
- Typische Massen und Gase
- Fragmentierungsmuster
- Troubleshooting-Guide

## Installation

```bash
# Repository klonen
git clone https://github.com/phillipplomer-del/RGA_Analyser.git
cd RGA_Analyser

# Dependencies installieren
npm install

# Development Server starten
npm run dev
```

## Verwendung

1. **Datei hochladen**: `.asc` Datei per Drag & Drop oder Dateiauswahl
2. **Spektrum analysieren**: Automatische Auswertung startet sofort
3. **Grenzwerte prüfen**: GSI/CERN Status wird angezeigt
4. **Diagnose lesen**: Automatische Problemerkennung im Diagnose-Panel
5. **KI-Interpretation**: Optional Claude/Gemini für detaillierte Analyse
6. **Exportieren**: PDF, HTML oder CSV für Dokumentation

## Technologie-Stack

| Komponente | Technologie |
|------------|-------------|
| Build Tool | Vite |
| Framework | React 18 |
| Sprache | TypeScript |
| Styling | Tailwind CSS 4 |
| Charts | D3.js |
| State | Zustand |
| AI APIs | Claude API, Gemini API |
| i18n | i18next |

## Projektstruktur

```
src/
├── components/          # React Komponenten
│   ├── SpectrumChart/   # D3.js Spektrum-Visualisierung
│   ├── DiagnosisPanel/  # Automatische Diagnose
│   ├── AIPanel/         # KI-Interpretation
│   ├── ExportPanel/     # Export-Funktionen
│   ├── LimitsPanel/     # Grenzwert-Profile
│   └── ...
├── lib/                 # Business Logic
│   ├── parser/          # .asc Datei-Parser
│   ├── analysis/        # Spektrum-Analyse
│   ├── diagnosis/       # Diagnose-Engine
│   ├── limits/          # Grenzwert-Definitionen
│   ├── export/          # PDF/HTML/CSV Export
│   ├── ai/              # AI-Integration
│   └── knowledge/       # Wissensdatenbank
├── store/               # Zustand State Management
└── types/               # TypeScript Definitionen
```

## Grenzwerte

### GSI Standard
- Masse ≤12 AMU: 100% (relativ zu H₂)
- Masse 13-19 AMU: 10%
- Masse 28 AMU: 10%
- Masse 44 AMU: 10%
- Masse >45 AMU: 0.1%

### CERN Standard (strenger)
- Masse ≤3 AMU: 100%
- Masse 4-20 AMU: 10%
- Masse 21-27 AMU: 1%
- Masse 28 AMU: 10%
- Masse 29-32 AMU: 1%
- Masse 33-43 AMU: 0.2%
- Masse 44-45 AMU: 5%
- Masse >45 AMU: 0.01%

## Lizenz

MIT License

## Autor

Phillip Plomer - GSI Helmholtzzentrum für Schwerionenforschung
