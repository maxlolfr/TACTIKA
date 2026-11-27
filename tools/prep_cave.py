#!/usr/bin/env python3
# V4.18 : découpe des planches des Cavernes (C6-03 à C6-08, C6-11). usage : python3 tools/prep_cave.py <dossier art/tactika/r6>
# Fond : magenta saturé relié au bord ou en grande zone pure (les ombres au sol partent, les violets du dessin restent).
import sys,json,numpy as np
from PIL import Image
from scipy import ndimage
D=sys.argv[1]+'/'
def cells(f,C,R,mirror=False):
  a=np.array(Image.open(D+f).convert('RGB')).astype(int);H,W=a.shape[:2];r,g,b=a[...,0],a[...,1],a[...,2]
  M=np.median(np.concatenate([a[:4].reshape(-1,3),a[-4:].reshape(-1,3)]),0);d=np.abs(a-M).sum(2)
  key=(g<45)&(r>140)&(b>150)&(np.abs(r-b)<60);lab,n=ndimage.label(key);I=range(1,n+1)
  edge=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))
  size=ndimage.sum(key,lab,I);med=ndimage.median(d,lab,I)
  bg=np.isin(lab,[i for i in I if i in edge or size[i-1]>=40 and med[i-1]<40])
  near=ndimage.binary_dilation(bg,iterations=2)&~bg;al=np.where(bg,0.,1.);al[near]=np.clip((d[near]-40)/150,0,1)
  rgb=a.astype(float);spill=np.clip(np.minimum(r,b)-g-60,0,None)*near;rgb[...,0]-=spill;rgb[...,2]-=spill
  # chaque forme va à la case de son centre : un membre qui dépasse n'est pas coupé
  fl,fn=ndimage.label(al>.3);cm=ndimage.center_of_mass(al>.3,fl,range(1,fn+1));fs=ndimage.sum(al>.3,fl,range(1,fn+1))
  own=np.array([-1]+[int(y*R//H)*C+int(x*C//W) if s>60 else -1 for (y,x),s in zip(cm,fs)])[fl]
  out=[]
  for k in range(R*C):
    m=ndimage.binary_dilation(own==k,iterations=2)&(al>0);ys,xs=np.nonzero(m);ya,yb,xa,xb=ys.min(),ys.max()+1,xs.min(),xs.max()+1
    im=Image.fromarray(np.dstack([np.clip(rgb,0,255),al*m*255])[ya:yb,xa:xb].astype(np.uint8),'RGBA')
    low=m[yb-max(4,(yb-ya)//10):yb,xa:xb];ax=float(np.nonzero(low)[1].mean());ay=float(yb-ya)
    org=(xa-W//C*(k%C),ya-H//R*(k//C)) # coin du cadre dans sa case
    if mirror: im=im.transpose(Image.FLIP_LEFT_RIGHT);ax=im.width-ax
    out.append((im,ax,ay,org))
  return out
def pack(name,fr,q=90):
  AW=2048;x=y=sh=0;pos=[]
  for im,ax,ay in fr:
    if x+im.width>AW:x=0;y+=sh+2;sh=0
    pos.append((x,y));x+=im.width+2;sh=max(sh,im.height)
  s=Image.new('RGBA',(AW,y+sh));F=[]
  for (im,ax,ay),(x,y) in zip(fr,pos):s.paste(im,(x,y));F.append([x,y,im.width,im.height,round(ax,1),round(ay,1)])
  s=s.crop((0,0,max(f[0]+f[2] for f in F),s.height));s.save(f'assets/{name}.webp',quality=q,method=6)
  A=json.load(open('assets/atlas.json'));A[name]=F;json.dump(A,open('assets/atlas.json','w'),separators=(',',':'));print(name,s.size,[f[2:4] for f in F])
def sc(c,k):im,ax,ay=c[:3];return(im.resize((round(im.width*k),round(im.height*k)),Image.LANCZOS),ax*k,ay*k)
def unit(name,poses,walk,order,h,wi=0,wref=0):
  k=h/poses[0][0].height;kw=k*poses[wref][0].height/walk[wi][0].height
  pack(name,[sc(poses[i],k) for i in order]+[sc(w,kw) for w in walk])
# ordre du jeu : repos, attaque, touché, spécial, KO, repos 2, puis 4 images de marche
S=cells('C6-03-araignee.png',3,2,True)  # regarde à gauche : miroir ; l'attaque est la pose dressée (3)
unit('qspider',S,cells('C6-04-araignee-marche.png',2,2),[0,2,4,5,4,1],250)
B=cells('C6-05-chauvesouris.png',3,2);W=cells('C6-06-chauvesouris-vol.png',2,2)
# vol : ancré sur le cristal du front (points relevés à la main), sinon la bête saute avec les ailes
P=[(424,228),(408,262),(423,221),(413,225)]
W=[(im,px-ox-(424-(W[0][3][0]+W[0][1])),py-oy+(W[0][3][1]+W[0][2]-228),None) for (im,_,_,(ox,oy)),(px,py) in zip(W,P)]
k=220/B[0][0].height;kw=k*.86
pack('prisbat',[sc(B[i],k) for i in range(6)]+[sc(w,kw) for w in W])
A=cells('C6-07-titan-A.png',2,2);T=cells('C6-08-titan-B-v2.png',2,2)
k=420/A[0][0].height;kt=k*1.0;WK=cells('titan-marche.png',2,2);kw=k*A[0][0].height/WK[1][0].height
# spécial = bras ouverts, torse en feu (planche B, case 4) : chargement du rayon
pack('titan',[sc(A[0],k),sc(A[1],k),sc(A[2],k),sc(T[3],kt),sc(A[3],k),sc(A[0],k)]+[sc(w,kw) for w in WK])
O=cells('C6-11-obstacles-v2.png',3,2);pack('deco3',[sc(o,.55) for o in O])
