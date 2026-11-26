# Découpe la planche des coffres (2 coffres en haut, fond magenta) en deux PNG alignés sur la même base.
import numpy as np,sys
from PIL import Image
from scipy import ndimage
img=np.array(Image.open(sys.argv[1]).convert('RGB')).astype(float);H,W,_=img.shape
M=np.array([255,0,255.]);d=np.abs(img-M).sum(2);al=np.clip((d-80)/110,0,1)
rgb=np.clip((img-(1-al[...,None])*M)/np.maximum(al[...,None],1e-3),0,255)
k=np.maximum(0,np.minimum(rgb[...,0],rgb[...,2])-rgb[...,1])*(1-al)**.5 # liseré magenta des bords
rgb[...,0]-=k;rgb[...,2]-=k
out=[]
for half in (slice(0,W//2),slice(W//2,W)):
 a=al[:,half].copy();lab,n=ndimage.label(a>.5);big=max(range(1,n+1),key=lambda i:(lab==i).sum());a[ndimage.binary_dilation(lab==big,iterations=3)==0]=0
 ys,xs=np.nonzero(a>.5);bot=ys.max();base=xs[ys>bot-60];cx=(base.min()+base.max())/2
 out.append(dict(a=a,rgb=rgb[:,half],top=ys.min(),bot=bot,l=xs.min(),r=xs.max(),cx=cx,bw=base.max()-base.min()))
 print('largeur de base',base.max()-base.min(),'haut',bot-ys.min())
up=max(o['bot']-o['top'] for o in out)+4;hw=max(max(o['cx']-o['l'],o['r']-o['cx']) for o in out)+4
S=float(sys.argv[2]) # échelle finale
for o,name in zip(out,['chest_closed','chest_open']):
 x0=int(round(o['cx']-hw));y0=o['bot']+2-up;w=int(2*hw);h=up
 rgba=np.zeros((h,w,4));src=np.dstack([o['rgb'],o['a']*255])
 sy0,sx0=max(0,y0),max(0,x0);sy1,sx1=min(H,y0+h),min(W//2,x0+w)
 rgba[sy0-y0:sy1-y0,sx0-x0:sx1-x0]=src[sy0:sy1,sx0:sx1]
 im=Image.fromarray(rgba.astype('uint8'),'RGBA');im=im.resize((round(w*S),round(h*S)),Image.LANCZOS)
 im.save(f'/home/claude/TACTIKA/assets/{name}.png',optimize=True);print(name,im.size)
