import { test, expect } from '@playwright/test'

/**
 * Mobile Font Size Accessibility Tests
 *
 * Validates that all text meets WCAG 2.1 AA minimum font size requirements:
 * - Minimum 11px for all body text
 * - Recommended 12px+ for optimal readability
 *
 * WCAG 2.1 Success Criterion 1.4.4 (Resize text - Level AA)
 * WCAG 2.1 Success Criterion 1.4.12 (Text Spacing - Level AA)
 */

test.describe('Mobile Font Size Accessibility (WCAG 2.1 AA)', () => {
	test.use({ viewport: { width: 375, height: 667 } }) // iPhone SE

	test('all text elements meet 11px minimum font size', async ({ page }) => {
		await page.goto('/')

		// Wait for content to load
		await page.waitForSelector('[data-testid="graph-node"]')

		// Get all text elements
		const textSelectors = [
			'p',
			'span',
			'li',
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'a',
			'button',
			'div'
		]

		const violations = []

		for (const selector of textSelectors) {
			const elements = await page.locator(selector).all()

			for (const element of elements) {
				// Skip elements with no text content
				const textContent = await element.textContent()
				if (!textContent || textContent.trim().length === 0) continue

				// Get computed font size
				const fontSize = await element.evaluate(el => {
					const style = window.getComputedStyle(el)
					return parseFloat(style.fontSize)
				})

				// Check if font size meets minimum
				if (fontSize < 11) {
					const snippet = textContent.trim().slice(0, 30)
					violations.push({
						selector,
						fontSize: `${fontSize}px`,
						text: snippet
					})
				}
			}
		}

		// Report violations
		if (violations.length > 0) {
			console.log('\n❌ Font Size Violations Found:')
			violations.forEach(v => {
				console.log(`  - ${v.selector}: ${v.fontSize} "${v.text}..."`)
			})
		}

		expect(violations.length, 'Font size violations detected').toBe(0)
	})

	test('compact mode GraphNode uses minimum 12px font (text-xs)', async ({ page }) => {
		await page.goto('/')

		// Expand tree to trigger compact mode
		const expandButton = page.locator('[data-testid="toggle-full-tree"]')
		await expandButton.click()

		// Wait for tree expansion and animation
		await page.waitForTimeout(1000)

		// Find first selected compact card
		const selectedCard = page.locator('[data-testid="graph-node"][data-selected="true"]').first()
		await expect(selectedCard).toBeVisible()

		// Check description text (should be text-xs = 12px in compact mode)
		const descriptionText = selectedCard.locator('p.text-xs').first()
		if ((await descriptionText.count()) > 0) {
			const fontSize = await descriptionText.evaluate(el =>
				parseFloat(window.getComputedStyle(el).fontSize)
			)
			expect(fontSize, 'Description text in compact mode').toBeGreaterThanOrEqual(12)
		}

		// Check Requirements heading (should be text-xs = 12px in compact mode)
		const requirementsHeading = selectedCard.locator('h4.text-xs').first()
		if ((await requirementsHeading.count()) > 0) {
			const fontSize = await requirementsHeading.evaluate(el =>
				parseFloat(window.getComputedStyle(el).fontSize)
			)
			expect(fontSize, 'Requirements heading in compact mode').toBeGreaterThanOrEqual(12)
		}

		// Check Benefits heading (should be text-xs = 12px in compact mode)
		const benefitsHeading = selectedCard.locator('h4.text-xs').nth(1)
		if ((await benefitsHeading.count()) > 0) {
			const fontSize = await benefitsHeading.evaluate(el =>
				parseFloat(window.getComputedStyle(el).fontSize)
			)
			expect(fontSize, 'Benefits heading in compact mode').toBeGreaterThanOrEqual(12)
		}
	})

	test('normal mode GraphNode uses 14px+ font (text-sm)', async ({ page }) => {
		await page.goto('/')

		// Wait for initial load
		await page.waitForSelector('[data-testid="graph-node"]')

		// Find first selected card (should be in normal mode)
		const selectedCard = page.locator('[data-testid="graph-node"][data-selected="true"]').first()
		await expect(selectedCard).toBeVisible()

		// Check description text (should be text-sm = 14px in normal mode)
		const descriptionText = selectedCard.locator('p.text-sm').first()
		if ((await descriptionText.count()) > 0) {
			const fontSize = await descriptionText.evaluate(el =>
				parseFloat(window.getComputedStyle(el).fontSize)
			)
			expect(fontSize, 'Description text in normal mode').toBeGreaterThanOrEqual(14)
		}
	})

	test('dependency count text is readable (minimum 12px)', async ({ page }) => {
		await page.goto('/')

		// Find unselected cards with dependency counts
		const unselectedCards = page.locator('[data-testid="graph-node"][data-selected="false"]')

		const firstCard = unselectedCards.first()
		await expect(firstCard).toBeVisible()

		// Check if dependency count text exists
		const dependencyText = firstCard.locator('div.text-xs, div.text-sm')
		if ((await dependencyText.count()) > 0) {
			const fontSize = await dependencyText
				.first()
				.evaluate(el => parseFloat(window.getComputedStyle(el).fontSize))
			expect(fontSize, 'Dependency count text').toBeGreaterThanOrEqual(12)
		}
	})

	test('no usage of text-[0.45rem] or text-[0.5rem] arbitrary values', async ({ page }) => {
		await page.goto('/')

		// Check the entire page for these classes in the DOM
		const violationClasses = ['text-[0.45rem]', 'text-[0.5rem]']

		for (const className of violationClasses) {
			const elements = await page.locator(`[class*="${className}"]`).count()
			expect(elements, `Found elements with ${className} class`).toBe(0)
		}
	})

	test('header text is readable on mobile', async ({ page }) => {
		await page.goto('/')

		const header = page.locator('header').first()
		await expect(header).toBeVisible()

		// Check title text
		const title = header.locator('h1').first()
		const titleFontSize = await title.evaluate(el =>
			parseFloat(window.getComputedStyle(el).fontSize)
		)

		// Title should be at least 18px (text-title-sm custom property)
		expect(titleFontSize, 'Header title font size').toBeGreaterThanOrEqual(18)
	})

	test('category legend text is readable', async ({ page }) => {
		await page.goto('/')

		// Find legend items
		const legendItems = page.locator('[class*="category"]')
		if ((await legendItems.count()) > 0) {
			const firstItem = legendItems.first()
			const fontSize = await firstItem.evaluate(el =>
				parseFloat(window.getComputedStyle(el).fontSize)
			)

			// Legend should use at least text-xs (12px)
			expect(fontSize, 'Category legend font size').toBeGreaterThanOrEqual(12)
		}
	})

	test('button text is readable (minimum 12px)', async ({ page }) => {
		await page.goto('/')

		const buttons = await page.locator('button').all()

		for (const button of buttons) {
			const textContent = await button.textContent()
			if (!textContent || textContent.trim().length === 0) continue

			const fontSize = await button.evaluate(el => {
				// Get the computed font size of the button or its child elements
				const style = window.getComputedStyle(el)
				return parseFloat(style.fontSize)
			})

			const snippet = textContent.trim().slice(0, 20)
			expect(fontSize, `Button "${snippet}" font size`).toBeGreaterThanOrEqual(12)
		}
	})

	test('mobile viewport scales text appropriately', async ({ page }) => {
		// Test multiple mobile viewport sizes
		const viewports = [
			{ width: 320, height: 568, name: 'iPhone SE (1st gen)' },
			{ width: 375, height: 667, name: 'iPhone SE' },
			{ width: 390, height: 844, name: 'iPhone 13' },
			{ width: 428, height: 926, name: 'iPhone 13 Pro Max' }
		]

		for (const viewport of viewports) {
			await page.setViewportSize({ width: viewport.width, height: viewport.height })
			await page.goto('/')

			// Wait for layout
			await page.waitForSelector('[data-testid="graph-node"]')

			// Check that text is still readable at smallest viewport
			const selectedCard = page.locator('[data-testid="graph-node"][data-selected="true"]').first()
			const description = selectedCard.locator('p').first()

			if ((await description.count()) > 0) {
				const fontSize = await description.evaluate(el =>
					parseFloat(window.getComputedStyle(el).fontSize)
				)

				expect(
					fontSize,
					`Font size at ${viewport.name} (${viewport.width}px)`
				).toBeGreaterThanOrEqual(12)
			}
		}
	})
})
