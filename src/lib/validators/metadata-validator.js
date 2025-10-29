/**
 * Metadata Validator
 *
 * Pure functional validation module for metadata objects.
 * All functions are pure - same input always produces same output.
 *
 * Following functional programming principles:
 * - Pure functions (no side effects)
 * - Immutability (no mutations)
 * - Composability (small functions compose into larger ones)
 */

// Pure function: Validate semantic version format
export const isValidVersion = version => {
	if (typeof version !== 'string') return false
	if (version.trim() === '') return false

	// Semantic versioning regex (supports pre-release and build metadata)
	// Valid: 1.0.0, 1.2.3, 1.0.0-alpha, 1.0.0-beta.1, 1.0.0+20130313144700
	// Invalid: 1.0, v1.0.0, 01.0.0 (leading zeros)
	const semverPattern =
		/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/

	return semverPattern.test(version)
}

// Pure function: Parse semantic version into components
export const parseSemanticVersion = version => {
	if (!isValidVersion(version)) {
		return null
	}

	const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-([^+]+))?(?:\+(.+))?$/)
	if (!match) return null

	return {
		major: parseInt(match[1], 10),
		minor: parseInt(match[2], 10),
		patch: parseInt(match[3], 10),
		prerelease: match[4] || null,
		build: match[5] || null
	}
}

// Pure function: Compare two semantic versions
export const compareVersions = (version1, version2) => {
	const v1 = parseSemanticVersion(version1)
	const v2 = parseSemanticVersion(version2)

	if (!v1 || !v2) return null

	// Compare major version
	if (v1.major !== v2.major) return v1.major - v2.major

	// Compare minor version
	if (v1.minor !== v2.minor) return v1.minor - v2.minor

	// Compare patch version
	if (v1.patch !== v2.patch) return v1.patch - v2.patch

	// If both have no prerelease, they're equal
	if (!v1.prerelease && !v2.prerelease) return 0

	// Version with prerelease is less than without
	if (!v1.prerelease) return 1
	if (!v2.prerelease) return -1

	// Compare prerelease strings lexicographically
	return v1.prerelease.localeCompare(v2.prerelease)
}

// Pure function: Validate date format (YYYY-MM-DD) and calendar validity
export const isValidDateFormat = dateString => {
	if (typeof dateString !== 'string') return false
	if (dateString.trim() === '') return false

	// ISO 8601 date format: YYYY-MM-DD
	const datePattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/

	if (!datePattern.test(dateString)) return false

	// Validate calendar date (leap years, days per month)
	const [year, month, day] = dateString.split('-').map(Number)
	const date = new Date(year, month - 1, day)

	// Check if the date components match (catches invalid dates like 2025-02-30, 2025-04-31)
	return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

// Pure function: Validate date is a real date within reasonable range
export const isValidDate = dateString => {
	if (!isValidDateFormat(dateString)) return false

	// Check if it's a valid calendar date
	const date = new Date(dateString)
	const timestamp = date.getTime()

	// NaN check
	if (Number.isNaN(timestamp)) return false

	// Extract year for range validation
	const [year] = dateString.split('-').map(Number)

	// Reject dates in 1900 or earlier (too far in the past)
	if (year <= 1900) return false

	return true
}

// Pure function: Validate metadata object
export const validateMetadata = metadata => {
	if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
		return {
			isValid: false,
			errors: { metadata: 'Metadata must be an object' }
		}
	}

	const errors = {}

	// Required fields (only version and lastUpdated are required)
	const requiredFields = ['version', 'lastUpdated']
	const missingFields = requiredFields.filter(
		field => !(field in metadata) || metadata[field] === undefined
	)

	if (missingFields.length > 0) {
		missingFields.forEach(field => {
			errors[field] = `Missing required field: ${field}`
		})
		// Return early if required fields are missing
		return { isValid: false, errors }
	}

	// Validate optional string fields if present
	const stringFields = ['changelog', 'source', 'description']
	stringFields.forEach(field => {
		if (field in metadata) {
			const value = metadata[field]
			if (typeof value !== 'string' || value.trim() === '') {
				errors[field] = `Field "${field}" must be a non-empty string`
			}
		}
	})

	// Validate version format (should already be caught by required fields check above)
	// But if someone passes undefined version, validate it
	if (metadata.version !== undefined && !isValidVersion(metadata.version)) {
		errors.version = `Invalid version format: "${metadata.version}". Must be semantic version (e.g., "1.0.0")`
	}

	// Validate lastUpdated format (should already be caught by required fields check above)
	if (metadata.lastUpdated !== undefined && !isValidDate(metadata.lastUpdated)) {
		errors.lastUpdated = `Invalid lastUpdated format: "${metadata.lastUpdated}". Must be ISO date (YYYY-MM-DD)`
	}

	// Validate lastUpdated is not in the future
	if (isValidDate(metadata.lastUpdated)) {
		const updateDate = new Date(metadata.lastUpdated)
		const today = new Date()
		today.setHours(0, 0, 0, 0) // Reset time to start of day

		if (updateDate > today) {
			errors.lastUpdated = `lastUpdated cannot be in the future: "${metadata.lastUpdated}"`
		}
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors
	}
}

// Pure function: Validate metadata with version constraints
export const validateMetadataWithConstraints = (metadata, constraints = {}) => {
	const baseValidation = validateMetadata(metadata)
	if (!baseValidation.isValid) {
		return baseValidation
	}

	const errors = []

	// Validate minimum version if specified
	if (constraints.minVersion && isValidVersion(constraints.minVersion)) {
		const comparison = compareVersions(metadata.version, constraints.minVersion)
		if (comparison !== null && comparison < 0) {
			errors.push(
				`Version ${metadata.version} is less than minimum required version ${constraints.minVersion}`
			)
		}
	}

	// Validate maximum version if specified
	if (constraints.maxVersion && isValidVersion(constraints.maxVersion)) {
		const comparison = compareVersions(metadata.version, constraints.maxVersion)
		if (comparison !== null && comparison > 0) {
			errors.push(
				`Version ${metadata.version} is greater than maximum allowed version ${constraints.maxVersion}`
			)
		}
	}

	return {
		isValid: errors.length === 0,
		errors: [...baseValidation.errors, ...errors]
	}
}
