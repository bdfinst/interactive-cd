/**
 * Test Fixtures for CD Practices Validation
 *
 * Following BDD/TDD principles, these fixtures provide:
 * - Valid data examples for positive tests
 * - Invalid data examples for negative tests
 * - Edge cases for boundary testing
 * - Test data builders for flexible test creation
 */

// Valid Practice Examples
export const validPractice = {
	id: 'continuous-integration',
	name: 'Continuous Integration',
	type: 'practice',
	category: 'behavior',
	description: 'Integrate code changes frequently to detect integration issues early.',
	requirements: [
		'Use Trunk-based Development',
		'Integrate work to trunk at least daily',
		'Automated testing before merging'
	],
	benefits: [
		'Early detection of integration issues',
		'Reduced merge conflicts',
		'Always-releasable codebase'
	]
}

export const validRootPractice = {
	id: 'continuous-delivery',
	name: 'Continuous Delivery',
	type: 'root',
	category: 'core',
	description: 'Continuous delivery improves both delivery performance and quality.',
	requirements: [
		'Use Continuous Integration',
		'Application pipeline is the only path to production'
	],
	benefits: ['Improved delivery performance', 'Higher quality releases', 'Better team culture']
}

export const minimalValidPractice = {
	id: 'test-practice',
	name: 'Test Practice',
	type: 'practice',
	category: 'automation',
	description: 'A test practice for validation.',
	requirements: ['At least one requirement'],
	benefits: ['At least one benefit']
}

// Valid Dependency Examples
export const validDependency = {
	practice_id: 'continuous-delivery',
	depends_on_id: 'continuous-integration'
}

// Valid Metadata Example
export const validMetadata = {
	changelog: 'Updated categories to match 2015 CD model',
	source: 'MinimumCD.org',
	description: 'Hierarchical data structure for Continuous Delivery practices',
	version: '1.7.0',
	lastUpdated: '2025-10-21'
}

// Complete Valid Schema
export const validSchema = {
	practices: [validPractice, validRootPractice],
	dependencies: [validDependency],
	metadata: validMetadata
}

// Invalid Practice Examples - Missing Required Fields
export const practiceWithoutId = {
	name: 'Test Practice',
	type: 'practice',
	category: 'automation',
	description: 'Missing ID field',
	requirements: ['Req 1'],
	benefits: ['Benefit 1']
}

export const practiceWithoutName = {
	id: 'test-practice',
	type: 'practice',
	category: 'automation',
	description: 'Missing name field',
	requirements: ['Req 1'],
	benefits: ['Benefit 1']
}

export const practiceWithoutType = {
	id: 'test-practice',
	name: 'Test Practice',
	category: 'automation',
	description: 'Missing type field',
	requirements: ['Req 1'],
	benefits: ['Benefit 1']
}

export const practiceWithoutCategory = {
	id: 'test-practice',
	name: 'Test Practice',
	type: 'practice',
	description: 'Missing category field',
	requirements: ['Req 1'],
	benefits: ['Benefit 1']
}

export const practiceWithoutDescription = {
	id: 'test-practice',
	name: 'Test Practice',
	type: 'practice',
	category: 'automation',
	requirements: ['Req 1'],
	benefits: ['Benefit 1']
}

export const practiceWithoutRequirements = {
	id: 'test-practice',
	name: 'Test Practice',
	type: 'practice',
	category: 'automation',
	description: 'Missing requirements field',
	benefits: ['Benefit 1']
}

export const practiceWithoutBenefits = {
	id: 'test-practice',
	name: 'Test Practice',
	type: 'practice',
	category: 'automation',
	description: 'Missing benefits field',
	requirements: ['Req 1']
}

// Invalid Practice Examples - Wrong Types
export const practiceWithNullId = {
	...validPractice,
	id: null
}

export const practiceWithEmptyId = {
	...validPractice,
	id: ''
}

export const practiceWithWhitespaceId = {
	...validPractice,
	id: '   '
}

export const practiceWithNumberId = {
	...validPractice,
	id: 123
}

export const practiceWithInvalidType = {
	...validPractice,
	type: 'invalid-type'
}

export const practiceWithInvalidCategory = {
	...validPractice,
	category: 'invalid-category'
}

export const practiceWithNonArrayRequirements = {
	...validPractice,
	requirements: 'Not an array'
}

export const practiceWithEmptyRequirements = {
	...validPractice,
	requirements: []
}

export const practiceWithNullRequirement = {
	...validPractice,
	requirements: ['Valid requirement', null, 'Another valid']
}

export const practiceWithEmptyStringRequirement = {
	...validPractice,
	requirements: ['Valid requirement', '', 'Another valid']
}

export const practiceWithNonArrayBenefits = {
	...validPractice,
	benefits: 'Not an array'
}

export const practiceWithEmptyBenefits = {
	...validPractice,
	benefits: []
}

export const practiceWithNullBenefit = {
	...validPractice,
	benefits: ['Valid benefit', null, 'Another valid']
}

// Invalid Dependency Examples
export const dependencyWithoutPracticeId = {
	depends_on_id: 'version-control'
}

export const dependencyWithoutDependsOnId = {
	practice_id: 'continuous-integration'
}

export const dependencyWithEmptyPracticeId = {
	practice_id: '',
	depends_on_id: 'version-control'
}

export const dependencyWithNonStringIds = {
	practice_id: 123,
	depends_on_id: 456
}

export const dependencyWithSelfReference = {
	practice_id: 'continuous-integration',
	depends_on_id: 'continuous-integration'
}

export const dependencyWithNonExistentPractice = {
	practice_id: 'non-existent-practice',
	depends_on_id: 'version-control'
}

export const dependencyWithNonExistentDependency = {
	practice_id: 'continuous-integration',
	depends_on_id: 'non-existent-dependency'
}

// Invalid Metadata Examples
export const metadataWithoutVersion = {
	...validMetadata,
	version: undefined
}

export const metadataWithInvalidVersion = {
	...validMetadata,
	version: '1.2'
}

export const metadataWithoutLastUpdated = {
	...validMetadata,
	lastUpdated: undefined
}

export const metadataWithInvalidDateFormat = {
	...validMetadata,
	lastUpdated: '10/21/2025'
}

// Invalid Schema Examples
export const schemaWithoutPractices = {
	dependencies: [validDependency],
	metadata: validMetadata
}

export const schemaWithNonArrayPractices = {
	practices: 'Not an array',
	dependencies: [validDependency],
	metadata: validMetadata
}

export const schemaWithEmptyPractices = {
	practices: [],
	dependencies: [validDependency],
	metadata: validMetadata
}

export const schemaWithoutDependencies = {
	practices: [validPractice],
	metadata: validMetadata
}

export const schemaWithNonArrayDependencies = {
	practices: [validPractice],
	dependencies: 'Not an array',
	metadata: validMetadata
}

export const schemaWithoutMetadata = {
	practices: [validPractice],
	dependencies: [validDependency]
}

export const schemaWithNonObjectMetadata = {
	practices: [validPractice],
	dependencies: [validDependency],
	metadata: 'Not an object'
}

// Test Data Builders (Functional approach)
export const buildPractice = (overrides = {}) => ({
	id: 'test-practice',
	name: 'Test Practice',
	type: 'practice',
	category: 'automation',
	description: 'A test practice for validation.',
	requirements: ['Requirement 1', 'Requirement 2'],
	benefits: ['Benefit 1', 'Benefit 2'],
	...overrides
})

export const buildDependency = (overrides = {}) => ({
	practice_id: 'practice-a',
	depends_on_id: 'practice-b',
	...overrides
})

export const buildMetadata = (overrides = {}) => ({
	changelog: 'Test changelog',
	source: 'Test source',
	description: 'Test description',
	version: '1.0.0',
	lastUpdated: '2025-01-01',
	...overrides
})

export const buildSchema = (overrides = {}) => ({
	practices: [buildPractice()],
	dependencies: [buildDependency()],
	metadata: buildMetadata(),
	...overrides
})

// Valid Type and Category Enums
export const VALID_TYPES = ['practice', 'root']
export const VALID_CATEGORIES = ['automation', 'behavior', 'behavior-enabled-automation', 'core']

// Edge Case Data
export const practiceWithUnicodeCharacters = {
	...validPractice,
	description: 'Test with unicode: 你好世界 🚀 émojis and spëcial çhars'
}

export const practiceWithVeryLongStrings = {
	...validPractice,
	description: 'A'.repeat(10000),
	requirements: ['B'.repeat(5000)],
	benefits: ['C'.repeat(5000)]
}

export const practiceWithSpecialCharactersInId = {
	...validPractice,
	id: 'test@practice#123'
}

export const dependencyWithDuplicates = [
	{ practice_id: 'practice-a', depends_on_id: 'practice-b' },
	{ practice_id: 'practice-a', depends_on_id: 'practice-b' }
]

export const practicesWithDuplicateIds = [
	{ ...validPractice, id: 'duplicate-id' },
	{ ...validPractice, id: 'duplicate-id' }
]

// Circular Dependency Examples
export const circularDependencies = [
	{ practice_id: 'practice-a', depends_on_id: 'practice-b' },
	{ practice_id: 'practice-b', depends_on_id: 'practice-c' },
	{ practice_id: 'practice-c', depends_on_id: 'practice-a' }
]
