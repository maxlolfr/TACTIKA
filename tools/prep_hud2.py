#!/usr/bin/env python3
"""HUD V2 (V4.51) : découpe des images de ChatGPT (UI-01 à UI-06) -> assets/hud2/*.webp.
Usage : python3 -I tools/prep_hud2.py <dossier des originaux> (les 8 PNG archivés dans
docs/studio/art/tactika/hud-v2/v2-27-11/ du dépôt Game-studio-ai). Les cases de la planche
ne sont pas respectées : on coupe par composantes d'alpha, puis on recadre."""
import sys, os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'hud2')
os.makedirs(OUT, exist_ok=True)

def load(name):
    im = Image.open(os.path.join(SRC, name)).convert('RGBA')
    a = np.array(im)
    a[..., 3] = np.where(a[..., 3] < 24, 0, a[..., 3])  # poussière d'alpha (1 à 15) supprimée
    a[a[..., 3] == 0, :3] = 0
    return Image.fromarray(a)

def save(im, name, q=88):
    p = os.path.join(OUT, name)
    im.save(p, 'WEBP', quality=q, method=6)
    print(name, im.size, os.path.getsize(p), 'o')

def bbox(im, t=24):
    a = np.array(im)[..., 3]
    ys, xs = np.where(a > t)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1

def square(im, size):
    """recadre sur la boîte d'alpha, centre dans un carré (proportions conservées)"""
    b = bbox(im); c = im.crop(b); w, h = c.size; s = max(w, h)
    o = Image.new('RGBA', (s, s), (0, 0, 0, 0)); o.paste(c, ((s - w) // 2, (s - h) // 2))
    return o.resize((size, size), Image.LANCZOS)

# --- UI-04 anneaux : 4 fenêtres égales de 640 px centrées sur le trou de chaque anneau ---
R = load('ui04-anneaux-v2-1889.png'); ra = np.array(R)[..., 3]
CELLS = {'h': (0, 0, 627, 585), 'm': (627, 0, 1254, 585), 'b': (0, 585, 627, 1254), 'cur': (627, 585, 1254, 1254)}
W = 640
for k, (x0, y0, x1, y1) in CELLS.items():
    q = ra[y0:y1, x0:x1]
    lab, _ = ndi.label(q < 24)
    # trou = plus grande zone transparente fermée (pas celle reliée au bord)
    edge = set(lab[0].tolist()) | set(lab[-1].tolist()) | set(lab[:, 0].tolist()) | set(lab[:, -1].tolist())
    best, bs = 0, 0
    for l in range(1, lab.max() + 1):
        if l in edge: continue
        s = (lab == l).sum()
        if s > bs: best, bs = l, s
    ys, xs = np.where(lab == best)
    cx, cy = x0 + (xs.min() + xs.max()) // 2, y0 + (ys.min() + ys.max()) // 2
    print('anneau', k, 'trou', xs.max() - xs.min(), 'centre', cx, cy)
    box = (cx - W // 2, cy - W // 2, cx + W // 2, cy + W // 2)
    cell = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    # on ne garde que l'anneau de sa propre case (pas la couronne du voisin)
    m = np.zeros(ra.shape, bool); m[y0:y1, x0:x1] = True
    a = np.array(R); a[~m] = 0
    cell.paste(Image.fromarray(a).crop(box), (0, 0))
    save(cell.resize((192, 192), Image.LANCZOS), f'ring-{k}.webp')

# --- UI-02 cases de sort : 3 états, 128x128 ---
for f, n in (('normal-1890', 'n'), ('choisi-1891', 'sel'), ('indispo-1892', 'off')):
    save(square(load(f'ui02-case-sort-{f}.png'), 128), f'sp-{n}.webp')

# --- UI-06 icônes : PA, PM, PV, haut-parleur (64x64) ---
I = load('ui06-icones-1893.png')
for n, (x0, y0, x1, y1) in {'pa': (0, 0, 627, 627), 'pm': (627, 0, 1254, 627), 'pv': (0, 627, 627, 1254), 'son': (627, 627, 1254, 1254)}.items():
    save(square(I.crop((x0, y0, x1, y1)), 64), f'ic-{n}.webp')

# --- UI-01 cadre de panneau (9-slice), ornement de coin, texture ---
save(square(load('ui01a-cadre-panneau-1894.png'), 256), 'panel-frame.webp')
# ornement de coin (UI-01b) reçu mais non utilisé : le cadre UI-01a a déjà ses coins
T = Image.open(os.path.join(SRC, 'ui01c-texture-1896.png')).convert('RGB').resize((256, 256), Image.LANCZOS)
t = np.array(T).astype(float)
# raccord : décalage de moitié + fondu des bords (la source n'est pas garantie raccordable)
h = t.shape[0] // 2; sh = np.roll(np.roll(t, h, 0), h, 1)
yy, xx = np.mgrid[0:256, 0:256]
wgt = np.minimum.reduce([xx, 255 - xx, yy, 255 - yy]) / 128.0
wgt = np.clip(wgt * 1.6, 0, 1)[..., None]
seam = t * wgt + sh * (1 - wgt)
save(Image.fromarray(seam.astype('uint8')), 'texture.webp', 80)
