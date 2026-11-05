@holiday_entitlement @happy_path @requires_network
Feature: Complete successful holiday entitlement calculations
  As an employee or employer
  I want to complete a calculation with valid answers
  So that I can see the statutory holiday entitlement for the work pattern

  Background:
    Given I open the holiday entitlement calculator

  @POS-01 @P1 @smoke
  Scenario: Start a calculation from the calculator landing page
    Then the landing page should be displayed
    And I should see the calculator introduction
    And the page should provide a Start now action
    When I select Start now
    Then I should be asked whether the employee works irregular hours or for part of the year

  @POS-02 @P1 @end_to_end
  Scenario Outline: Calculate annual leave for a regular weekly work pattern
    Given I am calculating a regular worker's entitlement for a full leave year
    When I enter <days_per_week> working days per week and complete the calculation
    Then the entitlement should be <entitlement> days

    Examples:
      | days_per_week | entitlement |
      | 1             | 5.6         |
      | 2.5           | 14          |
      | 3             | 16.8        |
      | 5             | 28          |
      | 7             | 28          |

  @POS-03 @P1 @end_to_end
  Scenario Outline: Calculate leave accrued from irregular-hours work in a pay period
    Given I am calculating irregular-hours accrual for a leave year beginning on 1 April 2026
    When I enter <hours_worked> hours worked in one pay period and complete the calculation
    Then the entitlement should be <leave_accrued> hours

    Examples:
      | hours_worked | leave_accrued |
      | 30           | 4             |
      | 100          | 12            |
      | 12.42        | 1             |
      | 12.43        | 2             |
