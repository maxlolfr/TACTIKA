# usage : python3 tools/cut_knights.py dossier_travail dossier_planches/ (planches sources : studio, art/tactika/v35)
# prépare les 3 planches de chevaliers de Max : ombres violettes effacées, découpe 3x3, poses remises dans l'ordre du jeu
import subprocess,json,sys,numpy as np
from PIL import Image
from scipy import ndimage
U=sys.argv[2] if len(sys.argv)>2 else './'  # dossier des planches reçues
S=sys.argv[1]
# ordre du jeu : repos, attaque, touché, spécial, KO, repos 2, puis 4 images de marche
STD=[0,3,5,1,7,0, 8,1,8,0]
for name,f,order in [('knightB','a45b52e6-image.png',STD),('knightR','6e76b5cd-image.png',STD),('knightN','bf6a10ea-image.png',[0,3,4,1,8,0, 6,1,6,0])]:
    a=np.array(Image.open(U+f).convert('RGB')).astype(int);r,g,b=a[...,0],a[...,1],a[...,2]
    shadow=(g<60)&(r>70)&(b>70)&(abs(r-b)<55)&(r<235)
    # seules les ombres au sol : taches plates et larges (jamais à l'intérieur d'un bouclier ou d'une armure)
    lab,n=ndimage.label(shadow);drop=np.zeros(shadow.shape,bool)
    for i,sl in enumerate(ndimage.find_objects(lab)):
        h,w=sl[0].stop-sl[0].start,sl[1].stop-sl[1].start
        if h<=26 and w>=50 and w>=3*h: drop[sl]|=lab[sl]==i+1
    a[drop]=[255,0,255]
    # rangées recoupées dans les vides réels de la planche, puis replacées dans des cases égales (rien ne dépasse)
    fg=(np.abs(a-[255,0,255]).sum(2)>150).sum(1);H0,W0=fg.shape[0],a.shape[1];cuts=[0]
    for t in (1,2):
        lo,hi=int(H0*(t/3-.07)),int(H0*(t/3+.07));cuts.append(lo+int(np.argmin(fg[lo:hi])))
    cuts.append(H0);ch=max(cuts[i+1]-cuts[i] for i in range(3))+16
    N=np.full((ch*3,W0,3),[255,0,255])
    for i in range(3):
        part=a[cuts[i]:cuts[i+1]];N[ch*i+8:ch*i+8+part.shape[0]]=part
    print(name,'coupes',cuts,'pixels sur les coupes',[int(fg[c]) for c in cuts[1:3]])
    a=N;Image.fromarray(a.astype(np.uint8)).save(f'{S}/{name}.png')
    H=a.shape[0];scale=290/(512*.86)*(a.shape[0]/H0)
    print(subprocess.run(['python3','tools/cut3.py',f'{S}/{name}.png',name,'--cols','3','--rows','3','--scale',str(round(scale,3)),'--atlas'],capture_output=True,text=True,check=True).stdout)
    A=json.load(open('assets/atlas.json'));A[name]=[A[name][i] for i in order];if name=='knightN':
        for i in (0,5,9):A[name][i][4]=257.0  # repos : ancre au milieu des pieds, sans compter l'épée
    json.dump(A,open('assets/atlas.json','w'),separators=(',',':'))
