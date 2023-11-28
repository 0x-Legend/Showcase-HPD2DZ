import { expect, test } from '@playwright/test'

const url = 'https://tradeloop-git-testing-cs3150-tradeloop.vercel.app/'
// const url = 'http://localhost:3000/'

/**
 * npx playwright test overview.spec.ts
 * 1. Overview > Database Fallback
 * 2. Overview > IndexedDB Access
 * 3. Overview > Refresh Button
 * 4. Overview > Calendar - Date Change
 * 5. Overview > Exchange - Account Change
 * 6. Overview > Data Cards
 * 7. Overview > PnL Tooltip
 */
test.describe('Overview', () => {
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

  test('Database Fallback', async () => {
    const [message] = await Promise.all([page.waitForEvent('console')])

    const requestPromise = page.waitForRequest(
      (request) =>
        request
          .url()
          .includes(
            'hsshbmqczknfbibgodxj.supabase.co/rest/v1/z_bybit_trades'
          ) && request.method() === 'GET'
    )

    await page.goto(`${url}overview`) // Replace with your page URL

    expect(message.text()).toContain('Getting trades from IndexedDB')

    const request = await requestPromise
    expect(request).toBeDefined()
  })

  test('IndexedDB Access', async () => {
    await page.reload()
    const [message] = await Promise.all([page.waitForEvent('console')])

    await page.goto(`${url}overview`) // Replace with your page URL

    expect(message.text()).toContain('Getting trades from IndexedDB')
  })

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

  test('Calendar - Date Change', async () => {
    await page.goto(`${url}overview`, { waitUntil: 'load' })

    const messagePromise = page.waitForEvent('console')

    await page.locator('id=date').click()
    await page.click('text=11')

    const message = await messagePromise

    expect(message.text()).toContain('Getting trades from IndexedDB')
  })

  test('Exchange - Account Change', async () => {
    await page.goto(`${url}overview`, { waitUntil: 'load' })

    const messagePromise = page.waitForEvent('console')

    await page.locator('id=exchange_account_picker').click()
    await page.click('text=ajay02')

    const message = await messagePromise

    expect(message.text()).toContain('Getting trades from IndexedDB')
  })

  test('Data Cards', async () => {
    await page.goto(`${url}overview`)

    await expect(page.locator('text=Portfolio Value')).toBeVisible()
    await expect(page.locator('text=Recent Trades')).toBeVisible()
    await expect(page.locator('text=Win Rate')).toBeVisible()
    await expect(page.locator('text=Total Trades')).toBeVisible()
    await expect(page.locator('text=Performance')).toBeVisible()
  })

  test('PnL Tooltip', async () => {
    await page.goto(`${url}overview`)

    await page.hover('id=pnlChart')

    await expect(page.locator('id=pnlTooltip')).toBeVisible()
  })
})
