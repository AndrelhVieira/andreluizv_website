'use client'

import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'

type CookieConsentPropsType = {
  params: { locale: LocaleTypes }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const CookieConsent = ({ params: { locale } }: CookieConsentPropsType) => {
  const [showConsent, setShowConsent] = useState(false)
  const { t } = useTranslation(locale, 'cookies')

  useEffect(() => {
    const consent = Cookies.get('cookie_consent')
    if (!consent) {
      setShowConsent(true)
    }
  }, [])

  const acceptCookies = () => {
    Cookies.set('cookie_consent', 'true', { expires: 365 })
    closeCookies()
  }

  const closeCookies = () => {
    setShowConsent(false)
  }

  return (
    showConsent && (
      <div className="bg-white-800 sticky right-5 bottom-5 left-5 z-50 rounded-xl border bg-white p-4 shadow-md md:fixed dark:border-none dark:bg-gray-800">
        <p className="text-2xl font-bold">{t('title')} 🍪</p>
        <p>{t('primary_text')}</p>
        <p className="mt-4 text-lg font-bold">{t('secondary_title')}</p>
        <p>{t('reason1')}</p>
        <p>{t('reason2')}</p>
        <p>{t('reason3')}</p>
        <p className="mt-2 mb-8">{t('advice')}</p>
        <div className="flex flex-col gap-5 md:flex-row">
          <button
            // eslint-disable-next-line react/jsx-no-bind
            onClick={acceptCookies}
            className={
              'border-primary-500 bg-primary-500 hover:bg-primary-700 focus:ring-primary-600 dark:hover:bg-primary-400 cursor-pointer rounded-md border-4 px-4 py-2 font-medium text-white transition focus:ring-2 focus:ring-offset-2 dark:ring-offset-black'
            }
            type="submit"
          >
            {t('accept_cookies_button')} 🍪
          </button>
          <button
            // eslint-disable-next-line react/jsx-no-bind
            onClick={closeCookies}
            className={
              'border-primary-500 text-primary-500 hover:bg-primary-700 focus:ring-primary-600 dark:hover:bg-primary-400 cursor-pointer rounded-md border-4 px-4 py-2 font-medium transition hover:text-white focus:ring-2 focus:ring-offset-2 dark:ring-offset-black dark:hover:text-white'
            }
            type="submit"
          >
            {t('close_cookies_button')}
          </button>
        </div>
      </div>
    )
  )
}

export default CookieConsent
