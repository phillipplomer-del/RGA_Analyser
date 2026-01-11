/**
 * MassesTab - Mass Reference Library
 *
 * Displays:
 * - Complete m/z reference with primary assignments
 * - Critical and important masses highlighted
 * - Possible sources and fragments for each mass
 * - Newly added masses for semiconductor processes
 */

import { cn } from '@/lib/utils/cn'
import { MASS_REFERENCE } from '@/lib/knowledge/massReference'
import { KNOWLEDGE_PANEL_STYLES as KPS } from '../lib/designTokens'

interface MassesTabProps {
  isGerman: boolean
  expandedMass: number | null
  setExpandedMass: (mass: number | null) => void
}

export function MassesTab({ isGerman, expandedMass, setExpandedMass }: MassesTabProps) {
  const criticalMasses = MASS_REFERENCE.filter(m => m.diagnosticValue === 'critical')
  const importantMasses = MASS_REFERENCE.filter(m => m.diagnosticValue === 'important')

  const getDiagnosticColor = (value: string) => {
    switch (value) {
      case 'critical': return 'bg-state-danger/10 text-state-danger'
      case 'important': return 'bg-state-warning/10 text-state-warning'
      default: return 'bg-bg-secondary text-text-secondary'
    }
  }

  return (
    <div className={KPS.spacing.sectionGap}>
      {/* Introduction */}
      <div className={cn(KPS.cards.gradient, KPS.colors.intro)}>
        <h3 className={cn(KPS.typography.cardTitle, 'text-aqua-600 dark:text-aqua-400 mb-2')}>
          {isGerman ? 'Massenreferenz' : 'Mass Reference'}
        </h3>
        <p className={cn(KPS.typography.caption, 'leading-relaxed mb-2')}>
          {isGerman
            ? 'Diese Referenz ordnet m/z-Werten mögliche Gase und Fragmente zu. Die diagnostische Bedeutung (kritisch/wichtig) basiert auf der Relevanz für typische Vakuumprobleme. Kritische Massen erfordern bei Auffälligkeit sofortige Aufmerksamkeit.'
            : 'This reference maps m/z values to possible gases and fragments. The diagnostic significance (critical/important) is based on relevance for typical vacuum problems. Critical masses require immediate attention when anomalies are detected.'}
        </p>
        <div className={cn(KPS.layout.flex, 'text-caption flex-wrap')}>
          <span className={KPS.typography.captionMuted}>
            {isGerman ? `${MASS_REFERENCE.length} Massen` : `${MASS_REFERENCE.length} masses`}
          </span>
          <span className={KPS.typography.captionMuted}>•</span>
          <span className="text-state-danger">{criticalMasses.length} {isGerman ? 'kritisch' : 'critical'}</span>
          <span className={KPS.typography.captionMuted}>•</span>
          <span className="text-state-warning">{importantMasses.length} {isGerman ? 'wichtig' : 'important'}</span>
        </div>
      </div>

      {/* Newly Added Masses */}
      <div className={cn(KPS.cards.gradient, KPS.colors.highlight)}>
        <div className={cn(KPS.layout.flex, 'mb-2')}>
          <span className="text-xl">✨</span>
          <h3 className="font-semibold text-mint-600 dark:text-mint-400">
            {isGerman ? 'Neu hinzugefügt (Jan 2026)' : 'Newly Added (Jan 2026)'}
          </h3>
        </div>
        <p className={cn(KPS.typography.caption, 'mb-3')}>
          {isGerman
            ? 'Erweiterte Massenreferenz für Halbleiter-Prozesse und Weichmacher-Detektion'
            : 'Extended mass reference for semiconductor processes and plasticizer detection'}
        </p>
        <div className={KPS.layout.gridWide}>
          {[
            { mass: 52, assignment: 'Cr⁺', desc: 'Chrom (Edelstahl)', descEn: 'Chromium (Stainless Steel)' },
            { mass: 119, assignment: 'SnH⁺', desc: 'Zinn-Hydrid', descEn: 'Tin Hydride' },
            { mass: 127, assignment: 'I⁺', desc: 'Iod', descEn: 'Iodine' },
            { mass: 149, assignment: 'C₈H₅O₃⁺', desc: 'Phthalat (Weichmacher!)', descEn: 'Phthalate (Plasticizer!)' }
          ].map(m => (
            <button
              key={m.mass}
              onClick={() => setExpandedMass(expandedMass === m.mass ? null : m.mass)}
              className={cn(
                KPS.layout.flexBetween,
                'p-2 bg-mint-500/10 hover:bg-mint-500/20 rounded-lg transition-colors'
              )}
            >
              <div className={KPS.layout.flex}>
                <span className={cn(KPS.typography.mono, 'text-mint-600 dark:text-mint-400 font-medium')}>m/z {m.mass}</span>
                <span className={KPS.typography.caption}>{m.assignment}</span>
              </div>
              <span className={KPS.typography.micro}>{isGerman ? m.desc : m.descEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Critical Masses */}
      <section>
        <h4 className={cn(KPS.typography.subTitle, 'text-state-danger mb-2')}>
          {isGerman ? 'Kritische Massen' : 'Critical Masses'} ({criticalMasses.length})
        </h4>
        <div className="flex flex-wrap gap-1">
          {criticalMasses.map(m => (
            <button
              key={m.mass}
              onClick={() => setExpandedMass(expandedMass === m.mass ? null : m.mass)}
              className={cn(
                'px-2 py-1 rounded text-caption font-mono transition-colors',
                expandedMass === m.mass
                  ? 'bg-state-danger text-white'
                  : 'bg-state-danger/10 text-state-danger hover:bg-state-danger/20'
              )}
            >
              {m.mass}
            </button>
          ))}
        </div>
      </section>

      {/* Important Masses */}
      <section>
        <h4 className={cn(KPS.typography.subTitle, 'text-state-warning mb-2')}>
          {isGerman ? 'Wichtige Massen' : 'Important Masses'} ({importantMasses.length})
        </h4>
        <div className="flex flex-wrap gap-1">
          {importantMasses.map(m => (
            <button
              key={m.mass}
              onClick={() => setExpandedMass(expandedMass === m.mass ? null : m.mass)}
              className={cn(
                'px-2 py-1 rounded text-caption font-mono transition-colors',
                expandedMass === m.mass
                  ? 'bg-state-warning text-white'
                  : 'bg-state-warning/10 text-state-warning hover:bg-state-warning/20'
              )}
            >
              {m.mass}
            </button>
          ))}
        </div>
      </section>

      {/* Expanded Mass Details */}
      {expandedMass && (
        <div className={cn(KPS.cards.mutedPadded, 'mt-4')}>
          {(() => {
            const mass = MASS_REFERENCE.find(m => m.mass === expandedMass)
            if (!mass) return null
            return (
              <>
                <div className={cn(KPS.layout.flex, 'mb-2')}>
                  <span className={cn(KPS.typography.mono, 'text-h3 text-aqua-500')}>m/z {mass.mass}</span>
                  <span className={cn('px-2 py-0.5 rounded-full text-micro', getDiagnosticColor(mass.diagnosticValue))}>
                    {mass.diagnosticValue}
                  </span>
                </div>
                <div className={KPS.spacing.itemGapSmall}>
                  <div>
                    <span className={cn(KPS.typography.micro, 'block')}>
                      {isGerman ? 'Primäre Zuordnung' : 'Primary Assignment'}
                    </span>
                    <span className="font-medium">{mass.primaryAssignment}</span>
                  </div>
                  {mass.possibleSources.length > 0 && (
                    <div>
                      <span className={cn(KPS.typography.micro, 'block')}>
                        {isGerman ? 'Mögliche Quellen' : 'Possible Sources'}
                      </span>
                      <span className={KPS.typography.caption}>{mass.possibleSources.join(', ')}</span>
                    </div>
                  )}
                  {mass.fragmentOf.length > 0 && (
                    <div>
                      <span className={cn(KPS.typography.micro, 'block')}>
                        {isGerman ? 'Fragment von' : 'Fragment of'}
                      </span>
                      <span className={KPS.typography.caption}>{mass.fragmentOf.join(', ')}</span>
                    </div>
                  )}
                </div>
              </>
            )
          })()}
        </div>
      )}

      {/* Full Mass List */}
      <section>
        <h4 className={cn(KPS.typography.subTitle, 'mb-2')}>
          {isGerman ? 'Alle Massen' : 'All Masses'}
        </h4>
        <div className={cn('max-h-64 overflow-y-auto', KPS.spacing.itemGapSmall)}>
          {MASS_REFERENCE.map(m => (
            <div
              key={m.mass}
              className={cn(KPS.layout.flexBetween, 'py-1 px-2 bg-surface-card-muted rounded text-caption')}
            >
              <span className={cn(KPS.typography.mono, 'text-aqua-500')}>m/z {m.mass}</span>
              <span className="text-text-secondary truncate ml-2">{m.primaryAssignment}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
