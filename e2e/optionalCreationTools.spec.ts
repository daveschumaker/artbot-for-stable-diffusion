import { expect, test } from '@playwright/test'
import { mockBackend, trackPageErrors } from './helpers'

for (const fromLink of [false, true]) {
  test(`a preset ${
    fromLink ? 'link' : 'selected from the catalog'
  } configures a new image`, async ({ page }) => {
    const errors = trackPageErrors(page)
    const backend = await mockBackend(page)
    await page.goto(
      fromLink
        ? '/artbot/create?preset=albedo&prompt=a%20dog%20in%20sunlight'
        : '/artbot/create?prompt=starting%20prompt'
    )
    const prompt = page.getByPlaceholder('Describe your image')
    if (!fromLink) {
      // Wait for the initial input to load before editing it.
      await expect(prompt).toHaveValue('starting prompt')
      await prompt.fill('a dog in sunlight')
      await page.getByRole('button', { name: 'Presets', exact: true }).click()
      await page
        .getByPlaceholder('Search and filter all presets')
        .fill('albedo')
      // Several presets share a model, so choose the exact preset's row.
      await page
        .getByText('albedo', { exact: true })
        .locator('../..')
        .getByRole('button', { name: 'Use', exact: true })
        .click()
      await expect(
        page.getByPlaceholder('Search and filter all presets')
      ).toBeHidden()
    }
    await expect(prompt).toHaveValue('a dog in sunlight')
    await page.getByTitle('Create new image').first().click()
    await expect.poll(() => backend.submissions.length).toBe(1)
    const request = backend.submissions[0]
    expect(request.models).toEqual(['AlbedoBase XL (SDXL)'])
    expect(request.params).toMatchObject({
      width: 1024,
      height: 1024,
      steps: 8,
      cfg_scale: 2
    })
    expect(request.params.loras).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: '247778' })])
    )
    expect(errors).toEqual([])
  })
}

test('model details and saved LoRA and embedding dialogs open, close, and reopen', async ({
  page
}) => {
  const errors = trackPageErrors(page)
  await mockBackend(page)
  await page.goto('/artbot/create')
  for (let i = 0; i < 2; i++) {
    await page.getByRole('button', { name: 'Browse model details' }).click()
    await expect(page.getByPlaceholder('Filter models by name')).toBeVisible()
    await page.getByPlaceholder('Filter models by name').fill('Deliberate')
    await expect(
      page.getByText('Deliberate', { exact: true }).last()
    ).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByPlaceholder('Filter models by name')).toBeHidden()
  }
  for (const [label, placeholders] of [
    [
      /^LoRAs/,
      ['Search your favorite LORAs', 'Search your recently used LORAs']
    ],
    [
      'Textual Inversions',
      ['Search your favorite embeddings', 'Search recently used embeddings']
    ]
  ] as const) {
    for (const [i, placeholder] of placeholders.entries()) {
      await page
        .getByText(label, { exact: true })
        .locator('..')
        .getByRole('button')
        .nth(i + 1)
        .click()
      await expect(page.getByPlaceholder(placeholder)).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(page.getByPlaceholder(placeholder)).toBeHidden()
    }
  }
  expect(errors).toEqual([])
})
