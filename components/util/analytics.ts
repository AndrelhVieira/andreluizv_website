type GtagParams = Record<string, string | number | boolean | undefined>

/**
 * Sends a GA4 event. No-op when gtag isn't loaded (no cookie consent, blocked, SSR).
 * Never pass personal data (name, email, message) in params.
 */
export const trackEvent = (eventName: string, params?: GtagParams): void => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return
  }

  window.gtag('event', eventName, params)
}
