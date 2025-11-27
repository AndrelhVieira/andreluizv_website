'use client'

import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Radio,
  RadioGroup,
  Transition,
} from '@headlessui/react'
import { useTranslation } from 'app/[locale]/i18n/client'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { allAuthors } from 'contentlayer/generated'

import { useParams, usePathname } from 'next/navigation'
import { useCallback, useMemo, useRef, useState, type JSX } from 'react'
import CustomLink from '../mdxcomponents/Link'
import { useOuterClick } from '../util/useOuterClick'

type AuthorsMenuProps = {
  className: string
}

type MenuOptions = Array<{
  key: string
  title: string
  href: string
}>

const AuthorsMenu = ({ className }: AuthorsMenuProps): JSX.Element => {
  const locale = useParams()?.locale as LocaleTypes
  const { t } = useTranslation(locale, 'common')
  const pathname = usePathname()
  const sections = pathname.split('/')
  const lastSection = sections[sections.length - 1]
  const filterSections = pathname !== `/${locale}` && pathname !== '/'

  const MENU_OPTIONS: MenuOptions = [
    { key: 'about', title: t('about'), href: `/${locale}/about/andrevieira` },
    { key: 'skills', title: 'Skills', href: `/${locale}/skills` },
    { key: 'contact', title: t('contact'), href: `/${locale}/contact` },
    { key: 'curriculum', title: 'Curriculum', href: `/${locale}/curriculum` },
    { key: 'bragDocument', title: 'Brag Document', href: `/${locale}/bragDocument` },
  ]

  const authors = useMemo(
    () =>
      allAuthors
        .filter((a) => a.language === locale)
        .sort((a, b) => (a.default === b.default ? 0 : a.default ? -1 : 1)),
    [locale]
  )

  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = useCallback(() => {
    setIsOpen(!isOpen)
  }, [isOpen])

  const closeMenu = () => {
    setIsOpen(false)
  }

  const menubarRef = useRef<HTMLDivElement>(null)
  useOuterClick(menubarRef, closeMenu)

  const isSelected = authors.some((author) => author.slug.includes(lastSection)) && filterSections

  const renderMenuItems = (menu: MenuOptions[number]) => {
    return (
      <Radio value={menu.key}>
        <MenuItem>
          {({ focus }) => (
            <div
              className={`${
                focus ? 'bg-gray-100 dark:bg-gray-600' : 'hover:bg-gray-100 dark:hover:bg-gray-600'
              } group hover:text-primary-500 dark:hover:text-primary-500 flex w-full cursor-pointer items-center rounded-md px-2 py-2 text-sm`}
            >
              <CustomLink href={menu.href} onClick={useCallback(() => closeMenu(), [closeMenu])}>
                {menu.title}
              </CustomLink>
            </div>
          )}
        </MenuItem>
      </Radio>
    )
  }

  return (
    <div ref={menubarRef} className={className}>
      <Menu as="div" className="relative inline-block text-left leading-5 font-medium">
        <div>
          <MenuButton
            className="flex transform-gpu cursor-pointer items-center space-x-1 transition-transform duration-300"
            onClick={useCallback(() => toggleMenu(), [toggleMenu])}
          >
            <div
              className={`hidden font-medium ${
                isSelected
                  ? 'text-primary-500'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
              } relative rounded-md px-2 py-1 font-medium transition-colors sm:block`}
            >
              <span className="relative z-10">{t('about')}</span>
            </div>
          </MenuButton>
        </div>
        <Transition
          show={isOpen}
          enter="transition-all ease-out duration-300"
          enterFrom="opacity-0 scale-95 translate-y-[-10px]"
          enterTo="opacity-100 scale-100 translate-y-0"
          leave="transition-all ease-in duration-200"
          leaveFrom="opacity-100 scale-100 translate-y-0"
          leaveTo="opacity-0 scale-95 translate-y-[10px]"
        >
          <div>
            <MenuItems
              className="ring-opacity-5 absolute right-0 z-50 mt-2 w-40 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black focus:outline-none dark:bg-gray-800"
              as="div"
            >
              <RadioGroup>
                <div className="p-1">{MENU_OPTIONS.map((menu) => renderMenuItems(menu))}</div>
              </RadioGroup>
            </MenuItems>
          </div>
        </Transition>
      </Menu>
    </div>
  )
}

export default AuthorsMenu
