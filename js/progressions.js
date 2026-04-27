const PROGRESSIONS = [
  {
    name:'I — V — vi — IV', mode:'Maior',
    degrees:[[0,'maj'],[4,'maj'],[5,'min'],[3,'maj']],
    desc:'A progressão pop mais famosa do mundo. Usada em milhares de hits.',
    examples:'"Let It Be" (Beatles), "Don\'t Stop Believin\'" (Journey), "Someone Like You" (Adele)',
    tag:'Pop'
  },
  {
    name:'vi — IV — I — V', mode:'Maior',
    degrees:[[5,'min'],[3,'maj'],[0,'maj'],[4,'maj']],
    desc:'Pop-punk variant. Começa melancólica, resolve brilhante.',
    examples:'"Apologize" (OneRepublic), "Grenade" (Bruno Mars)',
    tag:'Pop'
  },
  {
    name:'ii — V — I', mode:'Maior',
    degrees:[[1,'m7'],[4,'7'],[0,'maj7']],
    desc:'A cadência mais importante do jazz. Resolução perfeita tonal.',
    examples:'"Autumn Leaves", "All the Things You Are", quase todo jazz standard',
    tag:'Jazz'
  },
  {
    name:'I — vi — ii — V', mode:'Maior',
    degrees:[[0,'maj7'],[5,'m7'],[1,'m7'],[4,'7']],
    desc:'Turnaround clássico do jazz e do pop dos anos 50.',
    examples:'"Blue Moon", "Heart and Soul", "Stand By Me"',
    tag:'Jazz/Pop'
  },
  {
    name:'I — IV — V — I', mode:'Maior',
    degrees:[[0,'maj'],[3,'maj'],[4,'maj'],[0,'maj']],
    desc:'Cadência perfeita. Base da música ocidental há séculos.',
    examples:'"La Bamba", "Twist and Shout", rock and roll clássico',
    tag:'Clássica'
  },
  {
    name:'12 Bar Blues', mode:'Maior',
    degrees:[[0,'7'],[0,'7'],[0,'7'],[0,'7'],[3,'7'],[3,'7'],[0,'7'],[0,'7'],[4,'7'],[3,'7'],[0,'7'],[4,'7']],
    desc:'Estrutura fundamental do blues: 12 compassos, três acordes dominantes.',
    examples:'"Sweet Home Chicago", quase todo blues tradicional',
    tag:'Blues'
  },
  {
    name:'i — VI — III — VII', mode:'Menor',
    degrees:[[0,'min'],[5,'maj'],[2,'maj'],[6,'maj']],
    desc:'Eólia/Épica (Axis menor). Progressão dramática usada em baladas rock.',
    examples:'"Zombie" (Cranberries), "Save Tonight" (Eagle-Eye Cherry)',
    tag:'Rock'
  },
  {
    name:'i — VII — VI — V7', mode:'Menor',
    degrees:[[0,'min'],[6,'maj'],[5,'maj'],[4,'7']],
    desc:'Cadência andaluza descendente com V7 dominante (cor frígia/flamenca).',
    examples:'"Hit the Road Jack" (Ray Charles), flamenco tradicional',
    tag:'Flamenco'
  },
  {
    name:'i — iv — VII — III', mode:'Menor',
    degrees:[[0,'min'],[3,'min'],[6,'maj'],[2,'maj']],
    desc:'Progressão menor circular. MPB e bossa nova costumam visitar.',
    examples:'"Stairway to Heaven" (intro), vários standards',
    tag:'MPB/Rock'
  },
  {
    name:'I — V — vi — iii — IV — I — IV — V', mode:'Maior',
    degrees:[[0,'maj'],[4,'maj'],[5,'min'],[2,'min'],[3,'maj'],[0,'maj'],[3,'maj'],[4,'maj']],
    desc:'Cânone de Pachelbel. Base de milhares de canções pop.',
    examples:'"Canon in D", "Basket Case", "Graduation" (Vitamin C)',
    tag:'Clássica'
  },
  {
    name:'IV — I — V — vi', mode:'Maior',
    degrees:[[3,'maj'],[0,'maj'],[4,'maj'],[5,'min']],
    desc:'Variação pop com cara de verão. Ascendente e acolhedora.',
    examples:'"Umbrella" (Rihanna), "Viva la Vida" (Coldplay)',
    tag:'Pop'
  },
  {
    name:'ii — V — i', mode:'Menor',
    degrees:[[1,'m7♭5'],[4,'7'],[0,'mM7']],
    desc:'ii-V-i menor. Resolução sombria do jazz.',
    examples:'"Summertime", "Blue Bossa", "My Funny Valentine"',
    tag:'Jazz'
  },
  {
    name:'I — iii — IV — V', mode:'Maior',
    degrees:[[0,'maj'],[2,'min'],[3,'maj'],[4,'maj']],
    desc:'Romântica dos anos 50. Doo-wop gentil.',
    examples:'"A Teenager in Love", "Every Breath You Take"',
    tag:'Doo-wop'
  },
  {
    name:'Rhythm Changes — A (8c.)', mode:'Maior',
    degrees:[[0,'maj7'],[5,'m7'],[1,'m7'],[4,'7'],[2,'m7'],[5,'7'],[0,'maj7'],[0,'maj7']],
    desc:'Seção A do "I Got Rhythm" (Gershwin). 2ª forma mais usada em jazz.',
    examples:'"Oleo", "Anthropology", centenas de contrafactos',
    tag:'Jazz'
  },
  {
    name:'Rhythm Changes — Bridge (B)', mode:'Maior',
    degrees:[[2,'7'],[5,'7'],[1,'7'],[4,'7']],
    desc:'Bridge da forma AABA: ciclo de dominantes III7 → VI7 → II7 → V7 (2 compassos cada).',
    examples:'Bridge de "I Got Rhythm" e contrafactos',
    tag:'Jazz'
  },
  {
    name:'V7/V — V7 — I (Dominante Secundária)', mode:'Maior',
    degrees:[[1,'7'],[4,'7'],[0,'maj7']],
    desc:'Tonicização do V via dominante secundária. Cria cadência interna forte.',
    examples:'"Sweet Georgia Brown", inúmeros standards',
    tag:'Jazz'
  },
];

function degreeToChord(root, intervals, degreeIdx, qualitySym, flat=false){
  const idx = degreeIdx % intervals.length;
  const spelled = spellScaleDiatonic(rawNote(root), intervals);
  const chordRoot = spelled[idx] || getNote(root, intervals[idx], flat);

  const fs = tonalChordSemis(qualitySym);
  const notes = tonalChordNotes(chordRoot, qualitySym);

  const sym = {
    'maj':'', 'min':'m','dim':'°','aug':'+','maj7':'maj7','m7':'m7','7':'7',
    'm7♭5':'m7♭5','°7':'°7','mM7':'mM7','sus4':'sus4'
  }[qualitySym] || '';
  return { root:chordRoot, chordRoot, semis:fs, sym:fmt(chordRoot)+sym, notes, qualitySym };
}

function expandProgression(prog, root, flat=false){
  const ints = prog.mode==='Menor' ? SCALES['Menor Natural'].i : SCALES['Maior (Jônico)'].i;
  return prog.degrees.map(([deg, q]) => degreeToChord(root, ints, deg, q, flat));
}
