#!/usr/bin/env python3
# V5.16 · redécoupe un boss (ou monstre) depuis ses planches ORIGINALES à pleine résolution, grilles quelconques (2×2, 3×2, 3×3…).
# usage : python3 tools/cut_boss_hd2.py <nom> <planche.png:CxR> [<planche2.png:CxR> ...] [--map 0,2,3,4,6,1] [--dry]
# Fond magenta. Cases numérotées dans l'ordre des planches, ligne par ligne. Sans --map, chaque entrée de l'atlas
# (ordre i, a, h, s, mort, idle2…) prend la case la plus proche de l'ancienne image (comparaison de silhouettes).
# Ancre = ancienne ancre × échelle ; la hauteur de référence suit la case 0 : taille à l'écran inchangée.
import sys,json,numpy as np
from PIL import Image
from scipy import ndimage as ndi
args=sys.argv[1:];MAP=None;DRY='--dry' in args
if '--map' in args:k=args.index('--map');MAP=[int(v) for v in args[k+1].split(',')];del args[k:k+2]
KEY2='--key2' in args  # V5.18 : planches de héros/chevaliers (bulles translucides, halos) : le violet des bulles n'est plus pris pour du fond
args=[a for a in args if a not in('--dry','--key2')];name=args[0];sheets=args[1:]
A=json.load(open('assets/atlas.json'));old=Image.open(f'assets/{name}.webp').convert('RGBA')
def key(c):
    r,g,b=c[...,0],c[...,1],c[...,2]
    m=np.minimum(r,b)-g;a=np.clip((95-m)/20,0,1)
    if KEY2:mm=m-1.6*np.maximum(np.abs(r-b)-25,0);a=a+(np.clip((95-mm)/20,0,1)-a)*.5
    sp=np.maximum(0,np.minimum(r,b)-g)*(a<.98);c=c.copy();c[...,0]-=sp*.9;c[...,2]-=sp*.9
    return np.clip(c,0,255),a
cells=[]
for sh in sheets:
    src,g=sh.rsplit(':',1);C,R=[int(v) for v in g.split('x')]
    im=np.asarray(Image.open(src).convert('RGB')).astype(float);H,W,_=im.shape;cw,chh=W//C,H//R
    for j in range(R):
        for i in range(C):
            c=im[j*chh:(j+1)*chh,i*cw:(i+1)*cw];cc,a=key(c)
            lab,n=ndi.label(a>.1)  # débris des cases voisines (petits morceaux collés au bord) retirés
            if n:
                ar=ndi.sum(np.ones_like(a),lab,range(1,n+1));big=ar.max();bd=set(lab[0,:])|set(lab[-1,:])|set(lab[:,0])|set(lab[:,-1])
                for L in range(1,n+1):
                    if L in bd and ar[L-1]<.05*big:a[lab==L]=0
            ys,xs=np.where(a>.03)
            y0,y1,x0,x1=max(0,ys.min()-2),min(chh,ys.max()+3),max(0,xs.min()-2),min(cw,xs.max()+3)
            rgba=np.dstack([cc[y0:y1,x0:x1],a[y0:y1,x0:x1]*255]).astype('uint8');cells.append(Image.fromarray(rgba,'RGBA'))
ent=A[name];res=[]
for k,(x,y,w,h,ax,ay) in enumerate(ent):
    o=np.asarray(old.crop((x,y,x+w,y+h)))[...,3].astype(float);best=None
    for ci,cim in enumerate(cells):
        r=np.asarray(cim.resize((w,h),Image.LANCZOS))[...,3].astype(float);d=np.abs(r-o).mean()
        if best is None or d<best[0]:best=(d,ci)
    res.append(best)
if MAP:res=[(0,c) for c in MAP]
print(name,len(cells),'cases ; choisies',[b[1] for b in res],'écarts',[round(float(b[0]),1) for b in res])
ch=[cells[b[1]] for b in res];s=ch[0].size[1]/ent[0][3]
if DRY:
    W2=sum(c.size[0] for c in ch);H2=max(c.size[1] for c in ch);pv=Image.new('RGBA',(W2,H2),(50,50,50,255));xx=0
    for c in ch:pv.paste(c,(xx,H2-c.size[1]),c);xx+=c.size[0]
    pv.thumbnail((1800,600));pv.save(f'/tmp/{name}_preview.png');print('aperçu /tmp/'+name+'_preview.png échelle',round(s,2));sys.exit()
# atlas : on réutilise la même place (pas de doublon si une case sert deux fois), étagères de 1400 px de large
uniq=[];idx=[]
for b in res:
    if b[1] not in uniq:uniq.append(b[1])
    idx.append(uniq.index(b[1]))
pos=[];xx=yy=rowh=0
for u in uniq:
    c=cells[u]
    if xx+c.size[0]>1400:xx=0;yy+=rowh+2;rowh=0
    pos.append((xx,yy));xx+=c.size[0]+2;rowh=max(rowh,c.size[1])
sheet=Image.new('RGBA',(1400,yy+rowh),(0,0,0,0))
for u,p in zip(uniq,pos):sheet.paste(cells[u],p)
new=[]
for k,e in enumerate(ent):
    c=cells[uniq[idx[k]]];p=pos[idx[k]]
    new.append([p[0],p[1],c.size[0],c.size[1],round(e[4]*c.size[0]/e[2],1),float(c.size[1])])
sheet.save(f'assets/{name}.webp','WEBP',quality=88,alpha_quality=100,method=6)
A[name]=new;json.dump(A,open('assets/atlas.json','w'),separators=(',',':'),ensure_ascii=False)
print(name,'atlas',sheet.size,'échelle',round(s,2))
