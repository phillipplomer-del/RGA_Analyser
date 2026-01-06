# RGA-Wissensdatenbank für UHV-Spektrenanalyse

**Version:** 1.0  
**Erstellt:** Januar 2026  
**Quellen:** CERN CAS Tutorial, NIST WebBook, Hiden Analytical, SRS Application Notes, Pfeiffer Vacuum, Kurt J. Lesker Technical Notes, GSI/DESY Vakuumrichtlinien

---

## 1. Massen-Bibliothek & Fragmentierungsmuster (Cracking Patterns)

### 1.1 Grundprinzip der Fragmentierung

Bei der Elektronenstoß-Ionisation (typisch 70 eV) entstehen neben dem Molekülion (Parent Ion) auch Fragmentionen durch:
- **Dissoziation**: Aufbrechen chemischer Bindungen
- **Mehrfachionisation**: z.B. Ar++ bei m/z 20
- **Isotopen-Peaks**: Natürliche Isotopenverteilung

Die Fragmentierungsmuster sind charakteristische "Fingerabdrücke" jedes Gases.

---

### 1.2 Haupttabelle: Gase und ihre Cracking Patterns

#### 1.2.1 Permanentgase und Edelgase

| Gas | Formel | Hauptpeak (m/z) | Cracking Pattern (m/z: rel. Intensität %) |
|-----|--------|-----------------|-------------------------------------------|
| **Wasserstoff** | H₂ | 2 | 2: 100%, 1: 2-10% |
| **Helium** | He | 4 | 4: 100% |
| **Stickstoff** | N₂ | 28 | 28: 100%, 14: 7-14%, 29: 0.7% (¹⁵N¹⁴N) |
| **Sauerstoff** | O₂ | 32 | 32: 100%, 16: 11-22%, 34: 0.4-0.7% (¹⁸O¹⁶O) |
| **Argon** | Ar | 40 | 40: 100%, 20: 10-15% (Ar++), 36: 0.3% (³⁶Ar) |
| **Neon** | Ne | 20 | 20: 100%, 22: 9.9% (²²Ne), 21: 0.3% |
| **Krypton** | Kr | 84 | 84: 100%, 86: 30.5%, 82: 20.3%, 83: 11.5%, 80: 2.3% |
| **Xenon** | Xe | 132 | 132: 100%, 129: 98.3%, 131: 78.8%, 134: 38.8% |

#### 1.2.2 Häufige UHV-Restgase

| Gas | Formel | Hauptpeak (m/z) | Cracking Pattern (m/z: rel. Intensität %) |
|-----|--------|-----------------|-------------------------------------------|
| **Wasser** | H₂O | 18 | 18: 100%, 17 (OH+): 21-25%, 16 (O+): 1-2%, 19: 0.06% (H₂¹⁷O), 20: 0.2% (H₂¹⁸O) |
| **Kohlenmonoxid** | CO | 28 | 28: 100%, 12 (C+): 4.5-5%, 16 (O+): 0.9-1.7%, 29: 1.2% (¹³CO) |
| **Kohlendioxid** | CO₂ | 44 | 44: 100%, 28 (CO+): 10-11%*, 16 (O+): 8-10%, 12 (C+): 8.7%, 22 (CO₂++): 1.9%, 45: 1.1% (¹³CO₂) |
| **Methan** | CH₄ | 16 | 16: 100%, 15 (CH₃+): 85%, 14 (CH₂+): 16-20%, 13 (CH+): 7-11%, 12 (C+): 3.8%, 17: 1.1% (¹³CH₄) |
| **Ammoniak** | NH₃ | 17 | 17: 100%, 16 (NH₂+): 80%, 15 (NH+): 7.5%, 14 (N+): 2% |

*Hinweis: Das 28/44-Verhältnis bei CO₂ ist stark systemabhängig (Ionisationsquerschnitt).

#### 1.2.3 Kohlenwasserstoffe

| Gas | Formel | Hauptpeak (m/z) | Cracking Pattern (m/z: rel. Intensität %) |
|-----|--------|-----------------|-------------------------------------------|
| **Ethan** | C₂H₆ | 28 | 28: 100%, 27: 33%, 30: 26%, 29: 22%, 26: 23%, 25: 3.5%, 15: 4.4% |
| **Propan** | C₃H₈ | 29 | 29: 100%, 44: 28%, 43: 23%, 28: 59%, 27: 42%, 41: 13%, 39: 19%, 15: 7% |
| **Aceton** | C₃H₆O | 43 | 43: 100%, 58 (M+): 27%, 15: 8%, 27: 8% |
| **Ethanol** | C₂H₅OH | 31 | 31 (CH₂OH+): 100%, 45: 52%, 46 (M+): 22%, 29: 30%, 27: 22% |
| **Methanol** | CH₃OH | 31 | 31 (CHO+): 100%, 32 (M+): 67%, 29: 65%, 28: 3.4% |
| **Isopropanol** | C₃H₇OH | 45 | 45: 100%, 43: 17%, 27: 16% |
| **Benzol** | C₆H₆ | 78 | 78: 100%, 52: 19%, 51: 19%, 77: 20%, 50: 15% |

#### 1.2.4 Halogenverbindungen und Sonstige

| Gas | Formel | Hauptpeak (m/z) | Cracking Pattern (m/z: rel. Intensität %) |
|-----|--------|-----------------|-------------------------------------------|
| **Chlorwasserstoff** | HCl | 36 | 36: 100%, 38: 32% (³⁷Cl), 35: 17% |
| **Schwefelwasserstoff** | H₂S | 34 | 34: 100%, 32 (S+): 44%, 33 (HS+): 42% |
| **Schwefeldioxid** | SO₂ | 64 | 64: 100%, 48 (SO+): 49%, 32 (S+): 10% |
| **Tetrafluormethan** | CF₄ | 69 | 69 (CF₃+): 100%, 50: 12%, 31: 7% |
| **Freon 12** | CCl₂F₂ | 85 | 85: 100%, 87: 32%, 50: 16% |
| **Silan** | SiH₄ | 30 | 30: 100%, 31: 78%, 29: 29%, 28: 4% |

---

### 1.3 Detaillierte Cracking Patterns für Algorithmen

#### 1.3.1 Wasser (H₂O) - Kritisch für UHV-Diagnostik

```typescript
const WATER_PATTERN: CrackingPattern = {
  formula: "H2O",
  molecularMass: 18,
  principalMass: 18,
  fragments: [
    { mass: 18, relativeIntensity: 100.0, ion: "H2O+" },
    { mass: 17, relativeIntensity: 23.0,  ion: "OH+" },
    { mass: 16, relativeIntensity: 1.1,   ion: "O+" },
    { mass: 19, relativeIntensity: 0.06,  ion: "H2-17O+", isotope: true },
    { mass: 20, relativeIntensity: 0.2,   ion: "H2-18O+", isotope: true },
    { mass: 1,  relativeIntensity: 0.5,   ion: "H+" },
    { mass: 2,  relativeIntensity: 0.3,   ion: "H2+" }
  ],
  relativeSensitivity: 0.9,
  notes: "Dominiert in ungeheizten Systemen. 18/17-Verhältnis ~4.3"
};
```

#### 1.3.2 Stickstoff (N₂)

```typescript
const NITROGEN_PATTERN: CrackingPattern = {
  formula: "N2",
  molecularMass: 28,
  principalMass: 28,
  fragments: [
    { mass: 28, relativeIntensity: 100.0, ion: "N2+" },
    { mass: 14, relativeIntensity: 7.2,   ion: "N+" },
    { mass: 29, relativeIntensity: 0.7,   ion: "15N-14N+", isotope: true }
  ],
  relativeSensitivity: 1.0,  // Referenzgas
  notes: "28/14-Verhältnis bei reinem N2 ~14. Abweichung deutet auf CO hin."
};
```

#### 1.3.3 Kohlenmonoxid (CO)

```typescript
const CO_PATTERN: CrackingPattern = {
  formula: "CO",
  molecularMass: 28,
  principalMass: 28,
  fragments: [
    { mass: 28, relativeIntensity: 100.0, ion: "CO+" },
    { mass: 12, relativeIntensity: 4.5,   ion: "C+" },
    { mass: 16, relativeIntensity: 1.7,   ion: "O+" },
    { mass: 14, relativeIntensity: 1.0,   ion: "CO++", doubleCharged: true },
    { mass: 29, relativeIntensity: 1.2,   ion: "13CO+", isotope: true }
  ],
  relativeSensitivity: 1.05,
  notes: "Kann nicht direkt von N2 unterschieden werden (M=28). Prüfe m/z 12!"
};
```

#### 1.3.4 Kohlendioxid (CO₂)

```typescript
const CO2_PATTERN: CrackingPattern = {
  formula: "CO2",
  molecularMass: 44,
  principalMass: 44,
  fragments: [
    { mass: 44, relativeIntensity: 100.0, ion: "CO2+" },
    { mass: 28, relativeIntensity: 10.0,  ion: "CO+" },  // systemabhängig!
    { mass: 16, relativeIntensity: 10.0,  ion: "O+" },
    { mass: 12, relativeIntensity: 8.7,   ion: "C+" },
    { mass: 22, relativeIntensity: 1.9,   ion: "CO2++", doubleCharged: true },
    { mass: 45, relativeIntensity: 1.1,   ion: "13CO2+", isotope: true },
    { mass: 46, relativeIntensity: 0.4,   ion: "C-18O-O+", isotope: true }
  ],
  relativeSensitivity: 1.4,
  notes: "28/44-Verhältnis variiert stark je nach RGA-Einstellung (5-15%)"
};
```

#### 1.3.5 Argon (Ar)

```typescript
const ARGON_PATTERN: CrackingPattern = {
  formula: "Ar",
  molecularMass: 40,
  principalMass: 40,
  fragments: [
    { mass: 40, relativeIntensity: 100.0, ion: "Ar+" },
    { mass: 20, relativeIntensity: 14.6,  ion: "Ar++", doubleCharged: true },
    { mass: 36, relativeIntensity: 0.34,  ion: "36Ar+", isotope: true },
    { mass: 38, relativeIntensity: 0.063, ion: "38Ar+", isotope: true }
  ],
  relativeSensitivity: 1.2,
  notes: "Peak bei 20 kann mit Ne verwechselt werden. 40/20-Verhältnis ~7"
};
```

---

### 1.4 Isotopen-Referenztabelle

| Element | Isotop | Masse | Natürliche Häufigkeit (%) |
|---------|--------|-------|---------------------------|
| H | ¹H | 1 | 99.985 |
| H | ²H (D) | 2 | 0.015 |
| C | ¹²C | 12 | 98.9 |
| C | ¹³C | 13 | 1.1 |
| N | ¹⁴N | 14 | 99.6 |
| N | ¹⁵N | 15 | 0.37 |
| O | ¹⁶O | 16 | 99.76 |
| O | ¹⁷O | 17 | 0.038 |
| O | ¹⁸O | 18 | 0.2 |
| Ar | ³⁶Ar | 36 | 0.334 |
| Ar | ³⁸Ar | 38 | 0.063 |
| Ar | ⁴⁰Ar | 40 | 99.6 |
| Cl | ³⁵Cl | 35 | 75.76 |
| Cl | ³⁷Cl | 37 | 24.24 |
| Kr | ⁸⁴Kr | 84 | 57.0 |

---

### 1.5 Vollständige Massenreferenz (m/z 1-100)

```typescript
const MASS_REFERENCE: MassAssignment[] = [
  // m/z 1-10
  { mass: 1,  primaryAssignment: "H+", secondaryAssignments: ["Fragment von H2O, HC"] },
  { mass: 2,  primaryAssignment: "H2+", secondaryAssignments: ["D+", "H2+-Fragment von H2O"] },
  { mass: 3,  primaryAssignment: "HD+", secondaryAssignments: ["sehr selten"] },
  { mass: 4,  primaryAssignment: "He+", secondaryAssignments: ["D2+", "Lecktest-Gas"] },
  { mass: 12, primaryAssignment: "C+", secondaryAssignments: ["Fragment von CO, CO2, CH4, HC"] },
  { mass: 13, primaryAssignment: "CH+", secondaryAssignments: ["Fragment von CH4, HC"] },
  { mass: 14, primaryAssignment: "N+, CH2+", secondaryAssignments: ["CO++", "Fragment von N2, CH4"] },
  { mass: 15, primaryAssignment: "CH3+", secondaryAssignments: ["NH+", "Fragment von CH4, HC"] },
  { mass: 16, primaryAssignment: "O+, CH4+", secondaryAssignments: ["NH2+", "Fragment von O2, H2O, CO2"] },
  { mass: 17, primaryAssignment: "OH+", secondaryAssignments: ["NH3+", "13CH4+", "Fragment von H2O"] },
  { mass: 18, primaryAssignment: "H2O+", secondaryAssignments: ["Hauptindikator für Wasser"] },
  { mass: 19, primaryAssignment: "F+, H3O+", secondaryAssignments: ["H2-17O+", "Fluorverbindungen"] },
  { mass: 20, primaryAssignment: "Ne+, Ar++, HF+", secondaryAssignments: ["H2-18O+", "Ar-Doppelionisation"] },
  
  // m/z 22-30
  { mass: 22, primaryAssignment: "CO2++, 22Ne+", secondaryAssignments: ["Doppelionisation von CO2"] },
  { mass: 26, primaryAssignment: "C2H2+", secondaryAssignments: ["Fragment von C2H6, HC"] },
  { mass: 27, primaryAssignment: "C2H3+", secondaryAssignments: ["HCN+", "Fragment von HC, Ethanol"] },
  { mass: 28, primaryAssignment: "N2+, CO+", secondaryAssignments: ["C2H4+", "KRITISCH: N2/CO nicht trennbar"] },
  { mass: 29, primaryAssignment: "C2H5+, CHO+", secondaryAssignments: ["15N14N+", "13CO+", "Fragment von Ethanol"] },
  { mass: 30, primaryAssignment: "C2H6+, NO+, SiH2+", secondaryAssignments: ["Fragment von Ethan, Silan"] },
  
  // m/z 31-45
  { mass: 31, primaryAssignment: "CH2OH+, CH3O+", secondaryAssignments: ["Fragment von Methanol, Ethanol"] },
  { mass: 32, primaryAssignment: "O2+, S+", secondaryAssignments: ["CH3OH+", "Hauptindikator für O2"] },
  { mass: 33, primaryAssignment: "HS+", secondaryAssignments: ["Fragment von H2S"] },
  { mass: 34, primaryAssignment: "H2S+, 18O16O+", secondaryAssignments: ["PH+", "Schwefelwasserstoff"] },
  { mass: 35, primaryAssignment: "Cl+", secondaryAssignments: ["Fragment von Chlorverbindungen"] },
  { mass: 36, primaryAssignment: "HCl+, 36Ar+", secondaryAssignments: ["C3+"] },
  { mass: 37, primaryAssignment: "37Cl+", secondaryAssignments: ["C3H+"] },
  { mass: 38, primaryAssignment: "38Ar+, C3H2+", secondaryAssignments: ["Fluorverbindungen"] },
  { mass: 39, primaryAssignment: "C3H3+, K+", secondaryAssignments: ["Fragment von Propan, HC"] },
  { mass: 40, primaryAssignment: "Ar+, C3H4+", secondaryAssignments: ["Ca+", "Hauptindikator für Ar"] },
  { mass: 41, primaryAssignment: "C3H5+", secondaryAssignments: ["PUMPENÖL-INDIKATOR, Fragment HC"] },
  { mass: 42, primaryAssignment: "C3H6+, C2H2O+", secondaryAssignments: ["Propen, Keten"] },
  { mass: 43, primaryAssignment: "C3H7+, CH3CO+", secondaryAssignments: ["PUMPENÖL-INDIKATOR, Aceton-Fragment"] },
  { mass: 44, primaryAssignment: "CO2+, C3H8+", secondaryAssignments: ["N2O+", "Hauptindikator für CO2"] },
  { mass: 45, primaryAssignment: "CHO2+, C2H5O+", secondaryAssignments: ["13CO2+", "Fragment von Ethanol"] },
  
  // m/z 46-60 (Lösemittel und Öle)
  { mass: 46, primaryAssignment: "C2H5OH+, NO2+", secondaryAssignments: ["Ethanol-Molekülion"] },
  { mass: 48, primaryAssignment: "SO+", secondaryAssignments: ["Fragment von SO2", "Schwefelindikator"] },
  { mass: 50, primaryAssignment: "CF2+", secondaryAssignments: ["Fragment von Fluorverbindungen"] },
  { mass: 55, primaryAssignment: "C4H7+", secondaryAssignments: ["PUMPENÖL-INDIKATOR"] },
  { mass: 56, primaryAssignment: "C4H8+", secondaryAssignments: ["Buten"] },
  { mass: 57, primaryAssignment: "C4H9+", secondaryAssignments: ["PUMPENÖL-INDIKATOR, Butyl-Kation"] },
  
  // m/z 61-80 (Lösemittel, Halogenide)
  { mass: 61, primaryAssignment: "C35Cl2+", secondaryAssignments: ["Fragment von TCE"] },
  { mass: 63, primaryAssignment: "C37Cl35Cl+", secondaryAssignments: ["Fragment von TCE"] },
  { mass: 64, primaryAssignment: "SO2+", secondaryAssignments: ["S2+", "Schwefeldioxid-Hauptpeak"] },
  { mass: 69, primaryAssignment: "CF3+, C5H9+", secondaryAssignments: ["PUMPENÖL/FOMBLIN-INDIKATOR"] },
  { mass: 71, primaryAssignment: "C5H11+", secondaryAssignments: ["PUMPENÖL-INDIKATOR"] },
  { mass: 77, primaryAssignment: "C6H5+", secondaryAssignments: ["Phenyl-Kation, Benzol-Fragment"] },
  { mass: 78, primaryAssignment: "C6H6+", secondaryAssignments: ["Benzol-Molekülion"] },
  
  // m/z 81-100 (Schwere Kohlenwasserstoffe, Halogenide)
  { mass: 83, primaryAssignment: "C6H11+, 83Kr+", secondaryAssignments: ["PUMPENÖL-INDIKATOR"] },
  { mass: 84, primaryAssignment: "84Kr+, C6H12+", secondaryAssignments: ["Krypton-Hauptpeak"] },
  { mass: 85, primaryAssignment: "C6H13+, CCl2F+", secondaryAssignments: ["PUMPENÖL, Freon-12"] },
  { mass: 91, primaryAssignment: "C7H7+", secondaryAssignments: ["Tropylium/Benzyl-Kation"] },
  { mass: 97, primaryAssignment: "C35Cl3+", secondaryAssignments: ["TCE-Hauptpeak"] },
  { mass: 99, primaryAssignment: "C37Cl35Cl2+", secondaryAssignments: ["TCE-Isotopenpeak"] }
];
```

---

## 2. Diagnose-Logik & Fehlererkennung

### 2.1 Entscheidungsbaum: Hauptdiagnose

```typescript
interface DiagnosticResult {
  type: DiagnosisType;
  confidence: number;  // 0-1
  evidence: string[];
  recommendation: string;
}

enum DiagnosisType {
  AIR_LEAK = "AIR_LEAK",
  VIRTUAL_LEAK = "VIRTUAL_LEAK",
  OUTGASSING_WATER = "OUTGASSING_WATER",
  OUTGASSING_HYDROGEN = "OUTGASSING_HYDROGEN",
  HYDROCARBON_CONTAMINATION = "HYDROCARBON_CONTAMINATION",
  PUMP_OIL_BACKSTREAMING = "PUMP_OIL_BACKSTREAMING",
  SOLVENT_CONTAMINATION = "SOLVENT_CONTAMINATION",
  ESD_ARTIFACT = "ESD_ARTIFACT",
  CLEAN_SYSTEM = "CLEAN_SYSTEM"
}
```

### 2.2 Luftleck-Detektion

#### Diagnosekriterien

```typescript
function detectAirLeak(spectrum: RGASpectrum): DiagnosticResult {
  const m28 = spectrum.getPeakIntensity(28);  // N2 + CO
  const m32 = spectrum.getPeakIntensity(32);  // O2
  const m40 = spectrum.getPeakIntensity(40);  // Ar
  const m14 = spectrum.getPeakIntensity(14);  // N+
  
  // Atmosphärische Verhältnisse (Luft)
  const N2_O2_RATIO_AIR = 78 / 21;  // ~3.7
  const N2_AR_RATIO_AIR = 78 / 0.93;  // ~84
  
  const ratio_28_32 = m28 / m32;
  const ratio_28_40 = m28 / m40;
  
  const evidence: string[] = [];
  let confidence = 0;
  
  // Primärkriterium: N2/O2-Verhältnis nahe 3.7
  if (ratio_28_32 >= 3.0 && ratio_28_32 <= 4.5) {
    evidence.push(`N2/O2-Verhältnis (m28/m32): ${ratio_28_32.toFixed(2)} (Luft: ~3.7)`);
    confidence += 0.4;
  }
  
  // Sekundärkriterium: Argon bei m/z 40
  if (m40 > spectrum.noiseFloor * 10) {
    if (ratio_28_40 >= 60 && ratio_28_40 <= 100) {
      evidence.push(`N2/Ar-Verhältnis (m28/m40): ${ratio_28_40.toFixed(1)} (Luft: ~84)`);
      confidence += 0.3;
    }
  }
  
  // Bestätigung durch N+ Fragment
  const ratio_28_14 = m28 / m14;
  if (ratio_28_14 >= 6 && ratio_28_14 <= 20) {
    evidence.push(`N2/N+ Verhältnis (m28/m14): ${ratio_28_14.toFixed(1)} (typisch: 7-14)`);
    confidence += 0.2;
  }
  
  // Zusätzlich: Argon-Isotope prüfen
  const m36 = spectrum.getPeakIntensity(36);
  const m20 = spectrum.getPeakIntensity(20);
  
  if (m36 > 0 && m40 / m36 >= 200 && m40 / m36 <= 400) {
    evidence.push("36Ar-Isotop detektiert");
    confidence += 0.1;
  }
  
  // Ar++ bei m/z 20 (ohne Ne)
  if (m20 > 0) {
    const m22 = spectrum.getPeakIntensity(22);
    if (m22 < m20 * 0.15) {  // Kein Ne (Ne: m20/m22 ~ 10)
      evidence.push("Ar++ bei m/z 20 ohne Ne (kein m22-Peak)");
      confidence += 0.1;
    }
  }
  
  return {
    type: DiagnosisType.AIR_LEAK,
    confidence: Math.min(confidence, 1.0),
    evidence,
    recommendation: confidence > 0.5 
      ? "Dichtigkeitsprüfung mit He durchführen. Alle Flansche, Ventile und Durchführungen prüfen."
      : "Kein eindeutiges Luftleck. Andere Quellen für m/z 28 und 32 prüfen."
  };
}
```

#### WICHTIG: Sauerstoff-Adsorption

In ausgeheizten Edelstahlsystemen kann O₂ an den Oberflächen adsorbiert werden. **Das Fehlen von O₂ (m/z 32) schließt ein Luftleck NICHT aus!**

Prüfe zusätzlich:
- m/z 39/40-Verhältnis: Bei reinem Ar ist 39/40 < 0.03. Bei Luft + Propan-Kontamination steigt das Verhältnis.
- m/z 20: Ar++ (~15% von m/z 40) vs. Ne (eigenes Isotopenmuster mit m/z 22)

---

### 2.3 Virtuelles Leck (Eingeschlossenes Volumen)

#### Charakteristik

Ein virtuelles Leck zeigt ein **zeitabhängiges Verhalten**, das sich von einem echten Leck unterscheidet:

```typescript
function detectVirtualLeak(spectrum: RGASpectrum, timeData: TimeSeriesData): DiagnosticResult {
  const evidence: string[] = [];
  let confidence = 0;
  
  // Charakteristik 1: Exponentieller Druckabfall beim Pumpen
  if (timeData.showsExponentialDecay()) {
    evidence.push("Exponentieller Druckabfall beim Pumpen (typisch für virtuelles Leck)");
    confidence += 0.3;
  }
  
  // Charakteristik 2: Reproduzierbarer Druckanstieg nach Belüften
  if (timeData.showsReproducibleRiseAfterVent()) {
    evidence.push("Reproduzierbarer Druckanstieg nach Belüften");
    confidence += 0.3;
  }
  
  // Charakteristik 3: He-Lecktest negativ trotz erhöhtem Druck
  // (muss manuell bestätigt werden)
  
  // Charakteristik 4: Luftzusammensetzung ähnlich echtem Leck
  const airLeakResult = detectAirLeak(spectrum);
  if (airLeakResult.confidence > 0.3) {
    evidence.push("Luftähnliche Gaszusammensetzung");
    confidence += 0.2;
  }
  
  // Charakteristik 5: Druckprofil reagiert auf Temperatur
  if (timeData.showsTemperatureCorrelation()) {
    evidence.push("Druckanstieg bei Temperaturerhöhung");
    confidence += 0.2;
  }
  
  return {
    type: DiagnosisType.VIRTUAL_LEAK,
    confidence,
    evidence,
    recommendation: "Prüfe: Blindbohrungen, eingeklemmte O-Ringe, schlecht durchströmte Volumina, Gewinde ohne Entlüftungsnuten"
  };
}
```

---

### 2.4 Ausgasung

#### 2.4.1 Wasser-dominiertes System (Unbeheizt)

```typescript
function detectWaterOutgassing(spectrum: RGASpectrum): DiagnosticResult {
  const m18 = spectrum.getPeakIntensity(18);
  const m17 = spectrum.getPeakIntensity(17);
  const m16 = spectrum.getPeakIntensity(16);
  const m2 = spectrum.getPeakIntensity(2);
  const m28 = spectrum.getPeakIntensity(28);
  
  const evidence: string[] = [];
  let confidence = 0;
  
  // Wasser ist der dominante Peak
  if (m18 > m28 && m18 > m2) {
    evidence.push("H2O (m/z 18) ist dominanter Peak");
    confidence += 0.4;
  }
  
  // Cracking Pattern von Wasser prüfen
  const ratio_18_17 = m18 / m17;
  if (ratio_18_17 >= 3.5 && ratio_18_17 <= 5.0) {
    evidence.push(`H2O/OH-Verhältnis (m18/m17): ${ratio_18_17.toFixed(2)} (typisch: ~4.3)`);
    confidence += 0.3;
  }
  
  const ratio_17_16 = m17 / m16;
  if (ratio_17_16 >= 10) {
    evidence.push(`OH/O-Verhältnis (m17/m16): ${ratio_17_16.toFixed(1)} (H2O-typisch: >10)`);
    confidence += 0.2;
  }
  
  return {
    type: DiagnosisType.OUTGASSING_WATER,
    confidence,
    evidence,
    recommendation: "System ausheizen (>120°C, min. 12h). Alternative: Längeres Pumpen (Wochen bis Monate für 10⁻¹⁰ mbar)"
  };
}
```

#### 2.4.2 Wasserstoff-dominiertes System (Nach Bakeout)

```typescript
function detectHydrogenOutgassing(spectrum: RGASpectrum): DiagnosticResult {
  const m2 = spectrum.getPeakIntensity(2);
  const m18 = spectrum.getPeakIntensity(18);
  const m28 = spectrum.getPeakIntensity(28);
  const m44 = spectrum.getPeakIntensity(44);
  
  const evidence: string[] = [];
  let confidence = 0;
  
  // H2 ist dominanter Peak in ausgeheizten Systemen
  if (m2 > m18 && m2 > m28) {
    evidence.push("H2 (m/z 2) ist dominanter Peak - typisch nach Bakeout");
    confidence += 0.5;
  }
  
  // CO und CO2 eine Größenordnung niedriger
  if (m2 > m28 * 5 && m2 > m44 * 10) {
    evidence.push("CO/CO2 deutlich niedriger als H2 - typisch für Edelstahl nach Bakeout");
    confidence += 0.3;
  }
  
  // Wasser reduziert
  if (m18 < m2) {
    evidence.push("H2O reduziert - Bakeout erfolgreich");
    confidence += 0.2;
  }
  
  return {
    type: DiagnosisType.OUTGASSING_HYDROGEN,
    confidence,
    evidence,
    recommendation: "H2-Ausgasung durch Diffusion aus Edelstahl-Bulk. Reduzierung durch: Vakuumglühen (950°C/2h), längere Bakeout-Zyklen, dünnere Wandstärken."
  };
}
```

---

### 2.5 Kohlenwasserstoff-Kontamination

#### 2.5.1 Pumpenöl-Rückströmung

**Charakteristisches Muster: "Unzipping"-Peaks bei m/z 41, 43, 55, 57, 69, 71, 83, 85...**

```typescript
function detectPumpOilBackstreaming(spectrum: RGASpectrum): DiagnosticResult {
  // Typische Alkyl-Kation-Peaks (CnH2n+1)
  const oilPeaks = [
    { mass: 41, ion: "C3H5+" },
    { mass: 43, ion: "C3H7+" },
    { mass: 55, ion: "C4H7+" },
    { mass: 57, ion: "C4H9+" },
    { mass: 69, ion: "C5H9+" },
    { mass: 71, ion: "C5H11+" },
    { mass: 83, ion: "C6H11+" },
    { mass: 85, ion: "C6H13+" }
  ];
  
  const evidence: string[] = [];
  let detectedPairs = 0;
  
  // Suche nach charakteristischen Paaren (14 amu Abstand)
  for (let i = 0; i < oilPeaks.length - 1; i += 2) {
    const m_low = spectrum.getPeakIntensity(oilPeaks[i].mass);
    const m_high = spectrum.getPeakIntensity(oilPeaks[i + 1].mass);
    
    if (m_low > spectrum.noiseFloor * 5 && m_high > spectrum.noiseFloor * 5) {
      // Typisches Verhältnis bei Alkanen: m41/m43 ≈ m55/m57 ≈ 0.8-1.2
      const ratio = m_low / m_high;
      if (ratio >= 0.5 && ratio <= 2.0) {
        evidence.push(`Peak-Paar ${oilPeaks[i].mass}/${oilPeaks[i + 1].mass} detektiert (Ratio: ${ratio.toFixed(2)})`);
        detectedPairs++;
      }
    }
  }
  
  // 14 amu periodisches Muster ("Unzipping")
  const hasPeriodicPattern = checkPeriodicPattern(spectrum, 14, [41, 55, 69, 83]);
  if (hasPeriodicPattern) {
    evidence.push("Periodisches 14-amu-Muster (CH2-Verlust) - typisch für Alkane");
  }
  
  let confidence = Math.min(detectedPairs * 0.25, 0.75);
  if (hasPeriodicPattern) confidence += 0.25;
  
  return {
    type: DiagnosisType.PUMP_OIL_BACKSTREAMING,
    confidence: Math.min(confidence, 1.0),
    evidence,
    recommendation: "Prüfe: Ventilsequenz bei Loadlock, Öl-Trap-Sättigung, Foreline-Trap. Verwende ölfreie Pumpen oder LN2-Falle."
  };
}

function checkPeriodicPattern(spectrum: RGASpectrum, period: number, startMasses: number[]): boolean {
  for (const start of startMasses) {
    let count = 0;
    for (let m = start; m <= start + period * 3; m += period) {
      if (spectrum.getPeakIntensity(m) > spectrum.noiseFloor * 3) count++;
    }
    if (count >= 3) return true;
  }
  return false;
}
```

#### 2.5.2 Fomblin/PFPE-Öl (Fluoriert)

```typescript
function detectFomblinOil(spectrum: RGASpectrum): DiagnosticResult {
  // Fomblin-typische Peaks
  const m69 = spectrum.getPeakIntensity(69);   // CF3+
  const m20 = spectrum.getPeakIntensity(20);   // HF+
  const m16 = spectrum.getPeakIntensity(16);   // O+
  const m31 = spectrum.getPeakIntensity(31);   // CF+
  const m47 = spectrum.getPeakIntensity(47);   // CFO+
  const m85 = spectrum.getPeakIntensity(85);   // C2F3O+
  
  const evidence: string[] = [];
  let confidence = 0;
  
  if (m69 > spectrum.noiseFloor * 10) {
    evidence.push("CF3+ (m/z 69) detektiert - Hauptindikator für PFPE");
    confidence += 0.4;
    
    // Fomblin-Verhältnisse
    if (m20 > 0 && m69 / m20 >= 2 && m69 / m20 <= 5) {
      evidence.push(`CF3/HF-Verhältnis: ${(m69 / m20).toFixed(1)} (typisch für Fomblin)`);
      confidence += 0.3;
    }
  }
  
  if (m47 > spectrum.noiseFloor * 5 || m85 > spectrum.noiseFloor * 5) {
    evidence.push("CFO+ oder C2F3O+ detektiert - bestätigt PFPE");
    confidence += 0.2;
  }
  
  return {
    type: DiagnosisType.HYDROCARBON_CONTAMINATION,
    confidence,
    evidence,
    recommendation: "Fomblin/PFPE-Kontamination. Quelle: Diffusionspumpenöl, vakuumkompatibles Fett. Reinigung erforderlich."
  };
}
```

---

### 2.6 Lösemittel-Kontamination

```typescript
function detectSolventContamination(spectrum: RGASpectrum): DiagnosticResult {
  const evidence: string[] = [];
  let confidence = 0;
  let solventType = "";
  
  // Aceton (M=58)
  const m43_aceton = spectrum.getPeakIntensity(43);  // CH3CO+
  const m58 = spectrum.getPeakIntensity(58);          // M+
  const m15 = spectrum.getPeakIntensity(15);          // CH3+
  
  if (m43_aceton > spectrum.noiseFloor * 10) {
    const ratio_43_58 = m58 > 0 ? m43_aceton / m58 : 999;
    if (ratio_43_58 >= 2 && ratio_43_58 <= 5) {
      evidence.push(`Aceton-Pattern: m43/m58 = ${ratio_43_58.toFixed(1)}`);
      confidence += 0.4;
      solventType = "Aceton";
    }
  }
  
  // Isopropanol (M=60)
  const m45 = spectrum.getPeakIntensity(45);  // C2H5O+
  const m27 = spectrum.getPeakIntensity(27);  // C2H3+
  
  if (m45 > spectrum.noiseFloor * 10 && m27 > spectrum.noiseFloor * 10) {
    evidence.push("Isopropanol-Pattern: m45, m27 dominant");
    confidence += 0.3;
    solventType = "Isopropanol";
  }
  
  // Trichlorethylen TCE (M=130/132)
  const m97 = spectrum.getPeakIntensity(97);   // C2Cl3+
  const m99 = spectrum.getPeakIntensity(99);   // Isotop
  const m61 = spectrum.getPeakIntensity(61);   // CHCl2+
  const m63 = spectrum.getPeakIntensity(63);   // Isotop
  
  // Cl-Isotopenmuster: 35Cl/37Cl = 3:1
  if (m97 > spectrum.noiseFloor * 5 && m99 > spectrum.noiseFloor * 5) {
    const ratio_97_99 = m97 / m99;
    if (ratio_97_99 >= 2 && ratio_97_99 <= 4) {
      evidence.push(`TCE-Pattern: m97/m99 = ${ratio_97_99.toFixed(1)} (Cl-Isotope)`);
      confidence += 0.5;
      solventType = "Trichlorethylen (TCE)";
    }
  }
  
  // 1,1,1-Trichlorethan
  const m117 = spectrum.getPeakIntensity(117);
  const m119 = spectrum.getPeakIntensity(119);
  
  if (m117 > spectrum.noiseFloor * 3 && m119 > spectrum.noiseFloor * 3) {
    evidence.push("Trichlorethan-Pattern: m117/m119");
    confidence += 0.4;
    solventType = "1,1,1-Trichlorethan";
  }
  
  return {
    type: DiagnosisType.SOLVENT_CONTAMINATION,
    confidence,
    evidence,
    recommendation: `${solventType || "Lösemittel"}-Kontamination. WARNUNG: Chlorhaltige Lösemittel können Aluminium korrodieren! Lösemittel diffundieren in Elastomere - O-Ringe ggf. austauschen oder länger ausheizen.`
  };
}
```

---

### 2.7 ESD (Electron Stimulated Desorption) Artefakte

**ESD erzeugt Ionen durch Elektronenbeschuss adsorbierter Moleküle am Ionisatorgitter, nicht durch Gas in der Kammer.**

#### Charakteristik

- Peaks bei m/z 1, 16, 19, 35 (H⁺, O⁺, F⁺, Cl⁺)
- Ungewöhnliche Verhältnisse (z.B. m28/m14 ≠ 7 für reines N₂)
- ESD-Ionen haben höhere kinetische Energie (~1 eV vs. 0.025 eV thermisch)

```typescript
function detectESDartifacts(spectrum: RGASpectrum, fieldAxisVoltage?: number): DiagnosticResult {
  const evidence: string[] = [];
  let confidence = 0;
  
  // ESD-typische Einzelatom-Peaks
  const m1 = spectrum.getPeakIntensity(1);    // H+
  const m16 = spectrum.getPeakIntensity(16);  // O+
  const m19 = spectrum.getPeakIntensity(19);  // F+
  const m35 = spectrum.getPeakIntensity(35);  // Cl+
  
  // Anomal hoher O+ Peak ohne entsprechenden O2 Peak
  const m32 = spectrum.getPeakIntensity(32);
  if (m16 > 0 && m32 > 0) {
    const ratio_16_32 = m16 / m32;
    if (ratio_16_32 > 0.5) {  // Normal: ~0.11-0.22
      evidence.push(`Anomal hoher O+-Peak: m16/m32 = ${ratio_16_32.toFixed(2)} (normal: ~0.15)`);
      confidence += 0.3;
    }
  }
  
  // F+ ohne entsprechende Fluorquelle
  if (m19 > spectrum.noiseFloor * 10) {
    const m69 = spectrum.getPeakIntensity(69);  // CF3+ von Fluorverbindungen
    if (m69 < m19) {
      evidence.push("F+ (m19) ohne CF3+ (m69) - ESD von adsorbierten Fluoriden");
      confidence += 0.3;
    }
  }
  
  // Anomales N2-Fragmentierungsverhältnis
  const m28 = spectrum.getPeakIntensity(28);
  const m14 = spectrum.getPeakIntensity(14);
  if (m28 > 0 && m14 > 0) {
    const ratio_28_14 = m28 / m14;
    if (ratio_28_14 < 5 || ratio_28_14 > 20) {
      evidence.push(`Anomales m28/m14: ${ratio_28_14.toFixed(1)} (N2 normal: ~14, CO: ~20)`);
      confidence += 0.2;
    }
  }
  
  return {
    type: DiagnosisType.ESD_ARTIFACT,
    confidence,
    evidence,
    recommendation: "Reduziere Field-Axis-Spannung zum Test. Degasse Ionisator mit 20mA/500eV. Führe Hintergrundmessung durch."
  };
}
```

---

### 2.8 Haupt-Diagnose-Pipeline

```typescript
function runFullDiagnosis(spectrum: RGASpectrum, timeData?: TimeSeriesData): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];
  
  // Alle Diagnosen durchführen
  results.push(detectAirLeak(spectrum));
  results.push(detectWaterOutgassing(spectrum));
  results.push(detectHydrogenOutgassing(spectrum));
  results.push(detectPumpOilBackstreaming(spectrum));
  results.push(detectFomblinOil(spectrum));
  results.push(detectSolventContamination(spectrum));
  results.push(detectESDartifacts(spectrum));
  
  if (timeData) {
    results.push(detectVirtualLeak(spectrum, timeData));
  }
  
  // Sortiere nach Konfidenz
  results.sort((a, b) => b.confidence - a.confidence);
  
  // Prüfe auf sauberes System
  const maxConfidence = results[0]?.confidence || 0;
  if (maxConfidence < 0.3) {
    results.unshift({
      type: DiagnosisType.CLEAN_SYSTEM,
      confidence: 1 - maxConfidence,
      evidence: ["Keine signifikanten Kontaminationen detektiert"],
      recommendation: "System erscheint sauber für UHV-Betrieb"
    });
  }
  
  return results;
}
```

---

## 3. Grenzwerte & Akzeptanzkriterien

### 3.1 Ausgasraten nach Bakeout

#### Referenzwerte (CERN, DESY, VACOM)

| Material | Behandlung | H₂-Ausgasrate (mbar·l·s⁻¹·cm⁻²) | Quelle |
|----------|------------|--------------------------------|--------|
| **SS 304/316 LN** | Unbehandelt | 10⁻⁶ - 10⁻⁸ | Allgemein |
| **SS 304/316 LN** | 150°C/24h Bakeout | 10⁻¹¹ - 10⁻¹² | CERN |
| **SS 304/316 LN** | 200°C/24h Bakeout | 10⁻¹² - 10⁻¹³ | CERN |
| **SS 304/316 LN** | 300°C/24h Bakeout | ~10⁻¹³ | CERN |
| **SS 304/316 LN** | Vakuumglühen 950°C/2h | <10⁻¹⁴ | CERN Standard |
| **OFS Kupfer** | 200°C/24h | <10⁻¹³ | CERN |
| **Aluminium** | 120°C/48h | 3.85×10⁻¹¹ Pa·l/s·cm² | HALF |
| **Aluminium** | 180°C/48h | 2.69×10⁻¹¹ Pa·l/s·cm² | HALF |
| **CuZr** | 120°C/48h | <10⁻¹¹ Pa·l/s·cm² | HALF |

**Hinweis:** 1 Pa·l/s·cm² = 0.01 mbar·l/s·cm² = 10⁻² mbar·l/s·cm²

---

### 3.2 Partialdruck-Grenzwerte für UHV-Systeme

#### 3.2.1 CERN LHC / Beschleuniger-Standard

| Gas | Grenzwert (nach Bakeout) | Bemerkung |
|-----|-------------------------|-----------|
| **H₂** | <10⁻¹⁰ mbar | Dominantes Restgas in ausgeheizten Systemen |
| **H₂O** | <10⁻¹¹ mbar | Nach 200°C Bakeout erreichbar |
| **CO/N₂** | <10⁻¹¹ mbar | CO dominiert über N₂ in sauberen Systemen |
| **CO₂** | <10⁻¹² mbar | Eine Größenordnung unter CO |
| **O₂** | <10⁻¹² mbar | Kein Leck wenn unter Grenzwert |
| **Kohlenwasserstoffe** | <10⁻¹² mbar | Summe aller CxHy |
| **Gesamtdruck** | <10⁻¹⁰ mbar | Nach 200°C/24h Bakeout |

#### 3.2.2 GSI SIS18/ESR Standard

| Parameter | SIS18 | ESR | Bemerkung |
|-----------|-------|-----|-----------|
| Totaldruck (Ziel) | <10⁻¹¹ mbar | <10⁻¹¹ mbar | Statische Bedingungen |
| Ar-Anteil | <2% | <1% | Kritisch für Strahllebensdauer |
| Bakeout-Temperatur | ~180°C | >200°C | ESR besser ausheizbar |
| Strahllebensdauer | >10 s | >50 s | Bei 7.6 MeV/u ¹³²Xe¹⁸⁺ |

#### 3.2.3 XHV (Extreme High Vacuum) Kriterien

| Druckbereich | Bezeichnung | Typische Zusammensetzung |
|--------------|-------------|-------------------------|
| 10⁻⁹ - 10⁻¹⁰ mbar | UHV | H₂ dominant nach Bakeout |
| 10⁻¹⁰ - 10⁻¹² mbar | XHV | >99% H₂, Rest CO |
| <10⁻¹² mbar | Extrem-XHV | NEG-Coating erforderlich |

---

### 3.3 Akzeptanzkriterien für Vakuumkomponenten

#### 3.3.1 RGA-Spektrum-Bewertung

```typescript
interface AcceptanceCriteria {
  totalPressure: number;           // mbar
  h2_partial: number;              // mbar
  h2o_partial: number;             // mbar
  co_n2_partial: number;           // mbar
  co2_partial: number;             // mbar
  o2_partial: number;              // mbar
  hydrocarbons_partial: number;    // mbar
  ar_fraction: number;             // %
}

const UHV_ACCEPTANCE: AcceptanceCriteria = {
  totalPressure: 1e-9,
  h2_partial: 5e-10,
  h2o_partial: 1e-10,
  co_n2_partial: 1e-10,
  co2_partial: 1e-11,
  o2_partial: 1e-11,
  hydrocarbons_partial: 1e-11,
  ar_fraction: 1.0  // <1% von Totaldruck
};

const CLEAN_UHV_ACCEPTANCE: AcceptanceCriteria = {
  totalPressure: 1e-10,
  h2_partial: 5e-11,
  h2o_partial: 5e-12,
  co_n2_partial: 5e-12,
  co2_partial: 5e-13,
  o2_partial: 5e-13,
  hydrocarbons_partial: 1e-13,
  ar_fraction: 0.1
};

function evaluateAcceptance(
  spectrum: RGASpectrum, 
  criteria: AcceptanceCriteria
): { passed: boolean; failures: string[] } {
  const failures: string[] = [];
  
  const totalP = spectrum.getTotalPressure();
  if (totalP > criteria.totalPressure) {
    failures.push(`Totaldruck ${totalP.toExponential(2)} > ${criteria.totalPressure.toExponential(1)} mbar`);
  }
  
  const pH2 = spectrum.getPartialPressure(2);
  if (pH2 > criteria.h2_partial) {
    failures.push(`H2 ${pH2.toExponential(2)} > ${criteria.h2_partial.toExponential(1)} mbar`);
  }
  
  const pH2O = spectrum.getPartialPressure(18);
  if (pH2O > criteria.h2o_partial) {
    failures.push(`H2O ${pH2O.toExponential(2)} > ${criteria.h2o_partial.toExponential(1)} mbar`);
  }
  
  // ... weitere Prüfungen
  
  return { passed: failures.length === 0, failures };
}
```

---

### 3.4 Leckraten-Grenzwerte

| Lecktyp | Grenzwert | Testmethode |
|---------|-----------|-------------|
| **Gesamtleckrate (UHV)** | <10⁻¹⁰ mbar·l/s | He-Lecktest (integral) |
| **Einzelleck (UHV)** | <10⁻¹¹ mbar·l/s | He-Lecktest (punktuell) |
| **HV-Systeme** | <10⁻⁸ mbar·l/s | He-Lecktest |
| **Dichtung (CF)** | <10⁻¹² mbar·l/s | Spezifikation |

---

### 3.5 Bakeout-Protokoll und Validierung

#### Standard-Bakeout-Profil (CERN)

```typescript
interface BakeoutProfile {
  rampRate: number;        // °C/h (max 50°C/h empfohlen)
  targetTemp: number;      // °C
  holdTime: number;        // Stunden
  cooldownRate: number;    // °C/h
}

const STANDARD_BAKEOUT: BakeoutProfile = {
  rampRate: 30,
  targetTemp: 200,
  holdTime: 24,
  cooldownRate: 20
};

const ENHANCED_BAKEOUT: BakeoutProfile = {
  rampRate: 30,
  targetTemp: 300,
  holdTime: 48,
  cooldownRate: 20
};
```

#### Validierungskriterien nach Bakeout

1. **Druckabfall**: Druck muss innerhalb 1h nach Abkühlung auf <10⁻⁹ mbar fallen
2. **RGA-Spektrum**: H₂ dominant, H₂O < H₂, keine Kohlenwasserstoffe
3. **Reproduzierbarkeit**: Bei erneutem Belüften/Evakuieren gleicher Enddruck

---

### 3.6 Typische RGA-Spektren als Referenz

#### 3.6.1 Unbeheiztes System (~10⁻⁸ mbar)

Dominante Peaks (relativ):
- m/z 18 (H₂O): 100%
- m/z 28 (N₂): 20-50%
- m/z 2 (H₂): 10-20%
- m/z 44 (CO₂): 5-10%

#### 3.6.2 Nach Bakeout 200°C/24h (~10⁻¹⁰ mbar)

Dominante Peaks (relativ):
- m/z 2 (H₂): 100%
- m/z 28 (CO): 5-15%
- m/z 44 (CO₂): 1-5%
- m/z 18 (H₂O): <5%

#### 3.6.3 Sauberes XHV-System (<10⁻¹¹ mbar)

Dominante Peaks (relativ):
- m/z 2 (H₂): 100%
- m/z 28 (CO): <5%
- Alle anderen: <1%

---

## 4. Implementierungshinweise

### 4.1 Sensitivitätsfaktoren

Die Ionenströme müssen mit relativen Sensitivitätsfaktoren korrigiert werden:

| Gas | Relative Sensitivität (N₂ = 1.0) |
|-----|----------------------------------|
| H₂ | 0.44 |
| He | 0.14 |
| Ne | 0.23 |
| N₂ | 1.00 |
| O₂ | 0.86 |
| Ar | 1.20 |
| CO | 1.05 |
| CO₂ | 1.40 |
| H₂O | 0.90 |
| CH₄ | 1.60 |
| Kr | 1.70 |
| Xe | 3.00 |

### 4.2 Kalibrierung

Für quantitative Messungen ist eine Vor-Ort-Kalibrierung erforderlich:

1. Injiziere bekanntes Gas (z.B. N₂, Ar)
2. Messe Ionenstrom am Hauptpeak
3. Bestimme Sensitivitätsfaktor: S = I / P
4. Wiederhole für alle relevanten Gase

### 4.3 Detektorgrenzen

| Detektor | Noise Floor | Max. Druck | Dynamikbereich |
|----------|-------------|------------|----------------|
| Faraday Cup | ~10⁻¹⁰ mbar | 10⁻⁴ mbar | 6 Dekaden |
| SEM (Multiplier) | ~10⁻¹⁴ mbar | 10⁻⁸ mbar | 6 Dekaden |
| Kombiniert | ~10⁻¹⁴ mbar | 10⁻⁴ mbar | 10 Dekaden |

---

## 5. Referenzen

1. CERN CAS Tutorial on RGA - Interpretation of RGA Spectra (B. Jenninger, P. Chiggiato)
2. CERN Outgassing Properties of Vacuum Materials (P. Chiggiato, 2020)
3. SRS Application Note: Residual Gas Analysis Basics
4. SRS Application Note #7: Vacuum Diagnosis with an RGA
5. Kurt J. Lesker Technical Notes: RGA Spectra Interpretation
6. Hiden Analytical: Cracking Patterns Database
7. NIST Chemistry WebBook - Mass Spectra Database
8. GSI Vacuum Group: SIS18/ESR UHV Requirements
9. DESY UHV Guidelines
10. Pfeiffer Vacuum Knowledge Book
11. VACOM White Paper: Outgassing Rates

---

*Diese Wissensdatenbank dient als Backend-Referenz für automatisierte RGA-Spektrenanalyse. Die Cracking Patterns und Diagnose-Algorithmen basieren auf etablierten Industriestandards und Forschungseinrichtungen.*
