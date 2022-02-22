#version 300 es

precision highp float;

uniform sampler2D u_texture;
uniform float u_px_size;

out vec4 outColor;

void main() {
	float val = texelFetch(u_texture, ivec2(gl_FragCoord.xy / u_px_size), 0).r;
	outColor = vec4(val,val,val,1.0);
	// outColor = vec4(1.0, 0.0, 0.0, 1.0);
}