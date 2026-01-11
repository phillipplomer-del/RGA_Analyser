/**
 * Significance Badge for Evidence Items
 *
 * Feature 1.9.2: Shows LOD-based significance for peak evidence
 */

import { useTranslation } from 'react-i18next'
import type { LODResult } from '@/lib/diagnosis'
import { checkPeakSignificance } from '@/lib/diagnosis'
import { cn } from '@/lib/utils/cn'

interface SignificanceBadgeProps {
  /** Peak value (normalized) */
  peakValue: number
  /** LOD calculation result */
  lodResult: LODResult
  /** Compact display (just icon + factor) */
  compact?: boolean
}

export function SignificanceBadge({ peakValue, lodResult, compact = false }: SignificanceBadgeProps) {
  const { i18n } = useTranslation()
  const isGerman = i18n.language === 'de'

  const significance = checkPeakSignificance(peakValue, lodResult)

  // Color mapping
  const colorClasses = {
    very_high: 'bg-mint-500/20 text-mint-700 dark:text-mint-400 border-mint-500/30',
    high: 'bg-mint-500/15 text-mint-600 dark:text-mint-500 border-mint-500/20',
    medium: 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30',
    low: 'bg-coral-500/20 text-coral-700 dark:text-coral-400 border-coral-500/30',
    noise: 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30'
  }

  const icons = {
    very_high: '✅',
    high: '✓',
    medium: '⚠️',
    low: '⚠️',
    noise: '❌'
  }

  // Praktiker-freundliche Tooltips
  const getTooltip = () => {
    const factor = significance.factor.toFixed(1)

    if (isGerman) {
      if (significance.confidence === 'very_high') {
        return `Sehr starkes Signal: ${factor}× stärker als das Rauschen. Definitiv echt! ✅`
      } else if (significance.confidence === 'high') {
        return `Starkes Signal: ${factor}× stärker als das Rauschen. Sehr wahrscheinlich echt. ✓`
      } else if (significance.confidence === 'medium') {
        return `Mittleres Signal: ${factor}× stärker als das Rauschen. Wahrscheinlich echt, aber nicht ganz sicher. ⚠️`
      } else if (significance.confidence === 'low') {
        return `Schwaches Signal: Nur ${factor}× über dem Rauschen. Könnte echt sein, aber unsicher. ⚠️`
      } else {
        return `Zu schwach: Nicht stärker als das Grundrauschen. Vermutlich kein echtes Signal. ❌`
      }
    } else {
      if (significance.confidence === 'very_high') {
        return `Very strong signal: ${factor}× stronger than noise. Definitely real! ✅`
      } else if (significance.confidence === 'high') {
        return `Strong signal: ${factor}× stronger than noise. Very likely real. ✓`
      } else if (significance.confidence === 'medium') {
        return `Medium signal: ${factor}× stronger than noise. Probably real, but not entirely certain. ⚠️`
      } else if (significance.confidence === 'low') {
        return `Weak signal: Only ${factor}× above noise. Could be real, but uncertain. ⚠️`
      } else {
        return `Too weak: Not stronger than background noise. Probably not a real signal. ❌`
      }
    }
  }

  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-micro font-medium border cursor-help',
          colorClasses[significance.confidence]
        )}
        title={getTooltip()}
      >
        <span>{icons[significance.confidence]}</span>
        <span>{significance.factor.toFixed(1)}×</span>
      </span>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-2 py-1 rounded-lg text-caption font-medium border',
        colorClasses[significance.confidence]
      )}
    >
      <span className="text-base">{icons[significance.confidence]}</span>
      <div className="flex flex-col">
        <span className="font-mono font-semibold">
          {significance.factor.toFixed(1)}× LOD
        </span>
        <span className="text-micro opacity-75">
          {isGerman ? significance.label : significance.label}
        </span>
      </div>
    </div>
  )
}

/**
 * Mini inline badge for tight spaces
 */
export function SignificanceIcon({ peakValue, lodResult }: { peakValue: number; lodResult: LODResult }) {
  const significance = checkPeakSignificance(peakValue, lodResult)

  const icons = {
    very_high: '✅',
    high: '✓',
    medium: '⚠️',
    low: '⚠️',
    noise: '❌'
  }

  const colors = {
    very_high: 'text-mint-500',
    high: 'text-mint-500',
    medium: 'text-amber-500',
    low: 'text-coral-500',
    noise: 'text-gray-500'
  }

  const getTooltip = () => {
    const factor = significance.factor.toFixed(1)
    if (significance.confidence === 'very_high') {
      return `Sehr starkes Signal (${factor}× über Rauschen) - definitiv echt!`
    } else if (significance.confidence === 'high') {
      return `Starkes Signal (${factor}× über Rauschen) - sehr wahrscheinlich echt`
    } else if (significance.confidence === 'medium') {
      return `Mittleres Signal (${factor}× über Rauschen) - wahrscheinlich echt`
    } else if (significance.confidence === 'low') {
      return `Schwaches Signal (${factor}× über Rauschen) - unsicher`
    } else {
      return `Zu schwach (${factor}× über Rauschen) - vermutlich nur Rauschen`
    }
  }

  return (
    <span className={cn('text-base cursor-help', colors[significance.confidence])} title={getTooltip()}>
      {icons[significance.confidence]}
    </span>
  )
}
