'use server'

import { LocaleSchema } from '@andreluizv/shared'
import { deletePost, savePost, type WriteResult } from 'lib/admin/content'
import { toMdxFile } from 'lib/admin/mdx-file'
import { SLUG_PATTERN, type EditorDocument } from 'lib/admin/post-fields'
import { renderPreview, type PreviewResult } from 'lib/admin/preview'
import { endSession, requireAdmin } from 'lib/admin/session'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Server actions are public POST endpoints: each one checks the session itself.

function checkDocument(doc: EditorDocument): string | null {
  if (!LocaleSchema.safeParse(doc.locale).success) return 'Idioma inválido'
  if (!SLUG_PATTERN.test(doc.slug)) return 'O slug deve usar só letras minúsculas, números e hífens'
  if (!doc.fields.title.trim()) return 'O título é obrigatório'
  return null
}

export async function previewPostAction(doc: EditorDocument): Promise<PreviewResult> {
  await requireAdmin()
  return renderPreview(doc)
}

/** `draft: true` saves without publishing; `false` publishes (or updates the live post). */
export async function savePostAction(doc: EditorDocument, draft: boolean): Promise<WriteResult> {
  await requireAdmin()
  const invalid = checkDocument(doc)
  if (invalid) {
    return { ok: false, error: { kind: 'other', message: invalid } }
  }
  const result = await savePost(doc.locale, doc.slug, toMdxFile(doc, draft))
  if (result.ok) {
    revalidatePath('/admin', 'layout')
  }
  return result
}

export async function deletePostAction(locale: string, slug: string): Promise<void> {
  await requireAdmin()
  const parsedLocale = LocaleSchema.parse(locale)
  await deletePost(parsedLocale, slug)
  revalidatePath('/admin', 'layout')
  redirect('/admin')
}

export async function signOutAction(): Promise<void> {
  await endSession()
  redirect('/admin/login')
}
