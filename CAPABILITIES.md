# Interactive CD - Capabilities & Roadmap

## Current Capabilities (v1.1.1)

### Visualization & Navigation

- **Interactive Dependency Graph**: Explore Continuous Delivery practices and their dependencies with visual connection lines
- **Auto-Expand on Selection**: Click any practice to automatically view its dependencies
- **Full Tree View**: Expand/collapse entire dependency tree with single button
- **Dynamic Practice Cards**: View detailed information about each practice including:
  - Practice name and description
  - Requirements for implementation
  - Benefits of adoption
  - Direct and total dependency counts
- **Category-Based Styling**: Color-coded practices by category (Automation, Behavior, Behavior-Enabled Automation, Core)
- **More Info Links**: Direct links to MinimumCD.org implementation guides (where available)
- **Category Legend**: Visual guide showing practice category colors and meanings
- **Responsive Design**: Mobile-first layout that works across all device sizes

### User Interface

- **Fixed Header**: Logo, title, and quick access links always visible
- **Version Badge**: Current version displayed with link to help page
- **GitHub Integration**: Direct links to repository and issue reporting
- **Loading States**: Visual feedback while content loads
- **Tooltips**: Helpful context on hover for navigation elements
- **Accessibility**: Screen reader support, keyboard navigation, ARIA labels, skip links

## Future Enhancements

### High Priority

- [ ] **Search/Filter Functionality**: Search practices by name, category, or keywords
- [ ] **Practice Detail Page**: Dedicated route (`/practice/{id}`) for each practice with full information
- [ ] **URL State Management**: Persist selected practice in URL for sharing and bookmarking
- [ ] **Keyboard Shortcuts**: Quick navigation (arrow keys, Enter to select, Esc to deselect)

### Medium Priority

- [ ] **Print/Export**: Export dependency graph as SVG, PNG, or PDF
- [ ] **Progress Tracking**: Mark practices as "implemented", "in progress", or "planned"
- [ ] **Custom Practice Views**: Save and share filtered/customized views of the dependency tree
- [ ] **Practice Notes**: Add personal notes and links to practices (stored locally)
- [ ] **Compare Practices**: Side-by-side comparison of multiple practices

### Low Priority / Future Considerations

- [ ] **Offline Support**: Service worker for offline viewing
      ]

## Feedback & Issues

Found a bug or have a feature request? Please [open an issue](https://github.com/bdfinst/interactive-cd/issues) on GitHub.
