import { useTranslation } from 'react-i18next'
import type { Peak } from '@/types/rga'
import { Card, CardHeader } from '@/components/ui/Card'
import { cn } from '@/lib/utils/cn'

interface PeakTableProps {
  peaks: Peak[]
  title?: string
}

export function PeakTable({ peaks, title }: PeakTableProps) {
  const { t } = useTranslation()

  // Show top 15 peaks
  const displayPeaks = peaks.slice(0, 15)

  return (
    <Card>
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
          <tbody>
            {displayPeaks.map((peak, index) => (
              <tr
                key={peak.mass}
                className={cn(
                  'list-item-animate border-b border-subtle last:border-0',
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
    </Card>
  )
}
