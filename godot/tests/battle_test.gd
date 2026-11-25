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
	expect(battle.tiles.size() == 64 and battle.units.size() == 6, "Arena and units load")
	expect(battle.music.stream != null, "Battle music is loaded")
	for unit in battle.units:
		expect(unit.sprite.texture != null, "%s sprite is loaded" % unit.name)
	for corner in [Vector2i(0, 0), Vector2i(0, 7), Vector2i(7, 0), Vector2i(7, 7)]:
		var screen_position = battle.camera.unproject_position(Vector3(corner.x, 0, corner.y))
		expect(root.get_visible_rect().has_point(screen_position), "Board corner %s fits on screen" % corner)

	var fenn = battle.units[0]
	var kael = battle.units[1]
	var aelis = battle.units[2]
	var gel = battle.units[3]
	var paths = battle.reachable(fenn)
	expect(not paths.has(kael.p), "Movement excludes occupied tiles")
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
	battle.advance()
	expect(battle.current == 2 and not battle.buttons[2].disabled, "Aelis can select healing")
	kael.hp -= 10
	battle.choose(2)
	step.position = battle.camera.unproject_position(Vector3(kael.p.x, 0, kael.p.y))
	await battle._unhandled_input(step)
	expect(kael.hp == kael.max and aelis.pa == 3, "Healing caps HP and spends 3 PA")
	var enemy_start: Vector2i = gel.p
	await battle.advance()
	expect(battle.current == 0 and fenn.pm == 3 and not battle.busy, "Enemy turns return control to Fenn")
	expect(gel.p != enemy_start, "Enemy AI moves towards the heroes")

	for index in range(3, 6):
		battle.units[index].hp = 0
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
