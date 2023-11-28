import { expect, test } from '@playwright/test'

const url = 'https://tradeloop-git-testing-cs3150-tradeloop.vercel.app/'
// const url = 'http://localhost:3000/'

/**
 * npx playwright test account.spec.js
 * 1. Account > Profile Tab > Data Loaded
 * 2. Account > Profile Tab > Change Username
 * 3. Account > API Tab > Data Loaded
 * 4. Account > API Tab > API Form
 * 5. Account > API Tab > Refresh Exchange Account
 */
test.describe('Account', () => {
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

  test.describe('Profile Tab', () => {
    /**
     * Test if user data is loaded in the profile tab, specifically
     * the user's email
     */
    test('Data Loaded', async () => {
      await page.goto(`${url}account`)

      await page.click('text=Profile')

      expect(page.locator('text=Username'))
      expect(page.locator('text=Email'))
      await expect(page.locator('id=emailInput')).toHaveAttribute(
        'placeholder',
        'ajayvignesh01@gmail.com'
      )
    })

    /**
     * Change the user's username and validate the change from UI
     * feedback and also after page reload
     */
    test('Change Username', async () => {
      await page.goto(`${url}account`) // Replace with your page URL

      const randomNumber = Math.floor(Math.random() * 100)
      const username = `Ajay${randomNumber}`
      await page.fill('id=usernameInput', username)

      await page.press('id=usernameInput', 'Enter')

      await expect(
        page.locator(`text=Successfully updated username to ${username}`)
      ).toBeVisible()

      await page.reload()
      await expect(page.locator('id=usernameInput')).toHaveAttribute(
        'placeholder',
        username
      )
    })
  })

  test.describe('API Tab', () => {
    /**
     * Test if user data is loaded in the API tab, specifically
     * info regarding the user's connected exchange account
     */
    test('Data Loaded', async () => {
      await page.goto(`${url}account`)

      await page.click('text=API')

      expect(page.locator('text=Connect Exchange'))
      expect(page.locator('text=ajay02'))
    })

    /**
     * Test empty and invalid input in the API form
     */
    test('API Form', async () => {
      await page.goto(`${url}account`)

      await page.click('text=API')

      await page.click('button[id="linkButton"]')
      expect(page.locator('text=Please fill out this field.'))

      await page.fill('input[name="account_name"]', 'ajay')
      await page.click('button[id="linkButton"]')
      expect(page.locator('text=Please fill out this field.'))

      await page.fill('input[name="api_key"]', 'key')
      await page.click('button[id="linkButton"]')
      expect(page.locator('text=Please fill out this field.'))

      await page.fill('input[name="api_secret"]', 'incorrect_secret')
      await page.fill('input[name="api_key"]', '')
      await page.click('button[id="linkButton"]')
      expect(page.locator('text=Please fill out this field.'))

      const requestPromise = page.waitForRequest(
        (request) =>
          request.url().includes(`${url}account`) && request.method() === 'POST'
      )

      await page.fill('input[name="account_name"]', 'ajay')
      await page.fill('input[name="api_key"]', 'incorrect_key')
      await page.fill('input[name="api_secret"]', 'incorrect_secret')
      await page.click('button[id="linkButton"]')

      const request = await requestPromise
      expect(request).toBeDefined()
      expect(page.locator('text=API check failed. API key is invalid'))
    })

    /**
     * Test refresh exchange button network request
     * and that it refreshes the specific exchange instead of something else
     */
    test('Refresh Exchange Account', async () => {
      await page.goto(`${url}account`)

      await page.click('text=API')

      const requestPromise = page.waitForRequest(
        (request) =>
          request.url().includes(`${url}account`) && request.method() === 'POST'
      )

      await page.click('button[id="refreshExchange"]')

      const request = await requestPromise
      expect(request).toBeDefined()
      expect(page.locator('text=TEST: Found 0 new executions for ajay02'))
    })
  })
})
