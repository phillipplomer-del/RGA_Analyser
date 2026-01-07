/**
 * Limit Check Card Component
 * Displays pass/fail status against leak rate limit
 */

import { useTranslation } from 'react-i18next'
import type { LimitCheckResult } from '@/types/rateOfRise'

interface LimitCheckCardProps {
  check: LimitCheckResult
  isGerman: boolean
}

export function LimitCheckCard({ check, isGerman }: LimitCheckCardProps) {
  const { t } = useTranslation()

  const passed = check.passed
  const marginText =
    check.margin < 1
      ? `${((1 - check.margin) * 100).toFixed(0)}% ${
          isGerman ? 'unter Limit' : 'below limit'
        }`
      : `${((check.margin - 1) * 100).toFixed(0)}% ${
          isGerman ? 'über Limit' : 'above limit'
        }`

  return (
    <div className="bg-surface-card rounded-card shadow-card p-4">
      <h3 className="text-micro font-semibold text-text-muted uppercase tracking-wider mb-3">
        {t('rateOfRise.limitCheck.title', 'Grenzwert-Prüfung')}
      </h3>

      {/* Pass/Fail Status */}
      <div
        className={`rounded-xl p-4 mb-4 ${
          passed ? 'bg-mint-500/10' : 'bg-coral-500/10'
        }`}
      >
        <div className="flex items-center gap-3">
          {passed ? (
            <svg
              className="w-8 h-8 text-mint-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              className="w-8 h-8 text-coral-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          <div>
            <div
              className={`text-lg font-bold ${
                passed ? 'text-mint-500' : 'text-coral-500'
              }`}
            >
              {passed
                ? t('rateOfRise.limitCheck.passed', 'BESTANDEN')
                : t('rateOfRise.limitCheck.failed', 'NICHT BESTANDEN')}
            </div>
            <div className="text-caption text-text-secondary">{marginText}</div>
          </div>
        </div>
      </div>

      {/* Limit Details */}
      <div className="space-y-2 text-caption">
        <div className="flex justify-between">
          <span className="text-text-secondary">
            {t('rateOfRise.limitCheck.limit', 'Grenzwert')}
          </span>
          <span className="text-text-primary font-medium">
            {check.limit.toExponential(0)} mbar·L/s
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-text-secondary">
            {t('rateOfRise.limitCheck.source', 'Quelle')}
          </span>
          <span className="text-text-primary">{check.limitSource}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-text-secondary">
            {t('rateOfRise.limitCheck.factor', 'Faktor')}
          </span>
          <span
            className={`font-medium ${
              check.margin <= 1 ? 'text-mint-500' : 'text-coral-500'
            }`}
          >
            {check.margin.toFixed(2)}×
          </span>
        </div>
      </div>
    </div>
  )
}
