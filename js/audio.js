/* =========================================================
   AMBIENT SPACE SOUND — synthesized drone, no external audio files
   ========================================================= */

let audioCtx = null, audioNodes = null, soundOn = false;

function startAmbientSound(){
  if(!audioCtx){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if(audioCtx.state === 'suspended') audioCtx.resume();

  const master = audioCtx.createGain();
  master.gain.value = 0;
  master.connect(audioCtx.destination);
  master.gain.linearRampToValueAtTime(0.16, audioCtx.currentTime + 2.2);

  const osc1 = audioCtx.createOscillator();
  osc1.type = 'sine'; osc1.frequency.value = 55;
  const osc2 = audioCtx.createOscillator();
  osc2.type = 'sine'; osc2.frequency.value = 82.5;
  const osc3 = audioCtx.createOscillator();
  osc3.type = 'triangle'; osc3.frequency.value = 110.2;

  const lfo = audioCtx.createOscillator();
  lfo.type = 'sine'; lfo.frequency.value = 0.06;
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 6;
  lfo.connect(lfoGain);
  lfoGain.connect(osc1.frequency);

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass'; filter.frequency.value = 420;

  const mix = audioCtx.createGain();
  mix.gain.value = 0.5;
  [osc1, osc2, osc3].forEach(o => { o.connect(mix); o.start(); });
  lfo.start();
  mix.connect(filter);
  filter.connect(master);

  audioNodes = { master, osc1, osc2, osc3, lfo };
}

function stopAmbientSound(){
  if(!audioNodes) return;
  const now = audioCtx.currentTime;
  audioNodes.master.gain.linearRampToValueAtTime(0, now + 1.2);
  const nodes = audioNodes;
  setTimeout(()=>{
    [nodes.osc1, nodes.osc2, nodes.osc3, nodes.lfo].forEach(o=>{ try{o.stop();}catch(e){} });
  }, 1300);
  audioNodes = null;
}

/* Wires the #sound-toggle button to start/stop the ambient drone. Call once on load. */
export function initAmbientSound(buttonId = 'sound-toggle'){
  const btn = document.getElementById(buttonId);
  if(!btn) return;
  btn.addEventListener('click', () => {
    soundOn = !soundOn;
    if(soundOn){ startAmbientSound(); btn.textContent = '🔊'; }
    else { stopAmbientSound(); btn.textContent = '🔇'; }
  });
}
