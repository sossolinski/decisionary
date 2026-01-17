(() => {
  'use strict';

  /* =========================================================
     Helpers
  ========================================================= */

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const getLang = () => document.documentElement.getAttribute('lang') || 'en';

  const getTopOffset = () => {
    const topbar = $('.topbar');
    if (!topbar) return 0;
    return Math.ceil(topbar.getBoundingClientRect().height) + 8;
  };

  const getDecisionaryEmail = () => {
    // Keep the address slightly harder to scrape by bots.
    const user = ['h','e','l','l','o'].join('');
    const domain = ['d','e','c','i','s','i','o','n','a','r','y','.','a','p','p'].join('');
    return `${user}@${domain}`;
  };

  const scrollToHash = (hash, smooth = true) => {
    if (!hash || hash === '#') return;

    let target = null;
    try {
      target = document.querySelector(hash);
    } catch (_) {
      return; // invalid selector
    }
    if (!target) return;

    const y = target.getBoundingClientRect().top + window.pageYOffset - getTopOffset();
    window.scrollTo({ top: Math.max(0, y), behavior: smooth ? 'smooth' : 'auto' });
  };

  const replaceHash = (hash) => {
    try {
      history.replaceState(null, '', hash);
    } catch (_) {
      // no-op
    }
  };

  /* =========================================================
     1) Smooth scroll for in-page anchors (with sticky offset)
  ========================================================= */

  const bindSmoothAnchors = () => {
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const hash = a.getAttribute('href');
        if (!hash || hash === '#') return;

        let target = null;
        try {
          target = document.querySelector(hash);
        } catch (_) {
          return;
        }
        if (!target) return;

        e.preventDefault();
        scrollToHash(hash, true);
        replaceHash(hash);
      });
    });

    // If entering the page with a hash in URL
    window.addEventListener('load', () => {
      const hash = window.location.hash || '';
      if (!hash) return;
      window.setTimeout(() => scrollToHash(hash, false), 0);
    });
  };

  /* =========================================================
     2) Floating "back to top" button
  ========================================================= */

  const initToTop = () => {
    const toTop = $('#toTop');
    if (!toTop) return;

    const toggle = () => {
      if (window.scrollY > 400) toTop.classList.add('show');
      else toTop.classList.remove('show');
    };

    window.addEventListener('scroll', toggle, { passive: true });
    toggle();

    toTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      replaceHash('#top');
    });
  };

  /* =========================================================
     3) Footer year
  ========================================================= */

  const setFooterYear = () => {
    const year = $('#year');
    if (year) year.textContent = String(new Date().getFullYear());
  };

  /* =========================================================
     4) Contact form (mailto: no backend)
  ========================================================= */

  const initDemoForm = () => {
    const form = $('#demoForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Let the browser show built-in validation UI.
      if (typeof form.reportValidity === 'function' && !form.reportValidity()) return;

      const lang = getLang();
      const btn = form.querySelector('button[type="submit"]');
      const oldText = btn ? btn.textContent : '';

      const name = ($('#name')?.value || '').trim();
      const email = ($('#email')?.value || '').trim();
      const org = ($('#org')?.value || '').trim();
      const notes = ($('#notes')?.value || '').trim();

      const to = getDecisionaryEmail();
      const subject = (lang === 'pl')
        ? `Prośba o demo Decisionary${org ? ' — ' + org : ''}`
        : `Decisionary demo request${org ? ' — ' + org : ''}`;

      const bodyLines = [
        (lang === 'pl') ? 'Dzień dobry,' : 'Hello,',
        '',
        (lang === 'pl')
          ? 'Chciał(a)bym poprosić o demo. Szczegóły:'
          : 'I would like to request a demo. Details:',
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

      const mailto =
        `mailto:${encodeURIComponent(to)}` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(bodyLines.join('\n'))}`;

      if (btn) {
        btn.textContent = (lang === 'pl') ? 'Otwieram pocztę…' : 'Opening mail…';
        btn.disabled = true;
      }

      window.location.href = mailto;

      // UX: restore quickly and reset.
      window.setTimeout(() => {
        if (btn) {
          btn.textContent = oldText;
          btn.disabled = false;
        }
        form.reset();
      }, 600);
    });
  };

  /* =========================================================
     5) Prefill example
  ========================================================= */

  const initPrefill = () => {
    const prefill = $('#prefill');
    if (!prefill) return;

    prefill.addEventListener('click', () => {
      const lang = getLang();

      const name = $('#name');
      const email = $('#email');
      const org = $('#org');
      const notes = $('#notes');

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
  };

  /* =========================================================
     6) Email reveal (bot-resistant)
  ========================================================= */

  const initEmailReveal = () => {
    const emailBtn = $('#emailBtn');
    const emailSlot = $('#emailSlot');
    if (!emailBtn || !emailSlot) return;

    emailBtn.addEventListener('click', () => {
      const addr = getDecisionaryEmail();

      // Use DOM to avoid innerHTML injection footguns.
      const a = document.createElement('a');
      a.href = `mailto:${addr}`;
      a.textContent = addr;
      a.style.fontFamily = 'var(--mono)';
      a.style.textDecoration = 'underline';

      emailSlot.innerHTML = '';
      emailSlot.appendChild(a);

      emailBtn.remove();
    });
  };

  /* =========================================================
     7) Language switch – keep hash
  ========================================================= */

  const initLangSwitch = () => {
    $$('a[data-lang-switch="true"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href') || '';
        const hash = window.location.hash || '';
        if (hash && !href.includes('#')) {
          e.preventDefault();
          window.location.href = href + hash;
        }
      });
    });
  };

  /* =========================================================
     8) Hero mock inject ticker (rotating sample logs)
  ========================================================= */

  const initMockTicker = () => {
    const logs = $$('.mock .log');
    if (logs.length === 0) return;

    const reduceMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) return;

    const pool = [
      '[14:12] Inject #6 delivered • [14:14] Decision logged: escalate to Crisis Team • Owner: Ops Lead',
      '[14:19] Action assigned: draft stakeholder update • Due: 15:00 • Status: Open',
      '[14:23] Inject: regulator inquiry received • Decision: activate Legal + Comms workstream • Owner: Duty Manager',
      '[14:27] Inject: crew availability drops • Decision: re-plan rotations + prioritize critical flights • Owner: Crew Control',
      '[14:31] Inject: passenger escalation on social • Action: publish holding statement • Owner: Comms Lead',
      '[14:36] Inject: vendor outage confirmed • Decision: switch to contingency provider • Owner: IT Incident Lead',
      '[14:41] Inject: airport constraints announced • Decision: initiate disruption playbook • Owner: OCC Manager',
      '[14:46] Decision: stand-up cadence every 20 min • Action: assign note-taker and tracker • Owner: Crisis Lead',
      '[14:52] Inject: media request received • Decision: single spokesperson + briefing pack • Owner: PR Duty Officer',
      '[15:00] Action update: stakeholder note sent • Status: Done • Evidence: email ref #A-129'
    ];

    let i = 0;

    const setLog = (el, text) => {
      el.textContent = text;
      el.scrollLeft = 0;

      // subtle swap motion
      el.style.transition = 'none';
      el.style.opacity = '0';
      el.style.transform = 'translateY(4px)';

      requestAnimationFrame(() => {
        el.style.transition = 'opacity 220ms ease, transform 220ms ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0px)';
      });
    };

    // Initialize (keep current text if present, but ensure two different lines)
    logs.forEach((el) => {
      setLog(el, pool[i % pool.length]);
      i += 1;
    });

    const tick = () => {
      // rotate one log at a time (subtle, less distracting)
      const el = logs[i % logs.length];
      setLog(el, pool[i % pool.length]);
      i += 1;

      const delay = 2000 + Math.floor(Math.random() * 1000); // 2–3s
      window.setTimeout(tick, delay);
    };

    window.setTimeout(tick, 2400);
  };

  /* =========================================================
     Boot
  ========================================================= */

  bindSmoothAnchors();
  initToTop();
  setFooterYear();
  initDemoForm();
  initPrefill();
  initEmailReveal();
  initLangSwitch();
  initMockTicker();

})();
