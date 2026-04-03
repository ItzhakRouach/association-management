import { test, expect } from '@playwright/test'

test.describe('Operations', () => {
  test('/operations loads and shows page title', async ({ page }) => {
    await page.goto('/operations')
    await expect(page).toHaveURL('/operations')
    await expect(page.getByRole('heading', { name: 'מבצעים' })).toBeVisible()
  })

  test('operations table is visible with seed data', async ({ page }) => {
    await page.goto('/operations')
    const rows = page.locator('ul > li')
    await expect(rows.first()).toBeVisible()
    const count = await rows.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('table header shows required columns', async ({ page }) => {
    await page.goto('/operations')
    await expect(page.getByText('כותרת').first()).toBeVisible()
    await expect(page.getByText('תאריך').first()).toBeVisible()
    await expect(page.getByText('סטטוס').first()).toBeVisible()
  })

  test('operation status badges are visible', async ({ page }) => {
    await page.goto('/operations')
    // Seed has PLANNED, ACTIVE, COMPLETED operations
    const hasStatus =
      (await page.getByText('מתוכנן').count()) > 0 ||
      (await page.getByText('פעיל').count()) > 0 ||
      (await page.getByText('הושלם').count()) > 0
    expect(hasStatus).toBe(true)
  })

  test('unassigned operations show warning indicator', async ({ page }) => {
    await page.goto('/operations')
    // Seed has 1 upcoming operation with 0 volunteers → shows "0 ⚠"
    await expect(page.getByText(/⚠/).first()).toBeVisible()
  })

  test('footer shows operation summary stats', async ({ page }) => {
    await page.goto('/operations')
    // Footer: "N מבצעים · N פעילים · N ממתינים לשיבוץ"
    const footer = page.locator('p').filter({ hasText: /מבצעים.*פעילים/ })
    await expect(footer).toBeVisible()
  })

  test('/reports loads', async ({ page }) => {
    await page.goto('/reports')
    await expect(page).toHaveURL('/reports')
    await expect(page.getByRole('heading', { name: 'דוחות', exact: true }).first()).toBeVisible()
    // Client component — wait for it to render
    await expect(page.getByRole('button', { name: 'שלח דוח חודשי' })).toBeVisible({ timeout: 10000 })
  })

  test('/settings loads with form fields', async ({ page }) => {
    await page.goto('/settings')
    await expect(page).toHaveURL('/settings')
    await expect(page.getByRole('heading', { name: 'הגדרות' })).toBeVisible()
    await expect(page.getByLabel('שם הארגון')).toBeVisible()
  })
})
