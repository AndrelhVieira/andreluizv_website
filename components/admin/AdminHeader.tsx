import { signOutAction } from 'app/admin/actions'
import Link from 'next/link'
import type { ReactElement } from 'react'
import { AdminTabs } from './AdminTabs'

export function AdminHeader({ name }: { name: string }): ReactElement {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/admin" className="font-bold">
          Painel do blog
        </Link>
        <AdminTabs />
      </div>
      <div className="flex items-center gap-4 text-sm">
        <a href="/" target="_blank" rel="noreferrer" className="text-gray-500 hover:underline">
          Ver site ↗
        </a>
        <span className="text-gray-500">{name}</span>
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded border border-gray-300 px-2 py-1 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Sair
          </button>
        </form>
      </div>
    </header>
  )
}
