# RGA ANALYSER - IMPLEMENTATION SPEC

## Zielsystem
- Framework: Next.js/React mit TypeScript
- Pfade relativ zu Projekt-Root

---

## TASK 1: RSF-KORREKTUREN (KRITISCH)

### Datei: `src/lib/knowledge/gasLibrary.ts`

Finde und korrigiere diese `relativeSensitivity` Werte:

```typescript
// FALSCH → RICHTIG

// H2S: Suche nach key: 'H2S' oder formula: 'H₂S'
relativeSensitivity: 1.2  →  relativeSensitivity: 2.2

// SO2: Suche nach key: 'SO2' oder formula: 'SO₂'
relativeSensitivity: 1.4  →  relativeSensitivity: 2.1

// C2H6: Suche nach key: 'C2H6' oder formula: 'C₂H₆'
relativeSensitivity: 2.1  →  relativeSensitivity: 2.6

// SiH4: Suche nach key: 'SiH4' oder formula: 'SiH₄'
relativeSensitivity: 2.5  →  relativeSensitivity: 1.0

// PH3: Suche nach key: 'PH3' oder formula: 'PH₃'
relativeSensitivity: 1.8  →  relativeSensitivity: 2.6
```

**Quelle:** Hiden Analytical, MKS Instruments, NIST Ionisationsquerschnitte

---

## TASK 2: NEUE GASE HINZUFÜGEN

### Datei: `src/lib/knowledge/gasLibrary.ts`

Füge diese Gase zum `GAS_LIBRARY` Array hinzu:

```typescript
// NF3 - Stickstofftrifluorid (CVD Kammer-Reinigung)
{
  key: 'NF3',
  name: 'Stickstofftrifluorid',
  nameEn: 'Nitrogen Trifluoride',
  formula: 'NF₃',
  mainMass: 52,
  crackingPattern: {
    52: 100,  // NF₂⁺ (Base Peak)
    71: 45,   // NF₃⁺ (Parent)
    33: 35,   // NF⁺
    14: 15,   // N⁺
    19: 25    // F⁺
  },
  relativeSensitivity: 1.5,
  category: 'halogen',
  notes: ['CVD/ALD Kammer-Reinigung', 'Hohe GWP (17,200)', 'm/z 52 charakteristisch']
},

// WF6 - Wolframhexafluorid (W-CVD)
{
  key: 'WF6',
  name: 'Wolframhexafluorid',
  nameEn: 'Tungsten Hexafluoride',
  formula: 'WF₆',
  mainMass: 279,
  crackingPattern: {
    279: 100, // WF₅⁺ (Base Peak, W-Isotopenmuster)
    260: 40,  // WF₄⁺
    241: 15,  // WF₃⁺
    184: 20,  // W⁺
    19: 30    // F⁺
  },
  relativeSensitivity: 2.0,
  category: 'halogen',
  notes: ['Wolfram-CVD/ALD', 'Korrosiv - HF-Bildung!', 'W-Isotope bei m/z 182-186']
},

// C2F6 - Hexafluorethan (Plasma-Ätzen)
{
  key: 'C2F6',
  name: 'Hexafluorethan',
  nameEn: 'Hexafluoroethane',
  formula: 'C₂F₆',
  mainMass: 69,
  crackingPattern: {
    69: 100,  // CF₃⁺ (Base Peak)
    119: 30,  // C₂F₅⁺
    50: 20,   // CF₂⁺
    31: 15    // CF⁺
  },
  relativeSensitivity: 1.2,
  category: 'halogen',
  notes: ['Plasma-Ätzen', 'Hohe GWP (12,200)', 'm/z 119 unterscheidet von CF₄']
},

// GeH4 - German (Ge-Abscheidung)
{
  key: 'GeH4',
  name: 'German',
  nameEn: 'Germane',
  formula: 'GeH₄',
  mainMass: 74,
  crackingPattern: {
    74: 100,  // ⁷⁴Ge⁺ (Hauptisotop)
    72: 55,   // ⁷²Ge⁺
    70: 42,   // ⁷⁰Ge⁺
    73: 16,   // ⁷³Ge⁺
    76: 15    // ⁷⁶Ge⁺
  },
  relativeSensitivity: 2.5,
  category: 'halogen',
  notes: ['SiGe-Abscheidung', 'PYROPHOR!', 'Ge-Isotopenmuster charakteristisch']
}
```

---

## TASK 3: NEUE MASSEN-EINTRÄGE

### Datei: `src/lib/knowledge/massReference.ts`

Füge diese Einträge zum `MASS_REFERENCE` Array hinzu:

```typescript
// m/z 52 - NF3 Base Peak
{
  mass: 52,
  primaryAssignment: 'NF₂⁺',
  primaryAssignmentEn: 'NF₂⁺',
  possibleSources: ['NF₃'],
  fragmentOf: ['NF₃'],
  notes: 'NF₃ Base Peak - CVD Kammer-Reinigung',
  diagnosticValue: 'critical'
},

// m/z 119 - C2F6 Fragment
{
  mass: 119,
  primaryAssignment: 'C₂F₅⁺',
  primaryAssignmentEn: 'C₂F₅⁺',
  possibleSources: ['C₂F₆', 'C₄F₈'],
  fragmentOf: ['C₂F₆'],
  notes: 'Unterscheidet C₂F₆ von CF₄',
  diagnosticValue: 'important'
},

// m/z 127 - SF6 Base Peak (falls nicht vorhanden)
{
  mass: 127,
  primaryAssignment: 'SF₅⁺/I⁺',
  primaryAssignmentEn: 'SF₅⁺/I⁺',
  possibleSources: ['SF₆', 'Iod'],
  fragmentOf: ['SF₆'],
  notes: 'SF₆ Base Peak',
  diagnosticValue: 'critical'
},

// m/z 149 - Phthalat-Marker (WICHTIG!)
{
  mass: 149,
  primaryAssignment: 'Phthalat-Fragment',
  primaryAssignmentEn: 'Phthalate Fragment',
  possibleSources: ['DEHP', 'DBP', 'Weichmacher'],
  fragmentOf: ['Phthalate'],
  notes: 'WEICHMACHER-MARKER! Aus O-Ringen, Kunststoffen',
  diagnosticValue: 'critical'
}
```

---

## TASK 4: NEUE DIAGNOSE-DETEKTOREN

### Datei: `src/lib/diagnosis/types.ts`

Erweitere den `DiagnosisType` enum:

```typescript
export type DiagnosisType =
  | 'AIR_LEAK'
  | 'VIRTUAL_LEAK'
  // ... bestehende Typen ...
  | 'POLYMER_OUTGASSING'      // NEU
  | 'PLASTICIZER_CONTAMINATION' // NEU
  | 'PROCESS_GAS_RESIDUE'     // NEU
  | 'COOLING_WATER_LEAK';     // NEU
```

### Datei: `src/lib/diagnosis/detectors.ts`

Füge diese Detektor-Funktionen hinzu:

```typescript
// POLYMER_OUTGASSING Detektor
function detectPolymerOutgassing(input: DiagnosisInput): DiagnosisResult | null {
  const m18 = input.peaks.get(18) ?? 0;
  const m17 = input.peaks.get(17) ?? 0;
  const m28 = input.peaks.get(28) ?? 0;
  const m32 = input.peaks.get(32) ?? 0;
  const m40 = input.peaks.get(40) ?? 0;
  
  // H₂O dominant ohne Luftleck-Signatur
  const waterDominant = m18 > m28 * 2;
  const noAirLeak = (m28 / Math.max(m32, 0.001)) > 5 || m40 < 0.005;
  const normalWaterRatio = m18 / Math.max(m17, 0.001) > 3.5 && m18 / Math.max(m17, 0.001) < 5.0;
  
  if (waterDominant && noAirLeak && normalWaterRatio) {
    return {
      type: 'POLYMER_OUTGASSING',
      confidence: 0.7,
      severity: 'info',
      affectedMasses: [18, 17, 28],
      interpretation: {
        de: 'Polymer-Ausgasung (PEEK/Kapton/Viton) - hauptsächlich H₂O',
        en: 'Polymer outgassing (PEEK/Kapton/Viton) - mainly H₂O'
      },
      recommendation: {
        de: 'Längeres Abpumpen, Bakeout bei max. zulässiger Polymer-Temperatur (150-200°C)',
        en: 'Extended pumping, bakeout at max. allowed polymer temperature (150-200°C)'
      }
    };
  }
  return null;
}

// PLASTICIZER_CONTAMINATION Detektor
function detectPlasticizerContamination(input: DiagnosisInput): DiagnosisResult | null {
  const m149 = input.peaks.get(149) ?? 0;
  const m57 = input.peaks.get(57) ?? 0;
  const m71 = input.peaks.get(71) ?? 0;
  const m43 = input.peaks.get(43) ?? 0;
  
  // Phthalat-Marker vorhanden
  if (m149 > 0.001) {
    const hasAlkylFragments = m57 > 0.01 || m71 > 0.01;
    const confidence = hasAlkylFragments ? 0.85 : 0.6;
    
    return {
      type: 'PLASTICIZER_CONTAMINATION',
      confidence,
      severity: 'warning',
      affectedMasses: [149, 57, 71, 43],
      interpretation: {
        de: 'Weichmacher-Kontamination (Phthalate) aus O-Ringen oder Kunststoffen',
        en: 'Plasticizer contamination (phthalates) from O-rings or plastics'
      },
      recommendation: {
        de: 'O-Ringe in Hexan auskochen (über Nacht), Kunststoffteile entfernen',
        en: 'Reflux O-rings in hexane overnight, remove plastic components'
      }
    };
  }
  return null;
}

// PROCESS_GAS_RESIDUE Detektor
function detectProcessGasResidue(input: DiagnosisInput): DiagnosisResult | null {
  const m52 = input.peaks.get(52) ?? 0;   // NF₃
  const m71 = input.peaks.get(71) ?? 0;   // NF₃ parent
  const m127 = input.peaks.get(127) ?? 0; // SF₆
  const m89 = input.peaks.get(89) ?? 0;   // SF₆ fragment
  const m279 = input.peaks.get(279) ?? 0; // WF₆
  
  const detectedGases: string[] = [];
  
  // NF₃ Check
  if (m52 > 0.01 && m52 / Math.max(m71, 0.001) > 1.5) {
    detectedGases.push('NF₃');
  }
  
  // SF₆ Check
  if (m127 > 0.01 && m127 / Math.max(m89, 0.001) > 3) {
    detectedGases.push('SF₆');
  }
  
  // WF₆ Check
  if (m279 > 0.005) {
    detectedGases.push('WF₆');
  }
  
  if (detectedGases.length > 0) {
    return {
      type: 'PROCESS_GAS_RESIDUE',
      confidence: 0.75,
      severity: 'warning',
      affectedMasses: [52, 127, 279].filter(m => (input.peaks.get(m) ?? 0) > 0.005),
      interpretation: {
        de: `Prozessgas-Rückstand detektiert: ${detectedGases.join(', ')}`,
        en: `Process gas residue detected: ${detectedGases.join(', ')}`
      },
      recommendation: {
        de: 'Kammer-Reinigungszyklus unvollständig. Baseline nicht erreicht.',
        en: 'Chamber cleaning cycle incomplete. Baseline not reached.'
      }
    };
  }
  return null;
}

// COOLING_WATER_LEAK Detektor
function detectCoolingWaterLeak(input: DiagnosisInput): DiagnosisResult | null {
  const m18 = input.peaks.get(18) ?? 0;
  const totalPressure = input.metadata?.totalPressure;
  
  // Prüfe ob Druck bei ~20-25 mbar stabilisiert (Sättigungsdampfdruck H₂O bei RT)
  if (totalPressure && totalPressure > 15 && totalPressure < 30) {
    // H₂O muss absolut dominant sein
    const waterFraction = m18 / totalPressure;
    
    if (waterFraction > 0.9) {
      return {
        type: 'COOLING_WATER_LEAK',
        confidence: 0.9,
        severity: 'critical',
        affectedMasses: [18, 17, 16],
        interpretation: {
          de: 'Kühlwasser-Leck! Druck stabilisiert bei H₂O-Sättigungsdampfdruck',
          en: 'Cooling water leak! Pressure stabilized at H₂O saturation pressure'
        },
        recommendation: {
          de: 'SOFORT System belüften! Wärmetauscher und Kühlkreislauf prüfen!',
          en: 'IMMEDIATELY vent system! Check heat exchanger and cooling circuit!'
        }
      };
    }
  }
  return null;
}
```

### Datei: `src/lib/diagnosis/index.ts`

Registriere die neuen Detektoren in der `runFullDiagnosis` Funktion:

```typescript
// In der Detektorliste hinzufügen:
const detectors = [
  // ... bestehende Detektoren ...
  detectPolymerOutgassing,
  detectPlasticizerContamination,
  detectProcessGasResidue,
  detectCoolingWaterLeak
];
```

---

## TASK 5: NEUE LIMIT-PROFILE (OPTIONAL)

### Datei: `src/lib/limits/profiles.ts`

Füge diese Profile zum `PRESET_PROFILES` Array hinzu:

```typescript
// LIGO UHV - Gravitationswellen-Detektoren
{
  id: 'ligo-uhv',
  name: 'LIGO UHV',
  description: 'LIGO Gravitational Wave Observatory - Extreme Optical Cleanliness',
  color: '#8B5CF6',
  isPreset: true,
  ranges: [
    { massMin: 0, massMax: 3, limit: 1.0, notes: 'H₂ Referenz' },
    { massMin: 3, massMax: 17.5, limit: 0.001, notes: 'Max 0.1%' },
    { massMin: 17.5, massMax: 18.5, limit: 0.01, notes: 'H₂O max 1%' },
    { massMin: 18.5, massMax: 27.5, limit: 0.001 },
    { massMin: 27.5, massMax: 28.5, limit: 0.01, notes: 'N₂/CO max 1%' },
    { massMin: 28.5, massMax: 44.5, limit: 0.001 },
    { massMin: 44.5, massMax: 100, limit: 0.0001, notes: 'HC < 0.01%' }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
},

// Semiconductor CVD Baseline
{
  id: 'semi-cvd',
  name: 'Semiconductor CVD',
  description: 'CVD/ALD Chamber Baseline - Process Ready',
  color: '#10B981',
  isPreset: true,
  ranges: [
    { massMin: 0, massMax: 3, limit: 0.5, notes: 'H₂ akzeptiert' },
    { massMin: 3, massMax: 17.5, limit: 0.01 },
    { massMin: 17.5, massMax: 18.5, limit: 0.001, notes: 'H₂O < 0.1% kritisch!' },
    { massMin: 18.5, massMax: 27.5, limit: 0.01 },
    { massMin: 27.5, massMax: 28.5, limit: 0.01, notes: 'N₂/CO < 1%' },
    { massMin: 28.5, massMax: 31.5, limit: 0.01 },
    { massMin: 31.5, massMax: 32.5, limit: 0.001, notes: 'O₂ < 0.1%' },
    { massMin: 32.5, massMax: 44.5, limit: 0.01 },
    { massMin: 44.5, massMax: 100, limit: 0.0001, notes: 'HC kritisch' }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}
```

---

## VALIDIERUNG

Nach Implementation prüfen:

1. **TypeScript kompiliert ohne Fehler:** `npm run build`
2. **Tests laufen:** `npm test`
3. **RSF-Werte korrekt:** H₂S=2.2, SO₂=2.1, C₂H₆=2.6, SiH₄=1.0, PH₃=2.6
4. **Neue Gase findbar:** NF₃, WF₆, C₂F₆, GeH₄
5. **Neue Detektoren aktiv:** POLYMER_OUTGASSING, PLASTICIZER_CONTAMINATION, etc.

---

## QUELLEN

- RSF: Hiden Analytical, MKS Instruments, NIST σ
- Cracking Patterns: NIST WebBook, Hiden MS Library
- Limit Profiles: LIGO-E960022, INFICON Semiconductor Guidelines
