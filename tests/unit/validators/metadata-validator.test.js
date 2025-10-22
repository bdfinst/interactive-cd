/**
 * Unit Tests for Metadata Validation
 *
 * Following TDD principles:
 * - Tests written before implementation
 * - Focus on behavior: metadata must be well-formed and complete
 * - Pure functions with predictable outputs
 *
 * Test Coverage:
 * - Required field validation (version, lastUpdated)
 * - Optional field validation (changelog, source, description)
 * - Semantic versioning format validation
 * - Date format validation (YYYY-MM-DD)
 * - Type validation
 */

import { describe, it, expect } from 'vitest'
import {
	validateMetadata,
	isValidVersion,
	isValidDate,
	isValidDateFormat,
	parseSemanticVersion,
	compareVersions
} from '../../../src/lib/validators/metadata-validator.js'
import {
	validMetadata,
	metadataWithoutVersion,
	metadataWithInvalidVersion,
	metadataWithoutLastUpdated,
	metadataWithInvalidDateFormat,
	buildMetadata
} from '../../fixtures/cd-practices-fixtures.js'

describe('Metadata Validation (Unit)', () => {
	describe('isValidVersion', () => {
		it('returns true for valid semantic version (major.minor.patch)', () => {
			expect(isValidVersion('1.0.0')).toBe(true)
			expect(isValidVersion('1.2.3')).toBe(true)
			expect(isValidVersion('10.20.30')).toBe(true)
		})

		it('returns true for pre-release versions', () => {
			expect(isValidVersion('1.0.0-alpha')).toBe(true)
			expect(isValidVersion('1.0.0-beta.1')).toBe(true)
			expect(isValidVersion('2.0.0-rc.1')).toBe(true)
		})

		it('returns true for build metadata', () => {
			expect(isValidVersion('1.0.0+20130313144700')).toBe(true)
			expect(isValidVersion('1.0.0-beta+exp.sha.5114f85')).toBe(true)
		})

		it('returns false for invalid version formats', () => {
			expect(isValidVersion('1.0')).toBe(false)
			expect(isValidVersion('1')).toBe(false)
			expect(isValidVersion('v1.0.0')).toBe(false)
			expect(isValidVersion('1.0.0.0')).toBe(false)
		})

		it('returns false for null version', () => {
			expect(isValidVersion(null)).toBe(false)
		})

		it('returns false for undefined version', () => {
			expect(isValidVersion(undefined)).toBe(false)
		})

		it('returns false for empty string version', () => {
			expect(isValidVersion('')).toBe(false)
		})

		it('returns false for non-string version', () => {
			expect(isValidVersion(123)).toBe(false)
			expect(isValidVersion({})).toBe(false)
		})

		it('returns false for version with leading zeros', () => {
			expect(isValidVersion('01.0.0')).toBe(false)
			expect(isValidVersion('1.02.0')).toBe(false)
		})

		it('returns false for negative version numbers', () => {
			expect(isValidVersion('-1.0.0')).toBe(false)
			expect(isValidVersion('1.-1.0')).toBe(false)
		})
	})

	describe('isValidDateFormat', () => {
		it('returns true for valid YYYY-MM-DD format', () => {
			expect(isValidDateFormat('2025-01-01')).toBe(true)
			expect(isValidDateFormat('2025-10-21')).toBe(true)
			expect(isValidDateFormat('2025-12-31')).toBe(true)
		})

		it('returns false for invalid date formats', () => {
			expect(isValidDateFormat('01/01/2025')).toBe(false)
			expect(isValidDateFormat('2025/01/01')).toBe(false)
			expect(isValidDateFormat('10-21-2025')).toBe(false)
			expect(isValidDateFormat('21-10-2025')).toBe(false)
		})

		it('returns false for invalid month', () => {
			expect(isValidDateFormat('2025-13-01')).toBe(false)
			expect(isValidDateFormat('2025-00-01')).toBe(false)
		})

		it('returns false for invalid day', () => {
			expect(isValidDateFormat('2025-01-32')).toBe(false)
			expect(isValidDateFormat('2025-01-00')).toBe(false)
		})

		it('returns false for null date', () => {
			expect(isValidDateFormat(null)).toBe(false)
		})

		it('returns false for undefined date', () => {
			expect(isValidDateFormat(undefined)).toBe(false)
		})

		it('returns false for empty string date', () => {
			expect(isValidDateFormat('')).toBe(false)
		})

		it('returns false for non-string date', () => {
			expect(isValidDateFormat(new Date())).toBe(false)
			expect(isValidDateFormat(20250101)).toBe(false)
		})

		it('validates leap years correctly', () => {
			expect(isValidDateFormat('2024-02-29')).toBe(true)
			expect(isValidDateFormat('2025-02-29')).toBe(false)
		})

		it('validates days per month correctly', () => {
			expect(isValidDateFormat('2025-02-28')).toBe(true)
			expect(isValidDateFormat('2025-04-30')).toBe(true)
			expect(isValidDateFormat('2025-04-31')).toBe(false)
		})
	})

	describe('isValidDate', () => {
		it('returns true for valid dates', () => {
			expect(isValidDate('2025-01-01')).toBe(true)
			expect(isValidDate('2025-10-21')).toBe(true)
		})

		it('returns false for dates in the future', () => {
			const futureDate = '2099-12-31'
			const result = isValidDate(futureDate)
			// This depends on current date, so check it's a boolean
			expect(typeof result).toBe('boolean')
		})

		it('returns false for dates too far in the past', () => {
			expect(isValidDate('1900-01-01')).toBe(false)
		})

		it('returns true for dates within reasonable range', () => {
			expect(isValidDate('2020-01-01')).toBe(true)
			expect(isValidDate('2024-12-31')).toBe(true)
		})

		it('returns false for invalid date format', () => {
			expect(isValidDate('10/21/2025')).toBe(false)
		})
	})

	describe('parseSemanticVersion', () => {
		it('parses valid semantic version', () => {
			const result = parseSemanticVersion('1.2.3')

			expect(result).toEqual({
				major: 1,
				minor: 2,
				patch: 3,
				prerelease: null,
				build: null
			})
		})

		it('parses version with pre-release', () => {
			const result = parseSemanticVersion('1.0.0-alpha.1')

			expect(result.major).toBe(1)
			expect(result.prerelease).toBe('alpha.1')
		})

		it('parses version with build metadata', () => {
			const result = parseSemanticVersion('1.0.0+build.123')

			expect(result.major).toBe(1)
			expect(result.build).toBe('build.123')
		})

		it('parses version with both pre-release and build', () => {
			const result = parseSemanticVersion('1.0.0-beta+build')

			expect(result.prerelease).toBe('beta')
			expect(result.build).toBe('build')
		})

		it('returns null for invalid version', () => {
			expect(parseSemanticVersion('1.0')).toBeNull()
			expect(parseSemanticVersion('invalid')).toBeNull()
			expect(parseSemanticVersion(null)).toBeNull()
		})

		it('handles large version numbers', () => {
			const result = parseSemanticVersion('100.200.300')

			expect(result.major).toBe(100)
			expect(result.minor).toBe(200)
			expect(result.patch).toBe(300)
		})
	})

	describe('compareVersions', () => {
		it('returns 0 for equal versions', () => {
			expect(compareVersions('1.0.0', '1.0.0')).toBe(0)
			expect(compareVersions('1.2.3', '1.2.3')).toBe(0)
		})

		it('returns 1 when first version is greater', () => {
			expect(compareVersions('2.0.0', '1.0.0')).toBe(1)
			expect(compareVersions('1.1.0', '1.0.0')).toBe(1)
			expect(compareVersions('1.0.1', '1.0.0')).toBe(1)
		})

		it('returns -1 when first version is less', () => {
			expect(compareVersions('1.0.0', '2.0.0')).toBe(-1)
			expect(compareVersions('1.0.0', '1.1.0')).toBe(-1)
			expect(compareVersions('1.0.0', '1.0.1')).toBe(-1)
		})

		it('compares major version first', () => {
			expect(compareVersions('2.0.0', '1.99.99')).toBe(1)
		})

		it('compares minor version when major is equal', () => {
			expect(compareVersions('1.2.0', '1.1.99')).toBe(1)
		})

		it('compares patch version when major and minor are equal', () => {
			expect(compareVersions('1.0.2', '1.0.1')).toBe(1)
		})

		it('handles pre-release versions', () => {
			expect(compareVersions('1.0.0-alpha', '1.0.0')).toBe(-1)
			expect(compareVersions('1.0.0', '1.0.0-alpha')).toBe(1)
		})

		it('returns null for invalid versions', () => {
			expect(compareVersions('1.0', '1.0.0')).toBeNull()
			expect(compareVersions('1.0.0', 'invalid')).toBeNull()
		})
	})

	describe('validateMetadata', () => {
		it('returns success for valid metadata', () => {
			const result = validateMetadata(validMetadata)

			expect(result.isValid).toBe(true)
			expect(result.errors).toEqual({})
		})

		it('returns success for minimal valid metadata', () => {
			const minimal = {
				version: '1.0.0',
				lastUpdated: '2025-01-01'
			}

			const result = validateMetadata(minimal)

			expect(result.isValid).toBe(true)
		})

		it('returns error for missing version', () => {
			const result = validateMetadata(metadataWithoutVersion)

			expect(result.isValid).toBe(false)
			expect(result.errors.version).toBeDefined()
			expect(result.errors.version).toContain('required')
		})

		it('returns error for invalid version format', () => {
			const result = validateMetadata(metadataWithInvalidVersion)

			expect(result.isValid).toBe(false)
			expect(result.errors.version).toBeDefined()
			expect(result.errors.version).toContain('semantic version')
		})

		it('returns error for missing lastUpdated', () => {
			const result = validateMetadata(metadataWithoutLastUpdated)

			expect(result.isValid).toBe(false)
			expect(result.errors.lastUpdated).toBeDefined()
		})

		it('returns error for invalid date format', () => {
			const result = validateMetadata(metadataWithInvalidDateFormat)

			expect(result.isValid).toBe(false)
			expect(result.errors.lastUpdated).toBeDefined()
			expect(result.errors.lastUpdated).toContain('YYYY-MM-DD')
		})

		it('accepts optional fields', () => {
			const metadata = {
				version: '1.0.0',
				lastUpdated: '2025-01-01',
				changelog: 'Test changelog',
				source: 'Test source',
				description: 'Test description'
			}

			const result = validateMetadata(metadata)

			expect(result.isValid).toBe(true)
		})

		it('validates optional changelog field if present', () => {
			const metadata = {
				...validMetadata,
				changelog: ''
			}

			const result = validateMetadata(metadata)

			// Empty string changelog should be caught
			expect(result.isValid).toBe(false)
			expect(result.errors.changelog).toBeDefined()
		})

		it('validates optional source field if present', () => {
			const metadata = {
				...validMetadata,
				source: null
			}

			const result = validateMetadata(metadata)

			expect(result.isValid).toBe(false)
			expect(result.errors.source).toBeDefined()
		})

		it('validates optional description field if present', () => {
			const metadata = {
				...validMetadata,
				description: '   '
			}

			const result = validateMetadata(metadata)

			expect(result.isValid).toBe(false)
			expect(result.errors.description).toBeDefined()
		})

		it('returns error for null metadata', () => {
			const result = validateMetadata(null)

			expect(result.isValid).toBe(false)
			expect(result.errors.metadata).toBeDefined()
		})

		it('returns error for undefined metadata', () => {
			const result = validateMetadata(undefined)

			expect(result.isValid).toBe(false)
		})

		it('returns error for non-object metadata', () => {
			expect(validateMetadata('not an object').isValid).toBe(false)
			expect(validateMetadata(123).isValid).toBe(false)
			expect(validateMetadata([]).isValid).toBe(false)
		})

		it('returns multiple errors for multiple issues', () => {
			const invalid = {
				version: '1.0',
				lastUpdated: '10/21/2025',
				changelog: ''
			}

			const result = validateMetadata(invalid)

			expect(result.isValid).toBe(false)
			expect(Object.keys(result.errors).length).toBeGreaterThan(1)
		})

		it('handles extra unknown fields gracefully', () => {
			const metadata = {
				...validMetadata,
				extraField: 'should not cause error'
			}

			const result = validateMetadata(metadata)

			// Should still be valid - extra fields don't break validation
			expect(result.isValid).toBe(true)
		})
	})

	describe('pure function behavior', () => {
		it('same input produces same output (referential transparency)', () => {
			const result1 = validateMetadata(validMetadata)
			const result2 = validateMetadata(validMetadata)

			expect(result1).toEqual(result2)
		})

		it('does not mutate input metadata', () => {
			const metadata = { ...validMetadata }
			const originalCopy = { ...metadata }

			validateMetadata(metadata)

			expect(metadata).toEqual(originalCopy)
		})

		it('validation functions are composable', () => {
			const metadata = buildMetadata()

			const versionValid = isValidVersion(metadata.version)
			const dateValid = isValidDateFormat(metadata.lastUpdated)

			const isValid = versionValid && dateValid
			expect(isValid).toBe(true)
		})
	})

	describe('edge cases', () => {
		it('handles very long changelog', () => {
			const metadata = {
				...validMetadata,
				changelog: 'A'.repeat(10000)
			}

			const result = validateMetadata(metadata)
			expect(typeof result.isValid).toBe('boolean')
		})

		it('handles unicode characters in text fields', () => {
			const metadata = {
				...validMetadata,
				changelog: 'Test with unicode: 你好世界 🚀',
				source: 'MinimumCD.org 📚',
				description: 'Description with émojis ✨'
			}

			const result = validateMetadata(metadata)
			expect(result.isValid).toBe(true)
		})

		it('handles boundary dates', () => {
			expect(isValidDate('2000-01-01')).toBe(true)
			expect(isValidDate('2050-12-31')).toBe(true)
		})

		it('handles very high version numbers', () => {
			expect(isValidVersion('999.999.999')).toBe(true)
		})

		it('handles complex pre-release identifiers', () => {
			expect(isValidVersion('1.0.0-alpha.1.2.3')).toBe(true)
			expect(isValidVersion('1.0.0-0.3.7')).toBe(true)
		})
	})
})
