/**
 * FilePracticeRepository - File-based Repository Implementation
 *
 * Reads practice data from JSON files instead of database.
 * Perfect for static site generation with infrequent data updates.
 *
 * Benefits:
 * - Zero database queries (instant load)
 * - No database hosting costs
 * - Version controlled data
 * - Perfect for SSG/CDN deployment
 */
import { createCDPractice } from '$domain/practice-catalog/entities/CDPractice.js'
import { PracticeId } from '$domain/practice-catalog/value-objects/PracticeId.js'
import { PracticeCategory } from '$domain/practice-catalog/value-objects/PracticeCategory.js'
import data from '$lib/data/cd-practices.json'

/**
 * Convert JSON object to domain model
 * @private
 */
const toDomainModel = practiceData => {
	const practice = createCDPractice(
		PracticeId.from(practiceData.id),
		practiceData.name,
		PracticeCategory.from(practiceData.category),
		practiceData.description,
		{
			requirements: practiceData.requirements || [],
			benefits: practiceData.benefits || [],
			quickStartGuide: practiceData.quickStartGuide,
			maturityLevel: practiceData.maturityLevel
		}
	)

	return practice
}

/**
 * Build tree structure from flat practices and dependencies
 * @private
 */
const buildTreeWithDependencies = (practices, dependencies, rootId) => {
	if (practices.length === 0) return null

	// Create a map of all practices
	const practiceMap = new Map()
	practices.forEach(practice => {
		practiceMap.set(practice.id, {
			id: practice.id,
			name: practice.name,
			category: practice.category,
			description: practice.description,
			requirements: practice.requirements || [],
			benefits: practice.benefits || [],
			quickStartGuide: practice.quickStartGuide, // Preserve quickStartGuide
			maturityLevel: practice.maturityLevel, // Preserve maturityLevel
			level: practice.level || 0,
			dependencies: []
		})
	})

	// Build dependency relationships
	dependencies.forEach(dep => {
		const parent = practiceMap.get(dep.practice_id)
		const child = practiceMap.get(dep.depends_on_id)

		// Only add if both practices are in our tree
		if (parent && child) {
			parent.dependencies.push(child)
		}
	})

	// Return root practice
	return practiceMap.get(rootId) || null
}

/**
 * Get all practices reachable from a root practice (recursive)
 * @private
 */
const getReachablePractices = (rootId, dependencies, visited = new Set()) => {
	if (visited.has(rootId)) return []
	visited.add(rootId)

	const reachable = [rootId]
	const deps = dependencies.filter(d => d.practice_id === rootId)

	for (const dep of deps) {
		const childReachable = getReachablePractices(dep.depends_on_id, dependencies, visited)
		reachable.push(...childReachable)
	}

	return reachable
}

/**
 * Create a file-based practice repository
 *
 * @returns {Object} Repository object with implemented methods
 */
export const createFilePracticeRepository = () => ({
	/**
	 * Find a practice by its ID
	 * @param {PracticeId} practiceId
	 * @returns {Promise<CDPractice|null>}
	 */
	findById: async practiceId => {
		const practice = data.practices.find(p => p.id === practiceId.toString())

		if (!practice) {
			return null
		}

		return toDomainModel(practice)
	},

	/**
	 * Find all practices
	 * @returns {Promise<CDPractice[]>}
	 */
	findAll: async () => {
		return data.practices.map(practice => toDomainModel(practice))
	},

	/**
	 * Find practices by category
	 * @param {PracticeCategory} category
	 * @returns {Promise<CDPractice[]>}
	 */
	findByCategory: async category => {
		const practices = data.practices.filter(p => p.category === category.toString())
		return practices.map(practice => toDomainModel(practice))
	},

	/**
	 * Find practice prerequisites for a given practice
	 * @param {PracticeId} practiceId
	 * @returns {Promise<Array>}
	 */
	findPracticePrerequisites: async practiceId => {
		const practiceIdStr = practiceId.toString()
		const deps = data.dependencies.filter(d => d.practice_id === practiceIdStr)

		const prerequisites = deps
			.map(dep => {
				const practice = data.practices.find(p => p.id === dep.depends_on_id)
				if (!practice) return null

				return {
					practice: toDomainModel(practice),
					rationale: ''
				}
			})
			.filter(p => p !== null)

		return prerequisites
	},

	/**
	 * Find capability prerequisites for a given practice
	 * @param {PracticeId} _practiceId
	 * @returns {Promise<Array>}
	 */
	findCapabilityPrerequisites: async _practiceId => {
		// Not supported in file-based repository
		return []
	},

	/**
	 * Get the complete practice tree
	 * @param {PracticeId} rootId
	 * @returns {Promise<Object>}
	 */
	getPracticeTree: async rootId => {
		const rootIdStr = rootId.toString()

		// Get all reachable practices from root
		const reachableIds = getReachablePractices(rootIdStr, data.dependencies)
		const reachablePractices = data.practices.filter(p => reachableIds.includes(p.id))

		if (reachablePractices.length === 0) {
			return null
		}

		// Build tree structure with dependencies
		return buildTreeWithDependencies(reachablePractices, data.dependencies, rootIdStr)
	},

	/**
	 * Get transitive categories for a practice (all categories in dependency tree)
	 * @param {PracticeId} practiceId
	 * @returns {Promise<string[]>}
	 */
	getTransitiveCategories: async practiceId => {
		const visited = new Set()
		const categories = new Set()

		const collectCategories = practiceIdStr => {
			if (visited.has(practiceIdStr)) return
			visited.add(practiceIdStr)

			const deps = data.dependencies.filter(d => d.practice_id === practiceIdStr)

			for (const dep of deps) {
				const practice = data.practices.find(p => p.id === dep.depends_on_id)
				if (practice) {
					categories.add(practice.category)
					collectCategories(dep.depends_on_id)
				}
			}
		}

		collectCategories(practiceId.toString())
		return Array.from(categories).sort()
	},

	/**
	 * Count total dependencies for a practice (direct + indirect/transitive)
	 * @param {PracticeId} practiceId
	 * @returns {Promise<number>}
	 */
	countTotalDependencies: async practiceId => {
		const practiceIdStr = practiceId.toString()
		const reachableIds = getReachablePractices(practiceIdStr, data.dependencies)
		// Subtract 1 to exclude the practice itself
		return reachableIds.length - 1
	},

	/**
	 * Save a practice
	 * @param {CDPractice} _practice
	 * @returns {Promise<void>}
	 */
	save: async _practice => {
		throw new Error('Save not supported in file-based repository. Edit src/data/cd-practices.json')
	}
})
