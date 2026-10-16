'use client'

import { markdown } from '@codemirror/lang-markdown'
import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { deletePostAction, previewPostAction, savePostAction } from 'app/admin/actions'
import type { WriteError } from 'lib/admin/content'
import {
  LAYOUTS,
  SLUG_PATTERN,
  SUMMARY_MAX,
  countWords,
  slugify,
  type EditorDocument,
  type PostFields,
} from 'lib/admin/post-fields'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactElement,
  type ReactNode,
} from 'react'
import toast from 'react-hot-toast'
import { imageFromTransfer } from 'lib/admin/image-client'
import { CoverField } from './CoverField'
import { DateField } from './DateField'
import { ImageGallery } from './ImageGallery'
import { TagInput } from './TagInput'
import { useImageUpload } from './useImageUpload'

interface PostEditorProps {
  mode: 'new' | 'edit'
  /** Whether the post is live right now (as last saved in the content API) */
  published: boolean
  initial: EditorDocument
  /** `pt/my-post` when this new post is a translation of another one */
  translatedFrom?: string
  tagSuggestions: string[]
}

interface LocalCopy {
  doc: EditorDocument
  savedAt: string
}

const WORDS_MIN = 400
const WORDS_MAX = 1500
const PREVIEW_DELAY_MS = 700
const LOCAL_SAVE_DELAY_MS = 1000

const inputClass =
  'w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700'
const buttonClass =
  'rounded-md px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50'

function readLocalCopy(key: string): LocalCopy | null {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as LocalCopy) : null
  } catch {
    return null
  }
}

function writeLocalCopy(key: string, copy: LocalCopy | null): void {
  try {
    if (copy) window.localStorage.setItem(key, JSON.stringify(copy))
    else window.localStorage.removeItem(key)
  } catch {
    // Private mode or full storage: the editor still works, only without the local backup
  }
}

function SaveErrorPanel({ error }: { error: WriteError }): ReactElement {
  return (
    <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <p className="font-semibold">Não foi salvo</p>
      {error.kind === 'mdx' ? <p className="mt-1 font-mono">{error.message}</p> : null}
      {error.kind === 'missingAssets' ? (
        <>
          <p className="mt-1">Estas imagens ainda não foram enviadas:</p>
          <ul className="mt-1 list-disc pl-5 font-mono">
            {error.paths.map((path) => (
              <li key={path}>{path}</li>
            ))}
          </ul>
        </>
      ) : null}
      {error.kind === 'frontmatter' ? (
        <>
          {error.message ? <p className="mt-1">{error.message}</p> : null}
          <ul className="mt-1 list-disc pl-5">
            {Object.entries(error.fields).map(([field, messages]) => (
              <li key={field}>
                <code>{field}</code>: {messages.join(', ')}
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {error.kind === 'other' ? <p className="mt-1">{error.message}</p> : null}
    </div>
  )
}

export function PostEditor({
  mode,
  published: initiallyPublished,
  initial,
  translatedFrom,
  tagSuggestions,
}: PostEditorProps): ReactElement {
  const router = useRouter()
  const [doc, setDoc] = useState<EditorDocument>(initial)
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(initial))
  const [published, setPublished] = useState(initiallyPublished)
  const [slugTouched, setSlugTouched] = useState(mode === 'edit' || Boolean(translatedFrom))
  const [preview, setPreview] = useState<ReactNode>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<WriteError | null>(null)
  const [restorable, setRestorable] = useState<LocalCopy | null>(null)
  const [isSaving, startSaving] = useTransition()
  const [isDark, setIsDark] = useState(false)
  const previewRun = useRef(0)
  const editorView = useRef<EditorView | null>(null)
  const [showGallery, setShowGallery] = useState(false)
  const uploader = useImageUpload(doc.slug || slugify(doc.fields.title))

  const isNew = mode === 'new'
  const storageKey = `admin-editor:${initial.locale}/${isNew ? `new:${initial.slug}` : initial.slug}`
  const dirty = JSON.stringify(doc) !== savedSnapshot
  const words = countWords(doc.body)

  const setFields = useCallback((patch: Partial<PostFields>): void => {
    setDoc((current) => ({ ...current, fields: { ...current.fields, ...patch } }))
  }, [])

  // Offer a local copy left over from an earlier session (unsaved edits, a closed tab…)
  useEffect(() => {
    const copy = readLocalCopy(storageKey)
    if (copy && JSON.stringify(copy.doc) !== JSON.stringify(initial)) {
      setRestorable(copy)
    }
    setIsDark(document.documentElement.classList.contains('dark'))
    // Only on mount: `initial` is the server state this page was rendered with
  }, [])

  // Local backup of every change. Published posts are never written to the API until
  // "Atualizar publicado", so this is where their work in progress lives.
  useEffect(() => {
    if (!dirty) return
    const timer = setTimeout(
      () => writeLocalCopy(storageKey, { doc, savedAt: new Date().toISOString() }),
      LOCAL_SAVE_DELAY_MS
    )
    return () => clearTimeout(timer)
  }, [doc, dirty, storageKey])

  // Live preview, rendered on the server with the real layouts
  useEffect(() => {
    const timer = setTimeout(() => {
      const run = ++previewRun.current
      previewPostAction(doc)
        .then((result) => {
          if (run !== previewRun.current) return
          if (result.ok) {
            setPreview(result.node)
            setPreviewError(null)
          } else {
            setPreviewError(result.message)
          }
        })
        .catch((error: Error) => {
          if (run === previewRun.current) setPreviewError(error.message)
        })
    }, PREVIEW_DELAY_MS)
    return () => clearTimeout(timer)
  }, [doc])

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent): void => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const save = useCallback(
    (draft: boolean): void => {
      startSaving(async () => {
        setSaveError(null)
        const result = await savePostAction(doc, draft)
        if (!result.ok) {
          setSaveError(result.error)
          toast.error('Não foi salvo')
          return
        }
        writeLocalCopy(storageKey, null)
        setSavedSnapshot(JSON.stringify(doc))
        setPublished(!draft)
        toast.success(draft ? 'Rascunho salvo' : 'Publicado ✅')
        if (!result.revalidated) {
          toast('Salvo, mas o site pode levar até 1 hora para mostrar a mudança', { icon: '⏳' })
        }
        if (isNew) {
          router.replace(`/admin/posts/${doc.locale}/${doc.slug}`)
        }
      })
    },
    [doc, isNew, router, storageKey]
  )

  // Cmd/Ctrl+S: saves drafts; a published post only gets its local copy (already automatic)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault()
        if (published) {
          writeLocalCopy(storageKey, { doc, savedAt: new Date().toISOString() })
          toast('Cópia local salva. Use "Atualizar publicado" para mandar ao site.', { icon: '💾' })
        } else {
          save(true)
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [doc, published, save, storageKey])

  const unpublish = (): void => {
    // eslint-disable-next-line no-alert
    if (window.confirm('Tirar este post do ar? Ele volta a ser rascunho.')) save(true)
  }

  const remove = (): void => {
    // eslint-disable-next-line no-alert
    const answer = window.prompt(`Para excluir de vez, digite o slug: ${doc.slug}`)
    if (answer !== doc.slug) return
    startSaving(async () => {
      writeLocalCopy(storageKey, null)
      await deletePostAction(doc.locale, doc.slug)
    })
  }

  const insertImage = useCallback((url: string): void => {
    const view = editorView.current
    if (!view) return
    view.dispatch(view.state.replaceSelection(`\n![Descreva a imagem](${url})\n`))
    view.focus()
  }, [])

  // Pasted/dropped images get a placeholder at the spot, replaced once the upload finishes
  const uploadIntoBody = useCallback(
    async (file: File, position: number): Promise<void> => {
      const view = editorView.current
      if (!view) return
      const placeholder = `![Enviando imagem ${crypto.randomUUID().slice(0, 6)}…]()`
      view.dispatch({ changes: { from: position, insert: `\n${placeholder}\n` } })
      const replacePlaceholder = (text: string): void => {
        const from = view.state.doc.toString().indexOf(placeholder)
        if (from >= 0)
          view.dispatch({ changes: { from, to: from + placeholder.length, insert: text } })
      }
      try {
        const url = await uploader.upload(file)
        replacePlaceholder(`![Descreva a imagem](${url})`)
      } catch (error) {
        replacePlaceholder('')
        toast.error((error as Error).message)
      }
    },
    [uploader]
  )

  const uploadIntoBodyRef = useRef(uploadIntoBody)
  uploadIntoBodyRef.current = uploadIntoBody

  const editorExtensions = useMemo(
    () => [
      markdown(),
      EditorView.lineWrapping,
      EditorView.domEventHandlers({
        paste(event, view) {
          const file = imageFromTransfer(event.clipboardData)
          if (!file) return false
          event.preventDefault()
          void uploadIntoBodyRef.current(file, view.state.selection.main.head)
          return true
        },
        drop(event, view) {
          const file = imageFromTransfer(event.dataTransfer)
          if (!file) return false
          event.preventDefault()
          const position =
            view.posAtCoords({ x: event.clientX, y: event.clientY }) ??
            view.state.selection.main.head
          void uploadIntoBodyRef.current(file, position)
          return true
        },
      }),
    ],
    []
  )

  const slugValid = SLUG_PATTERN.test(doc.slug)
  const publicUrl = `/${doc.locale}/blog/${doc.slug}`

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <div className="sticky top-0 z-40 flex flex-wrap items-center gap-2 border-b border-gray-200 bg-white/95 px-4 py-2 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
        <Link href="/admin" className="text-sm text-gray-500 hover:underline">
          ← Posts
        </Link>
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium uppercase dark:bg-gray-800">
          {doc.locale}
        </span>
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium ${
            published
              ? 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100'
              : 'bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100'
          }`}
        >
          {isNew ? 'Novo' : published ? 'Publicado' : 'Rascunho'}
        </span>
        <span className="text-xs text-gray-500">
          {dirty
            ? published
              ? 'Alterações só no navegador'
              : 'Alterações não salvas'
            : 'Tudo salvo'}
        </span>
        {published && !isNew ? (
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-gray-500 hover:underline"
          >
            Ver no site ↗
          </a>
        ) : null}

        <div className="ml-auto flex flex-wrap gap-2">
          {!isNew ? (
            <button
              type="button"
              onClick={remove}
              disabled={isSaving}
              className={`${buttonClass} text-red-600 hover:bg-red-50 dark:hover:bg-red-950`}
            >
              Excluir
            </button>
          ) : null}
          {published ? (
            <>
              <button
                type="button"
                onClick={unpublish}
                disabled={isSaving}
                className={`${buttonClass} border border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800`}
              >
                Despublicar
              </button>
              <button
                type="button"
                onClick={() => save(false)}
                disabled={isSaving || !dirty}
                className={`${buttonClass} bg-primary-500 hover:bg-primary-600 text-white`}
              >
                {isSaving ? 'Salvando…' : 'Atualizar publicado'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => save(true)}
                disabled={isSaving}
                className={`${buttonClass} border border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800`}
              >
                {isSaving ? 'Salvando…' : 'Salvar rascunho'}
              </button>
              <button
                type="button"
                onClick={() => save(false)}
                disabled={isSaving}
                className={`${buttonClass} bg-primary-500 hover:bg-primary-600 text-white`}
              >
                Publicar
              </button>
            </>
          )}
        </div>
      </div>

      {restorable ? (
        <div className="flex flex-wrap items-center gap-3 border-b border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
          Há uma cópia local de {new Date(restorable.savedAt).toLocaleString('pt-BR')} com
          alterações que não foram para o site.
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => {
              setDoc(restorable.doc)
              setRestorable(null)
            }}
          >
            Restaurar
          </button>
          <button
            type="button"
            className="underline"
            onClick={() => {
              writeLocalCopy(storageKey, null)
              setRestorable(null)
            }}
          >
            Descartar
          </button>
        </div>
      ) : null}

      {translatedFrom ? (
        <p className="border-b border-gray-200 px-4 py-2 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
          Tradução de{' '}
          <Link href={`/admin/posts/${translatedFrom}`} target="_blank" className="underline">
            {translatedFrom}
          </Link>
          : o texto e o frontmatter foram copiados. Traduza o título, o resumo, as tags e o corpo.
        </p>
      ) : null}

      <div className="grid flex-1 gap-0 lg:grid-cols-2">
        <section className="flex flex-col gap-4 border-gray-200 p-4 lg:border-r dark:border-gray-800">
          {saveError ? <SaveErrorPanel error={saveError} /> : null}

          <details
            open={isNew}
            className="rounded-md border border-gray-200 p-3 dark:border-gray-800"
          >
            <summary className="cursor-pointer text-sm font-semibold">Configuração do post</summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                Título
                <input
                  className={inputClass}
                  value={doc.fields.title}
                  onChange={(event) => {
                    const title = event.target.value
                    setDoc((current) => ({
                      ...current,
                      slug: slugTouched ? current.slug : slugify(title),
                      fields: { ...current.fields, title },
                    }))
                  }}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                <span>
                  Slug (URL){' '}
                  {!isNew ? (
                    <span className="text-gray-500">— não muda depois de criado</span>
                  ) : null}
                </span>
                <input
                  className={`${inputClass} font-mono ${doc.slug && !slugValid ? 'border-red-500' : ''}`}
                  value={doc.slug}
                  disabled={!isNew}
                  onChange={(event) => {
                    setSlugTouched(true)
                    setDoc((current) => ({ ...current, slug: event.target.value }))
                  }}
                />
                {doc.slug && !slugValid ? (
                  <span className="text-xs text-red-600">
                    Use só letras minúsculas, números e hífens.
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">{publicUrl}</span>
                )}
              </label>

              <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                <span className="flex justify-between">
                  Resumo (SEO e listas)
                  <span
                    className={
                      doc.fields.summary.length > SUMMARY_MAX ? 'text-red-600' : 'text-gray-500'
                    }
                  >
                    {doc.fields.summary.length}/{SUMMARY_MAX}
                  </span>
                </span>
                <textarea
                  rows={2}
                  className={inputClass}
                  value={doc.fields.summary}
                  onChange={(event) => setFields({ summary: event.target.value })}
                />
              </label>

              <div className="flex flex-col gap-1 text-sm sm:col-span-2">
                Tags
                <TagInput
                  value={doc.fields.tags}
                  onChange={(tags) => setFields({ tags })}
                  suggestions={tagSuggestions}
                />
              </div>

              <div className="flex flex-col gap-1 text-sm">
                Data
                <DateField
                  className={inputClass}
                  value={doc.fields.date}
                  onChange={(date) => setFields({ date })}
                />
              </div>

              <label className="flex flex-col gap-1 text-sm">
                Layout
                <select
                  className={inputClass}
                  value={doc.fields.layout}
                  onChange={(event) => setFields({ layout: event.target.value })}
                >
                  {LAYOUTS.map((layout) => (
                    <option key={layout} value={layout}>
                      {layout}
                    </option>
                  ))}
                </select>
              </label>

              <div className="sm:col-span-2">
                <CoverField
                  value={doc.fields.images[0] ?? ''}
                  onChange={(url) =>
                    setFields({
                      images: url
                        ? [url, ...doc.fields.images.slice(1)]
                        : doc.fields.images.slice(1),
                    })
                  }
                  title={doc.fields.title}
                  summary={doc.fields.summary}
                  uploader={uploader}
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={doc.fields.featured}
                  onChange={(event) => setFields({ featured: event.target.checked })}
                />
                Destaque na home
              </label>
            </div>
          </details>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-2">
              Corpo (MDX) — cole ou arraste imagens no texto
              <label className="cursor-pointer rounded border border-gray-300 px-2 py-0.5 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">
                Inserir imagem
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    const view = editorView.current
                    if (file && view) void uploadIntoBody(file, view.state.selection.main.head)
                    event.target.value = ''
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => setShowGallery(true)}
                className="rounded border border-gray-300 px-2 py-0.5 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Galeria
              </button>
              {uploader.uploading ? <span className="text-primary-500">Enviando…</span> : null}
            </span>
            <span className={words < WORDS_MIN || words > WORDS_MAX ? 'text-amber-600' : ''}>
              {words} palavras (ideal {WORDS_MIN}–{WORDS_MAX})
            </span>
          </div>
          <CodeMirror
            value={doc.body}
            onChange={(body) => setDoc((current) => ({ ...current, body }))}
            extensions={editorExtensions}
            onCreateEditor={(view) => {
              editorView.current = view
            }}
            theme={isDark ? 'dark' : 'light'}
            minHeight="60vh"
            basicSetup={{ foldGutter: false }}
            className="overflow-hidden rounded-md border border-gray-300 text-sm dark:border-gray-700"
          />
          {showGallery ? (
            <ImageGallery
              onClose={() => setShowGallery(false)}
              actions={[{ label: 'Inserir no texto', onPick: insertImage }]}
            />
          ) : null}
        </section>

        <section className="flex flex-col p-4">
          <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
            <span>Prévia (mesmo layout do blog)</span>
            {previewError ? (
              <span className="text-red-600">Com erro — mostrando a última versão válida</span>
            ) : null}
          </div>
          {previewError ? (
            <p className="mb-2 rounded-md border border-red-300 bg-red-50 p-2 font-mono text-xs text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
              {previewError}
            </p>
          ) : null}
          <div className="flex-1 overflow-auto rounded-md border border-gray-200 lg:max-h-[calc(100vh-8rem)] dark:border-gray-800">
            {preview ?? <p className="p-4 text-sm text-gray-500">Gerando prévia…</p>}
          </div>
        </section>
      </div>
    </div>
  )
}
