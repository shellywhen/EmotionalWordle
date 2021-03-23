/* eslint-disable */
/**
 * doc comment for plot.ts.
 * It plots the wordle according to the layout spec and stylesheet on svg or canvas2d
 * 
 * @packageDocumentation
 */

import { Word, Style } from '@/assets/types'
import * as d3 from 'd3-selection'
import * as d3Drag from 'd3-drag'
import { kmeans } from '@/assets/lib/kmeans'
import * as tinycolor from 'tinycolor2'

// import { Bubble } from './animation' 
class PlotHandler {
    public canvas: HTMLCanvasElement | undefined
    private context: CanvasRenderingContext2D| undefined
    public bgCanvas: HTMLCanvasElement| undefined
    public svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>
    private styleSheet: Style
    public height: number
    public width: number

    constructor(canvasId: string, svgId: string,  styleSheet: Style, handleCanvas=true) {
        this.styleSheet = styleSheet
        this.width = styleSheet.width
        this.height = styleSheet.height
        this.svg = d3.select(`#${svgId}`)
        if(handleCanvas) {
            this.canvas = d3.select(`#${canvasId}`).node() as HTMLCanvasElement
            this.bgCanvas =  d3.select('#emotional-wordle-bg-canvas').node() as HTMLCanvasElement
            this.canvas.width = styleSheet.width
            this.canvas.height = styleSheet.height
            this.context = this.canvas.getContext('2d')!
            this.context.fillStyle = styleSheet.colorScheme!
            this.context.textAlign = 'center'
        }
    }
    public preprocess (data: Word[]) {
        if ('color' in data[0]) return
    }
    public plotHoloTextOnCanvas(data: Word[]) {
        if(!this.context) return
        const ctx = this.context
        ctx.clearRect(0, 0, this.width, this.height)
        ctx.fillStyle = "rgba(255, 255, 255, 1)"
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillRect(0, 0, this.width, this.height)
        ctx.globalCompositeOperation = 'destination-out'
        data.forEach((d: Word) => {
            ctx.save()
            ctx.fillStyle = "rgba(0, 0, 0, 1)"
            ctx.translate( this.width / 2 + d.x!, this.height / 2 + d.y!)
            ctx.rotate(d.rotate! * Math.PI / 180)
            ctx.font = `${this.styleSheet.fontWeight!} ${d.size}px ${this.styleSheet.fontFamily!}`
            if(/\p{Extended_Pictographic}/u.test(d.text!)) {
                ctx.globalCompositeOperation = 'source-over'
                ctx.fillText(d.text!,0, 0)
                ctx.globalCompositeOperation = 'destination-out'
            }
            else {
                ctx.fillText(d.text!,0, 0)
            }
            ctx.restore()
        })
    }
    public plotOnCanvas(data: Word[]) {
        const ctx = this.context
        if(!ctx) return
        ctx.clearRect(0, 0, this.width, this.height)
        ctx.fillStyle = "rgba(255, 255, 255, 1)"
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillRect(0, 0, this.width, this.height)
        data.forEach((d: Word) => {
            ctx.save()
            // ctx.strokeStyle = 'black'
            //let color = tinycolor(d.color || this.styleSheet.colorScheme!)
            // let colorstr = `rgba(${color.toRGB().r})`
            ctx.fillStyle = d.color || this.styleSheet.colorScheme!
            ctx.translate( this.width / 2 + d.x!, this.height / 2 + d.y!)
            ctx.rotate(d.rotate! * Math.PI / 180)
            ctx.font = `${this.styleSheet.fontWeight!} ${d.size}px ${this.styleSheet.fontFamily!}`
            ctx.fillText(d.text!,0, 0)
            ctx.restore()
        })
    }
    public plotOnSvgWithConfig(data: Word[]) {
        let plotHandler = this
        let translationDrag = getTranslationDragHandle(this.width, this.height)
        let rotationDrag = getRotationDragHandle(this.width, this.height)
        this.svg.html('')
        let basic = this.svg.append('g')
        .attr('class', 'wordcloud')
        .style('font-family', this.styleSheet.fontFamily!)
        .style('font-style', this.styleSheet.fontStyle!)
        .attr('transform', 'translate(' + this.width / 2 + ',' + this.height / 2 + ')')
        .selectAll('g')
        .data(data)
        .enter()
        .append('g')
        .attr('transform', getGTransform)

        let texts = basic.append('text')
        .datum((d: Word) => d)
        .attr('class', 'word')
        .style('text-anchor', 'middle')
        .style('fill', (d: Word) => d.color || this.styleSheet.colorScheme!)
        .style('font-size', (d: Word) => d.size! + 'px' )
        .text((d: Word, idx: number)=> {
            return d.text || ''
        })
        .each(function(this: SVGTextElement, d: Word) {
            if (!this.parentNode) return
            let bbox = this.getBBox()
            d.width = bbox.width
            d.height = bbox.height
            let length = Math.sqrt((bbox.width / 2)**2 + (bbox.height / 2)**2)
            let theta = Math.atan(bbox.height / bbox.width) + d.rotate!
            let rotateCircles = d3.select(this.parentElement)
             .append('circle')
             .datum(d)
             .attr('cx', bbox.width / 2 + 2)
             .attr('cy', -0.65*bbox.height)
             .attr('r', 5)
             .classed('rotationHandler', true)
             .classed('active', false)
             .call(rotationDrag)
            let rects = d3.select(this.parentElement)
              .append('rect')
              .datum(d)
              .attr('width', bbox.width)
              .attr('height', bbox.height)
              .attr('transform',  (d: Word) => `translate(${-d.width!/2},${-0.8*bbox.height!})`)
              .attr('rx', bbox.height / 15)
              .classed('text-canvas', true)
              .call(translationDrag)
              .on('mouseover', function(this: SVGRectElement, datum: any) {
                  d3.select(this).classed('active', true)
              })
              .on('mouseout', function(this: SVGRectElement, datum: any) {
                if (!d3.select(this).classed('activate')) {
                    d3.select(this).classed('active', false)
                    d3.select(this.parentElement).select('.rotationHandler').classed('active', false)
                }
            })
              .on('click', function(this: SVGRectElement, e: Event) {
                  let ele = d3.select(this) as d3.Selection<SVGRectElement, Word, d3.BaseType, any>
                  let activateFlag = !ele.classed('activate')
                  if (activateFlag) {
                      d3.selectAll('.activate').classed('activate', false)
                      d3.selectAll('.active').classed('active', false)     
                  }
                  d3.select(this.parentElement).select('.rotationHandler').classed('active', activateFlag)
                  ele.classed('activate', activateFlag)
                  plotHandler.showAnnotationWidget(ele.datum(), activateFlag)
              })
        })
    }
    public plotOnSvg(data: Word[]) {
        this.svg.selectAll('g').remove()
        let basic = this.svg.append('g')
        .attr('class', `wordcloud ${this.styleSheet.font.name}`)
        .style('font-family', this.styleSheet.font.name)
        .style('font-style', this.styleSheet.fontStyle!)
        .attr('transform', 'translate(' + this.width / 2 + ',' + this.height / 2 + ')')
        let gs= basic.selectAll('g')
        .data(data)
        .enter()
        .append('g')
        .attr('transform', getGTransform) 
        let texts = gs.append('text')
        .datum(d => d) as d3.Selection<SVGTextElement, Word, SVGGElement, Word>
        texts.attr('class', 'word')
        .style('text-anchor', 'middle')
        .style('fill', (d: Word) => d.color || this.styleSheet.colorScheme!)
        .style('font-variation-settings', this.styleSheet.font.getCss())
        .style('font-size', (d: Word) => d.size! + 'px' )
        .text((d: Word, idx: number)=> {
            return d.text || ''
        })

    }
    public updateOnSvg(data: Word[]) {
        let container = this.svg.select('.wordcloud')
            .selectAll('g') as d3.Selection<SVGGElement, Word, SVGElement, unknown>
        container.data(data)
            .attr('transform', getGTransform)
            .select('text')
            .style('fill', (d: Word) => d.color || this.styleSheet.colorScheme!)
            .style('font-variation-settings', (d: Word) => d.fontString!)
            .style('font-size', (d: Word) => d.size! + 'px' )
    }
    public showAnnotationWidget(d: Word, flag: boolean) {
        let offset = 30
        d3.select('#text-style-config')
          .classed('active', flag)
          .style('left', `${this.width / 2 + d.x!}px`)
          .style('top', `${this.height / 2 + d.y! + offset}px`)
    }

    public fadeAnnotationWidget(d: Word) {
        d3.select('#text-style-config').classed('active', false)
    }
}

let getGTransform = function (d: Word) {
    return `translate(${d.x!}, ${d.y!}) rotate(${d.rotate})`
}

let getTranslationDragHandle = function (width: number, height: number) {
    let drag = d3Drag.drag<SVGRectElement, Word>()
    drag.on('drag', function (this: SVGRectElement, event: any, d: Word) {
        const e = event as d3Drag.D3DragEvent<SVGRectElement, Word, any | d3Drag.SubjectPosition>
        d.x = e.x
        d.y! = e.y
        if(!this.parentElement) return
        this.parentElement!.setAttribute('transform', getGTransform(d))
    }) 
    return drag
}

let getRotationDragHandle = function(width: number, height: number) {
    let drag = d3Drag.drag<SVGCircleElement, Word>()
    drag.on('drag', function(this: SVGCircleElement, event: any, d: Word) {
        const e = event as d3Drag.D3DragEvent<SVGCircleElement, Word, any | d3Drag.SubjectPosition>
        let theta = Math.atan2(e.y - d.height! / 2, e.x) * 180 / Math.PI
        d.rotate! = theta
        this.parentElement?.setAttribute('transform', getGTransform(d))
    })
    return drag
}



export {
    PlotHandler
}