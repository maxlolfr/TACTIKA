import { DECO_W, HER, ZONES } from '../src/data.js';
import { genMap, heroStats, mkUnits, newBattle } from '../src/rules.js';

const zone = ZONES[0];
const seed = 0;
const battle = newBattle();
const { hs, es } = genMap(battle, seed, zone.th[0]);
const save = { lvl: 1, items: [] };
mkUnits(battle, { lvl: zone.lvl, pool: zone.pool }, hs, es, HER.map((_, index) => heroStats(save, index)));

const units = battle.order.map(({ n, k, team, row, x, y, hp, maxPM, h, dir, atk }) => ({
  name: n, kind: k, hero: team === 'h', row: row ?? 0, x, y, hp, pm: maxPM,
  height: h, direction: dir, damage: atk ? Math.round((atk.dmg[0] + atk.dmg[1]) / 2) : 0,
}));
process.stdout.write(JSON.stringify({
  name: zone.n, seed, cells: [...battle.map.values()], units, decorWidths: DECO_W,
}));
