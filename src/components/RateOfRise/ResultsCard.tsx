/**
 * Results Card Component
 * Displays dp/dt, leak rate, and fit statistics
 */

import { useTranslation } from 'react-i18next'
import type { RateOfRiseAnalysis } from '@/types/rateOfRise'
import { formatDuration, formatScientific } from '@/lib/rateOfRise/parser'

interface ResultsCardProps {
  analysis: RateOfRiseAnalysis
}

export function ResultsCard({ analysis }: ResultsCardProps) {
  const { t } = useTranslation()

  const { dpdtFormatted, linearFit, leakRate, baselinePhase, risePhase } = analysis

  return (
    <div className="bg-surface-card rounded-card shadow-card p-4">
      <h3 className="text-micro font-semibold text-text-muted uppercase tracking-wider mb-3">
        {t('rateOfRise.results.title', 'Ergebnisse')}
      </h3>

      {/* Main Result: dp/dt */}
      <div className="bg-aqua-500/10 rounded-xl p-4 mb-4">
        <div className="text-caption text-aqua-600 mb-1">
          {t('rateOfRise.results.dpdt', 'Druckanstiegsrate')}
        </div>
        <div className="text-xl font-bold text-aqua-500">{dpdtFormatted}</div>
      </div>

      {/* Leak Rate (if volume provided) */}
      {leakRate && (
        <div className="bg-amber-500/10 rounded-xl p-4 mb-4">
          <div className="text-caption text-amber-600 mb-1">
            {t('rateOfRise.results.leakRate', 'Leckrate')} (V = {leakRate.volume} L)
          </div>
          <div className="text-xl font-bold text-amber-500">{leakRate.QFormatted}</div>
          <div className="text-micro text-text-muted mt-1">
            ≈ {formatScientific(leakRate.equivalentHeLeak, 'mbar·L/s')}{' '}
            {t('rateOfRise.results.heEquivalent', 'He-äquiv.')}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="space-y-2 text-caption">
        <div className="flex justify-between">
          <span className="text-text-secondary">
            {t('rateOfRise.results.fitR2', 'Fit R²')}
          </span>
          <span
            className={`font-medium ${
              linearFit.r2 > 0.99
                ? 'text-mint-500'
                : linearFit.r2 > 0.95
                  ? 'text-amber-500'
                  : 'text-coral-500'
            }`}
          >
            {(linearFit.r2 * 100).toFixed(2)}%
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-text-secondary">
            {t('rateOfRise.results.baseline', 'Basisdruck (p₀)')}
          </span>
          <span className="text-text-primary">
            {baselinePhase.meanPressure.toExponential(2)} mbar
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-text-secondary">
            {t('rateOfRise.results.baselineDuration', 'Baseline-Dauer')}
          </span>
          <span className="text-text-primary">{formatDuration(baselinePhase.duration)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-text-secondary">
            {t('rateOfRise.results.riseDuration', 'Anstiegs-Dauer')}
          </span>
          <span className="text-text-primary">{formatDuration(risePhase.duration)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-text-secondary">
            {t('rateOfRise.results.dataPoints', 'Datenpunkte (Fit)')}
          </span>
          <span className="text-text-primary">{linearFit.dataPoints}</span>
        </div>
      </div>
    </div>
  )
}
