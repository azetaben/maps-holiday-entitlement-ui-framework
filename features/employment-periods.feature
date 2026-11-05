@holiday_entitlement @employment_periods @requires_network
Feature: Calculate leave when employment covers part of a leave year
  As an employee or employer
  I want to calculate leave for the period someone is employed
  So that their entitlement reflects the dates they worked

  Background:
    Given I open the holiday entitlement calculator

  @EMP-01 @P1 @end_to_end @E2E-05
  Scenario: A worker who starts part way through a leave year receives a pro-rata entitlement
    Given I use the "starter" employment-period fixture
    When I calculate their entitlement
    Then the entitlement should be 14 days

  @EMP-02 @P1 @end_to_end @E2E-06
  Scenario: A worker who leaves part way through a leave year receives a pro-rata entitlement
    Given I use the "leaver" employment-period fixture
    When I calculate their entitlement
    Then the entitlement should be 13.9 days
    And it should not exceed the equivalent full-year entitlement

  @EMP-03 @P1 @end_to_end @E2E-07
  Scenario: A worker who starts and leaves in the same leave year receives a pro-rata entitlement
    Given I use the "combined" employment-period fixture
    When I calculate their entitlement
    Then the entitlement should be 14.1 days

  @EMP-06 @P1
  Scenario Outline: A short employment period receives the correct entitlement
    Given I use the "<fixture>" employment-period fixture
    When I calculate their entitlement
    Then the entitlement should be <leave> days
    And it should not exceed the equivalent full-year entitlement

    Examples:
      | fixture       | leave |
      | twoDayFinal   | 0.2   |
      | twoDayMiddle  | 0.2   |

  @EMP-07 @P1
  Scenario: A valid leap-day end date is accepted and included in the calculation
    Given I use the "leapYear" employment-period fixture
    When I calculate their entitlement
    Then the entitlement should be 4.6 days

  @EMP-08 @P1
  Scenario: A leave year crossing into the next calendar year is calculated correctly
    Given I use the "crossYear" employment-period fixture
    When I calculate their entitlement
    Then the entitlement should be 14.1 days

  @EMP-09 @P1
  Scenario: A leave year starting on 1 April 2024 uses the pay-period hours question
    Given the employee works irregular hours or for part of the year
    When I enter a leave-year start date of "1 April 2024"
    And I continue
    Then the calculator shows the "pay-period hours question"

  @EMP-10 @P1 @end_to_end @E2E-08
  Scenario: A starter's leave year must begin before their employment start date
    Given a worker is starting part way through a leave year
    When their employment and leave-year start dates are both 1 January 2026
    Then the starter route should explain that the leave year must start earlier
    When I correct the leave-year start date to 31 December 2025
    Then the journey should continue to the next question

  @EMP-11 @P1
  Scenario: A worker's end date cannot be before their start date
    Given a worker's employment start and end dates are requested
    When I enter an employment start date of "1 July 2026"
    And I enter an employment leaving date of "30 June 2026"
    Then the calculator explains that the end date cannot be before the start date
