'use client'

import { locales, type Locale, type PostPlan } from '@andreluizv/shared'
import { acceptPlanAction, deletePlanAction } from 'app/admin/schedule/actions'
import { formatDateBr } from 'lib/admin/post-fields'
import {
  STATUS_LABELS,
  startPostHref,
  type MonthGroup,
  type PlanView,
  type Schedule,
} from 'lib/admin/schedule'
import Link from 'next/link'
import { useState, useTransition, type ReactElement } from 'react'
import toast from 'react-hot-toast'
import { Modal } from './Modal'
import { PlanForm } from './PlanForm'

interface ScheduleBoardProps {
  schedule: Schedule
  /** YYYY-MM-DD, in Brazil */
  today: string
  tagSuggestions: string[]
  slugs: string[]
}

/** null = closed, 'new' = creating, a plan = editing it */
type Editing = PostPlan | 'new' | null

function LocaleLinks({ view }: { view: PlanView }): ReactElement {
  // Nothing planned or written yet: offer every language
  const shown: Locale[] = view.locales.length > 0 ? view.locales : [...locales]
  return (
    <div className="flex gap-1">
      {shown.map((locale) => {
        const post = view.posts[locale]
        if (post) {
          return (
            <Link
              key={locale}
              href={`/admin/posts/${locale}/${post.slug}`}
              title={post.draft ? 'Rascunho: abrir no editor' : 'Publicado: abrir no editor'}
              className={`rounded px-2 py-0.5 text-xs font-medium ${
                post.draft
                  ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-100'
                  : 'bg-green-100 text-green-900 hover:bg-green-200 dark:bg-green-900 dark:text-green-100'
              }`}
            >
              {post.draft ? '✏️' : '✅'} {locale}
            </Link>
          )
        }
        return (
          <Link
            key={locale}
            href={startPostHref(view, locale)}
            title={`Começar o post em ${locale}`}
            className="rounded border border-dashed border-gray-300 px-2 py-0.5 text-xs text-gray-500 hover:border-gray-500 hover:text-gray-700 dark:border-gray-700 dark:hover:text-gray-200"
          >
            + {locale}
          </Link>
        )
      })}
    </div>
  )
}

function PlanRow({
  view,
  onEdit,
  showDate,
}: {
  view: PlanView
  onEdit: (plan: PostPlan) => void
  showDate: boolean
}): ReactElement {
  const { icon, label } = STATUS_LABELS[view.status]
  return (
    <li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {showDate ? (
          <span
            className={`w-12 shrink-0 pt-0.5 text-sm tabular-nums ${
              view.overdue ? 'font-semibold text-red-600' : 'text-gray-500'
            }`}
          >
            {view.date ? formatDateBr(view.date).slice(0, 5) : '—'}
          </span>
        ) : null}
        <span title={label} aria-label={label} className="pt-0.5">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onEdit(view.plan)}
            className="block max-w-full truncate text-left font-medium hover:underline"
          >
            {view.plan.title}
          </button>
          <p className="truncate text-xs text-gray-500">
            {view.overdue ? <span className="text-red-600">atrasado · </span> : null}
            {view.plan.tags.length > 0 ? view.plan.tags.join(', ') : label}
          </p>
        </div>
      </div>
      <LocaleLinks view={view} />
    </li>
  )
}

function Month({
  group,
  onEdit,
}: {
  group: MonthGroup
  onEdit: (plan: PostPlan) => void
}): ReactElement {
  return (
    <section>
      <h3 className="border-b border-gray-200 pb-1 text-sm font-semibold tracking-wide text-gray-500 uppercase dark:border-gray-800">
        {group.label}
      </h3>
      <ul className="divide-y divide-gray-100 dark:divide-gray-900">
        {group.items.map((view) => (
          <PlanRow key={view.plan.id} view={view} onEdit={onEdit} showDate />
        ))}
      </ul>
    </section>
  )
}

function Suggestion({
  view,
  onEdit,
}: {
  view: PlanView
  onEdit: (plan: PostPlan) => void
}): ReactElement {
  const [isPending, startTransition] = useTransition()
  const act = (accept: boolean): void => {
    startTransition(async () => {
      const result = accept
        ? await acceptPlanAction(view.plan.id)
        : await deletePlanAction(view.plan.id)
      if (result.ok) toast.success(accept ? 'Foi para o backlog' : 'Sugestão descartada')
      else toast.error(result.message)
    })
  }
  return (
    <li className="rounded-md border border-violet-200 bg-violet-50 p-3 dark:border-violet-900 dark:bg-violet-950">
      <button
        type="button"
        onClick={() => onEdit(view.plan)}
        className="text-left text-sm font-medium hover:underline"
      >
        {view.plan.title}
      </button>
      {view.plan.notes ? (
        <p className="mt-1 line-clamp-3 text-xs whitespace-pre-line text-gray-600 dark:text-gray-300">
          {view.plan.notes}
        </p>
      ) : null}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => act(true)}
          className="rounded bg-violet-600 px-2 py-1 text-xs font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          Aceitar
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => act(false)}
          className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-violet-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-violet-900"
        >
          Descartar
        </button>
      </div>
    </li>
  )
}

export function ScheduleBoard({
  schedule,
  today,
  tagSuggestions,
  slugs,
}: ScheduleBoardProps): ReactElement {
  const [editing, setEditing] = useState<Editing>(null)
  const { suggestions, backlog, months, pastMonths } = schedule
  const close = (): void => setEditing(null)
  const empty = months.length === 0 && backlog.length === 0 && suggestions.length === 0

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Cronograma</h1>
          <p className="text-sm text-gray-500">
            💡 ideia · 📅 agendado · ✏️ rascunho · ✅ publicado · + começar o post naquele idioma
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="bg-primary-500 hover:bg-primary-600 rounded-md px-3 py-2 text-sm font-medium text-white"
        >
          Novo tema
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[20rem_1fr]">
        <aside className="flex flex-col gap-6">
          {suggestions.length > 0 ? (
            <section>
              <h2 className="mb-2 text-sm font-semibold text-violet-700 dark:text-violet-300">
                🤖 Sugestões ({suggestions.length})
              </h2>
              <ul className="flex flex-col gap-2">
                {suggestions.map((view) => (
                  <Suggestion key={view.plan.id} view={view} onEdit={setEditing} />
                ))}
              </ul>
            </section>
          ) : null}

          <section>
            <h2 className="mb-1 text-sm font-semibold">Backlog ({backlog.length})</h2>
            {backlog.length > 0 ? (
              <ul className="divide-y divide-gray-100 dark:divide-gray-900">
                {backlog.map((view) => (
                  <PlanRow key={view.plan.id} view={view} onEdit={setEditing} showDate={false} />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                Ideias sem data aparecem aqui. Dê uma data para mandar para o mês.
              </p>
            )}
          </section>
        </aside>

        <div className="flex flex-col gap-8">
          {months.map((group) => (
            <Month key={group.key} group={group} onEdit={setEditing} />
          ))}
          {months.length === 0 ? (
            <p className="text-sm text-gray-500">
              {empty
                ? 'Nada no cronograma ainda. Comece com "Novo tema".'
                : `Nada agendado a partir de ${formatDateBr(today)}.`}
            </p>
          ) : null}
          {pastMonths.length > 0 ? (
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-500">
                Meses anteriores ({pastMonths.length})
              </summary>
              <div className="mt-4 flex flex-col gap-8">
                {pastMonths.map((group) => (
                  <Month key={group.key} group={group} onEdit={setEditing} />
                ))}
              </div>
            </details>
          ) : null}
        </div>
      </div>

      {editing ? (
        <Modal title={editing === 'new' ? 'Novo tema' : 'Editar tema'} onClose={close}>
          <PlanForm
            plan={editing === 'new' ? null : editing}
            tagSuggestions={tagSuggestions}
            slugs={slugs}
            onDone={close}
          />
        </Modal>
      ) : null}
    </main>
  )
}
