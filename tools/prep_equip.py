# V4.12 (lot 3) : 12 icônes d'équipement découpées des planches RPG (fond magenta), cases lues ligne par ligne (1 à 9).
# usage : python3 tools/prep_equip.py <dossier art/tactika du studio> ; sortie : assets/equip.webp + entrée « equip » de assets/atlas.json
import sys,json,numpy as np
from PIL import Image
from scipy import ndimage
def keyed(path,star=False):
    a=np.array(Image.open(path).convert('RGB'))
    a=a.astype(float)
    if star: # étoile Gemini (voile blanc à ~47 %, planche 2528×1696) : on retire le voile dans sa forme
        yy,xx=np.mgrid[:a.shape[0],:a.shape[1]];d=(np.abs(xx-2413)/68.)**.62+(np.abs(yy-1583)/68.)**.62
        w=(np.clip((1.05-d)/.1,0,1)*.47)[...,None];a=np.clip((a-w*255)/(1-w),0,255)
    r,g,b=a[...,0],a[...,1],a[...,2]
    al=np.clip((200-(np.minimum(r,b)-g))/130,0,1);bg=np.median(a[40:90,40:90].reshape(-1,3),0)
    rgb=np.clip((a-(1-al[...,None])*bg)/np.maximum(al,.05)[...,None],0,255)
    spill=np.clip(np.minimum(rgb[...,0],rgb[...,2])-rgb[...,1]-40,0,255)*(al<.98);rgb[...,0]-=spill;rgb[...,2]-=spill;al[al<.04]=0
    return rgb,al
art=sys.argv[1]+'/v48/originaux/rpg-equip-'
# ordre = index dans la planche « equip » (eq11 à eq22)
CASES=[('armes',1),('armes',5),('armes',8),('armures-boucliers-casques',1),('tenues-capes',1),('tenues-capes',4),
 ('bagues-colliers-bracelets',1),('bagues-colliers-bracelets',8),('armures-boucliers-casques',5),('bottes-gants-ceintures',1),('bottes-gants-ceintures',4),('reliques-livres-cristaux-v2',5)]
S=120;sheet=Image.new('RGBA',(S*len(CASES)+2*len(CASES),S));fr=[];cache={}
for n,(f,k) in enumerate(CASES):
    if f not in cache:cache[f]=keyed(art+f+'.png')
    rgb,al=cache[f];H,W=al.shape;cw,ch=W//3,H//3;r,c=divmod(k-1,3)
    sub=al[r*ch:(r+1)*ch,c*cw:(c+1)*cw];lab,m=ndimage.label(ndimage.binary_opening(sub>.5,iterations=2))
    sz=ndimage.sum(np.ones_like(lab),lab,range(1,m+1));keep=[i+1 for i in range(m) if sz[i]>=.3*sz.max()] # paires (gants, bottes)
    mask=ndimage.binary_dilation(np.isin(lab,keep),iterations=6)
    a=sub*mask;ys,xs=np.nonzero(a>.04);y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
    im=np.dstack([rgb[r*ch:(r+1)*ch,c*cw:(c+1)*cw][y0:y1,x0:x1],a[y0:y1,x0:x1]*255]).clip(0,255).astype('uint8')
    t=Image.fromarray(im,'RGBA');t.thumbnail((S-4,S-4),Image.LANCZOS);x=n*(S+2);sheet.paste(t,(x+(S-t.width)//2,(S-t.height)//2))
    fr.append([x,0,S,S,S/2,S/2])
sheet.save('assets/equip.webp',quality=90,method=6)
A=json.load(open('assets/atlas.json'));A['equip']=fr;json.dump(A,open('assets/atlas.json','w'),separators=(',',':'))
print(len(fr),'icônes')
