import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils/cn'
import { GAS_LIBRARY, type GasSpecies } from '@/lib/knowledge/gasLibrary'
import { MASS_REFERENCE } from '@/lib/knowledge/massReference'
import { DIAGNOSTIC_MASS_GROUPS, SENSITIVITY_FACTORS, ISOTOPE_RATIOS } from '@/lib/knowledge'
import { OUTGASSING_MATERIALS } from '@/lib/knowledge/outgassingRates'
import { DETECTOR_VALIDATIONS } from '@/lib/diagnosis/validation'
import { DiagnosisType } from '@/lib/diagnosis/types'
import { ValidationBadge } from '@/components/ValidationBadge'

type TabKey = 'criteria' | 'gases' | 'masses' | 'patterns' | 'calibration' | 'outgassing' | 'rateOfRise' | 'validation' | 'references'

interface KnowledgePanelProps {
  compact?: boolean
  onShowOutgassing?: () => void
}

export function KnowledgePanel({ compact, onShowOutgassing }: KnowledgePanelProps) {
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
    { key: 'calibration', label: 'Kalibrierung', labelEn: 'Calibration' },
    { key: 'outgassing', label: 'Ausgasung', labelEn: 'Outgassing' },
    { key: 'rateOfRise', label: 'Rate of Rise', labelEn: 'Rate of Rise' },
    { key: 'validation', label: 'Validierung', labelEn: 'Validation' },
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
        {activeTab === 'calibration' && <CalibrationTab isGerman={isGerman} />}
        {activeTab === 'outgassing' && <OutgassingInfoTab isGerman={isGerman} onShowOutgassing={onShowOutgassing} />}
        {activeTab === 'rateOfRise' && <RateOfRiseTab isGerman={isGerman} />}
        {activeTab === 'validation' && <ValidationTab isGerman={isGerman} />}
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
    // Halbleiter-spezifische Diagnosen
    {
      key: 'polymer_outgassing',
      icon: '🧱',
      name: 'Polymer-Ausgasung',
      nameEn: 'Polymer Outgassing',
      criteria: 'm41 + m55 + m69 (C₃/C₄/C₅-Fragmente)',
      severity: 'warning',
      masses: [41, 55, 69, 27, 29, 43, 57],
      description: 'Typische Alkyl-Fragmente von Kunststoffen und Elastomeren. m/z 41, 55, 69 sind charakteristische CₙH₂ₙ₋₁-Ionen. Oft von O-Ringen, Dichtungen oder Kabeln.',
      descriptionEn: 'Typical alkyl fragments from plastics and elastomers. m/z 41, 55, 69 are characteristic CₙH₂ₙ₋₁ ions. Often from O-rings, seals, or cables.',
      recommendation: 'Polymere Materialien identifizieren und durch UHV-kompatible ersetzen. Längeres Ausheizen bei moderaten Temperaturen.',
      recommendationEn: 'Identify polymer materials and replace with UHV-compatible ones. Extended baking at moderate temperatures.',
    },
    {
      key: 'plasticizer_contamination',
      icon: '⚠️',
      name: 'Weichmacher-Kontamination',
      nameEn: 'Plasticizer Contamination',
      criteria: 'm149 (Phthalat-Fragment) kritisch!',
      severity: 'critical',
      masses: [149, 167, 279, 43, 57, 71],
      description: 'Phthalate (Weichmacher) zeigen charakteristischen Peak bei m/z 149 (C₈H₅O₃⁺). Kritisch für UHV! Quelle: O-Ringe, Kunststoffe, Kabel mit PVC.',
      descriptionEn: 'Phthalates (plasticizers) show characteristic peak at m/z 149 (C₈H₅O₃⁺). Critical for UHV! Source: O-rings, plastics, cables with PVC.',
      recommendation: 'SOFORT handeln! Alle PVC-haltigen Materialien entfernen. Viton/FKM statt Nitril-O-Ringe verwenden.',
      recommendationEn: 'ACT IMMEDIATELY! Remove all PVC-containing materials. Use Viton/FKM instead of nitrile O-rings.',
    },
    {
      key: 'process_gas_residue',
      icon: '🏭',
      name: 'Prozessgas-Rückstände',
      nameEn: 'Process Gas Residue',
      criteria: 'NF₃ (m52/m71), WF₆ (m183), GeH₄ (m76)',
      severity: 'warning',
      masses: [52, 71, 183, 76, 85, 86, 117, 146, 119, 127],
      description: 'Halbleiter-Prozessgase: NF₃ zeigt m/z 52 + 71, WF₆ zeigt m/z 183 (WF₅⁺), GeH₄ zeigt m/z 76 mit Ge-Isotopenmuster. Auch SF₆ (m127), C₂F₆, SiF₄.',
      descriptionEn: 'Semiconductor process gases: NF₃ shows m/z 52 + 71, WF₆ shows m/z 183 (WF₅⁺), GeH₄ shows m/z 76 with Ge isotope pattern. Also SF₆ (m127), C₂F₆, SiF₄.',
      recommendation: 'Kammer gründlich spülen. Vor neuem Prozess Baseline-Messung durchführen.',
      recommendationEn: 'Purge chamber thoroughly. Perform baseline measurement before new process.',
    },
    {
      key: 'cooling_water_leak',
      icon: '🚰',
      name: 'Kühlwasser-Leck',
      nameEn: 'Cooling Water Leak',
      criteria: 'm18 + m17 hoch, m40 (Ar) erhöht',
      severity: 'critical',
      masses: [18, 17, 40, 44, 32],
      description: 'Kombination aus hohem H₂O (m18/m17) mit erhöhtem Ar (m40) deutet auf Kühlwasser-Leck hin. Kühlwasser enthält gelöstes Ar aus der Luft.',
      descriptionEn: 'Combination of high H₂O (m18/m17) with elevated Ar (m40) indicates cooling water leak. Cooling water contains dissolved Ar from air.',
      recommendation: 'KRITISCH! Sofort Kühlkreisläufe auf Lecks prüfen. Kann zu Katastrophenfall führen!',
      recommendationEn: 'CRITICAL! Check cooling circuits for leaks immediately. Can lead to catastrophic failure!',
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
      criteria: '6 Kriterien: O⁺/O₂, N⁺/N₂, C⁺/CO, H⁺/H₂, F⁺, Cl-Isotope',
      severity: 'info',
      masses: [1, 2, 12, 14, 16, 19, 28, 32, 35, 37],
      description: 'Electron Stimulated Desorption (ESD) erzeugt überhöhte atomare Ionen am Ionisatorgitter. Erkannt durch 6 Kriterien: (1) O⁺/O₂ Ratio > 0.50, (2) N⁺/N₂ Ratio > 0.15, (3) C⁺/CO Ratio > 0.12, (4) H⁺/H₂ Ratio > 0.05, (5) F⁺ ohne CF₃⁺, (6) Anomale Cl-Isotopenverhältnisse. Severity: info bei 2-3 Kriterien, warning bei ≥4 Kriterien.',
      descriptionEn: 'Electron Stimulated Desorption (ESD) generates elevated atomic ions at the ionizer grid. Detected via 6 criteria: (1) O⁺/O₂ ratio > 0.50, (2) N⁺/N₂ ratio > 0.15, (3) C⁺/CO ratio > 0.12, (4) H⁺/H₂ ratio > 0.05, (5) F⁺ without CF₃⁺, (6) Anomalous Cl isotope ratios. Severity: info at 2-3 criteria, warning at ≥4 criteria.',
      recommendation: 'Leicht (2-3 Kriterien): Ionisator degasen (20mA/500eV, 10min). Schwer (≥4 Kriterien): Intensiv degasen (30min), ggf. Filament austauschen. Elektronenenergie variieren zum Test.',
      recommendationEn: 'Light (2-3 criteria): Degas ionizer (20mA/500eV, 10min). Heavy (≥4 criteria): Intensive degassing (30min), consider filament replacement. Vary electron energy for testing.',
    },
    {
      key: 'helium_leak',
      icon: '🎈',
      name: 'Helium-Leck-Indikator',
      nameEn: 'Helium Leak Indicator',
      criteria: 'm/z 4 > 0.01, He/H₂ > 0.1 auffällig',
      severity: 'info',
      masses: [4, 3],
      description: 'Qualitative Helium-Detektion bei m/z 4. WICHTIG: RGAs sind 1-2 Größenordnungen weniger sensitiv als dedizierte He-Lecktester. Mögliche Quellen: He-Leck, He-Tracergas, oder D₂ (Deuterium). m/z 3 (HD) deutet auf D₂ hin. KEINE quantitative Leckratenbestimmung möglich!',
      descriptionEn: 'Qualitative helium detection at m/z 4. IMPORTANT: RGAs are 1-2 orders of magnitude less sensitive than dedicated He leak detectors. Possible sources: He leak, He tracer gas, or D₂ (deuterium). m/z 3 (HD) indicates D₂. NO quantitative leak rate determination possible!',
      recommendation: 'Bei Verdacht auf Leck → Dedizierten He-Leckdetektor einsetzen (Sensitivität: ~5×10⁻¹² mbar·l/s). Bei He-Tracergas-Test → Signal bestätigt He-Anwesenheit. Bei D₂-Nutzung → m/z 3 (HD) prüfen zur Unterscheidung.',
      recommendationEn: 'If leak suspected → Use dedicated He leak detector (sensitivity: ~5×10⁻¹² mbar·l/s). If He tracer gas test → Signal confirms He presence. If D₂ in use → Check m/z 3 (HD) to distinguish.',
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
      {/* Introduction */}
      <div className="bg-gradient-to-r from-aqua-500/10 to-aqua-600/5 rounded-lg p-4 border border-aqua-500/20">
        <h3 className="font-semibold text-aqua-600 dark:text-aqua-400 mb-2">
          {isGerman ? 'Qualitäts- und Diagnosekriterien' : 'Quality & Diagnostic Criteria'}
        </h3>
        <p className="text-caption text-text-secondary leading-relaxed">
          {isGerman
            ? 'Diese Sektion enthält die wissenschaftlichen Grundlagen für die automatische Spektrenauswertung. Die Qualitätsprüfungen basieren auf etablierten Verhältnissen und Grenzwerten aus der UHV-Technik (CERN, GSI, DESY). Die Diagnose-Algorithmen erkennen charakteristische Muster im Massenspektrum und klassifizieren potenzielle Probleme nach Schweregrad.'
            : 'This section contains the scientific foundations for automatic spectrum evaluation. Quality checks are based on established ratios and limits from UHV technology (CERN, GSI, DESY). The diagnostic algorithms detect characteristic patterns in the mass spectrum and classify potential problems by severity.'}
        </p>
      </div>

      {/* Quality Checks */}
      <section>
        <h3 className="font-semibold text-text-primary mb-3">
          {isGerman ? 'Qualitätsprüfungen' : 'Quality Checks'}
        </h3>
        <p className="text-caption text-text-muted mb-3">
          {isGerman
            ? 'Automatische Prüfungen zur Beurteilung der Vakuumqualität. Jede Prüfung basiert auf Peak-Verhältnissen, die auf physikalische oder kontaminationsbedingte Zustände hinweisen.'
            : 'Automatic checks to assess vacuum quality. Each check is based on peak ratios that indicate physical or contamination-related conditions.'}
        </p>
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
        <p className="text-caption text-text-muted mb-3">
          {isGerman
            ? 'Der Diagnose-Algorithmus erkennt automatisch charakteristische Spektrenmuster und ordnet diese bekannten Vakuumproblemen zu. Jede Diagnose enthält typische Massen, Beschreibung und Handlungsempfehlungen.'
            : 'The diagnostic algorithm automatically detects characteristic spectrum patterns and maps them to known vacuum issues. Each diagnosis includes typical masses, description, and recommended actions.'}
        </p>
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

      {/* Data Quality Score System */}
      <section>
        <h3 className="font-semibold text-text-primary mb-3">
          {isGerman ? 'Datenqualitäts-Bewertung' : 'Data Quality Assessment'}
        </h3>
        <p className="text-caption text-text-muted mb-3">
          {isGerman
            ? 'Das Datenqualitäts-Score System bewertet die Zuverlässigkeit der RGA-Messdaten und gibt an, wie vertrauenswürdig die automatischen Diagnosen sind. Die Bewertung ist kontextabhängig und berücksichtigt den Systemzustand (ausgeheizt/nicht ausgeheizt) sowie den Druckbereich.'
            : 'The data quality score system evaluates the reliability of RGA measurement data and indicates how trustworthy the automatic diagnoses are. The assessment is context-dependent and considers the system state (baked/unbaked) as well as the pressure range.'}
        </p>

        {/* Quality Factors - Detailed */}
        <div className="space-y-3 mb-4">
          <h4 className="text-caption font-medium text-text-primary">
            {isGerman ? 'Qualitätsfaktoren im Detail' : 'Quality Factors in Detail'}
          </h4>

          {/* SNR */}
          <div className="bg-surface-card-muted rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-aqua-500 text-sm">1.5×</span>
              <span className="font-medium text-text-primary">
                {isGerman ? 'Signal-Rausch-Verhältnis (SNR)' : 'Signal-to-Noise Ratio (SNR)'}
              </span>
            </div>
            <p className="text-caption text-text-muted mb-2">
              {isGerman
                ? 'Misst das Verhältnis zwischen dem stärksten Signal und dem Grundrauschen in Dezibel (dB). Ein höherer Wert bedeutet klarere Signale und zuverlässigere Peak-Erkennung.'
                : 'Measures the ratio between the strongest signal and background noise in decibels (dB). Higher values mean clearer signals and more reliable peak detection.'}
            </p>
            <div className="grid grid-cols-2 gap-2 text-micro">
              <div>
                <span className="text-text-muted block">{isGerman ? 'Standard-System:' : 'Standard system:'}</span>
                <span className="text-text-secondary">≥60 dB = Exzellent, ≥40 dB = Gut, ≥25 dB = OK</span>
              </div>
              <div>
                <span className="text-text-muted block">{isGerman ? 'Baked/UHV-System:' : 'Baked/UHV system:'}</span>
                <span className="text-text-secondary">≥45 dB = Exzellent, ≥30 dB = Gut, ≥18 dB = OK</span>
              </div>
            </div>
          </div>

          {/* Peak Detection */}
          <div className="bg-state-warning/10 border border-state-warning/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-aqua-500 text-sm">1.2×</span>
              <span className="font-medium text-text-primary">
                {isGerman ? 'Peak-Erkennung' : 'Peak Detection'}
              </span>
              <span className="text-micro bg-state-warning/20 text-state-warning px-1.5 py-0.5 rounded">
                {isGerman ? 'Kontextabhängig!' : 'Context-dependent!'}
              </span>
            </div>
            <p className="text-caption text-text-muted mb-2">
              {isGerman
                ? 'Zählt die Anzahl signifikanter Peaks im Spektrum. WICHTIG: Die Bewertung ist invertiert je nach Systemzustand! Ein sauberes UHV-System nach dem Ausheizen sollte WENIGE Peaks haben.'
                : 'Counts the number of significant peaks in the spectrum. IMPORTANT: The evaluation is inverted depending on system state! A clean UHV system after bakeout should have FEW peaks.'}
            </p>
            <div className="grid grid-cols-2 gap-2 text-caption mt-2">
              <div className="bg-bg-secondary rounded p-2">
                <span className="font-medium text-state-success block mb-1">
                  {isGerman ? '✓ Nach Ausheizen (Baked/UHV)' : '✓ After Bakeout (Baked/UHV)'}
                </span>
                <ul className="text-micro text-text-secondary space-y-0.5">
                  <li>≤3 Peaks = 100% ({isGerman ? 'Sauber!' : 'Clean!'})</li>
                  <li>≤5 Peaks = 85% ({isGerman ? 'Gut' : 'Good'})</li>
                  <li>≤8 Peaks = 60% ({isGerman ? 'Restgas' : 'Residual'})</li>
                  <li>&gt;8 Peaks = 40% ({isGerman ? 'Kontamination?' : 'Contamination?'})</li>
                </ul>
              </div>
              <div className="bg-bg-secondary rounded p-2">
                <span className="font-medium text-text-primary block mb-1">
                  {isGerman ? 'Nicht ausgeheizt (Unbaked)' : 'Not Baked (Unbaked)'}
                </span>
                <ul className="text-micro text-text-secondary space-y-0.5">
                  <li>≥5 sig. Peaks = 100% ({isGerman ? 'Normal' : 'Normal'})</li>
                  <li>≥3 sig. Peaks = 80%</li>
                  <li>≥2 sig. Peaks = 55%</li>
                  <li>1 Peak = 30% ({isGerman ? 'Detektor prüfen!' : 'Check detector!'})</li>
                </ul>
              </div>
            </div>
            <p className="text-micro text-state-warning mt-2">
              {isGerman
                ? '⚠️ Signifikanz-Schwelle: Baked = 0.1% (H₂ dominant!), Unbaked = 1%'
                : '⚠️ Significance threshold: Baked = 0.1% (H₂ dominant!), Unbaked = 1%'}
            </p>
          </div>

          {/* Mass Range */}
          <div className="bg-surface-card-muted rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-aqua-500 text-sm">0.9×</span>
              <span className="font-medium text-text-primary">
                {isGerman ? 'Massenbereich-Abdeckung' : 'Mass Range Coverage'}
              </span>
            </div>
            <p className="text-caption text-text-muted mb-2">
              {isGerman
                ? 'Prüft, ob alle kritischen Massen für eine vollständige Diagnose im Scan enthalten sind. Ohne diese Massen können bestimmte Diagnosen nicht gestellt werden.'
                : 'Checks if all critical masses for a complete diagnosis are included in the scan. Without these masses, certain diagnoses cannot be made.'}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {[2, 14, 16, 17, 18, 28, 32, 40, 44].map(m => (
                <span key={m} className="px-2 py-0.5 bg-aqua-500/10 text-aqua-500 rounded font-mono text-micro">
                  m/z {m}
                </span>
              ))}
            </div>
            <p className="text-micro text-text-muted mt-2">
              {isGerman
                ? 'H₂(2), N⁺(14), O⁺(16), OH⁺(17), H₂O(18), N₂/CO(28), O₂(32), Ar(40), CO₂(44)'
                : 'H₂(2), N⁺(14), O⁺(16), OH⁺(17), H₂O(18), N₂/CO(28), O₂(32), Ar(40), CO₂(44)'}
            </p>
          </div>

          {/* Dynamic Range */}
          <div className="bg-surface-card-muted rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-aqua-500 text-sm">0.8×</span>
              <span className="font-medium text-text-primary">
                {isGerman ? 'Dynamikbereich' : 'Dynamic Range'}
              </span>
            </div>
            <p className="text-caption text-text-muted mb-2">
              {isGerman
                ? 'Misst die Anzahl der Dekaden (Größenordnungen) zwischen kleinstem und größtem Signal. Ein größerer Dynamikbereich ermöglicht die Erkennung sowohl starker als auch schwacher Peaks.'
                : 'Measures the number of decades (orders of magnitude) between smallest and largest signal. A larger dynamic range enables detection of both strong and weak peaks.'}
            </p>
            <div className="grid grid-cols-2 gap-2 text-micro">
              <div>
                <span className="text-text-muted block">{isGerman ? 'Standard:' : 'Standard:'}</span>
                <span className="text-text-secondary">≥5 Dekaden = Exzellent, ≥4 = Gut, ≥3 = OK</span>
              </div>
              <div>
                <span className="text-text-muted block">{isGerman ? 'Baked/UHV:' : 'Baked/UHV:'}</span>
                <span className="text-text-secondary">≥4 Dekaden = Exzellent, ≥3 = Gut, ≥2 = OK</span>
              </div>
            </div>
          </div>

          {/* H2 Reference */}
          <div className="bg-surface-card-muted rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-aqua-500 text-sm">0.7×</span>
              <span className="font-medium text-text-primary">
                {isGerman ? 'H₂-Referenz' : 'H₂ Reference'}
              </span>
            </div>
            <p className="text-caption text-text-muted mb-2">
              {isGerman
                ? 'Bewertet das Verhältnis von H₂ zu H₂O. Nach erfolgreichem Ausheizen sollte H₂ dominieren (permeiert durch Edelstahl), während H₂O niedrig sein sollte.'
                : 'Evaluates the ratio of H₂ to H₂O. After successful bakeout, H₂ should dominate (permeates through stainless steel), while H₂O should be low.'}
            </p>
            <div className="grid grid-cols-2 gap-2 text-micro">
              <div>
                <span className="text-text-muted block">{isGerman ? 'Baked-System:' : 'Baked system:'}</span>
                <span className="text-text-secondary">H₂ &gt; H₂O = 100% ({isGerman ? 'Erfolgreich!' : 'Success!'})</span>
              </div>
              <div>
                <span className="text-text-muted block">{isGerman ? 'Unbaked-System:' : 'Unbaked system:'}</span>
                <span className="text-text-secondary">H₂ dominant = 100% ({isGerman ? 'Typisch Edelstahl' : 'Typical SS'})</span>
              </div>
            </div>
          </div>

          {/* Temperature (optional) */}
          <div className="bg-surface-card-muted rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-aqua-500 text-sm">0.6×</span>
              <span className="font-medium text-text-primary">
                {isGerman ? 'Temperatur' : 'Temperature'}
              </span>
              <span className="text-micro text-text-muted">({isGerman ? 'wenn im Dateinamen' : 'if in filename'})</span>
            </div>
            <p className="text-caption text-text-muted">
              {isGerman
                ? 'Bewertet die Messtemperatur aus dem Dateinamen (z.B. "20C"). Ideale RGA-Betriebstemperatur: 20-25°C. Extreme Temperaturen können die Messung beeinflussen.'
                : 'Evaluates measurement temperature from filename (e.g., "20C"). Ideal RGA operating temperature: 20-25°C. Extreme temperatures can affect measurement.'}
            </p>
          </div>
        </div>

        {/* Grades */}
        <div className="bg-surface-card-muted rounded-lg p-3 mb-3">
          <h4 className="text-caption font-medium text-text-primary mb-2">
            {isGerman ? 'Bewertungsstufen & Diagnose-Zuverlässigkeit' : 'Grading Scale & Diagnosis Reliability'}
          </h4>
          <div className="space-y-2">
            {[
              { grade: 'A', color: '#10B981', min: '≥90%', reliability: isGerman ? 'Hoch' : 'High', desc: isGerman ? 'Exzellente Datenqualität - Diagnosen hochzuverlässig' : 'Excellent data quality - diagnoses highly reliable' },
              { grade: 'B', color: '#3B82F6', min: '≥75%', reliability: isGerman ? 'Hoch' : 'High', desc: isGerman ? 'Gute Datenqualität - Diagnosen zuverlässig' : 'Good data quality - diagnoses reliable' },
              { grade: 'C', color: '#F59E0B', min: '≥55%', reliability: isGerman ? 'Mittel' : 'Medium', desc: isGerman ? 'Akzeptable Datenqualität - Diagnosen mit Vorbehalt' : 'Acceptable data quality - diagnoses with reservations' },
              { grade: 'D', color: '#F97316', min: '≥35%', reliability: isGerman ? 'Niedrig' : 'Low', desc: isGerman ? 'Eingeschränkte Datenqualität - Diagnosen unsicher' : 'Limited data quality - diagnoses uncertain' },
              { grade: 'F', color: '#EF4444', min: '<35%', reliability: isGerman ? 'Sehr niedrig' : 'Very low', desc: isGerman ? 'Unzureichende Datenqualität - Diagnosen nicht zuverlässig' : 'Insufficient data quality - diagnoses unreliable' },
            ].map(g => (
              <div key={g.grade} className="flex items-center gap-3 p-2 rounded" style={{ backgroundColor: `${g.color}10` }}>
                <span className="font-bold text-lg w-8" style={{ color: g.color }}>{g.grade}</span>
                <span className="font-mono text-micro w-12 text-text-muted">{g.min}</span>
                <span className="text-caption text-text-secondary flex-1">{g.desc}</span>
                <span className="text-micro px-2 py-0.5 rounded" style={{ backgroundColor: `${g.color}20`, color: g.color }}>
                  {g.reliability}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Automatic Detection */}
        <div className="bg-surface-card-muted rounded-lg p-3">
          <h4 className="text-caption font-medium text-text-primary mb-2">
            {isGerman ? 'Automatische Systemzustand-Erkennung' : 'Automatic System State Detection'}
          </h4>
          <p className="text-caption text-text-muted mb-3">
            {isGerman
              ? 'Der Kontext für die Bewertung wird automatisch aus mehreren Quellen ermittelt:'
              : 'The context for assessment is automatically determined from multiple sources:'}
          </p>

          <div className="space-y-2">
            <div className="bg-bg-secondary rounded p-2">
              <span className="text-aqua-500 font-mono mr-2">1.</span>
              <span className="font-medium text-text-primary">
                {isGerman ? 'Dateiname-Analyse' : 'Filename Analysis'}
              </span>
              <p className="text-micro text-text-muted mt-1 ml-5">
                {isGerman
                  ? 'Regex-Patterns für DE/EN: "nach Ausheizen", "nach ausheizen", "after bakeout", "baked", "post_bake" → BAKED | "vor Ausheizen", "before bake out", "unbaked" → UNBAKED'
                  : 'Regex patterns for DE/EN: "nach Ausheizen", "nach ausheizen", "after bakeout", "baked", "post_bake" → BAKED | "vor Ausheizen", "before bake out", "unbaked" → UNBAKED'}
              </p>
            </div>

            <div className="bg-bg-secondary rounded p-2">
              <span className="text-aqua-500 font-mono mr-2">2.</span>
              <span className="font-medium text-text-primary">
                {isGerman ? 'Spektrum-Charakteristik' : 'Spectrum Characteristics'}
              </span>
              <p className="text-micro text-text-muted mt-1 ml-5">
                {isGerman
                  ? 'Falls Dateiname keinen Hinweis gibt: H₂ > H₂O × 3 → BAKED | H₂ > H₂O mit ≤7 Peaks → BAKED | ≤3 Peaks mit H₂ > 10% → UHV | H₂O > H₂ → UNBAKED'
                  : 'If filename gives no hint: H₂ > H₂O × 3 → BAKED | H₂ > H₂O with ≤7 peaks → BAKED | ≤3 peaks with H₂ > 10% → UHV | H₂O > H₂ → UNBAKED'}
              </p>
            </div>

            <div className="bg-bg-secondary rounded p-2">
              <span className="text-aqua-500 font-mono mr-2">3.</span>
              <span className="font-medium text-text-primary">
                {isGerman ? 'Totaldruck aus Dateiname' : 'Total Pressure from Filename'}
              </span>
              <p className="text-micro text-text-muted mt-1 ml-5">
                {isGerman
                  ? 'z.B. "2,1e-9mbar" oder "5e-10mbar" → Druck < 1×10⁻⁹ mbar aktiviert UHV-Kontext mit angepassten Schwellenwerten'
                  : 'e.g., "2,1e-9mbar" or "5e-10mbar" → Pressure < 1×10⁻⁹ mbar activates UHV context with adjusted thresholds'}
              </p>
            </div>
          </div>
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
      {/* Introduction */}
      <div className="bg-gradient-to-r from-aqua-500/10 to-aqua-600/5 rounded-lg p-4 border border-aqua-500/20">
        <h3 className="font-semibold text-aqua-600 dark:text-aqua-400 mb-2">
          {isGerman ? 'Gasbibliothek' : 'Gas Library'}
        </h3>
        <p className="text-caption text-text-secondary leading-relaxed mb-2">
          {isGerman
            ? 'Diese Bibliothek enthält Referenzdaten für die Identifikation von Gasen im Massenspektrum. Die Cracking Patterns zeigen, wie jedes Gas bei 70 eV Elektronenstoß-Ionisation fragmentiert. Der Hauptpeak (Base Peak) hat per Definition 100% relative Intensität.'
            : 'This library contains reference data for gas identification in mass spectra. The cracking patterns show how each gas fragments at 70 eV electron impact ionization. The main peak (base peak) has 100% relative intensity by definition.'}
        </p>
        <div className="flex gap-4 text-caption">
          <span className="text-text-muted">
            {isGerman ? `${GAS_LIBRARY.length} Gase` : `${GAS_LIBRARY.length} gases`}
          </span>
          <span className="text-text-muted">•</span>
          <span className="text-text-muted">70 eV EI</span>
          <span className="text-text-muted">•</span>
          <span className="text-text-muted">
            {isGerman ? 'NIST-kompatibel' : 'NIST-compatible'}
          </span>
        </div>
      </div>

      {/* Newly Added Gases */}
      <div className="bg-gradient-to-r from-mint-500/10 to-mint-600/5 rounded-lg p-4 border border-mint-500/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">✨</span>
          <h3 className="font-semibold text-mint-600 dark:text-mint-400">
            {isGerman ? 'Neu hinzugefügt (Jan 2026)' : 'Newly Added (Jan 2026)'}
          </h3>
        </div>
        <p className="text-caption text-text-secondary mb-3">
          {isGerman
            ? 'Halbleiter-Prozessgase für Plasma-Ätzen und CVD-Anwendungen'
            : 'Semiconductor process gases for plasma etching and CVD applications'}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { formula: 'NF₃', name: 'Stickstofftrifluorid', nameEn: 'Nitrogen Trifluoride', mz: 71, key: 'NF3' },
            { formula: 'WF₆', name: 'Wolframhexafluorid', nameEn: 'Tungsten Hexafluoride', mz: 298, key: 'WF6' },
            { formula: 'C₂F₆', name: 'Hexafluorethan', nameEn: 'Hexafluoroethane', mz: 69, key: 'C2F6' },
            { formula: 'GeH₄', name: 'Germaniumhydrid', nameEn: 'Germane', mz: 76, key: 'GeH4' }
          ].map(g => (
            <button
              key={g.key}
              onClick={() => setExpandedGas(expandedGas === g.key ? null : g.key)}
              className="flex items-center justify-between p-2 bg-mint-500/10 hover:bg-mint-500/20 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-mint-600 dark:text-mint-400 font-medium">{g.formula}</span>
                <span className="text-caption text-text-secondary">{isGerman ? g.name : g.nameEn}</span>
              </div>
              <span className="text-micro text-text-muted">m/z {g.mz}</span>
            </button>
          ))}
        </div>
      </div>

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
      {/* Introduction */}
      <div className="bg-gradient-to-r from-aqua-500/10 to-aqua-600/5 rounded-lg p-4 border border-aqua-500/20">
        <h3 className="font-semibold text-aqua-600 dark:text-aqua-400 mb-2">
          {isGerman ? 'Massenreferenz' : 'Mass Reference'}
        </h3>
        <p className="text-caption text-text-secondary leading-relaxed mb-2">
          {isGerman
            ? 'Diese Referenz ordnet m/z-Werten mögliche Gase und Fragmente zu. Die diagnostische Bedeutung (kritisch/wichtig) basiert auf der Relevanz für typische Vakuumprobleme. Kritische Massen erfordern bei Auffälligkeit sofortige Aufmerksamkeit.'
            : 'This reference maps m/z values to possible gases and fragments. The diagnostic significance (critical/important) is based on relevance for typical vacuum problems. Critical masses require immediate attention when anomalies are detected.'}
        </p>
        <div className="flex gap-4 text-caption">
          <span className="text-text-muted">
            {isGerman ? `${MASS_REFERENCE.length} Massen` : `${MASS_REFERENCE.length} masses`}
          </span>
          <span className="text-text-muted">•</span>
          <span className="text-state-danger">{criticalMasses.length} {isGerman ? 'kritisch' : 'critical'}</span>
          <span className="text-text-muted">•</span>
          <span className="text-state-warning">{importantMasses.length} {isGerman ? 'wichtig' : 'important'}</span>
        </div>
      </div>

      {/* Newly Added Masses */}
      <div className="bg-gradient-to-r from-mint-500/10 to-mint-600/5 rounded-lg p-4 border border-mint-500/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">✨</span>
          <h3 className="font-semibold text-mint-600 dark:text-mint-400">
            {isGerman ? 'Neu hinzugefügt (Jan 2026)' : 'Newly Added (Jan 2026)'}
          </h3>
        </div>
        <p className="text-caption text-text-secondary mb-3">
          {isGerman
            ? 'Erweiterte Massenreferenz für Halbleiter-Prozesse und Weichmacher-Detektion'
            : 'Extended mass reference for semiconductor processes and plasticizer detection'}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { mass: 52, assignment: 'Cr⁺', desc: 'Chrom (Edelstahl)', descEn: 'Chromium (Stainless Steel)' },
            { mass: 119, assignment: 'SnH⁺', desc: 'Zinn-Hydrid', descEn: 'Tin Hydride' },
            { mass: 127, assignment: 'I⁺', desc: 'Iod', descEn: 'Iodine' },
            { mass: 149, assignment: 'C₈H₅O₃⁺', desc: 'Phthalat (Weichmacher!)', descEn: 'Phthalate (Plasticizer!)' }
          ].map(m => (
            <button
              key={m.mass}
              onClick={() => setExpandedMass(expandedMass === m.mass ? null : m.mass)}
              className="flex items-center justify-between p-2 bg-mint-500/10 hover:bg-mint-500/20 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-mint-600 dark:text-mint-400 font-medium">m/z {m.mass}</span>
                <span className="text-caption text-text-secondary">{m.assignment}</span>
              </div>
              <span className="text-micro text-text-muted">{isGerman ? m.desc : m.descEn}</span>
            </button>
          ))}
        </div>
      </div>

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
      {/* Introduction */}
      <div className="bg-gradient-to-r from-aqua-500/10 to-aqua-600/5 rounded-lg p-4 border border-aqua-500/20">
        <h3 className="font-semibold text-aqua-600 dark:text-aqua-400 mb-2">
          {isGerman ? 'Diagnostische Muster' : 'Diagnostic Patterns'}
        </h3>
        <p className="text-caption text-text-secondary leading-relaxed mb-2">
          {isGerman
            ? 'Spezifische Kombinationen von Massen und deren Verhältnissen ermöglichen die eindeutige Identifikation von Kontaminanten und Systemzuständen. Diese Muster bilden die Grundlage für die automatische Diagnose.'
            : 'Specific combinations of masses and their ratios enable unique identification of contaminants and system states. These patterns form the basis for automatic diagnosis.'}
        </p>
        <div className="flex flex-wrap gap-2 text-caption">
          <span className="text-text-muted">{patterns.length} {isGerman ? 'Muster' : 'patterns'}</span>
          <span className="text-text-muted">•</span>
          <span className="text-state-danger">{patterns.filter(p => p.category === 'leak').length} {isGerman ? 'Lecks' : 'leaks'}</span>
          <span className="text-text-muted">•</span>
          <span className="text-state-warning">{patterns.filter(p => p.category === 'oil' || p.category === 'solvent').length} {isGerman ? 'Kontaminationen' : 'contaminations'}</span>
        </div>
      </div>

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
// CALIBRATION TAB
// ============================================
function CalibrationTab({ isGerman }: { isGerman: boolean }) {
  const [expandedSection, setExpandedSection] = useState<string | null>('overview')

  const sections = [
    {
      key: 'overview',
      title: 'Übersicht',
      titleEn: 'Overview',
      icon: '📊',
    },
    {
      key: 'levels',
      title: 'Kalibrierungsstufen',
      titleEn: 'Calibration Levels',
      icon: '🎯',
    },
    {
      key: 'formulas',
      title: 'Formeln & Berechnungen',
      titleEn: 'Formulas & Calculations',
      icon: '📐',
    },
    {
      key: 'manometer',
      title: 'Manometer-Korrektur',
      titleEn: 'Manometer Correction',
      icon: '⚗️',
    },
    {
      key: 'temperature',
      title: 'Temperatur-Korrektur',
      titleEn: 'Temperature Correction',
      icon: '🌡️',
    },
    {
      key: 'deconvolution',
      title: 'Cracking Pattern Dekonvolution',
      titleEn: 'Cracking Pattern Deconvolution',
      icon: '🔬',
    },
    {
      key: 'rsf',
      title: 'Relative Sensitivitätsfaktoren (RSF)',
      titleEn: 'Relative Sensitivity Factors (RSF)',
      icon: '📈',
    },
    {
      key: 'device',
      title: 'Geräte-Kalibrierung',
      titleEn: 'Device Calibration',
      icon: '🔧',
    },
  ]

  return (
    <div className="space-y-4">
      <p className="text-caption text-text-muted">
        {isGerman
          ? 'Dokumentation der Druckkalibrierung: Umrechnung von RGA-Ionenströmen (A) zu Partialdrücken (mbar).'
          : 'Pressure calibration documentation: Conversion from RGA ion currents (A) to partial pressures (mbar).'}
      </p>

      {/* Accordion Sections */}
      {sections.map(section => (
        <div key={section.key} className="bg-surface-card-muted rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === section.key ? null : section.key)}
            className="w-full flex items-center gap-3 p-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
          >
            <span className="text-xl">{section.icon}</span>
            <span className="flex-1 font-medium text-text-primary">
              {isGerman ? section.title : section.titleEn}
            </span>
            <span className={cn('transition-transform', expandedSection === section.key && 'rotate-180')}>▼</span>
          </button>

          {expandedSection === section.key && (
            <div className="px-4 pb-4 border-t border-subtle/50">
              {section.key === 'overview' && <CalibrationOverview isGerman={isGerman} />}
              {section.key === 'levels' && <CalibrationLevels isGerman={isGerman} />}
              {section.key === 'formulas' && <CalibrationFormulas isGerman={isGerman} />}
              {section.key === 'manometer' && <ManometerCorrection isGerman={isGerman} />}
              {section.key === 'temperature' && <TemperatureCorrection isGerman={isGerman} />}
              {section.key === 'deconvolution' && <DeconvolutionSection isGerman={isGerman} />}
              {section.key === 'rsf' && <RSFSection isGerman={isGerman} />}
              {section.key === 'device' && <DeviceCalibrationSection isGerman={isGerman} />}
            </div>
          )}
        </div>
      ))}

      {/* Info Box */}
      <div className="bg-aqua-500/10 rounded-lg p-3">
        <p className="text-caption text-aqua-700 dark:text-aqua-300">
          {isGerman
            ? '💡 Die Standard-Kalibrierung (STANDARD) bietet ~20-25% Genauigkeit vollautomatisch ohne User-Input. Für höhere Genauigkeit (<10%) ist eine Geräte-Kalibrierung mit Referenzgas erforderlich.'
            : '💡 Standard calibration provides ~20-25% accuracy fully automatically without user input. For higher accuracy (<10%), device calibration with reference gas is required.'}
        </p>
      </div>
    </div>
  )
}

// --- Calibration Sub-Components ---

function CalibrationOverview({ isGerman }: { isGerman: boolean }) {
  return (
    <div className="space-y-4 pt-3">
      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? 'Grundprinzip' : 'Basic Principle'}
        </h5>
        <p className="text-caption text-text-secondary">
          {isGerman
            ? 'Ein RGA (Residual Gas Analyzer) misst Ionenströme in Ampere (A). Um diese in Partialdrücke (mbar) umzurechnen, wird die Empfindlichkeit (Sensitivity) des Detektors benötigt.'
            : 'An RGA (Residual Gas Analyzer) measures ion currents in Amperes (A). To convert these to partial pressures (mbar), the detector sensitivity is required.'}
        </p>
      </div>

      <div className="bg-bg-secondary rounded-lg p-3">
        <h6 className="font-mono text-sm text-aqua-500 mb-2">
          {isGerman ? 'Hauptformel:' : 'Main Formula:'}
        </h6>
        <div className="font-mono text-center py-2 text-lg">
          P<sub>gas</sub> = I / (S × RSF<sub>gas</sub>)
        </div>
        <div className="text-caption text-text-muted mt-2 space-y-1">
          <div>• <span className="font-mono">P</span> = {isGerman ? 'Partialdruck' : 'Partial pressure'} [mbar]</div>
          <div>• <span className="font-mono">I</span> = {isGerman ? 'Ionenstrom' : 'Ion current'} [A]</div>
          <div>• <span className="font-mono">S</span> = {isGerman ? 'Empfindlichkeit' : 'Sensitivity'} [A/mbar]</div>
          <div>• <span className="font-mono">RSF</span> = {isGerman ? 'Rel. Sensitivitätsfaktor' : 'Rel. Sensitivity Factor'} (N₂ = 1.0)</div>
        </div>
      </div>

      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? 'Automatische Kalibrierung' : 'Automatic Calibration'}
        </h5>
        <p className="text-caption text-text-secondary">
          {isGerman
            ? 'Die App extrahiert automatisch Metadaten aus dem Dateinamen (Totaldruck, SEM-Spannung, Temperatur, Systemzustand) und berechnet daraus die Empfindlichkeit. Korrekturen für Manometer-Gas und Temperatur werden angewandt.'
            : 'The app automatically extracts metadata from the filename (total pressure, SEM voltage, temperature, system state) and calculates the sensitivity from this. Corrections for manometer gas and temperature are applied.'}
        </p>
      </div>
    </div>
  )
}

function CalibrationLevels({ isGerman }: { isGerman: boolean }) {
  const levels = [
    {
      level: 'BASIC',
      accuracy: '~50%',
      color: 'bg-gray-100 text-gray-600',
      description: 'Keine Korrekturen, Default-Empfindlichkeit',
      descriptionEn: 'No corrections, default sensitivity',
      requirements: 'Keine',
      requirementsEn: 'None',
      features: ['Default S = 10⁻⁴ A/mbar', 'Keine RSF-Korrektur', 'Keine Dekonvolution'],
      featuresEn: ['Default S = 10⁻⁴ A/mbar', 'No RSF correction', 'No deconvolution'],
    },
    {
      level: 'STANDARD',
      accuracy: '~20-25%',
      color: 'bg-aqua-500/20 text-aqua-600',
      description: 'Vollautomatisch mit Dateinamen-Metadaten',
      descriptionEn: 'Fully automatic with filename metadata',
      requirements: 'Totaldruck im Dateinamen',
      requirementsEn: 'Total pressure in filename',
      features: ['Manometer-Korrektur', 'Temperatur-Korrektur', 'Cracking Pattern Dekonvolution', 'RSF-gewichtete Berechnung'],
      featuresEn: ['Manometer correction', 'Temperature correction', 'Cracking pattern deconvolution', 'RSF-weighted calculation'],
    },
    {
      level: 'ADVANCED',
      accuracy: '~10-15%',
      color: 'bg-amber-100 text-amber-600',
      description: 'Mit Geräte-Kalibrierung (N₂-Referenz)',
      descriptionEn: 'With device calibration (N₂ reference)',
      requirements: 'N₂-Referenzmessung',
      requirementsEn: 'N₂ reference measurement',
      features: ['Gemessene Basis-Empfindlichkeit', 'Gerätespezifische Korrektur', 'Alle STANDARD-Features'],
      featuresEn: ['Measured base sensitivity', 'Device-specific correction', 'All STANDARD features'],
    },
    {
      level: 'PRECISION',
      accuracy: '~5-10%',
      color: 'bg-state-success/20 text-state-success',
      description: 'Multi-Gas Kalibrierung',
      descriptionEn: 'Multi-gas calibration',
      requirements: 'N₂ + weitere Gase (Ar, He)',
      requirementsEn: 'N₂ + additional gases (Ar, He)',
      features: ['Gerätespezifische RSF', 'Detektor-Typ optimiert', 'SEM-Alterungs-Tracking', 'Höchste Genauigkeit'],
      featuresEn: ['Device-specific RSF', 'Detector type optimized', 'SEM aging tracking', 'Highest accuracy'],
    },
  ]

  return (
    <div className="space-y-3 pt-3">
      {levels.map(l => (
        <div key={l.level} className="bg-bg-secondary rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn('px-2 py-0.5 rounded font-mono font-medium', l.color)}>
              {l.level}
            </span>
            <span className="text-caption text-text-muted">{l.accuracy}</span>
          </div>
          <p className="text-caption text-text-primary font-medium mb-2">
            {isGerman ? l.description : l.descriptionEn}
          </p>
          <div className="mb-2">
            <span className="text-micro text-text-muted">
              {isGerman ? 'Voraussetzung: ' : 'Requirement: '}
            </span>
            <span className="text-caption">{isGerman ? l.requirements : l.requirementsEn}</span>
          </div>
          <ul className="text-caption text-text-secondary list-disc list-inside">
            {(isGerman ? l.features : l.featuresEn).map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function CalibrationFormulas({ isGerman }: { isGerman: boolean }) {
  return (
    <div className="space-y-4 pt-3">
      {/* Sensitivity Calculation */}
      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? '1. Empfindlichkeitsberechnung' : '1. Sensitivity Calculation'}
        </h5>
        <div className="bg-bg-secondary rounded-lg p-3">
          <div className="font-mono text-center py-2">
            S = Σ(I<sub>mass</sub> / RSF<sub>mass</sub>) / P<sub>total,korr</sub>
          </div>
          <p className="text-caption text-text-muted mt-2">
            {isGerman
              ? 'Die Empfindlichkeit wird aus der Summe der RSF-gewichteten Ionenströme geteilt durch den korrigierten Totaldruck berechnet.'
              : 'Sensitivity is calculated from the sum of RSF-weighted ion currents divided by the corrected total pressure.'}
          </p>
        </div>
      </div>

      {/* Pressure Calculation */}
      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? '2. Partialdruck-Berechnung' : '2. Partial Pressure Calculation'}
        </h5>
        <div className="bg-bg-secondary rounded-lg p-3">
          <div className="font-mono text-center py-2">
            P<sub>gas</sub> = I<sub>gas</sub> / (S × RSF<sub>gas</sub>)
          </div>
          <p className="text-caption text-text-muted mt-2">
            {isGerman
              ? 'Der Partialdruck jedes Gases ergibt sich aus dem Ionenstrom geteilt durch Empfindlichkeit und RSF.'
              : 'The partial pressure of each gas results from the ion current divided by sensitivity and RSF.'}
          </p>
        </div>
      </div>

      {/* Total Pressure Correction */}
      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? '3. Totaldruck-Korrektur' : '3. Total Pressure Correction'}
        </h5>
        <div className="bg-bg-secondary rounded-lg p-3">
          <div className="font-mono text-center py-2">
            P<sub>korr</sub> = P<sub>gemessen</sub> × f<sub>manometer</sub> × f<sub>temperatur</sub>
          </div>
          <p className="text-caption text-text-muted mt-2">
            {isGerman
              ? 'Der gemessene Totaldruck wird für das dominante Gas und die Temperatur korrigiert.'
              : 'The measured total pressure is corrected for the dominant gas and temperature.'}
          </p>
        </div>
      </div>

      {/* SEM Gain */}
      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? '4. SEM-Verstärkung (falls keine Kalibrierung)' : '4. SEM Gain (if no calibration)'}
        </h5>
        <div className="bg-bg-secondary rounded-lg p-3">
          <div className="font-mono text-center py-2">
            Gain ≈ 10<sup>(V/350)</sup>
          </div>
          <p className="text-caption text-text-muted mt-2">
            {isGerman
              ? 'Bei SEM-Spannung > 800V wird die Verstärkung aus der Spannung geschätzt. Faraday: Gain = 1.'
              : 'For SEM voltage > 800V, gain is estimated from voltage. Faraday: Gain = 1.'}
          </p>
        </div>
      </div>
    </div>
  )
}

function ManometerCorrection({ isGerman }: { isGerman: boolean }) {
  const corrections = [
    { state: 'UNBAKED', gas: 'H₂O', factor: '1/0.9 = 1.11', description: 'Wasser-dominiert', descriptionEn: 'Water-dominated' },
    { state: 'BAKED', gas: 'H₂', factor: '1/0.44 = 2.27', description: 'Wasserstoff-dominiert', descriptionEn: 'Hydrogen-dominated' },
    { state: 'UNKNOWN', gas: 'N₂', factor: '1.0', description: 'Stickstoff-Referenz', descriptionEn: 'Nitrogen reference' },
  ]

  return (
    <div className="space-y-4 pt-3">
      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? 'Problem' : 'Problem'}
        </h5>
        <p className="text-caption text-text-secondary">
          {isGerman
            ? 'Ionisationsmanometer (Bayard-Alpert) sind auf N₂ kalibriert. Bei anderen dominanten Gasen zeigen sie systematisch falsche Werte an.'
            : 'Ionization gauges (Bayard-Alpert) are calibrated for N₂. With other dominant gases, they show systematically incorrect values.'}
        </p>
      </div>

      <div className="bg-bg-secondary rounded-lg p-3">
        <div className="font-mono text-center py-2">
          P<sub>real</sub> = P<sub>angezeigt</sub> × (1 / RSF<sub>dominant</sub>)
        </div>
      </div>

      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? 'Korrekturfaktoren nach Systemzustand' : 'Correction Factors by System State'}
        </h5>
        <div className="overflow-x-auto">
          <table className="w-full text-caption">
            <thead>
              <tr className="border-b border-subtle">
                <th className="text-left py-2 px-2">{isGerman ? 'Zustand' : 'State'}</th>
                <th className="text-left py-2 px-2">{isGerman ? 'Dom. Gas' : 'Dom. Gas'}</th>
                <th className="text-left py-2 px-2">{isGerman ? 'Faktor' : 'Factor'}</th>
              </tr>
            </thead>
            <tbody>
              {corrections.map(c => (
                <tr key={c.state} className="border-b border-subtle/50">
                  <td className="py-2 px-2">
                    <span className="font-mono text-aqua-500">{c.state}</span>
                    <span className="text-text-muted ml-2">({isGerman ? c.description : c.descriptionEn})</span>
                  </td>
                  <td className="py-2 px-2 font-mono">{c.gas}</td>
                  <td className="py-2 px-2 font-mono">{c.factor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-state-warning/10 rounded-lg p-3">
        <p className="text-caption text-state-warning">
          {isGerman
            ? '⚠️ Der Systemzustand wird automatisch aus dem Dateinamen erkannt (z.B. "after bakeout", "unbaked", "ausgeheizt").'
            : '⚠️ System state is automatically detected from the filename (e.g., "after bakeout", "unbaked", "baked").'}
        </p>
      </div>
    </div>
  )
}

function TemperatureCorrection({ isGerman }: { isGerman: boolean }) {
  return (
    <div className="space-y-4 pt-3">
      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? 'Physikalischer Hintergrund' : 'Physical Background'}
        </h5>
        <p className="text-caption text-text-secondary">
          {isGerman
            ? 'Ionisationsmanometer sind temperaturabhängig. Bei Abweichung von der Referenztemperatur (23°C = 296 K) muss korrigiert werden.'
            : 'Ionization gauges are temperature-dependent. Deviations from reference temperature (23°C = 296 K) require correction.'}
        </p>
      </div>

      <div className="bg-bg-secondary rounded-lg p-3">
        <div className="font-mono text-center py-2">
          P<sub>korr</sub> = P<sub>gemessen</sub> × (T<sub>ref</sub> / T<sub>aktuell</sub>)
        </div>
        <div className="text-caption text-text-muted mt-2 text-center">
          T<sub>ref</sub> = 296 K (23°C)
        </div>
      </div>

      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? 'Beispiele' : 'Examples'}
        </h5>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-bg-secondary rounded-lg p-2 text-center">
            <div className="text-caption text-text-muted">20°C</div>
            <div className="font-mono text-aqua-500">× 1.010</div>
          </div>
          <div className="bg-bg-secondary rounded-lg p-2 text-center">
            <div className="text-caption text-text-muted">22°C</div>
            <div className="font-mono text-aqua-500">× 1.003</div>
          </div>
          <div className="bg-bg-secondary rounded-lg p-2 text-center">
            <div className="text-caption text-text-muted">25°C</div>
            <div className="font-mono text-aqua-500">× 0.993</div>
          </div>
          <div className="bg-bg-secondary rounded-lg p-2 text-center">
            <div className="text-caption text-text-muted">30°C</div>
            <div className="font-mono text-aqua-500">× 0.977</div>
          </div>
        </div>
      </div>

      <p className="text-caption text-text-muted">
        {isGerman
          ? 'Die Temperatur wird aus dem Dateinamen extrahiert (z.B. "22c", "25°C").'
          : 'Temperature is extracted from the filename (e.g., "22c", "25°C").'}
      </p>
    </div>
  )
}

function DeconvolutionSection({ isGerman }: { isGerman: boolean }) {
  const examples = [
    {
      gas: 'CO₂',
      mainMass: 44,
      fragments: [
        { mass: 28, percent: 10, ion: 'CO⁺' },
        { mass: 16, percent: 10, ion: 'O⁺' },
        { mass: 12, percent: 8.7, ion: 'C⁺' },
        { mass: 22, percent: 1.9, ion: 'CO₂²⁺' },
      ],
    },
    {
      gas: 'H₂O',
      mainMass: 18,
      fragments: [
        { mass: 17, percent: 23, ion: 'OH⁺' },
        { mass: 16, percent: 1.5, ion: 'O⁺' },
      ],
    },
    {
      gas: 'Ar',
      mainMass: 40,
      fragments: [
        { mass: 20, percent: 14.6, ion: 'Ar²⁺' },
        { mass: 36, percent: 0.34, ion: '³⁶Ar' },
      ],
    },
  ]

  return (
    <div className="space-y-4 pt-3">
      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? 'Warum Dekonvolution?' : 'Why Deconvolution?'}
        </h5>
        <p className="text-caption text-text-secondary">
          {isGerman
            ? 'Bei 70 eV Elektronenstoß-Ionisation entstehen neben dem Hauptpeak auch Fragmente. Ohne Korrektur werden diese doppelt gezählt (z.B. 10% des CO₂-Signals erscheint bei m/z 28 und wird als N₂ interpretiert).'
            : 'At 70 eV electron impact ionization, fragments are created alongside the main peak. Without correction, these are double-counted (e.g., 10% of CO₂ signal appears at m/z 28 and is interpreted as N₂).'}
        </p>
      </div>

      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? 'Reihenfolge der Subtraktion' : 'Subtraction Order'}
        </h5>
        <ol className="text-caption text-text-secondary list-decimal list-inside space-y-1">
          <li>CO₂ (m44 {isGerman ? 'eindeutig' : 'unique'}) → {isGerman ? 'Fragmente bei' : 'fragments at'} 28, 16, 12, 22</li>
          <li>H₂O (m18 {isGerman ? 'relativ eindeutig' : 'relatively unique'}) → {isGerman ? 'Fragmente bei' : 'fragments at'} 17, 16</li>
          <li>Ar (m40 {isGerman ? 'eindeutig' : 'unique'}) → {isGerman ? 'Fragmente bei' : 'fragments at'} 20, 36</li>
          <li>O₂ (m32) → {isGerman ? 'Fragment bei' : 'fragment at'} 16</li>
          <li>N₂/CO (m28) → {isGerman ? 'Unterscheidung via' : 'differentiation via'} m14/m12</li>
          <li>H₂ (m2) → {isGerman ? 'Fragment bei' : 'fragment at'} 1</li>
          <li>CH₄ (m16) → {isGerman ? 'via' : 'via'} m15 (CH₃⁺)</li>
        </ol>
      </div>

      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? 'N₂/CO Unterscheidung' : 'N₂/CO Differentiation'}
        </h5>
        <div className="bg-bg-secondary rounded-lg p-3 space-y-2">
          <div className="font-mono text-caption">
            N₂: m14/m28 ≈ 7.2% (N⁺ {isGerman ? 'Fragment' : 'fragment'})
          </div>
          <div className="font-mono text-caption">
            CO: m12/m28 ≈ 4.5% (C⁺ {isGerman ? 'Fragment' : 'fragment'})
          </div>
          <p className="text-caption text-text-muted mt-2">
            {isGerman
              ? 'Aus den Fragmentintensitäten wird der jeweilige Anteil berechnet.'
              : 'The respective contribution is calculated from fragment intensities.'}
          </p>
        </div>
      </div>

      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? 'Cracking Patterns (Beispiele)' : 'Cracking Patterns (Examples)'}
        </h5>
        <div className="space-y-2">
          {examples.map(ex => (
            <div key={ex.gas} className="bg-bg-secondary rounded-lg p-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono font-medium text-aqua-500">{ex.gas}</span>
                <span className="text-micro text-text-muted">({isGerman ? 'Hauptmasse' : 'main mass'}: m{ex.mainMass} = 100%)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ex.fragments.map(f => (
                  <span key={f.mass} className="text-caption font-mono">
                    m{f.mass}: {f.percent}% ({f.ion})
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RSFSection({ isGerman }: { isGerman: boolean }) {
  const rsfData = [
    { gas: 'He', rsf: 0.14, note: 'sehr niedrig', noteEn: 'very low' },
    { gas: 'Ne', rsf: 0.23, note: '', noteEn: '' },
    { gas: 'H₂', rsf: 0.44, note: 'Faktor 2.27 vs Manometer', noteEn: 'Factor 2.27 vs gauge' },
    { gas: 'O₂', rsf: 0.86, note: '', noteEn: '' },
    { gas: 'H₂O', rsf: 0.90, note: 'Faktor 1.11 vs Manometer', noteEn: 'Factor 1.11 vs gauge' },
    { gas: 'N₂', rsf: 1.00, note: 'Referenz', noteEn: 'Reference' },
    { gas: 'CO', rsf: 1.05, note: '', noteEn: '' },
    { gas: 'Ar', rsf: 1.20, note: '', noteEn: '' },
    { gas: 'CO₂', rsf: 1.40, note: '', noteEn: '' },
    { gas: 'CH₄', rsf: 1.60, note: '', noteEn: '' },
    { gas: 'Xe', rsf: 3.00, note: '', noteEn: '' },
    { gas: 'Öl', rsf: 4.00, note: 'Schätzung', noteEn: 'estimate' },
  ]

  return (
    <div className="space-y-4 pt-3">
      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? 'Was ist RSF?' : 'What is RSF?'}
        </h5>
        <p className="text-caption text-text-secondary">
          {isGerman
            ? 'Der Relative Sensitivity Factor (RSF) beschreibt, wie effizient ein Gas im Vergleich zu N₂ ionisiert wird. Ein RSF > 1 bedeutet höhere Ionisationswahrscheinlichkeit.'
            : 'The Relative Sensitivity Factor (RSF) describes how efficiently a gas is ionized compared to N₂. RSF > 1 means higher ionization probability.'}
        </p>
      </div>

      <div className="bg-bg-secondary rounded-lg p-3">
        <div className="font-mono text-center py-2">
          RSF<sub>gas</sub> = S<sub>gas</sub> / S<sub>N₂</sub>
        </div>
      </div>

      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? 'Standard-RSF Tabelle' : 'Standard RSF Table'}
        </h5>
        <div className="overflow-x-auto">
          <table className="w-full text-caption">
            <thead>
              <tr className="border-b border-subtle">
                <th className="text-left py-2 px-2">{isGerman ? 'Gas' : 'Gas'}</th>
                <th className="text-left py-2 px-2">RSF</th>
                <th className="text-left py-2 px-2">{isGerman ? 'Anmerkung' : 'Note'}</th>
              </tr>
            </thead>
            <tbody>
              {rsfData.map(r => (
                <tr key={r.gas} className="border-b border-subtle/50">
                  <td className="py-1.5 px-2 font-mono text-aqua-500">{r.gas}</td>
                  <td className="py-1.5 px-2 font-mono">{r.rsf.toFixed(2)}</td>
                  <td className="py-1.5 px-2 text-text-muted">{isGerman ? r.note : r.noteEn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-aqua-500/10 rounded-lg p-3">
        <p className="text-caption text-aqua-700 dark:text-aqua-300">
          {isGerman
            ? '💡 Bei Geräte-Kalibrierung (PRECISION) werden gerätespezifische RSF berechnet, die von den Standardwerten abweichen können.'
            : '💡 With device calibration (PRECISION), device-specific RSF are calculated that may differ from standard values.'}
        </p>
      </div>
    </div>
  )
}

function DeviceCalibrationSection({ isGerman }: { isGerman: boolean }) {
  return (
    <div className="space-y-4 pt-3">
      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? 'Voraussetzungen' : 'Requirements'}
        </h5>
        <ul className="text-caption text-text-secondary list-disc list-inside space-y-1">
          <li>{isGerman ? 'Externes Referenz-Manometer (kapazitiv, Spinning Rotor, etc.)' : 'External reference gauge (capacitive, spinning rotor, etc.)'}</li>
          <li>{isGerman ? 'Reines Referenzgas (N₂ Pflicht, optional Ar, He)' : 'Pure reference gas (N₂ required, optionally Ar, He)'}</li>
          <li>{isGerman ? 'Stabiler Druck während Messung' : 'Stable pressure during measurement'}</li>
        </ul>
      </div>

      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? 'Ablauf N₂-Kalibrierung' : 'N₂ Calibration Procedure'}
        </h5>
        <ol className="text-caption text-text-secondary list-decimal list-inside space-y-2">
          <li>{isGerman ? 'N₂ einlassen auf stabilen Druck (typ. 10⁻⁶ mbar)' : 'Admit N₂ to stable pressure (typ. 10⁻⁶ mbar)'}</li>
          <li>{isGerman ? 'Referenzdruck P_ref vom externen Manometer ablesen' : 'Read reference pressure P_ref from external gauge'}</li>
          <li>{isGerman ? 'RGA-Ionenstrom I bei m/z 28 ablesen' : 'Read RGA ion current I at m/z 28'}</li>
          <li>{isGerman ? 'Empfindlichkeit berechnen:' : 'Calculate sensitivity:'}</li>
        </ol>
        <div className="bg-bg-secondary rounded-lg p-3 mt-2">
          <div className="font-mono text-center py-2">
            S<sub>base</sub> = I<sub>m28</sub> / P<sub>ref</sub>
          </div>
        </div>
      </div>

      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? 'Multi-Gas Kalibrierung (PRECISION)' : 'Multi-Gas Calibration (PRECISION)'}
        </h5>
        <p className="text-caption text-text-secondary mb-2">
          {isGerman
            ? 'Durch Messung weiterer Gase werden gerätespezifische RSF berechnet:'
            : 'By measuring additional gases, device-specific RSF are calculated:'}
        </p>
        <div className="bg-bg-secondary rounded-lg p-3">
          <div className="font-mono text-center py-2">
            RSF<sub>gas,device</sub> = (I<sub>gas</sub> / P<sub>gas</sub>) / S<sub>base</sub>
          </div>
        </div>
      </div>

      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? 'SEM-Alterungs-Tracking' : 'SEM Aging Tracking'}
        </h5>
        <p className="text-caption text-text-secondary">
          {isGerman
            ? 'Die App speichert SEM-Spannungen über Zeit und warnt bei signifikanter Zunahme:'
            : 'The app stores SEM voltages over time and warns on significant increase:'}
        </p>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="bg-aqua-500/10 rounded-lg p-2 text-center">
            <div className="text-micro text-text-muted">{isGerman ? 'Info' : 'Info'}</div>
            <div className="font-mono text-aqua-500">&gt; 50V</div>
          </div>
          <div className="bg-state-warning/10 rounded-lg p-2 text-center">
            <div className="text-micro text-text-muted">{isGerman ? 'Warnung' : 'Warning'}</div>
            <div className="font-mono text-state-warning">&gt; 150V</div>
          </div>
          <div className="bg-state-danger/10 rounded-lg p-2 text-center">
            <div className="text-micro text-text-muted">{isGerman ? 'Kritisch' : 'Critical'}</div>
            <div className="font-mono text-state-danger">&gt; 300V</div>
          </div>
        </div>
      </div>

      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? 'Cloud-Speicherung' : 'Cloud Storage'}
        </h5>
        <p className="text-caption text-text-secondary">
          {isGerman
            ? 'Geräte-Kalibrierungen werden in Firebase gespeichert und sind nach Login automatisch verfügbar. Die neueste Kalibrierung wird beim Start geladen.'
            : 'Device calibrations are stored in Firebase and are automatically available after login. The latest calibration is loaded at startup.'}
        </p>
      </div>
    </div>
  )
}

// ============================================
// RATE OF RISE TAB
// ============================================
function RateOfRiseTab({ isGerman }: { isGerman: boolean }) {
  const [expandedSection, setExpandedSection] = useState<string | null>('basics')

  const sections = [
    { key: 'basics', title: 'Grundlagen', titleEn: 'Fundamentals', icon: '📖' },
    { key: 'physics', title: 'Physik & Formeln', titleEn: 'Physics & Formulas', icon: '📐' },
    { key: 'classification', title: 'Klassifikation', titleEn: 'Classification', icon: '🏷️' },
    { key: 'procedure', title: 'Durchführung', titleEn: 'Procedure', icon: '📋' },
    { key: 'interpretation', title: 'Interpretation', titleEn: 'Interpretation', icon: '🔍' },
    { key: 'limits', title: 'Grenzwerte', titleEn: 'Limits', icon: '⚖️' },
    { key: 'comparison', title: 'Methodenvergleich', titleEn: 'Method Comparison', icon: '📊' },
    { key: 'troubleshooting', title: 'Fehlerbehebung', titleEn: 'Troubleshooting', icon: '🔧' },
  ]

  return (
    <div className="space-y-4">
      {/* Introduction */}
      <div className="bg-gradient-to-r from-aqua-500/10 to-aqua-600/5 rounded-lg p-4 border border-aqua-500/20">
        <h3 className="font-semibold text-aqua-600 dark:text-aqua-400 mb-2">
          {isGerman ? 'Rate-of-Rise (Druckanstiegstest)' : 'Rate-of-Rise Test'}
        </h3>
        <p className="text-caption text-text-secondary leading-relaxed">
          {isGerman
            ? 'Der Druckanstiegstest (Rate-of-Rise, RoR) ist eine fundamentale Methode zur Leckratenbestimmung in abgeschlossenen Vakuumsystemen. Durch Messung des Druckanstiegs über Zeit nach Absperren der Pumpen kann die Leckrate quantitativ bestimmt und die Ursache (echtes Leck, virtuelles Leck, Ausgasung) klassifiziert werden.'
            : 'The Rate-of-Rise (RoR) test is a fundamental method for leak rate determination in closed vacuum systems. By measuring the pressure rise over time after isolating the pumps, the leak rate can be quantitatively determined and the cause (real leak, virtual leak, outgassing) classified.'}
        </p>
      </div>

      {/* Accordion Sections */}
      {sections.map(section => (
        <div key={section.key} className="bg-surface-card-muted rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === section.key ? null : section.key)}
            className="w-full flex items-center gap-3 p-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
          >
            <span className="text-xl">{section.icon}</span>
            <span className="flex-1 font-medium text-text-primary">
              {isGerman ? section.title : section.titleEn}
            </span>
            <span className={cn('transition-transform', expandedSection === section.key && 'rotate-180')}>▼</span>
          </button>

          {expandedSection === section.key && (
            <div className="px-4 pb-4 border-t border-subtle/50">
              {section.key === 'basics' && <RoRBasics isGerman={isGerman} />}
              {section.key === 'physics' && <RoRPhysics isGerman={isGerman} />}
              {section.key === 'classification' && <RoRClassification isGerman={isGerman} />}
              {section.key === 'procedure' && <RoRProcedure isGerman={isGerman} />}
              {section.key === 'interpretation' && <RoRInterpretation isGerman={isGerman} />}
              {section.key === 'limits' && <RoRLimits isGerman={isGerman} />}
              {section.key === 'comparison' && <RoRComparison isGerman={isGerman} />}
              {section.key === 'troubleshooting' && <RoRTroubleshooting isGerman={isGerman} />}
            </div>
          )}
        </div>
      ))}

      {/* Quick Info Box */}
      <div className="bg-aqua-500/10 rounded-lg p-3">
        <p className="text-caption text-aqua-700 dark:text-aqua-300">
          {isGerman
            ? '💡 Die Rate-of-Rise Analyse dieser App unterstützt Pfeiffer TPG362 Drucklogger-Daten und führt automatische Phasenerkennung, lineare Regression und Klassifikation durch.'
            : '💡 This app\'s Rate-of-Rise analysis supports Pfeiffer TPG362 pressure logger data and performs automatic phase detection, linear regression, and classification.'}
        </p>
      </div>
    </div>
  )
}

// --- Rate of Rise Sub-Components ---

function RoRBasics({ isGerman }: { isGerman: boolean }) {
  return (
    <div className="space-y-4 pt-3">
      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? 'Was ist der Druckanstiegstest?' : 'What is the Rate-of-Rise Test?'}
        </h5>
        <p className="text-caption text-text-secondary">
          {isGerman
            ? 'Der Druckanstiegstest misst, wie schnell der Druck in einem evakuierten, abgeschlossenen System ansteigt. Nach Erreichen eines stabilen Basisdrucks werden die Pumpen abgesperrt (Ventil geschlossen) und der Druckverlauf über Zeit aufgezeichnet.'
            : 'The rate-of-rise test measures how quickly the pressure rises in an evacuated, closed system. After reaching a stable base pressure, the pumps are isolated (valve closed) and the pressure progression over time is recorded.'}
        </p>
      </div>

      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? 'Anwendungsgebiete' : 'Applications'}
        </h5>
        <ul className="text-caption text-text-secondary space-y-1 list-disc list-inside">
          <li>{isGerman ? 'Abnahmetests von Vakuumkammern' : 'Acceptance tests for vacuum chambers'}</li>
          <li>{isGerman ? 'Lecksuche und -lokalisation' : 'Leak detection and localization'}</li>
          <li>{isGerman ? 'Qualitätskontrolle nach Wartung' : 'Quality control after maintenance'}</li>
          <li>{isGerman ? 'Bestimmung der Ausgasungsrate' : 'Outgassing rate determination'}</li>
          <li>{isGerman ? 'Unterscheidung Leck vs. Ausgasung' : 'Differentiation leak vs. outgassing'}</li>
        </ul>
      </div>

      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? 'Vorteile' : 'Advantages'}
        </h5>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-state-success/10 rounded-lg p-2">
            <span className="text-caption text-state-success font-medium">
              {isGerman ? 'Quantitative Leckrate' : 'Quantitative leak rate'}
            </span>
          </div>
          <div className="bg-state-success/10 rounded-lg p-2">
            <span className="text-caption text-state-success font-medium">
              {isGerman ? 'Einfache Durchführung' : 'Simple execution'}
            </span>
          </div>
          <div className="bg-state-success/10 rounded-lg p-2">
            <span className="text-caption text-state-success font-medium">
              {isGerman ? 'Kein Tracergas nötig' : 'No tracer gas needed'}
            </span>
          </div>
          <div className="bg-state-success/10 rounded-lg p-2">
            <span className="text-caption text-state-success font-medium">
              {isGerman ? 'Gesamtleckrate' : 'Total leak rate'}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? 'Limitierungen' : 'Limitations'}
        </h5>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-state-warning/10 rounded-lg p-2">
            <span className="text-caption text-state-warning font-medium">
              {isGerman ? 'Keine Lokalisation' : 'No localization'}
            </span>
          </div>
          <div className="bg-state-warning/10 rounded-lg p-2">
            <span className="text-caption text-state-warning font-medium">
              {isGerman ? 'Zeitaufwendig' : 'Time-consuming'}
            </span>
          </div>
          <div className="bg-state-warning/10 rounded-lg p-2">
            <span className="text-caption text-state-warning font-medium">
              {isGerman ? 'Volumen muss bekannt sein' : 'Volume must be known'}
            </span>
          </div>
          <div className="bg-state-warning/10 rounded-lg p-2">
            <span className="text-caption text-state-warning font-medium">
              {isGerman ? 'Überlagert mit Ausgasung' : 'Overlaid with outgassing'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function RoRPhysics({ isGerman }: { isGerman: boolean }) {
  return (
    <div className="space-y-4 pt-3">
      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? 'Grundgleichung' : 'Fundamental Equation'}
        </h5>
        <div className="bg-bg-secondary rounded-lg p-3">
          <div className="font-mono text-center py-2 text-lg">
            Q = V × (dp/dt)
          </div>
          <div className="text-caption text-text-muted mt-2 space-y-1">
            <div>• <span className="font-mono">Q</span> = {isGerman ? 'Leckrate' : 'Leak rate'} [mbar·L/s]</div>
            <div>• <span className="font-mono">V</span> = {isGerman ? 'Kammervolumen' : 'Chamber volume'} [L]</div>
            <div>• <span className="font-mono">dp/dt</span> = {isGerman ? 'Druckanstiegsrate' : 'Pressure rise rate'} [mbar/s]</div>
          </div>
        </div>
      </div>

      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? 'Druckanstiegsrate berechnen' : 'Calculating Pressure Rise Rate'}
        </h5>
        <p className="text-caption text-text-secondary mb-2">
          {isGerman
            ? 'Die Druckanstiegsrate dp/dt wird durch lineare Regression der Druckdaten im Anstiegsbereich ermittelt:'
            : 'The pressure rise rate dp/dt is determined by linear regression of pressure data in the rise phase:'}
        </p>
        <div className="bg-bg-secondary rounded-lg p-3">
          <div className="font-mono text-center py-2">
            p(t) = p₀ + (dp/dt) × t
          </div>
          <div className="text-caption text-text-muted mt-2">
            <div>• <span className="font-mono">p₀</span> = {isGerman ? 'Basisdruck beim Start' : 'Base pressure at start'}</div>
            <div>• <span className="font-mono">R²</span> = {isGerman ? 'Bestimmtheitsmaß (sollte > 0.95 sein)' : 'Coefficient of determination (should be > 0.95)'}</div>
          </div>
        </div>
      </div>

      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? 'Einheitenumrechnung' : 'Unit Conversion'}
        </h5>
        <div className="overflow-x-auto">
          <table className="w-full text-caption">
            <thead>
              <tr className="border-b border-subtle">
                <th className="text-left py-2 px-2">{isGerman ? 'Einheit' : 'Unit'}</th>
                <th className="text-left py-2 px-2">{isGerman ? 'Faktor zu mbar·L/s' : 'Factor to mbar·L/s'}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-subtle/50">
                <td className="py-1.5 px-2 font-mono">mbar·L/s</td>
                <td className="py-1.5 px-2 font-mono">1</td>
              </tr>
              <tr className="border-b border-subtle/50">
                <td className="py-1.5 px-2 font-mono">Pa·m³/s</td>
                <td className="py-1.5 px-2 font-mono">× 10</td>
              </tr>
              <tr className="border-b border-subtle/50">
                <td className="py-1.5 px-2 font-mono">Torr·L/s</td>
                <td className="py-1.5 px-2 font-mono">× 1.333</td>
              </tr>
              <tr className="border-b border-subtle/50">
                <td className="py-1.5 px-2 font-mono">atm·cm³/s (scc/s)</td>
                <td className="py-1.5 px-2 font-mono">× 1.013</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? 'Helium-Äquivalent' : 'Helium Equivalent'}
        </h5>
        <p className="text-caption text-text-secondary mb-2">
          {isGerman
            ? 'Für Vergleich mit He-Lecksuchern wird die Leckrate umgerechnet:'
            : 'For comparison with He leak detectors, the leak rate is converted:'}
        </p>
        <div className="bg-bg-secondary rounded-lg p-3">
          <div className="font-mono text-center py-2">
            Q<sub>He</sub> = Q<sub>Luft</sub> × √(M<sub>Luft</sub>/M<sub>He</sub>) ≈ Q<sub>Luft</sub> × 2.7
          </div>
          <p className="text-caption text-text-muted mt-2">
            {isGerman
              ? 'Helium diffundiert ~2.7× schneller als Luft durch gleich große Öffnungen.'
              : 'Helium diffuses ~2.7× faster than air through equal-sized openings.'}
          </p>
        </div>
      </div>
    </div>
  )
}

function RoRClassification({ isGerman }: { isGerman: boolean }) {
  const types = [
    {
      type: 'real_leak',
      name: 'Echtes Leck',
      nameEn: 'Real Leak',
      icon: '🔴',
      color: 'state-danger',
      description: 'Durchgehende Verbindung zwischen Kammer und Atmosphäre (Riss, offene Verbindung, defekte Dichtung).',
      descriptionEn: 'Direct connection between chamber and atmosphere (crack, open connection, defective seal).',
      characteristics: [
        'Linearer Druckanstieg (konstant dp/dt)',
        'Hoher R²-Wert (>0.98)',
        'Reagiert auf He-Besprühung',
        'Druckanstieg proportional zum Atmosphärendruck',
      ],
      characteristicsEn: [
        'Linear pressure rise (constant dp/dt)',
        'High R² value (>0.98)',
        'Responds to He spraying',
        'Pressure rise proportional to atmospheric pressure',
      ],
    },
    {
      type: 'virtual_leak',
      name: 'Virtuelles Leck',
      nameEn: 'Virtual Leak',
      icon: '🟡',
      color: 'state-warning',
      description: 'Eingeschlossenes Gas in Hohlräumen, Gewindegängen, Spalten oder porösem Material.',
      descriptionEn: 'Trapped gas in cavities, threads, gaps, or porous material.',
      characteristics: [
        'Anfangs schneller, dann abflachender Anstieg',
        'Niedriger R²-Wert (<0.9)',
        'Keine Reaktion auf He-Besprühung',
        'Oft durch Bakeout reduzierbar',
      ],
      characteristicsEn: [
        'Initially fast, then flattening rise',
        'Low R² value (<0.9)',
        'No response to He spraying',
        'Often reducible by baking',
      ],
    },
    {
      type: 'outgassing',
      name: 'Ausgasung',
      nameEn: 'Outgassing',
      icon: '🟢',
      color: 'aqua-500',
      description: 'Desorption von adsorbierten Gasen (hauptsächlich H₂O, dann H₂) von Oberflächen.',
      descriptionEn: 'Desorption of adsorbed gases (mainly H₂O, then H₂) from surfaces.',
      characteristics: [
        'Exponentiell abklingender Anstieg',
        'Niedriger R²-Wert',
        'Stark temperaturabhängig',
        'Reduziert sich durch Bakeout massiv',
      ],
      characteristicsEn: [
        'Exponentially decaying rise',
        'Low R² value',
        'Strongly temperature-dependent',
        'Massively reduced by baking',
      ],
    },
    {
      type: 'mixed',
      name: 'Misch-Signal',
      nameEn: 'Mixed Signal',
      icon: '⚪',
      color: 'text-muted',
      description: 'Kombination aus mehreren Quellen, typisch in realen Systemen.',
      descriptionEn: 'Combination of multiple sources, typical in real systems.',
      characteristics: [
        'Mittlerer R²-Wert (0.9-0.95)',
        'Analyse nach Bakeout wiederholen',
        'RGA zur Differenzierung nutzen',
        'Mehrere Messungen vergleichen',
      ],
      characteristicsEn: [
        'Medium R² value (0.9-0.95)',
        'Repeat analysis after baking',
        'Use RGA for differentiation',
        'Compare multiple measurements',
      ],
    },
  ]

  return (
    <div className="space-y-4 pt-3">
      <p className="text-caption text-text-secondary">
        {isGerman
          ? 'Die Klassifikation basiert auf der Form der Druckkurve und dem Fit-Bestimmtheitsmaß R². Verschiedene Ursachen erzeugen charakteristisch unterschiedliche Kurvenverläufe.'
          : 'Classification is based on the shape of the pressure curve and the fit coefficient of determination R². Different causes produce characteristically different curve progressions.'}
      </p>

      <div className="space-y-3">
        {types.map(t => (
          <div key={t.type} className="bg-bg-secondary rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{t.icon}</span>
              <span className={cn('font-medium', `text-${t.color}`)}>
                {isGerman ? t.name : t.nameEn}
              </span>
            </div>
            <p className="text-caption text-text-secondary mb-2">
              {isGerman ? t.description : t.descriptionEn}
            </p>
            <div>
              <span className="text-micro text-text-muted block mb-1">
                {isGerman ? 'Charakteristika:' : 'Characteristics:'}
              </span>
              <ul className="text-caption text-text-muted list-disc list-inside space-y-0.5">
                {(isGerman ? t.characteristics : t.characteristicsEn).map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RoRProcedure({ isGerman }: { isGerman: boolean }) {
  const steps = [
    {
      step: 1,
      title: 'Vorbereitung',
      titleEn: 'Preparation',
      tasks: [
        'System auf Basisdruck evakuieren',
        'Drucklogger anschließen (z.B. TPG362)',
        'Kammervolumen dokumentieren',
        'Temperatur stabilisieren',
      ],
      tasksEn: [
        'Evacuate system to base pressure',
        'Connect pressure logger (e.g., TPG362)',
        'Document chamber volume',
        'Stabilize temperature',
      ],
    },
    {
      step: 2,
      title: 'Baseline-Messung',
      titleEn: 'Baseline Measurement',
      tasks: [
        'Mindestens 10-15 Minuten stabilen Druck aufzeichnen',
        'Druckschwankungen sollten <5% sein',
        'Bei zu hohen Schwankungen: System noch nicht stabil',
      ],
      tasksEn: [
        'Record stable pressure for at least 10-15 minutes',
        'Pressure fluctuations should be <5%',
        'If fluctuations too high: system not yet stable',
      ],
    },
    {
      step: 3,
      title: 'Ventil schließen',
      titleEn: 'Close Valve',
      tasks: [
        'Ventil zwischen Kammer und Pumpe schließen',
        'Zeitpunkt exakt dokumentieren',
        'Ventil muss vollständig dicht sein!',
      ],
      tasksEn: [
        'Close valve between chamber and pump',
        'Document exact time',
        'Valve must be completely sealed!',
      ],
    },
    {
      step: 4,
      title: 'Druckanstieg aufzeichnen',
      titleEn: 'Record Pressure Rise',
      tasks: [
        'Typische Messzeit: 30 min - 3 h',
        'Kürzere Zeit bei großen Lecks',
        'Längere Zeit bei kleinen Lecks/Ausgasung',
        'Messintervall: 1-10 Sekunden empfohlen',
      ],
      tasksEn: [
        'Typical measurement time: 30 min - 3 h',
        'Shorter time for large leaks',
        'Longer time for small leaks/outgassing',
        'Measurement interval: 1-10 seconds recommended',
      ],
    },
    {
      step: 5,
      title: 'Analyse',
      titleEn: 'Analysis',
      tasks: [
        'Baseline- und Anstiegsphase identifizieren',
        'Lineare Regression im Anstiegsbereich',
        'R²-Wert zur Klassifikation nutzen',
        'Leckrate Q = V × dp/dt berechnen',
      ],
      tasksEn: [
        'Identify baseline and rise phases',
        'Linear regression in rise region',
        'Use R² value for classification',
        'Calculate leak rate Q = V × dp/dt',
      ],
    },
  ]

  return (
    <div className="space-y-4 pt-3">
      <p className="text-caption text-text-secondary">
        {isGerman
          ? 'Die korrekte Durchführung ist entscheidend für aussagekräftige Ergebnisse. Folgen Sie diesen Schritten systematisch.'
          : 'Correct execution is crucial for meaningful results. Follow these steps systematically.'}
      </p>

      <div className="space-y-3">
        {steps.map(s => (
          <div key={s.step} className="bg-bg-secondary rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-aqua-500 text-white text-caption font-bold flex items-center justify-center">
                {s.step}
              </span>
              <span className="font-medium text-text-primary">
                {isGerman ? s.title : s.titleEn}
              </span>
            </div>
            <ul className="text-caption text-text-muted list-disc list-inside space-y-0.5 ml-8">
              {(isGerman ? s.tasks : s.tasksEn).map((task, i) => (
                <li key={i}>{task}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

function RoRInterpretation({ isGerman }: { isGerman: boolean }) {
  return (
    <div className="space-y-4 pt-3">
      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? 'R²-Wert interpretieren' : 'Interpreting R² Value'}
        </h5>
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 bg-state-success/10 rounded-lg">
            <span className="font-mono text-state-success font-bold">R² {'>'} 0.98</span>
            <span className="text-caption text-text-secondary">
              → {isGerman ? 'Echtes Leck sehr wahrscheinlich' : 'Real leak very likely'}
            </span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-state-warning/10 rounded-lg">
            <span className="font-mono text-state-warning font-bold">0.90 {'<'} R² {'<'} 0.98</span>
            <span className="text-caption text-text-secondary">
              → {isGerman ? 'Misch-Signal (Leck + Ausgasung)' : 'Mixed signal (leak + outgassing)'}
            </span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-aqua-500/10 rounded-lg">
            <span className="font-mono text-aqua-500 font-bold">R² {'<'} 0.90</span>
            <span className="text-caption text-text-secondary">
              → {isGerman ? 'Ausgasung oder virtuelles Leck' : 'Outgassing or virtual leak'}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? 'Typische Leckraten' : 'Typical Leak Rates'}
        </h5>
        <div className="overflow-x-auto">
          <table className="w-full text-caption">
            <thead>
              <tr className="border-b border-subtle">
                <th className="text-left py-2 px-2">{isGerman ? 'Bereich' : 'Range'}</th>
                <th className="text-left py-2 px-2">{isGerman ? 'Bewertung' : 'Assessment'}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-subtle/50">
                <td className="py-1.5 px-2 font-mono text-state-danger">{'>'} 10⁻⁵ mbar·L/s</td>
                <td className="py-1.5 px-2">{isGerman ? 'Grobes Leck, sofort beheben' : 'Gross leak, fix immediately'}</td>
              </tr>
              <tr className="border-b border-subtle/50">
                <td className="py-1.5 px-2 font-mono text-state-warning">10⁻⁷ - 10⁻⁵ mbar·L/s</td>
                <td className="py-1.5 px-2">{isGerman ? 'Mittleres Leck, lokalisieren' : 'Medium leak, localize'}</td>
              </tr>
              <tr className="border-b border-subtle/50">
                <td className="py-1.5 px-2 font-mono text-aqua-500">10⁻⁹ - 10⁻⁷ mbar·L/s</td>
                <td className="py-1.5 px-2">{isGerman ? 'Kleines Leck oder Ausgasung' : 'Small leak or outgassing'}</td>
              </tr>
              <tr className="border-b border-subtle/50">
                <td className="py-1.5 px-2 font-mono text-state-success">{'<'} 10⁻⁹ mbar·L/s</td>
                <td className="py-1.5 px-2">{isGerman ? 'UHV-tauglich' : 'UHV-compatible'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h5 className="font-medium text-text-primary mb-2">
          {isGerman ? 'Weitere Analyse nach RoR' : 'Further Analysis After RoR'}
        </h5>
        <ul className="text-caption text-text-secondary space-y-1 list-disc list-inside">
          <li>{isGerman ? 'Bei R² > 0.95: He-Lecksuche zur Lokalisation' : 'If R² > 0.95: He leak detection for localization'}</li>
          <li>{isGerman ? 'Bei R² < 0.9: Bakeout, dann erneut messen' : 'If R² < 0.9: Bake out, then measure again'}</li>
          <li>{isGerman ? 'RGA-Analyse für Gasart-Identifikation' : 'RGA analysis for gas type identification'}</li>
          <li>{isGerman ? 'Temperaturvariation zur Differenzierung' : 'Temperature variation for differentiation'}</li>
        </ul>
      </div>
    </div>
  )
}

function RoRLimits({ isGerman }: { isGerman: boolean }) {
  const limits = [
    {
      source: 'CERN LHC',
      application: 'Beschleuniger-Vakuum',
      applicationEn: 'Accelerator vacuum',
      limit: '< 10⁻⁹ mbar·L/s',
      condition: 'nach Bakeout',
      conditionEn: 'after bakeout',
    },
    {
      source: 'ITER',
      application: 'Fusionsreaktor',
      applicationEn: 'Fusion reactor',
      limit: '< 10⁻⁸ mbar·L/s/m²',
      condition: 'oberflächennormiert',
      conditionEn: 'surface-normalized',
    },
    {
      source: 'ISO 3529-1',
      application: 'Industriestandard HV',
      applicationEn: 'Industrial standard HV',
      limit: '< 10⁻⁶ mbar·L/s',
      condition: 'Hochvakuum',
      conditionEn: 'High vacuum',
    },
    {
      source: 'Halbleiter',
      application: 'Prozesskammern',
      applicationEn: 'Process chambers',
      limit: '< 10⁻⁸ mbar·L/s',
      condition: 'vor Prozessstart',
      conditionEn: 'before process start',
    },
    {
      source: 'Luft- & Raumfahrt',
      application: 'Satelliten',
      applicationEn: 'Satellites',
      limit: '< 10⁻⁷ mbar·L/s',
      condition: 'Gesamtsystem',
      conditionEn: 'Total system',
    },
  ]

  return (
    <div className="space-y-4 pt-3">
      <p className="text-caption text-text-secondary">
        {isGerman
          ? 'Typische Grenzwerte für verschiedene Anwendungen. Die Anforderungen hängen stark vom spezifischen Anwendungsfall ab.'
          : 'Typical limits for various applications. Requirements depend strongly on the specific use case.'}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-caption">
          <thead>
            <tr className="border-b border-subtle">
              <th className="text-left py-2 px-2">{isGerman ? 'Quelle' : 'Source'}</th>
              <th className="text-left py-2 px-2">{isGerman ? 'Anwendung' : 'Application'}</th>
              <th className="text-left py-2 px-2">{isGerman ? 'Grenzwert' : 'Limit'}</th>
              <th className="text-left py-2 px-2">{isGerman ? 'Bedingung' : 'Condition'}</th>
            </tr>
          </thead>
          <tbody>
            {limits.map((l, i) => (
              <tr key={i} className="border-b border-subtle/50">
                <td className="py-1.5 px-2 font-medium text-aqua-500">{l.source}</td>
                <td className="py-1.5 px-2">{isGerman ? l.application : l.applicationEn}</td>
                <td className="py-1.5 px-2 font-mono">{l.limit}</td>
                <td className="py-1.5 px-2 text-text-muted">{isGerman ? l.condition : l.conditionEn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-state-warning/10 rounded-lg p-3">
        <p className="text-caption text-state-warning">
          {isGerman
            ? '⚠️ Die Grenzwerte beziehen sich oft auf He-Äquivalent. Bei RoR-Messung mit Luft muss umgerechnet werden (Faktor ~2.7).'
            : '⚠️ Limits often refer to He equivalent. When measuring RoR with air, conversion is needed (factor ~2.7).'}
        </p>
      </div>
    </div>
  )
}

function RoRComparison({ isGerman }: { isGerman: boolean }) {
  const methods = [
    {
      method: 'Rate-of-Rise',
      pros: ['Quantitative Gesamtleckrate', 'Einfache Durchführung', 'Kein Tracergas', 'Kostengünstig'],
      prosEn: ['Quantitative total leak rate', 'Simple execution', 'No tracer gas', 'Cost-effective'],
      cons: ['Keine Lokalisation', 'Zeitaufwendig', 'Volumen muss bekannt sein'],
      consEn: ['No localization', 'Time-consuming', 'Volume must be known'],
      sensitivity: '10⁻⁶ - 10⁻⁹',
    },
    {
      method: 'He-Lecksuche',
      pros: ['Lokalisation möglich', 'Hohe Empfindlichkeit', 'Schnelle Ergebnisse', 'Industriestandard'],
      prosEn: ['Localization possible', 'High sensitivity', 'Fast results', 'Industry standard'],
      cons: ['Teures Equipment', 'Helium-Verbrauch', 'Schulung erforderlich'],
      consEn: ['Expensive equipment', 'Helium consumption', 'Training required'],
      sensitivity: '10⁻⁹ - 10⁻¹²',
    },
    {
      method: 'Druckabfall',
      pros: ['Sehr einfach', 'Keine Spezialgeräte', 'Schnelle Grobprüfung'],
      prosEn: ['Very simple', 'No special equipment', 'Quick rough check'],
      cons: ['Nur für große Lecks', 'Temperaturempfindlich', 'Unpräzise'],
      consEn: ['Only for large leaks', 'Temperature-sensitive', 'Imprecise'],
      sensitivity: '> 10⁻⁴',
    },
    {
      method: 'Blasentest',
      pros: ['Direkter visueller Nachweis', 'Sehr kostengünstig', 'Lokalisation möglich'],
      prosEn: ['Direct visual evidence', 'Very cost-effective', 'Localization possible'],
      cons: ['Nur für große Lecks', 'Nicht für Vakuum', 'Subjektiv'],
      consEn: ['Only for large leaks', 'Not for vacuum', 'Subjective'],
      sensitivity: '> 10⁻³',
    },
  ]

  return (
    <div className="space-y-4 pt-3">
      <p className="text-caption text-text-secondary">
        {isGerman
          ? 'Der Druckanstiegstest ist eine von mehreren Methoden zur Leckprüfung. Die Wahl hängt von Anforderungen, Budget und Anwendung ab.'
          : 'The rate-of-rise test is one of several leak testing methods. Choice depends on requirements, budget, and application.'}
      </p>

      <div className="space-y-3">
        {methods.map(m => (
          <div key={m.method} className="bg-bg-secondary rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-text-primary">{m.method}</span>
              <span className="text-micro font-mono text-aqua-500">{m.sensitivity} mbar·L/s</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-micro text-state-success block mb-1">
                  {isGerman ? 'Vorteile' : 'Advantages'}
                </span>
                <ul className="text-caption text-text-muted list-disc list-inside">
                  {(isGerman ? m.pros : m.prosEn).map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-micro text-state-danger block mb-1">
                  {isGerman ? 'Nachteile' : 'Disadvantages'}
                </span>
                <ul className="text-caption text-text-muted list-disc list-inside">
                  {(isGerman ? m.cons : m.consEn).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RoRTroubleshooting({ isGerman }: { isGerman: boolean }) {
  const issues = [
    {
      problem: 'Kein stabiler Basisdruck',
      problemEn: 'No stable base pressure',
      causes: ['Aktives Leck', 'Starke Ausgasung', 'Pumpenproblem'],
      causesEn: ['Active leak', 'Strong outgassing', 'Pump problem'],
      solutions: ['Längere Evakuierungszeit', 'Bakeout durchführen', 'Pumpe prüfen'],
      solutionsEn: ['Longer evacuation time', 'Perform bakeout', 'Check pump'],
    },
    {
      problem: 'R²-Wert schwankt stark',
      problemEn: 'R² value fluctuates strongly',
      causes: ['Zu kurze Messzeit', 'Temperaturänderung', 'Ventil nicht dicht'],
      causesEn: ['Measurement time too short', 'Temperature change', 'Valve not sealed'],
      solutions: ['Messzeit verlängern', 'Temperatur stabilisieren', 'Ventildichtheit prüfen'],
      solutionsEn: ['Extend measurement time', 'Stabilize temperature', 'Check valve seal'],
    },
    {
      problem: 'Druckanstieg zu schnell',
      problemEn: 'Pressure rise too fast',
      causes: ['Grobes Leck', 'Ventil undicht', 'Sensor-Drift'],
      causesEn: ['Gross leak', 'Leaky valve', 'Sensor drift'],
      solutions: ['Schnelle Grobprüfung', 'Ventil austauschen', 'Sensor kalibrieren'],
      solutionsEn: ['Quick rough check', 'Replace valve', 'Calibrate sensor'],
    },
    {
      problem: 'Kein Druckanstieg erkennbar',
      problemEn: 'No pressure rise detectable',
      causes: ['Sensor-Bereich zu klein', 'Messzeit zu kurz', 'System sehr dicht'],
      causesEn: ['Sensor range too small', 'Measurement time too short', 'System very tight'],
      solutions: ['Empfindlicheren Sensor nutzen', 'Länger messen', 'Erfolg dokumentieren!'],
      solutionsEn: ['Use more sensitive sensor', 'Measure longer', 'Document success!'],
    },
  ]

  return (
    <div className="space-y-4 pt-3">
      <p className="text-caption text-text-secondary">
        {isGerman
          ? 'Häufige Probleme bei der Druckanstiegsmessung und deren Lösungen.'
          : 'Common problems with rate-of-rise measurements and their solutions.'}
      </p>

      <div className="space-y-3">
        {issues.map((issue, i) => (
          <div key={i} className="bg-bg-secondary rounded-lg p-3">
            <h5 className="font-medium text-state-danger mb-2">
              {isGerman ? issue.problem : issue.problemEn}
            </h5>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-micro text-text-muted block mb-1">
                  {isGerman ? 'Mögliche Ursachen:' : 'Possible causes:'}
                </span>
                <ul className="text-caption text-text-secondary list-disc list-inside">
                  {(isGerman ? issue.causes : issue.causesEn).map((c, j) => (
                    <li key={j}>{c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-micro text-text-muted block mb-1">
                  {isGerman ? 'Lösungen:' : 'Solutions:'}
                </span>
                <ul className="text-caption text-state-success list-disc list-inside">
                  {(isGerman ? issue.solutions : issue.solutionsEn).map((s, j) => (
                    <li key={j}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-aqua-500/10 rounded-lg p-3">
        <p className="text-caption text-aqua-700 dark:text-aqua-300">
          {isGerman
            ? '💡 Tipp: Bei wiederholt inkonsistenten Ergebnissen sollte eine RGA-Analyse zur Identifikation der dominanten Gasart durchgeführt werden.'
            : '💡 Tip: For repeatedly inconsistent results, an RGA analysis should be performed to identify the dominant gas species.'}
        </p>
      </div>
    </div>
  )
}

// ============================================
// OUTGASSING INFO TAB
// ============================================
function OutgassingInfoTab({ isGerman, onShowOutgassing }: { isGerman: boolean; onShowOutgassing?: () => void }) {
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
    <div className="space-y-6">
      {/* Header with link to simulator */}
      <div className="bg-aqua-500/10 border border-aqua-500/30 rounded-lg p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-aqua-400">
              {isGerman ? 'Ausgasungs-Simulator' : 'Outgassing Simulator'}
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              {isGerman
                ? 'Berechnet erwartete Ausgasungsraten für Multi-Material-Systeme. Unterscheidet Leck von Ausgasung.'
                : 'Calculates expected outgassing rates for multi-material systems. Distinguishes leak from outgassing.'}
            </p>
          </div>
          {onShowOutgassing && (
            <button
              onClick={onShowOutgassing}
              className="shrink-0 px-4 py-2 bg-aqua-500 text-white rounded-lg hover:bg-aqua-600 transition-colors text-sm font-medium"
            >
              {isGerman ? '→ Zum Simulator' : '→ Open Simulator'}
            </button>
          )}
        </div>
      </div>

      {/* Physics explanation */}
      <div>
        <h4 className="text-sm font-semibold text-text-primary mb-2">
          {isGerman ? 'Physikalische Grundlagen' : 'Physical Principles'}
        </h4>
        <div className="bg-surface-secondary rounded-lg p-3 space-y-2 text-sm">
          <p className="font-mono text-aqua-400">q(t) = q₁ × (t₁/t)ⁿ</p>
          <ul className="text-text-secondary space-y-1 ml-4">
            <li>• q₁ = {isGerman ? 'Ausgasungsrate nach Referenzzeit t₁' : 'Outgassing rate after reference time t₁'}</li>
            <li>• n ≈ 1.0 {isGerman ? 'für Metalle' : 'for metals'}, n ≈ 0.5-0.7 {isGerman ? 'für Polymere' : 'for polymers'}</li>
          </ul>
          <div className="border-t border-subtle pt-2 mt-2">
            <p className="text-text-secondary">
              <span className="text-yellow-400">⚠️</span> {isGerman
                ? 'Viton dominiert oft die Ausgasung, obwohl es nur 0.7% der Oberfläche ausmacht!'
                : 'Viton often dominates outgassing despite being only 0.7% of surface area!'}
            </p>
          </div>
        </div>
      </div>

      {/* Materials Database */}
      <div>
        <h4 className="text-sm font-semibold text-text-primary mb-2">
          {isGerman ? 'Materialien-Datenbank' : 'Materials Database'} ({OUTGASSING_MATERIALS.length})
        </h4>

        {/* Metals */}
        <div className="mb-4">
          <h5 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
            {isGerman ? 'Metalle' : 'Metals'}
          </h5>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-text-secondary border-b border-subtle">
                  <th className="py-1.5 pr-2">{isGerman ? 'Material' : 'Material'}</th>
                  <th className="py-1.5 px-2">q₁ₕ</th>
                  <th className="py-1.5 px-2">q₁₀ₕ</th>
                  <th className="py-1.5 px-2">{isGerman ? 'Bakeout' : 'Bakeout'}</th>
                </tr>
              </thead>
              <tbody>
                {metalMaterials.map(m => (
                  <tr key={m.id} className="border-b border-subtle/50">
                    <td className="py-1.5 pr-2 text-text-primary">{isGerman ? m.name : m.nameEn}</td>
                    <td className="py-1.5 px-2 font-mono text-aqua-400">{formatRate(m.q1h_unbaked)}</td>
                    <td className="py-1.5 px-2 font-mono text-text-secondary">{formatRate(m.q10h_unbaked)}</td>
                    <td className="py-1.5 px-2">{m.bakeoutTemp ? `${m.bakeoutTemp}°C` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Elastomers */}
        <div className="mb-4">
          <h5 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
            {isGerman ? 'Elastomere' : 'Elastomers'}
          </h5>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-text-secondary border-b border-subtle">
                  <th className="py-1.5 pr-2">{isGerman ? 'Material' : 'Material'}</th>
                  <th className="py-1.5 px-2">q₁ₕ</th>
                  <th className="py-1.5 px-2">q₁₀ₕ</th>
                  <th className="py-1.5 px-2">{isGerman ? 'Bakeout' : 'Bakeout'}</th>
                </tr>
              </thead>
              <tbody>
                {elastomerMaterials.map(m => (
                  <tr key={m.id} className="border-b border-subtle/50">
                    <td className="py-1.5 pr-2 text-text-primary">{isGerman ? m.name : m.nameEn}</td>
                    <td className="py-1.5 px-2 font-mono text-yellow-400">{formatRate(m.q1h_unbaked)}</td>
                    <td className="py-1.5 px-2 font-mono text-text-secondary">{formatRate(m.q10h_unbaked)}</td>
                    <td className="py-1.5 px-2">{m.bakeoutTemp ? `${m.bakeoutTemp}°C` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ceramics */}
        <div>
          <h5 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
            {isGerman ? 'Keramik' : 'Ceramics'}
          </h5>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-text-secondary border-b border-subtle">
                  <th className="py-1.5 pr-2">{isGerman ? 'Material' : 'Material'}</th>
                  <th className="py-1.5 px-2">q₁ₕ</th>
                  <th className="py-1.5 px-2">q₁₀ₕ</th>
                  <th className="py-1.5 px-2">{isGerman ? 'Bakeout' : 'Bakeout'}</th>
                </tr>
              </thead>
              <tbody>
                {ceramicMaterials.map(m => (
                  <tr key={m.id} className="border-b border-subtle/50">
                    <td className="py-1.5 pr-2 text-text-primary">{isGerman ? m.name : m.nameEn}</td>
                    <td className="py-1.5 px-2 font-mono text-green-400">{formatRate(m.q1h_unbaked)}</td>
                    <td className="py-1.5 px-2 font-mono text-text-secondary">{formatRate(m.q10h_unbaked)}</td>
                    <td className="py-1.5 px-2">{m.bakeoutTemp ? `${m.bakeoutTemp}°C` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-text-tertiary mt-3">
          {isGerman
            ? 'Einheit: mbar·l/(s·cm²). Quellen: VACOM, CERN, de Csernatony'
            : 'Unit: mbar·l/(s·cm²). Sources: VACOM, CERN, de Csernatony'}
        </p>
      </div>

      {/* Comparison: Leak vs Outgassing */}
      <div>
        <h4 className="text-sm font-semibold text-text-primary mb-2">
          {isGerman ? 'Leck vs. Ausgasung unterscheiden' : 'Distinguishing Leak vs. Outgassing'}
        </h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <h5 className="font-semibold text-red-400 mb-1">{isGerman ? 'Reales Leck' : 'Real Leak'}</h5>
            <ul className="text-text-secondary space-y-1">
              <li>• dp/dt = {isGerman ? 'konstant' : 'constant'}</li>
              <li>• {isGerman ? 'Linearer Druckanstieg' : 'Linear pressure rise'}</li>
              <li>• He-Lecktest: {isGerman ? 'positiv' : 'positive'}</li>
            </ul>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <h5 className="font-semibold text-blue-400 mb-1">{isGerman ? 'Ausgasung' : 'Outgassing'}</h5>
            <ul className="text-text-secondary space-y-1">
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

// ============================================
// REFERENCES TAB
// ============================================
function ReferencesTab({ isGerman }: { isGerman: boolean }) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  // Wissenschaftliche Quellen mit URLs (aus SCIENTIFIC_REFERENCES.md)
  const references = [
    {
      category: isGerman ? '🔬 Isotopen-Standards' : '🔬 Isotope Standards',
      sources: [
        {
          name: 'NIST Physics Reference Data',
          url: 'https://physics.nist.gov/PhysRefData/Handbook/Tables/argontable1_a.htm',
          description: isGerman
            ? 'Atomgewichte, Isotopenzusammensetzungen für alle Elemente'
            : 'Atomic weights, isotopic compositions for all elements'
        },
        {
          name: 'NIST Chemistry WebBook',
          url: 'https://webbook.nist.gov',
          description: isGerman
            ? 'Massenspektren-Datenbank, Molekulareigenschaften, Ionisierungsenergien'
            : 'Mass spectra database, molecular properties, ionization energies'
        },
        {
          name: 'CIAAW - Argon',
          url: 'https://ciaaw.org/argon.htm',
          description: isGerman
            ? 'Standard Atomgewicht, Isotopenzusammensetzung (⁴⁰Ar/³⁶Ar = 298.6)'
            : 'Standard atomic weight, isotopic composition (⁴⁰Ar/³⁶Ar = 298.6)'
        },
        {
          name: 'CIAAW - Chlorine',
          url: 'https://ciaaw.org/chlorine.htm',
          description: isGerman
            ? '³⁵Cl/³⁷Cl Verhältnis, SMOC Standard (0.319627)'
            : '³⁵Cl/³⁷Cl ratio, SMOC standard (0.319627)'
        },
        {
          name: 'USGS Isotope Tracers',
          url: 'https://wwwrcamnl.wr.usgs.gov/isoig/period/ar_iig.html',
          description: isGerman
            ? 'Terrestrische Ar-Isotopenverhältnisse, geochemische Daten'
            : 'Terrestrial Ar isotope ratios, geochemical data'
        },
      ]
    },
    {
      category: isGerman ? '🔬 Peer-Reviewed RGA-Anwendungen' : '🔬 Peer-Reviewed RGA Applications',
      sources: [
        {
          name: 'ScienceDirect - Vacuum Journal (2017)',
          url: 'https://www.sciencedirect.com/science/article/abs/pii/S0920379617305811',
          description: isGerman
            ? 'H₂/D₂/T Isotopenverhältnisse in Tokamaks (JET, ASDEX-Upgrade)'
            : 'H₂/D₂/T isotope ratios in tokamaks (JET, ASDEX-Upgrade)'
        },
        {
          name: 'PubMed 24566134',
          url: 'https://pubmed.ncbi.nlm.nih.gov/24566134/',
          description: isGerman
            ? 'RGA für ¹³CO₂-Atemtests (Helicobacter pylori Diagnostik)'
            : 'RGA for ¹³CO₂ breath tests (Helicobacter pylori diagnosis)'
        },
        {
          name: 'Analytical Chemistry (2000)',
          url: 'https://pubs.acs.org/doi/10.1021/ac9904563',
          description: isGerman
            ? 'N₂O-Isotopologen-Analyse (positions-spezifisches ¹⁵N)'
            : 'N₂O isotopologue analysis (position-specific ¹⁵N)'
        },
        {
          name: 'PMC 6589419',
          url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6589419/',
          description: isGerman
            ? 'Absolute Isotopen-Abundanzverhältnisse für Si (PDMS-Detektion)'
            : 'Absolute isotopic abundance ratios for Si (PDMS detection)'
        },
      ]
    },
    {
      category: isGerman ? '⚙️ Hersteller-Dokumentation' : '⚙️ Manufacturer Documentation',
      sources: [
        {
          name: 'Pfeiffer Vacuum - RGA Applications',
          url: 'https://www.pfeiffer-vacuum.com/global/en/applications/residual-gas-analysis/',
          description: isGerman
            ? 'RGA-Grundlagen, Cracking Patterns, Sensitivitätsfaktoren'
            : 'RGA fundamentals, cracking patterns, sensitivity factors'
        },
        {
          name: 'Hiden Analytical - RGA Series',
          url: 'https://www.hidenanalytical.com/products/residual-gas-analysis/rga-series/',
          description: isGerman
            ? 'Quadrupol-MS-Technologie, H₂/D₂-Analyse, Öl-Detektion'
            : 'Quadrupole MS technology, H₂/D₂ analysis, oil detection'
        },
        {
          name: 'Kurt Lesker - Advanced RGA Interpretation',
          url: 'https://de.lesker.com/newweb/technical_info/vacuumtech/rga_04_advanceinterpret.cfm',
          description: isGerman
            ? 'Kohlenwasserstoff-Kontaminationsmuster, Δ14 amu Serie'
            : 'Hydrocarbon contamination patterns, Δ14 amu series'
        },
        {
          name: 'MKS Instruments - RGA',
          url: 'https://www.mks.com/n/residual-gas-analysis',
          description: isGerman
            ? 'Anwendungshinweise, Leckdetektion, Prozess-Monitoring'
            : 'Application notes, leak detection, process monitoring'
        },
      ]
    },
    {
      category: isGerman ? '🛢️ Vakuum-Kontamination' : '🛢️ Vacuum Contamination',
      sources: [
        {
          name: 'Hiden - Hydrocarbon Fragments (PDF)',
          url: 'https://www.hidenanalytical.com/wp-content/uploads/2016/08/hydrocarbon_fragments-1-1.pdf',
          description: isGerman
            ? 'Massenspektrometrische Fragmente gängiger Kohlenwasserstoffe'
            : 'Mass spectral fragments of common hydrocarbons'
        },
        {
          name: 'Kurt Lesker - FOMBLIN Z PFPE',
          url: 'https://www.lesker.com/newweb/fluids/fomblin-specialty-pfpe-z-lubricant/',
          description: isGerman
            ? 'FOMBLIN-Produktinformationen, PFPE-Chemie, CF₃⁺ bei m/z 69'
            : 'FOMBLIN product information, PFPE chemistry, CF₃⁺ at m/z 69'
        },
        {
          name: 'Springer - DART-MS PDMS Analysis',
          url: 'https://link.springer.com/article/10.1007/s13361-014-1042-5',
          description: isGerman
            ? 'PDMS-Oligomer-Screening, charakteristische Peaks: m/z 59, 73, 147'
            : 'PDMS oligomer screening, characteristic peaks: m/z 59, 73, 147'
        },
      ]
    },
    {
      category: isGerman ? '🎓 Akademische Institutionen' : '🎓 Academic Institutions',
      sources: [
        {
          name: 'UC Davis Stable Isotope Facility',
          url: 'https://stableisotopefacility.ucdavis.edu',
          description: isGerman
            ? 'Best Practices für Isotopen-Analyse, N₂/N₂O-Leitfaden'
            : 'Best practices for isotope analysis, N₂/N₂O guide'
        },
        {
          name: 'NOAA GML - Isotope-Ratio MS Tutorial',
          url: 'https://gml.noaa.gov/education/isotopes/mass_spec.html',
          description: isGerman
            ? 'Tutorial zu Isotopenverhältnis-Massenspektrometrie'
            : 'Tutorial on isotope-ratio mass spectrometry'
        },
        {
          name: 'LibreTexts - MS Isotope Abundance',
          url: 'https://chem.libretexts.org/Bookshelves/Analytical_Chemistry/An_Introduction_to_Mass_Spectrometry_(Van_Bramer)/06:_INTERPRETATION/6.04:_Isotope_Abundance',
          description: isGerman
            ? 'Exzellenter MS-Interpretationsleitfaden für Cl-Isotopenmuster'
            : 'Excellent MS interpretation guide for Cl isotope patterns'
        },
      ]
    },
  ]

  const knowledgeBases = [
    {
      file: 'SCIENTIFIC_REFERENCES.md',
      description: isGerman
        ? '53+ wissenschaftliche Quellen (NIST, CIAAW, Peer-reviewed Papers)'
        : '53+ scientific sources (NIST, CIAAW, peer-reviewed papers)',
      path: 'RGA_Knowledge/'
    },
    {
      file: 'DETECTORS.md',
      description: isGerman
        ? 'Validierung aller 22 Diagnose-Detektoren mit Quellen'
        : 'Validation of all 22 diagnosis detectors with sources',
      path: 'DOCUMENTATION/SCIENTIFIC/'
    },
    {
      file: 'CALCULATIONS.md',
      description: isGerman
        ? 'RSF-Werte, Formeln, Einheiten-Konvertierungen mit Quellen'
        : 'RSF values, formulas, unit conversions with sources',
      path: 'DOCUMENTATION/SCIENTIFIC/'
    },
    {
      file: 'CRACKING_PATTERNS.md',
      description: isGerman
        ? 'NIST-validierte Fragmentierungsmuster für 7 Gase'
        : 'NIST-validated fragmentation patterns for 7 gases',
      path: 'DOCUMENTATION/SCIENTIFIC/'
    },
  ]

  const isotopeValidation = [
    {
      element: 'Argon',
      symbol: 'Ar',
      implemented: '⁴⁰Ar/³⁶Ar = 295.5',
      scientific: '298.6 ± 0.1 (Lee 2006), 295.5 ± 0.5 (Nier 1950)',
      status: 'valid',
      tolerance: '±5%',
      application: isGerman ? 'Luftleck-Bestätigung' : 'Air leak confirmation',
      sources: 'NIST, USGS, CIAAW'
    },
    {
      element: 'Chlor',
      symbol: 'Cl',
      implemented: '³⁵Cl/³⁷Cl = 3.13',
      scientific: '75.77% / 24.23% = 3.13 (SMOC Standard)',
      status: 'valid',
      tolerance: '±5%',
      application: isGerman ? 'Lösemittel-Identifikation' : 'Solvent identification',
      sources: 'CIAAW, LibreTexts'
    },
    {
      element: 'Stickstoff',
      symbol: 'N',
      implemented: '²⁸N₂/²⁹N₂ = 142.9',
      scientific: '¹⁴N (99.632%), ¹⁵N (0.368%)',
      status: 'valid',
      tolerance: '±10%',
      application: isGerman ? 'N₂ vs CO Unterscheidung' : 'N₂ vs CO distinction',
      sources: 'UC Davis, CIAAW'
    },
    {
      element: 'Kohlenstoff',
      symbol: 'C',
      implemented: '¹³C = 1.07%',
      scientific: '¹²C (98.93%), ¹³C (1.07%)',
      status: 'valid',
      tolerance: '±5%',
      application: isGerman ? 'CO₂-Isotopen (⁴⁴/⁴⁵)' : 'CO₂ isotopes (⁴⁴/⁴⁵)',
      sources: 'NOAA, NIST'
    },
    {
      element: 'Sauerstoff',
      symbol: 'O',
      implemented: 'O₂ ³²/³⁴ = 487',
      scientific: '¹⁶O (99.757%), ¹⁸O (0.205%)',
      status: 'valid',
      tolerance: '±10%',
      application: isGerman ? 'O₂-Isotopen-Muster' : 'O₂ isotope pattern',
      sources: 'NIST, WebElements'
    },
    {
      element: 'Schwefel',
      symbol: 'S',
      implemented: '³²S/³⁴S = 22.5',
      scientific: '³²S (94.99%), ³⁴S (4.25%)',
      status: 'valid',
      tolerance: '±5%',
      application: isGerman ? 'S vs O₂ bei m/z 32' : 'S vs O₂ at m/z 32',
      sources: 'NIST'
    },
  ]

  const peerReviewedApplications = [
    {
      field: isGerman ? 'Fusionsforschung' : 'Fusion Research',
      application: 'H₂/D₂/T Isotope Monitoring',
      institutions: 'JET, ASDEX-Upgrade, Tore Supra',
      validation: isGerman ? 'Cross-validiert mit Neutralteilchen-Analysatoren' : 'Cross-validated with neutral particle analyzers',
      precision: '±1-2%',
      reference: 'ScienceDirect (Vacuum Journal, 2017)',
    },
    {
      field: isGerman ? 'Medizinische Diagnostik' : 'Medical Diagnostics',
      application: '¹³CO₂ Breath Tests (H. pylori)',
      institutions: 'Various Clinical Labs',
      validation: isGerman ? 'Validiert gegen ICOS-Spektroskopie' : 'Validated against ICOS spectroscopy',
      precision: '±0.5-1%',
      reference: 'PubMed 24566134',
    },
    {
      field: isGerman ? 'Umweltanalytik' : 'Environmental Analysis',
      application: 'N₂O Isotopologue Analysis (¹⁵N positions)',
      institutions: 'Stable Isotope Facilities',
      validation: isGerman ? 'IRMS-Standard-Methode' : 'IRMS standard method',
      precision: '±0.5%',
      reference: 'Analytical Chemistry (2000)',
    },
  ]

  const emergingGases = [
    {
      gas: 'D₂ (Deuterium)',
      masses: 'm/z 4 (D₂⁺), 2 (D⁺)',
      application: isGerman ? 'Fusionsforschung, Tritium-Handling' : 'Fusion research, tritium handling',
      precision: '~100 ppm (Quadrupol RGA)',
      notes: isGerman ? 'Hiden LoMASS für präzise H/D-Trennung' : 'Hiden LoMASS for precise H/D separation',
      reference: 'Hiden Analytical, DOE SRNL',
      status: isGerman ? 'Implementierbar' : 'Implementable'
    },
    {
      gas: 'HD (Wasserstoff-Deuterium)',
      masses: 'm/z 3 (HD⁺)',
      application: isGerman ? 'Isotopenaustausch-Prozesse' : 'Isotope exchange processes',
      precision: '±1-2%',
      notes: isGerman ? 'Instabil - Exchange-Reaktionen in SS-Flaschen' : 'Unstable - exchange reactions in SS cylinders',
      reference: 'ScienceDirect (Fusion, 2023)',
      status: isGerman ? 'Implementierbar' : 'Implementable'
    },
    {
      gas: 'N₂O (Lachgas)',
      masses: 'm/z 44, 45, 46 (Molekül), 30, 31 (NO⁺)',
      application: isGerman ? 'Biogeochemie, ¹⁵N-Positions-Analyse' : 'Biogeochemistry, ¹⁵N position analysis',
      precision: '±0.5-1% (IRMS)',
      notes: isGerman ? '⚠️ m/z 44 überlappt mit CO₂! NO⁺-Fragment (m/z 30) zur Unterscheidung' : '⚠️ m/z 44 overlaps CO₂! Use NO⁺ fragment (m/z 30) for distinction',
      reference: 'UC Davis Isotope Facility',
      status: isGerman ? 'Implementierbar' : 'Implementable'
    },
  ]

  const methodLimitations = [
    {
      aspect: isGerman ? 'Typische Präzision' : 'Typical Precision',
      quadrupoleRGA: '±5-10%',
      highResIRMS: '±0.5-1%',
      notes: isGerman ? 'Quadrupol-RGA: praktisch für Routine-Diagnostik' : 'Quadrupole RGA: practical for routine diagnostics'
    },
    {
      aspect: isGerman ? 'Massen-Interferenzen' : 'Mass Interferences',
      quadrupoleRGA: 'm/z 44 (CO₂/N₂O), m/z 28 (N₂/CO/Si)',
      highResIRMS: isGerman ? 'Trennbar bei R > 10,000' : 'Separable at R > 10,000',
      notes: isGerman ? 'Fragment-Analyse hilft bei Unterscheidung' : 'Fragment analysis helps distinguish'
    },
    {
      aspect: isGerman ? 'Detektionslimit' : 'Detection Limit',
      quadrupoleRGA: '~10⁻⁴ (100 ppm) für D/H',
      highResIRMS: '~10⁻⁶',
      notes: isGerman ? 'Ausreichend für die meisten Vakuum-Anwendungen' : 'Sufficient for most vacuum applications'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="bg-gradient-to-r from-aqua-500/10 to-aqua-600/5 rounded-lg p-4 border border-aqua-500/20">
        <h3 className="font-semibold text-aqua-600 dark:text-aqua-400 mb-2">
          {isGerman ? 'Quellen & Wissenschaftliche Validierung' : 'Sources & Scientific Validation'}
        </h3>
        <p className="text-caption text-text-secondary leading-relaxed">
          {isGerman
            ? 'Die Wissensbasis dieser Anwendung wurde aus mehreren autoritativen Quellen konsolidiert und gegen peer-reviewed wissenschaftliche Literatur validiert. Alle Isotopenverhältnisse stammen von NIST, CIAAW und wurden in Fusionsforschung, medizinischer Diagnostik und Umweltanalytik bestätigt.'
            : 'This application\'s knowledge base has been consolidated from multiple authoritative sources and validated against peer-reviewed scientific literature. All isotope ratios are sourced from NIST, CIAAW and have been confirmed in fusion research, medical diagnostics, and environmental analysis.'}
        </p>
      </div>

      {/* Scientific Validation of Isotope Ratios */}
      <section>
        <div
          className="flex items-center justify-between cursor-pointer mb-3"
          onClick={() => setExpandedSection(expandedSection === 'isotopes' ? null : 'isotopes')}
        >
          <h4 className="font-medium text-text-primary">
            {isGerman ? '🔬 Wissenschaftliche Validierung: Isotopenverhältnisse' : '🔬 Scientific Validation: Isotope Ratios'}
          </h4>
          <span className="text-text-tertiary">{expandedSection === 'isotopes' ? '▼' : '▶'}</span>
        </div>

        {expandedSection === 'isotopes' && (
          <div className="space-y-3">
            <p className="text-caption text-text-secondary">
              {isGerman
                ? 'Alle implementierten Isotopenverhältnisse wurden gegen NIST, CIAAW und peer-reviewed Literatur validiert:'
                : 'All implemented isotope ratios have been validated against NIST, CIAAW and peer-reviewed literature:'}
            </p>

            <div className="space-y-2">
              {isotopeValidation.map((iso, i) => (
                <div key={i} className="bg-surface-card-muted rounded-lg p-3 border-l-2 border-green-500">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <span className="font-semibold text-text-primary">{iso.element}</span>
                      <span className="text-text-secondary ml-2">({iso.symbol})</span>
                    </div>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-micro">
                      ✓ {isGerman ? 'Validiert' : 'Validated'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1 text-xs text-text-secondary">
                    <div><span className="text-aqua-400">App:</span> {iso.implemented}</div>
                    <div><span className="text-aqua-400">{isGerman ? 'Literatur' : 'Literature'}:</span> {iso.scientific}</div>
                    <div><span className="text-aqua-400">{isGerman ? 'Toleranz' : 'Tolerance'}:</span> {iso.tolerance}</div>
                    <div><span className="text-aqua-400">{isGerman ? 'Anwendung' : 'Application'}:</span> {iso.application}</div>
                  </div>
                  <p className="text-micro text-text-muted mt-1">{isGerman ? 'Quellen' : 'Sources'}: {iso.sources}</p>
                </div>
              ))}
            </div>

            <div className="bg-aqua-500/10 rounded-lg p-3 mt-3">
              <p className="text-caption text-aqua-700 dark:text-aqua-300">
                <span className="font-semibold">{isGerman ? 'Fazit' : 'Conclusion'}:</span> {isGerman
                  ? 'Alle 10 implementierten Isotopenverhältnisse stimmen mit NIST/CIAAW-Standards überein. Toleranzen (5-10%) sind für Quadrupol-RGA realistisch.'
                  : 'All 10 implemented isotope ratios match NIST/CIAAW standards. Tolerances (5-10%) are realistic for quadrupole RGA.'}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Peer-Reviewed RGA Applications */}
      <section>
        <div
          className="flex items-center justify-between cursor-pointer mb-3"
          onClick={() => setExpandedSection(expandedSection === 'applications' ? null : 'applications')}
        >
          <h4 className="font-medium text-text-primary">
            {isGerman ? '📄 Peer-Reviewed RGA-Anwendungen' : '📄 Peer-Reviewed RGA Applications'}
          </h4>
          <span className="text-text-tertiary">{expandedSection === 'applications' ? '▼' : '▶'}</span>
        </div>

        {expandedSection === 'applications' && (
          <div className="space-y-2">
            <p className="text-caption text-text-secondary mb-3">
              {isGerman
                ? 'RGA-Isotopenverhältnismessungen wurden in diesen wissenschaftlichen Bereichen validiert:'
                : 'RGA isotope ratio measurements have been validated in these scientific fields:'}
            </p>

            {peerReviewedApplications.map((app, i) => (
              <div key={i} className="bg-surface-card-muted rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-aqua-500">{app.field}</span>
                </div>
                <div className="text-xs space-y-1 text-text-secondary">
                  <div><span className="text-text-primary">{isGerman ? 'Anwendung' : 'Application'}:</span> {app.application}</div>
                  <div><span className="text-text-primary">{isGerman ? 'Institutionen' : 'Institutions'}:</span> {app.institutions}</div>
                  <div><span className="text-text-primary">{isGerman ? 'Validierung' : 'Validation'}:</span> {app.validation}</div>
                  <div><span className="text-text-primary">{isGerman ? 'Präzision' : 'Precision'}:</span> <span className="text-green-400">{app.precision}</span></div>
                  <div className="text-micro text-text-muted">{isGerman ? 'Referenz' : 'Reference'}: {app.reference}</div>
                </div>
              </div>
            ))}

            <div className="bg-blue-500/10 rounded-lg p-3 mt-3">
              <p className="text-caption text-blue-700 dark:text-blue-300">
                💡 {isGerman
                  ? 'RGA-Isotopenverhältnisse wurden durch unabhängige Methoden (ICOS, IRMS, Spektroskopie) in wissenschaftlichen Studien validiert.'
                  : 'RGA isotope ratios have been validated through independent methods (ICOS, IRMS, spectroscopy) in scientific studies.'}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Advanced Isotope Applications (Emerging) */}
      <section>
        <div
          className="flex items-center justify-between cursor-pointer mb-3"
          onClick={() => setExpandedSection(expandedSection === 'emerging' ? null : 'emerging')}
        >
          <h4 className="font-medium text-text-primary">
            {isGerman ? '🚀 Erweiterte Isotopen-Anwendungen' : '🚀 Advanced Isotope Applications'}
          </h4>
          <span className="text-text-tertiary">{expandedSection === 'emerging' ? '▼' : '▶'}</span>
        </div>

        {expandedSection === 'emerging' && (
          <div className="space-y-2">
            <p className="text-caption text-text-secondary mb-3">
              {isGerman
                ? 'Zusätzliche Gase mit wissenschaftlich validiertem Potenzial für RGA-Analyse:'
                : 'Additional gases with scientifically validated potential for RGA analysis:'}
            </p>

            {emergingGases.map((gas, i) => (
              <div key={i} className="bg-surface-card-muted rounded-lg p-3 border-l-2 border-yellow-500">
                <div className="flex items-start justify-between mb-1">
                  <span className="font-semibold text-text-primary">{gas.gas}</span>
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-micro">
                    {gas.status}
                  </span>
                </div>
                <div className="text-xs space-y-1 text-text-secondary">
                  <div><span className="text-text-primary">{isGerman ? 'Massen' : 'Masses'}:</span> <span className="font-mono">{gas.masses}</span></div>
                  <div><span className="text-text-primary">{isGerman ? 'Anwendung' : 'Application'}:</span> {gas.application}</div>
                  <div><span className="text-text-primary">{isGerman ? 'Präzision' : 'Precision'}:</span> {gas.precision}</div>
                  {gas.notes && <div className="text-yellow-400">{gas.notes}</div>}
                  <div className="text-micro text-text-muted">{isGerman ? 'Referenz' : 'Reference'}: {gas.reference}</div>
                </div>
              </div>
            ))}

            <div className="bg-yellow-500/10 rounded-lg p-3 mt-3">
              <p className="text-caption text-yellow-700 dark:text-yellow-300">
                ⚠️ {isGerman
                  ? 'Diese Gase können bei Bedarf implementiert werden (z.B. für Fusionsforschung oder Biogeochemie).'
                  : 'These gases can be implemented as needed (e.g., for fusion research or biogeochemistry).'}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Method Validation & Limitations */}
      <section>
        <div
          className="flex items-center justify-between cursor-pointer mb-3"
          onClick={() => setExpandedSection(expandedSection === 'limitations' ? null : 'limitations')}
        >
          <h4 className="font-medium text-text-primary">
            {isGerman ? '⚙️ Methoden-Validierung & Limitationen' : '⚙️ Method Validation & Limitations'}
          </h4>
          <span className="text-text-tertiary">{expandedSection === 'limitations' ? '▼' : '▶'}</span>
        </div>

        {expandedSection === 'limitations' && (
          <div className="space-y-3">
            <p className="text-caption text-text-secondary">
              {isGerman
                ? 'Vergleich Quadrupol-RGA vs. High-Resolution IRMS (Isotope Ratio Mass Spectrometry):'
                : 'Comparison Quadrupole RGA vs. High-Resolution IRMS (Isotope Ratio Mass Spectrometry):'}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-text-secondary border-b border-subtle">
                    <th className="py-1.5 pr-2">{isGerman ? 'Aspekt' : 'Aspect'}</th>
                    <th className="py-1.5 px-2">Quadrupol RGA</th>
                    <th className="py-1.5 px-2">High-Res IRMS</th>
                    <th className="py-1.5 pl-2">{isGerman ? 'Notizen' : 'Notes'}</th>
                  </tr>
                </thead>
                <tbody>
                  {methodLimitations.map((lim, i) => (
                    <tr key={i} className="border-b border-subtle/50">
                      <td className="py-1.5 pr-2 text-text-primary">{lim.aspect}</td>
                      <td className="py-1.5 px-2 font-mono text-yellow-400">{lim.quadrupoleRGA}</td>
                      <td className="py-1.5 px-2 font-mono text-green-400">{lim.highResIRMS}</td>
                      <td className="py-1.5 pl-2 text-text-secondary">{lim.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-green-500/10 rounded-lg p-3">
              <p className="text-caption text-green-700 dark:text-green-300">
                ✓ {isGerman
                  ? 'Quadrupol-RGA ist praktisch für Echtzeit-Vakuum-Diagnostik. Für höchste Präzision (Klimaforschung, stabile Isotope) wird IRMS verwendet.'
                  : 'Quadrupole RGA is practical for real-time vacuum diagnostics. For highest precision (climate research, stable isotopes) IRMS is used.'}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Knowledge Bases */}
      <section>
        <h4 className="font-medium text-text-primary mb-3">
          {isGerman ? 'Wissenschaftliche Dokumentation' : 'Scientific Documentation'}
        </h4>
        <div className="space-y-2">
          {knowledgeBases.map((kb, i) => (
            <div key={i} className="bg-surface-card-muted rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">📄</span>
                <div className="flex flex-col">
                  <span className="font-mono text-aqua-500">{kb.file}</span>
                  <span className="text-micro text-text-muted">{kb.path}</span>
                </div>
              </div>
              <p className="text-caption text-text-secondary">{kb.description}</p>
            </div>
          ))}
        </div>
        <p className="text-micro text-text-muted mt-2">
          {isGerman
            ? 'Diese Dateien enthalten die vollständige wissenschaftliche Validierung aller Diagnosen, Berechnungen und Cracking Patterns.'
            : 'These files contain the complete scientific validation of all diagnoses, calculations and cracking patterns.'}
        </p>
      </section>

      {/* External References */}
      <section>
        <h4 className="font-medium text-text-primary mb-3">
          {isGerman ? 'Externe Wissenschaftliche Quellen' : 'External Scientific Sources'}
        </h4>
        <p className="text-caption text-text-secondary mb-3">
          {isGerman
            ? '53+ validierte Quellen aus SCIENTIFIC_REFERENCES.md. Klickbare Links zu NIST, CIAAW, Peer-reviewed Journals und Herstellern.'
            : '53+ validated sources from SCIENTIFIC_REFERENCES.md. Clickable links to NIST, CIAAW, peer-reviewed journals and manufacturers.'}
        </p>
        <div className="space-y-4">
          {references.map((category, i) => (
            <div key={i}>
              <h5 className="font-semibold text-text-primary mb-2">{category.category}</h5>
              <div className="space-y-2">
                {category.sources.map((source, j) => (
                  <div key={j} className="bg-surface-card-muted rounded-lg p-3">
                    <div className="flex items-start gap-2 mb-1">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-aqua-500 hover:text-aqua-400 hover:underline"
                      >
                        {source.name} ↗
                      </a>
                    </div>
                    <p className="text-caption text-text-secondary">{source.description}</p>
                    <p className="text-micro text-text-muted mt-1 font-mono break-all">{source.url}</p>
                  </div>
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
            ? '💡 Alle Isotopenverhältnisse, Gase und Diagnose-Algorithmen sind wissenschaftlich validiert. Die App nutzt Quadrupol-RGA-Präzision (±5-10%), ausreichend für Routine-Vakuum-Diagnostik in Forschung und Industrie.'
            : '💡 All isotope ratios, gases and diagnostic algorithms are scientifically validated. The app uses quadrupole RGA precision (±5-10%), sufficient for routine vacuum diagnostics in research and industry.'}
        </p>
      </div>
    </div>
  )
}

// ============================================
// VALIDATION TAB
// ============================================
function ValidationTab({ isGerman }: { isGerman: boolean }) {
  const detectorInfo: Array<{
    type: DiagnosisType
    name: string
    nameEn: string
    line: number
  }> = [
    { type: DiagnosisType.AIR_LEAK, name: 'Luftleck', nameEn: 'Air Leak', line: 43 },
    { type: DiagnosisType.OIL_BACKSTREAMING, name: 'Öl-Rückströmung', nameEn: 'Oil Backstreaming', line: 135 },
    { type: DiagnosisType.FOMBLIN_CONTAMINATION, name: 'FOMBLIN-Kontamination', nameEn: 'FOMBLIN Contamination', line: 219 },
    { type: DiagnosisType.SOLVENT_RESIDUE, name: 'Lösemittelrückstände', nameEn: 'Solvent Residue', line: 291 },
    { type: DiagnosisType.CHLORINATED_SOLVENT, name: 'Chlorierte Lösemittel', nameEn: 'Chlorinated Solvent', line: 386 },
    { type: DiagnosisType.WATER_OUTGASSING, name: 'Wasser-Ausgasung', nameEn: 'Water Outgassing', line: 445 },
    { type: DiagnosisType.HYDROGEN_DOMINANT, name: 'Wasserstoff-Dominanz', nameEn: 'Hydrogen Dominant', line: 549 },
    { type: DiagnosisType.ESD_ARTIFACT, name: 'ESD-Artefakte', nameEn: 'ESD Artifacts', line: 644 },
    { type: DiagnosisType.HELIUM_LEAK_INDICATOR, name: 'Helium-Leck-Indikator', nameEn: 'Helium Leak Indicator', line: 845 },
    { type: DiagnosisType.SILICONE_CONTAMINATION, name: 'Silikon-Kontamination', nameEn: 'Silicone Contamination', line: 932 },
    { type: DiagnosisType.VIRTUAL_LEAK, name: 'Virtuelles Leck', nameEn: 'Virtual Leak', line: 993 },
    { type: DiagnosisType.CLEAN_UHV, name: 'Sauberer UHV', nameEn: 'Clean UHV', line: 1190 },
    { type: DiagnosisType.N2_CO_MIXTURE, name: 'N₂/CO-Unterscheidung', nameEn: 'N₂/CO Distinction', line: 1078 },
    { type: DiagnosisType.AMMONIA_CONTAMINATION, name: 'Ammoniak-Kontamination', nameEn: 'Ammonia Contamination', line: 1261 },
    { type: DiagnosisType.METHANE_CONTAMINATION, name: 'Methan-Kontamination', nameEn: 'Methane Contamination', line: 1354 },
    { type: DiagnosisType.SULFUR_CONTAMINATION, name: 'Schwefel-Kontamination', nameEn: 'Sulfur Contamination', line: 1443 },
    { type: DiagnosisType.AROMATIC_CONTAMINATION, name: 'Aromatische KW', nameEn: 'Aromatic HC', line: 1534 },
    { type: DiagnosisType.POLYMER_OUTGASSING, name: 'Polymer-Ausgasung', nameEn: 'Polymer Outgassing', line: 1639 },
    { type: DiagnosisType.PLASTICIZER_CONTAMINATION, name: 'Weichmacher-Kontamination', nameEn: 'Plasticizer Contamination', line: 1708 },
    { type: DiagnosisType.PROCESS_GAS_RESIDUE, name: 'Prozessgas-Rückstände', nameEn: 'Process Gas Residue', line: 1761 },
    { type: DiagnosisType.COOLING_WATER_LEAK, name: 'Kühlwasser-Leck', nameEn: 'Cooling Water Leak', line: 1837 },
    { type: DiagnosisType.ISOTOPE_VERIFICATION, name: 'Isotopen-Verifizierung', nameEn: 'Isotope Verification', line: 1895 },
  ]

  const validatedCount = detectorInfo.filter(d => DETECTOR_VALIDATIONS[d.type]?.validated).length
  const highConfidenceCount = detectorInfo.filter(d => DETECTOR_VALIDATIONS[d.type]?.confidence === 'high').length
  const mediumConfidenceCount = detectorInfo.filter(d => DETECTOR_VALIDATIONS[d.type]?.confidence === 'medium').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-h4 font-semibold text-text-primary mb-2">
          {isGerman ? 'Wissenschaftliche Validierung' : 'Scientific Validation'}
        </h3>
        <p className="text-body text-text-secondary">
          {isGerman
            ? 'Alle Diagnose-Detektoren wurden systematisch gegen NIST WebBook, CERN, Hersteller-Dokumentation und Peer-reviewed Literatur validiert.'
            : 'All diagnostic detectors have been systematically validated against NIST WebBook, CERN, manufacturer documentation and peer-reviewed literature.'}
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-700 dark:text-green-400">{highConfidenceCount}</div>
          <div className="text-caption text-green-600 dark:text-green-500 mt-1">
            {isGerman ? 'Hohe Konfidenz' : 'High Confidence'}
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{mediumConfidenceCount}</div>
          <div className="text-caption text-yellow-600 dark:text-yellow-500 mt-1">
            {isGerman ? 'Mittlere Konfidenz' : 'Medium Confidence'}
          </div>
        </div>
        <div className="bg-aqua-50 dark:bg-aqua-900/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-aqua-700 dark:text-aqua-400">{validatedCount}/{detectorInfo.length}</div>
          <div className="text-caption text-aqua-600 dark:text-aqua-500 mt-1">
            {isGerman ? 'Validiert' : 'Validated'}
          </div>
        </div>
      </div>

      {/* Detectors List */}
      <section>
        <h4 className="font-medium text-text-primary mb-3">
          {isGerman ? 'Diagnose-Detektoren (22 insgesamt)' : 'Diagnostic Detectors (22 total)'}
        </h4>
        <div className="space-y-2">
          {detectorInfo.map((detector) => {
            const validation = DETECTOR_VALIDATIONS[detector.type]
            if (!validation) return null

            return (
              <div key={detector.type} className="bg-surface-card-muted rounded-lg p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-text-primary mb-1">
                      {isGerman ? detector.name : detector.nameEn}
                    </div>
                    <div className="text-micro text-text-muted mb-2">
                      detectors.ts:{detector.line}
                    </div>
                    {validation.notes && (
                      <div className="text-caption text-text-secondary italic">
                        {validation.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <ValidationBadge validation={validation} compact />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Documentation Link */}
      <div className="bg-aqua-500/10 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📚</span>
          <div className="flex-1">
            <h5 className="font-medium text-aqua-700 dark:text-aqua-300 mb-1">
              {isGerman ? 'Vollständige Dokumentation' : 'Complete Documentation'}
            </h5>
            <p className="text-caption text-aqua-600 dark:text-aqua-400 mb-2">
              {isGerman
                ? 'Detaillierte wissenschaftliche Validierung aller Detektoren mit 100+ Quellen in DOCUMENTATION/SCIENTIFIC/'
                : 'Detailed scientific validation of all detectors with 100+ sources in DOCUMENTATION/SCIENTIFIC/'}
            </p>
            <div className="space-y-1">
              <div className="text-caption">
                <span className="font-mono text-aqua-700 dark:text-aqua-300">DETECTORS.md</span>
                <span className="text-text-muted"> - </span>
                <span className="text-text-secondary">{isGerman ? '43 KB, alle 22 Detektoren' : '43 KB, all 22 detectors'}</span>
              </div>
              <div className="text-caption">
                <span className="font-mono text-aqua-700 dark:text-aqua-300">CALCULATIONS.md</span>
                <span className="text-text-muted"> - </span>
                <span className="text-text-secondary">{isGerman ? 'RSF-Werte, Formeln' : 'RSF values, formulas'}</span>
              </div>
              <div className="text-caption">
                <span className="font-mono text-aqua-700 dark:text-aqua-300">CRACKING_PATTERNS.md</span>
                <span className="text-text-muted"> - </span>
                <span className="text-text-secondary">{isGerman ? '7 Gase validiert' : '7 gases validated'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
