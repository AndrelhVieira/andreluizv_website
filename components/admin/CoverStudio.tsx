'use client'

import { generateIllustrationsAction } from 'app/admin/actions'
import { COVER_HEIGHT, COVER_WIDTH, defaultHighlight, drawCover } from 'lib/admin/cover-canvas'
import { canvasToImage, loadImage } from 'lib/admin/image-client'
import { useEffect, useRef, useState, useTransition, type ReactElement } from 'react'
import toast from 'react-hot-toast'
import { Modal } from './Modal'
import type { ImageUploader } from './useImageUpload'

interface CoverStudioProps {
  title: string
  summary: string
  uploader: ImageUploader
  onClose: () => void
  onSaved: (url: string) => void
}

const OPTION_COUNTS = [1, 2, 3]

export function CoverStudio({
  title,
  summary,
  uploader,
  onClose,
  onSaved,
}: CoverStudioProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [subject, setSubject] = useState(() => [title, summary].filter(Boolean).join(' — '))
  const [count, setCount] = useState(2)
  const [options, setOptions] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [illustration, setIllustration] = useState<HTMLImageElement | null>(null)
  const [coverTitle, setCoverTitle] = useState(title)
  const [highlight, setHighlight] = useState(() => defaultHighlight(title))
  const [label, setLabel] = useState('Blog post')
  const [fontFamily, setFontFamily] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, startGenerating] = useTransition()
  const [isSaving, setSaving] = useState(false)
  const wordCount = coverTitle.trim().split(/\s+/).filter(Boolean).length

  // The admin layout loads Space Grotesk through next/font; the canvas needs it ready
  useEffect(() => {
    const family = getComputedStyle(document.body).fontFamily
    void document.fonts.load(`700 80px ${family}`).then(() => setFontFamily(family))
  }, [])

  useEffect(() => {
    if (!selected) {
      setIllustration(null)
      return
    }
    let cancelled = false
    void loadImage(selected).then((image) => {
      if (!cancelled) setIllustration(image)
    })
    return () => {
      cancelled = true
    }
  }, [selected])

  useEffect(() => {
    if (!canvasRef.current || !fontFamily) return
    drawCover(canvasRef.current, {
      title: coverTitle,
      highlightWords: highlight,
      label,
      illustration,
      fontFamily,
    })
  }, [coverTitle, highlight, label, illustration, fontFamily])

  const generate = (): void => {
    startGenerating(async () => {
      setError(null)
      const result = await generateIllustrationsAction(subject, count)
      if (!result.ok) {
        setError(result.message)
        return
      }
      setOptions((current) => [...result.images, ...current])
      setSelected(result.images[0] ?? null)
    })
  }

  const pickOwnIllustration = (file: File | undefined): void => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result)
      setOptions((current) => [dataUrl, ...current])
      setSelected(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const save = async (): Promise<void> => {
    if (!canvasRef.current) return
    setSaving(true)
    try {
      const blob = await canvasToImage(canvasRef.current, 0.85)
      const url = await uploader.upload(blob, { encoded: true })
      toast.success('Capa salva')
      onSaved(url)
      onClose()
    } catch (saveError) {
      toast.error((saveError as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Criar capa" onClose={onClose} wide>
      <div className="flex flex-col gap-4">
        <canvas
          ref={canvasRef}
          width={COVER_WIDTH}
          height={COVER_HEIGHT}
          className="aspect-[2/1] w-full rounded-md border border-gray-200 dark:border-gray-800"
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm sm:col-span-3">
            Título na capa
            <input
              className="rounded-md border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700"
              value={coverTitle}
              onChange={(event) => setCoverTitle(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Palavras em destaque (coral): {highlight}
            <input
              type="range"
              min={0}
              max={Math.max(1, wordCount)}
              value={highlight}
              onChange={(event) => setHighlight(Number(event.target.value))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Etiqueta
            <input
              className="rounded-md border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
            />
          </label>
        </div>

        <fieldset className="flex flex-col gap-2 rounded-md border border-gray-200 p-3 dark:border-gray-800">
          <legend className="px-1 text-sm font-semibold">Ilustração (lado direito)</legend>
          <label className="flex flex-col gap-1 text-sm">
            O que a ilustração deve mostrar (em inglês costuma funcionar melhor)
            <textarea
              rows={2}
              className="rounded-md border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-700"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="e.g. a React component tree splitting into lazy-loaded chunks"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
              className="rounded-md border border-gray-300 bg-transparent px-2 py-2 text-sm dark:border-gray-700"
              aria-label="Quantidade de opções"
            >
              {OPTION_COUNTS.map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'opção' : 'opções'}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={generate}
              disabled={isGenerating}
              className="bg-primary-500 hover:bg-primary-600 rounded-md px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {isGenerating ? 'Gerando… (até 1 min)' : 'Gerar com IA'}
            </button>
            <label className="cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">
              Usar minha ilustração
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => pickOwnIllustration(event.target.files?.[0])}
              />
            </label>
            <span className="text-xs text-gray-500">
              Cada opção gerada é cobrada no AI Gateway.
            </span>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {options.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {options.map((option, index) => (
                <li key={option.slice(-32) + index}>
                  <button
                    type="button"
                    onClick={() => setSelected(option)}
                    className={`overflow-hidden rounded-md border-2 ${selected === option ? 'border-primary-500' : 'border-transparent'}`}
                    aria-label={`Ilustração ${index + 1}`}
                  >
                    {/* Data URL thumbnails */}
                    <img src={option} alt="" className="h-24 w-24 object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </fieldset>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={isSaving || !fontFamily}
            className="bg-primary-500 hover:bg-primary-600 rounded-md px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isSaving ? 'Salvando…' : 'Usar esta capa'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
