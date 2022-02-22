#version 300 es

precision highp float;

uniform sampler2D u_texture;
uniform vec2 u_size;

out vec4 outColor;

vec4 getValueAt(int i, int j) {
	return texelFetch(u_texture, ivec2(mod((gl_FragCoord.xy) - vec2(i, j), u_size)), 0);
}

float getAliveOrDeadAt(int i, int j) {
	return float(getValueAt(i, j).r > 0.5);
}

void main() {
	float isAlive = getAliveOrDeadAt(0, 0);
	float aliveNeighbourCount = getAliveOrDeadAt(1, 1) + getAliveOrDeadAt(1, -1) + getAliveOrDeadAt(-1, 1) + getAliveOrDeadAt(-1, -1) + getAliveOrDeadAt(0, 1) + getAliveOrDeadAt(1, 0) + getAliveOrDeadAt(0, -1) + getAliveOrDeadAt(-1, 0);

	float willBeAlive = 0.0;
	if(isAlive > 0.5) {
		if(aliveNeighbourCount == 2.0 || aliveNeighbourCount == 3.0) {
			willBeAlive = 1.0;
		}
	} else {
		if(aliveNeighbourCount == 3.0)
		{
			willBeAlive = 1.0;
		}
	}

	outColor = vec4(willBeAlive,0.0,0.0,1.0);
	// outColor = vec4(1.0,1.0,1.0,1.0);
}