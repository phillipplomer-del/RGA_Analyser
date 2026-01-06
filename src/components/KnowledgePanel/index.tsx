import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils/cn'
import { GAS_LIBRARY, type GasSpecies } from '@/lib/knowledge/gasLibrary'
import { MASS_REFERENCE } from '@/lib/knowledge/massReference'
import { DIAGNOSTIC_MASS_GROUPS, SENSITIVITY_FACTORS, ISOTOPE_RATIOS } from '@/lib/knowledge'

type TabKey = 'criteria' | 'gases' | 'masses' | 'patterns' | 'references'

interface KnowledgePanelProps {
  compact?: boolean
}

export function KnowledgePanel({ compact }: KnowledgePanelProps) {
  const { i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabKey>('criteria')
  const [expandedGas, setExpandedGas] = useState<string | null>(null)
  const [expandedMass, setExpandedMass] = useState<number | null>(null)
  const isGerman = i18n.language === 'de'

  const tabs: { key: TabKey; label: string; labelEn: string }[] = [
    { key: 'criteria', label: 'Kriterien', labelEn: 'Criteria' },
    { key: 'gases', label: 'Gase', labelEn: 'Gases' },
    { key: 'masses', label: 'Massen', labelEn: 'Masses' },
    { key: 'patterns', label: 'Muster', labelEn: 'Patterns' },
    { key: 'references', label: 'Referenzen', labelEn: 'References' },
  ]

  return (
    <div className={cn('flex flex-col h-full', compact && 'text-sm')}>
      {/* Tab Navigation */}
      <div className="flex border-b border-subtle overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-3 py-2 text-caption font-medium whitespace-nowrap transition-colors',
              activeTab === tab.key
                ? 'text-aqua-500 border-b-2 border-aqua-500'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {isGerman ? tab.label : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'criteria' && <CriteriaTab isGerman={isGerman} />}
        {activeTab === 'gases' && (
          <GasesTab
            isGerman={isGerman}
            expandedGas={expandedGas}
            setExpandedGas={setExpandedGas}
          />
        )}
        {activeTab === 'masses' && (
          <MassesTab
            isGerman={isGerman}
            expandedMass={expandedMass}
            setExpandedMass={setExpandedMass}
          />
        )}
        {activeTab === 'patterns' && <PatternsTab isGerman={isGerman} />}
        {activeTab === 'references' && <ReferencesTab isGerman={isGerman} />}
      </div>
    </div>
  )
}

// ============================================
// CRITERIA TAB
// ============================================
function CriteriaTab({ isGerman }: { isGerman: boolean }) {
  const qualityChecks = [
    {
      name: 'H₂/H₂O Verhältnis',
      nameEn: 'H₂/H₂O Ratio',
      formula: 'H₂ > 5 × H₂O',
      description: 'Wasserstoff muss mindestens 5× größer als Wasser sein',
      descriptionEn: 'Hydrogen must be at least 5× greater than water',
    },
    {
      name: 'N₂/O₂ Verhältnis',
      nameEn: 'N₂/O₂ Ratio',
      formula: 'N₂/CO > 4 × O₂',
      description: 'Prüft auf Luftleck-Signatur',
      descriptionEn: 'Checks for air leak signature',
    },
    {
      name: 'Bakeout-Erfolg',
      nameEn: 'Bakeout Success',
      formula: 'Peak(2) > Peak(18)',
      description: 'Nach Bakeout sollte H₂ dominieren',
      descriptionEn: 'After bakeout, H₂ should dominate',
    },
    {
      name: 'N₂ vs CO',
      nameEn: 'N₂ vs CO',
      formula: 'Peak(14)/Peak(28) ≈ 0.07',
      description: 'Unterscheidet N₂ (m14 Fragment) von CO (m12 Fragment)',
      descriptionEn: 'Distinguishes N₂ (m14 fragment) from CO (m12 fragment)',
    },
    {
      name: 'Ar Doppelionisation',
      nameEn: 'Ar Double Ionization',
      formula: 'm20/m40 ≈ 0.10-0.15',
      description: 'Bestätigt Argon durch Ar²⁺ Peak',
      descriptionEn: 'Confirms Argon via Ar²⁺ peak',
    },
    {
      name: 'HC-frei (DESY)',
      nameEn: 'HC-free (DESY)',
      formula: 'Σ(m45-100) < 0.1%',
      description: 'Kohlenwasserstoff-Freiheit nach DESY-Standard',
      descriptionEn: 'Hydrocarbon-free per DESY standard',
    },
  ]

  const diagnoses = [
    { icon: '🌬️', name: 'Luftleck', nameEn: 'Air Leak', criteria: 'N₂/O₂ ≈ 3.7, Ar vorhanden' },
    { icon: '💧', name: 'Wasser-Ausgasung', nameEn: 'Water Outgassing', criteria: 'm18 dominant, m18/m17 ≈ 4.3' },
    { icon: '⚡', name: 'H₂-dominant', nameEn: 'H₂ Dominant', criteria: 'm2 > m18, typisch nach Bakeout' },
    { icon: '🛢️', name: 'Öl-Rückströmung', nameEn: 'Oil Backstreaming', criteria: 'Δ14 amu: m41, 55, 69, 83' },
    { icon: '🧪', name: 'Fomblin/PFPE', nameEn: 'Fomblin/PFPE', criteria: 'm69 (CF₃⁺) ohne m41/43/57' },
    { icon: '🧴', name: 'Lösemittel', nameEn: 'Solvent Residue', criteria: 'Aceton (43,58), IPA (45), Ethanol (31,46)' },
    { icon: '☢️', name: 'ESD-Artefakte', nameEn: 'ESD Artifacts', criteria: 'Anomale O⁺, F⁺, Cl⁺ ohne Quelle' },
    { icon: '🔬', name: 'Silikon', nameEn: 'Silicone', criteria: 'm73 (Trimethylsilyl), m147' },
  ]

  return (
    <div className="space-y-6">
      {/* Quality Checks */}
      <section>
        <h3 className="font-semibold text-text-primary mb-3">
          {isGerman ? 'Qualitätsprüfungen' : 'Quality Checks'}
        </h3>
        <div className="space-y-2">
          {qualityChecks.map((check, i) => (
            <div key={i} className="bg-surface-card-muted rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-text-primary">
                  {isGerman ? check.name : check.nameEn}
                </span>
                <code className="text-micro bg-bg-secondary px-2 py-0.5 rounded font-mono">
                  {check.formula}
                </code>
              </div>
              <p className="text-caption text-text-muted">
                {isGerman ? check.description : check.descriptionEn}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Diagnoses */}
      <section>
        <h3 className="font-semibold text-text-primary mb-3">
          {isGerman ? 'Automatische Diagnosen' : 'Automatic Diagnoses'}
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {diagnoses.map((diag, i) => (
            <div key={i} className="flex items-start gap-3 bg-surface-card-muted rounded-lg p-3">
              <span className="text-xl">{diag.icon}</span>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-text-primary">
                  {isGerman ? diag.name : diag.nameEn}
                </span>
                <p className="text-caption text-text-muted">{diag.criteria}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ============================================
// GASES TAB
// ============================================
function GasesTab({
  isGerman,
  expandedGas,
  setExpandedGas
}: {
  isGerman: boolean
  expandedGas: string | null
  setExpandedGas: (key: string | null) => void
}) {
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
    <div className="space-y-4">
      <p className="text-caption text-text-muted">
        {isGerman
          ? `${GAS_LIBRARY.length} Gase mit Cracking Patterns (70 eV EI)`
          : `${GAS_LIBRARY.length} gases with cracking patterns (70 eV EI)`}
      </p>

      {categories.map(cat => {
        const gases = GAS_LIBRARY.filter(g => g.category === cat.key)
        if (gases.length === 0) return null

        return (
          <section key={cat.key}>
            <h4 className="font-medium text-text-secondary text-caption mb-2">
              {isGerman ? cat.label : cat.labelEn} ({gases.length})
            </h4>
            <div className="space-y-1">
              {gases.map(gas => (
                <div key={gas.key} className="bg-surface-card-muted rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedGas(expandedGas === gas.key ? null : gas.key)}
                    className="w-full flex items-center justify-between p-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-aqua-500 font-medium">{gas.formula}</span>
                      <span className="text-text-secondary text-caption">
                        {isGerman ? gas.name : gas.nameEn}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-micro text-text-muted">m/z {gas.mainMass}</span>
                      <span className={cn(
                        'transition-transform',
                        expandedGas === gas.key && 'rotate-180'
                      )}>▼</span>
                    </div>
                  </button>

                  {expandedGas === gas.key && (
                    <div className="px-3 pb-3 border-t border-subtle">
                      <div className="mt-2 space-y-2">
                        <div>
                          <span className="text-micro text-text-muted block">
                            {isGerman ? 'Cracking Pattern:' : 'Cracking Pattern:'}
                          </span>
                          <span className="font-mono text-caption">
                            {formatCrackingPattern(gas)}
                          </span>
                        </div>
                        <div className="flex gap-4">
                          <div>
                            <span className="text-micro text-text-muted block">RSF (vs N₂)</span>
                            <span className="font-mono">{gas.relativeSensitivity.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-micro text-text-muted block">
                              {isGerman ? 'Hauptmasse' : 'Main Mass'}
                            </span>
                            <span className="font-mono">m/z {gas.mainMass}</span>
                          </div>
                        </div>
                        {gas.notes && gas.notes.length > 0 && (
                          <div>
                            <span className="text-micro text-text-muted block">
                              {isGerman ? 'Hinweise:' : 'Notes:'}
                            </span>
                            <ul className="text-caption text-text-secondary list-disc list-inside">
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

// ============================================
// MASSES TAB
// ============================================
function MassesTab({
  isGerman,
  expandedMass,
  setExpandedMass
}: {
  isGerman: boolean
  expandedMass: number | null
  setExpandedMass: (mass: number | null) => void
}) {
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
    <div className="space-y-4">
      <p className="text-caption text-text-muted">
        {isGerman
          ? `${MASS_REFERENCE.length} Massen referenziert (m/z 1-100)`
          : `${MASS_REFERENCE.length} masses referenced (m/z 1-100)`}
      </p>

      {/* Critical Masses */}
      <section>
        <h4 className="font-medium text-state-danger text-caption mb-2">
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
        <h4 className="font-medium text-state-warning text-caption mb-2">
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
        <div className="bg-surface-card-muted rounded-lg p-3 mt-4">
          {(() => {
            const mass = MASS_REFERENCE.find(m => m.mass === expandedMass)
            if (!mass) return null
            return (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-h3 text-aqua-500">m/z {mass.mass}</span>
                  <span className={cn('px-2 py-0.5 rounded-full text-micro', getDiagnosticColor(mass.diagnosticValue))}>
                    {mass.diagnosticValue}
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-micro text-text-muted block">
                      {isGerman ? 'Primäre Zuordnung' : 'Primary Assignment'}
                    </span>
                    <span className="font-medium">{mass.primaryAssignment}</span>
                  </div>
                  {mass.possibleSources.length > 0 && (
                    <div>
                      <span className="text-micro text-text-muted block">
                        {isGerman ? 'Mögliche Quellen' : 'Possible Sources'}
                      </span>
                      <span className="text-caption">{mass.possibleSources.join(', ')}</span>
                    </div>
                  )}
                  {mass.fragmentOf.length > 0 && (
                    <div>
                      <span className="text-micro text-text-muted block">
                        {isGerman ? 'Fragment von' : 'Fragment of'}
                      </span>
                      <span className="text-caption">{mass.fragmentOf.join(', ')}</span>
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
        <h4 className="font-medium text-text-secondary text-caption mb-2">
          {isGerman ? 'Alle Massen' : 'All Masses'}
        </h4>
        <div className="max-h-64 overflow-y-auto space-y-1">
          {MASS_REFERENCE.map(m => (
            <div
              key={m.mass}
              className="flex items-center justify-between py-1 px-2 bg-surface-card-muted rounded text-caption"
            >
              <span className="font-mono text-aqua-500">m/z {m.mass}</span>
              <span className="text-text-secondary truncate ml-2">{m.primaryAssignment}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ============================================
// PATTERNS TAB
// ============================================
function PatternsTab({ isGerman }: { isGerman: boolean }) {
  const patterns = [
    {
      name: 'Luftleck',
      nameEn: 'Air Leak',
      masses: DIAGNOSTIC_MASS_GROUPS.airLeak.masses,
      description: DIAGNOSTIC_MASS_GROUPS.airLeak.description,
      ratios: 'N₂/O₂ ≈ 3.7, N₂/Ar ≈ 84',
    },
    {
      name: 'Öl-Rückströmung',
      nameEn: 'Oil Backstreaming',
      masses: DIAGNOSTIC_MASS_GROUPS.oilBackstreaming.masses,
      description: DIAGNOSTIC_MASS_GROUPS.oilBackstreaming.description,
      ratios: 'Periodisches Δ14 amu Muster',
    },
    {
      name: 'Fomblin/PFPE',
      nameEn: 'Fomblin/PFPE',
      masses: DIAGNOSTIC_MASS_GROUPS.fomblin.masses,
      description: DIAGNOSTIC_MASS_GROUPS.fomblin.description,
      ratios: 'm69 dominant, KEINE m41/43/57',
    },
    {
      name: 'Wasser',
      nameEn: 'Water',
      masses: DIAGNOSTIC_MASS_GROUPS.water.masses,
      description: DIAGNOSTIC_MASS_GROUPS.water.description,
      ratios: 'm18/m17 ≈ 4.3',
    },
    {
      name: 'Silikon/PDMS',
      nameEn: 'Silicone/PDMS',
      masses: DIAGNOSTIC_MASS_GROUPS.silicone.masses,
      description: DIAGNOSTIC_MASS_GROUPS.silicone.description,
      ratios: 'Trimethylsilyl-Fragmente',
    },
  ]

  return (
    <div className="space-y-4">
      <p className="text-caption text-text-muted">
        {isGerman
          ? 'Diagnostische Massenmuster für automatische Erkennung'
          : 'Diagnostic mass patterns for automatic detection'}
      </p>

      {patterns.map((pattern, i) => (
        <div key={i} className="bg-surface-card-muted rounded-lg p-3">
          <h4 className="font-medium text-text-primary mb-2">
            {isGerman ? pattern.name : pattern.nameEn}
          </h4>
          <div className="space-y-2">
            <div>
              <span className="text-micro text-text-muted block">
                {isGerman ? 'Charakteristische Massen' : 'Characteristic Masses'}
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {pattern.masses.map(m => (
                  <span key={m} className="px-2 py-0.5 bg-aqua-500/10 text-aqua-500 rounded font-mono text-caption">
                    m/z {m}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-micro text-text-muted block">
                {isGerman ? 'Verhältnisse' : 'Ratios'}
              </span>
              <span className="text-caption font-mono">{pattern.ratios}</span>
            </div>
            <p className="text-caption text-text-secondary">{pattern.description}</p>
          </div>
        </div>
      ))}

      {/* Sensitivity Factors */}
      <section>
        <h4 className="font-medium text-text-secondary text-caption mb-2">
          {isGerman ? 'Relative Sensitivitätsfaktoren (vs N₂=1.0)' : 'Relative Sensitivity Factors (vs N₂=1.0)'}
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(SENSITIVITY_FACTORS).map(([gas, rsf]) => (
            <div key={gas} className="bg-surface-card-muted rounded px-2 py-1 text-caption">
              <span className="font-mono text-aqua-500">{gas}</span>
              <span className="text-text-muted ml-2">{rsf.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Isotope Ratios */}
      <section>
        <h4 className="font-medium text-text-secondary text-caption mb-2">
          {isGerman ? 'Isotopenverhältnisse' : 'Isotope Ratios'}
        </h4>
        <div className="space-y-2">
          <div className="bg-surface-card-muted rounded p-2">
            <span className="font-medium">Argon:</span>
            <span className="text-caption text-text-muted ml-2">
              ⁴⁰Ar/³⁶Ar ≈ {ISOTOPE_RATIOS.argon.expectedRatio} (±{ISOTOPE_RATIOS.argon.tolerance})
            </span>
          </div>
          <div className="bg-surface-card-muted rounded p-2">
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

// ============================================
// REFERENCES TAB
// ============================================
function ReferencesTab({ isGerman }: { isGerman: boolean }) {
  const references = [
    {
      source: 'CERN',
      title: 'Vacuum System Requirements',
      topics: ['UHV Grenzwerte', 'Baked/Unbaked Kriterien', 'Ausgasungsraten'],
      topicsEn: ['UHV limits', 'Baked/unbaked criteria', 'Outgassing rates'],
    },
    {
      source: 'Pfeiffer Vacuum',
      title: 'Know-How Book',
      topics: ['Massenspektren-Interpretation', 'Cracking Patterns', 'Sensitivitätsfaktoren'],
      topicsEn: ['Mass spectra interpretation', 'Cracking patterns', 'Sensitivity factors'],
    },
    {
      source: 'NIST',
      title: 'WebBook Chemistry',
      topics: ['Referenz-Massenspektren', 'Isotopenverhältnisse'],
      topicsEn: ['Reference mass spectra', 'Isotope ratios'],
    },
    {
      source: 'MKS Instruments',
      title: 'RGA Application Notes',
      topics: ['Leck-Detektion', 'Prozess-Monitoring'],
      topicsEn: ['Leak detection', 'Process monitoring'],
    },
    {
      source: 'Hiden Analytical',
      title: 'QMS Technical Notes',
      topics: ['Peak-Identifikation', 'Kontaminations-Analyse'],
      topicsEn: ['Peak identification', 'Contamination analysis'],
    },
  ]

  const knowledgeBases = [
    { file: 'RGA_ChatGPT.md', description: 'Comprehensive gas library and cracking patterns' },
    { file: 'RGA_CLAUDE.md', description: 'Diagnostic algorithms and decision trees' },
    { file: 'RGA_GEMINI.md', description: 'Limit specifications and quality criteria' },
    { file: 'RGA_Grok.md', description: 'Troubleshooting guides and common issues' },
  ]

  return (
    <div className="space-y-6">
      {/* Knowledge Bases */}
      <section>
        <h4 className="font-medium text-text-primary mb-3">
          {isGerman ? 'Integrierte Wissensdatenbanken' : 'Integrated Knowledge Bases'}
        </h4>
        <div className="space-y-2">
          {knowledgeBases.map((kb, i) => (
            <div key={i} className="bg-surface-card-muted rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">📚</span>
                <span className="font-mono text-aqua-500">{kb.file}</span>
              </div>
              <p className="text-caption text-text-muted">{kb.description}</p>
            </div>
          ))}
        </div>
        <p className="text-micro text-text-muted mt-2">
          {isGerman
            ? 'Diese Dateien bilden die Grundlage für automatische Diagnosen und Bewertungen.'
            : 'These files form the basis for automatic diagnoses and evaluations.'}
        </p>
      </section>

      {/* External References */}
      <section>
        <h4 className="font-medium text-text-primary mb-3">
          {isGerman ? 'Externe Quellen' : 'External Sources'}
        </h4>
        <div className="space-y-2">
          {references.map((ref, i) => (
            <div key={i} className="bg-surface-card-muted rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-aqua-500">{ref.source}</span>
                <span className="text-text-secondary">–</span>
                <span className="text-text-secondary">{ref.title}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {(isGerman ? ref.topics : ref.topicsEn).map((topic, j) => (
                  <span key={j} className="px-2 py-0.5 bg-bg-secondary rounded text-micro text-text-muted">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Info */}
      <div className="bg-aqua-500/10 rounded-lg p-3">
        <p className="text-caption text-aqua-700 dark:text-aqua-300">
          {isGerman
            ? '💡 Das konsolidierte Wissen aus 4 KI-Datenbanken ermöglicht automatische Diagnosen mit Konfidenzwerten und detaillierten Empfehlungen.'
            : '💡 The consolidated knowledge from 4 AI databases enables automatic diagnoses with confidence values and detailed recommendations.'}
        </p>
      </div>
    </div>
  )
}
