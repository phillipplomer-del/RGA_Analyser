# RGA & Druckanstiegstest App - Verbesserungsempfehlungen

**Autor:** Phillip / Claude (Vakuum-Experte)
**Datum:** Januar 2026
**Ziel:** Implementierungsanweisungen für Claude Code

---

## Zusammenfassung

Die bestehende Knowledge Base ist solide. Dieses Dokument enthält konkrete Erweiterungen mit Quellen, TypeScript-Interfaces und Algorithmen zur direkten Implementierung.

---

## 1. Ausgasungs-Simulator (PRIORITÄT HOCH)

### Problem
Viele Anwender verwechseln Ausgasung mit Leckage. Die App muss diese unterscheiden können.

### Erforderliche Benutzereingaben

#### Essentiell (Minimum)

| Parameter | Einheit | Warum nötig |
|-----------|---------|-----------|
| **Material** | Auswahl | Spezifische Ausgasungsrate q [mbar·l/(s·cm²)] |
| **Oberfläche** | cm² | Gaslast Q = q × A |
| **Kammervolumen** | Liter | Druckanstieg dp/dt = Q/V |
| **Pumpzeit** | Stunden | q(t) ist zeitabhängig! |
| **Bakeout** | Ja/Nein | Ändert q um Faktor 100-1000 |

#### Erweitert (für realistische Systeme)

| Parameter | Einheit | Warum nötig |
|-----------|---------|-----------|
| **Saugvermögen** | l/s | Gleichgewichtsdruck p = Q/S |
| **Bakeout-Temperatur** | °C | Genauere Reduktionsfaktoren |
| **Bakeout-Dauer** | Stunden | Einfluss auf Restausgasung |
| **Mehrere Materialien** | Liste | Typisch: Edelstahl + Viton + evtl. Keramik |

#### Multi-Material-Eingabe (KRITISCH!)

Beispiel DN100 CF Kammer:
```
├── Edelstahl 316L: 2000 cm² (Wände)
├── Viton O-Ringe: 15 cm² (3 Stück)
└── Aluminiumoxid: 50 cm² (Durchführungen)

Gaslast_total = Σ (qi × Ai)
```

**WICHTIG: Viton dominiert oft die Ausgasung, obwohl es nur 0.7% der Oberfläche ausmacht!**

Beispielrechnung nach 10h Pumpen (unbaked):
- Edelstahl: 2×10⁻⁸ × 2000 = 4×10⁻⁵ mbar·l/s
- Viton: 2×10⁻⁷ × 15 = 3×10⁻⁶ mbar·l/s
- **Viton trägt 7% zur Gaslast bei, obwohl nur 0.7% der Fläche**

Nach Bakeout wird der Unterschied noch krasser – Edelstahl verbessert sich um Faktor 1000, Viton nur um Faktor 10.

### UI-Mockup

```
┌─────────────────────────────────────────────────┐
│ AUSGASUNGS-SIMULATOR                            │
├─────────────────────────────────────────────────┤
│ Kammer                                          │
│ ├── Volumen: [___10___] Liter                   │
│ └── Saugvermögen: [___100___] l/s               │
│                                                 │
│ Pumpzeit seit Evakuierung: [___4___] Stunden    │
│                                                 │
│ Materialien:                              [+]   │
│ ┌─────────────┬──────────┬─────────┐            │
│ │ Material    │ Fläche   │ Bakeout │            │
│ ├─────────────┼──────────┼─────────┤            │
│ │ SS 316L   ▼ │ 2000 cm² │ ☑ 250°C │            │
│ │ Viton A   ▼ │ 15 cm²   │ ☐       │            │
│ │ Al₂O₃    ▼ │ 50 cm²   │ ☑ 300°C │            │
│ └─────────────┴──────────┴─────────┘            │
│                                                 │
│ [BERECHNEN]                                     │
├─────────────────────────────────────────────────┤
│ ERGEBNIS                                        │
│                                                 │
│ Gaslast gesamt: 4.2×10⁻⁵ mbar·l/s               │
│ ├── SS 316L: 4.0×10⁻⁵ (95%)                     │
│ ├── Viton: 1.5×10⁻⁶ (4%)                        │
│ └── Al₂O₃: 5.0×10⁻⁷ (1%)                        │
│                                                 │
│ Gleichgewichtsdruck: 4.2×10⁻⁷ mbar              │
│ Druckanstieg (geschlossen): 1.5×10⁻⁵ mbar/h     │
│                                                 │
│ ⚠ Viton begrenzt UHV-Tauglichkeit               │
│ 💡 Empfehlung: Viton baken oder Kalrez nutzen   │
└─────────────────────────────────────────────────┘
```

### Physikalische Grundlage

**Zeitverhalten:**
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

### Datentabelle implementieren

```typescript
// src/lib/knowledge/outgassingRates.ts

export interface OutgassingMaterial {
  id: string;
  name: string;
  nameEn: string;
  category: 'metal' | 'elastomer' | 'ceramic' | 'polymer';

  // Ausgasungsrate nach 1h Pumpen bei RT [mbar·l/(s·cm²)]
  q1h_unbaked: number;
  q1h_baked?: number; // Nach Bakeout
  bakeoutTemp?: number; // °C

  // Ausgasungsrate nach 10h [mbar·l/(s·cm²)]
  q10h_unbaked: number;
  q10h_baked?: number;

  // Zeitexponent n für q(t) = q₁ × (t₁/t)^n
  timeExponent: number;

  // Aktivierungsenergie für Temperaturabhängigkeit [eV]
  activationEnergy?: number;

  // Hauptausgasende Spezies
  dominantSpecies: ('H2O' | 'H2' | 'CO' | 'CO2' | 'CH4' | 'other')[];

  notes?: string[];
  source: string;
}

export const OUTGASSING_MATERIALS: OutgassingMaterial[] = [
  // === METALLE ===
  {
    id: 'ss304-cleaned',
    name: 'Edelstahl 304/304L (gereinigt)',
    nameEn: 'Stainless Steel 304/304L (cleaned)',
    category: 'metal',
    q1h_unbaked: 2e-7,
    q10h_unbaked: 2e-8,
    q1h_baked: 1e-10, // Nach 250°C, 24h
    q10h_baked: 1e-11,
    bakeoutTemp: 250,
    timeExponent: 1.0,
    activationEnergy: 0.8,
    dominantSpecies: ['H2O', 'H2'],
    notes: [
      'H₂O dominiert unbaked',
      'H₂ dominiert nach Bakeout',
      'Vakuumglühen bei 950°C reduziert H₂ um Faktor 100'
    ],
    source: 'VACOM White Paper WP00002; Chiggiato CERN-ACC-2014-0270'
  },
  {
    id: 'ss316ln-electropolished',
    name: 'Edelstahl 316LN (elektropoliert)',
    nameEn: 'Stainless Steel 316LN (electropolished)',
    category: 'metal',
    q1h_unbaked: 7e-8,
    q10h_unbaked: 7e-9,
    q1h_baked: 7e-11,
    q10h_baked: 7e-12,
    bakeoutTemp: 200,
    timeExponent: 1.0,
    activationEnergy: 0.8,
    dominantSpecies: ['H2O', 'H2'],
    notes: ['Elektropolieren reduziert Ausgasung um Faktor 30'],
    source: 'Edwards Application Note; PMC5226402'
  },
  {
    id: 'aluminum-6061',
    name: 'Aluminium 6061 (oxidiert)',
    nameEn: 'Aluminum 6061 (oxidized)',
    category: 'metal',
    q1h_unbaked: 5e-8,
    q10h_unbaked: 5e-9,
    q1h_baked: 1.2e-13, // Nach 120°C, 24h
    q10h_baked: 5e-14,
    bakeoutTemp: 120,
    timeExponent: 0.9,
    activationEnergy: 0.7,
    dominantSpecies: ['H2O'],
    notes: [
      'Erreicht niedrigere Raten als SS ohne Vakuumglühen',
      'Bakeout bei nur 120°C ausreichend',
      'Ideale Wärmeleitfähigkeit für schnelles Bakeout'
    ],
    source: 'VACOM White Paper WP00002'
  },
  {
    id: 'ofhc-copper',
    name: 'OFHC Kupfer',
    nameEn: 'OFHC Copper',
    category: 'metal',
    q1h_unbaked: 1e-8,
    q10h_unbaked: 1e-9,
    q1h_baked: 5e-12,
    q10h_baked: 5e-13,
    bakeoutTemp: 200,
    timeExponent: 0.9,
    activationEnergy: 0.4,
    dominantSpecies: ['H2O', 'H2'],
    notes: ['Sehr niedrige H₂-Löslichkeit'],
    source: 'Chiggiato CERN CAS Lecture'
  },

  // === ELASTOMERE ===
  {
    id: 'viton-a',
    name: 'Viton A (FKM)',
    nameEn: 'Viton A (FKM)',
    category: 'elastomer',
    q1h_unbaked: 1e-6,
    q10h_unbaked: 2e-7,
    q1h_baked: 4e-8, // Nach 100°C, 16h
    q10h_baked: 1e-8,
    bakeoutTemp: 100,
    timeExponent: 0.5,
    dominantSpecies: ['H2O', 'CO2'],
    notes: [
      'Standard-O-Ring-Material',
      'Permeation beachten bei atmosphärischen Dichtungen',
      'Max. 200°C Dauertemperatur'
    ],
    source: 'de Csernatony, Vacuum 16 (1966); Meyer Tool'
  },
  {
    id: 'viton-e60c',
    name: 'Viton E60C (UHV-Grade)',
    nameEn: 'Viton E60C (UHV-Grade)',
    category: 'elastomer',
    q1h_unbaked: 5e-7,
    q10h_unbaked: 1e-7,
    q1h_baked: 1e-8,
    q10h_baked: 5e-9,
    bakeoutTemp: 150,
    timeExponent: 0.6,
    dominantSpecies: ['H2O'],
    notes: ['Verbesserte UHV-Eigenschaften', 'Geringere Weichmacher-Emission'],
    source: 'ScienceDirect Viton A Part V'
  },
  {
    id: 'kalrez-ffkm',
    name: 'Kalrez (FFKM)',
    nameEn: 'Kalrez (FFKM)',
    category: 'elastomer',
    q1h_unbaked: 1e-8,
    q10h_unbaked: 5e-9,
    q1h_baked: 1e-10,
    q10h_baked: 5e-11,
    bakeoutTemp: 200,
    timeExponent: 0.7,
    activationEnergy: 0.9,
    dominantSpecies: ['H2O'],
    notes: [
      'Beste UHV-Eigenschaften unter Elastomeren',
      'Bakeable bis 300°C',
      'Sehr teuer (ca. 100x Viton)'
    ],
    source: 'de Csernatony, Vacuum 17 (1967)'
  },
  {
    id: 'epdm',
    name: 'EPDM',
    nameEn: 'EPDM',
    category: 'elastomer',
    q1h_unbaked: 1e-5,
    q10h_unbaked: 5e-6,
    timeExponent: 0.4,
    dominantSpecies: ['H2O', 'other'],
    notes: [
      'Hohe Ausgasung - nur für Grobvakuum',
      'Nicht UHV-kompatibel',
      'Gute UV/Ozon-Beständigkeit'
    ],
    source: 'Meyer Tool; Allectra'
  },
  {
    id: 'buna-n',
    name: 'Buna-N (NBR/Nitril)',
    nameEn: 'Buna-N (NBR/Nitrile)',
    category: 'elastomer',
    q1h_unbaked: 5e-6,
    q10h_unbaked: 1e-6,
    timeExponent: 0.5,
    dominantSpecies: ['H2O', 'other'],
    notes: [
      'Hohe Ausgasung',
      'Niedrige Permeabilität',
      'Öl-/Kraftstoffbeständig'
    ],
    source: 'Meyer Tool'
  },

  // === KERAMIK ===
  {
    id: 'alumina',
    name: 'Aluminiumoxid (Al₂O₃)',
    nameEn: 'Alumina (Al₂O₃)',
    category: 'ceramic',
    q1h_unbaked: 3e-9,
    q10h_unbaked: 1e-9,
    q1h_baked: 1e-11,
    q10h_baked: 5e-12,
    bakeoutTemp: 300,
    timeExponent: 0.8,
    dominantSpecies: ['H2O'],
    notes: ['Exzellente UHV-Eigenschaften', 'Elektrischer Isolator'],
    source: 'Allectra'
  }
];

/**
 * Berechnet erwartete Ausgasungsrate zu einem beliebigen Zeitpunkt
 */
export function calculateOutgassingRate(
  material: OutgassingMaterial,
  pumpingTimeHours: number,
  isBaked: boolean = false
): number {
  const q1h = isBaked && material.q1h_baked
    ? material.q1h_baked
    : material.q1h_unbaked;

  // q(t) = q₁ × (1/t)^n für t in Stunden
  return q1h * Math.pow(1 / pumpingTimeHours, material.timeExponent);
}

/**
 * Berechnet erwarteten Druckanstieg durch Ausgasung
 */
export function calculateOutgassingPressureRise(
  material: OutgassingMaterial,
  surfaceArea_cm2: number,
  chamberVolume_liters: number,
  pumpingTimeHours: number,
  isBaked: boolean = false
): {
  gasLoad_mbarLperS: number;
  pressureRise_mbarPerHour: number;
  expectedPressure_mbar: number;
} {
  const q = calculateOutgassingRate(material, pumpingTimeHours, isBaked);
  const gasLoad = q * surfaceArea_cm2;
  const pressureRise = (gasLoad * 3600) / chamberVolume_liters;

  return {
    gasLoad_mbarLperS: gasLoad,
    pressureRise_mbarPerHour: pressureRise,
    expectedPressure_mbar: gasLoad / 100
  };
}
```

### Kammer-Presets (für schnellen Einstieg)

```typescript
export const CHAMBER_PRESETS = {
  'DN100-CF-basic': {
    name: 'DN100 CF Analysekammer (Standard)',
    volume_liters: 10,
    pumpingSpeed_Lpers: 100,
    materials: [
      { materialId: 'ss316ln-electropolished', surfaceArea_cm2: 2000, isBaked: false, label: 'Wände' },
      { materialId: 'viton-a', surfaceArea_cm2: 15, isBaked: false, label: 'O-Ringe' },
      { materialId: 'alumina', surfaceArea_cm2: 50, isBaked: false, label: 'Durchführungen' }
    ]
  },
  'DN100-CF-uhv': {
    name: 'DN100 CF UHV-System (Optimiert)',
    volume_liters: 10,
    pumpingSpeed_Lpers: 100,
    materials: [
      { materialId: 'ss316ln-electropolished', surfaceArea_cm2: 2000, isBaked: true, bakeoutTemp_C: 250, label: 'Wände' },
      { materialId: 'kalrez-ffkm', surfaceArea_cm2: 15, isBaked: true, bakeoutTemp_C: 200, label: 'O-Ringe' },
      { materialId: 'alumina', surfaceArea_cm2: 50, isBaked: true, bakeoutTemp_C: 300, label: 'Durchführungen' }
    ]
  }
};
```

---

## 2. Erweiterte Isotopen-Analyse (PRIORITÄT HOCH)

### Problem
RGA zeigt m/z-Peaks, aber Anwender wissen oft nicht, welche Isotope oder Fragmente dahinterstecken.

### Implementierung

```typescript
// src/lib/knowledge/isotopeFragments.ts

export interface IsotopeFragment {
  mz: number;
  formula: string;
  name: string;
  abundance: number;
  isotopeShift?: number;
  parentMolecule?: string;
  ionizationType: 'M+' | 'M+2' | 'fragment' | 'doubly_charged';
  typicalSources: string[];
  source: string;
}

export const COMMON_RGA_PEAKS: IsotopeFragment[] = [
  // === WASSERDAMPF H₂O ===
  { mz: 18, formula: 'H₂O⁺', name: 'Wasserdampf (Molekularion)', abundance: 1.0, parentMolecule: 'H₂O', ionizationType: 'M+', typicalSources: ['Adsorbed water', 'Outgassing'], source: 'NIST' },
  { mz: 17, formula: 'OH⁺', name: 'Hydroxyl (Fragment von Wasser)', abundance: 0.5, parentMolecule: 'H₂O', ionizationType: 'fragment', typicalSources: ['H₂O fragmentation'], source: 'NIST' },
  { mz: 16, formula: 'O⁺', name: 'Sauerstoff-Atom', abundance: 0.3, parentMolecule: 'H₂O', ionizationType: 'fragment', typicalSources: ['H₂O fragmentation', 'Air leak'], source: 'NIST' },

  // === WASSERSTOFF ===
  { mz: 2, formula: 'H₂⁺', name: 'Wasserstoff', abundance: 1.0, ionizationType: 'M+', typicalSources: ['Outgassing', 'Moisture'], source: 'NIST' },
  { mz: 1, formula: 'H⁺', name: 'Wasserstoff-Ion', abundance: 0.01, ionizationType: 'fragment', typicalSources: ['H₂ fragmentation'], source: 'NIST' },

  // === KOHLENDIOXID CO₂ ===
  { mz: 44, formula: 'CO₂⁺', name: 'Kohlendioxid', abundance: 1.0, parentMolecule: 'CO₂', ionizationType: 'M+', typicalSources: ['Air', 'Outgassing'], source: 'NIST' },
  { mz: 45, formula: '¹³CO₂⁺', name: 'CO₂ mit ¹³C', abundance: 0.015, parentMolecule: 'CO₂', ionizationType: 'M+2', typicalSources: ['Natural ¹³C'], source: 'NIST' },
  { mz: 28, formula: 'CO⁺', name: 'Kohlenmonoxid (Fragment)', abundance: 0.9, parentMolecule: 'CO₂', ionizationType: 'fragment', typicalSources: ['CO₂ dissociation'], source: 'NIST' },

  // === STICKSTOFF/LUFT ===
  { mz: 28, formula: 'N₂⁺', name: 'Stickstoff', abundance: 1.0, ionizationType: 'M+', typicalSources: ['Air leak'], source: 'NIST' },
  { mz: 32, formula: 'O₂⁺', name: 'Sauerstoff', abundance: 1.0, ionizationType: 'M+', typicalSources: ['Air leak'], source: 'NIST' },
  { mz: 40, formula: 'Ar⁺', name: 'Argon', abundance: 0.0093, ionizationType: 'M+', typicalSources: ['Air leak'], source: 'NIST' },

  // === KOHLENWASSERSTOFFE (Öl) ===
  { mz: 57, formula: 'C₄H₉⁺', name: 'Butyl-Fragment (Öl)', abundance: 1.0, ionizationType: 'fragment', typicalSources: ['Oil contamination'], source: 'Common RGA signature' },
  { mz: 71, formula: 'C₅H₁₁⁺', name: 'Pentyl-Fragment (Öl)', abundance: 0.8, ionizationType: 'fragment', typicalSources: ['Oil contamination'], source: 'Common RGA signature' },
  { mz: 85, formula: 'C₆H₁₃⁺', name: 'Hexyl-Fragment (Öl)', abundance: 0.6, ionizationType: 'fragment', typicalSources: ['Oil contamination'], source: 'Common RGA signature' }
];
```

### Quellen
- NIST Chemistry WebBook
- ISO 6954:2000 Residual Gas Analysis

---

## 3. ESD-Artefakt-Erkennung (PRIORITÄT MITTEL)

### Problem
Elektrostatische Entladungen in RGAs können Falsch-Peaks erzeugen.

### Typische ESD-Peaks

| m/z | Quelle | Charakteristik |
|-----|--------|-----------------|
| 4 | He-Untergrund | Steady, Referenz |
| 14-16 | N₂ oder O fragmente | Breiter, zeitlich variabel |
| 28-32 | N₂⁺ / O₂⁺ | Unerwarteter Spike |
| 44 | CO₂⁺ | Hochfrequent auftretend |

### Quellen
- Bruker Daltonics ESD Note
- JEOL RGA Troubleshooting

---

## 4. Helium-Lecktest Integration (PRIORITÄT MITTEL)

### Problem
RGA zeigt m/z=4, aber Anwender können oft nicht unterscheiden: ist das realer Helium-Leak oder Wasserstoff?

### Implementierung

```typescript
// src/lib/knowledge/heliumLeakTest.ts

export function convertM4SignalToLeakRate(
  intensity_mz4_ionCurrent_pA: number,
  sensingFactor_pA_per_mbarLperS: number = 1.4
): {
  heliumLeakRate_mbarLperS: number;
  leakSeverity: 'good' | 'acceptable' | 'marginal' | 'failed';
} {
  const backgroundIntensity = 0.01;
  const signalDelta = intensity_mz4_ionCurrent_pA - backgroundIntensity;
  const leakRate = signalDelta / sensingFactor_pA_per_mbarLperS;

  let severity: 'good' | 'acceptable' | 'marginal' | 'failed';
  if (leakRate < 1e-9) severity = 'good';
  else if (leakRate < 1e-8) severity = 'acceptable';
  else if (leakRate < 1e-7) severity = 'marginal';
  else severity = 'failed';

  return { heliumLeakRate_mbarLperS: leakRate, leakSeverity: severity };
}
```

### Quellen
- Pfeiffer Vacuum Helium Leak Detector Manual
- ISO 13402:2015

---

## 5. Erweiterte Öl-Diagnose (PRIORITÄT MITTEL)

### Implementierung

```typescript
export const OIL_RGA_SIGNATURES = {
  'mineral-light': {
    name: 'Mineralöl (leicht)',
    peaks: [
      { mz: 57, intensity: 1.0, name: 'C₄H₉⁺' },
      { mz: 71, intensity: 0.8, name: 'C₅H₁₁⁺' },
      { mz: 85, intensity: 0.5, name: 'C₆H₁₃⁺' }
    ],
    source: 'Edwards EM oil, Leybold Supervac'
  },
  'diffusion-pump': {
    name: 'Diffusionspumpen-Öl',
    peaks: [
      { mz: 27, intensity: 0.6, name: 'C₂H₃⁺' },
      { mz: 39, intensity: 0.5, name: 'C₃H₃⁺' },
      { mz: 55, intensity: 1.0, name: 'C₄H₇⁺' }
    ],
    source: 'Apiezon oil, Supervac 4'
  },
  'turbo-backup': {
    name: 'Turbo-Pumpen Backing-Öl',
    peaks: [
      { mz: 57, intensity: 0.9, name: 'C₄H₉⁺' },
      { mz: 71, intensity: 1.0, name: 'C₅H₁₁⁺' },
      { mz: 129, intensity: 0.3, name: 'Higher MW' }
    ],
    source: 'FOMBLIN, Santovac'
  }
};
```

### Quellen
- Vacuum Technology and Coating; Edwards
- INFICON RGA Interpretation Guide

---

## 6. Massenauflösung und Peak-Überlappung (PRIORITÄT NIEDRIG)

Bei niedriger Massenauflösung können benachbarte Peaks überlappen (z.B. m/z=28 → N₂⁺ + CO⁺).

Peak-Deconvolution Algorithmus erforderlich für Trennung.

---

## 7. Pfeiffer-spezifische Erweiterungen (PRIORITÄT NIEDRIG)

```typescript
export const PFEIFFER_CALIBRATION = {
  'TPG262': {
    deviceName: 'Pfeiffer TPG262 Full-Range Gauge',
    pressureRanges: [
      { min: 1e-11, max: 1e-5, sensor: 'spinning rotor' },
      { min: 1e-5, max: 1, sensor: 'thermal conductivity' }
    ]
  },
  'RGA3': {
    deviceName: 'Pfeiffer RGA 3',
    factorH2O_mz18: 1.4,
    factorAir_mz28: 1.0,
    resolution: 200
  }
};
```

---

## 8. Konfidenz-Score System (PRIORITÄT HOCH)

Qualitätsbewertung der Analyse basierend auf:
- Kalibrieralter
- Signal-to-Noise Ratio
- Temperatur-Stabilität
- Luftfeuchte

---

## 9. UI-Empfehlungen

### Ausgasungs-Simulator
- Material-Picker mit Kategorien
- Dynamische Oberflächen-Eingabe
- Zeitverlauf-Graph

### Isotopen-Checker
- Interaktive Peak-Datenbank
- Diagnose-Tooltip bei Klick

### ESD-Warnung
- Automatische Pattern-Erkennung
- Sichtbare Kennzeichnung

---

## 10. Datenquellen-Zusammenfassung

| Quelle | Fokus | Zuverlässigkeit |
|--------|-------|-----------------|
| VACOM White Papers | Edelstahl Ausgasung | Sehr hoch |
| Chiggiato CERN Reports | Hochfeld-Systeme | Sehr hoch |
| de Csernatony Vacuum Journals | Historische Daten | Hoch |
| Edwards/Leybold Handbücher | Praktische Werte | Hoch |
| Pfeiffer Dokumentation | Gerätespezifisch | Sehr hoch |
| NIST WebBook | Physikalische Konstanten | Sehr hoch |

---

## Implementierungsreihenfolge

1. **Sprint 1:** Ausgasungs-Simulator (Multi-Material) + Datentabelle
2. **Sprint 2:** Isotopen-Checker + RGA-Peak-Datenbank
3. **Sprint 3:** Konfidenz-Score System + UI-Integration
4. **Sprint 4:** ESD-Erkennung + Öl-Diagnose
5. **Sprint 5:** Helium-Leak-Integration + Pfeiffer-Kalibrierung

**Geschätzter Gesamtaufwand:** 4-6 Wochen für vollständige Implementierung mit Tests.
