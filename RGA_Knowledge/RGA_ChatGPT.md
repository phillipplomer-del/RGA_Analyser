# RGA/UHV Wissensdatenbank (Backend-Logik)
> Zweck: strukturierte, maschinenlesbare Referenz (Markdown) für automatische Auswertung von RGA/QMS-Spektren in UHV-Systemen (m/z 1–100).
> Annahmen: Elektronenstoßionisation (typisch 70 eV), Quadrupol-RGA. Cracking Patterns variieren mit Ionisationsenergie, Quelle/Geometrie, Transmission, Detektor (Faraday/SEM) und Tuning.

## Datenmodell (für Software)
Empfohlenes internes Modell (z. B. Typescript):

```ts
type Mass = number; // integer m/z
type Pattern = Record<Mass, number>; // Relativ zum Hauptpeak = 100
type Species = {
  key: string;          // z.B. 'H2O'
  name: string;         // 'Wasser'
  mainMass: Mass;       // Hauptpeak
  pattern: Pattern;     // Cracking Pattern (rel. %)
  notes?: string[];     // Isotope, Mehrfachionisation, typische Überlagerungen
};

type Spectrum = Record<Mass, number>; // z.B. A oder mbar

// Deconvolution (Überlagerungen):
// y[m] = Sum_i (k_i * pattern_i[m]) + noise,  k_i >= 0
// -> NNLS oder robustes constrained least squares
```

## Quellenbasis (Auszug)
- **MKS / Spectra**: "RGA Application Bulletin #208" (Cracking Patterns & typische Pumpenöle).
- **Pfeiffer**: Grundlagen-Dokumentation zu Fragmentierung, Überlagerungen, Mehrfachionisation (z. B. Ar++ Beitrag bei m/z 20) und Abhängigkeit von Ionisationsenergie.
- **INFICON**: Technische Notiz zur Nutzung der **NIST**-Bibliothek für Fragmentierungs-/Cracking-Patterns.
- **Agilent**: GC/MS-Hintergrund-/Leck-/Kontaminationsdiagnose (m/z 18/28/32/44 als Air/Water-Background Indikatoren).
- **CERN (TE-VSC)**: Spezifikationen/Schwellen für Vakuum-Akzeptanztests (unbaked & baked).
- **DESY**: UHV-Guidelines inkl. Hydrocarbon-freies-Kriterium.

---

# 1) Massen-Bibliothek & Fragmentierungsmuster (Cracking Patterns)

## 1.1 Wichtige Hinweise für die Software
- **Cracking Patterns sind instrumentabhängig** (Ionisationsenergie, Ion Source, Transmission, Quadrupol-Auflösung). Nutze Bibliothekswerte als **Startwerte** und ermögliche **Kalibrierung/Anpassung** pro RGA.
- **Mehrfachionisation**: schwere Gase können als doppelt geladene Ionen bei halbem m/z erscheinen (z. B. **Ar++ bei 20**), was in Mischungen (Ar/Ne) zu Fehlinterpretationen führt.
- **Isotope**: Für Trennung/Leak-Diagnose (Ar 36/38/40; CO2-Isotop bei 45 etc.) lohnt es sich, Isotopenpeaks explizit zu modellieren.

## 1.2 Cracking-Pattern Bibliothek (für m/z ≤ 100)
Werte sind **relativ zum Hauptpeak = 100**. (Aus Hersteller-Referenzen; Startwerte für Modell/NNLS.)

| Species | Hauptpeak (m/z) | Cracking Pattern (m/z:rel%) | Hinweise |
|---|---:|---|---|
| H2 | 2 | 2:100, 1:5 | Hauptgas in baked UHV; m/z 1 als Fragment/Untergrund |
| He | 4 | 4:100 | Leak-Detection Tracer; in UHV sonst meist niedrig |
| CH4 | 16 | 16:100, 15:85, 14:16, 13:8, 1:4 | typische HC-Quelle; 15/16 hilft Abgrenzung zu O+ |
| NH3 | 17 | 17:100, 16:80, 15:8, 14:2 | kann mit H2O/OH überlappen (17/16) |
| H2O | 18 | 18:100, 17:25, 1:6, 16:2, 2:2 | dominant in unbaked; 17/18 ~0.25 typisch |
| Ne | 20 | 20:100, 22:9 | Achtung Ar++ bei 20 kann Ne vortäuschen |
| C2H2 | 26 | 26:100, 25:20, 13:5, 54:5, 27:3 | HC/Prozessgas |
| N2 | 28 | 28:100, 14:7, 29:1 | Atmosphäre/Leck; 14/28 ~0.07 |
| CO | 28 | 28:100, 16:10, 12:5, 29:1 | ausgasen/ESD; 16/28~0.10 + 12/28~0.05 |
| C2H4 | 28 | 28:100, 26:61, 27:59, 25:12, 14:8 | kann m/z 28 verfälschen |
| C2H6 | 28 | 28:100, 27:33, 30:26, 26:23, 29:21 | kann m/z 28 verfälschen |
| Air | 28 | 28:100, 32:27, 14:6, 16:3, 40:1 | Referenz für Atmosphäre (N2/O2/Ar) |
| C3H8 | 29 | 29:100, 28:59, 27:38, 44:26, 43:22 | HC; Peakgruppe 27–29, 43/44 |
| O2 | 32 | 32:100, 16:11 | Atmosphäre/Leck; 16 als Fragment |
| H2S | 34 | 34:100, 32:44, 33:42, 36:34, 35:2 | Schwefelkontamination |
| Ar | 40 | 40:100, 20:10 | Atmosphäre/Leck; 20 kann Ar++ sein |
| C3H6 | 41 | 41:100, 39:73, 42:69, 27:38, 40:29 | HC Muster um 41/39/42 |
| Acetone | 43 | 43:100, 15:67, 28:17, 14:15, 58:15 | Lösemittel-Kontamination |
| Butane | 43 | 43:100, 29:44, 27:37, 28:32, 41:27 | HC |
| MEK | 43 | 43:100, 29:25, 72:16, 27:16, 57:6 | Lösemittel-Kontamination |
| MP Oil (forepump) | 43 | 43:100, 41:91, 57:73, 55:64, 71:20 | mechanische Pumpe: 41/43/55/57/71 |
| Turbopump Oil | 43 | 43:100, 57:88, 41:76, 55:73, 71:52 | Turbo-Öl Backstreaming |
| CO2 | 44 | 44:100, 28:11, 16:9, 12:6, 45:1 | CO2 & Carbonate; 45 Isotop |
| N2O | 44 | 44:100, 30:31, 14:13, 28:11, 16:5 | Prozess/Leck/Plasma-Anwendungen |
| iPrOH | 45 | 45:100, 43:16, 27:16, 29:10, 41:7 | Lösemittel |
| SO2 | 64 | 64:100, 48:49, 32:10, 66:5, 16:5 | Schwefel/Prozess |
| Fomblin (PFPE) | 69 | 69:100, 20:28, 16:16, 31:9, 97:8 | fluorierte Öle (PFPE) |
| Benzene | 78 | 78:100, 77:22, 51:18, 50:17, 52:15 | Aromaten (Lösungsmittel/Outgassing) |
| DP Oil DC705 | 78 | 78:100, 76:83, 39:73, 43:59, 91:32 | Diffusionspumpenöl (Silikonöl) |
| Kr | 84 | 84:100, 86:31, 83:20, 82:20, 80:4 | Edelgas; Isotope wichtig |
| Toluene | 91 | 91:100, 92:69, 65:16, 51:10, 63:9 | Aromaten |
| Trichloroethylene | 95 | 95:100, 60:65, 97:64, 35:40, 47:26 | Chlorierte Reinigungschemikalie |

## 1.3 Isotopen- und Mehrfachladungs-Handling
### Argon-Isotope (für Leak-/Gas-Identifikation)
- Natürliche Isotopenanteile (Erde): **Ar-40 ~99.6%**, **Ar-36 ~0.336%**, **Ar-38 ~0.063%**.
- **Algorithmus**: Wenn m/z 40 signifikant ist und m/z 36/38 im passenden Verhältnis erscheinen, erhöht das die Wahrscheinlichkeit für *Atmosphäre* bzw. Argon-Zufuhr.

### Mehrfachionisation (Beispiele)
- **Ar++ → m/z 20** kann Neon (m/z 20) vortäuschen. Die Beiträge hängen stark von der Elektronenenergie ab; Reduktion der Elektronenenergie kann Mehrfachionisation unterdrücken.
- **CO2++ → m/z 22** (relevant wenn m/z 22 beobachtet wird; kann mit Ne-22 überlappen).

## 1.4 Mass-Index (m/z 1–100)
Ziel: schnelle Zuordnung "welches Gas ist Hauptkandidat" plus Überlagerungs-Hinweise für Backend-Logik.

| m/z | Primärzuordnung (typisch Hauptpeak) | Häufige weitere Beiträge / Überlagerungen | Pattern-Hinweis (nur wenn Primär = Hauptpeak) |
|---:|---|---|---|
| 1 | — | H (H2), H aus H2O/HC; kann auch als ESD/Untergrund auftreten | — |
| 2 | H2 | H2; auch kleiner Beitrag aus H2O (2%) | 2=100%, 1=5% |
| 3 | — | HD/D3+ möglich (Sonderfälle, Deuterium); selten in Standard-UHV | — |
| 4 | He | He; auch D2; auch Ar++ (bei Argon-Präsenz) | 4=100% |
| 5 | — | — | — |
| 6 | — | — | — |
| 7 | — | — | — |
| 8 | — | — | — |
| 9 | — | — | — |
| 10 | — | — | — |
| 11 | — | — | — |
| 12 | — | C+ aus CO/CO2/HC; kann als ESD-Spurious auftreten | — |
| 13 | — | — | — |
| 14 | — | N+ aus N2; auch N2++ (doppelt geladen); CH2+ aus HC | — |
| 15 | — | CH3+ aus CH4/HC; auch NHx-Fragmente | — |
| 16 | CH4 | CH4 Haupt; O+ aus O2/H2O/CO/CO2; häufige Überlagerung; ESD möglich | 16=100%, 15=85%, 14=16%, 13=8%, 1=4% |
| 17 | NH3 | NH3 Haupt oder OH+ aus Wasser; trennt sich über 16/17/18 Verhältnis | 17=100%, 16=80%, 15=8%, 14=2% |
| 18 | H2O | H2O Haupt (unbaked); auch kleiner Beitrag aus Methanol etc. | 18=100%, 17=25%, 1=6%, 2=2%, 16=2% |
| 19 | — | H3O+ kann als ESD-Peak auftreten; auch F+ in Fluorchemie | — |
| 20 | Ne | Ne Haupt; Ar++ aus Argon (20/40≈0.1 typisch); CO2++ (22) Nachbarschaft | 20=100%, 22=9% |
| 21 | — | — | — |
| 22 | — | Ne-22 (nat. ~9% rel); auch CO2++ möglich | — |
| 23 | — | — | — |
| 24 | — | — | — |
| 25 | — | — | — |
| 26 | C2H2 | C2H2 Haupt; auch C2-Fragmente aus HC | 26=100%, 25=20%, 13=5%, 54=5%, 27=3% |
| 27 | — | HC-Fragmente; Vinyl/Propen etc. | — |
| 28 | N2/CO | N2 oder CO (stark überlagert); auch C2H4/C2H6 möglich | 28=100%, 14=7%, 29=1% | 28=100%, 16=10%, 12=5%, 29=1% |
| 29 | C3H8 | Propane Haupt in Tabelle; auch 13CO (Isotop) und HC-Fragmente | 29=100%, 28=59%, 27=38%, 44=26%, 43=22% |
| 30 | — | NO/NO2/N2O, Silane; oft Prozessabhängig | — |
| 31 | — | — | — |
| 32 | O2 | O2 Haupt; auch S-Fragmente (SO2 hat 32=10%) | 32=100%, 16=11% |
| 33 | — | — | — |
| 34 | H2S | H2S Haupt; auch 34S Isotope in SO2; ggf. HCl (36/38) Umfeld | 34=100%, 32=44%, 33=42%, 36=34%, 35=2% |
| 35 | — | Cl+ aus Chlorchemie/Reiniger; kann auch ESD-Spurious sein | — |
| 36 | Ar-36 | Ar-36 Isotop (mit 40 korreliert); auch H2S hat 36=34% | — |
| 37 | — | — | — |
| 38 | Ar-38 | Ar-38 Isotop; auch HCl (38) möglich | — |
| 39 | — | — | — |
| 40 | Ar | Ar-40 (Atmosphäre/Spülgas) | 40=100%, 20=10% |
| 41 | C3H6 | Propen/HC; typisch auch bei Pumpenöl/Backstreaming | 41=100%, 39=73%, 42=69%, 27=38%, 40=29% |
| 42 | — | — | — |
| 43 | HC/Lösemittel/Öl | Acetone/MEK/Butane/Öle: sehr häufiges Kontaminationssignal | — |
| 44 | CO2 | CO2 oder N2O oder Propan-Fragment (44=26% bei C3H8) | 44=100%, 28=11%, 16=9%, 12=6%, 45=1% |
| 45 | iPrOH / CO2(45) | iPrOH; CO2 Isotop (45); organische Säuren/Alkohole | 45=100%, 27=16%, 43=16%, 29=10%, 41=7% |
| 46 | — | — | — |
| 47 | — | — | — |
| 48 | — | SO2 Fragment (48=49%); auch CO2? selten | — |
| 49 | — | — | — |
| 50 | — | CF4 Fragment; Benzol-Fragmente; DP/PFPE Produkte | — |
| 51 | — | — | — |
| 52 | — | — | — |
| 53 | — | — | — |
| 54 | — | — | — |
| 55 | — | Öle/Alkane (C4H7+ etc.) | — |
| 56 | — | — | — |
| 57 | HC/Öl | klassischer Öl/Alkan-Fragment (C4H9+); zusammen mit 43/55/71 typisch | — |
| 58 | — | — | — |
| 59 | — | Siloxan/PDMS Marker (häufig mit 73/147) | — |
| 60 | — | — | — |
| 61 | — | — | — |
| 62 | — | — | — |
| 63 | — | — | — |
| 64 | SO2 | SO2 Haupt | 64=100%, 48=49%, 32=10%, 16=5%, 66=5% |
| 65 | — | — | — |
| 66 | — | — | — |
| 67 | — | — | — |
| 68 | — | — | — |
| 69 | Fomblin (PFPE) | PFPE/Fomblin Marker; auch CF3+ in Fluorchemie | 69=100%, 20=28%, 16=16%, 31=9%, 97=8% |
| 70 | — | — | — |
| 71 | Öl/HC | Öl (siehe Turbopump Oil: 71=52%) | — |
| 72 | — | — | — |
| 73 | Siloxan/PDMS | Siloxan/PDMS Marker (trimethylsilyl / siloxane); oft zusammen mit 147 | — |
| 74 | — | — | — |
| 75 | — | — | — |
| 76 | CS2/AsH3/DP oil frag | CS2 Haupt (76); auch DP oil DC705 hat 76=83% | — |
| 77 | — | — | — |
| 78 | Benzene / DP Oil DC705 | Benzol oder Diffusionspumpenöl DC705; trennt sich über Nebenpeaks (91 etc.) | 78=100%, 77=22%, 51=18%, 50=17%, 52=15% | 78=100%, 76=83%, 39=73%, 43=59%, 91=32% |
| 79 | — | — | — |
| 80 | Kr (Isotop) | — | — |
| 81 | — | — | — |
| 82 | Kr (Isotop) | — | — |
| 83 | Kr (Isotop) | — | — |
| 84 | Kr | Krypton; Isotopencluster 80/82/83/84/86 | 84=100%, 86=31%, 82=20%, 83=20%, 80=4% |
| 85 | — | — | — |
| 86 | Kr (Isotop) | — | — |
| 87 | — | — | — |
| 88 | — | — | — |
| 89 | — | — | — |
| 90 | — | — | — |
| 91 | Toluene / DP Oil frag | Toluol; auch DC705 Fragment (91=32% bei DC705) | 91=100%, 92=69%, 65=16%, 51=10%, 63=9% |
| 92 | Toluene Isotop | — | — |
| 93 | — | — | — |
| 94 | — | — | — |
| 95 | Trichloroethylene | Trichloroethylene | 95=100%, 60=65%, 97=64%, 35=40%, 47=26% |
| 96 | — | — | — |
| 97 | Trichloroethylene Isotop | Isotopenpeaks bei chlorierten Verbindungen | — |
| 98 | — | — | — |
| 99 | — | — | — |
| 100 | — | — | — |

---

# 2) Diagnose-Logik & Fehlererkennung

## 2.1 Vorverarbeitung (robust gegen Rauschen/Artefakte)
1. **Instrumentstatus prüfen**: Filament stabil? SEM-Sättigung? (falls möglich: Status/Emission Current loggen)
2. **Baseline**: pro Mass ein *floor* schätzen (z. B. 5%-Quantil über Zeit) und abziehen.
3. **Smoothing**: optional Savitzky–Golay oder median filter (ohne Peaks zu verbreitern).
4. **Peak-Features**: (a) Peak-Höhe, (b) Peak-Integral (falls aufgelöste Peaks), (c) zeitliche Ableitung d/dt.
5. **Normierung**: Für Diagnose häufig sinnvoll:
   - unbaked: normiere auf m/z 18 (H2O)
   - baked: normiere auf m/z 2 (H2)

## 2.2 Entscheidungsbaum (Signatur-basierte Klassifikation)
### A) Leck zur Atmosphäre (Real Leak)
- **Trigger**: gleichzeitige Peaks bei **28 (N2)**, **32 (O2)** und oft **40 (Ar)**.
- **Kennzahlen**:
  - `R_air = I(28)/I(32)` (Erwartung aus Luftzusammensetzung ~3.7; instrumentbedingt tolerieren z. B. 2.5–5.5)
  - `Ar_present = I(40) > k * noise` und Verhältnis zu 28 (Air-Pattern: 40 ~1% von 28 als grober Anhalt)
- **Entscheidung**:
  - Wenn `R_air` im Fenster **und** 40 vorhanden → **sehr wahrscheinlich Real Leak**.
  - Wenn 28/32 inkonsistent (z. B. viel 28 aber wenig 32) → eher **CO bei 28**, oder O2 wird gepumpt/reaktiv gebunden.

### B) Virtuelles Leck (eingeschlossene Volumina / Permeation)
- **Trigger**: Druck/Partialdrücke steigen **langsam** über Zeit trotz Pumpenbetrieb.
- **Typisches Muster**:
  - oft **H2O (18)** + **CO/CO2 (28/44)** steigen; O2 (32) kann fehlen.
  - Zeitkonstante (Minuten–Stunden–Tage) statt sprunghafter Änderung.
- **Entscheidung**:
  - Fit `I(m,t) ~ A*(1-exp(-t/τ))` oder monotone Zunahme: τ groß → virtuelles Leck.
  - Gegencheck: Helium-Sniff/Leak-Check negativ, aber RGA zeigt Anstieg → virtuelles Leck wahrscheinlicher.

### C) Ausgasung / unzureichendes Bakeout
- **Unbaked typisch**: **Wasser dominant** (18 mit 17/16 Begleitpeaks).
- **Baked typisch**: **H2 dominant**; Wasser/CO/CO2 sollten deutlich tiefer liegen.
- **Feature**: Verhältnis `I(18)/I(2)` (baked sollte klein sein), plus Zeittrend (Bakeout → 18 fällt typischerweise).

### D) Kohlenwasserstoff-Kontamination (HC)
- **Trigger**: Peaks/"Kamm" in Bereichen **m/z 27–29**, **41–43**, **55–57** und generell **>45**.
- **HC-Heuristiken**:
  - `HC_index = sum_{m=45..100} I(m) / sum_{m=1..44} I(m)`
  - `alkane_signature = I(57) und I(43) und I(55) und I(71)` vorhanden.
- **Entscheidung**:
  - Wenn `alkane_signature` stark → **Öl/Schmiermittel** statt "leichte" HC.
  - Wenn aromatische Peaks (78, 91, 92) → **Aromaten/Lösungsmittel** oder **Diffusionspumpenöl**.

### E) Rückströmung von Vorpumpenöl / Pumpenöl
- **Trigger**: starker Peak bei **43** plus **57/55/71** (siehe MP Oil / Turbopump Oil Patterns).
- **Differenzierung**:
  - **mechanische Pumpe (MP oil)**: 41 sehr hoch (≈91% von 43), 57≈73%, 55≈64%, 71≈20%.
  - **Turbopump Oil**: 71 deutlich höher (≈52% von 43) und 57≈88%.
- **Entscheidung**: score-basierter Match der Pattern (cosine similarity) gegen Öl-Bibliothek.

### F) "Ghost Peaks" / Artefakte (ESD – Electron Stimulated Desorption)
- **Symptome**:
  - Peaks erscheinen/verschwinden synchron mit Filament-ON/OFF oder nach Degas.
  - typische spurious m/z (häufig berichtet): **12, 16, 19, 35**.
- **Gegenmaßnahmen im Algorithmus**:
  - Markiere Peaks als *artefaktverdächtig*, wenn sie stark vom Filament-State abhängen.
  - Nutze alternative Massen zur Quantifizierung (z. B. O2 über 32 statt 16).
  - Implementiere "ESD-mask": ignoriere/abwerte {12,16,19,35} wenn ESD-Indikator aktiv.

## 2.3 Überlagerungen trennen (Quantifizierung)
### Prinzip
Viele m/z sind Summenbeiträge mehrerer Spezies. Lösung als lineares Mischmodell mit Nichtnegativitäts-Constraint.

**Empfehlung**: Arbeite mit einer ausgewählten Massliste `M_sel` ("diagnostische Massen"), die möglichst orthogonal sind:
- H2: 2
- H2O: 18 (plus 17/16 als Plausibilität)
- O2: 32
- Ar: 40 (Isotope 36/38 optional)
- CO2: 44 (plus 45 als Isotopcheck)
- N2/CO: 28 + Fragmente 14/12/16 zur Trennung
- Öl/HC: 43/57/55/71 (+ 78/91 für Aromaten/DC705)

### NNLS-Skizze (Typescript)
```ts
// given: y: vector of measured intensities at selected masses
// given: A: matrix [|M_sel| x |species|] built from patterns (scaled to 1.0)
// solve: minimize ||A*k - y||_2 subject to k>=0
// Use: NNLS (Lawson-Hanson) or quadratic programming.

// After solve, compute residual r = y - A*k;
// if residual has structure (e.g. big at 32) -> missing species or calibration drift.
```

---

# 3) Grenzwerte & Akzeptanzkriterien (Benchmark)

## 3.1 CERN – VSC Criteria for Vacuum Acceptance Tests (ACC-V-ES-0001)
### Unbaked (nach 24 h TMP-Pumpdown)
- Normierung auf **m/z 18 (H2O)**.
- **Alle Peaks 18–44 amu** müssen **100× kleiner** als Peak 18 sein, **außer 28 und 44**.
- **Alle Peaks >44 amu** müssen **1000× kleiner** als Peak 18 sein.

### Baked (24 h nach Bakeout >120 °C für ≥20 h)
Normierung auf **m/z 2 (H2)**. Akzeptanzschwellen (Maximalverhältnis zu m/z 2):

| Mass(en) [amu] | Max. Ratio zu m/z 2 |
|---|---:|
| 3–20 | 10 |
| 28 | 10 |
| 21–32 (außer 28) | 100 |
| 44 | 20 |
| 33–45 | 500 |
| >45 | 10,000 |

Zusatz aus derselben Spezifikation:
- Helium-Leckrate Akzeptanz: **1×10⁻¹⁰ mbar·l·s⁻¹**.
- Outgassing-Rate: für LHC wurde ein Limit von **1×10⁻⁷ mbar·l·s⁻¹** für das dominante Gas **H2** nach Bakeout festgelegt.

## 3.2 CERN – Vacuum Acceptance Tests (Beispiel: CERN-ACC-2014-0270)
Template-Logik (baked, normiert auf **m/z 2**):
- **m/z 16, 18, 28**: jeweils mindestens **10× kleiner** als m/z 2.
- **m/z 44**: mindestens **20× kleiner** als m/z 2.
- **m/z >50**: mindestens **1000× kleiner** als m/z 2.

## 3.3 DESY – UHV Guidelines (Hydrocarbon-freies Kriterium)
- Für **p < 1×10⁻⁷ mbar**: Summe der Partialdrücke **Massen 45–100** muss **< 1×10⁻³ des Totaldrucks** sein (Hydrocarbon-free).
- Leckraten-Anforderung (Metal Seals): typisch **≤ 1×10⁻¹⁰ mbar·l·s⁻¹**.

## 3.4 GSI – Vacuum Testing Guidelines (Beispiele aus Kryotechnik-Guidelines)
Diese GSI-Tests sind nicht „klassische UHV-Bakeout“-Reports, enthalten aber **harte Akzeptanzkriterien** für Leckraten und RGA-basierte Hydrocarbon-Anteile:

### B-MT He Leak Testing of Cryogenic Tubing (Technical Guideline 7.23e)
- Single He leak: **≤ 1×10⁻¹⁰ mbar·L/s**
- Integral He leak rate (vacuum vessel): **≤ 2×10⁻¹⁰ mbar·L/s**
- Residual gas test (nach 24 h Pumpen): Hydrocarbon percentage **< 2%** für alle residual components mit **Massenzahl ≥ 36**

### B-MT Vacuum Testing of Cryostat Vacuum Vessels (Technical Guideline 7.19e)
- Single He leak: **≤ 1×10⁻⁹ mbar·L/s**
- Integral He leak rate: **≤ 5×10⁻⁸ mbar·L/s**
- Outgassing rate: **q_out ≤ 5×10⁻⁹ mbar·L/(s·cm²)** nach **≤ 24 h**
- Residual gas test (nach 24 h Pumpen): Hydrocarbon percentage **< 5%** für alle residual components mit **Massenzahl ≥ 36**


## 3.5 Praktische Umrechnung in Partialdrücke
Viele Akzeptanzkriterien sind **Verhältnisse** zu einem Referenzpeak (18 oder 2).
Damit kann die Software absolute Partialdruck-Grenzen ableiten, wenn der Referenz-Partialdruck bekannt ist:

```txt
P_limit(m) = ratio_limit(m) * P_reference
reference = P(18) (unbaked) oder P(2) (baked)
```

Beispiel (baked, CERN Table 1): Wenn P(H2)=P(2)=1e-10 mbar, dann ist z. B. P(44) ≤ 20 * 1e-10 = 2e-9 mbar.

---

# Referenzen (URLs)
- MKS / Spectra: RGA Application Bulletin #208 (Cracking Patterns): https://www.mks.com/docs/R/SpectraBulletin208.pdf
- Pfeiffer: Mass Spectrometer / QMS Grundlagen (Fragmentierung, Mehrfachionisation): https://www.fe.infn.it/u/barion/docs/QMA/Pfeiffer-MassSpectrometer.pdf
- INFICON Technical Note (Using NIST Library): https://www.inficon.com/media/4805/download/Technical-Note---Using-NIST-Library.pdf
- CERN VSC Criteria for Vacuum Acceptance Tests (ACC-V-ES-0001): https://indico.cern.ch/event/765714/contributions/3178599/attachments/1736680/2848639/VSC_Criteria_for_Vacuum_Acceptance_Tests.pdf
- CERN-ACC-2014-0270 (Vacuum acceptance tests): https://cds.cern.ch/record/1759906/files/CERN-ACC-2014-0270.pdf
- DESY UHV Guidelines: https://www.desy.de/sites/site_vacuum/content/e44582/e49068/DESY-UHV-Guidelines_ger.pdf
- SRS Application Note (ESD/spurious peaks): https://www.thinksrs.com/downloads/pdfs/applicationnotes/cis.pdf
- CERN CAS RGA tutorial (ESD mention): https://indico.cern.ch/event/565314/contributions/2285748/attachments/1467497/2273711/RGA_tutorial-theory.pdf
- Agilent 5977B TSM Manual (Air/Water background ions): https://www.agilent.com/cs/library/usermanuals/public/user-manual-gc-msd-system-5977B-series-G7077-90035-en-agilent.pdf
- Lesker simple interpretation (Air ratio 28/32): https://www.lesker.com/newweb/technical_info/vacuumtech/rga_03_simpleinterpret.cfm
- PDMS characteristic fragments (73,147,...): https://pubmed.ncbi.nlm.nih.gov/9105171/
- GSI Technical Guideline 7.23e (He Leak Testing of Cryogenic Tubing): https://indico.gsi.de/event/1420/attachments/2979/3738/F-TG-K-7.23e_He_Leak_Testing_of_Cryogenic_Tubing_20110404.pdf
- GSI Technical Guideline 7.19e (Vacuum Testing of Cryostat Vacuum Vessels): https://indico.gsi.de/event/1420/attachments/2979/3736/F-TG-K-7.19e_Vacuum_Testing_of_Cryostat_Vacuum_Vessels_20110404.pdf
