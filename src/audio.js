// Audio : Web Audio, fichiers ElevenLabs dans assets/audio/<nom>.mp3, sons synthétisés de secours.
export const SNDS=['slash','smash','guard','bow','arrowhit','heal','poison','buff','hit','bite','slime','death','step','click','turn','coin','levelup','victory','defeat','critical','enemy_warning','kael_charge','aelis_heal','push','collision','combo_2','combo_3','trap','dodge','crystal_amp','prism_burst','beam_charge','beam_fire','golem_smash','spider_bite','bat_shriek','titan_roar','titan_death','chest_open','loot_rare','boss_intro','boss_phase','boss_death','quest_complete','star_earned','village_ambience','orion_arcane','orion_fire','orion_ice','orion_wall','orion_blink','orion_glyph','orion_storm','nyra_slash','nyra_backstab','nyra_shadow','nyra_poison','nyra_smoke','nyra_mark','nyra_execute','lyria_hammer','lyria_shield','lyria_cleanse','lyria_intercept','lyria_aura','lyria_bastion','ember_eruption','sands_trap','aetherion_shift','frost_crack','frost_shield_break','breaker_expose','recruit_hero','talent_unlock'],MUSICS=['camp','battle','boss','main_theme','forest','elite_battle','cave','titan_boss','coast','mountain','castle','village','boss_v2','darkwood','map2','ember','boss_map2','sands','swamp','skycitadel','frost','sanctuary','elite2','final_boss','ending'];
// tant qu'un nouveau fichier manque, on joue son équivalent existant
const FALL={map2:'camp',ember:'cave',boss_map2:'boss_v2',boss_phase:'kael_charge',boss_death:'death',quest_complete:'coin',star_earned:'coin',darkwood:'forest',village:'main_theme',boss_v2:'boss',main_theme:'camp',forest:'battle',elite_battle:'battle',critical:'smash',enemy_warning:'turn',kael_charge:'smash',aelis_heal:'heal',push:'hit',collision:'smash',combo_2:'buff',combo_3:'levelup',crystal_amp:'buff',prism_burst:'critical',beam_charge:'enemy_warning',beam_fire:'smash',cave:'battle',golem_smash:'smash',spider_bite:'bite',bat_shriek:'poison',titan_roar:'enemy_warning',titan_death:'death',chest_open:'coin',loot_rare:'levelup',boss_intro:'enemy_warning',titan_boss:'boss',coast:'battle',mountain:'battle',castle:'battle',sands:'ember',swamp:'darkwood',skycitadel:'castle',frost:'mountain',sanctuary:'castle',elite2:'elite_battle',final_boss:'boss_map2',ending:'main_theme',orion_arcane:'prism_burst',orion_fire:'prism_burst',orion_ice:'crystal_amp',orion_wall:'crystal_amp',orion_blink:'buff',orion_glyph:'trap',orion_storm:'prism_burst',nyra_slash:'slash',nyra_backstab:'slash',nyra_shadow:'buff',nyra_poison:'poison',nyra_smoke:'poison',nyra_mark:'buff',nyra_execute:'slash',lyria_hammer:'smash',lyria_shield:'guard',lyria_cleanse:'aelis_heal',lyria_intercept:'guard',lyria_aura:'guard',lyria_bastion:'guard',ember_eruption:'smash',sands_trap:'trap',aetherion_shift:'buff',frost_crack:'hit',frost_shield_break:'smash',breaker_expose:'critical',recruit_hero:'levelup',talent_unlock:'levelup'};
// V4.0.3 : sons rangés dans assets/audio/musique (musiques, victoire, défaite) et assets/audio/bruitages ; catalogue : assets/audio/SONS.md
const dir=n=>n.startsWith('v_')?'voix/':MUSICS.includes(n)||n==='victory'||n==='defeat'?'musique/':'bruitages/';
// V4.31 : volume réglable (curseurs des Réglages, 0 à 150 %) et plus fort à 100 % ; TRIM remonte les deux fichiers les plus faibles (mesurés vers -17 et -16 LUFS, les autres entre -14 et -12)
// V4.36 : voix des héros (7 répliques courtes chacun). VTRIM égalise les fichiers, mesurés entre -26 et -15 dB ; les KO restent un peu plus bas
export const VOICES={warrior:'kael',archer:'fenn',healer:'aelis'};
const VLINES=['start','sig','support','hurt','ko','win','level'],VGAP=6,VSAME=20;
const VTRIM={kael:[.84,.87,1.06,1.5,1.93,.98,1.35],fenn:[1.48,.68,.75,1.3,1.95,1,.69],aelis:[1.62,1,2.04,2,2.04,.85,1.84]};
const vname=(h,l)=>'v_'+h+'_'+l;
const AMB=4,GAIN={m:.9,s:1,v:1.2},TRIM={main_theme:1.5,camp:1.4,map2:.85,ember:.7,boss_map2:.75};
export const VOLMAX=150;
export const AU={c:null,buf:{},m:null,s:null,cur:null,src:null,on:{m:1,s:1,v:1},vEnd:0,vLast:{}};
try{Object.assign(AU.on,JSON.parse(localStorage.getItem('landeSon')||'{}'))}catch(e){}
AU.vol={m:100,s:100,v:100,g:100}; // g = volume général (V4.51, aperçu HUD V2 ; 100 = comme avant)
try{Object.assign(AU.vol,JSON.parse(localStorage.getItem('landeVol')||'{}'))}catch(e){}
const level=k=>AU.on[k]?GAIN[k]*AU.vol[k]/100:0;
const apply=k=>{if(AU.c)AU[k].gain.setTargetAtTime(level(k),AU.c.currentTime,.05)};
export function setVol(k,v){AU.vol[k]=Math.max(0,Math.min(VOLMAX,+v||0));try{localStorage.setItem('landeVol',JSON.stringify(AU.vol))}catch(e){}
 if(k==='v'&&AU.vol.v&&!AU.on.s)setSon('s'); // les voix se coupent avec le bouton des bruitages
 if(AU.vol[k]&&!AU.on[k])setSon(k);else apply(k)}
export function setMaster(v){AU.vol.g=Math.max(0,Math.min(100,+v||0));try{localStorage.setItem('landeVol',JSON.stringify(AU.vol))}catch(e){}
 if(AU.c&&AU.mix)AU.mix.gain.setTargetAtTime(AU.vol.g/100,AU.c.currentTime,.05)}
function auInit(){if(AU.c){if(AU.c.state!=='running')AU.c.resume();return}
 const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=AU.c=new C();
 // limiteur en sortie : évite la saturation quand le volume est poussé
 const lim=c.createDynamicsCompressor();lim.threshold.value=-3;lim.knee.value=0;lim.ratio.value=20;lim.attack.value=.003;lim.release.value=.25;lim.connect(c.destination);
 AU.mix=c.createGain();AU.mix.gain.value=Math.max(0,Math.min(100,AU.vol.g))/100;AU.mix.connect(lim);AU.m=c.createGain();AU.m.gain.value=level('m');AU.m.connect(AU.mix);AU.s=c.createGain();AU.s.gain.value=level('s');AU.s.connect(AU.mix);AU.v=c.createGain();AU.v.gain.value=level('v');AU.v.connect(AU.mix);
 for(const h of Object.values(VOICES))for(const l of VLINES)load(vname(h,l)).catch(()=>{});
 for(const n of SNDS)load(n).then(()=>{if(n==='village_ambience')ambience()}).catch(()=>{});
 if(AU.want)music(AU.want,1)}
const load=n=>fetch('assets/audio/'+dir(n)+n+'.mp3').then(r=>r.ok?r.arrayBuffer():Promise.reject()).then(b=>new Promise((ok,ko)=>AU.c.decodeAudioData(b,ok,ko))).then(b=>AU.buf[n]=b);
// V4.20 : une musique n'est chargée qu'au moment de la jouer (décodée, une minute pèse environ 20 Mo en mémoire)
const wait={},lost={};
function musicLoad(n){if(wait[n])return;wait[n]=1;
 load(n).then(()=>{delete wait[n];if(AU.want&&(AU.want===n||FALL[AU.want]===n))music(AU.want,1)})
 // fichier absent : on passe au secours ; en cas d'échec il sera redemandé au prochain changement de musique
 .catch(()=>{delete wait[n];if(!lost[n]){lost[n]=1;if(FALL[n]&&AU.want===n)music(n,1);delete lost[n]}})}
// iPhone : le son ne se débloque que sur un vrai toucher (touchend/click), et le mode silencieux coupe Web Audio sauf en session « playback »
try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(e){}
function unlock(){auInit();if(!AU.c)return;try{const b=AU.c.createBuffer(1,1,22050),s=AU.c.createBufferSource();s.buffer=b;s.connect(AU.c.destination);s.start(0)}catch(e){}AU.c.resume&&AU.c.resume()}
['touchend','click','pointerup','keydown'].forEach(ev=>addEventListener(ev,unlock,{capture:true}));
document.addEventListener('visibilitychange',()=>{if(!AU.c)return;document.hidden?AU.c.suspend():AU.c.resume()});
export function setSon(k){AU.on[k]=AU.on[k]?0:1;try{localStorage.setItem('landeSon',JSON.stringify(AU.on))}catch(e){}
 apply(k);sonBtns()}
export function sonBtns(){document.querySelectorAll('.son-m').forEach(b=>b.style.opacity=AU.on.m?1:.35);document.querySelectorAll('.son-s').forEach(b=>b.style.opacity=AU.on.s?1:.35)}
// V4.33 : ambiance du village sous le thème d'origine ; elle passe par le volume des bruitages (pas de son de secours)
function ambience(){const c=AU.c;if(!c)return;const on=AU.want==='main_theme',b=AU.buf.village_ambience;
 if(on&&b&&!AU.amb){const s=c.createBufferSource(),g=c.createGain();s.buffer=b;s.loop=true;g.gain.value=0;g.gain.setTargetAtTime(AMB,c.currentTime,1);s.connect(g);g.connect(AU.s);s.start();s.g=g;AU.amb=s}
 else if(!on&&AU.amb){const o=AU.amb;AU.amb=null;o.g.gain.setTargetAtTime(0,c.currentTime,.4);setTimeout(()=>{try{o.stop()}catch(e){}},2000)}}
export function music(n,force){AU.want=n;ambience();const c=AU.c;if(!c||(AU.cur===n&&!force&&AU.src))return;
 const w=lost[n]?FALL[n]:n,k=AU.buf[w]?w:null;
 if(!k){musicLoad(w);return} // l'ancienne musique continue pendant le chargement
 if(AU.src){const o=AU.src;o.g.gain.setTargetAtTime(0,c.currentTime,.4);setTimeout(()=>{try{o.stop()}catch(e){}},2000);AU.src=null}
 AU.cur=n;for(const m of MUSICS)if(m!==k)delete AU.buf[m];
 const s=c.createBufferSource(),g=c.createGain();s.buffer=AU.buf[k];s.loop=true;s.g=g;g.gain.value=0;s.vol=TRIM[k]||1;g.gain.setTargetAtTime(s.vol,c.currentTime,.5);s.connect(g);g.connect(AU.m);s.start();AU.src=s}
export function duck(ms,depth=.25){if(!AU.src)return;const g=AU.src.g.gain,t=AU.c.currentTime,v=AU.src.vol;g.setTargetAtTime(depth*v,t,.08);g.setTargetAtTime(v,t+ms/1000,.6)}
// Jamais deux voix à la fois ; en dehors des moments forts (force), 6 s de silence entre deux voix et 20 s avant de redire la même réplique
export function voice(k,line,{chance=1,force=false}={}){const c=AU.c,h=VOICES[k];if(!c||!h||!AU.on.s||!AU.vol.v||Math.random()>chance)return false;
 const n=vname(h,line),b=AU.buf[n],t=c.currentTime;if(!b||t<AU.vEnd||!force&&(t<AU.vEnd+VGAP||t<(AU.vLast[n]??-VSAME)+VSAME))return false;
 const s=c.createBufferSource(),g=c.createGain();s.buffer=b;g.gain.value=VTRIM[h][VLINES.indexOf(line)];s.connect(g);g.connect(AU.v);s.start();
 AU.vEnd=t+b.duration;AU.vLast[n]=t;duck(b.duration*1000,.45);return true}
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
