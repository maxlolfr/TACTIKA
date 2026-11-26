# V4.6.1 : découpe les planches magenta du village. usage : python3 tools/cut_village.py cristaux|accessoires|seul image dossier_sortie
import sys,os,numpy as np
from PIL import Image
from scipy import ndimage
mode,src,out=sys.argv[1:4];os.makedirs(out,exist_ok=True)
a=np.array(Image.open(src).convert('RGB'),float);H,W=a.shape[:2]
r,g,b=a[...,0],a[...,1],a[...,2]
m=np.minimum(r,b)-g                                   # « quantité de magenta »
al=np.clip((200-m)/(200-70),0,1)
bg=np.median(a[:40,:40].reshape(-1,3),0)
rgb=np.clip((a-(1-al[...,None])*bg)/np.maximum(al,.05)[...,None],0,255)   # retire la frange rose
spill=np.clip(np.minimum(rgb[...,0],rgb[...,2])-rgb[...,1]-40,0,255)*(al<.98)
rgb[...,0]-=spill;rgb[...,2]-=spill
ombre=(g<70)&(np.abs(r-b)<60)&(r>90)&(r<235)&(m>60)      # ombre peinte sur le magenta → ombre neutre
rgb[ombre]=(25,14,8);al[ombre]=np.clip(1-r[ombre]/255,0,.6)
al[al<.04]=0
yy,xx=np.mgrid[:H,:W]                                  # étoile Gemini (coin bas droit)
sx,sy=(2799,1328) if mode=='cristaux' else (1935,1935)
al[np.abs(xx-sx)+np.abs(yy-sy)<92]=0
rgba=np.dstack([rgb,al*255]).astype(np.uint8)
def save(mask,name):
    c=rgba.copy();c[~mask,3]=0;im=Image.fromarray(c);im=im.crop(im.getchannel('A').point(lambda v:255 if v>12 else 0).getbbox())
    im.save(f'{out}/{name}.webp',quality=92,method=6);print(name,im.size)
if mode=='cristaux':
    X=[0,390,760,1180,1900,W]
    # chaque composante va dans la colonne de son centre (les éclats flottants restent avec leur cristal)
    X=[0,388,754,1141,1778,2576];X=[round(v*W/2576) for v in X]
    lab,n=ndimage.label(al>.1);cx=[c[1] for c in ndimage.center_of_mass(al>.1,lab,range(1,n+1))]
    for i in range(5):
        ids=[k+1 for k,c in enumerate(cx) if X[i]<=c<X[i+1]]
        save(np.isin(lab,ids),f'crystal{i+1}')
elif mode=='accessoires':
    N='etal enclume mannequin lanterne banniere charrette banc fontaine trophee'.split()
    lab,n=ndimage.label(al>.1);C=ndimage.center_of_mass(al>.1,lab,range(1,n+1))
    for i,name in enumerate(N):
        ids=[k+1 for k,(y,x) in enumerate(C) if int(x*3//W)==i%3 and int(y*3//H)==i//3]
        save(np.isin(lab,ids),name)
else: save(al>0,'cristal-seul')
