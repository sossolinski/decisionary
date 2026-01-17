(function () {

  /* -----------------------------
     Smooth scroll for internal links (with sticky header offset)
  ----------------------------- */
  function getTopbarOffset() {
    const topbar = document.querySelector('.topbar');
    const h = topbar ? topbar.getBoundingClientRect().height : 0;
    // small breathing room so headings aren't glued to the bar
    return Math.ceil(h + 10);
  }

  function scrollToTarget(target) {
    const offset = getTopbarOffset();
    const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      scrollToTarget(target);
      history.replaceState(null, "", id);
    });
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

      window.location.href = mailto;

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

  /* -----------------------------
     Back to top floating button
  ----------------------------- */
  const toTop = document.getElementById('toTop');
  const topTarget = document.getElementById('top');

  if (toTop) {
    const toggle = () => {
      const show = window.scrollY > 500;
      toTop.classList.toggle('show', show);
    };

    toggle();
    window.addEventListener('scroll', toggle, { passive: true });

    toTop.addEventListener('click', () => {
      if (topTarget) {
        scrollToTarget(topTarget);
        history.replaceState(null, "", "#top");
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  /* -----------------------------
     Logo debug helper (non-invasive)
     If logo fails to load, show fallback mark instead of broken image.
  ----------------------------- */
  document.querySelectorAll('img.logo-img').forEach(img => {
    img.addEventListener('error', () => {
      img.style.display = 'none';
      const fallback = document.createElement('span');
      fallback.className = 'logo-fallback';
      fallback.setAttribute('aria-hidden', 'true');
      img.insertAdjacentElement('afterend', fallback);
      // Optional console hint (helps with GitHub Pages case-sensitivity issues)
      // console.warn('Logo failed to load. Check path/case: ../assets/logo.svg');
    }, { once: true });
  });

})();
