/**
 * Cracking Pattern Dekonvolution
 *
 * Korrigiert Fragmentüberlappungen in RGA-Spektren.
 * Jedes Gas erzeugt Peaks bei mehreren Massen - ohne Korrektur
 * werden Fragmente doppelt gezählt.
 *
 * Beispiel CO₂:
 * - Hauptpeak m/z 44: 100%
 * - Fragment m/z 28: 10%
 * - Fragment m/z 16: 10%
 * - Fragment m/z 12: 8.7%
 *
 * Das Signal bei m/z 28 enthält ~10% CO₂, wird aber als N₂/CO interpretiert.
 */

import { DeconvolutionResult } from '@/types/calibration'

/**
 * Einfache Dekonvolution durch sequentielle Subtraktion
 * Schnell und robust für STANDARD-Level (~20-25% Genauigkeit)
 *
 * Reihenfolge wichtig: Eindeutige Peaks zuerst (CO₂, H₂O, Ar, O₂),
 * dann ambige (N₂/CO), zuletzt reine Peaks (H₂, CH₄)
 */
export function deconvoluteSimple(
  spectrum: Map<number, number>
): DeconvolutionResult {

  const corrected = new Map(spectrum)
  const contributions = new Map<string, number>()

  // 1. CO₂ identifizieren (m/z 44 ist eindeutig)
  const m44 = spectrum.get(44) || 0
  if (m44 > 0) {
    contributions.set('CO2', m44)
    // Fragmente abziehen
    subtractFragment(corrected, 28, m44 * 0.10)   // CO⁺
    subtractFragment(corrected, 16, m44 * 0.10)   // O⁺
    subtractFragment(corrected, 12, m44 * 0.087)  // C⁺
    subtractFragment(corrected, 22, m44 * 0.019)  // CO₂²⁺
  }

  // 2. H₂O identifizieren (m/z 18 ist relativ eindeutig)
  const m18 = spectrum.get(18) || 0
  if (m18 > 0) {
    contributions.set('H2O', m18)
    subtractFragment(corrected, 17, m18 * 0.23)   // OH⁺
    subtractFragment(corrected, 16, m18 * 0.015)  // O⁺
  }

  // 3. Ar identifizieren (m/z 40 ist eindeutig)
  const m40 = spectrum.get(40) || 0
  if (m40 > 0) {
    contributions.set('Ar', m40)
    subtractFragment(corrected, 20, m40 * 0.146)  // Ar²⁺
    subtractFragment(corrected, 36, m40 * 0.0034) // ³⁶Ar
  }

  // 4. O₂ identifizieren (m/z 32, nach Ar-Korrektur)
  const m32 = corrected.get(32) || 0
  if (m32 > 0) {
    contributions.set('O2', m32)
    subtractFragment(corrected, 16, m32 * 0.11)   // O⁺
  }

  // 5. N₂ vs CO unterscheiden (m/z 28)
  //    N₂: Fragment bei m/z 14 (~7.2%)
  //    CO: Fragment bei m/z 12 (~4.5%)
  const m28 = corrected.get(28) || 0
  const m14 = corrected.get(14) || 0
  const m12 = corrected.get(12) || 0

  if (m28 > 0) {
    // Aus m14 N₂-Anteil berechnen (m14 = 7.2% von N₂)
    // Aus m12 CO-Anteil berechnen (m12 = 4.5% von CO)
    const n2FromM14 = m14 / 0.072
    const coFromM12 = m12 / 0.045

    // Plausibilitätsprüfung: N₂ + CO sollte ungefähr m28 ergeben
    const total = n2FromM14 + coFromM12

    let n2Contribution: number
    let coContribution: number

    if (total > 0 && total <= m28 * 1.5) {
      // Berechnung plausibel - proportional aufteilen
      const scale = m28 / Math.max(total, m28)
      n2Contribution = n2FromM14 * scale
      coContribution = coFromM12 * scale
    } else {
      // Fallback: Hauptsächlich N₂ annehmen (typisch für Luftlecks)
      n2Contribution = m28 * 0.8
      coContribution = m28 * 0.2
    }

    if (n2Contribution > 0) {
      contributions.set('N2', n2Contribution)
      subtractFragment(corrected, 14, n2Contribution * 0.072)
    }
    if (coContribution > 0) {
      contributions.set('CO', coContribution)
      subtractFragment(corrected, 12, coContribution * 0.045)
      subtractFragment(corrected, 16, coContribution * 0.017)
    }
  }

  // 6. H₂ (m/z 2, meist sauber - nur H⁺ Fragment bei m/z 1)
  const m2 = corrected.get(2) || 0
  if (m2 > 0) {
    contributions.set('H2', m2)
    subtractFragment(corrected, 1, m2 * 0.05)
  }

  // 7. CH₄ (m/z 16 nach Abzug von O⁺-Fragmenten)
  //    CH₄ hat m15/m16 ≈ 0.85
  const m16remaining = corrected.get(16) || 0
  const m15 = spectrum.get(15) || 0
  if (m15 > 0 && m16remaining > 0) {
    // CH₄ aus m15 berechnen (m15 = 85% von m16 bei CH₄)
    const ch4FromM15 = m15 / 0.85
    const ch4Contribution = Math.min(m16remaining, ch4FromM15)
    if (ch4Contribution > 0) {
      contributions.set('CH4', ch4Contribution)
      subtractFragment(corrected, 15, ch4Contribution * 0.85)
      subtractFragment(corrected, 14, ch4Contribution * 0.16)
      subtractFragment(corrected, 13, ch4Contribution * 0.08)
      subtractFragment(corrected, 12, ch4Contribution * 0.038)
    }
  }

  // 8. He (m/z 4, eindeutig)
  const m4 = corrected.get(4) || 0
  if (m4 > 0) {
    contributions.set('He', m4)
  }

  // 9. Ne (m/z 20, nach Ar²⁺-Korrektur)
  const m20 = corrected.get(20) || 0
  if (m20 > 0) {
    contributions.set('Ne', m20)
  }

  // Residuen = nicht erklärte Signale
  const residuals = new Map<number, number>()
  for (const [mass, intensity] of corrected) {
    if (intensity > 0) {
      residuals.set(mass, intensity)
    }
  }

  return {
    correctedSpectrum: corrected,
    gasContributions: contributions,
    residuals
  }
}

/**
 * Subtrahiert ein Fragment vom Spektrum
 * Stellt sicher, dass keine negativen Werte entstehen
 */
function subtractFragment(
  spectrum: Map<number, number>,
  mass: number,
  amount: number
): void {
  const current = spectrum.get(mass) || 0
  spectrum.set(mass, Math.max(0, current - amount))
}

/**
 * Berechnet die Gesamt-Dekonvolutions-Qualität
 * Niedrige Residuen = gute Dekonvolution
 */
export function calculateDeconvolutionQuality(result: DeconvolutionResult): number {
  let totalSignal = 0
  let totalResidual = 0

  for (const [, intensity] of result.gasContributions) {
    totalSignal += intensity
  }

  for (const [, intensity] of result.residuals) {
    totalResidual += intensity
  }

  if (totalSignal + totalResidual === 0) return 0

  // Qualität = erklärter Anteil
  return totalSignal / (totalSignal + totalResidual)
}
