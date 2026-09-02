document.documentElement.classList.add('js');

const menuButton = document.querySelector('[data-menu-button]');
const navigation = document.querySelector('[data-nav]');

if (menuButton && navigation) {
  const menuLabel = menuButton.querySelector('.sr-only');

  const closeMenu = ({ returnFocus = false } = {}) => {
    navigation.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    if (menuLabel) menuLabel.textContent = 'Open navigation';
    if (returnFocus) menuButton.focus();
  };

  menuButton.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    if (menuLabel) menuLabel.textContent = isOpen ? 'Close navigation' : 'Open navigation';
  });

  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => closeMenu());
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
      closeMenu({ returnFocus: true });
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && navigation.classList.contains('is-open')) closeMenu();
  });
}

document.querySelectorAll('[data-year]').forEach((node) => {
  node.textContent = new Date().getFullYear();
});

const reviewCarousel = document.querySelector('[data-review-carousel]');

if (reviewCarousel) {
  const cards = Array.from(reviewCarousel.querySelectorAll('[data-review-card]'));
  const dotsContainer = reviewCarousel.querySelector('[data-review-dots]');
  const previousButton = reviewCarousel.querySelector('[data-review-prev]');
  const nextButton = reviewCarousel.querySelector('[data-review-next]');
  const toggleButton = reviewCarousel.querySelector('[data-review-toggle]');
  const status = reviewCarousel.querySelector('[data-review-status]');
  const reduceCarouselMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activeReview = 0;
  let reviewTimer;
  let userPaused = false;

  const dots = cards.map((card, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'review-dot';
    dot.setAttribute('aria-label', `Show review ${index + 1} of ${cards.length}`);
    dot.addEventListener('click', () => showReview(index, true));
    dotsContainer.appendChild(dot);
    return dot;
  });

  const stopReviewTimer = () => window.clearInterval(reviewTimer);
  const startReviewTimer = () => {
    stopReviewTimer();
    if (reduceCarouselMotion || userPaused || document.hidden) return;
    reviewTimer = window.setInterval(() => showReview(activeReview + 1), 7000);
  };

  const updateToggleButton = () => {
    toggleButton.textContent = userPaused ? 'Play' : 'Pause';
    toggleButton.setAttribute('aria-label', userPaused ? 'Resume automatic review slideshow' : 'Pause automatic review slideshow');
    toggleButton.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
  };

  function showReview(index, announce = false) {
    activeReview = (index + cards.length) % cards.length;
    cards.forEach((card, cardIndex) => {
      const isActive = cardIndex === activeReview;
      card.hidden = !isActive;
      card.classList.toggle('is-active', isActive);
    });
    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeReview;
      dot.classList.toggle('is-active', isActive);
      if (isActive) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    if (announce && status) status.textContent = `Showing review ${activeReview + 1} of ${cards.length}`;
    startReviewTimer();
  }

  previousButton.addEventListener('click', () => showReview(activeReview - 1, true));
  nextButton.addEventListener('click', () => showReview(activeReview + 1, true));
  toggleButton.addEventListener('click', () => {
    userPaused = !userPaused;
    updateToggleButton();
    if (userPaused) stopReviewTimer();
    else startReviewTimer();
    if (status) status.textContent = userPaused ? 'Automatic slideshow paused' : 'Automatic slideshow resumed';
  });
  reviewCarousel.addEventListener('mouseenter', stopReviewTimer);
  reviewCarousel.addEventListener('mouseleave', startReviewTimer);
  reviewCarousel.addEventListener('focusin', stopReviewTimer);
  reviewCarousel.addEventListener('focusout', (event) => {
    if (!reviewCarousel.contains(event.relatedTarget)) startReviewTimer();
  });
  reviewCarousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') showReview(activeReview - 1, true);
    if (event.key === 'ArrowRight') showReview(activeReview + 1, true);
  });
  document.addEventListener('visibilitychange', startReviewTimer);
  if (reduceCarouselMotion) toggleButton.hidden = true;
  updateToggleButton();
  showReview(0);
}

const taxCatchUpPageUrl = 'prior-year-tax-returns-muskegon.html#tax-catch-up-review';

const behindFilingHero = Array.from(document.querySelectorAll('.hero-actions a')).find((link) =>
  link.textContent.toLowerCase().includes('behind on filing')
);

if (behindFilingHero) {
  behindFilingHero.href = taxCatchUpPageUrl;
  behindFilingHero.removeAttribute('target');
  behindFilingHero.removeAttribute('rel');
  const label = behindFilingHero.querySelector('span');
  if (label) label.textContent = 'Behind on taxes? Start with a $125 review';
}

const priorYearHelpCard = document.querySelector('.help-card[href="prior-year-tax-returns-muskegon.html"]');

if (priorYearHelpCard) {
  priorYearHelpCard.href = taxCatchUpPageUrl;
  const heading = priorYearHelpCard.querySelector('h3');
  const description = priorYearHelpCard.querySelector('p');
  const action = priorYearHelpCard.querySelector('strong');
  if (heading) heading.textContent = 'Behind on taxes or missing prior years?';
  if (description) description.textContent = 'Start with a $125 Tax Catch-Up & IRS Transcript Review when you are unsure which years need attention or what records are missing.';
  if (action) action.innerHTML = 'See the $125 Tax Catch-Up Review <span aria-hidden="true">→</span>';
}

const revealItems = document.querySelectorAll('[data-reveal]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .1 });

  revealItems.forEach((item) => revealObserver.observe(item));
}

const formEvents = new Map([
  ['https://form.jotform.com/262371277777065', { eventName: 'lead_form_open', service: 'general' }],
  ['https://docs.google.com/forms/d/e/1FAIpQLSfYd_1Wv93x-GkjjlusejejgsEwlhEE7CnsRGPZOQ0FPNVF-w/viewform', { eventName: 'lead_form_open', service: 'prior_year_tax' }]
]);

const inferGeneralLeadService = (linkText) => {
  const normalizedText = linkText.toLowerCase();
  if (normalizedText.includes('tax return')) return 'tax_preparation';
  if (normalizedText.includes('business')) return 'business_services';
  return 'general';
};

const sendAnalyticsEvent = (eventName, parameters) => {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, {
    ...parameters,
    page_path: window.location.pathname,
    transport_type: 'beacon'
  });
};

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link) return;

  if (link.pathname.endsWith('/prior-year-tax-returns-muskegon.html') && link.hash === '#tax-catch-up-review') {
    sendAnalyticsEvent('tax_catch_up_offer_open', {
      service: 'tax_catch_up_review',
      link_placement: link.closest('.hero-actions') ? 'homepage_hero' : 'homepage_service_card'
    });
    return;
  }

  const formEvent = formEvents.get(link.href);
  if (formEvent) {
    sendAnalyticsEvent(formEvent.eventName, {
      service: formEvent.service === 'general'
        ? inferGeneralLeadService(link.textContent.trim())
        : formEvent.service
    });
    return;
  }

  if (link.dataset.checkupPlacement) {
    sendAnalyticsEvent('business_checkup_open', {
      link_placement: link.dataset.checkupPlacement
    });
    return;
  }

  if (link.dataset.reviewPlatform) {
    sendAnalyticsEvent('review_link_open', {
      review_platform: link.dataset.reviewPlatform,
      link_placement: 'homepage_review_carousel'
    });
    return;
  }

  if (link.href.startsWith('sms:')) {
    sendAnalyticsEvent('contact_click', { contact_method: 'text' });
  } else if (link.href.startsWith('mailto:')) {
    sendAnalyticsEvent('contact_click', { contact_method: 'email' });
  }
});
