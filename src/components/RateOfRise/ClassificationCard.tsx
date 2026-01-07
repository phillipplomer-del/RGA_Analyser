/**
 * Classification Card Component
 * Displays leak type classification with evidence and recommendations
 */

import type { RoRClassification } from '@/types/rateOfRise'
import { useTranslation } from 'react-i18next'

interface ClassificationCardProps {
  classification: RoRClassification
  isGerman: boolean
}

const TYPE_CONFIG = {
  real_leak: {
    icon: '🕳️',
    labelDe: 'Reales Leck',
    labelEn: 'Real Leak',
    color: 'text-coral-500',
    bgColor: 'bg-coral-500/10',
  },
  virtual_leak: {
    icon: '📦',
    labelDe: 'Virtuelles Leck',
    labelEn: 'Virtual Leak',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  outgassing: {
    icon: '💨',
    labelDe: 'Ausgasung',
    labelEn: 'Outgassing',
    color: 'text-aqua-500',
    bgColor: 'bg-aqua-500/10',
  },
  mixed: {
    icon: '🔀',
    labelDe: 'Mischform',
    labelEn: 'Mixed',
    color: 'text-text-secondary',
    bgColor: 'bg-surface-card-muted',
  },
  unknown: {
    icon: '❓',
    labelDe: 'Unklar',
    labelEn: 'Unknown',
    color: 'text-text-muted',
    bgColor: 'bg-surface-card-muted',
  },
}

export function ClassificationCard({ classification, isGerman }: ClassificationCardProps) {
  const { t } = useTranslation()
  const config = TYPE_CONFIG[classification.type]

  const description = isGerman ? classification.description : classification.descriptionEn
  const evidence = isGerman ? classification.evidence : classification.evidenceEn
  const recommendations = isGerman
    ? classification.recommendations
    : classification.recommendationsEn

  return (
    <div className="bg-surface-card rounded-card shadow-card p-4">
      <h3 className="text-micro font-semibold text-text-muted uppercase tracking-wider mb-3">
        {t('rateOfRise.classification.title', 'Klassifikation')}
      </h3>

      {/* Type Badge */}
      <div className={`${config.bgColor} rounded-xl p-4 mb-4`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <div className={`text-lg font-semibold ${config.color}`}>
              {isGerman ? config.labelDe : config.labelEn}
            </div>
            <div className="text-caption text-text-secondary">
              {t('rateOfRise.classification.confidence', 'Konfidenz')}:{' '}
              {(classification.confidence * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-caption text-text-secondary mb-4">{description}</p>

      {/* Evidence */}
      {evidence.length > 0 && (
        <div className="mb-4">
          <div className="text-micro font-semibold text-text-muted mb-2">
            {t('rateOfRise.classification.evidence', 'EVIDENZ')}
          </div>
          <ul className="text-micro text-text-secondary space-y-1">
            {evidence.map((e, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-aqua-500">•</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <div className="text-micro font-semibold text-text-muted mb-2">
            {t('rateOfRise.classification.recommendations', 'EMPFEHLUNGEN')}
          </div>
          <ul className="text-micro text-text-secondary space-y-1">
            {recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-mint-500">→</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
