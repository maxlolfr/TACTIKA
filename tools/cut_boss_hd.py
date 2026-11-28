#!/usr/bin/env python3
# V5.14.7 · redécoupe les boss de R1–R3 depuis les planches ORIGINALES 3×3 (1254×1254) à pleine résolution.
# usage : python3 tools/cut_boss_hd.py <nom: roiG|crabK|wolfK> <planche.png> <fond: black|magenta>
# 4e argument facultatif : cases de la planche pour les 6 entrées (ex. 0,2,3,4,6,1) ; sinon comparaison avec l'ancien atlas.
# Les 6 cases utilisées par le jeu (atlas.json, ordre i, a, h, s, mort, idle2) sont retrouvées en comparant avec l'ancien atlas ;
# ancre = ancienne ancre × échelle, hauteur de référence = case 0 (l'unité garde donc la même taille à l'écran).
import sys,json,numpy as np
from PIL import Image
from scipy import ndimage as ndi
name,src,bgk=sys.argv[1:4];MAP=[int(v) for v in sys.argv[4].split(',')] if len(sys.argv)>4 else None;A=json.load(open('assets/atlas.json'));old=Image.open(f'assets/{name}.webp').convert('RGBA')
im=np.asarray(Image.open(src).convert('RGB')).astype(float);H,W,_=im.shape;cw=W//3
def key(c):
    r,g,b=c[...,0],c[...,1],c[...,2]
    if bgk=='magenta':
        m=np.minimum(r,b)-g;a=np.clip((95-m)/20,0,1)
        sp=np.maximum(0,np.minimum(r,b)-g)*(a<.98);c=c.copy();c[...,0]-=sp*.9;c[...,2]-=sp*.9
        return np.clip(c,0,255),a
    mx=c.max(-1);bg=mx<45;lab,n=ndi.label(bg);edge=set(lab[0,:])|set(lab[-1,:])|set(lab[:,0])|set(lab[:,-1]);edge.discard(0)
    out=np.isin(lab,list(edge));band=ndi.binary_dilation(out,iterations=7)&~out
    a=np.ones_like(mx);a[out]=0;a[band]=np.clip(mx[band]/110,0,1)
    cc=c.copy();k=np.maximum(a,1e-3)[...,None];cc[band]=np.clip(c[band]/k[band],0,255)
    return cc,a
cells=[]
for j in range(3):
    for i in range(3):
        c=im[j*cw:(j+1)*cw,i*cw:(i+1)*cw];cc,a=key(c)
        lab,n=ndi.label(a>.1)  # retire les débris des cases voisines : petits morceaux (< 5 % du plus gros) qui touchent le bord de la case
        if n:
            ar=ndi.sum(np.ones_like(a),lab,range(1,n+1));big=ar.max();bd=set(lab[0,:])|set(lab[-1,:])|set(lab[:,0])|set(lab[:,-1])
            for L in range(1,n+1):
                if L in bd and ar[L-1]<.05*big:a[lab==L]=0
        ys,xs=np.where(a>.03)
        y0,y1,x0,x1=max(0,ys.min()-2),min(cw,ys.max()+3),max(0,xs.min()-2),min(cw,xs.max()+3)
        rgba=np.dstack([cc[y0:y1,x0:x1],a[y0:y1,x0:x1]*255]).astype('uint8');cells.append(Image.fromarray(rgba,'RGBA'))
ent=A[name];res=[]
for k,(x,y,w,h,ax,ay) in enumerate(ent):
    o=np.asarray(old.crop((x,y,x+w,y+h)))[...,3].astype(float);best=None
    for ci,cim in enumerate(cells):
        r=np.asarray(cim.resize((w,h),Image.LANCZOS))[...,3].astype(float);d=np.abs(r-o).mean()
        if best is None or d<best[0]:best=(d,ci)
    res.append(best)
if MAP:res=[(0,c) for c in MAP]
print(name,'cases',[b[1] for b in res],'écarts',[round(float(b[0]),1) for b in res])
ch=[cells[b[1]] for b in res];s=ch[0].size[0]/ent[0][2]  # échelle d'après la case 0
# rangement en étagères, largeur 1400
pos=[];xx=yy=rowh=0
for c in ch:
    if xx+c.size[0]>1400:xx=0;yy+=rowh+2;rowh=0
    pos.append((xx,yy));xx+=c.size[0]+2;rowh=max(rowh,c.size[1])
sheet=Image.new('RGBA',(1400,yy+rowh),(0,0,0,0))
for c,p in zip(ch,pos):sheet.paste(c,p)
new=[[p[0],p[1],c.size[0],c.size[1],round(e[4]*c.size[0]/e[2],1),float(c.size[1])] for c,p,e in zip(ch,pos,ent)]
sheet.save(f'assets/{name}.webp','WEBP',quality=88,alpha_quality=100,method=6)
A[name]=new;json.dump(A,open('assets/atlas.json','w'),separators=(',',':'),ensure_ascii=False)
print(name,'atlas',sheet.size,'échelle',round(s,2))
