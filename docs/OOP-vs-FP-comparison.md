# OOP vs FP: CDPractice Comparison

## Class-Based (Current)

```javascript
// Create and mutate
const practice = new CDPractice(id, name, category, description)
practice.addRequirement('Must have CI/CD pipeline')
practice.addBenefit('Faster feedback')

// Access via getters
console.log(practice.requirements)  // ['Must have CI/CD pipeline']
console.log(practice.hasPrerequisites())  // false
```

**Characteristics:**
- ✅ Familiar OOP pattern
- ✅ Encapsulation via private fields
- ✅ Methods bundled with data
- ❌ Mutable (methods change internal state)
- ❌ Side effects (violates FP principles)
- ❌ Harder to test (need to check state changes)

---

## Functional (Immutable)

```javascript
// Create and transform (returns new objects)
const practice = createCDPractice(id, name, category, description)
const withReq = withRequirement(practice, 'Must have CI/CD pipeline')
const withBenefit = withBenefit(withReq, 'Faster feedback')

// Or compose
const fullPractice = pipePractice(
  p => withRequirement(p, 'Must have CI/CD pipeline'),
  p => withBenefit(p, 'Faster feedback')
)(practice)

// Access via properties (immutable)
console.log(fullPractice.requirements)  // ['Must have CI/CD pipeline']
console.log(hasPrerequisites(fullPractice))  // false
```

**Characteristics:**
- ✅ Immutable (no state changes)
- ✅ Pure functions (same input → same output)
- ✅ Composable (pipe/compose transformations)
- ✅ Time-travel debugging (keep all versions)
- ✅ Easier testing (no side effects)
- ✅ Referential transparency
- ❌ More memory (creates new objects)
- ❌ Less familiar to OOP developers
- ❌ Can be verbose for simple changes

---

## Side-by-Side Examples

### Adding Multiple Items

**OOP:**
```javascript
const practice = new CDPractice(id, name, category, description)
practice.addRequirement('Req 1')
practice.addRequirement('Req 2')
practice.addBenefit('Benefit 1')
```

**FP:**
```javascript
const practice = createCDPractice(id, name, category, description)
const result = pipePractice(
  p => withRequirement(p, 'Req 1'),
  p => withRequirement(p, 'Req 2'),
  p => withBenefit(p, 'Benefit 1')
)(practice)

// Or using reduce
const requirements = ['Req 1', 'Req 2']
const result = withRequirements(practice, requirements)
```

### Querying State

**OOP:**
```javascript
practice.hasPrerequisites()  // method call
practice.getRequirementCount()  // method call
practice.requirements  // getter
```

**FP:**
```javascript
hasPrerequisites(practice)  // function call
getRequirementCount(practice)  // function call
practice.requirements  // direct property access
```

---

## Performance Comparison

| Operation | OOP (Class) | FP (Immutable) |
|-----------|-------------|----------------|
| Create | O(1) | O(1) |
| Add item | O(1) mutate | O(n) copy array |
| Read | O(1) | O(1) |
| Memory | 1 instance | n instances (history) |

---

## When to Use Each

### Use Class (OOP)
- Entity with complex lifecycle
- Performance-critical mutations
- Need polymorphism/inheritance
- Team prefers OOP patterns
- Legacy code integration

### Use Functional (FP)
- Emphasize immutability
- Need time-travel/undo functionality
- Concurrent/parallel operations
- Redux/state management integration
- Pure domain logic without side effects
- Testing/reasoning about code

---

## Hybrid Approach (Recommended)

Keep the class but make it more functional:

```javascript
export class CDPractice {
  #data  // Immutable object

  constructor(id, name, category, description, data = {}) {
    this.#data = Object.freeze({
      id,
      name: name.trim(),
      category,
      description: description.trim(),
      practicePrerequisites: [...(data.practicePrerequisites || [])],
      capabilityPrerequisites: [...(data.capabilityPrerequisites || [])],
      requirements: [...(data.requirements || [])],
      benefits: [...(data.benefits || [])]
    })
  }

  // Return NEW instance instead of mutating
  withRequirement(requirement) {
    return new CDPractice(
      this.#data.id,
      this.#data.name,
      this.#data.category,
      this.#data.description,
      {
        ...this.#data,
        requirements: [...this.#data.requirements, requirement.trim()]
      }
    )
  }

  get requirements() {
    return this.#data.requirements
  }
}

// Usage (immutable but with class syntax)
const practice = new CDPractice(id, name, category, description)
const updated = practice
  .withRequirement('Req 1')
  .withRequirement('Req 2')
  .withBenefit('Benefit 1')
```

**Benefits of Hybrid:**
- ✅ Immutability (functional)
- ✅ Familiar class syntax (OOP)
- ✅ Method chaining
- ✅ Type checking works well
- ✅ Easy refactoring from current code

---

## Recommendation

For this project following CLAUDE.md guidelines:

1. **Start with Pure Functional** (`CDPractice.functional.js`) for:
   - New domain logic
   - Stateless transformations
   - Testing utilities

2. **Keep Class-Based** (`CDPractice.js`) for:
   - Repository integration (existing code)
   - Database mapping (needs mutability for ORMs)
   - Backward compatibility

3. **Gradually Migrate** to hybrid approach:
   - Make methods return new instances
   - Use frozen objects internally
   - Remove mutation over time

The functional version aligns better with the FP principles in CLAUDE.md while maintaining DDD entity patterns.
