# TACTIKA Godot experimental spike
Baseline ea50f1e86ff73aca8208fa13f073462320849d29. Original JS untouched.
Copy existing assets into godot/assets before importing (cp -R assets godot/assets).
Godot 4.4.1 Compatibility, single-thread Web export for mobile. Fixed 8x8 test arena, 3 heroes, 3 enemies, 3D terrain, orthographic camera, atlas billboard sprites, movement BFS, line of sight, PA/PM, basic attacks and healing, enemy AI and audio.
Not parity: procedural maps, initiative, nine spells, cooldown/status effects, campaign, equipment, save migration, walk animation and original balancing remain to port. No claim of tested runtime until CI passes. No generated art.
Existing JS architecture is separated into rules/data/render/turns/ui/audio/save; port rules first, then data and presentation. Keep destructive reset confirmation but remove redundant combat modal flows. Known potential original issue: genMap can return undefined after 40 failed tries; add deterministic fallback in full port.
