# Village vivant (V4.10) : animaux, habitants et accessoires.
# usage : python3 tools/prep_vie.py <dossier art/tactika du studio> ; sortie : assets/vie/*.webp
import sys,os,numpy as np
from PIL import Image
from scipy import ndimage
art=sys.argv[1];os.makedirs('assets/vie',exist_ok=True)
def keyed(path,star=False):
    a=np.array(Image.open(path).convert('RGB'))
    a=a.astype(float)
    if star: # étoile Gemini (voile blanc à ~47 %, planche 2528×1696) : on retire le voile dans sa forme
        yy,xx=np.mgrid[:a.shape[0],:a.shape[1]];d=(np.abs(xx-2413)/68.)**.62+(np.abs(yy-1583)/68.)**.62
        w=(np.clip((1.05-d)/.1,0,1)*.47)[...,None];a=np.clip((a-w*255)/(1-w),0,255)
    r,g,b=a[...,0],a[...,1],a[...,2]
    al=np.clip((200-(np.minimum(r,b)-g))/130,0,1);bg=np.median(a[40:90,40:90].reshape(-1,3),0)
    rgb=np.clip((a-(1-al[...,None])*bg)/np.maximum(al,.05)[...,None],0,255)
    spill=np.clip(np.minimum(rgb[...,0],rgb[...,2])-rgb[...,1]-40,0,255)*(al<.98);rgb[...,0]-=spill;rgb[...,2]-=spill;al[al<.04]=0
    return rgb,al
# les n plus gros sujets de la planche, rangés ligne par ligne (les poses débordent parfois de leur case)
def subjects(path,rows,cols,star=False):
    rgb,al=keyed(path,star);lab,n=ndimage.label(ndimage.binary_opening(al>.5,iterations=2))
    sz=ndimage.sum(np.ones_like(lab),lab,range(1,n+1));keep=sorted(np.argsort(sz)[::-1][:rows*cols]+1)
    boxes=ndimage.find_objects(lab);H=al.shape[0]
    keep.sort(key=lambda i:((boxes[i-1][0].start+boxes[i-1][0].stop)//2*rows//H,boxes[i-1][1].start))
    out=[]
    for i in keep:
        m=ndimage.binary_dilation(lab==i,iterations=4);s=al*m;ys,xs=np.where(s>.1)
        im=Image.fromarray(np.dstack([rgb,s*255]).astype(np.uint8)).crop((xs.min(),ys.min(),xs.max()+1,ys.max()+1));out.append(im)
    return out
# bande de cases égales, pieds sur la même ligne ; h = hauteur de la 1re pose en pixels
def strip(name,ims,h):
    k=h/ims[0].height;ims=[i.resize((round(i.width*k),round(i.height*k)),Image.LANCZOS) for i in ims]
    W=max(i.width for i in ims)+4;H=max(i.height for i in ims)+2;S=Image.new('RGBA',(W*len(ims),H))
    for n,i in enumerate(ims):S.paste(i,(n*W+(W-i.width)//2,H-1-i.height))
    S.save(f'assets/vie/{name}.webp',quality=90,method=6);print(f'{name}:[{W},{H},{len(ims)}]',os.path.getsize(f'assets/vie/{name}.webp')//1024,'Ko')
O=art+'/v48/originaux/'
cc=subjects(O+'chat-chien-poses.png',2,4,True);pm=subjects(O+'poule-mesange-poses.png',2,4);hb=subjects(O+'habitants-marche.png',2,4)
strip('chat',[cc[0],cc[1],cc[3]],150)    # debout, patte levée, assis
strip('chien',[cc[4],cc[5],cc[7]],150)
strip('poule',[pm[0],pm[1],pm[3]],140)   # debout, un pas, picore
strip('mesange',[pm[4],pm[5],pm[6],pm[7]],110) # posée, puis 3 images de vol
strip('fermier',[hb[0]],300);strip('villageoise',[hb[4]],290)
for n in ['banc','banniere','charrette','enclume','etal','fontaine','lanterne','mannequin','trophee']:
    im=Image.open(f'{art}/village/accessoires/{n}.webp').convert('RGBA')
    if n=='lanterne': # halo rosé de la découpe : on retire les pixels roses
        a=np.array(im).astype(int);r,g,b=a[...,0],a[...,1],a[...,2]
        pink=((r-g>38)&(b-g>-4))|((r-g>40)&(b>108)&(g-b<35));a[...,3][pink]=0
        right=np.arange(a.shape[1])[None,:]>a.shape[1]*.45;a[...,3][right&(a[...,3]<150)]=0;im=Image.fromarray(a.astype(np.uint8))
    im.thumbnail((300,300),Image.LANCZOS);im.save(f'assets/vie/{n}.webp',quality=90,method=6);print(n,im.size)
