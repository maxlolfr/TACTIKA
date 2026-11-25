# TACTIKA Godot experiment

Portrait, single-threaded Web demo built with Godot 4.4.1 Compatibility. The arena is **Prairie de Lande, fight 1, seed 0**. Its 93 tiles, obstacles, starting positions, HP, movement budgets and initiative order come from the original JS generator at level 1. The 3D terrain uses the original tile atlas, pictured backdrop and billboard sprites. Walking, attack and spell poses use the original sprite sheets.

From the repository root, with Node and Godot 4.4.1 plus its Web export templates:

```sh
bash godot/prepare-assets.sh
godot --headless --path godot --editor --import
godot --headless --path godot --script res://tests/battle_test.gd
mkdir -p godot/build
touch godot/build/.gdignore
godot --headless --path godot --export-release Web build/index.html
bash godot/web-preview/pack.sh /tmp/tactika-preview
python3 -m http.server 8000 --directory /tmp/tactika-preview
```

The Web preview adds a link to the same encounter running in the original Canvas 2D client. The initial state matches. The Godot demo currently has one basic attack per hero plus Aelis's heal, fixed damage and simpler enemy behavior. The original client keeps its larger spell set and progression.
