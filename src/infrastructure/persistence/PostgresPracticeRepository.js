/**
 * PostgresPracticeRepository - Repository Implementation
 *
 * Implements PracticeRepository interface using PostgreSQL.
 * Handles translation between database rows and domain objects.
 */
import { PracticeRepository } from '$domain/practice-catalog/repositories/PracticeRepository.js';
import { CDPractice } from '$domain/practice-catalog/entities/CDPractice.js';
import { PracticeId } from '$domain/practice-catalog/value-objects/PracticeId.js';
import { PracticeCategory } from '$domain/practice-catalog/value-objects/PracticeCategory.js';
import { query } from './db.js';

export class PostgresPracticeRepository extends PracticeRepository {
	/**
	 * Find a practice by its ID
	 * @param {PracticeId} practiceId
	 * @returns {Promise<CDPractice|null>}
	 */
	async findById(practiceId) {
		const result = await query('SELECT * FROM practices WHERE id = $1', [practiceId.toString()]);

		if (result.rows.length === 0) {
			return null;
		}

		return this.#toDomainModel(result.rows[0]);
	}

	/**
	 * Find all practices
	 * @returns {Promise<CDPractice[]>}
	 */
	async findAll() {
		const result = await query('SELECT * FROM practices ORDER BY name');

		return result.rows.map((row) => this.#toDomainModel(row));
	}

	/**
	 * Find practices by category
	 * @param {PracticeCategory} category
	 * @returns {Promise<CDPractice[]>}
	 */
	async findByCategory(category) {
		const result = await query('SELECT * FROM practices WHERE category = $1 ORDER BY name', [
			category.toString()
		]);

		return result.rows.map((row) => this.#toDomainModel(row));
	}

	/**
	 * Find practice prerequisites for a given practice
	 * @param {PracticeId} practiceId
	 * @returns {Promise<Array>}
	 */
	async findPracticePrerequisites(practiceId) {
		const result = await query(
			`SELECT p.*
       FROM practices p
       INNER JOIN practice_dependencies pd ON p.id = pd.depends_on_id
       WHERE pd.practice_id = $1
       ORDER BY p.name`,
			[practiceId.toString()]
		);

		return result.rows.map((row) => ({
			practice: this.#toDomainModel(row),
			rationale: '' // No rationale in current schema
		}));
	}

	/**
	 * Find capability prerequisites for a given practice
	 * @param {PracticeId} practiceId
	 * @returns {Promise<Array>}
	 */
	async findCapabilityPrerequisites(practiceId) {
		// TODO: Implement when platform_capabilities table is created
		// For now, return empty array as capability prerequisites are not yet in the schema
		return [];

		/* Future implementation:
		const result = await query(
			`SELECT pc.*, pcd.rationale
       FROM platform_capabilities pc
       INNER JOIN practice_capability_dependencies pcd ON pc.id = pcd.depends_on_capability_id
       WHERE pcd.practice_id = $1
       ORDER BY pc.name`,
			[practiceId.toString()]
		);

		return result.rows.map((row) => ({
			id: row.id,
			name: row.name,
			category: row.category,
			rationale: row.rationale
		}));
		*/
	}

	/**
	 * Get the complete practice tree using recursive CTE
	 * @param {PracticeId} rootId
	 * @returns {Promise<Object>}
	 */
	async getPracticeTree(rootId) {
		// Get all practices reachable from root
		const practicesResult = await query('SELECT * FROM get_practice_tree($1)', [
			rootId.toString()
		]);

		if (practicesResult.rows.length === 0) {
			return null;
		}

		// Get all dependencies for building the tree
		const depsResult = await query('SELECT practice_id, depends_on_id FROM practice_dependencies');

		// Build tree structure with dependencies
		return this.#buildTreeWithDependencies(practicesResult.rows, depsResult.rows, rootId.toString());
	}

	/**
	 * Convert database row to domain model
	 * @private
	 */
	#toDomainModel(row) {
		const practice = new CDPractice(
			PracticeId.from(row.id),
			row.name,
			PracticeCategory.from(row.category),
			row.description
		);

		// Add requirements
		if (row.requirements && Array.isArray(row.requirements)) {
			row.requirements.forEach((req) => {
				practice.addRequirement(req);
			});
		}

		// Add benefits
		if (row.benefits && Array.isArray(row.benefits)) {
			row.benefits.forEach((benefit) => {
				practice.addBenefit(benefit);
			});
		}

		return practice;
	}

	/**
	 * Build tree structure from flat practices and dependencies
	 * @private
	 */
	#buildTreeWithDependencies(practices, dependencies, rootId) {
		if (practices.length === 0) return null;

		// Create a map of all practices
		const practiceMap = new Map();
		practices.forEach((row) => {
			practiceMap.set(row.id, {
				id: row.id,
				name: row.name,
				category: row.category,
				description: row.description,
				requirements: row.requirements || [],
				benefits: row.benefits || [],
				level: row.level,
				dependencies: []
			});
		});

		// Build dependency relationships
		dependencies.forEach((dep) => {
			const parent = practiceMap.get(dep.practice_id);
			const child = practiceMap.get(dep.depends_on_id);

			// Only add if both practices are in our tree
			if (parent && child) {
				parent.dependencies.push(child);
			}
		});

		// Return root practice
		return practiceMap.get(rootId) || null;
	}
}
