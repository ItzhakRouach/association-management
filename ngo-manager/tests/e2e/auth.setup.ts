import { test as setup, expect } from '@playwright/test'
import path from 'path'

export const STORAGE_STATE = path.join(__dirname, '.auth.json')

setup('authenticate as Danny', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'danny@ngo.org')
  await page.fill('input[type="password"]', 'changeme123')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard', { timeout: 15000 })
  await expect(page).toHaveURL(/\/dashboard/)
  await page.context().storageState({ path: STORAGE_STATE })
})
