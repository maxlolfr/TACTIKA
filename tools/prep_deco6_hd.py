#!/usr/bin/env python3
"""V5.26 : obstacles du Marais des âmes (deco6) en haute définition.
Planche Gemini 4x2 d'origine (souche, tronc, éboulis, rocher, muret, racines, statue, arche), recoupée à 75 % de la taille native
(au lieu de 32 %). Taille à l'écran inchangée : le jeu dessine chaque objet à TW*DECO_W, quelle que soit la taille de l'image.
Usage : python3 tools/prep_deco6_hd.py [planche.png] [échelle]  (par défaut art/r9/r9-obstacles-gemini.webp, 0.75)"""
import os, sys, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
src = open(os.path.join(ROOT, 'tools', 'prep_r9.py')).read()
# on réutilise key / cells / pack de prep_r9.py (tout ce qui précède la découpe du crapaud)
head = src.split('# crapaud venimeux')[0].replace('sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, \'art\', \'r9\')', "os.path.join(ROOT, 'art', 'r9')")
exec(compile(head, 'prep_r9_head', 'exec'))
import numpy as np
from PIL import Image
sheet = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'art', 'r9', 'r9-obstacles-gemini.webp')
sc = float(sys.argv[2]) if len(sys.argv) > 2 else .75
a = np.array(Image.open(sheet).convert('RGB')); M = np.median(a[:4].reshape(-1, 3), 0).astype(np.uint8)
H, W = a.shape[:2]; a[int(H * .895):, int(W * .93):] = M  # étoile Gemini (coin bas droit) effacée
p = '/tmp/obstacles-sans-etoile.png'; Image.fromarray(a).save(p)
c = cells(*key(p, shadows=True), 4, 2, (.5,), 200)
# quelques pixels magenta de bord (franges du fond) : repeints en vert-gris de mousse
def clean(im):
    b = np.array(im).astype(int); m = (b[..., 3] > 0) & (b[..., 0] > 130) & (b[..., 2] > 90) & (b[..., 1] < b[..., 0] - 50) & (b[..., 1] < b[..., 2] - 30)
    b[m, :3] = (88, 94, 70); return Image.fromarray(b.astype(np.uint8))
c = [clean(i) for i in c]
pack('deco6', c, sc, 88)
json.dump(atlas, open(fp, 'w'), separators=(',', ':'))
