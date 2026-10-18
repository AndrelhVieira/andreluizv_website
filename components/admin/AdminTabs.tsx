'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactElement } from 'react'

const TABS = [
  // The post list is /admin; the editor pages belong to the same tab
  { href: '/admin', label: 'Posts', matches: ['/admin/posts', '/admin/new'] },
  { href: '/admin/schedule', label: 'Cronograma', matches: ['/admin/schedule'] },
]

function isActive(pathname: string, tab: (typeof TABS)[number]): boolean {
  return (
    pathname === tab.href ||
    tab.matches.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  )
}

export function AdminTabs(): ReactElement {
  const pathname = usePathname()
  return (
    <nav aria-label="Seções do painel" className="flex gap-1">
      {TABS.map((tab) => {
        const active = isActive(pathname, tab)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              active
                ? 'bg-primary-500 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
