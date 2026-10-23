'use client'

import { DocumentTextIcon, TrophyIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { useParams, usePathname } from 'next/navigation'
import type { ReactElement } from 'react'
import { NavPopover, type NavPopoverItem } from './NavPopover'

const SECTIONS = ['/about', '/curriculum', '/bragDocument']

export default function AboutMenu({ className }: { className: string }): ReactElement {
  const locale = useParams()?.locale as LocaleTypes
  const { t } = useTranslation(locale, 'common')
  const pathname = usePathname()

  const items: NavPopoverItem[] = [
    {
      name: t('about'),
      description: t('about_menu.about.description'),
      href: `/${locale}/about/andrevieira`,
      icon: UserCircleIcon,
    },
    {
      name: t('about_menu.curriculum.label'),
      description: t('about_menu.curriculum.description'),
      href: `/${locale}/curriculum`,
      icon: DocumentTextIcon,
    },
    {
      name: t('about_menu.brag_document.label'),
      description: t('about_menu.brag_document.description'),
      href: `/${locale}/bragDocument`,
      icon: TrophyIcon,
    },
  ]

  return (
    <NavPopover
      label={t('about')}
      items={items}
      isSelected={SECTIONS.some((section) => pathname.includes(section))}
      className={className}
      panelClassName="right-0 w-screen max-w-md"
    />
  )
}
