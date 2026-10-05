window.JianyinNotation = (() => {
  const NOTE_INDEX = {C:0,"C#":1,DB:1,D:2,"D#":3,EB:3,E:4,F:5,"F#":6,GB:6,G:7,"G#":8,AB:8,A:9,"A#":10,BB:10,B:11};
  const SHARP_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

  function normalizeAccidentals(s){
    return s.replaceAll("♯","#").replaceAll("♭","b").trim();
  }

  function parseNote(raw){
    let s = normalizeAccidentals(String(raw||"")).replace(/\s+/g,"");
    if(!s) return null;
    let m = s.match(/^([A-Ga-g])([#b]?)(-?\d+)?$/);
    if(!m){
      m = s.match(/^([A-Ga-g])(-?\d+)([#b]?)$/);
      if(!m) return null;
      s = m[1] + (m[3]||"") + m[2];
      m = s.match(/^([A-Ga-g])([#b]?)(-?\d+)?$/);
    }
    const letter = m[1].toUpperCase();
    const accidental = m[2] || "";
    const octave = m[3] == null ? 4 : Number(m[3]);
    const key = (letter + accidental).toUpperCase();
    const semitone = NOTE_INDEX[key];
    if(semitone == null || octave < -1 || octave > 9) return null;
    const midi = 12 * (octave + 1) + semitone;
    if(midi < 0 || midi > 127) return null;
    const canonical = SHARP_NAMES[(midi % 12 + 12) % 12] + (Math.floor(midi/12)-1);
    return {raw, midi, canonical, display: letter + accidental + octave};
  }

  function tokenize(input){
    return String(input||"").split(/[\s,;，；]+/).filter(Boolean);
  }

  function parseSequence(input){
    return tokenize(input).map(parseNote).filter(Boolean);
  }

  function midiToName(midi){
    return SHARP_NAMES[midi%12] + (Math.floor(midi/12)-1);
  }

  function midiToFreq(midi){
    return 440 * Math.pow(2,(midi-69)/12);
  }

  function pianoRange(){
    const out=[];
    for(let midi=21;midi<=108;midi++) out.push({midi,name:midiToName(midi),black:SHARP_NAMES[midi%12].includes("#")});
    return out;
  }

  return {parseNote,parseSequence,midiToName,midiToFreq,pianoRange};
})();
