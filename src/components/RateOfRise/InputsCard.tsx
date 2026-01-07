/**
 * Inputs Card Component
 * User inputs for chamber volume and leak rate limit
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { STANDARD_LEAK_RATE_LIMITS } from '@/types/rateOfRise'

interface InputsCardProps {
  volume: number | null
  limit: number | null
  limitSource: string
  onVolumeChange: (volume: number | null) => void
  onLimitChange: (limit: number | null, source: string) => void
}

export function InputsCard({
  volume,
  limit,
  limitSource,
  onVolumeChange,
  onLimitChange,
}: InputsCardProps) {
  const { t, i18n } = useTranslation()
  const isGerman = i18n.language === 'de'

  const [volumeInput, setVolumeInput] = useState(volume?.toString() || '')
  const [customLimit, setCustomLimit] = useState('')
  const [showCustomLimit, setShowCustomLimit] = useState(false)

  // Sync volumeInput with volume prop when it changes externally
  useEffect(() => {
    if (volume !== null && volume.toString() !== volumeInput) {
      setVolumeInput(volume.toString())
    }
  }, [volume])

  const handleVolumeSubmit = () => {
    const parsed = parseFloat(volumeInput.replace(',', '.'))
    if (!isNaN(parsed) && parsed > 0) {
      onVolumeChange(parsed)
    }
  }

  const handleLimitSelect = (value: string) => {
    if (value === 'custom') {
      setShowCustomLimit(true)
      return
    }

    if (value === '') {
      onLimitChange(null, '')
      return
    }

    const selectedLimit = STANDARD_LEAK_RATE_LIMITS.find(
      (l) => l.value.toString() === value
    )
    if (selectedLimit) {
      onLimitChange(selectedLimit.value, isGerman ? selectedLimit.name : selectedLimit.nameEn)
    }
  }

  const handleCustomLimitSubmit = () => {
    const parsed = parseFloat(customLimit.replace(',', '.'))
    if (!isNaN(parsed) && parsed > 0) {
      onLimitChange(parsed, t('rateOfRise.params.limitCustom', 'Benutzerdefiniert'))
      setShowCustomLimit(false)
    }
  }

  return (
    <div className="bg-surface-card rounded-card shadow-card p-4">
      <h3 className="text-micro font-semibold text-text-muted uppercase tracking-wider mb-3">
        {t('rateOfRise.params.title', 'Parameter')}
      </h3>

      <div className="space-y-4">
        {/* Chamber Volume */}
        <div>
          <label className="block text-caption text-text-secondary mb-1">
            {t('rateOfRise.params.volume', 'Kammervolumen')}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={volumeInput}
              onChange={(e) => setVolumeInput(e.target.value)}
              onBlur={handleVolumeSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleVolumeSubmit()}
              placeholder="z.B. 10"
              className="flex-1 px-3 py-2 text-caption bg-surface-card-muted border border-subtle rounded-lg
                focus:outline-none focus:ring-2 focus:ring-aqua-500/50 focus:border-aqua-500"
            />
            <span className="flex items-center px-3 text-caption text-text-muted bg-surface-card-muted rounded-lg border border-subtle">
              {t('rateOfRise.params.volumeUnit', 'Liter')}
            </span>
          </div>
          <p className="mt-1 text-micro text-text-muted">
            {t('rateOfRise.params.volumeHint', 'Für Leckraten-Berechnung Q = V × dp/dt')}
          </p>
        </div>

        {/* Leak Rate Limit */}
        <div>
          <label className="block text-caption text-text-secondary mb-1">
            {t('rateOfRise.params.limit', 'Leckraten-Grenzwert')}
          </label>

          {!showCustomLimit ? (
            <select
              value={limit?.toString() || ''}
              onChange={(e) => handleLimitSelect(e.target.value)}
              className="w-full px-3 py-2 text-caption bg-surface-card-muted border border-subtle rounded-lg
                focus:outline-none focus:ring-2 focus:ring-aqua-500/50 focus:border-aqua-500"
            >
              <option value="">
                {t('rateOfRise.params.limitSelect', 'Grenzwert wählen...')}
              </option>
              {STANDARD_LEAK_RATE_LIMITS.map((l) => (
                <option key={l.name} value={l.value.toString()}>
                  {isGerman ? l.name : l.nameEn} ({l.value.toExponential(0)} mbar·L/s)
                </option>
              ))}
              <option value="custom">
                {t('rateOfRise.params.limitCustom', 'Benutzerdefiniert...')}
              </option>
            </select>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={customLimit}
                onChange={(e) => setCustomLimit(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomLimitSubmit()}
                placeholder="z.B. 1e-9"
                autoFocus
                className="flex-1 px-3 py-2 text-caption bg-surface-card-muted border border-subtle rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-aqua-500/50 focus:border-aqua-500"
              />
              <button
                onClick={handleCustomLimitSubmit}
                className="px-3 py-2 text-caption font-medium text-white bg-aqua-500 rounded-lg
                  hover:bg-aqua-600 transition-colors"
              >
                OK
              </button>
              <button
                onClick={() => setShowCustomLimit(false)}
                className="px-3 py-2 text-caption text-text-secondary hover:text-text-primary
                  bg-surface-card-muted rounded-lg transition-colors"
              >
                {t('common.cancel', 'Abbrechen')}
              </button>
            </div>
          )}

          {limitSource && (
            <p className="mt-1 text-micro text-text-muted">
              {t('rateOfRise.params.limitSource', 'Quelle')}: {limitSource}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
