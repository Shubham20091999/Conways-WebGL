#version 300 es

precision lowp float;

uniform sampler2D u_texture;
uniform vec2 u_size;

out vec4 outColor;

vec4 getValueAt(int i, int j) {
	return texelFetch(u_texture, ivec2(mod((gl_FragCoord.xy) - vec2(i, j), u_size)), 0);
}

float getAliveOrDeadAt(int i, int j) {
	return float(getValueAt(i, j).r > 0.50);
}

bool approxEqual(float lhs, float rhs) {
	return (lhs > rhs - 0.01) && (lhs < rhs + 0.01);
}

void main() {
	float isAlive = getAliveOrDeadAt(0, 0);
	float aliveNeighbourCount = getAliveOrDeadAt(1, 1) + getAliveOrDeadAt(1, -1) + getAliveOrDeadAt(-1, 1) + getAliveOrDeadAt(-1, -1) + getAliveOrDeadAt(0, 1) + getAliveOrDeadAt(1, 0) + getAliveOrDeadAt(0, -1) + getAliveOrDeadAt(-1, 0);

	float willBeAlive = float(approxEqual(aliveNeighbourCount, 3.0) || (isAlive > 0.4 && approxEqual(aliveNeighbourCount, 2.0)));

	//For diming effect for newly alive cell and newly dead cells
	//willBeAlive, isAlive
	//1.0, 1.0 -> 1.60 -> 1.0
	//1.0, 0.0 -> 0.60
	//0.0, 1.0 -> 0.15
	//0.0, 0.0-> -0.85 -> 0.0
	willBeAlive = willBeAlive * (isAlive + 0.60) + (isAlive - 0.85) * (1.0 - willBeAlive);

	outColor = vec4(willBeAlive, 0.0, 0.0, 1.0);
}