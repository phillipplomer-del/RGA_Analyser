import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils/cn'
import { useAppStore } from '@/store/useAppStore'
import { saveSpectrum } from '@/lib/firebase/spectrumService'
import type { MeasurementFile } from '@/types/rga'

interface SaveSpectrumModalProps {
  file: MeasurementFile
  onClose: () => void
  onSaved?: (spectrumId: string) => void
}

export function SaveSpectrumModal({ file, onClose, onSaved }: SaveSpectrumModalProps) {
  const { t } = useTranslation()
  const { currentUser } = useAppStore()

  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      const spectrumId = await saveSpectrum(currentUser.id, file, { tags, notes })
      onSaved?.(spectrumId)
      onClose()
    } catch (err) {
      console.error('Failed to save spectrum:', err)
      setError(t('common.error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-card rounded-card shadow-xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-aqua-500 to-aqua-600 px-6 py-4">
          <h2 className="font-display font-bold text-h2 text-white">
            {t('cloud.save')}
          </h2>
          <p className="text-white/80 text-caption mt-1">{file.filename}</p>
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
                    className="hover:text-coral-500"
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
              <div className="text-text-muted">Peaks:</div>
              <div className="text-text-primary">{file.analysisResult.peaks.length}</div>
              <div className="text-text-muted">Status:</div>
              <div
                className={cn(
                  file.analysisResult.diagnosisSummary?.overallStatus === 'clean'
                    ? 'text-mint-600'
                    : file.analysisResult.diagnosisSummary?.overallStatus === 'warning'
                      ? 'text-amber-600'
                      : 'text-coral-600'
                )}
              >
                {file.analysisResult.diagnosisSummary?.overallStatus || 'unknown'}
              </div>
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
                'bg-[#00BCD4] text-white hover:bg-[#00ACC1]',
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
