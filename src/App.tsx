import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/useAppStore'
import { LandingPage } from '@/components/LandingPage'
import { FileManager } from '@/components/FileManager'
import { MetadataPanel } from '@/components/MetadataPanel'
import { SpectrumChart } from '@/components/SpectrumChart'
import { PeakTable } from '@/components/PeakTable'
import { QualityChecks } from '@/components/QualityChecks'
import { DiagnosisPanel } from '@/components/DiagnosisPanel'
import { LanguageToggle } from '@/components/LanguageToggle'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ComparisonPanel } from '@/components/ComparisonPanel'
import { PeakComparisonTable } from '@/components/PeakComparisonTable'
import { ActionsSidebar } from '@/components/ActionsSidebar'
import { KnowledgePage } from '@/components/KnowledgePage'
import { SimpleLoginModal } from '@/components/Auth/SimpleLoginModal'
import { UserBadge } from '@/components/Auth/UserBadge'
import { compareSpectra } from '@/lib/comparison'

function App() {
  const { t } = useTranslation()
  const {
    files,
    theme,
    reset,
    comparisonResult,
    setComparisonResult,
    showKnowledgePage,
    currentUser,
    showLoginModal,
    setShowLoginModal,
  } = useAppStore()
  const chartRef = useRef<HTMLDivElement>(null)

  // Auto-run comparison when 2+ files are loaded
  useEffect(() => {
    if (files.length >= 2) {
      // Compare first (oldest) and last (newest) files
      const result = compareSpectra(files[0], files[files.length - 1])
      setComparisonResult(result)
    } else {
      setComparisonResult(null)
    }
  }, [files, setComparisonResult])

  // Show Knowledge Page when requested
  if (showKnowledgePage) {
    return <KnowledgePage />
  }

  // Show Landing Page when no files
  if (files.length === 0) {
    return <LandingPage />
  }

  // Get the primary analysis (first file for single, comparison uses all)
  const primaryAnalysis = files[0].analysisResult
  const hasComparison = files.length >= 2 && comparisonResult

  return (
    <div className={`min-h-screen bg-surface-page ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-surface-card shadow-card sticky top-0 z-50 ml-16">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-h1 gradient-text">
              {t('app.title')}
            </h1>
            <p className="text-caption text-text-secondary">
              {t('app.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* File Manager - shows loaded files */}
            <FileManager />

            <div className="flex items-center gap-2">
              {currentUser ? (
                <UserBadge />
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2 text-caption font-medium text-aqua-600 hover:text-aqua-500
                    bg-aqua-500/10 hover:bg-aqua-500/20 rounded-chip transition-colors"
                >
                  {t('auth.title')}
                </button>
              )}
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-5 ml-16">
        {/* Metadata - Grid based on file count */}
        <div className={`grid gap-5 ${
          files.length === 1 ? 'grid-cols-1' :
          files.length === 2 ? 'grid-cols-1 lg:grid-cols-2' :
          'grid-cols-1 lg:grid-cols-3'
        }`}>
          {files.map((file, index) => (
            <MetadataPanel
              key={file.id}
              metadata={file.analysisResult.metadata}
              title={files.length > 1 ? `${t('metadata.title')} (${index + 1})` : undefined}
            />
          ))}
        </div>

        {/* Spectrum Chart - shows all files */}
        <div ref={chartRef}>
          <SpectrumChart
            files={files}
            limitChecks={primaryAnalysis.limitChecks}
          />
        </div>

        {/* Comparison Section - only when 2+ files */}
        {hasComparison && (
          <>
            <ComparisonPanel result={comparisonResult} />
            <PeakComparisonTable comparisons={comparisonResult.peakComparisons} />
          </>
        )}

        {/* Peak Tables - Grid based on file count */}
        <div className={`grid gap-5 ${
          files.length === 1 ? 'grid-cols-1 lg:grid-cols-2' :
          files.length === 2 ? 'grid-cols-1 lg:grid-cols-2' :
          'grid-cols-1 lg:grid-cols-3'
        }`}>
          {files.length === 1 ? (
            <>
              <PeakTable peaks={files[0].analysisResult.peaks} />
              <QualityChecks checks={files[0].analysisResult.qualityChecks} />
            </>
          ) : (
            files.map((file, index) => (
              <PeakTable
                key={file.id}
                peaks={file.analysisResult.peaks}
                title={`${t('peaks.title')} (${index + 1})`}
              />
            ))
          )}
        </div>

        {/* Quality Checks - Grid when multiple files */}
        {files.length > 1 && (
          <div className={`grid gap-5 ${
            files.length === 2 ? 'grid-cols-1 lg:grid-cols-2' :
            'grid-cols-1 lg:grid-cols-3'
          }`}>
            {files.map((file, index) => (
              <QualityChecks
                key={file.id}
                checks={file.analysisResult.qualityChecks}
                title={`${t('quality.title')} (${index + 1})`}
              />
            ))}
          </div>
        )}

        {/* Automatic Diagnosis - shows for primary file */}
        {primaryAnalysis.diagnostics && primaryAnalysis.diagnosisSummary && (
          <DiagnosisPanel
            diagnostics={primaryAnalysis.diagnostics}
            summary={primaryAnalysis.diagnosisSummary}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-surface-card border-t border-subtle py-3 mt-8 ml-16">
        <div className="max-w-7xl mx-auto px-6 text-center text-caption text-text-muted flex items-center justify-center gap-4">
          <span>Spectrum v1.0.0 &middot; Aqua Design System</span>
          <a
            href="https://paypal.me/PhillipPlomer/1EUR"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-aqua-500 hover:text-aqua-400 transition-colors"
          >
            Buy me a coffee
          </a>
        </div>
      </footer>

      {/* Actions Sidebar */}
      <ActionsSidebar
        files={files}
        analysis={primaryAnalysis}
        chartRef={chartRef}
        comparisonData={hasComparison ? {
          beforeAnalysis: files[0].analysisResult,
          afterAnalysis: files[files.length - 1].analysisResult,
          comparisonResult: comparisonResult
        } : undefined}
      />

      {/* Login Modal */}
      {showLoginModal && (
        <SimpleLoginModal
          onClose={() => setShowLoginModal(false)}
          isOptional={true}
        />
      )}
    </div>
  )
}

export default App
