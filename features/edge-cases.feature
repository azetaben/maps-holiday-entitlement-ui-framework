@holiday_entitlement @edge @requires_network
Feature: Handle holiday entitlement boundaries and journey state

  Background:
    Given I open the holiday entitlement calculator

  # Statutory limits and field validation
  @EDGE-01 @P1
  Scenario Outline: Apply the statutory day cap
    Given I am calculating a regular worker's entitlement for a full leave year
    When I enter <days> working days per week and complete the calculation
    Then the entitlement should be 28 days

    Examples:
      | days |
      | 5    |
      | 6    |
      | 7    |

  @EDGE-02 @P1
  Scenario Outline: Handle zero according to the field-specific rule
    Given I am on the "<field>" question
    When I enter "0" and submit the answer
    Then zero should be rejected for that field

    Examples:
      | field                       |
      | working days per week       |
      | hours worked per pay period |

  @EDGE-03 @P1
  Scenario: Handle fractional working days
    Given I am calculating a regular worker's entitlement for a full leave year
    When I enter 2.5 working days per week and complete the calculation
    Then the entitlement should be 14 days

  @EDGE-04 @P1
  Scenario Outline: Enforce the working-days-per-week range
    Given I am calculating a regular worker's entitlement for a full leave year
    When I submit <value> working days per week
    Then the working-days answer "<value>" should be <outcome>

    Examples:
      | value | outcome  |
      | 0.1   | rejected |
      | 7     | accepted |
      | 0     | rejected |
      | 7.1   | rejected |

  @EDGE-05 @P1
  Scenario Outline: Round accrual on either side of a half-hour threshold
    Given I am calculating irregular-hours accrual for a leave year beginning on 1 April 2026
    When I enter <worked> hours worked in one pay period and complete the calculation
    Then the entitlement should be <leave> hours

    Examples:
      | worked | leave |
      | 28     | 3     |
      | 29     | 4     |

  # Accrual rounding
  @EDGE-06 @P1
  Scenario Outline: Round decimal-hour accrual near the threshold
    Given I am calculating irregular-hours accrual for a leave year beginning on 1 April 2026
    When I enter <worked> hours worked in one pay period and complete the calculation
    Then the entitlement should be <leave> hours

    Examples:
      | worked | leave |
      | 12.42  | 1     |
      | 12.43  | 2     |

  # State changes and browser history
  @EDGE-13 @P1
  Scenario: Discard irrelevant answers after switching worker type
    Given I have a full-year regular-worker result of 28 days for a five-day week
    When I change the worker type to irregular-hours working
    And I complete the new branch with valid answers
    Then the result should show the irregular-hours answers and omit the regular-hours answers


