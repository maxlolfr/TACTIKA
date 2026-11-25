#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p godot/assets/audio godot/assets/bg
cp assets/{atlas.json,aelisX.webp,fennX.webp,kaelW.webp,kaelX.webp,monA.webp,monAw.webp,deco.webp,tiles.webp,fx.webp} godot/assets/
cp assets/bg/prairie.webp godot/assets/bg/
node godot/export-prairie.mjs > godot/assets/prairie.json
cp assets/audio/{aelis_heal,forest,bow,defeat,hit,poison,slash,step,victory}.mp3 godot/assets/audio/
