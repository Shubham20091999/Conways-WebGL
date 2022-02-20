#version 300 es

precision highp float;

uniform sampler2D u_texture;
uniform int u_px_size;

out vec4 outColor;

void main() {
	outColor = texelFetch(u_texture,ivec2(gl_FragCoord.xy/float(u_px_size)),0);
	// outColor = vec4(1.0, 0.0, 0.0, 1.0);
}