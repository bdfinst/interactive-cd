import { describe, it, expect, beforeEach } from 'vitest'
import { get } from 'svelte/store'
import { isFullTreeExpanded } from '$lib/stores/treeState.js'

describe('treeState Store', () => {
	beforeEach(() => {
		// Reset store before each test
		isFullTreeExpanded.set(false)
	})

	it('initializes with false', () => {
		expect(get(isFullTreeExpanded)).toBe(false)
	})

	it('can be set to true', () => {
		isFullTreeExpanded.set(true)
		expect(get(isFullTreeExpanded)).toBe(true)
	})

	it('can be set back to false', () => {
		isFullTreeExpanded.set(true)
		isFullTreeExpanded.set(false)
		expect(get(isFullTreeExpanded)).toBe(false)
	})

	it('can be updated with function', () => {
		isFullTreeExpanded.set(false)
		isFullTreeExpanded.update(value => !value)
		expect(get(isFullTreeExpanded)).toBe(true)
	})

	it('update function receives current value', () => {
		isFullTreeExpanded.set(true)
		isFullTreeExpanded.update(value => {
			expect(value).toBe(true)
			return false
		})
		expect(get(isFullTreeExpanded)).toBe(false)
	})

	it('maintains reactivity across multiple subscribers', () => {
		const values = []

		isFullTreeExpanded.subscribe(value => {
			values.push(value)
		})

		isFullTreeExpanded.set(true)
		isFullTreeExpanded.set(false)

		expect(values).toEqual([false, true, false])
	})
})
