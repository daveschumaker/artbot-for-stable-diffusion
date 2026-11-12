import { expect, test } from '@playwright/test'
import {
  expectImageToDisplay,
  finishFixtureSetup,
  mockBackend,
  trackPageErrors
} from './helpers'

test('a historical saved prompt with undefined optional lists reopens and creates an image', async ({
  page
}) => {
  const errors = trackPageErrors(page)
  const backend = await mockBackend(page)
  await page.goto('/artbot/create')
  await page.waitForFunction(() => !!(window as any)._artbotDb?.settings)
  await finishFixtureSetup(page)
  await page.evaluate(async () => {
    const table = (window as any)._artbotDb.settings
    await table.where('name').equals('promptInput').delete()
    await table.add({
      name: 'promptInput',
      setting: {
        prompt: 'a remembered dog in sunlight',
        models: ['Deliberate'],
        width: 512,
        height: 512,
        loras: undefined,
        tis: undefined,
        preset: undefined,
        upscaled: undefined,
        workflow: undefined,
        extra_texts: undefined
      }
    })
  })
  await page.reload()
  await expect(page.getByPlaceholder('Describe your image')).toHaveValue(
    'a remembered dog in sunlight'
  )
  await page.getByTitle('Create new image').first().click()
  await expect.poll(() => backend.submissions.length).toBe(1)
  expect(backend.submissions[0].models).toEqual(['Deliberate'])
  await expect
    .poll(() =>
      page.evaluate(() => (window as any)._artbotDb.completed.count())
    )
    .toBe(1)
  await page.goto('/artbot/images')
  await expectImageToDisplay(page, 'a remembered dog in sunlight')
  expect(errors).toEqual([])
})
