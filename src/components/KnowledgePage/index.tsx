import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/useAppStore'
import { KnowledgePanel } from '@/components/KnowledgePanel'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LanguageToggle } from '@/components/LanguageToggle'
import { ActionsSidebar } from '@/components/ActionsSidebar'
import { Footer } from '@/components/ui/Footer'

interface KnowledgePageProps {
  onShowRateOfRise?: () => void
  onShowOutgassing?: () => void
}

export function KnowledgePage({ onShowRateOfRise, onShowOutgassing }: KnowledgePageProps) {
  const { i18n } = useTranslation()
  const { setShowKnowledgePage, theme } = useAppStore()
  const isGerman = i18n.language === 'de'

  return (
    <div className={`fixed inset-0 z-50 bg-surface-page flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-surface-card shadow-card border-b border-subtle ml-16">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowKnowledgePage(false)}
              className="p-2 rounded-lg hover:bg-surface-card-muted transition-colors"
              title={isGerman ? 'Zurück' : 'Back'}
            >
              <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="font-display font-bold text-h2 gradient-text">
                {isGerman ? 'RGA Wissensdatenbank' : 'RGA Knowledge Base'}
              </h1>
              <p className="text-caption text-text-secondary">
                {isGerman
                  ? 'Kriterien, Gase, Massen und Diagnosemuster'
                  : 'Criteria, gases, masses and diagnostic patterns'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden ml-16">
        <div className="max-w-7xl mx-auto h-full">
          <KnowledgePanel onShowOutgassing={onShowOutgassing} />
        </div>
      </main>

      {/* Footer */}
      <Footer className="ml-16 flex-shrink-0" />

      {/* Navigation Sidebar */}
      <ActionsSidebar
        minimal
        onShowRateOfRise={onShowRateOfRise}
      />
    </div>
  )
}
