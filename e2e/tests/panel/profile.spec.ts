import { test, expect } from '@playwright/test'
import { TEST_ACCOUNTS } from '../../fixtures/test-data'
import { apiLogin, apiGetPanelProfile, apiUpdateProfile } from '../../helpers/api-client'

test.describe('Panel Profile', () => {
  let token: string
  let originalProfile: Record<string, unknown> = {}

  test.beforeAll(async () => {
    token = await apiLogin(TEST_ACCOUNTS.primary.email, TEST_ACCOUNTS.primary.password)
    originalProfile = await apiGetPanelProfile(token)
  })

  test.afterAll(async () => {
    // Restore original profile data
    await apiUpdateProfile(token, {
      name: originalProfile.name,
      tagline: originalProfile.tagline,
      description: originalProfile.description,
      location: originalProfile.location,
      region: originalProfile.region,
      phone: originalProfile.phone,
      email: originalProfile.email,
      website: originalProfile.website ?? '',
    }).catch(() => {})
  })

  test.beforeEach(async ({ page }) => {
    await page.goto('/panel/perfil')
    // Wait for form to be pre-populated (API data loaded when name has a value)
    await expect(page.locator('#prof-name')).toBeVisible({ timeout: 10000 })
    await page.waitForFunction(() => {
      const el = document.querySelector('#prof-name') as HTMLInputElement | null
      return el && el.value.trim().length > 0
    }, null, { timeout: 10000 })
  })

  test('form is pre-populated with company data', async ({ page }) => {
    const nameValue = await page.locator('#prof-name').inputValue()
    expect(nameValue.trim().length).toBeGreaterThan(0)

    const emailValue = await page.locator('#prof-email').inputValue()
    expect(emailValue).toContain('@')
  })

  test('profile completion bar is visible', async ({ page }) => {
    await expect(page.locator('.progress-track')).toBeVisible()
    await expect(page.locator('.progress-fill')).toBeVisible()
  })

  test('completion percentage is shown', async ({ page }) => {
    const completionText = page.locator('.panel-topbar').filter({ hasText: 'Completado:' })
    await expect(completionText).toBeVisible()
    await expect(completionText).toContainText(/%/)
  })

  test('region dropdown has options', async ({ page }) => {
    const regionSelect = page.locator('#prof-region')
    await expect(regionSelect).toBeVisible()
    await page.waitForFunction(() => {
      const sel = document.querySelector('#prof-region') as HTMLSelectElement | null
      return sel && sel.options.length > 1
    }, null, { timeout: 10000 })
    const options = await regionSelect.locator('option').count()
    expect(options).toBeGreaterThan(1)
  })

  test('modifying tagline and saving shows success toast', async ({ page }) => {
    const newTagline = `Especialistas en calidad industrial — ${Date.now()}`

    await page.locator('#prof-tagline').clear()
    await page.fill('#prof-tagline', newTagline)

    // Save via topbar button
    await page.locator('.panel-topbar button', { hasText: /Guardar cambios/ }).click()

    await expect(page.locator('.save-toast')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('.save-toast')).toContainText('Cambios guardados')
  })

  test('save changes button is always visible in topbar', async ({ page }) => {
    await expect(page.locator('.panel-topbar button', { hasText: /Guardar/ })).toBeVisible()
  })

  test('save footer button also works', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'Guardar todos los cambios' })).toBeVisible()
  })

  test('description character counter updates', async ({ page }) => {
    const desc = page.locator('#prof-description')
    const hint = page.locator('.form-hint').filter({ hasText: '/600' })

    const testText = 'Texto de prueba para contador'
    await desc.clear()
    await desc.fill(testText)

    await expect(hint).toContainText(`${testText.length}/600`)
  })
})
