Feature: Practice Cards Display
  As a development team member
  I want to see CD practices displayed as cards with their details
  So that I can understand what each practice requires and the benefits it provides

  Background:
    Given I am on the CD Practices application
    And the database contains all CD practices

  Scenario: Display Continuous Delivery practice card
    When I visit the homepage
    Then I should see a card for "Continuous Delivery"
    And the card should display the practice name
    And the card should show category indicators
    And the card should list all requirements
    And the card should list all benefits
    And the card should show the number of direct dependencies

  Scenario: Practice card shows requirements
    When I view the "Continuous Delivery" practice card
    Then I should see a "Requirements" section
    And I should see "Use Continuous Integration" as a requirement
    And I should see "Application pipeline is the only path to production" as a requirement
    And I should see "Pipeline determines production readiness" as a requirement
    And I should see "Create immutable artifacts" as a requirement
    And I should see "Stop feature work when pipeline fails" as a requirement
    And I should see "Maintain production-like test environment" as a requirement
    And I should see "Enable on-demand rollback" as a requirement
    And I should see "Deploy application configuration with artifact" as a requirement
    And the requirements count should be "8"

  Scenario: Practice card shows benefits
    When I view the "Continuous Delivery" practice card
    Then I should see a "Benefits" section
    And I should see "Improved delivery performance" as a benefit
    And I should see "Higher quality releases" as a benefit
    And I should see "Better team culture" as a benefit
    And I should see "Reduced burnout" as a benefit
    And I should see "Less deployment pain" as a benefit
    And the benefits count should be "5"

  Scenario: Practice card shows dependency count
    When I view the "Continuous Delivery" practice card
    Then I should see "6 dependencies" displayed
    And the dependencies should include:
      | Continuous Integration               |
      | Application Pipeline                 |
      | Immutable Artifact                   |
      | Production-like Test Environment     |
      | On-demand Rollback                   |
      | Application Configuration Management |

  Scenario: Display direct dependencies as cards
    When I view the homepage
    Then I should see a card for "Continuous Delivery"
    And I should see a card for "Continuous Integration"
    And I should see a card for "Application Pipeline"
    And I should see a card for "Immutable Artifact"
    And each card should show requirements
    And each card should show benefits
    And each card should show dependency count

  Scenario: Practice card displays description
    When I view the "Continuous Delivery" practice card
    Then I should see the description text
    And the description should contain "improves both delivery performance and quality"

  Scenario: Dependency count is accurate
    When I view the "Continuous Integration" practice card
    Then the dependency count should show "3 dependencies"
    When I view the "Application Pipeline" practice card
    Then the dependency count should show "4 dependencies"
    When I view the "Immutable Artifact" practice card
    Then the dependency count should show "3 dependencies"

  Scenario: Loading state while fetching practices
    When I visit the homepage
    And the API is still loading
    Then I should see a loading indicator
    And I should see "Loading practices..." message
    And I should not see any practice cards yet

  Scenario: Error state when API fails
    When I visit the homepage
    And the API returns an error
    Then I should see an error message
    And I should see a "Retry" button
    When I click the "Retry" button
    Then the API should be called again

  Scenario: Empty state when no dependencies
    Given a practice with no dependencies exists
    When I view that practice card
    Then the dependency count should show "0 dependencies"
    Or the dependency count should not be displayed

  Scenario: Responsive card layout
    When I view the page on a mobile device
    Then practice cards should stack vertically
    And cards should be full width
    When I view the page on a desktop
    Then practice cards should display in a grid
    And cards should have consistent width

  Scenario: Card content is readable and accessible
    When I view a practice card
    Then the heading should use semantic HTML (h2 or h3)
    And the requirements list should use proper list markup
    And the benefits list should use proper list markup
    And the category indicators should have accessible labels
    And color should not be the only means of conveying information
