# Lecksuche-Planer – Master V6 (HV/UHV, Anwender-fokussiert, Physik intern korrekt)

**Datum:** 2026-01-08  
**Zweck dieses Dokuments:** App-Planung/Spezifikation.  
- **UI/UX:** so einfach wie möglich für Anwender.  
- **Physik:** intern korrekt und nachvollziehbar (Formeln im Abschnitt „Engine intern“).  
- **Scope V1:** HV/UHV-Lecksuche (Helium), plus unterstützende Vakuumprüfungen und RGA-gestützte Diagnose.

---

## 1. Ziel & Scope

### 1.1 Ziel
Die App soll aus wenigen Eingaben einen **ausführbaren Prüfplan** erzeugen:
- Welche Methode ist sinnvoll (B5/B6/B2; B4 nur als Vorcheck)?
- Wie baue ich auf (in Worten und später als Skizze)?
- Wie lange muss ich realistisch warten/messen?
- Welche typischen Fehlerquellen liegen vor (Leitwert, Teilstrom, Background, Permeation, Virtual Leak)?
- Wie dokumentiere ich das auditfähig?

### 1.2 Fokus HV/UHV (V1)
- Typische Prüflinge: Vakuumkammern, UHV-Module, Flansche, Feedthroughs, Ventile, Pumpenanschlüsse.
- Typische Methoden:
  - **B5 Helium-Spray (Vakuummethode, lokal) – Standard**
  - **B6 Helium integral (Haube/Kammer) – Standard für Serien-/Endabnahme**
  - **B2 Rate-of-Rise / Druckanstieg – Diagnose & Vorabtest**
  - **B4 Sniffer – nur für Groblecks / Produktions-Vorcheck**
- **Nicht Kern von V1:** „Sealed Device / Bombing“. Wird als „Advanced“ separat geführt.

### 1.3 Prinzip: „Anwender zuerst“
Die UI zeigt keine Formeln. Die App liefert:
- klare Entscheidung + Begründung in Alltagssprache,
- konkrete Handlungsanweisungen,
- Warnungen immer mit „Was tun?“.

Formeln und Modellannahmen bleiben im Engine-Teil dieses Dokuments (und optional in einem „Details anzeigen“-Panel).

---

## 2. Nutzerbild & UX-Regeln

### 2.1 Zielnutzer
Anwender, die Lecksuche durchführen, aber nicht jede Leitwertgleichung auswendig kennen.

### 2.2 UX-Regeln (verbindlich)
1) **„Ich weiß es nicht“ muss überall möglich sein.**  
   Dann arbeitet die App mit konservativen Defaults und zeigt: „Wir nehmen X an, damit du weiterkommst.“
2) **2 Modi:**
   - **Quick (Default):** wenige Felder, robuste Annahmen.
   - **Expert (optional):** Leitungslängen/Durchmesser, Ventiltypen, detaillierte Geräteparameter.
3) **Ergebnis immer als 3 Karten:**
   - **Methode**
   - **Aufbau**
   - **Zeit & Grenzen**
4) **Warnungen sind Aufgaben.**  
   Jede Warnung enthält: *Problem* → *Auswirkung* → *konkrete Maßnahme*.

---

## 3. Wizard-Ablauf (UI) – Screens & Inputs

### Screen 1: Prüfling
Pflichtfelder (Quick):
- Prüflingstyp (Kammer / Baugruppe / Ventil / Feedthrough / „Sonstiges“)
- Volumen (L) oder „unbekannt“ → Geometriehilfe (L×B×H / Zylinder / grobe Klasse klein/mittel/groß)
- Dichtungsart (CF / KF / O-Ring / gemischt)
- Zugänglichkeit außen (voll / teilweise / kaum)

Optional (Expert):
- Materialhinweise (viel Elastomer? Polymere? Kleber?)
- „Trapped volumes“ wahrscheinlich? (ja/nein/unklar)

### Screen 2: Ziel & Anforderungen
- Grenzwert Leckrate (mbar·l/s) oder Auswahl aus Presets (intern mapbar)
- Lokalisation erforderlich? (ja/nein)
- Zeitlimit (optional)
- Dokumentationslevel (einfach / auditfähig)

### Screen 3: Equipment
Quick:
- Leak Detector Modell (Dropdown aus DB oder „unbekannt“)
- Anschlussart (direkt am Prüfling / über Leitung / Teilstrom parallel)
- Systempumpe aktiv während Messung? (ja/nein/unklar)

Expert:
- Pumpenmodell + Nenn-Saugvermögen
- Leitungsdaten (DN, Länge, Anzahl Bögen, Ventiltyp)
- Haube/Kammer vorhanden (für B6) ja/nein

### Screen 4: Setup-Plan
Ausgabe:
- Aufbau in Schritten (Ventile, Reihenfolge)
- Empfohlener Messmodus (Fine/Gross o. ä. aus DB)
- „Was muss vor Start stabil sein?“ (Basisdruck/Background)

### Screen 5: Ablauf & Checkliste
- Pumpdown/Wait/Messen/Cleanup
- Sprühstrategie (Reihenfolge + Zeit pro Spot)
- „Wenn Ergebnis unklar“ → Diagnosepfad (B2 + optional RGA)

### Screen 6: Report / Export
- Plan als Markdown/PDF
- Auditblock (Kalibrierung, Randbedingungen, Entscheidung)

---

## 4. Ergebnis: Was die App liefert

### 4.1 Karte 1 – Methode
Beispielausgabe:
- **Empfehlung:** B5 Helium-Spray (lokal)  
- **Warum:** Grenzwert sehr niedrig und Außenflächen zugänglich.  
- **Alternative:** B6 integral (wenn Haube vorhanden / wenn Lokalisierung nicht nötig).

### 4.2 Karte 2 – Aufbau
- Anschlussplan (Text, später Skizze)
- Hinweis, ob Teilstrom ok ist oder zu viel verdünnt
- Ventilzustände (offen/zu) als Liste

### 4.3 Karte 3 – Zeit & Grenzen
- „Wartezeit pro Sprühstoß“ (z. B. 60–120 s)
- Gesamtdauer (Pumpdown + Stabilisierung + Messfenster)
- erreichbare Nachweisgrenze im Setup (konservativ)
- wichtigste Limits (Leitwert / Background / Permeation)

### 4.4 Warnungen (immer mit Maßnahme)
Typen:
- **Leitwert bremst** → Leitung kürzer / größer / Detektor näher / Ventil voll öffnen
- **Teilstrom verdünnt** → seriell anschließen oder Systempumpe drosseln/isolieren
- **Background zu hoch** → purge/auslüften/He-Quellen entfernen/cleanup abwarten
- **Permeation wahrscheinlich** → O-Ringe minimieren, Messfenster begrenzen, Vergleichsmessung
- **Virtual Leak Risiko** → zuerst B2 + Stabilisierung, ggf. RGA-Check

---

## 5. Methodenauswahl (Decision Engine) – Regeln ohne Formeln

### 5.1 Hard Gates (Ausschlussregeln)
- **Lokalisierung erforderlich** und Außenflächen zugänglich (voll/teilweise) → B5 bevorzugt, B6 nicht primär
- **Lokalisierung nicht erforderlich** und Haube vorhanden → B6 bevorzugt
- **Prüfling nicht sinnvoll evakuierbar** → B5/B6 ausgeschlossen (V1: dann nur Vorcheck; Advanced: Bombing)
- **Grenzwert oberhalb typischer UHV-Anforderungen** und schnelle Prüfung gewünscht → B4 Sniffer kann als Vorcheck angeboten werden (klar als „Grobleck-Check“)

### 5.2 Scoring (weiche Kriterien)
Punkte 0–5 für:
- erwartete Sensitivität (setup-basiert)
- Lokalisierbarkeit
- Durchlaufzeit
- Robustheit gegen Background/Permeation/Virtual Leak
- Equipment-Fit

Ausgabe: Top-1 + Top-2 inkl. kurzer Begründung.

---

## 6. Diagnosepfade (für unklare Fälle)

### 6.1 Wenn Helium-Spray „nichts zeigt“, aber Verdacht bleibt
- Prüfe: Teilstrom-Verdünnung / Leitwert / Ventilzustände
- Führe **B2 Rate-of-Rise** als Diagnose durch (kurz, strukturiert)
- Optional: **RGA Quick-Check** (wenn vorhanden):
  - Air-Leak Indikatoren (28/32/40 Verhältnis)
  - Water/Outgassing dominant (18/17/16)
  - HC/Backstreaming Indikatoren

### 6.2 Wenn Signal da ist, aber driftet
- He-Background/Memorie prüfen (cleanup/purge)
- Permeation-Verdacht (O-Ringe, lange Exposition, warme Dichtungen)
- Wiederhole lokal an Referenzstelle / Vergleichsmessung

---

# ENGINE INTERN (Physik, Modelle, Annahmen)
> Dieser Teil dient der korrekten Implementierung. Er muss stimmen, auch wenn er später nicht im UI angezeigt wird.

## 7. Einheiten & Standards

### 7.1 Kern-Einheiten (intern vereinheitlichen)
- Leckrate: **mbar·l/s** intern (oder **Pa·m³/s**, aber einheitlich)
- Volumen: **l**
- Pumpen-/Leitwerte: **l/s**
- Druck: **mbar**
- Zeit: **s**

**Konverter (Beispiele):**
- 1 mbar·l/s = 0.1 Pa·m³/s (prüfen/implementieren exakt)
- 1 l = 1e-3 m³

> Umsetzung: zentrale `units.ts` mit geprüften Konvertern + Unit-Tests.

### 7.2 Norm-Referenz (UI-neutral)
- ISO 20485 (Tracer Gas Method) als Methodennamen-Referenz.
- Auditblock (Kalibrierstatus, Entscheidungsregel, Randbedingungen).

---

## 8. Effektives Saugvermögen am Prüfling: S_eff

### 8.1 Grundprinzip (Serie)
Effektives Saugvermögen am Prüfling:
\[
\frac{1}{S_{eff}} = \frac{1}{S_{pump}} + \frac{1}{C_{total}}
\]
- `S_pump`: Saugvermögen der Pumpe am Anschluss (ggf. Gas-spezifisch)
- `C_total`: Gesamtleitwert der Verbindung (Rohr + Ventile + Adapter), ggf. Druck-/Regime-abhängig

### 8.2 Leitwert-Modelle (Quick vs Expert)

**Quick-Mode (robust):**
- Wenn nur „DN & Länge“ bekannt: benutze einfache Formeln + Sicherheitsfaktor.
- Wenn nichts bekannt: konservatives `C_total` aus Preset (z. B. „lange flexible Leitung“).

**Expert-Mode (Details):**
- Rohrleitwert abhängig vom Strömungsregime:
  - Molekular (HV/UHV):
    \[
    C_{mol} \approx 12.1\,\frac{d^3}{l} \;[l/s] \quad (d,l \text{ in cm})
    \]
  - Laminar/viskos (für Vorvakuum-Phasen, optional):
    \[
    C_{lam} \propto \bar{p}\,\frac{d^4}{l}
    \]
- **Kurze Rohre/Blenden/Einbauten:** Clausing-Faktor bzw. Herstellerwerte/Lookup.

**Gas-Korrektur (molekular, Näherung):**
\[
C_{gas} \approx C_{air}\,\sqrt{\frac{M_{air}}{M_{gas}}}
\]
Für Helium steigt Leitwert deutlich.  
> In V1 kann He-Korrektur optional sein; wichtig ist, dass `C_total` nicht überschätzt wird.

### 8.3 Typische Fehlerquellen (Engine-Warnungen)
- `C_total` klein → `S_eff` wird klein → lange Response-Zeit → „zu schnell gesprüht“ falsches Negativ
- Gate Valve halb geschlossen → effektiver Leitwert bricht ein (UI muss Ventilzustand abfragen)

---

## 9. Zeitmodelle (Response, Stabilisierung, Messfenster)

### 9.1 Zeitkonstante (1. Ordnung)
\[
\tau = \frac{V}{S_{eff}}
\]
- `V`: effektives Messvolumen (Prüfling + angeschlossene Volumina)
- `S_eff`: am Prüfling

Empfehlung für stabile Aussage:
- `t_wait_per_spot` = `k_tau * tau`, Default `k_tau = 3` (konfigurierbar 2–5)

### 9.2 Mehrzeitkonstanten (Warnlogik)
Wenn Leitung sehr lang/eng oder „trapped volumes“ wahrscheinlich:
- `k_tau` erhöhen
- Zusatzhinweis: „Erst stabilisieren, dann lokalisieren.“

---

## 10. Teilstrom/Verdünnung (Split-Flow)

Wenn Leak Detector parallel zum System pumpen muss, sieht er nur einen Anteil des Leckstroms.

Anteil zum Detektor:
\[
F_{split} = \frac{S_{LD}}{S_{system}+S_{LD}}
\]
- `S_LD`: effektives Saugvermögen am LD-Einlass (mode-abhängig)
- `S_system`: effektives Saugvermögen des übrigen Systems

„Gesehene“ Leckrate:
\[
Q_{seen} = Q_{true}\,F_{split}
\]

Warnregel:
- Wenn `Q_seen` < `MDL_effective` (siehe Abschnitt 11) → „nicht nachweisbar“ + Setup-Änderung vorschlagen.

---

## 11. Nachweisgrenze & Signalmodell (konservativ)

### 11.1 Detektor-MDL (mode-abhängig)
Geräte-DB liefert pro Mode:
- `mdl` (z. B. mbar·l/s)
- `inlet_pressure_range`
- typische `response_time` und `cleanup_time`

### 11.2 Effektive MDL im Setup
Konservatives Modell:
\[
MDL_{eff} = \max\left(MDL_{device},\;k_{bg}\cdot BG\right)
\]
- `BG`: stabiler He-Background als äquivalente Leckrate oder Signal
- `k_bg`: Faktor (z. B. 3–5), um Drift/Noise abzudecken

Entscheidung:
- PASS/FAIL mit Guard Banding (Audit):
  - PASS wenn `Q_meas + k_U*U < Limit`

> V1 kann `U` als einfacher Unsicherheitsfaktor modelliert werden (z. B. 2×) und später verfeinert.

---

## 12. Background, Memory, Cleanup (He)

Engine-Heuristik (pragmatisch):
- Wenn in letzter Zeit viel gesprüht wurde oder viele Elastomere vorhanden:
  - `cleanup_time` erhöhen
  - Hinweis: Auslüften, N2-Purge, He-Quellen entfernen
- Wenn Messsignal driftet und keine lokale Korrelation:
  - Background-Verdacht → Diagnosepfad

---

## 13. Permeation & Virtual Leaks (HV/UHV-relevant)

### 13.1 Virtual Leaks (Ampel)
Eingaben (Quick):
- viele O-Ringe/Polymere? (ja/nein/unklar)
- „Taschen/Spalte wahrscheinlich?“ (ja/nein/unklar)
- Bake/clean Status (ja/nein/unklar)

Ausgabe:
- Ampel + Maßnahme (z. B. erst B2 + Stabilisierung)

### 13.2 Permeation (konservativ, V1)
V1: kein exakter Materialrechner nötig, aber sinnvolle Warnlogik:
- Wenn viele Elastomere und sehr niedriger Grenzwert:
  - Permeationswarnung aktivieren
  - Messfenster begrenzen + Vergleichsmessung empfehlen
V2+: optional Materialdatenbank (D/P vs T) und Durchbruchzeit.

---

## 14. Datenmodell (V6) – JSON/TS-Entwurf

### 14.1 Grundobjekte
- `Asset` (Prüfling)
- `Requirements`
- `Equipment` (Pumpe, Leitungen, Leak Detector, Haube)
- `Plan` (Methode, Aufbau, Zeiten, Warnungen, Audit)

### 14.2 Minimalbeispiel (JSON)
```json
{
  "asset": {
    "id": "CH-001",
    "name": "Kammer A",
    "volume_l": 120,
    "volume_quality": "estimated",
    "seals": ["CF"],
    "access_outside": "full",
    "virtual_leak_risk_hint": "unknown"
  },
  "requirements": {
    "limit_mbar_l_s": 1e-10,
    "localization_required": true,
    "report_level": "audit"
  },
  "equipment": {
    "leak_detector": {
      "model": "MSLD-X",
      "selected_mode": "FINE",
      "modes": [
        { "name": "FINE", "mdl_mbar_l_s": 1e-12, "inlet_p_mbar_min": 1e-4, "inlet_p_mbar_max": 5 },
        { "name": "GROSS", "mdl_mbar_l_s": 1e-7, "inlet_p_mbar_min": 1e-2, "inlet_p_mbar_max": 50 }
      ]
    },
    "system_pumping": {
      "active_during_test": true,
      "estimated_speed_l_s": 200
    },
    "connections": [
      { "kind": "tube", "dn": "KF40", "length_cm": 80, "bends": 2, "notes": "flex hose" },
      { "kind": "valve", "type": "gate", "state": "open" }
    ],
    "hood_available": false
  },
  "engine": {
    "mode": "quick",
    "assumptions": ["He tracer 100%", "conservative conductance factor"]
  },
  "plan": {
    "recommended_method": "B5",
    "alternatives": ["B6", "B2"],
    "time_estimates_s": { "wait_per_spot": 90, "stabilization": 600 },
    "warnings": [
      { "code": "SPLIT_FLOW_TOO_LOW", "severity": "high", "action": "Connect detector in series or isolate system pump during measurement." }
    ],
    "audit": {
      "calibration": { "ref_leak": "unknown", "date": "unknown" },
      "decision_rule": "PASS if Q + kU*U < limit"
    }
  }
}
```

---

## 15. Testkatalog (Pflicht für V1)

1) Kleinvolumen direkt am LD → kurze Wartezeit, keine Leitwertwarnung  
2) Großvolumen + lange enge Leitung → Leitwertwarnung, lange Wartezeit  
3) Teilstrom mit dominanter Systempumpe → Verdünnungswarnung, Vorschlag seriell/isolieren  
4) Viele O-Ringe + niedriger Grenzwert → Permeationswarnung, Messfenster/Strategie  
5) Virtual-Leak-Indizien → B2 empfohlen, Spray erst nach Stabilisierung  
6) Background hoch (He-Umgebung) → MDL_eff hoch, cleanup empfohlen  
7) Ventil halb zu (simuliert) → drastische Änderung S_eff, App muss es erkennen  
8) Übergang: Pumpdown-Phase (optional) → App darf nicht mit falschem Regime unrealistische Zeiten ausgeben

---

## 16. Advanced (nicht Kern von V1): Sealed Device / Bombing
- Separater Pfad, standardmäßig ausgeblendet.
- Erst aktivieren, wenn Nutzer „sealed device“ auswählt.
- Eigenes Modellpaket + klare Einheiten/Annahmen (wichtig, sonst Fehlinterpretationen).

---

## 17. Umsetzungshinweise (Engineering)

- Zentraler Engine-Service: `computePlan(input) -> plan`
- Deterministische Ergebnisse (gleiche Eingabe → gleiches Ergebnis)
- Alles versionieren: `plan.engine_version`, `equipment_db_version`
- Unit-Tests für:
  - Unit conversions
  - Conductance + S_eff
  - Split-flow
  - Tau/Wartezeiten
  - Warnlogik

---

**Ende V6**
