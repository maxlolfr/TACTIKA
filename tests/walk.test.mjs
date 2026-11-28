// V5.13 : planches de marche des héros (kaelVM, fennVM, aelisVM, orionM, nyraM) : 9 cases (0 dos repos, 1-4 dos en marche, 5-8 profil), rectangles dans l'image, même hauteur de référence pour les cases 0, 1 et 5.
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const root=new URL('../',import.meta.url).pathname,A=JSON.parse(fs.readFileSync(root+'assets/atlas.json','utf8'));
const webpSize=f=>{const b=fs.readFileSync(f);const t=b.toString('ascii',12,16);if(t==='VP8X')return[1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)];if(t==='VP8L'){const v=b.readUInt32LE(21);return[(v&16383)+1,((v>>14)&16383)+1]}return[b.readUInt16LE(26)&16383,b.readUInt16LE(28)&16383]};
for(const [n,idle] of [['kaelVM','kaelV'],['fennVM','fennV'],['aelisVM','aelisV'],['orionM','orion9'],['nyraM','nyra9']])
 test('marche '+n,()=>{const F=A[n];assert.equal(F.length,9);assert.ok(fs.existsSync(root+'assets/'+n+'.webp'));const[W,H]=webpSize(root+'assets/'+n+'.webp');
  for(const[x,y,w,h,ax,ay]of F){assert.ok(x>=0&&y>=0&&x+w<=W&&y+h<=H,'case dans l’image');assert.ok(ax>0&&ax<w&&ay===h)}
  assert.equal(F[0][3],F[1][3]);assert.equal(F[1][3],F[5][3]);assert.ok(Math.abs(F[5][3]-A[idle][0][3])<=2,'hauteur proche de la pose de repos')});
