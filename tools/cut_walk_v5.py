#!/usr/bin/env python3
"""V5.13 : planches de marche des héros « vétérans » + Orion et Nyra (ChatGPT, 28/11, 9 images sur fond transparent).
Disposition de chaque original : rangée du haut = 5 vues de DOS (repos, puis 4 pas) ; rangée du bas = 4 pas de PROFIL (regard à droite).
Même ordre que kaelM : case 0 = dos au repos, 1-4 = dos en marche, 5-8 = profil en marche.
Usage : python3 tools/cut_walk_v5.py <nom de sortie> <planche de repos du même héros dans l'atlas> <original.png>
ex. : python3 tools/cut_walk_v5.py kaelVM kaelV originaux/kael-marche-2132.png
Échelle : la plus haute des trois images de référence (case 0, 1, 5) = hauteur de repos du héros (comme kaelM / kael9), les trois images de référence
sont complétées en haut par du transparent pour avoir la même hauteur : le jeu dessine chaque vue à l'échelle de sa première image, donc toutes les cases gardent la même taille.
Ancre x = centre du haut du corps (pas de tremblement en marche), ancre y = bas de l'image (pieds)."""
import sys, json, os
import numpy as np
from PIL import Image
from scipy import ndimage
ROOT = os.path.join(os.path.dirname(__file__), '..')
name, idle, src = sys.argv[1:4]
atlas_fp = os.path.join(ROOT, 'assets', 'atlas.json'); A = json.load(open(atlas_fp))
idle_h = A[idle][0][3]
im = Image.open(src).convert('RGBA'); W, H = im.size; a = np.array(im)
al = a[..., 3]
# repères : 5 colonnes en haut, 4 en bas ; chaque morceau est rattaché à la case de son centre de masse
lab, n = ndimage.label(ndimage.binary_dilation(al > 16, iterations=3))
cm = ndimage.center_of_mass(np.ones_like(al), lab, range(1, n + 1)); sz = ndimage.sum(np.ones_like(al), lab, range(1, n + 1))
cell = np.full(lab.max() + 1, -1)
for i, (c, s) in enumerate(zip(cm, sz)):
    if s < 120: continue
    top = c[0] < H / 2
    cell[i + 1] = int(c[1] / (W / 5)) if top else 5 + int(c[1] / (W / 4))
fr = []
for k in range(9):
    m = np.isin(lab, np.where(cell == k)[0]) & (al > 0)
    ys, xs = np.where(m)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    f = np.zeros((y1 - y0, x1 - x0, 4), np.uint8); sub = a[y0:y1, x0:x1].copy(); sub[~m[y0:y1, x0:x1]] = 0; f[:] = sub
    fr.append(Image.fromarray(f, 'RGBA'))
hs = [f.height for f in fr]
k = idle_h / max(hs[0], hs[1], hs[5])
fr = [f.resize((max(1, round(f.width * k)), max(1, round(f.height * k))), Image.LANCZOS) for f in fr]
Hm = max(fr[0].height, fr[1].height, fr[5].height)
for i in (0, 1, 5):
    if fr[i].height < Hm:
        c = Image.new('RGBA', (fr[i].width, Hm), (0, 0, 0, 0)); c.paste(fr[i], (0, Hm - fr[i].height)); fr[i] = c
# anchor x : centre du haut du corps
def ax(f):
    s = np.array(f)[..., 3] / 255.; t = s[:int(f.height * .55)]; xs = np.arange(f.width)
    return round(float((t.sum(0) * xs).sum() / max(t.sum(), 1)), 1)
# planche : 3 rangées (4 + 3 + 2 cases) ; marge de 2 px
rows = [fr[0:4], fr[4:7], fr[7:9]]; SW = max(sum(f.width + 2 for f in r) for r in rows); SH = sum(max(f.height for f in r) + 2 for r in rows)
sheet = Image.new('RGBA', (SW, SH), (0, 0, 0, 0)); out = []; y = 0
for r in rows:
    x = 0
    for f in r:
        sheet.paste(f, (x, y)); out.append([x, y, f.width, f.height, ax(f), float(f.height)]); x += f.width + 2
    y += max(f.height for f in r) + 2
sheet.save(os.path.join(ROOT, 'assets', name + '.webp'), quality=92, method=6)
A[name] = out; json.dump(A, open(atlas_fp, 'w'), separators=(',', ':'))
print(name, 'échelle', round(k, 3), 'feuille', sheet.size, 'hauteur de réf.', Hm, 'repos', idle_h, 'poids', os.path.getsize(os.path.join(ROOT, 'assets', name + '.webp')) // 1024, 'Ko')
