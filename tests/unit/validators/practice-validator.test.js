/**
 * Unit Tests for Practice Validation
 *
 * Following TDD principles:
 * - Tests written before implementation
 * - Focus on behavior, not implementation
 * - Pure functions with predictable outputs
 * - AAA pattern (Arrange, Act, Assert)
 *
 * Test Coverage:
 * - Required field validation
 * - Type validation
 * - Format validation
 * - Empty/null/undefined handling
 * - Enum validation (type, category)
 */

import { describe, it, expect } from 'vitest'
import {
	validatePractice,
	isValidPracticeId,
	isValidPracticeName,
	isValidPracticeType,
	isValidPracticeCategory,
	isValidPracticeDescription,
	isValidRequirements,
	isValidBenefits,
	validatePracticeFields
} from '../../../src/lib/validators/practice-validator.js'
import {
	validPractice,
	validRootPractice,
	minimalValidPractice,
	practiceWithoutId,
	practiceWithoutName,
	practiceWithoutType,
	practiceWithoutCategory,
	practiceWithoutDescription,
	practiceWithoutRequirements,
	practiceWithoutBenefits,
	practiceWithNullId,
	practiceWithEmptyId,
	practiceWithWhitespaceId,
	practiceWithNumberId,
	practiceWithInvalidType,
	practiceWithInvalidCategory,
	practiceWithNonArrayRequirements,
	practiceWithEmptyRequirements,
	practiceWithNullRequirement,
	practiceWithEmptyStringRequirement,
	practiceWithNonArrayBenefits,
	practiceWithEmptyBenefits,
	practiceWithNullBenefit,
	practiceWithUnicodeCharacters,
	practiceWithVeryLongStrings,
	buildPractice,
	VALID_TYPES,
	VALID_CATEGORIES
} from '../../fixtures/cd-practices-fixtures.js'

describe('Practice Validation (Unit)', () => {
	describe('isValidPracticeId', () => {
		it('returns true for valid practice ID', () => {
			// Arrange
			const validId = 'continuous-integration'

			// Act
			const result = isValidPracticeId(validId)

			// Assert
			expect(result).toBe(true)
		})

		it('returns true for ID with numbers', () => {
			const result = isValidPracticeId('test-practice-123')
			expect(result).toBe(true)
		})

		it('returns false for null ID', () => {
			const result = isValidPracticeId(null)
			expect(result).toBe(false)
		})

		it('returns false for undefined ID', () => {
			const result = isValidPracticeId(undefined)
			expect(result).toBe(false)
		})

		it('returns false for empty string ID', () => {
			const result = isValidPracticeId('')
			expect(result).toBe(false)
		})

		it('returns false for whitespace-only ID', () => {
			const result = isValidPracticeId('   ')
			expect(result).toBe(false)
		})

		it('returns false for non-string ID', () => {
			expect(isValidPracticeId(123)).toBe(false)
			expect(isValidPracticeId({})).toBe(false)
			expect(isValidPracticeId([])).toBe(false)
		})

		it('returns true for ID with kebab-case format', () => {
			expect(isValidPracticeId('my-test-practice')).toBe(true)
		})

		it('handles IDs with special characters gracefully', () => {
			// This tests edge case - special chars may or may not be valid
			// depending on business rules
			const result = isValidPracticeId('test@practice')
			expect(typeof result).toBe('boolean')
		})
	})

	describe('isValidPracticeName', () => {
		it('returns true for valid practice name', () => {
			const result = isValidPracticeName('Continuous Integration')
			expect(result).toBe(true)
		})

		it('returns false for null name', () => {
			expect(isValidPracticeName(null)).toBe(false)
		})

		it('returns false for undefined name', () => {
			expect(isValidPracticeName(undefined)).toBe(false)
		})

		it('returns false for empty string name', () => {
			expect(isValidPracticeName('')).toBe(false)
		})

		it('returns false for whitespace-only name', () => {
			expect(isValidPracticeName('   ')).toBe(false)
		})

		it('returns false for non-string name', () => {
			expect(isValidPracticeName(123)).toBe(false)
			expect(isValidPracticeName({})).toBe(false)
		})

		it('returns true for name with special characters', () => {
			expect(isValidPracticeName('API Management & Security')).toBe(true)
		})

		it('returns true for name with numbers', () => {
			expect(isValidPracticeName('Test Practice 123')).toBe(true)
		})
	})

	describe('isValidPracticeType', () => {
		it('returns true for "practice" type', () => {
			const result = isValidPracticeType('practice')
			expect(result).toBe(true)
		})

		it('returns true for "root" type', () => {
			const result = isValidPracticeType('root')
			expect(result).toBe(true)
		})

		it('returns false for invalid type', () => {
			expect(isValidPracticeType('invalid')).toBe(false)
			expect(isValidPracticeType('capability')).toBe(false)
		})

		it('returns false for null type', () => {
			expect(isValidPracticeType(null)).toBe(false)
		})

		it('returns false for undefined type', () => {
			expect(isValidPracticeType(undefined)).toBe(false)
		})

		it('returns false for non-string type', () => {
			expect(isValidPracticeType(123)).toBe(false)
		})

		it('is case-sensitive', () => {
			expect(isValidPracticeType('Practice')).toBe(false)
			expect(isValidPracticeType('PRACTICE')).toBe(false)
		})

		it('validates against all known types', () => {
			VALID_TYPES.forEach(type => {
				expect(isValidPracticeType(type)).toBe(true)
			})
		})
	})

	describe('isValidPracticeCategory', () => {
		it('returns true for "automation" category', () => {
			expect(isValidPracticeCategory('automation')).toBe(true)
		})

		it('returns true for "behavior" category', () => {
			expect(isValidPracticeCategory('behavior')).toBe(true)
		})

		it('returns true for "behavior-enabled-automation" category', () => {
			expect(isValidPracticeCategory('behavior-enabled-automation')).toBe(true)
		})

		it('returns true for "core" category', () => {
			expect(isValidPracticeCategory('core')).toBe(true)
		})

		it('returns false for invalid category', () => {
			expect(isValidPracticeCategory('invalid')).toBe(false)
			expect(isValidPracticeCategory('process')).toBe(false)
		})

		it('returns false for null category', () => {
			expect(isValidPracticeCategory(null)).toBe(false)
		})

		it('returns false for undefined category', () => {
			expect(isValidPracticeCategory(undefined)).toBe(false)
		})

		it('is case-sensitive', () => {
			expect(isValidPracticeCategory('Automation')).toBe(false)
		})

		it('validates against all known categories', () => {
			VALID_CATEGORIES.forEach(category => {
				expect(isValidPracticeCategory(category)).toBe(true)
			})
		})
	})

	describe('isValidPracticeDescription', () => {
		it('returns true for valid description', () => {
			const desc = 'This is a valid practice description.'
			expect(isValidPracticeDescription(desc)).toBe(true)
		})

		it('returns false for null description', () => {
			expect(isValidPracticeDescription(null)).toBe(false)
		})

		it('returns false for undefined description', () => {
			expect(isValidPracticeDescription(undefined)).toBe(false)
		})

		it('returns false for empty string description', () => {
			expect(isValidPracticeDescription('')).toBe(false)
		})

		it('returns false for whitespace-only description', () => {
			expect(isValidPracticeDescription('   ')).toBe(false)
		})

		it('returns false for non-string description', () => {
			expect(isValidPracticeDescription(123)).toBe(false)
		})

		it('returns true for long description', () => {
			const longDesc = 'A'.repeat(1000)
			expect(isValidPracticeDescription(longDesc)).toBe(true)
		})

		it('returns true for description with unicode characters', () => {
			const desc = 'Test with unicode: 你好世界 🚀'
			expect(isValidPracticeDescription(desc)).toBe(true)
		})
	})

	describe('isValidRequirements', () => {
		it('returns true for valid requirements array', () => {
			const requirements = ['Requirement 1', 'Requirement 2']
			expect(isValidRequirements(requirements)).toBe(true)
		})

		it('returns true for single requirement', () => {
			expect(isValidRequirements(['Single requirement'])).toBe(true)
		})

		it('returns false for null requirements', () => {
			expect(isValidRequirements(null)).toBe(false)
		})

		it('returns false for undefined requirements', () => {
			expect(isValidRequirements(undefined)).toBe(false)
		})

		it('returns false for non-array requirements', () => {
			expect(isValidRequirements('Not an array')).toBe(false)
			expect(isValidRequirements({})).toBe(false)
		})

		it('returns false for empty array', () => {
			expect(isValidRequirements([])).toBe(false)
		})

		it('returns false when array contains null', () => {
			expect(isValidRequirements(['Valid', null, 'Another'])).toBe(false)
		})

		it('returns false when array contains empty string', () => {
			expect(isValidRequirements(['Valid', '', 'Another'])).toBe(false)
		})

		it('returns false when array contains whitespace-only string', () => {
			expect(isValidRequirements(['Valid', '   ', 'Another'])).toBe(false)
		})

		it('returns false when array contains non-string', () => {
			expect(isValidRequirements(['Valid', 123, 'Another'])).toBe(false)
		})

		it('returns true for requirements with special characters', () => {
			const reqs = ['Use API & Security', 'Monitor 24/7']
			expect(isValidRequirements(reqs)).toBe(true)
		})
	})

	describe('isValidBenefits', () => {
		it('returns true for valid benefits array', () => {
			const benefits = ['Benefit 1', 'Benefit 2']
			expect(isValidBenefits(benefits)).toBe(true)
		})

		it('returns true for single benefit', () => {
			expect(isValidBenefits(['Single benefit'])).toBe(true)
		})

		it('returns false for null benefits', () => {
			expect(isValidBenefits(null)).toBe(false)
		})

		it('returns false for undefined benefits', () => {
			expect(isValidBenefits(undefined)).toBe(false)
		})

		it('returns false for non-array benefits', () => {
			expect(isValidBenefits('Not an array')).toBe(false)
		})

		it('returns false for empty array', () => {
			expect(isValidBenefits([])).toBe(false)
		})

		it('returns false when array contains null', () => {
			expect(isValidBenefits(['Valid', null])).toBe(false)
		})

		it('returns false when array contains empty string', () => {
			expect(isValidBenefits(['Valid', ''])).toBe(false)
		})

		it('returns false when array contains non-string', () => {
			expect(isValidBenefits(['Valid', 123])).toBe(false)
		})
	})

	describe('validatePracticeFields', () => {
		it('returns empty errors object for valid practice', () => {
			const result = validatePracticeFields(validPractice)

			expect(result.isValid).toBe(true)
			expect(result.errors).toEqual({})
		})

		it('returns error for missing id', () => {
			const result = validatePracticeFields(practiceWithoutId)

			expect(result.isValid).toBe(false)
			expect(result.errors.id).toBeDefined()
			expect(result.errors.id).toContain('required')
		})

		it('returns error for missing name', () => {
			const result = validatePracticeFields(practiceWithoutName)

			expect(result.isValid).toBe(false)
			expect(result.errors.name).toBeDefined()
		})

		it('returns error for missing type', () => {
			const result = validatePracticeFields(practiceWithoutType)

			expect(result.isValid).toBe(false)
			expect(result.errors.type).toBeDefined()
		})

		it('returns error for missing category', () => {
			const result = validatePracticeFields(practiceWithoutCategory)

			expect(result.isValid).toBe(false)
			expect(result.errors.category).toBeDefined()
		})

		it('returns error for missing description', () => {
			const result = validatePracticeFields(practiceWithoutDescription)

			expect(result.isValid).toBe(false)
			expect(result.errors.description).toBeDefined()
		})

		it('returns error for missing requirements', () => {
			const result = validatePracticeFields(practiceWithoutRequirements)

			expect(result.isValid).toBe(false)
			expect(result.errors.requirements).toBeDefined()
		})

		it('returns error for missing benefits', () => {
			const result = validatePracticeFields(practiceWithoutBenefits)

			expect(result.isValid).toBe(false)
			expect(result.errors.benefits).toBeDefined()
		})

		it('returns multiple errors for multiple invalid fields', () => {
			const invalidPractice = {
				id: '',
				name: '',
				type: 'invalid',
				category: 'invalid',
				description: '',
				requirements: [],
				benefits: []
			}
			const result = validatePracticeFields(invalidPractice)

			expect(result.isValid).toBe(false)
			expect(Object.keys(result.errors).length).toBeGreaterThan(1)
		})

		it('validates root type practice correctly', () => {
			const result = validatePracticeFields(validRootPractice)

			expect(result.isValid).toBe(true)
			expect(result.errors).toEqual({})
		})

		it('handles unicode characters in fields', () => {
			const result = validatePracticeFields(practiceWithUnicodeCharacters)

			expect(result.isValid).toBe(true)
		})
	})

	describe('validatePractice', () => {
		it('returns success for valid practice object', () => {
			const result = validatePractice(validPractice)

			expect(result.isValid).toBe(true)
			expect(result.errors).toEqual({})
			expect(result.practice).toEqual(validPractice)
		})

		it('returns success for minimal valid practice', () => {
			const result = validatePractice(minimalValidPractice)

			expect(result.isValid).toBe(true)
		})

		it('returns error for null practice', () => {
			const result = validatePractice(null)

			expect(result.isValid).toBe(false)
			expect(result.errors.practice).toBeDefined()
		})

		it('returns error for undefined practice', () => {
			const result = validatePractice(undefined)

			expect(result.isValid).toBe(false)
		})

		it('returns error for non-object practice', () => {
			expect(validatePractice('not an object').isValid).toBe(false)
			expect(validatePractice(123).isValid).toBe(false)
			expect(validatePractice([]).isValid).toBe(false)
		})

		it('returns detailed error messages', () => {
			const result = validatePractice(practiceWithInvalidType)

			expect(result.isValid).toBe(false)
			expect(result.errors.type).toContain('practice')
			expect(result.errors.type).toContain('root')
		})

		it('preserves original practice object', () => {
			const original = { ...validPractice }
			validatePractice(validPractice)

			expect(validPractice).toEqual(original)
		})
	})

	describe('pure function behavior', () => {
		it('same input produces same output (referential transparency)', () => {
			const result1 = validatePractice(validPractice)
			const result2 = validatePractice(validPractice)

			expect(result1).toEqual(result2)
		})

		it('does not mutate input', () => {
			const practice = { ...validPractice }
			const originalCopy = { ...practice }

			validatePractice(practice)

			expect(practice).toEqual(originalCopy)
		})

		it('validation functions are composable', () => {
			const practice = buildPractice()

			const idValid = isValidPracticeId(practice.id)
			const nameValid = isValidPracticeName(practice.name)
			const typeValid = isValidPracticeType(practice.type)

			const allValid = idValid && nameValid && typeValid
			expect(allValid).toBe(true)
		})
	})

	describe('edge cases', () => {
		it('handles very long strings', () => {
			const result = validatePractice(practiceWithVeryLongStrings)
			// Should still validate structure correctly
			expect(typeof result.isValid).toBe('boolean')
		})

		it('handles practice with extra unknown fields', () => {
			const practiceWithExtra = {
				...validPractice,
				extraField: 'should be ignored or handled'
			}
			const result = validatePractice(practiceWithExtra)

			// Validation should focus on required fields
			expect(typeof result.isValid).toBe('boolean')
		})

		it('handles deeply nested structures gracefully', () => {
			const practiceWithNestedData = {
				...validPractice,
				nested: { deep: { structure: { value: 'test' } } }
			}

			const result = validatePractice(practiceWithNestedData)
			expect(typeof result.isValid).toBe('boolean')
		})
	})
})
