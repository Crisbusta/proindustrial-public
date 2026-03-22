import { test, expect } from '@playwright/test'
import { TEST_ACCOUNTS } from '../../fixtures/test-data'

const PRIMARY_SLUG = TEST_ACCOUNTS.primary.companySlug
const PRIMARY_NAME = TEST_ACCOUNTS.primary.companyName

test.describe('Company Profile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/empresas/${PRIMARY_SLUG}`)
    await expect(page.locator('.profile-hero')).toBeVisible({ timeout: 10000 })
  })

  test('displays company name in hero', async ({ page }) => {
    await expect(page.locator('.profile-hero-name')).toContainText(PRIMARY_NAME)
  })

  test('displays tagline', async ({ page }) => {
    await expect(page.locator('.profile-hero-tagline')).toBeVisible()
    const tagline = await page.locator('.profile-hero-tagline').textContent()
    expect(tagline!.trim().length).toBeGreaterThan(0)
  })

  test('displays company description in About section', async ({ page }) => {
    await expect(page.locator('section').filter({ hasText: 'Acerca de la empresa' })).toBeVisible()
  })

  test('displays services list', async ({ page }) => {
    await expect(page.locator('section').filter({ hasText: 'Servicios ofrecidos' })).toBeVisible()
    const serviceItems = page.locator('section').filter({ hasText: 'Servicios ofrecidos' }).locator('li')
    await expect(serviceItems.first()).toBeVisible()
  })

  test('displays contact information', async ({ page }) => {
    await expect(page.locator('main a[href^="tel:"]')).toBeVisible()
    await expect(page.locator('main a[href^="mailto:"]').first()).toBeVisible()
  })

  test('shows location', async ({ page }) => {
    // Location shows in hero meta
    await expect(page.locator('.profile-hero-meta')).toContainText(/Antofagasta/i)
  })

  test('"Solicitar cotización" button links to quote form', async ({ page }) => {
    const ctaLink = page.locator(`a[href="/cotizar/${PRIMARY_SLUG}"]`).first()
    await expect(ctaLink).toBeVisible()
    await ctaLink.click()
    await expect(page).toHaveURL(`/cotizar/${PRIMARY_SLUG}`)
  })

  test('shows company name in quote page header', async ({ page }) => {
    await page.goto(`/cotizar/${PRIMARY_SLUG}`)
    await expect(page.locator('.page-header')).toContainText(PRIMARY_NAME)
  })

  test('invalid company slug redirects to home', async ({ page }) => {
    await page.goto('/empresas/empresa-que-no-existe-xyz')
    await expect(page).toHaveURL('/', { timeout: 5000 })
  })
})
