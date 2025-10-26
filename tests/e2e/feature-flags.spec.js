import { expect, test } from '@playwright/test'

/**
 * IMPORTANT: Feature Flag Behavior Change
 *
 * As of the latest refactoring, the Practice Adoption feature is controlled
 * ONLY by the VITE_ENABLE_PRACTICE_ADOPTION environment variable.
 *
 * URL parameters (like ?feature=practice-adoption) are now IGNORED for
 * feature flag control, though they are preserved in URLs for backward compatibility.
 *
 * To enable the feature in tests:
 * 1. Set VITE_ENABLE_PRACTICE_ADOPTION='true' in environment
 * 2. URL parameters will NOT enable the feature
 */

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

	test.describe('URL Parameters Ignored (Backward Compatibility)', () => {
		test('should ignore ?feature=practice-adoption URL parameter', async ({ page }) => {
			// Visit WITH URL parameter (but feature flag is disabled in env)
			await page.goto('/?feature=practice-adoption')

			// Wait for page load
			await page.waitForSelector('[data-testid="graph-node"]', { timeout: 10000 })

			// Verify experimental indicator is NOT visible (URL param ignored)
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
					return expect(checkboxes).toHaveCount(0)
				})
		})

		test('should ignore plural ?features=practice-adoption parameter', async ({ page }) => {
			// Visit with plural "features" parameter
			await page.goto('/?features=practice-adoption')

			// Wait for page load
			await page.waitForSelector('[data-testid="graph-node"]', { timeout: 10000 })

			// Verify feature is NOT enabled (URL param ignored)
			const experimentalIndicator = page.locator('text=Experimental')
			await expect(experimentalIndicator)
				.not.toBeVisible({ timeout: 2000 })
				.catch(() => {
					return expect(experimentalIndicator).toHaveCount(0)
				})
		})

		test('should ignore URL with multiple features', async ({ page }) => {
			// Visit with multiple features (comma-separated)
			await page.goto('/?features=practice-adoption,other-feature')

			// Wait for page load
			await page.waitForSelector('[data-testid="graph-node"]', { timeout: 10000 })

			// Verify feature is NOT enabled (URL param ignored)
			const experimentalIndicator = page.locator('text=Experimental')
			await expect(experimentalIndicator)
				.not.toBeVisible({ timeout: 2000 })
				.catch(() => {
					return expect(experimentalIndicator).toHaveCount(0)
				})
		})

		test('should ignore case variations in URL parameter', async ({ page }) => {
			// Visit with uppercase parameter
			await page.goto('/?feature=PRACTICE-ADOPTION')

			// Wait for page load
			await page.waitForSelector('[data-testid="graph-node"]', { timeout: 10000 })

			// Verify feature is NOT enabled (URL param ignored)
			const experimentalIndicator = page.locator('text=Experimental')
			await expect(experimentalIndicator)
				.not.toBeVisible({ timeout: 2000 })
				.catch(() => {
					return expect(experimentalIndicator).toHaveCount(0)
				})
		})
	})

	test.describe('Feature Flag Persistence (Environment Variable)', () => {
		test('URL parameter presence does not affect feature state', async ({ page }) => {
			// Start with URL parameter (but feature is disabled in env)
			await page.goto('/?feature=practice-adoption')

			// Wait for page load
			await page.waitForSelector('[data-testid="graph-node"]')

			// Verify experimental indicator is NOT visible (env controls feature, not URL)
			const experimentalIndicator = page.locator('text=Experimental')
			await expect(experimentalIndicator)
				.not.toBeVisible({ timeout: 2000 })
				.catch(() => {
					return expect(experimentalIndicator).toHaveCount(0)
				})

			// Get current URL - parameter is preserved but ignored
			const currentUrl = page.url()
			expect(currentUrl).toContain('feature=practice-adoption')
		})

		test('removing URL parameter does not change feature state', async ({ page }) => {
			// Start with URL parameter (feature is disabled in env)
			await page.goto('/?feature=practice-adoption')
			await page.waitForSelector('[data-testid="graph-node"]')

			// Verify experimental indicator is NOT visible
			const experimentalIndicator = page.locator('text=Experimental')
			await expect(experimentalIndicator)
				.not.toBeVisible({ timeout: 2000 })
				.catch(() => {
					return expect(experimentalIndicator).toHaveCount(0)
				})

			// Navigate to same page without parameter
			await page.goto('/')
			await page.waitForSelector('[data-testid="graph-node"]')

			// Verify experimental indicator is still NOT visible (env controls feature)
			await expect(experimentalIndicator)
				.not.toBeVisible({ timeout: 2000 })
				.catch(() => {
					return expect(experimentalIndicator).toHaveCount(0)
				})
		})
	})

	// NOTE: The following tests require VITE_ENABLE_PRACTICE_ADOPTION='true'
	// They are skipped in the default test run since playwright.config.js sets it to 'false'
	// To run these tests, update playwright.config.js webServer.env or create a separate config
	test.describe.skip('Experimental Indicator (Requires Feature Enabled)', () => {
		test('should show experimental badge in header when feature is enabled', async ({ page }) => {
			// Visit page (feature must be enabled via env var)
			await page.goto('/')
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

		test('should show tooltip on hover (desktop)', async ({ page, isMobile }) => {
			// Skip on mobile/tablet viewports since hover is not supported
			if (isMobile) {
				test.skip(true, 'Hover tooltips not testable on mobile viewports')
				return
			}

			// Visit page (feature must be enabled via env var)
			await page.goto('/')
			await page.waitForSelector('[data-testid="graph-node"]')

			// Find the experimental indicator badge (desktop version with tooltip)
			// The desktop version is inside the lg:grid container and has mouseenter/mouseleave handlers
			const badge = page
				.locator('.bg-amber-100.border-amber-600')
				.filter({ hasText: 'Experimental' })
				.first()

			// Check if the badge is visible (desktop viewport)
			await expect(badge).toBeVisible()

			// Hover over the badge
			await badge.hover()

			// Wait for tooltip to appear
			await page.waitForTimeout(300)

			// Verify tooltip is visible
			const tooltip = page.locator('text=Practice Adoption feature enabled')
			await expect(tooltip).toBeVisible()
		})
	})

	test.describe.skip('Console Logging (Debug) (Requires Feature Enabled)', () => {
		test('should log feature flag status to console when enabled', async ({ page }) => {
			const consoleLogs = []

			// Capture console logs
			page.on('console', msg => {
				if (msg.type() === 'info') {
					consoleLogs.push(msg.text())
				}
			})

			// Visit page (feature must be enabled via env var)
			await page.goto('/')
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

	test.describe.skip('Export/Import Functionality (Requires Feature Enabled)', () => {
		test('should show export and import buttons when feature is enabled', async ({ page }) => {
			// Visit page (feature must be enabled via env var)
			await page.goto('/')
			await page.waitForSelector('[data-testid="graph-node"]')

			// Verify at least one export button is visible (desktop OR mobile)
			const exportButtons = page.locator(
				'[data-testid="export-button"], [data-testid="export-button-mobile"]'
			)
			// Find a visible export button
			let foundVisibleExport = false
			const exportCount = await exportButtons.count()
			for (let i = 0; i < exportCount; i++) {
				if (await exportButtons.nth(i).isVisible()) {
					foundVisibleExport = true
					break
				}
			}
			expect(foundVisibleExport).toBe(true)

			// Verify at least one import button is visible (desktop OR mobile)
			const importButtons = page.locator(
				'[data-testid="import-button"], [data-testid="import-button-mobile"]'
			)
			// Find a visible import button
			let foundVisibleImport = false
			const importCount = await importButtons.count()
			for (let i = 0; i < importCount; i++) {
				if (await importButtons.nth(i).isVisible()) {
					foundVisibleImport = true
					break
				}
			}
			expect(foundVisibleImport).toBe(true)
		})

		test('should not show export/import buttons when feature is disabled', async ({ page }) => {
			// Visit without feature flag
			await page.goto('/')
			await page.waitForSelector('[data-testid="graph-node"]')

			// Verify export buttons are not visible
			const exportButtons = page.locator(
				'[data-testid="export-button"], [data-testid="export-button-mobile"]'
			)
			await expect(exportButtons.first())
				.not.toBeVisible({ timeout: 2000 })
				.catch(() => {
					return expect(exportButtons).toHaveCount(0)
				})

			// Verify import buttons are not visible
			const importButtons = page.locator(
				'[data-testid="import-button"], [data-testid="import-button-mobile"]'
			)
			await expect(importButtons.first())
				.not.toBeVisible({ timeout: 2000 })
				.catch(() => {
					return expect(importButtons).toHaveCount(0)
				})
		})

		test('should trigger download when export button is clicked', async ({ page }) => {
			// Visit page (feature must be enabled via env var)
			await page.goto('/')
			await page.waitForSelector('[data-testid="graph-node"]')

			// Setup download listener
			const downloadPromise = page.waitForEvent('download')

			// Find and click the visible export button
			const exportButtons = page.locator(
				'[data-testid="export-button"], [data-testid="export-button-mobile"]'
			)
			const exportCount = await exportButtons.count()
			for (let i = 0; i < exportCount; i++) {
				if (await exportButtons.nth(i).isVisible()) {
					await exportButtons.nth(i).click()
					break
				}
			}

			// Wait for download to start
			const download = await downloadPromise

			// Verify download has correct filename pattern
			const filename = download.suggestedFilename()
			expect(filename).toMatch(/^cd-practices-adoption-\d{4}-\d{2}-\d{2}\.cdpa$/)
		})

		test('should show import file picker when import button is clicked', async ({ page }) => {
			// Visit page (feature must be enabled via env var)
			await page.goto('/')
			await page.waitForSelector('[data-testid="graph-node"]')

			// Verify file input exists but is hidden
			const fileInput = page.locator('[data-testid="import-file-input"]')
			await expect(fileInput).toBeAttached()
			await expect(fileInput).toBeHidden()

			// Find and click the visible import button
			const importButtons = page.locator(
				'[data-testid="import-button"], [data-testid="import-button-mobile"]'
			)
			const importCount = await importButtons.count()
			for (let i = 0; i < importCount; i++) {
				if (await importButtons.nth(i).isVisible()) {
					await importButtons.nth(i).click()
					break
				}
			}

			// File picker will open (can't test actual file picker, but we can verify the click happened)
			// In real browser, file picker would open
		})

		test('should accept .cdpa file format for import', async ({ page }) => {
			// Visit page (feature must be enabled via env var)
			await page.goto('/')
			await page.waitForSelector('[data-testid="graph-node"]')

			// Verify file input accepts correct file types
			const fileInput = page.locator('[data-testid="import-file-input"]')
			const acceptAttribute = await fileInput.getAttribute('accept')
			expect(acceptAttribute).toContain('.cdpa')
		})

		test('should show success message after successful import', async ({ page }) => {
			// Visit page (feature must be enabled via env var)
			await page.goto('/')
			await page.waitForSelector('[data-testid="graph-node"]')

			// Create a valid import file
			const importData = {
				version: '1.0.0',
				exportedAt: new Date().toISOString(),
				metadata: {
					totalPractices: 3,
					adoptedCount: 2,
					adoptionPercentage: 67,
					appVersion: '1.3.0'
				},
				adoptedPractices: ['version-control', 'automated-testing']
			}

			// Upload the file
			const fileInput = page.locator('[data-testid="import-file-input"]')
			await fileInput.setInputFiles({
				name: 'test-import.cdpa',
				mimeType: 'application/vnd.cd-practices.adoption+json',
				buffer: Buffer.from(JSON.stringify(importData))
			})

			// Wait for import message to appear
			const importMessage = page.locator('[data-testid="import-message"]')
			await expect(importMessage).toBeVisible({ timeout: 5000 })

			// Verify success message content
			await expect(importMessage).toContainText('Successfully imported')
		})

		test('should show error message for invalid import file', async ({ page }) => {
			// Visit page (feature must be enabled via env var)
			await page.goto('/')
			await page.waitForSelector('[data-testid="graph-node"]')

			// Create an invalid import file (missing required fields)
			const invalidData = {
				invalid: 'data'
			}

			// Upload the file
			const fileInput = page.locator('[data-testid="import-file-input"]')
			await fileInput.setInputFiles({
				name: 'invalid-import.cdpa',
				mimeType: 'application/json',
				buffer: Buffer.from(JSON.stringify(invalidData))
			})

			// Wait for error message to appear
			const importMessage = page.locator('[data-testid="import-message"]')
			await expect(importMessage).toBeVisible({ timeout: 5000 })

			// Verify error message styling (red background)
			const classes = await importMessage.locator('div').first().getAttribute('class')
			expect(classes).toContain('bg-red-100')
			expect(classes).toContain('border-red-600')
		})

		test('should dismiss import message after 5 seconds', async ({ page }) => {
			// Visit page (feature must be enabled via env var)
			await page.goto('/')
			await page.waitForSelector('[data-testid="graph-node"]')

			// Create a valid import file
			const importData = {
				version: '1.0.0',
				exportedAt: new Date().toISOString(),
				metadata: {
					totalPractices: 1,
					adoptedCount: 1,
					adoptionPercentage: 100,
					appVersion: '1.3.0'
				},
				adoptedPractices: ['version-control']
			}

			// Upload the file
			const fileInput = page.locator('[data-testid="import-file-input"]')
			await fileInput.setInputFiles({
				name: 'test-import.cdpa',
				mimeType: 'application/vnd.cd-practices.adoption+json',
				buffer: Buffer.from(JSON.stringify(importData))
			})

			// Verify message appears
			const importMessage = page.locator('[data-testid="import-message"]')
			await expect(importMessage).toBeVisible()

			// Wait for auto-dismiss (5 seconds + buffer)
			await page.waitForTimeout(5500)

			// Verify message is gone
			await expect(importMessage).not.toBeVisible()
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

		test('should handle malformed URL parameters (URL ignored)', async ({ page }) => {
			// Visit with malformed parameters
			await page.goto('/?feature=practice-adoption&&&')

			// Wait for page load
			await page.waitForSelector('[data-testid="graph-node"]')

			// Feature is disabled (URL parameters are ignored)
			const experimentalIndicator = page.locator('text=Experimental')
			await expect(experimentalIndicator)
				.not.toBeVisible({ timeout: 2000 })
				.catch(() => {
					return expect(experimentalIndicator).toHaveCount(0)
				})
		})
	})
})
