// Petits outils du navigateur.
export const $=id=>document.getElementById(id);
// V4.6 : SPEED.k < 1 = animations rapides (réglage)
export const SPEED={k:1};
export const wait=ms=>new Promise(r=>setTimeout(r,ms*SPEED.k));
export function tween(ms,f){ms*=SPEED.k;return new Promise(r=>{const t0=performance.now();const st=()=>{const t=Math.min(1,(performance.now()-t0)/ms);f(t);t<1?requestAnimationFrame(st):r()};st()})}

// V4.52 : HUD V2 « Royal Arcane Compact » dans le jeu normal (Max, 27/11). ?hud=v1 rend l'ancien affichage (secours). Affichage seulement.
export const HUD2=(()=>{try{return new URLSearchParams(location.search).get('hud')!=='v1'}catch(e){return true}})();
