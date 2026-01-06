import { useTranslation } from 'react-i18next'
import { Card, CardHeader } from '@/components/ui/Card'
import { cn } from '@/lib/utils/cn'
import type { ComparisonResult } from '@/types/rga'
import { formatImprovement, getGradeColor } from '@/lib/comparison'

interface ComparisonPanelProps {
  result: ComparisonResult
}

export function ComparisonPanel({ result }: ComparisonPanelProps) {
  const { t } = useTranslation()
  const { summary, overallImprovement } = result

  const gradeLabels: Record<typeof summary.overallGrade, string> = {
    excellent: t('comparison.grade.excellent', 'Ausgezeichnet'),
    good: t('comparison.grade.good', 'Gut'),
    mixed: t('comparison.grade.mixed', 'Gemischt'),
    poor: t('comparison.grade.poor', 'Schlecht'),
  }

  return (
    <Card>
      <CardHeader title={t('comparison.summary', 'Vergleichs-Zusammenfassung')} />

      <div className="space-y-6">
        {/* Overall Improvement */}
        <div className="flex items-center justify-between p-4 bg-surface-card-muted rounded-card">
          <div>
            <div className="text-caption text-text-muted mb-1">
              {t('comparison.overallImprovement', 'Gesamtverbesserung')}
            </div>
            <div
              className={cn(
                'text-display font-bold',
                overallImprovement > 0 ? 'text-state-success' : 'text-state-danger'
              )}
            >
              {formatImprovement(overallImprovement)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-caption text-text-muted mb-1">
              {t('comparison.overallGrade', 'Bewertung')}
            </div>
            <div className={cn('text-title font-semibold', getGradeColor(summary.overallGrade))}>
              {gradeLabels[summary.overallGrade]}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Improved Peaks */}
          <StatCard
            label={t('comparison.improvedPeaks', 'Verbesserte Peaks')}
            value={summary.improvedPeaks}
            total={summary.totalPeaksCompared}
            colorClass="text-state-success"
          />

          {/* Worsened Peaks */}
          <StatCard
            label={t('comparison.worsenedPeaks', 'Verschlechterte Peaks')}
            value={summary.worsenedPeaks}
            total={summary.totalPeaksCompared}
            colorClass="text-state-danger"
          />

          {/* Resolved Violations */}
          <StatCard
            label={t('comparison.resolvedViolations', 'Behobene Überschreitungen')}
            value={summary.resolvedViolations}
            colorClass="text-state-success"
          />

          {/* New Violations */}
          <StatCard
            label={t('comparison.newViolations', 'Neue Überschreitungen')}
            value={summary.newViolations}
            colorClass="text-state-danger"
          />
        </div>

        {/* File Info */}
        <div className="border-t border-subtle pt-4">
          <div className="grid grid-cols-2 gap-4 text-caption">
            <div>
              <span className="text-text-muted">{t('comparison.before', 'Vorher')}: </span>
              <span className="text-text-secondary font-medium">
                {result.beforeFile.filename}
              </span>
            </div>
            <div>
              <span className="text-text-muted">{t('comparison.after', 'Nachher')}: </span>
              <span className="text-text-secondary font-medium">
                {result.afterFile.filename}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

interface StatCardProps {
  label: string
  value: number
  total?: number
  colorClass: string
}

function StatCard({ label, value, total, colorClass }: StatCardProps) {
  return (
    <div className="p-3 bg-surface-card-muted rounded-card">
      <div className="text-caption text-text-muted mb-1">{label}</div>
      <div className={cn('text-title font-semibold', colorClass)}>
        {value}
        {total !== undefined && (
          <span className="text-body text-text-muted font-normal"> / {total}</span>
        )}
      </div>
    </div>
  )
}
