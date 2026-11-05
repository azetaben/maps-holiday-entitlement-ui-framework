@local_app @local_calculator @suite:LocalCalculator @owner:QE
Feature: Visual verification
  Background:
    Given I open the holiday entitlement calculator

  @PAGE-03A @P2 @visual
  Scenario: The Start now button is visually presented on the landing page
    Then the Start now button should be visually presented


