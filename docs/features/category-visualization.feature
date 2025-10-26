Feature: Practice Category Visualization
  As a development team member
  I want to see visual indicators showing practice categories
  So that I can understand the types of requirements each practice involves

  Background:
    Given I am on the CD Practices application
    And practices have categories: behavior, culture, and tooling

  # Category Indicators Under Practice Titles

  Scenario: Categories are visually distinguishable by color
    When I view a practice card
    Then colored dots appear below the practice title
    And each dot represents a category dimension
    And behavior categories are visually distinct with green indicators
    And culture categories are visually distinct with amber indicators
    And tooling categories are visually distinct with purple indicators
    And the colors remain consistent across all practices

  Scenario: Multi-category practices show multiple colored dots
    Given "Continuous Delivery" requires behavior, culture, and tooling
    When I view the "Continuous Delivery" practice card
    Then I see three colored dots below the title
    And one green dot for behavior is displayed
    And one amber dot for culture is displayed
    And one purple dot for tooling is displayed

  Scenario: Single-category practices show one colored dot
    Given "Version Control" requires only tooling
    When I view the "Version Control" practice card
    Then I see one purple colored dot below the title
    And no other category dots are shown

  Scenario: Category dots show transitive dependencies
    Given a practice has dependencies from multiple categories
    When I view that practice card
    Then the category dots represent all categories in its dependency tree
    And the dots indicate the full scope of requirements

  Scenario: Category tooltips provide clarification
    When I hover over a category dot
    Then a tooltip appears showing the category name
    And the tooltip displays "Behavior", "Culture", or "Tooling"
    And the tooltip helps users understand the color coding

  # Fixed Legend

  Scenario: Legend explains category color coding
    When I view any page in the application
    Then a legend is prominently visible on the page
    And the legend shows "Requires" as the heading
    And it lists all three categories with their colored dots
    And each category shows its label next to the colored dot:
      | Color  | Label   |
      | Green  | Behavior |
      | Amber  | Culture  |
      | Purple | Tooling  |

  Scenario: Legend is always visible while scrolling
    Given I am viewing the practice graph
    When I scroll down the page
    Then the legend remains visible on the page
    And it maintains its fixed position

  # Requirement Categorization

  Scenario: Requirements display category indicators
    Given I have selected a practice with requirements
    When I view the requirements list
    Then each requirement shows colored dots indicating its categories
    And the dots use the same colors as practice category indicators
    And dots appear before the requirement text

  Scenario: Requirements can have multiple category indicators
    Given a requirement spans multiple categories
    When I view the requirement "Use Continuous Integration"
    Then I see a green dot for behavior
    And I see an amber dot for culture
    And I see a purple dot for tooling
    And all three dots appear before the requirement text

  Scenario: Requirements are appropriately categorized
    Given I am viewing a practice with multiple requirements
    When I examine the requirement category indicators
    Then requirements about tools and automation show tooling indicators
    And requirements about team practices show behavior indicators
    And requirements about organizational values show culture indicators
    And the categorization reflects the nature of each requirement

  # Compact Mode in Full Tree View

  Scenario: Category dots scale appropriately in compact mode
    Given I am viewing the full expanded tree
    When practices are displayed in compact mode
    Then category dots are proportionally smaller but remain visible
    And the dots maintain their color coding
    And tooltips still work when hovering over small dots

  Scenario: Category indicators remain visible across all view modes
    When I am in drill-down navigation mode
    Then category dots are visible under practice titles
    When I expand the full tree view
    Then category dots remain visible in compact mode
    And the color coding is consistent across both views
