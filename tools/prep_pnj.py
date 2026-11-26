# Bandes de PNJ du village (V4.8a) : 4 cases égales (repos, geste 1, geste 2, salut), pieds alignés et centrés.
# usage : python3 tools/prep_pnj.py <dossier des poses découpées> ; sortie : assets/pnj/<nom>.webp
import sys,os,numpy as np
from PIL import Image
P={'borin':(1,3,4,5),'garrick':(1,2,3,5),'darius':(1,3,4,5),'mira':(1,3,4,5),'ezran':(1,3,4,5),'elyndra':(1,3,4,5)}
K=360/780   # même échelle pour tous
os.makedirs('assets/pnj',exist_ok=True)
for n,ids in P.items():
    ims=[Image.open(f'{sys.argv[1]}/{n}-{i}.webp').convert('RGBA') for i in ids]
    ims=[i.resize((round(i.width*K),round(i.height*K)),Image.LANCZOS) for i in ims]
    ax=[]   # axe du corps : milieu des pieds (bas de l'image)
    for i in ims:
        xs=np.where(np.array(i)[int(i.height*.93):,:,3]>128)[1];ax.append((xs.min()+xs.max())//2)
    half=max(max(a,i.width-a) for a,i in zip(ax,ims))+2;H=max(i.height for i in ims)+2
    S=Image.new('RGBA',(half*8,H))
    for k,(a,i) in enumerate(zip(ax,ims)):S.paste(i,(k*half*2+half-a,H-1-i.height))
    S.save(f'assets/pnj/{n}.webp',quality=90,method=6)
    print(f"{n}:[{half*2},{H}]",os.path.getsize(f'assets/pnj/{n}.webp')//1024,'Ko')
