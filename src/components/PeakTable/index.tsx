import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Peak } from '@/types/rga'
import { Card, CardHeader } from '@/components/ui/Card'
import { cn } from '@/lib/utils/cn'

interface PeakTableProps {
  peaks: Peak[]
  title?: string
}

interface TooltipState {
  peak: Peak
  x: number
  y: number
}

export function PeakTable({ peaks, title }: PeakTableProps) {
  const { t, i18n } = useTranslation()
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  // Show top 15 peaks
  const displayPeaks = peaks.slice(0, 15)

  const handleMouseEnter = (e: React.MouseEvent<HTMLTableRowElement>, peak: Peak) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltip({
      peak,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    })
  }

  const isGerman = i18n.language === 'de'

  return (
    <Card className="relative">
      <CardHeader title={title || t('peaks.title')} />

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-subtle">
              <th className="text-left text-caption font-medium text-text-muted pb-3 pr-4">
                {t('peaks.mass')}
              </th>
              <th className="text-left text-caption font-medium text-text-muted pb-3 pr-4">
                {t('peaks.gas')}
              </th>
              <th className="text-right text-caption font-medium text-text-muted pb-3">
                {t('peaks.intensity')}
              </th>
            </tr>
          </thead>
          <tbody onMouseLeave={() => setTooltip(null)}>
            {displayPeaks.map((peak, index) => (
              <tr
                key={peak.mass}
                onMouseEnter={(e) => handleMouseEnter(e, peak)}
                className={cn(
                  'list-item-animate border-b border-subtle last:border-0 cursor-pointer hover:bg-surface-card-muted transition-colors',
                  index === 0 && 'bg-accent-mint/5'
                )}
              >
                <td className="py-3 pr-4">
                  <span className="text-body font-medium text-text-primary">
                    {peak.mass}
                  </span>
                  <span className="text-caption text-text-muted ml-1">AMU</span>
                </td>
                <td className="py-3 pr-4">
                  <span className="text-body text-text-primary">{peak.gasIdentification}</span>
                </td>
                <td className="py-3 text-right">
                  <span
                    className={cn(
                      'inline-block px-2 py-1 rounded-chip text-caption font-medium',
                      peak.normalizedValue >= 0.1
                        ? 'bg-accent-mint/10 text-accent-mint'
                        : peak.normalizedValue >= 0.01
                        ? 'bg-accent-cyan/10 text-accent-cyan'
                        : 'bg-surface-card-muted text-text-secondary'
                    )}
                  >
                    {(peak.normalizedValue * 100).toFixed(3)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-surface-card border border-subtle rounded-lg shadow-lg px-4 py-3 min-w-[220px] max-w-[320px]"
          style={{
            left: Math.max(10, Math.min(tooltip.x - 110, window.innerWidth - 330)),
            top: Math.max(10, tooltip.y - 100),
            transform: 'translateY(-100%)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-text-primary">
              m/z {tooltip.peak.mass}
            </span>
            <span className="text-xs font-mono bg-surface-card-muted px-2 py-0.5 rounded">
              {(tooltip.peak.normalizedValue * 100).toFixed(4)}%
            </span>
          </div>

          <div className="text-sm text-text-primary mb-2">
            {tooltip.peak.gasIdentification}
          </div>

          {tooltip.peak.fragments && tooltip.peak.fragments.length > 0 && (
            <div className="border-t border-subtle pt-2 mt-2">
              <div className="text-xs text-text-muted mb-1">
                {isGerman ? 'Mögliche Quellen:' : 'Possible sources:'}
              </div>
              <div className="flex flex-wrap gap-1">
                {tooltip.peak.fragments.map((frag, i) => (
                  <span
                    key={i}
                    className="text-xs bg-accent-cyan/10 text-accent-cyan px-2 py-0.5 rounded"
                  >
                    {frag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-subtle pt-2 mt-2 text-xs text-text-muted">
            {isGerman ? 'Ionenstrom:' : 'Ion current:'}{' '}
            <span className="font-mono">{tooltip.peak.integratedCurrent.toExponential(2)} A</span>
          </div>
        </div>
      )}
    </Card>
  )
}
