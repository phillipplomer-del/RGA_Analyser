/**
 * PatternsTab - Diagnostic Patterns Reference
 *
 * Displays:
 * - Characteristic mass patterns for common vacuum problems
 * - Leak signatures, oil/solvent contamination patterns
 * - Relative sensitivity factors (RSF)
 * - Isotope ratios for verification
 */

import { cn } from '@/lib/utils/cn'
import { DIAGNOSTIC_MASS_GROUPS, SENSITIVITY_FACTORS, ISOTOPE_RATIOS } from '@/lib/knowledge'
import { KNOWLEDGE_PANEL_STYLES as KPS } from '../lib/designTokens'

interface PatternsTabProps {
  isGerman: boolean
}

export function PatternsTab({ isGerman }: PatternsTabProps) {
  const patterns = [
    // Lecks
    {
      name: 'Luftleck',
      nameEn: 'Air Leak',
      masses: DIAGNOSTIC_MASS_GROUPS.airLeak.masses,
      description: DIAGNOSTIC_MASS_GROUPS.airLeak.description,
      ratios: 'N₂/O₂ ≈ 3.7, N₂/Ar ≈ 84',
      category: 'leak',
    },
    {
      name: 'Virtuelles Leck',
      nameEn: 'Virtual Leak',
      masses: [28, 32, 18, 44],
      description: 'Eingeschlossenes Gas, verzögerte Freisetzung',
      ratios: 'Luftähnlich aber langsamer Druckabfall',
      category: 'leak',
    },
    // Öle & Fette
    {
      name: 'Öl-Rückströmung (Mineral)',
      nameEn: 'Oil Backstreaming (Mineral)',
      masses: DIAGNOSTIC_MASS_GROUPS.oilBackstreaming.masses,
      description: DIAGNOSTIC_MASS_GROUPS.oilBackstreaming.description,
      ratios: 'Δ14 amu Serie: 41→55→69→83',
      category: 'oil',
    },
    {
      name: 'Turbopumpenöl',
      nameEn: 'Turbopump Oil',
      masses: [43, 57, 41, 55, 71, 69, 85],
      description: 'Höheres m71 als Mineralöl',
      ratios: 'm71/m57 > 0.5 (vs <0.3 bei Vorpumpenöl)',
      category: 'oil',
    },
    {
      name: 'Fomblin/PFPE',
      nameEn: 'Fomblin/PFPE',
      masses: DIAGNOSTIC_MASS_GROUPS.fomblin.masses,
      description: DIAGNOSTIC_MASS_GROUPS.fomblin.description,
      ratios: 'm69 (CF₃⁺) dominant, KEINE m41/43/57!',
      category: 'oil',
    },
    {
      name: 'Silikon/PDMS',
      nameEn: 'Silicone/PDMS',
      masses: DIAGNOSTIC_MASS_GROUPS.silicone.masses,
      description: DIAGNOSTIC_MASS_GROUPS.silicone.description,
      ratios: 'm73 + Cluster bei 147, 221, 295',
      category: 'oil',
    },
    // Wasser & Ausgasung
    {
      name: 'Wasser',
      nameEn: 'Water',
      masses: DIAGNOSTIC_MASS_GROUPS.water.masses,
      description: DIAGNOSTIC_MASS_GROUPS.water.description,
      ratios: 'm18/m17 ≈ 4.3, m18/m16 ≈ 67',
      category: 'outgassing',
    },
    // Lösemittel
    {
      name: 'Aceton',
      nameEn: 'Acetone',
      masses: [43, 58, 15, 27],
      description: 'CH₃CO⁺ bei 43, Parent bei 58',
      ratios: 'm43/m58 ≈ 3.7',
      category: 'solvent',
    },
    {
      name: 'Isopropanol (IPA)',
      nameEn: 'Isopropanol (IPA)',
      masses: [45, 43, 27, 29, 41],
      description: 'Base Peak bei m45',
      ratios: 'm45 dominant',
      category: 'solvent',
    },
    {
      name: 'Ethanol',
      nameEn: 'Ethanol',
      masses: [31, 45, 46, 29, 27],
      description: 'CH₂OH⁺ bei 31, Parent bei 46',
      ratios: 'm31/m46 ≈ 4.5',
      category: 'solvent',
    },
    {
      name: 'Chlorierte Lösemittel',
      nameEn: 'Chlorinated Solvents',
      masses: [35, 37, 49, 84, 95, 97],
      description: 'Cl-Isotopenmuster ³⁵Cl/³⁷Cl = 3:1',
      ratios: 'TCE: m95/m97 ≈ 1.5, DCM: m49/m84',
      category: 'solvent',
    },
    // Aromaten
    {
      name: 'Aromaten (Benzol/Toluol)',
      nameEn: 'Aromatics (Benzene/Toluene)',
      masses: [78, 77, 91, 92, 51, 39],
      description: 'Phenyl (77), Tropylium (91)',
      ratios: 'Benzol: m78, Toluol: m91>m92',
      category: 'solvent',
    },
    // Spezifische Gase
    {
      name: 'N₂ vs CO Unterscheidung',
      nameEn: 'N₂ vs CO Differentiation',
      masses: [28, 14, 12],
      description: DIAGNOSTIC_MASS_GROUPS.n2VsCO.description,
      ratios: 'N₂: m14/m28 ≈ 7%, CO: m12/m28 ≈ 4.5%',
      category: 'gas',
    },
    {
      name: 'Ammoniak (NH₃)',
      nameEn: 'Ammonia (NH₃)',
      masses: [17, 16, 15, 14],
      description: 'OH⁺-ähnlich, aber m17/m16 ≈ 1.25 statt 15',
      ratios: 'm17 > m18 unterscheidet von H₂O',
      category: 'gas',
    },
    {
      name: 'Methan (CH₄)',
      nameEn: 'Methane (CH₄)',
      masses: [16, 15, 14, 13, 12],
      description: 'm15 (CH₃⁺) sauberster Marker',
      ratios: 'm15/m16 ≈ 0.85',
      category: 'gas',
    },
    {
      name: 'Schwefelverbindungen',
      nameEn: 'Sulfur Compounds',
      masses: [34, 33, 32, 64, 48],
      description: 'H₂S: m34, SO₂: m64/m48',
      ratios: 'H₂S: m33/m34 ≈ 0.42, SO₂: m48/m64 ≈ 0.49',
      category: 'gas',
    },
    // Artefakte
    {
      name: 'ESD-Artefakte',
      nameEn: 'ESD Artifacts',
      masses: DIAGNOSTIC_MASS_GROUPS.esdArtifacts.masses,
      description: DIAGNOSTIC_MASS_GROUPS.esdArtifacts.description,
      ratios: 'Verschwinden bei reduzierter EE',
      category: 'artifact',
    },
  ]

  const categories = [
    { key: 'leak', name: 'Lecks', nameEn: 'Leaks', color: 'state-danger' },
    { key: 'oil', name: 'Öle & Fette', nameEn: 'Oils & Greases', color: 'state-warning' },
    { key: 'outgassing', name: 'Ausgasung', nameEn: 'Outgassing', color: 'aqua-500' },
    { key: 'solvent', name: 'Lösemittel', nameEn: 'Solvents', color: 'state-warning' },
    { key: 'gas', name: 'Spezifische Gase', nameEn: 'Specific Gases', color: 'aqua-500' },
    { key: 'artifact', name: 'Artefakte', nameEn: 'Artifacts', color: 'text-muted' },
  ]

  return (
    <div className={KPS.spacing.sectionGap}>
      {/* Introduction */}
      <div className={cn(KPS.cards.gradient, KPS.colors.intro)}>
        <h3 className={cn(KPS.typography.cardTitle, 'text-aqua-600 dark:text-aqua-400 mb-2')}>
          {isGerman ? 'Diagnostische Muster' : 'Diagnostic Patterns'}
        </h3>
        <p className={cn(KPS.typography.caption, 'leading-relaxed mb-2')}>
          {isGerman
            ? 'Spezifische Kombinationen von Massen und deren Verhältnissen ermöglichen die eindeutige Identifikation von Kontaminanten und Systemzuständen. Diese Muster bilden die Grundlage für die automatische Diagnose.'
            : 'Specific combinations of masses and their ratios enable unique identification of contaminants and system states. These patterns form the basis for automatic diagnosis.'}
        </p>
        <div className={cn(KPS.layout.flex, 'flex-wrap text-caption')}>
          <span className={KPS.typography.captionMuted}>{patterns.length} {isGerman ? 'Muster' : 'patterns'}</span>
          <span className={KPS.typography.captionMuted}>•</span>
          <span className="text-state-danger">{patterns.filter(p => p.category === 'leak').length} {isGerman ? 'Lecks' : 'leaks'}</span>
          <span className={KPS.typography.captionMuted}>•</span>
          <span className="text-state-warning">{patterns.filter(p => p.category === 'oil' || p.category === 'solvent').length} {isGerman ? 'Kontaminationen' : 'contaminations'}</span>
        </div>
      </div>

      {categories.map(cat => {
        const catPatterns = patterns.filter(p => p.category === cat.key)
        if (catPatterns.length === 0) return null
        return (
          <section key={cat.key}>
            <h4 className={cn(KPS.typography.subTitle, 'mb-2')}>
              {isGerman ? cat.name : cat.nameEn} ({catPatterns.length})
            </h4>
            <div className={KPS.spacing.itemGapSmall}>
              {catPatterns.map((pattern, i) => (
                <div key={i} className={KPS.cards.mutedPadded}>
                  <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
                    {isGerman ? pattern.name : pattern.nameEn}
                  </h5>
                  <div className={KPS.spacing.itemGapSmall}>
                    <div>
                      <span className={cn(KPS.typography.micro, 'block')}>
                        {isGerman ? 'Charakteristische Massen' : 'Characteristic Masses'}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {pattern.masses.map(m => (
                          <span key={m} className={cn(KPS.badges.base, KPS.colors.massHighlight, KPS.typography.mono)}>
                            m/z {m}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className={cn(KPS.typography.micro, 'block')}>
                        {isGerman ? 'Verhältnisse' : 'Ratios'}
                      </span>
                      <span className={cn(KPS.typography.caption, KPS.typography.mono)}>{pattern.ratios}</span>
                    </div>
                    <p className={KPS.typography.caption}>{pattern.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      })}

      {/* Sensitivity Factors */}
      <section>
        <h4 className={cn(KPS.typography.subTitle, 'mb-2')}>
          {isGerman ? 'Relative Sensitivitätsfaktoren (vs N₂=1.0)' : 'Relative Sensitivity Factors (vs N₂=1.0)'}
        </h4>
        <div className={KPS.layout.gridThree}>
          {Object.entries(SENSITIVITY_FACTORS).map(([gas, rsf]) => (
            <div key={gas} className={cn(KPS.cards.muted, 'px-2 py-1 text-caption')}>
              <span className={cn(KPS.typography.mono, 'text-aqua-500')}>{gas}</span>
              <span className="text-text-muted ml-2">{rsf.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Isotope Ratios */}
      <section>
        <h4 className={cn(KPS.typography.subTitle, 'mb-2')}>
          {isGerman ? 'Isotopenverhältnisse' : 'Isotope Ratios'}
        </h4>
        <div className={KPS.spacing.itemGapSmall}>
          <div className={cn(KPS.cards.muted, 'p-2')}>
            <span className="font-medium">Argon:</span>
            <span className="text-caption text-text-muted ml-2">
              ⁴⁰Ar/³⁶Ar ≈ {ISOTOPE_RATIOS.argon.expectedRatio} (±{ISOTOPE_RATIOS.argon.tolerance})
            </span>
          </div>
          <div className={cn(KPS.cards.muted, 'p-2')}>
            <span className="font-medium">Chlor:</span>
            <span className="text-caption text-text-muted ml-2">
              ³⁵Cl/³⁷Cl ≈ {ISOTOPE_RATIOS.chlorine.expectedRatio.toFixed(1)} (±{ISOTOPE_RATIOS.chlorine.tolerance})
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
