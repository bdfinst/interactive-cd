import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/svelte'
import { get } from 'svelte/store'
import HeaderSpacer from '$lib/components/HeaderSpacer.svelte'
import { headerHeight } from '$lib/stores/headerHeight.js'

describe('HeaderSpacer', () => {
	beforeEach(() => {
		// Reset header height before each test
		headerHeight.set(0)
	})

	it('renders a spacer div', () => {
		const { container } = render(HeaderSpacer)
		const spacer = container.querySelector('div')

		expect(spacer).toBeTruthy()
	})

	it('has aria-hidden="true" attribute', () => {
		const { container } = render(HeaderSpacer)
		const spacer = container.querySelector('div')

		expect(spacer.getAttribute('aria-hidden')).toBe('true')
	})

	it('sets height to 0px when headerHeight is 0', () => {
		headerHeight.set(0)
		const { container } = render(HeaderSpacer)
		const spacer = container.querySelector('div')

		expect(spacer.style.height).toBe('0px')
	})

	it('sets height to match headerHeight store value', () => {
		headerHeight.set(100)
		const { container } = render(HeaderSpacer)
		const spacer = container.querySelector('div')

		expect(spacer.style.height).toBe('100px')
	})

	it('updates height when headerHeight store changes', async () => {
		const { container } = render(HeaderSpacer)
		const spacer = container.querySelector('div')

		// Initial height
		headerHeight.set(80)
		await new Promise(resolve => setTimeout(resolve, 0))
		expect(spacer.style.height).toBe('80px')

		// Updated height
		headerHeight.set(120)
		await new Promise(resolve => setTimeout(resolve, 0))
		expect(spacer.style.height).toBe('120px')
	})

	it('reactively updates with typical header heights', async () => {
		const { container } = render(HeaderSpacer)
		const spacer = container.querySelector('div')

		// Desktop header height
		headerHeight.set(88)
		await new Promise(resolve => setTimeout(resolve, 0))
		expect(spacer.style.height).toBe('88px')

		// Mobile header height
		headerHeight.set(140)
		await new Promise(resolve => setTimeout(resolve, 0))
		expect(spacer.style.height).toBe('140px')
	})
})
