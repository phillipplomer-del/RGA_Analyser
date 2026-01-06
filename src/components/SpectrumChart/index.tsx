import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as d3 from 'd3'
import type { NormalizedData, LimitCheck, MeasurementFile } from '@/types/rga'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardHeader } from '@/components/ui/Card'
import { FILE_COLORS } from '@/components/FileManager'
import { KNOWN_MASSES } from '@/lib/analysis'
import { generateProfileLimitCurve } from '@/lib/limits'

interface SpectrumChartProps {
  files: MeasurementFile[]
  limitChecks: LimitCheck[]
}

interface TooltipData {
  mass: number
  gas: string
  values: { fileIndex: number; value: number; color: string }[]
  x: number
  y: number
}

export function SpectrumChart({ files, limitChecks }: SpectrumChartProps) {
  const { t, i18n } = useTranslation()
  const { chartOptions, updateChartOptions, toggleFileVisibility, limitProfiles, activeLimitProfileIds, toggleLimitProfile } = useAppStore()

  // Get active profiles
  const activeProfiles = limitProfiles.filter(p => activeLimitProfileIds.includes(p.id))
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)

  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return date.toLocaleDateString(i18n.language === 'de' ? 'de-DE' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    })
  }

  // Find gas identification for a mass
  const getGasForMass = (mass: number): string => {
    const roundedMass = Math.round(mass)
    const known = KNOWN_MASSES.find(k => k.mass === roundedMass)
    return known?.gas || `Mass ${roundedMass}`
  }

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || files.length === 0) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = 400
    const margin = { top: 20, right: 140, bottom: 50, left: 70 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Get all visible files' data
    const visibleFiles = files.filter(f => chartOptions.visibleFiles.includes(f.id))
    const allData = visibleFiles.flatMap(f => f.analysisResult.normalizedData)

    if (allData.length === 0) {
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight / 2)
        .attr('text-anchor', 'middle')
        .style('fill', 'var(--color-text-muted)')
        .style('font-size', '14px')
        .text(t('chart.noData', 'Keine Spektren sichtbar'))
      return
    }

    // Auto-detect mass range from all data
    const maxMass = Math.max(...allData.map(d => d.mass))
    const xMax = maxMass > 110 ? 200 : 100

    // Auto-detect Y max
    const maxY = Math.max(...allData.map(d => d.normalizedToH2))
    const yMax = maxY > 1 ? Math.ceil(maxY * 1.1) : 1

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, xMax])
      .range([0, innerWidth])

    const yScale = chartOptions.logScale
      ? d3.scaleLog()
          .domain([1e-6, yMax])
          .range([innerHeight, 0])
          .clamp(true)
      : d3.scaleLinear()
          .domain([0, yMax])
          .range([innerHeight, 0])

    // Grid
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat(() => '')
      )

    // X Axis
    const xTicks = xMax === 200
      ? d3.range(0, 201, 20)
      : d3.range(0, 101, 10)

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickValues(xTicks))
      .selectAll('text')
      .style('fill', 'var(--color-text-secondary)')

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5, '.0e'))
      .selectAll('text')
      .style('fill', 'var(--color-text-secondary)')

    // Axis labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .style('fill', 'var(--color-text-secondary)')
      .style('font-size', '12px')
      .text(t('chart.xAxis'))

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('fill', 'var(--color-text-secondary)')
      .style('font-size', '12px')
      .text(t('chart.yAxis'))

    // Draw limit lines for active profiles
    activeProfiles.forEach((profile, index) => {
      const curveData = generateProfileLimitCurve(profile, [0, xMax], 0.5)

      const limitLine = d3.line<{ mass: number; limit: number }>()
        .x(d => xScale(d.mass))
        .y(d => yScale(Math.max(d.limit, 1e-6)))
        .curve(d3.curveStepAfter)

      // Different dash patterns for different profiles
      const dashPatterns = ['5,5', '2,2', '8,3', '3,3,8,3']
      const dashPattern = dashPatterns[index % dashPatterns.length]

      g.append('path')
        .datum(curveData)
        .attr('fill', 'none')
        .attr('stroke', profile.color)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', dashPattern)
        .attr('d', limitLine)
    })

    // Line generator
    const line = d3.line<NormalizedData>()
      .x(d => xScale(d.mass))
      .y(d => yScale(Math.max(d.normalizedToH2, 1e-6)))

    // Draw spectrum lines for each visible file
    visibleFiles.forEach((file) => {
      const colorIndex = files.findIndex(f => f.id === file.id)
      g.append('path')
        .datum(file.analysisResult.normalizedData)
        .attr('fill', 'none')
        .attr('stroke', FILE_COLORS[colorIndex] || FILE_COLORS[0])
        .attr('stroke-width', 1.5)
        .attr('d', line)
    })

    // Peak annotations - detect all significant peaks dynamically
    if (visibleFiles.length > 0) {
      const firstData = visibleFiles[0].analysisResult.normalizedData

      // Find local maxima (peaks) above threshold
      const threshold = 0.005 // 0.5% minimum
      const minPeakDistance = 3 // Minimum mass units between labels to avoid overlap

      const peaks: { mass: number; value: number }[] = []

      for (let i = 1; i < firstData.length - 1; i++) {
        const prev = firstData[i - 1]
        const curr = firstData[i]
        const next = firstData[i + 1]

        // Check if current point is a local maximum
        if (curr.normalizedToH2 > prev.normalizedToH2 &&
            curr.normalizedToH2 > next.normalizedToH2 &&
            curr.normalizedToH2 > threshold) {
          // Round mass to nearest integer for labeling
          const roundedMass = Math.round(curr.mass)
          peaks.push({ mass: roundedMass, value: curr.normalizedToH2 })
        }
      }

      // Sort by intensity (highest first) and filter to avoid overlapping labels
      const sortedPeaks = peaks.sort((a, b) => b.value - a.value)
      const labeledMasses: number[] = []

      sortedPeaks.forEach(peak => {
        // Check if any already-labeled mass is too close
        const tooClose = labeledMasses.some(m => Math.abs(m - peak.mass) < minPeakDistance)
        if (!tooClose) {
          labeledMasses.push(peak.mass)

          const point = firstData.find(d => Math.abs(d.mass - peak.mass) < 0.5)
          if (point) {
            const yPos = Math.max(yScale(Math.max(point.normalizedToH2, 1e-6)) - 10, 5)
            g.append('text')
              .attr('x', xScale(peak.mass))
              .attr('y', yPos)
              .attr('text-anchor', 'middle')
              .style('fill', 'var(--color-text-primary)')
              .style('font-size', '10px')
              .style('font-weight', '500')
              .text(peak.mass.toString())
          }
        }
      })
    }

    // Interactive crosshair and tooltip
    const crosshair = g.append('g')
      .attr('class', 'crosshair')
      .style('display', 'none')

    crosshair.append('line')
      .attr('class', 'crosshair-line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', 'var(--color-text-muted)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')

    // Add circles for each visible file
    visibleFiles.forEach((file, i) => {
      const colorIndex = files.findIndex(f => f.id === file.id)
      crosshair.append('circle')
        .attr('class', `crosshair-dot-${i}`)
        .attr('r', 5)
        .attr('fill', FILE_COLORS[colorIndex] || FILE_COLORS[0])
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
    })

    // Overlay for mouse events
    const overlay = g.append('rect')
      .attr('class', 'overlay')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')

    // Bisector for finding nearest data point
    const bisect = d3.bisector((d: NormalizedData) => d.mass).left

    overlay.on('mousemove', function(event) {
      const [mouseX] = d3.pointer(event)
      const mass = xScale.invert(mouseX)

      // Clamp mass to valid range
      const clampedMass = Math.max(0, Math.min(mass, xMax))

      // Update crosshair position
      crosshair.style('display', null)
      crosshair.select('.crosshair-line')
        .attr('x1', xScale(clampedMass))
        .attr('x2', xScale(clampedMass))

      // Find values for each visible file
      const values: { fileIndex: number; value: number; color: string }[] = []

      visibleFiles.forEach((file, i) => {
        const data = file.analysisResult.normalizedData
        const idx = bisect(data, clampedMass)
        const d0 = data[idx - 1]
        const d1 = data[idx]
        const point = d0 && d1
          ? (clampedMass - d0.mass > d1.mass - clampedMass ? d1 : d0)
          : d0 || d1

        if (point) {
          const colorIndex = files.findIndex(f => f.id === file.id)
          const yPos = yScale(Math.max(point.normalizedToH2, 1e-6))

          crosshair.select(`.crosshair-dot-${i}`)
            .attr('cx', xScale(clampedMass))
            .attr('cy', yPos)

          values.push({
            fileIndex: colorIndex,
            value: point.normalizedToH2,
            color: FILE_COLORS[colorIndex] || FILE_COLORS[0]
          })
        }
      })

      // Update tooltip
      const containerRect = container.getBoundingClientRect()
      setTooltip({
        mass: clampedMass,
        gas: getGasForMass(clampedMass),
        values,
        x: event.clientX - containerRect.left,
        y: event.clientY - containerRect.top
      })
    })

    overlay.on('mouseleave', function() {
      crosshair.style('display', 'none')
      setTooltip(null)
    })

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - margin.right + 10}, ${margin.top})`)

    // File legends
    files.forEach((file, i) => {
      const y = i * 22
      const isVisible = chartOptions.visibleFiles.includes(file.id)

      legend.append('line')
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('y1', y + 8)
        .attr('y2', y + 8)
        .attr('stroke', FILE_COLORS[i])
        .attr('stroke-width', 2)
        .attr('opacity', isVisible ? 1 : 0.3)

      legend.append('text')
        .attr('x', 26)
        .attr('y', y + 12)
        .style('fill', isVisible ? 'var(--color-text-secondary)' : 'var(--color-text-muted)')
        .style('font-size', '10px')
        .text(formatDate(file.rawData.metadata.startTime))
    })

    // Limit profile legends (after file legends)
    const limitLegendStart = files.length * 22 + 10
    const dashPatterns = ['5,5', '2,2', '8,3', '3,3,8,3']

    activeProfiles.forEach((profile, i) => {
      const y = limitLegendStart + i * 20
      const dashPattern = dashPatterns[i % dashPatterns.length]

      legend.append('line')
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('y1', y + 8)
        .attr('y2', y + 8)
        .attr('stroke', profile.color)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', dashPattern)

      legend.append('text')
        .attr('x', 26)
        .attr('y', y + 12)
        .style('fill', 'var(--color-text-secondary)')
        .style('font-size', '10px')
        .text(profile.name.length > 12 ? profile.name.slice(0, 12) + '...' : profile.name)
    })

  }, [files, limitChecks, chartOptions, activeProfiles, t, i18n.language])

  return (
    <Card>
      <CardHeader
        title={t('chart.title')}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            {/* File visibility checkboxes */}
            {files.length > 1 && (
              <>
                {files.map((file, index) => (
                  <label key={file.id} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={chartOptions.visibleFiles.includes(file.id)}
                      onChange={() => toggleFileVisibility(file.id)}
                      className="w-3.5 h-3.5 rounded"
                      style={{ accentColor: FILE_COLORS[index] }}
                    />
                    <span
                      className="text-micro"
                      style={{ color: FILE_COLORS[index] }}
                    >
                      {formatDate(file.rawData.metadata.startTime)}
                    </span>
                  </label>
                ))}
                <span className="text-text-muted text-micro">|</span>
              </>
            )}

            {/* Chart options */}
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={chartOptions.logScale}
                onChange={(e) => updateChartOptions({ logScale: e.target.checked })}
                className="w-3.5 h-3.5 rounded accent-accent-teal"
              />
              <span className="text-micro text-text-secondary">{t('chart.logScale')}</span>
            </label>

            <span className="text-text-muted text-micro">|</span>

            {/* Profile toggles - show all profiles */}
            {limitProfiles.map((profile) => (
              <label key={profile.id} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeLimitProfileIds.includes(profile.id)}
                  onChange={() => toggleLimitProfile(profile.id)}
                  className="w-3.5 h-3.5 rounded"
                  style={{ accentColor: profile.color }}
                />
                <span
                  className="text-micro"
                  style={{ color: activeLimitProfileIds.includes(profile.id) ? profile.color : 'var(--color-text-muted)' }}
                >
                  {profile.name.length > 8 ? profile.name.slice(0, 8) + '..' : profile.name}
                </span>
              </label>
            ))}
          </div>
        }
      />
      <div ref={containerRef} className="w-full relative" onMouseLeave={() => setTooltip(null)}>
        <svg ref={svgRef} className="w-full" role="img" aria-label="RGA Spectrum Chart" />

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-50 pointer-events-none bg-surface-card border border-subtle rounded-chip shadow-lg px-3 py-2"
            style={{
              left: Math.min(tooltip.x + 15, (containerRef.current?.clientWidth || 0) - 180),
              top: Math.max(tooltip.y - 60, 10),
            }}
          >
            <div className="text-caption font-semibold text-text-primary mb-1">
              Mass {tooltip.mass.toFixed(1)} AMU
            </div>
            <div className="text-micro text-text-secondary mb-2">
              {tooltip.gas}
            </div>
            {tooltip.values.map((v, i) => (
              <div key={i} className="flex items-center gap-2 text-micro">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: v.color }}
                />
                <span className="text-text-secondary">
                  {(v.value * 100).toFixed(3)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
