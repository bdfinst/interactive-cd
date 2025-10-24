import { test, expect } from '@playwright/test'

test.describe('External Link Icons on Initial Load', () => {
	test('displays external link icons for unselected dependency cards with quickstart guides', async ({
		page
	}) => {
		// Navigate to the root page
		await page.goto('/')

		// Wait for the page to load
		await page.waitForSelector('[data-testid="graph-node"]')

		// Define the dependency practices that have quickStartGuide on initial load
		const practicesWithGuides = [
			{
				id: 'configuration-management',
				name: 'Application Configuration Management'
			},
			{
				id: 'continuous-integration',
				name: 'Continuous Integration'
			},
			{
				id: 'immutable-artifact',
				name: 'Immutable Artifact'
			},
			{
				id: 'on-demand-rollback',
				name: 'On-demand Rollback'
			},
			{
				id: 'test-environment',
				name: 'Production-like Test Environment'
			}
		]

		// Check each practice with a quickstart guide
		for (const practice of practicesWithGuides) {
			// Find the unselected practice card
			const practiceCard = page.locator(
				`[data-testid="graph-node"][data-practice-id="${practice.id}"][data-selected="false"]`
			)

			// Verify the card exists and is visible
			await expect(practiceCard).toBeVisible()

			// Verify the external link icon is visible within the card
			const externalLinkIcon = practiceCard.locator('svg')

			await expect(externalLinkIcon).toBeVisible()

			console.log(
				`✓ External link icon displayed for unselected card: ${practice.name} (${practice.id})`
			)
		}
	})

	test('does not display external link icon for root practice without quickstart guide', async ({
		page
	}) => {
		// Navigate to the root page
		await page.goto('/')

		// Wait for the page to load
		await page.waitForSelector('[data-testid="graph-node"]')

		// Find the selected root practice (Continuous Delivery)
		const rootCard = page.locator(
			'[data-testid="graph-node"][data-practice-id="continuous-delivery"][data-selected="true"]'
		)

		// Verify the root card is selected
		await expect(rootCard).toBeVisible()

		// Verify the root card does NOT have a "More Info" button (no quickStartGuide)
		const moreInfoButton = rootCard.locator('[data-testid="quick-start-guide-link"]')
		await expect(moreInfoButton).not.toBeVisible()

		console.log('✓ No external link icon/button for Continuous Delivery (no quickStartGuide)')
	})

	test('displays external link icons for all visible dependency cards with guides', async ({
		page
	}) => {
		// Navigate to the root page
		await page.goto('/')

		// Wait for the page to load
		await page.waitForSelector('[data-testid="graph-node"]')

		// Get all unselected cards
		const unselectedCards = page.locator('[data-testid="graph-node"][data-selected="false"]')
		const count = await unselectedCards.count()

		console.log(`Total unselected cards on initial load: ${count}`)

		// Count how many unselected cards have external link icons
		let cardsWithIcons = 0

		for (let i = 0; i < count; i++) {
			const card = unselectedCards.nth(i)
			const practiceId = await card.getAttribute('data-practice-id')

			// Check if this card has an external link icon (SVG)
			const icon = card.locator('svg')
			const hasIcon = (await icon.count()) > 0

			if (hasIcon) {
				cardsWithIcons++
				console.log(`  ✓ Card with icon: ${practiceId}`)
			} else {
				console.log(`  - Card without icon: ${practiceId}`)
			}
		}

		console.log(`Cards with external link icons: ${cardsWithIcons}`)

		// We expect exactly 5 cards with icons (the ones with quickStartGuide)
		expect(cardsWithIcons).toBe(5)
	})

	test('external link icon is positioned in upper right corner and styled correctly in unselected cards', async ({
		page
	}) => {
		// Navigate to the root page
		await page.goto('/')

		// Wait for the page to load
		await page.waitForSelector('[data-testid="graph-node"]')

		// Check one specific card (Continuous Integration)
		const ciCard = page.locator(
			'[data-testid="graph-node"][data-practice-id="continuous-integration"][data-selected="false"]'
		)

		await expect(ciCard).toBeVisible()

		// Find the icon container in upper right corner
		const iconContainer = ciCard.locator('div.absolute.top-3.right-3.text-blue-600')
		await expect(iconContainer).toBeVisible()

		// Check that it has the correct CSS classes
		const classes = await iconContainer.getAttribute('class')
		expect(classes).toContain('absolute')
		expect(classes).toContain('top-3')
		expect(classes).toContain('right-3')
		expect(classes).toContain('text-blue-600')

		console.log('✓ External link icon is positioned in upper right corner and styled correctly')
	})
})
