/**
 * Unit Tests for Statistical Functions and Limit Comparison
 * 
 * Tests based on:
 * - Stanford CS109 examples
 * - JCGM 106:2012 examples
 * - 68-95-99.7 rule verification
 */

import { describe, test, expect } from 'vitest'
import { normalCDF, normalQuantile, marginToConfidence } from '../statistics'
import { compareToLimit, getSignificanceColor, formatMargin } from '../limitComparison'

describe('normalCDF', () => {
    test('returns 0.5 for x=0 (median)', () => {
        expect(normalCDF(0)).toBeCloseTo(0.5, 4)
    })

    test('returns correct values for ±1σ (68% rule)', () => {
        expect(normalCDF(1)).toBeCloseTo(0.8413, 4)   // 84.13%
        expect(normalCDF(-1)).toBeCloseTo(0.1587, 4)  // 15.87%
    })

    test('returns correct values for ±2σ (95% rule)', () => {
        expect(normalCDF(2)).toBeCloseTo(0.9772, 4)   // 97.72%
        expect(normalCDF(-2)).toBeCloseTo(0.0228, 4)  // 2.28%
    })

    test('returns correct values for ±3σ (99.7% rule)', () => {
        expect(normalCDF(3)).toBeCloseTo(0.9987, 4)   // 99.87%
        expect(normalCDF(-3)).toBeCloseTo(0.0013, 4)  // 0.13%
    })

    test('Stanford CS109 example: x=1.5', () => {
        expect(normalCDF(1.5)).toBeCloseTo(0.9332, 4)  // 93.32%
    })

    test('handles extreme values', () => {
        expect(normalCDF(5)).toBeGreaterThan(0.9999)
        expect(normalCDF(-5)).toBeLessThan(0.0001)
    })
})

describe('normalQuantile', () => {
    test('returns correct values for common confidence levels', () => {
        expect(normalQuantile(0.025)).toBeCloseTo(-1.96, 2)  // 95% CI lower
        expect(normalQuantile(0.975)).toBeCloseTo(1.96, 2)   // 95% CI upper
        expect(normalQuantile(0.5)).toBeCloseTo(0, 2)         // median
    })

    test('returns correct values for 2σ and 3σ', () => {
        expect(normalQuantile(0.0228)).toBeCloseTo(-2.0, 2)  // 2σ lower
        expect(normalQuantile(0.9772)).toBeCloseTo(2.0, 2)   // 2σ upper
        expect(normalQuantile(0.0013)).toBeCloseTo(-3.0, 2)  // 3σ lower
        expect(normalQuantile(0.9987)).toBeCloseTo(3.0, 2)   // 3σ upper
    })

    test('throws error for invalid probabilities', () => {
        expect(() => normalQuantile(0)).toThrow()
        expect(() => normalQuantile(1)).toThrow()
        expect(() => normalQuantile(-0.1)).toThrow()
        expect(() => normalQuantile(1.1)).toThrow()
    })
})

describe('compareToLimit', () => {
    test('clearly below limit (+3σ)', () => {
        // Q = 1.0, δQ = 0.2, limit = 1.7 → margin = (1.7-1.0)/0.2 = 3.5σ
        const result = compareToLimit(1.0, 0.2, 1.7)

        expect(result.conclusion).toBe('clearly_below')
        expect(result.probability).toBeGreaterThan(0.998)
        expect(result.passed).toBe(true)
        expect(result.margin).toBeCloseTo(3.5, 2)
        expect(result.confidenceLevel).toBeCloseTo(99.87, 1)
    })

    test('probably below limit (>2σ)', () => {
        // Q = 1.0, δQ = 0.15, limit = 1.4 → margin = 2.67σ (solidly in probably_below range)
        const result = compareToLimit(1.0, 0.15, 1.4)

        expect(result.conclusion).toBe('probably_below')
        expect(result.probability).toBeGreaterThan(0.95)
        expect(result.passed).toBe(true)
        expect(result.margin).toBeGreaterThan(2)
        expect(result.confidenceLevel).toBeGreaterThan(95)
    })

    test('uncertain (near limit, +0.5σ)', () => {
        // Q = 1.0, δQ = 0.2, limit = 1.1 → margin = 0.5σ
        const result = compareToLimit(1.0, 0.2, 1.1)

        expect(result.conclusion).toBe('uncertain')
        expect(result.probability).toBeCloseTo(0.6915, 3)  // 69.15%
        expect(result.passed).toBe(true)
        expect(result.margin).toBeCloseTo(0.5, 2)
        expect(result.recommendation.en).toContain('Borderline')
    })

    test('uncertain (near limit, -0.5σ)', () => {
        // Q = 1.1, δQ = 0.2, limit = 1.0 → margin = -0.5σ
        const result = compareToLimit(1.1, 0.2, 1.0)

        expect(result.conclusion).toBe('uncertain')
        expect(result.passed).toBe(false)
        expect(result.margin).toBeCloseTo(-0.5, 2)
        expect(result.recommendation.en).toContain('Borderline')
    })

    test('probably above limit (<-2σ)', () => {
        // Q = 1.5, δQ = 0.15, limit = 1.0 → margin = -3.33σ (solidly in probably_above range)
        const result = compareToLimit(1.5, 0.15, 1.0)

        expect(result.conclusion).toBe('probably_above')
        expect(result.probability).toBeLessThan(0.05)
        expect(result.passed).toBe(false)
        expect(result.margin).toBeLessThan(-2)
        expect(result.confidenceLevel).toBeGreaterThan(95)
    })

    test('clearly above limit (-3σ)', () => {
        // Q = 1.7, δQ = 0.2, limit = 1.0 → margin = -3.5σ
        const result = compareToLimit(1.7, 0.2, 1.0)

        expect(result.conclusion).toBe('clearly_above')
        expect(result.probability).toBeLessThan(0.002)
        expect(result.passed).toBe(false)
        expect(result.margin).toBeCloseTo(-3.5, 2)
        // Confidence is (1-probability)*100, which for -3.5σ is 99.977%
        expect(result.confidenceLevel).toBeGreaterThan(99)
    })

    test('includes bilingual messages', () => {
        const result = compareToLimit(1.0, 0.2, 1.7)

        expect(result.message.de).toContain('Grenzwert')
        expect(result.message.en).toContain('limit')
        expect(result.recommendation.de).toBeTruthy()
        expect(result.recommendation.en).toBeTruthy()
    })

    test('includes method reference', () => {
        const result = compareToLimit(1.0, 0.2, 1.7)

        expect(result.method).toContain('JCGM 106')
        expect(result.method).toContain('ILAC G8')
    })

    test('throws error for invalid uncertainty', () => {
        expect(() => compareToLimit(1.0, 0, 1.5)).toThrow('Uncertainty must be positive')
        expect(() => compareToLimit(1.0, -0.1, 1.5)).toThrow('Uncertainty must be positive')
    })

    test('realistic RGA example: borderline pass', () => {
        // Q = 1.05e-8, δQ = 0.15e-8, limit = 1.0e-8 → margin ≈ -0.33σ
        const result = compareToLimit(1.05e-8, 0.15e-8, 1.0e-8)

        expect(result.conclusion).toBe('uncertain')
        expect(result.passed).toBe(false)
        expect(Math.abs(result.margin)).toBeLessThan(2)
    })

    test('realistic RGA example: clear pass', () => {
        // Q = 5e-9, δQ = 1e-9, limit = 1e-8 → margin = 5σ
        const result = compareToLimit(5e-9, 1e-9, 1e-8)

        expect(result.conclusion).toBe('clearly_below')
        expect(result.passed).toBe(true)
        expect(result.margin).toBeGreaterThan(3)
    })
})

describe('getSignificanceColor', () => {
    test('returns success for below-limit conclusions', () => {
        expect(getSignificanceColor('clearly_below')).toBe('success')
        expect(getSignificanceColor('probably_below')).toBe('success')
    })

    test('returns warning for uncertain', () => {
        expect(getSignificanceColor('uncertain')).toBe('warning')
    })

    test('returns danger for above-limit conclusions', () => {
        expect(getSignificanceColor('probably_above')).toBe('danger')
        expect(getSignificanceColor('clearly_above')).toBe('danger')
    })
})

describe('formatMargin', () => {
    test('formats positive margins with + sign', () => {
        expect(formatMargin(2.5)).toBe('+2.50σ')
        expect(formatMargin(3.14159)).toBe('+3.14σ')
    })

    test('formats negative margins without extra sign', () => {
        expect(formatMargin(-1.96)).toBe('-1.96σ')
        expect(formatMargin(-3.0)).toBe('-3.00σ')
    })

    test('formats zero correctly (no sign)', () => {
        expect(formatMargin(0)).toBe('0.00σ')
    })
})

describe('marginToConfidence', () => {
    test('converts 2σ to 97.72%', () => {
        expect(marginToConfidence(2)).toBeCloseTo(97.72, 1)
    })

    test('converts 3σ to 99.87%', () => {
        expect(marginToConfidence(3)).toBeCloseTo(99.87, 1)
    })

    test('converts -2σ to 2.28%', () => {
        expect(marginToConfidence(-2)).toBeCloseTo(2.28, 1)
    })
})
