// Petits outils du navigateur.
export const $=id=>document.getElementById(id);
export const wait=ms=>new Promise(r=>setTimeout(r,ms));
export function tween(ms,f){return new Promise(r=>{const t0=performance.now();const st=()=>{const t=Math.min(1,(performance.now()-t0)/ms);f(t);t<1?requestAnimationFrame(st):r()};st()})}
