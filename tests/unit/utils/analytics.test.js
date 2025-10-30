/**
 * Unit Tests for Google Analytics Utilities
 *
 * Following TDD principles:
 * - Tests written before implementation
 * - Tests focus on behavior, not implementation
 * - Pure functions are easily testable
 * - Each test verifies one specific behavior
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
	isValidMeasurementId,
	shouldEnableAnalytics,
	createGtagScript,
	initializeDataLayer,
	createGtagConfig,
	safeGtagCall,
	trackPageView,
	trackEvent,
	getPageData
} from '$lib/utils/analytics.js'

describe('Analytics Utilities', () => {
	describe('isValidMeasurementId', () => {
		it('returns true for valid GA4 measurement ID', () => {
			expect(isValidMeasurementId('G-ABC123DEF4')).toBe(true)
			expect(isValidMeasurementId('G-1234567890')).toBe(true)
			expect(isValidMeasurementId('G-XXXXXXXXXX')).toBe(true)
		})

		it('returns false for invalid GA4 format', () => {
			expect(isValidMeasurementId('UA-123456-1')).toBe(false) // Old Universal Analytics
			expect(isValidMeasurementId('G-ABC')).toBe(false) // Too short
			expect(isValidMeasurementId('G-ABC123DEF456')).toBe(false) // Too long
			expect(isValidMeasurementId('ABC123DEF4')).toBe(false) // Missing G- prefix
		})

		it('returns false for empty or invalid input', () => {
			expect(isValidMeasurementId('')).toBe(false)
			expect(isValidMeasurementId(null)).toBe(false)
			expect(isValidMeasurementId(undefined)).toBe(false)
			expect(isValidMeasurementId(123)).toBe(false)
			expect(isValidMeasurementId({})).toBe(false)
		})

		it('returns false for lowercase format', () => {
			expect(isValidMeasurementId('g-abc123def4')).toBe(false)
		})
	})

	describe('shouldEnableAnalytics', () => {
		it('returns true when browser and valid measurement ID', () => {
			expect(shouldEnableAnalytics('G-ABC123DEF4', true)).toBe(true)
		})

		it('returns false when not in browser', () => {
			expect(shouldEnableAnalytics('G-ABC123DEF4', false)).toBe(false)
		})

		it('returns false when measurement ID is invalid', () => {
			expect(shouldEnableAnalytics('', true)).toBe(false)
			expect(shouldEnableAnalytics('invalid', true)).toBe(false)
		})

		it('returns false when both conditions fail', () => {
			expect(shouldEnableAnalytics('', false)).toBe(false)
		})
	})

	describe('createGtagScript', () => {
		it('creates script element with correct attributes for valid ID', () => {
			const script = createGtagScript('G-ABC123DEF4')

			expect(script).toBeInstanceOf(HTMLScriptElement)
			expect(script.async).toBe(true)
			expect(script.src).toBe('https://www.googletagmanager.com/gtag/js?id=G-ABC123DEF4')
		})

		it('returns null for invalid measurement ID', () => {
			expect(createGtagScript('')).toBe(null)
			expect(createGtagScript('invalid')).toBe(null)
			expect(createGtagScript(null)).toBe(null)
		})

		it('prevents XSS by not accepting arbitrary script content', () => {
			const malicious = 'G-ABC123DEF4"><script>alert("xss")</script>'
			const script = createGtagScript(malicious)

			// Should be null because it doesn't match valid format
			expect(script).toBe(null)
		})
	})

	describe('initializeDataLayer', () => {
		let mockWindow

		beforeEach(() => {
			mockWindow = {}
		})

		it('initializes dataLayer array on window object', () => {
			initializeDataLayer(mockWindow)

			expect(Array.isArray(mockWindow.dataLayer)).toBe(true)
			expect(mockWindow.dataLayer).toEqual([])
		})

		it('initializes gtag function on window object', () => {
			initializeDataLayer(mockWindow)

			expect(typeof mockWindow.gtag).toBe('function')
		})

		it('preserves existing dataLayer if present', () => {
			mockWindow.dataLayer = [{ event: 'existing' }]
			initializeDataLayer(mockWindow)

			expect(mockWindow.dataLayer).toEqual([{ event: 'existing' }])
		})

		it('handles invalid window object gracefully', () => {
			const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

			initializeDataLayer(null)
			initializeDataLayer(undefined)
			initializeDataLayer('not an object')

			expect(consoleWarnSpy).toHaveBeenCalledTimes(3)
			consoleWarnSpy.mockRestore()
		})

		it('gtag function pushes to dataLayer', () => {
			initializeDataLayer(mockWindow)

			mockWindow.gtag('test', 'arg1', 'arg2')

			expect(mockWindow.dataLayer.length).toBe(1)
		})
	})

	describe('createGtagConfig', () => {
		it('creates config with measurement ID and defaults', () => {
			const config = createGtagConfig('G-ABC123DEF4')

			expect(config.measurementId).toBe('G-ABC123DEF4')
			expect(config.config.send_page_view).toBe(true)
			expect(config.config.cookie_domain).toBe('auto')
			expect(config.config.cookie_flags).toBe('SameSite=None;Secure')
		})

		it('respects sendPageView configuration', () => {
			const config = createGtagConfig('G-ABC123DEF4', { sendPageView: false })

			expect(config.config.send_page_view).toBe(false)
		})

		it('merges custom parameters', () => {
			const config = createGtagConfig('G-ABC123DEF4', {
				customParams: {
					anonymize_ip: true,
					custom_field: 'value'
				}
			})

			expect(config.config.anonymize_ip).toBe(true)
			expect(config.config.custom_field).toBe('value')
			expect(config.config.cookie_domain).toBe('auto') // Still includes defaults
		})

		it('custom parameters can override defaults', () => {
			const config = createGtagConfig('G-ABC123DEF4', {
				customParams: {
					cookie_domain: 'example.com'
				}
			})

			expect(config.config.cookie_domain).toBe('example.com')
		})
	})

	describe('safeGtagCall', () => {
		let mockWindow
		let consoleWarnSpy
		let consoleErrorSpy

		beforeEach(() => {
			mockWindow = {
				gtag: vi.fn()
			}
			consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
			consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
		})

		afterEach(() => {
			consoleWarnSpy.mockRestore()
			consoleErrorSpy.mockRestore()
		})

		it('calls gtag with correct arguments', () => {
			const result = safeGtagCall(mockWindow, 'config', 'G-ABC123DEF4', { option: 'value' })

			expect(result).toBe(true)
			expect(mockWindow.gtag).toHaveBeenCalledWith('config', 'G-ABC123DEF4', {
				option: 'value'
			})
		})

		it('returns false when window is invalid', () => {
			const result = safeGtagCall(null, 'config', 'G-ABC123DEF4')

			expect(result).toBe(false)
			expect(consoleWarnSpy).toHaveBeenCalledWith('[Analytics] gtag is not available')
		})

		it('returns false when gtag function is missing', () => {
			delete mockWindow.gtag
			const result = safeGtagCall(mockWindow, 'config', 'G-ABC123DEF4')

			expect(result).toBe(false)
			expect(consoleWarnSpy).toHaveBeenCalledWith('[Analytics] gtag is not available')
		})

		it('catches and logs errors from gtag', () => {
			mockWindow.gtag.mockImplementation(() => {
				throw new Error('gtag error')
			})

			const result = safeGtagCall(mockWindow, 'config', 'G-ABC123DEF4')

			expect(result).toBe(false)
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'[Analytics] Error calling gtag:',
				expect.any(Error)
			)
		})
	})

	describe('trackPageView', () => {
		let mockWindow

		beforeEach(() => {
			mockWindow = {
				gtag: vi.fn()
			}
		})

		it('tracks page view with provided data', () => {
			const pageData = {
				page_path: '/about',
				page_title: 'About Page',
				page_location: 'https://example.com/about'
			}

			const result = trackPageView(mockWindow, pageData)

			expect(result).toBe(true)
			expect(mockWindow.gtag).toHaveBeenCalledWith('event', 'page_view', pageData)
		})

		it('handles missing page data gracefully', () => {
			const result = trackPageView(mockWindow)

			expect(result).toBe(true)
			expect(mockWindow.gtag).toHaveBeenCalledWith('event', 'page_view', {
				page_path: undefined,
				page_title: undefined,
				page_location: undefined
			})
		})

		it('handles partial page data', () => {
			const pageData = {
				page_path: '/contact'
			}

			const result = trackPageView(mockWindow, pageData)

			expect(result).toBe(true)
			expect(mockWindow.gtag).toHaveBeenCalledWith('event', 'page_view', {
				page_path: '/contact',
				page_title: undefined,
				page_location: undefined
			})
		})
	})

	describe('trackEvent', () => {
		let mockWindow
		let consoleWarnSpy

		beforeEach(() => {
			mockWindow = {
				gtag: vi.fn()
			}
			consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
		})

		afterEach(() => {
			consoleWarnSpy.mockRestore()
		})

		it('tracks custom event with parameters', () => {
			const result = trackEvent(mockWindow, 'button_click', {
				button_name: 'subscribe',
				value: 1
			})

			expect(result).toBe(true)
			expect(mockWindow.gtag).toHaveBeenCalledWith('event', 'button_click', {
				button_name: 'subscribe',
				value: 1
			})
		})

		it('tracks event without parameters', () => {
			const result = trackEvent(mockWindow, 'page_load')

			expect(result).toBe(true)
			expect(mockWindow.gtag).toHaveBeenCalledWith('event', 'page_load', {})
		})

		it('returns false for invalid event name', () => {
			expect(trackEvent(mockWindow, '')).toBe(false)
			expect(trackEvent(mockWindow, null)).toBe(false)
			expect(trackEvent(mockWindow, 123)).toBe(false)

			expect(consoleWarnSpy).toHaveBeenCalledTimes(3)
		})

		it('handles empty parameters object', () => {
			const result = trackEvent(mockWindow, 'test_event', {})

			expect(result).toBe(true)
			expect(mockWindow.gtag).toHaveBeenCalledWith('event', 'test_event', {})
		})
	})

	describe('getPageData', () => {
		it('extracts page data from window and document', () => {
			const mockWindow = {
				location: {
					pathname: '/test-page',
					href: 'https://example.com/test-page'
				}
			}
			const mockDocument = {
				title: 'Test Page Title'
			}

			const pageData = getPageData(mockWindow, mockDocument)

			expect(pageData).toEqual({
				page_path: '/test-page',
				page_title: 'Test Page Title',
				page_location: 'https://example.com/test-page'
			})
		})

		it('returns default values when window is invalid', () => {
			const pageData = getPageData(null, null)

			expect(pageData).toEqual({
				page_path: '/',
				page_title: 'Unknown',
				page_location: ''
			})
		})

		it('returns default values when location is missing', () => {
			const mockWindow = {}
			const mockDocument = { title: 'Test' }

			const pageData = getPageData(mockWindow, mockDocument)

			expect(pageData).toEqual({
				page_path: '/',
				page_title: 'Unknown',
				page_location: ''
			})
		})

		it('returns default values when document is missing', () => {
			const mockWindow = {
				location: {
					pathname: '/test',
					href: 'https://example.com/test'
				}
			}

			const pageData = getPageData(mockWindow, null)

			expect(pageData).toEqual({
				page_path: '/',
				page_title: 'Unknown',
				page_location: ''
			})
		})
	})
})
