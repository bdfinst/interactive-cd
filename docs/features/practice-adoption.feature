Feature: Practice Adoption Tracking
  As a DevOps practitioner
  I want to track which practices I have adopted
  So that I can monitor my continuous delivery journey and share my progress

  Background:
    Given I am viewing the interactive continuous delivery practices

  # Feature Flag Control Scenarios

  Scenario: Feature is hidden by default when flag is not set
    Given the VITE_ENABLE_PRACTICE_ADOPTION environment variable is not set
    And I visit the application without URL parameters
    When I view the practice cards
    Then I should not see any adoption checkboxes
    And I should not see export/import buttons
    And I should not see the "Experimental" badge

  Scenario: Feature is enabled via environment variable
    Given the VITE_ENABLE_PRACTICE_ADOPTION environment variable is set to "true"
    When I visit the application
    Then I should see adoption checkboxes on practice cards
    And I should see export and import buttons
    And I should see the "Experimental" badge in the header

  Scenario: Case-insensitive URL parameter
    Given the VITE_ENABLE_PRACTICE_ADOPTION environment variable is not set
    When I visit the application with "?feature=PRACTICE-ADOPTION"
    Then I should see adoption checkboxes on practice cards
    And the feature should be enabled regardless of parameter case

  @edge-case
  Scenario: Empty feature parameter value
    Given the VITE_ENABLE_PRACTICE_ADOPTION environment variable is not set
    When I visit the application with "?feature="
    Then I should not see any adoption checkboxes
    And the feature should remain disabled

  @edge-case
  Scenario: Wrong feature name in URL parameter
    Given the VITE_ENABLE_PRACTICE_ADOPTION environment variable is not set
    When I visit the application with "?feature=wrong-feature-name"
    Then I should not see any adoption checkboxes
    And the feature should remain disabled

  @edge-case
  Scenario: Malformed URL parameters are handled gracefully
    Given the VITE_ENABLE_PRACTICE_ADOPTION environment variable is not set
    When I visit the application with "?feature=practice-adoption&&&"
    Then I should see adoption checkboxes on practice cards
    And the application should handle malformed parameters gracefully

  # Original Practice Adoption Scenarios

  Scenario: Marking a practice as adopted
    Given I can see the "Continuous Integration" practice card
    When I click the adoption checkbox on "Continuous Integration"
    Then the practice should show a checkmark indicator
    And the adoption state should be saved to localStorage
    And the URL should be updated to reflect the adoption state

  Scenario: Unmarking an adopted practice
    Given I have previously adopted "Continuous Integration"
    And the practice shows a checkmark indicator
    When I click the adoption checkbox on "Continuous Integration"
    Then the checkmark indicator should be removed
    And the adoption state should be updated in localStorage
    And the URL should be updated to reflect the change

  Scenario: Viewing dependency adoption percentage
    Given "Continuous Integration" has 5 dependencies
    And I have adopted 1 of those dependencies
    When I view the "Continuous Integration" practice card
    Then I should see "20% adopted" displayed on the card

  Scenario: Dynamic dependency adoption percentage updates
    Given "Continuous Integration" has 5 dependencies
    And I have adopted 1 of those dependencies
    When I adopt another dependency of "Continuous Integration"
    Then the "Continuous Integration" card should update to show "40% adopted"

  Scenario: Viewing Continuous Delivery adoption percentage
    Given I am viewing the "Continuous Delivery" practice
    And there are 20 total practices in the system
    And I have adopted 15 practices
    When I view the "Continuous Delivery" card
    Then I should see "75% adoption" displayed on the card

  Scenario: Sharing adoption state via URL
    Given I have adopted "Continuous Integration" and "Automated Testing"
    When I copy the current page URL
    And I open that URL in a new browser session
    Then I should see "Continuous Integration" marked as adopted
    And I should see "Automated Testing" marked as adopted

  Scenario: Persisting adoption state between sessions
    Given I have adopted "Continuous Integration"
    When I close the browser and reopen the page
    Then I should still see "Continuous Integration" marked as adopted

  Scenario: Loading adoption state from URL overrides localStorage
    Given I have "Automated Testing" marked as adopted in localStorage
    When I visit a URL with adoption state for "Continuous Integration" only
    Then I should see "Continuous Integration" marked as adopted
    And I should not see "Automated Testing" marked as adopted
    And the localStorage should be updated to match the URL state

  Scenario: Empty adoption state
    Given I have not adopted any practices
    When I view any practice card
    Then no checkmarks should be visible
    And dependency adoption counts should show "0% adopted"
    And Continuous Delivery should show "0% adoption"

  Scenario: Bulk adoption tracking
    Given there are multiple practices visible
    When I adopt "Version Control", "Automated Testing", and "Continuous Integration"
    Then all three practices should show checkmarks
    And any practices depending on these should show updated adoption counts
    And the URL should include all three practices in the adoption state

  Scenario: Visual distinction for adopted practices
    Given I have adopted "Continuous Integration"
    When I view the practice cards
    Then "Continuous Integration" should have a visible checkmark
    And the checkmark should be clearly distinguishable from non-adopted practices
    And the checkmark should not interfere with practice selection

  @accessibility
  Scenario: Keyboard navigation for adoption
    Given I am using keyboard navigation
    When I tab to a practice card
    And I press the spacebar on the adoption checkbox
    Then the practice should be marked as adopted
    And I should hear a screen reader announcement confirming the adoption

  @accessibility
  Scenario: Screen reader support
    Given I am using a screen reader
    When I focus on a practice with an adoption checkbox
    Then I should hear "Mark [Practice Name] as adopted" or "Unmark [Practice Name] as adopted"
    And the current adoption state should be announced

  @edge-case
  Scenario: URL adoption state with invalid practice IDs
    Given the URL contains adoption state with an invalid practice ID "fake-practice"
    When I load the page
    Then the invalid practice ID should be ignored
    And valid practice IDs in the URL should still be marked as adopted
    And an error should not be displayed to the user

  @edge-case
  Scenario: Corrupted localStorage data
    Given the localStorage contains corrupted adoption data
    When I load the page
    Then the corrupted data should be ignored
    And the adoption state should start fresh
    And the page should load without errors

  Scenario: Exporting adoption state to file
    Given I have adopted "Version Control", "Automated Testing", and "Continuous Integration"
    When I click the "Export" button
    Then a JSON file should be downloaded to my computer
    And the filename should include the current date
    And the file should contain all my adopted practice IDs
    And the file should include metadata (version, timestamp, practice count)

  Scenario: Importing adoption state from file
    Given I have a valid adoption state export file
    When I click the "Import" button
    And I select the export file from my computer
    Then the adoption state from the file should be loaded
    And all practices in the file should be marked as adopted
    And the URL should be updated to reflect the imported state
    And the localStorage should be updated with the imported state

  Scenario: Importing file with invalid practice IDs
    Given I have an export file containing some invalid practice IDs
    When I import the file
    Then only valid practice IDs should be imported
    And invalid practice IDs should be ignored
    And I should see a message indicating how many practices were imported
    And I should see a warning about invalid practice IDs if any were found

  Scenario: Importing file overwrites current state
    Given I have adopted "Version Control" and "Automated Testing"
    And I have an export file with only "Continuous Integration" adopted
    When I import the file
    Then only "Continuous Integration" should be marked as adopted
    And "Version Control" and "Automated Testing" should not be adopted
    And I should see a confirmation message before overwriting

  @edge-case
  Scenario: Importing corrupted JSON file
    Given I have a corrupted or invalid JSON file
    When I attempt to import the file
    Then I should see an error message
    And my current adoption state should not be changed
    And the page should remain functional

  @edge-case
  Scenario: Importing empty file
    Given I have an empty adoption state export file (zero practices)
    When I import the file
    Then all my current adoptions should be cleared
    And I should see a confirmation message before clearing
    And the URL and localStorage should be updated to reflect empty state

  Scenario: Export file format validation
    Given I export my adoption state
    When I open the exported JSON file
    Then it should have the correct schema version
    And it should include a timestamp
    And it should list all adopted practice IDs in an array
    And it should be human-readable and well-formatted
