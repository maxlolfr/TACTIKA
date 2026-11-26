# Détoure une planche 4x4 de tuiles en relief (fond uni, sombre ou magenta) -> assets/<nom>.webp + entrée <nom> de l'atlas.
# usage : python3 tools/cut_tiles.py planche.png nom [--sheet apercu.png]
NAME=__import__("sys").argv[2]
import sys,json,numpy as np
from PIL import Image
from scipy import ndimage
a=np.array(Image.open(sys.argv[1]).convert('RGB')).astype(float);H,W,_=a.shape
bg=np.median(np.concatenate([a[:10].reshape(-1,3),a[:,:10].reshape(-1,3)]),0)
d=np.abs(a-bg).sum(2)
# fond = zone proche de la couleur de fond ET reliée au bord (les ombres internes des tuiles restent)
lab,_=ndimage.label(d<34);edge=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
solid=ndimage.binary_opening(~np.isin(lab,list(edge)),iterations=2)
lab,n=ndimage.label(solid);sizes=ndimage.sum(solid,lab,range(1,n+1))
NT=int(__import__('os').environ.get('TILE_N',16)) # TILE_N : nombre de tuiles sur la planche
boxes=[(i+1,ndimage.find_objects((lab==i+1).astype(int))[0]) for i in np.argsort(sizes)[::-1][:NT]]
boxes.sort(key=lambda b:(round((b[1][0].start+b[1][0].stop)/2/(H/4)-.5),b[1][1].start))
cut=[];geo=[];TW=int(__import__("os").environ.get("TILE_W",240)) # TILE_W : largeur gardée (V4.0 : taille native des planches récentes)
for i,(ys,xs) in boxes:
    m=ndimage.binary_fill_holes(lab[ys,xs]==i);al=ndimage.gaussian_filter(ndimage.binary_erosion(m).astype(float),.7)
    px=a[ys,xs].copy()
    if bg[0]>180 and bg[2]>180 and bg[1]<90:
        rim=m&~ndimage.binary_erosion(m,iterations=3);spill=np.clip(np.minimum(px[...,0],px[...,2])-px[...,1],0,None)*rim
        px[...,0]-=spill;px[...,2]-=spill
    im=Image.fromarray(np.dstack([px,al*255]).astype(np.uint8))
    # face du dessus : coins gauche/droit = lignes les plus hautes des colonnes extrêmes
    cols=[np.nonzero(m[:,x])[0] for x in (list(range(3,9))+list(range(m.shape[1]-9,m.shape[1]-3)))]
    cy=float(np.median([c[0] for c in cols]))+3
    k=TW/m.shape[1];im=im.resize((TW,round(m.shape[0]*k)),Image.LANCZOS)
    cut.append(im);geo.append(round(cy*k))
AW=TW*4+8*3;rowh=max(c.height for c in cut)+8;at=Image.new('RGBA',(AW,rowh*((len(cut)+3)//4)));fr=[]
for n,(c,cy) in enumerate(zip(cut,geo)):
    x,y=(n%4)*(TW+8),(n//4)*rowh;at.paste(c,(x,y));fr.append([x,y,c.width,c.height,TW//2,cy])
at.save(f'assets/{NAME}.webp',quality=int(__import__('os').environ.get('TILE_Q',86)),method=6)
A=json.load(open('assets/atlas.json'));A[NAME]=fr;json.dump(A,open('assets/atlas.json','w'),separators=(',',':'))
print(len(fr),at.size,[(f[3],f[5]) for f in fr])
if '--sheet' in sys.argv:
    s=Image.new('RGBA',at.size,(255,0,255,255));s.alpha_composite(at);s.save(sys.argv[-1])
