import cloudGenerator from 'd3-cloud';
import { Word, Style, TextStyleConfig } from "@/assets/types";
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3Select from 'd3-selection';
import { testSize } from '@/assets/ts/utils';
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
export const defaultStyleSheet: Style = {
    fontStyle: "",
    fontWeight: "500",
    fontFamily: 'GT Flexa',
    height: 600,
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
        const wordScale = d3Scale.scaleSqrt()
            .domain(sizeRange)  // !!!!!!!!!!!!!!!!!!!!!
            .range([30, 90]) // !!!!!!!!!!!!!!!!!!!!!!!
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
            .font(word => word.font || styleSheet.fontFamily!)
            .fontStyle(word => word.style || styleSheet.fontStyle!)
            .fontWeight(word => word.weight || styleSheet.fontWeight!)
            .text((d: cloudGenerator.Word, idx: number)=> {
                return d.text || ''
            })
            .spiral(styleSheet.spiralType || 'rectangular') // 'archimedean' or 'rectangular'
            // .canvas(function() {
            //     return document.querySelector("#emordle-test-canvas") as HTMLCanvasElement;
            // })
}

export const config2Word = function (data: TextStyleConfig[]) {
    const result = [] as Word[];
    data.forEach(d => {
        result.push({
            text: d.text,
            font: d.fontFamily,
            frequency: d.fontSize
        })
    })
    return result;
}

export const word2Config = function (layout: d3.layout.cloud.Word[], WIDTH: number, HEIGHT: number) {
    const configs = [] as TextStyleConfig[];
    layout.forEach(w => {
        const config = {
          left: WIDTH / 2 + w.x!,
          top: HEIGHT / 2 + w.y!,
          fontFamily: w.font as string,
          fontWeight: Number(w.weight!),
          fontSize: w.size!,
          color: "black",
          text: String(w.text),
          x: w.x!,
          y: w.y!,
          size: w.size!,
          offx: 0,
          offy: 0
        };
        const bbox = testSize(config);
        config.offx = bbox.width * 0.55;
        config.offy = w.size! * 1.2;
        config.left -= bbox.width * 0.55;
        config.top -= w.size! * 1.2;
        configs.push(config);
      });
    return configs;
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