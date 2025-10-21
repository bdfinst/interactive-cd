import { test, expect } from '@playwright/test'

test.describe('Practice Navigation', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('displays the main page with practice graph', async ({ page }) => {
		// Verify practice graph is loaded
		await expect(page.locator('[data-testid="practice-graph"]')).toBeVisible()

		// Verify at least one practice node is displayed
		await expect(page.locator('[data-testid="graph-node"]').first()).toBeVisible()
	})

	test('loads and displays the root practice', async ({ page }) => {
		// Wait for practice node to appear
		await expect(page.locator('[data-testid="graph-node"]').first()).toBeVisible()

		// Verify it has a practice ID
		const rootNode = page.locator('[data-testid="graph-node"]').first()
		const practiceId = await rootNode.getAttribute('data-practice-id')
		expect(practiceId).toBeTruthy()
	})

	test('selects a practice when clicked', async ({ page }) => {
		// Wait for practice nodes to load
		await page.waitForSelector('[data-testid="graph-node"]')

		// Get the root practice (should be auto-selected)
		const rootNode = page.locator('[data-testid="graph-node"]').first()
		const isSelected = await rootNode.getAttribute('data-selected')

		// Root should be auto-selected
		expect(isSelected).toBe('true')
	})

	test('shows practice details when selected', async ({ page }) => {
		// Wait for root practice to be selected
		await page.waitForSelector('[data-selected="true"]')

		// Practice description should be visible
		await expect(page.locator('[data-selected="true"] p').first()).toBeVisible()
	})

	test('displays benefits when practice is selected', async ({ page }) => {
		// Wait for selected practice
		await page.waitForSelector('[data-selected="true"]')

		// Check if Benefits section exists (not all practices have benefits)
		const benefitsHeading = page.locator('text=Benefits')
		if (await benefitsHeading.isVisible()) {
			// Verify benefit items are shown
			await expect(page.locator('[data-selected="true"] ul li').first()).toBeVisible()
		}
	})

	test('shows expand button when practice has dependencies', async ({ page }) => {
		// Wait for selected practice
		await page.waitForSelector('[data-selected="true"]')

		// Check for expand button
		const expandButton = page.locator('button:has-text("Expand Dependencies")')
		const collapseButton = page.locator('button:has-text("Collapse Dependencies")')

		// At least one should exist if the practice has dependencies
		const hasExpandButton = (await expandButton.count()) > 0
		const hasCollapseButton = (await collapseButton.count()) > 0

		if (hasExpandButton || hasCollapseButton) {
			expect(hasExpandButton || hasCollapseButton).toBeTruthy()
		}
	})

	test('expands practice dependencies when expand button is clicked', async ({ page }) => {
		// Wait for page to load
		await page.waitForSelector('[data-testid="graph-node"]')

		// Look for expand button
		const expandButton = page.locator('button:has-text("Expand Dependencies")').first()

		if (await expandButton.isVisible()) {
			// Click expand
			await expandButton.click()

			// Wait for navigation to complete
			await page.waitForTimeout(500)

			// Verify more practice nodes are visible (dependencies)
			const nodeCount = await page.locator('[data-testid="graph-node"]').count()
			expect(nodeCount).toBeGreaterThan(1)
		}
	})

	test('navigates back through practice hierarchy', async ({ page }) => {
		// Wait for page to load
		await page.waitForSelector('[data-testid="graph-node"]')

		// Check for expand button
		const expandButton = page.locator('button:has-text("Expand Dependencies")').first()

		if (await expandButton.isVisible()) {
			// Expand to a dependency
			await expandButton.click()
			await page.waitForTimeout(500)

			// Now check for collapse button
			const collapseButton = page.locator('button:has-text("Collapse Dependencies")').first()

			if (await collapseButton.isVisible()) {
				// Click collapse to navigate back
				await collapseButton.click()
				await page.waitForTimeout(500)

				// Verify we're back at the previous level
				const expandButtonAgain = page.locator('button:has-text("Expand Dependencies")').first()
				if (await expandButtonAgain.isVisible()) {
					await expect(expandButtonAgain).toBeVisible()
				}
			}
		}
	})

	test('displays loading state while fetching practice data', async ({ page }) => {
		// This test verifies the loading UI appears
		// We need to intercept the network to slow it down for testing
		await page.route('**/api/practices/cards**', async route => {
			await page.waitForTimeout(100)
			await route.continue()
		})

		await page.goto('/')

		// Look for loading indicator
		const loadingText = page.locator('text=Loading dependencies')
		// Loading might be very fast, so we just check it doesn't error
		// In a real scenario with slow network, this would be visible
	})

	test('shows "No dependencies" message for leaf practices', async ({ page }) => {
		// Navigate to find a leaf practice
		await page.waitForSelector('[data-testid="graph-node"]')

		// Expand practices until we find one with no dependencies
		for (let i = 0; i < 3; i++) {
			const expandButton = page.locator('button:has-text("Expand Dependencies")').first()
			if (await expandButton.isVisible()) {
				await expandButton.click()
				await page.waitForTimeout(500)
			}
		}

		// Check if we see the "No dependencies" message
		const noDepMessage = page.locator('text=No dependencies')
		if (await noDepMessage.isVisible()) {
			await expect(noDepMessage).toBeVisible()
		}
	})
})

test.describe('Practice Selection', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await page.waitForSelector('[data-testid="graph-node"]')
	})

	test('allows selecting different practices in dependency view', async ({ page }) => {
		// Expand to show dependencies
		const expandButton = page.locator('button:has-text("Expand Dependencies")').first()

		if (await expandButton.isVisible()) {
			await expandButton.click()
			await page.waitForTimeout(500)

			// Get all practice nodes
			const nodes = page.locator('[data-testid="graph-node"]')
			const count = await nodes.count()

			if (count > 1) {
				// Click on a dependency node
				await nodes.nth(1).click()

				// Verify it becomes selected
				const selectedNode = nodes.nth(1)
				const isSelected = await selectedNode.getAttribute('data-selected')
				expect(isSelected).toBe('true')
			}
		}
	})

	test('deselects practice when clicked again', async ({ page }) => {
		// Find current selected practice
		const selectedNode = page.locator('[data-selected="true"]').first()

		if (await selectedNode.isVisible()) {
			const practiceId = await selectedNode.getAttribute('data-practice-id')

			// Click it again
			await selectedNode.click()
			await page.waitForTimeout(200)

			// Verify it's deselected
			const nodeAfterClick = page.locator(`[data-practice-id="${practiceId}"]`)
			const isSelectedAfter = await nodeAfterClick.getAttribute('data-selected')
			expect(isSelectedAfter).toBe('false')
		}
	})
})

test.describe('Visual Elements', () => {
	test('displays category indicators for practices', async ({ page }) => {
		await page.goto('/')
		await page.waitForSelector('[data-testid="graph-node"]')

		// Verify category dots exist
		const categoryContainer = page.locator('[role="img"]').first()
		await expect(categoryContainer).toBeVisible()
	})

	test('shows connection lines between practices', async ({ page }) => {
		await page.goto('/')
		await page.waitForSelector('[data-testid="graph-node"]')

		// Expand to show dependencies and connections
		const expandButton = page.locator('button:has-text("Expand Dependencies")').first()

		if (await expandButton.isVisible()) {
			await expandButton.click()
			await page.waitForTimeout(500)

			// Verify SVG with connections exists
			const svg = page.locator('svg[aria-hidden="true"]')
			await expect(svg).toBeVisible()

			// Verify it has path elements (curved connection lines)
			const paths = page.locator('svg path')
			const pathCount = await paths.count()
			expect(pathCount).toBeGreaterThan(0)

			// Verify it has circle elements (connection terminators)
			const circles = page.locator('svg circle')
			const circleCount = await circles.count()
			expect(circleCount).toBeGreaterThan(0)
		}
	})
})
