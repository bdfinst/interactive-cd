#!/usr/bin/env node

/**
 * Build-time validation script for CD practices data
 *
 * Usage: node scripts/validate-cd-practices.js
 *
 * Exit codes:
 * 0 - Validation passed
 * 1 - Validation failed
 */

import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { validateCdPractices } from '../src/lib/validators/cd-practices-validator.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// Pure function: Read and parse JSON file
const readJsonFile = async filePath => {
	try {
		const content = await readFile(filePath, 'utf-8')
		return { success: true, data: JSON.parse(content) }
	} catch (error) {
		return {
			success: false,
			error: {
				message: 'Failed to read or parse JSON file',
				details: error.message,
				file: filePath
			}
		}
	}
}

// Pure function: Format output for console
const formatOutput = result => {
	if (result.success) {
		return {
			text: `\n✓ Validation passed\n`,
			color: '\x1b[32m', // Green
			exitCode: 0
		}
	}

	const errorLines = result.errors.map(err => {
		const parts = [`  ${err.index}. ${err.message || 'Unknown error'}`]

		if (err.instancePath) parts.push(`     Path: ${err.instancePath}`)
		if (err.schemaPath) parts.push(`     Schema: ${err.schemaPath}`)
		if (err.params) parts.push(`     Details: ${JSON.stringify(err.params)}`)
		if (err.practice_id) parts.push(`     Practice: ${err.practice_id}`)
		if (err.dependency) parts.push(`     Dependency: ${JSON.stringify(err.dependency)}`)
		if (err.cycle) parts.push(`     Cycle: ${err.cycle.join(' -> ')}`)
		if (err.duplicates) parts.push(`     Duplicates: ${err.duplicates.join(', ')}`)

		return parts.join('\n')
	})

	return {
		text: `\n✗ ${result.message}\n\n${errorLines.join('\n\n')}\n`,
		color: '\x1b[31m', // Red
		exitCode: 1
	}
}

// Main execution
try {
	const dataPath = join(projectRoot, 'src/lib/data/cd-practices.json')
	const schemaPath = join(projectRoot, 'src/lib/schemas/cd-practices.schema.json')

	console.log('\nValidating CD practices data...\n')

	// Read data file
	const dataResult = await readJsonFile(dataPath)
	if (!dataResult.success) {
		console.error('\x1b[31m%s\x1b[0m', `Error: ${dataResult.error.message}`)
		console.error(dataResult.error.details)
		process.exit(1)
	}

	// Read schema file
	const schemaResult = await readJsonFile(schemaPath)
	if (!schemaResult.success) {
		console.error('\x1b[31m%s\x1b[0m', `Error: ${schemaResult.error.message}`)
		console.error(schemaResult.error.details)
		process.exit(1)
	}

	// Validate
	const validationResult = validateCdPractices(schemaResult.data)(dataResult.data)
	const output = formatOutput(validationResult)

	console.log(`${output.color}%s\x1b[0m`, output.text)
	process.exit(output.exitCode)
} catch (error) {
	console.error('\x1b[31m%s\x1b[0m', '\nUnexpected error:')
	console.error(error)
	process.exit(1)
}
