/* Tiny procedural cues for combat feedback. Final authored samples can replace
 * this module without changing the combat engine's event vocabulary. */
window.CenizasSfx=(()=>{
  let volume=.42,ctx=null;
  try{const stored=Number(localStorage.getItem('cenizas-effects-volume'));if(Number.isFinite(stored))volume=Math.max(0,Math.min(1,stored));}catch{/* optional storage/API unavailable; safe fallback */}
  const ensure=()=>{if(!ctx){const AudioContext=window.AudioContext||window.webkitAudioContext;if(AudioContext)ctx=new AudioContext();}if(ctx?.state==='suspended')ctx.resume().catch(()=>{});return ctx;};
  const patterns={hit:[220,330],critical:[330,660,880],miss:[110],block:[440,660],fail:[180,130],timing:[520,780],tech:[260,520,780],telegraph:[120,180]};
  function play(kind='hit'){const audio=ensure();if(!audio||!volume)return;const now=audio.currentTime;for(const [i,freq] of (patterns[kind]||patterns.hit).entries()){const osc=audio.createOscillator(),gain=audio.createGain();osc.type=kind==='telegraph'?'sawtooth':'triangle';osc.frequency.setValueAtTime(freq,now+i*.055);gain.gain.setValueAtTime(.0001,now+i*.055);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,volume*.13),now+i*.055+.008);gain.gain.exponentialRampToValueAtTime(.0001,now+i*.055+.12);osc.connect(gain).connect(audio.destination);osc.start(now+i*.055);osc.stop(now+i*.055+.14);}}
  const setVolume=value=>{volume=Math.max(0,Math.min(1,Number(value)||0));try{localStorage.setItem('cenizas-effects-volume',String(volume));}catch{/* optional storage/API unavailable; safe fallback */}};
  const dialog=document.getElementById('music-dialog');if(dialog&&!dialog.querySelector('#effects-volume')){const label=document.createElement('label');label.textContent='Volumen de efectos';const input=document.createElement('input');input.id='effects-volume';input.type='range';input.min='0';input.max='100';input.value=String(Math.round(volume*100));input.setAttribute('aria-label','Volumen de efectos');input.oninput=()=>setVolume(Number(input.value)/100);label.append(input);dialog.querySelector('#music-close')?.before(label);}
  return {play,setVolume,get volume(){return volume;}};
})();
