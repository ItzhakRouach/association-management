import { test, expect } from '@playwright/test'

// ── Operations: click row → detail modal ─────────────────────────────────────
test.describe('Operations detail modal', () => {
  test('clicking a row opens the detail modal', async ({ page }) => {
    await page.goto('/operations')
    const firstRow = page.locator('ul > li').first()
    await firstRow.click()
    await expect(page.locator('[class*="fixed"]').filter({ hasText: 'שיבוץ מתנדבים' })).toBeVisible({ timeout: 5000 })
  })

  test('modal shows operation title and AI assign button', async ({ page }) => {
    await page.goto('/operations')
    await page.locator('ul > li').first().click()
    await expect(page.getByRole('button', { name: /שבץ אוטומטית עם AI/ })).toBeVisible({ timeout: 5000 })
  })

  test('modal shows assigned volunteers section', async ({ page }) => {
    await page.goto('/operations')
    await page.locator('ul > li').first().click()
    await expect(page.getByText('מתנדבים משובצים')).toBeVisible({ timeout: 5000 })
  })

  test('modal closes on סגור button', async ({ page }) => {
    await page.goto('/operations')
    await page.locator('ul > li').first().click()
    await expect(page.getByRole('button', { name: 'סגור' })).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: 'סגור' }).click()
    await expect(page.locator('[class*="fixed"]').filter({ hasText: 'שיבוץ מתנדבים' })).not.toBeVisible()
  })
})

// ── Donors: add donor modal ───────────────────────────────────────────────────
test.describe('Donors CRUD', () => {
  test('הוסף תורם button opens modal', async ({ page }) => {
    await page.goto('/donors')
    await page.getByRole('button', { name: 'הוסף תורם' }).click()
    await expect(page.getByRole('heading', { name: 'הוספת תורם' })).toBeVisible()
  })

  test('add donor modal has required fields', async ({ page }) => {
    await page.goto('/donors')
    await page.getByRole('button', { name: 'הוסף תורם' }).click()
    await expect(page.getByText('שם מלא', { exact: false }).first()).toBeVisible()
    await expect(page.locator('input[type="email"]').first()).toBeVisible()
  })

  test('add donor modal closes on ביטול', async ({ page }) => {
    await page.goto('/donors')
    await page.getByRole('button', { name: 'הוסף תורם' }).click()
    await page.getByRole('button', { name: 'ביטול' }).click()
    await expect(page.getByRole('heading', { name: 'הוספת תורם' })).not.toBeVisible()
  })

  test('הוסף תרומה global button opens donation modal', async ({ page }) => {
    await page.goto('/donors')
    await page.getByRole('button', { name: 'הוסף תרומה' }).first().click()
    await expect(page.getByRole('heading', { name: 'הוספת תרומה' })).toBeVisible()
  })

  test('donation modal has amount field', async ({ page }) => {
    await page.goto('/donors')
    await page.getByRole('button', { name: 'הוסף תרומה' }).first().click()
    await expect(page.locator('input[type="number"]')).toBeVisible()
  })
})

// ── Volunteers: add volunteer modal ──────────────────────────────────────────
test.describe('Volunteers CRUD', () => {
  test('הוסף מתנדב button opens modal', async ({ page }) => {
    await page.goto('/volunteers')
    await page.getByRole('button', { name: 'הוסף מתנדב' }).click()
    await expect(page.getByRole('heading', { name: 'הוספת מתנדב' })).toBeVisible()
  })

  test('add volunteer modal has required fields', async ({ page }) => {
    await page.goto('/volunteers')
    await page.getByRole('button', { name: 'הוסף מתנדב' }).click()
    await expect(page.getByText('שם מלא', { exact: false }).first()).toBeVisible()
    await expect(page.locator('input[type="email"]').first()).toBeVisible()
  })

  test('volunteer modal shows Hebrew skills', async ({ page }) => {
    await page.goto('/volunteers')
    await page.getByRole('button', { name: 'הוסף מתנדב' }).click()
    await expect(page.getByText('כישורים', { exact: false }).first()).toBeVisible()
    // At least one skill button should appear
    const skillsVisible =
      (await page.getByRole('button', { name: 'נהיגה' }).count()) > 0 ||
      (await page.getByRole('button', { name: 'בישול' }).count()) > 0
    expect(skillsVisible).toBe(true)
  })

  test('honor board link is visible and prominent', async ({ page }) => {
    await page.goto('/volunteers')
    await expect(page.getByRole('link', { name: /לוח כבוד/ })).toBeVisible()
  })

  test('impact page has עדכן ציונים button', async ({ page }) => {
    await page.goto('/volunteers/impact')
    await expect(page.getByRole('button', { name: 'עדכן ציונים' })).toBeVisible()
  })
})

// ── Reports page ─────────────────────────────────────────────────────────────
test.describe('Reports', () => {
  test('שלח דוח חודשי button is visible', async ({ page }) => {
    await page.goto('/reports')
    await expect(page.getByRole('button', { name: 'שלח דוח חודשי' })).toBeVisible({ timeout: 10000 })
  })

  test('month and year selectors are present', async ({ page }) => {
    await page.goto('/reports')
    await expect(page.locator('select')).toBeVisible()
    await expect(page.locator('input[type="number"]')).toBeVisible()
  })
})
