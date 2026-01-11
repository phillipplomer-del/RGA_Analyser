/**
 * Limit Check Card Component (Enhanced with Statistical Significance)
 * Displays pass/fail status against leak rate limit with confidence levels
 * 
 * Implements: JCGM 106:2012 (ISO/IEC Guide 98-4) decision rules
 */

import { useTranslation } from 'react-i18next'
import type { LimitCheckResult } from '@/types/rateOfRise'
import { compareToLimit, getSignificanceColor } from '@/lib/uncertainty/limitComparison'

interface LimitCheckCardProps {
  check: LimitCheckResult
  isGerman: boolean
  // Optional: uncertainty can be provided for enhanced statistical analysis
  uncertainty?: number  // Standard uncertainty (1σ) in mbar·L/s
  leakRate?: number     // Actual leak rate value in mbar·L/s
}

export function LimitCheckCard({ check, isGerman, uncertainty, leakRate }: LimitCheckCardProps) {
  const { t } = useTranslation()

  const passed = check.passed
  const marginText =
    check.margin < 1
      ? `${((1 - check.margin) * 100).toFixed(0)}% ${isGerman ? 'unter Limit' : 'below limit'
      }`
      : `${((check.margin - 1) * 100).toFixed(0)}% ${isGerman ? 'über Limit' : 'above limit'
      }`

  // Enhanced statistical significance analysis (if uncertainty provided)
  const hasStatisticalAnalysis = uncertainty && leakRate && uncertainty > 0
  const significance = hasStatisticalAnalysis
    ? compareToLimit(leakRate, uncertainty, check.limit)
    : null

  const significanceColor = significance ? getSignificanceColor(significance.conclusion) : null

  return (
    <div className="bg-surface-card rounded-card shadow-card p-4">
      <h3 className="text-micro font-semibold text-text-muted uppercase tracking-wider mb-3">
        {t('rateOfRise.limitCheck.title', 'Grenzwert-Prüfung')}
      </h3>

      {/* Pass/Fail Status */}
      <div
        className={`rounded-xl p-4 mb-4 ${significance
          ? significanceColor === 'success'
            ? 'bg-mint-500/10'
            : significanceColor === 'warning'
              ? 'bg-amber-500/10'
              : 'bg-coral-500/10'
          : passed
            ? 'bg-mint-500/10'
            : 'bg-coral-500/10'
          }`}
      >
        <div className="flex items-center gap-3">
          {passed ? (
            <svg
              className={`w-8 h-8 ${significanceColor === 'warning' ? 'text-amber-500' : 'text-mint-500'
                }`}
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
          <div className="flex-1">
            <div
              className={`text-lg font-bold ${significance
                ? significanceColor === 'success'
                  ? 'text-mint-500'
                  : significanceColor === 'warning'
                    ? 'text-amber-500'
                    : 'text-coral-500'
                : passed
                  ? 'text-mint-500'
                  : 'text-coral-500'
                }`}
            >
              {passed
                ? t('rateOfRise.limitCheck.passed', 'BESTANDEN')
                : t('rateOfRise.limitCheck.failed', 'NICHT BESTANDEN')}
            </div>
            <div className="text-caption text-text-secondary">{marginText}</div>

            {/* Statistical Significance Info */}
            {significance && (
              <div className="mt-2 pt-2 border-t border-text-muted/10">
                <div className="flex items-center gap-2 text-small">
                  <span className="text-text-secondary">
                    {isGerman ? 'Sicherheit:' : 'Certainty:'}
                  </span>
                  <span className="font-bold text-text-primary">
                    {significance.confidenceLevel.toFixed(0)}%
                  </span>
                  <span className="text-text-muted">•</span>
                  <span className="text-text-secondary">
                    {isGerman ? 'Abstand:' : 'Distance:'}
                  </span>
                  <span className="font-mono font-medium text-text-primary">
                    {Math.abs(significance.margin).toFixed(1)}σ
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistical Recommendation (if available) */}
      {significance && (
        <div className={`rounded-lg p-3 mb-4 border ${significanceColor === 'success'
          ? 'bg-mint-500/5 border-mint-500/20'
          : significanceColor === 'warning'
            ? 'bg-amber-500/5 border-amber-500/20'
            : 'bg-coral-500/5 border-coral-500/20'
          }`}>
          <div className="flex items-start gap-2">
            <svg
              className={`w-5 h-5 mt-0.5 flex-shrink-0 ${significanceColor === 'success'
                ? 'text-mint-500'
                : significanceColor === 'warning'
                  ? 'text-amber-500'
                  : 'text-coral-500'
                }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <div className="text-small font-medium text-text-primary mb-1">
                {isGerman ? significance.message.de : significance.message.en}
              </div>
              <div className="text-caption text-text-secondary">
                {isGerman ? significance.recommendation.de : significance.recommendation.en}
              </div>
            </div>
          </div>
        </div>
      )}

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
            className={`font-medium ${check.margin <= 1 ? 'text-mint-500' : 'text-coral-500'
              }`}
          >
            {check.margin.toFixed(2)}×
          </span>
        </div>

        {/* Show info if statistical analysis is used */}
        {significance && (
          <div className="flex justify-between pt-2 border-t border-text-muted/10">
            <span className="text-text-secondary">
              {isGerman ? 'ℹ️ Info' : 'ℹ️ Info'}
            </span>
            <span className="text-text-primary text-micro">
              {isGerman
                ? 'Mit Messunsicherheit berechnet'
                : 'Calculated with measurement uncertainty'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
