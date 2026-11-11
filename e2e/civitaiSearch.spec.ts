/**
 * LoRA and embedding searches go through React Query: cached per search,
 * newest search wins, cursor paging and visible errors. CivitAI is mocked.
 */
import { expect, Page, Route, test } from '@playwright/test'
import { mockBackend, trackPageErrors } from './helpers'

const item = (id: number, name: string) => ({
  id,
  name,
  description: '',
  modelVersions: [
    {
      id: id * 10,
      modelId: id,
      name: 'v1',
      baseModel: 'SDXL 1.0',
      files: [{ sizeKB: 100 }],
      images: [],
      trainedWords: []
    }
  ]
})

const batch = (label: string, from: number, count: number) =>
  Array.from({ length: count }, (_, i) =>
    item(from + i, `${label} ${from + i}`)
  )

interface CivitaiMock {
  requests: URL[]
  // Answers a search by its text and cursor.
  respond: (url: URL) => Promise<{ status?: number; body?: unknown }>
}

const mockCivitai = async (page: Page, mock: CivitaiMock) => {
  await page.route(
    'https://civitai.com/api/v1/models**',
    async (route: Route) => {
      const url = new URL(route.request().url())
      mock.requests.push(url)
      const { status = 200, body = {} } = await mock.respond(url)
      // A newer search may have cancelled this one already.
      await route
        .fulfill({
          status,
          contentType: 'application/json',
          headers: { 'access-control-allow-origin': '*' },
          body: JSON.stringify(body)
        })
        .catch(() => {})
    }
  )
}

const searches = (mock: CivitaiMock, text: string) =>
  mock.requests.filter(
    (url) =>
      (url.searchParams.get('query') ?? '') === text &&
      !url.searchParams.has('cursor')
  ).length

const openLoraSearch = async (page: Page) => {
  await page
    .getByText(/^LoRAs/)
    .locator('..')
    .getByRole('button')
    .first()
    .click()
  return page.getByPlaceholder('Search CivitAI for LORAs / Lycoris')
}

const closeModal = async (page: Page) => {
  await page.keyboard.press('Escape')
  await expect(
    page.getByPlaceholder('Search CivitAI for LORAs / Lycoris')
  ).toBeHidden()
}

test('LoRA results load more with the cursor', async ({ page }) => {
  const errors = trackPageErrors(page)
  await mockBackend(page)
  const mock: CivitaiMock = {
    requests: [],
    respond: async (url) =>
      url.searchParams.get('cursor') === 'next-1'
        ? { body: { items: batch('Browse', 21, 5), metadata: {} } }
        : {
            body: {
              items: batch('Browse', 1, 20),
              metadata: { nextCursor: 'next-1' }
            }
          }
  }
  await mockCivitai(page, mock)
  await page.goto('/artbot/create')

  await openLoraSearch(page)
  await expect(page.getByText('Browse 20', { exact: true })).toBeVisible()
  await expect(page.getByText('Browse 21', { exact: true })).toHaveCount(0)

  await page.getByRole('button', { name: 'Load more' }).click()
  await expect(page.getByText('Browse 25', { exact: true })).toBeVisible()
  await expect(page.getByText('Browse 1', { exact: true })).toBeVisible()
  // The last page has no cursor, so there's nothing more to load.
  await expect(page.getByRole('button', { name: 'Load more' })).toHaveCount(0)
  expect(mock.requests.map((url) => url.searchParams.get('cursor'))).toEqual([
    null,
    'next-1'
  ])
  expect(mock.requests.every((url) => !url.searchParams.has('page'))).toBe(true)
  expect(errors).toEqual([])
})

test('a newer LoRA search replaces one still loading', async ({ page }) => {
  await mockBackend(page)
  const mock: CivitaiMock = {
    requests: [],
    respond: async (url) => {
      const query = url.searchParams.get('query') ?? ''
      // The first search is slow, so the second starts while it loads.
      if (query === 'castle') await new Promise((r) => setTimeout(r, 2500))
      return {
        body: { items: batch(query || 'Browse', 1, 3), metadata: {} }
      }
    }
  }
  await mockCivitai(page, mock)
  await page.goto('/artbot/create')
  const box = await openLoraSearch(page)
  await expect(page.getByText('Browse 1', { exact: true })).toBeVisible()

  await box.fill('castle')
  await expect.poll(() => searches(mock, 'castle')).toBe(1)
  await box.fill('dragon')

  await expect(page.getByText('dragon 1', { exact: true })).toBeVisible()
  // The slow search finishing later must not replace the newer results.
  await page.waitForTimeout(3000)
  await expect(page.getByText('dragon 1', { exact: true })).toBeVisible()
  await expect(page.getByText('castle 1', { exact: true })).toHaveCount(0)
})

test('repeated LoRA searches come from the cache', async ({ page }) => {
  await mockBackend(page)
  const mock: CivitaiMock = {
    requests: [],
    respond: async (url) => {
      const query = url.searchParams.get('query') ?? 'Browse'
      return { body: { items: batch(query, 1, 2), metadata: {} } }
    }
  }
  await mockCivitai(page, mock)
  await page.goto('/artbot/create')
  const box = await openLoraSearch(page)
  await expect(page.getByText('Browse 1', { exact: true })).toBeVisible()

  await box.fill('dragon')
  await expect(page.getByText('dragon 1', { exact: true })).toBeVisible()
  await box.fill('castle')
  await expect(page.getByText('castle 1', { exact: true })).toBeVisible()
  await box.fill('dragon')
  await expect(page.getByText('dragon 1', { exact: true })).toBeVisible()

  // Reopening the modal shows the cached results without a new request.
  await closeModal(page)
  await openLoraSearch(page)
  await expect(page.getByText('Browse 1', { exact: true })).toBeVisible()

  expect(searches(mock, 'dragon')).toBe(1)
  expect(searches(mock, 'castle')).toBe(1)
  expect(searches(mock, '')).toBe(1)
})

test('a failed LoRA search says so', async ({ page }) => {
  await mockBackend(page)
  const mock: CivitaiMock = {
    requests: [],
    respond: async () => ({ status: 503, body: { error: 'down' } })
  }
  await mockCivitai(page, mock)
  await page.goto('/artbot/create')
  await openLoraSearch(page)

  await expect(
    page.getByText(
      'Unable to load data from CivitAI, please try again shortly.'
    )
  ).toBeVisible({ timeout: 10000 })
  await expect(
    page.getByText('No matches found. Please try a different search.')
  ).toHaveCount(0)
})

test('embedding searches send their filters and encoded text', async ({
  page
}) => {
  await mockBackend(page)
  await page.addInitScript(() => {
    const settings = JSON.parse(localStorage.getItem('appConfig') || '{}')
    localStorage.setItem(
      'appConfig',
      // Saved settings carry a version, or startup converts them.
      JSON.stringify({ ...settings, v: '1', civitaiShowPony: true })
    )
  })
  const mock: CivitaiMock = {
    requests: [],
    respond: async (url) => ({
      body: {
        items: url.searchParams.get('query') ? batch('Embedding', 1, 1) : [],
        metadata: {}
      }
    })
  }
  await mockCivitai(page, mock)
  await page.goto('/artbot/create')

  await page
    .getByText('Textual Inversions', { exact: true })
    .locator('..')
    .getByRole('button')
    .first()
    .click()
  await expect(page.getByText('Enter a search term to begin...')).toBeVisible()
  // Embeddings need search text, so opening the modal sends nothing.
  expect(mock.requests).toEqual([])

  await page.getByRole('textbox').last().fill('ink & wash')
  await expect(page.getByText('Embedding 1', { exact: true })).toBeVisible()

  const [request] = mock.requests
  expect(request.searchParams.getAll('types')).toEqual(['TextualInversion'])
  expect(request.searchParams.get('query')).toBe('ink & wash')
  expect(request.searchParams.getAll('baseModels')).toEqual(['Pony'])
})
