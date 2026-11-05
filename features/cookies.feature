@cookies @requires_network @suite:Cookies @owner:QE
Feature: Visitors can manage optional cookies
  As a visitor
  I want to understand and manage optional cookies
  So that my privacy choices are respected

  Background:
    Given I open the calculator without changing cookie choices

  @COOKIE-01 @P1
  Scenario: A visitor can understand the cookie notice
    Then the cookie banner should explain essential and optional cookies
    And the cookie banner should offer actions to accept, reject, or review cookies

  @COOKIE-02 @P1
  Scenario: A visitor can reject additional cookies from the notice
    When I reject optional cookies
    Then the banner should confirm that my choice was saved

  @COOKIE-03 @P1
  Scenario: A visitor can review cookie choices before deciding
    When I open cookie settings from the banner
    Then the cookie settings page should be displayed
    And I can review the optional cookie categories before saving a choice

  @COOKIE-04 @P1
  Scenario: A visitor can reject all optional cookie categories
    Given I open cookie settings from the banner
    When I choose reject for "Cookies that measure website use"
    And I choose reject for "Cookies that remember your settings"
    And I choose reject for "Cookies that help with communications and marketing"
    Then those cookie choices should be selected
    When I save cookie settings
    Then my cookie choices should be saved successfully

  @P1
  Scenario Outline: A visitor can allow one optional category and reject the others
    Given I open cookie settings from the banner
    When I choose allow for "<allowed_category>"
    And I choose reject for "<rejected_category_1>"
    And I choose reject for "<rejected_category_2>"
    Then those cookie choices should be selected
    When I save cookie settings
    Then my cookie choices should be saved successfully

    @COOKIE-05
    Examples: Allow website-use cookies only
      | allowed_category                      | rejected_category_1                  | rejected_category_2                              |
      | Cookies that measure website use      | Cookies that remember your settings  | Cookies that help with communications and marketing |

    @COOKIE-06
    Examples: Allow settings cookies only
      | allowed_category                      | rejected_category_1                                     | rejected_category_2                              |
      | Cookies that remember your settings   | Cookies that measure website use                       | Cookies that help with communications and marketing |

    @COOKIE-07
    Examples: Allow communications and marketing cookies only
      | allowed_category                                         | rejected_category_1                  | rejected_category_2                    |
      | Cookies that help with communications and marketing      | Cookies that measure website use      | Cookies that remember your settings    |
