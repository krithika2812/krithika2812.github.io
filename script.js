(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Year
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Tabs
  const tabs = $$('.tabs [role="tab"]');
  const panels = $$('.tab-panels .panel');

  function setActive(tabEl) {
    tabs.forEach(t => {
      const isActive = t === tabEl;
      t.setAttribute('aria-selected', String(isActive));
    });

    panels.forEach(p => {
      const shouldShow = p.id === tabEl.getAttribute('aria-controls');
      if (shouldShow) {
        p.hidden = false;
        p.classList.add('active');
      } else {
        p.hidden = true;
        p.classList.remove('active');
      }
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => setActive(tab));
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setActive(tab);
      }
    });
  });

  // Pricing calculator
  const leadForm = $('#leadForm');
  const occasionEl = $('#occasion');
  const budgetEl = $('#budget');
  const phoneEl = $('#phone');

  const estPlate = $('#estPlate');
  const estTaxes = $('#estTaxes');

  // Simple premium estimator (placeholder)
  function estimate(budget) {
    const plate = Number(budget);
    if (!Number.isFinite(plate) || plate <= 0) return null;

    // Taxes estimate: 12% (placeholder)
    const taxes = Math.round(plate * 0.12);
    return {
      starting: plate,
      taxes
    };
  }

  function updateEstimate() {
    const budget = budgetEl?.value;
    if (!budget) {
      if (estPlate) estPlate.textContent = '—';
      if (estTaxes) estTaxes.textContent = 'Will be shared';
      return;
    }

    const result = estimate(budget);
    if (!result) {
      if (estPlate) estPlate.textContent = '—';
      if (estTaxes) estTaxes.textContent = 'Will be shared';
      return;
    }

    if (estPlate) estPlate.textContent = `₹${result.starting}+`;
    if (estTaxes) estTaxes.textContent = `Est. ₹${result.taxes} taxes (approx.)`;
  }

  [budgetEl, occasionEl].forEach(el => {
    if (!el) return;
    el.addEventListener('change', updateEstimate);
  });

  updateEstimate();

  // WhatsApp integration hook (front-end)
  const whatsappBtn = $('#whatsappBtn');
  const callbackBtn = $('#callbackBtn');

  function normalizePhoneIN(phone) {
    const digits = String(phone || '').replace(/\D/g, '');
    return digits.length >= 10 ? digits.slice(-10) : digits;
  }

  function buildWhatsAppMessage() {
    const occasion = occasionEl?.value || '';
    const budget = budgetEl?.value || '';
    const phone = normalizePhoneIN(phoneEl?.value);

    const lines = [
      'Hi Airway Restaurant (Saibala Grand Hotel)!',
      '',
      `Occasion: ${occasion || '—'}`,
      `Budget per plate (Veg): ₹${budget || '—'}+`,
      phone ? `Contact: +91${phone}` : 'Contact: —',
      '',
      'Please share availability, menu plan options, and pricing for my event.'
    ];

    return lines.join('\n');
  }

  function openWhatsApp(message) {
    // TODO: Replace with actual business WhatsApp number (without +91)
    const BUSINESS_WA_NUMBER = '9000000000';

    const url = `https://wa.me/91${BUSINESS_WA_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function validateFormOrReport() {
    if (!leadForm) return false;
    const valid = leadForm.checkValidity();
    if (!valid) leadForm.reportValidity();
    return valid;
  }

  leadForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateFormOrReport()) return;
    openWhatsApp(buildWhatsAppMessage());
  });

  whatsappBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (!validateFormOrReport()) return;
    openWhatsApp(buildWhatsAppMessage());
  });

  callbackBtn?.addEventListener('click', () => {
    if (!validateFormOrReport()) return;

    const occasion = occasionEl?.value || '';
    const phone = normalizePhoneIN(phoneEl?.value);

    const msg = [
      'Hi Airway Restaurant (Saibala Grand Hotel)!',
      '',
      'Please arrange a callback regarding availability and pricing.',
      `Occasion: ${occasion}`,
      phone ? `Contact: +91${phone}` : '',
      '',
      'Thank you!'
    ].filter(Boolean).join('\n');

    openWhatsApp(msg);
  });

  // Lazy-load images (data-src => src) for gallery
  const lazyImgs = $$('.lazy[data-src]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        const src = img.getAttribute('data-src');
        if (src) img.src = src;
        img.removeAttribute('data-src');
        img.classList.remove('lazy');
        io.unobserve(img);
      });
    }, { rootMargin: '200px 0px' });

    lazyImgs.forEach(img => io.observe(img));
  }
})();

