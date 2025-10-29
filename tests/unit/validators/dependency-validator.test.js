/**
 * Unit Tests for Dependency Validation
 *
 * Following TDD principles:
 * - Tests written before implementation
 * - Focus on behavior: dependencies must link valid practices
 * - Pure functions with no side effects
 * - Test both structure and business logic validation
 *
 * Test Coverage:
 * - Required field validation (practice_id, depends_on_id)
 * - Type validation (must be strings)
 * - Business rule validation (no self-references, must reference existing practices)
 * - Circular dependency detection
 * - Duplicate dependency detection
 */

import { describe, it, expect } from 'vitest'
import {
	validateDependency,
	isValidDependencyIds,
	hasSelfReference,
	findDuplicateDependencies,
	findCircularDependencies,
	validateDependenciesAgainstPractices,
	getAllDependenciesForPractice,
	buildDependencyGraph
} from '../../../src/lib/validators/dependency-validator.js'
import {
	validDependency,
	dependencyWithoutPracticeId,
	dependencyWithoutDependsOnId,
	dependencyWithEmptyPracticeId,
	dependencyWithNonStringIds,
	dependencyWithSelfReference,
	dependencyWithNonExistentPractice,
	dependencyWithNonExistentDependency,
	dependencyWithDuplicates,
	circularDependencies,
	validPractice,
	validRootPractice,
	buildDependency,
	buildPractice
} from '../../fixtures/cd-practices-fixtures.js'

describe('Dependency Validation (Unit)', () => {
	describe('isValidDependencyIds', () => {
		it('returns true for valid dependency IDs', () => {
			const result = isValidDependencyIds('practice-a', 'practice-b')

			expect(result).toBe(true)
		})

		it('returns false for null practice_id', () => {
			expect(isValidDependencyIds(null, 'practice-b')).toBe(false)
		})

		it('returns false for undefined practice_id', () => {
			expect(isValidDependencyIds(undefined, 'practice-b')).toBe(false)
		})

		it('returns false for empty string practice_id', () => {
			expect(isValidDependencyIds('', 'practice-b')).toBe(false)
		})

		it('returns false for whitespace-only practice_id', () => {
			expect(isValidDependencyIds('   ', 'practice-b')).toBe(false)
		})

		it('returns false for null depends_on_id', () => {
			expect(isValidDependencyIds('practice-a', null)).toBe(false)
		})

		it('returns false for undefined depends_on_id', () => {
			expect(isValidDependencyIds('practice-a', undefined)).toBe(false)
		})

		it('returns false for empty string depends_on_id', () => {
			expect(isValidDependencyIds('practice-a', '')).toBe(false)
		})

		it('returns false for non-string practice_id', () => {
			expect(isValidDependencyIds(123, 'practice-b')).toBe(false)
			expect(isValidDependencyIds({}, 'practice-b')).toBe(false)
		})

		it('returns false for non-string depends_on_id', () => {
			expect(isValidDependencyIds('practice-a', 123)).toBe(false)
			expect(isValidDependencyIds('practice-a', {})).toBe(false)
		})
	})

	describe('hasSelfReference', () => {
		it('returns false when practice_id differs from depends_on_id', () => {
			const result = hasSelfReference('practice-a', 'practice-b')

			expect(result).toBe(false)
		})

		it('returns true when practice_id equals depends_on_id', () => {
			const result = hasSelfReference('practice-a', 'practice-a')

			expect(result).toBe(true)
		})

		it('is case-sensitive', () => {
			expect(hasSelfReference('Practice-A', 'practice-a')).toBe(false)
		})

		it('handles IDs with special characters', () => {
			expect(hasSelfReference('test@practice-1', 'test@practice-1')).toBe(true)
		})
	})

	describe('validateDependency', () => {
		it('returns success for valid dependency', () => {
			const result = validateDependency(validDependency)

			expect(result.isValid).toBe(true)
			expect(result.errors).toEqual({})
		})

		it('returns error for missing practice_id', () => {
			const result = validateDependency(dependencyWithoutPracticeId)

			expect(result.isValid).toBe(false)
			expect(result.errors.practice_id).toBeDefined()
			expect(result.errors.practice_id).toContain('required')
		})

		it('returns error for missing depends_on_id', () => {
			const result = validateDependency(dependencyWithoutDependsOnId)

			expect(result.isValid).toBe(false)
			expect(result.errors.depends_on_id).toBeDefined()
		})

		it('returns error for empty practice_id', () => {
			const result = validateDependency(dependencyWithEmptyPracticeId)

			expect(result.isValid).toBe(false)
			expect(result.errors.practice_id).toBeDefined()
		})

		it('returns error for non-string IDs', () => {
			const result = validateDependency(dependencyWithNonStringIds)

			expect(result.isValid).toBe(false)
			expect(result.errors.practice_id || result.errors.depends_on_id).toBeDefined()
		})

		it('returns error for self-reference', () => {
			const result = validateDependency(dependencyWithSelfReference)

			expect(result.isValid).toBe(false)
			expect(result.errors.selfReference).toBeDefined()
			expect(result.errors.selfReference).toContain('cannot depend on itself')
		})

		it('returns error for null dependency', () => {
			const result = validateDependency(null)

			expect(result.isValid).toBe(false)
			expect(result.errors.dependency).toBeDefined()
		})

		it('returns error for undefined dependency', () => {
			const result = validateDependency(undefined)

			expect(result.isValid).toBe(false)
		})

		it('returns error for non-object dependency', () => {
			expect(validateDependency('not an object').isValid).toBe(false)
			expect(validateDependency(123).isValid).toBe(false)
			expect(validateDependency([]).isValid).toBe(false)
		})

		it('returns multiple errors for multiple issues', () => {
			const invalidDependency = {
				practice_id: '',
				depends_on_id: ''
			}
			const result = validateDependency(invalidDependency)

			expect(result.isValid).toBe(false)
			expect(Object.keys(result.errors).length).toBeGreaterThan(1)
		})
	})

	describe('findDuplicateDependencies', () => {
		it('returns empty array when no duplicates', () => {
			const dependencies = [
				{ practice_id: 'practice-a', depends_on_id: 'practice-b' },
				{ practice_id: 'practice-a', depends_on_id: 'practice-c' },
				{ practice_id: 'practice-b', depends_on_id: 'practice-c' }
			]

			const result = findDuplicateDependencies(dependencies)

			expect(result).toEqual([])
		})

		it('finds exact duplicate dependencies', () => {
			const result = findDuplicateDependencies(dependencyWithDuplicates)

			expect(result.length).toBeGreaterThan(0)
			expect(result[0]).toMatchObject({
				practice_id: 'practice-a',
				depends_on_id: 'practice-b'
			})
		})

		it('handles empty dependency array', () => {
			const result = findDuplicateDependencies([])

			expect(result).toEqual([])
		})

		it('handles single dependency', () => {
			const result = findDuplicateDependencies([validDependency])

			expect(result).toEqual([])
		})

		it('returns all duplicate occurrences', () => {
			const dependencies = [
				{ practice_id: 'a', depends_on_id: 'b' },
				{ practice_id: 'a', depends_on_id: 'b' },
				{ practice_id: 'a', depends_on_id: 'b' }
			]

			const result = findDuplicateDependencies(dependencies)

			// Should identify the duplicated dependency
			expect(result.length).toBeGreaterThan(0)
		})
	})

	describe('findCircularDependencies', () => {
		it('returns empty array when no circular dependencies', () => {
			const dependencies = [
				{ practice_id: 'practice-a', depends_on_id: 'practice-b' },
				{ practice_id: 'practice-b', depends_on_id: 'practice-c' }
			]

			const result = findCircularDependencies(dependencies)

			expect(result).toEqual([])
		})

		it('detects simple circular dependency (A -> B -> A)', () => {
			const dependencies = [
				{ practice_id: 'practice-a', depends_on_id: 'practice-b' },
				{ practice_id: 'practice-b', depends_on_id: 'practice-a' }
			]

			const result = findCircularDependencies(dependencies)

			expect(result.length).toBeGreaterThan(0)
			expect(result[0]).toContain('practice-a')
			expect(result[0]).toContain('practice-b')
		})

		it('detects complex circular dependency (A -> B -> C -> A)', () => {
			const result = findCircularDependencies(circularDependencies)

			expect(result.length).toBeGreaterThan(0)
		})

		it('handles empty dependency array', () => {
			const result = findCircularDependencies([])

			expect(result).toEqual([])
		})

		it('handles single dependency', () => {
			const result = findCircularDependencies([validDependency])

			expect(result).toEqual([])
		})

		it('detects multiple separate circular dependencies', () => {
			const dependencies = [
				// Cycle 1: A -> B -> A
				{ practice_id: 'practice-a', depends_on_id: 'practice-b' },
				{ practice_id: 'practice-b', depends_on_id: 'practice-a' },
				// Cycle 2: C -> D -> C
				{ practice_id: 'practice-c', depends_on_id: 'practice-d' },
				{ practice_id: 'practice-d', depends_on_id: 'practice-c' }
			]

			const result = findCircularDependencies(dependencies)

			expect(result.length).toBeGreaterThanOrEqual(2)
		})
	})

	describe('validateDependenciesAgainstPractices', () => {
		const practices = [
			{ ...validPractice, id: 'practice-a' },
			{ ...validPractice, id: 'practice-b' },
			{ ...validPractice, id: 'practice-c' }
		]

		it('returns success when all dependencies reference existing practices', () => {
			const dependencies = [
				{ practice_id: 'practice-a', depends_on_id: 'practice-b' },
				{ practice_id: 'practice-b', depends_on_id: 'practice-c' }
			]

			const result = validateDependenciesAgainstPractices(dependencies, practices)

			expect(result.isValid).toBe(true)
			expect(result.errors).toEqual([])
		})

		it('returns error when practice_id does not exist', () => {
			const dependencies = [{ practice_id: 'non-existent', depends_on_id: 'practice-b' }]

			const result = validateDependenciesAgainstPractices(dependencies, practices)

			expect(result.isValid).toBe(false)
			expect(result.errors.length).toBeGreaterThan(0)
			expect(result.errors[0]).toContain('non-existent')
		})

		it('returns error when depends_on_id does not exist', () => {
			const dependencies = [{ practice_id: 'practice-a', depends_on_id: 'non-existent' }]

			const result = validateDependenciesAgainstPractices(dependencies, practices)

			expect(result.isValid).toBe(false)
			expect(result.errors.length).toBeGreaterThan(0)
			expect(result.errors[0]).toContain('non-existent')
		})

		it('returns multiple errors for multiple invalid references', () => {
			const dependencies = [
				{ practice_id: 'invalid-1', depends_on_id: 'practice-b' },
				{ practice_id: 'practice-a', depends_on_id: 'invalid-2' }
			]

			const result = validateDependenciesAgainstPractices(dependencies, practices)

			expect(result.isValid).toBe(false)
			expect(result.errors.length).toBeGreaterThanOrEqual(2)
		})

		it('handles empty practices array', () => {
			const dependencies = [validDependency]

			const result = validateDependenciesAgainstPractices(dependencies, [])

			expect(result.isValid).toBe(false)
		})

		it('handles empty dependencies array', () => {
			const result = validateDependenciesAgainstPractices([], practices)

			expect(result.isValid).toBe(true)
		})
	})

	describe('getAllDependenciesForPractice', () => {
		const dependencies = [
			{ practice_id: 'practice-a', depends_on_id: 'practice-b' },
			{ practice_id: 'practice-a', depends_on_id: 'practice-c' },
			{ practice_id: 'practice-b', depends_on_id: 'practice-d' },
			{ practice_id: 'practice-c', depends_on_id: 'practice-e' }
		]

		it('returns direct dependencies for a practice', () => {
			const result = getAllDependenciesForPractice('practice-a', dependencies)

			expect(result).toContain('practice-b')
			expect(result).toContain('practice-c')
			expect(result.length).toBe(2)
		})

		it('returns empty array when practice has no dependencies', () => {
			const result = getAllDependenciesForPractice('practice-d', dependencies)

			expect(result).toEqual([])
		})

		it('returns empty array when practice does not exist', () => {
			const result = getAllDependenciesForPractice('non-existent', dependencies)

			expect(result).toEqual([])
		})

		it('handles empty dependencies array', () => {
			const result = getAllDependenciesForPractice('practice-a', [])

			expect(result).toEqual([])
		})

		it('does not include duplicate dependencies', () => {
			const depsWithDuplicates = [
				{ practice_id: 'practice-a', depends_on_id: 'practice-b' },
				{ practice_id: 'practice-a', depends_on_id: 'practice-b' }
			]

			const result = getAllDependenciesForPractice('practice-a', depsWithDuplicates)

			expect(result.filter(id => id === 'practice-b').length).toBe(1)
		})
	})

	describe('buildDependencyGraph', () => {
		it('builds adjacency list representation of dependencies', () => {
			const dependencies = [
				{ practice_id: 'practice-a', depends_on_id: 'practice-b' },
				{ practice_id: 'practice-a', depends_on_id: 'practice-c' },
				{ practice_id: 'practice-b', depends_on_id: 'practice-d' }
			]

			const graph = buildDependencyGraph(dependencies)

			expect(graph['practice-a']).toContain('practice-b')
			expect(graph['practice-a']).toContain('practice-c')
			expect(graph['practice-b']).toContain('practice-d')
		})

		it('returns empty object for empty dependencies', () => {
			const graph = buildDependencyGraph([])

			expect(graph).toEqual({})
		})

		it('handles practices with no dependencies', () => {
			const dependencies = [{ practice_id: 'practice-a', depends_on_id: 'practice-b' }]

			const graph = buildDependencyGraph(dependencies)

			expect(graph['practice-a']).toBeDefined()
			expect(graph['practice-b']).toBeUndefined()
		})
	})

	describe('pure function behavior', () => {
		it('same input produces same output (referential transparency)', () => {
			const result1 = validateDependency(validDependency)
			const result2 = validateDependency(validDependency)

			expect(result1).toEqual(result2)
		})

		it('does not mutate input dependency', () => {
			const dependency = { ...validDependency }
			const originalCopy = { ...dependency }

			validateDependency(dependency)

			expect(dependency).toEqual(originalCopy)
		})

		it('does not mutate input dependencies array', () => {
			const dependencies = [validDependency, buildDependency()]
			const originalCopy = [...dependencies]

			findDuplicateDependencies(dependencies)
			findCircularDependencies(dependencies)

			expect(dependencies).toEqual(originalCopy)
		})

		it('validation functions are composable', () => {
			const dependency = buildDependency()

			const idsValid = isValidDependencyIds(dependency.practice_id, dependency.depends_on_id)
			const noSelfRef = !hasSelfReference(dependency.practice_id, dependency.depends_on_id)

			const isValid = idsValid && noSelfRef
			expect(isValid).toBe(true)
		})
	})

	describe('edge cases', () => {
		it('handles very long practice IDs', () => {
			const longId = 'a'.repeat(1000)
			const dependency = {
				practice_id: longId,
				depends_on_id: 'practice-b'
			}

			const result = validateDependency(dependency)
			expect(typeof result.isValid).toBe('boolean')
		})

		it('handles special characters in IDs', () => {
			const dependency = {
				practice_id: 'practice-@#$',
				depends_on_id: 'practice-123'
			}

			const result = validateDependency(dependency)
			expect(typeof result.isValid).toBe('boolean')
		})

		it('handles deeply nested circular dependencies', () => {
			const dependencies = [
				{ practice_id: 'a', depends_on_id: 'b' },
				{ practice_id: 'b', depends_on_id: 'c' },
				{ practice_id: 'c', depends_on_id: 'd' },
				{ practice_id: 'd', depends_on_id: 'e' },
				{ practice_id: 'e', depends_on_id: 'a' }
			]

			const result = findCircularDependencies(dependencies)
			expect(Array.isArray(result)).toBe(true)
		})
	})
})
