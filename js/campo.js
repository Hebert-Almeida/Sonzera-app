const Campo = (() => {

  const VENDOR = [
    'js/vendor/svguitar.umd.min.js',
    'js/vendor/chordictionary.min.js',
    'js/vendor/chords-db.js',
  ];
  let _libsPromise = null;
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = () => resolve(src);
      s.onerror = () => reject(new Error('Falha ao carregar ' + src));
      document.head.appendChild(s);
    });
  }
  function ensureLibs() {
    if (_libsPromise) return _libsPromise;
    _libsPromise = Promise.all(VENDOR.map(loadScript))
      .then(() => true)
      .catch(err => { _libsPromise = null; throw err; });
    return _libsPromise;
  }

  // ── Note / chord → chords-db lookup ───────────────────────
  // chords-db keys mix sharps and flats; index by pitch class.
  const DB_KEYS = ['C', 'Csharp', 'D', 'Eb', 'E', 'F', 'Fsharp', 'G', 'Ab', 'A', 'Bb', 'B'];

  // App chord symbols → chords-db suffix. `null` = no library data.
  const SUFFIX_MAP = {
    '': 'major', 'm': 'minor', '°': 'dim', 'dim': 'dim', '°7': 'dim7',
    '+': 'aug', 'aug': 'aug', 'sus2': 'sus2', 'sus4': 'sus4', '7sus4': '7sus4',
    'maj7': 'maj7', '7': '7', 'm7': 'm7', 'mM7': 'mmaj7', 'mMaj7': 'mmaj7',
    'm7♭5': 'm7b5', 'm7b5': 'm7b5', '6': '6', 'm6': 'm6', '6/9': '69',
    'add9': 'add9', 'madd9': 'madd9', 'maj9': 'maj9', '9': '9', 'm9': 'm9',
    '7♭5': '7b5', '7♯5': 'aug7', '7♭9': '7b9', '7♯9': '7#9',
    '11': '11', 'maj13': 'maj13', '13': '13', 'maj11': 'maj11', 'm11': 'm11',
    '5': null,
  };

  function dbKey(note) { return DB_KEYS[noteIdx(rawNote(note))]; }
  function suffixFor(sym) {
    if (sym in SUFFIX_MAP) return SUFFIX_MAP[sym];
    return sym || 'major';
  }
  function shapesFor(rootNote, sym) {
    const db = window.GUITAR_CHORDS_DB;
    if (!db) return [];
    const suffix = suffixFor(sym);
    if (!suffix) return [];
    const arr = db.chords[dbKey(rootNote)] || [];
    const entry = arr.find(c => c.suffix === suffix);
    return entry ? entry.positions : [];
  }

  function toSVGuitar(pos, numStrings) {
    const fingers = [];
    pos.frets.forEach((f, i) => {
      const stringNum = numStrings - i;
      if (f === -1) { fingers.push([stringNum, 'x']); return; }
      if (f === 0) { fingers.push([stringNum, 0]); return; }
      const fg = pos.fingers && pos.fingers[i];
      fingers.push([stringNum, f, fg && fg > 0 ? String(fg) : '']);
    });
    const barres = (pos.barres || []).map(bf => {
      const matched = [];
      pos.frets.forEach((f, i) => { if (f === bf) matched.push(numStrings - i); });
      const from = matched.length ? Math.max(...matched) : numStrings;
      const to = matched.length ? Math.min(...matched) : 1;
      return { fromString: from, toString: to, fret: bf };
    });
    return { fingers, barres, position: pos.baseFret || 1 };
  }

  const svgColors = cssVarCache({
    ink: ['--ink', '#2C2C2C'],
    line: ['--cd-grid', '#b9aeb0'],
    accent: ['--accent', '#F7374F'],
    marker: ['--ink-faint', '#a89ea0'],
  });

  function renderDiagram(container, pos) {
    const db = window.GUITAR_CHORDS_DB;
    const numStrings = (db && db.main && db.main.strings) || 6;
    const cfg = toSVGuitar(pos, numStrings);
    let maxRel = 4;
    pos.frets.forEach(f => { if (f > maxRel) maxRel = f; });
    (pos.barres || []).forEach(b => { if (b > maxRel) maxRel = b; });
    const c = svgColors();
    try {
      new svguitar.SVGuitarChord(container)
        .configure({
          strings: numStrings,
          frets: maxRel,
          position: cfg.position,
          orientation: 'vertical',
          backgroundColor: 'transparent',
          color: c.ink,
          fretColor: c.line,
          fingerColor: c.accent,
          fingerTextColor: '#ffffff',
          fingerSize: 0.62,
          fretMarkerColor: c.marker,
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          strokeWidth: 1.4,
          nutWidth: 6,
          fretLabelFontSize: 26,
          tuningsFontSize: 22,
        })
        .chord({ fingers: cfg.fingers, barres: cfg.barres })
        .draw();
    } catch (e) {
      container.textContent = 'diagrama indisponível';
    }
  }

  // Strum the real voicing using the position's MIDI notes.
  function strumMidi(midi) {
    if (!midi || !midi.length || !SonAudio.isOn()) return;
    SonAudio.ensure();
    midi.forEach((m, i) => {
      const pc = ((m % 12) + 12) % 12;
      const oct = Math.floor(m / 12) - 1;
      SonAudio.playNote(CHROMATIC[pc], oct, i * 0.045, 1.5, 0.5);
    });
  }

  // ── Shapes modal ──────────────────────────────────────────
  let _lastFocus = null;
  function modalEls() {
    return {
      modal: document.getElementById('shapesModal'),
      title: document.getElementById('shapesModalTitle'),
      notes: document.getElementById('shapesModalNotes'),
      body: document.getElementById('shapesModalBody'),
    };
  }

  function openShapes(rootNote, sym, displayName) {
    const { modal, title, notes, body } = modalEls();
    if (!modal) return;
    _lastFocus = document.activeElement;
    const name = displayName || (fmt(rootNote) + (sym || ''));
    title.textContent = name;
    notes.textContent = 'carregando formas…';
    body.innerHTML = '';
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    document.getElementById('shapesModalClose').focus();

    ensureLibs().then(() => {
      const cn = (typeof tonalChordNotes === 'function') ? tonalChordNotes(rootNote, sym) : null;
      notes.textContent = cn && cn.length ? cn.map(n => fmt(n)).join(' · ') : '';
      const positions = shapesFor(rootNote, sym);
      body.innerHTML = '';
      if (!positions.length) {
        const empty = document.createElement('div');
        empty.className = 'shapes-empty';
        empty.textContent = 'Sem diagramas no banco de dados para este acorde. ' +
          'Tente uma forma mais comum (tríade ou tétrade de 7ª).';
        body.appendChild(empty);
        return;
      }
      positions.forEach((pos, i) => {
        const card = document.createElement('div');
        card.className = 'shape-card';

        const diagram = document.createElement('div');
        diagram.className = 'shape-diagram';
        card.appendChild(diagram);

        const meta = document.createElement('div');
        meta.className = 'shape-meta';
        const fretLbl = pos.baseFret > 1 ? `casa ${pos.baseFret}` : 'posição aberta';
        meta.innerHTML = `<span class="shape-idx">forma ${i + 1}</span>` +
          `<span class="shape-fret">${esc(fretLbl)}</span>`;
        card.appendChild(meta);

        const play = document.createElement('button');
        play.type = 'button';
        play.className = 'shape-play';
        play.setAttribute('aria-label', `Tocar forma ${i + 1} de ${name}`);
        play.textContent = '▶ tocar';
        play.addEventListener('click', () => strumMidi(pos.midi));
        card.appendChild(play);

        body.appendChild(card);
        renderDiagram(diagram, pos);
      });
    }).catch(() => {
      notes.textContent = '';
      body.innerHTML = '<div class="shapes-empty">Não foi possível carregar as bibliotecas de acordes.</div>';
    });
  }

  function closeShapes() {
    const { modal, body } = modalEls();
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    body.innerHTML = '';
    if (_lastFocus && _lastFocus.focus) _lastFocus.focus();
  }

  function bindModal() {
    const modal = document.getElementById('shapesModal');
    if (!modal) return;
    modal.addEventListener('click', e => {
      if (e.target.closest('[data-shapes-close]') || e.target === modal) closeShapes();
    });
    const closeBtn = document.getElementById('shapesModalClose');
    if (closeBtn) closeBtn.addEventListener('click', closeShapes);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !modal.hidden) closeShapes();
    });
  }

  // ── Harmonic field (campo harmônico) ──────────────────────
  const state = { type: 'maior', seventh: false };

  function fieldFor(root, type, flat) {
    const scale = type === 'menor' ? SCALES['Menor Natural'] : SCALES['Maior (Jônico)'];
    const tris = diatonicTriads(root, scale.i, flat);
    return tris.map(t => {
      const triSuffix = stripRoot(t.triadSym, t.chordRoot);
      const sevSuffix = t.seventhSym ? stripRoot(t.seventhSym, t.chordRoot) : null;
      return {
        idx: t.idx,
        roman: t.roman,
        chordRoot: t.chordRoot,
        triadSym: t.triadSym,
        seventhSym: t.seventhSym,
        triSuffix,
        sevSuffix,
        quality: t.quality,
        notes: t.notes,
        notes7: t.notes7,
        triadSemis: t.triadSemis,
        seventhSemis: t.seventhSemis,
        rootOctOffset: t.rootOctOffset,
        func: degreeFunction(type, t.idx),
      };
    });
  }
  function stripRoot(sym, root) { return sym.slice(fmt(root).length); }

  // Tonal function colour grouping (very rough, for visual rhythm).
  function degreeFunction(type, idx) {
    if (type === 'menor') {
      if (idx === 0) return 'tonic';
      if (idx === 3 || idx === 1) return 'subdom';
      if (idx === 4 || idx === 6) return 'dom';
      return 'mediant';
    }
    if (idx === 0) return 'tonic';
    if (idx === 3 || idx === 1) return 'subdom';
    if (idx === 4 || idx === 6) return 'dom';
    return 'mediant';
  }

  // ── Wheel (círculo do campo harmônico) ────────────────────
  const wheelColors = cssVarCache({
    ring: ['--circle-ring-line', '#2C2C2C'],
    label: ['--circle-label', '#2C2C2C'],
    labelDim: ['--circle-label-dim', '#5a4f52'],
    center: ['--circle-center', '#2C2C2C'],
    centerInk: ['--circle-center-ink', '#ffffff'],
    centerSub: ['--circle-center-sub', '#b9aeb0'],
    surface: ['--surface', '#ffffff'],
    tonic: ['--accent', '#F7374F'],
    dom: ['--accent-2', '#88304E'],
    subdom: ['--accent-3', '#522546'],
    mediant: ['--ink-dim', '#8a7e82'],
  });
  const FUNC_COLOR = { tonic: 'tonic', dom: 'dom', subdom: 'subdom', mediant: 'mediant' };

  let _wheelField = [];
  function renderWheel(root, flat) {
    const cvs = document.getElementById('campoCanvas');
    if (!cvs) return;
    const field = fieldFor(root, state.type, flat);
    _wheelField = field;
    const { ctx, W, H } = setupHiDPI(cvs);
    cvs.style.width = '';
    cvs.style.height = '';
    const cx = W / 2, cy = H / 2;
    const RO = Math.min(W, H) / 2 - 6, RI = RO * 0.52;
    const C = wheelColors();
    const n = field.length; // 7
    ctx.clearRect(0, 0, W, H);

    field.forEach((d, i) => {
      // Tonic at top, going clockwise.
      const a1 = (i / n) * Math.PI * 2 - Math.PI / 2 - Math.PI / n;
      const a2 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2 - Math.PI / n;
      const am = (a1 + a2) / 2;
      const fillCol = C[FUNC_COLOR[d.func] || 'mediant'];
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a1) * RI, cy + Math.sin(a1) * RI);
      ctx.arc(cx, cy, RO, a1, a2);
      ctx.arc(cx, cy, RI, a2, a1, true);
      ctx.closePath();
      ctx.fillStyle = fillCol;
      ctx.globalAlpha = d.func === 'tonic' ? 1 : 0.86;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = C.surface; ctx.lineWidth = 2; ctx.stroke();

      const rMid = (RO + RI) / 2;
      const lx = cx + Math.cos(am) * rMid, ly = cy + Math.sin(am) * rMid;
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '600 12px JetBrains Mono, monospace';
      ctx.fillText(d.roman, lx, ly - 12);
      const sym = state.seventh && d.seventhSym ? d.seventhSym : d.triadSym;
      ctx.font = '600 17px Fraunces, serif';
      ctx.fillText(sym, lx, ly + 6);
    });

    // Center hub
    ctx.beginPath(); ctx.arc(cx, cy, RI - 6, 0, Math.PI * 2);
    ctx.fillStyle = C.center; ctx.fill();
    ctx.fillStyle = C.centerInk;
    ctx.font = '600 26px Fraunces, serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(fmt(root), cx, cy - 10);
    ctx.fillStyle = C.centerSub;
    ctx.font = '500 10px JetBrains Mono, monospace';
    ctx.fillText('CAMPO ' + (state.type === 'menor' ? 'MENOR' : 'MAIOR'), cx, cy + 14);
    ctx.textBaseline = 'alphabetic';
  }

  function wheelHit(cvs, evt, root) {
    const { x: lx, y: ly, W, H } = canvasLogicalXY(cvs, evt);
    const x = lx - W / 2, y = ly - H / 2;
    const d = Math.sqrt(x * x + y * y);
    const RO = Math.min(W, H) / 2 - 6, RI = RO * 0.52;
    if (d < RI || d > RO) return null;
    const n = _wheelField.length || 7;
    let angle = Math.atan2(y, x) + Math.PI / 2 + Math.PI / n;
    angle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const idx = Math.floor((angle / (Math.PI * 2)) * n) % n;
    return _wheelField[idx] || null;
  }

  // ── Field cards (the "common chords" of the key) ──────────
  function fieldCardHTML(d, seventh) {
    const sym = seventh && d.seventhSym ? d.seventhSym : d.triadSym;
    const notes = (seventh && d.notes7 ? d.notes7 : d.notes).map(fmt).join(' · ');
    return `
      <div class="campo-card-roman">${esc(d.roman)}</div>
      <div class="campo-card-sym">${esc(sym)}</div>
      <div class="campo-card-notes">${notes}</div>
      <span class="campo-card-hint">⌗ formas</span>`;
  }
  function renderField(root, flat) {
    const grid = document.getElementById('campoField');
    if (!grid) return;
    const field = fieldFor(root, state.type, flat);
    grid.innerHTML = '';
    field.forEach(d => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'campo-card func-' + d.func;
      card.dataset.degreeIdx = d.idx;
      card.innerHTML = fieldCardHTML(d, state.seventh);
      grid.appendChild(card);
    });
  }

  // Resolve a degree index to its chord (respecting the 7ª toggle).
  function chordAtDegree(root, flat, idx) {
    const field = fieldFor(root, state.type, flat);
    const d = field.find(x => x.idx === idx);
    if (!d) return null;
    const seventh = state.seventh && d.seventhSym;
    return {
      chordRoot: d.chordRoot,
      sym: seventh ? d.sevSuffix : d.triSuffix,
      display: seventh ? d.seventhSym : d.triadSym,
      semis: seventh && d.seventhSemis ? d.seventhSemis : d.triadSemis,
      rootOctOffset: d.rootOctOffset,
      roman: d.roman,
    };
  }

  // ── Common sequences inside a campo ───────────────────────
  const SEQUENCES = {
    maior: [
      { label: 'I – V – vi – IV', tag: 'Pop', degs: [0, 4, 5, 3] },
      { label: 'vi – IV – I – V', tag: 'Pop', degs: [5, 3, 0, 4] },
      { label: 'ii – V – I', tag: 'Jazz', degs: [1, 4, 0] },
      { label: 'I – vi – IV – V', tag: 'Doo-wop', degs: [0, 5, 3, 4] },
      { label: 'I – IV – V', tag: 'Clássica', degs: [0, 3, 4] },
      { label: 'I – iii – IV – V', tag: 'Romântica', degs: [0, 2, 3, 4] },
    ],
    menor: [
      { label: 'i – VI – III – VII', tag: 'Épica', degs: [0, 5, 2, 6] },
      { label: 'i – iv – v', tag: 'Menor', degs: [0, 3, 4] },
      { label: 'i – VII – VI – VII', tag: 'Andaluza', degs: [0, 6, 5, 6] },
      { label: 'i – iv – VII – III', tag: 'Circular', degs: [0, 3, 6, 2] },
      { label: 'ii° – v – i', tag: 'Sombria', degs: [1, 4, 0] },
    ],
  };

  function renderSequences() {
    const grid = document.getElementById('campoSequences');
    if (!grid) return;
    grid.innerHTML = '';
    (SEQUENCES[state.type] || []).forEach((seq, i) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'campo-seq';
      chip.dataset.seqIdx = i;
      chip.innerHTML = `<span class="campo-seq-tag">${esc(seq.tag)}</span>` +
        `<span class="campo-seq-label">${esc(seq.label)}</span>`;
      grid.appendChild(chip);
    });
    const detail = document.getElementById('campoSeqDetail');
    if (detail) detail.innerHTML = '';
  }

  function showSequence(root, flat, seqIdx) {
    const seq = (SEQUENCES[state.type] || [])[seqIdx];
    const detail = document.getElementById('campoSeqDetail');
    if (!seq || !detail) return;
    document.querySelectorAll('#campoSequences .campo-seq').forEach(c =>
      c.classList.toggle('active', +c.dataset.seqIdx === seqIdx));

    const seen = new Set();
    detail.innerHTML = `<div class="campo-seq-detail-head">Acordes em comum · <strong>${esc(seq.label)}</strong></div>`;
    const row = document.createElement('div');
    row.className = 'campo-seq-chords';
    seq.degs.forEach(idx => {
      const c = chordAtDegree(root, flat, idx);
      if (!c) return;
      const dup = seen.has(c.display); seen.add(c.display);
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'campo-seq-chord' + (dup ? ' repeat' : '');
      b.dataset.degreeIdx = String(idx);
      b.dataset.chordRoot = c.chordRoot;
      b.dataset.chordSym = c.sym == null ? '' : c.sym;
      b.dataset.chordDisplay = c.display;
      b.innerHTML = `<span class="csc-roman">${esc(c.roman)}</span><span class="csc-sym">${esc(c.display)}</span>`;
      row.appendChild(b);
    });
    detail.appendChild(row);
    requestAnimationFrame(() => detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  }

  // ── Fretboard chord analyzer (chordictionary) ─────────────
  const analyzer = { on: false, frets: [null, null, null, null, null, null] };

  function resetAnalyzer(numStrings) {
    analyzer.frets = new Array(numStrings || 6).fill(null);
  }
  function setAnalyzerFret(stringIdx, fret) {
    if (stringIdx < 0 || stringIdx >= analyzer.frets.length) return;
    // Tap the same fret again to clear that string.
    analyzer.frets[stringIdx] = (analyzer.frets[stringIdx] === fret) ? null : fret;
  }
  function toggleStringGutter(stringIdx) {
    // Cycle muted (null) → open (0) → muted.
    const cur = analyzer.frets[stringIdx];
    analyzer.frets[stringIdx] = (cur === 0) ? null : 0;
  }

  function tuningToChordictionary(tuning) {
    return tuning.map(s => {
      let n = parseNote(s).n;
      if (n.includes('b') && ENHARMONIC[n]) n = ENHARMONIC[n]; // flats → sharps
      return n;
    }).join('');
  }

  function runAnalysis(tuning) {
    const out = document.getElementById('analyzerResult');
    if (!out) return;
    const played = analyzer.frets.filter(f => f != null);
    if (played.length < 2) {
      out.hidden = false;
      out.innerHTML = '<div class="analyzer-empty">Toque em pelo menos duas notas no braço para reconhecer um acorde.</div>';
      return;
    }
    out.hidden = false;
    out.innerHTML = '<div class="analyzer-empty">analisando…</div>';

    // Notes actually played, for display + fallback detection.
    const playedNotes = [];
    analyzer.frets.forEach((f, i) => {
      if (f == null) return;
      const open = parseNote(tuning[i]).n;
      playedNotes.push(CHROMATIC[(noteIdx(open) + f) % 12]);
    });

    ensureLibs().then(() => {
      let names = [];
      let info = null;
      const anyHigh = analyzer.frets.some(f => f != null && f > 9);
      if (!anyHigh) {
        try {
          const tab = analyzer.frets.map(f => f == null ? 'x' : String(f)).join('');
          const tuningStr = tuningToChordictionary(tuning);
          const inst = new chordictionary.Instrument(tuningStr, 17);
          info = inst.getChordInfo(tab);
          if (info && info.chords && info.chords.length) {
            names = info.chords.map(c => c.name);
          }
        } catch (e) { /* fall back below */ }
      }
      // Tonal fallback (also used for frets above the 9th).
      if (!names.length && typeof Tonal !== 'undefined' && Tonal.Chord) {
        const uniq = [...new Set(playedNotes)];
        names = Tonal.Chord.detect(uniq) || [];
      }
      renderAnalysis(out, names, info, playedNotes, anyHigh);
    }).catch(() => {
      out.innerHTML = '<div class="analyzer-empty">Não foi possível carregar o analisador.</div>';
    });
  }

  function renderAnalysis(out, names, info, playedNotes, anyHigh) {
    const notesTxt = [...new Set(playedNotes)].map(fmt).join(' · ');
    if (!names.length) {
      out.innerHTML =
        `<div class="analyzer-none">Notas: <strong>${esc(notesTxt)}</strong> — não corresponde a um acorde conhecido.</div>`;
      return;
    }
    const primary = names[0];
    const alts = names.slice(1, 6);
    const chord0 = info && info.chords && info.chords[0];
    const formula = chord0 && chord0.formula ? chord0.formula.join(' · ') : '';
    out.innerHTML = `
      <div class="analyzer-name">${esc(primary)}</div>
      <div class="analyzer-sub">notas: <strong>${esc(notesTxt)}</strong>${formula ? ` · fórmula: ${esc(formula)}` : ''}</div>
      ${alts.length ? `<div class="analyzer-alts"><span>também:</span> ${alts.map(a => `<code>${esc(a)}</code>`).join(' ')}</div>` : ''}
      ${anyHigh ? '<div class="analyzer-note">casas acima da 9ª: reconhecido por Tonal.js.</div>' : ''}`;
  }

  function bind() { bindModal(); }

  return {
    ensureLibs, state,
    shapesFor, openShapes, closeShapes,
    renderWheel, wheelHit, renderField, renderSequences, showSequence,
    chordAtDegree, fieldFor,
    analyzer, resetAnalyzer, setAnalyzerFret, toggleStringGutter, runAnalysis,
    bind,
  };
})();
