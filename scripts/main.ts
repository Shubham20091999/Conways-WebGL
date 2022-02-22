//Configurations-----------------
var canvas = <HTMLCanvasElement>document.querySelector("#main");
const gl = canvas.getContext("webgl2");

const pxSize: number = 6;

canvas.width = Math.floor(window.innerWidth / pxSize) * pxSize;
canvas.height = Math.floor(window.innerHeight / pxSize) * pxSize;

const width = canvas.width / pxSize;
const height = canvas.height / pxSize;
console.log(width, height);

const shaderLocation = "../shaders/";
//---------------------------------

function main(gl: WebGL2RenderingContext, computeProgram: WebGLProgram, displayProgram: WebGLProgram) {
	const canvas = gl.canvas;

	var vao = gl.createVertexArray();
	gl.bindVertexArray(vao);

	//Vertex Buffer setup
	const positionAttributeLocation = gl.getAttribLocation(computeProgram, "a_position");
	var positionBuffer = gl.createBuffer();
	{
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
	const textureLocation = gl.getUniformLocation(computeProgram, "u_texture");
	const textureLocation_display = gl.getUniformLocation(displayProgram, "u_texture");

	var texture = gl.createTexture();
	{
		gl.activeTexture(gl.TEXTURE0 + 0);
		gl.bindTexture(gl.TEXTURE_2D, texture);

		gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);


		// gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, width, height, 0, gl.RED, gl.UNSIGNED_BYTE, );
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, width, height, 0, gl.RED, gl.UNSIGNED_BYTE, new Uint8Array(getRandomBitArray(width * height)));

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	}

	//Compute Texture Setup (initialized to null)
	var computedTexture = gl.createTexture();
	{
		gl.bindTexture(gl.TEXTURE_2D, computedTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, width, height, 0, gl.RED, gl.UNSIGNED_BYTE, null);

		// set the filtering so we don't need mips
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

		gl.bindTexture(gl.TEXTURE_2D, texture);
	}

	//Pixel size setup (for properscalling while displaying)
	const pxSizeLocation_display = gl.getUniformLocation(displayProgram, "u_px_size");

	//Size(width+height) setup (used for texture repeat on the edge of texture (check compute fragment shader for this))
	const sizeLocation = gl.getUniformLocation(computeProgram, "u_size");
	
	const frameBuffer = gl.createFramebuffer();
	
	//Compute setup
	gl.useProgram(computeProgram);
	{
		gl.uniform1i(textureLocation, 0);
		gl.uniform2f(sizeLocation, width, height);
	}

	//Display setup
	gl.useProgram(displayProgram);
	{
		gl.uniform1i(textureLocation_display, 0);
		gl.uniform1f(pxSizeLocation_display, pxSize);
	}

	//FrameBuffer setup

	var preTime = Number.NEGATIVE_INFINITY;
	function drawScene(time: number) {
		if ((time - preTime) / 1000 > 0.10)
		 {
			preTime = time;

			//Computing next frame
			{
				//Use Compute program for computations
				gl.useProgram(computeProgram);
				//Viewport will be of small size for computations
				gl.viewport(0, 0, width, height);

				//Frame buffer to compute next frame
				gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

				//setting target texture as the output of frame buffer which will be used to render next frame
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, computedTexture, 0);

				gl.clear(gl.COLOR_BUFFER_BIT);

				gl.drawArrays(gl.TRIANGLES, 0, 6);

				//Target texture will be created after this
				gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			}

			//Display computed frame
			{
				//Using Display Program
				gl.useProgram(displayProgram);
				//Viewport will be full sized
				gl.viewport(0, 0, canvas.width, canvas.height);

				gl.clear(gl.COLOR_BUFFER_BIT);
				gl.drawArrays(gl.TRIANGLES, 0, 6);
			}

			//Swap
			{
				//swaping next frame with previous frame
				[computedTexture, texture] = [texture, computedTexture];
				gl.bindTexture(gl.TEXTURE_2D, texture);
			}
		}

		requestAnimationFrame(drawScene);
	}

	requestAnimationFrame(drawScene);
}

if (gl) {
	getShaders(shaderLocation, {
		vertex: "vert.vs",
		computeFrag: "computeFrag.fs",
		displayFrag: "displayFrag.fs"
	}).then(ret => {

		var program = initProgram(gl, ret.vertex, ret.computeFrag);
		var displayProgram = initProgram(gl, ret.vertex, ret.displayFrag);

		main(gl, program, displayProgram);
	})
}
else {
	alert("webGL not supported!!");
}