const RHYTHMS = [
  {
    name: 'Samba', origin: 'Brasil — Rio de Janeiro', color: '#e84545',
    sig: '2/4', bpm: 100,
    desc: 'O rei dos ritmos brasileiros. Sincope característico com ênfase no contratempo.',
    beats: [
      { d: 'D', label: '1' }, { d: '.', label: 'e' }, { d: 'D', label: '+' }, { d: 'U', label: 'a' },
      { d: '.', label: '2' }, { d: 'U', label: 'e' }, { d: 'D', label: '+' }, { d: 'U', label: 'a' },
    ],
    tip: 'Mantenha o pulso firme na mão direita. O segredo está no "e" do 2° tempo.'
  },
  {
    name: 'Bossa Nova', origin: 'Brasil — Rio de Janeiro', color: '#4a9de8',
    sig: '4/4', bpm: 75,
    desc: 'Sofisticação de João Gilberto. Samba encontrando jazz, polegar no baixo.',
    // Compasso 4/4 completo em colcheias. Padrão clássico do partido-alto: baixo
    // nos tempos 1 e 3 (polegar), acordes sincopados nos contratempos.
    beats: [
      { d: 'D', label: '1' }, { d: '.', label: '+' }, { d: 'U', label: '2' }, { d: 'U', label: '+' },
      { d: 'D', label: '3' }, { d: 'U', label: '+' }, { d: '.', label: '4' }, { d: 'U', label: '+' },
    ],
    tip: 'Polegar faz o baixo nos tempos 1 e 3. Dedos fazem a síncope suave.'
  },
  {
    name: 'Baião', origin: 'Brasil — Nordeste', color: '#e8a84a',
    sig: '2/4', bpm: 110,
    desc: 'Ritmo nordestino de Luiz Gonzaga. Forte, sincopado, acentuado.',
    beats: [
      { d: 'D', label: '1' }, { d: 'U', label: 'e' }, { d: 'D', label: '+' }, { d: '.', label: 'a' },
      { d: 'U', label: '2' }, { d: 'D', label: 'e' }, { d: 'U', label: '+' }, { d: '.', label: 'a' },
    ],
    tip: 'Acentue o primeiro tempo. Base do forró e do xote nordestino.'
  },
  {
    name: 'Forró', origin: 'Brasil — Nordeste', color: '#e8664a',
    sig: '2/4', bpm: 120,
    desc: 'Ritmo animado do Nordeste. Derivado do baião, rápido e dançante.',
    beats: [
      { d: 'D', label: '1' }, { d: '.', label: 'e' }, { d: 'U', label: '+' }, { d: 'D', label: 'a' },
      { d: '.', label: '2' }, { d: 'U', label: 'e' }, { d: 'D', label: '+' }, { d: 'U', label: 'a' },
    ],
    tip: 'Mantenha energia constante. Popular em festas juninas.'
  },
  {
    name: 'Choro', origin: 'Brasil — Rio de Janeiro', color: '#7a6ad4',
    sig: '2/4', bpm: 95,
    desc: 'Gênero instrumental brasileiro do séc. XIX. Violão faz baixaria.',
    beats: [
      { d: 'D', label: '1' }, { d: 'U', label: 'e' }, { d: '.', label: '+' }, { d: 'D', label: 'a' },
      { d: 'U', label: '2' }, { d: 'D', label: 'e' }, { d: '.', label: '+' }, { d: 'U', label: 'a' },
    ],
    tip: 'Violão de 7 cordas é tradicional. Com 6, enfatize os baixos.'
  },
  {
    name: 'Valsa', origin: 'Europa / Brasil', color: '#4ad4a0',
    sig: '3/4', bpm: 80,
    desc: 'Ritmo ternário elegante. Pixinguinha e Ernesto Nazareth.',
    beats: [
      { d: 'D', label: '1' }, { d: '.', label: '+' }, { d: '.', label: 'a' },
      { d: 'U', label: '2' }, { d: '.', label: '+' }, { d: '.', label: 'a' },
      { d: 'U', label: '3' }, { d: '.', label: '+' }, { d: '.', label: 'a' },
    ],
    tip: 'Tempo 1 forte (baixo), tempos 2 e 3 leves (acorde).'
  },
  {
    name: 'Rock / Pop', origin: 'EUA / Mundial', color: '#d44f8a',
    sig: '4/4', bpm: 100,
    desc: 'Batida simples e poderosa. Base de incontáveis canções.',
    // Compasso 4/4 completo em colcheias (padrão D-DU-UDU clássico).
    beats: [
      { d: 'D', label: '1' }, { d: '.', label: '+' }, { d: 'D', label: '2' }, { d: 'U', label: '+' },
      { d: 'U', label: '3' }, { d: 'D', label: '+' }, { d: 'U', label: '4' }, { d: '.', label: '+' },
    ],
    tip: 'Tempos 2 e 4 são os fortes do rock (backbeat). Strumming firme.'
  },
  {
    name: 'Balada', origin: 'Pop / MPB', color: '#4ad4d4',
    sig: '4/4', bpm: 60,
    desc: 'Músicas lentas e emotivas. Muito comum em MPB e pop.',
    beats: [
      { d: 'D', label: '1' }, { d: '.', label: '+' }, { d: 'U', label: '2' }, { d: '.', label: '+' },
      { d: 'D', label: '3' }, { d: '.', label: '+' }, { d: 'U', label: '4' }, { d: '.', label: '+' },
    ],
    tip: 'Toque suave. Excelente também em dedilhado arpejado.'
  },
  {
    name: 'Reggae', origin: 'Jamaica', color: '#4ad46a',
    sig: '4/4', bpm: 80,
    desc: 'Skank: acordes nos tempos 2 e 4 (one-drop). Som característico de ilha.',
    // Skank verdadeiro 4/4: silêncio em 1 e 3, acorde em 2 e 4.
    beats: [
      { d: '.', label: '1' }, { d: '.', label: '+' }, { d: 'D', label: '2' }, { d: '.', label: '+' },
      { d: '.', label: '3' }, { d: '.', label: '+' }, { d: 'D', label: '4' }, { d: '.', label: '+' },
    ],
    tip: 'Acorde apenas nos tempos 2 e 4 (one-drop). Bateria reforça o tempo 3.'
  },
  {
    name: 'Funk Groove', origin: 'Brasil / EUA', color: '#e8c84a',
    sig: '4/4', bpm: 98,
    desc: 'Groove sincopado em semicolcheias. Funk e neo-soul.',
    // Compasso 4/4 completo em SEMICOLCHEIAS (16 células — única exceção).
    beats: [
      { d: 'D', label: '1' }, { d: 'X', label: 'e' }, { d: 'U', label: '+' }, { d: 'X', label: 'a' },
      { d: 'D', label: '2' }, { d: 'U', label: 'e' }, { d: 'X', label: '+' }, { d: 'U', label: 'a' },
      { d: 'D', label: '3' }, { d: 'X', label: 'e' }, { d: 'U', label: '+' }, { d: 'X', label: 'a' },
      { d: 'D', label: '4' }, { d: 'U', label: 'e' }, { d: 'X', label: '+' }, { d: 'U', label: 'a' },
    ],
    tip: 'Abafados (X) criam o groove. 16 semicolcheias por compasso.'
  },
  {
    name: 'Bolero', origin: 'Cuba / América Latina', color: '#d4a44a',
    sig: '4/4', bpm: 70,
    desc: 'Ritmo romântico latino. Presente na MPB dos anos 50-60.',
    beats: [
      { d: 'D', label: '1' }, { d: '.', label: '+' }, { d: 'D', label: '2' }, { d: 'U', label: '+' },
      { d: 'D', label: '3' }, { d: '.', label: '+' }, { d: 'U', label: '4' }, { d: '.', label: '+' },
    ],
    tip: 'Toque com suavidade. Ideal para músicas românticas.'
  },
  {
    name: 'Xote', origin: 'Brasil — Nordeste', color: '#a44ae8',
    sig: '4/4', bpm: 108,
    desc: 'Derivado do schottische europeu. Cadenciado e dançante.',
    beats: [
      { d: 'D', label: '1' }, { d: '.', label: '+' }, { d: 'U', label: '2' }, { d: 'D', label: '+' },
      { d: 'U', label: '3' }, { d: '.', label: '+' }, { d: 'D', label: '4' }, { d: 'U', label: '+' },
    ],
    tip: 'Mais cadenciado que o forró. Popular em arraiais.'
  },
  {
    name: 'Sertanejo', origin: 'Brasil — Interior', color: '#e88a4a',
    sig: '4/4', bpm: 92,
    desc: 'Padrão clássico do sertanejo de raiz e universitário.',
    beats: [
      { d: 'D', label: '1' }, { d: '.', label: '+' }, { d: 'D', label: '2' }, { d: 'U', label: '+' },
      { d: 'D', label: '3' }, { d: 'U', label: '+' }, { d: 'D', label: '4' }, { d: 'U', label: '+' },
    ],
    tip: 'Baixos alternados com strumming de dedos.'
  },
  {
    name: 'Pagode', origin: 'Brasil — Rio de Janeiro', color: '#4ae89d',
    sig: '2/4', bpm: 96,
    desc: 'Samba de roda, mais cadenciado. Leve, festivo.',
    beats: [
      { d: 'D', label: '1' }, { d: 'U', label: 'e' }, { d: 'X', label: '+' }, { d: 'U', label: 'a' },
      { d: 'D', label: '2' }, { d: 'U', label: 'e' }, { d: 'X', label: '+' }, { d: 'U', label: 'a' },
    ],
    tip: 'Leveza e swing. Os abafados dão o tempero.'
  },
  {
    name: 'Shuffle / Blues', origin: 'EUA — Delta', color: '#8ae84a',
    sig: '12/8', bpm: 90,
    desc: 'Swing do blues. Colcheias com feel ternário (long-short).',
    // 12/8 ou 4/4 com tercinas. Labels de tercina (1-trip-let) — não 16ºs.
    beats: [
      { d: 'D', label: '1' }, { d: '.', label: 'tri' }, { d: 'U', label: 'let' },
      { d: 'D', label: '2' }, { d: '.', label: 'tri' }, { d: 'U', label: 'let' },
      { d: 'D', label: '3' }, { d: '.', label: 'tri' }, { d: 'U', label: 'let' },
      { d: 'D', label: '4' }, { d: '.', label: 'tri' }, { d: 'U', label: 'let' },
    ],
    tip: 'Tercina: long-short, long-short. Alma do blues. Subdivisão ternária.'
  },
];

const Rhythm = (() => {
  const state = { playing: false, current: null, beat: 0, scheduleId: null, bpm: 90 };

  // Cell duration in seconds. Simple meters (2/4, 3/4, 4/4) treat the BPM as
  // quarter notes; compound meters (6/8, 9/8, 12/8) treat the BPM as dotted
  // quarters (the felt beat).
  function cellDuration() {
    const r = state.current;
    if (!r) return 60 / state.bpm / 2;
    const [num, den] = r.sig.split('/').map(Number);
    const isCompound = (den === 8 && num % 3 === 0);
    const beatsPerBar = isCompound ? num / 3 : num;
    const barSeconds = beatsPerBar * 60 / state.bpm;
    return barSeconds / r.beats.length;
  }

  function isShuffle(r) {
    return r && /shuffle|blues/i.test(r.name);
  }

  function clearSchedule() {
    if (state.scheduleId !== null && typeof Tone !== 'undefined') {
      try { Tone.Transport.clear(state.scheduleId); } catch (_) { }
    }
    state.scheduleId = null;
  }

  let lastActive = null;
  function scheduleLoop() {
    clearSchedule();
    if (typeof Tone === 'undefined') return;
    const interval = cellDuration();
    state.scheduleId = Tone.Transport.scheduleRepeat((time) => {
      const r = state.current;
      if (!r) return;
      const idx = state.beat;
      const b = r.beats[idx];
      if (b.d !== '.') SonAudio.percAt(b.d, time);
      // Drawn in sync with the audio frame so the highlight never lags.
      Tone.Draw.schedule(() => {
        if (lastActive) lastActive.classList.remove('active');
        const el = document.getElementById(`rb-${idx}`);
        if (el) el.classList.add('active');
        lastActive = el;
      }, time);
      state.beat = (state.beat + 1) % r.beats.length;
    }, interval);
  }

  async function play() {
    if (!state.current || state.playing) return false;

    state.beat = 0;

    await SonAudio.ensure();

    if (typeof Tone === 'undefined' || !SonAudio.isOn()) {
      state.playing = false;
      return false;
    }

    state.playing = true;

    SonAudio.unmute();

    if (isShuffle(state.current)) {
      Tone.Transport.swing = 0.55;
      Tone.Transport.swingSubdivision = '8n';
    } else {
      Tone.Transport.swing = 0;
    }

    scheduleLoop();

    if (Tone.Transport.state !== 'started') {
      Tone.Transport.start();
    }

    return true;
  }
  function stop() {
    state.playing = false;
    clearSchedule();
    if (typeof Tone !== 'undefined') {
      // Always reset swing — even if Transport is stopped — so it can't bleed
      // into the next play() (the rhythm scheduler is the only swing user).
      Tone.Transport.swing = 0;
      if (Tone.Transport.state === 'started') {
        Tone.Transport.stop();
        Tone.Transport.position = 0;
      }
    }
    document.querySelectorAll('.rhythm-beat').forEach(b => b.classList.remove('active'));
    lastActive = null;
  }

async function toggle() {
  if (state.playing) {
    stop();
    return false;
  }

  return await play();
}
  function setRhythm(r) { stop(); state.current = r; state.bpm = r.bpm; }
  // BPM changes restart the schedule with the new cell duration. No audible
  // glitch because the Transport keeps running.
  function setBpm(v) {
    const next = +v || state.bpm;
    if (next === state.bpm) return;
    state.bpm = next;
    if (state.playing) scheduleLoop();
  }
  function isPlaying() { return state.playing; }
  function current() { return state.current; }
  function bpm() { return state.bpm; }

  return { play, stop, toggle, setRhythm, setBpm, isPlaying, current, bpm };
})();
