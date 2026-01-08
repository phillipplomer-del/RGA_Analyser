/**
 * Feature Flags - Simple URL-based feature gating
 *
 * Usage:
 * - Normal users see only RGA analysis (publicly known)
 * - Add ?dev=1 to URL to unlock all features
 * - Or set localStorage.setItem('devMode', '1')
 */

export function isDevMode(): boolean {
  // Check URL parameter
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    if (params.get('dev') === '1') {
      // Persist to localStorage so user doesn't need ?dev=1 every time
      localStorage.setItem('devMode', '1')
      return true
    }

    // Check localStorage
    if (localStorage.getItem('devMode') === '1') {
      return true
    }
  }

  return false
}

export function clearDevMode(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('devMode')
  }
}
