import { test as setup, expect } from '@playwright/test'
import { fileURLToPath } from 'url'
import path from 'path'
import { TEST_ACCOUNTS } from './fixtures/test-data'
import { apiLogin } from './helpers/api-client'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const AUTH_FILE = path.join(__dirname, '../.auth/acerospacifico.json')

setup('authenticate as primary account', async ({ page }) => {
  // Get JWT token directly from API (fast, no UI interaction needed)
  const token = await apiLogin(TEST_ACCOUNTS.primary.email, TEST_ACCOUNTS.primary.password)
  expect(token).toBeTruthy()

  // Navigate to app and inject token into localStorage
  await page.goto('/')
  await page.evaluate((t) => localStorage.setItem('panelToken', t), token)

  // Verify the token works by hitting the panel
  await page.goto('/panel/dashboard')
  await expect(page).not.toHaveURL(/\/panel\/login/)

  // Save storage state for reuse in panel tests
  await page.context().storageState({ path: AUTH_FILE })
})
