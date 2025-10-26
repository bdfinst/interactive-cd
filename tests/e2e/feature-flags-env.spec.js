import { expect, test } from '@playwright/test'

/**
 * Feature Flags E2E Tests - Environment Variable Behavior
 *
 * These tests verify that VITE_ENABLE_PRACTICE_ADOPTION environment variable
 * correctly controls feature visibility in the application.
 *
 * NOTE: These tests assume the app is running with the default configuration.
 * To test with VITE_ENABLE_PRACTICE_ADOPTION=true, you would need to
 * start the dev server with that env var set.
 */

// Helper function to check if experimental indicator is visible
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

test.describe('Feature Flags - VITE Environment Variable', () => {
	test.describe('Default Configuration (VITE_ENABLE_PRACTICE_ADOPTION not set)', () => {
		test('feature is hidden when env var is not set and no URL param', async ({ page }) => {
			// Given: VITE_ENABLE_PRACTICE_ADOPTION is not set (default)
			// And: No URL parameter is provided
			await page.goto('/')

			// Wait for page to load
			await page.waitForSelector('[data-testid="graph-node"]', { timeout: 10000 })

			// Then: Feature should be hidden
			const experimentalIndicator = page.locator('text=Experimental')
			await expect(experimentalIndicator)
				.not.toBeVisible({ timeout: 2000 })
				.catch(() => {
					return expect(experimentalIndicator).toHaveCount(0)
				})

			// And: Adoption checkboxes should not be visible
			const checkboxes = page.locator('[role="checkbox"][aria-label*="adoption"]')
			await expect(checkboxes.first())
				.not.toBeVisible({ timeout: 2000 })
				.catch(() => {
					return expect(checkboxes).toHaveCount(0)
				})

			// And: Export/import buttons should not be visible
			const exportButton = page.locator(
				'[data-testid="export-button"], [data-testid="export-button-mobile"]'
			)
			await expect(exportButton.first())
				.not.toBeVisible({ timeout: 2000 })
				.catch(() => {
					return expect(exportButton).toHaveCount(0)
				})
		})

		test('URL parameter overrides default env var setting', async ({ page }) => {
			// Given: VITE_ENABLE_PRACTICE_ADOPTION is not set (default)
			// When: User visits with URL parameter
			await page.goto('/?feature=practice-adoption')

			// Wait for page to load
			await page.waitForSelector('[data-testid="graph-node"]', { timeout: 10000 })

			// Then: Feature should be enabled via URL parameter
			await expectExperimentalIndicatorVisible(page)

			// And: Export/import buttons should be visible
			const exportButtons = page.locator(
				'[data-testid="export-button"], [data-testid="export-button-mobile"]'
			)
			let foundVisibleExport = false
			const exportCount = await exportButtons.count()
			for (let i = 0; i < exportCount; i++) {
				if (await exportButtons.nth(i).isVisible()) {
					foundVisibleExport = true
					break
				}
			}
			expect(foundVisibleExport).toBe(true)
		})
	})

	test.describe('URL Parameter Backward Compatibility', () => {
		test('legacy shared URLs with ?feature param still work', async ({ page }) => {
			// Given: User has a bookmarked/shared URL from before VITE migration
			// When: They visit with the old URL parameter format
			await page.goto('/?feature=practice-adoption')

			// Wait for page to load
			await page.waitForSelector('[data-testid="graph-node"]', { timeout: 10000 })

			// Then: Feature should be enabled (backward compatible)
			await expectExperimentalIndicatorVisible(page)

			// Verify console logs indicate URL parameter is being used
			const consoleLogs = []
			page.on('console', msg => {
				if (msg.type() === 'info') {
					consoleLogs.push(msg.text())
				}
			})

			// Reload to capture logs
			await page.reload()
			await page.waitForSelector('[data-testid="graph-node"]')
			await page.waitForTimeout(1000)

			// Should see log about URL parameter
			const hasUrlParamLog = consoleLogs.some(log => log.includes('URL parameter'))
			expect(hasUrlParamLog).toBe(true)
		})

		test('legacy ?features param (plural) still works', async ({ page }) => {
			// Given: User has URL with plural "features" parameter
			// When: They visit with the plural URL parameter format
			await page.goto('/?features=practice-adoption')

			// Wait for page to load
			await page.waitForSelector('[data-testid="graph-node"]', { timeout: 10000 })

			// Then: Feature should be enabled (backward compatible)
			await expectExperimentalIndicatorVisible(page)
		})

		test('case-insensitive URL parameter works', async ({ page }) => {
			// Given: User has URL with uppercase parameter
			// When: They visit with uppercase parameter
			await page.goto('/?feature=PRACTICE-ADOPTION')

			// Wait for page to load
			await page.waitForSelector('[data-testid="graph-node"]', { timeout: 10000 })

			// Then: Feature should be enabled (case-insensitive)
			await expectExperimentalIndicatorVisible(page)
		})

		test('URL with adoption state and feature param works together', async ({ page }) => {
			// Given: User shares a URL with both feature flag and adoption state
			// When: Another user opens the shared URL
			await page.goto('/?feature=practice-adoption&adopted=dmVyc2lvbi1jb250cm9s')

			// Wait for page to load
			await page.waitForSelector('[data-testid="graph-node"]', { timeout: 10000 })

			// Then: Feature should be enabled
			await expectExperimentalIndicatorVisible(page)

			// And: Adoption state should be loaded
			// Note: The actual adoption state loading is tested in other spec files
			// Here we just verify the feature flag is working
		})
	})

	test.describe('Feature Flag Behavior Across Navigation', () => {
		test('feature flag persists when navigating with URL param', async ({ page }) => {
			// Given: User starts with feature enabled via URL
			await page.goto('/?feature=practice-adoption')
			await page.waitForSelector('[data-testid="graph-node"]')

			// When: User interacts with the page (adoption state changes, etc.)
			// The URL parameter should be maintained

			// Then: Experimental indicator remains visible
			await expectExperimentalIndicatorVisible(page)

			// And: URL still contains feature parameter
			expect(page.url()).toContain('feature=practice-adoption')
		})

		test('feature flag is removed when URL param is removed', async ({ page }) => {
			// Given: User starts with feature enabled
			await page.goto('/?feature=practice-adoption')
			await page.waitForSelector('[data-testid="graph-node"]')
			await expectExperimentalIndicatorVisible(page)

			// When: User navigates to URL without parameter
			await page.goto('/')
			await page.waitForSelector('[data-testid="graph-node"]')

			// Then: Feature should be disabled
			const experimentalIndicator = page.locator('text=Experimental')
			await expect(experimentalIndicator)
				.not.toBeVisible({ timeout: 2000 })
				.catch(() => {
					return expect(experimentalIndicator).toHaveCount(0)
				})
		})
	})

	test.describe('Console Logging for Debugging', () => {
		test('logs feature flag status when enabled via URL', async ({ page }) => {
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

			// Wait for console logs
			await page.waitForTimeout(1000)

			// Verify console log mentions feature flag and URL parameter
			const hasFeatureFlagLog = consoleLogs.some(
				log =>
					log.includes('Feature flag') &&
					log.includes('ENABLE_PRACTICE_ADOPTION') &&
					log.includes('URL parameter')
			)

			expect(hasFeatureFlagLog).toBe(true)
		})

		test('logs feature flag status when disabled', async ({ page }) => {
			const consoleLogs = []

			// Capture console logs
			page.on('console', msg => {
				if (msg.type() === 'info') {
					consoleLogs.push(msg.text())
				}
			})

			// Visit without feature flag
			await page.goto('/')
			await page.waitForSelector('[data-testid="graph-node"]')

			// Wait for console logs
			await page.waitForTimeout(1000)

			// Verify console log mentions feature flag is disabled
			const hasDisabledLog = consoleLogs.some(
				log => log.includes('Feature flag') && log.includes('disabled')
			)

			expect(hasDisabledLog).toBe(true)
		})
	})

	test.describe('Edge Cases in E2E Context', () => {
		test('handles empty feature parameter gracefully', async ({ page }) => {
			// Given: URL has empty feature parameter
			await page.goto('/?feature=')

			// Wait for page to load
			await page.waitForSelector('[data-testid="graph-node"]')

			// Then: Feature should be disabled (empty param is invalid)
			const experimentalIndicator = page.locator('text=Experimental')
			await expect(experimentalIndicator)
				.not.toBeVisible({ timeout: 2000 })
				.catch(() => {
					return expect(experimentalIndicator).toHaveCount(0)
				})
		})

		test('handles wrong feature name gracefully', async ({ page }) => {
			// Given: URL has wrong feature name
			await page.goto('/?feature=invalid-feature-name')

			// Wait for page to load
			await page.waitForSelector('[data-testid="graph-node"]')

			// Then: Feature should be disabled
			const experimentalIndicator = page.locator('text=Experimental')
			await expect(experimentalIndicator)
				.not.toBeVisible({ timeout: 2000 })
				.catch(() => {
					return expect(experimentalIndicator).toHaveCount(0)
				})
		})

		test('handles malformed URL parameters', async ({ page }) => {
			// Given: URL has malformed parameters
			await page.goto('/?feature=practice-adoption&&&extra=params')

			// Wait for page to load
			await page.waitForSelector('[data-testid="graph-node"]')

			// Then: Feature should still be enabled (tolerant parsing)
			await expectExperimentalIndicatorVisible(page)
		})

		test('handles multiple features in URL parameter', async ({ page }) => {
			// Given: URL has multiple features (comma-separated)
			await page.goto('/?features=practice-adoption,future-feature,another-feature')

			// Wait for page to load
			await page.waitForSelector('[data-testid="graph-node"]')

			// Then: Practice adoption feature should be enabled
			await expectExperimentalIndicatorVisible(page)
		})

		test('handles URL with only other features (not practice-adoption)', async ({ page }) => {
			// Given: URL has features but not practice-adoption
			await page.goto('/?features=other-feature,another-feature')

			// Wait for page to load
			await page.waitForSelector('[data-testid="graph-node"]')

			// Then: Practice adoption should be disabled
			const experimentalIndicator = page.locator('text=Experimental')
			await expect(experimentalIndicator)
				.not.toBeVisible({ timeout: 2000 })
				.catch(() => {
					return expect(experimentalIndicator).toHaveCount(0)
				})
		})
	})

	test.describe('UI Elements Conditional Rendering', () => {
		test('all adoption UI elements hidden when feature disabled', async ({ page }) => {
			// Given: Feature is disabled
			await page.goto('/')
			await page.waitForSelector('[data-testid="graph-node"]')

			// Then: All adoption-related UI should be hidden
			// Experimental badge
			const badge = page.locator('text=Experimental')
			await expect(badge)
				.not.toBeVisible({ timeout: 2000 })
				.catch(() => expect(badge).toHaveCount(0))

			// Adoption checkboxes
			const checkboxes = page.locator('[role="checkbox"][aria-label*="adoption"]')
			await expect(checkboxes.first())
				.not.toBeVisible({ timeout: 2000 })
				.catch(() => expect(checkboxes).toHaveCount(0))

			// Export button
			const exportBtn = page.locator('[data-testid="export-button"]')
			await expect(exportBtn.first())
				.not.toBeVisible({ timeout: 2000 })
				.catch(() => expect(exportBtn).toHaveCount(0))

			// Import button
			const importBtn = page.locator('[data-testid="import-button"]')
			await expect(importBtn.first())
				.not.toBeVisible({ timeout: 2000 })
				.catch(() => expect(importBtn).toHaveCount(0))
		})

		test('all adoption UI elements visible when feature enabled', async ({ page }) => {
			// Given: Feature is enabled via URL
			await page.goto('/?feature=practice-adoption')
			await page.waitForSelector('[data-testid="graph-node"]')

			// Then: All adoption-related UI should be visible
			// Experimental badge
			await expectExperimentalIndicatorVisible(page)

			// Export button (desktop or mobile version)
			const exportButtons = page.locator(
				'[data-testid="export-button"], [data-testid="export-button-mobile"]'
			)
			let foundExport = false
			const exportCount = await exportButtons.count()
			for (let i = 0; i < exportCount; i++) {
				if (await exportButtons.nth(i).isVisible()) {
					foundExport = true
					break
				}
			}
			expect(foundExport).toBe(true)

			// Import button (desktop or mobile version)
			const importButtons = page.locator(
				'[data-testid="import-button"], [data-testid="import-button-mobile"]'
			)
			let foundImport = false
			const importCount = await importButtons.count()
			for (let i = 0; i < importCount; i++) {
				if (await importButtons.nth(i).isVisible()) {
					foundImport = true
					break
				}
			}
			expect(foundImport).toBe(true)
		})
	})

	test.describe('Performance - Feature Flag Checking', () => {
		test('page loads quickly with feature disabled', async ({ page }) => {
			// Given: Feature is disabled
			const startTime = Date.now()

			// When: Page loads
			await page.goto('/')
			await page.waitForSelector('[data-testid="graph-node"]', { timeout: 10000 })

			// Then: Page should load within reasonable time
			const loadTime = Date.now() - startTime
			expect(loadTime).toBeLessThan(5000) // 5 seconds max
		})

		test('page loads quickly with feature enabled via URL', async ({ page }) => {
			// Given: Feature is enabled via URL
			const startTime = Date.now()

			// When: Page loads
			await page.goto('/?feature=practice-adoption')
			await page.waitForSelector('[data-testid="graph-node"]', { timeout: 10000 })

			// Then: Page should load within reasonable time
			const loadTime = Date.now() - startTime
			expect(loadTime).toBeLessThan(5000) // 5 seconds max
		})
	})
})
