/* ZyeemZia™ Academy — renders the route map, learning routes, catalogue, course finder and certificate check
   from data-academy.js (generated from each course's own data). Copyright © ZyeemZia */
(function () {
  'use strict';
  const A = window.ZZ_ACADEMY || { courses: [], stats: {} };
  const C = A.courses;
  const $ = (s, el) => (el || document).querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const bySlug = slug => C.find(c => c.slug === slug);
  const API = 'https://api.zyeemzia.com';

  // learning routes shown to learners (several data paths can share one), each with its own line colour
  const ROUTES = [
    { key: 'net', title: 'Networking', note: 'From your first network to network design', paths: ['Networking'], light: '#0b7fc0', dark: '#55bdf2' },
    { key: 'cyber', title: 'Cybersecurity & IT', note: 'From the help desk to security leadership', paths: ['IT Operations', 'Cybersecurity'], light: '#cf3350', dark: '#ff8296' },
    { key: 'ai', title: 'Artificial Intelligence', note: 'Build, govern and design AI systems', paths: ['AI'], light: '#7349de', dark: '#b8a0ff' },
    { key: 'lead', title: 'Leadership & Management', note: 'Projects, people and IT services', paths: ['Leadership', 'Service Management'], light: '#c97412', dark: '#f5b759' },
    { key: 'ihl', title: 'Law, Humanitarian Law & Peace Operations', note: 'IHL, Bangladesh law and UN law, and how to teach them', paths: ['Humanitarian Law'], light: '#c8102e', dark: '#ff6b74' },
    { key: 'lang', title: 'Languages', note: 'Self-paced courses, taught in English or Bangla. Take any of them, in any order.', paths: ['Languages'], light: '#0d8f64', dark: '#55d6a6' }
  ];
  const routeOf = c => ROUTES.find(r => r.paths.includes(c.path)) || ROUTES[0];
  const LEVELS = ['Beginner · Associate', 'Professional', 'Expert · Architect', 'Master'];
  const SHORT = { 'zcie-security': 'ZCIE Sec', quranlearnarbi: 'Arabic', learnfrench: 'French', learnbangla: 'Bangla', learnmandarin: 'Mandarin' };
  const label = c => SHORT[c.slug] || c.code.split(' ')[0];
  const colour = c => `data-c style="--cl:${c.accent};--cd:${c.darkAccent}"`;
  const rcolour = r => `data-r style="--rl:${r.light};--rd:${r.dark}"`;
  const site = c => `https://${c.domain}/`;
  // certificate routes climb by tier; language courses have no levels, so they sort by language name
const ordered = list => list.slice().sort((a, b) => a.tier - b.tier || (a.kind === 'language' ? label(a).localeCompare(label(b)) : 0));
  const curriculum = () => C.slice().sort((a, b) => ROUTES.indexOf(routeOf(a)) - ROUTES.indexOf(routeOf(b)) || a.tier - b.tier);

  // ---------------- theme ----------------
  const root = document.documentElement;
  const isDark = () => root.getAttribute('data-theme') === 'dark' || (root.getAttribute('data-theme') !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
  const paintMeta = () => { const m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', isDark() ? '#0e1320' : '#fbf8f2'); };
  $('#modeBtn').addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark'; root.setAttribute('data-theme', next);
    try { localStorage.setItem('zzAcademyTheme', next); } catch (e) { /* private mode */ }
    paintMeta();
  });
  paintMeta();
  try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', paintMeta); } catch (e) { /* old browsers */ }
  // course and route colours follow the theme without re-rendering
  const style = document.createElement('style');
  style.textContent = '[data-c]{--c:var(--cl);--on-c:#fff}[data-r]{--rc:var(--rl)}'
    + ':root[data-theme="dark"] [data-c]{--c:var(--cd);--on-c:#0e1320}:root[data-theme="dark"] [data-r]{--rc:var(--rd)}'
    + '@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) [data-c]{--c:var(--cd);--on-c:#0e1320}:root:not([data-theme="light"]) [data-r]{--rc:var(--rd)}}';
  document.head.appendChild(style);

  // ---------------- stats ----------------
  const S = A.stats || {};
  $('#stats').innerHTML = [[S.courses, 'Courses'], [S.tracks, 'Certificate tracks'], [S.lessons, 'Lessons'], [S.modules, 'Modules'], ['Free', 'for every learner, everywhere']]
    .map(([v, k]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('');
  document.querySelectorAll('[data-stat="courses"]').forEach(e => { e.textContent = S.courses; });

  // ---------------- route map (transit-map style) ----------------
  (function map() {
    const svg = $('#map'); const NS = 'http://www.w3.org/2000/svg';
    // certificate routes sit on the level grid; languages have no levels, so they get their own strip below it
    const X0 = 210, COL = 197, Y0 = 92, ROW = 82, W = X0 + COL * 4;
    const LADDERS = ROUTES.filter(r => r.key !== 'lang'), GRID = Y0 + ROW * (LADDERS.length - 1) + 44;
    const LANG_Y = GRID + 74, H = LANG_Y + 58;
    const yOf = r => r.key === 'lang' ? LANG_Y : Y0 + LADDERS.indexOf(r) * ROW;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const el = (n, a, parent) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); (parent || svg).appendChild(e); return e; };
    LEVELS.forEach((name, i) => {
      if (i % 2) el('rect', { x: X0 + COL * i, y: 0, width: COL, height: GRID, class: 'col-band' });
      el('text', { x: X0 + COL * i + COL / 2, y: 36, 'text-anchor': 'middle', class: 'col-label' }).textContent = name;
    });
    el('line', { x1: 22, x2: W - 22, y1: GRID + 12, y2: GRID + 12, class: 'strip-rule' });
    el('text', { x: 22, y: GRID + 36, class: 'col-label' }).textContent = 'Languages · no levels, start any time';
    ROUTES.forEach(r => {
      const y = yOf(r); const mine = ordered(C.filter(c => routeOf(c) === r)); if (!mine.length) return;
      const g = el('g', {}); g.setAttribute('data-r', ''); g.setAttribute('style', `--rl:${r.light};--rd:${r.dark}`);
      el('text', { x: 22, y: y - 2, class: 'route-name' }, g).textContent = r.title.replace(' & Management', '').replace(' & Peace Operations', '').replace('Artificial Intelligence', 'AI');
      el('text', { x: 22, y: y + 16, class: 'route-note' }, g).textContent = r.key === 'lang' ? `${mine.length} courses · any order` : `${mine.length} certificates`;
      // stops: tiers share a level column; languages are separate courses, so they are spaced evenly with no line joining them
      const LANG = r.key === 'lang';
      const pts = LANG
        ? mine.map((c, i) => ({ c, x: X0 + (COL * 4) * (i + 0.5) / mine.length }))
        : mine.map(c => { const same = mine.filter(o => o.tier === c.tier); const i = same.indexOf(c); return { c, x: X0 + COL * (c.tier - 1) + COL * (i + 1) / (same.length + 1) }; });
      if (!LANG) {
        el('path', { d: `M${X0 - 8} ${y} H${pts[pts.length - 1].x}`, class: 'route-line' }, g);
        el('circle', { cx: X0 - 8, cy: y, r: 6, class: 'route-tag' }, g);
      }
      pts.forEach(({ c, x }, i) => {
        const s = el('g', { class: 'stop', tabindex: 0, role: 'button', 'aria-label': `${c.full}, ${c.level}. Open details`, transform: `translate(${x.toFixed(1)} ${y})` }, g);
        el('circle', { r: 10, class: 'ring' }, s); el('circle', { r: 4.5, class: 'pip' }, s);
        const crowd = pts.some((p, j) => j !== i && Math.abs(p.x - x) < 70);
        el('text', { y: crowd && i % 2 ? -19 : 30, 'text-anchor': 'middle' }, s).textContent = label(c);
        if (LANG) el('text', { y: 46, 'text-anchor': 'middle', class: 'stop-sub' }, s).textContent = c.level;
        const tip = () => { $('#mapTip').textContent = `${c.full} · ${c.level}`; };
        s.addEventListener('mouseenter', tip); s.addEventListener('focus', tip);
        s.addEventListener('click', () => openCourse(c.slug));
        s.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCourse(c.slug); } });
      });
    });
  })();

  // ---------------- learning routes ----------------
  $('#routeCards').innerHTML = ROUTES.map(r => {
    const mine = ordered(C.filter(c => routeOf(c) === r)); if (!mine.length) return '';
    return `<article class="route" ${rcolour(r)}><h3><i></i>${esc(r.title)}</h3><p>${esc(r.note)}</p><ol class="stops${r.key === 'lang' ? ' free' : ''}">${mine.map(c =>
      `<li><span class="lv">${esc(c.level)}</span><button type="button" data-open="${c.slug}"><b${c.lang ? ` lang="${c.lang}"` : ''}>${esc(c.kind === 'track' ? c.code : c.code)}</b><span>${esc(c.name)}</span></button></li>`).join('')}</ol></article>`;
  }).join('');

  // ---------------- catalogue ----------------
  let fRoute = '', fLevel = '', fText = '';
  $('#pathChips').innerHTML = `<button type="button" data-g="" aria-pressed="true">All courses</button>` + ROUTES.map(r => `<button type="button" data-g="${r.key}" aria-pressed="false" ${rcolour(r)}><i></i>${esc(r.title)}</button>`).join('');
  const hay = c => [c.code, c.name, c.full, c.blurb, c.tagline, c.level, c.path, routeOf(c).title, (c.skills || []).join(' '), (c.modules || []).map(m => m.title).join(' ')].join(' ').toLowerCase();
  function card(c) {
    const meta = c.kind === 'track'
      ? [`${c.lessons} lessons`, `${c.modules.length} modules`, c.hours ? `${c.hours} hours` : '', `${c.exam.size}-question exam`]
      : [`${c.lessons} lessons`, c.extra || ''];
    return `<article class="card" ${colour(c)}>
      <div class="k"><span class="code"${c.lang ? ` lang="${c.lang}"` : ''}>${esc(c.code)}</span><span class="lv">${esc(c.level)}</span></div>
      <h3>${esc(c.kind === 'track' ? c.name : c.full)}</h3>
      <p>${esc(c.blurb)}</p>
      <div class="meta">${meta.filter(Boolean).map(m => `<span>${esc(m)}</span>`).join('')}</div>
      <div class="acts"><a class="bk" href="${site(c)}book.html" target="_blank" rel="noopener">Book</a><button class="more" type="button" data-open="${c.slug}">Details</button><a class="go" href="${site(c)}" target="_blank" rel="noopener">Start →</a></div>
    </article>`;
  }
  function renderGrid() {
    const q = fText.trim().toLowerCase();
    const list = curriculum().filter(c => (!fRoute || routeOf(c).key === fRoute) && (!fLevel || String(c.tier) === fLevel) && (!q || q.split(/\s+/).every(w => hay(c).includes(w))));
    $('#grid').innerHTML = list.length ? list.map(card).join('') : '<p class="empty-state">No course matches yet. Try another word or clear the filters.</p>';
    $('#count').textContent = `Showing ${list.length} of ${C.length} courses`;
  }
  $('#pathChips').addEventListener('click', e => { const b = e.target.closest('[data-g]'); if (!b) return; fRoute = b.dataset.g; document.querySelectorAll('#pathChips [data-g]').forEach(x => x.setAttribute('aria-pressed', x === b)); renderGrid(); });
  $('#lvl').addEventListener('change', e => { fLevel = e.target.value; renderGrid(); });
  $('#q').addEventListener('input', e => { fText = e.target.value; renderGrid(); });
  renderGrid();

  // ---------------- course details ----------------
  const dlg = $('#drawer');
  function openCourse(slug, fromHash) {
    const c = bySlug(slug); if (!c) return;
    const body = $('#dBody'); body.setAttribute('data-c', ''); body.setAttribute('style', `--cl:${c.accent};--cd:${c.darkAccent}`);
    const T = c.kind === 'track';
    body.innerHTML = `<button class="d-x" type="button" data-close aria-label="Close">×</button>
      <div class="code"${c.lang ? ` lang="${c.lang}"` : ''}>${esc(c.code)}</div>
      <h2 id="dTitle">${esc(c.full)}</h2>
      <div class="tag">${esc([c.level, T && c.hours ? `${c.hours} study hours` : '', routeOf(c).title].filter(Boolean).join(' · '))}</div>
      <p>${esc(T && c.tagline ? `${c.tagline} ${c.blurb}` : c.blurb)}</p>
      <div class="facts">${(T ? [[c.lessons, 'Lessons'], [c.modules.length, 'Modules'], [`${c.exam.size}`, `Questions · ${c.exam.minutes} min`], [`${c.exam.pass}%`, `to pass · ${c.exam.distinction}% distinction`]] : [[c.lessons, 'Lessons'], ['Free', c.level]]).map(([b, s]) => `<div><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join('')}</div>
      ${T ? `<h3>What you will study</h3><ol class="mods">${c.modules.map(m => `<li><span>${esc(m.title)} <small>· ${m.lessons} lessons</small></span></li>`).join('')}</ol>` : `<h3>Also inside</h3><p>${esc(c.extra || '')}</p>`}
      ${T && c.capstone ? `<h3>Final project</h3><p>${esc(c.capstone.replace(/^Capstone:\s*/, ''))}</p>` : ''}
      ${T && c.skills.length ? `<h3>Skills on your certificate</h3><div class="skills">${c.skills.map(s => `<span>${esc(s)}</span>`).join('')}</div>` : ''}
      <div class="d-acts"><a class="btn go" href="${site(c)}" target="_blank" rel="noopener">Start the course →</a><a class="btn ghost" href="${site(c)}book.html" target="_blank" rel="noopener">Read the book</a>
        ${T && c.pdf ? `<a class="btn ghost" href="${site(c)}${encodeURIComponent(c.pdf)}" download>Download PDF</a>` : ''}${T ? `<a class="btn ghost" href="${site(c)}privacy.html" target="_blank" rel="noopener">Privacy</a>` : ''}</div>`;
    if (!dlg.open) dlg.showModal();
    if (!fromHash) { try { history.replaceState(null, '', '#course/' + slug); } catch (e) { /* ignore */ } }
  }
  dlg.addEventListener('close', () => { if (location.hash.startsWith('#course/')) { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* ignore */ } } });
  dlg.addEventListener('click', e => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
  document.addEventListener('click', e => { const o = e.target.closest('[data-open]'); if (o) openCourse(o.dataset.open); });
  const fromHash = () => { const m = /^#course\/([a-z0-9-]+)$/.exec(location.hash); if (m) openCourse(m[1], true); };
  addEventListener('hashchange', fromHash); fromHash();

  // ---------------- course finder ----------------
  const GOALS = [['net', 'Build and run networks'], ['cyber', 'Keep systems safe'], ['ai', 'Work with AI'], ['lead', 'Lead projects and people'], ['itsm', 'Run IT services'], ['ihl', 'Learn or teach law (IHL, Bangladesh & UN law)'], ['lang', 'Learn a language']];
  const EXP = [['new', 'I am new to this'], ['some', 'I know the basics'], ['pro', 'I have work experience']];
  const PLAN = {
    net: { new: ['zcna', 'zcnp'], some: ['zcnp', 'zcie'], pro: ['zcie', 'zcde'] },
    cyber: { new: ['zitss', 'zcss'], some: ['zcss', 'zcstg'], pro: ['zcstg', 'zcie-security'] },
    ai: { new: ['zmls', 'zaig'], some: ['zmls', 'zaia'], pro: ['zaia', 'zaig'] },
    lead: { new: ['zpmp', 'zhrls'], some: ['zpmp', 'zepms'], pro: ['zepms', 'zitil'] },
    itsm: { new: ['zitss', 'zitil'], some: ['zitss', 'zitil'], pro: ['zitil', 'zcstg'] },
    ihl: { new: ['unbdlaw', 'totihl'], some: ['unbdlaw', 'totihl'], pro: ['totihl', 'unbdlaw'] }
  };
  let goal = '', exp = '';
  $('#fGoal').innerHTML = GOALS.map(([k, t]) => `<button type="button" data-goal="${k}" aria-pressed="false">${esc(t)}</button>`).join('');
  $('#fExp').innerHTML = EXP.map(([k, t]) => `<button type="button" data-exp="${k}" aria-pressed="false">${esc(t)}</button>`).join('');
  const pickCard = (c, tag) => `<div ${colour(c)}><small>${esc(tag)}</small><b${c.lang ? ` lang="${c.lang}"` : ''}>${esc(c.code)}</b><span>${esc(c.name)} · ${esc(c.level)}</span><div class="acts"><button class="more" type="button" data-open="${c.slug}">Details</button><a class="go" href="${site(c)}" target="_blank" rel="noopener">Start →</a></div></div>`;
  function renderFinder() {
    const out = $('#fResult');
    if (!goal || (!exp && goal !== 'lang')) { out.innerHTML = ''; return; }
    if (goal === 'lang') { out.innerHTML = `<h4>Pick any of these</h4><div class="pick">${ordered(C.filter(c => c.kind === 'language')).map(c => pickCard(c, c.level)).join('')}</div>`; return; }
    const [a, b] = PLAN[goal][exp].map(bySlug).filter(Boolean);
    out.innerHTML = `<h4>Our suggestion for you</h4><div class="pick">${a ? pickCard(a, 'Start here') : ''}${b ? pickCard(b, 'Then continue with') : ''}</div>`;
  }
  $('#fGoal').addEventListener('click', e => { const b = e.target.closest('[data-goal]'); if (!b) return; goal = b.dataset.goal; document.querySelectorAll('#fGoal button').forEach(x => x.setAttribute('aria-pressed', x === b)); $('#fExp').closest('fieldset').hidden = goal === 'lang'; renderFinder(); });
  $('#fExp').addEventListener('click', e => { const b = e.target.closest('[data-exp]'); if (!b) return; exp = b.dataset.exp; document.querySelectorAll('#fExp button').forEach(x => x.setAttribute('aria-pressed', x === b)); renderFinder(); });

  // ---------------- certificate check (on the ZyeemZia server) ----------------
  $('#vForm').addEventListener('submit', async e => {
    e.preventDefault();
    const id = $('#vId').value.trim().toUpperCase().replace(/\s+/g, ''); const out = $('#vOut'); if (!id) return;
    out.className = 'v-out'; out.innerHTML = '<p>Checking…</p>';
    try {
      const r = await fetch(`${API}/v1/verify/${encodeURIComponent(id)}`); const j = await r.json().catch(() => ({}));
      if (r.status === 404 || r.status === 400) { out.className = 'v-out no'; out.innerHTML = `<h4>Not found</h4><p>No ZyeemZia certificate has the ID <b>${esc(id)}</b>. Please check each character and try again.</p>`; return; }
      if (!r.ok) throw new Error(j.error || 'Server error');
      out.className = 'v-out ' + (j.revoked ? 'no' : 'ok');
      const course = C.find(c => c.domain === j.domain);
      out.innerHTML = `<h4>${j.revoked ? 'This certificate was withdrawn' : 'Genuine certificate'}${j.distinction && !j.revoked ? ' · with Distinction' : ''}</h4>
        <dl><dt>Name</dt><dd>${esc(j.name)}</dd><dt>Certificate</dt><dd>${esc(j.trackName)}</dd><dt>Issued</dt><dd>${esc(j.date)}</dd><dt>Exam score</dt><dd>${esc(j.score)}%</dd><dt>Certificate ID</dt><dd>${esc(j.id)}</dd>${course ? `<dt>Course</dt><dd><a href="${site(course)}" target="_blank" rel="noopener">${esc(course.domain)}</a></dd>` : ''}</dl>`;
    } catch (err) { out.className = 'v-out no'; out.innerHTML = '<h4>Could not check right now</h4><p>The certificate server could not be reached. Please check your connection and try again.</p>'; }
  });
})();
