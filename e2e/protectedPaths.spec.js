import { expect, test } from '@playwright/test'

const url = 'https://tradeloop-git-testing-cs3150-tradeloop.vercel.app/'
// const url = 'http://localhost:3000/'

/**
 * npx playwright test protectedPaths.spec.ts
 * 1. Protected Paths > Unauthenticated > Protected Paths Redirect to /signin
 * 2. Protected Paths > Authenticated > Protected Paths are accessible
 */
test.describe('Protected Paths', () => {
  const protectedPaths = [
    'account',
    'overview',
    'analytics',
    'trades',
    'calendar',
    'chat'
  ]

  test.describe('Unauthenticated', () => {
    test(`Protected Paths Redirect to /signin`, async ({ page }) => {
      for (const path of protectedPaths) {
        await page.goto(`${url + path}`)
        await expect(page).toHaveURL(`${url}signin`)
      }
    })
  })

  test.describe('Authenticated', () => {
    // Create a page with user signed in before running tests
    let page
    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage()

      await page.goto(`${url}signin/admin`)
      await page.fill('input[name="email"]', 'ajayvignesh01@gmail.com')
      await page.fill('input[name="password"]', 'ADMINTEST')
      await page.click('button:text("Sign In")')
      await page.waitForURL(`${url}overview`)
    })
    test.afterAll(async () => {
      await page.close()
    })

    test(`Protected Paths are accessible`, async () => {
      for (const path of protectedPaths) {
        await page.goto(`${url + path}`)
        await expect(page).toHaveURL(`${url + path}`)
      }

      // signin redirects to overview
      await page.goto(`${url}signin`)
      await expect(page).toHaveURL(`${url}overview`)
    })
  })
})
