import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils/cn'
import { useAppStore } from '@/store/useAppStore'
import { logout } from '@/lib/firebase/simpleAuth'

export function UserBadge() {
  const { t } = useTranslation()
  const { currentUser, setCurrentUser } = useAppStore()
  const [showDropdown, setShowDropdown] = useState(false)

  if (!currentUser) {
    return null
  }

  const handleLogout = () => {
    logout()
    setCurrentUser(null)
    setShowDropdown(false)
  }

  // Extract initials from name (first letters of first two words, or first two chars if single word)
  const nameParts = currentUser.name.trim().split(/\s+/)
  const initials = nameParts.length >= 2
    ? `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase()
    : currentUser.name.substring(0, 2).toUpperCase()

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-chip transition-colors',
          'bg-aqua-500/10 text-aqua-600 hover:bg-aqua-500/20',
          'dark:bg-aqua-500/20 dark:text-aqua-400'
        )}
      >
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-aqua-500 text-white flex items-center justify-center text-xs font-bold">
          {initials}
        </div>
        {/* Name */}
        <span className="text-caption font-medium hidden sm:inline">
          {currentUser.name}
        </span>
        {/* Dropdown Arrow */}
        <svg
          className={cn('w-4 h-4 transition-transform', showDropdown && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-surface-card rounded-card shadow-xl border border-subtle z-50">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-subtle">
              <p className="text-caption font-medium text-text-primary">
                {currentUser.name}
              </p>
              <p className="text-xs text-text-muted">
                {t('auth.loggedIn')}
              </p>
            </div>

            {/* Actions */}
            <div className="py-1">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-caption text-text-secondary hover:text-coral-600 hover:bg-coral-500/10 transition-colors"
              >
                {t('auth.logout')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
