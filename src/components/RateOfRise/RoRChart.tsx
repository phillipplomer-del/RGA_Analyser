/**
 * Rate of Rise Chart Component
 * D3.js visualization of pressure vs time with phases and fit line
 */

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import type { RateOfRiseData, RateOfRiseAnalysis, PressureDataPoint } from '@/types/rateOfRise'
import { formatDuration } from '@/lib/rateOfRise/parser'

interface RoRChartProps {
  data: RateOfRiseData
  analysis: RateOfRiseAnalysis | null
  scale: 'linear' | 'log'
  showFitLine: boolean
  showPhases: boolean
}

export function RoRChart({
  data,
  analysis,
  scale,
  showFitLine,
  showPhases,
}: RoRChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // ResizeObserver for responsive chart
  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setDimensions({ width, height })
      }
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.dataPoints.length === 0) return
    if (dimensions.width === 0 || dimensions.height === 0) return

    const svg = d3.select(svgRef.current)

    // Get dimensions from state
    const { width, height } = dimensions
    const margin = { top: 20, right: 30, bottom: 50, left: 80 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Clear previous content
    svg.selectAll('*').remove()

    // Create main group
    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, data.duration])
      .range([0, innerWidth])

    const yDomain =
      scale === 'log'
        ? [data.minPressure * 0.5, data.maxPressure * 2]
        : [0, data.maxPressure * 1.1]

    const yScale =
      scale === 'log'
        ? d3.scaleLog().domain(yDomain).range([innerHeight, 0]).clamp(true)
        : d3.scaleLinear().domain(yDomain).range([innerHeight, 0])

    // Draw phases background
    if (showPhases && analysis) {
      // Baseline phase (green)
      const baselineEnd = data.dataPoints[analysis.baselinePhase.endIndex]?.relativeTimeS || 0
      g.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', xScale(baselineEnd))
        .attr('height', innerHeight)
        .attr('fill', 'rgba(0, 224, 151, 0.1)')

      // Rise phase (orange)
      const riseStart = data.dataPoints[analysis.risePhase.startIndex]?.relativeTimeS || 0
      g.append('rect')
        .attr('x', xScale(riseStart))
        .attr('y', 0)
        .attr('width', innerWidth - xScale(riseStart))
        .attr('height', innerHeight)
        .attr('fill', 'rgba(224, 80, 0, 0.08)')

      // Phase labels
      g.append('text')
        .attr('x', xScale(baselineEnd / 2))
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--color-state-success)')
        .attr('font-size', '11px')
        .attr('font-weight', '500')
        .text('Baseline')

      g.append('text')
        .attr('x', xScale(riseStart + (data.duration - riseStart) / 2))
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--color-state-warning)')
        .attr('font-size', '11px')
        .attr('font-weight', '500')
        .text('Anstieg')
    }

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', 'currentColor')

    // Data line
    const line = d3
      .line<PressureDataPoint>()
      .x((d) => xScale(d.relativeTimeS))
      .y((d) => {
        const y = yScale(d.pressure1)
        return isFinite(y) ? y : innerHeight
      })
      .defined((d) => d.pressure1 > 0 && isFinite(yScale(d.pressure1)))

    g.append('path')
      .datum(data.dataPoints)
      .attr('fill', 'none')
      .attr('stroke', 'var(--color-accent-cyan)')
      .attr('stroke-width', 1.5)
      .attr('d', line)

    // Fit line
    if (showFitLine && analysis) {
      const riseStartIdx = analysis.risePhase.startIndex
      const riseEndIdx = analysis.risePhase.endIndex
      const riseStartTime = data.dataPoints[riseStartIdx]?.relativeTimeS || 0
      const riseEndTime = data.dataPoints[riseEndIdx]?.relativeTimeS || data.duration

      // Use actual pressure values from rise phase for reliable positioning
      const riseStartP = data.dataPoints[riseStartIdx]?.pressure1 || data.minPressure
      const riseEndP = data.dataPoints[riseEndIdx]?.pressure1 || data.maxPressure

      // Draw fit line using actual data points (more reliable than extrapolation)
      if (riseStartP > 0 && riseEndP > 0 && isFinite(yScale(riseStartP)) && isFinite(yScale(riseEndP))) {
        g.append('line')
          .attr('x1', xScale(riseStartTime))
          .attr('y1', yScale(riseStartP))
          .attr('x2', xScale(riseEndTime))
          .attr('y2', yScale(riseEndP))
          .attr('stroke', 'var(--color-state-warning)')
          .attr('stroke-width', 2.5)
          .attr('stroke-dasharray', '8,4')
          .attr('opacity', 0.9)

        // Fit label with R² - position at 80% of rise phase
        const labelTime = riseStartTime + (riseEndTime - riseStartTime) * 0.8
        const labelP = riseStartP + (riseEndP - riseStartP) * 0.8
        g.append('text')
          .attr('x', xScale(labelTime) + 10)
          .attr('y', yScale(labelP) - 10)
          .attr('fill', 'var(--color-state-warning)')
          .attr('font-size', '11px')
          .attr('font-weight', '600')
          .text(`R² = ${(analysis.linearFit.r2 * 100).toFixed(1)}%`)
      }
    }

    // X Axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(8)
      .tickFormat((d) => formatDuration(d as number))

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', 'var(--color-text-secondary)')

    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--color-text-secondary)')
      .attr('font-size', '12px')
      .text('Zeit')

    // Y Axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(scale === 'log' ? 5 : 8)
      .tickFormat((d) => (d as number).toExponential(0))

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', 'var(--color-text-secondary)')

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -60)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--color-text-secondary)')
      .attr('font-size', '12px')
      .text('Druck [mbar]')

    // Tooltip
    const tooltip = d3
      .select(containerRef.current)
      .append('div')
      .attr('class', 'absolute hidden bg-surface-card shadow-lg rounded-lg p-2 text-xs pointer-events-none z-10')
      .style('border', '1px solid var(--color-border-subtle)')

    // Crosshair
    const crosshairX = g
      .append('line')
      .attr('class', 'crosshair')
      .attr('stroke', 'var(--color-text-muted)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0)

    const crosshairY = g
      .append('line')
      .attr('class', 'crosshair')
      .attr('stroke', 'var(--color-text-muted)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0)

    const hoverDot = g
      .append('circle')
      .attr('r', 5)
      .attr('fill', 'var(--color-accent-cyan)')
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .attr('opacity', 0)

    // Mouse events
    const overlay = g
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')

    overlay.on('mousemove', (event) => {
      const [mouseX] = d3.pointer(event)
      const time = xScale.invert(mouseX)

      // Find nearest data point
      const bisect = d3.bisector<PressureDataPoint, number>((d) => d.relativeTimeS).left
      const index = bisect(data.dataPoints, time)
      const d0 = data.dataPoints[index - 1]
      const d1 = data.dataPoints[index]

      if (!d0 && !d1) return

      const d =
        !d0 || (d1 && time - d0.relativeTimeS > d1.relativeTimeS - time) ? d1 : d0

      if (!d || d.pressure1 <= 0) return

      const x = xScale(d.relativeTimeS)
      const y = yScale(d.pressure1)

      if (!isFinite(y)) return

      // Update crosshair
      crosshairX.attr('x1', x).attr('x2', x).attr('y1', 0).attr('y2', innerHeight).attr('opacity', 0.5)
      crosshairY.attr('x1', 0).attr('x2', innerWidth).attr('y1', y).attr('y2', y).attr('opacity', 0.5)
      hoverDot.attr('cx', x).attr('cy', y).attr('opacity', 1)

      // Update tooltip
      tooltip
        .style('left', `${x + margin.left + 15}px`)
        .style('top', `${y + margin.top - 10}px`)
        .classed('hidden', false)
        .html(
          `<div class="font-medium text-text-primary">${d.pressure1.toExponential(3)} mbar</div>
           <div class="text-text-muted">t = ${formatDuration(d.relativeTimeS)}</div>`
        )
    })

    overlay.on('mouseleave', () => {
      crosshairX.attr('opacity', 0)
      crosshairY.attr('opacity', 0)
      hoverDot.attr('opacity', 0)
      tooltip.classed('hidden', true)
    })

    // Cleanup
    return () => {
      tooltip.remove()
    }
  }, [data, analysis, scale, showFitLine, showPhases, dimensions])

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  )
}
