import { describe, it, expect, vi } from 'vitest'
import { createGetPracticeTreeService } from '$application/practice-catalog/GetPracticeTreeService.js'

describe('GetPracticeTreeService', () => {
	describe('execute', () => {
		it('preserves maturityLevel from repository tree', async () => {
			// Mock repository that returns a tree with maturityLevel
			const mockRepository = {
				getPracticeTree: vi.fn().mockResolvedValue({
					id: 'continuous-delivery',
					name: 'Continuous Delivery',
					category: 'core',
					description: 'The practice of continuous delivery',
					requirements: ['Build automation', 'Test automation'],
					benefits: ['Faster delivery', 'Reduced risk'],
					maturityLevel: 3,
					dependencies: [
						{
							id: 'continuous-integration',
							name: 'Continuous Integration',
							category: 'automation',
							description: 'CI practice',
							requirements: ['Version control'],
							benefits: ['Early bug detection'],
							maturityLevel: 1,
							dependencies: []
						}
					]
				})
			}

			const service = createGetPracticeTreeService(mockRepository)
			const result = await service.execute('continuous-delivery')

			expect(result.success).toBe(true)
			expect(result.data).toBeDefined()

			// Root should preserve maturityLevel
			expect(result.data.maturityLevel).toBe(3)

			// Dependencies should preserve maturityLevel
			expect(result.data.dependencies).toHaveLength(1)
			expect(result.data.dependencies[0].maturityLevel).toBe(1)
		})

		it('preserves maturityLevel through multiple levels', async () => {
			const mockRepository = {
				getPracticeTree: vi.fn().mockResolvedValue({
					id: 'root',
					name: 'Root',
					category: 'core',
					description: 'Root practice',
					requirements: [],
					benefits: [],
					maturityLevel: 3,
					dependencies: [
						{
							id: 'level1',
							name: 'Level 1',
							category: 'automation',
							description: 'Level 1',
							requirements: [],
							benefits: [],
							maturityLevel: 2,
							dependencies: [
								{
									id: 'level2',
									name: 'Level 2',
									category: 'automation',
									description: 'Level 2',
									requirements: [],
									benefits: [],
									maturityLevel: 0,
									dependencies: []
								}
							]
						}
					]
				})
			}

			const service = createGetPracticeTreeService(mockRepository)
			const result = await service.execute('root')

			expect(result.success).toBe(true)
			expect(result.data.maturityLevel).toBe(3)
			expect(result.data.dependencies[0].maturityLevel).toBe(2)
			expect(result.data.dependencies[0].dependencies[0].maturityLevel).toBe(0)
		})

		it('handles undefined maturityLevel gracefully', async () => {
			const mockRepository = {
				getPracticeTree: vi.fn().mockResolvedValue({
					id: 'test',
					name: 'Test',
					category: 'core',
					description: 'Test practice',
					requirements: [],
					benefits: [],
					// maturityLevel intentionally missing
					dependencies: []
				})
			}

			const service = createGetPracticeTreeService(mockRepository)
			const result = await service.execute('test')

			expect(result.success).toBe(true)
			// Should handle undefined maturityLevel without crashing
			expect(result.data).toBeDefined()
		})

		it('preserves maturityLevel in circular reference handling', async () => {
			// Simulate circular reference scenario
			const child = {
				id: 'child',
				name: 'Child',
				category: 'automation',
				description: 'Child practice',
				requirements: [],
				benefits: [],
				maturityLevel: 1,
				dependencies: []
			}

			const parent = {
				id: 'parent',
				name: 'Parent',
				category: 'core',
				description: 'Parent practice',
				requirements: [],
				benefits: [],
				maturityLevel: 2,
				dependencies: [child]
			}

			// Create circular reference
			child.dependencies = [parent]

			const mockRepository = {
				getPracticeTree: vi.fn().mockResolvedValue(parent)
			}

			const service = createGetPracticeTreeService(mockRepository)
			const result = await service.execute('parent')

			expect(result.success).toBe(true)
			expect(result.data.maturityLevel).toBe(2)

			// Even with circular reference, maturityLevel should be preserved
			if (result.data.dependencies && result.data.dependencies.length > 0) {
				expect(result.data.dependencies[0].maturityLevel).toBe(1)
			}
		})

		it('enriches tree with counts while preserving maturityLevel', async () => {
			const mockRepository = {
				getPracticeTree: vi.fn().mockResolvedValue({
					id: 'parent',
					name: 'Parent',
					category: 'core',
					description: 'Parent practice',
					requirements: ['req1', 'req2'],
					benefits: ['benefit1'],
					maturityLevel: 2,
					dependencies: [
						{
							id: 'child',
							name: 'Child',
							category: 'automation',
							description: 'Child',
							requirements: ['req1'],
							benefits: ['benefit1', 'benefit2'],
							maturityLevel: 1,
							dependencies: []
						}
					]
				})
			}

			const service = createGetPracticeTreeService(mockRepository)
			const result = await service.execute('parent')

			expect(result.success).toBe(true)

			// Should add counts
			expect(result.data.requirementCount).toBe(2)
			expect(result.data.benefitCount).toBe(1)
			expect(result.data.dependencies[0].requirementCount).toBe(1)
			expect(result.data.dependencies[0].benefitCount).toBe(2)

			// Should preserve maturityLevel
			expect(result.data.maturityLevel).toBe(2)
			expect(result.data.dependencies[0].maturityLevel).toBe(1)
		})

		it('returns error for non-existent practice', async () => {
			// Suppress expected error from practice not found
			const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

			const mockRepository = {
				getPracticeTree: vi.fn().mockResolvedValue(null)
			}

			const service = createGetPracticeTreeService(mockRepository)
			const result = await service.execute('non-existent')

			expect(result.success).toBe(false)
			expect(result.error).toBeDefined()

			errorSpy.mockRestore()
		})

		it('preserves quickStartGuide alongside maturityLevel', async () => {
			const mockRepository = {
				getPracticeTree: vi.fn().mockResolvedValue({
					id: 'test',
					name: 'Test',
					category: 'core',
					description: 'Test practice',
					requirements: [],
					benefits: [],
					maturityLevel: 2,
					quickStartGuide: 'https://example.com/guide',
					dependencies: []
				})
			}

			const service = createGetPracticeTreeService(mockRepository)
			const result = await service.execute('test')

			expect(result.success).toBe(true)
			expect(result.data.maturityLevel).toBe(2)
			expect(result.data.quickStartGuide).toBe('https://example.com/guide')
		})
	})
})
