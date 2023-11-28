import { expect, test } from '@playwright/test'

const url = 'https://tradeloop-git-testing-cs3150-tradeloop.vercel.app/'
// const url = 'http://localhost:3000/'

/**
 * npx playwright test overview.spec.js
 * 1. Overview > Database Fallback
 * 2. Overview > IndexedDB Access
 * 3. Overview > Refresh Button
 * 4. Overview > Calendar - Date Change
 * 5. Overview > Exchange - Account Change
 * 6. Overview > Data Cards
 * 7. Overview > PnL Tooltip
 */
test.describe('Overview', () => {
  // Used in Database Fallback Testing
  let dbRequest

  // Create a page with user signed in before running tests
  let page
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()

    await page.goto(`${url}signin/admin`)
    await page.fill('input[name="email"]', 'ajayvignesh01@gmail.com')
    await page.fill('input[name="password"]', 'ADMINTEST')

    // Used in Database Fallback Testing
    dbRequest = page.waitForRequest(
        (request) =>
            request
                .url()
                .includes(
                    'hsshbmqczknfbibgodxj.supabase.co/rest/v1/z_bybit_trades'
                ) && request.method() === 'GET'
    )

    await page.click('button:text("Sign In")')
    await page.waitForURL(`${url}overview`)
  })
  test.afterAll(async () => {
    await page.close()
  })

  /**
   * Test that on new page load, database fetch occurs
   * This also occurs when the IndexedDB is empty
   */
  test('Database Fallback', async () => {
    const request = await dbRequest
    expect(request).toBeDefined()
  })

  /**
   * Test that the app is able to access IndexedDB
   */
  test('IndexedDB Access', async () => {
    await page.reload()
    const [message] = await Promise.all([page.waitForEvent('console')])

    await page.goto(`${url}overview`)

    expect(message.text()).toContain('Getting trades from IndexedDB')
  })

  /**
   * Test that force fetch from database button works
   */
  test('Refresh Button', async () => {
    await page.goto(`${url}overview`)
    const requestPromise = page.waitForRequest(
      (request) =>
        request
          .url()
          .includes(
            'hsshbmqczknfbibgodxj.supabase.co/rest/v1/z_bybit_trades'
          ) && request.method() === 'GET'
    )

    await page.click('button[id="refetch"]')

    const request = await requestPromise
    expect(request).toBeDefined()
  })

  /**
   * Test that changing the date triggers a data mutation
   * This change is not visible in this test case
   * Check browser console to verify
   */
  test('Calendar - Date Change', async () => {
    await page.goto(`${url}overview`, { waitUntil: 'load' })

    const messagePromise = page.waitForEvent('console')

    await page.locator('id=date').click()
    await page.click('text=11')

    const message = await messagePromise

    expect(message.text()).toContain('Getting trades from IndexedDB')
  })

  /**
   * Test that changing the exchange account triggers a data mutation
   * This change is not visible in this test case
   * Check browser console to verify
   */
  test('Exchange - Account Change', async () => {
    await page.goto(`${url}overview`, { waitUntil: 'load' })

    const messagePromise = page.waitForEvent('console')

    await page.locator('id=exchange_account_picker').click()
    await page.click('text=ajay02')

    const message = await messagePromise

    expect(message.text()).toContain('Getting trades from IndexedDB')
  })

  /**
   * Test to ensure all data card components are rendered
   */
  test('Data Cards', async () => {
    await page.goto(`${url}overview`)

    await expect(page.locator('text=Portfolio Value')).toBeVisible()
    await expect(page.locator('text=Recent Trades')).toBeVisible()
    await expect(page.locator('text=Win Rate')).toBeVisible()
    await expect(page.locator('text=Total Trades')).toBeVisible()
    await expect(page.locator('text=Performance')).toBeVisible()
  })

  /**
   * Test that the entire custom tooltip component is rendered
   * on the chart instead of the default one
   */
  test('PnL Tooltip', async () => {
    await page.goto(`${url}overview`)

    await page.hover('id=pnlChart')

    await expect(page.locator('id=pnlTooltip')).toBeVisible()
  })
})
