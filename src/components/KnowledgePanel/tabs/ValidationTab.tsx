/**
 * ValidationTab - Scientific Validation & Cross-Validation Status
 *
 * Displays:
 * - Summary statistics (cross-validated detectors, unanimous, fixes, high confidence)
 * - All 22 detectors with validation badges dynamically from DETECTOR_REGISTRY
 * - Cross-validation status (Gemini + Grok)
 * - Physics documentation links
 * - Fix status and notes
 */

import { cn } from '@/lib/utils/cn'
import { DETECTOR_REGISTRY } from '../lib/detectorRegistry'
import { getPhysicsDocLink } from '../lib/physicsDocsMapper'
import { KNOWLEDGE_PANEL_STYLES as KPS } from '../lib/designTokens'
import { ValidationBadge } from '@/components/ValidationBadge'

interface ValidationTabProps {
  isGerman: boolean
}

export function ValidationTab({ isGerman }: ValidationTabProps) {
  // Calculate statistics dynamically
  const highConfidenceCount = DETECTOR_REGISTRY.filter(
    (d) => d.validation?.confidence === 'high'
  ).length

  const crossValidatedCount = DETECTOR_REGISTRY.filter(
    (d) => d.validation?.crossValidation
  ).length

  const unanimousCount = DETECTOR_REGISTRY.filter(
    (d) => d.validation?.crossValidation?.unanimous
  ).length

  const fixesAppliedCount = DETECTOR_REGISTRY.filter(
    (d) => d.validation?.fixes?.applied
  ).length

  return (
    <div className={KPS.spacing.sectionGap}>
      {/* Header */}
      <div>
        <h3 className={cn(KPS.typography.pageTitle, 'mb-2')}>
          {isGerman
            ? 'Wissenschaftliche Validierung & Cross-Validation'
            : 'Scientific Validation & Cross-Validation'}
        </h3>
        <p className={KPS.typography.body}>
          {isGerman
            ? 'Alle 22 Diagnose-Detektoren wurden systematisch gegen NIST WebBook, CERN, Hersteller-Dokumentation und Peer-reviewed Literatur validiert. 8 von 22 Detektoren wurden zusätzlich durch Multi-AI Cross-Validation (Gemini + Grok) überprüft.'
            : 'All 22 diagnostic detectors have been systematically validated against NIST WebBook, CERN, manufacturer documentation and peer-reviewed literature. 8 of 22 detectors underwent additional Multi-AI Cross-Validation (Gemini + Grok) review.'}
        </p>
      </div>

      {/* Summary Statistics */}
      <div className={KPS.layout.gridWide}>
        <div className={cn(KPS.cards.base, 'p-3 text-center', KPS.colors.validated)}>
          <div className="text-2xl font-bold">{crossValidatedCount}/22</div>
          <div className={cn(KPS.typography.caption, 'mt-1')}>
            {isGerman ? 'Cross-Validated' : 'Cross-Validated'}
          </div>
        </div>
        <div className={cn(KPS.cards.base, 'p-3 text-center', KPS.colors.infoBadge)}>
          <div className="text-2xl font-bold">{unanimousCount}</div>
          <div className={cn(KPS.typography.caption, 'mt-1')}>
            {isGerman ? 'Unanimous' : 'Unanimous'}
          </div>
        </div>
        <div className={cn(KPS.cards.base, 'p-3 text-center', KPS.colors.validated)}>
          <div className="text-2xl font-bold">{fixesAppliedCount}</div>
          <div className={cn(KPS.typography.caption, 'mt-1')}>
            {isGerman ? 'Fixes Applied' : 'Fixes Applied'}
          </div>
        </div>
        <div className={cn(KPS.cards.base, 'p-3 text-center', KPS.colors.conditional)}>
          <div className="text-2xl font-bold">{highConfidenceCount}</div>
          <div className={cn(KPS.typography.caption, 'mt-1')}>
            {isGerman ? 'High Confidence' : 'High Confidence'}
          </div>
        </div>
      </div>

      {/* Detectors List - DYNAMIC from DETECTOR_REGISTRY */}
      <section>
        <h4 className={KPS.typography.sectionTitle}>
          {isGerman
            ? `Diagnose-Detektoren (${DETECTOR_REGISTRY.length} insgesamt)`
            : `Diagnostic Detectors (${DETECTOR_REGISTRY.length} total)`}
        </h4>
        <div className={KPS.spacing.itemGapSmall}>
          {DETECTOR_REGISTRY.map((detector) => {
            const validation = detector.validation
            if (!validation) return null

            const physicsLink = getPhysicsDocLink(detector.type)

            return (
              <div key={detector.type} className={KPS.cards.basePadded}>
                <div className={cn(KPS.layout.flexBetween, 'items-start gap-3')}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(KPS.typography.cardTitle, 'flex items-center gap-2')}>
                        <span>{detector.uiMetadata.icon}</span>
                        <span>{isGerman ? detector.name : detector.nameEn}</span>
                      </span>
                    </div>
                    <div className={cn(KPS.typography.micro, KPS.typography.captionMuted, 'mb-2')}>
                      {detector.category} / {detector.type}
                    </div>

                    {/* Cross-Validation Status */}
                    {validation.crossValidation && (
                      <div className={cn(KPS.layout.flex, 'items-center gap-2 mt-2 mb-2')}>
                        {validation.crossValidation.unanimous ? (
                          <span className={cn(KPS.badges.base, KPS.colors.validated, 'inline-flex items-center gap-1')}>
                            ✅ {isGerman ? 'Unanimous' : 'Unanimous'}
                          </span>
                        ) : (
                          <span className={cn(KPS.badges.base, KPS.colors.conditional, 'inline-flex items-center gap-1')}>
                            ⚠️ {isGerman ? 'Conditional' : 'Conditional'}
                          </span>
                        )}
                        <span className={KPS.typography.micro}>
                          Gemini {validation.crossValidation.gemini ? '✅' : '❌'} | Grok{' '}
                          {validation.crossValidation.grok ? '✅' : '❌'}
                          {validation.crossValidation.grokScore && ` (${validation.crossValidation.grokScore}%)`}
                        </span>
                      </div>
                    )}

                    {/* Physics Doc Link */}
                    {physicsLink && (
                      <div className="mt-2 mb-2">
                        <a
                          href={physicsLink.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(KPS.typography.link, 'inline-flex items-center gap-1')}
                        >
                          {physicsLink.display}
                        </a>
                      </div>
                    )}

                    {/* Fix Status */}
                    {validation.fixes && validation.fixes.count > 0 && (
                      <div className="mt-2 mb-2">
                        {validation.fixes.applied ? (
                          <span className={cn(KPS.badges.base, KPS.colors.validated, 'inline-flex items-center gap-1')}>
                            ✅ {validation.fixes.count}{' '}
                            {validation.fixes.count === 1 ? 'fix' : 'fixes'}{' '}
                            {isGerman ? 'implementiert' : 'applied'}
                            {validation.fixes.severity === 'critical' && ' (CRITICAL)'}
                            {validation.fixes.severity === 'high' && ' (HIGH)'}
                          </span>
                        ) : (
                          <span className={cn(KPS.badges.base, KPS.colors.conditional, 'inline-flex items-center gap-1')}>
                            ⚠️ {validation.fixes.count}{' '}
                            {validation.fixes.count === 1 ? 'fix' : 'fixes'}{' '}
                            {isGerman ? 'benötigt' : 'needed'}
                            {validation.fixes.severity === 'critical' && ' (CRITICAL)'}
                            {validation.fixes.severity === 'high' && ' (HIGH)'}
                          </span>
                        )}
                      </div>
                    )}

                    {validation.notes && (
                      <div className={cn(KPS.typography.caption, 'italic mt-2')}>
                        {validation.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <ValidationBadge validation={validation} compact />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Documentation Link */}
      <div className={cn(KPS.cards.base, KPS.colors.infoBox, 'p-4')}>
        <div className={cn(KPS.layout.flex, 'items-start gap-3')}>
          <span className="text-2xl">📚</span>
          <div className="flex-1">
            <h5 className={cn(KPS.typography.cardTitle, 'mb-1')}>
              {isGerman ? 'Vollständige Dokumentation' : 'Complete Documentation'}
            </h5>
            <p className={cn(KPS.typography.caption, 'mb-2')}>
              {isGerman
                ? 'Detaillierte wissenschaftliche Validierung aller Detektoren mit 100+ Quellen in DOCUMENTATION/SCIENTIFIC/'
                : 'Detailed scientific validation of all detectors with 100+ sources in DOCUMENTATION/SCIENTIFIC/'}
            </p>
            <div className="space-y-1">
              <div className={KPS.typography.caption}>
                <span className={KPS.typography.mono}>REFERENCES.md</span>
                <span className={KPS.typography.captionMuted}> - </span>
                <span>{isGerman ? '103+ Quellen, alle 22 Detektoren' : '103+ sources, all 22 detectors'}</span>
              </div>
              <div className={KPS.typography.caption}>
                <span className={KPS.typography.mono}>DETECTORS.md</span>
                <span className={KPS.typography.captionMuted}> - </span>
                <span>{isGerman ? 'Validierungstabelle' : 'Validation table'}</span>
              </div>
              <div className={KPS.typography.caption}>
                <span className={KPS.typography.mono}>PHYSICS/</span>
                <span className={KPS.typography.captionMuted}> - </span>
                <span>{isGerman ? 'Kategorie-organisierte Physik-Dokumentation' : 'Category-organized physics documentation'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
