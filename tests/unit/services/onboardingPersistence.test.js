import { describe, it, expect, beforeEach } from 'vitest'
import {
	ONBOARDING_STORAGE_KEY,
	hasSeenOnboarding,
	markOnboardingSeen,
	resetOnboardingSeen
} from '$lib/services/onboardingPersistence.js'

// Mock localStorage
const mockLocalStorage = (() => {
	let store = {}
	return {
		getItem: key => store[key] || null,
		setItem: (key, value) => {
			store[key] = value.toString()
		},
		removeItem: key => {
			delete store[key]
		},
		clear: () => {
			store = {}
		}
	}
})()

global.localStorage = mockLocalStorage

describe('onboardingPersistence', () => {
	beforeEach(() => {
		mockLocalStorage.clear()
	})

	it('returns false when onboarding has not been seen', () => {
		expect(hasSeenOnboarding()).toBe(false)
	})

	it('returns true after marking onboarding as seen', () => {
		markOnboardingSeen()

		expect(hasSeenOnboarding()).toBe(true)
	})

	it('returns false after resetting onboarding state', () => {
		markOnboardingSeen()
		resetOnboardingSeen()

		expect(hasSeenOnboarding()).toBe(false)
	})

	it('uses the correct storage key', () => {
		expect(ONBOARDING_STORAGE_KEY).toBe('cd-practices-onboarding-seen')

		markOnboardingSeen()

		expect(mockLocalStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe('true')
	})
})
