/**
 * RateOfRiseTab - Rate-of-Rise Test Documentation
 *
 * Displays:
 * - Fundamentals of rate-of-rise testing
 * - Physics, formulas, and classification
 * - Procedure and interpretation guidelines
 * - Limits and troubleshooting
 */

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { KNOWLEDGE_PANEL_STYLES as KPS } from '../lib/designTokens'

interface RateOfRiseTabProps {
  isGerman: boolean
}

export function RateOfRiseTab({ isGerman }: RateOfRiseTabProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('basics')

  const sections = [
    { key: 'basics', title: 'Grundlagen', titleEn: 'Fundamentals', icon: '📖' },
    { key: 'physics', title: 'Physik & Formeln', titleEn: 'Physics & Formulas', icon: '📐' },
    { key: 'classification', title: 'Klassifikation', titleEn: 'Classification', icon: '🏷️' },
    { key: 'procedure', title: 'Durchführung', titleEn: 'Procedure', icon: '📋' },
    { key: 'interpretation', title: 'Interpretation', titleEn: 'Interpretation', icon: '🔍' },
    { key: 'limits', title: 'Grenzwerte', titleEn: 'Limits', icon: '⚖️' },
    { key: 'comparison', title: 'Methodenvergleich', titleEn: 'Method Comparison', icon: '📊' },
    { key: 'troubleshooting', title: 'Fehlerbehebung', titleEn: 'Troubleshooting', icon: '🔧' },
  ]

  return (
    <div className={KPS.spacing.sectionGap}>
      {/* Introduction */}
      <div className={cn(KPS.cards.gradient, KPS.colors.intro)}>
        <h3 className={cn(KPS.typography.cardTitle, 'text-aqua-600 dark:text-aqua-400 mb-2')}>
          {isGerman ? 'Rate-of-Rise (Druckanstiegstest)' : 'Rate-of-Rise Test'}
        </h3>
        <p className={cn(KPS.typography.caption, 'leading-relaxed')}>
          {isGerman
            ? 'Der Druckanstiegstest (Rate-of-Rise, RoR) ist eine fundamentale Methode zur Leckratenbestimmung in abgeschlossenen Vakuumsystemen. Durch Messung des Druckanstiegs über Zeit nach Absperren der Pumpen kann die Leckrate quantitativ bestimmt und die Ursache (echtes Leck, virtuelles Leck, Ausgasung) klassifiziert werden.'
            : 'The Rate-of-Rise (RoR) test is a fundamental method for leak rate determination in closed vacuum systems. By measuring the pressure rise over time after isolating the pumps, the leak rate can be quantitatively determined and the cause (real leak, virtual leak, outgassing) classified.'}
        </p>
      </div>

      {/* Accordion Sections */}
      {sections.map(section => (
        <div key={section.key} className={cn(KPS.cards.base, 'overflow-hidden')}>
          <button
            onClick={() => setExpandedSection(expandedSection === section.key ? null : section.key)}
            className={cn(
              KPS.cards.interactiveFull,
              KPS.layout.flex,
              'items-center gap-3 p-3'
            )}
          >
            <span className="text-xl">{section.icon}</span>
            <span className={cn('flex-1 text-left', KPS.typography.cardTitle)}>
              {isGerman ? section.title : section.titleEn}
            </span>
            <span className={cn(
              KPS.interactions.expandIcon,
              expandedSection === section.key && KPS.interactions.expandIconRotated
            )}>▼</span>
          </button>

          {expandedSection === section.key && (
            <div className={cn(KPS.borders.subtleDivider, 'px-4 pb-4 pt-3')}>
              {section.key === 'basics' && <RoRBasics isGerman={isGerman} />}
              {section.key === 'physics' && <RoRPhysics isGerman={isGerman} />}
              {section.key === 'classification' && <RoRClassification isGerman={isGerman} />}
              {section.key === 'procedure' && <RoRProcedure isGerman={isGerman} />}
              {section.key === 'interpretation' && <RoRInterpretation isGerman={isGerman} />}
              {section.key === 'limits' && <RoRLimits isGerman={isGerman} />}
              {section.key === 'comparison' && <RoRComparison isGerman={isGerman} />}
              {section.key === 'troubleshooting' && <RoRTroubleshooting isGerman={isGerman} />}
            </div>
          )}
        </div>
      ))}

      {/* Quick Info Box */}
      <div className={cn(KPS.cards.mutedPadded, KPS.colors.infoBox)}>
        <p className={KPS.typography.caption}>
          {isGerman
            ? '💡 Die Rate-of-Rise Analyse dieser App unterstützt Pfeiffer TPG362 Drucklogger-Daten und führt automatische Phasenerkennung, lineare Regression und Klassifikation durch.'
            : '💡 This app\'s Rate-of-Rise analysis supports Pfeiffer TPG362 pressure logger data and performs automatic phase detection, linear regression, and classification.'}
        </p>
      </div>
    </div>
  )
}

// --- Rate of Rise Sub-Components ---

function RoRBasics({ isGerman }: { isGerman: boolean }) {
  return (
    <div className={KPS.spacing.sectionGap}>
      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? 'Was ist der Druckanstiegstest?' : 'What is the Rate-of-Rise Test?'}
        </h5>
        <p className={KPS.typography.caption}>
          {isGerman
            ? 'Der Druckanstiegstest misst, wie schnell der Druck in einem evakuierten, abgeschlossenen System ansteigt. Nach Erreichen eines stabilen Basisdrucks werden die Pumpen abgesperrt (Ventil geschlossen) und der Druckverlauf über Zeit aufgezeichnet.'
            : 'The rate-of-rise test measures how quickly the pressure rises in an evacuated, closed system. After reaching a stable base pressure, the pumps are isolated (valve closed) and the pressure progression over time is recorded.'}
        </p>
      </div>

      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? 'Anwendungsgebiete' : 'Applications'}
        </h5>
        <ul className={cn(KPS.typography.caption, KPS.spacing.itemGapSmall, 'list-disc list-inside')}>
          <li>{isGerman ? 'Abnahmetests von Vakuumkammern' : 'Acceptance tests for vacuum chambers'}</li>
          <li>{isGerman ? 'Lecksuche und -lokalisation' : 'Leak detection and localization'}</li>
          <li>{isGerman ? 'Qualitätskontrolle nach Wartung' : 'Quality control after maintenance'}</li>
          <li>{isGerman ? 'Bestimmung der Ausgasungsrate' : 'Outgassing rate determination'}</li>
          <li>{isGerman ? 'Unterscheidung Leck vs. Ausgasung' : 'Differentiation leak vs. outgassing'}</li>
        </ul>
      </div>

      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? 'Vorteile' : 'Advantages'}
        </h5>
        <div className={KPS.layout.gridWide}>
          <div className={cn(KPS.cards.mutedPadded, KPS.colors.success)}>
            <span className={cn(KPS.typography.caption, 'font-medium')}>
              {isGerman ? 'Quantitative Leckrate' : 'Quantitative leak rate'}
            </span>
          </div>
          <div className={cn(KPS.cards.mutedPadded, KPS.colors.success)}>
            <span className={cn(KPS.typography.caption, 'font-medium')}>
              {isGerman ? 'Einfache Durchführung' : 'Simple execution'}
            </span>
          </div>
          <div className={cn(KPS.cards.mutedPadded, KPS.colors.success)}>
            <span className={cn(KPS.typography.caption, 'font-medium')}>
              {isGerman ? 'Kein Tracergas nötig' : 'No tracer gas needed'}
            </span>
          </div>
          <div className={cn(KPS.cards.mutedPadded, KPS.colors.success)}>
            <span className={cn(KPS.typography.caption, 'font-medium')}>
              {isGerman ? 'Gesamtleckrate' : 'Total leak rate'}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? 'Limitierungen' : 'Limitations'}
        </h5>
        <div className={KPS.layout.gridWide}>
          <div className={cn(KPS.cards.mutedPadded, KPS.colors.warning)}>
            <span className={cn(KPS.typography.caption, 'font-medium')}>
              {isGerman ? 'Keine Lokalisation' : 'No localization'}
            </span>
          </div>
          <div className={cn(KPS.cards.mutedPadded, KPS.colors.warning)}>
            <span className={cn(KPS.typography.caption, 'font-medium')}>
              {isGerman ? 'Zeitaufwendig' : 'Time-consuming'}
            </span>
          </div>
          <div className={cn(KPS.cards.mutedPadded, KPS.colors.warning)}>
            <span className={cn(KPS.typography.caption, 'font-medium')}>
              {isGerman ? 'Volumen muss bekannt sein' : 'Volume must be known'}
            </span>
          </div>
          <div className={cn(KPS.cards.mutedPadded, KPS.colors.warning)}>
            <span className={cn(KPS.typography.caption, 'font-medium')}>
              {isGerman ? 'Überlagert mit Ausgasung' : 'Overlaid with outgassing'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function RoRPhysics({ isGerman }: { isGerman: boolean }) {
  return (
    <div className={KPS.spacing.sectionGap}>
      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? 'Grundgleichung' : 'Fundamental Equation'}
        </h5>
        <div className={cn(KPS.cards.muted, 'rounded-lg p-3')}>
          <div className={cn(KPS.typography.mono, 'text-center py-2 text-lg')}>
            Q = V × (dp/dt)
          </div>
          <div className={cn(KPS.typography.captionMuted, 'mt-2', KPS.spacing.itemGapSmall)}>
            <div>• <span className={KPS.typography.mono}>Q</span> = {isGerman ? 'Leckrate' : 'Leak rate'} [mbar·L/s]</div>
            <div>• <span className={KPS.typography.mono}>V</span> = {isGerman ? 'Kammervolumen' : 'Chamber volume'} [L]</div>
            <div>• <span className={KPS.typography.mono}>dp/dt</span> = {isGerman ? 'Druckanstiegsrate' : 'Pressure rise rate'} [mbar/s]</div>
          </div>
        </div>
      </div>

      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? 'Druckanstiegsrate berechnen' : 'Calculating Pressure Rise Rate'}
        </h5>
        <p className={cn(KPS.typography.caption, 'mb-2')}>
          {isGerman
            ? 'Die Druckanstiegsrate dp/dt wird durch lineare Regression der Druckdaten im Anstiegsbereich ermittelt:'
            : 'The pressure rise rate dp/dt is determined by linear regression of pressure data in the rise phase:'}
        </p>
        <div className={cn(KPS.cards.muted, 'rounded-lg p-3')}>
          <div className={cn(KPS.typography.mono, 'text-center py-2')}>
            p(t) = p₀ + (dp/dt) × t
          </div>
          <div className={cn(KPS.typography.captionMuted, 'mt-2')}>
            <div>• <span className={KPS.typography.mono}>p₀</span> = {isGerman ? 'Basisdruck beim Start' : 'Base pressure at start'}</div>
            <div>• <span className={KPS.typography.mono}>R²</span> = {isGerman ? 'Bestimmtheitsmaß (sollte > 0.95 sein)' : 'Coefficient of determination (should be > 0.95)'}</div>
          </div>
        </div>
      </div>

      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? 'Einheitenumrechnung' : 'Unit Conversion'}
        </h5>
        <div className="overflow-x-auto">
          <table className={KPS.tables.table}>
            <thead>
              <tr className={KPS.tables.headerRow}>
                <th className={KPS.tables.headerCell}>{isGerman ? 'Einheit' : 'Unit'}</th>
                <th className={KPS.tables.headerCell}>{isGerman ? 'Faktor zu mbar·L/s' : 'Factor to mbar·L/s'}</th>
              </tr>
            </thead>
            <tbody>
              <tr className={KPS.tables.row}>
                <td className={cn(KPS.tables.cell, KPS.typography.mono)}>mbar·L/s</td>
                <td className={cn(KPS.tables.cell, KPS.typography.mono)}>1</td>
              </tr>
              <tr className={KPS.tables.row}>
                <td className={cn(KPS.tables.cell, KPS.typography.mono)}>Pa·m³/s</td>
                <td className={cn(KPS.tables.cell, KPS.typography.mono)}>× 10</td>
              </tr>
              <tr className={KPS.tables.row}>
                <td className={cn(KPS.tables.cell, KPS.typography.mono)}>Torr·L/s</td>
                <td className={cn(KPS.tables.cell, KPS.typography.mono)}>× 1.333</td>
              </tr>
              <tr className={KPS.tables.row}>
                <td className={cn(KPS.tables.cell, KPS.typography.mono)}>atm·cm³/s (scc/s)</td>
                <td className={cn(KPS.tables.cell, KPS.typography.mono)}>× 1.013</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? 'Helium-Äquivalent' : 'Helium Equivalent'}
        </h5>
        <p className={cn(KPS.typography.caption, 'mb-2')}>
          {isGerman
            ? 'Für Vergleich mit He-Lecksuchern wird die Leckrate umgerechnet:'
            : 'For comparison with He leak detectors, the leak rate is converted:'}
        </p>
        <div className={cn(KPS.cards.muted, 'rounded-lg p-3')}>
          <div className={cn(KPS.typography.mono, 'text-center py-2')}>
            Q<sub>He</sub> = Q<sub>Luft</sub> × √(M<sub>Luft</sub>/M<sub>He</sub>) ≈ Q<sub>Luft</sub> × 2.7
          </div>
          <p className={cn(KPS.typography.captionMuted, 'mt-2')}>
            {isGerman
              ? 'Helium diffundiert ~2.7× schneller als Luft durch gleich große Öffnungen.'
              : 'Helium diffuses ~2.7× faster than air through equal-sized openings.'}
          </p>
        </div>
      </div>
    </div>
  )
}

function RoRClassification({ isGerman }: { isGerman: boolean }) {
  const types = [
    {
      type: 'real_leak',
      name: 'Echtes Leck',
      nameEn: 'Real Leak',
      icon: '🔴',
      color: 'state-danger',
      description: 'Durchgehende Verbindung zwischen Kammer und Atmosphäre (Riss, offene Verbindung, defekte Dichtung).',
      descriptionEn: 'Direct connection between chamber and atmosphere (crack, open connection, defective seal).',
      characteristics: [
        'Linearer Druckanstieg (konstant dp/dt)',
        'Hoher R²-Wert (>0.98)',
        'Reagiert auf He-Besprühung',
        'Druckanstieg proportional zum Atmosphärendruck',
      ],
      characteristicsEn: [
        'Linear pressure rise (constant dp/dt)',
        'High R² value (>0.98)',
        'Responds to He spraying',
        'Pressure rise proportional to atmospheric pressure',
      ],
    },
    {
      type: 'virtual_leak',
      name: 'Virtuelles Leck',
      nameEn: 'Virtual Leak',
      icon: '🟡',
      color: 'state-warning',
      description: 'Eingeschlossenes Gas in Hohlräumen, Gewindegängen, Spalten oder porösem Material.',
      descriptionEn: 'Trapped gas in cavities, threads, gaps, or porous material.',
      characteristics: [
        'Anfangs schneller, dann abflachender Anstieg',
        'Niedriger R²-Wert (<0.9)',
        'Keine Reaktion auf He-Besprühung',
        'Oft durch Bakeout reduzierbar',
      ],
      characteristicsEn: [
        'Initially fast, then flattening rise',
        'Low R² value (<0.9)',
        'No response to He spraying',
        'Often reducible by baking',
      ],
    },
    {
      type: 'outgassing',
      name: 'Ausgasung',
      nameEn: 'Outgassing',
      icon: '🟢',
      color: 'aqua-500',
      description: 'Desorption von adsorbierten Gasen (hauptsächlich H₂O, dann H₂) von Oberflächen.',
      descriptionEn: 'Desorption of adsorbed gases (mainly H₂O, then H₂) from surfaces.',
      characteristics: [
        'Exponentiell abklingender Anstieg',
        'Niedriger R²-Wert',
        'Stark temperaturabhängig',
        'Reduziert sich durch Bakeout massiv',
      ],
      characteristicsEn: [
        'Exponentially decaying rise',
        'Low R² value',
        'Strongly temperature-dependent',
        'Massively reduced by baking',
      ],
    },
    {
      type: 'mixed',
      name: 'Misch-Signal',
      nameEn: 'Mixed Signal',
      icon: '⚪',
      color: 'text-muted',
      description: 'Kombination aus mehreren Quellen, typisch in realen Systemen.',
      descriptionEn: 'Combination of multiple sources, typical in real systems.',
      characteristics: [
        'Mittlerer R²-Wert (0.9-0.95)',
        'Analyse nach Bakeout wiederholen',
        'RGA zur Differenzierung nutzen',
        'Mehrere Messungen vergleichen',
      ],
      characteristicsEn: [
        'Medium R² value (0.9-0.95)',
        'Repeat analysis after baking',
        'Use RGA for differentiation',
        'Compare multiple measurements',
      ],
    },
  ]

  return (
    <div className={KPS.spacing.sectionGap}>
      <p className={KPS.typography.caption}>
        {isGerman
          ? 'Die Klassifikation basiert auf der Form der Druckkurve und dem Fit-Bestimmtheitsmaß R². Verschiedene Ursachen erzeugen charakteristisch unterschiedliche Kurvenverläufe.'
          : 'Classification is based on the shape of the pressure curve and the fit coefficient of determination R². Different causes produce characteristically different curve progressions.'}
      </p>

      <div className={KPS.spacing.itemGap}>
        {types.map(t => (
          <div key={t.type} className={cn(KPS.cards.muted, 'rounded-lg p-3')}>
            <div className={cn(KPS.layout.flex, 'mb-2')}>
              <span className="text-xl">{t.icon}</span>
              <span className={cn('font-medium', `text-${t.color}`)}>
                {isGerman ? t.name : t.nameEn}
              </span>
            </div>
            <p className={cn(KPS.typography.caption, 'mb-2')}>
              {isGerman ? t.description : t.descriptionEn}
            </p>
            <div>
              <span className={cn(KPS.typography.micro, 'block mb-1')}>
                {isGerman ? 'Charakteristika:' : 'Characteristics:'}
              </span>
              <ul className={cn(KPS.typography.captionMuted, 'list-disc list-inside space-y-0.5')}>
                {(isGerman ? t.characteristics : t.characteristicsEn).map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RoRProcedure({ isGerman }: { isGerman: boolean }) {
  const steps = [
    {
      step: 1,
      title: 'Vorbereitung',
      titleEn: 'Preparation',
      tasks: [
        'System auf Basisdruck evakuieren',
        'Drucklogger anschließen (z.B. TPG362)',
        'Kammervolumen dokumentieren',
        'Temperatur stabilisieren',
      ],
      tasksEn: [
        'Evacuate system to base pressure',
        'Connect pressure logger (e.g., TPG362)',
        'Document chamber volume',
        'Stabilize temperature',
      ],
    },
    {
      step: 2,
      title: 'Baseline-Messung',
      titleEn: 'Baseline Measurement',
      tasks: [
        'Mindestens 10-15 Minuten stabilen Druck aufzeichnen',
        'Druckschwankungen sollten <5% sein',
        'Bei zu hohen Schwankungen: System noch nicht stabil',
      ],
      tasksEn: [
        'Record stable pressure for at least 10-15 minutes',
        'Pressure fluctuations should be <5%',
        'If fluctuations too high: system not yet stable',
      ],
    },
    {
      step: 3,
      title: 'Ventil schließen',
      titleEn: 'Close Valve',
      tasks: [
        'Ventil zwischen Kammer und Pumpe schließen',
        'Zeitpunkt exakt dokumentieren',
        'Ventil muss vollständig dicht sein!',
      ],
      tasksEn: [
        'Close valve between chamber and pump',
        'Document exact time',
        'Valve must be completely sealed!',
      ],
    },
    {
      step: 4,
      title: 'Druckanstieg aufzeichnen',
      titleEn: 'Record Pressure Rise',
      tasks: [
        'Typische Messzeit: 30 min - 3 h',
        'Kürzere Zeit bei großen Lecks',
        'Längere Zeit bei kleinen Lecks/Ausgasung',
        'Messintervall: 1-10 Sekunden empfohlen',
      ],
      tasksEn: [
        'Typical measurement time: 30 min - 3 h',
        'Shorter time for large leaks',
        'Longer time for small leaks/outgassing',
        'Measurement interval: 1-10 seconds recommended',
      ],
    },
    {
      step: 5,
      title: 'Analyse',
      titleEn: 'Analysis',
      tasks: [
        'Baseline- und Anstiegsphase identifizieren',
        'Lineare Regression im Anstiegsbereich',
        'R²-Wert zur Klassifikation nutzen',
        'Leckrate Q = V × dp/dt berechnen',
      ],
      tasksEn: [
        'Identify baseline and rise phases',
        'Linear regression in rise region',
        'Use R² value for classification',
        'Calculate leak rate Q = V × dp/dt',
      ],
    },
  ]

  return (
    <div className={KPS.spacing.sectionGap}>
      <p className={KPS.typography.caption}>
        {isGerman
          ? 'Die korrekte Durchführung ist entscheidend für aussagekräftige Ergebnisse. Folgen Sie diesen Schritten systematisch.'
          : 'Correct execution is crucial for meaningful results. Follow these steps systematically.'}
      </p>

      <div className={KPS.spacing.itemGap}>
        {steps.map(s => (
          <div key={s.step} className={cn(KPS.cards.muted, 'rounded-lg p-3')}>
            <div className={cn(KPS.layout.flex, 'mb-2')}>
              <span className="w-6 h-6 rounded-full bg-aqua-500 text-white text-caption font-bold flex items-center justify-center">
                {s.step}
              </span>
              <span className={KPS.typography.cardTitle}>
                {isGerman ? s.title : s.titleEn}
              </span>
            </div>
            <ul className={cn(KPS.typography.captionMuted, 'list-disc list-inside space-y-0.5 ml-8')}>
              {(isGerman ? s.tasks : s.tasksEn).map((task, i) => (
                <li key={i}>{task}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

function RoRInterpretation({ isGerman }: { isGerman: boolean }) {
  return (
    <div className={KPS.spacing.sectionGap}>
      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? 'R²-Wert interpretieren' : 'Interpreting R² Value'}
        </h5>
        <div className={KPS.spacing.itemGapSmall}>
          <div className={cn(KPS.layout.flex, 'p-2 bg-state-success/10 rounded-lg')}>
            <span className={cn(KPS.typography.mono, 'text-state-success font-bold')}>R² {'>'} 0.98</span>
            <span className={KPS.typography.caption}>
              → {isGerman ? 'Echtes Leck sehr wahrscheinlich' : 'Real leak very likely'}
            </span>
          </div>
          <div className={cn(KPS.layout.flex, 'p-2 bg-state-warning/10 rounded-lg')}>
            <span className={cn(KPS.typography.mono, 'text-state-warning font-bold')}>0.90 {'<'} R² {'<'} 0.98</span>
            <span className={KPS.typography.caption}>
              → {isGerman ? 'Misch-Signal (Leck + Ausgasung)' : 'Mixed signal (leak + outgassing)'}
            </span>
          </div>
          <div className={cn(KPS.layout.flex, 'p-2 bg-aqua-500/10 rounded-lg')}>
            <span className={cn(KPS.typography.mono, 'text-aqua-500 font-bold')}>R² {'<'} 0.90</span>
            <span className={KPS.typography.caption}>
              → {isGerman ? 'Ausgasung oder virtuelles Leck' : 'Outgassing or virtual leak'}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? 'Typische Leckraten' : 'Typical Leak Rates'}
        </h5>
        <div className="overflow-x-auto">
          <table className={KPS.tables.table}>
            <thead>
              <tr className={KPS.tables.headerRow}>
                <th className={KPS.tables.headerCell}>{isGerman ? 'Bereich' : 'Range'}</th>
                <th className={KPS.tables.headerCell}>{isGerman ? 'Bewertung' : 'Assessment'}</th>
              </tr>
            </thead>
            <tbody>
              <tr className={KPS.tables.row}>
                <td className={cn(KPS.tables.cell, KPS.typography.mono, 'text-state-danger')}>{'>'} 10⁻⁵ mbar·L/s</td>
                <td className={KPS.tables.cell}>{isGerman ? 'Grobes Leck, sofort beheben' : 'Gross leak, fix immediately'}</td>
              </tr>
              <tr className={KPS.tables.row}>
                <td className={cn(KPS.tables.cell, KPS.typography.mono, 'text-state-warning')}>10⁻⁷ - 10⁻⁵ mbar·L/s</td>
                <td className={KPS.tables.cell}>{isGerman ? 'Mittleres Leck, lokalisieren' : 'Medium leak, localize'}</td>
              </tr>
              <tr className={KPS.tables.row}>
                <td className={cn(KPS.tables.cell, KPS.typography.mono, 'text-aqua-500')}>10⁻⁹ - 10⁻⁷ mbar·L/s</td>
                <td className={KPS.tables.cell}>{isGerman ? 'Kleines Leck oder Ausgasung' : 'Small leak or outgassing'}</td>
              </tr>
              <tr className={KPS.tables.row}>
                <td className={cn(KPS.tables.cell, KPS.typography.mono, 'text-state-success')}>{'<'} 10⁻⁹ mbar·L/s</td>
                <td className={KPS.tables.cell}>{isGerman ? 'UHV-tauglich' : 'UHV-compatible'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? 'Weitere Analyse nach RoR' : 'Further Analysis After RoR'}
        </h5>
        <ul className={cn(KPS.typography.caption, KPS.spacing.itemGapSmall, 'list-disc list-inside')}>
          <li>{isGerman ? 'Bei R² > 0.95: He-Lecksuche zur Lokalisation' : 'If R² > 0.95: He leak detection for localization'}</li>
          <li>{isGerman ? 'Bei R² < 0.9: Bakeout, dann erneut messen' : 'If R² < 0.9: Bake out, then measure again'}</li>
          <li>{isGerman ? 'RGA-Analyse für Gasart-Identifikation' : 'RGA analysis for gas type identification'}</li>
          <li>{isGerman ? 'Temperaturvariation zur Differenzierung' : 'Temperature variation for differentiation'}</li>
        </ul>
      </div>
    </div>
  )
}

function RoRLimits({ isGerman }: { isGerman: boolean }) {
  const limits = [
    {
      source: 'CERN LHC',
      application: 'Beschleuniger-Vakuum',
      applicationEn: 'Accelerator vacuum',
      limit: '< 10⁻⁹ mbar·L/s',
      condition: 'nach Bakeout',
      conditionEn: 'after bakeout',
    },
    {
      source: 'ITER',
      application: 'Fusionsreaktor',
      applicationEn: 'Fusion reactor',
      limit: '< 10⁻⁸ mbar·L/s/m²',
      condition: 'oberflächennormiert',
      conditionEn: 'surface-normalized',
    },
    {
      source: 'ISO 3529-1',
      application: 'Industriestandard HV',
      applicationEn: 'Industrial standard HV',
      limit: '< 10⁻⁶ mbar·L/s',
      condition: 'Hochvakuum',
      conditionEn: 'High vacuum',
    },
    {
      source: 'Halbleiter',
      application: 'Prozesskammern',
      applicationEn: 'Process chambers',
      limit: '< 10⁻⁸ mbar·L/s',
      condition: 'vor Prozessstart',
      conditionEn: 'before process start',
    },
    {
      source: 'Luft- & Raumfahrt',
      application: 'Satelliten',
      applicationEn: 'Satellites',
      limit: '< 10⁻⁷ mbar·L/s',
      condition: 'Gesamtsystem',
      conditionEn: 'Total system',
    },
  ]

  return (
    <div className={KPS.spacing.sectionGap}>
      <p className={KPS.typography.caption}>
        {isGerman
          ? 'Typische Grenzwerte für verschiedene Anwendungen. Die Anforderungen hängen stark vom spezifischen Anwendungsfall ab.'
          : 'Typical limits for various applications. Requirements depend strongly on the specific use case.'}
      </p>

      <div className="overflow-x-auto">
        <table className={KPS.tables.table}>
          <thead>
            <tr className={KPS.tables.headerRow}>
              <th className={KPS.tables.headerCell}>{isGerman ? 'Quelle' : 'Source'}</th>
              <th className={KPS.tables.headerCell}>{isGerman ? 'Anwendung' : 'Application'}</th>
              <th className={KPS.tables.headerCell}>{isGerman ? 'Grenzwert' : 'Limit'}</th>
              <th className={KPS.tables.headerCell}>{isGerman ? 'Bedingung' : 'Condition'}</th>
            </tr>
          </thead>
          <tbody>
            {limits.map((l, i) => (
              <tr key={i} className={KPS.tables.row}>
                <td className={cn(KPS.tables.cell, 'font-medium text-aqua-500')}>{l.source}</td>
                <td className={KPS.tables.cell}>{isGerman ? l.application : l.applicationEn}</td>
                <td className={cn(KPS.tables.cell, KPS.typography.mono)}>{l.limit}</td>
                <td className={cn(KPS.tables.cell, KPS.typography.captionMuted)}>{isGerman ? l.condition : l.conditionEn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={cn(KPS.cards.mutedPadded, KPS.colors.warning)}>
        <p className={KPS.typography.caption}>
          {isGerman
            ? '⚠️ Die Grenzwerte beziehen sich oft auf He-Äquivalent. Bei RoR-Messung mit Luft muss umgerechnet werden (Faktor ~2.7).'
            : '⚠️ Limits often refer to He equivalent. When measuring RoR with air, conversion is needed (factor ~2.7).'}
        </p>
      </div>
    </div>
  )
}

function RoRComparison({ isGerman }: { isGerman: boolean }) {
  const methods = [
    {
      method: 'Rate-of-Rise',
      pros: ['Quantitative Gesamtleckrate', 'Einfache Durchführung', 'Kein Tracergas', 'Kostengünstig'],
      prosEn: ['Quantitative total leak rate', 'Simple execution', 'No tracer gas', 'Cost-effective'],
      cons: ['Keine Lokalisation', 'Zeitaufwendig', 'Volumen muss bekannt sein'],
      consEn: ['No localization', 'Time-consuming', 'Volume must be known'],
      sensitivity: '10⁻⁶ - 10⁻⁹',
    },
    {
      method: 'He-Lecksuche',
      pros: ['Lokalisation möglich', 'Hohe Empfindlichkeit', 'Schnelle Ergebnisse', 'Industriestandard'],
      prosEn: ['Localization possible', 'High sensitivity', 'Fast results', 'Industry standard'],
      cons: ['Teures Equipment', 'Helium-Verbrauch', 'Schulung erforderlich'],
      consEn: ['Expensive equipment', 'Helium consumption', 'Training required'],
      sensitivity: '10⁻⁹ - 10⁻¹²',
    },
    {
      method: 'Druckabfall',
      pros: ['Sehr einfach', 'Keine Spezialgeräte', 'Schnelle Grobprüfung'],
      prosEn: ['Very simple', 'No special equipment', 'Quick rough check'],
      cons: ['Nur für große Lecks', 'Temperaturempfindlich', 'Unpräzise'],
      consEn: ['Only for large leaks', 'Temperature-sensitive', 'Imprecise'],
      sensitivity: '> 10⁻⁴',
    },
    {
      method: 'Blasentest',
      pros: ['Direkter visueller Nachweis', 'Sehr kostengünstig', 'Lokalisation möglich'],
      prosEn: ['Direct visual evidence', 'Very cost-effective', 'Localization possible'],
      cons: ['Nur für große Lecks', 'Nicht für Vakuum', 'Subjektiv'],
      consEn: ['Only for large leaks', 'Not for vacuum', 'Subjective'],
      sensitivity: '> 10⁻³',
    },
  ]

  return (
    <div className={KPS.spacing.sectionGap}>
      <p className={KPS.typography.caption}>
        {isGerman
          ? 'Der Druckanstiegstest ist eine von mehreren Methoden zur Leckprüfung. Die Wahl hängt von Anforderungen, Budget und Anwendung ab.'
          : 'The rate-of-rise test is one of several leak testing methods. Choice depends on requirements, budget, and application.'}
      </p>

      <div className={KPS.spacing.itemGap}>
        {methods.map(m => (
          <div key={m.method} className={cn(KPS.cards.muted, 'rounded-lg p-3')}>
            <div className={cn(KPS.layout.flexBetween, 'mb-2')}>
              <span className={KPS.typography.cardTitle}>{m.method}</span>
              <span className={cn(KPS.typography.micro, KPS.typography.mono, 'text-aqua-500')}>{m.sensitivity} mbar·L/s</span>
            </div>
            <div className={KPS.layout.gridWide}>
              <div>
                <span className={cn(KPS.typography.micro, 'text-state-success block mb-1')}>
                  {isGerman ? 'Vorteile' : 'Advantages'}
                </span>
                <ul className={cn(KPS.typography.captionMuted, 'list-disc list-inside')}>
                  {(isGerman ? m.pros : m.prosEn).map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className={cn(KPS.typography.micro, 'text-state-danger block mb-1')}>
                  {isGerman ? 'Nachteile' : 'Disadvantages'}
                </span>
                <ul className={cn(KPS.typography.captionMuted, 'list-disc list-inside')}>
                  {(isGerman ? m.cons : m.consEn).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RoRTroubleshooting({ isGerman }: { isGerman: boolean }) {
  const issues = [
    {
      problem: 'Kein stabiler Basisdruck',
      problemEn: 'No stable base pressure',
      causes: ['Aktives Leck', 'Starke Ausgasung', 'Pumpenproblem'],
      causesEn: ['Active leak', 'Strong outgassing', 'Pump problem'],
      solutions: ['Längere Evakuierungszeit', 'Bakeout durchführen', 'Pumpe prüfen'],
      solutionsEn: ['Longer evacuation time', 'Perform bakeout', 'Check pump'],
    },
    {
      problem: 'R²-Wert schwankt stark',
      problemEn: 'R² value fluctuates strongly',
      causes: ['Zu kurze Messzeit', 'Temperaturänderung', 'Ventil nicht dicht'],
      causesEn: ['Measurement time too short', 'Temperature change', 'Valve not sealed'],
      solutions: ['Messzeit verlängern', 'Temperatur stabilisieren', 'Ventildichtheit prüfen'],
      solutionsEn: ['Extend measurement time', 'Stabilize temperature', 'Check valve seal'],
    },
    {
      problem: 'Druckanstieg zu schnell',
      problemEn: 'Pressure rise too fast',
      causes: ['Grobes Leck', 'Ventil undicht', 'Sensor-Drift'],
      causesEn: ['Gross leak', 'Leaky valve', 'Sensor drift'],
      solutions: ['Schnelle Grobprüfung', 'Ventil austauschen', 'Sensor kalibrieren'],
      solutionsEn: ['Quick rough check', 'Replace valve', 'Calibrate sensor'],
    },
    {
      problem: 'Kein Druckanstieg erkennbar',
      problemEn: 'No pressure rise detectable',
      causes: ['Sensor-Bereich zu klein', 'Messzeit zu kurz', 'System sehr dicht'],
      causesEn: ['Sensor range too small', 'Measurement time too short', 'System very tight'],
      solutions: ['Empfindlicheren Sensor nutzen', 'Länger messen', 'Erfolg dokumentieren!'],
      solutionsEn: ['Use more sensitive sensor', 'Measure longer', 'Document success!'],
    },
  ]

  return (
    <div className={KPS.spacing.sectionGap}>
      <p className={KPS.typography.caption}>
        {isGerman
          ? 'Häufige Probleme bei der Druckanstiegsmessung und deren Lösungen.'
          : 'Common problems with rate-of-rise measurements and their solutions.'}
      </p>

      <div className={KPS.spacing.itemGap}>
        {issues.map((issue, i) => (
          <div key={i} className={cn(KPS.cards.muted, 'rounded-lg p-3')}>
            <h5 className={cn('font-medium text-state-danger mb-2')}>
              {isGerman ? issue.problem : issue.problemEn}
            </h5>
            <div className={KPS.layout.gridWide}>
              <div>
                <span className={cn(KPS.typography.micro, 'block mb-1')}>
                  {isGerman ? 'Mögliche Ursachen:' : 'Possible causes:'}
                </span>
                <ul className={cn(KPS.typography.caption, 'list-disc list-inside')}>
                  {(isGerman ? issue.causes : issue.causesEn).map((c, j) => (
                    <li key={j}>{c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className={cn(KPS.typography.micro, 'block mb-1')}>
                  {isGerman ? 'Lösungen:' : 'Solutions:'}
                </span>
                <ul className={cn(KPS.typography.caption, 'text-state-success list-disc list-inside')}>
                  {(isGerman ? issue.solutions : issue.solutionsEn).map((s, j) => (
                    <li key={j}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={cn(KPS.cards.mutedPadded, KPS.colors.infoBox)}>
        <p className={KPS.typography.caption}>
          {isGerman
            ? '💡 Tipp: Bei wiederholt inkonsistenten Ergebnissen sollte eine RGA-Analyse zur Identifikation der dominanten Gasart durchgeführt werden.'
            : '💡 Tip: For repeatedly inconsistent results, an RGA analysis should be performed to identify the dominant gas species.'}
        </p>
      </div>
    </div>
  )
}
