#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p godot/assets/audio
cp assets/{atlas.json,aelisX.webp,fennX.webp,kaelW.webp,monA.webp} godot/assets/
cp assets/audio/{aelis_heal,battle,bow,defeat,hit,poison,slash,step,victory}.mp3 godot/assets/audio/
