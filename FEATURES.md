# RGA Analyser - Feature-Dokumentation

Eine umfassende Webanwendung zur Analyse von Restgasanalyse (RGA) Spektren mit automatischer Diagnose, Qualitätsprüfung und Cloud-Integration.

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

### 18 Diagnose-Detektoren

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

### Diagnose-Ausgabe
- **Konfidenzwert**: 0-1 Skala
- **Schweregrad**: Info, Warnung, Kritisch
- **Evidenz-basierte Begründung**
- **Betroffene Massen**
- **Spezifische Empfehlungen zur Behebung**
- **Systemzustand**: ungebacken, gebacken, kontaminiert, Luftleck

---

## 5. Qualitätsprüfungen

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
- **18 Diagnose-Detektoren** für Kontaminationserkennung
- **14 Qualitätsprüfungen** nach Industriestandards
- **6 voreingestellte Limit-Profile** (GSI, CERN, DESY)
- **Cloud-Speicherung** für Spektrum-Archivierung
- **KI-Integration** für erweiterte Interpretation
- **Export** in PDF, HTML (animiert) und CSV
- **Mehrsprachig** (Deutsch/Englisch)

---

*Dokumentation generiert für RGA Analyser v1.0*
