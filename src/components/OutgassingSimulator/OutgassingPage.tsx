/**
 * Outgassing Page
 * Standalone page for the outgassing simulator
 */

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useOutgassingStore } from '@/store/useOutgassingStore'
import { useAppStore } from '@/store/useAppStore'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LanguageToggle } from '@/components/LanguageToggle'
import { ActionsSidebar } from '@/components/ActionsSidebar'
import { Footer } from '@/components/ui/Footer'
import { cn } from '@/lib/utils/cn'
import {
  OUTGASSING_MATERIALS,
  CHAMBER_PRESETS,
  getMaterialById,
  formatScientific,
  type OutgassingMaterial
} from '@/lib/knowledge/outgassingRates'

interface OutgassingPageProps {
  onBack: () => void
}

export function OutgassingPage({ onBack }: OutgassingPageProps) {
  const { t, i18n } = useTranslation()
  const isGerman = i18n.language === 'de'
  const { theme } = useAppStore()

  const {
    volume,
    pumpSpeed,
    pumpTime,
    materials,
    results,
    setVolume,
    setPumpSpeed,
    setPumpTime,
    addMaterial,
    removeMaterial,
    updateMaterial,
    loadPreset,
    reset,
    calculate
  } = useOutgassingStore()

  // Group materials by category
  const materialsByCategory = useMemo(() => {
    const categories: { [key: string]: OutgassingMaterial[] } = {
      metal: [],
      elastomer: [],
      ceramic: [],
      polymer: []
    }
    for (const mat of OUTGASSING_MATERIALS) {
      categories[mat.category].push(mat)
    }
    return categories
  }, [])

  const categoryLabels = {
    metal: isGerman ? 'Metalle' : 'Metals',
    elastomer: isGerman ? 'Elastomere' : 'Elastomers',
    ceramic: isGerman ? 'Keramik' : 'Ceramics',
    polymer: isGerman ? 'Polymere' : 'Polymers'
  }

  // Surface calculator state
  const [calcExpanded, setCalcExpanded] = useState(false)
  const [chamberShape, setChamberShape] = useState<'rectangular' | 'cylindrical'>('rectangular')
  const [dimensions, setDimensions] = useState({
    length: 30,    // cm
    width: 30,     // cm
    height: 30,    // cm
    diameter: 30,  // cm (for cylinder)
    cylLength: 50  // cm (cylinder length)
  })
  const [selectedMaterialId, setSelectedMaterialId] = useState('ss304-cleaned')

  // Calculate surface area based on shape and dimensions
  const calculatedSurfaceArea = useMemo(() => {
    if (chamberShape === 'rectangular') {
      const { length, width, height } = dimensions
      return 2 * (length * width + length * height + width * height)
    } else {
      const { diameter, cylLength } = dimensions
      const r = diameter / 2
      // Two end caps (π×r²×2) + lateral surface (2×π×r×L)
      return Math.PI * diameter * (r + cylLength)
    }
  }, [chamberShape, dimensions])

  const handleLoadPreset = (presetKey: string) => {
    const preset = CHAMBER_PRESETS[presetKey]
    if (!preset) return
    loadPreset(preset.volume_liters, preset.pumpingSpeed_Lpers, preset.materials)
  }

  const handleAddMaterial = () => {
    addMaterial({ materialId: 'ss304-cleaned', surfaceArea_cm2: 100, isBaked: false })
  }

  const handleAddWithCalculatedArea = () => {
    addMaterial({
      materialId: selectedMaterialId,
      surfaceArea_cm2: Math.round(calculatedSurfaceArea),
      isBaked: false,
      label: isGerman
        ? (chamberShape === 'rectangular' ? 'Kammerwände' : 'Zylinderwände')
        : (chamberShape === 'rectangular' ? 'Chamber walls' : 'Cylinder walls')
    })
  }

  return (
    <div className={`min-h-screen bg-surface-page flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-surface-card shadow-card sticky top-0 z-50 ml-16">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-surface-card-muted transition-colors"
              title={t('common.back', 'Zurück')}
            >
              <svg
                className="w-5 h-5 text-text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>

            <div>
              <h1 className="font-display font-bold text-h2 gradient-text">
                {isGerman ? 'Ausgasungs-Simulator' : 'Outgassing Simulator'}
              </h1>
              <p className="text-caption text-text-secondary">
                {isGerman
                  ? 'Multi-Material Ausgasungsberechnung'
                  : 'Multi-Material Outgassing Calculation'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={reset}
              className="px-4 py-2 text-caption font-medium text-text-secondary hover:text-text-primary
                bg-surface-card-muted hover:bg-surface-card rounded-chip transition-colors"
            >
              {t('common.reset', 'Zurücksetzen')}
            </button>
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1400px] mx-auto px-6 py-6 ml-16">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="rounded-card bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 p-4">
              <h4 className="font-medium text-text-primary mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isGerman ? 'Leck vs. Ausgasung' : 'Leak vs. Outgassing'}
              </h4>
              <p className="text-caption text-text-secondary">
                {isGerman
                  ? 'Dieser Simulator hilft, erwartete Ausgasungsraten zu berechnen und mit gemessenen Druckanstiegen zu vergleichen. Echte Lecks zeigen konstanten Druckanstieg, Ausgasung nimmt mit der Zeit ab.'
                  : 'This simulator helps calculate expected outgassing rates and compare with measured pressure rises. Real leaks show constant pressure rise, outgassing decreases over time.'}
              </p>
            </div>

            {/* Presets */}
            <div className="rounded-card border border-subtle bg-surface-card p-4">
              <h4 className="text-caption font-medium text-text-primary mb-3">
                {isGerman ? 'Kammer-Presets' : 'Chamber Presets'}
              </h4>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(CHAMBER_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => handleLoadPreset(key)}
                    className="px-3 py-1.5 text-caption rounded-chip bg-surface-card-muted hover:bg-violet-500/20
                      text-text-secondary hover:text-violet-500 transition-colors border border-subtle hover:border-violet-500/30"
                  >
                    {isGerman ? preset.name : preset.nameEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Surface Area Calculator */}
            <div className="rounded-card border border-subtle bg-surface-card overflow-hidden">
              <button
                onClick={() => setCalcExpanded(!calcExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between bg-surface-card-muted hover:bg-surface-card-muted/80 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  <h4 className="text-caption font-medium text-text-primary">
                    {isGerman ? 'Oberflächenrechner' : 'Surface Calculator'}
                  </h4>
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
                <div className="p-4 space-y-4 border-t border-subtle">
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
                      {isGerman ? 'Rechteckig' : 'Rectangular'}
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
                      {isGerman ? 'Zylindrisch' : 'Cylindrical'}
                    </button>
                  </div>

                  {/* Dimension Inputs */}
                  {chamberShape === 'rectangular' ? (
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-caption text-text-secondary mb-1">
                          {isGerman ? 'Länge' : 'Length'} (cm)
                        </label>
                        <input
                          type="number"
                          value={dimensions.length}
                          onChange={(e) => setDimensions(d => ({ ...d, length: Math.max(0, parseFloat(e.target.value) || 0) }))}
                          className="w-full px-3 py-2 rounded-lg bg-surface-card-muted border border-subtle
                            text-text-primary text-sm focus:border-violet-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-caption text-text-secondary mb-1">
                          {isGerman ? 'Breite' : 'Width'} (cm)
                        </label>
                        <input
                          type="number"
                          value={dimensions.width}
                          onChange={(e) => setDimensions(d => ({ ...d, width: Math.max(0, parseFloat(e.target.value) || 0) }))}
                          className="w-full px-3 py-2 rounded-lg bg-surface-card-muted border border-subtle
                            text-text-primary text-sm focus:border-violet-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-caption text-text-secondary mb-1">
                          {isGerman ? 'Höhe' : 'Height'} (cm)
                        </label>
                        <input
                          type="number"
                          value={dimensions.height}
                          onChange={(e) => setDimensions(d => ({ ...d, height: Math.max(0, parseFloat(e.target.value) || 0) }))}
                          className="w-full px-3 py-2 rounded-lg bg-surface-card-muted border border-subtle
                            text-text-primary text-sm focus:border-violet-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-caption text-text-secondary mb-1">
                          {isGerman ? 'Durchmesser' : 'Diameter'} (cm)
                        </label>
                        <input
                          type="number"
                          value={dimensions.diameter}
                          onChange={(e) => setDimensions(d => ({ ...d, diameter: Math.max(0, parseFloat(e.target.value) || 0) }))}
                          className="w-full px-3 py-2 rounded-lg bg-surface-card-muted border border-subtle
                            text-text-primary text-sm focus:border-violet-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-caption text-text-secondary mb-1">
                          {isGerman ? 'Länge' : 'Length'} (cm)
                        </label>
                        <input
                          type="number"
                          value={dimensions.cylLength}
                          onChange={(e) => setDimensions(d => ({ ...d, cylLength: Math.max(0, parseFloat(e.target.value) || 0) }))}
                          className="w-full px-3 py-2 rounded-lg bg-surface-card-muted border border-subtle
                            text-text-primary text-sm focus:border-violet-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Result Display */}
                  <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-caption text-text-secondary">
                        {isGerman ? 'Berechnete Oberfläche:' : 'Calculated Surface:'}
                      </span>
                      <span className="font-mono text-lg text-violet-500 font-semibold">
                        {calculatedSurfaceArea.toLocaleString('de-DE', { maximumFractionDigits: 0 })} cm²
                      </span>
                    </div>
                  </div>

                  {/* Material Select + Add Button */}
                  <div className="flex gap-2">
                    <select
                      value={selectedMaterialId}
                      onChange={(e) => setSelectedMaterialId(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-surface-card-muted border border-subtle
                        text-text-primary text-caption focus:border-violet-500 focus:outline-none"
                    >
                      {Object.entries(materialsByCategory).map(([cat, mats]) => (
                        <optgroup key={cat} label={categoryLabels[cat as keyof typeof categoryLabels]}>
                          {mats.map(m => (
                            <option key={m.id} value={m.id}>
                              {isGerman ? m.name : m.nameEn}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <button
                      onClick={handleAddWithCalculatedArea}
                      className="px-4 py-2 rounded-lg bg-violet-500 text-white text-caption font-medium
                        hover:bg-violet-600 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      {isGerman ? 'Hinzufügen' : 'Add'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Chamber Parameters */}
            <div className="rounded-card border border-subtle bg-surface-card p-4">
              <h4 className="text-caption font-medium text-text-primary mb-4">
                {isGerman ? 'Kammer-Parameter' : 'Chamber Parameters'}
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-caption text-text-secondary mb-1">
                    {isGerman ? 'Volumen' : 'Volume'} (L)
                  </label>
                  <input
                    type="number"
                    value={volume}
                    onChange={(e) => setVolume(Math.max(0.1, parseFloat(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-lg bg-surface-card-muted border border-subtle
                      text-text-primary text-sm focus:border-violet-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-caption text-text-secondary mb-1">
                    {isGerman ? 'Saugvermögen' : 'Pump Speed'} (L/s)
                  </label>
                  <input
                    type="number"
                    value={pumpSpeed}
                    onChange={(e) => setPumpSpeed(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-lg bg-surface-card-muted border border-subtle
                      text-text-primary text-sm focus:border-violet-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-caption text-text-secondary mb-1">
                    {isGerman ? 'Pumpzeit' : 'Pump Time'} (h)
                  </label>
                  <input
                    type="number"
                    value={pumpTime}
                    onChange={(e) => setPumpTime(Math.max(0.1, parseFloat(e.target.value) || 1))}
                    step="0.5"
                    className="w-full px-3 py-2 rounded-lg bg-surface-card-muted border border-subtle
                      text-text-primary text-sm focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Materials Table */}
            <div className="rounded-card border border-subtle bg-surface-card overflow-hidden">
              <div className="bg-surface-card-muted px-4 py-3 flex items-center justify-between">
                <h4 className="text-caption font-medium text-text-primary">
                  {isGerman ? 'Materialien' : 'Materials'} ({materials.length})
                </h4>
                <button
                  onClick={handleAddMaterial}
                  className="text-caption text-violet-500 hover:text-violet-400 transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  {isGerman ? 'Hinzufügen' : 'Add'}
                </button>
              </div>

              <div className="divide-y divide-subtle max-h-[400px] overflow-y-auto">
                {materials.map((entry, index) => {
                  const material = getMaterialById(entry.materialId)
                  return (
                    <div key={index} className="p-3 bg-surface-card hover:bg-surface-card-muted/50 transition-colors">
                      <div className="grid grid-cols-12 gap-3 items-center">
                        {/* Material Select */}
                        <div className="col-span-4">
                          <select
                            value={entry.materialId}
                            onChange={(e) => updateMaterial(index, { materialId: e.target.value })}
                            className="w-full px-2 py-1.5 rounded bg-surface-card-muted border border-subtle
                              text-text-primary text-caption focus:border-violet-500 focus:outline-none"
                          >
                            {Object.entries(materialsByCategory).map(([cat, mats]) => (
                              <optgroup key={cat} label={categoryLabels[cat as keyof typeof categoryLabels]}>
                                {mats.map(m => (
                                  <option key={m.id} value={m.id}>
                                    {isGerman ? m.name : m.nameEn}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>

                        {/* Surface Area */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={entry.surfaceArea_cm2}
                              onChange={(e) => updateMaterial(index, { surfaceArea_cm2: Math.max(0, parseFloat(e.target.value) || 0) })}
                              className="w-full px-2 py-1.5 rounded bg-surface-card-muted border border-subtle
                                text-text-primary text-caption focus:border-violet-500 focus:outline-none"
                            />
                            <span className="text-caption text-text-muted whitespace-nowrap">cm²</span>
                          </div>
                        </div>

                        {/* Baked Checkbox */}
                        <div className="col-span-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={entry.isBaked}
                              onChange={(e) => updateMaterial(index, { isBaked: e.target.checked })}
                              disabled={!material?.q1h_baked}
                              className="rounded border-subtle accent-violet-500"
                            />
                            <span className={cn(
                              'text-caption',
                              !material?.q1h_baked ? 'text-text-muted' : 'text-text-secondary'
                            )}>
                              Baked
                            </span>
                          </label>
                        </div>

                        {/* Label */}
                        <div className="col-span-3">
                          <input
                            type="text"
                            value={entry.label || ''}
                            onChange={(e) => updateMaterial(index, { label: e.target.value })}
                            placeholder={isGerman ? 'Bezeichnung' : 'Label'}
                            className="w-full px-2 py-1.5 rounded bg-surface-card-muted border border-subtle
                              text-text-primary text-caption focus:border-violet-500 focus:outline-none"
                          />
                        </div>

                        {/* Remove Button */}
                        <div className="col-span-1 flex justify-end">
                          <button
                            onClick={() => removeMaterial(index)}
                            className="p-1 text-text-muted hover:text-coral-500 transition-colors"
                            title={isGerman ? 'Entfernen' : 'Remove'}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {materials.length === 0 && (
                  <div className="p-8 text-center text-text-muted text-caption">
                    {isGerman ? 'Keine Materialien hinzugefügt' : 'No materials added'}
                  </div>
                )}
              </div>
            </div>

            {/* Calculate Button */}
            <div className="flex justify-center">
              <button
                onClick={calculate}
                disabled={materials.length === 0}
                className={cn(
                  'px-8 py-3 rounded-lg font-medium text-sm transition-all flex items-center gap-2',
                  materials.length === 0
                    ? 'bg-surface-card-muted text-text-muted cursor-not-allowed border border-subtle'
                    : 'bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:shadow-lg hover:scale-[1.02]'
                )}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {isGerman ? 'Berechnen' : 'Calculate'}
              </button>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {results ? (
              <>
                {/* Summary Card */}
                <div className="rounded-card bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 p-6">
                  <h4 className="font-semibold text-text-primary mb-4 text-lg">
                    {isGerman ? 'Berechnungsergebnis' : 'Calculation Results'}
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-surface-card/50 rounded-lg p-4">
                      <p className="text-caption text-text-secondary mb-1">
                        {isGerman ? 'Gaslast gesamt' : 'Total Gas Load'}
                      </p>
                      <p className="font-mono text-2xl text-violet-500">
                        {formatScientific(results.totalGasLoad_mbarLperS)}
                        <span className="text-caption ml-1">mbar·L/s</span>
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-surface-card/50 rounded-lg p-4">
                        <p className="text-caption text-text-secondary mb-1">
                          {isGerman ? 'Gleichgewichtsdruck' : 'Equilibrium Pressure'}
                        </p>
                        <p className="font-mono text-xl text-violet-500">
                          {formatScientific(results.equilibriumPressure_mbar)}
                          <span className="text-caption ml-1">mbar</span>
                        </p>
                      </div>
                      <div className="bg-surface-card/50 rounded-lg p-4">
                        <p className="text-caption text-text-secondary mb-1">
                          {isGerman ? 'Druckanstieg' : 'Pressure Rise'}
                        </p>
                        <p className="font-mono text-xl text-violet-500">
                          {formatScientific(results.pressureRise_mbarPerHour)}
                          <span className="text-caption ml-1">mbar/h</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Material Breakdown */}
                <div className="rounded-card border border-subtle bg-surface-card overflow-hidden">
                  <div className="bg-surface-card-muted px-4 py-3">
                    <h4 className="text-caption font-medium text-text-primary">
                      {isGerman ? 'Beitrag nach Material' : 'Contribution by Material'}
                    </h4>
                  </div>
                  <div className="p-4 space-y-4">
                    {results.materials.map((result, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between text-caption mb-1">
                          <span className="text-text-primary font-medium">
                            {materials.find(m => m.materialId === result.materialId)?.label || result.materialName}
                          </span>
                          <span className="text-text-secondary font-mono">
                            {formatScientific(result.gasLoad_mbarLperS)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-3 bg-surface-card-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                result.percentage > 50 ? 'bg-coral-500' :
                                result.percentage > 20 ? 'bg-amber-500' :
                                'bg-violet-500'
                              )}
                              style={{ width: `${Math.min(100, result.percentage)}%` }}
                            />
                          </div>
                          <span className={cn(
                            'text-caption font-mono min-w-[50px] text-right',
                            result.percentage > 50 ? 'text-coral-500' :
                            result.percentage > 20 ? 'text-amber-500' :
                            'text-text-secondary'
                          )}>
                            {result.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                {results.recommendations.length > 0 && (
                  <div className="rounded-card border border-amber-500/30 bg-amber-500/5 p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-amber-500 mt-0.5">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="text-caption font-medium text-amber-600 mb-2">
                          {isGerman ? 'Empfehlungen' : 'Recommendations'}
                        </h5>
                        <ul className="text-caption text-text-secondary space-y-1">
                          {(isGerman ? results.recommendations : results.recommendationsEn).map((rec, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-amber-500">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Integration Hint */}
                <div className="rounded-card border border-subtle bg-surface-card p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-aqua-500 mt-0.5">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <div>
                      <h5 className="text-caption font-medium text-text-primary mb-1">
                        {isGerman ? 'Integration mit anderen Analysen' : 'Integration with Other Analyses'}
                      </h5>
                      <p className="text-caption text-text-secondary">
                        {isGerman
                          ? 'Diese Ergebnisse werden automatisch in Rate-of-Rise und RGA-Diagnose verwendet, um Ausgasung von Lecks zu unterscheiden.'
                          : 'These results are automatically used in Rate-of-Rise and RGA diagnosis to distinguish outgassing from leaks.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Physics Explanation */}
                <div className="rounded-card border border-subtle bg-surface-card p-4">
                  <h5 className="text-caption font-medium text-text-primary mb-3">
                    {isGerman ? 'Physikalische Grundlage' : 'Physical Basis'}
                  </h5>
                  <div className="text-caption text-text-secondary space-y-2">
                    <p>
                      <strong>{isGerman ? 'Formel:' : 'Formula:'}</strong>{' '}
                      <span className="font-mono">q(t) = q₁ × (t₁/t)ⁿ</span>
                    </p>
                    <p>
                      {isGerman
                        ? 'Exponent n ≈ 0.5-0.7 für Polymere, n ≈ 1.0 für Metalle'
                        : 'Exponent n ≈ 0.5-0.7 for polymers, n ≈ 1.0 for metals'}
                    </p>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="p-3 bg-coral-500/10 border border-coral-500/20 rounded-lg">
                        <span className="font-medium text-coral-500">
                          {isGerman ? 'Leck' : 'Leak'}
                        </span>
                        <p className="text-xs mt-1">dp/dt = {isGerman ? 'konstant' : 'constant'}</p>
                      </div>
                      <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                        <span className="font-medium text-violet-500">
                          {isGerman ? 'Ausgasung' : 'Outgassing'}
                        </span>
                        <p className="text-xs mt-1">dp/dt ~ 1/t</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-card border border-subtle bg-surface-card p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-card-muted flex items-center justify-center">
                  <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="font-medium text-text-primary mb-2">
                  {isGerman ? 'Keine Berechnung' : 'No Calculation'}
                </h4>
                <p className="text-caption text-text-secondary">
                  {isGerman
                    ? 'Fügen Sie Materialien hinzu, um die Ausgasungsberechnung zu starten.'
                    : 'Add materials to start the outgassing calculation.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer className="ml-16" />

      {/* Navigation Sidebar */}
      <ActionsSidebar minimal />
    </div>
  )
}

export default OutgassingPage
