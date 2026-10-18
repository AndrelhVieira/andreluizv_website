'use client'

import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import Cookies from 'js-cookie'
import { useState, type ReactElement } from 'react'

/** Forgets the cookie banner choice and reloads, so the banner asks again. */
export function CookieChoiceButton({ locale }: { locale: LocaleTypes }): ReactElement {
  const { t } = useTranslation(locale, 'privacy')
  const [done, setDone] = useState(false)

  const reset = (): void => {
    Cookies.remove('cookie_consent', { path: '/' })
    setDone(true)
    // A reload also unloads Google Analytics if it was running
    window.setTimeout(() => window.location.reload(), 800)
  }

  return (
    <div className="not-prose my-4">
      <button
        type="button"
        // eslint-disable-next-line react/jsx-no-bind
        onClick={reset}
        disabled={done}
        className="border-primary-500 text-primary-500 hover:bg-primary-500 rounded-md border-2 px-4 py-2 font-medium transition hover:text-white disabled:opacity-60"
      >
        {done ? t('rights.change_choice_done') : t('rights.change_choice')}
      </button>
    </div>
  )
}
