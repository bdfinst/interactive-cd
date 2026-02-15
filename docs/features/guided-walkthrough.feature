Feature: Guided Walkthrough
  As a user new to Continuous Delivery
  I want to be guided on which practice to adopt next
  So that I can build my CD capability in the right order

  Background:
    Given I am on the practice graph page

  Scenario: Walkthrough panel shows progress and recommendation
    When the page loads
    Then I should see the guided walkthrough panel at the bottom
    And I should see my adoption progress as "0 / N practices"
    And I should see a recommended next practice to adopt

  Scenario: Recommendation updates when a practice is adopted
    Given I have adopted no practices
    When I mark a foundational practice as adopted
    Then the recommendation should update to show a different practice
    And the progress count should increase by one

  Scenario: Navigate to recommended practice
    Given the walkthrough recommends a practice
    When I click "View Practice"
    Then the graph should navigate to show that practice

  Scenario: Dismiss walkthrough panel
    Given the walkthrough panel is visible
    When I click the dismiss button
    Then the panel should hide
    And I should see a "Show Guide" button

  Scenario: Re-show walkthrough panel
    Given I have dismissed the walkthrough panel
    When I click "Show Guide"
    Then the walkthrough panel should reappear with current progress

  Scenario: All practices adopted
    Given I have adopted all practices
    Then the walkthrough should show "All practices adopted!"
    And no recommendation should be displayed
