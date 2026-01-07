/**
 * Metadata Card Component
 * Displays TPG362 device information
 */

import { useTranslation } from 'react-i18next'
import type { TPGMetadata } from '@/types/rateOfRise'
import { formatDuration } from '@/lib/rateOfRise/parser'

interface MetadataCardProps {
  metadata: TPGMetadata
  duration: number
}

export function MetadataCard({ metadata, duration }: MetadataCardProps) {
  const { t } = useTranslation()

  const items = [
    {
      label: t('rateOfRise.metadata.device', 'Gerät'),
      value: `${metadata.manufacturer} ${metadata.device}`,
    },
    {
      label: t('rateOfRise.metadata.serial', 'Seriennummer'),
      value: metadata.serialNumber,
    },
    {
      label: t('rateOfRise.metadata.sensor', 'Sensor'),
      value: metadata.sensor1Type + (metadata.sensor2Type ? ` / ${metadata.sensor2Type}` : ''),
    },
    {
      label: t('rateOfRise.metadata.interval', 'Messintervall'),
      value: `${metadata.measurementInterval}s`,
    },
    {
      label: t('rateOfRise.metadata.duration', 'Messdauer'),
      value: formatDuration(duration),
    },
    {
      label: t('rateOfRise.metadata.date', 'Datum'),
      value: metadata.recordingStart.toLocaleString(),
    },
  ]

  return (
    <div className="bg-surface-card rounded-card shadow-card p-4">
      <h3 className="text-micro font-semibold text-text-muted uppercase tracking-wider mb-3">
        {t('rateOfRise.metadata.title', 'Geräte-Info')}
      </h3>

      <div className="space-y-2">
        {items.map(({ label, value }) => (
          <div key={label} className="flex justify-between text-caption">
            <span className="text-text-secondary">{label}</span>
            <span className="text-text-primary font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
