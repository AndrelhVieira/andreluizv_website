'use client'

import CustomLink from '@/components/mdxcomponents/Link'
import type { LinkProps } from 'next/link'
import { useCallback, type AnchorHTMLAttributes, type JSX, type MouseEvent } from 'react'
import { trackEvent } from './analytics'

type TrackedLinkProps = LinkProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    eventName: string
    eventParams?: Record<string, string | number | boolean | undefined>
  }

/**
 * CustomLink that sends a GA4 event on click. Lets server components track CTA clicks.
 */
const TrackedLink = ({
  eventName,
  eventParams,
  onClick,
  ...rest
}: TrackedLinkProps): JSX.Element => {
  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      trackEvent(eventName, eventParams)
      onClick?.(e)
    },
    [eventName, eventParams, onClick]
  )

  return <CustomLink {...rest} onClick={handleClick} />
}

export default TrackedLink
