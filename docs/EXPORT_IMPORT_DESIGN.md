# Export/Import Feature Design

## Overview

Users can save their practice adoption state to a JSON file on their local drive and import it later, enabling:

- Backup and restore of adoption state
- Transferring adoption state between devices
- Sharing adoption state with team members
- Version control of adoption progress

---

## Export File Format

### JSON Schema

```json
{
	"$schema": "https://json-schema.org/draft-07/schema#",
	"version": "1.0.0",
	"exportedAt": "2025-10-25T14:30:00.000Z",
	"metadata": {
		"totalPractices": 54,
		"adoptedCount": 12,
		"adoptionPercentage": 22,
		"appVersion": "1.2.0"
	},
	"adoptedPractices": [
		"version-control",
		"automated-testing",
		"continuous-integration",
		"trunk-based-development",
		"deployment-automation",
		"database-change-management",
		"configuration-management",
		"infrastructure-as-code",
		"monitoring-observability",
		"incident-response",
		"feature-flags",
		"blue-green-deployment"
	]
}
```

### Field Descriptions

| Field                         | Type              | Required | Description                                           |
| ----------------------------- | ----------------- | -------- | ----------------------------------------------------- |
| `$schema`                     | string            | Yes      | JSON Schema URL for validation                        |
| `version`                     | string            | Yes      | File format version (semver)                          |
| `exportedAt`                  | string (ISO 8601) | Yes      | Timestamp when file was created                       |
| `metadata.totalPractices`     | number            | Yes      | Total practices available at export time              |
| `metadata.adoptedCount`       | number            | Yes      | Number of practices adopted                           |
| `metadata.adoptionPercentage` | number            | Yes      | Percentage of practices adopted                       |
| `metadata.appVersion`         | string            | No       | App version at export time                            |
| `adoptedPractices`            | string[]          | Yes      | Array of adopted practice IDs (sorted alphabetically) |

### Filename Format

```
cd-practices-adoption-YYYY-MM-DD.cdpa
```

Example: `cd-practices-adoption-2025-10-25.cdpa`

**File Extension:** `.cdpa` (**C**ontinuous **D**elivery **P**ractice **A**doption)

- Unique to this application
- Easy to identify and organize
- Professional and memorable
- JSON format internally

If multiple exports on same day:

```
cd-practices-adoption-2025-10-25-1.cdpa
cd-practices-adoption-2025-10-25-2.cdpa
```

**MIME Type:** `application/vnd.cd-practices.adoption+json`

---

## Implementation

### 1. Export Utilities

**File:** `src/lib/utils/exportImport.js`

```javascript
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
 * @param {string} appVersion - Current app version
 * @returns {Object} Export data object
 */
export const createExportData = (adoptedPractices, totalPractices, appVersion = '1.0.0') => {
	const adoptedArray = Array.from(adoptedPractices).sort()
	const adoptedCount = adoptedArray.length
	const adoptionPercentage = Math.round((adoptedCount / totalPractices) * 100)

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
 * Export adoption state to JSON file download
 * @param {Set<string>} adoptedPractices - Set of adopted practice IDs
 * @param {number} totalPractices - Total number of practices
 */
export const exportAdoptionState = (adoptedPractices, totalPractices) => {
	const data = createExportData(adoptedPractices, totalPractices)
	const json = JSON.stringify(data, null, 2) // Pretty print with 2-space indent
	const blob = new Blob([json], { type: 'application/json' })
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
```

### 2. Import Utilities

```javascript
/**
 * Validate import file schema
 * @param {Object} data - Parsed JSON data
 * @returns {{valid: boolean, errors: string[]}}
 */
export const validateImportData = data => {
	const errors = []

	// Required fields
	if (!data.version) errors.push('Missing required field: version')
	if (!data.exportedAt) errors.push('Missing required field: exportedAt')
	if (!data.adoptedPractices) errors.push('Missing required field: adoptedPractices')

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
 * Check if file version is compatible
 * @param {string} fileVersion - Version from import file
 * @returns {boolean}
 */
const isVersionCompatible = fileVersion => {
	// For now, only support 1.x.x versions
	return fileVersion.startsWith('1.')
}

/**
 * Parse and validate import file
 * @param {File} file - File object from input
 * @returns {Promise<{success: boolean, data?: Set<string>, error?: string}>}
 */
export const parseImportFile = async file => {
	try {
		// Read file as text
		const text = await file.text()

		// Parse JSON
		let data
		try {
			data = JSON.parse(text)
		} catch (parseError) {
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

		// Extract practice IDs
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
 * @returns {Promise<{success: boolean, imported: Set<string>, invalid: string[], error?: string}>}
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
```

### 3. Adoption Store Updates

**File:** `src/lib/stores/adoptionStore.js` (add new methods)

```javascript
// Add to existing adoptionStore

const adoptionStore = {
	// ... existing methods ...

	/**
	 * Export adoption state to file
	 */
	export: totalPractices => {
		const adoptedSet = get({ subscribe })
		exportAdoptionState(adoptedSet, totalPractices)
	},

	/**
	 * Import adoption state from file
	 * @param {File} file - File object
	 * @param {Set<string>} validPracticeIds - Valid practice IDs
	 * @returns {Promise<{success: boolean, message: string, stats: Object}>}
	 */
	import: async (file, validPracticeIds) => {
		const result = await importAdoptionState(file, validPracticeIds)

		if (!result.success) {
			return {
				success: false,
				message: result.error,
				stats: {}
			}
		}

		// Update store with imported state
		set(result.imported)

		// Update URL and localStorage
		updateURLWithAdoptionState(result.imported)
		saveAdoptionState(result.imported)

		// Build result message
		const stats = {
			imported: result.imported.size,
			invalid: result.invalid.length,
			total: result.imported.size + result.invalid.length
		}

		let message = `Successfully imported ${stats.imported} practice(s)`
		if (stats.invalid > 0) {
			message += `. Warning: ${stats.invalid} invalid practice ID(s) were skipped.`
		}

		return {
			success: true,
			message,
			stats,
			invalidIds: result.invalid
		}
	}
}
```

---

## UI Components

### 1. ExportImportButtons Component

**File:** `src/lib/components/ExportImportButtons.svelte`

```svelte
<script>
	import { adoptionStore, adoptionCount } from '$lib/stores/adoptionStore.js'
	import { faDownload, faUpload } from '@fortawesome/free-solid-svg-icons'
	import Fa from 'svelte-fa'

	const { totalPracticeCount = 54, validPracticeIds = new Set() } = $props()

	let importInput
	let importStatus = $state({ show: false, message: '', type: 'info' })

	// Handle export button click
	function handleExport() {
		adoptionStore.export(totalPracticeCount)
	}

	// Handle import button click (trigger file input)
	function handleImportClick() {
		importInput?.click()
	}

	// Handle file selection
	async function handleFileSelect(event) {
		const file = event.target.files?.[0]
		if (!file) return

		// Show loading state
		importStatus = { show: true, message: 'Importing...', type: 'info' }

		// Confirm before overwriting
		const currentCount = $adoptionCount
		if (currentCount > 0) {
			const confirmed = confirm(
				`This will replace your current ${currentCount} adopted practice(s). Continue?`
			)
			if (!confirmed) {
				importStatus = { show: false, message: '', type: 'info' }
				event.target.value = '' // Reset input
				return
			}
		}

		// Import file
		const result = await adoptionStore.import(file, validPracticeIds)

		// Show result
		importStatus = {
			show: true,
			message: result.message,
			type: result.success ? 'success' : 'error'
		}

		// Clear status after 5 seconds
		setTimeout(() => {
			importStatus = { show: false, message: '', type: 'info' }
		}, 5000)

		// Reset file input
		event.target.value = ''
	}
</script>

<div class="flex items-center gap-3">
	<!-- Export Button -->
	<button
		onclick={handleExport}
		disabled={$adoptionCount === 0}
		class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg
           hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
           transition-colors duration-200 focus:outline-none focus:ring-2
           focus:ring-blue-500 focus:ring-offset-2"
		aria-label="Export adoption state to file"
	>
		<Fa icon={faDownload} size="sm" />
		<span>Export</span>
	</button>

	<!-- Import Button -->
	<button
		onclick={handleImportClick}
		class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg
           hover:bg-green-700 transition-colors duration-200 focus:outline-none
           focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
		aria-label="Import adoption state from file"
	>
		<Fa icon={faUpload} size="sm" />
		<span>Import</span>
	</button>

	<!-- Hidden file input -->
	<input
		bind:this={importInput}
		type="file"
		accept=".cdpa,.json,application/json,application/vnd.cd-practices.adoption+json"
		onchange={handleFileSelect}
		class="hidden"
		aria-label="Select adoption state file (.cdpa or .json)"
	/>

	<!-- Status message -->
	{#if importStatus.show}
		<div
			class="px-3 py-1 rounded-md text-sm {importStatus.type === 'success'
				? 'bg-green-100 text-green-800'
				: importStatus.type === 'error'
					? 'bg-red-100 text-red-800'
					: 'bg-blue-100 text-blue-800'}"
			role="status"
			aria-live="polite"
		>
			{importStatus.message}
		</div>
	{/if}
</div>
```

### 2. Integration in PracticeGraph

**File:** `src/lib/components/PracticeGraph.svelte` (add to UI)

```svelte
<script>
	import ExportImportButtons from './ExportImportButtons.svelte'

	// ... existing code ...

	// Get valid practice IDs for import validation
	$: validPracticeIds = new Set(allPractices.map(p => p.id))
	$: totalPracticeCount = allPractices.length
</script>

<!-- Add export/import buttons to header or toolbar -->
<div class="flex justify-between items-center mb-6">
	<h2 class="text-2xl font-bold">Practice Adoption</h2>

	<ExportImportButtons {totalPracticeCount} {validPracticeIds} />
</div>

<!-- Rest of graph UI... -->
```

---

## Unit Tests

### `tests/unit/utils/exportImport.test.js`

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
	generateExportFilename,
	createExportData,
	validateImportData,
	parseImportFile,
	importAdoptionState
} from '$lib/utils/exportImport.js'

describe('generateExportFilename', () => {
	it('generates filename with current date and .cdpa extension', () => {
		vi.setSystemTime(new Date('2025-10-25T14:30:00Z'))
		expect(generateExportFilename()).toBe('cd-practices-adoption-2025-10-25.cdpa')
	})

	it('pads single-digit months and days', () => {
		vi.setSystemTime(new Date('2025-03-05T14:30:00Z'))
		expect(generateExportFilename()).toBe('cd-practices-adoption-2025-03-05.cdpa')
	})
})

describe('createExportData', () => {
	it('creates valid export object', () => {
		const adopted = new Set(['ci', 'vc', 'at'])
		const data = createExportData(adopted, 54, '1.2.0')

		expect(data.version).toBe('1.0.0')
		expect(data.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
		expect(data.metadata.totalPractices).toBe(54)
		expect(data.metadata.adoptedCount).toBe(3)
		expect(data.metadata.adoptionPercentage).toBe(6) // 3/54 ~ 5.56% rounds to 6%
		expect(data.adoptedPractices).toEqual(['at', 'ci', 'vc']) // Sorted
	})

	it('handles empty adoption set', () => {
		const data = createExportData(new Set(), 54)
		expect(data.metadata.adoptedCount).toBe(0)
		expect(data.metadata.adoptionPercentage).toBe(0)
		expect(data.adoptedPractices).toEqual([])
	})
})

describe('validateImportData', () => {
	it('validates correct data', () => {
		const data = {
			version: '1.0.0',
			exportedAt: '2025-10-25T14:30:00Z',
			adoptedPractices: ['ci', 'vc']
		}
		const result = validateImportData(data)
		expect(result.valid).toBe(true)
		expect(result.errors).toHaveLength(0)
	})

	it('rejects missing version', () => {
		const data = {
			exportedAt: '2025-10-25T14:30:00Z',
			adoptedPractices: []
		}
		const result = validateImportData(data)
		expect(result.valid).toBe(false)
		expect(result.errors).toContain('Missing required field: version')
	})

	it('rejects non-array adoptedPractices', () => {
		const data = {
			version: '1.0.0',
			exportedAt: '2025-10-25T14:30:00Z',
			adoptedPractices: 'not-an-array'
		}
		const result = validateImportData(data)
		expect(result.valid).toBe(false)
		expect(result.errors).toContain('adoptedPractices must be an array')
	})
})

describe('parseImportFile', () => {
	it('parses valid JSON file', async () => {
		const fileContent = JSON.stringify({
			version: '1.0.0',
			exportedAt: '2025-10-25T14:30:00Z',
			adoptedPractices: ['ci', 'vc']
		})
		const file = new File([fileContent], 'test.json', { type: 'application/json' })

		const result = await parseImportFile(file)
		expect(result.success).toBe(true)
		expect(result.data).toEqual(new Set(['ci', 'vc']))
	})

	it('rejects invalid JSON', async () => {
		const file = new File(['not valid json{'], 'test.json', { type: 'application/json' })
		const result = await parseImportFile(file)
		expect(result.success).toBe(false)
		expect(result.error).toContain('Invalid JSON format')
	})
})

describe('importAdoptionState', () => {
	it('filters out invalid practice IDs', async () => {
		const fileContent = JSON.stringify({
			version: '1.0.0',
			exportedAt: '2025-10-25T14:30:00Z',
			adoptedPractices: ['ci', 'vc', 'invalid-id', 'fake-practice']
		})
		const file = new File([fileContent], 'test.json', { type: 'application/json' })
		const validIds = new Set(['ci', 'vc', 'at'])

		const result = await importAdoptionState(file, validIds)

		expect(result.success).toBe(true)
		expect(result.imported).toEqual(new Set(['ci', 'vc']))
		expect(result.invalid).toEqual(['invalid-id', 'fake-practice'])
	})
})
```

---

## E2E Tests

### `tests/e2e/export-import.spec.js`

```javascript
import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs/promises'

test.describe('Export/Import Adoption State', () => {
	test('should export adoption state to JSON file', async ({ page }) => {
		await page.goto('/')

		// Adopt some practices
		await page.locator('[data-practice-id="version-control"] [role="checkbox"]').click()
		await page.locator('[data-practice-id="automated-testing"] [role="checkbox"]').click()

		// Setup download handler
		const downloadPromise = page.waitForEvent('download')

		// Click export button
		await page.locator('button:has-text("Export")').click()

		// Wait for download
		const download = await downloadPromise
		const filename = download.suggestedFilename()

		// Verify filename format (.cdpa extension)
		expect(filename).toMatch(/^cd-practices-adoption-\d{4}-\d{2}-\d{2}\.cdpa$/)

		// Save and read file
		const downloadPath = await download.path()
		const content = await fs.readFile(downloadPath, 'utf-8')
		const data = JSON.parse(content)

		// Verify file structure
		expect(data.version).toBe('1.0.0')
		expect(data.adoptedPractices).toContain('version-control')
		expect(data.adoptedPractices).toContain('automated-testing')
		expect(data.metadata.adoptedCount).toBe(2)
	})

	test('should import adoption state from file', async ({ page }) => {
		await page.goto('/')

		// Create test export file
		const exportData = {
			version: '1.0.0',
			exportedAt: new Date().toISOString(),
			metadata: {
				totalPractices: 54,
				adoptedCount: 2,
				adoptionPercentage: 4
			},
			adoptedPractices: ['version-control', 'continuous-integration']
		}

		const tempFile = path.join(process.cwd(), 'temp-test-import.json')
		await fs.writeFile(tempFile, JSON.stringify(exportData, null, 2))

		// Click import button and select file
		const fileInput = page.locator('input[type="file"]')
		await fileInput.setInputFiles(tempFile)

		// Wait for import to complete
		await page.waitForSelector('text=/Successfully imported/')

		// Verify practices are adopted
		const vcCheckbox = page.locator('[data-practice-id="version-control"] [role="checkbox"]')
		await expect(vcCheckbox).toHaveAttribute('aria-checked', 'true')

		const ciCheckbox = page.locator('[data-practice-id="continuous-integration"] [role="checkbox"]')
		await expect(ciCheckbox).toHaveAttribute('aria-checked', 'true')

		// Cleanup
		await fs.unlink(tempFile)
	})
})
```

---

## Summary

### New Files Created

- `src/lib/utils/exportImport.js` - Export/import utilities
- `src/lib/components/ExportImportButtons.svelte` - UI component
- `tests/unit/utils/exportImport.test.js` - Unit tests
- `tests/e2e/export-import.spec.js` - E2E tests

### Features Added

✅ Export adoption state to JSON file
✅ Import adoption state from JSON file
✅ Filename includes current date
✅ File validation (schema, version, data types)
✅ Invalid practice ID filtering
✅ Overwrite confirmation dialog
✅ User feedback (success/error messages)
✅ Edge case handling (corrupted files, empty files, etc.)

### Estimated Time

- Export utilities: 1 hour
- Import utilities + validation: 2 hours
- UI components: 1-2 hours
- Unit tests: 1 hour
- E2E tests: 1 hour
- **Total: 6-7 hours**
