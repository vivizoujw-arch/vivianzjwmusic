window.JianyinLanguage = (() => {
  const dict = {
    zh:{
      brand:"键音",subtitle:"乐器工作台",instrument:"演奏音色",
      piano:"钢琴 · 三角钢琴",guitar:"吉他 · 钢弦木吉他",violin:"小提琴",flute:"长笛",organ:"管风琴",
      instrumentHelp:"音符按钮、键盘与回放均使用当前音色。切换后可用同一段记录试听不同乐器。",
      audioReady:"音色已就绪",melodyTitle:"把音符变成旋律",section1:"01 / 音符按钮",inputNotes:"输入音符",generate:"生成按钮",
      inputHelp:"用空格、逗号或分号分隔。支持 D3#、D#3、Db3、♯、♭；不写八度默认为 4。",
      pianoTitle:"完整钢琴",pianoHelp:"横向滚动探索所有琴键",centerC:"回到中央 C",readyFirst:"准备好，弹下第一个音。",
      volume:"音量",recordTitle:"留住这一段",section2:"02 / 节奏记录",recordHelp:"记录音符间隔与按住时长，回放时还原节奏。",
      record:"记录节奏",stop:"停止",clear:"清空",playback:"回放",recordOff:"未开启记录",recordOn:"正在记录",sessionOnly:"记录仅保留在本次页面中",
      footer:"浏览器合成音色 · 无需安装",credits:"音源致谢",notes:"个音符",seconds:"秒"
    },
    en:{
      brand:"JIANYIN",subtitle:"Instrument Workbench",instrument:"Instrument",
      piano:"Piano · Grand Piano",guitar:"Guitar · Steel String",violin:"Violin",flute:"Flute",organ:"Organ",
      instrumentHelp:"Note buttons, keyboard and playback use the selected instrument. Switch instruments to audition the same recording.",
      audioReady:"Audio ready",melodyTitle:"Turn notes into melody",section1:"01 / NOTE BUTTONS",inputNotes:"Enter notes",generate:"Generate buttons",
      inputHelp:"Separate notes with spaces, commas or semicolons. Supports D3#, D#3, Db3, ♯, ♭. Octave defaults to 4.",
      pianoTitle:"Full Piano",pianoHelp:"scroll horizontally through all keys",centerC:"Center on C4",readyFirst:"Ready. Play the first note.",
      volume:"Volume",recordTitle:"Save this phrase",section2:"02 / RHYTHM RECORDING",recordHelp:"Captures timing and held-note duration for playback.",
      record:"Record rhythm",stop:"Stop",clear:"Clear",playback:"Playback",recordOff:"Recording off",recordOn:"Recording…",sessionOnly:"Recording is kept only in this page session.",
      footer:"Browser-synthesized instruments · no install required",credits:"Credits",notes:"notes",seconds:"sec"
    }
  };
  let lang="zh";
  function t(k){return dict[lang][k] ?? k}
  function apply(){
    document.documentElement.lang = lang==="zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-i18n]").forEach(el=>{ const k=el.dataset.i18n; if(dict[lang][k]) el.textContent=dict[lang][k]; });
    const btn=document.getElementById("langBtn"); if(btn) btn.textContent=lang==="zh"?"English":"中文";
    window.dispatchEvent(new CustomEvent("jianyin-language",{detail:{lang}}));
  }
  function toggle(){lang=lang==="zh"?"en":"zh";apply()}
  function get(){return lang}
  return {t,apply,toggle,get};
})();
