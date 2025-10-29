Feature: Practice Dependency Graph
  As a development team member
  I want to see CD practices displayed as a graph with connecting lines
  So that I can visualize how practices depend on each other

  Background:
    Given I am on the CD Practices application
    And the database contains all CD practices

  Scenario: Display root practice node
    When I visit the homepage
    Then I should see a graph node for "Continuous Delivery"
    And the node should be visually distinct as the root practice
    And the node should display the practice title
    And the node should display the description
    And the node should show the number of dependencies

  Scenario: Display dependency nodes
    When I view the practice graph
    Then I should see 6 dependency nodes below "Continuous Delivery"
    And each dependency node should have a border
    And each node should display:
      | Field             |
      | Practice title    |
      | Description       |
      | Dependency count  |
      | Benefits list     |

  Scenario: Visual connections between practices
    When I view the practice graph
    Then I should see connecting lines from "Continuous Delivery" to each dependency
    And the lines should be drawn from the root node to each dependency node
    And each connection should have a visual endpoint marker
    And the connections should be visually distinct (dashed or colored)

  Scenario: Root node displays benefits
    When I view the "Continuous Delivery" node
    Then I should see the benefits section
    And I should see "Improved delivery performance" as a benefit
    And I should see "Higher quality releases" as a benefit
    And I should see "Better team culture" as a benefit
    And I should see "Reduced burnout" as a benefit
    And I should see "Less deployment pain" as a benefit

  Scenario: Dependency nodes display benefits
    When I view a dependency node in the graph
    Then I should see up to 3 benefits displayed
    And if there are more than 3 benefits, I should see "+N more..." text
    And each benefit should have a visual indicator

  Scenario: Graph layout is responsive
    When I view the graph on a mobile device
    Then dependency nodes should stack in a single column
    And connecting lines should adjust accordingly
    When I view the graph on a tablet
    Then dependency nodes should display in 2 columns
    When I view the graph on a desktop
    Then dependency nodes should display in 3 columns

  Scenario: Node borders distinguish root from dependencies
    When I view the practice graph
    Then the "Continuous Delivery" node should have a visually distinct border
    And dependency nodes should have standard borders
    And all nodes should have visible borders

  Scenario: Graph shows dependency counts
    When I view the "Continuous Delivery" node
    Then the dependency count should show "6"
    When I view the "Continuous Integration" node
    Then the dependency count should show "4"
    When I view the "Application Pipeline" node
    Then the dependency count should show "4"

  Scenario: Graph connections are visible
    When I view the practice graph
    Then I should see exactly 6 connecting lines
    And each line should connect from "Continuous Delivery" to a dependency
    And the lines should be:
      | From                  | To                                   |
      | Continuous Delivery   | Continuous Integration               |
      | Continuous Delivery   | Application Pipeline                 |
      | Continuous Delivery   | Immutable Artifact                   |
      | Continuous Delivery   | Application Configuration Management |
      | Continuous Delivery   | On-demand Rollback                   |
      | Continuous Delivery   | Production-like Test Environment     |

  Scenario: Loading state before graph renders
    When I visit the homepage
    And the API is still loading
    Then I should see a loading indicator
    And I should see "Loading practices..." message
    And I should not see the practice graph yet

  Scenario: Error state when API fails
    When I visit the homepage
    And the API returns an error
    Then I should see an error message
    And I should see a "Retry" button
    When I click the "Retry" button
    Then the API should be called again

  Scenario: Nodes are visually distinct and accessible
    When I view a practice node
    Then the title should use semantic HTML (h3)
    And the category icon should have alt text
    And the node should have hover effects
    And color should not be the only means of conveying information

  Scenario: Graph scales with content
    When I view the practice graph
    Then the graph container should have adequate spacing
    And nodes should not overlap
    And connecting lines should not obscure node content
    And the graph should be readable at standard zoom levels

  # Drill-Down Navigation

  Scenario: Drill down into practice dependencies
    Given I am viewing "Continuous Delivery" as the root practice
    And I have selected a dependency practice with dependencies of its own
    When I click the "Expand Dependencies" button on that practice
    Then that practice becomes the new current practice
    And its dependencies are displayed below it
    And "Continuous Delivery" appears as an ancestor above

  Scenario: Navigate back through ancestor hierarchy
    Given I have drilled down into "Trunk-based Development"
    And "Continuous Integration" and "Continuous Delivery" are shown as ancestors
    When I click on the "Continuous Integration" ancestor card
    Then I navigate back to that level in the hierarchy
    And "Continuous Delivery" remains as the only ancestor
    And "Continuous Integration" becomes the current practice
    And its dependencies are displayed

  Scenario: Ancestor practices are clickable
    Given I have navigated several levels deep in the practice hierarchy
    When I view the ancestor practices displayed above
    Then each ancestor practice is clickable
    And clicking an ancestor navigates back to that level
    And the navigation path is preserved visually

  Scenario: Cannot expand practices without dependencies
    Given I am viewing a leaf practice with no dependencies
    When I select that practice
    Then no "Expand Dependencies" button is visible
    And the practice shows "0 dependencies" or "No dependencies (Leaf practice)"

  # Full Tree Toggle

  Scenario: Toggle full tree view
    Given I am viewing the practice graph in drill-down mode
    When I click the "Expand" button in the header
    Then the entire practice tree is displayed in a hierarchical grid
    And all 23 practices are visible simultaneously
    And the button text changes to "Collapse"

  Scenario: Collapse full tree back to drill-down view
    Given I am viewing the full expanded tree
    When I click the "Collapse" button in the header
    Then the view returns to drill-down mode
    And only "Continuous Delivery" and its direct dependencies are visible
    And the button text changes to "Expand"

  Scenario: Full tree displays practices at hierarchy levels
    Given I am viewing the full expanded tree
    Then practices are organized in horizontal rows by depth level
    And level 0 contains only "Continuous Delivery"
    And each subsequent level contains practices that depend on the previous level
    And practices are visually aligned by their hierarchy level

  Scenario: Full tree view uses responsive grid layout
    Given I am viewing the full expanded tree
    Then practices are arranged in a responsive 12-column grid
    And the grid adjusts based on screen size
    And practices use compact mode for better overview

  Scenario: Practices appear once at deepest level in full tree view
    Given "Version Control" is a dependency of multiple practices at different levels
    When I view the full expanded tree
    Then "Version Control" appears exactly once
    And it appears at the deepest level where it occurs in the tree
    And no duplicate cards for "Version Control" are shown

  # Practice Selection

  Scenario: Select a practice to view details
    Given I am viewing the practice graph with multiple dependencies
    When I click on a dependency practice card
    Then that practice becomes selected
    And it displays a visually distinct border
    And its description becomes visible
    And its requirements list becomes visible
    And its benefits list becomes visible

  Scenario: Deselect a practice to hide details
    Given a practice is currently selected
    When I click on the selected practice card again
    Then the practice becomes deselected
    And the selection border is removed
    And only the title, category dots, and dependency count remain visible
    And the description and details are hidden

  Scenario: Only selected practices show expand button
    Given I am viewing dependencies
    When a practice with dependencies is not selected
    Then no expand button is visible on that card
    When I click the practice to select it
    Then the "Expand Dependencies (N)" button becomes visible

  Scenario: Root practice is auto-selected on page load
    When I first load the practice graph
    Then "Continuous Delivery" is automatically selected
    And its full details are visible
    And it has a visually distinct selection border

  Scenario: Selected practices occupy more grid space in full tree view
    Given I am viewing the full expanded tree
    When I click a practice to select it
    Then the selected practice card becomes larger
    And it spans more columns in the responsive grid
    And other practices adjust their positions accordingly

  Scenario: Navigate to selected practice in collapsed view
    Given I am viewing the practice graph in collapsed (drill-down) mode
    And I am viewing "Continuous Delivery" with its 6 direct dependencies displayed
    When I click the details button on "Continuous Integration"
    Then "Continuous Integration" becomes the current practice
    And "Continuous Delivery" appears as an ancestor above
    And only the direct dependencies of "Continuous Integration" are displayed
    And the ancestor chain is preserved visually

  Scenario: Navigate to selected practice in expanded tree view
    Given I am viewing the full expanded tree with all 23 practices visible
    When I click the details button on "Continuous Integration"
    Then the view filters to show only relevant practices
    And "Continuous Delivery" appears as an ancestor above
    And "Continuous Integration" becomes the current practice
    And all direct and indirect dependencies of "Continuous Integration" are displayed
    And practices outside this hierarchy are hidden

  # Connection Lines

  Scenario: Connection lines show dependency relationships
    Given I have a current practice with displayed dependencies
    When I view the practice graph
    Then curved lines connect the current practice to each dependency
    And each line has a visible circle marker at the start point (parent)
    And each line has a visible circle marker at the end point (child)
    And the connection lines are clearly visible against the background

  Scenario: Ancestor connections are visually distinct
    Given I have drilled down into practice dependencies
    And ancestor practices are displayed above the current practice
    When I view the connection lines
    Then lines connecting ancestors to each other are solid
    And lines connecting the last ancestor to current practice are solid
    And ancestor connections are more prominent than dependency connections

  Scenario: Dependency connections are visually differentiated when not selected
    Given dependencies are displayed below the current practice
    When a dependency is not selected
    Then its connection line is dashed
    And the line is less prominent than ancestor connections

  Scenario: Selected dependency connections become more prominent
    Given dependencies are displayed below the current practice
    When I click a dependency to select it
    Then its connection line changes from dashed to solid
    And the line becomes more prominent

  Scenario: Full tree view shows all connections
    Given I am viewing the full expanded tree
    Then connection lines appear between all parent-child relationships
    And all lines are solid
    And circle markers indicate both ends of each connection

  Scenario: Connection lines use smooth curves
    Given connection lines are visible between practices
    Then lines are smoothly curved
    And the curves adapt to the spacing between cards

  Scenario: Connection lines adapt to layout changes
    Given connection lines are visible between practices
    When I resize the browser window
    Then connection lines recalculate their positions automatically
    And lines maintain smooth curves
    And circle markers remain at the edges of cards

  Scenario: Connection markers are clearly visible
    Given connection lines are displayed
    Then each line has a circle marker at the parent card's bottom edge
    And each line has a circle marker at the child card's top edge
    And the markers are clearly visible and appropriately sized
