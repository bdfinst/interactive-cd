import { describe, it, expect } from 'vitest'
import { PracticeId } from '$domain/practice-catalog/value-objects/PracticeId.js'
import { PracticeCategory } from '$domain/practice-catalog/value-objects/PracticeCategory.js'
import {
	createCDPractice,
	withRequirement,
	withRequirements,
	withBenefit,
	withBenefits,
	withPracticePrerequisite,
	withCapabilityPrerequisite,
	getAllPrerequisites,
	hasPrerequisites,
	getRequirementCount,
	getBenefitCount,
	pipePractice
} from '$domain/practice-catalog/entities/CDPractice.js'

describe('CDPractice (Functional)', () => {
	const validId = PracticeId.from('continuous-integration')
	const validCategory = PracticeCategory.BEHAVIOR

	describe('createCDPractice', () => {
		it('creates an immutable practice', () => {
			const practice = createCDPractice(
				validId,
				'Continuous Integration',
				validCategory,
				'Build and test on every commit'
			)

			expect(practice.id).toBe(validId)
			expect(practice.name).toBe('Continuous Integration')
			expect(practice.category).toBe(validCategory)
			expect(practice.description).toBe('Build and test on every commit')
			expect(Object.isFrozen(practice)).toBe(true)
		})

		it('trims name and description', () => {
			const practice = createCDPractice(
				validId,
				'  Continuous Integration  ',
				validCategory,
				'  Description  '
			)

			expect(practice.name).toBe('Continuous Integration')
			expect(practice.description).toBe('Description')
		})

		it('throws error for missing required fields', () => {
			expect(() => createCDPractice(null, 'Name', validCategory, 'Desc')).toThrow(
				'Practice ID is required'
			)
			expect(() => createCDPractice(validId, '', validCategory, 'Desc')).toThrow(
				'Practice name is required'
			)
			expect(() => createCDPractice(validId, 'Name', null, 'Desc')).toThrow(
				'Practice category is required'
			)
			expect(() => createCDPractice(validId, 'Name', validCategory, '')).toThrow(
				'Practice description is required'
			)
		})

		it('initializes empty arrays', () => {
			const practice = createCDPractice(validId, 'Name', validCategory, 'Description')

			expect(practice.requirements).toEqual([])
			expect(practice.benefits).toEqual([])
			expect(practice.practicePrerequisites).toEqual([])
			expect(practice.capabilityPrerequisites).toEqual([])
		})
	})

	describe('immutability', () => {
		it('cannot modify practice after creation', () => {
			const practice = createCDPractice(validId, 'Name', validCategory, 'Description')

			expect(() => {
				practice.name = 'New Name'
			}).toThrow()
		})

		it('freezes all arrays', () => {
			const practice = createCDPractice(validId, 'Name', validCategory, 'Description')

			expect(Object.isFrozen(practice.requirements)).toBe(true)
			expect(Object.isFrozen(practice.benefits)).toBe(true)
			expect(Object.isFrozen(practice.practicePrerequisites)).toBe(true)
			expect(Object.isFrozen(practice.capabilityPrerequisites)).toBe(true)
		})
	})

	describe('withRequirement', () => {
		it('returns new practice with requirement added', () => {
			const practice = createCDPractice(validId, 'Name', validCategory, 'Description')
			const updated = withRequirement(practice, 'Must have automated tests')

			// Original unchanged
			expect(practice.requirements).toEqual([])
			// New practice has requirement
			expect(updated.requirements).toEqual(['Must have automated tests'])
			// Returns new object
			expect(updated).not.toBe(practice)
		})

		it('trims requirement text', () => {
			const practice = createCDPractice(validId, 'Name', validCategory, 'Description')
			const updated = withRequirement(practice, '  Must have tests  ')

			expect(updated.requirements).toEqual(['Must have tests'])
		})

		it('throws error for empty requirement', () => {
			const practice = createCDPractice(validId, 'Name', validCategory, 'Description')

			expect(() => withRequirement(practice, '')).toThrow('Requirement is required')
			expect(() => withRequirement(practice, '   ')).toThrow('Requirement is required')
		})
	})

	describe('withRequirements', () => {
		it('adds multiple requirements at once', () => {
			const practice = createCDPractice(validId, 'Name', validCategory, 'Description')
			const requirements = ['Req 1', 'Req 2', 'Req 3']
			const updated = withRequirements(practice, requirements)

			expect(updated.requirements).toEqual(['Req 1', 'Req 2', 'Req 3'])
			expect(practice.requirements).toEqual([])
		})
	})

	describe('withBenefit', () => {
		it('returns new practice with benefit added', () => {
			const practice = createCDPractice(validId, 'Name', validCategory, 'Description')
			const updated = withBenefit(practice, 'Faster feedback')

			expect(practice.benefits).toEqual([])
			expect(updated.benefits).toEqual(['Faster feedback'])
			expect(updated).not.toBe(practice)
		})

		it('throws error for empty benefit', () => {
			const practice = createCDPractice(validId, 'Name', validCategory, 'Description')

			expect(() => withBenefit(practice, '')).toThrow('Benefit is required')
		})
	})

	describe('withBenefits', () => {
		it('adds multiple benefits at once', () => {
			const practice = createCDPractice(validId, 'Name', validCategory, 'Description')
			const benefits = ['Benefit 1', 'Benefit 2']
			const updated = withBenefits(practice, benefits)

			expect(updated.benefits).toEqual(['Benefit 1', 'Benefit 2'])
		})
	})

	describe('withPracticePrerequisite', () => {
		it('returns new practice with practice prerequisite', () => {
			const practice = createCDPractice(validId, 'Name', validCategory, 'Description')
			const prereqId = PracticeId.from('version-control')
			const updated = withPracticePrerequisite(practice, prereqId, 'Need source control')

			expect(practice.practicePrerequisites).toEqual([])
			expect(updated.practicePrerequisites).toEqual([
				{ practiceId: prereqId, rationale: 'Need source control' }
			])
		})

		it('throws error for missing fields', () => {
			const practice = createCDPractice(validId, 'Name', validCategory, 'Description')

			expect(() => withPracticePrerequisite(practice, null, 'Rationale')).toThrow(
				'Practice ID is required'
			)
			expect(() => withPracticePrerequisite(practice, PracticeId.from('test'), '')).toThrow(
				'Rationale is required'
			)
		})
	})

	describe('withCapabilityPrerequisite', () => {
		it('returns new practice with capability prerequisite', () => {
			const practice = createCDPractice(validId, 'Name', validCategory, 'Description')
			const updated = withCapabilityPrerequisite(
				practice,
				'ci-cd-pipeline',
				'Need automated pipeline'
			)

			expect(practice.capabilityPrerequisites).toEqual([])
			expect(updated.capabilityPrerequisites).toEqual([
				{ capabilityId: 'ci-cd-pipeline', rationale: 'Need automated pipeline' }
			])
		})
	})

	describe('query functions', () => {
		it('getAllPrerequisites combines both types', () => {
			const practice = createCDPractice(validId, 'Name', validCategory, 'Description', {
				practicePrerequisites: [{ practiceId: validId, rationale: 'Test' }],
				capabilityPrerequisites: [{ capabilityId: 'test-cap', rationale: 'Test' }]
			})

			const all = getAllPrerequisites(practice)
			expect(all.length).toBe(2)
		})

		it('hasPrerequisites returns true when prerequisites exist', () => {
			const withPrereq = createCDPractice(validId, 'Name', validCategory, 'Description', {
				practicePrerequisites: [{ practiceId: validId, rationale: 'Test' }]
			})
			const withoutPrereq = createCDPractice(validId, 'Name', validCategory, 'Description')

			expect(hasPrerequisites(withPrereq)).toBe(true)
			expect(hasPrerequisites(withoutPrereq)).toBe(false)
		})

		it('getRequirementCount returns count', () => {
			const practice = createCDPractice(validId, 'Name', validCategory, 'Description', {
				requirements: ['Req 1', 'Req 2', 'Req 3']
			})

			expect(getRequirementCount(practice)).toBe(3)
		})

		it('getBenefitCount returns count', () => {
			const practice = createCDPractice(validId, 'Name', validCategory, 'Description', {
				benefits: ['Benefit 1', 'Benefit 2']
			})

			expect(getBenefitCount(practice)).toBe(2)
		})
	})

	describe('composition', () => {
		it('pipePractice composes transformations left-to-right', () => {
			const practice = createCDPractice(validId, 'Name', validCategory, 'Description')

			const transform = pipePractice(
				p => withRequirement(p, 'Req 1'),
				p => withRequirement(p, 'Req 2'),
				p => withBenefit(p, 'Benefit 1')
			)

			const result = transform(practice)

			expect(result.requirements).toEqual(['Req 1', 'Req 2'])
			expect(result.benefits).toEqual(['Benefit 1'])
			expect(practice.requirements).toEqual([]) // Original unchanged
		})

		it('allows chaining transformations', () => {
			const practice = createCDPractice(validId, 'Name', validCategory, 'Description')

			const result = pipePractice(
				p => withRequirement(p, 'Must have tests'),
				p => withBenefit(p, 'Faster feedback'),
				p => withBenefit(p, 'Better quality')
			)(practice)

			expect(result.requirements.length).toBe(1)
			expect(result.benefits.length).toBe(2)
		})
	})

	describe('referential transparency', () => {
		it('same inputs always produce same outputs', () => {
			const practice1 = createCDPractice(validId, 'Name', validCategory, 'Description')
			const practice2 = createCDPractice(validId, 'Name', validCategory, 'Description')

			expect(practice1).toEqual(practice2)

			const updated1 = withRequirement(practice1, 'Test requirement')
			const updated2 = withRequirement(practice2, 'Test requirement')

			expect(updated1).toEqual(updated2)
		})
	})
})
