import type { AnalysisResult } from '@/types/rga'

export interface AnimationStep {
  type: 'overview' | 'zoom' | 'highlight' | 'annotation'
  target?: { massStart: number; massEnd: number }
  peak?: number
  text?: string
  duration: number
}

export interface AnimationSequence {
  steps: AnimationStep[]
  duration: number
}

/**
 * Generate an animation sequence for the RGA spectrum presentation
 * The sequence highlights key peaks and provides a tour of the spectrum
 */
export function generateAnimationSequence(
  analysis: AnalysisResult
): AnimationSequence {
  const steps: AnimationStep[] = []

  // 1. Overview (2s)
  steps.push({
    type: 'overview',
    duration: 2000,
  })

  // 2. Zoom to H₂ peak region (1.5s)
  steps.push({
    type: 'zoom',
    target: { massStart: 0, massEnd: 10 },
    duration: 1500,
  })

  // 3. Highlight H₂ (mass 2)
  const h2Peak = analysis.peaks.find(p => p.mass === 2)
  if (h2Peak) {
    steps.push({
      type: 'highlight',
      peak: 2,
      text: `H₂ (${(h2Peak.normalizedValue * 100).toFixed(1)}%)`,
      duration: 2000,
    })
  }

  // 4. Zoom to H₂O region (14-22 AMU)
  steps.push({
    type: 'zoom',
    target: { massStart: 14, massEnd: 24 },
    duration: 1500,
  })

  // 5. Highlight H₂O (mass 18) if significant
  const h2oPeak = analysis.peaks.find(p => p.mass === 18)
  if (h2oPeak && h2oPeak.normalizedValue > 0.001) {
    steps.push({
      type: 'highlight',
      peak: 18,
      text: `H₂O (${(h2oPeak.normalizedValue * 100).toFixed(2)}%)`,
      duration: 2000,
    })
  }

  // 6. Zoom to N₂/CO/O₂ region (26-34 AMU)
  steps.push({
    type: 'zoom',
    target: { massStart: 26, massEnd: 36 },
    duration: 1500,
  })

  // 7. Highlight significant peaks in this region
  const significantPeaks = [28, 32]
  for (const mass of significantPeaks) {
    const peak = analysis.peaks.find(p => p.mass === mass)
    if (peak && peak.normalizedValue > 0.001) {
      steps.push({
        type: 'highlight',
        peak: mass,
        text: `${peak.gasIdentification} (${(peak.normalizedValue * 100).toFixed(2)}%)`,
        duration: 1800,
      })
    }
  }

  // 8. Zoom to CO₂ region (40-50 AMU)
  const co2Peak = analysis.peaks.find(p => p.mass === 44)
  if (co2Peak && co2Peak.normalizedValue > 0.0005) {
    steps.push({
      type: 'zoom',
      target: { massStart: 40, massEnd: 50 },
      duration: 1500,
    })

    steps.push({
      type: 'highlight',
      peak: 44,
      text: `CO₂ (${(co2Peak.normalizedValue * 100).toFixed(2)}%)`,
      duration: 2000,
    })
  }

  // 9. Check for heavy hydrocarbons (mass > 50)
  const heavyPeaks = analysis.peaks.filter(p => p.mass > 50 && p.normalizedValue > 0.001)
  if (heavyPeaks.length > 0) {
    steps.push({
      type: 'zoom',
      target: { massStart: 50, massEnd: 80 },
      duration: 1500,
    })

    // Highlight the most significant heavy peak
    const maxHeavy = heavyPeaks.reduce((max, p) =>
      p.normalizedValue > max.normalizedValue ? p : max
    )
    steps.push({
      type: 'highlight',
      peak: maxHeavy.mass,
      text: `${maxHeavy.gasIdentification} (${(maxHeavy.normalizedValue * 100).toFixed(3)}%)`,
      duration: 2000,
    })
  }

  // 10. Return to overview
  steps.push({
    type: 'overview',
    duration: 1500,
  })

  // 11. Final annotation with summary
  const gsiPassed = analysis.limitChecks.every(c => c.gsiPassed)
  const cernPassed = analysis.limitChecks.every(c => c.cernPassed)
  steps.push({
    type: 'annotation',
    text: gsiPassed && cernPassed
      ? '✅ All limits passed'
      : gsiPassed
        ? '⚠️ GSI passed, CERN failed'
        : '❌ Limits exceeded',
    duration: 3000,
  })

  return {
    steps,
    duration: steps.reduce((sum, s) => sum + s.duration, 0),
  }
}
