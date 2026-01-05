import type { AnalysisResult } from '@/types/rga'

// Simplified AI input structure
export interface AIInputData {
  metadata: {
    fileName: string
    date: string
    pressure: string
    chamber: string
    massRange: string
  }
  peaks: Array<{
    mass: number
    gas: string
    intensity: string
    gsiOk: boolean
    cernOk: boolean
  }>
  qualityChecks: Array<{
    name: string
    passed: boolean
    value: string
    threshold: string
  }>
  violations: string[]
  overallStatus: {
    gsi: 'passed' | 'failed'
    cern: 'passed' | 'failed'
  }
}

// Convert analysis result to AI input format
export function formatAnalysisForAI(result: AnalysisResult): AIInputData {
  // Get top 15 peaks by intensity
  const topPeaks = [...result.peaks]
    .sort((a, b) => b.normalizedValue - a.normalizedValue)
    .slice(0, 15)

  // Format peaks with limit status
  const peaks = topPeaks.map(peak => {
    const limitCheck = result.limitChecks.find(l => l.mass === peak.mass)
    return {
      mass: peak.mass,
      gas: peak.gasIdentification,
      intensity: `${(peak.normalizedValue * 100).toFixed(2)}%`,
      gsiOk: limitCheck?.gsiPassed ?? true,
      cernOk: limitCheck?.cernPassed ?? true
    }
  })

  // Format quality checks from array
  const qualityChecks = result.qualityChecks.map(check => ({
    name: check.name,
    passed: check.passed,
    value: formatValue(check.measuredValue),
    threshold: formatValue(check.threshold)
  }))

  // Collect violations
  const violations: string[] = []

  // Check limit violations
  result.limitChecks.forEach(check => {
    if (!check.gsiPassed) {
      const peak = result.peaks.find(p => p.mass === check.mass)
      const gasName = peak?.gasIdentification || `Mass ${check.mass}`
      violations.push(`${gasName}: ${(check.measuredValue * 100).toFixed(2)}% exceeds GSI limit of ${(check.gsiLimit * 100).toFixed(2)}%`)
    }
  })

  result.limitChecks.forEach(check => {
    if (!check.cernPassed && check.gsiPassed) { // Only add CERN if not already GSI violation
      const peak = result.peaks.find(p => p.mass === check.mass)
      const gasName = peak?.gasIdentification || `Mass ${check.mass}`
      violations.push(`${gasName}: ${(check.measuredValue * 100).toFixed(2)}% exceeds CERN limit of ${(check.cernLimit * 100).toFixed(2)}%`)
    }
  })

  // Check quality violations
  result.qualityChecks.forEach(check => {
    if (!check.passed) {
      violations.push(`${check.name}: ${check.description}`)
    }
  })

  // Calculate overall status
  const gsiPassed = result.limitChecks.every(c => c.gsiPassed) &&
    result.qualityChecks.every(c => c.passed)
  const cernPassed = result.limitChecks.every(c => c.cernPassed) &&
    result.qualityChecks.every(c => c.passed)

  return {
    metadata: {
      fileName: result.metadata.sourceFile,
      date: result.metadata.startTime?.toLocaleDateString() || 'Unknown',
      pressure: result.metadata.pressure || 'Unknown',
      chamber: result.metadata.chamberName || 'Unknown',
      massRange: `${result.metadata.firstMass || 0} - ${(result.metadata.firstMass || 0) + (result.metadata.scanWidth || 100)} AMU`
    },
    peaks,
    qualityChecks,
    violations,
    overallStatus: {
      gsi: gsiPassed ? 'passed' : 'failed',
      cern: cernPassed ? 'passed' : 'failed'
    }
  }
}

function formatValue(value: number): string {
  if (!isFinite(value)) return '∞'
  if (value < 0.01) return value.toExponential(2)
  return value.toFixed(2)
}

// Build the prompt for Gemini
export function buildAnalysisPrompt(
  data: AIInputData,
  language: 'de' | 'en'
): string {
  const langInstructions = language === 'de'
    ? 'Antworte auf Deutsch. Verwende wissenschaftliche Fachbegriffe.'
    : 'Answer in English. Use scientific terminology.'

  const systemContext = `You are an expert in Ultra-High Vacuum (UHV) technology and Residual Gas Analysis (RGA).
You are analyzing a mass spectrum from a Pfeiffer Vacuum Prisma Plus/Pro quadrupole mass spectrometer.
${langInstructions}

IMPORTANT FORMATTING RULES:
- Use Unicode subscript/superscript characters for chemical formulas, NOT LaTeX notation
- Examples: H₂O (not $H_2O$), CO₂ (not $CO_2$), N₂ (not $N_2$), O₂ (not $O_2$)
- Use proper Unicode: ₀₁₂₃₄₅₆₇₈₉ for subscripts, ⁺⁻ for charges
- Never use dollar signs ($) or backslashes (\\) for formatting
- Use **bold** and bullet points for structure

Your analysis should include:
1. **Overall Assessment**: Brief summary of spectrum quality
2. **Gas Composition Analysis**: Interpretation of detected gases and their sources
3. **Contamination Sources**: Identify potential contamination sources based on peak patterns
4. **Quality Issues**: Explain any failed quality checks or limit violations
5. **Recommendations**: Specific suggestions for improving vacuum quality

Important context:
- H₂ (Mass 2) is normalized to 100% - all other values are relative
- GSI/CERN limits are for particle accelerator vacuum systems
- Good UHV should be dominated by H₂ with minimal H₂O and hydrocarbons
- Air leaks show characteristic N₂/O₂ ratio around 4:1
- Hydrocarbon contamination indicates pump oil backstreaming or outgassing`

  const dataSection = `
## RGA Spectrum Data

### Metadata
- File: ${data.metadata.fileName}
- Date: ${data.metadata.date}
- Pressure: ${data.metadata.pressure}
- Chamber: ${data.metadata.chamber}
- Mass Range: ${data.metadata.massRange}

### Overall Status
- GSI Standard: ${data.overallStatus.gsi === 'passed' ? '✅ PASSED' : '❌ FAILED'}
- CERN Standard: ${data.overallStatus.cern === 'passed' ? '✅ PASSED' : '❌ FAILED'}

### Detected Peaks (Top 15 by intensity)
${data.peaks.map(p =>
    `- Mass ${p.mass} (${p.gas}): ${p.intensity} [GSI: ${p.gsiOk ? '✅' : '❌'}, CERN: ${p.cernOk ? '✅' : '❌'}]`
  ).join('\n')}

### Quality Checks
${data.qualityChecks.map(q =>
    `- ${q.name}: ${q.passed ? '✅' : '❌'} (Value: ${q.value}, Threshold: ${q.threshold})`
  ).join('\n')}

### Violations
${data.violations.length > 0 ? data.violations.map(v => `- ⚠️ ${v}`).join('\n') : '- None'}
`

  return `${systemContext}\n\n${dataSection}\n\nPlease provide your analysis:`
}
