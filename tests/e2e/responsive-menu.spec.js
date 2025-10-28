import { test, expect } from '@playwright/test'

test.describe('Responsive Menu Navigation', () => {
	test.describe('Desktop View (1024px+)', () => {
		test.beforeEach(async ({ page }) => {
			// Set desktop viewport
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')
		})

		test('should display full header with all menu items', async ({ page }) => {
			// Logo should be visible
			const logo = page.locator('img[alt="Logo"]')
			await expect(logo).toBeVisible()

			// Title should be centered
			const title = page.locator('h1:has-text("CD Dependency Tree")')
			await expect(title).toBeVisible()

			// All menu buttons should be visible
			await expect(page.getByLabel('Export adoption data')).toBeVisible()
			await expect(page.getByLabel('Import adoption data')).toBeVisible()
			await expect(page.getByLabel('View on GitHub')).toBeVisible()
			await expect(page.getByLabel('Report a bug or request a feature')).toBeVisible()
			await expect(page.getByLabel('MinimumCD.org')).toBeVisible()
			await expect(page.getByLabel('Support this project')).toBeVisible()
			await expect(page.getByLabel('View help and capabilities')).toBeVisible()
		})

		test('should not show hamburger menu on desktop', async ({ page }) => {
			// Hamburger menu should not exist on desktop
			const hamburger = page.getByLabel('Open menu')
			await expect(hamburger).not.toBeVisible()
		})

		test('should navigate to help page when help button is clicked', async ({ page }) => {
			await page.getByLabel('View help and capabilities').click()
			await expect(page).toHaveURL('/help')
		})

		test('should open external links in new tab', async ({ page, context }) => {
			// Listen for new page
			const pagePromise = context.waitForEvent('page')

			// Click GitHub link
			await page.getByLabel('View on GitHub').click()

			// Wait for new tab
			const newPage = await pagePromise
			await newPage.waitForLoadState()

			// Check URL of new tab
			expect(newPage.url()).toContain('github.com')

			await newPage.close()
		})

		test('should show tooltips on hover', async ({ page }) => {
			// Hover over GitHub link
			await page.getByLabel('View on GitHub').hover()

			// Tooltip should appear
			const tooltip = page.locator('text=View on GitHub').nth(1)
			await expect(tooltip).toBeVisible()

			// Move mouse away
			await page.mouse.move(0, 0)

			// Tooltip should disappear
			await expect(tooltip).not.toBeVisible()
		})
	})

	test.describe('Tablet View (768px-1023px)', () => {
		test.beforeEach(async ({ page }) => {
			// Set tablet viewport
			await page.setViewportSize({ width: 768, height: 1024 })
			await page.goto('/')
		})

		test('should display mobile layout without logo', async ({ page }) => {
			// Logo should not be visible on tablet
			const logo = page.locator('img[alt="Logo"]')
			await expect(logo).not.toBeVisible()

			// Title should still be visible
			const title = page.locator('h1:has-text("CD Dependency Tree")')
			await expect(title).toBeVisible()

			// Menu items should be in mobile layout
			await expect(page.getByTestId('export-button-mobile')).toBeVisible()
			await expect(page.getByTestId('import-button-mobile')).toBeVisible()
		})

		test('should have proper touch targets', async ({ page }) => {
			// Get all interactive elements
			const buttons = await page.locator('button, a').all()

			for (const button of buttons) {
				const box = await button.boundingBox()
				if (box) {
					// Touch targets should be at least 44x44 pixels
					expect(box.height).toBeGreaterThanOrEqual(44)
					expect(box.width).toBeGreaterThanOrEqual(44)
				}
			}
		})
	})

	test.describe('Mobile View (320px-767px)', () => {
		test.beforeEach(async ({ page }) => {
			// Set mobile viewport
			await page.setViewportSize({ width: 375, height: 667 })
			await page.goto('/')
		})

		test('should display compact mobile header', async ({ page }) => {
			// No logo on mobile
			const logo = page.locator('img[alt="Logo"]')
			await expect(logo).not.toBeVisible()

			// Title should be visible but smaller
			const title = page.locator('h1:has-text("CD Dependency Tree")')
			await expect(title).toBeVisible()

			// Version badge should be visible
			const version = page.locator('text=/v\\d+\\.\\d+\\.\\d+/')
			await expect(version).toBeVisible()
		})

		test('should have mobile-specific buttons', async ({ page }) => {
			// Mobile export button
			await expect(page.getByTestId('export-button-mobile')).toBeVisible()

			// Mobile import button
			await expect(page.getByTestId('import-button-mobile')).toBeVisible()

			// Desktop buttons should not be visible
			await expect(page.getByTestId('export-button')).not.toBeVisible()
			await expect(page.getByTestId('import-button')).not.toBeVisible()
		})

		test('should wrap menu items on very small screens', async ({ page }) => {
			// Set very small viewport
			await page.setViewportSize({ width: 320, height: 568 })

			// Menu should still be functional
			const menuContainer = page.locator('.flex.items-center.justify-center.flex-wrap')
			await expect(menuContainer).toBeVisible()

			// All essential buttons should still be accessible
			const essentialButtons = [
				page.getByTestId('export-button-mobile'),
				page.getByTestId('import-button-mobile'),
				page.getByLabel('View on GitHub')
			]

			for (const button of essentialButtons) {
				await expect(button).toBeVisible()
			}
		})

		test('should handle touch interactions', async ({ page }) => {
			// Simulate touch on export button
			await page.getByTestId('export-button-mobile').tap()

			// Should trigger export (check for download or message)
			// Note: Actual export behavior would need to be verified
		})
	})

	test.describe('Hamburger Menu Behavior (if implemented)', () => {
		test.skip('should show hamburger menu on mobile', async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 })
			await page.goto('/')

			// Hamburger button should be visible
			const hamburger = page.getByLabel('Open menu')
			await expect(hamburger).toBeVisible()
		})

		test.skip('should toggle menu on hamburger click', async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 })
			await page.goto('/')

			const hamburger = page.getByLabel('Open menu')
			const menu = page.getByRole('navigation', { name: 'Main menu' })

			// Menu should be initially closed
			await expect(menu).not.toBeVisible()

			// Click hamburger to open
			await hamburger.click()
			await expect(menu).toBeVisible()

			// Click again to close
			await hamburger.click()
			await expect(menu).not.toBeVisible()
		})

		test.skip('should close menu when clicking outside', async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 })
			await page.goto('/')

			const hamburger = page.getByLabel('Open menu')
			const menu = page.getByRole('navigation', { name: 'Main menu' })

			// Open menu
			await hamburger.click()
			await expect(menu).toBeVisible()

			// Click outside
			await page.click('body', { position: { x: 10, y: 200 } })

			// Menu should close
			await expect(menu).not.toBeVisible()
		})

		test.skip('should close menu when navigating', async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 })
			await page.goto('/')

			const hamburger = page.getByLabel('Open menu')
			const menu = page.getByRole('navigation', { name: 'Main menu' })

			// Open menu
			await hamburger.click()
			await expect(menu).toBeVisible()

			// Click help link
			await page.getByRole('link', { name: 'Help' }).click()

			// Should navigate and close menu
			await expect(page).toHaveURL('/help')
			await expect(menu).not.toBeVisible()
		})
	})

	test.describe('Responsive Behavior on Resize', () => {
		test('should adapt layout when resizing from desktop to mobile', async ({ page }) => {
			// Start with desktop
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')

			// Logo should be visible on desktop
			await expect(page.locator('img[alt="Logo"]')).toBeVisible()

			// Resize to mobile
			await page.setViewportSize({ width: 375, height: 667 })

			// Logo should disappear
			await expect(page.locator('img[alt="Logo"]')).not.toBeVisible()

			// Mobile buttons should appear
			await expect(page.getByTestId('export-button-mobile')).toBeVisible()
		})

		test('should adapt layout when resizing from mobile to desktop', async ({ page }) => {
			// Start with mobile
			await page.setViewportSize({ width: 375, height: 667 })
			await page.goto('/')

			// Mobile buttons should be visible
			await expect(page.getByTestId('export-button-mobile')).toBeVisible()

			// Resize to desktop
			await page.setViewportSize({ width: 1440, height: 900 })

			// Desktop layout should appear
			await expect(page.locator('img[alt="Logo"]')).toBeVisible()

			// Mobile buttons should disappear
			await expect(page.getByTestId('export-button-mobile')).not.toBeVisible()

			// Desktop buttons should appear
			await expect(page.getByTestId('export-button')).toBeVisible()
		})
	})

	test.describe('Import/Export Functionality', () => {
		test('should handle file import on mobile', async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 })
			await page.goto('/')

			// Create a test file
			const fileContent = JSON.stringify({
				version: '1.0.0',
				exportDate: new Date().toISOString(),
				practices: ['practice-1', 'practice-2']
			})

			// Set up file chooser
			const fileChooserPromise = page.waitForEvent('filechooser')

			// Click import button
			await page.getByTestId('import-button-mobile').click()

			// Handle file chooser
			const fileChooser = await fileChooserPromise
			await fileChooser.setFiles({
				name: 'test-adoption.cdpa',
				mimeType: 'application/json',
				buffer: Buffer.from(fileContent)
			})

			// Check for success message
			const message = page.getByTestId('import-message')
			await expect(message).toBeVisible()
			await expect(message).toContainText(/imported/i)
		})

		test('should handle export on desktop', async ({ page }) => {
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')

			// Set up download promise
			const downloadPromise = page.waitForEvent('download')

			// Click export button
			await page.getByTestId('export-button').click()

			// Wait for download
			const download = await downloadPromise

			// Verify download
			expect(download.suggestedFilename()).toContain('.cdpa')
		})
	})

	test.describe('Accessibility', () => {
		test('should be keyboard navigable on desktop', async ({ page }) => {
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')

			// Tab through all interactive elements
			await page.keyboard.press('Tab')

			// First focusable element should be logo/home link
			const firstFocused = await page.evaluate(() =>
				document.activeElement?.getAttribute('aria-label')
			)
			expect(firstFocused).toBeTruthy()

			// Continue tabbing through all elements
			const focusableElements = []
			for (let i = 0; i < 20; i++) {
				await page.keyboard.press('Tab')
				const label = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
				if (label && !focusableElements.includes(label)) {
					focusableElements.push(label)
				}
			}

			// Should have multiple focusable elements
			expect(focusableElements.length).toBeGreaterThan(5)
		})

		test('should support screen readers', async ({ page }) => {
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')

			// Check for ARIA attributes
			const header = page.locator('header')
			await expect(header).toBeVisible()

			// All interactive elements should have aria-labels
			const interactiveElements = await page.locator('button, a').all()
			for (const element of interactiveElements) {
				const ariaLabel = await element.getAttribute('aria-label')
				if (await element.isVisible()) {
					expect(ariaLabel).toBeTruthy()
				}
			}
		})

		test('should have proper focus indicators', async ({ page }) => {
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')

			// Focus on export button
			await page.getByLabel('Export adoption data').focus()

			// Check for focus ring (would need visual regression testing for full verification)
			const focusedElement = page.getByLabel('Export adoption data')
			const className = await focusedElement.getAttribute('class')
			expect(className).toContain('focus:ring')
		})

		test.skip('should trap focus in hamburger menu when open', async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 })
			await page.goto('/')

			// Open hamburger menu
			await page.getByLabel('Open menu').click()

			// Tab through menu items
			await page.keyboard.press('Tab')
			await page.keyboard.press('Tab')
			await page.keyboard.press('Tab')

			// Focus should stay within menu
			const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
			expect(focusedElement).toBeTruthy()

			// Escape should close menu
			await page.keyboard.press('Escape')
			const menu = page.getByRole('navigation', { name: 'Main menu' })
			await expect(menu).not.toBeVisible()
		})
	})
})
