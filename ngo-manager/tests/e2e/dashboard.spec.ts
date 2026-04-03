import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('page loads at / and redirects to /dashboard when authenticated', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/(dashboard)?$/)
  })

  test('dashboard page loads and shows title', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByRole('heading', { name: 'דשבורד' })).toBeVisible()
  })

  test('4 KPI stat cards are visible', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('מתנדבים פעילים')).toBeVisible()
    await expect(page.getByText('מבצעים החודש')).toBeVisible()
    await expect(page.getByText('תרומות החודש')).toBeVisible()
    await expect(page.getByText('סה"כ תורמים').or(page.getByText("סה\"כ תורמים"))).toBeVisible()
  })

  test('AlertsPanel renders', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('התראות')).toBeVisible()
  })

  test('sidebar navigation is visible on the right', async ({ page }) => {
    await page.goto('/dashboard')
    // Use nav role links to be specific about sidebar items
    await expect(page.getByRole('link', { name: 'מתנדבים', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'תורמים', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'מבצעים', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'דוחות', exact: true })).toBeVisible()
  })

  test('recent operations section is visible', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('מבצעים אחרונים')).toBeVisible()
  })

  test('recent donations section is visible', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText('תרומות אחרונות')).toBeVisible()
  })
})
