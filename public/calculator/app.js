(() => {
    // Keep demo calculation assumptions named and local to this fixture. They
    // intentionally remain independent from the TypeScript entitlement oracle.
    const statutoryWeeks = 5.6;
    const statutoryMaximumDays = 28;
    const irregularHoursAccrualRate = 0.127;
    const workingDaysPerWeekMaximum = 5;
    const main = document.querySelector('main');
    const cookies = document.querySelector('#global-cookie-message');
    const answers = [];
    let step = 'landing';
    let error = '';
    let resultText = '';
    let resultDetails = '';

    document.querySelector('#reject-cookies').addEventListener('click', () => {
        cookies.hidden = true;
    });

    function escape(value) {
        return String(value).replace(/[&<>"']/g, (character) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
        })[character]);
    }

    function summary() {
        if (!answers.length) return '';
        return `<section aria-labelledby="answers-heading"><h2 id="answers-heading">Your answers</h2>
      <p><a href="#" id="start-again">Start again</a></p>
      <dl class="govuk-summary-list">${answers.map(({question, answer}) =>
            `<div class="govuk-summary-list__row"><dt class="govuk-summary-list__key">${escape(question)}</dt><dd>${escape(answer)}</dd><dd><a href="#">Change</a></dd></div>`
        ).join('')}</dl></section>`;
    }

    const questions = {
        worker: {
            title: 'Does the employee work irregular hours or for part of the year?',
            choices: ['Yes', 'No'],
        },
        basis: {
            title: 'Is the holiday entitlement based on:',
            choices: ['days worked per week', 'hours worked per week', 'annualised hours', 'compressed hours', 'shifts'],
        },
        period: {
            title: 'Do you want to calculate the holiday:',
            choices: ['for a full leave year', 'for someone starting part way through a leave year', 'for someone leaving part way through a leave year', 'for someone starting and leaving part way through a leave year'],
        },
    };

    function renderQuestion(key, extra = '') {
        const question = questions[key];
        const fieldset = question ? `<fieldset><legend><h1>${escape(question.title)}</h1></legend>
      ${question.choices.map((choice, index) => `<div class="option"><input id="answer-${index}" type="radio" name="response" value="${escape(choice)}"><label for="answer-${index}">${escape(choice)}</label></div>`).join('')}</fieldset>` : extra;
        main.innerHTML = `<span class="caption">Calculate holiday entitlement</span>
      <form id="question-form"><div id="current-question" class="${error ? 'error' : ''}">
      ${error ? `<div class="govuk-error-summary" role="alert" aria-labelledby="error-summary-title">
        <h2 id="error-summary-title">There is a problem</h2><ul><li><a href="#current-question">${escape(error)}</a></li></ul>
      </div>` : ''}${fieldset}
      </div><button type="submit">Continue</button></form>${summary()}`;
        main.querySelector('#question-form').addEventListener('submit', submitAnswer);
        main.querySelector('#start-again')?.addEventListener('click', (event) => {
            event.preventDefault();
            answers.length = 0;
            error = '';
            step = 'landing';
            render();
        });
    }

    function renderNumeric(title) {
        renderQuestion('', `<h1 id="numeric-answer-label">${escape(title)}</h1>
      <label for="numeric-answer">${escape(title)}</label>
      <input id="numeric-answer" name="response" type="number" inputmode="decimal" aria-labelledby="numeric-answer-label">`);
    }

    function renderDate() {
        renderQuestion('', `<fieldset><legend><h1>When does the leave year start?</h1></legend>
      <p class="hint">This is usually in the employment contract.</p>
      <label for="day">Day</label><input id="day" name="day" type="text" inputmode="numeric">
      <label for="month">Month</label><input id="month" name="month" type="text" inputmode="numeric">
      <label for="year">Year</label><input id="year" name="year" type="text" inputmode="numeric"></fieldset>`);
    }

    function render() {
        if (step === 'landing') {
            main.innerHTML = `<span class="caption">Statutory leave and time off</span><h1>Calculate holiday entitlement</h1>
        <p>Use this tool to calculate holiday entitlement for a full leave year.</p>
        <button id="start-now" class="button" type="button">Start now</button>`;
            main.querySelector('#start-now').addEventListener('click', () => {
                step = 'worker';
                render();
            });
        } else if (step === 'worker') renderQuestion('worker');
        else if (step === 'basis') renderQuestion('basis');
        else if (step === 'period') renderQuestion('period');
        else if (step === 'leave-date') renderDate();
        else if (step === 'days') renderNumeric('How many days does the employee work per week?');
        else if (step === 'pay-period') renderNumeric('How many hours has the employee worked in the pay period?');
        else if (step === 'shift-hours') renderNumeric('How many hours in each shift?');
        else if (step === 'shift-count') renderNumeric('How many shifts will be worked per shift pattern?');
        else if (step === 'shift-days') renderNumeric('How many days in each shift pattern?');
        else if (step === 'result') renderResult();
    }

    function submitAnswer(event) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        if (step === 'leave-date') {
            const values = ['day', 'month', 'year'].map((name) => formData.get(name));
            if (values.some((part) => !part)) {
                error = 'Enter a complete leave year start date.';
                render();
                return;
            }
            answers.push({
                question: 'When does the leave year start?',
                answer: `${values[0]} ${values[1]} ${values[2]}`
            });
            step = 'pay-period';
            render();
            return;
        }
        const value = formData.get('response');
        if (!value) {
            error = 'Answer this question to continue.';
            render();
            return;
        }
        error = '';
        if (step === 'worker') {
            answers.push({question: questions.worker.title, answer: value});
            step = value === 'Yes' ? 'leave-date' : 'basis';
        } else if (step === 'basis') {
            answers.push({question: questions.basis.title, answer: value});
            step = 'period';
        } else if (step === 'period') {
            answers.push({question: questions.period.title, answer: value});
            step = value === 'for a full leave year' ? (answers[1].answer === 'shifts' ? 'shift-hours' : 'days') : 'days';
        } else if (step === 'days') {
            answers.push({question: 'How many days does the employee work per week?', answer: value});
            resultText = `${Math.min(Number(value) * statutoryWeeks, statutoryMaximumDays).toFixed(1).replace(/\.0$/, '')} days`;
            resultDetails = '';
            step = 'result';
        } else if (step === 'pay-period') {
            answers.push({question: 'How many hours has the employee worked in the pay period?', answer: value});
            resultText = `${Math.ceil(Number(value) * irregularHoursAccrualRate)} hours`;
            resultDetails = '';
            step = 'result';
        } else if (step === 'shift-hours') {
            answers.push({question: 'How many hours in each shift?', answer: value});
            step = 'shift-count';
        } else if (step === 'shift-count') {
            answers.push({question: 'How many shifts will be worked per shift pattern?', answer: value});
            step = 'shift-days';
        } else if (step === 'shift-days') {
            answers.push({question: 'How many days in each shift pattern?', answer: value});
            const shifts = Number(answers.find((answer) => answer.question === 'How many shifts will be worked per shift pattern?').answer);
            const patternDays = Number(value);
            const hoursPerShift = Number(answers.find((answer) => answer.question === 'How many hours in each shift?').answer);
            const shiftsPerWeek = shifts / patternDays * 7;
            const entitlement = Math.min(shiftsPerWeek * statutoryWeeks, statutoryMaximumDays);
            resultText = `${entitlement.toFixed(1).replace(/\.0$/, '')} shifts`;
            resultDetails = `Each shift is ${hoursPerShift.toFixed(1)} hours. ${shiftsPerWeek > workingDaysPerWeekMaximum ? `More than ${workingDaysPerWeekMaximum} shifts a week are worked, so the maximum statutory holiday entitlement is ${statutoryMaximumDays} shifts.` : ''}
        The employer can include public and bank holidays as part of the statutory entitlement, can provide more paid holiday through contractual leave entitlement, and must provide holiday pay during statutory leave.`;
            step = 'result';
        }
        render();
    }

    function renderResult() {
        main.innerHTML = `<span class="caption">Calculate holiday entitlement</span><h1>Calculate holiday entitlement</h1>
      <section aria-labelledby="entitlement-heading"><h2 id="entitlement-heading">Your statutory holiday entitlement</h2>
      <p>The statutory entitlement for this leave year is ${escape(resultText)}${resultText.endsWith('shifts') ? '.' : '.'}</p>
      ${resultDetails ? `<p>${escape(resultDetails)}</p>` : ''}</section>${summary()}`;
        main.querySelector('#start-again')?.addEventListener('click', (event) => {
            event.preventDefault();
            answers.length = 0;
            resultText = '';
            step = 'landing';
            render();
        });
    }

    render();
})();
