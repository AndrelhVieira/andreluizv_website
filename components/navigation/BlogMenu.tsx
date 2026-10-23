'use client'

import { TagIcon } from '@heroicons/react/20/solid'
import { DevicePhoneMobileIcon } from '@heroicons/react/24/outline'
import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { usePathname } from 'next/navigation'
import type { JSX } from 'react'
import { LuFileStack } from 'react-icons/lu'
import { PiClockClockwise } from 'react-icons/pi'
import { RiReactjsFill } from 'react-icons/ri'
import { useTagStore } from '../util/useTagStore'
import { NavPopover, type NavPopoverItem } from './NavPopover'

type MenuType = {
  name: string
  description: string
  href: string
  icon: React.ElementType
  tag?: 'mobile' | 'react'
}

type BlogMenuPropsType = {
  params: { locale: LocaleTypes }
}

export default function BlogMenu({ params: { locale } }: BlogMenuPropsType): JSX.Element {
  const { setSelectedTag } = useTagStore()
  const pathname = usePathname()
  const { t } = useTranslation(locale, 'common')

  const blog: MenuType[] = [
    {
      name: t('blog_menu.latest.label'),
      description: t('blog_menu.latest.description'),
      href: `/${locale}/blog/latest`,
      icon: PiClockClockwise,
    },
    {
      name: t('blog_menu.all_posts.label'),
      description: t('blog_menu.all_posts.description'),
      href: `/${locale}/blog`,
      icon: LuFileStack,
    },
    {
      name: t('blog_menu.all_tags.label'),
      description: t('blog_menu.all_tags.description'),
      href: `/${locale}/tags`,
      icon: TagIcon,
    },
    {
      name: t('blog_menu.react.label'),
      description: t('blog_menu.react.description'),
      href: `/${locale}/blog`,
      icon: RiReactjsFill,
      tag: 'react',
    },
    {
      name: t('blog_menu.mobile.label'),
      description: t('blog_menu.mobile.description'),
      href: `/${locale}/blog`,
      icon: DevicePhoneMobileIcon,
      tag: 'mobile',
    },
  ]

  const isSelected = pathname.includes('/blog')

  // "All posts" has no tag: clear the filter a React/Mobile shortcut left behind
  const items: NavPopoverItem[] = blog.map(({ tag, ...item }) =>
    item.href === `/${locale}/blog` ? { ...item, onSelect: () => setSelectedTag(tag ?? '') } : item
  )

  return (
    <NavPopover
      label="Blog"
      items={items}
      isSelected={isSelected}
      className="hidden md:block"
      panelClassName="left-1/2 w-screen max-w-5xl -translate-x-1/2"
    />
  )
}
