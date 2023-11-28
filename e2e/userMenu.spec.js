import { expect, test } from '@playwright/test'

const url = 'https://tradeloop-git-testing-cs3150-tradeloop.vercel.app/'
// const url = 'http://localhost:3000/'

/**
 * npx playwright test userMenu.spec.js
 * 1. User Menu > Navigated to /account
 * 2. User Menu > Light Mode (& Persist)
 * 3. User Menu > Dark Mode (& Persist)
 * 4. User Menu > Sign Out
 */
test.describe('User Menu', () => {
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
   * Test settings button navigates to account page
   */
  test(`Navigated to /account`, async () => {
    await page.setViewportSize({ width: 800, height: 800 })

    await page.goto(`${url}overview`)

    await page.locator('id=userNav').first().click()

    await page.locator('id=settings').first().click()

    await expect(page).toHaveURL(`${url}account`)
  })

  /**
   * Test light mode setting change is persisted using html class
   */
  test(`Light Mode (& Persist)`, async () => {
    await page.goto(`${url}overview`)

    await page.locator('id=userNav').first().click()
    await page.locator('id=theme').first().click()

    await page.locator('id=lightmode').first().click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)

    await page.reload()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })

  /**
   * Test dark mode setting change is persisted using html class
   */
  test(`Dark Mode (& Persist)`, async () => {
    await page.goto(`${url}overview`)

    await page.locator('id=userNav').first().click()
    await page.locator('id=theme').first().click()

    await page.locator('id=darkmode').first().click()
    await expect(page.locator('html')).toHaveClass(/dark/)

    await page.reload()
    await expect(page.locator('html')).toHaveClass(/dark/)
  })

  /**
   * Test user sign out works properly and redirects back to sign in page
   */
  test(`Sign Out`, async () => {
    await page.goto(`${url}overview`)

    await page.locator('id=userNav').first().click()

    await page.locator('id=signout').first().click()

    await expect(page).toHaveURL(`${url}signin`)
  })
})
