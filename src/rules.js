// Règles du combat : aucune dépendance au navigateur (ni DOM, ni canvas, ni son, ni horloge).
// Tout l'état d'un combat vit dans un objet `s` (voir newBattle). Les fonctions qui changent
// quelque chose renvoient des « événements » que l'affichage rejoue (texte, effet, son…).
import {DIRS,R,CMAX,THEMES,HER,MON,ITEMS,SP,PUSH_DMG,COMBO,STAR_ROUNDS,PA_RULE,FORGE_COST,FORGE_STEP,POTION,SHOP_N,SELL_K,ZONES,RARE,zlen,AMP,PRISM,PRISM_OFF,LOW,PA_CARRY,SLOTS,ATTR,CRIT_CAP,DODGE_CAP,LAVA_DMG,CURSE_K,SP5_LVL,TEAM_SIZE,DEF_TEAM,SLOTS_SP,ALL_SPELLS,whoOf} from './data.js';
import {mastered} from './mastery.js'; // V4.39
import {talentFx} from './talents.js';

export const K=(x,y)=>x+','+y;
export const man=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
export function mulberry(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
export const ri=(rng,a,b)=>a+Math.floor(rng()*(b-a+1));
export const pick=(rng,a)=>a[Math.floor(rng()*a.length)];

// ---------- état et grille ----------
export const newBattle=(rng=Math.random)=>({map:new Map(),units:[],order:[],theme:null,rng,killedXp:0,round:1});
export const cell=(s,x,y)=>s.map.get(K(x,y));
export const occ=(s,x,y)=>s.units.find(u=>!u.dead&&u.x===x&&u.y===y);
export const passable=(s,x,y)=>{const c=cell(s,x,y);return !!c&&!c.block&&!c.water};

// Génère la carte (graine fixe = même carte) ; renvoie les cases de départ {hs,es}.
export function genMap(s,seed,th,cry){
 for(let tries=0;tries<40;tries++){
  const rng=s.rng=mulberry(seed+tries*31);s.theme=THEMES[th];const theme=s.theme;s.map=new Map();
  for(let r=0;r<=R;r++)for(let c=-CMAX;c<=CMAX;c++){if((r+c)&1)continue;const x=(r+c)/2,y=(r-c)/2;s.map.set(K(x,y),{x,y,t:pick(rng,theme.g)})}
  const all=[...s.map.values()];
  const hs=[[13,-3],[14,0],[13,3]].map(([r,c])=>({x:(r+c)/2,y:(r-c)/2}));
  const es=[[2,-4],[2,-2],[2,0],[2,2],[2,4],[3,-3],[3,-1],[3,1],[3,3],[4,0],[4,-2],[4,2]].map(([r,c])=>({x:(r+c)/2,y:(r-c)/2}));
  const safe=p=>[...hs,...es].some(q=>Math.abs(q.x-p.x)+Math.abs(q.y-p.y)<=1);
  for(let w=0;w<theme.water;w++){let p=pick(rng,all);for(let k=0;k<5;k++){const c=cell(s,p.x,p.y);if(c&&!safe(c)){c.water=1;c.t=4}const d=pick(rng,DIRS);p={x:p.x+d[0],y:p.y+d[1]}}}
  for(let w=0;w<(theme.rock||0);w++){let p=pick(rng,all);for(let k=0;k<3;k++){const c=cell(s,p.x,p.y);if(c&&!safe(c)){c.block=1;c.t=8}const d=pick(rng,DIRS);p={x:p.x+d[0],y:p.y+d[1]}}}
  // cristaux (V4.0b) : dans la bande du milieu, jamais près d'un départ ni collés l'un à l'autre, voisins praticables
  for(const[kind,n]of Object.entries(cry||{}))for(let k=0;k<n;k++){const ok=all.filter(c=>c.x+c.y>=5&&c.x+c.y<=11&&!c.water&&!c.block&&!safe(c)&&DIRS.every(d=>{const o=cell(s,c.x+d[0],c.y+d[1]);return o&&!o.cry&&!o.water}));
   if(ok.length){const c=pick(rng,ok);c.block=1;c.cry=kind;for(const d of DIRS){const o=cell(s,c.x+d[0],c.y+d[1]);delete o.block;delete o.d}}}
  for(const c of all){if(c.water||c.block||c.cry||safe(c))continue;if(rng()<.13){c.block=1;c.d=pick(rng,theme.obs)}else if(!theme.noflower&&rng()<.07)c.flower=1}
  // tous les ennemis doivent être joignables
  const seen=new Set([K(hs[1].x,hs[1].y)]),q=[hs[1]];
  while(q.length){const p=q.shift();for(const d of DIRS){const nx=p.x+d[0],ny=p.y+d[1],k=K(nx,ny);if(!seen.has(k)&&passable(s,nx,ny)){seen.add(k);q.push({x:nx,y:ny})}}}
  if([...hs,...es].every(p=>seen.has(K(p.x,p.y))))return{hs,es};
  if(tries===39){for(const c of s.map.values()){if(c.cry)continue;delete c.block;delete c.water;delete c.d;if(c.t===4||c.t===8)c.t=theme.g[0]}return{hs,es}} // secours : plateau dégagé
 }
}

// ---------- description d'un combat (carte, défi, simulateur) ----------
// V4.5f : toute mission de survie a des vagues ; par défaut 6 tours, 3 + 1/2/1 élite/2, plafond 6, élite = élite de la zone (chevalier) ou son monstre le plus robuste, et pas d'élite au départ
const defWave=(Z,i)=>({turns:6,cap:6,start:3,add:[[2,1],[3,2],[4,1,Z.elite?.[i]||[...Z.pool].sort((a,b)=>MON[b].hp-MON[a].hp)[0]],[5,2]]});
export function fightSpec(zi,i,seed){const Z=ZONES[zi],f=Z.fights?.[i]||{};
 const F={zi,i,lvl:f.lvl||Z.lvl+i,pool:Z.pool,boss:i===zlen(Z)-1?Z.boss:null,elite:Z.elite?.[i],en:f.en,cry:f.cry,tip:f.tip,
  lava:f.lava,goal:Z.fights?f.goal||null:zi&&i===1?'chief':zi&&i===2?'survive':null,seed,th:Z.th[i%Z.th.length]};
 if(F.goal==='survive')F.wave=Z.waves?.[i]||defWave(Z,i);return F}
export const zoneDone=(save,zi)=>((save.z&&save.z[ZONES[zi].id])||0)>=zlen(ZONES[zi]);
// V4.25 : la carte II s'ouvre quand la 6e région (Titan prismatique) est terminée
export const map2Open=save=>zoneDone(save,5);
// V4.6.1 : état du Cristal de l'Éther (1 à 5) selon les régions terminées : 0 → 1, 1 → 2, 2-3 → 3, 4-5 → 4, 6 et plus → 5
export const crystalState=save=>[1,2,3,3,4,4,5][Math.min(6,ZONES.filter((_,i)=>zoneDone(save,i)).length)];
// V4.9 : la Prairie passe de 4 à 10 étapes. Boss déjà battu = région toujours terminée (étoiles du boss déplacées à l'étape 10),
// sinon les étapes gagnées sont gardées. Une seule fois (save.p10), les étapes ajoutées d'une région terminée restent rejouables.
function grow(save,id,flag){if(save[flag])return save;save[flag]=1;if((save.z?.[id]||0)>=4){save.z[id]=10;const st=save.st?.[id];if(st&&st[3]){st[9]=st[3];st[3]=0}}return save}
export const migratePrairie=save=>grow(save,'prairie','p10');
// V4.14 : même règle pour le Bois sombre (4 → 10 étapes)
export const migrateBois=save=>grow(save,'bois','b10');
// V4.15 : et la Côte dorée
export const migrateCote=save=>grow(save,'plage','c10');
// V4.16 : et les Monts gris
export const migrateMonts=save=>grow(save,'mont','m10');
// V4.17 : et le Château en ruine
export const migrateChateau=save=>grow(save,'chateau','h10');
// V4.10 : lumière du village. Choix du joueur, sinon selon l'heure de l'appareil (jour 6-17 h, soir 17-20 h, nuit sinon)
export const SKIES=['auto','jour','soir','nuit'];
export const skyOf=(pref,h)=>SKIES.indexOf(pref)>0?pref:h>=6&&h<17?'jour':h>=17&&h<20?'soir':'nuit';
// ---------- progression ----------
export const xpNeed=l=>60*l;
// ---------- forge ----------
// Niveau d'amélioration d'un objet (0 à 3), valeur d'une caractéristique à un niveau donné, coût du niveau suivant (null = maximum).
export const upLvl=(save,j)=>(save.up&&save.up[j])||0;
export const itemVal=(o,k,l,r=0)=>o[k]?Math.round(o[k]*(1+FORGE_STEP*l)*RARE[r].k):0;
// V4.12 : rareté fixe des nouveaux objets (ITEMS[j].rr), sinon celle tirée au butin (save.rr) pour les 10 historiques
export const rarOf=(save,j)=>ITEMS[j]?.rr??((save.rr&&save.rr[j])||0);
export const fits=(j,i)=>whoOf(ITEMS[j]).includes(i);
export const lvOf=j=>ITEMS[j].lv||1;
// objets que le butin peut donner : non possédés, pas réservés au marchand, niveau atteint
export const lootPool=save=>ITEMS.map((_,j)=>j).filter(j=>!save.items.includes(j)&&ITEMS[j].src!=='shop'&&lvOf(j)<=(save.lvl||1));
export const lootRare=(j,rng,good)=>ITEMS[j].rr??rollRare(rng,good);
// rareté d'un objet trouvé : 70 % commun, 25 % rare, 5 % épique ; au moins rare pour un boss ou le défi du jour
export function rollRare(rng,good){const x=rng();return x<.05?2:good||x<.3?1:0}
export const upCost=(save,j)=>FORGE_COST[upLvl(save,j)]??null;
// Améliore l'objet j si possédé, pas au maximum et assez d'or. Renvoie le nouveau niveau, ou 0 si refusé.
export function upgrade(save,j){const c=upCost(save,j);if(!save.items.includes(j)||c==null||save.gold<c)return 0;
 save.gold-=c;(save.up||(save.up={}))[j]=upLvl(save,j)+1;return save.up[j]}
// ---------- marchand (V2.6a) ----------
// Stock du jour : SHOP_N objets non possédés, mélangés selon le jour (même stock toute la journée).
export function shopStock(save,day){const h=j=>((j+1)*2654435761+day*40503)%1000003;return ITEMS.map((_,j)=>j).filter(j=>!save.items.includes(j)&&ITEMS[j].src!=='loot'&&lvOf(j)<=(save.lvl||1)).sort((a,b)=>h(a)-h(b)).slice(0,SHOP_N)}
export function buy(save,j){const o=ITEMS[j];if(!o||save.items.includes(j)||save.gold<o.pr||o.src==='loot'||lvOf(j)>(save.lvl||1))return 0;save.gold-=o.pr;save.items.push(j);return 1}
// revente : moitié du prix + moitié de l'or mis dans la forge
export const sellPrice=(save,j)=>Math.round(SELL_K*(ITEMS[j].pr*(ITEMS[j].rr!=null?1:RARE[rarOf(save,j)].k)+FORGE_COST.slice(0,upLvl(save,j)).reduce((a,b)=>a+b,0)));
export function sell(save,j){if(!save.items.includes(j))return 0;const g=sellPrice(save,j);save.gold+=g;save.items=save.items.filter(x=>x!==j);if(save.up)delete save.up[j];if(save.rr)delete save.rr[j];return g}
export function buyPot(save){if((save.pot||0)>=POTION.max||save.gold<POTION.cost)return 0;save.gold-=POTION.cost;save.pot=(save.pot||0)+1;return 1}
// ---------- taverne (V2.6b) : 3 contrats par jour, tirés une fois puis gardés dans la sauvegarde ----------
// win : gagner n combats · kill : vaincre n monstres d'une espèce (zones ouvertes) · star : n victoires à 3 ★ · boss : vaincre un boss
export function contracts(save,day){if(save.ct&&save.ct.d===day)return save.ct.l;
 const r=mulberry(day*7919),open=ZONES.filter((z,i)=>i===0||zoneDone(save,i-1)),pool=[...new Set(open.flatMap(z=>z.pool))];
 const g=20+8*save.lvl,x=15*save.lvl,c=(o,k=1)=>({...o,g:Math.round(g*k),x:Math.round(x*k),p:0,c:0});
 const third=r()<.5&&ZONES.some((z,i)=>zoneDone(save,i))?c({k:'boss',n:1},1.5):c({k:'star',n:1+(r()<.3)},1.2);
 save.ct={d:day,l:[c({k:'win',n:2+ri(r,0,2)}),c({k:'kill',m:pick(r,pool),n:5+ri(r,0,4)}),third]};return save.ct.l}
// res : {win,st (étoiles),boss,kills:{espèce:nombre}}. Renvoie les contrats tout juste terminés.
export function ctUpdate(save,day,res){const done=[];if(!res.win)return done;
 for(const t of contracts(save,day)){if(t.c||t.p>=t.n)continue;
  t.p=Math.min(t.n,t.p+(t.k==='win'?1:t.k==='kill'?res.kills[t.m]||0:t.k==='star'?+(res.st===3):+!!res.boss));if(t.p>=t.n)done.push(t)}return done}
export function claim(save,day,i){const t=contracts(save,day)[i];if(!t||t.c||t.p<t.n)return 0;t.c=1;save.gold+=t.g;return 1+gainXp(save,t.x)}
// défi du jour : la zone ouverte la plus avancée, 4 niveaux au-dessus de son premier combat, sans boss
export function dailyFight(save,day){let zi=0;while(ZONES[zi+1]&&!ZONES[zi+1].soon&&zoneDone(save,zi))zi++;const Z=ZONES[zi];
 return{zi,i:-1,daily:1,lvl:Z.lvl+4,pool:Z.pool,boss:null,seed:day,th:Z.th[day%Z.th.length],cry:Z.id==='cristal'?{a:1,p:1}:undefined}}
// V4.7a : équipement du héros i, un objet par emplacement. Choix du joueur (save.eq, ou save.wpn d'avant la V4.7a pour l'arme)
// s'il possède encore l'objet ; sinon le meilleur possédé pour cet emplacement (à égalité, les PV d'abord).
const score=(save,j)=>{const o=ITEMS[j],v=k=>itemVal(o,k,upLvl(save,j),rarOf(save,j));return v('hp')+2.9*(v('dmg')+v('heal'))};
// V4.12 : objets partagés (who = liste) → un seul porteur. D'abord les choix du joueur (héros 0, 1, 2), puis le meilleur objet libre
// pour chaque emplacement resté vide, dans le même ordre : jamais deux porteurs, résultat identique à chaque calcul.
// V4.33 : équipe de combat (3 héros distincts parmi ceux disponibles) ; valeur absente ou abîmée = Kael, Fenn, Aelis
// V4.40 : un héros est recruté dès le niveau commun HER[i].at (absent = présent dès le début)
export const recruited=(save,i)=>!!HER[i]&&(save?.lvl||1)>=(HER[i].at||1);
export const roster=save=>[...HER.keys()].filter(i=>recruited(save,i));
export const teamOf=save=>{const t=save?.team;return Array.isArray(t)&&t.length===TEAM_SIZE&&new Set(t).size===TEAM_SIZE&&t.every(i=>Number.isInteger(i)&&recruited(save,i))?t:[...DEF_TEAM]};
// le héros `inn` prend la place de `out` (même rang). Renvoie 1 si l'échange est fait.
export function swapTeam(save,out,inn){const t=[...teamOf(save)],k=t.indexOf(out);if(k<0||!recruited(save,inn)||t.includes(inn))return 0;t[k]=inn;save.team=t;return 1}
// V4.37 : sorts connus d'un héros à apprentissage (Orion), et les SLOTS_SP emportés (save.load[i], nettoyé à la lecture)
export const knownSpells=(save,i)=>{const h=HER[i];return[...h.sp,...(h.learn||[]).filter(([,l])=>ALL_SPELLS||(save.lvl||1)>=l).map(([id])=>id)]};
// un sort offert par un talent (Piège) occupe une des places
export const slotsOf=(save,i)=>SLOTS_SP-(talentFx(save,i).add?.length||0);
export function loadoutOf(save,i){const known=knownSpells(save,i),n=slotsOf(save,i),out=[...new Set(Array.isArray(save.load?.[i])?save.load[i]:[])].filter(id=>known.includes(id)).slice(0,n);
 for(const id of known)if(out.length<n&&!out.includes(id))out.push(id);return out}
// le sort `inn` (connu, non emporté) prend la place de `out`. Renvoie 1 si l'échange est fait.
export function swapSpell(save,i,out,inn){const l=loadoutOf(save,i),k=l.indexOf(out);if(k<0||l.includes(inn)||!knownSpells(save,i).includes(inn))return 0;l[k]=inn;(save.load||(save.load={}))[i]=l;return 1}
// ordre de distribution automatique du matériel : l'équipe d'abord, la réserve ensuite
const gearOrder=save=>roster(save).sort((a,b)=>teamOf(save).includes(b)-teamOf(save).includes(a)||a-b);
export function gearAll(save){const G=HER.map(()=>({})),used=new Set(),ok=(j,i,sl)=>recruited(save,i)&&ITEMS[j]?.sl===sl&&save.items.includes(j)&&fits(j,i)&&lvOf(j)<=(save.lvl||1)&&!used.has(j);
 for(const sl in SLOTS)HER.forEach((_,i)=>{const c=save.eq?.[i+':'+sl]??(sl==='arme'?save.wpn?.[i]:null);if(c!=null&&ok(c,i,sl)){G[i][sl]=c;used.add(c)}});
 for(const sl in SLOTS)gearOrder(save).forEach(i=>{if(G[i][sl]!=null)return;const b=save.items.filter(j=>ok(j,i,sl)).sort((a,b)=>score(save,b)-score(save,a))[0]??null;G[i][sl]=b;if(b!=null)used.add(b)});
 return G}
export const gear=(save,i)=>gearAll(save)[i];
export const weaponOf=(save,i)=>gear(save,i).arme;
// héros qui porte l'objet j, ou -1
export const holder=(save,j)=>gearAll(save).findIndex(g=>g[ITEMS[j].sl]===j);
export const isOn=(save,j)=>holder(save,j)>=0;
// équipe j sur le héros i (par défaut le premier compatible) ; un objet partagé quitte son ancien porteur (transfert en une fois)
export function equip(save,j,i=whoOf(ITEMS[j]??{who:[]})[0]){const o=ITEMS[j];if(!o||!save.items.includes(j)||!fits(j,i)||lvOf(j)>(save.lvl||1))return 0;const eq=save.eq||(save.eq={});
 for(const k of whoOf(o))if(k!==i&&eq[k+':'+o.sl]===j)delete eq[k+':'+o.sl];eq[i+':'+o.sl]=j;return 1}
// V4.7c : la sauvegarde ne garde que le nombre de points placés (save.attr[héros]) ; les valeurs peuvent changer sans rien perdre
export const attrOf=(save,i)=>({for:0,int:0,vit:0,agi:0,...(save.attr&&save.attr[i])});
export const attrEff=n=>Math.min(n,10)+Math.max(0,Math.min(n,20)-10)/2+Math.max(0,n-20)/4;
export const ptsLeft=(save,i)=>Math.max(0,save.lvl-1-Object.values(attrOf(save,i)).reduce((a,b)=>a+b,0));
// sauvegarde ancienne ou abîmée : héros sans répartition valable = tous ses points rendus (appliquer deux fois ne change rien)
export function cleanAttr(v,lvl){return HER.map((h,i)=>{const a=attrOf({attr:v},i),o={};let n=0;
 for(const k in ATTR){const x=a[k];if(!Number.isInteger(x)||x<0||x&&!ATTR[k].who.includes(i))return attrOf({},i);o[k]=x;n+=x}
 return n>Math.max(0,lvl-1)?attrOf({},i):o})}
// place les points `add` (ex. {vit:2}) ; tout ou rien. Renvoie 1 si accepté.
export function spendAttr(save,i,add){let n=0;for(const[k,x]of Object.entries(add)){if(!ATTR[k]||!ATTR[k].who.includes(i)||!Number.isInteger(x)||x<0)return 0;n+=x}
 if(!n||n>ptsLeft(save,i))return 0;const a=attrOf(save,i);for(const k in add)a[k]+=add[k];(save.attr||(save.attr=HER.map((h,j)=>attrOf(save,j))))[i]=a;return 1}
export function resetAttr(save,i){if(save.attr)save.attr[i]=attrOf({},i)}
export function heroStats(save,i){const h=HER[i],it=Object.values(gear(save,i)).filter(j=>j!=null),m=1+.1*(save.lvl-1);
 const sum=k=>it.reduce((a,j)=>a+itemVal(ITEMS[j],k,upLvl(save,j),rarOf(save,j)),0);const tal=talentFx(save,i),A=attrOf(save,i),bonus=f=>Object.keys(ATTR).reduce((s,k)=>s+(ATTR[k].who.includes(i)?(ATTR[k][f]||0)*attrEff(A[k]):0),0);
 const crit=tal.crit||.12,dodge=tal.dodge||0;
 return{lvl:save.lvl,spells:h.learn?loadoutOf(save,i):null,mast:save.ms?.[i]||{},hp:Math.round((Math.round(h.hp*m)+sum('hp'))*(tal.hpMul||1)*(1+bonus('hp'))),dmg:sum('dmg'),heal:sum('heal'),mult:(1+.06*(save.lvl-1))*(1+bonus('dmg')),
  crit:Math.min(Math.max(CRIT_CAP,crit),crit+bonus('crit')),dodge:Math.min(Math.max(DODGE_CAP,dodge),dodge+bonus('dodge')),tal}}
// ce que changerait l'objet j s'il était équipé : [[nom, avant, après]] pour les seules valeurs qui bougent (ne modifie rien)
export function compare(save,j,i){if(i==null){const h=holder(save,j);i=h>=0?h:whoOf(ITEMS[j])[0]}const c={...save,items:save.items.includes(j)?save.items:[...save.items,j],eq:{...save.eq}};
 if(!equip(c,j,i))return[];const a=heroStats(save,i),b=heroStats(c,i);
 return[['PV','hp'],['dégâts','dmg'],['soin','heal']].filter(([,k])=>a[k]!==b[k]).map(([n,k])=>[n,a[k],b[k]])}
// Ajoute de l'XP, renvoie le nombre de niveaux gagnés.
export function gainXp(save,xp){save.xp+=xp;let up=0;while(save.xp>=xpNeed(save.lvl)){save.xp-=xpNeed(save.lvl);save.lvl++;up++}return up}

// ---------- unités ----------
// Un monstre de la mission F (niveau F.lvl) sur la case p ; B = boss de zone ; elite (V4.5a) : PV ×1,5, dégâts ×1,2, anneau doré
function monUnit(F,t,p,id,rng,B,elite){const n=F.lvl,m=MON[t],boss=!!B,sc=1+.12*(n-1),ek=elite?1.5:1;
 const hp=Math.round(m.hp*sc*(boss?B.hp:1)*ek),dm=m.dmg.map(v=>Math.round(v*(1+.1*(n-1))*(boss?B.dmg:1)*(elite?1.2:1)));
 return{id,team:'m',k:t,boss:boss?1:undefined,s:boss&&B.s||m.s,row:boss&&B.s?0:m.row,summon:boss?B.summon:undefined,bs:boss?B.bs:undefined,n:boss?B.n:m.n+(elite?' élite':''),elite:elite?1:undefined,x:p.x,y:p.y,gx:p.x,gy:p.y,hp,max:hp,maxPA:4,maxPM:m.pm,pa:4,pm:m.pm,init:m.init+rng(),
  cd:{},armor:m.armor||0,fly:m.fly,dir:1,h:(boss?m.h*B.h:m.h)*(elite?1.15:1),xp:Math.round(m.xp*(1+.2*(n-1))*(boss?4:1)*(elite?2:1)),
  atk:{snd:m.snd,n:'Attaque',pa:4,r:m.r||[1,1],t:'enemy',los:m.los,dmg:dm,poison:m.poison,slow:m.slow,curse:m.curse,fx:m.fx??0,proj:m.r?1:0}}}

// hstats = heroStats de chaque héros (par numéro) ; team = les 3 qui combattent. L'affichage ajoute ensuite `ref` (hauteur du sprite).
export function mkUnits(s,F,hs,es,hstats,team=DEF_TEAM){const n=F.lvl,rng=s.rng;
 s.units=[];s.killedXp=0;
 team.forEach((i,slot)=>{const h=HER[i],st=hstats[i],tf=st.tal||{sp:{}},pm=tf.maxPM||3,ids=[...(st.spells||[...h.sp,...(st.lvl>=SP5_LVL&&h.sp5?[h.sp5]:[])]),...(tf.add||[]),...(s.pot>0?['potion']:[])];s.units.push({id:'h'+i,team:'h',k:h.k,n:h.n,hi:i,x:hs[slot].x,y:hs[slot].y,gx:hs[slot].x,gy:hs[slot].y,hp:st.hp,max:st.hp,maxPA:6,maxPM:pm,pa:6,pm,init:h.init+rng(),
  sp:ids,S:Object.fromEntries(ids.map(id=>[id,mastered({...SP[id],...tf.sp[id]},id,st.mast?.[id]||1)])),dmgMul:tf.dmgMul||1,crit:st.crit??(tf.crit||.12),guardK:tf.guardK||.5,pushDmg:tf.pushDmg||PUSH_DMG,exec:tf.exec,lastStand:tf.lastStand,dodge:st.dodge??tf.dodge,healMul:tf.healMul||1,cd:{},dmgB:st.dmg,healB:st.heal,mult:st.mult,dir:2,h:1.3})});
 const pool=F.pool,L=F.en&&(F.boss?[F.boss.k,...F.en]:F.en),cnt=F.wave?F.wave.start:L?L.length:Math.min(3+Math.floor((n-1)/2),8);
 const spots=[...es].sort(()=>rng()-.5);
 for(let i=0;i<cnt;i++){const B=i===0&&F.boss,t=B?B.k:L?L[i]:i===1&&F.elite&&!F.wave?F.elite:pick(rng,pool);s.units.push(monUnit(F,t,spots[i],'m'+i,rng,B))}
 // repères stables A/B/C pour les monstres identiques
 for(const k of new Set(s.units.filter(u=>u.team==='m').map(u=>u.k))){const g=s.units.filter(u=>u.team==='m'&&u.k===k&&u.n===MON[k].n);if(g.length>1)g.forEach((u,i)=>{u.tag=String.fromCharCode(65+i);u.n+=' '+u.tag})}
 if(F.goal==='chief'){const c=s.units.find(u=>u.team==='m');c.chief=1;c.n='Chef '+MON[c.k].n.toLowerCase()+(c.tag?' '+c.tag:''); // la lettre de repère reste en majuscule
  c.hp=c.max=Math.round(c.max*1.8);c.h*=1.2;c.xp*=2}s.goal=F.goal;if(F.wave)waveSetup(s,F,es);
 s.lava=F.lava?{...F.lava,next:[]}:null;lavaMark(s);
 s.order=[...s.units].sort((a,b)=>b.init-a.init);
}
export function face(u,x,y){const dx=x-u.x,dy=y-u.y;if(!dx&&!dy)return;u.dir=Math.abs(dx)>=Math.abs(dy)?(dx>0?0:3):(dy>0?1:2)}

// ---------- déplacement, portée, ligne de vue ----------
// Cases atteignables en au plus maxd pas (obstacles, eau et unités bloquent).
export function reach(s,u,maxd){const dist=new Map([[K(u.x,u.y),0]]),prev=new Map(),q=[[u.x,u.y]];
 while(q.length){const[x,y]=q.shift(),d=dist.get(K(x,y));if(d>=maxd)continue;
  for(const[dx,dy]of DIRS){const nx=x+dx,ny=y+dy,k=K(nx,ny);if(dist.has(k)||!passable(s,nx,ny)||occ(s,nx,ny))continue;dist.set(k,d+1);prev.set(k,K(x,y));q.push([nx,ny])}}
 return{dist,prev}}
// Chemin [[x,y],…] de la position de u jusqu'à la case k, d'après `prev` de reach().
export function pathTo(u,k,prev){const path=[];while(k&&k!==K(u.x,u.y)){path.unshift(k.split(',').map(Number));k=prev.get(k)}return path}
const wall=(c,lob)=>!c||c.block&&!(lob&&LOW.has(c.d)); // lob : le tir passe au-dessus des décors bas, jamais des personnages
export function los(s,a,b,ign,lob){const n=Math.max(Math.abs(b.x-a.x),Math.abs(b.y-a.y))*4;
 for(let i=1;i<n;i++){const t=i/n,x=Math.round(a.x+(b.x-a.x)*t+1e-4),y=Math.round(a.y+(b.y-a.y)*t-1e-4);
  if((x===a.x&&y===a.y)||(x===b.x&&y===b.y))continue;const c=cell(s,x,y);if(wall(c,lob))return false;const o=occ(s,x,y);if(o&&o!==ign)return false}return true}
// Première obstruction sur la ligne a→b (même règle que los) : {x,y,u} (u = unité qui bloque) ou null
export function losBlock(s,a,b,ign,lob){const n=Math.max(Math.abs(b.x-a.x),Math.abs(b.y-a.y))*4;
 for(let i=1;i<n;i++){const t=i/n,x=Math.round(a.x+(b.x-a.x)*t+1e-4),y=Math.round(a.y+(b.y-a.y)*t-1e-4);
  if((x===a.x&&y===a.y)||(x===b.x&&y===b.y))continue;const c=cell(s,x,y);if(wall(c,lob))return{x,y,u:null};const o=occ(s,x,y);if(o&&o!==ign)return{x,y,u:o}}return null}
// Pourquoi une cible n'est pas valable (même règles que okTarget) : {t:'texte court',at:{x,y}|undefined}, ou null si elle l'est
export function whyNot(s,u,sp,c,from=u){if(okTarget(s,u,sp,c,from))return null;const d=man(from,c),o=occ(s,c.x,c.y);
 if(sp.nova&&c.x===from.x&&c.y===from.y)return{t:'Aucun ennemi collé à toi'};
 if(d>sp.r[1])return{t:`À ${d} cases, portée max. ${sp.r[1]}`};if(d<sp.r[0])return{t:`Trop près, portée min. ${sp.r[0]}`};
 if(sp.los&&d>1&&!los(s,from,c,u,sp.lob)){const b=losBlock(s,from,c,u,sp.lob);return{t:b?(b.u?`${b.u.n} bloque le tir`:sp.lob?'Un obstacle haut bloque le tir':'Un obstacle bloque le tir'):'Ligne de tir bloquée',at:b||undefined}}
 if(sp.charge&&o&&o.team!==u.team)return{t:'Aucun chemin libre jusqu’à une case voisine'};
 if(sp.t==='enemy')return{t:!o?'Personne ici':o.team===u.team?`${o.n} est un allié`:'Cible invalide'};
 if(sp.t==='ally')return{t:!o?'Personne ici':'Ce n’est pas un allié'};
 if(sp.t==='dead')return{t:'Aucun héros à relever ici'};if(sp.free)return{t:'Case occupée ou bloquée'};return okTarget(s,u,sp,c,from)?null:{t:'Cible invalide'}}
export function okTarget(s,u,sp,c,from=u){const d=man(from,c);if(d<sp.r[0]||d>sp.r[1])return 0;if(sp.los&&d>1&&!los(s,from,c,u,sp.lob))return 0;const o=occ(s,c.x,c.y);
 if(sp.t==='self')return c.x===from.x&&c.y===from.y&&(!sp.nova||s.units.some(f=>!f.dead&&f.team!==u.team&&man(f,from)===1));if(sp.t==='cell')return !!cell(s,c.x,c.y)&&(!sp.free||(!o&&passable(s,c.x,c.y)));
 if(sp.t==='dead'){const h=koAt(s,u,c);return h&&reviveSpot(s,h)?1:0}if(!o)return sp.t==='enemy'&&sp.dmg&&!sp.charge&&prismOn(s,cell(s,c.x,c.y))?1:0;return sp.t==='enemy'?o.team!==u.team&&(!sp.charge||!!chargeDest(s,u,sp,c,from)):o.team===u.team}
// V4.11 Charge : case libre voisine de t la plus proche de `from`, en au plus portée max − 1 pas, sans traverser obstacle, eau ni unité.
// Ne coûte aucun PM. {x,y,path:[[x,y],…]} ou null.
export function chargeDest(s,u,sp,t,from=u){const st=K(from.x,from.y),dist=new Map([[st,0]]),prev=new Map(),q=[[from.x,from.y]],max=sp.r[1]-1;let end=null;
 while(q.length){const[x,y]=q.shift(),d=dist.get(K(x,y));if(d>0&&man({x,y},t)===1){end=K(x,y);break}if(d>=max)continue;
  for(const[dx,dy]of DIRS){const nx=x+dx,ny=y+dy,k=K(nx,ny);if(dist.has(k)||!passable(s,nx,ny))continue;const o=occ(s,nx,ny);if(o&&o!==u)continue;dist.set(k,d+1);prev.set(k,K(x,y));q.push([nx,ny])}}
 if(!end)return null;const path=[];for(let k=end;k!==st;k=prev.get(k))path.unshift(k.split(',').map(Number));return{x:path.at(-1)[0],y:path.at(-1)[1],path}}
export function selCells(s,u,sp){const out=[];for(const c of s.map.values()){const d=man(u,c);if(d<sp.r[0]||d>sp.r[1])continue;
 out.push({x:c.x,y:c.y,los:!sp.los||d<=1||los(s,u,c,u,sp.lob),ok:okTarget(s,u,sp,c)})}return out}

// V4.1 : cible hors d'atteinte → meilleure case (dans les PM) d'où lancer le sort sur c, ou null.
// Le moins de PM possible, puis une case amplifiée, puis la plus éloignée de la cible.
export function approach(s,u,sp,c,rc=reach(s,u,u.pm),ok=(from)=>okTarget(s,u,sp,c,from)){if(sp.charge||u.pa<costOf(u,sp)||u.cd[sp.n]>0||ok(u))return null;let best=null,bs=null;
 for(const[k,cost]of rc.dist){if(!cost)continue;const[x,y]=k.split(',').map(Number),from={x,y};if(!ok(from))continue;
  const sc=cost*1000-(ampAt(s,from)>1?100:0)-man(from,c);if(!best||sc<bs){bs=sc;best={k,x,y,cost}}}
 return best}
// ---------- aperçu de déplacement (V3.0e) : ennemis visables depuis la case `from`, sans rien modifier ----------
// Sorts offensifs disponibles (assez de PA, sans recharge). Zone : un ennemi compte si une case visable le couvre.
export function targetsFrom(s,u,from){const foes=s.units.filter(o=>!o.dead&&o.team!==u.team),all=new Set(),list=[];
 for(const id of u.sp){const sp=u.S[id];if(!sp.dmg||u.pa<costOf(u,sp)||u.cd[sp.n]>0)continue;
  const cells=sp.zone?[...s.map.values()].filter(c=>okTarget(s,u,sp,c,from)):null;
  const hit=foes.filter(f=>sp.nova?man(from,f)===1:sp.zone?cells.some(c=>man(c,f)<=sp.zone):okTarget(s,u,sp,f,from));
  if(hit.length){list.push({sp,n:hit.length});for(const f of hit)all.add(f)}}
 return{foes:[...all],list}}
// ---------- première mission guidée (V3.0e) ----------
// Une cible à portée de Tir dès le 1er tour de Fenn (6 cases en face), une 2e que le déplacement ouvre (7 cases).
// Cavernes, niveau 4 (V4.0.2) : le dernier monstre se met à couvert juste derrière le prisme (côté ennemi), pour apprendre à le toucher par le prisme
export function prismCover(s){const p=[...s.map.values()].find(c=>c.cry==='p'),m=s.units.filter(u=>u.team==='m').pop();if(!p||!m)return;
 const spot=prismHits(s,p).filter(q=>passable(s,q.x,q.y)&&!occ(s,q.x,q.y)).sort((a,b)=>(a.x+a.y)-(b.x+b.y))[0];if(spot&&spot.x+spot.y<p.x+p.y)Object.assign(m,{x:spot.x,y:spot.y,gx:spot.x,gy:spot.y})}
export function guideSetup(s){const f=s.units.find(u=>u.k==='archer'),m=s.units.filter(u=>u.team==='m');if(!f||m.length<2)return;
 const spots=[{x:f.x-3,y:f.y-3},{x:f.x-2,y:f.y-5}];
 // dégage les deux couloirs (obstacles et eau) entre les héros et ces cases
 for(const c of s.map.values())if(c.x<=f.x&&c.y<=f.y&&c.x>=spots[1].x-1&&c.y>=spots[1].y&&(c.block||c.water)){delete c.block;delete c.water;delete c.d;c.t=s.theme.g[0]}
 spots.forEach((p,i)=>{const o=occ(s,p.x,p.y);if(o&&o!==m[i])return;Object.assign(m[i],{x:p.x,y:p.y,gx:p.x,gy:p.y})})}

// ---------- dégâts, sorts ----------
// Bouclier : dégâts ÷2 ; armure en % ; au moins 1 dégât.
export function soak(t,amt,pen=0){if(t.sunder)amt*=1+t.sunder.pct;if(t.shield>0)amt=Math.ceil(amt*(t.guardK||.5));return Math.max(1,Math.round(amt*(1-(t.armor||0)*(1-pen))))}
// V4.37 : part des dégâts qu'inflige encore une unité affaiblie
export const weakK=u=>u.weak?1-u.weak.pct:1;
// Dégâts d'un sort avant bouclier et armure, pour un tirage `roll`
const power=(u,sp,t,roll,amp,cb,cr)=>amp*(roll+(u.dmgB||0))*(u.mult||1)*(u.dmgMul||1)*(u.exec&&t.hp<t.max*.3?1.25:1)*(u.buff?1+u.buff.pct:1)*weakK(u)*(sp.k||1)*cb*(cr?1.5:1); // sp.k : bonus de dégâts d'un talent sur ce sort
const healing=(u,roll,amp)=>Math.round((roll+(u.healB||0))*(u.mult||1)*(u.healMul||1)*amp);
// nombre de héros ayant frappé t, u compris (palier de combo)
const comboSize=(u,t)=>u.team==='h'&&t.team!==u.team?new Set([...(t.hitBy||[]),u.id]).size:0;
// V4.2 : prévision d'un sort sur l'unité t, lancé depuis `from`. Ne tire aucun hasard et ne modifie rien.
// {dmg:[min,max], crit:[min,max], pc:chance de critique, dodge, combo, push:dégâts de collision, ko:'sure'|'maybe'|'crit'|null, heal:[min,max]}
// part des dégâts d'un sort de zone sur la case p quand on vise `at` (1 au centre ; sp.side autour)
const sideK=(sp,at,p)=>sp.side&&at&&(at.x!==p.x||at.y!==p.y)?sp.side:1;
export function forecast(s,u,sp,t,from=u,at=null){const amp=ampAt(s,from),out={amp:amp>1};
 if(sp.heal&&t.team===u.team)out.heal=sp.heal.map(r=>Math.min(Math.round(healing(u,r,amp)*(t.curse?CURSE_K:1)),t.max-t.hp));
 if(!sp.dmg||t.team===u.team)return out;
 const n=comboSize(u,t),cb=COMBO[n]||1,side=sideK(sp,at,t),hit=(roll,cr)=>soak(t,power(u,sp,t,roll,amp,cb,cr)*side,sp.pierce||0);
 out.dmg=sp.dmg.map(r=>hit(r,false));out.crit=sp.dmg.map(r=>hit(r,true));out.pc=u.crit||.12;out.dodge=t.dodge||0;out.combo=n>1?n:0;out.push=0;
 if(sp.push){const p=pushPlan(s,{...from,pushDmg:u.pushDmg},t,sp.push);if(p.left)out.push=soak(t,(p.k||PUSH_DMG)*p.left)}
 const kills=d=>d+out.push>=t.hp&&!t.lastStand;
 out.ko=kills(out.dmg[0])&&!out.dodge?'sure':kills(out.dmg[1])?'maybe':kills(out.crit[1])?'crit':null;return out}
// cases touchées par un sort de zone visant c
export function zoneCells(s,c,rad=1){const out=[c,...DIRS.map(d=>({x:c.x+d[0],y:c.y+d[1]}))]; // rayon 1 : ordre d'origine (mêmes tirages)
 for(let dx=-rad;dx<=rad;dx++)for(let dy=-rad;dy<=rad;dy++){const d=Math.abs(dx)+Math.abs(dy);if(d>1&&d<=rad)out.push({x:c.x+dx,y:c.y+dy})}return out.filter(p=>cell(s,p.x,p.y))}
// cases frappées par un sort de dégâts visant c, lancé depuis `from` (Explosion : les 4 voisines du lanceur)
export const hitCells=(s,sp,c,from)=>sp.nova?DIRS.map(d=>({x:from.x+d[0],y:from.y+d[1]})).filter(p=>cell(s,p.x,p.y)):sp.zone?zoneCells(s,c,sp.zone):[c];
// sort de zone : meilleur centre autorisé qui touche l'unité t (le plus d'ennemis, puis le plus proche de t), ou null
export function zoneCenter(s,u,sp,t,from=u){let best=null,bs=-1e9;
 for(const c of zoneCells(s,t,sp.zone)){if(!okTarget(s,u,sp,c,from))continue;const n=zoneCells(s,c,sp.zone).filter(p=>{const o=occ(s,p.x,p.y);return o&&o.team!==u.team}).length,sc=n*10-man(c,t);if(sc>bs){bs=sc;best=c}}
 return best&&{x:best.x,y:best.y}}
// Renvoie un événement, ou null si la cible est déjà morte.
export function hurt(s,t,amt,src,crit,pen=0){if(t.dead)return null;amt=soak(t,amt,pen);
 let saved=false;if(t.lastStand&&amt>=t.hp){amt=t.hp-1;t.lastStand=0;saved=true} // Dernier rempart : une fois par combat
 if(t.team==='h'&&(src==='quake'||src==='beam'))s.sigHit=1; // V4.5f : attaque signature subie
 t.hp-=amt;let killed=false;if(t.hp<=0){t.hp=0;t.dead=true;killed=true;if(t.team==='m')s.killedXp+=t.xp;else{t.wasKO=1;if(t.trap?.glyph)delete t.trap}}
 const e={type:'hurt',t,amt,src,crit:!!crit,killed,saved};
 if(killed&&t.poison&&t.poison.spread){e.spread=[];for(const[dx,dy]of DIRS){const o=occ(s,t.x+dx,t.y+dy); // Contagion : ne se propage pas plus loin
  if(o&&o.team===t.team&&!(o.poison&&o.poison.d*o.poison.turns>=12)){o.poison={d:6,turns:2};e.spread.push(o)}}}if(!killed&&t.summon&&!t.summoned&&t.hp<=t.max/2){t.summoned=1;e.spawn=summon(s,t)}
 return e}
// Invocation unique d'un boss (Roi Gelée) : sur les cases libres les plus proches, sans XP, jouent en fin de tour de jeu.
export function summon(s,b){const{k,n,hp,pm,dmg,sn}=b.summon,m=MON[k],d=reach(s,b,4).dist,out=[];
 for(const c of [...d.keys()].filter(c=>d.get(c)>0).sort((a,c)=>d.get(a)-d.get(c)).slice(0,n)){const[x,y]=c.split(',').map(Number);
  const u={id:'m'+s.units.length,team:'m',k,s:m.s,row:m.row,n:(sn||'Petite gelée')+' '+String.fromCharCode(65+s.units.filter(o=>o.minion).length),x,y,gx:x,gy:y,hp,max:hp,maxPA:4,maxPM:pm,pa:4,pm,init:0,cd:{},armor:0,dir:1,h:m.h*.75,xp:0,minion:1,
   atk:{snd:m.snd,n:'Attaque',pa:4,r:[1,1],t:'enemy',dmg:[...dmg],fx:m.fx??0,proj:0}};s.units.push(u);s.order.push(u);out.push(u)}
 return out}
// Paie le coût d'un sort (PA, recharge) et tourne l'unité vers la cible.
// V4.5c : coût réel d'un sort pour u ce tour-ci (relance du même sort : +1 PA pour les héros)
export const costOf=(u,sp)=>sp.pa+(u.team==='h'&&u.casts&&u.casts[sp.n]?PA_RULE.recast:0);
export function payCost(u,sp,c){u.pa-=costOf(u,sp);(u.casts||(u.casts={}))[sp.n]=(u.casts[sp.n]||0)+1;if(sp.cd)u.cd[sp.n]=sp.cd;face(u,c.x,c.y)}
// Applique l'effet d'un sort sur la case c (après payCost). Renvoie la liste d'événements.
export function applySpell(s,u,sp,c){
 if(u.team==='m'&&sp.dmg){const o=occ(s,c.x,c.y);if(o&&o.team!==u.team)s.focus={id:o.id,r:s.round}} // V4.5b : les autres monstres achèvent la même cible s'ils l'atteignent
 if(sp.glyph){u.trap={x:c.x,y:c.y,left:3,glyph:{sp,amp:ampAt(s,u)}};return[{type:'fx',x:c.x,y:c.y,i:3,w:.9,sh:'sico'},{type:'status',t:u,text:'Glyphe posé',color:'#ffd65a'}]}
 if(sp.trap){u.trap={x:c.x,y:c.y,left:3};return[{type:'fx',x:c.x,y:c.y,i:3,w:.9,sh:'sico'},{type:'status',t:u,text:'Piège posé',color:'#ffa040'}]}
 if(sp.wall){const k=cell(s,c.x,c.y),hp=Math.round(u.max*sp.wall.hp);k.block=1;k.ice={hp,max:hp,until:s.round+sp.wall.turns};return[{type:'fx',x:c.x,y:c.y,i:3,w:1.2,sh:'fxi'},{type:'status',t:u,text:'Mur de glace',color:'#9fd8ff'}]}
 if(sp.blink){const from={x:u.x,y:u.y};u.x=u.gx=c.x;u.y=u.gy=c.y;return[{type:'fx',x:from.x,y:from.y,i:sp.fx,w:1.2},{type:'fx',x:c.x,y:c.y,i:sp.fx,w:1.4},...stepOn(s,u)]}
 const ice=u.team==='m'&&sp.dmg&&cell(s,c.x,c.y)?.ice;
 if(ice){const k=cell(s,c.x,c.y),d=Math.max(1,Math.round(ri(s.rng,...sp.dmg)*weakK(u)));ice.hp-=d;if(ice.hp<=0)melt(k);return[{type:'fx',x:c.x,y:c.y,i:3,w:1,sh:'fxi'},{type:'status',t:{gx:c.x,gy:c.y,x:c.x,y:c.y},text:ice.hp>0?`Mur -${d}`:'Mur brisé !',color:'#9fd8ff',snd:'hit'}]}
 if(sp.revive)return revive(s,u,c);
 if(sp.potion){if(!(s.pot>0))return[];s.pot--;const g=Math.min(Math.round(u.max*.4),u.max-u.hp);u.hp+=g;return[{type:'fx',x:u.x,y:u.y,i:4,w:1.3},{type:'heal',t:u,amt:g}]}
 const ev=[],rng=s.rng,amp=ampAt(s,u),tg=sp.all?s.units.filter(o=>!o.dead&&o.team===u.team).map(o=>({x:o.x,y:o.y})):sp.nova?hitCells(s,sp,c,u):sp.zone?[c,...zoneCells(s,c,sp.zone).slice(1)]:sp.splash?[c,...DIRS.map(d=>({x:c.x+d[0],y:c.y+d[1]}))]:[c];
 if(sp.charge){const d=chargeDest(s,u,sp,c);if(!d)return[];u.x=u.gx=d.x;u.y=u.gy=d.y;face(u,c.x,c.y)} // amplificateur : case de départ
 for(const p of tg){const t=occ(s,p.x,p.y);
  if(sp.zone||sp.nova){ev.push({type:'fx',x:p.x,y:p.y,i:sp.fx,w:.9});if(!t||t.team===u.team)continue}else if(sp.splash&&p!==c&&(!t||t.team!==u.team))continue;else ev.push({type:'fx',x:p.x,y:p.y,i:sp.fx,w:sp.fx===7?1.4:1.3});
  if(!t)continue;
  if(sp.dmg&&t.dodge&&t.team!==u.team&&rng()<t.dodge){ev.push({type:'status',t,text:'Esquive !',color:'#7fd0ff',snd:'dodge'});continue} // Insaisissable
  let cb=1;if(sp.dmg&&u.team==='h'&&t.team!==u.team){const hb=t.hitBy||(t.hitBy=new Set()),fresh=!hb.has(u.id);hb.add(u.id);cb=COMBO[hb.size];if(fresh&&hb.size>1)ev.push({type:'combo',t,n:hb.size})}
  if(sp.dmg){const cr=rng()<(u.crit||.12),h=hurt(s,t,power(u,sp,t,ri(rng,...sp.dmg),amp,cb,cr)*sideK(sp,c,p),0,cr,sp.pierce||0);if(h)ev.push(h);if(cr)ev.push({type:'shake',ms:220})}
  if(sp.push&&!t.dead)ev.push(...push(s,t,pushPlan(s,u,t,sp.push)));
  if(sp.heal){const v=Math.round(healing(u,ri(rng,...sp.heal),amp)*(t.curse?CURSE_K:1)),g=Math.min(v,t.max-t.hp);t.hp+=g;ev.push({type:'heal',t,amt:g})}
  if(sp.slow&&!t.dead&&t.team!==u.team){const n=slowFor(sp,t);t.slow=Math.max(t.slow||0,n);ev.push({type:'status',t,text:`−${n} PM`,color:'#c9a0ff'})}
  if(sp.curse&&!t.dead&&t.team!==u.team){t.curse=2;ev.push({type:'status',t,text:'Maudit : soins −50 %',color:'#d6b14a'})}
  if(sp.poison&&!t.dead){t.poison={d:sp.poison[0],turns:sp.poison[1]};if(sp.spread)t.poison.spread=1}
  if(sp.burn&&!t.dead&&t.team!==u.team){if(fireproof(t))ev.push({type:'status',t,text:'Insensible au feu',color:'#ffb060'});else t.burn={d:sp.burn[0],turns:sp.burn[1]}} // ne se cumule pas
  if(sp.sunder&&!t.dead&&t.team!==u.team){t.sunder={pct:sp.sunder[0],turns:sp.sunder[1]};ev.push({type:'status',t,text:`Armure brisée +${Math.round(sp.sunder[0]*100)} %`,color:'#ff9a5a'})}
  if(sp.dmg&&t.counter&&!t.dead&&!u.dead&&t.team!==u.team&&man(t,u)===1){const r=SP.slash.dmg,h=hurt(s,u,(r[0]+r[1])/2*(t.mult||1)*(t.dmgMul||1)*(t.buff?1+t.buff.pct:1)*t.counter,'counter');if(h)ev.push({type:'status',t,text:'Contre-attaque !',color:'#ffd65a',snd:'slash'},h)}
  if(sp.weaken&&!t.dead&&t.team!==u.team){t.weak={pct:sp.weaken[0],turns:sp.weaken[1]};ev.push({type:'status',t,text:`Affaibli −${Math.round(sp.weaken[0]*100)} %`,color:'#c9a0ff'})}
  if(sp.taunt){let n=0;for(const m of s.units)if(m.team!==u.team&&!m.dead&&man(m,u)<=sp.taunt){m.taunt=u.id;n++}ev.push({type:'status',t,text:n?`Provocation (${n})`:'Personne à portée',color:'#ff7a5a'})}
  if(sp.counter){t.counter=sp.counter;ev.push({type:'status',t,text:'Contre-attaque prête',color:'#ffd65a'})}
  if(sp.shield){t.shield=1;ev.push({type:'status',t,text:'Rempart',color:'#9fd0ff'})}
  if(sp.buff){t.buff={pct:sp.buff,turns:sp.buffT||2};ev.push({type:'status',t,text:`+${Math.round(sp.buff*100)} %`,color:'#ffd65a'})}
  if(sp.pmBonus){t.pm+=sp.pmBonus;ev.push({type:'status',t,text:`+${sp.pmBonus} PM`,color:'#7fd0ff'})}}
 if(amp>1&&(sp.dmg||sp.heal))ev.unshift({type:'status',t:u,text:'Cristal +30 %',color:'#5ff2e0',snd:'crystal_amp'});
 const pc=sp.dmg&&tg.map(p=>cell(s,p.x,p.y)).find(c=>prismOn(s,c));if(pc)ev.push(...prismFire(s,u,pc,prismDmg(s,u,sp)));
 if(sp.shake)ev.push({type:'shake',ms:250});
 return ev}
// ---------- cristaux (V4.0b) ----------
// Amplificateur : lanceur sur une des 4 cases voisines d'un cristal turquoise → ×1,3 (pas de cumul)
export const ampAt=(s,p)=>DIRS.some(([dx,dy])=>cell(s,p.x+dx,p.y+dy)?.cry==='a')?1+AMP:1;
// Prisme : violet, allumé sauf pendant les 2 tours de table qui suivent son déclenchement
export const prismOn=(s,c)=>!!c&&c.cry==='p'&&!(c.off>s.round);
// 70 % des dégâts moyens du sort (bonus du lanceur et amplificateur compris ; ni tirage, ni critique, ni combo)
export const prismDmg=(s,u,sp)=>Math.round(((sp.dmg[0]+sp.dmg[1])/2+(u.dmgB||0))*(u.mult||1)*(u.dmgMul||1)*(u.buff?1+u.buff.pct:1)*(sp.k||1)*ampAt(s,u)*PRISM);
// Cases et unités touchées si le prisme c éclate (aperçu et effet)
export const prismHits=(s,c)=>DIRS.map(([dx,dy])=>({x:c.x+dx,y:c.y+dy})).filter(p=>cell(s,p.x,p.y));
export function prismFire(s,u,c,amt){c.off=s.round+PRISM_OFF;const ev=[{type:'fx',x:c.x,y:c.y,i:3,w:1.2,sh:'crystals'},{type:'status',t:u,text:'Prisme !',color:'#c98bff',snd:'prism_burst'},{type:'shake',ms:200}];
 ev.push({type:'beam',from:c,cells:prismHits(s,c)});for(const p of prismHits(s,c)){const o=occ(s,p.x,p.y),e=o&&hurt(s,o,amt,'prism');if(e)ev.push(e)}return ev}

// ---------- poussée ----------
// Trajet d'une poussée de n cases depuis `from` : case d'arrivée, cases non parcourues, unité percutée.
export function pushPlan(s,from,t,n){const dx=Math.sign(t.x-from.x),dy=Math.sign(t.y-from.y);let x=t.x,y=t.y,left=n,hit=null;
 if(dx&&dy)return{to:{x,y},left:0,hit}; // pas de poussée en diagonale (n'arrive pas : Fracas est au corps à corps)
 while(left>0){const nx=x+dx,ny=y+dy;hit=occ(s,nx,ny)||null;if(!passable(s,nx,ny)||hit)break;x=nx;y=ny;left--}
 return{to:{x,y},left,hit:left?hit:null,k:from.pushDmg||PUSH_DMG}}
// Applique un trajet de pushPlan : déplace t, puis 5 dégâts par case non parcourue (à t et à l'unité percutée).
export function push(s,t,p){const ev=[{type:'push',t,to:p.to}],dx=Math.sign(p.to.x-t.x),dy=Math.sign(p.to.y-t.y);
 for(let x=t.x,y=t.y;x!==p.to.x||y!==p.to.y;){x+=dx;y+=dy;const h=trapAt(s,x,y,t.team);if(h){ev.push(...spring(s,t,h,x,y));break}} // piège traversé
 t.x=p.to.x;t.y=p.to.y;
 if(p.left){ev.push({type:'collision',t});ev.push(hurt(s,t,(p.k||PUSH_DMG)*p.left,'collision'));if(p.hit)ev.push(hurt(s,p.hit,p.k||PUSH_DMG,'collision'))}
 return ev.filter(Boolean)}

// ---------- tours ----------
// ralentissement : −1 PM ; −2 (Gel profond) laisse au moins 1 PM et reste à −1 sur un boss
export const slowFor=(sp,t)=>sp.slow>1&&!t.boss?sp.slow:1;
export const slowedPM=u=>u.slow?Math.max(u.slow>1?1:0,u.maxPM-u.slow):u.maxPM;
// Début de tour : PM remis au maximum, PA au maximum plus le report ; recharges et bouclier diminuent d'un tour.
export const carryPA=u=>u.team==='h'?Math.min(PA_CARRY.max,Math.floor(u.pa/PA_CARRY.per)):0;
export function beginTurn(u){delete u.hitBy;delete u.counter;delete u.casts;if(u.trap&&--u.trap.left<=0)delete u.trap;u.carried=u.carry||0;delete u.carry;u.pa=u.maxPA+u.carried;u.pm=slowedPM(u);delete u.slow;if(u.curse)u.curse--;for(const k in u.cd)if(u.cd[k]>0)u.cd[k]--;if(u.shield>0)u.shield--}
// Poison en début de tour : dégâts puis un tour de moins. Renvoie les événements.
export function poisonTick(s,u){const ev=[];for(const[k,fx]of[['poison',5],['burn',1]]){const e=u[k];if(!e||u.dead)continue;ev.push({type:'fx',x:u.x,y:u.y,i:fx,w:.9},hurt(s,u,e.d,k));if(--e.turns<=0)delete u[k]}return ev.filter(Boolean)}
// Fin de tour : les PA non dépensés se reportent en partie, le bonus de dégâts diminue d'un tour.
export function endTurn(u){u.carry=carryPA(u);delete u.taunt;if(u.sunder&&--u.sunder.turns<=0)delete u.sunder;if(u.weak&&--u.weak.turns<=0)delete u.weak;if(u.buff&&--u.buff.turns<=0)delete u.buff}
// null tant que le combat continue, sinon 'win' ou 'lose'.
// objectifs (V2.6d) : s.goal = 'chief' (abattre le chef suffit) ou 'survive' (tenir jusqu'au début du tour SURVIVE+1)
export const SURVIVE=4;
// ---------- V4.5a : survie à renforts ----------
// F.wave = {turns, cap (ennemis en jeu au plus), start (présents au départ), add:[[tour, nombre, espèce élite ?], …]}
// Les renforts sont annoncés un tour avant (s.wave.next : cases réservées), arrivent au début du tour, jouent en fin de tour (aucun double tour).
// Case prise ou plafond atteint : le renfort attend le tour suivant. XP des renforts ÷2 (budget de la mission borné).
const liveM=s=>s.units.filter(u=>u.team==='m'&&!u.dead);
export function waveSetup(s,F,es){const W=F.wave;s.surv=W.turns;s.es=es;
 s.wave={cap:W.cap,F,next:[],q:W.add.flatMap(([r,n,e])=>Array.from({length:n},(_,k)=>({r,elite:k===0&&e||null})))};wavePlan(s)}
// cases libres d'apparition : départs ennemis, puis haut du plateau ; les plus loin des héros d'abord
export function spawnCells(s,taken=[]){const H=s.units.filter(u=>u.team==='h'&&!u.dead),seen=new Set(),out=[];
 for(const c of[...s.es,...[...s.map.values()].filter(c=>c.x+c.y<=6)]){const k=K(c.x,c.y);if(seen.has(k))continue;seen.add(k);
  if(passable(s,c.x,c.y)&&!occ(s,c.x,c.y)&&!trapAt(s,c.x,c.y,'m')&&!taken.some(o=>o.x===c.x&&o.y===c.y))out.push({x:c.x,y:c.y,d:Math.min(99,...H.map(h=>man(h,c)))})}
 return out.sort((a,b)=>b.d-a.d)}
// annonce des renforts du prochain tour (au plus ce que le plafond permet aujourd'hui)
export function wavePlan(s){const w=s.wave;if(!w)return;const due=w.q.filter(q=>q.r<=s.round+1).slice(0,Math.max(0,w.cap-liveM(s).length)),cs=spawnCells(s);
 w.next=due.slice(0,cs.length).map((q,i)=>({x:cs[i].x,y:cs[i].y,q}))}
// début de tour : les renforts annoncés arrivent ; renvoie les nouveaux monstres
export function waveTick(s){const w=s.wave;if(!w)return[];const out=[];
 for(const c of w.next){if(occ(s,c.x,c.y)||!passable(s,c.x,c.y)||liveM(s).length>=w.cap)continue;w.q.splice(w.q.indexOf(c.q),1);
  const t=c.q.elite||pick(s.rng,w.F.pool),u=monUnit(w.F,t,c,'m'+s.units.length,s.rng,null,!!c.q.elite);u.reinf=1;u.init=0;u.xp=Math.round(u.xp/2);
  const same=s.units.filter(o=>o.team==='m'&&o.k===t).length;if(same){u.tag=String.fromCharCode(65+same);u.n+=' '+u.tag}
  s.units.push(u);s.order.push(u);out.push(u)}
 wavePlan(s);return out}
// plateau vidé alors que des vagues restent : la suivante est avancée au prochain tour (pas de tours d'attente)
export function waveEmpty(s){const w=s.wave;if(!w||liveM(s).length||!w.q.length||w.next.length)return 0;const r=w.q[0].r;for(const q of w.q)if(q.r===r)q.r=s.round+1;wavePlan(s);return 1}
// ---------- V4.29 : cases brûlantes (région 7) ----------
// Les cases sont marquées un tour entier à l'avance (s.lava.next), puis s'embrasent au début du tour suivant.
// Un tour sur deux (calme entre deux), ou chaque tour avec hot. Dégâts : LAVA_DMG des PV max ; Rempart les réduit, pas l'armure.
// insensible au feu (braises et brûlure)
export const fireproof=u=>!!MON[u.k]?.imm||u.bs==='forge';
export const lavaDmg=(s,u)=>soak(u,u.max*LAVA_DMG,1);
export function lavaMark(s){const L=s.lava;if(!L)return;const free=c=>c&&passable(s,c.x,c.y),H=s.units.filter(u=>u.team==='h'&&!u.dead),out=[],add=c=>{if(free(c)&&!out.includes(c))out.push(c)};
 // d'abord sous les pieds ou à côté de la moitié des héros (au moins un), pour obliger à bouger ; le reste dans la bande du milieu
 const hs=[...H].sort(()=>s.rng()-.5).slice(0,Math.ceil(H.length/2));for(const h of hs){if(out.length>=L.n)break;add(cell(s,h.x,h.y))}
 const mid=[...s.map.values()].filter(c=>c.x+c.y>=4&&c.x+c.y<=14&&free(c));for(let g=0;g<60&&out.length<L.n&&mid.length;g++)add(pick(s.rng,mid));
 L.next=out.map(c=>({x:c.x,y:c.y}))}
export function lavaTick(s){const L=s.lava;if(!L)return[];if(!L.next.length){lavaMark(s);return[]}
 const ev=[];for(const p of L.next){ev.push(L.trap?{type:'fx',x:p.x,y:p.y,i:7,w:1.1}:{type:'fx',x:p.x,y:p.y,i:1,w:1.2,sh:'fxi'});const u=occ(s,p.x,p.y);if(u&&(L.trap?u.team==='h':!fireproof(u))){const e=hurt(s,u,u.max*LAVA_DMG,'lava',false,1);if(e)ev.push(e);if(L.trap&&!u.dead)u.slow=u.slow||1}}
 ev.push({type:'shake',ms:250});L.next=[];if(L.hot)lavaMark(s);return ev}
// V4.37 : mur de glace. Il disparaît au début du tour de table s.round>=until (même si Orion est tombé)
export function melt(c){delete c.ice;delete c.block}
export function iceTick(s){const ev=[];for(const c of s.map.values())if(c.ice&&s.round>=c.ice.until){melt(c);ev.push({type:'fx',x:c.x,y:c.y,i:3,w:.8,sh:'fxi'})}return ev}
export const onLava=(s,p)=>!!s.lava&&s.lava.next.some(c=>c.x===p.x&&c.y===p.y);
export function outcome(s){const h=s.units.some(u=>u.team==='h'&&!u.dead),m=s.units.some(u=>u.team==='m'&&!u.dead);if(!h)return'lose';
 if(s.goal==='chief'&&s.units.some(u=>u.chief&&u.dead))return'win';if(s.goal==='survive'&&s.round>(s.surv||SURVIVE))return'win';if(!m&&s.wave){if(s.wave.q.length)return null;s.cleared=1}return m?null:'win'}

// Étoiles d’un combat gagné : victoire, aucun héros KO, objectif de maîtrise (star3, V4.5f).
// V4.5f : 3e étoile selon l'objectif (spec ChatGPT 27/11). Survie : toutes les vagues éliminées. Boss à attaque signature (Séisme, Rayon) déclenchée : ne jamais la subir.
// Sinon (combat, chef, autres boss) : tous les héros debout avec au moins 50 % de leurs PV.
export const star3=(s,boss)=>s.wave?['waves',!!s.cleared]:boss&&s.sigUsed?['sig',!s.sigHit]:['hp',s.units.filter(u=>u.team==='h').every(u=>!u.dead&&u.hp>=u.max/2)];
export const STAR3_TXT={waves:'Toutes les vagues éliminées',sig:'Attaque signature du boss évitée',hp:'Tous les héros à 50 % de PV ou plus'};
export const starList=(s,boss)=>[true,!s.units.some(u=>u.team==='h'&&(u.dead||u.wasKO)),star3(s,boss)[1]];
export const stars=(s,boss)=>starList(s,boss).filter(Boolean).length;

// ---------- IA ennemie ----------
// Prochaine action d'un monstre : {type:'cast',sp,target} | {type:'move',to,prev} | null (rien à faire).
// V4.5b : rôles (MON[].ai) et coordination. Mêmes règles que le joueur (PM, portée, ligne de vue) ; aucune information cachée.
// Préférence de cible (plus petit = préféré) : cible déjà frappée par un monstre ce tour-ci (s.focus), puis rôle, puis PV restants.
const fragile=(s,u)=>s.units.filter(o=>o.team===u.team&&!o.dead&&o!==u&&MON[o.k]?.ai!=='tank');
function prefer(s,u,role,h){const near=role==='tank'?Math.min(99,...fragile(s,u).map(o=>man(o,h))):0;
 return(s.focus&&s.focus.r===s.round&&s.focus.id===h.id?-1000:0)+(role==='flank'&&h.hi?-300:0)+near*20+h.hp}
export function aiStep(s,u){
 const sp=u.atk,all=s.units.filter(h=>h.team==='h'&&!h.dead),tz=u.taunt&&all.find(h=>h.id===u.taunt),heroes=tz?[tz]:all;if(!heroes.length)return null; // V4.43 : provoqué, il ne vise que Kael
 const role=MON[u.k]?.ai,rc=u.pm>0?reach(s,u,u.pm):null,hits=from=>heroes.some(h=>okTarget(s,u,sp,h,from)),gap=p=>Math.min(...heroes.map(h=>man(h,p)));
 // distance : collé à un héros au début de son tour, il recule vers la case la plus sûre d'où il peut encore tirer
 if(role==='range'&&rc&&u.pa>=sp.pa&&u.backed!==s.round&&gap(u)===1){let k=null,bs=-1;for(const[c,d]of rc.dist){const[x,y]=c.split(',').map(Number),p={x,y},g=gap(p);if(g>=2&&hits(p)&&g*10-d>bs){bs=g*10-d;k=c}}
  if(k){u.backed=s.round;return{type:'move',to:k,prev:rc.prev}}}
 if(u.pa>=sp.pa){const t=heroes.filter(h=>okTarget(s,u,sp,h)).sort((a,b)=>prefer(s,u,role,a)-prefer(s,u,role,b))[0];
  // cristal turquoise : s'il peut frapper depuis une case amplifiée à sa portée, il y va d'abord
  if(t&&ampAt(s,u)===1&&rc){const k=[...rc.dist.keys()].find(k=>{const[x,y]=k.split(',').map(Number);return ampAt(s,{x,y})>1&&hits({x,y})});if(k)return{type:'move',to:k,prev:rc.prev}}
  if(t)return{type:'cast',sp,target:t}}
 // bloqué par un mur de glace : s'il ne peut atteindre aucun héros ce tour-ci, il frappe le mur collé à lui
 const ice=u.pa>=sp.pa&&sp.r[0]<=1&&DIRS.map(([dx,dy])=>cell(s,u.x+dx,u.y+dy)).find(c=>c?.ice);
 if(ice&&!(rc&&[...rc.dist.keys()].some(k=>{const[x,y]=k.split(',').map(Number);return hits({x,y})})))return{type:'cast',sp,target:{x:ice.x,y:ice.y,gx:ice.x,gy:ice.y,n:'le mur de glace',ice:1}};
 if(u.pm<=0)return null;
 let best=null,bs=1e9;
 // champ de distance vers les héros (les autres monstres sont ignorés)
 // contournement : vise Fenn et Aelis s'ils sont joignables ; tank : reste à moins de 2 cases d'un allié fragile
 const fr=role==='flank'?heroes.filter(h=>h.hi):[],tgt=fr.length?fr:heroes,fd=new Map(),q=[];for(const h of tgt){fd.set(K(h.x,h.y),0);q.push(h)}
 const ally=role==='tank'?fragile(s,u):[],guard=p=>ally.length?Math.max(0,Math.min(...ally.map(o=>man(o,p)))-2)*4:0;
 while(q.length){const p=q.shift(),d=fd.get(K(p.x,p.y));for(const[dx,dy]of DIRS){const nx=p.x+dx,ny=p.y+dy,k=K(nx,ny);if(fd.has(k)||!passable(s,nx,ny))continue;fd.set(k,d+1);q.push({x:nx,y:ny})}}
 for(const[k,d]of rc.dist){const[x,y]=k.split(',').map(Number),from={x,y};
  const can=u.pa>=sp.pa&&hits(from);const sc=can?d-(sp.r[1]>1?(fd.get(k)??0)*2:0)-(ampAt(s,from)>1?3:0)-(fr.some(h=>okTarget(s,u,sp,h,from))?5:0)+guard(from):100+(fd.get(k)??99)*10+d+guard(from);const burn=!fireproof(u)&&onLava(s,from)?8:0;if(sc+burn<bs){bs=sc+burn;best=k}}
 return best&&best!==K(u.x,u.y)?{type:'move',to:best,prev:rc.prev}:null}
// ---------- V2.6c : mécaniques uniques des boss, jouées au début de leur tour ----------
// howl : +30 % de dégâts aux monstres (2 tours), tous les 3 tours · shell : Rempart un tour sur deux · quake : dégâts aux héros à 3 cases ou moins, tous les 3 tours · rage : sous 50 % PV, +1 PM et dégâts ×1,3
export const BOSS_P={howl:[3,2,'Hurlement'],shell:[2,1,'Carapace'],quake:[3,0,'Séisme'],beam:[3,1,'Rayon prismatique']};
// V4.5e : après l'appel de la meute (sous 50 % PV), le Loup alpha hurle tous les 2 tours
const bossP=u=>u.bs==='howl'&&u.summoned?[2,0,BOSS_P.howl[2]]:BOSS_P[u.bs];
export function bossNext(u){const p=bossP(u);if(!p)return 0;const b=u.bt||0;for(let k=1;;k++)if((b+k)%p[0]===p[1])return k}
export function bossTurn(s,u){if(!u.bs)return[];const ev=[];
 if(u.bs==='rage'){if(!u.raged&&u.hp<=u.max/2){u.raged=1;u.maxPM++;u.pm++;u.dmgMul=1.3;ev.push({type:'status',t:u,text:'Fureur !',color:'#ff5a5a',snd:'boss_phase'},{type:'shake',ms:300})}return ev}
 if(u.bs==='tomb'){if(!u.raged&&u.hp<=u.max/2){u.raged=1;u.dmgMul=1.2;if(s.lava){s.lava.hot=1;s.lava.n+=2}ev.push({type:'status',t:u,text:'Malédiction du tombeau !',color:'#d6b14a',snd:'boss_phase'},{type:'shake',ms:350});for(const h of s.units)if(h.team==='h'&&!h.dead){h.curse=2;ev.push({type:'status',t:h,text:'Maudit',color:'#d6b14a'})}}return ev}
 if(u.bs==='forge'){if(!u.raged&&u.hp<=u.max/2){u.raged=1;u.dmgMul=1.2;if(s.lava){s.lava.hot=1;s.lava.n+=2}ev.push({type:'status',t:u,text:'Surchauffe !',color:'#ff7a2a',snd:'boss_phase'},{type:'shake',ms:350})}return ev}
 if(u.bs==='beam')return beamTurn(s,u,ev);
 u.bt=(u.bt||0)+1;const[P,ph,n]=bossP(u);if(u.bt%P!==ph)return ev;
 if(u.bs==='howl')for(const m of s.units)if(m.team===u.team&&!m.dead){m.buff={pct:.3,turns:2};ev.push({type:'status',t:m,text:m===u?'Hurlement ! +30 %':'+30 %',color:'#ffd65a',snd:m===u?'bite':undefined})}
 if(u.bs==='shell'){u.shield=1;ev.push({type:'fx',x:u.x,y:u.y,i:7,w:1.5},{type:'status',t:u,text:'Carapace',color:'#9fd0ff',snd:'guard'})}
  if(u.bs==='quake'){s.sigUsed=1;ev.push({type:'status',t:u,text:'Séisme !',color:'#ffa040',snd:'smash'},{type:'shake',ms:400});const d=Math.round((u.atk.dmg[0]+u.atk.dmg[1])/2*.6*weakK(u));
  for(const h of s.units)if(h.team!==u.team&&!h.dead&&Math.abs(h.x-u.x)+Math.abs(h.y-u.y)<=3){ev.push({type:'fx',x:h.x,y:h.y,i:7,w:1.2});const e=hurt(s,h,d,'quake');if(e)ev.push(e)}}
 return ev}
// ---------- V4.0c : Titan prismatique ----------
// Phase 1 (> 66 % PV) : une ligne de 6 cases vers le héros le plus proche de l'axe · 2 : croix · 3 : croix, et un prisme allumé touché éclate (ses voisines aussi).
// Cycle de 3 tours du Titan : il marque les cases (Chargement), tire au tour suivant sur ces mêmes cases (même s'il a bougé), puis se repose.
export const beamPhase=u=>u.hp>u.max*2/3?1:u.hp>u.max/3?2:3;
export function beamCells(s,u){const ph=beamPhase(u),heroes=s.units.filter(h=>h.team!==u.team&&!h.dead),cells=[],pr=[];
 let dirs=DIRS;if(ph===1){let bs=1e9;for(const d of DIRS)for(const h of heroes){const al=(h.x-u.x)*d[0]+(h.y-u.y)*d[1],pe=Math.abs((h.x-u.x)*d[1]-(h.y-u.y)*d[0]),sc=pe*10+al;if(al>0&&sc<bs){bs=sc;dirs=[d]}}if(dirs===DIRS)dirs=[DIRS[0]]}
 for(const d of dirs)for(let k=1;k<=6;k++){const x=u.x+d[0]*k,y=u.y+d[1]*k,c=cell(s,x,y);if(!c)break;
  if(c.block){if(ph===3&&prismOn(s,c)){pr.push(c);cells.push(...prismHits(s,c).filter(p=>passable(s,p.x,p.y)))}break}cells.push({x,y})}
 return{by:u,o:{x:u.x,y:u.y},cells:cells.filter((p,i)=>cells.findIndex(q=>q.x===p.x&&q.y===p.y)===i),pr}}
export const beamDmg=u=>Math.round((u.atk.dmg[0]+u.atk.dmg[1])/2*(u.dmgMul||1)*weakK(u));
function beamTurn(s,u,ev){const ph=beamPhase(u);
 if(ph!==(u.ph||1)){u.ph=ph;ev.push({type:'wave',t:u},{type:'status',t:u,text:`Phase ${ph} !`,color:'#c98bff',snd:'titan_roar'},{type:'shake',ms:450})}
 u.bt=(u.bt||0)+1;
 if(s.beam&&s.beam.by===u){const b=s.beam,d=beamDmg(u);s.beam=null;ev.push({type:'beam',from:b.o||{x:u.x,y:u.y},cells:b.cells},{type:'status',t:u,text:'Rayon prismatique !',color:'#c98bff',snd:'beam_fire'},{type:'shake',ms:450});
  for(const c of b.pr){c.off=s.round+PRISM_OFF;ev.push({type:'fx',x:c.x,y:c.y,i:3,w:1.2,sh:'crystals'})}
  s.sigUsed=1;for(const p of b.cells){const h=occ(s,p.x,p.y),e=h&&h.team!==u.team&&hurt(s,h,d,'beam');if(e)ev.push(e)}}
 else if(u.bt%3===1){s.beam=beamCells(s,u);ev.push({type:'status',t:u,text:'Chargement du rayon…',color:'#c98bff',snd:'beam_charge'})}
 return ev}
// Intention d'un monstre : ce qu'il ferait s'il jouait maintenant (simulation à blanc, l'état est remis en place).
export function intent(s,u){const keep={x:u.x,y:u.y,pa:u.pa,pm:u.pm,backed:u.backed};u.pa=u.maxPA;u.pm=slowedPM(u);let r=null;
 for(let g=0;g<6;g++){const a=aiStep(s,u);if(!a)break;if(a.type==='cast'){const k=ampAt(s,u);r={target:a.target,dmg:a.sp.dmg.map(v=>Math.round(v*k*weakK(u))),amp:k>1,from:{x:u.x,y:u.y}};break}
  const[x,y]=a.to.split(',').map(Number);u.pm-=reach(s,u,u.pm).dist.get(a.to);u.x=x;u.y=y}
 Object.assign(u,keep);return r}

// ---------- V2.5c : piège (Chasseur) et renaissance (Guérisseuse) ----------
// Piège posé par un héros : u.trap={x,y,left} (3 de ses tours). Déclenché par un ennemi qui y entre (marche ou poussée).
export const trapAt=(s,x,y,team)=>s.units.find(h=>h.trap&&h.trap.x===x&&h.trap.y===y&&h.team!==team);
function spring(s,u,h,x,y){const g=h.trap.glyph;delete h.trap;
 if(g){const ev=[{type:'fx',x,y,i:1,w:1.3,sh:'fxi'},{type:'status',t:u,text:'Glyphe !',color:'#ffd65a',snd:'trap'}],e=hurt(s,u,power(h,g.sp,u,ri(s.rng,...g.sp.dmg),g.amp,1,false),'trap');if(e)ev.push(e);return ev}
 const ev=[{type:'fx',x,y,i:1,w:1.1,sh:'fxi'},{type:'status',t:u,text:'Piège !',color:'#ffa040',snd:'trap'}],e=hurt(s,u,10,'trap');if(e)ev.push(e);if(!u.dead)u.slow=u.slow||1;return ev}
// à appeler après chaque case parcourue : renvoie les événements (vide si pas de piège)
export function stepOn(s,u){const h=trapAt(s,u.x,u.y,u.team);return h?spring(s,u,h,u.x,u.y):[]}
const koAt=(s,u,c)=>s.units.find(o=>o.dead&&o.team===u.team&&o!==u&&o.x===c.x&&o.y===c.y);
// case où le héros relevé réapparaît : la sienne si libre, sinon une voisine libre
function reviveSpot(s,h){if(!occ(s,h.x,h.y))return{x:h.x,y:h.y};for(const[dx,dy]of DIRS){const x=h.x+dx,y=h.y+dy;if(passable(s,x,y)&&!occ(s,x,y))return{x,y}}return null}
function revive(s,u,c){const h=koAt(s,u,c),p=h&&reviveSpot(s,h);if(!p)return[];
 h.x=h.gx=p.x;h.y=h.gy=p.y;h.dead=false;h.hp=Math.max(1,Math.round(h.max*.25));delete h.poison;delete h.slow;delete h.curse;delete h.counter;delete h.buff;delete h.carry;h.shield=0;
 return[{type:'fx',x:p.x,y:p.y,i:4,w:1.4},{type:'status',t:h,text:'Renaissance !',color:'#7dff8a',snd:'levelup'},{type:'heal',t:h,amt:h.hp}]}
