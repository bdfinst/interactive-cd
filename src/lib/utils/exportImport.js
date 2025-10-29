/* global Blob */
import { browser } from '$app/environment'

/**
 * Generate export filename with current date
 * @returns {string} Filename like "cd-practices-adoption-2025-10-25.cdpa"
 */
export const generateExportFilename = () => {
	const now = new Date()
	const year = now.getFullYear()
	const month = String(now.getMonth() + 1).padStart(2, '0')
	const day = String(now.getDate()).padStart(2, '0')
	return `cd-practices-adoption-${year}-${month}-${day}.cdpa`
}

/**
 * Create export data object from adoption state
 * @param {Set<string>} adoptedPractices - Set of adopted practice IDs
 * @param {number} totalPractices - Total number of practices
 * @param {string} appVersion - Current app version (default: '1.0.0')
 * @returns {Object} Export data object
 */
export const createExportData = (adoptedPractices, totalPractices, appVersion = '1.0.0') => {
	const adoptedArray = Array.from(adoptedPractices).sort()
	const adoptedCount = adoptedArray.length
	const adoptionPercentage =
		totalPractices > 0 ? Math.round((adoptedCount / totalPractices) * 100) : 0

	return {
		$schema: 'https://json-schema.org/draft-07/schema#',
		version: '1.0.0',
		exportedAt: new Date().toISOString(),
		metadata: {
			totalPractices,
			adoptedCount,
			adoptionPercentage,
			appVersion
		},
		adoptedPractices: adoptedArray
	}
}

/**
 * Check if file version is compatible
 * @param {string} fileVersion - Version from import file
 * @returns {boolean}
 */
const isVersionCompatible = fileVersion => {
	// For now, only support 1.x.x versions
	return fileVersion.startsWith('1.')
}

/**
 * Validate import file schema
 * @param {Object} data - Parsed JSON data
 * @returns {{valid: boolean, errors: string[]}}
 */
export const validateImportData = data => {
	const errors = []

	// Required fields
	if (!data.version) {
		errors.push('Missing required field: version')
	}
	if (!data.exportedAt) {
		errors.push('Missing required field: exportedAt')
	}
	if (!data.adoptedPractices) {
		errors.push('Missing required field: adoptedPractices')
	}

	// Type checks
	if (data.adoptedPractices && !Array.isArray(data.adoptedPractices)) {
		errors.push('adoptedPractices must be an array')
	}

	// Version compatibility (for future migrations)
	if (data.version && !isVersionCompatible(data.version)) {
		errors.push(`Incompatible file version: ${data.version}`)
	}

	return {
		valid: errors.length === 0,
		errors
	}
}

/**
 * Parse and validate import file
 * @param {File} file - File object from input
 * @returns {Promise<{success: boolean, data?: Set<string>, metadata?: Object, error?: string}>}
 */
export const parseImportFile = async file => {
	try {
		// Read file as text
		const text = await file.text()

		// Parse JSON
		let data
		try {
			data = JSON.parse(text)
		} catch {
			return {
				success: false,
				error: 'Invalid JSON format. Please check the file and try again.'
			}
		}

		// Validate schema
		const validation = validateImportData(data)
		if (!validation.valid) {
			return {
				success: false,
				error: `Invalid file format: ${validation.errors.join(', ')}`
			}
		}

		// Extract practice IDs - filter out non-strings and empty strings
		const practiceIds = new Set(
			data.adoptedPractices.filter(id => typeof id === 'string' && id.trim())
		)

		return {
			success: true,
			data: practiceIds,
			metadata: data.metadata
		}
	} catch (error) {
		return {
			success: false,
			error: `Failed to read file: ${error.message}`
		}
	}
}

/**
 * Import adoption state from file with validation
 * @param {File} file - File object from input
 * @param {Set<string>} validPracticeIds - Set of valid practice IDs
 * @returns {Promise<{success: boolean, imported: Set<string>, invalid: string[], metadata?: Object, error?: string}>}
 */
export const importAdoptionState = async (file, validPracticeIds) => {
	const parseResult = await parseImportFile(file)

	if (!parseResult.success) {
		return {
			success: false,
			error: parseResult.error,
			imported: new Set(),
			invalid: []
		}
	}

	// Filter out invalid practice IDs
	const validIds = new Set()
	const invalidIds = []

	for (const id of parseResult.data) {
		if (validPracticeIds.has(id)) {
			validIds.add(id)
		} else {
			invalidIds.push(id)
		}
	}

	return {
		success: true,
		imported: validIds,
		invalid: invalidIds,
		metadata: parseResult.metadata
	}
}

/**
 * Export adoption state to JSON file download
 * @param {Set<string>} adoptedPractices - Set of adopted practice IDs
 * @param {number} totalPractices - Total number of practices
 * @param {string} appVersion - Current app version
 */
export const exportAdoptionState = (adoptedPractices, totalPractices, appVersion = '1.0.0') => {
	if (!browser) return

	const data = createExportData(adoptedPractices, totalPractices, appVersion)
	const json = JSON.stringify(data, null, 2) // Pretty print with 2-space indent
	const blob = new Blob([json], { type: 'application/vnd.cd-practices.adoption+json' })
	const url = URL.createObjectURL(blob)

	// Create temporary download link
	const link = document.createElement('a')
	link.href = url
	link.download = generateExportFilename()
	document.body.appendChild(link)
	link.click()

	// Cleanup
	document.body.removeChild(link)
	URL.revokeObjectURL(url)
}
