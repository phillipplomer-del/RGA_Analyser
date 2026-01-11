/**
 * GasesTab - Gas Library Reference
 *
 * Displays:
 * - Complete gas library with cracking patterns
 * - Organized by category (permanent gases, noble gases, etc.)
 * - Relative sensitivity factors (RSF)
 * - Newly added gases for semiconductor processes
 */

import { cn } from '@/lib/utils/cn'
import { GAS_LIBRARY, type GasSpecies } from '@/lib/knowledge/gasLibrary'
import { KNOWLEDGE_PANEL_STYLES as KPS } from '../lib/designTokens'

interface GasesTabProps {
  isGerman: boolean
  expandedGas: string | null
  setExpandedGas: (key: string | null) => void
}

export function GasesTab({ isGerman, expandedGas, setExpandedGas }: GasesTabProps) {
  const categories = [
    { key: 'permanent', label: 'Permanentgase', labelEn: 'Permanent Gases' },
    { key: 'noble', label: 'Edelgase', labelEn: 'Noble Gases' },
    { key: 'water', label: 'Wasser', labelEn: 'Water' },
    { key: 'carbon_oxide', label: 'Kohlenstoffoxide', labelEn: 'Carbon Oxides' },
    { key: 'hydrocarbon', label: 'Kohlenwasserstoffe', labelEn: 'Hydrocarbons' },
    { key: 'solvent', label: 'Lösemittel', labelEn: 'Solvents' },
    { key: 'oil', label: 'Öle', labelEn: 'Oils' },
    { key: 'halogen', label: 'Halogene', labelEn: 'Halogens' },
  ]

  const formatCrackingPattern = (gas: GasSpecies) => {
    return Object.entries(gas.crackingPattern)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([mass, intensity]) => `m${mass}:${intensity}%`)
      .join(', ')
  }

  return (
    <div className={KPS.spacing.sectionGap}>
      {/* Introduction */}
      <div className={cn(KPS.cards.gradient, KPS.colors.intro)}>
        <h3 className={cn(KPS.typography.cardTitle, 'text-aqua-600 dark:text-aqua-400 mb-2')}>
          {isGerman ? 'Gasbibliothek' : 'Gas Library'}
        </h3>
        <p className={cn(KPS.typography.caption, 'leading-relaxed mb-2')}>
          {isGerman
            ? 'Diese Bibliothek enthält Referenzdaten für die Identifikation von Gasen im Massenspektrum. Die Cracking Patterns zeigen, wie jedes Gas bei 70 eV Elektronenstoß-Ionisation fragmentiert. Der Hauptpeak (Base Peak) hat per Definition 100% relative Intensität.'
            : 'This library contains reference data for gas identification in mass spectra. The cracking patterns show how each gas fragments at 70 eV electron impact ionization. The main peak (base peak) has 100% relative intensity by definition.'}
        </p>
        <div className={cn(KPS.layout.flex, 'text-caption flex-wrap')}>
          <span className={KPS.typography.captionMuted}>
            {isGerman ? `${GAS_LIBRARY.length} Gase` : `${GAS_LIBRARY.length} gases`}
          </span>
          <span className={KPS.typography.captionMuted}>•</span>
          <span className={KPS.typography.captionMuted}>70 eV EI</span>
          <span className={KPS.typography.captionMuted}>•</span>
          <span className={KPS.typography.captionMuted}>
            {isGerman ? 'NIST-kompatibel' : 'NIST-compatible'}
          </span>
        </div>
      </div>

      {/* Newly Added Gases */}
      <div className={cn(KPS.cards.gradient, KPS.colors.highlight)}>
        <div className={cn(KPS.layout.flex, 'mb-2')}>
          <span className="text-xl">✨</span>
          <h3 className="font-semibold text-mint-600 dark:text-mint-400">
            {isGerman ? 'Neu hinzugefügt (Jan 2026)' : 'Newly Added (Jan 2026)'}
          </h3>
        </div>
        <p className={cn(KPS.typography.caption, 'mb-3')}>
          {isGerman
            ? 'Halbleiter-Prozessgase für Plasma-Ätzen und CVD-Anwendungen'
            : 'Semiconductor process gases for plasma etching and CVD applications'}
        </p>
        <div className={KPS.layout.gridWide}>
          {[
            { formula: 'NF₃', name: 'Stickstofftrifluorid', nameEn: 'Nitrogen Trifluoride', mz: 71, key: 'NF3' },
            { formula: 'WF₆', name: 'Wolframhexafluorid', nameEn: 'Tungsten Hexafluoride', mz: 298, key: 'WF6' },
            { formula: 'C₂F₆', name: 'Hexafluorethan', nameEn: 'Hexafluoroethane', mz: 69, key: 'C2F6' },
            { formula: 'GeH₄', name: 'Germaniumhydrid', nameEn: 'Germane', mz: 76, key: 'GeH4' }
          ].map(g => (
            <button
              key={g.key}
              onClick={() => setExpandedGas(expandedGas === g.key ? null : g.key)}
              className={cn(
                KPS.layout.flexBetween,
                'p-2 bg-mint-500/10 hover:bg-mint-500/20 rounded-lg transition-colors'
              )}
            >
              <div className={KPS.layout.flex}>
                <span className={cn(KPS.typography.mono, 'text-mint-600 dark:text-mint-400 font-medium')}>{g.formula}</span>
                <span className={KPS.typography.caption}>{isGerman ? g.name : g.nameEn}</span>
              </div>
              <span className={KPS.typography.micro}>m/z {g.mz}</span>
            </button>
          ))}
        </div>
      </div>

      {categories.map(cat => {
        const gases = GAS_LIBRARY.filter(g => g.category === cat.key)
        if (gases.length === 0) return null

        return (
          <section key={cat.key}>
            <h4 className={cn(KPS.typography.subTitle, 'mb-2')}>
              {isGerman ? cat.label : cat.labelEn} ({gases.length})
            </h4>
            <div className={KPS.spacing.itemGapSmall}>
              {gases.map(gas => (
                <div key={gas.key} className={cn(KPS.cards.base, 'overflow-hidden')}>
                  <button
                    onClick={() => setExpandedGas(expandedGas === gas.key ? null : gas.key)}
                    className={cn(KPS.cards.interactiveFull, KPS.layout.flexBetween, 'p-2')}
                  >
                    <div className={KPS.layout.flex}>
                      <span className={cn(KPS.typography.mono, 'text-aqua-500 font-medium')}>{gas.formula}</span>
                      <span className={KPS.typography.caption}>
                        {isGerman ? gas.name : gas.nameEn}
                      </span>
                    </div>
                    <div className={KPS.layout.flex}>
                      <span className={KPS.typography.micro}>m/z {gas.mainMass}</span>
                      <span className={cn(
                        KPS.interactions.expandIcon,
                        expandedGas === gas.key && KPS.interactions.expandIconRotated
                      )}>▼</span>
                    </div>
                  </button>

                  {expandedGas === gas.key && (
                    <div className={cn(KPS.borders.subtleDivider, 'px-3 pb-3 pt-2')}>
                      <div className={KPS.spacing.itemGapSmall}>
                        <div>
                          <span className={cn(KPS.typography.micro, 'block')}>
                            {isGerman ? 'Cracking Pattern:' : 'Cracking Pattern:'}
                          </span>
                          <span className={cn(KPS.typography.caption, KPS.typography.mono)}>
                            {formatCrackingPattern(gas)}
                          </span>
                        </div>
                        <div className={cn(KPS.layout.flex, 'gap-4')}>
                          <div>
                            <span className={cn(KPS.typography.micro, 'block')}>RSF (vs N₂)</span>
                            <span className={KPS.typography.mono}>{gas.relativeSensitivity.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className={cn(KPS.typography.micro, 'block')}>
                              {isGerman ? 'Hauptmasse' : 'Main Mass'}
                            </span>
                            <span className={KPS.typography.mono}>m/z {gas.mainMass}</span>
                          </div>
                        </div>
                        {gas.notes && gas.notes.length > 0 && (
                          <div>
                            <span className={cn(KPS.typography.micro, 'block')}>
                              {isGerman ? 'Hinweise:' : 'Notes:'}
                            </span>
                            <ul className={cn(KPS.typography.caption, 'list-disc list-inside')}>
                              {gas.notes.map((note, i) => (
                                <li key={i}>{note}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
