import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/useAppStore'
import type { MeasurementFile, LimitProfile, LimitRange } from '@/types/rga'
import { checkProfilePasses, getProfileViolations } from '@/lib/limits'
import { PROFILE_COLORS, getNextProfileColor } from '@/lib/limits/profiles'

interface LimitsPanelProps {
  files: MeasurementFile[]
}

export function LimitsPanel({ files }: LimitsPanelProps) {
  const { t } = useTranslation()
  const {
    limitProfiles,
    activeLimitProfileIds,
    toggleLimitProfile,
    addLimitProfile,
    updateLimitProfile,
    deleteLimitProfile,
    duplicateLimitProfile,
  } = useAppStore()

  const [editingProfileId, setEditingProfileId] = useState<string | null>(null)
  const [showExtractor, setShowExtractor] = useState(false)

  const editingProfile = editingProfileId
    ? limitProfiles.find((p) => p.id === editingProfileId)
    : null

  const handleCreateNew = () => {
    const newColor = getNextProfileColor(limitProfiles)
    const id = addLimitProfile({
      name: t('limits.newProfile', 'New Profile'),
      description: '',
      color: newColor,
      isPreset: false,
      ranges: [
        { massMin: 0, massMax: 12, limit: 1.0 },
        { massMin: 12, massMax: 100, limit: 0.01 },
      ],
    })
    setEditingProfileId(id)
  }

  const handleDuplicate = (id: string) => {
    const source = limitProfiles.find((p) => p.id === id)
    if (source) {
      const newId = duplicateLimitProfile(id, `${source.name} (${t('limits.copy', 'Copy')})`)
      setEditingProfileId(newId)
    }
  }

  const primaryFile = files[0]
  const normalizedData = primaryFile?.analysisResult?.normalizedData || []

  return (
    <div className="flex flex-col h-full">
      {/* Profile List */}
      <div className="p-4 border-b border-subtle">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-text-primary text-sm">
            {t('limits.profiles', 'Profiles')}
          </h3>
          <button
            onClick={handleCreateNew}
            className="text-xs px-2 py-1 bg-aqua-500 text-white rounded hover:bg-aqua-600 transition-colors"
          >
            + {t('limits.new', 'New')}
          </button>
        </div>

        <div className="space-y-2">
          {limitProfiles.map((profile) => {
            const isActive = activeLimitProfileIds.includes(profile.id)
            const passes = normalizedData.length > 0
              ? checkProfilePasses(normalizedData, profile)
              : null
            const violations = normalizedData.length > 0
              ? getProfileViolations(normalizedData, profile).length
              : 0

            return (
              <div
                key={profile.id}
                className={`flex items-center gap-2 p-2 rounded-lg border transition-colors
                  ${isActive ? 'border-aqua-500/50 bg-aqua-500/5' : 'border-subtle hover:bg-surface-card-muted'}`}
              >
                {/* Toggle Checkbox */}
                <button
                  onClick={() => toggleLimitProfile(profile.id)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                    ${isActive ? 'border-aqua-500 bg-aqua-500' : 'border-gray-400'}`}
                >
                  {isActive && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Color Indicator */}
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: profile.color }}
                />

                {/* Profile Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary truncate">
                      {profile.name}
                    </span>
                    {profile.isPreset && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-surface-card-muted text-text-muted rounded">
                        {t('limits.preset', 'Preset')}
                      </span>
                    )}
                  </div>
                  {passes !== null && (
                    <div className={`text-xs ${passes ? 'text-green-500' : 'text-red-500'}`}>
                      {passes
                        ? t('limits.passed', 'Passed')
                        : t('limits.failed', '{{count}} violations', { count: violations })}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleDuplicate(profile.id)}
                    className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-card-muted rounded transition-colors"
                    title={t('limits.duplicate', 'Duplicate')}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  {!profile.isPreset && (
                    <>
                      <button
                        onClick={() => setEditingProfileId(profile.id)}
                        className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-card-muted rounded transition-colors"
                        title={t('limits.edit', 'Edit')}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteLimitProfile(profile.id)}
                        className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        title={t('common.delete', 'Delete')}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Profile Editor or Extractor */}
      {editingProfile ? (
        <ProfileEditor
          profile={editingProfile}
          onUpdate={(updates) => updateLimitProfile(editingProfile.id, updates)}
          onDelete={() => {
            deleteLimitProfile(editingProfile.id)
            setEditingProfileId(null)
          }}
          onClose={() => setEditingProfileId(null)}
        />
      ) : (
        <div className="p-4">
          <button
            onClick={() => setShowExtractor(!showExtractor)}
            className="w-full text-left p-3 rounded-lg border border-dashed border-subtle
              hover:border-aqua-500 hover:bg-aqua-500/5 transition-colors"
          >
            <div className="flex items-center gap-2 text-text-secondary">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">{t('limits.extractFromSpec', 'Extract from specification text...')}</span>
            </div>
          </button>
          {showExtractor && (
            <SpecExtractor
              onProfileCreated={(id) => {
                setShowExtractor(false)
                setEditingProfileId(id)
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// Profile Editor Sub-Component
// ============================================

interface ProfileEditorProps {
  profile: LimitProfile
  onUpdate: (updates: Partial<LimitProfile>) => void
  onDelete: () => void
  onClose: () => void
}

function ProfileEditor({ profile, onUpdate, onDelete, onClose }: ProfileEditorProps) {
  const { t } = useTranslation()

  const handleRangeChange = (index: number, field: keyof LimitRange, value: string | number) => {
    const newRanges = [...profile.ranges]
    if (field === 'notes') {
      newRanges[index] = { ...newRanges[index], [field]: value as string }
    } else {
      newRanges[index] = { ...newRanges[index], [field]: parseFloat(value as string) || 0 }
    }
    onUpdate({ ranges: newRanges })
  }

  const handleAddRange = () => {
    const lastRange = profile.ranges[profile.ranges.length - 1]
    onUpdate({
      ranges: [
        ...profile.ranges,
        {
          massMin: lastRange?.massMax || 0,
          massMax: 100,
          limit: 0.01,
        },
      ],
    })
  }

  const handleRemoveRange = (index: number) => {
    if (profile.ranges.length > 1) {
      onUpdate({ ranges: profile.ranges.filter((_, i) => i !== index) })
    }
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-text-primary">
          {t('limits.editProfile', 'Edit Profile')}
        </h3>
        <button
          onClick={onClose}
          className="p-1 text-text-muted hover:text-text-primary"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Name */}
      <div className="mb-4">
        <label className="block text-xs text-text-secondary mb-1">
          {t('limits.name', 'Name')}
        </label>
        <input
          type="text"
          value={profile.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="w-full px-3 py-2 bg-surface-card-muted border border-subtle rounded-lg
            text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-aqua-500"
        />
      </div>

      {/* Color */}
      <div className="mb-4">
        <label className="block text-xs text-text-secondary mb-1">
          {t('limits.color', 'Color')}
        </label>
        <div className="flex gap-2">
          {PROFILE_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => onUpdate({ color })}
              className={`w-8 h-8 rounded-full transition-transform
                ${profile.color === color ? 'ring-2 ring-offset-2 ring-aqua-500 scale-110' : 'hover:scale-105'}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Ranges Table */}
      <div className="mb-4">
        <label className="block text-xs text-text-secondary mb-2">
          {t('limits.ranges', 'Mass Ranges')}
        </label>
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-[80px_80px_80px_32px] gap-2 text-xs text-text-muted font-medium">
            <span className="px-2">{t('limits.from', 'From')}</span>
            <span className="px-2">{t('limits.to', 'To')}</span>
            <span className="px-2">{t('limits.limit', 'Limit')}</span>
            <span />
          </div>

          {/* Rows */}
          {profile.ranges.map((range, index) => (
            <div key={index} className="grid grid-cols-[80px_80px_80px_32px] gap-2 items-center">
              <input
                type="number"
                value={range.massMin}
                onChange={(e) => handleRangeChange(index, 'massMin', e.target.value)}
                className="w-full px-2 py-1.5 bg-surface-card-muted border border-subtle rounded text-sm text-text-primary
                  focus:outline-none focus:ring-1 focus:ring-aqua-500"
                step="0.1"
              />
              <input
                type="number"
                value={range.massMax}
                onChange={(e) => handleRangeChange(index, 'massMax', e.target.value)}
                className="w-full px-2 py-1.5 bg-surface-card-muted border border-subtle rounded text-sm text-text-primary
                  focus:outline-none focus:ring-1 focus:ring-aqua-500"
                step="0.1"
              />
              <input
                type="number"
                value={range.limit}
                onChange={(e) => handleRangeChange(index, 'limit', e.target.value)}
                className="w-full px-2 py-1.5 bg-surface-card-muted border border-subtle rounded text-sm text-text-primary
                  focus:outline-none focus:ring-1 focus:ring-aqua-500"
                step="0.001"
              />
              <button
                onClick={() => handleRemoveRange(index)}
                disabled={profile.ranges.length <= 1}
                className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-red-500
                  disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={handleAddRange}
          className="mt-2 text-xs text-aqua-500 hover:text-aqua-400 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {t('limits.addRange', 'Add Range')}
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-subtle">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-aqua-500 text-white rounded-lg hover:bg-aqua-600 transition-colors text-sm font-medium"
        >
          {t('common.close', 'Close')}
        </button>
        <button
          onClick={onDelete}
          className="px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
        >
          {t('common.delete', 'Delete')}
        </button>
      </div>
    </div>
  )
}

// ============================================
// Spec Extractor Sub-Component (Placeholder)
// ============================================

interface SpecExtractorProps {
  onProfileCreated: (id: string) => void
}

function SpecExtractor({ onProfileCreated }: SpecExtractorProps) {
  const { t } = useTranslation()
  const { addLimitProfile } = useAppStore()
  const [specText, setSpecText] = useState('')
  const [showPrompt, setShowPrompt] = useState(false)

  const buildPrompt = () => {
    return `Du bist ein Experte für UHV/Vakuumtechnik-Spezifikationen.

AUFGABE: Extrahiere RGA-Grenzwerte aus folgendem Spezifikationstext.

EINGABE:
"""
${specText}
"""

AUSGABE (NUR JSON, keine Erklärung):
{
  "success": true,
  "profile": {
    "name": "Name aus Dokument",
    "description": "Kurzbeschreibung",
    "ranges": [
      { "massMin": 0, "massMax": 12, "limit": 1.0, "notes": "H2" }
    ]
  },
  "confidence": 0.85,
  "warnings": ["Unklare Stellen..."],
  "interpretation": "Wie die Werte interpretiert wurden"
}

Bei Fehler:
{
  "success": false,
  "error": "Grund",
  "suggestions": ["Verbesserungsvorschläge"]
}

REGELN:
- Grenzwerte normiert auf H2 = 1.0
- Masse in AMU
- Prozentangaben umrechnen: 5% = 0.05
- Bei Unklarheit: strengeren Wert wählen
- Nur JSON ausgeben!`
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(buildPrompt())
  }

  const [jsonResponse, setJsonResponse] = useState('')

  const handleProcessResponse = () => {
    try {
      const result = JSON.parse(jsonResponse)
      if (result.success && result.profile) {
        const id = addLimitProfile({
          name: result.profile.name || 'Extracted Profile',
          description: result.profile.description || '',
          color: getNextProfileColor([]),
          isPreset: false,
          ranges: result.profile.ranges || [],
        })
        onProfileCreated(id)
      } else {
        alert(result.error || 'Failed to extract limits')
      }
    } catch {
      alert('Invalid JSON response')
    }
  }

  return (
    <div className="mt-4 p-4 bg-surface-card-muted rounded-lg">
      <h4 className="text-sm font-medium text-text-primary mb-3">
        {t('limits.extractTitle', 'Extract from Specification')}
      </h4>

      <textarea
        value={specText}
        onChange={(e) => setSpecText(e.target.value)}
        placeholder={t('limits.specPlaceholder', 'Paste specification text here...')}
        className="w-full h-32 px-3 py-2 bg-surface-card border border-subtle rounded-lg
          text-sm text-text-primary placeholder:text-text-muted resize-none
          focus:outline-none focus:ring-2 focus:ring-aqua-500"
      />

      {specText && (
        <div className="mt-3 space-y-3">
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="w-full text-left p-2 bg-surface-card border border-subtle rounded-lg
              text-sm text-text-secondary hover:border-aqua-500 transition-colors"
          >
            {showPrompt ? t('limits.hidePrompt', 'Hide Prompt') : t('limits.showPrompt', 'Show AI Prompt')}
          </button>

          {showPrompt && (
            <div className="space-y-2">
              <div className="relative">
                <pre className="p-3 bg-surface-card border border-subtle rounded-lg text-xs text-text-secondary
                  overflow-x-auto max-h-48 overflow-y-auto">
                  {buildPrompt()}
                </pre>
                <button
                  onClick={handleCopyPrompt}
                  className="absolute top-2 right-2 px-2 py-1 bg-aqua-500 text-white text-xs rounded
                    hover:bg-aqua-600 transition-colors"
                >
                  {t('common.copy', 'Copy')}
                </button>
              </div>

              <div className="text-xs text-text-muted">
                {t('limits.pasteInstructions', '2. Paste this in ChatGPT/Gemini, then paste the JSON response below:')}
              </div>

              <textarea
                value={jsonResponse}
                onChange={(e) => setJsonResponse(e.target.value)}
                placeholder='{"success": true, "profile": {...}}'
                className="w-full h-24 px-3 py-2 bg-surface-card border border-subtle rounded-lg
                  text-sm text-text-primary font-mono placeholder:text-text-muted resize-none
                  focus:outline-none focus:ring-2 focus:ring-aqua-500"
              />

              <button
                onClick={handleProcessResponse}
                disabled={!jsonResponse}
                className="w-full px-4 py-2 bg-aqua-500 text-white rounded-lg
                  hover:bg-aqua-600 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors text-sm font-medium"
              >
                {t('limits.processResponse', 'Process Response')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
