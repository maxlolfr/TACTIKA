#!/usr/bin/env python3
"""Découpe d'une planche de sprites sur fond magenta uni (grille stricte, ex. 2x2 de 512 px).
Usage : python3 tools/cut3.py planche.png nom [--cols 2 --rows 2 --scale 0.5 --atlas]
- supprime le fond (couleur la plus fréquente des bords, normalement #FF00FF) et la frange magenta ;
- découpe chaque case de la grille, recadre sur le personnage, ancre = pieds (milieu des 10 % du bas) ;
- écrit assets/<nom>.webp et, avec --atlas, ajoute <nom> à assets/atlas.json ([x,y,l,h,ancre x,ancre y]) ;
- sans --atlas : essai à blanc (affiche les cadres et les anomalies, n'écrit rien).
Vérifié le 25/11/2026 sur une planche synthétique 2x2 de 512 px : 4 cadres, aucune frange magenta, pieds ancrés."""
import sys, json, argparse, os
import numpy as np
from PIL import Image
from scipy import ndimage
p=argparse.ArgumentParser();p.add_argument('sheet');p.add_argument('name');p.add_argument('--cols',type=int,default=2);p.add_argument('--rows',type=int,default=2)
p.add_argument('--protect',action='store_true',help='garde les violets du personnage : seul le magenta pur (et son bord) est effacé')
p.add_argument('--blobs',action='store_true',help='un membre qui dépasse de sa case n\'est pas coupé : chaque forme va à la case de son centre')
p.add_argument('--quality',type=int,default=82);p.add_argument('--scale',type=float,default=.5);p.add_argument('--atlas',action='store_true');p.add_argument('--out',default=os.path.join(os.path.dirname(__file__),'..','assets'))
a=p.parse_args()
# l'échelle est relative à une case de 512 px de haut : la taille de la planche reçue n'a donc pas d'importance
img=np.array(Image.open(a.sheet).convert('RGB')).astype(float);H,W,_=img.shape
edge=np.concatenate([img[:4].reshape(-1,3),img[-4:].reshape(-1,3),img[:,:4].reshape(-1,3),img[:,-4:].reshape(-1,3)]);M=np.median(edge,0)
warn=[]
k512=512/(H/a.rows)
if abs(k512-1)>.02: warn.append(f'cases de {W//a.cols}x{H//a.rows} px au lieu de 512x512 : mises à l\'échelle (x{k512:.2f})')
if np.abs(M-[255,0,255]).sum()>60: warn.append(f'fond {M.astype(int).tolist()} différent de #FF00FF')
d=np.abs(img-M).sum(2);al=np.clip((d-80)/110,0,1)
if a.protect:
  lb,_n=ndimage.label(d<80);areas=np.bincount(lb.ravel());pure=(lb>0)&(areas[lb]>=40)
  al=np.where(ndimage.binary_dilation(pure,iterations=3),al,1.0)
if a.blobs:
  glab,gn=ndimage.label(ndimage.binary_closing(al>.5,iterations=2))
  cm=ndimage.center_of_mass(np.ones_like(al),glab,range(1,gn+1))
  owner=np.array([-1]+[min(a.rows-1,int(cy*a.rows//H))*a.cols+min(a.cols-1,int(cx*a.cols//W)) for cy,cx in cm])[glab]
rgb=np.clip((img-(1-al[...,None])*M)/np.maximum(al[...,None],1e-3),0,255)
frames=[]
for r in range(a.rows):
  for c in range(a.cols):
    y0,y1,x0,x1=H*r//a.rows,H*(r+1)//a.rows,W*c//a.cols,W*(c+1)//a.cols
    if a.blobs:
      pad=W//a.cols//4;x0,x1=max(0,x0-pad),min(W,x1+pad)
      sub=np.where(ndimage.binary_dilation(owner==r*a.cols+c,iterations=4),al,0)[y0:y1,x0:x1]
    else: sub=al[y0:y1,x0:x1]
    lab,n=ndimage.label(ndimage.binary_closing(sub>.5,iterations=2))
    if n==0: warn.append(f'case {r*a.cols+c+1} vide');continue
    sz=ndimage.sum(sub>.5,lab,range(1,n+1));sl=ndimage.find_objects(lab);big=sz.max();mask=np.zeros(sub.shape,bool)
    for i in range(n):
      s=sl[i]
      if sz[i]>=.06*big and (sz[i]==big or not(s[0].start==0 or s[1].start==0 or s[0].stop==sub.shape[0] or s[1].stop==sub.shape[1])): mask|=lab==i+1
    mask=ndimage.binary_dilation(mask,iterations=3)&(sub>0)
    ys,xs=np.nonzero(mask);ya,yb,xa,xb=ys.min(),ys.max()+1,xs.min(),xs.max()+1
    if ya==0 or xa==0 or yb==sub.shape[0] or xb==sub.shape[1]: warn.append(f'case {r*a.cols+c+1} touche le bord')
    m=mask[ya:yb,xa:xb];A=sub[ya:yb,xa:xb]*m*255
    im=Image.fromarray(np.dstack([rgb[y0:y1,x0:x1][ya:yb,xa:xb],A]).astype(np.uint8))
    sc=a.scale*k512;w,h=max(1,round(im.width*sc)),max(1,round(im.height*sc));im=im.resize((w,h),Image.LANCZOS)
    low=m[-max(4,m.shape[0]//10):];fx=np.nonzero(low)[1];ax=(fx.mean() if len(fx) else m.shape[1]/2)*sc
    frames.append((im,[0,0,w,h,round(float(ax),1),float(h)],(y0+yb)-0,(x0+xa)))
AW=max(1024,max(f[0].width for f in frames));x=y=sh=0
for im,fr,_,_ in frames:
  if x+im.width>AW:x=0;y+=sh+2;sh=0
  fr[0],fr[1]=x,y;x+=im.width+2;sh=max(sh,im.height)
sheet=Image.new('RGBA',(AW,y+sh))
for im,fr,_,_ in frames:sheet.paste(im,(fr[0],fr[1]))
cells=[f[1] for f in frames]
print(json.dumps({'name':a.name,'frames':cells,'avertissements':warn},ensure_ascii=False))
if a.atlas:
  sheet.save(os.path.join(a.out,a.name+'.webp'),quality=a.quality,method=6)
  fp=os.path.join(a.out,'atlas.json');man=json.load(open(fp));man[a.name]=cells;json.dump(man,open(fp,'w'),separators=(',',':'))
