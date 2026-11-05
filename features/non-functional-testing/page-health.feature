@technical @page_health @suite:PageHealth @owner:QE
Feature: Check page links, buttons and images
  The local exercise page and GOV.UK calculator should expose valid links, usable named buttons, and loaded images with alternative text.
  Before local scenarios, install dependencies with `npm install` and start the application with `npm start`.

  @PH-01 @P1 @links @local_page
  Scenario: Find broken or unverifiable links on local index.html
    Given the local application is running
    And I open "local index.html" for page health checks
    Then the page should have no broken links

  @PH-01 @P1 @links @requires_network @bug
  Scenario: Find broken or unverifiable links on GOV.UK calculator
    Given I open "GOV.UK calculator" for page health checks
    Then the page should have no broken links

  @PH-02 @P1 @buttons @local_page @bug
  Scenario: Find unusable or unnamed buttons on local index.html
    Given the local application is running
    And I open "local index.html" for page health checks
    Then the page should have no broken buttons

  @PH-02 @P1 @buttons @requires_network
  Scenario: Find unusable or unnamed buttons on GOV.UK calculator
    Given I open "GOV.UK calculator" for page health checks
    Then the page should have no broken buttons

  @PH-03 @P1 @images @local_page @bug
  Scenario: Find images that fail to load or lack alternative text on local index.html
    Given the local application is running
    And I open "local index.html" for page health checks
    Then the page should have no broken images

  @PH-03 @P1 @images @requires_network
  Scenario: Find images that fail to load or lack alternative text on GOV.UK calculator
    Given I open "GOV.UK calculator" for page health checks
    Then the page should have no broken images
