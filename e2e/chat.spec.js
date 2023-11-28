import { expect, test } from '@playwright/test'

const url = 'https://tradeloop-git-testing-cs3150-tradeloop.vercel.app/'
// const url = 'http://localhost:3000/'

/**
 * npx playwright test chat.spec.ts
 * 1. Chat > New Chat
 * 2. Chat > Input Shortcuts
 * 3. Chat > Send Message
 * 4. Chat > Share Messages
 */
test.describe('Account', () => {
  // Create a page with user signed in and clipboard access for browser
  let page
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
      origin: url
    })
    page = await context.newPage()

    await page.goto(`${url}signin/admin`)
    await page.fill('input[name="email"]', 'ajayvignesh01@gmail.com')
    await page.fill('input[name="password"]', 'ADMINTEST')
    await page.click('button:text("Sign In")')
    await page.waitForURL(`${url}overview`)
  })
  test.afterAll(async () => {
    await page.close()
  })

  test('New Chat', async () => {
    await page.goto(`${url}chat`)

    expect(page.locator('text=Welcome to Loop AI Analytics!'))
  })

  test('Input Shortcuts', async () => {
    await page.goto(`${url}chat`)

    await page.click('text=Win rate during NY session.')
    const textareaValue1 = await page
      .locator('textarea[placeholder="Send a message"]')
      .inputValue()
    expect(textareaValue1).toBe(
      'What is my win rate for trades opened during the new york trade session?'
    )

    await page.click('text=Total fees paid.')
    const textareaValue2 = await page
      .locator('textarea[placeholder="Send a message"]')
      .inputValue()
    expect(textareaValue2).toBe('How much have I paid in fees?')

    await page.click('text=Most traded coin.')
    const textareaValue3 = await page
      .locator('textarea[placeholder="Send a message"]')
      .inputValue()
    expect(textareaValue3).toBe('What is my most traded coin?')
  })

  test('Send Message', async () => {
    await page.goto(`${url}chat`)

    const requestPromise = page.waitForRequest(
      (request) =>
        request.url().includes(`${url}api/chat`) && request.method() === 'POST'
    )

    await page.fill('textarea[id="chatTextArea"]', 'Hello')
    await page.press('id=chatTextArea', 'Enter')

    const request = await requestPromise
    expect(request).toBeDefined()
  })

  test('Share Messages', async () => {
    const requestPromise = page.waitForRequest(
      (request) =>
        request
          .url()
          .includes(
            'https://hsshbmqczknfbibgodxj.supabase.co/rest/v1/chats?id=eq.'
          ) && request.method() === 'PATCH'
    )

    await page.click('text=Share')

    const request = await requestPromise
    expect(request).toBeDefined()
    await expect(page.locator('text=Copied Link:')).toBeVisible()

    const copiedLink = await page.evaluate(() => navigator.clipboard.readText())
    await page.goto(copiedLink)
    expect(page.locator('text=Hello'))
  })
})
