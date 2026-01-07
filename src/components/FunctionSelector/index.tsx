/**
 * Function Selector Page
 * Second landing page to choose between main app functions
 */

import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/useAppStore'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LanguageToggle } from '@/components/LanguageToggle'
import { Footer } from '@/components/ui/Footer'

interface FunctionSelectorProps {
  onSelectRGA: () => void
  onSelectRoR: () => void
  onSelectKnowledge: () => void
}

export function FunctionSelector({
  onSelectRGA,
  onSelectRoR,
  onSelectKnowledge,
}: FunctionSelectorProps) {
  const { t } = useTranslation()
  const { theme, setSkipLandingPage } = useAppStore()

  return (
    <div className={`min-h-screen bg-surface-page flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSkipLandingPage(false)}
              className="px-4 py-2 text-caption font-medium text-text-secondary hover:text-text-primary
                bg-surface-card-muted hover:bg-surface-card rounded-chip transition-colors"
            >
              {t('common.back', 'Zurück')}
            </button>
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl text-text-primary mb-3">
            {t('selector.title', 'Funktion wählen')}
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto">
            {t('selector.subtitle', 'Wählen Sie den gewünschten Analysebereich')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* RGA Card */}
          <button
            onClick={onSelectRGA}
            className="group p-8 rounded-card bg-surface-card border border-subtle
              hover:border-aqua-500/50 hover:shadow-lg transition-all text-left"
          >
            <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-aqua-500 to-mint-500
              flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-xl text-text-primary mb-2">
              {t('selector.rga.title', 'RGA Analyse')}
            </h3>
            <p className="text-caption text-text-secondary mb-4">
              {t('selector.rga.description', 'Restgasanalyse von Massenspektrometer-Daten mit Peak-Identifikation, Qualitätsprüfung und automatischer Diagnose.')}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 text-micro bg-aqua-500/10 text-aqua-600 rounded-full">
                ASC-Dateien
              </span>
              <span className="px-2 py-1 text-micro bg-aqua-500/10 text-aqua-600 rounded-full">
                Peak-Analyse
              </span>
              <span className="px-2 py-1 text-micro bg-aqua-500/10 text-aqua-600 rounded-full">
                Vergleich
              </span>
            </div>
          </button>

          {/* RoR Card */}
          <button
            onClick={onSelectRoR}
            className="group p-8 rounded-card bg-surface-card border border-subtle
              hover:border-amber-500/50 hover:shadow-lg transition-all text-left"
          >
            <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-amber-500 to-coral-500
              flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-xl text-text-primary mb-2">
              {t('selector.ror.title', 'Rate of Rise')}
            </h3>
            <p className="text-caption text-text-secondary mb-4">
              {t('selector.ror.description', 'Druckanstiegstest zur Leckratenbestimmung mit automatischer Phasenerkennung und Klassifikation.')}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 text-micro bg-amber-500/10 text-amber-600 rounded-full">
                CSV-Dateien
              </span>
              <span className="px-2 py-1 text-micro bg-amber-500/10 text-amber-600 rounded-full">
                Leckrate
              </span>
              <span className="px-2 py-1 text-micro bg-amber-500/10 text-amber-600 rounded-full">
                dp/dt
              </span>
            </div>
          </button>

          {/* Knowledge Card */}
          <button
            onClick={onSelectKnowledge}
            className="group p-8 rounded-card bg-surface-card border border-subtle
              hover:border-mint-500/50 hover:shadow-lg transition-all text-left"
          >
            <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-mint-500 to-aqua-500
              flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-xl text-text-primary mb-2">
              {t('selector.knowledge.title', 'Wissensdatenbank')}
            </h3>
            <p className="text-caption text-text-secondary mb-4">
              {t('selector.knowledge.description', 'Umfassendes Nachschlagewerk zu Vakuumtechnik, Massenspektrometrie und Lecksuche.')}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 text-micro bg-mint-500/10 text-mint-600 rounded-full">
                Referenz
              </span>
              <span className="px-2 py-1 text-micro bg-mint-500/10 text-mint-600 rounded-full">
                Peaktabelle
              </span>
              <span className="px-2 py-1 text-micro bg-mint-500/10 text-mint-600 rounded-full">
                Leitfaden
              </span>
            </div>
          </button>
        </div>

        {/* Info Text */}
        <div className="mt-12 text-center">
          <p className="text-caption text-text-muted">
            {t('selector.hint', 'Sie können jederzeit über die Seitenleiste zwischen den Bereichen wechseln.')}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
