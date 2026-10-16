'use client'

import { formatDateBr, parseDateBr } from 'lib/admin/post-fields'
import { useEffect, useRef, useState, type ChangeEvent, type ReactElement } from 'react'

interface DateFieldProps {
  /** YYYY-MM-DD, as stored in the frontmatter */
  value: string
  onChange: (iso: string) => void
  className: string
}

/** Inserts the slashes while typing: "16102026" → "16/10/2026" */
function mask(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8)
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('/')
}

/**
 * dd/MM/yyyy text field. The native date input follows the OS locale and can't be forced
 * into this format, so it only stays (hidden) as the calendar picker.
 */
export function DateField({ value, onChange, className }: DateFieldProps): ReactElement {
  const [text, setText] = useState(() => formatDateBr(value))
  const pickerRef = useRef<HTMLInputElement>(null)
  const invalid = text.length > 0 && parseDateBr(text) === null

  // Follows outside changes (restoring a local copy, the calendar picker)
  useEffect(() => {
    if (parseDateBr(text) !== value) setText(formatDateBr(value))
  }, [value])

  const onTextChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const next = mask(event.target.value)
    setText(next)
    const iso = parseDateBr(next)
    if (iso) onChange(iso)
  }

  const openPicker = (): void => {
    pickerRef.current?.showPicker()
  }

  const onPick = (event: ChangeEvent<HTMLInputElement>): void => {
    if (event.target.value) onChange(event.target.value)
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="relative flex gap-2">
        <input
          inputMode="numeric"
          placeholder="dd/mm/aaaa"
          value={text}
          onChange={onTextChange}
          aria-invalid={invalid}
          className={`${className} ${invalid ? 'border-red-500' : ''}`}
        />
        <button
          type="button"
          onClick={openPicker}
          aria-label="Abrir calendário"
          className="rounded-md border border-gray-300 px-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          📅
        </button>
        <input
          ref={pickerRef}
          type="date"
          tabIndex={-1}
          aria-hidden="true"
          value={value}
          onChange={onPick}
          className="pointer-events-none absolute right-0 bottom-0 h-0 w-0 opacity-0"
        />
      </div>
      {invalid ? (
        <span className="text-xs text-red-600">Data inválida (use dd/mm/aaaa)</span>
      ) : null}
    </div>
  )
}
