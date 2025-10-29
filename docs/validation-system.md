# CD Practices Data Validation System

## Overview

This validation system ensures the integrity and correctness of the CD practices data structure (`src/lib/data/cd-practices.json`) through JSON Schema validation and custom business rule validation.

## Features

- **IDE Integration**: Real-time validation in VS Code with IntelliSense
- **JSON Schema**: Comprehensive schema for structure and type validation
- **Runtime Validation**: Pure functional validators for business rules
- **Build-time Validation**: Automated validation in CI/CD pipeline
- **Comprehensive Testing**: Full test coverage with Vitest

## Components

### 1. JSON Schema

**Location**: `/src/lib/schemas/cd-practices.schema.json`

Defines the structure and constraints for:

- Practice objects (id, name, type, category, description, requirements, benefits)
- Dependency objects (practice_id, depends_on_id)
- Metadata (source, description, version, lastUpdated)

**Validation Rules**:

- Practice IDs must be kebab-case
- Categories must be one of: `automation`, `behavior`, `behavior-enabled-automation`, `core`
- Types must be one of: `root`, `practice`
- Version must follow semantic versioning (x.y.z)
- Dates must be in ISO format (YYYY-MM-DD)

### 2. VS Code Integration

**Location**: `/.vscode/settings.json`

Provides:

- Real-time schema validation in VS Code
- IntelliSense autocomplete for valid values
- Inline error messages
- Schema-aware JSON editing

### 3. Runtime Validators

**Location**: `/src/lib/validators/cd-practices-validator.js`

Pure functional validators that check:

#### Schema Validation

- Data structure matches JSON Schema
- All required fields present
- Correct data types

#### Business Rule Validation

**Unique Practice IDs**

```javascript
validateUniquePracticeIds(data)
```

Ensures no duplicate practice IDs exist.

**Valid Dependency References**

```javascript
validateDependencyReferences(data)
```

Ensures all dependency references point to existing practices.

**No Circular Dependencies**

```javascript
validateNoCycles(data)
```

Detects circular dependency chains (e.g., A → B → C → A).

**No Self-Dependencies**

```javascript
validateNoSelfDependencies(data)
```

Ensures practices don't depend on themselves.

**Valid Categories**

```javascript
validateCategories(data)
```

Ensures all practices use valid category values.

### 4. Build Script

**Location**: `/scripts/validate-cd-practices.js`

Command-line validation script that:

- Reads the JSON data file
- Loads the JSON Schema
- Runs all validators
- Outputs formatted error messages
- Returns appropriate exit codes for CI/CD

### 5. Test Suite

**Location**: `/tests/validators/cd-practices-validator.test.js`

Comprehensive unit tests covering:

- Each validator function
- Edge cases and error conditions
- Function purity (idempotence, no mutations)
- Integration scenarios

## Usage

### IDE Validation (VS Code)

Open `src/lib/data/cd-practices.json` in VS Code. The editor will:

- Highlight validation errors in red
- Show error messages on hover
- Provide autocomplete for valid values
- Validate on save

### Manual Validation

Run validation manually:

```bash
npm run validate:data
```

This will:

- Exit with code 0 if validation passes
- Exit with code 1 if validation fails
- Print detailed error messages

### Build Integration

Validation runs automatically during build:

```bash
npm run build
```

The build will fail if validation fails, preventing invalid data from being deployed.

### Runtime Validation (Programmatic)

Import and use validators in your code:

```javascript
import { validateCdPractices } from '$lib/validators/cd-practices-validator.js'
import schema from '$lib/schemas/cd-practices.schema.json'
import data from '$lib/data/cd-practices.json'

const result = validateCdPractices(schema)(data)

if (result.success) {
	console.log('Validation passed')
} else {
	console.error('Validation failed:', result.errors)
}
```

### Individual Validators

Use individual validators for specific checks:

```javascript
import {
	validateUniquePracticeIds,
	validateDependencyReferences,
	validateNoCycles
} from '$lib/validators/cd-practices-validator.js'

const uniqueResult = validateUniquePracticeIds(data)
const referencesResult = validateDependencyReferences(data)
const cyclesResult = validateNoCycles(data)
```

## Testing

Run validator tests:

```bash
npm test -- tests/validators/cd-practices-validator.test.js
```

Run all tests:

```bash
npm test
```

## Functional Programming Principles

All validators follow these principles:

### Pure Functions

- Same input always produces same output
- No side effects
- No external dependencies

### Immutability

- Input data is never modified
- Results are new objects

### Composability

- Small, focused functions
- Can be combined for complex validation
- Testable in isolation

### Example

```javascript
// Pure function - always returns same result
const result1 = validateUniquePracticeIds(data)
const result2 = validateUniquePracticeIds(data)
// result1 === result2 (deep equality)

// Immutability - original data unchanged
const original = JSON.stringify(data)
validateUniquePracticeIds(data)
const after = JSON.stringify(data)
// original === after

// Composability
const allValidations = combineValidations([
	validateUniquePracticeIds(data),
	validateDependencyReferences(data),
	validateNoCycles(data)
])
```

## Error Handling

### Validation Result Structure

```javascript
{
  success: boolean,      // true if all validations passed
  message: string,       // Summary message
  errors: [              // Array of error objects
    {
      index: number,     // Error number (1-based)
      message: string,   // Error description
      // Additional context depends on error type:
      practice_id?: string,
      dependency?: object,
      cycle?: string[],
      duplicates?: string[]
    }
  ]
}
```

### Example Error Output

```
✗ Validation failed with 2 error(s)

  1. Duplicate practice IDs found
     Duplicates: continuous-integration, build-automation

  2. Circular dependency detected
     Cycle: practice-a -> practice-b -> practice-c -> practice-a
```

## Extending Validation

To add new validation rules:

1. **Create validator function** in `cd-practices-validator.js`:

   ```javascript
   export const validateNewRule = data => {
   	// Validation logic
   	return {
   		isValid: boolean,
   		errors: []
   	}
   }
   ```

2. **Add to validation chain** in `validateCdPractices`:

   ```javascript
   const validations = [
   	// ... existing validators
   	validateNewRule(data)
   ]
   ```

3. **Write tests** in `cd-practices-validator.test.js`:

   ```javascript
   describe('validateNewRule', () => {
   	it('returns valid result when rule passes', () => {
   		const data = buildValidData()
   		const result = validateNewRule(data)
   		expect(result.isValid).toBe(true)
   	})
   })
   ```

4. **Update schema** if structural validation needed

## Troubleshooting

### VS Code not showing validation errors

1. Check `.vscode/settings.json` exists
2. Ensure `json.validate.enable` is true
3. Reload VS Code window
4. Check schema path is correct

### Validation script fails

1. Ensure Node.js version is compatible (v18+)
2. Run `npm install` to install dependencies
3. Check file paths in script are correct
4. Verify JSON is valid (run through JSON linter)

### Tests failing

1. Run `npm install` to ensure dependencies are installed
2. Check test file matches validator exports
3. Review test data builders for correctness
4. Run tests in watch mode: `npm run test:watch`

## CI/CD Integration

The validation system integrates with CI/CD through:

1. **Pre-build validation**: `npm run build` fails if validation fails
2. **Git hooks**: Can add pre-commit hook to validate data
3. **PR checks**: Add validation to PR workflow

Example GitHub Actions workflow:

```yaml
- name: Validate CD Practices Data
  run: npm run validate:data

- name: Run Validator Tests
  run: npm test -- tests/validators/
```

## Performance

- **IDE validation**: Real-time (< 100ms)
- **Build validation**: < 1 second for typical data size
- **Runtime validation**: Pure functions with minimal overhead
- **Test execution**: All 26 tests run in < 50ms

## Future Enhancements

Potential improvements:

- Add validation for orphaned practices (no incoming dependencies)
- Validate requirement/benefit text quality
- Add statistics reporting (practice count, dependency count)
- Generate dependency graph visualization
- Add custom error codes for programmatic handling
