'use client'

import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Fragment, type ElementType, type ReactElement } from 'react'
import CustomLink from '../mdxcomponents/Link'

export type NavPopoverItem = {
  name: string
  description: string
  href: string
  icon: ElementType
  onSelect?: () => void
}

type NavPopoverProps = {
  label: string
  items: NavPopoverItem[]
  isSelected: boolean
  className?: string
  /** Positions and sizes the panel under its button */
  panelClassName: string
}

/** Header dropdown with an icon, a title and a description per entry (Blog, About me) */
export function NavPopover({
  label,
  items,
  isSelected,
  className = '',
  panelClassName,
}: NavPopoverProps): ReactElement {
  return (
    <Popover className={`relative outline-none ${className}`}>
      {({ open }) => (
        <>
          <PopoverButton
            className={`inline-flex cursor-pointer items-center gap-x-1 leading-6 font-medium outline-none ${
              isSelected
                ? 'text-primary-500'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <span>{label}</span>
            <ChevronDownIcon
              className={`h-5 w-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </PopoverButton>

          <Transition
            as={Fragment}
            enter="transition-all ease-out duration-300"
            enterFrom="opacity-0 scale-95 translate-y-[-10px]"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="transition-all ease-in duration-200"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-[10px]"
          >
            <PopoverPanel className={`absolute z-50 mt-5 flex px-4 ${panelClassName}`}>
              {({ close }) => (
                <div className="flex-auto overflow-hidden rounded-3xl bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5 dark:bg-gray-800">
                  <div className="p-4">
                    {items.map((item) => (
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
                            onClick={() => {
                              item.onSelect?.()
                              close()
                            }}
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
              )}
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
