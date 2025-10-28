import { test, expect } from '@playwright/test'

test.describe('Collapsible Sidebar Menu', () => {
	test.describe('Desktop View (≥1024px)', () => {
		test.beforeEach(async ({ page }) => {
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')
			await page.waitForLoadState('networkidle')
		})

		test('menu should be visible and expanded by default on desktop', async ({ page }) => {
			// Menu should be visible
			const menu = page.getByTestId('menu-content')
			await expect(menu).toBeVisible()

			// Menu should be expanded (256px width)
			const menuBox = await menu.boundingBox()
			expect(menuBox?.width).toBe(256) // w-64 = 16rem = 256px

			// Labels should be visible
			await expect(page.getByText('Home')).toBeVisible()
			await expect(page.getByText('Help')).toBeVisible()
			await expect(page.getByText('Export')).toBeVisible()
			await expect(page.getByText('Import')).toBeVisible()
			await expect(page.getByText('View on GitHub')).toBeVisible()

			// Icons should also be visible
			const menuItems = await page.locator('[data-testid^="menu-item-"]').all()
			expect(menuItems.length).toBeGreaterThan(0)
		})

		test('content area should have correct left margin when menu is expanded', async ({ page }) => {
			// Check main content area margin
			const mainContent = page.locator('.lg\\:ml-64')
			await expect(mainContent).toBeVisible()

			// Verify the margin is applied
			const marginLeft = await mainContent.evaluate(el => window.getComputedStyle(el).marginLeft)
			expect(marginLeft).toBe('256px') // 16rem = 256px
		})

		test('hamburger button should collapse menu to icons only', async ({ page }) => {
			// Find and click hamburger button
			const hamburger = page.getByLabel(/menu/i)
			await hamburger.click()

			// Menu should still be visible but collapsed
			const menu = page.getByTestId('menu-content')
			await expect(menu).toBeVisible()

			// Menu should be collapsed (64px width)
			await page.waitForTimeout(400) // Wait for transition
			const menuBox = await menu.boundingBox()
			expect(menuBox?.width).toBe(64) // w-16 = 4rem = 64px

			// Labels should be hidden
			await expect(page.getByText('Home')).not.toBeVisible()
			await expect(page.getByText('Help')).not.toBeVisible()

			// Icons should still be visible
			const icons = await page.locator('[data-testid^="menu-icon-"]').all()
			for (const icon of icons) {
				await expect(icon).toBeVisible()
			}
		})

		test('content area should adjust when menu collapses', async ({ page }) => {
			// Click hamburger to collapse
			const hamburger = page.getByLabel(/menu/i)
			await hamburger.click()
			await page.waitForTimeout(400) // Wait for transition

			// Check main content area margin after collapse
			const mainContent = page.locator('main, .min-h-screen')
			const marginLeft = await mainContent.evaluate(el => window.getComputedStyle(el).marginLeft)
			expect(marginLeft).toBe('64px') // 4rem = 64px
		})

		test('clicking hamburger again should expand menu back', async ({ page }) => {
			const hamburger = page.getByLabel(/menu/i)

			// Collapse
			await hamburger.click()
			await page.waitForTimeout(400)

			// Expand again
			await hamburger.click()
			await page.waitForTimeout(400)

			// Menu should be expanded again
			const menu = page.getByTestId('menu-content')
			const menuBox = await menu.boundingBox()
			expect(menuBox?.width).toBe(256)

			// Labels should be visible again
			await expect(page.getByText('Home')).toBeVisible()
			await expect(page.getByText('Help')).toBeVisible()
		})

		test('menu transitions should be smooth', async ({ page }) => {
			const menu = page.getByTestId('menu-content')

			// Check for transition classes
			const hasTransition = await menu.evaluate(el => {
				const styles = window.getComputedStyle(el)
				return styles.transition.includes('300ms') || styles.transition.includes('0.3s')
			})
			expect(hasTransition).toBe(true)
		})

		test('menu should never hide completely on desktop', async ({ page }) => {
			const menu = page.getByTestId('menu-content')

			// Toggle multiple times
			const hamburger = page.getByLabel(/menu/i)
			await hamburger.click()
			await expect(menu).toBeVisible()

			await hamburger.click()
			await expect(menu).toBeVisible()

			await hamburger.click()
			await expect(menu).toBeVisible()
		})
	})

	test.describe('Mobile View (<1024px)', () => {
		test.beforeEach(async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 })
			await page.goto('/')
			await page.waitForLoadState('networkidle')
		})

		test('menu should be visible and collapsed by default on mobile', async ({ page }) => {
			// Menu should be visible
			const menu = page.getByTestId('menu-content')
			await expect(menu).toBeVisible()

			// Menu should be collapsed (64px width)
			const menuBox = await menu.boundingBox()
			expect(menuBox?.width).toBe(64) // w-16 = 4rem = 64px

			// Labels should not be visible
			await expect(page.getByText('Home')).not.toBeVisible()
			await expect(page.getByText('Help')).not.toBeVisible()

			// Icons should be visible
			const icons = await page.locator('[data-testid^="menu-icon-"]').all()
			expect(icons.length).toBeGreaterThan(0)
		})

		test('content area should have correct left margin when menu is collapsed', async ({
			page
		}) => {
			// Check main content area margin
			const mainContent = page.locator('main, .min-h-screen')
			const marginLeft = await mainContent.evaluate(el => window.getComputedStyle(el).marginLeft)
			expect(marginLeft).toBe('64px') // 4rem = 64px
		})

		test('hamburger button should expand menu to show labels', async ({ page }) => {
			// Find and click hamburger button
			const hamburger = page.getByLabel(/menu/i)
			await hamburger.click()
			await page.waitForTimeout(400) // Wait for transition

			// Menu should be expanded
			const menu = page.getByTestId('menu-content')
			const menuBox = await menu.boundingBox()
			expect(menuBox?.width).toBe(256) // w-64 = 16rem = 256px

			// Labels should now be visible
			await expect(page.getByText('Home')).toBeVisible()
			await expect(page.getByText('Help')).toBeVisible()
			await expect(page.getByText('Export')).toBeVisible()
			await expect(page.getByText('Import')).toBeVisible()
		})

		test('content area should adjust when menu expands', async ({ page }) => {
			// Click hamburger to expand
			const hamburger = page.getByLabel(/menu/i)
			await hamburger.click()
			await page.waitForTimeout(400) // Wait for transition

			// Check main content area margin after expansion
			const mainContent = page.locator('main, .min-h-screen')
			const marginLeft = await mainContent.evaluate(el => window.getComputedStyle(el).marginLeft)
			expect(marginLeft).toBe('256px') // 16rem = 256px
		})

		test('clicking hamburger again should collapse menu back', async ({ page }) => {
			const hamburger = page.getByLabel(/menu/i)

			// Expand
			await hamburger.click()
			await page.waitForTimeout(400)

			// Collapse again
			await hamburger.click()
			await page.waitForTimeout(400)

			// Menu should be collapsed again
			const menu = page.getByTestId('menu-content')
			const menuBox = await menu.boundingBox()
			expect(menuBox?.width).toBe(64)

			// Labels should be hidden again
			await expect(page.getByText('Home')).not.toBeVisible()
			await expect(page.getByText('Help')).not.toBeVisible()
		})

		test('menu should never hide completely on mobile', async ({ page }) => {
			const menu = page.getByTestId('menu-content')

			// Toggle multiple times
			const hamburger = page.getByLabel(/menu/i)
			await hamburger.click()
			await expect(menu).toBeVisible()

			await hamburger.click()
			await expect(menu).toBeVisible()

			await hamburger.click()
			await expect(menu).toBeVisible()
		})
	})

	test.describe('MenuItem Behavior', () => {
		test('collapsed menu items should show only icons', async ({ page }) => {
			// Test on desktop with collapsed menu
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')

			// Collapse menu
			const hamburger = page.getByLabel(/menu/i)
			await hamburger.click()
			await page.waitForTimeout(400)

			// Check menu items
			const menuItems = await page.locator('[data-testid^="menu-item-"]').all()
			for (const item of menuItems) {
				// Icon should be visible and centered
				const icon = item.locator('[data-testid^="menu-icon-"]')
				await expect(icon).toBeVisible()

				// Label should not be visible
				const label = item.locator('[data-testid^="menu-label-"]')
				await expect(label).not.toBeVisible()
			}
		})

		test('expanded menu items should show icons and labels', async ({ page }) => {
			// Test on desktop with expanded menu (default)
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')

			// Check menu items
			const menuItems = await page.locator('[data-testid^="menu-item-"]').all()
			for (const item of menuItems.slice(0, 3)) {
				// Check first 3 items
				// Both icon and label should be visible
				const icon = item.locator('[data-testid^="menu-icon-"]')
				await expect(icon).toBeVisible()

				const label = item.locator('[data-testid^="menu-label-"]')
				await expect(label).toBeVisible()

				// They should be in a row layout
				const itemBox = await item.boundingBox()
				const iconBox = await icon.boundingBox()
				const labelBox = await label.boundingBox()

				if (itemBox && iconBox && labelBox) {
					// Icon should be to the left of label
					expect(iconBox.x).toBeLessThan(labelBox.x)
					// They should be roughly on the same vertical line
					expect(Math.abs(iconBox.y - labelBox.y)).toBeLessThan(10)
				}
			}
		})

		test('tooltips should appear on hover when menu is collapsed', async ({ page }) => {
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')

			// Collapse menu
			const hamburger = page.getByLabel(/menu/i)
			await hamburger.click()
			await page.waitForTimeout(400)

			// Hover over home icon
			const homeItem = page.getByTestId('menu-item-home')
			await homeItem.hover()

			// Tooltip should appear
			const tooltip = page.getByRole('tooltip', { name: 'Home' })
			await expect(tooltip).toBeVisible()

			// Move mouse away
			await page.mouse.move(500, 500)

			// Tooltip should disappear
			await expect(tooltip).not.toBeVisible()
		})

		test('menu items should be clickable in both states', async ({ page }) => {
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')

			// Test in expanded state
			await page.getByTestId('menu-item-help').click()
			await expect(page).toHaveURL('/help')

			// Go back
			await page.goto('/')

			// Collapse menu
			const hamburger = page.getByLabel(/menu/i)
			await hamburger.click()
			await page.waitForTimeout(400)

			// Test in collapsed state
			await page.getByTestId('menu-item-help').click()
			await expect(page).toHaveURL('/help')
		})
	})

	test.describe('Content Area Behavior', () => {
		test('content should never overlap with menu', async ({ page }) => {
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')

			const menu = page.getByTestId('menu-content')
			const content = page.locator('.min-h-screen')

			// Get bounding boxes
			const menuBox = await menu.boundingBox()
			const contentBox = await content.boundingBox()

			if (menuBox && contentBox) {
				// Content should start where menu ends
				expect(contentBox.x).toBeGreaterThanOrEqual(menuBox.x + menuBox.width)
			}

			// Collapse menu and check again
			const hamburger = page.getByLabel(/menu/i)
			await hamburger.click()
			await page.waitForTimeout(400)

			const menuBoxCollapsed = await menu.boundingBox()
			const contentBoxCollapsed = await content.boundingBox()

			if (menuBoxCollapsed && contentBoxCollapsed) {
				// Content should still not overlap
				expect(contentBoxCollapsed.x).toBeGreaterThanOrEqual(
					menuBoxCollapsed.x + menuBoxCollapsed.width
				)
			}
		})

		test('tree view should appear to the right of menu', async ({ page }) => {
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')

			const menu = page.getByTestId('menu-content')
			const tree = page.getByTestId('tree-view')

			// Get bounding boxes
			const menuBox = await menu.boundingBox()
			const treeBox = await tree.boundingBox()

			if (menuBox && treeBox) {
				// Tree should be to the right of menu
				expect(treeBox.x).toBeGreaterThanOrEqual(menuBox.x + menuBox.width)
			}
		})

		test('no horizontal scrolling should occur', async ({ page }) => {
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')

			// Check for horizontal scroll
			const hasHorizontalScroll = await page.evaluate(() => {
				return document.documentElement.scrollWidth > window.innerWidth
			})
			expect(hasHorizontalScroll).toBe(false)

			// Toggle menu and check again
			const hamburger = page.getByLabel(/menu/i)
			await hamburger.click()
			await page.waitForTimeout(400)

			const hasHorizontalScrollAfterToggle = await page.evaluate(() => {
				return document.documentElement.scrollWidth > window.innerWidth
			})
			expect(hasHorizontalScrollAfterToggle).toBe(false)
		})
	})

	test.describe('Accessibility', () => {
		test('menu should have proper ARIA attributes', async ({ page }) => {
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')

			const menu = page.getByTestId('menu-content')

			// Menu should have navigation role
			await expect(menu).toHaveAttribute('role', 'navigation')

			// Menu should have proper aria-label
			await expect(menu).toHaveAttribute('aria-label', 'Main navigation')

			// Hamburger should have proper aria-expanded
			const hamburger = page.getByLabel(/menu/i)
			await expect(hamburger).toHaveAttribute('aria-expanded', 'false')

			await hamburger.click()
			await expect(hamburger).toHaveAttribute('aria-expanded', 'true')
		})

		test('menu items should have aria-labels', async ({ page }) => {
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')

			// Collapse menu to test aria-labels importance
			const hamburger = page.getByLabel(/menu/i)
			await hamburger.click()
			await page.waitForTimeout(400)

			// Check each menu item has aria-label
			const menuItems = await page.locator('[data-testid^="menu-item-"]').all()
			for (const item of menuItems) {
				const ariaLabel = await item.getAttribute('aria-label')
				expect(ariaLabel).toBeTruthy()
			}
		})

		test('keyboard navigation should work in both states', async ({ page }) => {
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')

			// Test in expanded state
			await page.keyboard.press('Tab')
			await page.keyboard.press('Tab')

			// Should be able to navigate menu items
			const focusedElement = await page.evaluate(() =>
				document.activeElement?.getAttribute('data-testid')
			)
			expect(focusedElement).toContain('menu-item')

			// Collapse menu
			const hamburger = page.getByLabel(/menu/i)
			await hamburger.click()
			await page.waitForTimeout(400)

			// Keyboard navigation should still work
			await page.keyboard.press('Tab')
			const focusedElementCollapsed = await page.evaluate(() =>
				document.activeElement?.getAttribute('data-testid')
			)
			expect(focusedElementCollapsed).toBeTruthy()
		})

		test('screen reader should announce menu state changes', async ({ page }) => {
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')

			const hamburger = page.getByLabel(/menu/i)

			// Check initial state announcement
			const initialLabel = await hamburger.getAttribute('aria-label')
			expect(initialLabel).toContain('Collapse')

			// Toggle and check new state
			await hamburger.click()
			await page.waitForTimeout(400)

			const collapsedLabel = await hamburger.getAttribute('aria-label')
			expect(collapsedLabel).toContain('Expand')
		})

		test('focus should be visible in both states', async ({ page }) => {
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')

			// Focus on a menu item in expanded state
			const helpItem = page.getByTestId('menu-item-help')
			await helpItem.focus()

			// Check for focus ring
			const hasExpandedFocusRing = await helpItem.evaluate(el => {
				const styles = window.getComputedStyle(el)
				return styles.outline !== 'none' || el.classList.contains('focus:ring')
			})
			expect(hasExpandedFocusRing).toBe(true)

			// Collapse and test again
			const hamburger = page.getByLabel(/menu/i)
			await hamburger.click()
			await page.waitForTimeout(400)

			await helpItem.focus()
			const hasCollapsedFocusRing = await helpItem.evaluate(el => {
				const styles = window.getComputedStyle(el)
				return styles.outline !== 'none' || el.classList.contains('focus:ring')
			})
			expect(hasCollapsedFocusRing).toBe(true)
		})
	})

	test.describe('Responsive Behavior', () => {
		test('menu state should persist during viewport resize on desktop', async ({ page }) => {
			// Start with desktop expanded
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')

			// Collapse menu
			const hamburger = page.getByLabel(/menu/i)
			await hamburger.click()
			await page.waitForTimeout(400)

			// Resize to larger desktop
			await page.setViewportSize({ width: 1920, height: 1080 })
			await page.waitForTimeout(100)

			// Menu should still be collapsed
			const menu = page.getByTestId('menu-content')
			const menuBox = await menu.boundingBox()
			expect(menuBox?.width).toBe(64)
		})

		test('transitioning from mobile to desktop should set correct default', async ({ page }) => {
			// Start with mobile (collapsed by default)
			await page.setViewportSize({ width: 375, height: 667 })
			await page.goto('/')

			const menu = page.getByTestId('menu-content')
			let menuBox = await menu.boundingBox()
			expect(menuBox?.width).toBe(64)

			// Resize to desktop
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.waitForTimeout(400)

			// Menu should expand to desktop default
			menuBox = await menu.boundingBox()
			expect(menuBox?.width).toBe(256)
		})

		test('transitioning from desktop to mobile should set correct default', async ({ page }) => {
			// Start with desktop (expanded by default)
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')

			const menu = page.getByTestId('menu-content')
			let menuBox = await menu.boundingBox()
			expect(menuBox?.width).toBe(256)

			// Resize to mobile
			await page.setViewportSize({ width: 375, height: 667 })
			await page.waitForTimeout(400)

			// Menu should collapse to mobile default
			menuBox = await menu.boundingBox()
			expect(menuBox?.width).toBe(64)
		})
	})
})
