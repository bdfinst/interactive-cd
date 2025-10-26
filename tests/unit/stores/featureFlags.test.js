import { get } from 'svelte/store'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('Feature Flags', () => {
	let originalLocation
	let originalEnv

	beforeEach(() => {
		// Save originals
		originalLocation = window.location
		originalEnv = import.meta.env

		// Mock window.location
		delete window.location
		window.location = {
			search: '',
			href: 'http://localhost:5173/'
		}

		// Clear module cache to force re-evaluation
		vi.resetModules()
	})

	afterEach(() => {
		// Restore originals
		window.location = originalLocation
		import.meta.env = originalEnv
		vi.resetModules()
	})

	describe('isFeatureEnabled - Default Behavior', () => {
		it('is disabled by default when no env var or URL param is set', async () => {
			// Set up clean state
			window.location.search = ''

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(false)
		})

		it('returns false for isPracticeAdoptionEnabled by default', async () => {
			window.location.search = ''

			const { isPracticeAdoptionEnabled } = await import('$lib/stores/featureFlags.js')

			expect(get(isPracticeAdoptionEnabled)).toBe(false)
		})
	})

	describe('isFeatureEnabled - URL Parameter (IGNORED)', () => {
		it('ignores URL parameter ?feature=practice-adoption', async () => {
			window.location.search = '?feature=practice-adoption'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			// URL parameters are now ignored - feature is disabled without env var
			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(false)
		})

		it('ignores URL parameter ?features=practice-adoption (plural)', async () => {
			window.location.search = '?features=practice-adoption'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			// URL parameters are now ignored - feature is disabled without env var
			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(false)
		})

		it('ignores URL parameter with multiple features', async () => {
			window.location.search = '?features=practice-adoption,other-feature'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			// URL parameters are now ignored - feature is disabled without env var
			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(false)
		})

		it('ignores case-insensitive URL parameter', async () => {
			window.location.search = '?feature=PRACTICE-ADOPTION'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			// URL parameters are now ignored - feature is disabled without env var
			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(false)
		})

		it('does not enable with wrong URL parameter', async () => {
			window.location.search = '?feature=wrong-feature'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			// Still disabled (this test is unchanged but kept for consistency)
			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(false)
		})
	})

	describe('isFeatureEnabled - Environment Variable', () => {
		it('enables via environment variable VITE_ENABLE_PRACTICE_ADOPTION=true', async () => {
			window.location.search = ''
			import.meta.env.VITE_ENABLE_PRACTICE_ADOPTION = 'true'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(true)
		})

		it('enables via environment variable VITE_ENABLE_PRACTICE_ADOPTION=1', async () => {
			window.location.search = ''
			import.meta.env.VITE_ENABLE_PRACTICE_ADOPTION = '1'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(true)
		})

		it('does not enable with env var set to false', async () => {
			window.location.search = ''
			import.meta.env.VITE_ENABLE_PRACTICE_ADOPTION = 'false'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(false)
		})

		it('does not enable with env var set to 0', async () => {
			window.location.search = ''
			import.meta.env.VITE_ENABLE_PRACTICE_ADOPTION = '0'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(false)
		})
	})

	describe('Environment Variable Only (No URL Override)', () => {
		it('env var controls feature regardless of URL parameter', async () => {
			window.location.search = '?feature=practice-adoption'
			import.meta.env.VITE_ENABLE_PRACTICE_ADOPTION = 'true'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			// Enabled by env var (URL is ignored)
			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(true)
		})

		it('URL parameter cannot enable feature when env var is false', async () => {
			window.location.search = '?feature=practice-adoption'
			import.meta.env.VITE_ENABLE_PRACTICE_ADOPTION = 'false'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			// Disabled by env var (URL is ignored)
			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(false)
		})

		it('env var enables feature when URL param is absent', async () => {
			window.location.search = ''
			import.meta.env.VITE_ENABLE_PRACTICE_ADOPTION = 'true'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			// Enabled by env var
			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(true)
		})
	})

	describe('featureFlags.isEnabled()', () => {
		it('returns false when feature is disabled', async () => {
			window.location.search = ''
			import.meta.env.VITE_ENABLE_PRACTICE_ADOPTION = undefined

			const { featureFlags } = await import('$lib/stores/featureFlags.js')

			expect(featureFlags.isEnabled(featureFlags.FLAGS.PRACTICE_ADOPTION)).toBe(false)
		})

		it('returns false even with URL parameter (URL ignored)', async () => {
			window.location.search = '?feature=practice-adoption'
			import.meta.env.VITE_ENABLE_PRACTICE_ADOPTION = undefined

			const { featureFlags } = await import('$lib/stores/featureFlags.js')

			// URL parameters are ignored
			expect(featureFlags.isEnabled(featureFlags.FLAGS.PRACTICE_ADOPTION)).toBe(false)
		})

		it('returns true when feature is enabled via env var', async () => {
			window.location.search = ''
			import.meta.env.VITE_ENABLE_PRACTICE_ADOPTION = 'true'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')

			expect(featureFlags.isEnabled(featureFlags.FLAGS.PRACTICE_ADOPTION)).toBe(true)
		})
	})

	describe('isPracticeAdoptionEnabled - Derived Store', () => {
		it('derives correctly when disabled', async () => {
			window.location.search = ''
			import.meta.env.VITE_ENABLE_PRACTICE_ADOPTION = undefined

			const { isPracticeAdoptionEnabled } = await import('$lib/stores/featureFlags.js')

			expect(get(isPracticeAdoptionEnabled)).toBe(false)
		})

		it('derives correctly when disabled (URL ignored)', async () => {
			window.location.search = '?feature=practice-adoption'
			import.meta.env.VITE_ENABLE_PRACTICE_ADOPTION = undefined

			const { isPracticeAdoptionEnabled } = await import('$lib/stores/featureFlags.js')

			// URL parameters are ignored
			expect(get(isPracticeAdoptionEnabled)).toBe(false)
		})

		it('derives correctly when enabled via env var', async () => {
			window.location.search = ''
			import.meta.env.VITE_ENABLE_PRACTICE_ADOPTION = 'true'

			const { isPracticeAdoptionEnabled } = await import('$lib/stores/featureFlags.js')

			expect(get(isPracticeAdoptionEnabled)).toBe(true)
		})
	})

	describe('Edge Cases', () => {
		it('handles empty URL parameter value (URL ignored)', async () => {
			window.location.search = '?feature='
			import.meta.env.VITE_ENABLE_PRACTICE_ADOPTION = undefined

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			// URL parameters are ignored regardless of value
			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(false)
		})

		it('handles malformed URL parameters (URL ignored)', async () => {
			window.location.search = '?feature=practice-adoption&&&&&'
			import.meta.env.VITE_ENABLE_PRACTICE_ADOPTION = undefined

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			// URL parameters are ignored
			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(false)
		})

		it('handles URL with spaces (URL ignored)', async () => {
			window.location.search = '?features=practice-adoption, other-feature'
			import.meta.env.VITE_ENABLE_PRACTICE_ADOPTION = undefined

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			// URL parameters are ignored
			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(false)
		})

		it('handles undefined environment variable', async () => {
			window.location.search = ''
			import.meta.env.VITE_ENABLE_PRACTICE_ADOPTION = undefined

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(false)
		})
	})

	describe('FLAGS constant', () => {
		it('exports FLAGS constant with PRACTICE_ADOPTION', async () => {
			const { featureFlags } = await import('$lib/stores/featureFlags.js')

			expect(featureFlags.FLAGS).toBeDefined()
			expect(featureFlags.FLAGS.PRACTICE_ADOPTION).toBe('ENABLE_PRACTICE_ADOPTION')
		})
	})
})
