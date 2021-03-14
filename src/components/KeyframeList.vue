/* eslint-disable */
<template>
  <div class="keyframe-configs">
    <svg :class="`stage-overview stage_overview_${groupIndex}`">
    </svg>
      <div v-for="kf in keyframes" v-bind:key="kf" class="keyframe-config">
      <span>×</span>
      <span> {{ kf.scale }} </span>
      <span>→</span>
      <span>{{ kf.xoff }}</span>
      <span>↓</span>
      <span>{{ kf.yoff }}</span>
      <span>↻</span>
      <span>{{ `${kf.rotate}°` }}</span>
      <span>&nbsp;<button class="color-btn" :style="{ 'background-color': kf.color }"></button> </span>
    </div>
  </div>
</template>
<script lang="ts">
/* eslint-disable */
import { Prop, Watch } from "vue-property-decorator";
import { Vue } from "vue-class-component";
import * as d3 from "d3";
import * as d3Scale from "d3-scale";
import * as ColorPreset from "@/assets/color-preset";
import { createColorPicker } from "@/assets/color-picker";
import { FontConfig } from "@/assets/variable-font";
import { KeyframeConfig } from "@/assets/types";
const xPadding = 0.08;
const yPadding = 0.1;
export default class KeyframeList extends Vue {
  @Prop({}) public keyframes: Array<KeyframeConfig> = [] as Array<KeyframeConfig>
  @Prop({}) public groupIndex: number = 0
  created() {
  }
  mounted() {
    let svgEle = d3.select('.stage-overview').node() as SVGElement
    let svgWidth = svgEle.getBoundingClientRect().width
    let svgHeight = svgEle.getBoundingClientRect().height
    let scale = d3Scale.scaleLinear().range([0, svgWidth * (1-2*xPadding)]).domain([0,100])
    let invertScale = scale.invert
    let gap = svgWidth * (1 - 2 * xPadding) / this.keyframes.length * 0.9
    for (let i = 1; i < this.keyframes.length; i ++) {
      gap = Math.min((this.keyframes[i].stage - this.keyframes[i-1].stage) * 0.9, gap) 
    }
    let svg = d3.select(`.stage_overview_${this.groupIndex}`)
    let containers = svg.append('g')
      .attr('transform', `translate(${svgWidth * xPadding}, 0)`)
      .selectAll('circle')
      .data(this.keyframes)
      .enter()
      .append('g')
      .attr('transform', d => `translate(${scale(d.stage)}, 0)`)
      .classed('stage-hint', true )
    containers.append('rect')
      .classed('overlay-rect', true)
      .attr('x', - gap / 2)
      .attr('y', 0)
      .attr('width', gap)
      .attr('height', svgHeight)
      .on('mouseover', function(this: any, e: any, d: any) {
        d3.select(this.parentNode!).select('text').classed('active', true)

      })
      .on('mouseout', function(this: any, e: any, d: any) {
        d3.select(this.parentNode).select('text').classed('active', false)
      })
    containers.append('circle')
      .classed('stage-point', true)
      .attr('cx', 0)
      .attr('cy', svgHeight / 2)
      .attr('r', 3)
    containers.append('text')
      .classed('annotation', true)
      .attr('y', svgHeight / 4)
      .text(d => `${Number(d.stage/100).toPrecision(4).substring(1, 4)}`)

  }
}
</script>
<style lang="scss">
.color-btn {
  width: .8rem;
  height: .8rem;
  border-radius: 1.6rem;
  text-size: x-small;
}
.keyframe-configs {
  width:100%;
  font-size: x-small;
  svg {
    width: 100%;
    height: 10vh;
  }
  .keyframe-config {
    span {
      margin-left: 0.2rem;
    }
  }
}
.overlay-rect {
    fill: white;
    opacity: 0;
}
.stage-point {
  fill: steelblue;
}
.annotation {
  fill: black;
  text-anchor: middle;
  font-size: 10px;
  visibility: hidden;
  &.active {
    visibility: visible;
  }
}
</style>