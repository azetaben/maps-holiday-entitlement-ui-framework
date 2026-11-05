@holiday_entitlement @calculator_page @requires_network
Feature: Understand the holiday entitlement calculator landing page
  As an employee or employer visiting the calculator
  I want to understand which leave calculations it supports and find related guidance
  So that I can choose the right service and get help when I need it

  Background:
    Given I open the holiday entitlement calculator

  @PAGE-01 @P2
  Scenario: The landing page provides related holiday guidance
    And The related content and Explore the topic links are visible


  @PAGE-04 @P2
  Scenario: Start the calculator
    And the page title should be "Calculate holiday entitlement - GOV.UK"
    And the page url should be "calculate-your-holiday-entitlement"
    And the page url should contain "https://www.gov.uk/calculate-your-holiday-entitlement"
    And The page breadcrumb should be "Statutory leave and time off"
    And the page header should be "Calculate holiday entitlement"
    And I should see the following page properties below:
      | Calculate holiday entitlement                       |
      | Use this tool to calculate holiday entitlement for: |
      | a full leave year                                   |
      | Related content                                     |
      | Start now                                           |
      | Explore the topic                                   |

    And I can see the side widget related content
      | Calculate your agricultural worker holiday entitlement |
      | Holiday entitlement                                    |
      | Night working hours                                    |
      | Sunday working                                         |

    When I start the calculator
    Then the page header should be "Does the employee work irregular hours or for part of the year?"