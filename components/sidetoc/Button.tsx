import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { useParams } from 'next/navigation'
import type { JSX } from 'react'
import { ArrowRightIcon } from './icon'
import useSidebarStore from './store'

const Button = (): JSX.Element => {
  const { sidebarOpen, toggleSidebar } = useSidebarStore()
  const locale = useParams()?.locale as LocaleTypes
  const { t } = useTranslation(locale, 'common')

  return (
    <div className="fixed bottom-8 left-6 z-50">
      <button
        onClick={toggleSidebar}
        aria-label={t('sidetoc')}
        aria-expanded={sidebarOpen}
        className="cursor-pointer rounded-full bg-gray-200 p-2 text-gray-500 opacity-100 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
      >
        <ArrowRightIcon
          className={`h-5 w-5 transform transition-transform ${sidebarOpen ? 'rotate-180' : ''}`}
        />
      </button>
    </div>
  )
}

export default Button
