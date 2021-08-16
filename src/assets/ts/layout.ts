import cloudGenerator from 'd3-cloud';
import { Word, Style } from "@/assets/types";
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3Select from 'd3-selection';
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
export const defaultStyleSheet: Style = {
    fontStyle: "",
    fontWeight: "500",
    fontFamily: 'Arial',
    height: 800,
    width: 800,
    spiralType: 'rectangular',
    rotation: 0
}
export const generateWordle = function (data: Word[], specStyleSheet: Partial<Style>={}) {
        const copySheet = Object.assign(defaultStyleSheet, {})
        const styleSheet = Object.assign(specStyleSheet, copySheet)
        const width = styleSheet.width
        const height = styleSheet.height
        const freqList = data.map(d => d.frequency);
        const sizeRange = [d3Array.min(freqList),  d3Array.max(freqList)] as [number, number];
        const wordScale = d3Scale.scaleLinear()
            .domain(sizeRange)  // !!!!!!!!!!!!!!!!!!!!!!!
            .range([20, 80]) // !!!!!!!!!!!!!!!!!!!!!!!
        return cloudGenerator()
            .size([width, height])
            .timeInterval(2000)
            .words(data)
            .rotate(function(d) { return 0 })
            .fontSize((d: cloudGenerator.Word, idx: number) => {
                const word = d as Word
                return Math.ceil(wordScale(word.frequency));
            })
            .padding(1)
            .font(styleSheet.fontFamily!)
            .fontStyle(styleSheet.fontStyle!)
            .fontWeight(styleSheet.fontWeight!)
            .text((d: cloudGenerator.Word, idx: number)=> {
                return d.text || ''
            })
            .spiral(styleSheet.spiralType || 'rectangular') // 'archimedean' or 'rectangular'
            // .canvas(function() {
            //     return document.querySelector("#emordle-test-canvas") as HTMLCanvasElement;
            // })
}

export function testOnSvg(data: Word[], divId="emordle-test-svg-container") {
    const svg = d3Select.select('#' + divId).html('');
    const containers = svg.append('g')
      .attr('transform', `translate(${defaultStyleSheet.width/2}, ${defaultStyleSheet.height/2})`)
      .selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .text(d => d.text!)
      .attr("transform", function(d) {
        return "translate(" + [d.x, d.y] + ")";
      })
      .style('text-anchor', 'middle')
      .style('font-family', d => d.fontFamily!)
      .style('font-size', d => d.size! + 'px')
      .style('font-weight', d => d.fontWeight!)
      .style('opacity', 0.2)
      .style('fill', 'red')
  }