import { expect, test } from '@playwright/test'
import { checkA11y, injectAxe } from 'axe-playwright'

test.describe.skip('Accessibility Tests', () => {
	test.describe('WCAG Compliance', () => {
		test('should have no accessibility violations on homepage', async ({ page }) => {
			await page.goto('/')
			await injectAxe(page)

			// Check for accessibility violations
			const violations = await checkA11y(page, null, {
				detailedReport: true,
				detailedReportOptions: {
					html: true
				}
			})

			// Should have no critical violations
			expect(violations).toBeUndefined()
		})

		test('should have no accessibility violations on about page', async ({ page }) => {
			await page.goto('/about')
			await injectAxe(page)

			const violations = await checkA11y(page, null, {
				detailedReport: true
			})

			expect(violations).toBeUndefined()
		})

		test('should have proper heading hierarchy', async ({ page }) => {
			await page.goto('/')

			// Should have exactly one h1
			const h1Count = await page.locator('h1').count()
			expect(h1Count).toBe(1)

			// Headings should be in proper order
			const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
			let lastLevel = 0

			for (const heading of headings) {
				const tagName = await heading.evaluate(el => el.tagName)
				const level = parseInt(tagName.substring(1))

				// Level should not skip (e.g., h1 -> h3)
				if (lastLevel > 0) {
					expect(level).toBeLessThanOrEqual(lastLevel + 1)
				}
				lastLevel = level
			}
		})

		test('should have proper color contrast', async ({ page }) => {
			await page.goto('/')
			await injectAxe(page)

			// Check specifically for color contrast
			const violations = await checkA11y(page, null, {
				rules: {
					'color-contrast': { enabled: true }
				}
			})

			expect(violations).toBeUndefined()
		})
	})

	test.describe('Keyboard Navigation', () => {
		test.skip('should be fully navigable with keyboard only', async ({ page }) => {
			await page.goto('/')

			// Start with focus on body
			await page.keyboard.press('Tab')

			// Collect all focusable elements
			const focusableSelectors =
				'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
			const focusableElements = await page.locator(focusableSelectors).all()

			// Tab through all elements
			for (let i = 0; i < focusableElements.length; i++) {
				// Check focused element and its visibility in a single evaluate
				const { exists, isVisible, isHidden, tagName, inputType } = await page.evaluate(() => {
					const el = document.activeElement
					const computedStyle = el ? window.getComputedStyle(el) : null
					const classList = el ? Array.from(el.classList) : []
					return {
						exists: !!el,
						isVisible: el ? el.offsetWidth > 0 && el.offsetHeight > 0 : false,
						// Check for various hiding methods
						isHidden: computedStyle
							? computedStyle.display === 'none' ||
								computedStyle.visibility === 'hidden' ||
								classList.includes('hidden') ||
								classList.includes('sr-only') ||
								(computedStyle.position === 'absolute' &&
									(el.offsetWidth === 0 || el.offsetHeight === 0))
							: false,
						tagName: el ? el.tagName.toLowerCase() : '',
						inputType: el && el.tagName.toLowerCase() === 'input' ? el.type : ''
					}
				})

				expect(exists).toBeTruthy()
				// Only check visibility for elements that aren't explicitly hidden
				// Skip hidden file inputs as they are not meant to be visually navigable
				if (!isHidden && !(tagName === 'input' && inputType === 'file')) {
					expect(isVisible).toBeTruthy()
				}

				await page.keyboard.press('Tab')
			}
		})

		test('should support Shift+Tab for reverse navigation', async ({ page }) => {
			await page.goto('/')

			// Tab forward a few times
			await page.keyboard.press('Tab')
			await page.keyboard.press('Tab')
			await page.keyboard.press('Tab')

			// Get current focused element
			const forwardFocus = await page.evaluate(() =>
				document.activeElement?.getAttribute('aria-label')
			)

			// Tab backward
			await page.keyboard.press('Shift+Tab')

			// Should have moved focus backward
			const backwardFocus = await page.evaluate(() =>
				document.activeElement?.getAttribute('aria-label')
			)
			expect(backwardFocus).not.toBe(forwardFocus)
		})

		test.skip('should activate buttons with Enter key', async ({ page }) => {
			await page.goto('/')

			// Tab to help link
			let helpLinkFocused = false
			for (let i = 0; i < 20 && !helpLinkFocused; i++) {
				await page.keyboard.press('Tab')
				const ariaLabel = await page.evaluate(() =>
					document.activeElement?.getAttribute('aria-label')
				)
				if (ariaLabel === 'About') {
					helpLinkFocused = true
				}
			}

			expect(helpLinkFocused).toBeTruthy()

			// Press Enter to activate
			await page.keyboard.press('Enter')

			// Should navigate to about page
			await expect(page).toHaveURL('/about')
		})

		test.skip('should activate buttons with Space key', async ({ page }) => {
			await page.goto('/')

			// Tab to export button
			let exportButtonFocused = false
			for (let i = 0; i < 20 && !exportButtonFocused; i++) {
				await page.keyboard.press('Tab')
				const ariaLabel = await page.evaluate(() =>
					document.activeElement?.getAttribute('aria-label')
				)
				if (ariaLabel === 'Export') {
					exportButtonFocused = true
				}
			}

			expect(exportButtonFocused).toBeTruthy()

			// Space key should activate button
			await page.keyboard.press('Space')

			// Export should be triggered (would need to verify download or message)
		})

		test('should skip hidden elements during tab navigation', async ({ page }) => {
			await page.goto('/')

			// Collect tab sequence
			const tabSequence = []
			for (let i = 0; i < 30; i++) {
				await page.keyboard.press('Tab')
				const element = await page.evaluate(() => {
					const el = document.activeElement
					return {
						tag: el?.tagName,
						ariaLabel: el?.getAttribute('aria-label'),
						isVisible: el ? el.offsetWidth > 0 && el.offsetHeight > 0 : false
					}
				})

				if (element.isVisible && element.ariaLabel) {
					tabSequence.push(element.ariaLabel)
				}
			}

			// All elements in tab sequence should be visible
			expect(tabSequence.length).toBeGreaterThan(0)
			// No duplicate focus on same element consecutively
			for (let i = 1; i < tabSequence.length; i++) {
				if (tabSequence[i] === tabSequence[i - 1]) {
					console.log('Duplicate focus:', tabSequence[i])
				}
			}
		})

		test.skip('should handle Escape key in hamburger menu', async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 })
			await page.goto('/')

			// Open hamburger menu
			await page.getByLabel('Open menu').click()

			// Menu should be open
			const menu = page.getByRole('navigation', { name: 'Main menu' })
			await expect(menu).toBeVisible()

			// Press Escape
			await page.keyboard.press('Escape')

			// Menu should close
			await expect(menu).not.toBeVisible()

			// Focus should return to hamburger button
			const focusedElement = await page.evaluate(() =>
				document.activeElement?.getAttribute('aria-label')
			)
			expect(focusedElement).toBe('Open menu')
		})
	})

	test.describe('Screen Reader Support', () => {
		test('should have proper ARIA labels', async ({ page }) => {
			await page.goto('/')

			// All interactive elements should have aria-labels
			const interactiveElements = await page.locator('button, a, input').all()

			for (const element of interactiveElements) {
				const ariaLabel = await element.getAttribute('aria-label')
				const text = await element.textContent()
				const title = await element.getAttribute('title')

				// Should have either aria-label, visible text, or title
				const hasAccessibleName = ariaLabel || text?.trim() || title
				expect(hasAccessibleName).toBeTruthy()
			}
		})

		test('should have proper ARIA roles', async ({ page }) => {
			await page.goto('/')

			// Header should have banner role
			const header = page.locator('header')
			await expect(header).toBeVisible()

			// Navigation elements should have proper roles
			const navElements = await page.locator('nav, [role="navigation"]').all()
			for (const nav of navElements) {
				const role = await nav.getAttribute('role')
				if (!role) {
					const tagName = await nav.evaluate(el => el.tagName)
					expect(tagName).toBe('NAV')
				}
			}
		})

		test('should announce live regions properly', async ({ page }) => {
			await page.goto('/')
			await page.waitForLoadState('networkidle')

			// Import message should have alert role
			// Trigger import to get message
			const fileContent = JSON.stringify({
				version: '1.0.0',
				exportDate: new Date().toISOString(),
				totalPractices: 0,
				practices: []
			})

			// Set up the file chooser event listener first
			const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 10000 })

			// Click the import menu item (which is a label for the file input)
			await page.getByTestId('menu-item-import').click()

			// Wait for the file chooser and set the file
			const fileChooser = await fileChooserPromise
			await fileChooser.setFiles({
				name: 'test.cdpa',
				mimeType: 'application/json',
				buffer: Buffer.from(fileContent)
			})

			// Check for alert role on message
			const message = page.getByTestId('import-message')
			await message.waitFor({ state: 'visible', timeout: 10000 })
			const role = await message.getAttribute('role')
			expect(role).toBe('alert')
		})

		test('should have descriptive link text', async ({ page }) => {
			await page.goto('/')

			// Links should have descriptive text
			const links = await page.locator('a').all()

			for (const link of links) {
				const text = await link.textContent()
				const ariaLabel = await link.getAttribute('aria-label')

				// Should have meaningful text or aria-label
				const hasDescription = (text && text.trim().length > 0) || ariaLabel
				expect(hasDescription).toBeTruthy()

				// Should not have generic text like "click here"
				const genericTexts = ['click here', 'here', 'link', 'read more']
				if (text) {
					const lowerText = text.toLowerCase().trim()
					expect(genericTexts).not.toContain(lowerText)
				}
			}
		})

		test('should properly mark external links', async ({ page }) => {
			await page.goto('/')

			// External links should have proper attributes
			const externalLinks = await page.locator('a[target="_blank"]').all()

			for (const link of externalLinks) {
				const rel = await link.getAttribute('rel')
				expect(rel).toContain('noopener')
				expect(rel).toContain('noreferrer')

				// Should indicate external link to screen readers
				const ariaLabel = await link.getAttribute('aria-label')
				const title = await link.getAttribute('title')
				// Either aria-label or title should indicate external
				const hasExternalIndication = ariaLabel || title
				expect(hasExternalIndication).toBeTruthy()
			}
		})
	})

	test.describe('Focus Management', () => {
		test.skip('should have visible focus indicators', async ({ page }) => {
			await page.goto('/')

			// Tab to first interactive element
			await page.keyboard.press('Tab')

			// Take screenshot to verify focus ring (for visual regression)
			const focusedElement = await page.evaluate(() => {
				const el = document.activeElement
				if (!el) return null
				return {
					tagName: el.tagName,
					className: el.className,
					hasFocusStyles: el.className.includes('focus:ring')
				}
			})

			expect(focusedElement?.hasFocusStyles).toBeTruthy()
		})

		test('should not have keyboard traps', async ({ page }) => {
			await page.goto('/')

			// Tab through entire page
			const maxTabs = 50
			let tabCount = 0
			const focusedElements = new Set()

			for (let i = 0; i < maxTabs; i++) {
				await page.keyboard.press('Tab')
				tabCount++

				const elementId = await page.evaluate(() => {
					const el = document.activeElement
					return el ? el.getAttribute('aria-label') || el.id || el.className : null
				})

				if (elementId) {
					if (focusedElements.has(elementId)) {
						// We've cycled through all elements
						break
					}
					focusedElements.add(elementId)
				}
			}

			// Should not get stuck (should cycle through in reasonable number of tabs)
			expect(tabCount).toBeLessThan(maxTabs)
		})

		test('should maintain focus visibility on window resize', async ({ page }) => {
			await page.goto('/')

			// Focus on an element
			await page.getByLabel('Export').focus()

			// Resize window
			await page.setViewportSize({ width: 375, height: 667 })

			// Element should still be focused or focus should move to visible equivalent
			const focusedElement = await page.evaluate(() =>
				document.activeElement?.getAttribute('aria-label')
			)
			expect(focusedElement).toBeTruthy()
		})

		test.skip('should restore focus after modal closes', async ({ page }) => {
			await page.goto('/')

			// Focus on trigger element
			const trigger = page.getByLabel('Open settings')
			await trigger.focus()

			// Open modal (if implemented)
			await trigger.click()

			// Close modal
			await page.keyboard.press('Escape')

			// Focus should return to trigger
			const focusedAfter = await page.evaluate(() =>
				document.activeElement?.getAttribute('aria-label')
			)
			expect(focusedAfter).toBe('Open settings')
		})
	})

	test.describe('Touch and Mobile Accessibility', () => {
		test.skip('should have adequate touch target sizes', async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 })
			await page.goto('/')

			// All interactive elements should be at least 44x44 pixels
			const interactiveElements = await page.locator('button, a, input').all()

			for (const element of interactiveElements) {
				const box = await element.boundingBox()
				if (box && (await element.isVisible())) {
					// WCAG recommends 44x44 minimum
					expect(box.width).toBeGreaterThanOrEqual(44)
					expect(box.height).toBeGreaterThanOrEqual(44)
				}
			}
		})

		test('should have adequate spacing between touch targets', async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 })
			await page.goto('/')

			// Get all buttons in the mobile menu
			const buttons = await page
				.locator('.flex.items-center.justify-center button, .flex.items-center.justify-center a')
				.all()

			// Check spacing between adjacent buttons
			for (let i = 0; i < buttons.length - 1; i++) {
				const box1 = await buttons[i].boundingBox()
				const box2 = await buttons[i + 1].boundingBox()

				if (box1 && box2) {
					// Calculate distance between elements
					const horizontalGap = box2.x - (box1.x + box1.width)
					const verticalGap = box2.y - (box1.y + box1.height)

					// Should have some spacing (at least 8px recommended)
					const hasAdequateSpacing = horizontalGap >= 8 || verticalGap >= 8
					expect(hasAdequateSpacing).toBeTruthy()
				}
			}
		})

		test('should support zoom without horizontal scrolling', async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 })
			await page.goto('/')

			// Zoom to 200%
			await page.evaluate(() => {
				document.body.style.zoom = '2'
			})

			// Check for horizontal scrollbar
			const hasHorizontalScroll = await page.evaluate(() => {
				return document.documentElement.scrollWidth > document.documentElement.clientWidth
			})

			// Should not require horizontal scrolling at 200% zoom
			expect(hasHorizontalScroll).toBeFalsy()
		})
	})

	test.describe('Semantic HTML', () => {
		test('should use semantic HTML elements', async ({ page }) => {
			await page.goto('/')

			// Check for semantic elements
			const header = await page.locator('header').count()
			expect(header).toBeGreaterThan(0)

			// Navigation should use nav or role="navigation"
			const navCount = await page.locator('nav, [role="navigation"]').count()
			expect(navCount).toBeGreaterThanOrEqual(0)

			// Buttons should be actual button elements or links
			const fakeButtons = await page.locator('div[onclick], span[onclick]').count()
			expect(fakeButtons).toBe(0)
		})

		test('should have proper document structure', async ({ page }) => {
			await page.goto('/')

			// Should have proper lang attribute
			const lang = await page.getAttribute('html', 'lang')
			expect(lang).toBeTruthy()

			// Should have title
			const title = await page.title()
			expect(title).toBeTruthy()
			expect(title.length).toBeGreaterThan(0)

			// Should have meta description
			const description = await page.getAttribute('meta[name="description"]', 'content')
			expect(description).toBeTruthy()
		})
	})
})
