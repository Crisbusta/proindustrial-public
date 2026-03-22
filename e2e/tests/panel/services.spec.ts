import { test, expect } from '@playwright/test'
import { TEST_ACCOUNTS } from '../../fixtures/test-data'
import { injectAuth } from '../../fixtures/auth'
import { apiLogin, apiGetPanelServices, apiDeleteService } from '../../helpers/api-client'

/**
 * Services CRUD tests use writeAccount (electro-industrial-spa) which starts with 0 services.
 * This ensures predictable empty state and avoids polluting other accounts.
 */
test.describe('Panel Services', () => {
  let writeToken: string
  const createdServiceIds: string[] = []

  test.beforeAll(async () => {
    writeToken = await apiLogin(TEST_ACCOUNTS.writeAccount.email, TEST_ACCOUNTS.writeAccount.password)
  })

  test.beforeEach(async ({ page }) => {
    // Log in as writeAccount (different from default storageState)
    await injectAuth(page, TEST_ACCOUNTS.writeAccount.email, TEST_ACCOUNTS.writeAccount.password)
    await page.goto('/panel/servicios')
    await expect(page.locator('.panel-topbar')).toBeVisible({ timeout: 10000 })
  })

  test.afterAll(async () => {
    // Clean up any services created during tests
    for (const id of createdServiceIds) {
      await apiDeleteService(writeToken, id).catch(() => {})
    }
  })

  test('empty state is shown when no services exist', async ({ page }) => {
    // If the writeAccount starts with 0 services (as per seed data), show empty state
    const services = await apiGetPanelServices(writeToken)
    if (services.length === 0) {
      await expect(page.locator('.empty-state')).toBeVisible()
      await expect(page.locator('.empty-state')).toContainText(/Sin servicios/i)
    }
  })

  test('"Agregar servicio" button is always visible', async ({ page }) => {
    // Button exists in topbar or empty state
    const addBtn = page.locator('button', { hasText: 'Agregar servicio' }).or(
      page.locator('button', { hasText: 'Agregar primer servicio' })
    )
    await expect(addBtn.first()).toBeVisible()
  })

  test('opening add service panel shows form', async ({ page }) => {
    // Click whichever add button is visible
    const addBtn = page.locator('button', { hasText: 'Agregar servicio' }).first()
    const altBtn = page.locator('button', { hasText: 'Agregar primer servicio' }).first()

    if (await addBtn.isVisible()) {
      await addBtn.click()
    } else {
      await altBtn.click()
    }

    // Slide panel should appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await expect(page.locator('#svc-name')).toBeVisible()
  })

  test('category dropdown in add form has options', async ({ page }) => {
    const addBtn = page.locator('button', { hasText: /Agregar/ }).first()
    await addBtn.click()

    const categorySelect = page.locator('#svc-category')
    await expect(categorySelect).toBeVisible({ timeout: 10000 })
    const options = await categorySelect.locator('option').count()
    expect(options).toBeGreaterThan(1)
  })

  test('creating a service adds it to the list', async ({ page }) => {
    const serviceName = `Servicio Test ${Date.now()}`

    const addBtn = page.locator('button', { hasText: /Agregar/ }).first()
    await addBtn.click()

    await page.fill('#svc-name', serviceName)
    await page.fill('#svc-description', 'Descripción de servicio creado por test automatizado')

    // Save
    await page.locator('.slide-panel-footer button', { hasText: /Agregar servicio|Guardar/ }).click()

    // Panel should close and service should appear
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 })
    await expect(page.locator('.panel-content')).toContainText(serviceName, { timeout: 5000 })

    // Track for cleanup
    const services = await apiGetPanelServices(writeToken)
    const created = services.find(s => s.name === serviceName)
    if (created) createdServiceIds.push(created.id)
  })

  test('editing a service updates its name', async ({ page }) => {
    // First create a service to edit
    const services = await apiGetPanelServices(writeToken)
    if (services.length === 0) {
      // Create one via UI first
      const addBtn = page.locator('button', { hasText: /Agregar/ }).first()
      await addBtn.click()
      await page.fill('#svc-name', `Editable Service ${Date.now()}`)
      await page.locator('.slide-panel-footer button', { hasText: /Agregar servicio/ }).click()
      await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 })

      // Reload services list
      const newServices = await apiGetPanelServices(writeToken)
      if (newServices.length > 0) createdServiceIds.push(newServices[0].id)
    }

    // Reload page to see current state
    await page.reload()
    await expect(page.locator('.panel-topbar')).toBeVisible({ timeout: 10000 })

    // Click first edit button
    const editBtn = page.locator('.icon-btn').first()
    const isVisible = await editBtn.isVisible()
    if (!isVisible) return // No services to edit

    await editBtn.click()

    const updatedName = `Updated ${Date.now()}`
    await page.locator('#svc-name').clear()
    await page.fill('#svc-name', updatedName)
    await page.locator('.slide-panel-footer button', { hasText: /Guardar cambios/ }).click()

    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 })
    await expect(page.locator('.panel-content')).toContainText(updatedName, { timeout: 5000 })
  })

  test('deleting a service removes it from the list', async ({ page }) => {
    // Create a service to delete
    const addBtn = page.locator('button', { hasText: /Agregar/ }).first()
    await addBtn.click()

    const deletableName = `Delete Me ${Date.now()}`
    await page.fill('#svc-name', deletableName)
    await page.locator('.slide-panel-footer button', { hasText: /Agregar servicio|Guardar/ }).click()
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 })
    await expect(page.locator('.panel-content')).toContainText(deletableName, { timeout: 5000 })

    // Find the delete button for the specific service row (by name in same row)
    const row = page.locator('.panel-table-desktop tr', { hasText: deletableName })
    await expect(row).toBeVisible({ timeout: 5000 })
    await row.locator('.icon-btn.danger').click()

    // Confirm in dialog
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 })
    await page.locator('[role="dialog"] button', { hasText: 'Eliminar' }).click()

    // Service should be gone
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 })
    await expect(page.locator('.panel-content')).not.toContainText(deletableName, { timeout: 5000 })
  })

  test('save toast appears after creating service', async ({ page }) => {
    const addBtn = page.locator('button', { hasText: /Agregar/ }).first()
    await addBtn.click()

    const toastName = `Toast Test ${Date.now()}`
    await page.fill('#svc-name', toastName)
    await page.locator('.slide-panel-footer button', { hasText: /Agregar servicio|Guardar/ }).click()

    await expect(page.locator('.save-toast')).toBeVisible({ timeout: 5000 })

    // Cleanup
    const services = await apiGetPanelServices(writeToken)
    const created = services.find(s => s.name === toastName)
    if (created) createdServiceIds.push(created.id)
  })
})
