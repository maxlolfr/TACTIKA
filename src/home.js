// Accueil (V3.1) : village peint interactif, barre du haut, « Partir à l'aventure », onglets Héros / Inventaire / Quêtes et réglages.
// Les écrans existants (forge, marchand…) et les actions viennent de ui.js par l'objet `A` (pas d'import circulaire).
import {$} from './util.js';
import {HER,ITEMS,ZONES,POTION,RARE,zlen} from './data.js';
import {heroStats,xpNeed,upCost,upLvl,itemVal,rarOf,contracts} from './rules.js';
import {save,prog,unlocked,store,resetSave} from './save.js';
import {AT,icon,uiURL,logoURL,drawF,heroFrame} from './render.js';
import {setSon,sonBtns,sfx} from './audio.js';
import {specOf} from './talents.js';

export const VERSION='4.3';
const el=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e};
// Deux peintures du village. Toutes les positions sont en pixels de l'image de la scène.
// bâtiments : zone tactile z [x,y,largeur,hauteur], plaque l [x,y] au pied
// lumières glow [x,y,rayon,genre] : l lanterne, w fenêtre, f feu, m magie ; camp : héros [x,y des pieds, héros, miroir]
// box : partie utile à garder visible [largeur, hauteur, centre x, centre y]
const INFO={caserne:{ic:['items',5],n:'Caserne',d:'Tes héros'},taverne:{ic:['items',17],n:'Taverne',d:'Contrats et défi'},
 forge:{ic:['ficon',0],n:'Forge',d:'Améliorer'},marchand:{ic:['items',15],n:'Marchand',d:'Acheter, vendre'},talents:{ic:['ui',12],n:'Talents',d:'Spécialisations'}};
const place=P=>Object.entries(P).map(([id,[z,l]])=>({id,...INFO[id],z,l}));
const SCENES={
 // verticale : téléphone droit et écrans presque carrés
 p:{src:'assets/village.webp',w:941,h:1672,box:[905,1085,470,758],hero:[130,158],
  bld:place({caserne:[[40,215,405,415],[232,612]],taverne:[[520,300,415,330],[728,592]],forge:[[0,625,335,370],[178,992]],marchand:[[615,655,326,320],[765,965]],talents:[[590,998,320,285],[742,1272]]}),
  glow:[[118,436,46,'l'],[241,433,46,'l'],[181,452,40,'w'],[592,380,44,'l'],[752,608,42,'l'],[706,405,40,'w'],[802,404,36,'w'],[690,500,48,'w'],[826,502,48,'w'],
   [302,738,48,'l'],[271,853,40,'l'],[177,897,95,'f'],[160,692,50,'f'],[562,1001,46,'l'],[825,1195,48,'l'],[74,1207,40,'l'],[735,1081,38,'w'],[752,1165,46,'w'],[694,1150,52,'m'],[405,1172,115,'f']],
  smoke:[[176,655,1],[815,300,.8]],water:[335,1450,95,150],
  // feuillages qui ondulent : on redessine un morceau de la peinture, à bords fondus
  leaves:[[0,0,340,200],[790,1230,151,330],[0,1015,130,180],[0,470,120,150]],
  camp:[[262,1190,0,false],[352,1116,1,false],[540,1196,2,true]]},
 // horizontale (V3.4) : paysage large
 l:{src:'assets/village-paysage.webp',w:1536,h:1024,box:[1470,715,795,490],hero:[118,144],
  bld:place({forge:[[115,135,430,255],[335,392]],marchand:[[915,185,400,230],[1135,382]],caserne:[[60,395,425,215],[262,598]],taverne:[[1100,420,425,205],[1330,578]],talents:[[1095,628,315,200],[1250,812]]}),
  glow:[[338,318,85,'f'],[298,305,36,'l'],[432,292,36,'l'],[180,322,46,'w'],[668,532,44,'l'],[884,536,44,'l'],[762,556,70,'w'],[222,522,34,'l'],[318,515,34,'l'],
   [1240,497,40,'w'],[1345,522,42,'w'],[1438,520,40,'w'],[1135,700,62,'m'],[1238,748,52,'w'],[762,222,95,'m'],[578,798,55,'f'],[973,795,55,'f'],[213,755,40,'f']],
  smoke:[[322,128,1.1],[1358,352,.8]],water:[880,168,56,82],
  leaves:[[0,0,230,200],[0,835,190,180],[1400,835,136,180],[1425,60,111,170]],
  camp:[[655,792,0,false],[766,742,1,false],[884,796,2,true]]}};
let tab='camp',A=null,root=null;
const today=()=>A.today();
// ---------- notifications ----------
const forgeNews=()=>save.items.some(j=>{const c=upCost(save,j);return c!=null&&save.gold>=c});
const talentNews=()=>save.lvl>=3&&save.sp.includes(null);
const claimable=()=>contracts(save,today()).filter(t=>t.p>=t.n&&!t.c).length;
const NEWS={forge:()=>forgeNews()?'↑':0,talents:()=>talentNews()?'!':0,taverne:()=>claimable()||(save.dd!==today()?'!':0),
 marchand:()=>0,caserne:()=>0};
// chapitre en cours : première zone ouverte non terminée
function chapter(){for(let i=0;i<ZONES.length;i++){const z=ZONES[i];const L=zlen(z);if(unlocked(i)&&prog(z.id)<L)return{i,z,t:`Chapitre ${i+1} · ${z.n}`,s:`Étape ${prog(z.id)+1} sur ${L}`+(prog(z.id)===L-1?` · Boss : ${z.boss.n}`:'')}}
 return{i:-1,t:'Aventure terminée',s:'Rejoue les combats pour 3 ★'}}

// ---------- scène peinte ----------
let kind='p';
function scene(k){
 const Q=SCENES[k],pc=(x,y,w,h)=>`left:${x/Q.w*100}%;top:${y/Q.h*100}%`+(w?`;width:${w/Q.w*100}%;height:${h/Q.h*100}%`:'');
 const stage=el('div','v-stage');stage.id='vstage';stage.dataset.k=k;
 const img=el('img','v-img');img.src=Q.src;img.alt='';img.decoding='async';stage.append(img);
 for(const[x,y,w,h]of Q.leaves){const s=el('i','v-leaf');s.style.backgroundImage=`url(${Q.src})`;s.style.cssText=pc(x,y,w,h);s.dataset.crop=[x,y].join();s.style.animationDelay=-(x+y)%7+'s';stage.append(s)}
 for(const[x,y,r,k]of Q.glow){const g=el('i','v-glow '+k);g.style.cssText=pc(x-r,y-r,r*2,r*2);g.style.animationDelay=-((x*7+y)%31)/10+'s';stage.append(g)}
 for(const[x,y,k]of Q.smoke)for(let i=0;i<4;i++){const s=el('i','v-smoke');s.style.cssText=pc(x-26*k,y-26*k,52*k,52*k);s.style.animationDelay=-i*1.1+'s';stage.append(s)}
 {const w=el('i','v-water');w.style.cssText=pc(...Q.water);stage.append(w)}
 // héros autour du feu
 for(const[x,y,i,flip]of Q.camp){const[hw,hh]=Q.hero,b=el('button','v-hero');b.style.cssText=pc(x-hw/2,y-hh*.95,hw,hh);b.setAttribute('aria-label',`${HER[i].n} : voir la fiche`);
  const c=el('canvas');c.width=260;c.height=316;const[s,k]=heroFrame(HER[i].k),f=AT[s][k];drawF(c.getContext('2d'),s,k,130,300,284/f[3],flip);c.style.animationDelay=-i*.9+'s';b.append(c);
  b.onclick=()=>{hero=i;show('heros')};stage.append(b)}
 for(const b of Q.bld){const z=el('button','v-bld');z.dataset.b=b.id;z.style.cssText=pc(...b.z);z.setAttribute('aria-label',`${b.n} : ${b.d}`);
  const lift=el('i','v-lift');lift.style.backgroundImage=`url(${Q.src})`;lift.dataset.crop=b.z.slice(0,2).join();z.append(lift);
  const p=el('span','v-plate',`<span><b>${b.n}</b><small>${b.d}</small></span>`);p.prepend(icon(...b.ic,28));p.style.cssText=`left:${(b.l[0]-b.z[0])/b.z[2]*100}%;top:${(b.l[1]-b.z[1])/b.z[3]*100}%`;z.append(p);
  const n=NEWS[b.id]();if(n)p.append(el('u','v-badge',n));
  // la réaction du bâtiment se voit avant l'ouverture de l'écran
  z.onclick=()=>{if(z.classList.contains('hit'))return;z.classList.add('hit');setTimeout(()=>{z.classList.remove('hit');open(b.id)},190)};stage.append(z)}
 return stage;
}

// ---------- structure ----------
function build(){
 const C=$('camp');C.innerHTML='';root=C;
 C.append(el('div','v-back'));
 C.append(scene(kind));
 const fl=el('div','v-flies');for(let i=0;i<16;i++){const p=el('i',i%4===3?'lf':'');p.style.cssText=`left:${(i*61+7)%100}%;top:${(i*37+13)%80+8}%;animation-delay:${-i*1.3}s;animation-duration:${7+i%5*1.4}s`;
  if(i%4===3){const f=AT.parts[2];p.append(icon('parts',2,18))}fl.append(p)}C.append(fl);
 // barre du haut
 const top=el('header','v-top');
 top.innerHTML=`<button class="v-lvl" aria-label="Niveau ${save.lvl}, voir les héros"><span class="v-medal"><b>${save.lvl}</b></span><span class="v-xp"><small>Niveau ${save.lvl}</small><span class="v-bar"><i style="width:${100*save.xp/xpNeed(save.lvl)}%"></i><em>${save.xp}/${xpNeed(save.lvl)} XP</em></span></span></button>
 <button class="v-coin" data-v="marchand" aria-label="${save.gold} or"><img src="${uiURL(14)}" alt=""><b>${save.gold}</b></button>
 <button class="v-coin" data-v="marchand" aria-label="${save.pot||0} potions"><span class="v-pot"></span><b>${save.pot||0}/${POTION.max}</b></button>
 <button class="v-gear" aria-label="Réglages"><img src="${uiURL(17)}" alt=""></button>`;
 top.querySelector('.v-medal').prepend(icon(...heroFrame('warrior'),40,.55));top.querySelector('.v-lvl').onclick=()=>show('heros');
 top.querySelector('.v-pot').append(icon('items',10,26));
 top.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>open(b.dataset.v));
 top.querySelector('.v-gear').onclick=()=>show('reglages');C.append(top);
 const logo=el('img','v-logo');logo.src=logoURL();logo.alt='Tactika';C.append(logo);
 // bas : aventure + navigation
 const dock=el('div','v-dock'),ch=chapter();
 const go=el('button','v-go',`<b>Partir à l’aventure</b>`);go.prepend(icon('ico',0,40));go.onclick=()=>A.adventure(ch.i);
 dock.append(el('div','v-chap',`<b>${ch.t}</b><small>${ch.s}</small>`),go);
 const nav=el('nav','v-nav');
 for(const[id,n,ic]of[['camp','Camp',['ficon',13]],['heros','Héros',['ui',21]],['inventaire','Inventaire',['ui',26]],['quetes','Quêtes',['ui',20]]]){
  const b=el('button');b.dataset.tab=id;b.append(icon(...ic,34),el('span',null,n));const q=id==='quetes'?claimable():id==='heros'&&talentNews()?'!':0;if(q)b.append(el('u','v-badge',q));b.onclick=()=>show(id);nav.append(b)}
 dock.append(nav);C.append(dock);
 const P=el('section','v-panel');P.id='vpanel';C.append(P);
}
function open(id){if(id==='caserne'){show('heros');return}A[{forge:'forge',marchand:'shop',taverne:'tav',talents:'armes'}[id]]()}

// ---------- mise en place de la scène : les 5 bâtiments toujours visibles entre la barre du haut et le bas ----------
export function fitHome(){let S=$('vstage');if(!S||!root.classList.contains('on'))return;
 const W=root.clientWidth,H=root.clientHeight,top=root.querySelector('.v-top').getBoundingClientRect().bottom,D=root.querySelector('.v-dock').getBoundingClientRect();
 // on regarde où le CSS a vraiment mis le menu : sur un écran presque carré (Honor déplié), comparer largeur et hauteur
 // peut contredire le CSS, et le village prenait alors une taille négative (il disparaissait)
 const land=D.top<H*.3&&D.left>W*.3;
 // zone libre : au-dessus du bas en portrait, à gauche de la colonne en paysage
 const x1=land?D.left:W,y0=land?top-6:top+4,y1=land?H-16:D.top-6;
 // boîte utile de l'image : x 15..930, y 218..1300
 if(!W||!H)return;
 // menu en colonne et zone libre nettement plus large que haute : peinture horizontale ; sinon la verticale
 const k=land&&x1>(y1-y0)*1.2?'l':'p';
 if(S.dataset.k!==k){kind=k;const N=scene(k);S.replaceWith(N);S=N}
 root.querySelector('.v-back').style.backgroundImage=`url(${SCENES[k].src})`;
 const Q=SCENES[k],[bw,bh,cx,cy]=Q.box;
 const s=Math.max(Math.min(x1/bw,(y1-y0)/bh),Math.min(W/Q.w,H/Q.h)*.6),left=x1/2-cx*s; // jamais nul ni négatif
 let t=(y0+y1)/2-cy*s;if(Q.h*s>=H)t=Math.min(0,Math.max(H-Q.h*s,t));else t=Math.max(0,Math.min(H-Q.h*s,t));
 S.style.cssText=`width:${Q.w*s}px;height:${Q.h*s}px;left:${left}px;top:${t}px`;S.style.setProperty('--s',s);
 for(const e of S.querySelectorAll('[data-crop]')){const[x,y]=e.dataset.crop.split(',');e.style.backgroundSize=`${Q.w*s}px ${Q.h*s}px`;e.style.backgroundPosition=`${-x*s}px ${-y*s}px`}
 // bords de la peinture : fondus seulement quand elle ne couvre pas l'écran
 S.classList.toggle('framed',Q.w*s<(land?x1:W)-2);
}

// ---------- panneaux ----------
let hero=0;
export function show(t){tab=t;const P=$('vpanel');root.querySelectorAll('.v-nav button').forEach(b=>b.classList.toggle('on',b.dataset.tab===(t==='reglages'?'camp':t)));
 P.innerHTML='';P.classList.toggle('on',t!=='camp');root.classList.toggle('paneled',t!=='camp');if(t==='camp')return;
 const head=el('div','v-head',`<h2>${{heros:'Héros',inventaire:'Inventaire',quetes:'Quêtes',reglages:'Réglages'}[t]}</h2>`),x=el('button','v-x','✕');x.setAttribute('aria-label','Fermer');x.onclick=()=>show('camp');head.append(x);P.append(head);
 const body=el('div','v-body');P.append(body);({heros,inventaire,quetes,reglages})[t](body)}
const wood=(txt,fn,cls='')=>{const b=el('button','v-btn '+cls,txt);b.onclick=fn;return b};
const STAT={dmg:'dégâts',hp:'PV',heal:'soin'};
const bonus=j=>{const o=ITEMS[j],k=Object.keys(STAT).find(k=>o[k]);return`+${itemVal(o,k,upLvl(save,j),rarOf(save,j))} ${STAT[k]}`};
function itemRow(j,who){const o=ITEMS[j],r=rarOf(save,j),row=el('div','v-row');row.append(icon('items',o.ic,42));
 row.append(el('div',null,`<b style="color:${RARE[r].c}">${o.n}</b><small>${who?HER[o.who].n+' · ':''}${bonus(j)}${r?' · '+RARE[r].n:''}${upLvl(save,j)?` · forge ${upLvl(save,j)}`:''}</small>`));return row}
function heros(P){
 const tabs=el('div','v-tabs');HER.forEach((h,i)=>{const b=el('button',i===hero?'on':'');b.append(icon(...heroFrame(h.k),44,.62),el('span',null,h.n));b.onclick=()=>{hero=i;show('heros')};tabs.append(b)});P.append(tabs);
 const h=HER[hero],st=heroStats(save,hero),sp=specOf(save,hero),card=el('div','v-card v-sheet');
 const c=el('canvas');c.width=300;c.height=340;const[s,k]=heroFrame(h.k);drawF(c.getContext('2d'),s,k,150,326,310/AT[s][k][3]);card.append(c);
 card.append(el('div','v-stats',`<h3>${h.n}</h3><em>${h.cls}</em><dl><dt>Points de vie</dt><dd>${st.hp}</dd><dt>PA · PM</dt><dd>6 · ${st.tal.maxPM||3}</dd><dt>${hero===2?'Bonus de soin':'Bonus de dégâts'}</dt><dd>+${hero===2?st.heal:st.dmg}</dd><dt>Puissance</dt><dd>×${(st.mult*(st.tal.dmgMul||1)).toFixed(2)}</dd></dl>`));P.append(card);
 const tl=el('div','v-card v-row');tl.append(sp?icon(...sp.ic,42):icon('badge',3,42),el('div',null,`<b>${sp?sp.n:'Aucune spécialisation'}</b><small>${sp?sp.d:save.lvl<3?'S’ouvre au niveau 3.':'Choisis une voie pour ce héros.'}</small>`),wood('Talents',A.armes,'sm'));P.append(tl);
 P.append(el('h4',null,'Sorts'));
 for(const id of[...h.sp,...(st.tal.add||[])]){const S={...A.SP[id],...st.tal.sp[id]},row=el('div','v-row');row.append(icon(...A.SPI[id],40),el('div',null,`<b>${S.n} <i>${S.pa} PA</i></b><small>${S.d}${S.dmg?` · ${S.dmg.join('–')} dégâts`:''}${S.heal?` · ${S.heal.join('–')} soins`:''}</small>`));P.append(row)}
 P.append(el('h4',null,'Équipement'));
 const own=save.items.filter(j=>ITEMS[j].who===hero);own.forEach(j=>P.append(itemRow(j)));
 if(!own.length)P.append(el('p','v-empty','Aucun objet pour l’instant : gagne des combats ou passe chez le marchand.'));
}
function inventaire(P){
 const grid=el('div','v-grid');ITEMS.forEach((o,j)=>{const has=save.items.includes(j),b=el('button','v-slot'+(has?'':' off'));b.append(icon('items',o.ic,54));b.setAttribute('aria-label',has?o.n:'Objet à découvrir');
  if(has){b.style.borderColor=RARE[rarOf(save,j)].c;if(upLvl(save,j))b.append(el('u',null,'+'+upLvl(save,j)))}
  b.onclick=()=>{grid.querySelectorAll('.v-slot').forEach(x=>x.classList.toggle('sel',x===b));info.innerHTML='';info.append(has?itemRow(j,1):el('p','v-empty',`Objet à découvrir pour ${HER[o.who].n}.`))};grid.append(b)});
 const info=el('div','v-card','<p class="v-empty">Touche un objet pour voir son effet.</p>');
 P.append(el('p','v-count',`${save.items.length} objets sur ${ITEMS.length} · potions ${save.pot||0}/${POTION.max}`),grid,info);
 const r=el('div','v-actions');r.append(wood('La Forge',A.forge),wood('Le Marchand',A.shop,'dk'));P.append(r)}
function quetes(P){A.quests(P,()=>{build();fitHome();sonBtns();show('quetes')})}
function reglages(P){
 const r=el('div','v-actions');r.innerHTML=`<button class="v-btn dk son-m" data-act="son-m">♪ Musique</button><button class="v-btn dk son-s" data-act="son-s">🔊 Sons</button>`;P.append(r);sonBtns();
 const r2=el('div','v-actions');r2.append(wood('💾 Sauvegarde',A.saveDlg,'dk'),wood('Revoir le tutoriel',()=>A.tuto(),'dk'));P.append(r2);
 P.append(el('div','v-card v-how',A.HOW));
 const z=wood('Recommencer à zéro',()=>{if(z.dataset.arm){resetSave();A.reload()}else{z.dataset.arm=1;z.textContent='Touche encore pour tout effacer'}},'danger');P.append(z);
 P.append(el('p','v-ver',`Tactika · version ${VERSION} · maxlolfr`));
}

export function renderHome(actions){A=actions;build();root.classList.add('on');fitHome();show('camp');sonBtns();store()}
addEventListener('resize',()=>{fitHome();setTimeout(fitHome,350)});
// la barre du navigateur intégré peut apparaître ou disparaître sans événement resize au retour d'un combat
if(window.ResizeObserver)new ResizeObserver(()=>fitHome()).observe($('camp'));
