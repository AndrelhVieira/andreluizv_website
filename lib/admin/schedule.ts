import { locales, type Locale, type PostPlan, type PostSummary } from '@andreluizv/shared'

/**
 * The schedule tab's view of the plans. No server-only imports: the board (client) uses the
 * types and the server page builds the schedule.
 */

export type PlanStatus = 'idea' | 'scheduled' | 'draft' | 'published'

export interface PlanView {
  plan: PostPlan
  status: PlanStatus
  /** YYYY-MM-DD: the planned date, or the post's date when the plan has none */
  date: string | null
  /** Its date has passed and it isn't published yet */
  overdue: boolean
  /** Languages it is planned in, plus any it already has a post in */
  locales: Locale[]
  /** The linked post in each language that has one */
  posts: Partial<Record<Locale, PostSummary>>
}

export interface MonthGroup {
  /** YYYY-MM */
  key: string
  /** "outubro de 2026" */
  label: string
  items: PlanView[]
}

export interface Schedule {
  /** Added from the CLI, waiting to be accepted */
  suggestions: PlanView[]
  /** Ideas without a date */
  backlog: PlanView[]
  /** Months with something planned, from the oldest still unfinished */
  months: MonthGroup[]
  /** Earlier months where everything got published */
  pastMonths: MonthGroup[]
}

export const STATUS_LABELS: Record<PlanStatus, { icon: string; label: string }> = {
  idea: { icon: '💡', label: 'Ideia' },
  scheduled: { icon: '📅', label: 'Agendado' },
  draft: { icon: '✏️', label: 'Rascunho' },
  published: { icon: '✅', label: 'Publicado' },
}

/** Today in Brazil (YYYY-MM-DD); the server runs in UTC */
export function todayInBrazil(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
}

export function toPlanView(plan: PostPlan, allPosts: PostSummary[], today: string): PlanView {
  const posts: PlanView['posts'] = {}
  if (plan.slug) {
    for (const post of allPosts) {
      if (post.slug === plan.slug) posts[post.locale] = post
    }
  }
  const linked = locales.filter((l) => posts[l])
  const wanted = plan.locales.length > 0 ? plan.locales : linked

  let status: PlanStatus
  if (linked.length > 0 && wanted.every((l) => posts[l] && !posts[l].draft)) {
    status = 'published'
  } else if (linked.length > 0) {
    status = 'draft'
  } else {
    status = plan.plannedDate ? 'scheduled' : 'idea'
  }

  const postDate = linked.flatMap((l) => posts[l]?.date.slice(0, 10) ?? []).sort()[0] ?? null
  const date = plan.plannedDate ?? postDate
  return {
    plan,
    status,
    date,
    overdue: status !== 'published' && date !== null && date < today,
    locales: locales.filter((l) => wanted.includes(l) || posts[l]),
    posts,
  }
}

function monthLabel(key: string): string {
  return new Date(`${key}-15T12:00:00Z`).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function buildSchedule(plans: PostPlan[], posts: PostSummary[], today: string): Schedule {
  const views = plans.map((plan) => toPlanView(plan, posts, today))
  const byMonth = new Map<string, PlanView[]>()
  const backlog: PlanView[] = []
  const suggestions: PlanView[] = []

  for (const view of views) {
    if (view.plan.suggested) {
      suggestions.push(view)
    } else if (!view.date) {
      backlog.push(view)
    } else {
      const key = view.date.slice(0, 7)
      byMonth.set(key, [...(byMonth.get(key) ?? []), view])
    }
  }

  const currentMonth = today.slice(0, 7)
  const months: MonthGroup[] = []
  const pastMonths: MonthGroup[] = []
  for (const [key, unsorted] of [...byMonth].sort(([a], [b]) => a.localeCompare(b))) {
    const items = unsorted.sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
    const group = { key, label: monthLabel(key), items }
    const finished = items.every((item) => item.status === 'published')
    if (key < currentMonth && finished) pastMonths.push(group)
    else months.push(group)
  }

  return { suggestions, backlog, months, pastMonths: pastMonths.reverse() }
}

/**
 * Where "start this post in <locale>" goes: a translation of the plan's post when it
 * already exists in another language, otherwise a new post filled from the plan.
 */
export function startPostHref(view: PlanView, locale: Locale): string {
  const source = locales.find((l) => view.posts[l])
  const from = source && view.plan.slug ? `&from=${source}/${view.plan.slug}` : ''
  return `/admin/new/${locale}?plan=${view.plan.id}${from}`
}
