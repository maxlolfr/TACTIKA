// Boucle de tours : enchaîne les unités, joue les animations et rejoue les événements des règles.
import {G,hooks} from './game.js';
import {wait,tween} from './util.js';
import {pathTo,face,payCost,applySpell,stepOn,beginTurn,poisonTick,endTurn,outcome,aiStep,reach} from './rules.js';
import {addFx,addProj,say,pose,shake,punch,burst,addRefs,TH} from './render.js';
import {sfx} from './audio.js';

// Rejoue des événements produits par les règles (texte flottant, effet, son, secousse).
export function play(events){for(const e of events){switch(e.type){
 case 'fx':addFx(e.x,e.y,e.i,e.w,550,e.sh||'fx');break;
 case 'hurt':{const t=e.t;say(t,(e.crit?'Critique ! -':'-')+e.amt,e.src==='poison'?'#b9f26a':e.src==='collision'?'#ffa040':e.crit?'#ffd23a':'#ff6b5a',e.crit);pose(t,'h');t.flashT=performance.now()+120;sfx(e.src==='poison'?'poison':'hit',.7);if(e.crit){sfx('critical',.9);punch(t,.06)}
  if(e.killed){punch(t,.05,260);burst(t);addFx(t.gx,t.gy,15,1,900,'fxi',-.5);t.deadT=performance.now();setTimeout(()=>sfx('death'),150)}
  if(e.saved){say(t,'Dernier rempart !','#9fd0ff',true);sfx('guard',.8)}
  if(e.spread)for(const o of e.spread)say(o,'Contagion','#b9f26a');
  if(e.spawn){addRefs(e.spawn);for(const m of e.spawn){m.dead=true;setTimeout(()=>{m.dead=false;addFx(m.x,m.y,6,1.1,600,'fxi');sfx('slime',.8)},450)}setTimeout(()=>{pose(t,'s',900);say(t,'Invocation !','#7dff8a',true);sfx('enemy_warning',.7)},250)}break}
 case 'heal':say(e.t,'+'+e.amt,'#7dff8a');break;
 case 'status':say(e.t,e.text,e.color);if(e.snd)sfx(e.snd,.8);break;
 case 'shake':shake(e.ms);break;
 case 'push':{const t=e.t,x0=t.gx,y0=t.gy;sfx('push',.8);tween(200,k=>{t.gx=x0+(e.to.x-x0)*k;t.gy=y0+(e.to.y-y0)*k});break}
 case 'collision':setTimeout(()=>{sfx('collision',.9);shake(200);punch(e.t,.04);burst(e.t,4);addFx(e.t.gx,e.t.gy,1,1.1,500,'fxi',-.2)},200);break;
 case 'combo':say(e.t,'Combo ×'+e.n,'#ff9cf2',true);addFx(e.t.gx,e.t.gy,14,.8,800,'ico',-.9);sfx('combo_'+e.n,.9)}}}

export async function cast(u,sp,c){const S=G.s; // l'état du combat en cours, même si on fuit pendant l'animation
 payCost(u,sp,c);
 pose(u,u.team==='h'&&(sp.t==='ally'||sp.t==='self'||sp.t==='dead'||sp.trap)?(sp.shield?'b':'c'):'a',sp.shield?700:450);G.busy=true;hooks.render();sfx(sp.snd);
 if(sp.proj){addProj(u,c);await wait(260);sfx('arrowhit',.8)}
 else if(sp.r[1]===1&&sp.t==='enemy'){const dx=(c.x-u.x)*.35,dy=(c.y-u.y)*.35;await tween(110,t=>{u.gx=u.x+dx*t;u.gy=u.y+dy*t});tween(160,t=>{u.gx=u.x+dx*(1-t);u.gy=u.y+dy*(1-t)})}
 else await wait(180);
 play(applySpell(S,u,sp,c));
 await wait(420);G.busy=false;
}
export async function moveTo(u,k,prev){const path=pathTo(u,k,prev);
 G.busy=true;hooks.render();u.walk=1;let st=0;for(const[x,y]of path){const fx0=u.gx,fy0=u.gy;
  face(u,x,y);st++;
  await tween(220,t=>{u.gx=fx0+(x-fx0)*t;u.gy=fy0+(y-fy0)*t;u.wf=st*2+(t<.5?0:1);u.hop=Math.sin(t*Math.PI)*TH*.06});u.x=x;u.y=y;u.gx=x;u.gy=y;u.hop=0;u.pm--;sfx('step',.5,u.team==='m'?.8:1.1);
  const ev=stepOn(G.s,u);if(ev.length){u.walk=0;play(ev);await wait(500);break}}u.walk=0;
 G.busy=false}

// Termine le combat si un camp est éliminé. Renvoie true quand le combat est fini.
export function end(){if(G.phase!=='fight')return true;const o=outcome(G.s);if(!o)return false;
 G.phase=o;if(o==='win')G.s.units.forEach(u=>{if(u.team==='h'&&!u.dead)pose(u,'v',9e9)});
 setTimeout(()=>hooks.result(o==='win'),900);if(G.endTurnResolve)G.endTurnResolve();return true}

async function ai(u,id){
 for(let g=0;g<6&&!u.dead&&G.phase==='fight'&&G.fid===id;g++){
  const a=aiStep(G.s,u);if(!a)return;
  if(a.type==='cast'){await cast(u,a.sp,a.target);if(end())return;continue}
  await moveTo(u,a.to,a.prev);await wait(120)}
}
export async function runFight(){const S=G.s,id=G.fid; // id : une ancienne boucle s'arrête si un autre combat commence
 while(G.phase==='fight'&&G.fid===id){
  const nt=(G.turn+1)%S.order.length;if(nt===0&&G.turn>=0)S.round++;G.turn=nt;const u=S.order[G.turn];if(u.dead)continue;G.cur=u;
  beginTurn(u);hooks.renderTL();hooks.render();
  if(u.poison){play(poisonTick(S,u));await wait(600);if(G.fid!==id||end())return;if(u.dead)continue}
  if(u.team==='h'){sfx('turn',.5);G.reachC=reach(S,u,u.pm);hooks.render();await new Promise(r=>G.endTurnResolve=r);G.endTurnResolve=null}
  else{await wait(300);await ai(u,id)}
  if(G.fid!==id)return;endTurn(u);
  G.sel=null;if(end())return}
}
