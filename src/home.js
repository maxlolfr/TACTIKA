// Accueil (V3.1) : village peint interactif, barre du haut, « Partir à l'aventure », onglets Héros / Inventaire / Quêtes et réglages.
// Les écrans existants (forge, marchand…) et les actions viennent de ui.js par l'objet `A` (pas d'import circulaire).
import {$,SPEED} from './util.js';
import {HER,ITEMS,SLOTS,ZONES,POTION,RARE,zlen} from './data.js';
import {heroStats,xpNeed,upCost,upLvl,itemVal,rarOf,contracts,weaponOf,gear,isOn,equip,compare,fightSpec,zoneDone,crystalState} from './rules.js';
import {MON} from './data.js';
import {save,prog,unlocked,store,resetSave} from './save.js';
import {AT,icon,uiURL,logoURL,drawF,heroFrame,walkFrames} from './render.js';
import {setSon,sonBtns,sfx} from './audio.js';
import {specOf} from './talents.js';

export const VERSION='4.8c';
const el=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e};
// Deux peintures du village (V4.6.1 : six bâtiments). Positions en pixels « logiques » de la scène (l'image réelle est plus grande).
// bâtiments : zone tactile z [x,y,largeur,hauteur], plaque l [x,y] au pied
// lumières glow [x,y,rayon,genre] : l lanterne, w fenêtre, f feu, m magie ; camp : héros [x,y des pieds, héros, miroir]
// box : partie utile à garder visible [largeur, hauteur, centre x, centre y]
// cry : calque du cristal [centre x, bas y] ; ck : échelle des états 1 à 4 puis du 5e (un peu réduit pour ne pas cacher les voisins)
const INFO={caserne:{ic:['items',5],n:'Caserne',d:'Tes héros'},taverne:{ic:['items',17],n:'Taverne',d:'Contrats et défi'},
 forge:{ic:['ficon',0],n:'Forge',d:'Améliorer'},marchand:{ic:['items',15],n:'Marchand',d:'Acheter, vendre'},
 entrainement:{ic:['spells',0],n:'Entraînement',d:'Bientôt'},talents:{ic:['ui',12],n:'Académie',d:'Talents'}};
const place=P=>Object.entries(P).map(([id,[z,l]])=>({id,...INFO[id],z,l}));
const SCENES={
 // verticale : téléphone droit et écrans presque carrés (V4.6.2 : sans cristal peint)
 p:{src:'assets/village.webp',w:941,h:1686,box:[905,1390,470,862],hero:[130,158],
  npc:150,pnj:{caserne:[405,548,false],taverne:[535,600,false],forge:[360,1000,true],marchand:[590,978,false],entrainement:[215,1385,false],talents:[792,1462,true]},
  bld:place({caserne:[[40,180,385,370],[225,535]],taverne:[[535,290,390,300],[722,590]],forge:[[0,630,370,350],[178,985]],marchand:[[640,655,301,315],[752,978]],
   entrainement:[[0,1020,405,390],[205,1215]],talents:[[590,1030,351,520],[755,1515]]}),
  glow:[[94,421,42,'l'],[229,421,42,'l'],[161,439,40,'w'],[462,505,40,'l'],[591,341,42,'l'],[705,386,40,'w'],[810,384,40,'w'],[693,497,46,'w'],[836,499,46,'w'],
   [306,860,85,'f'],[760,865,42,'l'],[857,746,34,'w'],[567,1262,48,'l'],[750,1353,42,'w'],[710,1423,52,'m'],[844,1464,42,'l'],[55,1504,42,'l'],[460,1471,110,'f']],
  smoke:[[136,638,1],[812,270,.8]],water:[0,1605,100,75],
  // feuillages qui ondulent : on redessine un morceau de la peinture, à bords fondus
  leaves:[[0,0,300,170],[0,1270,100,190],[0,500,115,160],[850,500,91,170]],
  camp:[[262,1525,0,false],[345,1420,1,false],[590,1432,2,true]],cry:[480,1140],ck:[.507,.44],
  // V4.8b : trajet de chaque héros sur les chemins (après son poste) — Kael vers la forge, Fenn vers le marchand, Aelis vers le cristal
  walk:[[[300,1425],[420,1340],[440,1255],[320,1160]],[[440,1350],[510,1260],[600,1215],[672,1172]],[[560,1365],[485,1325],[400,1345]]]},
 // horizontale : paysage large
 l:{src:'assets/village-paysage.webp',w:1536,h:1030,box:[940,880,700,535],hero:[100,122],
  npc:108,pnj:{caserne:[742,352,true],taverne:[815,396,false],forge:[708,614,true],marchand:[842,614,false],entrainement:[312,846,false],talents:[1125,938,true]},
  bld:place({caserne:[[495,105,230,235],[608,340]],taverne:[[800,175,270,195],[940,368]],forge:[[470,390,235,215],[578,605]],marchand:[[850,405,225,200],[978,600]],
   entrainement:[[225,625,420,255],[430,862]],talents:[[865,610,265,345],[1005,932]]}),
  glow:[[532,255,30,'l'],[575,265,34,'w'],[648,258,30,'w'],[848,295,30,'l'],[915,235,34,'w'],[985,262,34,'w'],[935,292,40,'w'],[665,525,60,'f'],[952,528,34,'l'],
   [828,765,38,'l'],[945,820,34,'w'],[918,862,45,'m'],[1090,858,32,'w'],[1005,893,30,'l'],[505,912,30,'l'],[1197,378,34,'w'],[1370,468,45,'m'],[762,892,75,'f']],
  smoke:[[558,390,.9],[986,172,.7]],water:[400,975,130,55],
  leaves:[[0,300,165,220],[0,840,200,190],[1400,770,136,200],[1380,0,156,190]],
  camp:[[655,928,0,false],[722,852,1,false],[846,892,2,true]],cry:[765,697],ck:[.285,.26],
  walk:[[[715,845],[765,790],[720,752],[645,757]],[[780,800],[835,755],[920,738]],[[812,855],[792,812],[745,808]]]}};
// V4.8a : un PNJ devant chaque bâtiment. Bandes `tools/prep_pnj.py` : repos, geste 1, geste 2, salut (au toucher). [nom, largeur, hauteur d'une case en pixels]
const PNJ={caserne:['garrick',300,365],taverne:['mira',402,369],forge:['borin',372,368],marchand:['ezran',332,370],entrainement:['darius',416,369],talents:['elyndra',366,372]};
// pieds [x,y,miroir] dans chaque peinture ; npc = hauteur d'une case de 370 px en pixels logiques
// Cristal de l'Éther : [largeur, hauteur] des 5 images
const CRY=[[370,544],[374,639],[403,768],[700,896],[889,1301]];
let tab='camp',A=null,root=null;
const today=()=>A.today();
// ---------- notifications ----------
const forgeNews=()=>save.items.some(j=>{const c=upCost(save,j);return c!=null&&save.gold>=c});
const talentNews=()=>save.lvl>=3&&save.sp.includes(null);
const claimable=()=>contracts(save,today()).filter(t=>t.p>=t.n&&!t.c).length;
const NEWS={forge:()=>forgeNews()?'↑':0,talents:()=>talentNews()?'!':0,taverne:()=>claimable()||(save.dd!==today()?'!':0),
 marchand:()=>0,caserne:()=>0,entrainement:()=>0};
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
 // Cristal de l'Éther → Expéditions
 {const st=crystalState(save),[w,h]=CRY[st-1].map(v=>v*Q.ck[st===5?1:0]);
  const c=el('button','v-cry',`<img src="assets/cry/crystal${st}.webp" alt=""><i class="v-cry-glow"></i>`);c.style.cssText=pc(Q.cry[0]-w/2,Q.cry[1]-h,w,h);c.dataset.state=st;c.setAttribute('aria-label','Cristal de l’Éther : expéditions, revanches');
  const p=el('span','v-plate',`<span><b>Cristal</b><small>Expéditions</small></span>`);p.prepend(icon('ico',0,28));c.append(p);c.onclick=()=>show('expe');stage.append(c)}
 // héros : leur poste est autour du feu, ils vont faire un tour puis reviennent (V4.8b)
 const walkers=Q.camp.map(([x,y,i,flip])=>{const[hw,hh]=Q.hero,b=el('button','v-hero');b.setAttribute('aria-label',`${HER[i].n} : voir la fiche`);
  const c=el('canvas');c.width=260;c.height=316;c.style.animationDelay=-i*.9+'s';b.append(c);b.onclick=()=>{hero=i;show('heros')};stage.append(b);
  const W={i,b,g:c.getContext('2d'),path:[[x,y],...Q.walk[i]],flip,x,y,at:0,dir:1,wait:1.5+i*4.5,t:0,key:''};place1(Q,W);paint(W);return W});
 roam(stage,Q,walkers);
 for(const b of Q.bld){const z=el('button','v-bld');z.dataset.b=b.id;z.style.cssText=pc(...b.z);z.setAttribute('aria-label',`${b.n} : ${b.d}`);
  const lift=el('i','v-lift');lift.style.backgroundImage=`url(${Q.src})`;lift.dataset.crop=b.z.slice(0,2).join();z.append(lift);
  const p=el('span','v-plate',`<span><b>${b.n}</b><small>${b.d}</small></span>`);p.prepend(icon(...b.ic,28));p.style.cssText=`left:${(b.l[0]-b.z[0])/b.z[2]*100}%;top:${(b.l[1]-b.z[1])/b.z[3]*100}%`;z.append(p);
  {const[nom,cw,ch]=PNJ[b.id],[x,y,flip]=Q.pnj[b.id],h=Q.npc*ch/370,w=h*cw/ch,[zx,zy,zw,zh]=b.z,N=el('i','v-npc'+(flip?' flip':''));N.dataset.npc=nom;
   N.style.cssText=`left:${(x-w/2-zx)/zw*100}%;top:${(y-h-zy)/zh*100}%;width:${w/zw*100}%;height:${h/zh*100}%`;
   const im=el('i');im.style.backgroundImage=`url(assets/pnj/${nom}.webp)`;const d=-(x+y)%90/10;im.style.animationDelay=`${d}s,${d*1.7}s`;N.append(im);z.append(N)}
  const n=NEWS[b.id]();if(n)p.append(el('u','v-badge',n));
  // la réaction du bâtiment se voit avant l'ouverture de l'écran
  z.onclick=()=>{if(z.classList.contains('hit'))return;z.classList.add('hit');setTimeout(()=>{z.classList.remove('hit');open(b.id)},save.fast?190:450)};stage.append(z)}
 return stage;
}

// ---------- V4.8b : promenade des héros (décor seulement : aucun effet sur le jeu) ----------
// position : bouton posé sur ses pieds ; il passe devant le cristal quand il marche plus bas que lui
function place1(Q,W){const[hw,hh]=Q.hero;W.b.style.cssText=`left:${(W.x-hw/2)/Q.w*100}%;top:${(W.y-hh*.95)/Q.h*100}%;width:${hw/Q.w*100}%;height:${hh/Q.h*100}%;z-index:${W.y>Q.cry[1]?2:1}`}
// image : à l'arrêt la pose de repos, en marche les 4 images du combat (de face en descendant, de dos en montant)
function paint(W,walk){let s,k,ref,flip=W.flip;
 if(walk){const w=walkFrames(HER[W.i].k,walk.back);s=w[0];k=w[1][Math.floor(W.t/.16)%4];ref=AT[s][w[1][0]][3];flip=walk.left}
 else{[s,k]=heroFrame(HER[W.i].k);ref=AT[s][k][3]}
 const key=s+k+flip;if(key===W.key)return;W.key=key;W.b.classList.toggle('walk',!!walk);W.g.clearRect(0,0,260,316);drawF(W.g,s,k,130,300,284/ref,flip)}
// avance un héros de dt secondes ; vitesse proportionnelle à sa taille dans la peinture
function step(Q,W,dt){
 if(W.wait>0){W.wait-=dt;return}
 const next=W.path[W.at+W.dir],dx=next[0]-W.x,dy=next[1]-W.y,d=Math.hypot(dx,dy),v=Q.hero[1]*.5*dt;W.t+=dt;
 const way={back:dy<0,left:dx<0};
 if(d>v){W.x+=dx/d*v;W.y+=dy/d*v;paint(W,way)}
 else{[W.x,W.y]=next;W.at+=W.dir;
  if(W.at===W.path.length-1||W.at===0){const home=W.at===0;W.dir=home?1:-1;W.wait=home?6+Math.random()*8:3+Math.random()*3;if(!home)W.flip=way.left;else W.flip=Q.camp[W.i][3];W.t=0;paint(W)}}
 place1(Q,W)}
// une seule boucle, arrêtée quand la scène est remplacée ; en pause quand le village n'est pas visible
// (à la première image la scène est déjà en place, ou déjà remplacée par l'autre peinture : la boucle s'arrête alors)
function roam(stage,Q,walkers){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;let last=0;
 const tick=now=>{if(!stage.isConnected)return;
  const dt=Math.min(.05,(now-(last||now))/1000);last=now;
  if(root.classList.contains('on')&&!root.classList.contains('paneled'))for(const W of walkers)step(Q,W,dt);
  requestAnimationFrame(tick)};requestAnimationFrame(tick)}

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
 const chap=el('button','v-chap',`<b>${ch.t}</b><small>${ch.s}</small>`);chap.onclick=()=>root.querySelector('.v-cmd').classList.toggle('open');
 dock.append(cmdPanel(ch),chap,go);
 const nav=el('nav','v-nav');
 for(const[id,n,ic]of[['camp','Camp',['ficon',13]],['heros','Héros',['ui',21]],['inventaire','Inventaire',['ui',26]],['quetes','Quêtes',['ui',20]]]){
  const b=el('button');b.dataset.tab=id;b.append(icon(...ic,34),el('span',null,n));const q=id==='quetes'?claimable():id==='heros'&&talentNews()?'!':0;if(q)b.append(el('u','v-badge',q));b.onclick=()=>fresh(id);nav.append(b)}
 dock.append(nav);C.append(dock);
 const P=el('section','v-panel');P.id='vpanel';C.append(P);
}
// ---------- V4.6 : panneau de commandement (colonne sur grand écran, tiroir en portrait) ----------
const GOAL={survive:'⏳ Survie',chief:'♛ Chef'};
function nextFight(ch){if(ch.i<0)return null;const z=ch.z,i=prog(z.id),F=fightSpec(ch.i,i,0),names=F.en?[...new Set(F.en.map(k=>MON[k].n))]:F.pool.map(k=>MON[k].n);
 return{F,type:F.boss?'💀 Boss : '+F.boss.n:GOAL[F.goal]?GOAL[F.goal]+(F.wave?` ${F.wave.turns} tours, renforts`:''):'⚔ Combat',foes:[...new Set([...(F.boss?[F.boss.n]:[]),...names,...(F.elite&&!F.wave?[MON[F.elite].n]:[])])]}}
function cmdPanel(ch){const P=el('section','v-cmd'),n=nextFight(ch),L=A.last&&A.last(),row=(h,fn)=>{const r=el(fn?'button':'div','v-cl',`<span>${h}</span>`);if(fn)r.onclick=fn;return r};
 P.append(el('h3',null,'Commandement'));
 if(n){const gap=n.F.lvl-save.lvl;P.append(el('h4',null,'Prochaine mission'),row(`<b>${ch.z.n}</b> · étape ${n.F.i+1}/${zlen(ch.z)}<br>${n.type}<br><small>Ennemis : ${n.foes.join(', ')}</small><br><small>Niveau ${n.F.lvl} · ton équipe : <b style="color:${gap>=2?'#ff8a6a':gap<=-2?'#9fd0ff':'#7dff8a'}">${save.lvl}</b></small>`,()=>A.adventure(ch.i)))}
 P.append(el('h4',null,'Équipe'));HER.forEach((h,i)=>{const st=heroStats(save,i),w=weaponOf(save,i);const r=row(`<b>${h.n}</b> <small>${st.hp} PV${w!=null?' · '+ITEMS[w].n:''}</small>`,()=>{hero=i;show('heros')});r.prepend(icon(...heroFrame(h.k),30,.55));P.append(r)});
 const todo=[[talentNews(),'Choisir une spécialisation','talents'],[forgeNews(),'Amélioration abordable à la Forge','forge'],[claimable(),'Contrat à réclamer à la Taverne','taverne'],[save.dd!==today(),'Défi du jour disponible','taverne'],[(save.pot||0)<POTION.max,`Potions ${save.pot||0}/${POTION.max}`,'marchand']].filter(t=>t[0]);
 if(todo.length){P.append(el('h4',null,'À faire'));for(const[,t,b]of todo)P.append(row('• '+t,()=>open(b)))}
 if(L&&!L.win){P.append(el('h4',null,'Dernier combat'));P.append(row(`Défaite au tour ${L.round} · ${L.ko} KO · ${L.left} ennemi${L.left>1?'s':''} debout<br><small>Rejoue une mission au Cristal, change d'arme ou de talent, puis réessaie.</small>`,()=>show('expe')))}
 P.append(row('💎 <b>Cristal de l’Éther</b> : expéditions et revanches',()=>show('expe')));
 return P}
// ---------- V4.6 : Cristal de l'Éther → expéditions (missions gagnées à rejouer, revanches des boss) ----------
function expe(P){
 P.append(el('p','v-empty','Rejoue une mission déjà gagnée : XP des monstres, moitié de l’or, 15 % de chance d’objet. Sans limite, sans obligation.'));
 const boss=ZONES.map((z,zi)=>({z,zi})).filter(o=>zoneDone(save,o.zi));
 if(boss.length){P.append(el('h4',null,'Revanches'));for(const{z,zi}of boss){const L=zlen(z),r=el('div','v-row');r.append(el('div',null,`<b>${z.boss.n}</b><small>${z.n} · ${'★'.repeat((save.st[z.id]||[])[L-1]||0)||'aucune étoile'}</small>`),wood('Affronter',()=>A.fight(zi,L-1),'sm'));P.append(r)}}
 P.append(el('h4',null,'Missions'));let any=0;
 ZONES.forEach((z,zi)=>{const done=Math.min(prog(z.id),zlen(z)-(zoneDone(save,zi)?1:0));if(!done)return;any=1;const r=el('div','v-card');r.append(el('b',null,z.n));const g=el('div','v-actions');
  for(let i=0;i<done;i++){const F=fightSpec(zi,i,0),b=wood(`${i+1}${F.goal==='survive'?' ⏳':F.goal==='chief'?' ♛':''} ${'★'.repeat((save.st[z.id]||[])[i]||0)}`,()=>A.fight(zi,i),'sm dk');b.setAttribute('aria-label',`${z.n}, mission ${i+1}`);g.append(b)}r.append(g);P.append(r)});
 if(!any)P.append(el('p','v-empty','Gagne ton premier combat pour ouvrir les expéditions.'))}
function open(id){if(id==='caserne'){show('heros');return}if(id==='entrainement'){show('entrainement');return}A[{forge:'forge',marchand:'shop',taverne:'tav',talents:'armes'}[id]]()}

// ---------- mise en place de la scène : les 6 bâtiments toujours visibles entre la barre du haut et le bas ----------
export function fitHome(){let S=$('vstage');if(!S||!root.classList.contains('on'))return;
 const W=root.clientWidth,H=root.clientHeight,top=root.querySelector('.v-top').getBoundingClientRect().bottom,D=root.querySelector('.v-dock').getBoundingClientRect();
 // on regarde où le CSS a vraiment mis le menu : sur un écran presque carré (Honor déplié), comparer largeur et hauteur
 // peut contredire le CSS, et le village prenait alors une taille négative (il disparaissait)
 const land=D.top<H*.3&&D.left>W*.3;
 // zone libre : au-dessus du bas en portrait, à gauche de la colonne en paysage
 const x1=land?D.left:W,y0=land?top-6:top+4,y1=land?H-16:D.top-6;
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
// V4.7b : `from` = panneau d'où l'on vient (bouton ‹) ; `resume` = panneau à rouvrir au retour de l'Académie, la Forge ou le Marchand
let hero=0,back=null,resume=null,slotOpen=null,inv={who:-1,sl:'',sel:null};
export function show(t,from){const P=$('vpanel'),same=t===tab&&P.querySelector('.v-body'),scroll=same?same.scrollTop:0;
 if(from!==undefined)back=from;else if(t!==tab)back=null;tab=t;root.querySelectorAll('.v-nav button').forEach(b=>b.classList.toggle('on',b.dataset.tab===(t==='reglages'?'camp':t)));
 P.innerHTML='';P.classList.toggle('on',t!=='camp');root.classList.toggle('paneled',t!=='camp');if(t==='camp')return;
 const titles={heros:'Héros',inventaire:'Inventaire',quetes:'Quêtes',reglages:'Réglages',expe:'Cristal de l’Éther',entrainement:'Entraînement'};
 const head=el('div','v-head',`<h2>${titles[t]}</h2>`),x=el('button','v-x','✕');x.setAttribute('aria-label','Fermer');x.onclick=()=>show('camp');head.append(x);
 if(back){const to=back,r=el('button','v-x v-ret','‹');r.setAttribute('aria-label','Retour : '+titles[to]);r.onclick=()=>show(to,null);head.append(r)}P.append(head);
 const body=el('div','v-body');P.append(body);({heros,inventaire,quetes,reglages,expe,entrainement})[t](body);body.scrollTop=scroll}
// ouvrir un écran plein (Académie, Forge, Marchand) depuis un panneau : son bouton Retour y ramène
const visit=fn=>()=>{resume=tab;fn()};
// clic dans la barre du bas : on repart de zéro (aucun filtre, aucun emplacement ouvert)
function fresh(t){slotOpen=null;inv={who:-1,sl:'',sel:null};show(t,null)}
const entrainement=P=>P.append(el('div','v-card','<b>Bientôt disponible</b><p class="v-how">Le terrain d’entraînement ouvrira avec les caractéristiques des héros, dans la version 4.7.</p>'));
const wood=(txt,fn,cls='')=>{const b=el('button','v-btn '+cls,txt);b.onclick=fn;return b};
const STAT={dmg:'dégâts',hp:'PV',heal:'soin'};
const bonus=j=>{const o=ITEMS[j],k=Object.keys(STAT).find(k=>o[k]);return`+${itemVal(o,k,upLvl(save,j),rarOf(save,j))} ${STAT[k]}`};
// V4.7a : comparaison avant/après, « PV 112 → 118 » (vert : gain, rouge : perte)
export const diffHTML=j=>compare(save,j).map(([n,a,b])=>`<span class="v-diff ${b>a?'up':'down'}">${n} ${a} → ${b}</span>`).join(' ')||'<span class="v-diff">aucun changement</span>';
function itemRow(j,who,again){const o=ITEMS[j],r=rarOf(save,j),row=el('div','v-row'),on=save.items.includes(j)&&isOn(save,j);row.append(icon('items',o.ic,42));
 row.append(el('div',null,`<b style="color:${RARE[r].c}">${o.n}</b><small>${who?HER[o.who].n+' · ':''}${SLOTS[o.sl]} · ${bonus(j)}${r?' · '+RARE[r].n:''}${upLvl(save,j)?` · forge ${upLvl(save,j)}`:''}<br>${on?'<b class="v-diff up">équipé</b>':'en réserve, sans effet · si équipé : '+diffHTML(j)}</small>`));
 if(!on)row.append(wood('Équiper',()=>{equip(save,j);store();again()},'sm'));return row}
function heros(P){
 const tabs=el('div','v-tabs');HER.forEach((h,i)=>{const b=el('button',i===hero?'on':'');b.append(icon(...heroFrame(h.k),44,.62),el('span',null,h.n));b.onclick=()=>{if(i!==hero)slotOpen=null;hero=i;show('heros')};tabs.append(b)});P.append(tabs);
 const cols=el('div','v-cols'),L=el('div','v-col'),R=el('div','v-col');cols.append(L,R);P.append(cols);
 const h=HER[hero],st=heroStats(save,hero),sp=specOf(save,hero),card=el('div','v-card v-sheet');
 const c=el('canvas');c.width=300;c.height=340;const[s,k]=heroFrame(h.k);drawF(c.getContext('2d'),s,k,150,326,310/AT[s][k][3]);card.append(c);
 card.append(el('div','v-stats',`<h3>${h.n}</h3><em>${h.cls}</em><dl><dt>Points de vie</dt><dd>${st.hp}</dd><dt>PA · PM</dt><dd>6 · ${st.tal.maxPM||3}</dd><dt>${hero===2?'Bonus de soin':'Bonus de dégâts'}</dt><dd>+${hero===2?st.heal:st.dmg}</dd><dt>Puissance</dt><dd>×${(st.mult*(st.tal.dmgMul||1)).toFixed(2)}</dd></dl>`));L.append(card);
 L.append(el('h4',null,'Équipement'),el('p','v-empty','Touche un emplacement pour changer d’objet.'));
 const g=gear(save,hero),G=el('div','v-slots');for(const sl in SLOTS){const j=g[sl],spare=save.items.filter(q=>ITEMS[q].who===hero&&ITEMS[q].sl===sl&&q!==j).length;
  const b=el('button','v-eq'+(j==null?' vide':'')+(slotOpen===sl?' sel':''));b.dataset.sl=sl;b.setAttribute('aria-expanded',slotOpen===sl);if(j!=null)b.append(icon('items',ITEMS[j].ic,40));
  b.append(el('span',null,`<i>${SLOTS[sl]}</i><b>${j!=null?ITEMS[j].n:'Vide'}</b>${j!=null?`<small>${bonus(j)}</small>`:''}`));if(spare){const u=el('u',null,'⇄ '+spare);u.title=spare+' en réserve';b.append(u)}
  b.onclick=()=>{slotOpen=slotOpen===sl?null:sl;show('heros');$('vpanel').querySelector('.v-pick')?.scrollIntoView({block:'nearest'})};G.append(b)}L.append(G);
 if(slotOpen){const own=save.items.filter(j=>ITEMS[j].who===hero&&ITEMS[j].sl===slotOpen).sort((a,b)=>isOn(save,b)-isOn(save,a)),box=el('div','v-pick');
  if(!own.length)box.append(el('p','v-empty',`${h.n} n’a aucun objet pour cet emplacement. On en gagne en combat ou chez le Marchand.`));
  for(const j of own)box.append(itemRow(j,0,()=>show('heros')));
  const act=el('div','v-actions');act.append(own.length?wood('Voir dans l’inventaire',()=>{inv={who:hero,sl:slotOpen,sel:g[slotOpen]};show('inventaire','heros')},'dk sm'):wood('Le Marchand',visit(A.shop),'sm'));box.append(act);L.append(box)}
 const tl=el('div','v-card v-row');tl.append(sp?icon(...sp.ic,42):icon('badge',3,42),el('div',null,`<b>${sp?sp.n:'Aucune spécialisation'}</b><small>${sp?sp.d:save.lvl<3?'S’ouvre au niveau 3.':'Choisis une voie pour ce héros.'}</small>`),wood('Académie',visit(A.armes),'sm'));R.append(tl);
 R.append(el('h4',null,'Sorts'));
 for(const id of[...h.sp,...(st.tal.add||[])]){const S={...A.SP[id],...st.tal.sp[id]},row=el('div','v-row');row.append(icon(...A.SPI[id],40),el('div',null,`<b>${S.n} <i>${S.pa} PA</i></b><small>${S.d}${S.dmg?` · ${S.dmg.join('–')} dégâts`:''}${S.heal?` · ${S.heal.join('–')} soins`:''}</small>`));R.append(row)}
}
// V4.7b : filtres par héros et par emplacement ; en filtrant, seuls les objets correspondants restent
function inventaire(P){
 const chips=(label,list,cur,set)=>{const r=el('div','v-chips');r.setAttribute('role','group');r.setAttribute('aria-label',label);for(const[v,n]of list){const b=el('button',v===cur?'on':'',n);b.setAttribute('aria-pressed',v===cur);b.onclick=()=>{set(v);inv.sel=null;show('inventaire')};r.append(b)}return r};
 const cols=el('div','v-cols'),L=el('div','v-col'),R=el('div','v-col');cols.append(L,R);
 P.append(el('p','v-count',`${save.items.length} objets sur ${ITEMS.length} · potions ${save.pot||0}/${POTION.max}`),cols);
 L.append(chips('Filtrer par héros',[[-1,'Tous'],...HER.map((h,i)=>[i,h.n])],inv.who,v=>inv.who=v),chips('Filtrer par emplacement',[['','Tout'],...Object.entries(SLOTS)],inv.sl,v=>inv.sl=v));
 const ids=ITEMS.map((o,j)=>j).filter(j=>(inv.who<0||ITEMS[j].who===inv.who)&&(!inv.sl||ITEMS[j].sl===inv.sl));
 if(!ids.includes(inv.sel))inv.sel=null;
 const grid=el('div','v-grid');for(const j of ids){const o=ITEMS[j],has=save.items.includes(j),b=el('button','v-slot'+(has?'':' off')+(inv.sel===j?' sel':''));b.dataset.item=j;b.append(icon('items',o.ic,54));b.setAttribute('aria-label',has?o.n:'Objet à découvrir');
  if(has){b.style.borderColor=RARE[rarOf(save,j)].c;if(upLvl(save,j))b.append(el('u',null,'+'+upLvl(save,j)));if(isOn(save,j))b.append(el('s',null,'✓'))}
  b.onclick=()=>{inv.sel=j;show('inventaire')};grid.append(b)}
 L.append(ids.length?grid:el('p','v-empty','Aucun objet ne correspond à ces filtres.'));
 const info=el('div','v-card'),j=inv.sel;
 if(j==null)info.innerHTML='<p class="v-empty">Touche un objet pour voir son effet. ✓ = équipé.</p>';
 else{const o=ITEMS[j];info.append(save.items.includes(j)?itemRow(j,1,()=>show('inventaire')):el('p','v-empty',`Objet à découvrir pour ${HER[o.who].n} (${SLOTS[o.sl]}).`));
  info.append(wood('Voir la fiche de '+HER[o.who].n,()=>{hero=o.who;slotOpen=o.sl;show('heros','inventaire')},'dk sm'))}
 R.append(info);
 const r=el('div','v-actions');r.append(wood('La Forge',visit(A.forge)),wood('Le Marchand',visit(A.shop),'dk'));R.append(r)}
function quetes(P){A.quests(P,()=>{build();fitHome();sonBtns();show('quetes')})}
function reglages(P){
 const r=el('div','v-actions');r.innerHTML=`<button class="v-btn dk son-m" data-act="son-m">♪ Musique</button><button class="v-btn dk son-s" data-act="son-s">🔊 Sons</button>`;P.append(r);sonBtns();
 const r2=el('div','v-actions'),fa=wood(save.fast?'⚡ Animations rapides : oui':'⚡ Animations rapides : non',()=>{save.fast=save.fast?0:1;SPEED.k=save.fast?.5:1;store();show('reglages')},'dk');r2.append(fa,wood('💾 Sauvegarde',A.saveDlg,'dk'),wood('Revoir le tutoriel',()=>A.tuto(),'dk'));P.append(r2);
 P.append(el('div','v-card v-how',A.HOW));
 const z=wood('Recommencer à zéro',()=>{if(z.dataset.arm){resetSave();A.reload()}else{z.dataset.arm=1;z.textContent='Touche encore pour tout effacer'}},'danger');P.append(z);
 P.append(el('p','v-ver',`Tactika · version ${VERSION} · maxlolfr`));
}

export function renderHome(actions){A=actions;SPEED.k=save.fast?.5:1;build();root.classList.add('on');fitHome();const r=resume;resume=null;show(r||'camp');sonBtns();store()}
addEventListener('resize',()=>{fitHome();setTimeout(fitHome,350)});
// la barre du navigateur intégré peut apparaître ou disparaître sans événement resize au retour d'un combat
if(window.ResizeObserver)new ResizeObserver(()=>fitHome()).observe($('camp'));
