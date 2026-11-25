extends SceneTree

var failures := 0

func _initialize():
	run.call_deferred()

func expect(condition: bool, message: String):
	if not condition:
		failures += 1
		push_error(message)

func run():
	var battle = load("res://battle.tscn").instantiate()
	root.add_child(battle)
	current_scene = battle
	await process_frame
	expect(battle.tiles.size() == 93 and battle.units.size() == 6, "Arena and units load")
	expect(battle.music.stream != null, "Battle music is loaded")
	for unit in battle.units:
		expect(unit.sprite.texture != null, "%s sprite is loaded" % unit.name)
	expect(battle.blocks.size() == 7, "Prairie obstacles match the source map")
	for tile in battle.tiles:
		var screen_position = battle.camera.unproject_position(Vector3(tile.x, 0, tile.y))
		expect(root.get_visible_rect().has_point(screen_position), "Prairie tile %s fits on screen" % tile)

	var fenn = battle.units[0]
	var kael = battle.units[1]
	var aelis = battle.units[4]
	var boar = battle.units[2]
	var paths = battle.reachable(fenn)
	expect(not paths.has(kael.p) and not paths.has(Vector2i(4, 8)), "Movement excludes units and scenery")
	expect(not battle.visible_between(Vector2i(3, 2), Vector2i(3, 4)), "An obstacle blocks line of sight")
	var destination := Vector2i(7, 6)
	var step := InputEventMouseButton.new()
	step.button_index = MOUSE_BUTTON_LEFT
	step.pressed = true
	step.position = battle.camera.unproject_position(Vector3(destination.x, 0, destination.y))
	await battle._unhandled_input(step)
	expect(fenn.p == destination and fenn.pm == 2, "Picking a tile moves the hero and spends a PM")

	battle.advance()
	expect(battle.current == 1 and kael.pa == 6, "Ending a turn selects Kael")
	var enemy_start: Vector2i = boar.p
	await battle.advance()
	expect(battle.current == 4 and not battle.buttons[2].disabled, "Aelis plays after two boars")
	expect(boar.p != enemy_start, "Enemy AI moves around scenery towards the heroes")
	kael.hp -= 10
	battle.choose(2)
	step.position = battle.camera.unproject_position(Vector3(kael.p.x, 0, kael.p.y))
	await battle._unhandled_input(step)
	expect(kael.hp == kael.max and aelis.pa == 3, "Healing caps HP and spends 3 PA")
	await battle.advance()
	expect(battle.current == 0 and fenn.pm == 3 and not battle.busy, "Enemy turns return control to Fenn")

	battle.choose(1)
	var ranged_target = {}
	for unit in battle.units:
		if not unit.hero and battle.valid_target(fenn, unit.p):
			ranged_target = unit
			break
	expect(not ranged_target.is_empty(), "Fenn can pick a target after enemies advance")
	if not ranged_target.is_empty():
		var previous_hp = ranged_target.hp
		step.position = battle.camera.unproject_position(ranged_target.node.position)
		await battle._unhandled_input(step)
		expect(fenn.pa == 3 and ranged_target.hp == previous_hp - 10, "Fenn's attack spends PA and deals damage")

	for unit in battle.units:
		if not unit.hero:
			unit.hp = 0
	expect(battle.check_end() and battle.status.text == "Victoire !", "Defeated enemies end the battle")
	expect(not battle.buttons[3].disabled and battle.buttons[3].text == "Rejouer", "The result offers a rematch")
	battle.buttons[3].pressed.emit()
	await process_frame
	await process_frame
	expect(current_scene != null and not current_scene.finished, "A rematch reloads the arena")
	await create_timer(0.15).timeout
	if failures == 0:
		print("Godot battle checks passed")
	quit(0 if failures == 0 else 1)
