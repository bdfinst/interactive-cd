Feature: Display CD Practices in Hierarchical Outline
  As a DevOps practitioner
  I want to see all CD practices in a hierarchical outline format
  So that I can understand the full scope and dependencies of Continuous Delivery

  Background:
    Given the system contains 23 CD practices from MinimumCD.org
    And practices are organized by their dependencies
    And "Continuous Delivery" is the foundational practice

  # Core Display Scenarios

  Scenario: All practices are displayed in hierarchical order
    When viewing the practice outline
    Then all 23 CD practices are displayed
    And "Continuous Delivery" appears as the root practice
    And each practice shows its name and description
    And practices are organized by their dependencies

  Scenario: Practice information is complete
    When viewing a practice in the outline
    Then the practice name is displayed
    And the practice description is displayed
    And the number of requirements is shown
    And the number of benefits is shown
    And the practice category is indicated

  Scenario: Practices are visually differentiated by category
    When viewing the practice outline
    Then each practice displays its category
    And different category types are visually distinguishable
    And the root practice is visually distinct from dependencies

  Scenario: Direct dependencies are clearly shown
    When viewing "Continuous Delivery" in the outline
    Then its six direct dependencies are visible:
      | Dependency                               |
      | Continuous Integration                   |
      | Application Pipeline                     |
      | Immutable Artifact                       |
      | Production-like Test Environment         |
      | On-demand Rollback                       |
      | Application Configuration Management     |

  Scenario: Nested dependencies show complete hierarchy
    When viewing "Continuous Integration" in the outline
    Then "Trunk-based Development" appears as a dependency
    And "Trunk-based Development" appears subordinate to "Continuous Integration"
    And "Version Control" appears as a dependency of "Trunk-based Development"
    And the full dependency chain is visible

  Scenario: Foundational practices are identified
    When viewing a practice with no dependencies
    Then it is clearly indicated as a foundational practice
    And no empty dependency section is shown

  Scenario: Dependency counts provide context
    When viewing "Continuous Integration" in the outline
    Then the requirement count shows 6 items
    And the benefit count shows 4 items

  Scenario: Visual hierarchy reflects dependency relationships
    When viewing the practice outline
    Then "Continuous Delivery" appears at the top level
    And direct dependencies appear subordinate to it
    And nested dependencies appear increasingly subordinate
    And each level of depth is visually distinguishable

  # User Experience Scenarios

  Scenario: Initial view shows root practice and direct dependencies
    When accessing the home page
    Then "Continuous Delivery" is visible as the root practice
    And its 6 direct dependencies are visible
    And the root practice is auto-selected
    And nested dependencies can be viewed by drilling down or expanding the full tree

  Scenario: Outline is readable on mobile devices
    When viewing the outline on a mobile device
    Then the complete hierarchy is readable
    And no horizontal scrolling is required
    And practice information remains legible
    And the hierarchical structure is preserved

  Scenario: Loading feedback while content loads
    When the page is loading
    Then a loading indicator is displayed
    When the content is ready
    Then the outline replaces the loading indicator

  Scenario: Clear feedback when content unavailable
    When the practice data cannot be loaded
    Then an error message explains the situation
    And guidance for resolution is provided

  Scenario: Practice count provides overview
    When viewing the home page
    Then the total number of practices is displayed
    And the count shows 23 practices

  # Accessibility Scenarios

  Scenario: Outline is navigable with screen readers
    When navigating the outline with a screen reader
    Then each practice is announced clearly
    And the hierarchical relationships are conveyed
    And navigation between practices is logical

  Scenario: Outline is navigable with keyboard
    When navigating the outline with keyboard only
    Then all practices are accessible
    And the navigation order is logical
    And all features are accessible via keyboard alone

  Scenario: Outline can be printed
    When printing the practice outline
    Then all practices appear in the printed version
    And the hierarchical structure is preserved
    And the layout is appropriate for paper

  # Data Accuracy Scenarios

  Scenario: All practices are displayed in full tree mode
    Given the system contains 23 practices
    And I have expanded the full tree view
    When viewing the complete practice tree
    Then exactly 23 unique practices are shown
    And no practices are omitted
    And each practice appears exactly once at its deepest level

  Scenario: Practice information matches source data
    Given "Continuous Integration" exists in the system
    When viewing it in the outline
    Then its name matches the source data
    And its description matches the source data
    And its requirement count matches the source data
    And its benefit count matches the source data

  Scenario: Dependency relationships are accurate
    Given "Continuous Integration" depends on "Trunk-based Development"
    When viewing the outline
    Then "Trunk-based Development" appears under "Continuous Integration"
    And all dependency relationships reflect the source data

  # Performance Scenarios

  Scenario: Outline loads quickly
    When accessing the home page
    Then the outline appears without noticeable delay
    And the initial view is immediately usable

  # Out of Scope for Current Release

  @not-implemented
  Scenario: Search and filter practices
    # Search functionality is NOT in the current release
