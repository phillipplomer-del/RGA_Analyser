import { useTranslation } from 'react-i18next'
import type { CalibrationResult, GasPartialPressure, SEMAgingWarning, PressureUnit } from '@/types/calibration'
import { Card, CardHeader } from '@/components/ui/Card'
import { cn } from '@/lib/utils/cn'
import { useAppStore } from '@/store/useAppStore'

interface CalibrationPanelProps {
  calibration: CalibrationResult | undefined
  gasPartialPressures: GasPartialPressure[] | undefined
  semWarning: SEMAgingWarning | null | undefined
  totalPressure: number
  onOpenDeviceCalibration?: () => void
}

export function CalibrationPanel({
  calibration,
  gasPartialPressures,
  semWarning,
  totalPressure,
  onOpenDeviceCalibration
}: CalibrationPanelProps) {
  const { t, i18n } = useTranslation()
  const { pressureUnit, setPressureUnit, calibrationLevel, setCalibrationLevel, reanalyzeFiles, deviceCalibration } = useAppStore()
  const isGerman = i18n.language === 'de'

  // Handler für Level-Änderung mit Re-Analyse
  const handleLevelChange = (newLevel: typeof calibrationLevel) => {
    setCalibrationLevel(newLevel)
    // Nach kurzer Verzögerung re-analysieren (damit State aktualisiert ist)
    setTimeout(() => reanalyzeFiles(), 50)
  }

  // Prüfen ob ein Level Device-Kalibrierung benötigt
  const needsDeviceCalibration = (level: string) => level === 'ADVANCED' || level === 'PRECISION'
  const hasDeviceCalibration = deviceCalibration !== null

  if (!calibration) {
    return (
      <Card>
        <CardHeader title={t('calibration.title')} />
        <div className="px-4 py-6 text-center text-text-muted">
          <p className="text-body">{t('calibration.noData')}</p>
        </div>
      </Card>
    )
  }

  const getConfidenceColor = (confidence: CalibrationResult['confidence']) => {
    switch (confidence) {
      case 'high':
        return 'bg-state-success/10 text-state-success'
      case 'medium':
        return 'bg-state-warning/10 text-state-warning'
      case 'low':
        return 'bg-state-danger/10 text-state-danger'
    }
  }

  const getConfidenceText = (confidence: CalibrationResult['confidence']) => {
    switch (confidence) {
      case 'high':
        return t('calibration.high')
      case 'medium':
        return t('calibration.medium')
      case 'low':
        return t('calibration.low')
    }
  }

  const getSystemStateText = (state: string) => {
    switch (state) {
      case 'baked':
        return t('calibration.baked')
      case 'unbaked':
        return t('calibration.unbaked')
      default:
        return t('calibration.unknown')
    }
  }

  const formatPressure = (pressure: number, unit: PressureUnit = 'mbar') => {
    let value = pressure
    let unitLabel = 'mbar'

    if (unit === 'pa') {
      value = pressure * 100
      unitLabel = 'Pa'
    } else if (unit === 'torr') {
      value = pressure / 1.33322
      unitLabel = 'Torr'
    }

    if (Math.abs(value) < 1e-3 || Math.abs(value) > 1e3) {
      return `${value.toExponential(2)} ${unitLabel}`
    }
    return `${value.toPrecision(3)} ${unitLabel}`
  }

  // Find the maximum partial pressure for the bar chart scaling
  const maxPartialPressure = gasPartialPressures
    ? Math.max(...gasPartialPressures.map(p => p.percentage))
    : 100

  return (
    <Card>
      <CardHeader
        title={t('calibration.title')}
        action={
          <div className="flex items-center gap-2">
            <span className={cn('px-3 py-1 rounded-full text-caption font-medium', getConfidenceColor(calibration.confidence))}>
              {getConfidenceText(calibration.confidence)} {t('calibration.confidence')}
            </span>
          </div>
        }
      />

      {/* SEM Warning */}
      {semWarning && (
        <div className={cn(
          'mx-4 mb-4 px-4 py-3 rounded-chip border',
          semWarning.severity === 'critical' ? 'bg-state-danger/10 border-state-danger/30' :
          semWarning.severity === 'warning' ? 'bg-state-warning/10 border-state-warning/30' :
          'bg-state-success/10 border-state-success/30'
        )}>
          <div className="flex items-center gap-2">
            <span className="text-xl">{semWarning.severity === 'critical' ? '⚠️' : semWarning.severity === 'warning' ? '⚡' : 'ℹ️'}</span>
            <div>
              <p className="text-caption font-medium text-text-primary">{t('calibration.semWarning')}</p>
              <p className="text-caption text-text-muted">{semWarning.warning}</p>
            </div>
          </div>
        </div>
      )}

      {/* Level Selector */}
      <div className="px-4 mb-4">
        <label className="text-caption text-text-muted block mb-1">{t('calibration.level')}</label>
        <select
          value={calibrationLevel}
          onChange={(e) => handleLevelChange(e.target.value as typeof calibrationLevel)}
          className="w-full text-body bg-surface-card border border-subtle rounded px-3 py-2 text-text-primary"
        >
          <option value="BASIC">{t('calibration.basic')}</option>
          <option value="STANDARD">{t('calibration.standard')}</option>
          <option value="ADVANCED" disabled={!hasDeviceCalibration}>
            {t('calibration.advanced')} {!hasDeviceCalibration ? '🔒' : ''}
          </option>
          <option value="PRECISION" disabled={!hasDeviceCalibration}>
            {t('calibration.precision')} {!hasDeviceCalibration ? '🔒' : ''}
          </option>
        </select>
        {needsDeviceCalibration(calibrationLevel) && !hasDeviceCalibration && (
          <p className="text-micro text-state-warning mt-1">
            {isGerman ? '⚠️ Geräte-Kalibrierung erforderlich' : '⚠️ Device calibration required'}
          </p>
        )}
        {!hasDeviceCalibration && (
          <p className="text-micro text-text-muted mt-1">
            {isGerman
              ? '🔒 ADVANCED/PRECISION benötigen Geräte-Kalibrierung'
              : '🔒 ADVANCED/PRECISION require device calibration'}
          </p>
        )}
      </div>

      {/* Metadata Section */}
      <div className="px-4 pb-4 space-y-3">
        {/* System State */}
        <div className="flex justify-between items-center">
          <span className="text-caption text-text-muted">{t('calibration.systemState')}</span>
          <span className="text-body font-medium text-text-primary">
            {getSystemStateText(calibration.metadata.systemState)}
          </span>
        </div>

        {/* Total Pressure */}
        <div className="flex justify-between items-center">
          <span className="text-caption text-text-muted">{t('calibration.totalPressure')}</span>
          <div className="text-right">
            {calibration.metadata.totalPressure && (
              <span className="text-micro text-text-muted mr-2">
                ({t('calibration.raw')}: {formatPressure(calibration.metadata.totalPressure, pressureUnit)})
              </span>
            )}
            <span className="text-body font-medium font-mono text-text-primary">
              {formatPressure(totalPressure, pressureUnit)}
            </span>
          </div>
        </div>

        {/* Sensitivity */}
        <div className="flex justify-between items-center">
          <span className="text-caption text-text-muted">{t('calibration.sensitivity')}</span>
          <span className="text-body font-mono text-text-primary">
            {calibration.sensitivity.toExponential(2)} A/mbar
          </span>
        </div>

        {/* Unit Selector */}
        <div className="flex justify-between items-center">
          <span className="text-caption text-text-muted">{isGerman ? 'Einheit' : 'Unit'}</span>
          <select
            value={pressureUnit}
            onChange={(e) => setPressureUnit(e.target.value as PressureUnit)}
            className="text-body bg-surface-card border border-subtle rounded px-2 py-1 text-text-primary"
          >
            <option value="mbar">mbar</option>
            <option value="pa">Pa</option>
            <option value="torr">Torr</option>
          </select>
        </div>
      </div>

      {/* Corrections Section */}
      <div className="border-t border-border-subtle px-4 py-4">
        <p className="text-caption font-medium text-text-secondary mb-3">{t('calibration.corrections')}</p>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-caption text-text-muted">{t('calibration.manometer')}</span>
            <span className={cn(
              'text-caption font-mono',
              calibration.corrections.manometerCorrection !== 1.0 ? 'text-accent-teal' : 'text-text-muted'
            )}>
              {calibration.corrections.manometerCorrection !== 1.0
                ? `× ${calibration.corrections.manometerCorrection.toFixed(2)}`
                : '-'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-caption text-text-muted">{t('calibration.temperature')}</span>
            <span className={cn(
              'text-caption font-mono',
              calibration.corrections.temperatureCorrection !== 1.0 ? 'text-accent-teal' : 'text-text-muted'
            )}>
              {calibration.corrections.temperatureCorrection !== 1.0
                ? `× ${calibration.corrections.temperatureCorrection.toFixed(3)}`
                : '-'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-caption text-text-muted">{t('calibration.deconvolution')}</span>
            <span className={cn(
              'text-caption',
              calibration.level !== 'BASIC' ? 'text-accent-teal' : 'text-text-muted'
            )}>
              {calibration.level !== 'BASIC' ? t('calibration.active') : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Partial Pressures */}
      {gasPartialPressures && gasPartialPressures.length > 0 && (
        <div className="border-t border-border-subtle px-4 py-4">
          <p className="text-caption font-medium text-text-secondary mb-3">{t('calibration.partialPressures')}</p>
          <div className="space-y-2">
            {gasPartialPressures.slice(0, 8).map((gas) => (
              <div key={gas.gas} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-caption font-medium text-text-primary">
                    {gas.gas}
                    <span className="text-text-muted ml-1 font-normal">m/z {gas.mainMass}</span>
                  </span>
                  <span className="text-caption font-mono text-text-secondary">
                    {formatPressure(gas.pressure, pressureUnit)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-teal rounded-full transition-all duration-300"
                      style={{ width: `${(gas.percentage / maxPartialPressure) * 100}%` }}
                    />
                  </div>
                  <span className="text-micro font-mono text-text-muted w-12 text-right">
                    {gas.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Device Calibration Button */}
      {onOpenDeviceCalibration && (
        <div className="border-t border-border-subtle px-4 py-4">
          <button
            onClick={onOpenDeviceCalibration}
            className="w-full px-4 py-2 bg-accent-teal/10 hover:bg-accent-teal/20 text-accent-teal rounded-chip text-body font-medium transition-colors"
          >
            {t('calibration.setupCalibration')}
          </button>
        </div>
      )}
    </Card>
  )
}
