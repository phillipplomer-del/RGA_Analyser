# RGA Analyser - Feature-Dokumentation

Eine umfassende Webanwendung zur Analyse von Restgasanalyse (RGA) Spektren mit automatischer Diagnose, Qualitätsprüfung und Cloud-Integration.

---

**Stand:** 2026-01-08 | **Version:** 1.1.0

---

## Inhaltsverzeichnis

1. [Datenimport](#1-datenimport)
2. [Spektrum-Analyse](#2-spektrum-analyse)
3. [Limit-Profile](#3-limit-profile)
4. [Automatische Diagnose](#4-automatische-diagnose)
5. [Qualitätsprüfungen](#5-qualitätsprüfungen)
6. [Visualisierung](#6-visualisierung)
7. [Spektrum-Vergleich](#7-spektrum-vergleich)
8. [Export-Funktionen](#8-export-funktionen)
9. [Wissensdatenbank](#9-wissensdatenbank)
10. [Cloud & Firebase](#10-cloud--firebase)
11. [KI-Integration](#11-ki-integration)
12. [Druckkalibrierung](#12-druckkalibrierung)
13. [Benutzeroberfläche](#13-benutzeroberfläche)
14. [Rate of Rise](#14-rate-of-rise)
15. [Wissenschaftliche Analysewerkzeuge](#15-wissenschaftliche-analysewerkzeuge)

---

## 1. Datenimport

### Datei-Upload
- **Drag-and-Drop** Upload mit visuellem Feedback
- Unterstützung für **.asc-Dateien** (Pfeiffer Vacuum Quadera-Format)
- Alternatives ASCII SCAN ANALOG DATA Format (OIPT Software)
- **Batch-Upload** von bis zu 3 Dateien gleichzeitig
- Automatische Metadaten-Extraktion aus Dateiinhalt
- Kammernamens- und Druckwert-Extraktion aus Dateinamen

### Datenverarbeitung
- Extraktion von Masse-zu-Strom-Beziehungen
- Parsing wissenschaftlicher Notation für Elektronenströme
- Deutsche Dezimalformat-Konvertierung (Komma zu Punkt)
- Unterstützung mehrerer Scan-Zyklen (verwendet ersten Scan)
- ISO/IEC Dateiformat-Normalisierung

---

## 2. Spektrum-Analyse

### Analyse-Pipeline
| Schritt | Beschreibung |
|---------|--------------|
| Hintergrundsubtraktion | Automatische Basislinienkorrektur |
| H₂-Normalisierung | Normalisierung auf Masse 2 als Referenz (100% = H₂ Peak) |
| Peak-Erkennung | Erkennung für 32+ bekannte Massen |
| Gas-Identifikation | Zuordnung mit Fragmentierungsmustern |

### Y-Achsen-Modi
1. **Relativ** - Normalisiert auf H₂ (in %)
2. **Absolut** - Elektronenstrom in Ampere
3. **Druck** - Partialdruck in mbar (mit Kalibrierung)

### Bekannte Massen (32 Einträge)
- **Wasserstoff-Isotope**: H⁺ (m/z 1), H₂ (m/z 2)
- **Permanente Gase**: He, N₂, O₂, Ar, Ne
- **Kontaminanten**: H₂O, CO, CO₂, HCl
- **Kohlenwasserstoffe**: Verschiedene Massen 15-77
- **Halogene**: Fluor- und Chlorverbindungen
- **Schwefelverbindungen**: H₂S, SO₂

---

## 3. Limit-Profile

### Voreingestellte Standards

| Profil | Beschreibung | Normalisierung |
|--------|--------------|----------------|
| **GSI 7.3e (2019)** | GSI Standard für UHV-Komponenten | H₂ |
| **CERN 3076004 (2024)** | CERN Technische Spezifikation (strenger) | H₂ |
| **CERN Unbaked** | Für ungebackene Systeme | H₂O |
| **CERN Baked (H₂)** | Für gebackene Systeme | H₂ |
| **DESY HC-Free** | Kohlenwasserstoff-frei Kriterium | H₂ |
| **GSI Cryogenic** | Strengere Limits für kryogene Strahlrohre | H₂ |

### Benutzerdefinierte Profile
- Unbegrenzte eigene Profile erstellen
- Massenbereiche mit individuellen Grenzwerten
- Profile duplizieren, bearbeiten und löschen
- 8 Farboptionen für visuelle Unterscheidung
- Metadaten: Name, Beschreibung, Zeitstempel

---

## 4. Automatische Diagnose

### 23 Diagnose-Detektoren

| # | Detektor | Schweregrad |
|---|----------|-------------|
| 1 | Luftleck-Erkennung (N₂/O₂/Ar Verhältnis) | Kritisch |
| 2 | Virtuelles Leck (nicht-reaktive Gasmuster) | Warnung |
| 3 | Wasser-Ausgasung (H₂O Dominanz) | Info/Warnung |
| 4 | Wasserstoff-Dominanz (gebackenes System) | Info |
| 5 | Öl-Rückströmung (Δ14 amu periodisches Muster) | Kritisch |
| 6 | Fomblin-Kontamination (PFPE-Öl, CF₃⁺) | Kritisch |
| 7 | Lösemittelrückstände (Aceton, IPA, Ethanol) | Warnung |
| 8 | Chlorierte Lösemittel | Kritisch |
| 9 | Wasserausgasung-Analyse | Info |
| 10 | ESD-Artefakte (Störsignale) | Warnung |
| 11 | Silikon-Kontamination (PDMS, Trimethylsilyl) | Warnung |
| 12 | Sauberer UHV-Status (exzellentes Vakuum) | Info |
| 13 | Virtuelles Leck (isolierte Taschen) | Warnung |
| 14 | N₂ vs CO Unterscheidung | Info |
| 15 | Ammoniak-Kontamination | Warnung |
| 16 | Methan-Kontamination | Info |
| 17 | Schwefel-Kontamination | Warnung |
| 18 | Aromatische Kohlenwasserstoffe | Warnung |
| 19 | Polymer-Ausgasung (Phthalate) | Warnung |
| 20 | Weichmacher-Kontamination | Warnung |
| 21 | Prozessgas-Rückstände (Halbleiter) | Warnung |
| 22 | Kühlwasser-Leck | Kritisch |
| 23 | Helium-Leck-Indikator (qualitative Detektion) | Info |

### Diagnose-Ausgabe
- **Konfidenzwert**: 0-1 Skala
- **Schweregrad**: Info, Warnung, Kritisch
- **Evidenz-basierte Begründung**
- **Betroffene Massen**
- **Spezifische Empfehlungen zur Behebung**
- **Systemzustand**: ungebacken, gebacken, kontaminiert, Luftleck

### Isotopen-Analyse
- **10 Elemente**: C, N, O, S, Cl, Ar, Ne, Si, Xe, Kr
- Automatische Prüfung natürlicher Isotopenverhältnisse
- Fragment-Muster für Überlappungserkennung (CO vs N₂, CO₂ vs C₃H₈)
- Anomalie-Erkennung für künstliche Anreicherung

---

## 5. Qualitätsprüfungen

### Datenqualitäts-Bewertung (Data Quality Score)

Kontextabhängige Bewertung der Messqualität mit 6 Faktoren:

| Faktor | Gewicht | Beschreibung |
|--------|---------|--------------|
| **Signal-Rausch-Verhältnis** | 1.5× | SNR in dB, kontextabhängige Schwellen |
| **Peak-Erkennung** | 1.2× | Kontextabhängig: Baked = wenige Peaks gut, Unbaked = viele Peaks normal |
| **Massenbereich** | 1.0× | Abdeckung kritischer Massen (2, 14, 16, 17, 18, 28, 32, 40, 44) |
| **Dynamischer Bereich** | 1.0× | Dekaden zwischen Min/Max Signal |
| **H₂-Referenz** | 0.8× | Referenzpeak-Qualität |
| **Temperatur** | 0.5× | Extraktion aus Dateinamen |

**Noten-System:**
| Note | Score | Diagnose-Zuverlässigkeit |
|------|-------|--------------------------|
| A | ≥90% | Hoch - Diagnosen vertrauenswürdig |
| B | ≥75% | Hoch - Diagnosen vertrauenswürdig |
| C | ≥60% | Mittel - Hauptdiagnosen zuverlässig |
| D | ≥40% | Niedrig - Diagnosen mit Vorsicht interpretieren |
| F | <40% | Sehr niedrig - Neue Messung empfohlen |

**Automatische Kontext-Erkennung:**
- Dateinamen-Analyse ("nach Ausheizen", "after bakeout" → BAKED)
- Spektrum-Charakteristik (H₂ > H₂O × 3 → BAKED)
- Totaldruck-Analyse (< 1×10⁻⁹ mbar → UHV-Kontext)

### 14 Automatische Prüfungen

| Prüfung | Kriterium | Formel |
|---------|-----------|--------|
| H₂/H₂O Verhältnis | H₂ > 5× H₂O | m2 / m18 > 5 |
| N₂/O₂ Verhältnis | Luftleck-Indikator | m28 / m32 > 4 |
| Fragment-Konsistenz | N-Fragment < O-Fragment | m14 < m16 |
| Leichte KW | m39, 41-43, 45 < 0.1% | Σ < 0.1% |
| Schwere KW | m69, 77 < 0.05% | Σ < 0.05% |
| Bakeout-Erfolg | H₂ dominiert | m2 > m18 |
| N₂ vs CO | Peak 14/28 ≈ 0.07 für N₂ | m14/m28 ≈ 0.07 |
| Argon Doppelionisation | Peak 20/40 ≈ 0.10-0.15 | m20/m40 |
| HC-frei (DESY) | Σ m/z 45-100 < 0.1% | Sum < 0.1% |
| CO₂ Korrektur | CO trägt ~11% zu m/z 28 bei | Korrektur |
| CH₄ vs O⁺ | m/z 15 als Indikator | m15 Analyse |
| NH₃ vs H₂O | OH⁺ ~23% von H₂O Peak | Überschuss |
| CO Beitrag | C⁺ Fragment bei m/z 12 | m12 Erkennung |

---

## 6. Visualisierung

### Interaktives Spektrum-Diagramm (D3.js)

**Funktionen:**
- Logarithmische oder lineare Y-Achsen-Skalierung (umschaltbar)
- Zoom und Pan
- Multi-Datei Overlay-Vergleich
- Peak-Beschriftung mit Gas-Identifikation
- Datei-Sichtbarkeit pro Spektrum umschalten

**Limit-Visualisierung:**
- GSI Limit-Kurve (grün)
- CERN Limit-Kurve (blau)
- Benutzerdefinierte Profil-Kurven (verschiedene Farben)
- Mehrere Profile gleichzeitig anzeigbar
- Verletzungs-Hervorhebung

### Peak-Tabelle
- Sortierte Liste erkannter Peaks
- Spalten: Masse, Gas-ID, Relative Intensität, GSI-Status, CERN-Status
- Integration mit Diagramm-Auswahl

---

## 7. Spektrum-Vergleich

### Vorher/Nachher-Analyse (2+ Dateien)

| Funktion | Beschreibung |
|----------|--------------|
| Peak-Vergleich | Prozentuale Änderung pro Peak |
| Status-Klassifikation | verbessert, verschlechtert, unverändert, neu, entfernt |
| Limit-Tracking | Neu bestanden, neu gescheitert, unverändert |
| Verbesserungs-% | Gesamtverbesserung berechnet |

### Bewertungssystem
- **Excellent**: Signifikante Verbesserung
- **Good**: Moderate Verbesserung
- **Mixed**: Gemischte Ergebnisse
- **Poor**: Verschlechterung

---

## 8. Export-Funktionen

### PDF Export
- Vollständiger Spektrum-Bericht
- Diagramm-Visualisierung
- Peak-Tabelle
- Qualitätsprüfungs-Zusammenfassung
- Diagnose-Panel mit Empfehlungen
- Metadaten und Messparameter

### Animierter HTML Export
- **Interaktive eigenständige HTML-Datei**
- Automatische Spektrum-Tour Animation
- Sequenzielle Hervorhebung wichtiger Massenbereiche
- Zoom auf Schlüssel-Peaks
- Annotierte Erklärungen
- Play/Pause/Restart Steuerung
- Geschwindigkeits-Regler
- **Vollständig eigenständig** (keine externen Abhängigkeiten)

### CSV Export
- Rohe Analysedaten
- Normalisierte Datenpunkte
- Peak-Auflistungen
- Limit-Prüfungsergebnisse
- Kompatibel mit Excel, MATLAB, etc.

---

## 9. Wissensdatenbank

### Integriertes Referenzsystem
- **Gasbibliothek**: 30+ Gase mit Eigenschaften
- **Massenreferenz-Datenbank**: 0-100 AMU
- **Cracking-Muster** für alle bekannten Gase
- **Relative Empfindlichkeitsfaktoren (RSF)** für quantitative Analyse
- **Isotopenverhältnis-Informationen**
- **Leckraten-Klassifikation**

### Diagnose-Wissen
- Öl-Rückströmungsmuster (Δ14 amu Serie)
- Fomblin/PFPE Kontaminationssignaturen
- Virtuelle Leck-Charakteristiken
- Luftleck-Verhältnis-Erwartungen
- Bakeout-Temperatureffekte
- Systemzustand-Indikatoren

### Fehlerbehebungs-Leitfaden
- Häufige Kontaminationsmuster
- Ursachenanalyse
- Behebungsempfehlungen
- Testverfahren

---

## 10. Cloud & Firebase

### Authentifizierung
- **PIN-basierte Anmeldung** (4-6 Ziffern)
- Vorname + Nachname + PIN Registrierung
- Schnelle An-/Abmeldung
- Persistente Sitzung

### Cloud-Speicherung
- Firebase Firestore Backend
- Spektren mit Metadaten speichern
- Vollständige Analysedaten-Speicherung
- Archiv/Wiederherstellungs-Funktionalität

### Spektrum-Archiv
| Funktion | Beschreibung |
|----------|--------------|
| Alle Spektren anzeigen | Listenansicht aller gespeicherten Spektren |
| Filtern | Nach archiviert/aktiv Status |
| Sortieren | Nach Upload-Datum |
| Laden | Gespeichertes Spektrum in Analyse laden |
| Löschen | Mit Bestätigung |
| Archivieren | Spektren ein-/ausarchivieren |
| Tags | Für Organisation hinzufügen |
| Notizen | Dokumentation hinzufügen |

---

## 11. KI-Integration

### Analyse-Modi

| Modus | Beschreibung |
|-------|--------------|
| **Manuell** | KI-Prompt kopieren, Antwort einfügen |
| **Gemini** | Direkte API-Integration (mit Schlüssel) |
| **Claude** | LLM-Interpretation (via API) |

### KI-Funktionen
- Kontextbewusste Spektrum-Interpretation
- Mehrsprachige Unterstützung (Deutsch/Englisch)
- Limit-Profil-Kontext in Analyse
- Diagnose-Integration mit KI-Erkenntnissen
- Benutzerdefinierte Prompt-Generierung
- Antwort-Parsing und Integration

---

## 12. Druckkalibrierung

### Kalibrierungsstufen

| Stufe | Beschreibung |
|-------|--------------|
| **BASIC** | Einfache Konvertierung |
| **STANDARD** | RSF-korrigiert |
| **ADVANCED** | Gerätespezifische Kalibrierung |
| **PRECISION** | SEM-Alterungsverfolgung |

### Druckumrechnung
- Ionenstrom zu Druck-Konvertierung
- Mehrere Druckeinheiten: mbar, Pa, Torr
- RSF (Relative Sensitivity Factor) Anwendung
- Dekonvolution für überlappende Peaks
- Cracking-Muster-Korrekturen

### SEM-Alterungsüberwachung
- Spannungshistorie über Zeit verfolgen
- Alterungstrends erkennen
- Alterungswarnungen generieren
- Kritisch/Warnung/Info Schweregrade

---

## 13. Benutzeroberfläche

### Sprachunterstützung
- **Deutsch** (Standard)
- **Englisch** (vollständig übersetzt)
- Umschaltknopf im Header
- Persistente Sprachauswahl

### Theme-Unterstützung
- **Light Theme** (Standard)
- **Dark Theme**
- Umschaltknopf im Header
- Persistente Theme-Auswahl

### Landing Page
- Willkommensbildschirm für neue Benutzer
- Wissensdatenbank-Link
- Upload-Anweisungen
- Cloud-Archiv-Zugang

### Seitenleisten-Navigation

| Bereich | Funktion |
|---------|----------|
| **Limits** | Limit-Profile verwalten und anzeigen |
| **KI** | KI-Analyse-Panel |
| **Export** | Export-Optionen (PDF, HTML, CSV) |
| **Cloud** | Spektrum speichern |
| **Archiv** | Cloud-Spektren verwalten |
| **Wissen** | Wissensdatenbank öffnen |

### Datei-Management
- Bis zu 3 Dateien gleichzeitig laden
- Visuelle Dateiliste mit Metadaten
- Einzelne Dateien entfernen
- Datei-Reihenfolge nach Messdatum
- Datei-Sichtbarkeit im Diagramm umschalten
- Alle Dateien zurücksetzen

---

## Technologie-Stack

| Komponente | Technologie |
|------------|-------------|
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS 4 |
| State Management | Zustand |
| Diagramme | D3.js |
| Cloud | Firebase (Firestore) |
| Build | Vite |
| Internationalisierung | i18next |

---

## Zusammenfassung

Der RGA Analyser bietet eine **professionelle Plattform** zur Vakuumsystem-Diagnose mit:

- **Automatische Analyse** von RGA-Spektren
- **22 Diagnose-Detektoren** für Kontaminationserkennung
- **14 Qualitätsprüfungen** nach Industriestandards
- **Datenqualitäts-Bewertung** mit kontextabhängiger Analyse (A-F Noten)
- **Ausgasungs-Simulator** für Multi-Material-Berechnungen
- **Isotopen-Analyse** für 10 Elemente
- **6 voreingestellte Limit-Profile** (GSI, CERN, DESY)
- **Cloud-Speicherung** für Spektrum-Archivierung
- **KI-Integration** für erweiterte Interpretation
- **Export** in PDF, HTML (animiert) und CSV
- **Mehrsprachig** (Deutsch/Englisch)

---

## 14. Rate of Rise

### Übersicht

Eigenständiges Modul zur **Leckratenbestimmung** mittels Druckanstiegstest (Rate-of-Rise Methode).

### Datenimport

| Feature | Beschreibung |
|---------|--------------|
| CSV-Parser | Pfeiffer TPG362 Drucklogger-Format |
| Drag & Drop | Datei-Upload mit visuellem Feedback |
| Metadaten | Gerätename, Datum, Messintervall |
| Validierung | Prüfung auf gültige Druckwerte |

### Analyse

| Schritt | Beschreibung |
|---------|--------------|
| Phasenerkennung | Automatische Erkennung von Baseline und Anstiegsphase |
| Baseline | Mittelwert und Standardabweichung der stabilen Phase |
| Lineare Regression | Fit auf Anstiegsphase mit R²-Wert |
| dp/dt | Druckanstiegsrate in mbar/s |
| Leckrate Q | Q = V × dp/dt (bei Volumeneingabe) |

### Klassifikation

| Typ | dp/dt Bereich | Beschreibung |
|-----|---------------|--------------|
| UHV-tauglich | < 10⁻⁸ mbar/s | Exzellent |
| HV-tauglich | 10⁻⁸ - 10⁻⁶ mbar/s | Gut |
| Grenzwertig | 10⁻⁶ - 10⁻⁴ mbar/s | Akzeptabel |
| Klein-Leck | 10⁻⁴ - 10⁻² mbar/s | Problematisch |
| Groß-Leck | > 10⁻² mbar/s | Kritisch |

### Visualisierung

| Feature | Beschreibung |
|---------|--------------|
| Druck-Zeit-Chart | Interaktives D3.js Diagramm |
| Phasen-Markierung | Farbige Hinterlegung Baseline/Rise |
| Fit-Linie | Lineare Regression als Overlay |
| Skalierung | Linear/Logarithmisch umschaltbar |

### Eingaben

| Parameter | Beschreibung |
|-----------|--------------|
| Kammervolumen | Optional, für Leckratenberechnung |
| Leckraten-Grenzwert | Optional, für Pass/Fail-Prüfung |
| Grenzwert-Quelle | Beschreibung des Standards |

### Export

| Format | Inhalt |
|--------|--------|
| PDF | Vollständiger Analysebericht mit Chart |
| CSV | Messdaten + Analyseergebnisse |

### Cloud-Integration

- Analysen in Firebase speichern
- Archiv durchsuchen und laden
- Mit Notizen und Tags versehen

---

## 15. Wissenschaftliche Analysewerkzeuge

### Ausgasungs-Simulator

Berechnung erwarteter Ausgasungsraten für verschiedene Materialien.

| Feature | Beschreibung |
|---------|--------------|
| **17 Materialien** | Edelstahl, Aluminium, Kupfer, PEEK, Viton, etc. |
| **Multi-Material** | Mehrere Materialien kombinieren |
| **Ausgasungsraten** | q(t) = q₀ × t⁻¹ Modell |
| **Leck vs. Ausgasung** | Vergleich im Rate-of-Rise Modul |

**Materialkategorien:**
- Metalle: Edelstahl (304, 316LN), Aluminium (6061, 6063), Kupfer (OFHC), Ti-6Al-4V
- Polymere: PEEK, Viton, NBR, EPDM, PTFE, Kapton
- Keramiken: Al₂O₃, Macor
- Sonstige: Glas (Borosilikat)

**Integration:**
- Rate-of-Rise: Vergleichskarte Leck vs. Ausgasung
- RGA-Diagnose: Kontext-Panel mit Ausgasungs-Erwartungen

### Isotopen-Analyse

Siehe [Abschnitt 4.3 Isotopen-Analyse](#isotopen-analyse)

**Wissenschaftliche Validierung (2026-01-09):**
- ✅ **Alle 10 Isotopenverhältnisse validiert** gegen NIST, CIAAW, USGS
- ✅ **Peer-reviewed Anwendungen dokumentiert:** Fusionsforschung (JET, ASDEX), Medizinische Diagnostik (PubMed), Umweltanalytik
- ✅ **Methoden-Limitationen geklärt:** Quadrupol-RGA (±5-10%) vs. High-Res IRMS (±0.5-1%)
- ✅ **67 wissenschaftliche Quellen** dokumentiert in [SCIENTIFIC_REFERENCES.md](./RGA_Knowledge/SCIENTIFIC_REFERENCES.md)
- ✅ **Knowledge Panel erweitert** mit 4 neuen Sektionen: Isotopen-Validierung, Peer-Reviewed Apps, Emerging Gases, Methoden-Vergleich

### Helium-Leck-Indikator (Feature 1.5.5)

**Wissenschaftliche Validierung (2026-01-09):**
- ✅ **Qualitative vs. quantitative Unterscheidung geklärt:** RGAs für Helium-Präsenzdetektion, NICHT für quantitative Leckraten
- ⚠️ **RGA Sensitivitäts-Limitationen dokumentiert:** 1-2 Größenordnungen weniger empfindlich als dedizierte He-Leckdetektoren (~5×10⁻¹² mbar·l/s)
- ❌ **Quantitative Leckraten-Berechnung NICHT validiert:** Keine Literatur unterstützt zuverlässige Konversion von RGA-Signal zu Leckrate
- ✅ **Validierter Ansatz implementiert:** m/z 4 > 0.01 + He/H₂ > 0.1 für qualitative Helium-Erkennung
- ✅ **Empfehlung korrekt:** "Dedizierte He-Leckdetektoren für quantitative Messungen verwenden"
- ✅ **20+ wissenschaftliche Quellen** dokumentiert (Hiden, Kurt Lesker, MKS, SRS)

**Implementierung:** [detectors.ts:259](./src/lib/diagnosis/detectors.ts#L259) - `detectHeliumLeak()`

### Erweiterte Öl-Diagnose (Feature 1.5.6)

**❌ VERWORFEN - Wissenschaftlich nicht valide (2026-01-09):**
- ❌ **FOMBLIN-Kategorisierungs-Fehler identifiziert:** Spec kategorisierte FOMBLIN als Kohlenwasserstoff-Öl, aber FOMBLIN ist Perfluoropolyether (PFPE) mit CF₃⁺ bei m/z 69
- ❌ **Öl-Typ-Unterscheidung nicht belegt:** Literatur zeigt, dass RGAs **generelle Kohlenwasserstoff-Kontamination** erkennen, aber KEINE zuverlässige Unterscheidung zwischen Mineralöl, Diffusionspumpen-Öl, etc.
- ✅ **Existierender Detektor bereits wissenschaftlich korrekt:** `detectOilBackstreaming()` nutzt validiertes Δ14 amu Pattern (m/z 41, 55, 69, 83, 97)
- ✅ **Ablehnung dokumentiert** in [OEL_DIAGNOSE_VERWORFEN_NICHT_VALIDE.md](./NextFeatures/done/OEL_DIAGNOSE_VERWORFEN_NICHT_VALIDE.md)
- ✅ **15+ wissenschaftliche Quellen** dokumentiert (Kurt Lesker, Hiden Analytical, PubMed 36916159)

**Zitat Kurt Lesker (Advanced RGA Interpretation):**
> "The document does not provide information distinguishing between different oil types (mineral oil, synthetic oils, etc.) based on RGA spectra. It identifies hydrocarbon presence generally but doesn't address comparative analysis of specific oil chemistries."

**Implementierung:** Keine - Feature abgelehnt. Existierender `detectOilBackstreaming()` ist ausreichend.

### Datenqualitäts-Bewertung

Siehe [Abschnitt 5.1 Data Quality Score](#datenqualitäts-bewertung-data-quality-score)

### Wissenschaftliche Referenz-Datenbank

**Neue Dokumentation (2026-01-09):**

| Datei | Beschreibung |
|-------|--------------|
| **[SCIENTIFIC_REFERENCES.md](./RGA_Knowledge/SCIENTIFIC_REFERENCES.md)** | Konsolidierte wissenschaftliche Quellen-Datenbank |
| **[.claude/project-context.md](./.claude/project-context.md)** | Claude Code Kontext-System für automatische Referenz-Nutzung |
| **[README-CLAUDE.md](./README-CLAUDE.md)** | Quick Reference für AI-Assistenten |

**Inhalt SCIENTIFIC_REFERENCES.md:**
- 🔬 Isotope Data (NIST, CIAAW, USGS) - 6 Elemente validiert
- 📄 Peer-Reviewed RGA Applications (Fusion, Medizin, Umwelt)
- 🚀 Emerging Isotope Applications (D₂, HD, N₂O)
- 🛢️ Vakuum-Kontamination (Öl, FOMBLIN, Helium)
- ⚙️ Method Validation (RGA vs. IRMS Vergleich)

**Validierungs-Status-Übersicht:**

Eine systematische Analyse aller 30 wissenschaftlichen Features und Detektoren zeigt:
- ✅ **8 vollständig validiert** (27%): Isotopen-Analyse, Helium-Leck-Indikator, Öl-Rückströmung, FOMBLIN, Luftleck, N₂/CO-Unterscheidung, Cl-Lösemittel, Silikon
- ⚠️ **13 teilvalidiert** (43%): Ausgasungs-Simulator, ESD-Artefakte, Lösemittelrückstände, Wasser-Ausgasung, etc.
- ❓ **8 nicht validiert** (27%): Konfidenz-Score, Virtuelles Leck, Sauberer UHV, Polymer-Ausgasung, etc.
- ❌ **1 verworfen** (3%): Erweiterte Öl-Diagnose (wissenschaftlich nicht haltbar)

**Vollständige Übersicht:** [WISSENSCHAFTLICHE_VALIDIERUNG_STATUS.md](./NextFeatures/WISSENSCHAFTLICHE_VALIDIERUNG_STATUS.md)

**Validierungs-Workflow:**
1. Check SCIENTIFIC_REFERENCES.md (lokal)
2. Web-Suche falls nicht gefunden
3. Dokumentation in SCIENTIFIC_REFERENCES.md + Knowledge Panel
4. Status-Tracking in WISSENSCHAFTLICHE_VALIDIERUNG_STATUS.md

### Geplante Erweiterungen

**Aus wissenschaftlicher Validierung identifiziert:**

| Feature | Status | Quelle | Aufwand |
|---------|--------|--------|---------|
| **D₂/HD Gase** | ✅ Implementiert | Hiden Analytical, DOE SRNL | 2-3h |
| **N₂O Gas** | ✅ Implementiert | UC Davis, PubMed | 2h |
| **PDMS m/z 59** | ✅ Implementiert | Springer, Hiden SIMS | 30min |
| **Argon Ratio Update** | ⬜ Optional | Lee 2006 (298.6) | 15min |

**D₂/HD (Deuterium):**
- Anwendung: Fusionsforschung (Tokamaks)
- Präzision: ~100 ppm mit Quadrupol-RGA
- Herausforderung: m/z 4 Überlappung mit He

**N₂O (Lachgas):**
- Anwendung: Biogeochemie, ¹⁵N-Positions-Analyse
- Massen: m/z 44, 45, 46 (Molekül), 30, 31 (NO⁺)
- ⚠️ Warnung: m/z 44 überlappt mit CO₂

**PDMS m/z 59:**
- Zusätzlicher kritischer PDMS-Marker (C₃H₇Si⁺)
- Ergänzt existierende m/z 73, 147
- Erhöht Detektions-Sensitivität

---

## Geplante Features

Siehe **[NextFeatures/FEATURE_BACKLOG.md](./NextFeatures/FEATURE_BACKLOG.md)** für die priorisierte Liste geplanter Erweiterungen:

| Priorität | Feature | Status |
|-----------|---------|--------|
| 1.5.1 | Ausgasungs-Simulator | ✅ Implementiert |
| 1.5.2 | Isotopen-Analyse | ✅ Implementiert (validiert 2026-01-09) |
| 1.5.3 | Datenqualitäts-Bewertung | ✅ Implementiert |
| 1.5.4 | ESD-Artefakt-Erkennung | ✅ Implementiert |
| 1.5.5 | Helium-Leck-Indikator | ✅ Implementiert (validiert 2026-01-09) |
| 1.5.6 | ~~Erweiterte Öl-Diagnose~~ | ❌ Verworfen (nicht valide) |
| 1 | Error Handling System | Geplant |
| 1 | Firebase Auth Migration | Geplant |
| 1.6 | Lecksuche-Planer (DIN EN 1779) | Geplant |
| 2 | Zeitreihen-Analyse | Geplant |
| 3 | Unsicherheitsrechnung | Geplant |
| 4 | Icon-Vereinheitlichung | Geplant |
| 5 | UX-Verbesserungen | Geplant |
| 6 | Performance-Optimierungen | Geplant |

---

*Dokumentation generiert für RGA Analyser v1.1*
*Letzte Aktualisierung: 2026-01-08*
