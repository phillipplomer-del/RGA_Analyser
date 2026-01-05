import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/useAppStore'
import { parseASCFile } from '@/lib/parser'
import { analyzeSpectrum } from '@/lib/analysis'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils/cn'

export function FileUpload() {
  const { t } = useTranslation()
  const { setRawData, setAnalysisResult, setIsAnalyzing, setError, isAnalyzing } = useAppStore()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const content = await file.text()
      const rawData = parseASCFile(content)
      setRawData(rawData)

      const result = analyzeSpectrum(rawData)
      setAnalysisResult(result)
    } catch (error) {
      console.error('Error parsing file:', error)
      setError(t('upload.error'))
    }
  }, [setRawData, setAnalysisResult, setIsAnalyzing, setError, t])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.asc'],
    },
    multiple: false,
  })

  return (
    <Card
      {...getRootProps()}
      className={cn(
        'cursor-pointer border-2 border-dashed transition-all',
        isDragActive
          ? 'border-accent-teal bg-accent-teal/5'
          : 'border-border-subtle hover:border-accent-cyan',
        isAnalyzing && 'opacity-50 pointer-events-none'
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center py-8 text-center">
        {isAnalyzing ? (
          <>
            <div className="w-12 h-12 rounded-full gradient-main animate-pulse mb-4" />
            <p className="text-body text-text-secondary">{t('upload.processing')}</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-surface-card-muted flex items-center justify-center mb-4 float-animate">
              <svg className="w-8 h-8 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-body font-medium text-text-primary mb-2">
              {t('upload.dropzone')}
            </p>
            <p className="text-caption text-text-muted">
              {t('upload.formats')}
            </p>
          </>
        )}
      </div>
    </Card>
  )
}
