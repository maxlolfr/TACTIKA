import { loadAssets, skin, draw } from './render.js';
import { save } from './save.js';
import { startFight } from './ui.js';

const loading = document.getElementById('load');
try {
  const [reference] = await Promise.all([
    fetch('prairie.json').then(response => {
      if (!response.ok) throw new Error('Prairie reference is missing');
      return response.json();
    }),
    loadAssets(),
  ]);
  loading.remove();
  skin();
  Object.assign(save, { lvl: 1, xp: 0, gold: 0, items: [], fight: 1, z: {} });
  startFight(0, 0, reference);
  requestAnimationFrame(draw);
} catch (error) {
  loading.textContent = 'Impossible de charger la Prairie de Lande.';
  console.error(error);
}
