import { expect, Page, Locator } from '@playwright/test'

export async function chooseRestoreFiles(
  page: Page,
  files: Parameters<Locator['setInputFiles']>[0]
) {
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByLabel('Choose backup files', { exact: true }).click()
  ])
  await chooser.setFiles(files)
}
export async function chooseVerificationFiles(
  page: Page,
  files: Parameters<Locator['setInputFiles']>[0]
) {
  const input = page.getByLabel('Verify saved backup', { exact: true })
  await expect(input).toBeEnabled()
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    input.click()
  ])
  await chooser.setFiles(files)
}

export const backupEntries = (page: Page) =>
  page
    .getByRole('region', { name: 'Backup file checklist' })
    .locator('[data-backup-file-name]')
export async function selectBackupFile(page: Page, label: string) {
  const save = page.getByRole('button', {
    name: new RegExp('^Save ' + label + ' \\(')
  })
  if (!(await save.count())) {
    const next = page.getByRole('button', {
      name: 'Load next file: ' + label,
      exact: true
    })
    if (await next.isVisible()) await next.click()
    else {
      const select = page.getByRole('button', {
        name: 'Select ' + label,
        exact: true
      })
      if (!(await select.isVisible()))
        await page.getByText('All backup files', { exact: true }).click()
      await select.click()
    }
  }
  await expect(save).toBeEnabled()
  return save
}
export async function openBackupOptions(page: Page) {
  const summary = page.getByText('Advanced backup options', { exact: true })
  if (!((await summary.locator('..').getAttribute('open')) !== null))
    await summary.click()
}
export async function restoreRejected(page: Page, error: string) {
  const button = page.getByRole('button', {
    name: 'Restore library',
    exact: true
  })
  const preview = page.getByRole('region', { name: 'Restore preview' })
  await expect(preview).toBeVisible()
  await expect(preview).not.toHaveAttribute('data-backup-preflight', 'checking')
  if (await button.isEnabled()) await button.click()
  else await expect(button).toBeDisabled()
  await expect(
    page.getByRole('status', { name: 'Restore status' })
  ).toContainText(error)
}
