#!/usr/bin/env python3
"""V5.30 : accessoires du village et cristal (étape 4) en haute définition.
Accessoires : mêmes découpes que prep_vie.py (planche 1693, déjà dans le studio sous village/accessoires/), mais mises à l'échelle à 520 px au lieu de 300
(VIE de src/home.js ne sert qu'au rapport l/h : rien à changer). Cristal 4 : planche 1687 (2048 px) découpée par cut_village.py cristal-seul, calée dans la boîte 700x896 de CRY[3]
(l'image est étirée à 100 % de la boîte : on garde le rapport 700/896 en ajoutant du vide en haut, le bas reste aligné).
Usage : python3 -I tools/prep_village_hd.py <dossier art/tactika du studio> <cristal-seul.webp découpé de 1687>"""
import sys, os, numpy as np
from PIL import Image
art, cry = sys.argv[1], sys.argv[2]
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
for n in ['banc', 'banniere', 'charrette', 'enclume', 'etal', 'fontaine', 'lanterne', 'mannequin', 'trophee']:
    im = Image.open(f'{art}/village/accessoires/{n}.webp').convert('RGBA')
    if n == 'lanterne':  # halo rosé de la découpe (comme prep_vie.py)
        a = np.array(im).astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
        pink = ((r - g > 38) & (b - g > -4)) | ((r - g > 40) & (b > 108) & (g - b < 35)); a[..., 3][pink] = 0
        right = np.arange(a.shape[1])[None, :] > a.shape[1] * .45; a[..., 3][right & (a[..., 3] < 150)] = 0; im = Image.fromarray(a.astype(np.uint8))
    im.thumbnail((520, 520), Image.LANCZOS); p = f'{ROOT}/assets/vie/{n}.webp'; im.save(p, 'WEBP', quality=90, method=6); print(n, im.size, os.path.getsize(p) // 1024, 'Ko')
c = Image.open(cry).convert('RGBA'); W = 1400
c = c.resize((W, round(c.height * W / c.width)), Image.LANCZOS)
H = round(W * 896 / 700)
if c.height > H: sys.exit('cristal trop haut pour la boîte')
o = Image.new('RGBA', (W, H), (0, 0, 0, 0)); o.paste(c, (0, H - c.height))
p = f'{ROOT}/assets/cry/crystal4.webp'; o.save(p, 'WEBP', quality=88, method=6); print('crystal4', o.size, os.path.getsize(p) // 1024, 'Ko')
