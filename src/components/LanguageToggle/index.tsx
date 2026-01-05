import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils/cn'

export function LanguageToggle() {
  const { i18n } = useTranslation()
  const { language, setLanguage } = useAppStore()

  const toggleLanguage = () => {
    const newLang = language === 'de' ? 'en' : 'de'
    setLanguage(newLang)
    i18n.changeLanguage(newLang)
  }

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        'chip-animate px-4 py-2 rounded-chip text-caption font-medium',
        'bg-surface-card-muted text-text-secondary hover:text-text-primary'
      )}
    >
      {language.toUpperCase()}
    </button>
  )
}
