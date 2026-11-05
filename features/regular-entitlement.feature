@holiday_entitlement @regular_entitlement @requires_network
Feature: Calculate annual leave for regular-hours workers
  As an employee or employer
  I want to calculate statutory leave for a regular work pattern
  So that I know the worker's entitlement for the leave year

  Background:
    Given I open the holiday entitlement calculator

  @REG-01 @P1 @smoke @contract @end_to_end @E2E-02
  Scenario: A five-day week receives the full statutory entitlement
    Given I am calculating a regular worker's entitlement for a full leave year
    When I enter 5 working days per week and complete the calculation
    Then the entitlement should be 28 days

  @REG-02 @P1
  Scenario: A three-day week receives a pro-rata entitlement
    Given I am calculating a regular worker's entitlement for a full leave year
    When I enter 3 working days per week and complete the calculation
    Then the entitlement should be 16.8 days

  @REG-03 @P1
  Scenario: A one-day week receives a pro-rata entitlement
    Given I am calculating a regular worker's entitlement for a full leave year
    When I enter 1 working day per week and complete the calculation
    Then the entitlement should be 5.6 days

  @REG-04 @P1
  Scenario: Fractional working days produce a proportional entitlement
    Given I am calculating a regular worker's entitlement for a full leave year
    When I enter 2.5 working days per week and complete the calculation
    Then the entitlement should be 14 days

  @REG-05 @P1
  Scenario Outline: The statutory entitlement is capped at 28 days
    Given I am calculating a regular worker's entitlement for a full leave year
    When I enter <days> working days per week and complete the calculation
    Then the entitlement should be 28 days

    Examples:
      | days |
      | 6    |
      | 7    |

  @REG-09 @P1
  Scenario Outline: The calculator accepts only supported working-days values
    Given I am calculating a regular worker's entitlement for a full leave year
    When I submit <days> working days per week
    Then the working-days answer "<days>" should be <outcome>

    Examples:
      | days | outcome  |
      | 0.1  | rejected |
      | 0    | rejected |
      | 7    | accepted |
      | 7.1  | rejected |

  @REG-06 @P1 @end_to_end @E2E-03
  Scenario: Weekly hours are converted into an entitlement in hours
    Given I am calculating a regular worker's entitlement for a full leave year
    When I enter 35 working hours over 5 working days per week
    And I complete the calculation
    Then the entitlement should be 196 hours
    And the result should clearly identify the unit as hours

  @REG-07 @P1
  Scenario: Changing the work pattern recalculates the entitlement
    Given I have a full-year regular-worker result of 28 days for a five-day week
    When I change the working-days answer to 3 using the available change control
    And I complete the calculation
    Then the entitlement should be 16.8 days
    And the displayed working-days answer should be 3

  @REG-08 @P2
  Scenario: Restarting a calculation clears previous answers
    Given I have completed a calculation
    When I use the available restart control
    Then a new calculator journey should begin
    And the previous answers should not affect the new calculation
