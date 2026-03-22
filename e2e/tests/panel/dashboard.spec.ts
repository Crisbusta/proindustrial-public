import { test, expect } from '@playwright/test'

test.describe('Panel Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/panel/dashboard')
    await expect(page.locator('.kpi-grid')).toBeVisible({ timeout: 10000 })
  })

  test('three KPI cards render', async ({ page }) => {
    const kpiCards = page.locator('.kpi-card')
    await expect(kpiCards).toHaveCount(3)
  })

  test('KPI cards show real numbers from API', async ({ page }) => {
    // Values should not be the loading placeholder "—"
    const kpiValues = page.locator('.kpi-value')
    await expect(kpiValues.first()).toBeVisible({ timeout: 10000 })
    // Wait for API data to replace placeholders
    await expect(kpiValues.first()).not.toHaveText('—', { timeout: 10000 })

    for (const card of await kpiValues.all()) {
      const text = await card.textContent()
      expect(text).not.toBe('—')
    }
  })

  test('KPI labels are correct', async ({ page }) => {
    const labels = await page.locator('.kpi-label').allTextContents()
    expect(labels).toContain('Solicitudes nuevas')
    expect(labels).toContain('Servicios publicados')
    expect(labels).toContain('Perfil completado')
  })

  test('recent requests table renders', async ({ page }) => {
    await expect(page.locator('.panel-table')).toBeVisible({ timeout: 10000 })
  })

  test('"Agregar servicio" link goes to /panel/servicios', async ({ page }) => {
    await page.locator('a[href="/panel/servicios"]').first().click()
    await expect(page).toHaveURL('/panel/servicios')
  })

  test('"Editar perfil" link goes to /panel/perfil', async ({ page }) => {
    // Use the quick-actions card link (always visible, doesn't need API data)
    const editLink = page.locator('.dashboard-quick-actions a[href="/panel/perfil"]')
    await expect(editLink).toBeVisible({ timeout: 10000 })
    await editLink.click()
    await expect(page).toHaveURL('/panel/perfil')
  })

  test('sidebar has all navigation items', async ({ page }) => {
    const navItems = page.locator('.panel-nav-item')
    await expect(navItems).not.toHaveCount(0)

    const navTexts = await navItems.allTextContents()
    const allText = navTexts.join(' ')
    expect(allText).toMatch(/Resumen/)
    expect(allText).toMatch(/Solicitudes/)
    expect(allText).toMatch(/servicios/i)
    expect(allText).toMatch(/Perfil/)
  })

  test('company name appears in sidebar', async ({ page }) => {
    const companyName = page.locator('.panel-sidebar-company-name')
    await expect(companyName).toBeVisible({ timeout: 10000 })
    const text = await companyName.textContent()
    expect(text!.trim().length).toBeGreaterThan(0)
  })

  test('logout button redirects to /panel/login', async ({ page }) => {
    // Click logout in sidebar footer
    await page.locator('.panel-nav-footer button').click()
    await expect(page).toHaveURL('/panel/login', { timeout: 5000 })
  })

  test('topbar shows "Resumen" title', async ({ page }) => {
    await expect(page.locator('.panel-topbar-title')).toContainText('Resumen')
  })
})
