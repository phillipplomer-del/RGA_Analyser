# RGA Analyser - Kriterien, Prüfungen und Massen

Diese Dokumentation enthält alle in der RGA Analyser App verwendeten Kriterien, Grenzwerte, Qualitätsprüfungen und diagnostischen Algorithmen.

---

## 1. Grenzwertprofile (Limit Profiles)

### 1.1 GSI Spezifikation 7.3e (2019)

**Normalisierung:** H₂ = 1 (100%)

| Massenbereich | Grenzwert | Notizen |
|---------------|-----------|---------|
| 0 - 12 amu | 1.0 (100%) | H₂ Region |
| 12 - 19.5 amu | 0.1 (10%) | Leichte Gase |
| 19.5 - 27.5 amu | 0.02 (2%) | Zwischen H₂O und N₂ |
| 27.5 - 28.5 amu | 0.1 (10%) | N₂/CO erlaubt |
| 28.5 - 43.5 amu | 0.02 (2%) | |
| 43.5 - 44.75 amu | 0.1 (10%) | CO₂ erlaubt |
| 44.75 - 100 amu | 0.001 (0.1%) | Schwere Massen (HC) |

---

### 1.2 CERN Spezifikation 3076004 (2024)

**Normalisierung:** H₂ = 1 (100%)

| Massenbereich | Grenzwert | Notizen |
|---------------|-----------|---------|
| 0 - 3 amu | 1.0 (100%) | H₂ erlaubt |
| 3 - 20.5 amu | 0.1 (10%) | H₂O Region |
| 20.5 - 27.5 amu | 0.01 (1%) | |
| 27.5 - 28.5 amu | 0.1 (10%) | N₂ Peak erlaubt |
| 28.5 - 31.5 amu | 0.01 (1%) | |
| 31.5 - 32.5 amu | 0.05 (5%) | O₂ |
| 32.5 - 39.5 amu | 0.01 (1%) | |
| 39.5 - 40.5 amu | 0.05 (5%) | Ar |
| 40.5 - 43.5 amu | 0.01 (1%) | |
| 43.5 - 44.5 amu | 0.02 (2%) | CO₂ |
| 44.5 - 100 amu | 0.001 (0.1%) | |

---

### 1.3 CERN Unbaked (H₂O-normalisiert)

**Normalisierung:** H₂O = 1 (100%)

| Massenbereich | Grenzwert | Notizen |
|---------------|-----------|---------|
| 0 - 3 amu | 0.5 (50%) | H₂ (oft niedriger als H₂O) |
| 3 - 17.5 amu | 0.01 (1%) | Vor H₂O |
| 17.5 - 18.5 amu | 1.0 (100%) | H₂O Referenzpeak |
| 18.5 - 27.5 amu | 0.01 (1%) | Zwischen H₂O und N₂ |
| 27.5 - 28.5 amu | 0.1 (10%) | N₂/CO |
| 28.5 - 43.5 amu | 0.01 (1%) | |
| 43.5 - 44.5 amu | 0.05 (5%) | CO₂ |
| 44.5 - 100 amu | 0.001 (0.1%) | Schwere Massen |

---

### 1.4 DESY HC-Free Kriterium

**Beschreibung:** Kohlenwasserstoff-freies Kriterium: Σ(m45-100) < 0.1%

| Massenbereich | Grenzwert | Notizen |
|---------------|-----------|---------|
| 0 - 3 amu | 1.0 (100%) | H₂ erlaubt |
| 3 - 20.5 amu | 0.2 (20%) | H₂O Region |
| 20.5 - 27.5 amu | 0.02 (2%) | |
| 27.5 - 28.5 amu | 0.1 (10%) | N₂/CO |
| 28.5 - 43.5 amu | 0.02 (2%) | |
| 43.5 - 44.5 amu | 0.05 (5%) | CO₂ |
| 44.5 - 100 amu | 0.001 (0.1%) | HC-frei: Summe < 0.1% |

---

### 1.5 GSI Cryogenic (Kryogene Strahlrohre)

**Beschreibung:** Strengere Grenzwerte für kryogene Anwendungen

| Massenbereich | Grenzwert | Notizen |
|---------------|-----------|---------|
| 0 - 3 amu | 1.0 (100%) | H₂ erlaubt |
| 3 - 17.5 amu | 0.05 (5%) | |
| 17.5 - 18.5 amu | 0.1 (10%) | H₂O max 10% |
| 18.5 - 27.5 amu | 0.01 (1%) | |
| 27.5 - 28.5 amu | 0.05 (5%) | N₂/CO reduziert |
| 28.5 - 43.5 amu | 0.005 (0.5%) | |
| 43.5 - 44.5 amu | 0.02 (2%) | CO₂ |
| 44.5 - 100 amu | 0.0005 (0.05%) | Strengere HC-Limits |

---

## 2. Qualitätsprüfungen (Quality Checks)

### 2.1 H₂/H₂O Verhältnis

- **Formel:** `H₂ > 5 × H₂O`
- **Schwellenwert:** 5
- **Beschreibung:** Wasserstoff muss mindestens 5× größer als Wasser sein
- **Bedeutung:** Indikator für erfolgreiches Ausheizen

### 2.2 N₂/O₂ Verhältnis (Luftleck-Erkennung)

- **Formel:** `N₂/CO > 4 × O₂`
- **Schwellenwert:** 4
- **Beschreibung:** N₂/CO muss mindestens 4× größer als O₂ sein
- **Bedeutung:** Bei Verhältnis ~3.7 liegt ein Luftleck vor

### 2.3 Fragment-Konsistenz

- **Formel:** `Peak(14) < Peak(16)`
- **Beschreibung:** N-Fragment sollte kleiner als O-Fragment sein
- **Bedeutung:** Konsistenzprüfung der Fragmentierung

### 2.4 Leichte Kohlenwasserstoffe

- **Formel:** `Σ(39,41,43,45) < 0.001 × Gesamt`
- **Schwellenwert:** 0.1% des Gesamtdrucks
- **Beschreibung:** Summe der Massen 39, 41, 43, 45 prüfen
- **Bedeutung:** Indikator für Öl-Kontamination

### 2.5 Schwere Kohlenwasserstoffe (Öl)

- **Formel:** `Σ(69,77) < 0.0005 × Gesamt`
- **Schwellenwert:** 0.05% des Gesamtdrucks
- **Beschreibung:** Summe der Massen 69, 77 prüfen
- **Bedeutung:** Indikator für schwere Öl-Kontamination

### 2.6 Bakeout-Erfolg

- **Formel:** `Peak(2) > Peak(18)`
- **Schwellenwert:** H₂/H₂O > 1
- **Beschreibung:** Nach erfolgreichem Bakeout sollte H₂ dominieren
- **Bedeutung:** Bestätigung des Ausheizprozesses

### 2.7 N₂ vs CO Unterscheidung

- **Formel:** `Peak(14)/Peak(28) ≈ 0.07`
- **Erwarteter Bereich:** 0.05 - 0.15
- **Beschreibung:** Prüft ob Peak 28 hauptsächlich N₂ ist (N-Fragment bei 14) oder CO (C-Fragment bei 12)
- **Bedeutung:** Wichtig für korrekte Gas-Identifikation

### 2.8 Ar Doppelionisation

- **Formel:** `Peak(20)/Peak(40) ≈ 0.1-0.15`
- **Erwarteter Bereich:** 0.08 - 0.20
- **Beschreibung:** Ar²⁺ bei m/z 20 sollte 10-15% von Ar⁺ bei m/z 40 sein
- **Bedeutung:** Bestätigung von Argon-Präsenz

### 2.9 HC-frei (DESY-Kriterium)

- **Formel:** `Σ(45,55,57,69,71,77,83,85,91) < 0.001 × Gesamt`
- **Schwellenwert:** 0.1% des Gesamtdrucks
- **Beschreibung:** Summe aller Kohlenwasserstoff-Massen (45-100) prüfen
- **Bedeutung:** Strenges HC-Freiheits-Kriterium

---

## 3. Diagnose-Kriterien

### 3.1 Standard-Schwellenwerte

| Parameter | Wert | Beschreibung |
|-----------|------|--------------|
| minPeakHeight | 0.001 (0.1%) | Minimale Peak-Höhe für Detektion |
| airLeakN2O2Range | 3.0 - 4.5 | N₂/O₂ Ratio-Bereich für Luftleck |
| minConfidence | 0.3 (30%) | Minimale Konfidenz für Berichterstattung |
| oilPatternMinPeaks | 3 | Minimale Anzahl Öl-Peaks für Pattern |

---

### 3.2 Luftleck-Erkennung (AIR_LEAK)

**Primärkriterium:**
- N₂/O₂ Verhältnis (m28/m32): 3.0 - 4.5 (Luft: 3.7)
- Konfidenz-Beitrag: +40%

**Sekundärkriterien:**
- Argon (m/z 40) > 0.1%: +30%
- Ar²⁺/Ar⁺ (m20/m40): 0.05 - 0.20: +10%
- N₂⁺/N⁺ (m28/m14): 6 - 20: +20%

**Betroffene Massen:** 14, 28, 32, 40

---

### 3.3 Öl-Rückströmung (OIL_BACKSTREAMING)

**Pattern:** Δ14 amu Muster

**Öl-Marker Massen:** 41, 43, 55, 57, 69, 71, 83, 85

**Kriterien:**
- Mindestens 3 von 8 Peaks detektiert
- C₄H₉⁺/C₃H₇⁺ (m57/m43): 0.5 - 1.2 (Öl typisch: 0.7-0.9)

**Unterscheidung Turbopumpen- vs Vorpumpenöl:**
- m71/m43 > 0.4 → Turbopumpenöl

---

### 3.4 Fomblin/PFPE-Kontamination (FOMBLIN_CONTAMINATION)

**Hauptmarker:**
- CF₃⁺ (m/z 69) als starker Peak (> 1%)

**Anti-Pattern (KEINE Alkyl-Peaks):**
- m41 < m69 × 0.3
- m43 < m69 × 0.5
- m57 < m69 × 0.5

**Weitere PFPE-Fragmente:**
- CF⁺ (m/z 31)
- CFO⁺ (m/z 47)

**Betroffene Massen:** 20, 31, 47, 50, 69

---

### 3.5 Lösemittel-Rückstände (SOLVENT_RESIDUE)

**Aceton (M=58):**
- Pattern: m43/m58 = 2 - 5 (erwartet: 3-4)
- Massen: 43, 58, 15

**Isopropanol (IPA, M=60):**
- Base Peak: m/z 45
- Massen: 45, 43, 27

**Ethanol:**
- Pattern: m31 (Base) + m46 (Parent)
- Massen: 31, 45, 46

**Methanol:**
- Pattern: m31 (Base) + m32 (Parent)
- Massen: 31, 32, 29

---

### 3.6 Chlorierte Lösemittel (CHLORINATED_SOLVENT)

**Primärkriterium:**
- Cl-Isotopenverhältnis ³⁵Cl/³⁷Cl (m35/m37): 2.5 - 4.0 (erwartet: 3.1)

**TCE-Marker:**
- Hauptpeak m/z 95

**Betroffene Massen:** 35, 37, 95, 97

**WARNUNG:** Chlorierte Lösemittel korrodieren Aluminium!

---

### 3.7 Wasser-Ausgasung (WATER_OUTGASSING)

**Kriterien:**
- H₂O (m/z 18) ist dominanter Peak (≥ 80% des Maximum)
- H₂O/OH (m18/m17): 3.5 - 5.0 (typisch: 4.3)
- H₂O > H₂

**Betroffene Massen:** 16, 17, 18

---

### 3.8 Wasserstoff-dominant (HYDROGEN_DOMINANT)

**Kriterien:**
- H₂ (m/z 2) ist dominanter Peak (≥ 80% des Maximum)
- H₂ >> H₂O (Faktor > 5)
- CO/CO₂ < H₂ × 0.2 / 0.1

**Betroffene Massen:** 2

**Bedeutung:** Guter Zustand für ausgeheizte UHV-Systeme

---

### 3.9 ESD-Artefakte (ESD_ARTIFACT)

**Kriterien:**
- Anomal hoher O⁺ (m16/m32 > 0.5, normal: ~0.15)
- F⁺ (m19) ohne CF₃⁺ (m69)
- Anomales Cl-Isotopenverhältnis

**Betroffene Massen:** 16, 19, 35

---

### 3.10 Silikon-Kontamination (SILICONE_CONTAMINATION)

**Hauptmarker:**
- Trimethylsilyl-Fragment (m/z 73) > 0.5%

**Weitere Fragmente:**
- m/z 59

**Betroffene Massen:** 45, 59, 73

---

### 3.11 Virtuelles Leck (VIRTUAL_LEAK)

**Kriterien:**
- Luft-ähnliche Zusammensetzung (N₂/O₂ im Bereich)
- Erhöhter H₂O-Anteil (H₂O/O₂ > 2)
- Ar fehlt oder sehr niedrig (< 1.5% von O₂)

**Unterscheidung von echtem Leck:**
- He-Lecktest sollte negativ sein

**Betroffene Massen:** 14, 28, 32, 40

---

### 3.12 N₂/CO Unterscheidung

**N₂-Nachweis:**
- m28/m14 ≈ 14 (reines N₂: 10-20)
- N⁺ Fragment bei m/z 14

**CO-Nachweis:**
- m28/m12 ≈ 20 (reines CO: 15-25)
- C⁺ Fragment bei m/z 12
- ¹³CO erhöht m29/m28 > 1.5%

**Betroffene Massen:** 12, 14, 28, 29

---

### 3.13 Sauberes UHV-System (CLEAN_UHV)

**Kriterien:**
- H₂ dominant (> H₂O und > N₂)
- Schwere Massen (>45) < 0.1% des Totaldrucks (DESY-Kriterium)
- CO₂ < 5% von H₂

---

## 4. Wichtige Massen (Diagnostischer Wert: CRITICAL)

| m/z | Haupt-Zuordnung | Diagnostische Bedeutung |
|-----|-----------------|-------------------------|
| 2 | H₂⁺ | Dominantes Restgas nach Bakeout |
| 4 | He⁺ | Lecktest-Tracergas |
| 12 | C⁺ | KRITISCH: Unterscheidet CO von N₂ |
| 14 | N⁺/CH₂⁺ | Hoher Peak = N₂ (Luftleck) |
| 17 | OH⁺ | Schlüsselindikator für H₂O |
| 18 | H₂O⁺ | Dominant in ungeheizten Systemen |
| 28 | N₂⁺/CO⁺ | GRÖSSTE AMBIGUITÄT |
| 32 | O₂⁺ | Luftleck-Indikator, N₂/O₂ ≈ 3.7 |
| 40 | Ar⁺ | BESTER LUFTLECK-BEWEIS |
| 43 | C₃H₇⁺/CH₃CO⁺ | ÖL/ACETON-MARKER |
| 44 | CO₂⁺ | Hauptindikator für CO₂ |
| 57 | C₄H₉⁺ | ÖL-MARKER (Butyl-Kation) |
| 69 | CF₃⁺/C₅H₉⁺ | Fomblin vs KW-Öl |

---

## 5. Bekannte Massen und Gas-Identifikation

Die App verwendet folgende Massen zur automatischen Gas-Identifikation:

| m/z | Gas | Fragmente von |
|-----|-----|---------------|
| 1 | H⁺ | H₂ |
| 2 | H₂ | - |
| 4 | He | - |
| 12 | C⁺ | CO, CO₂, Kohlenwasserstoffe |
| 14 | N⁺ | N₂ |
| 16 | O⁺ | O₂, H₂O, CO₂ |
| 17 | OH⁺ | H₂O |
| 18 | H₂O | - |
| 19 | F⁺/H₃O⁺ | Fluorverbindungen, H₂O |
| 20 | Ar²⁺/Ne/HF | Ar, Ne, HF |
| 28 | N₂/CO | - |
| 29 | N₂-Isotop/CHO⁺ | N₂, Kohlenwasserstoffe |
| 31 | CF⁺ | Fluorverbindungen |
| 32 | O₂ | - |
| 35 | ³⁵Cl⁺ | Chlorverbindungen |
| 36 | HCl/³⁶Ar | HCl, Ar-Isotop |
| 40 | Ar | - |
| 44 | CO₂ | - |
| 45 | ¹³CO₂/CHO₂⁺ | CO₂-Isotop, Kohlenwasserstoffe |
| 50 | CF₂⁺ | Fluorverbindungen |
| 69 | CF₃⁺ | Fluorverbindungen, Kohlenwasserstoffe |
| 77 | C₆H₅⁺ | Aromaten, Kohlenwasserstoffe |

---

## 6. Relative Sensitivitäten (Referenz: N₂ = 1.0)

| Gas | Formel | Rel. Sensitivität |
|-----|--------|-------------------|
| Helium | He | 0.14 |
| Neon | Ne | 0.23 |
| Wasserstoff | H₂ | 0.44 |
| Sauerstoff | O₂ | 0.86 |
| Wasser | H₂O | 0.9 |
| Stickstoff | N₂ | 1.0 |
| Kohlenmonoxid | CO | 1.05 |
| Argon | Ar | 1.2 |
| Ammoniak | NH₃ | 1.3 |
| Kohlendioxid | CO₂ | 1.4 |
| Methan | CH₄ | 1.6 |
| Krypton | Kr | 1.7 |
| Acetylen | C₂H₂ | 1.8 |
| Ethen | C₂H₄ | 1.9 |
| Ethan | C₂H₆ | 2.1 |
| Propan | C₃H₈ | 2.4 |
| Xenon | Xe | 3.0 |
| Aceton | C₃H₆O | 3.6 |
| Mineralöl | CₓHᵧ | 4.0 |
| PDMS | Silikon | 4.0 |
| Benzol | C₆H₆ | 5.9 |
| Toluol | C₇H₈ | 6.2 |

---

## 7. Cracking Patterns (wichtigste Gase)

### 7.1 Wasserstoff (H₂)
```
m/z 2: 100 (Base Peak)
m/z 1: 5
```

### 7.2 Wasser (H₂O)
```
m/z 18: 100 (Base Peak)
m/z 17: 23
m/z 16: 1.5
m/z 1: 0.5
```

### 7.3 Stickstoff (N₂)
```
m/z 28: 100 (Base Peak)
m/z 14: 7.2
m/z 29: 0.7
```

### 7.4 Sauerstoff (O₂)
```
m/z 32: 100 (Base Peak)
m/z 16: 11
m/z 34: 0.4
```

### 7.5 Argon (Ar)
```
m/z 40: 100 (Base Peak)
m/z 20: 14.6 (Ar²⁺)
m/z 36: 0.34
```

### 7.6 Kohlenmonoxid (CO)
```
m/z 28: 100 (Base Peak)
m/z 12: 4.5
m/z 16: 1.7
m/z 14: 1.0
```

### 7.7 Kohlendioxid (CO₂)
```
m/z 44: 100 (Base Peak)
m/z 28: 10
m/z 16: 10
m/z 12: 8.7
m/z 22: 1.9
```

### 7.8 Mineralöl (Vorpumpe)
```
m/z 43: 100 (Base Peak)
m/z 41: 91
m/z 57: 73
m/z 55: 64
m/z 71: 20
m/z 39: 50
```

### 7.9 Fomblin/PFPE
```
m/z 69: 100 (Base Peak) - CF₃⁺
m/z 20: 28
m/z 16: 16
m/z 47: 15 - CFO⁺
m/z 50: 12 - CF₂⁺
m/z 31: 9 - CF⁺
```

### 7.10 Aceton (C₃H₆O)
```
m/z 43: 100 (Base Peak) - CH₃CO⁺
m/z 15: 42 - CH₃⁺
m/z 58: 27 (Parent Peak)
```

### 7.11 Isopropanol (IPA)
```
m/z 45: 100 (Base Peak)
m/z 43: 17
m/z 27: 16
```

---

## 8. Isotopenverhältnisse

| Isotopenpaar | Natürliches Verhältnis | Verwendung |
|--------------|------------------------|------------|
| ³⁵Cl/³⁷Cl | 3.1 : 1 | Chlor-Nachweis |
| ⁷⁹Br/⁸¹Br | 1 : 1 | Brom-Nachweis |
| ¹²C/¹³C | 99 : 1.1 | CO₂-Isotop |
| ¹⁴N/¹⁵N | 99.6 : 0.4 | N₂-Isotop |
| ¹⁶O/¹⁸O | 99.76 : 0.2 | O₂-Isotop |
| ²⁰Ne/²²Ne | 90.5 : 9.9 | Neon-Nachweis |

---

## 9. Luftzusammensetzung (Referenz)

| Gas | Anteil |
|-----|--------|
| N₂ | 78% |
| O₂ | 21% |
| Ar | 0.93% |
| CO₂ | 0.04% |

**Wichtige Verhältnisse:**
- N₂/O₂ ≈ 3.7 (bei Luft)
- N₂/Ar ≈ 84 (bei Luft)
- O₂/Ar ≈ 23 (bei Luft)

---

## 10. System-Zustandsklassifikation

| Zustand | Kriterien |
|---------|-----------|
| **baked** | H₂ > H₂O × 3 |
| **unbaked** | H₂O > H₂ |
| **air_leak** | Luftleck-Diagnose mit Konfidenz > 50% |
| **contaminated** | Öl-, Fomblin- oder Lösemittel-Diagnose mit Konfidenz > 50% |
| **unknown** | Keine eindeutige Klassifikation möglich |

---

## Quellen

Diese Kriterien basieren auf konsolidierten Daten aus:
- CERN Technical Specifications (3076004)
- GSI Spezifikation 7.3e (2019)
- DESY Vacuum Standards
- Pfeiffer Vacuum Know-How Book
- MKS Instruments Application Notes
- NIST Chemistry WebBook
- Hiden Analytical Application Notes
- SRS (Stanford Research Systems) Application Notes

---

*Dokumentation erstellt: Januar 2026*
*App-Version: RGA Analyser*
