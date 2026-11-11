/**
 * Horde lookups that go through React Query: the user's workers in the
 * header menu, shared API keys and the worker list. The Horde is mocked.
 */
import { expect, Page, Route, test } from '@playwright/test'
import { mockBackend, trackPageErrors } from './helpers'

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({
    status,
    contentType: 'application/json',
    headers: { 'access-control-allow-origin': '*' },
    body: JSON.stringify(body)
  })

const worker = (id: string, name: string, overrides = {}) => ({
  id,
  name,
  type: 'image',
  online: true,
  maintenance_mode: false,
  requests_fulfilled: 1000,
  kudos_rewards: 5000,
  uptime: 36000,
  performance: '1.5 megapixelsteps per second',
  threads: 1,
  max_pixels: 1048576,
  models: [],
  team: { id: null, name: null },
  ...overrides
})

const sharedKeys: Record<string, { id: string; name: string; kudos: number }> =
  {
    'key-a': { id: 'key-a', name: 'Friends', kudos: 1000 },
    'key-b': { id: 'key-b', name: 'Family', kudos: 2500 }
  }

interface Horde {
  requests: { method: string; path: string; body?: any }[]
  failWorkerUpdates: boolean
}

// A logged-in user with two workers and two shared keys.
const mockHordeUser = async (page: Page): Promise<Horde> => {
  const horde: Horde = { requests: [], failWorkerUpdates: false }
  await page.addInitScript(() => {
    localStorage.setItem(
      'appConfig',
      JSON.stringify({ v: '1', apiKey: 'test-only-api-key' })
    )
  })
  await page.route(/aihorde\.net\/api\/v2\//, async (route) => {
    const request = route.request()
    const { pathname } = new URL(request.url())
    const path = pathname.replace(/^\/api\/v2/, '')
    horde.requests.push({
      method: request.method(),
      path,
      body: request.postDataJSON?.() ?? undefined
    })

    if (path === '/find_user') {
      return json(route, {
        username: 'tester#1',
        kudos: 100,
        kudos_details: {
          accumulated: 0,
          gifted: 0,
          admin: 0,
          received: 0,
          recurring: 0,
          awarded: 0
        },
        records: {
          request: { image: 0, text: 0, interrogation: 0 },
          fulfillment: { image: 0, text: 0, interrogation: 0 },
          usage: { megapixelsteps: 0, tokens: 0 },
          contribution: { megapixelsteps: 0, tokens: 0 }
        },
        worker_ids: ['worker-a', 'worker-b'],
        sharedkey_ids: ['key-a', 'key-b']
      })
    }
    if (path === '/workers' && request.method() === 'GET') {
      return json(route, [
        worker('worker-a', 'Alpha GPU'),
        worker('worker-b', 'Beta GPU')
      ])
    }
    const workerMatch = path.match(/^\/workers\/(worker-[ab])$/)
    if (workerMatch) {
      if (request.method() === 'PUT') {
        return horde.failWorkerUpdates
          ? route.abort('failed')
          : json(route, { maintenance: true })
      }
      const id = workerMatch[1]
      return json(
        route,
        worker(id, id === 'worker-a' ? 'Alpha GPU' : 'Beta GPU')
      )
    }
    const keyMatch = path.match(/^\/sharedkeys\/(key-[ab])$/)
    if (keyMatch) {
      const key = sharedKeys[keyMatch[1]]
      if (request.method() === 'PATCH') {
        return json(route, { ...key, ...request.postDataJSON() })
      }
      return json(route, key)
    }
    return route.fallback()
  })
  return horde
}

const openHordeMenu = (page: Page) =>
  page
    .locator('button:has(svg.tabler-icon-device-desktop-analytics)')
    .first()
    .click()

test('the shared keys panel shows every key', async ({ page }) => {
  const errors = trackPageErrors(page)
  await mockBackend(page)
  await mockHordeUser(page)
  await page.goto('/artbot/settings')

  // Each key loads its own details. Before, only the last key kept them.
  for (const key of Object.values(sharedKeys)) {
    await expect(page.getByText(key.name, { exact: true })).toBeVisible()
    await expect(
      page.getByText(`Kudos: ${key.kudos}`, { exact: true })
    ).toBeVisible()
  }
  expect(errors).toEqual([])
})

test('editing a shared key changes only its kudos', async ({ page }) => {
  await mockBackend(page)
  const horde = await mockHordeUser(page)
  await page.goto('/artbot/settings')
  // Each key's row: its details, then delete, edit and copy buttons.
  const row = page.locator('div.font-mono', { hasText: 'API key: key-a' })
  await expect(page.getByText('Friends', { exact: true })).toBeVisible()

  await row.getByRole('button').nth(1).click()
  await page.locator('#inputKeyKudos').fill('750')
  await page.getByRole('button', { name: 'Update', exact: true }).click()

  await expect(page.getByText('Kudos: 750', { exact: true })).toBeVisible()
  await expect(page.getByText('Friends', { exact: true })).toBeVisible()
  const patch = horde.requests.find((r) => r.method === 'PATCH')
  // It used to send name: 'TestFlight1', renaming the key.
  expect(patch).toEqual({
    method: 'PATCH',
    path: '/sharedkeys/key-a',
    body: { kudos: 750 }
  })
})

test('a failed pause from the header menu clears its spinner', async ({
  page
}) => {
  await mockBackend(page)
  const horde = await mockHordeUser(page)
  horde.failWorkerUpdates = true
  await page.goto('/artbot/create')
  await openHordeMenu(page)
  await expect(page.getByText('Alpha GPU', { exact: true })).toBeVisible()
  await expect(page.getByText('Beta GPU', { exact: true })).toBeVisible()

  const alpha = page.locator('div', { hasText: /^Alpha GPU$/ }).locator('..')
  await alpha.getByRole('button').first().click()

  await expect
    .poll(() => horde.requests.filter((r) => r.method === 'PUT').length)
    .toBe(1)
  // The request failed. The worker is reloaded and the spinner goes away,
  // instead of staying until the page is reloaded.
  await expect(alpha.locator('.loading-spinner')).toHaveCount(0, {
    timeout: 5000
  })
  await expect(alpha.getByRole('button').first()).toBeEnabled()
})

test('pages share one cached copy of the worker list', async ({ page }) => {
  await mockBackend(page)
  const horde = await mockHordeUser(page)
  await page.goto('/artbot/info/workers')
  await expect(page.getByText('Alpha GPU').first()).toBeVisible()

  // Navigate within the app, which keeps the query cache.
  const go = async (item: string, path: string) => {
    await page.getByTitle('View model details').click()
    await page.getByText(item, { exact: true }).click()
    await page.waitForURL(`**${path}`)
  }
  await go('All models', '/artbot/info/models')
  await go('All workers', '/artbot/info/workers')
  await expect(page.getByText('Alpha GPU').first()).toBeVisible()

  expect(
    horde.requests.filter((r) => r.method === 'GET' && r.path === '/workers')
  ).toHaveLength(1)
})
