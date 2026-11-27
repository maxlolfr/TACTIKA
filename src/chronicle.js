// V4.86 : Chronique (petits ajouts premium avant la V5.0) : statistiques, bestiaire, collection, records, complétion des régions, 40 trophées.
// Logique pure (aucun DOM) : testable sous Node. Sauvegarde additive `save.cr` ; les anciennes sauvegardes ne reçoivent que ce qui se déduit
// de leur état (régions, niveau, quêtes, étoiles, objets) ; les compteurs (ennemis vaincus, dégâts, temps) partent de zéro, rien n'est inventé.
import {ZONES,MON,ITEMS,HER,zlen} from './data.js';
import {QUESTS} from './quests.js';

const obj=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{};
const num=o=>{for(const k of Object.keys(o))if(!Number.isFinite(o[k]))delete o[k];return o};
// cr.s : compteurs · cr.hu : combats par héros · cr.be : bestiaire {clé:{k:vaincus}} · cr.co : objets découverts · cr.tri : trios victorieux · cr.rec : records · cr.tr : trophées {id:horodatage}
export function cleanChron(save){const c=obj(save.cr);save.cr={s:num(obj(c.s)),hu:num(obj(c.hu)),be:obj(c.be),co:num(obj(c.co)),tri:num(obj(c.tri)),rec:num(obj(c.rec)),tr:num(obj(c.tr))};
 for(const k of Object.keys(save.cr.be))if(!beastOk(k))delete save.cr.be[k];else save.cr.be[k]={k:Number.isFinite(save.cr.be[k]?.k)?save.cr.be[k].k:0};
 for(const k of Object.keys(save.cr.tr))if(!TROPHIES.some(t=>t.id===k))delete save.cr.tr[k];
 syncCollection(save);return save.cr}
// collection : tout objet possédé un jour reste découvert, même revendu
export function syncCollection(save){const co=save.cr.co;for(const j of save.items||[])if(ITEMS[j]&&!co[j])co[j]=1;return co}

// ---------- bestiaire ----------
// clés : nom de monstre (MON) ou « b:<région> » pour un boss. Liste des créatures qu'on peut réellement rencontrer.
export const bossKey=zi=>'b:'+ZONES[zi].id;
export const BEASTS=(()=>{const s=new Set();
 for(const z of ZONES){for(const k of z.pool||[])s.add(k);for(const f of z.fights||[])for(const k of f.en||[])s.add(k);for(const k of Object.values(z.elite||{}))if(typeof k==="string")s.add(k);
  for(const w of Object.values(z.waves||{}))for(const a of w?.add||[])if(a[2])s.add(a[2]);if(z.boss?.summon?.k)s.add(z.boss.summon.k)}
 for(const q of QUESTS)if(q.e)s.add(q.e);
 return[...[...s].filter(k=>MON[k]),...ZONES.map((_,i)=>bossKey(i))]})();
function beastOk(k){return BEASTS.includes(k)}
export const beastInfo=k=>{if(k.startsWith('b:')){const zi=ZONES.findIndex(z=>'b:'+z.id===k),B=ZONES[zi].boss,m=MON[B.k];return{n:B.n,s:B.s||m.s,row:B.s?0:m.row||0,zone:ZONES[zi].n,boss:1,ai:m.ai,r:m.r,fly:m.fly,armor:m.armor}}
 const m=MON[k],zi=ZONES.findIndex(z=>(z.pool||[]).includes(k)||(z.fights||[]).some(f=>(f.en||[]).includes(k)));return{n:m.n,s:m.s,row:m.row||0,zone:zi>=0?ZONES[zi].n:'',ai:m.ai,r:m.r,fly:m.fly,armor:m.armor,poison:m.poison,slow:m.slow}};
// capacités lisibles, sans chiffres ni secrets de boss
export function beastTraits(k){const b=beastInfo(k),t=[];
 t.push({tank:'Encaisse et protège',flank:'Contourne et harcèle',range:'Attaque à distance'}[b.ai]||'Fonce au contact');
 if(b.r&&b.r[1]>1&&b.ai!=='range')t.push('Portée '+b.r[1]);if(b.fly)t.push('Vole au-dessus des obstacles');if(b.armor)t.push('Armure');
 if(b.poison)t.push('Empoisonne');if(b.slow)t.push('Ralentit');if(b.boss)t.push('Boss de région');return t}

// ---------- combat : décompte des dégâts, soins et coups (appelé à chaque lot d'événements) ----------
// cur = l'unité dont c'est le tour (les dégâts infligés pendant le tour d'un héros lui sont attribués)
export function tally(T,ev,cur){for(const e of ev||[]){if(!e||!e.t)continue;
 if(e.type==='hurt'){if(e.t.team==='m'){T.dmg+=e.amt;T.hit=Math.max(T.hit,e.amt);if(cur&&cur.team==='h')T.by[cur.hi]=(T.by[cur.hi]||0)+e.amt}else T.taken+=e.amt}
 if(e.type==='heal'&&e.t.team==='h'){T.heal+=e.amt;if(cur&&cur.team==='h')T.hb[cur.hi]=(T.hb[cur.hi]||0)+e.amt}}return T}
export const newTally=()=>({dmg:0,heal:0,taken:0,hit:0,by:{},hb:{}});

// ---------- fin de combat ----------
// R = {win, zi, boss, daily, quest, wave, rounds, secs, team:[héros], ko, kills:{clé:n}, seen:[clés], T}
// Renvoie {recs:[{k,old,v}] records battus, tr:[ids] trophées obtenus, mvp:indice du héros marquant ou -1}
export const REC={dmg:'Dégâts en un combat',hit:'Plus gros coup',kills:'Ennemis vaincus en un combat',fast:'Victoire la plus rapide (tours)'};
export function recordFight(save,R){const c=save.cr||cleanChron(save),s=c.s,add=(k,v)=>{s[k]=(s[k]||0)+v};
 add('fights',1);add(R.win?'win':'loss',1);add('time',Math.max(0,Math.min(3600,Math.round(R.secs||0))));
 const nk=Object.values(R.kills||{}).reduce((a,b)=>a+b,0);add('kills',nk);
 if(R.T){add('dmg',Math.round(R.T.dmg));add('heal',Math.round(R.T.heal));add('taken',Math.round(R.T.taken))}
 for(const i of R.team||[])c.hu[i]=(c.hu[i]||0)+1;
 for(const k of R.seen||[])if(beastOk(k)&&!c.be[k])c.be[k]={k:0};
 for(const[k,n]of Object.entries(R.kills||{}))if(beastOk(k))(c.be[k]||(c.be[k]={k:0})).k+=n;
 if(R.boss&&R.zi!=null){const bk=bossKey(R.zi);c.be[bk]||(c.be[bk]={k:0});if(R.win)c.be[bk].k++}
 const recs=[];
 if(R.win){if(R.boss)add('boss',1);if(R.daily)add('daily',1);if(R.quest)add('quest',1);
  const alive=(R.team||[]).length-(R.ko||0);if(R.boss&&!R.ko)add('flawless',1);if(alive===1&&(R.team||[]).length>1)add('solo',1);if(!R.wave&&R.rounds<=3)add('quick',1);
  if(R.team?.length)c.tri[[...R.team].sort((a,b)=>a-b).join('-')]=1;
  const cand={dmg:Math.round(R.T?.dmg||0),hit:Math.round(R.T?.hit||0),kills:nk};
  for(const[k,v]of Object.entries(cand))if(v>0&&v>(c.rec[k]||0)){if(c.rec[k])recs.push({k,old:c.rec[k],v});c.rec[k]=v}
  if(!R.wave&&R.rounds>0&&(!c.rec.fast||R.rounds<c.rec.fast)){if(c.rec.fast)recs.push({k:'fast',old:c.rec.fast,v:R.rounds});c.rec.fast=R.rounds}}
 let mvp=-1,bv=0;if(R.T)for(const i of R.team||[]){const v=(R.T.by[i]||0)+(R.T.hb[i]||0)*1.2;if(v>bv){bv=v;mvp=i}}
 syncCollection(save);return{recs,tr:checkTrophies(save),mvp}}

// ---------- complétion des régions ----------
export function stars3(save){let n=0;for(const z of ZONES)for(const v of save.st?.[z.id]||[])if(v===3)n++;return n}
export const questsDone=save=>QUESTS.filter(q=>save.q?.[q.id]).length;
export function completion(save,zi){const z=ZONES[zi],L=zlen(z),done=Math.min(L,save.z?.[z.id]||0),st=(save.st?.[z.id]||[]).slice(0,L).reduce((a,v)=>a+(v||0),0),
 qs=QUESTS.filter(q=>q.z===zi),qd=qs.filter(q=>save.q?.[q.id]).length,boss=done>=L;
 const parts=[done/L,st/(3*L),boss?1:0,...(qs.length?[qd/qs.length]:[])];
 return{missions:done,of:L,stars:st,starsOf:3*L,quests:qd,questsOf:qs.length,boss,pct:Math.round(100*parts.reduce((a,b)=>a+b,0)/parts.length)}}

// ---------- 40 trophées : 15 bronze, 15 argent, 9 or, 1 platine. Identifiants stables (ne jamais renuméroter). ----------
const zd=(save,zi)=>(save.z?.[ZONES[zi].id]||0)>=zlen(ZONES[zi]);
const S=(save,k)=>save.cr?.s?.[k]||0,nb=(o)=>Object.keys(o||{}).length,rec=i=>(save)=>(save.lvl||1)>=(HER[i]?.at||99);
const boss=(id,zi,t,n)=>({id,t,g:'Progression',n,d:`Vaincre ${ZONES[zi].boss.n} (${ZONES[zi].n})`,ok:s=>zd(s,zi)});
export const TROPHIES=[
 {id:'premier_pas',t:'b',g:'Progression',n:'Premier pas',d:'Gagner un premier combat',ok:s=>S(s,'win')>=1||(s.z?.prairie||0)>=1},
 boss('prairie',0,'b','Roi déchu'),boss('bois',1,'b','Silence des loups'),boss('cote',2,'b','Pinces brisées'),
 {id:'niv10',t:'b',g:'Progression',n:'Aguerri',d:'Atteindre le niveau 10',ok:s=>(s.lvl||1)>=10},
 {id:'orion',t:'b',g:'Exploration',n:'L’apprenti mage',d:'Recruter Orion',ok:rec(3)},
 {id:'quetes5',t:'b',g:'Exploration',n:'Bonne âme',d:'Terminer 5 quêtes',ok:s=>questsDone(s)>=5},
 {id:'bestiaire10',t:'b',g:'Collection',n:'Curieux',d:'Découvrir 10 fiches du bestiaire',ok:s=>nb(s.cr?.be)>=10},
 {id:'etoiles1',t:'b',g:'Maîtrise',n:'Sans bavure',d:'Gagner une mission avec 3 étoiles',ok:s=>stars3(s)>=1},
 {id:'chasseur100',t:'b',g:'Maîtrise',n:'Chasseur',d:'Vaincre 100 ennemis',ok:s=>S(s,'kills')>=100},
 {id:'defi1',t:'b',g:'Exploration',n:'Défi relevé',d:'Réussir un défi du jour',ok:s=>S(s,'daily')>=1||!!s.dd},
 {id:'eclair',t:'b',g:'Maîtrise',n:'Éclair',d:'Gagner un combat en 3 tours ou moins (hors survie)',ok:s=>S(s,'quick')>=1},
 {id:'collection10',t:'b',g:'Collection',n:'Fouineur',d:'Découvrir 10 équipements',ok:s=>nb(s.cr?.co)>=10},
 {id:'forge1',t:'b',g:'Collection',n:'Premier coup de marteau',d:'Améliorer un objet à la Forge',ok:s=>Object.values(s.up||{}).some(v=>v>0)},
 {id:'trios5',t:'b',g:'Maîtrise',n:'Esprit d’équipe',d:'Gagner avec 5 trios de héros différents',ok:s=>nb(s.cr?.tri)>=5},
 boss('monts',3,'a','Colosse abattu'),boss('chateau',4,'a','Chute du chevalier'),boss('cristal',5,'a','Lumière du prisme'),
 boss('braise',6,'a','Cœur d’obsidienne'),boss('sables',7,'a','Tombeau scellé'),boss('marais',8,'a','Marais purifié'),
 {id:'nyra',t:'a',g:'Exploration',n:'Ombre alliée',d:'Recruter Nyra',ok:rec(4)},
 {id:'lyria',t:'a',g:'Exploration',n:'Serment de lumière',d:'Recruter Lyria',ok:rec(5)},
 {id:'niv30',t:'a',g:'Progression',n:'Vétéran',d:'Atteindre le niveau 30',ok:s=>(s.lvl||1)>=30},
 {id:'quetes20',t:'a',g:'Exploration',n:'Protecteur des terres',d:'Terminer 20 quêtes',ok:s=>questsDone(s)>=20},
 {id:'bestiaire30',t:'a',g:'Collection',n:'Naturaliste',d:'Découvrir 30 fiches du bestiaire',ok:s=>nb(s.cr?.be)>=30},
 {id:'etoiles30',t:'a',g:'Maîtrise',n:'Stratège',d:'Obtenir 3 étoiles dans 30 missions',ok:s=>stars3(s)>=30},
 {id:'sans_faute',t:'a',g:'Maîtrise',n:'Sans une égratignure',d:'Vaincre un boss sans perdre de héros',ok:s=>S(s,'flawless')>=1},
 {id:'dernier_debout',t:'a',g:'Maîtrise',n:'Dernier debout',d:'Gagner avec un seul héros encore debout',ok:s=>S(s,'solo')>=1},
 {id:'collection60',t:'a',g:'Collection',n:'Collectionneur',d:'Découvrir 60 équipements',ok:s=>nb(s.cr?.co)>=60},
 boss('citadelle',9,'o','Ciel apaisé'),boss('givre',10,'o','Fin de l’hiver éternel'),boss('eter',11,'o','Gardiens de l’Éther'),
 {id:'niv50',t:'o',g:'Progression',n:'Légende',d:'Atteindre le niveau 50',ok:s=>(s.lvl||1)>=50},
 {id:'quetes40',t:'o',g:'Exploration',n:'Héros du village',d:'Terminer les 40 quêtes',ok:s=>questsDone(s)>=QUESTS.length},
 {id:'etoiles120',t:'o',g:'Maîtrise',n:'Perfection',d:'Obtenir 3 étoiles dans les 120 missions',ok:s=>stars3(s)>=ZONES.reduce((a,z)=>a+zlen(z),0)},
 {id:'collection_totale',t:'o',g:'Collection',n:'Trésor complet',d:'Découvrir tous les équipements',ok:s=>nb(s.cr?.co)>=ITEMS.length},
 {id:'bestiaire_complet',t:'o',g:'Collection',n:'Encyclopédie vivante',d:'Compléter le bestiaire',ok:s=>BEASTS.every(k=>s.cr?.be?.[k])},
 {id:'trios20',t:'o',g:'Maîtrise',n:'Maître tacticien',d:'Gagner avec les 20 trios de héros',ok:s=>nb(s.cr?.tri)>=20},
 {id:'platine',t:'p',g:'Platine',n:'Gardien de l’Éther',d:'Obtenir tous les autres trophées',ok:s=>TROPHIES.every(t=>t.id==='platine'||s.cr?.tr?.[t.id])}];
export const TIER={b:{n:'Bronze',c:'#d08a4e'},a:{n:'Argent',c:'#cfd8e6'},o:{n:'Or',c:'#ffd65a'},p:{n:'Platine',c:'#9fe8ff'}};
// nouveaux trophées (dans l'ordre de la liste, le platine en dernier) ; horodatés dans cr.tr
export function checkTrophies(save,now=Date.now()){const c=save.cr||cleanChron(save),got=[];
 for(const t of TROPHIES)if(!c.tr[t.id]&&t.ok(save)){c.tr[t.id]=now;got.push(t.id)}return got}
