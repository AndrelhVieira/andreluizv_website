'use client'

import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { useParams } from 'next/navigation'
import React, { useCallback, useRef, useState, type JSX } from 'react'
import { LuCircleCheck, LuLoaderCircle } from 'react-icons/lu'
import { trackEvent } from '../util/analytics'

export interface NewsletterFormProps {
  title?: string
  apiUrl?: string
}

type SubscribeError = 'invalid_email' | 'already_subscribed' | 'failed'
type SubscribeState =
  | { status: 'idle' | 'sending' }
  | { status: 'subscribed'; email: string }
  | { status: 'error'; error: SubscribeError }

const errorMessageKey: Record<SubscribeError, string> = {
  invalid_email: 'errorInvalid',
  already_subscribed: 'errorAlreadySubscribed',
  failed: 'errorFailed',
}

const NewsletterForm = ({ apiUrl = '/api/newsletter' }: NewsletterFormProps): JSX.Element => {
  const locale = useParams()?.locale as LocaleTypes
  const { t } = useTranslation(locale, 'newsletter')
  const inputEl = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<SubscribeState>({ status: 'idle' })
  const sending = state.status === 'sending'

  const subscribe = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      const email = inputEl.current?.value.trim()
      if (!email) {
        setState({ status: 'error', error: 'invalid_email' })
        return
      }

      setState({ status: 'sending' })
      try {
        const res = await fetch(apiUrl, {
          body: JSON.stringify({ email, locale }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        })
        const { error } = (await res.json()) as { error?: SubscribeError }
        if (error || !res.ok) {
          setState({ status: 'error', error: error ?? 'failed' })
          return
        }
        setState({ status: 'subscribed', email })
        trackEvent('sign_up', { method: 'newsletter', locale })
      } catch {
        setState({ status: 'error', error: 'failed' })
      }
    },
    [apiUrl, locale]
  )

  if (state.status === 'subscribed') {
    return (
      <div
        role="status"
        className="border-primary-500/40 bg-primary-500/5 flex w-72 gap-3 rounded-md border p-4 sm:w-96"
      >
        <LuCircleCheck className="text-primary-500 mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-100">{t('successTitle')}</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {t('successText', { email: state.email })}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="pb-1 text-lg font-semibold text-gray-800 dark:text-gray-100">
        {t('title')}
      </div>
      <form className="flex flex-col sm:flex-row" onSubmit={subscribe} aria-busy={sending}>
        <div>
          <label htmlFor="email-input">
            <span className="sr-only">{t('mail')}</span>
            <input
              autoComplete="email"
              className="focus:ring-primary-600 w-72 rounded-md px-4 focus:border-transparent focus:ring-2 focus:outline-none dark:bg-black"
              id="email-input"
              name="email"
              placeholder={t('placeholderDefault')}
              ref={inputEl}
              required
              type="email"
              disabled={sending}
              aria-invalid={state.status === 'error'}
              aria-describedby={state.status === 'error' ? 'newsletter-error' : undefined}
            />
          </label>
        </div>
        <div className="mt-2 flex w-full rounded-md shadow-sm sm:mt-0 sm:ml-3">
          <button
            className={`group bg-primary-500 dark:bg-primary-500 relative inline-flex items-center justify-center overflow-hidden rounded-md px-4 py-1.5 text-xs font-normal text-white transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 dark:hover:shadow-purple-500/30 ${sending ? 'cursor-wait' : ''}`}
            type="submit"
            disabled={sending}
          >
            <span className="relative z-50 flex items-center gap-2 text-lg text-white">
              {sending ? (
                <LuLoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              {sending ? t('sending') : t('buttonDefault')}
            </span>
            <div className="absolute inset-0 flex h-full w-full [transform:skew(-13deg)_translateX(-100%)] justify-center group-hover:[transform:skew(-13deg)_translateX(100%)] group-hover:duration-1000">
              <div className="relative h-full w-8 bg-white/20" />
            </div>
          </button>
        </div>
      </form>
      {state.status === 'error' ? (
        <div
          id="newsletter-error"
          role="alert"
          className="w-72 pt-2 text-sm text-red-500 sm:w-96 dark:text-red-400"
        >
          {t(errorMessageKey[state.error])}
        </div>
      ) : null}
    </div>
  )
}

export default NewsletterForm
