import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils/cn'
import { useAppStore } from '@/store/useAppStore'
import { getSpectraList, getSpectrum, deleteSpectrum, archiveSpectrum } from '@/lib/firebase/spectrumService'
import type { CloudSpectrumMeta } from '@/types/firebase'

interface SpectrumArchiveProps {
  onClose: () => void
}

export function SpectrumArchive({ onClose }: SpectrumArchiveProps) {
  const { t } = useTranslation()
  const { currentUser, addFile, setCloudSpectra, cloudSpectra } = useAppStore()

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

  const [isLoading, setIsLoading] = useState(true)
  const [showArchived, setShowArchived] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  // Load spectra on mount
  useEffect(() => {
    if (currentUser) {
      loadSpectra()
    }
  }, [currentUser, showArchived])

  const loadSpectra = async () => {
    if (!currentUser) {
      console.log('No user, skipping load')
      return
    }

    console.log('Loading spectra for user:', currentUser.id, 'archived:', showArchived)
    setIsLoading(true)
    try {
      const spectra = await getSpectraList(currentUser.id, { archived: showArchived })
      console.log('Loaded spectra:', spectra)
      setCloudSpectra(spectra)
    } catch (err) {
      console.error('Failed to load spectra:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoad = async (spectrumMeta: CloudSpectrumMeta) => {
    if (!currentUser) return

    setLoadingId(spectrumMeta.id)
    try {
      const file = await getSpectrum(currentUser.id, spectrumMeta.id)
      if (file) {
        addFile(file)
        onClose()
      }
    } catch (err) {
      console.error('Failed to load spectrum:', err)
    } finally {
      setLoadingId(null)
    }
  }

  const handleArchive = async (spectrumId: string, archive: boolean) => {
    if (!currentUser) return

    try {
      await archiveSpectrum(currentUser.id, spectrumId, archive)
      loadSpectra()
    } catch (err) {
      console.error('Failed to archive spectrum:', err)
    }
  }

  const handleDelete = async (spectrumId: string) => {
    if (!currentUser) return
    if (!confirm(t('cloud.deleteConfirm'))) return

    try {
      await deleteSpectrum(currentUser.id, spectrumId)
      loadSpectra()
    } catch (err) {
      console.error('Failed to delete spectrum:', err)
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '-'
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-surface-card rounded-card shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-aqua-500 to-aqua-600 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-h2 text-white">
                {t('cloud.archive')}
              </h2>
              <p className="text-white/80 text-caption mt-1">
                {cloudSpectra.length} {cloudSpectra.length === 1 ? 'Spektrum' : 'Spektren'}
              </p>
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

          {/* Toggle Archived */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setShowArchived(false)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                !showArchived
                  ? 'bg-white text-aqua-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              )}
            >
              Aktiv
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                showArchived
                  ? 'bg-white text-aqua-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              )}
            >
              {t('cloud.archived')}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center py-8 text-text-muted">{t('common.loading')}</div>
          ) : cloudSpectra.length === 0 ? (
            <div className="text-center py-8 text-text-muted">{t('cloud.noSpectra')}</div>
          ) : (
            <div className="space-y-3">
              {cloudSpectra.map((spectrum) => (
                <div
                  key={spectrum.id}
                  className="p-4 rounded-card bg-surface-page border border-subtle hover:border-aqua-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-text-primary truncate">
                        {spectrum.filename}
                      </h3>
                      <p className="text-caption text-text-muted mt-1">
                        {formatDate(spectrum.measurementDate || spectrum.uploadedAt)}
                      </p>

                      {/* Tags */}
                      {spectrum.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {spectrum.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full text-xs bg-aqua-500/10 text-aqua-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Notes preview */}
                      {spectrum.notes && (
                        <p className="text-xs text-text-muted mt-2 line-clamp-2">
                          {spectrum.notes}
                        </p>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          spectrum.analysisSnapshot.overallStatus === 'clean'
                            ? 'bg-mint-500/10 text-mint-600'
                            : spectrum.analysisSnapshot.overallStatus === 'warning'
                              ? 'bg-amber-500/10 text-amber-600'
                              : 'bg-coral-500/10 text-coral-600'
                        )}
                      >
                        {spectrum.analysisSnapshot.overallStatus}
                      </span>
                      <span className="text-xs text-text-muted">
                        {spectrum.analysisSnapshot.peakCount} Peaks
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-subtle">
                    <button
                      onClick={() => handleLoad(spectrum)}
                      disabled={loadingId === spectrum.id}
                      className={cn(
                        'flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                        'bg-[#00BCD4] text-white hover:bg-[#00ACC1]',
                        loadingId === spectrum.id && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {loadingId === spectrum.id ? t('common.loading') : 'Laden'}
                    </button>
                    <button
                      onClick={() => handleArchive(spectrum.id, !showArchived)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      {showArchived ? t('cloud.restore') : t('cloud.archive')}
                    </button>
                    <button
                      onClick={() => handleDelete(spectrum.id)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200"
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
