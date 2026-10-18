'use client'

import { locales, type PostPlan } from '@andreluizv/shared'
import {
  deletePlanAction,
  savePlanAction,
  type PlanActionResult,
  type PlanFormValues,
} from 'app/admin/schedule/actions'
import { useId, useState, useTransition, type FormEvent, type ReactElement } from 'react'
import toast from 'react-hot-toast'
import { DateField } from './DateField'
import { TagInput } from './TagInput'

interface PlanFormProps {
  /** null creates a new plan */
  plan: PostPlan | null
  tagSuggestions: string[]
  /** Existing post slugs, offered for linking */
  slugs: string[]
  onDone: () => void
}

const inputClass =
  'w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700'
const labelClass = 'flex flex-col gap-1 text-sm font-medium'

function initialValues(plan: PostPlan | null): PlanFormValues {
  return {
    title: plan?.title ?? '',
    notes: plan?.notes ?? '',
    tags: plan?.tags ?? [],
    locales: plan?.locales ?? ['pt'],
    plannedDate: plan?.plannedDate ?? '',
    slug: plan?.slug ?? '',
  }
}

export function PlanForm({ plan, tagSuggestions, slugs, onDone }: PlanFormProps): ReactElement {
  const [values, setValues] = useState(() => initialValues(plan))
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const slugListId = useId()

  const set = (patch: Partial<PlanFormValues>): void => setValues((v) => ({ ...v, ...patch }))

  const finish = (result: PlanActionResult, success: string): void => {
    if (!result.ok) {
      setError(result.message)
      return
    }
    toast.success(success)
    onDone()
  }

  const onSubmit = (event: FormEvent): void => {
    event.preventDefault()
    setError(null)
    startTransition(async () => {
      finish(
        await savePlanAction(plan?.id ?? null, values),
        plan ? 'Tema atualizado' : 'Tema criado'
      )
    })
  }

  const onDelete = (): void => {
    // eslint-disable-next-line no-alert
    if (!plan || !window.confirm(`Excluir "${plan.title}" do cronograma? O post não é apagado.`)) {
      return
    }
    startTransition(async () => {
      finish(await deletePlanAction(plan.id), 'Tema excluído')
    })
  }

  const toggleLocale = (locale: string): void =>
    set({
      locales: values.locales.includes(locale)
        ? values.locales.filter((l) => l !== locale)
        : locales.filter((l) => l === locale || values.locales.includes(l)),
    })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {error ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <label className={labelClass}>
        Tema
        <input
          required
          autoFocus
          value={values.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Ex.: Server Actions na prática"
          className={inputClass}
        />
      </label>

      <label className={labelClass}>
        Anotações
        <textarea
          rows={4}
          value={values.notes}
          onChange={(e) => set({ notes: e.target.value })}
          placeholder="Ângulo, pontos que quero cobrir, links de referência…"
          className={inputClass}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className={labelClass}>
          Data planejada
          <DateField
            value={values.plannedDate}
            onChange={(plannedDate) => set({ plannedDate })}
            className={inputClass}
          />
          {values.plannedDate ? (
            <button
              type="button"
              onClick={() => set({ plannedDate: '' })}
              className="self-start text-xs font-normal text-gray-500 underline"
            >
              Tirar a data (volta para o backlog)
            </button>
          ) : (
            <span className="text-xs font-normal text-gray-500">
              Sem data, o tema fica no backlog
            </span>
          )}
        </div>

        <fieldset className="flex flex-col gap-1 text-sm">
          <legend className="mb-1 font-medium">Idiomas</legend>
          <div className="flex gap-3">
            {locales.map((locale) => (
              <label key={locale} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={values.locales.includes(locale)}
                  onChange={() => toggleLocale(locale)}
                />
                {locale}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className={labelClass}>
        Tags
        <TagInput
          value={values.tags}
          onChange={(tags) => set({ tags })}
          suggestions={tagSuggestions}
        />
      </div>

      <label className={labelClass}>
        Post ligado (slug)
        <input
          list={slugListId}
          value={values.slug}
          onChange={(e) => set({ slug: e.target.value })}
          placeholder="Preenchido sozinho quando você começa o post por aqui"
          className={inputClass}
        />
        <datalist id={slugListId}>
          {slugs.map((slug) => (
            <option key={slug} value={slug} />
          ))}
        </datalist>
      </label>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 pt-4 dark:border-gray-800">
        {plan ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={isPending}
            className="rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950"
          >
            Excluir
          </button>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary-500 hover:bg-primary-600 rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
