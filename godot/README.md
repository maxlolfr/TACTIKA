# TACTIKA Godot experimental spike
Baseline ea50f1e86ff73aca8208fa13f073462320849d29. Original JS untouched.
Run from the repository root with Godot 4.4.1 and its Web export templates installed.

```sh
bash godot/prepare-assets.sh
godot --headless --path godot --editor --import
godot --headless --path godot --script res://tests/battle_test.gd
mkdir -p godot/build
touch godot/build/.gdignore
godot --headless --path godot --export-release Web build/index.html
python3 -m http.server 8000 --directory godot/build
```

Open http://localhost:8000. The asset script copies the sprites and sounds used by the arena. If you previously copied the whole asset tree into this project, move that local copy out of `godot/assets` before staging the minimal set.
Godot 4.4.1 Compatibility, single-thread Web export for mobile. Fixed 8x8 test arena, 3 heroes, 3 enemies, 3D terrain, orthographic camera, atlas billboard sprites, movement BFS, line of sight, PA/PM, basic attacks and healing, enemy AI and audio.
The prototype covers one battle with movement, attacks, healing, enemy turns and a rematch. Procedural maps, initiative, the full spell set, cooldowns, status effects, campaign, equipment, save migration, walk animation and original balancing remain to port.
Existing JS architecture is separated into rules/data/render/turns/ui/audio/save; port rules first, then data and presentation. Keep destructive reset confirmation but remove redundant combat modal flows. Known potential original issue: genMap can return undefined after 40 failed tries; add deterministic fallback in full port.
