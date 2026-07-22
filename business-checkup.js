const app = document.querySelector('[data-checkup-app]');

if (app) {
  const form = app.querySelector('[data-checkup-form]');
  const steps = [...app.querySelectorAll('[data-step]')];
  const nextButton = app.querySelector('[data-next]');
  const backButton = app.querySelector('[data-back]');
  const errorMessage = app.querySelector('[data-checkup-error]');
  const result = app.querySelector('[data-checkup-result]');
  const resetButton = app.querySelector('[data-reset]');
  const stepLabel = app.querySelector('[data-step-label]');
  const progressPercent = app.querySelector('[data-progress-percent]');
  const progressBar = app.querySelector('[data-progress-bar]');
  let currentStep = 0;
  let hasStarted = false;

  const generalRequestBase = 'https://docs.google.com/forms/d/e/1FAIpQLSewIbBRO6ZkvdvmQdmTelNsJvf3pLzSsKWxiN7TqC46WU62Lw/viewform';
  const bookkeepingForm = 'https://forms.gle/w6NeCckfgEDAptki9';
  const payrollForm = 'https://forms.gle/YDACshzbsKbde3J47';

  const sendCheckupEvent = (eventName, parameters = {}) => {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, {
      ...parameters,
      page_path: window.location.pathname,
      transport_type: 'beacon'
    });
  };

  const buildQuickRequestUrl = (recommendation, services) => {
    const parameters = new URLSearchParams();
    parameters.set('usp', 'pp_url');
    services.forEach((service) => parameters.append('entry.337635764', service));
    parameters.set(
      'entry.195147065',
      `I completed the Small Business Books & Payroll Checkup. My recommended next step was: ${recommendation}. I would like a quick follow-up.`
    );
    parameters.set('entry.425461784', 'Not applicable');
    return `${generalRequestBase}?${parameters.toString()}`;
  };

  const getSelectedAnswer = () => {
    const activeStep = steps[currentStep];
    return activeStep.querySelector('input[type="radio"]:checked');
  };

  const updateProgress = () => {
    const visibleStep = currentStep + 1;
    const percent = Math.round((visibleStep / steps.length) * 100);
    stepLabel.textContent = `Question ${visibleStep} of ${steps.length}`;
    progressPercent.textContent = `${percent}%`;
    progressBar.style.width = `${percent}%`;
    backButton.hidden = currentStep === 0;
    nextButton.innerHTML = currentStep === steps.length - 1
      ? 'See my recommendation <span aria-hidden="true">→</span>'
      : 'Next question <span aria-hidden="true">→</span>';
  };

  const showStep = (stepIndex) => {
    steps.forEach((step, index) => {
      const isActive = index === stepIndex;
      step.hidden = !isActive;
      step.classList.toggle('is-active', isActive);
    });
    errorMessage.hidden = true;
    updateProgress();
    const activeStep = steps[stepIndex];
    activeStep.tabIndex = -1;
    activeStep.focus({ preventScroll: true });
    app.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const answerLabels = {
    current: 'Your books appear to be current through the latest month.',
    behind_1_3: 'Your books are only a few months behind, so the catch-up period may still be manageable.',
    behind_4_6: 'Several months need to be brought current and reconciled.',
    behind_7_plus: 'A longer catch-up period or a fresh bookkeeping setup is likely needed.',
    software: 'You already have an accounting platform that can support a repeatable process.',
    spreadsheet: 'Your spreadsheet provides a starting point, but reconciliation and consistent categorization still matter.',
    statements_receipts: 'Statements and receipts preserve source information, but they still need to be organized into complete books.',
    inconsistent: 'Scattered or inconsistent records increase the risk of missing transactions and last-minute tax work.',
    none: 'You do not currently have employee payroll adding to the workload.',
    one_to_five: 'Your current team creates recurring payroll records and filing deadlines.',
    six_plus: 'A larger employee group makes a dependable payroll process especially important.',
    hiring_soon: 'Setting up payroll before the first or next hire can prevent avoidable delays.',
    not_applicable: 'Payroll is not currently part of your business process.',
    provider: 'An established payroll system is already in place.',
    manual: 'Manual payroll steps can create extra work and increase deadline risk.',
    need_setup: 'You need a payroll process that is ready before the next pay cycle or hire.',
    unsure: 'A payroll review can clarify what is working and what needs attention.'
  };

  const createRecommendation = (answers) => {
    const bookScore = {
      current: 0,
      behind_1_3: 1,
      behind_4_6: 3,
      behind_7_plus: 4
    }[answers.books_status] + {
      software: 0,
      spreadsheet: 1,
      statements_receipts: 2,
      inconsistent: 3
    }[answers.tracking_method];

    const payrollScore = {
      none: 0,
      one_to_five: 1,
      six_plus: 2,
      hiring_soon: 2
    }[answers.employee_status] + {
      not_applicable: 0,
      provider: 0,
      manual: 3,
      need_setup: 4,
      unsure: 3
    }[answers.payroll_status];

    const needsBoth = answers.priority === 'both' || (bookScore >= 3 && payrollScore >= 3);
    let type;

    if (needsBoth) {
      type = 'combined';
    } else if (answers.priority === 'payroll' || payrollScore >= 4) {
      type = 'payroll';
    } else if (answers.priority === 'cleanup' || bookScore >= 4) {
      type = 'cleanup';
    } else if (answers.priority === 'monthly' || (bookScore <= 2 && answers.priority !== 'tax_ready')) {
      type = 'monthly';
    } else {
      type = 'tax_ready';
    }

    const commonReasons = [
      answerLabels[answers.books_status],
      answerLabels[answers.tracking_method]
    ];

    const recommendations = {
      combined: {
        title: 'A combined bookkeeping and payroll review',
        summary: 'Your answers show that the books and payroll process affect one another. Reviewing them together is the most efficient way to establish a reliable starting point.',
        reasons: [commonReasons[0], answerLabels[answers.payroll_status], 'Coordinating both systems can reduce duplicate work and make tax-time records more complete.'],
        actionTitle: 'Start with a short, no-obligation request.',
        actionCopy: 'The quick form will be prefilled to show that you completed the checkup and need help with both services.',
        services: ['Bookkeeping interest', 'Payroll interest'],
        primaryService: 'bookkeeping_payroll',
        detailButtons: [
          { label: 'Detailed bookkeeping form', href: bookkeepingForm, service: 'bookkeeping' },
          { label: 'Detailed payroll form', href: payrollForm, service: 'payroll' }
        ]
      },
      payroll: {
        title: 'A payroll setup or process review',
        summary: 'Payroll is the most time-sensitive part of your current process. A focused review can identify the right setup, support, and next deadline before small issues become larger ones.',
        reasons: [answerLabels[answers.employee_status], answerLabels[answers.payroll_status], 'A defined payroll workflow can make employee records, wage reporting, and recurring filings easier to manage.'],
        actionTitle: 'Ask for a quick payroll follow-up.',
        actionCopy: 'Use the short prefilled request or provide more detail through the payroll interest form.',
        services: ['Payroll interest'],
        primaryService: 'payroll',
        detailButtons: [
          { label: 'Open detailed payroll form', href: payrollForm, service: 'payroll' }
        ]
      },
      cleanup: {
        title: 'Catch-up and cleanup bookkeeping',
        summary: 'The best first step is establishing complete, reconciled books for the period that is behind. Once the starting point is reliable, an ongoing process becomes much easier to maintain.',
        reasons: [commonReasons[0], commonReasons[1], 'A defined cleanup period helps separate the immediate project from any future monthly support.'],
        actionTitle: 'Request a quick cleanup follow-up.',
        actionCopy: 'Use the short prefilled request or complete the detailed bookkeeping form if you already know the condition of your records.',
        services: ['Bookkeeping interest'],
        primaryService: 'bookkeeping_cleanup',
        detailButtons: [
          { label: 'Open detailed bookkeeping form', href: bookkeepingForm, service: 'bookkeeping' }
        ]
      },
      monthly: {
        title: 'Ongoing monthly bookkeeping support',
        summary: 'Your records appear close enough to current that a consistent monthly process may provide more value than waiting for a large cleanup project to develop.',
        reasons: [commonReasons[0], commonReasons[1], 'Monthly reconciliation and review can reduce year-end surprises and keep tax information easier to prepare.'],
        actionTitle: 'Explore a monthly bookkeeping fit.',
        actionCopy: 'Use the short prefilled request or share more detail through the bookkeeping interest form.',
        services: ['Bookkeeping interest'],
        primaryService: 'bookkeeping_monthly',
        detailButtons: [
          { label: 'Open detailed bookkeeping form', href: bookkeepingForm, service: 'bookkeeping' }
        ]
      },
      tax_ready: {
        title: 'A focused tax-readiness review',
        summary: 'Your core process may not need a full cleanup or payroll change. A focused review can help identify missing records, year-end tasks, and the information that should be ready for tax preparation.',
        reasons: [commonReasons[0], commonReasons[1], answerLabels[answers.payroll_status]],
        actionTitle: 'Ask Kyle to review the next step.',
        actionCopy: 'The short request will be prefilled so you can explain what you want checked without completing a full onboarding form.',
        services: ['Bookkeeping interest'],
        primaryService: 'tax_readiness',
        detailButtons: []
      }
    };

    return recommendations[type];
  };

  const renderResult = () => {
    const answers = Object.fromEntries(new FormData(form).entries());
    const recommendation = createRecommendation(answers);

    app.querySelector('[data-result-title]').textContent = recommendation.title;
    app.querySelector('[data-result-summary]').textContent = recommendation.summary;
    app.querySelector('[data-result-action-title]').textContent = recommendation.actionTitle;
    app.querySelector('[data-result-action-copy]').textContent = recommendation.actionCopy;

    const reasonsList = app.querySelector('[data-result-reasons]');
    reasonsList.replaceChildren(...recommendation.reasons.map((reason) => {
      const item = document.createElement('li');
      item.textContent = reason;
      return item;
    }));

    const buttons = app.querySelector('[data-result-buttons]');
    const quickRequest = document.createElement('a');
    quickRequest.className = 'button button-primary';
    quickRequest.href = buildQuickRequestUrl(recommendation.title, recommendation.services);
    quickRequest.target = '_blank';
    quickRequest.rel = 'noopener';
    quickRequest.dataset.checkupService = recommendation.primaryService;
    quickRequest.textContent = 'Request a quick follow-up';

    const detailLinks = recommendation.detailButtons.map((buttonData) => {
      const link = document.createElement('a');
      link.className = 'button button-result-secondary';
      link.href = buttonData.href;
      link.target = '_blank';
      link.rel = 'noopener';
      link.dataset.checkupService = buttonData.service;
      link.textContent = buttonData.label;
      return link;
    });

    buttons.replaceChildren(quickRequest, ...detailLinks);
    form.hidden = true;
    app.querySelector('.checkup-progress').hidden = true;
    result.hidden = false;
    result.focus({ preventScroll: true });
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    sendCheckupEvent('business_checkup_complete');
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!getSelectedAnswer()) {
      errorMessage.hidden = false;
      return;
    }

    if (!hasStarted) {
      hasStarted = true;
      sendCheckupEvent('business_checkup_start');
    }

    if (currentStep === steps.length - 1) {
      renderResult();
      return;
    }

    currentStep += 1;
    showStep(currentStep);
  });

  backButton.addEventListener('click', () => {
    if (currentStep === 0) return;
    currentStep -= 1;
    showStep(currentStep);
  });

  form.addEventListener('change', () => {
    errorMessage.hidden = true;
  });

  result.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-checkup-service]');
    if (!link) return;
    sendCheckupEvent('business_checkup_cta_open', {
      service: link.dataset.checkupService
    });
  });

  resetButton.addEventListener('click', () => {
    form.reset();
    currentStep = 0;
    hasStarted = false;
    result.hidden = true;
    form.hidden = false;
    app.querySelector('.checkup-progress').hidden = false;
    showStep(0);
    app.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  updateProgress();
}
