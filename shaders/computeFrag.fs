#version 300 es

precision highp float;

uniform sampler2D u_texture;
uniform vec2 u_size;

out vec4 outColor;

vec4 getValueAt(int i, int j) {
	return texelFetch(u_texture, ivec2(mod((gl_FragCoord.xy) - vec2(i, j), u_size)), 0);
}

float getAliveOrDeadAt(int i, int j) {
	return float(getValueAt(i, j).r > 0.4);
}

void main() {
	float isAlive = getAliveOrDeadAt(0, 0);
	float aliveNeighbourCount = getAliveOrDeadAt(1, 1) + getAliveOrDeadAt(1, -1) + getAliveOrDeadAt(-1, 1) + getAliveOrDeadAt(-1, -1) + getAliveOrDeadAt(0, 1) + getAliveOrDeadAt(1, 0) + getAliveOrDeadAt(0, -1) + getAliveOrDeadAt(-1, 0);

	float willBeAlive = float((aliveNeighbourCount == 3.0) || (isAlive>0.4 && aliveNeighbourCount == 2.0));

	//For diming effect for newly alive cell
	willBeAlive *= (isAlive+0.7);

	outColor = vec4(willBeAlive,0.0,0.0,1.0);
}