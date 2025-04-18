/* eslint-disable */
/**
 * doc comment for jump.ts
 * @remarks 
 * It is working in progress. It trys to tune the webgl program more subtlely.
 * @packageDocumentation
 */


// Reads out a .ttf and triangulates the glyphs using OpenType and Earcut.
// Code made By riv -> https://stackoverflow.com/questions/50554803/triangulate-path-data-from-opentype-js-using-earcut/50581183#50581183
// Original here -> https://jsbin.com/gecakub/edit?html,js,output

// 1. Reads Bezier curves from `.tff` font file using OpenType.js.
// 2. Converts Bezier curves into closed shapes and sort them by descending area.
// 3. Determines the indices for the holes by figuring out which shapes are inside other shapes.
// 4. Send all points to Earcut with the holes indices as a second parameter.
// 5. Uses earcut's result as indices for the geometry.
// 6. Then, render triangles with webGL.


import opentype from "opentype.js"
import earcut from "earcut"
import { createShader, createProgram } from "./gl-helper"
// import { polygonCentroid } from "d3"
import { Word } from './types'


interface P {
  x: number,
  y: number
}


const FONTURL = "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf"
let time: any = null
let pace = 80.0

function distance(p1: P, p2: P) {
  const dx = p1.x - p2.x,
    dy = p1.y - p2.y
  return Math.sqrt(dx * dx + dy * dy)
}

function lerp(p1: P, p2: P, t: number) {
  return { x: (1 - t) * p1.x + t * p2.x, y: (1 - t) * p1.y + t * p2.y }
}

function cross(p1: P, p2: P) {
  return p1.x * p2.y - p1.y * p2.x
}

// bezier discretization
const MAX_BEZIER_STEPS = 10
const BEZIER_STEP_SIZE = 3.0
// this is for inside checks - doesn't have to be particularly
// small because glyphs have finite resolution
const EPSILON = 1e-6

let gl: any
let indices: any
// class for converting path commands into point data
class Polygon {
  public points: Array<P> = []
  public children: Polygon[] = []
  public area: any = 0.0

  moveTo(p:P) {
    this.points.push(p)
  }

  lineTo(p:P) {
    this.points.push(p)
  }
  close() {
    let cur = this.points[this.points.length - 1]
    this.points.forEach(next => {
      this.area += 0.5 * cross(cur, next)
      cur = next
    })
  }
  conicTo(p: P, p1: P) {
    const p0 = this.points[this.points.length - 1]
    const dist = distance(p0, p1) + distance(p1, p)
    const steps = Math.max(
      2,
      Math.min(MAX_BEZIER_STEPS, dist / BEZIER_STEP_SIZE)
    )
    for (let i = 1; i <= steps; ++i) {
      const t = i / steps
      this.points.push(lerp(lerp(p0, p1, t), lerp(p1, p, t), t))
    }
  }
  cubicTo(p: P, p1: P, p2: P) {
    const p0 = this.points[this.points.length - 1]
    const dist = distance(p0, p1) + distance(p1, p2) + distance(p2, p)
    const steps = Math.max(
      2,
      Math.min(MAX_BEZIER_STEPS, dist / BEZIER_STEP_SIZE)
    )
    for (let i = 1; i <= steps; ++i) {
      const t = i / steps
      const a = lerp(lerp(p0, p1, t), lerp(p1, p2, t), t)
      const b = lerp(lerp(p1, p2, t), lerp(p2, p, t), t)
      this.points.push(lerp(a, b, t))
    }
  }

  inside(p: P) {
    let count = 0,
      cur = this.points[this.points.length - 1]
    this.points.forEach(next => {
      const p0 = cur.y < next.y ? cur : next
      const p1 = cur.y < next.y ? next : cur
      if (p0.y < p.y + EPSILON && p1.y > p.y + EPSILON) {
        if ((p1.x - p0.x) * (p.y - p0.y) > (p.x - p0.x) * (p1.y - p0.y)) {
          count += 1
        }
      }
      cur = next
    })
    return count % 2 !== 0
  }
}


function tick(t: number) {
  
  gl.uniform1f(time, t / pace)
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)

  requestAnimationFrame(tick)
}

let getRoots = function (polys: Polygon[]) {
     // classify contours to find holes and their 'parents'
     const root = []
     for (let i = 0; i < polys.length; ++i) {
         let parent = null
         for (let j = i - 1; j >= 0; --j) {
             // a contour is a hole if it is inside its parent and has different winding
             if (
             polys[j].inside(polys[i].points[0]) &&
             polys[i].area * polys[j].area < 0
             ) {
                 parent = polys[j]
                 break
             }
     }
     if (parent) {
             parent.children.push(polys[i])
         } else {
             root.push(polys[i])
         }
     }
     return root
}

let getPolys = function (font: opentype.Font, x=0, y=0, s=12, text="Hello World") {
    // create path
    const path = font.getPath(text, x, y, s)
    // create a list of closed contours
    const polys: Polygon[] = []
    path.commands.forEach(({ type, x, y, x1, y1, x2, y2 }: any) => {
    switch (type) {
        case "M":
        polys.push(new Polygon())
        polys[polys.length - 1].moveTo({ x, y })
        break
        case "L":
        polys[polys.length - 1].moveTo({ x, y })
        break
        case "C":
        polys[polys.length - 1].cubicTo(
            { x, y },
            { x: x1, y: y1 },
            { x: x2, y: y2 }
        )
        break
        case "Q":
        polys[polys.length - 1].conicTo({ x, y }, { x: x1, y: y1 })
        break
        case "Z":
        polys[polys.length - 1].close()
        break
        }
    })
    // sort contours by descending area
    polys.sort((a, b) => Math.abs(b.area) - Math.abs(a.area))
    return polys
}

let getVertexData = function (root: Polygon[], polys: Polygon[]) {
    const totalPoints = polys.reduce((sum: number, p: Polygon) => sum + p.points.length, 0)
    const vertexData = new Float32Array(totalPoints * 2)
    let vertexCount = 0
    indices = []
    let process = function(poly: Polygon) {
    // construct input for earcut
        const coords: number[] = []
        const holes: number[] = []
        poly.points.forEach(({ x, y }) => coords.push(x, y))
        poly.children.forEach(child => {
            // children's children are new, separate shapes
            child.children.forEach(process)
            holes.push(coords.length / 2)
            child.points.forEach(({ x, y }) => coords.push(x, y))
        })
        // add vertex data
        vertexData.set(coords, vertexCount * 2)
        // add index data
        earcut(coords, holes).forEach(i => indices.push(i + vertexCount))
        vertexCount += coords.length / 2
    }
    root.forEach(process)
    return [vertexData, indices]
}

let draw = function (font: opentype.Font, words: Word[] = [], statement: string=defaultvs) {
    let canvas = document.getElementById("emordle-canvas") as HTMLCanvasElement
    const width = canvas.width
    const height = canvas.height
    let polyAll: Polygon[] = []
    for (let word of words) {
        let polys = getPolys(font, word.x! - word.width! / 2, word.y, word.size, word.text)
        polyAll = polyAll.concat(polys)
    }
    let root = getRoots(polyAll)
    let [vertexData, indices] = getVertexData(root, polyAll)
    drawOnCanvas(vertexData, indices, statement)
}

const defaultvs = ` pos.y += pow(sin( (pos.x) / 500.+ uTime *.02),2.) * 20.;
pos.x += sin( pos.y/ 100. + uTime *.8) * .5;
`

const staticvs = ` pos.y = pos.y;
pos.x = pos.x;
`

let vsGenerator = function (speed: number, entropy: number) {
  if (speed == 0) return staticvs
  const waveletNum = Math.max(1, Math.floor(entropy * 10))
  const timeGran = Number((0.01 + speed * 0.3)).toFixed(3)
  const yAmplitude = Number(15.1 + 9.9 * entropy).toFixed(3)
  const yExtent = Number(10.1 + (1.05 - entropy) * 359.9).toFixed(3)
  const xExtent = Number(50.1 + (1.05 - entropy) * 150.1).toFixed(3)
  const xAmplitude = Number(0.02 + 0.58 * entropy).toFixed(3)
  let xPosStr = `sin( pos.y / ${xExtent} + uTime * ${timeGran}) * ${xAmplitude}`
  let yPosStr = `pow(sin( (pos.x) / ${yExtent} + uTime * ${timeGran}), 2.) * ${yAmplitude}`
  let result = `
  pos.x += ${xPosStr};
  pos.y += ${yPosStr};
  `
  return result
  //return defaultvs
}

let drawOnCanvas = function (vertexData: Float32Array, indices: Uint16Array, statement: string=defaultvs) {
    const canvas = document.getElementById("emordle-canvas") as HTMLCanvasElement
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    const width = canvas.width
    const height = canvas.height
    gl.viewport(0, 0, width, height)
    console.log(statement, 'statement')
    const vs = createShader(gl, gl.VERTEX_SHADER, `
      precision mediump float;
      uniform vec2 uScale;
      uniform vec2 uOffset;
      uniform float uTime;
      attribute vec2 position;
      varying vec4 fragColor;
      void main() {
      vec2 pos = position;
      ${statement}
      gl_Position = vec4(pos * uScale + uOffset, 0.0, 1.0);
      fragColor = vec4(sin(uTime*.05)*.55+.6, 0.05, cos(uTime*.15)*.25+.35, 1. ); // colorful
    }`)

    const ps = createShader(gl, gl.FRAGMENT_SHADER,
        `precision mediump float;
        uniform vec4 uColor;
        uniform vec2 u_resolution;
        varying vec4 fragColor;
        void main() {
        gl_FragColor = uColor;
        vec2 st = gl_FragCoord.xy / u_resolution;
        gl_FragColor = fragColor;
        }`)
    const prog = createProgram(gl, vs, ps)
    gl.bindAttribLocation(prog, 0, "position")
    const [uScale, uOffset, uColor, uTime, u_resolutionLoc, fragColor] = [
    "uScale",
    "uOffset",
    "uColor",
    "uTime",
    "u_resolution",
    "fragColor"
    ].map(name => gl.getUniformLocation(prog, name))
    time = uTime
    gl.useProgram(prog)
    gl.uniform1f(uTime, 0)
    gl.uniform2fv(uScale, [2.0 / width, -2.0 / height])
    gl.uniform2fv(uOffset, [0.0, 0.0])
    gl.uniform4fv(uColor, [0.0, 0.0, 0.0, 1.0])
    gl.uniform4fv(fragColor, [0.0, 0.0, 0.0, 1.0])
    gl.uniform2f(u_resolutionLoc, gl.canvas.width, gl.canvas.height)
    gl.clearColor(.0, 1.0, 1.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    const vertBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW)
    const indxBuffer = gl.createBuffer()
    const indexData = new Uint16Array(indices)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indxBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, true, 8, 0)
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
    gl.flush()
    tick(Date.now())
}

let onloadedFont = function(err: any, font: opentype.Font | undefined) {
    if (err) {
        alert("Font could not be loaded: " + err)
    } else if (font) {
        console.log(font)
        draw(font)
    }
}

export let test = function (fontUrl=FONTURL) {
    opentype.load(
        fontUrl,
        onloadedFont
      )    
}
interface WavingParam {
  words: Word[],
  fontUrl?: string,
  speed: number,
  entropy: number,
}
export let jumpingWordle = function ({words=[], fontUrl=FONTURL, speed=0.5, entropy=0.5}: WavingParam) {
    opentype.load(
        fontUrl,
        function(err, fontMeta: opentype.Font | undefined) {
            if (err) {
                console.log(fontUrl)
                alert("Font could not be loaded: " + err)
            } else if (fontMeta) {
                let statement = vsGenerator(speed, entropy)
                draw(fontMeta, words, statement)
            }
        }
    )
}