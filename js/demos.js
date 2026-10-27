/* ---------- demos ---------- */
const VIZ = {};

VIZ.token = box => {
  box.innerHTML = `<label class="vlabel" for="tok-in">Type anything</label>
    <textarea id="tok-in" rows="2" spellcheck="false">Agents call tools in a loop until the task is done. Unbelievably useful!</textarea>
    <div class="chips" id="tok-chips" aria-live="polite"></div>
    <p class="vstats" id="tok-stats"></p>
    <p class="vnote">A simplified tokenizer for illustration. Real ones split text a little differently. A dot means the token starts with a space. Developer mode shows each token's ID.</p>`;
  const inp = $('#tok-in', box);
  const split = s => {
    const parts = s.match(/\s*[A-Za-z]+|\s*\d|\s*[^\sA-Za-z\d]|\s+$/g) || [];
    const out = [];
    for (const p of parts) {
      const lead = p.match(/^\s*/)[0], w = p.slice(lead.length);
      if (w.length <= 7) { out.push(p); continue; }
      const pieces = [];
      for (let i = 0; i < w.length; i += 4) pieces.push(w.slice(i, i + 4));
      if (pieces.length > 1 && pieces[pieces.length - 1].length < 2) pieces[pieces.length - 2] += pieces.pop();
      pieces[0] = lead + pieces[0];
      out.push(...pieces);
    }
    return out;
  };
  const id = s => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 100000; return h; };
  const render = () => {
    const toks = split(inp.value);
    $('#tok-chips', box).innerHTML = toks.map((t, i) => {
      const lead = /^\s/.test(t);
      return `<span class="chip" style="background:var(--c${(i % 6) + 1});animation-delay:${Math.min(i * 18, 400)}ms">${lead ? '<span><span class="sp">·</span>' : '<span>'}${esc(t.trim())}</span><small>${id(t)}</small></span>`;
    }).join('');
    const chars = inp.value.length;
    $('#tok-stats', box).textContent = toks.length ? `${toks.length} tokens · ${chars} characters · ${(chars / toks.length).toFixed(1)} characters per token` : 'Type something to see it split into tokens.';
  };
  inp.addEventListener('input', render);
  render();
};

VIZ.temperature = box => {
  const W = [['mat', 3.1], ['floor', 2.3], ['couch', 2.0], ['rug', 1.7], ['roof', 0.8], ['keyboard', 0.4], ['moon', -0.7]];
  box.innerHTML = `<p class="prompt-line">The cat sat on the <span class="blank" id="t-blank">___</span></p>
    <div class="slider-row"><label for="t-slider">Temperature</label><input type="range" id="t-slider" min="0" max="2" step="0.05" value="0.7"><output id="t-val" for="t-slider">0.70</output></div>
    <div class="temp-scale"><span>0 = always the favorite</span><span>2 = wild</span></div>
    <div class="bars">${W.map(([w]) => `<div class="prob-row"><span class="bw">${w}</span><span class="track"><span class="fill"></span></span><span class="bp"></span></div>`).join('')}</div>
    <div class="vbtns"><button class="btn" id="t-sample">Pick 10 next words</button><div class="samples" id="t-samples" aria-live="polite"></div></div>`;
  const sl = $('#t-slider', box);
  const probs = T => {
    if (T < 0.05) return W.map((_, i) => i === 0 ? 1 : 0);
    const m = Math.max(...W.map(w => w[1] / T));
    const e = W.map(w => Math.exp(w[1] / T - m)); const s = e.reduce((a, b) => a + b, 0);
    return e.map(x => x / s);
  };
  const update = () => {
    const T = +sl.value, p = probs(T);
    $('#t-val', box).textContent = T.toFixed(2);
    $$('.prob-row', box).forEach((r, i) => { $('.fill', r).style.width = (p[i] * 100) + '%'; $('.bp', r).textContent = (p[i] * 100).toFixed(p[i] < .01 && p[i] > 0 ? 1 : 0) + '%'; });
  };
  $('#t-sample', box).onclick = () => {
    const p = probs(+sl.value);
    const picks = Array.from({ length: 10 }, () => { let r = Math.random(), i = 0; while (i < p.length - 1 && (r -= p[i]) > 0) i++; return W[i][0]; });
    $('#t-samples', box).innerHTML = picks.map(w => `<span>${w}</span>`).join('');
    const b = $('#t-blank', box); b.textContent = picks[0]; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
  };
  sl.addEventListener('input', update);
  update();
};

VIZ.embedding = box => {
  const CATS = [['Animals', 'var(--accent)'], ['Food', 'var(--model)'], ['Code', 'var(--ok)'], ['Vehicles', 'var(--violet)']];
  const P = [
    ['cat', 72, 62, 0], ['kitten', 96, 48, 0], ['dog', 112, 88, 0], ['puppy', 140, 72, 0], ['horse', 150, 118, 0],
    ['apple', 300, 52, 1], ['banana', 340, 76, 1], ['pizza', 286, 104, 1], ['pasta', 326, 124, 1],
    ['python', 112, 166, 2], ['bug', 160, 152, 2], ['function', 62, 226, 2], ['javascript', 112, 246, 2], ['variable', 70, 196, 2],
    ['car', 296, 204, 3], ['truck', 336, 232, 3], ['bike', 262, 238, 3], ['bus', 352, 190, 3],
  ];
  box.innerHTML = `<p class="vlabel">Click a word to find its nearest neighbors</p>
    <svg class="emb" viewBox="0 0 420 280" role="group" aria-label="Words placed by meaning">
      <g class="grid">${[70, 140, 210].map(y => `<line x1="0" x2="420" y1="${y}" y2="${y}"/>`).join('')}${[105, 210, 315].map(x => `<line y1="0" y2="280" x1="${x}" x2="${x}"/>`).join('')}</g>
      <g id="e-lines"></g>
      ${P.map(([w, x, y, c]) => `<g class="pt" data-w="${w}" tabindex="0" role="button" aria-label="${w}"><circle cx="${x}" cy="${y}" r="6" fill="${CATS[c][1]}"/><text x="${x + 10}" y="${y + 4}">${w}</text></g>`).join('')}
    </svg>
    <div class="legend">${CATS.map(([n, c]) => `<span><i style="background:${c}"></i>${n}</span>`).join('')}</div>
    <p class="vstats" id="e-info" aria-live="polite"></p>
    <p class="vnote">Notice that "python" and "bug" sit between animals and code. Words with two meanings land between their meanings.</p>`;
  const sel = w => {
    const a = P.find(p => p[0] === w);
    const near = P.filter(p => p !== a).map(p => [p, Math.hypot(p[1] - a[1], p[2] - a[2])]).sort((x, y) => x[1] - y[1]).slice(0, 3);
    $('#e-lines', box).innerHTML = near.map(([p]) => `<line class="nl" x1="${a[1]}" y1="${a[2]}" x2="${p[1]}" y2="${p[2]}"/>`).join('');
    $$('.pt', box).forEach(g => { g.classList.toggle('sel', g.dataset.w === w); g.classList.toggle('near', near.some(([p]) => p[0] === g.dataset.w)); });
    $('#e-info', box).textContent = `Closest to "${w}": ` + near.map(([p, d]) => `${p[0]} (${(1 - d / 450).toFixed(2)})`).join(', ');
  };
  $$('.pt', box).forEach(g => {
    g.addEventListener('click', () => sel(g.dataset.w));
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sel(g.dataset.w); } });
  });
  sel('kitten');
};

VIZ.context = box => {
  const CAP = 24;
  const USER = ['Now add a test for it', 'Why did that test fail?', 'Rename it to verify()', 'Also update the docs', 'Ship it'];
  const AI = ['Test added, 1 failing', 'Missing import, fixing', 'Renamed in 4 files', 'Docs updated', 'Done. All tests pass'];
  const FILES = ['billing.py (pasted file)', 'README.md (pasted file)', 'error.log (pasted file)'];
  let items, uid, n, f, fresh, squished;
  const mk = (kind, label, size, count) => ({ id: ++uid, kind, label, size, count });
  const reset = () => {
    uid = 0; n = 0; f = 0; fresh = null; squished = null;
    items = [mk('sys', 'System prompt', 3), mk('user', 'Fix the login bug', 2), mk('ai', 'Reading auth.py…', 3), mk('file', 'auth.py (pasted file)', 6), mk('ai', 'Found it: off-by-one in token check', 3)];
    note('The bucket holds 24k tokens. As it fills, items in the middle fade: the model pays them less attention. Add messages until it overflows.');
  };
  box.innerHTML = `<div class="ctx-wrap">
      <div><p class="vlabel">Context window</p><div class="bucket" id="cx-b" aria-label="Context window contents"></div></div>
      <div class="ctx-side">
        <div><p class="vstats" id="cx-used" style="margin:0"></p><div class="meter"><span id="cx-meter"></span></div>
          <p class="vstats" id="cx-focus-l" style="margin:8px 0 0"></p><div class="meter"><span id="cx-focus"></span></div></div>
        <div class="vbtns" style="margin:0"><button class="btn" id="cx-msg">Add a message</button><button class="btn ghost" id="cx-file">Paste a big file</button></div>
        <fieldset class="radio-row"><legend>When the bucket is full</legend>
          <label><input type="radio" name="cx-mode" value="drop" checked> Drop the oldest</label>
          <label><input type="radio" name="cx-mode" value="compact"> Compact into a summary</label>
        </fieldset>
        <p class="cx-note" id="cx-note" aria-live="polite"></p>
        <div><button class="btn ghost" id="cx-reset">Reset</button></div>
        <div class="legend"><span><i style="background:var(--accent-soft);outline:1.5px solid var(--accent)"></i>System</span><span><i style="background:var(--c1)"></i>You</span><span><i style="background:var(--c3)"></i>Model</span><span><i style="background:var(--c5)"></i>File</span><span><i style="background:var(--violet-soft);outline:1.5px dashed var(--violet)"></i>Summary</span><span><i style="background:var(--c1);opacity:.4"></i>Faded = less attention</span></div>
      </div></div>`;
  const note = t => { $('#cx-note', box).textContent = t; };
  const used = () => items.reduce((a, b) => a + b.size, 0);
  const render = () => {
    const fill = used() / CAP;
    const faint = i => fill > .6 && i > 0 && i < items.length - 2 && items[i].kind !== 'summary';
    $('#cx-b', box).innerHTML = items.map((it, i) => `<div class="blk k-${it.kind}${it.id === fresh ? ' in' : ''}${it.id === squished ? ' squish' : ''}${faint(i) ? ' faint' : ''}" style="height:calc(${it.size / CAP * 100}% - 3px)"><span>${esc(it.label)}</span><em>${it.size}k</em></div>`).join('');
    const u = used();
    $('#cx-used', box).textContent = `${u}k of ${CAP}k tokens used`;
    const m = $('#cx-meter', box); m.style.width = (u / CAP * 100) + '%'; m.classList.toggle('hot', u / CAP > .8);
    const focus = Math.round(fill <= .5 ? 100 : 100 - (fill - .5) * 2 * 55);
    $('#cx-focus-l', box).textContent = `Model focus: ${focus}%`;
    const fm = $('#cx-focus', box); fm.style.width = focus + '%'; fm.classList.toggle('hot', focus < 70);
    fresh = squished = null;
  };
  const add = (kind, label, size) => {
    const mode = $('input[name="cx-mode"]:checked', box).value;
    let u = used();
    if (u + size > CAP && mode === 'compact') {
      const need = u + size - CAP;
      const taken = []; let freed = 0;
      for (const it of items) { if (it.kind === 'sys') continue; if (freed - 2 >= need) break; taken.push(it); freed += it.size; }
      if (freed - 2 >= need) {
        const count = taken.reduce((a, t) => a + (t.count || 1), 0);
        items = items.filter(it => !taken.includes(it));
        const s = mk('summary', `Summary of ${count} earlier items`, 2, count);
        items.splice(1, 0, s); squished = s.id;
        note(`Bucket full. Compacted ${taken.length} items into a short summary. The gist survives; the details are gone.`);
      }
    }
    u = used();
    if (u + size > CAP) {
      let dropped = 0;
      while (used() + size > CAP) { const i = items.findIndex(it => it.kind !== 'sys'); if (i < 0) break; items.splice(i, 1); dropped++; }
      note(`Bucket full. Dropped the ${dropped} oldest item${dropped > 1 ? 's' : ''}. The model can't see ${dropped > 1 ? 'them' : 'it'} anymore. Notice the system prompt stays pinned.`);
    } else if (u + size + 4 > CAP) note('Almost full. The next big item will push something out, and the faded middle is already getting less attention.');
    else if ((u + size) / CAP > .6) note("Not full yet, but focus is already slipping. The faded items in the middle get less attention. That's context rot.");
    const it = mk(kind, label, size); items.push(it); fresh = it.id;
    render();
  };
  $('#cx-msg', box).onclick = () => { const user = n % 2 === 0; const arr = user ? USER : AI; add(user ? 'user' : 'ai', arr[Math.floor(n / 2) % arr.length], user ? 2 : 3); n++; };
  $('#cx-file', box).onclick = () => { add('file', FILES[f++ % FILES.length], 7); };
  $('#cx-reset', box).onclick = () => { reset(); render(); };
  reset(); render();
};

VIZ.confusion = box => {
  const X0 = 52, X1 = 404, Y0 = 18, Y1 = 178;
  const sx = t => X0 + t * (X1 - X0), sy = v => Y1 - v / 100 * (Y1 - Y0);
  const recall = (t, L) => (97 - 12 * L) - (4 + 45 * L * L) * 4 * t * (1 - t);
  const POS = { start: [0.04, 'the start'], middle: [0.5, 'the middle'], end: [0.96, 'the end'] };
  let pos = 'middle';
  box.innerHTML = `<p class="vlabel">Where should the key instruction go?</p>
    <svg class="cf-chart" viewBox="0 0 420 222" role="img" aria-label="Chance the model follows an instruction, by its position in the context">
      ${[0, 50, 100].map(v => `<line class="gl" x1="${X0}" x2="${X1}" y1="${sy(v)}" y2="${sy(v)}"/><text class="ax" x="${X0 - 8}" y="${sy(v) + 4}" text-anchor="end">${v}%</text>`).join('')}
      <path class="area" id="cf-area"/><path class="curve" id="cf-curve"/>
      <line class="mk-line" id="cf-mkl"/><circle class="mk" id="cf-mk" r="7"/>
      <text class="mk-label" id="cf-mkt" text-anchor="middle"></text>
      <text class="ax" x="${X0}" y="198">Start of context</text>
      <text class="ax" x="${(X0 + X1) / 2}" y="198" text-anchor="middle">Middle</text>
      <text class="ax" x="${X1}" y="198" text-anchor="end">End (newest)</text>
      <text class="ax" x="${(X0 + X1) / 2}" y="216" text-anchor="middle">Where the instruction sits in the context</text>
    </svg>
    <div class="slider-row" style="margin-top:6px"><label for="cf-fill">How full is the window?</label><input type="range" id="cf-fill" min="10" max="100" step="5" value="70" style="accent-color:var(--accent)"><output id="cf-fill-v" for="cf-fill">70%</output></div>
    <div class="vbtns"><span class="hint">Put the instruction at:</span><div class="seg" role="group" aria-label="Instruction position">${Object.keys(POS).map(k => `<button data-pos="${k}" aria-pressed="${k === pos}">${k[0].toUpperCase() + k.slice(1)}</button>`).join('')}</div></div>
    <p class="cf-read" id="cf-read" aria-live="polite"></p>
    <p class="vnote">Illustrative numbers. The U shape follows "Lost in the Middle" (Liu et al., 2023), and the curve sinking as the window fills follows Chroma's "Context Rot" study (2025). Exact numbers vary by model and task.</p>`;
  const sl = $('#cf-fill', box);
  const draw = () => {
    const L = +sl.value / 100;
    $('#cf-fill-v', box).textContent = sl.value + '%';
    const pts = Array.from({ length: 41 }, (_, i) => { const t = i / 40; return [sx(t), sy(recall(t, L))]; });
    const d = 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
    $('#cf-curve', box).setAttribute('d', d);
    $('#cf-area', box).setAttribute('d', d + ` L${X1} ${Y1} L${X0} ${Y1} Z`);
    const [t, name] = POS[pos], v = recall(t, L), x = sx(t), y = sy(v);
    const mk = $('#cf-mk', box); mk.setAttribute('cx', x); mk.setAttribute('cy', y);
    const ml = $('#cf-mkl', box); ml.setAttribute('x1', x); ml.setAttribute('x2', x); ml.setAttribute('y1', y); ml.setAttribute('y2', Y1);
    const mt = $('#cf-mkt', box); mt.setAttribute('x', Math.min(Math.max(x, X0 + 20), X1 - 20)); mt.setAttribute('y', y - 14); mt.textContent = Math.round(v) + '%';
    const verdict = v >= 85 ? 'Reliable.' : v >= 65 ? 'Getting shaky.' : 'Often missed.';
    $('#cf-read', box).innerHTML = `Instruction at ${name}, window ${sl.value}% full: the model follows it about <b>${Math.round(v)}%</b> of the time. ${verdict}`;
    $$('[data-pos]', box).forEach(b => b.setAttribute('aria-pressed', b.dataset.pos === pos));
  };
  $$('[data-pos]', box).forEach(b => b.onclick = () => { pos = b.dataset.pos; draw(); });
  sl.addEventListener('input', draw);
  draw();
};

VIZ.agent = box => {
  const S = [
    ['think', 'I need to see the error first.'], ['act', 'run_tests()'], ['observe', '1 failed: expected 0.0625, got 0.0725'],
    ['think', 'Find where the tax rate is set.'], ['act', 'grep "TAX_RATE"'], ['observe', 'billing.py:42  TAX_RATE = 0.0725'],
    ['think', "That's a typo. Fix the constant."], ['act', 'edit billing.py:42 → 0.0625'], ['observe', 'File saved'],
    ['think', 'Check that the fix works.'], ['act', 'run_tests()'], ['observe', '18 passed, 0 failed'],
    ['done', 'Goal met. Stop looping and report back.'],
  ];
  const ANG = { think: 0, act: 120, observe: 240 };
  const pos = a => [130 + 90 * Math.sin(a * Math.PI / 180), 130 - 90 * Math.cos(a * Math.PI / 180)];
  box.innerHTML = `<p class="vgoal">Task given to the agent: <strong>“Fix the failing test.”</strong></p>
    <div class="loop-wrap">
      <svg class="loop-svg" viewBox="0 0 260 260" aria-hidden="true">
        <circle class="ring" cx="130" cy="130" r="90"/>
        ${Object.entries(ANG).map(([k, a]) => { const [x, y] = pos(a); return `<g class="lnode" data-p="${k}"><circle cx="${x}" cy="${y}" r="34"/><text x="${x}" y="${y + 5}">${k[0].toUpperCase() + k.slice(1)}</text></g>`; }).join('')}
        <g id="ag-dot" style="transform-box:view-box;transform-origin:130px 130px;transition:transform .7s ease-in-out"><circle cx="130" cy="40" r="8" fill="var(--model)" transform="translate(0,-44)"/></g>
        <text class="center" x="130" y="126" id="ag-iter">4 laps</text>
        <text class="center" x="130" y="144">around the loop</text>
      </svg>
      <ol class="loop-log">${S.map(([p, t]) => `<li data-p="${p}"><span class="ph ph-${p}">${p}</span><span class="${p === 'act' ? 't-act' : ''}">${esc(t)}</span></li>`).join('')}</ol>
    </div>
    <div class="vbtns"><button class="btn" id="ag-play">Run the loop</button><span class="hint">Each lap: think, use a tool, look at the result.</span></div>`;
  const dot = $('#ag-dot', box), lis = $$('.loop-log li', box), nodes = $$('.lnode', box), btn = $('#ag-play', box);
  let rot = 0;
  btn.onclick = async () => {
    btn.disabled = true; lis.forEach(l => { l.classList.add('dim'); l.classList.remove('cur'); });
    for (let i = 0; i < S.length; i++) {
      const p = S[i][0];
      lis.forEach(l => l.classList.remove('cur')); lis[i].classList.remove('dim'); lis[i].classList.add('cur');
      nodes.forEach(nd => nd.classList.toggle('on', nd.dataset.p === p));
      $('#ag-iter', box).textContent = p === 'done' ? 'done' : `lap ${Math.floor(i / 3) + 1}`;
      if (p !== 'done') { let target = ANG[p]; while (target < rot || (target === rot && i > 0)) target += 360; rot = target; dot.style.transform = `rotate(${rot}deg)`; }
      await wait(1000);
    }
    nodes.forEach(nd => nd.classList.remove('on'));
    $('#ag-iter', box).textContent = '4 laps';
    btn.disabled = false; btn.textContent = 'Run it again';
  };
};

VIZ.harness = box => {
  const M = [
    ['loop', 'Agent loop', 220, 34, 'Calls the model again and again, feeding back tool results, until the task is done.'],
    ['tools', 'Tools', 368, 100, 'Real actions: read and edit files, run commands, search the web, call MCP servers.'],
    ['perm', 'Permissions', 368, 214, 'The brakes. Asks you before risky actions and blocks others outright.'],
    ['ctx', 'Context manager', 220, 276, 'Decides what is in the context window: trims, compacts, and loads files just in time.'],
    ['mem', 'Memory', 72, 214, 'Notes that survive between sessions, like a CLAUDE.md file with your project rules.'],
    ['skills', 'Skills', 72, 100, 'Packaged instructions the agent pulls out only when a task needs them.'],
  ];
  box.innerHTML = `<p class="vlabel">Click a part of the harness</p>
    <svg class="hz" viewBox="0 0 440 310" role="group" aria-label="The harness surrounding the model">
      <rect class="shell" x="6" y="6" width="428" height="298" rx="22"/>
      ${M.map(m => `<line class="spoke" x1="220" y1="155" x2="${m[2]}" y2="${m[3]}"/>`).join('')}
      <g class="core"><circle cx="220" cy="155" r="54"/><text x="220" y="152" font-size="16">Model</text><text x="220" y="172" font-size="12" font-weight="400">text in, text out</text></g>
      ${M.map(m => `<g class="mod" data-k="${m[0]}" tabindex="0" role="button" aria-label="${m[1]}"><rect x="${m[2] - 62}" y="${m[3] - 20}" width="124" height="40" rx="9"/><text x="${m[2]}" y="${m[3] + 5}">${m[1]}</text></g>`).join('')}
    </svg>
    <p class="hz-info" id="hz-info" aria-live="polite"></p>
    <div class="vbtns"><button class="btn ghost" id="hz-strip">Remove the harness</button></div>`;
  const svg = $('.hz', box), info = $('#hz-info', box);
  const pick = k => { const m = M.find(x => x[0] === k); $$('.mod', box).forEach(g => g.classList.toggle('sel', g.dataset.k === k)); info.innerHTML = `<b>${m[1]}.</b> ${esc(m[4])}`; };
  $$('.mod', box).forEach(g => {
    g.addEventListener('click', () => pick(g.dataset.k));
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(g.dataset.k); } });
  });
  let stripped = false;
  $('#hz-strip', box).onclick = e => {
    stripped = !stripped; svg.classList.toggle('stripped', stripped);
    e.target.textContent = stripped ? 'Put the harness back' : 'Remove the harness';
    if (stripped) info.innerHTML = `<b>Model alone.</b> It can only reply with text. It can't run code, open files, remember yesterday, or stop itself from suggesting something risky.`;
    else pick('loop');
  };
  pick('loop');
};

VIZ.tools = box => {
  const L = ['You', 'Your app', 'Model', 'Weather API'];
  const R = [
    [0, 1, 'What should I wear in Gunnison today?'],
    [1, 2, 'your question + tool menu: get_weather(city)'],
    [2, 1, 'tool_use: get_weather({"city": "Gunnison"})', 1],
    [1, 3, 'GET /weather?city=Gunnison'],
    [3, 1, '{"temp_f": 28, "snow": true}'],
    [1, 2, 'tool_result: 28°F, snowing', 1],
    [2, 1, "It's 28°F and snowing. Wear a heavy coat."],
    [1, 0, 'Shows you the answer'],
  ];
  box.innerHTML = `<div class="scroll-x"><div class="seq">
      <div class="seq-head">${L.map(l => `<div>${l}</div>`).join('')}</div>
      ${R.map(([a, b, t, tool]) => { const lo = Math.min(a, b), hi = Math.max(a, b), n = hi - lo + 1;
        return `<div class="seq-row">${L.map(() => '<div class="lane" style="grid-row:1"></div>').join('')}<div class="arrow ${b > a ? 'r' : 'l'}${tool ? ' tool' : ''}" style="grid-column:${lo + 1}/${hi + 2};margin-left:calc(100% / ${2 * n});margin-right:calc(100% / ${2 * n})"><span>${esc(t)}</span></div></div>`; }).join('')}
    </div></div>
    <div class="vbtns"><button class="btn" id="tu-play">Replay step by step</button><span class="hint">Orange arrows are the tool call and its result.</span></div>`;
  const rows = $$('.seq-row', box), btn = $('#tu-play', box);
  btn.onclick = async () => {
    btn.disabled = true; rows.forEach(r => r.classList.add('hide'));
    for (const r of rows) { await wait(750); r.classList.remove('hide'); }
    btn.disabled = false;
  };
};

VIZ.mcp = box => {
  const S = [
    ['GitHub', ['create_issue', 'list_pull_requests']], ['Postgres', ['run_query', 'list_tables']], ['Google Drive', ['search_files', 'read_file']],
    ['Slack', ['post_message', 'search_messages']], ['Weather', ['get_forecast']],
  ];
  const on = new Set([0, 1]);
  box.innerHTML = `<p class="vlabel">Click servers to plug them in or unplug them</p>
    <svg class="mcp" viewBox="0 0 460 262" role="group" aria-label="MCP servers connecting to an AI app">
      <path class="link on" d="M134 131 H200"/>
      ${S.map((s, i) => `<path class="link" id="mcp-l${i}" d="M260 131 C 295 131, 295 ${35 + i * 48}, 330 ${35 + i * 48}"/>`).join('')}
      <rect class="box app" x="14" y="96" width="120" height="70" rx="10"/>
      <text x="74" y="126" text-anchor="middle" font-weight="700">AI app</text><text x="74" y="146" text-anchor="middle" class="plug">MCP client</text>
      <circle class="hub" cx="230" cy="131" r="30"/><text class="hubt" x="230" y="136">MCP</text>
      ${S.map((s, i) => `<g class="srv" data-i="${i}" tabindex="0" role="button" aria-label="${s[0]} server"><rect class="box" x="330" y="${18 + i * 48}" width="120" height="34" rx="8"/><text x="344" y="${40 + i * 48}">${s[0]}</text><text class="plug" x="436" y="${40 + i * 48}" text-anchor="end"></text></g>`).join('')}
    </svg>
    <p class="vlabel" style="margin-top:12px">Tools the model can use right now</p>
    <div class="tool-chips" id="mcp-tools" aria-live="polite"></div>
    <p class="vnote">The app didn't need new code for any of these. Each server describes its own tools.</p>`;
  const render = () => {
    S.forEach((s, i) => { $('#mcp-l' + i, box).classList.toggle('on', on.has(i)); const g = $(`.srv[data-i="${i}"]`, box); g.classList.toggle('on', on.has(i)); $('.plug', g).textContent = on.has(i) ? 'on' : 'off'; });
    const tools = [...on].sort().flatMap(i => S[i][1]);
    $('#mcp-tools', box).innerHTML = tools.length ? tools.map(t => `<span>${t}</span>`).join('') : '<span style="background:none;color:var(--muted)">None. Plug a server in.</span>';
  };
  $$('.srv', box).forEach(g => {
    const t = () => { const i = +g.dataset.i; on.has(i) ? on.delete(i) : on.add(i); render(); };
    g.addEventListener('click', t);
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t(); } });
  });
  render();
};

VIZ.rag = box => {
  const ST = [
    ['Question', `<p>“Can I get a refund on my annual plan after 45 days?”</p>`],
    ['Embed it', `<p class="mono">[0.21, -0.07, 0.88, 0.03, …]</p><p>The question becomes a vector.</p>`],
    ['Search', `<p>Compare it to 1,240 stored chunks of your help docs and find the closest.</p>`],
    ['Top 3 matches', `<div class="hit"><span>refunds.md §2</span><b>0.91</b></div><div class="hit"><span>billing-faq.md</span><b>0.84</b></div><div class="hit"><span>terms.md §9</span><b>0.79</b></div>`],
    ['Build the prompt', `<p>Rules (“answer only from these sources”) + the 3 chunks + the question.</p>`],
    ['Answer', `<p>Yes. Annual plans get a prorated refund within 60 days, so day 45 qualifies. <span class="mono">[refunds.md §2]</span></p>`],
  ];
  box.innerHTML = `<div class="rag">${ST.map(([h, b], i) => `<div class="stage${i === ST.length - 1 ? ' final' : ''}"><h4><i>${i + 1}</i>${h}</h4>${b}</div>`).join('')}</div>
    <div class="vbtns"><button class="btn" id="rag-play">Run the pipeline</button><span class="hint">Steps 2 to 5 happen in about a second.</span></div>`;
  const st = $$('.stage', box), btn = $('#rag-play', box);
  btn.onclick = async () => {
    btn.disabled = true; st.forEach(s => { s.classList.add('dim'); s.classList.remove('cur'); });
    for (const s of st) { st.forEach(x => x.classList.remove('cur')); s.classList.remove('dim'); s.classList.add('cur'); await wait(850); }
    st.forEach(x => x.classList.remove('cur')); btn.disabled = false;
  };
};

VIZ.subagents = box => {
  const W = [
    ['Check the login code', 71, '2 issues: no rate limit on /login; tokens never expire.'],
    ['Check database queries', 84, '1 issue: query built from raw strings in reports.py:88.'],
    ['Check dependencies', 58, '3 packages have known vulnerabilities. Upgrade list ready.'],
  ];
  box.innerHTML = `<div class="orch"><b>Main agent</b>: “Audit this codebase for security problems.”
      <div class="cbar" style="margin-top:8px"><span id="sa-main" style="width:18%"></span></div><p class="cbar-l" id="sa-main-l">main context 18% full: just the task + 3 short summaries</p></div>
    <div class="workers">${W.map(([t, u, r], i) => `<div class="worker"><b>Subagent ${i + 1}</b><span>${t}</span>
      <div class="cbar"><span style="width:${u}%"></span></div><span class="cbar-l">own context ${u}% full</span>
      <div class="result">${esc(r)}</div></div>`).join('')}</div>
    <div class="vbtns"><button class="btn" id="sa-play">Send out the subagents</button></div>
    <p class="vnote">The subagents read thousands of lines. The main agent only receives their three-line summaries, so its own context stays clean.</p>`;
  const btn = $('#sa-play', box);
  btn.onclick = async () => {
    btn.disabled = true;
    const bars = $$('.worker .cbar span', box), res = $$('.result', box), main = $('#sa-main', box), ml = $('#sa-main-l', box);
    bars.forEach(b => b.style.width = '0%'); res.forEach(r => r.classList.add('hide')); main.style.width = '6%'; ml.textContent = 'main context 6% full: just the task';
    await wait(300);
    bars.forEach((b, i) => b.style.width = W[i][1] + '%');
    await wait(1400);
    for (let i = 0; i < res.length; i++) { res[i].classList.remove('hide'); main.style.width = (6 + 4 * (i + 1)) + '%'; ml.textContent = `main context ${6 + 4 * (i + 1)}% full: task + ${i + 1} summar${i ? 'ies' : 'y'}`; await wait(600); }
    btn.disabled = false;
  };
};

VIZ.caching = box => {
  box.innerHTML = `<div class="race">
      <div class="race-row miss"><p>Request 1: cache miss <span id="c1-t">about 2.4 s to the first word</span></p>
        <div class="rtrack"><div class="seg-a"><i></i><span>System prompt + 80-page manual (processed)</span></div><div class="seg-b"><i></i><span>Question</span></div></div></div>
      <div class="race-row hit-row"><p>Request 2: cache hit <span id="c2-t">about 0.5 s to the first word</span></p>
        <div class="rtrack"><div class="seg-a"><i></i><span>Same prefix: read from cache</span></div><div class="seg-b"><i></i><span>New question</span></div></div></div>
    </div>
    <div class="vbtns"><button class="btn" id="c-play">Race them</button><span class="hint">Illustrative timings.</span></div>
    <p class="vnote">The cached part must match exactly, word for word, from the very beginning. Change one character early on and everything after it is processed again.</p>`;
  const btn = $('#c-play', box);
  const fill = (el, ms) => { el.style.transition = 'none'; el.style.width = '0%'; void el.offsetWidth; el.style.transition = RM ? 'none' : `width ${ms}ms linear`; el.style.width = '100%'; };
  btn.onclick = async () => {
    btn.disabled = true;
    const [a1, b1, a2, b2] = $$('.rtrack i', box);
    [a1, b1, a2, b2].forEach(e => { e.style.transition = 'none'; e.style.width = '0%'; });
    await wait(200);
    fill(a1, 2000); fill(a2, 150);
    await wait(150); fill(b2, 350);
    await wait(1850); fill(b1, 350);
    await wait(400); btn.disabled = false;
  };
};

VIZ.finetune = box => {
  const Q = {
    q1: ['Is the problem that the model is missing facts (your documents, today\'s data)?', ['r_rag', 'q2']],
    q2: ['Can you describe what you want in instructions and a few examples?', ['r_prompt', 'q3']],
    q3: ['Do you have hundreds of high-quality examples for a task that won\'t change much?', ['r_ft', 'r_collect']],
  };
  const RES = {
    r_rag: ['Use RAG or tools', 'Fine-tuning is a poor way to teach facts. Retrieve them at question time so they stay current.', 'rag'],
    r_prompt: ['Prompting is enough', 'Write a clear system prompt and add a few examples. Cheapest, fastest to change.', 'fewshot'],
    r_ft: ['Fine-tuning can pay off', 'Especially for consistent style or format at high volume, or to let a smaller, cheaper model do the job.', 'finetune'],
    r_collect: ['Keep prompting for now', 'Start collecting good examples (and build evals) while you use prompts. Revisit later.', 'evals'],
  };
  box.innerHTML = `<div class="decide" aria-live="polite"><div class="trail" id="ft-trail"></div><div id="ft-body"></div></div>`;
  let trail = [];
  const show = k => {
    $('#ft-trail', box).innerHTML = trail.length ? trail.map(t => `<span>${esc(t)}</span>`).join('') : '<span>Answer a few questions</span>';
    if (Q[k]) {
      $('#ft-body', box).innerHTML = `<p class="dq">${esc(Q[k][0])}</p><div class="vbtns"><button class="btn" data-a="0">Yes</button><button class="btn ghost" data-a="1">No</button></div>`;
      $$('[data-a]', box).forEach(b => b.onclick = () => { trail.push((b.dataset.a === '0' ? 'Yes: ' : 'No: ') + Q[k][0].split(' (')[0].replace(/\?$/, '').slice(0, 42) + '…'); show(Q[k][1][+b.dataset.a]); });
    } else {
      const r = RES[k];
      $('#ft-body', box).innerHTML = `<div class="verdict"><b>${r[0]}</b>${esc(r[1])}</div><div class="vbtns"><button class="btn ghost" id="ft-reset">Start over</button><button class="btn ghost" data-go="${r[2]}">Read about ${esc(byId[r[2]].term.replace(/ \(.*\)/, ''))}</button></div>`;
      $('#ft-reset', box).onclick = () => { trail = []; show('q1'); };
    }
  };
  show('q1');
};

VIZ.spot = box => {
  const C = [
    ['Use datetime.strptime() from the standard library, passing the string and a format code.', false, 'Real. This is the standard way to parse a date string.'],
    ['For "2026-10-22" the format is "%Y-%m-%d".', false, 'Real. Year, month, day.'],
    ['Since Python 3.12 you can also call datetime.parse_any(), which detects the format for you.', true, 'Made up. There is no parse_any(). It borrows the naming style of real functions, which is why it sounds right.'],
    ['date.fromisoformat("2026-10-22") also works, because that string is already in ISO format.', false, 'Real. fromisoformat() has been in Python since 3.7.'],
    ['It\'s the most common approach, used in about 94% of Python projects according to the 2025 PyPI survey.', true, 'Made up. A precise-sounding statistic from a survey that doesn\'t exist.'],
    ['Full details are in the official guide at docs.python.org/3/howto/dates.html.', true, 'Made up. The domain is real but that page isn\'t. Invented links often look exactly like real ones.'],
  ];
  box.innerHTML = `<div style="display:flex;flex-direction:column">
      <p class="spot-q">How do I turn the string "2026-10-22" into a date in Python?</p>
      <div class="spot-a">${C.map((c, i) => `<button class="claim" data-i="${i}" aria-pressed="false">${esc(c[0])}</button>`).join(' ')}</div>
    </div>
    <div class="vbtns"><button class="btn" id="sp-check">Check my answers</button><button class="btn ghost" id="sp-reset">Try again</button><span class="hint" id="sp-hint">Click a sentence to flag it as fake.</span></div>
    <div class="spot-out" id="sp-out" aria-live="polite"></div>`;
  const claims = $$('.claim', box);
  let checked = false;
  claims.forEach(b => b.onclick = () => {
    if (checked) return;
    const f = !b.classList.contains('flag'); b.classList.toggle('flag', f); b.setAttribute('aria-pressed', f);
    $('#sp-hint', box).textContent = `${claims.filter(c => c.classList.contains('flag')).length} flagged`;
  });
  $('#sp-check', box).onclick = () => {
    checked = true;
    let caught = 0, false_alarms = 0;
    claims.forEach((b, i) => { const flagged = b.classList.contains('flag'); b.classList.remove('flag'); b.classList.add(C[i][1] ? 'fake' : 'real'); if (flagged && C[i][1]) caught++; if (flagged && !C[i][1]) false_alarms++; });
    const missed = 3 - caught;
    $('#sp-out', box).innerHTML = `<p><b>You caught ${caught} of 3 made-up claims${false_alarms ? `, with ${false_alarms} false alarm${false_alarms > 1 ? 's' : ''}` : ''}.</b> ${missed ? 'The ones you missed are in red.' : 'Nice work.'} Green is real, red is invented.</p>` +
      C.filter(c => c[1]).map(c => `<p>✕ ${esc(c[2])}</p>`).join('') +
      `<p>The lesson: you can't tell by reading. Check every function, number and link against a real source.</p>`;
    $('#sp-hint', box).textContent = '';
  };
  $('#sp-reset', box).onclick = () => {
    checked = false;
    claims.forEach(b => { b.classList.remove('flag', 'real', 'fake'); b.setAttribute('aria-pressed', 'false'); });
    $('#sp-out', box).innerHTML = ''; $('#sp-hint', box).textContent = 'Click a sentence to flag it as fake.';
  };
};


VIZ.playground = box => {
  const PRESETS = [
    ['Vague', 'write a poem'],
    ['Getting there', 'write a funny poem about mondays'],
    ['Great', 'Write a 4-line rhyming poem about Gunnison winters for my book club. We are all tired of shoveling snow, so keep it silly and kind, like a greeting card.'],
    ['Typos welcome', 'can u writ a funy poem abuot my dog biscut for my kids, like a short rhyming one'],
  ];
  const ING = [
    ['goal', 'Goal', 'what you want done'],
    ['context', 'Context', 'why, or what it’s for'],
    ['audience', 'Audience', 'who it’s for'],
    ['format', 'Format', 'shape or length'],
    ['constraints', 'Constraints', 'tone, limits, must-nots'],
    ['example', 'Example', 'what good looks like'],
  ];
  const KW = {
    goal: ['write', 'make', 'create', 'draft', 'summarize', 'summarise', 'explain', 'plan', 'list', 'give', 'help', 'suggest', 'translate', 'fix', 'rewrite', 'compare', 'brainstorm', 'design', 'generate', 'tell', 'describe', 'teach', 'review', 'edit', 'build', 'find', 'recommend', 'outline', 'convert', 'name', 'come'],
    audience: ['kids', 'kid', 'child', 'children', 'boss', 'beginner', 'beginners', 'audience', 'readers', 'student', 'students', 'team', 'customer', 'customers', 'client', 'clients', 'grandma', 'grandpa', 'mom', 'dad', 'coworker', 'coworkers', 'manager', 'teacher', 'class', 'friend', 'friends', 'parents', 'neighbors', 'guests', 'club', 'family', 'toddler', 'teenager', 'teens', 'wife', 'husband', 'partner', 'kiddos'],
    format: ['list', 'bullet', 'bullets', 'table', 'email', 'paragraph', 'paragraphs', 'sentence', 'sentences', 'words', 'steps', 'outline', 'haiku', 'limerick', 'json', 'csv', 'headline', 'title', 'tweet', 'slide', 'slides', 'checklist', 'numbered', 'short', 'lines', 'line', 'stanza', 'rhyming', 'rhyme', 'song', 'letter', 'card', 'brief', 'page'],
    constraints: ['under', 'less', 'most', 'only', 'avoid', 'without', 'must', 'never', 'keep', 'tone', 'funny', 'funy', 'serious', 'formal', 'casual', 'friendly', 'silly', 'professional', 'simple', 'kind', 'gentle', 'upbeat', 'polite', 'shorter', 'exactly', 'no'],
    example: ['like', 'example', 'such', 'similar', 'style', 'e.g', 'eg'],
  };
  const CONTEXT_RE = /\b(because|bc|since|so that|for my|for our|i'?m|i am|we'?re|we are|my|our|we|context|background|trying to|it'?s for|the goal|already|currently|tired|need)\b/;
  const lev = (a, b) => {
    if (Math.abs(a.length - b.length) > 1) return 2;
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  };
  const fuzzy = (words, list) => words.some(w => list.some(k => w === k || (k.length >= 4 && w.length >= 4 && lev(w, k) <= 1)));
  const analyze = text => {
    const t = text.toLowerCase(), words = t.match(/[a-z'.]+/g) || [];
    const has = {
      goal: fuzzy(words.slice(0, 6), KW.goal) || /\?$/.test(t.trim()),
      context: CONTEXT_RE.test(t),
      audience: fuzzy(words, KW.audience),
      format: fuzzy(words, KW.format) || /\b\d+\s*(-\s*)?(line|word|sentence|bullet|item|step|paragraph)/.test(t),
      constraints: fuzzy(words, KW.constraints) || /\b\d+\b/.test(t) || /don'?t|do not/.test(t),
      example: fuzzy(words, KW.example),
    };
    const kind = /poe?m|haiku|limerick|rhym|song/.test(t) ? 'poem' : /e-?m(a|ia|ai)i?le?|letter|\bnote\b/.test(t) ? 'email' : /\bideas?\b|\bnames?\b|\blist\b/.test(t) ? 'list' : /stor(y|ies)/.test(t) ? 'story' : 'other';
    let topic = '';
    const m = text.match(/\b(?:about|abuot|abt|on)\s+(?:my |our |a |an |the )?([a-z' ]{2,32}?)(?=\s*(?:[.,!?]|$|\s(?:for|that|in|with|to|and|so|because|bc|using|like|make|keep)\b))/i);
    if (m) topic = m[1].trim();
    const score = Object.values(has).filter(Boolean).length;
    return { has, kind, topic, score };
  };
  const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
  const respond = (a, raw) => {
    const T = a.topic || 'stuff';
    const missing = ING.filter(([k]) => !a.has[k]).map(([, n]) => n.toLowerCase());
    if (!raw.trim()) return ['', 'Type something. Anything. Typos included.'];
    if (a.score <= 1) {
      const body = a.kind === 'poem'
        ? `Roses are red.\nThings are things.\nThis is a poem.\nThe end.`
        : `Sure! Here is a response about ${a.topic ? T : 'the thing'}.\nIt is a topic. Topics are interesting.\nThere are many factors to consider.\nIn conclusion: things.`;
      return [body, `I had to guess nearly everything (${missing.slice(0, 4).join(', ')}…), so I went with beige.`];
    }
    if (a.score <= 3) {
      const body = a.kind === 'poem'
        ? `${cap(T)} is nice, ${T} is grand,\nthe finest ${T} in all the land.\nI'm not sure who this is for,\nso here's a rhyme and nothing more.`
        : a.kind === 'email' ? `Hi there,\n\nJust reaching out about ${T}. Let me know your thoughts!\n\nBest,\nSomeone`
        : a.kind === 'list' ? `1. ${cap(T)}, but bigger\n2. ${cap(T)}, but smaller\n3. ${cap(T)} 2: The Sequel`
        : `Here's a decent answer about ${T}. It's fine. It's okay. It could be for anyone, which is the problem.`;
      return [body, `Better! I know the topic. Still guessing: ${missing.slice(0, 3).join(', ')}.`];
    }
    const who = (raw.match(/\b(?:for|to) (?:my |our |the )([a-z ]{2,24}?)(?=[.,!]|$|\s(?:about|abuot|so|and|that|like|make|keep|we|taking|asking)\b)/i) || [])[1];
    const body = a.kind === 'poem'
      ? `${cap(T)}, oh ${cap(T)}, you're quite a scene,\n(${who ? `a poem for your ${who}, ` : ''}the best you've ever seen).\nWe laugh, we cheer, we raise a cup:\nyour prompt was great, so I showed up.`
      : a.kind === 'email' ? `Subject: Quick note about ${T}\n\nHi${who ? ' ' + who : ''},\n\nShort version: ${T} is handled, and you don't need to do anything yet. I'll send details Friday.\n\nThanks!`
      : a.kind === 'list' ? `Made just for ${who || 'you'}:\n1. The ${cap(T)} Express\n2. Sir ${cap(T)}-a-lot\n3. ${cap(T)}, Obviously`
      : `Here's exactly what you asked for${who ? `, pitched for ${who}` : ''}: a focused take on ${T}, in the format you wanted, with none of the guesswork.`;
    return [body, missing.length ? `Now we're cooking. You told me what, why and how, so I barely guessed. Want a 6 out of 6? Add: ${missing.join(', ')}.` : `Chef's kiss. Every ingredient is there, so I didn't have to guess at all.`];
  };
  box.innerHTML = `<p class="vlabel">Try a prompt (this is a toy, not a real AI)</p>
    <div class="presets">${PRESETS.map(([n], i) => `<button class="btn ghost" data-p="${i}">${n}</button>`).join('')}</div>
    <label for="pg-in" class="sr-only">Your prompt</label>
    <textarea id="pg-in" rows="3" spellcheck="false"></textarea>
    <div class="ing-row" id="pg-ing">${ING.map(([k, n, d]) => `<span class="ing" data-k="${k}" title="${d}">${n}</span>`).join('')}</div>
    <div class="pg-meter"><span>Prompt power</span><div class="meter"><span id="pg-bar"></span></div><b id="pg-score">0/6</b></div>
    <div class="vbtns"><button class="btn" id="pg-send">Send to the toy model</button><span class="hint">Spelling doesn't count. Try typos on purpose.</span></div>
    <div class="bubble" id="pg-out" aria-live="polite"><pre id="pg-body"></pre><p class="aside" id="pg-aside"></p></div>`;
  const inp = $('#pg-in', box);
  const live = () => {
    const a = analyze(inp.value);
    $$('.ing', box).forEach(e => e.classList.toggle('on', a.has[e.dataset.k]));
    $('#pg-bar', box).style.width = (a.score / 6 * 100) + '%';
    $('#pg-score', box).textContent = `${a.score}/6`;
    return a;
  };
  const send = () => {
    const a = live(), [body, aside] = respond(a, inp.value);
    const out = $('#pg-out', box);
    out.classList.remove('pop'); void out.offsetWidth; out.classList.add('pop');
    out.dataset.tier = a.score <= 1 ? 'low' : a.score <= 3 ? 'mid' : 'high';
    $('#pg-body', box).textContent = body; $('#pg-aside', box).textContent = aside;
  };
  inp.addEventListener('input', live);
  $('#pg-send', box).onclick = send;
  inp.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(); });
  $$('[data-p]', box).forEach(b => b.onclick = () => { inp.value = PRESETS[+b.dataset.p][1]; send(); });
  inp.value = PRESETS[0][1]; send();
};

VIZ.sortgame = box => {
  const ITEMS = [
    ['Write a file to your computer', 'tool', 'It does something, so it’s a tool.'],
    ['A guide for making your team’s monthly report, loaded only when needed', 'skill', 'It explains how to do a job. That’s a skill.'],
    ['Search the web', 'tool', 'An action the agent can take: a tool.'],
    ['The agent loop', 'neither', 'The loop is the process that uses tools, not a tool itself.'],
    ['Run a command in the terminal', 'tool', 'A classic tool. The harness runs it, often after asking your permission.'],
    ['A brand style guide plus slide template, pulled in when making decks', 'skill', 'Know-how and assets for one kind of task: a skill.'],
    ['A GitHub MCP server', 'neither', 'It’s a source of tools. Plugging it in adds tools like create_issue.'],
    ['The temperature setting', 'neither', 'A dial on the model, not an action or a set of instructions.'],
    ['Send a Slack message', 'tool', 'Sends something out into the world, so it’s a tool.'],
  ];
  const L = { tool: 'Tool', skill: 'Skill', neither: 'Neither' };
  let i = 0, score = 0;
  const show = () => {
    if (i >= ITEMS.length) {
      box.innerHTML = `<div class="sg-card done"><p class="sg-k">Final score</p><p class="sg-item">${score} / ${ITEMS.length}</p>
        <p>${score === ITEMS.length ? 'Perfect. You could teach this.' : score >= 6 ? 'Solid. The “neither” ones trip up almost everyone.' : 'Rule of thumb: does it do something? Tool. Explain how? Skill.'}</p>
        <div class="vbtns"><button class="btn" id="sg-again">Play again</button></div></div>`;
      $('#sg-again', box).onclick = () => { i = 0; score = 0; show(); };
      return;
    }
    const [text] = ITEMS[i];
    box.innerHTML = `<p class="vlabel">Tool, skill, or neither? <span class="sg-n">${i + 1} of ${ITEMS.length} · score ${score}</span></p>
      <div class="sg-card"><p class="sg-item">${esc(text)}</p>
      <div class="sg-btns">${Object.entries(L).map(([k, n]) => `<button class="btn ghost" data-a="${k}">${n}</button>`).join('')}</div>
      <p class="sg-why" id="sg-why" aria-live="polite"></p></div>`;
    $$('[data-a]', box).forEach(b => b.onclick = () => {
      const ok = b.dataset.a === ITEMS[i][1]; if (ok) score++;
      $$('[data-a]', box).forEach(x => { x.disabled = true; if (x.dataset.a === ITEMS[i][1]) x.classList.add('right'); });
      if (!ok) b.classList.add('wrong');
      $('#sg-why', box).innerHTML = `<b>${ok ? 'Yes!' : `It’s: ${L[ITEMS[i][1]]}.`}</b> ${esc(ITEMS[i][2])} <button class="btn" id="sg-next">${i === ITEMS.length - 1 ? 'See score' : 'Next'}</button>`;
      $('#sg-next', box).onclick = () => { i++; show(); };
      $('#sg-next', box).focus();
    });
  };
  show();
};

VIZ.vecmath = box => {
  const W = { man: [1.2, 1.0], woman: [1.2, 3.4], boy: [0.4, 1.2], girl: [0.4, 3.2], king: [4.6, 1.3], queen: [4.7, 3.6], prince: [3.8, 0.9], princess: [3.3, 4.2], apple: [2.6, 0.3] };
  const X0 = 30, Y0 = 250, SX = 62, SY = 54;
  const px = ([x, y]) => [X0 + x * SX, Y0 - y * SY];
  const res = [W.king[0] - W.man[0] + W.woman[0], W.king[1] - W.man[1] + W.woman[1]];
  const arrow = (a, b, cls, id) => { const [x1, y1] = px(a), [x2, y2] = px(b); return `<line id="${id}" class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#vm-head)"/>`; };
  box.innerHTML = `<p class="vlabel">king − man + woman = ?</p>
    <svg class="vm" viewBox="0 0 400 270" role="img" aria-label="Vector arithmetic on word embeddings">
      <defs><marker id="vm-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="context-stroke"/></marker></defs>
      <line class="axis" x1="${X0}" y1="${Y0}" x2="390" y2="${Y0}"/><line class="axis" x1="${X0}" y1="${Y0}" x2="${X0}" y2="8"/>
      <text class="ax" x="388" y="${Y0 + 16}" text-anchor="end">“royal” direction →</text>
      <text class="ax" x="${X0 + 6}" y="16">“female” direction ↑</text>
      ${Object.entries(W).map(([w, v]) => { const [x, y] = px(v); return `<g class="vw" data-w="${w}"><circle cx="${x}" cy="${y}" r="5"/><text x="${x + (w === 'queen' ? 14 : 8)}" y="${y + 4}">${w}</text></g>`; }).join('')}
      ${arrow([0, 0], W.king, 'va va1', 'vm-a1')}
      ${arrow(W.king, [W.king[0] - W.man[0], W.king[1] - W.man[1]], 'va va2', 'vm-a2')}
      ${arrow([W.king[0] - W.man[0], W.king[1] - W.man[1]], res, 'va va3', 'vm-a3')}
      <circle id="vm-res" class="vres" cx="${px(res)[0]}" cy="${px(res)[1]}" r="9"/>
    </svg>
    <div class="vm-steps" id="vm-steps">
      <span data-s="1"><b>1</b> start at <code>king</code></span>
      <span data-s="2"><b>2</b> subtract <code>man</code></span>
      <span data-s="3"><b>3</b> add <code>woman</code></span>
      <span data-s="4"><b>4</b> nearest word: <code>queen</code></span>
    </div>
    <div class="vbtns"><button class="btn" id="vm-play">Do the math step by step</button></div>
    <p class="vnote">Real embeddings have hundreds of unlabeled dimensions. We picked two that happen to line up with “royal” and “female” so you can see it.</p>`;
  const els = ['#vm-a1', '#vm-a2', '#vm-a3', '#vm-res'].map(s => $(s, box)), steps = $$('#vm-steps span', box), btn = $('#vm-play', box);
  const set = n => { els.forEach((e, k) => e.classList.toggle('off', k >= n)); steps.forEach((e, k) => e.classList.toggle('on', k < n)); $$('.vw', box).forEach(g => g.classList.toggle('hl', n >= 4 && g.dataset.w === 'queen')); };
  btn.onclick = async () => { btn.disabled = true; for (let n = 0; n <= 4; n++) { set(n); await wait(900); } btn.disabled = false; };
  set(4);
};

VIZ.attention = box => {
  const BASE = ['The', 'animal', "didn't", 'cross', 'the', 'street', 'because', 'it', 'was', 'too'];
  const END = {
    tired: { w: [2, 52, 3, 5, 1, 10, 3, 12, 2, 2, 8], note: 'Tired things are alive, so “it” leans on <b>animal</b>.' },
    wide: { w: [2, 9, 2, 6, 3, 55, 3, 10, 2, 2, 6], note: 'Wide things are places, so “it” leans on <b>street</b>.' },
  };
  let end = 'tired';
  box.innerHTML = `<p class="vlabel">What does “it” refer to?</p>
    <div class="att" id="att"></div>
    <div class="vbtns"><span class="hint">Change the last word:</span><div class="seg" role="group" aria-label="Last word">${Object.keys(END).map(k => `<button data-end="${k}" aria-pressed="${k === end}">too ${k}</button>`).join('')}</div></div>
    <p class="cf-read" id="att-note" aria-live="polite"></p>
    <p class="vnote">Bar height = how much “it” pays attention to each word. Illustrative weights for one attention head; real models have many heads and layers.</p>`;
  const draw = () => {
    const words = [...BASE, end], w = END[end].w, max = Math.max(...w);
    $('#att', box).innerHTML = words.map((t, i) => `<div class="att-col${t === 'it' ? ' me' : ''}"><div class="att-bar"><span style="height:${w[i] / max * 100}%"></span></div><b>${w[i]}%</b><span class="att-w" style="background:color-mix(in srgb, var(--accent) ${Math.round(w[i] / max * 70)}%, transparent)">${esc(t)}</span></div>`).join('');
    $('#att-note', box).innerHTML = END[end].note;
    $$('[data-end]', box).forEach(b => b.setAttribute('aria-pressed', b.dataset.end === end));
  };
  $$('[data-end]', box).forEach(b => b.onclick = () => { end = b.dataset.end; draw(); });
  draw();
};

VIZ.mystery = box => {
  const COLS = 14, ROWS = 8, N = COLS * ROWS;
  let seed = 42; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const vals = Array.from({ length: N }, () => ((rnd() - 0.5) * 2.4).toFixed(2));
  const feature = new Set(Array.from({ length: 14 }, () => Math.floor(rnd() * N)));
  box.innerHTML = `<p class="vlabel">A tiny window into a model’s weights</p>
    <div class="wgrid" id="wgrid" style="grid-template-columns:repeat(${COLS}, minmax(0, 1fr))">${vals.map((v, i) => `<span data-i="${i}" style="--v:${Math.abs(v) / 1.2}">${v}</span>`).join('')}</div>
    <div class="vbtns"><button class="btn" id="mx-find">Find a feature</button><button class="btn ghost" id="mx-clear">Clear</button></div>
    <p class="cf-read" id="mx-note" aria-live="polite">These ${N} numbers are about 0.0000001% of a large model. None of them means anything on its own.</p>
    <p class="vnote">An illustration. Real features are found with special tools that look at millions of activations, not by eye.</p>`;
  const note = $('#mx-note', box), cells = $$('#wgrid span', box);
  $('#mx-find', box).onclick = () => {
    cells.forEach((c, i) => c.classList.toggle('feat', feature.has(+c.dataset.i)));
    note.innerHTML = `Researchers found that patterns spread across many numbers act together as one “feature”, like a <b>Golden Gate Bridge</b> feature. Turn it up, and the model can’t stop talking about the bridge.`;
  };
  $('#mx-clear', box).onclick = () => { cells.forEach(c => c.classList.remove('feat')); note.textContent = `These ${N} numbers are about 0.0000001% of a large model. None of them means anything on its own.`; };
};
