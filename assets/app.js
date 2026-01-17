(function () {

  /* -----------------------------
     Smooth scroll for internal links (with sticky header offset)
  ----------------------------- */
  function getHeaderOffset() {
    const bar = document.querySelector('.topbar');
    if (!bar) return 0;
    // +8px "oddechu" żeby nagłówki nie kleiły się do belki
    return (bar.getBoundingClientRect().height || 0) + 8;
  }

  function scrollToTarget(target, behavior) {
    if (!target) return;

    const offset = getHeaderOffset();
    const rect = target.getBoundingClientRect();
    const y = rect.top + window.pageYOffset - offset;

    window.scrollTo({
      top: Math.max(0, Math.round(y)),
      behavior: behavior || 'smooth'
    });
  }

  function handleHash(hash, behavior) {
    if (!hash) return;

    // Normalizujemy hash
    const id = hash.startsWith('#') ? hash : ('#' + hash);

    // Specjalnie obsłuż top
    if (id === '#top') {
      window.scrollTo({ top: 0, behavior: behavior || 'smooth' });
      return;
    }

    const target = document.querySelector(id);
    if (!target) return;
    scrollToTarget(target, behavior);
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target && href !== '#top') return;

      e.preventDefault();
      handleHash(href, 'smooth');

      // Aktualizujemy URL bez skakania
      history.replaceState(null, "", href);
    });
  });

  // Jeśli strona odpala się z hashem — przewiń z offsetem (bez animacji)
  window.addEventListener('load', () => {
    if (window.location.hash) {
      // małe opóźnienie, żeby sticky header miał już finalną wysokość
      window.setTimeout(() => handleHash(window.location.hash, 'auto'), 0);
    }
  });

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

      const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;

      if (btn) {
        btn.textContent = (lang === 'pl') ? 'Otwieram pocztę…' : 'Opening mail…';
        btn.disabled = true;
      }

      // Trigger the email client.
      window.location.href = mailto;

      // UX: restore button quickly and optionally reset the form.
      window.setTimeout(() => {
        if (btn) {
          btn.textContent = old;
          btn.disabled = false;
        }
        form.reset();
      }, 600);
    });
  }

  /* -----------------------------
     Prefill example
  ----------------------------- */
  const prefill = document.getElementById('prefill');
  if (prefill) {
    prefill.addEventListener('click', () => {
      const lang = document.documentElement.getAttribute('lang') || 'en';

      const name = document.getElementById('name');
      const email = document.getElementById('email');
      const org = document.getElementById('org');
      const notes = document.getElementById('notes');

      if (name) name.value = 'Sebastian O.';
      if (email) email.value = 'name@company.com';

      if (lang === 'pl') {
        if (org) org.value = 'Zespół pilotażowy Decisionary';
        if (notes) notes.value =
          'Prowadzimy ćwiczenia tabletop ERP w formule hybrydowej. ' +
          'Chcemy ustrukturyzowanej osi injectów, rejestru decyzji i szybkiego AAR. ' +
          'Dodaj segment komunikacji kryzysowej oraz śledzenie działań usprawniających.';
      } else {
        if (org) org.value = 'Decisionary Pilot Team';
        if (notes) notes.value =
          'We run ERP tabletop exercises with hybrid participants. ' +
          'We want structured inject timelines, decision logging, and a fast AAR output. ' +
          'Include a crisis communications segment and action tracking.';
      }
    });
  }

  /* -----------------------------
     Email reveal (bot-resistant)
  ----------------------------- */
  const emailBtn = document.getElementById('emailBtn');
  const emailSlot = document.getElementById('emailSlot');

  if (emailBtn && emailSlot) {
    emailBtn.addEventListener('click', () => {
      const addr = getDecisionaryEmail();

      emailSlot.innerHTML =
        '<a href="mailto:' + addr + '" ' +
        'style="font-family:var(--mono); text-decoration:underline">' +
        addr +
        '</a>';

      emailBtn.remove();
    });
  }

  /* -----------------------------
     Language switch – keep hash
  ----------------------------- */
  document.querySelectorAll('a[data-lang-switch="true"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href') || '';
      const hash = window.location.hash || '';
      if (hash && !href.includes('#')) {
        e.preventDefault();
        window.location.href = href + hash;
      }
    });
  });

})();
