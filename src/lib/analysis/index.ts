import type { RawData, AnalysisResult, NormalizedData, Peak, DataPoint } from '@/types/rga'
import { checkLimits } from '@/lib/limits'
import { performQualityChecks } from '@/lib/quality'

// Known masses and their gas identifications
const KNOWN_MASSES: { mass: number; gas: string; fragments?: string[] }[] = [
  { mass: 1, gas: 'H⁺', fragments: ['H₂'] },
  { mass: 2, gas: 'H₂', fragments: [] },
  { mass: 4, gas: 'He', fragments: [] },
  { mass: 12, gas: 'C⁺', fragments: ['CO', 'CO₂', 'Kohlenwasserstoffe'] },
  { mass: 14, gas: 'N⁺', fragments: ['N₂'] },
  { mass: 16, gas: 'O⁺', fragments: ['O₂', 'H₂O', 'CO₂'] },
  { mass: 17, gas: 'OH⁺', fragments: ['H₂O'] },
  { mass: 18, gas: 'H₂O', fragments: [] },
  { mass: 19, gas: 'F⁺/H₃O⁺', fragments: ['Fluorverbindungen', 'H₂O'] },
  { mass: 20, gas: 'Ar²⁺/Ne/HF', fragments: ['Ar', 'Ne', 'HF'] },
  { mass: 28, gas: 'N₂/CO', fragments: [] },
  { mass: 29, gas: 'N₂-Isotop/CHO⁺', fragments: ['N₂', 'Kohlenwasserstoffe'] },
  { mass: 31, gas: 'CF⁺', fragments: ['Fluorverbindungen'] },
  { mass: 32, gas: 'O₂', fragments: [] },
  { mass: 35, gas: '³⁵Cl⁺', fragments: ['Chlorverbindungen'] },
  { mass: 36, gas: 'HCl/³⁶Ar', fragments: ['HCl', 'Ar-Isotop'] },
  { mass: 40, gas: 'Ar', fragments: [] },
  { mass: 44, gas: 'CO₂', fragments: [] },
  { mass: 45, gas: '¹³CO₂/CHO₂⁺', fragments: ['CO₂-Isotop', 'Kohlenwasserstoffe'] },
  { mass: 50, gas: 'CF₂⁺', fragments: ['Fluorverbindungen'] },
  { mass: 69, gas: 'CF₃⁺', fragments: ['Fluorverbindungen', 'Kohlenwasserstoffe'] },
  { mass: 77, gas: 'C₆H₅⁺', fragments: ['Aromaten', 'Kohlenwasserstoffe'] },
]

export function analyzeSpectrum(raw: RawData): AnalysisResult {
  // 1. Background Subtraction
  const minCurrent = Math.min(...raw.points.map((p) => p.current))

  // 2. Find H₂ peak for normalization
  const h2Peak = findPeakValue(raw.points, 2)
  const maxCurrent = h2Peak > 0 ? h2Peak : Math.max(...raw.points.map((p) => p.current))

  // 3. Normalize data
  const normalizedData: NormalizedData[] = raw.points.map((p) => ({
    mass: p.mass,
    current: p.current,
    backgroundSubtracted: p.current - minCurrent,
    normalizedToH2: maxCurrent > minCurrent ? (p.current - minCurrent) / (maxCurrent - minCurrent) : 0,
  }))

  // 4. Detect and integrate peaks
  const peaks = detectPeaks(raw.points, normalizedData)

  // 5. Check limits
  const limitChecks = checkLimits(normalizedData)

  // 6. Quality checks
  const qualityChecks = performQualityChecks(peaks)

  // 7. Calculate totals
  const totalPressure = raw.points.reduce((sum, p) => sum + p.current, 0)
  const dominantGases = identifyDominantGases(peaks, totalPressure)

  return {
    metadata: raw.metadata,
    normalizedData,
    peaks,
    limitChecks,
    qualityChecks,
    totalPressure,
    dominantGases,
  }
}

function findPeakValue(points: DataPoint[], targetMass: number): number {
  const tolerance = 0.5
  const peakPoints = points.filter((p) => Math.abs(p.mass - targetMass) <= tolerance)
  if (peakPoints.length === 0) return 0
  return Math.max(...peakPoints.map((p) => p.current))
}

export function integratePeak(points: DataPoint[], targetMass: number): number {
  const tolerance = 0.5
  const peakPoints = points.filter((p) => Math.abs(p.mass - targetMass) <= tolerance)
  if (peakPoints.length === 0) return 0

  const sum = peakPoints.reduce((acc, p) => acc + p.current, 0)
  return sum / peakPoints.length
}

function detectPeaks(rawPoints: DataPoint[], normalizedData: NormalizedData[]): Peak[] {
  const peaks: Peak[] = []

  for (const known of KNOWN_MASSES) {
    const integrated = integratePeak(rawPoints, known.mass)
    if (integrated > 0) {
      const normalizedPoint = normalizedData.find((p) => Math.abs(p.mass - known.mass) < 0.1)

      peaks.push({
        mass: known.mass,
        integratedCurrent: integrated,
        normalizedValue: normalizedPoint?.normalizedToH2 || 0,
        gasIdentification: known.gas,
        fragments: known.fragments,
      })
    }
  }

  return peaks.sort((a, b) => b.integratedCurrent - a.integratedCurrent)
}

function identifyDominantGases(peaks: Peak[], totalPressure: number): { gas: string; percentage: number }[] {
  if (totalPressure === 0) return []

  return peaks
    .filter((p) => p.integratedCurrent > 0)
    .map((p) => ({
      gas: p.gasIdentification,
      percentage: (p.integratedCurrent / totalPressure) * 100,
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5)
}
