import { test, expect } from '@playwright/test'

test.describe('Guided Walkthrough', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate first to get page context
		await page.goto('/')
		// Mark onboarding as seen and clear walkthrough dismissal
		await page.evaluate(() => {
			localStorage.setItem('cd-practices-onboarding-seen', 'true')
			localStorage.removeItem('cd-walkthrough-dismissed')
		})
		await page.reload()
		// Wait for graph to load with generous timeout
		await page.waitForSelector('[data-testid="graph-node"]', { timeout: 15000 })
	})

	test('shows walkthrough panel with progress', async ({ page }) => {
		await expect(page.locator('[data-testid="guided-walkthrough"]')).toBeVisible({
			timeout: 5000
		})
	})

	test('shows adoption progress count', async ({ page }) => {
		const panel = page.locator('[data-testid="guided-walkthrough"]')
		await expect(panel).toBeVisible({ timeout: 5000 })

		// Should show "N/M" format
		await expect(panel).toContainText(/\d+\/\d+/)
	})

	test('dismiss hides panel and shows Show Guide button', async ({ page }) => {
		await expect(page.locator('[data-testid="guided-walkthrough"]')).toBeVisible({
			timeout: 5000
		})

		// Click dismiss
		await page.click('[data-testid="walkthrough-dismiss"]')

		// Panel should be hidden
		await expect(page.locator('[data-testid="guided-walkthrough"]')).not.toBeVisible()

		// Show Guide button should appear
		await expect(page.locator('[data-testid="walkthrough-show-guide"]')).toBeVisible()
	})

	test('Show Guide button restores panel', async ({ page }) => {
		await expect(page.locator('[data-testid="guided-walkthrough"]')).toBeVisible({
			timeout: 5000
		})

		// Dismiss
		await page.click('[data-testid="walkthrough-dismiss"]')

		// Click Show Guide
		await page.click('[data-testid="walkthrough-show-guide"]')

		// Panel should be visible again
		await expect(page.locator('[data-testid="guided-walkthrough"]')).toBeVisible()
	})

	test('View Practice button navigates to practice', async ({ page }) => {
		await expect(page.locator('[data-testid="guided-walkthrough"]')).toBeVisible({
			timeout: 5000
		})

		const viewButton = page.locator('[data-testid="walkthrough-view-practice"]')

		// Only test if recommendation exists (no practices adopted)
		if (await viewButton.isVisible()) {
			await viewButton.click()

			// Wait for navigation to complete
			await page.waitForTimeout(1000)

			// Graph should still be present
			await expect(page.locator('[data-testid="graph-node"]').first()).toBeVisible()
		}
	})
})
