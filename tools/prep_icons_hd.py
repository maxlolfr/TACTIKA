#!/usr/bin/env python3
"""V5.29 : planches d'icônes 4x4 (fond magenta) -> planche HD du jeu + entrée atlas.json.
Réutilise key() de prep_r9.py. Chaque forme va à la case de son centre. Les cases sont recadrées sur leur boîte et mises à
l'échelle (côté max = S), puis rangées sur une grille COLS x ROWS : les indices de l'atlas suivent l'ordre de lecture de la planche.
La taille à l'écran ne change pas (icon()/dic() ne lisent que le rapport largeur/hauteur de la case).
Usage : python3 tools/prep_icons_hd.py <nom de planche du jeu> <planche.png> <colonnes> <lignes> [S=256] [qualité=88]
  ex. : python3 tools/prep_icons_hd.py ico icones-statuts-16-1518.png 4 4"""
import os, sys, json
import numpy as np
from PIL import Image
from scipy import ndimage
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
src = open(os.path.join(ROOT, 'tools', 'prep_r9.py')).read()
head = src.split('# crapaud venimeux')[0].replace("sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'art', 'r9')", "os.path.join(ROOT, 'art', 'r9')")
exec(compile(head, 'prep_r9_head', 'exec'))   # key(), atlas, fp

name, sheet, C, R = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
S = int(sys.argv[5]) if len(sys.argv) > 5 else 256
Q = int(sys.argv[6]) if len(sys.argv) > 6 else 88
rgb, al = key(sheet, shadows=False)
H, W = al.shape
lab, n = ndimage.label(ndimage.binary_closing(al > .12, iterations=1))
cm = ndimage.center_of_mass(al > .12, lab, range(1, n + 1)); sz = ndimage.sum(al > .12, lab, range(1, n + 1))
cell_of = np.array([-1] + [(int(y * R // H) * C + int(x * C // W)) if s > 40 else -1 for (y, x), s in zip(cm, sz)])
owner = cell_of[lab]
old = atlas.get(name)
ims = []
for k in range(C * R):
    keep = ndimage.binary_dilation(owner == k, iterations=2) & (al > 0)
    ys, xs = np.nonzero(keep)
    if not len(ys): sys.exit(f'case {k} vide')
    a = np.where(keep, al, 0)
    im = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), a * 255]).astype(np.uint8), 'RGBA').crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    sc = S / max(im.size)
    ims.append(im.resize((max(1, round(im.width * sc)), max(1, round(im.height * sc))), Image.LANCZOS))
    if old and k < len(old):
        print(k, 'ancien rapport l/h %.2f' % (old[k][2] / old[k][3]), 'nouveau %.2f' % (ims[-1].width / ims[-1].height))
pad = 2
out = Image.new('RGBA', (C * (S + pad), R * (S + pad)), (0, 0, 0, 0)); F = []
for k, im in enumerate(ims):
    x, y = (k % C) * (S + pad), (k // C) * (S + pad)
    out.paste(im, (x, y)); F.append([x, y, im.width, im.height, round(im.width / 2, 1), float(im.height)])
p = os.path.join(ROOT, 'assets', name + '.webp')
out.save(p, 'WEBP', quality=Q, method=6)
atlas[name] = F
json.dump(atlas, open(fp, 'w'), separators=(',', ':'))
print(name, out.size, os.path.getsize(p) // 1024, 'Ko')
