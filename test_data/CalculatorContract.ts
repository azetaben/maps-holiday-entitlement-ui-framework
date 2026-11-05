export const WORKER_TYPE_QUESTION =
  'Does the employee work irregular hours or for part of the year?';
export const WORKER_TYPE_HINT =
  '‘Irregular hours’ means the number of hours an employee works in a pay period often or always changes. ‘Part of the year’ means there are periods of at least a week in a leave year where the employee does not need to work and is not paid.';
export const CALCULATION_BASIS_QUESTION = 'Is the holiday entitlement based on:';
export const CALCULATION_BASIS_HINT = 'Check the employment contract if you’re not sure about the holiday entitlement.';
export const CALCULATOR_NAME = 'Calculate holiday entitlement';
export const CONTINUE_LABEL = 'Continue';
export const START_NOW_LABEL = 'Start now';
export const WORKING_DAYS_QUESTION = 'Number of days worked per week?';
export const STATUTORY_LEAVE_TOPIC = 'Statutory leave and time off';
export const STATUTORY_MAXIMUM_DAYS = 28;

export const CALCULATION_BASIS_OPTIONS = [
  { label: 'days worked per week', value: 'days-worked-per-week' },
  { label: 'hours worked per week', value: 'hours-worked-per-week' },
  { label: 'annualised hours', value: 'annualised-hours' },
  { label: 'compressed hours', value: 'compressed-hours' },
  { label: 'shifts', value: 'shift-worker' },
] as const;

export const LEAVE_YEAR_PERIOD_OPTIONS = [
  {
    key: 'full-year',
    label: 'for a full leave year',
    aliases: ['full year'],
    pattern: /\bfull\b.*\bleave year\b/i,
  },
  {
    key: 'starting',
    label: 'for someone starting part way through a leave year',
    aliases: [],
    pattern: /\b(?:start|starts|started|starting)\b(?!.*\band\b)/i,
  },
  {
    key: 'leaving',
    label: 'for someone leaving part way through a leave year',
    aliases: [],
    pattern: /\b(?:leaving|leaves|left|ending|ends|finishing|finishes)\b/i,
  },
  {
    key: 'starting-and-leaving',
    label: 'for someone starting and leaving part way through a leave year',
    aliases: ['starting and leaving'],
    pattern:
      /\b(?:start|starts|started|starting)\b.*\b(?:leaving|leaves|left|ending|ends|finishing|finishes)\b/i,
  },
] as const;

export const WORKER_TYPE_ANSWERS = {
  irregular: { label: 'Yes', value: 'irregular-hours-and-part-year' },
  regular: { label: 'No', value: 'regular' },
} as const;

export const REGULAR_WORK_DAYS_BASIS = CALCULATION_BASIS_OPTIONS[0].label;
export const HOURS_WORKED_PER_WEEK_BASIS = CALCULATION_BASIS_OPTIONS[1].label;
export const FULL_LEAVE_YEAR_PERIOD = LEAVE_YEAR_PERIOD_OPTIONS[0].key;
