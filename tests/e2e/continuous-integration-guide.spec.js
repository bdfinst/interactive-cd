import { test, expect } from '@playwright/test'

/**
 * Focused test to verify Continuous Integration practice displays quick-start guide
 */

test.describe('Continuous Integration Quick-Start Guide', () => {
	test('displays quick-start guide button when Continuous Integration is selected', async ({
		page
	}) => {
		// Navigate to the app
		await page.goto('/')
		await page.waitForSelector('[data-testid="graph-node"]')

		// Find and click the Continuous Integration practice using its practice ID
		const ciNode = page.locator(
			'[data-testid="graph-node"][data-practice-id="continuous-integration"]'
		)

		// Verify the practice exists
		await expect(ciNode).toBeVisible()

		// Get practice ID to verify we're clicking the right one
		const practiceId = await ciNode.getAttribute('data-practice-id')
		console.log('Practice ID:', practiceId)

		// Click to select it
		await ciNode.click()
		await page.waitForTimeout(500)

		// Verify the practice is now selected
		const isSelected = await ciNode.getAttribute('data-selected')
		console.log('Is selected:', isSelected)
		expect(isSelected).toBe('true')

		// Take a screenshot of the selected practice
		await page.screenshot({ path: 'continuous-integration-selected.png', fullPage: true })

		// Look for the quick-start guide button
		const guideLink = page.locator('[data-testid="quick-start-guide-link"]')

		// Log whether it's visible
		const linkCount = await guideLink.count()
		console.log('Quick-start guide link count:', linkCount)

		if (linkCount > 0) {
			const isVisible = await guideLink.isVisible()
			console.log('Quick-start guide link visible:', isVisible)

			if (isVisible) {
				const href = await guideLink.getAttribute('href')
				console.log('Quick-start guide href:', href)
			}
		}

		// Check if the practice has the quickStartGuide in its data
		const response = await page.request.get('/api/practices/cards')
		const data = await response.json()
		const ciPractice = data.data.find(p => p.id === 'continuous-integration')

		console.log('CI Practice data:', JSON.stringify(ciPractice, null, 2))
		console.log('Has quickStartGuide:', !!ciPractice?.quickStartGuide)
		console.log('quickStartGuide value:', ciPractice?.quickStartGuide)

		// Assert that the guide link should be visible
		await expect(guideLink).toBeVisible()

		// Verify the correct URL
		const href = await guideLink.getAttribute('href')
		expect(href).toBe('https://minimumcd.org/minimumcd/continuous-integration/')
	})
})
