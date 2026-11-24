import sys, json, glob, numpy as np
from scipy import ndimage
from PIL import ImageFilter
from PIL import Image
U='/mnt/user-data/uploads/'
S={ # name: file, cols, rows, scale, kind
 'items':('f85f8564',6,3,.36,'icon'),'spells':('7d42c16a',5,3,.36,'icon'),
 'monA':('db59ebca',3,3,.5,'char'),'monB':('428ad880',3,3,.5,'char'),
 'deco':('eec7fff9',4,3,.5,'char'),'tiles':('bc28be57',4,2,.5,'tile'),
 'warrior':('0d6f5c52',4,3,.5,'char'),'archer':('dba1e222',4,3,.5,'char'),
 'healer':('4444c5b7',4,3,.5,'char'),'monC':('dfd3a1e9',3,3,.5,'char'),'monD':('2da138c5',3,3,.5,'char'),'tiles2':('43f835df',4,2,.36,'tile'),'deco2':('dd39cfe9',4,3,.4,'char'),'fx':('414e71c1',4,2,.5,'fx')}
man={}
for name,(f,C,R,sc,kind) in S.items():
    a=np.array(Image.open(glob.glob(U+f+'-image.*')[0]).convert('RGB')).astype(float)
    H,W,_=a.shape
    if kind=='fx':
        al=a.max(2)/255; al=np.clip((al-.04)/.96,0,1)
        rgb=np.where(al[...,None]>0,a/np.maximum(al[...,None],1e-3),0)
    else:
        b=np.concatenate([a[:8].reshape(-1,3),a[-8:].reshape(-1,3),a[:,:8].reshape(-1,3),a[:,-8:].reshape(-1,3)])
        M=np.median(b,0)
        dk=(a.sum(2)<200)&(name=='deco2')   # traits de grille sombres sur toute la largeur/hauteur -> fond
        a[dk.mean(1)>.5]=M; a[:,dk.mean(0)>.5]=M
        for o in (-3,-2,-1,1,2,3):
            a[np.roll(dk.mean(1)>.5,o)]=M; a[:,np.roll(dk.mean(0)>.5,o)]=M
        d=np.abs(a-M).sum(2)
        al=np.clip((d-70)/110,0,1)
        if name=='healer':  # lueur jaune mélangée au magenta -> rose : on la ré-estime
            pk=(a[...,0]>170)&(a[...,2]>a[...,1]+25)&(a[...,1]<215)
            al=np.where(pk,np.minimum(al,np.clip(a[...,1]/225,0,1)),al)
        rgb=(a-(1-al[...,None])*M)/np.maximum(al[...,None],1e-3)
    rgba=np.dstack([np.clip(rgb,0,255),al*255]).astype(np.uint8)
    frames=[];ims=[]
    M5=al>.5
    def runs(p,n,minlen=12,gap=8):
        occ=np.nonzero(p>=3)[0]; out=[]
        for i in occ:
            if out and i-out[-1][1]<=gap: out[-1][1]=i+1
            else: out.append([i,i+1])
        out=[r for r in out if r[1]-r[0]>=minlen]
        return out if len(out)==n else [[n_*len(p)//n,(n_+1)*len(p)//n] for n_ in range(n)]
    for y0,y1 in runs(M5.sum(1),R):
        for x0,x1 in runs(M5[y0:y1].sum(0),C):
            m=M5[y0:y1,x0:x1].copy()
            lab,nl=ndimage.label(m)
            if nl>1:
                sz=ndimage.sum(m,lab,range(1,nl+1)); keep=[i+1 for i,v in enumerate(sz) if v>=.04*sz.max()]
                # un morceau qui touche le bord haut/bas de la bande vient d'une autre rangée
                for i in list(keep):
                    ys=np.nonzero(lab==i)[0]
                    if i!=int(np.argmax(sz))+1 and (ys.min()==0 or ys.max()==m.shape[0]-1): keep.remove(i)
                m=np.isin(lab,keep)
            rows=np.where(m.sum(1)>=3)[0]; cols=np.where(m.sum(0)>=3)[0]
            if not len(rows) or not len(cols): continue
            by0,by1,bx0,bx1=rows[0],rows[-1]+1,cols[0],cols[-1]+1
            sub=rgba[y0+by0:y0+by1,x0+bx0:x0+bx1].copy(); sub[...,3]=np.where(m[by0:by1,bx0:bx1]|(sub[...,3]<128)&ndimage.binary_dilation(m[by0:by1,bx0:bx1],iterations=3),sub[...,3],0)
            cut=Image.fromarray(sub)
            if name=='tiles2': cut.putalpha(cut.getchannel('A').filter(ImageFilter.MinFilter(5)))
            w,h=max(1,round(cut.width*sc)),max(1,round(cut.height*sc))
            cut=cut.resize((w,h),Image.LANCZOS)
            hh=by1-by0
            if kind=='char':  # pied = centre de masse du bas
                low=m[by1-max(4,hh//8):by1, bx0:bx1]; ys,xs=np.nonzero(low)
                ax=(xs.mean() if len(xs) else (bx1-bx0)/2)*sc; ay=h
            else: ax,ay=w/2,h/2
            ims.append(cut); frames.append([0,0,w,h,round(ax,1),round(ay,1)])
    # atlas en étagères
    AW=max(1024,max(i.width for i in ims)); x=y=sh=0
    for fr,i in zip(frames,ims):
        if x+i.width>AW: x=0;y+=sh+2;sh=0
        fr[0],fr[1]=x,y; x+=i.width+2; sh=max(sh,i.height)
    at=Image.new('RGBA',(AW,y+sh)); [at.paste(i,(fr[0],fr[1])) for fr,i in zip(frames,ims)]
    at.save(f'/home/claude/rpg/assets/{name}.png',optimize=True)
    man[name]=frames; print(name,len(frames),at.size)
json.dump(man,open('/home/claude/rpg/assets/atlas.json','w'),separators=(',',':'))
