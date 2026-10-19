'use client'

import i18next, { type i18n } from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import resourcesToBackend from 'i18next-resources-to-backend'
import { useEffect, useState } from 'react'
import { initReactI18next, useTranslation as useTransAlias } from 'react-i18next'
import { fallbackLng } from './locales'
import { type LocaleTypes, getOptions, locales } from './settings'

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
  'privacy',
  'projects',
  'SEO',
]

const serverInstances = new Map<LocaleTypes, i18n>()

type Resources = Record<string, Record<string, unknown>>

/**
 * One instance per language for server rendering (SSR of client components). The shared
 * client instance must not be used there: concurrent renders in different languages kept
 * switching its language mid-render. Resources are passed in already loaded and init is
 * synchronous: with an async backend, a render that arrived before the load finished made
 * react-i18next suspend and resolve again in a microtask loop that starved the load itself,
 * freezing the whole Node process (every 404 probe from scanners hit this in production).
 */
function serverInstance(lng: LocaleTypes, resources: Resources): i18n {
  let instance = serverInstances.get(lng)
  if (!instance) {
    instance = i18next.createInstance()
    void instance.use(initReactI18next).init({
      ...getOptions(lng),
      ns: NAMESPACES,
      resources: { [lng]: resources },
      initAsync: false,
    })
    serverInstances.set(lng, instance)
  }
  return instance
}

export function useTranslation(lng: LocaleTypes, ns: string): ReturnType<typeof useTransAlias> {
  const locale = locales.includes(lng) ? lng : fallbackLng
  // Inline `typeof window` so Next drops this branch, and the JSON it requires, from the client bundle
  if (typeof window === 'undefined') {
    const resources: Resources = {}
    if (!serverInstances.has(locale)) {
      for (const namespace of NAMESPACES) {
        // Synchronous on purpose: see serverInstance()
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        resources[namespace] = require(`./locales/${locale}/${namespace}.json`)
      }
    }
    // Never mutated after init, so `t` can't pick up another request's language
    return useTransAlias(ns, { i18n: serverInstance(locale, resources), lng: locale })
  }
  // A fixed lng keeps t on the route's language (matches the server-rendered HTML)
  const translator = useTransAlias(ns, { lng: locale })
  useCustomTranslationImplem(translator.i18n, locale)
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
