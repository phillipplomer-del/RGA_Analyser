import { useTranslation } from 'react-i18next'

interface FooterProps {
  className?: string
}

export function Footer({ className = '' }: FooterProps) {
  const { t } = useTranslation()

  return (
    <footer className={`bg-surface-card border-t border-subtle py-3 ${className}`}>
      <div className="max-w-7xl mx-auto px-6 text-center text-caption text-text-muted flex items-center justify-center gap-4">
        <span>&copy; {new Date().getFullYear()} Phillip Plomer &middot; Spectrum v1.0.0</span>
        <a
          href="mailto:phillip.plomer@icloud.com"
          className="text-text-muted hover:text-text-secondary transition-colors"
        >
          {t('footer.contact', 'Kontakt')}
        </a>
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
  )
}
