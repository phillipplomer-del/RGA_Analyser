# Lecksuche-Planer – Zusammenfassung für Kollegen

**Version:** V7 COMPLETE (Implementation-Ready)
**Datum:** 2026-01-08
**Zweck:** Querlesen & Review

---

## TL;DR

**Was:** Intelligenter Wizard, der aus wenigen Eingaben einen ausführbaren Lecksuche-Prüfplan erstellt.

**Warum:** Marktlücke – kein herstellerunabhängiges Planungstool nach DIN EN 1779 verfügbar.

**Aufwand:** MVP = 16-21h | Full = 24-33h

**Besonderheit:** Spec-Qualität 10/10 – ~50% des Codes bereits fertig in der Spec!

---

## 1. Das Problem

### Typische Fragen von Vakuumtechnikern

- "Welche Lecksuchmethode brauche ich für mein Bauteil?" (B2, B4, B5, oder B6?)
- "Wie lange muss ich warten, bis das Helium-Signal stabil ist?"
- "Warum sehe ich kein Leck, obwohl eines da sein muss?" → **Virtual Leak**
- "Wie schließe ich den Lecksucher richtig an?" → **Teilstrom-Verdünnung**
- "Erfülle ich damit CERN/GSI/Semiconductor Standards?"

### Aktueller Zustand

- Hersteller (Pfeiffer, Leybold, INFICON) bieten nur **gerätespezifische** Software
- DIN EN 1779 gibt Richtlinien, aber keine konkrete Entscheidungshilfe
- Methodenwahl basiert oft auf "Erfahrung" statt Physik
- Fehlerquellen (Virtual Leak, Teilstrom) werden oft zu spät erkannt

---

## 2. Die Lösung

### Wizard-basiertes Planungstool

**Eingaben (4 Screens):**
1. Prüfling (Typ, Volumen, Dichtungen, Zugänglichkeit)
2. Material & Risiko (Oberfläche, Bakeout, Virtual-Leak-Faktoren)
3. Anforderungen (Ziel-Leckrate, Equipment, Helium verfügbar?)
4. **Ergebnis** → Ausführbarer Plan

**Ausgaben (3 Karten):**
1. **Methode** – Empfehlung + Begründung + Alternativen
2. **Aufbau** – Anschlussart (Serie vs. Teilstrom), Ventilzustände, ASCII-Schaltplan
3. **Zeit & Grenzen** – Pumpdown, Wartezeit pro Spot, Nachweisgrenze, Limitierender Faktor

**Plus:**
- Virtual-Leak Risikobewertung (0-100 Punkte, Live-Ampel)
- Warnungen (7 Typen: Leitwert, Teilstrom, Permeation, etc.) mit Maßnahmen
- Checkliste (Vorbereitung, Durchführung, Auswertung)
- Markdown-Export (Audit-ready mit Kalibrierungs-Block)

---

## 3. Methodenauswahl (Decision Tree)

### Unterstützte Methoden (MVP: 3 von 4)

| Methode | Code | Sensitivität | Lokalisierung | Wann? |
|---------|------|--------------|---------------|-------|
| **Rate-of-Rise** | B2 | 1×10⁻⁶ | Nein (integral) | Grob-Check, kein He nötig, schnell |
| **Helium Spray** | B5 | 1×10⁻¹² | Ja (lokal) | UHV-Standard, CERN/GSI, höchste Empfindlichkeit |
| **Helium Integral** | B6 | 1×10⁻⁸ | Nein (integral) | Serien-/Endabnahme, schnell |
| *Helium Sniffer* | *B4* | *1×10⁻⁶* | *Ja (lokal)* | *Phase 2: Überdruck-Prüfung* |

### Entscheidungslogik

**4 Sensitivitäts-Level:**
1. **Grob (≥ 1×10⁻⁶):** → B2 (kein Helium nötig, kostengünstig)
2. **Mittel (1×10⁻⁶ bis 1×10⁻⁸):** → B5 (lokal) oder B6 (integral)
3. **Fein (1×10⁻⁸ bis 1×10⁻¹⁰):** → B5 oder B6, Turbo zwingend
4. **UHV (< 1×10⁻¹⁰):** → B5 (nur B5 erreicht diese Grenze!)

**Hard Gates (Ausschlussregeln):**
- Kann nicht evakuiert werden + Target < 1×10⁻⁶ → B4 Sniffer oder "nicht möglich"
- Kein Helium verfügbar → B2 (Sensitivität limitiert)

---

## 4. Virtual Leak Risk Scoring (0-100 Punkte)

### Das Problem

**Virtual Leak** = Scheinleck durch eingeschlossenes oder desorbierendes Gas
- Helium-Test zeigt nichts, aber Druck steigt trotzdem
- Häufigste Fehlerquelle bei UHV-Leckssuche
- Kann zu falschen "Leck gefunden"-Diagnosen führen

### Automatische Bewertung (6 Faktoren)

| Faktor | Punkte | Wann kritisch? |
|--------|--------|----------------|
| Sackbohrungen | **+40** | Höchstes Risiko (Gas eingeschlossen) |
| Gewindeverbindungen innen | **+30** | Gasreservoire in Gängen |
| Eingeschlossene Volumina | **+25** | Doppel-O-Ring ohne Entlüftung |
| Gussmaterial | **+25** | Porosität, Gasblasen |
| Große Oberfläche ohne Bakeout | **+20** | > 10.000 cm², hohe H₂O-Desorption |
| Raue Oberfläche | **+10** | Erhöhte Gasadsorption |

### Schwellwerte & Maßnahmen

- **< 20 (Grün):** Kein Handlungsbedarf
- **20-39 (Gelb):** Rate-of-Rise Test empfohlen
- **40-59 (Orange):** Ausheizen empfohlen, RGA-Validierung
- **≥ 60 (Rot):** **KONSTRUKTIVE ÄNDERUNG ZWINGEND!** (Sackbohrungen durchbohren, Bakeout 150°C/24h)

**Live-Feedback:** Ampel aktualisiert sich bei jedem Klick im Wizard!

---

## 5. Physik-Engine (was sie berechnet)

### Zeitberechnung

**Zeitkonstante τ = V / S_eff**
- V = Volumen [L]
- S_eff = Effektives Saugvermögen [L/s]

**Wartezeit pro Spot = k × τ**
- k = 3 (Service, 95% Signal)
- k = 5 (Labor, 99% Signal)

→ Beispiel: 100 L Kammer, S_eff = 1.2 L/s → τ = 83 s → Wartezeit = 250 s (4 min!)

### Teilstrom-Verdünnung

**F_split = S_LD / (S_system + S_LD)**

→ Wenn Systempumpe (200 L/s) viel stärker als Lecksucher (1.2 L/s):
- Nur 0.6% des Heliums erreicht Detektor!
- **Leck wird nicht sichtbar** → Warnung mit Maßnahme

### Leitwert

**C_mol ≈ 12.1 × d³ / l** [L/s] (d, l in cm)

→ Lange enge Leitung (DN16, 1m): C = 2 L/s → Engpass!

### Nachweisgrenze

**MDL_eff = max(MDL_device, 3 × Background)**

→ He-Background 1×10⁻⁹ mbar verschlechtert Nachweisgrenze auf 3×10⁻⁹

---

## 6. Warnungen (7 Typen)

**Struktur:** Problem → Auswirkung → Konkrete Maßnahme

### Beispiele

**CRITICAL: Teilstrom-Verdünnung**
- Problem: Systempumpe 200 L/s >> Lecksucher 1.2 L/s
- Auswirkung: Nur 0.6% des Heliums erreicht Detektor
- Maßnahme: → Detektor SERIELL anschließen, Systempumpe ISOLIEREN

**HIGH: Leitwert zu niedrig**
- Problem: Leitung DN16, 3 m → C = 0.7 L/s
- Auswirkung: τ = 143 s, sehr langsam
- Maßnahme: → Leitung kürzen, größeren DN wählen (KF40)

**MEDIUM: Permeation-Risiko**
- Problem: 12× Viton O-Ringe, Target < 1×10⁻⁹
- Auswirkung: He-Permeation nach ~20 min
- Maßnahme: → Messfenster < 15 min, Vergleichsmessung ohne He

---

## 7. Equipment & Standards

### Lecksucher-Datenbank (5 Geräte)

**Pfeiffer ASM 340** (Standard UHV)
- FINE Mode: MDL = 5×10⁻¹³, S_eff = 1.2 L/s, Response = 1.0 s
- GROSS Mode: MDL = 1×10⁻⁷, S_eff = 0.5 L/s, Response = 0.5 s

**Leybold PHOENIX L300** (High-end)
- ULTRA Mode: MDL = 1×10⁻¹², S_eff = 1.5 L/s

**INFICON UL3000** (Research-grade)
- UHV Mode: MDL = 2×10⁻¹³, sehr stabil

**Generic** (Fallback)
- Konservative Annahmen für unbekanntes Gerät

### Leak Rate Standards (12 Presets)

**UHV / Beschleuniger:**
- CERN LHC: 1×10⁻¹⁰ (Strahlrohre, Kammern)
- GSI Kryostat: 1×10⁻¹⁰ (Kryogene Vakuumsysteme)
- GSI Beamline: 1×10⁻⁹ (Standard-Strahlrohre)

**Halbleiter:**
- Semiconductor: 1×10⁻⁹ (Wafer-Prozessierung)
- Coating: 1×10⁻⁸ (PVD/CVD Anlagen)

**Industrie:**
- Vacuum Furnace: 1×10⁻⁶ (Wärmebehandlung)
- Automotive AC: 1×10⁻⁵ (Kältemittelkreisläufe)

**Komponenten:**
- CF-Flansch: 1×10⁻¹¹ (ConFlat einzeln)
- UHV Weld: 1×10⁻¹⁰ **pro cm** (Schweißnahtlänge!)

---

## 8. Integration mit bestehenden Features

### Wiederverwendung

| Was | Woher | Anpassung |
|-----|-------|-----------|
| Geometrie-Rechner | Outgassing Simulator | Als Shared Component extrahieren |
| Material-Datenbank | outgassingRates.ts | Direkt nutzbar |
| Leckraten-Typen | types/rateOfRise.ts | Um Standards erweitern |

### Deep-Links

**Vom Lecksuche-Planer aus:**
- Bei B2-Empfehlung → Direkter Link zum Rate-of-Rise Modul
- Bei Virtual-Leak-Risk → Link zur RGA-Analyse

**Zur Lecksuche-Planer hin:**
- Von RGA-Diagnose (Air Leak / Virtual Leak) → Button "Lecksuche planen"

---

## 9. Warum ist die Spec so gut? (10/10)

### Vollständigkeit

1. **Alle TypeScript Types fertig** (20+ Interfaces) → Copy-Paste!
2. **Equipment Database fertig** (5 Geräte, 600 Zeilen Code) → Copy-Paste!
3. **Standards Database fertig** (12 Standards, 120 Zeilen) → Copy-Paste!
4. **Physik-Engine komplett spezifiziert** (alle Formeln mit Kommentaren)
5. **Decision Tree komplett** (alle Zweige, konkrete Schwellwerte)
6. **UI Screens vollständig** (alle Felder, Validierungen, Tooltips DE+EN)
7. **8 Test Cases** für Test-Driven Development (TC1-TC8)
8. **Report Template fertig** (Markdown-Generator 150 Zeilen)
9. **Warnungen komplett** (7 Typen, alle mit Problem/Auswirkung/Maßnahme)
10. **Zweisprachig** (alle Texte DE + EN)

**Ergebnis:** ~50% des Codes bereits in der Spec vorhanden!

---

## 10. Implementierungsplan

### MVP (16-21h) – Phasen 1-3

#### Phase 1: Core Engine & Types (6-8h)

**Physik-Module:**
- units.ts (1h), conductance.ts (2h), timing.ts (1h)
- splitFlow.ts (1h), sensitivity.ts (1h)

**Decision Logic:**
- methodSelection.ts (2h) – Decision Tree
- virtualLeakRisk.ts (2h) – 0-100 Punkte Scoring
- warnings.ts (2h) – 7 Warntypen

**Datenbanken (Copy-Paste!):**
- equipmentDatabase.ts (1h), leakRateStandards.ts (1h), conductancePresets.ts (1h)

**Tests:**
- engine.test.ts (2h), decision.test.ts (2h)

#### Phase 2: UI Wizard Quick Mode (8-10h)

**Container:** index.tsx (1h), WizardStepper.tsx (1h)

**Screens:**
- Screen1_TestObject.tsx (2h)
- Screen2_Materials.tsx (2h) – **mit Live Virtual-Leak-Risk-Ampel!**
- Screen3_Requirements.tsx (2h)
- Screen4_Result.tsx (3h) – 3 Karten

**Components:**
- VirtualLeakRiskCard.tsx (1h), WarningCard.tsx (1h), ChecklistCard.tsx (1h)

#### Phase 3: Report & Export (2-3h)

- reportTemplate.ts (1h) – Markdown-Generator
- Audit-Block (1h) – Standard, Kalibrierung, Annahmen

### Spätere Features (8-12h) – Phasen 4-6

**Phase 4: Expert Mode (4-6h)**
- Leitungslängen, DN, Bögen
- Ventiltypen (Gate, Angle, Ball, Butterfly)
- Leitwert-Berechnung mit Clausing-Faktor

**Phase 5: B4 Sniffer + PDF (4h)**
- B4 Überdruck-Methode (2h)
- PDF-Export mit jsPDF (2h)

**Phase 6: Integration (2-3h)**
- App.tsx Routing, FunctionSelector Karte, i18n

---

## 11. Markt & Wettbewerb

### Marktlücke

**Kein herstellerunabhängiges Planungstool nach DIN EN 1779 verfügbar!**

**Wettbewerb:**
- Pfeiffer Vacuum: Software nur für ASM-Geräte
- Leybold: Software nur für PHOENIX-Geräte
- INFICON: Software nur für UL-Geräte

**Marktgröße:**
- Leak Test Equipment Market: **$15.8B bis 2035** (8.26% CAGR)

### Zielgruppe

1. **Beschleuniger-Labore:** CERN, GSI, DESY, Fermilab
2. **Semiconductor Fabs:** TSMC, Intel, Samsung
3. **Vakuum-Equipment-Hersteller:** Pfeiffer, Leybold, Edwards
4. **Forschungseinrichtungen:** Max-Planck, Fraunhofer, Universities

---

## 12. UX-Prinzipien (verbindlich)

1. **"Ich weiß es nicht" muss überall möglich sein**
   → Konservative Defaults: "Wir nehmen 100 L an, damit du weiterkommst."

2. **2 Modi:**
   - Quick (Default): wenige Felder, robuste Annahmen
   - Expert (später): alle Details

3. **Ergebnis immer als 3 Karten:**
   - Methode, Aufbau, Zeit & Grenzen

4. **Warnungen sind Aufgaben:**
   - Problem → Auswirkung → Konkrete Maßnahme

5. **Keine Formeln in der UI**
   - Formeln bleiben im Engine-Teil
   - Optional: "Details anzeigen"-Panel

---

## 13. Offene Fragen für Review

### Scope

- [ ] **MVP-Scope OK?** (B2, B5, B6 ausreichend oder B4 Sniffer schon in MVP?)
- [ ] **Standards ausreichend?** (12 Presets oder mehr? NASA, ESA?)
- [ ] **PDF-Export in MVP?** (Oder reicht Markdown?)

### Technisch

- [ ] **Shared ChamberGeometry in MVP?** (Spart 2h, aber Abhängigkeit)
- [ ] **Leitwert-Berechnung:** Clausing-Faktor in MVP? (Erhöht Komplexität)
- [ ] **Generic Fallback sinnvoll?** (Oder Lecksucher-Modell zwingend?)

### UI/UX

- [ ] **4 Screens zu viel?** (Oder auf 3 komprimieren?)
- [ ] **Live-Ampel sinnvoll?** (Screen 2: Virtual Leak Risk aktualisiert sich live)
- [ ] **ASCII-Schaltplan ausreichend?** (Oder SVG-Grafik?)

---

## 14. Risiken & Mitigationen

### Technische Risiken

**Risiko:** Physik-Engine zu komplex
- **Mitigation:** 8 Test Cases validieren alle Berechnungen

**Risiko:** Shared Component Abhängigkeit (ChamberGeometry)
- **Mitigation:** Optional, kann auch später extrahiert werden

**Risiko:** Equipment DB veraltet
- **Mitigation:** Generic Fallback als Sicherheitsnetz

### Scope-Risiken

**Risiko:** Expert Mode verlangsamt MVP
- **Mitigation:** Klar getrennt in Phase 4 (nach MVP)

**Risiko:** Zu viele Warnungen verwirren User
- **Mitigation:** Warnungen nach Severity filtern (nur CRITICAL/HIGH per Default)

---

## 15. Warum jetzt?

### Synergien mit bestehenden Features

1. **Outgassing Simulator** (1.5.1) → Shared Geometrie, Virtual Leak Detection
2. **Rate-of-Rise** (done) → Deep-Link bei B2-Empfehlung
3. **RGA Diagnose** (done) → Validierung nach Lecksuche
4. **Konfidenz-Score** (1.5.3) → Validierung der Messergebnisse

### Nächster logischer Schritt

- Datenqualität ✅ (Prio 0 abgeschlossen)
- Wissenschaftliche Werkzeuge ✅ (Ausgasung, Isotopen, Konfidenz)
- **Lecksuche-Workflow fehlt!** ← Wir sind hier

→ **Komplettiert die "Vakuum-Diagnostik-Suite"** (RGA, RoR, Outgassing, **Leak Search**, Wissen)

---

## 16. Erfolgsmetriken

### Technisch

- [ ] Alle 8 Test Cases (TC1-TC8) bestehen
- [ ] Code Coverage > 80% für Engine-Module
- [ ] Zweisprachig (DE + EN) vollständig
- [ ] Markdown-Export funktioniert

### Funktional

- [ ] Methodenauswahl stimmt mit DIN EN 1779 überein
- [ ] Virtual-Leak-Risk-Scoring liefert plausible Ergebnisse
- [ ] Warnungen erscheinen bei bekannten Problemfällen
- [ ] Zeitberechnungen stimmen mit Praxis überein (±20%)

### User Experience

- [ ] Wizard in < 3 Minuten durchlaufbar (Quick Mode)
- [ ] "Ich weiß nicht"-Option überall verfügbar
- [ ] Ergebnis-Screen verständlich ohne Formeln
- [ ] Export-Plan direkt verwendbar im Labor

---

## Fazit

**Spec-Qualität:** 10/10 (beste Spec im Projekt)
**Marktpotenzial:** Hoch (Marktlücke, $15.8B Markt)
**Technische Umsetzbarkeit:** Sehr gut (~50% Code fertig)
**Synergien:** Exzellent (Wiederverwendung, Integration)

**Empfehlung:** MVP-Implementierung starten (Phasen 1-3, 16-21h)

---

**Ende der Zusammenfassung**

*Vollständige Details mit Code-Beispielen: LeaksearchPlanner_MasterV7_COMPLETE.md*
