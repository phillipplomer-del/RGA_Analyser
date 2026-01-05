import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/useAppStore'
import { LandingPage } from '@/components/LandingPage'
import { FileUpload } from '@/components/FileUpload'
import { MetadataPanel } from '@/components/MetadataPanel'
import { SpectrumChart } from '@/components/SpectrumChart'
import { PeakTable } from '@/components/PeakTable'
import { QualityChecks } from '@/components/QualityChecks'
import { ExportPanel } from '@/components/ExportPanel'
import { AIPanel } from '@/components/AIPanel'
import { LanguageToggle } from '@/components/LanguageToggle'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

function App() {
  const { t } = useTranslation()
  const { analysisResult, theme, reset } = useAppStore()
  const chartRef = useRef<HTMLDivElement>(null)

  // Show Landing Page when no file loaded
  if (!analysisResult) {
    return <LandingPage />
  }

  // Analysis View
  return (
    <div className={`min-h-screen bg-surface-page ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-surface-card shadow-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-h1 gradient-text">
              {t('app.title')}
            </h1>
            <p className="text-caption text-text-secondary">
              {t('app.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={reset}
              className="px-4 py-2 text-caption font-medium text-text-secondary hover:text-text-primary
                bg-surface-card-muted hover:bg-surface-card rounded-chip transition-colors"
            >
              {t('common.reset')}
            </button>
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        {/* Upload + Metadata Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <FileUpload />
          <MetadataPanel metadata={analysisResult.metadata} />
        </div>

        {/* Spectrum Chart */}
        <div ref={chartRef}>
          <SpectrumChart
            data={analysisResult.normalizedData}
            limitChecks={analysisResult.limitChecks}
          />
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <PeakTable peaks={analysisResult.peaks} />
          <QualityChecks checks={analysisResult.qualityChecks} />
        </div>

        {/* AI Analysis */}
        <AIPanel analysis={analysisResult} />

        {/* Export */}
        <ExportPanel analysis={analysisResult} chartRef={chartRef} />
      </main>

      {/* Footer */}
      <footer className="bg-surface-card border-t border-subtle py-3 mt-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-caption text-text-muted">
          Spectrum v1.0.0 &middot; Aqua Design System
        </div>
      </footer>
    </div>
  )
}

export default App
