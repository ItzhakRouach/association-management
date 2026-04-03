import { test, expect } from '@playwright/test'

test.describe('Volunteers', () => {
  test('/volunteers loads and shows page title', async ({ page }) => {
    await page.goto('/volunteers')
    await expect(page).toHaveURL('/volunteers')
    await expect(page.getByRole('heading', { name: 'מתנדבים' })).toBeVisible()
  })

  test('volunteers table is visible with seed data', async ({ page }) => {
    await page.goto('/volunteers')
    // Seed contains 10 volunteers — table rows should be present
    const rows = page.locator('ul > li')
    await expect(rows.first()).toBeVisible()
    const count = await rows.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('volunteer rows show name, status and impact score columns', async ({ page }) => {
    await page.goto('/volunteers')
    // Header columns
    await expect(page.getByText('שם', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('סטטוס').first()).toBeVisible()
    await expect(page.getByText('ציון').first()).toBeVisible()
  })

  test('shows active/inactive status labels', async ({ page }) => {
    await page.goto('/volunteers')
    // At least one "פעיל" label from seed data
    await expect(page.getByText('פעיל').first()).toBeVisible()
  })

  test('shows link to impact leaderboard', async ({ page }) => {
    await page.goto('/volunteers')
    await expect(page.getByText('לוח כבוד').or(page.getByText('ציוני השפעה'))).toBeVisible()
  })

  test('/volunteers/impact loads leaderboard', async ({ page }) => {
    await page.goto('/volunteers/impact')
    await expect(page).toHaveURL('/volunteers/impact')
    await expect(page.getByText('ציוני השפעה')).toBeVisible()
    await expect(page.getByText('לוח כבוד מתנדבים')).toBeVisible()
  })
})
