// Interface : panneau de combat, frise des tours, écrans (camp, carte, résultat), saisie tactile.
import {G,hooks} from './game.js';
import {$} from './util.js';
import {SP,HER,MON,ZONES,ITEMS} from './data.js';
import {K,pick,ri,occ,reach,selCells,newBattle,genMap,mkUnits,heroStats,gainXp,xpNeed,intent,stars,starList,upgrade,upCost,upLvl,itemVal} from './rules.js';
import {save,prog,unlocked,store,resetSave} from './save.js';
import {AT,cv,icon,uiURL,logoURL,drawF,layout,tapCell,addRefs,resetFx,heroFrame} from './render.js';
import {cast,moveTo,end,runFight} from './turns.js';
import {sfx,music,duck,setSon,sonBtns} from './audio.js';
import {SPECS,TIER,DONE,specOf} from './talents.js';

// ---------- panneau de combat ----------
function renderTL(){const tl=$('tl'),S=G.s;tl.innerHTML='';const n=S.order.length;for(let i=0;i<n;i++){const u=S.order[((G.turn+i)%n+n)%n];if(u.dead)continue;
 const[s,idx]=u.team==='h'?heroFrame(u.k):[u.s,u.row*3];const c=icon(s,idx,34,u.team==='h'?.62:0);c.className=u.team+(u===G.cur?' cur':'')+(G.sel&&G.sel.cells.some(s=>s.ok&&s.x===u.x&&s.y===u.y)?' tg':'');c.onclick=()=>{if(G.phase==='fight'&&!G.busy)act({x:u.x,y:u.y})};tl.appendChild(c)}}
const SPI={slash:['sico',0],smash:['sico',9],guard:['sico',1],shot:['sico',8],volley:['ico',11],boots:['sico',10],heal:['sico',4],venom:['sico',5],aura:['sico',6]};
function render(){renderTL();
 const u=G.cur,{sel,F}=G;
 $('title').textContent=F?`${ZONES[F.zi].n} · ${F.boss?'Boss':F.i+1+'/3'} · tour ${G.s.round}`:'';
 if(!u){return}
 const me=u.team==='h'&&G.phase==='fight';
 G.intents=me&&!G.busy?G.s.units.filter(m=>m.team==='m'&&!m.dead).map(m=>({m,...intent(G.s,m)})).filter(i=>i.target):null;
 $('who').innerHTML='';const ic=icon(...(u.team==='h'?heroFrame(u.k):[u.s,u.row*3]),30,u.team==='h'?.62:0);$('who').append(ic,`${u.n}`);
 const hb=document.createElement('div');hb.id='hpb';hb.innerHTML=`<i style="width:${100*u.hp/u.max}%"></i>`;const ht=document.createElement('span');ht.id='hpt';ht.textContent=`${u.hp}/${u.max} PV`;$('who').append(hb,ht);
 $('pts').innerHTML=`<span class="pa"><img src="${uiURL(12)}"> ${u.pa} PA</span><span class="pm"><img src="${uiURL(13)}"> ${u.pm} PM</span>`+(me?'':`<span style="color:#e08a7a">Tour ennemi…</span>`);
 const tg=document.createElement('div');tg.id='tgt';
 if(me&&sel&&!G.busy)(sel.sp.t==='self'?[u]:G.s.units.filter(o=>!o.dead&&o.team===(sel.sp.t==='ally'?'h':'m'))).map(o=>[o,sel.cells.some(s=>s.ok&&s.x===o.x&&s.y===o.y)]).sort((a,b)=>b[1]-a[1]).forEach(([o,ok])=>{const w=document.createElement('button');w.className='tb'+(ok?' ok':'');w.append(icon(...(o.team==='h'?heroFrame(o.k):[o.s,o.row*3]),40,o.team==='h'?.62:0));w.insertAdjacentHTML('beforeend',`<i style="width:${100*o.hp/o.max}%"></i>`);w.onclick=()=>{if(ok)act({x:o.x,y:o.y})};tg.appendChild(w)});
 $('pts').append(tg);
 const S=$('spells');S.innerHTML='';
 if(u.team==='h')for(const id of u.sp){const sp=u.S[id],b=document.createElement('button');b.className='sp'+(sel&&sel.sp===sp?' sel':'');
  b.style.backgroundImage=`url(${uiURL(sel&&sel.sp===sp?4:3)})`;b.appendChild(icon(...SPI[id],58));b.insertAdjacentHTML('beforeend',`<b>${sp.pa}</b>`+(u.cd[sp.n]?`<em>${u.cd[sp.n]}</em>`:''));
  b.disabled=!me||G.busy||u.pa<sp.pa||u.cd[sp.n]>0;b.onclick=()=>{if(G.sel&&G.sel.sp===sp)G.sel=null;else G.sel={sp,cells:selCells(G.s,u,sp)};render()};S.appendChild(b)}
 $('end').disabled=!me||G.busy;
 $('hint').textContent=!me?`${u.n} joue.`:sel?`${sel.sp.n} — ${sel.sp.d}. ${sel.sp.dmg?sel.sp.dmg.join('–')+' dégâts · ':''}${sel.sp.heal?sel.sp.heal.join('–')+' soins · ':''}portée ${sel.sp.r.join('–')}. Touche une case orange ou un portrait à droite.`:`Touche une case bleue pour bouger, ou choisis un sort.`;
}
const info=o=>{const it=G.intents&&G.intents.find(i=>i.m===o);return`${o.n} · ${o.hp}/${o.max} PV · ${o.maxPM} PM`+(o.atk?` · frappe ${o.atk.dmg.join('–')}`:'')+(it?` · vise ${it.target.n}`:'')};
function autoEnd(){const u=G.cur,S=G.s;if(!u||u.team!=='h'||!G.endTurnResolve||u.pm>0)return;
 if(u.sp.some(id=>{const sp=u.S[id];return u.pa>=sp.pa&&!(u.cd[sp.n]>0)&&selCells(S,u,sp).some(c=>c.ok)}))return;
 $('hint').textContent='Plus rien à faire : tour suivant…';setTimeout(()=>{if(G.cur===u&&G.endTurnResolve&&!G.busy){G.sel=null;G.reachC=null;G.endTurnResolve()}},700)}

// ---------- saisie ----------
cv.addEventListener('pointerdown',e=>{if(G.phase==='fight'&&!G.busy)act(tapCell(e.clientX,e.clientY))});
// action sur une case (toucher du plateau, ou portrait de la frise des tours pour viser une unité cachée)
async function act(c){const u=G.cur,o=occ(G.s,c.x,c.y);
 if(!u||u.team!=='h'){if(o)$('hint').textContent=info(o);return}
 if(G.sel){const hit=G.sel.cells.find(s=>s.x===c.x&&s.y===c.y&&s.ok);if(hit){const sp=G.sel.sp;G.sel=null;await cast(u,sp,c);if(end())return;G.reachC=reach(G.s,u,u.pm);render();autoEnd()}else $('hint').textContent=(o?info(o)+' · ':'')+'Hors de portée. Touche une cible entourée, ou retouche le sort pour l’annuler.';return}
 const k=K(c.x,c.y);if(G.reachC&&G.reachC.dist.get(k)>0){await moveTo(u,k,G.reachC.prev);G.reachC=reach(G.s,u,u.pm);render();autoEnd();return}
 if(o)$('hint').textContent=info(o)}
$('end').onclick=()=>{if(G.endTurnResolve&&!G.busy){G.sel=null;G.reachC=null;G.endTurnResolve()}};
let fleeArm=0;$('flee').onclick=()=>{if(G.phase!=='fight')return;if(Date.now()-fleeArm<2500){G.phase='lose';G.fid++;if(G.endTurnResolve)G.endTurnResolve();result(false,true)}else{fleeArm=Date.now();$('flee').textContent='Sûr ?';setTimeout(()=>$('flee').textContent='Fuir',2500)}};

// ---------- écrans ----------
export function startFight(zi,i){
 const Z=ZONES[zi];G.F={zi,i,lvl:Z.lvl+i,pool:Z.pool,boss:i===3?Z.boss:null,seed:zi*1000+i*97+save.gold,th:Z.th[i%Z.th.length]};
 document.body.classList.remove('camp');$('camp').classList.remove('on');$('result').classList.remove('on');$('map').classList.remove('on');
 resetFx();const S=G.s=newBattle();const{hs,es}=genMap(S,G.F.seed,G.F.th);mkUnits(S,G.F,hs,es,HER.map((_,j)=>heroStats(save,j)));addRefs(S.units);S.rng=Math.random;
 G.turn=-1;G.cur=null;G.sel=null;G.phase='fight';G.fid++;
 layout();renderTL();render();const zid=ZONES[zi].id;music(G.F.boss?'boss':i===2?'elite_battle':zid==='prairie'||zid==='bois'?'forest':'battle');setTimeout(()=>sfx('enemy_warning',.7),400);runFight();
}
function party(){const d=document.createElement('div');d.className='party';HER.forEach((h,i)=>{const s=heroStats(save,i),c=document.createElement('div');c.className='hc';
 const cv2=document.createElement('canvas');cv2.width=240;cv2.height=192;const g=cv2.getContext('2d'),[hs,hi]=heroFrame(h.k),f=AT[hs][hi],k=176/f[3];drawF(g,hs,hi,120,184,k);c.appendChild(cv2);
 c.insertAdjacentHTML('beforeend',`<b>${h.n}</b><small>${h.cls} · ${s.hp} PV${s.dmg?` · +${s.dmg} dég.`:''}${s.heal?` · +${s.heal} soin`:''}</small>`);
 const inv=document.createElement('div');inv.className='inv';save.items.filter(j=>ITEMS[j].who===i).forEach(j=>inv.appendChild(icon('items',ITEMS[j].ic,22)));c.appendChild(inv);d.appendChild(c)});return d}
// bâtiments du camp (planche bld : 0 forge, 1 marchand, 2 maître d'armes, 3 taverne) ; fonctions en V2.4b et après
const BLD=[['La Forge','Améliore les équipements de tes héros.'],['Le Marchand','Achat et vente d’équipements. Bientôt.'],['Le Maître d’armes','Spécialisations des héros.'],['La Taverne','Contrats et défis du jour. Bientôt.']];
function town(){const d=document.createElement('div');d.className='town';const note=document.createElement('div');note.className='bnote';
 BLD.forEach(([n,t],i)=>{const b=document.createElement('button');const live=i===0||i===2,news=i===2&&save.lvl>=3&&save.sp.includes(null);b.className='bld'+(live?' next':'');b.append(icon('bld',i,120));b.insertAdjacentHTML('beforeend',`<b>${n}</b><small>${i===0?'Améliorer':i===2?(news?'<span style="color:#7dff8a">Nouveau !</span>':'Spécialisations'):'Bientôt'}</small>`);
  b.onclick=i===0?forge:i===2?armes:null;if(!live)b.onclick=()=>{d.querySelectorAll('.bld').forEach(x=>x.classList.toggle('on',x===b));note.innerHTML=`<b>${n}</b> — ${t}`};d.appendChild(b)});
 d.appendChild(note);return d}
// ---------- forge (V2.4b) ----------
const STAT={dmg:'dégâts',hp:'PV',heal:'soin'};
function forge(){$('camp').classList.remove('on');const F=$('forge');F.classList.add('on');F.innerHTML='';
 F.insertAdjacentHTML('beforeend',`<h1>La Forge</h1><div class="sub">Chaque niveau renforce le bonus de l’objet (+50 %). 3 niveaux au maximum.</div>`);
 const top=document.createElement('div');top.className='forgetop';top.append(icon('bld',0,110));const g=document.createElement('div');g.className='stat';g.append(icon('ui',14,22),` ${save.gold} or`);top.append(g);F.append(top);
 HER.forEach((h,i)=>{const own=save.items.filter(j=>ITEMS[j].who===i),all=ITEMS.filter(o=>o.who===i).length;
  F.insertAdjacentHTML('beforeend',`<h3 class="fh">${h.n} <small>${own.length}/${all} objets</small></h3>`);
  if(!own.length)F.insertAdjacentHTML('beforeend','<div class="sub">Aucun objet pour l’instant : gagne des combats pour en trouver.</div>');
  for(const j of own){const o=ITEMS[j],l=upLvl(save,j),c=upCost(save,j),k=Object.keys(STAT).find(k=>o[k]),r=document.createElement('div');r.className='loot frow';r.append(icon('items',o.ic,44));
   r.insertAdjacentHTML('beforeend',`<div><b>${o.n}</b> <span class="pips">${'◆'.repeat(l)}<i>${'◆'.repeat(3-l)}</i></span><br><small>+${itemVal(o,k,l)} ${STAT[k]}${c!=null?` → <b style="color:#7dff8a">+${itemVal(o,k,l+1)}</b>`:' · maximum'}</small></div>`);
   const b=document.createElement('button');b.className='btn'+(c!=null&&save.gold>=c?'':' dark');b.disabled=c==null||save.gold<c;b.innerHTML=c==null?'Max':`${c} <img src="${uiURL(14)}">`;
   b.onclick=()=>{F.querySelectorAll('.frow .btn').forEach(x=>x.disabled=true);if(!upgrade(save,j))return forge();store();
    sfx('smash',.6);setTimeout(()=>sfx('coin',.7),180);r.classList.add('forged');addPop(r,'+1');setTimeout(forge,650)};
   r.append(b);F.append(r)}});
 const back=document.createElement('button');back.className='btn dark';back.style.marginTop='14px';back.textContent='Retour au camp';back.onclick=()=>{F.classList.remove('on');camp()};F.append(back)}
// ---------- maître d'armes (V2.5a) ----------
function armes(){$('camp').classList.remove('on');const A=$('armes');A.classList.add('on');A.innerHTML='';
 A.insertAdjacentHTML('beforeend',`<h1>Le Maître d’armes</h1><div class="sub">${save.lvl<3?`Les spécialisations s’ouvrent au <b>niveau 3</b> (tu es niveau ${save.lvl}).`:'Une spécialisation par héros, changeable gratuitement ici.'} Ses talents s’ajoutent aux niveaux 3, 7 et 11.</div>`);
 HER.forEach((h,i)=>{const cur=specOf(save,i),hd=document.createElement('h3');hd.className='fh';hd.append(icon(...heroFrame(h.k),34,.62),` ${h.n} `);hd.insertAdjacentHTML('beforeend',`<small>${cur?cur.n:'aucune spécialisation'}</small>`);A.append(hd);
  const row=document.createElement('div');row.className='specs';
  for(const x of SPECS[i]){const on=cur===x,c=document.createElement('div');c.className='spec'+(on?' on':'');c.append(icon(...x.ic,56));
   c.insertAdjacentHTML('beforeend',`<div><b>${x.n}</b> <small>${x.d}</small>`+x.t.map(([tn,td],k)=>{const lv=TIER[k],ok=save.lvl>=lv&&k<DONE;return`<p class="${ok?'':'off'}"><em>${save.lvl<lv?'🔒 niv '+lv:k>=DONE?'à venir':on?'✓ actif':'niv '+lv}</em> <b>${tn}</b> : ${td}</p>`}).join('')+'</div>');
   const b=document.createElement('button');b.className='btn'+(on?' dark':'');b.textContent=on?'Active':'Choisir';b.disabled=on||save.lvl<3;b.onclick=()=>{save.sp[i]=x.id;store();sfx('buff',.7);armes()};c.append(b);row.append(c)}
  A.append(row)});
 const back=document.createElement('button');back.className='btn dark';back.style.marginTop='14px';back.textContent='Retour au camp';back.onclick=()=>{A.classList.remove('on');camp()};A.append(back)}
function addPop(el,t){const s=document.createElement('span');s.className='fpop';s.append(icon('ficon',14,26),t);el.append(s)}
export function camp(){
 G.phase='camp';document.body.classList.add('camp');music('main_theme');const C=$('camp');C.innerHTML=`<img src="${logoURL()}" alt="Tactika" style="width:min(78vw,340px);margin:4px 0 2px"><div class="sub">Version 2.5b · combats tactiques au tour par tour</div>`;
 C.appendChild(party());
 C.insertAdjacentHTML('beforeend',`<div style="font-weight:700">Niveau ${save.lvl} · ${save.xp}/${xpNeed(save.lvl)} XP</div><div class="bar"><i style="width:${100*save.xp/xpNeed(save.lvl)}%"></i></div>`);
 const st=document.createElement('div');st.className='stat';st.append(icon('ui',14,22),` ${save.gold} or`,` · ${save.items.length}/${ITEMS.length} objets`);C.appendChild(st);
 const b=document.createElement('button');b.className='btn';b.style.cssText='font-size:18px;padding:14px 34px';b.textContent='Carte du monde';b.onclick=worldMap;C.appendChild(b);C.appendChild(town());
 C.insertAdjacentHTML('beforeend',`<div class="how"><b>Comment jouer</b><br>Chaque héros a 6 <span class="pa">PA</span> (sorts) et 3 <span class="pm">PM</span> (cases).<br>• Touche une case <b style="color:#6ab0ff">bleue</b> pour te déplacer.<br>• Choisis un sort, puis une case <b style="color:#ffa040">orange</b>. Les cases grises sont hors de vue (un obstacle ou un personnage bloque).<br>• « Fin du tour » passe au suivant.<br>• La bulle rouge au-dessus d'un monstre montre qui il frappera et combien.<br>• Fracas de Kael repousse de 2 cases : contre un obstacle ou un autre monstre, 5 dégâts par case bloquée.<br>• Combo : frappe le même ennemi avec 2 ou 3 héros avant qu'il joue (+15 % puis +30 %).<br>• ★ victoire, ★ aucun héros KO, ★ en 5 tours (boss : 7). Premier 3 ★ : +50 % d'or.<br>• Au camp, la forge améliore tes objets avec l'or gagné (3 niveaux).<br>• Sur la carte, chaque zone a 3 combats puis un boss qui ouvre la zone suivante. Les combats gagnés se rejouent pour gagner de l'XP.</div>`);
 const r=document.createElement('button');r.className='btn dark';r.style.cssText='font-size:12px;padding:7px 12px';r.textContent='Recommencer à zéro';
 r.onclick=()=>{if(r.dataset.arm){resetSave();camp()}else{r.dataset.arm=1;r.textContent='Touche encore pour effacer'}};C.appendChild(r);
 C.insertAdjacentHTML('beforeend',`<div style="display:flex;gap:8px;margin-top:12px"><button class="btn dark son-m" data-act="son-m">♪ Musique</button><button class="btn dark son-s" data-act="son-s">🔊 Sons</button></div><div class="sig">maxlolfr · GitHub</div>`);C.classList.add('on');sonBtns();
}
function worldMap(){
 G.phase='camp';document.body.classList.add('camp');music('camp');$('camp').classList.remove('on');const M=$('map');M.classList.add('on');
 const L=$('mapz');L.innerHTML='';
 const svg=`<svg class="road" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="${ZONES.map(z=>z.x+','+z.y).join(' ')}" /></svg>`;L.insertAdjacentHTML('beforeend',svg);
 ZONES.forEach((z,zi)=>{const b=document.createElement('button'),ok=unlocked(zi),p=prog(z.id||'');b.className='zone'+(ok?'':' lock');b.style.left=z.x+'%';b.style.top=z.y+'%';
  const B=z.boss?MON[z.boss.k]:null;if(B)b.appendChild(icon(z.boss.s||B.s,z.boss.s?0:B.row*3,46));else b.insertAdjacentHTML('beforeend','<span class="q">?</span>');
  b.insertAdjacentHTML('beforeend',`<b>${z.n}</b><small>${z.soon?'Bientôt':!ok?'🔒 Bats le boss précédent':p>=4?'✓ Terminée':`${p}/4`}${p?' · '+starsOf(z.id).reduce((a,b)=>a+b,0)+'/12 ★':''}</small>`);
  b.onclick=()=>{if(ok)zoneSheet(zi)};L.appendChild(b)});
 $('zsheet').classList.remove('on');$('mapinfo').innerHTML=`Niv ${save.lvl} · ${save.gold} or`;
}
function zoneSheet(zi){const z=ZONES[zi],p=prog(z.id),S=$('zsheet');S.innerHTML=`<h3>${z.n}</h3><small>Niveaux ${z.lvl}–${z.lvl+3}</small>`;
 for(let i=0;i<4;i++){const b=document.createElement('button'),done=i<p,next=i===p;b.className='btn'+(next?'':' dark');b.disabled=i>p;
  b.textContent=(i===3?`Boss · ${z.boss.n}`:`Combat ${i+1}`)+` · niv ${z.lvl+i}`+(done?' '+'★'.repeat(starsOf(z.id)[i]||0)+'☆'.repeat(3-(starsOf(z.id)[i]||0)):'');b.onclick=()=>startFight(zi,i);S.appendChild(b)}
 const c=document.createElement('button');c.className='btn dark';c.textContent='Fermer';c.onclick=()=>S.classList.remove('on');S.appendChild(c);S.classList.add('on')}
const starsOf=id=>(save.st||(save.st={}))[id]||(save.st[id]=[]);
function result(win,fled){const F=G.F;
 const Rs=$('result');Rs.innerHTML='';G.cur=null;document.body.classList.add('camp');duck(4500);sfx(win?'victory':'defeat');
 if(win){const zid=ZONES[F.zi].id,first=prog(zid)===F.i,sl=starList(G.s,!!F.boss),st=stars(G.s,!!F.boss),best=starsOf(zid),new3=st===3&&(best[F.i]||0)<3;
  const gold=Math.round(((6*F.lvl+ri(Math.random,0,8))*(first?1:.5)+(F.boss&&first?40:0))*(new3?1.5:1)),xp=G.s.killedXp;save.gold+=gold;const up=gainXp(save,xp);
  const free=ITEMS.map((_,i)=>i).filter(i=>!save.items.includes(i));let it=null;if(free.length&&Math.random()<(F.boss&&first?1:first?.5:.15)){it=pick(Math.random,free);save.items.push(it)}
  best[F.i]=Math.max(best[F.i]||0,st);if(first)save.z[zid]=F.i+1;store();
  Rs.innerHTML=`<h1>Victoire !</h1><div class="stars">${[0,1,2].map(i=>`<span class="${i<st?'on':''}" style="animation-delay:${.3+i*.25}s">★</span>`).join('')}</div>
   <div class="sub">${['Victoire','Aucun héros KO',`En ${F.boss?7:5} tours ou moins`].map((t,i)=>(sl[i]?'✓ ':'✗ ')+t).join(' · ')}<br>${ZONES[F.zi].n} · ${F.boss?F.boss.n+' vaincu !':'combat '+(F.i+1)+' gagné'}${F.boss&&first&&ZONES[F.zi+1]?'<br><b style="color:#ffd65a">Nouvelle zone : '+ZONES[F.zi+1].n+(ZONES[F.zi+1].soon?' (bientôt)':'')+'</b>':''}</div>`;
  [.3,.55,.8].slice(0,st).forEach(d=>setTimeout(()=>sfx('coin',.5,1.3),d*1000+200));
  const loot=[[icon('spells',6,48),`<b>+${xp} XP</b>${up?`<br><span style="color:#ffd65a">Niveau ${save.lvl} ! PV et dégâts en hausse.</span>`:''}`],[icon('items',15,48),`<b>+${gold} or</b>${new3?' <span style="color:#ffd65a">(+50 %, premier 3 ★)</span>':''}`]];
  if(it!==null)loot.push([icon('items',ITEMS[it].ic,48),`<b>${ITEMS[it].n}</b><br>${HER[ITEMS[it].who].n} : ${ITEMS[it].dmg?`+${ITEMS[it].dmg} dégâts`:ITEMS[it].hp?`+${ITEMS[it].hp} PV`:`+${ITEMS[it].heal} soin`}`]);
  // coffre : tremble, s'ouvre au toucher (ou seul après 3 s), puis le butin sort ligne par ligne
  const ch=document.createElement('div');ch.className='chest';ch.innerHTML='<u></u><img src="assets/chest_closed.png" alt=""><img class="o" src="assets/chest_open.png" alt=""><small>Touche le coffre</small>';Rs.appendChild(ch);
  const box=document.createElement('div');Rs.appendChild(box);
  const open=()=>{if(ch.classList.contains('open'))return;ch.classList.add('open');sfx('buff',.8);sfx('coin');
   loot.forEach(([ic,html],i)=>setTimeout(()=>{const d=document.createElement('div');d.className='loot pop';d.append(ic);d.insertAdjacentHTML('beforeend',`<div>${html}</div>`);box.appendChild(d);sfx(i===2?'levelup':'coin',.6)},300+i*380));
   if(up)setTimeout(()=>sfx('levelup'),400+loot.length*380)};
  ch.onclick=open;setTimeout(open,3000);
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
