#!/usr/bin/env python3
"""V4.73 : images du Sanctuaire de l'Éther (R12) -> assets/ + atlas.json (monstres, Pharaon, obstacles, sols).
Usage : python3 tools/prep_r12.py [dossier des originaux] (par défaut art/r12, WebP sans perte). Fonctions key/cells/pack reprises de prep_r8.py.
Sols : une seule grande dalle par case (la dalle du bas de chaque planche Gemini, avec ses flancs).
Monstres au format « boss » du jeu : repos, attaque, touché, spécial, KO, repos 2."""
import os, sys, json
import numpy as np
from PIL import Image
from scipy import ndimage
ROOT = os.path.join(os.path.dirname(__file__), '..')
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'art', 'r12')
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



def keyclean(path, strict=False, thr=22, ramp=30):
    """key() + retrait de l'étoile Gemini (carré du coin bas droit, x > 93,6 % : l'arche s'arrête avant) + nettoyage de la frange magenta.
    strict (sols, obstacles : aucun violet franc dans ces images) : tout pixel rose/violet vif est supprimé (brume magenta sous les dalles, liseré)."""
    rgb, al = key(path, shadows=False); H, W = al.shape
    al[int(H * .88):, int(W * .936):] = 0
    R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    if strict: al = al * np.clip(1 - (np.minimum(R, B) - G - thr) / ramp, 0, 1)
    edge = al < .98  # bords : on durcit un peu l'alpha et on ramène le rose vers le vert
    al = np.clip((al - .3) / .7, 0, 1); lim = G * 1.12 + 14
    rgb[..., 0] = np.where(edge, np.minimum(R, lim), R); rgb[..., 2] = np.where(edge, np.minimum(B, lim + 10), B)
    return rgb, al

def clean(rgb, al, minpx=4000, grow=1):
    """garde seulement les gros objets (retire les restes de brume)"""
    lab, n = ndimage.label(al > .55); sizes = ndimage.sum(np.ones_like(al), lab, range(1, n + 1))
    keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s >= minpx])
    return rgb, al * ndimage.binary_dilation(keep, iterations=grow)

# aberration d'Éther, chevalier de l'Éther, gardien du Sanctuaire (3x2, ChatGPT, 27/11). Fond magenta propre, pas d'ombre peinte : shadows=False (le filtre « mauve » abîmerait les violets).
# Ordre du jeu [repos, attaque, touché, spécial, KO, repos 2]. Aberration : la pose 2 est cabrée (spécial), la 3 accroupie (touché) -> 0, 1, 3, 2, 4, 5. Chevalier et gardien : poses 0 à 5 telles quelles.
ab = cells(*keyclean(os.path.join(SRC, 'r12-aberration-ether-1996.webp')), 3, 2, (.5,), 60)
pack('etherbeast', [ab[i] for i in (0, 1, 3, 2, 4, 5)], 190 / ab[0].height)
for name, srcn in [('etherknight', 'r12-chevalier-ether-1999'), ('sanctguard', 'r12-gardien-sanctuaire-2000')]:
    c = cells(*keyclean(os.path.join(SRC, srcn + '.webp')), 3, 2, (.5,), 60)
    pack(name, c, 190 / c[0].height)
# Briseur primordial : A (repos, attaque, touché, KO) et B (hache levée, garde, à genoux, repos) en 2x2.
# Planche du jeu : repos A0, attaque A1, touché A2, spécial B2 (à genoux, défense brisée), KO A3, repos 2 B3
A = cells(*keyclean(os.path.join(SRC, 'r12-briseur-a-2001.webp')), 2, 2, (.5,), 60)
B = cells(*keyclean(os.path.join(SRC, 'r12-briseur-b-2002.webp')), 2, 2, (.5,), 60)
pack('breaker', [A[0], A[1], A[2], B[2], A[3], B[3]], 300 / A[0].height)

# sols (Gemini, 27/11, image 2003) : 8 dalles complètes, 4x2 ; 0 ardoise unie, 1 grandes dalles, 2 mosaïque bordée de pierre claire, 3 ardoise à filet doré, 4 croisée de bandes brunes, 5 gris uni, 6 pavés bleutés, 7 gris usé. Les dalles 5 et 6 (bas) ont une brume magenta : retirée par clean().
T = cells(*clean(*keyclean(os.path.join(SRC, 'r12-sols-2003.webp'), True, 6, 14)), 4, 2, (.5,), 2000)
TILES = []
for im in T:
    k2 = 512 / im.width; r = im.resize((512, round(im.height * k2)), Image.LANCZOS); al = np.array(r)[..., 3] > 128
    ys = np.nonzero(al[:, :6].any(1))[0]; TILES.append((r, int(ys.min())))
# dalles 5 et 6 : la brume magenta a mangé le bas du bloc. On reprend la silhouette d'une dalle intacte (7) et on reconstitue la matière manquante (inpainting).
import cv2
ref = np.array(TILES[7][0]); rh = ref.shape[0]
for i in (5, 6):
    bt = np.array(TILES[i][0]); cv = np.zeros((rh, 512, 4), np.uint8); hh = min(rh, bt.shape[0]); cv[:hh] = bt[:hh]
    low = np.zeros((rh, 512), bool); low[int(rh * .72):] = True
    spill = np.minimum(cv[..., 0].astype(int), cv[..., 2].astype(int)) - cv[..., 1].astype(int)
    miss = (ref[..., 3] > 128) & ((cv[..., 3] < 235) | (low & (spill > 2)))
    miss = cv2.dilate(miss.astype(np.uint8), np.ones((5, 5), np.uint8))
    rgb2 = cv2.inpaint(np.ascontiguousarray(cv[..., :3]), miss, 7, cv2.INPAINT_TELEA)
    al2 = ref[..., 3]; im2 = Image.fromarray(np.dstack([rgb2, al2]).astype(np.uint8))
    TILES[i] = (im2, int(np.nonzero(al2[:, :6] > 128)[0].min()))
RH = max(c.height for c, _ in TILES) + 8; at = Image.new('RGBA', (4 * 520, RH * 2)); fr = []
for n, (c, cy) in enumerate(TILES):
    x, y = (n % 4) * 520, (n // 4) * RH; at.paste(c, (x, y)); fr.append([x, y, c.width, c.height, 256, cy])
at.save(os.path.join(ROOT, 'assets', 'sol_eter.webp'), quality=86, method=6); atlas['sol_eter'] = fr
print('sol_eter', at.size, os.path.getsize(os.path.join(ROOT, 'assets', 'sol_eter.webp')) // 1024, 'Ko')

# obstacles (Gemini, 27/11, image 2004) : 9 objets, 4 en haut + 5 en bas (pas de grille 4x2). Chaque morceau est attribué à la case par sa position (les gravats suivent leur mur).
# 0 mur en ruine, 1 grille de bois, 2 escalier, 3 vasque, 4 coin de mur brisé, 5 balustrade, 6 obélisque sombre, 7 obélisque clair, 8 arche courbe
rgb, al = keyclean(os.path.join(SRC, 'r12-obstacles-2004.webp'), True)
H, W = al.shape
lab, n = ndimage.label(ndimage.binary_closing(al > .12, iterations=1))
SPL = [[.265, .525, .775], [.275, .52, .665, .80]]  # coupures verticales (part de la largeur) de la rangée du haut et de celle du bas
own = np.full((H, W), -1)
for i, sl in enumerate(ndimage.find_objects(lab)):
    m = lab[sl] == i + 1
    if m.sum() < 40: continue
    ys, xs = np.nonzero(m); cy, cx = (ys.mean() + sl[0].start) / H, (xs.mean() + sl[1].start) / W
    r = int(cy > .5); c = sum(int(cx > s) for s in SPL[r]); own[sl][m] = c if r == 0 else 4 + c
obs = []
for c in range(9):
    m = ndimage.binary_dilation(own == c, iterations=2) & (al > 0)
    ys, xs = np.nonzero(m); ya, yb, xa, xb = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    obs.append(Image.fromarray(np.dstack([rgb[ya:yb, xa:xb], al[ya:yb, xa:xb] * m[ya:yb, xa:xb] * 255]).astype(np.uint8)))
pack('deco9', obs, .278, 86)  # même échelle que deco8 (planche de 3168 px)
json.dump(atlas, open(fp, 'w'), separators=(',', ':'))
