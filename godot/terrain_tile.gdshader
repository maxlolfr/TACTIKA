shader_type spatial;
render_mode cull_disabled;

uniform sampler2D sheet : source_color, filter_linear, repeat_disable;
uniform vec4 region;
uniform vec4 highlight : source_color = vec4(0.0);

void fragment() {
	vec2 uv = UV;
	// The source art is an isometric diamond. Map it onto a square on the XZ plane.
	vec2 diamond = vec2((uv.x - uv.y) * 0.48 + 0.5, (uv.x + uv.y - 1.0) * 0.44 + 0.47);
	vec3 ground = texture(sheet, region.xy + diamond * region.zw).rgb;
	float border_distance = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
	float border = 1.0 - smoothstep(0.016, 0.054, border_distance);
	ALBEDO = mix(ground * vec3(0.68, 0.76, 0.68) * (1.0 - border * 0.23), highlight.rgb, highlight.a * mix(0.48, 1.0, border));
	ROUGHNESS = 1.0;
}
