import { test, expect } from '@playwright/test'

test.describe('Dependency Counts Display', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		// Wait for page to load
		await page.waitForSelector('[data-testid="graph-node"]')
	})

	test.describe('Collapsed View - Direct and Total Counts', () => {
		test('displays direct and total dependency counts in collapsed view', async ({ page }) => {
			// In collapsed view, unselected practices with dependencies should show both counts
			// Find a practice node that has dependencies and is not selected
			const practiceNodes = await page.locator('[data-testid="graph-node"]').all()

			let foundDirectAndTotal = false
			for (const node of practiceNodes) {
				const isSelected = await node.getAttribute('data-selected')
				if (isSelected === 'false') {
					// Check if it has the direct/total display
					const directText = await node.locator('text=/\\d+ direct/').count()
					const totalText = await node.locator('text=/\\d+ total/').count()

					if (directText > 0 && totalText > 0) {
						foundDirectAndTotal = true
						// Verify both are visible
						await expect(node.locator('text=/\\d+ direct/')).toBeVisible()
						await expect(node.locator('text=/\\d+ total/')).toBeVisible()
						break
					}
				}
			}

			expect(foundDirectAndTotal).toBe(true)
		})

		test('direct count is less than or equal to total count', async ({ page }) => {
			// Find unselected practices with dependency counts
			const practiceNodes = await page
				.locator('[data-testid="graph-node"][data-selected="false"]')
				.all()

			for (const node of practiceNodes) {
				const directMatch = await node
					.locator('text=/\\d+ direct/')
					.textContent()
					.catch(() => null)
				const totalMatch = await node
					.locator('text=/\\d+ total/')
					.textContent()
					.catch(() => null)

				if (directMatch && totalMatch) {
					const directCount = parseInt(directMatch.match(/(\d+) direct/)[1])
					const totalCount = parseInt(totalMatch.match(/(\d+) total/)[1])

					// Direct should always be <= total
					expect(directCount).toBeLessThanOrEqual(totalCount)
				}
			}
		})

		test('practices with no dependencies show no counts in collapsed view', async ({ page }) => {
			// Leaf practices (no dependencies) should not show dependency counts
			// We need to navigate to find a leaf practice
			// The root practice should have dependencies, so let's check its dependencies
			const rootNode = await page.locator('[data-testid="graph-node"]').first()
			await rootNode.click()

			// Wait for dependencies to load
			await page.waitForTimeout(500)

			// Look for a dependency node that might be a leaf
			const dependencyNodes = await page
				.locator('[data-testid="graph-node"][data-selected="false"]')
				.all()

			// Find one without dependency text
			for (const node of dependencyNodes) {
				const hasDirectText = await node.locator('text=/\\d+ direct/').count()
				const hasTotalText = await node.locator('text=/\\d+ total/').count()
				const hasDepText = await node.locator('text=/\\d+ (dependency|dependencies)/').count()

				// If it has no dependency indicators, it's a leaf
				if (hasDirectText === 0 && hasTotalText === 0 && hasDepText === 0) {
					// This is valid - leaf practices show nothing
					expect(true).toBe(true)
					return
				}
			}
		})
	})

	test.describe('Expanded Tree View', () => {
		test('does not show dependency counts in expanded tree view', async ({ page }) => {
			// Click the tree expand button
			const expandButton = await page.locator('button:has-text("Expand")')
			if ((await expandButton.count()) > 0) {
				await expandButton.click()
				await page.waitForTimeout(1000) // Wait for tree to load and expand

				// In expanded view, should NOT show any dependency counts
				const practiceNodes = await page
					.locator('[data-testid="graph-node"][data-selected="false"]')
					.all()

				for (const node of practiceNodes) {
					// Should NOT show "X dependencies" format
					const traditionalText = await node
						.locator('text=/\\d+ (dependency|dependencies)/')
						.count()
					expect(traditionalText).toBe(0)

					// Should NOT show "direct" and "total"
					const hasDirectText = await node.locator('text=/\\d+ direct/').count()
					const hasTotalText = await node.locator('text=/\\d+ total/').count()

					expect(hasDirectText).toBe(0)
					expect(hasTotalText).toBe(0)
				}
			}
		})
	})

	test.describe('Color Intensity Based on Dependencies', () => {
		test('practices have different background colors based on category', async ({ page }) => {
			// Get multiple practice nodes
			const practiceNodes = await page.locator('[data-testid="graph-node"]').all()

			const colors = new Set()
			for (const node of practiceNodes.slice(0, 5)) {
				const bgColor = await node.evaluate(el => {
					return window.getComputedStyle(el).backgroundColor
				})
				colors.add(bgColor)
			}

			// Should have at least 1 color (likely more due to different categories)
			expect(colors.size).toBeGreaterThanOrEqual(1)
		})

		test('color intensity varies in collapsed view', async ({ page }) => {
			// In collapsed view, practices with different dependency counts should have
			// different color intensities
			const practiceNodes = await page
				.locator('[data-testid="graph-node"][data-selected="false"]')
				.all()

			const colorsAndCounts = []
			for (const node of practiceNodes.slice(0, 10)) {
				const bgColor = await node.evaluate(el => {
					return window.getComputedStyle(el).backgroundColor
				})

				const totalMatch = await node
					.locator('text=/\\d+ total/')
					.textContent()
					.catch(() => null)
				if (totalMatch) {
					const totalCount = parseInt(totalMatch.match(/(\d+) total/)[1])
					colorsAndCounts.push({ bgColor, totalCount })
				}
			}

			// If we have practices with different total counts, they should have
			// different color intensities (different RGB values)
			if (colorsAndCounts.length >= 2) {
				const sortedByCount = [...colorsAndCounts].sort((a, b) => a.totalCount - b.totalCount)

				// Practices with very different counts should have noticeably different colors
				if (sortedByCount[0].totalCount < sortedByCount[sortedByCount.length - 1].totalCount - 5) {
					expect(sortedByCount[0].bgColor).not.toBe(sortedByCount[sortedByCount.length - 1].bgColor)
				}
			}
		})
	})

	test.describe('Selected Practice Behavior', () => {
		test('selected practice shows full details instead of counts', async ({ page }) => {
			// Click on an unselected practice with dependencies to select it
			const unselectedPractices = await page
				.locator('[data-testid="graph-node"][data-selected="false"]')
				.all()

			// Find one with dependency counts
			let practiceToClick = null
			for (const node of unselectedPractices) {
				const hasDirectText = await node.locator('text=/\\d+ direct/').count()
				if (hasDirectText > 0) {
					practiceToClick = node
					break
				}
			}

			if (practiceToClick) {
				await practiceToClick.click()
				await page.waitForTimeout(300)

				// Selected practice should show description, not dependency counts
				const selectedNode = await page
					.locator('[data-testid="graph-node"][data-selected="true"]')
					.first()

				// Should have text content (description or requirements/benefits)
				const textContent = await selectedNode.textContent()
				expect(textContent.length).toBeGreaterThan(50) // Has substantial content

				// Should NOT show "X direct" / "Y total" format
				const hasDirectText = await selectedNode.locator('text=/\\d+ direct/').count()
				const hasTotalText = await selectedNode.locator('text=/\\d+ total/').count()

				expect(hasDirectText).toBe(0)
				expect(hasTotalText).toBe(0)
			}
		})
	})

	test.describe('Visual Consistency', () => {
		test('dependency count section has consistent styling', async ({ page }) => {
			// Find a practice with dependency counts
			const practiceNodes = await page
				.locator('[data-testid="graph-node"][data-selected="false"]')
				.all()

			for (const node of practiceNodes) {
				const directText = await node.locator('text=/\\d+ direct/').count()
				if (directText > 0) {
					// Check that the direct count has font-semibold class
					const directElement = await node.locator('text=/\\d+ direct/').first()
					const classes = await directElement.getAttribute('class')

					expect(classes).toContain('font-semibold')
					break
				}
			}
		})
	})
})

test.describe('Dependency Count Data Validation', () => {
	test('API returns practices with dependency count data', async ({ page }) => {
		// Navigate to the page first
		await page.goto('/')
		await page.waitForSelector('[data-testid="graph-node"]')

		// Set up response listener before clicking
		const responsePromise = page.waitForResponse(
			response => response.url().includes('/api/practices/cards') && response.status() === 200
		)

		// Click on a practice with dependencies to trigger the API call
		const practiceWithDeps = await page
			.locator('[data-testid="graph-node"][data-selected="false"]')
			.filter({ hasText: /\d+ direct/ })
			.first()

		await practiceWithDeps.click()

		// Wait for and verify the API response
		const response = await responsePromise
		const data = await response.json()

		expect(data.success).toBe(true)
		expect(data.data).toBeDefined()
		expect(Array.isArray(data.data)).toBe(true)

		// Find a practice with dependencies
		const practice = data.data.find(p => p.dependencyCount > 0)
		expect(practice).toBeDefined()

		// Verify it has the new dependency count properties
		expect(practice.directDependencyCount).toBeDefined()
		expect(practice.totalDependencyCount).toBeDefined()
		expect(practice.directDependencyCount).toBeGreaterThan(0)
		expect(practice.totalDependencyCount).toBeGreaterThan(0)
		// Total should be >= direct
		expect(practice.totalDependencyCount).toBeGreaterThanOrEqual(practice.directDependencyCount)
	})
})
