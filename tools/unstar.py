#!/usr/bin/env python3
# V4.19 : retire l'étoile Gemini (voile blanc translucide) en inversant le mélange : le dessin dessous est gardé,
# seul le liseré est retouché. usage : python3 tools/unstar.py image sortie.webp
import sys,cv2,numpy as np
from PIL import Image
a=np.array(Image.open(sys.argv[1]).convert('RGB')).astype(np.float32);h,w=a.shape[:2]
c=a[h-190:h-34,w-190:w-34]  # l'étoile est centrée à 112 px du coin
g=c.min(2);base=cv2.medianBlur(g.astype(np.uint8),5).astype(np.float32)
ref=np.zeros(g.shape,np.uint8);cv2.circle(ref,(78,78),18,1,-1)
# forme : zone claire et peu saturée reliée au centre
th=(np.median(g[ref>0])+np.percentile(g,40))/2
n,lab=cv2.connectedComponents((base>th).astype(np.uint8));m=(lab==np.bincount(lab[ref>0]).argmax()).astype(np.uint8)
m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
ring=cv2.dilate(m,np.ones((7,7),np.uint8))-cv2.erode(m,np.ones((5,5),np.uint8))
B=cv2.inpaint(c.astype(np.uint8),cv2.dilate(m,np.ones((7,7),np.uint8)),3,cv2.INPAINT_TELEA).astype(np.float32)
edge=(cv2.dilate(m,np.ones((17,17),np.uint8))-cv2.dilate(m,np.ones((7,7),np.uint8)))>0
ins=(cv2.erode(m,np.ones((7,7),np.uint8))-cv2.erode(m,np.ones((17,17),np.uint8)))>0
o=np.median(c[edge],0);i=np.median(c[ins],0);al=float(np.clip(np.median((i-o)/(255-o)),.2,.8))
r=c.copy();r[m>0]=np.clip((c[m>0]-al*255)/(1-al),0,255)
r=cv2.inpaint(r.astype(np.uint8),ring,3,cv2.INPAINT_TELEA)
a[h-190:h-34,w-190:w-34]=r;Image.fromarray(a.astype(np.uint8)).save(sys.argv[2],quality=92,method=6);print('alpha',round(al,2),int(m.sum()))
