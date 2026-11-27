// Petits outils du navigateur.
export const $=id=>document.getElementById(id);
// V4.6 : SPEED.k < 1 = animations rapides (réglage)
export const SPEED={k:1};
export const wait=ms=>new Promise(r=>setTimeout(r,ms*SPEED.k));
export function tween(ms,f){ms*=SPEED.k;return new Promise(r=>{const t0=performance.now();const st=()=>{const t=Math.min(1,(performance.now()-t0)/ms);f(t);t<1?requestAnimationFrame(st):r()};st()})}

// V4.50 : aperçu du HUD V2 « Royal Arcane Compact » (?hud=v2) — affichage seulement, jeu normal inchangé
export const HUD2=(()=>{try{return new URLSearchParams(location.search).get('hud')==='v2'}catch(e){return false}})();
