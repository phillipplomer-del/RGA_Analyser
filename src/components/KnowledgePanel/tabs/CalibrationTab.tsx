/**
 * CalibrationTab - Pressure Calibration Documentation
 *
 * Displays:
 * - Calibration levels (BASIC, STANDARD, ADVANCED, PRECISION)
 * - Formulas and calculations
 * - Manometer and temperature corrections
 * - Cracking pattern deconvolution
 * - RSF tables and device calibration procedures
 */

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { KNOWLEDGE_PANEL_STYLES as KPS } from '../lib/designTokens'

interface CalibrationTabProps {
  isGerman: boolean
}

export function CalibrationTab({ isGerman }: CalibrationTabProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('overview')

  const sections = [
    {
      key: 'overview',
      title: 'Übersicht',
      titleEn: 'Overview',
      icon: '📊',
    },
    {
      key: 'levels',
      title: 'Kalibrierungsstufen',
      titleEn: 'Calibration Levels',
      icon: '🎯',
    },
    {
      key: 'formulas',
      title: 'Formeln & Berechnungen',
      titleEn: 'Formulas & Calculations',
      icon: '📐',
    },
    {
      key: 'manometer',
      title: 'Manometer-Korrektur',
      titleEn: 'Manometer Correction',
      icon: '⚗️',
    },
    {
      key: 'temperature',
      title: 'Temperatur-Korrektur',
      titleEn: 'Temperature Correction',
      icon: '🌡️',
    },
    {
      key: 'deconvolution',
      title: 'Cracking Pattern Dekonvolution',
      titleEn: 'Cracking Pattern Deconvolution',
      icon: '🔬',
    },
    {
      key: 'rsf',
      title: 'Relative Sensitivitätsfaktoren (RSF)',
      titleEn: 'Relative Sensitivity Factors (RSF)',
      icon: '📈',
    },
    {
      key: 'device',
      title: 'Geräte-Kalibrierung',
      titleEn: 'Device Calibration',
      icon: '🔧',
    },
  ]

  return (
    <div className={KPS.spacing.sectionGap}>
      <p className={KPS.typography.captionMuted}>
        {isGerman
          ? 'Dokumentation der Druckkalibrierung: Umrechnung von RGA-Ionenströmen (A) zu Partialdrücken (mbar).'
          : 'Pressure calibration documentation: Conversion from RGA ion currents (A) to partial pressures (mbar).'}
      </p>

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
              {section.key === 'overview' && <CalibrationOverview isGerman={isGerman} />}
              {section.key === 'levels' && <CalibrationLevels isGerman={isGerman} />}
              {section.key === 'formulas' && <CalibrationFormulas isGerman={isGerman} />}
              {section.key === 'manometer' && <ManometerCorrection isGerman={isGerman} />}
              {section.key === 'temperature' && <TemperatureCorrection isGerman={isGerman} />}
              {section.key === 'deconvolution' && <DeconvolutionSection isGerman={isGerman} />}
              {section.key === 'rsf' && <RSFSection isGerman={isGerman} />}
              {section.key === 'device' && <DeviceCalibrationSection isGerman={isGerman} />}
            </div>
          )}
        </div>
      ))}

      {/* Info Box */}
      <div className={cn(KPS.cards.mutedPadded, KPS.colors.infoBox)}>
        <p className={KPS.typography.caption}>
          {isGerman
            ? '💡 Die Standard-Kalibrierung (STANDARD) bietet ~20-25% Genauigkeit vollautomatisch ohne User-Input. Für höhere Genauigkeit (<10%) ist eine Geräte-Kalibrierung mit Referenzgas erforderlich.'
            : '💡 Standard calibration provides ~20-25% accuracy fully automatically without user input. For higher accuracy (<10%), device calibration with reference gas is required.'}
        </p>
      </div>
    </div>
  )
}

// --- Calibration Sub-Components ---

function CalibrationOverview({ isGerman }: { isGerman: boolean }) {
  return (
    <div className={KPS.spacing.sectionGap}>
      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? 'Grundprinzip' : 'Basic Principle'}
        </h5>
        <p className={KPS.typography.caption}>
          {isGerman
            ? 'Ein RGA (Residual Gas Analyzer) misst Ionenströme in Ampere (A). Um diese in Partialdrücke (mbar) umzurechnen, wird die Empfindlichkeit (Sensitivity) des Detektors benötigt.'
            : 'An RGA (Residual Gas Analyzer) measures ion currents in Amperes (A). To convert these to partial pressures (mbar), the detector sensitivity is required.'}
        </p>
      </div>

      <div className={cn(KPS.cards.muted, 'rounded-lg p-3')}>
        <h6 className={cn(KPS.typography.mono, 'text-sm text-aqua-500 mb-2')}>
          {isGerman ? 'Hauptformel:' : 'Main Formula:'}
        </h6>
        <div className={cn(KPS.typography.mono, 'text-center py-2 text-lg')}>
          P<sub>gas</sub> = I / (S × RSF<sub>gas</sub>)
        </div>
        <div className={cn(KPS.typography.caption, KPS.typography.captionMuted, 'mt-2', KPS.spacing.itemGapSmall)}>
          <div>• <span className={KPS.typography.mono}>P</span> = {isGerman ? 'Partialdruck' : 'Partial pressure'} [mbar]</div>
          <div>• <span className={KPS.typography.mono}>I</span> = {isGerman ? 'Ionenstrom' : 'Ion current'} [A]</div>
          <div>• <span className={KPS.typography.mono}>S</span> = {isGerman ? 'Empfindlichkeit' : 'Sensitivity'} [A/mbar]</div>
          <div>• <span className={KPS.typography.mono}>RSF</span> = {isGerman ? 'Rel. Sensitivitätsfaktor' : 'Rel. Sensitivity Factor'} (N₂ = 1.0)</div>
        </div>
      </div>

      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? 'Automatische Kalibrierung' : 'Automatic Calibration'}
        </h5>
        <p className={KPS.typography.caption}>
          {isGerman
            ? 'Die App extrahiert automatisch Metadaten aus dem Dateinamen (Totaldruck, SEM-Spannung, Temperatur, Systemzustand) und berechnet daraus die Empfindlichkeit. Korrekturen für Manometer-Gas und Temperatur werden angewandt.'
            : 'The app automatically extracts metadata from the filename (total pressure, SEM voltage, temperature, system state) and calculates the sensitivity from this. Corrections for manometer gas and temperature are applied.'}
        </p>
      </div>
    </div>
  )
}

function CalibrationLevels({ isGerman }: { isGerman: boolean }) {
  const levels = [
    {
      level: 'BASIC',
      accuracy: '~50%',
      color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      description: 'Keine Korrekturen, Default-Empfindlichkeit',
      descriptionEn: 'No corrections, default sensitivity',
      requirements: 'Keine',
      requirementsEn: 'None',
      features: ['Default S = 10⁻⁴ A/mbar', 'Keine RSF-Korrektur', 'Keine Dekonvolution'],
      featuresEn: ['Default S = 10⁻⁴ A/mbar', 'No RSF correction', 'No deconvolution'],
    },
    {
      level: 'STANDARD',
      accuracy: '~20-25%',
      color: 'bg-aqua-500/20 text-aqua-600 dark:text-aqua-400',
      description: 'Vollautomatisch mit Dateinamen-Metadaten',
      descriptionEn: 'Fully automatic with filename metadata',
      requirements: 'Totaldruck im Dateinamen',
      requirementsEn: 'Total pressure in filename',
      features: ['Manometer-Korrektur', 'Temperatur-Korrektur', 'Cracking Pattern Dekonvolution', 'RSF-gewichtete Berechnung'],
      featuresEn: ['Manometer correction', 'Temperature correction', 'Cracking pattern deconvolution', 'RSF-weighted calculation'],
    },
    {
      level: 'ADVANCED',
      accuracy: '~10-15%',
      color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
      description: 'Mit Geräte-Kalibrierung (N₂-Referenz)',
      descriptionEn: 'With device calibration (N₂ reference)',
      requirements: 'N₂-Referenzmessung',
      requirementsEn: 'N₂ reference measurement',
      features: ['Gemessene Basis-Empfindlichkeit', 'Gerätespezifische Korrektur', 'Alle STANDARD-Features'],
      featuresEn: ['Measured base sensitivity', 'Device-specific correction', 'All STANDARD features'],
    },
    {
      level: 'PRECISION',
      accuracy: '~5-10%',
      color: 'bg-state-success/20 text-state-success',
      description: 'Multi-Gas Kalibrierung',
      descriptionEn: 'Multi-gas calibration',
      requirements: 'N₂ + weitere Gase (Ar, He)',
      requirementsEn: 'N₂ + additional gases (Ar, He)',
      features: ['Gerätespezifische RSF', 'Detektor-Typ optimiert', 'SEM-Alterungs-Tracking', 'Höchste Genauigkeit'],
      featuresEn: ['Device-specific RSF', 'Detector type optimized', 'SEM aging tracking', 'Highest accuracy'],
    },
  ]

  return (
    <div className={KPS.spacing.itemGap}>
      {levels.map(l => (
        <div key={l.level} className={cn(KPS.cards.muted, 'rounded-lg p-3')}>
          <div className={cn(KPS.layout.flex, 'mb-2')}>
            <span className={cn('px-2 py-0.5 rounded font-mono font-medium', l.color)}>
              {l.level}
            </span>
            <span className={KPS.typography.captionMuted}>{l.accuracy}</span>
          </div>
          <p className={cn(KPS.typography.caption, 'font-medium mb-2')}>
            {isGerman ? l.description : l.descriptionEn}
          </p>
          <div className="mb-2">
            <span className={KPS.typography.micro}>
              {isGerman ? 'Voraussetzung: ' : 'Requirement: '}
            </span>
            <span className={KPS.typography.caption}>{isGerman ? l.requirements : l.requirementsEn}</span>
          </div>
          <ul className={cn(KPS.typography.caption, 'list-disc list-inside')}>
            {(isGerman ? l.features : l.featuresEn).map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function CalibrationFormulas({ isGerman }: { isGerman: boolean }) {
  return (
    <div className={KPS.spacing.sectionGap}>
      {/* Sensitivity Calculation */}
      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? '1. Empfindlichkeitsberechnung' : '1. Sensitivity Calculation'}
        </h5>
        <div className={cn(KPS.cards.muted, 'rounded-lg p-3')}>
          <div className={cn(KPS.typography.mono, 'text-center py-2')}>
            S = Σ(I<sub>mass</sub> / RSF<sub>mass</sub>) / P<sub>total,korr</sub>
          </div>
          <p className={cn(KPS.typography.captionMuted, 'mt-2')}>
            {isGerman
              ? 'Die Empfindlichkeit wird aus der Summe der RSF-gewichteten Ionenströme geteilt durch den korrigierten Totaldruck berechnet.'
              : 'Sensitivity is calculated from the sum of RSF-weighted ion currents divided by the corrected total pressure.'}
          </p>
        </div>
      </div>

      {/* Pressure Calculation */}
      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? '2. Partialdruck-Berechnung' : '2. Partial Pressure Calculation'}
        </h5>
        <div className={cn(KPS.cards.muted, 'rounded-lg p-3')}>
          <div className={cn(KPS.typography.mono, 'text-center py-2')}>
            P<sub>gas</sub> = I<sub>gas</sub> / (S × RSF<sub>gas</sub>)
          </div>
          <p className={cn(KPS.typography.captionMuted, 'mt-2')}>
            {isGerman
              ? 'Der Partialdruck jedes Gases ergibt sich aus dem Ionenstrom geteilt durch Empfindlichkeit und RSF.'
              : 'The partial pressure of each gas results from the ion current divided by sensitivity and RSF.'}
          </p>
        </div>
      </div>

      {/* Total Pressure Correction */}
      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? '3. Totaldruck-Korrektur' : '3. Total Pressure Correction'}
        </h5>
        <div className={cn(KPS.cards.muted, 'rounded-lg p-3')}>
          <div className={cn(KPS.typography.mono, 'text-center py-2')}>
            P<sub>korr</sub> = P<sub>gemessen</sub> × f<sub>manometer</sub> × f<sub>temperatur</sub>
          </div>
          <p className={cn(KPS.typography.captionMuted, 'mt-2')}>
            {isGerman
              ? 'Der gemessene Totaldruck wird für das dominante Gas und die Temperatur korrigiert.'
              : 'The measured total pressure is corrected for the dominant gas and temperature.'}
          </p>
        </div>
      </div>

      {/* SEM Gain */}
      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? '4. SEM-Verstärkung (falls keine Kalibrierung)' : '4. SEM Gain (if no calibration)'}
        </h5>
        <div className={cn(KPS.cards.muted, 'rounded-lg p-3')}>
          <div className={cn(KPS.typography.mono, 'text-center py-2')}>
            Gain ≈ 10<sup>(V/350)</sup>
          </div>
          <p className={cn(KPS.typography.captionMuted, 'mt-2')}>
            {isGerman
              ? 'Bei SEM-Spannung > 800V wird die Verstärkung aus der Spannung geschätzt. Faraday: Gain = 1.'
              : 'For SEM voltage > 800V, gain is estimated from voltage. Faraday: Gain = 1.'}
          </p>
        </div>
      </div>
    </div>
  )
}

function ManometerCorrection({ isGerman }: { isGerman: boolean }) {
  const corrections = [
    { state: 'UNBAKED', gas: 'H₂O', factor: '1/0.9 = 1.11', description: 'Wasser-dominiert', descriptionEn: 'Water-dominated' },
    { state: 'BAKED', gas: 'H₂', factor: '1/0.44 = 2.27', description: 'Wasserstoff-dominiert', descriptionEn: 'Hydrogen-dominated' },
    { state: 'UNKNOWN', gas: 'N₂', factor: '1.0', description: 'Stickstoff-Referenz', descriptionEn: 'Nitrogen reference' },
  ]

  return (
    <div className={KPS.spacing.sectionGap}>
      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? 'Problem' : 'Problem'}
        </h5>
        <p className={KPS.typography.caption}>
          {isGerman
            ? 'Ionisationsmanometer (Bayard-Alpert) sind auf N₂ kalibriert. Bei anderen dominanten Gasen zeigen sie systematisch falsche Werte an.'
            : 'Ionization gauges (Bayard-Alpert) are calibrated for N₂. With other dominant gases, they show systematically incorrect values.'}
        </p>
      </div>

      <div className={cn(KPS.cards.muted, 'rounded-lg p-3')}>
        <div className={cn(KPS.typography.mono, 'text-center py-2')}>
          P<sub>real</sub> = P<sub>angezeigt</sub> × (1 / RSF<sub>dominant</sub>)
        </div>
      </div>

      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? 'Korrekturfaktoren nach Systemzustand' : 'Correction Factors by System State'}
        </h5>
        <div className="overflow-x-auto">
          <table className={KPS.tables.table}>
            <thead>
              <tr className={KPS.tables.headerRow}>
                <th className={KPS.tables.headerCell}>{isGerman ? 'Zustand' : 'State'}</th>
                <th className={KPS.tables.headerCell}>{isGerman ? 'Dom. Gas' : 'Dom. Gas'}</th>
                <th className={KPS.tables.headerCell}>{isGerman ? 'Faktor' : 'Factor'}</th>
              </tr>
            </thead>
            <tbody>
              {corrections.map(c => (
                <tr key={c.state} className={KPS.tables.row}>
                  <td className={KPS.tables.cell}>
                    <span className={cn(KPS.typography.mono, 'text-aqua-500')}>{c.state}</span>
                    <span className={cn(KPS.typography.captionMuted, 'ml-2')}>({isGerman ? c.description : c.descriptionEn})</span>
                  </td>
                  <td className={cn(KPS.tables.cell, KPS.typography.mono)}>{c.gas}</td>
                  <td className={cn(KPS.tables.cell, KPS.typography.mono)}>{c.factor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={cn(KPS.cards.mutedPadded, KPS.colors.warning)}>
        <p className={KPS.typography.caption}>
          {isGerman
            ? '⚠️ Der Systemzustand wird automatisch aus dem Dateinamen erkannt (z.B. "after bakeout", "unbaked", "ausgeheizt").'
            : '⚠️ System state is automatically detected from the filename (e.g., "after bakeout", "unbaked", "baked").'}
        </p>
      </div>
    </div>
  )
}

function TemperatureCorrection({ isGerman }: { isGerman: boolean }) {
  return (
    <div className={KPS.spacing.sectionGap}>
      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? 'Physikalischer Hintergrund' : 'Physical Background'}
        </h5>
        <p className={KPS.typography.caption}>
          {isGerman
            ? 'Ionisationsmanometer sind temperaturabhängig. Bei Abweichung von der Referenztemperatur (23°C = 296 K) muss korrigiert werden.'
            : 'Ionization gauges are temperature-dependent. Deviations from reference temperature (23°C = 296 K) require correction.'}
        </p>
      </div>

      <div className={cn(KPS.cards.muted, 'rounded-lg p-3')}>
        <div className={cn(KPS.typography.mono, 'text-center py-2')}>
          P<sub>korr</sub> = P<sub>gemessen</sub> × (T<sub>ref</sub> / T<sub>aktuell</sub>)
        </div>
        <div className={cn(KPS.typography.captionMuted, 'mt-2 text-center')}>
          T<sub>ref</sub> = 296 K (23°C)
        </div>
      </div>

      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? 'Beispiele' : 'Examples'}
        </h5>
        <div className={KPS.layout.gridWide}>
          <div className={cn(KPS.cards.muted, 'rounded-lg p-2 text-center')}>
            <div className={KPS.typography.captionMuted}>20°C</div>
            <div className={cn(KPS.typography.mono, 'text-aqua-500')}>× 1.010</div>
          </div>
          <div className={cn(KPS.cards.muted, 'rounded-lg p-2 text-center')}>
            <div className={KPS.typography.captionMuted}>22°C</div>
            <div className={cn(KPS.typography.mono, 'text-aqua-500')}>× 1.003</div>
          </div>
          <div className={cn(KPS.cards.muted, 'rounded-lg p-2 text-center')}>
            <div className={KPS.typography.captionMuted}>25°C</div>
            <div className={cn(KPS.typography.mono, 'text-aqua-500')}>× 0.993</div>
          </div>
          <div className={cn(KPS.cards.muted, 'rounded-lg p-2 text-center')}>
            <div className={KPS.typography.captionMuted}>30°C</div>
            <div className={cn(KPS.typography.mono, 'text-aqua-500')}>× 0.977</div>
          </div>
        </div>
      </div>

      <p className={KPS.typography.captionMuted}>
        {isGerman
          ? 'Die Temperatur wird aus dem Dateinamen extrahiert (z.B. "22c", "25°C").'
          : 'Temperature is extracted from the filename (e.g., "22c", "25°C").'}
      </p>
    </div>
  )
}

function DeconvolutionSection({ isGerman }: { isGerman: boolean }) {
  const examples = [
    {
      gas: 'CO₂',
      mainMass: 44,
      fragments: [
        { mass: 28, percent: 10, ion: 'CO⁺' },
        { mass: 16, percent: 10, ion: 'O⁺' },
        { mass: 12, percent: 8.7, ion: 'C⁺' },
        { mass: 22, percent: 1.9, ion: 'CO₂²⁺' },
      ],
    },
    {
      gas: 'H₂O',
      mainMass: 18,
      fragments: [
        { mass: 17, percent: 23, ion: 'OH⁺' },
        { mass: 16, percent: 1.5, ion: 'O⁺' },
      ],
    },
    {
      gas: 'Ar',
      mainMass: 40,
      fragments: [
        { mass: 20, percent: 14.6, ion: 'Ar²⁺' },
        { mass: 36, percent: 0.34, ion: '³⁶Ar' },
      ],
    },
  ]

  return (
    <div className={KPS.spacing.sectionGap}>
      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? 'Warum Dekonvolution?' : 'Why Deconvolution?'}
        </h5>
        <p className={KPS.typography.caption}>
          {isGerman
            ? 'Bei 70 eV Elektronenstoß-Ionisation entstehen neben dem Hauptpeak auch Fragmente. Ohne Korrektur werden diese doppelt gezählt (z.B. 10% des CO₂-Signals erscheint bei m/z 28 und wird als N₂ interpretiert).'
            : 'At 70 eV electron impact ionization, fragments are created alongside the main peak. Without correction, these are double-counted (e.g., 10% of CO₂ signal appears at m/z 28 and is interpreted as N₂).'}
        </p>
      </div>

      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? 'Reihenfolge der Subtraktion' : 'Subtraction Order'}
        </h5>
        <ol className={cn(KPS.typography.caption, 'list-decimal list-inside', KPS.spacing.itemGapSmall)}>
          <li>CO₂ (m44 {isGerman ? 'eindeutig' : 'unique'}) → {isGerman ? 'Fragmente bei' : 'fragments at'} 28, 16, 12, 22</li>
          <li>H₂O (m18 {isGerman ? 'relativ eindeutig' : 'relatively unique'}) → {isGerman ? 'Fragmente bei' : 'fragments at'} 17, 16</li>
          <li>Ar (m40 {isGerman ? 'eindeutig' : 'unique'}) → {isGerman ? 'Fragmente bei' : 'fragments at'} 20, 36</li>
          <li>O₂ (m32) → {isGerman ? 'Fragment bei' : 'fragment at'} 16</li>
          <li>N₂/CO (m28) → {isGerman ? 'Unterscheidung via' : 'differentiation via'} m14/m12</li>
          <li>H₂ (m2) → {isGerman ? 'Fragment bei' : 'fragment at'} 1</li>
          <li>CH₄ (m16) → {isGerman ? 'via' : 'via'} m15 (CH₃⁺)</li>
        </ol>
      </div>

      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? 'N₂/CO Unterscheidung' : 'N₂/CO Differentiation'}
        </h5>
        <div className={cn(KPS.cards.muted, 'rounded-lg p-3', KPS.spacing.itemGapSmall)}>
          <div className={cn(KPS.typography.caption, KPS.typography.mono)}>
            N₂: m14/m28 ≈ 7.2% (N⁺ {isGerman ? 'Fragment' : 'fragment'})
          </div>
          <div className={cn(KPS.typography.caption, KPS.typography.mono)}>
            CO: m12/m28 ≈ 4.5% (C⁺ {isGerman ? 'Fragment' : 'fragment'})
          </div>
          <p className={cn(KPS.typography.captionMuted, 'mt-2')}>
            {isGerman
              ? 'Aus den Fragmentintensitäten wird der jeweilige Anteil berechnet.'
              : 'The respective contribution is calculated from fragment intensities.'}
          </p>
        </div>
      </div>

      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? 'Cracking Patterns (Beispiele)' : 'Cracking Patterns (Examples)'}
        </h5>
        <div className={KPS.spacing.itemGapSmall}>
          {examples.map(ex => (
            <div key={ex.gas} className={cn(KPS.cards.muted, 'rounded-lg p-2')}>
              <div className={cn(KPS.layout.flex, 'mb-1')}>
                <span className={cn(KPS.typography.mono, 'font-medium text-aqua-500')}>{ex.gas}</span>
                <span className={KPS.typography.micro}>({isGerman ? 'Hauptmasse' : 'main mass'}: m{ex.mainMass} = 100%)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ex.fragments.map(f => (
                  <span key={f.mass} className={cn(KPS.typography.caption, KPS.typography.mono)}>
                    m{f.mass}: {f.percent}% ({f.ion})
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RSFSection({ isGerman }: { isGerman: boolean }) {
  const rsfData = [
    { gas: 'He', rsf: 0.14, note: 'sehr niedrig', noteEn: 'very low' },
    { gas: 'Ne', rsf: 0.23, note: '', noteEn: '' },
    { gas: 'H₂', rsf: 0.44, note: 'Faktor 2.27 vs Manometer', noteEn: 'Factor 2.27 vs gauge' },
    { gas: 'O₂', rsf: 0.86, note: '', noteEn: '' },
    { gas: 'H₂O', rsf: 0.90, note: 'Faktor 1.11 vs Manometer', noteEn: 'Factor 1.11 vs gauge' },
    { gas: 'N₂', rsf: 1.00, note: 'Referenz', noteEn: 'Reference' },
    { gas: 'CO', rsf: 1.05, note: '', noteEn: '' },
    { gas: 'Ar', rsf: 1.20, note: '', noteEn: '' },
    { gas: 'CO₂', rsf: 1.40, note: '', noteEn: '' },
    { gas: 'CH₄', rsf: 1.60, note: '', noteEn: '' },
    { gas: 'Xe', rsf: 3.00, note: '', noteEn: '' },
    { gas: 'Öl', rsf: 4.00, note: 'Schätzung', noteEn: 'estimate' },
  ]

  return (
    <div className={KPS.spacing.sectionGap}>
      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? 'Was ist RSF?' : 'What is RSF?'}
        </h5>
        <p className={KPS.typography.caption}>
          {isGerman
            ? 'Der Relative Sensitivity Factor (RSF) beschreibt, wie effizient ein Gas im Vergleich zu N₂ ionisiert wird. Ein RSF > 1 bedeutet höhere Ionisationswahrscheinlichkeit.'
            : 'The Relative Sensitivity Factor (RSF) describes how efficiently a gas is ionized compared to N₂. RSF > 1 means higher ionization probability.'}
        </p>
      </div>

      <div className={cn(KPS.cards.muted, 'rounded-lg p-3')}>
        <div className={cn(KPS.typography.mono, 'text-center py-2')}>
          RSF<sub>gas</sub> = S<sub>gas</sub> / S<sub>N₂</sub>
        </div>
      </div>

      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? 'Standard-RSF Tabelle' : 'Standard RSF Table'}
        </h5>
        <div className="overflow-x-auto">
          <table className={KPS.tables.table}>
            <thead>
              <tr className={KPS.tables.headerRow}>
                <th className={KPS.tables.headerCell}>{isGerman ? 'Gas' : 'Gas'}</th>
                <th className={KPS.tables.headerCell}>RSF</th>
                <th className={KPS.tables.headerCell}>{isGerman ? 'Anmerkung' : 'Note'}</th>
              </tr>
            </thead>
            <tbody>
              {rsfData.map(r => (
                <tr key={r.gas} className={KPS.tables.row}>
                  <td className={cn(KPS.tables.cell, KPS.typography.mono, 'text-aqua-500')}>{r.gas}</td>
                  <td className={cn(KPS.tables.cell, KPS.typography.mono)}>{r.rsf.toFixed(2)}</td>
                  <td className={cn(KPS.tables.cell, KPS.typography.captionMuted)}>{isGerman ? r.note : r.noteEn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={cn(KPS.cards.mutedPadded, KPS.colors.infoBox)}>
        <p className={KPS.typography.caption}>
          {isGerman
            ? '💡 Bei Geräte-Kalibrierung (PRECISION) werden gerätespezifische RSF berechnet, die von den Standardwerten abweichen können.'
            : '💡 With device calibration (PRECISION), device-specific RSF are calculated that may differ from standard values.'}
        </p>
      </div>
    </div>
  )
}

function DeviceCalibrationSection({ isGerman }: { isGerman: boolean }) {
  return (
    <div className={KPS.spacing.sectionGap}>
      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? 'Voraussetzungen' : 'Requirements'}
        </h5>
        <ul className={cn(KPS.typography.caption, 'list-disc list-inside', KPS.spacing.itemGapSmall)}>
          <li>{isGerman ? 'Externes Referenz-Manometer (kapazitiv, Spinning Rotor, etc.)' : 'External reference gauge (capacitive, spinning rotor, etc.)'}</li>
          <li>{isGerman ? 'Reines Referenzgas (N₂ Pflicht, optional Ar, He)' : 'Pure reference gas (N₂ required, optionally Ar, He)'}</li>
          <li>{isGerman ? 'Stabiler Druck während Messung' : 'Stable pressure during measurement'}</li>
        </ul>
      </div>

      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? 'Ablauf N₂-Kalibrierung' : 'N₂ Calibration Procedure'}
        </h5>
        <ol className={cn(KPS.typography.caption, 'list-decimal list-inside', KPS.spacing.itemGapSmall)}>
          <li>{isGerman ? 'N₂ einlassen auf stabilen Druck (typ. 10⁻⁶ mbar)' : 'Admit N₂ to stable pressure (typ. 10⁻⁶ mbar)'}</li>
          <li>{isGerman ? 'Referenzdruck P_ref vom externen Manometer ablesen' : 'Read reference pressure P_ref from external gauge'}</li>
          <li>{isGerman ? 'RGA-Ionenstrom I bei m/z 28 ablesen' : 'Read RGA ion current I at m/z 28'}</li>
          <li>{isGerman ? 'Empfindlichkeit berechnen:' : 'Calculate sensitivity:'}</li>
        </ol>
        <div className={cn(KPS.cards.muted, 'rounded-lg p-3 mt-2')}>
          <div className={cn(KPS.typography.mono, 'text-center py-2')}>
            S<sub>base</sub> = I<sub>m28</sub> / P<sub>ref</sub>
          </div>
        </div>
      </div>

      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? 'Multi-Gas Kalibrierung (PRECISION)' : 'Multi-Gas Calibration (PRECISION)'}
        </h5>
        <p className={cn(KPS.typography.caption, 'mb-2')}>
          {isGerman
            ? 'Durch Messung weiterer Gase werden gerätespezifische RSF berechnet:'
            : 'By measuring additional gases, device-specific RSF are calculated:'}
        </p>
        <div className={cn(KPS.cards.muted, 'rounded-lg p-3')}>
          <div className={cn(KPS.typography.mono, 'text-center py-2')}>
            RSF<sub>gas,device</sub> = (I<sub>gas</sub> / P<sub>gas</sub>) / S<sub>base</sub>
          </div>
        </div>
      </div>

      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? 'SEM-Alterungs-Tracking' : 'SEM Aging Tracking'}
        </h5>
        <p className={cn(KPS.typography.caption, 'mb-2')}>
          {isGerman
            ? 'Die App speichert SEM-Spannungen über Zeit und warnt bei signifikanter Zunahme:'
            : 'The app stores SEM voltages over time and warns on significant increase:'}
        </p>
        <div className={KPS.layout.gridThree}>
          <div className={cn(KPS.cards.mutedPadded, 'bg-aqua-500/10 text-center')}>
            <div className={KPS.typography.micro}>{isGerman ? 'Info' : 'Info'}</div>
            <div className={cn(KPS.typography.mono, 'text-aqua-500')}>&gt; 50V</div>
          </div>
          <div className={cn(KPS.cards.mutedPadded, 'bg-state-warning/10 text-center')}>
            <div className={KPS.typography.micro}>{isGerman ? 'Warnung' : 'Warning'}</div>
            <div className={cn(KPS.typography.mono, 'text-state-warning')}>&gt; 150V</div>
          </div>
          <div className={cn(KPS.cards.mutedPadded, 'bg-state-danger/10 text-center')}>
            <div className={KPS.typography.micro}>{isGerman ? 'Kritisch' : 'Critical'}</div>
            <div className={cn(KPS.typography.mono, 'text-state-danger')}>&gt; 300V</div>
          </div>
        </div>
      </div>

      <div>
        <h5 className={cn(KPS.typography.cardTitle, 'mb-2')}>
          {isGerman ? 'Cloud-Speicherung' : 'Cloud Storage'}
        </h5>
        <p className={KPS.typography.caption}>
          {isGerman
            ? 'Geräte-Kalibrierungen werden in Firebase gespeichert und sind nach Login automatisch verfügbar. Die neueste Kalibrierung wird beim Start geladen.'
            : 'Device calibrations are stored in Firebase and are automatically available after login. The latest calibration is loaded at startup.'}
        </p>
      </div>
    </div>
  )
}
