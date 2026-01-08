/**
 * Outgassing Comparison Card
 * Shows comparison between measured dp/dt and expected outgassing
 */

import { useTranslation } from 'react-i18next'
import { useOutgassingStore, compareWithMeasuredRise } from '@/store/useOutgassingStore'
import { formatScientific } from '@/lib/knowledge/outgassingRates'
import type { RateOfRiseAnalysis } from '@/types/rateOfRise'

interface OutgassingComparisonCardProps {
  analysis: RateOfRiseAnalysis
  onOpenSimulator?: () => void
}

export function OutgassingComparisonCard({ analysis, onOpenSimulator }: OutgassingComparisonCardProps) {
  const { t, i18n } = useTranslation()
  const isGerman = i18n.language === 'de'
  const { results, volume, pumpTime, lastCalculated } = useOutgassingStore()

  // Convert dp/dt from mbar/min to mbar/h for comparison
  const measuredRise_mbarPerHour = analysis.linearFit.slope * 60

  // If no outgassing calculation available, show prompt to use simulator
  if (!results || !lastCalculated) {
    return (
      <div className="bg-surface-card rounded-card shadow-card p-4">
        <h3 className="text-micro font-semibold text-text-muted uppercase tracking-wider mb-3">
          {t('rateOfRise.outgassing.title', 'Ausgasungs-Vergleich')}
        </h3>

        <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-4 text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-violet-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <p className="text-caption text-text-secondary mb-3">
            {isGerman
              ? 'Nutzen Sie den Ausgasungs-Simulator um zu prüfen, ob der gemessene Druckanstieg durch Ausgasung erklärbar ist.'
              : 'Use the outgassing simulator to check if the measured pressure rise can be explained by outgassing.'}
          </p>
          {onOpenSimulator && (
            <button
              onClick={onOpenSimulator}
              className="px-4 py-2 text-caption font-medium text-violet-600 hover:text-violet-500
                bg-violet-500/10 hover:bg-violet-500/20 rounded-chip transition-colors"
            >
              {t('rateOfRise.outgassing.openSimulator', 'Simulator öffnen')}
            </button>
          )}
        </div>
      </div>
    )
  }

  // Calculate comparison
  const expectedOutgassing = results.pressureRise_mbarPerHour
  const comparison = compareWithMeasuredRise(measuredRise_mbarPerHour, expectedOutgassing)

  // Determine color based on interpretation
  const getStatusColor = () => {
    if (comparison.outgassingFraction > 0.9) return 'mint' // Green - no leak
    if (comparison.outgassingFraction > 0.5) return 'amber' // Yellow - uncertain
    return 'coral' // Red - leak likely
  }
  const statusColor = getStatusColor()

  const colorClasses = {
    mint: { bg: 'bg-mint-500/10', text: 'text-mint-500', border: 'border-mint-500/30' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30' },
    coral: { bg: 'bg-coral-500/10', text: 'text-coral-500', border: 'border-coral-500/30' }
  }
  const colors = colorClasses[statusColor]

  return (
    <div className="bg-surface-card rounded-card shadow-card p-4">
      <h3 className="text-micro font-semibold text-text-muted uppercase tracking-wider mb-3">
        {t('rateOfRise.outgassing.title', 'Ausgasungs-Vergleich')}
      </h3>

      {/* Comparison Values */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-caption text-text-secondary">
            {t('rateOfRise.outgassing.measured', 'Gemessen')}
          </span>
          <span className="text-caption font-medium text-text-primary">
            {formatScientific(measuredRise_mbarPerHour, 2)} mbar/h
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-caption text-text-secondary">
            {t('rateOfRise.outgassing.expected', 'Erw. Ausgasung')}
          </span>
          <span className="text-caption font-medium text-violet-500">
            {formatScientific(expectedOutgassing, 2)} mbar/h
          </span>
        </div>
      </div>

      {/* Visual Bar */}
      <div className="mb-4">
        <div className="h-6 rounded-full overflow-hidden bg-surface-card-muted flex">
          <div
            className="h-full bg-violet-500 flex items-center justify-center text-micro font-medium text-white"
            style={{ width: `${Math.max(5, comparison.outgassingFraction * 100)}%` }}
          >
            {comparison.outgassingFraction > 0.15 && `${(comparison.outgassingFraction * 100).toFixed(0)}%`}
          </div>
          {comparison.potentialLeakFraction > 0.05 && (
            <div
              className="h-full bg-coral-500 flex items-center justify-center text-micro font-medium text-white"
              style={{ width: `${comparison.potentialLeakFraction * 100}%` }}
            >
              {comparison.potentialLeakFraction > 0.15 && `${(comparison.potentialLeakFraction * 100).toFixed(0)}%`}
            </div>
          )}
        </div>
        <div className="flex justify-between mt-1 text-micro text-text-muted">
          <span>{t('rateOfRise.outgassing.outgassing', 'Ausgasung')}</span>
          {comparison.potentialLeakFraction > 0.05 && (
            <span>{t('rateOfRise.outgassing.leak', 'Mögliches Leck')}</span>
          )}
        </div>
      </div>

      {/* Interpretation */}
      <div className={`${colors.bg} ${colors.border} border rounded-xl p-3`}>
        <div className={`text-caption font-medium ${colors.text} mb-1`}>
          {comparison.outgassingFraction > 0.9 && (isGerman ? '✓ Kein Leck vermutet' : '✓ No leak suspected')}
          {comparison.outgassingFraction > 0.5 && comparison.outgassingFraction <= 0.9 && (isGerman ? '? Unsicher' : '? Uncertain')}
          {comparison.outgassingFraction <= 0.5 && (isGerman ? '⚠ Leck wahrscheinlich' : '⚠ Leak likely')}
        </div>
        <p className="text-micro text-text-secondary">
          {isGerman ? comparison.interpretation : comparison.interpretationEn}
        </p>
      </div>

      {/* Simulator Info */}
      <div className="mt-3 pt-3 border-t border-subtle">
        <div className="text-micro text-text-muted">
          {isGerman ? 'Simulator-Parameter:' : 'Simulator parameters:'}
          <span className="ml-2 text-text-secondary">
            V = {volume} L, t = {pumpTime} h
          </span>
        </div>
        {onOpenSimulator && (
          <button
            onClick={onOpenSimulator}
            className="mt-2 text-micro text-violet-500 hover:text-violet-400 transition-colors"
          >
            {t('rateOfRise.outgassing.adjustParams', 'Parameter anpassen →')}
          </button>
        )}
      </div>
    </div>
  )
}
