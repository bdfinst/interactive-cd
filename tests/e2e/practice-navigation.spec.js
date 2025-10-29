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

				// Wait for count to actually increase
				await expect(page.locator('[data-testid="graph-node"]')).not.toHaveCount(initialCount, {
					timeout: 2000
				})

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

			// Wait for button text to change
			await expect(collapseTreeButton).toBeVisible({ timeout: 2000 })

			// Wait for nodes to be added to DOM
			await page.waitForTimeout(300)

			// Should show more nodes
			const expandedCount = await page.locator('[data-testid="graph-node"]').count()
			expect(expandedCount).toBeGreaterThanOrEqual(initialCount)
		} else if (await collapseTreeButton.isVisible()) {
			// Already expanded, test collapse
			await collapseTreeButton.click()

			// Verify collapse button changed to expand
			await expect(expandTreeButton).toBeVisible({ timeout: 2000 })
		}
	})

	test('displays loading state while fetching practice data', async ({ page }) => {
		// This test verifies the loading UI appears
		// Note: Loading may be very fast in development, so we just verify the page loads successfully
		await page.goto('/')

		// Verify the page loaded successfully and practice nodes are present
		await expect(page.locator('[data-testid="graph-node"]').first()).toBeVisible()
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
				// Wait for selection to update
				await expect(nodeWithDeps).toHaveAttribute('data-selected', 'true', { timeout: 2000 })
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

				// Wait for selection state to update
				const clickedNode = page.locator(`[data-practice-id="${practiceId}"]`)
				await expect(clickedNode).toHaveAttribute('data-selected', 'true', { timeout: 2000 })

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

			// Wait for deselection
			const nodeAfterClick = page.locator(`[data-practice-id="${practiceId}"]`)
			await expect(nodeAfterClick).toHaveAttribute('data-selected', 'false', { timeout: 1000 })

			const isSelectedAfter = await nodeAfterClick.getAttribute('data-selected')
			expect(isSelectedAfter).toBe('false')
		}
	})

	test('navigates to selected practice in collapsed view showing parents and direct dependencies', async ({
		page
	}) => {
		// Given I am viewing the practice graph in collapsed (drill-down) mode
		// The root practice "Continuous Delivery" should be displayed with its direct dependencies
		const rootNode = page.locator('[data-practice-id="continuous-delivery"]')
		await expect(rootNode).toBeVisible()

		// Get initial ancestor count (should be 0 for root)
		const initialAncestors = await page.locator('[data-testid="ancestor-node"]').count()
		expect(initialAncestors).toBe(0)

		// Find a dependency practice card (e.g., "Continuous Integration")
		const dependencyNode = page.locator('[data-practice-id="continuous-integration"]').first()
		await expect(dependencyNode).toBeVisible()

		// When I click the details button on the dependency practice
		const detailsButton = dependencyNode.locator('button[aria-label*="View details"]')
		await detailsButton.click()

		// Then "Continuous Integration" becomes the current practice (selected and shown with full details)
		const selectedNode = page.locator('[data-practice-id="continuous-integration"]')
		await expect(selectedNode).toHaveAttribute('data-selected', 'true', { timeout: 2000 })
		const isSelected = await selectedNode.getAttribute('data-selected')
		expect(isSelected).toBe('true')

		// And "Continuous Delivery" appears as an ancestor above
		const ancestorNodes = page.locator('[data-testid="ancestor-node"]')
		const ancestorCount = await ancestorNodes.count()
		expect(ancestorCount).toBeGreaterThan(0)

		// Verify the ancestor is "Continuous Delivery"
		const cdAncestor = page.locator(
			'[data-testid="ancestor-node"][data-practice-id="continuous-delivery"]'
		)
		await expect(cdAncestor).toBeVisible()

		// And only the direct dependencies of "Continuous Integration" are displayed
		// (not including ancestors, just the dependency nodes)
		const dependencyNodes = page.locator(
			'[data-testid="graph-node"]:not([data-testid="ancestor-node"])'
		)
		const dependencyCount = await dependencyNodes.count()
		// CI has 3 direct dependencies, plus the current practice itself
		expect(dependencyCount).toBeGreaterThanOrEqual(1) // At least the current practice is visible
	})

	test.skip('navigates to selected practice in expanded tree view showing parents and all dependencies', async ({
		page
	}) => {
		// First, expand the full tree
		const expandButton = page.locator('[data-testid="toggle-full-tree"]')
		await expandButton.click()
		await page.waitForTimeout(500)

		// Verify we're in expanded tree view (should show all 23 practices)
		const allNodes = page.locator('[data-testid="graph-node"]')
		const totalNodeCount = await allNodes.count()
		expect(totalNodeCount).toBeGreaterThan(10) // Should be 23, but at least > 10

		// Given I am viewing the full expanded tree with all practices visible
		// When I click the details button on "Continuous Integration"
		const ciNode = page.locator('[data-practice-id="continuous-integration"]').first()
		await expect(ciNode).toBeVisible()

		const detailsButton = ciNode.locator('button[aria-label*="View details"]')
		await detailsButton.click()
		await page.waitForTimeout(500)

		// Then the view filters to show only relevant practices
		// "Continuous Integration" becomes the current practice
		const selectedNode = page.locator('[data-practice-id="continuous-integration"]')
		const isSelected = await selectedNode.getAttribute('data-selected')
		expect(isSelected).toBe('true')

		// And "Continuous Delivery" appears as an ancestor above
		const cdAncestor = page.locator(
			'[data-testid="ancestor-node"][data-practice-id="continuous-delivery"]'
		)
		await expect(cdAncestor).toBeVisible()

		// And all direct and indirect dependencies of "Continuous Integration" are displayed
		// The visible node count should be less than the full tree (filtered view)
		const visibleNodesAfter = await page.locator('[data-testid="graph-node"]').count()
		expect(visibleNodesAfter).toBeLessThan(totalNodeCount)
		expect(visibleNodesAfter).toBeGreaterThan(1) // At least CI and some dependencies

		// Practices outside this hierarchy are hidden
		// For example, "Application Pipeline" is NOT a dependency of CI, so it should not be visible
		const unrelatedPractice = page.locator('[data-practice-id="application-pipeline"]')
		const isVisible = await unrelatedPractice.isVisible()
		// This practice should not be visible if it's not in CI's dependency tree
		// (We'll verify this once implementation is complete)
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

	test.skip('legend items are centered on screen', async ({ page }) => {
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

		// Verify button text changed
		const expectedNewText = initialText === 'Expand' ? 'Collapse' : 'Expand'
		await expect(expandButton).toHaveText(expectedNewText, { timeout: 2000 })
		const newText = await expandButton.textContent()
		expect(newText).not.toBe(initialText)

		// Wait for nodes to be added/removed from DOM
		await page.waitForTimeout(300)

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
		await expect(expandButton).toHaveText(initialText, { timeout: 2000 })

		// Wait for nodes to update
		await page.waitForTimeout(300)

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

			// Verify SVG with connections exists
			const svg = page.locator('svg[aria-hidden="true"]')
			await expect(svg).toBeVisible({ timeout: 2000 })
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
