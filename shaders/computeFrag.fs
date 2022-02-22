#version 300 es

precision highp float;

uniform sampler2D u_texture;
uniform vec2 u_size;

out vec4 outColor;

vec4 getRedAt(int i,int j)
{
	return texelFetch(u_texture,ivec2(mod((gl_FragCoord.xy)-vec2(i,j),u_size)),0);
}

void main() {
	outColor = getRedAt(1,0);
}