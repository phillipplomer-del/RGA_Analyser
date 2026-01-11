import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { DiagnosticResultSummary, DiagnosisSummary } from '@/types/rga'
import type { DataQualityScore } from '@/lib/diagnosis/confidenceScore'
import type { LODResult } from '@/lib/diagnosis'
import { Card, CardHeader } from '@/components/ui/Card'
import { cn } from '@/lib/utils/cn'
import { OutgassingContext } from './OutgassingContext'
import { DataQualityScoreCard } from './DataQualityScoreCard'
import { LODInfoCard } from './LODInfoCard'
import { SignificanceBadge } from './SignificanceBadge'

interface DiagnosisPanelProps {
  diagnostics: DiagnosticResultSummary[]
  summary: DiagnosisSummary
  dataQualityScore?: DataQualityScore
  lodResult?: LODResult
}

export function DiagnosisPanel({ diagnostics, summary, dataQualityScore, lodResult }: DiagnosisPanelProps) {
  const { i18n } = useTranslation()
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const isGerman = i18n.language === 'de'

  const getStatusColor = (status: DiagnosisSummary['overallStatus']) => {
    switch (status) {
      case 'clean':
        return 'bg-state-success/10 text-state-success'
      case 'warning':
        return 'bg-state-warning/10 text-state-warning'
      case 'critical':
        return 'bg-state-danger/10 text-state-danger'
    }
  }

  const getStatusText = (status: DiagnosisSummary['overallStatus']) => {
    switch (status) {
      case 'clean':
        return isGerman ? 'Sauber' : 'Clean'
      case 'warning':
        return isGerman ? 'Warnung' : 'Warning'
      case 'critical':
        return isGerman ? 'Kritisch' : 'Critical'
    }
  }

  const getSystemStateText = (state: DiagnosisSummary['systemState']) => {
    const states: Record<DiagnosisSummary['systemState'], { de: string; en: string }> = {
      baked: { de: 'Ausgeheizt', en: 'Baked' },
      unbaked: { de: 'Nicht ausgeheizt', en: 'Unbaked' },
      contaminated: { de: 'Kontaminiert', en: 'Contaminated' },
      air_leak: { de: 'Luftleck', en: 'Air Leak' },
      unknown: { de: 'Unbekannt', en: 'Unknown' }
    }
    return isGerman ? states[state].de : states[state].en
  }

  const getSeverityColor = (severity: DiagnosticResultSummary['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-state-danger/10 border-state-danger/30'
      case 'warning':
        return 'bg-state-warning/10 border-state-warning/30'
      case 'info':
        return 'bg-state-success/10 border-state-success/30'
    }
  }

  const getSeverityBadgeColor = (severity: DiagnosticResultSummary['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-state-danger text-white'
      case 'warning':
        return 'bg-state-warning text-white'
      case 'info':
        return 'bg-state-success text-white'
    }
  }

  return (
    <Card>
      <CardHeader
        title={isGerman ? 'Automatische Diagnose' : 'Automatic Diagnosis'}
        action={
          <div className="flex items-center gap-2">
            <span className="text-caption text-text-muted">
              {getSystemStateText(summary.systemState)}
            </span>
            <span className={cn('px-3 py-1 rounded-full text-caption font-medium', getStatusColor(summary.overallStatus))}>
              {getStatusText(summary.overallStatus)}
            </span>
          </div>
        }
      />

      {/* Data Quality Score */}
      {dataQualityScore && (
        <DataQualityScoreCard score={dataQualityScore} />
      )}

      {/* LOD Info Card (Feature 1.9.2) */}
      {lodResult && (
        <div className="px-4 pb-3">
          <LODInfoCard lodResult={lodResult} compact />
        </div>
      )}

      {/* Summary Stats */}
      {(summary.criticalCount > 0 || summary.warningCount > 0) && (
        <div className="flex gap-4 mb-4 px-4">
          {summary.criticalCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-state-danger"></span>
              <span className="text-caption text-text-muted">
                {summary.criticalCount} {isGerman ? 'kritisch' : 'critical'}
              </span>
            </div>
          )}
          {summary.warningCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-state-warning"></span>
              <span className="text-caption text-text-muted">
                {summary.warningCount} {isGerman ? 'Warnung(en)' : 'warning(s)'}
              </span>
            </div>
          )}
          {summary.infoCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-state-success"></span>
              <span className="text-caption text-text-muted">
                {summary.infoCount} {isGerman ? 'Info' : 'info'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Outgassing Context - shown when relevant */}
      <OutgassingContext diagnostics={diagnostics} />

      {/* No diagnostics */}
      {diagnostics.length === 0 && (
        <div className="px-4 py-6 text-center text-text-muted">
          <span className="text-3xl mb-2 block">✨</span>
          <p className="text-body">
            {isGerman
              ? 'Keine signifikanten Auffälligkeiten erkannt.'
              : 'No significant issues detected.'}
          </p>
        </div>
      )}

      {/* Diagnostic items */}
      <div className="space-y-3 px-4 pb-4 overflow-hidden">
        {diagnostics.map((diag) => {
          const isExpanded = expandedItem === diag.type
          const name = isGerman ? diag.name : diag.nameEn
          const description = isGerman ? diag.description : diag.descriptionEn
          const recommendation = isGerman ? diag.recommendation : diag.recommendationEn

          return (
            <div
              key={diag.type}
              className={cn(
                'border rounded-chip overflow-hidden transition-all duration-200 max-w-full',
                getSeverityColor(diag.severity)
              )}
            >
              {/* Header - Always visible */}
              <button
                onClick={() => setExpandedItem(isExpanded ? null : diag.type)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                {/* Icon */}
                <span className="text-xl flex-shrink-0">{diag.icon}</span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-body font-medium text-text-primary">{name}</p>
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-micro font-medium',
                      getSeverityBadgeColor(diag.severity)
                    )}>
                      {diag.severity === 'critical' ? (isGerman ? 'Kritisch' : 'Critical') :
                       diag.severity === 'warning' ? (isGerman ? 'Warnung' : 'Warning') :
                       'Info'}
                    </span>
                  </div>
                  <p className="text-caption text-text-muted truncate">{description}</p>
                </div>

                {/* Confidence */}
                <div className="text-right flex-shrink-0">
                  <p className="text-caption font-medium text-text-primary">
                    {(diag.confidence * 100).toFixed(0)}%
                  </p>
                  <p className="text-micro text-text-muted">
                    {isGerman ? 'Konfidenz' : 'Confidence'}
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
                  {/* Recommendation */}
                  <div className="mb-3">
                    <p className="text-caption font-medium text-text-secondary mb-1">
                      {isGerman ? 'Empfehlung:' : 'Recommendation:'}
                    </p>
                    <p className="text-body text-text-primary">{recommendation}</p>
                  </div>

                  {/* Evidence Items (Feature 1.9.2: with LOD significance) */}
                  {diag.evidence && diag.evidence.length > 0 && (
                    <div className="mb-3">
                      <p className="text-caption font-medium text-text-secondary mb-2">
                        {isGerman ? 'Indizien:' : 'Evidence:'}
                      </p>
                      <div className="space-y-1.5">
                        {diag.evidence.map((ev, idx) => {
                          const evDesc = isGerman ? ev.description : ev.descriptionEn
                          const hasValue = ev.value !== undefined && ev.value !== null
                          const canShowSignificance = hasValue && lodResult && ev.value! > 0

                          return (
                            <div
                              key={idx}
                              className="flex items-start gap-2 text-caption text-text-secondary"
                            >
                              <span className={ev.passed ? 'text-mint-500' : 'text-coral-500'}>
                                {ev.passed ? '✓' : '✗'}
                              </span>
                              <span className="flex-1">{evDesc}</span>
                              {canShowSignificance && ev.value !== undefined && (
                                <SignificanceBadge
                                  peakValue={ev.value}
                                  lodResult={lodResult}
                                  compact
                                />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Affected masses */}
                  {diag.affectedMasses.length > 0 && (
                    <div>
                      <p className="text-caption font-medium text-text-secondary mb-1">
                        {isGerman ? 'Betroffene Massen:' : 'Affected masses:'}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {diag.affectedMasses.map(mass => (
                          <span
                            key={mass}
                            className="px-2 py-0.5 bg-bg-secondary rounded text-caption font-mono"
                          >
                            m/z {mass}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
