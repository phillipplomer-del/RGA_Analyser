import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/useAppStore'
import type { DeviceCalibration, DeviceCalibrationMeasurement } from '@/types/calibration'
import { saveDeviceCalibration, deleteDeviceCalibration } from '@/lib/firebase/calibrationService'

interface DeviceCalibrationModalProps {
  onClose: () => void
  currentN2Current?: number  // Aktueller Strom bei m/z 28 (falls Datei geladen)
}

export function DeviceCalibrationModal({ onClose, currentN2Current }: DeviceCalibrationModalProps) {
  const { t, i18n } = useTranslation()
  const { setDeviceCalibration, deviceCalibration, reanalyzeFiles, currentUser } = useAppStore()
  const isGerman = i18n.language === 'de'
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [deviceId, setDeviceId] = useState(deviceCalibration?.deviceId || '')
  const [detectorType, setDetectorType] = useState<'faraday' | 'sem'>(deviceCalibration?.detectorType || 'faraday')
  const [semVoltage, setSemVoltage] = useState<string>(deviceCalibration?.semVoltageAtCalibration?.toString() || '')

  // N₂ Reference (required)
  const [n2ReferencePressure, setN2ReferencePressure] = useState<string>('')
  const [n2MeasuredCurrent, setN2MeasuredCurrent] = useState<string>(currentN2Current?.toExponential(2) || '')

  // Optional additional gases
  const [additionalMeasurements, setAdditionalMeasurements] = useState<{
    gas: string
    referencePressure: string
    measuredCurrent: string
    mass: number
  }[]>([])

  const availableGases = [
    { key: 'Ar', mass: 40, name: 'Argon' },
    { key: 'He', mass: 4, name: 'Helium' },
    { key: 'H2', mass: 2, name: isGerman ? 'Wasserstoff' : 'Hydrogen' },
  ]

  const handleAddGas = (gasKey: string) => {
    const gas = availableGases.find(g => g.key === gasKey)
    if (gas && !additionalMeasurements.some(m => m.gas === gasKey)) {
      setAdditionalMeasurements([...additionalMeasurements, {
        gas: gasKey,
        referencePressure: '',
        measuredCurrent: '',
        mass: gas.mass
      }])
    }
  }

  const handleRemoveGas = (gasKey: string) => {
    setAdditionalMeasurements(additionalMeasurements.filter(m => m.gas !== gasKey))
  }

  const handleUpdateMeasurement = (gasKey: string, field: 'referencePressure' | 'measuredCurrent', value: string) => {
    setAdditionalMeasurements(additionalMeasurements.map(m =>
      m.gas === gasKey ? { ...m, [field]: value } : m
    ))
  }

  const handleSave = async () => {
    // Validate N₂ reference
    const n2Pressure = parseFloat(n2ReferencePressure)
    const n2Current = parseFloat(n2MeasuredCurrent)

    if (isNaN(n2Pressure) || isNaN(n2Current) || n2Pressure <= 0 || n2Current <= 0) {
      alert(isGerman ? 'Bitte gültige N₂-Referenzwerte eingeben' : 'Please enter valid N₂ reference values')
      return
    }

    if (!deviceId.trim()) {
      alert(isGerman ? 'Bitte Geräte-ID eingeben' : 'Please enter device ID')
      return
    }

    setIsSaving(true)

    try {
      // Build measurements array
      const measurements: DeviceCalibrationMeasurement[] = [
        {
          gas: 'N2',
          referencePressure: n2Pressure,
          measuredCurrent: n2Current,
          mass: 28
        }
      ]

      // Add optional measurements
      for (const m of additionalMeasurements) {
        const pressure = parseFloat(m.referencePressure)
        const current = parseFloat(m.measuredCurrent)
        if (!isNaN(pressure) && !isNaN(current) && pressure > 0 && current > 0) {
          measurements.push({
            gas: m.gas,
            referencePressure: pressure,
            measuredCurrent: current,
            mass: m.mass
          })
        }
      }

      // Calculate base sensitivity from N₂ reference
      // S = I / P (for N₂, RSF = 1.0)
      const baseSensitivity = n2Current / n2Pressure

      const calibration: DeviceCalibration = {
        deviceId: deviceId.trim(),
        timestamp: new Date(),
        baseSensitivity,
        detectorType,
        measurements,
        semVoltageAtCalibration: detectorType === 'sem' ? parseFloat(semVoltage) || undefined : undefined
      }

      // Save to Firebase if logged in
      if (currentUser) {
        await saveDeviceCalibration(currentUser.id, calibration)
      }

      setDeviceCalibration(calibration)

      // Re-analyze with new calibration
      setTimeout(() => reanalyzeFiles(), 50)

      onClose()
    } catch (error) {
      console.error('Failed to save calibration:', error)
      alert(isGerman ? 'Fehler beim Speichern' : 'Error saving calibration')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    setIsSaving(true)

    try {
      // Delete from Firebase if logged in and calibration exists
      if (currentUser && deviceCalibration) {
        await deleteDeviceCalibration(currentUser.id, deviceCalibration.deviceId)
      }

      setDeviceCalibration(null)
      setTimeout(() => reanalyzeFiles(), 50)
      onClose()
    } catch (error) {
      console.error('Failed to delete calibration:', error)
      alert(isGerman ? 'Fehler beim Löschen' : 'Error deleting calibration')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface-card rounded-xl shadow-card-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-subtle flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">
            {t('calibration.deviceCalibration')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-card-muted rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info */}
          <div className="bg-accent-teal/10 border border-accent-teal/30 rounded-lg p-4">
            <p className="text-caption text-text-secondary">
              {isGerman
                ? '💡 Für ADVANCED/PRECISION-Genauigkeit benötigen Sie eine Referenzmessung mit einem externen Manometer (z.B. Spinning Rotor Gauge).'
                : '💡 For ADVANCED/PRECISION accuracy, you need a reference measurement with an external gauge (e.g., Spinning Rotor Gauge).'}
            </p>
          </div>

          {/* Device ID */}
          <div>
            <label className="text-caption text-text-muted block mb-1">
              {isGerman ? 'Geräte-ID / Seriennummer' : 'Device ID / Serial Number'}
            </label>
            <input
              type="text"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              placeholder="z.B. QMG220-12345"
              className="w-full text-body bg-surface-card border border-subtle rounded px-3 py-2 text-text-primary placeholder:text-text-muted"
            />
          </div>

          {/* Detector Type */}
          <div>
            <label className="text-caption text-text-muted block mb-1">
              {t('calibration.detectorType')}
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="detectorType"
                  value="faraday"
                  checked={detectorType === 'faraday'}
                  onChange={() => setDetectorType('faraday')}
                  className="accent-accent-teal"
                />
                <span className="text-body text-text-primary">{t('calibration.faraday')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="detectorType"
                  value="sem"
                  checked={detectorType === 'sem'}
                  onChange={() => setDetectorType('sem')}
                  className="accent-accent-teal"
                />
                <span className="text-body text-text-primary">{t('calibration.sem')}</span>
              </label>
            </div>
          </div>

          {/* SEM Voltage (only if SEM selected) */}
          {detectorType === 'sem' && (
            <div>
              <label className="text-caption text-text-muted block mb-1">
                {isGerman ? 'SEM-Spannung bei Kalibrierung [V]' : 'SEM Voltage at Calibration [V]'}
              </label>
              <input
                type="number"
                value={semVoltage}
                onChange={(e) => setSemVoltage(e.target.value)}
                placeholder="z.B. 1250"
                className="w-full text-body bg-surface-card border border-subtle rounded px-3 py-2 text-text-primary placeholder:text-text-muted"
              />
            </div>
          )}

          {/* N₂ Reference (Required) */}
          <div className="border-t border-subtle pt-4">
            <h3 className="text-body font-medium text-text-primary mb-3">
              {t('calibration.n2Reference')} <span className="text-state-danger">*</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-caption text-text-muted block mb-1">
                  {t('calibration.referencePressure')} [mbar]
                </label>
                <input
                  type="text"
                  value={n2ReferencePressure}
                  onChange={(e) => setN2ReferencePressure(e.target.value)}
                  placeholder="z.B. 1e-6"
                  className="w-full text-body bg-surface-card border border-subtle rounded px-3 py-2 text-text-primary font-mono placeholder:text-text-muted"
                />
              </div>
              <div>
                <label className="text-caption text-text-muted block mb-1">
                  {t('calibration.measuredCurrent')} [A]
                </label>
                <input
                  type="text"
                  value={n2MeasuredCurrent}
                  onChange={(e) => setN2MeasuredCurrent(e.target.value)}
                  placeholder="z.B. 1e-10"
                  className="w-full text-body bg-surface-card border border-subtle rounded px-3 py-2 text-text-primary font-mono placeholder:text-text-muted"
                />
                {currentN2Current && (
                  <p className="text-micro text-text-muted mt-1">
                    {isGerman ? 'Aktuell bei m/z 28:' : 'Current at m/z 28:'} {currentN2Current.toExponential(2)} A
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Gases (Optional) */}
          <div className="border-t border-subtle pt-4">
            <h3 className="text-body font-medium text-text-primary mb-3">
              {t('calibration.additionalGases')}
            </h3>

            {/* Add Gas Buttons */}
            <div className="flex gap-2 mb-4">
              {availableGases.map(gas => (
                <button
                  key={gas.key}
                  onClick={() => handleAddGas(gas.key)}
                  disabled={additionalMeasurements.some(m => m.gas === gas.key)}
                  className="px-3 py-1 text-caption bg-surface-card-muted hover:bg-surface-card border border-subtle rounded-full text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  + {gas.name} (m/z {gas.mass})
                </button>
              ))}
            </div>

            {/* Additional Measurement Inputs */}
            {additionalMeasurements.map(m => {
              const gas = availableGases.find(g => g.key === m.gas)
              return (
                <div key={m.gas} className="bg-surface-card-muted rounded-lg p-4 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-body font-medium text-text-primary">
                      {gas?.name} (m/z {m.mass})
                    </span>
                    <button
                      onClick={() => handleRemoveGas(m.gas)}
                      className="text-text-muted hover:text-state-danger text-caption"
                    >
                      {isGerman ? 'Entfernen' : 'Remove'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-caption text-text-muted block mb-1">
                        {t('calibration.referencePressure')} [mbar]
                      </label>
                      <input
                        type="text"
                        value={m.referencePressure}
                        onChange={(e) => handleUpdateMeasurement(m.gas, 'referencePressure', e.target.value)}
                        placeholder="z.B. 1e-6"
                        className="w-full text-body bg-surface-card border border-subtle rounded px-3 py-2 text-text-primary font-mono placeholder:text-text-muted"
                      />
                    </div>
                    <div>
                      <label className="text-caption text-text-muted block mb-1">
                        {t('calibration.measuredCurrent')} [A]
                      </label>
                      <input
                        type="text"
                        value={m.measuredCurrent}
                        onChange={(e) => handleUpdateMeasurement(m.gas, 'measuredCurrent', e.target.value)}
                        placeholder="z.B. 1e-10"
                        className="w-full text-body bg-surface-card border border-subtle rounded px-3 py-2 text-text-primary font-mono placeholder:text-text-muted"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Current Calibration Info */}
          {deviceCalibration && (
            <div className="bg-state-success/10 border border-state-success/30 rounded-lg p-4">
              <p className="text-caption text-text-primary font-medium mb-1">
                {isGerman ? '✅ Aktive Kalibrierung' : '✅ Active Calibration'}
              </p>
              <p className="text-micro text-text-muted">
                {deviceCalibration.deviceId} • {deviceCalibration.detectorType.toUpperCase()} •
                S = {deviceCalibration.baseSensitivity.toExponential(2)} A/mbar
              </p>
              <p className="text-micro text-text-muted">
                {isGerman ? 'Erstellt:' : 'Created:'} {new Date(deviceCalibration.timestamp).toLocaleString()}
              </p>
            </div>
          )}

          {/* Cloud sync info */}
          <div className={`rounded-lg p-3 ${currentUser ? 'bg-accent-teal/10 border border-accent-teal/30' : 'bg-surface-card-muted border border-subtle'}`}>
            <p className="text-caption text-text-secondary">
              {currentUser ? (
                <>☁️ {isGerman ? 'Wird in der Cloud gespeichert und auf allen Geräten verfügbar sein' : 'Will be saved to cloud and available on all devices'}</>
              ) : (
                <>💾 {isGerman ? 'Wird lokal im Browser gespeichert. Für Cloud-Sync bitte einloggen.' : 'Will be saved locally in browser. Login for cloud sync.'}</>
              )}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-subtle flex justify-between">
          <button
            onClick={handleReset}
            disabled={isSaving || !deviceCalibration}
            className="px-4 py-2 text-body text-state-danger hover:bg-state-danger/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('calibration.resetCalibration')}
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-body text-text-secondary hover:text-text-primary hover:bg-surface-card-muted rounded-lg transition-colors disabled:opacity-50"
            >
              {isGerman ? 'Abbrechen' : 'Cancel'}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-body bg-accent-teal text-white hover:bg-accent-teal/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {t('calibration.saveCalibration')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
