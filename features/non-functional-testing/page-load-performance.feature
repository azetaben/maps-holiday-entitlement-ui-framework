@technical @performance @requires_network @suite:PagePerformance
Feature: Page load performance across a long calculator journey
  As an employee or employer using the holiday entitlement calculator
  I want each page in a longer calculation to load promptly
  So that I can complete a detailed employment-period journey without slow transitions

  @PERF-01 @P1
  Scenario: Complete a regular-hours calculation for an employee who starts and leaves during the leave year
    Given I open the calculator to measure page load performance
    When I complete a long regular-hours employment-period calculation while measuring page loads
    Then each page should load within the configured budget and its timing should be attached to the report
