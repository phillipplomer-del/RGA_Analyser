import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/useAppStore'
import { parseASCFile } from '@/lib/parser'
import { analyzeSpectrum } from '@/lib/analysis'
import { compareSpectra } from '@/lib/comparison'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils/cn'
import type { FileSlot, MeasurementFile } from '@/types/rga'

interface SlotDropzoneProps {
  slot: FileSlot
  file: MeasurementFile | null
  onFileDrop: (file: MeasurementFile) => void
  isAnalyzing: boolean
}

function SlotDropzone({ slot, file, onFileDrop, isAnalyzing }: SlotDropzoneProps) {
  const { t } = useTranslation()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const droppedFile = acceptedFiles[0]
    if (!droppedFile) return

    try {
      const content = await droppedFile.text()
      const rawData = parseASCFile(content)
      const analysisResult = analyzeSpectrum(rawData)

      const measurementFile: MeasurementFile = {
        id: crypto.randomUUID(),
        slot,
        filename: droppedFile.name,
        rawData,
        analysisResult,
        uploadedAt: new Date(),
      }

      onFileDrop(measurementFile)
    } catch (error) {
      console.error('Error parsing file:', error)
    }
  }, [slot, onFileDrop])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.asc'] },
    multiple: false,
  })

  const slotLabel = slot === 'before'
    ? t('comparison.beforeBakeout', 'Vor Bakeout')
    : t('comparison.afterBakeout', 'Nach Bakeout')

  const slotColor = slot === 'before' ? 'text-blue-500' : 'text-emerald-500'
  const slotBorderColor = slot === 'before'
    ? isDragActive ? 'border-blue-500 bg-blue-500/5' : 'border-border-subtle hover:border-blue-400'
    : isDragActive ? 'border-emerald-500 bg-emerald-500/5' : 'border-border-subtle hover:border-emerald-400'

  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex-1 p-4 rounded-card border-2 border-dashed cursor-pointer transition-all',
        slotBorderColor,
        isAnalyzing && 'opacity-50 pointer-events-none'
      )}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center justify-center py-4 text-center min-h-[160px]">
        {file ? (
          <>
            <div className={cn('w-12 h-12 rounded-full flex items-center justify-center mb-3',
              slot === 'before' ? 'bg-blue-500/10' : 'bg-emerald-500/10'
            )}>
              <svg className={cn('w-6 h-6', slotColor)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className={cn('text-caption font-semibold mb-1', slotColor)}>
              {slotLabel}
            </p>
            <p className="text-body font-medium text-text-primary truncate max-w-full px-2">
              {file.filename}
            </p>
            <p className="text-caption text-text-muted mt-1">
              {file.analysisResult.peaks.length} Peaks
            </p>
          </>
        ) : (
          <>
            <div className={cn('w-12 h-12 rounded-full bg-surface-card-muted flex items-center justify-center mb-3')}>
              <svg className={cn('w-6 h-6', slotColor)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className={cn('text-caption font-semibold mb-1', slotColor)}>
              {slotLabel}
            </p>
            <p className="text-body text-text-secondary">
              {t('upload.dropzone', 'Datei hierher ziehen')}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export function ComparisonUpload() {
  const { t } = useTranslation()
  const {
    beforeFile,
    afterFile,
    setBeforeFile,
    setAfterFile,
    setComparisonResult,
    swapFiles,
    clearComparison,
    isAnalyzing,
    setIsAnalyzing,
  } = useAppStore()

  const handleBeforeFileDrop = useCallback((file: MeasurementFile) => {
    setBeforeFile(file)
    // If both files are now present, trigger comparison
    if (afterFile) {
      setIsAnalyzing(true)
      const result = compareSpectra(file, afterFile)
      setComparisonResult(result)
    }
  }, [afterFile, setBeforeFile, setComparisonResult, setIsAnalyzing])

  const handleAfterFileDrop = useCallback((file: MeasurementFile) => {
    setAfterFile(file)
    // If both files are now present, trigger comparison
    if (beforeFile) {
      setIsAnalyzing(true)
      const result = compareSpectra(beforeFile, file)
      setComparisonResult(result)
    }
  }, [beforeFile, setAfterFile, setComparisonResult, setIsAnalyzing])

  const hasFiles = beforeFile || afterFile

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-body font-semibold text-text-primary">
          {t('comparison.title', 'Spektren-Vergleich')}
        </h3>
        {hasFiles && (
          <div className="flex gap-2">
            <button
              onClick={swapFiles}
              className="px-3 py-1 text-caption text-text-secondary hover:text-text-primary
                bg-surface-card-muted hover:bg-surface-card rounded-chip transition-colors"
              title={t('comparison.swap', 'Dateien tauschen')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
            <button
              onClick={clearComparison}
              className="px-3 py-1 text-caption text-text-secondary hover:text-state-danger
                bg-surface-card-muted hover:bg-surface-card rounded-chip transition-colors"
            >
              {t('common.clear', 'Leeren')}
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <SlotDropzone
          slot="before"
          file={beforeFile}
          onFileDrop={handleBeforeFileDrop}
          isAnalyzing={isAnalyzing}
        />

        {/* Arrow between slots */}
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-surface-card-muted flex items-center justify-center">
            <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>

        <SlotDropzone
          slot="after"
          file={afterFile}
          onFileDrop={handleAfterFileDrop}
          isAnalyzing={isAnalyzing}
        />
      </div>

      {beforeFile && afterFile && (
        <p className="text-caption text-text-muted text-center mt-4">
          {t('comparison.ready', 'Vergleich wird angezeigt')}
        </p>
      )}
    </Card>
  )
}
