import { locales, type LocaleTypes } from 'app/[locale]/i18n/settings'
import { NextResponse, type NextRequest } from 'next/server'

const BUTTONDOWN_SUBSCRIBERS_URL = 'https://api.buttondown.com/v1/subscribers'

function isLocale(value: unknown): value is LocaleTypes {
  return locales.includes(value as LocaleTypes)
}

async function createSubscriber(email: string, tags: string[]): Promise<Response> {
  return fetch(BUTTONDOWN_SUBSCRIBERS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Token ${process.env.BUTTONDOWN_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email_address: email, tags }),
  })
}

/**
 * Subscribes to the Buttondown newsletter, tagging the subscriber with the site language
 * so emails can be sent (or worded) per language. Tags are a paid Buttondown add-on: when
 * the plan refuses them (403), the subscriber is still created, just without the tag.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const { email, locale } = (await request.json().catch(() => ({}))) as {
    email?: unknown
    locale?: unknown
  }
  if (typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  let response = await createSubscriber(email, isLocale(locale) ? [locale] : [])
  if (response.status === 403) {
    response = await createSubscriber(email, [])
  }

  if (!response.ok) {
    return NextResponse.json({ error: 'Subscription failed' }, { status: response.status })
  }
  return NextResponse.json({ message: 'Successfully subscribed to the newsletter' })
}
