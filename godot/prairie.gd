extends Node3D

const TILE_SHADER = preload("res://terrain_tile.gdshader")
const TILE_SHEET = preload("res://assets/tiles.webp")
const BACKDROP = preload("res://assets/bg/prairie.webp")
const SIDES = [
	Vector2i.RIGHT, Vector2i.LEFT, Vector2i.DOWN, Vector2i.UP,
]

var tiles := {}
var blocks := {}
var water := {}

func build(data: Dictionary, art: Node):
	var scenery = CanvasLayer.new()
	scenery.layer = -1
	add_child(scenery)
	var background = TextureRect.new()
	background.texture = BACKDROP
	background.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	background.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	background.mouse_filter = Control.MOUSE_FILTER_IGNORE
	scenery.add_child(background)
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	background.modulate = Color("#b4bd9d")

	var tile_mesh = PlaneMesh.new()
	tile_mesh.size = Vector2.ONE
	var earth_mesh = BoxMesh.new()
	earth_mesh.size = Vector3(1.0, 0.31, 1.0)
	var earth = StandardMaterial3D.new()
	earth.albedo_color = Color("#58442e")
	earth.roughness = 1.0
	var cells := {}
	for cell in data.cells:
		cells[Vector2i(cell.x, cell.y)] = cell

	for p in cells:
		var cell = cells[p]
		var surface = MeshInstance3D.new()
		surface.mesh = tile_mesh
		surface.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		var material = ShaderMaterial.new()
		material.shader = TILE_SHADER
		var f = art.atlas.tiles[int(cell.t)]
		var size = TILE_SHEET.get_size()
		material.set_shader_parameter("sheet", TILE_SHEET)
		material.set_shader_parameter("region", Vector4(f[0] / size.x, f[1] / size.y, f[2] / size.x, f[3] / size.y))
		surface.material_override = material
		add_child(surface)
		surface.position = Vector3(p.x, 0.0, p.y)
		tiles[p] = material

		if SIDES.any(func(side): return not cells.has(p + side)):
			var edge = MeshInstance3D.new()
			edge.mesh = earth_mesh
			edge.material_override = earth
			edge.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
			add_child(edge)
			edge.position = Vector3(p.x, -0.157, p.y)
		if cell.has("water"):
			water[p] = true
		if cell.has("block"):
			blocks[p] = true
			if cell.has("d"):
				add_decor(art, p, int(cell.d), data.decorWidths[int(cell.d)] * 1.38)
		elif cell.has("flower"):
			add_decor(art, p, 5, 0.65)

func add_decor(art: Node, p: Vector2i, frame: int, width: float):
	var sprite = art.new_sprite()
	add_child(sprite)
	art.set_frame(sprite, "deco", frame)
	sprite.pixel_size = width / sprite.region_rect.size.x
	sprite.position = Vector3(p.x, 0.035, p.y)
