<script>
(function () {

  /* -----------------------------
     Smooth scroll for internal links
  ----------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, "", id);
    });
  });

  /* -----------------------------
     Footer year
  ----------------------------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* -----------------------------
     Demo form – fake submission (front-end only)
  ----------------------------- */
  const form = document.getElementById('demoForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const lang = document.documentElement.getAttribute('lang') || 'en';
      const btn = form.querySelector('button[type="submit"]');
      const old = btn ? btn.textContent : '';

      if (btn) {
        btn.textContent = (lang === 'pl') ? 'Wysłano ✓' : 'Sent ✓';
        btn.disabled = true;
      }

      setTimeout(() => {
        if (btn) {
          btn.textContent = old;
          btn.disabled = false;
        }
        alert(
          (lang === 'pl')
            ? 'Zgłoszenie demo zapisane (tylko front-end). Podłącz formularz do backendu, aby odbierać zgłoszenia.'
            : 'Demo request captured (front-end only). Connect this form to your backend to receive submissions.'
        );
        form.reset();
      }, 700);
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
      const user = ['h','e','l','l','o'].join('');
      const domain = ['d','e','c','i','s','i','o','n','a','r','y','.','a','p','p'].join('');
      const addr = user + '@' + domain;

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
</script>
