import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { RawData, AnalysisResult } from '@/types/rga'

interface ChartOptions {
  logScale: boolean
  showGSILimit: boolean
  showCERNLimit: boolean
}

interface AppState {
  // Data
  rawData: RawData | null
  analysisResult: AnalysisResult | null
  isAnalyzing: boolean
  error: string | null

  // UI
  theme: 'light' | 'dark'
  language: 'de' | 'en'
  chartOptions: ChartOptions

  // Actions
  setRawData: (data: RawData) => void
  setAnalysisResult: (result: AnalysisResult) => void
  setIsAnalyzing: (isAnalyzing: boolean) => void
  setError: (error: string | null) => void
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setLanguage: (lang: 'de' | 'en') => void
  updateChartOptions: (options: Partial<ChartOptions>) => void
  reset: () => void
}

const initialState = {
  rawData: null,
  analysisResult: null,
  isAnalyzing: false,
  error: null,
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

        reset: () => set({
          rawData: null,
          analysisResult: null,
          isAnalyzing: false,
          error: null,
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
