/**
 * Statistical Functions for Uncertainty Analysis
 * 
 * Implements Normal Distribution CDF and related functions
 * for limit comparison and confidence interval calculations.
 * 
 * Reference: JCGM 106:2012 (ISO/IEC Guide 98-4)
 * Method: Zelen & Severo approximation (Abramowitz & Stegun, 1964)
 */

/**
 * Normal Distribution Cumulative Distribution Function (CDF)
 * 
 * Uses Zelen & Severo approximation with error < 7.5e-8
 * 
 * @param x - Z-score (standardized value)
 * @returns Probability P(Z <= x) for standard normal distribution
 * 
 * Reference: Abramowitz & Stegun, "Handbook of Mathematical Functions" (1964)
 * Validated: Stanford CS109, Probability Course
 * 
 * @example
 * normalCDF(0)    // 0.5    (50% probability)
 * normalCDF(1.96) // 0.975  (95% CI upper bound)
 * normalCDF(2)    // 0.9772 (2σ)
 * normalCDF(3)    // 0.9987 (3σ)
 */
export function normalCDF(x: number): number {
    // Zelen & Severo Approximation coefficients
    const a1 = 0.254829592
    const a2 = -0.284496736
    const a3 = 1.421413741
    const a4 = -1.453152027
    const a5 = 1.061405429
    const p = 0.3275911

    const sign = x < 0 ? -1 : 1
    const absX = Math.abs(x) / Math.sqrt(2)

    const t = 1.0 / (1.0 + p * absX)
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX)

    return 0.5 * (1.0 + sign * y)
}

/**
 * Inverse Normal CDF (Quantile function)
 * 
 * Returns Z-score for common confidence levels.
 * For general use, this is a lookup table implementation.
 * 
 * @param p - Probability (0 < p < 1)
 * @returns Z-score such that P(Z <= z) = p
 * 
 * @example
 * normalQuantile(0.025)  // -1.96  (2σ lower, 95% CI)
 * normalQuantile(0.975)  //  1.96  (2σ upper, 95% CI)
 * normalQuantile(0.0013) // -3.0   (3σ lower)
 * normalQuantile(0.9987) //  3.0   (3σ upper)
 */
export function normalQuantile(p: number): number {
    if (p <= 0 || p >= 1) {
        throw new Error('Probability must be between 0 and 1')
    }

    // Common confidence level lookup table
    const lookupTable: { [key: number]: number } = {
        0.0013: -3.0,    // 3σ lower
        0.0228: -2.0,    // 2σ lower
        0.025: -1.96,   // 95% CI lower
        0.05: -1.645,  // 90% CI lower
        0.1587: -1.0,    // 1σ lower
        0.5: 0.0,    // median
        0.8413: 1.0,    // 1σ upper
        0.95: 1.645,  // 90% CI upper
        0.975: 1.96,   // 95% CI upper
        0.9772: 2.0,    // 2σ upper
        0.9987: 3.0     // 3σ upper
    }

    // Find closest match (within 0.0001)
    for (const [prob, zScore] of Object.entries(lookupTable)) {
        if (Math.abs(p - Number(prob)) < 0.0001) {
            return zScore
        }
    }

    // For general approximation, use Beasley-Springer-Moro algorithm
    // This is a simplified version for p in [0.001, 0.999]
    const c0 = 2.515517
    const c1 = 0.802853
    const c2 = 0.010328
    const d1 = 1.432788
    const d2 = 0.189269
    const d3 = 0.001308

    // Transform to standard algorithm range
    const q = p < 0.5 ? p : 1 - p
    const t = Math.sqrt(-2 * Math.log(q))
    const z = t - ((c2 * t + c1) * t + c0) / (((d3 * t + d2) * t + d1) * t + 1)

    return p < 0.5 ? -z : z
}

/**
 * Calculate confidence level from margin (in σ)
 * 
 * @param margin - Number of standard deviations from limit
 * @returns Confidence level as percentage (0-100)
 * 
 * @example
 * marginToConfidence(2)   // 97.72  (2σ)
 * marginToConfidence(3)   // 99.87  (3σ)
 * marginToConfidence(-2)  // 2.28   (2σ below, probability of exceedance)
 */
export function marginToConfidence(margin: number): number {
    const probability = normalCDF(margin)
    return probability * 100
}
