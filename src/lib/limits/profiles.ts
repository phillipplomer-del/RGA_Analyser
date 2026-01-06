import type { LimitProfile } from '@/types/rga'

export const PROFILE_COLORS = [
  '#10B981', // Green (GSI)
  '#3B82F6', // Blue (CERN)
  '#8B5CF6', // Violet
  '#F59E0B', // Orange
  '#EF4444', // Red
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#6366F1', // Indigo
]

export const GSI_PRESET: LimitProfile = {
  id: 'gsi-7.3e',
  name: 'GSI 7.3e (2019)',
  description: 'GSI Spezifikation 7.3e for UHV components',
  color: '#10B981',
  isPreset: true,
  ranges: [
    { massMin: 0, massMax: 12, limit: 1.0, notes: 'H\u2082 Region' },
    { massMin: 12, massMax: 19.5, limit: 0.1, notes: 'Light gases' },
    { massMin: 19.5, massMax: 27.5, limit: 0.02, notes: 'Between H\u2082O and N\u2082' },
    { massMin: 27.5, massMax: 28.5, limit: 0.1, notes: 'N\u2082/CO allowed' },
    { massMin: 28.5, massMax: 43.5, limit: 0.02 },
    { massMin: 43.5, massMax: 44.75, limit: 0.1, notes: 'CO\u2082 allowed' },
    { massMin: 44.75, massMax: 100, limit: 0.001, notes: 'Heavy masses' },
  ],
  createdAt: '2019-01-01T00:00:00.000Z',
  updatedAt: '2019-01-01T00:00:00.000Z',
}

export const CERN_PRESET: LimitProfile = {
  id: 'cern-3076004',
  name: 'CERN 3076004 (2024)',
  description: 'CERN Technical Specification for vacuum components',
  color: '#3B82F6',
  isPreset: true,
  ranges: [
    { massMin: 0, massMax: 3, limit: 1.0, notes: 'H\u2082 allowed' },
    { massMin: 3, massMax: 20.5, limit: 0.1, notes: 'H\u2082O Region' },
    { massMin: 20.5, massMax: 27.5, limit: 0.01 },
    { massMin: 27.5, massMax: 28.5, limit: 0.1, notes: 'N\u2082 peak allowed' },
    { massMin: 28.5, massMax: 31.5, limit: 0.01 },
    { massMin: 31.5, massMax: 32.5, limit: 0.05, notes: 'O\u2082' },
    { massMin: 32.5, massMax: 39.5, limit: 0.01 },
    { massMin: 39.5, massMax: 40.5, limit: 0.05, notes: 'Ar' },
    { massMin: 40.5, massMax: 43.5, limit: 0.01 },
    { massMin: 43.5, massMax: 44.5, limit: 0.02, notes: 'CO\u2082' },
    { massMin: 44.5, massMax: 100, limit: 0.001 },
  ],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

export const DEFAULT_PRESETS: LimitProfile[] = [GSI_PRESET, CERN_PRESET]

export function getNextProfileColor(existingProfiles: LimitProfile[]): string {
  const usedColors = new Set(existingProfiles.map(p => p.color))
  // Start from index 2 (skip GSI green and CERN blue for custom profiles)
  for (let i = 2; i < PROFILE_COLORS.length; i++) {
    if (!usedColors.has(PROFILE_COLORS[i])) {
      return PROFILE_COLORS[i]
    }
  }
  // Fallback to first available or violet
  return PROFILE_COLORS[2]
}
