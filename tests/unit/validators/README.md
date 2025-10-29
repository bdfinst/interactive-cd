# CD Practices Schema Validation Test Suite

## Overview

This test suite provides comprehensive validation testing for the `src/lib/data/cd-practices.json` schema. The tests follow **BDD/ATDD/TDD** principles as outlined in `/CLAUDE.md` and are designed to be written **before** the actual implementation code.

## Test Philosophy

### TDD Approach

1. **Red**: Write failing tests first
2. **Green**: Write minimal code to make tests pass
3. **Refactor**: Improve code while keeping tests green

### Behavior-Focused Testing

- Tests verify **what** the system does, not **how** it does it
- Tests would catch real bugs in production
- Tests remain valid even after refactoring implementation
- Tests serve as living documentation

### Functional Programming

- All validators are pure functions (same input → same output)
- No side effects or mutations
- Tests verify referential transparency
- Composable validation functions

## Test Structure

### Directory Layout

```
tests/
├── fixtures/
│   └── cd-practices-fixtures.js    # Test data builders and examples
└── unit/
    └── validators/
        ├── practice-validator.test.js      # Practice object validation
        ├── dependency-validator.test.js    # Dependency validation
        ├── metadata-validator.test.js      # Metadata validation
        ├── schema-validator.test.js        # Full schema integration tests
        ├── edge-cases.test.js             # Edge cases and robustness
        └── README.md                       # This file
```

## Test Files

### 1. Test Fixtures (`cd-practices-fixtures.js`)

**Purpose**: Provide reusable test data for all validation tests

**Contents**:

- Valid example data (practices, dependencies, metadata, schemas)
- Invalid example data for each validation scenario
- Test data builders for flexible test creation
- Edge case data (unicode, very long strings, etc.)

**Key Exports**:

```javascript
// Valid examples
export const validPractice
export const validDependency
export const validMetadata
export const validSchema

// Invalid examples
export const practiceWithoutId
export const dependencyWithSelfReference
export const metadataWithInvalidVersion

// Builders (functional approach)
export const buildPractice = (overrides = {}) => ({ ... })
export const buildDependency = (overrides = {}) => ({ ... })
export const buildMetadata = (overrides = {}) => ({ ... })
export const buildSchema = (overrides = {}) => ({ ... })
```

### 2. Practice Validator Tests (`practice-validator.test.js`)

**Purpose**: Unit tests for individual practice object validation

**Coverage** (283 tests expected):

- ✅ Required field validation (id, name, type, category, description, requirements, benefits)
- ✅ Type validation (strings, arrays, enums)
- ✅ Format validation (kebab-case IDs, non-empty strings)
- ✅ Enum validation (type: practice/root, category: automation/behavior/behavior-enabled-automation/core)
- ✅ Array validation (requirements and benefits must be non-empty arrays of strings)
- ✅ Pure function behavior (referential transparency, no mutations)
- ✅ Edge cases (unicode, very long strings, special characters)

**Key Test Functions**:

```javascript
// Field validators
isValidPracticeId(id) // Tests: valid IDs, empty, null, wrong types
isValidPracticeName(name) // Tests: valid names, empty, special chars
isValidPracticeType(type) // Tests: 'practice', 'root', invalid
isValidPracticeCategory(cat) // Tests: valid categories, invalid
isValidRequirements(reqs) // Tests: arrays, empty, null elements
isValidBenefits(benefits) // Tests: arrays, empty, null elements

// Composite validators
validatePracticeFields(practice) // Tests: all fields together
validatePractice(practice) // Tests: complete validation
```

**Example Test Pattern**:

```javascript
describe('isValidPracticeId', () => {
	it('returns true for valid practice ID', () => {
		// Arrange
		const validId = 'continuous-integration'

		// Act
		const result = isValidPracticeId(validId)

		// Assert
		expect(result).toBe(true)
	})

	it('returns false for null ID', () => {
		expect(isValidPracticeId(null)).toBe(false)
	})
})
```

### 3. Dependency Validator Tests (`dependency-validator.test.js`)

**Purpose**: Unit tests for dependency validation and relationship integrity

**Coverage**:

- ✅ Required field validation (practice_id, depends_on_id)
- ✅ Type validation (must be strings)
- ✅ Business rules (no self-references)
- ✅ Duplicate dependency detection
- ✅ Circular dependency detection
- ✅ Cross-validation with practices (IDs must exist)
- ✅ Dependency graph construction
- ✅ Pure function behavior

**Key Test Functions**:

```javascript
// Basic validators
isValidDependencyIds(practiceId, dependsOnId) // Tests: valid IDs, types
hasSelfReference(practiceId, dependsOnId) // Tests: self-refs
validateDependency(dependency) // Tests: complete validation

// Graph analysis
findDuplicateDependencies(deps) // Tests: duplicates
findCircularDependencies(deps) // Tests: A→B→C→A cycles
buildDependencyGraph(deps) // Tests: adjacency list
getAllDependenciesForPractice(id) // Tests: direct deps

// Cross-validation
validateDependenciesAgainstPractices(deps, practices)
```

**Critical Business Rules**:

1. No self-references: A practice cannot depend on itself
2. No duplicates: Same dependency cannot be listed twice
3. No circular dependencies: A→B→C→A is invalid
4. References must exist: Both IDs must reference actual practices

### 4. Metadata Validator Tests (`metadata-validator.test.js`)

**Purpose**: Unit tests for metadata validation

**Coverage**:

- ✅ Required field validation (version, lastUpdated)
- ✅ Semantic version validation (major.minor.patch)
- ✅ Date format validation (YYYY-MM-DD)
- ✅ Date range validation (reasonable dates)
- ✅ Optional field validation (changelog, source, description)
- ✅ Version comparison logic
- ✅ Pure function behavior

**Key Test Functions**:

```javascript
// Format validators
isValidVersion(version) // Tests: semver format
isValidDateFormat(date) // Tests: YYYY-MM-DD
isValidDate(date) // Tests: reasonable range

// Parsers
parseSemanticVersion(version) // Tests: parsing major.minor.patch
compareVersions(v1, v2) // Tests: version comparison

// Complete validation
validateMetadata(metadata) // Tests: all fields
```

**Semantic Versioning Support**:

- Valid: `1.0.0`, `1.2.3`, `10.20.30`
- Pre-release: `1.0.0-alpha`, `1.0.0-beta.1`
- Build metadata: `1.0.0+build.123`
- Invalid: `1.0`, `1`, `v1.0.0`, `01.0.0`

**Date Format**:

- Valid: `2025-01-01`, `2025-10-21`
- Invalid: `01/01/2025`, `2025/01/01`, `10-21-2025`
- Validates leap years and days per month

### 5. Schema Validator Tests (`schema-validator.test.js`)

**Purpose**: Integration tests for full schema validation

**Coverage**:

- ✅ Schema structure validation (practices, dependencies, metadata)
- ✅ Cross-validation (dependencies reference existing practices)
- ✅ Duplicate practice ID detection
- ✅ Circular dependency detection
- ✅ Root practice requirement validation
- ✅ Practice/dependency/metadata integration
- ✅ File loading and validation
- ✅ Real data validation (actual cd-practices.json)

**Key Test Functions**:

```javascript
// Structure validation
validateSchemaStructure(schema) // Tests: top-level structure

// ID validation
findDuplicatePracticeIds(practices) // Tests: unique IDs
validatePracticeIds(practices) // Tests: ID uniqueness

// Complete validation
validateSchema(schema) // Tests: all validation
validateFullSchema(schema) // Tests: with summary
loadAndValidateSchema(filePath) // Tests: file loading

// Real-world validation
// Tests against actual /src/lib/data/cd-practices.json
```

**Integration Test Scenarios**:

1. All practices are valid
2. All dependencies reference existing practices
3. No duplicate practice IDs
4. No circular dependencies
5. At least one root practice exists
6. Metadata is complete and valid
7. Schema can be loaded from file
8. Real data file passes all validations

### 6. Edge Case Tests (`edge-cases.test.js`)

**Purpose**: Robustness testing for unusual inputs and boundary conditions

**Coverage**:

- ✅ Null/undefined handling
- ✅ Empty strings and whitespace
- ✅ Very large inputs (10,000+ characters, 1,000+ array elements)
- ✅ Unicode characters (中文, العربية, עברית, 🚀)
- ✅ Special characters (zero-width, right-to-left)
- ✅ Type coercion edge cases
- ✅ Boundary values (minimum/maximum inputs)
- ✅ Malformed data structures
- ✅ Circular object references
- ✅ Memory and performance limits

**Test Categories**:

1. **Null/Undefined**: Every validator handles null/undefined gracefully
2. **Empty/Whitespace**: Rejects empty strings, whitespace-only strings, tabs/newlines
3. **Large Inputs**: 10,000 char strings, 1,000+ element arrays, 5,000+ practices
4. **Unicode**: Chinese, Arabic, Hebrew, Russian, Japanese, emojis
5. **Special Chars**: Zero-width, right-to-left, control characters
6. **Wrong Types**: Numbers as strings, objects as arrays, etc.
7. **Boundaries**: Single-element arrays, minimum field lengths, date/version boundaries
8. **Malformed**: Arrays as objects, strings as numbers, circular references

## Test Execution

### Running Tests

```bash
# Run all validator tests
npm test tests/unit/validators

# Run specific test file
npm test tests/unit/validators/practice-validator.test.js

# Run in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

### Expected Test Results

When implementation is complete, all tests should pass:

```
✓ Practice Validation (Unit) (150+ tests)
✓ Dependency Validation (Unit) (80+ tests)
✓ Metadata Validation (Unit) (70+ tests)
✓ Schema Validation (Integration) (50+ tests)
✓ Edge Cases (100+ tests)

Total: 450+ tests
```

## Validation Flow

### Practice Validation Flow

```
Input: Practice Object
  ↓
Check structure (object, not null/undefined)
  ↓
Validate required fields
  ├─ id: non-empty string
  ├─ name: non-empty string
  ├─ type: 'practice' | 'root'
  ├─ category: 'automation' | 'behavior' | 'behavior-enabled-automation' | 'core'
  ├─ description: non-empty string
  ├─ requirements: non-empty array of non-empty strings
  └─ benefits: non-empty array of non-empty strings
  ↓
Return validation result
  {
    isValid: boolean,
    errors: { field: 'error message' },
    practice: originalPractice
  }
```

### Dependency Validation Flow

```
Input: Dependency Object
  ↓
Check structure
  ↓
Validate fields
  ├─ practice_id: non-empty string
  └─ depends_on_id: non-empty string
  ↓
Check self-reference
  └─ practice_id !== depends_on_id
  ↓
Cross-validate against practices
  ├─ practice_id exists in practices
  └─ depends_on_id exists in practices
  ↓
Check for duplicates
  └─ No duplicate (practice_id, depends_on_id) pairs
  ↓
Check for circular dependencies
  └─ No A→B→C→A cycles
  ↓
Return validation result
```

### Full Schema Validation Flow

```
Input: Schema Object
  ↓
Validate structure
  ├─ practices: array with at least one element
  ├─ dependencies: array (can be empty)
  └─ metadata: object
  ↓
Validate each practice
  └─ All practices are valid
  ↓
Check for duplicate practice IDs
  └─ All practice IDs are unique
  ↓
Validate each dependency
  └─ All dependencies are valid
  ↓
Cross-validate dependencies
  ├─ All dependencies reference existing practices
  ├─ No duplicate dependencies
  └─ No circular dependencies
  ↓
Validate metadata
  └─ Metadata is valid
  ↓
Check business rules
  └─ At least one root practice exists
  ↓
Return validation result with summary
  {
    isValid: boolean,
    errors: { category: [errors] },
    warnings: [warnings],
    summary: {
      totalPractices: number,
      totalDependencies: number,
      practicesByType: { practice: n, root: m },
      practicesByCategory: { automation: n, ... }
    }
  }
```

## Implementation Guidance

### Step 1: Create Validator Functions (TDD)

Start with the simplest validators and work up to complex ones:

1. **Basic validators** (pure predicates):

   ```javascript
   // src/lib/validators/practice-validator.js
   export const isValidPracticeId = id => {
   	return typeof id === 'string' && id.trim().length > 0
   }
   ```

2. **Field validators** (return validation results):

   ```javascript
   export const validatePracticeFields = practice => {
   	const errors = {}

   	if (!isValidPracticeId(practice?.id)) {
   		errors.id = 'Practice ID is required and must be a non-empty string'
   	}

   	// ... validate other fields

   	return {
   		isValid: Object.keys(errors).length === 0,
   		errors
   	}
   }
   ```

3. **Composite validators** (combine validations):

   ```javascript
   export const validatePractice = practice => {
   	if (!practice || typeof practice !== 'object') {
   		return {
   			isValid: false,
   			errors: { practice: 'Practice must be an object' },
   			practice: null
   		}
   	}

   	const fieldValidation = validatePracticeFields(practice)

   	return {
   		...fieldValidation,
   		practice
   	}
   }
   ```

### Step 2: Implement Graph Algorithms

For circular dependency detection:

```javascript
export const findCircularDependencies = dependencies => {
	const graph = buildDependencyGraph(dependencies)
	const visited = new Set()
	const recursionStack = new Set()
	const cycles = []

	const detectCycle = (node, path = []) => {
		if (recursionStack.has(node)) {
			// Cycle detected
			const cycleStart = path.indexOf(node)
			cycles.push(path.slice(cycleStart).concat(node))
			return
		}

		if (visited.has(node)) return

		visited.add(node)
		recursionStack.add(node)

		const neighbors = graph[node] || []
		neighbors.forEach(neighbor => {
			detectCycle(neighbor, [...path, node])
		})

		recursionStack.delete(node)
	}

	Object.keys(graph).forEach(node => detectCycle(node))

	return cycles
}
```

### Step 3: Implement Cross-Validation

Link validators together:

```javascript
export const validateSchema = schema => {
	// Validate structure
	const structureResult = validateSchemaStructure(schema)
	if (!structureResult.isValid) return structureResult

	// Validate practices
	const practiceResults = schema.practices.map(validatePractice)
	const invalidPractices = practiceResults.filter(r => !r.isValid)

	// Validate dependencies
	const dependencyResults = schema.dependencies.map(validateDependency)
	const invalidDependencies = dependencyResults.filter(r => !r.isValid)

	// Cross-validate
	const crossValidation = validateDependenciesAgainstPractices(
		schema.dependencies,
		schema.practices
	)

	// Combine results
	return {
		isValid:
			invalidPractices.length === 0 && invalidDependencies.length === 0 && crossValidation.isValid,
		errors: {
			practices: invalidPractices,
			dependencies: invalidDependencies,
			crossValidation: crossValidation.errors
		}
	}
}
```

## IDE Integration

### VS Code JSON Schema

Create `.vscode/settings.json`:

```json
{
	"json.schemas": [
		{
			"fileMatch": ["src/lib/data/cd-practices.json"],
			"url": "./schemas/cd-practices-schema.json"
		}
	]
}
```

### JSON Schema Definition

Create `schemas/cd-practices-schema.json`:

```json
{
	"$schema": "http://json-schema.org/draft-07/schema#",
	"title": "CD Practices Schema",
	"type": "object",
	"required": ["practices", "dependencies", "metadata"],
	"properties": {
		"practices": {
			"type": "array",
			"minItems": 1,
			"items": { "$ref": "#/definitions/practice" }
		},
		"dependencies": {
			"type": "array",
			"items": { "$ref": "#/definitions/dependency" }
		},
		"metadata": { "$ref": "#/definitions/metadata" }
	},
	"definitions": {
		"practice": {
			"type": "object",
			"required": ["id", "name", "type", "category", "description", "requirements", "benefits"],
			"properties": {
				"id": { "type": "string", "minLength": 1 },
				"name": { "type": "string", "minLength": 1 },
				"type": { "enum": ["practice", "root"] },
				"category": { "enum": ["automation", "behavior", "behavior-enabled-automation", "core"] },
				"description": { "type": "string", "minLength": 1 },
				"requirements": {
					"type": "array",
					"minItems": 1,
					"items": { "type": "string", "minLength": 1 }
				},
				"benefits": {
					"type": "array",
					"minItems": 1,
					"items": { "type": "string", "minLength": 1 }
				}
			}
		},
		"dependency": {
			"type": "object",
			"required": ["practice_id", "depends_on_id"],
			"properties": {
				"practice_id": { "type": "string", "minLength": 1 },
				"depends_on_id": { "type": "string", "minLength": 1 }
			}
		},
		"metadata": {
			"type": "object",
			"required": ["version", "lastUpdated"],
			"properties": {
				"version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+(-[\\w.]+)?(\\+[\\w.]+)?$" },
				"lastUpdated": { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$" },
				"changelog": { "type": "string" },
				"source": { "type": "string" },
				"description": { "type": "string" }
			}
		}
	}
}
```

## Continuous Integration

Add to CI pipeline:

```yaml
# .github/workflows/test.yml
- name: Run validation tests
  run: npm test tests/unit/validators

- name: Validate actual data file
  run: node scripts/validate-schema.js
```

Create validation script:

```javascript
// scripts/validate-schema.js
import { loadAndValidateSchema } from './src/lib/validators/schema-validator.js'

const filePath = './src/lib/data/cd-practices.json'
const result = await loadAndValidateSchema(filePath)

if (!result.isValid) {
	console.error('Schema validation failed:')
	console.error(JSON.stringify(result.errors, null, 2))
	process.exit(1)
}

console.log('✅ Schema validation passed')
console.log(`   Practices: ${result.summary.totalPractices}`)
console.log(`   Dependencies: ${result.summary.totalDependencies}`)
```

## Benefits of This Test Suite

1. **Catches bugs early**: Invalid data is caught before it reaches production
2. **Living documentation**: Tests describe expected behavior clearly
3. **Refactoring safety**: Can refactor validators with confidence
4. **IDE integration**: JSON schema provides autocomplete and validation
5. **CI/CD integration**: Automated validation on every commit
6. **Pure functions**: Easy to test, reason about, and compose
7. **Comprehensive coverage**: 450+ tests cover all scenarios
8. **Edge case handling**: Robust against unusual inputs

## Next Steps

After implementing validators:

1. ✅ Run tests to verify all pass
2. ✅ Add JSON schema for IDE integration
3. ✅ Create CI validation script
4. ✅ Add pre-commit hook for validation
5. ✅ Document validation rules in main README
6. ✅ Create migration guide for existing data

## Resources

- TDD Guide: `/CLAUDE.md`
- Functional Programming: `/CLAUDE.md` (FP Patterns section)
- Test Patterns: `tests/unit/domain/practice-catalog/CDPractice.test.js`
- Existing Data: `/src/lib/data/cd-practices.json`
