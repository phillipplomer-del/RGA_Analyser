/**
 * Rate of Rise Main View
 * Full-page view for pressure rise test analysis
 */

import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useDropzone } from 'react-dropzone'
import { useRateOfRiseStore } from '@/store/useRateOfRiseStore'
import { useAppStore } from '@/store/useAppStore'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LanguageToggle } from '@/components/LanguageToggle'
import { UserBadge } from '@/components/Auth/UserBadge'
import { SimpleLoginModal } from '@/components/Auth/SimpleLoginModal'
import { RoRChart } from './RoRChart'
import { MetadataCard } from './MetadataCard'
import { InputsCard } from './InputsCard'
import { ResultsCard } from './ResultsCard'
import { ClassificationCard } from './ClassificationCard'
import { LimitCheckCard } from './LimitCheckCard'
import { OutgassingComparisonCard } from './OutgassingComparisonCard'
import { SaveRoRModal } from './SaveRoRModal'
import { RoRArchive } from './RoRArchive'
import { ActionsSidebar } from '@/components/ActionsSidebar'
import { Footer } from '@/components/ui/Footer'
import { generateRoRPDF, generateRoRCSV, downloadBlob, downloadCSV } from '@/lib/rateOfRise/export'

interface RateOfRisePageProps {
  onBack: () => void
  onOpenOutgassingSimulator?: () => void
}

export function RateOfRisePage({ onBack, onOpenOutgassingSimulator }: RateOfRisePageProps) {
  const { t, i18n } = useTranslation()
  const chartRef = useRef<HTMLDivElement>(null)

  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const {
    data,
    analysis,
    isLoading,
    error,
    loadFile,
    reset,
    chamberVolume,
    leakRateLimit,
    limitSource,
    setVolume,
    setLimit,
    chartScale,
    setChartScale,
    showFitLine,
    setShowFitLine,
    showPhases,
    setShowPhases,
  } = useRateOfRiseStore()

  const { theme, currentUser, showLoginModal, setShowLoginModal } = useAppStore()
  const isGerman = i18n.language === 'de'

  // Export handlers
  const handleExportPDF = async () => {
    if (!data || !analysis) return
    setIsExporting(true)
    try {
      const blob = await generateRoRPDF(data, analysis, {
        language: isGerman ? 'de' : 'en',
        includeDataTable: false,
      })
      const filename = `${data.metadata.filename.replace('.csv', '')}_RoR_Report.pdf`
      downloadBlob(blob, filename)
    } catch (err) {
      console.error('PDF export failed:', err)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportCSV = () => {
    if (!data || !analysis) return
    const csv = generateRoRCSV(data, analysis)
    const filename = `${data.metadata.filename.replace('.csv', '')}_RoR_Data.csv`
    downloadCSV(csv, filename)
  }

  // File drop handler
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return
      await loadFile(acceptedFiles[0])
    },
    [loadFile]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'text/plain': ['.csv'] },
    multiple: false,
  })

  return (
    <div className={`min-h-screen bg-surface-page flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-surface-card shadow-card sticky top-0 z-50 ml-16">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <button
              onClick={onBack}
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
                {t('rateOfRise.title', 'Druckanstiegstest')}
              </h1>
              <p className="text-caption text-text-secondary">
                {t('rateOfRise.subtitle', 'Rate-of-Rise Analyse')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Export Buttons */}
            {data && analysis && (
              <>
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="px-3 py-2 text-caption font-medium text-text-secondary hover:text-text-primary
                    bg-surface-card-muted hover:bg-surface-card rounded-chip transition-colors flex items-center gap-2"
                  title={t('export.pdf')}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  PDF
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-2 text-caption font-medium text-text-secondary hover:text-text-primary
                    bg-surface-card-muted hover:bg-surface-card rounded-chip transition-colors flex items-center gap-2"
                  title={t('export.csv')}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  CSV
                </button>
              </>
            )}

            {/* Cloud Buttons */}
            {currentUser && data && analysis && (
              <button
                onClick={() => setShowSaveModal(true)}
                className="px-3 py-2 text-caption font-medium text-aqua-600 hover:text-aqua-500
                  bg-aqua-500/10 hover:bg-aqua-500/20 rounded-chip transition-colors flex items-center gap-2"
                title={t('cloud.save')}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {t('cloud.save')}
              </button>
            )}

            {currentUser && (
              <button
                onClick={() => setShowArchiveModal(true)}
                className="px-3 py-2 text-caption font-medium text-aqua-600 hover:text-aqua-500
                  bg-aqua-500/10 hover:bg-aqua-500/20 rounded-chip transition-colors flex items-center gap-2"
                title={t('cloud.archive')}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                {t('cloud.archive')}
              </button>
            )}

            {/* Reset Button */}
            {data && (
              <button
                onClick={reset}
                className="px-4 py-2 text-caption font-medium text-text-secondary hover:text-text-primary
                  bg-surface-card-muted hover:bg-surface-card rounded-chip transition-colors"
              >
                {t('common.reset', 'Zurücksetzen')}
              </button>
            )}

            {currentUser ? (
              <UserBadge />
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 text-caption font-medium text-aqua-600 hover:text-aqua-500
                  bg-aqua-500/10 hover:bg-aqua-500/20 rounded-chip transition-colors"
              >
                {t('auth.title', 'Anmelden')}
              </button>
            )}
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 ml-16 px-6 py-6 ${data ? 'max-w-[1800px] mx-auto' : ''}`}>
        {!data ? (
          // Empty State - same layout as RGA
          <div className="max-w-4xl mx-auto py-10">
            <div className="text-center mb-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-aqua-500 to-mint-500 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h2 className="font-display font-bold text-2xl text-text-primary mb-2">
                {t('rateOfRise.upload.title', 'TPG362 CSV laden')}
              </h2>
              <p className="text-text-secondary max-w-md mx-auto">
                {t(
                  'rateOfRise.upload.hint',
                  'Pfeiffer Vacuum Drucklogger-Daten für Druckanstiegstest-Analyse'
                )}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Upload Card */}
              <div
                {...getRootProps()}
                className={`p-8 rounded-card border-2 border-dashed cursor-pointer transition-all
                  ${
                    isDragActive
                      ? 'border-aqua-500 bg-aqua-500/10'
                      : 'border-subtle hover:border-aqua-500/50 bg-surface-card hover:bg-surface-card-muted'
                  }
                  ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <input {...getInputProps()} />
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-aqua-500/10 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-aqua-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <h3 className="font-display font-semibold text-lg text-text-primary mb-1">
                    {isLoading
                      ? t('upload.processing', 'Verarbeite...')
                      : t('upload.dropzone', 'Datei hierher ziehen oder klicken')}
                  </h3>
                  <p className="text-caption text-text-muted">
                    {t('rateOfRise.upload.formats', 'TPG362 CSV-Dateien (.csv)')}
                  </p>
                  {error && <p className="mt-2 text-caption text-coral-500">{error}</p>}
                </div>
              </div>

              {/* Archive Card */}
              <button
                onClick={() => {
                  if (!currentUser) {
                    setShowLoginModal(true)
                  } else {
                    setShowArchiveModal(true)
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
                      ? t('empty.archiveDescRoR', 'Gespeicherte Tests laden')
                      : t('empty.loginRequired', 'Anmeldung erforderlich')}
                  </p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          // Analysis View - 2-row layout
          <div className="space-y-4">
            {/* Row 1: Chart + Results */}
            <div className="flex gap-4">
              {/* Chart Area - takes 2/3 */}
              <div className="flex-[2] min-w-0 flex flex-col">
                {/* Chart Controls */}
                <div className="flex items-center gap-4 mb-3">
                  {/* Scale Toggle */}
                  <div className="flex bg-surface-card-muted rounded-lg p-1">
                    <button
                      onClick={() => setChartScale('linear')}
                      className={`px-3 py-1.5 text-caption rounded-md transition-colors ${
                        chartScale === 'linear'
                          ? 'bg-surface-card shadow text-text-primary'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {t('rateOfRise.chart.linear', 'Linear')}
                    </button>
                    <button
                      onClick={() => setChartScale('log')}
                      className={`px-3 py-1.5 text-caption rounded-md transition-colors ${
                        chartScale === 'log'
                          ? 'bg-surface-card shadow text-text-primary'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {t('rateOfRise.chart.log', 'Log')}
                    </button>
                  </div>

                  {/* Checkboxes */}
                  <label className="flex items-center gap-2 text-caption text-text-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showFitLine}
                      onChange={(e) => setShowFitLine(e.target.checked)}
                      className="rounded border-subtle"
                    />
                    {t('rateOfRise.chart.showFit', 'Fit-Linie')}
                  </label>

                  <label className="flex items-center gap-2 text-caption text-text-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPhases}
                      onChange={(e) => setShowPhases(e.target.checked)}
                      className="rounded border-subtle"
                    />
                    {t('rateOfRise.chart.showPhases', 'Phasen anzeigen')}
                  </label>

                  {/* File Info */}
                  <div className="ml-auto text-caption text-text-muted">
                    {data.metadata.filename} · {data.dataPoints.length}{' '}
                    {t('rateOfRise.dataPoints', 'Datenpunkte')}
                  </div>
                </div>

                {/* Chart */}
                <div
                  ref={chartRef}
                  className="bg-surface-card rounded-card shadow-card p-4 h-[calc(100vh-380px)] min-h-[350px]"
                >
                  <RoRChart
                    data={data}
                    analysis={analysis}
                    scale={chartScale}
                    showFitLine={showFitLine}
                    showPhases={showPhases}
                  />
                </div>
              </div>

              {/* Results Panel - takes 1/3 */}
              <div className="flex-1 min-w-[280px] max-w-[360px] space-y-3">
                {/* Results - Primary */}
                {analysis && (
                  <>
                    <ResultsCard analysis={analysis} />
                    <ClassificationCard
                      classification={analysis.classification}
                      isGerman={isGerman}
                    />
                    {analysis.limitCheck && (
                      <LimitCheckCard check={analysis.limitCheck} isGerman={isGerman} />
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Row 2: Secondary Info Grid */}
            <div className="grid grid-cols-3 gap-4">
              {/* Metadata */}
              <MetadataCard metadata={data.metadata} duration={data.duration} />

              {/* Inputs */}
              <InputsCard
                volume={chamberVolume}
                limit={leakRateLimit}
                limitSource={limitSource}
                onVolumeChange={setVolume}
                onLimitChange={setLimit}
              />

              {/* Outgassing Comparison */}
              {analysis && (
                <OutgassingComparisonCard
                  analysis={analysis}
                  onOpenSimulator={onOpenOutgassingSimulator}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showSaveModal && (
        <SaveRoRModal
          onClose={() => setShowSaveModal(false)}
          onSaved={() => setShowSaveModal(false)}
        />
      )}

      {showArchiveModal && (
        <RoRArchive onClose={() => setShowArchiveModal(false)} />
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <SimpleLoginModal
          onClose={() => setShowLoginModal(false)}
          isOptional={true}
        />
      )}

      {/* Footer */}
      <Footer className="ml-16" />

      {/* Navigation Sidebar */}
      <ActionsSidebar minimal />
    </div>
  )
}

export default RateOfRisePage
