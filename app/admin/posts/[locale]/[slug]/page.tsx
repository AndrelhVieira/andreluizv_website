import { LocaleSchema } from '@andreluizv/shared'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { PostEditor } from '@/components/admin/PostEditor'
import { getPostForEditing, getTagCountsForLocale } from 'lib/admin/content'
import { fieldsFromPost } from 'lib/admin/post-fields'
import { requireAdmin } from 'lib/admin/session'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactElement } from 'react'

interface PageProps {
  params: Promise<{ locale: string; slug: string }>
}

export const metadata: Metadata = { title: 'Editar post' }

export default async function EditPostPage({ params }: PageProps): Promise<ReactElement> {
  const session = await requireAdmin()
  const { locale: rawLocale, slug } = await params
  const locale = LocaleSchema.safeParse(rawLocale)
  if (!locale.success) {
    notFound()
  }

  const [post, tagCounts] = await Promise.all([
    getPostForEditing(locale.data, decodeURIComponent(slug)),
    getTagCountsForLocale(locale.data),
  ])
  if (!post) {
    notFound()
  }

  return (
    // Desktop: header + editor fill the screen, and the editor's two panes scroll inside it
    <div className="flex flex-col lg:h-dvh">
      <AdminHeader name={session.name} />
      <PostEditor
        mode="edit"
        published={!post.draft}
        initial={{
          locale: locale.data,
          slug: post.slug,
          fields: fieldsFromPost(post),
          body: post.bodyMdx,
        }}
        tagSuggestions={Object.keys(tagCounts)}
      />
    </div>
  )
}
