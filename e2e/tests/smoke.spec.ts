/**
 * SMOKE TEST SUITE
 * One fast assertion per page. Target: all 10 tests pass in < 60s.
 * Run with: npm run test:e2e:smoke
 */
import { test, expect } from '@playwright/test'

// ── Public pages ─────────────────────────────────────────────────────────────

test('landing page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.hero')).toBeVisible()
})

test('category page loads', async ({ page }) => {
  await page.goto('/servicios/termofusion')
  await expect(page.locator('.page-header')).toBeVisible()
})

test('company profile loads', async ({ page }) => {
  await page.goto('/empresas/proveedora-aceros-pacifico')
  await expect(page.locator('.profile-hero')).toBeVisible()
})

test('quote form loads', async ({ page }) => {
  await page.goto('/cotizar')
  await expect(page.locator('form[aria-label="Formulario de cotización"]')).toBeVisible()
})

test('register form loads', async ({ page }) => {
  await page.goto('/registrar')
  await expect(page.locator('form[aria-label="Formulario de registro de proveedor"]')).toBeVisible()
})

test('panel login page loads', async ({ page }) => {
  // Clear any auth state for this test
  await page.goto('/panel/login')
  await expect(page.locator('#login-email')).toBeVisible()
})

// ── Panel pages (use storageState from playwright.config.ts) ─────────────────

test('panel dashboard loads', async ({ page }) => {
  await page.goto('/panel/dashboard')
  await expect(page.locator('.kpi-grid')).toBeVisible()
})

test('panel inbox loads', async ({ page }) => {
  await page.goto('/panel/solicitudes')
  await expect(page.locator('.inbox-tabs')).toBeVisible()
})

test('panel services loads', async ({ page }) => {
  await page.goto('/panel/servicios')
  await expect(page.locator('.panel-topbar')).toBeVisible()
})

test('panel profile loads', async ({ page }) => {
  await page.goto('/panel/perfil')
  await expect(page.locator('.progress-track')).toBeVisible()
})
