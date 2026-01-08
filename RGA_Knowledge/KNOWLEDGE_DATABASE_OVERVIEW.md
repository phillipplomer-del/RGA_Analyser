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
| `outgassingRates.ts` | Ausgasungsraten-Datenbank mit 17 Materialien |
| `isotopePatterns.ts` | Isotopenverhältnisse und Fragment-Muster für Peak-Identifikation |

**Pfad:** `src/lib/diagnosis/`

| Datei | Beschreibung |
|-------|--------------|
| `types.ts` | TypeScript-Typen für Diagnosen |
| `detectors.ts` | Implementierung der 20 Diagnose-Algorithmen |
| `index.ts` | API-Funktionen und Export |
| `confidenceScore.ts` | **Datenqualitäts-Score System** (kontextabhängig) |

**Pfad:** `src/components/DiagnosisPanel/`

| Datei | Beschreibung |
|-------|--------------|
| `index.tsx` | Haupt-Panel für automatische Diagnosen |
| `DataQualityScoreCard.tsx` | **Datenqualitäts-Anzeige** mit expandierbaren Details |
| `OutgassingContext.tsx` | Ausgasungs-Kontext bei H₂O-Diagnosen |

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

> Pfade und Dateien: siehe [Speicherorte](#speicherorte)

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

## Datenqualitäts-Score System (Konfidenz-Score)

### Pfad: `src/lib/diagnosis/confidenceScore.ts`

> **Implementiert:** Feature 1.5.3 (2026-01-08)

### Funktion

Das Datenqualitäts-Score System bewertet die Qualität der RGA-Messdaten und gibt an, wie zuverlässig die automatischen Diagnosen sind. Es berücksichtigt dabei den **Systemkontext** (baked/unbaked, UHV-Druck), um kontextabhängig zu bewerten.

### Qualitätsfaktoren

| Faktor | Gewicht | Beschreibung |
|--------|---------|--------------|
| **Signal-Rausch-Verhältnis** | 1.5 | SNR in dB, kontextabhängig bewertet |
| **Peak-Erkennung** | 1.2 | Anzahl signifikanter Peaks, **invertiert für baked** |
| **Massenbereich** | 0.9 | Abdeckung kritischer Massen (m/z 2, 14, 16, 17, 18, 28, 32, 40, 44) |
| **Dynamikbereich** | 0.8 | Dekaden zwischen Min/Max, UHV-angepasst |
| **H₂-Referenz** | 0.7 | Prüft H₂ vs H₂O Verhältnis |
| **Temperatur** | 0.6 | 20-25°C optimal (wenn im Dateinamen angegeben) |

### Kontextabhängige Bewertung (WICHTIG!)

#### Peak-Erkennung: Baked vs. Unbaked

Das System erkennt automatisch den Systemzustand und passt die Bewertung an:

| Kontext | Wenige Peaks (≤3) | Viele Peaks (>8) |
|---------|-------------------|------------------|
| **Unbaked** | ⚠️ Schlechte Datenqualität | ✅ Erwartetes Verhalten |
| **Baked/UHV** | ✅ **Exzellent** - sauberes System! | ⚠️ Mögliche Kontamination |

**Signifikanz-Schwelle:**
- **Unbaked:** 1% (0.01) des Maximums
- **Baked/UHV:** 0.1% (0.001) - weil H₂ so dominant ist, erscheinen andere Peaks relativ klein

#### Automatische Systemzustand-Erkennung

Der Kontext wird aus drei Quellen ermittelt:

1. **Dateiname:** Regex-Patterns für Deutsch und Englisch
   ```
   "nach Ausheizen", "nach ausheizen", "after bakeout", "baked" → BAKED
   "vor Ausheizen", "before bake out", "unbaked" → UNBAKED
   ```

2. **Spektrum-Charakteristik:** (wenn Dateiname keinen Hinweis gibt)
   ```
   H₂ > H₂O × 3              → BAKED
   H₂ > H₂O UND ≤7 Peaks     → BAKED
   ≤3 Peaks UND H₂ > 10%     → BAKED (UHV)
   H₂O > H₂                  → UNBAKED
   ```

3. **Totaldruck aus Dateiname:** z.B. `2,1e-9mbar` → UHV-Kontext

### TypeScript Interfaces

```typescript
interface DataQualityScore {
  overallScore: number           // 0-1
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  gradeDescription: string       // z.B. "Exzellente Datenqualität"
  factors: QualityFactor[]       // Einzelne Bewertungen
  criticalIssues: number
  improvements: string[]         // Verbesserungsvorschläge
  diagnosisReliability: 'high' | 'medium' | 'low' | 'very_low'
}

interface QualityFactor {
  id: string                     // z.B. 'snr', 'peaks', 'dynamic_range'
  name: string                   // Deutscher Name
  nameEn: string                 // Englischer Name
  score: number                  // 0-1
  weight: number                 // Gewichtung
  status: 'excellent' | 'good' | 'acceptable' | 'poor' | 'critical'
  description: string            // Erklärt WARUM dieser Score
  recommendation?: string        // Verbesserungsvorschlag
}

interface MeasurementContext {
  systemState: SystemState       // BAKED | UNBAKED | UNKNOWN
  totalPressure?: number         // mbar
  temperature?: number           // °C
}
```

### Bewertungsstufen (Grades)

| Grade | Score | Beschreibung | Diagnose-Zuverlässigkeit |
|-------|-------|--------------|--------------------------|
| **A** | ≥90% | Exzellente Datenqualität | Hoch |
| **B** | ≥75% | Gute Datenqualität | Hoch |
| **C** | ≥55% | Akzeptable Datenqualität | Mittel |
| **D** | ≥35% | Eingeschränkte Datenqualität | Niedrig |
| **F** | <35% | Unzureichende Datenqualität | Sehr niedrig |

### Schwellenwerte pro Faktor

#### Signal-Rausch-Verhältnis (SNR)

| Status | Standard | Baked/UHV |
|--------|----------|-----------|
| Excellent | ≥60 dB | ≥45 dB |
| Good | ≥40 dB | ≥30 dB |
| Acceptable | ≥25 dB | ≥18 dB |
| Poor | ≥15 dB | ≥10 dB |

#### Peak-Erkennung (kontextabhängig)

**Baked/UHV System:**
| Peaks | Score | Beschreibung |
|-------|-------|--------------|
| ≤3 | 100% | Sauberes UHV-System |
| ≤5 | 85% | Gutes Vakuum nach Ausheizen |
| ≤8 | 60% | Noch Restgas vorhanden |
| >8 | 40% | Mögliches Leck oder Kontamination |

**Unbaked System:**
| Peaks | Score | Beschreibung |
|-------|-------|--------------|
| ≥5 signifikante + ≥10 total | 100% | Vollständige Peak-Erkennung |
| ≥3 signifikante | 80% | Gute Erkennung |
| ≥2 signifikante | 55% | Möglicherweise UHV |
| 1 signifikant | 30% | Sehr wenige Peaks |
| 0 signifikante | 10% | Keine Peaks - Detektor prüfen! |

### UI-Komponente

**Pfad:** `src/components/DiagnosisPanel/DataQualityScoreCard.tsx`

Features:
- Kompakte Anzeige mit Grade-Badge (A-F, farbcodiert)
- Aufklappbar für Details
- Pro Faktor: Fortschrittsbalken + expandierbare Beschreibung
- Zeigt Verbesserungsvorschläge bei niedrigen Scores
- Warnung bei kritischen Problemen

### API-Funktionen

```typescript
// Hauptfunktion - berechnet Score mit Kontext
calculateDataQualityScore({
  analysis: AnalysisResult,
  temperature?: number,
  context?: MeasurementContext
}): DataQualityScore

// Hilfsfunktionen
formatScorePercent(0.85)      // → "85%"
getStatusColor('excellent')    // → "#10B981" (grün)
getGradeColor('A')            // → "#10B981" (grün)

// Für spätere Verwendung vorbereitet
assessCalibrationAge(lastCalibration: Date): QualityFactor
```

### Integration

Das System ist in die Analyse-Pipeline integriert (`src/lib/analysis/index.ts`):

```typescript
// Kontext aus Dateinamen parsen
const filenameMetadata = parseFilenameExtended(filename)

// Score berechnen mit Kontext
const dataQualityScore = calculateDataQualityScore({
  analysis: analysisResult,
  temperature: filenameMetadata.temperature,
  context: {
    systemState: filenameMetadata.systemState,
    totalPressure: filenameMetadata.totalPressure,
    temperature: filenameMetadata.temperature
  }
})
```

### Beispiel: Baked-System Bewertung

Für ein Spektrum `2_Kammer1_nach Ausheizen_Test8_1000v_48h_20C_2,1e-9mbar.asc`:

| Faktor | Score | Begründung |
|--------|-------|------------|
| SNR | 85% | 35 dB - gut für UHV |
| Peak-Erkennung | **100%** | 5 Peaks - sauberes UHV-System |
| Dynamikbereich | 85% | 3.5 Dekaden - gut für UHV |
| Massenbereich | 100% | m/z 1-100 abgedeckt |
| H₂-Referenz | **100%** | H₂ > H₂O - erfolgreich ausgeheizt |
| Temperatur | 100% | 20°C optimal |
| **Gesamt** | **A (93%)** | Exzellente Datenqualität |

Ohne kontextabhängige Bewertung würde das gleiche Spektrum **D (40%)** erhalten, weil "zu wenige Peaks"!

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

## Ausgasungsraten-Datenbank (NEU - 2026-01-08)

### Pfad: `src/lib/knowledge/outgassingRates.ts`

### Physikalische Grundlage

**Zeitverhalten der Ausgasung:**
- **Reales Leck:** dp/dt = konstant (linearer Druckanstieg)
- **Ausgasung:** dp/dt ~ 1/t (abnehmender Druckanstieg)
- **Virtuelles Leck:** Anfangs schnell, dann abflachend (exponentiell)

**Formel für Ausgasungsrate:**
```
q(t) = q₁ × (t₁/t)^n

Wobei:
- q₁ = Ausgasungsrate nach Referenzzeit t₁ (typisch 1h)
- n ≈ 0.5-1.0 je nach Material (meist ~1 für Metalle, ~0.5-0.7 für Polymere)
```

### OutgassingMaterial Interface

```typescript
interface OutgassingMaterial {
  id: string
  name: string                             // Deutscher Name
  nameEn: string                           // Englischer Name
  category: 'metal' | 'elastomer' | 'ceramic' | 'polymer'
  q1h_unbaked: number                      // Nach 1h bei RT [mbar·L/(s·cm²)]
  q1h_baked?: number                       // Nach Bakeout
  bakeoutTemp?: number                     // °C
  q10h_unbaked: number                     // Nach 10h
  q10h_baked?: number
  timeExponent: number                     // n für q(t) = q₁ × (1/t)^n
  activationEnergy?: number                // [eV]
  dominantSpecies: ('H2O' | 'H2' | 'CO' | 'CO2' | 'CH4' | 'other')[]
  notes?: string[]
  source: string
}
```

### Enthaltene Materialien (17 Spezies)

#### Metalle

| Material | q1h (unbaked) | q1h (baked) | Bakeout | n | Hauptspezies |
|----------|---------------|-------------|---------|---|--------------|
| SS 304/304L (gereinigt) | 2×10⁻⁷ | 1×10⁻¹⁰ | 250°C | 1.0 | H₂O, H₂ |
| SS 316LN (elektropoliert) | 7×10⁻⁸ | 7×10⁻¹¹ | 200°C | 1.0 | H₂O, H₂ |
| Aluminium 6061 | 5×10⁻⁸ | 1.2×10⁻¹³ | 120°C | 0.9 | H₂O |
| OFHC Kupfer | 1×10⁻⁸ | 5×10⁻¹² | 200°C | 0.9 | H₂O, H₂ |
| Titan (Grade 2) | 3×10⁻⁸ | 1×10⁻¹² | 350°C | 1.0 | H₂O, H₂ |
| Inconel 625 | 1×10⁻⁷ | 5×10⁻¹¹ | 300°C | 1.0 | H₂O, H₂ |
| Molybdän | 5×10⁻⁹ | 1×10⁻¹² | 400°C | 1.0 | H₂, CO |

#### Elastomere

| Material | q1h (unbaked) | q1h (baked) | Max Temp | n | Hauptspezies |
|----------|---------------|-------------|----------|---|--------------|
| Viton A (FKM) | 1×10⁻⁶ | 4×10⁻⁸ | 100°C | 0.5 | H₂O, CO₂ |
| Viton E60C (UHV) | 5×10⁻⁷ | 1×10⁻⁸ | 150°C | 0.6 | H₂O |
| Kalrez (FFKM) | 1×10⁻⁸ | 1×10⁻¹⁰ | 200°C | 0.7 | H₂O |
| EPDM | 1×10⁻⁵ | - | - | 0.4 | H₂O, other |
| Buna-N (NBR) | 5×10⁻⁶ | - | - | 0.5 | H₂O, other |
| Silikon (VMQ) | 2×10⁻⁵ | - | - | 0.4 | H₂O, other |

#### Keramik & Polymere

| Material | q1h (unbaked) | q1h (baked) | Bakeout | n | Hauptspezies |
|----------|---------------|-------------|---------|---|--------------|
| Aluminiumoxid (Al₂O₃) | 3×10⁻⁹ | 1×10⁻¹¹ | 300°C | 0.8 | H₂O |
| PEEK | 5×10⁻⁷ | 1×10⁻⁸ | 150°C | 0.6 | H₂O, CO₂ |
| Kapton | 3×10⁻⁷ | 5×10⁻⁹ | 200°C | 0.7 | H₂O |
| Macor | 5×10⁻⁹ | 5×10⁻¹¹ | 300°C | 0.8 | H₂O |

### Kammer-Presets

| Preset | Volumen | Pumpleistung | Materialien |
|--------|---------|--------------|-------------|
| DN100 CF Standard | 10 L | 100 L/s | SS316LN (2000 cm²) + Viton (15 cm²) + Al₂O₃ (50 cm²) |
| DN100 CF UHV | 10 L | 100 L/s | SS316LN baked + Kalrez baked + Al₂O₃ baked |
| DN160 Analysekammer | 30 L | 300 L/s | SS304 (5000 cm²) + Viton (25 cm²) |
| Load-Lock | 5 L | 50 L/s | SS304 (800 cm²) + Viton (10 cm²) |

### Wichtige Erkenntnis

**Viton dominiert oft die Ausgasung, obwohl es nur ~1% der Oberfläche ausmacht!**

Beispiel DN100 CF nach 10h (unbaked):
- Edelstahl 316LN: 7×10⁻⁹ × 2000 cm² = 1.4×10⁻⁵ mbar·L/s (82%)
- Viton: 2×10⁻⁷ × 15 cm² = 3×10⁻⁶ mbar·L/s (18%)

Nach Bakeout wird der Unterschied krasser: Edelstahl verbessert sich um Faktor 1000, Viton nur um Faktor 10-25.

### API Funktionen

| Funktion | Beschreibung |
|----------|--------------|
| `calculateOutgassingRate(material, time, isBaked)` | Berechnet q(t) für ein Material |
| `calculateTotalOutgassing(materials, V, S, t)` | Multi-Material Gesamtgaslast |
| `formatScientific(value, precision)` | Formatiert Werte in wissenschaftlicher Notation |
| `compareWithMeasuredRise(measured, expected)` | Vergleicht gemessenen mit erwartetem dp/dt |

### Integration in andere Module

**Rate-of-Rise:** `OutgassingComparisonCard` zeigt Vergleich zwischen gemessenem dp/dt und erwarteter Ausgasung

**RGA-Diagnose:** `OutgassingContext` erscheint bei H₂O/Kontaminations-Diagnosen und zeigt Kontext aus dem Simulator

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

## Isotopen-Datenbank (isotopePatterns.ts)

> **Neu implementiert:** 2026-01-08

### Funktion

Die Isotopen-Datenbank ermöglicht die präzise Identifikation von Elementen durch Vergleich gemessener Isotopenverhältnisse mit erwarteten natürlichen Häufigkeiten.

### Enthaltene Elemente

| Element | Symbol | Haupt-Isotope | Diagnostisches Verhältnis | Anwendung |
|---------|--------|---------------|---------------------------|-----------|
| Argon | Ar | ³⁶Ar, ³⁸Ar, ⁴⁰Ar | ⁴⁰Ar/³⁶Ar ≈ 295.5 | Luftleck-Bestätigung |
| Chlor | Cl | ³⁵Cl, ³⁷Cl | ³⁵Cl/³⁷Cl ≈ 3.13 | Chlorierte Lösemittel |
| Brom | Br | ⁷⁹Br, ⁸¹Br | ⁷⁹Br/⁸¹Br ≈ 1.03 | Bromverbindungen |
| Schwefel | S | ³²S, ³³S, ³⁴S, ³⁶S | ³²S/³⁴S ≈ 22.4 | Unterscheidung von O₂ |
| Kohlenstoff | C | ¹²C, ¹³C | ¹²C/¹³C ≈ 92.5 | CO₂-Bestätigung (m44/m45) |
| Stickstoff | N | ¹⁴N, ¹⁵N | ¹⁴N¹⁴N/¹⁴N¹⁵N ≈ 142.9 | N₂ vs. KW-Kontamination |
| Sauerstoff | O | ¹⁶O, ¹⁷O, ¹⁸O | ¹⁶O₂/¹⁶O¹⁸O ≈ 487 | Luftleck-Bestätigung |
| Silizium | Si | ²⁸Si, ²⁹Si, ³⁰Si | ²⁸Si/²⁹Si ≈ 19.7 | Silikon-Kontamination |
| Krypton | Kr | ⁷⁸-⁸⁶Kr | ⁸⁴Kr/⁸⁶Kr ≈ 3.29 | Atmosphärisches Edelgas |
| Xenon | Xe | ¹²⁹-¹³⁶Xe | ¹³²Xe/¹²⁹Xe ≈ 1.02 | Seltenes Edelgas |

### API-Funktionen

```typescript
// Isotopenverhältnis für ein Element abrufen
getIsotopeRatio('Ar') // → IsotopeRatio mit allen Ar-Isotopen

// Alle Fragmente bei einer bestimmten Masse
getFragmentsAtMass(28) // → [N₂⁺, CO⁺, Si⁺, ...]

// Fragment-Muster für ein Molekül
getFragmentPattern('CO₂') // → Vollständiges Fragmentierungsmuster

// Isotopen-Peak-Intensität berechnen
calculateIsotopePeakIntensity(1.0, 'Ar', 40, 36) // → 0.00337

// Isotopenverhältnis prüfen
checkIsotopeRatio(295.5, 'Ar', '40/36') // → { matches: true, deviation: 0%, ... }

// Peak-Identifikation
identifyPeak(28) // → [{ assignment: N₂⁺, confidence: 0.7 }, ...]

// Luftleck-Detektion via Isotopenmuster
detectAirLeak(peaksMap) // → { isAirLeak: true, confidence: 0.85, evidence: [...] }

// Öl-Kontamination via Fragmentmuster
detectOilContamination(peaksMap) // → { isOilContaminated: true, oilType: 'mineral', ... }
```

### Fragment-Muster-Datenbank

Die Datenbank enthält vollständige Fragmentierungsmuster für häufige Moleküle:

| Molekül | Formel | MW | Base Peak | Wichtige Fragmente |
|---------|--------|-----|-----------|-------------------|
| Wasser | H₂O | 18 | m/z 18 | 17 (23%), 16 (1%) |
| Stickstoff | N₂ | 28 | m/z 28 | 14 (7.2%), 29 (0.73%) |
| Kohlendioxid | CO₂ | 44 | m/z 44 | 28 (11%), 16 (8%), 12 (6%) |
| Argon | Ar | 40 | m/z 40 | 20 (12%), 36 (0.34%) |
| Methan | CH₄ | 16 | m/z 16 | 15 (85%), 14 (9%), 13 (4%) |
| Kohlenmonoxid | CO | 28 | m/z 28 | 12 (4.5%), 16 (2%) |
| Sauerstoff | O₂ | 32 | m/z 32 | 16 (3.7%), 34 (0.4%) |
| Schwefelwasserstoff | H₂S | 34 | m/z 34 | 33 (42%), 32 (22%) |
| Aceton | C₃H₆O | 58 | m/z 43 | 58 (30%), 15 (25%) |

### Integration in Diagnose-Engine

Der neue Detektor `verifyIsotopeRatios()` verstärkt bestehende Diagnosen durch Isotopen-Verifizierung:

```typescript
DiagnosisType.ISOTOPE_VERIFICATION
// Prüft: Ar (40/36), Cl (35/37), Br (79/81), CO₂ (44/45), S/O₂ (32/34)
// Erhöht Diagnose-Konfidenz um 15-30% bei Übereinstimmung
```

---

## Quellen

Die Wissensdatenbank basiert auf:
- CERN CAS Tutorial (Vacuum Technology)
- CERN ACC-V-ES-0001 (Technical Specification)
- CERN-ACC-2014-0270 (Chiggiato)
- NIST WebBook (Massenspektren)
- Pfeiffer Vacuum (Application Notes, Know-How Book)
- Hiden Analytical (RGA Application Notes)
- SRS (Stanford Research Systems) Application Notes
- MKS Instruments (Technical Notes)
- GSI Spezifikation 7.3e (2019)
- DESY Vakuumspezifikationen

### Ausgasungs-Quellen (NEU)
- VACOM White Paper WP00002 (Edelstahl-Ausgasung)
- de Csernatony, Vacuum 16/17 (1966/1967) - Elastomer-Daten
- Edwards Application Notes (Öl, Pumpen)
- Meyer Tool & Allectra Datasheets (O-Ringe)
- PMC5226402 (Elektropolierte Oberflächen)
