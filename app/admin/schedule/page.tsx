import { AdminHeader } from '@/components/admin/AdminHeader'
import { ScheduleBoard } from '@/components/admin/ScheduleBoard'
import { listAllPosts, listPlans } from 'lib/admin/content'
import { buildSchedule, todayInBrazil } from 'lib/admin/schedule'
import { requireAdmin } from 'lib/admin/session'
import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = { title: 'Cronograma' }

export default async function SchedulePage(): Promise<ReactElement> {
  const session = await requireAdmin()
  const [plans, posts] = await Promise.all([listPlans(), listAllPosts()])
  const today = todayInBrazil()

  return (
    <>
      <AdminHeader name={session.name} />
      <ScheduleBoard
        schedule={buildSchedule(plans, posts, today)}
        today={today}
        tagSuggestions={[...new Set(posts.flatMap((post) => post.tags))].sort()}
        slugs={[...new Set(posts.map((post) => post.slug))].sort()}
      />
    </>
  )
}
