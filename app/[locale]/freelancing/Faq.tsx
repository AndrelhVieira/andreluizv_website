'use client'

import type { JSX } from 'react'
import { useTranslation } from '../i18n/client'
import type { LocaleTypes } from '../i18n/settings'

const Faq = ({ locale }: { locale: LocaleTypes }): JSX.Element => {
  const { t } = useTranslation(locale, 'freelancing')
  const questions = t('faq_section.questions', {
    returnObjects: true,
  }) as { title: string; text: string }[]

  return (
    <div className="min-h-sceen mx-autobg-white px-5" id="faq">
      <div className="flex flex-col items-center">
        <h2 className="mt-5 text-5xl font-bold tracking-tight">FAQ</h2>
        <p className="mt-3 text-xl text-gray-600 dark:text-gray-300">Perguntas Frequentes</p>
      </div>
      <div className="mx-auto mt-8 grid divide-y divide-neutral-200">
        {questions.map((item) => (
          <div className="py-5" key={item.title.split(' ').join('_').toLowerCase()}>
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                <span>{item.title}</span>
                <span className="transition-transform duration-1000 group-open:rotate-180">
                  <svg
                    fill="none"
                    height="24"
                    shapeRendering="geometricPrecision"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    width="24"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 text-gray-600 opacity-0 transition-opacity duration-500 ease-in-out group-open:opacity-100 dark:text-gray-300">
                {item.text}
              </p>
            </details>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Faq
