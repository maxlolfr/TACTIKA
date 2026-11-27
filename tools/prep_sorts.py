#!/usr/bin/env python3
# V4.28 : icônes de sorts (planches RPG-08/09/10 et pictogrammes, fond magenta). usage : python3 tools/prep_sorts.py <dossier art/tactika/sorts>
# Sortie : assets/spells5.webp + entrée « spells5 » de atlas.json : 0 Charge, 1 Tir perforant, 2 Soin collectif, 3 Piège, 4 Renaissance.
import sys,json,numpy as np
from PIL import Image
from scipy import ndimage
S=160;D=sys.argv[1]+'/'
CASES=[('rpg08-sorts-kael-1772',3,3,0),('rpg09-sorts-fenn-1769',3,2,0),('rpg10-sorts-aelis-v2-1777',3,2,0),('pictos-6-1778',3,2,0),('pictos-6-1778',3,2,1)]
sheet=Image.new('RGBA',((S+2)*len(CASES),S));F=[]
for n,(f,C,R,k) in enumerate(CASES):
    a=np.array(Image.open(D+f+'.png').convert('RGB')).astype(float);H,W=a.shape[:2];r,g,b=a[...,0],a[...,1],a[...,2]
    al=np.clip((200-(np.minimum(r,b)-g))/130,0,1);al[al<.04]=0
    spill=np.clip(np.minimum(r,b)-g-40,0,255)*(al<.98);a[...,0]-=spill;a[...,2]-=spill
    # chaque forme va à la case de son centre : rien n'est coupé ni repris à la case voisine
    lab,m=ndimage.label(al>.3);cm=ndimage.center_of_mass(al>.3,lab,range(1,m+1));sz=ndimage.sum(al>.3,lab,range(1,m+1))
    own=np.array([False]+[s>60 and int(y*R//H)*C+int(x*C//W)==k for (y,x),s in zip(cm,sz)])[lab]
    keep=ndimage.binary_dilation(own,iterations=2)&(al>0);ys,xs=np.nonzero(keep)
    im=Image.fromarray(np.dstack([np.clip(a,0,255),al*keep*255]).astype(np.uint8),'RGBA').crop((xs.min(),ys.min(),xs.max()+1,ys.max()+1))
    im.thumbnail((S,S),Image.LANCZOS);x=n*(S+2);sheet.paste(im,(x+(S-im.width)//2,(S-im.height)//2));F.append([x,0,S,S,S/2,S])
sheet.save('assets/spells5.webp',quality=92,method=6)
A=json.load(open('assets/atlas.json'));A['spells5']=F;json.dump(A,open('assets/atlas.json','w'),separators=(',',':'));print(sheet.size)
