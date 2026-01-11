/**
 * Shared helper functions for all detectors
 */

import type { EvidenceItem } from './types'

/**
 * Get peak value with fallback to 0
 */
export function getPeak(peaks: Record<number, number>, mass: number): number {
  return peaks[mass] || 0
}

/**
 * Create evidence item for detector results
 */
export function createEvidence(
  type: EvidenceItem['type'],
  description: string,
  descriptionEn: string,
  passed: boolean,
  value?: number,
  expected?: { min?: number; max?: number; exact?: number }
): EvidenceItem {
  return { type, description, descriptionEn, passed, value, expected }
}
