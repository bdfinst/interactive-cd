import { describe, it, expect } from 'vitest'
import { PracticeId } from '$domain/practice-catalog/value-objects/PracticeId.js'

describe('PracticeId', () => {
	describe('from', () => {
		it('creates a PracticeId from a valid string', () => {
			const id = PracticeId.from('continuous-integration')

			expect(PracticeId.is(id)).toBe(true)
			expect(id.toString()).toBe('continuous-integration')
		})

		it('throws error when id is null', () => {
			expect(() => PracticeId.from(null)).toThrow('Practice ID cannot be empty')
		})

		it('throws error when id is undefined', () => {
			expect(() => PracticeId.from(undefined)).toThrow('Practice ID cannot be empty')
		})

		it('throws error when id is empty string', () => {
			expect(() => PracticeId.from('')).toThrow('Practice ID cannot be empty')
		})

		it('throws error when id is only whitespace', () => {
			expect(() => PracticeId.from('   ')).toThrow('Practice ID cannot be empty')
		})

		it('validates kebab-case format', () => {
			expect(() => PracticeId.from('Continuous Integration')).toThrow(
				'Practice ID must be in kebab-case format'
			)
		})

		it('validates kebab-case format with underscores', () => {
			expect(() => PracticeId.from('continuous_integration')).toThrow(
				'Practice ID must be in kebab-case format'
			)
		})

		it('accepts valid kebab-case IDs', () => {
			const validIds = [
				'continuous-delivery',
				'trunk-based-development',
				'version-control',
				'a',
				'a-b'
			]

			validIds.forEach(id => {
				expect(() => PracticeId.from(id)).not.toThrow()
			})
		})
	})

	describe('equals', () => {
		it('returns true for same ID values', () => {
			const id1 = PracticeId.from('continuous-integration')
			const id2 = PracticeId.from('continuous-integration')

			expect(id1.equals(id2)).toBe(true)
		})

		it('returns false for different ID values', () => {
			const id1 = PracticeId.from('continuous-integration')
			const id2 = PracticeId.from('continuous-delivery')

			expect(id1.equals(id2)).toBe(false)
		})

		it('returns false when comparing with null', () => {
			const id = PracticeId.from('continuous-integration')

			expect(id.equals(null)).toBe(false)
		})

		it('returns false when comparing with undefined', () => {
			const id = PracticeId.from('continuous-integration')

			expect(id.equals(undefined)).toBe(false)
		})

		it('returns false when comparing with non-PracticeId object', () => {
			const id = PracticeId.from('continuous-integration')

			expect(id.equals({ value: 'continuous-integration' })).toBe(false)
		})
	})

	describe('toString', () => {
		it('returns the string representation', () => {
			const id = PracticeId.from('continuous-integration')

			expect(id.toString()).toBe('continuous-integration')
		})
	})

	describe('immutability', () => {
		it('cannot be modified after creation', () => {
			const id = PracticeId.from('continuous-integration')

			// Attempt to modify should throw (frozen objects throw when trying to assign)
			expect(() => {
				id.value = 'something-else'
			}).toThrow()

			// Verify object is frozen
			expect(Object.isFrozen(id)).toBe(true)
		})
	})

	describe('edge cases', () => {
		it('handles very long IDs', () => {
			const longId = 'a'.repeat(100) + '-' + 'b'.repeat(100)
			const id = PracticeId.from(longId)

			expect(id.toString()).toBe(longId)
		})

		it('handles numeric-only IDs', () => {
			const id = PracticeId.from('123')

			expect(id.toString()).toBe('123')
		})

		it('rejects IDs with special characters', () => {
			const invalidIds = ['practice@test', 'practice#test', 'practice!test', 'practice.test']

			invalidIds.forEach(invalidId => {
				expect(() => PracticeId.from(invalidId)).toThrow('Practice ID must be in kebab-case format')
			})
		})

		it('accepts IDs with multiple hyphens', () => {
			const id = PracticeId.from('this-is-a-long-practice-id')

			expect(id.toString()).toBe('this-is-a-long-practice-id')
		})
	})
})
