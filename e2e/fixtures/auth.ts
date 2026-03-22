import { test as base, Page } from '@playwright/test'
import { apiLogin } from '../helpers/api-client'

/**
 * Extended test fixture that can inject a JWT from any account into localStorage.
 * Useful for tests that need to log in as a different user than the default storageState.
 */
export const test = base.extend<{
  loginAs: (email: string, password: string) => Promise<void>
}>({
  loginAs: async ({ page }, use) => {
    const doLogin = async (email: string, password: string) => {
      const token = await apiLogin(email, password)
      await page.goto('/')
      await page.evaluate((t) => localStorage.setItem('panelToken', t), token)
    }
    await use(doLogin)
  },
})

export { expect } from '@playwright/test'

/**
 * Inject a JWT into a page's localStorage.
 * Use this in beforeEach for tests that need an account other than the default storageState.
 */
export async function injectAuth(page: Page, email: string, password: string) {
  const token = await apiLogin(email, password)
  await page.goto('/')
  await page.evaluate((t) => localStorage.setItem('panelToken', t), token)
}
