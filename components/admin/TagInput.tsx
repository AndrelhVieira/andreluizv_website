'use client'

import { useId, useState, type KeyboardEvent, type ReactElement } from 'react'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  /** Tags already used in this language, to avoid near-duplicates */
  suggestions: string[]
}

const normalize = (tag: string): string => tag.trim().toLowerCase().replace(/\s+/g, '-')

export function TagInput({ value, onChange, suggestions }: TagInputProps): ReactElement {
  const [draft, setDraft] = useState('')
  const listId = useId()

  const add = (raw: string): void => {
    const tag = normalize(raw)
    if (tag && !value.includes(tag)) {
      onChange([...value, tag])
    }
    setDraft('')
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      add(draft)
    } else if (event.key === 'Backspace' && !draft && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-md border border-gray-300 px-2 py-1 dark:border-gray-700">
      {value.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-sm dark:bg-gray-800"
        >
          {tag}
          <button
            type="button"
            aria-label={`Remover ${tag}`}
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="text-gray-500 hover:text-red-600"
          >
            ×
          </button>
        </span>
      ))}
      <input
        list={listId}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => draft && add(draft)}
        placeholder={value.length === 0 ? 'react, nextjs… (Enter para adicionar)' : ''}
        className="min-w-32 flex-1 border-0 bg-transparent px-1 py-1 text-sm focus:ring-0 focus:outline-none"
      />
      <datalist id={listId}>
        {suggestions
          .filter((tag) => !value.includes(tag))
          .map((tag) => (
            <option key={tag} value={tag} />
          ))}
      </datalist>
    </div>
  )
}
