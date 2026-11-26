# usage : python3 tools/prep_bg.py image_gemini sortie.webp  (3:2 ou 9:16) : efface l'étoile Gemini (coin bas droit) ; garde la TAILLE D'ORIGINE, qualité 92 (demande de Max, 26/11)
import sys,cv2,numpy as np
from PIL import Image
a=np.array(Image.open(sys.argv[1]).convert('RGB'));h,w=a.shape[:2]
cx,cy,r=w-112,h-112,58
pts=[(0,-r),(r*.28,-r*.28),(r,0),(r*.28,r*.28),(0,r),(-r*.28,r*.28),(-r,0),(-r*.28,-r*.28)]
m=np.zeros((h,w),np.uint8);cv2.fillPoly(m,[np.array([(cx+x,cy+y) for x,y in pts],np.int32)],255);m=cv2.dilate(m,np.ones((9,9),np.uint8))
a=cv2.inpaint(a,m,7,cv2.INPAINT_TELEA)
Image.fromarray(a).save(sys.argv[2],quality=92,method=6)
