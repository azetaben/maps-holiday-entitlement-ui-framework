@holiday_entitlement @compatibility @requires_network
Feature: Holiday entitlement results are consistent across supported browsers
  As an employee or employer
  I want the calculator to work consistently in supported browsers
  So that I can rely on the statutory entitlement regardless of my browser

  Background:
    Given I open the holiday entitlement calculator

  @COMP-01 @P1 @cross_browser @live_smoke @smoke
  Scenario: A regular-hours worker receives their full-year entitlement
    Given a regular-hours worker works 5 days each week for the full leave year
    When I calculate holiday entitlement
    Then the calculator shows 28 days of leave

  @COMP-02 @P1 @cross_browser
  Scenario: An irregular-hours worker sees leave accrued for a pay period
    Given an irregular-hours worker worked 30 hours in a pay period
    When I calculate accrued holiday entitlement
    Then the calculator shows 4 hours of leave
