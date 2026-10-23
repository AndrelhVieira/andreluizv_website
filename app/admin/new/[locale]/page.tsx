import { LocaleSchema, type PostPlan } from '@andreluizv/shared'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { PostEditor } from '@/components/admin/PostEditor'
import { getPlan, getPostForEditing, getTagCountsForLocale } from 'lib/admin/content'
import { emptyFields, fieldsFromPost, slugify, type EditorDocument } from 'lib/admin/post-fields'
import { requireAdmin } from 'lib/admin/session'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactElement } from 'react'

interface PageProps {
  params: Promise<{ locale: string }>
  /**
   * `from=pt/my-post` starts a translation from that post; `plan=<id>` starts the post of a
   * schedule entry (title, tags and date come from it, and saving links it to the plan)
   */
  searchParams: Promise<{ from?: string; plan?: string }>
}

export const metadata: Metadata = { title: 'Novo post' }

async function startingPoint(
  locale: EditorDocument['locale'],
  from: string | undefined,
  plan: PostPlan | null
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
  if (plan) {
    const fields = emptyFields()
    return {
      doc: {
        locale,
        slug: plan.slug ?? slugify(plan.title),
        fields: {
          ...fields,
          title: plan.title,
          tags: plan.tags,
          date: plan.plannedDate ?? fields.date,
        },
        body: '',
      },
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
  const { from, plan: planId } = await searchParams
  const plan = planId ? await getPlan(planId) : null
  const [{ doc, source }, tagCounts] = await Promise.all([
    startingPoint(locale.data, from, plan),
    getTagCountsForLocale(locale.data),
  ])

  return (
    // Desktop: header + editor fill the screen, and the editor's two panes scroll inside it
    <div className="flex flex-col lg:h-dvh">
      <AdminHeader name={session.name} />
      <PostEditor
        mode="new"
        published={false}
        initial={doc}
        translatedFrom={source}
        plan={plan ? { id: plan.id, title: plan.title, notes: plan.notes } : undefined}
        tagSuggestions={Object.keys(tagCounts)}
      />
    </div>
  )
}
