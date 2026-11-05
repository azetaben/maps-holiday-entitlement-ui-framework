@holiday_entitlement @calculator_entry @requires_network
Feature: Start a holiday entitlement calculation
  As an employee or employer
  I want to start the GOV.UK holiday entitlement calculator
  So that I can find the appropriate entitlement calculation

  Background:
    Given I open the holiday entitlement calculator

  @ENTRY-01 @P1 @smoke @contract
  Scenario: The landing page explains the service and offers a start action
    Then I should see the calculator introduction
    And the page should provide a Start now action

  @ENTRY-02 @P1
  Scenario: Starting the calculator opens the worker-type question
    When I start the calculator
    Then I should be asked whether the employee works irregular hours or for part of the year
    And I should be able to choose Yes or No

  @ENTRY-03A @P1
  Scenario: A regular-hours answer leads to the regular-worker questions
    When I start the calculator
    And I select "No"
    And I continue
    Then the "regular hours" calculator page should be displayed

  @ENTRY-03B @P1
  Scenario: An irregular-hours answer leads to the accrual questions
    And I start the calculator
    And  I select option "Yes"
    When I continue
    Then I should see "When does the leave year start?" header

  @ENTRY-04 @P1 @smoke @contract @end_to_end @E2E-01
  Scenario: A visitor can recover from a missing answer and complete a calculation
    When I start the calculator
    And I continue without choosing an answer
    Then I should remain on the worker-type question
    And a required-selection error should identify the unanswered question
    When I select option "No"
    And I continue
    And I select calculation basis "days worked per week"
    And I continue
    And I select leave year period "full-year"
    And I continue
    When I enter "5"
    And I continue
    Then the entitlement should be 28 days
