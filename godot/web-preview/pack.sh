#!/usr/bin/env bash
set -euo pipefail

# Stage the verified Godot build and a playable reference from the same source.
output="$(realpath -m "${1:?Pass a deployment output directory}")"
cd "$(dirname "$0")/../.."
mkdir -p "$output/original/src"
cp godot/build/index.{html,js,pck,png,audio.worklet.js,audio.position.worklet.js} "$output/"
gzip -n -c -6 godot/build/index.wasm > "$output/index.wasm.gz.bin"
cp godot/web-preview/wasm-loader.js "$output/"
cp -R assets "$output/original/"
cp src/*.js godot/web-preview/compare-prairie.js "$output/original/src/"
cp style.css godot/assets/prairie.json "$output/original/"

python3 - "$output" <<'PY'
import sys
from pathlib import Path

output = Path(sys.argv[1])
godot = output / "index.html"
godot_html = godot.read_text()
godot_html = godot_html.replace('<html lang="en">', '<html lang="fr">', 1)
godot_html = godot_html.replace('<title>TACTIKA - Godot experiment</title>', '<title>TACTIKA – Prairie de Lande</title>', 1)
godot_html = godot_html.replace('<script src="index.js"></script>', '<script src="wasm-loader.js"></script>\n<script src="index.js"></script>', 1)
switch = """<a href="original/" style="position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:2;font:600 13px system-ui;color:#fff1c8;background:#152319;border:1px solid #967452;border-radius:8px;padding:8px 13px;text-decoration:none;white-space:nowrap">Comparer avec la 2D</a>"""
godot.write_text(godot_html.replace('<body>', '<body>\n' + switch, 1))

original = Path("index.html").read_text()
original = original.replace('src="src/main.js"', 'src="src/compare-prairie.js"', 1)
original = original.replace('<button id="flee"', '<a href="../" class="btn dark" style="white-space:nowrap;text-decoration:none">Godot 3D</a><button id="flee"', 1)
(output / "original/index.html").write_text(original)
PY
