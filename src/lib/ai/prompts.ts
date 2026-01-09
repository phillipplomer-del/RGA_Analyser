import type { AnalysisResult, ComparisonResult, LimitProfile, NormalizedData } from '@/types/rga'
import { getLimitFromProfile } from '@/lib/limits'

// Profile check result for AI
export interface ProfileCheckResult {
  profileId: string
  profileName: string
  passed: boolean
  violationCount: number
  violations: Array<{
    mass: number
    gas: string
    measured: string
    limit: string
  }>
}

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
    profileStatus: Record<string, boolean>  // profileName -> passed
  }>
  qualityChecks: Array<{
    name: string
    passed: boolean
    value: string
    threshold: string
  }>
  // Profile-based limit results
  profileResults: ProfileCheckResult[]
  activeProfiles: string[]  // Active profile names
  // All violations from all profiles
  violations: string[]
  // Overall status per profile
  overallStatus: Record<string, 'passed' | 'failed'>
  // Diagnostic results from knowledge-based analysis
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
// Now accepts active limit profiles to check against all of them
export function formatAnalysisForAI(
  result: AnalysisResult,
  activeProfiles: LimitProfile[] = [],
  normalizedData: NormalizedData[] = []
): AIInputData {
  // Get top 15 peaks by intensity
  const topPeaks = [...result.peaks]
    .sort((a, b) => b.normalizedValue - a.normalizedValue)
    .slice(0, 15)

  // Check each profile for each peak
  const profileResults: ProfileCheckResult[] = activeProfiles.map(profile => {
    const violations: ProfileCheckResult['violations'] = []

    // Check each peak against this profile
    topPeaks.forEach(peak => {
      const limit = getLimitFromProfile(profile, peak.mass)
      if (limit !== Infinity && peak.normalizedValue > limit) {
        violations.push({
          mass: peak.mass,
          gas: peak.gasIdentification,
          measured: `${(peak.normalizedValue * 100).toFixed(2)}%`,
          limit: `${(limit * 100).toFixed(2)}%`
        })
      }
    })

    // Also check significant masses in normalized data
    if (normalizedData.length > 0) {
      normalizedData.forEach(point => {
        if (point.normalizedToH2 > 0.001) { // > 0.1%
          const limit = getLimitFromProfile(profile, point.mass)
          if (limit !== Infinity && point.normalizedToH2 > limit) {
            const alreadyViolated = violations.some(v => Math.abs(v.mass - point.mass) < 0.5)
            if (!alreadyViolated) {
              violations.push({
                mass: Math.round(point.mass),
                gas: `m/z ${Math.round(point.mass)}`,
                measured: `${(point.normalizedToH2 * 100).toFixed(2)}%`,
                limit: `${(limit * 100).toFixed(2)}%`
              })
            }
          }
        }
      })
    }

    return {
      profileId: profile.id,
      profileName: profile.name,
      passed: violations.length === 0,
      violationCount: violations.length,
      violations: violations.slice(0, 10) // Top 10 violations per profile
    }
  })

  // Format peaks with profile status
  const peaks = topPeaks.map(peak => {
    const profileStatus: Record<string, boolean> = {}

    activeProfiles.forEach(profile => {
      const limit = getLimitFromProfile(profile, peak.mass)
      profileStatus[profile.name] = limit === Infinity || peak.normalizedValue <= limit
    })

    return {
      mass: peak.mass,
      gas: peak.gasIdentification,
      intensity: `${(peak.normalizedValue * 100).toFixed(2)}%`,
      profileStatus
    }
  })

  // Format quality checks from array
  const qualityChecks = result.qualityChecks.map(check => ({
    name: check.name,
    passed: check.passed,
    value: formatValue(check.measuredValue),
    threshold: formatValue(check.threshold)
  }))

  // Collect all violations from all profiles
  const violations: string[] = []
  profileResults.forEach(pr => {
    pr.violations.forEach(v => {
      violations.push(`[${pr.profileName}] ${v.gas} (m/z ${v.mass}): ${v.measured} exceeds limit of ${v.limit}`)
    })
  })

  // Add quality violations
  result.qualityChecks.forEach(check => {
    if (!check.passed) {
      violations.push(`[Quality] ${check.name}: ${check.description}`)
    }
  })

  // Calculate overall status per profile
  const overallStatus: Record<string, 'passed' | 'failed'> = {}
  const qualityPassed = result.qualityChecks.every(c => c.passed)
  activeProfiles.forEach(profile => {
    const profileResult = profileResults.find(pr => pr.profileId === profile.id)
    const profilePassed = profileResult?.passed ?? true
    overallStatus[profile.name] = (profilePassed && qualityPassed) ? 'passed' : 'failed'
  })

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
    profileResults,
    activeProfiles: activeProfiles.map(p => p.name),
    violations,
    overallStatus,
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

  // Build profile names list for context
  const profileNames = data.activeProfiles.length > 0
    ? data.activeProfiles.join(', ')
    : 'GSI, CERN'

  const systemContext = `You are a UHV/RGA expert analyzing a Pfeiffer Vacuum Prisma mass spectrum.
${langInstructions}

Use Unicode for formulas (H₂O, CO₂, N₂). Use **bold** and bullets for structure.

Analyze: 1) Overall assessment 2) Gas composition 3) Contamination sources 4) Limit compliance (${profileNames}) 5) Recommendations

**IMPORTANT: All intensity values are NORMALIZED to the H₂ peak (m/z 2) = 100% = 1.0**
This is standard UHV practice where hydrogen is the reference. All percentages shown are relative to H₂.

Expert Knowledge Context:
- Normalization: H₂ (m/z 2) = 100% is the reference; all other peaks shown as % of H₂
- System states: unbaked (H₂O dominant), baked (H₂ dominant), contaminated (organic peaks), air_leak (N₂/O₂ ≈ 3.7)
- Cracking patterns: H₂O (18:100%, 17:23%, 16:1.5%), N₂ (28:100%, 14:7%), CO (28:100%, 12:5%), CO₂ (44:100%, 28:11%, 16:9%)
- Oil contamination: Δ14 amu pattern at m/z 41,55,69,83 = mineral oil backstreaming
- PFPE/Fomblin: m/z 69 (CF₃⁺) dominant WITHOUT alkyl peaks at 41,43,57
- Solvents: Acetone (43,58), IPA (45,43,27), Ethanol (31,45,46)
- ESD artifacts: 6 criteria detect elevated atomic ions from ionizer grid desorption: (1) O⁺/O₂ ratio >0.50, (2) N⁺/N₂ ratio >0.15, (3) C⁺/CO ratio >0.12, (4) H⁺/H₂ ratio >0.05, (5) F⁺(19) without CF₃⁺(69), (6) Anomalous Cl isotope ratios (³⁵Cl/³⁷Cl ≠ 3.1). Severity: info at 2-3 criteria, warning at ≥4 criteria
- N₂ vs CO: N₂ has fragment at m/z 14 (~7%), CO has fragment at m/z 12 (~5%)`

  // CSV format for peaks with profile status
  const profileHeaders = data.activeProfiles.length > 0
    ? data.activeProfiles.map(p => p.replace(/[,\s]/g, '_')).join(',')
    : 'GSI,CERN'

  const peaksCSV = `mass,gas,intensity,${profileHeaders}
${data.peaks.map(p => {
    const statusCols = data.activeProfiles.length > 0
      ? data.activeProfiles.map(name => p.profileStatus[name] ? '1' : '0').join(',')
      : '1,1'  // Default if no profiles
    return `${p.mass},${p.gas},${p.intensity},${statusCols}`
  }).join('\n')}`

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

  // Format profile status summary
  const profileStatusSummary = data.activeProfiles.length > 0
    ? data.activeProfiles.map(name =>
        `${name}:${data.overallStatus[name]?.toUpperCase() || 'N/A'}`
      ).join('|')
    : 'GSI:PASSED|CERN:PASSED'

  // Format profile results summary
  const profileResultsSummary = data.profileResults && data.profileResults.length > 0
    ? `\nPROFILE_RESULTS:\n${data.profileResults.map(pr =>
        `${pr.profileName}: ${pr.passed ? 'PASSED' : `FAILED (${pr.violationCount} violations)`}`
      ).join('\n')}`
    : ''

  const dataSection = `
DATA:
file:${data.metadata.fileName}|date:${data.metadata.date}|pressure:${data.metadata.pressure}|chamber:${data.metadata.chamber}|range:${data.metadata.massRange}
ACTIVE_PROFILES: ${profileNames}
STATUS: ${profileStatusSummary}${systemStateInfo}
${profileResultsSummary}

PEAKS (top 15):
${peaksCSV}

QUALITY:
${qualityCSV}
${diagnosticsSection}

LIMIT_EXCEEDANCES:
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
  comparisonResult: ComparisonResult,
  activeProfiles: LimitProfile[] = []
): AIComparisonData {
  const before = formatAnalysisForAI(beforeResult, activeProfiles)
  const after = formatAnalysisForAI(afterResult, activeProfiles)

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

  // Build profile names list for context
  const profileNames = data.before.activeProfiles.length > 0
    ? data.before.activeProfiles.join(', ')
    : 'GSI, CERN'

  const systemContext = `You are a UHV/RGA expert comparing BEFORE/AFTER spectra from a bakeout or cleaning.
${langInstructions}

Use Unicode for formulas (H₂O, CO₂, N₂). Use **bold** and bullets for structure.

Analyze: 1) Overall assessment 2) Key changes 3) Bakeout effectiveness 4) Limit compliance (${profileNames}) 5) Recommendations

**IMPORTANT: All intensity values are NORMALIZED to the H₂ peak (m/z 2) = 100% = 1.0**
This is standard UHV practice where hydrogen is the reference. All percentages and changes shown are relative to H₂.

Expert Knowledge Context:
- Normalization: H₂ (m/z 2) = 100% is the reference; all other peaks shown as % of H₂
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

  // Format profile status
  const beforeStatus = data.before.activeProfiles.length > 0
    ? data.before.activeProfiles.map(name =>
        `${name}:${data.before.overallStatus[name]?.toUpperCase() || 'N/A'}`
      ).join('|')
    : 'GSI:PASSED|CERN:PASSED'

  const afterStatus = data.after.activeProfiles.length > 0
    ? data.after.activeProfiles.map(name =>
        `${name}:${data.after.overallStatus[name]?.toUpperCase() || 'N/A'}`
      ).join('|')
    : 'GSI:PASSED|CERN:PASSED'

  const dataSection = `
ACTIVE_PROFILES: ${profileNames}

BEFORE:
file:${data.before.metadata.fileName}|date:${data.before.metadata.date}|pressure:${data.before.metadata.pressure}
STATUS: ${beforeStatus}

AFTER:
file:${data.after.metadata.fileName}|date:${data.after.metadata.date}|pressure:${data.after.metadata.pressure}
STATUS: ${afterStatus}

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
