'use client'

import { trackEvent } from '@/components/util/analytics'
import Cookies from 'js-cookie'
import { adsenseClient } from 'lib/ads'
import Script from 'next/script'
import { useEffect, useRef, useState, type ReactElement } from 'react'

type AdQueue = Array<Record<string, never>> & { requestNonPersonalizedAds?: 0 | 1 }

declare global {
  interface Window {
    adsbygoogle?: AdQueue
  }
}

interface AdSlotProps {
  /** Ad unit id from the AdSense dashboard */
  slot: string
  /** "Advertisement", shown above the ad as AdSense policy asks */
  label: string
}

/** Starts loading this far before the slot scrolls into view */
const LOAD_MARGIN = '600px 0px'

/**
 * One AdSense unit. Renders nothing until AdSense is configured. The space is reserved up
 * front so the ad doesn't push the text around, the unit is only requested near the
 * viewport, and ads stay non-personalized unless the visitor accepted cookies (Google's own
 * consent message handles the EEA, UK and Switzerland on top of that).
 */
export function AdSlot({ slot, label }: AdSlotProps): ReactElement | null {
  const client = adsenseClient()
  const containerRef = useRef<HTMLDivElement>(null)
  const [nearViewport, setNearViewport] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNearViewport(true)
          observer.disconnect()
        }
      },
      { rootMargin: LOAD_MARGIN }
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!nearViewport) return
    // Set on the queue before adsbygoogle.js loads (it is only added below once the slot is
    // near the viewport): the script reads the flag from the queue it takes over
    const queue: AdQueue = (window.adsbygoogle = window.adsbygoogle || [])
    queue.requestNonPersonalizedAds = Cookies.get('cookie_consent') === 'true' ? 0 : 1
    try {
      queue.push({})
      trackEvent('ad_slot_view', { slot })
    } catch {
      // Ad blockers and AdSense's own errors must never break the post
    }
  }, [nearViewport, slot])

  if (!client || !slot) {
    return null
  }

  return (
    <aside aria-label={label} className="not-prose my-10 has-[ins[data-ad-status=unfilled]]:hidden">
      <p className="mb-1 text-center text-xs tracking-wide text-gray-400 uppercase">{label}</p>
      <div ref={containerRef} className="min-h-[280px]">
        {nearViewport ? (
          <ins
            className="adsbygoogle block"
            data-ad-client={client}
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
            // Test ads outside production, so local clicks never count as invalid traffic
            data-adtest={process.env.NODE_ENV === 'production' ? undefined : 'on'}
          />
        ) : null}
      </div>
      {/* Readers who never scroll this far never download AdSense */}
      {nearViewport ? (
        <Script
          id="adsbygoogle-js"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
      ) : null}
    </aside>
  )
}
