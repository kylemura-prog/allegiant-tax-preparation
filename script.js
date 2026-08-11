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
    if (window.innerWidth > 860 && navigation.classList.contains('is-open')) closeMenu();
  });
}

document.querySelectorAll('[data-year]').forEach((node) => {
  node.textContent = new Date().getFullYear();
});

const formEvents = new Map([
  ['https://forms.gle/u7D3JK3aamz8LCbf8', { eventName: 'lead_form_open', service: 'general' }],
  ['https://docs.google.com/forms/d/e/1FAIpQLSfYd_1Wv93x-GkjjlusejejgsEwlhEE7CnsRGPZOQ0FPNVF-w/viewform', { eventName: 'lead_form_open', service: 'prior_year_tax' }],
  ['https://forms.gle/w6NeCckfgEDAptki9', { eventName: 'lead_form_open', service: 'bookkeeping' }],
  ['https://forms.gle/YDACshzbsKbde3J47', { eventName: 'lead_form_open', service: 'payroll' }],
  ['https://forms.gle/cwPe6g3mcN5rVSDF8', { eventName: 'client_form_open', formType: 'personal_tax_intake' }],
  ['https://forms.gle/xSDQTqv4LT4xgAWk7', { eventName: 'client_form_open', formType: 'schedule_c_intake' }],
  ['https://forms.gle/bJiJ38Xi8cFRBUGb6', { eventName: 'client_form_open', formType: 'tax_review_planning' }],
  ['https://forms.gle/G9QCGAvLgbfKgd4TA', { eventName: 'document_upload_open', formType: 'tax_document_upload' }],
  ['https://docs.google.com/forms/d/e/1FAIpQLSf72701A8VHLU7sye4L3Vs9DtW-XPbHDOElVik2f8_tYkLpIQ/viewform', { eventName: 'client_form_open', formType: 'returning_client_update' }]
]);

const inferGeneralLeadService = (linkText) => {
  const text = linkText.toLowerCase();
  if (text.includes('notice')) return 'notice_review';
  if (text.includes('prior-year') || text.includes('unfiled')) return 'prior_year_tax';
  if (text.includes('tax review')) return 'tax_review';
  if (text.includes('tax preparation')) return 'tax_preparation';
  if (text.includes('business')) return 'business_services';
  if (text.includes('phone call')) return 'phone_call';
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

  const href = link.href;
  const formEvent = formEvents.get(href);

  if (link.dataset.checkupPlacement) {
    sendAnalyticsEvent('business_checkup_open', {
      link_placement: link.dataset.checkupPlacement
    });
    return;
  }

  if (link.dataset.resource) {
    sendAnalyticsEvent('resource_open', {
      resource_name: link.dataset.resource
    });
    return;
  }

  if (formEvent) {
    const parameters = {};

    if (formEvent.service) {
      parameters.service = formEvent.service === 'general'
        ? inferGeneralLeadService(link.textContent.trim())
        : formEvent.service;
    }

    if (formEvent.formType) parameters.form_type = formEvent.formType;
    sendAnalyticsEvent(formEvent.eventName, parameters);
    return;
  }

  if (href === 'https://g.page/r/CUECHvjMX15FEBM/review') {
    sendAnalyticsEvent('review_link_open', {
      review_platform: 'google',
      link_placement: link.dataset.reviewPlacement || 'unknown'
    });
    return;
  }

  if (href.startsWith('sms:')) {
    sendAnalyticsEvent('contact_click', { contact_method: 'text' });
  } else if (href.startsWith('mailto:')) {
    sendAnalyticsEvent('contact_click', { contact_method: 'email' });
  } else if (href.startsWith('tel:')) {
    sendAnalyticsEvent('contact_click', { contact_method: 'phone' });
  }
});
