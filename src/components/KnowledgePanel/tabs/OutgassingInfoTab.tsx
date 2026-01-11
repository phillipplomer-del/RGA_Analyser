/**
 * OutgassingInfoTab - Outgassing Materials Database
 *
 * Displays:
 * - Outgassing rates for metals, elastomers, and ceramics
 * - Physical principles (q(t) formula)
 * - Link to outgassing simulator
 * - Comparison between leak and outgassing behavior
 */

import { cn } from '@/lib/utils/cn'
import { OUTGASSING_MATERIALS } from '@/lib/knowledge/outgassingRates'
import { KNOWLEDGE_PANEL_STYLES as KPS } from '../lib/designTokens'

interface OutgassingInfoTabProps {
  isGerman: boolean
  onShowOutgassing?: () => void
}

export function OutgassingInfoTab({ isGerman, onShowOutgassing }: OutgassingInfoTabProps) {
  // Group materials by category
  const metalMaterials = OUTGASSING_MATERIALS.filter(m => m.category === 'metal')
  const elastomerMaterials = OUTGASSING_MATERIALS.filter(m => m.category === 'elastomer')
  const ceramicMaterials = OUTGASSING_MATERIALS.filter(m => m.category === 'ceramic')

  const formatRate = (rate: number) => {
    if (rate === 0) return '-'
    const exp = Math.floor(Math.log10(rate))
    const mantissa = rate / Math.pow(10, exp)
    return `${mantissa.toFixed(1)}×10${exp < 0 ? '⁻' : ''}${Math.abs(exp).toString().split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[parseInt(d)]).join('')}`
  }

  return (
    <div className={KPS.spacing.sectionGap}>
      {/* Header with link to simulator */}
      <div className={cn(KPS.cards.gradient, 'bg-aqua-500/10 border-aqua-500/30')}>
        <div className={cn(KPS.layout.flexBetween, 'items-start gap-4')}>
          <div>
            <h3 className={cn(KPS.typography.cardTitle, 'text-lg text-aqua-400')}>
              {isGerman ? 'Ausgasungs-Simulator' : 'Outgassing Simulator'}
            </h3>
            <p className={cn(KPS.typography.caption, 'mt-1')}>
              {isGerman
                ? 'Berechnet erwartete Ausgasungsraten für Multi-Material-Systeme. Unterscheidet Leck von Ausgasung.'
                : 'Calculates expected outgassing rates for multi-material systems. Distinguishes leak from outgassing.'}
            </p>
          </div>
          {onShowOutgassing && (
            <button
              onClick={onShowOutgassing}
              className={cn(
                'shrink-0 px-4 py-2 bg-aqua-500 text-white rounded-lg hover:bg-aqua-600 transition-colors text-sm font-medium'
              )}
            >
              {isGerman ? '→ Zum Simulator' : '→ Open Simulator'}
            </button>
          )}
        </div>
      </div>

      {/* Physics explanation */}
      <div>
        <h4 className={cn(KPS.typography.sectionTitle)}>
          {isGerman ? 'Physikalische Grundlagen' : 'Physical Principles'}
        </h4>
        <div className={cn(KPS.cards.muted, 'rounded-lg p-3', KPS.spacing.itemGapSmall)}>
          <p className={cn(KPS.typography.mono, 'text-aqua-400')}>q(t) = q₁ × (t₁/t)ⁿ</p>
          <ul className={cn(KPS.typography.caption, KPS.spacing.itemGapSmall, 'ml-4')}>
            <li>• q₁ = {isGerman ? 'Ausgasungsrate nach Referenzzeit t₁' : 'Outgassing rate after reference time t₁'}</li>
            <li>• n ≈ 1.0 {isGerman ? 'für Metalle' : 'for metals'}, n ≈ 0.5-0.7 {isGerman ? 'für Polymere' : 'for polymers'}</li>
          </ul>
          <div className={cn(KPS.borders.subtleDivider, 'pt-2 mt-2')}>
            <p className={KPS.typography.caption}>
              <span className="text-yellow-400">⚠️</span> {isGerman
                ? 'Viton dominiert oft die Ausgasung, obwohl es nur 0.7% der Oberfläche ausmacht!'
                : 'Viton often dominates outgassing despite being only 0.7% of surface area!'}
            </p>
          </div>
        </div>
      </div>

      {/* Materials Database */}
      <div>
        <h4 className={cn(KPS.typography.sectionTitle)}>
          {isGerman ? 'Materialien-Datenbank' : 'Materials Database'} ({OUTGASSING_MATERIALS.length})
        </h4>

        {/* Metals */}
        <div className="mb-4">
          <h5 className={cn(KPS.typography.subTitle, 'uppercase tracking-wide mb-2')}>
            {isGerman ? 'Metalle' : 'Metals'}
          </h5>
          <div className="overflow-x-auto">
            <table className={cn(KPS.tables.table, 'text-xs')}>
              <thead>
                <tr className={cn(KPS.tables.headerRow, 'text-text-secondary')}>
                  <th className={cn(KPS.tables.headerCell)}>{isGerman ? 'Material' : 'Material'}</th>
                  <th className={cn(KPS.tables.headerCell)}>q₁ₕ</th>
                  <th className={cn(KPS.tables.headerCell)}>q₁₀ₕ</th>
                  <th className={cn(KPS.tables.headerCell)}>{isGerman ? 'Bakeout' : 'Bakeout'}</th>
                </tr>
              </thead>
              <tbody>
                {metalMaterials.map(m => (
                  <tr key={m.id} className={KPS.tables.row}>
                    <td className={cn(KPS.tables.cell, 'text-text-primary')}>{isGerman ? m.name : m.nameEn}</td>
                    <td className={cn(KPS.tables.cell, KPS.typography.mono, 'text-aqua-400')}>{formatRate(m.q1h_unbaked)}</td>
                    <td className={cn(KPS.tables.cell, KPS.typography.mono)}>{formatRate(m.q10h_unbaked)}</td>
                    <td className={cn(KPS.tables.cell)}>{m.bakeoutTemp ? `${m.bakeoutTemp}°C` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Elastomers */}
        <div className="mb-4">
          <h5 className={cn(KPS.typography.subTitle, 'uppercase tracking-wide mb-2')}>
            {isGerman ? 'Elastomere' : 'Elastomers'}
          </h5>
          <div className="overflow-x-auto">
            <table className={cn(KPS.tables.table, 'text-xs')}>
              <thead>
                <tr className={cn(KPS.tables.headerRow, 'text-text-secondary')}>
                  <th className={cn(KPS.tables.headerCell)}>{isGerman ? 'Material' : 'Material'}</th>
                  <th className={cn(KPS.tables.headerCell)}>q₁ₕ</th>
                  <th className={cn(KPS.tables.headerCell)}>q₁₀ₕ</th>
                  <th className={cn(KPS.tables.headerCell)}>{isGerman ? 'Bakeout' : 'Bakeout'}</th>
                </tr>
              </thead>
              <tbody>
                {elastomerMaterials.map(m => (
                  <tr key={m.id} className={KPS.tables.row}>
                    <td className={cn(KPS.tables.cell, 'text-text-primary')}>{isGerman ? m.name : m.nameEn}</td>
                    <td className={cn(KPS.tables.cell, KPS.typography.mono, 'text-yellow-400')}>{formatRate(m.q1h_unbaked)}</td>
                    <td className={cn(KPS.tables.cell, KPS.typography.mono)}>{formatRate(m.q10h_unbaked)}</td>
                    <td className={cn(KPS.tables.cell)}>{m.bakeoutTemp ? `${m.bakeoutTemp}°C` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ceramics */}
        <div>
          <h5 className={cn(KPS.typography.subTitle, 'uppercase tracking-wide mb-2')}>
            {isGerman ? 'Keramik' : 'Ceramics'}
          </h5>
          <div className="overflow-x-auto">
            <table className={cn(KPS.tables.table, 'text-xs')}>
              <thead>
                <tr className={cn(KPS.tables.headerRow, 'text-text-secondary')}>
                  <th className={cn(KPS.tables.headerCell)}>{isGerman ? 'Material' : 'Material'}</th>
                  <th className={cn(KPS.tables.headerCell)}>q₁ₕ</th>
                  <th className={cn(KPS.tables.headerCell)}>q₁₀ₕ</th>
                  <th className={cn(KPS.tables.headerCell)}>{isGerman ? 'Bakeout' : 'Bakeout'}</th>
                </tr>
              </thead>
              <tbody>
                {ceramicMaterials.map(m => (
                  <tr key={m.id} className={KPS.tables.row}>
                    <td className={cn(KPS.tables.cell, 'text-text-primary')}>{isGerman ? m.name : m.nameEn}</td>
                    <td className={cn(KPS.tables.cell, KPS.typography.mono, 'text-green-400')}>{formatRate(m.q1h_unbaked)}</td>
                    <td className={cn(KPS.tables.cell, KPS.typography.mono)}>{formatRate(m.q10h_unbaked)}</td>
                    <td className={cn(KPS.tables.cell)}>{m.bakeoutTemp ? `${m.bakeoutTemp}°C` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className={cn(KPS.typography.micro, 'text-text-tertiary mt-3')}>
          {isGerman
            ? 'Einheit: mbar·l/(s·cm²). Quellen: VACOM, CERN, de Csernatony'
            : 'Unit: mbar·l/(s·cm²). Sources: VACOM, CERN, de Csernatony'}
        </p>
      </div>

      {/* Comparison: Leak vs Outgassing */}
      <div>
        <h4 className={cn(KPS.typography.sectionTitle)}>
          {isGerman ? 'Leck vs. Ausgasung unterscheiden' : 'Distinguishing Leak vs. Outgassing'}
        </h4>
        <div className={cn(KPS.layout.gridWide, 'text-xs')}>
          <div className={cn(KPS.cards.mutedPadded, 'bg-red-500/10 border border-red-500/30 rounded-lg')}>
            <h5 className={cn('font-semibold text-red-400 mb-1')}>{isGerman ? 'Reales Leck' : 'Real Leak'}</h5>
            <ul className={cn(KPS.typography.caption, KPS.spacing.itemGapSmall)}>
              <li>• dp/dt = {isGerman ? 'konstant' : 'constant'}</li>
              <li>• {isGerman ? 'Linearer Druckanstieg' : 'Linear pressure rise'}</li>
              <li>• He-Lecktest: {isGerman ? 'positiv' : 'positive'}</li>
            </ul>
          </div>
          <div className={cn(KPS.cards.mutedPadded, 'bg-blue-500/10 border border-blue-500/30 rounded-lg')}>
            <h5 className={cn('font-semibold text-blue-400 mb-1')}>{isGerman ? 'Ausgasung' : 'Outgassing'}</h5>
            <ul className={cn(KPS.typography.caption, KPS.spacing.itemGapSmall)}>
              <li>• dp/dt ~ 1/t</li>
              <li>• {isGerman ? 'Abnehmender Druckanstieg' : 'Decreasing pressure rise'}</li>
              <li>• He-Lecktest: {isGerman ? 'negativ' : 'negative'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
