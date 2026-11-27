// V4.80 (lot 3 de la feuille de route V5.0) : scénario V2, texte seulement (aucune voix : lot audio séparé).
// Contrat : données séparées, clés stables, une scène à la première occurrence (jamais en farm, revanche ou défaite),
// passable en un geste, sauvegarde additive `save.storySeen`, aucun effet sur le combat, les récompenses ou l'équipe.
import {ZONES,zlen} from './data.js';
import {recruited} from './rules.js';
// [locuteur, FR, EN] ; « Voix » = l'Architecte avant qu'on connaisse son nom (avant la région 9)
const L=(...a)=>a;
export const SC={
 prologue:[L('Mira','Je ne me souviens plus de la suite de la chanson…','I can’t remember the rest of the song…'),L('Fenn','Tu me la chantais tous les soirs quand j’étais petit.','You sang it to me every night when I was little.'),L('Mira','Vraiment ?','Did I?'),L('Garrick','Des créatures attaquent les voyageurs. On a besoin de vous.','Creatures are attacking travellers. We need you.')],
 r01_end:[L('Aelis','Ce cristal ne contient pas que de la magie. J’entends quelqu’un.','This crystal holds more than magic. I can hear someone.'),L('Voix','Rendez-nous ce qu’on nous a pris.','Give us back what was taken from us.')],
 r02_end:[L('Fenn','Il protégeait son foyer. Exactement comme nous.','He was protecting his home. Just like us.')],
 r03_end:[L('Kael','Ces caisses sont récentes. Quelqu’un savait ce qu’il transportait.','These crates are recent. Someone knew what they were carrying.')],
 r04_end:[L('Aelis','Ce n’est pas une carte des mines. C’est un circuit.','That’s not a map of the mines. It’s a circuit.')],
 r05_end:[L('Mentor','Tu te souviens du convoi ?','Do you remember the convoy?'),L('Kael','J’ai obéi. Tu as payé à ma place.','I followed orders. You paid the price for me.'),L('Mentor','Alors, cette fois, choisis.','Then this time, choose.'),L('Kael','Je ne laisserai plus d’autres décider à ma place.','I won’t let others decide for me again.')],
 r06_end:[L('Orion','Les cristaux étaient des verrous. Six sont ouverts.','The crystals were locks. Six are open.'),L('Fenn','On n’a donc rien réparé ?','So we fixed nothing?'),L('Orion','Si. Mais le mal a changé de place. Et j’ai aidé à rouvrir ce réseau.','We did. But we moved the danger elsewhere. And I helped reopen that network.'),L('Kael','Alors aide-nous à le réparer.','Then help us put it right.')],
 r06_fb:[L('Kael','Les inscriptions parlent de six verrous ouverts. Trouvons quelqu’un qui connaît le réseau.','The inscriptions mention six open locks. Let’s find someone who knows the network.')],
 r07_end:[L('Orion','Nous pouvons détourner le flux. Pas l’arrêter. Si nous abandonnons, les villages paieront le prix.','We can redirect the flow, not stop it. If we walk away, the villages will pay the price.')],
 r07_fb:[L('Kael','Ces plans montrent comment détourner le flux.','These plans show how to redirect the flow.')],
 r08_end:[L('Pharaon','J’ai conservé chaque souvenir de mon peuple. Il ne reste plus personne pour s’en souvenir.','I preserved every memory of my people. There is no one left to remember.'),L('Kael','Cette marque… Les caisses du port portaient la même.','That mark… It was on the crates at the harbour.')],
 r09_end:[L('Architecte','Enfin. Rends-moi ce qu’ils m’ont volé.','At last. Return what they stole from me.'),L('Aelis','Je croyais que vous étiez tous prisonniers.','I thought you were all prisoners.'),L('Architecte','Je suis leur mémoire.','I am their memory.'),L('Aelis','Non. Ils ont chacun la leur.','No. Each of them has their own.'),L('Aelis','Le cristal peut rendre les souvenirs. Il n’a pas besoin de nous prendre les nôtres.','The crystal can return memories without taking our own.')],
 r10_end:[L('Lyria','Mon ordre nous a appris à protéger la vérité. En réalité, il nous a appris à la cacher.','My order taught us to protect the truth. In reality, it taught us to hide it.'),L('Nyra','Tu n’es pas obligée de continuer.','You don’t have to keep doing it.'),L('Lyria','Je sais.','I know.')],
 r10_fb:[L('Kael','Les archives prouvent que les gardiens ont caché leur responsabilité.','The archives prove the guardians concealed their responsibility.')],
 r11_end:[L('Roi du Givre','J’ai gardé ce monde immobile. Vous devez le laisser vivre.','I kept this world frozen in place. You must let it live.'),L('Orion','Le dernier verrou cède. Nous devons atteindre le sanctuaire.','The last lock is giving way. We have to reach the sanctuary.')],
 r11_fb:[L('Roi du Givre','J’ai gardé ce monde immobile. Vous devez le laisser vivre.','I kept this world frozen in place. You must let it live.'),L('Kael','Le verrou cède. Nous devons atteindre le sanctuaire.','The lock is giving way. We must reach the sanctuary.')],
 r12_pre:[L('Architecte','Je peux vous rendre tout ce que vous avez perdu. Plus personne n’oubliera. Plus personne ne souffrira seul.','I can return everything you have lost. No one will forget. No one will suffer alone.'),L('Aelis','Et si nous voulons vivre autrement ?','What if we want to live differently?'),L('Architecte','Vous n’aurez plus besoin de le vouloir.','You will no longer need to want anything.'),L('Kael','Nous ne sommes pas venus pour te donner raison.','We didn’t come here to prove you right.')],
 r12_end:[L('Architecte','Sans moi, ils oublieront encore.','Without me, they will forget again.'),L('Orion','Sans vous, ils pourront apprendre.','Without you, they will be free to learn.'),L('Aelis','Les souvenirs leur appartiennent. Même ceux qui font mal.','Their memories belong to them. Even the painful ones.'),L('Kael','Rentrons.','Let’s go home.')],
 r12_end_k:[L('Architecte','Sans moi, ils oublieront encore.','Without me, they will forget again.'),L('Kael','Sans vous, ils pourront apprendre.','Without you, they will be free to learn.'),L('Aelis','Les souvenirs leur appartiennent. Même ceux qui font mal.','Their memories belong to them. Even the painful ones.'),L('Kael','Rentrons.','Let’s go home.')],
 epilogue:[L('Mira','Je me souviens du début de la chanson. Mais pas de la fin.','I remember the beginning of the song. But not the ending.'),L('Fenn','Moi non plus. On pourrait en inventer une.','Neither do I. We could make one up.'),L('Mira','Alors reste un peu.','Then stay a little longer.')],
 join_orion:[L('Orion','J’ai aidé à rouvrir ce réseau. Je vous aiderai à le réparer.','I helped reopen this network. I’ll help you put it right.')],
 join_nyra:[L('Nyra','J’ai transporté ces cristaux pour de l’or. Je connais la marque de ceux qui les achetaient. Cette fois, je choisis mon camp.','I carried those crystals for gold. I know the mark of those who bought them. This time, I choose my side.')],
 join_lyria:[L('Lyria','Je ne servirai plus un ordre qui exige le silence. Je servirai ceux qui ont besoin de nous.','I will no longer serve an order that demands silence. I will serve those who need us.')]};
// carte de fin affichée après l'épilogue (facultative, passable)
export const OUTRO=[['Kael','Kael forme des gardes qui protègent les gens plutôt que d’obéir aveuglément.','Kael trains guards to protect people rather than obey blindly.'],['Fenn','Fenn retrouve les chemins de son enfance et en découvre de nouveaux.','Fenn rediscovers the paths of his childhood and finds new ones.'],['Aelis','Aelis aide les survivants à retrouver leurs souvenirs, sans promettre l’impossible.','Aelis helps survivors recover their memories without promising the impossible.'],['Orion','Orion ouvre ses recherches à tous.','Orion makes his research available to everyone.'],['Nyra','Nyra aide les victimes du trafic.','Nyra helps the victims of the crystal trade.'],['Lyria','Lyria publie les archives et réforme son ordre.','Lyria publishes the archives and reforms her order.']];
export const OUTRO_END=['L’aventure continue — Retour au camp.','The adventure continues — Return to camp.'];
const NAMES={Voix:['Voix inconnue','Unknown voice'],Architecte:['L’Architecte','The Architect'],Pharaon:['Le Pharaon','The Pharaoh'],'Roi du Givre':['Le Roi du Givre','The Frost King'],Mentor:['Le Mentor','The Mentor']};
export const nameOf=(w,en)=>(NAMES[w]||[w,w])[en?1:0];
const ZG={prairie:'r01_end',bois:'r02_end',plage:'r03_end',mont:'r04_end',chateau:'r05_end',cristal:'r06_end',braise:'r07_end',sables:'r08_end',marais:'r09_end',citadelle:'r10_end',givre:'r11_end',eter:'r12_end'};
const REC={join_orion:3,join_nyra:4,join_lyria:5};
const zdone=(save,id)=>{const z=ZONES.find(q=>q.id===id);return !!z&&((save.z&&save.z[id])||0)>=zlen(z)};
export const seen=(save,id)=>!!(save.storySeen&&save.storySeen[id]);
// Validation + migration : anciennes sauvegardes = aucune chaîne de scènes passées (tout ce qui est déjà derrière est marqué vu)
export function cleanStory(save){const s=save.storySeen;
 if(s&&typeof s==='object'&&!Array.isArray(s)){const o={};for(const k of Object.keys(s))if(SC[k]&&s[k])o[k]=1;save.storySeen=o;return o}
 const o={};const prog=(save.lvl||1)>1||Object.values(save.z||{}).some(v=>v>0)||(save.items||[]).length>0;
 if(prog){o.prologue=1;for(const [id,g] of Object.entries(ZG))if(zdone(save,id)){
   if(g==='r06_end'){o.r06_fb=1;if(recruited(save,3))o.r06_end=1}else if(g==='r10_end'){o.r10_fb=1;if(recruited(save,5))o.r10_end=1}
   else{o[g]=1;if(g==='r07_end')o.r07_fb=1;if(g==='r11_end')o.r11_fb=1;if(g==='r12_end'){o.r12_end_k=1;o.r12_pre=1;o.epilogue=1}}}
  if((save.z&&save.z.eter||0)>=zlen(ZONES.find(q=>q.id==='eter'))-1)o.r12_pre=1;
  for(const [j,i] of Object.entries(REC))if(recruited(save,i))o[j]=1}
 save.storySeen=o;return o}
const has=(save,i)=>recruited(save,i);
// scènes à jouer juste après la première victoire sur le boss d'une région
export function bossWinEvents(save,zid){const g=ZG[zid];if(!g)return[];const S=save.storySeen||{};let ids;
 if(zid==='cristal')ids=has(save,3)?['r06_end']:['r06_fb'];
 else if(zid==='braise')ids=[has(save,3)?'r07_end':'r07_fb'];
 else if(zid==='citadelle')ids=has(save,5)?['r10_end']:['r10_fb'];
 else if(zid==='givre')ids=[has(save,3)?'r11_end':'r11_fb'];
 else if(zid==='eter')ids=[has(save,3)?'r12_end':'r12_end_k'];
 else ids=[g];
 return ids.filter(id=>!S[id])}
// scène avant le premier accès au boss de la région 12 (passable)
export const bossPreEvents=(save,zid)=>zid==='eter'&&!(save.storySeen||{}).r12_pre?['r12_pre']:[];
// scènes de camp : prologue, recrutements réels (fusionnés avec les fins de région 6 et 10), épilogue
export function campEvents(save){const S=save.storySeen||{},out=[];
 if(!S.prologue)out.push('prologue');
 for(const [j,i] of Object.entries(REC)){if(!has(save,i)||S[j])continue;
  if(j==='join_orion'&&zdone(save,'cristal')&&!S.r06_end){out.push('r06_end');continue}
  if(j==='join_lyria'&&zdone(save,'citadelle')&&!S.r10_end){out.push('r10_end');continue}
  out.push(j)}
 if(!S.epilogue&&zdone(save,'eter')&&(S.r12_end||S.r12_end_k))out.push('epilogue');
 return out}
// marque une scène comme vue ; une scène fusionnée marque aussi le recrutement correspondant
export function markSeen(save,id){const S=save.storySeen||(save.storySeen={});S[id]=1;if(id==='r06_end')S.join_orion=1;if(id==='r10_end')S.join_lyria=1}
// ---------- affichage : fenêtre de dialogue, un toucher pour avancer, « Passer » pour tout fermer ----------
let box=null,busy=null;
const CSS='#story{position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;justify-content:flex-end;background:rgba(5,4,12,.62);font-family:inherit;-webkit-tap-highlight-color:transparent;user-select:none}#story .sp{position:absolute;top:max(10px,env(safe-area-inset-top));right:12px;padding:10px 16px;border:1px solid #ffd65a88;border-radius:999px;background:#1b1530cc;color:#ffd65a;font:600 15px inherit;min-height:44px}#story .bx{margin:0 auto max(14px,env(safe-area-inset-bottom));width:min(94vw,640px);padding:16px 18px 14px;border:1px solid #ffd65a77;border-radius:14px;background:linear-gradient(#241a3df2,#120d22f7);color:#f3ecd8;box-shadow:0 6px 30px #000a}#story .nm{color:#ffd65a;font-weight:700;margin-bottom:6px;font-size:17px}#story .tx{font-size:18px;line-height:1.4;min-height:3.8em}#story .hn{margin-top:8px;text-align:right;font-size:13px;opacity:.65}#story .card p{margin:6px 0;font-size:16px;line-height:1.35}#story .card b{color:#ffd65a}#story .go{display:block;margin:12px auto 0;padding:12px 22px;border:0;border-radius:10px;background:#ffd65a;color:#241a3d;font:700 17px inherit;min-height:44px}';
function mount(){if(box)return box;const st=document.createElement('style');st.textContent=CSS;document.head.append(st);box=document.createElement('div');box.id='story';box.setAttribute('role','dialog');box.setAttribute('aria-live','polite');return box}
// joue une liste d'identifiants de scènes ; renvoie une promesse résolue à la fermeture (jamais bloquant : « Passer » ferme tout)
export function playStory(save,ids,persist){ids=ids.filter(id=>SC[id]);if(!ids.length||typeof document==='undefined')return Promise.resolve();
 const run=()=>new Promise(res=>{const en=save.lang==='en',el=mount();const lines=[];
  for(const id of ids){markSeen(save,id);for(const l of SC[id])lines.push(l);}
  if(persist)persist();
  import('./audio.js').then(a=>{if(ids.some(i=>i.startsWith('join_')))a.sfx('recruit_hero',.9);if(ids.includes('epilogue'))a.music('ending')}).catch(()=>{});
  const hasEpi=ids.includes('epilogue');let k=0,card=false,closed=false;
  const close=()=>{if(closed)return;closed=true;el.remove();removeEventListener('keydown',key);res()};
  const draw=()=>{el.innerHTML='';const sp=document.createElement('button');sp.className='sp';sp.textContent=en?'Skip ▶▶':'Passer ▶▶';sp.onclick=e=>{e.stopPropagation();close()};el.append(sp);
   const bx=document.createElement('div');bx.className='bx';
   if(card){bx.className='bx card';for(const[n,fr,e2]of OUTRO){const p=document.createElement('p');const b=document.createElement('b');b.textContent=n;p.append(b,document.createTextNode((en?e2:fr).slice(n.length)));bx.append(p)}
    const t=document.createElement('p');t.style.textAlign='center';t.textContent=OUTRO_END[en?1:0];bx.append(t);const g=document.createElement('button');g.className='go';g.textContent=en?'Return to camp':'Retour au camp';g.onclick=e=>{e.stopPropagation();close()};bx.append(g)}
   else{const[w,fr,e2]=lines[k];const nm=document.createElement('div');nm.className='nm';nm.textContent=nameOf(w,en);const tx=document.createElement('div');tx.className='tx';tx.textContent=en?e2:fr;const hn=document.createElement('div');hn.className='hn';hn.textContent=(k+1)+' / '+lines.length+(en?' · tap to continue':' · toucher pour continuer');bx.append(nm,tx,hn)}
   el.append(bx)};
  const next=()=>{if(card)return;if(k+1<lines.length){k++;draw()}else if(hasEpi){card=true;draw()}else close()};
  const key=e=>{if(e.key==='Escape'){close()}else if(e.key==='Enter'||e.key===' '){e.preventDefault();next()}};
  el.onclick=next;addEventListener('keydown',key);document.body.append(el);draw()});
 busy=(busy||Promise.resolve()).then(run);return busy}
