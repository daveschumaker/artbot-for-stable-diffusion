import { expect, test } from '@playwright/test'
import { mockBackend, trackPageErrors } from './helpers'

test('the changelog opens on the newest year and collapses the archive', async ({
  page
}) => {
  const errors = trackPageErrors(page)
  await mockBackend(page)
  await page.goto('/artbot/changelog')

  const years = page.locator('details[id^="year-"]')
  await expect(years.first()).toHaveAttribute('open', '')
  await expect(
    page.getByText('Next.js 16, React 19', { exact: false })
  ).toBeVisible()

  // Older years are collapsed, and open when clicked.
  const year2023 = page.locator('#year-2023')
  await expect(year2023).not.toHaveAttribute('open')
  await expect(page.locator('[id="2023-01-02"]')).toBeHidden()
  await year2023.locator('summary').click()
  await expect(page.locator('[id="2023-01-02"]')).toBeVisible()

  // Every year from the archive is listed.
  await expect(
    page.getByRole('navigation', { name: 'Changelog years' }).getByRole('link')
  ).toHaveText(['2026', '2025', '2024', '2023', '2022'])
  expect(errors).toEqual([])
})

test('a link to an archived entry opens its year', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/artbot/changelog#2022-10-09')

  await expect(page.locator('#year-2022')).toHaveAttribute('open', '')
  await expect(page.locator('[id="2022-10-09"]')).toBeInViewport()
  await expect(
    page
      .locator('[id="2022-10-09"]')
      .getByRole('link', { name: 'October 9, 2022' })
  ).toBeVisible()
})

test('site links in entries keep the /artbot base path', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/artbot/changelog#year-2023')

  const link = page
    .locator('#year-2023')
    .locator('a[href^="/artbot/settings"]')
    .first()
  await expect(link).toBeVisible()
})
