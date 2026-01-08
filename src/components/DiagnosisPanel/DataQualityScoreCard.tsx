/**
 * DataQualityScoreCard Component
 *
 * Zeigt den Datenqualitäts-Score mit allen Faktoren an
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { DataQualityScore, QualityFactor } from '@/lib/diagnosis/confidenceScore'
import { getGradeColor, getStatusColor } from '@/lib/diagnosis/confidenceScore'
import { cn } from '@/lib/utils/cn'

interface DataQualityScoreCardProps {
  score: DataQualityScore
}

export function DataQualityScoreCard({ score }: DataQualityScoreCardProps) {
  const { i18n } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const isGerman = i18n.language === 'de'

  const gradeColor = getGradeColor(score.grade)

  const getReliabilityText = (reliability: DataQualityScore['diagnosisReliability']) => {
    const texts = {
      high: { de: 'Hoch', en: 'High' },
      medium: { de: 'Mittel', en: 'Medium' },
      low: { de: 'Niedrig', en: 'Low' },
      very_low: { de: 'Sehr niedrig', en: 'Very low' }
    }
    return isGerman ? texts[reliability].de : texts[reliability].en
  }

  const getReliabilityColor = (reliability: DataQualityScore['diagnosisReliability']) => {
    switch (reliability) {
      case 'high': return 'text-state-success'
      case 'medium': return 'text-state-warning'
      case 'low': return 'text-amber-500'
      case 'very_low': return 'text-state-danger'
    }
  }

  return (
    <div className="mb-4 px-4">
      <div className="bg-bg-secondary rounded-chip border border-border-subtle overflow-hidden">
        {/* Header - Always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          {/* Grade Badge */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: gradeColor }}
          >
            {score.grade}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-body font-medium text-text-primary">
                {isGerman ? 'Datenqualität' : 'Data Quality'}
              </p>
              <span className="text-caption text-text-muted">
                {(score.overallScore * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-caption text-text-muted truncate">
              {isGerman ? score.gradeDescription : score.gradeDescriptionEn}
            </p>
          </div>

          {/* Reliability indicator */}
          <div className="text-right flex-shrink-0">
            <p className={cn('text-caption font-medium', getReliabilityColor(score.diagnosisReliability))}>
              {getReliabilityText(score.diagnosisReliability)}
            </p>
            <p className="text-micro text-text-muted">
              {isGerman ? 'Diagnose-Zuverlässigkeit' : 'Diagnosis Reliability'}
            </p>
          </div>

          {/* Expand indicator */}
          <span className={cn(
            'text-text-muted transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}>
            ▼
          </span>
        </button>

        {/* Expanded content */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-2 border-t border-border-subtle">
            {/* Quality Factors */}
            <div className="space-y-2 mb-4">
              <p className="text-caption font-medium text-text-secondary mb-2">
                {isGerman ? 'Qualitätsfaktoren:' : 'Quality Factors:'}
              </p>
              {score.factors.map((factor) => (
                <QualityFactorRow key={factor.id} factor={factor} isGerman={isGerman} />
              ))}
            </div>

            {/* Improvements */}
            {score.improvements.length > 0 && (
              <div>
                <p className="text-caption font-medium text-text-secondary mb-2">
                  {isGerman ? 'Verbesserungsvorschläge:' : 'Improvement Suggestions:'}
                </p>
                <ul className="space-y-1">
                  {(isGerman ? score.improvements : score.improvementsEn).map((improvement, idx) => (
                    <li key={idx} className="text-caption text-text-muted flex items-start gap-2">
                      <span className="text-state-warning">•</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Critical issues warning */}
            {score.criticalIssues > 0 && (
              <div className="mt-3 p-2 bg-state-danger/10 rounded-chip border border-state-danger/30">
                <p className="text-caption text-state-danger">
                  {isGerman
                    ? `${score.criticalIssues} kritische${score.criticalIssues > 1 ? '' : 's'} Problem${score.criticalIssues > 1 ? 'e' : ''} erkannt`
                    : `${score.criticalIssues} critical issue${score.criticalIssues > 1 ? 's' : ''} detected`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Single quality factor row with expandable details
 */
function QualityFactorRow({ factor, isGerman }: { factor: QualityFactor; isGerman: boolean }) {
  const [showDetails, setShowDetails] = useState(false)
  const statusColor = getStatusColor(factor.status)
  const description = isGerman ? factor.description : factor.descriptionEn
  const recommendation = isGerman ? factor.recommendation : factor.recommendationEn

  // Show details button only if there's a description or if score is below 80%
  const hasDetails = description || factor.score < 0.8

  return (
    <div className="space-y-1">
      <button
        onClick={() => hasDetails && setShowDetails(!showDetails)}
        disabled={!hasDetails}
        className={cn(
          "w-full flex items-center gap-3",
          hasDetails && "cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded-chip px-1 -mx-1"
        )}
      >
        {/* Progress bar */}
        <div className="flex-1 h-2 bg-bg-primary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${factor.score * 100}%`,
              backgroundColor: statusColor
            }}
          />
        </div>

        {/* Label */}
        <div className="w-32 flex-shrink-0 flex items-center gap-1">
          <p className="text-micro text-text-secondary truncate">
            {isGerman ? factor.name : factor.nameEn}
          </p>
          {hasDetails && (
            <span className={cn(
              "text-micro text-text-muted transition-transform duration-200",
              showDetails && "rotate-180"
            )}>
              ▾
            </span>
          )}
        </div>

        {/* Score */}
        <div className="w-12 text-right">
          <span
            className="text-micro font-medium"
            style={{ color: statusColor }}
          >
            {(factor.score * 100).toFixed(0)}%
          </span>
        </div>
      </button>

      {/* Expanded details */}
      {showDetails && hasDetails && (
        <div className="ml-2 pl-3 border-l-2 border-border-subtle space-y-1">
          {/* Description - explains WHY the score is what it is */}
          {description && (
            <p className="text-micro text-text-muted">
              {description}
            </p>
          )}

          {/* Recommendation - shows how to improve (only for poor scores) */}
          {recommendation && factor.score < 0.7 && (
            <p className="text-micro text-state-warning flex items-start gap-1">
              <span>💡</span>
              <span>{recommendation}</span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
