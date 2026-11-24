// Point d'entrée : charge les images puis ouvre le camp.
import {$} from './util.js';
import {loadAssets,skin,draw} from './render.js';
import {camp} from './ui.js';

(async()=>{
 try{await loadAssets()}catch(e){$('load').textContent='Impossible de charger les images ('+e+')';return}
 $('load').remove();skin();camp();requestAnimationFrame(draw);
})();
