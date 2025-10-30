# Test Strategy: Responsive Mobile Menu

## Overview

This document outlines a comprehensive test strategy for the responsive mobile menu feature, following the BDD → ATDD → TDD approach defined in CLAUDE.md. The strategy ensures thorough testing of menu behavior across different viewports, interaction methods, and accessibility requirements.

## 1. BDD Feature Definition (Gherkin)

### Feature File: `docs/features/responsive-menu.feature`

```gherkin
Feature: Responsive Navigation Menu
  As a user
  I want a responsive navigation menu that adapts to my device
  So that I can efficiently navigate the application on any screen size

  Background:
    Given I am on the Interactive CD application

  # Mobile Behavior (< 1024px)
  Scenario: Mobile menu defaults to collapsed state
    Given I am viewing the app on a mobile device
    When the page loads
    Then the menu should be collapsed showing only icons
    And the menu should have 64px width
    And menu labels should be visually hidden but accessible to screen readers
    And the content area should have 64px left margin

  Scenario: Expanding mobile menu reveals labels
    Given I am viewing the app on a mobile device
    And the menu is collapsed
    When I tap the hamburger button
    Then the menu should expand to 256px width
    And menu labels should become visible
    And the content area should adjust to 256px left margin
    And the transition should be smooth (300ms)

  Scenario: Collapsing mobile menu hides labels
    Given I am viewing the app on a mobile device
    And the menu is expanded
    When I tap the hamburger button
    Then the menu should collapse to 64px width
    And menu labels should be hidden but remain accessible
    And the content area should adjust to 64px left margin

  Scenario: Touch gestures on mobile
    Given I am viewing the app on a mobile device
    When I swipe right from the left edge
    Then the menu should expand
    When I swipe left on the expanded menu
    Then the menu should collapse

  Scenario: Menu overlay on mobile
    Given I am viewing the app on a mobile device
    And the menu is expanded
    When I tap outside the menu area
    Then the menu should collapse
    And the overlay should disappear

  # Desktop Behavior (≥ 1024px)
  Scenario: Desktop menu defaults to expanded state
    Given I am viewing the app on a desktop device
    When the page loads
    Then the menu should be expanded showing icons and labels
    And the menu should have 256px width
    And the content area should have 256px left margin

  Scenario: Collapsing desktop menu preserves icon visibility
    Given I am viewing the app on a desktop device
    And the menu is expanded
    When I click the hamburger button
    Then the menu should collapse to 64px width
    And only icons should be visible
    And tooltips should appear on hover
    And the content area should adjust to 64px left margin

  # Breakpoint Transitions
  Scenario: Transitioning from mobile to desktop viewport
    Given I am viewing the app on a mobile device with collapsed menu
    When the viewport width increases above 1024px
    Then the menu should remain in its current state
    And no layout shift should occur
    And animations should not trigger

  Scenario: Transitioning from desktop to mobile viewport
    Given I am viewing the app on a desktop device with expanded menu
    When the viewport width decreases below 1024px
    Then the menu should remain in its current state
    And the overlay behavior should activate
    And touch gestures should become available

  # Keyboard Navigation
  Scenario: Keyboard navigation in expanded menu
    Given the menu is expanded
    When I press Tab
    Then focus should move through menu items sequentially
    And focused items should have visible focus indicators
    When I press Enter on a menu item
    Then the corresponding action should trigger

  Scenario: Keyboard navigation in collapsed menu
    Given the menu is collapsed
    When I press Tab
    Then focus should move through menu items
    And tooltips should appear for focused items
    When I press Enter on a menu item
    Then the corresponding action should trigger

  # Accessibility
  Scenario: Screen reader announces menu state
    Given I am using a screen reader
    When the menu state changes
    Then the screen reader should announce "Menu expanded" or "Menu collapsed"
    And menu items should be announced with their labels
    And external links should be announced as "opens in new tab"

  Scenario: Reduced motion preference
    Given I have enabled "prefers-reduced-motion" in my system
    When the menu state changes
    Then the transition should be instant (no animation)
    But the final state should be the same

  # Edge Cases
  Scenario: Very small mobile screens (< 375px)
    Given I am viewing the app on a screen smaller than 375px
    When the menu is expanded
    Then the menu should take full screen width
    And content should be completely hidden
    And a close button should be prominently visible

  Scenario: Landscape orientation on mobile
    Given I am viewing the app on a mobile device in landscape
    When the menu is expanded
    Then the menu height should not exceed viewport height
    And menu items should be scrollable if needed
    And the header should remain visible

  Scenario: Rapid toggle interactions
    Given the menu is in any state
    When I rapidly click the hamburger button multiple times
    Then the menu should queue animations properly
    And no visual glitches should occur
    And the final state should match the number of clicks
```

## 2. Acceptance Test Plan (ATDD - Playwright)

### Test Configuration

```javascript
// tests/e2e/responsive-menu.spec.js
import { test, expect, devices } from '@playwright/test'

const viewports = {
	smallMobile: { width: 320, height: 568 }, // iPhone SE
	mobile: { width: 375, height: 667 }, // iPhone 8
	tablet: { width: 768, height: 1024 }, // iPad
	desktop: { width: 1440, height: 900 }, // Desktop
	largeDesktop: { width: 1920, height: 1080 } // Large Desktop
}

const testDevices = [
	{ name: 'iPhone 13', device: devices['iPhone 13'] },
	{ name: 'Pixel 5', device: devices['Pixel 5'] },
	{ name: 'iPad Pro', device: devices['iPad Pro'] }
]
```

### E2E Test Scenarios

```javascript
test.describe('Responsive Menu - Mobile Behavior', () => {
	test('should default to collapsed state on mobile', async ({ page }) => {
		// Given I am viewing the app on a mobile device
		await page.setViewportSize(viewports.mobile)
		await page.goto('/')

		// When the page loads
		await page.waitForLoadState('networkidle')

		// Then the menu should be collapsed
		const menu = page.getByTestId('menu-content')
		await expect(menu).toHaveCSS('width', '64px')

		// And labels should be visually hidden
		const labels = page.locator('[data-testid^="menu-label-"]')
		await expect(labels.first()).toHaveClass(/sr-only/)
	})

	test('should handle touch gestures', async ({ browser }) => {
		const context = await browser.newContext({
			...devices['iPhone 13'],
			hasTouch: true
		})
		const page = await context.newPage()
		await page.goto('/')

		// Swipe from left edge to open
		await page.touchscreen.swipe({
			start: { x: 0, y: 200 },
			end: { x: 300, y: 200 },
			steps: 10
		})

		// Verify menu expanded
		await expect(page.getByTestId('menu-content')).toHaveCSS('width', '256px')
	})

	test('should show overlay when expanded on mobile', async ({ page }) => {
		await page.setViewportSize(viewports.mobile)
		await page.goto('/')

		// Expand menu
		await page.getByLabel(/menu/i).click()

		// Overlay should be visible
		const overlay = page.getByTestId('menu-overlay')
		await expect(overlay).toBeVisible()

		// Click overlay to close
		await overlay.click()
		await expect(page.getByTestId('menu-content')).toHaveCSS('width', '64px')
	})
})

test.describe('Responsive Menu - Breakpoint Transitions', () => {
	test('should handle viewport resize smoothly', async ({ page }) => {
		await page.goto('/')

		// Start mobile
		await page.setViewportSize(viewports.mobile)
		const menu = page.getByTestId('menu-content')

		// Record initial state
		const initialWidth = await menu.evaluate(el => window.getComputedStyle(el).width)

		// Resize to desktop
		await page.setViewportSize(viewports.desktop)

		// State should persist (no auto-expand)
		await expect(menu).toHaveCSS('width', initialWidth)

		// No layout shift
		const hasScroll = await page.evaluate(
			() => document.documentElement.scrollWidth > window.innerWidth
		)
		expect(hasScroll).toBe(false)
	})
})

test.describe('Responsive Menu - Performance', () => {
	test('should maintain 60fps during transitions', async ({ page }) => {
		await page.goto('/')

		// Start performance measurement
		await page.evaluate(() => {
			window.frameCount = 0
			window.startTime = performance.now()

			const countFrames = () => {
				window.frameCount++
				if (performance.now() - window.startTime < 1000) {
					requestAnimationFrame(countFrames)
				}
			}
			requestAnimationFrame(countFrames)
		})

		// Trigger menu animation
		await page.getByLabel(/menu/i).click()
		await page.waitForTimeout(1000)

		// Check FPS
		const fps = await page.evaluate(() => window.frameCount)
		expect(fps).toBeGreaterThanOrEqual(55) // Allow small variance
	})
})
```

## 3. Integration Test Plan (Testing Library)

### Component Integration Tests

```javascript
// tests/unit/components/ResponsiveMenu.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/svelte'
import { tick } from 'svelte'
import Menu from '$lib/components/Menu.svelte'
import { menuStore } from '$lib/stores/menuStore'

describe('Menu Component - Responsive Behavior', () => {
	beforeEach(() => {
		// Reset store and viewport
		menuStore.collapse()
		vi.stubGlobal('innerWidth', 1440)
		vi.stubGlobal(
			'matchMedia',
			vi.fn(query => ({
				matches: query === '(min-width: 1024px)',
				addEventListener: vi.fn(),
				removeEventListener: vi.fn()
			}))
		)
	})

	describe('Mobile viewport behavior', () => {
		beforeEach(() => {
			vi.stubGlobal('innerWidth', 375)
			vi.stubGlobal(
				'matchMedia',
				vi.fn(() => ({
					matches: false,
					addEventListener: vi.fn(),
					removeEventListener: vi.fn()
				}))
			)
		})

		it('should render with collapsed state on mobile', () => {
			const { container } = render(Menu)
			const menuContent = container.querySelector('[data-testid="menu-content"]')

			expect(menuContent).toHaveClass('w-16') // 64px
			expect(menuContent).not.toHaveClass('w-64') // not 256px
		})

		it('should show overlay when expanded', async () => {
			const { container, getByLabel } = render(Menu)

			// Expand menu
			await fireEvent.click(getByLabel(/menu/i))
			await tick()

			const overlay = container.querySelector('[data-testid="menu-overlay"]')
			expect(overlay).toBeInTheDocument()
			expect(overlay).not.toHaveClass('lg:hidden')
		})

		it('should handle touch events', async () => {
			const { container } = render(Menu)
			const menuContent = container.querySelector('[data-testid="menu-content"]')

			// Simulate touch swipe
			const touchStart = new TouchEvent('touchstart', {
				touches: [{ clientX: 0, clientY: 200 }]
			})
			const touchMove = new TouchEvent('touchmove', {
				touches: [{ clientX: 250, clientY: 200 }]
			})
			const touchEnd = new TouchEvent('touchend')

			fireEvent(menuContent, touchStart)
			fireEvent(menuContent, touchMove)
			fireEvent(menuContent, touchEnd)

			await waitFor(() => {
				expect(menuContent).toHaveClass('w-64')
			})
		})
	})

	describe('Desktop viewport behavior', () => {
		it('should render with expanded state on desktop', () => {
			const { container } = render(Menu)
			const menuContent = container.querySelector('[data-testid="menu-content"]')

			expect(menuContent).toHaveClass('lg:w-64') // Desktop: 256px
		})

		it('should show tooltips when collapsed', async () => {
			const { container, getByLabel } = render(Menu)

			// Collapse menu
			await fireEvent.click(getByLabel(/menu/i))
			await tick()

			// Hover over item
			const homeItem = container.querySelector('[data-testid="menu-item-home"]')
			await fireEvent.mouseEnter(homeItem)

			// Tooltip should appear
			await waitFor(() => {
				const tooltip = container.querySelector('[role="tooltip"]')
				expect(tooltip).toBeInTheDocument()
				expect(tooltip).toHaveTextContent('Home')
			})
		})
	})

	describe('Responsive transitions', () => {
		it('should maintain state during viewport change', async () => {
			const { rerender } = render(Menu)

			// Start collapsed
			menuStore.collapse()

			// Change viewport
			vi.stubGlobal('innerWidth', 1440)
			window.dispatchEvent(new Event('resize'))
			await tick()

			// State should persist
			expect(menuStore.isExpanded()).toBe(false)
		})

		it('should not trigger animations on viewport change', async () => {
			const { container } = render(Menu)
			const menuContent = container.querySelector('[data-testid="menu-content"]')

			// Add spy for transition events
			const transitionSpy = vi.fn()
			menuContent.addEventListener('transitionstart', transitionSpy)

			// Trigger resize
			window.dispatchEvent(new Event('resize'))
			await tick()

			expect(transitionSpy).not.toHaveBeenCalled()
		})
	})
})
```

## 4. Unit Test Suite (Vitest)

### State Management Tests

```javascript
// tests/unit/stores/responsiveMenuStore.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { get } from 'svelte/store'
import {
	createResponsiveMenuStore,
	getBreakpoint,
	shouldShowOverlay,
	calculateMenuWidth
} from '$lib/stores/responsiveMenuStore'

describe('Responsive Menu Store', () => {
	describe('Pure Functions', () => {
		describe('getBreakpoint', () => {
			it('should return correct breakpoint for width', () => {
				expect(getBreakpoint(320)).toBe('mobile')
				expect(getBreakpoint(768)).toBe('tablet')
				expect(getBreakpoint(1024)).toBe('desktop')
				expect(getBreakpoint(1920)).toBe('desktop')
			})
		})

		describe('shouldShowOverlay', () => {
			it('should show overlay only on mobile when expanded', () => {
				expect(shouldShowOverlay('mobile', true)).toBe(true)
				expect(shouldShowOverlay('mobile', false)).toBe(false)
				expect(shouldShowOverlay('desktop', true)).toBe(false)
				expect(shouldShowOverlay('desktop', false)).toBe(false)
			})
		})

		describe('calculateMenuWidth', () => {
			it('should return correct width based on state', () => {
				expect(calculateMenuWidth(true, 'mobile')).toBe(256)
				expect(calculateMenuWidth(false, 'mobile')).toBe(64)
				expect(calculateMenuWidth(true, 'desktop')).toBe(256)
				expect(calculateMenuWidth(false, 'desktop')).toBe(64)
				expect(calculateMenuWidth(true, 'mobile', 320)).toBe(320) // full width on small
			})
		})
	})

	describe('Store Behavior', () => {
		let store

		beforeEach(() => {
			store = createResponsiveMenuStore({
				width: 1440,
				breakpoint: 'desktop'
			})
		})

		it('should initialize with correct state', () => {
			const state = get(store)
			expect(state.isExpanded).toBe(true) // desktop default
			expect(state.breakpoint).toBe('desktop')
			expect(state.width).toBe(256)
		})

		it('should handle viewport changes', () => {
			store.updateViewport(375)
			const state = get(store)

			expect(state.breakpoint).toBe('mobile')
			// State should persist
			expect(state.isExpanded).toBe(true)
		})

		it('should toggle state correctly', () => {
			store.toggle()
			expect(get(store).isExpanded).toBe(false)

			store.toggle()
			expect(get(store).isExpanded).toBe(true)
		})

		it('should calculate derived values', () => {
			const state = get(store)
			expect(state.showOverlay).toBe(false) // desktop, no overlay

			store.updateViewport(375)
			store.expand()

			const mobileState = get(store)
			expect(mobileState.showOverlay).toBe(true)
		})
	})
})

describe('Touch Gesture Handlers', () => {
	describe('detectSwipeDirection', () => {
		it('should detect right swipe', () => {
			const result = detectSwipeDirection({ x: 0, y: 200 }, { x: 150, y: 210 })
			expect(result).toBe('right')
		})

		it('should detect left swipe', () => {
			const result = detectSwipeDirection({ x: 200, y: 200 }, { x: 50, y: 210 })
			expect(result).toBe('left')
		})

		it('should return null for small movements', () => {
			const result = detectSwipeDirection({ x: 100, y: 200 }, { x: 120, y: 205 })
			expect(result).toBe(null)
		})

		it('should ignore vertical swipes', () => {
			const result = detectSwipeDirection({ x: 100, y: 100 }, { x: 110, y: 250 })
			expect(result).toBe(null)
		})
	})
})
```

### Animation and Performance Tests

```javascript
// tests/unit/utils/menuAnimations.test.js
import { describe, it, expect, vi } from 'vitest'
import {
	getTransitionDuration,
	shouldAnimate,
	calculateEasing,
	throttleAnimation
} from '$lib/utils/menuAnimations'

describe('Menu Animation Utils', () => {
	describe('getTransitionDuration', () => {
		it('should return 0 for reduced motion', () => {
			const duration = getTransitionDuration(true)
			expect(duration).toBe(0)
		})

		it('should return 300ms for normal motion', () => {
			const duration = getTransitionDuration(false)
			expect(duration).toBe(300)
		})
	})

	describe('shouldAnimate', () => {
		it('should not animate during viewport resize', () => {
			expect(shouldAnimate('resize')).toBe(false)
		})

		it('should animate for user interactions', () => {
			expect(shouldAnimate('click')).toBe(true)
			expect(shouldAnimate('touch')).toBe(true)
			expect(shouldAnimate('keyboard')).toBe(true)
		})
	})

	describe('calculateEasing', () => {
		it('should return correct easing values', () => {
			expect(calculateEasing(0)).toBe(0)
			expect(calculateEasing(0.5)).toBeCloseTo(0.5, 1)
			expect(calculateEasing(1)).toBe(1)
		})
	})

	describe('throttleAnimation', () => {
		beforeEach(() => {
			vi.useFakeTimers()
		})

		afterEach(() => {
			vi.useRealTimers()
		})

		it('should throttle rapid calls', () => {
			const callback = vi.fn()
			const throttled = throttleAnimation(callback, 100)

			// Rapid calls
			throttled()
			throttled()
			throttled()

			expect(callback).toHaveBeenCalledTimes(1)

			// After throttle period
			vi.advanceTimersByTime(100)
			throttled()

			expect(callback).toHaveBeenCalledTimes(2)
		})
	})
})
```

## 5. Accessibility Test Checklist

### WCAG 2.1 AA Compliance

```javascript
// tests/unit/accessibility/menu.test.js
describe('Menu Accessibility', () => {
	it('should have proper ARIA attributes', () => {
		const { container } = render(Menu)

		// Navigation landmark
		const nav = container.querySelector('nav')
		expect(nav).toHaveAttribute('aria-label', 'Main navigation')

		// Hamburger button
		const toggle = container.querySelector('[aria-controls="menu-content"]')
		expect(toggle).toHaveAttribute('aria-expanded')

		// Menu items
		const items = container.querySelectorAll('[role="menuitem"]')
		items.forEach(item => {
			expect(item).toHaveAttribute('aria-label')
		})
	})

	it('should maintain focus visibility', () => {
		const { container } = render(Menu)
		const items = container.querySelectorAll('[data-testid^="menu-item-"]')

		items.forEach(item => {
			item.focus()
			const styles = window.getComputedStyle(item)
			expect(styles.outline).not.toBe('none')
		})
	})

	it('should support keyboard navigation', async () => {
		const { container } = render(Menu)
		const firstItem = container.querySelector('[data-testid="menu-item-home"]')

		firstItem.focus()

		// Tab to next item
		await fireEvent.keyDown(document.activeElement, { key: 'Tab' })

		expect(document.activeElement).not.toBe(firstItem)
		expect(document.activeElement.dataset.testid).toContain('menu-item')
	})

	it('should announce state changes to screen readers', async () => {
		const { getByLabel } = render(Menu)
		const toggle = getByLabel(/menu/i)

		// Create live region spy
		const liveRegion = document.createElement('div')
		liveRegion.setAttribute('aria-live', 'polite')
		document.body.appendChild(liveRegion)

		await fireEvent.click(toggle)

		expect(liveRegion.textContent).toContain('Menu')
	})
})
```

## 6. Performance Test Criteria

### Metrics and Thresholds

```javascript
// tests/performance/menu.perf.js
describe('Menu Performance', () => {
	it('should complete transition within 300ms', async () => {
		const start = performance.now()
		menuStore.toggle()
		await waitForTransition()
		const duration = performance.now() - start

		expect(duration).toBeLessThanOrEqual(350) // 300ms + buffer
	})

	it('should not cause layout thrashing', () => {
		const reflows = measureReflows(() => {
			menuStore.toggle()
		})

		expect(reflows).toBeLessThan(3)
	})

	it('should maintain 60fps during animation', async () => {
		const fps = await measureFPS(() => {
			menuStore.toggle()
		})

		expect(fps).toBeGreaterThanOrEqual(55)
	})

	it('should lazy-load menu icons', () => {
		const { container } = render(Menu)
		const icons = container.querySelectorAll('[data-testid^="menu-icon-"]')

		icons.forEach(icon => {
			expect(icon).toHaveAttribute('loading', 'lazy')
		})
	})
})
```

## 7. Edge Case Test Scenarios

### Unusual Conditions and Stress Tests

```javascript
describe('Menu Edge Cases', () => {
	it('should handle very small viewports (< 320px)', () => {
		vi.stubGlobal('innerWidth', 280)
		const { container } = render(Menu)

		menuStore.expand()
		const menu = container.querySelector('[data-testid="menu-content"]')

		// Should take full width
		expect(menu).toHaveClass('w-full')
	})

	it('should handle rapid toggle spam', async () => {
		const { getByLabel } = render(Menu)
		const toggle = getByLabel(/menu/i)

		// Spam clicks
		for (let i = 0; i < 20; i++) {
			fireEvent.click(toggle)
		}

		// Should end in stable state
		await waitFor(() => {
			const state = get(menuStore)
			expect(state.isExpanded).toBeDefined()
		})
	})

	it('should handle missing localStorage gracefully', () => {
		// Disable localStorage
		delete window.localStorage

		expect(() => {
			render(Menu)
		}).not.toThrow()
	})

	it('should handle RTL languages', () => {
		document.dir = 'rtl'
		const { container } = render(Menu)
		const menu = container.querySelector('[data-testid="menu-content"]')

		expect(menu).toHaveClass('right-0')
		expect(menu).not.toHaveClass('left-0')

		document.dir = 'ltr' // Reset
	})
})
```

## 8. Test Execution Matrix

| Test Type         | Framework        | Coverage Target | Execution Time |
| ----------------- | ---------------- | --------------- | -------------- |
| Unit Tests        | Vitest           | 95%             | < 5s           |
| Integration Tests | Testing Library  | 85%             | < 10s          |
| E2E Tests         | Playwright       | Critical Paths  | < 30s          |
| Accessibility     | axe-core + Pa11y | WCAG AA         | < 15s          |
| Performance       | Lighthouse CI    | 90+ score       | < 20s          |

## 9. Continuous Integration Pipeline

```yaml
# .github/workflows/test-responsive-menu.yml
name: Test Responsive Menu
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        viewport: [mobile, tablet, desktop]

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test -- --coverage tests/unit/menu

      - name: Run integration tests
        run: npm test -- tests/integration/menu

      - name: Run E2E tests - ${{ matrix.viewport }}
        run: |
          npx playwright test \
            --project=${{ matrix.viewport }} \
            tests/e2e/responsive-menu.spec.js

      - name: Run accessibility tests
        run: npm run test:a11y -- --focus menu

      - name: Run performance tests
        run: npm run lighthouse -- --only-categories=performance
```

## 10. Test Data Builders

```javascript
// tests/builders/menuBuilder.js
export const buildMenuState = (overrides = {}) => ({
	isExpanded: false,
	breakpoint: 'desktop',
	width: 1440,
	hasTouch: false,
	prefersReducedMotion: false,
	...overrides
})

export const buildMenuItem = (overrides = {}) => ({
	id: 'test-item',
	label: 'Test Item',
	icon: 'test-icon',
	href: '/test',
	external: false,
	action: null,
	...overrides
})

export const buildTouchEvent = (type, overrides = {}) => ({
	type,
	touches: [{ clientX: 100, clientY: 200 }],
	preventDefault: vi.fn(),
	stopPropagation: vi.fn(),
	...overrides
})
```

## Summary

This comprehensive test strategy ensures:

- ✅ **Behavior-focused testing** at all levels (unit, integration, E2E)
- ✅ **Responsive behavior** validated across all breakpoints
- ✅ **Accessibility compliance** with WCAG 2.1 AA standards
- ✅ **Performance targets** for smooth 60fps animations
- ✅ **Edge case handling** for unusual conditions
- ✅ **Touch gesture support** for mobile devices
- ✅ **Keyboard navigation** for accessibility
- ✅ **State persistence** during viewport transitions
- ✅ **Graceful degradation** for reduced motion preferences

The strategy follows the BDD → ATDD → TDD workflow, ensuring tests are written before implementation and focus on user behavior rather than implementation details.
