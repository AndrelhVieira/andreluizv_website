import { getSession } from 'lib/admin/session'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { ReactElement } from 'react'

export const metadata: Metadata = { title: 'Entrar' }

interface PageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: PageProps): Promise<ReactElement> {
  if (await getSession()) {
    redirect('/admin')
  }
  const { error } = await searchParams
  const deniedSub = (await cookies()).get('admin_denied_sub')?.value

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-4">
      <h1 className="text-3xl font-extrabold tracking-tight">Painel do blog</h1>

      {deniedSub ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
          <p className="font-semibold">Esta conta da Vercel não tem acesso ao painel.</p>
          <p className="mt-2">
            Se a conta é sua, adicione este ID em <code>ADMIN_VERCEL_USER_IDS</code> e faça um novo
            deploy:
          </p>
          <code className="mt-2 block rounded bg-amber-100 px-2 py-1 break-all dark:bg-amber-900">
            {deniedSub}
          </code>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-100">
          Não foi possível entrar. Tente de novo.
        </p>
      ) : null}

      <a
        href="/api/admin/auth/login"
        className="inline-flex items-center justify-center gap-2 rounded-md bg-black px-4 py-3 font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
      >
        <svg aria-hidden="true" viewBox="0 0 76 65" className="h-4 w-4 fill-current">
          <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
        </svg>
        Entrar com a Vercel
      </a>
    </main>
  )
}
