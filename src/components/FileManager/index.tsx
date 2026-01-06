import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/useAppStore'
import { parseASCFile } from '@/lib/parser'
import { analyzeSpectrum } from '@/lib/analysis'
import type { MeasurementFile } from '@/types/rga'
import { cn } from '@/lib/utils/cn'

const MAX_FILES = 3
const FILE_COLORS = ['#00D9FF', '#FF6B6B', '#4ECDC4'] // Cyan, Red, Teal

export function FileManager() {
  const { t, i18n } = useTranslation()
  const { files, addFile, removeFile } = useAppStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canAddMore = files.length < MAX_FILES

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles) return

    for (const file of Array.from(selectedFiles)) {
      if (files.length >= MAX_FILES) break

      try {
        const content = await file.text()
        const rawData = parseASCFile(content)
        const analysisResult = analyzeSpectrum(rawData)

        const measurementFile: MeasurementFile = {
          id: crypto.randomUUID(),
          order: files.length,
          filename: file.name,
          rawData,
          analysisResult,
          uploadedAt: new Date(),
        }

        addFile(measurementFile)
      } catch (error) {
        console.error('Error parsing file:', error)
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return date.toLocaleDateString(i18n.language === 'de' ? 'de-DE' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {files.map((file, index) => (
        <div
          key={file.id}
          className="flex items-center gap-2 px-3 py-1.5 rounded-chip bg-surface-card border border-subtle"
          style={{ borderLeftColor: FILE_COLORS[index], borderLeftWidth: 3 }}
        >
          <div className="flex flex-col">
            <span className="text-caption font-medium text-text-primary truncate max-w-32">
              {file.filename}
            </span>
            <span className="text-micro text-text-muted">
              {formatDate(file.rawData.metadata.startTime)}
            </span>
          </div>
          <button
            onClick={() => removeFile(file.id)}
            className="ml-1 p-0.5 rounded hover:bg-surface-card-muted text-text-muted hover:text-state-danger transition-colors"
            title={t('common.close')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}

      {canAddMore && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".asc"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-chip',
              'bg-surface-card-muted border border-dashed border-subtle',
              'text-caption text-text-muted hover:text-text-primary hover:border-accent-cyan',
              'transition-colors'
            )}
            title={t('fileManager.addFile', 'Datei hinzufügen')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>{t('fileManager.add', 'Hinzufügen')}</span>
          </button>
        </>
      )}

      {files.length === MAX_FILES && (
        <span className="text-micro text-text-muted">
          {t('fileManager.maxReached', 'Max. 3 Dateien')}
        </span>
      )}
    </div>
  )
}

export { FILE_COLORS }
