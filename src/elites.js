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
export const statK=ids=>({hp:Math.min(CAP.hp,ids.reduce((a,id)=>a*MODS[id].hp,1)),dmg:Math.min(CAP.dmg,ids.reduce((a,id)=>a*MODS[id].dmg,1))});
// Applique des modificateurs à un monstre déjà créé (stats de la région comprises). Ignore une combinaison invalide.
export function applyMods(u,ids,lang='fr'){if(!compatible(ids)||u.team!=='m')return false;const k=statK(ids);
 u.mods=[...ids];u.hp=u.max=Math.round(u.max*k.hp);u.atk={...u.atk,dmg:u.atk.dmg.map(v=>Math.round(v*k.dmg))};
 const base=u.tag&&u.n.endsWith(' '+u.tag)?u.n.slice(0,-u.tag.length-1):u.n; // la lettre de repère reste à la fin
 u.n=base+' ('+ids.map(id=>lang==='en'?MODS[id].en:MODS[id].n).join(', ')+')'+(u.tag?' '+u.tag:''); /* « Gelée (Gardien) » : neutre, sans accord */u.h*=1.1;u.xp=Math.round(u.xp*1.6);return true}
// Monstre éligible : ni boss, ni sbire, ni chef, ni élite historique, ni renfort, ni déjà modifié
export const eligible=u=>u.team==='m'&&!u.dead&&!u.boss&&!u.minion&&!u.chief&&!u.elite&&!u.reinf&&!u.mods;
// Tirage reproductible, sur sa propre graine (ne consomme jamais le hasard du combat).
// cm = {seed, mods:[ids] | pool:[ids], n:nombre d'élites (1 au lot 1)}. Renvoie les monstres modifiés.
export function elitize(s,cm,lang){if(!cm)return[];const rng=mulberry((cm.seed|0)+7177),out=[];
 for(let k=0;k<(cm.n||1);k++){const c=s.units.filter(eligible);if(!c.length)break;
  c.sort((a,b)=>b.max-a.max||(a.id<b.id?-1:1)); // le plus robuste d'abord, puis tirage parmi les 2 premiers : l'élite compte
  const u=c[Math.floor(rng()*Math.min(2,c.length))],ids=cm.mods||(cm.pool?.length?[cm.pool[Math.floor(rng()*cm.pool.length)]]:null);if(!ids)break;if(applyMods(u,ids,lang))out.push(u)}
 return out}

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
export const modState=u=>u.mods?{mods:[...u.mods],regen:u.regen||0,bcd:u.bcd||0,prime:u.prime?{o:{...u.prime.o},cells:u.prime.cells.map(c=>({...c})),r:u.prime.r}:null}:null;

