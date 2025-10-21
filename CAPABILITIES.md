# Interactive CD - Capabilities & Roadmap

## Current Capabilities

### Visualization & Navigation

- **Interactive Dependency Graph**: Explore Continuous Delivery practices and their dependencies
- **Auto-Expand on Selection**: Click any practice to automatically view its dependencies
- **Full Tree View**: Expand/collapse entire dependency tree with single button
- **Dynamic Practice Cards**: View detailed information about each practice including:
  - Practice name and description
  - Requirements for implementation
  - Benefits of adoption
  - Dependency count
- **Category-Based Styling**: Color-coded practices by category

## Pending Work & Known Issues

### High Priority

- [ ] **Search/Filter Functionality**: Add ability to search practices by name or category
- [ ] **Practice Detail Page**: Dedicated route for each practice with full information
- [ ] **Back Button**: Navigate back through previously viewed practices
- [ ] **URL State Management**: Persist selected practice in URL for sharing

### Medium Priority

- [ ] **Print/Export**: Export dependency graph as image or PDF
- [ ] **Progress Tracking**: Allow users to mark practices as "implemented" or "in progress"
- [ ] **Custom Practice Views**: Save and share custom views of the dependency tree
- [ ] **Practice Notes**: Add personal notes to practices
- [ ] **Dark Mode**: Add dark theme option

### Technical Debt

- [ ] **Performance Optimization**: Virtualize large dependency trees
- [ ] **Bundle Size**: Optimize JavaScript bundle size
- [ ] **Caching Strategy**: Implement service worker for offline support
- [ ] **Error Boundaries**: Add error boundaries for better error handling
- [ ] **Loading States**: Improve loading state indicators
- [ ] **Test Coverage**: Add more edge case tests

## Feedback & Issues

Found a bug or have a feature request? Please [open an issue](https://github.com/bdfinst/interactive-cd/issues) on GitHub.
