Feature: Responsive Navigation Menu
  As a user on different devices
  I want a responsive navigation menu that adapts to my screen size
  So that I can navigate efficiently on mobile, tablet, and desktop

  Background:
    Given I am on the Interactive CD application

  # Mobile Behavior (<768px)
  Scenario: Mobile menu is hidden by default
    Given I am viewing the app on a mobile device with viewport width less than 768px
    When the page loads
    Then the navigation menu should be hidden off-screen to the left
    And the hamburger menu button should be visible in the header
    And the main content should use the full viewport width with no left margin

  Scenario: Open mobile menu with hamburger button
    Given I am on a mobile device
    And the menu is closed
    When I tap the hamburger button in the header
    Then the menu should slide in from the left
    And a semi-transparent backdrop should appear over the content
    And the page body scroll should be locked
    And the transition should be smooth (300ms)

  Scenario: Close mobile menu with backdrop tap
    Given the mobile menu is open on a mobile device
    When I tap the backdrop area
    Then the menu should slide out to the left
    And the backdrop should disappear
    And the body scroll should be unlocked

  Scenario: Close mobile menu with Escape key
    Given the mobile menu is open on a mobile device
    When I press the Escape key
    Then the menu should close
    And the body scroll should be unlocked

  # Tablet/Desktop Behavior (≥768px)
  Scenario: Tablet shows collapsed sidebar by default
    Given I am viewing the app on a tablet with viewport width 768px or greater
    When the page loads
    Then the sidebar should be visible on the left
    And the sidebar should be collapsed showing only icons (64px width)
    And the main content should have 64px left margin
    And no backdrop should be visible

  Scenario: Desktop menu defaults to expanded state
    Given I am viewing the app on a desktop device with viewport width 1024px or greater
    When the page loads
    Then the menu should be expanded showing icons and labels
    And the menu should have 256px width
    And the content area should have 256px left margin
    And no backdrop should be visible

  Scenario: Toggle sidebar on tablet/desktop
    Given I am viewing the app on a tablet or desktop device
    And the sidebar is in any state
    When I click the toggle button
    Then the sidebar should smoothly transition between collapsed (64px) and expanded (256px) states
    And the main content margin should adjust accordingly
    And no backdrop should appear

  # Responsive Transitions
  Scenario: Resizing from mobile to tablet closes overlay
    Given I am on a mobile device with the menu open
    When I resize the viewport to tablet size (≥768px)
    Then the mobile menu overlay should close
    And the backdrop should disappear
    And the menu should become a visible sidebar
    And the body scroll should be unlocked

  Scenario: Resizing from tablet to mobile hides sidebar
    Given I am on a tablet with the sidebar visible
    When I resize the viewport to mobile size (<768px)
    Then the sidebar should hide off-screen to the left
    And the hamburger button should become visible
    And the main content should use full width

  # Keyboard Navigation
  Scenario: Keyboard navigation in expanded menu
    Given the menu is expanded
    When I press Tab
    Then focus should move through menu items sequentially
    And focused items should have visible focus indicators
    When I press Enter on a menu item
    Then the corresponding action should trigger

  Scenario: Keyboard navigation in collapsed menu
    Given the menu is collapsed
    When I press Tab
    Then focus should move through menu items
    And tooltips should appear for focused items
    When I press Enter on a menu item
    Then the corresponding action should trigger

  # Accessibility
  Scenario: Screen reader announces menu state
    Given I am using a screen reader
    When the menu state changes
    Then the screen reader should announce "Menu expanded" or "Menu collapsed"
    And menu items should be announced with their labels
    And external links should be announced as "opens in new tab"

  Scenario: Reduced motion preference
    Given I have enabled "prefers-reduced-motion" in my system
    When the menu state changes
    Then the transition should be instant (no animation)
    But the final state should be the same

  # Edge Cases
  Scenario: Very small mobile screens (< 375px)
    Given I am viewing the app on a screen smaller than 375px
    When the menu is expanded
    Then the menu should take full screen width
    And content should be completely hidden
    And a close button should be prominently visible

  Scenario: Landscape orientation on mobile
    Given I am viewing the app on a mobile device in landscape
    When the menu is expanded
    Then the menu height should not exceed viewport height
    And menu items should be scrollable if needed
    And the header should remain visible

  Scenario: Rapid toggle interactions
    Given the menu is in any state
    When I rapidly click the hamburger button multiple times
    Then the menu should queue animations properly
    And no visual glitches should occur
    And the final state should match the number of clicks

  # Performance
  Scenario: Menu animations maintain 60fps
    Given the menu is in any state
    When I toggle the menu state
    Then the animation should maintain at least 60fps
    And no layout thrashing should occur
    And the transition should complete within 300ms

  Scenario: Menu state persists across page navigation
    Given I have expanded the menu on mobile
    When I navigate to another page
    Then the menu should remain expanded
    And the same state should persist when I return

  # Touch Interaction Details
  Scenario: Edge swipe sensitivity
    Given I am viewing the app on a mobile device with touch support
    When I swipe from within 20px of the left edge
    Then the menu should start expanding
    And the menu should follow my finger position
    When I release past the 50% threshold
    Then the menu should complete the expansion

  Scenario: Swipe cancellation
    Given I am viewing the app on a mobile device
    And I start swiping to open the menu
    When I swipe back before the 50% threshold
    Then the menu should cancel the expansion
    And return to collapsed state smoothly

  # Content Interaction
  Scenario: Content remains accessible with collapsed menu
    Given the menu is collapsed on any device
    When I interact with the main content area
    Then all content should be clickable and selectable
    And no part should be obscured by the menu

  Scenario: Focus management on menu state change
    Given I have focus on a menu item
    When the menu collapses
    Then focus should move to the hamburger button
    And focus should be clearly visible

  @not-implemented
  Scenario: Menu remembers expansion state per breakpoint
    Given I expand the menu on mobile
    And I resize to desktop
    And I collapse the menu on desktop
    When I resize back to mobile
    Then the menu should be expanded (as it was on mobile)

  @not-implemented
  Scenario: Gesture customization for accessibility
    Given I am in accessibility settings
    When I disable swipe gestures
    Then the menu should only respond to button clicks
    And touch gestures should be completely disabled