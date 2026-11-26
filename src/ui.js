// Interface : panneau de combat, frise des tours, écrans (camp, carte, résultat), saisie tactile.
import {G,hooks} from './game.js';
import {$} from './util.js';
import {SP,HER,MON,ZONES,ITEMS,POTION,RARE,zlen} from './data.js';
import {K,pick,ri,occ,reach,selCells,newBattle,genMap,mkUnits,heroStats,gainXp,xpNeed,intent,stars,starList,bossNext,BOSS_P,whyNot,forecast,zoneCells,zoneCenter,targetsFrom,guideSetup,pathTo,upgrade,upCost,upLvl,itemVal,rarOf,rollRare,SURVIVE,shopStock,buy,sell,sellPrice,buyPot,contracts,ctUpdate,claim,dailyFight,fightSpec,prismCover,cell,prismHits,prismDmg,soak,ampAt,prismOn,beamDmg,approach,okTarget,carryPA,costOf,star3,STAR3_TXT} from './rules.js';
import {save,prog,unlocked,store,resetSave} from './save.js';
import {AT,cv,icon,uiURL,drawF,layout,tapCell,addRefs,addFx,resetFx,heroFrame,zoneAssets,say,view,setView,zoomAt} from './render.js';
import {cast,moveTo,end,runFight} from './turns.js';
import {sfx,music,duck,setSon,sonBtns} from './audio.js';
import {SPECS,TIER,DONE,specOf} from './talents.js';
import {renderHome} from './home.js';

// ---------- panneau de combat ----------
function renderTL(){const tl=$('tl'),S=G.s;tl.innerHTML='';const n=S.order.length;for(let i=0;i<n;i++){const u=S.order[((G.turn+i)%n+n)%n];if(u.dead)continue;
 const[s,idx]=u.team==='h'?heroFrame(u.k):[u.s,u.row*3];const c=icon(s,idx,34,u.team==='h'?.62:0);c.className=u.team+(u===G.cur?' cur':'')+(G.sel&&G.sel.cells.some(s=>s.ok&&s.x===u.x&&s.y===u.y)?' tg':'');c.onclick=()=>{if(G.phase==='fight'&&!G.busy)act({x:u.x,y:u.y})};tl.appendChild(c)}}
const SPI={slash:['sico',0],smash:['sico',9],guard:['sico',1],shot:['sico',8],volley:['ico',11],trap:['sico',12],revive:['sico',14],potion:['items',10],boots:['sico',10],heal:['sico',4],venom:['sico',5],aura:['sico',6]};
// objectif de survie (V4.1) : tours restants, tour en cours compris
const survTxt=short=>{const n=Math.max(1,(G.s.surv||SURVIVE)+1-G.s.round);return n>1?(short?`Tiens encore ${n} tours`:`Objectif : tiens encore ${n} tours`):(short?'Dernier tour !':'Dernier tour à tenir !')};
const GOALS={survive:`<b>⏳ Objectif : survivre ${SURVIVE} tours</b><br>Garde au moins un héros debout jusqu’à la fin du ${SURVIVE}ᵉ tour. Tu n’as pas besoin de vaincre tous les monstres (le faire gagne aussi).`,
 chief:'<b>♛ Objectif : abattre le chef</b><br>La victoire est immédiate dès que le monstre à la couronne tombe, même s’il reste des ennemis.'};
GOALS.waves=n=>`<b>⏳ Objectif : tenir ${n} tours</b><br>Des renforts arrivent par vagues : les cases marquées ⚠ annoncent ceux du prochain tour. Garde au moins un héros debout jusqu’à la fin du ${n}ᵉ tour.<br>★ Élimine toutes les vagues : 3ᵉ étoile et +25 % d’or.`;
let goalT=0;function goalBanner(t){const g=$('goal');g.textContent=t;g.classList.add('on');clearTimeout(goalT);goalT=setTimeout(()=>g.classList.remove('on'),2600)}
function newRound(sp=[]){const w=G.s.wave;if(sp.length){addRefs(sp);for(const m of sp){addFx(m.x,m.y,6,1.1,600,'fxi');say(m,m.elite?'Élite !':'Renfort','#ffa040',!!m.elite)}sfx('enemy_warning',.8);renderTL()}
 if(G.s.goal==='survive')goalBanner((sp.length?`⚠ ${sp.length} renfort${sp.length>1?'s':''} ! `:'')+(w&&w.next.length?`Encore ${w.next.length} au prochain tour · `:w&&!w.q.length&&G.s.units.some(u=>u.team==='m'&&!u.dead)?'Dernière vague · ':'')+'⏳ '+survTxt())}
function render(){renderTL();
 const u=G.cur,{sel,F}=G;
 $('title').textContent=F?`${ZONES[F.zi].n}\n${F.daily?'Défi':`Étape ${F.i+1}/${zlen(ZONES[F.zi])}${F.boss?' · Boss':''}`} · tour ${G.s.round}${G.s.goal==='chief'?'\n♛ Abats le chef':G.s.goal==='survive'?`\n⏳ ${survTxt(true)}`:''}`:'';
 if(!u){$('exc').className='';return}
 const me=u.team==='h'&&G.phase==='fight';
 G.intents=me&&!G.busy?G.s.units.filter(m=>m.team==='m'&&!m.dead).map(m=>({m,...intent(G.s,m)})).filter(i=>i.target):null;
 $('who').innerHTML='';const ic=icon(...(u.team==='h'?heroFrame(u.k):[u.s,u.row*3]),30,u.team==='h'?.62:0);$('who').append(ic,`${u.n}`);
 const hb=document.createElement('div');hb.id='hpb';hb.innerHTML=`<i style="width:${100*u.hp/u.max}%"></i>`;const ht=document.createElement('span');ht.id='hpt';ht.textContent=`${u.hp}/${u.max} PV`;$('who').append(hb,ht);
 // V4.0.5 : PA et PM sur la ligne du nom ; #pts ne garde que la rangée des cibles (flottante en portrait)
 $('who').insertAdjacentHTML('beforeend',`<span class="pa"><img src="${uiURL(12)}"> ${u.pa} PA</span><span class="pm"><img src="${uiURL(13)}"> ${u.pm} PM</span>`+(me?'':`<span class="en">Tour ennemi…</span>`));$('pts').innerHTML='';
 const tg=document.createElement('div');tg.id='tgt';
 if(me&&sel&&!G.busy)(sel.sp.t==='self'?[u]:G.s.units.filter(o=>sel.sp.t==='dead'?o.dead&&o.team==='h'&&o!==u:!o.dead&&o.team===(sel.sp.t==='ally'?'h':'m'))).map(o=>[o,sel.cells.some(s=>s.ok&&s.x===o.x&&s.y===o.y)]).forEach(([o,ok])=>{const w=document.createElement('button'),zc=!ok&&sel.sp.zone&&zoneCenter(G.s,u,sel.sp,o),ap=!ok&&!zc&&o!==u&&approach(G.s,u,sel.sp,o,G.reachC,sel.sp.zone?from=>!!zoneCenter(G.s,u,sel.sp,o,from):undefined),isEx=same(G.ex?.tap,o);w.className='tb'+(ok||zc?' ok':ap?' ap':'')+(isEx?' ex':'');if(isEx)setTimeout(()=>w.scrollIntoView({block:'nearest',inline:'nearest'}));w.append(icon(...(o.team==='h'?heroFrame(o.k):[o.s,o.row*3]),40,o.team==='h'?.62:0));w.insertAdjacentHTML('beforeend',`<i style="width:${100*o.hp/o.max}%"></i>${o.tag?`<u>${o.tag}</u>`:''}`);w.setAttribute('aria-label',`${o.n}, ${o.hp} sur ${o.max} PV${ok||zc?', cible possible':ap?', cible possible après déplacement':''}`);w.onclick=()=>act({x:o.x,y:o.y});tg.appendChild(w)});
 $('pts').append(tg);
 const S=$('spells');S.innerHTML='';
 if(u.team==='h')for(const id of u.sp){const sp=u.S[id],b=document.createElement('button');b.className='sp'+(sel&&sel.sp===sp?' sel':'');
  b.style.backgroundImage=`url(${uiURL(sel&&sel.sp===sp?4:3)})`;b.appendChild(icon(...SPI[id],58));const pc=costOf(u,sp);b.insertAdjacentHTML('beforeend',`<b${pc>sp.pa?' class="up" title="Relance : +1 PA"':''}>${pc}</b>`+(u.cd[sp.n]?`<em>${u.cd[sp.n]>50?'—':u.cd[sp.n]}</em>`:''));
  b.insertAdjacentHTML('beforeend',`<small>${sp.n}</small>`);b.setAttribute('aria-label',`${sp.n}, ${pc} PA`);
  if(me&&!sel&&F&&F.guide&&id==='shot'&&u.pa>=pc&&targetsFrom(G.s,u,u).foes.length)b.classList.add('coach');
  b.disabled=!me||G.busy||u.pa<pc||u.cd[sp.n]>0||(sp.potion&&!(G.s.pot>0));b.onclick=()=>{G.plan=null;G.ex=null;if(G.sel&&G.sel.sp===sp)G.sel=null;else G.sel={sp,cells:selCells(G.s,u,sp)};render()};S.appendChild(b)}
 const keep=u.team==='h'&&me?carryPA(u):0;$('end').innerHTML='Fin du tour'+(keep?`<small>+${keep} PA gardé${keep>1?'s':''}</small>`:'');
 $('end').disabled=!me||G.busy;
 const beam=G.s.beam&&!G.s.beam.by.dead?`⚠ Rayon au prochain tour du Titan (${beamDmg(G.s.beam.by)} dégâts) : quitte les cases rayées. `:'',amp=me&&sel&&(sel.sp.dmg||sel.sp.heal)&&ampAt(G.s,u)>1?'💎 Cristal : +30 %. ':'';
 $('hint').textContent=!me?`${u.n} joue.`:beam+amp+(sel?`${sel.sp.n} : ${sel.sp.dmg?sel.sp.dmg.join('–')+' de base, ':''}${sel.sp.heal?sel.sp.heal.join('–')+' soins de base, ':''}${sel.sp.r[1]?`portée ${sel.sp.zone?'du centre ':''}${sel.sp.r.join('–')}. Touche une cible pour voir l’effet réel`:'sur soi : touche ton héros'}. ${sel.sp.d}.`:F&&F.guide&&(canMove(u)||castable(u).length)?coach(u):idle(u));
 aimCard(u);
}
function coach(u){const t=targetsFrom(G.s,u,u).foes.length,go='Touche une case bleue pour voir l’aperçu, retouche-la pour y aller.';
 if(u.k==='archer')return t&&u.pa>=3?'🎯 Une Gelée est à portée : touche « Tir », la Gelée, puis retouche-la.':u.pm?go+' Le 🎯 compte les ennemis visables de là.':'Bien joué ! Touche « Fin du tour ».';
 if(u.k==='warrior')return t?'⚔ Un ennemi est au contact : « Fracas » le repousse. Contre un obstacle : dégâts bonus.':u.pm?'Kael frappe au contact. '+go:'Garde Kael à l’abri avec « Rempart », ou touche « Fin du tour ».';
 return t&&u.pa>=3?'🌿 « Épine » empoisonne. Frapper la même Gelée à deux héros = Combo.':u.pm?'Aelis soigne et protège : reste près des alliés. '+go:'Touche « Fin du tour ».'}
const info=o=>{const it=G.intents&&G.intents.find(i=>i.m===o);return`${o.n} · ${o.hp}/${o.max} PV · ${o.maxPM} PM`+(o.atk?` · frappe ${o.atk.dmg.join('–')}`:'')+(it?` · vise ${it.target.n}${it.amp?' (cristal +30 %)':''}`:'')+(o.bs==='beam'?` · phase ${o.ph||1}`+(G.s.beam?' · rayon au prochain tour':''):'')+(o.bs==='beam'&&G.s.beam?'':o.bs==='rage'?(o.raged?' · EN FUREUR':' · fureur sous 50 % PV'):o.bs?` · ${BOSS_P[o.bs][2]} ${bossNext(o)===1?'au prochain tour':`dans ${bossNext(o)} tours`}`:'')};
// sorts réellement utilisables maintenant (PA, recharge, au moins une cible ; potion seulement si blessé)
const castable=u=>u.sp.map(id=>u.S[id]).filter(sp=>u.pa>=costOf(u,sp)&&!(u.cd[sp.n]>0)&&!(sp.potion&&(!(G.s.pot>0)||u.hp>=u.max))&&selCells(G.s,u,sp).some(c=>c.ok));
const canMove=u=>u.pm>0&&!!G.reachC&&G.reachC.dist.size>1;
function idle(u){const c=castable(u).map(sp=>sp.n).join(', ');
 if(canMove(u))return c?'Case à pastille : aperçu, retouche pour y aller. Ou choisis un sort.':'Aucune cible d’ici : déplace-toi (cases à pastille) ou touche « Fin du tour ».';
 return c?`Plus de déplacement. Encore possible : ${c}. Sinon « Fin du tour ».`:'Plus aucune action : touche « Fin du tour ».'}
function autoEnd(){const u=G.cur;if(!u||u.team!=='h'||!G.endTurnResolve||u.pm>0||castable(u).length)return;
 $('hint').textContent='Plus rien à faire : tour suivant…';goalBanner(`${u.n} n’a plus d’action : tour suivant`);setTimeout(()=>{if(G.cur===u&&G.endTurnResolve&&!G.busy){G.sel=null;G.reachC=null;G.endTurnResolve()}},1500)}

// ---------- saisie ----------
// V4.4 : deux doigts = zoom, un doigt qui glisse sur un plateau agrandi = déplacement, molette à la souris.
// Un appui n'agit qu'au relâchement, s'il n'a ni glissé ni été accompagné d'un second doigt.
const PT=new Map();let moved=false;
const pinch=()=>{const[a,b]=[...PT.values()];return{d:Math.hypot(a.x-b.x,a.y-b.y)||1,x:(a.x+b.x)/2,y:(a.y+b.y)/2}};
cv.addEventListener('pointerdown',e=>{if(e.button>0)return;if(!PT.size)moved=false;PT.set(e.pointerId,{x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY});if(PT.size>1)moved=true;try{cv.setPointerCapture(e.pointerId)}catch(_){}});
addEventListener('pointermove',e=>{const p=PT.get(e.pointerId);if(!p||G.phase==='camp')return;
 const before=PT.size>1?pinch():null,dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
 if(before){const n=pinch();zoomAt(view.z*n.d/before.d,before.x,before.y);setView(view.z,view.x+n.x-before.x,view.y+n.y-before.y);return}
 if(Math.hypot(p.x-p.x0,p.y-p.y0)>(view.z>1?10:24)){if(!moved&&view.z>1)setView(view.z,view.x+p.x-p.x0,view.y+p.y-p.y0);else if(view.z>1)setView(view.z,view.x+dx,view.y+dy);moved=true}});
const lift=(e,cancel)=>{const p=PT.get(e.pointerId);if(!p)return;PT.delete(e.pointerId);if(!cancel&&!PT.size&&!moved&&G.phase==='fight'&&!G.busy)act(tapCell(p.x0,p.y0))};
addEventListener('pointerup',e=>lift(e));addEventListener('pointercancel',e=>lift(e,true));
cv.addEventListener('wheel',e=>{e.preventDefault();if(G.phase!=='camp')zoomAt(view.z*Math.exp(-e.deltaY*.0015),e.clientX,e.clientY)},{passive:false});
$('unzoom').onclick=()=>setView(1,0,0);
cv.addEventListener('pointermove',e=>{const u=G.cur;if(e.pointerType!=='mouse'||e.buttons||G.phase!=='fight'||G.busy||!G.sel||G.sel.sp.t==='self'||!u||u.team!=='h'||!G.endTurnResolve)return;
 const c=tapCell(e.clientX,e.clientY);if(G.s.map.has(K(c.x,c.y))&&!same(c,G.ex?.tap))aim(u,c,true)});
// action sur une case (toucher du plateau, ou portrait de la frise des tours pour viser une unité cachée)
// V4.2 : sort choisi → 1er appui (ou survol à la souris) : examiner la cible ; 2e appui au même endroit : lancer.
// Hors d'atteinte : l'examen montre le trajet, la confirmation fait avancer le héros puis lancer le sort (V4.1).
async function strike(u,sp,c){G.sel=null;G.plan=null;G.ex=null;await cast(u,sp,c);if(end())return;G.reachC=reach(G.s,u,u.pm);render();autoEnd()}
async function advance(u,sp,E){const fid=G.fid;G.plan=null;G.sel=null;G.ex=null;await moveTo(u,E.ap.k,G.reachC.prev);if(G.fid!==fid||G.phase!=='fight')return;G.reachC=reach(G.s,u,u.pm);
 if(okTarget(G.s,u,sp,E))return strike(u,sp,{x:E.x,y:E.y});render();autoEnd()}
const same=(a,b)=>a&&b&&a.x===b.x&&a.y===b.y;
const foeOf=(u,sp,o)=>o&&o!==u&&(sp.t==='ally'?o.team===u.team:(sp.t==='enemy'||sp.t==='cell'&&!sp.free)&&o.team!==u.team);
// ce que viserait un appui sur la case c
function examine(u,sp,c){const S=G.s,o=occ(S,c.x,c.y),E={tap:{x:c.x,y:c.y},x:c.x,y:c.y};
 if(G.sel.cells.some(s=>s.ok&&same(s,c)))return E;
 if(sp.zone&&foeOf(u,sp,o)){const z=zoneCenter(S,u,sp,o);if(z)return{...E,...z,indirect:1}}
 if(foeOf(u,sp,o)){const via=sp.zone?from=>!!zoneCenter(S,u,sp,o,from):undefined,ap=approach(S,u,sp,c,G.reachC,via);
  if(ap){const z=sp.zone&&zoneCenter(S,u,sp,o,ap);return{...E,...(z||{}),why:whyNot(S,u,sp,c)?.t,at:whyNot(S,u,sp,c)?.at,ap:{...ap,path:pathTo(u,ap.k,G.reachC.prev),sp,foes:[o]}}}}
 const w=whyNot(S,u,sp,c),why=sp.zone&&o?`Aucun centre ne peut ${o.team===u.team?'l’atteindre':'le toucher'}${w?' ('+w.t.toLowerCase()+')':''}`:w?w.t:'Hors de portée';
 return{...E,bad:why,at:w&&w.at}}
function aim(u,c,hover){const sp=G.sel.sp,E=examine(u,sp,c);
 if(E.bad&&!occ(G.s,c.x,c.y)){G.ex=null;render();if(!hover){$('hint').textContent=E.bad+'. Touche une cible, ou retouche le sort pour l’annuler.';G.mark=E.at?{...E.at,until:Date.now()+2200}:null}return}
 G.ex=E;G.mark=E.at?{...E.at,until:Date.now()+2200}:null;if(!hover&&!E.bad)sfx('click',.5);render()}
async function act(c){const u=G.cur,o=occ(G.s,c.x,c.y);
 if(!u||u.team!=='h'){if(o)$('hint').textContent=info(o);return}
 if(!G.endTurnResolve)return;
 if(G.sel){const sp=G.sel.sp,E=G.ex;
  if(sp.t==='self'){if(same(c,u))return strike(u,sp,c);$('hint').textContent='Touche ton héros pour confirmer, ou retouche le sort pour l’annuler.';return}
  if(E&&!E.bad&&(same(c,E.tap)||E.ap&&same(c,E.ap)&&!o))return E.ap?advance(u,sp,E):strike(u,sp,{x:E.x,y:E.y});
  return aim(u,c)}
 const k=K(c.x,c.y);if(G.reachC&&G.reachC.dist.get(k)>0){
  if(!G.plan||G.plan.x!==c.x||G.plan.y!==c.y){const t=targetsFrom(G.s,u,c),cost=G.reachC.dist.get(k);G.plan={x:c.x,y:c.y,cost,foes:t.foes,path:pathTo(u,k,G.reachC.prev)};sfx('click',.5);
   $('hint').textContent=`${cost} PM. De là : ${t.list.length?t.list.map(l=>`${l.sp.n} → ${l.n} cible${l.n>1?'s':''}`).join(', '):'aucune cible'}. Retouche la case pour y aller.`;return}
  G.plan=null;await moveTo(u,k,G.reachC.prev);G.reachC=reach(G.s,u,u.pm);render();autoEnd();return}
 if(G.plan){G.plan=null;render()}if(o){$('hint').textContent=info(o);return}
 const cl=cell(G.s,c.x,c.y);if(cl&&(cl.water||cl.block)){const t=(cl.water?'Eau':cl.cry?'Cristal':'Obstacle')+' · infranchissable';$('hint').textContent=t+'.';say({gx:c.x,gy:c.y},t,cl.water?'#9fd8ff':'#e8dcc0')}}
// ---------- carte de visée : qui, validité, effet réel ----------
const rg=a=>a[0]===a[1]?`${a[0]}`:`${a[0]}–${a[1]}`;
const KO={sure:'<em class="ko">KO garanti</em>',maybe:'<em class="ko2">KO possible</em>',crit:'<em class="ko2">KO si critique</em>'};
function effect(u,sp,t,from){const f=forecast(G.s,u,sp,t,from),out=[];
 if(f.dmg){out.push(`<b>${rg(f.dmg)} dégâts</b>${f.push?` + ${f.push} collision`:''} · critique ${Math.round(f.pc*100)} % : ${rg(f.crit)}${f.dodge?` · esquive ${Math.round(f.dodge*100)} %`:''}`);
  const why=[u.buff&&`bonus +${Math.round(u.buff.pct*100)} %`,f.combo&&`combo ×${f.combo}`,f.amp&&'cristal',t.shield>0&&'Rempart',t.armor&&`armure ${Math.round(t.armor*(1-(sp.pierce||0))*100)} %`].filter(Boolean);
  if(f.ko||why.length)out.push((f.ko?KO[f.ko]+' ':'')+why.join(' · '))}
 if(f.heal)out.push(`<b>+${rg(f.heal)} PV</b>`);
 if(sp.poison&&f.dmg)out.push(`poison ${sp.poison[0]} × ${sp.poison[1]} tours`);
 if(sp.buff)out.push(`+${Math.round(sp.buff*100)} % de dégâts`);
 return out}
function aimCard(u){const X=$('exc'),sel=G.sel,E=G.ex;if(!sel||!E||G.busy){X.className='';X.innerHTML='';return}
 const S=G.s,sp=sel.sp,t=occ(S,E.tap.x,E.tap.y),from=E.ap||u,L=[];
 L.push(`<strong>${sp.n} → ${t?`${t.n} · ${t.hp}/${t.max} PV`:cell(S,E.tap.x,E.tap.y)?.cry==='p'?'prisme':'case visée'}</strong>`);
 if(E.bad)L.push(`✗ ${E.bad}`);
 else{if(E.ap&&E.why)L.push(`✗ D’ici : ${E.why}`);L.push(E.ap?`↷ ${u.n} avance de ${E.ap.cost} PM puis lance`:E.indirect?'✓ Touché en visant une case voisine':'✓ À portée');
  if(sp.zone){const hit=zoneCells(S,E).map(p=>occ(S,p.x,p.y)).filter(o=>o&&o.team!==u.team);
   for(const o of hit){const f=forecast(S,u,sp,o,from);L.push(`${o.n} : <b>${rg(f.dmg)}</b> ${f.ko?KO[f.ko]:''}`)}
   L.push(hit.length?`critique ${Math.round((u.crit||.12)*100)} % (×1,5) · la Volée épargne tes héros`:'Aucun ennemi dans la zone')}
  else if(t&&!sp.all)L.push(...effect(u,sp,t,from));else L.push(sp.d);
  // prisme déclenché : effet à part, qui touche aussi les héros
  const pc=sp.dmg&&(sp.zone?zoneCells(S,E):[E]).map(p=>cell(S,p.x,p.y)).find(c=>prismOn(S,c));
  if(pc){const d=prismDmg(S,{...u,x:from.x,y:from.y},sp),who=prismHits(S,pc).map(p=>E.ap&&p.x===E.ap.x&&p.y===E.ap.y?u:occ(S,p.x,p.y)===u&&E.ap?null:occ(S,p.x,p.y)).filter(Boolean);
   L.push(`<span class="pz${who.some(o=>o.team==='h')?' danger':''}">◆ Prisme déclenché : ${who.length?who.map(o=>`${o.n} -${soak(o,d)}`).join(', '):'personne autour'}${who.some(o=>o.team==='h')?' — héros touché !':''}</span>`)}
  L.push('<i>Retouche au même endroit pour lancer</i>')}
 X.innerHTML=L.map(l=>`<div>${l}</div>`).join('');X.className='on'+(E.bad?' bad':'');
 X.style.top=matchMedia('(orientation:landscape)').matches?'':$('top').getBoundingClientRect().bottom+2+'px';
 $('hint').textContent=E.bad?'Choisis une autre cible, ou retouche le sort pour l’annuler.':'Retouche pour lancer · retouche le sort pour annuler.'}
$('end').onclick=()=>{if(G.endTurnResolve&&!G.busy){G.plan=null;G.ex=null;G.sel=null;G.reachC=null;G.endTurnResolve()}};
let fleeArm=0;$('flee').onclick=()=>{if(G.phase!=='fight')return;if(Date.now()-fleeArm<2500){G.phase='lose';G.fid++;if(G.endTurnResolve)G.endTurnResolve();result(false,true)}else{fleeArm=Date.now();$('flee').textContent='Sûr ?';setTimeout(()=>$('flee').textContent='Fuir',2500)}};

// ---------- écrans ----------
const today=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4)/864e5); // jour local
export async function startFight(zi,i,F){
 F=F||fightSpec(zi,i,zi*1000+i*97+save.gold);G.phase='camp'; // l'ancien plateau n'est plus dessiné pendant le chargement (« Combat suivant »)
 $('mapinfo').textContent='Chargement…';try{await zoneAssets(F)}catch(e){$('mapinfo').textContent='Images introuvables : '+e;return}G.F=F;
 document.body.classList.remove('camp');$('camp').classList.remove('on');$('tav').classList.remove('on');$('result').classList.remove('on');$('map').classList.remove('on');
 resetFx();const S=G.s=newBattle();S.pot=save.pot||0;const{hs,es}=genMap(S,G.F.seed,G.F.th,G.F.cry);if(zi===0&&i===0&&!prog('prairie'))G.F={...G.F,pool:['slime'],guide:1};
 mkUnits(S,G.F,hs,es,HER.map((_,j)=>heroStats(save,j)));if(G.F.guide)guideSetup(S);if(G.F.tip==='prism')prismCover(S);addRefs(S.units);S.rng=Math.random;
 G.turn=-1;G.cur=null;G.sel=null;G.plan=null;G.phase='fight';G.fid++;
 layout();renderTL();render();const zid=ZONES[zi].id;const ZM={prairie:'forest',bois:'forest',plage:'coast',mont:'mountain',chateau:'castle',cristal:'cave'};music(G.F.boss?(zid==='cristal'?'titan_boss':'boss'):i===2&&zid!=='cristal'?'elite_battle':ZM[zid]||'battle');setTimeout(()=>sfx(G.F.boss?'boss_intro':'enemy_warning',.8),400);const tip=G.F.tip&&prog(ZONES[zi].id)<=i?()=>tuto(runFight,0,TIPS[G.F.tip]):runFight,fid=G.fid;
 const go=S.goal?()=>tuto(()=>G.fid===fid&&tip(),0,[S.wave?GOALS.waves(S.surv):GOALS[S.goal]],'Objectif du combat'):tip;if(save.tuto)go();else tuto(go);
}
// ---------- tutoriel (V3.0a) : 5 cartes au premier combat, rejouable depuis le camp ----------
const TUTO=['<b>Bienvenue !</b> Tu diriges 3 héros. Chacun joue à son tour : la frise en haut montre l’ordre.','Touche une case <b style="color:#6ab0ff">bleue à pastille</b> : tu vois le chemin, le coût en PM et le nombre d’ennemis visables 🎯. <b>Retouche-la</b> pour y aller.','Choisis un <b>sort</b> en bas (il coûte des PA), puis touche un ennemi (ou son portrait) pour voir l’effet, puis <b>retouche-le</b> pour lancer.','La <b>bulle rouge</b> au-dessus d’un monstre montre qui il va frapper. Repousse-les contre des obstacles pour des dégâts bonus, et frappe le même ennemi avec 2 héros pour un combo.','Quand tu as fini, touche <b>Fin du tour</b>. Gagne le combat pour de l’or, de l’XP et des objets. Bonne chance !'];
// messages guidés des Cavernes de cristal (niveaux 1 et 4)
const TIPS={amp:['<b>Cristal turquoise — Amplificateur</b><br>Un héros qui lance un sort depuis une case voisine (contour en tirets ▲) fait <b>+30 %</b> de dégâts et de soins. Les monstres s’en servent aussi : la bulle rouge l’indique.','Le cristal bloque le passage et les tirs. Repousser un monstre contre lui fait une collision.'],
 prism:['<b>Cristal violet — Prisme</b><br>Vise-le avec un sort de dégâts : ses <b>4 cases voisines</b> reçoivent 70 % des dégâts moyens, <b>tes héros compris</b>. Les cases rayées et les chiffres ◆ s’affichent avant de lancer.','Ensuite il s’éteint 2 tours (gris, ⏸). Utile pour toucher un ennemi caché derrière un obstacle.']};
export function tuto(done,i=0,L=TUTO,title){const T=$('tuto');T.classList.add('on');T.innerHTML=`<small>${title||(L===TUTO?'Tutoriel':'Nouveau')}${L.length>1?` ${i+1}/${L.length}`:''}</small><p>${L[i]}</p>`;
 const b=document.createElement('button');b.className='btn';b.textContent=i<L.length-1?'Suivant':'Compris !';b.onclick=()=>i<L.length-1?tuto(done,i+1,L,title):(T.classList.remove('on'),save.tuto=1,store(),done&&done());T.append(b);
 if(i<L.length-1){const s=document.createElement('button');s.className='btn dark';s.style.marginLeft='8px';s.textContent='Passer';s.onclick=()=>{T.classList.remove('on');save.tuto=1;store();done&&done()};T.append(s)}}
// ---------- export / import de la sauvegarde (V3.0a) ----------
function saveDlg(){const D=$('sv');D.innerHTML=`<b>Sauvegarde</b><p style="font-size:13px;color:#cbbd9c">Copie ce code pour garder ta partie (ou la passer sur un autre appareil). Pour restaurer, colle un code puis « Importer ».</p><textarea id="svt"></textarea><div id="svm" style="font-size:13px;min-height:18px"></div>`;
 const t=D.querySelector('textarea'),m=D.querySelector('#svm');t.value=btoa(unescape(encodeURIComponent(JSON.stringify(save))));
 const mk=(n,f)=>{const b=document.createElement('button');b.className='btn dark';b.textContent=n;b.onclick=f;D.append(b)};
 mk('Copier',()=>{t.select();try{navigator.clipboard.writeText(t.value);m.textContent='Copié !'}catch(e){document.execCommand('copy');m.textContent='Copié !'}});
 mk('Importer',()=>{try{const s=JSON.parse(decodeURIComponent(escape(atob(t.value.trim()))));if(!s||!Number.isFinite(s.lvl)||!Array.isArray(s.items))throw 0;localStorage.setItem('landeTactique1',JSON.stringify(s));location.reload()}catch(e){m.style.color='#ff8a7a';m.textContent='Code invalide : rien n’a été changé.'}});
 mk('Fermer',()=>D.close());D.showModal()}
// ---------- forge (V2.4b) ----------
const STAT={dmg:'dégâts',hp:'PV',heal:'soin'};
function forge(){$('camp').classList.remove('on');const F=$('forge');F.classList.add('on');F.innerHTML='';
 F.insertAdjacentHTML('beforeend',`<h1>La Forge</h1><div class="sub">Chaque niveau renforce le bonus de l’objet (+50 %). 3 niveaux au maximum.</div>`);
 const top=document.createElement('div');top.className='forgetop';top.append(icon('bld',0,110));const g=document.createElement('div');g.className='stat';g.append(icon('ui',14,22),` ${save.gold} or`);top.append(g);F.append(top);
 HER.forEach((h,i)=>{const own=save.items.filter(j=>ITEMS[j].who===i),all=ITEMS.filter(o=>o.who===i).length;
  F.insertAdjacentHTML('beforeend',`<h3 class="fh">${h.n} <small>${own.length}/${all} objets</small></h3>`);
  if(!own.length)F.insertAdjacentHTML('beforeend','<div class="sub">Aucun objet pour l’instant : gagne des combats pour en trouver.</div>');
  for(const j of own){const o=ITEMS[j],l=upLvl(save,j),c=upCost(save,j),k=Object.keys(STAT).find(k=>o[k]),r=document.createElement('div');r.className='loot frow';r.append(icon('items',o.ic,44));
   const rr=rarOf(save,j);r.insertAdjacentHTML('beforeend',`<div><b style="color:${RARE[rr].c}">${o.n}</b> <span class="pips"></span><br><small>${rr?RARE[rr].n+' · ':''}+${itemVal(o,k,l,rr)} ${STAT[k]}${c!=null?` → <b style="color:#7dff8a">+${itemVal(o,k,l+1,rr)}</b>`:' · maximum'}</small></div>`);
   r.querySelector('.pips').append(icon('badge',l?l-1:3,30)); // badge du niveau d'amélioration (cadenas = jamais amélioré)
   const b=document.createElement('button');b.className='btn'+(c!=null&&save.gold>=c?'':' dark');b.disabled=c==null||save.gold<c;b.innerHTML=c==null?'Max':`${c} <img src="${uiURL(14)}">`;
   b.onclick=()=>{F.querySelectorAll('.frow .btn').forEach(x=>x.disabled=true);if(!upgrade(save,j))return forge();store();
    sfx('smash',.6);setTimeout(()=>sfx('coin',.7),180);r.classList.add('forged');addPop(r,'+1');setTimeout(forge,650)};
   r.append(b);F.append(r)}});
 const back=document.createElement('button');back.className='btn dark';back.style.marginTop='14px';back.textContent='Retour au camp';back.onclick=()=>{F.classList.remove('on');camp()};F.append(back)}
// ---------- maître d'armes (V2.5a) ----------
let armH=-1;
function armes(){$('camp').classList.remove('on');const A=$('armes');if(!A.classList.contains('on'))armH=Math.max(0,HER.findIndex((_,i)=>!specOf(save,i)));A.classList.add('on');A.innerHTML='';
 A.insertAdjacentHTML('beforeend',`<h1>Le Maître d’armes</h1><div class="sub">${save.lvl<3?`Les spécialisations s’ouvrent au <b>niveau 3</b> (tu es niveau ${save.lvl}).`:'Une spécialisation par héros, changeable gratuitement ici.'} Ses talents s’ajoutent aux niveaux 3, 7 et 11.</div>`);
 const tabs=document.createElement('div');tabs.className='htabs';HER.forEach((h,i)=>{const b=document.createElement('button');b.className=i===armH?'on':'';b.append(icon(...heroFrame(h.k),40,.62),h.n);b.insertAdjacentHTML('beforeend',`<small>${specOf(save,i)?.n||(save.lvl<3?'—':'à choisir')}</small>`);b.onclick=()=>{armH=i;armes();A.scrollTop=0};tabs.append(b)});A.append(tabs);
 HER.forEach((h,i)=>{if(i!==armH)return;const cur=specOf(save,i),hd=document.createElement('h3');hd.className='fh';hd.append(icon(...heroFrame(h.k),34,.62),` ${h.n} `);hd.insertAdjacentHTML('beforeend',`<small>${cur?cur.n:'aucune spécialisation'}</small>`);A.append(hd);
  const row=document.createElement('div');row.className='specs';
  for(const x of SPECS[i]){const on=cur===x,c=document.createElement('div');c.className='spec'+(on?' on':'');c.append(icon(...x.ic,56));
   c.insertAdjacentHTML('beforeend',`<div><b>${x.n}</b> <small>${x.d}</small>`+x.t.map(([tn,td],k)=>{const lv=TIER[k],ok=save.lvl>=lv&&k<DONE;return`<p class="${ok?'':'off'}"><em>${save.lvl<lv?'🔒 niv '+lv:k>=DONE?'à venir':on?'✓ actif':'niv '+lv}</em> <b>${tn}</b> : ${td}</p>`}).join('')+'</div>');
   const b=document.createElement('button');b.className='btn'+(on?' dark':'');b.textContent=on?'Active':'Choisir';b.disabled=on||save.lvl<3;b.onclick=()=>{save.sp[i]=x.id;store();sfx('buff',.7);armes()};c.append(b);row.append(c)}
  A.append(row)});
 const back=document.createElement('button');back.className='btn dark';back.style.marginTop='14px';back.textContent='Retour au camp';back.onclick=()=>{A.classList.remove('on');camp()};A.append(back)}
// ---------- marchand (V2.6a) ----------
const effet=(o,r=0)=>{const k=o.dmg?'dmg':o.hp?'hp':'heal';return(r?RARE[r].n+' · ':'')+`+${itemVal(o,k,0,r)} ${STAT[k]}`};
function shop(tab){$('camp').classList.remove('on');const S=$('shop');S.classList.add('on');S.innerHTML='';const sellTab=tab==='v';
 S.insertAdjacentHTML('beforeend',`<h1>Le Marchand</h1><div class="sub">${sellTab?'Revente : la moitié du prix et de l’or mis dans la forge.':'Nouveaux objets chaque jour. Les potions se boivent en combat (4 PA, 1 par héros et par combat).'}</div>`);
 const top=document.createElement('div');top.className='forgetop';top.append(icon('bld',1,110));const g=document.createElement('div');g.className='stat';g.append(icon('ui',14,22),` ${save.gold} or`);top.append(g);S.append(top);
 const tabs=document.createElement('div');tabs.style.cssText='display:flex;gap:8px;margin:6px 0';
 for(const[k,n]of[['a','Acheter'],['v','Vendre']]){const b=document.createElement('button');b.className='btn'+((k==='v')===sellTab?'':' dark');b.textContent=n;b.onclick=()=>shop(k);tabs.append(b)}S.append(tabs);
 const row=(ic,html,label,ok,act)=>{const r=document.createElement('div');r.className='loot frow';r.append(icon(...ic,44));r.insertAdjacentHTML('beforeend',`<div>${html}</div>`);
  const b=document.createElement('button');b.className='btn'+(ok?'':' dark');b.disabled=!ok;b.innerHTML=label;b.onclick=()=>{if(!act())return shop(tab);store();sfx('coin',.8);addPop(r,'');setTimeout(()=>shop(tab),350)};r.append(b);S.append(r)};
 const price=n=>`${n} <img src="${uiURL(14)}">`;
 if(sellTab){if(!save.items.length)S.insertAdjacentHTML('beforeend','<div class="sub">Tu n’as aucun objet à vendre.</div>');
  for(const j of save.items){const o=ITEMS[j];row(['items',o.ic],`<b style="color:${RARE[rarOf(save,j)].c}">${o.n}</b><br><small>${HER[o.who].n} · ${effet(o,rarOf(save,j))}${upLvl(save,j)?` · forge ${upLvl(save,j)}`:''}</small>`,'+'+price(sellPrice(save,j)),true,()=>sell(save,j))}}
 else{const p=save.pot||0;row(['items',10],`<b>Potion de soin</b><br><small>Soigne 40 % des PV · tu en as ${p}/${POTION.max}</small>`,price(POTION.cost),p<POTION.max&&save.gold>=POTION.cost,()=>buyPot(save));
  const st=shopStock(save,today());if(!st.length)S.insertAdjacentHTML('beforeend','<div class="sub">Tu as déjà tous les objets !</div>');
  for(const j of st){const o=ITEMS[j];row(['items',o.ic],`<b>${o.n}</b><br><small>${HER[o.who].n} · ${effet(o)}</small>`,price(o.pr),save.gold>=o.pr,()=>buy(save,j))}}
 const back=document.createElement('button');back.className='btn dark';back.style.marginTop='14px';back.textContent='Retour au camp';back.onclick=()=>{S.classList.remove('on');camp()};S.append(back)}
// ---------- taverne (V2.6b) ----------
const ctTxt=t=>t.k==='win'?`Gagne ${t.n} combats`:t.k==='kill'?`Vaincs ${t.n} ${MON[t.m].n.toLowerCase()}${t.n>1?'s':''}`:t.k==='star'?`Gagne ${t.n>1?t.n+' combats':'un combat'} avec 3 ★`:'Bats un boss (même déjà vaincu)';
function tav(){$('camp').classList.remove('on');const T=$('tav');T.classList.add('on');T.innerHTML='';const d=today(),l=contracts(save,d);store();
 T.insertAdjacentHTML('beforeend',`<h1>La Taverne</h1><div class="sub">Trois contrats par jour, et un défi difficile une fois par jour.</div>`);
 const top=document.createElement('div');top.className='forgetop';top.append(icon('bld',3,110));const g=document.createElement('div');g.className='stat';g.append(icon('ui',14,22),` ${save.gold} or`);top.append(g);T.append(top);
 quests(T,tav);
 const back=document.createElement('button');back.className='btn dark';back.style.marginTop='14px';back.textContent='Retour au camp';back.onclick=()=>{T.classList.remove('on');camp()};T.append(back)}
// contrats du jour et défi (taverne et onglet Quêtes) ; `again` redessine l'écran après une récompense
function quests(T,again){const d=today(),l=contracts(save,d);store();
 T.insertAdjacentHTML('beforeend','<h3 class="fh">Contrats du jour</h3>');
 l.forEach((t,i)=>{const r=document.createElement('div');r.className='loot frow';r.append(icon(...(t.k==='kill'?[MON[t.m].s,0]:t.k==='boss'?['spells',6]:['items',17]),44));
  qban(r,t.k);r.insertAdjacentHTML('beforeend',`<div><b>${ctTxt(t)}</b><br><small>${t.p}/${t.n} · ${t.g} or, ${t.x} XP</small><div class="bar"><i style="width:${100*t.p/t.n}%"></i></div></div>`);
  const b=document.createElement('button');const ok=t.p>=t.n&&!t.c;b.className='btn'+(ok?'':' dark');b.disabled=!ok;b.textContent=t.c?'✓':'Réclamer';
  b.onclick=()=>{const up=claim(save,d,i);if(!up)return again();store();sfx('coin');if(up>1)setTimeout(()=>sfx('levelup'),250);addPop(r,'');setTimeout(again,400)};r.append(b);T.append(r)});
 const F=dailyFight(save,d),Z=ZONES[F.zi],done=save.dd===d;
 T.insertAdjacentHTML('beforeend','<h3 class="fh">Défi du jour</h3>');const dd=document.createElement('div');dd.className='loot frow';qban(dd,'daily');dd.insertAdjacentHTML('beforeend',`<div><b>${Z.n} · niveau ${F.lvl}</b><br><small>${done?'Réussi aujourd’hui. Reviens demain !':'Plus d’ennemis et plus forts. Récompense : double or, une potion et un objet garanti s’il en reste.'}</small></div>`);
 const b=document.createElement('button');b.className='btn'+(done?' dark':'');b.disabled=done;b.textContent=done?'✓':'Combattre';b.onclick=()=>{$('tav').classList.remove('on');startFight(F.zi,-1,F)};dd.append(b);T.append(dd)}
// bandeaux illustrés des contrats (Gemini, 26/11) : image à droite, texte sur le quart gauche assombri
function qban(r,k){r.classList.add('qrow');r.style.backgroundImage=`linear-gradient(90deg,#000d 0,#000b 42%,#0000 78%),url(assets/q/${k}.webp)`}
function addPop(el,t){const s=document.createElement('span');s.className='fpop';s.append(icon('ficon',14,26),t);el.append(s)}
const HOW=`Chaque héros a 6 <span class="pa">PA</span> (sorts) et 3 <span class="pm">PM</span> (cases).<br>• PA non dépensés : +1 au tour suivant par tranche de 2 (au plus +2).<br>• Cible trop loin : l’aperçu montre le héros avancer avant de lancer.<br>• Volée : la zone rouge montre les cases touchées ; la portée limite son centre.<br>• Les flèches de Fenn passent par-dessus les décors bas (buissons, cailloux, souches, caisses…), pas par-dessus les arbres, rochers et murs.<br>• Touche une case <b style="color:#6ab0ff">bleue</b> pour voir l’aperçu, retouche-la pour te déplacer.<br>• Choisis un sort, touche une cible pour voir les dégâts, retouche-la pour lancer. Les cases grises sont hors de vue (un obstacle ou un personnage bloque).<br>• « Fin du tour » passe au suivant.<br>• Écarte deux doigts pour agrandir le plateau, glisse pour le déplacer (molette à la souris). « Vue entière » revient en arrière.<br>• La bulle rouge au-dessus d'un monstre montre qui il frappera et combien.<br>• Fracas de Kael repousse de 2 cases : contre un obstacle ou un autre monstre, 5 dégâts par case bloquée.<br>• Combo : frappe le même ennemi avec 2 ou 3 héros avant qu'il joue (+15 % puis +30 %).<br>• ★ victoire, ★ aucun héros KO, ★ en 5 tours (boss : 7). Premier 3 ★ : +50 % d'or.<br>• Au camp, la forge améliore tes objets avec l'or gagné (3 niveaux).<br>• Sur la carte, chaque zone a 3 combats puis un boss qui ouvre la zone suivante. Les combats gagnés se rejouent pour gagner de l'XP.`;
const HOME={today,SP,SPI,HOW,forge:()=>forge(),shop:()=>shop(),armes:()=>armes(),tav:()=>tav(),quests,saveDlg,tuto:()=>tuto(),reload:()=>camp(),
 // partir à l'aventure : la carte, ouverte sur le chapitre en cours
 adventure:zi=>{worldMap();if(zi>=0)zoneSheet(zi)}};
export function camp(){
 G.phase='camp';document.body.classList.add('camp');music('main_theme');for(const i of ['map','result','forge','armes','shop','tav'])$(i).classList.remove('on');renderHome(HOME);
}
function worldMap(){
 G.phase='camp';document.body.classList.add('camp');music('camp');$('camp').classList.remove('on');const M=$('map');M.classList.add('on');
 const L=$('mapz');L.innerHTML='';
 const svg=`<svg class="road" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="${ZONES.map(z=>z.x+','+z.y).join(' ')}" /></svg>`;L.insertAdjacentHTML('beforeend',svg);
 ZONES.forEach((z,zi)=>{const b=document.createElement('button'),ok=unlocked(zi),p=prog(z.id||'');b.className='zone'+(ok?'':' lock')+(z.x<20?' edge':'');b.style.left=z.x+'%';b.style.top=z.y+'%';
  const B=z.boss?MON[z.boss.k]:null;if(B)b.appendChild(icon(z.boss.s||B.s,z.boss.s?0:B.row*3,46));else b.insertAdjacentHTML('beforeend','<span class="q">?</span>');
  b.insertAdjacentHTML('beforeend',`<b>${z.n}</b><small>${z.soon?'Bientôt':!ok?'🔒 Bats le boss précédent':p>=zlen(z)?'✓ Terminée':`${p}/${zlen(z)}`}${p?' · '+starsOf(z.id).reduce((a,b)=>a+b,0)+'/'+3*zlen(z)+' ★':''}</small>`);
  b.onclick=()=>{if(ok)zoneSheet(zi)};L.appendChild(b)});
 $('zsheet').classList.remove('on');$('mapinfo').innerHTML=`Niv ${save.lvl} · ${save.gold} or`;
 const cz=L.querySelectorAll('.zone:not(.lock)');cz[cz.length-1]?.scrollIntoView({block:'center'});
}
function zoneSheet(zi){const z=ZONES[zi],p=prog(z.id),S=$('zsheet'),L=zlen(z),lv=i=>fightSpec(zi,i,0).lvl;S.innerHTML=`<h3>${z.n}</h3><small>${L} étapes, la dernière est le boss · niveaux ${lv(0)}–${lv(L-1)}</small>`;
 for(let i=0;i<L;i++){const b=document.createElement('button'),done=i<p,next=i===p;b.className='btn'+(next?'':' dark');b.disabled=i>p;
  b.textContent=(i===L-1?`Étape ${L} · Boss ${z.boss.n}`:`Étape ${i+1}`)+` · niv ${lv(i)}`+({survive:' · ⏳ Survie',chief:' · ♛ Chef'}[fightSpec(zi,i,0).goal]||'')+(done?' '+'★'.repeat(starsOf(z.id)[i]||0)+'☆'.repeat(3-(starsOf(z.id)[i]||0)):'');b.onclick=()=>startFight(zi,i);S.appendChild(b)}
 const c=document.createElement('button');c.className='btn dark';c.textContent='Fermer';c.onclick=()=>S.classList.remove('on');S.appendChild(c);S.classList.add('on')}
const starsOf=id=>(save.st||(save.st={}))[id]||(save.st[id]=[]);
function result(win,fled){const F=G.F;$('tuto').classList.remove('on');$('goal').classList.remove('on');
 const Rs=$('result');Rs.innerHTML='';if(G.s.pot!=null){save.pot=G.s.pot;store()}G.cur=null;document.body.classList.add('camp');duck(4500);sfx(win?'victory':'defeat');
 if(win){const left=G.s.units.some(u=>u.team==='m'&&!u.dead),fled=G.s.units.some(u=>u.fled),goalWon=(left||fled)&&G.s.goal?`<div class="goalwon">🎯 Objectif atteint : ${G.s.goal==='survive'?`tu as tenu ${G.s.surv||SURVIVE} tours${fled?', les survivants se replient':''}`:'le chef est abattu'}</div>`:G.s.cleared?'<div class="goalwon">🎯 Toutes les vagues éliminées : +25 % d’or</div>':'';
  const zid=ZONES[F.zi].id,first=!F.daily&&prog(zid)===F.i,sl=starList(G.s,!!F.boss),st=stars(G.s,!!F.boss),best=starsOf(zid),new3=!F.daily&&st===3&&(best[F.i]||0)<3;
  const gold=Math.round(((6*F.lvl+ri(Math.random,0,8))*(F.daily?2:first?1:.5)+(F.boss&&first?40:0))*(new3?1.5:1)*(G.s.cleared?1.25:1)),xp=G.s.killedXp;save.gold+=gold;const up=gainXp(save,xp);
  const free=ITEMS.map((_,i)=>i).filter(i=>!save.items.includes(i));let it=null;if(free.length&&Math.random()<(F.daily||F.boss&&first?1:first?.5:.15)){it=pick(Math.random,free);save.items.push(it);const r=rollRare(Math.random,F.daily||F.boss);if(r)(save.rr||(save.rr={}))[it]=r}
  if(!F.daily)best[F.i]=Math.max(best[F.i]||0,st);if(first)save.z[zid]=F.i+1;
  const kills={};for(const u of G.s.units)if(u.team==='m'&&u.dead)kills[u.k]=(kills[u.k]||0)+1;
  const ctDone=ctUpdate(save,today(),{win:1,st,boss:!!F.boss,kills});let pot=0;if(F.daily){save.dd=today();if((save.pot||0)<POTION.max){save.pot=(save.pot||0)+1;pot=1}}store();
  Rs.innerHTML=`<h1>Victoire !</h1>${goalWon}<div class="stars">${[0,1,2].map(i=>`<span class="${i<st?'on':''}" style="animation-delay:${.3+i*.25}s">★</span>`).join('')}</div>
   <div class="sub">${['Victoire','Aucun héros KO',STAR3_TXT[star3(G.s,!!F.boss)[0]]].map((t,i)=>(sl[i]?'✓ ':'✗ ')+t).join(' · ')}<br>${ZONES[F.zi].n} · ${F.daily?'défi du jour réussi !':F.boss?F.boss.n+' vaincu !':`étape ${F.i+1}/${zlen(ZONES[F.zi])} gagnée`}${F.boss&&first&&ZONES[F.zi+1]?'<br><b style="color:#ffd65a">Nouvelle zone : '+ZONES[F.zi+1].n+(ZONES[F.zi+1].soon?' (bientôt)':'')+'</b>':''}</div>`;
  [.3,.55,.8].slice(0,st).forEach(d=>setTimeout(()=>sfx('coin',.5,1.3),d*1000+200));
  const loot=[[icon('spells',6,48),`<b>+${xp} XP</b>${up?`<br><span style="color:#ffd65a">Niveau ${save.lvl} ! PV et dégâts en hausse.</span>`:''}`],[icon('items',15,48),`<b>+${gold} or</b>${new3?' <span style="color:#ffd65a">(+50 %, premier 3 ★)</span>':''}`]];
  if(it!==null)loot.push([icon('items',ITEMS[it].ic,48),`<b style="color:${RARE[rarOf(save,it)].c}">${ITEMS[it].n}</b><br>${HER[ITEMS[it].who].n} : ${effet(ITEMS[it],rarOf(save,it))}`]);
  if(pot)loot.push([icon('items',10,48),'<b>+1 potion de soin</b>']);
  for(const t of ctDone)loot.push([icon('bld',3,48),`<b>Contrat terminé</b><br>${ctTxt(t)} : récompense à la taverne`]);
  // coffre : tremble, s'ouvre au toucher (ou seul après 3 s), puis le butin sort ligne par ligne
  const ch=document.createElement('div');ch.className='chest';ch.innerHTML='<u></u><img src="assets/chest_closed.png" alt=""><img class="o" src="assets/chest_open.png" alt=""><small>Touche le coffre</small>';Rs.appendChild(ch);
  const box=document.createElement('div');box.className='lootbox';Rs.appendChild(box);
  const open=()=>{if(ch.classList.contains('open'))return;ch.classList.add('open');sfx('chest_open');if(it!==null&&rarOf(save,it))setTimeout(()=>sfx('loot_rare',.9),300+2*380);
   loot.forEach(([ic,html],i)=>setTimeout(()=>{const d=document.createElement('div');d.className='loot pop';d.append(ic);d.insertAdjacentHTML('beforeend',`<div>${html}</div>`);box.appendChild(d);sfx(i===2?'levelup':'coin',.6)},300+i*380));
   if(up)setTimeout(()=>sfx('levelup'),400+loot.length*380)};
  ch.onclick=open;setTimeout(open,3000);
 }else Rs.innerHTML=`<h1>${fled?'Retraite':'Défaite'}</h1><div class="sub">Tes héros se replient. Soigne-toi et réessaie, ou rejoue un combat déjà gagné pour monter de niveau.</div>`;
 // actions : les récompenses sont déjà enregistrées, quel que soit le bouton choisi
 const acts=document.createElement('div');acts.className='ractions';let gone=false;
 const act2=(t,f,dark)=>{const b=document.createElement('button');b.className='btn'+(dark?' dark':'');b.textContent=t;b.onclick=()=>{if(gone)return;gone=true;f()};acts.append(b)};
 const nx=win&&!F.daily&&F.i+1<zlen(ZONES[F.zi])?F.i+1:null;
 if(nx!==null)act2(nx===zlen(ZONES[F.zi])-1?'Affronter le boss':'Combat suivant',()=>{Rs.classList.remove('on');startFight(F.zi,nx)});
 if(win&&contracts(save,today()).some(t=>t.p>=t.n&&!t.c))act2('Taverne : récompense à réclamer',()=>{camp();tav()},true);
 act2('Retour à la carte',()=>{Rs.classList.remove('on');worldMap()},nx!==null);Rs.appendChild(acts);
 Rs.classList.add('on');
}

// ---------- branchements ----------
Object.assign(hooks,{render,renderTL,newRound,result});
const ACT={'son-m':()=>setSon('m'),'son-s':()=>setSon('s'),camp};
document.addEventListener('click',e=>{const a=e.target.closest('[data-act]');if(a)ACT[a.dataset.act]?.()});
document.addEventListener('click',e=>{if(e.target.closest('button'))sfx('click',.6)},true);
// redimensionnement et rotation : iOS met parfois à jour les dimensions après l'événement, on recalcule une 2e fois
let rzT=0;const relayout=()=>{const f=()=>{if(G.phase!=='camp')layout()};f();clearTimeout(rzT);rzT=setTimeout(f,350)};
addEventListener('resize',relayout);addEventListener('orientationchange',relayout);
