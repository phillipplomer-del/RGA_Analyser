import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/useAppStore'
import type { MeasurementFile, AnalysisResult, ComparisonResult } from '@/types/rga'
import { AIPanel } from '@/components/AIPanel'
import { ExportPanel } from '@/components/ExportPanel'
import { LimitsPanel } from '@/components/LimitsPanel'

interface ActionsSidebarProps {
  files: MeasurementFile[]
  analysis: AnalysisResult
  chartRef: React.RefObject<HTMLDivElement | null>
  comparisonData?: {
    beforeAnalysis: AnalysisResult
    afterAnalysis: AnalysisResult
    comparisonResult: ComparisonResult
  }
}

type PanelType = 'limits' | 'ai' | 'export'

const PANEL_ICONS: Record<PanelType, React.ReactNode> = {
  limits: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  ai: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  export: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
}

export function ActionsSidebar({ files, analysis, chartRef, comparisonData }: ActionsSidebarProps) {
  const { t } = useTranslation()
  const { sidebarActivePanel, setSidebarActivePanel, setShowKnowledgePage } = useAppStore()

  const isExpanded = sidebarActivePanel !== null

  const handlePanelClick = (panel: PanelType) => {
    if (sidebarActivePanel === panel) {
      setSidebarActivePanel(null)
    } else {
      setSidebarActivePanel(panel)
    }
  }

  const panels: { key: PanelType; label: string }[] = [
    { key: 'limits', label: t('sidebar.limits', 'Limits') },
    { key: 'ai', label: t('sidebar.ai', 'AI') },
    { key: 'export', label: t('sidebar.export', 'Export') },
  ]

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-surface-card shadow-card-lg border-r border-subtle
        flex transition-all duration-300 ease-in-out z-40
        ${isExpanded ? 'w-[480px]' : 'w-16'}`}
    >
      {/* Icon Bar */}
      <div className="w-16 flex-shrink-0 flex flex-col items-center py-4 gap-2 border-r border-subtle bg-surface-card-muted">
        {/* Spacer for header */}
        <div className="h-16" />

        {panels.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handlePanelClick(key)}
            className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors
              ${sidebarActivePanel === key
                ? 'bg-aqua-500 text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-card'
              }`}
            title={label}
          >
            {PANEL_ICONS[key]}
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Divider */}
        <div className="w-8 h-px bg-border-subtle my-2" />

        {/* Knowledge Base Button */}
        <button
          onClick={() => setShowKnowledgePage(true)}
          className="w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors
            text-text-secondary hover:text-text-primary hover:bg-surface-card"
          title={t('sidebar.knowledge', 'Knowledge')}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-[10px] font-medium">{t('sidebar.knowledge', 'Wissen')}</span>
        </button>

        {/* Bottom padding */}
        <div className="h-4" />
      </div>

      {/* Expanded Panel Content */}
      {isExpanded && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Panel Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-subtle bg-surface-card">
            <h2 className="font-semibold text-text-primary">
              {sidebarActivePanel === 'limits' && t('sidebar.limitsTitle', 'Limit Profiles')}
              {sidebarActivePanel === 'ai' && t('sidebar.aiTitle', 'AI Analysis')}
              {sidebarActivePanel === 'export' && t('sidebar.exportTitle', 'Export')}
            </h2>
            <button
              onClick={() => setSidebarActivePanel(null)}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-card-muted rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto">
            {sidebarActivePanel === 'limits' && (
              <LimitsPanel files={files} />
            )}
            {sidebarActivePanel === 'ai' && (
              <div className="p-4">
                <AIPanel
                  analysis={analysis}
                  comparisonData={comparisonData}
                  compact
                />
              </div>
            )}
            {sidebarActivePanel === 'export' && (
              <div className="p-4">
                <ExportPanel
                  analysis={analysis}
                  chartRef={chartRef}
                  compact
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
