@technical @page_contract @requires_network
Feature: Calculator question page contracts
  Calculator questions should present accessible choices, submit the expected response, and retain relevant answers.

  Background:
    Given I open the holiday entitlement calculator

  @QUESTION-Y-01 @P1
  Scenario: The worker-type question page exposes its complete form and accessible controls
    When I start the calculator
    Then I should be asked whether the employee works irregular hours or for part of the year
    And I should be able to choose Yes or No
    And I select "No"
    Then only No should be selected on the worker type page
    And I select "Yes"
    Then only Yes should be selected on the worker type page
    And I continue
    Then the "irregular hours" calculator page should be displayed

  @QUESTION-Y-02 @P1
  Scenario: The regular-worker route exposes its complete calculation-basis question and previous answer
    When I start the calculator
    And I answer No to irregular-hours or part-year working
    And I continue
    Then the "regular hours" calculator page should be displayed
    And the regular-worker calculation-basis question page should match its complete form contract
    And the calculation-basis question should present these choices
      | days worked per week  |
      | hours worked per week |
      | annualised hours      |
      | compressed hours      |
      | shifts                |
    And the calculation-basis hint should refer to the employment contract
    And the answer summary should show
      | question                                                        | answer |
      | Does the employee work irregular hours or for part of the year? | No     |
    And I should see the "Start again" link
    And I should see a "Change" link for "Does the employee work irregular hours or for part of the year?"

  @QUESTION-Y-03 @P1
  Scenario: Changing the worker-type answer returns to the regular calculation-basis question
    Given I start the regular-worker calculation-basis journey
    When I change the answer to "No" for "Does the employee work irregular hours or for part of the year?"
    Then the "regular hours" calculator page should be displayed
    And the answer summary should show
      | question                                                        | answer |
      | Does the employee work irregular hours or for part of the year? | No     |

  @QUESTION-Y-04 @P2
  Scenario: Starting again returns to the calculator landing page
    Given I start the regular-worker calculation-basis journey
    When I follow the "Start again" link
    Then the landing page should be displayed


  @QUESTION-Y-05 @P1
  Scenario Outline: A regular worker can select each calculation basis
    Given I start the regular-worker calculation-basis journey
    When I select option "<holiday entitlement based>"
    Then calculation basis "<holiday entitlement based>" should be selected on the "regular hours" page
    When I continue
    Then the journey should continue to the next question

    Examples:
      | holiday entitlement based |
      | days worked per week      |
      | hours worked per week     |
      | annualised hours          |
      | compressed hours          |
      | shifts                    |


  @QUESTION-Y-06 @P1
  Scenario Outline: A regular worker can choose how the leave-year calculation is based
    Given I start the regular-worker calculation-basis journey
    When I select calculation basis "days worked per week"
    And I continue
    Then all four leave year periods should be available
    And the leave-year period options should include
      | for a full leave year                                          |
      | for someone starting part way through a leave year             |
      | for someone leaving part way through a leave year              |
      | for someone starting and leaving part way through a leave year |
    When I select leave year period "<calculate the holiday>"
    Then leave year period "<calculate the holiday>" should be selected
    When I continue
    Then the journey should continue to the next question

    Examples:
      | calculate the holiday                                          |
      | for a full leave year                                          |
      | for someone starting part way through a leave year             |
      | for someone leaving part way through a leave year              |
      | for someone starting and leaving part way through a leave year |


  @QUESTION-Y-07 @P1
  Scenario: A shift worker can complete a full-year calculation
    Given I start the regular-worker calculation-basis journey
    When I select calculation basis "shifts"
    Then calculation basis "shifts" should be selected on the "regular hours" page
    When I continue
    Then all four leave year periods should be available
    And the leave-year period options should include
      | for a full leave year                                          |
      | for someone starting part way through a leave year             |
      | for someone leaving part way through a leave year              |
      | for someone starting and leaving part way through a leave year |
    When I select leave year period "for a full leave year"
    Then leave year period "for a full leave year" should be selected
    When I continue
    Then I should see the shift question "How many hours in each shift?"
    And Your answers are displayed
    When I enter "5" and submit the answer
    Then I should see the shift question "How many shifts will be worked per shift pattern?"
    And Your answers are displayed
    When I enter "5" and submit the answer
    Then the shift-pattern duration question should be displayed
    And Your answers are displayed
    When I enter "7" and submit the answer
    Then the result page should be displayed
    And I should see the statutory entitlement result


  @QUESTION-Y-08 @P1
  Scenario: A shift worker receives the capped annual entitlement in shifts
    Given I start the regular-worker calculation-basis journey
    When I select calculation basis "shifts"
    Then calculation basis "shifts" should be selected on the "regular hours" page
    When I continue
    Then all four leave year periods should be available
    And the leave-year period options should include
      | for a full leave year                                          |
      | for someone starting part way through a leave year             |
      | for someone leaving part way through a leave year              |
      | for someone starting and leaving part way through a leave year |
    When I select leave year period "for a full leave year"
    Then leave year period "for a full leave year" should be selected
    When I continue
    Then I should see the shift question "How many hours in each shift?"
    And Your answers are displayed
    When I enter "5" and submit the answer
    Then I should see the shift question "How many shifts will be worked per shift pattern?"
    And Your answers are displayed
    When I enter "6" and submit the answer
    Then the shift-pattern duration question should be displayed
    And Your answers are displayed
    When I enter "7" and submit the answer
    Then the result page should be displayed
    And I should see the statutory entitlement result
    And the result should state the capped shift entitlement
    And the employer entitlement guidance should include
      | can include public and bank holidays as part of the statutory entitlement |
      | can provide more paid holiday through contractual leave entitlement       |
      | must provide holiday pay during statutory leave                           |
    And Your answers are displayed
