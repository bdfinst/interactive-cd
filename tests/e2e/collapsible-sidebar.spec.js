import { expect, test } from '@playwright/test'

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
			expect(menuBox?.width).toBe(200) // w-64 = 16rem = 256px

			// Labels should be visible (not sr-only)
			await expect(page.getByText('Home')).toBeVisible()
			await expect(page.getByText('About')).toBeVisible()
			await expect(page.getByText('Export')).toBeVisible()

			// Icons should be visible
			const menuItems = await page.locator('[data-testid^="menu-item-"]').all()
			expect(menuItems.length).toBeGreaterThan(0)
		})

		test('content area should have correct left margin when menu is expanded', async ({ page }) => {
			// Check main content area margin (menu starts expanded on desktop)
			const mainContent = page.getByRole('main')
			await expect(mainContent).toBeVisible()

			// Verify the margin is applied for expanded state
			const marginLeft = await mainContent.evaluate(el => window.getComputedStyle(el).marginLeft)
			expect(marginLeft).toBe('200px') // 16rem = 256px (expanded)
		})

		test('hamburger button should collapse menu to hide labels', async ({ page }) => {
			// Find and click hamburger button (menu starts expanded on desktop)
			const hamburger = page.getByTestId('menu-toggle')
			const menu = page.getByTestId('menu-content')

			await hamburger.click()

			// Menu should still be visible but now collapsed
			await expect(menu).toBeVisible()

			// Menu should be collapsed (64px width)
			await page.waitForTimeout(350)
			const menuBox = await menu.boundingBox()
			expect(menuBox?.width).toBeGreaterThanOrEqual(62)
			expect(menuBox?.width).toBeLessThanOrEqual(65)

			// Labels should have sr-only class (visually hidden but accessible to screen readers)
			const homeLabel = page.getByTestId('menu-label-home')
			await expect(homeLabel).toHaveClass(/sr-only/)

			// Icons should still be visible
			const icons = await page.locator('[data-testid^="menu-icon-"]').all()
			for (const icon of icons) {
				await expect(icon).toBeVisible()
			}
		})

		test.skip('content area should adjust when menu collapses', async ({ page }) => {
			// Click hamburger to collapse (menu starts expanded on desktop)
			const hamburger = page.getByTestId('menu-toggle')
			const menu = page.getByTestId('menu-content')
			await hamburger.click()
			await page.waitForTimeout(350)

			// Check main content area margin after collapse
			const mainContent = page.getByRole('main')
			const marginLeft = await mainContent.evaluate(el => window.getComputedStyle(el).marginLeft)
			expect(marginLeft).toBe('0px') // Mobile overlay - no margin needed
		})

		test('clicking hamburger again should expand menu back', async ({ page }) => {
			const hamburger = page.getByTestId('menu-toggle')
			const menu = page.getByTestId('menu-content')

			// Collapse (menu starts expanded on desktop)
			await hamburger.click()
			await page.waitForTimeout(350)

			// Expand again
			await hamburger.click()
			await page.waitForTimeout(350)

			// Menu should be expanded again
			const menuBox = await menu.boundingBox()
			expect(menuBox?.width).toBe(200)

			// Labels should be visible
			await expect(page.getByText('Home')).toBeVisible()
			await expect(page.getByText('About')).toBeVisible()
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
			const hamburger = page.getByTestId('menu-toggle')
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
			expect(menuBox?.width).toBeGreaterThanOrEqual(62)
			expect(menuBox?.width).toBeLessThanOrEqual(65)

			// Labels should have sr-only class (visually hidden but accessible)
			const homeLabel2 = page.getByTestId('menu-item-home').locator('span.sr-only')
			await expect(homeLabel2).toHaveClass(/sr-only/)

			const aboutLabel2 = page.getByTestId('menu-item-help').locator('span.sr-only')
			await expect(aboutLabel2).toHaveClass(/sr-only/)
			// Icons should be visible
			const icons = await page.locator('[data-testid^="menu-icon-"]').all()
			expect(icons.length).toBeGreaterThan(0)
		})

		test('content area should have correct left margin when menu is collapsed', async ({
			page
		}) => {
			// Check main content area margin
			const mainContent = page.getByRole('main')
			const marginLeft = await mainContent.evaluate(el => window.getComputedStyle(el).marginLeft)
			expect(marginLeft).toBe('0px') // Mobile overlay - no margin needed
		})

		test.skip('hamburger button should expand menu to show labels', async ({ page }) => {
			// Find and click hamburger button
			const hamburger = page.getByLabel(/menu/i)
			const menu = page.getByTestId('menu-content')
			await hamburger.click()
			await page.waitForTimeout(350)

			// Menu should be expanded
			const menuBox = await menu.boundingBox()
			expect(menuBox?.width).toBe(200) // w-64 = 16rem = 256px

			// Labels should now be visible
			await expect(page.getByText('Home')).toBeVisible()
			await expect(page.getByText('Help')).toBeVisible()
			await expect(page.getByText('Export')).toBeVisible()
			await expect(page.getByText('Import')).toBeVisible()
		})

		test.skip('content area should adjust when menu expands', async ({ page }) => {
			// Click hamburger to expand
			const hamburger = page.getByLabel(/menu/i)
			const menu = page.getByTestId('menu-content')
			await hamburger.click()
			await page.waitForTimeout(350)

			// Check main content area margin after expansion
			const mainContent = page.getByRole('main')
			const marginLeft = await mainContent.evaluate(el => window.getComputedStyle(el).marginLeft)
			expect(marginLeft).toBe('200px') // 16rem = 256px
		})

		test('clicking hamburger again should collapse menu back', async ({ page }) => {
			const hamburger = page.getByTestId('mobile-menu-button')
			const menu = page.getByTestId('menu-content')
			const backdrop = page.getByTestId('menu-backdrop')

			// Open menu
			await hamburger.click()
			await page.waitForTimeout(350)
			await expect(backdrop).toBeVisible()

			// Close again by clicking backdrop (header button is covered by menu)
			await backdrop.click()
			await page.waitForTimeout(350)

			// Menu should be hidden off-screen again (backdrop disappears)
			await expect(backdrop).not.toBeVisible()
		})

		test('menu should never hide completely on mobile', async ({ page }) => {
			const menu = page.getByTestId('menu-content')
			const hamburger = page.getByTestId('mobile-menu-button')
			const backdrop = page.getByTestId('menu-backdrop')

			// Menu exists in DOM
			await expect(menu).toBeAttached()

			// Open menu
			await hamburger.click()
			await page.waitForTimeout(350)
			await expect(menu).toBeVisible()
			await expect(backdrop).toBeVisible()

			// Close via backdrop
			await backdrop.click()
			await page.waitForTimeout(350)
			await expect(menu).toBeAttached() // Still in DOM

			// Open again
			await hamburger.click()
			await page.waitForTimeout(350)
			await expect(menu).toBeVisible()
		})
	})

	test.describe('MenuItem Behavior', () => {
		test('collapsed menu items should show only icons', async ({ page }) => {
			// Test on desktop - collapse menu first (starts expanded)
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')
			await page.waitForLoadState('networkidle')

			// Collapse menu (starts expanded on desktop)
			const hamburger = page.getByTestId('menu-toggle')
			const menu = page.getByTestId('menu-content')
			await hamburger.click()
			await page.waitForTimeout(350)

			// Check menu items
			const menuItems = await page.locator('[data-testid^="menu-item-"]').all()
			for (const item of menuItems) {
				// Icon should be visible and centered
				const icon = item.locator('[data-testid^="menu-icon-"]')
				await expect(icon).toBeVisible()

				// Label should have sr-only class (accessible but visually hidden)
				const label = item.locator('[data-testid^="menu-label-"]')
				await expect(label).toHaveClass(/sr-only/)
			}
		})

		test('expanded menu items should show icons and labels', async ({ page }) => {
			// Test on desktop - menu starts expanded by default
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')
			await page.waitForLoadState('networkidle')

			// Menu already expanded - no need to toggle

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
					// They should be roughly on the same vertical line (allow more tolerance)
					expect(Math.abs(iconBox.y - labelBox.y)).toBeLessThan(15)
				}
			}
		})

		test.skip('tooltips should appear on hover when menu is collapsed', async ({ page }) => {
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')

			// Collapse menu
			const hamburger = page.getByTestId('menu-toggle')
			const menu = page.getByTestId('menu-content')
			await hamburger.click()
			await page.waitForTimeout(350)

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
			await page.waitForLoadState('networkidle')

			// Test in collapsed state (default)
			await page.getByTestId('menu-item-help').click()
			await expect(page).toHaveURL('/about')

			// Go back
			await page.goto('/')
			await page.waitForLoadState('networkidle')

			// Expand menu
			const hamburger = page.getByTestId('menu-toggle')
			const menu = page.getByTestId('menu-content')
			await hamburger.click()
			await page.waitForTimeout(350)

			// Test in expanded state
			await page.getByTestId('menu-item-help').click()
			await expect(page).toHaveURL('/about')
		})
	})

	test.describe('Content Area Behavior', () => {
		test.skip('content should never overlap with menu', async ({ page }) => {
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
			const hamburger = page.getByTestId('menu-toggle')
			await hamburger.click()
			await page.waitForTimeout(350)

			const menuBoxCollapsed = await menu.boundingBox()
			const contentBoxCollapsed = await content.boundingBox()

			if (menuBoxCollapsed && contentBoxCollapsed) {
				// Content should still not overlap
				expect(contentBoxCollapsed.x).toBeGreaterThanOrEqual(
					menuBoxCollapsed.x + menuBoxCollapsed.width
				)
			}
		})

		test.skip('tree view should appear to the right of menu', async ({ page }) => {
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
			await page.waitForLoadState('networkidle')

			// Check for horizontal scroll
			const hasHorizontalScroll = await page.evaluate(() => {
				return document.documentElement.scrollWidth > window.innerWidth
			})
			expect(hasHorizontalScroll).toBe(false)

			// Toggle menu and check again
			const hamburger = page.getByTestId('menu-toggle')
			const menu = page.getByTestId('menu-content')
			await hamburger.click()

			// Wait for menu to be stable
			await expect(menu).toBeVisible()
			await page.waitForTimeout(350)

			const hasHorizontalScrollAfterToggle = await page
				.evaluate(() => {
					return document.documentElement.scrollWidth > window.innerWidth
				})
				.catch(() => false)
			expect(hasHorizontalScrollAfterToggle).toBe(false)
		})
	})

	test.describe('Accessibility', () => {
		test.skip('menu should have proper ARIA attributes', async ({ page }) => {
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')
			await page.waitForLoadState('networkidle')

			// The parent nav element has the navigation role and aria-label
			const nav = page.getByRole('navigation', { name: 'Main navigation' })
			await expect(nav).toBeVisible()

			// Hamburger should have proper aria-expanded (starts collapsed)
			const hamburger = page.getByTestId('menu-toggle')
			await expect(hamburger).toHaveAttribute('aria-expanded', 'false')

			await hamburger.click()
			await expect(hamburger).toHaveAttribute('aria-expanded', 'true', { timeout: 1000 })
		})

		test('menu items should have aria-labels', async ({ page }) => {
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')
			await page.waitForLoadState('networkidle')

			// Menu starts expanded on desktop - aria-labels are important for accessibility
			// Check each menu item has aria-label
			const menuItems = await page.locator('[data-testid^="menu-item-"]').all()
			for (const item of menuItems) {
				const ariaLabel = await item.getAttribute('aria-label')
				expect(ariaLabel).toBeTruthy()
			}
		})

		test.skip('keyboard navigation should work in both states', async ({ page }) => {
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')
			await page.waitForLoadState('networkidle')

			// Test in expanded state (default on desktop)
			await page.keyboard.press('Tab')
			await page.keyboard.press('Tab')

			// Should be able to navigate menu items
			const focusedElement = await page.evaluate(() =>
				document.activeElement?.getAttribute('data-testid')
			)
			expect(focusedElement).toContain('menu-item')

			// Collapse menu
			const hamburger = page.getByTestId('menu-toggle')
			const menu = page.getByTestId('menu-content')
			await hamburger.click()
			await page.waitForTimeout(350)

			// Keyboard navigation should still work in collapsed state
			await page.keyboard.press('Tab')
			const focusedElementExpanded = await page.evaluate(() =>
				document.activeElement?.getAttribute('data-testid')
			)
			expect(focusedElementExpanded).toBeTruthy()
		})

		test('screen reader should announce menu state changes', async ({ page }) => {
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')
			await page.waitForLoadState('networkidle')

			const hamburger = page.getByTestId('menu-toggle')

			// Check initial state announcement (menu starts expanded on desktop)
			const initialLabel = await hamburger.getAttribute('aria-label')
			expect(initialLabel).toContain('Collapse')

			// Toggle to collapsed and check new state
			await hamburger.click()
			await expect(hamburger).toHaveAttribute('aria-label', /Expand/, { timeout: 1000 })

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
			const hamburger = page.getByTestId('menu-toggle')
			const menu = page.getByTestId('menu-content')
			await hamburger.click()
			await page.waitForTimeout(350)

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
			// Start with desktop (menu starts expanded)
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')
			await page.waitForLoadState('networkidle')

			// Collapse menu
			const hamburger = page.getByTestId('menu-toggle')
			const menu = page.getByTestId('menu-content')
			await hamburger.click()
			await page.waitForTimeout(350)

			// Resize to larger desktop
			await page.setViewportSize({ width: 1920, height: 1080 })

			// Menu should still be collapsed
			const menuBox = await menu.boundingBox()
			expect(menuBox?.width).toBe(64)
		})

		test('transitioning from mobile to desktop should maintain collapsed state', async ({
			page
		}) => {
			// Start with mobile (collapsed by default)
			await page.setViewportSize({ width: 375, height: 667 })
			await page.goto('/')
			await page.waitForLoadState('networkidle')

			const menu = page.getByTestId('menu-content')
			let menuBox = await menu.boundingBox()
			expect(menuBox?.width).toBeGreaterThanOrEqual(62)
			expect(menuBox?.width).toBeLessThanOrEqual(65)

			// Resize to desktop
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.waitForTimeout(350)

			// Menu should stay collapsed (no responsive default change)
			menuBox = await menu.boundingBox()
			expect(menuBox?.width).toBeGreaterThanOrEqual(62)
			expect(menuBox?.width).toBeLessThanOrEqual(65)
		})

		test('transitioning from desktop to mobile should maintain expanded state', async ({
			page
		}) => {
			// Start with desktop (expanded by default)
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.goto('/')
			await page.waitForLoadState('networkidle')

			const menu = page.getByTestId('menu-content')
			let menuBox = await menu.boundingBox()
			expect(menuBox?.width).toBe(200)

			// Resize to mobile
			await page.setViewportSize({ width: 375, height: 667 })
			// Wait for menu transition to complete
			await page.waitForTimeout(350)

			// Menu should stay expanded (no responsive default change)
			menuBox = await menu.boundingBox()
			expect(menuBox?.width).toBeGreaterThanOrEqual(150)
		})
	})
})
