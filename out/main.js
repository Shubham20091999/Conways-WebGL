"use strict";
//Configurations-----------------
var canvas = document.querySelector("#main");
const pxSize = 6;
canvas.width = Math.floor(window.innerWidth / pxSize) * pxSize;
canvas.height = Math.floor(window.innerHeight / pxSize) * pxSize;
const gl = canvas.getContext("webgl2");
const shaderLocation = "shaders/";
let conways;
class Conways {
    constructor(gl, pxSize, computeProgram, displayProgram) {
        this.gl = gl;
        this.program = {
            compute: computeProgram,
            display: displayProgram
        };
        this.pxSize = pxSize;
        this.size = {
            compute: {
                h: gl.canvas.height / this.pxSize,
                w: gl.canvas.width / this.pxSize,
            },
            display: {
                h: gl.canvas.height,
                w: gl.canvas.width,
            }
        };
        // this.pxArray = new Uint8Array(this.size.compute.h * this.size.compute.w);
        this.pxArray = getRandomBitArray(this.size.compute.h * this.size.compute.w);
        this.textures = this.initialize();
        this.framebuffer = gl.createFramebuffer();
        // this.display();
        this.isPaused = false;
        this.setupEventListeners();
    }
    setupEventListeners() {
        if ((navigator.maxTouchPoints || 'ontouchstart' in document.documentElement)) {
            return;
        }
        // this.isPaused = true;
        document.addEventListener("mousemove", (event) => {
            if (event.buttons > 0) {
                conways.addPx(event.clientX, event.clientY);
            }
        });
        document.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        }, false);
        document.addEventListener("keydown", (event) => {
            if (event.key == " ") {
                this.playPause();
                event.preventDefault();
            }
            if (event.altKey && event.key == "c") {
                this.pxArray = new Uint8Array(this.size.compute.h * this.size.compute.w);
                updateTexture(this.gl, this.size.compute, this.pxArray, this.textures.compute);
                this.display();
                if (!this.isPaused)
                    this.playPause();
            }
            if (event.altKey && event.key == "r") {
                this.pxArray = getRandomBitArray(this.size.compute.h * this.size.compute.w);
                updateTexture(this.gl, this.size.compute, this.pxArray, this.textures.display);
            }
        });
    }
    playPause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.pxArray = getTextureData(this.gl, this.textures.compute, this.size.compute);
        }
    }
    addPx(x, y) {
        if (!this.isPaused) {
            return;
        }
        x = Math.floor(x / this.pxSize);
        y = y / this.pxSize;
        this.pxArray[(x + Math.floor(this.size.compute.h - y) * this.size.compute.w)] = 255.0;
        updateTexture(this.gl, this.size.compute, this.pxArray, this.textures.display);
        this.display();
    }
    initialize() {
        let gl = this.gl;
        var vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        //Vertex Buffer setup
        const positionAttributeLocation = gl.getAttribLocation(this.program.compute, "a_position");
        const positionAttributeLocation_Display = gl.getAttribLocation(this.program.display, "a_position");
        var positionBuffer = gl.createBuffer();
        {
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.enableVertexAttribArray(positionAttributeLocation_Display);
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
            gl.vertexAttribPointer(positionAttributeLocation_Display, 2, gl.FLOAT, false, 0, 0);
        }
        const textureLocation = gl.getUniformLocation(this.program.compute, "u_texture");
        const textureLocation_display = gl.getUniformLocation(this.program.display, "u_texture");
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        var texture = createTexture(gl, this.size.compute, new Uint8Array(this.pxArray));
        //Compute Texture Setup (initialized to null)
        var computedTexture = createTexture(gl, this.size.compute, null);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        //Pixel size setup (for properscalling while displaying)
        const pxSizeLocation_display = gl.getUniformLocation(this.program.display, "u_px_size");
        //Size(width+height) setup (used for texture repeat on the edge of texture (check compute fragment shader for this))
        const sizeLocation = gl.getUniformLocation(this.program.compute, "u_size");
        //Compute setup
        gl.useProgram(this.program.compute);
        {
            gl.uniform1i(textureLocation, 0);
            gl.uniform2f(sizeLocation, this.size.compute.w, this.size.compute.h);
        }
        //Display setup
        gl.useProgram(this.program.display);
        {
            gl.uniform1i(textureLocation_display, 0);
            gl.uniform1f(pxSizeLocation_display, this.pxSize);
        }
        return {
            compute: computedTexture,
            display: texture,
        };
    }
    //Computing next texture
    compute() {
        let gl = this.gl;
        //Use Compute program for computations
        gl.useProgram(this.program.compute);
        //Viewport will be of small size for computations
        gl.viewport(0, 0, this.size.compute.w, this.size.compute.h);
        //Frame buffer to compute next frame
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        //setting target texture as the output of frame buffer which will be used to render next frame
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textures.compute, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        //Target texture will be created after this
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    //Displaying  texture
    display() {
        let gl = this.gl;
        //Using Display Program
        gl.useProgram(this.program.display);
        //Viewport will be full sized
        gl.viewport(0, 0, this.size.display.w, this.size.display.h);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    drawScene() {
        if (this.isPaused) {
            return;
        }
        let gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.textures.display);
        this.display();
        this.compute();
        //Swap
        //Display computed texture in next draw call
        [this.textures.compute, this.textures.display] = [this.textures.display, this.textures.compute];
    }
}
if (gl) {
    getShaders(shaderLocation, {
        vertex: "vert.vs",
        computeFrag: "computeFrag.fs",
        displayFrag: "displayFrag.fs"
    }).then(ret => {
        let vertexShader = createShader(gl, gl.VERTEX_SHADER, ret.vertex);
        let computeFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, ret.computeFrag);
        let displayFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, ret.displayFrag);
        var computeProgram = initProgram(gl, vertexShader, computeFragmentShader);
        var displayProgram = initProgram(gl, vertexShader, displayFragmentShader);
        conways = new Conways(gl, pxSize, computeProgram, displayProgram);
        setInterval(() => conways.drawScene(), 100);
    });
}
else {
    alert("webGL not supported!!");
}
