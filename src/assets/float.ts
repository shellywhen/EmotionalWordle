/* eslint-disable */
/**
 * This is the doc comment for float.ts.
 * It simulates the force.
 * @packageDocumentation
 */
import * as d3 from 'd3-selection'
import * as d3Force from 'd3-force'
import * as d3File from 'd3-fetch'
import { Word } from './cloud'
const ALPHAMIN = 0.1
interface SimulationData {
    ox: number,
    oy: number,
    radius: number,
    width: number,
    height: number,
    x?: number,
    y?: number
}
type ParticleSelection = d3.Selection<SVGTextElement, Particle, d3.BaseType, Particle>
class Particle implements SimulationData, d3Force.SimulationNodeDatum {
    ox: number
    oy: number
    radius: number
    width: number
    height: number
    x: number
    y: number
    index: number
    text: string
    fontSize: number
    constructor(word: Word, idx: number) {
        this.x = this.ox = word.x!
        this.y = this.oy = word.y!
        this.radius = word.height!/3 //Math.sqrt((word.width!/2)**2+ (word.height!/2)**2) / 2
        this.width = word.width!
        this.height = word.height!
        this.index = idx
        this.text = word.text!
        this.fontSize = word.size!
    }
}

let plotInitialText = function (data: Particle[]) {
    let canvas = d3.select('#particle-svg').html('')
    let container = canvas.append('g')
      .selectAll('text')
      .data(data)
      .enter()
      .append('g')
      .classed('particle-g', true)
      .attr('transform', (d: Particle) => `translate(${d.x}, ${d.y})`)
    container.append('text')
      .text((d: Particle) => d.text)
      .style('font-size', (d: Particle) => d.fontSize)
}

let simulationGenerator = function (data: Particle[], strength: number) {
    let container = d3.selectAll('.particle-g') as ParticleSelection
    return d3Force.forceSimulation()
    .nodes(data)
    .force('forceManyBody', d3Force.forceManyBody()
        .strength(strength))
    .force('forceColide', d3Force.forceCollide()
        .radius((node: d3Force.SimulationNodeDatum, idx: number) => {
            let vertex = node as Particle
            return vertex.radius
        }))
    .on('tick', function() {
       container
          .attr('transform', (d: Particle) => `translate(${d.x}, ${d.y})`)
    })
    .alphaMin(ALPHAMIN)
    .on('end', function() {
        simulationGenerator(data, (Math.random()-0.5)*2)
    })
}

let createSimulation = function (data: Particle[]) {
    plotInitialText(data)
    let container = d3.selectAll('.particle-g') as ParticleSelection
    let simulation = d3Force.forceSimulation()
        .nodes(data)
        .force('forceManyBody', d3Force.forceManyBody()
            .strength(2))
        .force('forceColide', d3Force.forceCollide()
            .radius((node: d3Force.SimulationNodeDatum, idx: number) => {
                let vertex = node as Particle
                return vertex.radius
            }))
        .alphaMin(ALPHAMIN)
        .on('tick', function() {
           container
              .attr('transform', (d: Particle) => `translate(${d.x}, ${d.y})`)
        })
        .on('end', function() {
            simulationGenerator(data, 2)
        })
}

export let simulate = function (data: Word[], width: number, height: number){
    let url = './dataset/layout/layout_xmas.json'
    d3File.json(url).then((d: any) => {
        console.log(d, 'hello test')
        let data = d as Word[]
    }, (err: any) => {
      console.log(err)
    })
    console.log(data)
    let processed = data.map((d: Word, idx: number) => {
        let datum = d
        datum.x = d.x! + width / 2
        datum.y = d.y! + height / 2
        return new Particle(datum, idx)
    })
    createSimulation(processed)
}