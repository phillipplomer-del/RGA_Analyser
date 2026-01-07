/**
 * Rate-of-Rise Archive Component
 * Lists and loads saved RoR tests from cloud storage
 */

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils/cn'
import { useAppStore } from '@/store/useAppStore'
import { useRateOfRiseStore } from '@/store/useRateOfRiseStore'
import {
  getRoRTestsList,
  getRoRTest,
  deleteRoRTest,
  archiveRoRTest,
} from '@/lib/rateOfRise/firebaseService'
import { formatDuration } from '@/lib/rateOfRise/parser'
import type { CloudRoRTestMeta } from '@/types/firebase'

interface RoRArchiveProps {
  onClose: () => void
}

export function RoRArchive({ onClose }: RoRArchiveProps) {
  const { t, i18n } = useTranslation()
  const { currentUser } = useAppStore()
  const { setSavedTests, savedTests, setLoadingArchive, isLoadingArchive } = useRateOfRiseStore()

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

  const [showArchived, setShowArchived] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  // Load tests on mount
  useEffect(() => {
    if (currentUser) {
      loadTests()
    }
  }, [currentUser, showArchived])

  const loadTests = async () => {
    if (!currentUser) return

    setLoadingArchive(true)
    try {
      const tests = await getRoRTestsList(currentUser.id, { archived: showArchived })
      setSavedTests(tests)
    } catch (err) {
      console.error('Failed to load RoR tests:', err)
    } finally {
      setLoadingArchive(false)
    }
  }

  const handleLoad = async (testMeta: CloudRoRTestMeta) => {
    if (!currentUser) return

    setLoadingId(testMeta.id)
    try {
      const result = await getRoRTest(currentUser.id, testMeta.id)
      if (result) {
        // Update store with loaded data
        useRateOfRiseStore.setState({
          data: result.data,
          analysis: result.analysis,
        })
        onClose()
      }
    } catch (err) {
      console.error('Failed to load RoR test:', err)
    } finally {
      setLoadingId(null)
    }
  }

  const handleArchive = async (testId: string, archive: boolean) => {
    if (!currentUser) return

    try {
      await archiveRoRTest(currentUser.id, testId, archive)
      loadTests()
    } catch (err) {
      console.error('Failed to archive RoR test:', err)
    }
  }

  const handleDelete = async (testId: string) => {
    if (!currentUser) return
    if (!confirm(t('cloud.deleteConfirm'))) return

    try {
      await deleteRoRTest(currentUser.id, testId)
      loadTests()
    } catch (err) {
      console.error('Failed to delete RoR test:', err)
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '-'
    return new Intl.DateTimeFormat(i18n.language === 'de' ? 'de-DE' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  // Classification colors and labels
  const classificationStyles: Record<string, { bg: string; text: string; label: string }> = {
    real_leak: { bg: 'bg-coral-500/10', text: 'text-coral-600', label: 'Real Leak' },
    virtual_leak: { bg: 'bg-amber-500/10', text: 'text-amber-600', label: 'Virtual Leak' },
    outgassing: { bg: 'bg-mint-500/10', text: 'text-mint-600', label: 'Outgassing' },
    mixed: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', label: 'Mixed' },
    unknown: { bg: 'bg-gray-500/10', text: 'text-gray-600', label: 'Unknown' },
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
                {t('cloud.archive')} - {t('rateOfRise.title')}
              </h2>
              <p className="text-white/80 text-caption mt-1">
                {savedTests.length} {savedTests.length === 1 ? 'Test' : 'Tests'}
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
              {i18n.language === 'de' ? 'Aktiv' : 'Active'}
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
          {isLoadingArchive ? (
            <div className="text-center py-8 text-text-muted">{t('common.loading')}</div>
          ) : savedTests.length === 0 ? (
            <div className="text-center py-8 text-text-muted">{t('cloud.noSpectra')}</div>
          ) : (
            <div className="space-y-3">
              {savedTests.map((test) => {
                const classStyle = classificationStyles[test.analysisSnapshot.classificationType] || classificationStyles.unknown

                return (
                  <div
                    key={test.id}
                    className="p-4 rounded-card bg-surface-page border border-subtle hover:border-aqua-500/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-text-primary truncate">
                          {test.filename}
                        </h3>
                        <p className="text-caption text-text-muted mt-1">
                          {formatDate(test.measurementDate || test.uploadedAt)}
                        </p>

                        {/* Device info */}
                        <p className="text-caption text-text-secondary mt-1">
                          {test.metadata.device} • {test.metadata.serialNumber}
                        </p>

                        {/* Tags */}
                        {test.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {test.tags.map((tag) => (
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
                        {test.notes && (
                          <p className="text-xs text-text-muted mt-2 line-clamp-2">
                            {test.notes}
                          </p>
                        )}
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-col items-end gap-2">
                        {/* Classification badge */}
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', classStyle.bg, classStyle.text)}>
                          {classStyle.label}
                        </span>

                        {/* Limit check badge */}
                        {test.analysisSnapshot.limitPassed !== null && (
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full text-xs font-medium',
                              test.analysisSnapshot.limitPassed
                                ? 'bg-mint-500/10 text-mint-600'
                                : 'bg-coral-500/10 text-coral-600'
                            )}
                          >
                            {test.analysisSnapshot.limitPassed
                              ? t('rateOfRise.limitCheck.passed')
                              : t('rateOfRise.limitCheck.failed')}
                          </span>
                        )}

                        {/* Leak rate */}
                        {test.analysisSnapshot.leakRateFormatted && (
                          <span className="text-xs text-text-muted">
                            {test.analysisSnapshot.leakRateFormatted}
                          </span>
                        )}

                        {/* Duration */}
                        <span className="text-xs text-text-muted">
                          {formatDuration(test.metadata.duration)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-subtle">
                      <button
                        onClick={() => handleLoad(test)}
                        disabled={loadingId === test.id}
                        className={cn(
                          'flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                          'bg-aqua-500 text-white hover:bg-aqua-600',
                          loadingId === test.id && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        {loadingId === test.id
                          ? t('common.loading')
                          : i18n.language === 'de'
                            ? 'Laden'
                            : 'Load'}
                      </button>
                      <button
                        onClick={() => handleArchive(test.id, !showArchived)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        {showArchived ? t('cloud.restore') : t('cloud.archive')}
                      </button>
                      <button
                        onClick={() => handleDelete(test.id)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200"
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
