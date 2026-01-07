import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils/cn'
import { createOrLoginUser, validatePin, validateName } from '@/lib/firebase/simpleAuth'
import { useAppStore } from '@/store/useAppStore'

interface SimpleLoginModalProps {
  onClose?: () => void
  isOptional?: boolean
}

export function SimpleLoginModal({ onClose, isOptional = false }: SimpleLoginModalProps) {
  const { t } = useTranslation()
  const { setCurrentUser } = useAppStore()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [pin, setPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!validateName(firstName)) {
      setError(t('auth.error.invalidFirstName'))
      return
    }
    if (!validateName(lastName)) {
      setError(t('auth.error.invalidLastName'))
      return
    }
    if (!validatePin(pin)) {
      setError(t('auth.error.invalidPin'))
      return
    }

    setIsLoading(true)

    try {
      const { user } = await createOrLoginUser(firstName, lastName, pin)
      setCurrentUser(user)
      onClose?.()
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'PIN_MISMATCH') {
          setError(t('auth.error.pinMismatch'))
        } else {
          setError(t('auth.error.generic'))
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-card rounded-card shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-aqua-500 to-aqua-600 px-6 py-4">
          <h2 className="font-display font-bold text-h2 text-white">
            {t('auth.title')}
          </h2>
          <p className="text-white/80 text-caption mt-1">
            {t('auth.subtitle')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* First Name */}
          <div>
            <label className="block text-caption font-medium text-text-secondary mb-1">
              {t('auth.firstName')}
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={t('auth.firstNamePlaceholder')}
              className={cn(
                'w-full px-4 py-2 rounded-chip border transition-colors',
                'bg-surface-page text-text-primary placeholder:text-text-muted',
                'border-subtle focus:border-aqua-500 focus:ring-2 focus:ring-aqua-500/20 outline-none'
              )}
              disabled={isLoading}
              autoFocus
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-caption font-medium text-text-secondary mb-1">
              {t('auth.lastName')}
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={t('auth.lastNamePlaceholder')}
              className={cn(
                'w-full px-4 py-2 rounded-chip border transition-colors',
                'bg-surface-page text-text-primary placeholder:text-text-muted',
                'border-subtle focus:border-aqua-500 focus:ring-2 focus:ring-aqua-500/20 outline-none'
              )}
              disabled={isLoading}
            />
          </div>

          {/* PIN */}
          <div>
            <label className="block text-caption font-medium text-text-secondary mb-1">
              {t('auth.pin')}
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder={t('auth.pinPlaceholder')}
              className={cn(
                'w-full px-4 py-2 rounded-chip border transition-colors font-mono tracking-widest text-center text-lg',
                'bg-surface-page text-text-primary placeholder:text-text-muted',
                'border-subtle focus:border-aqua-500 focus:ring-2 focus:ring-aqua-500/20 outline-none'
              )}
              disabled={isLoading}
            />
            <p className="text-xs text-text-muted mt-1">
              {t('auth.pinHint')}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-chip bg-coral-500/10 border border-coral-500/20 text-coral-600 text-caption">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            {isOptional && (
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'flex-1 px-4 py-2 rounded-chip text-caption font-medium transition-colors',
                  'bg-surface-card-muted text-text-secondary hover:text-text-primary hover:bg-surface-page'
                )}
                disabled={isLoading}
              >
                {t('auth.skip')}
              </button>
            )}
            <button
              type="submit"
              className={cn(
                'flex-1 px-4 py-2 rounded-chip text-caption font-medium transition-colors',
                'bg-aqua-500 text-white hover:bg-aqua-600',
                isLoading && 'opacity-50 cursor-not-allowed'
              )}
              disabled={isLoading}
            >
              {isLoading ? t('auth.loading') : t('auth.submit')}
            </button>
          </div>

          {/* Info */}
          <p className="text-xs text-text-muted text-center pt-2">
            {t('auth.info')}
          </p>
        </form>
      </div>
    </div>
  )
}
