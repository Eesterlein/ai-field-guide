/* ---------- tabs ---------- */
const TABS = [
  { id: 'start', title: 'Start here' },
  { id: 'history', title: 'History & math', blurb: 'How we got from “can machines think?” to chatbots, and the handful of ideas that made it work.' },
  ...SECTIONS,
  { id: 'habits', title: 'Good & bad habits', blurb: 'AI is most dangerous when it sounds sure of itself. These are the common ways people get burned, and what to do instead.' },
  { id: 'quiz', title: 'Quiz', blurb: 'Pick an answer to see why.' },
];
const tabIndex = id => TABS.findIndex(t => t.id === id);

/* ---------- render cards ---------- */
function cardHTML(t) {
  const see = t.see ? `<div class="see">See also ${t.see.map(id => `<button data-go="${id}">${esc(nameOf(id))}</button>`).join('')}</div>` : '';
  const text = `<div class="ctext">
      <h3>${esc(t.term)}</h3>
      <p class="tagline">${esc(t.tag)}</p>
      ${t.extra || ''}
      <div class="beg"><p class="mode-label">In plain English</p><p>${esc(t.beg)}</p></div>
      <div class="dev"><p class="mode-label">For developers</p><p>${esc(t.dev)}</p>${t.code ? `<pre><code>${esc(t.code)}</code></pre>` : ''}</div>
      ${t.why ? `<div class="why-box"><p class="mode-label">Why it matters</p><p>${esc(t.why)}</p></div>` : ''}
      ${t.origin ? `<div class="origin"><p class="mode-label">Where it came from</p><p>${esc(t.origin)}</p></div>` : ''}
      ${see}
    </div>`;
  const search = [t.term, t.tag, t.beg, t.dev, t.why, t.origin, (t.extra || '').replace(/<[^>]+>/g, ' ')].join(' ').toLowerCase();
  if (t.viz) return `<article class="card feature" id="term-${t.id}" data-search="${esc(search)}">${text}<div class="viz" data-viz="${t.viz}"></div></article>`;
  return `<article class="card mini" id="term-${t.id}" data-search="${esc(search)}">${text}</article>`;
}
const termsIn = sec => TERMS.filter(t => t.sec === sec);
const sectionBody = sec => {
  const ts = termsIn(sec);
  return `<div class="features">${ts.filter(t => t.viz).map(cardHTML).join('')}</div>
    ${ts.some(t => !t.viz) ? `<div class="mini-grid">${ts.filter(t => !t.viz).map(cardHTML).join('')}</div>` : ''}`;
};

const timelineHTML = () => `<article class="card tl-card" id="term-timeline" data-search="${esc(TIMELINE.map(e => e.join(' ')).join(' ').toLowerCase())} history timeline">
  <div class="tl-head"><h3>75 years in one scroll</h3><div class="legend">${Object.values(ERAS).map(([n, c]) => `<span><i style="background:${c}"></i>${n}</span>`).join('')}</div></div>
  <ol class="timeline">${TIMELINE.map(([y, era, title, text, go]) => `<li style="--era:${ERAS[era][1]}">
    <span class="tl-year">${y}</span>
    <div class="tl-body"><b>${title}</b><p>${text}</p>${go ? `<button class="tl-go" data-go="${go}">${esc(nameOf(go))} →</button>` : ''}</div></li>`).join('')}</ol>
</article>`;

const mathHTML = () => `<article class="card math-card" id="term-math" data-search="${esc(MATH.map(m => [m.name, m.what, m.plain].join(' ')).join(' ').toLowerCase())} math formula equation">
  <div class="tl-head"><h3>The scary-looking math, explained</h3><p class="hint">Five formulas do most of the work. You don't need to compute them; it helps to know what they say.</p></div>
  <div class="math-grid">${MATH.map(m => `<div class="eq">
    <p class="eq-name">${m.name}</p><p class="eq-what">${m.what}</p>
    <p class="formula">${m.formula}</p>
    <p>${m.plain}</p>
    <p class="eq-ex"><span>Example</span> ${m.ex}</p>
    ${m.go ? `<button class="tl-go" data-go="${m.go}">See it in action →</button>` : ''}
  </div>`).join('')}</div>
</article>`;

const spotHTML = `<article class="card feature" id="term-spot" data-search="spot the hallucination fake made up citation trust verify">
  <div class="ctext">
    <h3>Spot the hallucination</h3>
    <p class="tagline">Made-up facts sound exactly like real ones.</p>
    <div class="beg"><p class="mode-label">In plain English</p><p>Someone asked an AI a coding question. Three of the six statements in the answer are invented. Click the ones you think are fake, then check. Most people miss at least one, because nothing in the writing gives them away.</p></div>
    <div class="dev"><p class="mode-label">For developers</p><p>Invented functions, version numbers, statistics and URLs are the classic failures. They follow the real naming patterns of the library or site, which is exactly why they're convincing. Check them against the docs, or run the code.</p></div>
    <div class="see">See also <button data-go="hallucination">Hallucination</button><button data-go="rag">RAG</button></div>
  </div>
  <div class="viz" data-viz="spot"></div>
</article>`;

const habitsHTML = () => HABITS.map(h => `<article class="card pit" id="term-pit-${h.id}" data-search="${esc((h.title + ' ' + h.risk[1] + ' ' + h.dont + ' ' + h.what + ' ' + h.doit + ' ' + (h.dev || '')).toLowerCase())}">
  <span class="risk risk-${h.risk[0]}">${h.risk[1]}</span>
  <h3>${esc(h.title)}</h3>
  <div class="hb hb-dont"><p class="mode-label"><span aria-hidden="true">✕</span> Bad habit</p><p>${esc(h.dont)}</p></div>
  <div class="hb hb-what"><p class="mode-label">What goes wrong</p><p>${esc(h.what)}</p></div>
  <div class="hb hb-do"><p class="mode-label"><span aria-hidden="true">✓</span> Do this instead</p><p>${esc(h.doit)}</p>${h.dev ? `<p class="dev" style="margin-top:6px"><b>Dev tip:</b> ${esc(h.dev)}</p>` : ''}</div>
  <div class="see">Related <button data-go="${h.see}">${esc(nameOf(h.see))}</button></div>
</article>`).join('');

const BODY = {
  history: () => timelineHTML() + `<div class="features">${['vecmath', 'attention'].map(id => cardHTML(byId[id])).join('')}</div>` + mathHTML() + `<div class="features">${cardHTML(byId.mystery)}</div>`,
  habits: () => `<div class="features">${spotHTML}</div><div class="pit-grid">${habitsHTML()}</div>`,
  quiz: () => `<p class="score" id="score"></p><div class="quiz" id="quiz"></div>`,
};

const panelHTML = (t, i) => {
  const next = TABS[i + 1];
  return `<section class="panel wrap" id="p-${t.id}" role="tabpanel" aria-labelledby="tab-${t.id}" hidden>
    <div class="sec-head"><span class="sec-num">${String(i).padStart(2, '0')}</span><h2>${t.title}</h2><p>${t.blurb}</p></div>
    ${BODY[t.id] ? BODY[t.id]() : sectionBody(t.id)}
    ${next ? `<div class="next-row"><button class="btn next-btn" data-tab="${next.id}">Next: ${next.title} →</button></div>` : `<div class="next-row"><button class="btn ghost next-btn" data-tab="start">Back to the start</button></div>`}
  </section>`;
};
$('#panels').insertAdjacentHTML('beforeend', TABS.slice(1).map((t, i) => panelHTML(t, i + 1)).join(''));
$('#p-start').insertAdjacentHTML('beforeend', `<div class="wrap"><h2 class="path-h">Your path through the guide</h2>
  <div class="path">${TABS.slice(1).map((t, i) => `<button class="path-card" data-tab="${t.id}"><span class="sec-num">${String(i + 1).padStart(2, '0')}</span><b>${t.title}</b><span>${t.blurb}</span></button>`).join('')}</div>
  <div class="next-row"><button class="btn next-btn" data-tab="history">Start: History &amp; math →</button></div></div>`);

$('#tabs').innerHTML = TABS.map((t, i) => `<button role="tab" id="tab-${t.id}" aria-controls="p-${t.id}" aria-selected="false" tabindex="-1" data-tab="${t.id}">${i ? `<b>${String(i).padStart(2, '0')}</b>` : ''}${t.title}</button>`).join('');
const demoCount = TERMS.filter(t => t.viz).length + 1;
$('#counts').innerHTML = `<span><b>${TERMS.filter(t => t.sec !== 'history').length}</b> terms</span><span><b>${demoCount}</b> live demos</span><span><b>${HABITS.length}</b> bad habits to avoid</span><span><b>${QUIZ.length}</b> quiz questions</span>`;

/* ---------- tab switching ---------- */
let current = 'start';
function showTab(id, { focus = false, scroll = true } = {}) {
  if (tabIndex(id) < 0) id = 'start';
  current = id;
  $$('.panel').forEach(p => p.hidden = p.id !== 'p-' + id);
  $$('#tabs [role=tab]').forEach(b => { const on = b.dataset.tab === id; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; });
  const tab = $('#tab-' + id);
  tab.scrollIntoView({ block: 'nearest', inline: 'center', behavior: RM ? 'auto' : 'smooth' });
  if (focus) tab.focus();
  try { history.replaceState(null, '', id === 'start' ? location.pathname : '#' + id); } catch (e) {}
  if (scroll) window.scrollTo({ top: 0, behavior: 'auto' });
}
$('#tabs').addEventListener('keydown', e => {
  const i = tabIndex(current);
  const n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? TABS.length - 1 : null;
  if (n === null) return;
  e.preventDefault(); showTab(TABS[(n + TABS.length) % TABS.length].id, { focus: true });
});

/* ---------- navigation ---------- */
function go(id) {
  const card = $('#term-' + id);
  if (!card) return;
  if ($('#q').value) { $('#q').value = ''; filter(''); }
  const panel = card.closest('.panel');
  showTab(panel.id.slice(2), { scroll: false });
  requestAnimationFrame(() => {
    card.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
    card.classList.add('flash');
    setTimeout(() => card.classList.remove('flash'), 1600);
  });
}
document.addEventListener('click', e => {
  const g = e.target.closest('[data-go]');
  if (g) { go(g.dataset.go); return; }
  const t = e.target.closest('[data-tab]');
  if (t) { if ($('#q').value) { $('#q').value = ''; filter(''); } showTab(t.dataset.tab); }
});
$$('.map .node').forEach(n => n.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(n.dataset.go); } }));

/* ---------- mode toggle ---------- */
function setMode(dev) {
  document.body.classList.toggle('mode-dev', dev);
  $('#m-dev').setAttribute('aria-pressed', dev);
  $('#m-beg').setAttribute('aria-pressed', !dev);
  try { localStorage.setItem('afg-mode', dev ? 'dev' : 'beg'); } catch (e) {}
}
$('#m-dev').onclick = () => setMode(true);
$('#m-beg').onclick = () => setMode(false);
try { if (localStorage.getItem('afg-mode') === 'dev') setMode(true); } catch (e) {}

/* ---------- search (across every tab) ---------- */
function filter(q) {
  q = q.trim().toLowerCase();
  const searching = !!q;
  document.body.classList.toggle('searching', searching);
  let any = false;
  $$('.panel').forEach(p => {
    if (!searching) { $$('.card', p).forEach(c => c.hidden = false); p.hidden = p.id !== 'p-' + current; return; }
    if (p.id === 'p-start' || p.id === 'p-quiz') { p.hidden = true; return; }
    let shown = 0;
    $$('.card[data-search]', p).forEach(c => { const hit = c.dataset.search.includes(q) || $('h3', c).textContent.toLowerCase().includes(q); c.hidden = !hit; if (hit) shown++; });
    p.hidden = shown === 0;
    if (shown) any = true;
  });
  $('#noresults').hidden = !searching || any;
  $('#search-note').hidden = !searching;
  if (searching) window.scrollTo({ top: 0 });
}
$('#q').addEventListener('input', e => filter(e.target.value));

/* ---------- demos ---------- */
$$('[data-viz]').forEach(b => VIZ[b.dataset.viz](b));

/* ---------- quiz ---------- */
let right = 0, answered = 0;
$('#quiz').innerHTML = QUIZ.map((q, i) => `<div class="card q" data-q="${i}"><h3>${esc(q[0])}</h3><div class="opts">${q[1].map((o, j) => `<button data-o="${j}">${esc(o)}</button>`).join('')}</div><p class="why" hidden></p></div>`).join('');
$$('.q').forEach(c => {
  const q = QUIZ[+c.dataset.q];
  $$('[data-o]', c).forEach(b => b.onclick = () => {
    const j = +b.dataset.o, ok = j === q[2];
    $$('[data-o]', c).forEach(x => { x.disabled = true; if (+x.dataset.o === q[2]) x.classList.add('right'); });
    if (!ok) b.classList.add('wrong');
    const why = $('.why', c); why.hidden = false;
    why.innerHTML = `${ok ? '<b style="color:var(--ok)">Right.</b>' : '<b style="color:var(--bad)">Not quite.</b>'} ${esc(q[3])} <button class="btn ghost" style="padding:2px 8px;font-size:13px" data-go="${q[4]}">Review</button>`;
    answered++; if (ok) right++;
    $('#score').textContent = `Score: ${right} of ${answered} answered (${QUIZ.length} total)`;
  });
});

/* ---------- start ---------- */
showTab((location.hash || '').slice(1) || 'start', { scroll: false });
