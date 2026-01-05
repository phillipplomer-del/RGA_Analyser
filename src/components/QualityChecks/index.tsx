import { useTranslation } from 'react-i18next'
import type { QualityCheck } from '@/types/rga'
import { Card, CardHeader } from '@/components/ui/Card'
import { cn } from '@/lib/utils/cn'

interface QualityChecksProps {
  checks: QualityCheck[]
}

export function QualityChecks({ checks }: QualityChecksProps) {
  const { t } = useTranslation()

  const passedCount = checks.filter((c) => c.passed).length
  const allPassed = passedCount === checks.length

  return (
    <Card>
      <CardHeader
        title={t('quality.title')}
        action={
          <span
            className={cn(
              'px-3 py-1 rounded-full text-caption font-medium',
              allPassed ? 'bg-state-success/10 text-state-success' : 'bg-state-danger/10 text-state-danger'
            )}
          >
            {passedCount}/{checks.length}
          </span>
        }
      />

      <div className="space-y-3">
        {checks.map((check) => (
          <div
            key={check.name}
            className={cn(
              'chip-animate flex items-center gap-3 px-4 py-3 rounded-chip',
              check.passed ? 'bg-state-success/5' : 'bg-state-danger/5'
            )}
          >
            <div
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-text-inverse text-micro font-bold',
                check.passed ? 'bg-state-success' : 'bg-state-danger'
              )}
            >
              {check.passed ? '✓' : '✗'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body font-medium text-text-primary">{check.name}</p>
              <p className="text-caption text-text-muted truncate" title={check.description}>
                {check.description}
              </p>
            </div>
            <div className="text-right">
              <p className="text-caption font-medium text-text-primary">
                {check.measuredValue === Infinity ? '∞' : check.measuredValue.toFixed(2)}
              </p>
              <p className="text-micro text-text-muted">
                / {check.threshold}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
