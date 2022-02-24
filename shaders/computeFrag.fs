#version 300 es

precision lowp float;
precision lowp int;

uniform sampler2D u_texture;
uniform vec2 u_size;

out vec4 outColor;

vec4 getValueAt(int i, int j) {
	return texelFetch(u_texture, ivec2(mod((gl_FragCoord.xy) - vec2(i, j), u_size)), 0);
}

int getAliveOrDeadAt(int i, int j) {
	return int(getValueAt(i, j).r > 0.50);
}

void main() {
	int isAlive = getAliveOrDeadAt(0, 0);
	float isAlive_f = float(isAlive);
	int aliveNeighbourCount = getAliveOrDeadAt(1, 1) + getAliveOrDeadAt(1, -1) + getAliveOrDeadAt(-1, 1) + getAliveOrDeadAt(-1, -1) + getAliveOrDeadAt(0, 1) + getAliveOrDeadAt(1, 0) + getAliveOrDeadAt(0, -1) + getAliveOrDeadAt(-1, 0);

	float willBeAlive = float((aliveNeighbourCount == 3) || (bool(isAlive) && aliveNeighbourCount == 2));

	//For diming effect for newly alive cell and newly dead cells
	// outColor.r = willBeAlive = willBeAlive * (isAlive_f + 0.60) + (isAlive_f - 0.85) * (1.0 - willBeAlive);
	// isAlive_f - (1.0-a) + (1.0-a+b) * willBeAlive;
	// a-> brightness of willBeDead pixel
	// b-> brightness of will Be alive pixel
	outColor.r = isAlive_f - 0.85 + 1.45 * willBeAlive;
}