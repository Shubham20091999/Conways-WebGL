"use strict";
async function getShaders(baseLocation, list) {
    let ret = Object();
    for (const [key, value] of Object.entries(list)) {
        const response = await fetch(baseLocation + value);
        ret[key] = await response.text();
    }
    return ret;
}
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
function initProgram(gl, vertexShader, fragmentShader) {
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
function updateTexture(gl, size, data, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, size.w, size.h, 0, gl.RED, gl.UNSIGNED_BYTE, data);
}
function createTexture(gl, size, data) {
    var texture = gl.createTexture();
    {
        gl.activeTexture(gl.TEXTURE0 + 0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, size.w, size.h, 0, gl.RED, gl.UNSIGNED_BYTE, data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    }
    return texture;
}
//----------------------------------------
function getRandomBitArray(size) {
    return Uint8Array.from({ length: size }, () => (Number(Math.random() > 0.90) * 255));
}
function mod(a, b) {
    return a - Math.floor(a / b) * b;
}
//Debug=========================
function getTextureData(GL, texture, size) {
    var fb = GL.createFramebuffer();
    GL.bindFramebuffer(GL.FRAMEBUFFER, fb);
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, texture, 0);
    var pixels = new Uint8Array(size.w * size.h * 4);
    let ret = null;
    if (GL.checkFramebufferStatus(GL.FRAMEBUFFER) == GL.FRAMEBUFFER_COMPLETE) {
        GL.readPixels(0, 0, size.w, size.h, GL.RGBA, GL.UNSIGNED_BYTE, pixels);
        ret = pixels.filter(function (value, index, arr) {
            return index % 4 == 0;
        });
    }
    GL.deleteFramebuffer(fb);
    return ret;
}
