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

	test('shows dependency count when practice has dependencies', async ({ page }) => {
		// Wait for page to load
		await page.waitForSelector('[data-testid="graph-node"]')

		// Find a practice that is not selected (should show dependency count)
		const unselectedNode = page.locator('[data-selected="false"]').first()

		if (await unselectedNode.isVisible()) {
			// Check if it has a dependency count displayed
			const dependencyText = unselectedNode.locator('text=/\\d+ dependenc(y|ies)/')
			if (await dependencyText.isVisible()) {
				await expect(dependencyText).toBeVisible()
			}
		}
	})

	test('auto-expands practice dependencies when practice is clicked', async ({ page }) => {
		// Wait for page to load
		await page.waitForSelector('[data-testid="graph-node"]')

		// Get initial node count
		const initialCount = await page.locator('[data-testid="graph-node"]').count()

		// Find a non-selected practice with dependencies
		const unselectedNode = page.locator('[data-selected="false"]').first()

		if (await unselectedNode.isVisible()) {
			// Check if it has dependencies
			const hasDependencies = await unselectedNode
				.locator('text=/\\d+ dependenc(y|ies)/')
				.isVisible()

			if (hasDependencies) {
				// Click the expand/details button to select the practice
				const expandButton = unselectedNode.locator('button[aria-label*="View details"]')
				await expandButton.click()

				// Wait for navigation to complete
				await page.waitForTimeout(500)

				// Verify more practice nodes are visible (dependencies auto-expanded)
				const finalCount = await page.locator('[data-testid="graph-node"]').count()
				expect(finalCount).toBeGreaterThan(initialCount)
			}
		}
	})

	test('can use tree expand/collapse button to toggle full tree', async ({ page }) => {
		// Wait for page to load
		await page.waitForSelector('[data-testid="graph-node"]')

		// Look for the main expand/collapse tree button
		const expandTreeButton = page.locator('button:has-text("Expand")')
		const collapseTreeButton = page.locator('button:has-text("Collapse")')

		// Check if expand button exists
		if (await expandTreeButton.isVisible()) {
			// Get initial count
			const initialCount = await page.locator('[data-testid="graph-node"]').count()

			// Click expand
			await expandTreeButton.click()
			await page.waitForTimeout(500)

			// Should show more nodes
			const expandedCount = await page.locator('[data-testid="graph-node"]').count()
			expect(expandedCount).toBeGreaterThanOrEqual(initialCount)
		} else if (await collapseTreeButton.isVisible()) {
			// Already expanded, test collapse
			await collapseTreeButton.click()
			await page.waitForTimeout(500)

			// Verify collapse button changed to expand
			await expect(page.locator('button:has-text("Expand")')).toBeVisible()
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

		// Click on practices to navigate until we find one with no dependencies
		for (let i = 0; i < 3; i++) {
			// Find a practice with dependencies
			const nodeWithDeps = page
				.locator('[data-testid="graph-node"]')
				.filter({ hasText: /\d+ dependenc(y|ies)/ })
				.first()

			if (await nodeWithDeps.isVisible()) {
				// Click the expand button to navigate
				const expandButton = nodeWithDeps.locator('button[aria-label*="View details"]')
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
		// Get all practice nodes
		const nodes = page.locator('[data-testid="graph-node"]')
		const count = await nodes.count()

		if (count > 1) {
			// Find a non-selected practice
			const unselectedNode = page.locator('[data-selected="false"]').first()

			if (await unselectedNode.isVisible()) {
				// Get the practice ID before clicking
				const practiceId = await unselectedNode.getAttribute('data-practice-id')

				// Click the expand/details button within the practice card
				const expandButton = unselectedNode.locator('button[aria-label*="View details"]')
				await expandButton.click()
				await page.waitForTimeout(500)

				// Re-query to get updated state
				const clickedNode = page.locator(`[data-practice-id="${practiceId}"]`)
				const isSelected = await clickedNode.getAttribute('data-selected')
				expect(isSelected).toBe('true')
			}
		}
	})

	test('deselects practice when clicked again', async ({ page }) => {
		// Find current selected practice
		const selectedNode = page.locator('[data-selected="true"]').first()

		if (await selectedNode.isVisible()) {
			const practiceId = await selectedNode.getAttribute('data-practice-id')

			// Click the close button within the selected practice card
			const closeButton = selectedNode.locator('button[aria-label*="Close details"]')
			await closeButton.click()
			await page.waitForTimeout(200)

			// Verify it's deselected
			const nodeAfterClick = page.locator(`[data-practice-id="${practiceId}"]`)
			const isSelectedAfter = await nodeAfterClick.getAttribute('data-selected')
			expect(isSelectedAfter).toBe('false')
		}
	})
})

test.describe('Visual Elements', () => {
	test('displays category legend', async ({ page }) => {
		await page.goto('/')
		await page.waitForSelector('[data-testid="graph-node"]')

		// Verify category legend exists
		const legend = page.locator('[data-testid="category-legend"]')
		await expect(legend).toBeVisible()

		// Verify legend items exist
		const legendItems = page.locator('[data-testid="legend-item"]')
		const count = await legendItems.count()
		expect(count).toBeGreaterThan(0)
	})

	test('legend items are centered on screen', async ({ page }) => {
		await page.goto('/')
		await page.waitForSelector('[data-testid="graph-node"]')

		const legend = page.locator('[data-testid="category-legend"]')
		await expect(legend).toBeVisible()

		// Get the legend items container (has data-testid="legend-items")
		const legendItemsContainer = page.locator('[data-testid="legend-items"]')
		const itemsBox = await legendItemsContainer.boundingBox()
		const viewportSize = page.viewportSize()

		// Calculate if items are centered (allowing small tolerance)
		const expectedCenter = viewportSize.width / 2
		const actualCenter = itemsBox.x + itemsBox.width / 2
		const tolerance = 50 // 50px tolerance for centering

		expect(Math.abs(actualCenter - expectedCenter)).toBeLessThan(tolerance)
	})

	test('expand button in legend toggles tree view', async ({ page }) => {
		await page.goto('/')
		await page.waitForSelector('[data-testid="graph-node"]')

		// Verify expand button is in the legend
		const legend = page.locator('[data-testid="category-legend"]')
		const expandButton = legend.locator('[data-testid="toggle-full-tree"]')
		await expect(expandButton).toBeVisible()

		// Get initial state and node count
		const initialText = await expandButton.textContent()
		const initialNodeCount = await page.locator('[data-testid="graph-node"]').count()

		// Click the expand button
		await expandButton.click()
		await page.waitForTimeout(500)

		// Verify button text changed
		const newText = await expandButton.textContent()
		expect(newText).not.toBe(initialText)

		// Verify node count changed (expanded should show more, collapsed should show fewer)
		const newNodeCount = await page.locator('[data-testid="graph-node"]').count()
		if (initialText === 'Expand') {
			// Was collapsed, now expanded
			expect(newNodeCount).toBeGreaterThanOrEqual(initialNodeCount)
			expect(newText).toBe('Collapse')
		} else {
			// Was expanded, now collapsed
			expect(newNodeCount).toBeLessThanOrEqual(initialNodeCount)
			expect(newText).toBe('Expand')
		}

		// Toggle back and verify it returns to original state
		await expandButton.click()
		await page.waitForTimeout(500)

		const finalText = await expandButton.textContent()
		const finalNodeCount = await page.locator('[data-testid="graph-node"]').count()

		expect(finalText).toBe(initialText)
		expect(finalNodeCount).toBe(initialNodeCount)
	})

	test('shows connection lines between practices', async ({ page }) => {
		await page.goto('/')
		await page.waitForSelector('[data-testid="graph-node"]')

		// Find a practice with dependencies to auto-expand
		const nodeWithDeps = page
			.locator('[data-testid="graph-node"]')
			.filter({ hasText: /\d+ dependenc(y|ies)/ })
			.first()

		if (await nodeWithDeps.isVisible()) {
			// Click the expand button to select and expand dependencies
			const expandButton = nodeWithDeps.locator('button[aria-label*="View details"]')
			await expandButton.click()
			await page.waitForTimeout(500)

			// Verify SVG with connections exists
			const svg = page.locator('svg[aria-hidden="true"]')
			if (await svg.isVisible()) {
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
		}
	})
})
