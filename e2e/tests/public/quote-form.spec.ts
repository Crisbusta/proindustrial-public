import { test, expect } from '@playwright/test'
import { TEST_ACCOUNTS } from '../../fixtures/test-data'

const COMPANY_SLUG = TEST_ACCOUNTS.primary.companySlug
const COMPANY_NAME = TEST_ACCOUNTS.primary.companyName

test.describe('Quote Form', () => {
  test('form renders without company (open quote)', async ({ page }) => {
    await page.goto('/cotizar')
    await expect(page.locator('form[aria-label="Formulario de cotización"]')).toBeVisible()
    await expect(page.locator('#name')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#service')).toBeVisible()
  })

  test('form shows company name when directed to a company', async ({ page }) => {
    await page.goto(`/cotizar/${COMPANY_SLUG}`)
    await expect(page.locator('.page-header')).toContainText(COMPANY_NAME, { timeout: 10000 })
  })

  test('service dropdown has options (company context)', async ({ page }) => {
    await page.goto(`/cotizar/${COMPANY_SLUG}`)
    // Wait for company name in header (confirms API loaded)
    await expect(page.locator('.page-header')).toContainText(COMPANY_NAME, { timeout: 10000 })
    const serviceSelect = page.locator('#service')
    await expect(serviceSelect).toBeVisible()
    const options = await serviceSelect.locator('option').count()
    expect(options).toBeGreaterThan(1) // At least placeholder + 1 service
  })

  test('service dropdown has categories (open context)', async ({ page }) => {
    await page.goto('/cotizar')
    const serviceSelect = page.locator('#service')
    await expect(serviceSelect).toBeVisible({ timeout: 10000 })
    // Wait for categories to load from API
    await page.waitForFunction(() => {
      const sel = document.querySelector('#service') as HTMLSelectElement | null
      return sel && sel.options.length > 1
    }, null, { timeout: 10000 })
    const options = await serviceSelect.locator('option').count()
    expect(options).toBeGreaterThan(1)
  })

  test('successful form submission shows success screen', async ({ page }) => {
    await page.goto(`/cotizar/${COMPANY_SLUG}`)

    // Wait for form and service options to load
    await expect(page.locator('#service')).toBeVisible({ timeout: 10000 })
    const options = await page.locator('#service option').allTextContents()
    const firstService = options.find(o => o.trim() && !o.includes('Seleccionar'))

    await page.fill('#name', 'Juan Test')
    await page.fill('#company-name', 'Empresa Test S.A.')
    await page.fill('#email', 'test@empresa.cl')
    await page.fill('#location', 'Santiago, Región Metropolitana')
    await page.fill('#description', 'Necesito cotización para instalación de tuberías PEAD en terreno industrial. Plazo estimado 30 días.')

    if (firstService) {
      await page.locator('#service').selectOption({ label: firstService.trim() })
    }

    await page.click('button[type="submit"]')

    // Should show success card
    await expect(page.locator('.success-card')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('.success-card')).toContainText('Solicitud enviada')
  })

  test('cancel button navigates back to company profile', async ({ page }) => {
    await page.goto(`/cotizar/${COMPANY_SLUG}`)
    const cancelBtn = page.locator('a', { hasText: 'Cancelar' })
    await expect(cancelBtn).toBeVisible()
    await cancelBtn.click()
    await expect(page).toHaveURL(`/empresas/${COMPANY_SLUG}`)
  })

  test('cancel button on open quote navigates to home', async ({ page }) => {
    await page.goto('/cotizar')
    const cancelBtn = page.locator('a', { hasText: 'Cancelar' })
    await expect(cancelBtn).toBeVisible()
    await cancelBtn.click()
    await expect(page).toHaveURL('/')
  })
})
