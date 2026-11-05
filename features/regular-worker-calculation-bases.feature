@local_app @local_calculator @suite:LocalCalculator @owner:QE
Feature: Complete regular-worker journeys for each calculation basis
  A regular worker can choose any supported basis and reach the corresponding calculation flow.

  Background:
    Given I open the holiday entitlement calculator

  @LOCAL-CALC-BASES-01 @P1 @end_to_end
  Scenario Outline: A regular worker's selection leads to the leave-year question
    When I start the calculator
    And I select option "No"
    And I continue
    And I select calculation basis "<basis>"
    And I continue
    Then all four leave year periods should be available

    Examples:
      | basis                 |
      | days worked per week  |
      | hours worked per week |
      | annualised hours      |
      | compressed hours      |
      | shifts                |

  @LOCAL-CALC-BASES-02 @P1 @end_to_end
  Scenario Outline: A regular worker reaches an answer field for each calculation basis
    When I start the calculator
    And I select option "No"
    And I continue
    And I select calculation basis "<basis>"
    And I continue
    And I select leave year period "for a full leave year"
    And I continue

    Examples:
      | basis                 |
      | days worked per week  |
      | hours worked per week |
      | annualised hours      |
      | compressed hours      |
      | shifts                |
