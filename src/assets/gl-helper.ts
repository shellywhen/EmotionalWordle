/* eslint-disable */
import * as d3 from 'd3'

let createProgram = (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) => {
    const program = gl.createProgram()
    if(!program) {
        throw new Error(`Could not construct program on canvas.`)
    }
    // link compiled shader to program
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    // check program status
    const success = gl.getProgramParameter(program, gl.LINK_STATUS)
    if (!success) {
      const info = gl.getProgramInfoLog(program)
      throw new Error(`Couldn't link shader: ${info}`)
      gl.deleteProgram(program)
    }
    return program
  }

let createShader = (gl: WebGLRenderingContext, type: number, src: string) => {
    // create shader and compile it
    const shader = gl.createShader(type) as WebGLShader
    gl.shaderSource(shader, src)
    gl.compileShader(shader)
    // check compilation status
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    if (!success) {
      const info = gl.getShaderInfoLog(shader)
      gl.deleteShader(shader)
      throw new Error(`Couldn't compile shader: ${info}`)
    }
    return shader
  }

let createVertexBuffer = (gl: WebGLRenderingContext) => {
    // create an array of vertices
    const vertices = [
      0, gl.canvas.height, // top left
      gl.canvas.width, gl.canvas.height, // top right
      0, 0, // bottom left
      gl.canvas.width, 0 // bottom right
    ]
  
    // create a buffer
    const vertexBuffer = gl.createBuffer() 
    // and select it as the one to apply buffer operations to from here out
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer) 
    // pass the vertices as a Float32Array and use it to fill the current buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    return vertexBuffer
  }

// let loadTexture = (gl: WebGLRenderingContext, url: string) => new Promise((resolve, reject) => {
//     const image = new Image()
//     image.crossOrigin = "anonymous"
//     image.onerror = reject
//     image.onload = () => {
//       const size = 2048
//       const context = DOM.context2d(size, size, 1)
//       context.canvas.style = "height: 60px; display: block;"
//       context.scale(1, -1)
//       context.drawImage(image, 0, 0, image.naturalWidth, image.naturalWidth, 0, -size, size, size)
  
//       const texture = gl.createTexture()
//       gl.bindTexture(gl.TEXTURE_2D, texture)
//       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
//       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
//       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT)
//       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT)
//       gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, context.canvas)
//       resolve(texture)
//     }
//     image.src = url
//   })


let createBackground = function (canvasId: string, width: number, height: number) {
  const canvas = d3.select(`#emotional-wordle-bg-canvas`).node() as HTMLCanvasElement
  let gl = canvas.getContext('webgl2')
  if(!gl) throw new Error(`Couldn't create Context`)
  canvas.width = width
  canvas.height = height
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, `
    precision highp float;
    uniform vec2 u_size;
    void main() {
      gl_FragColor = vec4(gl_FragCoord.xy / u_size, 0.0, 1.0);
    }
    `)
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, `
    attribute vec2 a_vertex;

    void main(void) {
      gl_Position = vec4(a_vertex, 0.0, 1.0);
    }
    `)
  const program = createProgram(gl, vertexShader, fragmentShader)
  const a_vertex = gl.getAttribLocation(program, "a_vertex")
  const u_size = gl.getUniformLocation(program, "u_size")
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, Float32Array.of(-1, -1, +1, -1, +1, +1, -1, +1), gl.STATIC_DRAW)
  gl.useProgram(program)
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.enableVertexAttribArray(a_vertex)
  gl.vertexAttribPointer(a_vertex, 2, gl.FLOAT, false, 0, 0)
  gl.uniform2f(u_size, width, height)
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
}
async function fragment (canvasId: string, width: number, height: number) {
  const canvas = d3.select(`#emotional-wordle-bg-canvas`).node() as HTMLCanvasElement
  canvas.width = width
  canvas.height = height
  let gl = canvas.getContext('webgl2',  {
    preserveDrawingBuffer: true
  })
  if(!gl) throw new Error(`Couldn't create Context`)
  gl.enable(gl.SCISSOR_TEST)
  const fragmentString = `
  precision mediump float;
  uniform vec2 u_resolution;
  uniform float u_time;
  void main() {
    vec2 st = gl_FragCoord.xy / u_resolution;
    gl_FragColor = vec4(st, sin(u_time) / 2. + 0.5, 1.0);
  }`
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, `
    precision mediump float;
    attribute vec2 a_position;
    uniform vec2 u_resolution;
    void main() {
    gl_Position = vec4((a_position / u_resolution * 2. - 1.) * vec2(1, -1), 0., 1.);
    }`)

  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentString)
  // create a shader program (= vertex shader + fragment shader)
  const program = createProgram(gl, vertexShader, fragmentShader)
  // create a buffer to hold vertex positions
  const vertexBuffer = createVertexBuffer(gl)
  // store uniforms and attributes locations
  const a_positionLoc = gl.getAttribLocation(program, 'a_position')
  const u_timeLoc = gl.getUniformLocation(program, 'u_time')
  const u_resolutionLoc = gl.getUniformLocation(program, 'u_resolution')

  let startTime = Date.now()
  let pauseTimestamp = Date.now()
  let isAnimated = (RegExp(`\\bu_time`, 'g')).test(fragmentString) || (RegExp(`\\bu_mouse`, 'g')).test(fragmentString)
  let firstFrame = true
  // rendering loop
  function* rendering() {
    while(isAnimated || firstFrame) {
      if(!gl) {throw new Error(`Unable to access GL object.`)}
      firstFrame = false
      // set viewport before drawing
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      // define what program for drawing(rendering)
      gl.useProgram(program)
      // update u_time and u_resolution uniforms
      const time = (Date.now() - startTime) / 1000
      gl.uniform1f(u_timeLoc, time)
      gl.uniform2f(u_resolutionLoc, gl.canvas.width, gl.canvas.height)
      // clear the canvas before we start drawing on it.
      gl.clearColor(1.0, 1.0, Math.sin(time) / 2.0 + 0.5, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      // set vertexBuffer to 'a_position' attribute
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)  // bind vertexBuffer to ARRAY_BUFFER
      gl.enableVertexAttribArray(a_positionLoc) // enable individual attributes
      const numComponents = 2  // pull out 2 values from vertexBuffer per iteration (=per vertex)
      const type = gl.FLOAT    // the data in the buffer is 32bit floats
      const normalize = false  // don't normalize
      const stride = 0         // how many bytes to get from one set of values to the next
      const offset = 0         // how many bytes inside the buffer to start from
      gl.vertexAttribPointer(a_positionLoc, numComponents, type, normalize, stride, offset) // Bind the buffer currently bound to gl.ARRAY_BUFFER to a generic vertex attribute
      // make a draw call
      const primitiveType = gl.TRIANGLE_STRIP // set how the vertices should connect
      const count = 4 // specify the number of indices (vertices) to be rendered
      gl.drawArrays(primitiveType, offset, count) // Render primitives from array data
      yield canvas
    }
  }
  // start rendering loop
  return rendering()
}

  export {
    createProgram,
    createShader,
    createVertexBuffer,
    createBackground,
    fragment
  }