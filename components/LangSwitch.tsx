/* eslint-disable no-duplicate-imports */
import { useTagStore } from '@/components/util/useTagStore'
import { Menu, RadioGroup, Transition } from '@headlessui/react'
import type { LocaleTypes } from 'app/[locale]/i18n/settings'
import { locales } from 'app/[locale]/i18n/settings'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import renderLocaleFlags from './util/renderLocaleFlags'
import { useOuterClick } from './util/useOuterClick'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const ChevronDownIcon = ({ className }: { className: string }) => {
  return (
    <svg
      className={`${className} transition-transform duration-300`}
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 15 15"
    >
      <path
        fill="#3b82f6"
        fillRule="evenodd"
        d="M3.135 6.158a.5.5 0 0 1 .707-.023L7.5 9.565l3.658-3.43a.5.5 0 0 1 .684.73l-4 3.75a.5.5 0 0 1-.684 0l-4-3.75a.5.5 0 0 1-.023-.707"
        clipRule="evenodd"
      />
    </svg>
  )
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const LangSwitch = () => {
  const pathname = usePathname()
  const params = useParams()
  const locale = (params.locale as string) || ''
  const router = useRouter()
  const setSelectedTag = useTagStore((state) => state.setSelectedTag)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menubarRef = useRef<HTMLDivElement>(null)
  useOuterClick(menubarRef, () => setIsMenuOpen(false))

  const handleLocaleChange = (newLocale: string): string => {
    const segments = pathname.split('/')
    const localeIndex = segments.findIndex((segment) => locales.includes(segment as LocaleTypes))
    if (localeIndex !== -1) {
      segments[localeIndex] = newLocale
    } else {
      segments.splice(1, 0, newLocale)
    }
    // Remove trailing slash if it exists
    const newPath = segments.join('/').replace(/\/$/, '')
    return newPath
  }

  const handleLinkClick = (newLocale: string) => {
    setSelectedTag('')
    const resolvedUrl = handleLocaleChange(newLocale)
    router.push(resolvedUrl)
    setIsMenuOpen(false)
  }

  return (
    <div ref={menubarRef} className="relative inline-block cursor-pointer text-left">
      <Menu>
        {({ open }) => (
          <>
            <Menu.Button
              className="inline-flex w-full justify-center rounded-md px-1 py-2 text-sm leading-5 font-bold text-gray-700 shadow-sm dark:text-white"
              aria-haspopup="true"
              aria-expanded={open}
              // eslint-disable-next-line react/jsx-no-bind
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {renderLocaleFlags(locale)} {locale.charAt(0).toUpperCase() + locale.slice(1)}
              <ChevronDownIcon
                className={`mt-1 ml-1 transform ${open ? 'rotate-180' : 'rotate-0'}`}
              />
            </Menu.Button>
            <Transition
              show={open}
              enter="transition-all ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-[-10px]"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="transition-all ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-[10px]"
            >
              <Menu.Items
                className="ring-opacity-5 absolute right-0 z-50 mt-2 w-24 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black focus:outline-none dark:bg-gray-800"
                aria-orientation="vertical"
                // eslint-disable-next-line react/jsx-no-bind
                onBlur={() => setIsMenuOpen(false)}
              >
                <RadioGroup>
                  <div
                    className="py-1"
                    role="none"
                    style={{
                      listStyle: 'none',
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    {locales.map((newLocale: string) => (
                      <RadioGroup.Option key={newLocale} value={newLocale}>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              // eslint-disable-next-line react/jsx-no-bind
                              onClick={() => handleLinkClick(newLocale)}
                              className={`${
                                active
                                  ? 'bg-gray-100 dark:bg-gray-600'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                              } hover:text-primary-500 dark:hover:text-primary-500 rounded-md px-4 py-2 text-sm text-gray-700 dark:text-white`}
                              role="menuitem"
                              style={{
                                display: 'flex',
                                width: '100%',
                                textDecoration: 'none',
                              }}
                            >
                              {renderLocaleFlags(newLocale)}{' '}
                              {newLocale.charAt(0).toUpperCase() + newLocale.slice(1)}
                            </button>
                          )}
                        </Menu.Item>
                      </RadioGroup.Option>
                    ))}
                  </div>
                </RadioGroup>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </div>
  )
}

export default LangSwitch
