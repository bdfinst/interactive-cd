# Node Sizing - Quick Reference Card

## 🎯 TL;DR

**Want to resize nodes?** → Edit `/Users/bryan/_git/interactive-cd/src/app.css`

```css
:root {
	--node-width-standard: 450px; /* Change this number */
}
```

That's it! All standard nodes are now 450px wide.

---

## 📏 Size Variants

| Variant               | When to Use                            |
| --------------------- | -------------------------------------- |
| `tiny`                | Unselected nodes in tree view          |
| `compact`             | Unselected dependencies in normal view |
| `standard`            | Ancestors and current practice nodes   |
| `expanded`            | Selected nodes in tree view            |
| `selected-dependency` | Selected dependencies (responsive)     |

---

## 🔧 Common Tasks

### Task: Make All Tiny Nodes Bigger

**File:** `app.css`

```css
:root {
	--node-width-tiny: 180px; /* was 150px */
	--node-height-tiny: 100px; /* was 80px */
}
```

### Task: Add More Padding to Nodes

**File:** `app.css`

```css
:root {
	--node-padding-standard: 1.5rem; /* was 1rem */
}
```

### Task: Make Text Bigger in Tiny Nodes

**File:** `app.css`

```css
:root {
	--node-text-tiny: 0.875rem; /* was 0.75rem */
	--node-title-tiny: 1.125rem; /* was 1rem */
}
```

### Task: Thicker Borders for Selected Nodes

**File:** `app.css`

```css
:root {
	--node-border-selected-thick: 5px; /* was 4px */
}
```

---

## 💡 Usage in Components

### Basic Usage

```svelte
<GraphNode {practice} nodeSize="standard" ← Just set this! />
```

### Conditional Sizing

```svelte
<GraphNode {practice} nodeSize={isSelected ? 'expanded' : 'tiny'} />
```

---

## 📊 Current Size Values

### Width

```css
--node-width-tiny: 150px;
--node-width-compact: 250px;
--node-width-standard: 400px;
--node-width-expanded: 482px;
```

### Height

```css
--node-height-tiny: 80px;
--node-height-compact: 140px;
--node-height-standard: auto;
--node-height-expanded: 300px;
```

### Padding

```css
--node-padding-tiny: 0.75rem; /* 12px */
--node-padding-standard: 1rem; /* 16px */
```

### Typography

```css
--node-title-tiny: 1rem; /* 16px */
--node-title-standard: 1.125rem; /* 18px */
--node-text-tiny: 0.75rem; /* 12px */
--node-text-small: 0.875rem; /* 14px */
--node-text-standard: 1rem; /* 16px */
```

### Spacing

```css
--node-spacing-tiny: 0.25rem; /* 4px */
--node-spacing-small: 0.5rem; /* 8px */
--node-spacing-standard: 0.75rem; /* 12px */
```

### Borders

```css
--node-border-normal: 1px;
--node-border-normal-thick: 2px;
--node-border-selected: 2px;
--node-border-selected-thick: 4px;
```

---

## 🎨 Visual Layout

```
┌─────────────────────────────────────┐
│         EXPANDED (482px)            │  ← Selected in tree view
│                                     │
│  [Close] Title         [Checkbox]   │
│  75% adoption                       │
│  Description...                     │
│  Requirements: ...                  │
│  Benefits: ...                      │
└─────────────────────────────────────┘

┌────────────────────┐
│ STANDARD (400px)   │  ← Ancestor/current practice
│                    │
│ [Expand]  [Check]  │
│ Title              │
│ 3 dependencies     │
└────────────────────┘

┌──────────┐  ┌──────────┐
│ COMPACT  │  │ COMPACT  │  ← Unselected dependencies (250px)
│ (250x140)│  │ (250x140)│
│          │  │          │
│ Title    │  │ Title    │
│ 2 deps   │  │ 1 dep    │
└──────────┘  └──────────┘

┌────┐ ┌────┐ ┌────┐
│TINY│ │TINY│ │TINY│  ← Unselected tree nodes (150px)
│    │ │    │ │    │
│Name│ │Name│ │Name│
└────┘ └────┘ └────┘
```

---

## 🚀 Add New Size Variant

**1. Add CSS variables:**

```css
:root {
	--node-width-large: 600px;
	--node-height-large: 400px;
}
```

**2. Add component styles:**

```css
@layer components {
	[data-node-size='large'] {
		width: 100%;
		max-width: var(--node-width-large);
		min-height: var(--node-height-large);
		padding: var(--node-padding-standard);
	}
}
```

**3. Use it:**

```svelte
<GraphNode {practice} nodeSize="large" />
```

---

## 🐛 Troubleshooting

### Problem: Node sizing not working

**Check:**

1. Is `data-node-size` attribute set? (Inspect element)
2. Is CSS file loaded? (Check browser DevTools)
3. Are CSS variables defined in `:root`?

### Problem: Borders not showing correctly

**Solution:** Ensure both data attributes are set:

```svelte
data-node-size={nodeSize}
data-selected={isSelected}
```

### Problem: Typography not scaling

**Solution:** Add class to element:

```svelte
<div class="node-section">
	← Use this class for spacing
	<h3>Title</h3>
</div>
```

---

## 📚 Full Documentation

- **REFACTORING_ANALYSIS.md** - Why and how
- **NODE_SIZING_GUIDE.md** - Complete guide
- **BEFORE_AFTER_COMPARISON.md** - Detailed comparison

---

## ⚡ Quick Commands

```bash
# Run tests
npm test

# Run GraphNode tests only
npm test -- GraphNode.test.js

# Run E2E tests
npm run test:e2e

# Start dev server
npm run dev
```

---

## 📝 Cheat Sheet

| I want to...                  | Edit this... | Variable/Class                 |
| ----------------------------- | ------------ | ------------------------------ |
| Make all standard nodes wider | `app.css`    | `--node-width-standard`        |
| Make tiny nodes taller        | `app.css`    | `--node-height-tiny`           |
| Add more padding              | `app.css`    | `--node-padding-standard`      |
| Bigger text in tiny nodes     | `app.css`    | `--node-text-tiny`             |
| Thicker selected border       | `app.css`    | `--node-border-selected-thick` |
| More spacing between sections | `app.css`    | `--node-spacing-standard`      |
| Use compact size              | Component    | `nodeSize="compact"`           |
| Use expanded size             | Component    | `nodeSize="expanded"`          |

---

**Last Updated:** 2025-10-27
**Maintained in:** `/Users/bryan/_git/interactive-cd/src/app.css`
