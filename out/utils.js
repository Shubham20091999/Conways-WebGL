"use strict";
async function getShaders(baseLocation, list) {
    let ret = Object();
    for (const [key, value] of Object.entries(list)) {
        const response = await fetch(baseLocation + value);
        ret[key] = await response.text();
    }
    return ret;
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
    return Array.from({ length: size }, () => (Number(Math.random() > 0.90) * 255));
}
//Debug=========================
function getTextureData(GL, texture) {
    var fb = GL.createFramebuffer();
    GL.bindFramebuffer(GL.FRAMEBUFFER, fb);
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, texture, 0);
    var pixels = new Uint8Array(width * height * 4);
    if (GL.checkFramebufferStatus(GL.FRAMEBUFFER) == GL.FRAMEBUFFER_COMPLETE) {
        GL.readPixels(0, 0, width, height, GL.RGBA, GL.UNSIGNED_BYTE, pixels);
        console.log(pixels);
        console.log(pixels.filter((value, index, self) => self.indexOf(value) === index));
    }
    GL.deleteFramebuffer(fb);
    return pixels;
}
