import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { get } from 'svelte/store'

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
			import.meta.env.PUBLIC_ENABLE_PRACTICE_ADOPTION = undefined

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(false)
		})

		it('returns false for isPracticeAdoptionEnabled by default', async () => {
			window.location.search = ''
			import.meta.env.PUBLIC_ENABLE_PRACTICE_ADOPTION = undefined

			const { isPracticeAdoptionEnabled } = await import('$lib/stores/featureFlags.js')

			expect(get(isPracticeAdoptionEnabled)).toBe(false)
		})
	})

	describe('isFeatureEnabled - URL Parameter', () => {
		it('enables via URL parameter ?feature=practice-adoption', async () => {
			window.location.search = '?feature=practice-adoption'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(true)
		})

		it('enables via URL parameter ?features=practice-adoption (plural)', async () => {
			window.location.search = '?features=practice-adoption'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(true)
		})

		it('enables via URL parameter with multiple features', async () => {
			window.location.search = '?features=practice-adoption,other-feature'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(true)
		})

		it('is case-insensitive for URL parameter', async () => {
			window.location.search = '?feature=PRACTICE-ADOPTION'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(true)
		})

		it('does not enable with wrong URL parameter', async () => {
			window.location.search = '?feature=wrong-feature'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(false)
		})
	})

	describe('isFeatureEnabled - Environment Variable', () => {
		it('enables via environment variable PUBLIC_ENABLE_PRACTICE_ADOPTION=true', async () => {
			window.location.search = ''
			import.meta.env.PUBLIC_ENABLE_PRACTICE_ADOPTION = 'true'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(true)
		})

		it('enables via environment variable PUBLIC_ENABLE_PRACTICE_ADOPTION=1', async () => {
			window.location.search = ''
			import.meta.env.PUBLIC_ENABLE_PRACTICE_ADOPTION = '1'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(true)
		})

		it('does not enable with env var set to false', async () => {
			window.location.search = ''
			import.meta.env.PUBLIC_ENABLE_PRACTICE_ADOPTION = 'false'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(false)
		})

		it('does not enable with env var set to 0', async () => {
			window.location.search = ''
			import.meta.env.PUBLIC_ENABLE_PRACTICE_ADOPTION = '0'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(false)
		})
	})

	describe('Priority: URL Parameter > Environment Variable', () => {
		it('URL parameter takes precedence over env var when both are true', async () => {
			window.location.search = '?feature=practice-adoption'
			import.meta.env.PUBLIC_ENABLE_PRACTICE_ADOPTION = 'true'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(true)
		})

		it('URL parameter enables feature even when env var is false', async () => {
			window.location.search = '?feature=practice-adoption'
			import.meta.env.PUBLIC_ENABLE_PRACTICE_ADOPTION = 'false'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(true)
		})

		it('env var enables feature when URL param is absent', async () => {
			window.location.search = ''
			import.meta.env.PUBLIC_ENABLE_PRACTICE_ADOPTION = 'true'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(true)
		})
	})

	describe('featureFlags.isEnabled()', () => {
		it('returns false when feature is disabled', async () => {
			window.location.search = ''
			import.meta.env.PUBLIC_ENABLE_PRACTICE_ADOPTION = undefined

			const { featureFlags } = await import('$lib/stores/featureFlags.js')

			expect(featureFlags.isEnabled(featureFlags.FLAGS.PRACTICE_ADOPTION)).toBe(false)
		})

		it('returns true when feature is enabled via URL', async () => {
			window.location.search = '?feature=practice-adoption'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')

			expect(featureFlags.isEnabled(featureFlags.FLAGS.PRACTICE_ADOPTION)).toBe(true)
		})

		it('returns true when feature is enabled via env var', async () => {
			window.location.search = ''
			import.meta.env.PUBLIC_ENABLE_PRACTICE_ADOPTION = 'true'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')

			expect(featureFlags.isEnabled(featureFlags.FLAGS.PRACTICE_ADOPTION)).toBe(true)
		})
	})

	describe('isPracticeAdoptionEnabled - Derived Store', () => {
		it('derives correctly when disabled', async () => {
			window.location.search = ''
			import.meta.env.PUBLIC_ENABLE_PRACTICE_ADOPTION = undefined

			const { isPracticeAdoptionEnabled } = await import('$lib/stores/featureFlags.js')

			expect(get(isPracticeAdoptionEnabled)).toBe(false)
		})

		it('derives correctly when enabled via URL', async () => {
			window.location.search = '?feature=practice-adoption'

			const { isPracticeAdoptionEnabled } = await import('$lib/stores/featureFlags.js')

			expect(get(isPracticeAdoptionEnabled)).toBe(true)
		})

		it('derives correctly when enabled via env var', async () => {
			window.location.search = ''
			import.meta.env.PUBLIC_ENABLE_PRACTICE_ADOPTION = 'true'

			const { isPracticeAdoptionEnabled } = await import('$lib/stores/featureFlags.js')

			expect(get(isPracticeAdoptionEnabled)).toBe(true)
		})
	})

	describe('Edge Cases', () => {
		it('handles empty URL parameter value', async () => {
			window.location.search = '?feature='
			import.meta.env.PUBLIC_ENABLE_PRACTICE_ADOPTION = undefined

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			// Empty parameter should be filtered out, so feature should be disabled
			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(false)
		})

		it('handles malformed URL parameters', async () => {
			window.location.search = '?feature=practice-adoption&&&&&'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(true)
		})

		it('handles URL with spaces', async () => {
			window.location.search = '?features=practice-adoption, other-feature'

			const { featureFlags } = await import('$lib/stores/featureFlags.js')
			const flags = get(featureFlags)

			expect(flags[featureFlags.FLAGS.PRACTICE_ADOPTION]).toBe(true)
		})

		it('handles undefined environment variable', async () => {
			window.location.search = ''
			import.meta.env.PUBLIC_ENABLE_PRACTICE_ADOPTION = undefined

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
