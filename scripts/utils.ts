async function getShaders(baseLocation: string, list: Object) {
    let ret = Object();
    for (const [key, value] of Object.entries(list)) {
        const response = await fetch(baseLocation + value);
        ret[key] = await response.text();
    }
    return ret;
}

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

function initProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
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

function updateTexture(gl: WebGL2RenderingContext, size: Conways.size, data: Uint8Array | null, texture: WebGLTexture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, size.w, size.h, 0, gl.RED, gl.UNSIGNED_BYTE, data);
}

function createTexture(gl: WebGL2RenderingContext, size: Conways.size, data: Uint8Array | null): WebGLTexture {
    var texture = gl.createTexture()!;
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
function getRandomBitArray(size: number) {
    return Array.from({ length: size }, () => (Number(Math.random() > 0.90) * 255));
}


//Debug=========================
function getTextureData(GL: WebGL2RenderingContext, texture: WebGLTexture, width: number, height: number) {
    var fb = GL.createFramebuffer();
    GL.bindFramebuffer(GL.FRAMEBUFFER, fb);

    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, texture, 0);
    var pixels = new Uint8Array(width * height * 4);
    if (GL.checkFramebufferStatus(GL.FRAMEBUFFER) == GL.FRAMEBUFFER_COMPLETE) {
        GL.readPixels(0, 0, width, height, GL.RGBA, GL.UNSIGNED_BYTE, pixels);
        console.log(pixels);
        console.log(pixels.filter((value, index, self) => self.indexOf(value) === index))

    }
    GL.deleteFramebuffer(fb);

    return pixels;
}