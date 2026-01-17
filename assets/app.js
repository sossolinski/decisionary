(function () {

  /* -----------------------------
     Smooth scroll for internal links (with sticky header offset)
  ----------------------------- */
  function getTopOffset() {
    const topbar = document.querySelector('.topbar');
    if (!topbar) return 0;
    // mały bufor, żeby nagłówki nie „przyklejały się” pod topbar
    return Math.ceil(topbar.getBoundingClientRect().height) + 8;
  }

  function scrollToHash(hash, smooth) {
    if (!hash || hash === '#') return;

    const target = document.querySelector(hash);
    if (!target) return;

    const offset = getTopOffset();
    const y = target.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({
      top: Math.max(0, y),
      behavior: smooth ? 'smooth' : 'auto'
    });
  }

  // Kliknięcia w linki #...
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      scrollToHash(id, true);
      history.replaceState(null, "", id);
    });
  });

  // Jeśli ktoś wchodzi na URL z hashem (np. /en/#pricing)
  window.addEventListener('load', () => {
    const hash = window.location.hash || '';
    if (!hash) return;
    // po load, żeby layout (sticky) się ustabilizował
    window.setTimeout(() => scrollToHash(hash, false), 0);
  });

  /* -----------------------------
     Floating "back to top" button
  ----------------------------- */
  const toTop = document.getElementById('toTop');
  if (toTop) {
    function toggleToTop() {
      if (window.scrollY > 400) toTop.classList.add('show');
      else toTop.classList.remove('show');
    }

    window.addEventListener('scroll', toggleToTop, { passive: true });
    toggleToTop();

    toTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.replaceState(null, "", '#top');
    });
  }

  /* -----------------------------
     Footer year
  ----------------------------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* -----------------------------
     Helpers
  ----------------------------- */
  function getDecisionaryEmail() {
    // Keep the address slightly harder to scrape by bots.
    const user = ['h','e','l','l','o'].join('');
    const domain = ['d','e','c','i','s','i','o','n','a','r','y','.','a','p','p'].join('');
    return user + '@' + domain;
  }

  /* -----------------------------
     Contact form – send via mailto: (no backend required)

     IMPORTANT:
     A static site cannot send emails directly from the browser without a
     backend/service (e.g. Formspree/EmailJS/serverless function). This
     implementation opens the user's default mail client with a prefilled
     message.
  ----------------------------- */
  const form = document.getElementById('demoForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Let the browser show built-in validation UI.
      if (typeof form.reportValidity === 'function' && !form.reportValidity()) {
        return;
      }

      const lang = document.documentElement.getAttribute('lang') || 'en';
      const btn = form.querySelector('button[type="submit"]');
      const old = btn ? btn.textContent : '';

      const name = (document.getElementById('name')?.value || '').trim();
      const email = (document.getElementById('email')?.value || '').trim();
      const org = (document.getElementById('org')?.value || '').trim();
      const notes = (document.getElementById('notes')?.value || '').trim();

      const to = getDecisionaryEmail();
      const subject = (lang === 'pl')
        ? `Prośba o demo Decisionary${org ? ' — ' + org : ''}`
        : `Decisionary demo request${org ? ' — ' + org : ''}`;

      const bodyLines = [
        (lang === 'pl') ? 'Dzień dobry,' : 'Hello,' ,
        '',
        (lang === 'pl') ? 'Chciał(a)bym poprosić o demo. Szczegóły:' : 'I would like to request a demo. Details:',
        '',
        `Name: ${name || '-'}`,
        `Work email: ${email || '-'}`,
        `Organization: ${org || '-'}`,
        '',
        (lang === 'pl') ? 'Opis / kontekst:' : 'Notes / context:',
        notes || '-',
        '',
        (lang === 'pl') ? 'Pozdrawiam,' : 'Best regards,',
        name || ''
      ];

      const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent
