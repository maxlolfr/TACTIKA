#!/usr/bin/env python3
"""V4.32 : images de la Forteresse de braise -> assets/ + atlas.json (monstres, Ignaros, obstacles).
Usage : python3 tools/prep_r7.py [dossier des originaux]   ; sols : voir NOTES.md (cut_tiles.py, TILE_N=8 TILE_W=512).
Monstres au format « boss » du jeu : repos, attaque, touché, spécial, KO, repos 2."""
import os, sys, json
import numpy as np
from PIL import Image
from scipy import ndimage
ROOT = os.path.join(os.path.dirname(__file__), '..')
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, '..', 'game-studio-ai/docs/studio/art/tactika/r7-planches')
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

# 3x3 : 0 repos, 1 prêt, 2 attaque, 3 touché, 4 sort, 5 dôme, 6 KO, 7 à terre, 8 victoire
for name, src, pick, ycuts in [('fireel', 'r7-01-elementaire-1812', [0, 4, 3, 8, 6, 1], (.313, .626)),
                               ('obsid', 'r7-02-chevalier-obsidienne-1815', [0, 2, 3, 4, 6, 1], (.313, .626)),
                               ('salam', 'r7-03-salamandre-1814', [0, 2, 3, 8, 6, 1], (.313, .606))]:
    c = cells(*key(os.path.join(SRC, src + '.png')), 3, 3, ycuts, 60)
    pack(name, [c[i] for i in pick], 190 / c[0].height)
# Ignaros : A (repos, marteau levé, recul, KO) et B (charge, frappe au sol, surchauffe, repos 2)
A = cells(*key(os.path.join(SRC, 'r7-07-ignaros-a-1816.png')), 2, 2, (.5,), 60)
B = cells(*key(os.path.join(SRC, 'r7-08-ignaros-b-1817.png')), 2, 2, (.5,), 60)
sc = 300 / A[0].height; scb = sc * A[0].height / B[3].height * (B[3].height / A[0].height if abs(B[3].height / A[0].height - 1) < .12 else 1)
ig = [A[0], B[1], A[2], B[2], A[3], B[3]]
ig = [im if k in (0, 2, 4) else im.resize((round(im.width * scb / sc), round(im.height * scb / sc)), Image.LANCZOS) for k, im in enumerate(ig)]
pack('ignaros', ig, sc)
# obstacles Gemini 4x2 : rocher, pilier, enclume, (enclume en double), lingots, charbon, chariot, (dalle en trop)
c = cells(*key(os.path.join(SRC, 'r7-10-obstacles-gemini-1823.png'), shadows=True), 4, 2, (.5,), 200)
pack('deco4', [c[i] for i in (0, 1, 2, 4, 5, 6)], .32, 86)
json.dump(atlas, open(fp, 'w'), separators=(',', ':'))
