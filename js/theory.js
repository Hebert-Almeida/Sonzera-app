const CHROMATIC  = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const ENHARMONIC = {'C#':'Db','D#':'Eb','F#':'Gb','G#':'Ab','A#':'Bb','Db':'C#','Eb':'D#','Gb':'F#','Ab':'G#','Bb':'A#'};
const LETTERS = ['C','D','E','F','G','A','B'];
const LETTER_PC = {C:0, D:2, E:4, F:5, G:7, A:9, B:11};

const IV = [
  {st:0,  name:'Uníssono',      abbr:'1ª justa',   role:'Tônica',               q:'Justa',              c:'#c8a84a'},
  {st:1,  name:'2ª Menor',      abbr:'2ª menor',   role:'Supertônica ♭',         q:'Menor',              c:'#d44f3a'},
  {st:2,  name:'2ª Maior',      abbr:'2ª maior',   role:'Supertônica',           q:'Maior',              c:'#d4843a'},
  {st:3,  name:'3ª Menor',      abbr:'3ª menor',   role:'Mediante (menor)',      q:'Menor',              c:'#c9aa3a'},
  {st:4,  name:'3ª Maior',      abbr:'3ª maior',   role:'Mediante (maior)',      q:'Maior',              c:'#3aad72'},
  {st:5,  name:'4ª Justa',      abbr:'4ª justa',   role:'Subdominante',          q:'Justa',              c:'#2aaa96'},
  {st:6,  name:'Trítono',       abbr:'4ª aum / 5ª dim', role:'Trítono',         q:'Aumentada/Diminuta', c:'#9a4ad4'},
  {st:7,  name:'5ª Justa',      abbr:'5ª justa',   role:'Dominante',             q:'Justa',              c:'#3a82d4'},
  {st:8,  name:'6ª Menor',      abbr:'6ª menor',   role:'Submediante (menor)',   q:'Menor',              c:'#5a7ad4'},
  {st:9,  name:'6ª Maior',      abbr:'6ª maior',   role:'Submediante (maior)',   q:'Maior',              c:'#1abc9c'},
  {st:10, name:'7ª Menor',      abbr:'7ª menor',   role:'Subtônica',             q:'Menor',              c:'#d44a6a'},
  {st:11, name:'7ª Maior',      abbr:'7ª maior',   role:'Sensível',              q:'Maior',              c:'#8a4ad4'},
  {st:12, name:'Oitava',        abbr:'8ª justa',   role:'Tônica (oitava)',       q:'Justa',              c:'#c8a84a'},
];

const SCALES = {
  'Maior (Jônico)':       {i:[0,2,4,5,7,9,11],     cat:'Diatônica',  desc:'A escala maior. Alegre, brilhante, resolutiva.'},
  'Menor Natural':        {i:[0,2,3,5,7,8,10],     cat:'Diatônica',  desc:'Modo eólio. Triste, melancólica, introspectiva.'},
  'Menor Harmônica':      {i:[0,2,3,5,7,8,11],     cat:'Menor',      desc:'Menor com 7ª maior. Dramática, cor oriental.'},
  'Menor Melódica':       {i:[0,2,3,5,7,9,11],     cat:'Menor',      desc:'Menor ascendente do jazz. Sofisticada e ambígua.'},
  'Dórico':               {i:[0,2,3,5,7,9,10],     cat:'Modal',      desc:'Menor com 6ª maior. Misterioso e modal.'},
  'Frígio':               {i:[0,1,3,5,7,8,10],     cat:'Modal',      desc:'Tensão espanhola. 2ª menor dá cor flamenca.'},
  'Lídio':                {i:[0,2,4,6,7,9,11],     cat:'Modal',      desc:'Maior com 4ª aumentada. Sonhador, etéreo.'},
  'Mixolídio':            {i:[0,2,4,5,7,9,10],     cat:'Modal',      desc:'Maior com 7ª menor. Blues, folk, dominante.'},
  'Lócrio':               {i:[0,1,3,5,6,8,10],     cat:'Modal',      desc:'Diminuto. Tenso, raro, instável.'},
  'Pentatônica Maior':    {i:[0,2,4,7,9],          cat:'Pentatônica',desc:'Sem dissonâncias. Pop, country, folk.'},
  'Pentatônica Menor':    {i:[0,3,5,7,10],         cat:'Pentatônica',desc:'Base do blues e rock. Cinco notas, muita alma.'},
  'Blues':                {i:[0,3,5,6,7,10],       cat:'Blues',      desc:'Pentatônica menor com blue note (b5).'},
  'Blues Maior':          {i:[0,2,3,4,7,9],        cat:'Blues',      desc:'Pentatônica maior com b3 cromática.'},
  'Frígio Dominante':     {i:[0,1,4,5,7,8,10],     cat:'Exótica',    desc:'5º modo da menor harmônica. Flamenco, klezmer.'},
  'Lídio b7':             {i:[0,2,4,6,7,9,10],     cat:'Exótica',    desc:'Lídio com 7ª menor. Jazz fusion.'},
  'Húngara Menor':        {i:[0,2,3,6,7,8,11],     cat:'Exótica',    desc:'Menor com 4ª aumentada. Sabor cigano (gypsy minor).'},
  'Dupla Harmônica':      {i:[0,1,4,5,7,8,11],     cat:'Exótica',    desc:'Gypsy major / bizantina. Dois aumentados — Oriente Médio.'},
  'Napolitana Menor':     {i:[0,1,3,5,7,8,11],     cat:'Exótica',    desc:'Frígio com 7ª maior. Dramática, de origem italiana.'},
  'Japonesa (Hirajoshi)': {i:[0,2,3,7,8],          cat:'Mundial',    desc:'Pentatônica tradicional do Japão.'},
  'Árabe':                {i:[0,2,4,5,6,8,10],     cat:'Mundial',    desc:'Meio tons característicos do maqam.'},
  'Enigmática':           {i:[0,1,4,6,8,10,11],    cat:'Moderna',    desc:'Criação de Verdi. Altamente cromática.'},
  'Tons Inteiros':        {i:[0,2,4,6,8,10],       cat:'Simétrica',  desc:'Seis tons. Debussy, Ravel, sensação onírica.'},
  'Diminuta':             {i:[0,2,3,5,6,8,9,11],   cat:'Simétrica',  desc:'Tom-semitom alternado. Jazz moderno.'},
  'Cromática':            {i:[0,1,2,3,4,5,6,7,8,9,10,11], cat:'Simétrica', desc:'Todos os doze semitons.'},
};

const CHORDS = [
  {name:'Maior',         sym:'',     f:[0,4,7],       q:'Tríade Maior'},
  {name:'Menor',         sym:'m',    f:[0,3,7],       q:'Tríade Menor'},
  {name:'Diminuto',      sym:'°',    f:[0,3,6],       q:'Tríade Diminuta'},
  {name:'Aumentado',     sym:'+',    f:[0,4,8],       q:'Tríade Aumentada'},
  {name:'Sus2',          sym:'sus2', f:[0,2,7],       q:'Suspensa 2ª'},
  {name:'Sus4',          sym:'sus4', f:[0,5,7],       q:'Suspensa 4ª'},
  {name:'5 (Power)',     sym:'5',    f:[0,7],         q:'Quinta (Power Chord)'},
  {name:'Maior 7',       sym:'maj7', f:[0,4,7,11],    q:'Tétrade Maior 7ª'},
  {name:'Dominante 7',   sym:'7',    f:[0,4,7,10],    q:'Dominante 7ª'},
  {name:'Menor 7',       sym:'m7',   f:[0,3,7,10],    q:'Tétrade Menor 7ª'},
  {name:'Menor maj7',    sym:'mM7',  f:[0,3,7,11],    q:'Menor com 7ª Maior'},
  {name:'Meio-Diminuto', sym:'m7♭5', f:[0,3,6,10],    q:'Semidiminuto'},
  {name:'Diminuto 7',    sym:'°7',   f:[0,3,6,9],     q:'Diminuto 7ª'},
  {name:'Maior 6',       sym:'6',    f:[0,4,7,9],     q:'Maior com 6ª'},
  {name:'Menor 6',       sym:'m6',   f:[0,3,7,9],     q:'Menor com 6ª'},
  {name:'6/9',           sym:'6/9',  f:[0,4,7,9,14],  q:'Maior 6 com 9ª'},
  {name:'add9',          sym:'add9', f:[0,4,7,14],    q:'Tríade com 9ª'},
  {name:'madd9',         sym:'madd9',f:[0,3,7,14],    q:'Menor com 9ª'},
  {name:'Maior 9',       sym:'maj9', f:[0,4,7,11,14], q:'Maior 9ª'},
  {name:'Dominante 9',   sym:'9',    f:[0,4,7,10,14], q:'Dominante 9ª'},
  {name:'Menor 9',       sym:'m9',   f:[0,3,7,10,14], q:'Menor 9ª'},
  {name:'7♭5',           sym:'7♭5',  f:[0,4,6,10],    q:'Dom. 7ª com 5ª Dim.'},
  {name:'7♯5',           sym:'7♯5',  f:[0,4,8,10],    q:'Dom. 7ª com 5ª Aum.'},
  {name:'7♭9',           sym:'7♭9',  f:[0,4,7,10,13], q:'Dominante 7ª com ♭9'},
  {name:'7♯9',           sym:'7♯9',  f:[0,4,7,10,15], q:'Dominante 7ª com ♯9 (Hendrix)'},
  {name:'11',            sym:'11',   f:[0,7,10,14,17],q:'Dominante 11ª (omite 3ª)'},
  {name:'Maior 13',      sym:'maj13',f:[0,4,7,11,14,21],q:'Maior 13ª'},
  {name:'Dom. 7sus4',    sym:'7sus4',f:[0,5,7,10],    q:'Dominante Suspensa 4ª'},
];

const DEG_ROMAN  = ['I','II','III','IV','V','VI','VII'];
const KEY_SIGS = {
  'C':  {sharps:0, flats:0, accs:[],              name:'Dó Maior'},
  'G':  {sharps:1, flats:0, accs:['F#'],          name:'Sol Maior'},
  'D':  {sharps:2, flats:0, accs:['F#','C#'],     name:'Ré Maior'},
  'A':  {sharps:3, flats:0, accs:['F#','C#','G#'],name:'Lá Maior'},
  'E':  {sharps:4, flats:0, accs:['F#','C#','G#','D#'], name:'Mi Maior'},
  'B':  {sharps:5, flats:0, accs:['F#','C#','G#','D#','A#'], name:'Si Maior'},
  'F#': {sharps:6, flats:0, accs:['F#','C#','G#','D#','A#','E#'], name:'Fá♯ Maior'},
  'C#': {sharps:7, flats:0, accs:['F#','C#','G#','D#','A#','E#','B#'], name:'Dó♯ Maior'},
  'F':  {sharps:0, flats:1, accs:['Bb'],          name:'Fá Maior'},
  'Bb': {sharps:0, flats:2, accs:['Bb','Eb'],     name:'Si♭ Maior'},
  'Eb': {sharps:0, flats:3, accs:['Bb','Eb','Ab'],name:'Mi♭ Maior'},
  'Ab': {sharps:0, flats:4, accs:['Bb','Eb','Ab','Db'], name:'Lá♭ Maior'},
  'Db': {sharps:0, flats:5, accs:['Bb','Eb','Ab','Db','Gb'], name:'Ré♭ Maior'},
  'Gb': {sharps:0, flats:6, accs:['Bb','Eb','Ab','Db','Gb','Cb'], name:'Sol♭ Maior'},
  'Cb': {sharps:0, flats:7, accs:['Bb','Eb','Ab','Db','Gb','Cb','Fb'], name:'Dó♭ Maior'},
};

const TUNINGS = {
  'Padrão (E)':   ['E2','A2','D3','G3','B3','E4'],
  'Drop D':       ['D2','A2','D3','G3','B3','E4'],
  'Open G':       ['D2','G2','D3','G3','B3','D4'],
  'Open D':       ['D2','A2','D3','F#3','A3','D4'],
  'Open E':       ['E2','B2','E3','G#3','B3','E4'],
  'DADGAD':       ['D2','A2','D3','G3','A3','D4'],
  'Drop C':       ['C2','G2','C3','F3','A3','D4'],
  'Meio Tom Abaixo':['Eb2','Ab2','Db3','Gb3','Bb3','Eb4'],
};

function parseRootSpelling(s){
  if (!s) return { letter:'C', acc:0 };
  const clean = String(s).replace('♯','#').replace('♭','b');
  const m = clean.match(/^([A-G])(##|bb|#|b)?$/);
  if (!m) return { letter:'C', acc:0 };
  const a = m[2] || '';
  const acc = a==='##'?2 : a==='bb'?-2 : a==='#'?1 : a==='b'?-1 : 0;
  return { letter:m[1], acc };
}

function accString(n){
  if (n===0) return '';
  if (n===1) return '#';
  if (n===-1) return 'b';
  if (n===2) return '##';
  if (n===-2) return 'bb';
  return '';
}

function noteIdx(n){
  if (n == null) return 0;
  const clean = String(n).replace('♯','#').replace('♭','b');
  const p = parseRootSpelling(clean);
  if (p && (clean.match(/^[A-G](##|bb|#|b)?$/))){
    return ((LETTER_PC[p.letter] + p.acc) % 12 + 12) % 12;
  }
  let i = CHROMATIC.indexOf(clean);
  if (i>=0) return i;
  const e = ENHARMONIC[clean];
  return e ? CHROMATIC.indexOf(e) : 0;
}

function rawNote(n){ return String(n).replace('♯','#').replace('♭','b'); }

function getNote(root, st, flat=false){
  const total = noteIdx(root) + st;
  const idx = ((total % 12) + 12) % 12;
  let n = CHROMATIC[idx];
  if (flat && ENHARMONIC[n]) n = ENHARMONIC[n];
  return n;
}

function noteAt(root, rootOct, st, flat=false){
  const rIdx = noteIdx(rawNote(root));
  const total = rIdx + st;
  const oct = rootOct + Math.floor(total/12);
  const idx = ((total % 12) + 12) % 12;
  let n = CHROMATIC[idx];
  if (flat && ENHARMONIC[n]) n = ENHARMONIC[n];
  return { note:n, oct };
}

function fmt(n){
  return String(n)
    .replace('##','𝄪')
    .replace('bb','𝄫')
    .replace('#','♯')
    .replace('b','♭');
}

const _ESC_MAP = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
function esc(s){
  return String(s ?? '').replace(/[&<>"']/g, c => _ESC_MAP[c]);
}

// Snapshot a set of CSS custom properties into an object, re-reading on
// `themechange`. `getComputedStyle` forces style recalc; caching it shaves
// 5–15ms per redraw on slow devices.
function cssVarCache(spec){
  let cache = null;
  function read(){
    const cs = getComputedStyle(document.documentElement);
    const out = {};
    for (const k in spec) out[k] = cs.getPropertyValue(spec[k][0]).trim() || spec[k][1];
    return out;
  }
  window.addEventListener('themechange', () => { cache = null; });
  return () => cache || (cache = read());
}

// Cap DPR at 2× — 3× phones triple pixel cost without proportional clarity gain.
const _canvasMeta = new WeakMap();
function setupHiDPI(canvas){
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let m = _canvasMeta.get(canvas);
  if (!m){
    m = { W: canvas.width, H: canvas.height, dpr: 0 };
    _canvasMeta.set(canvas, m);
  }
  const ctx = canvas.getContext('2d');
  if (m.dpr !== dpr){
    canvas.style.width  = m.W + 'px';
    canvas.style.height = m.H + 'px';
    canvas.width  = m.W * dpr;
    canvas.height = m.H * dpr;
    m.dpr = dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  return { ctx, W: m.W, H: m.H };
}

function canvasLogicalXY(canvas, evt){
  const m = _canvasMeta.get(canvas) || { W: canvas.width, H: canvas.height };
  const r = canvas.getBoundingClientRect();
  return {
    x: (evt.clientX - r.left) * (m.W / r.width),
    y: (evt.clientY - r.top)  * (m.H / r.height),
    W: m.W,
    H: m.H,
  };
}

// Spell a note by forcing a target letter. Computes the accidental needed so
// that the resulting pitch class matches `root + semis`. Used to enforce the
// "one note per letter" rule of diatonic scales (avoids C–D–D♯–F type errors).
function spellByLetter(rootLetter, rootAcc, targetLetter, semis){
  const rootPc = ((LETTER_PC[rootLetter] + rootAcc) % 12 + 12) % 12;
  const targetPc = ((rootPc + semis) % 12 + 12) % 12;
  const naturalPc = LETTER_PC[targetLetter];
  let acc = ((targetPc - naturalPc) % 12 + 12) % 12;
  if (acc > 6) acc -= 12;
  return targetLetter + accString(acc);
}

// Diatonic spelling for heptatonic scales. Falls back to chromatic spelling
// (with key-aware sharp/flat preference) for non-heptatonic collections.
function spellScaleDiatonic(root, intervals){
  const { letter, acc } = parseRootSpelling(rawNote(root));
  const startIdx = LETTERS.indexOf(letter);
  if (intervals.length === 7){
    return intervals.map((st, i) => {
      const targetLetter = LETTERS[(startIdx + i) % 7];
      return spellByLetter(letter, acc, targetLetter, st);
    });
  }
  // Non-heptatonic: prefer flats if the root is flat or contains a flat
  const useFlats = acc < 0;
  return intervals.map(st => getNote(rawNote(root), st, useFlats));
}

function freq(note, oct){
  const clean = rawNote(note);
  // Tonal handles enharmonic spellings (Cb, E#, B#, Fbb…) correctly via MIDI;
  // fall back to the chromatic table if Tonal isn't loaded yet.
  if (typeof Tonal !== 'undefined' && Tonal.Note){
    const f = Tonal.Note.freq(clean + oct);
    if (f) return f;
  }
  return 440 * Math.pow(2, ((oct-4)*12 + noteIdx(clean) - noteIdx('A')) / 12);
}

// Map our quality symbols (CHORDS[].sym + the few extras used by progressions
// degree pairs) to Tonal chord-type aliases. Self-mappings are intentionally
// omitted — qualitySym already matches Tonal when no rewrite is needed.
const TONAL_QUALITY = {
  'maj':'M', '':'M', 'min':'m',
  'dim':'dim', '°':'dim', 'aug':'aug', '+':'aug',
  'm7♭5':'m7b5', '°7':'dim7', 'mM7':'mMaj7',
  '7♭5':'7b5', '7♯5':'7#5', '7♭9':'7b9', '7♯9':'7#9',
};

const _chordNotesCache = new Map();
const _chordSemisCache = new Map();

// Returns chord notes spelled correctly per the chord root, e.g.
// `tonalChordNotes('Bb', 'maj')` → ['Bb','D','F'] (not ['A#','D','F']).
function tonalChordNotes(rootName, qualitySym){
  const clean = rawNote(rootName);
  const key = clean + '|' + qualitySym;
  if (_chordNotesCache.has(key)) return _chordNotesCache.get(key);
  const alias = TONAL_QUALITY[qualitySym] ?? qualitySym ?? 'M';
  const c = Tonal.Chord.get(clean + alias);
  const notes = (c.notes && c.notes.length) ? c.notes : null;
  _chordNotesCache.set(key, notes);
  return notes;
}

function tonalChordSemis(qualitySym){
  if (_chordSemisCache.has(qualitySym)) return _chordSemisCache.get(qualitySym);
  const alias = TONAL_QUALITY[qualitySym] ?? qualitySym ?? 'M';
  const c = Tonal.Chord.get('C' + alias);
  const semis = (c.intervals && c.intervals.length)
    ? c.intervals.map(iv => Tonal.Interval.semitones(iv))
    : null;
  _chordSemisCache.set(qualitySym, semis);
  return semis;
}

function parseNote(s){
  const m = String(s).match(/^([A-G](?:##|bb|#|b)?)(\d)$/);
  return m ? {n:m[1], o:+m[2]} : {n:'E', o:2};
}

function spellScale(root, intervals, flat=false){
  // Heptatonic scales use diatonic letter-cycling spelling.
  if (intervals.length === 7) return spellScaleDiatonic(root, intervals);
  return intervals.map(st => getNote(root, st, flat));
}

function triadQuality(semis){
  const [r,t,f] = [0, semis[1]-semis[0], semis[2]-semis[0]];
  if (t===4 && f===7) return {name:'Maior', sym:'', deg:'maj'};
  if (t===3 && f===7) return {name:'Menor', sym:'m', deg:'min'};
  if (t===3 && f===6) return {name:'Diminuto', sym:'°', deg:'dim'};
  if (t===4 && f===8) return {name:'Aumentado', sym:'+', deg:'aug'};
  if (t===2 && f===7) return {name:'Sus2', sym:'sus2', deg:'sus'};
  if (t===5 && f===7) return {name:'Sus4', sym:'sus4', deg:'sus'};
  // Less common stacks that show up in exotic / symmetric scales.
  // Symbol parenthesizes alterations so the card never reads "C?" — and
  // never collides with the M7-implies-C♭5 ambiguity of bare "C♭5".
  if (t===2 && f===6) return {name:'Sus2 ♭5',  sym:'sus2(♭5)', deg:'alt'};
  if (t===5 && f===8) return {name:'Sus4 ♯5',  sym:'sus4(♯5)', deg:'alt'};
  if (t===4 && f===6) return {name:'Maior ♭5', sym:'(♭5)',     deg:'alt'};
  if (t===3 && f===8) return {name:'Menor ♯5', sym:'m(♯5)',    deg:'alt'};
  if (t===2 && f===5) return {name:'Quartal',  sym:'(q4)',     deg:'alt'};
  if (t===5 && f===10)return {name:'Quartal',  sym:'(q5)',     deg:'alt'};
  if (t===6 && f===10)return {name:'Tritônica',sym:'(tt)',     deg:'alt'};
  // Catch-all: classify by the fifth so the card still reads sensibly.
  const sym = f===6 ? '(♭5)' : f===8 ? '(♯5)' : '(alt)';
  const name = f===6 ? 'Tríade alterada (♭5)' : f===8 ? 'Tríade alterada (♯5)' : 'Tríade alterada';
  return { name, sym, deg:'alt' };
}

function seventhQuality(triad, seventh){
  if (triad.deg==='maj' && seventh===11) return 'maj7';
  if (triad.deg==='maj' && seventh===10) return '7';
  if (triad.deg==='maj' && seventh===9)  return '6';
  if (triad.deg==='min' && seventh===10) return 'm7';
  if (triad.deg==='min' && seventh===11) return 'mM7';
  if (triad.deg==='min' && seventh===9)  return 'm6';
  if (triad.deg==='dim' && seventh===10) return 'm7♭5';
  if (triad.deg==='dim' && seventh===9)  return '°7';
  if (triad.deg==='dim' && seventh===11) return '°M7';
  if (triad.deg==='aug' && seventh===10) return '7♯5';
  if (triad.deg==='aug' && seventh===11) return 'maj7♯5';
  if (triad.deg==='sus' && seventh===10) return '7sus';
  if (triad.deg==='sus' && seventh===11) return 'M7sus';
  return '';
}

// Returns "4ª A" or "5ª d" depending on the letter distance between two notes.
// Use when you have actual diatonic spellings and want to label a tritone
// contextually. `from` and `to` are spelled note names (e.g. 'B', 'F').
function intervalNameByLetters(from, to, semis){
  const fL = parseRootSpelling(from).letter;
  const tL = parseRootSpelling(to).letter;
  const letterStep = ((LETTERS.indexOf(tL) - LETTERS.indexOf(fL)) % 7 + 7) % 7;
  if (semis === 6){
    return letterStep === 3 ? '4ª Aumentada' : '5ª Diminuta';
  }
  return null;
}

function diatonicTriads(root, intervals, flat=false){
  const n = intervals.length;
  if (n < 7) return [];
  const scaleAbs = intervals;
  const rootIdx = noteIdx(rawNote(root));
  const spelled = spellScaleDiatonic(rawNote(root), intervals);
  const result = [];
  for (let i=0; i<n; i++){
    const r = scaleAbs[i];
    const t = scaleAbs[(i+2)%n] + (i+2>=n ? 12 : 0);
    const f = scaleAbs[(i+4)%n] + (i+4>=n ? 12 : 0);
    const sv = scaleAbs[(i+6)%n] + (i+6>=n ? 12 : 0);
    const semis = [0, (t-r+12)%12, (f-r+12)%12];
    const sev   = (sv-r+12)%12;
    const triad = triadQuality(semis);
    const seventh = seventhQuality(triad, sev);
    const notes  = [0,2,4].map(step => spelled[(i+step)%n]);
    const notes7 = [...notes, spelled[(i+6)%n]];
    const rootNote = notes[0];
    let roman = DEG_ROMAN[i];
    // Lowercase roman for any minor-3rd-on-top quality (min, dim, alt-with-min3).
    const minorish = triad.deg==='min' || triad.deg==='dim'
      || (triad.deg==='alt' && semis[1]===3);
    if (minorish) roman = roman.toLowerCase();
    const fifth = semis[2];
    const suffix = triad.deg==='dim' ? '°'
      : triad.deg==='aug' ? '+'
      : triad.deg==='alt' && fifth===6 ? '(♭5)'
      : triad.deg==='alt' && fifth===8 ? '(♯5)'
      : triad.deg==='alt' ? '(alt)'
      : '';
    result.push({
      idx: i,
      roman: roman + suffix,
      root: rootNote,
      chordRoot: rootNote,
      // Octave offset of this chord's root relative to the tonic's octave.
      // Accounts for the tonic note's own index so e.g. V of A-major sits
      // an octave above A, not at the same octave.
      rootOctOffset: Math.floor((rootIdx + scaleAbs[i]) / 12),
      triadSemis: [0, semis[1], semis[2]],
      seventhSemis: seventh ? [0, semis[1], semis[2], sev] : null,
      triadSym: fmt(rootNote) + triad.sym,
      seventhSym: seventh ? fmt(rootNote) + seventh : null,
      quality: triad.name,
      notes, notes7,
    });
  }
  return result;
}

function keySignatureFor(root){
  const exact = KEY_SIGS[root];
  if (exact) return exact;
  const enh = ENHARMONIC[root];
  if (enh && KEY_SIGS[enh]) return KEY_SIGS[enh];
  return null;
}

const COF_M = ['C','G','D','A','E','B','F#','Db','Ab','Eb','Bb','F'];
const COF_m = ['Am','Em','Bm','F#m','C#m','G#m','D#m','Bbm','Fm','Cm','Gm','Dm'];
