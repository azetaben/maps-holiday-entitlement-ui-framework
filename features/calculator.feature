@local_app @local_calculator @suite:LocalCalculator @owner:QE
Feature: Core calculator journeys run against a deterministic local target
  The local calculator fixture gives core journeys stable page behavior and known results without a GOV.UK dependency.

  Background:
    Given I open the holiday entitlement calculator
    And the page header should be "Calculate holiday entitlement"
    And The related content and Explore the topic links are visible

  @LOCAL-CALC-00 @P1
  Scenario: A visitor can recover from a missing worker-type answer
    When I start the calculator
    Then I should be asked whether the employee works irregular hours or for part of the year
    When I continue without choosing an answer
    Then I should remain on the worker-type question
    And I select "No"
    And I continue

  @LOCAL-CALC-01 @P1 @smoke
  Scenario: A five-day regular worker receives 28 days of leave
    When I start the calculator
    Then I should be asked whether the employee works irregular hours or for part of the year
    When I select option "No"
    And I continue
    When I select calculation basis "days worked per week"
    And I continue
    And I should see "Do you want to work out holiday" header
    When I select leave year period "for a full leave year"
    And I continue
    When I enter "5"
    And I continue
    Then the result page should be displayed
    And the entitlement should be 28 days


  @LOCAL-CALC-01 @P1 @smoke
  Scenario Outline: A ten-day regular worker receives 28 days of leave
    When I start the calculator
    Then I should be asked whether the employee works irregular hours or for part of the year
    When I select option "No"
    And I continue
    When I select calculation basis "hours worked per week"
    And I continue
    And I should see "Do you want to work out holiday" header
    When I select leave year period "for someone starting part way through a leave year"
    And I continue
    And I should see "What was the employment start date?" header
    When I fill employment started date "10", "6" and "2026" respectively:
    And I continue
    When I fill "<day>", "<month>" and "<year>" respectively:
    And I continue
    And I should see "Number of hours worked per week?" header
    And I enter "10" of hours worked per week
    Then the result page should be displayed
#    And the entitlement should be 28 days

    Examples: employment started date
      | day | month | year |
      | 10  | 1     | 2026 |

  @LOCAL-CALC-02 @P1
  Scenario Outline: An irregular-hours worker accrues four hours from 30 hours worked
    When I start the calculator
    Then I should be asked whether the employee works irregular hours or for part of the year
    When  I select option "Yes"
    And I continue
    And I should see "When does the leave year start?" header
    When I fill "<day>", "<month>" and "<year>" respectively:
    And I continue
    And I should see "How many hours has the employee worked in the pay period?" header
    When I enter 30 hours work in the pay period
    And I continue
    Then the result page should be displayed
    And the entitlement should be 4 hours

    Examples: employment leave year start date
      | day | month | year |
      | 1   | 4     | 2026 |

  @LOCAL-CALC-03 @P1
  Scenario: A shift worker receives the statutory cap when their pattern exceeds five shifts a week
    When I start the calculator
    Then I should be asked whether the employee works irregular hours or for part of the year
    When I select option "No"
    And I continue
    When I select calculation basis "hours worked per week"
    When I select calculation basis "shifts"
    And I continue
    And I should see "Do you want to calculate the holiday:" header
    When I select leave year period "for a full leave year"
    And I continue
    And I should see "How many hours in each shift?" header
    When I enter how many hours in each shift "5"
    And I continue
    And I should see "How many shifts will be worked per shift pattern?" header
    When I enter shifts count "6"
    And I continue
    And I should see "How many days in the shift pattern?" header
    When I enter daily duration shift as "7"
    And I continue
    And I should see "Information based on your answers" header
    Then the result page should be displayed
    And the result should state the capped shift entitlement
    And the employer entitlement guidance should include
      | can include public and bank holidays as part of the statutory entitlement |
      | can provide more paid holiday through contractual leave entitlement       |
      | must provide holiday pay during statutory leave                           |
