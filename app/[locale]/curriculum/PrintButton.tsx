'use client'

import { useParams } from 'next/navigation'
import { FiDownload } from 'react-icons/fi'
import { useTranslation } from '../i18n/client'
import type { LocaleTypes } from '../i18n/settings'

const PrintButton: React.FC = () => {
  const locale = useParams()?.locale as LocaleTypes
  const { t } = useTranslation(locale, 'curriculum')

  const handlePrint = () => {
    window.print()
  }

  return (
    <button
      // eslint-disable-next-line react/jsx-no-bind
      onClick={handlePrint}
      className={
        'bg-primary-500 hover:bg-primary-700 focus:ring-primary-600 dark:hover:bg-primary-400 mx-auto mt-12 flex max-w-96 cursor-pointer items-center gap-3 rounded-md px-4 py-2 font-medium text-white transition focus:ring-2 focus:ring-offset-2 dark:ring-offset-black'
      }
      id="invisible"
    >
      <FiDownload />
      {t('download_cv')}
    </button>
  )
}

export default PrintButton
