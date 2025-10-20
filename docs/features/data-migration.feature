Feature: Data Migration for New Practices
  As a database administrator
  I want to safely migrate new practices and dependencies
  So that the system maintains data integrity and consistency

  Background:
    Given the database has the initial schema and data
    And the migration tracking system is enabled
    And I have a new practices migration file

  Scenario: First-time migration inserts new practices successfully
    Given no practices with the new IDs exist in the database
    When I apply the new practices migration
    Then all new practices should be inserted with correct data
    And all new dependencies should be created
    And the metadata should be updated with new version
    And no circular dependencies should exist
    And the migration should be recorded as successful

  Scenario: Idempotent migration handles existing data gracefully
    Given the migration has already been applied once
    When I apply the same migration again
    Then no duplicate practices should be created
    And no duplicate dependencies should be created
    And existing data should remain unchanged
    And the operation should complete without errors
    And no data corruption should occur

  Scenario: Migration validates dependency integrity
    Given new practices with dependencies are being added
    When I apply the migration
    Then all referenced dependencies should exist
    And no orphaned dependencies should be created
    And the dependency graph should remain acyclic
    And all foreign key constraints should be satisfied

  Scenario: Migration rollback restores previous state
    Given a migration has been successfully applied
    When I execute the rollback procedure
    Then new practices should be removed
    And new dependencies should be removed
    And metadata should be restored to previous values
    And no orphaned records should remain
    And the database should match the pre-migration state

  Scenario: Migration prevents circular dependencies
    Given a migration that would create a circular dependency
    When I attempt to apply the migration
    Then the circular dependency should be detected
    And the migration should fail with a clear error
    And no partial changes should be committed
    And the database should remain in a consistent state

  Scenario: Migration handles category validation
    Given new practices with specific categories
    When I apply the migration
    Then all practices should have valid categories
    And category constraints should be enforced
    And invalid categories should cause migration failure

  Scenario: Migration tracking records success correctly
    Given a successful migration
    When I check the migration history
    Then the migration should be recorded in schema_migrations
    And the success flag should be true
    And the applied timestamp should be accurate
    And subsequent migration checks should skip this migration

  Scenario: Migration tracking records failure correctly
    Given a migration that fails due to constraint violation
    When I check the migration history
    Then the migration should be recorded as failed
    And the error message should be captured
    And the database should be in a rollback state
    And the migration can be retried after fixing the issue