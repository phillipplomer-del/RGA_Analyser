import { useTranslation } from 'react-i18next'
import type { RGAMetadata } from '@/types/rga'
import { Card, CardHeader } from '@/components/ui/Card'

interface MetadataPanelProps {
  metadata: RGAMetadata
  title?: string
}

export function MetadataPanel({ metadata, title }: MetadataPanelProps) {
  const { t, i18n } = useTranslation()

  const formatDate = (date: Date | null) => {
    if (!date) return '-'
    return date.toLocaleDateString(i18n.language === 'de' ? 'de-DE' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const calculateDuration = () => {
    if (!metadata.startTime || !metadata.endTime) return '-'
    const diff = metadata.endTime.getTime() - metadata.startTime.getTime()
    const seconds = Math.round(diff / 1000)
    return `${seconds}s`
  }

  const items = [
    { label: t('metadata.file'), value: metadata.sourceFile || '-' },
    { label: t('metadata.date'), value: formatDate(metadata.startTime) },
    { label: t('metadata.duration'), value: calculateDuration() },
    { label: t('metadata.range'), value: `${metadata.firstMass} - ${metadata.firstMass + metadata.scanWidth} AMU` },
  ]

  if (metadata.chamberName) {
    items.push({ label: t('metadata.chamber'), value: metadata.chamberName })
  }
  if (metadata.pressure) {
    items.push({ label: t('metadata.pressure'), value: metadata.pressure })
  }

  return (
    <Card>
      <CardHeader title={title || t('metadata.title')} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((item) => (
          <div key={item.label} className="space-y-1">
            <p className="text-caption text-text-muted">{item.label}</p>
            <p className="text-body font-medium text-text-primary truncate" title={item.value}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </Card>
  )
}
