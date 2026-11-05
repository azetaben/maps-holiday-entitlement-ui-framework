@holiday_entitlement @irregular_hours @requires_network
Feature: Calculate leave accrued by irregular-hours workers
  As an employee or employer
  I want to calculate leave accrued during a pay period
  So that the worker receives the statutory accrual for the hours worked

  Background:
    Given I open the holiday entitlement calculator
    And the page header should be "Calculate holiday entitlement"

  @ACCRUAL-01 @P1 @smoke @contract
  Scenario Outline: Accrual is calculated from hours worked in a pay period
    Given I am calculating irregular-hours accrual for a leave year beginning on 1 April 2026
    When I enter <worked> hours worked in one pay period and complete the calculation
    Then the entitlement should be <leave> hours

    @end_to_end @E2E-04
    Examples: Core pay-period accrual journey
      | worked | leave |
      | 30     | 4     |

    Examples: Additional accrual coverage
      | worked | leave |
      | 100    | 12    |

  @ACCRUAL-02 @P1
  Scenario Outline: Accrued leave is rounded around a half-hour threshold
    Given I am calculating irregular-hours accrual for a leave year beginning on 1 April 2026
    When I enter <worked> hours worked in one pay period and complete the calculation
    Then the entitlement should be <leave> hours

    Examples:
      | worked | leave |
      | 28     | 3     |
      | 29     | 4     |
      | 12.42  | 1     |
      | 12.43  | 2     |

  @ACCRUAL-03 @P1
  Scenario: A worker cannot accrue leave from zero hours in a pay period
    Given I am on the "hours worked per pay period" question
    When I enter "0"
    And I continue
    Then zero should be rejected for that field
