import { useTranslation } from 'react-i18next'
import { Card, CardHeader } from '@/components/ui/Card'
import { cn } from '@/lib/utils/cn'
import type { PeakComparison } from '@/types/rga'
import { formatImprovement, getStatusColor } from '@/lib/comparison'

interface PeakComparisonTableProps {
  comparisons: PeakComparison[]
}

export function PeakComparisonTable({ comparisons }: PeakComparisonTableProps) {
  const { t } = useTranslation()

  const statusLabels: Record<PeakComparison['status'], string> = {
    improved: t('comparison.status.improved', 'Verbessert'),
    worsened: t('comparison.status.worsened', 'Verschlechtert'),
    unchanged: t('comparison.status.unchanged', 'Unverändert'),
    new: t('comparison.status.new', 'Neu'),
    removed: t('comparison.status.removed', 'Entfernt'),
  }

  // Show significant peaks first (sorted by absolute change)
  const sortedComparisons = [...comparisons].sort(
    (a, b) => Math.abs(b.percentageChange) - Math.abs(a.percentageChange)
  )

  return (
    <Card>
      <CardHeader title={t('comparison.peakComparison', 'Peak-Vergleich')} />

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-subtle">
              <th className="text-left text-caption font-medium text-text-muted pb-3 pr-4">
                {t('peaks.mass', 'Masse')}
              </th>
              <th className="text-left text-caption font-medium text-text-muted pb-3 pr-4">
                {t('peaks.gas', 'Gas')}
              </th>
              <th className="text-right text-caption font-medium text-text-muted pb-3 pr-4">
                {t('comparison.before', 'Vorher')}
              </th>
              <th className="text-right text-caption font-medium text-text-muted pb-3 pr-4">
                {t('comparison.after', 'Nachher')}
              </th>
              <th className="text-right text-caption font-medium text-text-muted pb-3 pr-4">
                {t('comparison.change', 'Änderung')}
              </th>
              <th className="text-center text-caption font-medium text-text-muted pb-3">
                {t('comparison.status', 'Status')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedComparisons.map((comp) => (
              <tr
                key={comp.mass}
                className={cn(
                  'list-item-animate border-b border-subtle last:border-0',
                  comp.status === 'improved' && 'bg-state-success/5',
                  comp.status === 'removed' && 'bg-state-success/5',
                  comp.status === 'worsened' && 'bg-state-danger/5',
                  comp.status === 'new' && 'bg-state-danger/5'
                )}
              >
                <td className="py-3 pr-4">
                  <span className="text-body font-medium text-text-primary">
                    {comp.mass}
                  </span>
                  <span className="text-caption text-text-muted ml-1">AMU</span>
                </td>
                <td className="py-3 pr-4">
                  <span className="text-body text-text-primary">{comp.gasIdentification}</span>
                </td>
                <td className="py-3 pr-4 text-right">
                  <span className="text-body text-text-secondary">
                    {comp.beforeValue > 0 ? `${(comp.beforeValue * 100).toFixed(3)}%` : '-'}
                  </span>
                </td>
                <td className="py-3 pr-4 text-right">
                  <span className="text-body text-text-secondary">
                    {comp.afterValue > 0 ? `${(comp.afterValue * 100).toFixed(3)}%` : '-'}
                  </span>
                </td>
                <td className="py-3 pr-4 text-right">
                  <span
                    className={cn(
                      'text-body font-medium',
                      comp.percentageChange < 0 ? 'text-state-success' : 'text-state-danger',
                      comp.status === 'unchanged' && 'text-text-muted'
                    )}
                  >
                    {formatImprovement(-comp.percentageChange)}
                  </span>
                </td>
                <td className="py-3 text-center">
                  <span
                    className={cn(
                      'inline-block px-2 py-1 rounded-chip text-caption font-medium',
                      getStatusColor(comp.status),
                      comp.status === 'improved' && 'bg-state-success/10',
                      comp.status === 'removed' && 'bg-state-success/10',
                      comp.status === 'worsened' && 'bg-state-danger/10',
                      comp.status === 'new' && 'bg-state-danger/10',
                      comp.status === 'unchanged' && 'bg-surface-card-muted'
                    )}
                  >
                    {statusLabels[comp.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {comparisons.length === 0 && (
        <div className="py-8 text-center text-text-muted">
          {t('comparison.noPeaks', 'Keine Peaks zum Vergleichen')}
        </div>
      )}
    </Card>
  )
}
