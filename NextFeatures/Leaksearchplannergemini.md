# Lecksuche-Planer - Zusammenfassung für Querlesen (Master V2)

**Erstellt:** 2026-01-08
**Basierend auf:** LEAK_SEARCH_PLANNER_SPEC.md, LEAK_SEARCH_PLANNER_IMPLEMENTATION.md, DIN EN ISO 20485, Pfeiffer/Leybold Kompendien

---

## 1. Überblick

### Was ist der Lecksuche-Planer?
Ein intelligenter Wizard-Assistent, der Vakuumtechnikern hilft, die optimale Lecksuchstrategie zu planen. Das Tool basiert auf **DIN EN ISO 20485** und führt den Anwender Schritt für Schritt zur passenden Prüfmethode.

### Kernfrage
> "Ich habe Bauteil X mit Eigenschaften Y und brauche Leckrate Z - wie muss mein Aufbau aussehen und wie lange dauert die Prüfung?"

### Alleinstellungsmerkmal
Kombination aus Expertenwissen (Normen) und **physikalischer Validierung**.
Der Planer berechnet nicht nur *was* zu tun ist, sondern prüft mittels **Robustheits-Faktoren**, ob der Plan in der Praxis (lange Schläuche, geschätzte Volumen) überhaupt funktioniert. Zusätzlich integriert er die RGA-Diagnose zur Unterscheidung von Luftlecks vs. virtuellen Lecks.

---

## 2. Was liefert der Planer als Ergebnis?

Nach Durchlaufen des Wizards erhält der Anwender einen **"Lecksuch-Fahrplan"**:

1.  **Empfohlene Prüfmethode** (ISO-konform) mit Begründung.
2.  **Pumpen-Setup & Machbarkeit:**
    * Benötigter Aufbau: Direktanschluss (Main Flow) vs. Teilstrom (Split Flow) vs. Turbo-Booster.
    * **Teilstrom-Validierung:** Warnung, falls eine vorhandene Systempumpe das Helium-Signal "wegsaugt" (Verdünnungsfaktor).
3.  **Zeit-Vorgaben (Gedulds-Rechner):**
    * Berechnete Wartezeit pro Sprühstoß (basierend auf $3 \times \tau$).
    * Gesamtdauer-Schätzung.
4.  **Equipment-Anforderungen:** Lecksucher-Typ, Mindest-Saugleistung, Helium, Zubehör.
5.  **Virtual-Leak Risikobewertung:** Ampel-Anzeige für Konstruktionsrisiken.
6.  **Permeations-Check:** Warnung vor "Phantom-Lecks" bei Elastomeren mit Zeitangabe.
7.  **Checkliste:** Für die praktische Durchführung.
8.  **RGA-Empfehlungen:** Was im Restgasspektrum zu suchen ist (N₂/O₂-Verhältnis, Argon).

---

## 3. Unterstützte Prüfmethoden (nach DIN EN ISO 20485)

Die Grenzwerte wurden für UHV-Anwendungen und physikalische Realitäten korrigiert:

### B2 - Druckanstieg (Rate-of-Rise)
- **Limit:** $10^{-6}$ mbar·l/s
- **Art:** Integral (keine Lokalisierung)
- **Prinzip:** Evakuieren, Pumpe absperren, Druckanstieg messen.
- **Einsatz:** Grob-Check, Unterscheidung Leck/Ausgasung, Vorprüfung.
- **Verknüpfung:** Link zum bestehenden Rate-of-Rise Modul.

### B4 - Helium-Schnüffeln (Sniffer)
- **Limit:** $10^{-6}$ mbar·l/s (Limitiert durch 5 ppm He-Untergrund in Luft)
- **Art:** Lokal (Leckortung)
- **Prinzip:** Prüfling mit Helium gefüllt (Überdruck), außen abfahren.
- **Einsatz:** Wenn Bauteil nicht evakuierbar ist.

### B5 - Helium-Spray (Vakuum-Methode)
- **Limit:** $10^{-12}$ mbar·l/s (Hauptstrom) / $10^{-10}$ mbar·l/s (Teilstrom)
- **Art:** Lokal (Leckortung)
- **Prinzip:** Prüfling evakuieren, außen mit Helium besprühen.
- **Wichtig:** Kritisch ist hier die Berechnung der Wartezeit (Zeitkonstante), sonst werden Lecks übersehen.

### B6 - Helium-Vakuum integral
- **Limit:** $10^{-10}$ mbar·l/s (Standard in sauberer Vakuumkammer)
- **Variante 1 (Hüllentest):** Prüfling evakuiert, Hülle mit Helium. (Oft Permeations-limitiert).
- **Variante 2 (Kammerprüfung):** Prüfling mit Helium gefüllt, Kammer evakuiert. (Sensitiver für Serien).
- **Einsatz:** Gesamtdichtheit bestätigen.

### NEU: "Bombing-Test" (Vordruck-Methode)
- **Limit:** $10^{-8}$ bis $10^{-9}$ mbar·l/s
- **Prinzip:** Geschlossenes Bauteil in Druckkammer mit Helium "aufladen", waschen, in Vakuumkammer prüfen.
- **Einsatz:** Gekapselte Elektronik, "Sealed Devices" ohne Flansch.

---

## 4. Wizard-Ablauf & Physik-Logik

### Schritt 1: Prüfling definieren (Die Basis der Berechnung)
**Eingaben:**
- Typ (Kammer, Rohr, Balg, Sealed Device).
- Geometrie/Volumen ($V$).
- Eigenschaften (Evakuierbar? Druckfest?).

**Hintergrund-Logik (Robustheit):**
- Das Volumen wird intern mit **Sicherheitsfaktor 1.2** beaufschlagt, da Anwender Einbauten oft vergessen. $V_{calc} = V_{input} \times 1.2$.

### Schritt 2: Material und Oberfläche
**Eingaben:**
- Material (Edelstahl, Alu, Elastomere).
- Oberflächengüte (Poliert, Gestrahlt).
- Dichtungstyp (CF, ISO-KF, O-Ring).
- Virtual-Leak Faktoren (Sackbohrungen, Innengewinde).

**Hintergrund-Logik (Permeation):**
- Bei Auswahl "Elastomer/Viton": Berechnung der Permeationszeit.
- *Warnung:* "Achtung: Bei Integral-Test tritt nach ca. 20 min Helium durch die Dichtung (Permeation).".

### Schritt 3: Anforderungen festlegen
**Eingaben:**
- Ziel-Leckrate (Preset Liste: LHC, GSI, Halbleiter, etc.).
- Modus: **"Labor / Präzision"** vs. **"Service / Produktion"**.
- Vorhandenes Equipment: Hat das System eigene Pumpen? Saugvermögen ($S$)?

**Hintergrund-Logik (Setup-Validierung):**
- Leitwert-Verlust: Das eingegebene Saugvermögen wird pauschal auf **70%** reduziert (Schlauchverluste). $S_{eff} = S_{pump} \times 0.7$.

### Schritt 4: Ergebnis & Plan-Validierung

Hier greift die **Physik-Engine**, um den Plan abzusichern:

**A. Der "Geduld-Rechner" (Response Time Check)**
Berechnung der Zeitkonstante $\tau = V_{calc} / S_{eff}$.
- **Labor-Modus:** Wartezeit $5 \times \tau$ (99% Signal).
- **Service-Modus:** Wartezeit $3 \times \tau$ (95% Signal).
- **Warnung:** Wenn $3 \times \tau > 30s$ (Service) oder $> 120s$ (Labor):
    - *"Reaktionszeit zu langsam! Lecksuche wird extrem schwierig."*
    - Empfehlung: **Turbo-Booster** einsetzen.

**B. Teilstrom-Check (Sensitivity Dilution)**
Falls "Eigene Pumpe" gewählt:
- Berechne Verdünnungsfaktor $F = S_{LD} / (S_{System} + S_{LD})$.
- Prüfe: Ist `Ziel-Leckrate * F` noch messbar?
- Falls Nein: *"Fehler: Systempumpe ist zu stark. Lecksucher muss seriell ins Vorvakuum!"*.

---

## 5. Virtual-Leak Risikobewertung

Automatische Analyse basierend auf Konstruktionsdaten.

| Faktor | Risiko | Gewichtung |
|--------|--------|------------|
| Sackbohrungen | Sehr hoch | Gasreservoirs entleeren sich extrem langsam |
| Gewinde innen | Hoch | Eingeschlossenes Volumen in den Gängen |
| Doppel-O-Ring | Hoch | Ohne Entlüftungsbohrung ("Zwischenraum") |
| Gussmaterial | Mittel | Porosität / Lunker |
| Raue Oberfläche | Niedrig | Erhöhte Adsorption |

**Empfehlung bei "Rot/Orange":**
- Zwingend Rate-of-Rise Test VOR Helium-Einsatz.
- RGA-Analyse empfohlen (Wasser vs. Luft).

---

## 6. Integration mit bestehenden Modulen

### Wiederverwendung
- **Geometrie-Rechner:** Aus Ausgasungs-Simulator extrahiert.
- **Material-DB:** Erweitert um Permeations-Konstanten.

### Workflows
- **Von RGA:** Wenn Spektrum "Luftleck" zeigt -> Button "Lecksuche planen".
- **Zu Rate-of-Rise:** Wenn Virtual-Leak Risiko hoch -> "Druckanstieg messen".

---

## 7. Implementierungsplan

### Phase 1: Basis-Wizard (8 Stunden)
- Shared Component Geometrie.
- UI Steps 1-4.
- Methodenauswahl-Algorithmus (ISO-Datenbank).

### Phase 2: Physik-Engine & Robustheit (6 Stunden)
- Implementierung `SafetyCalculator` (Sicherheitsfaktoren $1.2V$, $0.7S$).
- Implementierung `calculateResponseTime` (Zeitkonstanten).
- Implementierung `calculateDilution` (Teilstrom).
- Datenbank für Standard-Lecksucher (Pfeiffer/Leybold Specs).

### Phase 3: RGA & Export (4 Stunden)
- PDF-Export des "Prüfplans" (Laufzettel für Techniker).
- RGA-Integration (Deep Links).

### Phase 4: App-Integration (2 Stunden)
- Routing, Icons, Übersetzungen (de/en).

**Gesamt:** ca. 20 Stunden.

---

## 8. Referenz-Standards

- **DIN EN ISO 20485:** Zerstörungsfreie Prüfung - Dichtheitsprüfung - Prüfgasverfahren (Primäre Norm).
- **DIN EN 1779:** Auswahlkriterien (Legacy, aber nützlich).
- **DIN EN 1330-8:** Terminologie.
- **CERN / GSI Guidelines:** Spezifische UHV-Grenzwerte.

---

## 9. Nutzen & Abgrenzung

### Warum dieses Tool?
1.  **Vermeidet physikalische "Unmöglichkeiten":** Verhindert Frust durch falsche Setups (zu lange Wartezeiten, unsichtbare Lecks im Teilstrom).
2.  **Praxis-Robustheit:** Rechnet mit Sicherheitsreserven statt Laborwerten.
3.  **ISO-Konformität:** Basiert auf aktuellen Normen.

### Abgrenzung
- Keine Simulation von Gasströmungen (CFD).
- Keine Echtzeit-Messung (reines Planungstool).
- Blasentests (Wasserbad) sind ausgeklammert (nicht UHV-relevant).