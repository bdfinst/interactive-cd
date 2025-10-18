/**
 * PostgresPracticeRepository - Repository Implementation (Functional)
 *
 * Implements PracticeRepository interface using PostgreSQL.
 * Handles translation between database rows and domain objects.
 *
 * Usage:
 *   import { query } from './db.js'
 *   const repository = createPostgresPracticeRepository(query)
 *   const practice = await repository.findById(practiceId)
 */
import { createCDPractice } from '$domain/practice-catalog/entities/CDPractice.js'
import { PracticeId } from '$domain/practice-catalog/value-objects/PracticeId.js'
import { PracticeCategory } from '$domain/practice-catalog/value-objects/PracticeCategory.js'
import { query } from './db.js'

/**
 * Convert database row to domain model
 * @private
 */
const toDomainModel = row => {
	const practice = createCDPractice(
		PracticeId.from(row.id),
		row.name,
		PracticeCategory.from(row.category),
		row.description,
		{
			requirements: row.requirements || [],
			benefits: row.benefits || []
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
	practices.forEach(row => {
		practiceMap.set(row.id, {
			id: row.id,
			name: row.name,
			category: row.category,
			description: row.description,
			requirements: row.requirements || [],
			benefits: row.benefits || [],
			level: row.level,
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
 * Create a PostgreSQL-backed practice repository
 *
 * @param {Function} queryFn - Database query function (optional, defaults to imported query)
 * @returns {Object} Repository object with implemented methods
 */
export const createPostgresPracticeRepository = (queryFn = query) => ({
	/**
	 * Find a practice by its ID
	 * @param {PracticeId} practiceId
	 * @returns {Promise<CDPractice|null>}
	 */
	findById: async practiceId => {
		const result = await queryFn('SELECT * FROM practices WHERE id = $1', [practiceId.toString()])

		if (result.rows.length === 0) {
			return null
		}

		return toDomainModel(result.rows[0])
	},

	/**
	 * Find all practices
	 * @returns {Promise<CDPractice[]>}
	 */
	findAll: async () => {
		const result = await queryFn('SELECT * FROM practices ORDER BY name')

		return result.rows.map(row => toDomainModel(row))
	},

	/**
	 * Find practices by category
	 * @param {PracticeCategory} category
	 * @returns {Promise<CDPractice[]>}
	 */
	findByCategory: async category => {
		const result = await queryFn('SELECT * FROM practices WHERE category = $1 ORDER BY name', [
			category.toString()
		])

		return result.rows.map(row => toDomainModel(row))
	},

	/**
	 * Find practice prerequisites for a given practice
	 * @param {PracticeId} practiceId
	 * @returns {Promise<Array>}
	 */
	findPracticePrerequisites: async practiceId => {
		const result = await queryFn(
			`SELECT p.*
       FROM practices p
       INNER JOIN practice_dependencies pd ON p.id = pd.depends_on_id
       WHERE pd.practice_id = $1
       ORDER BY p.name`,
			[practiceId.toString()]
		)

		return result.rows.map(row => ({
			practice: toDomainModel(row),
			rationale: '' // No rationale in current schema
		}))
	},

	/**
	 * Find capability prerequisites for a given practice
	 * @param {PracticeId} _practiceId
	 * @returns {Promise<Array>}
	 */
	findCapabilityPrerequisites: async _practiceId => {
		// TODO: Implement when platform_capabilities table is created
		// For now, return empty array as capability prerequisites are not yet in the schema
		return []

		/* Future implementation:
		const result = await queryFn(
			`SELECT pc.*, pcd.rationale
       FROM platform_capabilities pc
       INNER JOIN practice_capability_dependencies pcd ON pc.id = pcd.depends_on_capability_id
       WHERE pcd.practice_id = $1
       ORDER BY pc.name`,
			[practiceId.toString()]
		)

		return result.rows.map(row => ({
			capability: toCapabilityDomainModel(row),
			rationale: row.rationale
		}))
		*/
	},

	/**
	 * Get the complete practice tree using recursive CTE
	 * @param {PracticeId} rootId
	 * @returns {Promise<Object>}
	 */
	getPracticeTree: async rootId => {
		// Get all practices reachable from root
		const practicesResult = await queryFn('SELECT * FROM get_practice_tree($1)', [
			rootId.toString()
		])

		if (practicesResult.rows.length === 0) {
			return null
		}

		// Get all dependencies for building the tree
		const depsResult = await queryFn('SELECT practice_id, depends_on_id FROM practice_dependencies')

		// Build tree structure with dependencies
		return buildTreeWithDependencies(practicesResult.rows, depsResult.rows, rootId.toString())
	},

	/**
	 * Save a practice
	 * @param {CDPractice} _practice
	 * @returns {Promise<void>}
	 */
	save: async _practice => {
		throw new Error('Save not yet implemented')
		// TODO: Implement save logic
	}
})
