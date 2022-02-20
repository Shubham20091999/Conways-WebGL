//Configurations-----
var canvas = <HTMLCanvasElement>document.querySelector("#main");
const gl = canvas.getContext("webgl2");

var pxSize: number = 8;

canvas.width = Math.floor(window.innerWidth / pxSize) * pxSize;
canvas.height = Math.floor(window.innerHeight / pxSize) * pxSize;
console.log(canvas.width, canvas.height);

const shaderLocation = "../shaders/";

async function getShaders() {
	const vertexResponse = await fetch(shaderLocation + "vert.vs");
	const fragmentResponse = await fetch(shaderLocation + "frag.fs");

	return {
		vs: await vertexResponse.text(),
		fs: await fragmentResponse.text()
	};
}

function initProgram(gl: WebGL2RenderingContext, vertexShaderSource: string, fragmentShaderSource: string) {
	function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
		var shader = gl.createShader(type)!;
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		var success = gl.getShaderParameter(shader!, gl.COMPILE_STATUS);
		if (success) {
			return shader;
		}

		console.log(gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		throw "Shader with type[" + type + "] could not be initialized";
	}

	var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)!;
	var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)!;

	var program = gl.createProgram()!;
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	var success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if (success) {
		return program;
	}

	console.log(gl.getProgramInfoLog(program));
	gl.deleteProgram(program);
	throw "Program could not be initialized";
}

function getRandomBitArray(size: number) {
	return Array.from({ length: size }, () => Math.floor(Number(Math.random() > 0.5)) * 255);
}

//-----------------


function main(gl: WebGL2RenderingContext, vertexShaderSource: string, fragmentShaderSource: string) {
	var program = initProgram(gl, vertexShaderSource, fragmentShaderSource);
	gl.useProgram(program);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	var vao = gl.createVertexArray()!;
	gl.bindVertexArray(vao);

	//Vertex Buffer setup
	{
		const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
		var positionBuffer = gl.createBuffer()!;
		gl.enableVertexAttribArray(positionAttributeLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

		var vertexCorrds2D = [
			//Triangle 1
			-1, -1,
			1, -1,
			-1, 1,

			//Triangle 2
			1, -1,
			1, 1,
			-1, 1
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexCorrds2D), gl.STATIC_DRAW);
		gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
	}

	//Texture Data Setup
	const textureLocation = gl.getUniformLocation(program, "u_texture");
	var texture = gl.createTexture();
	{
		gl.activeTexture(gl.TEXTURE0 + 0);
		gl.bindTexture(gl.TEXTURE_2D, texture);

		gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

		// const texture_data = Array.from({length: *canvas.height}, () => Math.floor(Math.random() * 255));

		// gl.texImage2D(gl.TEXTURE_2D,0,gl.R8, canvas.width,canvas.height,0,gl.RED,gl.UNSIGNED_BYTE,null);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, canvas.width, canvas.height, 0, gl.RED, gl.UNSIGNED_BYTE, new Uint8Array(getRandomBitArray(canvas.width * canvas.height)));

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		gl.uniform1i(textureLocation, 0);
	}

	//Pixel size setup
	const pxSizeLocation = gl.getUniformLocation(program, "u_px_size");
	{
		gl.uniform1i(pxSizeLocation, pxSize);
	}

	//Target Texture Setup (null)
	var targetTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D,targetTexture);
	{
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, canvas.width, canvas.height, 0, gl.RED, gl.UNSIGNED_BYTE, null);

		// set the filtering so we don't need mips
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

		gl.bindTexture(gl.TEXTURE_2D,texture);
	}

	//FrameBuffer setup
	const frameBuffer = gl.createFramebuffer();
	{
		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

		// attach the texture as the first color attachment
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, 0);
	}

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.bindVertexArray(vao);


	gl.drawArrays(gl.TRIANGLES, 0, 6);
	gl.bindFramebuffer(gl.FRAMEBUFFER,null);

	gl.bindTexture(gl.TEXTURE_2D,targetTexture);
	gl.uniform1i(pxSizeLocation, 1);
	gl.drawArrays(gl.TRIANGLES, 0, 6);
}

if (gl) {
	getShaders().then(ret => {
		main(gl, ret.vs, ret.fs);
	})
}
else {
	alert("webGL not supported!!");
}