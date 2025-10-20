#!/usr/bin/env node
/**
 * Full Database Data Refresh (Node.js version)
 *
 * This script DELETES all existing data and applies ALL data migrations from
 * the repository to ensure production database matches the repository exactly.
 *
 * ⚠️  WARNING: This is a DESTRUCTIVE operation that deletes all existing data!
 * ⚠️  The repository is the single source of truth for practice data.
 *
 * Usage:
 *   export DATABASE_URL="postgresql://..."
 *   node db/deploy-full-refresh.js
 *
 * Or for production (Netlify):
 *   DATABASE_URL="postgresql://..." node db/deploy-full-refresh.js
 */

import { Client } from 'pg'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const CONTEXT = process.env.CONTEXT || 'manual'
const DATABASE_URL = process.env.DATABASE_URL

console.log('============================================================================')
console.log('  DATABASE FULL DATA REFRESH')
console.log('============================================================================')
console.log('')
console.log(`🌐 Context: ${CONTEXT}`)

// Check if DATABASE_URL is set
if (!DATABASE_URL) {
	console.log('❌ ERROR: DATABASE_URL environment variable is not set')
	console.log('')
	console.log('Set it with:')
	console.log('  export DATABASE_URL="postgresql://user:pass@host:port/database"')
	console.log('')
	process.exit(1)
}

// Mask password in URL for display
const maskedUrl = DATABASE_URL.replace(/:([^:@]+)@/, ':***@')
console.log(`📊 Database: ${maskedUrl}`)
console.log('')

async function fullDataRefresh() {
	const client = new Client({ connectionString: DATABASE_URL })

	try {
		// Connect to database
		await client.connect()
		console.log('✅ Database connection successful')
		console.log('')

		// Check if tables exist
		const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'practices'
      );
    `)

		if (!tableCheck.rows[0].exists) {
			console.log('❌ ERROR: Database tables not found')
			console.log('')
			console.log('Database must be initialized first. Run:')
			console.log('  ./db/deploy-initial.sh')
			console.log('')
			await client.end()
			process.exit(1)
		}

		console.log('============================================================================')
		console.log('  Current Database State')
		console.log('============================================================================')
		console.log('')

		// Get current stats
		const practiceCount = await client.query('SELECT COUNT(*) FROM practices;')
		const depCount = await client.query('SELECT COUNT(*) FROM practice_dependencies;')
		const version = await client.query("SELECT value FROM metadata WHERE key = 'version';")

		console.log(`📊 Current practices: ${practiceCount.rows[0].count}`)
		console.log(`🔗 Current dependencies: ${depCount.rows[0].count}`)
		console.log(`📦 Current version: ${version.rows[0].value.replace(/"/g, '')}`)
		console.log('')

		console.log('============================================================================')
		console.log('  ⚠️  DELETING ALL EXISTING DATA')
		console.log('============================================================================')
		console.log('')
		console.log('⚠️  WARNING: Deleting all practices, dependencies, and metadata.')
		console.log('⚠️  Repository is the source of truth - data will be re-created from migrations.')
		console.log('')

		try {
			// Delete in correct order (foreign key constraints)
			console.log('🗑️  Deleting practice dependencies...')
			await client.query('DELETE FROM practice_dependencies;')

			console.log('🗑️  Deleting practices...')
			await client.query('DELETE FROM practices;')

			console.log('🗑️  Deleting metadata...')
			await client.query('DELETE FROM metadata;')

			console.log('✅ All data deleted successfully')
			console.log('')
		} catch (error) {
			console.error('❌ ERROR: Failed to delete existing data')
			console.error(error.message)
			console.error('')
			await client.end()
			process.exit(1)
		}

		console.log('============================================================================')
		console.log('  Applying ALL Data Migrations (Clean Slate)')
		console.log('============================================================================')
		console.log('')
		console.log('ℹ️  Applying all data migrations from repository.')
		console.log('ℹ️  Database will be populated with clean data from source.')
		console.log('')

		// Get all migration files INCLUDING initial data
		const dataDir = join(__dirname, 'data')
		const files = readdirSync(dataDir)
			.filter(f => f.match(/^\d{3}_.*\.sql$/)) // Include ALL numbered files
			.filter(f => !f.includes('example')) // Skip example templates
			.sort() // Apply in order

		let appliedCount = 0
		let errorCount = 0

		// Apply each migration
		for (const file of files) {
			const filePath = join(dataDir, file)
			const sql = readFileSync(filePath, 'utf8')

			console.log(`▶️  Applying: ${file}`)

			try {
				await client.query(sql)
				console.log('   ✅ Applied successfully')
				appliedCount++
			} catch (error) {
				console.log(`   ❌ Error: ${error.message}`)
				errorCount++
			}
			console.log('')
		}

		// Summary
		if (errorCount > 0) {
			console.log(`⚠️  Completed with errors: ${appliedCount} applied, ${errorCount} failed`)
		} else {
			console.log(`✅ Successfully applied ${appliedCount} migration(s)`)
		}

		console.log('')
		console.log('============================================================================')
		console.log('  Updated Database State')
		console.log('============================================================================')
		console.log('')

		// Get updated stats
		const updatedPracticeCount = await client.query('SELECT COUNT(*) FROM practices;')
		const updatedDepCount = await client.query('SELECT COUNT(*) FROM practice_dependencies;')
		const updatedVersion = await client.query("SELECT value FROM metadata WHERE key = 'version';")
		const categoryBreakdown = await client.query(
			'SELECT category, COUNT(*) as count FROM practices GROUP BY category ORDER BY count DESC;'
		)

		console.log(`📊 Total practices: ${updatedPracticeCount.rows[0].count}`)
		console.log(`🔗 Total dependencies: ${updatedDepCount.rows[0].count}`)
		console.log(`📦 Version: ${updatedVersion.rows[0].value.replace(/"/g, '')}`)
		console.log('')

		// Show what changed
		const oldPracticeCount = parseInt(practiceCount.rows[0].count)
		const newPracticeCount = parseInt(updatedPracticeCount.rows[0].count)
		const oldDepCount = parseInt(depCount.rows[0].count)
		const newDepCount = parseInt(updatedDepCount.rows[0].count)

		if (newPracticeCount !== oldPracticeCount || newDepCount !== oldDepCount) {
			console.log('📈 Changes:')
			if (newPracticeCount !== oldPracticeCount) {
				const diff = newPracticeCount - oldPracticeCount
				console.log(
					`   Practices: ${oldPracticeCount} → ${newPracticeCount} (${diff > 0 ? '+' : ''}${diff})`
				)
			}
			if (newDepCount !== oldDepCount) {
				const diff = newDepCount - oldDepCount
				console.log(
					`   Dependencies: ${oldDepCount} → ${newDepCount} (${diff > 0 ? '+' : ''}${diff})`
				)
			}
			console.log('')
		}

		// Show category breakdown
		console.log('📊 Category Breakdown:')
		for (const row of categoryBreakdown.rows) {
			console.log(`   ${row.category}: ${row.count}`)
		}

		console.log('')
		console.log('============================================================================')
		console.log('  ✅ FULL DATA REFRESH COMPLETE')
		console.log('============================================================================')
		console.log('')
		console.log('✅ All existing data was deleted')
		console.log('✅ All data migrations were applied from repository')
		console.log('✅ Production database now matches repository exactly')
		console.log('')
		console.log('⚠️  Note: Any data not in repository migrations has been permanently deleted.')
		console.log('')

		await client.end()
		process.exit(errorCount > 0 ? 1 : 0)
	} catch (error) {
		console.error('❌ FATAL ERROR:', error.message)
		console.error('')
		console.error(error.stack)
		console.error('')

		try {
			await client.end()
		} catch {
			// Ignore cleanup errors
		}

		process.exit(1)
	}
}

fullDataRefresh()
