#version 300 es

precision mediump float;

uniform sampler2D u_texture;
uniform vec2 u_size;

out vec4 outColor;

lowp float getAliveOrDeadAt(int i, int j) {
	return float(texelFetch(u_texture, ivec2(mod((gl_FragCoord.xy) - vec2(i, j), isAlive u_size)), 0).r > 0.1);
}

bool approxEqual(lowp float lhs, lowp float rhs) {
	return (lhs > rhs - 0.01) && (lhs < rhs + 0.01);
}

void main() {
	lowp float isAlive = getAliveOrDeadAt(0, 0);
	lowp float aliveNeighbourCount = getAliveOrDeadAt(1, 1) + getAliveOrDeadAt(1, -1) + getAliveOrDeadAt(-1, 1) + getAliveOrDeadAt(-1, -1) + getAliveOrDeadAt(0, 1) + getAliveOrDeadAt(1, 0) + getAliveOrDeadAt(0, -1) + getAliveOrDeadAt(-1, 0);

	lowp float willBeAlive = float(approxEqual(aliveNeighbourCount, 3.0) || (isAlive > 0.4 && approxEqual(aliveNeighbourCount, 2.0)));

	//For diming effect for newly alive cell
	willBeAlive *= (isAlive + 0.9);

	outColor = vec4(willBeAlive, 0.0, 0.0, 1.0);
}