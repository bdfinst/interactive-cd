/**
 * Database Client
 *
 * PostgreSQL connection using pg library.
 * Uses connection pooling for better performance.
 */
import pkg from 'pg'
const { Pool } = pkg

let pool

/**
 * Get or create database connection pool
 * @returns {Pool}
 */
export function getPool() {
	if (!pool) {
		const connectionString =
			process.env.DATABASE_URL || 'postgresql://localhost:5432/interactive_cd'

		pool = new Pool({
			connectionString,
			// Connection pool configuration
			max: 20, // Maximum number of clients in the pool
			idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
			connectionTimeoutMillis: 2000 // Wait 2 seconds for connection
		})

		// Log connection errors
		pool.on('error', err => {
			console.error('Unexpected error on idle client', err)
		})
	}

	return pool
}

/**
 * Execute a query
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise} - Query result
 */
export async function query(text, params) {
	const start = Date.now()
	const pool = getPool()

	try {
		const res = await pool.query(text, params)
		const duration = Date.now() - start

		// Log slow queries in development
		if (process.env.NODE_ENV === 'development' && duration > 1000) {
			console.warn(`Slow query (${duration}ms):`, text)
		}

		return res
	} catch (error) {
		console.error('Database query error:', error)
		throw error
	}
}

/**
 * Close database connection pool
 * Call this when shutting down the application
 */
export async function closePool() {
	if (pool) {
		await pool.end()
		pool = null
	}
}
