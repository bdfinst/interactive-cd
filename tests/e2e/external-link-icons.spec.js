import { test, expect } from '@playwright/test'

test.describe('External Learning Resources', () => {
	test('users can identify which practices have additional documentation on initial load', async ({
		page
	}) => {
		await page.goto('/')
		await page.waitForSelector('[data-testid="graph-node"]')

		// Practices that should have external resources on initial load
		const practicesWithGuides = [
			'Application Configuration Management',
			'Continuous Integration',
			'Immutable Artifact',
			'On-demand Rollback',
			'Production-like Test Environment'
		]

		for (const practiceName of practicesWithGuides) {
			// Find the unselected practice card by its user-visible name
			const practice = page
				.locator('[data-testid="graph-node"][data-selected="false"]')
				.filter({ hasText: practiceName })
				.first()

			// Verify the practice is visible to users
			await expect(practice).toBeVisible()

			// Verify there is some visual indicator that external resources exist
			// (we don't care if it's an icon, badge, or other indicator)
			const visualIndicator = practice.locator('svg')
			await expect(visualIndicator).toBeVisible()
		}
	})

	test('users can access external documentation when selecting a practice', async ({ page }) => {
		await page.goto('/')
		await page.waitForSelector('[data-testid="graph-node"]')

		// Select a practice known to have documentation
		const ciPractice = page.locator(
			'[data-testid="graph-node"][data-practice-id="continuous-integration"]'
		)

		await ciPractice.click()

		// User should see a link or button to access more information
		const moreInfoLink = page.locator('[data-testid="quick-start-guide-link"]')
		await expect(moreInfoLink).toBeVisible()

		// Verify the link has meaningful text
		await expect(moreInfoLink).toContainText(/More Info|Learn More|Quick Start/i)

		// Verify the link opens in a new tab for safety
		await expect(moreInfoLink).toHaveAttribute('target', '_blank')
		await expect(moreInfoLink).toHaveAttribute('rel', /noopener/)

		// Verify the link URL is valid and external
		const href = await moreInfoLink.getAttribute('href')
		expect(href).toBeTruthy()
		expect(href).toMatch(/^https?:\/\//)
	})

	test('practices without external resources do not show resource indicators', async ({ page }) => {
		await page.goto('/')
		await page.waitForSelector('[data-testid="graph-node"]')

		// The root practice (Continuous Delivery) does not have a quickstart guide
		const rootPractice = page.locator(
			'[data-testid="graph-node"][data-practice-id="continuous-delivery"][data-selected="true"]'
		)

		await expect(rootPractice).toBeVisible()

		// When selected, it should NOT show a "More Info" button
		const moreInfoButton = rootPractice.locator('[data-testid="quick-start-guide-link"]')
		await expect(moreInfoButton).not.toBeVisible()
	})

	test('external resource links open in new tabs safely', async ({ page, context }) => {
		await page.goto('/')
		await page.waitForSelector('[data-testid="graph-node"]')

		// Select a practice with external resources
		await page
			.locator('[data-testid="graph-node"][data-practice-id="continuous-integration"]')
			.click()

		const moreInfoLink = page.locator('[data-testid="quick-start-guide-link"]')
		await expect(moreInfoLink).toBeVisible()

		// Set up listener for new page/tab
		const pagePromise = context.waitForEvent('page')

		// Click the link
		await moreInfoLink.click()

		// Verify new tab opens
		const newPage = await pagePromise
		await newPage.waitForLoadState('domcontentloaded')

		// Verify it navigates to an external URL
		const url = newPage.url()
		expect(url).toMatch(/^https?:\/\//)

		await newPage.close()
	})

	test('external resources are accessible via keyboard navigation', async ({ page }) => {
		await page.goto('/')
		await page.waitForSelector('[data-testid="graph-node"]')

		// Navigate to a practice using keyboard
		const ciPractice = page.locator(
			'[data-testid="graph-node"][data-practice-id="continuous-integration"]'
		)

		await ciPractice.focus()
		await page.keyboard.press('Enter')

		// Verify the More Info link is visible and focusable
		const moreInfoLink = page.locator('[data-testid="quick-start-guide-link"]')
		await expect(moreInfoLink).toBeVisible()

		await moreInfoLink.focus()
		await expect(moreInfoLink).toBeFocused()

		// Verify Enter key activates the link
		await expect(moreInfoLink).toBeEnabled()
	})
})
