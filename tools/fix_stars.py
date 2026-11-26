# V4.7a : efface proprement les étoiles Gemini restées sur 5 fonds de combat (depuis les originaux).
# usage : python3 tools/fix_stars.py dossier_originaux assets/bg
import sys,cv2,numpy as np
from PIL import Image
BIG=[(188,191,50),(199,197,50)]
STARS={'prairie':BIG,'plage':BIG,'chateau':BIG,'bois':[(180,180,27),(250,250,29)],'mont-l':[(229,244,32)]} # coordonnées dans le coin 300x300
for n,st in STARS.items():
    a=np.array(Image.open(f'{sys.argv[1]}/{n}.png').convert('RGB'));h,w=a.shape[:2];m=np.zeros((h,w),np.uint8)
    for x,y,r in st:
        cx,cy,k=w-300+x,h-300+y,r*.45
        cv2.fillPoly(m,[np.array([(cx+dx,cy+dy) for dx,dy in [(0,-r),(k,-k),(r,0),(k,k),(0,r),(-k,k),(-r,0),(-k,-k)]],np.int32)],255)
    m=cv2.dilate(m,np.ones((9,9),np.uint8))
    a=cv2.inpaint(a,m,5,cv2.INPAINT_NS)
    Image.fromarray(a).save(f'{sys.argv[2]}/{n}.webp',quality=92,method=6)
