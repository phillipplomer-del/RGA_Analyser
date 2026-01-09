import { useRef, useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useDropzone } from 'react-dropzone'
import { useAppStore } from '@/store/useAppStore'
import { LandingPage } from '@/components/LandingPage'
import { FunctionSelector } from '@/components/FunctionSelector'
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
import { RateOfRisePage } from '@/components/RateOfRise'
import { OutgassingPage } from '@/components/OutgassingSimulator/OutgassingPage'
import { SimpleLoginModal } from '@/components/Auth/SimpleLoginModal'
import { UserBadge } from '@/components/Auth/UserBadge'
import { SpectrumArchive } from '@/components/SpectrumArchive'
import { Footer } from '@/components/ui/Footer'
import { LeakSearchDemo } from '@/components/LeakSearchDemo'
import { compareSpectra } from '@/lib/comparison'
import { parseASCFile } from '@/lib/parser'
import { analyzeSpectrum } from '@/lib/analysis'
import { isDevMode } from '@/lib/featureFlags'
import type { MeasurementFile } from '@/types/rga'

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
    skipLandingPage,
    addFile,
    initializeAuth,
  } = useAppStore()
  const devMode = isDevMode()
  const chartRef = useRef<HTMLDivElement>(null)
  const [showArchive, setShowArchive] = useState(false)
  const [showRateOfRise, setShowRateOfRise] = useState(false)
  const [showOutgassing, setShowOutgassing] = useState(false)
  const [showLeakSearch, setShowLeakSearch] = useState(false)
  const [showRGASection, setShowRGASection] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Initialize auth and load cloud data on app startup
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  // File drop handler for empty state
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    if (acceptedFiles.length > 3) {
      setUploadError(t('upload.maxThreeFiles', 'Maximal 3 Dateien erlaubt'))
      return
    }

    setIsProcessing(true)
    setUploadError(null)

    try {
      for (const file of acceptedFiles) {
        const content = await file.text()
        const rawData = parseASCFile(content)
        const analysisResult = analyzeSpectrum(rawData)

        const measurementFile: MeasurementFile = {
          id: crypto.randomUUID(),
          order: 0,
          filename: file.name,
          rawData,
          analysisResult,
          uploadedAt: new Date(),
        }

        addFile(measurementFile)
      }
    } catch (err) {
      if (err instanceof Error) {
        setUploadError(err.message)
      } else {
        setUploadError(t('upload.error'))
      }
    } finally {
      setIsProcessing(false)
    }
  }, [addFile, t])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.asc'] },
    multiple: true,
    maxFiles: 3,
  })

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

  // Show Leak Search Demo when requested or hash route is used (for quick access during pitch)
  if (showLeakSearch || window.location.hash === '#leaksearch-demo') {
    return <LeakSearchDemo onBack={() => {
      setShowLeakSearch(false)
      setShowRGASection(false)
      window.location.hash = ''
    }} />
  }

  // Show Knowledge Page when requested
  if (showKnowledgePage) {
    return <KnowledgePage
      onShowRateOfRise={() => setShowRateOfRise(true)}
      onShowOutgassing={() => {
        useAppStore.getState().setShowKnowledgePage(false)
        setShowOutgassing(true)
      }}
    />
  }

  // Show Rate of Rise Page when requested
  if (showRateOfRise) {
    return <RateOfRisePage
      onBack={() => {
        setShowRateOfRise(false)
        setShowRGASection(false)
      }}
      onOpenOutgassingSimulator={() => {
        setShowRateOfRise(false)
        setShowOutgassing(true)
      }}
    />
  }

  // Show Outgassing Page when requested
  if (showOutgassing) {
    return <OutgassingPage onBack={() => {
      setShowOutgassing(false)
      setShowRGASection(false)
    }} />
  }

  // Show Landing Page when no files and not skipped
  if (files.length === 0 && !skipLandingPage) {
    return <LandingPage />
  }

  // Show Function Selector when app is launched but no function selected yet
  if (skipLandingPage && !showRGASection && files.length === 0 && !showOutgassing) {
    return (
      <FunctionSelector
        onSelectRGA={() => setShowRGASection(true)}
        onSelectRoR={() => setShowRateOfRise(true)}
        onSelectKnowledge={() => useAppStore.getState().setShowKnowledgePage(true)}
        onSelectOutgassing={() => setShowOutgassing(true)}
        onSelectLeakSearch={() => setShowLeakSearch(true)}
      />
    )
  }

  // Empty state - RGA section selected but no files loaded
  if (files.length === 0 && showRGASection) {
    return (
      <div className={`min-h-screen bg-surface-page flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
        {/* Header */}
        <header className="bg-surface-card shadow-card sticky top-0 z-50 ml-16">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Back Button */}
              <button
                onClick={() => setShowRGASection(false)}
                className="p-2 rounded-lg hover:bg-surface-card-muted transition-colors"
                title={t('common.back', 'Zurück')}
              >
                <svg
                  className="w-5 h-5 text-text-secondary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <div>
                <h1 className="font-display font-bold text-h2 gradient-text">
                  {t('app.title')}
                </h1>
                <p className="text-caption text-text-secondary">
                  {t('app.subtitle')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {devMode && (currentUser ? (
                <UserBadge />
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2 text-caption font-medium text-aqua-600 hover:text-aqua-500
                    bg-aqua-500/10 hover:bg-aqua-500/20 rounded-chip transition-colors"
                >
                  {t('auth.title')}
                </button>
              ))}
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Empty State Content */}
        <main className="flex-1 ml-16 px-6 py-6">
          <div className="max-w-4xl mx-auto py-10">
            <div className="text-center mb-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-aqua-500 to-mint-500 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="font-display font-bold text-2xl text-text-primary mb-2">
              {t('empty.title', 'Kein Spektrum geladen')}
            </h2>
            <p className="text-text-secondary max-w-md mx-auto">
              {t('empty.description', 'Laden Sie eine ASC-Datei hoch oder öffnen Sie ein gespeichertes Spektrum aus dem Cloud-Archiv.')}
            </p>
          </div>

          <div className={`grid gap-6 ${devMode ? 'md:grid-cols-2' : 'grid-cols-1 max-w-md mx-auto'}`}>
            {/* Upload Card */}
            <div
              {...getRootProps()}
              className={`p-8 rounded-card border-2 border-dashed cursor-pointer transition-all
                ${isDragActive
                  ? 'border-aqua-500 bg-aqua-500/10'
                  : 'border-subtle hover:border-aqua-500/50 bg-surface-card hover:bg-surface-card-muted'
                }
                ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <input {...getInputProps()} />
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-aqua-500/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-aqua-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="font-display font-semibold text-lg text-text-primary mb-1">
                  {isProcessing ? t('upload.processing') : t('upload.dropzone')}
                </h3>
                <p className="text-caption text-text-muted">
                  {t('upload.formats')}
                </p>
                {uploadError && (
                  <p className="mt-2 text-caption text-coral-500">{uploadError}</p>
                )}
              </div>
            </div>

            {/* Archive Card - Dev Mode only */}
            {devMode && (
              <button
                onClick={() => {
                  if (!currentUser) {
                    setShowLoginModal(true)
                  } else {
                    setShowArchive(true)
                  }
                }}
                className="p-8 rounded-card border border-subtle bg-surface-card hover:bg-surface-card-muted
                  transition-all text-left group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-mint-500/10 flex items-center justify-center
                    group-hover:bg-mint-500/20 transition-colors">
                    <svg className="w-6 h-6 text-mint-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <h3 className="font-display font-semibold text-lg text-text-primary mb-1">
                    {t('cloud.archive')}
                  </h3>
                  <p className="text-caption text-text-muted">
                    {currentUser
                      ? t('empty.archiveDesc', 'Gespeicherte Spektren laden')
                      : t('empty.loginRequired', 'Anmeldung erforderlich')}
                  </p>
                </div>
              </button>
            )}
          </div>
          </div>
        </main>

        {/* Login Modal */}
        {showLoginModal && (
          <SimpleLoginModal
            onClose={() => setShowLoginModal(false)}
            isOptional={true}
          />
        )}

        {/* Archive Modal */}
        {showArchive && (
          <SpectrumArchive onClose={() => setShowArchive(false)} />
        )}

        {/* Footer */}
        <Footer className="ml-16" />

        {/* Navigation Sidebar - minimal mode */}
        <ActionsSidebar
          minimal
          onShowRateOfRise={() => setShowRateOfRise(true)}
        />
      </div>
    )
  }

  // Get the primary analysis (first file for single, comparison uses all)
  const primaryAnalysis = files[0].analysisResult
  const hasComparison = files.length >= 2 && comparisonResult

  return (
    <div className={`min-h-screen bg-surface-page ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-surface-card shadow-card sticky top-0 z-50 ml-16">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <button
              onClick={reset}
              className="p-2 rounded-lg hover:bg-surface-card-muted transition-colors"
              title={t('common.back', 'Zurück')}
            >
              <svg
                className="w-5 h-5 text-text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <div>
              <h1 className="font-display font-bold text-h2 gradient-text">
                {t('app.title')}
              </h1>
              <p className="text-caption text-text-secondary">
                {t('app.subtitle')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* File Manager - shows loaded files */}
            <FileManager />

            <div className="flex items-center gap-2">
              {devMode && (currentUser ? (
                <UserBadge />
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2 text-caption font-medium text-aqua-600 hover:text-aqua-500
                    bg-aqua-500/10 hover:bg-aqua-500/20 rounded-chip transition-colors"
                >
                  {t('auth.title')}
                </button>
              ))}
              <button
                onClick={() => {
                  reset()
                  setShowRGASection(false)
                }}
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
            dataQualityScore={primaryAnalysis.dataQualityScore}
          />
        )}

      </main>

      {/* Footer */}
      <Footer className="mt-8 ml-16" />

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
        onShowRateOfRise={() => setShowRateOfRise(true)}
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
