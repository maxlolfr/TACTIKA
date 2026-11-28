#!/usr/bin/env python3
"""V5.20 : planche de marche 3×3 sur fond magenta (5 vues de dos puis 4 de profil, ordre de lecture) -> original transparent 5+4
(rangée du haut = 5 cases, rangée du bas = 4 cases) attendu par cut_walk_v5.py.
Usage : python3 tools/relayout_walk_3x3.py <planche3x3.png> <sortie.png>  (puis cut_walk_v5.py <nom> <planche de repos> <sortie.png>)"""
import sys, numpy as np
from PIL import Image
src, out = sys.argv[1:3]
im = np.asarray(Image.open(src).convert('RGB')).astype(float); H, W, _ = im.shape; cw, ch = W // 3, H // 3
r, g, b = im[..., 0], im[..., 1], im[..., 2]
m = np.minimum(r, b) - g; a = np.clip((95 - m) / 20, 0, 1)            # même détourage magenta que cut_boss_hd2.py
sp = np.maximum(0, np.minimum(r, b) - g) * (a < .98); c = im.copy(); c[..., 0] -= sp * .9; c[..., 2] -= sp * .9
rgba = np.dstack([np.clip(c, 0, 255), a * 255]).astype(np.uint8)
cells = [rgba[j * ch:(j + 1) * ch, i * cw:(i + 1) * cw] for j in range(3) for i in range(3)]
CW = cw + 40; canvas = Image.new('RGBA', (CW * 5, ch * 2), (0, 0, 0, 0))
for k, f in enumerate(cells):
    row, col = (0, k) if k < 5 else (1, k - 5)
    cx = (col + .5) * (CW * 5 / (5 if row == 0 else 4))
    canvas.alpha_composite(Image.fromarray(f, 'RGBA'), (int(cx - cw / 2), row * ch))
canvas.save(out)
print('ok', canvas.size, [int((f[..., 3] > 16).sum()) for f in cells])
