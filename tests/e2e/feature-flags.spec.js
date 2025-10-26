import { test, expect } from '@playwright/test'

// Helper function to check if experimental indicator is visible
// (There are 2 instances: desktop and mobile, only one is visible at a time)
async function expectExperimentalIndicatorVisible(page) {
	const indicators = page.locator('text=Experimental')
	const count = await indicators.count()
	expect(count).toBeGreaterThan(0)

	// Find at least one visible indicator
	let foundVisible = false
	for (let i = 0; i < count; i++) {
		if (await indicators.nth(i).isVisible()) {
			foundVisible = true
			break
		}
	}
	expect(foundVisible).toBe(true)
}

test.describe('Feature Flags - Practice Adoption', () => {
	test.describe('Feature Hidden by Default', () => {
		test('should hide adoption feature when flag is disabled', async ({ page }) => {
			// Visit without feature flag
			await page.goto('/')

			// Wait for page load
			await page.waitForSelector('[data-testid="graph-node"]', { timeout: 10000 })

			// Verify experimental indicator is NOT visible
			const experimentalIndicator = page.locator('text=Experimental')
			await expect(experimentalIndicator)
				.not.toBeVisible({ timeout: 2000 })
				.catch(() => {
					return expect(experimentalIndicator).toHaveCount(0)
				})

			// Verify adoption checkboxes are NOT visible
			const checkboxes = page.locator('[role="checkbox"][aria-label*="adoption"]')
			await expect(checkboxes.first())
				.not.toBeVisible({ timeout: 2000 })
				.catch(() => {
					// If no checkbox exists at all, this is expected
					return expect(checkboxes).toHaveCount(0)
				})

			// Verify export/import buttons are NOT visible
			const exportButton = page.locator('button:has-text("Export")')
			await expect(exportButton)
				.not.toBeVisible({ timeout: 2000 })
				.catch(() => {
					// If button doesn't exist at all, this is expected
					return expect(exportButton).toHaveCount(0)
				})
		})

		test('should not show adoption UI elements in card details', async ({ page }) => {
			await page.goto('/')

			// Wait for a practice card to be available
			await page.waitForSelector('[data-testid="graph-node"]')

			// Click on a practice to expand it
			const firstCard = page.locator('[data-testid="graph-node"]').first()
			await firstCard.click()

			// Wait for card expansion
			await page.waitForTimeout(500)

			// Verify no adoption-related UI in expanded view
			const adoptionCheckbox = page.locator('[role="checkbox"][aria-label*="adoption"]')
			await expect(adoptionCheckbox)
				.not.toBeVisible({ timeout: 2000 })
				.catch(() => {
					return expect(adoptionCheckbox).toHaveCount(0)
				})
		})
	})

	test.describe('Feature Enabled via URL Parameter', () => {
		test('should show adoption feature when ?feature=practice-adoption is present', async ({
			page
		}) => {
			// Visit WITH feature flag
			await page.goto('/?feature=practice-adoption')

			// Wait for page load
			await page.waitForSelector('[data-testid="graph-node"]', { timeout: 10000 })

			// Verify experimental indicator is visible in header
			await expectExperimentalIndicatorVisible(page)

			// TODO: Phase 4 - Verify adoption checkboxes ARE visible (UI not yet implemented)
			// const checkboxes = page.locator('[role="checkbox"]')
			// const count = await checkboxes.count()
			// expect(count).toBeGreaterThan(0)
		})

		test('should support plural ?features=practice-adoption parameter', async ({ page }) => {
			// Visit with plural "features" parameter
			await page.goto('/?features=practice-adoption')

			// Wait for page load
			await page.waitForSelector('[data-testid="graph-node"]', { timeout: 10000 })

			// Verify experimental indicator is visible
			await expectExperimentalIndicatorVisible(page)

			// TODO: Phase 4 - Verify adoption checkboxes ARE visible (UI not yet implemented)
			// const checkboxes = page.locator('[role="checkbox"]')
			// const count = await checkboxes.count()
			// expect(count).toBeGreaterThan(0)
		})

		test('should enable feature with multiple features in URL', async ({ page }) => {
			// Visit with multiple features (comma-separated)
			await page.goto('/?features=practice-adoption,other-feature')

			// Wait for page load
			await page.waitForSelector('[data-testid="graph-node"]', { timeout: 10000 })

			// Verify experimental indicator is visible
			await expectExperimentalIndicatorVisible(page)

			// TODO: Phase 4 - Verify adoption checkboxes ARE visible (UI not yet implemented)
			// const checkboxes = page.locator('[role="checkbox"]')
			// const count = await checkboxes.count()
			// expect(count).toBeGreaterThan(0)
		})

		test('should be case-insensitive for feature parameter', async ({ page }) => {
			// Visit with uppercase parameter
			await page.goto('/?feature=PRACTICE-ADOPTION')

			// Wait for page load
			await page.waitForSelector('[data-testid="graph-node"]', { timeout: 10000 })

			// Verify experimental indicator is visible
			await expectExperimentalIndicatorVisible(page)

			// TODO: Phase 4 - Verify adoption checkboxes ARE visible (UI not yet implemented)
			// const checkboxes = page.locator('[role="checkbox"]')
			// const count = await checkboxes.count()
			// expect(count).toBeGreaterThan(0)
		})
	})

	test.describe('Feature Flag Persistence', () => {
		test('should maintain feature flag when navigating within app', async ({ page }) => {
			// Start with feature enabled
			await page.goto('/?feature=practice-adoption')

			// Wait for page load
			await page.waitForSelector('[data-testid="graph-node"]')

			// Verify experimental indicator is visible
			await expectExperimentalIndicatorVisible(page)

			// Get current URL to verify parameter persists
			const currentUrl = page.url()
			expect(currentUrl).toContain('feature=practice-adoption')
		})

		test('should lose feature flag when URL parameter is removed', async ({ page }) => {
			// Start with feature enabled
			await page.goto('/?feature=practice-adoption')
			await page.waitForSelector('[data-testid="graph-node"]')

			// Verify experimental indicator is visible
			await expectExperimentalIndicatorVisible(page)

			// Navigate to same page without parameter
			await page.goto('/')
			await page.waitForSelector('[data-testid="graph-node"]')

			// Verify experimental indicator is now hidden
			const experimentalIndicator = page.locator('text=Experimental')
			await expect(experimentalIndicator)
				.not.toBeVisible({ timeout: 2000 })
				.catch(() => {
					return expect(experimentalIndicator).toHaveCount(0)
				})
		})
	})

	test.describe('Experimental Indicator', () => {
		test('should show experimental badge in header when feature is enabled', async ({ page }) => {
			// Visit with feature flag
			await page.goto('/?feature=practice-adoption')
			await page.waitForSelector('[data-testid="graph-node"]')

			// Verify experimental indicator is visible
			await expectExperimentalIndicatorVisible(page)

			// Verify at least one badge has the correct styling (amber background)
			const badges = page.locator('div:has-text("Experimental")')
			const badgeCount = await badges.count()

			// Find a visible badge and check its styling
			let foundStyledBadge = false
			for (let i = 0; i < badgeCount; i++) {
				const badge = badges.nth(i)
				if (await badge.isVisible()) {
					const classes = await badge.getAttribute('class')
					if (classes && classes.includes('bg-amber-100') && classes.includes('border-amber-600')) {
						foundStyledBadge = true
						break
					}
				}
			}
			expect(foundStyledBadge).toBe(true)
		})

		test('should show tooltip on hover (desktop)', async ({ page }) => {
			// Visit with feature flag
			await page.goto('/?feature=practice-adoption')
			await page.waitForSelector('[data-testid="graph-node"]')

			// Find the experimental indicator badge (desktop version with tooltip)
			// The desktop version is inside the lg:grid container and has mouseenter/mouseleave handlers
			const badge = page
				.locator('.bg-amber-100.border-amber-600')
				.filter({ hasText: 'Experimental' })
				.first()

			// Check if the badge is visible (desktop viewport)
			// On mobile viewports, the desktop badge is hidden by Tailwind responsive classes
			const isVisible = await badge.isVisible()
			if (!isVisible) {
				test.skip(true, 'Desktop tooltip not visible on this viewport size (mobile)')
				return
			}

			// Hover over the badge
			await badge.hover()

			// Wait for tooltip to appear
			await page.waitForTimeout(300)

			// Verify tooltip is visible
			const tooltip = page.locator('text=Practice Adoption feature enabled')
			await expect(tooltip).toBeVisible()
		})
	})

	test.describe('Console Logging (Debug)', () => {
		test('should log feature flag status to console when enabled', async ({ page }) => {
			const consoleLogs = []

			// Capture console logs
			page.on('console', msg => {
				if (msg.type() === 'info') {
					consoleLogs.push(msg.text())
				}
			})

			// Visit with feature flag
			await page.goto('/?feature=practice-adoption')
			await page.waitForSelector('[data-testid="graph-node"]')

			// Wait a bit for console logs to appear
			await page.waitForTimeout(1000)

			// Verify console log contains feature flag message
			const hasFeatureFlagLog = consoleLogs.some(
				log => log.includes('Feature flag') && log.includes('ENABLE_PRACTICE_ADOPTION')
			)

			expect(hasFeatureFlagLog).toBe(true)
		})
	})

	test.describe('Edge Cases', () => {
		test('should handle empty feature parameter', async ({ page }) => {
			// Visit with empty parameter
			await page.goto('/?feature=')

			// Wait for page load
			await page.waitForSelector('[data-testid="graph-node"]')

			// Feature should be disabled (empty parameter doesn't enable it)
			const checkboxes = page.locator('[role="checkbox"][aria-label*="adoption"]')
			await expect(checkboxes.first())
				.not.toBeVisible({ timeout: 2000 })
				.catch(() => {
					return expect(checkboxes).toHaveCount(0)
				})
		})

		test('should handle wrong feature name', async ({ page }) => {
			// Visit with wrong feature name
			await page.goto('/?feature=wrong-feature-name')

			// Wait for page load
			await page.waitForSelector('[data-testid="graph-node"]')

			// Feature should be disabled
			const checkboxes = page.locator('[role="checkbox"][aria-label*="adoption"]')
			await expect(checkboxes.first())
				.not.toBeVisible({ timeout: 2000 })
				.catch(() => {
					return expect(checkboxes).toHaveCount(0)
				})
		})

		test('should handle malformed URL parameters', async ({ page }) => {
			// Visit with malformed parameters
			await page.goto('/?feature=practice-adoption&&&')

			// Wait for page load
			await page.waitForSelector('[data-testid="graph-node"]')

			// Feature should still be enabled (tolerant parsing)
			await expectExperimentalIndicatorVisible(page)

			// TODO: Phase 4 - Verify adoption checkboxes ARE visible (UI not yet implemented)
			// const checkboxes = page.locator('[role="checkbox"]')
			// const count = await checkboxes.count()
			// expect(count).toBeGreaterThan(0)
		})
	})
})
