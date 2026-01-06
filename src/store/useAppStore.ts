import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { RawData, AnalysisResult, MeasurementFile, ComparisonResult } from '@/types/rga'

interface ChartOptions {
  logScale: boolean
  showGSILimit: boolean
  showCERNLimit: boolean
}

interface AppState {
  // Data - Single File Mode
  rawData: RawData | null
  analysisResult: AnalysisResult | null
  aiInterpretation: string | null
  isAnalyzing: boolean
  error: string | null

  // Data - Comparison Mode
  comparisonMode: boolean
  beforeFile: MeasurementFile | null
  afterFile: MeasurementFile | null
  comparisonResult: ComparisonResult | null

  // UI
  theme: 'light' | 'dark'
  language: 'de' | 'en'
  chartOptions: ChartOptions

  // Actions - Single File
  setRawData: (data: RawData) => void
  setAnalysisResult: (result: AnalysisResult) => void
  setAiInterpretation: (interpretation: string | null) => void
  setIsAnalyzing: (isAnalyzing: boolean) => void
  setError: (error: string | null) => void

  // Actions - Comparison Mode
  setComparisonMode: (enabled: boolean) => void
  setBeforeFile: (file: MeasurementFile | null) => void
  setAfterFile: (file: MeasurementFile | null) => void
  setComparisonResult: (result: ComparisonResult | null) => void
  swapFiles: () => void
  clearComparison: () => void

  // Actions - UI
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setLanguage: (lang: 'de' | 'en') => void
  updateChartOptions: (options: Partial<ChartOptions>) => void
  reset: () => void
}

const initialState = {
  // Single File Mode
  rawData: null,
  analysisResult: null,
  aiInterpretation: null,
  isAnalyzing: false,
  error: null,

  // Comparison Mode
  comparisonMode: false,
  beforeFile: null,
  afterFile: null,
  comparisonResult: null,

  // UI
  theme: 'light' as const,
  language: 'de' as const,
  chartOptions: {
    logScale: true,
    showGSILimit: true,
    showCERNLimit: true,
  },
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setRawData: (data) => set({ rawData: data, error: null }),

        setAnalysisResult: (result) => set({ analysisResult: result, isAnalyzing: false }),

        setAiInterpretation: (interpretation) => set({ aiInterpretation: interpretation }),

        setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

        setError: (error) => set({ error, isAnalyzing: false }),

        toggleTheme: () => set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light'
          document.documentElement.classList.toggle('dark', newTheme === 'dark')
          return { theme: newTheme }
        }),

        setTheme: (theme) => {
          document.documentElement.classList.toggle('dark', theme === 'dark')
          set({ theme })
        },

        setLanguage: (language) => set({ language }),

        updateChartOptions: (options) => set((state) => ({
          chartOptions: { ...state.chartOptions, ...options },
        })),

        // Comparison Mode Actions
        setComparisonMode: (enabled) => set({
          comparisonMode: enabled,
          // Clear single-file data when entering comparison mode
          ...(enabled ? { rawData: null, analysisResult: null, aiInterpretation: null } : {}),
          // Clear comparison data when leaving comparison mode
          ...(!enabled ? { beforeFile: null, afterFile: null, comparisonResult: null } : {}),
        }),

        setBeforeFile: (file) => set({ beforeFile: file, comparisonResult: null }),

        setAfterFile: (file) => set({ afterFile: file, comparisonResult: null }),

        setComparisonResult: (result) => set({ comparisonResult: result, isAnalyzing: false }),

        swapFiles: () => set((state) => ({
          beforeFile: state.afterFile ? { ...state.afterFile, slot: 'before' as const } : null,
          afterFile: state.beforeFile ? { ...state.beforeFile, slot: 'after' as const } : null,
          comparisonResult: null,
        })),

        clearComparison: () => set({
          beforeFile: null,
          afterFile: null,
          comparisonResult: null,
          error: null,
        }),

        reset: () => set({
          // Single file
          rawData: null,
          analysisResult: null,
          aiInterpretation: null,
          isAnalyzing: false,
          error: null,
          // Comparison
          comparisonMode: false,
          beforeFile: null,
          afterFile: null,
          comparisonResult: null,
        }),
      }),
      {
        name: 'rga-analyser-storage',
        partialize: (state) => ({
          theme: state.theme,
          language: state.language,
          chartOptions: state.chartOptions,
        }),
      }
    ),
    { name: 'RGA Analyser' }
  )
)
