@REQ_MON-24518
Feature: Configuring status grid widget
  As a Centreon User with dashboard update rights,
  I need to configure a widget containing a status grid on a dashboard
  To manipulate the properties of the status grid Widget and test the outcome of each manipulation.

  @TEST_MON-24937
  Scenario: Editing the displayed resource status of a Status Grid widget
    Given a dashboard that includes a configured Status Grid widget
    When the dashboard administrator user selects a particular status in the displayed resource status list
    Then only the resources with this particular status are displayed in the Status Grid Widget

  @TEST_MON-24936
  Scenario: Editing the displayed resource type of a Status Grid widget
    Given a dashboard configuring Status Grid widget
    When the dashboard administrator user updates the displayed resource type of the widget
    Then the list of available statuses to display is updated in the configuration properties
    And the widget is updated to reflect that change in displayed resource type

  @TEST_MON-24945
  Scenario: Deleting a Status Grid widget
    Given a dashboard featuring two Status Grid widgets
    When the dashboard administrator user deletes one of the widgets
    Then only the contents of the other widget are displayed

  @TEST_MON-24935
  Scenario: Creating and configuring a new Status Grid widget on a dashboard
    Given a dashboard in the dashboard administrator user's dashboard library
    When the dashboard administrator user selects the option to add a new widget
    And selects the widget type "Status Grid"
    Then configuration properties for the Status Grid widget are displayed
    When the dashboard administrator user selects a list of resources for the widget
    Then a grid representing the statuses of this list of resources are displayed in the widget preview
    When the user saves the Status Grid widget
    Then the Status Grid widget is added in the dashboard's layout

  @TEST_MON-24943
  Scenario: Editing the number of displayed tiles on a Status Grid widget
    Given a dashboard with a configured Status Grid widget
    When the dashboard administrator user updates the maximum number of displayed tiles in the configuration properties
    Then the Status Grid widget displays up to that number of tiles

  @TEST_MON-24944
  Scenario: Duplicating a Status Grid widget
    Given a dashboard having a configured Status Grid widget
    When the dashboard administrator user duplicates the Status Grid widget
    Then a second Status Grid widget is displayed on the dashboard
    And the second widget has the same properties as the first widget

  @TEST_MON-130767
  Scenario: Access the resource status page by clicking on a resource from the status grid widget
    Given a dashboard with a Status Grid widget
    When the dashboard administrator clicks on a random resource
    Then the user should be redirected to the resource status screen and all the resources must be displayed

  @TEST_MON-148286
  Scenario: Adding a new host and verifying widget behavior
    Given a new host is successfully added and configured
    When the dashboard administrator adds a status grid widget
    Then the newly added host is displayed in the status grid widget

  @TEST_MON-149365
  Scenario: Adding and Filtering Resources in a Status Grid Widget on a Dashboard
    Given a dashboard in the dashboard administrator user's dashboard library
    When the dashboard administrator user selects the option to add a new widget
    And selects the widget type "Status Grid"
    And searches for a specific resource type
    Then only the resource that matches the search input is displayed in the results

  @TEST_MON-153189
  Scenario: Verifying the Proper Functionality of the Resource Filter
    Given a dashboard in the dashboard administrator user's dashboard library
    When the dashboard administrator user selects the option to add a new widget
    And selects the widget type "Status Grid"
    Then configuration properties for the Status Grid widget are displayed
    When the dashboard administrator selects a service by typing a single character
    Then only the services containing the typed character should be displayed in the list