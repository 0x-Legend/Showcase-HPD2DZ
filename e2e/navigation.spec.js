import { expect, test } from '@playwright/test'

const url = 'https://tradeloop-git-testing-cs3150-tradeloop.vercel.app/'
// const url = 'http://localhost:3000/'

const links = [
  { name: 'Overview', href: 'overview', selector: 'overview' },
  { name: 'Analytics', href: 'analytics', selector: 'analytics' },
  { name: 'Trades', href: 'trades', selector: 'trades' },
  { name: 'Calendar', href: 'calendar', selector: 'calendar' },
  { name: 'LoopAI', href: 'chat', selector: 'chat' }
]

/**
 * npx playwright test Navigation.spec.js
 * 1. Navigation > Desktop Sidebar
 * 2. Navigation > Mobile Navbar
 */
test.describe('Navigation', () => {
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

  /**
   * Test desktop navigation
   */
  test('Desktop Sidebar', async () => {
    for (const link of links) {
      await page.click(`#${link.selector}`)

      await expect(page).toHaveURL(`${url + link.href}`, {
        timeout: 10000
      })
    }
  })

  /**
   * Test mobile navigation by shrinking the viewport width
   */
  test('Mobile Navbar', async () => {
    for (const link of links) {
      await page.goto(`${url}account`)
      await page.setViewportSize({ width: 400, height: 800 })

      await page.locator('id=mobileNav').click()
      await page.locator(`id=${link.selector}Mobile`).click()

      await expect(page).toHaveURL(`${url + link.href}`, {
        timeout: 10000
      })
    }
  })
})
