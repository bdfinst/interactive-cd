/**
 * GetPracticeTreeService - Application Service (Functional)
 *
 * Use case: Get the complete practice tree for display
 * Orchestrates repository calls and returns data ready for presentation
 *
 * Usage:
 *   const service = createGetPracticeTreeService(repository)
 *   const result = await service.execute('continuous-delivery')
 */
import { PracticeId } from '$domain/practice-catalog/value-objects/PracticeId.js'

/**
 * Create a GetPracticeTreeService instance
 * @param {Object} practiceRepository - The practice repository
 * @returns {Object} Service with execute method
 */
export const createGetPracticeTreeService = practiceRepository => {
	// Validate dependency
	if (!practiceRepository) {
		throw new Error('PracticeRepository is required')
	}

	// Private helper: Enrich tree nodes with prerequisite details (currently unused)
	const _enrichTreeWithPrerequisites = async node => {
		if (!node) return null

		const practiceId = PracticeId.from(node.id)

		const [practicePrereqs, capabilityPrereqs] = await Promise.all([
			practiceRepository.findPracticePrerequisites(practiceId),
			practiceRepository.findCapabilityPrerequisites(practiceId)
		])

		const enrichedNode = {
			...node,
			practicePrerequisites: practicePrereqs.map(p => ({
				id: p.practice.id.toString(),
				name: p.practice.name,
				category: p.practice.category.toString(),
				rationale: p.rationale
			})),
			capabilityPrerequisites: capabilityPrereqs.map(c => ({
				id: c.id,
				name: c.name,
				category: c.category,
				rationale: c.rationale
			})),
			requirementCount: node.requirements ? node.requirements.length : 0,
			benefitCount: node.benefits ? node.benefits.length : 0,
			hasPrerequisites: practicePrereqs.length > 0 || capabilityPrereqs.length > 0
		}

		// Recursively enrich dependencies
		if (node.dependencies && node.dependencies.length > 0) {
			enrichedNode.dependencies = await Promise.all(
				node.dependencies.map(dep => _enrichTreeWithPrerequisites(dep))
			)
		}

		return enrichedNode
	}

	// Private helper: Collect all unique categories from dependencies
	const collectTransitiveCategories = (node, visited = new Set()) => {
		if (!node) return new Set()

		// Prevent infinite recursion
		if (visited.has(node.id)) {
			return new Set()
		}
		visited.add(node.id)

		const categories = new Set()

		// Add categories from all dependencies
		if (node.dependencies && node.dependencies.length > 0) {
			node.dependencies.forEach(dep => {
				// Normalize category to string
				const depCategory =
					typeof dep.category === 'object' && dep.category !== null
						? dep.category.toString()
						: dep.category

				categories.add(depCategory)

				// Recursively collect from sub-dependencies
				const subCategories = collectTransitiveCategories(dep, new Set(visited))
				subCategories.forEach(cat => categories.add(cat))
			})
		}

		return categories
	}

	// Private helper: Add requirement and benefit counts to tree nodes
	const addCounts = (node, visited = new Set()) => {
		if (!node) return null

		// Normalize category to string if it's an object
		const categoryString =
			typeof node.category === 'object' && node.category !== null
				? node.category.toString()
				: node.category

		// Prevent infinite recursion
		if (visited.has(node.id)) {
			return {
				id: node.id,
				name: node.name,
				category: categoryString,
				categories: [categoryString],
				description: node.description,
				requirements: node.requirements || [],
				benefits: node.benefits || [],
				requirementCount: node.requirements?.length || 0,
				benefitCount: node.benefits?.length || 0,
				practicePrerequisites: [],
				capabilityPrerequisites: [],
				dependencies: [], // Don't recurse into circular reference
				maturityLevel: node.maturityLevel // Preserve maturityLevel for circular references
			}
		}

		visited.add(node.id)

		// First, recursively process dependencies
		let enrichedDependencies = []
		if (node.dependencies && node.dependencies.length > 0) {
			enrichedDependencies = node.dependencies.map(dep => addCounts(dep, new Set(visited)))
		}

		// Collect all transitive categories from dependencies
		const transitiveCategories = collectTransitiveCategories(node)
		const categoriesArray = [...transitiveCategories].sort()

		const enriched = {
			...node,
			category: categoryString,
			categories: categoriesArray, // Transitive categories from all dependencies
			requirementCount: node.requirements?.length || 0,
			benefitCount: node.benefits?.length || 0,
			practicePrerequisites: [],
			capabilityPrerequisites: [],
			dependencies: enrichedDependencies,
			quickStartGuide: node.quickStartGuide, // Explicitly preserve quickStartGuide
			maturityLevel: node.maturityLevel // Explicitly preserve maturityLevel
		}

		return enriched
	}

	// Private helper: Count total practices in tree
	const countPractices = node => {
		if (!node) return 0

		let count = 1 // Count this node

		if (node.dependencies && node.dependencies.length > 0) {
			count += node.dependencies.reduce((sum, dep) => sum + countPractices(dep), 0)
		}

		return count
	}

	// Return frozen service object with public API
	return Object.freeze({
		/**
		 * Execute the use case: get practice tree
		 * @param {string} rootId - The root practice ID (default: 'continuous-delivery')
		 * @returns {Promise<Object>} - The practice tree with all dependencies
		 */
		execute: async (rootId = 'continuous-delivery') => {
			try {
				const practiceId = PracticeId.from(rootId)

				// Get the complete tree from repository
				const tree = await practiceRepository.getPracticeTree(practiceId)

				if (!tree) {
					throw new Error(`Practice not found: ${rootId}`)
				}

				// Add counts to tree (skip slow prerequisite enrichment for now)
				const enrichedTree = addCounts(tree)

				return {
					success: true,
					data: enrichedTree,
					metadata: {
						rootId,
						totalPractices: countPractices(enrichedTree),
						timestamp: new Date().toISOString()
					}
				}
			} catch (error) {
				console.error('GetPracticeTreeService error:', error)
				return {
					success: false,
					error: error.message,
					metadata: {
						timestamp: new Date().toISOString()
					}
				}
			}
		}
	})
}
