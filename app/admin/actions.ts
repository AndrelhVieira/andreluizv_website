'use server'

import { LocaleSchema } from '@andreluizv/shared'
import {
  deletePost,
  listAssets,
  savePost,
  uploadAsset,
  type AssetItem,
  type WriteResult,
} from 'lib/admin/content'
import { generateCoverIllustrations, type IllustrationResult } from 'lib/admin/cover-illustration'
import { toMdxFile } from 'lib/admin/mdx-file'
import { SLUG_PATTERN, slugify, type EditorDocument } from 'lib/admin/post-fields'
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

const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/webp': 'webp',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/avif': 'avif',
}
/** The content API's limit (Vercel Functions reject bodies over 4.5 MB) */
const MAX_IMAGE_BYTES = 4 * 1024 * 1024

export type UploadResult = { ok: true; url: string } | { ok: false; message: string }

/**
 * FormData: `file` (already converted to WebP in the browser) and `name`, the base for the
 * file name (usually the post slug). A random suffix keeps re-uploads from overwriting.
 */
export async function uploadImageAction(form: FormData): Promise<UploadResult> {
  await requireAdmin()
  const file = form.get('file')
  if (!(file instanceof Blob)) {
    return { ok: false, message: 'Nenhuma imagem recebida' }
  }
  const extension = IMAGE_EXTENSIONS[file.type]
  if (!extension) {
    return { ok: false, message: `Formato não suportado: ${file.type || 'desconhecido'}` }
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, message: 'A imagem passa de 4 MB mesmo depois de convertida' }
  }
  const base = slugify(String(form.get('name') ?? '')).slice(0, 80) || 'imagem'
  const suffix = crypto.randomUUID().slice(0, 8)
  try {
    const url = await uploadAsset(`/static/blog/${base}-${suffix}.${extension}`, file)
    return { ok: true, url }
  } catch (error) {
    return { ok: false, message: (error as Error).message }
  }
}

export async function listAssetsAction(offset: number): Promise<AssetItem[]> {
  await requireAdmin()
  return listAssets(Math.max(0, Math.floor(offset)))
}

/** Spends AI Gateway credits: one image per option. */
export async function generateIllustrationsAction(
  subject: string,
  count: number
): Promise<IllustrationResult> {
  await requireAdmin()
  const trimmed = subject.trim().slice(0, 500)
  if (!trimmed) {
    return { ok: false, message: 'Descreva o assunto da ilustração' }
  }
  return generateCoverIllustrations(trimmed, Math.min(3, Math.max(1, Math.floor(count))))
}

export async function signOutAction(): Promise<void> {
  await endSession()
  redirect('/admin/login')
}
