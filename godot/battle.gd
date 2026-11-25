extends Node3D

const DIRS = [Vector2i.RIGHT, Vector2i.LEFT, Vector2i.UP, Vector2i.DOWN]
const TEXTURES = {
	"fennX": preload("res://assets/fennX.webp"),
	"kaelW": preload("res://assets/kaelW.webp"),
	"aelisX": preload("res://assets/aelisX.webp"),
	"monA": preload("res://assets/monA.webp"),
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
var blocks = [Vector2i(3,3), Vector2i(5,3), Vector2i(2,5)]
var atlas = {}
var current = 0
var mode = 0
var busy = false
var finished = false
var camera: Camera3D
var status: Label
var buttons = []
var music: AudioStreamPlayer

func _ready():
	atlas = JSON.parse_string(FileAccess.get_file_as_string("res://assets/atlas.json"))
	if not atlas is Dictionary:
		atlas = {}
	var env = WorldEnvironment.new()
	var e = Environment.new()
	e.background_mode = Environment.BG_COLOR
	e.background_color = Color("#203b35")
	e.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	e.ambient_light_color = Color("#dce6ff")
	e.ambient_light_energy = 0.65
	env.environment = e
	add_child(env)
	var sun = DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-55,-35,0)
	sun.shadow_enabled = true
	sun.light_energy = 1.2
	add_child(sun)
	camera = Camera3D.new()
	add_child(camera)
	camera.position = Vector3(12,14,12)
	camera.look_at(Vector3(3.5,0,3.5))
	camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	camera.keep_aspect = Camera3D.KEEP_WIDTH
	camera.size = 12.4
	camera.current = true
	for x in range(8):
		for y in range(8):
			var p = Vector2i(x,y)
			tiles[p] = cube(Vector3(x,-0.13,y),Vector3(0.96,0.25,0.96),Color("#71964e") if (x+y)%2==0 else Color("#638748"))
	for p in blocks:
		cube(Vector3(p.x,0.4,p.y),Vector3(0.8,1.05,0.8),Color("#69736b"))
	add_unit("Fenn",Vector2i(6,6),44,true,"fennX",0,6)
	add_unit("Kael",Vector2i(5,6),62,true,"kaelW",0,1)
	add_unit("Aelis",Vector2i(6,5),40,true,"aelisX",0,5)
	add_unit("Gelée",Vector2i(1,1),24,false,"monA",0,1)
	add_unit("Sanglier",Vector2i(2,1),32,false,"monA",3,1)
	add_unit("Gelée",Vector2i(1,2),24,false,"monA",0,1)
	build_ui()
	music = AudioStreamPlayer.new()
	add_child(music)
	music.stream = preload("res://assets/audio/battle.mp3")
	music.volume_db = -12
	music.finished.connect(music.play)
	refresh()

func cube(pos: Vector3, dimensions: Vector3, color: Color) -> MeshInstance3D:
	var n = MeshInstance3D.new()
	var mesh = BoxMesh.new()
	mesh.size = dimensions
	n.mesh = mesh
	var mat = StandardMaterial3D.new()
	mat.albedo_color = color
	n.material_override = mat
	add_child(n)
	n.position = pos
	return n

func add_unit(n: String,p: Vector2i,hp: int,hero: bool,sheet: String,frame: int,r: int):
	var root = Node3D.new()
	add_child(root)
	root.position = Vector3(p.x,0,p.y)
	var sprite = Sprite3D.new()
	root.add_child(sprite)
	sprite.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	sprite.alpha_cut = SpriteBase3D.ALPHA_CUT_DISCARD
	sprite.centered = false
	sprite.pixel_size = 0.006
	if atlas.has(sheet):
		var f = atlas[sheet][frame]
		sprite.texture = TEXTURES[sheet]
		sprite.region_enabled = true
		sprite.region_rect = Rect2(f[0],f[1],f[2],f[3])
		sprite.offset = Vector2(-f[4],f[5]-f[3])
		sprite.position.y = 0.05
	var label = Label3D.new()
	root.add_child(label)
	label.position.y = 1.65
	label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	label.font_size = 40
	label.modulate = Color.WHITE if hero else Color.SALMON
	units.append({"name":n,"p":p,"hp":hp,"max":hp,"hero":hero,"range":r,"pa":6 if hero else 4,"pm":3,"node":root,"label":label,"sprite":sprite})

func build_ui():
	var layer = CanvasLayer.new()
	add_child(layer)
	var panel = PanelContainer.new()
	layer.add_child(panel)
	panel.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_WIDE)
	panel.offset_top = -180
	panel.offset_left = 12
	panel.offset_right = -12
	panel.offset_bottom = -12
	var box = VBoxContainer.new()
	panel.add_child(box)
	status = Label.new()
	status.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	status.add_theme_font_size_override("font_size",25)
	box.add_child(status)
	var actions = GridContainer.new()
	actions.columns = 2
	box.add_child(actions)
	for item in ["Déplacement","Attaque","Soin","Fin du tour"]:
		var b = Button.new()
		b.text = item
		b.custom_minimum_size.y = 66
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
			if tiles.has(q) and not blocks.has(q) and occupant(q)==-1 and not paths.has(q):
				paths[q] = paths[p]+[q]
				queue.append(q)
	return paths

func visible_between(a: Vector2i,b: Vector2i) -> bool:
	var count = maxi(absi(a.x-b.x),absi(a.y-b.y))*4
	for i in range(1,count):
		var p = Vector2i(Vector2(a).lerp(Vector2(b),float(i)/count).round())
		if p!=a and p!=b and (blocks.has(p) or occupant(p)!=-1):
			return false
	return true

func valid_target(u: Dictionary,p: Vector2i) -> bool:
	var i = occupant(p)
	if i<0 or u.pa<3:
		return false
	var d = distance(u.p,p)
	if mode==2:
		return u.name=="Aelis" and units[i].hero and d<=4
	var minimum = 2 if u.name=="Fenn" else 1
	return units[i].hero!=u.hero and d>=minimum and d<=u.range and visible_between(u.p,p)

func refresh():
	for u in units:
		u.label.text = "%s  %s/%s" % [u.name,u.hp,u.max]
		u.node.visible = u.hp>0
	var u = units[current]
	status.text = "%s  •  %s PA  /  %s PM" % [u.name,u.pa,u.pm]
	var paths = reachable(u)
	for p in tiles:
		var color = Color("#71964e") if (p.x+p.y)%2==0 else Color("#638748")
		if not busy and not finished and u.hero:
			if mode==0 and paths.has(p) and p!=u.p:
				color = Color("#4d9bd0")
			elif mode!=0 and valid_target(u,p):
				color = Color("#e49b48")
		if p==u.p:
			color = Color("#dac75d")
		tiles[p].material_override.albedo_color = color
	for b in buttons:
		b.disabled = busy or finished or not u.hero
	buttons[2].disabled = buttons[2].disabled or u.name!="Aelis"
	buttons[3].text = "Rejouer" if finished else "Fin du tour"
	if finished:
		buttons[3].disabled = false

func _unhandled_input(event):
	if busy or finished or not units[current].hero:
		return
	if event is InputEventMouseButton and event.pressed and event.button_index==MOUSE_BUTTON_LEFT:
		var origin = camera.project_ray_origin(event.position)
		var direction = camera.project_ray_normal(event.position)
		var hit = Plane(Vector3.UP,0).intersects_ray(origin,direction)
		if hit==null:
			return
		var p = Vector2i(roundi(hit.x),roundi(hit.z))
		start_music()
		var u = units[current]
		if mode==0:
			var paths = reachable(u)
			if paths.has(p) and p!=u.p:
				await move_unit(u,paths[p])
		elif valid_target(u,p):
			var target = units[occupant(p)]
			u.pa-=3
			if mode==2:
				target.hp = mini(target.max,target.hp+15)
				sound("aelis_heal")
			else:
				target.hp = maxi(0,target.hp-(12 if u.name=="Kael" else 10 if u.name=="Fenn" else 6))
				sound("slash" if u.name=="Kael" else "bow" if u.name=="Fenn" else "poison")
			check_end()
		if not finished:
			refresh()

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
		var t = create_tween()
		t.tween_property(u.node,"position",Vector3(p.x,0,p.y),0.18)
		await t.finished
		u.p = p
		u.pm-=1
		sound("step")
	busy = false

func check_end() -> bool:
	var heroes = false
	var enemies = false
	for u in units:
		u.node.visible = u.hp>0
		u.label.text = "%s  %s/%s" % [u.name,u.hp,u.max]
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
		u.pm = 3
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
		var paths = reachable(u)
		var best = u.p
		for p in paths:
			if distance(p,target.p)<distance(best,target.p):
				best = p
		if best!=u.p:
			await move_unit(u,paths[best])
		if distance(u.p,target.p)==1:
			target.hp = maxi(0,target.hp-7)
			sound("hit")
		busy = false
		if check_end():
			return
