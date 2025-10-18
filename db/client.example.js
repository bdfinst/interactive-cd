/**
 * Example Database Client Implementation for SvelteKit + Netlify Postgres
 *
 * Usage:
 * 1. Install dependencies: npm install pg
 * 2. Set DATABASE_URL in Netlify environment variables
 * 3. Copy this to src/lib/server/db.js
 * 4. Import and use in your API routes
 */

import pkg from 'pg'
const { Pool } = pkg

// Database connection pool
// In SvelteKit, import from: $env/static/private
const DATABASE_URL = process.env.DATABASE_URL || ''

const pool = new Pool({
	connectionString: DATABASE_URL,
	ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
	max: 10, // max connections
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000
})

/**
 * Database Client Class
 */
class PracticeDatabase {
	// ============================================================================
	// BASIC CRUD OPERATIONS
	// ============================================================================

	/**
	 * Get a single practice by ID
	 * @param {string} id - Practice ID
	 * @returns {Promise<Object|null>} Practice object or null
	 */
	async getPractice(id) {
		const result = await pool.query('SELECT * FROM practices WHERE id = $1', [id])
		return result.rows[0] || null
	}

	/**
	 * Get all practices with optional filters
	 * @param {Object} filters - Optional filters {type, category, search}
	 * @returns {Promise<Array>} Array of practice objects
	 */
	async getAllPractices(filters = {}) {
		let query = 'SELECT * FROM practices WHERE 1=1'
		const params = []
		let paramIndex = 1

		if (filters.type) {
			query += ` AND type = $${paramIndex}`
			params.push(filters.type)
			paramIndex++
		}

		if (filters.category) {
			query += ` AND category = $${paramIndex}`
			params.push(filters.category)
			paramIndex++
		}

		if (filters.search) {
			query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`
			params.push(`%${filters.search}%`)
			paramIndex++
		}

		query += ' ORDER BY name'

		const result = await pool.query(query, params)
		return result.rows
	}

	/**
	 * Create a new practice
	 * @param {Object} practice - Practice object
	 * @returns {Promise<Object>} Created practice
	 */
	async createPractice(practice) {
		const result = await pool.query(
			`INSERT INTO practices (id, name, type, category, description, requirements, benefits)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb)
       RETURNING *`,
			[
				practice.id,
				practice.name,
				practice.type,
				practice.category,
				practice.description,
				JSON.stringify(practice.requirements),
				JSON.stringify(practice.benefits)
			]
		)
		return result.rows[0]
	}

	/**
	 * Update an existing practice
	 * @param {Object} practice - Practice object with id
	 * @returns {Promise<Object>} Updated practice
	 */
	async updatePractice(practice) {
		const existing = await this.getPractice(practice.id)
		if (!existing) {
			throw new Error(`Practice not found: ${practice.id}`)
		}

		const updates = []
		const params = []
		let paramIndex = 1

		if (practice.name !== undefined) {
			updates.push(`name = $${paramIndex}`)
			params.push(practice.name)
			paramIndex++
		}
		if (practice.type !== undefined) {
			updates.push(`type = $${paramIndex}`)
			params.push(practice.type)
			paramIndex++
		}
		if (practice.category !== undefined) {
			updates.push(`category = $${paramIndex}`)
			params.push(practice.category)
			paramIndex++
		}
		if (practice.description !== undefined) {
			updates.push(`description = $${paramIndex}`)
			params.push(practice.description)
			paramIndex++
		}
		if (practice.requirements !== undefined) {
			updates.push(`requirements = $${paramIndex}::jsonb`)
			params.push(JSON.stringify(practice.requirements))
			paramIndex++
		}
		if (practice.benefits !== undefined) {
			updates.push(`benefits = $${paramIndex}::jsonb`)
			params.push(JSON.stringify(practice.benefits))
			paramIndex++
		}

		params.push(practice.id)

		const result = await pool.query(
			`UPDATE practices SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
			params
		)
		return result.rows[0]
	}

	/**
	 * Delete a practice
	 * @param {string} id - Practice ID
	 * @returns {Promise<boolean>} True if deleted
	 */
	async deletePractice(id) {
		const result = await pool.query('DELETE FROM practices WHERE id = $1', [id])
		return (result.rowCount ?? 0) > 0
	}

	// ============================================================================
	// DEPENDENCY OPERATIONS
	// ============================================================================

	/**
	 * Get all direct dependencies of a practice
	 * @param {string} practiceId - Practice ID
	 * @returns {Promise<Array>} Array of dependency practices
	 */
	async getPracticeDependencies(practiceId) {
		const result = await pool.query(
			`SELECT p.* FROM practices p
       INNER JOIN practice_dependencies pd ON p.id = pd.depends_on_id
       WHERE pd.practice_id = $1
       ORDER BY p.name`,
			[practiceId]
		)
		return result.rows
	}

	/**
	 * Get all practices that depend on this practice
	 * @param {string} practiceId - Practice ID
	 * @returns {Promise<Array>} Array of dependent practices
	 */
	async getPracticeDependents(practiceId) {
		const result = await pool.query(
			`SELECT p.* FROM practices p
       INNER JOIN practice_dependencies pd ON p.id = pd.practice_id
       WHERE pd.depends_on_id = $1
       ORDER BY p.name`,
			[practiceId]
		)
		return result.rows
	}

	/**
	 * Add a dependency relationship
	 * @param {string} practiceId - Practice ID
	 * @param {string} dependsOnId - Dependency practice ID
	 * @returns {Promise<boolean>} True if added successfully
	 */
	async addDependency(practiceId, dependsOnId) {
		// Check if it would create a cycle
		const wouldCycle = await this.wouldCreateCycle(practiceId, dependsOnId)
		if (wouldCycle) {
			throw new Error(`Circular dependency detected: ${practiceId} -> ${dependsOnId}`)
		}

		try {
			await pool.query(
				`INSERT INTO practice_dependencies (practice_id, depends_on_id)
         VALUES ($1, $2)
         ON CONFLICT (practice_id, depends_on_id) DO NOTHING`,
				[practiceId, dependsOnId]
			)
			return true
		} catch (error) {
			console.error('Error adding dependency:', error)
			return false
		}
	}

	/**
	 * Remove a dependency relationship
	 * @param {string} practiceId - Practice ID
	 * @param {string} dependsOnId - Dependency practice ID
	 * @returns {Promise<boolean>} True if removed
	 */
	async removeDependency(practiceId, dependsOnId) {
		const result = await pool.query(
			`DELETE FROM practice_dependencies
       WHERE practice_id = $1 AND depends_on_id = $2`,
			[practiceId, dependsOnId]
		)
		return (result.rowCount ?? 0) > 0
	}

	// ============================================================================
	// TREE OPERATIONS (using database functions)
	// ============================================================================

	/**
	 * Get full practice tree starting from a root practice
	 * @param {string} rootId - Root practice ID
	 * @returns {Promise<Array>} Array of tree nodes with level and path
	 */
	async getPracticeTree(rootId) {
		const result = await pool.query('SELECT * FROM get_practice_tree($1)', [rootId])
		return result.rows
	}

	/**
	 * Get all ancestors of a practice
	 * @param {string} practiceId - Practice ID
	 * @returns {Promise<Array>} Array of ancestor practices
	 */
	async getPracticeAncestors(practiceId) {
		const result = await pool.query('SELECT * FROM get_practice_ancestors($1)', [practiceId])
		return result.rows
	}

	/**
	 * Get the depth of a practice from root
	 * @param {string} practiceId - Practice ID
	 * @returns {Promise<number>} Depth from root (0 = root, -1 = not found)
	 */
	async getPracticeDepth(practiceId) {
		const result = await pool.query('SELECT get_practice_depth($1) as depth', [practiceId])
		return result.rows[0]?.depth ?? -1
	}

	// ============================================================================
	// VALIDATION
	// ============================================================================

	/**
	 * Check if adding a dependency would create a circular reference
	 * @param {string} parentId - Parent practice ID
	 * @param {string} childId - Child practice ID
	 * @returns {Promise<boolean>} True if it would create a cycle
	 */
	async wouldCreateCycle(parentId, childId) {
		const result = await pool.query('SELECT would_create_cycle($1, $2) as would_cycle', [
			parentId,
			childId
		])
		return result.rows[0]?.would_cycle ?? false
	}

	// ============================================================================
	// VIEWS
	// ============================================================================

	/**
	 * Get practice summary with dependency counts
	 * @returns {Promise<Array>} Array of practice summaries
	 */
	async getPracticeSummary() {
		const result = await pool.query(
			'SELECT * FROM practice_summary ORDER BY dependent_count DESC, name'
		)
		return result.rows
	}

	/**
	 * Get leaf practices (practices with no dependencies)
	 * @returns {Promise<Array>} Array of leaf practices
	 */
	async getLeafPractices() {
		const result = await pool.query('SELECT * FROM leaf_practices')
		return result.rows
	}

	/**
	 * Get root practices (top-level practices)
	 * @returns {Promise<Array>} Array of root practices
	 */
	async getRootPractices() {
		const result = await pool.query('SELECT * FROM root_practices')
		return result.rows
	}

	// ============================================================================
	// METADATA
	// ============================================================================

	/**
	 * Get metadata value by key
	 * @param {string} key - Metadata key
	 * @returns {Promise<any>} Metadata value
	 */
	async getMetadata(key) {
		const result = await pool.query('SELECT value FROM metadata WHERE key = $1', [key])
		return result.rows[0]?.value
	}

	/**
	 * Set metadata value
	 * @param {string} key - Metadata key
	 * @param {any} value - Metadata value
	 * @returns {Promise<void>}
	 */
	async setMetadata(key, value) {
		await pool.query(
			`INSERT INTO metadata (key, value)
       VALUES ($1, $2::jsonb)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
			[key, JSON.stringify(value)]
		)
	}

	// ============================================================================
	// UTILITY
	// ============================================================================

	/**
	 * Close the database connection pool
	 * @returns {Promise<void>}
	 */
	async close() {
		await pool.end()
	}
}

// Export singleton instance
export const db = new PracticeDatabase()

// Export Pool for direct queries if needed
export { pool }

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/*

// In SvelteKit API route: src/routes/api/practices/+server.js
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db.js';

export async function GET() {
  const practices = await db.getAllPractices();
  return json(practices);
}

// Get single practice with dependencies: src/routes/api/practices/[id]/+server.js
export async function GET({ params }) {
  const practice = await db.getPractice(params.id);
  if (!practice) {
    return json({ error: 'Practice not found' }, { status: 404 });
  }

  const dependencies = await db.getPracticeDependencies(params.id);
  const dependents = await db.getPracticeDependents(params.id);

  return json({
    practice,
    dependencies,
    dependents
  });
}

// Get full tree: src/routes/api/tree/+server.js
export async function GET() {
  const roots = await db.getRootPractices();
  const tree = await db.getPracticeTree(roots[0].id);
  return json(tree);
}

// Search practices: src/routes/api/practices/+server.js
export async function GET({ url }) {
  const search = url.searchParams.get('q') || '';
  const category = url.searchParams.get('category');

  const practices = await db.getAllPractices({
    search,
    category
  });

  return json(practices);
}

// Add new dependency: src/routes/api/dependencies/+server.js
export async function POST({ request }) {
  const { practiceId, dependsOnId } = await request.json();

  try {
    await db.addDependency(practiceId, dependsOnId);
    return json({ success: true });
  } catch (error) {
    return json(
      { error: error.message },
      { status: 400 }
    );
  }
}

*/
