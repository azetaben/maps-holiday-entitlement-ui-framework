import {Locator, Page} from '@playwright/test';
import {DateQuestionPage} from '../date-question.page';
import {FooterPage} from '../footer.page';
import {LandingPage} from '../landing.page';
import {LocalAccessibilityPage} from '../local-accessibility.page';
import {LeaveYearPeriodPage} from '../leave-year-period.page';
import {NavigationPage} from '../navigation.page';
import {NumericQuestionPage} from '../numeric-question.page';
import {CompressedHoursPage} from '../compressed-hours.page';
import {CookiesPage} from '../cookies.page';
import {RegularHoursPage} from '../regular-hours.page';
import {ResultPage} from '../result.page';
import {SearchPage} from '../search.page';
import {WorkerTypePage} from '../worker-type.page';
import frameworkConfig from '../../config/framework.json';
import {HOURS_WORKED_PER_WEEK_BASIS, REGULAR_WORK_DAYS_BASIS,} from '../../test_data/CalculatorContract';
import {DaysWorkedPerWeekQuestionPage} from "../days-worked-per-week-question.page";
import {WorkerTypeLeaveYearStartPage} from "../worker-type-leave-year-start.page";
import {LeaveYearStartDatePage} from "../leave-year-start-date.page";
import {EmploymentStartDatePage} from "../employment-start-date.page";
import {NumberOfDaysWorkedPerWeekPage} from "../number-of-days-worked-per-week.page";
import {HowManyHoursInEachShiftPage} from "../how-many-hours-in-each-shift.page";
import {ShiftsPerShiftPatternPage} from "../shifts-per-shift-pattern.page";
import {ShiftPatternDurationPage} from "../shift-pattern-duration.page";

export const CALCULATOR_PAGE_ROUTES = {
  'worker type': 'workerType',
  'part of the year': 'workerType',
  'irregular hours': 'dateQuestion',
  'regular hours': 'regularHours',
  'calculation basis': 'regularHours',
  'leave year period': 'leaveYearPeriod',
  'employment start date': 'dateQuestion',
  'employment end date': 'dateQuestion',
  'employment leaving date': 'dateQuestion',
  'leave year start date': 'dateQuestion',
  date: 'dateQuestion',
  [REGULAR_WORK_DAYS_BASIS]: 'numericQuestion',
  [HOURS_WORKED_PER_WEEK_BASIS]: 'numericQuestion',
  'days worked per week for hours': 'numericQuestion',
  'annualised hours': 'numericQuestion',
  'compressed hours': 'compressedHours',
  'hours in pay period': 'numericQuestion',
  current: 'numericQuestion',
  result: 'result',
} as const;

export type CalculatorPageRoute = keyof typeof CALCULATOR_PAGE_ROUTES;
export type CalculatorPageKey = (typeof CALCULATOR_PAGE_ROUTES)[CalculatorPageRoute];

export function calculatorPageRoute(name: string): CalculatorPageRoute {
  const normalized = name.toLowerCase().replace(/[_-]/g, ' ').trim();
  if (Object.hasOwn(CALCULATOR_PAGE_ROUTES, normalized)) return normalized as CalculatorPageRoute;
  throw new Error(
    `Unknown calculator page "${name}". Supported pages: ${Object.keys(CALCULATOR_PAGE_ROUTES).join(', ')}.`,
  );
}

export class PageManager {
  readonly landing: LandingPage;
  readonly localAccessibility: LocalAccessibilityPage;
  readonly workerType: WorkerTypePage;
  readonly regularHours: RegularHoursPage;
  readonly leaveYearPeriod: LeaveYearPeriodPage;
  readonly daysWorkedPerWeekQuestionPage: DaysWorkedPerWeekQuestionPage;
  readonly numericQuestion: NumericQuestionPage;
  readonly workerTypeLeaveYearStartPage: WorkerTypeLeaveYearStartPage;
  readonly leaveYearStartDatePage: LeaveYearStartDatePage;
  readonly dateQuestion: DateQuestionPage;
  readonly irregularHours: DateQuestionPage;
  readonly employmentStartDate: DateQuestionPage;
  readonly employment_Start_Date:EmploymentStartDatePage;
  readonly  noOfDaysWorkedPerWeekPage: NumberOfDaysWorkedPerWeekPage;
  readonly hoursInEachShiftPage: HowManyHoursInEachShiftPage;
  readonly shiftsPerShiftPatternPage: ShiftsPerShiftPatternPage;
  readonly shiftPatternDurationPage: ShiftPatternDurationPage;
  readonly employmentEndDate: DateQuestionPage;
  readonly leaveYearStartDate: DateQuestionPage;
  readonly daysWorkedPerWeek: NumericQuestionPage;
  readonly hoursWorkedPerWeek: NumericQuestionPage;
  readonly hoursInPayPeriod: NumericQuestionPage;
  readonly compressedHours: CompressedHoursPage;
  readonly result: ResultPage;
  readonly search: SearchPage;
  readonly navigation: NavigationPage;
  readonly footer: FooterPage;
  readonly cookies: CookiesPage;

  constructor(page: Page) {
    this.landing = new LandingPage(page, frameworkConfig.urls.holidayCalculator);
    this.localAccessibility = new LocalAccessibilityPage(page);
    this.workerType = new WorkerTypePage(page);
    this.regularHours = new RegularHoursPage(page);
    this.leaveYearPeriod = new LeaveYearPeriodPage(page);
    this.daysWorkedPerWeekQuestionPage = new DaysWorkedPerWeekQuestionPage(page);
    this.numericQuestion = new NumericQuestionPage(page);
    this.workerTypeLeaveYearStartPage = new WorkerTypeLeaveYearStartPage(page);
    this.leaveYearStartDatePage = new LeaveYearStartDatePage(page);
    this.employment_Start_Date = new EmploymentStartDatePage(page);
    this.noOfDaysWorkedPerWeekPage = new NumberOfDaysWorkedPerWeekPage(page);
    this.hoursInEachShiftPage = new HowManyHoursInEachShiftPage(page);
    this.shiftsPerShiftPatternPage = new ShiftsPerShiftPatternPage(page);
    this.shiftPatternDurationPage = new ShiftPatternDurationPage(page);
    this.dateQuestion = new DateQuestionPage(page);
    this.irregularHours = this.dateQuestion;
    this.employmentStartDate = this.dateQuestion;
    this.employmentEndDate = this.dateQuestion;
    this.leaveYearStartDate = this.dateQuestion;
    this.daysWorkedPerWeek = this.numericQuestion;
    this.hoursWorkedPerWeek = this.numericQuestion;
    this.hoursInPayPeriod = this.numericQuestion;
    this.compressedHours = new CompressedHoursPage(page);
    this.result = new ResultPage(page);
    this.search = new SearchPage(page);
    this.navigation = new NavigationPage(page);
    this.footer = new FooterPage(page);
    this.cookies = new CookiesPage(page);
  }

  get main(): Locator {
    return this.numericQuestion.main;
  }

  get mainInput(): Locator {
    return this.numericQuestion.mainInput;
  }

  calculatorPage(name: string) {
    switch (CALCULATOR_PAGE_ROUTES[calculatorPageRoute(name)]) {
      case 'workerType':
        return this.workerType;
      case 'regularHours':
        return this.regularHours;
      case 'leaveYearPeriod':
        return this.leaveYearPeriod;
      case 'dateQuestion':
        return this.dateQuestion;
      case 'result':
        return this.result;
      case 'compressedHours':
        return this.compressedHours;
      case 'numericQuestion':
        return this.numericQuestion;
    }
  }
}
