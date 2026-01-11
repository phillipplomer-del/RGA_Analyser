/**
 * LOD (Limit of Detection) Info Card - PRAKTIKER-FREUNDLICH
 *
 * Feature 1.9.2: Zeigt Nachweisgrenze mit einfachen Erklärungen
 */

import { useTranslation } from 'react-i18next'
import type { LODResult } from '@/lib/diagnosis'
import { Card } from '@/components/ui/Card'

interface LODInfoCardProps {
  lodResult: LODResult
  compact?: boolean
}

export function LODInfoCard({ lodResult, compact = false }: LODInfoCardProps) {
  const { i18n } = useTranslation()
  const isGerman = i18n.language === 'de'

  const getExplanation = () => {
    if (isGerman) {
      return `Diese Messung hat eine Nachweisgrenze von ${lodResult.lod.toExponential(2)} (normalisiert zu H₂). Das bedeutet: Peaks über diesem Wert sind echte Signale (nicht nur Rauschen). Zum Vergleich: Wenn H₂ = 1.0 ist, dann ist alles über ${lodResult.lod.toExponential(2)} ein echtes Signal.`
    } else {
      return `This measurement has a detection limit of ${lodResult.lod.toExponential(2)} (normalized to H₂). This means: Peaks above this value are real signals (not just noise). For reference: If H₂ = 1.0, then everything above ${lodResult.lod.toExponential(2)} is a real signal.`
    }
  }

  if (compact) {
    return (
      <div
        className="flex items-center justify-between px-4 py-3 bg-mint-500/5 rounded-lg border border-mint-500/20 cursor-help"
        title={getExplanation()}
      >
        <div className="flex items-center gap-2">
          <span className="text-base" title={isGerman ? 'Info anzeigen' : 'Show info'}>ℹ️</span>
          <div className="flex flex-col">
            <span className="text-micro text-text-muted uppercase tracking-wide">
              {isGerman ? 'Nachweisgrenze' : 'Detection Limit'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-caption font-semibold text-text-primary font-mono">
                {lodResult.lod.toExponential(1)}
              </span>
              <span className="text-micro text-text-muted">
                {isGerman ? '(zu H₂)' : '(to H₂)'}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-micro text-text-muted">
            {isGerman ? 'Alles darüber' : 'Everything above'}
          </div>
          <div className="text-caption font-medium text-mint-600">
            {isGerman ? 'ist echt ✓' : 'is real ✓'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-mint-500/20 bg-mint-500/5">
      <div className="p-4">
        {/* Header mit Erklärung */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🎯</span>
            <h3 className="text-body font-semibold text-text-primary">
              {isGerman ? 'Nachweisgrenze' : 'Detection Limit'}
            </h3>
          </div>
          <p className="text-caption text-text-secondary leading-relaxed">
            {isGerman
              ? 'Die App hat berechnet, ab welchem Wert ein Peak in diesem Spektrum "echt" ist (kein Rauschen):'
              : 'The app calculated at which value a peak in this spectrum is "real" (not noise):'}
          </p>
        </div>

        {/* Hauptwert - GROSS und deutlich */}
        <div className="bg-surface-card rounded-xl p-4 mb-4 border-2 border-mint-500/30">
          <div className="text-center">
            <div className="text-caption text-text-muted mb-2">
              {isGerman ? 'Alles über diesem Wert ist ein echtes Signal:' : 'Everything above this value is a real signal:'}
            </div>
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <div className="font-mono text-2xl font-bold text-mint-600">
                {lodResult.lod.toExponential(2)}
              </div>
              <div className="text-sm text-text-muted">
                {isGerman ? '(normalisiert zu H₂)' : '(normalized to H₂)'}
              </div>
            </div>
            <div className="text-micro text-text-muted mb-2">
              {isGerman
                ? `= ${(lodResult.lod * 100).toFixed(2)}% vom Wasserstoff-Peak`
                : `= ${(lodResult.lod * 100).toFixed(2)}% of hydrogen peak`}
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-mint-500/10 rounded-full">
              <span className="text-mint-600 font-medium">✓</span>
              <span className="text-caption font-medium text-mint-700">
                {isGerman ? '99.7% Sicherheit' : '99.7% Certainty'}
              </span>
            </div>
          </div>
        </div>

        {/* Praktische Erklärung */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-3">
          <div className="flex gap-2">
            <span className="text-lg flex-shrink-0">💡</span>
            <div className="text-caption text-text-primary">
              <strong>{isGerman ? 'Was bedeutet das?' : 'What does this mean?'}</strong>
              <p className="mt-1 text-text-secondary">
                {isGerman
                  ? 'Bei jedem RGA-Gerät gibt es ein "Grundrauschen". Peaks darunter könnten nur zufällige Schwankungen sein. Diese Grenze zeigt Ihnen: Ab hier ist es sicher ein echtes Signal, kein Rauschen.'
                  : 'Every RGA device has "background noise". Peaks below that might just be random fluctuations. This limit shows you: From here on, it\'s definitely a real signal, not noise.'}
              </p>
            </div>
          </div>
        </div>

        {/* Wie wurde das berechnet? */}
        <details className="group">
          <summary className="cursor-pointer text-caption text-text-muted hover:text-text-primary flex items-center gap-2 select-none">
            <span className="group-open:rotate-90 transition-transform">▶</span>
            {isGerman ? 'Wie wurde das berechnet?' : 'How was this calculated?'}
          </summary>
          <div className="mt-2 p-3 bg-surface-card rounded-lg text-caption text-text-secondary space-y-2">
            <p>
              {isGerman
                ? 'Die App schaut auf "leere" Massen in Ihrem Spektrum (z.B. m/z 21), wo normalerweise nichts sein sollte. Das typische Signal dort ist das Rauschen Ihres Geräts.'
                : 'The app looks at "empty" masses in your spectrum (e.g., m/z 21) where normally nothing should be. The typical signal there is your device\'s noise.'}
            </p>
            <div className="grid grid-cols-2 gap-2 text-micro">
              <div className="bg-surface-hover p-2 rounded">
                <div className="text-text-muted">{isGerman ? 'Durchschnittliches Rauschen:' : 'Average noise:'}</div>
                <div className="font-mono font-medium text-text-primary">{lodResult.mu.toExponential(1)}</div>
              </div>
              <div className="bg-surface-hover p-2 rounded">
                <div className="text-text-muted">{isGerman ? 'Schwankungsbreite:' : 'Fluctuation range:'}</div>
                <div className="font-mono font-medium text-text-primary">{lodResult.sigma.toExponential(1)}</div>
              </div>
            </div>
            <p className="text-micro italic">
              {isGerman
                ? '→ Grenze = Rauschen + 3× Schwankung (wissenschaftlicher Standard)'
                : '→ Limit = Noise + 3× Fluctuation (scientific standard)'}
            </p>
          </div>
        </details>

        {/* Warnung bei niedriger Konfidenz */}
        {lodResult.confidence === 'low' && (
          <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <div className="text-caption text-text-primary">
                <strong>{isGerman ? 'Hinweis:' : 'Note:'}</strong>
                <p className="mt-1 text-text-secondary">
                  {isGerman
                    ? 'In diesem Spektrum waren keine Standard-Referenzmassen leer. Die Grenze wurde daher aus den schwächsten 10% aller Peaks geschätzt. Das ist weniger präzise, aber trotzdem brauchbar.'
                    : 'No standard reference masses were empty in this spectrum. The limit was therefore estimated from the weakest 10% of all peaks. This is less precise but still usable.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
