/**
 * Leak Search Planner - MINIMAL DEMO
 *
 * Ultra-minimal demonstrator for internal pitch
 * Single-file component with inline logic
 * No external dependencies, no complex state management
 */

import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils/cn'

// ============================================================================
// TYPES
// ============================================================================

interface Inputs {
  volume: number
  leakRate: number
  sealType: 'cf' | 'kf' | 'viton' | 'mixed'
  hasSystemPump: boolean
  hasBlindHoles: boolean
}

interface Result {
  method: 'B2' | 'B5' | 'B6'
  methodName: string
  methodNameEn: string
  reasoning: string[]
  reasoningEn: string[]
  warnings: Warning[]
  waitTime: number
  pumpdown: number
}

interface Warning {
  severity: 'low' | 'medium' | 'high' | 'critical'
  problem: string
  problemEn: string
  action: string
  actionEn: string
}

// ============================================================================
// DECISION LOGIC (Simplified Heuristics)
// ============================================================================

function selectMethod(inputs: Inputs): {
  method: 'B2' | 'B5' | 'B6'
  methodName: string
  methodNameEn: string
  reasoning: string[]
  reasoningEn: string[]
} {
  const { leakRate } = inputs

  // Gross leak → Rate of Rise
  if (leakRate >= 1e-6) {
    return {
      method: 'B2',
      methodName: 'B2 – Rate-of-Rise (Druckanstieg)',
      methodNameEn: 'B2 – Rate-of-Rise (Pressure Rise)',
      reasoning: [
        'Grobleck-Bereich (≥ 1×10⁻⁶ mbar·l/s)',
        'Kein Helium erforderlich',
        'Schnell und kosteneffektiv',
        'Ausreichend sensitiv für diesen Grenzwert'
      ],
      reasoningEn: [
        'Gross leak range (≥ 1×10⁻⁶ mbar·l/s)',
        'No helium required',
        'Fast and cost-effective',
        'Sufficiently sensitive for this limit'
      ]
    }
  }

  // UHV → Helium Spray
  if (leakRate < 1e-9) {
    return {
      method: 'B5',
      methodName: 'B5 – Helium-Spray (Vakuummethode, lokal)',
      methodNameEn: 'B5 – Helium Spray (Vacuum Method, Local)',
      reasoning: [
        'UHV-Anforderung (< 1×10⁻⁹ mbar·l/s)',
        'Höchste Sensitivität erforderlich',
        'Lokalisierung möglich',
        'Nur Vakuum-Methode erreicht diese Nachweisgrenze'
      ],
      reasoningEn: [
        'UHV requirement (< 1×10⁻⁹ mbar·l/s)',
        'Highest sensitivity required',
        'Localization possible',
        'Only vacuum method achieves this detection limit'
      ]
    }
  }

  // Default: Helium Spray
  return {
    method: 'B5',
    methodName: 'B5 – Helium-Spray (Vakuummethode, lokal)',
    methodNameEn: 'B5 – Helium Spray (Vacuum Method, Local)',
    reasoning: [
      'Mittlerer Leckraten-Bereich',
      'Gute Balance zwischen Sensitivität und Aufwand',
      'Lokalisierung möglich',
      'Standard-Methode für HV/UHV'
    ],
    reasoningEn: [
      'Medium leak rate range',
      'Good balance between sensitivity and effort',
      'Localization possible',
      'Standard method for HV/UHV'
    ]
  }
}

function generateWarnings(inputs: Inputs): Warning[] {
  const warnings: Warning[] = []

  // Split-flow warning
  if (inputs.hasSystemPump && inputs.leakRate < 1e-8) {
    warnings.push({
      severity: 'critical',
      problem: 'Systempumpe aktiv während Messung',
      problemEn: 'System pump active during measurement',
      action: '→ Lecksucher SERIELL anschließen oder Systempumpe während Test ISOLIEREN. Sonst: Teilstrom-Verdünnung macht Leck unsichtbar!',
      actionEn: '→ Connect leak detector in SERIES or ISOLATE system pump during test. Otherwise: split-flow dilution makes leak invisible!'
    })
  }

  // Virtual leak warning
  if (inputs.hasBlindHoles) {
    warnings.push({
      severity: 'high',
      problem: 'Sackbohrungen vorhanden (Virtual-Leak-Risiko)',
      problemEn: 'Blind holes present (virtual leak risk)',
      action: '→ Rate-of-Rise Test VOR Helium-Spray durchführen! Wenn He-Test negativ aber Druck steigt: Virtual Leak bestätigt',
      actionEn: '→ Perform Rate-of-Rise test BEFORE helium spray! If He-test negative but pressure rises: virtual leak confirmed'
    })
  }

  // Permeation warning
  if (inputs.sealType === 'viton' && inputs.leakRate < 1e-9) {
    warnings.push({
      severity: 'medium',
      problem: 'Viton O-Ringe bei UHV-Anforderung',
      problemEn: 'Viton O-rings with UHV requirement',
      action: '→ Helium-Permeation durch Elastomere nach ~20 min möglich. Messfenster begrenzen (<15 min), Vergleichsmessung ohne He-Spray durchführen',
      actionEn: '→ Helium permeation through elastomers possible after ~20 min. Limit measurement window (<15 min), perform comparison measurement without He spray'
    })
  }

  // Mixed seals warning
  if (inputs.sealType === 'mixed' && inputs.leakRate < 1e-10) {
    warnings.push({
      severity: 'medium',
      problem: 'Gemischte Dichtungstypen bei strenger UHV-Anforderung',
      problemEn: 'Mixed seal types with strict UHV requirement',
      action: '→ Elastomer-Dichtungen können limitierender Faktor sein. Empfehlung: CF-Metalldichtungen bevorzugen',
      actionEn: '→ Elastomer seals may be limiting factor. Recommendation: prefer CF metal seals'
    })
  }

  return warnings
}

function estimateTiming(volume: number): { waitTime: number, pumpdown: number } {
  // Assume 50 l/s effective pumping speed (conservative)
  const seff = 50
  const tau = volume / seff

  // Wait time: 3×τ for 95% signal
  const waitTime = Math.ceil(3 * tau)

  // Pumpdown time: τ × ln(p_start / p_end) in minutes
  const pumpdown = Math.ceil(tau * Math.log(1013 / 0.01) / 60)

  return { waitTime, pumpdown }
}

// ============================================================================
// COMPONENT
// ============================================================================

export function LeakSearchDemo() {
  const { theme } = useAppStore()
  const isDark = theme === 'dark'

  const [inputs, setInputs] = useState<Inputs>({
    volume: 50,
    leakRate: 1e-10,
    sealType: 'cf',
    hasSystemPump: false,
    hasBlindHoles: false
  })

  const [result, setResult] = useState<Result | null>(null)
  const [language, setLanguage] = useState<'de' | 'en'>('de')

  // Volume calculator state
  const [calcExpanded, setCalcExpanded] = useState(false)
  const [chamberShape, setChamberShape] = useState<'rectangular' | 'cylindrical'>('rectangular')
  const [dimensions, setDimensions] = useState({
    length: 30,    // cm
    width: 30,     // cm
    height: 30,    // cm
    diameter: 30,  // cm (for cylinder)
    cylLength: 50  // cm (cylinder length)
  })

  // Calculate volume based on shape and dimensions (cm³ → liters)
  const calculatedVolume = useMemo(() => {
    if (chamberShape === 'rectangular') {
      const { length, width, height } = dimensions
      return (length * width * height) / 1000 // cm³ to liters
    } else {
      const { diameter, cylLength } = dimensions
      const r = diameter / 2
      return (Math.PI * r * r * cylLength) / 1000 // cm³ to liters
    }
  }, [chamberShape, dimensions])

  const handleApplyCalculatedVolume = () => {
    setInputs({ ...inputs, volume: Math.round(calculatedVolume * 10) / 10 })
  }

  const handleCalculate = () => {
    const methodResult = selectMethod(inputs)
    const warnings = generateWarnings(inputs)
    const timing = estimateTiming(inputs.volume)

    setResult({
      method: methodResult.method,
      methodName: methodResult.methodName,
      methodNameEn: methodResult.methodNameEn,
      reasoning: methodResult.reasoning,
      reasoningEn: methodResult.reasoningEn,
      warnings,
      waitTime: timing.waitTime,
      pumpdown: timing.pumpdown
    })
  }

  const t = (de: string, en: string) => language === 'de' ? de : en

  // Severity colors
  const getSeverityColor = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400'
      case 'high': return 'bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-400'
      case 'medium': return 'bg-yellow-500/10 border-yellow-500 text-yellow-700 dark:text-yellow-400'
      case 'low': return 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400'
    }
  }

  const getSeverityIcon = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'critical': return '🔴'
      case 'high': return '🟠'
      case 'medium': return '🟡'
      case 'low': return '🔵'
    }
  }

  return (
    <div className={`min-h-screen bg-surface-page ${isDark ? 'dark' : ''}`}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="font-display font-bold text-2xl text-text-primary">
                  {t('Lecksuche-Planer', 'Leak Search Planner')} <span className="text-sm text-text-muted">(DEMO)</span>
                </h1>
                <p className="text-caption text-text-secondary">
                  {t('Schneller Prüfplan-Generator', 'Quick Test Plan Generator')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
              className="px-4 py-2 text-caption font-medium text-text-secondary hover:text-text-primary bg-surface-card hover:bg-surface-card-muted rounded-chip transition-colors"
            >
              {language === 'de' ? '🇬🇧 EN' : '🇩🇪 DE'}
            </button>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500 rounded-lg">
            <p className="text-caption text-blue-700 dark:text-blue-400">
              <strong>{t('Demo-Version:', 'Demo Version:')}</strong> {t(
                'Vereinfachte Logik für internen Pitch. Die Vollversion enthält: 4-Screen-Wizard, Equipment-Datenbank, vollständige Physik-Engine, PDF-Export, Virtual-Leak-Risk-Scoring, RGA-Integration.',
                'Simplified logic for internal pitch. The full version includes: 4-screen wizard, equipment database, complete physics engine, PDF export, virtual leak risk scoring, RGA integration.'
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Card */}
          <div className="bg-surface-card rounded-card border border-subtle p-6">
            <h2 className="font-display font-semibold text-lg text-text-primary mb-4">
              {t('📝 Eingabe-Parameter', '📝 Input Parameters')}
            </h2>

            <div className="space-y-4">
              {/* Volume */}
              <div>
                <label className="block text-caption font-medium text-text-primary mb-2">
                  {t('Volumen (L)', 'Volume (L)')}
                </label>
                <input
                  type="number"
                  value={inputs.volume}
                  onChange={(e) => setInputs({ ...inputs, volume: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-surface-page border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-violet-500"
                  min="0.1"
                  step="1"
                />
              </div>

              {/* Volume Calculator */}
              <div className="rounded-lg border border-subtle bg-surface-card-muted overflow-hidden">
                <button
                  onClick={() => setCalcExpanded(!calcExpanded)}
                  className="w-full px-3 py-2 flex items-center justify-between hover:bg-surface-card transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-caption font-medium text-text-primary">
                      {t('Volumenrechner', 'Volume Calculator')}
                    </span>
                  </div>
                  <svg
                    className={cn('w-4 h-4 text-text-secondary transition-transform', calcExpanded && 'rotate-180')}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {calcExpanded && (
                  <div className="p-3 space-y-3 border-t border-subtle bg-surface-card">
                    {/* Shape Selector */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setChamberShape('rectangular')}
                        className={cn(
                          'flex-1 px-3 py-2 rounded-lg text-caption font-medium transition-all',
                          chamberShape === 'rectangular'
                            ? 'bg-violet-500 text-white'
                            : 'bg-surface-card-muted text-text-secondary hover:bg-violet-500/20'
                        )}
                      >
                        {t('Rechteckig', 'Rectangular')}
                      </button>
                      <button
                        onClick={() => setChamberShape('cylindrical')}
                        className={cn(
                          'flex-1 px-3 py-2 rounded-lg text-caption font-medium transition-all',
                          chamberShape === 'cylindrical'
                            ? 'bg-violet-500 text-white'
                            : 'bg-surface-card-muted text-text-secondary hover:bg-violet-500/20'
                        )}
                      >
                        {t('Zylindrisch', 'Cylindrical')}
                      </button>
                    </div>

                    {/* Dimension Inputs */}
                    {chamberShape === 'rectangular' ? (
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-micro text-text-secondary mb-1">
                            {t('Länge', 'Length')} (cm)
                          </label>
                          <input
                            type="number"
                            value={dimensions.length}
                            onChange={(e) => setDimensions(d => ({ ...d, length: Math.max(0, parseFloat(e.target.value) || 0) }))}
                            className="w-full px-2 py-1.5 rounded bg-surface-page border border-subtle text-text-primary text-caption focus:border-violet-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-micro text-text-secondary mb-1">
                            {t('Breite', 'Width')} (cm)
                          </label>
                          <input
                            type="number"
                            value={dimensions.width}
                            onChange={(e) => setDimensions(d => ({ ...d, width: Math.max(0, parseFloat(e.target.value) || 0) }))}
                            className="w-full px-2 py-1.5 rounded bg-surface-page border border-subtle text-text-primary text-caption focus:border-violet-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-micro text-text-secondary mb-1">
                            {t('Höhe', 'Height')} (cm)
                          </label>
                          <input
                            type="number"
                            value={dimensions.height}
                            onChange={(e) => setDimensions(d => ({ ...d, height: Math.max(0, parseFloat(e.target.value) || 0) }))}
                            className="w-full px-2 py-1.5 rounded bg-surface-page border border-subtle text-text-primary text-caption focus:border-violet-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-micro text-text-secondary mb-1">
                            {t('Durchmesser', 'Diameter')} (cm)
                          </label>
                          <input
                            type="number"
                            value={dimensions.diameter}
                            onChange={(e) => setDimensions(d => ({ ...d, diameter: Math.max(0, parseFloat(e.target.value) || 0) }))}
                            className="w-full px-2 py-1.5 rounded bg-surface-page border border-subtle text-text-primary text-caption focus:border-violet-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-micro text-text-secondary mb-1">
                            {t('Länge', 'Length')} (cm)
                          </label>
                          <input
                            type="number"
                            value={dimensions.cylLength}
                            onChange={(e) => setDimensions(d => ({ ...d, cylLength: Math.max(0, parseFloat(e.target.value) || 0) }))}
                            className="w-full px-2 py-1.5 rounded bg-surface-page border border-subtle text-text-primary text-caption focus:border-violet-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Result Display */}
                    <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                      <div className="flex items-center justify-between">
                        <span className="text-caption text-text-secondary">
                          {t('Berechnetes Volumen:', 'Calculated Volume:')}
                        </span>
                        <span className="font-mono text-lg text-violet-500 font-semibold">
                          {calculatedVolume.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} L
                        </span>
                      </div>
                    </div>

                    {/* Apply Button */}
                    <button
                      onClick={handleApplyCalculatedVolume}
                      className="w-full px-3 py-2 rounded-lg bg-violet-500 text-white text-caption font-medium hover:bg-violet-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {t('Übernehmen', 'Apply')}
                    </button>
                  </div>
                )}
              </div>

              {/* Leak Rate */}
              <div>
                <label className="block text-caption font-medium text-text-primary mb-2">
                  {t('Ziel-Leckrate (mbar·l/s)', 'Target Leak Rate (mbar·l/s)')}
                </label>
                <select
                  value={inputs.leakRate}
                  onChange={(e) => setInputs({ ...inputs, leakRate: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-surface-page border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value={1e-10}>1×10⁻¹⁰ (CERN LHC / GSI Kryostat)</option>
                  <option value={1e-9}>1×10⁻⁹ (Semiconductor / GSI Beamline)</option>
                  <option value={1e-8}>1×10⁻⁸ (Coating Systems)</option>
                  <option value={1e-6}>1×10⁻⁶ (Vacuum Furnace / Industrial)</option>
                </select>
              </div>

              {/* Seal Type */}
              <div>
                <label className="block text-caption font-medium text-text-primary mb-2">
                  {t('Dichtungstyp', 'Seal Type')}
                </label>
                <select
                  value={inputs.sealType}
                  onChange={(e) => setInputs({ ...inputs, sealType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-surface-page border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="cf">{t('CF (Metalldichtung)', 'CF (Metal Seal)')}</option>
                  <option value="kf">{t('KF (O-Ring)', 'KF (O-Ring)')}</option>
                  <option value="viton">{t('Viton (Elastomer)', 'Viton (Elastomer)')}</option>
                  <option value="mixed">{t('Gemischt', 'Mixed')}</option>
                </select>
              </div>

              {/* System Pump */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="systemPump"
                  checked={inputs.hasSystemPump}
                  onChange={(e) => setInputs({ ...inputs, hasSystemPump: e.target.checked })}
                  className="w-4 h-4 text-violet-500 rounded focus:ring-2 focus:ring-violet-500"
                />
                <label htmlFor="systemPump" className="text-caption text-text-primary">
                  {t('Systempumpe aktiv während Messung', 'System pump active during measurement')}
                </label>
              </div>

              {/* Blind Holes */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="blindHoles"
                  checked={inputs.hasBlindHoles}
                  onChange={(e) => setInputs({ ...inputs, hasBlindHoles: e.target.checked })}
                  className="w-4 h-4 text-violet-500 rounded focus:ring-2 focus:ring-violet-500"
                />
                <label htmlFor="blindHoles" className="text-caption text-text-primary">
                  {t('Sackbohrungen vorhanden', 'Blind holes present')}
                </label>
              </div>
            </div>

            {/* Calculate Button */}
            <button
              onClick={handleCalculate}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              {t('🔧 Prüfplan erstellen', '🔧 Generate Test Plan')}
            </button>
          </div>

          {/* Results Card */}
          <div className="bg-surface-card rounded-card border border-subtle p-6">
            <h2 className="font-display font-semibold text-lg text-text-primary mb-4">
              {t('📊 Empfehlung', '📊 Recommendation')}
            </h2>

            {!result ? (
              <div className="h-full flex items-center justify-center text-center text-text-muted">
                <div>
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-caption">
                    {t('Geben Sie Parameter ein und klicken Sie "Prüfplan erstellen"', 'Enter parameters and click "Generate Test Plan"')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Method */}
                <div className="p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">✅</div>
                    <div>
                      <h3 className="font-semibold text-text-primary mb-2">
                        {language === 'de' ? result.methodName : result.methodNameEn}
                      </h3>
                      <p className="text-caption font-semibold text-text-primary mb-2">
                        {t('BEGRÜNDUNG:', 'REASONING:')}
                      </p>
                      <ul className="space-y-1">
                        {(language === 'de' ? result.reasoning : result.reasoningEn).map((reason, idx) => (
                          <li key={idx} className="text-caption text-text-secondary flex items-start gap-2">
                            <span className="text-violet-500">•</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Timing */}
                <div className="p-4 bg-surface-card-muted rounded-lg">
                  <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <span>⏱️</span> {t('Zeit-Schätzung', 'Time Estimate')}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-micro text-text-muted mb-1">{t('Wartezeit/Spot', 'Wait time/spot')}</p>
                      <p className="text-lg font-semibold text-text-primary">{result.waitTime}s</p>
                    </div>
                    <div>
                      <p className="text-micro text-text-muted mb-1">{t('Pumpdown', 'Pumpdown')}</p>
                      <p className="text-lg font-semibold text-text-primary">{result.pumpdown} min</p>
                    </div>
                  </div>
                </div>

                {/* Warnings */}
                {result.warnings.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <span>⚠️</span> {t('Warnungen', 'Warnings')} ({result.warnings.length})
                    </h3>
                    <div className="space-y-3">
                      {result.warnings.map((warning, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border ${getSeverityColor(warning.severity)}`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-lg">{getSeverityIcon(warning.severity)}</span>
                            <div className="flex-1">
                              <p className="font-semibold text-caption mb-1">
                                {language === 'de' ? warning.problem : warning.problemEn}
                              </p>
                              <p className="text-caption">
                                {language === 'de' ? warning.action : warning.actionEn}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Warnings */}
                {result.warnings.length === 0 && (
                  <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <span className="text-xl">✅</span>
                      <p className="font-semibold">
                        {t('Keine Warnungen - Optimaler Aufbau!', 'No warnings - Optimal setup!')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-surface-card rounded-lg border border-subtle">
          <p className="text-caption text-text-muted text-center">
            {t(
              '💡 Dies ist eine Demo-Version (ca. 10% der Vollversion). Die vollständige Implementierung umfasst 24-33 Stunden und enthält: 4-Screen-Wizard, Equipment-Datenbank (Pfeiffer ASM 340, Leybold Phoenix, etc.), vollständige Physik-Engine (Leitwert, Zeitkonstanten, Teilstrom), PDF-Export, Virtual-Leak-Risk-Scoring (0-100 Punkte), RGA-Integration.',
              '💡 This is a demo version (approx. 10% of full version). Complete implementation requires 24-33 hours and includes: 4-screen wizard, equipment database (Pfeiffer ASM 340, Leybold Phoenix, etc.), complete physics engine (conductance, time constants, split-flow), PDF export, virtual leak risk scoring (0-100 points), RGA integration.'
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
