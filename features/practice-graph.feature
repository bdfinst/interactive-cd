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
    And the node should be positioned at the top center
    And the node should have a distinct border indicating it is the root
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
    And each benefit should have a visual indicator (star icon)

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
    Then the "Continuous Delivery" node should have a blue border
    And dependency nodes should have gray borders
    And all nodes should have visible borders

  Scenario: Nodes display category icons
    When I view practice nodes
    Then "Continuous Delivery" should have icon "🔄" for practice category
    And "Continuous Integration" should have icon "🔄" for practice category
    And "Application Pipeline" should have icon "🛠️" for tooling category
    And "Immutable Artifact" should have icon "🛠️" for tooling category

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
