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
|-----------|---------|-------------|
| **Material** | Auswahl | Spezifische Ausgasungsrate q [mbar·l/(s·cm²)] |
| **Oberfläche** | cm² | Gaslast Q = q × A |
| **Kammervolumen** | Liter | Druckanstieg dp/dt = Q/V |
| **Pumpzeit** | Stunden | q(t) ist zeitabhängig! |
| **Bakeout** | Ja/Nein | Ändert q um Faktor 100-1000 |

#### Erweitert (für realistische Systeme)

| Parameter | Einheit | Warum nötig |
|-----------|---------|-------------|
| **Saugvermögen** | l/s | Gleichgewichtsdruck p = Q/S |
| **Bakeout-Temperatur** | °C | Genauere Reduktionsfaktoren |
| **Bakeout-Dauer** | Stunden | Einfluss auf Restausgasung |
| **Mehrere Materialien** | Liste | Typisch: Edelstahl + Viton + evtl. Keramik |

#### Multi-Material-Eingabe (KRITISCH!)

Eine echte Vakuumkammer hat nie nur ein Material. Das muss die App abbilden:

```
Beispiel DN100 CF Kammer:
├── Edelstahl 316L:     2000 cm² (Wände)
├── Viton O-Ringe:        15 cm² (3 Stück)
└── Aluminiumoxid:        50 cm² (Durchführungen)

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
│  AUSGASUNGS-SIMULATOR                           │
├─────────────────────────────────────────────────┤
│  Kammer                                         │
│  ├── Volumen: [___10___] Liter                  │
│  └── Saugvermögen: [___100___] l/s              │
│                                                 │
│  Pumpzeit seit Evakuierung: [___4___] Stunden   │
│                                                 │
│  Materialien:                              [+]  │
│  ┌─────────────┬──────────┬─────────┐          │
│  │ Material    │ Fläche   │ Bakeout │          │
│  ├─────────────┼──────────┼─────────┤          │
│  │ SS 316L ▼   │ 2000 cm² │ ☑ 250°C │          │
│  │ Viton A ▼   │   15 cm² │ ☐       │          │
│  │ Al₂O₃   ▼   │   50 cm² │ ☑ 300°C │          │
│  └─────────────┴──────────┴─────────┘          │
│                                                 │
│  [BERECHNEN]                                    │
├─────────────────────────────────────────────────┤
│  ERGEBNIS                                       │
│                                                 │
│  Gaslast gesamt:     4.2×10⁻⁵ mbar·l/s         │
│  ├── SS 316L:        4.0×10⁻⁵ (95%)            │
│  ├── Viton:          1.5×10⁻⁶ (4%)             │
│  └── Al₂O₃:          5.0×10⁻⁷ (1%)             │
│                                                 │
│  Gleichgewichtsdruck: 4.2×10⁻⁷ mbar            │
│  Druckanstieg (geschlossen): 1.5×10⁻⁵ mbar/h   │
│                                                 │
│  ⚠ Viton begrenzt UHV-Tauglichkeit             │
│  💡 Empfehlung: Viton baken oder Kalrez nutzen │
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
  q1h_baked?: number;       // Nach Bakeout
  bakeoutTemp?: number;     // °C
  
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
    q1h_baked: 1e-10,      // Nach 250°C, 24h
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
    q1h_baked: 1.2e-13,    // Nach 120°C, 24h
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
    q1h_baked: 4e-8,       // Nach 100°C, 16h
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
  gasLoad_mbarLperS: number;      // mbar·l/s
  pressureRise_mbarPerHour: number; // mbar/h (bei geschlossener Kammer)
  expectedPressure_mbar: number;    // Bei gegebenem Saugvermögen
} {
  const q = calculateOutgassingRate(material, pumpingTimeHours, isBaked);
  const gasLoad = q * surfaceArea_cm2;  // mbar·l/s
  
  // dp/dt = Q/V (bei geschlossener Kammer)
  const pressureRise = (gasLoad * 3600) / chamberVolume_liters;  // mbar/h
  
  return {
    gasLoad_mbarLperS: gasLoad,
    pressureRise_mbarPerHour: pressureRise,
    expectedPressure_mbar: gasLoad / 100  // Annahme: 100 l/s Saugvermögen
  };
}

// ============================================================
// MULTI-MATERIAL SYSTEM SIMULATION
// ============================================================

export interface MaterialEntry {
  materialId: string;           // Referenz auf OUTGASSING_MATERIALS
  surfaceArea_cm2: number;      // Oberfläche dieses Materials
  isBaked: boolean;             // Wurde dieses Material gebaked?
  bakeoutTemp_C?: number;       // Optional: spezifische Bakeout-Temp
  bakeoutDuration_h?: number;   // Optional: Bakeout-Dauer
  label?: string;               // Optional: "Hauptkammer", "O-Ring DN100", etc.
}

export interface ChamberConfiguration {
  name?: string;                // z.B. "Analysekammer"
  volume_liters: number;        // Kammervolumen
  pumpingSpeed_Lpers: number;   // Effektives Saugvermögen
  materials: MaterialEntry[];   // Liste aller Materialien
}

export interface SimulationResult {
  // Gesamtergebnis
  totalGasLoad_mbarLperS: number;
  equilibriumPressure_mbar: number;
  pressureRise_mbarPerHour: number;  // Bei geschlossenem Ventil
  
  // Aufschlüsselung pro Material
  materialBreakdown: {
    materialId: string;
    materialName: string;
    label?: string;
    surfaceArea_cm2: number;
    outgassingRate_mbarLperScm2: number;
    gasLoad_mbarLperS: number;
    percentageOfTotal: number;
    isBaked: boolean;
  }[];
  
  // Diagnose & Empfehlungen
  limitingMaterial: string;     // Welches Material limitiert?
  warnings: string[];
  recommendations: string[];
  
  // Zeitverlauf (für Grafik)
  timeProfile: {
    time_hours: number;
    totalGasLoad_mbarLperS: number;
    pressure_mbar: number;
  }[];
}

/**
 * Hauptfunktion: Simuliert Ausgasung eines Multi-Material-Systems
 */
export function simulateChamberOutgassing(
  config: ChamberConfiguration,
  pumpingTime_hours: number,
  generateTimeProfile: boolean = true
): SimulationResult {
  const breakdown: SimulationResult['materialBreakdown'] = [];
  let totalGasLoad = 0;
  
  // Berechne Gaslast für jedes Material
  for (const entry of config.materials) {
    const material = OUTGASSING_MATERIALS.find(m => m.id === entry.materialId);
    if (!material) {
      throw new Error(`Material ${entry.materialId} nicht in Datenbank gefunden`);
    }
    
    const q = calculateOutgassingRate(material, pumpingTime_hours, entry.isBaked);
    const gasLoad = q * entry.surfaceArea_cm2;
    
    breakdown.push({
      materialId: entry.materialId,
      materialName: material.name,
      label: entry.label,
      surfaceArea_cm2: entry.surfaceArea_cm2,
      outgassingRate_mbarLperScm2: q,
      gasLoad_mbarLperS: gasLoad,
      percentageOfTotal: 0,  // Wird unten berechnet
      isBaked: entry.isBaked
    });
    
    totalGasLoad += gasLoad;
  }
  
  // Prozentanteile berechnen
  for (const item of breakdown) {
    item.percentageOfTotal = (item.gasLoad_mbarLperS / totalGasLoad) * 100;
  }
  
  // Sortiere nach Gaslast (größter Beitrag zuerst)
  breakdown.sort((a, b) => b.gasLoad_mbarLperS - a.gasLoad_mbarLperS);
  
  // Gleichgewichtsdruck
  const equilibriumPressure = totalGasLoad / config.pumpingSpeed_Lpers;
  
  // Druckanstieg bei geschlossenem Ventil
  const pressureRise = (totalGasLoad * 3600) / config.volume_liters;
  
  // Limitierendes Material (größter Beitrag)
  const limitingMaterial = breakdown[0]?.materialName || 'Unbekannt';
  
  // Warnungen & Empfehlungen generieren
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  // Prüfe ob Elastomer dominiert
  const elastomerContribution = breakdown
    .filter(m => {
      const mat = OUTGASSING_MATERIALS.find(x => x.id === m.materialId);
      return mat?.category === 'elastomer';
    })
    .reduce((sum, m) => sum + m.percentageOfTotal, 0);
  
  if (elastomerContribution > 20) {
    warnings.push(`Elastomere tragen ${elastomerContribution.toFixed(0)}% zur Gaslast bei`);
    
    const unbakesElastomers = breakdown.filter(m => {
      const mat = OUTGASSING_MATERIALS.find(x => x.id === m.materialId);
      return mat?.category === 'elastomer' && !m.isBaked;
    });
    
    if (unbakesElastomers.length > 0) {
      recommendations.push('Elastomer-Dichtungen baken (max. 150°C für Viton)');
    }
    
    if (equilibriumPressure > 1e-9) {
      recommendations.push('Für UHV: Kalrez statt Viton oder Metalldichtungen verwenden');
    }
  }
  
  // Prüfe ob unbaked Metall dominiert
  const unbakesMetalDominates = breakdown[0] && 
    !breakdown[0].isBaked &&
    OUTGASSING_MATERIALS.find(m => m.id === breakdown[0].materialId)?.category === 'metal';
  
  if (unbakesMetalDominates && equilibriumPressure > 1e-8) {
    recommendations.push(`${breakdown[0].materialName} baken würde Gaslast um ~Faktor 100-1000 reduzieren`);
  }
  
  // UHV-Tauglichkeit prüfen
  if (equilibriumPressure > 1e-7) {
    warnings.push('System nicht UHV-tauglich bei aktuellem Setup');
  } else if (equilibriumPressure > 1e-9) {
    warnings.push('UHV erreichbar, aber grenzwertig');
  }
  
  // Zeitprofil generieren (optional, für Grafik)
  const timeProfile: SimulationResult['timeProfile'] = [];
  if (generateTimeProfile) {
    const timePoints = [0.1, 0.5, 1, 2, 4, 8, 12, 24, 48, 100];
    for (const t of timePoints) {
      let gasLoadAtT = 0;
      for (const entry of config.materials) {
        const material = OUTGASSING_MATERIALS.find(m => m.id === entry.materialId)!;
        const q = calculateOutgassingRate(material, t, entry.isBaked);
        gasLoadAtT += q * entry.surfaceArea_cm2;
      }
      timeProfile.push({
        time_hours: t,
        totalGasLoad_mbarLperS: gasLoadAtT,
        pressure_mbar: gasLoadAtT / config.pumpingSpeed_Lpers
      });
    }
  }
  
  return {
    totalGasLoad_mbarLperS: totalGasLoad,
    equilibriumPressure_mbar: equilibriumPressure,
    pressureRise_mbarPerHour: pressureRise,
    materialBreakdown: breakdown,
    limitingMaterial,
    warnings,
    recommendations,
    timeProfile
  };
}

/**
 * Vergleicht gemessenen Druckanstieg mit Simulation
 * Hilft zu unterscheiden ob Leck oder Ausgasung
 */
export function compareMeasuredVsSimulated(
  config: ChamberConfiguration,
  measuredPressureRise_mbarPerHour: number,
  pumpingTime_hours: number
): {
  simulatedPressureRise: number;
  measuredPressureRise: number;
  ratio: number;
  interpretation: 'ausgasung' | 'leck' | 'virtuelles_leck' | 'unklar';
  explanation: string;
  confidence: number;
} {
  const simulation = simulateChamberOutgassing(config, pumpingTime_hours, false);
  const ratio = measuredPressureRise_mbarPerHour / simulation.pressureRise_mbarPerHour;
  
  let interpretation: 'ausgasung' | 'leck' | 'virtuelles_leck' | 'unklar';
  let explanation: string;
  let confidence: number;
  
  if (ratio < 0.5) {
    interpretation = 'ausgasung';
    explanation = 'Messwert niedriger als erwartet – System sauberer als Referenzdaten oder Materialangaben zu konservativ';
    confidence = 0.7;
  } else if (ratio >= 0.5 && ratio <= 2.0) {
    interpretation = 'ausgasung';
    explanation = 'Messwert entspricht erwarteter Ausgasung – kein Leck erkennbar';
    confidence = 0.9;
  } else if (ratio > 2.0 && ratio <= 10) {
    interpretation = 'virtuelles_leck';
    explanation = 'Messwert leicht erhöht – mögliches virtuelles Leck (eingeschlossenes Volumen, Kontamination)';
    confidence = 0.6;
  } else if (ratio > 10) {
    interpretation = 'leck';
    explanation = 'Messwert deutlich höher als erwartet – wahrscheinlich reales Leck vorhanden';
    confidence = 0.8;
  } else {
    interpretation = 'unklar';
    explanation = 'Keine eindeutige Zuordnung möglich';
    confidence = 0.3;
  }
  
  return {
    simulatedPressureRise: simulation.pressureRise_mbarPerHour,
    measuredPressureRise: measuredPressureRise_mbarPerHour,
    ratio,
    interpretation,
    explanation,
    confidence
  };
}
```

### Quellen
- **VACOM White Paper WP00002** (2016): Outgassing Rates of Aluminum compared to Stainless Steel
- **Chiggiato, P.** CERN CAS Lecture "Materials and Properties IV: Outgassing" (2016)
- **CERN-ACC-2014-0270**: Outgassing properties of vacuum materials for particle accelerators
- **de Csernatony, L.** Vacuum 16-17 (1966-1967): The properties of Viton A elastomers Part I-V
- **PMC5226402**: Measurement of Outgassing Rates of Steels (2017)
- **Meyer Tool**: Selecting O-Ring Materials for Vacuum Applications
- **Allectra**: Notes for High Vacuum and UHV Practice

### Kammer-Presets (für schnellen Einstieg)

```typescript
// src/lib/knowledge/chamberPresets.ts

export const CHAMBER_PRESETS: ChamberConfiguration[] = [
  {
    name: 'DN100 CF Analysekammer (Standard)',
    volume_liters: 10,
    pumpingSpeed_Lpers: 100,
    materials: [
      { materialId: 'ss316ln-electropolished', surfaceArea_cm2: 2000, isBaked: false, label: 'Kammerwände' },
      { materialId: 'viton-a', surfaceArea_cm2: 15, isBaked: false, label: 'O-Ringe (3×DN40)' },
      { materialId: 'alumina', surfaceArea_cm2: 20, isBaked: false, label: 'Durchführungen' }
    ]
  },
  {
    name: 'DN100 CF Analysekammer (Baked)',
    volume_liters: 10,
    pumpingSpeed_Lpers: 100,
    materials: [
      { materialId: 'ss316ln-electropolished', surfaceArea_cm2: 2000, isBaked: true, label: 'Kammerwände' },
      { materialId: 'viton-e60c', surfaceArea_cm2: 15, isBaked: true, label: 'O-Ringe (3×DN40)' },
      { materialId: 'alumina', surfaceArea_cm2: 20, isBaked: true, label: 'Durchführungen' }
    ]
  },
  {
    name: 'DN160 CF Prozesskammer',
    volume_liters: 50,
    pumpingSpeed_Lpers: 300,
    materials: [
      { materialId: 'ss304-cleaned', surfaceArea_cm2: 5000, isBaked: false, label: 'Kammerwände' },
      { materialId: 'viton-a', surfaceArea_cm2: 50, isBaked: false, label: 'O-Ringe' },
      { materialId: 'aluminum-6061', surfaceArea_cm2: 500, isBaked: false, label: 'Substrathalter' }
    ]
  },
  {
    name: 'UHV Kammer (Metalldichtungen)',
    volume_liters: 20,
    pumpingSpeed_Lpers: 200,
    materials: [
      { materialId: 'ss316ln-electropolished', surfaceArea_cm2: 3000, isBaked: true, label: 'Kammerwände' },
      { materialId: 'ofhc-copper', surfaceArea_cm2: 100, isBaked: true, label: 'CF-Dichtungen' },
      { materialId: 'alumina', surfaceArea_cm2: 50, isBaked: true, label: 'Durchführungen' }
    ]
  },
  {
    name: 'Loadlock (schneller Zyklus)',
    volume_liters: 5,
    pumpingSpeed_Lpers: 50,
    materials: [
      { materialId: 'aluminum-6061', surfaceArea_cm2: 1000, isBaked: false, label: 'Kammerwände' },
      { materialId: 'viton-a', surfaceArea_cm2: 30, isBaked: false, label: 'Tür-O-Ring' },
      { materialId: 'epdm', surfaceArea_cm2: 10, isBaked: false, label: 'Sonstige Dichtungen' }
    ]
  }
];

/**
 * Schnell-Schätzung für Oberfläche basierend auf Kammergeometrie
 */
export function estimateChamberSurface(
  shape: 'cylinder' | 'cube' | 'sphere',
  dimension1_cm: number,  // Durchmesser oder Kantenlänge
  dimension2_cm?: number  // Höhe (nur bei Zylinder)
): number {
  switch (shape) {
    case 'cylinder':
      const r = dimension1_cm / 2;
      const h = dimension2_cm || dimension1_cm;
      // Mantelfläche + 2× Kreisfläche
      return 2 * Math.PI * r * h + 2 * Math.PI * r * r;
    case 'cube':
      return 6 * dimension1_cm * dimension1_cm;
    case 'sphere':
      const rs = dimension1_cm / 2;
      return 4 * Math.PI * rs * rs;
    default:
      return 0;
  }
}

/**
 * Schätzt O-Ring Oberfläche basierend auf Flanschgröße
 */
export function estimateORingSurface(
  flangeDN: number,  // DN in mm (z.B. 40, 63, 100, 160)
  cordDiameter_mm: number = 5.33  // Standard für KF/ISO
): number {
  // Mittlerer Durchmesser des O-Rings ≈ DN
  const meanDiameter_cm = flangeDN / 10;
  const cordDiameter_cm = cordDiameter_mm / 10;
  
  // Vakuum-exponierte Fläche ≈ halbe Torusoberfläche
  // A = π² × d × D (voller Torus)
  // Vakuum sieht ca. 50%
  return 0.5 * Math.PI * Math.PI * cordDiameter_cm * meanDiameter_cm;
}
```

---

## 2. Erweiterte Isotopen-Analyse (PRIORITÄT HOCH)

### Problem
Die aktuelle Tabelle ist zu dünn. Isotopenmuster sind der Schlüssel zur eindeutigen Identifikation.

### Implementierung

```typescript
// src/lib/knowledge/isotopePatterns.ts

export interface IsotopePattern {
  element: string;
  isotopes: {
    mass: number;
    abundance: number;  // Natürliche Häufigkeit in %
    symbol: string;
  }[];
  keyRatio: {
    masses: [number, number];
    expectedRatio: number;
    tolerance: number;  // ± in %
  };
  diagnosticUse: string;
  commonCompounds: string[];
}

export const ISOTOPE_PATTERNS: IsotopePattern[] = [
  // === HALOGENE ===
  {
    element: 'Chlor',
    isotopes: [
      { mass: 35, abundance: 75.76, symbol: '³⁵Cl' },
      { mass: 37, abundance: 24.24, symbol: '³⁷Cl' }
    ],
    keyRatio: {
      masses: [35, 37],
      expectedRatio: 3.08,  // 75.76/24.24
      tolerance: 10
    },
    diagnosticUse: 'Eindeutige Identifikation chlorierter Lösungsmittel',
    commonCompounds: ['HCl', 'DCM (CH₂Cl₂)', 'TCE (C₂HCl₃)', 'Freon-12 (CCl₂F₂)']
  },
  {
    element: 'Brom',
    isotopes: [
      { mass: 79, abundance: 50.69, symbol: '⁷⁹Br' },
      { mass: 81, abundance: 49.31, symbol: '⁸¹Br' }
    ],
    keyRatio: {
      masses: [79, 81],
      expectedRatio: 1.03,  // ~1:1
      tolerance: 5
    },
    diagnosticUse: 'Identifikation bromierter Verbindungen',
    commonCompounds: ['HBr', 'CH₃Br', 'C₂H₄Br₂']
  },
  
  // === EDELGASE ===
  {
    element: 'Argon',
    isotopes: [
      { mass: 36, abundance: 0.334, symbol: '³⁶Ar' },
      { mass: 38, abundance: 0.063, symbol: '³⁸Ar' },
      { mass: 40, abundance: 99.60, symbol: '⁴⁰Ar' }
    ],
    keyRatio: {
      masses: [40, 36],
      expectedRatio: 298,  // 99.60/0.334
      tolerance: 15
    },
    diagnosticUse: 'Luftleck-Bestätigung (atmosphärisches Ar)',
    commonCompounds: ['Luft (0.93%)']
  },
  {
    element: 'Krypton',
    isotopes: [
      { mass: 78, abundance: 0.35, symbol: '⁷⁸Kr' },
      { mass: 80, abundance: 2.28, symbol: '⁸⁰Kr' },
      { mass: 82, abundance: 11.58, symbol: '⁸²Kr' },
      { mass: 83, abundance: 11.49, symbol: '⁸³Kr' },
      { mass: 84, abundance: 57.00, symbol: '⁸⁴Kr' },
      { mass: 86, abundance: 17.30, symbol: '⁸⁶Kr' }
    ],
    keyRatio: {
      masses: [84, 86],
      expectedRatio: 3.3,
      tolerance: 10
    },
    diagnosticUse: 'Tracergas, Unterscheidung von organischen Verbindungen bei m/z 84',
    commonCompounds: ['Tracergas']
  },
  {
    element: 'Xenon',
    isotopes: [
      { mass: 124, abundance: 0.09, symbol: '¹²⁴Xe' },
      { mass: 126, abundance: 0.09, symbol: '¹²⁶Xe' },
      { mass: 128, abundance: 1.92, symbol: '¹²⁸Xe' },
      { mass: 129, abundance: 26.44, symbol: '¹²⁹Xe' },
      { mass: 130, abundance: 4.08, symbol: '¹³⁰Xe' },
      { mass: 131, abundance: 21.18, symbol: '¹³¹Xe' },
      { mass: 132, abundance: 26.89, symbol: '¹³²Xe' },
      { mass: 134, abundance: 10.44, symbol: '¹³⁴Xe' },
      { mass: 136, abundance: 8.87, symbol: '¹³⁶Xe' }
    ],
    keyRatio: {
      masses: [132, 129],
      expectedRatio: 1.02,
      tolerance: 10
    },
    diagnosticUse: 'Tracergas mit charakteristischem Multiisotop-Muster',
    commonCompounds: ['Tracergas', 'Ionenimplantation']
  },
  
  // === LEICHTE ELEMENTE ===
  {
    element: 'Kohlenstoff',
    isotopes: [
      { mass: 12, abundance: 98.93, symbol: '¹²C' },
      { mass: 13, abundance: 1.07, symbol: '¹³C' }
    ],
    keyRatio: {
      masses: [12, 13],
      expectedRatio: 92.5,  // 98.93/1.07
      tolerance: 20
    },
    diagnosticUse: 'M+1 Peak-Analyse zur Bestimmung der C-Anzahl',
    commonCompounds: ['Alle organischen Verbindungen']
  },
  {
    element: 'Stickstoff',
    isotopes: [
      { mass: 14, abundance: 99.63, symbol: '¹⁴N' },
      { mass: 15, abundance: 0.37, symbol: '¹⁵N' }
    ],
    keyRatio: {
      masses: [28, 29],  // N₂ und ¹⁴N¹⁵N
      expectedRatio: 272,
      tolerance: 15
    },
    diagnosticUse: 'Bestätigung N₂ vs. CO (¹⁴N¹⁵N bei m/z 29 erwartet)',
    commonCompounds: ['N₂', 'NH₃', 'NO', 'N₂O']
  },
  {
    element: 'Sauerstoff',
    isotopes: [
      { mass: 16, abundance: 99.76, symbol: '¹⁶O' },
      { mass: 17, abundance: 0.04, symbol: '¹⁷O' },
      { mass: 18, abundance: 0.20, symbol: '¹⁸O' }
    ],
    keyRatio: {
      masses: [32, 34],  // O₂ und ¹⁶O¹⁸O
      expectedRatio: 250,
      tolerance: 20
    },
    diagnosticUse: 'Unterscheidung O₂ (Luftleck) vs. Prozessgas',
    commonCompounds: ['O₂', 'H₂O', 'CO', 'CO₂']
  },
  {
    element: 'Schwefel',
    isotopes: [
      { mass: 32, abundance: 94.99, symbol: '³²S' },
      { mass: 33, abundance: 0.75, symbol: '³³S' },
      { mass: 34, abundance: 4.25, symbol: '³⁴S' },
      { mass: 36, abundance: 0.01, symbol: '³⁶S' }
    ],
    keyRatio: {
      masses: [32, 34],
      expectedRatio: 22.4,  // 94.99/4.25
      tolerance: 10
    },
    diagnosticUse: 'KRITISCH: Unterscheidung S vs. O₂ bei m/z 32!',
    commonCompounds: ['H₂S', 'SO₂', 'SF₆']
  },
  {
    element: 'Silizium',
    isotopes: [
      { mass: 28, abundance: 92.23, symbol: '²⁸Si' },
      { mass: 29, abundance: 4.68, symbol: '²⁹Si' },
      { mass: 30, abundance: 3.09, symbol: '³⁰Si' }
    ],
    keyRatio: {
      masses: [28, 29],
      expectedRatio: 19.7,
      tolerance: 15
    },
    diagnosticUse: 'Silikon-Kontamination (mit m/z 73 korrelieren)',
    commonCompounds: ['SiH₄', 'PDMS', 'SiO₂']
  }
];

/**
 * Berechnet erwartetes Isotopenmuster für Moleküle mit mehreren Cl/Br-Atomen
 */
export function calculateHalogenPattern(
  numCl: number, 
  numBr: number
): { mass: number; relIntensity: number }[] {
  // Binomialverteilung für Cl (3:1) und Br (1:1)
  const clRatio = 0.7576;  // ³⁵Cl Anteil
  const brRatio = 0.5069;  // ⁷⁹Br Anteil
  
  const pattern: Map<number, number> = new Map();
  
  // Kombinatorik für alle möglichen Isotopenkombinationen
  for (let i35Cl = 0; i35Cl <= numCl; i35Cl++) {
    const i37Cl = numCl - i35Cl;
    for (let i79Br = 0; i79Br <= numBr; i79Br++) {
      const i81Br = numBr - i79Br;
      
      const massShift = i37Cl * 2 + i81Br * 2;  // Relativ zur leichtesten Kombination
      
      // Binomialkoeffizient × Wahrscheinlichkeit
      const probability = 
        binomial(numCl, i35Cl) * Math.pow(clRatio, i35Cl) * Math.pow(1 - clRatio, i37Cl) *
        binomial(numBr, i79Br) * Math.pow(brRatio, i79Br) * Math.pow(1 - brRatio, i81Br);
      
      const currentVal = pattern.get(massShift) || 0;
      pattern.set(massShift, currentVal + probability);
    }
  }
  
  // Normalisiere auf 100
  const maxVal = Math.max(...pattern.values());
  return Array.from(pattern.entries())
    .map(([mass, prob]) => ({ mass, relIntensity: (prob / maxVal) * 100 }))
    .sort((a, b) => a.mass - b.mass);
}

function binomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  return result;
}

/**
 * Prüft ob gemessenes Verhältnis zum erwarteten Isotopenmuster passt
 */
export function checkIsotopeRatio(
  pattern: IsotopePattern,
  measuredPeak1: number,
  measuredPeak2: number
): {
  isMatch: boolean;
  measuredRatio: number;
  expectedRatio: number;
  deviation: number;  // in %
  confidence: number; // 0-1
} {
  const measuredRatio = measuredPeak1 / measuredPeak2;
  const expectedRatio = pattern.keyRatio.expectedRatio;
  const deviation = Math.abs((measuredRatio - expectedRatio) / expectedRatio) * 100;
  
  const isMatch = deviation <= pattern.keyRatio.tolerance;
  const confidence = Math.max(0, 1 - deviation / (pattern.keyRatio.tolerance * 2));
  
  return {
    isMatch,
    measuredRatio,
    expectedRatio,
    deviation,
    confidence
  };
}
```

### Quellen
- **NIST Chemistry WebBook**: Atomic Weights and Isotopic Compositions
- **IUPAC 2003**: de Laeter et al. "Atomic Weights of Elements"
- **University of Lethbridge**: Mass Spectrometry Lecture Notes
- **Chemistry LibreTexts**: The Mass Spectra of Elements

---

## 3. ESD-Artefakt-Erkennung (PRIORITÄT MITTEL)

### Problem
Electron Stimulated Desorption (ESD) erzeugt falsche Peaks, die als Kontamination fehlinterpretiert werden.

### Physik
- Elektronen aus dem RGA-Filament treffen auf Oxidschichten/Adsorbate
- Erzeugen O⁺, F⁺, Cl⁺ OHNE dass diese Gase in der Gasphase vorhanden sind
- Peak-Intensität skaliert NICHT mit Kammerdruck (Unterschied zu echten Peaks!)

### Typische ESD-Peaks

```typescript
// src/lib/knowledge/esdArtifacts.ts

export interface ESDArtifact {
  mass: number;
  ion: string;
  origin: string;
  recognition: string[];
  mitigation: string[];
}

export const ESD_ARTIFACTS: ESDArtifact[] = [
  {
    mass: 16,
    ion: 'O⁺',
    origin: 'Oxidschichten auf Ionisatoroberflächen',
    recognition: [
      'Peak erscheint sofort beim Filament-Einschalten',
      'Skaliert NICHT mit Gesamtdruck',
      'Oft höher als erwartet für O₂-Fragmentierung',
      'Verschwindet nicht durch längeres Pumpen'
    ],
    mitigation: [
      'Filament degassing (höherer Strom für kurze Zeit)',
      'Niedrigeren Emissionsstrom verwenden',
      'Gold-beschichtete Ionenquelle (reduziert Adsorption)'
    ]
  },
  {
    mass: 19,
    ion: 'F⁺',
    origin: 'Fluorhaltige Kontamination auf Oberflächen (PFPE-Reste, Teflon)',
    recognition: [
      'Peak ohne entsprechende F-haltige Moleküle im Spektrum',
      'Kein HF-Parent bei m/z 20',
      'Kein CF₄ bei m/z 69'
    ],
    mitigation: [
      'Prüfen ob Fomblin/PFPE-Öl verwendet wurde',
      'Ionenquelle ausheizen'
    ]
  },
  {
    mass: 35,
    ion: '³⁵Cl⁺',
    origin: 'Chlorhaltige Reinigungsrückstände',
    recognition: [
      'Isotopenmuster 35/37 vorhanden aber kein HCl-Parent bei 36/38',
      'Keine chlorierten Lösungsmittel-Peaks'
    ],
    mitigation: [
      'Kammer mit reinem Lösungsmittel spülen',
      'Längeres Bakeout'
    ]
  },
  {
    mass: 12,
    ion: 'C⁺',
    origin: 'Kohlenstoff-Ablagerungen am Filament',
    recognition: [
      'Ungewöhnlich hoher C⁺ Peak relativ zu CO',
      'Steigt mit Filament-Betriebszeit'
    ],
    mitigation: [
      'Filament wechseln oder degassen'
    ]
  }
];

/**
 * Prüft ob ein Peak wahrscheinlich ein ESD-Artefakt ist
 */
export function checkForESDartifact(
  peakMass: number,
  peakIntensity: number,
  totalPressure: number,
  previousTotalPressure: number,
  previousPeakIntensity: number
): {
  isLikelyESD: boolean;
  confidence: number;
  reasons: string[];
} {
  const artifact = ESD_ARTIFACTS.find(a => a.mass === peakMass);
  if (!artifact) {
    return { isLikelyESD: false, confidence: 0, reasons: [] };
  }
  
  const reasons: string[] = [];
  let esdScore = 0;
  
  // Prüfe ob Peak mit Druck skaliert
  const pressureChange = totalPressure / previousTotalPressure;
  const peakChange = peakIntensity / previousPeakIntensity;
  
  if (Math.abs(peakChange - 1) < 0.2 && Math.abs(pressureChange - 1) > 0.3) {
    // Peak bleibt konstant obwohl Druck sich ändert → ESD wahrscheinlich
    esdScore += 0.5;
    reasons.push('Peak-Intensität skaliert nicht mit Gesamtdruck');
  }
  
  // Bekannte ESD-Masse
  esdScore += 0.3;
  reasons.push(`m/z ${peakMass} ist bekannte ESD-Masse (${artifact.ion})`);
  
  return {
    isLikelyESD: esdScore > 0.5,
    confidence: Math.min(1, esdScore),
    reasons
  };
}
```

### Quellen
- **Wikipedia**: Residual gas analyzer - ESD Section
- **Hiden Analytical**: Ion Source Options for RGA
- **Takahashi, N.** (2006): "The electron-stimulated desorption ions from the ionizer of a quadrupole mass spectrometer"
- **ScienceDirect**: ESD from stainless steel at temperatures between −15 and +70 °C

---

## 4. Helium-Lecktest Integration (PRIORITÄT MITTEL)

### Problem
Kein Zusammenhang zwischen RGA-Analyse und Standard-Lecktest-Praxis.

### Implementierung

```typescript
// src/lib/knowledge/leakDetection.ts

export interface LeakRateCriteria {
  application: string;
  maxIntegralRate: number;     // mbar·l/s
  maxSingleLeak: number;       // mbar·l/s
  testMethod: string;
  notes: string[];
}

export const LEAK_RATE_CRITERIA: LeakRateCriteria[] = [
  {
    application: 'XHV (Extreme High Vacuum)',
    maxIntegralRate: 1e-12,
    maxSingleLeak: 1e-13,
    testMethod: 'Akkumulation mit RGA',
    notes: ['LIGO-Klasse', 'He-Hintergrund kritisch']
  },
  {
    application: 'UHV (Ultra High Vacuum)',
    maxIntegralRate: 1e-10,
    maxSingleLeak: 1e-11,
    testMethod: 'He-Leckdetektor direkt',
    notes: ['Standard für Beschleuniger']
  },
  {
    application: 'HV (High Vacuum)',
    maxIntegralRate: 1e-8,
    maxSingleLeak: 1e-9,
    testMethod: 'He-Leckdetektor',
    notes: ['Industriestandard']
  },
  {
    application: 'CF-Flansch (Metalldichtung)',
    maxIntegralRate: 1e-11,
    maxSingleLeak: 1e-12,
    testMethod: 'He-Sprühtest',
    notes: ['Pro Flansch']
  },
  {
    application: 'KF-Flansch (O-Ring)',
    maxIntegralRate: 1e-8,
    maxSingleLeak: 1e-9,
    testMethod: 'He-Sprühtest',
    notes: ['Viton O-Ring typisch']
  },
  {
    application: 'Semiconductor (CVD/ALD)',
    maxIntegralRate: 1e-9,
    maxSingleLeak: 1e-10,
    testMethod: 'He-Integraltest',
    notes: ['Prozessreinheit kritisch']
  }
];

/**
 * He-Hintergrund in Atmosphäre
 * Wichtig für Interpretation von m/z 4 Peaks
 */
export const HELIUM_BACKGROUND = {
  atmosphericConcentration_ppm: 5.24,
  partialPressure_mbar: 5.24e-6,  // Bei 1 atm
  
  /**
   * Bei Luftleck: erwartetes He/N₂ Verhältnis
   */
  expectedHeN2Ratio: 5.24e-6 / 0.78,  // ~6.7×10⁻⁶
  
  /**
   * Wenn He/N₂ >> 6.7×10⁻⁶, dann externes He (Sprühtest oder Leck)
   */
};

/**
 * Berechnet Leckrate aus RGA-Daten
 */
export function calculateLeakRateFromRGA(
  hePeakIntensity_A: number,
  totalIonCurrent_A: number,
  totalPressure_mbar: number,
  pumpingSpeed_Lpers: number,
  heRelativeSensitivity: number = 0.14  // RSF für He
): {
  hePartialPressure_mbar: number;
  estimatedLeakRate_mbarLpers: number;
  isAtmosphericHe: boolean;
  interpretation: string;
} {
  // He Partialdruck
  const hePartialPressure = (hePeakIntensity_A / totalIonCurrent_A) * 
    totalPressure_mbar / heRelativeSensitivity;
  
  // Leckrate Q = p × S
  const estimatedLeakRate = hePartialPressure * pumpingSpeed_Lpers;
  
  // Prüfe ob atmosphärisches He
  const n2Fraction = 0.78;  // N₂ in Luft
  const expectedHeIfAirLeak = totalPressure_mbar * HELIUM_BACKGROUND.atmosphericConcentration_ppm * 1e-6;
  const isAtmosphericHe = Math.abs(hePartialPressure - expectedHeIfAirLeak) / expectedHeIfAirLeak < 0.5;
  
  let interpretation: string;
  if (isAtmosphericHe) {
    interpretation = 'He-Peak konsistent mit Luftleck (atmosphärisches He)';
  } else if (hePartialPressure > expectedHeIfAirLeak * 10) {
    interpretation = 'He-Peak deutlich erhöht → Externes He (Sprühtest aktiv?)';
  } else {
    interpretation = 'He unter Nachweisgrenze oder Hintergrund';
  }
  
  return {
    hePartialPressure_mbar: hePartialPressure,
    estimatedLeakRate_mbarLpers: estimatedLeakRate,
    isAtmosphericHe,
    interpretation
  };
}
```

### Quellen
- **Leybold**: What is a leak and how to measure the leak rate
- **CERN CAS**: Zapfe, K. "Leak detection" (2007)
- **ISO 20484:2017**: Non-destructive testing — Leak testing
- **Pfeiffer Vacuum**: Leak Detection Know-How
- **Meyer Tool**: Leak Test Procedures and Specifications
- **Allectra**: Notes for High Vacuum and UHV Practice

---

## 5. Erweiterte Öl-Diagnose (PRIORITÄT MITTEL)

### Problem
Unterscheidung verschiedener Öltypen ist für Fehlersuche essentiell.

### Implementierung

```typescript
// src/lib/knowledge/oilPatterns.ts

export interface OilSignature {
  id: string;
  name: string;
  type: 'mineral' | 'pfpe' | 'silicone' | 'ester';
  source: string;
  
  // Charakteristische Peaks
  baseFragment: number;
  keyPeaks: number[];
  
  // Muster-Erkennung
  pattern: {
    type: 'delta14' | 'cf3dominant' | 'silyl' | 'other';
    description: string;
  };
  
  // Peaks die NICHT vorhanden sein sollten
  absencePeaks: number[];
  
  diagnosticRatios: {
    masses: [number, number];
    typicalRatio: number;
    tolerance: number;
  }[];
}

export const OIL_SIGNATURES: OilSignature[] = [
  {
    id: 'mineral-rotary',
    name: 'Mineralöl (Drehschieber-Vorpumpe)',
    type: 'mineral',
    source: 'Rückströmung von Drehschieber-Vorpumpe',
    baseFragment: 43,
    keyPeaks: [41, 43, 55, 57, 69, 71, 83, 85, 97],
    pattern: {
      type: 'delta14',
      description: 'Δ14 amu "Lattenzaun"-Muster (CₙH₂ₙ₊₁⁺ Alkyl-Kationen)'
    },
    absencePeaks: [73],  // Kein Silikon
    diagnosticRatios: [
      { masses: [43, 57], typicalRatio: 1.5, tolerance: 30 },
      { masses: [55, 57], typicalRatio: 0.8, tolerance: 25 }
    ]
  },
  {
    id: 'mineral-turbo',
    name: 'Mineralöl (Turbopumpen-Lager)',
    type: 'mineral',
    source: 'Lager-Öl von Turbomolekularpumpe',
    baseFragment: 43,
    keyPeaks: [41, 43, 55, 57, 69, 71, 83, 85],
    pattern: {
      type: 'delta14',
      description: 'Δ14 Muster, aber höherer m/z 71 Peak (verzweigte KW)'
    },
    absencePeaks: [73],
    diagnosticRatios: [
      { masses: [71, 57], typicalRatio: 1.2, tolerance: 30 }  // Höher als Rotary
    ]
  },
  {
    id: 'fomblin-pfpe',
    name: 'Fomblin/PFPE',
    type: 'pfpe',
    source: 'Perfluorpolyether-Öl (Vorpumpe oder Diffusionspumpe)',
    baseFragment: 69,
    keyPeaks: [69, 31, 47, 50, 100, 119],
    pattern: {
      type: 'cf3dominant',
      description: 'CF₃⁺ (m/z 69) dominant, keine Alkyl-Peaks'
    },
    absencePeaks: [41, 43, 55, 57],  // KEINE Kohlenwasserstoffe!
    diagnosticRatios: [
      { masses: [69, 31], typicalRatio: 3.0, tolerance: 40 }
    ]
  },
  {
    id: 'dc705-silicone',
    name: 'DC705 (Silikon-Diffusionspumpenöl)',
    type: 'silicone',
    source: 'Diffusionspumpe mit Silikonöl',
    baseFragment: 78,  // Phenyl
    keyPeaks: [78, 73, 147, 207, 281],
    pattern: {
      type: 'silyl',
      description: 'Phenyl (m/z 78) + Trimethylsilyl (m/z 73)'
    },
    absencePeaks: [],
    diagnosticRatios: [
      { masses: [78, 73], typicalRatio: 2.0, tolerance: 40 }
    ]
  },
  {
    id: 'pdms-silicone',
    name: 'PDMS (Silikon-Kontamination)',
    type: 'silicone',
    source: 'Silikon-Fett, -Schläuche, O-Ringe',
    baseFragment: 73,
    keyPeaks: [73, 147, 207, 221, 281],
    pattern: {
      type: 'silyl',
      description: 'Trimethylsilyl-Serie: 73, 147, 207, 281 (Δ74 amu)'
    },
    absencePeaks: [],
    diagnosticRatios: [
      { masses: [147, 73], typicalRatio: 0.3, tolerance: 50 }
    ]
  }
];

/**
 * Identifiziert Ölkontamination basierend auf Spektrum
 */
export function identifyOilContamination(
  spectrum: Map<number, number>  // m/z → relative Intensität
): {
  identified: OilSignature | null;
  confidence: number;
  matchedPeaks: number[];
  missingPeaks: number[];
  unexpectedPeaks: number[];
  ratioChecks: { ratio: string; passed: boolean; measured: number; expected: number }[];
} {
  let bestMatch: OilSignature | null = null;
  let bestScore = 0;
  let bestDetails: any = null;
  
  for (const oil of OIL_SIGNATURES) {
    let score = 0;
    const matchedPeaks: number[] = [];
    const missingPeaks: number[] = [];
    const unexpectedPeaks: number[] = [];
    const ratioChecks: any[] = [];
    
    // Prüfe Schlüssel-Peaks
    for (const peak of oil.keyPeaks) {
      if ((spectrum.get(peak) || 0) > 0.1) {
        matchedPeaks.push(peak);
        score += 1 / oil.keyPeaks.length;
      } else {
        missingPeaks.push(peak);
      }
    }
    
    // Prüfe Abwesenheits-Peaks (sollten NICHT vorhanden sein)
    for (const peak of oil.absencePeaks) {
      if ((spectrum.get(peak) || 0) > 1) {
        unexpectedPeaks.push(peak);
        score -= 0.2;
      }
    }
    
    // Prüfe diagnostische Verhältnisse
    for (const ratio of oil.diagnosticRatios) {
      const val1 = spectrum.get(ratio.masses[0]) || 0;
      const val2 = spectrum.get(ratio.masses[1]) || 0;
      if (val2 > 0) {
        const measuredRatio = val1 / val2;
        const deviation = Math.abs(measuredRatio - ratio.typicalRatio) / ratio.typicalRatio * 100;
        const passed = deviation <= ratio.tolerance;
        ratioChecks.push({
          ratio: `${ratio.masses[0]}/${ratio.masses[1]}`,
          passed,
          measured: measuredRatio,
          expected: ratio.typicalRatio
        });
        if (passed) score += 0.2;
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = oil;
      bestDetails = { matchedPeaks, missingPeaks, unexpectedPeaks, ratioChecks };
    }
  }
  
  return {
    identified: bestMatch,
    confidence: Math.min(1, bestScore),
    ...bestDetails
  };
}
```

### Quellen
- **Kurt J. Lesker**: Advanced RGA Spectra Interpretation
- **MKS Instruments**: Residual Gas Analysis Application Note
- **YTI Online**: RGA Spectra Data Interpretation Guide
- **NIST Chemistry WebBook**: Mass Spectra Database

---

## 6. Massenauflösung und Peak-Überlappung (PRIORITÄT NIEDRIG)

### Problem
Die App geht von perfekter Massentrennung aus, was unrealistisch ist.

### Implementierung

```typescript
// src/lib/knowledge/massOverlap.ts

export interface MassOverlap {
  mass: number;
  overlappingSpecies: {
    species: string;
    formula: string;
    contributionType: 'parent' | 'fragment';
  }[];
  resolutionRequired: number;  // m/Δm für Trennung
  disambiguation: {
    method: string;
    checkMasses: number[];
    expectedRatios?: { masses: [number, number]; ratio: number }[];
  };
}

export const CRITICAL_OVERLAPS: MassOverlap[] = [
  {
    mass: 28,
    overlappingSpecies: [
      { species: 'N₂', formula: 'N2', contributionType: 'parent' },
      { species: 'CO', formula: 'CO', contributionType: 'parent' },
      { species: 'C₂H₄', formula: 'C2H4', contributionType: 'parent' },
      { species: 'C₂H₆', formula: 'C2H6', contributionType: 'fragment' },
      { species: 'Si', formula: 'Si', contributionType: 'parent' }
    ],
    resolutionRequired: 2500,  // Für CO/N₂ Trennung
    disambiguation: {
      method: 'Fragment-Analyse',
      checkMasses: [12, 14, 16, 29],
      expectedRatios: [
        { masses: [14, 28], ratio: 0.07 },   // N₂: N⁺/N₂⁺
        { masses: [12, 28], ratio: 0.05 },   // CO: C⁺/CO⁺
        { masses: [29, 28], ratio: 0.007 }   // N₂: ¹⁴N¹⁵N/¹⁴N₂
      ]
    }
  },
  {
    mass: 32,
    overlappingSpecies: [
      { species: 'O₂', formula: 'O2', contributionType: 'parent' },
      { species: 'S', formula: 'S', contributionType: 'parent' },
      { species: 'CH₃OH', formula: 'CH3OH', contributionType: 'parent' },
      { species: 'N₂H₄', formula: 'N2H4', contributionType: 'parent' }
    ],
    resolutionRequired: 800,
    disambiguation: {
      method: 'Isotopen- und Fragment-Analyse',
      checkMasses: [16, 34, 31],
      expectedRatios: [
        { masses: [32, 34], ratio: 22.4 },  // Schwefel-Isotope
        { masses: [16, 32], ratio: 0.23 },  // O₂: O⁺/O₂⁺
        { masses: [31, 32], ratio: 0.95 }   // Methanol-Fragment
      ]
    }
  },
  {
    mass: 44,
    overlappingSpecies: [
      { species: 'CO₂', formula: 'CO2', contributionType: 'parent' },
      { species: 'N₂O', formula: 'N2O', contributionType: 'parent' },
      { species: 'C₃H₈', formula: 'C3H8', contributionType: 'parent' },
      { species: 'SiO', formula: 'SiO', contributionType: 'parent' }
    ],
    resolutionRequired: 1200,
    disambiguation: {
      method: 'Fragment-Analyse',
      checkMasses: [12, 16, 22, 28, 29, 30],
      expectedRatios: [
        { masses: [12, 44], ratio: 0.09 },   // CO₂: C⁺
        { masses: [22, 44], ratio: 0.02 },   // CO₂: CO₂²⁺
        { masses: [30, 44], ratio: 0.31 },   // N₂O: NO⁺
        { masses: [29, 44], ratio: 0.9 }     // Propan: C₂H₅⁺
      ]
    }
  },
  {
    mass: 84,
    overlappingSpecies: [
      { species: 'Kr', formula: 'Kr', contributionType: 'parent' },
      { species: 'CH₂Cl₂ (DCM)', formula: 'CH2Cl2', contributionType: 'parent' },
      { species: 'C₆H₁₂ (Cyclohexan)', formula: 'C6H12', contributionType: 'parent' }
    ],
    resolutionRequired: 600,
    disambiguation: {
      method: 'Isotopenmuster',
      checkMasses: [49, 51, 82, 83, 86],
      expectedRatios: [
        { masses: [84, 86], ratio: 3.3 },   // Kr-Isotope
        { masses: [49, 51], ratio: 3.0 }    // Cl-Isotope (DCM-Fragment)
      ]
    }
  }
];

/**
 * Generiert Warnung wenn kritische Masse ohne Bestätigung vorliegt
 */
export function checkForAmbiguousPeaks(
  spectrum: Map<number, number>,
  assignedSpecies: Map<number, string>
): {
  mass: number;
  warning: string;
  suggestedChecks: string[];
}[] {
  const warnings: any[] = [];
  
  for (const overlap of CRITICAL_OVERLAPS) {
    const peakIntensity = spectrum.get(overlap.mass) || 0;
    if (peakIntensity < 0.5) continue;  // Zu klein
    
    // Prüfe ob Bestätigungsmassen vorhanden
    let confirmed = false;
    const missing: number[] = [];
    
    for (const checkMass of overlap.disambiguation.checkMasses) {
      if ((spectrum.get(checkMass) || 0) > 0.1) {
        confirmed = true;
      } else {
        missing.push(checkMass);
      }
    }
    
    if (!confirmed && missing.length === overlap.disambiguation.checkMasses.length) {
      warnings.push({
        mass: overlap.mass,
        warning: `m/z ${overlap.mass} ohne Bestätigungsmassen - könnte sein: ${
          overlap.overlappingSpecies.map(s => s.species).join(', ')
        }`,
        suggestedChecks: [
          `Prüfe Massen: ${missing.join(', ')}`,
          overlap.disambiguation.method
        ]
      });
    }
  }
  
  return warnings;
}
```

### Quellen
- **Dawson, P.H.** "Quadrupole Mass Spectrometry and Its Applications" (AIP, 1995)
- **CERN CAS Tutorial**: RGA Interpretation (Jenninger & Chiggiato)

---

## 7. Pfeiffer-spezifische Erweiterungen (PRIORITÄT NIEDRIG)

### Implementierung

```typescript
// src/lib/knowledge/pfeifferSpecific.ts

export interface PfeifferRGAModel {
  model: string;
  massRange: [number, number];
  resolution: number;           // m/Δm bei 10% Höhe
  sensitivity_Faraday: number;  // A/mbar
  sensitivity_SEM: number;      // A/mbar (typisch 1000x höher)
  minDetectablePP: number;      // Partialdruck in mbar
  maxOperatingPressure: number; // mbar
  filamentMaterial: string;
  notes: string[];
}

export const PFEIFFER_RGA_MODELS: PfeifferRGAModel[] = [
  {
    model: 'PrismaPlus QMG 220',
    massRange: [1, 100],
    resolution: 0.5,  // bei m/z 28
    sensitivity_Faraday: 1e-4,
    sensitivity_SEM: 1e-1,
    minDetectablePP: 5e-14,
    maxOperatingPressure: 1e-4,
    filamentMaterial: 'Wolfram',
    notes: [
      'Kompaktes Design',
      'Quadera Software',
      'Max. Bakeout 300°C'
    ]
  },
  {
    model: 'PrismaPlus QMG 220 F1',
    massRange: [1, 100],
    resolution: 0.5,
    sensitivity_Faraday: 1e-4,
    sensitivity_SEM: 1e-1,
    minDetectablePP: 5e-14,
    maxOperatingPressure: 1e-4,
    filamentMaterial: 'Yttriumoxid-beschichtetes Iridium',
    notes: [
      'Für reaktive Gase',
      'Längere Filament-Lebensdauer',
      'Geeignet für Halbleiter-Prozesse'
    ]
  },
  {
    model: 'QME 220',
    massRange: [1, 200],
    resolution: 1.0,  // bei m/z 131
    sensitivity_Faraday: 5e-5,
    sensitivity_SEM: 5e-2,
    minDetectablePP: 1e-13,
    maxOperatingPressure: 1e-4,
    filamentMaterial: 'Wolfram',
    notes: [
      'Erweiterter Massenbereich',
      'Für schwerere Prozessgase (Xe, SF₆, WF₆)'
    ]
  }
];

/**
 * Typische Emissionsströme und deren Effekte
 */
export const EMISSION_CURRENT_EFFECTS = {
  low: {
    current_mA: 0.2,
    sensitivity: 'Niedrig',
    esdArtifacts: 'Minimal',
    filamentLife: 'Maximal',
    useCase: 'UHV-Anwendungen, empfindliche Oberflächen'
  },
  standard: {
    current_mA: 1.0,
    sensitivity: 'Mittel',
    esdArtifacts: 'Moderat',
    filamentLife: 'Normal',
    useCase: 'Standard-Restgasanalyse'
  },
  high: {
    current_mA: 2.0,
    sensitivity: 'Hoch',
    esdArtifacts: 'Erhöht',
    filamentLife: 'Reduziert',
    useCase: 'Niedrigdruck-Messungen, Spurenanalyse'
  }
};

/**
 * Quadera Export-Format Parser
 */
export function parseQuaderaExport(csvContent: string): {
  metadata: Record<string, string>;
  spectrum: { mass: number; intensity: number; unit: string }[];
} {
  // Implementierung für Quadera CSV/ASCII Export
  const lines = csvContent.split('\n');
  const metadata: Record<string, string> = {};
  const spectrum: any[] = [];
  
  let inData = false;
  for (const line of lines) {
    if (line.startsWith('#')) {
      // Metadata
      const [key, value] = line.substring(1).split(':').map(s => s.trim());
      if (key && value) metadata[key] = value;
    } else if (line.includes('Mass') && line.includes('Intensity')) {
      inData = true;
      continue;
    } else if (inData && line.trim()) {
      const [mass, intensity, unit] = line.split(/[\t,;]/).map(s => s.trim());
      spectrum.push({
        mass: parseFloat(mass),
        intensity: parseFloat(intensity),
        unit: unit || 'A'
      });
    }
  }
  
  return { metadata, spectrum };
}
```

### Quellen
- **Pfeiffer Vacuum**: Operating Instructions Prisma Plus (BG 3001 PE)
- **Pfeiffer Vacuum**: Mass Spectrometer Know-How Book
- **Pfeiffer Vacuum**: Quadera Software Manual

---

## 8. Konfidenz-Score System (PRIORITÄT HOCH)

### Implementierung

```typescript
// src/lib/analysis/confidenceScoring.ts

export interface IdentificationConfidence {
  species: string;
  totalConfidence: number;  // 0-1
  
  breakdown: {
    mainPeakPresent: boolean;      // +40%
    mainPeakIntensity: number;     // Relative Stärke
    
    fragmentsMatched: number;      // Anzahl
    fragmentsExpected: number;     // Erwartet
    fragmentScore: number;         // +30%
    
    isotopePatternMatch: boolean;  // Wenn applicable
    isotopeScore: number;          // +30%
    
    ratiosCorrect: number;         // Verhältnisse OK
    ratioScore: number;
  };
  
  warnings: string[];
  alternativeSpecies: string[];
}

export function calculateIdentificationConfidence(
  species: GasSpecies,
  spectrum: Map<number, number>,
  isotopePatterns: IsotopePattern[]
): IdentificationConfidence {
  const result: IdentificationConfidence = {
    species: species.key,
    totalConfidence: 0,
    breakdown: {
      mainPeakPresent: false,
      mainPeakIntensity: 0,
      fragmentsMatched: 0,
      fragmentsExpected: Object.keys(species.crackingPattern).length,
      fragmentScore: 0,
      isotopePatternMatch: false,
      isotopeScore: 0,
      ratiosCorrect: 0,
      ratioScore: 0
    },
    warnings: [],
    alternativeSpecies: []
  };
  
  // 1. Hauptpeak (40%)
  const mainIntensity = spectrum.get(species.mainMass) || 0;
  result.breakdown.mainPeakPresent = mainIntensity > 0.1;
  result.breakdown.mainPeakIntensity = mainIntensity;
  
  if (result.breakdown.mainPeakPresent) {
    result.totalConfidence += 0.4;
  }
  
  // 2. Fragmentmuster (30%)
  for (const [massStr, expectedRelative] of Object.entries(species.crackingPattern)) {
    const mass = parseInt(massStr);
    const measured = spectrum.get(mass) || 0;
    
    if (measured > 0.05) {
      result.breakdown.fragmentsMatched++;
    }
  }
  
  result.breakdown.fragmentScore = 
    (result.breakdown.fragmentsMatched / result.breakdown.fragmentsExpected) * 0.3;
  result.totalConfidence += result.breakdown.fragmentScore;
  
  // 3. Isotopenmuster (30%) - wenn applicable
  // ... (Integration mit checkIsotopeRatio)
  
  // Warnungen generieren
  if (result.totalConfidence < 0.5) {
    result.warnings.push('Niedrige Konfidenz - Prüfe alternative Zuordnungen');
  }
  
  if (!result.breakdown.mainPeakPresent) {
    result.warnings.push(`Hauptpeak m/z ${species.mainMass} nicht gefunden`);
  }
  
  return result;
}
```

---

## 9. UI-Empfehlungen

### Ausgasungs-Simulator
- Material-Dropdown mit Kategorien
- Eingabe: Oberfläche (cm²), Volumen (l), Pumpzeit (h), Bakeout ja/nein
- Ausgabe: Erwarteter Druckanstieg, Vergleich mit Messung
- Grafik: Druckverlauf über Zeit

### Isotopen-Checker
- Automatische Prüfung bei Peaks mit bekannten Isotopen
- Visuelle Anzeige: "Cl-Muster OK ✓" oder "⚠ Cl-Verhältnis abweichend"
- Berechnung für Multi-Halogen-Verbindungen

### ESD-Warnung
- Badge bei verdächtigen Peaks
- Info-Popup mit Erklärung und Gegenmaßnahmen

### Leckraten-Rechner
- Integration mit Rate-of-Rise
- Umrechnung zwischen Einheiten (mbar·l/s ↔ Pa·m³/s ↔ atm·cc/s)
- Vergleich mit Grenzwerten

---

## 10. Datenquellen-Zusammenfassung

| Quelle | Typ | URL/DOI |
|--------|-----|---------|
| VACOM White Paper WP00002 | Industriedokument | vacom.net |
| Chiggiato, P. CERN CAS | Vorlesung | indico.cern.ch/event/565314 |
| CERN-ACC-2014-0270 | Technical Report | cds.cern.ch/record/2723690 |
| de Csernatony, Vacuum 16-17 | Fachjournal | doi.org/10.1016/0042-207X(66)92464-X |
| PMC5226402 | Peer-reviewed | ncbi.nlm.nih.gov/pmc/articles/PMC5226402 |
| NIST Chemistry WebBook | Datenbank | webbook.nist.gov |
| Pfeiffer Vacuum Know-How | Herstellerdoku | pfeiffer-vacuum.com |
| Leybold Vacuum Fundamentals | Herstellerdoku | leybold.com |
| ISO 20484:2017 | Norm | iso.org |
| Edwards Application Note | Industriedokument | edwardsvacuum.com |

---

## Implementierungsreihenfolge

1. **Ausgasungs-Simulator** (Höchste Priorität - direkt nutzbarer Mehrwert)
2. **Erweitertes Isotopen-Modul** (Verbessert Identifikation deutlich)
3. **Konfidenz-Score System** (Macht Ergebnisse nachvollziehbar)
4. **Helium-Lecktest Integration** (Verbindet RGA mit Standard-Praxis)
5. **ESD-Warnsystem** (Vermeidet Fehlinterpretationen)
6. **Erweiterte Öl-Diagnose** (Häufiges Problem in der Praxis)
7. **Massenüberlappungs-Warnung** (Nice-to-have)
8. **Pfeiffer-spezifische Features** (Für interne Nutzung)

---

*Dokument erstellt für Claude Code Implementierung. Alle TypeScript-Interfaces sind direkt verwendbar.*
