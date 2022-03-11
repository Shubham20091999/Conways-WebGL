#version 300 es

precision highp float;

uniform sampler2D u_texture;
uniform float u_px_size;
uniform vec2 u_size;
uniform vec2 u_shift;

out vec4 outColor;

void main() {
	float val = texelFetch(u_texture, ivec2(mod((gl_FragCoord.xy + u_shift) / u_px_size, u_size)), 0).r;
	outColor = vec4(val, val, val, 1.0);
	// outColor = vec4(1.0, 0.0, 0.0, 1.0);
}