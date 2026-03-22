import { test, expect } from '@playwright/test'
import { TEST_ACCOUNTS } from '../../fixtures/test-data'

// Panel login tests do NOT use storageState — they test the login flow itself
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Panel Login', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth
    await page.goto('/panel/login')
    await expect(page.locator('#login-email')).toBeVisible()
  })

  test('login page renders correctly', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Acceder al panel')
    await expect(page.locator('#login-email')).toBeVisible()
    await expect(page.locator('#login-password')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toContainText('Acceder al panel')
  })

  test('demo account buttons are visible', async ({ page }) => {
    const demoButtons = page.locator('[data-testid="demo-account-btn"]')
    const count = await demoButtons.count()
    expect(count).toBeGreaterThan(0)
  })

  test('demo account button fills email and correct password', async ({ page }) => {
    // Click the first demo account button
    await page.locator('[data-testid="demo-account-btn"]').first().click()

    const emailValue = await page.locator('#login-email').inputValue()
    const passwordValue = await page.locator('#login-password').inputValue()

    expect(emailValue).toContain('@')
    // Password must be demo123, NOT demo1234 (bug was fixed)
    expect(passwordValue).toBe('demo123')
  })

  test('successful login redirects to dashboard', async ({ page }) => {
    await page.fill('#login-email', TEST_ACCOUNTS.primary.email)
    await page.fill('#login-password', TEST_ACCOUNTS.primary.password)
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/panel/dashboard', { timeout: 10000 })
  })

  test('incorrect password shows error message', async ({ page }) => {
    await page.fill('#login-email', TEST_ACCOUNTS.primary.email)
    await page.fill('#login-password', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 })
  })

  test('empty fields show error message', async ({ page }) => {
    await page.click('button[type="submit"]')
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 3000 })
    await expect(page.locator('[role="alert"]')).toContainText(/correo.*contraseña/i)
  })

  test('password toggle shows and hides password', async ({ page }) => {
    await page.fill('#login-password', 'testpassword')

    // Initially password type
    await expect(page.locator('#login-password')).toHaveAttribute('type', 'password')

    // Click toggle button (the eye icon button)
    await page.locator('button[aria-label*="ontraseña"]').click()
    await expect(page.locator('#login-password')).toHaveAttribute('type', 'text')

    // Click again to hide
    await page.locator('button[aria-label*="ontraseña"]').click()
    await expect(page.locator('#login-password')).toHaveAttribute('type', 'password')
  })

  test('"Regístrala aquí" link navigates to /registrar', async ({ page }) => {
    await page.locator('a[href="/registrar"]').click()
    await expect(page).toHaveURL('/registrar')
  })
})
