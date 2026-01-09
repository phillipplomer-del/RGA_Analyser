# Berechnungen und Formeln - Wissenschaftliche Validierung

Erstellt: 2026-01-09
Letzte Aktualisierung: 2026-01-09

Dieses Dokument enthält die wissenschaftliche Validierung aller im RGA Analyser verwendeten
Berechnungsformeln, Konstanten und Relative Sensitivity Factors (RSF).

---

## Inhaltsverzeichnis

1. [RSF-Werte (Relative Sensitivity Factors)](#rsf-werte-relative-sensitivity-factors)
2. [Druckumrechnung](#druckumrechnung)
3. [Einheiten-Konvertierung](#einheiten-konvertierung)
4. [Leak Rate Formeln](#leak-rate-formeln)
5. [Quellenverzeichnis](#quellenverzeichnis)

---

## RSF-Werte (Relative Sensitivity Factors)

### Grundlagen

Relative Sensitivity Factors (RSF) beschreiben das Verhaltnis der Ionisationseffizienz
verschiedener Gase im Vergleich zu Stickstoff (N2 = 1.0) bei Elektronenstoionisation
(typisch 70 eV). Die Werte werden fur die Umrechnung von Ionenstrom zu Partialdruck
in Quadrupol-Massenspektrometern (RGA) benotigt.

**Physikalischer Hintergrund:**
Die Ionisationswahrscheinlichkeit hangt vom Ionisationsquerschnitt des Molekuls ab,
der wiederum von der Molekulgrosse, Elektronenzahl und Bindungsstruktur abhangt.
Kleinere Atome wie Helium haben kleinere Querschnitte und damit niedrigere RSF-Werte.

### Implementierte Werte

Quelle im Code: `src/lib/calibration/constants.ts:177-207`

| Gas | RSF (impl.) | RSF (Lit.) | Quelle | Typ | Jahr | Status |
|-----|-------------|------------|--------|-----|------|--------|
| He | 0.14 | 0.14-0.18 | [1][2][3] | Manufacturer/Standard | 1969-2023 | Validiert |
| Ne | 0.23 | 0.23-0.30 | [1][2] | Manufacturer/Standard | 1969-2023 | Validiert |
| H2 | 0.44 | 0.44-0.46 | [1][2][3] | Manufacturer/Standard | 1969-2023 | Validiert |
| O2 | 0.86 | 0.86-1.01 | [1][2][4] | Manufacturer/Standard | 1969-2023 | Validiert |
| H2O | 0.90 | 0.90-1.12 | [1][2] | Manufacturer/Standard | 1969-2023 | Validiert |
| N2 | 1.00 | 1.00 | [1][2][3][4] | Reference | - | Referenz |
| CO | 1.05 | 1.05 | [1][2][3] | Manufacturer/Standard | 1969-2023 | Validiert |
| Ar | 1.20 | 1.20-1.40 | [1][2][3][4] | Manufacturer/Standard | 1969-2023 | Validiert |
| NH3 | 1.30 | 1.20-1.40 | [1][5] | Manufacturer | 1975-2023 | Validiert |
| CO2 | 1.40 | 1.40-1.42 | [1][2][3] | Manufacturer/Standard | 1969-2023 | Validiert |
| CH4 | 1.60 | 1.40-1.60 | [1][5] | Manufacturer/Literature | 1975-2023 | Validiert |
| Kr | 1.70 | 1.70-1.90 | [1][5] | Literature | 1975 | Validiert |
| C2H2 | 1.80 | 1.70-1.90 | [5] | Literature | 1975 | Validiert |
| C2H4 | 1.90 | 1.80-2.00 | [5] | Literature | 1975 | Validiert |
| C2H6 | 2.10 | 2.00-2.20 | [5] | Literature | 1975 | Validiert |
| C3H8 | 2.40 | 2.30-2.50 | [5] | Literature | 1975 | Validiert |
| Xe | 3.00 | 2.80-3.20 | [1][5] | Literature | 1975 | Validiert |
| Acetone | 3.60 | 3.40-3.80 | [5] | Literature | 1975 | Bereich |
| Oil | 4.00 | 3.50-5.00 | [6] | Manufacturer estimate | - | Geschatzt |
| PDMS | 4.00 | 3.50-5.00 | [6] | Manufacturer estimate | - | Geschatzt |
| Benzene | 5.90 | 5.50-6.20 | [5] | Literature | 1975 | Validiert |
| Toluene | 6.20 | 5.80-6.50 | [5] | Literature | 1975 | Validiert |

**Legende Status:**
- **Validiert**: Wert stimmt mit Literatur uberein
- **Bereich**: Wert liegt im publizierten Bereich
- **Geschatzt**: Kein direkter Literaturwert, Schatzung basierend auf ahnlichen Verbindungen

### Anmerkungen zu den RSF-Werten

1. **Variabilitat**: RSF-Werte variieren je nach RGA-Modell, Ionenquellen-Design,
   Elektronenenergie und Betriebsbedingungen um +/- 10-20%.

2. **Empfehlung SRS**: "Careful quantitative analysis requires that the sensitivity
   factor, Sg, be determined for every gas which may be a component gas in the
   system being analyzed." [4]

3. **Praktische Naherung**: "Since most gases are within a factor of 2 sensitivity
   of nitrogen, it is customary to use nitrogen calibration for all mass numbers
   and report partial and total pressures this way for an approximate partial
   pressure." [6]

4. **Kohlenwasserstoffe**: Die Ionisationsquerschnitte von Kohlenwasserstoffen
   zeigen einen nahezu linearen Anstieg mit der Elektronenzahl pro Molekul [5].

---

## Druckumrechnung

### Formel: P = I / (S x RSF)

**Implementierung:** Partialdruck wird aus Ionenstrom berechnet

Wobei:
- **P** = Partialdruck des Gases [mbar oder Torr]
- **I** = Gemessener Ionenstrom [A]
- **S** = Empfindlichkeit des RGA fur N2 [A/mbar]
- **RSF** = Relativer Sensitivitatsfaktor (bezogen auf N2 = 1.0)

### Wissenschaftliche Grundlage

**Quelle:** ISO/TS 20175:2018 - "Vacuum technology - Vacuum gauges - Characterization
of quadrupole mass spectrometers for partial pressure measurement" [7]

**Physik:**
- Der Ionenstrom ist direkt proportional zum Partialdruck des Gases
- Die Proportionalitatskonstante (Empfindlichkeit) hangt vom Gas ab
- Der RSF normiert die Empfindlichkeit auf den Referenzwert fur N2

**Kalibrierung:**
Wahrend der Kalibrierung wird die Empfindlichkeit S bestimmt:
```
S = I / P  (bei bekanntem Druck P und gemessenem Strom I fur N2)
```

**Validierung:**
- "When measuring the partial pressure of a gas, sensitivity is used to characterize
  the relationship between the ion current and the partial pressure." [7]
- "During calibration, pure gas is used to generate a standard partial pressure in
  a container, and then the ion current corresponding to the characteristic peak
  of the gas is recorded." [7]

**Status:** Validiert - Standardformel in der RGA-Messtechnik

---

## Einheiten-Konvertierung

### Konversionsfaktor: 1.33322 (Torr zu mbar)

**Implementierte Konstante:** 1 Torr = 1.33322 mbar

### Herleitung

**Definition Torr:**
```
1 Torr = 1/760 atm = 101325/760 Pa = 133.322368... Pa
```

**Definition mbar:**
```
1 mbar = 100 Pa = 1 hPa
```

**Umrechnung:**
```
1 Torr = 133.322368 Pa / 100 Pa/mbar = 1.33322368 mbar
```

### Quellen

| Wert | Quelle | Typ | URL |
|------|--------|-----|-----|
| 1.33322368421 | NIST SP 811 | Government Standard | [8] |
| 133.322 Pa | ISO 80000-4:2019 | ISO Standard | [9] |
| 1.3332 | SRS Technical Note | Manufacturer | [4] |

**Validierung:**
- Der implementierte Wert 1.33322 entspricht dem NIST-Referenzwert
- Genauigkeit: 6 signifikante Stellen (besser als 0.001% Fehler)

**Status:** Validiert

### Weitere Druckeinheiten-Konversionen

| Von | Nach | Faktor | Quelle |
|-----|------|--------|--------|
| 1 atm | Pa | 101325 (exakt) | NIST/ISO |
| 1 atm | Torr | 760 (exakt) | Definition |
| 1 bar | Pa | 100000 (exakt) | Definition |
| 1 mbar | Pa | 100 (exakt) | Definition |
| 1 Torr | Pa | 133.322... | NIST SP 811 |

---

## Leak Rate Formeln

### Rate-of-Rise Formel: Q = V x (dP/dt)

**Implementierung:** Leckratenberechnung aus Druckanstieg

Wobei:
- **Q** = Leckrate [mbar·L/s oder Torr·L/s]
- **V** = Kammervolumen [L]
- **dP/dt** = Druckanstiegsrate [mbar/s oder Torr/s]

Alternative Form:
```
Q = (P2 - P1) x V / t
```

### Quellen

| Quelle | Typ | URL |
|--------|-----|-----|
| Kurt J. Lesker Technical Notes | Manufacturer | [10] |
| Leybold Vacuum Fundamentals | Manufacturer | [11] |
| Pfeiffer Leak Detection Guide | Manufacturer | [12] |

**Validierung:**
- "A leak rate of qL = 1 mbar·l/s is present when in an enclosed, evacuated vessel
  with a volume of 1 L the pressure rises by 1 mbar per second." [11]

**Status:** Validiert - Standardformel in der Vakuumtechnik

### Interpretation der Rate-of-Rise Werte

| ROR [Torr·L/s] | Interpretation |
|----------------|----------------|
| < 1 x 10^-5 | Excellent, leckfrei und sauber |
| 1-3 x 10^-5 | Dicht und sauber |
| 4-6 x 10^-5 | Moglich verschmutzt |
| 7-9 x 10^-5 | Moglich undicht oder verschmutzt |
| > 1 x 10^-4 | Moglich undicht UND verschmutzt |

Quelle: [10]

---

### Helium-Aquivalenz: sqrt(M_air/M_He) = 2.7

**Implementierung:** Umrechnung He-Leckrate zu Luft-Leckrate

**Formel:**
```
Q_air / Q_He = sqrt(M_He / M_air) = sqrt(4 / 28.7) = 0.374
```

Bzw. umgekehrt:
```
Q_He / Q_air = sqrt(M_air / M_He) = sqrt(28.7 / 4) = 2.68 ~ 2.7
```

### Physikalische Grundlage

Bei molekularer Stromung (Knudsen-Bereich) ist die Leckrate eines Gases umgekehrt
proportional zur Quadratwurzel seiner Molmasse:

```
Q ~ 1 / sqrt(M)
```

**Gultigkeitsbereich:**
- Nur fur molekulare Stromung (Knudsen-Zahl Kn > 1)
- Bei laminarer Stromung (grossere Lecks) gilt ein anderer Zusammenhang
  uber die Viskositat

### Quellen

| Quelle | Typ | URL |
|--------|-----|-----|
| Leakdetection-technology.com | Technical Reference | [13] |
| NASA NTRS Paper 20170007409 | Government/Research | [14] |
| MIL-STD-883 | Military Standard | [15] |

**Zitat:**
"The air leak rate for molecular flow is a factor of 2.7 smaller than the helium
leak rate. This conversion factor is derived from the molecular weight ratio of
the gases." [13]

**Validierung:**
- sqrt(28.7/4) = sqrt(7.175) = 2.679 ~ 2.7
- Der Wert 28.7 g/mol fur Luft entspricht MIL-STD-883

**Einschrankung:**
"Currently, there is no universal conversion factor, based upon theory, for the
helium-to-air leak rate conversion of permeation dominant systems." [14]

**Status:** Validiert (fur molekulare Stromung)

---

## Quellenverzeichnis

### Primare Quellen

[1] **NASA TN-D-5285** (1969)
    R. L. Summers, "Empirical Observations on the Sensitivity of Hot Cathode
    Ionization Type Vacuum Gauges"
    - Typ: Government Standard/Research
    - Status: Industry-Standard fur BAG-Korrekturfaktoren
    - URL: https://ntrs.nasa.gov/

[2] **Duniway Ion Gauge Gas Correction Factors**
    - Typ: Manufacturer Technical Document
    - URL: https://www.duniway.com/sites/default/files/images/_pg/ion-gauge-gas-correction-factors.pdf

[3] **MKS Instruments Gas Correction Factors**
    - Typ: Manufacturer Technical Document
    - URL: https://www.mks.com/n/gas-correction-factors-for-ionization-vacuum-gauges

[4] **Stanford Research Systems (SRS) RGA Manual**
    - Typ: Manufacturer Manual
    - URL: https://www.thinksrs.com/downloads/pdfs/manuals/RGAm.pdf
    - Zusatzlich: https://www.thinksrs.com/downloads/pdfs/applicationnotes/IG1BAgasapp.pdf

[5] **F. Nakao, Vacuum 25 (1975) 431-435**
    "Determination of the ionization gauge sensitivity using the relative
    ionization cross section"
    - Typ: Peer-reviewed Journal (Vacuum)
    - Status: 44 Gase inkl. Kohlenwasserstoffe bis C10
    - URL: https://www.sciencedirect.com/science/article/abs/pii/0042207X75904911

[6] **Extorr RGA Documentation**
    - Typ: Manufacturer Manual
    - URL: https://www.extorr.com/downloads/Extorr_RGA_UserManual230512.pdf

### Standards

[7] **ISO/TS 20175:2018**
    "Vacuum technology - Vacuum gauges - Characterization of quadrupole mass
    spectrometers for partial pressure measurement"
    - Typ: ISO Technical Specification
    - URL: https://www.iso.org/standard/67207.html

[8] **NIST SP 811**
    "Guide for the Use of the International System of Units (SI)"
    - Appendix B: Conversion Factors
    - Typ: Government Standard
    - URL: https://www.nist.gov/pml/special-publication-811

[9] **ISO 80000-4:2019**
    "Quantities and units - Part 4: Mechanics"
    - Typ: ISO Standard
    - URL: https://www.iso.org/standard/64976.html

[10] **Kurt J. Lesker Company Technical Notes**
     "Rate of Rise Test"
     - Typ: Manufacturer Technical Document
     - URL: https://www.lesker.com/newweb/faqs/question.cfm?id=491

[11] **Leybold Vacuum Fundamentals**
     "Definition and measurement of vacuum leaks"
     - Typ: Manufacturer Technical Document
     - URL: https://www.leybold.com/en/knowledge/vacuum-fundamentals/leak-detection/

[12] **Pfeiffer Vacuum**
     "Leak Detection Know-How"
     - Typ: Manufacturer Technical Document
     - URL: https://leak-detection.pfeiffer-vacuum.com/

### Helium-Leckraten-Konversion

[13] **Leakdetection-technology.com**
     "Conversion of helium leak rate to air leak rate"
     - Typ: Technical Reference
     - URL: http://www.leakdetection-technology.com/science/the-flow-of-gases-in-leaks/conversion-of-helium-leak-rate-to-air-leak-rate.html

[14] **NASA Technical Report 20170007409**
     "Validation of Test Methods for Air Leak Rate Verification"
     - Typ: Government Research
     - URL: https://ntrs.nasa.gov/api/citations/20170007409/downloads/20170007409.pdf

[15] **MIL-STD-883** (Method 1014)
     Test Methods and Procedures for Microelectronics - Seal
     - Typ: Military Standard

---

## Zusammenfassung der Validierung

| Kategorie | Status | Anmerkung |
|-----------|--------|-----------|
| RSF-Werte (Hauptgase) | Validiert | He, Ne, H2, N2, O2, Ar, CO, CO2 - alle Werte in Literatur bestatigt |
| RSF-Werte (Kohlenwasserstoffe) | Validiert | CH4 bis Toluene - Werte basieren auf Nakao 1975 |
| RSF-Werte (Sonstige) | Teilweise | Oil, PDMS - geschatzte Werte ohne direkte Referenz |
| Druckformel P = I/(S x RSF) | Validiert | Standardformel, ISO/TS 20175:2018 |
| Torr/mbar Konversion | Validiert | NIST SP 811, ISO 80000-4 |
| Leak Rate Q = V x dP/dt | Validiert | Standardformel Vakuumtechnik |
| He-Aquivalenz 2.7 | Validiert | Fur molekulare Stromung, NASA/MIL-STD |

### Empfehlungen

1. **Kalibrierung:** Fur hochprazise Messungen sollten die RSF-Werte am konkreten
   RGA-Gerat mit Kalibriergasen verifiziert werden.

2. **Oil/PDMS:** Die RSF-Werte fur komplexe Kohlenwasserstoffe (Oil, PDMS) sind
   Naherungen. Bei quantitativer Analyse dieser Verbindungen ist eine
   geratesspezifische Kalibrierung erforderlich.

3. **He-Konversion:** Der Faktor 2.7 gilt nur fur molekulare Stromung. Bei
   grosseren Lecks mit viskosen Stromungsanteilen weicht der tatsachliche
   Konversionsfaktor ab.
