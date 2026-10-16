'use client'

import { useState, type DragEvent, type ReactElement } from 'react'
import toast from 'react-hot-toast'
import { imageFromTransfer } from 'lib/admin/image-client'
import { CoverStudio } from './CoverStudio'
import { ImageGallery } from './ImageGallery'
import type { ImageUploader } from './useImageUpload'

interface CoverFieldProps {
  value: string
  onChange: (url: string) => void
  title: string
  summary: string
  uploader: ImageUploader
}

/** Covers are 2:1 (PostBanner); uploads are resized to fit 1600×800 */
const COVER_ENCODE = { maxWidth: 1600, maxHeight: 800, quality: 0.85 }

const buttonClass =
  'rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800'

export function CoverField({
  value,
  onChange,
  title,
  summary,
  uploader,
}: CoverFieldProps): ReactElement {
  const [modal, setModal] = useState<'gallery' | 'studio' | null>(null)
  const [dragging, setDragging] = useState(false)

  const uploadCover = async (file: File | null | undefined): Promise<void> => {
    if (!file) return
    try {
      onChange(await uploader.upload(file, { encode: COVER_ENCODE }))
      toast.success('Capa enviada')
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  const onDrop = (event: DragEvent<HTMLLabelElement>): void => {
    event.preventDefault()
    setDragging(false)
    void uploadCover(imageFromTransfer(event.dataTransfer))
  }

  return (
    <div className="flex flex-col gap-2 text-sm">
      Capa
      <label
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex aspect-[2/1] w-full cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 border-dashed ${
          dragging ? 'border-primary-500 bg-primary-500/5' : 'border-gray-300 dark:border-gray-700'
        }`}
      >
        {value ? (
          <img src={value} alt="Capa atual" className="h-full w-full object-cover" />
        ) : (
          <span className="px-4 text-center text-gray-500">
            {uploader.uploading
              ? 'Enviando…'
              : 'Arraste uma imagem aqui ou clique para enviar. Também dá para escolher na galeria ou criar uma capa.'}
          </span>
        )}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => void uploadCover(event.target.files?.[0])}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <label className={`${buttonClass} cursor-pointer`}>
          Enviar imagem
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => void uploadCover(event.target.files?.[0])}
          />
        </label>
        <button type="button" className={buttonClass} onClick={() => setModal('gallery')}>
          Galeria
        </button>
        <button type="button" className={buttonClass} onClick={() => setModal('studio')}>
          ✨ Criar capa
        </button>
        {value ? (
          <button
            type="button"
            className={`${buttonClass} text-red-600`}
            onClick={() => onChange('')}
          >
            Remover
          </button>
        ) : null}
      </div>
      <input
        aria-label="URL da capa"
        className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-1.5 font-mono text-xs dark:border-gray-700"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="ou cole a URL da imagem"
      />
      {modal === 'gallery' ? (
        <ImageGallery
          onClose={() => setModal(null)}
          actions={[{ label: 'Usar como capa', onPick: onChange }]}
        />
      ) : null}
      {modal === 'studio' ? (
        <CoverStudio
          title={title}
          summary={summary}
          uploader={uploader}
          onClose={() => setModal(null)}
          onSaved={onChange}
        />
      ) : null}
    </div>
  )
}
