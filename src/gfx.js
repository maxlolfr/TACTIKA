// V5.11 · réglage graphique Faible / Moyen / Haut (remplace « Effets réduits », qui devient le niveau Faible).
// 0 = Faible : ancien « Effets réduits » (classe html.lowfx : animations CSS coupées, peu de particules, ni secousse
//     ni arrêt bref) + résolution du plateau plafonnée à 1,5 (gros gain sur les téléphones à écran 3×).
// 1 = Moyen  : rendu de la V5.10 à l'identique (valeur par défaut).
// 2 = Haut   : rendu riche (classe html.gfxhi) : résolution suréchantillonnée (au moins 2× sur PC / Steam), particules
//     d'ambiance ×1,7, volutes Cauchemar ×1,6, éclats d'impact ×1,7, halos lumineux additifs (héros actif, élites,
//     champions), éclairage précalculé du sol. Tout reste en Canvas 2D : aucun nouveau moteur.
// Rien ici ne touche aux règles : le niveau graphique ne change ni le hasard ni l'équilibrage.
export const GQ_N=['Faible','Moyen','Haut'],GQ_EN=['Low','Medium','High'];
export const GQ={v:1};
export const gqOf=s=>s&&s.gq!=null?Math.max(0,Math.min(2,s.gq|0)):s&&s.lowfx?0:1; // anciennes sauvegardes : « Effets réduits : oui » = Faible
export function setGq(n){GQ.v=Math.max(0,Math.min(2,n|0));if(typeof document==='undefined')return;const R=document.documentElement;
 R.classList.toggle('lowfx',GQ.v===0);R.classList.toggle('gfxhi',GQ.v===2);R.dataset.gq=GQ.v}
export const hiFx=()=>GQ.v===2;
// résolution du plateau selon le niveau (d = devicePixelRatio, px = surface de l'écran en pixels CSS)
export function dprFor(d,px){d=d||1;if(GQ.v===0)return Math.min(d,1.5);if(GQ.v===1)return Math.min(d,3);
 return Math.max(Math.min(d,3),Math.min(2.5,Math.max(2,d*1.5),Math.sqrt(1.4e7/Math.max(1,px))))}
