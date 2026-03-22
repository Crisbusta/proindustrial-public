import { test, expect } from '@playwright/test'

test.describe('Category Page', () => {
  test('loads company list for valid category slug', async ({ page }) => {
    await page.goto('/servicios/termofusion')
    await expect(page.locator('.page-header')).toBeVisible()

    // Wait for API to return companies
    const filterBar = page.locator('.filter-bar')
    await expect(filterBar).toBeVisible({ timeout: 10000 })

    // Should show at least the company count
    await expect(page.locator('.filter-count')).toBeVisible()
  })

  test('shows category name in header', async ({ page }) => {
    await page.goto('/servicios/termofusion')
    await expect(page.locator('h1')).toBeVisible()
    const heading = await page.locator('h1').textContent()
    expect(heading).toBeTruthy()
    expect(heading!.length).toBeGreaterThan(0)
  })

  test('region filter select is populated', async ({ page }) => {
    await page.goto('/servicios/termofusion')

    const regionSelect = page.locator('#region-filter')
    await expect(regionSelect).toBeVisible({ timeout: 10000 })
    // Wait for regions to load from API (more than the default "Todas las regiones")
    await page.waitForFunction(() => {
      const sel = document.querySelector('#region-filter') as HTMLSelectElement | null
      return sel && sel.options.length > 1
    }, null, { timeout: 10000 })

    const options = await regionSelect.locator('option').count()
    expect(options).toBeGreaterThan(1) // At least "Todas las regiones" + 1 real region
  })

  test('region filter updates company list', async ({ page }) => {
    await page.goto('/servicios/termofusion')

    // Wait for initial load and regions to be populated
    const filterBar = page.locator('.filter-bar')
    await expect(filterBar).toBeVisible({ timeout: 10000 })
    await page.waitForFunction(() => {
      const sel = document.querySelector('#region-filter') as HTMLSelectElement | null
      return sel && sel.options.length > 1
    }, null, { timeout: 10000 })

    // Select Magallanes — likely has no termofusion companies
    const regionSelect = page.locator('#region-filter')
    await regionSelect.selectOption('Magallanes')

    // Either shows company cards or empty state
    const hasCompanies = await page.locator('.company-card').count()
    const hasEmptyState = await page.locator('.empty-state').count()
    expect(hasCompanies + hasEmptyState).toBeGreaterThan(0)
  })

  test('empty state is shown when no companies match', async ({ page }) => {
    await page.goto('/servicios/termofusion')

    const regionSelect = page.locator('#region-filter')
    await expect(regionSelect).toBeVisible({ timeout: 10000 })
    // Wait for regions to load
    await page.waitForFunction(() => {
      const sel = document.querySelector('#region-filter') as HTMLSelectElement | null
      return sel && sel.options.length > 1
    }, null, { timeout: 10000 })

    // Try Magallanes as it likely has no termofusion companies
    await regionSelect.selectOption('Magallanes')
    await page.waitForTimeout(500)
    const companies = await page.locator('.company-card').count()
    if (companies === 0) {
      await expect(page.locator('.empty-state')).toBeVisible()
    }
  })

  test('breadcrumb shows Inicio link', async ({ page }) => {
    await page.goto('/servicios/termofusion')
    const breadcrumb = page.locator('.breadcrumb, nav[aria-label*="readcrumb"], [class*="breadcrumb"]').first()
    await expect(breadcrumb).toBeVisible()
    await expect(page.locator('a[href="/"]').first()).toBeVisible()
  })

  test('invalid category slug redirects to home', async ({ page }) => {
    await page.goto('/servicios/categoria-que-no-existe-xyz')
    // Should redirect to home
    await expect(page).toHaveURL('/', { timeout: 5000 })
  })
})
