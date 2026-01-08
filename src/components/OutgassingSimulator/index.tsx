/**
 * Outgassing Simulator
 * Multi-material outgassing calculation for vacuum systems
 *
 * Problem: Users confuse outgassing with leaks
 * Solution: Visual calculator showing material contributions
 *
 * Uses global store so results are available to Rate-of-Rise and RGA diagnosis
 */

import { useMemo, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'
import { useOutgassingStore } from '@/store/useOutgassingStore'
import {
  OUTGASSING_MATERIALS,
  CHAMBER_PRESETS,
  getMaterialById,
  formatScientific,
  type OutgassingMaterial
} from '@/lib/knowledge/outgassingRates'

interface OutgassingSimulatorProps {
  isGerman: boolean
}

export function OutgassingSimulator({ isGerman }: OutgassingSimulatorProps) {
  // Use global store for shared state
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
    calculate
  } = useOutgassingStore()

  // Calculate on mount if materials exist but no results
  useEffect(() => {
    if (materials.length > 0 && !results) {
      calculate()
    }
  }, [materials, results, calculate])

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

  const handleLoadPreset = (presetKey: string) => {
    const preset = CHAMBER_PRESETS[presetKey]
    if (!preset) return
    loadPreset(preset.volume_liters, preset.pumpingSpeed_Lpers, preset.materials)
  }

  const handleAddMaterial = () => {
    addMaterial({ materialId: 'ss304-cleaned', surfaceArea_cm2: 100, isBaked: false })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-display font-semibold text-lg text-text-primary mb-1">
          {isGerman ? 'Ausgasungs-Simulator' : 'Outgassing Simulator'}
        </h3>
        <p className="text-caption text-text-secondary">
          {isGerman
            ? 'Berechnet erwartete Ausgasungsraten für Multi-Material-Systeme'
            : 'Calculates expected outgassing rates for multi-material systems'}
        </p>
      </div>

      {/* Presets */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-caption text-text-secondary py-1">
          {isGerman ? 'Presets:' : 'Presets:'}
        </span>
        {Object.entries(CHAMBER_PRESETS).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => handleLoadPreset(key)}
            className="px-2 py-1 text-caption rounded-chip bg-surface-card-muted hover:bg-aqua-500/20
              text-text-secondary hover:text-aqua-500 transition-colors"
          >
            {isGerman ? preset.name : preset.nameEn}
          </button>
        ))}
      </div>

      {/* Chamber Parameters */}
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
              text-text-primary text-sm focus:border-aqua-500 focus:outline-none"
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
              text-text-primary text-sm focus:border-aqua-500 focus:outline-none"
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
              text-text-primary text-sm focus:border-aqua-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Materials Table */}
      <div className="rounded-card border border-subtle overflow-hidden">
        <div className="bg-surface-card-muted px-4 py-2 flex items-center justify-between">
          <h4 className="text-caption font-medium text-text-primary">
            {isGerman ? 'Materialien' : 'Materials'}
          </h4>
          <button
            onClick={handleAddMaterial}
            className="text-caption text-aqua-500 hover:text-aqua-400 transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            {isGerman ? 'Hinzufügen' : 'Add'}
          </button>
        </div>

        <div className="divide-y divide-subtle">
          {materials.map((entry, index) => {
            const material = getMaterialById(entry.materialId)
            return (
              <div key={index} className="p-3 bg-surface-card">
                <div className="grid grid-cols-12 gap-3 items-center">
                  {/* Material Select */}
                  <div className="col-span-4">
                    <select
                      value={entry.materialId}
                      onChange={(e) => updateMaterial(index, { materialId: e.target.value })}
                      className="w-full px-2 py-1.5 rounded bg-surface-card-muted border border-subtle
                        text-text-primary text-caption focus:border-aqua-500 focus:outline-none"
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
                          text-text-primary text-caption focus:border-aqua-500 focus:outline-none"
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
                        className="rounded border-subtle"
                      />
                      <span className={cn(
                        'text-caption',
                        !material?.q1h_baked ? 'text-text-muted' : 'text-text-secondary'
                      )}>
                        {isGerman ? 'Baked' : 'Baked'}
                        {material?.bakeoutTemp && ` (${material.bakeoutTemp}°C)`}
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
                        text-text-primary text-caption focus:border-aqua-500 focus:outline-none"
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
        </div>
      </div>

      {/* Calculate Button */}
      <div className="flex justify-center">
        <button
          onClick={calculate}
          disabled={materials.length === 0}
          className={cn(
            'px-6 py-3 rounded-lg font-medium text-sm transition-all flex items-center gap-2',
            materials.length === 0
              ? 'bg-surface-card-muted text-text-muted cursor-not-allowed'
              : 'bg-gradient-to-r from-aqua-500 to-mint-500 text-white hover:shadow-lg hover:scale-[1.02]'
          )}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          {isGerman ? 'Berechnen' : 'Calculate'}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          {/* Summary Card */}
          <div className="rounded-card bg-gradient-to-br from-aqua-500/10 to-mint-500/10 border border-aqua-500/20 p-4">
            <h4 className="font-medium text-text-primary mb-3">
              {isGerman ? 'Ergebnis' : 'Results'}
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-caption text-text-secondary">
                  {isGerman ? 'Gaslast gesamt' : 'Total Gas Load'}
                </p>
                <p className="font-mono text-lg text-aqua-500">
                  {formatScientific(results.totalGasLoad_mbarLperS)} <span className="text-caption">mbar·L/s</span>
                </p>
              </div>
              <div>
                <p className="text-caption text-text-secondary">
                  {isGerman ? 'Gleichgewichtsdruck' : 'Equilibrium Pressure'}
                </p>
                <p className="font-mono text-lg text-aqua-500">
                  {formatScientific(results.equilibriumPressure_mbar)} <span className="text-caption">mbar</span>
                </p>
              </div>
              <div>
                <p className="text-caption text-text-secondary">
                  {isGerman ? 'Druckanstieg' : 'Pressure Rise'}
                </p>
                <p className="font-mono text-lg text-aqua-500">
                  {formatScientific(results.pressureRise_mbarPerHour)} <span className="text-caption">mbar/h</span>
                </p>
              </div>
            </div>
          </div>

          {/* Material Breakdown */}
          <div className="rounded-card border border-subtle overflow-hidden">
            <div className="bg-surface-card-muted px-4 py-2">
              <h4 className="text-caption font-medium text-text-primary">
                {isGerman ? 'Beitrag nach Material' : 'Contribution by Material'}
              </h4>
            </div>
            <div className="p-4 space-y-3">
              {results.materials.map((result, index) => (
                <div key={index} className="flex items-center gap-3">
                  {/* Bar */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-caption mb-1">
                      <span className="text-text-primary">
                        {materials[index]?.label || result.materialName}
                      </span>
                      <span className="text-text-secondary">
                        {result.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-surface-card-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          result.percentage > 50 ? 'bg-coral-500' :
                          result.percentage > 20 ? 'bg-amber-500' :
                          'bg-aqua-500'
                        )}
                        style={{ width: `${Math.min(100, result.percentage)}%` }}
                      />
                    </div>
                  </div>
                  {/* Value */}
                  <div className="text-right min-w-[120px]">
                    <span className="font-mono text-caption text-text-secondary">
                      {formatScientific(result.gasLoad_mbarLperS)}
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h5 className="text-caption font-medium text-amber-500 mb-1">
                    {isGerman ? 'Empfehlungen' : 'Recommendations'}
                  </h5>
                  <ul className="text-caption text-text-secondary space-y-1">
                    {(isGerman ? results.recommendations : results.recommendationsEn).map((rec, i) => (
                      <li key={i}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Integration Note */}
          <div className="rounded-card border border-aqua-500/30 bg-aqua-500/5 p-4">
            <div className="flex items-start gap-3">
              <div className="text-aqua-500 mt-0.5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div>
                <h5 className="text-caption font-medium text-aqua-500 mb-1">
                  {isGerman ? 'Mit anderen Analysen verknüpft' : 'Linked to Other Analyses'}
                </h5>
                <p className="text-caption text-text-secondary">
                  {isGerman
                    ? 'Diese Werte werden in Rate-of-Rise und RGA-Diagnose verwendet.'
                    : 'These values are used in Rate-of-Rise and RGA diagnosis.'}
                </p>
              </div>
            </div>
          </div>

          {/* Physics Explanation */}
          <div className="rounded-card border border-subtle bg-surface-card p-4">
            <h5 className="text-caption font-medium text-text-primary mb-2">
              {isGerman ? 'Physikalische Grundlage' : 'Physical Basis'}
            </h5>
            <div className="text-caption text-text-secondary space-y-2">
              <p>
                <strong>{isGerman ? 'Zeitverhalten:' : 'Time behavior:'}</strong>{' '}
                q(t) = q₁ × (t₁/t)ⁿ
              </p>
              <p>
                {isGerman
                  ? 'Ausgasung nimmt mit der Zeit ab (n ≈ 0.5-1.0), während ein echtes Leck konstant bleibt.'
                  : 'Outgassing decreases with time (n ≈ 0.5-1.0), while a real leak remains constant.'}
              </p>
              <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
                <div className="p-2 bg-surface-card-muted rounded">
                  <span className="text-coral-500">{isGerman ? 'Leck' : 'Leak'}:</span> dp/dt = {isGerman ? 'konstant' : 'constant'}
                </div>
                <div className="p-2 bg-surface-card-muted rounded">
                  <span className="text-aqua-500">{isGerman ? 'Ausgasung' : 'Outgassing'}:</span> dp/dt ~ 1/t
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OutgassingSimulator
