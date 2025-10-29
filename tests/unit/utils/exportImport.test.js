import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
	generateExportFilename,
	createExportData,
	validateImportData,
	parseImportFile,
	importAdoptionState
} from '$lib/utils/exportImport.js'

describe('exportImport', () => {
	describe('generateExportFilename', () => {
		beforeEach(() => {
			vi.useFakeTimers()
		})

		afterEach(() => {
			vi.useRealTimers()
		})

		it('generates filename with current date and .cdpa extension', () => {
			vi.setSystemTime(new Date('2025-10-25T14:30:00Z'))
			expect(generateExportFilename()).toBe('cd-practices-adoption-2025-10-25.cdpa')
		})

		it('pads single-digit months and days with zeros', () => {
			vi.setSystemTime(new Date('2025-03-05T14:30:00Z'))
			expect(generateExportFilename()).toBe('cd-practices-adoption-2025-03-05.cdpa')
		})

		it('handles December correctly', () => {
			vi.setSystemTime(new Date('2025-12-31T23:59:59Z'))
			expect(generateExportFilename()).toBe('cd-practices-adoption-2025-12-31.cdpa')
		})

		it('handles January correctly', () => {
			vi.setSystemTime(new Date('2025-01-01T12:00:00Z'))
			expect(generateExportFilename()).toBe('cd-practices-adoption-2025-01-01.cdpa')
		})
	})

	describe('createExportData', () => {
		beforeEach(() => {
			vi.useFakeTimers()
		})

		afterEach(() => {
			vi.useRealTimers()
		})

		it('creates valid export object with all required fields', () => {
			vi.setSystemTime(new Date('2025-10-25T14:30:00.000Z'))
			const adopted = new Set(['continuous-integration', 'version-control', 'automated-testing'])
			const data = createExportData(adopted, 54, '1.2.0')

			expect(data.$schema).toBe('https://json-schema.org/draft-07/schema#')
			expect(data.version).toBe('1.0.0')
			expect(data.exportedAt).toBe('2025-10-25T14:30:00.000Z')
			expect(data.metadata.totalPractices).toBe(54)
			expect(data.metadata.adoptedCount).toBe(3)
			expect(data.metadata.adoptionPercentage).toBe(6) // 3/54 ~ 5.56% rounds to 6%
			expect(data.metadata.appVersion).toBe('1.2.0')
			expect(data.adoptedPractices).toEqual([
				'automated-testing',
				'continuous-integration',
				'version-control'
			]) // Sorted alphabetically
		})

		it('handles empty adoption set', () => {
			const data = createExportData(new Set(), 54, '1.0.0')

			expect(data.metadata.adoptedCount).toBe(0)
			expect(data.metadata.adoptionPercentage).toBe(0)
			expect(data.adoptedPractices).toEqual([])
		})

		it('calculates percentage correctly for various adoption counts', () => {
			// 10 out of 54 = 18.52% rounds to 19%
			const data1 = createExportData(
				new Set(Array.from({ length: 10 }, (_, i) => `practice-${i}`)),
				54
			)
			expect(data1.metadata.adoptionPercentage).toBe(19)

			// 27 out of 54 = 50%
			const data2 = createExportData(
				new Set(Array.from({ length: 27 }, (_, i) => `practice-${i}`)),
				54
			)
			expect(data2.metadata.adoptionPercentage).toBe(50)

			// 54 out of 54 = 100%
			const data3 = createExportData(
				new Set(Array.from({ length: 54 }, (_, i) => `practice-${i}`)),
				54
			)
			expect(data3.metadata.adoptionPercentage).toBe(100)
		})

		it('uses default appVersion if not provided', () => {
			const data = createExportData(new Set(['version-control']), 54)
			expect(data.metadata.appVersion).toBe('1.0.0')
		})

		it('sorts adoptedPractices alphabetically', () => {
			const adopted = new Set(['zebra', 'apple', 'banana', 'cherry'])
			const data = createExportData(adopted, 10)

			expect(data.adoptedPractices).toEqual(['apple', 'banana', 'cherry', 'zebra'])
		})

		it('handles single practice adoption', () => {
			const data = createExportData(new Set(['version-control']), 54)

			expect(data.metadata.adoptedCount).toBe(1)
			expect(data.metadata.adoptionPercentage).toBe(2) // 1/54 ~ 1.85% rounds to 2%
			expect(data.adoptedPractices).toEqual(['version-control'])
		})

		it('exports ISO 8601 timestamp for exportedAt', () => {
			vi.setSystemTime(new Date('2025-10-25T14:30:00.000Z'))
			const data = createExportData(new Set(), 54)

			expect(data.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
		})
	})

	describe('validateImportData', () => {
		it('validates correct data with all required fields', () => {
			const data = {
				version: '1.0.0',
				exportedAt: '2025-10-25T14:30:00.000Z',
				adoptedPractices: ['continuous-integration', 'version-control']
			}

			const result = validateImportData(data)

			expect(result.valid).toBe(true)
			expect(result.errors).toEqual([])
		})

		it('validates data with empty adoptedPractices array', () => {
			const data = {
				version: '1.0.0',
				exportedAt: '2025-10-25T14:30:00.000Z',
				adoptedPractices: []
			}

			const result = validateImportData(data)

			expect(result.valid).toBe(true)
			expect(result.errors).toEqual([])
		})

		it('rejects data missing version field', () => {
			const data = {
				exportedAt: '2025-10-25T14:30:00.000Z',
				adoptedPractices: ['version-control']
			}

			const result = validateImportData(data)

			expect(result.valid).toBe(false)
			expect(result.errors).toContain('Missing required field: version')
		})

		it('rejects data missing exportedAt field', () => {
			const data = {
				version: '1.0.0',
				adoptedPractices: ['version-control']
			}

			const result = validateImportData(data)

			expect(result.valid).toBe(false)
			expect(result.errors).toContain('Missing required field: exportedAt')
		})

		it('rejects data missing adoptedPractices field', () => {
			const data = {
				version: '1.0.0',
				exportedAt: '2025-10-25T14:30:00.000Z'
			}

			const result = validateImportData(data)

			expect(result.valid).toBe(false)
			expect(result.errors).toContain('Missing required field: adoptedPractices')
		})

		it('rejects data with non-array adoptedPractices', () => {
			const data = {
				version: '1.0.0',
				exportedAt: '2025-10-25T14:30:00.000Z',
				adoptedPractices: 'not-an-array'
			}

			const result = validateImportData(data)

			expect(result.valid).toBe(false)
			expect(result.errors).toContain('adoptedPractices must be an array')
		})

		it('rejects data with object adoptedPractices', () => {
			const data = {
				version: '1.0.0',
				exportedAt: '2025-10-25T14:30:00.000Z',
				adoptedPractices: { id: 'version-control' }
			}

			const result = validateImportData(data)

			expect(result.valid).toBe(false)
			expect(result.errors).toContain('adoptedPractices must be an array')
		})

		it('rejects incompatible version (2.x.x)', () => {
			const data = {
				version: '2.0.0',
				exportedAt: '2025-10-25T14:30:00.000Z',
				adoptedPractices: []
			}

			const result = validateImportData(data)

			expect(result.valid).toBe(false)
			expect(result.errors).toContain('Incompatible file version: 2.0.0')
		})

		it('accepts compatible version (1.x.x)', () => {
			const versions = ['1.0.0', '1.0.1', '1.1.0', '1.2.3', '1.99.99']

			versions.forEach(version => {
				const data = {
					version,
					exportedAt: '2025-10-25T14:30:00.000Z',
					adoptedPractices: []
				}

				const result = validateImportData(data)

				expect(result.valid).toBe(true)
				expect(result.errors).toEqual([])
			})
		})

		it('accumulates multiple errors', () => {
			const data = {
				adoptedPractices: 'not-an-array'
			}

			const result = validateImportData(data)

			expect(result.valid).toBe(false)
			expect(result.errors).toContain('Missing required field: version')
			expect(result.errors).toContain('Missing required field: exportedAt')
			expect(result.errors).toContain('adoptedPractices must be an array')
		})
	})

	describe('parseImportFile', () => {
		// Helper to create mock file
		const createMockFile = fileContent => ({
			text: async () => fileContent
		})

		it('parses valid JSON file successfully', async () => {
			const fileContent = JSON.stringify({
				version: '1.0.0',
				exportedAt: '2025-10-25T14:30:00.000Z',
				metadata: {
					totalPractices: 54,
					adoptedCount: 2,
					adoptionPercentage: 4
				},
				adoptedPractices: ['continuous-integration', 'version-control']
			})

			const file = createMockFile(fileContent)

			const result = await parseImportFile(file)

			expect(result.success).toBe(true)
			expect(result.data).toEqual(new Set(['continuous-integration', 'version-control']))
			expect(result.metadata).toEqual({
				totalPractices: 54,
				adoptedCount: 2,
				adoptionPercentage: 4
			})
		})

		it('parses file with empty adoptedPractices array', async () => {
			const fileContent = JSON.stringify({
				version: '1.0.0',
				exportedAt: '2025-10-25T14:30:00.000Z',
				adoptedPractices: []
			})

			const file = createMockFile(fileContent)

			const result = await parseImportFile(file)

			expect(result.success).toBe(true)
			expect(result.data).toEqual(new Set())
		})

		it('rejects invalid JSON with helpful error message', async () => {
			const file = createMockFile('not valid json{')

			const result = await parseImportFile(file)

			expect(result.success).toBe(false)
			expect(result.error).toBe('Invalid JSON format. Please check the file and try again.')
		})

		it('rejects file missing required fields', async () => {
			const fileContent = JSON.stringify({
				version: '1.0.0'
				// Missing exportedAt and adoptedPractices
			})

			const file = createMockFile(fileContent)

			const result = await parseImportFile(file)

			expect(result.success).toBe(false)
			expect(result.error).toContain('Invalid file format')
			expect(result.error).toContain('Missing required field: exportedAt')
			expect(result.error).toContain('Missing required field: adoptedPractices')
		})

		it('rejects file with invalid adoptedPractices type', async () => {
			const fileContent = JSON.stringify({
				version: '1.0.0',
				exportedAt: '2025-10-25T14:30:00.000Z',
				adoptedPractices: 'not-an-array'
			})

			const file = createMockFile(fileContent)

			const result = await parseImportFile(file)

			expect(result.success).toBe(false)
			expect(result.error).toContain('adoptedPractices must be an array')
		})

		it('rejects file with incompatible version', async () => {
			const fileContent = JSON.stringify({
				version: '2.0.0',
				exportedAt: '2025-10-25T14:30:00.000Z',
				adoptedPractices: []
			})

			const file = createMockFile(fileContent)

			const result = await parseImportFile(file)

			expect(result.success).toBe(false)
			expect(result.error).toContain('Incompatible file version: 2.0.0')
		})

		it('filters out empty strings from adoptedPractices', async () => {
			const fileContent = JSON.stringify({
				version: '1.0.0',
				exportedAt: '2025-10-25T14:30:00.000Z',
				adoptedPractices: ['version-control', '', 'automated-testing', '   ']
			})

			const file = createMockFile(fileContent)

			const result = await parseImportFile(file)

			expect(result.success).toBe(true)
			expect(result.data).toEqual(new Set(['version-control', 'automated-testing']))
		})

		it('filters out non-string values from adoptedPractices', async () => {
			const fileContent = JSON.stringify({
				version: '1.0.0',
				exportedAt: '2025-10-25T14:30:00.000Z',
				adoptedPractices: ['version-control', null, 123, true, 'automated-testing']
			})

			const file = createMockFile(fileContent)

			const result = await parseImportFile(file)

			expect(result.success).toBe(true)
			expect(result.data).toEqual(new Set(['version-control', 'automated-testing']))
		})

		it('handles file read errors gracefully', async () => {
			// Create a mock file that throws an error when reading
			const mockFile = {
				text: () => Promise.reject(new Error('File read error'))
			}

			const result = await parseImportFile(mockFile)

			expect(result.success).toBe(false)
			expect(result.error).toBe('Failed to read file: File read error')
		})
	})

	describe('importAdoptionState', () => {
		// Helper to create mock file
		const createMockFile = fileContent => ({
			text: async () => fileContent
		})

		it('imports valid practices and filters invalid ones', async () => {
			const fileContent = JSON.stringify({
				version: '1.0.0',
				exportedAt: '2025-10-25T14:30:00.000Z',
				metadata: {
					totalPractices: 54,
					adoptedCount: 4,
					adoptionPercentage: 7
				},
				adoptedPractices: [
					'continuous-integration',
					'version-control',
					'invalid-practice-id',
					'fake-practice'
				]
			})

			const file = createMockFile(fileContent)
			const validIds = new Set(['continuous-integration', 'version-control', 'automated-testing'])

			const result = await importAdoptionState(file, validIds)

			expect(result.success).toBe(true)
			expect(result.imported).toEqual(new Set(['continuous-integration', 'version-control']))
			expect(result.invalid).toEqual(['invalid-practice-id', 'fake-practice'])
			expect(result.metadata).toEqual({
				totalPractices: 54,
				adoptedCount: 4,
				adoptionPercentage: 7
			})
		})

		it('imports all practices when all are valid', async () => {
			const fileContent = JSON.stringify({
				version: '1.0.0',
				exportedAt: '2025-10-25T14:30:00.000Z',
				adoptedPractices: ['continuous-integration', 'version-control', 'automated-testing']
			})

			const file = createMockFile(fileContent)
			const validIds = new Set([
				'continuous-integration',
				'version-control',
				'automated-testing',
				'trunk-based-dev'
			])

			const result = await importAdoptionState(file, validIds)

			expect(result.success).toBe(true)
			expect(result.imported).toEqual(
				new Set(['continuous-integration', 'version-control', 'automated-testing'])
			)
			expect(result.invalid).toEqual([])
		})

		it('returns empty sets when no practices are valid', async () => {
			const fileContent = JSON.stringify({
				version: '1.0.0',
				exportedAt: '2025-10-25T14:30:00.000Z',
				adoptedPractices: ['invalid-1', 'invalid-2', 'invalid-3']
			})

			const file = createMockFile(fileContent)
			const validIds = new Set(['continuous-integration', 'version-control'])

			const result = await importAdoptionState(file, validIds)

			expect(result.success).toBe(true)
			expect(result.imported).toEqual(new Set())
			expect(result.invalid).toEqual(['invalid-1', 'invalid-2', 'invalid-3'])
		})

		it('handles empty adoptedPractices array', async () => {
			const fileContent = JSON.stringify({
				version: '1.0.0',
				exportedAt: '2025-10-25T14:30:00.000Z',
				adoptedPractices: []
			})

			const file = createMockFile(fileContent)
			const validIds = new Set(['continuous-integration', 'version-control'])

			const result = await importAdoptionState(file, validIds)

			expect(result.success).toBe(true)
			expect(result.imported).toEqual(new Set())
			expect(result.invalid).toEqual([])
		})

		it('returns error when file parsing fails', async () => {
			const file = createMockFile('invalid json{')
			const validIds = new Set(['continuous-integration', 'version-control'])

			const result = await importAdoptionState(file, validIds)

			expect(result.success).toBe(false)
			expect(result.error).toBe('Invalid JSON format. Please check the file and try again.')
			expect(result.imported).toEqual(new Set())
			expect(result.invalid).toEqual([])
		})

		it('returns error when file validation fails', async () => {
			const fileContent = JSON.stringify({
				version: '2.0.0', // Incompatible version
				exportedAt: '2025-10-25T14:30:00.000Z',
				adoptedPractices: []
			})

			const file = createMockFile(fileContent)
			const validIds = new Set(['continuous-integration', 'version-control'])

			const result = await importAdoptionState(file, validIds)

			expect(result.success).toBe(false)
			expect(result.error).toContain('Incompatible file version: 2.0.0')
			expect(result.imported).toEqual(new Set())
			expect(result.invalid).toEqual([])
		})

		it('handles case where validPracticeIds is empty', async () => {
			const fileContent = JSON.stringify({
				version: '1.0.0',
				exportedAt: '2025-10-25T14:30:00.000Z',
				adoptedPractices: ['continuous-integration', 'version-control']
			})

			const file = createMockFile(fileContent)
			const validIds = new Set() // Empty valid IDs

			const result = await importAdoptionState(file, validIds)

			expect(result.success).toBe(true)
			expect(result.imported).toEqual(new Set())
			expect(result.invalid).toEqual(['continuous-integration', 'version-control'])
		})
	})
})
