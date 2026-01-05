import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import * as d3 from 'd3'
import type { NormalizedData, LimitCheck } from '@/types/rga'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardHeader } from '@/components/ui/Card'

interface SpectrumChartProps {
  data: NormalizedData[]
  limitChecks: LimitCheck[]
}

export function SpectrumChart({ data, limitChecks }: SpectrumChartProps) {
  const { t } = useTranslation()
  const { chartOptions, updateChartOptions } = useAppStore()
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = 400
    const margin = { top: 20, right: 120, bottom: 50, left: 70 }
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

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, innerWidth])

    const yScale = chartOptions.logScale
      ? d3.scaleLog()
          .domain([1e-6, 1])
          .range([innerHeight, 0])
          .clamp(true)
      : d3.scaleLinear()
          .domain([0, 1])
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
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickValues(d3.range(0, 101, 10)))
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

    // GSI Limit line
    if (chartOptions.showGSILimit && limitChecks.length > 0) {
      const gsiLine = d3.line<LimitCheck>()
        .x(d => xScale(d.mass))
        .y(d => yScale(Math.max(d.gsiLimit, 1e-6)))
        .curve(d3.curveStepAfter)

      g.append('path')
        .datum(limitChecks)
        .attr('fill', 'none')
        .attr('stroke', 'var(--color-chart-gsi-limit)')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('d', gsiLine)
    }

    // CERN Limit line
    if (chartOptions.showCERNLimit && limitChecks.length > 0) {
      const cernLine = d3.line<LimitCheck>()
        .x(d => xScale(d.mass))
        .y(d => yScale(Math.max(d.cernLimit, 1e-6)))
        .curve(d3.curveStepAfter)

      g.append('path')
        .datum(limitChecks)
        .attr('fill', 'none')
        .attr('stroke', 'var(--color-chart-cern-limit)')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '2,2')
        .attr('d', cernLine)
    }

    // Spectrum line
    const line = d3.line<NormalizedData>()
      .x(d => xScale(d.mass))
      .y(d => yScale(Math.max(d.normalizedToH2, 1e-6)))

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'var(--color-chart-spectrum)')
      .attr('stroke-width', 1.5)
      .attr('d', line)

    // Peak annotations
    const significantMasses = [2, 14, 16, 17, 18, 28, 32, 40, 44]
    significantMasses.forEach(mass => {
      const point = data.find(d => Math.abs(d.mass - mass) < 0.1)
      if (point && point.normalizedToH2 > 0.005) {
        g.append('text')
          .attr('x', xScale(mass))
          .attr('y', yScale(Math.max(point.normalizedToH2, 1e-6)) - 10)
          .attr('text-anchor', 'middle')
          .style('fill', 'var(--color-text-primary)')
          .style('font-size', '11px')
          .style('font-weight', '500')
          .text(mass.toString())
      }
    })

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - margin.right + 10}, ${margin.top})`)

    const legendItems = [
      { color: 'var(--color-chart-spectrum)', label: t('chart.title'), dash: '' },
      { color: 'var(--color-chart-gsi-limit)', label: 'GSI Limit', dash: '5,5' },
      { color: 'var(--color-chart-cern-limit)', label: 'CERN Limit', dash: '2,2' },
    ]

    legendItems.forEach((item, i) => {
      const y = i * 25
      legend.append('line')
        .attr('x1', 0)
        .attr('x2', 25)
        .attr('y1', y + 10)
        .attr('y2', y + 10)
        .attr('stroke', item.color)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', item.dash)

      legend.append('text')
        .attr('x', 32)
        .attr('y', y + 14)
        .style('fill', 'var(--color-text-secondary)')
        .style('font-size', '11px')
        .text(item.label)
    })

  }, [data, limitChecks, chartOptions, t])

  return (
    <Card>
      <CardHeader
        title={t('chart.title')}
        action={
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={chartOptions.logScale}
                onChange={(e) => updateChartOptions({ logScale: e.target.checked })}
                className="w-4 h-4 rounded accent-accent-teal"
              />
              <span className="text-caption text-text-secondary">{t('chart.logScale')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={chartOptions.showGSILimit}
                onChange={(e) => updateChartOptions({ showGSILimit: e.target.checked })}
                className="w-4 h-4 rounded accent-chart-gsi-limit"
              />
              <span className="text-caption text-text-secondary">{t('chart.gsiLimit')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={chartOptions.showCERNLimit}
                onChange={(e) => updateChartOptions({ showCERNLimit: e.target.checked })}
                className="w-4 h-4 rounded accent-chart-cern-limit"
              />
              <span className="text-caption text-text-secondary">{t('chart.cernLimit')}</span>
            </label>
          </div>
        }
      />
      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} className="w-full" role="img" aria-label="RGA Spectrum Chart" />
      </div>
    </Card>
  )
}
