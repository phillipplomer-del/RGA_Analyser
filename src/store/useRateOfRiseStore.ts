/**
 * Rate-of-Rise Zustand Store
 * State management for pressure rise test analysis
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type {
  RateOfRiseData,
  RateOfRiseAnalysis,
} from '@/types/rateOfRise'
import type { CloudRoRTestMeta } from '@/types/firebase'
import { parseTPG362CSV } from '@/lib/rateOfRise/parser'
import { analyzeRateOfRise } from '@/lib/rateOfRise/analysis'

interface RateOfRiseState {
  // Data
  data: RateOfRiseData | null
  analysis: RateOfRiseAnalysis | null
  isLoading: boolean
  error: string | null

  // User Inputs
  chamberVolume: number | null
  leakRateLimit: number | null
  limitSource: string

  // UI State
  chartScale: 'linear' | 'log'
  showFitLine: boolean
  showPhases: boolean
  selectedRangeStart: number | null
  selectedRangeEnd: number | null

  // Cloud Storage
  savedTests: CloudRoRTestMeta[]
  isLoadingArchive: boolean
  showSaveModal: boolean
  showArchive: boolean

  // Actions - File Loading
  loadFile: (file: File) => Promise<void>
  reset: () => void

  // Actions - Analysis Parameters
  setVolume: (volume: number | null) => void
  setLimit: (limit: number | null, source: string) => void
  setSelectedRange: (start: number | null, end: number | null) => void
  recalculate: () => void

  // Actions - UI
  setChartScale: (scale: 'linear' | 'log') => void
  setShowFitLine: (show: boolean) => void
  setShowPhases: (show: boolean) => void
  setShowSaveModal: (show: boolean) => void
  setShowArchive: (show: boolean) => void

  // Actions - Cloud
  setSavedTests: (tests: CloudRoRTestMeta[]) => void
  setLoadingArchive: (loading: boolean) => void
}

const initialState = {
  // Data
  data: null as RateOfRiseData | null,
  analysis: null as RateOfRiseAnalysis | null,
  isLoading: false,
  error: null as string | null,

  // User Inputs
  chamberVolume: null as number | null,
  leakRateLimit: null as number | null,
  limitSource: '',

  // UI State
  chartScale: 'log' as const,
  showFitLine: true,
  showPhases: true,
  selectedRangeStart: null as number | null,
  selectedRangeEnd: null as number | null,

  // Cloud Storage
  savedTests: [] as CloudRoRTestMeta[],
  isLoadingArchive: false,
  showSaveModal: false,
  showArchive: false,
}

export const useRateOfRiseStore = create<RateOfRiseState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ================================================================
        // File Loading
        // ================================================================

        loadFile: async (file: File) => {
          set({ isLoading: true, error: null })

          try {
            const content = await file.text()
            const result = parseTPG362CSV(content)

            if (!result.success || !result.data) {
              set({
                isLoading: false,
                error: result.error || 'Parsing failed',
                data: null,
                analysis: null,
              })
              return
            }

            const data = result.data

            // Get current parameters
            const { chamberVolume, leakRateLimit, limitSource } = get()

            // Run analysis
            const analysis = analyzeRateOfRise(
              data,
              chamberVolume,
              leakRateLimit,
              limitSource
            )

            set({
              data,
              analysis,
              isLoading: false,
              error: null,
            })
          } catch (e) {
            set({
              isLoading: false,
              error: e instanceof Error ? e.message : 'Unknown error',
              data: null,
              analysis: null,
            })
          }
        },

        reset: () => {
          set({
            ...initialState,
            // Preserve user preferences
            chartScale: get().chartScale,
            showFitLine: get().showFitLine,
            showPhases: get().showPhases,
            chamberVolume: get().chamberVolume,
            leakRateLimit: get().leakRateLimit,
            limitSource: get().limitSource,
          })
        },

        // ================================================================
        // Analysis Parameters
        // ================================================================

        setVolume: (volume: number | null) => {
          set({ chamberVolume: volume })
          // Recalculate if data exists
          const { data, leakRateLimit, limitSource } = get()
          if (data) {
            const analysis = analyzeRateOfRise(
              data,
              volume,
              leakRateLimit,
              limitSource
            )
            set({ analysis })
          }
        },

        setLimit: (limit: number | null, source: string) => {
          set({ leakRateLimit: limit, limitSource: source })
          // Recalculate if data exists
          const { data, chamberVolume } = get()
          if (data) {
            const analysis = analyzeRateOfRise(
              data,
              chamberVolume,
              limit,
              source
            )
            set({ analysis })
          }
        },

        setSelectedRange: (start: number | null, end: number | null) => {
          set({ selectedRangeStart: start, selectedRangeEnd: end })
        },

        recalculate: () => {
          const { data, chamberVolume, leakRateLimit, limitSource } = get()
          if (data) {
            const analysis = analyzeRateOfRise(
              data,
              chamberVolume,
              leakRateLimit,
              limitSource
            )
            set({ analysis })
          }
        },

        // ================================================================
        // UI Actions
        // ================================================================

        setChartScale: (scale: 'linear' | 'log') => {
          set({ chartScale: scale })
        },

        setShowFitLine: (show: boolean) => {
          set({ showFitLine: show })
        },

        setShowPhases: (show: boolean) => {
          set({ showPhases: show })
        },

        setShowSaveModal: (show: boolean) => {
          set({ showSaveModal: show })
        },

        setShowArchive: (show: boolean) => {
          set({ showArchive: show })
        },

        // ================================================================
        // Cloud Actions
        // ================================================================

        setSavedTests: (tests: CloudRoRTestMeta[]) => {
          set({ savedTests: tests })
        },

        setLoadingArchive: (loading: boolean) => {
          set({ isLoadingArchive: loading })
        },
      }),
      {
        name: 'rate-of-rise-storage',
        // Only persist user preferences, not data
        partialize: (state) => ({
          chartScale: state.chartScale,
          showFitLine: state.showFitLine,
          showPhases: state.showPhases,
          chamberVolume: state.chamberVolume,
          leakRateLimit: state.leakRateLimit,
          limitSource: state.limitSource,
        }),
      }
    ),
    { name: 'RateOfRiseStore' }
  )
)
