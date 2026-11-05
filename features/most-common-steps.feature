@local_app @local_calculator @suite:LocalCalculator @owner:QE
Feature: Shared calculator steps
  The common steps open the calculator, check page headings, and continue through questions.

  Background:
    Given I open the holiday entitlement calculator

  @COMMON-01 @P1
  Scenario: Common steps inspect page properties across calculator routes
    Then the page header should be "Calculate holiday entitlement"
    And the page title should be "Calculate holiday entitlement - GOV.UK"
    And the page url should contain "/calculate-your-holiday-entitlement"
    And I should see the following page properties below:
      | Calculate holiday entitlement                  |
      | Use this tool to calculate holiday entitlement |
      | a full leave year                              |
      | Start now                                      |
    When I start the calculator
    Then I should see the following page properties below:
      | Does the employee work irregular hours or for part of the year? |
      | Yes                                                             |
      | No                                                              |
    And I select "No"
    And I continue
    Then I should see "Is the holiday entitlement based on" header
    And I should see the following page properties below:
      | Is the holiday entitlement based on: |
      | days worked per week                 |
      | hours worked per week                |
      | annualised hours                     |
      | compressed hours                     |
      | shifts                               |
    When I select calculation basis "days worked per week"
    And I continue
    Then I should see "Do you want to calculate the holiday" header
    And I should see the following page properties below:
      | for a full leave year                                          |
      | for someone starting part way through a leave year             |
      | for someone leaving part way through a leave year              |
      | for someone starting and leaving part way through a leave year |
