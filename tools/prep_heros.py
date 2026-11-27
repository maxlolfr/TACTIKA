#!/usr/bin/env python3
"""V4.32 : planches héros « vétéran » (ChatGPT, 3x3 sur magenta) -> assets/<nom>.webp + atlas.json.
Poses dans l'ordre des planches <héros>9. Usage : python3 tools/prep_heros.py [dossier des originaux]
Différences avec cut3.py : chaque forme va à la case de son centre (aussi en hauteur, la victoire n'est plus coupée),
les ombres peintes (magenta assombri) sont effacées et le dôme transparent de la pose 6 est démêlé du fond."""
import os, sys, json
import numpy as np
from PIL import Image
from scipy import ndimage
ROOT = os.path.join(os.path.dirname(__file__), '..')
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, '..', 'game-studio-ai/docs/studio/art/tactika/heros-v5')
SHEETS = {'orion9': ('or01-orion-1803', 'fenn9'), 'kaelV': ('kael-veteran-1806', 'kael9'), 'fennV': ('fenn-veteran-1810', 'fenn9'), 'aelisV': ('aelis-veteran-1811', 'aelis9')}
fp = os.path.join(ROOT, 'assets', 'atlas.json'); atlas = json.load(open(fp))
for name, (src, old) in SHEETS.items():
    img = np.array(Image.open(os.path.join(SRC, src + '.png')).convert('RGB')).astype(float); H, W, _ = img.shape
    M = np.median(np.concatenate([img[:4].reshape(-1, 3), img[-4:].reshape(-1, 3)]), 0)
    d = np.abs(img - M).sum(2); al = np.clip((d - 80) / 110, 0, 1)
    r, g, b = img[..., 0], img[..., 1], img[..., 2]
    # ombre : magenta assombri, reliée au fond
    shade = (g < 60) & (np.abs(r - b) < 50) & (r > 75) & (b > 75)
    lab, _n = ndimage.label(shade | (al < .05))
    al[shade & np.isin(lab, np.unique(lab[al < .05]))] = 0
    if name == 'orion9':  # restes rosés de l'ombre aux pieds (Orion n'a aucun rose ni rouge vif)
        al[(r > 120) & (g < 70) & (b > 55) & (b < r - 20)] = 0
    rgb = np.clip((img - (1 - al[..., None]) * M) / np.maximum(al[..., None], 1e-3), 0, 255)
    # dôme (case 6) : part de magenta restante = transparence
    y0, y1, x0, x1 = H // 3 - 20, 2 * H // 3 + 10, 2 * W // 3 - 20, W
    spill = np.clip(np.minimum(r, b) - g, 0, 255)
    dome = np.zeros((H, W), bool); dome[y0:y1, x0:x1] = True
    dome &= (spill > 70) & (np.maximum(r, b) > 150) & (al > 0)
    keep = np.clip(1 - spill / 255, .22, 1)
    un = np.clip((img - (1 - keep[..., None]) * M) / keep[..., None], 0, 255)
    rgb[dome] = un[dome]; al[dome] *= keep[dome]
    # chaque forme va à la case de son centre
    lb, n = ndimage.label(ndimage.binary_closing(al > .12, iterations=2))
    cm = ndimage.center_of_mass(np.ones_like(al), lb, range(1, n + 1))
    sizes = ndimage.sum(np.ones_like(al), lb, range(1, n + 1))
    # limites des rangées mesurées sur ces planches (les éclats de victoire commencent au-dessus du tiers)
    row = lambda cy: int(cy > H * .313) + int(cy > H * .626)
    owner = np.array([-1] + [row(cy) * 3 + min(2, int(cx * 3 // W)) if s >= 60 else -1 for (cy, cx), s in zip(cm, sizes)])[lb]
    raw = []
    for k in range(9):
        m = ndimage.binary_dilation(owner == k, iterations=2) & (al > 0)
        ys, xs = np.nonzero(m); ya, yb, xa, xb = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        mm = m[ya:yb, xa:xb]; A = al[ya:yb, xa:xb] * mm * 255
        raw.append((Image.fromarray(np.dstack([rgb[ya:yb, xa:xb], A]).astype(np.uint8)), mm))
    # même taille au repos que la planche actuelle du héros
    sc = atlas[old][0][3] / raw[0][0].height
    frames = []
    for k, (im, mm) in enumerate(raw):
        w, h = round(im.width * sc), round(im.height * sc)
        solid = np.array(im)[..., 3] > 200
        low = np.nonzero(solid[-max(4, solid.shape[0] // 10):])[1]
        ax = (im.width / 2 if k in (5, 6) or not len(low) else low.mean()) * sc  # dôme et KO : centrés
        frames.append((im.resize((w, h), Image.LANCZOS), [0, 0, w, h, round(float(ax), 1), float(h)]))
    AW = 1024; x = y = sh = 0
    for im, f in frames:
        if x + im.width > AW: x = 0; y += sh + 2; sh = 0
        f[0], f[1] = x, y; x += im.width + 2; sh = max(sh, im.height)
    out = Image.new('RGBA', (AW, y + sh))
    for im, f in frames: out.paste(im, (f[0], f[1]))
    out.save(os.path.join(ROOT, 'assets', name + '.webp'), quality=84, method=6)
    atlas[name] = [f for _, f in frames]
    print(name, out.size, 'échelle %.3f' % sc, os.path.getsize(os.path.join(ROOT, 'assets', name + '.webp')) // 1024, 'Ko')
json.dump(atlas, open(fp, 'w'), separators=(',', ':'))
