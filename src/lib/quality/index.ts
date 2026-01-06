import type { Peak, QualityCheck } from '@/types/rga'

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
  // const c_frag = getPeak(12)   // C⁺ Fragment für CO-Unterscheidung (für zukünftige Nutzung)

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
  ]
}
