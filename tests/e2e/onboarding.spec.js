import { test, expect } from '@playwright/test'

test.describe('Onboarding Overlay', () => {
	test.beforeEach(async ({ page }) => {
		// First navigate to set up page context
		await page.goto('/')
		// Clear onboarding seen flag to simulate first visit
		await page.evaluate(() => {
			localStorage.removeItem('cd-practices-onboarding-seen')
		})
		// Reload to trigger onboarding check fresh
		await page.reload()
		// Wait for the app to be ready
		await page.waitForSelector('[data-testid="graph-node"]', { timeout: 10000 })
	})

	test('shows onboarding on first visit', async ({ page }) => {
		// Given I am visiting the app for the first time
		// When the page loads
		// Then I should see the onboarding overlay
		await expect(page.locator('[data-testid="onboarding-backdrop"]')).toBeVisible({
			timeout: 5000
		})
		await expect(page.locator('[data-testid="onboarding-tooltip"]')).toBeVisible()
	})

	test('first step is a welcome message', async ({ page }) => {
		await expect(page.locator('[data-testid="onboarding-tooltip"]')).toBeVisible({
			timeout: 5000
		})
		await expect(page.locator('[data-testid="onboarding-tooltip"]')).toContainText('Welcome')
	})

	test('progresses through steps with Next button', async ({ page }) => {
		await expect(page.locator('[data-testid="onboarding-tooltip"]')).toBeVisible({
			timeout: 5000
		})

		// Click Next to advance from welcome
		await page.click('[data-testid="onboarding-next"]')

		// Should show a different step
		await expect(page.locator('[data-testid="onboarding-tooltip"]')).toContainText('Click Cards')
	})

	test('final step shows Get Started button', async ({ page }) => {
		await expect(page.locator('[data-testid="onboarding-tooltip"]')).toBeVisible({
			timeout: 5000
		})

		// Click through all steps (6 total, need 5 clicks to reach last)
		for (let i = 0; i < 5; i++) {
			await page.click('[data-testid="onboarding-next"]')
		}

		// Last step should say "Get Started"
		await expect(page.locator('[data-testid="onboarding-next"]')).toContainText('Get Started')
	})

	test('skip dismisses and persists', async ({ page }) => {
		await expect(page.locator('[data-testid="onboarding-tooltip"]')).toBeVisible({
			timeout: 5000
		})

		// Click Skip Tour
		await page.click('[data-testid="onboarding-skip"]')

		// Overlay should be gone
		await expect(page.locator('[data-testid="onboarding-backdrop"]')).not.toBeVisible()

		// Reload and verify it doesn't show again
		await page.reload()
		await page.waitForSelector('[data-testid="graph-node"]', { timeout: 5000 })
		await page.waitForTimeout(1500)
		await expect(page.locator('[data-testid="onboarding-backdrop"]')).not.toBeVisible()
	})

	test('Escape key dismisses onboarding', async ({ page }) => {
		await expect(page.locator('[data-testid="onboarding-tooltip"]')).toBeVisible({
			timeout: 5000
		})

		// Press Escape
		await page.keyboard.press('Escape')

		// Overlay should be gone
		await expect(page.locator('[data-testid="onboarding-backdrop"]')).not.toBeVisible()
	})
})
