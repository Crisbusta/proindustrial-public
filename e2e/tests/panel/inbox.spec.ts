import { test, expect } from '@playwright/test'
import { TEST_ACCOUNTS } from '../../fixtures/test-data'
import { apiLogin, apiGetPanelQuotes, apiUpdateQuoteStatus } from '../../helpers/api-client'

test.describe('Panel Inbox', () => {
  let token: string
  let originalStatuses: Array<{ id: string; status: string }> = []

  test.beforeAll(async () => {
    token = await apiLogin(TEST_ACCOUNTS.primary.email, TEST_ACCOUNTS.primary.password)
  })

  test.beforeEach(async ({ page }) => {
    await page.goto('/panel/solicitudes')
    await expect(page.locator('.inbox-tabs')).toBeVisible({ timeout: 10000 })
  })

  test.afterAll(async () => {
    // Restore original quote statuses
    for (const q of originalStatuses) {
      await apiUpdateQuoteStatus(token, q.id, q.status).catch(() => {})
    }
  })

  test('inbox loads and shows quote list', async ({ page }) => {
    // List panel should be visible
    await expect(page.locator('.inbox-list')).toBeVisible()
  })

  test('tabs render with All, Nuevas, Vistas, Respondidas', async ({ page }) => {
    const tabTexts = await page.locator('.inbox-tabs button').allTextContents()
    const combined = tabTexts.join(' ')
    expect(combined).toMatch(/Todas/)
    expect(combined).toMatch(/Nuevas/)
    expect(combined).toMatch(/Vistas/)
    expect(combined).toMatch(/Respondidas/)
  })

  test('tab counts are visible', async ({ page }) => {
    // Each tab should show a count badge
    const tabBadges = page.locator('.inbox-tabs button span')
    const count = await tabBadges.count()
    expect(count).toBeGreaterThan(0)
  })

  test('"Nuevas" tab filters to only new items', async ({ page }) => {
    // Click "Nuevas" tab
    await page.locator('.inbox-tabs button', { hasText: 'Nuevas' }).click()
    await page.waitForTimeout(300)

    // All visible status badges in the list should say "Nueva"
    const statusBadges = page.locator('.inbox-list .status-badge')
    const count = await statusBadges.count()
    if (count > 0) {
      for (const badge of await statusBadges.all()) {
        await expect(badge).toContainText('Nueva')
      }
    }
  })

  test('clicking a request shows detail panel', async ({ page }) => {
    const firstRequest = page.locator('.inbox-list button').first()
    const isVisible = await firstRequest.isVisible()
    if (!isVisible) {
      // No requests, skip
      return
    }
    await firstRequest.click()

    // Detail panel should show
    await expect(page.locator('.inbox-detail')).toBeVisible()
    // Should show a company/requester name
    await expect(page.locator('.inbox-detail h2')).toBeVisible()
  })

  test('detail panel shows contact info fields', async ({ page }) => {
    const firstRequest = page.locator('.inbox-list button').first()
    const isVisible = await firstRequest.isVisible()
    if (!isVisible) return

    await firstRequest.click()

    // Should have email link
    await expect(page.locator('.inbox-detail a[href^="mailto:"]')).toBeVisible({ timeout: 5000 })
  })

  test('mark as responded changes status', async ({ page }) => {
    // Find a quote that is "new" or "read" to mark as responded
    const quotes = await apiGetPanelQuotes(token)
    const markable = quotes.find(q => q.status !== 'responded')
    if (!markable) return // All already responded, skip

    // Save original status for cleanup
    originalStatuses.push({ id: markable.id, status: markable.status })

    // Click on the "Nuevas" tab to find it more easily if it's new
    if (markable.status === 'new') {
      await page.locator('.inbox-tabs button', { hasText: 'Nuevas' }).click()
      await page.waitForTimeout(300)
    }

    // Click first matching item in list
    const firstBtn = page.locator('.inbox-list button').first()
    await expect(firstBtn).toBeVisible()
    await firstBtn.click()

    // Find the "Marcar como respondida" button
    const markBtn = page.locator('button', { hasText: 'Marcar como respondida' })
    const isVisible = await markBtn.isVisible()
    if (!isVisible) return // Already responded

    await markBtn.click()

    // Status badge in detail should update
    await expect(page.locator('.inbox-detail .status-badge').first()).toContainText('Respondida', { timeout: 5000 })
  })

  test('"Respondidas" tab shows responded items', async ({ page }) => {
    await page.locator('.inbox-tabs button', { hasText: 'Respondidas' }).click()
    await page.waitForTimeout(300)

    const statusBadges = page.locator('.inbox-list .status-badge')
    const count = await statusBadges.count()
    if (count > 0) {
      for (const badge of await statusBadges.all()) {
        await expect(badge).toContainText('Respondida')
      }
    }
  })
})
