// Boucle de tours : enchaîne les unités, joue les animations et rejoue les événements des règles.
import {G,hooks} from './game.js';
import {wait,tween} from './util.js';
import {chargeDest,pathTo,face,payCost,applySpell,stepOn,beginTurn,bossTurn,eliteTurn,poisonTick,endTurn,outcome,aiStep,reach,waveTick,waveEmpty,lavaTick,iceTick} from './rules.js';
import {addFx,addProj,say,pose,shake,punch,burst,addRefs,addBeam,addWave,keepInView,TH,impact,hitStop,dodgeMove} from './render.js';
import {sfx,voice} from './audio.js';
import {tally} from './chronicle.js';

// Rejoue des événements produits par les règles (texte flottant, effet, son, secousse).
export function play(events){if(G.s?.T)tally(G.s.T,events,G.cur); // V4.86 : dégâts, soins et records du bilan
 for(const e of events){switch(e.type){
 case 'fx':addFx(e.x,e.y,e.i,e.w,550,e.sh||'fx');break;
 case 'hurt':{const t=e.t;{const sp=G.lastSp,k=e.src==='poison'?'magic':e.src==='burn'?'magic':e.src==='collision'?null:!sp?'slash':sp.proj&&!sp.orb?'pierce':sp.orb||sp.all||sp.nova||sp.r&&sp.r[1]>1?'magic':'slash';
  if(k)impact(t,k,e.src==='poison'?'#9be15d':e.src==='burn'?'#ff8a30':sp&&sp.orb||null);if(t.shield>0||t.ward)impact(t,'block');if(e.crit){impact(t,'magic','#ffd65a');hitStop(70)}else if(e.amt>=t.max*.3&&!e.killed)hitStop(45);
  if(e.killed&&t.boss){hitStop(160);impact(t,'boss');setTimeout(()=>{punch(t,.09,520);shake(450);burst(t,1);burst(t,4)},170)}}
 say(t,(e.crit?'Critique ! -':'-')+e.amt,e.src==='poison'?'#b9f26a':e.src==='burn'?'#ff9030':e.src==='collision'?'#ffa040':e.crit?'#ffd23a':'#ff6b5a',e.crit);pose(t,'h');t.flashT=performance.now()+120;sfx(e.src==='poison'?'poison':'hit',.7);if(e.crit){sfx('critical',.9);punch(t,.06)}
  if(e.killed){punch(t,.05,260);burst(t);addFx(t.gx,t.gy,15,1,900,'fxi',-.5);t.deadT=performance.now();setTimeout(()=>sfx(t.bs==='beam'?'titan_death':t.boss?'boss_death':'death'),150)}
  if(t.team==='h'){if(e.killed)setTimeout(()=>voice(t.k,'ko',{force:true}),300);
   else if(!e.saved&&e.src!=='poison'&&(e.crit||e.amt>=t.max*.25))voice(t.k,'hurt',{chance:.7})}
  if(e.saved){say(t,'Dernier rempart !','#9fd0ff',true);sfx('guard',.8)}
  if(e.prot)say(t,'⛨ protégé','#9fd8ff'); // V5.10 : Gardien
  if(e.spread)for(const o of e.spread)say(o,'Contagion','#b9f26a');
  if(e.spawn){addRefs(e.spawn);for(const m of e.spawn){m.dead=true;setTimeout(()=>{m.dead=false;addFx(m.x,m.y,6,1.1,600,'fxi');sfx(t.summon.snd||'slime',.8)},450)}setTimeout(()=>{pose(t,'s',900);say(t,t.summon.sn?'Appel de la meute !':'Invocation !','#7dff8a',true);sfx('enemy_warning',.7)},250)}break}
 case 'heal':say(e.t,(e.src==='regen'?'✚ +':'+')+e.amt,'#7dff8a');impact(e.t,'heal');break;
 case 'boom':for(const p of e.cells)addFx(p.x,p.y,7,1.1,600,'fx');burst(e.t,4);punch(e.t,.08,300);break; // V5.10 : Explosif
 case 'status':say(e.t,e.text,e.color);if(e.snd==='dodge'&&e.t.gx!=null){dodgeMove(e.t);impact(e.t,'dodge')}else if(/^Bouclier −/.test(e.text||'')&&e.t.gx!=null)impact(e.t,'block');if(e.snd)sfx(e.snd,.8);break;
 case 'snd':sfx(e.n,e.v||.8);break;
 case 'shake':shake(e.ms);break;
 case 'beam':addBeam(e.from,e.cells);break;
 case 'wave':addWave(e.t);punch(e.t,.07,320);break;
 case 'push':{const t=e.t,x0=t.gx,y0=t.gy;sfx('push',.8);tween(200,k=>{t.gx=x0+(e.to.x-x0)*k;t.gy=y0+(e.to.y-y0)*k});break}
 case 'collision':setTimeout(()=>{sfx('collision',.9);shake(200);punch(e.t,.04);burst(e.t,4);addFx(e.t.gx,e.t.gy,1,1.1,500,'fxi',-.2)},200);break;
 case 'combo':say(e.t,'Combo ×'+e.n,'#ff9cf2',true);addFx(e.t.gx,e.t.gy,14,.8,800,'ico',-.9);sfx('combo_'+e.n,.9)}}}

export async function cast(u,sp,c){const S=G.s; // l'état du combat en cours, même si on fuit pendant l'animation
 payCost(u,sp,c);keepInView(c.x,c.y);
 pose(u,u.team==='h'&&(sp.t==='ally'||sp.t==='self'||sp.t==='dead'||sp.trap||sp.wall||sp.blink)?(sp.shield?'b':'c'):'a',sp.shield?700:450);G.busy=true;hooks.render();sfx(sp.snd);if(u.team==='h'&&sp.vx)voice(u.k,sp.vx,{chance:.6});
 if(sp.proj){addProj(u,c,sp.orb);await wait(260);if(!sp.orb)sfx('arrowhit',.8)}
 else if(sp.charge){const d=chargeDest(S,u,sp,c);if(d){u.walk=1;let st=0;for(const[x,y]of d.path){const x0=u.gx,y0=u.gy;st++;await tween(110,t=>{u.gx=x0+(x-x0)*t;u.gy=y0+(y-y0)*t;u.wf=st*2+(t<.5?0:1)})}u.walk=0}}
 else if(sp.r[1]===1&&sp.t==='enemy'){const dx=(c.x-u.x)*.35,dy=(c.y-u.y)*.35;await tween(110,t=>{u.gx=u.x+dx*t;u.gy=u.y+dy*t});tween(160,t=>{u.gx=u.x+dx*(1-t);u.gy=u.y+dy*(1-t)})}
 else await wait(180);
 G.lastSp=sp;play(applySpell(S,u,sp,c));G.lastSp=null;
 await wait(420);G.busy=false;
}
export async function moveTo(u,k,prev){const path=pathTo(u,k,prev);
 G.busy=true;hooks.render();u.walk=1;let st=0;for(const[x,y]of path){const fx0=u.gx,fy0=u.gy;
  face(u,x,y);st++;
  await tween(220,t=>{u.gx=fx0+(x-fx0)*t;u.gy=fy0+(y-fy0)*t;u.wf=st*2+(t<.5?0:1);u.hop=Math.sin(t*Math.PI)*TH*.06});u.x=x;u.y=y;u.gx=x;u.gy=y;u.hop=0;u.pm--;sfx('step',.5,u.team==='m'?.8:1.1);
  const ev=stepOn(G.s,u);if(ev.length){u.walk=0;play(ev);await wait(500);break}}u.walk=0;
 G.busy=false}

// Termine le combat si un camp est éliminé. Renvoie true quand le combat est fini.
export function end(){if(G.phase!=='fight')return true;const o=outcome(G.s);if(!o){if(waveEmpty(G.s))hooks.newRound([]);return false}
 G.phase=o;if(o==='win')G.s.units.forEach(u=>{if(u.team==='h'&&!u.dead)pose(u,'v',9e9);else if(u.team==='m'&&!u.dead&&G.s.wave){say(u,'Repli !','#ffd65a');u.dead=true;u.fled=1;u.deadT=performance.now()}}); // V4.5a : les survivants se replient
 setTimeout(()=>hooks.result(o==='win'),900);if(G.endTurnResolve)G.endTurnResolve();return true}

async function ai(u,id){
 for(let g=0;g<6&&!u.dead&&G.phase==='fight'&&G.fid===id;g++){
  const a=aiStep(G.s,u);if(!a)return;
  if(a.type==='cast'){await cast(u,a.sp,a.target);if(end())return;continue}
  await moveTo(u,a.to,a.prev);await wait(120)}
}
export async function runFight(){const S=G.s,id=G.fid; // id : une ancienne boucle s'arrête si un autre combat commence
 while(G.phase==='fight'&&G.fid===id){
  const nt=(G.turn+1)%S.order.length;if(nt===0&&G.turn>=0){S.round++;if(end())return;play(iceTick(S));const burn=lavaTick(S);if(burn.length){play(burn);await wait(700);if(G.fid!==id||end())return}hooks.newRound(waveTick(S))}G.turn=nt;const u=S.order[G.turn];if(u.dead)continue;G.cur=u;
  beginTurn(u);if(u.shieldBroke){delete u.shieldBroke;sfx('frost_shield_break',.9)}keepInView(u.x,u.y);hooks.renderTL();hooks.render();
  if(u.carried)say(u,`+${u.carried} PA reporté`,'#ffd65a');
  if(u.poison||u.burn){play(poisonTick(S,u));await wait(600);if(G.fid!==id||end())return;if(u.dead)continue}
  if(u.team==='h'){sfx('turn',.5);G.reachC=reach(S,u,u.pm);hooks.render();await new Promise(r=>G.endTurnResolve=r);G.endTurnResolve=null}
  else{const me=eliteTurn(S,u);if(me.length){play(me);await wait(me.some(e=>e.type==='boom')?800:550);if(G.fid!==id||end())return;if(u.dead){endTurn(u);continue}hooks.render()} // V5.10 : élites Cauchemar
   const be=bossTurn(S,u);if(be.length){play(be);await wait(750);if(G.fid!==id||end())return}await wait(300);await ai(u,id)}
  if(G.fid!==id)return;endTurn(u);
  G.sel=null;G.plan=null;G.ex=null;if(end())return}
}
