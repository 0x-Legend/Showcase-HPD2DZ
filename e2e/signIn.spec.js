import { expect, test } from '@playwright/test'

const url = 'https://tradeloop-git-testing-cs3150-tradeloop.vercel.app/'
// const url = 'http://localhost:3000/'

/**
 * npx playwright test signin.spec.ts
 * 1. Sign In > Magic Link
 * 2. Sign In > Email & Password
 */
test.describe('Sign In', () => {
  test('Magic Link', async ({ page }) => {
    await page.goto(`${url}signin`)

    await page.fill('#email', 'invalid-email')
    await page.click('button[id="signin"]')

    await page.waitForTimeout(1000)

    expect(page.locator('text=Welcome back'))

    await page.fill('#email', '0x.legend1@gmail.com')
    await page.click('button[id="signin"]')

    expect(page.locator('text=Check your inbox'))
  })

  test('Email & Password', async ({ page }) => {
    await page.goto(`${url}signin/admin`)

    await page.fill('input[name="email"]', 'ajayvignesh01@gmail.com')
    await page.fill('input[name="password"]', 'WRONGPASSWORD')
    await page.click('button:text("Sign In")')

    expect(
      page.locator(
        'text=Could not authenticate user. Invalid login credentials'
      )
    )

    await expect(page).toHaveURL(`${url}signin/admin`)

    await page.fill('input[name="email"]', 'ajayvignesh01@gmail.com')
    await page.fill('input[name="password"]', 'ADMINTEST')
    await page.click('button:text("Sign In")')

    await expect(page).toHaveURL(`${url}overview`)
  })
})
