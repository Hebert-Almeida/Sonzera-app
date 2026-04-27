const CAGED_SHAPES = {
  'Maior': {
    'E': {frets:[0,2,2,1,0,0],  rootString:5, rootFret:0},
    'A': {frets:[-1,0,2,2,2,0], rootString:4, rootFret:0},
    'D': {frets:[-1,-1,0,2,3,2],rootString:3, rootFret:0},
    'G': {frets:[3,2,0,0,0,3],  rootString:5, rootFret:3},
    'C': {frets:[-1,3,2,0,1,0], rootString:4, rootFret:3},
  },
  'Menor': {
    'Em':{frets:[0,2,2,0,0,0],  rootString:5, rootFret:0},
    'Am':{frets:[-1,0,2,2,1,0], rootString:4, rootFret:0},
    'Dm':{frets:[-1,-1,0,2,3,1],rootString:3, rootFret:0},
  },
  'Dominante 7': {
    'E7':{frets:[0,2,0,1,0,0],  rootString:5, rootFret:0},
    'A7':{frets:[-1,0,2,0,2,0], rootString:4, rootFret:0},
    'D7':{frets:[-1,-1,0,2,1,2],rootString:3, rootFret:0},
  },
  'Maior 7': {
    'Emaj7':{frets:[0,2,1,1,0,0],rootString:5, rootFret:0},
    'Amaj7':{frets:[-1,0,2,1,2,0],rootString:4,rootFret:0},
    'Cmaj7':{frets:[-1,3,2,0,0,0],rootString:4,rootFret:3},
  },
  'Menor 7': {
    'Em7':{frets:[0,2,0,0,0,0], rootString:5, rootFret:0},
    'Am7':{frets:[-1,0,2,0,1,0],rootString:4, rootFret:0},
    'Dm7':{frets:[-1,-1,0,2,1,1],rootString:3,rootFret:0},
  },
};

const NOTE_TO_SEMIS = {'C':0,'C#':1,'Db':1,'D':2,'D#':3,'Eb':3,'E':4,'F':5,'F#':6,'Gb':6,'G':7,'G#':8,'Ab':8,'A':9,'A#':10,'Bb':10,'B':11};

function findBestVoicing(quality, rootNote){
  const shapes = CAGED_SHAPES[quality];
  if (!shapes) return null;
  const rIdx = NOTE_TO_SEMIS[rootNote] ?? 0;
  let best = null;
  for (const [name, shape] of Object.entries(shapes)){
    const shapeRootName = name.replace(/m7♭5|maj7|m7|°7|mM7|sus4|sus2|aug|dim|min|maj|M|m|°|\+|7|6|9|11|13/,'');
    const shapeIdx = NOTE_TO_SEMIS[shapeRootName] ?? 0;
    let offset = (rIdx - shapeIdx + 12) % 12;
    const frets = shape.frets.map(f => f===-1 ? -1 : f + offset);
    const active = frets.filter(f=>f>0);
    if (!active.length) continue;
    const maxF = Math.max(...active);
    const minF = Math.min(...active);
    if (maxF > 14) continue;
    const score = minF + (maxF-minF)*0.3;
    if (!best || score < best.score) best = { frets, offset, score, baseName:name, baseFret:minF };
  }
  return best;
}

const getFretColors = cssVarCache({
  bg:       ['--fretboard-bg',         '#0e0d0b'],
  marker:   ['--fretboard-marker',     '#2a2820'],
  fret:     ['--fretboard-fret',       '#2e2c24'],
  nut:      ['--fretboard-nut',        '#F7374F'],
  label:    ['--fretboard-label',      '#6a6454'],
  labelDim: ['--fretboard-label-dim',  '#4a4438'],
  dot:      ['--note-dot',             '#88304E'],
  root:     ['--note-root',            '#F7374F'],
  ink:      ['--note-ink',             '#ffffff'],
  inkRoot:  ['--note-ink-root',        '#ffffff'],
});

function drawFretboard(canvas, root, intervals, flat, tuning){
  const { ctx, W, H } = setupHiDPI(canvas);
  const STRINGS = 6, FRETS = 17;
  const ML=58, MR=22, MT=34, MB=34;
  const fW=(W-ML-MR)/FRETS, sH=(H-MT-MB)/(STRINGS-1);
  const ri = noteIdx(root);
  const ivMap = {};
  intervals.forEach(iv => { ivMap[noteIdx(getNote(root, iv.st%12, flat))] = iv.c; });

  const C = getFretColors();
  const C_BG = C.bg, C_MARKER = C.marker, C_FRET = C.fret, C_NUT = C.nut;
  const C_LABEL = C.label, C_DIM = C.labelDim, C_DOT = C.dot;
  const C_ROOT = C.root, C_INK = C.ink, C_INK_R = C.inkRoot;

  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = C_BG; ctx.fillRect(0,0,W,H);

  [3,5,7,9,12,15].forEach(f=>{
    const x = ML + f*fW - fW/2;
    ctx.fillStyle = C_MARKER;
    if (f===12){
      [[x,-14],[x,14]].forEach(([px,py])=>{
        ctx.beginPath(); ctx.arc(px, H/2+py, 5, 0, Math.PI*2); ctx.fill();
      });
    } else {
      ctx.beginPath(); ctx.arc(x, H/2, 4.5, 0, Math.PI*2); ctx.fill();
    }
  });

  for (let f=0; f<=FRETS; f++){
    const x = ML + f*fW;
    ctx.strokeStyle = f===0 ? C_NUT : C_FRET;
    ctx.lineWidth = f===0 ? 3.5 : 1;
    ctx.beginPath(); ctx.moveTo(x, MT); ctx.lineTo(x, H-MB); ctx.stroke();
    if (f>0){
      ctx.fillStyle = C_DIM; ctx.font='600 13px JetBrains Mono,monospace'; ctx.textAlign='center';
      ctx.fillText(f, x-fW/2, H-MB+20);
    }
  }

  tuning.forEach((sn,si)=>{
    const y = MT + (STRINGS-1-si)*sH;
    ctx.strokeStyle = C_FRET; ctx.lineWidth = 0.8 + si*0.3;
    ctx.beginPath(); ctx.moveTo(ML, y); ctx.lineTo(W-MR, y); ctx.stroke();
    const {n:openNote} = parseNote(sn);
    ctx.fillStyle = C_LABEL; ctx.font='600 14px JetBrains Mono,monospace';
    ctx.textAlign='right'; ctx.textBaseline='middle';
    ctx.fillText(fmt(openNote), ML-8, y);
  });

  tuning.forEach((sn,si)=>{
    const {n:openNote} = parseNote(sn);
    const y = MT + (STRINGS-1-si)*sH;
    for (let f=0; f<=FRETS; f++){
      const ni = (noteIdx(openNote) + f) % 12;
      if (ivMap[ni] === undefined && ni !== ri) continue;
      if (f === 0) continue;
      const cx = ML + (f-0.5)*fW, cy = y, r=14;
      const isRoot = ni === ri;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
      ctx.fillStyle = isRoot ? C_ROOT : (ivMap[ni] || C_DOT);
      ctx.fill();
      ctx.strokeStyle = isRoot ? C_ROOT : (ivMap[ni] || C_DOT);
      ctx.lineWidth = 1.5; ctx.stroke();
      const rn = getNote(root, (ni-ri+12)%12, flat);
      ctx.fillStyle = isRoot ? C_INK_R : C_INK;
      ctx.font = '700 12px JetBrains Mono,monospace';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(fmt(rn), cx, cy);
    }
  });
  ctx.textBaseline = 'alphabetic';
}

function buildChordDiagram(frets, rootNote, tuning, flat=false){
  const STRINGS=6, SHOW=5, W=100, H=108;
  const ML=16, MT=22, MR=10, MB=18;
  const cW=(W-ML-MR)/(STRINGS-1), cH=(H-MT-MB)/SHOW;
  const active = frets.filter(f=>f>0);
  let minF = active.length ? Math.min(...active) : 1;
  if (minF <= 1) minF = 0; else minF -= 1;
  const ri = noteIdx(rootNote);
  const rootIsFlat = parseRootSpelling(rawNote(rootNote)).acc < 0;
  const useFlats = flat || rootIsFlat;

  let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" class="fret-svg">`;
  if (minF>0) s += `<text x="${ML-3}" y="${MT+cH*.65}" fill="var(--cd-label)" font-size="9" font-family="JetBrains Mono,monospace" font-weight="600" text-anchor="end">${minF+1}fr</text>`;
  if (minF===0) s += `<line x1="${ML}" y1="${MT}" x2="${ML+cW*(STRINGS-1)}" y2="${MT}" stroke="var(--cd-open)" stroke-width="3"/>`;
  for (let f=0; f<=SHOW; f++){
    const y = MT + f*cH;
    s += `<line x1="${ML}" y1="${y}" x2="${ML+cW*(STRINGS-1)}" y2="${y}" stroke="var(--cd-grid)" stroke-width="${f===0&&minF>0?1.5:.7}"/>`;
  }
  for (let si=0; si<STRINGS; si++){
    const x = ML + si*cW;
    s += `<line x1="${x}" y1="${MT}" x2="${x}" y2="${MT+SHOW*cH}" stroke="var(--cd-grid)" stroke-width=".7"/>`;
  }
  frets.forEach((f,si)=>{
    const x = ML + si*cW;
    if (f === -1){
      s += `<text x="${x}" y="${MT-5}" fill="var(--cd-muted)" font-size="12" font-weight="700" text-anchor="middle">×</text>`;
      return;
    }
    if (f === 0){
      s += `<circle cx="${x}" cy="${MT-7}" r="4" fill="none" stroke="var(--cd-label)" stroke-width="1.2"/>`;
      const ni = noteIdx(parseNote(tuning[si]).n);
      const isRoot = ni === ri;
      if (isRoot) s += `<circle cx="${x}" cy="${MT-7}" r="4" fill="var(--cd-open)"/>`;
      return;
    }
    const adj = f - minF;
    if (adj < 1 || adj > SHOW) return;
    const cy = MT + (adj-0.5)*cH;
    const openNoteStr = parseNote(tuning[si]).n;
    const ni = (noteIdx(openNoteStr) + f) % 12;
    const isRoot = ni === ri;
    const semisFromRoot = ((ni - ri) % 12 + 12) % 12;
    const noteName = getNote(rawNote(rootNote), semisFromRoot, useFlats);
    s += `<circle cx="${x}" cy="${cy}" r="7.2" fill="${isRoot?'var(--cd-open)':'var(--cd-fret)'}"/>`;
    s += `<text x="${x}" y="${cy+3.5}" fill="${isRoot?'var(--cd-root-ink)':'var(--cd-fret-ink)'}" font-size="7" font-family="JetBrains Mono,monospace" text-anchor="middle" font-weight="700">${fmt(noteName)}</text>`;
  });
  s += '</svg>';
  return s;
}
