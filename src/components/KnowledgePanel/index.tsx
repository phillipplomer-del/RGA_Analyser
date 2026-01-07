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
  const [expandedDiagnosis, setExpandedDiagnosis] = useState<string | null>(null)
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
        {activeTab === 'criteria' && (
          <CriteriaTab
            isGerman={isGerman}
            expandedDiagnosis={expandedDiagnosis}
            setExpandedDiagnosis={setExpandedDiagnosis}
          />
        )}
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
function CriteriaTab({
  isGerman,
  expandedDiagnosis,
  setExpandedDiagnosis
}: {
  isGerman: boolean
  expandedDiagnosis: string | null
  setExpandedDiagnosis: (key: string | null) => void
}) {
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
    // Kritische Diagnosen
    {
      key: 'air_leak',
      icon: '🌬️',
      name: 'Luftleck',
      nameEn: 'Air Leak',
      criteria: 'N₂/O₂ ≈ 3.7, Ar vorhanden',
      severity: 'critical',
      masses: [28, 32, 40],
      description: 'Ein echtes Leck zur Atmosphäre zeigt das charakteristische Verhältnis von Stickstoff zu Sauerstoff (~3.7:1) sowie Argon als chemisch inertes Tracergas.',
      descriptionEn: 'A real atmospheric leak shows the characteristic nitrogen to oxygen ratio (~3.7:1) plus argon as a chemically inert tracer gas.',
      recommendation: 'Helium-Lecksuche durchführen. Flansche, Schweißnähte und O-Ringe prüfen.',
      recommendationEn: 'Perform helium leak testing. Check flanges, welds and O-rings.',
    },
    {
      key: 'virtual_leak',
      icon: '🔄',
      name: 'Virtuelles Leck',
      nameEn: 'Virtual Leak',
      criteria: 'Langsamer Druckabfall, keine He-Reaktion',
      severity: 'warning',
      masses: [28, 32, 18, 44],
      description: 'Eingeschlossenes Gas in Hohlräumen, Gewindegängen oder porösen Materialien. Zeigt luftähnliches Spektrum, aber reagiert nicht auf Helium-Besprühung.',
      descriptionEn: 'Trapped gas in cavities, threads or porous materials. Shows air-like spectrum but does not respond to helium spraying.',
      recommendation: 'Belüftungsbohrungen vorsehen. Komponenten auf eingeschlossene Volumina prüfen.',
      recommendationEn: 'Provide vent holes. Check components for trapped volumes.',
    },
    {
      key: 'oil_backstreaming',
      icon: '🛢️',
      name: 'Öl-Rückströmung',
      nameEn: 'Oil Backstreaming',
      criteria: 'Δ14 amu: m41, 55, 69, 83',
      severity: 'critical',
      masses: [41, 43, 55, 57, 69, 71, 83, 85],
      description: 'Mineralöl aus Vorpumpen zeigt charakteristisches "Lattenzaun"-Muster mit Δ14 amu Abständen (CₙH₂ₙ₊₁-Kationen).',
      descriptionEn: 'Mineral oil from forepumps shows characteristic "picket fence" pattern with Δ14 amu spacing (CₙH₂ₙ₊₁ cations).',
      recommendation: 'Kühlfalle zwischen Vorpumpe und Kammer einbauen. Ölfrei pumpen oder PFPE-Öl verwenden.',
      recommendationEn: 'Install cold trap between forepump and chamber. Use oil-free pumping or PFPE oil.',
    },
    {
      key: 'fomblin',
      icon: '⚗️',
      name: 'Fomblin/PFPE',
      nameEn: 'Fomblin/PFPE',
      criteria: 'm69 (CF₃⁺) dominant, KEINE m41/43/57',
      severity: 'critical',
      masses: [69, 20, 31, 47, 50, 97, 119],
      description: 'Perfluorpolyether (PFPE) wie Fomblin zeigt CF₃⁺ bei m/z 69 als Hauptpeak. Wichtig: KEINE Alkyl-Peaks bei m41/43/57!',
      descriptionEn: 'Perfluoropolyether (PFPE) like Fomblin shows CF₃⁺ at m/z 69 as main peak. Important: NO alkyl peaks at m41/43/57!',
      recommendation: 'PFPE-kontaminierte Teile durch Ausheizen oder Lösemittelreinigung behandeln.',
      recommendationEn: 'Treat PFPE-contaminated parts by baking or solvent cleaning.',
    },
    // Kontaminationen
    {
      key: 'water_outgassing',
      icon: '💧',
      name: 'Wasser-Ausgasung',
      nameEn: 'Water Outgassing',
      criteria: 'm18 dominant, m18/m17 ≈ 4.3',
      severity: 'warning',
      masses: [18, 17, 16],
      description: 'Dominant in unausgeheizten Systemen. Wasser desorbiert langsam von Metalloberflächen. Das Verhältnis m18/m17 ≈ 4.3 bestätigt Wasser.',
      descriptionEn: 'Dominant in unbaked systems. Water desorbs slowly from metal surfaces. The ratio m18/m17 ≈ 4.3 confirms water.',
      recommendation: 'System ausheizen (150-250°C für 24-48h). Trockene Belüftung verwenden.',
      recommendationEn: 'Bake out system (150-250°C for 24-48h). Use dry venting.',
    },
    {
      key: 'solvent_residue',
      icon: '🧪',
      name: 'Lösemittel-Rückstand',
      nameEn: 'Solvent Residue',
      criteria: 'Aceton (43,58), IPA (45), Ethanol (31,46)',
      severity: 'warning',
      masses: [43, 58, 45, 31, 46, 27, 29],
      description: 'Reinigungsmittel-Rückstände zeigen charakteristische Peaks: Aceton (43 Base, 58 Parent), IPA (45 Base), Ethanol (31 Base, 46 Parent).',
      descriptionEn: 'Cleaning agent residues show characteristic peaks: Acetone (43 base, 58 parent), IPA (45 base), Ethanol (31 base, 46 parent).',
      recommendation: 'Längeres Ausheizen. Reinigungsprozedur optimieren (weniger Lösemittel, bessere Trocknung).',
      recommendationEn: 'Extended baking. Optimize cleaning procedure (less solvent, better drying).',
    },
    {
      key: 'chlorinated_solvent',
      icon: '☢️',
      name: 'Chlorierte Lösemittel',
      nameEn: 'Chlorinated Solvent',
      criteria: 'Cl-Isotopenmuster m35/37 ≈ 3:1, TCE (m95)',
      severity: 'critical',
      masses: [35, 37, 49, 84, 95, 97],
      description: 'Chlor zeigt charakteristisches Isotopenmuster (³⁵Cl/³⁷Cl ≈ 3:1). TCE bei m/z 95/97, DCM bei m/z 49/84.',
      descriptionEn: 'Chlorine shows characteristic isotope pattern (³⁵Cl/³⁷Cl ≈ 3:1). TCE at m/z 95/97, DCM at m/z 49/84.',
      recommendation: 'WARNUNG: Chlorierte Lösemittel korrodieren Aluminium! Sofortige Reinigung erforderlich.',
      recommendationEn: 'WARNING: Chlorinated solvents corrode aluminum! Immediate cleaning required.',
    },
    {
      key: 'silicone',
      icon: '🔬',
      name: 'Silikon/PDMS',
      nameEn: 'Silicone/PDMS',
      criteria: 'm73 (Trimethylsilyl), m147, m221',
      severity: 'warning',
      masses: [73, 147, 221, 295, 45, 59],
      description: 'Polydimethylsiloxan (PDMS) aus Silikonfett oder DC705 zeigt Trimethylsilyl-Fragment bei m/z 73 und Cluster bei 147, 221, 295 (Δ74).',
      descriptionEn: 'Polydimethylsiloxane (PDMS) from silicone grease or DC705 shows trimethylsilyl fragment at m/z 73 and clusters at 147, 221, 295 (Δ74).',
      recommendation: 'Silikonfreie Schmiermittel verwenden. Kontaminierte Teile ersetzen oder aufwändig reinigen.',
      recommendationEn: 'Use silicone-free lubricants. Replace contaminated parts or clean extensively.',
    },
    {
      key: 'aromatic',
      icon: '⬡',
      name: 'Aromaten',
      nameEn: 'Aromatic Contamination',
      criteria: 'Benzol (m78), Toluol (m91)',
      severity: 'warning',
      masses: [78, 77, 91, 92, 51, 39],
      description: 'Aromatische Verbindungen: Benzol zeigt Parent bei m/z 78 und Phenyl-Fragment bei 77. Toluol zeigt Tropylium-Kation bei m/z 91.',
      descriptionEn: 'Aromatic compounds: Benzene shows parent at m/z 78 and phenyl fragment at 77. Toluene shows tropylium cation at m/z 91.',
      recommendation: 'Auf O-Ring-Materialien und Klebstoffe prüfen. Ausheizen hilft oft.',
      recommendationEn: 'Check O-ring materials and adhesives. Baking often helps.',
    },
    // Spezifische Gase
    {
      key: 'ammonia',
      icon: '🧪',
      name: 'Ammoniak',
      nameEn: 'Ammonia',
      criteria: 'm17 dominant (wie OH⁺), m17/m16 ≈ 1.25',
      severity: 'warning',
      masses: [17, 16, 15, 14],
      description: 'NH₃ hat Base Peak bei m/z 17 wie OH⁺ von Wasser. Unterscheidung: m17/m16 ≈ 1.25 (vs ~15 bei H₂O), und m17 > m18.',
      descriptionEn: 'NH₃ has base peak at m/z 17 like OH⁺ from water. Differentiation: m17/m16 ≈ 1.25 (vs ~15 for H₂O), and m17 > m18.',
      recommendation: 'Quelle identifizieren (Prozessgas, Ausgasung von Nitriden).',
      recommendationEn: 'Identify source (process gas, outgassing from nitrides).',
    },
    {
      key: 'methane',
      icon: '🔥',
      name: 'Methan',
      nameEn: 'Methane',
      criteria: 'm15 (CH₃⁺) sauberer Marker, m16 (CH₄⁺)',
      severity: 'info',
      masses: [16, 15, 14, 13, 12],
      description: 'm/z 15 (CH₃⁺) ist der sauberste Methan-Marker, da kein anderes häufiges Gas dort einen starken Peak hat. m16 überlagert mit O⁺.',
      descriptionEn: 'm/z 15 (CH₃⁺) is the cleanest methane marker as no other common gas has a strong peak there. m16 overlaps with O⁺.',
      recommendation: 'Oft unkritisch in kleinen Mengen. Quelle: Ausgasung von organischen Materialien.',
      recommendationEn: 'Often uncritical in small amounts. Source: outgassing from organic materials.',
    },
    {
      key: 'sulfur',
      icon: '⚠️',
      name: 'Schwefelverbindungen',
      nameEn: 'Sulfur Contamination',
      criteria: 'H₂S (m34), SO₂ (m64), SO⁺ (m48)',
      severity: 'warning',
      masses: [34, 33, 32, 64, 48, 66],
      description: 'H₂S: Base Peak bei m/z 34, Fragment bei 33. SO₂: Base Peak bei m/z 64, charakteristisches SO⁺ bei m/z 48. ³⁴S-Isotop hilft bei Bestätigung.',
      descriptionEn: 'H₂S: Base peak at m/z 34, fragment at 33. SO₂: Base peak at m/z 64, characteristic SO⁺ at m/z 48. ³⁴S isotope helps confirmation.',
      recommendation: 'Schwefelquellen identifizieren (Gummi-O-Ringe, kontaminierte Bauteile).',
      recommendationEn: 'Identify sulfur sources (rubber O-rings, contaminated components).',
    },
    // Systemzustände
    {
      key: 'n2_co_mixture',
      icon: '⚠️',
      name: 'N₂/CO-Mischung',
      nameEn: 'N₂/CO Mixture',
      criteria: 'm28 mit m14 (N₂) UND m12 (CO)',
      severity: 'info',
      masses: [28, 14, 12],
      description: 'N₂ und CO haben beide den Hauptpeak bei m/z 28 und sind nicht direkt unterscheidbar. N₂ zeigt m14 (N⁺) ~7%, CO zeigt m12 (C⁺) ~4.5%.',
      descriptionEn: 'N₂ and CO both have main peak at m/z 28 and cannot be directly distinguished. N₂ shows m14 (N⁺) ~7%, CO shows m12 (C⁺) ~4.5%.',
      recommendation: 'Fragment-Verhältnisse analysieren um N₂/CO-Anteil abzuschätzen.',
      recommendationEn: 'Analyze fragment ratios to estimate N₂/CO contribution.',
    },
    {
      key: 'co_dominant',
      icon: '💨',
      name: 'CO-dominiert',
      nameEn: 'CO Dominant',
      criteria: 'm12/m28 > 0.03, m14/m28 < 0.05',
      severity: 'info',
      masses: [28, 12, 16, 14],
      description: 'Wenn m12/m28 > 3% und m14/m28 < 5%, ist CO die dominante Komponente bei m/z 28. CO ist typisches Ausgasungsprodukt.',
      descriptionEn: 'When m12/m28 > 3% and m14/m28 < 5%, CO is the dominant component at m/z 28. CO is a typical outgassing product.',
      recommendation: 'CO-Ausgasung durch Bakeout reduzieren.',
      recommendationEn: 'Reduce CO outgassing by baking.',
    },
    {
      key: 'esd_artifacts',
      icon: '⚡',
      name: 'ESD-Artefakte',
      nameEn: 'ESD Artifacts',
      criteria: 'Anomale O⁺, F⁺, Cl⁺ ohne Quelle',
      severity: 'info',
      masses: [16, 19, 35],
      description: 'Elektronen-stimulierte Desorption (ESD) kann Peaks bei m16 (O⁺), m19 (F⁺), m35 (Cl⁺) erzeugen, ohne dass entsprechende Gase vorhanden sind.',
      descriptionEn: 'Electron-stimulated desorption (ESD) can create peaks at m16 (O⁺), m19 (F⁺), m35 (Cl⁺) without corresponding gases being present.',
      recommendation: 'Elektronenenergie reduzieren und prüfen ob Peaks verschwinden.',
      recommendationEn: 'Reduce electron energy and check if peaks disappear.',
    },
    // Positive Diagnosen
    {
      key: 'h2_dominant',
      icon: '✅',
      name: 'H₂-dominant',
      nameEn: 'H₂ Dominant',
      criteria: 'm2 >> m18, typisch nach Bakeout',
      severity: 'ok',
      masses: [2, 1],
      description: 'Wasserstoff dominiert das Spektrum - typischer Zustand nach erfolgreichem Bakeout. H₂ permeiert durch Edelstahl und ist das Hauptrestgas in UHV.',
      descriptionEn: 'Hydrogen dominates the spectrum - typical state after successful bakeout. H₂ permeates through stainless steel and is the main residual gas in UHV.',
      recommendation: 'Idealer Zustand für UHV-Systeme.',
      recommendationEn: 'Ideal condition for UHV systems.',
    },
    {
      key: 'clean_uhv',
      icon: '✨',
      name: 'Sauberes UHV',
      nameEn: 'Clean UHV',
      criteria: 'Nur H₂, minimale Kontamination',
      severity: 'ok',
      masses: [2],
      description: 'Exzellenter Systemzustand: Nur H₂ als dominantes Restgas, alle anderen Peaks unter den Grenzwerten.',
      descriptionEn: 'Excellent system condition: Only H₂ as dominant residual gas, all other peaks below limits.',
      recommendation: 'System ist bereit für UHV-Betrieb.',
      recommendationEn: 'System is ready for UHV operation.',
    },
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
          {isGerman ? 'Automatische Diagnosen' : 'Automatic Diagnoses'} ({diagnoses.length})
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {diagnoses.map((diag) => (
            <div key={diag.key} className="bg-surface-card-muted rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedDiagnosis(expandedDiagnosis === diag.key ? null : diag.key)}
                className="w-full flex items-start gap-3 p-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
              >
                <span className="text-xl">{diag.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-primary">
                      {isGerman ? diag.name : diag.nameEn}
                    </span>
                    <span className={cn(
                      'text-micro px-1.5 py-0.5 rounded',
                      diag.severity === 'critical' && 'bg-state-danger/20 text-state-danger',
                      diag.severity === 'warning' && 'bg-state-warning/20 text-state-warning',
                      diag.severity === 'info' && 'bg-aqua-500/20 text-aqua-500',
                      diag.severity === 'ok' && 'bg-state-success/20 text-state-success'
                    )}>
                      {diag.severity === 'critical' ? (isGerman ? 'Kritisch' : 'Critical') :
                       diag.severity === 'warning' ? (isGerman ? 'Warnung' : 'Warning') :
                       diag.severity === 'info' ? 'Info' :
                       (isGerman ? 'OK' : 'OK')}
                    </span>
                    <span className={cn(
                      'ml-auto transition-transform',
                      expandedDiagnosis === diag.key && 'rotate-180'
                    )}>▼</span>
                  </div>
                  <p className="text-caption text-text-muted">{diag.criteria}</p>
                </div>
              </button>

              {/* Expanded Details */}
              {expandedDiagnosis === diag.key && (
                <div className="px-3 pb-3 border-t border-subtle/50 mt-1 pt-3 space-y-3">
                  {/* Charakteristische Massen */}
                  <div>
                    <span className="text-micro text-text-muted block mb-1">
                      {isGerman ? 'Charakteristische Massen' : 'Characteristic Masses'}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {diag.masses.map(m => (
                        <span key={m} className="px-2 py-0.5 bg-aqua-500/10 text-aqua-500 rounded font-mono text-caption">
                          m/z {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Beschreibung */}
                  <div>
                    <span className="text-micro text-text-muted block mb-1">
                      {isGerman ? 'Beschreibung' : 'Description'}
                    </span>
                    <p className="text-caption text-text-secondary">
                      {isGerman ? diag.description : diag.descriptionEn}
                    </p>
                  </div>

                  {/* Empfehlung */}
                  <div className="rounded-lg p-2 bg-bg-secondary">
                    <span className="text-micro text-text-muted block mb-1">
                      {isGerman ? '💡 Empfehlung' : '💡 Recommendation'}
                    </span>
                    <p className="text-caption font-medium text-text-primary">
                      {isGerman ? diag.recommendation : diag.recommendationEn}
                    </p>
                  </div>
                </div>
              )}
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
    <div className="space-y-4">
      <p className="text-caption text-text-muted">
        {isGerman
          ? `${patterns.length} diagnostische Massenmuster für automatische Erkennung`
          : `${patterns.length} diagnostic mass patterns for automatic detection`}
      </p>

      {categories.map(cat => {
        const catPatterns = patterns.filter(p => p.category === cat.key)
        if (catPatterns.length === 0) return null
        return (
          <section key={cat.key}>
            <h4 className="font-medium text-text-secondary text-caption mb-2">
              {isGerman ? cat.name : cat.nameEn} ({catPatterns.length})
            </h4>
            <div className="space-y-2">
              {catPatterns.map((pattern, i) => (
                <div key={i} className="bg-surface-card-muted rounded-lg p-3">
                  <h5 className="font-medium text-text-primary mb-2">
                    {isGerman ? pattern.name : pattern.nameEn}
                  </h5>
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
            </div>
          </section>
        )
      })}

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
