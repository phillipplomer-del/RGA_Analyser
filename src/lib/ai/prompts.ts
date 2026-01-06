import type { AnalysisResult, ComparisonResult } from '@/types/rga'

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
  // New: Diagnostic results from knowledge-based analysis
  diagnostics?: Array<{
    type: string
    name: string
    confidence: number
    severity: string
    affectedMasses: number[]
    recommendation: string
  }>
  systemState?: string
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

  // Format diagnostics if available
  const diagnostics = result.diagnostics?.map(d => ({
    type: d.type,
    name: d.nameEn,
    confidence: d.confidence,
    severity: d.severity,
    affectedMasses: d.affectedMasses,
    recommendation: d.recommendationEn
  }))

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
    },
    diagnostics,
    systemState: result.diagnosisSummary?.systemState
  }
}

function formatValue(value: number): string {
  if (!isFinite(value)) return '∞'
  if (value < 0.01) return value.toExponential(2)
  return value.toFixed(2)
}

// Build the prompt for Gemini (token-optimized)
export function buildAnalysisPrompt(
  data: AIInputData,
  language: 'de' | 'en'
): string {
  const langInstructions = language === 'de'
    ? 'Antworte auf Deutsch.'
    : 'Answer in English.'

  const systemContext = `You are a UHV/RGA expert analyzing a Pfeiffer Vacuum Prisma mass spectrum.
${langInstructions}

Use Unicode for formulas (H₂O, CO₂, N₂). Use **bold** and bullets for structure.

Analyze: 1) Overall assessment 2) Gas composition 3) Contamination sources 4) Quality issues 5) Recommendations

Expert Knowledge Context:
- System states: unbaked (H₂O dominant), baked (H₂ dominant), contaminated (organic peaks), air_leak (N₂/O₂ ≈ 3.7)
- Cracking patterns: H₂O (18:100%, 17:23%, 16:1.5%), N₂ (28:100%, 14:7%), CO (28:100%, 12:5%), CO₂ (44:100%, 28:11%, 16:9%)
- Oil contamination: Δ14 amu pattern at m/z 41,55,69,83 = mineral oil backstreaming
- PFPE/Fomblin: m/z 69 (CF₃⁺) dominant WITHOUT alkyl peaks at 41,43,57
- Solvents: Acetone (43,58), IPA (45,43,27), Ethanol (31,45,46)
- ESD artifacts: Anomalous O⁺(16), F⁺(19), Cl⁺(35) without parent molecules
- N₂ vs CO: N₂ has fragment at m/z 14 (~7%), CO has fragment at m/z 12 (~5%)`

  // CSV format for peaks (most token-efficient)
  const peaksCSV = `mass,gas,intensity,gsi_ok,cern_ok
${data.peaks.map(p => `${p.mass},${p.gas},${p.intensity},${p.gsiOk ? 1 : 0},${p.cernOk ? 1 : 0}`).join('\n')}`

  // CSV format for quality checks
  const qualityCSV = `check,passed,value,threshold
${data.qualityChecks.map(q => `${q.name},${q.passed ? 1 : 0},${q.value},${q.threshold}`).join('\n')}`

  // Format diagnostics section if available
  const diagnosticsSection = data.diagnostics && data.diagnostics.length > 0
    ? `\nAUTOMATIC DIAGNOSTICS (confidence > 30%):
${data.diagnostics.map(d => `${d.severity.toUpperCase()}|${d.name}|conf:${(d.confidence * 100).toFixed(0)}%|masses:${d.affectedMasses.join(',')}|${d.recommendation}`).join('\n')}`
    : ''

  const systemStateInfo = data.systemState
    ? `\nSYSTEM_STATE: ${data.systemState}`
    : ''

  const dataSection = `
DATA:
file:${data.metadata.fileName}|date:${data.metadata.date}|pressure:${data.metadata.pressure}|chamber:${data.metadata.chamber}|range:${data.metadata.massRange}
GSI:${data.overallStatus.gsi.toUpperCase()}|CERN:${data.overallStatus.cern.toUpperCase()}${systemStateInfo}

PEAKS (top 15):
${peaksCSV}

QUALITY:
${qualityCSV}
${diagnosticsSection}

EXCEEDANCES:
${data.violations.length > 0 ? data.violations.join('\n') : 'none'}`

  return `${systemContext}\n${dataSection}\n\nAnalysis:`
}

// Comparison AI input structure
export interface AIComparisonData {
  before: AIInputData
  after: AIInputData
  comparison: {
    overallImprovement: number
    improvedPeaks: number
    worsenedPeaks: number
    totalPeaksCompared: number
    resolvedViolations: number
    newViolations: number
    overallGrade: string
  }
  peakChanges: Array<{
    mass: number
    gas: string
    beforeValue: string
    afterValue: string
    changePercent: number
    improved: boolean
  }>
}

// Convert comparison result to AI input format
export function formatComparisonForAI(
  beforeResult: AnalysisResult,
  afterResult: AnalysisResult,
  comparisonResult: ComparisonResult
): AIComparisonData {
  const before = formatAnalysisForAI(beforeResult)
  const after = formatAnalysisForAI(afterResult)

  // Get significant peak changes (> 5% change)
  const peakChanges = comparisonResult.peakComparisons
    .filter(p => Math.abs(p.percentageChange) > 5)
    .sort((a, b) => Math.abs(b.percentageChange) - Math.abs(a.percentageChange))
    .slice(0, 15)
    .map(p => ({
      mass: p.mass,
      gas: p.gasIdentification,
      beforeValue: `${(p.beforeValue * 100).toFixed(2)}%`,
      afterValue: `${(p.afterValue * 100).toFixed(2)}%`,
      changePercent: p.percentageChange,
      improved: p.percentageChange < 0 // Negative change = improvement (less contamination)
    }))

  return {
    before,
    after,
    comparison: {
      overallImprovement: comparisonResult.overallImprovement,
      improvedPeaks: comparisonResult.summary.improvedPeaks,
      worsenedPeaks: comparisonResult.summary.worsenedPeaks,
      totalPeaksCompared: comparisonResult.summary.totalPeaksCompared,
      resolvedViolations: comparisonResult.summary.resolvedViolations,
      newViolations: comparisonResult.summary.newViolations,
      overallGrade: comparisonResult.summary.overallGrade
    },
    peakChanges
  }
}

// Build the comparison prompt for Gemini (token-optimized)
export function buildComparisonPrompt(
  data: AIComparisonData,
  language: 'de' | 'en'
): string {
  const langInstructions = language === 'de'
    ? 'Antworte auf Deutsch.'
    : 'Answer in English.'

  const systemContext = `You are a UHV/RGA expert comparing BEFORE/AFTER spectra from a bakeout or cleaning.
${langInstructions}

Use Unicode for formulas (H₂O, CO₂, N₂). Use **bold** and bullets for structure.

Analyze: 1) Overall assessment 2) Key changes 3) Bakeout effectiveness 4) Remaining issues 5) Recommendations

Expert Knowledge Context:
- System states: unbaked (H₂O dominant), baked (H₂ dominant), contaminated (organic peaks), air_leak (N₂/O₂ ≈ 3.7)
- Successful bakeout: H₂O reduction >80%, H₂ becomes dominant, CO₂ reduced, hydrocarbons eliminated
- Oil contamination persists if m/z 41,55,69 don't reduce - need other cleaning methods
- Air leak doesn't improve with bakeout - look for N₂/O₂/Ar pattern unchanged
- Virtual leak: delayed pump-down, He test negative, often from trapped volumes`

  // CSV format for peak changes
  const changesCSV = data.peakChanges.length > 0
    ? `mass,gas,before,after,change%,improved
${data.peakChanges.map(p => `${p.mass},${p.gas},${p.beforeValue},${p.afterValue},${p.changePercent.toFixed(1)},${p.improved ? 1 : 0}`).join('\n')}`
    : 'no significant changes'

  // CSV for before peaks (top 10)
  const beforePeaksCSV = `mass,gas,intensity
${data.before.peaks.slice(0, 10).map(p => `${p.mass},${p.gas},${p.intensity}`).join('\n')}`

  // CSV for after peaks (top 10)
  const afterPeaksCSV = `mass,gas,intensity
${data.after.peaks.slice(0, 10).map(p => `${p.mass},${p.gas},${p.intensity}`).join('\n')}`

  const dataSection = `
BEFORE:
file:${data.before.metadata.fileName}|date:${data.before.metadata.date}|pressure:${data.before.metadata.pressure}
GSI:${data.before.overallStatus.gsi.toUpperCase()}|CERN:${data.before.overallStatus.cern.toUpperCase()}

AFTER:
file:${data.after.metadata.fileName}|date:${data.after.metadata.date}|pressure:${data.after.metadata.pressure}
GSI:${data.after.overallStatus.gsi.toUpperCase()}|CERN:${data.after.overallStatus.cern.toUpperCase()}

SUMMARY:
improvement:${data.comparison.overallImprovement.toFixed(1)}%|grade:${data.comparison.overallGrade}|improved_peaks:${data.comparison.improvedPeaks}/${data.comparison.totalPeaksCompared}|worsened_peaks:${data.comparison.worsenedPeaks}/${data.comparison.totalPeaksCompared}|resolved:${data.comparison.resolvedViolations}|new:${data.comparison.newViolations}

CHANGES (|delta|>5%):
${changesCSV}

BEFORE_PEAKS (top 10):
${beforePeaksCSV}

AFTER_PEAKS (top 10):
${afterPeaksCSV}

BEFORE_EXCEEDANCES:
${data.before.violations.length > 0 ? data.before.violations.join('\n') : 'none'}

AFTER_EXCEEDANCES:
${data.after.violations.length > 0 ? data.after.violations.join('\n') : 'none'}

BEFORE_DIAGNOSTICS:
${data.before.diagnostics && data.before.diagnostics.length > 0
    ? data.before.diagnostics.map(d => `${d.severity}|${d.name}|${(d.confidence * 100).toFixed(0)}%`).join('\n')
    : 'none'}

AFTER_DIAGNOSTICS:
${data.after.diagnostics && data.after.diagnostics.length > 0
    ? data.after.diagnostics.map(d => `${d.severity}|${d.name}|${(d.confidence * 100).toFixed(0)}%`).join('\n')
    : 'none'}

SYSTEM_STATE_CHANGE: ${data.before.systemState || 'unknown'} -> ${data.after.systemState || 'unknown'}`

  return `${systemContext}\n${dataSection}\n\nAnalysis:`
}
