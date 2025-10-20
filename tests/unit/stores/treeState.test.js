import { describe, it, expect, beforeEach } from 'vitest'
import { get } from 'svelte/store'
import { isFullTreeExpanded, treeState } from '$lib/stores/treeState.js'

describe('treeState Store', () => {
	beforeEach(() => {
		// Reset store before each test using collapse()
		treeState.collapse()
	})

	it('initializes with false', () => {
		expect(get(isFullTreeExpanded)).toBe(false)
	})

	it('can be expanded', () => {
		treeState.expand()
		expect(get(isFullTreeExpanded)).toBe(true)
	})

	it('can be collapsed', () => {
		treeState.expand()
		treeState.collapse()
		expect(get(isFullTreeExpanded)).toBe(false)
	})

	it('can be toggled from false to true', () => {
		treeState.collapse()
		treeState.toggle()
		expect(get(isFullTreeExpanded)).toBe(true)
	})

	it('can be toggled from true to false', () => {
		treeState.expand()
		treeState.toggle()
		expect(get(isFullTreeExpanded)).toBe(false)
	})

	it('maintains reactivity across multiple subscribers', () => {
		const values = []

		isFullTreeExpanded.subscribe(value => {
			values.push(value)
		})

		treeState.expand()
		treeState.collapse()

		expect(values).toEqual([false, true, false])
	})
})
