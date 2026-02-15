Feature: Onboarding Overlay
  As a first-time visitor
  I want to see an interactive tutorial
  So that I understand how to navigate the CD dependency tree

  Background:
    Given I am visiting the app for the first time

  Scenario: Onboarding appears on first visit
    When the page loads
    Then I should see the onboarding overlay
    And the first step should be a welcome message

  Scenario: Progress through onboarding steps
    Given the onboarding overlay is showing
    When I click "Next" through all steps
    Then I should see tooltips pointing to different UI elements
    And the final step button should say "Get Started"

  Scenario: Skip onboarding
    Given the onboarding overlay is showing
    When I click "Skip Tour"
    Then the overlay should dismiss
    And the onboarding should not appear on my next visit

  Scenario: Dismiss with Escape key
    Given the onboarding overlay is showing
    When I press Escape
    Then the overlay should dismiss

  Scenario: Onboarding does not appear on return visits
    Given I have completed or skipped the onboarding
    When I visit the app again
    Then the onboarding overlay should not appear
