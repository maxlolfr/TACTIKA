import {CM_BOSSES,CM_LVL} from './data.js'; // V5.14 : boss pilotes du Cauchemar
// V5.10 · Cauchemar lot 1 : moteur universel des élites à modificateurs.
// Pur (ni DOM, ni canvas, ni son, ni horloge). Rien ici n'est utilisé par la campagne normale :
// un monstre n'a de modificateur que si le combat porte une description Cauchemar (F.cm), posée
// seulement par l'accès de développement isolé (?cauchemar). Sans u.mods, chaque accroche renvoie 1 ou [].
//
// Un modificateur = des données (registre MODS) + au plus quatre accroches :
//   out(u,t)     multiplicateur des dégâts que u inflige (Berserker)
//   aura(s,g,t)  multiplicateur des dégâts que subit t, allié de g (Gardien) — non cumulable entre gardiens
//   turn(s,u,M)  événements au début du tour de u (Régénérateur, Explosif)
//   root(u)      vrai si u ne peut pas se déplacer ce tour (Explosif amorcé)
// Ajouter un modificateur = ajouter une entrée dans MODS (n, en, d, de, ico, col, cost, tags, hp, dmg + accroches).
// Le cumul (champions, V5.12) passe par compatible() : MOD_MAX modificateurs, budget, exclusions, une seule accroche
// d'aura par monstre. Les plafonds de statistiques (CAP) s'appliquent au produit des facteurs : jamais un sac à PV.
import {CURSE_K} from './data.js';

const man=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
const mulberry=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};

export const MOD_MAX=2;               // cumul futur : au plus 2 modificateurs compatibles (lot 1 : 1 seul)
export const MOD_BUDGET=4;            // somme des coûts permise sur un monstre
export const CAP={hp:1.35,dmg:1.15};  // plafonds du brief ChatGPT : PV ×1,35 et dégâts ×1,15 au plus, cumul compris

export const MODS={
 berserk:{n:'Berserker',en:'Berserker',ico:'berserk',col:'#ff4a3a',cost:2,tags:['off'],hp:1.25,dmg:1,
  thr:.5,k:1.35,
  d:'Sous 50 % de ses PV : dégâts ×1,35. Fais-le passer d’un coup sous la moitié et achève-le, ou affaiblis-le.',
  de:'Below 50% HP: damage ×1.35. Take it below half in one burst and finish it, or weaken it.',
  out(u){return u.hp<=u.max*this.thr?this.k:1}},
 garde:{n:'Gardien',en:'Guardian',ico:'garde',col:'#5ab8ff',cost:2,tags:['def','aura'],hp:1.35,dmg:1,
  r:2,k:.3,
  d:'Ses alliés à 2 cases ou moins subissent −30 % de dégâts (pas lui). Abats-le d’abord, ou éloigne ses alliés (poussée).',
  de:'Allies within 2 tiles take −30% damage (not itself). Kill it first, or push its allies away.',
  aura(s,g,t){return g!==t&&man(g,t)<=this.r?1-this.k:1}},
 regen:{n:'Régénérateur',en:'Regenerator',ico:'regen',col:'#5fe07a',cost:2,tags:['sustain'],hp:1.2,dmg:1.05,
  pct:.08,cap:.4,
  d:'Début de son tour : +8 % de ses PV, au plus 40 % par combat. Brûlé : rien ; maudit : moitié.',
  de:'Start of its turn: +8% of its HP, at most 40% per battle. Burning: none; cursed: half.',
  turn(s,u){const left=Math.round(u.max*this.cap)-(u.regen||0);if(left<=0||u.hp>=u.max)return[];
   if(u.burn)return[{type:'status',t:u,text:'Régénération bloquée',color:'#ffb060'}];
   const g=Math.min(left,u.max-u.hp,Math.round(u.max*this.pct*(u.curse?CURSE_K:1)));if(g<=0)return[];
   u.hp+=g;u.regen=(u.regen||0)+g;return[{type:'fx',x:u.x,y:u.y,i:4,w:1.1},{type:'heal',t:u,amt:g,src:'regen'}]}},
 bombe:{n:'Explosif',en:'Volatile',ico:'bombe',col:'#ffa53a',cost:2,tags:['burst'],hp:1.15,dmg:1,
  trig:3,k:1.6,cd:3,
  d:'Un héros à 3 cases ou moins : il s’amorce, ne bouge plus et marque les 9 cases autour de lui ; il explose au début de son tour suivant. Sors des cases ou abats-le avant : il est désamorcé.',
  de:'A hero within 3 tiles: it primes, stops moving and marks the 9 tiles around it; it explodes at the start of its next turn. Leave the tiles or kill it first: it is defused.',
  turn(s,u,M){const ev=[];
   if(u.prime){const P=u.prime,d=boomDmg(u);delete u.prime;u.bcd=this.cd;ev.push({type:'boom',t:u,cells:P.cells},{type:'status',t:u,text:'Explosion !',color:'#ffa53a',snd:'smash'},{type:'shake',ms:320});
    for(const p of P.cells){const h=s.units.find(o=>!o.dead&&o.team!==u.team&&o.x===p.x&&o.y===p.y);if(h){const e=M.hurt(s,h,d,'boom');if(e)ev.push(e)}}return ev}
   if(u.bcd>0){u.bcd--;return ev}
   if(s.units.some(h=>!h.dead&&h.team!==u.team&&man(h,u)<=this.trig)){u.prime={o:{x:u.x,y:u.y},cells:boomCells(s,u),r:s.round};u.pm=0;
    ev.push({type:'status',t:u,text:'Amorçage !',color:'#ffa53a',snd:'enemy_warning'})}
   return ev},
  root(u){return !!u.prime}}
};
export const MOD_IDS=Object.keys(MODS);
// Exclusions (paires interdites au cumul) : deux auras, ou deux façons de durer, rendraient le monstre interminable.
export const EXCL=[['garde','regen']];

// Explosif : 9 cases (lui et ses 8 voisines, diagonales comprises) existant sur le plateau
export function boomCells(s,u){const out=[];for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){const x=u.x+dx,y=u.y+dy;if(s.map.has(x+','+y))out.push({x,y})}return out}
export const boomDmg=u=>Math.round((u.atk.dmg[0]+u.atk.dmg[1])/2*MODS.bombe.k*(u.weak?1-u.weak.pct:1));

// ---------- composition ----------
export function compatible(ids){if(!Array.isArray(ids)||!ids.length||ids.length>MOD_MAX)return false;
 if(new Set(ids).size!==ids.length||!ids.every(id=>MODS[id]))return false;
 if(ids.reduce((a,id)=>a+MODS[id].cost,0)>MOD_BUDGET)return false;
 if(EXCL.some(([a,b])=>ids.includes(a)&&ids.includes(b)))return false;
 return ids.filter(id=>MODS[id].aura).length<=1}
// V5.11 · champions : palier au-dessus des élites. Toujours 2 modificateurs compatibles (= 2 capacités), bonus propre
// (CH_K) et plafonds propres (CAP_CH), plus gros (h ×1,7 au lieu de ×1,3), plus d'XP. Les élites restent comme en V5.10.2.
export const CAP_CH={hp:1.6,dmg:1.25},CH_K={hp:1.2,dmg:1.08,h:1.7,xp:2.6};
export const statK=(ids,ch)=>{const C=ch?CAP_CH:CAP,b=ch?CH_K:{hp:1,dmg:1};return{hp:Math.min(C.hp,b.hp*ids.reduce((a,id)=>a*MODS[id].hp,1)),dmg:Math.min(C.dmg,b.dmg*ids.reduce((a,id)=>a*MODS[id].dmg,1))}};
// paires compatibles (champions), dans un ordre stable
export const pairs=pool=>{const P=pool||MOD_IDS,o=[];for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++)if(compatible([P[i],P[j]]))o.push([P[i],P[j]]);return o};
// Applique des modificateurs à un monstre déjà créé (stats de la région comprises). Ignore une combinaison invalide.
export function applyMods(u,ids,lang='fr',ch){if(!compatible(ids)||u.team!=='m'||(ch&&ids.length!==2))return false;const k=statK(ids,ch);
 u.mods=[...ids];if(ch)u.champ=1;u.hp=u.max=Math.round(u.max*k.hp);u.atk={...u.atk,dmg:u.atk.dmg.map(v=>Math.round(v*k.dmg))};
 const base=u.tag&&u.n.endsWith(' '+u.tag)?u.n.slice(0,-u.tag.length-1):u.n; // la lettre de repère reste à la fin
 u.n=base+' ('+(ch?'Champion'+(lang==='en'?': ':' : '):'')+ids.map(id=>lang==='en'?MODS[id].en:MODS[id].n).join(', ')+')'+(u.tag?' '+u.tag:''); /* « Gelée (Gardien) » : neutre, sans accord */u.h*=ch?CH_K.h:1.3;u.xp=Math.round(u.xp*(ch?CH_K.xp:1.6));return true}
// Monstre éligible : ni boss, ni sbire, ni chef, ni élite historique, ni renfort, ni déjà modifié
export const eligible=u=>u.team==='m'&&!u.dead&&!u.boss&&!u.minion&&!u.chief&&!u.elite&&!u.reinf&&!u.mods;
// Tirage reproductible, sur sa propre graine (ne consomme jamais le hasard du combat).
// cm = {seed, mods:[ids] | pool:[ids], n:nombre d'élites (1 au lot 1)}. Renvoie les monstres modifiés.
export function elitize(s,cm,lang){if(!cm)return[];const rng=mulberry((cm.seed|0)+7177),out=[];
 const used=new Set();
 // V5.11 : champions d'abord (cm.champ, 0 par défaut : sans lui, le tirage des élites est celui de la V5.10.2) ; cm.cmods force la paire
 for(let k=0;k<(cm.champ||0);k++){const c=s.units.filter(eligible);if(!c.length)break;c.sort((a,b)=>b.max-a.max||(a.id<b.id?-1:1));
  const u=c[Math.floor(rng()*Math.min(2,c.length))],P=pairs(cm.pool),ids=cm.cmods||(P.length?P[Math.floor(rng()*P.length)]:null);if(!ids)break;
  if(applyMods(u,ids,lang,1)){ids.forEach(id=>used.add(id));out.push(u)}}
 for(let k=0;k<(cm.n??1);k++){const c=s.units.filter(eligible);if(!c.length)break;
  c.sort((a,b)=>b.max-a.max||(a.id<b.id?-1:1)); // le plus robuste d'abord, puis tirage parmi les 2 premiers : l'élite compte
  const u=c[Math.floor(rng()*Math.min(2,c.length))],fr0=cm.pool?.filter(id=>!used.has(id)),fr=fr0&&!fr0.length&&cm.champ?cm.pool:fr0,ids=cm.mods||(fr?.length?[fr[Math.floor(rng()*fr.length)]]:null);if(!ids)break;ids.forEach(id=>used.add(id));/* V5.10.2 : élites toutes différentes */if(applyMods(u,ids,lang))out.push(u)}
 return out}

// V5.10.2 : renforcement Cauchemar de tous les monstres de la rencontre (boss compris), avant le tirage des élites.
// cm.hp / cm.dmg : facteurs globaux (1 = aucun). Distinct des plafonds CAP, qui ne concernent que la part « élite ».
export function nightmare(s,cm){const h=cm.hp||1,d=cm.dmg||1;
 if(h!==1||d!==1)for(const u of s.units)if(u.team==='m'){u.hp=u.max=Math.round(u.max*h);u.atk={...u.atk,dmg:u.atk.dmg.map(v=>Math.round(v*d))}}
 // V5.14 : boss du Cauchemar (cm.boss) : PV en plus, phase plus tôt (rageAt), signature plus fréquente (cmFast) ; nom marqué ☠
 const B=cm.boss&&s.units.find(u=>u.team==='m'&&u.boss);if(B){B.hp=B.max=Math.round(B.max*(cm.boss.hp||1));if(cm.boss.rage)B.rageAt=cm.boss.rage;if(cm.boss.fast)B.cmFast=1;B.cmBoss=1;B.h=Math.min(3,Math.max(B.h*1.35,2.3));B.n='☠ '+B.n}}
// ---------- accroches (appelées par rules.js ; sans u.mods, valeurs neutres) ----------
export function modOut(u,t){if(!u.mods)return 1;let k=1;for(const id of u.mods)if(MODS[id].out)k*=MODS[id].out(u,t);return k}
// Gardien : la meilleure protection seulement (deux gardiens ne s'additionnent pas)
export function modIn(s,t){if(t.team!=='m'||!s.cmOn)return{k:1};let k=1,by=null;
 for(const g of s.units)if(g.mods&&!g.dead&&g.team===t.team)for(const id of g.mods){const f=MODS[id].aura?.(s,g,t)??1;if(f<k){k=f;by=g}}
 return{k,by}}
export function modTurn(s,u,M){if(!u.mods||u.dead)return[];const ev=[];for(const id of u.mods)if(MODS[id].turn)ev.push(...MODS[id].turn(s,u,M));return ev}
export const rooted=u=>!!u.mods&&u.mods.some(id=>MODS[id].root?.(u));
// Description pour la fiche du monstre et l'aide (FR / EN)
export const modText=(u,lang='fr')=>(u.mods||[]).map(id=>`${lang==='en'?MODS[id].en:MODS[id].n} : ${lang==='en'?MODS[id].de:MODS[id].d}`);
// Cases d'explosion annoncées (pour l'affichage et l'aide)
export const booms=s=>s.units.filter(u=>!u.dead&&u.prime).map(u=>({by:u,cells:u.prime.cells,d:boomDmg(u)}));
// Sérialisation : l'état Cauchemar d'un monstre ne contient que des nombres, des chaînes et des cases (JSON sûr)
export const modState=u=>u.mods?{mods:[...u.mods],champ:u.champ?1:0,regen:u.regen||0,bcd:u.bcd||0,prime:u.prime?{o:{...u.prime.o},cells:u.prime.cells.map(c=>({...c})),r:u.prime.r}:null}:null;


// V5.14 · Cauchemar lot 2 : description Cauchemar d'un combat (pure, partagée par le jeu et tools/sim.mjs).
// Rencontre : 1 champion + 2 élites, +2 monstres, PV ×1,25, dégâts ×1,2, niveau 50.
// Boss des régions 1 à 3 : 2 élites d'escorte, PV ×1,15, phase à 60 %. Boss pilotes : paquet de CM_BOSSES (1 élite). Variables CME, CMX, CMBH, CMBD, CMP* : essais du simulateur seulement.
export function cmSpec(F,zi,o={}){const base={seed:o.seed??F.seed,mods:o.mods||null,pool:['berserk','garde','regen','bombe'],hp:1.25,dmg:1.2};
 if(!F.boss)return{...F,lvl:CM_LVL,lang:o.lang,cm:{...base,n:2,champ:o.champ??1,extra:2}};
 const P=CM_BOSSES.find(b=>b.zi===zi)||{bhp:1.15,rage:.6,fast:0,sum:0,esc:+(globalThis.process?.env?.CME??2),ext:+(globalThis.process?.env?.CMX??0)},B={...F.boss,...(F.boss.summon&&P.sum?{summon:{...F.boss.summon,n:F.boss.summon.n+P.sum}}:{})};
 return{...F,boss:B,lvl:CM_LVL,lang:o.lang,...(P.cry&&F.cry?{cry:{...F.cry,p:(F.cry.p||0)+P.cry}}:{}),cm:{...base,hp:+(globalThis.process?.env?.CMBH||P.gh||base.hp),dmg:+(globalThis.process?.env?.CMBD||P.gd||base.dmg),mods:null,n:+(globalThis.process?.env?.CMPE??P.esc??1),champ:0,extra:P.ext??1,boss:{hp:+(globalThis.process?.env?.CMPB??P.bhp),rage:+(globalThis.process?.env?.CMPR??P.rage),fast:+(globalThis.process?.env?.CMPF??P.fast)}}}}
