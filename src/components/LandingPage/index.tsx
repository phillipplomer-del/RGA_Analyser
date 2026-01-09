import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/useAppStore'
import { LanguageToggle } from '@/components/LanguageToggle'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { SimpleLoginModal } from '@/components/Auth/SimpleLoginModal'
import { UserBadge } from '@/components/Auth/UserBadge'
import { Footer } from '@/components/ui/Footer'
import { isDevMode } from '@/lib/featureFlags'

// --- Types ---
interface Peak {
  mass: number
  h: number
  w: number
  name: string
}

interface ColorScheme {
  bg: string
  cardBg: string
  primary: string
  secondary: string
  success: string
  textMain: string
  textSub: string
  grid: string
  gradientStart: string
  gradientMid: string
  gradientEnd: string
  glow: string
}

// --- Configuration Constants ---
const RESOLUTION = 1000
const MAX_MASS = 100
const SCAN_SPEED = 0.001
const PADDING = { top: 100, right: 0, bottom: 120, left: 60 }

// Dark Mode - Warm Tones (Gold, Lime, Green)
const COLORS_DARK: ColorScheme = {
  bg: '#1A1A12',
  cardBg: '#252518',
  primary: '#E0BD00',
  secondary: '#9EE000',
  success: '#45F600',
  textMain: '#F8F8F0',
  textSub: '#C8C8A0',
  grid: 'rgba(248, 248, 240, 0.08)',
  gradientStart: 'rgba(224, 189, 0, 0.3)',
  gradientMid: 'rgba(158, 224, 0, 0.1)',
  gradientEnd: 'rgba(158, 224, 0, 0.0)',
  glow: 'rgba(158, 224, 0, 0.4)',
}

// Light Mode - Cool Tones (Mint, Cyan, Teal, Blue)
const COLORS_LIGHT: ColorScheme = {
  bg: '#F6F7FB',
  cardBg: '#FFFFFF',
  primary: '#0097E0',
  secondary: '#00DEE0',
  success: '#00E097',
  textMain: '#1F2430',
  textSub: '#6B7280',
  grid: 'rgba(31, 36, 48, 0.08)',
  gradientStart: 'rgba(0, 151, 224, 0.25)',
  gradientMid: 'rgba(0, 222, 224, 0.1)',
  gradientEnd: 'rgba(0, 224, 151, 0.0)',
  glow: 'rgba(0, 222, 224, 0.4)',
}

const PEAKS: Peak[] = [
  { mass: 2, h: 0.95, w: 1.5, name: 'H2' },
  { mass: 4, h: 0.02, w: 0.6, name: 'He' },
  { mass: 12, h: 0.05, w: 0.8, name: 'C' },
  { mass: 14, h: 0.06, w: 0.8, name: 'N' },
  { mass: 16, h: 0.08, w: 1.0, name: 'O/CH4' },
  { mass: 17, h: 0.12, w: 1.0, name: 'OH' },
  { mass: 18, h: 0.35, w: 1.6, name: 'H2O' },
  { mass: 28, h: 0.60, w: 1.6, name: 'CO/N2' },
  { mass: 32, h: 0.03, w: 0.8, name: 'O2' },
  { mass: 40, h: 0.02, w: 0.8, name: 'Ar' },
  { mass: 44, h: 0.25, w: 1.2, name: 'CO2' },
]

export function LandingPage() {
  const { t } = useTranslation()
  const { theme, setSkipLandingPage, currentUser, showLoginModal, setShowLoginModal } = useAppStore()
  const isDark = theme === 'dark'
  const devMode = isDevMode()

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef<number | undefined>(undefined)
  const dataPoints = useRef<Float32Array>(new Float32Array(RESOLUTION))
  const targetPoints = useRef<Float32Array>(new Float32Array(RESOLUTION))
  const timeRef = useRef<number>(0)
  const scanProgressRef = useRef<number>(0)

  const [isRunning, setIsRunning] = useState(true)

  // Helper Math
  const gaussian = (x: number, center: number, height: number, width: number) => {
    return height * Math.exp(-0.5 * Math.pow((x - center) / width, 2))
  }

  // Drawing Logic
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const colors = isDark ? COLORS_DARK : COLORS_LIGHT
    const width = canvas.width / (window.devicePixelRatio || 1)
    const height = canvas.height / (window.devicePixelRatio || 1)

    timeRef.current += 0.05
    scanProgressRef.current += SCAN_SPEED
    if (scanProgressRef.current >= 1.0) scanProgressRef.current = 0

    // Noise Floor
    for (let i = 0; i < RESOLUTION; i++) {
      const noise = Math.sin(i * 0.15 + timeRef.current) * 0.003 + Math.cos(i * 0.8 - timeRef.current) * 0.003
      targetPoints.current[i] = 0.015 + Math.abs(noise)
    }

    // Peaks
    PEAKS.forEach(peak => {
      const centerIdx = (peak.mass / MAX_MASS) * RESOLUTION
      const peakWidth = (peak.w / MAX_MASS) * RESOLUTION * 0.4
      const breath = 1.0 + Math.sin(timeRef.current * 3 + peak.mass) * 0.03

      const start = Math.floor(Math.max(0, centerIdx - peakWidth * 4))
      const end = Math.floor(Math.min(RESOLUTION, centerIdx + peakWidth * 4))

      for (let i = start; i < end; i++) {
        targetPoints.current[i] += gaussian(i, centerIdx, peak.h * breath, peakWidth)
      }
    })

    // Interpolation
    for (let i = 0; i < RESOLUTION; i++) {
      dataPoints.current[i] += (targetPoints.current[i] - dataPoints.current[i]) * 0.15
    }

    // Background
    ctx.fillStyle = colors.bg
    ctx.fillRect(0, 0, width, height)

    const graphWidth = width - PADDING.left
    const graphHeight = height - PADDING.bottom - PADDING.top
    const yBase = height - PADDING.bottom
    const yScale = graphHeight * 0.95

    // Grid & Axes
    ctx.strokeStyle = colors.grid
    ctx.lineWidth = 1
    ctx.fillStyle = colors.textSub
    ctx.font = '11px "Inter", sans-serif'
    ctx.textAlign = 'center'

    const xSteps = 10
    ctx.beginPath()
    for (let i = 0; i <= xSteps; i++) {
      const x = PADDING.left + (i / xSteps) * graphWidth
      ctx.moveTo(x, PADDING.top)
      ctx.lineTo(x, height - PADDING.bottom + 5)
      const massVal = Math.round((i / xSteps) * MAX_MASS)
      ctx.fillText(massVal.toString(), x, height - PADDING.bottom + 20)
    }

    ctx.font = '700 12px "Poppins", sans-serif'
    ctx.fillStyle = colors.primary
    ctx.fillText("MASS [AMU]", PADDING.left + graphWidth / 2, height - PADDING.bottom + 45)

    ctx.textAlign = 'right'
    ctx.font = '11px "Inter", sans-serif'
    ctx.fillStyle = colors.textSub
    const ySteps = 5
    for (let i = 0; i <= ySteps; i++) {
      const y = yBase - (i / ySteps) * yScale
      ctx.moveTo(PADDING.left - 5, y)
      ctx.lineTo(width, y)
      const label = i === 0 ? "0" : `10⁻${10 - i}`
      ctx.fillText(label, PADDING.left - 10, y + 4)
    }
    ctx.stroke()

    ctx.save()
    ctx.translate(20, (height - PADDING.bottom + PADDING.top) / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.fillStyle = colors.primary
    ctx.font = '700 12px "Poppins", sans-serif'
    ctx.fillText("PARTIAL PRESSURE [mbar]", 0, 0)
    ctx.restore()

    // Data Curve
    ctx.beginPath()
    ctx.moveTo(PADDING.left, yBase - (dataPoints.current[0] * yScale))

    for (let i = 0; i < RESOLUTION; i++) {
      const x = PADDING.left + (i / RESOLUTION) * graphWidth
      const y = yBase - (dataPoints.current[i] * yScale)
      ctx.lineTo(x, y)
    }

    ctx.lineTo(width, yBase)
    ctx.lineTo(PADDING.left, yBase)
    ctx.closePath()

    const gradient = ctx.createLinearGradient(0, yBase - yScale, 0, yBase)
    gradient.addColorStop(0, colors.gradientStart)
    gradient.addColorStop(0.6, colors.gradientMid)
    gradient.addColorStop(1, colors.gradientEnd)
    ctx.fillStyle = gradient
    ctx.fill()

    ctx.lineWidth = 2
    ctx.strokeStyle = colors.primary
    ctx.stroke()

    ctx.save()
    ctx.shadowColor = colors.glow
    ctx.shadowBlur = 15
    ctx.stroke()
    ctx.restore()

    // Scanner
    const currentIdx = Math.floor(scanProgressRef.current * RESOLUTION)
    const safeIdx = Math.min(Math.max(currentIdx, 0), RESOLUTION - 1)
    const scanX = PADDING.left + (safeIdx / RESOLUTION) * graphWidth
    const scanY = yBase - (dataPoints.current[safeIdx] * yScale)

    ctx.beginPath()
    ctx.moveTo(scanX, PADDING.top)
    ctx.lineTo(scanX, height - PADDING.bottom)
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.stroke()
    ctx.setLineDash([])

    ctx.beginPath()
    ctx.arc(scanX, scanY, 5, 0, Math.PI * 2)
    ctx.fillStyle = isDark ? '#FFFFFF' : colors.primary
    ctx.fill()

    ctx.save()
    ctx.shadowColor = isDark ? '#FFFFFF' : colors.primary
    ctx.shadowBlur = 15
    ctx.fill()
    ctx.restore()

    const currentMass = (scanProgressRef.current * MAX_MASS).toFixed(1)
    const val = dataPoints.current[safeIdx]
    const exponent = -10 + (val * 5)

    ctx.font = '11px "SF Mono", monospace'
    ctx.fillStyle = colors.textMain
    ctx.textAlign = 'left'

    if (scanX > width - 110) {
      ctx.textAlign = 'right'
      ctx.fillText(`M:${currentMass}`, scanX - 12, scanY - 20)
      ctx.fillStyle = colors.primary
      ctx.fillText(`${(10 ** exponent).toExponential(1)}`, scanX - 12, scanY - 6)
    } else {
      ctx.fillText(`M:${currentMass}`, scanX + 12, scanY - 20)
      ctx.fillStyle = colors.primary
      ctx.fillText(`${(10 ** exponent).toExponential(1)}`, scanX + 12, scanY - 6)
    }

    if (isRunning) {
      requestRef.current = requestAnimationFrame(draw)
    }
  }, [isRunning, isDark])

  // Resize Handler
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const { clientWidth, clientHeight } = containerRef.current
        const dpr = window.devicePixelRatio || 1
        canvasRef.current.width = clientWidth * dpr
        canvasRef.current.height = clientHeight * dpr
        const ctx = canvasRef.current.getContext('2d')
        if (ctx) ctx.scale(dpr, dpr)
      }
    }
    handleResize()
    const resizeObserver = new ResizeObserver(handleResize)
    if (containerRef.current) resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // Animation Loop
  useEffect(() => {
    if (isRunning) requestRef.current = requestAnimationFrame(draw)
    else if (requestRef.current) cancelAnimationFrame(requestRef.current)
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current) }
  }, [isRunning, draw])

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden font-body transition-colors duration-300
        ${isDark ? 'bg-[#1A1A12]' : 'bg-[#F6F7FB]'}`}
    >
      {/* Background Radial Gradient */}
      <div className={`absolute inset-0 pointer-events-none z-0 opacity-60 transition-colors duration-300
        ${isDark
          ? 'bg-[radial-gradient(circle_at_50%_0%,#252518_0%,#1A1A12_70%)]'
          : 'bg-[radial-gradient(circle_at_50%_0%,#FFFFFF_0%,#F6F7FB_70%)]'}`}
      />

      {/* Vignette */}
      <div className={`absolute inset-0 z-20 pointer-events-none bg-[length:100%_4px] transition-shadow duration-300
        ${isDark
          ? 'bg-[linear-gradient(rgba(26,26,18,0)_50%,rgba(0,0,0,0.1)_50%)] shadow-[inset_0_0_120px_rgba(0,0,0,0.6)]'
          : 'bg-[linear-gradient(rgba(246,247,251,0)_50%,rgba(0,0,0,0.02)_50%)] shadow-[inset_0_0_120px_rgba(0,0,0,0.08)]'}`}
      />

      {/* HUD Container */}
      <div className="absolute z-30 inset-0 p-6 md:p-8 flex flex-col justify-between pointer-events-none select-none">
        {/* Top HUD */}
        <div className="flex justify-between items-start">
          {/* Brand */}
          <div className="flex flex-col">
            <span className={`font-display text-2xl tracking-wide font-bold transition-colors duration-300
              ${isDark
                ? 'text-[#E0BD00] drop-shadow-[0_0_15px_rgba(224,189,0,0.2)]'
                : 'text-[#0097E0] drop-shadow-[0_0_15px_rgba(0,151,224,0.2)]'}`}>
              Spectrum
            </span>
            <span className={`font-body text-[11px] tracking-wide mt-0.5 transition-colors duration-300
              ${isDark ? 'text-[#C8C8A0]' : 'text-[#6B7280]'}`}>
              {t('app.subtitle')}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {devMode && (
              <div className="pointer-events-auto">
                {currentUser ? (
                  <UserBadge />
                ) : (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className={`px-4 py-2 text-caption font-medium rounded-chip transition-colors
                      ${isDark
                        ? 'text-[#9EE000] bg-[#9EE000]/10 hover:bg-[#9EE000]/20'
                        : 'text-aqua-600 bg-aqua-500/10 hover:bg-aqua-500/20'
                      }`}
                  >
                    {t('auth.title')}
                  </button>
                )}
              </div>
            )}
            <div className="pointer-events-auto">
              <LanguageToggle />
            </div>
            <div className="pointer-events-auto">
              <ThemeToggle />
            </div>
            {/* Pause/Resume Button */}
            <button
              onClick={() => setIsRunning(prev => !prev)}
              className={`pointer-events-auto px-4 py-2 rounded-chip text-caption font-medium transition-colors
                ${isRunning
                  ? isDark
                    ? 'text-[#9EE000] bg-[#9EE000]/10 hover:bg-[#9EE000]/20'
                    : 'text-aqua-600 bg-aqua-500/10 hover:bg-aqua-500/20'
                  : isDark
                    ? 'text-[#F8F8F0] bg-[#252518] border border-[rgba(248,248,240,0.1)]'
                    : 'text-[#1F2430] bg-white border border-[rgba(31,36,48,0.1)]'
                }`}
            >
              {isRunning ? 'PAUSE' : 'RESUME'}
            </button>
            <div className={`backdrop-blur-md border rounded-[14px] px-4 py-2 flex gap-4 items-center transition-colors duration-300
              ${isDark
                ? 'bg-[#252518]/80 border-[rgba(248,248,240,0.1)] shadow-[0_12px_30px_rgba(0,0,0,0.4)]'
                : 'bg-white/80 border-[rgba(31,36,48,0.1)] shadow-[0_12px_30px_rgba(35,40,70,0.12)]'}`}>
              <div className="flex flex-col items-end">
                <span className={`font-body text-[9px] uppercase tracking-wider transition-colors duration-300
                  ${isDark ? 'text-[#C8C8A0]' : 'text-[#6B7280]'}`}>Demo</span>
                <span className={`font-mono text-sm font-medium leading-none transition-colors duration-300
                  ${isDark ? 'text-[#F8F8F0]' : 'text-[#1F2430]'}`}>
                  UHV Spectrum
                </span>
              </div>
              <div className={`w-2 h-2 rounded-full animate-pulse transition-colors duration-300
                ${isDark
                  ? 'bg-[#45F600] shadow-[0_0_10px_#45F600]'
                  : 'bg-[#00E097] shadow-[0_0_10px_#00E097]'}`}
              />
            </div>
          </div>
        </div>

        {/* Launch App Button - Top Right */}
        <div className="flex-1 flex items-start justify-end pt-4">
          <button
            onClick={() => setSkipLandingPage(true)}
            className={`pointer-events-auto relative group overflow-hidden rounded-full px-8 py-4
              transition-all duration-300 ease-smooth
              ${isDark
                ? 'shadow-[0_10px_25px_rgba(158,224,0,0.3)] hover:translate-y-[-2px] hover:scale-[1.02]'
                : 'shadow-[0_10px_25px_rgba(0,222,224,0.3)] hover:translate-y-[-2px] hover:scale-[1.02]'
              }`}
          >
            <div className={`absolute inset-0 transition-colors duration-300
              ${isDark
                ? 'bg-gradient-to-r from-[#E0BD00] via-[#9EE000] to-[#45F600]'
                : 'bg-gradient-to-r from-[#00E097] via-[#00DEE0] to-[#0097E0]'}`}
            />
            <span className={`relative z-10 font-display text-lg font-bold tracking-wide transition-colors duration-300
              ${isDark ? 'text-[#1A1A12]' : 'text-white'}`}>
              {t('landing.launchApp', 'LAUNCH APP')}
            </span>
          </button>
        </div>

        {/* Bottom HUD */}
        <div className="flex justify-between items-end">
          <div className="hidden md:flex gap-6">
            <div className={`flex items-center gap-2 text-[10px] font-body tracking-wide transition-colors duration-300
              ${isDark ? 'text-[#C8C8A0]' : 'text-[#6B7280]'}`}>
              <div className={`w-3 h-0.5 ${isDark ? 'bg-[#E0BD00]' : 'bg-[#0097E0]'}`} /> Ion Current
            </div>
            <div className={`flex items-center gap-2 text-[10px] font-body tracking-wide transition-colors duration-300
              ${isDark ? 'text-[#C8C8A0]' : 'text-[#6B7280]'}`}>
              <div className={`w-3 h-0.5 ${isDark ? 'bg-[#F8F8F0]/20' : 'bg-[#1F2430]/20'}`} /> Noise Floor
            </div>
          </div>

        </div>
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10 block" />

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <Footer className="bg-transparent border-t-0" />
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <SimpleLoginModal
          onClose={() => setShowLoginModal(false)}
          isOptional={true}
        />
      )}
    </div>
  )
}
