# V4.12 (lot 3) : 12 icônes d'équipement découpées des planches RPG (fond magenta), cases lues ligne par ligne (1 à 9).
# usage : python3 tools/prep_equip.py <dossier art/tactika du studio> ; sortie : assets/equip.webp + entrée « equip » de assets/atlas.json
import sys,json,numpy as np
from PIL import Image,ImageDraw
from scipy import ndimage
def keyed(path,star=False):
    a=np.array(Image.open(path).convert('RGB'))
    a=a.astype(float)
    if star: # étoile Gemini des planches 2048 : voile blanc à 50 %, retiré dans sa forme
        yy,xx=np.mgrid[:a.shape[0],:a.shape[1]];d=(np.abs(xx-1934)/49.)**.62+(np.abs(yy-1936)/49.)**.62
        w=(np.clip((1.06-d)/.12,0,1)*.5)[...,None];a=np.clip((a-w*255)/(1-w),0,255)
    r,g,b=a[...,0],a[...,1],a[...,2]
    al=np.clip((200-(np.minimum(r,b)-g))/130,0,1);bg=np.median(a[40:90,40:90].reshape(-1,3),0)
    rgb=np.clip((a-(1-al[...,None])*bg)/np.maximum(al,.05)[...,None],0,255)
    spill=np.clip(np.minimum(rgb[...,0],rgb[...,2])-rgb[...,1]-40,0,255)*(al<.98);rgb[...,0]-=spill;rgb[...,2]-=spill;al[al<.04]=0
    return rgb,al
art=sys.argv[1]+'/v48/originaux/rpg-equip-'
# ordre = index dans la planche « equip » (eq11 à eq22)
CASES=[('armes',1),('armes',5),('armes',8),('armures-boucliers-casques',1),('tenues-capes',1),('tenues-capes',4),
 ('bagues-colliers-bracelets',1),('bagues-colliers-bracelets',8),('armures-boucliers-casques',5),('bottes-gants-ceintures',1),('bottes-gants-ceintures',4),('reliques-livres-cristaux-v2',5)]
# V4.22 : les 41 suivants (eq23 à eq63, TABLE-EQUIPEMENTS-42.md ; armures 4 écartée)
for f,ks in [('armes',(2,3,4,6,7,9)),('armures-boucliers-casques',(2,3,6,7,8,9)),('tenues-capes',(2,3,5,6,7,8,9)),('bagues-colliers-bracelets',(2,3,4,5,6,7,9)),
 ('bottes-gants-ceintures',(2,3,5,6,7,8,9)),('reliques-livres-cristaux-v2',(1,2,3,4,6,7,8,9))]:CASES+=[(f,k) for k in ks]
ERASE={('armes',4):[(0,0),(360,0),(360,268),(102,545),(0,545)],
 ('armes',7):[(0,0),(476,0),(476,118),(394,196),(350,260),(268,362),(186,436),(130,516),(40,598),(0,598)]}
S=int(__import__("os").environ.get("S",256));COLS=9;rows=(len(CASES)+COLS-1)//COLS;sheet=Image.new('RGBA',((S+2)*COLS,(S+2)*rows));fr=[];cache={}
for n,(f,k) in enumerate(CASES):
    if f not in cache:cache[f]=keyed(art+f+'.png',True)
    rgb,al=cache[f];H,W=al.shape;cw,ch=W//3,H//3;r,c=divmod(k-1,3)
    if (f,k) in ERASE: # restes d'une case voisine peints dans la case (gant, ceinture)
        m=Image.new('L',(W,H),0);ImageDraw.Draw(m).polygon([(c*cw+x,r*ch+y) for x,y in ERASE[f,k]],fill=1);al=al*(1-np.array(m))
    sub=al[r*ch:(r+1)*ch,c*cw:(c+1)*cw];lab,m=ndimage.label(ndimage.binary_opening(sub>.5,iterations=2))
    sz=ndimage.sum(np.ones_like(lab),lab,range(1,m+1));keep=[i+1 for i in range(m) if sz[i]>=.3*sz.max()] # paires (gants, bottes)
    mask=ndimage.binary_dilation(np.isin(lab,keep),iterations=6)
    a=sub*mask;ys,xs=np.nonzero(a>.04);y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
    im=np.dstack([rgb[r*ch:(r+1)*ch,c*cw:(c+1)*cw][y0:y1,x0:x1],a[y0:y1,x0:x1]*255]).clip(0,255).astype('uint8')
    t=Image.fromarray(im,'RGBA');t.thumbnail((S-4,S-4),Image.LANCZOS);x,y=n%COLS*(S+2),n//COLS*(S+2);sheet.paste(t,(x+(S-t.width)//2,y+(S-t.height)//2))
    fr.append([x,y,S,S,S/2,S/2])
sheet.save('assets/equip.webp',quality=90,method=6)
A=json.load(open('assets/atlas.json'));A['equip']=fr;json.dump(A,open('assets/atlas.json','w'),separators=(',',':'))
print(len(fr),'icônes')
