#!/usr/bin/env python3
"""Génère le registre des sons : assets/audio/REGISTRE-LICENCES.csv (un fichier par ligne). Usage : python3 tools/audio_registry.py"""
import csv, hashlib, os, re
root = os.path.join(os.path.dirname(__file__), '..', 'assets', 'audio')
VOIX = {  # voix de la bibliothèque ElevenLabs citées dans NOTES.md (V4.36, V4.82)
 'kael': 'voix créée « Tactika - Kael » (FR) ; EN : voir NOTES V4.82', 'fenn': 'voix créée « Tactika - Fenn »', 'aelis': 'voix créée « Tactika - Aelis »',
 'orion': 'Ludovic (bibliothèque ElevenLabs)', 'nyra': 'Dahlia (bibliothèque ElevenLabs)', 'lyria': 'Ophélie (bibliothèque ElevenLabs)'}
NARR = {'vo_': 'narration : Mira = Anne-Sophie, Garrick = Baptiste, Architecte = Georges (bibliothèque ElevenLabs), autres = voix des héros'}
rows = []
for cat in ('musique', 'bruitages', 'voix'):
    for f in sorted(os.listdir(os.path.join(root, cat))):
        p = os.path.join(root, cat, f); b = open(p, 'rb').read()
        if cat == 'voix':
            m = re.match(r'v_([a-z]+)_', f)
            note = VOIX.get(m.group(1), '') if m else next((v for k, v in NARR.items() if f.startswith(k)), '')
            src = 'ElevenLabs text-to-speech (modèle eleven_v4)'
        elif cat == 'musique':
            note, src = '', 'ElevenLabs musique (génération par prompt)'
        else:
            note, src = '', 'ElevenLabs effets sonores (génération par prompt)'
        rows.append([f'{cat}/{f}', cat, src, note, len(b), hashlib.sha256(b).hexdigest()[:16], 'À CONFIRMER'])
with open(os.path.join(root, 'REGISTRE-LICENCES.csv'), 'w', newline='', encoding='utf-8') as o:
    w = csv.writer(o); w.writerow(['fichier', 'type', 'source', 'voix / remarque', 'octets', 'sha256 (16)', 'droits commerciaux'])
    w.writerows(rows)
print(len(rows), 'fichiers')
