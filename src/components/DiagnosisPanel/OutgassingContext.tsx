/**
 * Outgassing Context Component
 * Shows outgassing context when relevant to RGA diagnosis
 */

import { useTranslation } from 'react-i18next'
import { useOutgassingStore } from '@/store/useOutgassingStore'
import { formatScientific, OUTGASSING_MATERIALS } from '@/lib/knowledge/outgassingRates'
import type { DiagnosticResultSummary } from '@/types/rga'

interface OutgassingContextProps {
  diagnostics: DiagnosticResultSummary[]
}

export function OutgassingContext({ diagnostics }: OutgassingContextProps) {
  const { i18n } = useTranslation()
  const isGerman = i18n.language === 'de'
  const { results, volume, pumpTime, lastCalculated } = useOutgassingStore()

  // Only show if user has calculated outgassing
  if (!results || !lastCalculated) {
    return null
  }

  // Check if any water/moisture-related diagnoses exist
  const waterRelatedTypes = ['excessive_water', 'air_leak', 'air_intrusion', 'high_moisture', 'moisture_contamination']
  const hasWaterDiagnosis = diagnostics.some(d =>
    waterRelatedTypes.includes(d.type) ||
    d.affectedMasses.includes(18) ||
    d.affectedMasses.includes(17)
  )

  // Check if there's contamination diagnosis
  const contaminationTypes = ['organic_contamination', 'pump_oil', 'hydrocarbon_contamination']
  const hasContaminationDiagnosis = diagnostics.some(d => contaminationTypes.includes(d.type))

  // Don't show if no relevant diagnostics
  if (!hasWaterDiagnosis && !hasContaminationDiagnosis) {
    return null
  }

  // Find materials with H2O outgassing
  const h2oMaterials = results.materials.filter(m => {
    const materialDef = OUTGASSING_MATERIALS.find(mat => mat.id === m.materialId)
    return materialDef?.dominantSpecies.includes('H2O')
  })

  // Calculate approximate pressure from outgassing
  const expectedPressure_mbar = results.equilibriumPressure_mbar

  return (
    <div className="mx-4 mb-4 p-4 rounded-chip bg-violet-500/5 border border-violet-500/20">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-caption font-semibold text-violet-600 dark:text-violet-400 mb-2">
            {isGerman ? 'Ausgasungs-Kontext' : 'Outgassing Context'}
          </h4>

          <p className="text-caption text-text-secondary mb-3">
            {isGerman
              ? 'Basierend auf Ihren Simulator-Einstellungen:'
              : 'Based on your simulator settings:'}
          </p>

          {/* Outgassing Details */}
          <div className="space-y-2 text-micro">
            <div className="flex justify-between">
              <span className="text-text-muted">
                {isGerman ? 'Erwartete Gaslast:' : 'Expected gas load:'}
              </span>
              <span className="text-text-primary font-medium">
                {formatScientific(results.totalGasLoad_mbarLperS, 2)} mbar·L/s
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-text-muted">
                {isGerman ? 'Gleichgewichtsdruck:' : 'Equilibrium pressure:'}
              </span>
              <span className="text-text-primary font-medium">
                {formatScientific(expectedPressure_mbar, 2)} mbar
              </span>
            </div>

            {/* H2O specific if water diagnosis */}
            {hasWaterDiagnosis && h2oMaterials.length > 0 && (
              <div className="pt-2 mt-2 border-t border-violet-500/10">
                <span className="text-text-muted">
                  {isGerman ? 'H₂O-Quellen:' : 'H₂O sources:'}
                </span>
                <div className="mt-1 space-y-1">
                  {h2oMaterials.slice(0, 3).map((m) => {
                    const materialDef = OUTGASSING_MATERIALS.find(mat => mat.id === m.materialId)
                    const name = isGerman ? materialDef?.name : materialDef?.nameEn
                    return (
                      <div key={m.materialId} className="flex justify-between">
                        <span className="text-text-secondary">{name || m.materialName}</span>
                        <span className="text-violet-500">{m.percentage.toFixed(1)}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Interpretation */}
          <div className="mt-3 p-2 rounded bg-violet-500/5">
            <p className="text-micro text-text-secondary">
              {hasWaterDiagnosis && (
                isGerman
                  ? `Bei V=${volume}L und t=${pumpTime}h Pumpzeit ist Wasser-Ausgasung von Oberflächen normal. Elastomer-Dichtungen sind oft die Hauptquelle.`
                  : `At V=${volume}L and t=${pumpTime}h pump time, water outgassing from surfaces is normal. Elastomer seals are often the main source.`
              )}
              {hasContaminationDiagnosis && !hasWaterDiagnosis && (
                isGerman
                  ? 'Organische Kontamination kann von Elastomeren oder unzureichender Reinigung stammen.'
                  : 'Organic contamination may originate from elastomers or insufficient cleaning.'
              )}
            </p>
          </div>

          {/* Parameters info */}
          <p className="mt-2 text-micro text-text-muted">
            {isGerman ? 'Simulator:' : 'Simulator:'} V = {volume} L, t = {pumpTime} h,
            {' '}{results.materials.length} {isGerman ? 'Materialien' : 'materials'}
          </p>
        </div>
      </div>
    </div>
  )
}
