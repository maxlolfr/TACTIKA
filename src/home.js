// Accueil (V3.1) : village peint interactif, barre du haut, « Partir à l'aventure », onglets Héros / Inventaire / Quêtes et réglages.
// Les écrans existants (forge, marchand…) et les actions viennent de ui.js par l'objet `A` (pas d'import circulaire).
import {$,SPEED} from './util.js';
import {HER,ITEMS,SLOTS,ZONES,POTION,RARE,ATTR,zlen,icOf,whoOf,whoName,SLOT_D,TEAM_SIZE,SLOTS_SP} from './data.js';
import {heroStats,xpNeed,upCost,upLvl,itemVal,rarOf,contracts,weaponOf,gear,isOn,equip,compare,fightSpec,zoneDone,crystalState,skyOf,SKIES,attrOf,ptsLeft,spendAttr,resetAttr,holder,fits,lvOf,teamOf,swapTeam,recruited,roster,knownSpells,loadoutOf,slotsOf,swapSpell} from './rules.js';
import {MON} from './data.js';
import {save,prog,unlocked,store,resetSave} from './save.js';
import {AT,icon,uiURL,logoURL,drawF,heroFrame,walkFrames,isVet} from './render.js';
import {setSon,sonBtns,sfx,voice,setVol,AU,VOLMAX} from './audio.js';
import {specOf} from './talents.js';
import {masteredFor,rankOf} from './mastery.js';

export const VERSION='4.50';
const el=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e};
// Deux peintures du village (V4.6.1 : six bâtiments). Positions en pixels « logiques » de la scène (l'image réelle est plus grande).
// bâtiments : zone tactile z [x,y,largeur,hauteur], plaque l [x,y] au pied
// lumières glow [x,y,rayon,genre] : l lanterne, w fenêtre, f feu, m magie ; camp : héros [x,y des pieds, héros, miroir]
// box : partie utile à garder visible [largeur, hauteur, centre x, centre y]
// cry : calque du cristal [centre x, bas y] ; ck : échelle des états 1 à 4 puis du 5e (un peu réduit pour ne pas cacher les voisins)
const INFO={caserne:{ic:['items',5],n:'Caserne',d:'Tes héros'},taverne:{ic:['items',17],n:'Taverne',d:'Contrats et défi'},
 forge:{ic:['ficon',0],n:'Forge',d:'Améliorer'},marchand:{ic:['items',15],n:'Marchand',d:'Acheter, vendre'},
 entrainement:{ic:['spells',0],n:'Entraînement',d:'Caractéristiques'},talents:{ic:['ui',12],n:'Académie',d:'Talents'}};
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
 l:{src:'assets/village-paysage.webp',w:1536,h:1030,box:[810,880,700,535],hero:[100,122],
  npc:108,pnj:{caserne:[742,352,true],taverne:[815,396,false],forge:[708,614,true],marchand:[842,614,false],entrainement:[312,846,false],talents:[1125,938,true]},
  bld:place({caserne:[[495,105,230,235],[608,340]],taverne:[[800,175,270,195],[940,368]],forge:[[470,390,235,215],[578,605]],marchand:[[850,405,225,200],[978,600]],
   entrainement:[[225,625,420,255],[430,862]],talents:[[865,610,265,345],[982,932]]}),
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
// V4.10 : village vivant (décor seulement). Images `tools/prep_vie.py` : [largeur, hauteur d'une case, nombre de poses]
const VIE={chat:[149,152,3],chien:[146,153,3],poule:[125,142,3],mesange:[126,142,4],fermier:[194,302,1],villageoise:[170,292,1],
 banc:[300,263,1],banniere:[158,300,1],charrette:[300,294,1],fontaine:[285,300,1],lanterne:[197,300,1],trophee:[197,300,1]};
// [nom, x, y des pieds, hauteur, miroir] en pixels logiques de chaque peinture ; le trophée apparaît après la première région terminée
const PLACES={
 p:[['fontaine',468,722,150],['banc',322,722,92,true],['banniere',255,712,122],['fermier',345,790,132],['villageoise',575,792,128,true],
  ['poule',318,642,56],['poule',372,622,50,true],['chat',618,695,64,true],['chien',262,1100,80],['charrette',715,1105,128],['lanterne',405,1285,128],
  ['mesange',335,668,40],['trophee',165,668,104]],
 l:[['fontaine',765,452,100],['banc',400,556,64],['banniere',742,300,80],['fermier',420,602,96],['villageoise',1105,668,92,true],
  ['poule',300,590,36],['poule',348,612,32,true],['chat',1068,400,40,true],['chien',610,780,50],['charrette',1150,732,92,true],['lanterne',335,720,96],
  ['mesange',410,528,24],['trophee',470,372,70]]};
function life(stage,Q,k,pc){
 const add=(n,x,y,h,flip,cls)=>{const[w0,h0,poses]=VIE[n],w=h*w0/h0,e=el('i',`v-vie ${cls||n}${flip?' flip':''}`);e.dataset.vie=n;e.style.cssText=pc(x-w/2,y-h,w,h);
  const im=el('i');im.style.cssText=`background-image:url(assets/vie/${n}.webp);background-size:${poses*100}% 100%;animation-delay:${-((x+y)%97)/9}s`;e.append(im);stage.append(e)};
 for(const[n,x,y,h,flip]of[...PLACES[k]].sort((a,b)=>a[2]-b[2]))if(n!=='trophee'||ZONES.some((_,i)=>zoneDone(save,i)))add(n,x,y,h,flip);
 add('mesange',0,Q.h*(k==='p'?.2:.16),k==='p'?44:34,false,'vol'); // elle traverse le ciel de temps en temps
}
let tab='camp',A=null,root=null;
const today=()=>A.today();
// ---------- notifications ----------
const forgeNews=()=>save.items.some(j=>{const c=upCost(save,j);return c!=null&&save.gold>=c});
const talentNews=()=>save.lvl>=3&&roster(save).some(i=>!save.sp[i]);
const trainNews=()=>roster(save).some(i=>ptsLeft(save,i)>0);
const claimable=()=>contracts(save,today()).filter(t=>t.p>=t.n&&!t.c).length;
const NEWS={forge:()=>forgeNews()?'↑':0,talents:()=>talentNews()?'!':0,taverne:()=>claimable()||(save.dd!==today()?'!':0),
 marchand:()=>0,caserne:()=>0,entrainement:()=>trainNews()?'+':0};
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
 stage.dataset.sky=skyOf(save.sky,new Date().getHours());
 life(stage,Q,k,pc);
 // Cristal de l'Éther → Expéditions
 {const st=crystalState(save),[w,h]=CRY[st-1].map(v=>v*Q.ck[st===5?1:0]);
  const c=el('button','v-cry',`<img src="assets/cry/crystal${st}.webp" alt=""><i class="v-cry-glow"></i>`);c.style.cssText=pc(Q.cry[0]-w/2,Q.cry[1]-h,w,h);c.dataset.state=st;c.setAttribute('aria-label','Cristal de l’Éther : expéditions, revanches');
  const p=el('span','v-plate',`<span><b>Cristal</b><small>Expéditions</small></span>`);p.prepend(icon('ico',0,28));c.append(p);c.onclick=()=>show('expe');stage.append(c)}
 // héros : leur poste est autour du feu, ils vont faire un tour puis reviennent (V4.8b)
 // V4.33 : les 3 places du feu reviennent à l'équipe de combat (W.i = héros, W.p = place)
 const walkers=Q.camp.map(([x,y,p,flip])=>{const i=teamOf(save)[p],[hw,hh]=Q.hero,b=el('button','v-hero');b.setAttribute('aria-label',`${HER[i].n} : voir la fiche`);
  const c=el('canvas');c.width=260;c.height=316;c.style.animationDelay=-i*.9+'s';b.append(c);b.onclick=()=>{hero=i;show('heros')};stage.append(b);
  const W={i,p,b,g:c.getContext('2d'),path:[[x,y],...Q.walk[p]],flip,x,y,at:0,dir:1,wait:1.5+i*4.5,t:0,key:''};place1(Q,W);paint(W);return W});
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
 const key=s+k+flip;if(key===W.key)return;W.key=key;W.b.classList.toggle('walk',!!walk);W.b.classList.toggle('glide',!!walk&&!!(isVet()||HER[W.i].k==='mage'));W.g.clearRect(0,0,260,316);drawF(W.g,s,k,130,300,284/ref,flip)}
// avance un héros de dt secondes ; vitesse proportionnelle à sa taille dans la peinture
function step(Q,W,dt){
 if(W.wait>0){W.wait-=dt;return}
 const next=W.path[W.at+W.dir],dx=next[0]-W.x,dy=next[1]-W.y,d=Math.hypot(dx,dy),v=Q.hero[1]*.5*dt;W.t+=dt;
 const way={back:dy<0,left:dx<0};
 if(d>v){W.x+=dx/d*v;W.y+=dy/d*v;paint(W,way)}
 else{[W.x,W.y]=next;W.at+=W.dir;
  if(W.at===W.path.length-1||W.at===0){const home=W.at===0;W.dir=home?1:-1;W.wait=home?6+Math.random()*8:3+Math.random()*3;if(!home)W.flip=way.left;else W.flip=Q.camp[W.p][3];W.t=0;paint(W)}}
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
 P.append(el('h4',null,'Équipe'));teamOf(save).forEach(i=>{const h=HER[i],st=heroStats(save,i),w=weaponOf(save,i);const r=row(`<b>${h.n}</b> <small>${st.hp} PV${w!=null?' · '+ITEMS[w].n:''}</small>`,()=>{hero=i;show('heros')});r.prepend(icon(...heroFrame(h.k),30,.55));P.append(r)});
 const todo=[[recruited(save,3)&&!save.orionVu,'Orion a rejoint le camp : choisis ton équipe','recrue'],[talentNews(),'Choisir une spécialisation','talents'],[trainNews(),'Points de caractéristiques à répartir','entrainement'],[forgeNews(),'Amélioration abordable à la Forge','forge'],[claimable(),'Contrat à réclamer à la Taverne','taverne'],[save.dd!==today(),'Défi du jour disponible','taverne'],[(save.pot||0)<POTION.max,`Potions ${save.pot||0}/${POTION.max}`,'marchand']].filter(t=>t[0]);
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
 ZONES.forEach((z,zi)=>{const done=Math.min(prog(z.id),zlen(z)-(zoneDone(save,zi)?1:0));if(!done)return;any=1;const r=el('div','v-card');r.append(el('b',null,z.n));const g=el('div','v-actions v-mgrid');
  for(let i=0;i<done;i++){const F=fightSpec(zi,i,0),b=wood(`${i+1}${F.goal==='survive'?' ⏳':F.goal==='chief'?' ♛':''} ${'★'.repeat((save.st[z.id]||[])[i]||0)}`,()=>A.fight(zi,i),'sm dk');b.setAttribute('aria-label',`${z.n}, mission ${i+1}`);g.append(b)}r.append(g);P.append(r)});
 if(!any)P.append(el('p','v-empty','Gagne ton premier combat pour ouvrir les expéditions.'))}
function open(id){if(id==='recrue'){save.orionVu=1;store();hero=3;show('heros');return}if(id==='caserne'){show('heros');return}if(id==='entrainement'){show('entrainement');return}A[{forge:'forge',marchand:'shop',taverne:'tav',talents:'armes'}[id]]()}

// ---------- mise en place de la scène : les 6 bâtiments toujours visibles entre la barre du haut et le bas ----------
export function fitHome(){let S=$('vstage');if(!S||!root.classList.contains('on'))return;
 const W=root.clientWidth,H=root.clientHeight,top=root.querySelector('.v-top').getBoundingClientRect().bottom,D=root.querySelector('.v-dock').getBoundingClientRect();
 // on regarde où le CSS a vraiment mis le menu : sur un écran presque carré (Honor déplié), comparer largeur et hauteur
 // peut contredire le CSS, et le village prenait alors une taille négative (il disparaissait)
 const land=D.top<H*.3&&D.left>W*.3;
 // zone libre : au-dessus du bas en portrait, à gauche de la colonne en paysage
 const x1=land?D.left:W,y0=land?top-6:top+4,y1=land?H-16:D.top-6;
 if(!W||!H)return;
 // menu en colonne et zone libre au moins presque carrée : peinture horizontale (V4.30 : écrans pliants ouverts) ; sinon la verticale
 const k=land&&x1>(y1-y0)*.8?'l':'p';
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
let hero=0,back=null,resume=null,slotOpen=null,inv={who:-1,sl:'',sel:null},draft={},resetArm=0; // draft : points choisis mais pas encore confirmés
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
function fresh(t){draft={};slotOpen=null;inv={who:-1,sl:'',sel:null};show(t,null)}
// V4.7c : Entraînement. On prépare la répartition (− et +), on voit l'effet, puis on confirme ; redistribution gratuite.
const pct=v=>Math.round(v*1000)/10+' %';
function preview(i,add){const A=attrOf(save,i);for(const k in add)A[k]+=add[k];const all=HER.map((_,j)=>attrOf(save,j));all[i]=A;
 const a=heroStats(save,i),b=heroStats({...save,attr:all},i);
 return[['PV',a.hp,b.hp],['Puissance','×'+a.mult.toFixed(2),'×'+b.mult.toFixed(2)],['Critique',pct(a.crit),pct(b.crit)],['Esquive',pct(a.dodge),pct(b.dodge)]]}
function entrainement(P){
 const tabs=el('div','v-tabs');roster(save).forEach(i=>{const h=HER[i],b=el('button',i===hero?'on':'');const n=ptsLeft(save,i);b.append(icon(...heroFrame(h.k),44,.62),el('span',null,h.n));if(n)b.append(el('u','v-badge',n));b.onclick=()=>{if(i!==hero){draft={};resetArm=0}hero=i;show('entrainement')};tabs.append(b)});P.append(tabs);
 const used=Object.values(draft).reduce((a,b)=>a+b,0),free=ptsLeft(save,hero)-used,A=attrOf(save,hero),cols=el('div','v-cols'),L=el('div','v-col'),R=el('div','v-col'+(used?' v-dock-prev':''));cols.append(L,R);
 P.append(el('p','v-count',`${free} point${free>1?'s':''} à répartir · 1 point par niveau et par héros`),cols);
 for(const k in ATTR){const o=ATTR[k];if(!o.who.includes(hero))continue;const add=draft[k]||0,row=el('div','v-row v-attr');row.dataset.attr=k;
  row.append(el('div',null,`<b>${o.n} <i>${A[k]}${add?` + ${add}`:''}</i></b><small>${o.d}</small>`));
  const step=(t,d,ok,label)=>{const b=wood(t,()=>{draft[k]=add+d;if(!draft[k])delete draft[k];resetArm=0;show('entrainement')},'sm v-step');b.disabled=!ok;b.setAttribute('aria-label',`${label} un point en ${o.n}`);return b};
  row.append(step('−',-1,add>0,'Retirer'),step('+',1,free>0,'Ajouter'));L.append(row)}
 L.append(el('p','v-empty','Au-delà de 10 points dans une caractéristique, chaque point compte pour moitié ; au-delà de 20, pour un quart.'));
 const box=el('div','v-card v-prev');box.innerHTML=`<b>${used?'Aperçu':'Valeurs actuelles'}</b><dl>${preview(hero,draft).map(([n,a,b])=>`<dt>${n}</dt><dd>${a===b?a:`${a} → <em>${b}</em>`}</dd>`).join('')}</dl>`;R.append(box);
 const act=el('div','v-actions'),ok=wood('Confirmer',()=>{if(spendAttr(save,hero,draft)){store();sfx('buff',.7)}draft={};show('entrainement')}),no=wood('Annuler',()=>{draft={};show('entrainement')},'dk');
 ok.disabled=no.disabled=!used;act.append(ok,no);R.append(act);
 if(Object.values(A).some(v=>v)){const z=wood(resetArm?'Touche encore pour redistribuer':'Redistribuer (gratuit)',()=>{if(!resetArm){resetArm=1;show('entrainement');return}resetArm=0;draft={};resetAttr(save,hero);store();show('entrainement')},'dk sm');R.append(z)}
 if(save.lvl<2)R.append(el('p','v-empty','Le premier point arrive au niveau 2.'))}
const wood=(txt,fn,cls='')=>{const b=el('button','v-btn '+cls,txt);b.onclick=fn;return b};
const STAT={dmg:'dégâts',hp:'PV',heal:'soin'};
const bonus=j=>{const o=ITEMS[j],k=Object.keys(STAT).find(k=>o[k]);return`+${itemVal(o,k,upLvl(save,j),rarOf(save,j))} ${STAT[k]}`};
// V4.7a : comparaison avant/après, « PV 112 → 118 » (vert : gain, rouge : perte)
export const diffHTML=(j,i)=>compare(save,j,i).map(([n,a,b])=>`<span class="v-diff ${b>a?'up':'down'}">${n} ${a} → ${b}</span>`).join(' ')||'<span class="v-diff">aucun changement</span>';
// V4.12 : i = héros de la fiche (sinon, tous les héros compatibles : choix explicite du porteur d'un objet partagé)
function itemRow(j,who,again,i){const o=ITEMS[j],r=rarOf(save,j),row=el('div','v-row'),h=save.items.includes(j)?holder(save,j):-1,multi=whoOf(o).length>1,lock=lvOf(j)>save.lvl;
 const to=i==null?whoOf(o).filter(k=>k!==h&&recruited(save,k)):h===i?[]:[i];row.append(icon(...icOf(o),42));
 const st=(h>=0&&(i==null||h===i)?`<b class="v-diff up">équipé${multi?' sur '+HER[h].n:''}</b>`:h>=0?`porté par ${HER[h].n}`:'en réserve, sans effet')+
  (!to.length?'':lock?` · <b>niveau ${o.lv} requis</b>`:' · '+to.map(k=>(multi?HER[k].n+' : ':'si équipé : ')+diffHTML(j,k)).join(' · '));
 row.append(el('div',null,`<b style="color:${RARE[r].c}">${o.n}</b><small>${who||multi?whoName(o)+' · ':''}${SLOTS[o.sl]} · ${bonus(j)}${r?' · '+RARE[r].n:''}${upLvl(save,j)?` · forge ${upLvl(save,j)}`:''}${o.lv>1?` · niv. ${o.lv}`:''}<br>${st}</small>`));
 if(!lock&&to.length>1)row.classList.add('multi');
 if(!lock)for(const k of to)row.append(wood(multi&&i==null?'Équiper sur '+HER[k].n:'Équiper',()=>{equip(save,j,k);store();again()},'sm'));return row}
function heros(P){
 const tabs=el('div','v-tabs');roster(save).forEach(i=>{const h=HER[i],b=el('button',i===hero?'on':'');b.append(icon(...heroFrame(h.k),44,.62),el('span',null,h.n+(roster(save).length>TEAM_SIZE&&!teamOf(save).includes(i)?'<br><small>réserve</small>':'')));b.onclick=()=>{if(i!==hero){slotOpen=null;draft={}}hero=i;show('heros')};tabs.append(b)});P.append(tabs);
 const cols=el('div','v-cols'),L=el('div','v-col'),R=el('div','v-col');cols.append(L,R);P.append(cols);
 const h=HER[hero],st=heroStats(save,hero),sp=specOf(save,hero),card=el('div','v-card v-sheet');
 const c=el('canvas');c.width=300;c.height=340;const[s,k]=heroFrame(h.k);drawF(c.getContext('2d'),s,k,150,326,310/AT[s][k][3]);card.append(c);
 card.append(el('div','v-stats',`<h3>${h.n}</h3><em>${h.cls}</em><dl><dt>Points de vie</dt><dd>${st.hp}</dd><dt>PA · PM</dt><dd>6 · ${st.tal.maxPM||3}</dd><dt>${hero===2?'Bonus de soin':'Bonus de dégâts'}</dt><dd>+${hero===2?st.heal:st.dmg}</dd><dt>Puissance</dt><dd>×${(st.mult*(st.tal.dmgMul||1)).toFixed(2)}</dd><dt>Critique · esquive</dt><dd>${pct(st.crit)} · ${pct(st.dodge)}</dd></dl>`));L.append(card);
 // V4.33 : choix de l'équipe quand il y a plus de héros que de places
 if(roster(save).length>TEAM_SIZE){const team=teamOf(save),inside=team.includes(hero),box=el('div','v-card v-team');
  box.append(el('p','v-empty',inside?`<b>Dans l’équipe de combat</b> : ${team.map(i=>HER[i].n).join(', ')}.`:`<b>${h.n} est en réserve.</b> Le faire entrer à la place de :`));
  if(!inside){const a=el('div','v-actions');for(const i of team)a.append(wood(HER[i].n,()=>{swapTeam(save,i,hero);store();show('heros')},'sm'));box.append(a)}L.append(box)}
 L.append(el('h4',null,'Équipement'),el('p','v-empty','Touche un emplacement pour changer d’objet.'));
 const g=gear(save,hero),G=el('div','v-slots');for(const sl in SLOTS){const j=g[sl],spare=save.items.filter(q=>fits(q,hero)&&ITEMS[q].sl===sl&&q!==j).length;
  const b=el('button','v-eq'+(j==null?' vide':'')+(slotOpen===sl?' sel':''));b.dataset.sl=sl;b.setAttribute('aria-expanded',slotOpen===sl);if(j!=null)b.append(icon(...icOf(ITEMS[j]),40));
  b.append(el('span',null,`<i>${SLOTS[sl]}</i><b>${j!=null?ITEMS[j].n:'Vide'}</b>${j!=null?`<small>${bonus(j)}</small>`:''}`));if(spare){const u=el('u',null,'⇄ '+spare);u.title=spare+' en réserve';b.append(u)}
  b.onclick=()=>{slotOpen=slotOpen===sl?null:sl;show('heros');$('vpanel').querySelector('.v-pick')?.scrollIntoView({block:'nearest'})};G.append(b)}L.append(G);
 if(slotOpen){const own=save.items.filter(j=>fits(j,hero)&&ITEMS[j].sl===slotOpen).sort((a,b)=>(holder(save,b)===hero)-(holder(save,a)===hero)),box=el('div','v-pick');
  box.append(el('p','v-empty',`Un seul objet à la fois : ${SLOT_D[slotOpen]}.`));
  if(!own.length)box.append(el('p','v-empty',`${h.n} n’a aucun objet pour cet emplacement. On en gagne en combat ou chez le Marchand.`));
  for(const j of own)box.append(itemRow(j,0,()=>show('heros'),hero));
  const act=el('div','v-actions');act.append(own.length?wood('Voir dans l’inventaire',()=>{inv={who:hero,sl:slotOpen,sel:g[slotOpen]};show('inventaire','heros')},'dk sm'):wood('Le Marchand',visit(A.shop),'sm'));box.append(act);L.append(box)}
 const tl=el('div','v-card v-row');tl.append(sp?icon(...sp.ic,42):icon('badge',3,42),el('div',null,`<b>${sp?sp.n:'Aucune spécialisation'}</b><small>${sp?sp.d:save.lvl<3?'S’ouvre au niveau 3.':'Choisis une voie pour ce héros.'}</small>`));tl.append(wood('Académie',visit(A.armes),'sm'));R.append(tl);
 {const n=ptsLeft(save,hero),a=attrOf(save,hero),tr=el('div','v-card v-row');tr.append(icon('spells',0,42),el('div',null,`<b>${n?`${n} point${n>1?'s':''} à répartir`:'Caractéristiques'}</b><small>${Object.keys(ATTR).filter(k=>ATTR[k].who.includes(hero)).map(k=>ATTR[k].n+' '+a[k]).join(' · ')}</small>`),wood('Entraînement',()=>{draft={};show('entrainement','heros')},'sm'));R.append(tr)}
 if(h.learn)return learnList(R,h,st.tal);
 R.append(el('h4',null,'Sorts'));
 for(const id of[...h.sp,...(h.sp5?[h.sp5]:[]),...(st.tal.add||[])]){const S={...A.SP[id],...st.tal.sp[id]},lock=id===h.sp5&&save.lvl<5,row=el('div','v-row'+(lock?' v-lock':''));row.append(icon(...A.SPI[id],40),el('div',null,`<b>${S.n} <i>${S.pa} PA</i></b><small>${S.d}${S.dmg?` · ${S.dmg.join('–')} dégâts`:''}${S.heal?` · ${S.heal.join('–')} soins`:''}${S.cd?` · recharge ${S.cd} tours`:''}${lock?' · <b>s’ouvre au niveau 5</b>':''}</small>`));R.append(row)}
}
// V4.37 : héros à apprentissage (Orion) : sorts emportés, sorts en réserve (échange en deux touches), sorts à venir
let incoming=null;
function learnList(R,h,tal){const i=hero,load=loadoutOf(save,i),known=knownSpells(save,i),rest=known.filter(id=>!load.includes(id)),later=h.learn.filter(([id])=>!known.includes(id));
 if(!rest.includes(incoming))incoming=null;
 const line=(id,note,btn,cls='')=>{const S=masteredFor(save,i,id,{...A.SP[id],...tal.sp[id]}),rk=rankOf(save,i,id),row=el('div','v-row v-spell'+cls);row.dataset.sp=id;row.append(icon(...A.SPI[id],40),el('div',null,`<b>${S.n} <i>${S.pa} PA</i></b><small>${S.d}${S.dmg?` · ${S.dmg.join('–')} dégâts${S.k>1?` +${Math.round((S.k-1)*100)} %`:''}`:''}${rk>1?` · maîtrise rang ${rk>2?'III':'II'}`:''}${S.cd?S.cd>50?' · 1 fois par combat':` · recharge ${S.cd} tours`:''}${note||''}</small>`));if(btn)row.append(btn);R.append(row)};
 R.append(el('h4',null,`Sorts emportés · ${load.length}/${slotsOf(save,i)}`));
 for(const id of tal.add||[])line(id,' · sort de talent, toujours emporté',null);
 if(incoming)R.append(el('p','v-empty',`<b>${A.SP[incoming].n}</b> : touche « Remplacer » sur le sort à laisser au camp.`));
 for(const id of load)line(id,'',incoming&&wood('Remplacer',()=>{swapSpell(save,i,id,incoming);incoming=null;store();show('heros')},'sm'));
 if(rest.length){R.append(el('h4',null,'En réserve'));for(const id of rest)line(id,'',wood(incoming===id?'Annuler':'Emporter',()=>{incoming=incoming===id?null:id;show('heros')},incoming===id?'dk sm':'sm'))}
 if(later.length){R.append(el('h4',null,'À apprendre'));for(const[id,l]of later)line(id,` · <b>au niveau ${l}</b>`,null,' v-lock')}}
// V4.7b : filtres par héros et par emplacement ; en filtrant, seuls les objets correspondants restent
function inventaire(P){
 const chips=(label,list,cur,set)=>{const r=el('div','v-chips');r.setAttribute('role','group');r.setAttribute('aria-label',label);for(const[v,n]of list){const b=el('button',v===cur?'on':'',n);b.setAttribute('aria-pressed',v===cur);b.onclick=()=>{set(v);inv.sel=null;show('inventaire')};r.append(b)}return r};
 const cols=el('div','v-cols'),L=el('div','v-col'),R=el('div','v-col');cols.append(L,R);
 P.append(el('p','v-count',`${save.items.length} objets sur ${ITEMS.length} · potions ${save.pot||0}/${POTION.max}`),cols);
 L.append(chips('Filtrer par héros',[[-1,'Tous'],...roster(save).map(i=>[i,HER[i].n])],inv.who,v=>inv.who=v),chips('Filtrer par emplacement',[['','Tout'],...Object.entries(SLOTS)],inv.sl,v=>inv.sl=v));
 const ids=ITEMS.map((o,j)=>j).filter(j=>(inv.who<0||fits(j,inv.who))&&(!inv.sl||ITEMS[j].sl===inv.sl));
 if(!ids.includes(inv.sel))inv.sel=null;
 const grid=el('div','v-grid');for(const j of ids){const o=ITEMS[j],has=save.items.includes(j),b=el('button','v-slot'+(has?'':' off')+(inv.sel===j?' sel':''));b.dataset.item=j;b.append(icon(...icOf(o),54));b.setAttribute('aria-label',has?o.n:'Objet à découvrir');
  if(has){b.style.borderColor=RARE[rarOf(save,j)].c;if(upLvl(save,j))b.append(el('u',null,'+'+upLvl(save,j)));if(isOn(save,j))b.append(el('s',null,'✓'))}
  b.onclick=()=>{inv.sel=j;show('inventaire')};grid.append(b)}
 L.append(ids.length?grid:el('p','v-empty','Aucun objet ne correspond à ces filtres.'));
 const info=el('div','v-card'),j=inv.sel;
 if(j==null)info.innerHTML='<p class="v-empty">Touche un objet pour voir son effet. ✓ = équipé.</p>';
 else{const o=ITEMS[j],h=save.items.includes(j)?holder(save,j):-1,f=h>=0?h:whoOf(o)[0];info.append(save.items.includes(j)?itemRow(j,1,()=>show('inventaire')):el('p','v-empty',`Objet à découvrir pour ${whoName(o)} (${SLOTS[o.sl]}${o.lv>1?`, niveau ${o.lv}`:''}).`));
  info.append(wood('Voir la fiche de '+HER[f].n,()=>{hero=f;slotOpen=o.sl;show('heros','inventaire')},'dk sm'))}
 R.append(info);
 const r=el('div','v-actions');r.append(wood('La Forge',visit(A.forge)),wood('Le Marchand',visit(A.shop),'dk'));R.append(r)}
function quetes(P){A.quests(P,()=>{build();fitHome();sonBtns();show('quetes')})}
const SKY_TXT={auto:'selon l’heure',jour:'jour',soir:'soir',nuit:'nuit'};
function reglages(P){
 const r=el('div','v-actions');r.innerHTML=`<button class="v-btn dk son-m" data-act="son-m">♪ Musique</button><button class="v-btn dk son-s" data-act="son-s">🔊 Sons</button>`;P.append(r);sonBtns();
 for(const[k,n]of[['m','Volume musique'],['s','Volume bruitages'],['v','Volume voix']]){const l=el('label','v-vol',`<span>${n}</span><input type="range" min="0" max="${VOLMAX}" step="5" value="${AU.vol[k]}"><b>${AU.vol[k]} %</b>`),i=l.querySelector('input');
  i.oninput=()=>{setVol(k,i.value);l.querySelector('b').textContent=i.value+' %'};if(k==='s')i.onchange=()=>sfx('coin');if(k==='v')i.onchange=()=>voice('warrior','start',{force:true});P.append(l)}
 const r2=el('div','v-actions v-wrap'),fa=wood(save.fast?'⚡ Animations rapides : oui':'⚡ Animations rapides : non',()=>{save.fast=save.fast?0:1;SPEED.k=save.fast?.5:1;store();show('reglages')},'dk');r2.append(fa,wood(`🌗 Village : ${SKY_TXT[save.sky||'auto']}`,()=>{save.sky=SKIES[(SKIES.indexOf(save.sky||'auto')+1)%SKIES.length];store();root.querySelector('.v-stage').dataset.sky=skyOf(save.sky,new Date().getHours());show('reglages')},'dk'),wood('💾 Sauvegarde',A.saveDlg,'dk'),wood('Revoir le tutoriel',()=>A.tuto(),'dk'));P.append(r2);
 P.append(el('div','v-card v-how',A.HOW));
 const z=wood('Recommencer à zéro',()=>{if(z.dataset.arm){resetSave();A.reload()}else{z.dataset.arm=1;z.textContent='Touche encore pour tout effacer'}},'danger');P.append(z);
 P.append(el('p','v-ver',`Tactika · version ${VERSION} · maxlolfr`));
}

export function renderHome(actions){A=actions;SPEED.k=save.fast?.5:1;build();root.classList.add('on');fitHome();const r=resume;resume=null;show(r||'camp');sonBtns();store()}
addEventListener('resize',()=>{fitHome();setTimeout(fitHome,350)});
// la barre du navigateur intégré peut apparaître ou disparaître sans événement resize au retour d'un combat
if(window.ResizeObserver)new ResizeObserver(()=>fitHome()).observe($('camp'));
