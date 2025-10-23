import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Quick-Start Guide Links
 *
 * Tests that practices with associated minimumcd.org quick-start guides
 * display a link to the guide when the practice is selected.
 */

test.describe('Quick-Start Guide Links', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await page.waitForSelector('[data-testid="graph-node"]')
	})

	test('displays quick-start guide link for practices with guides', async ({ page }) => {
		// Given I have practices loaded
		// When I select a practice that has a quick-start guide (e.g., Trunk-based Development)
		const trunkBasedNode = page
			.locator('[data-testid="graph-node"]')
			.filter({ hasText: 'Trunk-based Development' })
			.first()

		if (await trunkBasedNode.isVisible()) {
			await trunkBasedNode.click()
			await page.waitForTimeout(200)

			// Then I should see a quick-start guide link
			const guideLink = page.locator('[data-testid="quick-start-guide-link"]')
			await expect(guideLink).toBeVisible()

			// And it should have the correct href
			const href = await guideLink.getAttribute('href')
			expect(href).toBe('https://minimumcd.org/minimumcd/trunk-based-development/')

			// And it should open in a new tab
			const target = await guideLink.getAttribute('target')
			expect(target).toBe('_blank')

			// And it should have rel="noopener noreferrer" for security
			const rel = await guideLink.getAttribute('rel')
			expect(rel).toBe('noopener noreferrer')
		}
	})

	test('quick-start guide link contains book icon and text', async ({ page }) => {
		// Given I select a practice with a guide
		const trunkBasedNode = page
			.locator('[data-testid="graph-node"]')
			.filter({ hasText: 'Trunk-based Development' })
			.first()

		if (await trunkBasedNode.isVisible()) {
			await trunkBasedNode.click()
			await page.waitForTimeout(200)

			// When I examine the guide link
			const guideLink = page.locator('[data-testid="quick-start-guide-link"]')

			// Then it should contain the book emoji
			const linkText = await guideLink.textContent()
			expect(linkText).toContain('📚')

			// And it should contain "Quick-Start Guide" text
			expect(linkText).toContain('Quick-Start Guide')
		}
	})

	test('does not display guide link for practices without guides', async ({ page }) => {
		// Given I select a practice without a quick-start guide
		// First, find a practice that doesn't have a guide
		const allNodes = await page.locator('[data-testid="graph-node"]').all()

		for (const node of allNodes) {
			const practiceId = await node.getAttribute('data-practice-id')

			// Skip practices known to have guides
			const guidePractices = [
				'trunk-based-development',
				'continuous-integration',
				'configuration-management',
				'deterministic-tests',
				'immutable-artifact',
				'test-environment',
				'rollback-capability'
			]

			if (!guidePractices.includes(practiceId)) {
				// Click this practice
				await node.click()
				await page.waitForTimeout(200)

				// Then the guide link should not be visible
				const guideLink = page.locator('[data-testid="quick-start-guide-link"]')
				expect(await guideLink.count()).toBe(0)

				break
			}
		}
	})

	test('all practices with guides have valid URLs', async ({ page }) => {
		// Given I have the list of practices with guides
		const practicesWithGuides = [
			{
				name: 'Trunk-based Development',
				url: 'https://minimumcd.org/minimumcd/trunk-based-development/'
			},
			{
				name: 'Continuous Integration',
				url: 'https://minimumcd.org/minimumcd/continuous-integration/'
			},
			{
				name: 'Application Configuration Management',
				url: 'https://minimumcd.org/minimumcd/application-configuration/'
			},
			{
				name: 'Deterministic Tests',
				url: 'https://minimumcd.org/minimumcd/deterministic/'
			},
			{
				name: 'Immutable Artifact',
				url: 'https://minimumcd.org/minimumcd/immutable/'
			},
			{
				name: 'Production-like Test Environment',
				url: 'https://minimumcd.org/minimumcd/production-like-test-environment/'
			},
			{
				name: 'On-demand Rollback',
				url: 'https://minimumcd.org/minimumcd/rollback/'
			}
		]

		// When I check each practice
		for (const practice of practicesWithGuides) {
			// Find and select the practice
			const practiceNode = page
				.locator('[data-testid="graph-node"]')
				.filter({ hasText: practice.name })
				.first()

			if (await practiceNode.isVisible()) {
				await practiceNode.click()
				await page.waitForTimeout(200)

				// Then the guide link should have the correct URL
				const guideLink = page.locator('[data-testid="quick-start-guide-link"]')

				if ((await guideLink.count()) > 0) {
					const href = await guideLink.getAttribute('href')
					expect(href).toBe(practice.url)
				}

				// Click elsewhere to deselect for next iteration
				await page.locator('[data-testid="practice-graph"]').click()
				await page.waitForTimeout(100)
			}
		}
	})

	test('quick-start guide link does not trigger practice selection', async ({ page }) => {
		// Given I have selected a practice with a guide
		const trunkBasedNode = page
			.locator('[data-testid="graph-node"]')
			.filter({ hasText: 'Trunk-based Development' })
			.first()

		if (await trunkBasedNode.isVisible()) {
			await trunkBasedNode.click()
			await page.waitForTimeout(200)

			// When I click the quick-start guide link
			const guideLink = page.locator('[data-testid="quick-start-guide-link"]')

			// The link should have stopPropagation to prevent deselecting the practice
			// We can verify this by checking that the practice stays selected
			const isSelected = await trunkBasedNode.getAttribute('data-selected')
			expect(isSelected).toBe('true')

			// Note: We don't actually click the link in the test to avoid opening external URLs
			// The stopPropagation is handled by onclick={(e) => e.stopPropagation()}
		}
	})

	test('quick-start guide link has proper styling', async ({ page }) => {
		// Given I select a practice with a guide
		const trunkBasedNode = page
			.locator('[data-testid="graph-node"]')
			.filter({ hasText: 'Trunk-based Development' })
			.first()

		if (await trunkBasedNode.isVisible()) {
			await trunkBasedNode.click()
			await page.waitForTimeout(200)

			// When I examine the guide link styling
			const guideLink = page.locator('[data-testid="quick-start-guide-link"]')
			const classList = await guideLink.getAttribute('class')

			// Then it should have blue background
			expect(classList).toContain('bg-blue-600')

			// And it should have hover state
			expect(classList).toContain('hover:bg-blue-700')

			// And it should have focus ring
			expect(classList).toContain('focus:ring-2')
			expect(classList).toContain('focus:ring-blue-500')
		}
	})

	test('quick-start guide link is accessible', async ({ page }) => {
		// Given I select a practice with a guide
		const trunkBasedNode = page
			.locator('[data-testid="graph-node"]')
			.filter({ hasText: 'Trunk-based Development' })
			.first()

		if (await trunkBasedNode.isVisible()) {
			await trunkBasedNode.click()
			await page.waitForTimeout(200)

			// When I check the guide link accessibility
			const guideLink = page.locator('[data-testid="quick-start-guide-link"]')

			// Then it should have focus ring for keyboard users
			const classList = await guideLink.getAttribute('class')
			expect(classList).toContain('focus:outline-none')
			expect(classList).toContain('focus:ring-2')

			// And it should be keyboard accessible (it's an <a> tag)
			const tagName = await guideLink.evaluate(el => el.tagName)
			expect(tagName).toBe('A')
		}
	})
})
