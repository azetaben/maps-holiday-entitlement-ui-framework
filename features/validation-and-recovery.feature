@holiday_entitlement @validation_recovery @requires_network
Feature: Recover from invalid answers in a holiday entitlement calculation
  As an employee or employer
  I want clear guidance when an answer is missing or invalid
  So that I can correct it and complete the calculation

  Background:
    Given I open the holiday entitlement calculator

  @VAL-01 @P1 @smoke @contract
  Scenario: A worker can correct a missing worker-type answer and complete a calculation
    When I select Start now
    And I continue without selecting a worker type
    Then I should remain on the worker-type question
    And a required-selection error should identify the unanswered question
    And I select option "No"
    And I continue
    And I select calculation basis "days worked per week"
    And I continue
    And I select leave year period "for a full leave year"
    And I continue
    When I enter "5" and continue
    Then the entitlement should be 28 days

  @VAL-02 @P1
  Scenario: A required numeric answer cannot be left blank
    Given I am on a required numeric question
    When I leave the numeric answer blank and continue
    Then I should receive a recoverable required-field error

  @VAL-03 @P1
  Scenario: Alphabetic text is rejected in a numeric answer
    Given I am on a days-or-hours numeric question
    When I enter "abc" and continue
    Then I should receive a recoverable numeric-entry error

  @VAL-04 @P1
  Scenario: A negative numeric answer is rejected
    Given I am on a days-or-hours numeric question
    When I enter "-5" and continue
    Then I should receive a recoverable invalid-value error

  @VAL-05 @P1
  Scenario: More than seven working days per week is rejected
    Given I am on the working-days-per-week question
    When I enter "8" and continue
    Then I should receive a recoverable error explaining the permitted range

  @VAL-06 @P1
  Scenario: An extremely large number is rejected without crashing the service
    Given I am on a required numeric question
    When I enter a number containing 100 digits and continue
    Then I should receive a recoverable invalid-value error
    And no overflow, service crash or calculated result should be displayed

  @VAL-07 @P1
  Scenario Outline: An invalid calendar date is rejected
    Given I am on a required date question
    When I enter day <day>, month <month> and year <year> and continue
    Then I should receive a recoverable invalid-date error

    Examples:
      | day | month | year |
      | 31  | 4     | 2026 |
      | 29  | 2     | 2025 |

  @VAL-08 @P1
  Scenario Outline: A date with a missing component is rejected and completed answers remain available
    Given I am on a required date question
    When I enter a valid date except for a missing <component> and continue
    Then I should receive a recoverable incomplete-date error
    And the completed date components should be retained when "<component>" is missing

    Examples:
      | component |
      | day       |
      | month     |
      | year      |

  @VAL-09 @P2
  Scenario Outline: Alternative numeric formats are handled consistently
    Given I am calculating a regular worker's entitlement for a full leave year
    When I submit the numeric format "<format>" and continue
    Then the numeric answer should be <outcome>

    Examples:
      | format                  | outcome  |
      | leading whitespace      | accepted |
      | trailing whitespace     | accepted |
      | leading zero            | accepted |
      | comma decimal separator | rejected |

  @VAL-10 @P1
  Scenario: Switching to irregular-hours work removes regular-hours answers
    Given I have a full-year regular-worker result of 28 days for a five-day week
    When I change the worker type to irregular-hours working
    And I complete the new branch with valid answers
    Then the result should show the irregular-hours answers and omit the regular-hours answers

  @VAL-11 @P2
  Scenario Outline: A worker can continue the journey with browser navigation
    Given I have reached a calculator <page>
    When I navigate using browser Back and Forward
    Then the displayed answers and any result should remain consistent
    And the journey should remain usable

    Examples:
      | page     |
      | question |
      | result   |

  @VAL-12 @P1
  Scenario: Script text cannot execute as an answer
    Given I am on a text-capable calculator input
    When I enter "<script>alert(1)</script>" in the date field and submit
    Then no script should execute
    And the input should be rejected or rendered as literal text

  @VAL-13 @P2
  Scenario Outline: A malformed journey link offers a safe recovery path
    Given I have a valid calculator journey URL
    When I open that URL after inserting an <invalid_value>
    Then the service should show a recoverable error or a valid restart path
    And no stack trace or unhandled service error should be displayed

    Examples:
      | invalid_value      |
      | unsupported answer |
      | malformed value    |
