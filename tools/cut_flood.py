# usage : python3 tools/cut_flood.py planche.png nom cols rows echelle
# Détourage pour les objets à lueur violette (C6-09) : seul le magenta RELIÉ AU BORD de chaque case est effacé,
# les lueurs magenta enfermées dans l'objet sont gardées. Écrit assets/<nom>.webp et l'entrée de assets/atlas.json.
import sys,json,cv2,numpy as np
from PIL import Image
src,name,C,Rw,k=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4]),float(sys.argv[5])
a=np.array(Image.open(src).convert('RGB')).astype(int);H,W=a.shape[:2];ch,cw=H//Rw,W//C;cells=[]
for j in range(Rw):
 for i in range(C):
  c=a[j*ch:(j+1)*ch,i*cw:(i+1)*cw];r,g,b=c[...,0],c[...,1],c[...,2]
  key=((r>170)&(b>170)&(g<110)&(np.abs(r-b)<70)).astype(np.uint8)
  n,lab=cv2.connectedComponents(key);edge=set(lab[0])|set(lab[-1])|set(lab[:,0])|set(lab[:,-1]);edge.discard(0)
  bg=np.isin(lab,list(edge));al=np.where(bg,0,255).astype(np.uint8)
  al=cv2.erode(al,np.ones((3,3),np.uint8));al=cv2.GaussianBlur(al,(3,3),0) # bord adouci, liseré rose réduit
  rgba=np.dstack([c.astype(np.uint8),al]);ys,xs=np.where(al>20);im=Image.fromarray(rgba).crop((xs.min(),ys.min(),xs.max()+1,ys.max()+1))
  cells.append(im.resize((round(im.width*k),round(im.height*k)),Image.LANCZOS))
sw=sum(c.width for c in cells)+2*len(cells);sh=max(c.height for c in cells);sheet=Image.new('RGBA',(sw,sh));x=0;fr=[]
for c in cells:sheet.paste(c,(x,0));fr.append([x,0,c.width,c.height,round(c.width/2,1),float(c.height)]);x+=c.width+2
sheet.save(f'assets/{name}.webp',quality=93,method=6)
A=json.load(open('assets/atlas.json'));A[name]=fr;json.dump(A,open('assets/atlas.json','w'),separators=(',',':'));print(name,[f[2:4] for f in fr])
