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
  ['https://form.jotform.com/262375132305046', { eventName: 'lead_form_open', service: 'general' }],
  ['https://docs.google.com/forms/d/e/1FAIpQLSfYd_1Wv93x-GkjjlusejejgsEwlhEE7CnsRGPZOQ0FPNVF-w/viewform', { eventName: 'lead_form_open', service: 'prior_year_tax' }],
  ['https://forms.gle/w6NeCckfgEDAptki9', { eventName: 'lead_form_open', service: 'bookkeeping' }],
  ['https://forms.gle/YDACshzbsKbde3J47', { eventName: 'lead_form_open', service: 'payroll' }],
  ['https://forms.gle/cwPe6g3mcN5rVSDF8', { eventName: 'client_form_open', formType: 'personal_tax_intake' }],
  ['https://forms.gle/xSDQTqv4LT4xgAWk7', { eventName: 'client_form_open', formType: 'schedule_c_intake' }],
  ['https://forms.gle/bJiJ38Xi8cFRBUGb6', { eventName: 'client_form_open', formType: 'tax_review_planning' }],
  ['https://form.jotform.com/262352465883061', { eventName: 'document_upload_open', formType: 'tax_document_upload' }],
  ['https://form.jotform.com/262371528064053', { eventName: 'lead_form_open', service: 'michigan_llc_setup' }],
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

const taxSupportSection = document.querySelector('.service-page-tax section[aria-labelledby="tax-support-title"]');

if (taxSupportSection && !document.getElementById('michigan-city-tax')) {
  const cityTaxSection = document.createElement('section');
  cityTaxSection.id = 'michigan-city-tax';
  cityTaxSection.className = 'section section-light';
  cityTaxSection.setAttribute('aria-labelledby', 'michigan-city-tax-title');
  cityTaxSection.innerHTML = `
    <div class="wrap">
      <div class="section-heading">
        <div>
          <p class="eyebrow dark"><span></span> Michigan city tax filing</p>
          <h2 id="michigan-city-tax-title">City income tax can depend on where you live, where you work, and what was withheld.</h2>
        </div>
        <p>Allegiant prepares applicable Michigan city income tax returns, including Muskegon-area filings, as part of a coordinated federal, state, and local filing process.</p>
      </div>

      <div class="bookkeeping-support-grid">
        <article class="bookkeeping-support-card">
          <span class="bookkeeping-card-number" aria-hidden="true">01</span>
          <h3>Residency &amp; work location</h3>
          <p>Review the facts that can affect a city filing, including where you lived during the year and where wages were actually earned.</p>
          <ul>
            <li>Resident and nonresident situations</li>
            <li>Partial-year city residency</li>
            <li>Work performed inside or outside the city</li>
          </ul>
        </article>

        <article class="bookkeeping-support-card bookkeeping-support-card-featured">
          <span class="bookkeeping-card-number" aria-hidden="true">02</span>
          <h3>Local withholding &amp; wage details</h3>
          <p>Compare W-2 local information, city withholding, employers, and work locations so the return reflects the records provided.</p>
          <ul>
            <li>City tax withheld on W-2s</li>
            <li>Multiple employers or work locations</li>
            <li>Local wage and withholding discrepancies</li>
          </ul>
        </article>

        <article class="bookkeeping-support-card">
          <span class="bookkeeping-card-number" aria-hidden="true">03</span>
          <h3>Prior years &amp; city notices</h3>
          <p>Need to catch up on a city return or respond to a notice? Allegiant can review the filing history, available records, and next steps.</p>
          <ul>
            <li>Unfiled prior-year city returns</li>
            <li>City tax notices and document requests</li>
            <li>Return review when something does not match</li>
          </ul>
        </article>
      </div>

      <div class="prior-year-actions">
        <a class="button button-primary" href="https://form.jotform.com/262375132305046" target="_blank" rel="noopener">Request tax preparation <span aria-hidden="true">→</span></a>
        <a class="button button-ghost" href="tax-notice-help-michigan.html">Need help with a city tax notice?</a>
      </div>
      <p class="bookkeeping-pricing-note">Michigan city income tax rules and filing requirements vary by municipality. The applicable city return and documentation needs are confirmed from the specific facts of the taxpayer's situation.</p>
    </div>
  `;

  taxSupportSection.insertAdjacentElement('afterend', cityTaxSection);
}
