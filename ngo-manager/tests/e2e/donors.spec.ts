import { test, expect } from '@playwright/test'

test.describe('Donors', () => {
  test('/donors loads and shows page title', async ({ page }) => {
    await page.goto('/donors')
    await expect(page).toHaveURL('/donors')
    await expect(page.getByRole('heading', { name: 'תורמים' })).toBeVisible()
  })

  test('donors table is visible with seed data', async ({ page }) => {
    await page.goto('/donors')
    const rows = page.locator('ul > li')
    await expect(rows.first()).toBeVisible()
    const count = await rows.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('donor rows show name and total donated columns', async ({ page }) => {
    await page.goto('/donors')
    await expect(page.getByText('שם', { exact: true }).first()).toBeVisible()
    // ₪ symbol appears in donation amounts
    await expect(page.locator('text=₪').first()).toBeVisible()
  })

  test('cooling badge is visible on cooling donors', async ({ page }) => {
    await page.goto('/donors')
    // Seed has 2 cooling donors — "מתקרר" badge should appear
    await expect(page.getByText('מתקרר').first()).toBeVisible()
  })

  test('footer shows donor count and cooling count', async ({ page }) => {
    await page.goto('/donors')
    // Footer: "N תורמים · N מתקררים" — locate the paragraph containing both
    const footer = page.locator('p').filter({ hasText: /מתקררים/ })
    await expect(footer).toBeVisible()
  })

  test('status labels are present', async ({ page }) => {
    await page.goto('/donors')
    // Should have at least one "פעיל" or "מתקרר" or "חדש" status
    const statusExists =
      (await page.getByText('פעיל').count()) > 0 ||
      (await page.getByText('מתקרר').count()) > 0 ||
      (await page.getByText('חדש').count()) > 0
    expect(statusExists).toBe(true)
  })
})
