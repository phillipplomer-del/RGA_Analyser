# RGA Wissensdatenbank - Übersicht

Diese Dokumentation beschreibt die Struktur und den Inhalt der RGA-Wissensdatenbank.

---

## Speicherorte

### 1. Programmatische Wissensdatenbank

**Pfad:** `src/lib/knowledge/`

| Datei | Beschreibung |
|-------|--------------|
| `gasLibrary.ts` | Gas-Bibliothek mit ~50 Spezies |
| `massReference.ts` | Massenreferenz m/z 1-100 |
| `index.ts` | Sensitivitätsfaktoren, Isotope, Diagnose-Funktionen |

### 2. Dokumentations-Wissen

**Pfad:** `RGA_Knowledge/`

| Datei | Beschreibung |
|-------|--------------|
| `RGA_CLAUDE.md` | KI-generiertes RGA-Wissen (Claude) |
| `RGA_GEMINI.md` | KI-generiertes RGA-Wissen (Gemini) |
| `RGA_Grok.md` | KI-generiertes RGA-Wissen (Grok) |
| `RGA_ChatGPT.md` | KI-generiertes RGA-Wissen (ChatGPT) |
| `APP_CRITERIA.md` | App-Anforderungen |
| `PRESSURE_CALIBRATION_SPEC_V2.md` | Druckkalibrierungs-Spezifikation |

---

## Gas-Bibliothek (gasLibrary.ts)

### Struktur eines Gas-Eintrags

```typescript
interface GasSpecies {
  key: string                              // z.B. 'H2O', 'N2', 'CO'
  name: string                             // Deutscher Name
  nameEn: string                           // Englischer Name
  formula: string                          // Unicode: 'H₂O'
  mainMass: number                         // Hauptpeak (Base Peak)
  crackingPattern: Record<number, number>  // m/z: relative Intensität (Base = 100)
  relativeSensitivity: number              // Relativ zu N₂ = 1.0
  category: GasCategory
  notes?: string[]                         // Zusätzliche Hinweise
}
```

### Gas-Kategorien

| Kategorie | Beschreibung | Beispiele |
|-----------|--------------|-----------|
| `permanent` | Permanentgase | H₂, N₂, O₂ |
| `noble` | Edelgase | He, Ne, Ar, Kr, Xe |
| `water` | Wasser | H₂O |
| `carbon_oxide` | Kohlenstoffoxide | CO, CO₂ |
| `hydrocarbon` | Kohlenwasserstoffe | CH₄, C₂H₆, C₃H₈ |
| `solvent` | Lösemittel | Aceton, Methanol, Ethanol, IPA |
| `oil` | Pumpenöle | Mineralöl, Fomblin, DC705 |
| `halogen` | Halogenverbindungen | HCl, HF, CF₄, SF₆ |
| `sulfur` | Schwefelverbindungen | H₂S, SO₂ |
| `nitrogen_compound` | Stickstoffverbindungen | NH₃, NO, N₂O |
| `silicone` | Silikon/PDMS | PDMS |

### Enthaltene Gase (~50 Spezies)

#### Permanentgase & Edelgase
- H₂ (Wasserstoff) - m/z 2
- He (Helium) - m/z 4
- Ne (Neon) - m/z 20
- N₂ (Stickstoff) - m/z 28
- O₂ (Sauerstoff) - m/z 32
- Ar (Argon) - m/z 40
- Kr (Krypton) - m/z 84
- Xe (Xenon) - m/z 132

#### Wasser & Kohlenstoffoxide
- H₂O (Wasser) - m/z 18
- CO (Kohlenmonoxid) - m/z 28
- CO₂ (Kohlendioxid) - m/z 44

#### Kohlenwasserstoffe
- CH₄ (Methan) - m/z 16
- C₂H₂ (Acetylen) - m/z 26
- C₂H₄ (Ethen) - m/z 28
- C₂H₆ (Ethan) - m/z 28
- C₃H₈ (Propan) - m/z 29
- C₃H₆ (Propen) - m/z 41
- Butan - m/z 43
- Isobutan - m/z 43

#### Lösemittel
- Aceton - m/z 43 (Parent: 58)
- MEK - m/z 43 (Parent: 72)
- Methanol - m/z 31
- Ethanol - m/z 31 (Parent: 46)
- IPA (Isopropanol) - m/z 45
- Benzol - m/z 78
- Toluol - m/z 91
- TCE (Trichlorethylen) - m/z 95
- DCM (Dichlormethan) - m/z 49
- 1,1,1-Trichlorethan - m/z 97
- Freon 12 - m/z 85

#### Pumpenöle
- Mineralöl (Vorpumpe) - m/z 43 (Δ14 Muster)
- Turbo-Pumpenöl - m/z 43 (höherer m/z 71 Peak)
- Fomblin/PFPE - m/z 69 (CF₃⁺)
- DC705 (Diffusionspumpenöl) - m/z 78

#### Halogenverbindungen
- HCl - m/z 36
- HF - m/z 20
- CF₄ - m/z 69
- SF₆ - m/z 127
- HBr - m/z 80
- Cl₂ - m/z 70
- BCl₃ - m/z 117
- B₂H₆ - m/z 26
- PH₃ - m/z 34
- AsH₃ - m/z 76
- NF₃ (Stickstofftrifluorid) - m/z 52 *(CVD-Kammerreinigung)*
- WF₆ (Wolframhexafluorid) - m/z 279 *(W-CVD/ALD)*
- C₂F₆ (Hexafluorethan) - m/z 69 *(Plasma-Ätzen)*
- GeH₄ (German) - m/z 74 *(SiGe-Abscheidung, pyrophor!)*

#### Schwefel- & Stickstoffverbindungen
- H₂S - m/z 34
- SO₂ - m/z 64
- NH₃ - m/z 17
- NO - m/z 30
- N₂O - m/z 44

#### Silikon
- PDMS - m/z 73
- SiH₄ - m/z 30

---

## Massenreferenz (massReference.ts)

### Struktur eines Massen-Eintrags

```typescript
interface MassAssignment {
  mass: number
  primaryAssignment: string           // Haupt-Zuordnung (de)
  primaryAssignmentEn: string         // Haupt-Zuordnung (en)
  possibleSources: string[]           // Mögliche Quellen/Gase
  fragmentOf: string[]                // Fragment von welchen Molekülen
  isotopes?: IsotopeInfo[]            // Isotopen-Information
  notes?: string                      // Zusätzliche Hinweise
  diagnosticValue: DiagnosticValue    // 'critical' | 'important' | 'minor' | 'rare'
}
```

### Kritische Massen (diagnosticValue: 'critical')

| m/z | Zuordnung | Bedeutung |
|-----|-----------|-----------|
| 2 | H₂⁺ | Dominantes Restgas nach Bakeout |
| 4 | He⁺ | Lecktest-Tracergas |
| 12 | C⁺ | Unterscheidet CO von N₂ |
| 14 | N⁺/CH₂⁺ | Hoher Peak = N₂ (Luftleck) |
| 15 | CH₃⁺ | Sauberer CH₄-Nachweis |
| 17 | OH⁺ | Schlüsselindikator für H₂O |
| 18 | H₂O⁺ | Dominant in ungeheizten Systemen |
| 28 | N₂⁺/CO⁺ | Größte Ambiguität! |
| 32 | O₂⁺/S⁺ | Luftleck-Indikator |
| 40 | Ar⁺ | Bester Luftleck-Beweis |
| 43 | C₃H₇⁺/CH₃CO⁺ | Öl/Aceton-Marker |
| 44 | CO₂⁺ | Hauptindikator für CO₂ |
| 55 | C₄H₇⁺ | Pumpenöl-Marker (Δ14 Serie) |
| 57 | C₄H₉⁺ | Öl-Marker (Butyl-Kation) |
| 69 | CF₃⁺/C₅H₉⁺ | Fomblin vs KW-Öl |
| 71 | C₅H₁₁⁺ | Turbopumpenöl-Marker |
| 73 | (CH₃)₃Si⁺ | Silikon/DC705-Marker |
| 52 | NF₂⁺ | NF₃ Base Peak (CVD-Reinigung) |
| 119 | C₂F₅⁺ | Unterscheidet C₂F₆ von CF₄ |
| 127 | SF₅⁺/I⁺ | SF₆ Base Peak |
| 149 | Phthalat | WEICHMACHER-MARKER (O-Ringe!) |

---

## Sensitivitätsfaktoren (index.ts)

Relative Sensitivitätsfaktoren (RSF) bezogen auf N₂ = 1.0:

| Gas | RSF | Gas | RSF |
|-----|-----|-----|-----|
| H₂ | 0.44 | CH₄ | 1.6 |
| He | 0.14 | C₂H₆ | 2.6 |
| Ne | 0.23 | C₃H₈ | 2.4 |
| N₂ | 1.0 | NH₃ | 1.3 |
| O₂ | 0.86 | H₂S | 2.2 |
| Ar | 1.2 | SO₂ | 2.1 |
| CO | 1.05 | Methanol | 1.8 |
| CO₂ | 1.4 | Ethanol | 3.6 |
| H₂O | 0.9 | Aceton | 3.6 |
| Kr | 1.7 | IPA | 2.5 |
| Xe | 3.0 | Benzol | 5.9 |
| SiH₄ | 1.0 | PH₃ | 2.6 |

---

## Isotopenverhältnisse

| Element | Verhältnis | Erwarteter Wert | Verwendung |
|---------|------------|-----------------|------------|
| Argon | ⁴⁰Ar/³⁶Ar | ~298 | Luftleck-Bestätigung |
| Chlor | ³⁵Cl/³⁷Cl | ~3.1 | Lösemittel-ID |
| Schwefel | ³²S/³⁴S | ~22.5 | Unterscheidung S vs O₂ |
| Silizium | ²⁸Si/²⁹Si | ~19.6 | Silikon-Kontamination |
| Krypton | ⁸⁴Kr/⁸⁶Kr | ~3.3 | Tracergas |

---

## Diagnostische Massengruppen

### Luftleck-Signatur
- **Massen:** 28, 32, 40 (N₂, O₂, Ar)
- **Erwartete Verhältnisse:** N₂/O₂ ≈ 3.7, N₂/Ar ≈ 84

### Öl-Rückströmung (Mineralöl)
- **Massen:** 41, 43, 55, 57, 69, 71, 83, 85
- **Muster:** Δ14 amu ("Lattenzaun")

### Fomblin/PFPE
- **Massen:** 69, 20, 31, 47, 50
- **Kennzeichen:** CF₃⁺ dominant, KEINE Alkyl-Peaks (41, 43, 57)

### Wasser-Signatur
- **Massen:** 18, 17, 16
- **Verhältnis:** 18/17 ≈ 4.3

### Lösemittel
| Lösemittel | Massen | Hinweis |
|------------|--------|---------|
| Aceton | 43, 58 | Base 43, Parent 58 |
| IPA | 45, 43, 27 | Base 45 |
| Ethanol | 31, 45, 46 | Base 31, Parent 46 |
| Methanol | 31, 32, 29 | Base 31, Parent 32 |

### N₂ vs CO Unterscheidung
- N₂ hat Fragment bei m/z 14 (~7%)
- CO hat Fragment bei m/z 12 (~5%)

### Silikon/PDMS
- **Massen:** 73, 147, 45, 59
- **Kennzeichen:** Trimethylsilyl-Fragmente

---

## Leckraten-Grenzwerte

| System | Integral (mbar·l/s) | Einzelleck |
|--------|---------------------|------------|
| UHV | 1×10⁻¹⁰ | 1×10⁻¹¹ |
| HV | 1×10⁻⁸ | 1×10⁻⁹ |
| CF-Flansch | - | 1×10⁻¹² |
| KF-Viton | - | 1×10⁻⁹ |
| VCR-Metall | - | 1×10⁻¹¹ |

---

## Hilfsfunktionen

### Verfügbare Funktionen in `src/lib/knowledge/index.ts`

| Funktion | Beschreibung |
|----------|--------------|
| `findGasesWithPeakAtMass(mass)` | Findet alle Gase mit Peak bei einer Masse |
| `getScaledPattern(gasKey, scale)` | Skaliertes Cracking Pattern |
| `identifyPeakSources(mass)` | Identifiziert mögliche Quellen für einen Peak |
| `checkOilPattern(peaks)` | Prüft auf Δ14 Öl-Muster |
| `distinguishN2vsCO(p28, p14, p12)` | Unterscheidet N₂ von CO |
| `checkAirLeakSignature(p28, p32, p40)` | Prüft Luftleck-Signatur |
| `classifySystemState(p2, p18, p28)` | Klassifiziert Systemzustand |
| `calculatePartialPressure(...)` | Berechnet korrigierten Partialdruck |
| `calculateLeakRate(pp, S)` | Berechnet Leckrate |
| `classifyLeakRate(rate)` | Klassifiziert Leckrate |

---

## Diagnose-Engine

### Pfad: `src/lib/diagnosis/`

| Datei | Beschreibung |
|-------|--------------|
| `types.ts` | TypeScript-Typen für Diagnosen |
| `detectors.ts` | Implementierung der 20 Diagnose-Algorithmen |
| `index.ts` | API-Funktionen und Export |

### Diagnose-Typen (DiagnosisType)

| Typ | Name (DE) | Name (EN) | Schweregrad | Icon |
|-----|-----------|-----------|-------------|------|
| `AIR_LEAK` | Luftleck | Air Leak | critical | 🌬️ |
| `VIRTUAL_LEAK` | Virtuelles Leck | Virtual Leak | warning | 🔄 |
| `WATER_OUTGASSING` | Wasser-Ausgasung | Water Outgassing | info | 💧 |
| `HYDROGEN_DOMINANT` | H₂-dominiertes System | H₂-Dominated System | info | ✅ |
| `OIL_BACKSTREAMING` | Öl-Rückströmung | Oil Backstreaming | critical | 🛢️ |
| `FOMBLIN_CONTAMINATION` | Fomblin/PFPE-Kontamination | Fomblin/PFPE Contamination | critical | ⚗️ |
| `SOLVENT_RESIDUE` | Lösemittel-Rückstand | Solvent Residue | warning | 🧪 |
| `SILICONE_CONTAMINATION` | Silikon-Kontamination | Silicone Contamination | warning | 🔬 |
| `ESD_ARTIFACT` | ESD-Artefakt | ESD Artifact | info | ⚡ |
| `CHLORINATED_SOLVENT` | Chloriertes Lösemittel | Chlorinated Solvent | critical | ☢️ |
| `CLEAN_UHV` | Sauberes UHV-System | Clean UHV System | info | ✨ |
| `NEEDS_BAKEOUT` | Ausheizen erforderlich | Needs Bakeout | warning | 🔥 |
| `N2_CO_MIXTURE` | N₂/CO-Mischung | N₂/CO Mixture | info | ⚠️ |
| `CO_DOMINANT` | CO-dominiert | CO-Dominated | info | 💨 |
| `AMMONIA_CONTAMINATION` | Ammoniak-Kontamination | Ammonia Contamination | warning | 🧪 |
| `METHANE_CONTAMINATION` | Methan-Kontamination | Methane Contamination | warning | 🔥 |
| `SULFUR_CONTAMINATION` | Schwefel-Kontamination | Sulfur Contamination | warning | ⚠️ |
| `AROMATIC_CONTAMINATION` | Aromaten-Kontamination | Aromatic Contamination | warning | ⬡ |
| `POLYMER_OUTGASSING` | Polymer-Ausgasung | Polymer Outgassing | info | 🔷 |
| `PLASTICIZER_CONTAMINATION` | Weichmacher-Kontamination | Plasticizer Contamination | warning | ⚠️ |
| `PROCESS_GAS_RESIDUE` | Prozessgas-Rückstand | Process Gas Residue | warning | ⚗️ |
| `COOLING_WATER_LEAK` | Kühlwasser-Leck | Cooling Water Leak | critical | 💧 |

### Schweregrade (DiagnosisSeverity)

| Schweregrad | Bedeutung | Farbcode |
|-------------|-----------|----------|
| `critical` | Sofortige Maßnahme erforderlich | Rot |
| `warning` | Aufmerksamkeit erforderlich | Orange/Gelb |
| `info` | Zur Kenntnis | Grün/Blau |

### Diagnose-Kriterien im Detail

#### 1. Luftleck (AIR_LEAK)
- **Primärkriterium:** N₂/O₂-Verhältnis 3.0 - 4.5 (Luft: 3.7)
- **Sekundärkriterien:**
  - Argon bei m/z 40 detektiert
  - Ar²⁺/Ar⁺ (m20/m40) = 0.1 - 0.15
  - N₂⁺/N⁺ (m28/m14) = 6 - 20

#### 2. Virtuelles Leck (VIRTUAL_LEAK)
- Luft-Pattern mit erhöhtem H₂O (H₂O/O₂ > 2)
- Argon fehlt oder sehr niedrig (< 1.5% von O₂)
- N₂/O₂ leicht erhöht (> 4.5)
- He-Lecktest negativ!

#### 3. Öl-Rückströmung (OIL_BACKSTREAMING)
- **Muster:** Δ14 amu Peaks bei 41, 43, 55, 57, 69, 71, 83, 85
- **Minimum:** 3 von 8 Peaks detektiert
- **Unterscheidung Vorpumpe/Turbo:** m71/m43 > 0.4 → Turbopumpenöl
- **Anti-Pattern:** m69 > m43 und kein m41 → wahrscheinlich Fomblin

#### 4. Fomblin/PFPE (FOMBLIN_CONTAMINATION)
- **Hauptmarker:** CF₃⁺ (m/z 69) stark
- **Anti-Pattern:** Keine Alkyl-Peaks (m41, m43, m57 < 30-50% von m69)
- **Weitere Marker:** CF⁺ (m31), CFO⁺ (m47)

#### 5. Lösemittel (SOLVENT_RESIDUE)
| Lösemittel | Base Peak | Verhältnis | Parent Peak |
|------------|-----------|------------|-------------|
| Aceton | m/z 43 | m43/m58 = 2-5 | m/z 58 |
| Isopropanol | m/z 45 | - | m/z 60 |
| Ethanol | m/z 31 | - | m/z 46 |
| Methanol | m/z 31 | m32/m31 > 0.5 | m/z 32 |

#### 6. Chlorierte Lösemittel (CHLORINATED_SOLVENT)
- **Cl-Isotopenverhältnis:** ³⁵Cl/³⁷Cl = 2.5 - 4.0 (ideal: 3.1)
- **TCE-Marker:** m/z 95

#### 7. Wasser-Ausgasung (WATER_OUTGASSING)
- H₂O (m18) ist dominanter Peak (> 80% des Maximums)
- H₂O/OH (m18/m17) = 3.5 - 5.0 (H₂O typisch: 4.3)
- H₂O > H₂

#### 8. Wasserstoff-dominant (HYDROGEN_DOMINANT)
- H₂ (m2) ist dominanter Peak (> 80% des Maximums)
- H₂ >> H₂O (Faktor > 5)
- CO/CO₂ deutlich niedriger als H₂

#### 9. Silikon (SILICONE_CONTAMINATION)
- **Hauptmarker:** (CH₃)₃Si⁺ (m/z 73)
- **Weitere Fragmente:** m/z 59

#### 10. ESD-Artefakte (ESD_ARTIFACT)
- Anomal hoher O⁺: m16/m32 > 0.5 (normal: ~0.15)
- F⁺ (m19) ohne CF₃⁺ (m69)
- Anomales Cl-Isotopenverhältnis

#### 11. N₂/CO-Unterscheidung (N2_CO_MIXTURE, CO_DOMINANT)
- **N₂:** m28/m14 ≈ 14
- **CO:** m28/m12 ≈ 20
- **CO-Anteil:** (m12/m28) / 0.05

#### 12. Sauberes UHV (CLEAN_UHV)
- H₂ dominiert
- Schwere Massen (>45) < 0.1% des Totaldrucks
- CO₂ < 5% von H₂

#### 13. Ammoniak (AMMONIA_CONTAMINATION)
- m17/m18 > 0.30 (H₂O normal: ~0.23)
- NH₂/NH₃ (m16/m17) = 0.6 - 1.0 (NH₃ typisch: ~0.80)
- NH⁺ (m15/m17) = 0.05 - 0.15

#### 14. Methan (METHANE_CONTAMINATION)
- **Sauberer Indikator:** CH₃⁺ (m/z 15)
- CH₃/CH₄ (m15/m16) = 0.7 - 1.0 (CH₄ typisch: ~0.85)
- CH₂⁺ (m14/m15) = 0.15 - 0.25

#### 15. Schwefelverbindungen (SULFUR_CONTAMINATION)
- **H₂S:** m/z 34, HS⁺ (m33/m34 ≈ 0.42)
- **SO₂:** m/z 64, SO⁺ (m48/m64 ≈ 0.49)

#### 16. Aromaten (AROMATIC_CONTAMINATION)
- **Benzol:** m/z 78, Phenyl (m77/m78 ≈ 0.22)
- **Toluol:** m/z 91 (Tropylium), m92/m91 ≈ 0.69

#### 17. Polymer-Ausgasung (POLYMER_OUTGASSING)
- H₂O dominant (m18 > m28 × 2)
- Keine Luftleck-Signatur (N₂/O₂ > 5 oder Ar fehlt)
- Normales H₂O-Verhältnis (m18/m17 = 3.5-5.0)
- **Typisch für:** PEEK, Kapton, Viton

#### 18. Weichmacher (PLASTICIZER_CONTAMINATION)
- **Hauptmarker:** Phthalat-Fragment m/z 149
- **Weitere Marker:** m57, m71, m43 (Alkyl-Fragmente)
- **Quelle:** O-Ringe, Kunststoffteile
- **Abhilfe:** O-Ringe in Hexan auskochen (über Nacht)

#### 19. Prozessgas-Rückstand (PROCESS_GAS_RESIDUE)
- **NF₃ Check:** m52 > 0.01 und m52/m71 > 1.5
- **SF₆ Check:** m127 > 0.01 und m127/m89 > 3
- **WF₆ Check:** m279 > 0.005
- **Bedeutung:** Kammer-Reinigungszyklus unvollständig

#### 20. Kühlwasser-Leck (COOLING_WATER_LEAK)
- Druck stabilisiert bei 15-30 mbar (H₂O-Sättigungsdampfdruck bei RT)
- H₂O-Fraktion > 90% des Totaldrucks
- **Kritisch:** Sofort System belüften!

### Diagnose-API Funktionen

| Funktion | Beschreibung |
|----------|--------------|
| `runFullDiagnosis(input, minConfidence)` | Führt alle 20 Diagnosen durch |
| `runQuickDiagnosis(input)` | Nur kritische Checks (Luftleck, Öl, Fomblin, Chlor) |
| `createDiagnosisInput(peaks, metadata)` | Erstellt Input aus Peak-Array |
| `getDiagnosisSummary(results)` | Zusammenfassung der Ergebnisse |
| `formatDiagnosisForAI(results, language)` | Formatiert für KI-Prompt |
| `checkSystemCriteria(input)` | Boolean-Checks für Systemzustand |

### Standard-Schwellenwerte

```typescript
const DEFAULT_THRESHOLDS = {
  minPeakHeight: 0.001,      // 0.1% Mindesthöhe
  airLeakN2O2Range: { min: 3.0, max: 4.5 },
  minConfidence: 0.3,        // 30% Minimum-Konfidenz
  oilPatternMinPeaks: 3      // Min. 3 Öl-Peaks
}
```

---

## Limit-Profile (Grenzwert-Kriterien)

### Pfad: `src/lib/limits/profiles.ts`

### Verfügbare Preset-Profile

| ID | Name | Beschreibung | Referenz-Peak |
|----|------|--------------|---------------|
| `gsi-7.3e` | GSI 7.3e (2019) | GSI Spezifikation für UHV-Komponenten | H₂ |
| `cern-3076004` | CERN 3076004 (2024) | CERN Technische Spezifikation | H₂ |
| `cern-baked-h2` | CERN Baked (H₂) | Strikte Limits für ausgeheizte Systeme | H₂ |
| `cern-unbaked` | CERN Unbaked | Limits für nicht-ausgeheizte Systeme | H₂O |
| `desy-hc-free` | DESY HC-Free | Kohlenwasserstoff-frei Kriterium | H₂ |
| `gsi-cryo` | GSI Cryogenic | Strikte Limits für kryogene Strahlrohre | H₂ |
| `ligo-uhv` | LIGO UHV | Extreme optische Sauberkeit für Gravitationswellen-Detektoren | H₂ |
| `semi-cvd` | Semiconductor CVD | CVD/ALD Kammer-Baseline (prozessbereit) | H₂ |

### GSI 7.3e (2019)

| Massenbereich | Grenzwert | Beschreibung |
|---------------|-----------|--------------|
| 0 - 12 | 100% | H₂-Region |
| 12 - 19.5 | 10% | Leichte Gase |
| 19.5 - 27.5 | 2% | Zwischen H₂O und N₂ |
| 27.5 - 28.5 | 10% | N₂/CO erlaubt |
| 28.5 - 43.5 | 2% | |
| 43.5 - 44.75 | 10% | CO₂ erlaubt |
| 44.75 - 100 | 0.1% | Schwere Massen |

### CERN 3076004 (2024)

| Massenbereich | Grenzwert | Beschreibung |
|---------------|-----------|--------------|
| 0 - 3 | 100% | H₂ erlaubt |
| 3 - 20.5 | 10% | H₂O-Region |
| 20.5 - 27.5 | 1% | |
| 27.5 - 28.5 | 10% | N₂ erlaubt |
| 28.5 - 31.5 | 1% | |
| 31.5 - 32.5 | 5% | O₂ |
| 32.5 - 39.5 | 1% | |
| 39.5 - 40.5 | 5% | Ar |
| 40.5 - 43.5 | 1% | |
| 43.5 - 44.5 | 2% | CO₂ |
| 44.5 - 100 | 0.1% | |

### CERN Baked (H₂-normalisiert)

| Massenbereich | Grenzwert | Beschreibung |
|---------------|-----------|--------------|
| 0 - 3 | 100% | H₂ Referenz |
| 3 - 20.5 | 10% | Max 10% von H₂ |
| 20.5 - 27.5 | 1% | Max 1% von H₂ |
| 27.5 - 28.5 | 10% | N₂/CO erlaubt |
| 28.5 - 32.5 | 1% | |
| 32.5 - 43.5 | 0.2% | |
| 43.5 - 44.5 | 5% | CO₂ |
| 44.5 - 100 | 0.01% | HC-frei |

### CERN Unbaked (H₂O-normalisiert)

| Massenbereich | Grenzwert | Beschreibung |
|---------------|-----------|--------------|
| 0 - 3 | 50% | H₂ (oft niedriger als H₂O) |
| 3 - 17.5 | 1% | Vor H₂O |
| 17.5 - 18.5 | 100% | H₂O Referenz-Peak |
| 18.5 - 27.5 | 1% | |
| 27.5 - 28.5 | 10% | N₂/CO |
| 28.5 - 43.5 | 1% | |
| 43.5 - 44.5 | 5% | CO₂ |
| 44.5 - 100 | 0.1% | Schwere Massen |

### DESY HC-Free

| Massenbereich | Grenzwert | Beschreibung |
|---------------|-----------|--------------|
| 0 - 3 | 100% | H₂ erlaubt |
| 3 - 20.5 | 20% | H₂O-Region |
| 20.5 - 27.5 | 2% | |
| 27.5 - 28.5 | 10% | N₂/CO |
| 28.5 - 43.5 | 2% | |
| 43.5 - 44.5 | 5% | CO₂ |
| 44.5 - 100 | 0.1% | HC-frei: Σ < 0.1% |

### GSI Cryogenic

| Massenbereich | Grenzwert | Beschreibung |
|---------------|-----------|--------------|
| 0 - 3 | 100% | H₂ erlaubt |
| 3 - 17.5 | 5% | |
| 17.5 - 18.5 | 10% | H₂O max 10% |
| 18.5 - 27.5 | 1% | |
| 27.5 - 28.5 | 5% | N₂/CO reduziert |
| 28.5 - 43.5 | 0.5% | |
| 43.5 - 44.5 | 2% | CO₂ |
| 44.5 - 100 | 0.05% | Strikte HC-Limits |

### LIGO UHV (Gravitationswellen-Detektoren)

| Massenbereich | Grenzwert | Beschreibung |
|---------------|-----------|--------------|
| 0 - 3 | 100% | H₂ Referenz |
| 3 - 17.5 | 0.1% | Max 0.1% |
| 17.5 - 18.5 | 1% | H₂O max 1% |
| 18.5 - 27.5 | 0.1% | |
| 27.5 - 28.5 | 1% | N₂/CO max 1% |
| 28.5 - 44.5 | 0.1% | |
| 44.5 - 100 | 0.01% | HC < 0.01% |

### Semiconductor CVD (Prozess-Baseline)

| Massenbereich | Grenzwert | Beschreibung |
|---------------|-----------|--------------|
| 0 - 3 | 50% | H₂ akzeptiert |
| 3 - 17.5 | 1% | |
| 17.5 - 18.5 | 0.1% | H₂O < 0.1% kritisch! |
| 18.5 - 27.5 | 1% | |
| 27.5 - 28.5 | 1% | N₂/CO < 1% |
| 28.5 - 31.5 | 1% | |
| 31.5 - 32.5 | 0.1% | O₂ < 0.1% |
| 32.5 - 44.5 | 1% | |
| 44.5 - 100 | 0.01% | HC kritisch |

### LimitProfile-Struktur

```typescript
interface LimitProfile {
  id: string
  name: string
  description: string
  color: string
  isPreset: boolean
  ranges: LimitRange[]
  createdAt: string
  updatedAt: string
}

interface LimitRange {
  massMin: number
  massMax: number
  limit: number        // Relativ (1.0 = 100%)
  notes?: string
}
```

---

## Erweiterte Massenreferenz

### Alle dokumentierten Massen (m/z 1-97)

#### Leichte Gase (m/z 1-11)

| m/z | Zuordnung | Diagnostischer Wert | Hinweise |
|-----|-----------|---------------------|----------|
| 1 | H⁺ | minor | Fragment, 2-5% des H₂-Peaks |
| 2 | H₂⁺ | **critical** | Dominantes Restgas nach Bakeout |
| 3 | HD⁺/H₃⁺ | rare | Ionen-Molekül-Reaktion bei hohem Druck |
| 4 | He⁺ | **critical** | Lecktest-Tracergas |
| 11 | B⁺ | rare | Halbleiter-Prozessgas (BCl₃, B₂H₆) |

#### C-N-O Gruppe (m/z 12-22)

| m/z | Zuordnung | Diagnostischer Wert | Hinweise |
|-----|-----------|---------------------|----------|
| 12 | C⁺ | **critical** | Unterscheidet CO von N₂! |
| 13 | CH⁺ | minor | KW-Indikator, ¹³C-Isotop |
| 14 | N⁺/CH₂⁺ | **critical** | Hoher Peak = N₂ (Luftleck) |
| 15 | CH₃⁺ | **critical** | Sauberer CH₄-Nachweis |
| 16 | O⁺/CH₄⁺ | important | Ambivalent, ESD-Artefakt möglich |
| 17 | OH⁺ | **critical** | Schlüsselindikator für H₂O |
| 18 | H₂O⁺ | **critical** | Dominant in ungeheizten Systemen |
| 19 | F⁺/H₃O⁺ | important | ESD-Artefakt oder Fluorquelle |
| 20 | Ne⁺/Ar²⁺/HF⁺ | important | Ar²⁺ ist 10-15% von m/z 40! |
| 22 | ²²Ne⁺/CO₂²⁺ | minor | Bestätigt Ne oder CO₂ |

#### Atmosphären-Gruppe (m/z 26-40)

| m/z | Zuordnung | Diagnostischer Wert | Hinweise |
|-----|-----------|---------------------|----------|
| 26 | C₂H₂⁺/CN⁺ | minor | Acetylen, Zersetzung am Filament |
| 27 | C₂H₃⁺ | minor | KW-Fragment |
| 28 | N₂⁺/CO⁺ | **critical** | GRÖSSTE AMBIGUITÄT! |
| 29 | ¹⁵N¹⁴N⁺/C₂H₅⁺ | important | >0.7% von m28 = KW-Kontamination |
| 30 | NO⁺/C₂H₆⁺ | minor | Selten in Restgas |
| 31 | CH₂OH⁺/P⁺ | important | ALKOHOL-MARKER! |
| 32 | O₂⁺/S⁺ | **critical** | Luftleck-Indikator |
| 33 | HS⁺ | important | H₂S-Fragment |
| 34 | H₂S⁺ | minor | Schwefel-Indikator |
| 35 | ³⁵Cl⁺ | important | Cl-Isotop 35/37 = 3:1 |
| 36 | HCl⁺/³⁶Ar⁺ | minor | |
| 37 | ³⁷Cl⁺ | important | Partner zu m/z 35 |
| 38 | ³⁸Ar⁺ | rare | Sehr schwach |
| 39 | C₃H₃⁺/K⁺ | important | Öl-Marker, K⁺ aus Glas |
| 40 | Ar⁺ | **critical** | BESTER LUFTLECK-BEWEIS |

#### Öl- und Lösemittel-Bereich (m/z 41-71)

| m/z | Zuordnung | Diagnostischer Wert | Hinweise |
|-----|-----------|---------------------|----------|
| 41 | C₃H₅⁺ | important | ÖL-MARKER (Δ14 Serie) |
| 42 | C₃H₆⁺ | minor | KW-Fragment |
| 43 | C₃H₇⁺/CH₃CO⁺ | **critical** | ÖL/ACETON-MARKER |
| 44 | CO₂⁺ | **critical** | Hauptindikator für CO₂ |
| 45 | ¹³CO₂⁺/C₂H₅O⁺ | important | IPA-MARKER |
| 46 | C₂H₅OH⁺ | minor | Ethanol-Parent |
| 48 | SO⁺ | important | SO₂-Fragment |
| 49 | CH₂Cl⁺ | important | DCM-Fragment |
| 50 | CF₂⁺ | minor | Fluor-Indikator |
| 55 | C₄H₇⁺ | **critical** | Pumpenöl-Marker (Δ14) |
| 57 | C₄H₉⁺ | **critical** | ÖL-MARKER (Butyl) |
| 58 | C₃H₆O⁺ | important | ACETON-Parent |
| 59 | (CH₃)₃Si⁺ | minor | Silikon-Fragment |
| 64 | SO₂⁺ | minor | Schwefel-Hauptpeak |
| 69 | CF₃⁺/C₅H₉⁺ | **critical** | Fomblin vs KW-Öl |
| 71 | C₅H₁₁⁺ | **critical** | Turbopumpenöl-Marker |

#### Silikon, Aromaten, Halogene (m/z 73-97)

| m/z | Zuordnung | Diagnostischer Wert | Hinweise |
|-----|-----------|---------------------|----------|
| 73 | (CH₃)₃Si⁺ | **critical** | SILIKON/DC705-MARKER |
| 77 | C₆H₅⁺ | important | Phenyl-Kation |
| 78 | C₆H₆⁺ | important | Benzol oder DC705 |
| 79 | ⁷⁹Br⁺ | important | BROM-MARKER (79/81 ≈ 1:1) |
| 81 | ⁸¹Br⁺ | important | Brom-Isotop |
| 83 | C₆H₁₁⁺/⁸³Kr⁺ | minor | Öl-Fragment |
| 84 | ⁸⁴Kr⁺ | minor | Krypton-Hauptpeak |
| 85 | CCl₂F⁺ | minor | Freon-12 |
| 91 | C₇H₇⁺ | important | Tropylium (Toluol) |
| 95 | C₂Cl₃⁺ | important | TCE-Hauptpeak |
| 97 | C₂³⁷Cl³⁵Cl₂⁺ | minor | TCE Cl-Isotop |

---

## Quellen

Die Wissensdatenbank basiert auf:
- CERN CAS Tutorial (Vacuum Technology)
- CERN ACC-V-ES-0001 (Technical Specification)
- CERN-ACC-2014-0270
- NIST WebBook (Massenspektren)
- Pfeiffer Vacuum (Application Notes, Know-How Book)
- Hiden Analytical (RGA Application Notes)
- SRS (Stanford Research Systems) Application Notes
- MKS Instruments (Technical Notes)
- GSI Spezifikation 7.3e (2019)
- DESY Vakuumspezifikationen
