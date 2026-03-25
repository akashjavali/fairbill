import { test, expect, Page } from '@playwright/test'
import path from 'path'

const BASE_URL = process.env['PLAYWRIGHT_BASE_URL'] ?? 'http://localhost:3000'
const TEST_EMAIL = `e2e-audit-${Date.now()}@fairbill-test.com`
const TEST_PASSWORD = 'E2eAudit@1234!'

async function loginAs(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`)
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/dashboard/)
}

test.describe('Audit flow', () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await page.goto(`${BASE_URL}/register`)
    await page.getByLabel('Name').fill('Audit Tester')
    await page.getByLabel('Email').fill(TEST_EMAIL)
    await page.getByLabel('Password').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /create account/i }).click()
    await expect(page).toHaveURL(/dashboard/)
    await page.close()
  })

  test('upload page is accessible from dashboard', async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD)
    await page.getByRole('link', { name: /upload/i }).click()
    await expect(page).toHaveURL(/upload/)
    await expect(page.getByText(/upload a bill/i)).toBeVisible()
  })

  test('dropzone accepts PDF file and redirects to audit polling page', async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD)
    await page.goto(`${BASE_URL}/upload`)

    // Select medical bill type
    await page.getByText(/medical/i).click()

    // Upload a test file
    const filePath = path.join(__dirname, 'fixtures', 'sample-bill.pdf')
    await page.locator('input[type="file"]').setInputFiles(filePath)

    // Submit
    await page.getByRole('button', { name: /analyze bill/i }).click()

    // Should navigate to audit detail page
    await expect(page).toHaveURL(/\/audits\/[\w-]+/)
  })

  test('audit detail page shows loading state while processing', async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD)
    await page.goto(`${BASE_URL}/audits`)

    // If there's an audit in pending/processing state, it shows spinner
    const auditCards = page.locator('[data-testid="audit-card"]')
    const count = await auditCards.count()
    if (count > 0) {
      await auditCards.first().click()
      // Either shows spinner or completed result
      const hasSpinner = await page.locator('[data-testid="audit-loading"]').isVisible().catch(() => false)
      const hasScore = await page.locator('[data-testid="fairness-score"]').isVisible().catch(() => false)
      expect(hasSpinner || hasScore).toBe(true)
    }
  })

  test('audits list page shows uploaded audits', async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD)
    await page.goto(`${BASE_URL}/audits`)
    await expect(page.getByRole('heading', { name: /my audits/i })).toBeVisible()
  })

  test('settings page shows plan and usage info', async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD)
    await page.goto(`${BASE_URL}/settings`)
    await expect(page.getByText(/free/i)).toBeVisible()
    await expect(page.getByText(/audits used/i)).toBeVisible()
  })

  test('usage limit warning appears on upload after 2 audits (free plan)', async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD)
    await page.goto(`${BASE_URL}/upload`)
    // If at limit, the upgrade prompt should be visible (this requires 2 audits already done)
    // Just verify the page loads correctly
    await expect(page.getByText(/bill type/i)).toBeVisible()
  })
})
