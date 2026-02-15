# src/ - Application Source Code

## Architecture

```
src/
├── app.css          # Global styles (Tailwind theme)
├── app.html         # HTML shell
├── application/     # Application layer (use cases)
├── domain/          # Domain logic (pure functions)
├── infrastructure/  # External concerns (storage, APIs)
├── lib/             # Shared library code
│   ├── components/  # Svelte components
│   ├── data/        # Static data (cd-practices.json)
│   └── stores/      # Svelte stores
├── routes/          # SvelteKit routes
└── test/            # Test setup files
```

## Functional Programming Patterns

### Pure Functions

All business logic must be pure functions:

- Same input always produces same output
- No side effects, no mutation of arguments
- Use `pipe()` and `compose()` for composition

### Immutability

Always create new data structures:

```javascript
// Good: spread to create new object
update(state => ({ ...state, users: [...state.users, newUser] }))

// Bad: mutation
state.users.push(newUser)
```

### Svelte Reactivity as Pure Transformations

```svelte
<script>
	const filterBySearch = term => items =>
		items.filter(item => item.name.toLowerCase().includes(term.toLowerCase()))

	$: processedItems = pipe(filterBySearch(searchTerm), sortByField(sortBy))(items)
</script>
```

## Component Conventions

- Use `$props()` and `$derived()` (Svelte 5 runes)
- Extract logic to pure functions in `domain/` or `lib/`
- Use `data-testid` attributes for test selectors
- Prefer composition over inheritance
- Use factory functions for stores (never classes)

## Stores

```javascript
// Factory pattern for stores
export const createCounter = (initialValue = 0) => {
	const { subscribe, update, set } = writable(initialValue)
	return {
		subscribe,
		increment: () => update(n => n + 1),
		reset: () => set(initialValue)
	}
}
```
