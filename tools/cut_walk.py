# usage : python3 tools/cut_walk.py nom planche_marche.png   (planche 2x2 sur magenta)
# écrit assets/<nom>m.webp + atlas : 4 images de marche à la taille du repos, calées sur le haut du corps (pas de tremblement)
import subprocess,sys,json,numpy as np
from PIL import Image
from scipy.signal import fftconvolve
name,sheet=sys.argv[1:3];atlas='assets/atlas.json'
ref=json.load(open(atlas))[name][0][3]
def cut(sc):
    subprocess.run(['python3','tools/cut3.py',sheet,name+'m','--scale',str(sc),'--quality','95','--atlas'],check=True,capture_output=True)
    return json.load(open(atlas))[name+'m']
F=cut(.5);F=cut(round(.5*ref/np.mean([f[3] for f in F]),4))
S=np.array(Image.open(f'assets/{name}m.webp'))[...,3]/255
tops=[S[y:y+int(h*.55),x:x+w] for x,y,w,h,_,_ in F]
base=tops[1];ax=F[1][4]  # image 2 : appui, pieds joints -> ancre de référence
for i,t in enumerate(tops):
    c=fftconvolve(t-t.mean(),(base-base.mean())[::-1,::-1]);dx=np.unravel_index(c.argmax(),c.shape)[1]-(base.shape[1]-1)
    F[i][4]=round(float(ax+dx),1)
A=json.load(open(atlas));A[name+'m']=F;json.dump(A,open(atlas,'w'),separators=(',',':'));print(name,ref,F)
