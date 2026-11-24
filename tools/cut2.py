# Planches V2 : marche/poses des héros (2x2), déplacements des monstres, kit d'interface (blocs libres), logo, camp, particules
import json, glob, numpy as np
from PIL import Image
from scipy import ndimage
U='/mnt/user-data/uploads/'; OUT='/home/claude/tactika/assets/'
def load(f): return np.array(Image.open(glob.glob(U+f+'-image.*')[0]).convert('RGB')).astype(float)
def thin(v):  # ne garder que les bandes fines (vrais traits de grille), élargies de 4 px
    lab,n=ndimage.label(v); out=np.zeros_like(v)
    for i in range(1,n+1):
        idx=np.nonzero(lab==i)[0]
        if len(idx)<=14: out[max(0,idx[0]-4):idx[-1]+5]=True
    return out
def key(a,kind):
    if kind=='black':
        br=a.max(2)>200
        for ax in (0,1):
            full=thin(br.mean(1-ax)>.9)
            if ax==0: a[full]=0
            else: a[:,full]=0
        al=np.clip((a.max(2)/255-.04)/.96,0,1); rgb=np.where(al[...,None]>0,a/np.maximum(al[...,None],1e-3),0); return rgb,al
    b=np.concatenate([a[:8].reshape(-1,3),a[-8:].reshape(-1,3),a[:,:8].reshape(-1,3),a[:,-8:].reshape(-1,3)]); M=np.median(b,0)
    dk=np.abs(a-M).sum(2)>60
    for ax in (0,1):  # traits de grille
        full=thin(dk.mean(1-ax)>.9)
        if ax==0: a[full]=M
        else: a[:,full]=M
    d=np.abs(a-M).sum(2); al=np.clip((d-80)/110,0,1)
    rgb=(a-(1-al[...,None])*M)/np.maximum(al[...,None],1e-3); return rgb,al
def comps(al,minfrac=.06):
    m=al>.5; lab,n=ndimage.label(ndimage.binary_closing(m,iterations=2)); 
    if n==0: return []
    sz=ndimage.sum(m,lab,range(1,n+1)); sl=ndimage.find_objects(lab); big=sz.max()
    return [(sl[i],lab==i+1) for i in range(n) if sz[i]>=minfrac*big]
def grid(al,C,R):
    H,W=al.shape; cells=[]
    for r in range(R):
        for c in range(C):
            y0,y1,x0,x1=H*r//R,H*(r+1)//R,W*c//C,W*(c+1)//C
            sub=al[y0:y1,x0:x1]; cs=comps(sub,.08)
            if not cs: cells.append(None); continue
            # garder le gros morceau + ceux qui ne touchent pas le bord de la case
            main=max(cs,key=lambda t:t[1].sum()); mask=np.zeros_like(sub,bool)
            for s,mk in cs:
                ys,xs=s
                if mk is main[1] or not(ys.start==0 or xs.start==0 or ys.stop==sub.shape[0] or xs.stop==sub.shape[1]): mask|=mk
            mask=ndimage.binary_dilation(mask,iterations=3)&(sub>0)
            ys,xs=np.nonzero(mask); cells.append((y0+ys.min(),y0+ys.max()+1,x0+xs.min(),x0+xs.max()+1,mask[ys.min():ys.max()+1,xs.min():xs.max()+1]))
    return cells
def pack(name,frames,scale,foot=True):
    ims=[];fr=[]
    for (rgb,al,y0,y1,x0,x1,mask) in frames:
        A=(al[y0:y1,x0:x1]*mask)*255
        im=Image.fromarray(np.dstack([np.clip(rgb[y0:y1,x0:x1],0,255),A]).astype(np.uint8))
        w,h=max(1,round(im.width*scale)),max(1,round(im.height*scale)); im=im.resize((w,h),Image.LANCZOS)
        if foot:
            low=mask[-max(4,mask.shape[0]//10):]; xs=np.nonzero(low)[1]; ax=(xs.mean() if len(xs) else mask.shape[1]/2)*scale; ay=h
        else: ax,ay=w/2,h/2
        ims.append(im); fr.append([0,0,w,h,round(float(ax),1),round(float(ay),1)])
    AW=max(1024,max(i.width for i in ims)); x=y=sh=0
    for f,i in zip(fr,ims):
        if x+i.width>AW: x=0;y+=sh+2;sh=0
        f[0],f[1]=x,y; x+=i.width+2; sh=max(sh,i.height)
    at=Image.new('RGBA',(AW,y+sh)); [at.paste(i,(f[0],f[1])) for f,i in zip(fr,ims)]
    at.save(OUT+name+'.webp',quality=82,method=6); return fr
man=json.load(open(OUT+'atlas.json'))
SHEETS={ # nom: (fichier, colonnes, lignes, échelle, fond, garder n premières cases)
 'kaelF':('362f0906',2,2,.42,'c',4),'kaelB':('bafcbd18',2,2,.42,'c',4),'kaelP':('9f7edcbe',2,2,.42,'c',4),
 'fennF':('caea1460',2,2,.42,'c',4),'fennB':('51976664',2,2,.42,'c',4),'fennP':('a8bce0f3',2,2,.42,'c',4),
 'aelisF':('edb19cbf',2,2,.42,'c',4),'aelisB':('4c85c179',2,2,.42,'c',4),'aelisP':('3e5ed492',2,2,.42,'c',4),
 'monAw':('73a4e493',4,4,.35,'c',12),'monBw':('166ad331',4,3,.35,'c',12),'monCw':('71064675',4,3,.35,'c',12),'monDw':('c5b6a4a3',4,3,.35,'c',12),
 'parts':('c37bbfe6',4,3,.4,'black',12)}
for n,(f,C,R,sc,bg,keep) in SHEETS.items():
    a=load(f); rgb,al=key(a,bg); cells=grid(al,C,R)[:keep]
    frames=[(rgb,al,c[0],c[1],c[2],c[3],c[4]) for c in cells if c]
    man[n]=pack(n,frames,sc,foot=(bg!='black')); print(n,len(man[n]),[f[3] for f in man[n]])
# kit d'interface : blocs libres, triés par lignes
a=load('145a8fb7'); rgb,al=key(a,'c'); m=al>.5; lab,nn=ndimage.label(ndimage.binary_closing(m,iterations=3)); sl=ndimage.find_objects(lab)
bl=[(s[0].start,s[0].stop,s[1].start,s[1].stop) for i,s in enumerate(sl) if (s[0].stop-s[0].start)*(s[1].stop-s[1].start)>2500]
bl.sort(key=lambda b:(round(((b[0]+b[1])/2)/60),b[2]))
frames=[(rgb,al,b[0],b[1],b[2],b[3],np.ones((b[1]-b[0],b[3]-b[2]),bool)) for b in bl]
man['ui']=pack('ui',frames,.5,foot=False); print('ui',len(man['ui']))
# logo
a=load('aeae47af'); rgb,al=key(a,'c'); ys,xs=np.nonzero(al>.5)
man['logo']=pack('logo',[(rgb,al,ys.min(),ys.max()+1,xs.min(),xs.max()+1,np.ones((ys.max()+1-ys.min(),xs.max()+1-xs.min()),bool))],.5,foot=False)
Image.open(glob.glob(U+'2966b6f4-image.*')[0]).convert('RGB').resize((768,1152),Image.LANCZOS).save(OUT+'camp.webp',quality=80,method=6)
json.dump(man,open(OUT+'atlas.json','w'),separators=(',',':'))
