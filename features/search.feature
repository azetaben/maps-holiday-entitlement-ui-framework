@holiday_entitlement @search @requires_network
Feature: Find the holiday calculator using GOV.UK search

  Background: Open calculator

  @SEARCH-01 @P1 @smoke
  Scenario: Search for and open the holiday calculator
    Given I open the holiday entitlement calculator
    When I search GOV.UK for "calculate holiday entitlement"
    Then the search results should include "Calculate holiday entitlement"
    When I open the search result "Calculate holiday entitlement"
    Then the holiday calculator landing page should be displayed

  @SEARCH-02 @P2
  Scenario: Opening search leaves the current calculator question available
    Given I open the holiday entitlement calculator
    And I start the calculator
    And I open site-wide search
    Then the site-wide search input should be available
    When I close site-wide search
    Then the worker-type question should remain unanswered
