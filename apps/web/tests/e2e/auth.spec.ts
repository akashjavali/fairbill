import { test, expect } from '@playwright/test'

const BASE_URL = process.env['PLAYWRIGHT_BASE_URL'] ?? 'http://localhost:3000'
const UNIQUE = Date.now()
const TEST_EMAIL = `e2e-${UNIQUE}@fairbill-test.com`
const TEST_PASSWORD = 'E2eTest@1234!'
const TEST_NAME = 'E2E Tester'

test.describe('Authentication', () => {
  test('register → redirects to dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`)
    await page.getByLabel('Name').fill(TEST_NAME)
    await page.getByLabel('Email').fill(TEST_EMAIL)
    await page.getByLabel('Password').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /create account/i }).click()
    await expect(page).toHaveURL(/dashboard/)
  })

  test('login with valid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await page.getByLabel('Email').fill(TEST_EMAIL)
    await page.getByLabel('Password').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/dashboard/)
  })

  test('login with wrong password shows error', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await page.getByLabel('Email').fill(TEST_EMAIL)
    await page.getByLabel('Password').fill('WrongPassword123')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/invalid email or password/i)).toBeVisible()
  })

  test('protected dashboard redirects to login when unauthenticated', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)
    await expect(page).toHaveURL(/login/)
  })

  test('sign out clears session', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`)
    await page.getByLabel('Email').fill(TEST_EMAIL)
    await page.getByLabel('Password').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/dashboard/)

    // Sign out
    await page.getByRole('button', { name: /sign out/i }).click()
    await expect(page).toHaveURL(/login/)

    // Verify session cleared
    await page.goto(`${BASE_URL}/dashboard`)
    await expect(page).toHaveURL(/login/)
  })

  test('forgot password page is accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/forgot-password`)
    await expect(page.getByRole('heading', { name: /forgot/i })).toBeVisible()
    await page.getByLabel('Email').fill(TEST_EMAIL)
    await page.getByRole('button', { name: /send/i }).click()
    await expect(page.getByText(/check your email/i)).toBeVisible()
  })
})
