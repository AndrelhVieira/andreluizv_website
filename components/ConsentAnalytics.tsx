'use client'

import siteMetadata from '@/data/siteMetadata'
import Cookies from 'js-cookie'
import { Analytics, type AnalyticsConfig } from 'pliny/analytics'
import { useEffect, useState, type JSX } from 'react'

/**
 * Renders analytics scripts only after the user has accepted cookies.
 * This keeps third-party (Google Analytics) JavaScript off the initial load
 * until consent is given, and makes the cookie banner functional instead of
 * decorative.
 */
export default function ConsentAnalytics(): JSX.Element | null {
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    if (Cookies.get('cookie_consent') === 'true') {
      setHasConsent(true)
      return
    }
    const onAccept = (): void => setHasConsent(true)
    window.addEventListener('cookie-consent-accepted', onAccept)
    return () => window.removeEventListener('cookie-consent-accepted', onAccept)
  }, [])

  if (!hasConsent) {
    return null
  }

  return <Analytics analyticsConfig={siteMetadata.analytics as AnalyticsConfig} />
}
