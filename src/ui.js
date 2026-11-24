// Interface : panneau de combat, frise des tours, écrans (camp, carte, résultat), saisie tactile.
import {G,hooks} from './game.js';
import {$} from './util.js';
import {SP,HER,MON,ZONES,ITEMS} from './data.js';
import {K,pick,ri,occ,reach,selCells,newBattle,genMap,mkUnits,heroStats,gainXp,xpNeed} from './rules.js';
import {save,prog,unlocked,store,resetSave} from './save.js';
import {AT,cv,icon,uiURL,logoURL,drawF,layout,tapCell,addRefs,resetFx} from './render.js';
import {cast,moveTo,end,runFight} from './turns.js';
import {sfx,music,duck,setSon,sonBtns} from './audio.js';

// ---------- panneau de combat ----------
function renderTL(){const tl=$('tl'),S=G.s;tl.innerHTML='';const n=S.order.length;for(let i=0;i<n;i++){const u=S.order[((G.turn+i)%n+n)%n];if(u.dead)continue;
 const[s,idx]=u.team==='h'?[u.k,1]:[u.s,u.row*3];const c=icon(s,idx,34,u.team==='h'?.62:0);c.className=u.team+(u===G.cur?' cur':'');tl.appendChild(c)}}
function render(){
 const u=G.cur,{sel,F}=G;
 $('title').textContent=F?`${ZONES[F.zi].n} · ${F.boss?'Boss':F.i+1+'/3'}`:'';
 if(!u){return}
 const me=u.team==='h'&&G.phase==='fight';
 $('who').innerHTML='';const ic=icon(u.team==='h'?u.k:u.s,u.team==='h'?1:u.row*3,30,u.team==='h'?.62:0);$('who').append(ic,`${u.n}`);
 const hb=document.createElement('div');hb.id='hpb';hb.innerHTML=`<i style="width:${100*u.hp/u.max}%"></i>`;const ht=document.createElement('span');ht.id='hpt';ht.textContent=`${u.hp}/${u.max} PV`;$('who').append(hb,ht);
 $('pts').innerHTML=`<span class="pa"><img src="${uiURL(12)}"> ${u.pa} PA</span><span class="pm"><img src="${uiURL(13)}"> ${u.pm} PM</span>`+(me?'':`<span style="color:#e08a7a">Tour ennemi…</span>`);
 const S=$('spells');S.innerHTML='';
 if(u.team==='h')for(const id of u.sp){const sp=SP[id],b=document.createElement('button');b.className='sp'+(sel&&sel.sp===sp?' sel':'');
  b.style.backgroundImage=`url(${uiURL(sel&&sel.sp===sp?4:3)})`;b.appendChild(icon('spells',sp.ic,58));b.insertAdjacentHTML('beforeend',`<b>${sp.pa}</b>`+(u.cd[sp.n]?`<em>${u.cd[sp.n]}</em>`:''));
  b.disabled=!me||G.busy||u.pa<sp.pa||u.cd[sp.n]>0;b.onclick=()=>{if(G.sel&&G.sel.sp===sp)G.sel=null;else G.sel={sp,cells:selCells(G.s,u,sp)};render()};S.appendChild(b)}
 $('end').disabled=!me||G.busy;
 $('hint').textContent=!me?`${u.n} joue.`:sel?`${sel.sp.n} — ${sel.sp.d}. ${sel.sp.dmg?sel.sp.dmg.join('–')+' dégâts · ':''}${sel.sp.heal?sel.sp.heal.join('–')+' soins · ':''}portée ${sel.sp.r.join('–')}. Touche une case orange.`:`Touche une case bleue pour bouger, ou choisis un sort.`;
}
const info=o=>`${o.n} · ${o.hp}/${o.max} PV · ${o.maxPM} PM`+(o.atk?` · frappe ${o.atk.dmg.join('–')}`:'');
function autoEnd(){const u=G.cur,S=G.s;if(!u||u.team!=='h'||!G.endTurnResolve||u.pm>0)return;
 if(u.sp.some(id=>{const sp=SP[id];return u.pa>=sp.pa&&!(u.cd[sp.n]>0)&&selCells(S,u,sp).some(c=>c.ok)}))return;
 $('hint').textContent='Plus rien à faire : tour suivant…';setTimeout(()=>{if(G.cur===u&&G.endTurnResolve&&!G.busy){G.sel=null;G.reachC=null;G.endTurnResolve()}},700)}

// ---------- saisie ----------
cv.addEventListener('pointerdown',async e=>{
 if(G.phase!=='fight'||G.busy)return;const c=tapCell(e.clientX,e.clientY),u=G.cur,o=occ(G.s,c.x,c.y);
 if(!u||u.team!=='h'){if(o)$('hint').textContent=info(o);return}
 if(G.sel){const hit=G.sel.cells.find(s=>s.x===c.x&&s.y===c.y&&s.ok);if(hit){const sp=G.sel.sp;G.sel=null;await cast(u,sp,c);if(end())return;G.reachC=reach(G.s,u,u.pm);render();autoEnd()}else{G.sel=null;render();if(o)$('hint').textContent=info(o)}return}
 const k=K(c.x,c.y);if(G.reachC&&G.reachC.dist.get(k)>0){await moveTo(u,k,G.reachC.prev);G.reachC=reach(G.s,u,u.pm);render();autoEnd();return}
 if(o)$('hint').textContent=info(o)});
$('end').onclick=()=>{if(G.endTurnResolve&&!G.busy){G.sel=null;G.reachC=null;G.endTurnResolve()}};
let fleeArm=0;$('flee').onclick=()=>{if(G.phase!=='fight')return;if(Date.now()-fleeArm<2500){G.phase='lose';if(G.endTurnResolve)G.endTurnResolve();result(false,true)}else{fleeArm=Date.now();$('flee').textContent='Sûr ?';setTimeout(()=>$('flee').textContent='Fuir',2500)}};

// ---------- écrans ----------
export function startFight(zi,i){
 const Z=ZONES[zi];G.F={zi,i,lvl:Z.lvl+i,pool:Z.pool,boss:i===3?Z.boss:null,seed:zi*1000+i*97+save.gold,th:Z.th[i%Z.th.length]};
 document.body.classList.remove('camp');$('camp').classList.remove('on');$('result').classList.remove('on');$('map').classList.remove('on');
 resetFx();const S=G.s=newBattle();const{hs,es}=genMap(S,G.F.seed,G.F.th);mkUnits(S,G.F,hs,es,HER.map((_,j)=>heroStats(save,j)));addRefs(S.units);S.rng=Math.random;
 G.turn=-1;G.cur=null;G.sel=null;G.phase='fight';
 layout();renderTL();render();const zid=ZONES[zi].id;music(G.F.boss?'boss':i===2?'elite_battle':zid==='prairie'||zid==='bois'?'forest':'battle');setTimeout(()=>sfx('enemy_warning',.7),400);runFight();
}
function party(){const d=document.createElement('div');d.className='party';HER.forEach((h,i)=>{const s=heroStats(save,i),c=document.createElement('div');c.className='hc';
 const cv2=document.createElement('canvas');cv2.width=240;cv2.height=192;const g=cv2.getContext('2d'),f=AT[h.k][1],k=176/f[3];drawF(g,h.k,1,120,184,k);c.appendChild(cv2);
 c.insertAdjacentHTML('beforeend',`<b>${h.n}</b><small>${h.cls} · ${s.hp} PV${s.dmg?` · +${s.dmg} dég.`:''}${s.heal?` · +${s.heal} soin`:''}</small>`);
 const inv=document.createElement('div');inv.className='inv';save.items.filter(j=>ITEMS[j].who===i).forEach(j=>inv.appendChild(icon('items',ITEMS[j].ic,22)));c.appendChild(inv);d.appendChild(c)});return d}
export function camp(){
 G.phase='camp';document.body.classList.add('camp');music('main_theme');const C=$('camp');C.innerHTML=`<img src="${logoURL()}" alt="Tactika" style="width:min(78vw,340px);margin:4px 0 2px"><div class="sub">Version 2.1 · combats tactiques au tour par tour</div>`;
 C.appendChild(party());
 C.insertAdjacentHTML('beforeend',`<div style="font-weight:700">Niveau ${save.lvl} · ${save.xp}/${xpNeed(save.lvl)} XP</div><div class="bar"><i style="width:${100*save.xp/xpNeed(save.lvl)}%"></i></div>`);
 const st=document.createElement('div');st.className='stat';st.append(icon('ui',14,22),` ${save.gold} or`,` · ${save.items.length}/${ITEMS.length} objets`);C.appendChild(st);
 const b=document.createElement('button');b.className='btn';b.style.cssText='font-size:18px;padding:14px 34px';b.textContent='Carte du monde';b.onclick=worldMap;C.appendChild(b);
 C.insertAdjacentHTML('beforeend',`<div class="how"><b>Comment jouer</b><br>Chaque héros a 6 <span class="pa">PA</span> (sorts) et 3 <span class="pm">PM</span> (cases).<br>• Touche une case <b style="color:#6ab0ff">bleue</b> pour te déplacer.<br>• Choisis un sort, puis une case <b style="color:#ffa040">orange</b>. Les cases grises sont hors de vue (un obstacle ou un personnage bloque).<br>• « Fin du tour » passe au suivant.<br>• Sur la carte, chaque zone a 3 combats puis un boss qui ouvre la zone suivante. Les combats gagnés se rejouent pour gagner de l'XP.</div>`);
 const r=document.createElement('button');r.className='btn dark';r.style.cssText='font-size:12px;padding:7px 12px';r.textContent='Recommencer à zéro';
 r.onclick=()=>{if(r.dataset.arm){resetSave();camp()}else{r.dataset.arm=1;r.textContent='Touche encore pour effacer'}};C.appendChild(r);
 C.insertAdjacentHTML('beforeend',`<div style="display:flex;gap:8px;margin-top:12px"><button class="btn dark son-m" data-act="son-m">♪ Musique</button><button class="btn dark son-s" data-act="son-s">🔊 Sons</button></div><div class="sig">maxlolfr · GitHub</div>`);C.classList.add('on');sonBtns();
}
function worldMap(){
 G.phase='camp';document.body.classList.add('camp');music('camp');$('camp').classList.remove('on');const M=$('map');M.classList.add('on');
 const L=$('mapz');L.innerHTML='';
 const svg=`<svg class="road" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="${ZONES.map(z=>z.x+','+z.y).join(' ')}" /></svg>`;L.insertAdjacentHTML('beforeend',svg);
 ZONES.forEach((z,zi)=>{const b=document.createElement('button'),ok=unlocked(zi),p=prog(z.id||'');b.className='zone'+(ok?'':' lock');b.style.left=z.x+'%';b.style.top=z.y+'%';
  const B=z.boss?MON[z.boss.k]:null;if(B)b.appendChild(icon(B.s,B.row*3,46));else b.insertAdjacentHTML('beforeend','<span class="q">?</span>');
  b.insertAdjacentHTML('beforeend',`<b>${z.n}</b><small>${z.soon?'Bientôt':!ok?'🔒 Bats le boss précédent':p>=4?'✓ Terminée':`${p}/4`}</small>`);
  b.onclick=()=>{if(ok)zoneSheet(zi)};L.appendChild(b)});
 $('zsheet').classList.remove('on');$('mapinfo').innerHTML=`Niv ${save.lvl} · ${save.gold} or`;
}
function zoneSheet(zi){const z=ZONES[zi],p=prog(z.id),S=$('zsheet');S.innerHTML=`<h3>${z.n}</h3><small>Niveaux ${z.lvl}–${z.lvl+3}</small>`;
 for(let i=0;i<4;i++){const b=document.createElement('button'),done=i<p,next=i===p;b.className='btn'+(next?'':' dark');b.disabled=i>p;
  b.textContent=(i===3?`Boss · ${z.boss.n}`:`Combat ${i+1}`)+` · niv ${z.lvl+i}`+(done?' ✓':'');b.onclick=()=>startFight(zi,i);S.appendChild(b)}
 const c=document.createElement('button');c.className='btn dark';c.textContent='Fermer';c.onclick=()=>S.classList.remove('on');S.appendChild(c);S.classList.add('on')}
function result(win,fled){const F=G.F;
 const Rs=$('result');Rs.innerHTML='';G.cur=null;document.body.classList.add('camp');duck(4500);sfx(win?'victory':'defeat');
 if(win){const first=prog(ZONES[F.zi].id)===F.i,gold=Math.round((6*F.lvl+ri(Math.random,0,8))*(first?1:.5))+(F.boss&&first?40:0),xp=G.s.killedXp;save.gold+=gold;const up=gainXp(save,xp);
  const free=ITEMS.map((_,i)=>i).filter(i=>!save.items.includes(i));let it=null;if(free.length&&Math.random()<(F.boss&&first?1:first?.5:.15)){it=pick(Math.random,free);save.items.push(it)}
  if(first)save.z[ZONES[F.zi].id]=F.i+1;store();setTimeout(()=>sfx('coin'),900);if(up)setTimeout(()=>sfx('levelup'),1500);
  Rs.innerHTML=`<h1>Victoire !</h1><div class="sub">${ZONES[F.zi].n} · ${F.boss?F.boss.n+' vaincu !':'combat '+(F.i+1)+' gagné'}${F.boss&&first&&ZONES[F.zi+1]?'<br><b style="color:#ffd65a">Nouvelle zone : '+ZONES[F.zi+1].n+(ZONES[F.zi+1].soon?' (bientôt)':'')+'</b>':''}</div>`;
  const L=(ic,html)=>{const d=document.createElement('div');d.className='loot';d.append(ic);d.insertAdjacentHTML('beforeend',`<div>${html}</div>`);Rs.appendChild(d)};
  L(icon('spells',6,48),`<b>+${xp} XP</b>${up?`<br><span style="color:#ffd65a">Niveau ${save.lvl} ! PV et dégâts en hausse.</span>`:''}`);
  L(icon('items',15,48),`<b>+${gold} or</b>`);
  if(it!==null)L(icon('items',ITEMS[it].ic,48),`<b>${ITEMS[it].n}</b><br>${HER[ITEMS[it].who].n} : ${ITEMS[it].dmg?`+${ITEMS[it].dmg} dégâts`:ITEMS[it].hp?`+${ITEMS[it].hp} PV`:`+${ITEMS[it].heal} soin`}`);
 }else Rs.innerHTML=`<h1>${fled?'Retraite':'Défaite'}</h1><div class="sub">Tes héros se replient. Soigne-toi et réessaie, ou rejoue un combat déjà gagné pour monter de niveau.</div>`;
 const b=document.createElement('button');b.className='btn';b.style.marginTop='16px';b.textContent='Retour à la carte';b.onclick=()=>{Rs.classList.remove('on');worldMap()};Rs.appendChild(b);
 Rs.classList.add('on');
}

// ---------- branchements ----------
Object.assign(hooks,{render,renderTL,result});
const ACT={'son-m':()=>setSon('m'),'son-s':()=>setSon('s'),camp};
document.addEventListener('click',e=>{const a=e.target.closest('[data-act]');if(a)ACT[a.dataset.act]?.()});
document.addEventListener('click',e=>{if(e.target.closest('button'))sfx('click',.6)},true);
addEventListener('resize',()=>{if(G.phase!=='camp')layout()});
