import { locales, type Locale, type PostSummary } from '@andreluizv/shared'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { listAllPosts } from 'lib/admin/content'
import { formatDateBr } from 'lib/admin/post-fields'
import { requireAdmin } from 'lib/admin/session'
import Link from 'next/link'
import type { ReactElement } from 'react'

interface PostGroup {
  slug: string
  /** Newest date among the translations, for sorting */
  date: string
  byLocale: Partial<Record<Locale, PostSummary>>
}

/** One row per slug: translations share the slug. */
function groupBySlug(posts: PostSummary[]): PostGroup[] {
  const groups = new Map<string, PostGroup>()
  for (const post of posts) {
    const group = groups.get(post.slug) ?? { slug: post.slug, date: post.date, byLocale: {} }
    group.byLocale[post.locale] = post
    if (post.date > group.date) group.date = post.date
    groups.set(post.slug, group)
  }
  return [...groups.values()].sort((a, b) => b.date.localeCompare(a.date))
}

function LocaleBadge({ group, locale }: { group: PostGroup; locale: Locale }): ReactElement {
  const post = group.byLocale[locale]
  if (!post) {
    const source = locales.find((l) => group.byLocale[l])
    return (
      <Link
        href={`/admin/new/${locale}?from=${source}/${group.slug}`}
        title={`Criar a versão em ${locale}`}
        className="rounded border border-dashed border-gray-300 px-2 py-0.5 text-xs text-gray-400 hover:border-gray-500 hover:text-gray-600 dark:border-gray-700"
      >
        + {locale}
      </Link>
    )
  }
  return (
    <Link
      href={`/admin/posts/${locale}/${group.slug}`}
      title={post.draft ? 'Rascunho' : 'Publicado'}
      className={`rounded px-2 py-0.5 text-xs font-medium ${
        post.draft
          ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-100'
          : 'bg-green-100 text-green-900 hover:bg-green-200 dark:bg-green-900 dark:text-green-100'
      }`}
    >
      {post.draft ? '✏️' : '✅'} {locale}
    </Link>
  )
}

export default async function AdminHome(): Promise<ReactElement> {
  const session = await requireAdmin()
  const groups = groupBySlug(await listAllPosts())

  return (
    <>
      <AdminHeader name={session.name} />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Posts ({groups.length})</h1>
          <div className="flex gap-2">
            {locales.map((locale) => (
              <Link
                key={locale}
                href={`/admin/new/${locale}`}
                className="bg-primary-500 hover:bg-primary-600 rounded-md px-3 py-2 text-sm font-medium text-white"
              >
                Novo em {locale}
              </Link>
            ))}
          </div>
        </div>

        <p className="mb-4 text-sm text-gray-500">
          ✅ publicado · ✏️ rascunho · + criar tradução (copia o post do outro idioma para você
          traduzir)
        </p>

        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {groups.map((group) => {
            const main = locales.map((l) => group.byLocale[l]).find(Boolean) as PostSummary
            return (
              <li key={group.slug} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{main.title}</p>
                  <p className="truncate text-xs text-gray-500">
                    {formatDateBr(group.date)} · {group.slug}
                  </p>
                </div>
                <div className="flex gap-1">
                  {locales.map((locale) => (
                    <LocaleBadge key={locale} group={group} locale={locale} />
                  ))}
                </div>
              </li>
            )
          })}
        </ul>
      </main>
    </>
  )
}
