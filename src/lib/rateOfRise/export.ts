/**
 * Rate-of-Rise Export Functions
 * PDF and CSV export for pressure rise test results
 */

import jsPDF from 'jspdf'
import type { RateOfRiseData, RateOfRiseAnalysis } from '@/types/rateOfRise'
import { formatDuration, formatScientific } from './parser'

export interface RoRPDFOptions {
  language: 'de' | 'en'
  includeDataTable: boolean
}

const labels = {
  de: {
    title: 'Druckanstiegstest-Protokoll',
    subtitle: 'Rate-of-Rise Analyse',
    deviceInfo: 'Geräte-Information',
    device: 'Gerät',
    serial: 'Seriennummer',
    sensor: 'Sensor',
    date: 'Datum',
    duration: 'Messdauer',
    interval: 'Intervall',
    dataPoints: 'Datenpunkte',
    parameters: 'Parameter',
    volume: 'Kammervolumen',
    limit: 'Grenzwert',
    source: 'Quelle',
    results: 'Ergebnisse',
    dpdt: 'Druckanstiegsrate',
    leakRate: 'Leckrate',
    heEquivalent: 'He-Äquivalent',
    fitQuality: 'Fit-Qualität',
    baseline: 'Basisdruck',
    classification: 'Klassifikation',
    confidence: 'Konfidenz',
    evidence: 'Evidenz',
    recommendations: 'Empfehlungen',
    limitCheck: 'Grenzwert-Prüfung',
    passed: 'BESTANDEN',
    failed: 'NICHT BESTANDEN',
    belowLimit: 'unter Grenzwert',
    aboveLimit: 'über Grenzwert',
    factor: 'Faktor',
    chart: 'Druckverlauf',
    time: 'Zeit',
    pressure: 'Druck [mbar]',
    baselinePhase: 'Baseline',
    risePhase: 'Anstieg',
    fitLine: 'Linearer Fit',
    generatedBy: 'Erstellt mit Spectrum RGA Analyser',
    rawData: 'Rohdaten',
    // Classification types
    real_leak: 'Reales Leck',
    virtual_leak: 'Virtuelles Leck',
    outgassing: 'Ausgasung',
    mixed: 'Gemischte Ursache',
    unknown: 'Nicht klassifizierbar',
  },
  en: {
    title: 'Pressure Rise Test Protocol',
    subtitle: 'Rate-of-Rise Analysis',
    deviceInfo: 'Device Information',
    device: 'Device',
    serial: 'Serial Number',
    sensor: 'Sensor',
    date: 'Date',
    duration: 'Duration',
    interval: 'Interval',
    dataPoints: 'Data Points',
    parameters: 'Parameters',
    volume: 'Chamber Volume',
    limit: 'Limit',
    source: 'Source',
    results: 'Results',
    dpdt: 'Pressure Rise Rate',
    leakRate: 'Leak Rate',
    heEquivalent: 'He Equivalent',
    fitQuality: 'Fit Quality',
    baseline: 'Baseline Pressure',
    classification: 'Classification',
    confidence: 'Confidence',
    evidence: 'Evidence',
    recommendations: 'Recommendations',
    limitCheck: 'Limit Check',
    passed: 'PASSED',
    failed: 'FAILED',
    belowLimit: 'below limit',
    aboveLimit: 'above limit',
    factor: 'Factor',
    chart: 'Pressure Curve',
    time: 'Time',
    pressure: 'Pressure [mbar]',
    baselinePhase: 'Baseline',
    risePhase: 'Rise',
    fitLine: 'Linear Fit',
    generatedBy: 'Generated with Spectrum RGA Analyser',
    rawData: 'Raw Data',
    // Classification types
    real_leak: 'Real Leak',
    virtual_leak: 'Virtual Leak',
    outgassing: 'Outgassing',
    mixed: 'Mixed Cause',
    unknown: 'Not Classifiable',
  },
}

function drawRoRChart(
  pdf: jsPDF,
  data: RateOfRiseData,
  analysis: RateOfRiseAnalysis,
  l: typeof labels.de,
  startY: number
): number {
  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 20

  // Chart dimensions
  const chartLeft = margin + 15
  const chartRight = pageWidth - margin
  const chartTop = startY
  const chartBottom = startY + 70
  const chartWidth = chartRight - chartLeft
  const chartHeight = chartBottom - chartTop

  // Scales
  const xScale = (time: number) => chartLeft + (time / data.duration) * chartWidth

  // Use log scale for pressure
  const minLog = Math.floor(Math.log10(data.minPressure * 0.5))
  const maxLog = Math.ceil(Math.log10(data.maxPressure * 2))

  const yScale = (pressure: number) => {
    const logVal = Math.log10(Math.max(pressure, 1e-12))
    const normalized = (logVal - minLog) / (maxLog - minLog)
    return chartBottom - normalized * chartHeight
  }

  // Draw chart border
  pdf.setDrawColor(200, 200, 200)
  pdf.setLineWidth(0.3)
  pdf.rect(chartLeft, chartTop, chartWidth, chartHeight)

  // Draw phase backgrounds
  const baselineEnd = data.dataPoints[analysis.baselinePhase.endIndex]?.relativeTimeS || 0
  const riseStart = data.dataPoints[analysis.risePhase.startIndex]?.relativeTimeS || 0

  // Baseline phase (green)
  pdf.setFillColor(220, 252, 231)
  pdf.rect(chartLeft, chartTop, xScale(baselineEnd) - chartLeft, chartHeight, 'F')

  // Rise phase (orange)
  pdf.setFillColor(254, 243, 199)
  pdf.rect(xScale(riseStart), chartTop, chartRight - xScale(riseStart), chartHeight, 'F')

  // Phase labels
  pdf.setFontSize(7)
  pdf.setTextColor(22, 163, 74)
  pdf.text(l.baselinePhase, xScale(baselineEnd / 2), chartTop + 6, { align: 'center' })
  pdf.setTextColor(217, 119, 6)
  pdf.text(l.risePhase, xScale(riseStart + (data.duration - riseStart) / 2), chartTop + 6, { align: 'center' })

  // Draw grid lines and Y-axis labels
  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'normal')

  for (let exp = minLog; exp <= maxLog; exp++) {
    const y = yScale(Math.pow(10, exp))

    // Grid line
    pdf.setDrawColor(230, 230, 230)
    pdf.setLineWidth(0.2)
    pdf.line(chartLeft, y, chartRight, y)

    // Y-axis label
    pdf.setTextColor(80, 80, 80)
    pdf.text(`1E${exp}`, chartLeft - 2, y + 1, { align: 'right' })
  }

  // Draw X-axis labels
  const xSteps = 6
  for (let i = 0; i <= xSteps; i++) {
    const time = (data.duration / xSteps) * i
    const x = xScale(time)

    // Grid line
    pdf.setDrawColor(230, 230, 230)
    pdf.setLineWidth(0.2)
    pdf.line(x, chartTop, x, chartBottom)

    // X-axis label
    pdf.setTextColor(80, 80, 80)
    pdf.text(formatDuration(time), x, chartBottom + 4, { align: 'center' })
  }

  // Axis titles
  pdf.setFontSize(8)
  pdf.setTextColor(60, 60, 60)
  pdf.text(l.pressure, margin + 3, chartTop + chartHeight / 2, { angle: 90, align: 'center' })
  pdf.text(l.time, chartLeft + chartWidth / 2, chartBottom + 10, { align: 'center' })

  // Draw data line (blue)
  pdf.setDrawColor(59, 130, 246)
  pdf.setLineWidth(0.4)

  // Sample every nth point for cleaner PDF
  const sampleRate = Math.max(1, Math.floor(data.dataPoints.length / 300))
  let lastX = -1
  let lastY = -1

  for (let i = 0; i < data.dataPoints.length; i += sampleRate) {
    const point = data.dataPoints[i]
    if (point.pressure1 <= 0) continue

    const x = xScale(point.relativeTimeS)
    const y = yScale(point.pressure1)

    if (lastX >= 0 && lastY >= 0) {
      pdf.line(lastX, lastY, x, y)
    }

    lastX = x
    lastY = y
  }

  // Draw fit line (dashed red)
  const fit = analysis.linearFit
  const fitY1 = fit.intercept + fit.slope * riseStart
  const fitY2 = fit.intercept + fit.slope * data.duration

  if (fitY1 > 0 && fitY2 > 0) {
    pdf.setDrawColor(239, 68, 68)
    pdf.setLineWidth(0.6)
    pdf.setLineDashPattern([3, 2], 0)
    pdf.line(xScale(riseStart), yScale(fitY1), xScale(data.duration), yScale(fitY2))
    pdf.setLineDashPattern([], 0)
  }

  // Legend
  const legendY = chartTop + 12
  const legendX = chartRight - 35
  pdf.setFontSize(6)

  // Data line legend
  pdf.setDrawColor(59, 130, 246)
  pdf.setLineWidth(0.5)
  pdf.line(legendX, legendY, legendX + 8, legendY)
  pdf.setTextColor(60, 60, 60)
  pdf.text(l.pressure.split(' ')[0], legendX + 10, legendY + 1)

  // Fit line legend
  pdf.setDrawColor(239, 68, 68)
  pdf.setLineDashPattern([3, 2], 0)
  pdf.line(legendX, legendY + 5, legendX + 8, legendY + 5)
  pdf.setLineDashPattern([], 0)
  pdf.text(l.fitLine, legendX + 10, legendY + 6)

  // R² annotation
  pdf.setFontSize(7)
  pdf.setTextColor(239, 68, 68)
  pdf.text(`R² = ${(analysis.linearFit.r2 * 100).toFixed(1)}%`, chartRight - 5, chartBottom - 5, { align: 'right' })

  return chartBottom + 15
}

function drawInfoSection(
  pdf: jsPDF,
  data: RateOfRiseData,
  analysis: RateOfRiseAnalysis,
  l: typeof labels.de,
  language: 'de' | 'en',
  startY: number
): number {
  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 20
  const colWidth = (pageWidth - 2 * margin) / 3
  let y = startY

  // Device Info Box
  pdf.setFillColor(248, 250, 252)
  pdf.rect(margin, y, colWidth - 5, 35, 'F')

  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(40, 40, 40)
  pdf.text(l.deviceInfo, margin + 3, y + 5)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7)
  pdf.setTextColor(60, 60, 60)

  let infoY = y + 10
  pdf.text(`${l.device}: ${data.metadata.device}`, margin + 3, infoY)
  infoY += 4
  pdf.text(`${l.serial}: ${data.metadata.serialNumber}`, margin + 3, infoY)
  infoY += 4
  pdf.text(`${l.sensor}: ${data.metadata.sensor1Type}`, margin + 3, infoY)
  infoY += 4
  pdf.text(`${l.date}: ${data.metadata.recordingStart.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US')}`, margin + 3, infoY)
  infoY += 4
  pdf.text(`${l.duration}: ${formatDuration(data.duration)}`, margin + 3, infoY)
  infoY += 4
  pdf.text(`${l.dataPoints}: ${data.dataPoints.length}`, margin + 3, infoY)

  // Parameters Box
  const paramX = margin + colWidth
  pdf.setFillColor(248, 250, 252)
  pdf.rect(paramX, y, colWidth - 5, 35, 'F')

  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(40, 40, 40)
  pdf.text(l.parameters, paramX + 3, y + 5)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7)
  pdf.setTextColor(60, 60, 60)

  infoY = y + 10
  if (analysis.leakRate) {
    pdf.text(`${l.volume}: ${analysis.leakRate.volume} L`, paramX + 3, infoY)
    infoY += 4
  }
  if (analysis.limitCheck) {
    pdf.text(`${l.limit}: ${analysis.limitCheck.limit.toExponential(0)} mbar·L/s`, paramX + 3, infoY)
    infoY += 4
    pdf.text(`${l.source}: ${analysis.limitCheck.limitSource}`, paramX + 3, infoY)
    infoY += 4
  }
  pdf.text(`${l.baseline}: ${formatScientific(analysis.baselinePhase.meanPressure, 'mbar')}`, paramX + 3, infoY)

  // Results Box
  const resultX = margin + 2 * colWidth
  pdf.setFillColor(248, 250, 252)
  pdf.rect(resultX, y, colWidth - 5, 35, 'F')

  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(40, 40, 40)
  pdf.text(l.results, resultX + 3, y + 5)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7)
  pdf.setTextColor(60, 60, 60)

  infoY = y + 10
  pdf.text(`${l.dpdt}: ${formatScientific(analysis.dpdt, 'mbar/s')}`, resultX + 3, infoY)
  infoY += 4
  if (analysis.leakRate) {
    pdf.text(`${l.leakRate}: ${analysis.leakRate.QFormatted}`, resultX + 3, infoY)
    infoY += 4
    // He equivalent (factor 2.69 for N2 → He)
    const heRate = analysis.leakRate.Q * 2.69
    pdf.text(`${l.heEquivalent}: ${heRate.toExponential(1)} mbar·L/s`, resultX + 3, infoY)
    infoY += 4
  }
  pdf.text(`${l.fitQuality}: ${(analysis.linearFit.r2 * 100).toFixed(1)}%`, resultX + 3, infoY)

  return y + 40
}

function drawClassification(
  pdf: jsPDF,
  analysis: RateOfRiseAnalysis,
  l: typeof labels.de,
  startY: number
): number {
  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 20
  let y = startY

  // Section title
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(40, 40, 40)
  pdf.text(l.classification, margin, y)
  y += 6

  const classif = analysis.classification
  const typeLabel = l[classif.type as keyof typeof l] as string || classif.type

  // Classification box with color based on type
  const colors = {
    real_leak: { bg: [254, 226, 226], text: [185, 28, 28] },
    virtual_leak: { bg: [254, 243, 199], text: [161, 98, 7] },
    outgassing: { bg: [220, 252, 231], text: [22, 163, 74] },
    mixed: { bg: [254, 249, 195], text: [133, 77, 14] },
    unknown: { bg: [241, 245, 249], text: [71, 85, 105] },
  }
  const color = colors[classif.type] || colors.unknown

  pdf.setFillColor(color.bg[0], color.bg[1], color.bg[2])
  pdf.rect(margin, y, pageWidth - 2 * margin, 8, 'F')

  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(color.text[0], color.text[1], color.text[2])
  pdf.text(typeLabel, margin + 3, y + 5)

  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(100, 100, 100)
  pdf.text(`${l.confidence}: ${(classif.confidence * 100).toFixed(0)}%`, pageWidth - margin - 3, y + 5, { align: 'right' })
  y += 12

  // Evidence
  if (classif.evidence.length > 0) {
    pdf.setFontSize(7)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(80, 80, 80)
    pdf.text(l.evidence, margin, y)
    y += 4

    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(60, 60, 60)
    for (const ev of classif.evidence) {
      pdf.text(`• ${ev}`, margin + 3, y)
      y += 3.5
    }
    y += 2
  }

  // Recommendations
  if (classif.recommendations.length > 0) {
    pdf.setFontSize(7)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(80, 80, 80)
    pdf.text(l.recommendations, margin, y)
    y += 4

    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(60, 60, 60)
    for (const rec of classif.recommendations) {
      const lines = pdf.splitTextToSize(`→ ${rec}`, pageWidth - 2 * margin - 6)
      for (const line of lines) {
        pdf.text(line, margin + 3, y)
        y += 3.5
      }
    }
  }

  return y + 5
}

function drawLimitCheck(
  pdf: jsPDF,
  analysis: RateOfRiseAnalysis,
  l: typeof labels.de,
  startY: number
): number {
  if (!analysis.limitCheck) return startY

  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 20
  let y = startY

  // Section title
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(40, 40, 40)
  pdf.text(l.limitCheck, margin, y)
  y += 6

  const check = analysis.limitCheck
  const passed = check.passed

  // Pass/Fail box
  pdf.setFillColor(passed ? 220 : 254, passed ? 252 : 226, passed ? 231 : 226)
  pdf.rect(margin, y, pageWidth - 2 * margin, 12, 'F')

  // Status icon (checkmark or X)
  pdf.setFontSize(14)
  pdf.setTextColor(passed ? 22 : 185, passed ? 163 : 28, passed ? 74 : 28)
  pdf.text(passed ? '✓' : '✗', margin + 5, y + 8)

  // Status text
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'bold')
  pdf.text(passed ? l.passed : l.failed, margin + 15, y + 7)

  // Margin text
  const marginText = check.margin < 1
    ? `${((1 - check.margin) * 100).toFixed(0)}% ${l.belowLimit}`
    : `${((check.margin - 1) * 100).toFixed(0)}% ${l.aboveLimit}`

  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(100, 100, 100)
  pdf.text(marginText, pageWidth - margin - 3, y + 7, { align: 'right' })
  y += 16

  // Details
  pdf.setFontSize(7)
  pdf.setTextColor(60, 60, 60)
  pdf.text(`${l.limit}: ${check.limit.toExponential(0)} mbar·L/s`, margin + 3, y)
  pdf.text(`${l.source}: ${check.limitSource}`, margin + 60, y)
  pdf.text(`${l.factor}: ${check.margin.toFixed(2)}×`, margin + 120, y)

  return y + 8
}

export async function generateRoRPDF(
  data: RateOfRiseData,
  analysis: RateOfRiseAnalysis,
  options: RoRPDFOptions
): Promise<Blob> {
  const l = labels[options.language]
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 20

  // === PAGE 1: Summary ===

  // Title
  let y = 15
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(30, 30, 30)
  pdf.text(l.title, margin, y)

  // Subtitle
  y += 5
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(80, 80, 80)
  pdf.text(l.subtitle, margin, y)

  // Filename
  pdf.text(data.metadata.filename, pageWidth - margin, y, { align: 'right' })
  y += 8

  // Draw chart
  y = drawRoRChart(pdf, data, analysis, l, y)

  // Draw info section
  y = drawInfoSection(pdf, data, analysis, l, options.language, y)

  // Draw classification
  y = drawClassification(pdf, analysis, l, y)

  // Draw limit check
  y = drawLimitCheck(pdf, analysis, l, y)

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
    pdf.text(new Date().toLocaleDateString(options.language === 'de' ? 'de-DE' : 'en-US'), margin, footerY)
  }

  return pdf.output('blob')
}

export function generateRoRCSV(data: RateOfRiseData, analysis: RateOfRiseAnalysis): string {
  const lines: string[] = []

  // Header with metadata
  lines.push('# Rate-of-Rise Test Data Export')
  lines.push(`# Device: ${data.metadata.manufacturer} ${data.metadata.device}`)
  lines.push(`# Serial: ${data.metadata.serialNumber}`)
  lines.push(`# Sensor: ${data.metadata.sensor1Type}`)
  lines.push(`# Date: ${data.metadata.recordingStart.toISOString()}`)
  lines.push(`# Duration: ${formatDuration(data.duration)}`)
  lines.push(`# Interval: ${data.metadata.measurementInterval}s`)
  lines.push('#')
  lines.push(`# Analysis Results:`)
  lines.push(`# dp/dt: ${formatScientific(analysis.dpdt, 'mbar/s')}`)
  if (analysis.leakRate) {
    lines.push(`# Leak Rate: ${analysis.leakRate.QFormatted}`)
    lines.push(`# Volume: ${analysis.leakRate.volume} L`)
  }
  lines.push(`# Classification: ${analysis.classification.type}`)
  lines.push(`# Fit R²: ${(analysis.linearFit.r2 * 100).toFixed(2)}%`)
  lines.push('#')

  // Column headers
  lines.push('Index,Timestamp,RelativeTime_s,Pressure1_mbar,Pressure2_mbar,Phase')

  // Data rows
  for (let i = 0; i < data.dataPoints.length; i++) {
    const point = data.dataPoints[i]
    let phase = 'transition'
    if (i <= analysis.baselinePhase.endIndex) {
      phase = 'baseline'
    } else if (i >= analysis.risePhase.startIndex) {
      phase = 'rise'
    }

    lines.push([
      point.index,
      point.timestamp.toISOString(),
      point.relativeTimeS.toFixed(1),
      point.pressure1.toExponential(4),
      point.pressure2 !== null ? point.pressure2.toExponential(4) : '',
      phase,
    ].join(','))
  }

  return lines.join('\n')
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, filename)
}
