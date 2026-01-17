/* Decisionary Skeleton (localStorage)
   Routes:
   - #/            Exercises list
   - #/room?id=... Exercise room
*/
(function () {
  const APP = document.getElementById('app');
  const exportBtn = document.getElementById('exportBtn');
  const resetBtn = document.getElementById('resetBtn');

  const LS_KEY = 'decisionary_skeleton_v1';
  const nowISO = () => new Date().toISOString();

  function uid(prefix='id') {
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
  }

  function loadState() {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch { /* ignore */ }
    }
    return seedState();
  }

  function saveState(state) {
    localStorage.setItem(LS_KEY, JSON.stringify(state, null, 2));
  }

  function seedState() {
    const exId = uid('ex');
    return {
      version: 1,
      exercises: [{
        id: exId,
        title: 'Operational disruption (demo)',
        description: 'Escalating injects with decision capture. Local-only demo data.',
        createdAt: nowISO(),
        status: 'draft',
        injects: [
          { id: uid('inj'), title: 'Inject 1: Initial disruption', body: 'A key system outage impacts operations. What is your first coordination step?', deliveredAt: null },
          { id: uid('inj'), title: 'Inject 2: Stakeholder pressure', body: 'A regulator requests an update within 30 minutes.', deliveredAt: null },
          { id: uid('inj'), title: 'Inject 3: Escalation trigger', body: 'Disruption expands to multiple workstreams. Escalate to Crisis Team?', deliveredAt: null }
        ],
        decisions: [],
        actions: []
      }],
      lastOpenedExerciseId: exId
    };
  }

  let STATE = loadState();

  function parseRoute() {
    const hash = window.location.hash || '#/';
    const [pathPart, queryPart] = hash.replace(/^#/, '').split('?');
    const path = pathPart || '/';
    const query = new URLSearchParams(queryPart || '');
    return { path, query };
  }

  function setActiveNav(path) {
    document.querySelectorAll('.navlink').forEach(a => {
      const r = a.getAttribute('data-route');
      if (r === path) a.classList.add('active');
      else a.classList.remove('active');
    });
  }

  function render() {
    const { path, query } = parseRoute();
    if (path.startsWith('/room')) {
      setActiveNav('/room');
      const id = query.get('id') || STATE.lastOpenedExerciseId;
      renderRoom(id);
      return;
    }
    setActiveNav('/');
    renderExercises();
  }

  /* -----------------------------
     Exercises list
  ----------------------------- */
  function renderExercises() {
    const items = STATE.exercises.slice().sort((a,b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    APP.innerHTML = `
      <div class="card">
        <div class="kicker"><span class="dot" aria-hidden="true"></span> Local skeleton • no backend • stores in your browser</div>
        <h1>Exercises</h1>
        <p>Create an exercise, open the room, deliver injects, and capture decisions.</p>
      </div>

      <div class="grid two" style="margin-top:14px">
        <div class="card">
          <h2>Create new exercise</h2>
          <div class="row">
            <div class="field">
              <label for="exTitle">Title</label>
              <input id="exTitle" placeholder="e.g., Flight disruption tabletop" />
            </div>
            <div class="field">
              <label for="exStatus">Status</label>
              <select id="exStatus">
                <option value="draft">draft</option>
                <option value="live">live</option>
                <option value="closed">closed</option>
              </select>
            </div>
          </div>
          <div class="field" style="margin-top:10px">
            <label for="exDesc">Description</label>
            <textarea id="exDesc" placeholder="What are you simulating? Objectives? Audience?"></textarea>
          </div>
          <div class="row" style="margin-top:12px">
            <button class="btn primary" type="button" id="createExerciseBtn">Create exercise</button>
            <span class="muted">Tip: start with 3–6 injects and 4–8 decisions.</span>
          </div>
        </div>

        <div class="card">
          <h2>Existing</h2>
          ${items.length ? `
            <table class="table" aria-label="Exercise list">
              <tbody>
                ${items.map(ex => `
                  <tr class="tr">
                    <td style="width:180px">
                      <div class="pill">${escapeHtml(ex.status || 'draft')}</div>
                      <div class="muted" style="margin-top:8px">${formatDate(ex.createdAt)}</div>
                    </td>
                    <td>
                      <div style="font-weight:750">${escapeHtml(ex.title)}</div>
                      <div class="muted">${escapeHtml(ex.description || '')}</div>
                      <div class="row" style="margin-top:10px">
                        <button class="btn small" type="button" data-open="${ex.id}">Open room</button>
                        <button class="btn small" type="button" data-delete="${ex.id}">Delete</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : `<p class="muted">No exercises yet. Create one on the left.</p>`}
        </div>
      </div>
    `;

    const createBtn = document.getElementById('createExerciseBtn');
    createBtn.addEventListener('click', () => {
      const title = (document.getElementById('exTitle').value || '').trim();
      const description = (document.getElementById('exDesc').value || '').trim();
      const status = document.getElementById('exStatus').value || 'draft';
      if (!title) {
        alert('Please provide a title.');
        return;
      }
      const ex = {
        id: uid('ex'),
        title,
        description,
        createdAt: nowISO(),
        status,
        injects: [],
        decisions: [],
        actions: []
      };
      STATE.exercises.push(ex);
      STATE.lastOpenedExerciseId = ex.id;
      saveState(STATE);
      window.location.hash = `#/room?id=${encodeURIComponent(ex.id)}`;
    });

    APP.querySelectorAll('[data-open]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-open');
        STATE.lastOpenedExerciseId = id;
        saveState(STATE);
        window.location.hash = `#/room?id=${encodeURIComponent(id)}`;
      });
    });

    APP.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete');
        const ex = STATE.exercises.find(e => e.id === id);
        if (!ex) return;
        if (!confirm(`Delete "${ex.title}"?`)) return;
        STATE.exercises = STATE.exercises.filter(e => e.id !== id);
        if (STATE.lastOpenedExerciseId === id) {
          STATE.lastOpenedExerciseId = STATE.exercises[0]?.id || null;
        }
        saveState(STATE);
        render();
      });
    });
  }

  /* -----------------------------
     Exercise Room
  ----------------------------- */
  function renderRoom(exerciseId) {
    const ex = STATE.exercises.find(e => e.id === exerciseId);
    if (!ex) {
      APP.innerHTML = `
        <div class="card">
          <h1>Room</h1>
          <p>Exercise not found. Go back to the exercise list.</p>
          <div class="row" style="margin-top:12px">
            <a class="btn primary" href="#/">Back</a>
          </div>
        </div>
      `;
      return;
    }

    const delivered = ex.injects.filter(i => i.deliveredAt);
    const pending = ex.injects.filter(i => !i.deliveredAt);

    APP.innerHTML = `
      <div class="card">
        <div class="kicker"><span class="dot" aria-hidden="true"></span> Exercise Room • facilitator-style workflow</div>
        <h1>${escapeHtml(ex.title)}</h1>
        <p>${escapeHtml(ex.description || '')}</p>
        <div class="row" style="margin-top:10px">
          <span class="pill">status: ${escapeHtml(ex.status || 'draft')}</span>
          <span class="pill">injects: ${ex.injects.length}</span>
          <span class="pill">decisions: ${ex.decisions.length}</span>
          <a class="btn small" href="#/">Back to list</a>
        </div>
      </div>

      <div class="grid two" style="margin-top:14px">
        <div class="card">
          <h2>Injects</h2>

          <div class="row">
            <div class="field">
              <label for="injTitle">Inject title</label>
              <input id="injTitle" placeholder="e.g., Media inquiry / Ops escalation" />
            </div>
          </div>
          <div class="field" style="margin-top:10px">
            <label for="injBody">Inject content</label>
            <textarea id="injBody" placeholder="What happens? What do participants need to decide or do?"></textarea>
          </div>

          <div class="row" style="margin-top:12px">
            <button class="btn primary" type="button" id="addInjectBtn">Add inject</button>
            <button class="btn small" type="button" id="deliverNextBtn"${pending.length ? '' : ' disabled'}>Deliver next</button>
            <button class="btn small" type="button" id="resetInjectsBtn"${ex.injects.length ? '' : ' disabled'}>Reset deliveries</button>
          </div>

          <hr />

          <div class="muted" style="margin-bottom:10px">Pending</div>
          ${pending.length ? pending.map(i => injectCard(i, 'pending')).join('') : `<div class="muted">No pending injects.</div>`}

          <div class="muted" style="margin:14px 0 10px">Delivered</div>
          ${delivered.length ? delivered.sort((a,b)=> (a.deliveredAt||'').localeCompare(b.deliveredAt||'')).map(i => injectCard(i, 'delivered')).join('') : `<div class="muted">No delivered injects yet.</div>`}
        </div>

        <div class="card">
          <h2>Decision log</h2>

          <div class="row">
            <div class="field">
              <label for="decOwner">Owner</label>
              <input id="decOwner" placeholder="e.g., Ops Lead / Duty Manager" />
            </div>
            <div class="field">
              <label for="decStatus">Status</label>
              <select id="decStatus">
                <option value="open">open</option>
                <option value="in_progress">in progress</option>
                <option value="done">done</option>
              </select>
            </div>
          </div>

          <div class="field" style="margin-top:10px">
            <label for="decText">Decision</label>
            <textarea id="decText" placeholder="What was decided?"></textarea>
          </div>

          <div class="field" style="margin-top:10px">
            <label for="decRationale">Rationale</label>
            <textarea id="decRationale" placeholder="Why? What information supported it?"></textarea>
          </div>

          <div class="row" style="margin-top:12px">
            <button class="btn primary" type="button" id="addDecisionBtn">Add decision</button>
            <button class="btn small" type="button" id="clearDecisionsBtn"${ex.decisions.length ? '' : ' disabled'}>Clear log</button>
          </div>

          <hr />

          <div class="muted" style="margin-bottom:10px">Timeline</div>
          <div id="decList">
            ${ex.decisions.length ? ex.decisions
              .slice()
              .sort((a,b)=> (a.at||'').localeCompare(b.at||''))
              .map(d => decisionLine(d)).join('') : `<div class="muted">No decisions yet.</div>`}
          </div>
        </div>
      </div>
    `;

    // Inject actions
    document.getElementById('addInjectBtn').addEventListener('click', () => {
      const title = (document.getElementById('injTitle').value || '').trim();
      const body = (document.getElementById('injBody').value || '').trim();
      if (!title || !body) { alert('Provide title and content.'); return; }
      ex.injects.push({ id: uid('inj'), title, body, deliveredAt: null });
      saveState(STATE);
      renderRoom(ex.id);
    });

    document.getElementById('deliverNextBtn').addEventListener('click', () => {
      const next = ex.injects.find(i => !i.deliveredAt);
      if (!next) return;
      next.deliveredAt = nowISO();
      saveState(STATE);
      renderRoom(ex.id);
    });

    document.getElementById('resetInjectsBtn').addEventListener('click', () => {
      ex.injects.forEach(i => { i.deliveredAt = null; });
      saveState(STATE);
      renderRoom(ex.id);
    });

    // Decision actions
    document.getElementById('addDecisionBtn').addEventListener('click', () => {
      const owner = (document.getElementById('decOwner').value || '').trim() || 'Unassigned';
      const status = document.getElementById('decStatus').value || 'open';
      const text = (document.getElementById('decText').value || '').trim();
      const rationale = (document.getElementById('decRationale').value || '').trim();
      if (!text) { alert('Decision text is required.'); return; }

      ex.decisions.push({
        id: uid('dec'),
        at: nowISO(),
        owner,
        status,
        text,
        rationale
      });

      saveState(STATE);
      renderRoom(ex.id);
    });

    document.getElementById('clearDecisionsBtn').addEventListener('click', () => {
      if (!confirm('Clear all decisions for this exercise?')) return;
      ex.decisions = [];
      saveState(STATE);
      renderRoom(ex.id);
    });

    // Delete specific inject/decision
    APP.querySelectorAll('[data-del-inject]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-inject');
        ex.injects = ex.injects.filter(i => i.id !== id);
        saveState(STATE);
        renderRoom(ex.id);
      });
    });

    APP.querySelectorAll('[data-del-decision]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-decision');
        ex.decisions = ex.decisions.filter(d => d.id !== id);
        saveState(STATE);
        renderRoom(ex.id);
      });
    });
  }

  function injectCard(i, mode) {
    const meta = mode === 'delivered'
      ? `<span class="pill">delivered: ${formatTime(i.deliveredAt)}</span>`
      : `<span class="pill">pending</span>`;
    return `
      <div class="logline" style="margin-bottom:10px">
        <div class="row" style="justify-content:space-between">
          <div style="font-weight:750">${escapeHtml(i.title)}</div>
          <div class="row">
            ${meta}
            <button class="btn small" type="button" data-del-inject="${i.id}">Delete</button>
          </div>
        </div>
        <div class="muted" style="margin-top:6px">${escapeHtml(i.body)}</div>
      </div>
    `;
  }

  function decisionLine(d) {
    return `
      <div class="logline" style="margin-bottom:10px">
        <div class="row" style="justify-content:space-between">
          <div>
            <span class="pill">${escapeHtml(d.status)}</span>
            <span class="pill">${escapeHtml(d.owner)}</span>
            <span class="pill mono">${formatTime(d.at)}</span>
          </div>
          <button class="btn small" type="button" data-del-decision="${d.id}">Delete</button>
        </div>
        <div style="margin-top:8px; font-weight:750">${escapeHtml(d.text)}</div>
        ${d.rationale ? `<div class="muted" style="margin-top:6px">Why: ${escapeHtml(d.rationale)}</div>` : ``}
      </div>
    `;
  }

  function escapeHtml(str) {
    return String(str || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function formatDate(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, { year:'numeric', month:'short', day:'2-digit' });
    } catch { return iso; }
  }

  function formatTime(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, { hour:'2-digit', minute:'2-digit', second:'2-digit' });
    } catch { return iso; }
  }

  /* -----------------------------
     Global buttons
  ----------------------------- */
  exportBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(STATE, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `decisionary-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  resetBtn.addEventListener('click', () => {
    if (!confirm('Reset demo data? This clears localStorage for this skeleton.')) return;
    localStorage.removeItem(LS_KEY);
    STATE = loadState();
    saveState(STATE);
    window.location.hash = '#/';
    render();
  });

  window.addEventListener('hashchange', render);

  // Initial render
  saveState(STATE);
  render();

})();
