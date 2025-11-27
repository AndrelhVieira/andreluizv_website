'use client'

import { Popover, Transition } from '@headlessui/react'
import { ChevronDownIcon, TagIcon } from '@heroicons/react/20/solid'
import { DevicePhoneMobileIcon } from '@heroicons/react/24/outline'
import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { usePathname } from 'next/navigation'
import type { JSX } from 'react'
// eslint-disable-next-line no-duplicate-imports
import { Fragment, useEffect, useRef } from 'react'
import { LuFileStack } from 'react-icons/lu'
import { PiClockClockwise } from 'react-icons/pi'
import { RiReactjsFill } from 'react-icons/ri'
import CustomLink from '../mdxcomponents/Link'
import { useTagStore } from '../util/useTagStore'

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

  const handleClick = (close: () => void, item: MenuType) => {
    if (item.href === `/${locale}/blog`) {
      if (item.tag) {
        setSelectedTag(item.tag)
      }
    }
    close()
  }

  const popoverPanelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverPanelRef.current && !popoverPanelRef.current.contains(event.target as Node)) {
        const popover = document.querySelector('[data-headlessui-popover-button]') as HTMLElement
        if (popover) popover.click()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const isSelected = pathname.includes('/blog')

  return (
    <Popover className="relative hidden outline-none md:block">
      {({ open, close }) => (
        <>
          <Popover.Button
            className={`inline-flex cursor-pointer items-center gap-x-1 leading-6 font-medium text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 ${isSelected && 'text-primary-500'}`}
          >
            <p>Blog</p>
            <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
          </Popover.Button>

          <Transition
            as={Fragment}
            show={open}
            enter="transition-all ease-out duration-300"
            enterFrom="opacity-0 scale-95 translate-y-[-10px]"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="transition-all ease-in duration-200"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-[10px]"
          >
            <Popover.Panel
              ref={popoverPanelRef}
              className="absolute left-1/2 z-10 mt-5 flex w-screen max-w-5xl -translate-x-1/2 px-4 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[enter]:ease-out data-[leave]:duration-150 data-[leave]:ease-in"
            >
              <div className="flex-auto overflow-hidden rounded-3xl bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5 dark:bg-gray-800">
                <div className="p-4">
                  {blog.map((item) => (
                    <div
                      key={item.name}
                      className="group relative flex gap-x-6 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-500"
                    >
                      <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white dark:bg-gray-600 dark:group-hover:bg-gray-800">
                        <item.icon
                          className="group-hover:text-primary-600 h-6 w-6 text-gray-600 dark:text-white"
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <CustomLink
                          href={item.href}
                          className="font-semibold text-gray-900 dark:text-white"
                          // eslint-disable-next-line react/jsx-no-bind
                          onClick={() => handleClick(close, item)}
                        >
                          {item.name}
                          <span className="absolute inset-0" />
                        </CustomLink>
                        <p className="mt-1 text-gray-600 dark:text-white">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
