import { describe, expect, it } from 'vitest'
import { auth, memoryPlans, testApp } from './support/memory.js'

const json = { 'content-type': 'application/json' }

describe('/plans', () => {
  it('creates an idea with only a title', async () => {
    const plans = memoryPlans()
    const { app } = testApp({ plans })

    const res = await app.inject({
      method: 'POST',
      url: '/plans',
      payload: { title: '  Server Actions na prática ' },
      headers: { ...json, ...auth },
    })

    expect(res.statusCode).toBe(201)
    expect(res.json()).toMatchObject({
      title: 'Server Actions na prática',
      plannedDate: null,
      slug: null,
      suggested: false,
    })
    expect(plans.plans).toHaveLength(1)
  })

  it('lists dated plans first, soonest first', async () => {
    const plans = memoryPlans()
    const { app } = testApp({ plans })
    for (const payload of [
      { title: 'Idea' },
      { title: 'Later', plannedDate: '2026-11-07' },
      { title: 'Sooner', plannedDate: '2026-10-24' },
    ]) {
      await app.inject({ method: 'POST', url: '/plans', payload, headers: { ...json, ...auth } })
    }

    const res = await app.inject({ method: 'GET', url: '/plans', headers: auth })

    expect(res.json().map((p: { title: string }) => p.title)).toEqual(['Sooner', 'Later', 'Idea'])
  })

  it('patches only the fields sent', async () => {
    const plans = memoryPlans()
    const { app } = testApp({ plans })
    const created = await app.inject({
      method: 'POST',
      url: '/plans',
      payload: { title: 'RSC', tags: ['react'], suggested: true },
      headers: { ...json, ...auth },
    })
    const { id } = created.json()

    const res = await app.inject({
      method: 'PATCH',
      url: `/plans/${id}`,
      payload: { plannedDate: '2026-10-24', locales: ['pt', 'en'], suggested: false },
      headers: { ...json, ...auth },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toMatchObject({
      title: 'RSC',
      tags: ['react'],
      plannedDate: '2026-10-24',
      locales: ['pt', 'en'],
      suggested: false,
    })
  })

  it.each([
    [{ title: '' }],
    [{ title: 'x', plannedDate: '24/10/2026' }],
    [{ title: 'x', slug: 'Not A Slug' }],
    [{ title: 'x', locales: ['fr'] }],
  ])('rejects %j', async (payload) => {
    const { app } = testApp()
    const res = await app.inject({
      method: 'POST',
      url: '/plans',
      payload,
      headers: { ...json, ...auth },
    })
    expect(res.statusCode).toBe(400)
  })

  it('answers 404 for unknown or malformed ids', async () => {
    const { app } = testApp()
    for (const id of [crypto.randomUUID(), 'not-a-uuid']) {
      const res = await app.inject({
        method: 'PATCH',
        url: `/plans/${id}`,
        payload: { title: 'x' },
        headers: { ...json, ...auth },
      })
      expect(res.statusCode).toBe(404)
    }
  })

  it('deletes a plan', async () => {
    const plans = memoryPlans()
    const { app } = testApp({ plans })
    const { id } = (
      await app.inject({
        method: 'POST',
        url: '/plans',
        payload: { title: 'Gone' },
        headers: { ...json, ...auth },
      })
    ).json()

    const res = await app.inject({ method: 'DELETE', url: `/plans/${id}`, headers: auth })

    expect(res.statusCode).toBe(200)
    expect(plans.plans).toHaveLength(0)
  })

  it.each([
    ['GET', '/plans'],
    ['POST', '/plans'],
    ['GET', `/plans/${crypto.randomUUID()}`],
    ['PATCH', `/plans/${crypto.randomUUID()}`],
    ['DELETE', `/plans/${crypto.randomUUID()}`],
  ] as const)('%s %s requires the API key', async (method, url) => {
    const { app } = testApp()
    const res = await app.inject({ method, url, payload: method === 'POST' ? {} : undefined })
    expect(res.statusCode).toBe(401)
  })
})
