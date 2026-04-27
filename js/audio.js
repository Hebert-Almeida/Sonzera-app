const SonAudio = (() => {
  let inited = false;
  let enabled = false;
  let ctx, master, voiceBus, wave;
  let kick, hatOpen, hatClosed;
  const timers = new Set();

  function scheduleTimer(fn, ms) {
    const id = setTimeout(() => { timers.delete(id); fn(); }, ms);
    timers.add(id);
    return id;
  }
  function cancelAllTimers() {
    timers.forEach(id => clearTimeout(id));
    timers.clear();
  }

  async function ensure() {
    if (inited) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) { console.warn('Web Audio not supported'); return; }
    ctx = new Ctx();
    if (ctx.state === 'suspended') await ctx.resume();

    if (typeof Tone !== 'undefined') {
      try { await Tone.start(); } catch (_) { }
      try {
        const tctx = Tone.getContext();
        if (tctx && tctx.rawContext && tctx.rawContext.state === 'suspended') {
          await tctx.rawContext.resume();
        }
      } catch (_) { }
    }

    master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);

    voiceBus = ctx.createGain();
    voiceBus.gain.value = 0.5;
    voiceBus.connect(master);

    const partials = [0, 0.55, 0.28, 0.12, 0.06, 0.04, 0.02];
    const real = new Float32Array(partials.length);
    const imag = new Float32Array(partials.length);
    for (let i = 0; i < partials.length; i++) imag[i] = partials[i];
    wave = ctx.createPeriodicWave(real, imag, { disableNormalization: false });

    if (typeof Tone !== 'undefined') {
      kick = new Tone.MembraneSynth({
        pitchDecay: 0.04, octaves: 4,
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.001, decay: 0.22, sustain: 0, release: 0.02 },
        volume: -2,
      }).toDestination();

      const bp = new Tone.Filter({ type: 'bandpass', frequency: 1800, Q: 1.4 });
      hatOpen = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.002, decay: 0.11, sustain: 0 },
        volume: -6,
      });
      hatOpen.chain(bp, Tone.getDestination());

      const hp = new Tone.Filter({ type: 'highpass', frequency: 3200 });
      hatClosed = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.05, sustain: 0 },
        volume: -8,
      });
      hatClosed.chain(hp, Tone.getDestination());
    }

    inited = true;
  }

  async function toggle() {
    enabled = !enabled;

    if (enabled) {
      await ensure();
      unmute();
    } else {
      stopAll();
    }

    return enabled;
  }
  function isOn() { return enabled; }
  function now() { return inited ? ctx.currentTime : 0; }

  function unmute() {
    if (!inited) return;

    const t = ctx.currentTime;

    master.gain.cancelScheduledValues(t);
    master.gain.linearRampToValueAtTime(0.7, t + 0.03);

    if (typeof Tone !== 'undefined') {
      try {
        Tone.Destination.volume.value = 0;
        Tone.Destination.mute = false;
      } catch (_) { }
    }
  }

  // --- Note helpers --------------------------------------------------------
  function toFreq(note, octave) {
    return freq(rawNote(note), octave);
  }

  function playVoice(hz, when, dur, vel) {
    if (!enabled || !inited || !hz) return;
    const t0 = ctx.currentTime + Math.max(0, when);
    const osc = ctx.createOscillator();
    osc.setPeriodicWave(wave);
    osc.frequency.value = hz;

    const g = ctx.createGain();
    const peak = Math.max(0.0001, Math.min(1, vel));
    const attack = 0.005;
    const decay = Math.min(0.45, dur * 0.6);
    const release = 0.18;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);
    g.gain.setValueAtTime(0.0001, t0 + attack + decay);

    osc.connect(g).connect(voiceBus);
    osc.start(t0);
    const end = t0 + Math.max(attack + decay, dur) + release;
    osc.stop(end);
    osc.onended = () => {
      try { osc.disconnect(); } catch (_) { }
      try { g.disconnect(); } catch (_) { }
    };
  }

  function playNote(note, octave, when = 0, dur = 0.9, vel = 0.7) {
    if (!enabled || !inited) return;
    playVoice(toFreq(note, octave), when, dur, vel);
  }

  function playChord(notes, octave, dur = 1.6) {
    if (!enabled || !inited) return;
    notes.forEach((n, i) => playVoice(toFreq(rawNote(n), octave), i * 0.005, dur, 0.45));
  }

  function playChordVoiced(root, octave, semis, dur = 1.6, vel = 0.45, spread = 0.005) {
    if (!enabled || !inited) return;
    semis.forEach((st, i) => {
      const { note, oct } = noteAt(root, octave, st);
      playVoice(toFreq(note, oct), i * spread, dur, vel);
    });
  }

  function strum(notes, octave, dur = 2.2, down = true, spread = 0.02) {
    if (!enabled || !inited) return;
    const arr = down ? notes : [...notes].reverse();
    arr.forEach((n, i) => playVoice(toFreq(rawNote(n), octave), i * spread, dur, 0.5));
  }
  function strumVoiced(root, octave, semis, dur = 2.2, down = true, spread = 0.02) {
    if (!enabled || !inited) return;
    const arr = down ? semis : [...semis].reverse();
    arr.forEach((st, i) => {
      const { note, oct } = noteAt(root, octave, st);
      playVoice(toFreq(note, oct), i * spread, dur, 0.5);
    });
  }
  function arpeggiate(notes, octave, step = 0.14, dur = 0.6) {
    if (!enabled || !inited) return;
    notes.forEach((n, i) => playVoice(toFreq(rawNote(n), octave), i * step, dur, 0.55));
  }
  function arpeggiateVoiced(root, octave, semis, step = 0.14, dur = 0.6) {
    if (!enabled || !inited) return;
    semis.forEach((st, i) => {
      const { note, oct } = noteAt(root, octave, st);
      playVoice(toFreq(note, oct), i * step, dur, 0.55);
    });
  }

  function playProgression(chords, octave, beatMs = 600) {
    cancelAllTimers();
    chords.forEach((ch, i) => {
      scheduleTimer(() => {
        if (ch.semis && ch.chordRoot) {
          strumVoiced(ch.chordRoot, octave, ch.semis, beatMs / 400, true);
        } else {
          strum(ch.notes, octave, beatMs / 400, true);
        }
      }, i * beatMs);
    });
  }

  // --- Percussion ----------------------------------------------------------
  function perc(type, when = 0) {
    if (!enabled || !inited) return;
    percAt(type, '+' + when);
  }
  function percAt(type, time) {
    if (!enabled || !inited) return;
    if (type === 'D' && kick) kick.triggerAttackRelease('C2', '8n', time);
    else if (type === 'U' && hatOpen) hatOpen.triggerAttackRelease('16n', time);
    else if (type === 'X' && hatClosed) hatClosed.triggerAttackRelease('32n', time);
  }

  function stopAll() {
    cancelAllTimers();

    if (!inited) return;

    try {
      Tone.Transport.stop();
      Tone.Transport.cancel(0);
      // Ramp instead of slam — sudden -Inf clicks while voices are ringing.
      if (Tone.Destination.volume.rampTo) {
        Tone.Destination.volume.rampTo(-Infinity, 0.04);
      } else {
        Tone.Destination.volume.value = -Infinity;
      }
    } catch (_) { }

    const t = ctx.currentTime;
    const cur = master.gain.value;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(cur, t);
    master.gain.linearRampToValueAtTime(0, t + 0.04);
  }

  return {
    toggle, isOn, ensure, now, unmute,
    playNote, playChord, playChordVoiced,
    strum, strumVoiced,
    arpeggiate, arpeggiateVoiced,
    playProgression,
    perc, percAt,
    scheduleTimer, cancelAllTimers, stopAll,
  };
})();
