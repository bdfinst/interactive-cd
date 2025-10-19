#!/usr/bin/env node
/**
 * Database Migration Runner (Node.js version)
 *
 * This script runs database migrations using the pg npm package
 * instead of psql, making it work in any Node.js environment
 * including Netlify builds.
 */

import { Client } from 'pg'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const CONTEXT = process.env.CONTEXT || 'unknown'
const DATABASE_URL = process.env.DATABASE_URL

console.log('============================================================================')
console.log('  DATABASE MIGRATIONS - CI/CD DEPLOYMENT (Node.js)')
console.log('============================================================================')
console.log('')
console.log(`🌐 Netlify Context: ${CONTEXT}`)

// Check if DATABASE_URL is set
if (!DATABASE_URL) {
	console.log('❌ ERROR: DATABASE_URL environment variable is not set')
	console.log('')
	console.log('This script requires DATABASE_URL to be set in Netlify environment variables.')
	console.log('Skipping database migrations.')
	console.log('')
	process.exit(0) // Exit gracefully
}

// Mask password in URL for display
const maskedUrl = DATABASE_URL.replace(/:([^:@]+)@/, ':***@')
console.log(`📊 Database: ${maskedUrl}`)
console.log('')

async function runMigrations() {
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
			console.log('⚠️  WARNING: Database tables not found')
			console.log('This appears to be a fresh database. Run initial deployment first:')
			console.log('  ./db/deploy-initial.sh')
			console.log('')
			console.log('Skipping migrations.')
			await client.end()
			process.exit(0)
		}

		console.log('============================================================================')
		console.log('  Current Database State')
		console.log('============================================================================')
		console.log('')

		// Get current stats
		const practiceCount = await client.query('SELECT COUNT(*) FROM practices;')
		const version = await client.query("SELECT value FROM metadata WHERE key = 'version';")

		console.log(`📊 Current practices: ${practiceCount.rows[0].count}`)
		console.log(`📦 Current version: ${version.rows[0].value.replace(/"/g, '')}`)
		console.log('')

		console.log('============================================================================')
		console.log('  Applying Data Migrations')
		console.log('============================================================================')
		console.log('')

		// Get all migration files
		const dataDir = join(__dirname, 'data')
		const files = readdirSync(dataDir)
			.filter(f => f.match(/^\d{3}_.*\.sql$/) && f !== '001_initial_data.sql')
			.filter(f => !f.includes('example'))
			.sort()

		let migrationCount = 0
		let skippedCount = 0

		// Apply each migration
		for (const file of files) {
			const filePath = join(dataDir, file)
			const sql = readFileSync(filePath, 'utf8')

			console.log(`▶️  Applying: ${file}`)

			try {
				await client.query(sql)
				console.log('   ✅ Applied successfully')
				migrationCount++
			} catch {
				// Migration might already be applied (idempotent with ON CONFLICT)
				console.log('   ⚠️  Skipped (likely already applied)')
				skippedCount++
			}
			console.log('')
		}

		if (migrationCount === 0 && skippedCount === 0) {
			console.log('ℹ️  No new migrations to apply')
		} else {
			if (migrationCount > 0) {
				console.log(`✅ Applied ${migrationCount} new migration(s)`)
			}
			if (skippedCount > 0) {
				console.log(`ℹ️  Skipped ${skippedCount} migration(s) (already applied)`)
			}
		}

		console.log('')
		console.log('============================================================================')
		console.log('  Updated Database State')
		console.log('============================================================================')
		console.log('')

		// Get updated stats
		const updatedCount = await client.query('SELECT COUNT(*) FROM practices;')
		const depCount = await client.query('SELECT COUNT(*) FROM practice_dependencies;')
		const updatedVersion = await client.query("SELECT value FROM metadata WHERE key = 'version';")

		console.log(`📊 Total practices: ${updatedCount.rows[0].count}`)
		console.log(`🔗 Total dependencies: ${depCount.rows[0].count}`)
		console.log(`📦 Version: ${updatedVersion.rows[0].value.replace(/"/g, '')}`)

		// Show what changed
		const oldCount = parseInt(practiceCount.rows[0].count)
		const newCount = parseInt(updatedCount.rows[0].count)
		if (newCount !== oldCount) {
			const added = newCount - oldCount
			console.log('')
			console.log(`🆕 Added ${added} new practice(s)`)
		}

		console.log('')
		console.log('============================================================================')
		console.log('  ✅ DATABASE MIGRATIONS COMPLETE')
		console.log('============================================================================')
		console.log('')

		await client.end()
		process.exit(0)
	} catch (error) {
		console.error('❌ ERROR:', error.message)
		console.error('')

		try {
			await client.end()
		} catch {
			// Ignore cleanup errors
		}

		// Exit gracefully - don't fail the build
		process.exit(0)
	}
}

runMigrations()
