const EarTraining = (() => {
  const INTERVAL_SET = [
    {st:1, name:'2ª Menor'},
    {st:2, name:'2ª Maior'},
    {st:3, name:'3ª Menor'},
    {st:4, name:'3ª Maior'},
    {st:5, name:'4ª Justa'},
    {st:6, name:'Trítono'},
    {st:7, name:'5ª Justa'},
    {st:8, name:'6ª Menor'},
    {st:9, name:'6ª Maior'},
    {st:10,name:'7ª Menor'},
    {st:11,name:'7ª Maior'},
    {st:12,name:'Oitava'},
  ];
  const CHORD_SET = [
    {name:'Maior',    f:[0,4,7]},
    {name:'Menor',    f:[0,3,7]},
    {name:'Diminuto', f:[0,3,6]},
    {name:'Aumentado',f:[0,4,8]},
    {name:'Maior 7',  f:[0,4,7,11]},
    {name:'Dominante 7', f:[0,4,7,10]},
    {name:'Menor 7',  f:[0,3,7,10]},
    {name:'Sus4',     f:[0,5,7]},
  ];

  let state = { mode:'interval', current:null, score:{right:0, total:0}, direction:'asc' };

  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

  function newQuestion(){
    const root = CHROMATIC[Math.floor(Math.random()*12)];
    if (state.mode==='interval'){
      const iv = pick(INTERVAL_SET);
      state.current = { type:'interval', root, octave:4, iv };
    } else if (state.mode==='chord'){
      const ch = pick(CHORD_SET);
      state.current = { type:'chord', root, octave:4, ch };
    }
    return state.current;
  }

  function replay(){
    const q = state.current;
    if (!q) return;
    SonAudio.ensure();
    if (q.type==='interval'){
      const top = noteAt(q.root, q.octave, q.iv.st);
      if (state.direction==='asc'){
        SonAudio.playNote(q.root, q.octave, 0, 1.0);
        SonAudio.playNote(top.note, top.oct, 0.7, 1.0);
      } else if (state.direction==='desc'){
        SonAudio.playNote(top.note, top.oct, 0, 1.0);
        SonAudio.playNote(q.root, q.octave, 0.7, 1.0);
      } else {
        SonAudio.playNote(q.root, q.octave, 0, 1.4);
        SonAudio.playNote(top.note, top.oct, 0, 1.4);
      }
    } else if (q.type==='chord'){
      SonAudio.playChordVoiced(q.root, q.octave, q.ch.f, 1.8);
    }
  }

  function answer(choice){
    const q = state.current;
    if (!q) return { correct:false, expected:'' };
    state.score.total++;
    let expected, correct;
    if (q.type==='interval'){ expected = q.iv.name; correct = choice === expected; }
    else { expected = q.ch.name; correct = choice === expected; }
    if (correct) state.score.right++;
    return { correct, expected };
  }

  function reset(){ state.score = {right:0, total:0}; state.current = null; }
  function setMode(m){ state.mode = m; reset(); }
  function setDirection(d){ state.direction = d; }
  function getMode(){ return state.mode; }
  function getDirection(){ return state.direction; }
  function getScore(){ return state.score; }
  function getOptions(){
    return state.mode==='interval'
      ? INTERVAL_SET.map(i=>i.name)
      : CHORD_SET.map(c=>c.name);
  }

  return { newQuestion, replay, answer, reset, setMode, setDirection, getMode, getDirection, getScore, getOptions };
})();
