'use client'

import { listAssetsAction } from 'app/admin/actions'
import type { AssetItem } from 'lib/admin/content'
import { formatDateBr } from 'lib/admin/post-fields'
import { useCallback, useEffect, useState, type ReactElement } from 'react'
import { Modal } from './Modal'

interface ImageGalleryProps {
  onClose: () => void
  /** One button per action, e.g. "Usar como capa" and "Inserir no texto" */
  actions: Array<{ label: string; onPick: (url: string) => void }>
}

const PAGE_SIZE = 48

export function ImageGallery({ onClose, actions }: ImageGalleryProps): ReactElement {
  const [items, setItems] = useState<AssetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (offset: number) => {
    setLoading(true)
    setError(null)
    try {
      const page = await listAssetsAction(offset)
      setItems((current) => (offset === 0 ? page : [...current, ...page]))
      setHasMore(page.length === PAGE_SIZE)
    } catch (loadError) {
      setError((loadError as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(0)
  }, [load])

  return (
    <Modal title="Imagens enviadas" onClose={onClose} wide>
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <li
            key={item.url}
            className="flex flex-col gap-1 rounded-md border border-gray-200 p-2 dark:border-gray-800"
          >
            <img
              src={item.url}
              alt=""
              loading="lazy"
              className="aspect-[2/1] w-full rounded object-cover"
            />
            <p className="truncate text-xs text-gray-500" title={item.sourcePath}>
              {item.sourcePath.replace('/static/blog/', '')}
            </p>
            <p className="text-xs text-gray-400">
              {formatDateBr(item.createdAt)} · {Math.round(item.size / 1024)} KB
            </p>
            <div className="flex flex-wrap gap-1">
              {actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => {
                    action.onPick(item.url)
                    onClose()
                  }}
                  className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
      {loading ? <p className="mt-3 text-sm text-gray-500">Carregando…</p> : null}
      {!loading && items.length === 0 && !error ? (
        <p className="text-sm text-gray-500">Nenhuma imagem enviada ainda.</p>
      ) : null}
      {hasMore && !loading ? (
        <button
          type="button"
          onClick={() => void load(items.length)}
          className="mt-4 text-sm underline"
        >
          Carregar mais
        </button>
      ) : null}
    </Modal>
  )
}
