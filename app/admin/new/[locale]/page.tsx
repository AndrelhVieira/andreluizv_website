import { LocaleSchema } from '@andreluizv/shared'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { PostEditor } from '@/components/admin/PostEditor'
import { getPostForEditing, getTagCountsForLocale } from 'lib/admin/content'
import { emptyFields, fieldsFromPost, type EditorDocument } from 'lib/admin/post-fields'
import { requireAdmin } from 'lib/admin/session'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactElement } from 'react'

interface PageProps {
  params: Promise<{ locale: string }>
  /** `from=pt/my-post` starts a translation from that post */
  searchParams: Promise<{ from?: string }>
}

export const metadata: Metadata = { title: 'Novo post' }

async function startingPoint(
  locale: EditorDocument['locale'],
  from: string | undefined
): Promise<{ doc: EditorDocument; source?: string }> {
  const [sourceLocale, ...slugParts] = (from ?? '').split('/')
  const parsedSource = LocaleSchema.safeParse(sourceLocale)
  const sourceSlug = slugParts.join('/')
  if (parsedSource.success && sourceSlug) {
    const source = await getPostForEditing(parsedSource.data, sourceSlug)
    if (source) {
      // Translations share the slug; everything is copied so only the text needs translating
      return {
        doc: { locale, slug: source.slug, fields: fieldsFromPost(source), body: source.bodyMdx },
        source: `${parsedSource.data}/${source.slug}`,
      }
    }
  }
  return { doc: { locale, slug: '', fields: emptyFields(), body: '' } }
}

export default async function NewPostPage({
  params,
  searchParams,
}: PageProps): Promise<ReactElement> {
  const session = await requireAdmin()
  const { locale: rawLocale } = await params
  const locale = LocaleSchema.safeParse(rawLocale)
  if (!locale.success) {
    notFound()
  }
  const { from } = await searchParams
  const [{ doc, source }, tagCounts] = await Promise.all([
    startingPoint(locale.data, from),
    getTagCountsForLocale(locale.data),
  ])

  return (
    <>
      <AdminHeader name={session.name} />
      <PostEditor
        mode="new"
        published={false}
        initial={doc}
        translatedFrom={source}
        tagSuggestions={Object.keys(tagCounts)}
      />
    </>
  )
}
