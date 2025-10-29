# Practice Adoption Feature - Implementation Plan

## Overview

This feature allows users to track which DevOps practices they have adopted, with shareable state via URL and persistence across sessions.

## Requirements Summary

1. ✅ **Shareable state** - URL parameters encode adoption state
2. ✅ **Visual checkmark** - Adopted practices show checkmark
3. ✅ **Dependency adoption counter** - Show "X/Y dependencies adopted"
4. ✅ **CD practice percentage** - Continuous Delivery shows overall adoption %
5. ✅ **Session persistence** - State saved to localStorage

---

## Domain Model

### Core Entities

#### AdoptionState (Value Object)

```javascript
{
  adoptedPractices: Set<string>, // Set of practice IDs
  version: number,                // Schema version for future migrations
  lastUpdated: string            // ISO timestamp
}
```

#### Practice (Enhanced - existing entity)

```javascript
{
  id: string,
  name: string,
  category: string,
  dependencies: Array<string>,    // IDs of dependency practices
  dependencyCount: number,
  // ... existing fields

  // Computed fields (not stored):
  isAdopted: boolean,            // From adoptionStore
  adoptedDependencyCount: number // From adoptionStore
}
```

---

## URL State Format

### URL Parameter: `adopted`

**Format:** Comma-separated base64-encoded practice IDs
**Example:** `?adopted=Y2ksdmMsYXQ` (represents "ci,vc,at" base64 encoded)

### Why base64?

- Shorter URLs (important for sharing)
- URL-safe
- Handles special characters in practice IDs
- Easy to encode/decode

### Example URLs

```
# No adoptions
https://example.com/

# CI and VC adopted
https://example.com/?adopted=Y2ksdmM

# Multiple practices
https://example.com/?adopted=Y2ksdmMsYXQsY2QsZGI
```

---

## State Synchronization Strategy

### Priority Order

1. **URL parameters** (highest priority - enables sharing)
2. **localStorage** (fallback - persistence)
3. **Empty state** (default)

### Sync Flow

```
Page Load
  ↓
Check URL for `?adopted` parameter
  ↓
If URL has state → Use URL state → Save to localStorage
  ↓
Else → Check localStorage → Use localStorage state
  ↓
Else → Use empty state
  ↓
Initialize Svelte store with state
  ↓
On toggle → Update store → Update localStorage → Update URL
```

### Debouncing

- **localStorage writes:** Debounced 500ms (avoid excessive writes)
- **URL updates:** Immediate (use `history.replaceState` to avoid breaking back button)

---

## Implementation Architecture

### File Structure

```
src/lib/
├── stores/
│   └── adoptionStore.js          # Svelte store for adoption state
├── utils/
│   ├── adoption.js                # Pure functions for adoption logic
│   └── urlState.js                # URL serialization/deserialization
├── components/
│   ├── AdoptionCheckbox.svelte    # Checkbox UI component
│   ├── GraphNode.svelte           # Updated with adoption UI
│   └── AdoptionIndicator.svelte   # Checkmark/counter/percentage display
└── services/
    └── adoptionPersistence.js     # localStorage operations

tests/
├── unit/
│   ├── stores/
│   │   └── adoptionStore.test.js
│   ├── utils/
│   │   ├── adoption.test.js
│   │   └── urlState.test.js
│   └── components/
│       ├── AdoptionCheckbox.test.js
│       └── AdoptionIndicator.test.js
└── e2e/
    └── practice-adoption.spec.js

docs/features/
└── practice-adoption.feature      # BDD scenarios
```

---

## Component Design

### 1. AdoptionCheckbox Component

**Props:**

```javascript
{
  practiceId: string,
  isAdopted: boolean,
  size: 'sm' | 'md' | 'lg',
  ontoggle: (practiceId: string) => void
}
```

**Visual States:**

- Unchecked: Empty circle outline
- Checked: Filled circle with checkmark (green)
- Hover: Scale slightly + cursor pointer
- Focus: Ring outline for keyboard navigation

**Accessibility:**

- ARIA label: "Mark {practiceName} as adopted" / "Unmark {practiceName} as adopted"
- Role: checkbox
- Tab index: 0
- Keyboard: Space/Enter to toggle

### 2. AdoptionIndicator Component

**Props:**

```javascript
{
  type: 'checkmark' | 'counter' | 'percentage',
  isAdopted: boolean,              // For checkmark
  adoptedCount: number,            // For counter
  totalCount: number,              // For counter and percentage
  practiceId: string               // For special handling (e.g., CD)
}
```

**Display Logic:**

- **Checkmark type:** Green checkmark icon (✓) when isAdopted=true
- **Counter type:** "X/Y dependencies adopted" badge
- **Percentage type:** "X% adoption" (for Continuous Delivery)

### 3. GraphNode Component Updates

**New Props:**

```javascript
{
  // ... existing props
  isAdopted: boolean,              // From adoptionStore
  adoptedDependencyCount: number,  // Computed from store
  totalDependencyCount: number,    // From practice.dependencyCount
  onToggleAdoption: (id) => void  // Toggle adoption callback
}
```

**Visual Changes:**

- **Top-right corner:** AdoptionCheckbox
- **Below title (unselected view):**
  - If has dependencies: Show "X/Y dependencies adopted" counter
  - If is CD practice: Show "X% adoption" percentage
- **Border enhancement:** Adopted practices get subtle green left border accent

**Layout:**

```
┌─────────────────────────────────┐
│ Practice Name            [✓]    │ ← Checkbox top-right
│                                 │
│ 3/5 dependencies adopted        │ ← Counter (if has deps)
│ OR                              │
│ 75% adoption                    │ ← Percentage (if CD)
└─────────────────────────────────┘
```

---

## Pure Functions (TDD)

### `src/lib/utils/urlState.js`

```javascript
// Encode adoption state to URL parameter
export const encodeAdoptionState = (adoptedSet: Set<string>): string => {
  const idsArray = Array.from(adoptedSet).sort() // Sort for consistency
  const joined = idsArray.join(',')
  return btoa(joined) // Base64 encode
}

// Decode adoption state from URL parameter
export const decodeAdoptionState = (encoded: string): Set<string> => {
  try {
    const decoded = atob(encoded)
    const idsArray = decoded.split(',').filter(id => id.trim())
    return new Set(idsArray)
  } catch (error) {
    console.warn('Failed to decode adoption state:', error)
    return new Set()
  }
}

// Get adoption state from current URL
export const getAdoptionStateFromURL = (): Set<string> | null => {
  const params = new URLSearchParams(window.location.search)
  const encoded = params.get('adopted')
  return encoded ? decodeAdoptionState(encoded) : null
}

// Update URL with adoption state (without page reload)
export const updateURLWithAdoptionState = (adoptedSet: Set<string>) => {
  const url = new URL(window.location.href)

  if (adoptedSet.size === 0) {
    url.searchParams.delete('adopted')
  } else {
    const encoded = encodeAdoptionState(adoptedSet)
    url.searchParams.set('adopted', encoded)
  }

  window.history.replaceState({}, '', url.toString())
}
```

### `src/lib/utils/adoption.js`

```javascript
// Calculate how many dependencies of a practice are adopted
export const calculateAdoptedDependencies = (
  practice: Practice,
  adoptedSet: Set<string>,
  allPractices: Map<string, Practice>
): number => {
  if (!practice.dependencies || practice.dependencies.length === 0) {
    return 0
  }

  return practice.dependencies.filter(depId => adoptedSet.has(depId)).length
}

// Calculate overall adoption percentage
export const calculateAdoptionPercentage = (
  adoptedCount: number,
  totalCount: number
): number => {
  if (totalCount === 0) return 0
  return Math.round((adoptedCount / totalCount) * 100)
}

// Validate practice IDs against available practices
export const filterValidPracticeIds = (
  ids: Set<string>,
  validPracticeIds: Set<string>
): Set<string> => {
  return new Set(Array.from(ids).filter(id => validPracticeIds.has(id)))
}
```

### `src/lib/services/adoptionPersistence.js`

```javascript
const STORAGE_KEY = 'cd-practices-adoption'
const STORAGE_VERSION = 1

// Save adoption state to localStorage
export const saveAdoptionState = (adoptedSet: Set<string>) => {
  try {
    const state = {
      version: STORAGE_VERSION,
      adoptedPractices: Array.from(adoptedSet),
      lastUpdated: new Date().toISOString()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.warn('Failed to save adoption state:', error)
  }
}

// Load adoption state from localStorage
export const loadAdoptionState = (): Set<string> | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const state = JSON.parse(stored)

    // Version check for future migrations
    if (state.version !== STORAGE_VERSION) {
      console.warn('Adoption state version mismatch, ignoring')
      return null
    }

    return new Set(state.adoptedPractices)
  } catch (error) {
    console.warn('Failed to load adoption state:', error)
    return null
  }
}

// Clear adoption state from localStorage
export const clearAdoptionState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear adoption state:', error)
  }
}
```

---

## Store Implementation

### `src/lib/stores/adoptionStore.js`

```javascript
import { writable, derived, get } from 'svelte/store'
import { debounce } from '$lib/utils/debounce.js'
import { getAdoptionStateFromURL, updateURLWithAdoptionState } from '$lib/utils/urlState.js'
import { saveAdoptionState, loadAdoptionState } from '$lib/services/adoptionPersistence.js'

// Private writable store
const createAdoptionStore = () => {
	const { subscribe, set, update } = writable(new Set())

	// Debounced save functions
	const debouncedSaveToStorage = debounce(adoptedSet => {
		saveAdoptionState(adoptedSet)
	}, 500)

	// Initialize from URL or localStorage
	const initialize = (allPracticeIds = new Set()) => {
		// Priority: URL > localStorage > empty
		const urlState = getAdoptionStateFromURL()
		const storageState = loadAdoptionState()

		let initialState = urlState || storageState || new Set()

		// Filter out invalid practice IDs
		if (allPracticeIds.size > 0) {
			initialState = new Set(Array.from(initialState).filter(id => allPracticeIds.has(id)))
		}

		set(initialState)

		// Sync URL and localStorage
		if (urlState) {
			// URL takes precedence, save to localStorage
			saveAdoptionState(initialState)
		} else if (initialState.size > 0) {
			// Update URL to match localStorage
			updateURLWithAdoptionState(initialState)
		}
	}

	// Toggle a practice's adoption state
	const toggle = practiceId => {
		update(adoptedSet => {
			const newSet = new Set(adoptedSet)

			if (newSet.has(practiceId)) {
				newSet.delete(practiceId)
			} else {
				newSet.add(practiceId)
			}

			// Immediately update URL (replaceState doesn't trigger navigation)
			updateURLWithAdoptionState(newSet)

			// Debounced save to localStorage
			debouncedSaveToStorage(newSet)

			return newSet
		})
	}

	// Check if a practice is adopted
	const isAdopted = practiceId => {
		const adoptedSet = get({ subscribe })
		return adoptedSet.has(practiceId)
	}

	// Get count of adopted practices
	const getCount = () => {
		const adoptedSet = get({ subscribe })
		return adoptedSet.size
	}

	// Clear all adoptions
	const clearAll = () => {
		set(new Set())
		updateURLWithAdoptionState(new Set())
		saveAdoptionState(new Set())
	}

	return {
		subscribe,
		initialize,
		toggle,
		isAdopted,
		getCount,
		clearAll
	}
}

export const adoptionStore = createAdoptionStore()

// Derived store for adoption count
export const adoptionCount = derived(adoptionStore, $adopted => $adopted.size)
```

---

## GraphNode Integration

### Changes to GraphNode.svelte

**New reactive statements:**

```javascript
// Import adoption store
import { adoptionStore } from '$lib/stores/adoptionStore.js'
import AdoptionCheckbox from './AdoptionCheckbox.svelte'

// Check if this practice is adopted
$: isAdopted = $adoptionStore.has(practice.id)

// Calculate adopted dependencies (if practice has dependencies)
$: adoptedDepCount = practice.dependencies
	? practice.dependencies.filter(depId => $adoptionStore.has(depId)).length
	: 0

// Calculate total adoption percentage (for CD practice only)
$: adoptionPercentage =
	practice.id === 'continuous-delivery'
		? Math.round(($adoptionStore.size / totalPracticeCount) * 100)
		: 0
```

**Visual additions:**

```svelte
<!-- Top-right corner: Adoption checkbox -->
<div class="absolute top-2 right-2 z-10">
	<AdoptionCheckbox
		practiceId={practice.id}
		{isAdopted}
		size="md"
		ontoggle={() => adoptionStore.toggle(practice.id)}
	/>
</div>

<!-- In unselected view, below title -->
{#if !isSelected}
	<!-- Show dependency adoption counter if practice has dependencies -->
	{#if practice.dependencyCount > 0}
		<div class="text-xs text-gray-500 text-center mt-1">
			{adoptedDepCount}/{practice.dependencyCount} dependencies adopted
		</div>
	{/if}

	<!-- Show overall percentage for Continuous Delivery -->
	{#if practice.id === 'continuous-delivery'}
		<div class="text-sm font-semibold text-green-600 text-center mt-2">
			{adoptionPercentage}% adoption
		</div>
	{/if}
{/if}

<!-- Optional: Subtle green border accent for adopted practices -->
<div class:border-l-4={isAdopted} class:border-green-500={isAdopted}>
	<!-- ... existing card content ... -->
</div>
```

---

## Testing Strategy

### Unit Tests

**`tests/unit/utils/urlState.test.js`**

- `encodeAdoptionState()` with empty set
- `encodeAdoptionState()` with single ID
- `encodeAdoptionState()` with multiple IDs
- `decodeAdoptionState()` with valid encoded string
- `decodeAdoptionState()` with invalid base64
- `decodeAdoptionState()` with empty string
- Round-trip encoding/decoding

**`tests/unit/utils/adoption.test.js`**

- `calculateAdoptedDependencies()` with no dependencies
- `calculateAdoptedDependencies()` with some adopted
- `calculateAdoptedDependencies()` with all adopted
- `calculateAdoptionPercentage()` with various ratios
- `filterValidPracticeIds()` with mixed valid/invalid IDs

**`tests/unit/stores/adoptionStore.test.js`**

- Initialize from empty state
- Initialize from URL state
- Initialize from localStorage
- Toggle practice (add)
- Toggle practice (remove)
- Clear all adoptions
- URL updates on toggle
- localStorage updates on toggle (debounced)

**`tests/unit/components/AdoptionCheckbox.test.js`**

- Renders unchecked state
- Renders checked state
- Calls ontoggle when clicked
- Keyboard navigation (Space/Enter)
- ARIA attributes correct
- Visual states (hover, focus, active)

### E2E Tests

**`tests/e2e/practice-adoption.spec.js`**

- Mark practice as adopted
- Unmark adopted practice
- Checkmark appears/disappears
- Dependency counter updates correctly
- CD percentage updates correctly
- URL updates when toggling adoption
- Reload page preserves state from URL
- Reload page preserves state from localStorage
- Copy URL and open in new tab shares state
- Invalid practice IDs in URL are ignored
- Corrupted localStorage is handled gracefully

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

**Keyboard Navigation:**

- Tab to focus checkbox
- Space/Enter to toggle
- Visual focus indicator (ring)

**Screen Reader Support:**

- ARIA role="checkbox"
- aria-checked="true|false"
- aria-label="Mark [Practice Name] as adopted"
- Live region announcements on toggle

**Color Contrast:**

- Checkmark: Minimum 4.5:1 contrast ratio
- Text: Minimum 4.5:1 contrast ratio
- Focus ring: Minimum 3:1 contrast ratio

**Touch Targets:**

- Minimum 44×44px tap area (WCAG 2.5.5 AAA)
- Adequate spacing between interactive elements

---

## Performance Considerations

1. **Debouncing:**
   - localStorage writes: 500ms debounce
   - URL updates: Immediate (replaceState is fast)

2. **Derived stores:**
   - Use Svelte's built-in reactivity
   - Avoid unnecessary recomputation

3. **Set operations:**
   - O(1) lookups for adoption checks
   - Efficient add/delete operations

4. **URL encoding:**
   - Base64 is efficient for small datasets
   - Expect <100 practice IDs max

5. **localStorage:**
   - Quota: ~5-10MB (more than enough)
   - Graceful degradation if quota exceeded

---

## Edge Cases

### 1. URL Too Long

- Unlikely with base64 encoding
- Max URL length: 2000 characters
- ~1500 practice IDs would fit (far exceeds actual count)

### 2. localStorage Disabled

- Catch exceptions in save/load
- Fall back to in-memory state only
- Display warning to user (optional)

### 3. Invalid Practice IDs in URL

- Filter out invalid IDs on load
- Log warning to console
- Don't break the page

### 4. Concurrent Tabs

- localStorage events sync between tabs
- URL state in each tab is independent
- Last write wins (acceptable for this use case)

### 5. Browser Back Button

- Using `replaceState` prevents URL history pollution
- Back button navigates to previous page, not previous adoption state

---

## Future Enhancements

### Phase 2 (Optional)

1. **Export/Import**
   - Download adoption state as JSON
   - Upload adoption state file

2. **Adoption Timeline**
   - Track when each practice was adopted
   - Show progression over time

3. **Notes per Practice**
   - Add notes about adoption challenges
   - Date adopted
   - Team members involved

4. **Team Dashboard**
   - Aggregate multiple users' adoption states
   - Show team progress
   - Requires backend + authentication

5. **Gamification**
   - Badges for milestones
   - Adoption streaks
   - Recommendations for next practice

---

## Implementation Timeline

### Week 1: Foundation

- ✅ BDD feature file (DONE)
- Day 1-2: Pure functions + unit tests (urlState, adoption utils)
- Day 3-4: Adoption store + unit tests
- Day 5: AdoptionCheckbox component + tests

### Week 2: Integration

- Day 1-2: GraphNode integration
- Day 3: Dependency counter logic
- Day 4: CD percentage logic
- Day 5: Visual polish + accessibility

### Week 3: Testing & Polish

- Day 1-2: E2E tests (Playwright)
- Day 3: URL sharing tests
- Day 4: Edge case testing
- Day 5: Final QA + documentation

**Total Estimated Time:** 10-15 working days (2-3 weeks)

---

## Success Criteria

✅ **Functional:**

- [ ] Users can check/uncheck practices
- [ ] Adoption state persists across sessions
- [ ] URLs with adoption state are shareable
- [ ] Dependency counters display correctly
- [ ] CD percentage displays correctly
- [ ] Checkmarks visible on adopted practices

✅ **Quality:**

- [ ] All unit tests pass (>90% coverage)
- [ ] All E2E tests pass
- [ ] No linting errors
- [ ] Build succeeds
- [ ] Accessibility audit passes (Lighthouse)

✅ **Performance:**

- [ ] No noticeable lag when toggling adoption
- [ ] Page load time not impacted
- [ ] localStorage operations are debounced

✅ **UX:**

- [ ] Checkboxes are intuitive to use
- [ ] Visual feedback is immediate
- [ ] URLs are reasonably short
- [ ] Works on mobile (touch interactions)

---

## Questions for Review

Before proceeding with implementation, please confirm:

1. **ID of Continuous Delivery practice:** What is the practice.id for "Continuous Delivery"?
2. **Total practice count:** How many total practices exist in the system?
3. **Practice ID format:** Are practice IDs simple strings like "ci", "vc" or UUIDs?
4. **Icon preference:** Should we use FontAwesome checkmark or custom SVG?
5. **Color scheme:** Confirm green (#10b981) for adopted checkmarks?
6. **Position preference:** Checkmark in top-right corner of card - OK?
7. **Mobile behavior:** Should checkmark be tappable separately from card selection?

---

## Next Steps

Ready to proceed with implementation. Awaiting confirmation to begin Phase 1 (Pure Functions + Tests).
