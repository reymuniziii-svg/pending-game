import { test, expect } from '@playwright/test'

test('title screen renders', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/')
  await expect(page).toHaveTitle(/pending/i)
  await expect(page.locator('#root')).toBeVisible()
})
