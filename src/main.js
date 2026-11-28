// Point d'entrée : charge les images puis ouvre le camp.
import {$,HUD2} from './util.js';
import {loadAssets,skin,draw} from './render.js';
import {camp} from './ui.js';
import {save} from './save.js';
import {setLang} from './i18n.js';
import {setGq,gqOf} from './gfx.js';
setGq(gqOf(save)); /* V5.11 : niveau graphique dès le démarrage */

// V4.6.1 : en « version pour ordinateur » sur un téléphone, la page fait environ 980 de large et tout devient minuscule
const uiScale=()=>{const k=matchMedia('(pointer:coarse)').matches&&innerWidth>=700&&innerHeight>innerWidth*1.5?Math.min(2.4,innerWidth/430):1,R=document.documentElement;R.classList.toggle('wide',k>1);R.style.setProperty('--ui',k)};
uiScale();addEventListener('resize',uiScale);
if(HUD2)document.documentElement.classList.add('hud2');

(async()=>{
 try{await loadAssets()}catch(e){$('load').textContent='Impossible de charger les images ('+e+')';return}
 $('load').remove();skin();setLang(save.lang);camp();requestAnimationFrame(draw); // V4.89 : anglais de l'interface (V4.91 : l'appel du dessin avait été avalé par ce commentaire = plateau noir)
})();
