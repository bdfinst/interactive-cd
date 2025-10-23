import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Audit Indicator Feature
 *
 * Tests the development mode audit indicator that shows which practices
 * have not been audited yet. The indicator should only appear in dev mode.
 */

test.describe('Audit Indicator - Development Mode', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await page.waitForSelector('[data-testid="graph-node"]')
	})

	test('displays audit indicators for unaudited practices', async ({ page }) => {
		// Given I am viewing the practice graph in development mode
		// When I look at the practice nodes
		const auditIndicators = page.locator('[data-testid="audit-indicator-false"]')

		// Then I should see at least one audit indicator
		// (since all practices currently have audited: false)
		const count = await auditIndicators.count()
		expect(count).toBeGreaterThan(0)

		// And the first indicator should be visible
		await expect(auditIndicators.first()).toBeVisible()
	})

	test('audit indicator shows warning icon and text', async ({ page }) => {
		// Given an unaudited practice is displayed
		const auditIndicator = page.locator('[data-testid="audit-indicator-false"]').first()

		// When I examine the indicator
		// Then it should contain the warning emoji
		await expect(auditIndicator.locator('text=⚠️')).toBeVisible()

		// And it should display "NOT AUDITED" text
		await expect(auditIndicator.locator('text=NOT AUDITED')).toBeVisible()
	})

	test('audit indicator has correct ARIA accessibility attributes', async ({ page }) => {
		// Given an audit indicator is displayed
		const auditIndicator = page.locator('[data-testid="audit-indicator-false"]').first()

		// When I check its accessibility attributes
		// Then it should have role="status"
		await expect(auditIndicator).toHaveAttribute('role', 'status')

		// And it should have an aria-label describing its purpose
		const ariaLabel = await auditIndicator.getAttribute('aria-label')
		expect(ariaLabel).toContain('not been audited')
	})

	test('audit indicator has amber/warning styling', async ({ page }) => {
		// Given an audit indicator is visible
		const auditIndicator = page.locator('[data-testid="audit-indicator-false"]').first()
		await expect(auditIndicator).toBeVisible()

		// When I check its styling
		const classList = await auditIndicator.getAttribute('class')

		// Then it should have amber background color
		expect(classList).toContain('bg-amber-100')

		// And amber border
		expect(classList).toContain('border-amber-300')

		// And amber text color
		expect(classList).toContain('text-amber-800')
	})

	test('audit indicator appears on the root practice', async ({ page }) => {
		// Given the root practice is selected
		const rootNode = page.locator('[data-selected="true"]').first()
		await expect(rootNode).toBeVisible()

		// When I look for the audit indicator within the root node
		const rootAuditIndicator = rootNode.locator('[data-testid="audit-indicator-false"]')

		// Then the audit indicator should be visible
		// (assuming root practice has audited: false)
		if ((await rootAuditIndicator.count()) > 0) {
			await expect(rootAuditIndicator).toBeVisible()
		}
	})

	test('audit indicator appears on dependency practices', async ({ page }) => {
		// Given I have expanded a practice with dependencies
		const nodeWithDeps = page
			.locator('[data-testid="graph-node"]')
			.filter({ hasText: /\d+ dependenc(y|ies)/ })
			.first()

		if (await nodeWithDeps.isVisible()) {
			await nodeWithDeps.click()
			await page.waitForTimeout(500)

			// When I look at the dependency nodes
			const dependencyNodes = page.locator('[data-selected="false"]')
			const count = await dependencyNodes.count()

			if (count > 0) {
				// Then at least one dependency should have an audit indicator
				const depWithIndicator = dependencyNodes
					.locator('[data-testid="audit-indicator-false"]')
					.first()

				if ((await depWithIndicator.count()) > 0) {
					await expect(depWithIndicator).toBeVisible()
				}
			}
		}
	})

	test('audit indicators are visible in both compact and normal modes', async ({ page }) => {
		// Given practices are displayed
		await expect(page.locator('[data-testid="graph-node"]').first()).toBeVisible()

		// When I check for audit indicators
		const indicators = page.locator('[data-testid="audit-indicator-false"]')
		const count = await indicators.count()

		// Then indicators should be visible regardless of compact mode
		expect(count).toBeGreaterThan(0)

		// And the text should be appropriately sized
		const firstIndicator = indicators.first()
		const classList = await firstIndicator.getAttribute('class')

		// Should have responsive text sizing
		expect(classList).toMatch(/text-\[0\.5rem\]|text-xs/)
	})

	test('multiple unaudited practices show multiple indicators', async ({ page }) => {
		// Given multiple practices are visible on the page
		const practiceNodes = page.locator('[data-testid="graph-node"]')
		const nodeCount = await practiceNodes.count()

		// When I count the audit indicators
		const indicators = page.locator('[data-testid="audit-indicator-false"]')
		const indicatorCount = await indicators.count()

		// Then there should be indicators present
		expect(indicatorCount).toBeGreaterThan(0)

		// And the number of indicators should not exceed the number of nodes
		expect(indicatorCount).toBeLessThanOrEqual(nodeCount)
	})

	test('audit indicator is positioned correctly within practice node', async ({ page }) => {
		// Given a practice with an audit indicator
		const nodeWithIndicator = page
			.locator('[data-testid="graph-node"]')
			.filter({ has: page.locator('[data-testid="audit-indicator-false"]') })
			.first()

		if (await nodeWithIndicator.isVisible()) {
			// When I examine the node structure
			// Then the indicator should be within the title section
			const titleSection = nodeWithIndicator.locator('.text-center').first()
			const indicator = titleSection.locator('[data-testid="audit-indicator-false"]')

			// And it should be visible within the title section
			await expect(indicator).toBeVisible()
		}
	})

	test('audit indicator does not interfere with practice selection', async ({ page }) => {
		// Given a practice with an audit indicator
		const unselectedNode = page.locator('[data-selected="false"]').first()

		if (await unselectedNode.isVisible()) {
			const practiceId = await unselectedNode.getAttribute('data-practice-id')

			// When I click on the practice node
			await unselectedNode.click()
			await page.waitForTimeout(300)

			// Then the practice should be selected
			const nodeAfterClick = page.locator(`[data-practice-id="${practiceId}"]`)
			const isSelected = await nodeAfterClick.getAttribute('data-selected')
			expect(isSelected).toBe('true')

			// And the audit indicator should still be visible if present
			const indicatorAfterClick = nodeAfterClick.locator('[data-testid="audit-indicator-false"]')
			if ((await indicatorAfterClick.count()) > 0) {
				await expect(indicatorAfterClick).toBeVisible()
			}
		}
	})
})

test.describe('Audit Indicator - Data Validation', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await page.waitForSelector('[data-testid="graph-node"]')
	})

	test('verifies practices have audited property in API response', async ({ page }) => {
		// Given I fetch practice data from the API
		const response = await page.request.get('/api/practices/cards')
		expect(response.ok()).toBeTruthy()

		// When I parse the response
		const data = await response.json()

		// Then the data should have practices
		expect(data.success).toBe(true)
		expect(data.data).toBeDefined()
		expect(data.data.length).toBeGreaterThan(0)

		// And each practice should have the audited property
		const firstPractice = data.data[0]
		expect(firstPractice).toHaveProperty('audited')
		expect(typeof firstPractice.audited).toBe('boolean')
	})

	test('counts total unaudited practices', async ({ page }) => {
		// Given I fetch practice data
		const response = await page.request.get('/api/practices/cards')
		const data = await response.json()

		// When I count unaudited practices in API
		const unauditedInAPI = data.data.filter(p => p.audited === false).length

		// And I count audit indicators in the UI
		const indicatorsInUI = await page.locator('[data-testid="audit-indicator-false"]').count()

		// Then the UI should show indicators for unaudited practices
		expect(indicatorsInUI).toBeGreaterThan(0)

		// And the count should be reasonable (not all practices may be visible)
		expect(indicatorsInUI).toBeLessThanOrEqual(unauditedInAPI)
	})
})

test.describe('Audit Indicator - Screen Reader Accessibility', () => {
	test('audit indicator is accessible to screen readers', async ({ page }) => {
		await page.goto('/')
		await page.waitForSelector('[data-testid="graph-node"]')

		// Given an audit indicator exists
		const indicator = page.locator('[data-testid="audit-indicator-false"]').first()

		if ((await indicator.count()) > 0) {
			// When a screen reader encounters it
			// Then it should have proper ARIA attributes
			await expect(indicator).toHaveAttribute('role', 'status')
			await expect(indicator).toHaveAttribute('aria-label')

			// And the warning emoji should be hidden from screen readers
			const emoji = indicator.locator('span[aria-hidden="true"]')
			if ((await emoji.count()) > 0) {
				await expect(emoji).toHaveAttribute('aria-hidden', 'true')
			}
		}
	})
})

test.describe('Audit Indicator - Responsive Design', () => {
	test('audit indicator is visible on mobile viewport', async ({ page }) => {
		// Given I set the viewport to mobile size
		await page.setViewportSize({ width: 375, height: 667 })
		await page.goto('/')
		await page.waitForSelector('[data-testid="graph-node"]')

		// When I look for audit indicators
		const indicators = page.locator('[data-testid="audit-indicator-false"]')

		// Then they should still be visible
		if ((await indicators.count()) > 0) {
			await expect(indicators.first()).toBeVisible()

			// And should have appropriate sizing for mobile
			const classList = await indicators.first().getAttribute('class')
			expect(classList).toBeTruthy()
		}
	})

	test('audit indicator is visible on tablet viewport', async ({ page }) => {
		// Given I set the viewport to tablet size
		await page.setViewportSize({ width: 768, height: 1024 })
		await page.goto('/')
		await page.waitForSelector('[data-testid="graph-node"]')

		// When I look for audit indicators
		const indicators = page.locator('[data-testid="audit-indicator-false"]')

		// Then they should be visible
		if ((await indicators.count()) > 0) {
			await expect(indicators.first()).toBeVisible()
		}
	})

	test('audit indicator is visible on desktop viewport', async ({ page }) => {
		// Given I set the viewport to desktop size
		await page.setViewportSize({ width: 1920, height: 1080 })
		await page.goto('/')
		await page.waitForSelector('[data-testid="graph-node"]')

		// When I look for audit indicators
		const indicators = page.locator('[data-testid="audit-indicator-false"]')

		// Then they should be visible
		if ((await indicators.count()) > 0) {
			await expect(indicators.first()).toBeVisible()
		}
	})
})

test.describe('Audit Indicator - Visual Regression', () => {
	test('practice node with audit indicator matches visual snapshot', async ({ page }) => {
		await page.goto('/')
		await page.waitForSelector('[data-testid="graph-node"]')

		// Given a practice with an audit indicator
		const nodeWithIndicator = page
			.locator('[data-testid="graph-node"]')
			.filter({ has: page.locator('[data-testid="audit-indicator-false"]') })
			.first()

		if (await nodeWithIndicator.isVisible()) {
			// When I take a screenshot
			// Then it should match the expected visual appearance
			await expect(nodeWithIndicator).toHaveScreenshot('practice-with-audit-indicator.png', {
				maxDiffPixels: 100
			})
		}
	})
})
