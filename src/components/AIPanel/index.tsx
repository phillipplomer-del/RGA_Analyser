import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/store/useAppStore'
import type { AnalysisResult } from '@/types/rga'
import {
  callGemini,
  getGeminiApiKey,
  isGeminiAvailable,
  formatAnalysisForAI,
  buildAnalysisPrompt
} from '@/lib/ai'

interface AIPanelProps {
  analysis: AnalysisResult
}

export function AIPanel({ analysis }: AIPanelProps) {
  const { t, i18n } = useTranslation()
  const { aiInterpretation: interpretation, setAiInterpretation: setInterpretation } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState(getGeminiApiKey() || '')
  const [showApiKeyInput, setShowApiKeyInput] = useState(!isGeminiAvailable())
  const [showManualMode, setShowManualMode] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [manualResponse, setManualResponse] = useState('')

  // Generate prompt for display
  const generatedPrompt = useMemo(() => {
    const language = i18n.language === 'de' ? 'de' : 'en'
    const formattedData = formatAnalysisForAI(analysis)
    return buildAnalysisPrompt(formattedData, language)
  }, [analysis, i18n.language])

  const handleAnalyze = useCallback(async () => {
    const key = apiKey || getGeminiApiKey()
    if (!key) {
      setError(t('ai.noApiKey'))
      setShowApiKeyInput(true)
      return
    }

    setIsLoading(true)
    setError(null)
    setInterpretation(null)

    try {
      const formattedData = formatAnalysisForAI(analysis)
      const language = i18n.language === 'de' ? 'de' : 'en'
      const prompt = buildAnalysisPrompt(formattedData, language)

      const response = await callGemini(prompt, key)
      setInterpretation(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [analysis, apiKey, i18n.language, t])

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      setShowApiKeyInput(false)
      handleAnalyze()
    }
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt)
  }

  const handleManualSubmit = () => {
    if (manualResponse.trim()) {
      setInterpretation(manualResponse.trim())
      setShowManualMode(false)
      setShowPrompt(false)
      setManualResponse('')
    }
  }

  const handleClearInterpretation = () => {
    setInterpretation(null)
    setManualResponse('')
  }

  return (
    <Card>
      <CardHeader
        title={t('ai.title')}
        action={
          !interpretation && !isLoading && !showManualMode && (
            <div className="flex gap-2">
              <Button
                onClick={() => setShowManualMode(true)}
                variant="secondary"
                size="sm"
              >
                {t('ai.manual')}
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={isLoading}
                size="sm"
              >
                {t('ai.analyze')}
              </Button>
            </div>
          )
        }
      />

      <div className="space-y-4">
        {/* Manual Mode */}
        {showManualMode && !interpretation && (
          <div className="space-y-4">
            {/* Step 1: Show Prompt */}
            <div className="p-4 bg-surface-card-muted rounded-chip">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-body font-semibold text-text-primary">
                  {t('ai.step1')}
                </h4>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPrompt(!showPrompt)}
                  >
                    {showPrompt ? t('ai.hidePrompt') : t('ai.showPrompt')}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopyPrompt}
                  >
                    {t('ai.copyPrompt')}
                  </Button>
                </div>
              </div>
              {showPrompt && (
                <pre className="mt-3 p-4 bg-surface-card rounded-input text-micro text-text-secondary
                  overflow-x-auto max-h-80 overflow-y-auto whitespace-pre-wrap font-mono border border-subtle">
                  {generatedPrompt}
                </pre>
              )}
              <p className="text-caption text-text-muted mt-2">
                {t('ai.promptHint')}
              </p>
            </div>

            {/* Step 2: Paste Response */}
            <div className="p-4 bg-surface-card-muted rounded-chip">
              <h4 className="text-body font-semibold text-text-primary mb-3">
                {t('ai.step2')}
              </h4>
              <textarea
                value={manualResponse}
                onChange={(e) => setManualResponse(e.target.value)}
                placeholder={t('ai.responsePlaceholder')}
                className="w-full h-48 px-4 py-3 rounded-input bg-surface-card border border-subtle
                  text-body text-text-primary placeholder:text-text-muted resize-y
                  focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
              />
              <div className="flex justify-end gap-2 mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowManualMode(false)
                    setShowPrompt(false)
                    setManualResponse('')
                  }}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  size="sm"
                  onClick={handleManualSubmit}
                  disabled={!manualResponse.trim()}
                >
                  {t('ai.submitResponse')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* API Key Input */}
        {showApiKeyInput && !showManualMode && (
          <div className="p-4 bg-surface-card-muted rounded-chip">
            <label className="block text-caption text-text-secondary mb-2">
              Gemini API Key
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIza..."
                className="flex-1 px-4 py-2 rounded-input bg-surface-card border border-subtle
                  text-body text-text-primary placeholder:text-text-muted
                  focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
              />
              <Button onClick={handleApiKeySubmit} size="sm">
                OK
              </Button>
            </div>
            <p className="text-micro text-text-muted mt-2">
              Get your API key from{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-cyan hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-accent-teal border-t-transparent rounded-full animate-spin" />
              <p className="text-body text-text-secondary">{t('common.loading')}</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-state-danger/10 border border-state-danger/20 rounded-chip">
            <p className="text-body text-state-danger">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setError(null)
                setShowApiKeyInput(true)
              }}
              className="mt-2"
            >
              {t('common.close')}
            </Button>
          </div>
        )}

        {/* Interpretation Result */}
        {interpretation && (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <div className="text-body text-text-primary whitespace-pre-wrap leading-relaxed">
                {interpretation.split('\n').map((line, i) => {
                  // Format headers
                  if (line.startsWith('## ')) {
                    return (
                      <h3 key={i} className="text-h3 font-display font-semibold text-text-primary mt-4 mb-2">
                        {line.replace('## ', '')}
                      </h3>
                    )
                  }
                  if (line.startsWith('### ')) {
                    return (
                      <h4 key={i} className="text-body font-semibold text-text-primary mt-3 mb-1">
                        {line.replace('### ', '')}
                      </h4>
                    )
                  }
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                      <p key={i} className="font-semibold text-text-primary mt-3 mb-1">
                        {line.replace(/\*\*/g, '')}
                      </p>
                    )
                  }
                  if (line.startsWith('- ')) {
                    return (
                      <li key={i} className="ml-4 text-text-secondary">
                        {line.replace('- ', '')}
                      </li>
                    )
                  }
                  if (line.trim() === '') {
                    return <br key={i} />
                  }
                  return (
                    <p key={i} className="text-text-secondary mb-2">
                      {line}
                    </p>
                  )
                })}
              </div>
            </div>

            {/* Re-analyze Buttons */}
            <div className="flex justify-between pt-4 border-t border-subtle">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearInterpretation}
              >
                {t('ai.clear')}
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    handleClearInterpretation()
                    setShowManualMode(true)
                  }}
                >
                  {t('ai.manual')}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAnalyze}
                  disabled={isLoading}
                >
                  {t('ai.analyze')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!interpretation && !isLoading && !error && !showApiKeyInput && !showManualMode && (
          <div className="text-center py-8">
            <p className="text-body text-text-muted">
              {t('ai.interpretation')}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
