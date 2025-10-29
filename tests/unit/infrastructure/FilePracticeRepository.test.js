import { describe, it, expect } from 'vitest'
import { createFilePracticeRepository } from '$infrastructure/persistence/FilePracticeRepository.js'
import { PracticeId } from '$domain/practice-catalog/value-objects/PracticeId.js'

describe('FilePracticeRepository', () => {
	describe('getPracticeTree', () => {
		it('preserves maturityLevel in tree nodes', async () => {
			const repository = createFilePracticeRepository()

			// Get the continuous-delivery tree
			const tree = await repository.getPracticeTree(PracticeId.from('continuous-delivery'))

			expect(tree).not.toBeNull()
			expect(tree.id).toBe('continuous-delivery')

			// Root should have maturityLevel
			expect(tree).toHaveProperty('maturityLevel')
			expect(typeof tree.maturityLevel).toBe('number')
			expect(tree.maturityLevel).toBeGreaterThanOrEqual(0)
			expect(tree.maturityLevel).toBeLessThanOrEqual(3)
		})

		it('preserves maturityLevel in all dependency nodes', async () => {
			const repository = createFilePracticeRepository()

			const tree = await repository.getPracticeTree(PracticeId.from('continuous-delivery'))

			expect(tree).not.toBeNull()
			expect(tree.dependencies).toBeDefined()
			expect(tree.dependencies.length).toBeGreaterThan(0)

			// Check first-level dependencies
			tree.dependencies.forEach(dep => {
				expect(dep).toHaveProperty('maturityLevel')
				expect(typeof dep.maturityLevel).toBe('number')
				expect(dep.maturityLevel).toBeGreaterThanOrEqual(0)
				expect(dep.maturityLevel).toBeLessThanOrEqual(3)
			})

			// Check second-level dependencies (if they exist)
			const firstDep = tree.dependencies[0]
			if (firstDep.dependencies && firstDep.dependencies.length > 0) {
				firstDep.dependencies.forEach(dep => {
					expect(dep).toHaveProperty('maturityLevel')
					expect(typeof dep.maturityLevel).toBe('number')
				})
			}
		})

		it('preserves all required practice fields', async () => {
			const repository = createFilePracticeRepository()

			const tree = await repository.getPracticeTree(PracticeId.from('continuous-delivery'))

			expect(tree).not.toBeNull()

			// Check all essential fields are preserved
			expect(tree).toHaveProperty('id')
			expect(tree).toHaveProperty('name')
			expect(tree).toHaveProperty('category')
			expect(tree).toHaveProperty('description')
			expect(tree).toHaveProperty('requirements')
			expect(tree).toHaveProperty('benefits')
			expect(tree).toHaveProperty('maturityLevel')

			// Verify types
			expect(typeof tree.id).toBe('string')
			expect(typeof tree.name).toBe('string')
			expect(typeof tree.category).toBe('string')
			expect(typeof tree.description).toBe('string')
			expect(Array.isArray(tree.requirements)).toBe(true)
			expect(Array.isArray(tree.benefits)).toBe(true)
			expect(typeof tree.maturityLevel).toBe('number')
		})

		it('preserves quickStartGuide when present', async () => {
			const repository = createFilePracticeRepository()

			const tree = await repository.getPracticeTree(PracticeId.from('continuous-delivery'))

			// Root practice should have quickStartGuide
			if (tree.quickStartGuide) {
				expect(typeof tree.quickStartGuide).toBe('string')
				expect(tree.quickStartGuide).toMatch(/^https?:\/\//)
			}

			// Check dependencies for quickStartGuide
			tree.dependencies.forEach(dep => {
				if (dep.quickStartGuide) {
					expect(typeof dep.quickStartGuide).toBe('string')
					expect(dep.quickStartGuide).toMatch(/^https?:\/\//)
				}
			})
		})

		it('returns null for non-existent practice', async () => {
			const repository = createFilePracticeRepository()

			const tree = await repository.getPracticeTree(PracticeId.from('non-existent-practice'))

			expect(tree).toBeNull()
		})

		it('preserves maturityLevel for practices at all tree levels', async () => {
			const repository = createFilePracticeRepository()

			const tree = await repository.getPracticeTree(PracticeId.from('continuous-delivery'))

			// Collect all practices at all levels using recursive traversal
			const collectAllPractices = (node, collected = []) => {
				collected.push(node)
				if (node.dependencies && node.dependencies.length > 0) {
					node.dependencies.forEach(dep => collectAllPractices(dep, collected))
				}
				return collected
			}

			const allPractices = collectAllPractices(tree)

			// Every practice should have maturityLevel
			allPractices.forEach((practice, index) => {
				expect(
					practice.maturityLevel,
					`Practice at index ${index} (${practice.id}) is missing maturityLevel`
				).toBeDefined()
				expect(typeof practice.maturityLevel).toBe('number')
				expect(practice.maturityLevel).toBeGreaterThanOrEqual(0)
				expect(practice.maturityLevel).toBeLessThanOrEqual(3)
			})

			// Should have practices at different maturity levels
			const uniqueMaturityLevels = new Set(allPractices.map(p => p.maturityLevel))
			expect(uniqueMaturityLevels.size).toBeGreaterThan(1) // Should have variety
		})
	})

	describe('findById', () => {
		it('returns domain model without maturityLevel (by design)', async () => {
			const repository = createFilePracticeRepository()

			const practice = await repository.findById(PracticeId.from('continuous-delivery'))

			expect(practice).not.toBeNull()
			expect(practice.id.toString()).toBe('continuous-delivery')

			// Domain model doesn't include maturityLevel (that's only for tree representation)
			// This test documents that behavior
		})
	})
})
