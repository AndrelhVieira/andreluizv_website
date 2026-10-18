'use client'

import { Analytics, type BeforeSendEvent } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { JSX } from 'react'

/** Keeps campaign tags (utm_*) and drops any other query parameter before it is sent. */
const keepOnlyCampaignParams = (event: BeforeSendEvent): BeforeSendEvent => {
  const url = new URL(event.url)
  for (const key of [...url.searchParams.keys()]) {
    if (!key.startsWith('utm_')) {
      url.searchParams.delete(key)
    }
  }
  return { ...event, url: url.toString() }
}

/**
 * Vercel Web Analytics and Speed Insights. Both are cookieless and keep no personal data, so
 * unlike Google Analytics they load for every visitor, without waiting for cookie consent:
 * they give the full visit count that GA (consent-gated) undercounts.
 */
export default function VercelInsights(): JSX.Element {
  return (
    <>
      <Analytics beforeSend={keepOnlyCampaignParams} />
      <SpeedInsights />
    </>
  )
}
