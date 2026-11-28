#!/usr/bin/env python3
"""V5.27 : bâtiments du village (bld : forge, marchand, arène, taverne) en haute définition.
Planche Gemini 2x2 (1254x1254, fond magenta). Réutilise key/cells/pack de prep_r9.py. Les bâtiments ne sont affichés qu'en icône (hauteur fixe) :
la taille à l'écran ne change pas, seule la netteté augmente.
Usage : python3 tools/prep_bld_hd.py planche.png [hauteur en px, défaut 520]"""
import os, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
src = open(os.path.join(ROOT, 'tools', 'prep_r9.py')).read()
head = src.split('# crapaud venimeux')[0].replace("sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'art', 'r9')", "os.path.join(ROOT, 'art', 'r9')")
exec(compile(head, 'prep_r9_head', 'exec'))
import numpy as np
from PIL import Image
sheet = sys.argv[1]; hh = float(sys.argv[2]) if len(sys.argv) > 2 else 520
c = cells(*key(sheet, shadows=False), 2, 2, (.5,), 2000)
sc = hh / max(i.height for i in c)
pack('bld', c, sc, 88)
json.dump(atlas, open(fp, 'w'), separators=(',', ':'))
