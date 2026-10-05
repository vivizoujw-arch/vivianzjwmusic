(() => {
  const N = window.JianyinNotation;
  const L = window.JianyinLanguage;

  const noteInput = document.getElementById("noteInput");
  const noteButtons = document.getElementById("noteButtons");
  const noteCount = document.getElementById("noteCount");
  const piano = document.getElementById("piano");
  const scroller = document.getElementById("pianoScroller");
  const instrument = document.getElementById("instrument");
  const volume = document.getElementById("volume");
  const lastNote = document.getElementById("lastNote");
  const recordState = document.getElementById("recordState");
  const recordStats = document.getElementById("recordStats");

  let ctx=null, master=null;
  const active = new Map();
  let isRecording=false, recordStart=0, recording=[], openRecorded=new Map(), playbackTimers=[];

  function ensureAudio(){
    if(!ctx){
      ctx = new (window.AudioContext||window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = Number(volume.value)/100;
      master.connect(ctx.destination);
    }
    if(ctx.state==="suspended") ctx.resume();
  }

  function makeVoice(freq){
    ensureAudio();
    const type = instrument.value;
    const now=ctx.currentTime;
    const gain=ctx.createGain();
    const filter=ctx.createBiquadFilter();
    let nodes=[];

    function osc(wave, ratio=1, level=1){
      const o=ctx.createOscillator(), g=ctx.createGain();
      o.type=wave; o.frequency.value=freq*ratio; g.gain.value=level;
      o.connect(g); g.connect(filter); o.start(now); nodes.push(o); return o;
    }

    if(type==="piano"){
      osc("triangle",1,0.75); osc("sine",2,0.18);
      filter.type="lowpass"; filter.frequency.value=4200;
      gain.gain.setValueAtTime(0.0001,now);
      gain.gain.exponentialRampToValueAtTime(0.75,now+0.015);
      gain.gain.exponentialRampToValueAtTime(0.22,now+0.42);
    } else if(type==="guitar"){
      osc("triangle",1,0.7); osc("sine",2,0.16); osc("sine",3,0.08);
      filter.type="lowpass"; filter.frequency.value=3000;
      gain.gain.setValueAtTime(0.0001,now); gain.gain.exponentialRampToValueAtTime(0.65,now+0.008); gain.gain.exponentialRampToValueAtTime(0.12,now+0.6);
    } else if(type==="violin"){
      osc("sawtooth",1,0.32); osc("triangle",1,0.30);
      filter.type="lowpass"; filter.frequency.value=2800;
      gain.gain.setValueAtTime(0.0001,now); gain.gain.linearRampToValueAtTime(0.42,now+0.09);
    } else if(type==="flute"){
      osc("sine",1,0.65); osc("sine",2,0.05);
      filter.type="lowpass"; filter.frequency.value=5000;
      gain.gain.setValueAtTime(0.0001,now); gain.gain.linearRampToValueAtTime(0.35,now+0.05);
    } else {
      osc("sine",1,0.35); osc("square",2,0.08); osc("sine",0.5,0.08);
      filter.type="lowpass"; filter.frequency.value=3600;
      gain.gain.setValueAtTime(0.0001,now); gain.gain.linearRampToValueAtTime(0.40,now+0.03);
    }

    filter.connect(gain); gain.connect(master);
    return {nodes,gain};
  }

  function startNote(midi, sourceEl){
    if(active.has(midi)) return;
    const voice = makeVoice(N.midiToFreq(midi));
    active.set(midi,voice);
    document.querySelectorAll(`[data-midi="${midi}"]`).forEach(el=>el.classList.add("active"));
    const name=N.midiToName(midi);
    lastNote.textContent = `${name} · ${N.midiToFreq(midi).toFixed(2)} Hz`;

    if(isRecording){
      const t=performance.now()-recordStart;
      const rec={midi,start:t,duration:null};
      recording.push(rec); openRecorded.set(midi,rec); updateStats();
    }
  }

  function stopNote(midi){
    const voice=active.get(midi); if(!voice) return;
    const now=ctx.currentTime;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setTargetAtTime(0.0001,now,0.04);
    setTimeout(()=>voice.nodes.forEach(o=>{try{o.stop()}catch{}}),260);
    active.delete(midi);
    document.querySelectorAll(`[data-midi="${midi}"]`).forEach(el=>el.classList.remove("active"));
    if(isRecording && openRecorded.has(midi)){
      const rec=openRecorded.get(midi); rec.duration=Math.max(70,performance.now()-recordStart-rec.start); openRecorded.delete(midi); updateStats();
    }
  }

  function tapNote(midi,duration=360){
    startNote(midi);
    setTimeout(()=>stopNote(midi),duration);
  }

  function bindPress(el,midi){
    el.dataset.midi=midi;
    const down=e=>{e.preventDefault(); try{el.setPointerCapture(e.pointerId)}catch{} startNote(midi,el)};
    const up=e=>{e.preventDefault(); stopNote(midi)};
    el.addEventListener("pointerdown",down);
    ["pointerup","pointercancel","lostpointercapture"].forEach(type=>el.addEventListener(type,up));
  }

  function renderNoteButtons(){
    const notes=N.parseSequence(noteInput.value);
    noteButtons.innerHTML="";
    notes.forEach(n=>{
      const b=document.createElement("button");
      b.className="note-btn"; b.type="button";
      b.innerHTML=`<span class="big">${n.display}</span><span class="small-note">${n.canonical}</span>`;
      b.setAttribute("aria-label",`Play ${n.canonical}`);
      bindPress(b,n.midi); noteButtons.appendChild(b);
    });
    const lang=L.get();
    noteCount.textContent = lang==="zh" ? `${notes.length} 个按钮 · 保留输入顺序与重复` : `${notes.length} buttons · order and repeats preserved`;
  }

  function buildPiano(){
    piano.innerHTML="";
    const whiteWidth=46;
    let whiteIndex=0;
    const whites=[];
    N.pianoRange().forEach(n=>{
      if(!n.black){
        const key=document.createElement("button");
        key.type="button"; key.className="piano-key white-key"; key.textContent=n.name;
        key.style.left="0"; bindPress(key,n.midi); piano.appendChild(key);
        whites.push({midi:n.midi,el:key,index:whiteIndex}); whiteIndex++;
      }
    });
    const width=whiteIndex*whiteWidth; piano.style.width=width+"px";
    N.pianoRange().forEach(n=>{
      if(!n.black) return;
      const prevWhite=[...whites].reverse().find(w=>w.midi<n.midi);
      if(!prevWhite) return;
      const key=document.createElement("button");
      key.type="button"; key.className="piano-key black-key"; key.textContent=n.name;
      key.style.left=((prevWhite.index+1)*whiteWidth-14)+"px";
      key.style.top="0"; bindPress(key,n.midi); piano.appendChild(key);
    });
  }

  function centerC(){
    const c4=piano.querySelector('[data-midi="60"]');
    if(c4) scroller.scrollTo({left:Math.max(0,c4.offsetLeft-scroller.clientWidth/2+23),behavior:"smooth"});
  }

  function finalizeOpen(){
    const now=performance.now()-recordStart;
    for(const [midi,rec] of openRecorded){rec.duration=Math.max(70,now-rec.start); openRecorded.delete(midi)}
  }

  function updateStats(){
    let total=0;
    recording.forEach(r=> total=Math.max(total,r.start+(r.duration||0)));
    const lang=L.get();
    recordStats.textContent= lang==="zh"
      ? `${recording.length} 个音符 · ${(total/1000).toFixed(2)} 秒`
      : `${recording.length} notes · ${(total/1000).toFixed(2)} sec`;
  }

  function startRecording(){
    stopPlayback(); recording=[]; openRecorded.clear(); isRecording=true; recordStart=performance.now();
    recordState.textContent=L.t("recordOn"); updateStats();
  }

  function stopRecording(){
    if(isRecording) finalizeOpen();
    isRecording=false; recordState.textContent=L.t("recordOff"); updateStats();
  }

  function stopPlayback(){
    playbackTimers.forEach(clearTimeout); playbackTimers=[];
    [...active.keys()].forEach(stopNote);
  }

  function playback(){
    if(!recording.length) return;
    stopPlayback();
    recording.forEach(r=>{
      playbackTimers.push(setTimeout(()=>startNote(r.midi),r.start));
      playbackTimers.push(setTimeout(()=>stopNote(r.midi),r.start+(r.duration||280)));
    });
  }

  document.getElementById("generateBtn").addEventListener("click",renderNoteButtons);
  noteInput.addEventListener("keydown",e=>{if(e.key==="Enter") renderNoteButtons()});
  document.getElementById("centerPiano").addEventListener("click",centerC);
  document.getElementById("recordBtn").addEventListener("click",startRecording);
  document.getElementById("stopBtn").addEventListener("click",()=>{stopRecording();stopPlayback()});
  document.getElementById("clearBtn").addEventListener("click",()=>{stopRecording();stopPlayback();recording=[];updateStats()});
  document.getElementById("playBtn").addEventListener("click",playback);
  document.getElementById("langBtn").addEventListener("click",()=>L.toggle());
  volume.addEventListener("input",()=>{if(master) master.gain.value=Number(volume.value)/100});
  window.addEventListener("jianyin-language",()=>{renderNoteButtons();updateStats();if(!isRecording)recordState.textContent=L.t("recordOff")});
  window.addEventListener("blur",()=>[...active.keys()].forEach(stopNote));

  L.apply(); buildPiano(); renderNoteButtons();
  setTimeout(centerC,150);
})();
