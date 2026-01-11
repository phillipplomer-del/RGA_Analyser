import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils/cn'
import { CriteriaTab } from './tabs/CriteriaTab'
import { GasesTab } from './tabs/GasesTab'
import { MassesTab } from './tabs/MassesTab'
import { PatternsTab } from './tabs/PatternsTab'
import { CalibrationTab } from './tabs/CalibrationTab'
import { RateOfRiseTab } from './tabs/RateOfRiseTab'
import { OutgassingInfoTab } from './tabs/OutgassingInfoTab'
import { FeaturesTab } from './tabs/FeaturesTab'
import { ReferencesTab } from './tabs/ReferencesTab'

type TabKey = 'criteria' | 'gases' | 'masses' | 'patterns' | 'outgassing' | 'calibration' | 'rateOfRise' | 'features' | 'references'

interface KnowledgePanelProps {
  compact?: boolean
  onShowOutgassing?: () => void
}

export function KnowledgePanel({ compact, onShowOutgassing }: KnowledgePanelProps) {
  const { i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabKey>('criteria')
  const [expandedGas, setExpandedGas] = useState<string | null>(null)
  const [expandedMass, setExpandedMass] = useState<number | null>(null)
  const isGerman = i18n.language === 'de'

  const tabs: { key: TabKey; label: string; labelEn: string }[] = [
    { key: 'criteria', label: 'Diagnosen', labelEn: 'Diagnoses' },
    { key: 'gases', label: 'Gase', labelEn: 'Gases' },
    { key: 'masses', label: 'Massen', labelEn: 'Masses' },
    { key: 'patterns', label: 'Muster', labelEn: 'Patterns' },
    { key: 'outgassing', label: 'Ausgasung', labelEn: 'Outgassing' },
    { key: 'calibration', label: 'Kalibrierung', labelEn: 'Calibration' },
    { key: 'rateOfRise', label: 'Rate of Rise', labelEn: 'Rate of Rise' },
    { key: 'features', label: '🚀 Features', labelEn: '🚀 Features' },
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
        {activeTab === 'outgassing' && <OutgassingInfoTab isGerman={isGerman} onShowOutgassing={onShowOutgassing} />}
        {activeTab === 'calibration' && <CalibrationTab isGerman={isGerman} />}
        {activeTab === 'rateOfRise' && <RateOfRiseTab isGerman={isGerman} />}
        {activeTab === 'features' && <FeaturesTab isGerman={isGerman} />}
        {activeTab === 'references' && <ReferencesTab isGerman={isGerman} />}
      </div>
    </div>
  )
}
