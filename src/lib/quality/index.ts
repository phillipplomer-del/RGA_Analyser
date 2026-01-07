import type { Peak, QualityCheck } from '@/types/rga'

// ============================================
// Korrektur-Funktionen
// ============================================

/**
 * Korrigiert m/z 28 für CO₂-Beitrag
 * CO₂ fragmentiert zu ~11% CO⁺ bei m/z 28
 *
 * @param m28_raw - Roher Wert bei m/z 28
 * @param m44 - Wert bei m/z 44 (CO₂)
 * @returns Korrigierter m/z 28 Wert (N₂ + CO ohne CO₂-Beitrag)
 */
export function applyCO2Correction(m28_raw: number, m44: number): number {
  const co2_contribution = m44 * 0.11  // CO₂ → CO⁺ ~11%
  return Math.max(0, m28_raw - co2_contribution)
}

/**
 * Unterscheidet CH₄ von O⁺ bei m/z 16
 *
 * m/z 15 (CH₃⁺) ist ein sauberer CH₄-Indikator (kein anderes häufiges Gas hat einen starken Peak dort)
 * O⁺ kommt hauptsächlich von O₂ und H₂O
 *
 * @param peaks - Peak-Daten als Record<mass, intensity>
 * @returns Analyse mit CH₄-Anteil, O⁺-Anteil und dominanter Quelle
 */
export function distinguishCH4FromO(peaks: Record<number, number>): {
  dominant: 'CH4' | 'O+' | 'mixed'
  ch4Fraction: number
  oFraction: number
  explanation: string
} {
  const m15 = peaks[15] || 0   // CH₃⁺ (nur CH₄)
  const m16 = peaks[16] || 0   // CH₄⁺ / O⁺
  const m18 = peaks[18] || 0   // H₂O⁺
  const m32 = peaks[32] || 0   // O₂⁺

  if (m16 === 0) {
    return { dominant: 'mixed', ch4Fraction: 0, oFraction: 0, explanation: 'Kein Signal bei m/z 16' }
  }

  // O⁺ Beitrag berechnen
  // H₂O → O⁺ ~1-2%, O₂ → O⁺ ~4-5%
  const o_from_h2o = m18 * 0.015
  const o_from_o2 = m32 * 0.045
  const total_o_contribution = o_from_h2o + o_from_o2

  // CH₄ Beitrag: m15/m16 ≈ 0.85 für reines CH₄
  // Also wenn m15 vorhanden, ist CH₄-Beitrag zu m16 ≈ m15 / 0.85
  const ch4_contribution = m15 / 0.85

  const total_estimate = total_o_contribution + ch4_contribution

  if (total_estimate === 0) {
    return { dominant: 'mixed', ch4Fraction: 0.5, oFraction: 0.5, explanation: 'Keine klaren Quellen identifiziert' }
  }

  const ch4Fraction = ch4_contribution / total_estimate
  const oFraction = total_o_contribution / total_estimate

  let dominant: 'CH4' | 'O+' | 'mixed'
  let explanation: string

  if (ch4Fraction > 0.7) {
    dominant = 'CH4'
    explanation = `m/z 16 hauptsächlich von CH₄ (CH₃⁺ bei m/z 15 = ${m15.toExponential(2)})`
  } else if (oFraction > 0.7) {
    dominant = 'O+'
    explanation = `m/z 16 hauptsächlich O⁺ von O₂/H₂O`
  } else {
    dominant = 'mixed'
    explanation = `m/z 16 ist Mischung: ~${(ch4Fraction * 100).toFixed(0)}% CH₄, ~${(oFraction * 100).toFixed(0)}% O⁺`
  }

  return { dominant, ch4Fraction, oFraction, explanation }
}

/**
 * Unterscheidet NH₃ von H₂O bei m/z 17
 *
 * H₂O → OH⁺ bei m/z 17 mit ~23% Intensität (relativ zu H₂O⁺ bei m/z 18)
 * NH₃ → NH₃⁺ bei m/z 17 als Hauptpeak
 *
 * @param peaks - Peak-Daten als Record<mass, intensity>
 * @returns Analyse mit NH₃-Überschuss und dominanter Quelle
 */
export function distinguishNH3FromH2O(peaks: Record<number, number>): {
  dominant: 'NH3' | 'H2O' | 'mixed'
  nh3Excess: number
  expectedOH: number
  explanation: string
} {
  const m16 = peaks[16] || 0   // NH₂⁺ / O⁺
  const m17 = peaks[17] || 0   // NH₃⁺ / OH⁺
  const m18 = peaks[18] || 0   // H₂O⁺

  // Erwarteter OH⁺ von H₂O: m18 × 0.23
  const expectedOH = m18 * 0.23
  const nh3Excess = Math.max(0, m17 - expectedOH)

  if (m17 === 0) {
    return { dominant: 'H2O', nh3Excess: 0, expectedOH, explanation: 'Kein Signal bei m/z 17' }
  }

  // NH₃ Bestätigung: m16/m17 ≈ 0.80 für NH₃ (NH₂⁺ Fragment)
  // Bei H₂O ist m16/m17 viel kleiner
  const m16_m17_ratio = m16 / m17

  let dominant: 'NH3' | 'H2O' | 'mixed'
  let explanation: string

  if (nh3Excess > expectedOH * 0.3 && m16_m17_ratio > 0.5) {
    dominant = 'NH3'
    explanation = `NH₃ dominant: Überschuss ${nh3Excess.toExponential(2)}, m16/m17 = ${m16_m17_ratio.toFixed(2)}`
  } else if (nh3Excess < expectedOH * 0.1) {
    dominant = 'H2O'
    explanation = `m/z 17 vollständig durch OH⁺ von H₂O erklärt`
  } else {
    dominant = 'mixed'
    explanation = `Mischung: ~${((nh3Excess / m17) * 100).toFixed(0)}% NH₃, Rest OH⁺ von H₂O`
  }

  return { dominant, nh3Excess, expectedOH, explanation }
}

// ============================================
// Qualitätsprüfungen
// ============================================

export function performQualityChecks(peaks: Peak[]): QualityCheck[] {
  const getPeak = (mass: number) => peaks.find((p) => p.mass === mass)?.integratedCurrent || 0

  const h2 = getPeak(2)
  const h2o = getPeak(18)
  const n2_co = getPeak(28)
  const o2 = getPeak(32)
  const ar = getPeak(40)
  const ar2plus = getPeak(20)  // Ar²⁺ Doppelionisation
  const n_frag = getPeak(14)
  const o_frag = getPeak(16)
  const c_frag = getPeak(12)   // C⁺ Fragment für CO-Unterscheidung
  const co2 = getPeak(44)      // CO₂
  const ch3 = getPeak(15)      // CH₃⁺ (CH₄ Indikator)
  const oh = getPeak(17)       // OH⁺ / NH₃⁺

  // Kohlenwasserstoffe
  const kw_light = getPeak(39) + getPeak(41) + getPeak(43) + getPeak(45)
  const kw_heavy = getPeak(69) + getPeak(77)

  // DESY HC-frei: Summe aller Massen 45-100
  const hcSum = [45, 55, 57, 69, 71, 77, 83, 85, 91].reduce((sum, m) => sum + getPeak(m), 0)

  const total = peaks.reduce((sum, p) => sum + p.integratedCurrent, 0)

  return [
    {
      name: 'H₂/H₂O Verhältnis',
      description: 'Wasserstoff muss mindestens 5× größer als Wasser sein',
      formula: 'H₂ > 5 × H₂O',
      passed: h2o === 0 || h2 > 5 * h2o,
      measuredValue: h2o > 0 ? h2 / h2o : Infinity,
      threshold: 5,
    },
    {
      name: 'N₂/O₂ Verhältnis (Luftleck)',
      description: 'N₂/CO muss mindestens 4× größer als O₂ sein (sonst Luftleck)',
      formula: 'N₂/CO > 4 × O₂',
      passed: o2 === 0 || n2_co > 4 * o2,
      measuredValue: o2 > 0 ? n2_co / o2 : Infinity,
      threshold: 4,
    },
    {
      name: 'Fragment-Konsistenz',
      description: 'N-Fragment sollte kleiner als O-Fragment sein',
      formula: 'Peak(14) < Peak(16)',
      passed: n_frag < o_frag || (n_frag === 0 && o_frag === 0),
      measuredValue: n_frag,
      threshold: o_frag,
    },
    {
      name: 'Leichte Kohlenwasserstoffe',
      description: 'Summe der Massen 39, 41-43, 45 unter 0.1% des Gesamtdrucks',
      formula: 'Σ(39,41,43,45) < 0.001 × Gesamt',
      passed: total === 0 || kw_light / total < 0.001,
      measuredValue: total > 0 ? (kw_light / total) * 100 : 0,
      threshold: 0.1,
    },
    {
      name: 'Schwere Kohlenwasserstoffe (Öl)',
      description: 'Summe der Massen 69, 77 unter 0.05% des Gesamtdrucks',
      formula: 'Σ(69,77) < 0.0005 × Gesamt',
      passed: total === 0 || kw_heavy / total < 0.0005,
      measuredValue: total > 0 ? (kw_heavy / total) * 100 : 0,
      threshold: 0.05,
    },
    // Neue Checks basierend auf Expertenwissen
    {
      name: 'Bakeout-Erfolg',
      description: 'Nach erfolgreichem Bakeout sollte H₂ dominieren (H₂ > H₂O)',
      formula: 'Peak(2) > Peak(18)',
      passed: h2 > h2o,
      measuredValue: h2o > 0 ? h2 / h2o : Infinity,
      threshold: 1,
    },
    {
      name: 'N₂ vs CO Unterscheidung',
      description: 'Prüft ob Peak 28 hauptsächlich N₂ ist (N-Fragment bei 14) oder CO (C-Fragment bei 12)',
      formula: 'Peak(14)/Peak(28) ≈ 0.07 für N₂',
      passed: n2_co === 0 || (n_frag / n2_co >= 0.05 && n_frag / n2_co <= 0.15),
      measuredValue: n2_co > 0 ? n_frag / n2_co : 0,
      threshold: 0.07,
    },
    {
      name: 'Ar Doppelionisation',
      description: 'Ar²⁺ bei m/z 20 sollte 10-15% von Ar⁺ bei m/z 40 sein',
      formula: 'Peak(20)/Peak(40) ≈ 0.1-0.15',
      passed: ar === 0 || (ar2plus / ar >= 0.08 && ar2plus / ar <= 0.20),
      measuredValue: ar > 0 ? ar2plus / ar : 0,
      threshold: 0.12,
    },
    {
      name: 'HC-frei (DESY)',
      description: 'Kohlenwasserstoffe (m/z 45-100) unter 0.1% des Gesamtdrucks',
      formula: 'Σ(45-100) < 0.001 × Gesamt',
      passed: total === 0 || hcSum / total < 0.001,
      measuredValue: total > 0 ? (hcSum / total) * 100 : 0,
      threshold: 0.1,
    },
    // Erweiterte Checks für Gas-Unterscheidung
    {
      name: 'CO₂-Korrektur für m/z 28',
      description: 'CO₂ trägt ~11% zu m/z 28 bei (CO⁺ Fragment). Korrigierter Wert zeigt echtes N₂+CO.',
      formula: 'm28_korr = m28 - (m44 × 0.11)',
      passed: true, // Informativer Check
      measuredValue: applyCO2Correction(n2_co, co2),
      threshold: n2_co, // Rohwert zum Vergleich
    },
    {
      name: 'CH₄ vs O⁺ bei m/z 16',
      description: 'CH₃⁺ bei m/z 15 ist sauberer CH₄-Indikator. O⁺ kommt von O₂ und H₂O.',
      formula: 'CH₄: m15/m16 ≈ 0.85',
      passed: ch3 === 0 || o_frag === 0 || ch3 / o_frag < 0.3, // Warnung wenn viel CH₄
      measuredValue: o_frag > 0 ? ch3 / o_frag : 0,
      threshold: 0.3,
    },
    {
      name: 'NH₃ vs H₂O bei m/z 17',
      description: 'H₂O → OH⁺ bei m/z 17 (~23%). Überschuss deutet auf NH₃ hin.',
      formula: 'm17_excess = m17 - (m18 × 0.23)',
      passed: oh === 0 || h2o === 0 || (oh - h2o * 0.23) / oh < 0.3, // Warnung wenn viel NH₃-Überschuss
      measuredValue: h2o > 0 ? oh / (h2o * 0.23) : 0,
      threshold: 1.3, // 30% Überschuss erlaubt
    },
    {
      name: 'CO-Beitrag (C⁺ Fragment)',
      description: 'C⁺ bei m/z 12 zeigt CO-Anteil. CO → C⁺ ~4.5%.',
      formula: 'Peak(12)/Peak(28) für CO-Anteil',
      passed: n2_co === 0 || c_frag / n2_co < 0.06, // Rein N₂ hätte ~0, CO ~0.045
      measuredValue: n2_co > 0 ? c_frag / n2_co : 0,
      threshold: 0.045,
    },
  ]
}
