/**
 * Limit Comparison with Statistical Significance
 * 
 * Implements decision rules for conformity assessment according to:
 * - JCGM 106:2012 (ISO/IEC Guide 98-4)
 * - ILAC G8:09/2019
 * - ISO/IEC 17025:2017
 * 
 * Provides statistical confidence levels for pass/fail decisions
 * based on measurement uncertainty.
 */

import { normalCDF } from './statistics'

/**
 * Significance conclusion categories based on margin thresholds
 */
export type SignificanceConclusion =
    | 'clearly_below'    // >3σ below limit (99.87% confidence)
    | 'probably_below'   // 2-3σ below limit (95-99.87% confidence)
    | 'uncertain'        // ±2σ around limit (too close to decide)
    | 'probably_above'   // 2-3σ above limit (95-99.87% probability of exceedance)
    | 'clearly_above'    // >3σ above limit (99.87% probability of exceedance)

/**
 * Result of limit comparison with statistical significance
 */
export interface LimitComparisonResult {
    // Input values
    value: number              // Measured value
    uncertainty: number        // Standard uncertainty (1σ)
    limit: number              // Specification limit

    // Statistical analysis
    margin: number             // Distance from limit in σ (Z-score)
    probability: number        // P(true value < limit), range [0, 1]
    conclusion: SignificanceConclusion
    confidenceLevel: number    // Confidence percentage (0-100)

    // Simple pass/fail (central value only, no uncertainty)
    passed: boolean            // value < limit?

    // Human-readable interpretation
    message: {
        de: string
        en: string
    }
    recommendation: {
        de: string
        en: string
    }

    // Metadata
    method: string             // Reference standard
}

/**
 * Compare measurement to specification limit with statistical significance
 * 
 * Methodology:
 * - Z-score calculation: margin = (limit - value) / uncertainty
 * - Probability: P(true value < limit) = Φ(margin) where Φ is Normal CDF
 * - Decision rules based on ILAC G8:09/2019 and Tektronix Guard Banding
 * 
 * @param value - Measured value
 * @param uncertainty - Standard uncertainty (1σ)
 * @param limit - Specification limit
 * @returns Detailed limit comparison result with statistical significance
 * 
 * @example
 * // Clear pass: Q = 1.0, δQ = 0.2, limit = 1.7
 * const result = compareToLimit(1.0, 0.2, 1.7)
 * // result.conclusion = 'clearly_below'
 * // result.margin = 3.5σ
 * // result.confidenceLevel = 99.98%
 */
export function compareToLimit(
    value: number,
    uncertainty: number,
    limit: number,
    _unit?: string  // Reserved for future use
): LimitComparisonResult {
    // Validate inputs
    if (uncertainty <= 0) {
        throw new Error('Uncertainty must be positive')
    }

    // Calculate Z-score (margin in standard deviations)
    // Positive margin: limit is ABOVE value (good)
    // Negative margin: limit is BELOW value (bad)
    const margin = (limit - value) / uncertainty

    // Calculate probability P(true value < limit) using Normal CDF
    const probability = normalCDF(margin)

    // Determine conclusion based on margin thresholds
    // Based on ILAC G8, Tektronix Guard Banding, and ISO 17025
    let conclusion: SignificanceConclusion
    let confidenceLevel: number
    let messageDe: string
    let messageEn: string
    let recommendationDe: string
    let recommendationEn: string

    if (margin > 3) {
        // 99.87% confident below limit
        conclusion = 'clearly_below'
        confidenceLevel = 99.87
        messageDe = `Deutlich unter Grenzwert – sehr sichere Messung (${(probability * 100).toFixed(0)}% Sicherheit)`
        messageEn = `Well below limit – very confident result (${(probability * 100).toFixed(0)}% certainty)`
        recommendationDe = '✅ Bestanden: System ist dicht. Keine weitere Aktion nötig.'
        recommendationEn = '✅ Pass: System is tight. No further action needed.'
    } else if (margin > 2) {
        // 95.4-99.87% confident below limit
        conclusion = 'probably_below'
        confidenceLevel = probability * 100
        messageDe = `Unter Grenzwert – sichere Messung (${(probability * 100).toFixed(0)}% Sicherheit)`
        messageEn = `Below limit – confident result (${(probability * 100).toFixed(0)}% certainty)`
        recommendationDe = '✅ Bestanden: System ist in Ordnung. Ausreichend großer Sicherheitsabstand.'
        recommendationEn = '✅ Pass: System is good. Sufficient safety margin.'
    } else if (margin > -2) {
        // Uncertain: measurement too close to limit
        conclusion = 'uncertain'
        const distance = Math.abs(probability * 100 - 50)
        confidenceLevel = distance
        const isPassing = value < limit
        messageDe = `Messwert liegt nahe am Grenzwert (${Math.abs(margin).toFixed(2)}σ Abstand, ${(probability * 100).toFixed(2)}% Konfidenz)`
        messageEn = `Measurement is near limit (${Math.abs(margin).toFixed(2)}σ margin, ${(probability * 100).toFixed(2)}% confidence)`

        if (isPassing) {
            recommendationDe = 'Grenzfall Bestanden: Guard-Band erwägen. Messunsicherheit überlappt Grenzwert.'
            recommendationEn = 'Borderline Pass: Consider guard-banding. Measurement uncertainty overlaps specification limit.'
        } else {
            recommendationDe = 'Grenzfall Nicht-Bestanden: Messung nahe am Grenzwert. Kalibrierung prüfen und Test ggf. wiederholen.'
            recommendationEn = 'Borderline Fail: Measurement close to limit. Verify calibration and repeat test if possible.'
        }
    } else if (margin > -3) {
        // 95.4-99.87% confident ABOVE limit
        conclusion = 'probably_above'
        confidenceLevel = (1 - probability) * 100
        messageDe = `Über Grenzwert – wahrscheinlich zu hoch (${((1 - probability) * 100).toFixed(0)}% Sicherheit)`
        messageEn = `Above limit – probably too high (${((1 - probability) * 100).toFixed(0)}% certainty)`
        recommendationDe = '❌ Nicht bestanden: Leck wahrscheinlich zu groß. Lecksuche durchführen.'
        recommendationEn = '❌ Fail: Leak probably too large. Perform leak search.'
    } else {
        // 99.87% confident ABOVE limit
        conclusion = 'clearly_above'
        confidenceLevel = (1 - probability) * 100
        messageDe = `Deutlich über Grenzwert – sicher zu hoch (${((1 - probability) * 100).toFixed(0)}% Sicherheit)`
        messageEn = `Well above limit – definitely too high (${((1 - probability) * 100).toFixed(0)}% certainty)`
        recommendationDe = '❌ Nicht bestanden: Leck eindeutig zu groß. Sofort Lecksuche starten!'
        recommendationEn = '❌ Fail: Leak definitely too large. Start leak search immediately!'
    }

    return {
        value,
        uncertainty,
        limit,
        margin,
        probability,
        conclusion,
        confidenceLevel,
        passed: value < limit,  // Simple central value comparison (no uncertainty)
        message: {
            de: messageDe,
            en: messageEn
        },
        recommendation: {
            de: recommendationDe,
            en: recommendationEn
        },
        method: 'JCGM 106:2012 / ILAC G8:09/2019'
    }
}

/**
 * Get color coding for significance conclusion
 * 
 * @param conclusion - Significance conclusion
 * @returns Color category for UI styling
 */
export function getSignificanceColor(conclusion: SignificanceConclusion): 'success' | 'warning' | 'danger' {
    switch (conclusion) {
        case 'clearly_below':
        case 'probably_below':
            return 'success'
        case 'uncertain':
            return 'warning'
        case 'probably_above':
        case 'clearly_above':
            return 'danger'
    }
}

/**
 * Format margin with sign for display
 * 
 * @param margin - Margin in σ
 * @returns Formatted string with sign and unit
 * 
 * @example
 * formatMargin(2.5)   // "+2.50σ"
 * formatMargin(-1.2)  // "-1.20σ"
 */
export function formatMargin(margin: number): string {
    const sign = margin > 0 ? '+' : ''
    return `${sign}${margin.toFixed(2)}σ`
}
