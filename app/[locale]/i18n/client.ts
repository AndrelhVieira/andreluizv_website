'use client'

import i18next, { type i18n } from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import resourcesToBackend from 'i18next-resources-to-backend'
import { useEffect, useState } from 'react'
import { initReactI18next, useTranslation as useTransAlias } from 'react-i18next'
import { type LocaleTypes, getOptions } from './settings'

const runsOnServerSide = typeof window === 'undefined'

// Initialize i18next for the client side
i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(
    resourcesToBackend(
      (language: LocaleTypes, namespace: string) =>
        import(`./locales/${language}/${namespace}.json`)
    )
  )
  .init({
    ...getOptions(),
    lng: undefined, // detect the language on the client
    detection: {
      order: ['path', 'htmlTag'],
    },
    // The server renders with serverInstance() instead; this one only runs in the browser
    preload: [],
  })

/** Every file in ./locales/{lng}/; the server preloads them all */
const NAMESPACES = [
  '404',
  'about',
  'common',
  'contact',
  'cookies',
  'curriculum',
  'footer',
  'freelancing',
  'home',
  'newsletter',
  'projects',
  'SEO',
  'skills',
]

const serverInstances = new Map<LocaleTypes, i18n>()

/**
 * One instance per language for server rendering (SSR of client components). The shared
 * client instance must not be used there: concurrent renders in different languages kept
 * switching its language mid-render, and react-i18next's "not ready yet" retry for a
 * pinned `lng` could then spin forever in microtasks, freezing the whole Node process.
 */
function serverInstance(lng: LocaleTypes): i18n {
  let instance = serverInstances.get(lng)
  if (!instance) {
    instance = i18next.createInstance()
    void instance
      .use(initReactI18next)
      .use(
        resourcesToBackend(
          (language: LocaleTypes, namespace: string) =>
            import(`./locales/${language}/${namespace}.json`)
        )
      )
      .init({ ...getOptions(lng), ns: NAMESPACES, preload: [lng] })
    serverInstances.set(lng, instance)
  }
  return instance
}

export function useTranslation(lng: LocaleTypes, ns: string): ReturnType<typeof useTransAlias> {
  if (runsOnServerSide) {
    // Never mutated after init, so `t` can't pick up another request's language
    return useTransAlias(ns, { i18n: serverInstance(lng), lng })
  }
  // A fixed lng keeps t on the route's language (matches the server-rendered HTML)
  const translator = useTransAlias(ns, { lng })
  useCustomTranslationImplem(translator.i18n, lng)
  return translator
}

function useCustomTranslationImplem(i18n: i18n, lng: LocaleTypes) {
  const [activeLng, setActiveLng] = useState(i18n.resolvedLanguage)

  // This effect updates the active language state variable when the resolved language changes,
  useEffect(() => {
    if (activeLng === i18n.resolvedLanguage) return
    setActiveLng(i18n.resolvedLanguage)
  }, [activeLng, i18n.resolvedLanguage])

  // This effect changes the language of the application when the lng prop changes.
  useEffect(() => {
    if (!lng || i18n.resolvedLanguage === lng) return
    i18n.changeLanguage(lng)
  }, [lng, i18n])
}
