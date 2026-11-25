extends Node3D

const PRAIRIE = preload("res://prairie.gd")
const HERO_ART = {
	"archer": {"sheet": "fennX", "walk": [0, 1, 2, 1], "attack_sheet": "fennX", "attack": 3},
	"warrior": {"sheet": "kaelW", "walk": [0, 1, 2, 3], "attack_sheet": "kaelX", "attack": 1},
	"healer": {"sheet": "aelisX", "walk": [0, 1, 2, 3], "attack_sheet": "aelisX", "attack": 4},
}
const ATTACKS = {
	"archer": {"name": "Tir", "range": 6, "damage": 10, "sound": "bow", "effect": 0},
	"warrior": {"name": "Taillade", "range": 1, "damage": 12, "sound": "slash", "effect": 0},
	"healer": {"name": "Épine", "range": 5, "damage": 6, "sound": "poison", "effect": 5},
}
const DIRS = [Vector2i.RIGHT, Vector2i.LEFT, Vector2i.UP, Vector2i.DOWN]
const TEXTURES = {
	"fennX": preload("res://assets/fennX.webp"),
	"kaelW": preload("res://assets/kaelW.webp"),
	"aelisX": preload("res://assets/aelisX.webp"),
	"monA": preload("res://assets/monA.webp"),
	"monAw": preload("res://assets/monAw.webp"),
	"kaelX": preload("res://assets/kaelX.webp"),
	"deco": preload("res://assets/deco.webp"),
	"fx": preload("res://assets/fx.webp"),
}
const SOUNDS = {
	"aelis_heal": preload("res://assets/audio/aelis_heal.mp3"),
	"bow": preload("res://assets/audio/bow.mp3"),
	"defeat": preload("res://assets/audio/defeat.mp3"),
	"hit": preload("res://assets/audio/hit.mp3"),
	"poison": preload("res://assets/audio/poison.mp3"),
	"slash": preload("res://assets/audio/slash.mp3"),
	"step": preload("res://assets/audio/step.mp3"),
	"victory": preload("res://assets/audio/victory.mp3"),
}
var tiles = {}
var units = []
var blocks = {}
var water = {}
var atlas = {}
var current = 0
var mode = 0
var busy = false
var finished = false
var camera: Camera3D
var status: Label
var buttons = []
var hint: Label
var music: AudioStreamPlayer

func _ready():
	atlas = JSON.parse_string(FileAccess.get_file_as_string("res://assets/atlas.json"))
	var battle = JSON.parse_string(FileAccess.get_file_as_string("res://assets/prairie.json"))

	var environment = Environment.new()
	environment.background_mode = Environment.BG_CANVAS
	environment.background_canvas_max_layer = -1
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color("#eee8d1")
	environment.ambient_light_energy = 0.64
	var world = WorldEnvironment.new()
	world.environment = environment
	add_child(world)

	var sun = DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-54, -34, 0)
	sun.shadow_enabled = true
	sun.light_energy = 0.72
	sun.light_color = Color("#ffe9bd")
	add_child(sun)

	camera = Camera3D.new()
	add_child(camera)
	camera.position = Vector3(14, 9, 14)
	camera.look_at(Vector3(4, 0, 4))
	camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	camera.keep_aspect = Camera3D.KEEP_WIDTH
	camera.size = 8.9
	camera.v_offset = 0.64
	camera.current = true

	var prairie = PRAIRIE.new()
	add_child(prairie)
	prairie.build(battle, self)
	tiles = prairie.tiles
	blocks = prairie.blocks
	water = prairie.water
	for entry in battle.units:
		add_unit(entry)

	build_ui(battle.name)
	music = AudioStreamPlayer.new()
	add_child(music)
	music.stream = preload("res://assets/audio/forest.mp3")
	music.volume_db = -14
	music.finished.connect(music.play)
	refresh()

func new_sprite() -> Sprite3D:
	var sprite = Sprite3D.new()
	sprite.billboard = BaseMaterial3D.BILLBOARD_FIXED_Y
	sprite.alpha_cut = SpriteBase3D.ALPHA_CUT_DISCARD
	sprite.alpha_scissor_threshold = 0.32
	sprite.centered = false
	return sprite

func set_frame(sprite: Sprite3D, sheet: String, frame: int, flip := false):
	var f = atlas[sheet][frame]
	sprite.texture = TEXTURES[sheet]
	sprite.region_enabled = true
	sprite.region_rect = Rect2(f[0], f[1], f[2], f[3])
	sprite.flip_h = flip
	var foot_x = f[2] - f[4] if flip else f[4]
	sprite.offset = Vector2(-foot_x, f[5] - f[3])

func add_unit(entry: Dictionary):
	var p = Vector2i(entry.x, entry.y)
	var root = Node3D.new()
	add_child(root)
	root.position = Vector3(p.x, 0, p.y)
	var sprite = new_sprite()
	root.add_child(sprite)
	sprite.position.y = 0.025
	var sheet: String = HERO_ART[entry.kind].sheet if entry.hero else "monA"
	var frame: int = 0 if entry.hero else int(entry.row) * 3
	sprite.pixel_size = entry.height * 1.23 / atlas[sheet][frame][3]
	var unit = {
		"name": entry.name, "kind": entry.kind, "p": p, "hp": int(entry.hp), "max": int(entry.hp),
		"hero": entry.hero, "row": int(entry.row), "direction": int(entry.direction),
		"pa": 6 if entry.hero else 4, "pm": int(entry.pm), "max_pm": int(entry.pm),
		"node": root, "sprite": sprite,
		"damage": int(entry.damage), "height": entry.height,
	}
	units.append(unit)
	unit_frame(unit)

func unit_frame(unit: Dictionary, walking := -1, attack := false, healing := false):
	var direction: int = unit.direction
	var flip := direction == 0 or direction == 2
	if unit.hero:
		var art: Dictionary = HERO_ART[unit.kind]
		var back: int = 4 if unit.kind == "warrior" and direction >= 2 else 0
		if attack:
			set_frame(unit.sprite, art.attack_sheet, 5 if healing else art.attack, flip)
		else:
			var frame: int = back if walking == -1 else int(art.walk[walking]) + back
			set_frame(unit.sprite, art.sheet, frame, flip)
	elif walking >= 0:
		set_frame(unit.sprite, "monAw", unit.row * 4 + walking, flip)
	else:
		set_frame(unit.sprite, "monA", unit.row * 3 + (1 if attack else 0), flip)

func face(unit: Dictionary, target: Vector2i):
	var delta: Vector2i = target - unit.p
	if delta == Vector2i.ZERO:
		return
	if absi(delta.x) >= absi(delta.y):
		unit.direction = 0 if delta.x > 0 else 3
	else:
		unit.direction = 1 if delta.y > 0 else 2

func build_ui(zone_name: String):
	var layer = CanvasLayer.new()
	add_child(layer)
	var title = Label.new()
	title.text = zone_name
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 33)
	title.add_theme_constant_override("outline_size", 10)
	title.add_theme_color_override("font_color", Color("#fff1c8"))
	layer.add_child(title)
	for unit in units:
		var hp = ProgressBar.new()
		hp.mouse_filter = Control.MOUSE_FILTER_IGNORE
		hp.show_percentage = false
		hp.size = Vector2(45, 7)
		hp.max_value = unit.max
		hp.add_theme_stylebox_override("background", bar_style(Color("#161911")))
		var fill = Color("#9bdc63") if unit.hero else Color("#ea7250")
		hp.add_theme_stylebox_override("fill", bar_style(fill))
		layer.add_child(hp)
		unit.bar = hp
	title.set_anchors_and_offsets_preset(Control.PRESET_TOP_WIDE)
	title.offset_top = 62
	title.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var panel = PanelContainer.new()
	layer.add_child(panel)
	panel.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_WIDE)
	panel.offset_top = -204
	panel.offset_left = 12
	panel.offset_right = -12
	panel.offset_bottom = -12
	panel.add_theme_stylebox_override("panel", panel_style(Color("#152319f5"), Color("#967452")))
	var box = VBoxContainer.new()
	panel.add_child(box)
	status = Label.new()
	status.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	status.add_theme_font_size_override("font_size",25)
	box.add_child(status)
	hint = Label.new()
	hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	hint.add_theme_color_override("font_color", Color("#e4d8aa"))
	hint.add_theme_font_size_override("font_size", 18)
	box.add_child(hint)
	var actions = GridContainer.new()
	actions.columns = 2
	box.add_child(actions)
	for item in ["Déplacement","Attaque","Soin","Fin du tour"]:
		var b = Button.new()
		b.text = item
		b.custom_minimum_size.y = 60
		b.add_theme_stylebox_override("normal", panel_style(Color("#273e2c"), Color("#51654a")))
		b.add_theme_stylebox_override("hover", panel_style(Color("#3b5940"), Color("#86a271")))
		b.add_theme_stylebox_override("pressed", panel_style(Color("#715232"), Color("#f0cc7a")))
		b.add_theme_stylebox_override("disabled", panel_style(Color("#1b2c21"), Color("#263b2e")))
		b.add_theme_color_override("font_disabled_color", Color("#889589"))
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.add_theme_font_size_override("font_size",24)
		actions.add_child(b)
		buttons.append(b)
	buttons[0].pressed.connect(func(): choose(0))
	buttons[1].pressed.connect(func(): choose(1))
	buttons[2].pressed.connect(func(): choose(2))
	buttons[3].pressed.connect(func():
		if finished:
			get_tree().reload_current_scene()
		else:
			start_music()
			advance()
	)

func bar_style(color: Color) -> StyleBoxFlat:
	var style = StyleBoxFlat.new()
	style.bg_color = color
	style.set_corner_radius_all(3)
	return style

func _process(_delta: float):
	for unit in units:
		var head = unit.node.position + Vector3.UP * (unit.height * 1.23 + 0.18)
		unit.bar.position = camera.unproject_position(head) - Vector2(22.5, 3.5)

func panel_style(fill: Color, border: Color) -> StyleBoxFlat:
	var style = StyleBoxFlat.new()
	style.bg_color = fill
	style.border_color = border
	style.set_border_width_all(2)
	style.set_corner_radius_all(10)
	style.content_margin_top = 6
	style.content_margin_bottom = 6
	style.content_margin_left = 8
	style.content_margin_right = 8
	return style

func choose(m: int):
	if busy or finished:
		return
	start_music()
	mode = m
	refresh()

func distance(a: Vector2i,b: Vector2i) -> int:
	return absi(a.x-b.x)+absi(a.y-b.y)

func occupant(p: Vector2i) -> int:
	for i in range(units.size()):
		if units[i].hp>0 and units[i].p==p:
			return i
	return -1

func reachable(u: Dictionary) -> Dictionary:
	var paths = {u.p: []}
	var queue = [u.p]
	while not queue.is_empty():
		var p = queue.pop_front()
		if paths[p].size() >= u.pm:
			continue
		for d in DIRS:
			var q = p+d
			if passable(q) and occupant(q)==-1 and not paths.has(q):
				paths[q] = paths[p]+[q]
				queue.append(q)
	return paths

func passable(p: Vector2i) -> bool:
	return tiles.has(p) and not blocks.has(p) and not water.has(p)

func visible_between(a: Vector2i,b: Vector2i) -> bool:
	var count = maxi(absi(a.x-b.x),absi(a.y-b.y))*4
	for i in range(1,count):
		var p = Vector2i(Vector2(a).lerp(Vector2(b),float(i)/count).round())
		if p!=a and p!=b and (not tiles.has(p) or blocks.has(p) or occupant(p)!=-1):
			return false
	return true

func valid_target(u: Dictionary,p: Vector2i) -> bool:
	var i = occupant(p)
	if i<0 or u.pa<3:
		return false
	var d = distance(u.p,p)
	if mode==2:
		return u.name=="Aelis" and units[i].hero and d<=4
	var minimum = 2 if u.kind == "archer" else 1
	return units[i].hero != u.hero and d >= minimum and d <= ATTACKS[u.kind].range and visible_between(u.p,p)

func refresh():
	for u in units:
		update_unit(u)
	var u = units[current]
	status.text = "%s  ·  %d PV  ·  %d PA  /  %d PM" % [u.name, u.hp, u.pa, u.pm]
	hint.text = ["Touche une case bleue", "Touche un ennemi en orange", "Touche un allié en orange"][mode] if u.hero else "Tour ennemi"
	var paths = reachable(u)
	for p in tiles:
		var tint = Color.TRANSPARENT
		if not busy and not finished and u.hero:
			if mode == 0 and paths.has(p) and p != u.p:
				tint = Color("#5abbffb8")
			elif mode != 0 and valid_target(u,p):
				tint = Color("#ff993ed1")
		if p == u.p:
			tint = Color("#ffd559d9")
		tiles[p].set_shader_parameter("highlight", tint)
	for b in buttons:
		b.disabled = busy or finished or not u.hero
	buttons[1].text = ATTACKS[u.kind].name if u.hero else "Attaque"
	buttons[1].disabled = buttons[1].disabled or u.pa < 3
	buttons[2].disabled = buttons[2].disabled or u.kind != "healer" or u.pa < 3
	buttons[3].text = "Rejouer" if finished else "Fin du tour"
	if finished:
		buttons[3].disabled = false
		hint.text = ""

func update_unit(unit: Dictionary):
	unit.bar.value = unit.hp
	unit.bar.visible = unit.hp > 0
	unit.node.visible = unit.hp > 0

func target_under_pointer(pointer: Vector2, ground: Vector2i, actor: Dictionary) -> Vector2i:
	if valid_target(actor, ground):
		return ground
	var best = ground
	var closest = INF
	for unit in units:
		if unit.hp <= 0 or not valid_target(actor, unit.p):
			continue
		var feet = camera.unproject_position(unit.node.position)
		var head = camera.unproject_position(unit.node.position + Vector3.UP * unit.height * 1.23)
		var half_width = absf(feet.y - head.y) * 0.54
		var dx = absf(pointer.x - feet.x)
		if dx < half_width and dx < closest and pointer.y >= head.y and pointer.y <= feet.y:
			best = unit.p
			closest = dx
	return best

func _unhandled_input(event):
	if busy or finished or not units[current].hero:
		return
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		var origin = camera.project_ray_origin(event.position)
		var direction = camera.project_ray_normal(event.position)
		var hit = Plane(Vector3.UP, 0).intersects_ray(origin, direction)
		if hit == null:
			return
		var p = Vector2i(roundi(hit.x), roundi(hit.z))
		start_music()
		var u = units[current]
		if mode == 0:
			var paths = reachable(u)
			if paths.has(p) and p != u.p:
				await move_unit(u, paths[p])
		else:
			p = target_under_pointer(event.position, p, u)
			if valid_target(u, p):
				await play_action(u, units[occupant(p)], mode == 2)
				check_end()
		if not finished:
			refresh()

func play_action(actor: Dictionary, target: Dictionary, healing: bool):
	busy = true
	actor.pa -= 3 if actor.hero else 4
	refresh()
	face(actor, target.p)
	unit_frame(actor, -1, true, healing)
	var effect = 4 if healing else 0
	if healing:
		target.hp = mini(target.max, target.hp + 15)
		sound("aelis_heal")
	elif actor.hero:
		var attack = ATTACKS[actor.kind]
		target.hp = maxi(0, target.hp - attack.damage)
		effect = attack.effect
		sound(attack.sound)
	else:
		target.hp = maxi(0, target.hp - actor.damage)
		sound("hit")
	target.bar.value = target.hp
	show_effect(target.node.position, effect)
	await get_tree().create_timer(0.32).timeout
	unit_frame(actor)
	busy = false

func show_effect(at: Vector3, frame: int):
	var effect = new_sprite()
	effect.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	effect.alpha_cut = SpriteBase3D.ALPHA_CUT_DISABLED
	add_child(effect)
	set_frame(effect, "fx", frame)
	effect.pixel_size = 0.007
	effect.position = at + Vector3.UP * 0.68
	var tween = create_tween().bind_node(effect).set_parallel()
	tween.tween_property(effect, "scale", Vector3.ONE * 1.45, 0.30)
	tween.tween_property(effect, "modulate:a", 0.0, 0.27).set_delay(0.08)
	tween.chain().tween_callback(effect.queue_free)

func start_music():
	if not music.playing:
		music.play()

func sound(n: String):
	var a = AudioStreamPlayer.new()
	add_child(a)
	a.stream = SOUNDS[n]
	a.finished.connect(a.queue_free)
	a.play()

func move_unit(u: Dictionary,path: Array):
	busy = true
	refresh()
	for p in path:
		face(u, p)
		var start: Vector3 = u.node.position
		var end = Vector3(p.x, 0, p.y)
		var t = create_tween()
		t.tween_method(func(progress: float):
			u.node.position = start.lerp(end, progress)
			unit_frame(u, mini(3, int(progress * 4.0)))
		, 0.0, 1.0, 0.23)
		await t.finished
		u.p = p
		u.pm -= 1
		sound("step")
	unit_frame(u)
	busy = false

func check_end() -> bool:
	var heroes = false
	var enemies = false
	for u in units:
		update_unit(u)
		if u.hp>0:
			if u.hero:
				heroes = true
			else:
				enemies = true
	if heroes and enemies:
		return false
	finished = true
	refresh()
	status.text = "Victoire !" if heroes else "Défaite"
	sound("victory" if heroes else "defeat")
	return true

func advance():
	if busy or finished:
		return
	while not finished:
		current = (current+1)%units.size()
		var u = units[current]
		if u.hp<=0:
			continue
		u.pa = 6 if u.hero else 4
		u.pm = u.max_pm
		mode = 0
		refresh()
		if u.hero:
			return
		busy = true
		await get_tree().create_timer(0.25).timeout
		var target = {}
		for h in units:
			if h.hero and h.hp>0 and (target.is_empty() or distance(u.p,h.p)<distance(u.p,target.p)):
				target = h
		if target.is_empty():
			busy = false
			check_end()
			return
		if distance(u.p, target.p) > 1:
			var paths = reachable(u)
			var field = distance_field(target.p)
			var best = u.p
			for p in paths:
				if field.get(p, INF) < field.get(best, INF):
					best = p
			if best != u.p:
				await move_unit(u, paths[best])
		if distance(u.p, target.p) == 1:
			await play_action(u, target, false)
		busy = false
		if check_end():
			return

func distance_field(goal: Vector2i) -> Dictionary:
	var distances = {goal: 0}
	var queue = [goal]
	while not queue.is_empty():
		var p = queue.pop_front()
		for direction in DIRS:
			var adjacent: Vector2i = p + direction
			if passable(adjacent) and not distances.has(adjacent):
				distances[adjacent] = distances[p] + 1
				queue.append(adjacent)
	return distances
