/* eslint-disable */
<template>
  <div>
    <svg id="particle-svg" :width="width" :height="height"></svg>
  </div>
</template>
<script lang="ts">
/* eslint-disable */
import { Vue } from "vue-class-component"
import * as d3 from "d3-fetch"
import { simulate } from "@/assets/float"
import { Word } from "@/assets/types"
export default class ParticleView extends Vue {
  public readonly width = 800
  public readonly height = 520
  mounted() {
    let url = './dataset/layout/layout_xmas.json'
    d3.json(url).then((d: any) => {
        console.log(d, '??')
        let data = d as Word[]
        simulate(data, this.width, this.height)
    }, (err: any) => {
      console.log(err)
    })
  }
}
</script>
<style lang="scss">
.particle-g {
  text-anchor: middle;
  font-family: NotoSans;
}
</style>
