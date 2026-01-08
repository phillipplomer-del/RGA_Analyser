/**
 * Outgassing Store
 * Stores outgassing simulation results for cross-component access
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MaterialEntry, TotalOutgassingResult } from '@/lib/knowledge/outgassingRates'
import { calculateTotalOutgassing } from '@/lib/knowledge/outgassingRates'

interface OutgassingState {
  // Chamber parameters
  volume: number // Liters
  pumpSpeed: number // l/s
  pumpTime: number // Hours

  // Materials
  materials: MaterialEntry[]

  // Calculation results
  results: TotalOutgassingResult | null

  // Last calculation timestamp
  lastCalculated: Date | null

  // Actions
  setVolume: (volume: number) => void
  setPumpSpeed: (speed: number) => void
  setPumpTime: (time: number) => void
  setMaterials: (materials: MaterialEntry[]) => void
  addMaterial: (material: MaterialEntry) => void
  removeMaterial: (index: number) => void
  updateMaterial: (index: number, updates: Partial<MaterialEntry>) => void
  loadPreset: (volume: number, pumpSpeed: number, materials: MaterialEntry[]) => void
  calculate: () => void
  reset: () => void
}

const DEFAULT_MATERIALS: MaterialEntry[] = [
  { materialId: 'ss316ln-electropolished', surfaceArea_cm2: 2000, isBaked: false, label: 'Wände' },
  { materialId: 'viton-a', surfaceArea_cm2: 15, isBaked: false, label: 'O-Ringe' }
]

export const useOutgassingStore = create<OutgassingState>()(
  persist(
    (set, get) => ({
      // Default values
      volume: 10,
      pumpSpeed: 100,
      pumpTime: 4,
      materials: DEFAULT_MATERIALS,
      results: null,
      lastCalculated: null,

      setVolume: (volume) => {
        set({ volume })
        get().calculate()
      },

      setPumpSpeed: (pumpSpeed) => {
        set({ pumpSpeed })
        get().calculate()
      },

      setPumpTime: (pumpTime) => {
        set({ pumpTime })
        get().calculate()
      },

      setMaterials: (materials) => {
        set({ materials })
        get().calculate()
      },

      addMaterial: (material) => {
        set((state) => ({ materials: [...state.materials, material] }))
        get().calculate()
      },

      removeMaterial: (index) => {
        set((state) => ({
          materials: state.materials.filter((_, i) => i !== index)
        }))
        get().calculate()
      },

      updateMaterial: (index, updates) => {
        set((state) => ({
          materials: state.materials.map((m, i) =>
            i === index ? { ...m, ...updates } : m
          )
        }))
        get().calculate()
      },

      loadPreset: (volume, pumpSpeed, materials) => {
        set({ volume, pumpSpeed, materials })
        get().calculate()
      },

      calculate: () => {
        const { materials, volume, pumpSpeed, pumpTime } = get()
        if (materials.length === 0) {
          set({ results: null })
          return
        }

        const results = calculateTotalOutgassing(materials, volume, pumpSpeed, pumpTime)
        set({ results, lastCalculated: new Date() })
      },

      reset: () => {
        set({
          volume: 10,
          pumpSpeed: 100,
          pumpTime: 4,
          materials: DEFAULT_MATERIALS,
          results: null,
          lastCalculated: null
        })
      }
    }),
    {
      name: 'outgassing-store',
      partialize: (state) => ({
        volume: state.volume,
        pumpSpeed: state.pumpSpeed,
        pumpTime: state.pumpTime,
        materials: state.materials
      })
    }
  )
)

/**
 * Helper function to compare measured pressure rise with expected outgassing
 * Returns the fraction that can be explained by outgassing
 */
export function compareWithMeasuredRise(
  measuredRise_mbarPerHour: number,
  expectedFromOutgassing_mbarPerHour: number
): {
  outgassingFraction: number
  potentialLeakFraction: number
  interpretation: string
  interpretationEn: string
} {
  if (measuredRise_mbarPerHour <= 0 || expectedFromOutgassing_mbarPerHour <= 0) {
    return {
      outgassingFraction: 0,
      potentialLeakFraction: 1,
      interpretation: 'Ungültige Eingabewerte',
      interpretationEn: 'Invalid input values'
    }
  }

  const outgassingFraction = Math.min(1, expectedFromOutgassing_mbarPerHour / measuredRise_mbarPerHour)
  const potentialLeakFraction = 1 - outgassingFraction

  let interpretation: string
  let interpretationEn: string

  if (outgassingFraction > 0.9) {
    interpretation = 'Druckanstieg vollständig durch Ausgasung erklärbar. Kein Leck vermutet.'
    interpretationEn = 'Pressure rise fully explained by outgassing. No leak suspected.'
  } else if (outgassingFraction > 0.5) {
    interpretation = `${(outgassingFraction * 100).toFixed(0)}% durch Ausgasung erklärbar. Rest könnte auf Leck hindeuten.`
    interpretationEn = `${(outgassingFraction * 100).toFixed(0)}% explained by outgassing. Remainder may indicate leak.`
  } else if (outgassingFraction > 0.1) {
    interpretation = `Nur ${(outgassingFraction * 100).toFixed(0)}% durch Ausgasung erklärbar. Leck wahrscheinlich!`
    interpretationEn = `Only ${(outgassingFraction * 100).toFixed(0)}% explained by outgassing. Leak likely!`
  } else {
    interpretation = 'Druckanstieg deutlich höher als erwartete Ausgasung. Signifikantes Leck!'
    interpretationEn = 'Pressure rise significantly exceeds expected outgassing. Significant leak!'
  }

  return {
    outgassingFraction,
    potentialLeakFraction,
    interpretation,
    interpretationEn
  }
}
