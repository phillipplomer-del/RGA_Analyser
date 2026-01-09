/**
 * ValidationBadge Component
 *
 * Displays scientific validation status for diagnosis detectors
 */

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ValidationMetadata } from '../../lib/diagnosis/types'

interface ValidationBadgeProps {
  validation: ValidationMetadata
  compact?: boolean
}

export const ValidationBadge: React.FC<ValidationBadgeProps> = ({
  validation,
  compact = false
}) => {
  const { i18n } = useTranslation()
  const isGerman = i18n.language === 'de'
  const [showDetails, setShowDetails] = useState(false)

  const getConfidenceColor = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low':
        return 'bg-orange-100 text-orange-800 border-orange-300'
    }
  }

  const getConfidenceLabel = (confidence: 'high' | 'medium' | 'low') => {
    const labels = {
      high: { de: 'Hoch', en: 'High' },
      medium: { de: 'Mittel', en: 'Medium' },
      low: { de: 'Niedrig', en: 'Low' }
    }
    return isGerman ? labels[confidence].de : labels[confidence].en
  }

  const getStatusIcon = (validated: boolean) => {
    return validated ? '✓' : '⚠️'
  }

  if (!validation.validated) {
    return (
      <span
        className="inline-flex items-center px-2 py-1 text-xs rounded border border-gray-300 bg-gray-100 text-gray-600"
        title={isGerman ? 'Nicht validiert' : 'Not validated'}
      >
        ⚠️ {isGerman ? 'Ausstehend' : 'Pending'}
      </span>
    )
  }

  if (compact) {
    return (
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`inline-flex items-center px-2 py-1 text-xs rounded border ${getConfidenceColor(
          validation.confidence
        )} hover:opacity-80 transition-opacity cursor-pointer`}
        title={isGerman ? 'Für Details klicken' : 'Click for details'}
      >
        {getStatusIcon(validation.validated)} {getConfidenceLabel(validation.confidence)}
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded border ${getConfidenceColor(
          validation.confidence
        )} hover:opacity-80 transition-opacity cursor-pointer`}
      >
        <span className="font-medium">
          {getStatusIcon(validation.validated)}{' '}
          {isGerman ? 'Wissenschaftlich validiert' : 'Scientifically validated'}
        </span>
        <span className="text-xs opacity-75">({getConfidenceLabel(validation.confidence)})</span>
        <span className="text-xs">{showDetails ? '▼' : '▶'}</span>
      </button>

      {showDetails && (
        <div className="absolute z-10 mt-2 w-96 p-4 bg-white rounded-lg shadow-xl border border-gray-200">
          <div className="space-y-3">
            {/* Confidence Level */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">
                {isGerman ? 'Konfidenz' : 'Confidence'}
              </h4>
              <div className={`inline-block px-2 py-1 text-xs rounded ${getConfidenceColor(validation.confidence)}`}>
                {getConfidenceLabel(validation.confidence)}
              </div>
            </div>

            {/* Last Validated Date */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">
                {isGerman ? 'Zuletzt validiert' : 'Last validated'}
              </h4>
              <p className="text-sm text-gray-600">{validation.lastValidated}</p>
            </div>

            {/* Sources */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">
                {isGerman ? 'Quellen' : 'Sources'} ({validation.sources.length})
              </h4>
              <ul className="text-xs text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                {validation.sources.map((source, index) => (
                  <li key={index}>
                    <a
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {source.length > 60 ? source.substring(0, 60) + '...' : source}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Notes */}
            {validation.notes && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">
                  {isGerman ? 'Hinweise' : 'Notes'}
                </h4>
                <p className="text-xs text-gray-600 italic">{validation.notes}</p>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={() => setShowDetails(false)}
              className="w-full mt-2 px-3 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              {isGerman ? 'Schließen' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ValidationBadge
