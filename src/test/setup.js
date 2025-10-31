import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/svelte'
import { afterEach, beforeAll } from 'vitest'

// Suppress jsdom navigation warnings
// jsdom doesn't support window.open or target="_blank" navigation
const originalConsoleError = console.error
beforeAll(() => {
	console.error = (...args) => {
		const message = args[0]
		if (
			typeof message === 'string' &&
			(message.includes('Not implemented: navigation') ||
				message.includes('Not implemented: HTMLFormElement'))
		) {
			return // Suppress expected jsdom limitations
		}
		originalConsoleError.apply(console, args)
	}
})

afterEach(() => {
	cleanup()
})
