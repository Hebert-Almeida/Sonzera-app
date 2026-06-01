const S = {
  root: 'C',
  acc: 'natural',
  octave: 4,
  scale: 'Maior (Jônico)',
  scaleCat: 'Todas',
  tuning: 'Padrão (E)',
  activeTab: 'intervals',
  composer: [],
  composerBpm: 90,
  speed: 1,
  soloOn: false,
  soloScale: 'Pentatônica Menor',
};

function isFlat() { return S.acc === 'flat'; }

function render() {
  const flat = isFlat();
  const rd = document.getElementById('rootDisplay');
  rd.textContent = '';
  rd.appendChild(document.createTextNode(fmt(S.root)));
  const small = document.createElement('small');
  small.textContent = `— nota raiz · oitava ${S.octave}`;
  rd.appendChild(small);

  renderIntervals(flat);
  renderPiano(flat);

  switch (S.activeTab) {
    case 'scales': renderScaleTab(); break;
    case 'chords': renderChords(flat); break;
    case 'progressions': renderProgressions(); break;
    case 'guitar': renderGuitar(); break;
    case 'circle': renderCircle(); renderKeySig(); break;
    case 'campo': renderCampo(); break;
    case 'composer': renderComposerPalette(); renderComposerTimeline(); break;
  }
}

function buildNoteGrid() {
  const grid = document.getElementById('noteGrid');
  grid.innerHTML = '';
  const groups = [
    { label: 'Naturais', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
    { label: 'Sustenidos ♯', notes: ['C#', 'D#', 'F#', 'G#', 'A#'] },
    { label: 'Bemóis ♭', notes: ['Db', 'Eb', 'Gb', 'Ab', 'Bb'] },
  ];
  groups.forEach(g => {
    const wrap = document.createElement('div');
    const lbl = document.createElement('div');
    lbl.className = 'note-group-label';
    lbl.textContent = g.label;
    const row = document.createElement('div');
    row.className = 'note-row';
    g.notes.forEach(note => {
      const btn = document.createElement('button');
      btn.className = 'note-btn' + (note === S.root ? ' active' : '');
      btn.type = 'button';
      btn.dataset.note = note;
      const d = fmt(note);
      const base = d.replace(/[♯♭]/, '');
      const acc = d.includes('♯') ? '<sup>♯</sup>' : d.includes('♭') ? '<sup>♭</sup>' : '';
      btn.innerHTML = base + acc;
      row.appendChild(btn);
    });
    wrap.appendChild(lbl);
    wrap.appendChild(row);
    grid.appendChild(wrap);
  });
}

function buildOctaveRow() {
  const row = document.getElementById('octaveRow');
  row.innerHTML = '';
  for (let o = 2; o <= 6; o++) {
    const b = document.createElement('button');
    b.className = 'pill' + (o === S.octave ? ' active' : '');
    b.type = 'button';
    b.dataset.octave = o;
    b.textContent = o;
    row.appendChild(b);
  }
}

function buildSpeedControl() {
  const range = document.getElementById('speedRange');
  const out = document.getElementById('speedVal');
  if (!range || !out) return;
  const apply = v => {
    S.speed = +v / 100;
    out.textContent = S.speed.toFixed(2) + '×';
  };
  apply(range.value);
  range.oninput = e => apply(e.target.value);
}

function spd(dur) { return dur / Math.max(0.25, S.speed); }
function spdSpread(spread) { return spread / Math.max(0.25, S.speed); }

function selectNote(note) {
  S.root = note;
  document.querySelectorAll('.note-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.note === note)
  );
  SonAudio.playNote(note, S.octave, 0, 0.9, 0.55);
  render();
}

document.querySelectorAll('[data-action="acc"]').forEach(btn => {
  btn.onclick = () => {
    S.acc = btn.dataset.acc;
    document.querySelectorAll('[data-action="acc"]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  };
});

function renderIntervals(flat) {
  const grid = document.getElementById('intervalsGrid');
  grid.innerHTML = '';
  const rootIsFlat = parseRootSpelling(rawNote(S.root)).acc < 0;
  const useFlats = flat || rootIsFlat;
  const frag = document.createDocumentFragment();
  IV.forEach((iv, i) => {
    const rn = getNote(S.root, iv.st, useFlats);
    const card = document.createElement('div');
    card.className = 'iv-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${iv.name} — ${fmt(rn)}`);
    card.style.setProperty('--cc', iv.c);
    card.style.setProperty('--i', i);
    card.dataset.semis = iv.st;
    const mk = (cls, text) => {
      const d = document.createElement('div');
      d.className = cls;
      d.textContent = text;
      return d;
    };
    card.appendChild(mk('iv-num', iv.st));
    card.appendChild(mk('iv-abbr', iv.abbr));
    card.appendChild(mk('iv-note', fmt(rn)));
    card.appendChild(mk('iv-role', iv.role));
    card.appendChild(mk('iv-semi', `${iv.st} semiton${iv.st !== 1 ? 's' : ''}`));
    card.appendChild(mk('iv-name', iv.name));
    frag.appendChild(card);
  });
  grid.appendChild(frag);
}

function playInterval(st) {
  const { note, oct } = noteAt(S.root, S.octave, st);
  const gap = spdSpread(0.08);
  const dur = spd(1.2);
  SonAudio.playNote(S.root, S.octave, 0, dur, 0.6);
  if (st > 0) SonAudio.playNote(note, oct, gap, dur, 0.6);
}

function renderPiano(flat) {
  const piano = document.getElementById('piano');
  piano.innerHTML = '';
  const ri = noteIdx(S.root);
  const rootIsFlat = parseRootSpelling(rawNote(S.root)).acc < 0;
  const useFlats = flat || rootIsFlat;
  const ivc = {};
  IV.forEach(iv => { ivc[noteIdx(getNote(S.root, iv.st, useFlats))] = iv.c; });
  const WHITE = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const WHITE_W = 40, GAP = 3, BLACK_W = 26;
  const KEY_W = WHITE_W + GAP;
  const BLACK_AFTER = [0, 1, 3, 4, 5];      // C, D, F, G, A — skip E (no E#)
  const BN = ['C#', 'D#', 'F#', 'G#', 'A#'];
  const wrapW = WHITE.length * WHITE_W + (WHITE.length - 1) * GAP;
  for (let oct = 0; oct < 2; oct++) {
    const wrap = document.createElement('div');
    wrap.style.cssText = `position:relative;width:${wrapW}px;height:120px;flex-shrink:0;display:flex;gap:${GAP}px;`;
    WHITE.forEach(wn => {
      const ci = noteIdx(wn);
      const key = document.createElement('div');
      key.className = 'white-key';
      key.dataset.note = wn;
      key.dataset.oct = S.octave + oct;
      if (ci === ri) key.classList.add('root');
      else if (ivc[ci]) {
        key.classList.add('iv-note');
        key.style.background = ivc[ci] + '28';
        key.style.borderBottom = `4px solid ${ivc[ci]}`;
      }
      key.textContent = wn + (S.octave + oct);
      wrap.appendChild(key);
    });
    BN.forEach((bn, bi) => {
      const ci = noteIdx(bn);
      const dn = flat ? (ENHARMONIC[bn] || bn) : bn;
      const bk = document.createElement('div');
      bk.className = 'black-key';
      bk.dataset.note = bn;
      bk.dataset.oct = S.octave + oct;
      const i = BLACK_AFTER[bi];
      bk.style.left = (i * KEY_W + WHITE_W + GAP / 2 - BLACK_W / 2) + 'px';
      if (ci === ri) bk.classList.add('root');
      else if (ivc[ci]) { bk.classList.add('iv-note'); bk.style.background = ivc[ci] + 'aa'; }
      bk.textContent = fmt(dn);
      wrap.appendChild(bk);
    });
    piano.appendChild(wrap);
  }
}

function renderScaleTab() {
  const flat = isFlat();
  buildCategoryFilter();
  buildModeGrid();
  const meta = SCALES[S.scale];
  const notes = spellScale(S.root, meta.i, flat);

  const info = document.getElementById('scaleInfo');
  info.textContent = '';
  const strong = document.createElement('strong'); strong.textContent = S.scale;
  const em = document.createElement('em'); em.textContent = meta.cat;
  info.appendChild(strong);
  info.appendChild(document.createTextNode(` em ${fmt(S.root)} · `));
  info.appendChild(em);
  const descDiv = document.createElement('div'); descDiv.textContent = meta.desc;
  const formulaDiv = document.createElement('div');
  formulaDiv.className = 'scale-formula';
  formulaDiv.textContent = `fórmula: ${meta.i.join(' · ')} (semitons)`;
  info.appendChild(descDiv);
  info.appendChild(formulaDiv);

  const disp = document.getElementById('scaleDisplay');
  disp.innerHTML = '';
  notes.forEach((note, i) => {
    const el = document.createElement('div');
    el.className = 'scale-note' + (i === 0 ? ' root-note' : '');
    const deg = DEG_ROMAN[i] || (i + 1);
    const degSpan = document.createElement('span');
    degSpan.className = 'scale-degree';
    degSpan.textContent = deg;
    el.appendChild(degSpan);
    el.appendChild(document.createTextNode(fmt(note)));
    el.dataset.scaleStep = i;
    disp.appendChild(el);
  });

  const scaleSemis = meta.i.concat([12]);
  document.getElementById('playScaleUp').onclick = () => {
    SonAudio.ensure();
    SonAudio.cancelAllTimers();
    const step = spdSpread(0.18);
    const dur = spd(0.55);
    scaleSemis.forEach((st, i) => {
      const { note, oct } = noteAt(S.root, S.octave, st);
      SonAudio.playNote(note, oct, i * step, dur, 0.55);
    });
  };
  document.getElementById('playScaleDown').onclick = () => {
    SonAudio.ensure();
    SonAudio.cancelAllTimers();
    const desc = [...scaleSemis].reverse();
    const step = spdSpread(0.18);
    const dur = spd(0.55);
    desc.forEach((st, i) => {
      const { note, oct } = noteAt(S.root, S.octave, st);
      SonAudio.playNote(note, oct, i * step, dur, 0.55);
    });
  };

  renderDiatonic();
}

function buildCategoryFilter() {
  const cats = ['Todas', ...new Set(Object.values(SCALES).map(s => s.cat))];
  const el = document.getElementById('scaleCatFilter');
  el.innerHTML = '';
  cats.forEach(cat => {
    const b = document.createElement('button');
    b.className = 'pill' + (cat === S.scaleCat ? ' active' : '');
    b.textContent = cat;
    b.type = 'button';
    b.dataset.cat = cat;
    el.appendChild(b);
  });
}

function selectScaleCategory(cat) {
  S.scaleCat = cat;
  const firstInCat = cat === 'Todas' ? 'Maior (Jônico)'
    : Object.entries(SCALES).find(([, v]) => v.cat === cat)[0];
  if (S.scale !== firstInCat) S.composer = [];
  S.scale = firstInCat;
  renderScaleTab();
  renderComposerPalette();
  renderComposerTimeline();
}

function buildModeGrid() {
  const grid = document.getElementById('modeGrid');
  grid.innerHTML = '';
  Object.entries(SCALES).forEach(([name, meta]) => {
    if (S.scaleCat !== 'Todas' && meta.cat !== S.scaleCat) return;
    const b = document.createElement('button');
    b.className = 'mode-btn' + (name === S.scale ? ' active' : '');
    b.type = 'button';
    b.dataset.scale = name;
    b.textContent = name;
    grid.appendChild(b);
  });
}

function selectScale(name) {
  if (S.scale !== name) S.composer = [];
  S.scale = name;
  renderScaleTab();
  renderComposerPalette();
  renderComposerTimeline();
}

function renderDiatonic() {
  const flat = isFlat();
  const meta = SCALES[S.scale];
  const grid = document.getElementById('diatonicGrid');
  grid.innerHTML = '';
  if (meta.i.length < 7) {
    grid.innerHTML = `<div class="composer-empty" style="grid-column:1/-1;text-align:center;">Escalas não-heptatônicas não geram acordes diatônicos clássicos.</div>`;
    return;
  }
  const tris = diatonicTriads(S.root, meta.i, flat);
  tris.forEach((t, i) => {
    const card = document.createElement('div');
    card.className = 'chord-card';
    card.dataset.diatonicIdx = i;
    const notes7Txt = t.seventhSym
      ? `<div class="chord-notes" style="opacity:.7;margin-top:.2rem">${t.notes7.map(n => fmt(n)).join(' · ')} <span style="color:var(--gold)">(${esc(t.seventhSym)})</span></div>`
      : '';
    card.innerHTML = `
      <div class="chord-roman">${esc(t.roman)}</div>
      <div class="chord-name">${esc(t.triadSym)}</div>
      <div class="chord-notes">${t.notes.map(n => fmt(n)).join(' · ')}</div>
      <div class="chord-quality">${esc(t.quality)}</div>
      ${notes7Txt}
      <span class="chord-play-hint">▶</span>
      <button type="button" class="card-shapes" data-shapes
        aria-label="Ver formas de ${esc(t.triadSym)} no violão">⌗ formas</button>`;
    grid.appendChild(card);
  });
}

function renderChords(flat) {
  const grid = document.getElementById('chordsGrid');
  grid.innerHTML = '';
  CHORDS.forEach((chord, i) => {
    const cn = tonalChordNotes(S.root, chord.sym);
    const card = document.createElement('div');
    card.className = 'chord-card';
    card.style.setProperty('--i', i);
    card.dataset.chordIdx = i;
    card.innerHTML = `
      <div class="chord-name">${fmt(S.root)}${esc(chord.sym)}</div>
      <div class="chord-notes">${cn.map(n => fmt(n)).join(' · ')}</div>
      <div class="chord-quality">${esc(chord.q)}</div>
      <span class="chord-play-hint">▶</span>
      <button type="button" class="card-shapes" data-shapes
        aria-label="Ver formas de ${esc(fmt(S.root) + chord.sym)} no violão">⌗ formas</button>`;
    grid.appendChild(card);
  });
}

function buildTuning() {
  const sel = document.getElementById('tuningSelector');
  sel.innerHTML = '';
  Object.keys(TUNINGS).forEach(name => {
    const b = document.createElement('button');
    b.className = 'tuning-btn' + (name === S.tuning ? ' active' : '');
    b.type = 'button';
    b.dataset.tuning = name;
    b.textContent = name;
    sel.appendChild(b);
  });
}

function renderGuitar() {
  document.getElementById('guitarRootLabel').textContent = fmt(S.root);
  const tnotes = TUNINGS[S.tuning];
  document.getElementById('tuningDisplay').textContent =
    tnotes.map(s => fmt(s.replace(/\d/, ''))).join(' · ');
  const canvas = document.getElementById('fretboardCanvas');
  const an = Campo.analyzer.on;
  const intervals = S.soloOn ? scaleIntervals(S.soloScale) : IV;
  drawFretboard(canvas, S.root, intervals, isFlat(), tnotes,
    an ? { analyzer: true, frets: Campo.analyzer.frets } : null);
  bindFretboardClicks(canvas, tnotes);
  syncAnalyzerUI();
  syncSoloUI();
  renderFretboardLegend(intervals);
  renderDiagrams();
}

function scaleIntervals(scaleName) {
  const meta = SCALES[scaleName];
  if (!meta) return IV;
  const set = new Set(meta.i);
  set.add(0);
  return IV.filter(iv => set.has(iv.st % 12));
}

const SCALE_DEGREE_LABEL = {
  0: '1', 1: '♭2', 2: '2', 3: '♭3', 4: '3', 5: '4',
  6: '♭5', 7: '5', 8: '♭6', 9: '6', 10: '♭7', 11: '7',
};

const TONAL_FUNCTIONS = [
  { key: 'tonic',   label: 'Tônica',       semis: [0, 3, 4, 8, 9] },
  { key: 'subdom',  label: 'Subdominante', semis: [1, 2, 5, 6] },
  { key: 'dom',     label: 'Dominante',    semis: [7, 10] },
  { key: 'leading', label: 'Sensível',     semis: [11] },
];
const TONAL_FN_BY_SEMI = (() => {
  const m = {};
  TONAL_FUNCTIONS.forEach(f => f.semis.forEach(s => { m[s] = f.key; }));
  return m;
})();

function renderFretboardLegend(intervals) {
  const el = document.getElementById('fretboardLegend');
  if (!el) return;
  el.innerHTML = '';
  const flat = isFlat();
  const colorBySemi = {};
  const seen = new Set();
  const presentSemis = [];
  intervals.forEach(iv => {
    const st = iv.st % 12;
    if (seen.has(st)) return;
    seen.add(st);
    colorBySemi[st] = iv.c;
    presentSemis.push(st);
  });

  TONAL_FUNCTIONS.forEach(fn => {
    const semis = fn.semis.filter(s => seen.has(s));
    if (!semis.length) return;
    const group = document.createElement('div');
    group.className = 'legend-group fn-' + fn.key;
    const title = document.createElement('span');
    title.className = 'legend-group-title';
    title.textContent = fn.label;
    group.appendChild(title);
    semis.forEach(st => {
      const note = getNote(S.root, st, flat);
      const isRoot = st === 0;
      const chip = document.createElement('span');
      chip.className = 'legend-chip' + (isRoot ? ' root' : '');
      chip.style.setProperty('--lc', colorBySemi[st]);
      chip.innerHTML =
        `<span class="legend-dot"></span>` +
        `<span class="legend-deg">${SCALE_DEGREE_LABEL[st] || st}</span>` +
        `<span class="legend-note">${fmt(note)}</span>`;
      group.appendChild(chip);
    });
    el.appendChild(group);
  });
}

function syncSoloUI() {
  const btn = document.getElementById('soloToggle');
  btn.classList.toggle('active', S.soloOn);
  btn.setAttribute('aria-pressed', S.soloOn ? 'true' : 'false');
  document.querySelectorAll('[data-solo-ctrl]').forEach(el => { el.hidden = !S.soloOn; });
  document.getElementById('soloHint').hidden = !S.soloOn;
  const sel = document.getElementById('soloScale');
  if (sel.value !== S.soloScale) sel.value = S.soloScale;
}

function buildSoloScaleSelector() {
  const sel = document.getElementById('soloScale');
  if (!sel || sel.dataset.built) return;
  const byCat = {};
  Object.entries(SCALES).forEach(([name, meta]) => {
    (byCat[meta.cat] = byCat[meta.cat] || []).push(name);
  });
  Object.keys(byCat).forEach(cat => {
    const og = document.createElement('optgroup');
    og.label = cat;
    byCat[cat].forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      if (name === S.soloScale) opt.selected = true;
      og.appendChild(opt);
    });
    sel.appendChild(og);
  });
  sel.dataset.built = '1';
  sel.addEventListener('change', () => {
    S.soloScale = sel.value;
    renderGuitar();
  });
}

function syncAnalyzerUI() {
  const on = Campo.analyzer.on;
  const btn = document.getElementById('analyzerToggle');
  btn.classList.toggle('active', on);
  btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  document.getElementById('analyzerClear').hidden = !on;
  document.getElementById('analyzerHint').hidden = !on;
  const res = document.getElementById('analyzerResult');
  if (!on) { res.hidden = true; res.innerHTML = ''; }
}

function bindFretboardClicks(canvas, tnotes) {
  canvas.onclick = e => {
    const { x, y, W, H } = canvasLogicalXY(canvas, e);
    const ML = 58, MR = 22, MT = 34, MB = 34, STRINGS = 6, FRETS = 17;
    const fW = (W - ML - MR) / FRETS, sH = (H - MT - MB) / (STRINGS - 1);
    if (y < MT - 16 || y > H - MB + 16) return;
    const si = Math.round((y - MT) / sH);
    const stringIdx = STRINGS - 1 - si;
    if (stringIdx < 0 || stringIdx >= STRINGS) return;

    if (Campo.analyzer.on) {
      if (x < ML) {
        Campo.toggleStringGutter(stringIdx);
      } else if (x <= W - MR) {
        const fret = Math.floor((x - ML) / fW) + 1;
        if (fret < 1 || fret > FRETS) return;
        Campo.setAnalyzerFret(stringIdx, fret);
      } else return;
      drawFretboard(canvas, S.root, IV, isFlat(), tnotes,
        { analyzer: true, frets: Campo.analyzer.frets });
      Campo.runAnalysis(tnotes);
      return;
    }

    if (x < ML || x > W - MR) return;
    const fret = Math.floor((x - ML) / fW) + 1;
    const { n: openNote, o: openOct } = parseNote(tnotes[stringIdx]);
    const noteIdxAt = (noteIdx(openNote) + fret) % 12;
    const octOffset = Math.floor((noteIdx(openNote) + fret) / 12);
    SonAudio.playNote(CHROMATIC[noteIdxAt], openOct + octOffset, 0, 1.0, 0.55);
  };
}

document.getElementById('analyzerToggle').onclick = () => {
  Campo.analyzer.on = !Campo.analyzer.on;
  if (Campo.analyzer.on) {
    Campo.resetAnalyzer(TUNINGS[S.tuning].length);
    Campo.ensureLibs().catch(() => { });
  }
  renderGuitar();
};
document.getElementById('analyzerClear').onclick = () => {
  Campo.resetAnalyzer(TUNINGS[S.tuning].length);
  renderGuitar();
  Campo.runAnalysis(TUNINGS[S.tuning]);
};

document.getElementById('soloToggle').onclick = () => {
  S.soloOn = !S.soloOn;
  if (S.soloOn) buildSoloScaleSelector();
  renderGuitar();
};

// ── Campo Harmônico ──────────────────────────────────────────
function renderCampo() {
  const flat = isFlat();
  document.querySelectorAll('[data-campo-type]').forEach(b =>
    b.classList.toggle('active', b.dataset.campoType === Campo.state.type));
  document.querySelectorAll('[data-campo-seventh]').forEach(b =>
    b.classList.toggle('active', (b.dataset.campoSeventh === '1') === Campo.state.seventh));
  Campo.renderWheel(S.root, flat);
  Campo.renderField(S.root, flat);
  Campo.renderSequences();
}

function openDegreeShapes(idx) {
  const c = Campo.chordAtDegree(S.root, isFlat(), idx);
  if (!c) return;
  SonAudio.strumVoiced(c.chordRoot, S.octave + (c.rootOctOffset || 0), c.semis,
    spd(1.6), true, spdSpread(0.02));
  Campo.openShapes(c.chordRoot, c.sym, c.display);
}

function renderDiagrams() {
  const grid = document.getElementById('diagramGrid');
  grid.innerHTML = '';
  const flat = isFlat();
  const tnotes = TUNINGS[S.tuning];
  const qualities = ['Maior', 'Menor', 'Dominante 7', 'Maior 7', 'Menor 7'];
  qualities.forEach(qual => {
    const chord = CHORDS.find(c => c.name === qual);
    if (!chord) return;
    const voicing = findBestVoicing(qual, S.root);
    if (!voicing) return;
    const cn = tonalChordNotes(S.root, chord.sym);
    const card = document.createElement('div');
    card.className = 'diagram-card';
    const idx = CHORDS.indexOf(chord);
    card.dataset.chordIdx = idx;
    card.innerHTML = `
      <div class="diagram-card-name">${fmt(S.root)}${esc(chord.sym)}</div>
      ${buildChordDiagram(voicing.frets, S.root, tnotes, flat)}
      <div class="chord-notes" style="font-family:'DM Mono',monospace;font-size:.66rem;color:var(--ink-mid);margin-top:.35rem;">${cn.map(n => fmt(n)).join(' · ')}</div>
      <div class="diagram-card-quality">${esc(chord.q)}</div>`;
    grid.appendChild(card);
  });
}

function renderProgressions() {
  const grid = document.getElementById('progGrid');
  grid.innerHTML = '';
  PROGRESSIONS.forEach((prog, pi) => {
    const chords = expandProgression(prog, S.root, isFlat());
    const card = document.createElement('div');
    card.className = 'prog-card';
    card.dataset.progIdx = pi;
    const romans = prog.degrees.map(([d, q]) => {
      const base = DEG_ROMAN[d];
      const isMin = q === 'min' || q === 'm7' || q === 'm7♭5' || q === 'mM7' || q === '°7';
      const isDim = q === 'dim' || q === 'm7♭5' || q === '°7';
      let r = isMin ? base.toLowerCase() : base;
      if (isDim) r += '°';
      const sfx = q === '7' ? '7' : q === 'maj7' ? 'maj7' : q === 'm7' ? '7' : q === 'mM7' ? 'M7' : '';
      return r + sfx;
    }).join(' — ');
    card.innerHTML = `
      <div class="prog-card-tag">${esc(prog.tag)}</div>
      <div class="prog-card-name">${esc(prog.name)}</div>
      <div class="prog-card-chords">${chords.map(c => esc(c.sym)).join(' · ')}</div>
      <div class="prog-card-desc">${esc(prog.desc)}</div>
      <div class="prog-card-examples"><strong>Ex.:</strong> ${esc(prog.examples)}</div>
      <div style="margin-top:.6rem;font-family:'DM Mono',monospace;font-size:.7rem;color:var(--gold);letter-spacing:.08em;">${esc(romans)}</div>`;
    grid.appendChild(card);
  });
}

function playProgression(pi) {
  const prog = PROGRESSIONS[pi];
  if (!prog) return;
  const chords = expandProgression(prog, S.root, isFlat());
  SonAudio.ensure();
  SonAudio.cancelAllTimers();
  const beatMs = 900;
  chords.forEach((c, i) => SonAudio.scheduleTimer(
    () => { SonAudio.strumVoiced(c.chordRoot, S.octave, c.semis, beatMs / 500); },
    i * beatMs
  ));
}

function renderComposerPalette() {
  const flat = isFlat();
  const meta = SCALES[S.scale];
  const isHept = meta.i.length >= 7;
  const pal = document.getElementById('composerPalette');
  const extras = document.getElementById('composerExtras');
  pal.innerHTML = '';
  extras.innerHTML = '';

  if (isHept) {
    const tris = diatonicTriads(S.root, meta.i, flat);
    tris.forEach((t) => {
      const b = document.createElement('button');
      b.className = 'composer-pal-btn';
      b.type = 'button';
      b.dataset.degreeIdx = t.idx;
      b.dataset.seventh = '0';
      const rom = document.createElement('span');
      rom.className = 'pal-rom';
      rom.textContent = t.roman;
      const sym = document.createElement('span');
      sym.textContent = t.triadSym;
      b.appendChild(rom); b.appendChild(sym);
      pal.appendChild(b);
    });
    tris.forEach(t => {
      if (!t.seventhSym) return;
      const b = document.createElement('button');
      b.className = 'composer-pal-btn';
      b.type = 'button';
      b.dataset.degreeIdx = t.idx;
      b.dataset.seventh = '1';
      const rom = document.createElement('span');
      rom.className = 'pal-rom';
      rom.textContent = t.roman + '7';
      const sym = document.createElement('span');
      sym.textContent = t.seventhSym;
      b.appendChild(rom); b.appendChild(sym);
      extras.appendChild(b);
    });
  } else {
    const empty = document.createElement('div');
    empty.className = 'composer-empty';
    empty.textContent = 'Selecione uma escala heptatônica (Maior, Menor, Dórico etc.) para usar o compositor.';
    pal.appendChild(empty);
  }
}

function resolveComposerChord(entry) {
  const flat = isFlat();
  const meta = SCALES[S.scale];
  if (!meta || meta.i.length < 7) return null;
  const tris = diatonicTriads(S.root, meta.i, flat);
  const t = tris[entry.degreeIdx];
  if (!t) return null;
  const semis = entry.isSeventh && t.seventhSemis ? t.seventhSemis : t.triadSemis;
  const sym = entry.isSeventh && t.seventhSym ? t.seventhSym : t.triadSym;
  const roman = entry.isSeventh && t.seventhSym ? t.roman + '7' : t.roman;
  return { roman, sym, semis, chordRoot: t.chordRoot, octOffset: t.rootOctOffset };
}

function addToComposer(chord) {
  S.composer.push(chord);
  renderComposerTimeline();
}

function renderComposerTimeline() {
  const tl = document.getElementById('composerTimeline');
  tl.innerHTML = '';
  if (!S.composer.length) {
    const empty = document.createElement('div');
    empty.className = 'composer-empty';
    empty.textContent = 'Adicione acordes da paleta abaixo para compor sua progressão.';
    tl.appendChild(empty);
    return;
  }
  S.composer.forEach((entry, i) => {
    const c = resolveComposerChord(entry);
    if (!c) return;
    const slot = document.createElement('div');
    slot.className = 'composer-slot';
    slot.dataset.slotIdx = i;
    const romanEl = document.createElement('div');
    romanEl.className = 'composer-slot-roman';
    romanEl.textContent = c.roman;
    const chordEl = document.createElement('div');
    chordEl.className = 'composer-slot-chord';
    chordEl.textContent = c.sym;
    const rm = document.createElement('button');
    rm.className = 'composer-slot-remove';
    rm.type = 'button';
    rm.title = 'remover';
    rm.dataset.removeSlot = i;
    rm.setAttribute('aria-label', `remover ${c.sym}`);
    rm.textContent = '×';
    slot.appendChild(romanEl); slot.appendChild(chordEl); slot.appendChild(rm);
    tl.appendChild(slot);
  });
}

document.getElementById('composerPlay').onclick = () => {
  if (!S.composer.length) return;
  SonAudio.ensure();
  SonAudio.cancelAllTimers();
  const beatMs = 60000 / S.composerBpm * 2;
  S.composer.forEach((entry, i) => {
    const c = resolveComposerChord(entry);
    if (!c) return;
    SonAudio.scheduleTimer(
      () => { SonAudio.strumVoiced(c.chordRoot, S.octave + c.octOffset, c.semis, beatMs / 500); },
      i * beatMs
    );
  });
};
document.getElementById('composerArp').onclick = () => {
  if (!S.composer.length) return;
  SonAudio.ensure();
  SonAudio.cancelAllTimers();
  const beatMs = 60000 / S.composerBpm * 2;
  const step = beatMs / 4 / 1000;
  S.composer.forEach((entry, i) => {
    const c = resolveComposerChord(entry);
    if (!c) return;
    SonAudio.scheduleTimer(
      () => { SonAudio.arpeggiateVoiced(c.chordRoot, S.octave + c.octOffset, c.semis, step, 0.7); },
      i * beatMs
    );
  });
};
document.getElementById('composerClear').onclick = () => {
  SonAudio.cancelAllTimers();
  S.composer = [];
  renderComposerTimeline();
};
document.getElementById('composerBpm').oninput = e => {
  S.composerBpm = +e.target.value;
  document.getElementById('composerBpmVal').textContent = e.target.value;
};

const getCircleColors = cssVarCache({
  ring:      ['--circle-ring-line',   '#171612'],
  fillA:     ['--circle-fill-a',      'rgba(247,55,79,.05)'],
  fillB:     ['--circle-fill-b',      'rgba(136,48,78,.08)'],
  sel:       ['--circle-selected',    '#F7374F'],
  label:     ['--circle-label',       '#2C2C2C'],
  labelSel:  ['--circle-label-sel',   '#ffffff'],
  labelDim:  ['--circle-label-dim',   '#5a4f52'],
  center:    ['--circle-center',      '#2C2C2C'],
  centerInk: ['--circle-center-ink',  '#ffffff'],
  centerSub: ['--circle-center-sub',  '#b9aeb0'],
});

function renderCircle() {
  const cvs = document.getElementById('circleCanvas');
  const { ctx, W, H } = setupHiDPI(cvs);
  const cx = W / 2, cy = H / 2;
  const RO = 165, RI = 115, RM = 85;

  const C = getCircleColors();
  const C_RING = C.ring, C_FILL_A = C.fillA, C_FILL_B = C.fillB;
  const C_SEL = C.sel, C_LABEL = C.label, C_LABEL_SEL = C.labelSel;
  const C_LABEL_DIM = C.labelDim, C_CENTER = C.center;
  const C_CENTER_INK = C.centerInk, C_CENTER_SUB = C.centerSub;

  ctx.clearRect(0, 0, W, H);
  const ridx = COF_M.findIndex(n => n === S.root || ENHARMONIC[n] === S.root || ENHARMONIC[S.root] === n);
  COF_M.forEach((note, i) => {
    const a1 = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const a2 = ((i + 1) / 12) * Math.PI * 2 - Math.PI / 2;
    const am = (a1 + a2) / 2;
    const isSel = i === ridx;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a1) * RI, cy + Math.sin(a1) * RI);
    ctx.arc(cx, cy, RO, a1, a2);
    ctx.arc(cx, cy, RI, a2, a1, true);
    ctx.closePath();
    ctx.fillStyle = isSel ? C_SEL : C_FILL_A;
    ctx.fill();
    ctx.strokeStyle = C_RING; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = isSel ? C_LABEL_SEL : C_LABEL;
    ctx.font = `${isSel ? 700 : 500} ${isSel ? 16 : 14}px Inter,sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(fmt(note), cx + Math.cos(am) * (RO + RI) / 2, cy + Math.sin(am) * (RO + RI) / 2);

    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a1) * RM, cy + Math.sin(a1) * RM);
    ctx.arc(cx, cy, RI, a1, a2);
    ctx.arc(cx, cy, RM, a2, a1, true);
    ctx.closePath();
    ctx.fillStyle = isSel ? C_FILL_B : 'transparent';
    ctx.fill();
    ctx.strokeStyle = C_RING; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = isSel ? C_SEL : C_LABEL_DIM;
    ctx.font = `${isSel ? 600 : 500} 11px Inter,sans-serif`;
    ctx.fillText(COF_m[i], cx + Math.cos(am) * (RI + RM) / 2, cy + Math.sin(am) * (RI + RM) / 2);
  });
  ctx.beginPath(); ctx.arc(cx, cy, 55, 0, Math.PI * 2);
  ctx.fillStyle = C_CENTER; ctx.fill();
  ctx.strokeStyle = C_RING; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = C_CENTER_INK; ctx.font = '600 22px Fraunces,serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(fmt(S.root), cx, cy - 8);
  ctx.fillStyle = C_CENTER_SUB; ctx.font = '500 10px JetBrains Mono,monospace';
  ctx.fillText('RAIZ', cx, cy + 12);
}

document.getElementById('circleCanvas').addEventListener('click', function (e) {
  const { x: lx, y: ly, W, H } = canvasLogicalXY(this, e);
  const x = lx - W / 2, y = ly - H / 2;
  const d = Math.sqrt(x * x + y * y);
  const RM = 85, RI = 115, RO = 165;
  if (d < RM || d > RO) return;
  let angle = Math.atan2(y, x) + Math.PI / 2;
  if (angle < 0) angle += Math.PI * 2;
  const idx = Math.floor((angle / (Math.PI * 2)) * 12) % 12;
  if (d >= RI) {
    // Outer ring: major key — stay in current scale family
    selectNote(COF_M[idx]);
  } else {
    // Inner ring: relative minor — set root to minor tonic and switch to natural minor
    const minorRoot = COF_m[idx].replace(/m$/, '');
    S.scale = 'Menor Natural';
    selectNote(minorRoot);
  }
});

function renderKeySig() {
  const panel = document.getElementById('keysigPanel');
  const ks = keySignatureFor(S.root);
  if (!ks) {
    panel.innerHTML = `<div class="keysig-title">${fmt(S.root)} Maior</div><div class="keysig-count">armadura não padronizada</div>`;
    return;
  }
  const tipo = ks.sharps > 0 ? `${ks.sharps} sustenido${ks.sharps > 1 ? 's' : ''}` :
    ks.flats > 0 ? `${ks.flats} bemol${ks.flats > 1 ? 'is' : ''}` : 'sem alterações';
  const accs = ks.accs.length ? ks.accs.map(a => fmt(a)).join(' · ') : '—';
  panel.innerHTML = `
    <div class="keysig-title">${esc(ks.name)}</div>
    <div class="keysig-accs">${accs}</div>
    <div class="keysig-count">armadura: ${esc(tipo)}</div>`;
}

function buildRhythmGrid() {
  const grid = document.getElementById('rhythmGrid');
  grid.innerHTML = '';
  RHYTHMS.forEach((r, i) => {
    const card = document.createElement('div');
    card.className = 'rhythm-card';
    card.style.setProperty('--rc', r.color);
    card.dataset.rhythmIdx = i;
    card.innerHTML = `
      <div class="rhythm-card-sig">${esc(r.sig)}</div>
      <div class="rhythm-card-title">${esc(r.name)}</div>
      <div class="rhythm-card-origin">${esc(r.origin)}</div>
      <div class="rhythm-card-desc">${esc(r.desc)}</div>`;
    grid.appendChild(card);
  });
}

function selectRhythm(r, card) {
  document.querySelectorAll('.rhythm-card').forEach(c => c.classList.remove('active-rhythm'));
  card.classList.add('active-rhythm');
  Rhythm.setRhythm(r);
  document.getElementById('rhythmBpm').value = r.bpm;
  document.getElementById('rhythmBpmVal').textContent = r.bpm;
  const player = document.getElementById('rhythmPlayer');
  player.style.display = 'block';
  document.getElementById('rhythmPlayerName').textContent = r.name;
  document.getElementById('rhythmPlayerInfo').textContent = `${r.sig} · ${r.bpm} BPM · ${r.tip}`;
  renderRhythmBars(r);
  requestAnimationFrame(() => {
    player.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

function renderRhythmBars(r) {
  const bars = document.getElementById('rhythmBars');
  bars.innerHTML = '';
  r.beats.forEach((b, i) => {
    const div = document.createElement('div');
    div.className = 'rhythm-beat' + (b.d === 'D' ? ' down' : b.d === 'U' ? ' up' : b.d === 'X' ? ' mute' : '');
    div.id = `rb-${i}`;
    const arrow = b.d === 'D' ? '↓' : b.d === 'U' ? '↑' : b.d === 'X' ? '✕' : '·';
    div.innerHTML = `<span>${arrow}</span><span class="rhythm-beat-label">${esc(b.label)}</span>`;
    bars.appendChild(div);
  });
}

document.getElementById('rhythmPlayBtn').onclick = async () => {
  const playing = await Rhythm.toggle();
  const btn = document.getElementById('rhythmPlayBtn');
  btn.textContent = playing ? '⏹ Parar' : '▶ Tocar';
  // If audio wasn't enabled, the user clicked play but nothing will sound —
  // surface that by flipping back to off-state visually.
  if (playing && !SonAudio.isOn()) {
    Rhythm.stop();
    btn.textContent = '▶ Tocar';
  }
};
document.getElementById('rhythmBpm').oninput = e => {
  Rhythm.setBpm(e.target.value);
  document.getElementById('rhythmBpmVal').textContent = e.target.value;
};

function renderEarOptions() {
  const opts = EarTraining.getOptions();
  const el = document.getElementById('earOptions');
  el.innerHTML = '';
  opts.forEach(o => {
    const b = document.createElement('button');
    b.className = 'ear-option';
    b.type = 'button';
    b.dataset.option = o;
    b.textContent = o;
    el.appendChild(b);
  });
}

function answerEar(choice, clicked) {
  const el = document.getElementById('earOptions');
  const r = EarTraining.answer(choice);
  el.querySelectorAll('.ear-option').forEach(btn => {
    if (btn.textContent === r.expected) btn.classList.add('correct');
    else if (btn === clicked && !r.correct) btn.classList.add('wrong');
    btn.disabled = true;
  });
  const fb = document.getElementById('earFeedback');
  fb.className = 'ear-feedback ' + (r.correct ? 'right' : 'wrong');
  fb.textContent = r.correct ? '✓ Correto!' : `✗ Era ${r.expected}`;
  const sc = EarTraining.getScore();
  document.getElementById('earScore').textContent = `${sc.right} / ${sc.total}`;
}

function earNext() {
  EarTraining.newQuestion();
  renderEarOptions();
  document.getElementById('earFeedback').textContent = '';
  document.getElementById('earFeedback').className = 'ear-feedback';
  requestAnimationFrame(() => requestAnimationFrame(() => EarTraining.replay()));
}

document.getElementById('earPlayBtn').onclick = () => EarTraining.replay();
document.getElementById('earNext').onclick = earNext;
document.getElementById('earReset').onclick = () => {
  EarTraining.reset();
  document.getElementById('earScore').textContent = '0 / 0';
  earNext();
};
document.querySelectorAll('[data-ear-mode]').forEach(b => {
  b.onclick = () => {
    document.querySelectorAll('[data-ear-mode]').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    EarTraining.setMode(b.dataset.earMode);
    document.getElementById('earScore').textContent = '0 / 0';
    earNext();
  };
});
document.querySelectorAll('[data-ear-dir]').forEach(b => {
  b.onclick = () => {
    document.querySelectorAll('[data-ear-dir]').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    EarTraining.setDirection(b.dataset.earDir);
    EarTraining.replay();
  };
});

function switchTab(name) {
  if (S.activeTab !== name) SonAudio.cancelAllTimers();
  S.activeTab = name;
  document.querySelectorAll('.tab-btn').forEach(b => {
    const active = b.dataset.tab === name;
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', active ? 'true' : 'false');
    b.setAttribute('tabindex', active ? '0' : '-1');
  });
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  // Render content for the newly active tab
  if (name === 'scales') renderScaleTab();
  if (name === 'chords') renderChords(isFlat());
  if (name === 'progressions') renderProgressions();
  if (name === 'guitar') { renderGuitar(); Campo.ensureLibs().catch(() => { }); }
  if (name === 'circle') { renderCircle(); renderKeySig(); }
  if (name === 'campo') { renderCampo(); Campo.ensureLibs().catch(() => { }); }
  if (name === 'composer') { renderComposerPalette(); renderComposerTimeline(); }
  if (name === 'ear' && !EarTraining.getScore().total) earNext();
  if (name !== 'rhythm') Rhythm.stop();
}

const tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
tabButtons.forEach((b, idx) => {
  b.onclick = () => switchTab(b.dataset.tab);
  b.onkeydown = e => {
    let target = null;
    if (e.key === 'ArrowRight') target = tabButtons[(idx + 1) % tabButtons.length];
    else if (e.key === 'ArrowLeft') target = tabButtons[(idx - 1 + tabButtons.length) % tabButtons.length];
    else if (e.key === 'Home') target = tabButtons[0];
    else if (e.key === 'End') target = tabButtons[tabButtons.length - 1];
    if (target) {
      e.preventDefault();
      target.focus();
      switchTab(target.dataset.tab);
    }
  };
});

async function handleAudioToggle() {
  const on = await SonAudio.toggle();

  const label = on ? 'ÁUDIO ON' : 'ÁUDIO OFF';
  const ariaPressed = on ? 'true' : 'false';

  const headerBtn = document.getElementById('audioBtn');
  headerBtn.classList.toggle('on', on);
  headerBtn.setAttribute('aria-pressed', ariaPressed);
  document.getElementById('audioLabel').textContent = label;

  const fab = document.getElementById('audioFab');
  if (fab) {
    fab.classList.toggle('on', on);
    fab.setAttribute('aria-pressed', ariaPressed);
    document.getElementById('audioFabLabel').textContent = label;
  }

  if (!on) {
    Rhythm.stop();
    const rBtn = document.getElementById('rhythmPlayBtn');
    if (rBtn) rBtn.textContent = '▶ Tocar';
  }
}

document.getElementById('audioBtn').onclick = handleAudioToggle;
document.getElementById('audioFab').onclick = handleAudioToggle;

window.addEventListener('themechange', () => {
  if (S.activeTab === 'guitar') renderGuitar();
  if (S.activeTab === 'circle') renderCircle();
  if (S.activeTab === 'campo') Campo.renderWheel(S.root, isFlat());
});

function bindDelegation() {
  const on = (id, ev, sel, fn) => {
    document.getElementById(id).addEventListener(ev, e => {
      const m = e.target.closest(sel);
      if (m) fn(m, e);
    });
  };

  on('noteGrid', 'click', '.note-btn', m => selectNote(m.dataset.note));

  on('octaveRow', 'click', '.pill', (b, _e) => {
    S.octave = +b.dataset.octave;
    document.getElementById('octaveRow').querySelectorAll('.pill').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    render();
  });

  on('intervalsGrid', 'click', '.iv-card', m => playInterval(+m.dataset.semis));
  document.getElementById('intervalsGrid').addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.iv-card');
    if (!card) return;
    e.preventDefault();
    playInterval(+card.dataset.semis);
  });

  on('piano', 'click', '.white-key, .black-key', m =>
    SonAudio.playNote(m.dataset.note, +m.dataset.oct, 0, 0.7, 0.55));

  on('scaleCatFilter', 'click', '.pill', m => selectScaleCategory(m.dataset.cat));
  on('modeGrid', 'click', '.mode-btn', m => selectScale(m.dataset.scale));

  on('scaleDisplay', 'click', '.scale-note', m => {
    if (m.dataset.scaleStep == null) return;
    const meta = SCALES[S.scale];
    const { note, oct } = noteAt(S.root, S.octave, meta.i[+m.dataset.scaleStep]);
    SonAudio.playNote(note, oct, 0, 0.8, 0.6);
  });

  on('diatonicGrid', 'click', '.chord-card', (m, e) => {
    if (m.dataset.diatonicIdx == null) return;
    const meta = SCALES[S.scale];
    if (!meta || meta.i.length < 7) return;
    const t = diatonicTriads(S.root, meta.i, isFlat())[+m.dataset.diatonicIdx];
    if (!t) return;
    if (e.target.closest('.card-shapes')) {
      const suffix = t.triadSym.slice(fmt(t.chordRoot).length);
      Campo.openShapes(t.chordRoot, suffix, t.triadSym);
      return;
    }
    SonAudio.strumVoiced(t.chordRoot, S.octave + t.rootOctOffset, t.triadSemis, spd(1.8), true, spdSpread(0.02));
  });

  on('chordsGrid', 'click', '.chord-card', (m, e) => {
    if (m.dataset.chordIdx == null) return;
    const chord = CHORDS[+m.dataset.chordIdx];
    if (!chord) return;
    if (e.target.closest('.card-shapes')) {
      Campo.openShapes(S.root, chord.sym, fmt(S.root) + chord.sym);
      return;
    }
    SonAudio.strumVoiced(S.root, S.octave, chord.f, spd(2.0), true, spdSpread(0.02));
  });
  on('diagramGrid', 'click', '.diagram-card', m => {
    if (m.dataset.chordIdx == null) return;
    const chord = CHORDS[+m.dataset.chordIdx];
    if (chord) SonAudio.strumVoiced(S.root, S.octave, chord.f, spd(2.0), true, spdSpread(0.02));
  });

  // ── Campo Harmônico ──
  document.querySelectorAll('[data-campo-type]').forEach(b => {
    b.onclick = () => { Campo.state.type = b.dataset.campoType; renderCampo(); };
  });
  document.querySelectorAll('[data-campo-seventh]').forEach(b => {
    b.onclick = () => { Campo.state.seventh = b.dataset.campoSeventh === '1'; renderCampo(); };
  });
  document.getElementById('campoCanvas').addEventListener('click', function (e) {
    const d = Campo.wheelHit(this, e, S.root);
    if (d) openDegreeShapes(d.idx);
  });
  on('campoField', 'click', '.campo-card', m => {
    if (m.dataset.degreeIdx != null) openDegreeShapes(+m.dataset.degreeIdx);
  });
  on('campoSequences', 'click', '.campo-seq', m => {
    if (m.dataset.seqIdx != null) Campo.showSequence(S.root, isFlat(), +m.dataset.seqIdx);
  });
  on('campoSeqDetail', 'click', '.campo-seq-chord', m => {
    if (m.dataset.degreeIdx != null) openDegreeShapes(+m.dataset.degreeIdx);
  });

  on('progGrid', 'click', '.prog-card', m => {
    if (m.dataset.progIdx != null) playProgression(+m.dataset.progIdx);
  });

  on('tuningSelector', 'click', '.tuning-btn', b => {
    S.tuning = b.dataset.tuning;
    document.getElementById('tuningSelector').querySelectorAll('.tuning-btn').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    renderGuitar();
  });

  on('rhythmGrid', 'click', '.rhythm-card', m => {
    if (m.dataset.rhythmIdx != null) selectRhythm(RHYTHMS[+m.dataset.rhythmIdx], m);
  });

  on('earOptions', 'click', '.ear-option', b => {
    if (!b.disabled) answerEar(b.dataset.option, b);
  });

  const palClick = e => {
    const b = e.target.closest('.composer-pal-btn');
    if (!b || b.dataset.degreeIdx == null) return;
    addToComposer({
      degreeIdx: +b.dataset.degreeIdx,
      isSeventh: b.dataset.seventh === '1',
    });
  };
  document.getElementById('composerPalette').addEventListener('click', palClick);
  document.getElementById('composerExtras').addEventListener('click', palClick);

  document.getElementById('composerTimeline').addEventListener('click', e => {
    const rm = e.target.closest('.composer-slot-remove');
    if (rm) {
      S.composer.splice(+rm.dataset.removeSlot, 1);
      renderComposerTimeline();
      return;
    }
    const slot = e.target.closest('.composer-slot');
    if (!slot || slot.dataset.slotIdx == null) return;
    const c = resolveComposerChord(S.composer[+slot.dataset.slotIdx]);
    if (!c) return;
    SonAudio.strumVoiced(c.chordRoot, S.octave + c.octOffset, c.semis, spd(1.4), true, spdSpread(0.02));
  });
}

function init() {
  buildNoteGrid();
  buildOctaveRow();
  buildSpeedControl();
  buildTuning();
  buildSoloScaleSelector();
  buildRhythmGrid();
  bindDelegation();
  Campo.bind();
  render();
}
init();
