#!/usr/bin/env python3
"""V4.64 : images du Marais des âmes (R9) -> assets/ + atlas.json (monstres, Pharaon, obstacles, sols).
Usage : python3 tools/prep_r9.py [dossier des originaux] (par défaut art/r9, WebP sans perte). Fonctions key/cells/pack reprises de prep_r8.py.
Sols : une seule grande dalle par case (la dalle du bas de chaque planche Gemini, avec ses flancs).
Monstres au format « boss » du jeu : repos, attaque, touché, spécial, KO, repos 2."""
import os, sys, json
import numpy as np
from PIL import Image
from scipy import ndimage
ROOT = os.path.join(os.path.dirname(__file__), '..')
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'art', 'r9')
fp = os.path.join(ROOT, 'assets', 'atlas.json'); atlas = json.load(open(fp))

def key(path, shadows=True):
    img = np.array(Image.open(path).convert('RGB')).astype(float)
    M = np.median(np.concatenate([img[:4].reshape(-1, 3), img[:, :4].reshape(-1, 3)]), 0)
    al = np.clip((np.abs(img - M).sum(2) - 80) / 110, 0, 1)
    r, g, b = img[..., 0], img[..., 1], img[..., 2]
    if shadows:  # ombre peinte : magenta assombri relié au fond
        shade = (g < 32) & (np.abs(r - b) < 40) & (r > 80)
        lab, _ = ndimage.label(shade | (al < .05)); al[shade & np.isin(lab, np.unique(lab[al < .05]))] = 0
    rgb = np.clip((img - (1 - al[..., None]) * M) / np.maximum(al[..., None], 1e-3), 0, 255)
    spill = np.clip(np.minimum(r, b) - g, 0, 255)
    glow = (spill > 90) & (r > 180) & (al > 0)  # halos transparents : on retire la part de fond
    k = np.clip(1 - spill / 255, .22, 1)
    rgb[glow] = np.clip((img - (1 - k[..., None]) * M) / k[..., None], 0, 255)[glow]; al[glow] *= k[glow]
    if shadows:  # fumées et restes d'ombre restés violets : gris sombre, à moitié transparents
        R, G, Bl = rgb[..., 0], rgb[..., 1], rgb[..., 2]
        mauve = (G < 65) & (np.abs(R - Bl) < 32) & (R > 95) & (al > 0)
        rgb[mauve] = (62, 48, 54); al[mauve] *= .6
    return rgb, al

def cells(rgb, al, cols, rows, ycuts, minsize):
    H, W = al.shape
    lb, n = ndimage.label(ndimage.binary_closing(al > .12, iterations=1))
    row = lambda y: sum(int(y > H * c) for c in ycuts)
    own = np.full((H, W), -1)
    yy, xx = np.mgrid[0:H, 0:W]
    grid = sum((yy > H * c).astype(int) for c in ycuts) * cols + np.minimum(cols - 1, xx * cols // W)
    for i, sl in enumerate(ndimage.find_objects(lb)):
        m = lb[sl] == i + 1
        if m.sum() < minsize: continue
        if sl[0].stop - sl[0].start > H / rows * 1.12 or sl[1].stop - sl[1].start > W / cols * 1.2:
            own[sl][m] = grid[sl][m]  # deux dessins qui se touchent : partage par la grille
        else:
            ys, xs = np.nonzero(m); own[sl][m] = row(ys.mean() + sl[0].start) * cols + min(cols - 1, int((xs.mean() + sl[1].start) * cols // W))
    out = []
    for c in range(cols * rows):
        m = ndimage.binary_dilation(own == c, iterations=2) & (al > 0)
        ys, xs = np.nonzero(m); ya, yb, xa, xb = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        mm = m[ya:yb, xa:xb]
        out.append(Image.fromarray(np.dstack([rgb[ya:yb, xa:xb], al[ya:yb, xa:xb] * mm * 255]).astype(np.uint8)))
    return out

def pack(name, ims, sc, q=84):
    frames = []
    for im in ims:
        im = im.resize((max(1, round(im.width * sc)), max(1, round(im.height * sc))), Image.LANCZOS)
        solid = np.array(im)[..., 3] > 200
        low = np.nonzero(solid[-max(4, im.height // 8):])[1]
        ax = float(low.mean()) if len(low) else im.width / 2
        if abs(ax - im.width / 2) > im.width * .2: ax = im.width / 2
        frames.append((im, [0, 0, im.width, im.height, round(ax, 1), float(im.height)]))
    AW = max(1024, max(i.width for i, _ in frames)); x = y = sh = 0
    for im, f in frames:
        if x + im.width > AW: x = 0; y += sh + 2; sh = 0
        f[0], f[1] = x, y; x += im.width + 2; sh = max(sh, im.height)
    out = Image.new('RGBA', (AW, y + sh))
    for im, f in frames: out.paste(im, (f[0], f[1]))
    out.save(os.path.join(ROOT, 'assets', name + '.webp'), quality=q, method=6)
    atlas[name] = [f for _, f in frames]
    print(name, out.size, os.path.getsize(os.path.join(ROOT, 'assets', name + '.webp')) // 1024, 'Ko')


# crapaud venimeux 3x2 : repos, attaque (gueule ouverte), touché (yeux fermés), spécial (ventre gonflé), KO (endormi), repos 2
c = cells(*key(os.path.join(SRC, 'r9-crapaud-venimeux.webp')), 3, 2, (.5,), 60)
pack('toad', c, 190 / c[0].height)
pack('toadK', c, 300 / c[0].height)  # provisoire : boss « Reine des marécages » = crapaud agrandi, jusqu'à réception des planches de la Reine
# les deux planches Gemini : l'étoile Gemini (coin bas droit) est effacée avant découpe
def nostar(name):
    a = np.array(Image.open(os.path.join(SRC, name)).convert('RGB')); M = np.median(a[:4].reshape(-1, 3), 0).astype(np.uint8)
    H, W = a.shape[:2]; a[int(H * .895):, int(W * .93):] = M; p = '/tmp/' + name.replace('.webp', '-sans-etoile.png'); Image.fromarray(a).save(p); return p
# obstacles 4x2 : souche, tronc couché, éboulis, rocher, muret, racines, statue, arche
c = cells(*key(nostar('r9-obstacles-gemini.webp'), shadows=True), 4, 2, (.5,), 200)
pack('deco6', c, .32, 86)
# sols : 8 dalles isométriques complètes (flancs compris), 4x2 ; ancre = pointe gauche de la face du dessus (demi-hauteur de la face)
T = cells(*key(nostar('r9-sols-gemini.webp'), shadows=False), 4, 2, (.5,), 2000)
TILES = []
for im in T:
    k2 = 512 / im.width; r = im.resize((512, round(im.height * k2)), Image.LANCZOS); al = np.array(r)[..., 3] > 128
    ys = np.nonzero(al[:, :6].any(1))[0]; TILES.append((r, int(ys.min())))
RH = max(c.height for c, _ in TILES) + 8; at = Image.new('RGBA', (4 * 520, RH * 2)); fr = []
for n, (c, cy) in enumerate(TILES):
    x, y = (n % 4) * 520, (n // 4) * RH; at.paste(c, (x, y)); fr.append([x, y, c.width, c.height, 256, cy])
at.save(os.path.join(ROOT, 'assets', 'sol_marais.webp'), quality=86, method=6); atlas['sol_marais'] = fr
print('sol_marais', at.size, os.path.getsize(os.path.join(ROOT, 'assets', 'sol_marais.webp')) // 1024, 'Ko', [f[3:] for f in fr][:3])
json.dump(atlas, open(fp, 'w'), separators=(',', ':'))
