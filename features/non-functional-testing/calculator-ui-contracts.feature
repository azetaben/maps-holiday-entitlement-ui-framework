@technical @page_objects @requires_network
Feature: Calculator interface contracts
  The calculator questions expose accessible controls and support the documented journey.

  Background:
    Given I open the holiday entitlement calculator

  Scenario: Worker type choices are accessible and mutually exclusive
    When I start the calculator
    Then I should be asked whether the employee works irregular hours or for part of the year
    And I should be able to choose Yes or No
    And the worker-type question should remain unanswered
    When I select "No"
    Then only No should be selected on the worker type page
    When I select "Yes"
    Then only Yes should be selected on the worker type page
    When I continue
    Then the "irregular hours" calculator page should be displayed

  Scenario: The regular-hours question exposes its calculation choices
    When I start the calculator
    And I select "No"
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
    When I select calculation basis "days worked per week"
    Then calculation basis "days worked per week" should be selected on the "regular hours" page
    When I continue
    Then the "leave year period" calculator page should be displayed
    And all four leave year periods should be available
    And no leave year period should be selected
    When I select leave year period "for a full leave year"
    Then leave year period "for a full leave year" should be selected
    When I continue
    Then a calculator answer input should be displayed

  Scenario: Invalid working-day input can be corrected
    Given I am calculating a regular worker's entitlement for a full leave year
    When I enter "8" and submit the answer
    Then I should receive a recoverable invalid-value error
    When I enter "5" and submit the answer
    Then the result page should be displayed
    And the entitlement should be 28 days

  Scenario: An irregular-hours journey reaches the pay-period question
    When I start the calculator
    And I select "Yes"
    And I continue
    Then the "irregular hours" calculator page should be displayed
    And I should see "When does the leave year start?" header
    When I fill "1", "4" and "2026" respectively:
    And I continue
    Then the "hours in pay period" calculator page should be displayed
    When I enter "30" and submit the answer
    Then the result page should be displayed
    And the entitlement should be 4 hours

  Scenario: Landing page navigation and supporting content remain available
    And the page header should be "Calculate holiday entitlement"
    And The related content and Explore the topic links are visible
    And the "GOV.UK" link in the "header" should point to "/"
    When I open the navigation menu
    Then the navigation menu should be open
    And the navigation menu should show its service and government sections
    And the "Benefits" link in the "menu" should point to "/browse/benefits"
    When I close the navigation menu
    Then the navigation menu should be closed
    And the footer should be displayed with licence and copyright information
    And the footer link "Help" should point to "/help"
    And the feedback prompt should be in its initial state
