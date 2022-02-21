"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//Configurations-----
var canvas = document.querySelector("#main");
const gl = canvas.getContext("webgl2");
var pxSize = 260;
canvas.width = Math.floor(window.innerWidth / pxSize) * pxSize;
canvas.height = Math.floor(window.innerHeight / pxSize) * pxSize;
const width = canvas.width / pxSize;
const height = canvas.height / pxSize;
console.log(width, height);
const shaderLocation = "../shaders/";
function getShaders() {
    return __awaiter(this, void 0, void 0, function* () {
        const vertexResponse = yield fetch(shaderLocation + "vert.vs");
        const fragmentResponse = yield fetch(shaderLocation + "frag.fs");
        const displayFragmentResponse = yield fetch(shaderLocation + "displayFrag.fs");
        return {
            vs: yield vertexResponse.text(),
            fs: yield fragmentResponse.text(),
            dfs: yield displayFragmentResponse.text(),
        };
    });
}
function initProgram(gl, vertexShaderSource, fragmentShaderSource) {
    function createShader(gl, type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        throw "Shader with type[" + type + "] could not be initialized";
    }
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    var program = gl.createProgram();
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
function getRandomBitArray(size) {
    return Array.from({ length: size }, () => (Number(Math.random() > 0.5) * 255));
}
//Debug-----------------
function getTextureData(tex) {
    var GL = gl;
    var fb = GL.createFramebuffer();
    GL.bindFramebuffer(GL.FRAMEBUFFER, fb);
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, tex, 0);
    var pixels = new Uint8Array(width * height * 4);
    if (GL.checkFramebufferStatus(GL.FRAMEBUFFER) == GL.FRAMEBUFFER_COMPLETE) {
        GL.readPixels(0, 0, width, height, GL.RGBA, GL.UNSIGNED_BYTE, pixels);
        console.log(pixels);
        console.log(pixels.filter((value, index, self) => self.indexOf(value) === index));
    }
    GL.deleteFramebuffer(fb);
    return pixels;
}
//----------------
function main(gl, program, displayProgram) {
    gl.useProgram(program);
    gl.viewport(0, 0, width, height);
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    //Vertex Buffer setup
    {
        const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
        var positionBuffer = gl.createBuffer();
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
    const textureLocation_display = gl.getUniformLocation(displayProgram, "u_texture");
    var texture = gl.createTexture();
    {
        gl.activeTexture(gl.TEXTURE0 + 0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, width, height, 0, gl.RED, gl.UNSIGNED_BYTE, new Uint8Array(getRandomBitArray(width * height)));
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, width, height, 0, gl.RED, gl.UNSIGNED_BYTE, new Uint8Array([0, 16, 32, 48, 64, 80, 96, 112, 128, 144, 160, 176, 192, 208, 224, 240, 256, 272]));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.uniform1i(textureLocation, 0);
    }
    //Pixel size setup
    const pxSizeLocation = gl.getUniformLocation(program, "u_px_size");
    const pxSizeLocation_display = gl.getUniformLocation(displayProgram, "u_px_size");
    {
        gl.uniform1f(pxSizeLocation, 1);
    }
    //Size(width+height) setup
    const sizeLocation = gl.getUniformLocation(program, "u_size");
    {
        gl.uniform2f(sizeLocation, width, height);
    }
    //Target Texture Setup (null)
    var targetTexture = gl.createTexture();
    {
        gl.bindTexture(gl.TEXTURE_2D, targetTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, width, height, 0, gl.RED, gl.UNSIGNED_BYTE, null);
        // set the filtering so we don't need mips
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.bindTexture(gl.TEXTURE_2D, texture);
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
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    //TODO: Make another program which doesnt do any computations but just shows the output (will need to be scaled) and also viewport size will need to be changed to full size
    //TODO: for computations keep viewport as just width and height but for showing output update viewport size to canvas.width && canvas.height
    gl.useProgram(displayProgram);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);
    gl.uniform1f(pxSizeLocation_display, pxSize);
    gl.uniform1i(textureLocation_display, 0);
    // gl.uniform1f(pxSizeLocation, pxSize);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}
if (gl) {
    getShaders().then(ret => {
        var program = initProgram(gl, ret.vs, ret.fs);
        var displayProgram = initProgram(gl, ret.vs, ret.dfs);
        main(gl, program, displayProgram);
    });
}
else {
    alert("webGL not supported!!");
}
