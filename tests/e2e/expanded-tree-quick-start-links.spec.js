import { test, expect } from '@playwright/test'

test.describe('Expanded Tree View - Quick Start Links', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await page.waitForSelector('[data-testid="graph-node"]')

		// Expand the tree view
		const expandButton = page.getByRole('button', { name: /expand/i })
		await expandButton.click()

		// Wait for expanded tree to be visible
		await page.waitForTimeout(500)
	})

	test('unselected cards show external link icon when practice has quickStartGuide', async ({
		page
	}) => {
		// Continuous Integration has a quickStartGuide
		const ciPractice = page.locator(
			'[data-testid="graph-node"][data-practice-id="continuous-integration"][data-selected="false"]'
		)

		await expect(ciPractice).toBeVisible()

		// Should have an external link icon (svg)
		const externalIcon = ciPractice.locator('svg').first()
		await expect(externalIcon).toBeVisible()
	})

	test('selected cards show Info button when practice has quickStartGuide', async ({ page }) => {
		// Click on Continuous Integration to select it
		const ciPractice = page
			.locator('[data-testid="graph-node"][data-practice-id="continuous-integration"]')
			.first()

		await ciPractice.click()

		// Wait for selection
		await page.waitForTimeout(300)

		// Now check for the selected card
		const selectedCard = page.locator(
			'[data-testid="graph-node"][data-practice-id="continuous-integration"][data-selected="true"]'
		)

		await expect(selectedCard).toBeVisible()

		// Should have a clickable Info button
		const infoButton = selectedCard.locator('[data-testid="quick-start-guide-link"]')
		await expect(infoButton).toBeVisible()
		await expect(infoButton).toContainText(/More Info/i)
	})

	test('Info button opens external link in new tab', async ({ page, context }) => {
		// Select the card first
		const ciPractice = page
			.locator('[data-testid="graph-node"][data-practice-id="continuous-integration"]')
			.first()

		await ciPractice.click()
		await page.waitForTimeout(300)

		const selectedCard = page.locator(
			'[data-testid="graph-node"][data-practice-id="continuous-integration"][data-selected="true"]'
		)

		const infoButton = selectedCard.locator('[data-testid="quick-start-guide-link"]')
		await expect(infoButton).toBeVisible()

		// Verify link attributes
		await expect(infoButton).toHaveAttribute('target', '_blank')
		await expect(infoButton).toHaveAttribute('rel', /noopener/)

		// Verify href is valid
		const href = await infoButton.getAttribute('href')
		expect(href).toMatch(/^https?:\/\//)
	})

	test('multiple practices with quickStartGuides show icons when unselected and buttons when selected', async ({
		page
	}) => {
		const practicesWithGuides = [
			'continuous-integration',
			'application-configuration',
			'deterministic'
		]

		for (const practiceId of practicesWithGuides) {
			// Check unselected card for icon only
			const unselectedPractice = page.locator(
				`[data-testid="graph-node"][data-practice-id="${practiceId}"][data-selected="false"]`
			)

			const count = await unselectedPractice.count()
			if (count > 0 && (await unselectedPractice.isVisible())) {
				// Should have external link icon
				const icon = unselectedPractice.locator('svg').first()
				await expect(icon).toBeVisible()

				// Should NOT have Info button when unselected
				const unselectedButton = unselectedPractice.locator(
					'[data-testid="quick-start-guide-link"]'
				)
				await expect(unselectedButton).not.toBeVisible()

				// Now select it
				await unselectedPractice.click()
				await page.waitForTimeout(300)

				// Check selected card for button
				const selectedPractice = page.locator(
					`[data-testid="graph-node"][data-practice-id="${practiceId}"][data-selected="true"]`
				)

				const selectedButton = selectedPractice.locator('[data-testid="quick-start-guide-link"]')
				await expect(selectedButton).toBeVisible()

				// Deselect by clicking elsewhere
				const root = page
					.locator('[data-testid="graph-node"][data-practice-id="continuous-delivery"]')
					.first()
				await root.click()
				await page.waitForTimeout(300)
			}
		}
	})

	test('practices without quickStartGuide do not show icon or button', async ({ page }) => {
		// Continuous Delivery (root) does not have a quickStartGuide
		// When unselected in expanded view, should not show link elements

		// First, click on a different practice to unselect the root
		const ciPractice = page
			.locator('[data-testid="graph-node"][data-practice-id="continuous-integration"]')
			.first()
		await ciPractice.click()

		// Now check if root practice is unselected
		const rootPractice = page.locator(
			'[data-testid="graph-node"][data-practice-id="continuous-delivery"][data-selected="false"]'
		)

		const count = await rootPractice.count()
		if (count > 0 && (await rootPractice.isVisible())) {
			// Should NOT have the Info button
			const button = rootPractice.locator('[data-testid="quick-start-guide-link"]')
			await expect(button).not.toBeVisible()
		}
	})

	test('Info button opens external link when card is selected', async ({ page, context }) => {
		// Select the card first
		const ciPractice = page
			.locator('[data-testid="graph-node"][data-practice-id="continuous-integration"]')
			.first()

		await ciPractice.click()
		await page.waitForTimeout(300)

		const selectedCard = page.locator(
			'[data-testid="graph-node"][data-practice-id="continuous-integration"][data-selected="true"]'
		)

		await expect(selectedCard).toBeVisible()

		const infoButton = selectedCard.locator('[data-testid="quick-start-guide-link"]')
		await expect(infoButton).toBeVisible()

		// Set up listener for new page/tab
		const pagePromise = context.waitForEvent('page')

		// Click the Info button - should open external link
		await infoButton.click()

		// Verify new tab opens with external URL
		const newPage = await pagePromise
		await newPage.waitForLoadState('domcontentloaded')

		const url = newPage.url()
		expect(url).toMatch(/^https?:\/\//)

		await newPage.close()
	})
})
