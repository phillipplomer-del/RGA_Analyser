# RGA Analyser - Implementierungsanleitung für fehlende Features

## Übersicht

Diese Datei enthält alle fehlenden Elemente der RGA Analyser App, die basierend auf einer Analyse von vier KI-Wissensdatenbanken (ChatGPT, Claude, Gemini, Grok) identifiziert wurden. Implementiere diese Ergänzungen in der bestehenden App-Struktur.

---

## 1. Fehlende Cracking Patterns

### 1.1 Ammoniak (NH₃) - KRITISCH

```typescript
const AMMONIA_PATTERN: CrackingPattern = {
  formula: "NH3",
  name: "Ammoniak",
  molecularMass: 17,
  principalMass: 17,
  fragments: [
    { mass: 17, relativeIntensity: 100.0, ion: "NH3+" },
    { mass: 16, relativeIntensity: 80.0, ion: "NH2+" },
    { mass: 15, relativeIntensity: 7.5, ion: "NH+" },
    { mass: 14, relativeIntensity: 2.0, ion: "N+" }
  ],
  relativeSensitivity: 1.3,
  notes: "Kann mit H2O/OH überlappen. Prüfe 17/18 Verhältnis: >0.3 deutet auf NH3"
};
```

### 1.2 Methan (CH₄) - KRITISCH

```typescript
const METHANE_PATTERN: CrackingPattern = {
  formula: "CH4",
  name: "Methan",
  molecularMass: 16,
  principalMass: 16,
  fragments: [
    { mass: 16, relativeIntensity: 100.0, ion: "CH4+" },
    { mass: 15, relativeIntensity: 85.0, ion: "CH3+" },
    { mass: 14, relativeIntensity: 16.0, ion: "CH2+" },
    { mass: 13, relativeIntensity: 8.0, ion: "CH+" },
    { mass: 12, relativeIntensity: 3.8, ion: "C+" },
    { mass: 1, relativeIntensity: 4.0, ion: "H+" }
  ],
  relativeSensitivity: 1.6,
  notes: "m/z 16 überlagert mit O+. Nutze m/z 15 als sauberen Indikator für CH4"
};
```

### 1.3 Schwefelwasserstoff (H₂S)

```typescript
const H2S_PATTERN: CrackingPattern = {
  formula: "H2S",
  name: "Schwefelwasserstoff",
  molecularMass: 34,
  principalMass: 34,
  fragments: [
    { mass: 34, relativeIntensity: 100.0, ion: "H2S+" },
    { mass: 33, relativeIntensity: 42.0, ion: "HS+" },
    { mass: 32, relativeIntensity: 44.0, ion: "S+" },
    { mass: 36, relativeIntensity: 4.5, ion: "H2-34S+", isotope: true }
  ],
  relativeSensitivity: 1.2,
  notes: "m/z 32 überlagert mit O2. Prüfe 34/32 Verhältnis zur Unterscheidung"
};
```

### 1.4 Schwefeldioxid (SO₂)

```typescript
const SO2_PATTERN: CrackingPattern = {
  formula: "SO2",
  name: "Schwefeldioxid",
  molecularMass: 64,
  principalMass: 64,
  fragments: [
    { mass: 64, relativeIntensity: 100.0, ion: "SO2+" },
    { mass: 48, relativeIntensity: 49.0, ion: "SO+" },
    { mass: 32, relativeIntensity: 10.0, ion: "S+" },
    { mass: 16, relativeIntensity: 5.0, ion: "O+" },
    { mass: 66, relativeIntensity: 5.0, ion: "34S-O2+", isotope: true }
  ],
  relativeSensitivity: 1.4,
  notes: "Schwefelindikator. m/z 48 (SO+) ist charakteristisch"
};
```

### 1.5 Ethanol (C₂H₅OH)

```typescript
const ETHANOL_PATTERN: CrackingPattern = {
  formula: "C2H5OH",
  name: "Ethanol",
  molecularMass: 46,
  principalMass: 31,
  fragments: [
    { mass: 31, relativeIntensity: 100.0, ion: "CH2OH+" },
    { mass: 45, relativeIntensity: 52.0, ion: "C2H5O+" },
    { mass: 46, relativeIntensity: 22.0, ion: "C2H5OH+" },
    { mass: 29, relativeIntensity: 30.0, ion: "CHO+" },
    { mass: 27, relativeIntensity: 22.0, ion: "C2H3+" },
    { mass: 43, relativeIntensity: 8.0, ion: "C2H3O+" }
  ],
  relativeSensitivity: 3.6,
  notes: "Lösemittel-Rückstand. Base Peak bei 31, nicht 46 (Parent)"
};
```

### 1.6 Methanol (CH₃OH)

```typescript
const METHANOL_PATTERN: CrackingPattern = {
  formula: "CH3OH",
  name: "Methanol",
  molecularMass: 32,
  principalMass: 31,
  fragments: [
    { mass: 31, relativeIntensity: 100.0, ion: "CHO+" },
    { mass: 32, relativeIntensity: 67.0, ion: "CH3OH+" },
    { mass: 29, relativeIntensity: 65.0, ion: "CHO+" },
    { mass: 28, relativeIntensity: 3.4, ion: "CO+" },
    { mass: 15, relativeIntensity: 12.0, ion: "CH3+" }
  ],
  relativeSensitivity: 1.8,
  notes: "Überlagert mit O2 bei m/z 32. Prüfe m/z 31 und 29"
};
```

### 1.7 Benzol (C₆H₆)

```typescript
const BENZENE_PATTERN: CrackingPattern = {
  formula: "C6H6",
  name: "Benzol",
  molecularMass: 78,
  principalMass: 78,
  fragments: [
    { mass: 78, relativeIntensity: 100.0, ion: "C6H6+" },
    { mass: 77, relativeIntensity: 22.0, ion: "C6H5+" },
    { mass: 52, relativeIntensity: 19.0, ion: "C4H4+" },
    { mass: 51, relativeIntensity: 19.0, ion: "C4H3+" },
    { mass: 50, relativeIntensity: 17.0, ion: "C4H2+" },
    { mass: 39, relativeIntensity: 15.0, ion: "C3H3+" }
  ],
  relativeSensitivity: 5.9,
  notes: "Aromaten-Kontamination. Sehr hohe Empfindlichkeit"
};
```

### 1.8 Toluol (C₇H₈)

```typescript
const TOLUENE_PATTERN: CrackingPattern = {
  formula: "C7H8",
  name: "Toluol",
  molecularMass: 92,
  principalMass: 91,
  fragments: [
    { mass: 91, relativeIntensity: 100.0, ion: "C7H7+" },
    { mass: 92, relativeIntensity: 69.0, ion: "C7H8+" },
    { mass: 65, relativeIntensity: 16.0, ion: "C5H5+" },
    { mass: 51, relativeIntensity: 10.0, ion: "C4H3+" },
    { mass: 39, relativeIntensity: 14.0, ion: "C3H3+" }
  ],
  relativeSensitivity: 6.2,
  notes: "Aromaten. Base Peak bei 91 (Tropylium-Kation), nicht Parent"
};
```

### 1.9 Propan (C₃H₈)

```typescript
const PROPANE_PATTERN: CrackingPattern = {
  formula: "C3H8",
  name: "Propan",
  molecularMass: 44,
  principalMass: 29,
  fragments: [
    { mass: 29, relativeIntensity: 100.0, ion: "C2H5+" },
    { mass: 28, relativeIntensity: 59.0, ion: "C2H4+" },
    { mass: 27, relativeIntensity: 42.0, ion: "C2H3+" },
    { mass: 44, relativeIntensity: 28.0, ion: "C3H8+" },
    { mass: 43, relativeIntensity: 23.0, ion: "C3H7+" },
    { mass: 41, relativeIntensity: 13.0, ion: "C3H5+" },
    { mass: 39, relativeIntensity: 19.0, ion: "C3H3+" }
  ],
  relativeSensitivity: 2.4,
  notes: "Überlagert m/z 28 und 44. Kann CO2 vortäuschen"
};
```

### 1.10 Ethan (C₂H₆)

```typescript
const ETHANE_PATTERN: CrackingPattern = {
  formula: "C2H6",
  name: "Ethan",
  molecularMass: 30,
  principalMass: 28,
  fragments: [
    { mass: 28, relativeIntensity: 100.0, ion: "C2H4+" },
    { mass: 27, relativeIntensity: 33.0, ion: "C2H3+" },
    { mass: 30, relativeIntensity: 26.0, ion: "C2H6+" },
    { mass: 29, relativeIntensity: 22.0, ion: "C2H5+" },
    { mass: 26, relativeIntensity: 23.0, ion: "C2H2+" }
  ],
  relativeSensitivity: 2.1,
  notes: "Überlagert m/z 28. Kann N2/CO verfälschen"
};
```

### 1.11 Turbopumpenöl (spezifisch)

```typescript
const TURBOPUMP_OIL_PATTERN: CrackingPattern = {
  formula: "CxHy",
  name: "Turbopumpenöl",
  molecularMass: 0,
  principalMass: 43,
  fragments: [
    { mass: 43, relativeIntensity: 100.0, ion: "C3H7+" },
    { mass: 57, relativeIntensity: 88.0, ion: "C4H9+" },
    { mass: 41, relativeIntensity: 76.0, ion: "C3H5+" },
    { mass: 55, relativeIntensity: 73.0, ion: "C4H7+" },
    { mass: 71, relativeIntensity: 52.0, ion: "C5H11+" },
    { mass: 69, relativeIntensity: 35.0, ion: "C5H9+" },
    { mass: 85, relativeIntensity: 25.0, ion: "C6H13+" }
  ],
  relativeSensitivity: 4.0,
  notes: "Unterschied zu Vorpumpenöl: 71 deutlich höher (~52% vs ~20%)"
};
```

### 1.12 Diffusionspumpenöl DC705

```typescript
const DC705_OIL_PATTERN: CrackingPattern = {
  formula: "C24H50O4Si5",
  name: "Diffusionspumpenöl DC705",
  molecularMass: 546,
  principalMass: 78,
  fragments: [
    { mass: 78, relativeIntensity: 100.0, ion: "C6H6+" },
    { mass: 76, relativeIntensity: 83.0, ion: "SiC2H4O2+" },
    { mass: 39, relativeIntensity: 73.0, ion: "C3H3+" },
    { mass: 43, relativeIntensity: 59.0, ion: "C2H3O+" },
    { mass: 91, relativeIntensity: 32.0, ion: "C7H7+" },
    { mass: 73, relativeIntensity: 25.0, ion: "Si(CH3)3+" }
  ],
  relativeSensitivity: 4.0,
  notes: "Silikonöl. m/z 73 (Trimethylsilyl) ist Silikon-Marker"
};
```

---

## 2. Erweiterte Massentabelle (m/z 1-100)

Füge diese fehlenden Massen zur bestehenden Tabelle hinzu:

```typescript
const EXTENDED_MASS_REFERENCE: MassAssignment[] = [
  // Bereits vorhanden übersprungen, nur neue Einträge
  
  { mass: 13, primaryAssignment: "CH+", diagnosticValue: "MEDIUM",
    secondaryAssignments: ["Fragment von CH4, HC"],
    notes: "Methan-Fragment" },
  
  { mass: 15, primaryAssignment: "CH3+", diagnosticValue: "CRITICAL",
    secondaryAssignments: ["NH+", "Fragment von CH4, HC"],
    notes: "WICHTIG: Sauberer Methan-Nachweis, da m/z 16 mit O+ überlagert" },
  
  { mass: 22, primaryAssignment: "CO2²+/²²Ne", diagnosticValue: "MEDIUM",
    secondaryAssignments: ["Doppelionisation von CO2", "Neon-Isotop"],
    notes: "CO2²+ ca. 2% von m/z 44" },
  
  { mass: 26, primaryAssignment: "C2H2+", diagnosticValue: "MEDIUM",
    secondaryAssignments: ["Acetylen", "Öl-Zersetzung"],
    notes: "Teil der HC-Gruppe" },
  
  { mass: 27, primaryAssignment: "C2H3+", diagnosticValue: "HIGH",
    secondaryAssignments: ["HCN+", "Fragment von Ethanol, HC"],
    notes: "Sehr häufiges HC-Fragment" },
  
  { mass: 30, primaryAssignment: "NO+/C2H6+", diagnosticValue: "MEDIUM",
    secondaryAssignments: ["Stickoxid", "Ethan", "SiH2+"],
    notes: "NO entsteht bei Reaktionen am heißen Filament" },
  
  { mass: 33, primaryAssignment: "HS+", diagnosticValue: "MEDIUM",
    secondaryAssignments: ["H2S-Fragment"],
    notes: "Schwefelwasserstoff-Indikator" },
  
  { mass: 34, primaryAssignment: "H2S+", diagnosticValue: "HIGH",
    secondaryAssignments: ["PH3", "18O-16O"],
    notes: "Schwefelwasserstoff-Hauptpeak" },
  
  { mass: 36, primaryAssignment: "HCl+/³⁶Ar+", diagnosticValue: "MEDIUM",
    secondaryAssignments: ["Salzsäure", "Argon-Isotop (0.34%)"],
    notes: "Argon-Isotop bestätigt Luftleck" },
  
  { mass: 38, primaryAssignment: "³⁸Ar+", diagnosticValue: "LOW",
    secondaryAssignments: ["Argon-Isotop (0.063%)", "Fluorverbindungen"],
    notes: "Schwaches Argon-Isotop" },
  
  { mass: 39, primaryAssignment: "C3H3+/K+", diagnosticValue: "HIGH",
    secondaryAssignments: ["HC-Fragment", "Kalium"],
    notes: "Starker Öl-Indikator" },
  
  { mass: 46, primaryAssignment: "C2H5OH+/NO2+", diagnosticValue: "MEDIUM",
    secondaryAssignments: ["Ethanol-Parent", "Stickstoffdioxid"],
    notes: "Ethanol-Molekülion" },
  
  { mass: 48, primaryAssignment: "SO+", diagnosticValue: "HIGH",
    secondaryAssignments: ["SO2-Fragment"],
    notes: "Charakteristisch für Schwefelverbindungen" },
  
  { mass: 55, primaryAssignment: "C4H7+", diagnosticValue: "CRITICAL",
    secondaryAssignments: ["Öl-Fragment"],
    notes: "PUMPENÖL-MARKER (Teil der Δ14 Sequenz)" },
  
  { mass: 64, primaryAssignment: "SO2+", diagnosticValue: "HIGH",
    secondaryAssignments: ["S2+"],
    notes: "Schwefeldioxid-Hauptpeak" },
  
  { mass: 71, primaryAssignment: "C5H11+", diagnosticValue: "CRITICAL",
    secondaryAssignments: ["Öl-Fragment"],
    notes: "PUMPENÖL-MARKER. Turbopumpenöl: ~52%, Vorpumpenöl: ~20%" },
  
  { mass: 73, primaryAssignment: "Si(CH3)3+", diagnosticValue: "CRITICAL",
    secondaryAssignments: ["Trimethylsilyl", "PDMS-Fragment"],
    notes: "SILIKON-MARKER. Diffusionspumpenöl, Silikonfett" },
  
  { mass: 78, primaryAssignment: "C6H6+", diagnosticValue: "HIGH",
    secondaryAssignments: ["Benzol", "DC705-Fragment"],
    notes: "Aromaten-Marker" },
  
  { mass: 83, primaryAssignment: "C6H11+", diagnosticValue: "HIGH",
    secondaryAssignments: ["⁸³Kr", "Öl-Fragment"],
    notes: "Öl-Marker oder Krypton" },
  
  { mass: 85, primaryAssignment: "C6H13+", diagnosticValue: "HIGH",
    secondaryAssignments: ["CCl2F+", "Öl-Fragment"],
    notes: "Öl-Marker oder Freon" },
  
  { mass: 91, primaryAssignment: "C7H7+", diagnosticValue: "HIGH",
    secondaryAssignments: ["Tropylium/Benzyl", "DC705-Fragment"],
    notes: "Toluol Base Peak, Aromaten-Marker" },
  
  { mass: 97, primaryAssignment: "C2Cl3+", diagnosticValue: "HIGH",
    secondaryAssignments: ["Trichlorethylen-Hauptpeak"],
    notes: "TCE-Marker mit Cl-Isotopenmuster" },
  
  { mass: 99, primaryAssignment: "C2³⁷Cl³⁵Cl2+", diagnosticValue: "MEDIUM",
    secondaryAssignments: ["TCE-Isotopenpeak"],
    notes: "TCE-Bestätigung durch Cl-Isotope" }
];
```

---

## 3. Neue Diagnose-Kriterien

### 3.1 Ammoniak-Kontamination (AMMONIA_CONTAMINATION)

```typescript
interface AmmoniaDiagnosis {
  type: "AMMONIA_CONTAMINATION";
  criteria: {
    // Primärkriterium: OH/H2O Verhältnis anomal hoch
    primary: {
      formula: "Peak(17)/Peak(18) > 0.30";
      threshold: 0.30;
      description: "Normales H2O-Pattern: 17/18 ≈ 0.23. Bei >0.30 NH3 wahrscheinlich";
    };
    // Sekundärkriterium: NH2+ Fragment
    secondary: {
      formula: "Peak(16)/Peak(17) ≈ 0.80";
      range: [0.6, 1.0];
      description: "NH3 hat starkes m/z 16 Fragment";
    };
  };
  affectedMasses: [14, 15, 16, 17];
  recommendation: "NH3-Quelle identifizieren: Prozessgas, Reinigungsmittel, biologische Kontamination";
}
```

**Implementierung:**

```typescript
function detectAmmonia(spectrum: RGASpectrum): DiagnosticResult {
  const m17 = spectrum.getPeakIntensity(17);
  const m18 = spectrum.getPeakIntensity(18);
  const m16 = spectrum.getPeakIntensity(16);
  const m15 = spectrum.getPeakIntensity(15);
  
  const evidence: string[] = [];
  let confidence = 0;
  
  // Hauptkriterium: Anomales 17/18 Verhältnis
  if (m18 > 0) {
    const ratio_17_18 = m17 / m18;
    if (ratio_17_18 > 0.30) {
      evidence.push(`OH/H2O Verhältnis (m17/m18): ${ratio_17_18.toFixed(2)} > 0.30 (H2O normal: ~0.23)`);
      confidence += 0.5;
      
      if (ratio_17_18 > 0.40) {
        evidence.push("Starker NH3-Überschuss");
        confidence += 0.2;
      }
    }
  }
  
  // Sekundärkriterium: NH2+ Fragment bei m/z 16
  if (m17 > 0) {
    const ratio_16_17 = m16 / m17;
    if (ratio_16_17 >= 0.6 && ratio_16_17 <= 1.0) {
      evidence.push(`NH2/NH3 Verhältnis (m16/m17): ${ratio_16_17.toFixed(2)} (NH3 typisch: ~0.8)`);
      confidence += 0.2;
    }
  }
  
  // Zusatz: Prüfe ob m/z 15 (NH+) vorhanden
  if (m15 > spectrum.noiseFloor * 3 && m17 > 0) {
    const ratio_15_17 = m15 / m17;
    if (ratio_15_17 >= 0.05 && ratio_15_17 <= 0.12) {
      evidence.push(`NH+ Fragment detektiert (m15/m17): ${ratio_15_17.toFixed(2)}`);
      confidence += 0.1;
    }
  }
  
  return {
    type: "AMMONIA_CONTAMINATION",
    confidence: Math.min(confidence, 1.0),
    evidence,
    affectedMasses: [14, 15, 16, 17],
    recommendation: confidence > 0.5 
      ? "NH3-Quelle identifizieren: Prozessgas, Reinigungsmittel, Pumpenöl-Zersetzung"
      : "Kein signifikanter NH3-Nachweis"
  };
}
```

### 3.2 Methan-Kontamination (METHANE_CONTAMINATION)

```typescript
function detectMethane(spectrum: RGASpectrum): DiagnosticResult {
  const m16 = spectrum.getPeakIntensity(16);
  const m15 = spectrum.getPeakIntensity(15);
  const m14 = spectrum.getPeakIntensity(14);
  const m13 = spectrum.getPeakIntensity(13);
  const m32 = spectrum.getPeakIntensity(32);
  
  const evidence: string[] = [];
  let confidence = 0;
  
  // Hauptkriterium: m/z 15 (CH3+) als sauberer Indikator
  // Da m/z 16 von O+ überlagert sein kann
  if (m15 > spectrum.noiseFloor * 10) {
    evidence.push(`CH3+ (m/z 15) signifikant: ${m15.toExponential(2)}`);
    confidence += 0.4;
    
    // CH4-Pattern prüfen: 15/16 ≈ 0.85
    if (m16 > 0) {
      const ratio_15_16 = m15 / m16;
      if (ratio_15_16 >= 0.7 && ratio_15_16 <= 1.0) {
        evidence.push(`CH3/CH4 Verhältnis: ${ratio_15_16.toFixed(2)} (CH4 typisch: ~0.85)`);
        confidence += 0.3;
      }
    }
  }
  
  // Sekundär: CH2+ bei m/z 14
  if (m14 > 0 && m15 > 0) {
    const ratio_14_15 = m14 / m15;
    if (ratio_14_15 >= 0.15 && ratio_14_15 <= 0.25) {
      evidence.push(`CH2+ Fragment bestätigt (m14/m15): ${ratio_14_15.toFixed(2)}`);
      confidence += 0.2;
    }
  }
  
  // Ausschluss: Wenn viel O2, dann ist m/z 16 eher O+
  if (m32 > m16 * 5) {
    confidence *= 0.5;
    evidence.push("Warnung: Hoher O2-Anteil, m/z 16 könnte O+ sein");
  }
  
  return {
    type: "METHANE_CONTAMINATION",
    confidence: Math.min(confidence, 1.0),
    evidence,
    affectedMasses: [12, 13, 14, 15, 16],
    recommendation: confidence > 0.5
      ? "Methan-Quelle: Organische Zersetzung, Prozessgas, RGA-Filament-Reaktion"
      : "Kein signifikanter CH4-Nachweis"
  };
}
```

### 3.3 Schwefelverbindungen (SULFUR_CONTAMINATION)

```typescript
function detectSulfurCompounds(spectrum: RGASpectrum): DiagnosticResult {
  const m34 = spectrum.getPeakIntensity(34);  // H2S
  const m33 = spectrum.getPeakIntensity(33);  // HS+
  const m32 = spectrum.getPeakIntensity(32);  // S+ oder O2
  const m64 = spectrum.getPeakIntensity(64);  // SO2
  const m48 = spectrum.getPeakIntensity(48);  // SO+
  
  const evidence: string[] = [];
  let confidence = 0;
  let sulfurType = "";
  
  // H2S Detektion
  if (m34 > spectrum.noiseFloor * 5) {
    evidence.push(`H2S Hauptpeak (m/z 34) detektiert`);
    confidence += 0.4;
    sulfurType = "H2S";
    
    // HS+ Fragment prüfen
    if (m33 > 0) {
      const ratio_33_34 = m33 / m34;
      if (ratio_33_34 >= 0.3 && ratio_33_34 <= 0.5) {
        evidence.push(`HS+ Fragment bestätigt (m33/m34): ${ratio_33_34.toFixed(2)}`);
        confidence += 0.2;
      }
    }
  }
  
  // SO2 Detektion
  if (m64 > spectrum.noiseFloor * 5) {
    evidence.push(`SO2 Hauptpeak (m/z 64) detektiert`);
    confidence += 0.4;
    sulfurType = sulfurType ? `${sulfurType} + SO2` : "SO2";
    
    // SO+ Fragment bei m/z 48
    if (m48 > 0) {
      const ratio_48_64 = m48 / m64;
      if (ratio_48_64 >= 0.4 && ratio_48_64 <= 0.6) {
        evidence.push(`SO+ Fragment bestätigt (m48/m64): ${ratio_48_64.toFixed(2)}`);
        confidence += 0.2;
      }
    }
  }
  
  return {
    type: "SULFUR_CONTAMINATION",
    confidence: Math.min(confidence, 1.0),
    evidence,
    affectedMasses: [32, 33, 34, 48, 64, 66],
    subtype: sulfurType,
    recommendation: confidence > 0.5
      ? `${sulfurType}-Kontamination. Quellen: Vorpumpenöl-Zersetzung, Prozessgas, biologische Kontamination`
      : "Keine Schwefelverbindungen detektiert"
  };
}
```

### 3.4 Aromaten-Kontamination (AROMATIC_CONTAMINATION)

```typescript
function detectAromaticCompounds(spectrum: RGASpectrum): DiagnosticResult {
  const m78 = spectrum.getPeakIntensity(78);   // Benzol
  const m77 = spectrum.getPeakIntensity(77);   // C6H5+
  const m91 = spectrum.getPeakIntensity(91);   // Toluol (Tropylium)
  const m92 = spectrum.getPeakIntensity(92);   // Toluol Parent
  const m51 = spectrum.getPeakIntensity(51);   // C4H3+
  const m52 = spectrum.getPeakIntensity(52);   // C4H4+
  const m39 = spectrum.getPeakIntensity(39);   // C3H3+
  
  const evidence: string[] = [];
  let confidence = 0;
  let aromaticType = "";
  
  // Benzol Detektion
  if (m78 > spectrum.noiseFloor * 5) {
    evidence.push(`Benzol-Peak (m/z 78) detektiert`);
    confidence += 0.4;
    aromaticType = "Benzol";
    
    // Benzol-Fragmente prüfen
    if (m77 > 0 && m52 > 0 && m51 > 0) {
      const ratio_77_78 = m77 / m78;
      if (ratio_77_78 >= 0.15 && ratio_77_78 <= 0.30) {
        evidence.push(`Benzol-Pattern bestätigt (m77/m78): ${ratio_77_78.toFixed(2)}`);
        confidence += 0.2;
      }
    }
  }
  
  // Toluol Detektion
  if (m91 > spectrum.noiseFloor * 5) {
    evidence.push(`Toluol/Tropylium-Peak (m/z 91) detektiert`);
    confidence += 0.4;
    aromaticType = aromaticType ? `${aromaticType} + Toluol` : "Toluol";
    
    // Toluol-Pattern: 92/91 ≈ 0.69
    if (m92 > 0) {
      const ratio_92_91 = m92 / m91;
      if (ratio_92_91 >= 0.5 && ratio_92_91 <= 0.9) {
        evidence.push(`Toluol-Pattern bestätigt (m92/m91): ${ratio_92_91.toFixed(2)}`);
        confidence += 0.2;
      }
    }
  }
  
  // Allgemeine Aromaten-Fragmente
  if (m39 > spectrum.noiseFloor * 10 && m51 > spectrum.noiseFloor * 5) {
    evidence.push("Aromaten-Fragmente (m39, m51) vorhanden");
    confidence += 0.1;
  }
  
  return {
    type: "AROMATIC_CONTAMINATION",
    confidence: Math.min(confidence, 1.0),
    evidence,
    affectedMasses: [39, 50, 51, 52, 65, 77, 78, 91, 92],
    subtype: aromaticType,
    recommendation: confidence > 0.5
      ? `${aromaticType}-Kontamination. Quellen: Lösemittel, Diffusionspumpenöl, Kunststoffe`
      : "Keine Aromaten detektiert"
  };
}
```

### 3.5 Virtuelles Leck - Erweiterte Diagnose (VIRTUAL_LEAK)

```typescript
interface VirtualLeakTimeData {
  pressureOverTime: Array<{timestamp: number, pressure: number}>;
  temperatureCorrelation?: boolean;
  heliumTestNegative?: boolean;
  ventCycles?: number;
}

function detectVirtualLeakExtended(
  spectrum: RGASpectrum, 
  timeData?: VirtualLeakTimeData
): DiagnosticResult {
  const evidence: string[] = [];
  let confidence = 0;
  
  // Spektrale Analyse (wie Luftleck, aber mit Unterschieden)
  const airLeakResult = detectAirLeak(spectrum);
  
  // 1. Luft-ähnliche Zusammensetzung
  if (airLeakResult.confidence > 0.3 && airLeakResult.confidence < 0.8) {
    evidence.push("Luft-ähnliche Gaszusammensetzung (aber nicht perfekt)");
    confidence += 0.2;
  }
  
  // 2. Erhöhter H2O-Anteil (typisch für virtuelles Leck)
  const m18 = spectrum.getPeakIntensity(18);
  const m32 = spectrum.getPeakIntensity(32);
  if (m18 > 0 && m32 > 0) {
    const ratio_h2o_o2 = m18 / m32;
    if (ratio_h2o_o2 > 2) {
      evidence.push(`Erhöhter H2O/O2-Anteil: ${ratio_h2o_o2.toFixed(1)} (>2 typisch für virtuelles Leck)`);
      confidence += 0.2;
    }
  }
  
  // 3. Argon fehlt oder sehr niedrig
  const m40 = spectrum.getPeakIntensity(40);
  const m28 = spectrum.getPeakIntensity(28);
  if (m40 < m28 * 0.005) {  // Weniger als 0.5% von N2
    evidence.push("Argon fehlt oder sehr niedrig (typisch für virtuelles Leck)");
    confidence += 0.2;
  }
  
  // Zeitbasierte Analyse (wenn verfügbar)
  if (timeData) {
    // 4. Exponentieller Druckabfall beim Pumpen
    if (fitsExponentialDecay(timeData.pressureOverTime)) {
      evidence.push("Exponentieller Druckabfall beim Pumpen (Zeitkonstante > Minuten)");
      confidence += 0.2;
    }
    
    // 5. He-Lecktest negativ
    if (timeData.heliumTestNegative) {
      evidence.push("He-Lecktest negativ trotz erhöhtem Druck");
      confidence += 0.3;
    }
    
    // 6. Temperaturkorrelation
    if (timeData.temperatureCorrelation) {
      evidence.push("Druckanstieg korreliert mit Temperaturerhöhung");
      confidence += 0.2;
    }
    
    // 7. Reproduzierbares Verhalten nach Vent-Zyklen
    if (timeData.ventCycles && timeData.ventCycles > 1) {
      evidence.push(`Reproduzierbares Verhalten nach ${timeData.ventCycles} Vent-Zyklen`);
      confidence += 0.1;
    }
  }
  
  return {
    type: "VIRTUAL_LEAK",
    confidence: Math.min(confidence, 1.0),
    evidence,
    affectedMasses: [14, 18, 28, 32, 40],
    recommendation: confidence > 0.5
      ? "Virtuelles Leck wahrscheinlich. Prüfe: Blindbohrungen, eingeklemmte O-Ringe, schlecht durchströmte Volumina, Gewinde ohne Entlüftungsnuten"
      : "Virtuelles Leck nicht bestätigt"
  };
}

// Hilfsfunktion für exponentiellen Fit
function fitsExponentialDecay(data: Array<{timestamp: number, pressure: number}>): boolean {
  if (data.length < 5) return false;
  
  // Vereinfachte Prüfung: Druckabfall verlangsamt sich über Zeit
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  
  const firstRate = (firstHalf[0].pressure - firstHalf[firstHalf.length - 1].pressure) / 
                    (firstHalf[firstHalf.length - 1].timestamp - firstHalf[0].timestamp);
  const secondRate = (secondHalf[0].pressure - secondHalf[secondHalf.length - 1].pressure) / 
                     (secondHalf[secondHalf.length - 1].timestamp - secondHalf[0].timestamp);
  
  // Exponentiell: Zweite Hälfte hat niedrigere Rate
  return secondRate < firstRate * 0.7;
}
```

---

## 4. Fehlende Grenzwertprofile

### 4.1 CERN Baked-Kriterien (H₂-normalisiert)

```typescript
const CERN_BAKED_LIMITS: LimitProfile = {
  id: "cern_baked",
  name: "CERN LHC Baked (H₂-normalisiert)",
  description: "Strenge Kriterien für ausgeheizte Beschleuniger-Komponenten nach CERN ACC-V-ES-0001",
  normalization: "H2",  // Normalisiert auf H₂ = 1 (100%)
  limits: [
    { massRange: [0, 2], limit: 1.0, notes: "H₂ Referenz" },
    { massRange: [3, 20], limit: 0.1, notes: "Max 10× kleiner als H₂" },
    { massRange: [20.5, 27.5], limit: 0.01, notes: "Max 100× kleiner" },
    { massRange: [27.5, 28.5], limit: 0.1, notes: "N₂/CO erlaubt (10×)" },
    { massRange: [28.5, 32.5], limit: 0.01, notes: "Max 100× kleiner" },
    { massRange: [32.5, 43.5], limit: 0.002, notes: "Max 500× kleiner" },
    { massRange: [43.5, 44.5], limit: 0.05, notes: "CO₂ erlaubt (20×)" },
    { massRange: [44.5, 100], limit: 0.0001, notes: "Max 10.000× kleiner (HC-frei)" }
  ],
  source: "CERN ACC-V-ES-0001, CERN-ACC-2014-0270"
};
```

### 4.2 ITER VQC-Klassen

```typescript
const ITER_VQC1_LIMITS: LimitProfile = {
  id: "iter_vqc1",
  name: "ITER VQC 1 (Plasma-Vakuum)",
  description: "Strengste Klasse für direkten Plasma-Kontakt",
  normalization: "H2",
  outgassingLimits: {
    H2: 1e-10,      // Pa·m³/s
    H2O: 1e-11,     // Pa·m³/s
    total: 1e-9     // Pa·m³/s
  },
  partialPressureLimits: [
    { mass: 2, limit: 1e-7, unit: "Pa" },
    { mass: 18, limit: 1e-9, unit: "Pa" },
    { mass: 28, limit: 1e-9, unit: "Pa" },
    { mass: 44, limit: 1e-10, unit: "Pa" }
  ],
  source: "ITER Vacuum Handbook"
};
```

### 4.3 Leckraten-Grenzwerte

```typescript
const LEAK_RATE_LIMITS = {
  UHV_INTEGRAL: {
    value: 1e-10,
    unit: "mbar·l/s",
    description: "Gesamtleckrate für UHV-Systeme (He-Integral)",
    testMethod: "He-Lecktest integral"
  },
  UHV_SINGLE: {
    value: 1e-11,
    unit: "mbar·l/s",
    description: "Einzelleck-Grenzwert für UHV",
    testMethod: "He-Lecktest punktuell"
  },
  HV_INTEGRAL: {
    value: 1e-8,
    unit: "mbar·l/s",
    description: "Gesamtleckrate für HV-Systeme",
    testMethod: "He-Lecktest integral"
  },
  CF_SEAL_SPEC: {
    value: 1e-12,
    unit: "mbar·l/s",
    description: "CF-Dichtungs-Spezifikation",
    testMethod: "Hersteller-Garantie"
  },
  GSI_CRYOGENIC_SINGLE: {
    value: 1e-10,
    unit: "mbar·l/s",
    description: "GSI kryogene Rohre - Einzelleck",
    source: "GSI Technical Guideline 7.23e"
  },
  GSI_CRYOGENIC_INTEGRAL: {
    value: 2e-10,
    unit: "mbar·l/s",
    description: "GSI kryogene Vakuumbehälter - Integral",
    source: "GSI Technical Guideline 7.23e"
  }
};
```

---

## 5. Fehlende Qualitätsprüfungen

### 5.1 CO₂-Korrektur für m/z 28

```typescript
interface CO2CorrectionResult {
  raw_m28: number;
  co2_contribution: number;
  corrected_m28: number;
  correction_applied: boolean;
}

function applyCO2Correction(spectrum: RGASpectrum): CO2CorrectionResult {
  const m28_raw = spectrum.getPeakIntensity(28);
  const m44 = spectrum.getPeakIntensity(44);
  
  // CO₂ trägt ca. 10-11% zu m/z 28 bei (CO+ Fragment)
  const CO2_CONTRIBUTION_FACTOR = 0.11;
  const co2_contribution = m44 * CO2_CONTRIBUTION_FACTOR;
  
  const corrected_m28 = Math.max(0, m28_raw - co2_contribution);
  
  return {
    raw_m28: m28_raw,
    co2_contribution,
    corrected_m28,
    correction_applied: co2_contribution > m28_raw * 0.05  // Nur wenn >5% Einfluss
  };
}
```

### 5.2 Methan vs O⁺ Unterscheidung bei m/z 16

```typescript
interface MethaneVsOxygenResult {
  m16_source: "CH4" | "O+" | "mixed" | "unknown";
  ch4_fraction: number;
  o_fraction: number;
  confidence: number;
}

function distinguishMethaneFromOxygen(spectrum: RGASpectrum): MethaneVsOxygenResult {
  const m16 = spectrum.getPeakIntensity(16);
  const m15 = spectrum.getPeakIntensity(15);  // CH3+ (nur von CH4)
  const m32 = spectrum.getPeakIntensity(32);  // O2
  const m18 = spectrum.getPeakIntensity(18);  // H2O
  
  // O+ kann von O2 (11-22%) oder H2O (1-2%) kommen
  const o_from_o2 = m32 * 0.15;  // Mittlerer Wert
  const o_from_h2o = m18 * 0.015;
  const expected_o = o_from_o2 + o_from_h2o;
  
  // CH4 hat 15/16 ≈ 0.85
  // Wenn m15 signifikant, dann CH4 vorhanden
  const ch4_contribution = m15 / 0.85;  // Geschätzter CH4-Beitrag zu m16
  
  const total_explained = ch4_contribution + expected_o;
  
  let source: "CH4" | "O+" | "mixed" | "unknown";
  if (ch4_contribution > m16 * 0.7) {
    source = "CH4";
  } else if (expected_o > m16 * 0.7) {
    source = "O+";
  } else if (total_explained > m16 * 0.5) {
    source = "mixed";
  } else {
    source = "unknown";
  }
  
  return {
    m16_source: source,
    ch4_fraction: Math.min(ch4_contribution / m16, 1),
    o_fraction: Math.min(expected_o / m16, 1),
    confidence: Math.min(total_explained / m16, 1)
  };
}
```

### 5.3 NH₃ vs H₂O Unterscheidung bei m/z 17

```typescript
interface AmmoniaVsWaterResult {
  m17_source: "H2O" | "NH3" | "mixed";
  nh3_fraction: number;
  h2o_fraction: number;
  confidence: number;
}

function distinguishAmmoniaFromWater(spectrum: RGASpectrum): AmmoniaVsWaterResult {
  const m17 = spectrum.getPeakIntensity(17);
  const m18 = spectrum.getPeakIntensity(18);
  const m16 = spectrum.getPeakIntensity(16);
  
  // H2O: 17/18 ≈ 0.23 (OH+ Fragment)
  const expected_oh_from_water = m18 * 0.23;
  
  // NH3: 17 = Base Peak, 16/17 ≈ 0.80
  // Überschuss bei m17 deutet auf NH3
  const nh3_excess = m17 - expected_oh_from_water;
  
  let source: "H2O" | "NH3" | "mixed";
  let nh3_fraction = 0;
  let h2o_fraction = 0;
  
  if (m17 > 0) {
    h2o_fraction = Math.min(expected_oh_from_water / m17, 1);
    nh3_fraction = Math.max(0, 1 - h2o_fraction);
    
    if (nh3_fraction > 0.5) {
      source = "NH3";
    } else if (nh3_fraction < 0.1) {
      source = "H2O";
    } else {
      source = "mixed";
    }
  } else {
    source = "H2O";
  }
  
  // Zusätzliche Bestätigung durch 16/17 Verhältnis
  let confidence = 0.5;
  if (m16 > 0 && m17 > 0) {
    const ratio_16_17 = m16 / m17;
    if (source === "NH3" && ratio_16_17 >= 0.6 && ratio_16_17 <= 1.0) {
      confidence = 0.8;
    } else if (source === "H2O" && ratio_16_17 < 0.1) {
      confidence = 0.8;
    }
  }
  
  return {
    m17_source: source,
    nh3_fraction,
    h2o_fraction,
    confidence
  };
}
```

---

## 6. Fehlende Isotopenverhältnisse

```typescript
const EXTENDED_ISOTOPE_RATIOS = {
  // Bereits vorhanden: Cl, Br, C, N, O, Ne
  
  // Argon-Isotope (fehlen)
  Ar: {
    isotopes: [
      { mass: 36, abundance: 0.334, name: "³⁶Ar" },
      { mass: 38, abundance: 0.063, name: "³⁸Ar" },
      { mass: 40, abundance: 99.6, name: "⁴⁰Ar" }
    ],
    diagnosticUse: "Argon-Isotope bestätigen Luftleck. ⁴⁰Ar/³⁶Ar ≈ 298"
  },
  
  // Krypton-Isotope (fehlen)
  Kr: {
    isotopes: [
      { mass: 80, abundance: 2.3, name: "⁸⁰Kr" },
      { mass: 82, abundance: 11.6, name: "⁸²Kr" },
      { mass: 83, abundance: 11.5, name: "⁸³Kr" },
      { mass: 84, abundance: 57.0, name: "⁸⁴Kr" },
      { mass: 86, abundance: 17.3, name: "⁸⁶Kr" }
    ],
    diagnosticUse: "Krypton als Tracergas. ⁸⁴Kr/⁸⁶Kr ≈ 3.3"
  },
  
  // Schwefel-Isotope (fehlen)
  S: {
    isotopes: [
      { mass: 32, abundance: 95.0, name: "³²S" },
      { mass: 33, abundance: 0.76, name: "³³S" },
      { mass: 34, abundance: 4.22, name: "³⁴S" },
      { mass: 36, abundance: 0.02, name: "³⁶S" }
    ],
    diagnosticUse: "Unterscheidung S vs O2 bei m/z 32. ³⁴S bei m/z 34 bestätigt Schwefel"
  },
  
  // Silizium-Isotope (für Silikon-Detektion)
  Si: {
    isotopes: [
      { mass: 28, abundance: 92.2, name: "²⁸Si" },
      { mass: 29, abundance: 4.7, name: "²⁹Si" },
      { mass: 30, abundance: 3.1, name: "³⁰Si" }
    ],
    diagnosticUse: "Si-Isotope können bei Silikon-Kontamination (PDMS) auftreten"
  }
};
```

---

## 7. Erweiterte Systemzustandsklassifikation

```typescript
enum ExtendedSystemState {
  // Bereits vorhanden
  BAKED = "baked",
  UNBAKED = "unbaked",
  AIR_LEAK = "air_leak",
  CONTAMINATED = "contaminated",
  UNKNOWN = "unknown",
  
  // Neu hinzufügen
  CLEAN_UHV = "clean_uhv",
  ESD_DOMINATED = "esd_dominated",
  OIL_BACKSTREAMING_FOREPUMP = "oil_backstreaming_forepump",
  OIL_BACKSTREAMING_TURBO = "oil_backstreaming_turbo",
  OIL_BACKSTREAMING_DIFFUSION = "oil_backstreaming_diffusion",
  VIRTUAL_LEAK = "virtual_leak",
  SOLVENT_CONTAMINATED = "solvent_contaminated",
  FLUOROCARBON_CONTAMINATED = "fluorocarbon_contaminated"
}

interface ExtendedStateClassification {
  state: ExtendedSystemState;
  confidence: number;
  criteria: string[];
  subtype?: string;
}

function classifySystemStateExtended(spectrum: RGASpectrum): ExtendedStateClassification {
  const m2 = spectrum.getPeakIntensity(2);   // H2
  const m18 = spectrum.getPeakIntensity(18); // H2O
  const m28 = spectrum.getPeakIntensity(28); // N2/CO
  const m44 = spectrum.getPeakIntensity(44); // CO2
  const totalPressure = spectrum.getTotalPressure();
  
  // Heavy masses sum (>44)
  let heavyMassesSum = 0;
  for (let m = 45; m <= 100; m++) {
    heavyMassesSum += spectrum.getPeakIntensity(m);
  }
  
  // CLEAN_UHV: H2 dominant, HC-frei
  if (m2 > m18 * 3 && m2 > m28 && heavyMassesSum < totalPressure * 0.001) {
    if (m44 < m2 * 0.05) {
      return {
        state: ExtendedSystemState.CLEAN_UHV,
        confidence: 0.9,
        criteria: [
          "H₂ > 3× H₂O",
          "H₂ > N₂/CO",
          "Schwere Massen < 0.1%",
          "CO₂ < 5% von H₂"
        ]
      };
    }
  }
  
  // BAKED: H2 > H2O
  if (m2 > m18) {
    return {
      state: ExtendedSystemState.BAKED,
      confidence: 0.7,
      criteria: ["H₂ > H₂O"]
    };
  }
  
  // UNBAKED: H2O dominant
  if (m18 > m2) {
    return {
      state: ExtendedSystemState.UNBAKED,
      confidence: 0.8,
      criteria: ["H₂O > H₂"]
    };
  }
  
  // Weitere Klassifikationen durch Diagnose-Funktionen...
  // (Hier würden die anderen Diagnosen aufgerufen)
  
  return {
    state: ExtendedSystemState.UNKNOWN,
    confidence: 0.5,
    criteria: ["Keine eindeutige Klassifikation möglich"]
  };
}
```

---

## 8. Implementierungsreihenfolge (Priorität)

### Phase 1: Kritisch (sofort implementieren)
1. ✅ Ammoniak (NH₃) Pattern + Diagnose
2. ✅ Methan (CH₄) Pattern + Diagnose  
3. ✅ CERN Baked-Grenzwerte
4. ✅ Erweiterte Massentabelle (m/z 15, 27, 39, 55, 71)
5. ✅ CO₂-Korrektur für m/z 28

### Phase 2: Hoch (bald implementieren)
6. ⬜ Schwefelverbindungen (H₂S, SO₂)
7. ⬜ Aromaten (Benzol, Toluol)
8. ⬜ Virtuelles Leck - Zeitbasierte Diagnose
9. ⬜ NH₃ vs H₂O Unterscheidung
10. ⬜ Methan vs O⁺ Unterscheidung

### Phase 3: Mittel (wenn Zeit)
11. ⬜ Ethanol, Methanol Patterns
12. ⬜ Propan, Ethan Patterns
13. ⬜ Leckraten-Grenzwerte
14. ⬜ Argon-Isotope für Luftleck-Bestätigung
15. ⬜ Erweiterte Systemzustandsklassifikation

### Phase 4: Nice-to-have
16. ⬜ Diffusionspumpenöl DC705
17. ⬜ ITER VQC-Klassen
18. ⬜ Krypton-Isotope
19. ⬜ Schwefel-Isotope
20. ⬜ Silizium-Isotope

---

## 9. Testfälle für Validierung

```typescript
// Testfall 1: Ammoniak-Detektion
const TEST_AMMONIA_SPECTRUM = {
  17: 1.0,    // NH3 Base Peak
  18: 2.5,    // H2O (17/18 = 0.4 > 0.3 → NH3)
  16: 0.8,    // NH2+
  15: 0.075   // NH+
};
// Erwartetes Ergebnis: AMMONIA_CONTAMINATION, confidence > 0.6

// Testfall 2: Methan vs O2
const TEST_METHANE_SPECTRUM = {
  16: 1.0,    // CH4 oder O+
  15: 0.85,   // CH3+ (nur von CH4!)
  14: 0.16,   // CH2+
  32: 0.1     // Wenig O2
};
// Erwartetes Ergebnis: METHANE_CONTAMINATION, source = "CH4"

// Testfall 3: Sauberes UHV
const TEST_CLEAN_UHV = {
  2: 10.0,    // H2 dominant
  18: 1.0,    // H2O niedrig
  28: 2.0,    // CO
  44: 0.3     // CO2
  // Keine schweren Massen
};
// Erwartetes Ergebnis: CLEAN_UHV, confidence > 0.8

// Testfall 4: Schwefel-Kontamination
const TEST_SULFUR_SPECTRUM = {
  34: 1.0,    // H2S
  33: 0.42,   // HS+
  32: 0.44    // S+
};
// Erwartetes Ergebnis: SULFUR_CONTAMINATION, subtype = "H2S"
```

---

## Hinweise zur Integration

1. **Dateien aktualisieren:**
   - `APP_CRITERIA.md` mit neuen Grenzwerten ergänzen
   - Cracking Patterns in entsprechende Konfigurationsdatei
   - Diagnose-Funktionen in Hauptlogik integrieren

2. **TypeScript-Typen:**
   - Bestehende Interfaces erweitern, nicht ersetzen
   - Neue Diagnose-Typen zum Enum hinzufügen

3. **UI-Anpassungen:**
   - Neue Diagnosen in Ergebnisanzeige integrieren
   - Erweiterte Massentabelle in Tooltip/Hilfe

4. **Tests:**
   - Unit-Tests für jede neue Diagnose-Funktion
   - Integrationstests mit echten Spektren

---

*Erstellt: Januar 2026*
*Basierend auf Analyse von ChatGPT, Claude, Gemini, Grok Wissensdatenbanken*
