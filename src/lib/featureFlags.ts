/**
 * Feature Flags - Simple URL-based feature gating
 *
 * Usage:
 * - Normal users see only RGA analysis (publicly known)
 * - Add ?dev=1 to URL to unlock all features (persists in localStorage)
 * - Add ?dev=0 to URL to disable dev mode (clears localStorage)
 * - Or manually: localStorage.setItem('devMode', '1')
 */

export function isDevMode(): boolean {
  // Check URL parameter
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)

    // ?dev=1 enables dev mode and persists it
    if (params.get('dev') === '1') {
      localStorage.setItem('devMode', '1')
      return true
    }

    // ?dev=0 disables dev mode
    if (params.get('dev') === '0') {
      localStorage.removeItem('devMode')
      return false
    }

    // Check localStorage (if no URL parameter)
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
