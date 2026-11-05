export const calculatorSamples = {
    regularWorkDaysPerWeek: '5',
    irregularHoursInPayPeriod: '30',
    irregularLeaveYearStart: {
        day: '1',
        month: '4',
        year: '2026',
    },
    incompleteDate: {
        day: '15',
        month: '6',
        year: '2026',
    },
    correctedStarterLeaveYear: {
        day: '31',
        month: '12',
        year: '2025',
    },
    numericFormats: {
        'leading whitespace': ' 5',
        'trailing whitespace': '5 ',
        'leading zero': '05',
        'comma decimal separator': '2,5',
    } as Record<string, string>,
    localAccessibilityContact: {
        name: 'Alex Example',
        email: 'alex@example.test',
        message: 'Accessibility feedback',
    },
} as const;
