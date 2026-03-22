import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('hero section is visible', async ({ page }) => {
    await expect(page.locator('.hero')).toBeVisible()
    // Hero should contain text about industrial services
    await expect(page.locator('.hero')).toContainText(/industri/i)
  })

  test('categories load from API', async ({ page }) => {
    // Wait for category cards/accordion to render (comes from API)
    const categoryCards = page.locator('.category-card, [class*="category"]').first()
    await expect(categoryCards).toBeVisible({ timeout: 10000 })
  })

  test('featured companies display', async ({ page }) => {
    // Wait for company cards from API
    const companyCards = page.locator('.company-card')
    await expect(companyCards.first()).toBeVisible({ timeout: 10000 })
    const count = await companyCards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('clicking a company navigates to its profile', async ({ page }) => {
    // Wait for company cards to load (.company-card is itself an <a> link)
    const firstCard = page.locator('.company-card').first()
    await expect(firstCard).toBeVisible({ timeout: 10000 })

    const href = await firstCard.getAttribute('href')
    await firstCard.click()
    await expect(page).toHaveURL(/\/empresas\//)
    if (href) expect(page.url()).toContain(href)
  })

  test('navbar has key links', async ({ page }) => {
    await expect(page.locator('.navbar')).toBeVisible()
    // "Registrar empresa" link should exist
    await expect(page.locator('a[href="/registrar"]').first()).toBeVisible()
  })

  test('footer renders', async ({ page }) => {
    await expect(page.locator('footer')).toBeVisible()
  })

  test('CTA button navigates to quote form', async ({ page }) => {
    const ctaLink = page.locator('a[href="/cotizar"]').first()
    await expect(ctaLink).toBeVisible()
    await ctaLink.click()
    await expect(page).toHaveURL('/cotizar')
  })
})
