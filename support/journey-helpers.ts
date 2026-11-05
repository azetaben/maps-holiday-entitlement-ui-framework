import {TestWorld} from './world';
import {calculatorSamples} from '../test_data/CalculatorSamples';
import {calculatorUrl} from './calculator-routes';
import {
    FULL_LEAVE_YEAR_PERIOD,
    LEAVE_YEAR_PERIOD_OPTIONS,
    REGULAR_WORK_DAYS_BASIS,
    WORKER_TYPE_ANSWERS,
} from '../test_data/CalculatorContract';

export async function openWorkerQuestion(world: TestWorld): Promise<void> {
  if (await world.pages.workerType.questionHeading.isVisible().catch(() => false)) return;
  if (await world.pages.landing.startNow.isVisible().catch(() => false)) {
    await world.pages.landing.start();
    await world.pages.workerType.questionHeading.waitFor({ state: 'visible' });
    return;
  }

  // A previous step or scenario may have left the shared page on a later
  // calculator route. Reset to the configured service entry point first.
  await world.pages.landing.open(calculatorUrl());
  if (await world.pages.cookies.rejectButton.isVisible().catch(() => false)) {
    await world.pages.cookies.rejectAdditionalCookies();
  }
  await world.pages.landing.start();
  await world.pages.workerType.questionHeading.waitFor({ state: 'visible' });
}

export async function openRegularDaysQuestion(world: TestWorld): Promise<void> {
  await openWorkerQuestion(world);
  await world.pages.workerType.choose(WORKER_TYPE_ANSWERS.regular.label);
  await world.pages.workerType.continue();
  await world.pages.regularHours.chooseBasis(REGULAR_WORK_DAYS_BASIS);
  await world.pages.regularHours.continue();
  await world.pages.leaveYearPeriod.choosePeriod(FULL_LEAVE_YEAR_PERIOD);
  await world.pages.leaveYearPeriod.continue();
}

export async function openIrregularHoursQuestion(
  world: TestWorld,
  year: string = calculatorSamples.irregularLeaveYearStart.year,
  month: string = calculatorSamples.irregularLeaveYearStart.month,
  day: string = calculatorSamples.irregularLeaveYearStart.day,
): Promise<void> {
  await openWorkerQuestion(world);
  await world.pages.workerType.choose(WORKER_TYPE_ANSWERS.irregular.label);
  await world.pages.workerType.continue();
  await world.pages.dateQuestion.fillDate(day, month, year);
  await world.pages.dateQuestion.continue();
}

export async function completePartialYear(world: TestWorld): Promise<void> {
  const data = world.testData;
  if (!data || data.route === 'journey-url') {
    throw new Error('An independent partial-year fixture must be loaded first.');
  }
  await openWorkerQuestion(world);
  await world.pages.workerType.choose(WORKER_TYPE_ANSWERS.regular.label);
  await world.pages.workerType.continue();
  await world.pages.regularHours.chooseBasis(REGULAR_WORK_DAYS_BASIS);
  await world.pages.regularHours.continue();
  const period =
    data.route === 'starting'
      ? LEAVE_YEAR_PERIOD_OPTIONS[1].key
      : data.route === 'leaving'
        ? LEAVE_YEAR_PERIOD_OPTIONS[2].key
        : LEAVE_YEAR_PERIOD_OPTIONS[3].key;
  await world.pages.leaveYearPeriod.choosePeriod(period);
  await world.pages.leaveYearPeriod.continue();

  const fillAndContinue = async (isoDate: string): Promise<void> => {
    const [year, month, day] = isoDate.split('-');
    await world.pages.dateQuestion.fillDate(day, month, year);
    await world.pages.dateQuestion.continue();
  };
  switch (data.route) {
    case 'starting':
      await fillAndContinue(data.start);
      await fillAndContinue(data.leaveYear);
      break;
    case 'leaving':
      await fillAndContinue(data.end);
      await fillAndContinue(data.leaveYear);
      break;
    case 'starting-and-leaving':
      await fillAndContinue(data.start);
      await fillAndContinue(data.end);
      break;
  }
  await world.pages.numericQuestion.fill(calculatorSamples.regularWorkDaysPerWeek);
  await world.pages.numericQuestion.continue();
}
