import type { InitOptions } from 'i18next'
import { fallbackLng, secondLng, thirdLng } from './locales'

export const locales = [fallbackLng, secondLng, thirdLng] as const
export type LocaleTypes = (typeof locales)[number]
export const defaultNS = 'common'

export function getOptions(locale = fallbackLng, ns = defaultNS): InitOptions {
  return {
    debug: false,
    supportedLngs: locales,
    fallbackLng,
    lng: locale,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  }
}
