# Interactive CD

The purpose of this application is to help people understand what tools and behaviors unlock the ability to delivery the
latest changes on demand. This should not be considered comprehensive, but should be used to help find things that might
be missing in yuor own environment and give ideas for other things you might find to help you.

## How to use it

### Navigate the Dependency Tree

1. **View Practice Cards**: Each practice is displayed as a card showing its name, category, and dependency count
2. **Click to Expand**: Click any practice card to automatically reveal its dependencies
3. **Expand All**: Use the "Expand All" button to view the complete dependency tree at once
4. **Collapse All**: Click "Collapse All" to reset the view
5. **Category Colors**: Practices are color-coded by category:
   - **Blue (Automation)**: Tools and automation platforms
   - **Green (Behavior)**: Team behaviors and processes
   - **Purple (Automation & Behavior)**: Automation that depends on behavioral practices

### Track Your Progress

Track which practices you've adopted in your organization:

1. **Mark Practices**: Click the checkbox on any practice card to mark it as adopted
2. **Visual Feedback**: Adopted practices are highlighted to show your progress
3. **Persistent Tracking**: Your selections are saved in your browser and persist across sessions
4. **URL Sharing**: Share your current adoption state via URL - adopted practices are encoded in the URL

### Export Your Data

Save your adoption progress to share with your team or keep as backup:

1. **Open Menu**: Click the menu icon (☰) in the top-left corner
2. **Click Export**: Select "Export" from the menu
3. **Save File**: Your adoption data will download as a `.cdpa` (CD Practices Adoption) file
4. **Use Case**: Share with teammates, track progress over time, or backup your data

### Import Adoption Data

Load previously saved adoption data:

1. **Open Menu**: Click the menu icon (☰) in the top-left corner
2. **Click Import**: Select "Import" from the menu
3. **Choose File**: Select a `.cdpa` file you previously exported
4. **Merge or Replace**: Your adoption data will be loaded and merged with existing selections

### Reset Progress

Clear all adoption tracking:

1. **Find Reset Button**: Located in the legend bar at the top of the page
2. **Click Reset**: All adoption checkboxes will be cleared
3. **Confirmation**: Your progress will be reset immediately (no undo available)

## Future Enhancements

### High Priority

- [ ] **Search/Filter Functionality**: Search practices by name, category, or keywords

### Medium Priority

- [ ] **Print/Export**: Export dependency graph as SVG, PNG, or PDF
- [x] **Progress Tracking**: Mark practices as "implemented", "in progress", or "planned"
- [ ] **Custom Practice Views**: Save and share filtered/customized views of the dependency tree

### Low Priority / Future Considerations

- [ ] **Offline Support**: Service worker for offline viewing
      ]

## Feedback & Issues

Found a bug or have a feature request? Please [open an issue](https://github.com/bdfinst/interactive-cd/issues) on GitHub.
