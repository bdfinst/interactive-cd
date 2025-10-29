# CD Practices Validators

Pure functional validators for CD practices data validation.

## Quick Start

```javascript
import { validateCdPractices } from './cd-practices-validator.js'
import schema from '../schemas/cd-practices.schema.json'
import data from '../data/cd-practices.json'

const result = validateCdPractices(schema)(data)
console.log(result.success ? 'Valid' : 'Invalid')
```

## Available Validators

### `validateCdPractices(schema)(data)`

Main validator that runs all validation rules.

**Returns**: `{ success: boolean, message: string, errors: array }`

### `validateSchema(schema)(data)`

Validates data against JSON Schema.

### `validateUniquePracticeIds(data)`

Ensures no duplicate practice IDs.

### `validateDependencyReferences(data)`

Ensures all dependencies reference existing practices.

### `validateNoCycles(data)`

Detects circular dependencies.

### `validateNoSelfDependencies(data)`

Ensures practices don't depend on themselves.

### `validateCategories(data)`

Validates category values are correct.

### `combineValidations(validationResults)`

Combines multiple validation results into one.

### `formatValidationErrors(validationResult)`

Formats validation result for display.

## Principles

All validators are:

- **Pure functions**: Same input = same output, no side effects
- **Immutable**: Never modify input data
- **Composable**: Can be combined for complex validation
- **Testable**: Comprehensive test coverage

## Examples

### Check for duplicate IDs

```javascript
import { validateUniquePracticeIds } from './cd-practices-validator.js'

const result = validateUniquePracticeIds(data)
if (!result.isValid) {
	console.error('Duplicates:', result.errors[0].duplicates)
}
```

### Validate dependencies

```javascript
import { validateDependencyReferences } from './cd-practices-validator.js'

const result = validateDependencyReferences(data)
if (!result.isValid) {
	result.errors.forEach(err => {
		console.error(err.message, err.reason)
	})
}
```

### Custom validation chain

```javascript
import {
	combineValidations,
	validateUniquePracticeIds,
	validateNoCycles
} from './cd-practices-validator.js'

const result = combineValidations([validateUniquePracticeIds(data), validateNoCycles(data)])

console.log(result.isValid ? 'Pass' : 'Fail')
```

## Testing

All validators have comprehensive unit tests.

Run tests:

```bash
npm test -- tests/validators/cd-practices-validator.test.js
```

## See Also

- [Full Documentation](../../../docs/validation-system.md)
- [JSON Schema](../schemas/cd-practices.schema.json)
- [Test Suite](../../../tests/validators/cd-practices-validator.test.js)
