# Analyse kommerzieller RGA-Softwarefunktionen

**Datum:** 10.01.2026
**Umfang:** Offline-Analyse und Softwarefunktionen der großen RGA-Hersteller (Pfeiffer, Inficon, SRS, MKS, Hiden).

## Management-Zusammenfassung
Kommerzielle RGA-Software hat sich von einfacher Datenprotokollierung zu Systemen für "Intelligente Prozesskontrolle" entwickelt. Die größten Lücken zwischen einfacher, individueller Software und den Marktführern liegen in der **Automatisierten Interpretation** (dem Benutzer sagen, *was* passiert, nicht nur einen Graphen zeigen) und der **Statistischen Prozesskontrolle** (Abweichungen erkennen, bevor sie zu Alarmen werden).

---

## 1. Analyse der Funktionslücken

### 1.1 Erweiterte Dateninterpretation (Das "Gehirn")
Kommerzielle Tools zeigen nicht nur Peaks an; sie dekonstruieren sie.

*   **Spektralsimulation & Entfaltung (Hiden, Pfeiffer):**
    *   **Funktion:** Benutzer können eine Gasmischung auswählen (z. B. "Luft + 5% Argon"), und die Software *simuliert* das erwartete Spektrum, um es über die echten Daten zu legen.
    *   **Lücke:** Wir verlassen uns derzeit darauf, dass der Benutzer die Peak-Verhältnisse im Kopf überprüft.
    *   **Fortgeschritten:** Hiden nutzt "Genetische Algorithmen" und Pfeiffer "Matrix-Inversion", um automatisch die prozentuale Zusammensetzung überlappender Gase zu berechnen (z. B. Trennung von CO vs. N2 bei Masse 28 basierend auf Fragmentierungsmustern bei 12 und 14).
    *   💡 **Einfach erklärt:** Das ist wie eine App, die sagt: "Dieser Smoothie besteht zu 20% aus Banane und 80% aus Apfel", anstatt nur zu sagen "Es schmeckt süß". Die Software dröselt den gemessenen "Einheitsbrei" automatisch in die einzelnen Gase auf.

*   **Chemie-Bibliotheken (Inficon, Hiden):**
    *   **Funktion:** Eingebaute Bibliotheken von Fragmentierungsmustern (Cracking Patterns).
    *   **Lücke:** Die Fähigkeit, ein bekanntes Spektrum zu "subtrahieren" (z. B. "Hintergrundluft subtrahieren"), um die restlichen Verunreinigungen klar zu sehen.
    *   💡 **Einfach erklärt:** Manche Gase (wie Luft) sind immer da. Diese Funktion ist wie ein "Rauschunterdrücker" bei Kopfhörern: Man blendet den ständigen Hintergrundlärm aus, um das eigentliche Signal (die Verunreinigung) glasklar zu hören.

### 1.2 Statistische & Prozesskontrolle (Der "Wächter")
Inficon und MKS konzentrieren sich stark auf Halbleiter-Anforderungen, wo "Drift" genauso schlimm ist wie ein Leck.

*   **Dynamische Nachweisgrenze (LOD) (Inficon FabGuard):**
    *   **Funktion:** Statt eines festen Grenzwerts von "1e-10" berechnet die Software die LOD *pro Scan* basierend auf dem Grundrauschen ($3\sigma$).
    *   **Vorteil:** Verhindert Fehlalarme, wenn das System verrauscht ist.
    *   💡 **Einfach erklärt:** Eine "Intelligente Alarmanlage". Wenn es in der Fabrik laut ist, wird sie etwas unempfindlicher gestellt, damit sie nicht bei jedem Geräusch losgeht. Ist es nachts still, wird sie extrem sensibel und hört jede Stecknadel (jedes Gasmolekül).

*   **Fehlererkennung & Klassifizierung (FDC) (Inficon):**
    *   **Funktion:** Nutzt statistische Modelle, um *multivariate* Änderungen zu erkennen. Beispiel: Wenn die Pumpleistung sinkt UND Wasser steigt, wird "Wartung fällig" gemeldet, statt nur "Hoher Druck".
    *   💡 **Einfach erklärt:** Ein "Digitaler Mechaniker". Er schaut nicht nur auf eine Warnlampe, sondern versteht Zusammenhänge. Er sagt nicht einfach "Auto kaputt", sondern "Der Reifendruck sinkt *obwohl* du tankst -> Du hast ein Loch im Reifen".

### 1.3 Visualisierung & Benutzerfreundlichkeit
*   **3D "Trend-Masse-Intensität" Karten (Hiden):**
    *   **Funktion:** Eine Heatmap oder ein 3D-Oberflächendiagramm, das Masse (X), Zeit (Y) und Intensität (Z) zeigt.
    *   **Vorteil:** Macht es mühelos möglich, "transiente Ereignisse" oder Gasausbrüche zu erkennen, die während eines langen Prozesses kurz auftauchen und wieder verschwinden.
    *   💡 **Einfach erklärt:** Eine "Wetterkarte" für das Vakuum. Anstatt hunderte einzelne Temperaturkurven anzuschauen, sieht man auf einen Blick, wo ein "Gewitter" (Gasausbruch / Verschmutzung) durchzieht.

*   **Recall & Historien-Modus (MKS):**
    *   **Funktion:** Dedizierte Benutzeroberfläche zum mühelosen Durchsuchen von Terabytes an archivierten Logs, mit Überlagerung von "Golden Runs" (Referenzmessungen) über den "Aktuellen Lauf", um Abweichungen zu sehen.

---

## 2. Hersteller-Spezifika

### 🇩🇪 Pfeiffer Vacuum (Quadera)
*   **Stärke:** **Matrix-Berechnung.** Sehr starke Mathematik-Engine für quantitative Gasanalyse (QGA).
*   **Bemerkenswert:** "Echtzeit-Analyse", die es Benutzern erlaubt, Daten mit anderen Parametern neu zu bewerten, *während* gemessen wird.

### 🇨🇭/🇺🇸 Inficon (FabGuard / Transpector)
*   **Stärke:** **Prozessintegration.** Kommuniziert direkt mit den Fab-Tools.
*   **Bemerkenswert:** "Vakuum-Diagnose"-Tool ist ein "Was ist falsch?"-Knopf, der automatisch auf Lecks vs. Ausgasung prüft.

### 🇬🇧 Hiden Analytical (MASsoft)
*   **Stärke:** **Wissenschaftliche Tiefe.**
*   **Bemerkenswert:**
    *   **Genetische Algorithmen** für den Spektralabgleich.
    *   **Sanfte Ionisation:** Kontrolle der Elektronenenergie (10-100eV) zur Vereinfachung von Spektren (z. B. Entfernung von He-Interferenzen bei D2).
    *   **Spektralsimulation:** "Zeig mir, wie 1e-7 Torr Wasser aussieht" -> plottet die theoretische Kurve.

### 🇺🇸 MKS Instruments (Process Eye)
*   **Stärke:** **Rezept-Automatisierung.**
*   **Bemerkenswert:** "Recipe Wizard" erlaubt das Erstellen komplexer Logik (z. B. "Scanne Masse 2, 4, 18 schnell für 10 Min., dann mache einen vollen Sweep").

### 🇺🇸 Stanford Research Systems (RGA Windows)
*   **Stärke:** **Einfachheit & Preis-Leistung.**
*   **Bemerkenswert:** Robuste "Split Screen"-Ansichten und Audio-Alarme. Weniger "KI"-Analyse, mehr Rohdaten-Klarheit.

---

## 3. Chancen für RGA Analyser (Unsere Roadmap)

Basierend auf dieser Recherche würden die folgenden "Offline"-Funktionen den höchsten wissenschaftlichen Wert bieten:

1.  **"Golden Run" Vergleich:** Das Laden einer "Guten" CSV-Datei ermöglichen und diese als Schatten hinter der aktuellen Analyse plotten, um Abweichungen sofort visuell zu erkennen.
2.  **Spektralsimulation / Überlagerung:** Ein Werkzeug hinzufügen, um "Theoretisches Gas" (z. B. N2) zum Plot hinzuzufügen, um zu sehen, ob die gemessenen Peaks mit der Theorie übereinstimmen (Überprüfung von Skalierung/Kalibrierung).
3.  **Intelligente Hintergrundsubtraktion:** Wie in unseren Logs vermerkt, fehlt uns noch ein robuster Subtraktionsalgorithmus (der negative Werte/Rauschen handhabt).
4. **Trend-Heatmaps (3D-Ansicht):** Wenn wir hochdichte Zeitreihendaten haben, wäre eine 2D-Heatmap (Masse vs. Zeit) ein visuelles Killer-Feature.

---

## 4. Quellen & Referenzen

Die Analyse basiert auf den folgenden öffentlich zugänglichen Dokumentationen und Produktbeschreibungen:

*   **Pfeiffer Vacuum (Quadera):**
    *   *Quadera® - Software für Quadrupol-Massenspektrometer.* Abgerufen von [pfeiffer-vacuum.com](https://www.pfeiffer-vacuum.com)
    *   *Quadera Software Manual.* (Referenziert via ManualsLib und CVUT Dokumentation).

*   **Inficon (FabGuard / Transpector):**
    *   *FabGuard Explorer Operating Manual (PN 074-528-P1).* Inficon.
    *   *Transpector MPH Operating Manual.* Inficon. Abgerufen von [inficon.com](https://www.inficon.com)
    *   *FabGuard – Sensor Integration and Control.* Produktseite.

*   **Hiden Analytical (MASsoft):**
    *   *MASsoft Professional Software.* Produktbeschreibung. Abgerufen von [hidenanalytical.com](https://www.hidenanalytical.com)
    *   *Hiden QGA - Quantitative Gas Analysis.* Broschüre und technische Notizen zu "Soft Ionisation" und "Genetic Algorithms".

*   **MKS Instruments (Process Eye):**
    *   *Process Eye Professional Platform.* MKS Instruments Produktnotiz.
    *   *Process Eye Manuals* (Teilweise gehostet von akademischen Institutionen wie Caltech für ältere Versionen).

*   **Stanford Research Systems (SRS):**
    *   *RGA Windows Software Release Notes & Features.* Abgerufen von [thinksrs.com](https://www.thinksrs.com)

---

## 5. Offline-Tauglichkeit (Was funktioniert ohne Gerät?)

Auf Ihre Frage "Was davon ist wirklich offline tauglich?" - Hier die Bewertung der Features für reine Datenanalyse (Post-Processing von CSV-Dateien):

### ✅ Vollständig Offline Tauglich (Reine Mathematik/Visualisierung)
Diese Features benötigen **keine** Verbindung zum Messgerät, sondern nur die Rohdaten:

1.  **Spektralsimulation & Entfaltung:** Man kann jederzeit berechnen, wie ein theoretisches Gasgemisch aussehen *müsste* und es über die gespeicherte Kurve legen. (Hiden/Pfeiffer Feature).
2.  **Trend-Heatmaps (3D):** Das ist reine Visualisierung von gespeicherten Zeitreihen. Perfekt für Offline-Reports.
3.  **Golden Run Vergleich:** Vergleich von zwei Dateien (Datei A vs. Datei B). Das Paradebeispiel für Offline-Analyse.
4.  **Intelligente Hintergrundsubtraktion:** Mathematische Operation auf dem Datensatz (Signal = Messung - Hintergrunddatei).
5.  **Chemie-Bibliotheken:** Nachschlagen von Cracking-Patterns in einer Datenbank.

### ⚠️ Bedingt Offline Tauglich (Eingeschränkt)
1.  **Dynamische LOD ($3\sigma$):** Kann nachträglich berechnet werden, um zu sehen, ob ein Peak im Rauschen untergeht. Aber: Man kann nicht mehr "länger messen", um das Rauschen zu senken (was das Gerät live tun würde).
2.  **Fehlererkennung (FDC):** Man kann historische Daten analysieren ("Warum ist der Prozess letzte Woche ausgefallen?"), aber keine Live-Warnung geben, um den Ausschuss zu verhindern.

### ❌ Nicht Offline Tauglich (Benötigt Hardware-Kontrolle)
1.  **Vakuum-Diagnose (Automatisierte Tests):** Oft verlangt die Software Aktionen wie "Filament kurz ausschalten" oder "Einlassventil schließen", um Nullpunkte zu checken. Das geht offline nicht.
2.  **Rezepte & Automatisierung:** Das Steuern des Messablaufs selbst.

---

## 6. Machbarkeitsanalyse & Implementierungsplan (Feasibility Check)

Um "in die detaillierte Planung" zu gehen, hier die technische Bewertung der Umsetzung.

### 6.1 "Golden Run" Vergleich (Schatten-Plot)
*   **Aufwand:** 🟢 Gering (1-2 Tage)
*   **Was fehlt uns?** Nichts Kritisches. Wir müssen nur den CSV-Parser so erweitern, dass er eine zweite Datei "passiv" in den Speicher lädt und ohne Interaktivität (nur als graue Linie) in den bestehenden Plot zeichnet.
*   **Technik:** Overlay von zwei Datenarrays.
*   **Hürde:** Synchronisation der X-Achse (Zeit), falls die Messungen unterschiedlich lang waren.

### 6.2 Intelligente Hintergrundsubtraktion
*   **Aufwand:** 🟡 Mittel (3-4 Tage)
*   **Was fehlt uns?** Ein **Resampling-Algorithmus**.
    *   *Problem:* Die Hintergrund-Datei hat Zeitstempel [1.1s, 2.2s...], die aktuelle Messung hat [1.3s, 2.4s...]. Wir können nicht einfach `Array A - Array B` rechnen.
    *   *Lösung:* Interpolation der Hintergrunddaten auf die Zeitpunkte der Messung.
*   **Technik:** Linear Interpolation & Behandlung negativer Werte (Clamping auf 0 oder erlauben von negativem Rauschen).

### 6.3 Trend-Heatmaps (3D Ansicht)
*   **Aufwand:** 🟡 Mittel bis Hoch (1 Woche)
*   **Was fehlt uns?** Eine geeignete **Visualisierungs-Bibliothek** oder Konfiguration.
    *   Wenn wir bereits eine Chart-Bibliothek nutzen, müssen wir prüfen, ob sie "Heatmaps" oder "Contour Plots" performant unterstützt. Bei vielen Datenpunkten (Stunden an Daten) wird das Rendern im Browser/UI oft langsam.
*   **Technik:** Datenaggregation (Binning), um die Performance zu halten.

### 6.4 Spektralsimulation (Theoretische Gase)
*   **Aufwand:** 🔴 Hoch (2+ Wochen)
*   **Was fehlt uns?** Die **Datenbasis (Cracking Patterns)**.
    *   Um Stickstoff (N2) zu simulieren, müssen wir wissen: "Bei Masse 28 = 100%, bei Masse 14 = 7%".
    *   Wir brauchen eine Datenbank (JSON/SQL) mit den Ionisationswahrscheinlichkeiten und Bruchmustern aller gängigen Gase.
*   **Entscheidung nötig:**
    *   Option A: Wir tippen die 10 wichtigsten Gase (Luft, H2, He, Ar, H2O, CO2) manuell aus Literaturwerten ab. (Schnell, billig).
    *   Option B: Wir lizenzieren eine kommerzielle Datenbank (NIST). (Teuer, vollständig).

---
