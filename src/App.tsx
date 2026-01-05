import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/useAppStore'
import { FileUpload } from '@/components/FileUpload'
import { MetadataPanel } from '@/components/MetadataPanel'
import { SpectrumChart } from '@/components/SpectrumChart'
import { PeakTable } from '@/components/PeakTable'
import { QualityChecks } from '@/components/QualityChecks'
import { ExportPanel } from '@/components/ExportPanel'
import { LanguageToggle } from '@/components/LanguageToggle'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

function App() {
  const { t } = useTranslation()
  const { analysisResult, theme } = useAppStore()

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
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-7">
        {/* File Upload */}
        <FileUpload />

        {analysisResult && (
          <>
            {/* Metadata */}
            <MetadataPanel metadata={analysisResult.metadata} />

            {/* Spectrum Chart */}
            <SpectrumChart
              data={analysisResult.normalizedData}
              limitChecks={analysisResult.limitChecks}
            />

            {/* Results Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PeakTable peaks={analysisResult.peaks} />
              <QualityChecks checks={analysisResult.qualityChecks} />
            </div>

            {/* Export */}
            <ExportPanel analysis={analysisResult} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-surface-card border-t border-subtle py-4 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-caption text-text-muted">
          RGA Analyser v1.0.0 &middot; Aqua Design System
        </div>
      </footer>
    </div>
  )
}

export default App
