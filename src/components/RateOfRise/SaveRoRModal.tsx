/**
 * Save Rate-of-Rise Test Modal
 * Dialog for saving test data to cloud storage
 */

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils/cn'
import { useAppStore } from '@/store/useAppStore'
import { useRateOfRiseStore } from '@/store/useRateOfRiseStore'
import { saveRoRTest } from '@/lib/rateOfRise/firebaseService'
import { formatDuration, formatScientific } from '@/lib/rateOfRise/parser'

interface SaveRoRModalProps {
  onClose: () => void
  onSaved?: (testId: string) => void
}

export function SaveRoRModal({ onClose, onSaved }: SaveRoRModalProps) {
  const { t } = useTranslation()
  const { currentUser } = useAppStore()
  const { data, analysis } = useRateOfRiseStore()

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!data || !analysis) {
    return null
  }

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSave = async () => {
    if (!currentUser) {
      setError(t('auth.error.generic'))
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const testId = await saveRoRTest(currentUser.id, data, analysis, { tags, notes })
      onSaved?.(testId)
      onClose()
    } catch (err) {
      console.error('Failed to save RoR test:', err)
      setError(t('common.error'))
    } finally {
      setIsLoading(false)
    }
  }

  // Classification color
  const classColors = {
    real_leak: { bg: 'bg-coral-500/10', text: 'text-coral-600' },
    virtual_leak: { bg: 'bg-amber-500/10', text: 'text-amber-600' },
    outgassing: { bg: 'bg-mint-500/10', text: 'text-mint-600' },
    mixed: { bg: 'bg-yellow-500/10', text: 'text-yellow-600' },
    unknown: { bg: 'bg-gray-500/10', text: 'text-gray-600' },
  }
  const classColor = classColors[analysis.classification.type] || classColors.unknown

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-surface-card rounded-card shadow-xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-aqua-500 to-aqua-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-h2 text-white">
                {t('cloud.save')}
              </h2>
              <p className="text-white/80 text-caption mt-1">{data.metadata.filename}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              title={t('common.close', 'Schließen')}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Tags */}
          <div>
            <label className="block text-caption font-medium text-text-secondary mb-2">
              {t('cloud.tags')}
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-aqua-500/10 text-aqua-600"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-aqua-700"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('cloud.tagsPlaceholder')}
                className={cn(
                  'flex-1 px-3 py-1.5 rounded-chip border text-caption',
                  'bg-surface-page text-text-primary placeholder:text-text-muted',
                  'border-subtle focus:border-aqua-500 focus:ring-1 focus:ring-aqua-500/20 outline-none'
                )}
              />
              <button
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-chip text-caption font-medium bg-aqua-500/10 text-aqua-600 hover:bg-aqua-500/20"
              >
                +
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-caption font-medium text-text-secondary mb-2">
              {t('cloud.notes')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('cloud.notesPlaceholder')}
              rows={3}
              className={cn(
                'w-full px-3 py-2 rounded-chip border text-caption',
                'bg-surface-page text-text-primary placeholder:text-text-muted',
                'border-subtle focus:border-aqua-500 focus:ring-1 focus:ring-aqua-500/20 outline-none resize-none'
              )}
            />
          </div>

          {/* Summary */}
          <div className="p-3 rounded-chip bg-surface-page">
            <div className="grid grid-cols-2 gap-2 text-caption">
              <div className="text-text-muted">{t('rateOfRise.metadata.device')}:</div>
              <div className="text-text-primary">{data.metadata.device}</div>

              <div className="text-text-muted">{t('rateOfRise.metadata.duration')}:</div>
              <div className="text-text-primary">{formatDuration(data.duration)}</div>

              <div className="text-text-muted">{t('rateOfRise.results.dpdt')}:</div>
              <div className="text-text-primary">{formatScientific(analysis.dpdt, 'mbar/s')}</div>

              {analysis.leakRate && (
                <>
                  <div className="text-text-muted">{t('rateOfRise.results.leakRate')}:</div>
                  <div className="text-text-primary">{analysis.leakRate.QFormatted}</div>
                </>
              )}

              <div className="text-text-muted">{t('rateOfRise.classification.title')}:</div>
              <div className={cn('font-medium', classColor.text)}>
                {analysis.classification.type.replace('_', ' ')}
              </div>

              {analysis.limitCheck && (
                <>
                  <div className="text-text-muted">{t('rateOfRise.limitCheck.title')}:</div>
                  <div className={cn(
                    'font-medium',
                    analysis.limitCheck.passed ? 'text-mint-600' : 'text-coral-600'
                  )}>
                    {analysis.limitCheck.passed
                      ? t('rateOfRise.limitCheck.passed')
                      : t('rateOfRise.limitCheck.failed')}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-chip bg-coral-500/10 border border-coral-500/20 text-coral-600 text-caption">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                bg-gray-100 text-gray-600 hover:bg-gray-200"
              disabled={isLoading}
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSave}
              className={cn(
                'flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                'bg-aqua-500 text-white hover:bg-aqua-600',
                isLoading && 'opacity-50 cursor-not-allowed'
              )}
              disabled={isLoading}
            >
              {isLoading ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
