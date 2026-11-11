/**
 * The feedback form only says a message was sent once it really was.
 */
import { expect, Page, test } from '@playwright/test'
import { mockBackend, trackPageErrors } from './helpers'

const MESSAGE = 'The new inpainting tools are great'

// Later routes take priority over mockBackend's catch-all.
const answerFeedback = (page: Page, statuses: number[]) => {
  const bodies: any[] = []
  return page
    .route('**/artbot/api/telemetry', async (route) => {
      bodies.push(route.request().postDataJSON())
      const status = statuses.shift() ?? 200
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({ status: status === 200 ? 'ok' : 'not ok' })
      })
    })
    .then(() => bodies)
}

// react-textarea-autosize adds a hidden textarea to measure the text.
const messageBox = (page: Page) =>
  page.locator('textarea:not([aria-hidden="true"])')

const fillForm = async (page: Page) => {
  await page.goto('/artbot/contact')
  await page.getByPlaceholder('Email, Discord, etc').fill('artist@example.com')
  await messageBox(page).fill(MESSAGE)
}

test('feedback shows as sent once the server accepts it', async ({ page }) => {
  const errors = trackPageErrors(page)
  await mockBackend(page)
  const bodies = await answerFeedback(page, [200])
  await fillForm(page)

  await page.getByRole('button', { name: 'Send Message' }).click()

  await expect(page.getByText('Your message has been sent')).toBeVisible()
  expect(bodies).toHaveLength(1)
  expect(bodies[0].event).toBe('FEEDBACK_FORM')
  expect(bodies[0].data).toMatchObject({
    contact: 'artist@example.com',
    input: MESSAGE
  })
  expect(errors).toEqual([])
})

test('feedback that fails to send can be sent again', async ({ page }) => {
  const errors = trackPageErrors(page)
  await mockBackend(page)
  const bodies = await answerFeedback(page, [502, 200])
  await fillForm(page)

  await page.getByRole('button', { name: 'Send Message' }).click()

  await expect(
    page.getByText("Your message couldn't be sent. Please try again.")
  ).toBeVisible()
  await expect(page.getByText('Your message has been sent')).toHaveCount(0)
  // The message is still there to send again.
  await expect(messageBox(page)).toHaveValue(MESSAGE)

  await page.getByRole('button', { name: 'Send Message' }).click()

  await expect(page.getByText('Your message has been sent')).toBeVisible()
  expect(bodies).toHaveLength(2)
  expect(errors).toEqual([])
})
