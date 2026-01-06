import jsPDF from 'jspdf'
import type { AnalysisResult, NormalizedData, DiagnosticResultSummary, DiagnosisSummary } from '@/types/rga'

export interface PDFOptions {
  includeAiInterpretation: boolean
  aiInterpretation?: string | null
  language: 'de' | 'en'
}

const labels = {
  de: {
    title: 'RGA Spektrum Analyse',
    file: 'Datei',
    date: 'Datum',
    pressure: 'Druck',
    chamber: 'Kammer',
    status: 'Status',
    gsi: 'GSI',
    cern: 'CERN',
    passed: 'Bestanden',
    failed: 'Nicht bestanden',
    signalNormalized: 'Signal normiert',
    massAmu: 'Masse [AMU]',
    scaledToH2: 'Normiert auf H₂ = 100%',
    peaks: 'Detektierte Peaks',
    mass: 'Masse',
    gas: 'Gas',
    intensity: 'Intensität',
    qualityChecks: 'Qualitätsprüfungen',
    aiInterpretation: 'KI-Interpretation',
    gsiLimit: 'GSI Grenzwert',
    cernLimit: 'CERN Grenzwert',
    spectrum: 'Spektrum',
    generatedBy: 'Erstellt mit Spectrum RGA Analyser',
    // New diagnosis labels
    diagnosis: 'Automatische Diagnose',
    systemState: 'Systemzustand',
    confidence: 'Konfidenz',
    recommendation: 'Empfehlung',
    affectedMasses: 'Betroffene Massen',
    critical: 'Kritisch',
    warning: 'Warnung',
    info: 'Info',
    clean: 'Sauber',
    systemStates: {
      unbaked: 'Nicht ausgeheizt',
      baked: 'Ausgeheizt',
      contaminated: 'Kontaminiert',
      air_leak: 'Luftleck',
      unknown: 'Unbekannt',
    },
  },
  en: {
    title: 'RGA Spectrum Analysis',
    file: 'File',
    date: 'Date',
    pressure: 'Pressure',
    chamber: 'Chamber',
    status: 'Status',
    gsi: 'GSI',
    cern: 'CERN',
    passed: 'Passed',
    failed: 'Failed',
    signalNormalized: 'Normalized Signal',
    massAmu: 'Mass [AMU]',
    scaledToH2: 'Scaled to H₂ = 100%',
    peaks: 'Detected Peaks',
    mass: 'Mass',
    gas: 'Gas',
    intensity: 'Intensity',
    qualityChecks: 'Quality Checks',
    aiInterpretation: 'AI Interpretation',
    gsiLimit: 'GSI Limit',
    cernLimit: 'CERN Limit',
    spectrum: 'Spectrum',
    generatedBy: 'Generated with Spectrum RGA Analyser',
    // New diagnosis labels
    diagnosis: 'Automatic Diagnosis',
    systemState: 'System State',
    confidence: 'Confidence',
    recommendation: 'Recommendation',
    affectedMasses: 'Affected Masses',
    critical: 'Critical',
    warning: 'Warning',
    info: 'Info',
    clean: 'Clean',
    systemStates: {
      unbaked: 'Unbaked',
      baked: 'Baked',
      contaminated: 'Contaminated',
      air_leak: 'Air Leak',
      unknown: 'Unknown',
    },
  },
}

// GSI Limit function
function getGSILimit(mass: number): number {
  if (mass <= 12) return 1.0
  if (mass > 12 && mass < 19.5) return 0.1
  if (mass > 27.5 && mass < 28.5) return 0.1
  if (mass > 43.5 && mass < 44.75) return 0.1
  if (mass > 45) return 0.001
  return 0.02
}

// CERN Limit function
function getCERNLimit(mass: number): number {
  if (mass <= 3) return 1.0
  if (mass > 3 && mass < 20.5) return 0.1
  if (mass > 20.4 && mass < 27.5) return 0.01
  if (mass > 27.4 && mass < 28.5) return 0.1
  if (mass > 28.45 && mass < 32.5) return 0.01
  if (mass > 32.4 && mass < 43.5) return 0.002
  if (mass > 43.4 && mass < 45.1) return 0.05
  if (mass > 45) return 0.0001
  return 1.0
}

function drawChart(
  pdf: jsPDF,
  data: NormalizedData[],
  l: typeof labels.de,
  startY: number
): number {
  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 20

  // Chart dimensions
  const chartLeft = margin + 15
  const chartRight = pageWidth - margin
  const chartTop = startY
  const chartBottom = startY + 80
  const chartWidth = chartRight - chartLeft
  const chartHeight = chartBottom - chartTop

  // Auto-detect mass range from data
  const dataMaxMass = Math.max(...data.map(d => d.mass))
  const maxMass = dataMaxMass > 110 ? 200 : 100

  // Auto-detect Y max (for values > 100%)
  const dataMaxY = Math.max(...data.map(d => d.normalizedToH2))
  const maxLog = dataMaxY > 1 ? Math.ceil(Math.log10(dataMaxY * 1.1)) : 0
  const minLog = -4 // 10^-4

  const xScale = (mass: number) => chartLeft + (mass / maxMass) * chartWidth
  const yScale = (value: number) => {
    const logVal = Math.log10(Math.max(value, 1e-5))
    const normalized = (logVal - minLog) / (maxLog - minLog)
    return chartBottom - normalized * chartHeight
  }

  // Draw chart border
  pdf.setDrawColor(200, 200, 200)
  pdf.setLineWidth(0.3)
  pdf.rect(chartLeft, chartTop, chartWidth, chartHeight)

  // Draw grid lines and Y-axis labels
  pdf.setFontSize(7)
  pdf.setTextColor(100, 100, 100)
  pdf.setFont('helvetica', 'normal')

  for (let exp = minLog; exp <= maxLog; exp++) {
    const y = yScale(Math.pow(10, exp))

    // Grid line
    pdf.setDrawColor(230, 230, 230)
    pdf.setLineWidth(0.2)
    pdf.line(chartLeft, y, chartRight, y)

    // Y-axis label
    pdf.setTextColor(80, 80, 80)
    const expStr = exp >= 0 ? `+${exp}` : exp.toString()
    pdf.text(`1E${expStr}`, chartLeft - 2, y + 1, { align: 'right' })
  }

  // Draw X-axis labels - adapt to mass range
  const xStep = maxMass === 200 ? 20 : 10
  for (let mass = 0; mass <= maxMass; mass += xStep) {
    const x = xScale(mass)

    // Grid line
    pdf.setDrawColor(230, 230, 230)
    pdf.setLineWidth(0.2)
    pdf.line(x, chartTop, x, chartBottom)

    // X-axis label
    pdf.setTextColor(80, 80, 80)
    pdf.text(mass.toString(), x, chartBottom + 4, { align: 'center' })
  }

  // Y-axis title (rotated)
  pdf.setFontSize(8)
  pdf.setTextColor(60, 60, 60)
  pdf.text(l.signalNormalized, margin + 3, chartTop + chartHeight / 2, { angle: 90, align: 'center' })

  // X-axis title
  pdf.text(l.massAmu, chartLeft + chartWidth / 2, chartBottom + 10, { align: 'center' })

  // Draw GSI limit line (orange, dashed)
  pdf.setDrawColor(245, 158, 11) // Orange
  pdf.setLineWidth(0.5)

  let lastX = chartLeft
  let lastY = yScale(getGSILimit(0))

  for (let mass = 0.5; mass <= maxMass; mass += 0.5) {
    const x = xScale(mass)
    const y = yScale(getGSILimit(mass))

    // Draw dashed line segment
    const segmentLength = Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2))
    if (segmentLength > 0.5) {
      pdf.setLineDashPattern([2, 1], 0)
      pdf.line(lastX, lastY, x, y)
    }

    lastX = x
    lastY = y
  }
  pdf.setLineDashPattern([], 0)

  // Draw CERN limit line (red, dotted)
  pdf.setDrawColor(239, 68, 68) // Red
  pdf.setLineWidth(0.5)

  lastX = chartLeft
  lastY = yScale(getCERNLimit(0))

  for (let mass = 0.5; mass <= maxMass; mass += 0.5) {
    const x = xScale(mass)
    const y = yScale(getCERNLimit(mass))

    pdf.setLineDashPattern([1, 1], 0)
    pdf.line(lastX, lastY, x, y)

    lastX = x
    lastY = y
  }
  pdf.setLineDashPattern([], 0)

  // Draw spectrum line (blue)
  pdf.setDrawColor(59, 130, 246) // Blue
  pdf.setLineWidth(0.4)

  // Sample data points for cleaner rendering
  const sampledData: { mass: number; value: number }[] = []
  for (let mass = 0; mass <= maxMass; mass += 0.2) {
    const point = data.find(d => Math.abs(d.mass - mass) < 0.15)
    if (point) {
      sampledData.push({ mass: point.mass, value: point.normalizedToH2 })
    }
  }

  if (sampledData.length > 1) {
    for (let i = 1; i < sampledData.length; i++) {
      const x1 = xScale(sampledData[i - 1].mass)
      const y1 = yScale(sampledData[i - 1].value)
      const x2 = xScale(sampledData[i].mass)
      const y2 = yScale(sampledData[i].value)

      pdf.line(x1, y1, x2, y2)
    }
  }

  // Legend
  const legendY = chartTop + 5
  const legendX = chartRight - 45

  pdf.setFontSize(6)

  // Spectrum legend
  pdf.setDrawColor(59, 130, 246)
  pdf.setLineWidth(0.5)
  pdf.line(legendX, legendY, legendX + 8, legendY)
  pdf.setTextColor(60, 60, 60)
  pdf.text(l.spectrum, legendX + 10, legendY + 1)

  // GSI legend
  pdf.setDrawColor(245, 158, 11)
  pdf.setLineDashPattern([2, 1], 0)
  pdf.line(legendX, legendY + 5, legendX + 8, legendY + 5)
  pdf.setLineDashPattern([], 0)
  pdf.text(l.gsiLimit, legendX + 10, legendY + 6)

  // CERN legend
  pdf.setDrawColor(239, 68, 68)
  pdf.setLineDashPattern([1, 1], 0)
  pdf.line(legendX, legendY + 10, legendX + 8, legendY + 10)
  pdf.setLineDashPattern([], 0)
  pdf.text(l.cernLimit, legendX + 10, legendY + 11)

  return chartBottom + 15
}

function drawPeakTable(
  pdf: jsPDF,
  analysis: AnalysisResult,
  l: typeof labels.de,
  startY: number
): number {
  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 20
  let y = startY

  // Title
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(40, 40, 40)
  pdf.text(l.peaks, margin, y)
  y += 5

  // Table header
  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(80, 80, 80)
  pdf.setFillColor(245, 245, 250)
  pdf.rect(margin, y - 2, pageWidth - 2 * margin, 5, 'F')

  pdf.text(l.mass, margin + 2, y + 1)
  pdf.text(l.gas, margin + 20, y + 1)
  pdf.text(l.intensity, margin + 55, y + 1)
  pdf.text(l.gsi, margin + 85, y + 1)
  pdf.text(l.cern, margin + 100, y + 1)
  y += 5

  // Table rows
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7)

  const topPeaks = [...analysis.peaks]
    .sort((a, b) => b.normalizedValue - a.normalizedValue)
    .slice(0, 12)

  topPeaks.forEach((peak, index) => {
    if (index % 2 === 0) {
      pdf.setFillColor(250, 250, 252)
      pdf.rect(margin, y - 2, pageWidth - 2 * margin, 4, 'F')
    }

    pdf.setTextColor(50, 50, 50)
    pdf.text(peak.mass.toString(), margin + 2, y + 1)
    pdf.text(peak.gasIdentification.substring(0, 18), margin + 20, y + 1)
    pdf.text(`${(peak.normalizedValue * 100).toFixed(3)}%`, margin + 55, y + 1)

    const limitCheck = analysis.limitChecks.find(lc => lc.mass === peak.mass)
    if (limitCheck) {
      pdf.setTextColor(limitCheck.gsiPassed ? 0 : 220, limitCheck.gsiPassed ? 180 : 60, limitCheck.gsiPassed ? 120 : 60)
      pdf.text(limitCheck.gsiPassed ? '✓' : '✗', margin + 88, y + 1)
      pdf.setTextColor(limitCheck.cernPassed ? 0 : 220, limitCheck.cernPassed ? 180 : 60, limitCheck.cernPassed ? 120 : 60)
      pdf.text(limitCheck.cernPassed ? '✓' : '✗', margin + 103, y + 1)
    }

    y += 4
  })

  return y + 5
}

function drawQualityChecks(
  pdf: jsPDF,
  analysis: AnalysisResult,
  l: typeof labels.de,
  startY: number
): number {
  const margin = 20
  let y = startY

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(40, 40, 40)
  pdf.text(l.qualityChecks, margin, y)
  y += 5

  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'normal')

  analysis.qualityChecks.forEach((check, index) => {
    if (index % 2 === 0) {
      pdf.setFillColor(250, 250, 252)
      pdf.rect(margin, y - 2, 90, 4, 'F')
    }

    pdf.setTextColor(check.passed ? 0 : 220, check.passed ? 180 : 60, check.passed ? 120 : 60)
    pdf.text(check.passed ? '✓' : '✗', margin + 2, y + 1)

    pdf.setTextColor(50, 50, 50)
    pdf.text(check.name.substring(0, 30), margin + 8, y + 1)

    y += 4
  })

  return y + 5
}

function drawDiagnostics(
  pdf: jsPDF,
  diagnostics: DiagnosticResultSummary[],
  summary: DiagnosisSummary,
  l: typeof labels.de,
  language: 'de' | 'en',
  startY: number
): number {
  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 20
  let y = startY

  // Section title with summary badge
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(40, 40, 40)
  pdf.text(l.diagnosis, margin, y)

  // System state and status badge
  const systemStateText = l.systemStates[summary.systemState]
  const statusColors = {
    clean: { bg: [220, 252, 231], text: [22, 163, 74] },
    warning: { bg: [254, 249, 195], text: [161, 98, 7] },
    critical: { bg: [254, 226, 226], text: [185, 28, 28] },
  }
  const statusColor = statusColors[summary.overallStatus]

  // Draw status badge
  pdf.setFillColor(statusColor.bg[0], statusColor.bg[1], statusColor.bg[2])
  pdf.roundedRect(margin + 38, y - 3.5, 22, 5, 1, 1, 'F')
  pdf.setFontSize(7)
  pdf.setTextColor(statusColor.text[0], statusColor.text[1], statusColor.text[2])
  const statusText = summary.overallStatus === 'clean' ? l.clean :
                     summary.overallStatus === 'warning' ? l.warning : l.critical
  pdf.text(statusText, margin + 49, y, { align: 'center' })

  // System state
  pdf.setTextColor(100, 100, 100)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`(${systemStateText})`, margin + 63, y)

  y += 6

  // Summary counts if there are issues
  if (summary.criticalCount > 0 || summary.warningCount > 0) {
    pdf.setFontSize(7)
    pdf.setTextColor(80, 80, 80)
    const counts = []
    if (summary.criticalCount > 0) counts.push(`${summary.criticalCount} ${l.critical.toLowerCase()}`)
    if (summary.warningCount > 0) counts.push(`${summary.warningCount} ${l.warning.toLowerCase()}`)
    if (summary.infoCount > 0) counts.push(`${summary.infoCount} ${l.info.toLowerCase()}`)
    pdf.text(counts.join(' | '), margin, y)
    y += 4
  }

  // Diagnostic items
  pdf.setFontSize(7)

  const sortedDiagnostics = [...diagnostics].sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })

  for (const diag of sortedDiagnostics) {
    // Check for page break
    if (y > 270) {
      pdf.addPage()
      y = 20
    }

    const name = language === 'de' ? diag.name : diag.nameEn
    const description = language === 'de' ? diag.description : diag.descriptionEn
    const recommendation = language === 'de' ? diag.recommendation : diag.recommendationEn

    // Severity indicator
    const severityColors = {
      critical: [239, 68, 68],
      warning: [245, 158, 11],
      info: [34, 197, 94],
    }
    const sevColor = severityColors[diag.severity]

    // Background
    pdf.setFillColor(250, 250, 252)
    pdf.rect(margin, y - 2, pageWidth - 2 * margin, 16, 'F')

    // Severity dot
    pdf.setFillColor(sevColor[0], sevColor[1], sevColor[2])
    pdf.circle(margin + 4, y + 1, 1.5, 'F')

    // Name and confidence
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(50, 50, 50)
    pdf.text(name.substring(0, 40), margin + 8, y + 1)

    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(100, 100, 100)
    pdf.text(`${(diag.confidence * 100).toFixed(0)}% ${l.confidence}`, pageWidth - margin - 2, y + 1, { align: 'right' })

    // Description
    y += 4
    pdf.setTextColor(80, 80, 80)
    const descLines = pdf.splitTextToSize(description, pageWidth - 2 * margin - 10)
    pdf.text(descLines[0], margin + 8, y + 1)

    // Recommendation
    y += 4
    pdf.setTextColor(100, 100, 100)
    pdf.setFont('helvetica', 'italic')
    const recLines = pdf.splitTextToSize(`→ ${recommendation}`, pageWidth - 2 * margin - 10)
    pdf.text(recLines[0], margin + 8, y + 1)

    // Affected masses
    if (diag.affectedMasses.length > 0) {
      y += 4
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(120, 120, 120)
      const massesText = `m/z: ${diag.affectedMasses.join(', ')}`
      pdf.text(massesText.substring(0, 60), margin + 8, y + 1)
    }

    y += 6
  }

  return y + 3
}

function drawAIInterpretation(
  pdf: jsPDF,
  interpretation: string,
  l: typeof labels.de,
  startY: number
): number {
  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 20
  let y = startY

  // Section title
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(40, 40, 40)
  pdf.text(l.aiInterpretation, margin, y)
  y += 8

  const maxWidth = pageWidth - 2 * margin
  const lines = interpretation.split('\n')

  // Helper to clean markdown from text
  const cleanMarkdown = (text: string): string => {
    return text
      .replace(/\*\*/g, '')  // Remove **bold**
      .replace(/\*/g, '')    // Remove *italic*
      .replace(/`/g, '')     // Remove `code`
  }

  for (const line of lines) {
    // Check for page break
    if (y > 275) {
      pdf.addPage()
      y = 20
    }

    const trimmedLine = line.trim()

    // Empty line
    if (trimmedLine === '') {
      y += 3
      continue
    }

    // ## Header (h2)
    if (trimmedLine.startsWith('## ')) {
      y += 2
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(10)
      pdf.setTextColor(30, 30, 30)
      pdf.text(cleanMarkdown(trimmedLine.substring(3)), margin, y)
      y += 6
      continue
    }

    // ### Header (h3)
    if (trimmedLine.startsWith('### ')) {
      y += 1
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(9)
      pdf.setTextColor(50, 50, 50)
      pdf.text(cleanMarkdown(trimmedLine.substring(4)), margin, y)
      y += 5
      continue
    }

    // **Bold header line** (standalone)
    if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**') && !trimmedLine.includes('**:')) {
      y += 1
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(9)
      pdf.setTextColor(50, 50, 50)
      pdf.text(cleanMarkdown(trimmedLine), margin, y)
      y += 5
      continue
    }

    // Bullet point
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(8)
      pdf.setTextColor(60, 60, 60)
      const bulletContent = cleanMarkdown(trimmedLine.substring(2))
      const wrappedLines = pdf.splitTextToSize(bulletContent, maxWidth - 8)

      for (let i = 0; i < wrappedLines.length; i++) {
        if (y > 275) {
          pdf.addPage()
          y = 20
        }
        const prefix = i === 0 ? '•  ' : '   '
        pdf.text(prefix + wrappedLines[i], margin + 2, y)
        y += 4
      }
      continue
    }

    // Regular paragraph
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(60, 60, 60)
    const cleanedLine = cleanMarkdown(trimmedLine)
    const wrappedLines = pdf.splitTextToSize(cleanedLine, maxWidth)

    for (const wrappedLine of wrappedLines) {
      if (y > 275) {
        pdf.addPage()
        y = 20
      }
      pdf.text(wrappedLine, margin, y)
      y += 4
    }
  }

  return y + 5
}

export async function generatePDF(
  analysis: AnalysisResult,
  _chartElement: HTMLElement | null, // Kept for API compatibility
  options: PDFOptions
): Promise<Blob> {
  const l = labels[options.language]
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 20

  // === PAGE 1: Chart and Summary ===

  // Title
  let y = 15
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(30, 30, 30)
  pdf.text(l.title, margin, y)

  // Metadata line
  y += 6
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(80, 80, 80)

  const dateStr = analysis.metadata.startTime?.toLocaleDateString(
    options.language === 'de' ? 'de-DE' : 'en-US'
  ) || 'Unknown'

  const metaLine = `${analysis.metadata.sourceFile || 'Unknown'} | ${dateStr} | ${analysis.metadata.pressure || 'Unknown'} | ${analysis.metadata.chamberName || 'Unknown'}`
  pdf.text(metaLine, margin, y)

  // Status badges
  y += 5
  const gsiPassed = analysis.limitChecks.every(c => c.gsiPassed)
  const cernPassed = analysis.limitChecks.every(c => c.cernPassed)

  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')

  // GSI status
  pdf.setFillColor(gsiPassed ? 220 : 254, gsiPassed ? 252 : 226, gsiPassed ? 231 : 226)
  pdf.roundedRect(margin, y - 3, 25, 5, 1, 1, 'F')
  pdf.setTextColor(gsiPassed ? 22 : 185, gsiPassed ? 163 : 28, gsiPassed ? 74 : 28)
  pdf.text(`GSI: ${gsiPassed ? '✓' : '✗'}`, margin + 2, y)

  // CERN status
  pdf.setFillColor(cernPassed ? 220 : 254, cernPassed ? 252 : 226, cernPassed ? 231 : 226)
  pdf.roundedRect(margin + 28, y - 3, 28, 5, 1, 1, 'F')
  pdf.setTextColor(cernPassed ? 22 : 185, cernPassed ? 163 : 28, cernPassed ? 74 : 28)
  pdf.text(`CERN: ${cernPassed ? '✓' : '✗'}`, margin + 30, y)

  // Info text
  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'italic')
  pdf.setTextColor(120, 120, 120)
  pdf.text(l.scaledToH2, pageWidth - margin, y, { align: 'right' })

  // Draw chart
  y = drawChart(pdf, analysis.normalizedData, l, y + 8)

  // Draw peak table
  y = drawPeakTable(pdf, analysis, l, y)

  // Draw quality checks (if space)
  if (y < 240) {
    y = drawQualityChecks(pdf, analysis, l, y)
  }

  // Draw diagnostics (if present and space)
  if (analysis.diagnostics && analysis.diagnostics.length > 0 && analysis.diagnosisSummary) {
    if (y > 200) {
      pdf.addPage()
      y = 20
    }
    y = drawDiagnostics(pdf, analysis.diagnostics, analysis.diagnosisSummary, l, options.language, y)
  }

  // AI Interpretation (on new page if present)
  if (options.includeAiInterpretation && options.aiInterpretation) {
    pdf.addPage()
    drawAIInterpretation(pdf, options.aiInterpretation, l, 20)
  }

  // Footer on all pages
  const pageCount = pdf.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i)
    const footerY = pdf.internal.pageSize.getHeight() - 8
    pdf.setTextColor(150, 150, 150)
    pdf.setFontSize(7)
    pdf.setFont('helvetica', 'italic')
    pdf.text(l.generatedBy, pageWidth / 2, footerY, { align: 'center' })
    pdf.text(`${i}/${pageCount}`, pageWidth - margin, footerY, { align: 'right' })
  }

  return pdf.output('blob')
}

export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
