// Audio : Web Audio, fichiers ElevenLabs dans assets/audio/<nom>.mp3, sons synthétisés de secours.
export const SNDS=['slash','smash','guard','bow','arrowhit','heal','poison','buff','hit','bite','slime','death','step','click','turn','coin','levelup','victory','defeat','critical','enemy_warning','kael_charge','aelis_heal','push','collision','combo_2','combo_3','trap','dodge','crystal_amp','prism_burst','beam_charge','beam_fire','golem_smash','spider_bite','bat_shriek','titan_roar','titan_death','chest_open','loot_rare','boss_intro'],MUSICS=['camp','battle','boss','main_theme','forest','elite_battle','cave','titan_boss','coast','mountain','castle'];
// tant qu'un nouveau fichier manque, on joue son équivalent existant
const FALL={main_theme:'camp',forest:'battle',elite_battle:'battle',critical:'smash',enemy_warning:'turn',kael_charge:'smash',aelis_heal:'heal',push:'hit',collision:'smash',combo_2:'buff',combo_3:'levelup',crystal_amp:'buff',prism_burst:'critical',beam_charge:'enemy_warning',beam_fire:'smash',cave:'battle',golem_smash:'smash',spider_bite:'bite',bat_shriek:'poison',titan_roar:'enemy_warning',titan_death:'death',chest_open:'coin',loot_rare:'levelup',boss_intro:'enemy_warning',titan_boss:'boss',coast:'battle',mountain:'battle',castle:'battle'};
// V4.0.3 : sons rangés dans assets/audio/musique (musiques, victoire, défaite) et assets/audio/bruitages ; catalogue : assets/audio/SONS.md
const dir=n=>MUSICS.includes(n)||n==='victory'||n==='defeat'?'musique/':'bruitages/';
export const AU={c:null,buf:{},m:null,s:null,cur:null,src:null,on:{m:1,s:1}};
try{Object.assign(AU.on,JSON.parse(localStorage.getItem('landeSon')||'{}'))}catch(e){}
function auInit(){if(AU.c){if(AU.c.state!=='running')AU.c.resume();return}
 const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=AU.c=new C();
 AU.mix=c.createGain();AU.mix.connect(c.destination);AU.m=c.createGain();AU.m.gain.value=AU.on.m?.45:0;AU.m.connect(AU.mix);AU.s=c.createGain();AU.s.gain.value=AU.on.s?.8:0;AU.s.connect(AU.mix);
 for(const n of[...SNDS,...MUSICS])fetch('assets/audio/'+dir(n)+n+'.mp3').then(r=>r.ok?r.arrayBuffer():Promise.reject()).then(b=>new Promise((ok,ko)=>c.decodeAudioData(b,ok,ko))).then(b=>{AU.buf[n]=b;if(MUSICS.includes(n)&&AU.want===n)music(n,1)}).catch(()=>{});
 if(AU.want)music(AU.want,1)}
// iPhone : le son ne se débloque que sur un vrai toucher (touchend/click), et le mode silencieux coupe Web Audio sauf en session « playback »
try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(e){}
function unlock(){auInit();if(!AU.c)return;try{const b=AU.c.createBuffer(1,1,22050),s=AU.c.createBufferSource();s.buffer=b;s.connect(AU.c.destination);s.start(0)}catch(e){}AU.c.resume&&AU.c.resume()}
['touchend','click','pointerup','keydown'].forEach(ev=>addEventListener(ev,unlock,{capture:true}));
document.addEventListener('visibilitychange',()=>{if(!AU.c)return;document.hidden?AU.c.suspend():AU.c.resume()});
export function setSon(k){AU.on[k]=AU.on[k]?0:1;try{localStorage.setItem('landeSon',JSON.stringify(AU.on))}catch(e){}
 if(AU.c){const g=k==='m'?AU.m:AU.s;g.gain.setTargetAtTime(AU.on[k]?(k==='m'?.45:.8):0,AU.c.currentTime,.05)}sonBtns()}
export function sonBtns(){document.querySelectorAll('.son-m').forEach(b=>b.style.opacity=AU.on.m?1:.35);document.querySelectorAll('.son-s').forEach(b=>b.style.opacity=AU.on.s?1:.35)}
export function music(n,force){AU.want=n;const c=AU.c;if(!c||(AU.cur===n&&!force&&AU.src))return;
 if(AU.src){const o=AU.src;o.g.gain.setTargetAtTime(0,c.currentTime,.4);setTimeout(()=>{try{o.stop()}catch(e){}},2000);AU.src=null}
 AU.cur=n;const b=AU.buf[n]||AU.buf[FALL[n]];if(!b)return;const s=c.createBufferSource(),g=c.createGain();s.buffer=b;s.loop=true;s.g=g;g.gain.value=0;g.gain.setTargetAtTime(1,c.currentTime,.5);s.connect(g);g.connect(AU.m);s.start();AU.src=s}
export function duck(ms){if(!AU.src)return;const g=AU.src.g.gain,t=AU.c.currentTime;g.setTargetAtTime(.25,t,.08);g.setTargetAtTime(1,t+ms/1000,.6)}
export function sfx(n,vol=1,rate=1){const c=AU.c;if(!c||!AU.on.s||!n)return;const b=AU.buf[n]||AU.buf[FALL[n]],g=c.createGain();g.gain.value=vol;g.connect(AU.s);
 if(b){const s=c.createBufferSource();s.buffer=b;s.playbackRate.value=rate*(.94+Math.random()*.12);s.connect(g);s.start();return}
 synth(FALL[n]||n,g,c.currentTime)}
// sons de secours synthétisés (remplacés automatiquement par les mp3 ElevenLabs)
function synth(n,out,t){const c=AU.c;
 const osc=(type,f0,f1,d,v=.3,at=0)=>{const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,t+at);if(f1)o.frequency.exponentialRampToValueAtTime(f1,t+at+d);g.gain.setValueAtTime(v,t+at);g.gain.exponentialRampToValueAtTime(.001,t+at+d);o.connect(g);g.connect(out);o.start(t+at);o.stop(t+at+d+.02)};
 const noise=(d,ft,f0,f1,v=.3,at=0)=>{const b=c.createBuffer(1,c.sampleRate*d,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;
  const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=b;f.type=ft;f.frequency.setValueAtTime(f0,t+at);if(f1)f.frequency.exponentialRampToValueAtTime(f1,t+at+d);g.gain.setValueAtTime(v,t+at);g.gain.exponentialRampToValueAtTime(.001,t+at+d);s.connect(f);f.connect(g);g.connect(out);s.start(t+at)};
 const arp=(type,notes,step,d,v=.18)=>notes.forEach((f,i)=>osc(type,f,0,d,v,i*step));
 ({slash:()=>noise(.18,'bandpass',4000,900,.5),smash:()=>{osc('sine',120,35,.35,.8);noise(.3,'lowpass',900,120,.5)},guard:()=>{osc('square',620,0,.25,.08);osc('square',935,0,.3,.06);arp('sine',[1500,2000],.06,.3,.08)},
  bow:()=>{osc('triangle',320,140,.15,.35);noise(.2,'highpass',2500,6000,.18,.03)},arrowhit:()=>noise(.07,'lowpass',2000,300,.6),heal:()=>arp('sine',[1047,1319,1568,2093],.07,.5),
  poison:()=>{for(let i=0;i<6;i++)osc('sine',250+Math.random()*350,600,.08,.18,i*.07)},buff:()=>{osc('sawtooth',180,900,.5,.12);arp('sine',[1568,2093],.2,.3,.1)},
  hit:()=>{osc('sine',160,60,.12,.6);noise(.08,'lowpass',1500,300,.4)},bite:()=>{osc('square',300,120,.06,.2);osc('square',260,100,.07,.2,.08)},slime:()=>osc('sine',480,110,.2,.5),
  death:()=>{noise(.4,'bandpass',1200,200,.35);osc('sine',700,90,.45,.25)},step:()=>noise(.05,'lowpass',700,0,.25),click:()=>osc('sine',950,600,.05,.2),turn:()=>osc('sine',1320,0,.5,.15),
  coin:()=>{osc('sine',1900,0,.15,.15);osc('sine',2500,0,.2,.12,.07)},levelup:()=>arp('triangle',[523,659,784,1047,1319],.08,.4,.2),
  victory:()=>arp('triangle',[523,659,784,1047,784,1047],.12,.5,.22),defeat:()=>arp('triangle',[659,587,523,392],.22,.6,.2)})[n]?.()}
