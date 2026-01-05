import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AnalysisResult } from '@/types/rga'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/store/useAppStore'
import { generatePDF, downloadPDF } from '@/lib/export/pdfExport'
import { generateAnimatedHTML, downloadHTML } from '@/lib/export/htmlExport'

interface ExportPanelProps {
  analysis: AnalysisResult
  chartRef?: React.RefObject<HTMLDivElement | null>
}

export function ExportPanel({ analysis, chartRef }: ExportPanelProps) {
  const { t, i18n } = useTranslation()
  const { aiInterpretation } = useAppStore()
  const [isExportingPDF, setIsExportingPDF] = useState(false)

  const language = i18n.language === 'de' ? 'de' : 'en'
  const baseFilename = analysis.metadata.sourceFile?.replace('.asc', '') || 'rga_analysis'

  const handleExportPDF = async () => {
    setIsExportingPDF(true)
    try {
      const blob = await generatePDF(analysis, chartRef?.current || null, {
        includeAiInterpretation: !!aiInterpretation,
        aiInterpretation,
        language,
      })
      downloadPDF(blob, `${baseFilename}.pdf`)
    } catch (error) {
      console.error('Error exporting PDF:', error)
    } finally {
      setIsExportingPDF(false)
    }
  }

  const handleExportHTML = () => {
    const html = generateAnimatedHTML(analysis, language, aiInterpretation)
    downloadHTML(html, `${baseFilename}_presentation.html`)
  }

  const handleExportCSV = () => {
    const headers = ['Mass [AMU]', 'Ion Current [A]', 'Normalized']
    const rows = analysis.normalizedData.map((d) => [
      d.mass.toFixed(2),
      d.current.toExponential(6),
      d.normalizedToH2.toFixed(6),
    ])

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `rga_${analysis.metadata.sourceFile?.replace('.asc', '') || 'data'}.csv`
    a.click()

    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader title={t('export.title')} />
      <div className="flex flex-wrap gap-4">
        <Button onClick={handleExportPDF} variant="primary" disabled={isExportingPDF}>
          {isExportingPDF ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          {isExportingPDF ? t('export.exporting') : t('export.pdf')}
        </Button>
        <Button onClick={handleExportHTML} variant="secondary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t('export.html')}
        </Button>
        <Button onClick={handleExportCSV} variant="ghost">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {t('export.csv')}
        </Button>
      </div>
    </Card>
  )
}
