import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { MeasurementFile, ComparisonResult, LimitProfile } from '@/types/rga'
import type { AppUser, CloudSpectrumMeta } from '@/types/firebase'
import type { CalibrationLevel, PressureUnit, DeviceCalibration } from '@/types/calibration'
import { DEFAULT_PRESETS, getNextProfileColor } from '@/lib/limits/profiles'
import { getCurrentUser } from '@/lib/firebase/simpleAuth'
import { analyzeSpectrum } from '@/lib/analysis'
import { getLatestDeviceCalibration } from '@/lib/firebase/calibrationService'

const MAX_FILES = 3

interface ChartOptions {
  logScale: boolean
  showGSILimit: boolean
  showCERNLimit: boolean
  visibleFiles: string[]  // Array of file IDs that are visible in chart
  normalizationMass: number  // Mass to normalize to (default: 2 for H₂)
  yAxisMode: 'normalized' | 'absolute' | 'pressure'  // Y-axis display mode
}

interface AppState {
  // Data - Multi-File
  files: MeasurementFile[]
  comparisonResult: ComparisonResult | null
  aiInterpretation: string | null
  isAnalyzing: boolean
  error: string | null

  // Auth & Cloud
  currentUser: AppUser | null
  isAuthLoading: boolean
  cloudSpectra: CloudSpectrumMeta[]
  isSyncing: boolean

  // Limit Profiles
  limitProfiles: LimitProfile[]
  activeLimitProfileIds: string[]

  // Calibration
  calibrationLevel: CalibrationLevel
  pressureUnit: PressureUnit
  deviceCalibration: DeviceCalibration | null

  // UI
  theme: 'light' | 'dark'
  language: 'de' | 'en'
  chartOptions: ChartOptions
  sidebarActivePanel: 'limits' | 'ai' | 'export' | 'calibration' | null
  showKnowledgePage: boolean
  showLoginModal: boolean
  skipLandingPage: boolean

  // Actions - Files
  addFile: (file: MeasurementFile) => void
  removeFile: (id: string) => void
  clearFiles: () => void
  setComparisonResult: (result: ComparisonResult | null) => void
  setAiInterpretation: (interpretation: string | null) => void
  setIsAnalyzing: (isAnalyzing: boolean) => void
  setError: (error: string | null) => void

  // Actions - Auth & Cloud
  setCurrentUser: (user: AppUser | null) => void
  setAuthLoading: (loading: boolean) => void
  setCloudSpectra: (spectra: CloudSpectrumMeta[]) => void
  setSyncing: (syncing: boolean) => void
  setShowLoginModal: (show: boolean) => void
  initializeAuth: () => void
  loadCloudCalibration: () => Promise<void>

  // Actions - Limit Profiles
  addLimitProfile: (profile: Omit<LimitProfile, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateLimitProfile: (id: string, updates: Partial<LimitProfile>) => void
  deleteLimitProfile: (id: string) => void
  duplicateLimitProfile: (id: string, newName: string) => string
  toggleLimitProfile: (id: string) => void
  setActiveLimitProfiles: (ids: string[]) => void

  // Actions - Calibration
  setCalibrationLevel: (level: CalibrationLevel) => void
  setPressureUnit: (unit: PressureUnit) => void
  setDeviceCalibration: (cal: DeviceCalibration | null) => void
  reanalyzeFiles: () => void

  // Actions - UI
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setLanguage: (lang: 'de' | 'en') => void
  updateChartOptions: (options: Partial<ChartOptions>) => void
  toggleFileVisibility: (fileId: string) => void
  setSidebarActivePanel: (panel: 'limits' | 'ai' | 'export' | 'calibration' | null) => void
  setShowKnowledgePage: (show: boolean) => void
  setSkipLandingPage: (skip: boolean) => void
  reset: () => void
}

const initialState = {
  files: [] as MeasurementFile[],
  comparisonResult: null,
  aiInterpretation: null,
  isAnalyzing: false,
  error: null,

  // Auth & Cloud
  currentUser: getCurrentUser(),
  isAuthLoading: false,
  cloudSpectra: [] as CloudSpectrumMeta[],
  isSyncing: false,

  // Limit Profiles - initialize with presets, GSI and CERN active by default
  limitProfiles: DEFAULT_PRESETS,
  activeLimitProfileIds: ['gsi-7.3e', 'cern-3076004'],

  // Calibration - defaults
  calibrationLevel: 'STANDARD' as CalibrationLevel,
  pressureUnit: 'mbar' as PressureUnit,
  deviceCalibration: null as DeviceCalibration | null,

  theme: 'light' as const,
  language: 'de' as const,
  chartOptions: {
    logScale: true,
    showGSILimit: true,
    showCERNLimit: true,
    visibleFiles: [] as string[],
    normalizationMass: 2,  // Default: H₂
    yAxisMode: 'normalized' as const,  // Default: normalized view
  },
  sidebarActivePanel: null as 'limits' | 'ai' | 'export' | 'calibration' | null,
  showKnowledgePage: false,
  showLoginModal: false,
  skipLandingPage: false,
}

// Sort files by measurement date and assign order
function sortAndOrderFiles(files: MeasurementFile[]): MeasurementFile[] {
  return [...files]
    .sort((a, b) => {
      const dateA = a.rawData.metadata.startTime?.getTime() ?? 0
      const dateB = b.rawData.metadata.startTime?.getTime() ?? 0
      return dateA - dateB
    })
    .map((file, index) => ({ ...file, order: index }))
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        addFile: (file) => set((state) => {
          if (state.files.length >= MAX_FILES) {
            return state // Don't add if at max
          }
          const newFiles = sortAndOrderFiles([...state.files, file])
          return {
            files: newFiles,
            comparisonResult: null,
            aiInterpretation: null,
            chartOptions: {
              ...state.chartOptions,
              visibleFiles: newFiles.map(f => f.id), // All visible by default
            },
          }
        }),

        removeFile: (id) => set((state) => {
          const newFiles = sortAndOrderFiles(state.files.filter(f => f.id !== id))
          return {
            files: newFiles,
            comparisonResult: null,
            aiInterpretation: null,
            chartOptions: {
              ...state.chartOptions,
              visibleFiles: state.chartOptions.visibleFiles.filter(fid => fid !== id),
            },
          }
        }),

        clearFiles: () => set({
          files: [],
          comparisonResult: null,
          aiInterpretation: null,
          error: null,
          chartOptions: {
            ...get().chartOptions,
            visibleFiles: [],
          },
        }),

        setComparisonResult: (result) => set({ comparisonResult: result, isAnalyzing: false }),

        setAiInterpretation: (interpretation) => set({ aiInterpretation: interpretation }),

        setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

        setError: (error) => set({ error, isAnalyzing: false }),

        // Auth & Cloud Actions
        setCurrentUser: (user) => set({ currentUser: user }),
        setAuthLoading: (loading) => set({ isAuthLoading: loading }),
        setCloudSpectra: (spectra) => set({ cloudSpectra: spectra }),
        setSyncing: (syncing) => set({ isSyncing: syncing }),
        setShowLoginModal: (show) => set({ showLoginModal: show }),
        initializeAuth: () => {
          const user = getCurrentUser()
          set({ currentUser: user, isAuthLoading: false })
          // Load cloud calibration if user exists
          if (user) {
            get().loadCloudCalibration()
          }
        },
        loadCloudCalibration: async () => {
          const { currentUser } = get()
          if (!currentUser) return

          try {
            const cloudCalibration = await getLatestDeviceCalibration(currentUser.id)
            if (cloudCalibration) {
              set({ deviceCalibration: cloudCalibration })
              // Re-analyze files with cloud calibration
              const { files, calibrationLevel } = get()
              if (files.length > 0) {
                const reanalyzedFiles = files.map(file => ({
                  ...file,
                  analysisResult: analyzeSpectrum(file.rawData, {
                    calibrationLevel,
                    deviceCalibration: cloudCalibration
                  })
                }))
                set({ files: reanalyzedFiles })
              }
            }
          } catch (error) {
            console.error('Failed to load cloud calibration:', error)
          }
        },

        // Limit Profile Actions
        addLimitProfile: (profile) => {
          const id = `custom-${Date.now()}`
          const now = new Date().toISOString()
          set((state) => ({
            limitProfiles: [
              ...state.limitProfiles,
              {
                ...profile,
                id,
                createdAt: now,
                updatedAt: now,
              },
            ],
          }))
          return id
        },

        updateLimitProfile: (id, updates) => set((state) => ({
          limitProfiles: state.limitProfiles.map((p) =>
            p.id === id
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          ),
        })),

        deleteLimitProfile: (id) => set((state) => {
          // Don't allow deleting presets
          const profile = state.limitProfiles.find((p) => p.id === id)
          if (profile?.isPreset) return state

          return {
            limitProfiles: state.limitProfiles.filter((p) => p.id !== id),
            activeLimitProfileIds: state.activeLimitProfileIds.filter((pid) => pid !== id),
          }
        }),

        duplicateLimitProfile: (id, newName) => {
          const newId = `custom-${Date.now()}`
          const now = new Date().toISOString()
          set((state) => {
            const source = state.limitProfiles.find((p) => p.id === id)
            if (!source) return state

            const newColor = getNextProfileColor(state.limitProfiles)
            return {
              limitProfiles: [
                ...state.limitProfiles,
                {
                  ...source,
                  id: newId,
                  name: newName,
                  color: newColor,
                  isPreset: false,
                  createdAt: now,
                  updatedAt: now,
                },
              ],
            }
          })
          return newId
        },

        toggleLimitProfile: (id) => set((state) => {
          const isActive = state.activeLimitProfileIds.includes(id)
          return {
            activeLimitProfileIds: isActive
              ? state.activeLimitProfileIds.filter((pid) => pid !== id)
              : [...state.activeLimitProfileIds, id],
          }
        }),

        setActiveLimitProfiles: (ids) => set({ activeLimitProfileIds: ids }),

        // Calibration Actions
        setCalibrationLevel: (level) => set({ calibrationLevel: level }),
        setPressureUnit: (unit) => set({ pressureUnit: unit }),
        setDeviceCalibration: (cal) => set({ deviceCalibration: cal }),

        reanalyzeFiles: () => set((state) => {
          if (state.files.length === 0) return state

          const reanalyzedFiles = state.files.map(file => ({
            ...file,
            analysisResult: analyzeSpectrum(file.rawData, {
              calibrationLevel: state.calibrationLevel,
              deviceCalibration: state.deviceCalibration || undefined
            })
          }))

          return { files: reanalyzedFiles }
        }),

        // UI Actions
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

        toggleFileVisibility: (fileId) => set((state) => {
          const isVisible = state.chartOptions.visibleFiles.includes(fileId)
          return {
            chartOptions: {
              ...state.chartOptions,
              visibleFiles: isVisible
                ? state.chartOptions.visibleFiles.filter(id => id !== fileId)
                : [...state.chartOptions.visibleFiles, fileId],
            },
          }
        }),

        setSidebarActivePanel: (panel) => set({ sidebarActivePanel: panel }),

        setShowKnowledgePage: (show) => set({ showKnowledgePage: show }),

        setSkipLandingPage: (skip) => set({ skipLandingPage: skip }),

        reset: () => set({
          files: [],
          comparisonResult: null,
          aiInterpretation: null,
          isAnalyzing: false,
          error: null,
          chartOptions: {
            ...get().chartOptions,
            visibleFiles: [],
          },
        }),
      }),
      {
        name: 'rga-analyser-storage',
        partialize: (state) => ({
          theme: state.theme,
          language: state.language,
          chartOptions: {
            logScale: state.chartOptions.logScale,
            showGSILimit: state.chartOptions.showGSILimit,
            showCERNLimit: state.chartOptions.showCERNLimit,
            normalizationMass: state.chartOptions.normalizationMass,
            yAxisMode: state.chartOptions.yAxisMode,
            // Don't persist visibleFiles - will be set when files are loaded
          },
          // Persist custom limit profiles (filter out presets to avoid duplication on reload)
          limitProfiles: state.limitProfiles.filter(p => !p.isPreset),
          activeLimitProfileIds: state.activeLimitProfileIds,
          // Persist calibration settings
          calibrationLevel: state.calibrationLevel,
          pressureUnit: state.pressureUnit,
          deviceCalibration: state.deviceCalibration,
        }),
        merge: (persistedState, currentState) => {
          const persisted = persistedState as Partial<AppState>
          // Merge presets with persisted custom profiles
          const customProfiles = persisted.limitProfiles || []
          return {
            ...currentState,
            ...persisted,
            limitProfiles: [...DEFAULT_PRESETS, ...customProfiles],
          }
        },
      }
    ),
    { name: 'RGA Analyser' }
  )
)
